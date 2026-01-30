/**
 * WordPress dependencies
 */
import {
	Button,
	Flex,
	FlexItem,
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
import type { RegularCategorySlug } from '../../constants/categories';

interface CategoryEditScreenProps {
	categorySlug: RegularCategorySlug;
	label: string;
	description: string;
	value: string;
	onChange: ( value: string ) => void;
	onSave: ( value: string ) => void;
	isSaving: boolean;
}

export function CategoryEditScreen( {
	categorySlug,
	label,
	description,
	value,
	onChange,
	onSave,
	isSaving,
}: CategoryEditScreenProps ) {
	const navigator = useNavigator();

	// Generate uppercase label for textarea (e.g., "SITE GUIDELINES")
	const textareaLabel = `${ label.toUpperCase() } ${ __( 'GUIDELINES' ) }`;

	return (
		<VStack spacing={ 6 } className="content-guidelines-category-edit">
			<div className="content-guidelines-category-edit__header">
				<Button
					variant="link"
					onClick={ () => navigator.goBack() }
					className="content-guidelines-category-edit__back-button"
				>
					<Flex align="center" gap={ 1 }>
						<FlexItem>
							<Icon
								icon={ isRTL() ? chevronRight : chevronLeft }
								size={ 24 }
							/>
						</FlexItem>
						<FlexItem>
							<Text weight={ 500 }>{ label }</Text>
						</FlexItem>
					</Flex>
				</Button>
			</div>

			<Text
				className="content-guidelines-category-edit__description"
				variant="muted"
			>
				{ description }
			</Text>

			<div className="content-guidelines-category-edit__textarea-wrapper">
				<label
					className="content-guidelines-category-edit__textarea-label"
					htmlFor={ `guidelines-${ categorySlug }` }
				>
					{ textareaLabel }
				</label>
				<TextareaControl
					id={ `guidelines-${ categorySlug }` }
					value={ value }
					onChange={ onChange }
					rows={ 12 }
					__nextHasNoMarginBottom
				/>
			</div>

			<div className="content-guidelines-category-edit__actions">
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ () => onSave( value ) }
					isBusy={ isSaving }
					disabled={ isSaving }
					accessibleWhenDisabled
				>
					{ isSaving ? __( 'Saving…' ) : __( 'Save guidelines' ) }
				</Button>
			</div>
		</VStack>
	);
}
