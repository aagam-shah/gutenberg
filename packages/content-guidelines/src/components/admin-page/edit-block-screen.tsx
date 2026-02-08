/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
	Button,
	TextareaControl,
	useNavigator,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { store } from '../../store';
import type { BlockGuidelines } from '../../store/constants';
import useBlockTypes from '../../hooks/use-block-types';
import ScreenHeader from './screen-header';

interface EditBlockScreenProps {
	blockName: string;
}

const EMPTY_OBJECT = {} as BlockGuidelines;

export default function EditBlockScreen( { blockName }: EditBlockScreenProps ) {
	const { blockTypes } = useBlockTypes();
	const { goBack } = useNavigator();

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
	const blockData = blocksData[ blockName ];
	const blockType = blockTypes.find( ( b ) => b.name === blockName );
	const blockTitle = blockType?.title || blockName;

	const [ localValue, setLocalValue ] = useState(
		blockData?.guidelines || ''
	);

	const hasChanges = localValue !== ( blockData?.guidelines || '' );

	const handleSave = async () => {
		if ( ! guidelines ) {
			return;
		}

		const newBlocks = {
			...blocksData,
			[ blockName ]: { guidelines: localValue },
		};

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
			createSuccessNotice( __( 'Block guideline saved.' ), {
				type: 'snackbar',
			} );
		} catch ( err ) {
			createErrorNotice(
				( err as Error ).message ||
					__( 'Failed to save block guideline.' ),
				{ type: 'snackbar' }
			);
		}
	};

	const handleDelete = async () => {
		if ( ! guidelines ) {
			return;
		}

		const newBlocks = { ...blocksData };
		delete newBlocks[ blockName ];

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
			goBack();
		} catch ( err ) {
			createErrorNotice(
				( err as Error ).message ||
					__( 'Failed to delete block guideline.' ),
				{ type: 'snackbar' }
			);
		}
	};

	return (
		<>
			<ScreenHeader title={ blockTitle } />
			<Spacer paddingX={ 4 }>
				<VStack spacing={ 4 }>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ blockTitle }
						hideLabelFromVision
						value={ localValue }
						onChange={ setLocalValue }
						rows={ 12 }
						maxLength={ 5000 }
					/>
					<HStack justify="space-between">
						<Button
							variant="tertiary"
							isDestructive
							onClick={ handleDelete }
							disabled={ isSaving }
							accessibleWhenDisabled
							__next40pxDefaultSize
						>
							{ __( 'Delete' ) }
						</Button>
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
					</HStack>
				</VStack>
			</Spacer>
		</>
	);
}
