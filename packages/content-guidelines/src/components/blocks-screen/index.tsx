/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import {
	Button,
	Flex,
	FlexItem,
	Spinner,
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
import type { BlockGuidelines } from '../../store/constants';
import { fetchAllBlockTypes } from '../../utils/block-types';
import type { BlockType } from '../../utils/block-types';

interface BlocksScreenProps {
	blocks: BlockGuidelines;
	onAddClick: () => void;
	onEditClick: ( blockName: string ) => void;
	onDelete: ( blockName: string ) => void;
}

interface BlockItemProps {
	blockName: string;
	blockType: BlockType | undefined;
	guidelines: string;
	onEdit: () => void;
	onDelete: () => void;
}

function BlockItem( {
	blockName,
	blockType,
	guidelines,
	onEdit,
	onDelete,
}: BlockItemProps ) {
	const blockTitle = blockType?.title || blockName;

	return (
		<div className="content-guidelines-block-item">
			<Flex align="center" gap={ 3 }>
				<FlexItem className="content-guidelines-block-item__icon">
					<Icon icon={ blockDefault } size={ 24 } />
				</FlexItem>
				<FlexItem className="content-guidelines-block-item__content">
					<Text
						className="content-guidelines-block-item__title"
						weight={ 500 }
					>
						{ blockTitle }
					</Text>
					<Text
						className="content-guidelines-block-item__preview"
						variant="muted"
						truncate
					>
						{ guidelines }
					</Text>
				</FlexItem>
				<FlexItem className="content-guidelines-block-item__actions">
					<Button variant="tertiary" onClick={ onEdit } size="small">
						{ __( 'Edit' ) }
					</Button>
					<Button
						variant="tertiary"
						onClick={ onDelete }
						size="small"
						isDestructive
					>
						{ __( 'Delete' ) }
					</Button>
				</FlexItem>
			</Flex>
		</div>
	);
}

export function BlocksScreen( {
	blocks,
	onAddClick,
	onEditClick,
	onDelete,
}: BlocksScreenProps ) {
	const navigator = useNavigator();
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

	const blockTypeMap = blockTypes.reduce(
		( acc, blockType ) => {
			acc[ blockType.name ] = blockType;
			return acc;
		},
		{} as Record< string, BlockType >
	);

	const blockEntries = Object.entries( blocks );
	const hasBlocks = blockEntries.length > 0;

	return (
		<VStack spacing={ 6 } className="content-guidelines-blocks-screen">
			<div className="content-guidelines-blocks-screen__header">
				<Flex align="center" justify="space-between">
					<FlexItem>
						<Button
							variant="link"
							onClick={ () => navigator.goBack() }
							className="content-guidelines-blocks-screen__back-button"
						>
							<Flex align="center" gap={ 1 }>
								<FlexItem>
									<Icon
										icon={
											isRTL() ? chevronRight : chevronLeft
										}
										size={ 24 }
									/>
								</FlexItem>
								<FlexItem>
									<Text weight={ 500 }>
										{ __( 'Blocks' ) }
									</Text>
								</FlexItem>
							</Flex>
						</Button>
					</FlexItem>
					{ hasBlocks && (
						<FlexItem>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ onAddClick }
							>
								{ __( 'Add block guidelines' ) }
							</Button>
						</FlexItem>
					) }
				</Flex>
			</div>

			<Text
				className="content-guidelines-blocks-screen__description"
				variant="muted"
			>
				{ __(
					'Create tailored guidelines for specific block types. These guidelines help ensure consistent use of blocks across your content.'
				) }
			</Text>

			{ isLoadingBlocks && (
				<div className="content-guidelines-blocks-screen__loading">
					<Spinner />
					<span>{ __( 'Loading…' ) }</span>
				</div>
			) }
			{ ! isLoadingBlocks && hasBlocks && (
				<div className="content-guidelines-blocks-screen__list">
					{ blockEntries.map( ( [ blockName, blockData ] ) => (
						<BlockItem
							key={ blockName }
							blockName={ blockName }
							blockType={ blockTypeMap[ blockName ] }
							guidelines={ blockData.guidelines }
							onEdit={ () => onEditClick( blockName ) }
							onDelete={ () => onDelete( blockName ) }
						/>
					) ) }
				</div>
			) }
			{ ! isLoadingBlocks && ! hasBlocks && (
				<div className="content-guidelines-blocks-screen__empty">
					<Text variant="muted">
						{ __(
							'No block guidelines have been created yet. Add guidelines for specific blocks to help maintain consistency.'
						) }
					</Text>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ onAddClick }
					>
						{ __( 'Add block guidelines' ) }
					</Button>
				</div>
			) }
		</VStack>
	);
}
