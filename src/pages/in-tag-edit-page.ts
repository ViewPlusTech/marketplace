
import {
	customElement, html, HTMLTemplateResult, css, CSSResult, state, repeat,
} from '@elemental/helium';

import { InPage } from '@inclusio/base';
import { ContentDoc } from '@inclusio/documents';


@customElement('in-tag-edit-page')
/**
 * Inclusio login page
 */
export class InTagEditPage extends InPage {
	@state() protected _contentDocs: ContentDoc[] = [];
	@state() protected _subjectTags: Set<string> = new Set();
	@state() protected _subjectTagsSelected: Set<string> = new Set();
	@state() protected _selectedTags: Set<string> = new Set();
	@state() protected _tagFilters: Set<string> = new Set();

	/**
	 * Initial setup
	 */
	protected _setup(): void {
		super._setup();
	}

	/**
	 * Register on DOM connect
	 */
	async connectedCallback(): Promise<void> {
		await super.connectedCallback();
		this.app.activePageName = 'tag_edit';

		if (! this.app.loggedIn) {
			this.app.routeTo('/login');
			return;
		}

		console.log('TAG EDIT PAGE');
	}

	/**
	 * Gets the file from the file selector input
	 */
	async selectFile(event: Event): Promise<void> {
		// console.log('event', event);

		const fileInput = ((event?.target) as HTMLInputElement);
		const fileList = fileInput.files;
		const file = fileList!.item(0)!;

		const docnameInput = (this._findChild('docname') as HTMLInputElement);
		docnameInput.placeholder = file.name;

		const imageContainer = (this._findChild('image_container') as HTMLElement);

		// display file
		if (file) {
			const fileReader = new FileReader();

			console.log('FILE', file);

			// show preview
			// TODO: add previews for other image types
			if ('image/svg+xml' === file.type) {
				fileReader.readAsText(file);
				fileReader.addEventListener('load', () => {
					const fileContent = (fileReader.result as string);
					imageContainer.innerHTML = fileContent;

					const svgTitleEl = imageContainer.querySelector('svg > title');
					const svgTitle = svgTitleEl?.textContent;

					// if no file name, use <title> element value of SVG
					if (svgTitle) {
						docnameInput.value = docnameInput.value ? docnameInput.value : svgTitle;
					}
					else {
						docnameInput.placeholder = file.name;
					}
				}, false);
			}
		}
	}

	/**
	 * Save document and metadata
	 */
	async save(event: Event): Promise<void> {
		event.preventDefault();
		// console.log(event);

		// const docnameInput = (this._findChild('docname') as HTMLInputElement);
		// const docname = docnameInput.value;

		// const fileInput = (this._findChild('file_input') as HTMLInputElement);
		// const fileList = fileInput.files;
		// const file = fileList!.item(0)!;

		// lastModified: 1698723174186
		// name: "inclusio-logo.svg"
		// size: 854
		// type: "image/svg+xml"

		try {
			// console.log('docname', docname);
			// console.log(fileList?.item(0));


			// this.app.routeTo('/');


			// login(docname: string, password: string, options?: CallOptions): Promise<AccountInfo>;

			// this.app.accountInfo = await this.server.login(docname, password);

			// console.log('login accountInfo', this.app.accountInfo);
			// if (this.app.accountInfo) {
			// // this.updateStatus('LOGGED IN!');
			// await this.app.syncDB(); // TODO: consider removing `await`
			// this.app.routeTo('/');
			// }
		}
		catch (error) {
			console.log(`save error: ${error}`);

			// const status = (error as RemoteWebError).status;
			// console.log(`status code: ${status}`);

			// const statusMessage = this.local(`app.response_codes.${status}`);
			// console.log(`email statusMessage: ${statusMessage}`);
			// this.updateStatus(statusMessage);
		}
	}


	/**
	 * Update status
	 */
	async updateStatus(message: string): Promise<void> {
		const statusMessageEl = this._findChild('status_message');
		statusMessageEl?.append(message);
	}


	/**
	 * Processes tag toggling
	protected async _tagsChanged(event: Event): Promise<void> {
		const tagCheckbox = ((event?.target) as HTMLInputElement);
		const tag = (tagCheckbox.value as string);

		console.log('event', event)
		console.log('tag', tag)

		this._subjectTagsSelected.add(tag);

		this._subjectTagsSelected = new Set(this._subjectTagsSelected.values());
	}
	*/


	/**
	 * Removes tags
	protected async _removeTag(event: Event): Promise<void> {
		const tagCheckbox = ((event?.target) as HTMLInputElement);
		const tag = (tagCheckbox.value as string);
		this._subjectTagsSelected.delete(tag);

		this._subjectTagsSelected = new Set(this._subjectTagsSelected.values());
	}
	 */

	/**
	 * Processes tag pill change
	 */
	protected async _removeTagPill(event: CustomEvent): Promise<void> {
		console.log('_removeTagPill', event);
		this._subjectTags.delete(event.detail);
		this._subjectTags = new Set(this._subjectTags.values());
	}

	/**
	 * Processes tag toggling
	 */
	protected async _tagsChanged(_event: CustomEvent): Promise<void> {
		this._subjectTags = new Set(this._subjectTags.values());
	}


	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...InPage.styles,
			css`
				.container {
					width: 80%;
					max-width: 1200px;
					margin: 0 auto;
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
					max-width: 40rem;
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
					text-transform: uppercase;
				}

				.flex-outer > div > label,
				.flex-outer div p {
					flex: 1 0 120px;
					max-width: 220px;
				}

				.flex-outer > div > label + *,
				.flex-inner {
					flex: 1 0 220px;
				}

				.flex-outer div p {
					margin: 0;
				}

				.flex-outer div input:not([type='checkbox']),
				.flex-outer div textarea {
					padding: 15px;
					border: none;
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
				}

				input {
					background: var(--text-accent-color);
					color: var(--active-menu-item);
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
				@media screen and (max-width: 1024px) and (orientation: portrait) {
					#content--password-mem {
						width: 90%;
					}
				}

				.content--validation {
					padding: 4em 0;
				}

				.content--validation ul li {
					padding: 1em 0 1em 1em;
					list-style-type: none;
				}

				@media screen and (max-width: 1024px) and (orientation: portrait) {
					.content--validation {
						margin: 1em;
						padding: 2em 0;
					}
				}

				input {
					font: "Fira Sans", "Helvetica Neue", sans-serif !important;
				}

				.hidden {
					display: none;
				}


				/* Content area */

				#dashboard {
					padding: 0 2rem;
					color: var(--main-color);
				}

				#image_container {
					max-width: 25%;
					outline: 2px solid var(--accent-color);
					background-color: white;
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



				/* selected tags */

				.selected_tags {
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					justify-content: flex-start;
					align-items: center;
					gap: 0.25rem;
					outline: thin gray white;
					outline: thin solid white;
					background-color: var(--main-color);
					border-radius: 2rem;
					padding: 0 1rem;
				}

				.selected_tags in-tag-pill {
					--on-color: var(--accent-color);
					--primary-color: var(--main-color);
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


			`,
		];
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		return html`
			<!--
			<p>${this.local('login.debug_message')}</p>
			-->
			<section id="core">
				<section id="content-container" class="container" role="search">
				<aside class="tags">
					<h2>Tag Filters</h2>
					<in-tag-selector-list .tagFilters=${this._tagFilters}
						@change="${this._tagsChanged}"></in-tag-selector-list>
				</aside>
				<main>
					<div class="container">
						<form id="tag_edit_form" method="post" enctype="multipart/form-data">
							<!--  action="/api" method="post" enctype="multipart/form-data" -->
							<section class="flex-outer">
								<div>
									<label for="file_input">${this.local('tag_edit.label.file_input')}</label>
									<input id="file_input" name="docname" type="file"
										size="30" minlength="3"
										required="true" aria-required="true"
										@change="${this.selectFile}">
								</div>
								<div>
									<label for="docname">${this.local('tag_edit.label.docname')}</label>
									<input id="docname" name="docname" type="text" class="" size="30"
										minlength="3"
										required="true" aria-required="true">
								</div>

								<div>
									<label for="subject_tags">${this.local('search_tags.subject.label')}</label>
									<div>
										<div class="selected_tags">
											<div>
												<p id="selected_subject_tags_title" class="visually_hidden">Selected keywords</p>
												<div id="selected_subject_tags" role="list" aria-labelledby="selected_subject_tags_title" tabindex="0">
													${repeat([...this._subjectTags.values()], (tag) => tag, (tag) => {
														const [category, key] = tag.split('.');
														const tagType = ('languages' === category) ? 'language' : 'tag';
														return html`<in-tag-pill
															role="listitem"
															value="${tag}"
															tag-type="${tagType}"
															checked
															@change="${this._removeTagPill}"
															>${('languages' === category)
															    ? `${this.languageName(key)} (${key})`
															    : this.local(`search_tags.${category}.options.${key}.label`)}</in-tag-pill>`;
													})}
												</div>
											</div>
											<input id="docname" name="docname" type="text" class="" size="30">
										</div>
										<in-tag-selector .selectedTags=${this._subjectTags} category="subject"
											@change="${this._tagsChanged}"></in-tag-selector>
									</div>
								</div>

								<div>
									<label for="languages_tags">${this.local('common.languages')}</label>
									<div>
										<in-tag-selector .selectedTags=${this._subjectTags} category="languages"
											@change="${this._tagsChanged}"></in-tag-selector>
									</div>
								</div>

								<div class="flex-inner">
									<in-button id="save_button" variant="primary"
										@click="${this.save}">${this.local('tag_edit.button.save')}</in-button>
								</div>
							</section>
						</form>
						<div id="image_container">
						</div>

						<p id="status_message"></p>
						<p>${this.local('tag_edit.debug_message')}</p>

					</section>
				</main>
			</section>
		</section>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-tag-edit-page': InTagEditPage,
	}
}
