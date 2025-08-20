
import {
	HeElement, customElement, property, html, css, HTMLTemplateResult, CSSResult,
	state, createRef, ref,
	HeButtonToggleElement,
} from '@elemental/helium';

import { local } from '@inclusio/base';
import { MetadataDefinition } from '@inclusio/documents';

@customElement('in-tag-selector')
/**
 * Inclusio page base class
 */
export class InTagSelectorElement extends local(HeElement) {
	@property() category: string;
	@property({ attribute: false }) selectedTags: Set<string>;
	@state() protected _tabTargetToggle = 0;
	protected _toggleRefs: ReturnType<typeof createRef<HeButtonToggleElement>>[] = [];

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
	 * Processes key input to get search commands
	 */
	protected async _toggleTag(event: Event): Promise<void> {
		event.stopPropagation();

		const tagCheckbox = ((event?.target) as HTMLInputElement);
		const tag = (tagCheckbox.value as string);

		this._sendEvent('change', [tag, tagCheckbox.checked]);
	}

	protected _focusToggle(index: number) {
		this._toggleRefs.at(index)!.value!.focus();
		this._tabTargetToggle = index;
	}

	/**
	 * Handle keydown events.
	 */
	protected _onKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') {
			// prevent scrolling
			event.preventDefault();
			event.stopPropagation();
		}
		if (event.key.startsWith('Arrow')) {
			if (event.key.endsWith('Left') || event.key.endsWith('Up')) {
				if (this._tabTargetToggle > 0) {
					this._focusToggle(this._tabTargetToggle - 1);
				}
			}
			else if (event.key.endsWith('Right') || event.key.endsWith('Down')) {
				if (this._tabTargetToggle < this._toggleRefs.length - 1) {
					this._focusToggle(this._tabTargetToggle + 1);
				}
			}
		}
		else if ('Home' === event.key) {
			this._focusToggle(0);
			window.app.alertMsg = this.local('search.on_first_card');
		}
		else if ('End' === event.key) {
			this._focusToggle(-1);
			window.app.alertMsg = this.local('search.on_last_card');
		}
		else if ('Enter' === event.key || ' ' === event.key) {
			this._toggleRefs[this._tabTargetToggle].value!.click();
		}
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
			css`

				/* Tag list*/

				ul {
					list-style-type: none;
					padding: 0 1rem;
				}


				ul li he-button-state {
					margin-right: 0.5rem;
				}

				ul {
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					justify-content: flex-start;
					align-items: center;
					gap: 0.5rem;
				}

				he-toggle {
					--control-margin-inline: 0;
				}
			`,
		];
	}

	/**
	 * Render tag checkbox
	 */
	protected _renderTagToggle(topicKey: string, optionKey: string, optionValue: string, i: number) {
		const key = `${topicKey}.${optionKey}`;
		this._toggleRefs[i] ??= createRef();
		return html`
			<li>
				<he-button-toggle
					${ref(this._toggleRefs[i])}
					value="${key}"
					role="option"
					.tabIndex=${this._tabTargetToggle === i ? 0 : -1}
					?checked=${this.selectedTags.has(key)}
					@change="${this._toggleTag}"
				>
					${optionValue}
				</he-button-toggle>
			</li>
		`;
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		if ('languages' === this.category) {
			return html`
				<ul
					role="listbox"
					@keydown=${this._onKeydown}
				>
					${this.languages().map((locale, i) =>
						this._renderTagToggle(this.category, locale, `${this.languageName(locale)} (${locale})`, i),
					)}
				</ul>
			`;
		}

		const key = `content_tags.${this.category}`;
		const categoryTags = (this.localMessage(key) || {}) as unknown as MetadataDefinition;
		this._toggleRefs = [];
		return html`${Object.keys(categoryTags).length
			? html`
				<ul
					role="listbox"
					@keydown=${this._onKeydown}
				>
					${Object.entries(categoryTags.options).map(([optionKey, optionValue], i) =>
						this._renderTagToggle(this.category, optionKey, optionValue.label, i),
					)}
				</ul>`
			: html`<p>${this.local('edit.tags.none_available')}</p>`
		}`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-tag-selector': InTagSelectorElement,
	}
}
