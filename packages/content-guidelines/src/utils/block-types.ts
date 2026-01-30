/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Block type response from REST API.
 */
export interface BlockTypeResponse {
	name: string;
	title: string | { rendered: string } | null;
}

/**
 * Normalized block type.
 */
export interface BlockType {
	name: string;
	title: string;
}

/**
 * Extracts the title string from a block type response.
 *
 * @param block Block type response from REST API.
 * @return Extracted title string.
 */
export function extractBlockTitle( block: BlockTypeResponse ): string {
	if ( typeof block.title === 'string' ) {
		return block.title;
	}
	if ( block.title && typeof block.title === 'object' ) {
		return block.title.rendered;
	}
	return block.name;
}

/**
 * Fetches all block types from the REST API.
 *
 * @return Promise resolving to an array of normalized block types.
 */
export async function fetchAllBlockTypes(): Promise< BlockType[] > {
	const response = await apiFetch< BlockTypeResponse[] >( {
		path: '/wp/v2/block-types',
	} );
	return response
		.map( ( block ) => ( {
			name: block.name,
			title: extractBlockTitle( block ),
		} ) )
		.filter( ( block ) => block.name && block.title );
}

/**
 * Fetches a single block type from the REST API.
 *
 * @param blockName The block name to fetch.
 * @return Promise resolving to a normalized block type.
 */
export async function fetchBlockType(
	blockName: string
): Promise< BlockType > {
	const response = await apiFetch< BlockTypeResponse >( {
		path: `/wp/v2/block-types/${ blockName }`,
	} );
	return {
		name: response.name,
		title: extractBlockTitle( response ),
	};
}
