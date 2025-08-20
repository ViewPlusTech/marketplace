
import {
	HeElement, customElement, html, css, HTMLTemplateResult, CSSResult,
	ref, createRef,
	property,
} from '@elemental/helium';

import { local } from '@inclusio/base';
import { type InFilterTree, type InFilter } from '.';


export interface FilterInfo {
	key: string;
	value: string;
}

@customElement('in-filter-group')
/**
 * Group of filter toggles.
 */
export class InFilterGroup extends local(HeElement) {
	@property({ type: Boolean }) open = false;
	@property({ type: Boolean }) sort = false;
	filterTree: InFilterTree;
	index: number;
	label: string;
	metadataKey: string;
	filterInfo: FilterInfo[];
	@property({ attribute: false }) selectedFilters: Set<string>;
	@property({ attribute: false }) canFocus = false;
	protected _deetsRef = createRef<HTMLDetailsElement>();
	protected _summaryRef = createRef<HTMLElement>();
	protected _filterRefs: ReturnType<typeof createRef<InFilter>>[] = [];
	protected _isFocusLossInternal = false;

	/**
	 * All filters in this group.
	 */
	get filters() {
		return this._filterRefs.map((fr) => fr.value!);
	}

	/**
	 * Number of filters.
	 */
	get numFilters() {
		return this._filterRefs.length;
	}

	/**
	 * Connect to app's server instance on DOM connect
	 */
	async connectedCallback(): Promise<void> {
		super.connectedCallback();
		this.canFocus = ! this.index;
	}

	/**
	 * Disonnect from DOM
	 */
	disconnectedCallback(): void {
		super.disconnectedCallback();
	}

	/**
	 * Focus this group.
	 */
	focus() {
		this.canFocus = true;
		this._isFocusLossInternal = false;
		this._summaryRef.value!.focus();
	}

	/**
	 * Focus a particular filter in this group.
	 */
	focusFilter(index: number) {
		this.canFocus = false;
		this._isFocusLossInternal = true;
		this._filterRefs.at(index)!.value!.focus();
	}

	/**
	 * Focus a particular filter group, or specific filter within it.
	 */
	focusGroup(index: number, filterIndex?: number) {
		this.canFocus = false;
		this._isFocusLossInternal = true;
		const group = this.filterTree.groups.at(index)!;
		if (filterIndex !== undefined) {
			group.focusFilter(filterIndex);
		}
		else {
			group.focus();
		}
	}

	/**
	 * Move focus to the next filter group.
	 */
	focusNextGroup() {
		this.focusGroup(this.index + 1);
	}

	/**
	 * Move focus to the previous filter group.
	 */
	focusPrevGroup() {
		this.focusGroup(this.index - 1);
	}

	/** Focus the very first group. */
	focusHome() {
		this.focusGroup(0);
	}

	/**
	 * Focus either the last group, or the last filter in it,
	 * depending on whether the group is open.
	 */
	focusEnd() {
		if (this.filterTree.groups.at(-1)!.open) {
			this.focusGroup(-1, -1);
		}
		else {
			this.focusGroup(this.filterTree.groups.length - 1);
		}
	}

	/**
	 * Handle blur events.
	 */
	protected _onBlur() {
		if (! this._isFocusLossInternal) {
			const dest = this.filterTree.setReturnDestination();
			if (dest !== this) {
				this.canFocus = false;
			}
		}
	}

	/**
	 * Handle keydown events.
	 */
	protected _onKeydown(event: KeyboardEvent) {
		if (event.key.startsWith('Arrow')) {
			event.preventDefault();
			event.stopPropagation();
			if (event.key.endsWith('Left')) {
				if (this._deetsRef.value!.open) {
					this.open = false;
				}
			}
			else if (event.key.endsWith('Up')) {
				if (this.index) {
					const prevGroup = this.filterTree.groups[this.index - 1];
					if (prevGroup.open) {
						this.focusGroup(this.index - 1, -1);
					}
					else {
						this.focusPrevGroup();
					}
				}
			}
			else if (event.key.endsWith('Right')) {
				if (this._deetsRef.value!.open) {
					this.focusFilter(0);
				}
				else {
					this.open = true;
				}
			}
			else if (event.key.endsWith('Down')) {
				if (this._deetsRef.value!.open) {
					this.focusFilter(0);
				}
				else if (this.index < this.filterTree.numGroups - 1) {
					this.focusNextGroup();
				}
			}
		}
		else if ('Home' === event.key) {
			this.focusHome();
		}
		else if ('End' === event.key) {
			this.focusEnd();
		}
		else if ('Enter' === event.key) {
			event.preventDefault();
			this._deetsRef.value!.open = ! this._deetsRef.value!.open;
		}
		else if ('*' === event.key) {
			this.filterTree.groups.forEach((group): void => { group.open = true; });
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
					display: grid;
					row-gap: var(--filter-gap, 0.5rem);
					list-style-type: none;
					padding: 0 0.5rem;
				}
				li {
					line-height: 1.2rem;
				}
				details summary {
					font-weight: var(--in-font-weight-bold, 700);
				}
			`,
		];
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		let items = this.filterInfo;
		if (this.sort) {
			items = items.toSorted((a, b) => a.value.localeCompare(b.value));
		}
		return html`
			<details
				${ref(this._deetsRef)} 
				?open=${this.open}
				@toggle=${() => {
					this.open = this._deetsRef.value!.open;
				}}
				@keydown=${this._onKeydown}
			>
				<summary
					${ref(this._summaryRef)}
					role="treeitem"
					aria-expanded=${this.open ? 'true' : 'false'}
					tabindex=${this.canFocus ? '0' : '-1'}
					@blur=${this._onBlur}
					>${this.label}</summary>
				<ul
					role="group"
				>
					${items.map((info, i) => {
						this._filterRefs[i] ??= createRef();
						return html`
							<li>
								<in-filter
									${ref(this._filterRefs[i])}
									?checked=${this.selectedFilters.has(`${this.metadataKey}.${info.key}`)}
									.filterGroup=${this}
									.index=${i}
									.key=${info.key}
									.value=${info.value}
								>${info.value}</in-filter>
							</li>`;
						},
					)}
				</ul>
			</details>
		`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-filter-group': InFilterGroup,
	}
}
