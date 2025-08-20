
import {
	HeElement, html, css, createRef, ref, property, styleMap,
	customElement, CSSResult,
	queryAssignedElements, nothing,
} from '@elemental/helium';

import { local } from '@inclusio/base';

export interface InOverlayCancelHookResult {
	shouldClose: boolean;
	value?: string;
}

/**
 * Ways in which the user can cancel (i.e., hide) the overlay.
 * key = Hitting the Esc key
 * button = Clicking the X button
 * click = Clicking outside of the overlay
 */
export interface InOverlayCancelMethods {
	key: boolean;
	button: boolean;
	click: boolean;
}

@customElement('in-overlay')
/**
 * The foundation for interactive dialogs -- a simple overlay
 * with an optional 'X' close button.
 * Provides a single slot for content.
 * @public
 */
export class InOverlay extends local(HeElement) {
	protected _dialogRef = createRef<HTMLDialogElement>();
	protected _closeButtonRef = createRef<HTMLImageElement>();
	protected _promise: Promise<string> | null;
	protected _resolve: (value: string) => void | null;
	protected _onDocumentClick: (e: MouseEvent) => void;

	onCancel: (() => Promise<InOverlayCancelHookResult>) | null = null;

	/**
	 * Configures how the user can cancel the overlay.
	 */
	cancel: InOverlayCancelMethods = { key: true, button: true, click: true };

	/**
	 * Whether to display the underlying dialog as modal.
	 */
	@property({ type: Boolean }) modal = false;

	/**
	 * Top left x coordinate in viewport coordinates.
	 */
	@property({ type: Number }) x = 0;

	/**
	 * Top left y coordinate in viewport coordinates.
	 */
	@property({ type: Number }) y = 0;

	@property() width?: string;

	@property() height?: string;

	/** Whether the overlay is initially visible. */
	@property({ type: Boolean }) open = false;

	/** Stylesheet */
	static get styles(): CSSResult[] {
		return [
			css`
				dialog {
					padding: 0;
					border: none;
					box-shadow: 0 0 40px var(--in-color-brand-900, #2e344c);
					border-radius: var(--border-radius, 0.15rem);
				}
				#container {
					position: relative;
					background: var(--theme-color-constrast, var(--in-color-brand-50, #f5f6fa));
					border: solid var(--theme-color) 1px;
					border-radius: var(--border-radius, 0.15rem);
					color: var(--in-color-brand-950, #1f2132);
					min-width: 15rem;
					display: flex;
					flex-direction: column;
					align-items: center;
					padding: var(--in-spacing-sm, 0.5rem);
				}
				in-button.close-x {
					position: absolute;
					right: var(--in-spacing-xs, 0.25rem);
					top: var(--in-spacing-xs, 0.25rem);
				}
				in-button.close-x img {
					height: var(--in-icon-size-md);
				}
				in-button.close-x span {
					display: none;
				}
			`,
		];
	}

	constructor() {
		super();
		this._onDocumentClick = (e) => {
			if (! this._isWithinRect(e.clientX, e.clientY, this._dialogRef.value!.getBoundingClientRect())) {
				this._didCancel(e);
			}
		};
	}

	protected get _label() {
		return '';
	}

	protected get _labelledBy() {
		return this.getAttribute('aria-labelledby') || '';
	}

	protected get _describedBy() {
		return this.getAttribute('aria-describedby') || '';
	}

	protected _setup() {
		this.setAttribute('aria-hidden', 'true');
		if (this.open) {
			this.show();
		}
	}

	/**
	 * Determine whether a point is inside of a DOMRect.
	 */
	protected _isWithinRect(x: number, y: number, rect: DOMRect): boolean {
		if (x < rect.left || x > rect.right
			|| y < rect.top || y > rect.bottom) {
			return false;
		}
		return true;
	}

	protected _beforeContent() {
		return html``;
	}

	protected _content() {
		return html`<slot></slot>`;
	}

	protected _afterContent() {
		return html``;
	}

	/**
	 * Render the overlay.
	 */
	render() {
		const dialogStyles: { [key: string]: any } = this.modal
			? { transform: `translate(${this.x}px, ${this.y}px)` }
			: {
				left: this.x,
				top: this.y,
				margin: 0,
			};
		if (this.width) {
			dialogStyles.width = this.width;
		}
		if (this.height) {
			dialogStyles.height = this.height;
		}
		return html`
			<dialog
				${ref(this._dialogRef)}
				aria-label=${this._label || nothing}
				aria-labelledby=${this._labelledBy || nothing}
				aria-describedby=${this._describedBy || nothing}
				@cancel=${this._didCancel}
				style="${styleMap(dialogStyles)}"
			>
				<div id="container">
					${this.cancel.button
						? html`
							<in-button
								${ref(this._closeButtonRef)}
								variant="naked"
								class="close-x"
								@click=${this._didCancel}
							>
								<img
									src="./assets/icons/dialog-x-icon.svg"
									alt=${this.local('app.dialog.close_button_alt_text')}
								>
								<span>Close</span>
							</in-button>
						` : ''
					}
					${this._beforeContent()}
					${this._content()}
					${this._afterContent()}
				</div>
			</dialog>
		`;
	}

	protected async _didCancel(event: Event) {
		// NB: `event` will either be a 'click' event (if the X button was clicked,
		// or the user clicked outside the overlay)
		// or a 'cancel' event (if Esc was pressed)
		event.preventDefault();
		// NB: We won't even get called when clicking outside the dialog
		// unless this.cancel.click is true
		if ((('cancel' === event.type) && (! this.cancel.key))
			|| (('click' === event.type) && (event.target === this._closeButtonRef.value) && (! this.cancel.button))) {
			return;
		}
		if (this.onCancel) {
			const oc = await this.onCancel();
			if (oc.shouldClose) {
				this.close(oc.value);
			}
		}
		else {
			this.close();
		}
	}

	/**
	 * Show the overlay.
	 * @param afterShow - A function that will be called immediately after showing the overlay.
	 * Can be useful if awaiting this method.
	 * @returns Promise of string return value (typically the tag of the button
	 * that caused the closure).
	 * @remarks
	 * This method can be awaited until the overlay is closed.
	 */
	show(afterShow?: () => void): Promise<string> {
		if (this._dialogRef.value!.open) {
			return this._promise!;
		}
		if (this.modal) {
			this._dialogRef.value!.showModal();
		}
		else {
			this._dialogRef.value!.show();
		}
		if (this.cancel.click) {
			// Add the listener on the next event cycle so if the overlay was shown
			// via a click (e.g., on a button), that click won't immediately trigger
			// the overlay to close
			setTimeout(() =>
				document.addEventListener('click', this._onDocumentClick));
		}
		this._promise = new Promise((resolve) => {
			this._resolve = resolve;
			this.setAttribute('aria-hidden', 'false');
			afterShow?.();
		});
		return this._promise;
	}

	/**
	 * Close the overlay.
	 * @param value - Value to resolve the promise with.
	 */
	close(value = 'ui_default_close') {
		this._dialogRef.value!.close();
		if (this.cancel.click) {
			document.removeEventListener('click', this._onDocumentClick);
		}
		this.setAttribute('aria-hidden', 'true');
		this._resolve!(value);
	}
}

/**
 * Describes a single dialog button.
 * @public
 */
export interface InDialogButtonInfo {
	/** Unique string tag identifying the button */
	tag: string;
	/** Text displayed on the button */
	text: string;
	/** Optional dialog close hook function.*/
	closeHook?: InDialogButtonCloseHook;
	/** Whether the button is initially disabled */
	disabled?: boolean;
}

/**
 * Hook function called when a button is clicked
 * that determines whether the dialog should close or not.
 * Useful for, e.g., popping up another dialog to confirm some
 * change made in the first dialog.
 * @public
 */
export type InDialogButtonCloseHook = (tag: string) => Promise<boolean>;

@customElement('in-dialog')
/**
 * Base class for purpose-specific dialogs. Includes a title bar
 * and customizable buttons. Provides a single slot for content.
 * @public
 */
export class InDialog extends InOverlay {
	/** Selector of initially-focused element */
	@property() initialFocus = '';
	protected _titlebarRef = createRef<HTMLElement>();
	protected _btnsWrapperRef = createRef<HTMLElement>();
	protected _prevX = 0;
	protected _prevY = 0;
	protected _moveListener: (e: PointerEvent) => void;
	@queryAssignedElements() protected _slotted: HTMLElement[];

	/**
	 * Displayed dialog title.
	 */
	@property() title = 'TITLE';

	/**
	 * Buttons to close the dialog with specific intents.
	 */
	@property({ type: Array }) buttons: InDialogButtonInfo[] = [
		{ tag: 'cancel', text: this.local('common.cancel') },
		{ tag: 'done', text: this.local('common.done') },
	];

	/** Stylesheet */
	static get styles(): CSSResult[] {
		return [
			...InOverlay.styles,
			css`
				#title {
					color: var(--in-color-brand-950, #1f2132);
					align-self: stretch;
					text-align: left;
					padding: var(--in-spacing-sm, 0.5rem);
					margin-bottom: var(--in-spacing-sm, 0.5rem);
					border-radius: var(--border-radius, 0.15rem);
					/* If I leave this out, the title content area ends up ever so slightly
						taller than the button image.*/
					height: 1rlh;
					cursor: default;
				}

				#title h2 {
					margin: 0;
				}

				#buttons {
					display: flex;
					justify-content: flex-end;
					gap: var(--in-spacing-sm, 0.5rem);
					width: 100%;
					padding: var(--in-spacing-sm, 0.5rem);
				}
			`,
		];
	}

	/**
	 * Constructor
	 */
	constructor() {
		super();
		this._moveListener = this._move.bind(this);
	}

	protected get _label() {
		return this.title;
	}

	protected _setup() {
		super._setup();
		this.modal = true;
		this.cancel = { key: true, button: true, click: false };
		this.onCancel = async () => await this._onCancel();
	}

	protected _beforeContent() {
		// The dialog title is included in the open alert, so we can
		// hide it from the a11y tree here
		return html`
			<div
				${ref(this._titlebarRef)}
				id="title"
				aria-hidden="true"
				@pointerdown=${this._onTitlebarPointerDown}
				@pointerup=${this._onTitlebarPointerUp}
			>
				<h2>${this.title}</h2>
			</div>
		`;
	}

	protected _afterContent() {
		return html`
			<div id="buttons">
				${this.buttons.map((b) => html`
					<in-button
						id=${b.tag}
						?disabled=${b.disabled}
						tabindex="0"
						@click=${this._onButtonClick}
					>
						${b.text}
					</in-button>
				`)}
			</div>
		`;
	}

	protected _onTitlebarPointerDown(e: PointerEvent) {
		this._prevX = e.clientX;
		this._prevY = e.clientY;
		this._titlebarRef.value!.addEventListener('pointermove', this._moveListener);
		this._titlebarRef.value!.setPointerCapture(e.pointerId);
	}

	protected _onTitlebarPointerUp(e: PointerEvent) {
		this._titlebarRef.value!.removeEventListener('pointermove', this._moveListener);
		this._titlebarRef.value!.releasePointerCapture(e.pointerId);
	}

	protected _move(e: PointerEvent) {
		this.x += e.clientX - this._prevX;
		this._prevX = e.clientX;
		this.y += e.clientY - this._prevY;
		this._prevY = e.clientY;
	}

	protected async _onCancel(): Promise<InOverlayCancelHookResult> {
		const cancelDesc = this._buttonInfo('cancel');
		if (cancelDesc) {
			const hook = cancelDesc.closeHook;
			const shouldClose = hook ? await hook('cancel') : true;
			return { shouldClose, value: 'cancel' };
		}
		else {
			return { shouldClose: true };
		}
	}

	/**
	 * Get the disabled state of all buttons.
	 * @returns Mapping of button tags to disabled states.
	 */
	getButtonsDisabled(): { [tag: string]: boolean } {
		const state: { [tag: string]: boolean } = {};
		for (const { tag } of this.buttons) {
			state[tag] = this.renderRoot.querySelector<HTMLButtonElement>(`#${tag}`)!.disabled;
		}
		return state;
	}

	/**
	 * Set the disabled state of specific buttons.
	 * @param state - Mapping of button tags to desired disabled values.
	 * All buttons will be disabled if this is omitted.
	 * @returns Previous button disabled states if called with no argument.
	 */
	setButtonsDisabled(state?: { [tag: string]: boolean }) {
		if (state) {
			for (const [tag, disabled] of Object.entries(state)) {
				this.renderRoot.querySelector<HTMLButtonElement>(`#${tag}`)!.disabled = disabled;
			}
		}
		else {
			const curState = this.getButtonsDisabled();
			this.renderRoot.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
				b.disabled = true;
			});
			return curState;
		}
	}

	protected _buttonInfo(tag: string) {
		return this.buttons.find((info) => (info.tag === tag));
	}

	/**
	 * Get the button corresponding to a specific tag..
	 * @param tag - Button tag.
	 * @returns Button element (or null).
	 */
	button(tag: string): HTMLButtonElement | null {
		return this.renderRoot.querySelector<HTMLButtonElement>(`#${tag}`);
	}

	protected async _onButtonClick(e: Event) {
		const btnState = this.setButtonsDisabled();
		const desc = this._buttonInfo((e.target as HTMLButtonElement).id);
		const shouldClose = desc!.closeHook
			? await desc!.closeHook(desc!.tag)
			: true;
		if (shouldClose) {
			this.close(desc!.tag);
		}
		this.setButtonsDisabled(btnState);
	}

	/**
	 * Show the dialog.
	 * @param afterShow - A function that will be called immediately after showing the dialog.
	 * Can be useful if awaiting this method.
	 * @returns Promise of string return value (typically the tag of the button
	 * that caused the closure).
	 * @remarks
	 * This method can be awaited until the dialog is closed.
	 */
	show(afterShow?: () => void): Promise<string> {
		for (const { tag, disabled } of this.buttons) {
			this.renderRoot.querySelector<HTMLButtonElement>(`#${tag}`)!.disabled = (!! disabled);
		}
		this.x = 0;
		this.y = 0;
		this._prevX = 0;
		this._prevY = 0;
		return super.show(() => {
			if (this.initialFocus) {
				// autofocus attribute doesn't always seem to work
				(this._slotted[0].querySelector(this.initialFocus) as HTMLElement).focus();
			}
			afterShow?.();
		});
	}
}

@customElement('in-msg-dialog')
/**
 * Simple dialog that displays a message and a single
 * button to close the dialog.
 * @public
 */
export class InMessageDialog extends local(HeElement) {
	protected _dialogRef = createRef<InDialog>();
	/**
	 * Close button text.
	 */
	@property() btnText = '';

	/**
	 * Message text.
	 */
	@property() text = 'Your message here';

	render() {
		const buttons = [{ tag: 'cancel', text: this.btnText || this.local('common.done') }];
		return html`
			<in-dialog
				${ref(this._dialogRef)}
				title=${this.local('app.dialog.message_title')}
				.buttons=${buttons}
				initialfocus="#message"
			>
				<section>
					<p id="message" tabindex="-1">${this.text}</p>
				</section>
			</in-dialog>
		`;
	}

	/**
	 * Show the dialog
	 * @param text - Optional message text.
	 */
	async show(text?: string) {
		if (text) {
			this.text = text;
		}
		await this._dialogRef.value!.show();
	}
}

@customElement('in-conf-dialog')
/**
 * Dialog that displays some sort of request for confirmation and
 * a pair of buttons to confirm or not.
 * @public
 */
export class InConfirmDialog extends local(HeElement) {
	protected _dialogRef = createRef<InDialog>();

	/**
	 * Cancel button text.
	 */
	@property() cancelText = '';

	/**
	 * Confirm (okay) button text.
	 */
	@property() doneText = '';

	/**
	 * Message text.
	 */
	@property() text = 'Text';

	/** */
	render() {
		const buttons = [
			{ tag: 'cancel', text: this.cancelText || this.local('common.cancel') },
			{ tag: 'done', text: this.doneText || this.local('common.done') },
		];
		return html`
			<in-dialog title=${this.local('app.dialog.confirm_title')} .buttons=${buttons}>
				<div class="text">${this.text}</div>
			</in-dialog>
		`;
	}

	/**
	 * Show the dialog.
	 * @param text - Message text.
	 * @param cancelText - Cancel button text.
	 * @param doneText - Confirm (done) button text.
	 * @returns Promise of boolean indicating whether the user confirmed or cancelled.
	 */
	async show(text?: string, cancelText?: string, doneText?: string): Promise<boolean> {
		if (text) {
			this.text = text;
		}
		if (cancelText) {
			this.cancelText = cancelText;
		}
		if (doneText) {
			this.doneText = doneText;
		}
		const tag = await this._dialogRef.value!.show();
		return ('done' === tag);
	}
}

declare global {

	interface HTMLElementTagNameMap {
		'in-overlay': InOverlay;
		'in-dialog': InDialog;
		'in-msg-dialog': InMessageDialog;
		'in-conf-dialog': InConfirmDialog;
	}
}
