
import {
	HeElement, customElement, html, css, HTMLTemplateResult, CSSResult,
	ref, createRef,
	PropertyValues,
	property,
} from '@elemental/helium';

import { type InPage, local } from '@inclusio/base';
import { ContentMetadata } from '@inclusio/documents';
import { type InFilterGroup } from '.';


@customElement('in-filter-tree')
/**
 * Tree of grouped filter toggles.
 */
export class InFilterTree extends local(HeElement) {
	page: InPage;
	@property({ attribute: false }) selectedFilters: Set<string>;
	protected _listRef = createRef<HTMLUListElement>();
	protected _groupRefs: ReturnType<typeof createRef<InFilterGroup>>[] = [];
	protected _contentTags: ContentMetadata;


	/**
	 * All filter group elements.
	 */
	get groups() {
		return this._groupRefs.map((gr) => gr.value!);
	}

	/**
	 * Number of filter groups.
	 */
	get numGroups() {
		return this._groupRefs.length;
	}

	/**
	 * All filters from all groups.
	 */
	get filters() {
		return this.groups.flatMap((g) => g.filters);
	}

	/**
	 * Connect to app's server instance on DOM connect
	 */
	async connectedCallback(): Promise<void> {
		super.connectedCallback();
	}

	/**
	 * Disonnect from DOM
	 */
	disconnectedCallback(): void {
		super.disconnectedCallback();
	}

	/** Pre-render hook */
	willUpdate(changedProperties: PropertyValues): void {
		if (changedProperties.has('selectedFilters')) {
			const contentTags = (this.localMessage('content_tags') || {}) as unknown as ContentMetadata;
			// Number of filter groups, excluding the languages group
			const numGroups = Object.keys(contentTags).length;
			if (numGroups) {
				this._contentTags = contentTags;
				// Create all the refs, including for the languages group
				for (let i = 0; i < numGroups + 1; i++) {
					this._groupRefs[i] ??= createRef();
				}
			}
		}
	}

	/**
	 * Toggle a filter.
	 */
	toggleFilter(filter: string) {
		let msg = '';
		if (! this.selectedFilters.has(filter)) {
			this.selectedFilters.add(filter);
			msg = this.local('search.tag_selected', { tag: filter });
		}
		else {
			this.selectedFilters.delete(filter);
			msg = this.local('search.tag_deselected', { tag: filter });
		}
		this.page.app.alertMsg = msg + '. '
			+ this.local('search.tag_selected_count', { count: this.selectedFilters.size });
		this._sendEvent('change', filter);
	}

	/**
	 * Determine where in the tree to return to if we tab away.
	 */
	setReturnDestination() {
		const filt = this.filters.find((f) => f.checked);
		if (filt) {
			// Return destination is first selected filter
			filt.canFocus = true;
			return filt;
		}
		else {
			// Return destination is first group
			this.groups[0].canFocus = true;
			return this.groups[0];
		}
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
			css`
				ul {
					list-style-type: none;
					padding: 0 1rem;
				}
			`,
		];
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		return this._contentTags
			? html`
				<div
					role="tree"
					aria-label="Filters"
					aria-multiselectable="true"
				>
					<ul
						${ref(this._listRef)}
						aria-label=${this.local('search.filters_label')}
					>
						${Object.entries(this._contentTags).map(([key, value], i) => {
							return html`
								<li>
									<in-filter-group
										${ref(this._groupRefs[i])}
										open
										sort
										.selectedFilters=${this.selectedFilters}
										.filterTree=${this}
										.index=${i}
										.label=${value.label}
										.metadataKey=${key}
										.filterInfo=${Object.entries(value.options).map(
											([optKey, optValue]) => ({ key: optKey, value: (optValue as any).label }))}
									></in-filter-group>
								</li>
							`;
						})}
						<li>
							<in-filter-group
								${ref(this._groupRefs.at(-1))}
								.selectedFilters=${this.selectedFilters}
								.filterTree=${this}
								.index=${this._groupRefs.length - 1}
								.label=${this.local('common.languages')}
								.metadataKey=${'languages'}
								.filterInfo=${this.languages().map(
									(locale) => ({ key: locale, value: `${this.languageName(locale)} (${locale})` }))}
							></in-filter-group>
						</li>
					</ul>
				</div>`
			: html``;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-filter-tree': InFilterTree,
	}
}
