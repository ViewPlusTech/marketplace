
import {
	HeElement, customElement, property, html, css, HTMLTemplateResult, CSSResult,
	createRef, ref, state,
} from '@elemental/helium';

import { local } from '@inclusio/base';


@customElement('in-user-icon-menu')
/**
 * Inclusio page base class
 */
export class InUserIconMenuElement extends local(HeElement) {
	@property() icon: string = '';
	@state() protected _expanded = false;
	protected _buttonRef = createRef<HTMLButtonElement>();
	protected _ulRef = createRef<HTMLElement>();

	protected _onButtonClick() {
		this._expanded = ! this._expanded;
	}

	protected _onLinkClick() {
		this._expanded = false;
		this._buttonRef.value!.focus();
	}

	protected _onPointerLeave() {
		this._expanded = false;
	}

	/**
	 * Logout
	 */
	private async _logout(event: Event): Promise<void> {
		event.preventDefault();

		try {
		  await window.app.endSession();
		  window.app.routeTo('/login');
		}
		catch (error) {
		  console.error('Logout failed:', error);
		}
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
			css`
				:host {
					z-index: 1000;
				}

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

				img.user-icon {
					display: block;
					width: var(--in-icon-size-md);
				}

				ul {
					position: absolute;
					right: var(--in-spacing-md);
					display: block;
					background-color: var(--in-color-brand-50);
					border: 1px solid var(--in-color-white);
					border-radius: var(--in-border-radius-md);
					box-shadow: 0 0 4px var(--in-color-brand-900);
					list-style: none;
					min-width: 5rem;
					padding: 0;
				}

				li a {
					display: block;
					color: var(--in-color-brand-900);
					cursor: pointer;
					padding: var(--in-spacing-md);
					text-decoration: none;
					white-space: nowrap;
				}

				li a:hover,
				li a:focus {
					color: var(--in-color-black);
					background-color: var(--in-color-brand-100);
					border-radius: var(--in-border-radius-md);
					outline: none;
				}
			`,
		];
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		const links = {
			['']: 'dashboard',
			search: 'search',
			edit: 'create',
			from_data: 'from_data',
			account: 'account',
			settings: 'settings',
		};
		return html`
			<nav>
				<button
					${ref(this._buttonRef)}
					aria-expanded=${this._expanded}
					@click=${this._onButtonClick}
				>
					<img class="user-icon" src="${this.icon}" alt="">
					<span class="sr-only">${this.local('nav.label')}</span>
				</button>
				<ul
					${ref(this._ulRef)}
					?hidden=${! this._expanded}
					@pointerleave=${this._onPointerLeave}
				>
					${Object.entries(links).map(([k, v]) => html`
						<li>
							<a
								href="/${k}"
								@click=${this._onLinkClick}
							>
								${this.local(`nav.${v}`)}
							</a>
						</li>
					`)}
					<li>
						<a
							tabindex="0"
							role="button"
							@click="${this._logout}"
						>
							${this.local('nav.logout')}
						</a>
					</li>
				</ul>
			</nav>
		`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-user-icon-menu': InUserIconMenuElement,
	}
}
