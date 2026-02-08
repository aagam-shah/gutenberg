/**
 * WordPress dependencies
 */
import {
	__experimentalItemGroup as ItemGroup,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	layout,
	formatCapitalize,
	image,
	blockDefault,
	listView,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { SummaryNavigationButton } from './navigation-button';
import ActionsSection from './actions-section';

const CATEGORIES = [
	{
		slug: 'site',
		path: '/site',
		icon: layout,
		title: __( 'Site Context' ),
		description: __(
			"Describe your site's purpose, goals, and primary audience."
		),
	},
	{
		slug: 'copy',
		path: '/copy',
		icon: formatCapitalize,
		title: __( 'Copy Guidelines' ),
		description: __(
			'Set your writing standards for tone, voice, and style.'
		),
	},
	{
		slug: 'images',
		path: '/images',
		icon: image,
		title: __( 'Image Guidelines' ),
		description: __(
			'Outline style, technical requirements, and aesthetic preferences.'
		),
	},
	{
		slug: 'blocks',
		path: '/blocks',
		icon: blockDefault,
		title: __( 'Block-Specific Guidelines' ),
		description: __(
			'Create tailored guidelines for specific block types.'
		),
	},
	{
		slug: 'other',
		path: '/other',
		icon: listView,
		title: __( 'Additional Guidelines' ),
		description: __(
			'SEO preferences, legal requirements, and other considerations.'
		),
	},
];

export default function MainScreen() {
	return (
		<VStack spacing={ 6 }>
			<VStack spacing={ 4 }>
				<Heading level={ 2 } size={ 13 }>
					{ __( 'Categories' ) }
				</Heading>
				<ItemGroup isBordered isSeparated>
					{ CATEGORIES.map( ( category ) => (
						<SummaryNavigationButton
							key={ category.slug }
							path={ category.path }
							icon={ category.icon }
							title={ category.title }
							description={ category.description }
						/>
					) ) }
				</ItemGroup>
			</VStack>

			<ActionsSection />
		</VStack>
	);
}
