
import {
	customElement, html, css, HTMLTemplateResult, CSSResult, state, ref, createRef, nothing,
	HeControlElement, HeFormElement, HeInputElement, HeInputEmailElement, HeInputPasswordElement,
} from '@elemental/helium';

import { Utils } from '@elemental/utils';

import { RemoteWebError } from '@elemental/remote-web-object';
import { InPage } from '@inclusio/base';
import { Reservation } from '@inclusio/server';

import { storeSampleDocs } from '../mock/sampleContentDocs';

@customElement('in-register-page')
/**
 * Inclusio register page
 */
export class InRegisterPage extends InPage {
	protected _usernameReservations: Map<string, (Reservation | null)> = new Map();
	protected _emailReservations: Map<string, (Reservation | null)> = new Map();
	protected _passwordPwns: Map<string, number> = new Map();
	@state() protected _error = '';

	protected _formRef = createRef<HeFormElement>();
	protected _inputUsernameRef = createRef<HeInputElement>();
	protected _inputEmailRef = createRef<HeInputEmailElement>();
	protected _inputPasswordRef = createRef<HeInputPasswordElement>();

	protected get _form(): HeFormElement {
		return this._formRef.value!;
	}

	protected get _inputUsername(): HeInputElement {
		return this._inputUsernameRef.value!;
	}

	protected get _inputEmail(): HeInputEmailElement {
		return this._inputEmailRef.value!;
	}

	protected get _inputPassword(): HeInputPasswordElement {
		return this._inputPasswordRef.value!;
	}


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
		if (this.app.loggedIn) {
			this.app.routeBack();
			return;
		}
		HeControlElement.validationMessageCallback = ((validity: ValidityStateFlags, control: HeControlElement) =>
		                                              this._localValidationMessage(validity, control));

		this.app.activePageName = 'register';
		this._reset();
	}

	async disconnectedCallback(): Promise<void> {
		HeControlElement.validationMessageCallback = null;
		for (const [username, reservation] of this._usernameReservations.entries()) {
			if (reservation) {
				await this.server.unreserveUsername(username, reservation.token);
			}
		}
		for (const [email, reservation] of this._emailReservations.entries()) {
			if (reservation) {
				await this.server.unreserveEmail(email, reservation.token);
			}
		}
		this._usernameReservations.clear();
		this._emailReservations.clear();
		this._passwordPwns.clear();
		super.disconnectedCallback();
	}

	/**
	 * Localize validation messages
	 */
	protected _localValidationMessage(validity: ValidityStateFlags, control: HeControlElement): string {
		switch (control) {
			case this._inputUsername:
				if (validity.tooShort || validity.tooLong) {
					return this.local('register.error.461', this.server.limits.username);
				}
				if (validity.patternMismatch) {
					return this.local('register.error.462');
				}
				break;

			case this._inputEmail:
				if (validity.typeMismatch) {
					return this.local('register.error.471');
				}
				break;
			case this._inputPassword:
				if (validity.tooShort) {
					return this.local('register.error.480', this.server.limits.password);
				}
				break;
		}
		return '';
	}

	/**
	 * Clear out any field values and errors.
	 */
	protected _reset() {
		this._form.reset();
		this._form.canSubmit = true;
		this._error = '';
	}

	protected _onInput(_event: Event): void {
		this._error = '';
	}

	protected _onInputEmail(event: Event): void {
		const input = (event.target as HeInputPasswordElement);
		const value = ((input.value as string) ?? '');
		if (! input.baselineValid) {
			return;
		}
		const reservation = this._emailReservations.get(value);
		if (reservation) {
			input.clearError();
		}
		else if (null === reservation) {
			input.error(this.local('register.error.470'));
		}
		else {
			input.clean();
		}
	}
	/**
	 * Validates the email against the server
	 */
	protected async _onChangeEmail(event: Event): Promise<void> {
		const input = (event.target as HeInputElement)!;
		const value = ((input.value as string) ?? '');
		if (! input.baselineValid) {
			return;
		}
		let reservation = this._emailReservations.get(value);
		try {
			reservation = await this.server.reserveEmail(value, reservation?.token);
			this._emailReservations.set(value, reservation);
			input.clearError();
		}
		catch (error) {
			const status = (error as RemoteWebError).status;
			input.error(this.local(`register.error.${status}`));
			if (470 == status) {
				this._emailReservations.set(value, null);
			}
		}
	}

	protected _onInputUsername(event: Event): void {
		const input = (event.target as HeInputPasswordElement);
		const value = ((input.value as string) ?? '');
		if (! input.baselineValid) {
			return;
		}
		const reservation = this._usernameReservations.get(value);
		if (reservation) {
			input.clearError();
		}
		else if (null === reservation) {
			input.error(this.local('register.error.460'));
		}
		else {
			input.clean();
		}
	}

	/**
	 * Validates the username against the server
	 */
	protected async _onChangeUsername(event: Event): Promise<void> {
		const input = (event.target as HeInputElement)!;
		const value = ((input.value as string) ?? '');
		if (! input.baselineValid) {
			return;
		}
		let reservation = this._usernameReservations.get(value);
		try {
			reservation = await this.server.reserveUsername(value, reservation?.token);
			this._usernameReservations.set(value, reservation as Reservation);
			input.clearError();
		}
		catch (error) {
			const status = (error as RemoteWebError).status;
			input.error(this.local(`register.error.${status}`));
			if (460 == status) {
				this._usernameReservations.set(value, null);
			}
		}
	}

	protected _onInputPassword(event: Event): void {
		const input = (event.target as HeInputPasswordElement);
		const value = ((input.value as string) ?? '');
		if (! input.baselineValid) {
			return;
		}
		const pwnCount = this._passwordPwns.get(value);
		if (0 == pwnCount) {
			input.clearError();
		}
		else if (pwnCount) {
			input.error(this.local('register.error.481', { pwnCount: pwnCount }));
		}
		else {
			input.clean();
		}
	}

	/**
	 * Validate password with server
	 */
	protected async _onChangePassword(event: Event): Promise<void> {
		const input = (event.target as HeInputPasswordElement)!;
		const value = ((input.value as string) ?? '');
		if (! input.baselineValid) {
			return;
		}
		try {
			let pwnCount = this._passwordPwns.get(value);
			if (! Utils.isDefined(pwnCount)) {
				pwnCount = await this.server.passwordPwned(value);
				this._passwordPwns.set(value, pwnCount);
			}
			input.error((pwnCount) ? this.local('register.error.481', { pwnCount: pwnCount }) : '');
		}
		catch (error) {
			const status = (error as RemoteWebError).status;
			input.error(this.local(`register.error.${status}`));
		}
	}

	/**
	 * Attempt to register user
	 */
	protected async _onSubmit(_event: SubmitEvent): Promise<void> {
		if (! this._form.checkValidity()) {
			return;
		}

		const formData = this._form.data;
		try {
			const fullName = (formData.get('full_name') as string);
			const username = (formData.get('username') as string);
			const email = (formData.get('email') as string);
			const password = (formData.get('password') as string);
			this._form.canSubmit = false;
			const accountInfo = await this.server.register(
				username, password, email, fullName,
				this._usernameReservations.get(username)?.token,
				this._emailReservations.get(email)?.token,
			);
			this._usernameReservations.delete(username);
			this._emailReservations.delete(email);
			this.app.announcementMsg = this.local('register.status.registration_successful');

			await this.app.beginSession(accountInfo);
			await storeSampleDocs(this.app.userDB);
			this._form.canSubmit = true;
			this.app.routeBack();
		}
		catch (error) {
			this._form.canSubmit = true;
			const status = (error as RemoteWebError).status;
			const message = this.local(`register.error.${status}`, ((error as RemoteWebError).data as any));
			let control: (HeInputElement | null) = null;
			switch (status) {
				case 460:
				case 461:
				case 462:
				case 463:
					control = this._inputUsername;
					break;

				case 470:
				case 471:
				case 472:
					control = this._inputEmail;
					break;

				case 480:
				case 481:
					control = this._inputPassword;
					break;
			}
			if (control && message) {
				control.error(message);
				this._error = '';
			}
			else {
				this._error = (message || this.local('register.error.default'));
			}
			this._form.focusFirstInvalid();
		}
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...InPage.styles,
			css`
				he-form {
					display: grid;
					width: 67%;
					place-items: center;
					margin: auto;
				}
				he-input,
				he-input-email,
				he-input-password {
					--slot-layout: row;
					width: 100%;
				}
				he-button {
					justify-self: end;
					margin: 1em 2em;
				}
				he-icon {
					margin-right: .5em;
				}
				a {
					color: currentColor;
					margin-block: .5em;
				}
			`,
		];
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		const limits = (this.server?.limits ?? { username: { min: 3, max: 64, pattern: '[a-zA-Z][a-zA-Z0-9\\-]+' }, password: { min: 8 } });
		return html`
			<main>
				<section id="content-container">
					<he-form ${ref(this._formRef)} aria-label="${this.local('register.label.form')}" @input="${this._onInput}" @submit="${this._onSubmit}">
						<he-input name="full_name" autocomplete="name" autofocus
							required
							placeholder="${this.local('register.placeholder.full_name')}"
						>
							<he-icon icon="user-outline" slot="start"></he-icon>
							${this.local('register.label.full_name')}
						</he-input>
						<he-input-email ${ref(this._inputEmailRef)} name="email" autocomplete="home email"
							required
							placeholder="${this.local('register.placeholder.email')}"
							@input="${this._onInputEmail}" @change="${this._onChangeEmail}"
						>
							<he-icon icon="mail" slot="start"></he-icon>
							${this.local('register.label.email')}
						</he-input-email>
						<he-input ${ref(this._inputUsernameRef)} name="username" autocomplete="username"
							required minlength="${limits.username.min}" maxlength="${limits.username.max}" pattern="${limits.username.pattern}"
							placeholder="${this.local('register.placeholder.username')}"
							@input="${this._onInputUsername}" @change="${this._onChangeUsername}"
						>
							<he-icon icon="user" slot="start"></he-icon>
							${this.local('register.label.username')}
						</he-input>
						<he-input-password ${ref(this._inputPasswordRef)} name="password"  autocomplete="new-password"
							required minlength="${limits.password.min}"
							placeholder="${this.local('register.placeholder.password')}"
							 @input="${this._onInputPassword}" @change="${this._onChangePassword}"
						>
							<he-icon icon="key" slot="start"></he-icon>
							${this.local('register.label.password')}
						</he-input-password>
						<he-button type="submit">${this.local('register.button.register')}</he-button>
						${this._error ? html`<in-alert message="${this._error}"></in-alert>` : nothing}
						<a href="/login/">${this.local('register.button.login')}</a>
					</he-form>
				</section>
			</main>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-register-page': InRegisterPage,
	}
}
