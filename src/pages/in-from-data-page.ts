
import {
	customElement, html, HTMLTemplateResult, css, CSSResult, state, createRef, ref,
	HeSegmentGroupElement,
	HeSVGElement,
} from '@elemental/helium';
import { Locale, LanguageTag } from '@elemental/localization';
import { Utils } from '@elemental/utils';

import { InPage } from '@inclusio/base';

import { ContentDoc, generateDocPath } from '@inclusio/documents';

import { ParaHelper, type FieldInfo, type Manifest } from '../../paracharts.js';

import templateBar from '../templates/paracharts-bar.json';
import templateColumn from '../templates/paracharts-column.json';
import templateLine from '../templates/paracharts-line.json';
import templatePie from '../templates/paracharts-pie.json';
import templateDonut from '../templates/paracharts-donut.json';

import { AlertStatus } from '../components/in-alert';

type ChartType = 'bar' | 'column' | 'line' | 'pie' | 'donut';
const chartTypes: ChartType[] = ['bar', 'column', 'line', 'pie', 'donut'];


const templateMap = {
	bar: templateBar,
	column: templateColumn,
	line: templateLine,
	pie: templatePie,
	donut: templateDonut,
};

@customElement('in-from-data-page')
/**
 * Inclusio chart from data page
 */
export class InChartFromDataPage extends InPage {
	@state() protected _dataFieldInfo: FieldInfo[] | null = null;
	@state() protected _manifest: Manifest | null = null;
	@state() protected _alertStatus: AlertStatus | null = null;

	protected _chartType: ChartType = 'bar';
	protected _chartTypeRef = createRef<HeSegmentGroupElement>();
	protected _imageContainerRef = createRef<HeSVGElement>();
	protected _chartTitleRef = createRef<HTMLInputElement>();
	protected _xTitleRef = createRef<HTMLInputElement>();
	protected _yTitleRef = createRef<HTMLInputElement>();
	protected _indepColRef = createRef<HeSegmentGroupElement>();
	protected _indepTypeRef = createRef<HeSegmentGroupElement>();
	protected _paraHelper: ParaHelper;
	protected _svgName = '';
	protected _dataFile: File;
	protected _svgText = '';

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

		const contentInput = (this._findChild('select_content') as HTMLInputElement);
		contentInput && (contentInput.value = '');

		this._dataFieldInfo = null;
		this._manifest = null;
		this._setPreviewSVG('');

		this.app.activePageName = 'from_data';

		this._paraHelper = new ParaHelper();
		await this._paraHelper.ready;
	}

	/**
	 * Set SVG preview content
	 */
	protected _setPreviewSVG(svgContent: string): void {
		const el = document.createElement('div');
		el.innerHTML = svgContent;
		const svg = el.firstElementChild as SVGSVGElement;
		if (svg) {
			this._imageContainerRef.value!.setSVG(svg);
			this._imageContainerRef.value!.viewBox = svg.getAttribute('viewBox')!;
		}
	}

	/**
	 * Sets the data file from the file selector input
	 */
	protected async _selectData(event: Event): Promise<void> {
		event.stopPropagation();

		const fileInput = ((event?.target) as HTMLInputElement);
		const fileList = fileInput.files;
		const file = fileList?.item(0);

		if (! file) {
			return;
		}

		this._dataFile = file;

		const ext = file.name.toLocaleLowerCase().match(/^.+(\.\w+)/)?.[1];
		this._svgName = ext
			? (file.name.slice(0, -ext.length) + '.svg')
			: (file.name + '.svg');

		if ('application/json' === file.type) {
			await this._loadManifest(JSON.parse(await file.text()));
		}
		else if ('text/csv' === file.type) {
			await this._loadCsv(file);
		}
		else {
			throw new Error(`data file type '${file.type}' not supported`);
		}
	}

	protected async _loadCsv(blob: Blob) {
		const url = URL.createObjectURL(blob);
		this._dataFieldInfo = await this._paraHelper.loadData(url);
		URL.revokeObjectURL(url);
	}

	protected async _onGenerate(_event: Event): Promise<void> {
		const chartType = this._chartType as keyof typeof templateMap;
		const manifest = structuredClone(templateMap[chartType]) as Manifest;
		manifest.datasets[0].title = this._chartTitleRef.value!.value;
		manifest.datasets[0].facets.x.label = this._xTitleRef.value!.value;
		manifest.datasets[0].facets.y.label = this._yTitleRef.value!.value;
		const indepKey = this._indepColRef.value!.value;
		const seriesInfo = this._dataFieldInfo!.filter((fieldInfo) => fieldInfo.name !== indepKey);
		manifest.datasets[0].facets.x.datatype = this._indepTypeRef.value!.value;
		manifest.datasets[0].series = seriesInfo.map((info) => ({
			key: info.name,
			theme: {
				baseQuantity: info.name,
				baseKind: 'dimensioned',
				entity: info.name,
			},
		}));
		await this._loadManifest(manifest);
		this._alertStatus = AlertStatus.SUCCESS;
	}

	protected async _loadManifest(manifest: Manifest) {
		await this._paraHelper.loadManifest(JSON.stringify(manifest), 'content');
		this._manifest = manifest;
		this._svgText = this._paraHelper.serializeChart();
		this._setPreviewSVG(this._svgText);
	}

	/**
	 * Save content doc and route to edit page
	 */
	protected async _onPublish(event: Event): Promise<void> {
		event.preventDefault();
		event.stopPropagation();

		const contentDoc = await this._createContentDoc();
		const modifiedDoc = Utils.deepClone(contentDoc);

		const svgTitleEl = this._imageContainerRef.value!.querySelector('svg > title');
		const svgTitle = svgTitleEl?.textContent;
		modifiedDoc.name = svgTitle || this._svgName;
		modifiedDoc.addAttachment('content',
			new Blob([this._svgText], { type: 'image/svg+xml' }));
		modifiedDoc.addAttachment('data', this._dataFile);
		modifiedDoc.jimEnhanced = false; // XXX need to detect JIM
		await this._patchDocument(contentDoc, modifiedDoc);

		this.app.routeTo(`/edit/${contentDoc.path}`);
	}

	protected async _createContentDoc(): Promise<ContentDoc> {
		const contentDoc = new ContentDoc();
		contentDoc.name = '';
		contentDoc.description = '';
		contentDoc.imageTypes = ['chart'];
		contentDoc.languages = [this._defaultLanguage()];
		contentDoc.visibility = 'private';
		await this.userDB.create(contentDoc, generateDocPath());
		this.app.appendRoutePath(contentDoc.path);
		return contentDoc;
	}

	/**
	 * Get default language from the user's browser language
	 */
	protected _defaultLanguage(): Locale {
		for (const language of navigator.languages) {
			const tag = new LanguageTag(language);
			if (tag.language) {
				return tag.language;
			}
		}
		return 'en';
	}

	protected async _patchDocument(originalDoc: ContentDoc, modifiedDoc: ContentDoc): Promise<void> {
		const patch = modifiedDoc.computeMergePatchFrom(originalDoc, { attachments: true });
		try {
			if (Utils.isEmpty(patch)) {
				return;
			}
			patch.updateTime = Utils.isoDateTime();
			await this.userDB.mergePatch(originalDoc, patch, { attachments: true });
		}
		catch (error) {
			console.error('Error updating document:', error);
		}
	}

	/**
	 * Get stylesheet
	 */
	static get styles(): CSSResult[] {
		return [
			...InPage.styles,
			css`
				.grid-container {
					display: grid;
					grid-template-columns: 200px 700px;
					row-gap: var(--in-spacing-lg, 2rem);
					column-gap: var(--in-spacing-lg, 2rem);
					align-items: center;
					max-width: max-content;
					margin: 0 auto;
				}

				.field-label {
					padding: 8px;
					font-weight: var(--in-font-weight-bold, 700);
					max-width: 20rem;
				}

				#settings {
					display: grid;
					grid-template-rows: subgrid;
					grid-template-columns: subgrid;
					grid-row: 2 / 8;
					grid-column: 1 / 3;
					align-items: center
				}

				#image-container {
					grid-column: 1 / 3;
					background-color: var(--in-color-white, #fff);
					border: 1px solid var(--in-color-brand-100, #eaecf4);
					border-radius: var(--in-border-radius-md, 0.5rem);
					margin-bottom: var(--in-spacing-lg, 2rem);
					width: 500px;
					outline: 2px solid var(--accent-color);
					margin: 0 auto;
				}

				#image-container svg {
					width: 500px;
					height: auto;
					display: block;
				}

				input,
				textarea {
					padding: 15px;
					border: 2px solid var(--in-color-brand-300, #A9B2D0);
					border-radius: var(--in-border-radius-md, 0.5rem);
					background: var(--in-color-white, #fff);
					color: var(--in-color-black, #000);
					font-family: var(--in-font-primary);
					font-size: var(--in-font-size-md, 1rem);
				}

				@media screen and (max-width: 1024px) and (orientation: portrait) {
					.grid-container {
						grid-template-columns: 1fr;
					}
				}

				he-segment-group {
					--control-margin-inline: 0;
				}

				.btn-toolbar {
					grid-column: 1 / 3;
					display: flex;
					gap: var(--in-spacing-sm, 0.5rem);
					align-items: center;
					justify-content: flex-end;
					margin-top: var(--in-spacing-xl, 2.5rem);
				}

				in-alert {
					width: max-content;
					margin: auto;
				}
			`,
		];
	}

	protected _renderEditControls(): HTMLTemplateResult {
		const generateButton = this._dataFieldInfo
			? html`
				<he-button
					kind="primary"
					@click=${this._onGenerate}
				>
					${this.local('from_data.button.generate')}
				</he-button>`
			: '';
		const publishButton = (this._dataFieldInfo || this._manifest)
			? html`
				<he-button
					kind="success"
					?disabled=${! this._manifest}
					@click=${this._onPublish}
				>
					${this.local('from_data.button.done')}
				</he-button>`
			: '';
		return html`
			<div class="btn-toolbar">
				${generateButton}
				${publishButton}
			</div>`;
	}

	/**
	 * Render content
	 */
	render(): HTMLTemplateResult {
		const typeSelect = html`
			<label
				class="field-label"
				for="type-select"
			>${this.local('from_data.label.select_type')}</label>
			<he-segment-group
				${ref(this._chartTypeRef)}
				id="type-select"
				.value=${this._chartType}
				aria-label=${this.local('from_data.label.select_type')}
				@keydown=${(e: KeyboardEvent) => {
					/* prevent up/down key scrolling */
					if (e.key !== 'Tab') {
						e.preventDefault();
					}
				}}
				@change=${() => {
					this._chartType = this._chartTypeRef.value!.value as ChartType;
				}}
			>
				${chartTypes.map((type) => html`
					<he-segment
						.value=${type}
						.disabled=${
							(['pie', 'donut'].includes(type)
							&& this._dataFieldInfo
							&& this._dataFieldInfo.length > 2)
						}
						role="radio"
					>
						${this.local(`from_data.label.${type}`)}
					</he-segment>
				`)}
			</he-segment-group>`;
		const datafileSelect = html`
			<label
				class="field-label"
				for="data-select"
			>
				${this.local('from_data.label.select_content')}
			</label>
			<input
				id="data-select"
				type="file"
				required
				aria-required="true"
				accept=".csv,.json,text/csv,application/json"
				@change=${this._selectData}
			>`;
		return html`
			<main>
				<section id="content-container">
					${this._alertStatus ? html`
						<in-alert
							status="${this._alertStatus}"
							message=${this.local('from_data.announce_generated')}
							dismissible
							aria-live="polite"
							role="alert"
							@alert-dismissed=${() => {
								this._alertStatus = null;
							}}
						></in-alert>
					` : ''}
					<div class="grid-container">
						${datafileSelect}
						<div id="settings" ?hidden=${! this._dataFieldInfo}>
							${typeSelect}
							<label
								class="field-label"
								for="chart-title"
							>${this.local('from_data.label.title')}</label>
							<input
								${ref(this._chartTitleRef)}
								id="chart-title"
								type="text" size="30"
								minlength="3"
								.value=${this.local('from_data.chart_title_default')}
							>
							<label
								class="field-label"
								for="indep-col"
							>${this.local('from_data.label.indep_col')}</label>
							<he-segment-group
								${ref(this._indepColRef)}
								id="indep-col"
								aria-label=${this.local('from_data.label.indep_col')}
								.disabled=${! this._dataFieldInfo}
								.value=${this._dataFieldInfo?.[0].name}
								@keydown=${(e: KeyboardEvent) => {
									/* prevent up/down key scrolling */
									if (e.key !== 'Tab') {
										e.preventDefault();
									}
								}}
							>
								${this._dataFieldInfo?.map((fieldInfo) => html`
									<he-segment
										.value=${fieldInfo.name}
										role="radio"
									>
										${fieldInfo.name}
									</he-segment>
								`) ?? ''}
							</he-segment-group>
							<label
								class="field-label"
								for="indep-type"
							>${this.local('from_data.label.indep_type')}</label>
							<he-segment-group
								${ref(this._indepTypeRef)}
								id="indep-type"
								aria-label=${this.local('from_data.label.indep_type')}
								.disabled=${! this._dataFieldInfo}
								.value=${this._dataFieldInfo?.[0].type}
								@keydown=${(e: KeyboardEvent) => {
									/* prevent up/down key scrolling */
									if (e.key !== 'Tab') {
										e.preventDefault();
									}
								}}
							>
								<he-segment .value=${'string'} role="radio">${this.local('from_data.label.string')}</he-segment>
								<he-segment .value=${'number'} role="radio">${this.local('from_data.label.number')}</he-segment>
								<he-segment .value=${'date'} role="radio">${this.local('from_data.label.date')}</he-segment>
							</he-segment-group>
							<label
								class="field-label"
								for="x-title"
							>${this.local('from_data.label.x_title')}</label>
							<input
								${ref(this._xTitleRef)}
								id="x-title"
								type="text" size="30"
								minlength="3"
								.value=${this.local('from_data.x_title_default')}
							>
							<label
								class="field-label"
								for="y-title"
							>${this.local('from_data.label.y_title')}</label>
							<input
								${ref(this._yTitleRef)}
								id="y-title"
								type="text" size="30"
								minlength="3"
								.value=${this.local('from_data.y_title_default')}
							>
						</div>
						${this._renderEditControls()}
						<he-svg
							${ref(this._imageContainerRef)}
							id="image-container"
							?hidden=${! this._manifest}
						></he-svg>
						<p id="status_message"></p>
					</div>
				</section>
			</main>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'in-from-data-page': InChartFromDataPage,
	}
}
