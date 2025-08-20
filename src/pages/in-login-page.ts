
import {
	customElement, html, HTMLTemplateResult, css, CSSResult, ref, createRef, state, nothing,
} from '@elemental/helium';
import { InPage } from '@inclusio/base';
import type { HeFormElement } from '@elemental/helium';

import { RemoteWebError } from '@elemental/remote-web-object';

@customElement('in-login-page')
/**
 * Inclusio login page
 */
export class InLoginPage extends InPage {
	@state() protected _error = '';
	protected _formRef = createRef<HeFormElement>();

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

		this.app.activePageName = 'login';
		this._reset();
	}

	protected get _form(): HeFormElement {
		return this._formRef.value!;
	}

	/**
	 * Clear out any field values and errors.
	 */
	protected _reset() {
		this._form.reset();
		this._form.canSubmit = true;
		this._error = '';
	}

	protected _onPasswordVisible(event: CustomEvent<boolean>): void {
		event.stopPropagation();
		window.app.alertMsg = this.local(`login.show_password.${(event.detail) ? 'alert_visible' : 'alert_hidden'}`);
	}

	protected _onInput(_event: Event): void {
		this._error = '';
	}


	/**
	 * Log in
	 */
	protected async _onSubmit(event: Event): Promise<void> {
		event.preventDefault();

		if (! this._form.checkValidity()) {
			return;
		}

		const formData = this._form.data;
		try {
			this._form.canSubmit = false;
			const accountInfo = await this.server.login(formData.get('username') as string, formData.get('password') as string);
			await this.app.beginSession(accountInfo);
			this._form.canSubmit = true;
			this.app.routeBack();
		}
		catch (error) {
			this._form.canSubmit = true;
			let message = '';
			if (error instanceof RemoteWebError) {
				message = this.local(`login.error.${error.status}`);
			}
			this._error = (message || this.local('login.error.default'));
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
				he-input, he-input-password {
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
		const limits = (this.server?.limits ?? { username: { min: 3, max: 64 }, password: { min: 8 } });
		return html`
			<main>
				<section id="content-container">
					<he-form ${ref(this._formRef)} @input="${this._onInput}" @submit="${this._onSubmit}" aria-label=${this.local('login.title')}>
						<he-input name="username" required autocomplete="username" autofocus placeholder="${this.local('login.placeholder.username')}"
							minlength="${limits.username.min}" maxlength="${limits.username.max}"
						>
							<he-icon icon="user" slot="start"></he-icon>
							${this.local('login.label.username')}
						</he-input>
						<he-input-password name="password" required autocomplete="current-password" minlength="${limits.password.min}"
							placeholder="${this.local('login.placeholder.password')}" showLabel="${this.local('login.show_password.label')}"
							@password-visible="${this._onPasswordVisible}">
							<he-icon icon="key" slot="start"></he-icon>
							${this.local('login.label.password')}
						</he-input-password>
						<he-button type="submit">${this.local('login.button.login')}</he-button>
						${this._error ? html`<in-alert message="${this._error}"></in-alert>` : nothing}
						<a href="/login/forgot/">${this.local('login.button.forgot')}</a>
						<a href="/register/">${this.local('login.button.register')}</a>
					</he-form>
				</section>
			</main>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-login-page': InLoginPage,
	}
}
