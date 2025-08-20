import {
	customElement, html, HTMLTemplateResult, css, CSSResult, state, property, createRef, ref,
} from '@elemental/helium';
import type { ChangeOperation } from '@elemental/database';
import { DocObserver } from '@elemental/database';
import { Locale, Message, LanguageTag } from '@elemental/localization';
import { Utils } from '@elemental/utils';

import { InPage } from '@inclusio/base';

import { ContentDoc, MetadataProperties, MetadataProperty, generateDocPath, Visibility } from '@inclusio/documents';

enum PushToAndroidStatus {
	PENDING = 'pending',
	SUCCESS = 'success',
	ERROR = 'error',
}

@customElement('in-edit-page')
/**
 * Inclusio content edit page
 */
export class InEditPage extends InPage {
	@property() ownerId: string;
	@property() docPath: string;

	@state() protected _contentDoc: ContentDoc;
	@state() protected _selectedTags: Set<string> = new Set();

	@state() protected _pageName = 'edit';
	@state() protected _editable = true;

	@state() protected _pushToAndroidStatus: PushToAndroidStatus | null = null;

	protected _docObserver = new DocObserver<ContentDoc>((doc, op) => { this._documentUpdated(doc, op); });
	protected _origContentDoc: (ContentDoc | null) = null;
	protected _savedContentDoc: (ContentDoc | null) = null;
	protected _modified = false;
	protected _formRef = createRef<HTMLFormElement>();


	/**
	 * Initial setup
	 */
	protected _setup(): void {
		super._setup();
	}

	/**
	 * Reset page state
	 */
	protected _reset({ pageName = 'edit', editable = true }: { pageName?: string, editable?: boolean } = {}): void {
		const contentDoc = new ContentDoc();
		contentDoc.name = '';
		contentDoc.description = '';
		contentDoc.languages = [this._defaultLanguage()];
		contentDoc.visibility = 'private';

		this._contentDoc = contentDoc;
		this._origContentDoc = null;
		this._savedContentDoc = null;
		this._selectedTags = new Set();
		this._pageName = pageName;
		this._editable = editable;
		this._modified = false;

		this._formRef.value?.reset();
	}

	/**
	 * Register on DOM connect
	 */
	async connectedCallback(): Promise<void> {
		await super.connectedCallback();

		const contentInput = (this._findChild('select_content') as HTMLInputElement);
		contentInput && (contentInput.value = '');
		const thumbnailInput = (this._findChild('select_thumnbail') as HTMLInputElement);
		thumbnailInput && (thumbnailInput.value = '');

		if (! this.docPath) {
			if (! this.app.loggedIn) {
				this.app.routeTo('/login');
				return;
			}

			this._reset({ pageName: 'create', editable: true });
			this._updatePreview();

			await this.userDB.create(this._contentDoc, generateDocPath());
			this.app.appendRoutePath(this._contentDoc.path);
			this._savedContentDoc = Utils.deepClone(this._contentDoc);
		}
		else {
			if (this.app.loggedIn && ((! this.ownerId) || (this.app.userId == this.ownerId))) {
				this._pageName = 'edit';
				this._editable = true;
				try {
					await this._setContentDoc(await this.userDB.get(ContentDoc, this.docPath, { attachments: true }));
					this._origContentDoc = Utils.deepClone(this._contentDoc);
					this._savedContentDoc = Utils.deepClone(this._contentDoc);
				}
				catch (error) {
					console.error('Error loading content:', error); // TODO proper error handling here
					this._reset();
					this.app.routeBack();
				}
			}
			else {
				this._pageName = 'view';
				this._editable = false;
				try {
					await this._setContentDoc(await this.server.publicContentDocument(this.ownerId, this.docPath));
					this._origContentDoc = null;
					this._savedContentDoc = null;
				}
				catch (error) {
					console.error('Error getting content from server:', error); // TODO proper error handling here
					this._reset();
					this.app.routeBack();
				}
			}
		}

		this.app.activePageName = this._pageName;

		this._selectedTags = this._getDocumentTags(this._contentDoc);

		if (! this.localMessage('content_tags')) {
			const contentMetadata = await this.server.contentMetadata();
			for (const [locale, messages] of Object.entries(contentMetadata.languages)) {
				this.insertLocalMessage(locale, 'content_tags', Utils.snakeCase(messages) as unknown as Message);
			}
			this._selectedTags = new Set(this._selectedTags.values());
		}

		console.log('EDIT PAGE');
	}

	disconnectedCallback(): void {
		if ((! this._origContentDoc) && this._savedContentDoc && (! this._modified)) {
			this.userDB.delete(this._savedContentDoc);
		}
		this._reset();

		super.disconnectedCallback();
		this._docObserver.disconnect();
	}

	protected async _updatePreview(): Promise<void> {
		if (! this._contentDoc.hasAttachment('content')) {
			this._setContentPreview(null);
			return;
		}

		let content = this._contentDoc.getAttachment('content');
		if (! content) {
			if (this._contentDoc.userId == this.userDB.userId) {
				content = await this.userDB.getAttachment(this._contentDoc.id, 'content');
			}
			else {
				try {
					content = await this.server.publicContent(this.ownerId, this.docPath);
				}
				catch {
				}
			}
		}
		this._setContentPreview(content);
	}

	protected async _setContentDoc(contentDoc: ContentDoc): Promise<void> {
		this._contentDoc = contentDoc;
		if (this._contentDoc.userId == this.userDB.userId) {
			this._docObserver.observe(this._contentDoc, this.userDB);
		}
		else {
			this._docObserver.disconnect();
		}
		await this._updatePreview();
	}

	/**
	 * Get tags from content document metadata
	 * TODO: move this to contentDoc class
	 */
	protected _getDocumentTags(contentDoc: ContentDoc): Set<string> {
		const tags: Set<string> = new Set();
		for (const metaProperty of MetadataProperties) {
			for (const value of (contentDoc[metaProperty] || [])) {
				tags.add(`${Utils.snakeCase(metaProperty)}.${value}`);
			}
		}
		return tags;
	}

	/**
	 * Set metadata in content document
	 * TODO: move this to contentDoc class
	 */
	protected _setDocumentTags(contentDoc: ContentDoc, tags: Set<string>): void {
		for (const property of MetadataProperties) {
			delete contentDoc[property];
		}
		const propertyMap = new Map(MetadataProperties.map((property) => [Utils.snakeCase(property), property]));
		for (const tag of tags) {
			const [propertyName, value] = tag.split('.', 2);
			const property = propertyMap.get(propertyName as MetadataProperty);
			if (! property) {
				continue;
			}
			if (! contentDoc[property]) {
				contentDoc[property] = [value];
			}
			else {
				contentDoc[property]!.push(value);
			}
		}
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
		const imageContainer = (this._findChild('image-container') as HTMLElement);
		imageContainer.innerHTML = svgContent;

		if (! this._contentDoc.name) {
			const svgTitleEl = imageContainer.querySelector('svg > title');
			const svgTitle = svgTitleEl?.textContent;
			if (svgTitle) {
				this._contentDoc.name = svgTitle;
			}
		}
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
				try {
					this._setPreviewSVG(await Utils.blobToText(content));
				}
				catch (error) {
					console.error('Unable to read file contents', error);
				}
				break;
			default:
				this._setPreviewSVG('');
		}
	}


	/**
	 * Sets the content file from the file selector input
	 */
	protected async _selectContent(event: Event): Promise<void> {
		event.stopPropagation();

		const fileInput = ((event?.target) as HTMLInputElement);
		const fileList = fileInput.files;
		const file = fileList?.item(0);

		if (! file) {
			return;
		}

		console.log('FILE', file);

		const modifiedDoc = Utils.deepClone(this._contentDoc);

		if (! modifiedDoc.name) {
			modifiedDoc.name = file.name;
		}
		modifiedDoc.addAttachment('content', file);
		modifiedDoc.jimEnhanced = false; // XXX need to detect JIM

		delete modifiedDoc.enrichTasks;

		await this._patchDocument(modifiedDoc);
		await this._updatePreview();
	}

	/**
	 * Sets the thumbnail file from the file selector input
	 */
	protected async _selectThumbnail(event: Event): Promise<void> {
		event.stopPropagation();

		const fileInput = ((event?.target) as HTMLInputElement);
		const fileList = fileInput.files;
		const file = fileList?.item(0);

		if (! file) {
			return;
		}

		const modifiedDoc = Utils.deepClone(this._contentDoc);

		modifiedDoc.addAttachment('thumbnail', file);

		await this._patchDocument(modifiedDoc);
		await this._updatePreview();
	}

	/**
	 * Convert content to SVG
	 */
	protected async _onConvertContent(event: Event): Promise<void> {
		event.stopPropagation();

		if (! this._contentDoc?.hasAttachment('content')) {
			return;
		}

		if (this._contentDoc.jimEnhanced) {
			return;
		}

		if ((! this._contentDoc.enrichTasks?.unarConvert) || ('error' == this._contentDoc.enrichTasks.unarConvert.status)) {
			const modifiedDoc = Utils.deepClone(this._contentDoc);
			modifiedDoc.enrichTasks ??= {};
			modifiedDoc.enrichTasks.unarConvert = {
				status: 'requested',
			};
			this._patchDocument(modifiedDoc);
		}
	}

	/**
	 * Generate content from description
	 */
	protected async _onGenerateContent(event: Event): Promise<void> {
		event.stopPropagation();

		if (this._contentDoc?.hasAttachment('content') || (! this._contentDoc?.description)) {
			return;
		}

		if ((! this._contentDoc.enrichTasks?.unarGenerate) || ('error' == this._contentDoc.enrichTasks.unarGenerate.status)) {
			const modifiedDoc = Utils.deepClone(this._contentDoc);
			modifiedDoc.enrichTasks ??= {};
			modifiedDoc.enrichTasks.unarGenerate = {
				status: 'requested',
			};
			this._patchDocument(modifiedDoc);
		}
	}

	protected async _patchDocument(modifiedDoc: ContentDoc): Promise<void> {
		if ((! this._contentDoc.path) || (! this._savedContentDoc)) {
			return;
		}
		const patch = modifiedDoc.computeMergePatchFrom(this._savedContentDoc, { attachments: true });
		try {
			if (Utils.isEmpty(patch)) {
				return;
			}
			patch.updateTime = Utils.isoDateTime();
			await this.userDB.mergePatch(this._savedContentDoc, patch, { attachments: true });
			this._modified = true;
			this._contentDoc = Utils.deepClone(this._savedContentDoc); // force UI refresh
		}
		catch (error) {
			console.error('Error updating document:', error);
		}
	}

	/**
	 * Update content doc from form controls
	 */
	protected async _onUpdate(event: Event): Promise<void> {
		event.stopPropagation();

		if (! this._contentDoc) {
			return;
		}

		const modifiedDoc = Utils.deepClone(this._contentDoc);
		const target = (event.target as HTMLInputElement);
		if (! target.name) {
			return;
		}
		switch (target.name) {
			case 'name':
				modifiedDoc.name = target.value.trim();
				break;
			case 'description':
				modifiedDoc.description = target.value.trim();
				delete modifiedDoc.enrichTasks?.unarGenerate;
				break;
			case 'visibility':
				modifiedDoc.visibility = (target.value as Visibility);
				break;
			case 'content':
				break;
			case 'thumbnail':
				break;
			default:
				const [tag, state] = (event as CustomEvent<[string, boolean]>).detail;
				if (state) {
					this._selectedTags.add(tag);
				}
				else {
					this._selectedTags.delete(tag);
				}

				this._setDocumentTags(modifiedDoc, this._selectedTags);
				break;
		}
		if ('change' == event.type) {
			this._patchDocument(modifiedDoc);
		}
		else {
			this._contentDoc = modifiedDoc; // force UI refresh
		}
	}


	/**
	 * Content doc observed change from DB
	 */
	protected _documentUpdated(doc: ContentDoc, _operation: ChangeOperation): void {
		if (doc.rev == this._savedContentDoc?.rev) {
			return;
		}
		this._origContentDoc = Utils.deepClone(doc);

		if (this._savedContentDoc) {
			const patch = this._contentDoc.computeMergePatchFrom(this._savedContentDoc, { attachments: true });
			doc.applyMergePatch(patch);
		}
		this._contentDoc = doc;

		this._updatePreview();
	}

	/**
	 * User is done editing
	 */
	protected _onDone(event: Event): void {
		event.preventDefault();
		event.stopPropagation();

		this.app.routeBack();
	}

	/**
	 * Revert to state when editing started
	 */
	protected async _onRevert(event: Event): Promise<void> {
		event.preventDefault();
		event.stopPropagation();

		if (! this._origContentDoc) {
			return;
		}

		const patch = this._origContentDoc.computeMergePatchFrom(this._contentDoc, { attachments: true });

		try {
			this.userDB.mergePatch(this._contentDoc, patch, { attachments: true });
			this._reset();
			this.app.routeBack();
		}
		catch (error) {
			console.error('Error reverting document:', error);
		}
	}

	/**
	 * Delete document
	 */
	protected async _onDelete(event: Event): Promise<void> {
		event.preventDefault();
		event.stopPropagation();

		try {
			await this.userDB.delete(this._contentDoc);
			this._reset();
			this.app.routeBack();
		}
		catch (error) {
			console.error('Error deleting document:', error);
		}
	}

	/**
	 * Download document
	 */
	protected async _onDownload(event: Event): Promise<void> {
		event.preventDefault();
		event.stopPropagation();

		if (this._contentDoc?.downloadUrl) {
			this.app.download(this._contentDoc?.downloadUrl);
			return;
		}

		if (! this._contentDoc.hasAttachment('content')) {
			return;
		}

		let blob = this._contentDoc.getAttachment('content');
		if (! blob) {
			blob = await this.userDB.getAttachment(this._contentDoc.id, 'content');
		}
		const blobURL = URL.createObjectURL(blob);
		this.app.download(blobURL, this._contentDoc.name);
		URL.revokeObjectURL(blobURL);
	}

	/**
	 * Navigate to JIM Editor
	 */
	protected _routeToJimEditor(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		if (this.ownerId) {
			this.app.routeTo(`/jim-editor/${this.docPath}/${this.ownerId}`);
		}
		else {
			this.app.routeTo(`/jim-editor/${this.docPath}`);
		}
	}

	/**
	 * Push to Android using Vital conversion service
	 */
	protected async _onPushToAndroid(event: Event): Promise<void> {
		event.preventDefault();
		event.stopPropagation();

		if (! this._contentDoc.hasAttachment('content') || this._contentDoc.attachmentType('content') !== 'image/svg+xml') {
			console.log('Invalid content attachment');
			return;
		}

		try {
			this._pushToAndroidStatus = PushToAndroidStatus.PENDING;

			let blob = this._contentDoc.getAttachment('content');
			if (! blob) {
				blob = await this.userDB.getAttachment(this._contentDoc.id, 'content');
			}

			// eslint-disable-next-line max-len
			const response = await fetch(`https://inclusio-staging-oyz3ip6fka-uc.a.run.app/api/conversion-service/LbfnwsJTIkMm13w8Ctcv9QEaKjx1/${this._contentDoc.name}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'image/svg+xml', // eslint-disable-line @typescript-eslint/naming-convention
				},
				body: blob,
			});

			if (response.ok) {
				this._pushToAndroidStatus = PushToAndroidStatus.SUCCESS;
			}
			else {
				this._pushToAndroidStatus = PushToAndroidStatus.ERROR;
			}
		}
		catch (error) {
			console.error('Error pushing to android:', error);
			this._pushToAndroidStatus = PushToAndroidStatus.ERROR;
		}
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...InPage.styles,
			css`
				.grid-container {
					display: grid;
					grid-template-columns: auto 1fr;
					column-gap: var(--in-spacing-lg, 2rem);
					align-items: start;
				}

				#image-container {
					background-color: var(--in-color-white, #fff);
					border: 1px solid var(--in-color-brand-100, #eaecf4);
					border-radius: var(--in-border-radius-md, 0.5rem);
					margin-bottom: var(--in-spacing-lg, 2rem);
					max-width: 600px;
					outline: 2px solid var(--accent-color);
				}

				#image-container svg {
					width: 100%;
					height: auto;
					display: block;
				}

				.container * {
					box-sizing: border-box;
				}

				.flex-outer,
				.flex-inner {
					list-style-type: none;
					padding: 0;
				}

				.flex-outer {
					max-width: 70rem;
					margin: 0 auto;
				}

				.flex-outer div,
				.flex-inner {
					display: flex;
					flex-wrap: wrap;
					align-items: center;
				}

				.flex-inner {
					padding: 0 8px;
					justify-content: space-between;
				}

				.flex-outer > div:not(:last-child) {
					margin-bottom: 20px;
				}

				.flex-outer div label,
				.flex-outer div legend {
					padding: 8px;
					font-weight: var(--in-font-weight-bold, 700);
				}

				.flex-outer > div > label {
					flex: 1 0 120px;
					max-width: 20rem;
				}

				.flex-outer > div > label + *,
				.flex-inner {
					flex: 1 0 220px;
				}

				.flex-outer div button {
					margin-left: auto;
					padding: 8px 16px;
					border: 2px solid var(--text-accent-color);
					background: var(--active-menu-item);
					color: var(--main-color);
					text-transform: uppercase;
					letter-spacing: .09em;
					border-radius: 2px;
					cursor: pointer;
				}

				input,
				textarea {
					padding: 15px;
					border: 2px solid var(--in-color-brand-300, #A9B2D0);
					border-radius: var(--in-border-radius-md, 0.5rem);
					background: var(--in-color-white, #fff);
					color: var(--in-color-black, #000);
					font-family: var(--in-font-primary);
					font-size: var(--in-font-size-md, 1rem);
				}

				#at-used label {
					text-transform: none;
				}

				#at-used .flex-outer > div > label + *,
				#at-used .flex-inner {
					flex: 1 0 120px;
					/* max-width: 320px; */
				}

				.flex-inner div {
					width: 100px;
				}

				fieldset {
					margin: 0;
					padding: 0;
					border: none;
				}


				/* a11y content */


				#content--password-val-info,
				#content--password-mem {
					display: none;
				}

				#content--password-mem {
					width: 50%;
					margin: 0 auto;
				}

				.content--validation {
					padding: 4em 0;
				}

				.content--validation ul li {
					padding: 1em 0 1em 1em;
					list-style-type: none;
				}

				@media screen and (max-width: 1024px) and (orientation: portrait) {
					.grid-container {
						grid-template-columns: 1fr;
					}

					#content--password-mem {
						width: 90%;
					}

					.content--validation {
						margin: 1em;
						padding: 2em 0;
					}
				}

				.hidden {
					display: none;
				}


				/* Content area */

				#dashboard {
					padding: 0 2rem;
					color: var(--main-color);
				}

				.flex-outer .tagging_selector label,
				.flex-outer .tagging_selector details {
					align-self: flex-start;
				}

				/* a11y styles */
				.visually_hidden {
					clip: rect(0 0 0 0);
					clip-path: inset(50%);
					height: 1px;
					overflow: hidden;
					position: absolute;
					white-space: nowrap;
					width: 1px;
				}

				he-segment-group {
					--control-margin-inline: 0;
				}


				/* selected tags */

				.selected_tags {
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					justify-content: flex-start;
					align-items: center;
					gap: var(--in-spacing-xs, 0.25rem);
					outline: thin gray white;
					font-size: var(--in-font-size-md, 1rem);
					outline: thin solid white;
					background-color: var(--main-color);
					border-radius: 2rem;
					padding: 0 1rem;
				}

				.selected_tags in-tag-pill {
					--on-color: var(--accent-color);
					--font-size: var(--in-font-size-lg, 1.13rem);
				}

				.selected_tags in-tag-pill[tag-type=language] {
					--on-color:  var(--language-tag);
				}

				.selected_tags input {
					display: inline;
					width: 6rem;
					margin: 0;
					padding: 0;
					outline: none;
					border: none;
					border-radius: 2rem;
				}

				.tagging_selector summary in-tag-pill {
					padding: 0 0.5rem 0.1rem 0;
				}


				/* aligning word-wrap on details/summary */
				summary::-webkit-details-marker {
					display: none
				}

				summary > span {
					width: calc(100% - 50px);
					display: inline-block;
					vertical-align: middle;
				}

				details {
					font-size: var(--in-font-size-xl, 1.25rem);
				}

				summary {
					display: block
				}

				summary:before {
					content: "+";
					margin: 0px 0.5rem 0 0;
					width: 1rem;
					font-size: var(--in-font-size-2xl, 1.5rem);
					font-weight: var(--in-font-weight-bold, 700);
				}

				details[open] summary:before {
					content: "–";
				}

				#push-to-android-error {
					background: var(--in-color-danger-50, #FFF2F0);
					border: 1px solid var(--in-color-danger-700, #E22306);
					color: var(--in-color-danger-900, #8D200F);
					font-weight: bold;
					padding: 1rem;
				}

				#push-to-android-success {
					background: var(--in-color-success-200, #ebfef6);
					border: 1px solid var(--in-colr-success-500, #6ac883);
					color: var(--in-color-success-700, #02542d);
					font-weight: bold;
					padding: 1rem;
				}

				.btn-toolbar {
					display: flex;
					gap: var(--in-spacing-sm, 0.5rem);
					align-items: center;
					justify-content: flex-end;
					margin-top: var(--in-spacing-xl, 2.5rem);
				}

				input[disabled],
				textarea[disabled] {
					background: none;
					color: inherit;
					font: inherit;
					padding: 0!important;
				}

				.jim-editor-button-container {
					display: flex;
					justify-content: center;
					margin-top: var(--in-spacing-md, 1rem);
					margin-bottom: var(--in-spacing-lg, 2rem);
				}
			`,
		];
	}

	/**
	 * Render enrichment UI
	 */
	protected _renderEnrichControls(): HTMLTemplateResult {
		if ((! this._editable) || (! this._contentDoc)) {
			return html``;
		}
		let status = html``;
		let button = html``;
		if (this._contentDoc.enrichTasks?.unarConvert) {
			const task = this._contentDoc.enrichTasks.unarConvert;
			status = html`<div>
				<label></label>
				<p>${this.local(`${this._pageName}.enrich.unarConvert.${task.status}`, { error: task.error })}<p>
			</div>`;
		}
		else if (this._contentDoc.enrichTasks?.unarGenerate) {
			const task = this._contentDoc.enrichTasks.unarGenerate;
			status = html`<div>
				<label></label>
				<p>${this.local(`${this._pageName}.enrich.unarGenerate.${task.status}`, { error: task.error })}<p>
			</div>`;
		}
		if (this._contentDoc.hasAttachment('content')) {
			if (this._contentDoc.jimEnhanced) {
				return html`<div><label></label><p>${this.local(`${this._pageName}.jim_enhanced`)}</p></div>`;
			}
			const convertStatus = this._contentDoc.enrichTasks?.unarConvert?.status;
			if (convertStatus && ('error' != convertStatus)) {
				return status;
			}
			if ('image/svg+xml' != this._contentDoc.attachmentType('content')) {
				button = html`<he-button kind="secondary" @click=${this._onConvertContent}>${this.local(`${this._pageName}.button.convert`)}</he-button>`;
			}
		}
		else if (this._contentDoc.description) {
			const generateStatus = this._contentDoc.enrichTasks?.unarGenerate?.status;
			if (generateStatus && ('error' != generateStatus)) {
				return status;
			}
			button = html`<he-button kind="secondary" @click=${this._onGenerateContent}>${this.local(`${this._pageName}.button.generate`)}</he-button>`;
		}
		return html`${status}
			<div class="btn-toolbar">${button}</div>
		`;
	}

	protected _notModified(): boolean {
		if ((! this._contentDoc) || (! this._origContentDoc)) {
			return true;
		}
		const patch = this._contentDoc.computeMergePatchFrom(this._origContentDoc, { attachments: true });
		delete patch.updateTime;
		return Utils.isEmpty(patch);
	}

	protected _renderEditControls(): HTMLTemplateResult {
		const revertButton = ((this._editable && this._origContentDoc)
		                    ? html`<he-button kind="warning" @click=${this._onRevert} ?disabled=${this._notModified()}>
		                    	${this.local(`${this._pageName}.button.revert`)}
		                    </he-button>`
		                    : '');
		const deleteButton = ((this._editable && this._contentDoc?.rev)
		                      ? html`<he-button kind="danger" @click=${this._onDelete}>${this.local(`${this._pageName}.button.delete`)}</he-button>`
		                      : '');

		return html`<div class="btn-toolbar">
			${deleteButton}
			${revertButton}
			<he-button kind="success" @click=${this._onDone}>${this.local(`${this._pageName}.button.done`)}</he-button>
		</div>`;
	}
	/**
	 * Render Jim Editor button
	 */
	protected _renderJimEditorButton(): HTMLTemplateResult {
		if (this._editable && ('image/svg+xml' == this._contentDoc?.attachmentType('content'))) {
			return html`
				<div class="jim-editor-button-container">
					<he-button kind="secondary" @click=${this._routeToJimEditor}>
						Edit Graphic
					</he-button>
				</div>
			`;
		}
		return html``;
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		const contentSelect = (this._editable
		                       ? html`<div>
		                         	<label for="select_content">${this.local(`${this._pageName}.label.select_content`)}</label>
		                         	<input id="select_content" name="content" type="file"
		                         		required aria-required="true" @change=${this._selectContent}>
		                         </div>`
		                         : '');
		const thumbnailSelect = (this._editable
		                         ? html`<div>
		                         	<label for="select_thumbnail">${this.local(`${this._pageName}.label.select_thumbnail`)}</label>
		                         	<input id="select_thumbnail" name="thumbnail" type="file"
		                         		required aria-required="true" @change=${this._selectThumbnail}>
		                         </div>`
		                         : '');
		const visibilitySelect = (this._editable
			? html`
				<div>
					<label for="visibility">${this.local(`${this._pageName}.label.visibility`)}</label>
					<he-segment-group
						id="visibility"
						name="visibility"
						.value=${this._contentDoc?.visibility || 'private'}
						aria-label=${this.local(`${this._pageName}.label.visibility`)}
						@keydown=${(e: KeyboardEvent) => {
							/* prevent up/down key scrolling */
							if (e.key !== 'Tab') {
								e.preventDefault();
							}
						}}
					>
						<he-segment value="private">${this.local('common.visibility.private')}</he-segment>
						<he-segment value="protected">${this.local('common.visibility.protected')}</he-segment>
						<he-segment value="public">${this.local('common.visibility.public')}</he-segment>
					</he-segment-group>
				</div>`
			: '');
		return html`
			<main>
				<section id="content-container">
					<div class="grid-container">
						<div>
							<div id="image-container"></div>
							${this._renderJimEditorButton()}
						</div>
						<form ${ref(this._formRef)} @change=${this._onUpdate} @input=${this._onUpdate}>
							<section class="flex-outer">
								${this._contentDoc?.hasAttachment('data') ? '' : contentSelect}
								<div>
									<label for="name">${this.local(`${this._pageName}.label.name`)}</label>
									<input id="name" name="name" type="text" class="" size="30"
										minlength="3" value=${this._contentDoc?.name || ''}
										placeholder=${this.local(`${this._pageName}.untitled`)}
										required aria-required="true" ?disabled=${! this._editable}>
								</div>
								<div>
									<label for="description">${this.local(`${this._pageName}.label.description`)}</label>
									<textarea id="description" name="description" size="4"
										?disabled=${! this._editable}>${this._contentDoc?.description ?? ''}</textarea>
								</div>
								${this._contentDoc?.hasAttachment('data') ? '' : thumbnailSelect}
								${visibilitySelect}
								<div class="tagging_selector">
									<label id="subject_tags">${this.local('content_tags.subjects.label')}:</label>
									<in-tag-category-selector
										aria-labelledby="subject_tags"
										.selectedTags=${this._selectedTags}
										category="subjects"
										name="subjects"
										label=${this.local('content_tags.subjects.label')}
										?open=${true}
										?disabled=${! this._editable}
									>
									</in-tag-category-selector>
								</div>

								<div class="tagging_selector">
									<label id="image_type_tags">${this.local('content_tags.image_types.label')}:</label>
									<in-tag-category-selector
										aria-labelledby="image_type_tags"
										.selectedTags=${this._selectedTags}
										category="image_types"
										name="image_types"
										label=${this.local('content_tags.image_types.label')}
										?open=${true}
										?disabled=${! this._editable}>
									</in-tag-category-selector>
								</div>

								<div class="tagging_selector">
									<label id="assistive_technique_tags">${this.local('content_tags.assistive_techniques.label')}:</label>
									<in-tag-category-selector
										aria-labelledby="assistive_technique_tags"
										.selectedTags=${this._selectedTags}
										category="assistive_techniques"
										name="assistive_techniques"
										label=${this.local('content_tags.assistive_techniques.label')}
										?open=${true}
										?disabled=${! this._editable}>
									</in-tag-category-selector>
								</div>

								<div class="tagging_selector">
									<label id="publisher_tags">${this.local('content_tags.publishers.label')}:</label>
									<in-tag-category-selector
										aria-labelledby="publisher_tags"
										.selectedTags=${this._selectedTags}
										category="publishers"
										name="publishers"
										label=${this.local('content_tags.assistive_techniques.label')}
										?open=${true}
										?disabled=${! this._editable}>
									</in-tag-category-selector>
								</div>

								<div class="tagging_selector">
									<label id="status_tags">${this.local('content_tags.statuses.label')}:</label>
									<in-tag-category-selector
										aria-labelledby="status_tags"
										.selectedTags=${this._selectedTags}
										category="statuses"
										name="statuses"
										label=${this.local('content_tags.statuses.label')}
										?open=${true}
										?disabled=${! this._editable}>
									</in-tag-category-selector>
								</div>

								<div class="tagging_selector">
									<label for="languages_tags">${this.local('common.languages')}:</label>
									<in-tag-category-selector
										aria-labelledby="languages_tags"
										.selectedTags=${this._selectedTags}
										category="languages"
										name="languages"
										label=${this.local('common.languages')}
										?disabled=${! this._editable}>
									</in-tag-category-selector>
								</div>

								${this._renderEnrichControls()}
								${this._renderEditControls()}
							</section>
						</form>

						<p id="status_message"></p>

					</div>
				</section>
			</main>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-edit-page': InEditPage,
	}
}
