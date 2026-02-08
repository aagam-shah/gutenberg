/**
 * WordPress dependencies
 */
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	FlexItem,
	Icon,
} from '@wordpress/components';
import { isRTL } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';

/**
 * External dependencies
 */
import { NavigationButtonAsItem } from '@wordpress/global-styles-ui';

export { NavigationButtonAsItem };

interface SummaryNavigationButtonProps {
	path: string;
	icon: any;
	title: string;
	description: string;
}

export function SummaryNavigationButton( {
	path,
	icon,
	title,
	description,
}: SummaryNavigationButtonProps ) {
	return (
		<NavigationButtonAsItem path={ path }>
			<HStack justify="space-between" expanded>
				<HStack justify="flex-start" expanded={ false }>
					<Icon icon={ icon } size={ 24 } />
					<VStack spacing={ 1 }>
						<span>{ title }</span>
						<Text
							className="content-guidelines-summary-description"
							variant="muted"
						>
							{ description }
						</Text>
					</VStack>
				</HStack>
				<FlexItem display="flex">
					<Icon icon={ isRTL() ? chevronLeft : chevronRight } />
				</FlexItem>
			</HStack>
		</NavigationButtonAsItem>
	);
}
