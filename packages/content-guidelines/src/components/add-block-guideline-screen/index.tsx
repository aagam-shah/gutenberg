/**
 * WordPress dependencies
 */
import { useState, useEffect, useId } from '@wordpress/element';
import {
	Button,
	ComboboxControl,
	Flex,
	FlexItem,
	Spinner,
	TextareaControl,
	useNavigator,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { __, isRTL } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { fetchAllBlockTypes } from '../../utils/block-types';
import type { BlockType } from '../../utils/block-types';

interface AddBlockGuidelineScreenProps {
	existingBlocks: string[];
	onAdd: ( blockName: string, guidelines: string ) => void;
	isSaving: boolean;
}

export function AddBlockGuidelineScreen( {
	existingBlocks,
	onAdd,
	isSaving,
}: AddBlockGuidelineScreenProps ) {
	const navigator = useNavigator();
	const guidelinesInputId = useId();
	const [ selectedBlock, setSelectedBlock ] = useState< string | null >(
		null
	);
	const [ guidelines, setGuidelines ] = useState( '' );
	const [ blockTypes, setBlockTypes ] = useState< BlockType[] >( [] );
	const [ isLoadingBlocks, setIsLoadingBlocks ] = useState( true );

	useEffect( () => {
		fetchAllBlockTypes()
			.then( setBlockTypes )
			.catch( ( err ) => {
				// eslint-disable-next-line no-console
				console.error( 'Failed to fetch block types:', err );
			} )
			.finally( () => setIsLoadingBlocks( false ) );
	}, [] );

	// Convert to ComboboxControl options format, filtering out already-used blocks
	const options = blockTypes
		.filter( ( block ) => ! existingBlocks.includes( block.name ) )
		.map( ( block ) => ( {
			value: block.name,
			label: block.title,
		} ) )
		.sort( ( a, b ) => a.label.localeCompare( b.label ) );

	const handleAdd = () => {
		if ( selectedBlock && guidelines.trim() ) {
			onAdd( selectedBlock, guidelines.trim() );
		}
	};

	const isAddDisabled = isSaving || ! selectedBlock || ! guidelines.trim();

	return (
		<VStack spacing={ 6 } className="content-guidelines-add-block">
			<div className="content-guidelines-add-block__header">
				<Button
					variant="link"
					onClick={ () => navigator.goBack() }
					className="content-guidelines-add-block__back-button"
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
								{ __( 'Add block guidelines' ) }
							</Text>
						</FlexItem>
					</Flex>
				</Button>
			</div>

			<Text
				className="content-guidelines-add-block__description"
				variant="muted"
			>
				{ __(
					'Create tailored guidelines for specific block types (headings, images, quotes, etc.). This allows you to set unique standards for how different blocks are treated.'
				) }
			</Text>

			<div className="content-guidelines-add-block__form">
				<div className="content-guidelines-add-block__field">
					{ isLoadingBlocks ? (
						<div className="content-guidelines-add-block__loading">
							<Spinner />
							<span>{ __( 'Loading block types…' ) }</span>
						</div>
					) : (
						<ComboboxControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'BLOCK' ) }
							value={ selectedBlock }
							onChange={ ( value ) =>
								setSelectedBlock( value ?? null )
							}
							options={ options }
						/>
					) }
				</div>

				<div className="content-guidelines-add-block__field">
					<label
						className="content-guidelines-add-block__label"
						htmlFor={ guidelinesInputId }
					>
						{ __( 'GUIDELINES' ) }
					</label>
					<TextareaControl
						id={ guidelinesInputId }
						value={ guidelines }
						onChange={ setGuidelines }
						rows={ 12 }
						__nextHasNoMarginBottom
					/>
				</div>
			</div>

			<div className="content-guidelines-add-block__actions">
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ handleAdd }
					isBusy={ isSaving }
					disabled={ isAddDisabled }
					accessibleWhenDisabled
				>
					{ isSaving ? __( 'Adding…' ) : __( 'Add guidelines' ) }
				</Button>
			</div>
		</VStack>
	);
}
