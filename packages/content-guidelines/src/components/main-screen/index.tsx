/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { SummaryButton } from './summary-button';
import { ActionsSection } from './actions-section';
import { CATEGORIES } from '../../constants/categories';
import type { Guidelines, GuidelineCategories } from '../../store/constants';

interface MainScreenProps {
	guidelines: Guidelines | null;
	onImportAndSave: (
		data: Partial< {
			status: 'draft' | 'published';
			guideline_categories: GuidelineCategories;
		} >
	) => Promise< void >;
	noticeContext?: string;
}

export function MainScreen( {
	guidelines,
	onImportAndSave,
	noticeContext,
}: MainScreenProps ) {
	return (
		<VStack spacing={ 0 } className="content-guidelines-main-screen">
			<VStack spacing={ 2 }>
				{ CATEGORIES.map( ( category ) => (
					<SummaryButton
						key={ category.slug }
						path={ `/${ category.slug }` }
						icon={ category.icon }
						title={ category.label }
						description={ category.description }
					/>
				) ) }
			</VStack>

			<ActionsSection
				guidelines={ guidelines }
				onImportAndSave={ onImportAndSave }
				noticeContext={ noticeContext }
			/>
		</VStack>
	);
}
