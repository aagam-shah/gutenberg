/**
 * WordPress dependencies
 */
import {
	Button,
	Flex,
	FlexItem,
	useNavigator,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, chevronRight, chevronLeft } from '@wordpress/icons';
import { isRTL } from '@wordpress/i18n';

interface SummaryButtonProps {
	path: string;
	icon?: JSX.Element;
	title: string;
	description: string;
}

export function SummaryButton( {
	path,
	icon,
	title,
	description,
}: SummaryButtonProps ) {
	const navigator = useNavigator();

	return (
		<Button
			__next40pxDefaultSize
			onClick={ () => navigator.goTo( path ) }
			className="content-guidelines-summary-button"
		>
			<Flex justify="space-between" align="flex-start" gap={ 4 }>
				<Flex
					justify="flex-start"
					align="flex-start"
					gap={ 4 }
					expanded
				>
					{ icon && (
						<FlexItem className="content-guidelines-summary-button__icon">
							<Icon icon={ icon } size={ 24 } />
						</FlexItem>
					) }
					<FlexItem isBlock>
						<VStack spacing={ 1 } alignment="left">
							<Text
								className="content-guidelines-summary-button__title"
								weight={ 600 }
							>
								{ title }
							</Text>
							<Text
								className="content-guidelines-summary-button__description"
								variant="muted"
							>
								{ description }
							</Text>
						</VStack>
					</FlexItem>
				</Flex>
				<FlexItem className="content-guidelines-summary-button__chevron">
					<Icon
						icon={ isRTL() ? chevronLeft : chevronRight }
						size={ 24 }
					/>
				</FlexItem>
			</Flex>
		</Button>
	);
}
