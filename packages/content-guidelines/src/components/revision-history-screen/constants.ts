/**
 * WordPress dependencies
 */
import type { View } from '@wordpress/dataviews';

/**
 * Default view configuration for revision history.
 */
export const DEFAULT_VIEW: View = {
	type: 'table',
	search: '',
	page: 1,
	perPage: 10,
	sort: {
		field: 'date',
		direction: 'desc',
	},
	fields: [ 'date', 'author_name' ],
	layout: {},
};

/**
 * Default layouts available for revision history.
 */
export const DEFAULT_LAYOUTS = {
	table: {},
};
