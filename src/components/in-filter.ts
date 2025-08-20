
import {
	customElement, css, CSSResult,
	HeButtonToggleElement,
} from '@elemental/helium';

import { local } from '@inclusio/base';
import { type InFilterGroup } from '.';

@customElement('in-filter')
/** Filter toggle button */
export class InFilter extends local(HeButtonToggleElement) {
	filterGroup: InFilterGroup;
	index: number;
	key: string;
	private _isFocusLossInternal = false;

	/** Whether we're in the tab ring. */
	get canFocus() {
		return (0 === this._nativeControl!.tabIndex);
	}

	/** Set whether we're in the tab ring. */
	set canFocus(canFocus: boolean) {
		this._nativeControl!.tabIndex = (canFocus ? 0 : -1);
	}

	/**
	 * Connect to app's server instance on DOM connect
	 */
	async connectedCallback(): Promise<void> {
		super.connectedCallback();
		this._value = `${this.filterGroup.metadataKey}.${this.key}`;
	}

	/**
	 * Disonnect from DOM
	 */
	disconnectedCallback(): void {
		super.disconnectedCallback();
	}

	/**
	 * Initial setup, capture native control events
	 */
	protected _setup(): void {
		super._setup();
		this._nativeControl!.addEventListener('keydown', (event) => this._onKeydown(event));
		this._nativeControl!.role = 'treeitem';
		this.canFocus = false;
	}

	/** Focus this element. */
	focus() {
		this._isFocusLossInternal = false;
		this.canFocus = true;
		super.focus();
	}

	/** Focus the filter group. */
	focusGroup() {
		this._isFocusLossInternal = true;
		this.canFocus = false;
		this.filterGroup.focus();
	}

	/** Focus the next filter group. */
	focusNextGroup() {
		this._isFocusLossInternal = true;
		this.canFocus = false;
		this.filterGroup.focusNextGroup();
	}

	/** Focus the previous filter in the group. */
	focusPrevFilter() {
		this._isFocusLossInternal = true;
		this.canFocus = false;
		this.filterGroup.focusFilter(this.index - 1);
	}

	/** Focus the next filter in the group. */
	focusNextFilter() {
		this._isFocusLossInternal = true;
		this.canFocus = false;
		this.filterGroup.focusFilter(this.index + 1);
	}

	/** Handle blur events. */
	onBlur(event: Event): void {
		super._onBlur(event);
		if (! this._isFocusLossInternal) {
			const dest = this.filterGroup.filterTree.setReturnDestination();
			if (dest !== this) {
				this.canFocus = false;
			}
		}
	}

	/** Handle click */
	protected _onClick(_event: Event): void {
		super._onClick(_event);
		this.filterGroup.filterTree.toggleFilter(this.value as string);
		this._nativeControl!.ariaChecked = this.checked ? 'true' : 'false';
	}

	/** Stylesheet */
	static get styles(): CSSResult[] {
		return [
			...super.styles,
			css`
				:host {
					--padding-block: .25em;
					--padding-inline: .5em;
					--focus-offset: -4px;
					font-size: .9em;
					margin-block: .05em;
					margin-inline: 0;
				}
			`,
		];
	}

	/**
	 * Handle keydown events.
	 */
	protected _onKeydown(event: KeyboardEvent) {
		if (event.key.startsWith('Arrow')) {
			event.preventDefault();
			event.stopPropagation();
			if (event.key.endsWith('Left')) {
				this.focusGroup();
			}
			else if (event.key.endsWith('Up')) {
				if (this.index) {
					this.focusPrevFilter();
				}
				else {
					this.focusGroup();
				}
			}
			else if (event.key.endsWith('Down')) {
				if (this.index < this.filterGroup.numFilters - 1) {
					this.focusNextFilter();
				}
				else if (this.filterGroup.index < this.filterGroup.filterTree.numGroups - 1) {
					this.focusNextGroup();
				}
			}
		}
		else if (('Enter' === event.key) || (' ' === event.key)) {
			event.preventDefault();
			event.stopPropagation();
			this.click();
		}
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-filter': InFilter,
	}
}
