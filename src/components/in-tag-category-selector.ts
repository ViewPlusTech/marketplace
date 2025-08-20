

import {
	HeElement, customElement, state, property, html, css, HTMLTemplateResult,
	CSSResult, repeat, createRef, ref,
} from '@elemental/helium';

import { local } from '@inclusio/base';
import { InTagPillElement } from './in-tag-pill';


@customElement('in-tag-category-selector')
/**
 * Inclusio page base class
 */
export class InTagCategorySelectorElement extends local(HeElement) {
	@property() category: string;
	@property() name: string;
	@property() label = '';
	@property({ type: Boolean, reflect: true }) open: boolean;
	@property({ type: Boolean, reflect: true }) disabled: boolean;
	@property({ attribute: false }) selectedTags: Set<string>;
	@state() protected _tabTargetPill = 0;
	protected _pillRefs: ReturnType<typeof createRef<InTagPillElement>>[] = [];
	protected _summaryRef = createRef<HTMLElement>();

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


	/**
	 * Processes tag pill removal
	 */
	protected async _pillRemoved(event: Event, i: number): Promise<void> {
		event.stopPropagation();

		const tag = (event.target as HTMLInputElement).value;
		this.selectedTags.delete(tag);
		this.selectedTags = new Set(this.selectedTags.values());
		// NB: _pillRefs hasn't been updated at this point
		if (0 === i) {
			if (this._pillRefs.length > 1) {
				this._focusPill(1);
			}
			else {
				this._summaryRef.value!.focus();
			}
		}
		else if (this._pillRefs.length - 1 === i) {
			this._focusPill(i - 1);
		}
		else {
			this._focusPill(i + 1);
		}
		this._sendEvent('change', [tag, false]);
	}


	/**
	 * Processes tag toggling
	 */
	protected async _tagsToggled(event: CustomEvent<[string, boolean]>): Promise<void> {
		event.stopPropagation();

		const [tag, state] = event.detail;
		if (state) {
			this.selectedTags.add(tag);
		}
		else {
			this.selectedTags.delete(tag);
		}
		this.selectedTags = new Set(this.selectedTags.values());
		this._updateTabTargetPill();
		this._sendEvent('change', [tag, state]);
	}

	protected _updateTabTargetPill() {
		const catTags = Array.from(this.selectedTags).filter((tag) => tag.startsWith(this.category));
		if (this._tabTargetPill > Math.max(catTags.length - 1, 0)) {
			this._tabTargetPill--;
		}
	}

	protected _focusPill(index: number) {
		this._pillRefs[index].value!.focus();
		this._tabTargetPill = index;
	}

	/**
	 * Handle keydown events.
	 */
	protected _onKeydown(event: KeyboardEvent) {
		if (event.key.startsWith('Arrow')) {
			event.preventDefault();
			event.stopPropagation();
			if (event.key.endsWith('Left') || event.key.endsWith('Up')) {
				this._focusPill(this._tabTargetPill > 0
					? this._tabTargetPill - 1
					: this._pillRefs.length - 1);
			}
			else if (event.key.endsWith('Right') || event.key.endsWith('Down')) {
				this._focusPill(this._tabTargetPill < this._pillRefs.length - 1
					? this._tabTargetPill + 1
					: 0);
			}
		}
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
			css`
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

				summary in-tag-pill {
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

				summary {
					display: block
				}

				:not(:host([disabled])) summary::before {
					content: "+";
					margin: 0px 0.5rem 0 0;
					width: 1rem;
					font-weight: var(--in-font-weight-bold, 700);
					font-size: var(--in-font-size-2xl, 1.5rem);
				}

				details[open] summary::before {
					content: "–" !important;
				}
			`,
		];
	}

	/**
	 * Render tag pills
	 */
	protected _renderTagPills(): HTMLTemplateResult {
		const categoryMatches = [...this.selectedTags].filter((tag) =>
			tag.startsWith(`${this.category}.`));
		this._pillRefs = [];
		return html`
			<span
				role="toolbar"
				aria-label=${this.local('edit.tags.selected', { category: this.label })}
			>
				${categoryMatches.length
					? html`
						${repeat(categoryMatches, (tag) => tag, (tag, i) => {
							const [category, key] = tag.split('.');
							this._pillRefs[i] ??= createRef();
							return html`
								<in-tag-pill
									${ref(this._pillRefs[i])}
									?lastfocus=${this._tabTargetPill === i}
									value=${tag}
									label=${(('languages' === category)
										? `${this.languageName(key)} (${key})`
										: this.local(`content_tags.${category}.options.${key}.label`))}
									?disabled=${this.disabled}
									@change=${(e: Event) => this._pillRemoved(e, i)}
								></in-tag-pill>`;
						})}`
					: this.local('edit.tags.none_selected')
				}
			</span>`;
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		// only show tags for this category
		if (this.disabled) {
			return this._renderTagPills();
		}
		return html`
			<details ?open=${this.open}>
				<summary
					${ref(this._summaryRef)}
					aria-label=${this.label}
					@keydown=${this._onKeydown}
				>
					${this._renderTagPills()}
				</summary>
				<in-tag-selector
					aria-label=${this.local('edit.tags.available', { category: this.label })}
					.selectedTags=${this.selectedTags}
					category="${this.category}"
					@change="${this._tagsToggled}">
				</in-tag-selector>
			</details>`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-tag-category-selector': InTagCategorySelectorElement,
	}
}
