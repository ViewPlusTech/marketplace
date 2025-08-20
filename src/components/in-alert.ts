import { customElement, HeElement, html, css, CSSResult, property } from '@elemental/helium';
import { local } from '@inclusio/base';

export enum AlertStatus {
	ERROR = 'error',
	SUCCESS = 'success',
	INFO = 'info',
}

@customElement('in-alert')
export class InAlertElement extends local(HeElement) {
	@property({ type: Boolean }) dismissible = false;
	@property({ type: String }) message?: string;
	@property() status?: AlertStatus = AlertStatus.INFO;

	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
			css`
				:host {
					display: block;
				}

				[role='alert'] {
					display: flex;
					gap: var(--in-spacing-xs);
					align-items: center;
					border: 1px solid;
					justify-content: space-between;
					border-radius: var(--in-border-radius-md);
					font-size: var(--in-font-size-md);
					margin-bottom: var(--in-spacing-md);
					padding: var(--in-spacing-sm) var(--in-spacing-md);
				}

				.message {
					flex-grow: 1;
					font-size: var(--in-font-size-md);
				}

				.status-error {
					background-color: var(--in-color-danger-50, #fff2f0);
					border-color: var(--in-color-danger-700, #e22306);
					color: var(--in-color-danger-900);
				}

				.status-info {
					background-color: var(--in-color-primary-100, #d7ecff);
					border-color: var(--in-color-primary-500, #3a6fff);
					color: var(--in-color-primary-950);
				}

				.status-success {
					background-color: var(--in-color-success-200, #ebfef6);
					border-color: var(--in-color-success-500, #6ac883);
					color: var(--in-color-success-700);
				}

				he-button-icon {
					--background: none;
					--color: inherit;
					margin: 0;
				}
			`,
		];
	}

	/**
	 *
	 * @returns The he-icon name based on the alert status
	 */
	private _getIconByStatus() {
		switch (this.status) {
			case AlertStatus.ERROR:
				return 'alert';
			case AlertStatus.SUCCESS:
				return 'checkmark';
			default:
				return 'info';
		}
	}

	private _handleClose() {
		const options = {
			bubbles: true,
			composed: true,
		};
		this.dispatchEvent(new CustomEvent('alert-dismissed', options));
		this.remove();
	}

	render() {
		return html`
			<div class="status-${this.status}" role="alert">
				<div>
					<he-icon icon="${this._getIconByStatus()}"></he-icon>
					<span class="message">${this.message}</span>
					<slot></slot>
				</div>
				${this.dismissible
					? html`
						<he-button-icon
							@click="${this._handleClose}"
							aria-label="${this.local('alert.aria_label_close_alert')}"
							icon="close">
						</he-button-icon>
						`
					: ''}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-alert': InAlertElement;
	}
}
