/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
	Button,
	TextareaControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { store } from '../../store';
import type { CategoryGuideline } from '../../store/constants';
import ScreenHeader from './screen-header';

interface CategoryEditScreenProps {
	slug: 'site' | 'copy' | 'images' | 'other';
	title: string;
	description: string;
}

export default function CategoryEditScreen( {
	slug,
	title,
	description,
}: CategoryEditScreenProps ) {
	const { guidelines, isSaving } = useSelect( ( select ) => {
		const selectors = select( store );
		return {
			guidelines: selectors.getGuidelines(),
			isSaving: selectors.isSaving(),
		};
	}, [] );

	const categoryData = guidelines?.guideline_categories?.[ slug ] as
		| CategoryGuideline
		| undefined;
	const [ localValue, setLocalValue ] = useState(
		categoryData?.guidelines || ''
	);

	const { updateCategory, saveGuidelines } = useDispatch( store );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	const hasChanges = localValue !== ( categoryData?.guidelines || '' );

	const handleSave = async () => {
		if ( ! guidelines ) {
			return;
		}

		updateCategory( slug, { guidelines: localValue } );

		try {
			await saveGuidelines( {
				...guidelines,
				guideline_categories: {
					...guidelines.guideline_categories,
					[ slug ]: {
						...( guidelines.guideline_categories[
							slug
						] as CategoryGuideline ),
						guidelines: localValue,
					},
				},
				status: 'published',
			} );
			createSuccessNotice( __( 'Guidelines saved.' ), {
				type: 'snackbar',
			} );
		} catch ( err ) {
			createErrorNotice(
				( err as Error ).message || __( 'Failed to save guidelines.' ),
				{ type: 'snackbar' }
			);
		}
	};

	return (
		<>
			<ScreenHeader title={ title } description={ description } />
			<Spacer paddingX={ 4 }>
				<VStack spacing={ 4 }>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ title }
						hideLabelFromVision
						value={ localValue }
						onChange={ setLocalValue }
						rows={ 12 }
						maxLength={ 5000 }
					/>
					<Button
						variant="primary"
						onClick={ handleSave }
						isBusy={ isSaving }
						disabled={ ! hasChanges || isSaving }
						accessibleWhenDisabled
						__next40pxDefaultSize
					>
						{ isSaving ? __( 'Saving…' ) : __( 'Save' ) }
					</Button>
				</VStack>
			</Spacer>
		</>
	);
}
