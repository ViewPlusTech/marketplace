
import {
	customElement, css, CSSResult,
	HeElement, html, property, createRef, ref, state,
} from '@elemental/helium';

import { type InPage, local } from '@inclusio/base';
import { ContentDoc } from '@inclusio/documents';

import { InContentCardElement, type InViewDialog, type InMessageDialog } from '.';

@customElement('in-content-list')
/** Document search results list */
export class InContentListElement extends local(HeElement) {
	@property({ attribute: false }) contentDocs: ContentDoc[] = [];
	page: InPage;
	protected _gridRef = createRef<HTMLElement>();
	protected _cardRefs: ReturnType<typeof createRef<InContentCardElement>>[] = [];
	protected _viewDialogRef = createRef<InViewDialog>();
	protected _messageDialogRef = createRef<InMessageDialog>();
	@state() protected _numCols = 1;
	protected _rows: ContentDoc[][] = [];
	protected _focusedCard: InContentCardElement | null = null;
	@state() protected _tabTargetCard = 0;
	protected _ignoreEvents = false;

	/** Number of grid rows. */
	get numRows() {
		return this._rows.length;
	}

	get numCols() {
		return this._numCols;
	}

	/** List of document cards. */
	get cards() {
		return this._cardRefs.map((cr) => cr.value!);
	}

	/** Focused card. */
	get focusedCard() {
		return this._focusedCard;
	}

	/** Set the focused card. */
	set focusedCard(card: InContentCardElement | null) {
		this._focusedCard = card;
		if (this._focusedCard) {
			this._tabTargetCard = this._focusedCard.index;
		}
	}

	/**
	 * Connect to app's server instance on DOM connect
	 */
	async connectedCallback(): Promise<void> {
		super.connectedCallback();
		const break1Mql = window.matchMedia('(min-width: 50rem)');
		const break2Mql = window.matchMedia('(min-width: 70rem)');
		break1Mql.addEventListener('change', (e: MediaQueryListEvent) => {
			this._numCols = e.matches ? 2 : 1;
		});
		break2Mql.addEventListener('change', (e: MediaQueryListEvent) => {
			this._numCols = e.matches ? 3 : 2;
		});
		this._numCols = break2Mql.matches ? 3 : break1Mql.matches ? 2 : 1;
	}

	/**
	 * Disonnect from DOM
	 */
	disconnectedCallback(): void {
		super.disconnectedCallback();
	}

	/** Show document view dialog. */
	async showDialog(userId: string, docPath: string) {
		await this._viewDialogRef.value!.show(userId, docPath);
	}

	/**
	 * Card at a specific grid row and column, or undefined
	 * if no card is at that location.
	 */
	cardAt(row: number, col: number): InContentCardElement | undefined {
		if (row > this._rows.length - 1 || col > this._numCols - 1) {
			return undefined;
		}
		if (row < 0) {
			row = this._rows.length + row;
			if (row < 0) {
				return undefined;
			}
		}
		if (col < 0) {
			// takes into account possible incomplete last row
			col = this._rows[row].length + col;
			if (col < 0) {
				return undefined;
			}
		}
		return this.cards[(row * this._numCols) + col];
	}

	/** Focus a specific card. */
	protected _focusCard(row: number, col: number) {
		const card = this.cardAt(row, col);
		if (card) {
			card.setFocused(true);
			return true;
		}
		return false;
	}

	getAriaDescription() {
		return this.local('search.cards_list_instructions');
	}

	/**
	 * Handle keydown events.
	 */
	protected _onKeydown(event: KeyboardEvent) {
		if (! ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
			'Home', 'End', 'Enter', ' ', 'i'].includes(event.key)) {
			return;
		}
		// prevent scrolling
		event.preventDefault();
		event.stopPropagation();
		const card = this._focusedCard!;
		if (event.key.startsWith('Arrow')) {
			if (event.key.endsWith('Left')) {
				if (card.column > 0) {
					this._focusCard(card.row, card.column - 1);
				}
				else if (card.row > 0) {
					this._focusCard(card.row - 1, -1);
				}
				else {
					window.app.alertMsg = this.local('search.on_first_card');
				}
			}
			else if (event.key.endsWith('Up')) {
				if (card.row > 0) {
					this._focusCard(card.row - 1, card.column);
				}
				else if (card.column > 0) {
					this._focusCard(-1, card.column - 1) || this._focusCard(-2, card.column - 1);
				}
				else {
					window.app.alertMsg = this.local('search.on_first_card');
				}
			}
			else if (event.key.endsWith('Right')) {
				if (card.column < this._numCols - 1) {
					if (! this._focusCard(card.row, card.column + 1)) {
						// last row might not be complete
						window.app.alertMsg = this.local('search.on_last_card');
					}
				}
				else if (card.row < this._rows.length - 1) {
					this._focusCard(card.row + 1, 0);
				}
				else {
					window.app.alertMsg = this.local('search.on_last_card');
				}
			}
			else if (event.key.endsWith('Down')) {
				if (card.row < this._rows.length - 1) {
					if (! (this._focusCard(card.row + 1, card.column) || this._focusCard(0, card.column + 1))) {
						// last row is incomplete
						window.app.alertMsg = this.local('search.on_last_col_none_below');
					};
				}
				else if (card.column < this._numCols - 1) {
					if (! this._focusCard(0, card.column + 1)) {
						// table has only one row, and it's incomplete
						window.app.alertMsg = this.local('search.on_last_card');
					}
				}
				else {
					window.app.alertMsg = this.local('search.on_last_card');
				}
			}
		}
		else if ('Home' === event.key) {
			this._focusCard(card.row, 0);
			window.app.alertMsg = this.local('search.on_first_card');
		}
		else if ('End' === event.key) {
			this._focusCard(card.row, -1);
			window.app.alertMsg = this.local('search.on_last_card');
		}
		else if ('Enter' === event.key || ' ' === event.key) {
			card.click();
		}
		else if ('i' === event.key) {
			card.showTags();
		}
	}

	/** Handle click events. */
	protected async _onClick(event: MouseEvent) {
		if (event.target instanceof InContentCardElement && ! this._ignoreEvents) {
			event.preventDefault();
			event.stopPropagation();
			this.focusedCard = event.target;
			this._ignoreEvents = true;
			await this._viewContent();
			this._ignoreEvents = false;
		}
	}

	/** View the content for the focused card. */
	protected async _viewContent(): Promise<void> {
		try {
			await this.showDialog(this._focusedCard!.contentDoc.userId, this._focusedCard!.contentDoc.path);
		}
		catch (error) {
			console.error('content load error:', error);
			await this._showError();
		}
		this._focusedCard!.setFocused();
	}

	protected async _showError(): Promise<void> {
		await this._messageDialogRef.value!.show(this.local('search.dialog_load_error'));
	}

	/** Stylesheet */
	static get styles(): CSSResult[] {
		return [
			...HeElement.styles,
			css`
				:host {
					--card-max-width: 310px;
				}
				#grid {
					display: grid;
					padding: 0;
					gap: var(--in-spacing-md, 1rem);
					grid-template-columns: 1fr;
					align-items: stretch;
					max-width: var(--card-max-width);
				}
				#grid.num-cols-2 {
					grid-template-columns: 1fr 1fr;
					max-width: calc(2*var(--card-max-width) + var(--in-spacing-md, 1rem));
				}
				#grid.num-cols-3 {
					grid-template-columns: 1fr 1fr 1fr;
					max-width: calc(3*var(--card-max-width) + 2*var(--in-spacing-md, 1rem));
				}
				ul {
					display: contents;
					list-style-type: none;
				}
				li {
					display: grid;
					grid-template-rows: subgrid;
					grid-row-end: span 3;
					gap: var(--in-spacing-sm, .5rem);
					min-width: 5rem;
					max-width: var(--card-max-width);
				}
			`,
		];
	}

	/** Render */
	render() {
		this._rows = [];
		this.contentDocs.forEach((doc, i) => {
			if (0 === i % this._numCols) {
				this._rows.push([doc]);
			}
			else {
				this._rows.at(-1)!.push(doc);
			}
		});
		this._cardRefs = [];
		return this.contentDocs.length
			? html`
				<div
					${ref(this._gridRef)}
					id="grid"
					class="num-cols-${this._numCols}"
					role="grid"
					aria-label=${this.local('search.cards_list_label')}
					aria-describedby="grid-desc"
					@keydown=${(event: KeyboardEvent) => this._onKeydown(event)}
					@click=${(event: MouseEvent) => this._onClick(event)}
				>
					${this._rows.map((row, i) => html`
						<ul 
							role="row" 
						>
							${row.map((doc, j) => {
								const idx = (i * this._numCols) + j;
								this._cardRefs[idx] ??= createRef();
								return html`
									<li>
										<in-content-card 
											${ref(this._cardRefs[idx])}
											.contentList=${this}
											.row=${i}
											.column=${j}
											.contentDoc=${doc}
											.canFocus=${this._tabTargetCard === idx}
										></in-content-card>
									</li>
								`;
							})}
						</ul>
					`)}
				</div>
				<in-view-dialog
					${ref(this._viewDialogRef)}
					.page=${this.page}
				></in-view-dialog>
				<in-msg-dialog
					${ref(this._messageDialogRef)}
				></in-msg-dialog>`
			: html`
				<p tabindex="0">${this.local('search.no_cards_avail')}</p>`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-content-list': InContentListElement,
	}
}
