<?php
/**
 * Content Guidelines Admin Page.
 *
 * @package gutenberg
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Silence is golden.' );
}

/**
 * Handles the Content Guidelines admin page.
 */
class Gutenberg_Content_Guidelines_Admin_Page {

	/**
	 * Register the admin menu page.
	 */
	public static function register_menu() {
		// Only register if the render function from the pages system is available.
		if ( ! function_exists( 'gutenberg_content_guidelines_wp_admin_render_page' ) ) {
			return;
		}

		add_options_page(
			__( 'Content Guidelines', 'gutenberg' ),
			__( 'Content Guidelines', 'gutenberg' ),
			'manage_options',
			'content-guidelines-wp-admin',
			'gutenberg_content_guidelines_wp_admin_render_page'
		);
	}
}
