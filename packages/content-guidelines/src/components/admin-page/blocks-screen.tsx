/**
 * WordPress dependencies
 */
import { useMemo, useState, useCallback } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
	Button,
	Navigator,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { DataViews } from '@wordpress/dataviews';
import type { View } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import { store } from '../../store';
import type { BlockGuidelines } from '../../store/constants';
import useBlockTypes from '../../hooks/use-block-types';
import ScreenHeader from './screen-header';

interface BlockItem {
	id: string;
	blockName: string;
	title: string;
	guidelines: string;
}

const EMPTY_OBJECT = {} as BlockGuidelines;

export default function BlocksScreen() {
	const { blockTypes } = useBlockTypes();

	const { guidelines, isSaving } = useSelect( ( select ) => {
		const selectors = select( store );
		return {
			guidelines: selectors.getGuidelines(),
			isSaving: selectors.isSaving(),
		};
	}, [] );

	const { updateCategory, saveGuidelines } = useDispatch( store );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	const blocksData = guidelines?.guideline_categories?.blocks || EMPTY_OBJECT;

	const items: BlockItem[] = useMemo( () => {
		return Object.entries( blocksData )
			.filter(
				( [ , data ] ) =>
					data.guidelines && data.guidelines.trim() !== ''
			)
			.map( ( [ blockName, data ] ) => {
				const blockType = blockTypes.find(
					( b ) => b.name === blockName
				);
				return {
					id: blockName,
					blockName,
					title: blockType?.title || blockName,
					guidelines: data.guidelines,
				};
			} );
	}, [ blocksData, blockTypes ] );

	const [ view, setView ] = useState< View >( {
		type: 'list',
		search: '',
		fields: [ 'title', 'guidelines' ],
		page: 1,
		perPage: 20,
		titleField: 'title',
		descriptionField: 'guidelines',
		showDescription: true,
	} );

	const fields = useMemo(
		() => [
			{
				id: 'title',
				label: __( 'Block' ),
				enableGlobalSearch: true,
				enableSorting: true,
			},
			{
				id: 'guidelines',
				label: __( 'Guidelines' ),
				enableGlobalSearch: true,
				enableSorting: false,
				render: ( { item }: { item: BlockItem } ) => (
					<span>
						{ item.guidelines.length > 120
							? item.guidelines.slice( 0, 120 ) + '...'
							: item.guidelines }
					</span>
				),
			},
		],
		[]
	);

	const handleDelete = useCallback(
		async ( blockItem: BlockItem ) => {
			if ( ! guidelines ) {
				return;
			}

			const newBlocks = { ...blocksData };
			delete newBlocks[ blockItem.blockName ];

			updateCategory( 'blocks', newBlocks );

			try {
				await saveGuidelines( {
					...guidelines,
					guideline_categories: {
						...guidelines.guideline_categories,
						blocks: newBlocks,
					},
					status: 'published',
				} );
				createSuccessNotice( __( 'Block guideline deleted.' ), {
					type: 'snackbar',
				} );
			} catch ( err ) {
				createErrorNotice(
					( err as Error ).message ||
						__( 'Failed to delete block guideline.' ),
					{ type: 'snackbar' }
				);
			}
		},
		[
			guidelines,
			blocksData,
			updateCategory,
			saveGuidelines,
			createSuccessNotice,
			createErrorNotice,
		]
	);

	const actions = useMemo(
		() => [
			{
				id: 'delete',
				label: __( 'Delete' ),
				callback: ( itemsToDelete: BlockItem[] ) => {
					if ( itemsToDelete[ 0 ] ) {
						handleDelete( itemsToDelete[ 0 ] );
					}
				},
				isPrimary: false,
				isEligible: () => ! isSaving,
			},
		],
		[ handleDelete, isSaving ]
	);

	const paginationInfo = {
		totalItems: items.length,
		totalPages: Math.ceil( items.length / ( view.perPage || 20 ) ),
	};

	return (
		<>
			<ScreenHeader
				title={ __( 'Block-Specific Guidelines' ) }
				description={ __(
					'Create tailored guidelines for specific block types.'
				) }
			/>
			<Spacer paddingX={ 4 }>
				<VStack spacing={ 4 }>
					{ items.length === 0 ? (
						<VStack spacing={ 4 } alignment="center">
							<p>
								{ __(
									'No block-specific guidelines configured yet.'
								) }
							</p>
						</VStack>
					) : (
						<DataViews
							data={ items }
							fields={ fields }
							view={ view }
							onChangeView={ setView }
							actions={ actions }
							paginationInfo={ paginationInfo }
							defaultLayouts={ {
								list: {},
							} }
							getItemId={ ( item: BlockItem ) => item.id }
						/>
					) }
					<Navigator.Button
						path="/blocks/add"
						as={ Button }
						variant="secondary"
						__next40pxDefaultSize
					>
						{ __( '+ Add Block Guidelines' ) }
					</Navigator.Button>
				</VStack>
			</Spacer>
		</>
	);
}
