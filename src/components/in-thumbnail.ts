
import {
	HeElement, customElement, state, property, html, css, HTMLTemplateResult, CSSResult, PropertyValues,
} from '@elemental/helium';
import { Utils } from '@elemental/utils';

import { ContentDoc, MetadataProperties } from '@inclusio/documents';
import { local } from '@inclusio/base';

// import PouchDB from 'pouchdb-browser';

@customElement('in-thumbnail')
/**
 * Inclusio content document thumbnail class
 */
export class InThumbnailElement extends local(HeElement) {
	@property({ attribute: false }) contentDoc: ContentDoc;


	@state() protected _imageURL: string = '';
	protected _objectURL: string = '';

	/**
	 * Connect to app's server instance on DOM connect
	 */
	connectedCallback(): void {
		super.connectedCallback();

		this._setImage(this.contentDoc);
	}

	/**
	 * Disonnect from DOM
	 */
	disconnectedCallback(): void {
		super.disconnectedCallback();

		this._setImage(null);
	}

	/**
	 * Update _imageURL when contentDoc changes
	 */
	willUpdate(changedProperties: PropertyValues<this>) {
		if (changedProperties.has('contentDoc')) {
			this._setImage(this.contentDoc);
		}
	}

	/**
	 * Get an attachment from a document
	 */
	protected async _attachment(doc: ContentDoc, name: string): Promise<Blob | null> {
		const data = doc.getAttachment(name);
		if (!! data) {
			return data;
		}
		try {
			return await window.app.userDB.getAttachment(doc.id, name); // XXX this only works for local docs
		}
		catch (error) {
			return null;
		}
	}

	/**
	 * Set _imageURL from contentDoc
	 */
	protected async _setImage(contentDoc: (ContentDoc | null)): Promise<void> {
		if (this._objectURL) {
			URL.revokeObjectURL(this._objectURL);
			this._objectURL = '';
		}

		if (contentDoc) {
			let attachment = await this._attachment(contentDoc, 'thumbnail');
			if (! attachment) {
				attachment = await this._attachment(contentDoc, 'content'); // TODO only use content if image type
			}
			if (attachment) {
				this._objectURL = URL.createObjectURL(attachment);
			}
		}
		this._imageURL = (this._objectURL || contentDoc?.thumbnailUrl || contentDoc?.downloadUrl || ''); // TODO only use download if image type
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
			css`
				article {
					display: flex;
					flex-direction: column;
					gap: var(--in-spacing-sm, .5rem);
					border: 2px solid var(--in-color-brand-50, #f5f6fa);
					border-radius: var(--in-border-radius-md, 0.5rem);
					background-color: var(--in-color-brand-50, #f5f6fa);
					border-radius: var(--in-border-radius-md, 0.5rem);
					max-width: 310px;
					padding: var(--in-spacing-md, 1rem) var(--in-spacing-sm, 0.5rem);
				}

				article:hover {
					border: 2px solid var(--in-color-primary-500, #3a6fff);
					cursor: pointer;
					outline: solid var(--in-focus-ring-width, 0.25rem);
					outline-color: var(--in-color-primary-300, #8CC0FF);
					outline-offset: var(--in-focus-ring-offset, 4px);
				}

				figure {
					margin: 0;
				}

				figcaption {
					display: block;
					width: calc(100% - 4px);
					margin: 0 2px;
					color: var(--in-color-primary-600, #1844ff);
					text-align: center;
				}

				img {
					display: block;
					background-color: var(--in-color-brand-100, #eaecf4);
					border: 1px solid var(--in-color-white, #ffffff);
					border-radius: var(--in-border-radius-md, 0.5rem);
					width: 100%;
					height: auto;
					min-height: 10rem;
					max-height: 210px;
				}

				figcaption {
					color: var(--in-color-primary-600, #1844ff);
					width: calc(100% - 4px);
				}

				figcaption h3 {
					margin-top: 8px;
					margin-bottom: 0;
					text-align: left;
				}

				article .description p {
					display: block;
					color: var(--in-color-brand-950, #1f2132);
					height: 80px;
					margin: 0;
					overflow: hidden;
				}

				/* Flexbox stuff */


				article {
					flex: 1 0 500px;
					box-sizing: border-box;
				}

				article .tags {
					display: flex;
					align-items: center;
					color: var(--in-color-brand-600, #475482);
					border-radius: var(--in-border-radius-md, 0.5rem);
					padding: var(--in-spacing-sm, 0.5rem) var(--in-spacing-md, 1rem);
					background-color: var(--in-color-brand-100, #eaecf4);
					border: 1px solid var(--in-color-brand-200, #d1d6e6);
				}

				article div.tags p {
					line-height: 30px;
					margin: 0;
					max-width: 100%;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			`,
		];
	}


	/**
	 * Localize each tag label and return a single string list
	 */
	getLocalizedTagLabels(): string {
		// TODO: make these into links?

		const labels: string[] = [];
		for (const metaProperty of MetadataProperties) {
			for (const value of (this.contentDoc[metaProperty] || [])) {
				if ('languages' == metaProperty) {
					labels.push(`${this.languageName(value)} (${value})`);
				}
				else {
					labels.push(this.local(`content_tags.${Utils.snakeCase(metaProperty)}.options.${Utils.snakeCase(value)}.label`));
				}
			}
		}
		return this.list(labels, { style: 'short', type: 'unit' });
	}


	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		return html`<article aria-label="${this.contentDoc.name}">
			<figure>
				<img src="${this._imageURL}" alt="">
				<figcaption>
					<h3>${this.contentDoc.name}</h3>
				</figcaption>
			</figure>
			<div class="description">
				<p class="in-text-truncate" style="">${this.contentDoc.description}</p>
			</div>
			<div class="tags">
				<p class="in-text-truncate in-text-ellipsis"><b>tags:</b> ${this.getLocalizedTagLabels()}</p>
			</div>
		</article>`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-thumbnail': InThumbnailElement,
	}
}
