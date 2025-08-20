import { CSSResult, customElement, HeElement,
	html, HTMLTemplateResult, property } from '@elemental/helium';
import { local, InAppElement } from '@inclusio/base';
import { ContentDoc } from '@inclusio/documents';

@customElement('in-output-button-edit')
export class InOutputButtonEditElement extends local(HeElement) {
	@property({ type: Object }) app: InAppElement;
	@property({ type: Object }) contentDoc: ContentDoc;

	protected _isEditable: boolean;

	willUpdate(changedProperties: Map<string, unknown>) {
		if (changedProperties.has('contentDoc')) {
			this._setVisibily();
		}
	}

	protected async _onEdit(event: Event): Promise<void> {
		event.preventDefault();
		event.stopPropagation();

		const docPath = this.contentDoc?.path;
		const userId = this.contentDoc?.userId;

		if (userId) {
			this.app.routeTo(`/jim-editor/${docPath}/${userId}`);
		}
		else {
			this.app.routeTo(`/jim-editor/${docPath}`);
		}
	}

	protected _setVisibily(): void {
		const hasAttachment: boolean = this.contentDoc.hasAttachment('content');
		const isOwner = this.contentDoc.userId === this.app.userId;
		const isSvgXml: boolean = 'image/svg+xml' === this.contentDoc.attachmentType('content');

		if (hasAttachment && isOwner && isSvgXml && this.app.loggedIn) {
			this._isEditable = true;
		}
	}

	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
		];
	}

	render(): HTMLTemplateResult {
		return html`
			${this._isEditable ? html`
				<he-button kind="secondary"
					aria-label=${this.local('output.buttons.edit_graphic_aria_label', { name: this.contentDoc!.name })}
					@click=${this._onEdit}>
					${this.local('output.buttons.edit_graphic')}
				</he-button>
			` : ''}
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-output-button-edit': InOutputButtonEditElement;
	}
}
