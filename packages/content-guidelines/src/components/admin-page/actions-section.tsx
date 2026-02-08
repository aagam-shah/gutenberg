/**
 * WordPress dependencies
 */
import { useState, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	Button,
	Notice,
	FlexItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { store } from '../../store';
import type { GuidelineCategories } from '../../store/constants';
import { NavigationButtonAsItem } from './navigation-button';

export default function ActionsSection() {
	const [ importError, setImportError ] = useState< string | null >( null );
	const fileInputRef = useRef< HTMLInputElement >( null );

	const guidelines = useSelect(
		( select ) => select( store ).getGuidelines(),
		[]
	);

	const { updateCategory, saveGuidelines, setStatus } = useDispatch( store );
	const { createSuccessNotice, createErrorNotice } =
		useDispatch( noticesStore );

	const handleImport = async (
		data: Partial< {
			status: 'draft' | 'published';
			guideline_categories: GuidelineCategories;
		} >
	) => {
		if ( data.guideline_categories ) {
			const categories = data.guideline_categories;
			(
				Object.keys( categories ) as Array< keyof GuidelineCategories >
			 ).forEach( ( key ) => {
				updateCategory( key, categories[ key ] );
			} );
		}

		if ( data.status ) {
			setStatus( data.status );
		}

		// Auto-save after import
		if ( guidelines ) {
			try {
				await saveGuidelines( {
					...guidelines,
					...( data.guideline_categories
						? {
								guideline_categories: {
									...guidelines.guideline_categories,
									...data.guideline_categories,
								},
						  }
						: {} ),
					status: data.status || guidelines.status,
				} );
				createSuccessNotice(
					__( 'Guidelines imported successfully.' ),
					{ type: 'snackbar' }
				);
			} catch ( err ) {
				createErrorNotice(
					( err as Error ).message ||
						__( 'Failed to save imported guidelines.' ),
					{ type: 'snackbar' }
				);
			}
		}
	};

	const handleFileSelect = (
		event: React.ChangeEvent< HTMLInputElement >
	) => {
		const file = event.target.files?.[ 0 ];
		if ( ! file ) {
			return;
		}

		setImportError( null );

		const reader = new window.FileReader();

		reader.onload = ( e ) => {
			try {
				const data = JSON.parse( e.target?.result as string );

				if ( data.__file !== 'wp_guidelines' ) {
					throw new Error(
						__( 'Invalid file: not a guidelines JSON file.' )
					);
				}

				if (
					! data.guideline_categories ||
					typeof data.guideline_categories !== 'object'
				) {
					throw new Error(
						__( 'Invalid file: missing guideline_categories.' )
					);
				}

				handleImport( {
					status: data.status || 'draft',
					guideline_categories: data.guideline_categories,
				} );
			} catch ( err ) {
				setImportError(
					( err as Error ).message ||
						__( 'Failed to parse JSON file.' )
				);
			}
		};

		reader.onerror = () => {
			setImportError( __( 'Failed to read file.' ) );
		};

		reader.readAsText( file );
		event.target.value = '';
	};

	const handleExport = () => {
		if ( ! guidelines ) {
			return;
		}

		const exportData = {
			__file: 'wp_guidelines',
			version: 1,
			exported_at: new Date().toISOString(),
			status: guidelines.status,
			guideline_categories: guidelines.guideline_categories,
		};

		const blob = new window.Blob(
			[ JSON.stringify( exportData, null, 2 ) ],
			{ type: 'application/json' }
		);

		const url = URL.createObjectURL( blob );
		const link = document.createElement( 'a' );
		link.href = url;
		link.download = `guidelines-${
			new Date().toISOString().split( 'T' )[ 0 ]
		}.json`;
		document.body.appendChild( link );
		link.click();
		document.body.removeChild( link );
		URL.revokeObjectURL( url );

		createSuccessNotice( __( 'Guidelines exported successfully.' ), {
			type: 'snackbar',
		} );
	};

	return (
		<VStack spacing={ 4 }>
			<Heading level={ 2 } size={ 13 }>
				{ __( 'Actions' ) }
			</Heading>

			{ importError && (
				<Notice
					status="error"
					isDismissible
					onDismiss={ () => setImportError( null ) }
				>
					{ importError }
				</Notice>
			) }

			<input
				ref={ fileInputRef }
				type="file"
				accept=".json,application/json"
				onChange={ handleFileSelect }
				style={ { display: 'none' } }
			/>

			<ItemGroup isBordered isSeparated>
				<Item onClick={ () => fileInputRef.current?.click() }>
					<HStack justify="space-between">
						<VStack spacing={ 1 }>
							<span>{ __( 'Import' ) }</span>
							<Text
								className="content-guidelines-summary-description"
								variant="muted"
							>
								{ __(
									'Upload a JSON file to import guidelines.'
								) }
							</Text>
						</VStack>
						<FlexItem>
							<Button
								variant="secondary"
								onClick={ ( e: React.MouseEvent ) => {
									e.stopPropagation();
									fileInputRef.current?.click();
								} }
								__next40pxDefaultSize
							>
								{ __( 'Upload' ) }
							</Button>
						</FlexItem>
					</HStack>
				</Item>

				<Item onClick={ handleExport }>
					<HStack justify="space-between">
						<VStack spacing={ 1 }>
							<span>{ __( 'Export' ) }</span>
							<Text
								className="content-guidelines-summary-description"
								variant="muted"
							>
								{ __( 'Download guidelines as a JSON file.' ) }
							</Text>
						</VStack>
						<FlexItem>
							<Button
								variant="secondary"
								onClick={ ( e: React.MouseEvent ) => {
									e.stopPropagation();
									handleExport();
								} }
								disabled={ ! guidelines }
								accessibleWhenDisabled
								__next40pxDefaultSize
							>
								{ __( 'Download' ) }
							</Button>
						</FlexItem>
					</HStack>
				</Item>

				<NavigationButtonAsItem path="/revisions">
					<HStack justify="space-between">
						<VStack spacing={ 1 }>
							<span>{ __( 'Revision History' ) }</span>
							<Text
								className="content-guidelines-summary-description"
								variant="muted"
							>
								{ __( 'View and restore previous versions.' ) }
							</Text>
						</VStack>
					</HStack>
				</NavigationButtonAsItem>
			</ItemGroup>
		</VStack>
	);
}
