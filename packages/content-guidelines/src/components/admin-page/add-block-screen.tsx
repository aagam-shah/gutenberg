/**
 * WordPress dependencies
 */
import { useState, useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
	Button,
	ComboboxControl,
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

const EMPTY_OBJECT = {} as BlockGuidelines;

export default function AddBlockScreen() {
	const { blockTypes, isLoading: isLoadingBlockTypes } = useBlockTypes();
	const [ selectedBlock, setSelectedBlock ] = useState< string | null >(
		null
	);
	const [ draftGuidelines, setDraftGuidelines ] = useState( '' );
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

	const options = useMemo( () => {
		return blockTypes
			.filter( ( block ) => ! blocksData[ block.name ] )
			.map( ( block ) => ( {
				label: block.title,
				value: block.name,
			} ) );
	}, [ blockTypes, blocksData ] );

	const handleAdd = async () => {
		if ( ! selectedBlock || ! draftGuidelines.trim() || ! guidelines ) {
			return;
		}

		const newBlocks = {
			...blocksData,
			[ selectedBlock ]: { guidelines: draftGuidelines },
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
			createSuccessNotice( __( 'Block guideline added.' ), {
				type: 'snackbar',
			} );
			goBack();
		} catch ( err ) {
			createErrorNotice(
				( err as Error ).message ||
					__( 'Failed to save block guideline.' ),
				{ type: 'snackbar' }
			);
		}
	};

	return (
		<>
			<ScreenHeader
				title={ __( 'Add Block Guidelines' ) }
				description={ __(
					'Select a block type and write guidelines for it.'
				) }
			/>
			<Spacer paddingX={ 4 }>
				<VStack spacing={ 4 }>
					<ComboboxControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Block Type' ) }
						value={ selectedBlock }
						options={ options }
						onChange={ ( value ) =>
							setSelectedBlock( value ?? null )
						}
						help={
							isLoadingBlockTypes
								? __( 'Loading block types…' )
								: undefined
						}
					/>

					{ selectedBlock && (
						<TextareaControl
							__nextHasNoMarginBottom
							label={ __( 'Guidelines' ) }
							value={ draftGuidelines }
							onChange={ setDraftGuidelines }
							rows={ 8 }
							maxLength={ 5000 }
							help={ __(
								'Enter guidelines specific to this block type.'
							) }
						/>
					) }

					<Button
						variant="primary"
						onClick={ handleAdd }
						disabled={
							! selectedBlock ||
							! draftGuidelines.trim() ||
							isSaving
						}
						isBusy={ isSaving }
						accessibleWhenDisabled
						__next40pxDefaultSize
					>
						{ isSaving
							? __( 'Adding…' )
							: __( 'Add Block Guideline' ) }
					</Button>
				</VStack>
			</Spacer>
		</>
	);
}
