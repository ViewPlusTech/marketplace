import { CSSResult, customElement, HeElement,
	html, HTMLTemplateResult, property } from '@elemental/helium';
import { ContentDoc } from '@inclusio/documents';
import { local, InAppElement } from '@inclusio/base';

@customElement('in-output-button-download')
export class InOutputButtonDownloadElement extends local(HeElement) {
	@property({ type: Object }) app: InAppElement;
	@property({ type: Object }) contentDoc: ContentDoc;

	/**
	 * _onDownload
	 *
	 * @param {Event} event
	 * @returns {Promise<void>}
	 */
	protected async _onDownload(event: Event): Promise<void> {
		event.preventDefault();
		event.stopPropagation();

		if (this.contentDoc?.downloadUrl) {
			const downloadUrl = `${this.contentDoc.downloadUrl}`;
			this.app.download(downloadUrl, this.contentDoc.name);
			return;
		}

		if (! this.contentDoc.hasAttachment('content')) {
			return;
		}

		if (this.app.userId === this.contentDoc.userId) { // local doc
			let blob = this.contentDoc.getAttachment('content');
			if (! blob) {
				blob = await this.app.userDB.getAttachment(this.contentDoc.id, 'content');
			}
			const blobURL = URL.createObjectURL(blob);
			this.app.download(blobURL, this.contentDoc.name);
			URL.revokeObjectURL(blobURL);
		}
		else {
			this.app.download(this.contentDoc.downloadUrl!, this.contentDoc.name);
		}
	}

	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
		];
	}

	render(): HTMLTemplateResult {
		return html`
			<he-button kind="secondary"
				aria-label=${this.local('output.buttons.download_aria_label', { name: this.contentDoc!.name })}
				@click=${this._onDownload}>
				${this.local('output.buttons.download')}
			</he-button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-output-button-download': InOutputButtonDownloadElement;
	}
}
