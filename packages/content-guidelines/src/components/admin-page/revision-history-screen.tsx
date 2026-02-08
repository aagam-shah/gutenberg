/**
 * WordPress dependencies
 */
import { useEffect, useMemo, useState, useCallback } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { dateI18n } from '@wordpress/date';
import { store as noticesStore } from '@wordpress/notices';
import { DataViews } from '@wordpress/dataviews';
import type { View } from '@wordpress/dataviews';

/**
 * Internal dependencies
 */
import { store } from '../../store';
import type { GuidelineCategories, Revision } from '../../store/constants';
import ScreenHeader from './screen-header';

interface RevisionItem {
	id: string;
	revisionId: number;
	date: string;
	authorName: string;
	isCurrent: boolean;
}

export default function RevisionHistoryScreen() {
	const {
		guidelines,
		revisions,
		isLoadingRevisions,
		restoringId,
		currentPage,
		totalPages,
		totalItems,
		perPage,
	} = useSelect( ( select ) => {
		const selectors = select( store );
		const pagination = selectors.getRevisionPagination();
		return {
			guidelines: selectors.getGuidelines(),
			revisions: selectors.getRevisions(),
			isLoadingRevisions: selectors.isLoadingRevisions(),
			restoringId: selectors.getRestoringRevisionId(),
			currentPage: pagination.currentPage,
			totalPages: pagination.totalPages,
			totalItems: pagination.totalItems,
			perPage: pagination.perPage,
		};
	}, [] );

	const { fetchRevisions, restoreRevision, updateCategory } =
		useDispatch( store );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	const postId = guidelines?.id;

	useEffect( () => {
		if ( postId ) {
			fetchRevisions( postId, 1, 10 );
		}
	}, [ postId, fetchRevisions ] );

	const items: RevisionItem[] = useMemo( () => {
		return revisions.map( ( revision: Revision, index: number ) => ( {
			id: String( revision.id ),
			revisionId: revision.id,
			date: revision.date,
			authorName: revision.author_name || __( 'Unknown' ),
			isCurrent: currentPage === 1 && index === 0,
		} ) );
	}, [ revisions, currentPage ] );

	const [ view, setView ] = useState< View >( {
		type: 'table',
		search: '',
		fields: [ 'date', 'authorName' ],
		page: currentPage,
		perPage,
	} );

	const handleChangeView = useCallback(
		( newView: View ) => {
			setView( newView );
			if ( postId && newView.page !== view.page ) {
				fetchRevisions(
					postId,
					newView.page || 1,
					newView.perPage || 10
				);
			}
		},
		[ postId, fetchRevisions, view.page ]
	);

	const handleRestore = useCallback(
		async ( revisionItem: RevisionItem ) => {
			if ( ! postId ) {
				return;
			}

			try {
				const response = await restoreRevision(
					postId,
					revisionItem.revisionId
				);
				const categories = (
					response as {
						guideline_categories: GuidelineCategories;
					}
				 ).guideline_categories;
				if ( categories ) {
					(
						Object.keys( categories ) as Array<
							keyof GuidelineCategories
						>
					 ).forEach( ( key ) => {
						updateCategory( key, categories[ key ] );
					} );
				}
				createSuccessNotice( __( 'Revision restored successfully.' ), {
					type: 'snackbar',
				} );
			} catch {
				createErrorNotice( __( 'Failed to restore revision.' ), {
					type: 'snackbar',
				} );
			}
		},
		[
			postId,
			restoreRevision,
			updateCategory,
			createSuccessNotice,
			createErrorNotice,
		]
	);

	const fields = useMemo(
		() => [
			{
				id: 'date',
				label: __( 'Date' ),
				enableSorting: false,
				render: ( { item }: { item: RevisionItem } ) => (
					<span>
						{ dateI18n( 'F j, Y \\a\\t g:i a', item.date ) }
						{ item.isCurrent && <em> ({ __( 'current' ) })</em> }
					</span>
				),
			},
			{
				id: 'authorName',
				label: __( 'Author' ),
				enableSorting: false,
			},
		],
		[]
	);

	const actions = useMemo(
		() => [
			{
				id: 'restore',
				label: __( 'Restore' ),
				callback: ( itemsToRestore: RevisionItem[] ) => {
					if ( itemsToRestore[ 0 ] ) {
						handleRestore( itemsToRestore[ 0 ] );
					}
				},
				isEligible: ( item: RevisionItem ) =>
					! item.isCurrent && restoringId === null,
			},
		],
		[ handleRestore, restoringId ]
	);

	const paginationInfo = {
		totalItems,
		totalPages,
	};

	if ( ! postId ) {
		return null;
	}

	if ( isLoadingRevisions && revisions.length === 0 ) {
		return (
			<>
				<ScreenHeader title={ __( 'Revision History' ) } />
				<Spacer paddingX={ 4 }>
					<VStack
						spacing={ 4 }
						alignment="center"
						className="content-guidelines-admin--loading"
					>
						<Spinner />
						<p>{ __( 'Loading revisions…' ) }</p>
					</VStack>
				</Spacer>
			</>
		);
	}

	return (
		<>
			<ScreenHeader title={ __( 'Revision History' ) } />
			<Spacer paddingX={ 4 }>
				{ items.length === 0 ? (
					<p>{ __( 'No revisions yet.' ) }</p>
				) : (
					<DataViews
						data={ items }
						fields={ fields }
						view={ view }
						onChangeView={ handleChangeView }
						actions={ actions }
						paginationInfo={ paginationInfo }
						defaultLayouts={ {
							table: {},
						} }
						search={ false }
						isLoading={ isLoadingRevisions }
						getItemId={ ( item: RevisionItem ) => item.id }
					/>
				) }
			</Spacer>
		</>
	);
}
