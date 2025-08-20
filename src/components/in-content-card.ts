
import {
	HeElement, customElement, state, html, css, HTMLTemplateResult, CSSResult, PropertyValues,
	createRef, ref,
	property,
} from '@elemental/helium';
import { Utils } from '@elemental/utils';

import { ContentDoc, MetadataProperties } from '@inclusio/documents';
import { local } from '@inclusio/base';

import { type InContentListElement } from '.';

@customElement('in-content-card')
/**
 * Inclusio content document thumbnail class
 */
export class InContentCardElement extends local(HeElement) {
	@property({ attribute: false }) contentDoc: ContentDoc;
	@property({ attribute: false }) canFocus = false;
	contentList: InContentListElement;
	row: number;
	column: number;

	@state() protected _imageURL: string = '';
	protected _objectURL: string = '';
	protected _articleRef = createRef<HTMLElement>();
	protected _detailsRef = createRef<HTMLDetailsElement>();
	protected _prevFocusWasCard = false;
	protected _gotMouseDown = false;

	/** Card index number. */
	get index() {
		return (this.row * this.contentList.numCols) + this.column;
	}

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
		if ((! window.app.loggedIn) || (window.app.userId != doc.userId)) {
			return null;
		}
		try {
			return await window.app.userDB.getAttachment(doc.id, name);
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
	 * Localize each tag label
	 */
	protected _getLocalizedTagLabels() {
		return MetadataProperties.flatMap((prop) =>
			(this.contentDoc[prop] || []).map((value) =>
				'languages' === prop
					? `${this.languageName(value)} (${value})`
					: this.local(
						`content_tags.${Utils.snakeCase(prop)}.options.${Utils.snakeCase(value)}.label`)));
	}

	/** Focus this card. */
	setFocused(prevFocusWasCard = false) {
		this._prevFocusWasCard = prevFocusWasCard;
		this._articleRef.value!.focus();
		this._articleRef.value!.scrollIntoView(false);
		this._prevFocusWasCard = false;
	}

	/** Show tags. */
	showTags() {
		this._detailsRef.value!.open = true;
		const tags = this._getLocalizedTagLabels();
		const asList = this.list(tags, { style: 'short', type: 'unit' });
		window.app.alertMsg = `${this.local('search.card_tags', { count: tags.length, tags: asList })}`;
	}

	protected _getAriaDescription() {
		return `
			${this.local('search.card_item_number', { number: this.index + 1 })}
			${this.local('search.card_title', { title: (this.contentDoc.name || this.local('search.untitled')) })}
			${this.contentDoc.description
				? this.local('search.card_description', { description: this.contentDoc.description })
				: ''}
			${this._getLocalizedTagLabels()
				? this.local('search.card_tags_instruction')
				: ''
			}
		`;
	}

	protected _onFocus() {
		if (this._gotMouseDown) {
			this._gotMouseDown = false;
		}
		else {
			let msg = '';
			if (! this._prevFocusWasCard) {
				msg = this.contentList.getAriaDescription();
			}
			msg += this._getAriaDescription();
			window.app.alertMsg = msg;
		}
		this.contentList.focusedCard = this;
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
			css`
				:host {
					display: contents;
				}

				article {
					grid-row-end: span 3;
					display: grid;
					grid-template-rows: subgrid;
					justify-items: center;
					gap: var(--in-spacing-sm, .5rem);
					margin: 0;
					color: black;
					border: 2px solid var(--in-color-brand-50, #f5f6fa);
					border-radius: var(--in-border-radius-md, 0.5rem);
					background-color: var(--in-color-brand-50, #f5f6fa);
					padding: var(--in-spacing-md, 1rem) var(--in-spacing-sm, 0.5rem);
				}

				article:focus-visible {
					outline: var(--in-focus-ring-width, 0.25rem) solid
						var(--in-focus-ring-color, #1844ff);
					outline-offset: var(--in-focus-ring-offset, 4px);
				}

				article:hover {
					border: 2px solid var(--in-color-primary-500, #3a6fff);
					cursor: pointer;
					outline: solid var(--in-focus-ring-width, 0.25rem);
					outline-color: var(--in-color-primary-300, #8CC0FF);
					outline-offset: var(--in-focus-ring-offset, 4px);
				}

				figure {
					align-self: start;
					margin: 0;
					width: 100%;
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

				figcaption h3 {
					margin-top: 8px;
					margin-bottom: 0;
					text-align: left;
				}

				#description {
					align-self: start;
					width: 100%;
					box-sizing: border-box;
				}
				#description p {
					display: block;
					color: var(--in-color-brand-950, #1f2132);
					height: 80px;
					margin: 0;
					overflow: hidden;
				}

				article > div {
					margin: 0 0.5rem 0.5rem 0.5rem;
				}

				details {
					width: 100%;
					max-width: 100%;
					box-sizing: border-box;
					color: var(--in-color-brand-600, #475482);
					border-radius: var(--in-border-radius-md, 0.5rem);
					padding: var(--in-spacing-sm, 0.5rem) var(--in-spacing-md, 1rem);
					background-color: var(--in-color-brand-100, #eaecf4);
					border: 1px solid var(--in-color-brand-200, #d1d6e6);

				}
				details p {
					line-height: 30px;
					margin: 0;
					max-width: 100%;
				}
			`,
		];
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		return html`
			<article
				${ref(this._articleRef)}
				role="gridcell"
				tabindex=${this.canFocus ? '0' : '-1'}
				@focus=${this._onFocus}
				@mousedown=${() => {
					this._gotMouseDown = true;
				}}
			>
				<figure aria-hidden="true">
					<img src="${this._imageURL}" alt="">
					<figcaption>
						<h3>${this.contentDoc.name || this.local('search.untitled')}</h3>
					</figcaption>
				</figure>
				<div aria-hidden="true" id="description">
					<p class="in-text-truncate">${this.contentDoc.description}</p>
				</div>
				<details
					${ref(this._detailsRef)}
					aria-hidden="true"
				>
					<summary
						tabindex="-1"
						@click=${(event: MouseEvent) => {
							event.stopPropagation();
							this.focus();
						}}
					>
						${this.local('search.card_details')}
					</summary>
					<p>
						<b>${this.local('search.card_tags_label')}</b>
						${this.list(this._getLocalizedTagLabels(), { style: 'short', type: 'unit' })}
					</p>
				</details>
			</article>
		`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-content-card': InContentCardElement,
	}
}
