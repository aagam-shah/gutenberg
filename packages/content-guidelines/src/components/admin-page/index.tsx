/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	Spinner,
	Notice,
	Navigator,
	useNavigator,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { store } from '../../store';
import MainScreen from './main-screen';
import CategoryEditScreen from './category-edit-screen';
import BlocksScreen from './blocks-screen';
import AddBlockScreen from './add-block-screen';
import EditBlockScreen from './edit-block-screen';
import RevisionHistoryScreen from './revision-history-screen';

const CATEGORIES = [
	{
		slug: 'site' as const,
		path: '/site',
		title: __( 'Site Context' ),
		description: __(
			"Describe your site's purpose, goals, and primary audience. This helps creators develop content that resonates with your readers."
		),
	},
	{
		slug: 'copy' as const,
		path: '/copy',
		title: __( 'Copy Guidelines' ),
		description: __(
			'Set your writing standards for tone, voice, style, and formatting. Include brand terminology and content to avoid so all writing stays consistent.'
		),
	},
	{
		slug: 'images' as const,
		path: '/images',
		title: __( 'Image Guidelines' ),
		description: __(
			'Outline your style, subject matter, technical requirements (dimensions, formats), mood and aesthetic preferences, and images to avoid.'
		),
	},
	{
		slug: 'other' as const,
		path: '/other',
		title: __( 'Additional Guidelines' ),
		description: __(
			'Include any additional standards such as SEO preferences, legal requirements, citation styles, or other content considerations.'
		),
	},
];

function EditBlockScreenWrapper() {
	const navigator = useNavigator();
	const rawBlockName = navigator.params?.blockName;
	const blockName = decodeURIComponent(
		Array.isArray( rawBlockName ) ? rawBlockName[ 0 ] : rawBlockName || ''
	);

	if ( ! blockName ) {
		return null;
	}

	return <EditBlockScreen blockName={ blockName } />;
}

export default function AdminPage() {
	const { isLoadingData, error } = useSelect( ( select ) => {
		const storeSelectors = select( store );
		return {
			isLoadingData: storeSelectors.isLoading(),
			error: storeSelectors.getError(),
		};
	}, [] );

	const { fetchGuidelines } = useDispatch( store );

	useEffect( () => {
		fetchGuidelines();
	}, [ fetchGuidelines ] );

	if ( isLoadingData ) {
		return (
			<div className="content-guidelines-admin content-guidelines-admin--loading">
				<Spinner />
				<p>{ __( 'Loading guidelines…' ) }</p>
			</div>
		);
	}

	return (
		<div className="content-guidelines-admin">
			<header className="content-guidelines-admin__header">
				<h1 className="wp-heading-inline">
					{ __( 'Content Guidelines' ) }
				</h1>
				<p className="description">
					{ __(
						"Set content standards that guide your team, inform plugins, and help AI tools generate content that matches your site's voice and requirements."
					) }
				</p>
			</header>

			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }

			<Navigator initialPath="/">
				<Navigator.Screen path="/">
					<MainScreen />
				</Navigator.Screen>

				{ CATEGORIES.map( ( category ) => (
					<Navigator.Screen
						key={ category.slug }
						path={ category.path }
					>
						<CategoryEditScreen
							slug={ category.slug }
							title={ category.title }
							description={ category.description }
						/>
					</Navigator.Screen>
				) ) }

				<Navigator.Screen path="/blocks">
					<BlocksScreen />
				</Navigator.Screen>

				<Navigator.Screen path="/blocks/add">
					<AddBlockScreen />
				</Navigator.Screen>

				<Navigator.Screen path="/blocks/edit/:blockName">
					<EditBlockScreenWrapper />
				</Navigator.Screen>

				<Navigator.Screen path="/revisions">
					<RevisionHistoryScreen />
				</Navigator.Screen>
			</Navigator>
		</div>
	);
}
