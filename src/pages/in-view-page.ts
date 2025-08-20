
import {
	customElement, html, HTMLTemplateResult, css, CSSResult,
} from '@elemental/helium';

import { InPage } from '@inclusio/base';

import { RemoteWebError } from '@elemental/remote-web-object';


@customElement('in-view-page')
/**
 * Inclusio view page
 */
export class InViewPage extends InPage {
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
		this.app.activePageName = 'view';

		console.log('DOCUMENT VIEW');
	}

	/**
	 * Log in
	 */
	async login(event: Event): Promise<void> {
		event.preventDefault();
		// console.log(event);

		const usernameInput = this._findChild('username');
		const username = (usernameInput as HTMLInputElement)?.value;

		const passwordInput = this._findChild('password');
		const password = (passwordInput as HTMLInputElement)?.value;

		try {
			// console.log(username, password);

			// login(username: string, password: string, options?: CallOptions): Promise<AccountInfo>;

			const accountInfo = await this.server.login(username, password);
			this.app.beginSession(accountInfo);
			this.app.routeTo('/');
		}
		catch (error) {
			console.log(`login error: ${error}`);

			const status = (error as RemoteWebError).status;
			console.log(`status code: ${status}`);

			const statusMessage = this.local(`app.response_codes.${status}`);
			console.log(`email statusMessage: ${statusMessage}`);
			this.updateStatus(statusMessage);
		}
	}


	/**
	 * Update status
	 */
	async updateStatus(message: string): Promise<void> {
		const statusMessageEl = this._findChild('status_message');
		statusMessageEl?.append(message);
	}


	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...InPage.styles,
			css`
				.container {
					width: 80%;
					max-width: 1200px;
					margin: 0 auto;
				}

				.container * {
					box-sizing: border-box;
				}

				.flex-outer,
				.flex-inner {
					list-style-type: none;
					padding: 0;
				}

				.flex-outer {
					max-width: 40rem;
					margin: 0 auto;
				}

				.flex-outer div,
				.flex-inner {
					display: flex;
					flex-wrap: wrap;
					align-items: center;
				}

				.flex-inner {
					padding: 0 8px;
					justify-content: space-between;
				}

				.flex-outer > div:not(:last-child) {
					margin-bottom: 20px;
				}

				.flex-outer div label,
				.flex-outer div legend {
					padding: 8px;
					text-transform: uppercase;
				}

				.flex-outer > div > label,
				.flex-outer div p {
					flex: 1 0 120px;
					max-width: 220px;
				}

				.flex-outer > div > label + *,
				.flex-inner {
					flex: 1 0 220px;
				}

				.flex-outer div p {
					margin: 0;
				}

				.flex-outer div input:not([type='checkbox']),
				.flex-outer div textarea {
					padding: 15px;
					border: none;
				}

				.flex-outer div button {
					margin-left: auto;
					padding: 8px 16px;
					border: 2px solid var(--text-accent-color);
					background: var(--active-menu-item);
					color: var(--main-color);
					text-transform: uppercase;
					letter-spacing: .09em;
					border-radius: 2px;
				}

				input {
					background: var(--text-accent-color);
					color: var(--active-menu-item);
				}

				#at-used label {
					text-transform: none;
				}

				#at-used .flex-outer > div > label + *,
				#at-used .flex-inner {
					flex: 1 0 120px;
					/* max-width: 320px; */
				}

				.flex-inner div {
					width: 100px;
				}

				fieldset {
					margin: 0;
					padding: 0;
					border: none;
				}


				/* a11y content */


				#content--password-val-info,
				#content--password-mem {
					display: none;
				}

				#content--password-mem {
					width: 50%;
					margin: 0 auto;
				}
				@media screen and (max-width: 1024px) and (orientation: portrait) {
					#content--password-mem {
						width: 90%;
					}
				}

				.content--validation {
					padding: 4em 0;
				}

				.content--validation ul li {
					padding: 1em 0 1em 1em;
					list-style-type: none;
				}

				@media screen and (max-width: 1024px) and (orientation: portrait) {
					.content--validation {
						margin: 1em;
						padding: 2em 0;
					}
				}

				input {
					font: "Fira Sans", "Helvetica Neue", sans-serif !important;
				}

				.hidden {
					display: none;
				}


				/* Content area */

				#dashboard {
					padding: 0 2rem;
					color: var(--main-color);
				}

			`,
		];
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		return html`
		<!--
			<p>${this.local('login.debug_message')}</p>
			-->
			<main>
				<section id="content-container">
					<div class="container">
						<form id="login_form">
							<section class="flex-outer">
								<div>
									<label for="username">${this.local('login.label.username')}</label>
									<input id="username" name="username" type="text" class="" size="30"
										minlength="3"
										required="true" aria-required="true"
										focusable="true" tabindex="0">
								</div>
								<div>
									<label for="password">${this.local('login.label.password')}</label>
									<input id="password" name="password" type="password" class="" size="30"
										minlength="8"
										required="true" aria-required="true"
										focusable="true" tabindex="0">
								</div>

								<div class="flex-inner">
									<in-button id="login_button"
										focusable="true" tabindex="0"
										@click="${this.login}">${this.local('login.button.login')}</in-button>

									<!--
									<button id="forgot_password_button"
										focusable="true" tabindex="0"
										@click="${this.login}">${this.local('login.button.forgot_password')}</button>
									<button id="forgot_username_button"
										focusable="true" tabindex="0"
										@click="${this.login}">${this.local('login.button.forgot_username')}</button>
									-->
								</div>
							</section>
						</form>

						<p id="status_message"></p>

					</div>
				</section>
			</main>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-view-page': InViewPage,
	}
}
