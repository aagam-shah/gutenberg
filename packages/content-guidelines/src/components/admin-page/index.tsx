/**
 * WordPress dependencies
 */
import { useEffect, useCallback } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	Navigator,
	Spinner,
	Notice,
	SnackbarList,
	useNavigator,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { store } from '../../store';
import type {
	Guidelines,
	GuidelineCategories,
	BlockGuidelines,
} from '../../store/constants';
import { MainScreen } from '../main-screen';
import { CategoryEditScreen } from '../category-edit-screen';
import { BlocksScreen } from '../blocks-screen';
import { AddBlockGuidelineScreen } from '../add-block-guideline-screen';
import { EditBlockGuidelineScreen } from '../edit-block-guideline-screen';
import { RevisionHistoryScreen } from '../revision-history-screen';
import { getRegularCategories } from '../../constants/categories';
import type { RegularCategorySlug } from '../../constants/categories';

/**
 * Custom context for Content Guidelines notices to avoid conflicts with global notices.
 */
const NOTICE_CONTEXT = 'content-guidelines';

interface BlocksScreenWrapperProps {
	blocks: BlockGuidelines;
	onDelete: ( blockName: string ) => void;
}

function BlocksScreenWrapper( {
	blocks,
	onDelete,
}: BlocksScreenWrapperProps ): JSX.Element {
	const { goTo } = useNavigator();

	return (
		<BlocksScreen
			blocks={ blocks }
			onAddClick={ () => goTo( '/blocks/add' ) }
			onEditClick={ ( blockName ) =>
				goTo( `/blocks/edit/${ encodeURIComponent( blockName ) }` )
			}
			onDelete={ onDelete }
		/>
	);
}

interface AddBlockScreenWrapperProps {
	existingBlocks: string[];
	onAdd: ( blockName: string, guidelines: string ) => void;
	isSaving: boolean;
}

function AddBlockScreenWrapper( {
	existingBlocks,
	onAdd,
	isSaving,
}: AddBlockScreenWrapperProps ): JSX.Element {
	const { goTo } = useNavigator();

	function handleAdd( blockName: string, guidelinesValue: string ): void {
		onAdd( blockName, guidelinesValue );
		goTo( '/blocks' );
	}

	return (
		<AddBlockGuidelineScreen
			existingBlocks={ existingBlocks }
			onAdd={ handleAdd }
			isSaving={ isSaving }
		/>
	);
}

interface EditBlockScreenWrapperProps {
	blocks: BlockGuidelines;
	onUpdate: ( blockName: string, value: string ) => void;
	onDelete: ( blockName: string ) => Promise< void >;
	onSave: ( blockName: string, value: string ) => Promise< void >;
	isSaving: boolean;
}

function EditBlockScreenWrapper( {
	blocks,
	onUpdate,
	onDelete,
	onSave,
	isSaving,
}: EditBlockScreenWrapperProps ): JSX.Element {
	const { params, goTo } = useNavigator();
	const blockName = decodeURIComponent( params.blockName as string );
	const blockGuidelines = blocks[ blockName ]?.guidelines || '';

	async function handleDelete(): Promise< void > {
		await onDelete( blockName );
		goTo( '/blocks' );
	}

	async function handleSave( value: string ): Promise< void > {
		await onSave( blockName, value );
	}

	return (
		<EditBlockGuidelineScreen
			blockName={ blockName }
			value={ blockGuidelines }
			onChange={ ( value ) => onUpdate( blockName, value ) }
			onSave={ handleSave }
			onDelete={ handleDelete }
			isSaving={ isSaving }
		/>
	);
}

export default function AdminPage(): JSX.Element | null {
	const { guidelines, isLoadingData, isSavingData, error, snackbarNotices } =
		useSelect( ( select ) => {
			const storeSelectors = select( store );
			return {
				guidelines: storeSelectors.getGuidelines(),
				isLoadingData: storeSelectors.isLoading(),
				isSavingData: storeSelectors.isSaving(),
				error: storeSelectors.getError(),
				snackbarNotices: select( noticesStore )
					.getNotices( NOTICE_CONTEXT )
					.filter(
						( notice: { type?: string } ) =>
							notice.type === 'snackbar'
					),
			};
		}, [] );

	const {
		fetchGuidelines,
		updateCategory,
		updateCategoryAndSave,
		deleteBlockGuidelineAndSave,
		setStatus,
		saveGuidelines,
	} = useDispatch( store );
	const { createSuccessNotice, createErrorNotice, removeNotice } =
		useDispatch( noticesStore );

	useEffect( () => {
		fetchGuidelines();
	}, [ fetchGuidelines ] );

	/**
	 * Shows a snackbar notification.
	 */
	const showSnackbar = useCallback(
		( message: string, isError = false ) => {
			const options = {
				type: 'snackbar' as const,
				context: NOTICE_CONTEXT,
			};
			if ( isError ) {
				createErrorNotice( message, options );
			} else {
				createSuccessNotice( message, options );
			}
		},
		[ createSuccessNotice, createErrorNotice ]
	);

	/**
	 * Executes an async operation with snackbar feedback.
	 */
	const withNotification = useCallback(
		async < T, >(
			operation: () => Promise< T >,
			successMessage: string,
			errorMessage: string
		): Promise< T | undefined > => {
			try {
				const result = await operation();
				showSnackbar( successMessage );
				return result;
			} catch ( err ) {
				showSnackbar( ( err as Error ).message || errorMessage, true );
				throw err;
			}
		},
		[ showSnackbar ]
	);

	const handleSaveCategory = useCallback(
		async ( category: string, value: { guidelines: string } ) => {
			await withNotification(
				() => updateCategoryAndSave( category, value ),
				__( 'Guidelines saved.' ),
				__( 'Failed to save guidelines.' )
			);
		},
		[ updateCategoryAndSave, withNotification ]
	);

	const handleImportAndSave = useCallback(
		async (
			data: Partial< {
				status: 'draft' | 'published';
				guideline_categories: GuidelineCategories;
			} >
		) => {
			if ( data.guideline_categories ) {
				const categories = data.guideline_categories;
				for ( const key of Object.keys( categories ) as Array<
					keyof GuidelineCategories
				> ) {
					updateCategory( key, categories[ key ] );
				}
			}

			if ( data.status ) {
				setStatus( data.status );
			}

			const updatedGuidelines = {
				...guidelines,
				status: data.status || guidelines?.status || 'draft',
				guideline_categories: {
					...guidelines?.guideline_categories,
					...data.guideline_categories,
				},
			} as Guidelines;

			await withNotification(
				() => saveGuidelines( updatedGuidelines ),
				__( 'Guidelines imported and saved.' ),
				__( 'Failed to save imported guidelines.' )
			);
		},
		[
			guidelines,
			updateCategory,
			setStatus,
			saveGuidelines,
			withNotification,
		]
	);

	function handleRestore( data: {
		guideline_categories: GuidelineCategories;
	} ): void {
		const categories = data.guideline_categories;
		for ( const key of Object.keys( categories ) as Array<
			keyof GuidelineCategories
		> ) {
			updateCategory( key, categories[ key ] );
		}
		showSnackbar( __( 'Revision restored.' ) );
	}

	const handleDeleteBlock = useCallback(
		async ( blockName: string ) => {
			await withNotification(
				() => deleteBlockGuidelineAndSave( blockName ),
				__( 'Block guideline deleted.' ),
				__( 'Failed to delete block guideline.' )
			);
		},
		[ deleteBlockGuidelineAndSave, withNotification ]
	);

	const handleAddBlock = useCallback(
		async ( blockName: string, value: string ) => {
			const currentBlocks =
				guidelines?.guideline_categories?.blocks || {};
			await withNotification(
				() =>
					updateCategoryAndSave( 'blocks', {
						...currentBlocks,
						[ blockName ]: { guidelines: value },
					} ),
				__( 'Block guideline added.' ),
				__( 'Failed to add block guideline.' )
			);
		},
		[
			guidelines?.guideline_categories?.blocks,
			updateCategoryAndSave,
			withNotification,
		]
	);

	function handleUpdateBlockGuidelines(
		blockName: string,
		value: string
	): void {
		const currentBlocks = guidelines?.guideline_categories?.blocks || {};
		updateCategory( 'blocks', {
			...currentBlocks,
			[ blockName ]: { guidelines: value },
		} );
	}

	const handleSaveBlockGuideline = useCallback(
		async ( blockName: string, value: string ) => {
			const currentBlocks =
				guidelines?.guideline_categories?.blocks || {};
			await withNotification(
				() =>
					updateCategoryAndSave( 'blocks', {
						...currentBlocks,
						[ blockName ]: { guidelines: value },
					} ),
				__( 'Block guideline saved.' ),
				__( 'Failed to save block guideline.' )
			);
		},
		[
			guidelines?.guideline_categories?.blocks,
			updateCategoryAndSave,
			withNotification,
		]
	);

	if ( isLoadingData ) {
		return (
			<div className="content-guidelines-admin content-guidelines-admin--loading">
				<Spinner />
				<p>{ __( 'Loading guidelines…' ) }</p>
			</div>
		);
	}

	return (
		<div className="content-guidelines-admin">
			<header className="content-guidelines-admin__header">
				<div className="content-guidelines-admin__title-section">
					<h1>{ __( 'Content guidelines' ) }</h1>
					<p className="content-guidelines-admin__description">
						{ __(
							"Set content standards that guide your team, inform plugins, and help AI tools generate content that matches your site's voice and requirements."
						) }
					</p>
				</div>
			</header>

			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }

			<div className="content-guidelines-admin__content">
				<Navigator initialPath="/">
					<Navigator.Screen path="/">
						<MainScreen
							guidelines={ guidelines }
							onImportAndSave={ handleImportAndSave }
							noticeContext={ NOTICE_CONTEXT }
						/>
					</Navigator.Screen>

					<Navigator.Screen path="/revisions">
						<RevisionHistoryScreen
							postId={ guidelines?.id }
							onRestore={ handleRestore }
						/>
					</Navigator.Screen>

					{ getRegularCategories().map( ( category ) => (
						<Navigator.Screen
							key={ category.slug }
							path={ `/${ category.slug }` }
						>
							<CategoryEditScreen
								categorySlug={
									category.slug as RegularCategorySlug
								}
								label={ category.label }
								description={ category.editDescription }
								value={
									(
										guidelines?.guideline_categories?.[
											category.slug as RegularCategorySlug
										] as { guidelines?: string }
									 )?.guidelines || ''
								}
								onChange={ ( val ) =>
									updateCategory(
										category.slug as RegularCategorySlug,
										{ guidelines: val }
									)
								}
								onSave={ ( val ) =>
									handleSaveCategory(
										category.slug as RegularCategorySlug,
										{ guidelines: val }
									)
								}
								isSaving={ isSavingData }
							/>
						</Navigator.Screen>
					) ) }

					<Navigator.Screen path="/blocks">
						<BlocksScreenWrapper
							blocks={
								guidelines?.guideline_categories?.blocks || {}
							}
							onDelete={ handleDeleteBlock }
						/>
					</Navigator.Screen>

					<Navigator.Screen path="/blocks/add">
						<AddBlockScreenWrapper
							existingBlocks={ Object.keys(
								guidelines?.guideline_categories?.blocks || {}
							) }
							onAdd={ handleAddBlock }
							isSaving={ isSavingData }
						/>
					</Navigator.Screen>

					<Navigator.Screen path="/blocks/edit/:blockName">
						<EditBlockScreenWrapper
							blocks={
								guidelines?.guideline_categories?.blocks || {}
							}
							onUpdate={ handleUpdateBlockGuidelines }
							onDelete={ handleDeleteBlock }
							onSave={ handleSaveBlockGuideline }
							isSaving={ isSavingData }
						/>
					</Navigator.Screen>
				</Navigator>
			</div>

			<SnackbarList
				notices={ snackbarNotices }
				onRemove={ ( id ) => removeNotice( id, NOTICE_CONTEXT ) }
				className="content-guidelines-admin__snackbars"
			/>
		</div>
	);
}
