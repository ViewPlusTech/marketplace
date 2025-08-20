
import {
	HePanelElement, HeSpeakElement,
	customElement, html, css, HTMLTemplateResult, CSSResult, ref, createRef, property,
} from '@elemental/helium';

import { InAppElement } from '@inclusio/base';

import clientVersion from './version.json';

import './components/index';


export const Themes = [ // eslint-disable-line @typescript-eslint/naming-convention
	'normal',
	'light',
	'dark',
] as const;
export type Theme = typeof Themes[number];

@customElement('in-marketplace-app')
/**
 * Inclusio App class
 */
export class InMarketplaceAppElement extends InAppElement {
	@property({ type: String, reflect: true }) theme: Theme = 'normal';

	protected _pageTitleRef = createRef<HTMLHeadingElement>();
	protected _speakRef = createRef<HeSpeakElement>();

	/**
	 * Constructor
	 */
	constructor() {
		super();
		this.version = clientVersion;
	}

	/**
	 * Initial setup
	 */
	protected _setup(): void {
		super._setup();
	}

	/**
	 * Get announcement message
	 */
	get announcementMsg(): string {
		return super.announcementMsg;
	}

	/**
	 * Set announcement message
	 */
	set announcementMsg(message: string) {
		super.announcementMsg = message;
		this._speakRef.value!.announce(message);
	}

	/**
	 * Get alert message
	 */
	get alertMsg(): string {
		return super.alertMsg;
	}

	/**
	 * Set alert message
	 */
	set alertMsg(message: string) {
		super.alertMsg = message;
		this._speakRef.value!.alert(message);
	}

	/**
	 * Get active page name
	 */
	get activePageName(): string {
		return super.activePageName;
	}

	/**
	 * Set active page name
	 */
	set activePageName(name: string) {
		super.activePageName = name;
		const pageTitle = this.local(`${this.activePageName}.title`);
		document.title = `${pageTitle} – ${this.local('common.app')}`;
		this.alertMsg = `${this.local('nav.page_loaded')} ${pageTitle}`;
	}

	/**
	 * Register on DOM connect
	 */
	async connectedCallback(): Promise<void> {
		await super.connectedCallback();
	}

	/**
	 * Function to import pages
	 */
	protected async _importPage(name: string, src: string): Promise<void> {
		if (src) {
			await import(/* @vite-ignore */ src);
		}
		else {
			await import(`./pages/${name}.ts`);
		}
	}

	/**
	 * Handle route change
	 */
	protected _routeChanged(_event: CustomEvent<HePanelElement>): void {
		// console.log('>> route changed', event.detail);
	}

	/**
	 * Handle theme switch
	 */
	protected _switchTheme(event: Event): void {
		event.preventDefault();

		const currentThemeIndex = Themes.indexOf(this.theme);
		const nextThemeIndex = (currentThemeIndex + 1) % Themes.length;

		this.theme = Themes[nextThemeIndex];
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...super.styles,
			css`
				:host {
					display: grid;
					position: fixed;
					width: 100%;
					height: 100%;
					overflow: hidden;
					padding: 0;
					margin: 0;
					grid-template-rows: auto 1fr auto;
					grid-auto-flow: row;
					background: var(--main-bg);
					color: var(--main-color);
				}

				:host {
					--main-color: hsl(0, 0%, 95%);
					--accent-color: hsl(225, 27%, 30%);
					--tag-color: hsl(225, 27%, 45%);
					--text-accent-color: hsl(240, 100%, 99%);
					--active-menu-item: hsl(0, 0%, 20%);
					--inactive-menu-item: hsl(0, 0%, 50%);
					--language-tag: hsl(120, 100%, 20%);

					/* Helium Syles */
					--he-input-color: var(--in-color-black, #000);
					--he-input-disabled-color, var(--he-disabled-color));
					--he-input-background: var(--in-color-white, #fff);
					--he-message-error-color: var(--in-color-danger-500, #FF482C);
					--he-invalid-color: var(--in-color-danger-500, #FF482C);
				}

				:host,
				:host([theme='normal']) {
					--main-color: var(--in-color-brand-100, #eaecf4);
					--main-bg: var(--in-color-brand-800, #333b59);
					--header-bg: var(--in-color-brand-100, #eaecf4);
					--header-color: var(--in-color-brand-950, #1f2132);
					--footer-bg: var(--in-color-brand-900, #2e344c);

					/* Helium Styles */
					--he-background-color: var(--in-color-brand-400, #7b89b5);
					--he-shadow-color: var(--in-color-brand-900, #2e344c);

					--he-on-color: var(--main-bg);
					--he-on-background: var(--in-color-brand-50, #f5f6fa);
					--he-off-color: var(--main-bg);
					--he-off-background: var(--in-color-brand-300, #a9b2d0);

					--he-button-secondary-color: var(--in-color-brand-50, #f5f6fa);
					--he-button-secondary-background: var(--in-color-brand-950, #1f2132);

				}

				:host([theme='light']) {
					--main-color: var(--in-color-brand-950);
					--main-bg: var(--in-color-brand-100, #eaecf4);
					--header-bg: var(--in-color-brand-50, #f5f6fa);
					--header-color: var(--in-color-brand-950, #1f2132);
					--footer-bg: var(--in-color-brand-200, #d1d6e6);

					/* Helium Styles */
					--he-background-color: var(--in-color-brand-200, #d1d6e6);

					--he-on-color: var(--main-color);
					--he-on-background: var(--in-color-brand-50, #f5f6fa);
					--he-off-color: var(--main-color);
					--he-off-background: var(--in-color-brand-200, #d1d6e6);
				}

				:host([theme='dark']) {
					--main-color: var(--in-color-brand-100, #eaecf4);
					--main-bg: var(--in-color-brand-950, #1f2132);
					--header-bg: var(--in-color-mat, #282727);
					--header-color: var(--in-color-brand-50, #f5f6fa);
					--footer-bg: var(--in-color-brand-900, #2e344c);

					/* Helium Styles */
					--he-background-color: var(--in-color-brand-400, #7b89b5);
					--he-shadow-color: var(--in-color-brand-500, #546392);

					--he-on-color: var(--main-bg);
					--he-on-background: var(--in-color-brand-50, #f5f6fa);
					--he-off-color: var(--main-bg);
					--he-off-background: var(--in-color-brand-800. #333b59);
				}

				* {
					box-sizing: border-box;
				}

				/* header */
				header {
					display: grid;
					grid-template-columns: auto 1fr auto;
					align-items: center;
					background: var(--header-bg);
					padding: 0 1rem;
				}

				header a.logotype {
					display: grid;
					grid-template-columns: auto 1fr;
					align-items: center;
					justify-content: start;
					text-decoration: none;
				}

				.logotype p {
					font-family: "Century Gothic", CenturyGothic, AppleGothic, sans-serif;
					letter-spacing: 0.1rem;
					text-transform: lowercase;
					font-size: 2.5rem;
					color: var(--header-color);
					margin: 0;
				}

				header img.logo {
					height: 73px;
					margin-right: .75rem;
				}

				#login-reg-links {
					display: grid;
					row-gap: 0.5rem;
					padding: 0.5rem 0.5rem 0 0;
					margin: 0;
					justify-self: end;
					text-align: center;
				}
				#login-reg-links li {
					color: var(--header-color);
					list-style-type: none;
				}
				#login-reg-links a:visited {
					color: var(--inactive-menu-item);
				}

				in-user-icon-menu {
					justify-self: end;
				}

				he-router {
					overflow-y: scroll;
				}

				h1 {
					color: var(--header-color);
					padding: 0;
					margin: 0;
					text-align: center;
					outline: none;
				}

				footer {
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: var(--footer-bg);
					color: var(--main-color);
					text-align: center;
				}

				footer .btn-app-switcher {
					background-color: none;
					border: 1px solid var(--in-color-white, #fff);
					cursor: pointer;
					margin-left: var(--in-spacing-sm, 0.5rem);
					text-transform: capitalize;
				}

				/* Shrinking Header*/
				:host {
					--header-outer-height: 11rem;
					--header-outer-height: 10rem;
					--header-inner-height: 8rem;
					--header-height-difference: calc(var(--header-outer-height) - var(--header-inner-height));
				}
			`,
		];
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		return html`
			<header class="header-outer">
				<!-- <div class="page-header header-inner"> -->
					<a href="/" class="logotype">
						<img class="logo" src="/assets/images/inclusio-logo.svg" alt="Inclusio logo">
						<p>Inclusio</p>
					</a>

					<h1 ${ref(this._pageTitleRef)} tabindex="-1">${this.local(`${this.activePageName}.title`)}</h1>

					${this.loggedIn
						? html`<in-user-icon-menu
							icon="/assets/icons/user-icon.svg"></in-user-icon-menu>`
						: html`
							<ul id="login-reg-links">
								<li>
									<a href="/login/">${this.local('nav.login')}</a>
								</li>
								<li>
									<a href="/register/">${this.local('nav.register')}</a>
								</li>
							</ul>`
					}

				<!-- <div> -->
			</header>
			<he-router ${ref(this._routerRef)}
				.importer=${this._importPage} @route-changed=${this._routeChanged}
			>
				<he-route url="/" panel="in-browse-page"></he-route>
				<he-route url="/login/" panel="in-login-page"></he-route>
				<he-route url="/register/" panel="in-register-page"></he-route> -->
				<he-route url="/search/" panel="in-search-page"></he-route>
				<he-route url="/edit/:docPath/:ownerId/" panel="in-edit-page"></he-route>
				<he-route url="/view/:docPath/:ownerId/" panel="in-edit-page"></he-route>
				<he-route url="/from_data/" panel="in-from-data-page"></he-route>
				<he-route
					url="/jim-editor/:docPath/:ownerId/"
					panel="jim-editor-wrapper"
					src="https://jim-editor-wrapper-oyz3ip6fka-uc.a.run.app/jim-editor-wrapper.js"
				/>
				<!-- <he-route url="/account" panel="in-account-page"></he-route> -->
				<!-- <he-route url="/tags" panel="in-tag-edit-page"></he-route> -->
			</he-router>
			<footer>
				<p>${this.local('app.client_version', { version: this.version })}</p>
				<button class="btn-app-switcher" @click=${(event: MouseEvent): void => { this._switchTheme(event); }}>
					${this.local('app.button.current_theme', { theme: this.theme })}
				</button>
			</footer>
			<he-speak ${ref(this._speakRef)}></he-speak>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-marketplace-app': InMarketplaceAppElement,
	}
}
