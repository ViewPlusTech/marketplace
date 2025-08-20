import {
	customElement, property, html, css, HTMLTemplateResult, CSSResult,
	createRef, ref,
	HeButtonStateElement,
} from '@elemental/helium';

import { local } from '@inclusio/base';


@customElement('in-tag-pill')
/**
 Toggle pill
 */
export class InTagPillElement extends local(HeButtonStateElement) {
	@property({ attribute: 'tag-type' }) tagType: string;
	@property({ type: Boolean }) lastFocus = false;
	@property() label = '';
	protected _buttonRef = createRef<HTMLButtonElement>();

	focus() {
		this._buttonRef.value!.focus();
	}

	/**
	 * Handle click
	 */
	protected _onClick(event: Event) {
		event.stopPropagation();
		this.checked = (! this.checked);
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...HeButtonStateElement.styles,
			css`
				:host {
					--corner-radius: var(--he-corner-radius, calc(1em + var(--padding-block)));
					--padding-block: var(--he-padding-block, 0.1em);
					--padding-inline: var(--he-padding-inline, 0.35em);
					--padding-inline-label: var(--he-padding-inline-label, 0.35em);
					--close-button-color: crimson;

					display: inline-grid;
					cursor: pointer;
					overflow: visible;
				}
				:focus {
					outline: none;
				}

				label {
					display: block;
					padding: var(--padding-block) var(--padding-inline-label);
				}

				::slotted(*),
				slot span {
					display: inline-block;
					margin: 0 .5em 0 0;
				}

				div:focus-visible {
					box-shadow: 0 0 0 var(--shadow-color), 0 0 5px var(--focus-color);
				}


				div {
					display: grid;
					grid-template-columns: auto 1fr auto;
					margin: 0;
					padding: 0;
					border: none;
					font-size: var(--font-size);
					cursor: inherit;
					color: var(--off-color);
					background: var(--off-background);
					border-radius: var(--corner-radius);
					box-shadow: var(--depth) var(--depth) calc(var(--depth) * 2) var(--shadow-color), 0 0 0 var(--focus-color);
					transition: background-color .25s, box-shadow .25s;
				}
				div::-moz-focus-inner {
					border: none;
				}


				div {
					color: var(--on-color);
					background: var(--on-background);
				}
				:host([disabled]) {
					cursor: auto;
				}

				div > span,
				button {
					display: inline-grid;
					place-content: center;
					height: 100%;
					margin: 0;
					padding: 0 0 0 var(--padding-inline);
				}

				button {
					-moz-appearance: none;
					-webkit-appearance: none;
					appearance: none;
					border: none;
					width: 1.5em;
					color: var(--on-color);
					background: none;
					border-top-right-radius: var(--corner-radius);
					border-bottom-right-radius: var(--corner-radius);
					padding: 0 var(--padding-inline) 0 var(--padding-inline-label);
				}

				button:hover,
				button:focus {
					background-color: var(--close-button-color);
				}

				button:active {
					box-shadow: 0 0 0 var(--shadow-color), 0 0 0 var(--focus-color);
					background: var(--close-button-color);
				}

				button:active {
					background-color: purple;
				}


				/* icons */
				svg {
					width: 0.5em;
					height: 0.5em;
					pointer-events: none;
				}

				button svg {
					width: 0.6em;
					height: 0.6em;
				}

				path {
					fill: none;
					stroke: var(--on-color);
					stroke-width: 8px;
					stroke-linecap: round;
				}

				svg#tag-icon {
					width: 0.7em;
					height: 0.7em;
				}

				svg#tag-icon path {
					fill: var(--on-color);
					stroke: none;
				}

				svg#language-icon {
					width: 0.7em;
					height: 0.7em;
				}

				svg#language-icon path {
					fill: none;
					stroke: var(--on-color);
					stroke-width: 2px;
				}

				/* in case of no icon */
				#icon span {
					width: 0;
					height: 0.7em;
				}

				.visually_hidden {
					clip: rect(0 0 0 0);
					clip-path: inset(50%);
					height: 1px;
					overflow: hidden;
					position: absolute;
					white-space: nowrap;
					width: 1px;
				}
			`,
		];
	}


	/**
	 * Render icon
	 */
	protected _renderIcon(): HTMLTemplateResult {
		if (this.tagType) {
			if ('tag' === this.tagType) {
				return html`<svg id="tag-icon" viewBox="0 0 32 32" aria-hidden="true">
					<title>tag</title>
					<path d="M26.8,11 V28 Q26.7,32.4 22.2,32.5 H9.8 Q5.3,32.4 5.2,28 V11
						Q5.2,10 5.95,8.9 L14.7,0 Q16,-0.7 17.3,0 L26.2,8.9 Q26.8,10 26.8,11 Z
						M16,7.2 A1,1 0 0,0 16,11.5 A1,1 0 0,0 16,7.2 Z"
						transform="translate(-2.5,-2.5) rotate(-45, 16, 16)"/>
				</svg>`;
			}
			else if ('language' === this.tagType) {
				return html`<svg id="language-icon" viewBox="0 0 32 32" aria-hidden="true">
					<title>language</title>
					<path d="M16,1.7 A1,1 0 0,0 16,30.3 A1,1 0 0,0 16,1.7 Z
						A0.5,1 0 0,0 16,30.3 A0.5,1 0 0,0 16,1.7Z V30.3 M1.7,16 H30.3"/>
				</svg>`;
			}
		}

		return html`<span></span>`;
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		return html`
			<div>
				<span id="icon">
					${this._renderIcon()}
				</span>

				<label id="pill-label" aria-hidden="true">
					<span class="visually_hidden">${this.tagType} </span>
					<span>${this.label}</span>
				</label>

				${((! this.disabled)
					? html`
						<button
							${ref(this._buttonRef)}
							role="checkbox"
							aria-checked="true"
							aria-labelledby="pill-label"
							data-tag="${this.value}"
							tabindex=${this.lastFocus ? 0 : -1}
							@click=${this._onClick}
						>
							<svg viewBox="0 0 32 32" aria-hidden="true">
								<title>remove</title>
								<path d="M4,4 28,28 M4,28 28,4"/>
							</svg>
						</button>`
					: html`<svg></svg>`)
				}
			</div>`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-tag-pill': InTagPillElement, // eslint-disable-line @typescript-eslint/naming-convention
	}
}
