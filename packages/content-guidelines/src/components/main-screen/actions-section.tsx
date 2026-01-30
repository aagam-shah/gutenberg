/**
 * WordPress dependencies
 */
import { useState, useRef } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import {
	Card,
	CardBody,
	Button,
	Notice,
	useNavigator,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import type { Guidelines } from '../../store/constants';

interface ActionItemProps {
	title: string;
	description: string;
	buttonLabel: string;
	onClick: () => void;
	disabled?: boolean;
}

function ActionItem( {
	title,
	description,
	buttonLabel,
	onClick,
	disabled,
}: ActionItemProps ) {
	return (
		<div className="content-guidelines-action-item">
			<div className="content-guidelines-action-item__text">
				<Text weight="500">{ title }</Text>
				<Text variant="muted" size="13px">
					{ description }
				</Text>
			</div>
			<Button
				variant="secondary"
				onClick={ onClick }
				disabled={ disabled }
				__next40pxDefaultSize
				accessibleWhenDisabled
			>
				{ buttonLabel }
			</Button>
		</div>
	);
}

interface ActionsSectionProps {
	guidelines: Guidelines | null;
	onImportAndSave: ( data: Partial< Guidelines > ) => Promise< void >;
	noticeContext?: string;
}

export function ActionsSection( {
	guidelines,
	onImportAndSave,
	noticeContext,
}: ActionsSectionProps ) {
	const [ importError, setImportError ] = useState< string | null >( null );
	const fileInputRef = useRef< HTMLInputElement >( null );
	const { createSuccessNotice } = useDispatch( noticesStore );
	const { goTo } = useNavigator();

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
			{
				type: 'application/json',
			}
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
			context: noticeContext,
		} );
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

		reader.onload = async ( e ) => {
			try {
				const data = JSON.parse( e.target?.result as string );

				// Validate file type
				if ( data.__file !== 'wp_guidelines' ) {
					throw new Error(
						__( 'Invalid file: not a guidelines JSON file.' )
					);
				}

				// Validate structure
				if (
					! data.guideline_categories ||
					typeof data.guideline_categories !== 'object'
				) {
					throw new Error(
						__( 'Invalid file: missing guideline_categories.' )
					);
				}

				await onImportAndSave( {
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

	return (
		<VStack spacing={ 4 } className="content-guidelines-actions-section">
			<Text weight="600" size="14px">
				{ __( 'Actions' ) }
			</Text>

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

			<Card>
				<CardBody>
					<VStack spacing={ 0 }>
						<ActionItem
							title={ __( 'Import' ) }
							description={ __(
								'Upload a JSON file to import your content guidelines.'
							) }
							buttonLabel={ __( 'Upload' ) }
							onClick={ () => fileInputRef.current?.click() }
						/>
						<div className="content-guidelines-action-divider" />
						<ActionItem
							title={ __( 'Export' ) }
							description={ __(
								'Export your content guidelines to a JSON file.'
							) }
							buttonLabel={ __( 'Download' ) }
							onClick={ handleExport }
							disabled={ ! guidelines }
						/>
						<div className="content-guidelines-action-divider" />
						<ActionItem
							title={ __( 'Revert' ) }
							description={ __(
								'Use a previous version of your content guidelines.'
							) }
							buttonLabel={ __( 'View history' ) }
							onClick={ () => goTo( '/revisions' ) }
						/>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
