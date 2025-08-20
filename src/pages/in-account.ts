
import {
	customElement, html, css, state, HTMLTemplateResult, CSSResult,
} from '@elemental/helium';
import { InPage } from '@inclusio/base';
import { Reservation } from '@inclusio/server';

import { RemoteWebError } from '@elemental/remote-web-object';


// interface IndexLookup {
// [key: string]: string
// }

@customElement('in-account-page')
/**
 * Inclusio account page
 */
export class InAccountPage extends InPage {
	@state() protected _pageStatus = '';

	usernameReservations: Map<string, Reservation> = new Map();
	emailReservations: Map<string, Reservation> = new Map();
	fullname = '';
	username = '';
	email = '';
	password = '';


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

		if (! this.app.loggedIn) {
			this.app.routeTo('/login');
			return;
		}

		this.app.activePageName = 'account';

		// console.log('REGISTER PAGE');
	}


	/**
	 * Validates the email against the server
	 */
	async validateEmail(event: Event): Promise<void> {
		const emailInput = event.target as HTMLInputElement;
		emailInput.classList.remove('initial');

		this.email = emailInput?.value;
		// console.log(this.emailReservations);

		let reservation = this.emailReservations.get(this.email);
		try {
			reservation = await this.server.reserveEmail(this.email, reservation?.token);
			this.emailReservations.set(this.email, reservation as Reservation);
			// console.log(reservation);
			// console.log(this.emailReservations);
		}
		catch (error) {
			console.log(`validateEmail: ${error}`);

			const status = (error as RemoteWebError).status;
			const statusMessage = this.local(`app.response_codes.${status}`);
			emailInput.setCustomValidity(statusMessage);
			this.reportFormValidity();

			console.log(`email statusMessage: ${statusMessage}`);
		}
	}


	/**
	 * Validates the username against the server
	 */
	async validateUsername(event: Event): Promise<void> {
		const usernameInput = event.target as HTMLInputElement;
		usernameInput.classList.remove('initial');

		this.username = usernameInput?.value;
		// console.log(this.usernameReservations);

		let reservation = this.usernameReservations.get(this.username);
		try {
			reservation = await this.server.reserveUsername(this.username, reservation?.token);
			this.usernameReservations.set(this.username, reservation as Reservation);
			// console.log(reservation);
			// console.log(this.usernameReservations);

			if (! reservation) {
				usernameInput.setCustomValidity('Invalid username');
				// this.reportFormValidity();
			}
			else {
				usernameInput.setCustomValidity('');
			}
		}
		catch (error) {
			console.log(`validateUsername: ${error}`);

			const status = (error as RemoteWebError).status;
			const statusMessage = this.local(`app.response_codes.${status}`);
			usernameInput.setCustomValidity(statusMessage);
			this.reportFormValidity();

			console.log(`username statusMessage: ${statusMessage}`);
		}
	}


	/**
	 * Validate password with server
	 */
	async validatePassword(event: Event): Promise<void> {
		const passwordInput = event.target as HTMLInputElement;
		passwordInput.classList.remove('initial');

		this.password = passwordInput?.value;

		try {
			const pwnCount = await this.server.passwordPwned(this.password);
			if (0 === pwnCount) {
				// TODO: show validation checkmark
				// TODO: enable register button
			}
			else {
				// TODO: message
				console.log(`This password has appeared ${pwnCount} in online data breaches. Please choose another password.`);
			}
		}
		catch (error) {
			console.log(`validatePassword: ${error}`);

			const status = (error as RemoteWebError).status;
			const statusMessage = this.local(`app.response_codes.${status}`);
			passwordInput.setCustomValidity(statusMessage);
			this.reportFormValidity();

			console.log(`password statusMessage: ${statusMessage}`);
		}
	}

	/**
	 * Trigger browser form validity checking
	 */
	reportFormValidity(): void {
		const registrationForm = this._findChild('registration');
		(registrationForm as HTMLFormElement)?.reportValidity();
	}


	/**
	 * Attempts to register user
	 */
	async registerUser(event: Event): Promise<void> {
		event.preventDefault();

		const nameInput = this._findChild('full-name');
		this.fullname = (nameInput as HTMLInputElement)?.value;

		const usernameReservation = this.usernameReservations.get(this.username);
		if (! usernameReservation) {
			console.log('usernameReservation error');
			return;
		}

		const emailReservation = this.emailReservations.get(this.email);
		if (! emailReservation) {
			console.log('emailReservation error');
			return;
		}

		try {
			// console.log(this.username, this.password, this.email, this.fullname, usernameReservation.token, emailReservation.token);

			const accountInfo = await this.server.register(this.username, this.password, this.email, this.fullname,
				usernameReservation.token, emailReservation.token);
			await this.app.beginSession(accountInfo);
			this.app.routeBack();
		}
		catch (error) {
			console.log(`register error: ${error}`);

			const status = (error as RemoteWebError).status;

			const statusMessage = this.local(`app.response_codes.${status}`);
			console.log(`email statusMessage: ${statusMessage}`);
			// this.updateStatus(statusMessage);
			this._pageStatus = statusMessage;
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
					letter-spacing: .09em;
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
					font: "Fira Sans", "Helvetica Neue", sans-serif ! important;
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
		<main>

			<section id="content-container">

				<div class="container">
					<form id="registration">
						<section class="flex-outer">
							<div>
								<label for="full-name">${this.local('register.label.full_name')}</label>
								<input type="text" id="full-name" class="initial"
									placeholder="${this.local('register.placeholder.full_name')}"
									required="true" aria-required="true"
									focusable="true" tabindex="0">
							</div>
							<div>
								<label for="email">Email:</label>
								<input type="email" id="email" class="initial"
									placeholder="${this.local('register.placeholder.email')}"
									required="true" aria-required="true"
									focusable="true" tabindex="0"
									@change="${this.validateEmail}">
							</div>

							<section class="flex-outer">
								<div>
									<label for="username">${this.local('register.label.username')}</label>
									<input id="username" name="username" type="text" class="" size="30"
										minlength="3"
										required="true" aria-required="true"
										focusable="true" tabindex="0"
										@change="${this.validateUsername}">
								</div>
								<div>
									<label for="password">${this.local('register.label.password')}</label>
									<input id="password" name="password" type="password" class="" size="30"
										minlength="8"
										required="true" aria-required="true"
										focusable="true" tabindex="0"
										@change="${this.validatePassword}">
								</div>

								<div class="flex-inner">
									<in-button id="register_button"
										focusable="true" tabindex="0"
										@click="${this.registerUser}">${this.local('register.button.register')}</in-button>
								</div>
							</section>
						</section>
					</form>
					<p id="status_message">${this.local(this._pageStatus)}</p>
				</div>
			</section>
		</main>
		`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-account-page': InAccountPage,
	}
}
