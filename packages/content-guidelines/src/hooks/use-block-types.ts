/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

interface BlockTypeResponse {
	name: string;
	title: string | { rendered: string } | null;
}

export interface BlockType {
	name: string;
	title: string;
}

function extractBlockTitle( block: BlockTypeResponse ): string {
	if ( typeof block.title === 'string' ) {
		return block.title;
	}
	if ( block.title && typeof block.title === 'object' ) {
		return block.title.rendered;
	}
	return block.name;
}

export default function useBlockTypes(): {
	blockTypes: BlockType[];
	isLoading: boolean;
} {
	const [ blockTypes, setBlockTypes ] = useState< BlockType[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		async function fetchBlockTypes(): Promise< void > {
			try {
				const response = await apiFetch< BlockTypeResponse[] >( {
					path: '/wp/v2/block-types',
				} );
				const processedBlocks = response
					.map( ( block ) => ( {
						name: block.name,
						title: extractBlockTitle( block ),
					} ) )
					.filter( ( block ) => block.name && block.title )
					.sort( ( a, b ) => a.title.localeCompare( b.title ) );
				setBlockTypes( processedBlocks );
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to fetch block types:', err );
			} finally {
				setIsLoading( false );
			}
		}

		fetchBlockTypes();
	}, [] );

	return { blockTypes, isLoading };
}
