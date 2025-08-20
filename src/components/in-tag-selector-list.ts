
import {
	HeElement, customElement, state, html, css, HTMLTemplateResult, CSSResult,
} from '@elemental/helium';

import { local } from '@inclusio/base';
import { ContentMetadata, MetadataDefinition } from '@inclusio/documents';


@customElement('in-tag-selector-list')
/**
 * Inclusio page base class
 */
export class InTagSelectorListElement extends local(HeElement) {
	@state() tagFilters: Set<string>;

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
		const tagCheckbox = ((event?.target) as HTMLInputElement);
		const searchTag = (tagCheckbox.value as string);
		// console.log('>>>>>> searchTag:', searchTag);

		if (tagCheckbox.checked) {
			this.tagFilters.add(searchTag);
		}
		else {
			this.tagFilters.delete(searchTag);
		}

		this._sendEvent('change', searchTag);
	}


	/**
	 * Render tag checkbox
	 */
	protected _createTagCheckbox(topicKey: string, optionKey: string, optionValue: string): HTMLTemplateResult {
		const key = `${topicKey}.${optionKey}`;
		return html`<li>
			<he-button-state value="${key}"
				?checked=${this.tagFilters.has(key)}
				@change="${this._toggleTag}"
			>${optionValue}</he-button-state>
		</li>`;
	}


	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
			css`
				:host {
					--he-control-margin-inline-end: var(--in-spacing-sm)
				}

				ul.taglist {
					list-style-type: none;
					margin-top: var(--in-spacing-xs);
					padding-left: var(--in-spacing-xs);
				}

				ul.taglist ul {
					list-style-type: none;
					padding: 0 var(--in-spacing-sm);
				}

				ul.taglist ul li {
					padding: var(--in-spacing-sm) 0;
				}

				ul.taglist details summary {
					cursor: pointer;
					font-weight: var(--in-font-weight-bold, 700);
					line-height: 36px;
				}
			`,
		];
	}


	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		const searchTags = (this.localMessage('content_tags') || {}) as unknown as ContentMetadata;

		// console.log('============== this._tagFilters:', this._tagFilters);

		// this._tagFilters.forEach((tag) => console.log('>>>>>>> tag', tag));

		return html`${Object.keys(searchTags).length || this.languages().length
			? html`<ul id="tag_categories" class="taglist">
				${Object.entries(searchTags).map(([key, value]) => html`<li><details><summary>${(value as any).label}</summary><ul>
					${Object.entries(value.options as { [key: string]: MetadataDefinition }).map(
						([optionKey, optionValue]) => this._createTagCheckbox(key, optionKey, optionValue.label),
					)}
				</ul></details></li>`)}
				<li><details><summary>${this.local('common.languages')}</summary><ul>
					${this.languages().map(
						(locale) => this._createTagCheckbox('languages', locale, `${this.languageName(locale)} (${locale})`),
					)}
				</ul></details></li>
			</ul>`
			: html`<p>No search categories available</p>`
		}`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-tag-selector-list': InTagSelectorListElement,
	}
}
