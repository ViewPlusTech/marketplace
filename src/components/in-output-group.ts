import { css, CSSResult, customElement, HeButtonGroupElement, HeElement, HePanelElement, HTMLTemplateResult,
	html, property, repeat, state } from '@elemental/helium';
import { ContentDoc } from '@inclusio/documents';
import { local, InAppElement, InPage } from '@inclusio/base';
import { AlertStatus } from './in-alert';
import { SendToDeviceStatus, SendToDeviceError } from './in-output-button-send';

type AssistiveTechnique = 'audio_tactile' | 'braille' | 'tactile_view' | 'text_to_speech';
type Publishers = 'aph' | 'inclusio' | 'viewplus' | 'vital';
export type PublisherTechnique = `${Publishers}_${AssistiveTechnique}`;

const publishersToAssistiveTechniques: Record<Publishers, AssistiveTechnique[]> = {
	aph: ['braille'],
	inclusio: ['tactile_view', 'text_to_speech'],
	viewplus: ['audio_tactile', 'braille'],
	vital: ['audio_tactile'],
};

/**
 * Builds radio options from the `contentDoc`'s `publishers` and `assistiveTechniques` properties.
 *
 * The following option is always available and pre-selected by default:
 * - `inclusio_tactile_view`: SVG File – TactileView and similar tools (default)
 */
@customElement('in-output-group')
export class InOutputGroupElement extends local(HePanelElement) {
	@property({ attribute: false }) page: InPage;
	@property({ type: Object }) contentDoc: ContentDoc;
	@property() messageDialogRef?: any;

	@state() protected _alertMessage: string;
	@state() protected _alertStatus: AlertStatus | null = null;
	@state() protected _selectedOutput: PublisherTechnique;

	protected _app: InAppElement;
	protected _assistiveTechniques: AssistiveTechnique[] = [];
	protected _publishers: Publishers[] = [];

	willUpdate(changedProperties: Map<string, unknown>) {
		if (changedProperties.has('contentDoc')) {
			this._setGroup();
		}
	}

	protected _onAddDevice = (event: Event) => {
		if (this.messageDialogRef) {
			event.preventDefault();
			this.messageDialogRef.value!.show('Feature not yet implemented');
		}
	};

	protected _onSelectedOutputChange(event: Event): void {
		const group = event.currentTarget as HeButtonGroupElement;
		this._selectedOutput = (group.value as PublisherTechnique);

		if (this._alertStatus !== null) {
			this._alertStatus = null;
		}
	}

	protected _onSendStatusChanged(event: CustomEvent): void {
		const { status, error, message } = event.detail;
		this._alertStatus = status;

		if (status === SendToDeviceStatus.ERROR && error === SendToDeviceError.INVALID_CONTENT_ATTACHMENT) {
			this._alertMessage = this.local('output.alerts.send_to_device.error.invalid_content_attachment');
		}
		else if (status === SendToDeviceStatus.ERROR && error === SendToDeviceError.NO_DEVICE_RESOURCE_FOUND) {
			this._alertMessage = this.local('output.alerts.send_to_device.error.no_device_resource_found');
		}
		else if (status === SendToDeviceStatus.ERROR && error === SendToDeviceError.SENDING) {
			this._alertMessage = this.local('output.alerts.send_to_device.error.sending', { error: message });
		}
		else if (status === SendToDeviceStatus.SUCCESS) {
			this._alertMessage = this.local('output.alerts.send_to_device.success');
		}
		else {
			this._alertStatus = null;
			this._alertMessage = '';
		}
	}

	protected _renderRadioOption(publisher: Publishers, assistiveTechnique: AssistiveTechnique) {
		return html`
			<he-button-state
				.value="${publisher}_${assistiveTechnique}"
				name="publisher_assistive_technique">
				${this.local(`output.fieldset.options.${publisher}_${assistiveTechnique}`)}
			</he-button-state>
		`;
	}

	protected _setGroup() {
		const isMvpAssistiveTechnique = (value: string) => {
			return ['audio_tactile', 'braille', 'tactile_view', 'text_to_speech'].includes(value);
		};
		const isMvpPublisher = (value: string) => {
			return ['aph', 'inclusio', 'viewplus', 'vital'].includes(value);
		};
		const assistiveTechniques = this.contentDoc?.assistiveTechniques ?? [];
		const publishers = this.contentDoc?.publishers ?? [];
		const filteredAssistiveTechniques = assistiveTechniques.filter(isMvpAssistiveTechnique) as AssistiveTechnique[];
		const filteredPublishers = publishers.filter(isMvpPublisher) as Publishers[];

		this._alertMessage = '';
		this._alertStatus = null;
		this._assistiveTechniques = [...filteredAssistiveTechniques, 'tactile_view'];
		this._publishers = [...filteredPublishers, 'inclusio'];
		this._selectedOutput = 'inclusio_tactile_view';
	}

	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
			css`
				fieldset {
					display: flex;
					flex-direction: column;
					gap: var(--in-spacing-sm);
					border: none;
					padding-inline: 0;
				}

				legend {
					font-weight: var(--in-font-weight-bold);
				}

				he-button-group {
					display: flex;
					flex-direction: column;
					gap: var(--in-spacing-sm);
				}

				he-button-state {
					--on-background: var(--in-color-primary-600);
					--off-background: var(--in-color-white);
				}

				in-alert {
					margin-top: var(--in-spacing-sm);
				}
			`,
		];
	}

	render(): HTMLTemplateResult {
		return html`
			<section>
				<fieldset>
					<legend>${this.local(`output.fieldset.legend`)}</legend>
					<he-button-group .value="${this._selectedOutput}" @change=${this._onSelectedOutputChange}>
						${repeat(
							this._publishers,
							(publisher: Publishers) => publisher,
							(publisher: Publishers) => {
								const techniques = publishersToAssistiveTechniques[publisher]
									.filter((technique: AssistiveTechnique) => this._assistiveTechniques.includes(technique));
								return repeat(techniques, (technique: AssistiveTechnique) => `${publisher}_${technique}`,
									(technique: AssistiveTechnique) => this._renderRadioOption(publisher, technique),
								);
							},
						)}
					</he-button-group>

					${'inclusio_tactile_view' === this._selectedOutput ? html`
						<in-output-button-download
							.app=${this.page.app}
							.contentDoc=${this.contentDoc}>
						</in-output-button-download>
					` : 'vital_audio_tactile' === this._selectedOutput ? html`
						<in-output-button-send
							.page=${this.page}
							.contentDoc=${this.contentDoc}
							.publisherTechnique=${this._selectedOutput}
							@send-status-changed=${this._onSendStatusChanged}>
						</in-output-button-send>
					` : html`
						<he-button kind="secondary" @click=${this._onAddDevice}>
							${this.local('output.buttons.add_device')}
						</he-button>
					`}
				</fieldset>
				${this._alertStatus ? html`
					<in-alert
						status="${this._alertStatus}"
						message="${this._alertMessage}"
						dismissible
						aria-live="polite"
						role="alert">
					</in-alert>
				` : ''}
			</section>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-output-group': InOutputGroupElement;
	}
}
