/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	layout,
	formatCapitalize,
	image,
	blockDefault,
	listView,
} from '@wordpress/icons';

/**
 * Category type definition.
 */
export interface Category {
	slug: 'site' | 'copy' | 'images' | 'blocks' | 'other';
	icon: JSX.Element;
	label: string;
	description: string;
	editDescription: string;
}

/**
 * Regular category slugs (excluding blocks which has different data structure).
 */
export type RegularCategorySlug = 'site' | 'copy' | 'images' | 'other';

/**
 * Categories configuration for content guidelines.
 */
export const CATEGORIES: Category[] = [
	{
		slug: 'site',
		icon: layout,
		label: __( 'Site' ),
		description: __(
			"Describe your site's purpose, goals, and primary audience."
		),
		editDescription: __(
			"Describe your site's purpose, goals, and primary audience. This helps creators develop content that resonates with your readers."
		),
	},
	{
		slug: 'copy',
		icon: formatCapitalize,
		label: __( 'Copy' ),
		description: __(
			'Set your writing standards for tone, voice, style, and formatting.'
		),
		editDescription: __(
			'Set your writing standards for tone, voice, style, and formatting. These guidelines help maintain consistency across all written content.'
		),
	},
	{
		slug: 'images',
		icon: image,
		label: __( 'Images' ),
		description: __(
			'Outline your style, dimensions, formats, mood and aesthetic preferences.'
		),
		editDescription: __(
			'Outline your style, dimensions, formats, mood and aesthetic preferences. This ensures visual content aligns with your brand.'
		),
	},
	{
		slug: 'blocks',
		icon: blockDefault,
		label: __( 'Blocks' ),
		description: __(
			'Create tailored guidelines for specific block types.'
		),
		editDescription: __(
			'Create tailored guidelines for specific block types.'
		),
	},
	{
		slug: 'other',
		icon: listView,
		label: __( 'Additional guidelines' ),
		description: __(
			'Include any additional standards such as SEO preferences, legal requirements, citation styles, or other content considerations.'
		),
		editDescription: __(
			'Include any additional standards such as SEO preferences, legal requirements, citation styles, or other content considerations.'
		),
	},
];

/**
 * Get a category by slug.
 *
 * @param slug The category slug to find.
 */
export function getCategoryBySlug( slug: string ): Category | undefined {
	return CATEGORIES.find( ( category ) => category.slug === slug );
}

/**
 * Get regular categories (excluding blocks).
 */
export function getRegularCategories(): Category[] {
	return CATEGORIES.filter( ( category ) => category.slug !== 'blocks' );
}
