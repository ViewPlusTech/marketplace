
import {
	customElement, html, css, HTMLTemplateResult, CSSResult, state,
} from '@elemental/helium';
import { Utils } from '@elemental/utils';
import type { Message } from '@elemental/localization';
import type { ChangeOperation } from '@elemental/database';
import { DocClassObserver } from '@elemental/database';

import { InPage } from '@inclusio/base';
import { ContentDoc, docId } from '@inclusio/documents';


/**
 * Inclusio browse page
 */
@customElement('in-browse-page')
export class InBrowsePage extends InPage {
	@state() protected _contentDocs: ContentDoc[] = [];
	@state() protected _countMsg: string = '';

	protected _docObserver = new DocClassObserver<ContentDoc>((doc, op) => { this._contentUpdated(doc, op); });

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
			this.app.routeTo('/search');
			return;
		}

		this.app.activePageName = 'browse';

		if (! this.localMessage('content_tags')) {
			const contentMetadata = await this.server.contentMetadata();
			for (const [locale, messages] of Object.entries(contentMetadata.languages)) {
				this.insertLocalMessage(locale, 'content_tags', Utils.snakeCase(messages) as unknown as Message);
			}
		}

		this._contentDocs = [];
		this._countMsg = this.local('browse.count.loading');
		await this._loadContentDocuments();
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();

		this._docObserver.disconnect();
	}

	protected _setContentDocs(docs: ContentDoc[]): void {
		if (! Utils.isArray(docs)) {
			this._contentDocs = [];
			return;
		}
		this._contentDocs = docs.toSorted((a: ContentDoc, b: ContentDoc) => (b.updateTime ?? '').localeCompare(a.updateTime ?? ''));
	}

	/**
	 * Content document updated in database
	 */
	protected _contentUpdated(doc: ContentDoc, operation: ChangeOperation): void {
		const index = this._contentDocs.findIndex((existingDoc) => (existingDoc.id == doc.id));
		if (-1 < index) {
			this._contentDocs.splice(index, 1);
		}
		if ('delete' != operation) {
			this._contentDocs.push(doc);
		}
		this._setContentDocs(this._contentDocs);
		this._displayCount(this._contentDocs.length);
	}

	/**
	 * Load content docuements
	 */
	protected async _loadContentDocuments(): Promise<void> {
		const options = {
			startkey: docId(ContentDoc, this.app.userId),
			endkey: docId(ContentDoc, this.app.userId, '\ufff0'),
			includeDocs: true,
		};
		this._setContentDocs(await this.userDB.allDocs(options) as ContentDoc[]);
		this._docObserver.observe(ContentDoc, this.userDB);
		this._displayCount(this._contentDocs.length, { announce: true });
	}

	/**
	 * Displays count, and optionally announces it
	 */
	protected _displayCount(count: number, { announce, actionMsg = '' }: { announce?: boolean, actionMsg?: string } = {}): void {
		this._countMsg = this.local('browse.count.available', { count: count });
		if (announce) {
			this.app.announcementMsg = ((actionMsg) ? `${actionMsg}. ${this._countMsg}` : this._countMsg); // XXX NO LOCAL COMPOSITION
		}
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...InPage.styles,
			css`
				#content-container {
					display: grid;
					grid-template-columns: 1fr;
					/*gap: 2rem;*/
					column-gap: 2rem;
					justify-content: center;
				}

				#result_info {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: flex-end;
					padding: 0;
					margin: var(--in-spacing-md, 1rem) 0;
				}

				#result_info * {
					padding: 0;
					margin: 0;
				}

				/* Gallery - XXX is any of this necessary? if so, should be in in-content-list */

				/* tooltips */
				[data-tooltip] {
					position: relative;
				}

				[data-tooltip][aria-label]:before,
				[data-tooltip][aria-label]:after {
					display: block;
					opacity: 0;
					pointer-events: none;
					position: absolute;
				}

				[data-tooltip][aria-label]:after {
					border-right: 0.5rem solid transparent;
					border-bottom: 0.5rem solid var(--in-color-black, #000);
					border-left: 0.5rem solid transparent;
					content: '';
					height: 0;
					top: 1.4rem;
					left: 0;
					width: 0;
				}

				[data-tooltip][aria-label]:before {
					background: var(--in-color-black, #000);
					border-radius: 0.1rem;
					color: var(--main-color);
					content: attr(aria-label);
					padding: 0 0.8rem;
					left: -1.1rem;
					top: 1.9rem;
					white-space: nowrap;
				}

				[data-tooltip~="bottom-left"][aria-label]:before {
					left: -5.1rem;
					top: 1.9rem;
				}

				/* tooltip animations */
				[data-tooltip][aria-label]:after,
				[data-tooltip][aria-label]:before {
					transform: translate3d(0,-0.8rem,0);
					transition: all .15s ease-in-out;
				}

				[data-tooltip][aria-label]:hover:after,
				[data-tooltip][aria-label]:hover:before,
				[data-tooltip][aria-label]:focus:after,
				[data-tooltip][aria-label]:focus:before {
					opacity: 1;
					transform: translate3d(0,0,0);
				}

				/* a11y styles */
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
			`,
		];
	}


	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		return html`
			<div id="content-container">
				<main>
					<h2>${this.local('browse.heading')}</h2>

					<section aria-label="${this.local('browse.label')}">
						<h3 id="count">
							${this._countMsg}
						</h3>
						<in-content-list
							.contentDocs=${this._contentDocs}
							.page=${this}
						></in-content-list>
					</section>
				</main>
			</div>
		`;
	}
}


declare global {
	interface HTMLElementTagNameMap {
		'in-browse-page': InBrowsePage,
	}
}
