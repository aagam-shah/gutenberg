/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';

/**
 * Internal dependencies
 */
import AdminPage from './components/admin-page';
import './style.scss';

// Render admin page when DOM is ready (for legacy PHP admin page).
domReady( () => {
	const container = document.getElementById( 'content-guidelines-admin' );
	if ( container ) {
		const root = createRoot( container );
		root.render( <AdminPage /> );
	}
} );

// Export components and store for routes system and external use.
export { store } from './store';
export default AdminPage;
