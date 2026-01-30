/**
 * WordPress dependencies
 */
import { useEffect, useCallback, useState, useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { dateI18n, getSettings } from '@wordpress/date';
import {
	Button,
	Flex,
	FlexItem,
	useNavigator,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Icon, chevronLeft, chevronRight, backup } from '@wordpress/icons';
import { __, sprintf, isRTL } from '@wordpress/i18n';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import type { Action, View, Field } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import { store } from '../../store';
import type { Revision, GuidelineCategories } from '../../store/constants';
import { DEFAULT_VIEW, DEFAULT_LAYOUTS } from './constants';

interface RevisionHistoryScreenProps {
	postId: number | undefined;
	onRestore?: ( data: { guideline_categories: GuidelineCategories } ) => void;
}

interface RestoreModalProps {
	items: Revision[];
	closeModal?: () => void;
	onRestore: ( revisionId: number ) => Promise< void >;
	dateFormat: string;
}

function RestoreModal( {
	items,
	closeModal,
	onRestore,
	dateFormat,
}: RestoreModalProps ) {
	const [ isRestoring, setIsRestoring ] = useState( false );
	const revision = items[ 0 ];
	const formattedDate = dateI18n( dateFormat, revision.date );

	const handleConfirmRestore = async () => {
		setIsRestoring( true );
		await onRestore( revision.id );
		closeModal?.();
	};

	return (
		<VStack spacing={ 5 }>
			<Text>
				{ sprintf(
					/* translators: %s: date and time of the revision */
					__(
						'You are about to restore the content guidelines from %s.'
					),
					formattedDate
				) }
			</Text>
			<Text>{ __( 'This action cannot be undone.' ) }</Text>
			<HStack justify="right">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ closeModal }
					disabled={ isRestoring }
					accessibleWhenDisabled
				>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ handleConfirmRestore }
					isBusy={ isRestoring }
					disabled={ isRestoring }
					accessibleWhenDisabled
				>
					{ __( 'Restore' ) }
				</Button>
			</HStack>
		</VStack>
	);
}

/**
 * Revision history screen using DataViews.
 *
 * @param props           Component props.
 * @param props.postId    The guidelines post ID.
 * @param props.onRestore Callback when a revision is restored.
 * @return RevisionHistoryScreen component.
 */
export function RevisionHistoryScreen( {
	postId,
	onRestore,
}: RevisionHistoryScreenProps ) {
	const navigator = useNavigator();
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const {
		revisions,
		isLoading,
		restoringId,
		currentPage,
		totalPages,
		totalItems,
	} = useSelect( ( select ) => {
		const selectors = select( store );
		const pagination = selectors.getRevisionPagination();
		return {
			revisions: selectors.getRevisions(),
			isLoading: selectors.isLoadingRevisions(),
			restoringId: selectors.getRestoringRevisionId(),
			currentPage: pagination.currentPage,
			totalPages: pagination.totalPages,
			totalItems: pagination.totalItems,
		};
	}, [] );

	const { fetchRevisions, restoreRevision } = useDispatch( store );

	// Fetch revisions when component mounts or pagination changes
	useEffect( () => {
		if ( postId ) {
			fetchRevisions( postId, view.page || 1, view.perPage || 10 );
		}
	}, [ postId, fetchRevisions, view.page, view.perPage ] );

	const handleRestore = useCallback(
		async ( revisionId: number ) => {
			if ( ! postId || ! onRestore ) {
				return;
			}

			try {
				const response = await restoreRevision( postId, revisionId );
				onRestore( {
					guideline_categories: response.guideline_categories,
				} );
				navigator.goBack();
			} catch {
				// Error is handled by the store
			}
		},
		[ postId, onRestore, restoreRevision, navigator ]
	);

	// Define fields with custom render for date formatting
	const fields: Field< Revision >[] = useMemo( () => {
		const dateFormat = getSettings().formats.datetime;

		return [
			{
				id: 'date',
				label: __( 'DATE' ),
				type: 'datetime' as const,
				enableGlobalSearch: true,
				enableHiding: false,
				enableSorting: true,
				render: ( { item }: { item: Revision } ) => (
					<span>{ dateI18n( dateFormat, item.date ) }</span>
				),
			},
			{
				id: 'author_name',
				label: __( 'USER' ),
				type: 'text' as const,
				enableGlobalSearch: true,
				enableHiding: false,
				enableSorting: true,
				render: ( { item }: { item: Revision } ) => (
					<span>{ item.author_name || __( 'Unknown' ) }</span>
				),
			},
		];
	}, [] );

	// Define restore action with confirmation modal
	const actions: Action< Revision >[] = useMemo( () => {
		const dateFormat = getSettings().formats.datetime;

		return [
			{
				id: 'restore',
				label: __( 'Restore' ),
				icon: backup,
				isPrimary: false,
				isEligible: ( item: Revision ) => {
					// All revisions except the current one (first on first page) can be restored
					const isCurrentRevision =
						currentPage === 1 && revisions[ 0 ]?.id === item.id;
					return ! isCurrentRevision;
				},
				RenderModal: ( {
					items,
					closeModal,
				}: {
					items: Revision[];
					closeModal?: () => void;
				} ) => (
					<RestoreModal
						items={ items }
						closeModal={ closeModal }
						onRestore={ handleRestore }
						dateFormat={ dateFormat }
					/>
				),
				modalHeader: __( 'Restore content guidelines' ),
			},
		];
	}, [ currentPage, revisions, handleRestore ] );

	// Apply client-side filtering for search
	const { data: filteredData, paginationInfo } = useMemo( () => {
		// If there's a search term, filter client-side
		if ( view.search ) {
			const result = filterSortAndPaginate( revisions, view, fields );
			return {
				data: result.data,
				paginationInfo: result.paginationInfo,
			};
		}

		// Otherwise use server-side pagination info
		return {
			data: revisions,
			paginationInfo: {
				totalItems,
				totalPages,
			},
		};
	}, [ revisions, view, fields, totalItems, totalPages ] );

	const handleViewChange = useCallback( ( newView: View ) => {
		setView( newView );
	}, [] );

	const getItemId = useCallback(
		( item: Revision ) => item.id.toString(),
		[]
	);

	if ( ! postId ) {
		return null;
	}

	return (
		<VStack spacing={ 4 } className="content-guidelines-revision-history">
			<div className="content-guidelines-revision-history__header">
				<Button
					variant="link"
					onClick={ () => navigator.goBack() }
					className="content-guidelines-revision-history__back-button"
				>
					<Flex align="center" gap={ 1 }>
						<FlexItem>
							<Icon
								icon={ isRTL() ? chevronRight : chevronLeft }
								size={ 24 }
							/>
						</FlexItem>
						<FlexItem>
							<Text weight={ 500 }>
								{ __( 'Revision history' ) }
							</Text>
						</FlexItem>
					</Flex>
				</Button>
			</div>

			<Text
				className="content-guidelines-revision-history__description"
				variant="muted"
			>
				{ __( 'Use a previous version of your content guidelines.' ) }
			</Text>

			<div className="content-guidelines-revision-history__dataviews">
				<DataViews
					data={ filteredData }
					fields={ fields }
					view={ view }
					onChangeView={ handleViewChange }
					actions={ actions }
					isLoading={ isLoading || restoringId !== null }
					paginationInfo={ paginationInfo }
					defaultLayouts={ DEFAULT_LAYOUTS }
					getItemId={ getItemId }
				/>
			</div>
		</VStack>
	);
}

export default RevisionHistoryScreen;
