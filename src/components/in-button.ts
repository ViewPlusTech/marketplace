import {
	css,
	CSSResult,
	classMap,
	customElement,
	HeElement,
	html,
	HTMLTemplateResult,
	property,
	createRef,
	ref,
	nothing,
	PropertyValues,
	state,
} from '@elemental/helium';
import { local } from '@inclusio/base';

@customElement('in-button')
/**
 * InButtonElement
 *
 * A custom button component that encapsulates styling and variants
 * while leveraging the native `<button>` element's behavior.
 */
export class InButtonElement extends local(HeElement) {
	@property({ type: Boolean, reflect: true }) disabled = false;
	@property({ type: String }) text?: string;
	@property({ type: String }) variant:
		| 'default'
		| 'primary'
		| 'outline'
		| 'brand'
		| 'naked' = 'default';
	@property({ type: Boolean }) wide = false;
	@property({ type: Number }) tabIndex = 0;
	@property({ attribute: 'aria-label' }) ariaLabel: string | null = null;
	protected _buttonRef = createRef<HTMLButtonElement>();
	@state() protected _tabIndex = 0;
	@state() protected _ariaLabel: string | null = null;

	/** Stylesheet */
	static get styles(): CSSResult[] {
		return [
			css`
				:host {
					--in-btn-bg-color: var(--in-color-brand-950, #1f2132);
					--in-btn-border-color: var(--in-color-brand-300, #a9b2d0);
					--in-btn-border-radius: var(--in-border-radius-pill-md, 50px);
					--in-btn-color: var(--in-color-brand-50, #f5f6fa);
					--in-btn-padding: 0.625rem 1.25rem;
				}

				button {
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: var(--in-btn-border-radius);
					border: 2.5px solid var(--in-btn-border-color);
					color: var(--in-btn-color);
					cursor: pointer;
					font-size: var(--in-font-size-md, 1rem);
					font-weight: var(--in-font-weight-bold, 700);
					line-height: 1.5;
					min-height: var(--in-spacing-xl, 2.5rem);
					padding: var(--in-btn-padding);
					transition: background-color 0.3s ease, border-color 0.3s ease,
						box-shadow 0.3s ease;
					text-align: center;
				}

				button:hover {
					color: var(--in-color-white, #ffffff);
					cursor: pointer;
				}

				/* Variants */
				.default,
				button:not([class]) {
					background-color: var(--in-btn-bg-color);
				}

				.default:hover,
				button:not([class]):hover {
					background-color: var(--in-color-black, #1f2132);
				}

				.brand {
					background-color: var(--in-color-brand-400, #7b89b5);
					border-color: var(--in-color-brand-600, #475482);
				}

				.brand:hover {
					background-color: var(--in-color-brand-500, #546392);
				}

				.naked {
					background: none;
					color: inherit;
					border: none;
					padding: 0;
				}

				.outline {
					background-color: transparent;
					border-color: var(--in-color-primary-500, #3a6fff);
					color: var(--in-color-primary-500, #3a6fff);
				}

				.outline:hover {
					background-color: var(--in-color-primary-950, #0d1b59);
					color: var(--in-color-white, #ffffff);
				}

				.primary {
					background-color: var(--in-color-primary-600, #3a6fff);
					border-color: var(--in-color-primary-500, #3a6fff);
					color: var(--in-color-white, #ffffff);
				}

				.primary:hover {
					background-color: var(--in-color-primary-700, #173ef5);
					color: var(--in-color-white, #ffffff);
				}

				/* Wide */
				button.wide {
					width: 100%;
				}

				/* Disabled */
				:host([disabled]) {
					pointer-events: none;
				}

				:host([disabled]) button {
					background-color: var(--in-color-disabled, #888);
					border-color: var(--in-color-disabled, #888);
					color: var(--in-color-white, #ffffff);
					cursor: not-allowed;
					pointer-events: none;
				}

				/* Focus */
				button:focus-visible {
					outline: var(--in-focus-ring-width, 0.25rem) solid
						var(--in-focus-ring-color, #1844ff);
					outline-offset: var(--in-focus-ring-offset, 4px);
				}
			`,
		];
	}

	/** Setup on DOM connect */
	connectedCallback(): void {
		super.connectedCallback();
	}

	willUpdate(changedProperties: PropertyValues): void {
		// Move tabindex and aria-label from the custom element to the inner button
		if (changedProperties.has('tabIndex')) {
			// Removing the observed attribute sets the property to null,
			// so we grab the value before doing that
			this._tabIndex = this.tabIndex;
			this.removeAttribute('tabindex');
		}
		if (changedProperties.has('ariaLabel')) {
			this._ariaLabel = this.ariaLabel;
			this.removeAttribute('aria-label');
		}
	}

	focus() {
		this._buttonRef.value!.focus();
	}

	/** Render */
	render(): HTMLTemplateResult {
		return html`
			<button
				${ref(this._buttonRef)}
				class=${classMap({
					[this.variant]: true,
					wide: this.wide,
				})}
				?disabled=${this.disabled}
				tabindex=${this._tabIndex}
				aria-label=${this._ariaLabel || nothing}
			>
				<slot></slot>${this.text ? html` ${this.text}` : ''}
			</button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-button': InButtonElement;
	}
}
