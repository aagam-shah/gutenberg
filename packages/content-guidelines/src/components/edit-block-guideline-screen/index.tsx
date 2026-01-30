/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import {
	Button,
	Flex,
	FlexItem,
	Spinner,
	TextareaControl,
	useNavigator,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import {
	Icon,
	chevronLeft,
	chevronRight,
	blockDefault,
} from '@wordpress/icons';
import { __, isRTL } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { fetchBlockType } from '../../utils/block-types';
import type { BlockType } from '../../utils/block-types';

interface EditBlockGuidelineScreenProps {
	blockName: string;
	value: string;
	onChange: ( value: string ) => void;
	onSave: ( value: string ) => void;
	onDelete: () => void;
	isSaving: boolean;
}

export function EditBlockGuidelineScreen( {
	blockName,
	value,
	onChange,
	onSave,
	onDelete,
	isSaving,
}: EditBlockGuidelineScreenProps ) {
	const navigator = useNavigator();
	const [ blockType, setBlockType ] = useState< BlockType | null >( null );
	const [ isLoadingBlock, setIsLoadingBlock ] = useState( true );

	useEffect( () => {
		fetchBlockType( blockName )
			.then( setBlockType )
			.catch( ( err ) => {
				// eslint-disable-next-line no-console
				console.error( 'Failed to fetch block type:', err );
			} )
			.finally( () => setIsLoadingBlock( false ) );
	}, [ blockName ] );

	const blockTitle = blockType?.title || blockName;

	// Generate uppercase label for textarea
	const textareaLabel = `${ blockTitle.toUpperCase() } ${ __(
		'GUIDELINES'
	) }`;

	if ( isLoadingBlock ) {
		return (
			<VStack spacing={ 6 } className="content-guidelines-edit-block">
				<div className="content-guidelines-edit-block__loading">
					<Spinner />
					<span>{ __( 'Loading…' ) }</span>
				</div>
			</VStack>
		);
	}

	return (
		<VStack spacing={ 6 } className="content-guidelines-edit-block">
			<div className="content-guidelines-edit-block__header">
				<Button
					variant="link"
					onClick={ () => navigator.goBack() }
					className="content-guidelines-edit-block__back-button"
				>
					<Flex align="center" gap={ 1 }>
						<FlexItem>
							<Icon
								icon={ isRTL() ? chevronRight : chevronLeft }
								size={ 24 }
							/>
						</FlexItem>
						<FlexItem>
							<Text weight={ 500 }>{ blockTitle }</Text>
						</FlexItem>
					</Flex>
				</Button>
			</div>

			<div className="content-guidelines-edit-block__block-info">
				<Flex align="center" gap={ 2 }>
					<FlexItem className="content-guidelines-edit-block__icon">
						<Icon icon={ blockDefault } size={ 24 } />
					</FlexItem>
					<FlexItem>
						<Text weight={ 600 } size="16px">
							{ blockTitle }
						</Text>
					</FlexItem>
				</Flex>
			</div>

			<div className="content-guidelines-edit-block__textarea-wrapper">
				<label
					className="content-guidelines-edit-block__textarea-label"
					htmlFor={ `guidelines-${ blockName }` }
				>
					{ textareaLabel }
				</label>
				<TextareaControl
					id={ `guidelines-${ blockName }` }
					value={ value }
					onChange={ onChange }
					rows={ 12 }
					__nextHasNoMarginBottom
				/>
			</div>

			<div className="content-guidelines-edit-block__actions">
				<Flex justify="space-between" align="center">
					<FlexItem>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => onSave( value ) }
							isBusy={ isSaving }
							disabled={ isSaving }
							accessibleWhenDisabled
						>
							{ isSaving
								? __( 'Saving…' )
								: __( 'Save guidelines' ) }
						</Button>
					</FlexItem>
					<FlexItem>
						<Button
							__next40pxDefaultSize
							variant="secondary"
							isDestructive
							onClick={ onDelete }
							disabled={ isSaving }
							accessibleWhenDisabled
						>
							{ __( 'Delete' ) }
						</Button>
					</FlexItem>
				</Flex>
			</div>
		</VStack>
	);
}
