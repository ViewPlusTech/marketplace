
import {
	customElement, html, css, HTMLTemplateResult, CSSResult, state, repeat,
} from '@elemental/helium';
import { Utils } from '@elemental/utils';
import { Message } from '@elemental/localization';
import { InPage } from '@inclusio/base';
import { ContentDoc, MetadataProperties, docId } from '@inclusio/documents';

interface QueryItem {
	name: string[];
	description: string[];
	tags: string[];
	collections: string[];
}

interface Query {
	[name: string]: QueryItem;
}


@customElement('in-search-page')
/**
 * Inclusio search page
 */
export class InSearchPage extends InPage {
	@state() protected _contentDocs: ContentDoc[] = [];
	@state() protected _allContentDocs: ContentDoc[] = [];
	@state() protected _resultCountMsg: string = '';
	@state() protected _filters: Set<string> = new Set();
	@state() protected _keywordFilters: Set<string> = new Set();

	@state() protected _publicOnly = true;
	@state() protected _pageName = 'search';

	protected _searchInput?: HTMLInputElement;

	protected _isTagSearchExclusive = true;

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
		if ('/' == window.location.pathname) {
			this._pageName = 'dashboard';
			this._publicOnly = false;
		}
		else {
			this._pageName = 'search';
			this._publicOnly = true;
		}

		this.app.activePageName = this._pageName;

		this._searchInput = (this._findChild('search_input') as HTMLInputElement);

		if (! this.localMessage('content_tags')) {
			const contentMetadata = await this.server.contentMetadata();
			for (const [locale, messages] of Object.entries(contentMetadata.languages)) {
				this.insertLocalMessage(locale, 'content_tags', Utils.snakeCase(messages) as unknown as Message);
			}
			this._filters = new Set(this._filters.values());
		}

		// TODO add event listener for db updates and login/out

		this._allContentDocs = [];
		this._contentDocs = [];
		this._resultCountMsg = this.local('search.searching');
		await this._loadContentDocuments();
	}

	/**
	 * Focus Search Input
	 */
	protected async _focusSearchInput(event: PointerEvent): Promise<void> {
		const elementType = ((event?.target) as HTMLInputElement).localName;
		if (('search' === elementType) || ('section' === elementType)) {
			this._searchInput?.focus();
		}
	}


	/**
	 * Load content docuements
	 */
	protected async _loadContentDocuments(): Promise<void> {
		if ((! this._publicOnly) && this.app.loggedIn) {
			const options = {
				startkey: docId(ContentDoc, this.app.userId),
				endkey: docId(ContentDoc, this.app.userId, '\ufff0'),
				includeDocs: true,
			};
			this._allContentDocs = (await this.userDB.allDocs(options) as ContentDoc[]);
		}
		else {
			this._allContentDocs = await this.server.publicContentDocuments();
		}
		this._contentDocs = this._allContentDocs;
		this._displayResultCount(this._contentDocs.length, true, undefined, true);
	}


	/**
	 * Removes tag pill from list of selected tags
	 */
	protected _removeTagPill(event: CustomEvent): void {
		this._toggleTag(event);
		const selectedTagsEl = (this._findChild('selected_tags') as HTMLElement);
		selectedTagsEl.focus();
	}


	/**
	 * Toggles tag in or out of list of selected tags
	 */
	protected async _toggleTag(event: Event, actionMsg?: string): Promise<void> {
		const tagCheckbox = ((event?.target) as HTMLInputElement);
		const searchTag = (tagCheckbox.value as string);

		if (tagCheckbox.checked) {
			this._filters.add(searchTag);
			actionMsg = actionMsg ? actionMsg : `Added "${searchTag.replace('.', ' ')}" to Selected Tags`;
			// this._tagFiltersArray.push(searchTag);
		}
		else {
			this._filters.delete(searchTag);
			actionMsg = actionMsg ? actionMsg : `Removed "${searchTag.replace('.', ' ')}" from Selected Tags`;
		}

		this._filters = new Set(this._filters.values());
		this._searchList(true, actionMsg);
		// this._searchList('_toggleTag');

		// TODO: requery db for paged docs
	}


	/**
	 * Clears all search tags
	 */
	protected async _clearSearchTags(): Promise<void> {
		this._filters = new Set();
	}


	/**
	 * Processes key input to get search commands
	 */
	protected async _filtersChanged(_event: Event): Promise<void> {
		this._filters = new Set(this._filters.values());
		this._searchList(true);
	}


	/**
	 * Add free-text keywords to keywords set
	 */
	protected async _addKeyword(keyword?: string): Promise<void> {
		console.log('_addKeyword');
		if (! keyword) {
			keyword = this._searchInput!.value;
			this._searchInput!.value = '';
		}

		if (keyword) {
			this._keywordFilters.add(keyword);
			this._searchList(true, `Added "${keyword}" to Selected Keywords`); // TODO: test if this should be announced
		}
	}


	/**
	 * Remove keyword tag from keywords set
	 */
	protected async _removeKeyword(event: Event): Promise<void> {
		const keywordInput = ((event?.target) as HTMLInputElement);
		const keyword = (keywordInput.value as string);

		// set focus to selected keywords list
		const selectedKeywordsEl = (this._findChild('selected_keywords') as HTMLElement);
		selectedKeywordsEl.focus();

		await this._clearKeywords([keyword]);
		this._searchList(true, `Removed "${keyword}" from Selected Keywords`); // TODO: test if this should be announced
	}


	/**
	 * Clears all keywords
	 */
	protected async _clearKeywords(keywords?: Array<string>): Promise<void> {
		if (! keywords) {
			this._keywordFilters = new Set();
		}
		else {
			keywords.forEach((keyword) => {
				this._keywordFilters.delete(keyword);
			});
			this._keywordFilters = new Set(this._keywordFilters.values());
		}
	}


	/**
	 * Processes key input to get search commands
	 */
	protected async _getSearchCommands(event: KeyboardEvent): Promise<void> {
		const key = ((event?.key) as string);
		switch (key) {
			case 'Enter':
				event.stopPropagation();
				event.preventDefault();
				this._addKeyword();

				break;
				/* case 'Tab':
				event.stopPropagation();
				event.preventDefault();
				const documentList = this._findChild('document_list') as HTMLElement;
				documentList.focus();
				break;*/

			default:
				break;
		}
	}


	/**
	 * Gets search text
	 */
	protected async _getSearchText(_event: KeyboardEvent): Promise<void> {
		// console.log('event', event);
		this._searchList();
	}


	/**
	 * Processes text input to search documents
	 */
	protected async _searchList(isAnnounced?: boolean, actionMsg?: string): Promise<void> {
		// console.log('>>>>>>>>>>>> isAnnounced, actionMsg', isAnnounced, actionMsg);
		const searchTerm = (this._searchInput!.value as string);

		const tagArray = [...this._filters];

		const keywordArray = [...this._keywordFilters];
		if (searchTerm) {
			keywordArray.push(searchTerm);
		}
		// console.log('keywordArray:', keywordArray);
		// console.log('tagArray:', tagArray);

		if (tagArray.length || keywordArray.length) {
			const filter = {
				name: keywordArray,
				description: keywordArray,
				tags: tagArray,
				collections: [],
			};

			const query = await this._composeFilter(filter);

			// console.log('>>>>>>>>>>>>>	isAnnounced before', isAnnounced);

			this._contentDocs = await this._filterDocuments(this._allContentDocs, query);
			const docCount = this._contentDocs.length;

			// Display result count; and also announce result count via `aria-live` if there are no results,
			// 1 result, or if the search is triggered by tag change rather than typing or voice input
			isAnnounced = ((! docCount) || (1 === docCount)) ? true : isAnnounced;
			// console.log('>>>>>>>>>>>>>	isAnnounced after', isAnnounced);
			this._displayResultCount(docCount, isAnnounced, actionMsg);
		}
		else {
			this._contentDocs = this._allContentDocs;
			const docCount = this._contentDocs.length;
			this._displayResultCount(docCount, true, actionMsg);
		}
	}


	/**
	 * Displays result count, and optionally announces it
	 */
	protected async _displayResultCount(resultCount: number, isAnnounced?: boolean, actionMsg?: string, initial = false): Promise<void> {
		this._resultCountMsg = this.local(initial ? 'search.available' : 'search.results', { count: resultCount });
		if (isAnnounced) {
			this.app.announcementMsg = (actionMsg) ? `${actionMsg}. ${this._resultCountMsg}` : this._resultCountMsg;
			// this._announcementEl?.focus(); // TODO: test if announcement element should be focused, or if just announcing is enough
		}
	}

	/**
	 * Constructs search query filter
	 */
	protected async _composeFilter(filter: any): Promise<Query> {
		const query = ({} as Query);
		for (const keys in filter) {
			if (filter[keys].length) {
				query[keys] = filter[keys].map((entry: string) => entry.toLowerCase());
			}
		}
		return query;
	}


	/**
	 * Filters documents by search query
	 */
	protected async _getTagsByCategory(tagArray: string[]): Promise<any> {
		const tagsByCategory = new Map();
		// new Map<string, string>([
		// const tagsByCategory = new Set();
		// const tagsByCategory = {};
		for (const tag of tagArray) {
			const tagParts = tag.split('.');
			const category = tagParts[0];
			const subTag = tagParts[1];
			if (! tagsByCategory.has(category)) {
			// if (! tagsByCategory[tagParts[0]]) {
				tagsByCategory.set(category, [subTag]);
			}
			else {
				const subTagArray = tagsByCategory.get(category);
				subTagArray?.push(subTag);
			}
		}
		// this._tagFilters.has(optionKey)
		return tagsByCategory;
	}

	/**
	 * Get content doc metadata as tag array
	 * TODO: move this to ContentDoc class
	 */
	protected _getDocTags(contentDoc: ContentDoc): string[] {
		const tags: string[] = [];
		for (const metaProperty of MetadataProperties) {
			for (const value of (contentDoc[metaProperty] || [])) {
				tags.push(`${Utils.snakeCase(metaProperty)}.${value}`);
			}
		}
		return tags;
	}

	/**
	 * Filters documents by search query
	 */
	protected async _filterDocuments(contentDocs: any[], query: any): Promise<any[]> {
		let docs = contentDocs;

		// const queryTags = query['tags'].toSorted();
		const queryTags = query['tags'];
		if (this._isTagSearchExclusive && queryTags) {
			const tagCategories = await this._getTagsByCategory(queryTags);
			docs = contentDocs.filter((doc) => {
				const docTags = this._getDocTags(doc);
				for (const [category, subTags] of tagCategories) {
					let isMatch = false;
					for (const subTag of subTags) {
						if (docTags.includes(`${category}.${subTag}`)) {
							isMatch = true;
						}
					}
					if (! isMatch) {
						return false;
					}
				}
				return true;
			});
		}

		let filteredData = docs;

		if (query.name?.length || query.description?.length) {
			filteredData = docs.filter((docItem) => {
				for (const fieldKey in query) {
					if (Object.prototype.hasOwnProperty.call(query, fieldKey)) {
						const fieldArray = query[fieldKey];
						for (const fieldItem in fieldArray) {
							if (Object.prototype.hasOwnProperty.call(fieldArray, fieldItem)) {
								const queryTerm = fieldArray[fieldItem].toLowerCase();
								const docField = docItem[fieldKey];
								if (Utils.isString(docField)) {
									// this is a keyword string, such as for titles or descriptions
									// this will match any keyword instance, non-exclusively
									// TODO: much later, add synonyms or ML searches
									if (docField.toLowerCase().includes(queryTerm)) {
										return true;
									}
								}
								else if (Utils.isArray(docField)) {
									// this is an array, such as for tags, collections, publisher info, etc.
									// This is non-exclusive, but we have an option (`_isTagSearchExclusive`) for
									// making it exclusive (in other words, the results must match all tags,
									// even if keywords would otherwise match; keywords will only search within
									// filtered tag matches)
									// if ((! this._isTagSearchExclusive) || (fieldKey !== 'tags')) {
									// 	for (const entry of docField) {
									// 		if (entry.toLowerCase().includes(queryTerm)) {
									// 			return true;
									// 		}
									// 	}
									// }
								}
							}
						}
					}
				}
			});
		}

		return filteredData;
	};


	/**
	 * Clears text input and all tags
	 */
	protected async _clearSearchInput(): Promise<void> {
		this._searchInput!.value = '';

		this._clearSearchTags();
		this._clearKeywords();
		this._searchInput?.focus();
		this._searchList(true);
		// this._searchList('_clearSearchInput');
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...InPage.styles,
			css`
				#content-container {
					display: grid;
					grid-template-columns: 15rem 1fr;
					/*gap: 2rem;*/
					column-gap: 2rem;
				}

				#instructions {
					grid-column: 1 / 3;
				}

				/* search bar */

				search {
					display: grid;
					grid-template-columns: auto 1fr auto;
					justify-content: space-between;
					align-items: center;
					gap: var(--in-spacing-sm, 0.5rem);
					outline: thin solid white;
					background-color: var(--in-color-brand-100, #eaecf4);
					border-radius: var(--in-border-radius-xl, 2.5rem);
					width: 100%;
					padding: 0.15rem 0.5rem 0.15rem .15rem;
					width: 100%;
					max-width: 50rem;
				}

				section#tag-input-bar {
					display: flex;
					flex-direction: row;
					flex-grow: 5;
					flex-wrap: wrap;
					justify-content: flex-start;
					align-items: center;
					gap: var(--in-spacing-sm, 0.5rem);
				}

				#search_combo {
					flex-grow: 5;
				}

				#search_input {
					height: 2rem;
					width: 100%;
					background-color: var(--in-color-white, #fff);
					color: var(--in-color-black, #000);
					border: solid thin gray;
					border: none;
				}

				search he-icon {
					--icon-size: var(--in-icon-size-sm, 24px);
					color: var(--in-color-black, #000);
					margin-left: .5rem;
				}

				search he-button-icon {
					--color: var(--in-color-white, #fff);
					--background: var(--in-color-black, #000);
					margin: 0;
				}

				/* selected tags */

				#selected_tags {
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					justify-content: flex-start;
					align-items: center;
					gap: var(--in-spacing-xs, 0.25rem);
					outline: thin gray white;
				}

				#selected_tags in-tag-pill {
					--on-color: var(--accent-color);
					--font-size: var(--in-font-size-lg, 1.1rem);
				}

				#selected_tags in-tag-pill[tag-type=language] {
					--on-color: var(--language-tag);
				}

				#result_info {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: flex-end;
					padding: 0;
					margin: var(--in-spacing-md, 1rem) 0;
				}

				#result_info * {
					padding: 0;
					margin: 0;
				}

				/* Gallery */

				/* tooltips */
				[data-tooltip] {
					position: relative;
				}

				[data-tooltip][aria-label]:before,
				[data-tooltip][aria-label]:after {
					display: block;
					opacity: 0;
					pointer-events: none;
					position: absolute;
				}

				[data-tooltip][aria-label]:after {
					border-right: 0.5rem solid transparent;
					border-bottom: 0.5rem solid var(--in-color-black, #000);
					border-left: 0.5rem solid transparent;
					content: '';
					height: 0;
					top: 1.4rem;
					left: 0;
					width: 0;
				}

				[data-tooltip][aria-label]:before {
					background: var(--in-color-black, #000);
					border-radius: 0.1rem;
					color: var(--main-color);
					content: attr(aria-label);
					padding: 0 0.8rem;
					left: -1.1rem;
					top: 1.9rem;
					white-space: nowrap;
				}

				[data-tooltip~="bottom-left"][aria-label]:before {
					left: -5.1rem;
					top: 1.9rem;
				}

				/* tooltip animations */
				[data-tooltip][aria-label]:after,
				[data-tooltip][aria-label]:before {
					transform: translate3d(0,-0.8rem,0);
					transition: all .15s ease-in-out;
				}

				[data-tooltip][aria-label]:hover:after,
				[data-tooltip][aria-label]:hover:before,
				[data-tooltip][aria-label]:focus:after,
				[data-tooltip][aria-label]:focus:before {
					opacity: 1;
					transform: translate3d(0,0,0);
				}

				/* a11y styles */
				.sr-only {
					border: 0 !important;
					clip: rect(1px, 1px, 1px, 1px) !important;
					-webkit-clip-path: inset(50%) !important;
					clip-path: inset(50%) !important;
					height: 1px !important;
					overflow: hidden !important;
					margin: -1px !important;
					padding: 0 !important;
					position: absolute !important;
					width: 1px !important;
					white-space: nowrap !important;
				}
			`,
		];
	}


	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		return html`
			<div id="content-container">
				<aside id="instructions" aria-label="Instructions">
					<details>
						<summary>How to use</summary>
						<ul>
							<li>${this.local('search.instructions_1')}</li>
							<li>${this.local('search.instructions_2')}</li>
							<li>${this.local('search.instructions_3')}</li>
						</ul>
					</details>
				</aside>
				<aside class="tags" tabindex="-1" aria-label="Filters">
					<h2 tabindex="-1" aria-hidden="true">Filters</h2>
					<!--
					<p class="hide">Filters, which filter out documents, are organized in groups.
					Select as many as you want. Selected filters will sort to the top of the list.\
					Filters are persistent between sessions by default. (Most of these statements aren't true yet.)</p>
					-->

					<in-filter-tree
						.page=${this}
						.selectedFilters=${this._filters}
						@change=${this._filtersChanged}
					></in-filter-tree>
				</aside>

				<main>
					<h2>${this.local('search.search_header')}</h2>

					<search
						@click="${this._focusSearchInput}">
						<he-icon icon="search-outline"></he-icon>
						<section id="tag-input-bar">
							<div>
								<h2 id="selected_tags_title" class="sr-only">Selected tags</h2>
								<div
									id="selected_tags"
									role="list"
									aria-labelledby="selected_keywords_title"
									tabindex="0"
									?hidden=${! this._filters.size}
								>
									${repeat([...this._filters.values()], (tag) => tag, (tag) => {
										const [category, key] = tag.split('.');
										const tagType = ('languages' === category) ? 'language' : 'tag';
										return html`
											<in-tag-pill
												role="listitem" value="${tag}" data-tag="${tag}" checked
												lastfocus
												tag-type="${tagType}"
												label=${(('languages' === category)
													? `${this.languageName(key)} (${key})`
													: this.local(`content_tags.${category}.options.${key}.label`))}
												@change="${this._removeTagPill}"
											></in-tag-pill>`;
									})}
								</div>
							</div>

							<div>
								<h2 id="selected_keywords_title" class="sr-only">Selected keywords</h2>
								<div
									id="selected_keywords"
									role="list"
									aria-labelledby="selected_keywords_title"
									tabindex="0"
									?hidden=${! this._keywordFilters.size}
								>
									${repeat([...this._keywordFilters.values()], (keyword) => keyword, (keyword, _index) => {
										return html`<in-tag-pill label="${keyword}"
											role="listitem" value="${keyword}" data-tag="${keyword}" checked
											@change="${this._removeKeyword}"></in-tag-pill>`;
									})}
								</div>
							</div>

							<div id="search_combo">
								<input id="search_input" name="search_input" type="text"
									minlength="3" aria-label="Live search"
									@keydown="${this._getSearchCommands}" @keyup="${this._getSearchText}">
							</div>
						</section>

						<he-button-icon icon="close" aria-label="Clear all search options" data-tooltip="bottom-left"
							@click="${this._clearSearchInput}"></he-button-icon>

					</search>
					<section aria-label="Search results">
						<h3 id="result-count">
							${this._resultCountMsg}
						</h3>
						<in-content-list
							.contentDocs=${this._contentDocs}
							.page=${this}
						></in-content-list>
					</section>
				</main>
			</div>
			<p>${this.local(`${this._pageName}.debug_message`)}</p>
		`;
	}
	// ; doc.collections.length ? `, ${doc.collections?.join(', ')}': ''
}


declare global {
	interface HTMLElementTagNameMap {
		'in-search-page': InSearchPage,
	}
}
