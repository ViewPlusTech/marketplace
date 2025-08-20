import {
	HeElement, html, css,
	property, customElement, CSSResult,
	ref, createRef, state,
} from '@elemental/helium';
import { Locale, Message, LanguageTag } from '@elemental/localization';
import { Utils } from '@elemental/utils';
import { local, InPage } from '@inclusio/base';
import {
	ContentDoc, MetadataProperties,
} from '@inclusio/documents';

import { InDialog, InMessageDialog } from '.';

const svgns = 'http://www.w3.org/2000/svg';

@customElement('in-view-dialog')
/**
 * @public
 */
export class InViewDialog extends local(HeElement) {
	@property({ attribute: false }) page: InPage;

	@state() protected _contentDoc: ContentDoc;
	@state() protected _selectedTags: Set<string> = new Set();

	protected _dialogRef = createRef<InDialog>();
	protected _svgContainerRef = createRef<SVGSVGElement>();
	protected _rasterContainerRef = createRef<HTMLImageElement>();
	protected _messageDialogRef = createRef<InMessageDialog>();

	/**
	 * Get tags from content document metadata
	 * TODO: move this to contentDoc class
	 */
	protected _getDocumentTags(contentDoc: ContentDoc): Set<string> {
		const tags = new Set<string>();
		for (const metaProperty of MetadataProperties) {
			for (const value of (contentDoc[metaProperty] || [])) {
				tags.add(`${Utils.snakeCase(metaProperty)}.${value}`);
			}
		}
		return tags;
	}

	/**
	 * Get default language from the user's browser language
	 */
	protected _defaultLanguage(): Locale {
		for (const language of navigator.languages) {
			const tag = new LanguageTag(language);
			if (tag.language) {
				return tag.language;
			}
		}
		return 'en';
	}

	/**
	 * Set SVG preview content
	 */
	protected _setPreviewSVG(svgContent: string): void {
		const div = document.createElement('div');
		div.innerHTML = svgContent;
		const svgEl = div.firstElementChild as SVGSVGElement;
		this._rasterContainerRef.value!.setAttribute('hidden', '');
		this._svgContainerRef.value!.replaceChildren(...Array.from(svgEl.childNodes));
		this._svgContainerRef.value!.removeAttribute('hidden');
		this._svgContainerRef.value!.setAttribute('viewBox', svgEl.getAttribute('viewBox')!);
		if (! this._contentDoc.name) {
			const svgTitleEl = this.renderRoot.querySelector('#svg-container > title');
			const svgTitle = svgTitleEl?.textContent;
			if (svgTitle) {
				this._contentDoc.name = svgTitle;
			}
		}
	}

	/**
	 * Set raster image preview content
	 */
	protected _setPreviewRaster(content: Blob) {
		this._svgContainerRef.value!.setAttribute('hidden', '');
		this._rasterContainerRef.value!.src = URL.createObjectURL(content);
		this._rasterContainerRef.value!.removeAttribute('hidden');
	}

	/**
	 * Preview document content
	 */
	protected async _setContentPreview(content: (Blob | string | null)): Promise<void> {
		// TODO: add previews for other image types
		if ((! content) || Utils.isString(content)) {
			this._setPreviewSVG(content || '');
			return;
		}
		switch (content.type) {
			case 'image/svg+xml':
				this._setPreviewSVG(await content.text());
				break;
			case 'image/jpeg':
				this._setPreviewRaster(content);
				break;
			default:
				this._setPreviewSVG('');
		}
	}

	/**
	 * Show the dialog
	 */
	async show(ownerId: string, docPath: string) {
		const isUserDocument = ownerId === this.page.app.userId;

		// Fetch document based on ownership
		if (isUserDocument && this.page.app.loggedIn) {
			// Fetch from user's database if it's the user's own document
			try {
				this._contentDoc = await this.page.userDB.get(ContentDoc, docPath, { attachments: true });
				let content = this._contentDoc.getAttachment('content');
				if (! content && this._contentDoc.hasAttachment('content')) {
					content = await this.page.userDB.getAttachment(this._contentDoc.id, 'content');
				}
				this._setContentPreview(content);
			}
			catch (error) {
				console.error('Error loading user content:', error);
				// Fallback to public content if user DB fetch fails
				this._contentDoc = await this.page.server.publicContentDocument(ownerId, docPath);
				this._setContentPreview(this._contentDoc.hasAttachment('content')
					? await this.page.server.publicContent(ownerId, docPath)
					: null);
			}
		}
		else {
			// Use public documents
			this._contentDoc = await this.page.server.publicContentDocument(ownerId, docPath);
			this._setContentPreview(this._contentDoc.hasAttachment('content')
				? await this.page.server.publicContent(ownerId, docPath)
				: null);
		}

		this._selectedTags = this._getDocumentTags(this._contentDoc);

		if (! this.localMessage('content_tags')) {
			const contentMetadata = await this.page.server.contentMetadata();
			for (const [locale, messages] of Object.entries(contentMetadata.languages)) {
				this.insertLocalMessage(locale, 'content_tags', Utils.snakeCase(messages) as unknown as Message);
			}
			this._selectedTags = new Set(this._selectedTags.values());
		}

		// Even if I use setTimeout() to open the dialog after a delay,
		// attempting to clear the main aria-live region beforehand does
		// not stop any current speech. Setting an alert message will cause
		// it to get read, but NVDA will continue reading the card description.
		this._dialogRef.value!.show();
	}

	/**
	 * Stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			css`
				#container {
					display: grid;
					grid-template-columns: 1fr 1fr;
					column-gap: var(--in-spacing-md, 1rem);
					padding: var(--in-spacing-md, 1rem);
					background: var(--in-color-brand-200, #D1D6E6);
					color: var(--in-color-brand-950, #1f2132);
				}

				#image-container {
					display: flex;
					justify-content: center;
					border: 1px solid var(--in-color-brand-200);
					border-radius: var(--in-border-radius-md);
					max-width: 40svw;
					padding: var(--in-spacing-md);
				}

				#raster-container {
					max-height: 40svh;
				}

				#svg-container {
					max-height: 40svh;
				}

				.btn-toolbar {
					display: flex;
					gap: var(--in-spacing-sm);
					justify-content: center;
				}

				.card {
					display: grid;
					gap: var(--in-spacing-md);
					background: var(--in-color-brand-50, #F5F6FA);
					border-radius: var(--in-border-radius-md);
					padding: var(--in-spacing-md);
				}

				h3, p {
					margin: 0;
					outline: none;
				}

				.overflow-ellipsis {
					width: 425px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					display: block;
				}

				.text-info {
					display: flex;
					flex-direction: column;
					gap: var(--in-spacing-xs);
					text-align: left;
				}

				.view-details {
					display: none;
					list-style: none;
				}
			`,
		];
	}

	protected _categoryFilters(category: string) {
		const filters = [...this._selectedTags].filter((tag) => tag.startsWith(`${category}.`));
		const out = filters.map((tag) => {
			const [cat, key] = tag.split('.');
			return ('languages' === cat)
				? `${this.languageName(key)} (${key})`
				: this.local(`content_tags.${cat}.options.${key}.label`);
		});
		return out.length ? out : null;
	}

	render() {
		const editDocumentButton = (this._contentDoc?.userId === this.page.app.userId)
			? html`
				<he-button
					kind="secondary"
					href="/edit/${this._contentDoc.path}/">
					${this.local('view.button.edit')}
				</he-button>` : '';
		const saveToCollectionButton = (this._contentDoc?.rev
			? html`
				<he-button
					kind="secondary"
					@click=${(e: Event) => {
						e.preventDefault();
						this._messageDialogRef.value!.show('Feature not yet implemented');
					}}>
					${this.local('view.button.save_to_collection')}
				</he-button>`
			: '');
		const outputRadioGroup = ((this._contentDoc?.rev || this._contentDoc?.downloadUrl)
			? html`
				<in-output-group
					.page=${this.page}
					.contentDoc=${this._contentDoc}
					.messageDialogRef=${this._messageDialogRef}>
				</in-output-group>
				`
			: '');
		const fields = {
			'subjects': null,
			'image_types': null,
			'assistive_techniques': null,
			'publishers': null,
			'statuses': null,
			['common.languages']: 'languages',
		};
		return html`
			<in-dialog
				${ref(this._dialogRef)}
				tabindex="-1"
				title=${this.local('view.title')}
				.buttons=${[{ tag: 'cancel', text: this.local('common.done') }]}
				aria-labelledby="dialog_content-name"
				aria-describedby="dialog_content-description"
				initialfocus="#dialog_content-name">
				<div id="container">
					<div class="card">
						<div class="text-info">
							<h3 class="overflow-ellipsis" id="dialog_content-name" tabindex="-1">
								${this._contentDoc?.name}
							</h3>
							<p class="overflow-ellipsis" id="dialog_content-description">
								${this._contentDoc?.description}
							</p>
							<ul class="view-details">
								${Object.entries(fields).map(([key, value]) => {
									return html`
										<li>
											<span class="capitalize">
												${this.local(value !== null ? key : `content_tags.${key}.label`)}:
											</span>
											<span>
												${value && value !== 'languages'
													? value
													: this._categoryFilters(key)?.map((filter) => html`
														<span>${filter}</span>
													`) ?? this.local('view.filter.none_selected')
												}
											</span>
										</li>
									`;
								})}
							</ul>
						</div>
						<div id="image-container" aria-hidden="true">
							<svg ${ref(this._svgContainerRef)} id="svg-container" xmlns=${svgns}></svg>
							<img ${ref(this._rasterContainerRef)} id="raster-container">
						</div>
						<div class="btn-toolbar">
							${editDocumentButton}
							${saveToCollectionButton}
						</div>
					</div>

					<div class="card" tabindex="-1">
						${outputRadioGroup}
					</div>
				</div>
				<in-msg-dialog
					${ref(this._messageDialogRef)}
				></in-msg-dialog>
			</in-dialog>
		`;
	}
}

declare global {

	interface HTMLElementTagNameMap {
		'in-view-dialog': InViewDialog;
	}
}
