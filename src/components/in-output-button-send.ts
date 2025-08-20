import { CSSResult, customElement, HeElement, html, HTMLTemplateResult, property, state } from '@elemental/helium';
import { ContentDoc } from '@inclusio/documents';
import { local, InAppElement, InPage } from '@inclusio/base';
import { PublisherTechnique } from './in-output-group';

export enum SendToDeviceStatus {
	ERROR = 'error',
	PENDING = 'pending',
	SUCCESS = 'success',
}

export enum SendToDeviceError {
	INVALID_CONTENT_ATTACHMENT = 'invalid_content_attachment',
	NO_DEVICE_RESOURCE_FOUND = 'no_device_resource_found',
	SENDING = 'sending'
}

class PublisherDeviceService {
	private _getUrl(publisherTechnique: PublisherTechnique, contentDocName: string): string {
		let baseUrl: string = '';
		let url: string = '';

		if ('vital_audio_tactile' === publisherTechnique) {
			baseUrl = `https://inclusio-staging-oyz3ip6fka-uc.a.run.app/api/conversion-service`;
			url = `${baseUrl}/LbfnwsJTIkMm13w8Ctcv9QEaKjx1/${contentDocName}`;
		}

		return url;
	}

	/**
	 *
	 * @todo: replace hard-coded URL, putting in client-side config or aluminum/uri-template with new URL
	 */
	async sendToDevice(publisherTechnique: PublisherTechnique, blob: Blob, contentType: string, contentDocName: string): Promise<Response> {
		const url = this._getUrl(publisherTechnique, contentDocName);

		if (! url) {
			throw new Error('No valid device URL for selected output');
		}

		return await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': contentType, // eslint-disable-line @typescript-eslint/naming-convention
			},
			body: blob,
		});
	}
}

@customElement('in-output-button-send')
export class InOutputButtonSendElement extends local(HeElement) {
	@property({ attribute: false }) page: InPage;
	@property({ type: Object }) contentDoc: ContentDoc;
	@property() publisherTechnique: PublisherTechnique;

	@state() protected _status: SendToDeviceStatus | null = null;

	protected _publisherDeviceService: PublisherDeviceService;

	constructor() {
		super();
		this._publisherDeviceService = new PublisherDeviceService();
	}

	protected async _onSend(event: Event): Promise<void> {
		event.preventDefault();
		event.stopPropagation();

		const contentType: string = this.contentDoc.attachmentType('content');

		if (! this.contentDoc.hasAttachment('content') || contentType !== 'image/svg+xml') {
			this._status = SendToDeviceStatus.ERROR;
			this._dispatchStatusChanged({ status: this._status, error: SendToDeviceError.INVALID_CONTENT_ATTACHMENT });
			return;
		}

		this._status = SendToDeviceStatus.PENDING;
		this._dispatchStatusChanged({ status: this._status });

		try {
			const app = this.page.app as InAppElement;
			const docPath = this.contentDoc?.path;
			const docUserId = this.contentDoc?.userId;

			let blob = this.contentDoc?.getAttachment('content');

			if (! blob) {
				blob = app.userId === docUserId
					? await app.userDB.getAttachment(this.contentDoc.id, 'content')
					: await this.page.server.publicContent(docUserId, docPath);
			}

			const response = await this._publisherDeviceService.sendToDevice(
				this.publisherTechnique,
				blob,
				contentType,
				this.contentDoc.name,
			);

			if (! response.ok) {
				this._status = SendToDeviceStatus.ERROR;
				this._dispatchStatusChanged({
					status: this._status,
					error: SendToDeviceError.NO_DEVICE_RESOURCE_FOUND,
				});
				return;
			}

			this._status = SendToDeviceStatus.SUCCESS;
			this._dispatchStatusChanged({
				status: this._status,
			});
		}
		catch (error: unknown) {
			this._status = SendToDeviceStatus.ERROR;
			const rawErrorMsg = ('object' === typeof error && error && 'message' in error)
				? (error as { message: string }).message
				: String(error);

			this._dispatchStatusChanged({
				status: this._status,
				error: SendToDeviceError.SENDING,
				message: rawErrorMsg,
			});
		}
	}

	protected _dispatchStatusChanged(detail: { status: SendToDeviceStatus; error?: SendToDeviceError, message?: string }): void {
		this.dispatchEvent(new CustomEvent('send-status-changed', {
			detail,
			bubbles: true,
			composed: true,
		}));
	}

	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
		];
	}

	render(): HTMLTemplateResult {
		return html`
			<he-button kind="secondary"
				aria-label=${this.local('output.buttons.send_to_device_aria_label', { name: this.contentDoc!.name })}
				@click=${this._onSend}
				?disabled=${this._status === SendToDeviceStatus.PENDING}>
				${this._status === SendToDeviceStatus.PENDING
					? this.local(`output.buttons.send_to_device_pending`)
					: this.local(`output.buttons.send_to_device`)
				}
			</he-button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-output-button-send': InOutputButtonSendElement;
	}
}
