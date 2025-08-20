import { AllSeriesData } from '@fizz/paramanifest';
import { AxisOrientation } from '@fizz/paramodel';
import { BasicXYChartSummarizer } from '@fizz/parasummary';
import { ButtonDescriptor } from '@fizz/ui-components';
import { ChartType as ChartType_2 } from '@fizz/paramanifest';
import { ClassInfo } from 'lit/directives/class-map.js';
import { CSSResult } from 'lit';
import { DataPoint } from '@fizz/paramodel';
import { Datatype } from '@fizz/dataframe';
import { Datatype as Datatype_2 } from '@fizz/paramanifest';
import { Dialog } from '@fizz/ui-components';
import { DirectiveResult } from 'lit-html/directive.js';
import { FacetSignature } from '@fizz/paramodel';
import { FormatType } from '@fizz/parasummary';
import { Interval } from '@fizz/chart-classifier-utils';
import { LitElement } from 'lit';
import { Manifest } from '@fizz/paramanifest';
import { MessageDialog } from '@fizz/ui-components';
import { Model } from '@fizz/paramodel';
import { Padding as Padding_2 } from './base_view';
import { Padding as Padding_3 } from '../base_view';
import { PaddingInput as PaddingInput_2 } from './base_view';
import { PaddingInput as PaddingInput_3 } from '../base_view';
import papa from 'papaparse';
import { PropertyValueMap } from 'lit';
import { PropertyValues } from 'lit';
import { Ref } from 'lit-html/directives/ref.js';
import { Ref as Ref_2 } from 'lit/directives/ref.js';
import { RefDirective } from 'lit-html/directives/ref.js';
import * as sb from '@fizz/sparkbraille-component';
import { Series } from '@fizz/paramodel';
import { Size2d } from '@fizz/chart-classifier-utils';
import { State } from '@lit-app/state';
import { StateController } from '@lit-app/state';
import { StaticValue } from 'lit-html/static.js';
import { StyleInfo } from 'lit-html/directives/style-map.js';
import { StyleInfo as StyleInfo_2 } from 'lit/directives/style-map.js';
import { Summarizer } from '@fizz/parasummary';
import { TabDetails } from '@fizz/ui-components';
import { TemplateResult } from 'lit';
import { TemplateResult as TemplateResult_2 } from 'lit-html';
import * as ui from '@fizz/ui-components';
import { View as View_2 } from '../base_view';
import { XYDatapoint } from '@fizz/paramodel';

/**
 * @public
 */
declare class AdvancedControlSettingsDialog extends AdvancedControlSettingsDialog_base {
    protected _dialogRef: Ref<Dialog>;
    /**
     * Close button text.
     */
    btnText: string;
    static styles: CSSResult;
    connectedCallback(): void;
    render(): TemplateResult_2<1>;
    /**
     * Show the dialog
     */
    show(): Promise<void>;
}

declare const AdvancedControlSettingsDialog_base: {
    new (...args: any[]): {
        log(...data: any[]): void;
        logName(): string;
    };
} & typeof ParaComponent;

declare class AnnotationPanel extends ControlPanelTabPanel {
    /**
     * Annotation UI.
     */
    static styles: CSSResult[];
    constructor();
    showAnnotations(): TemplateResult_2<1>;
    selectAnnotation(event: Event): void;
    highlightAnnotation(annotationEl: HTMLElement): void;
    goToAnnotation(seriesName: string, recordLabel: string): void;
}

declare interface Announcement {
    text: string;
    clear?: boolean;
}

declare class AriaLive extends ParaComponent {
    announcement: Announcement;
    protected _srb: ScreenReaderBridge;
    protected _voicing: Voicing;
    protected _ariaLiveRef: Ref<HTMLElement>;
    protected _history: readonly string[];
    protected _historyDialogRef: Ref<AriaLiveHistoryDialog>;
    protected _setHistory(history: readonly string[]): void;
    protected willUpdate(changedProperties: PropertyValues): void;
    protected firstUpdated(_changedProperties: PropertyValues): void;
    protected _initAriaLiveRegion(element: HTMLElement): void;
    showHistoryDialog(): void;
    clear(): void;
    replay(): void;
    static styles: CSSResult[];
    render(): TemplateResult_2<1>;
}

declare class AriaLiveHistoryDialog extends ParaComponent {
    protected _dialogRef: Ref_2<ui.Dialog>;
    /**
     * Close button text.
     */
    btnText: string;
    /**
     * Status bar history.
     */
    history: readonly string[];
    static styles: CSSResult;
    render(): TemplateResult_2<1>;
    /**
     * Show the dialog
     */
    show(): Promise<void>;
}

/** @public */
declare interface AxesSettings extends SettingGroup {
    minInterval: number;
    datapointMargin: number;
    x: XAxisSettings;
    y: YAxisSettings;
    horiz: OrientedAxisSettings<'horiz'>;
    vert: OrientedAxisSettings<'vert'>;
}

declare abstract class Axis<T extends AxisOrientation_2> extends Axis_base {
    readonly docView: DocumentView;
    readonly orientation: T;
    readonly coord: AxisCoord;
    protected _parent: Layout;
    readonly settings: DeepReadonly<AxisSettings>;
    readonly orientationSettings: DeepReadonly<OrientedAxisSettings<T>>;
    readonly datatype: Datatype;
    readonly chartLayers: ChartLayerManager;
    protected _labelInfo: AxisLabelInfo;
    protected _layout: Layout;
    protected _titleText: string;
    protected _orthoAxis: Axis<OrthoAxis<T>>;
    protected _axisTitle?: Label;
    protected _spacer: Spacer;
    protected _tickLabelTiers: TickLabelTier<T>[];
    protected _tickStrip: TickStrip | null;
    protected _axisLine: AxisLine<T>;
    protected _tickStep: number;
    protected _isInterval: boolean;
    protected _store: ParaStore;
    constructor(docView: DocumentView, orientation: T, coord: AxisCoord, title?: string, tickStep?: number);
    protected _createId(): string;
    isHoriz(): this is Axis<'horiz'>;
    isVert(): this is Axis<'vert'>;
    get asHoriz(): Axis<'horiz'>;
    get asVert(): Axis<'vert'>;
    get managedSettingKeys(): string[];
    get parent(): Layout;
    set parent(parent: Layout);
    get tickStep(): number;
    get isInterval(): boolean;
    get tickLabelTiers(): readonly TickLabelTier<T>[];
    get role(): string;
    get roleDescription(): string;
    get extraAttrs(): {
        attr: StaticValue;
        value: Datatype;
    }[];
    get viewGroup(): Layout;
    get titleText(): string;
    get range(): Interval | undefined;
    get orthoAxis(): Axis<OrthoAxis<T>>;
    set orthoAxis(orthoAxis: Axis<OrthoAxis<T>>);
    abstract settingDidChange(key: string, value: Setting | undefined): boolean;
    abstract setPosition(): void;
    createComponents(): void;
    abstract resize(width: number, height: number): void;
    layoutComponents(): void;
    protected abstract _createTickLabelTiers(): TickLabelTier<T>[];
    protected abstract _createTickStrip(): TickStrip<T>;
    protected abstract _createAxisLine(): void;
    updateTickLabelIds(): void;
    setAxisLabelText(text?: string): void;
    protected abstract _createSpacer(): void;
    protected _createAxisTitle(): void;
    protected _getAxisTitleAngle(): number;
    cleanup(): void;
}

declare const Axis_base: {
    new (...args: any[]): {
        render(): TemplateResult;
        readonly id: string;
        readonly x: number;
        readonly y: number;
        width: number;
        height: number;
        readonly children: readonly View[];
        get padding(): Padding_2;
        set padding(_padding: PaddingInput_2 | number);
        hidden: boolean;
        readonly el: SVGElement | null;
        renderChildren(): TemplateResult;
        content(..._options: any[]): TemplateResult;
        readonly classInfo?: string | undefined;
        readonly styleInfo?: StyleInfo | undefined;
        readonly role?: string | undefined;
        readonly roleDescription?: string | undefined;
        readonly ref?: DirectiveResult<RefDirective> | null | undefined;
    };
} & typeof View;

declare type AxisCoord = 'x' | 'y';

declare class AxisInfo {
    protected _store: ParaStore;
    protected _options: AxisOptions;
    protected _xLabelInfo: AxisLabelInfo;
    protected _yLabelInfo: AxisLabelInfo;
    constructor(_store: ParaStore, _options: AxisOptions);
    get xLabelInfo(): AxisLabelInfo;
    get yLabelInfo(): AxisLabelInfo;
    get options(): AxisOptions;
    protected _computeXLabels(xMin: number, xMax: number): AxisLabelInfo;
    protected _computeYLabels(yMin: number, yMax: number): AxisLabelInfo;
    protected _computeXLabelInfo(): void;
    protected _computeYLabelInfo(): void;
}

declare interface AxisLabelInfo {
    min?: number;
    max?: number;
    range?: number;
    labelTiers: (Tier | ChildTier)[];
}

/**
 * An axis line.
 */
declare abstract class AxisLine<T extends AxisOrientation_2> extends View {
    readonly axis: Axis<T>;
    constructor(axis: Axis<T>, length: number);
    get length(): number;
    set length(length: number);
    protected _createId(..._args: any[]): string;
    protected abstract getLineD(): string;
    render(): TemplateResult_2<2>;
}

/** @public */
declare interface AxisLineSettings extends SettingGroup {
    isDrawEnabled?: boolean;
    isDrawOverhangEnabled?: boolean;
    strokeWidth: number;
    strokeLinecap: string;
}

declare interface AxisOptions {
    xValues?: readonly number[];
    yValues: readonly number[];
    yMin?: number;
    yMax?: number;
    xTiers?: (Tier | ChildTier)[];
    yTiers?: (Tier | ChildTier)[];
    isXInterval?: boolean;
    isYInterval?: boolean;
}

declare type AxisOrientation_2 = 'horiz' | 'vert';

/** @public */
declare interface AxisSettings extends SettingGroup {
    title: AxisTitleSettings;
    line: AxisLineSettings;
    tick: TickSettings;
    minValue?: number;
    maxValue?: number;
}

/** @public */
declare interface AxisTitleSettings extends SettingGroup {
    isDrawTitle?: boolean;
    text?: string;
    gap: number;
    fontSize: number;
    align?: 'start' | 'middle' | 'end';
    position?: 'top' | 'bottom';
}

declare type BarClusterMode = 'facet';

/** @public */
declare interface BarSettings extends PlotSettings {
    barWidth: number;
    colorByDatapoint: boolean;
    isDrawStackLabels: boolean;
    isStackLabelInsideBar: boolean;
    stackLabelGap: number;
    isDrawRecordLabels: boolean;
    isDrawValueLabels: boolean;
    clusterBy?: BarClusterMode;
    stackContent: StackContentOptions;
    stackCount: number;
    orderBy?: string;
    clusterGap: number;
    barGap: number;
    isAbbrevSeries: boolean;
    clusterLabelFormat: LabelFormat;
    lineWidth: number;
}

declare class BaseView {
    get id(): string;
    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;
    set width(_newWidth: number);
    set height(_newHeight: number);
    get children(): readonly View[];
    get padding(): Padding;
    set padding(_padding: PaddingInput | number);
    get hidden(): boolean;
    set hidden(_hidden: boolean);
    get el(): SVGElement | null;
    renderChildren(): TemplateResult;
    content(..._options: any[]): TemplateResult;
    render(...options: any[]): TemplateResult;
}

/** @public */
declare type BoxStyle = {
    outline: Color;
    outlineWidth: number;
    fill: Color;
};

declare interface ButtonSettingControlOptions {
}

/**
 * Which direction is "up" on a chart.
 * @public
 */
declare type CardinalDirection = VertDirection | HorizDirection;

/**
 * Contains all chart series views.
 * @public
 */
declare class ChartLandingView extends View {
    protected _parent: DataLayer;
    protected _children: SeriesView[];
    protected _createId(): string;
    get parent(): DataLayer;
    set parent(parent: DataLayer);
    get children(): readonly SeriesView[];
    get datapointViews(): DatapointView[];
    get focusLeaf(): DataView_2;
    onFocus(isNewComponentFocus?: boolean): void;
    getSeriesView(seriesName: string): SeriesView | undefined;
    chartSummary(): string;
    content(): TemplateResult_2<2>;
}

declare abstract class ChartLayer extends ChartLayer_base {
    protected _parent: ChartLayerManager;
    protected _createId(id: string): string;
    protected _addedToParent(): void;
    get parent(): ChartLayerManager;
    set parent(parent: ChartLayerManager);
}

declare const ChartLayer_base: {
    new (...args: any[]): {
        render(): TemplateResult_2;
        readonly id: string;
        readonly x: number;
        readonly y: number;
        width: number;
        height: number;
        readonly children: readonly View[];
        get padding(): Padding_2;
        set padding(_padding: PaddingInput_2 | number);
        hidden: boolean;
        readonly el: SVGElement | null;
        renderChildren(): TemplateResult_2;
        content(..._options: any[]): TemplateResult_2;
        readonly classInfo?: string | undefined;
        readonly styleInfo?: StyleInfo | undefined;
        readonly role?: string | undefined;
        readonly roleDescription?: string | undefined;
        readonly ref?: DirectiveResult<RefDirective> | null | undefined;
    };
} & typeof View;

declare class ChartLayerManager extends View {
    readonly docView: DocumentView;
    protected _parent: Layout;
    protected _logicalWidth: number;
    protected _logicalHeight: number;
    private _orientation;
    private dataLayers;
    private _highlightsLayer;
    private _selectionLayer;
    constructor(docView: DocumentView);
    protected _createId(): string;
    get parent(): Layout;
    set parent(parent: Layout);
    createLayers(): void;
    /** Physical width of the chart; i.e., width onscreen after any rotation. */
    get width(): number;
    set width(width: number);
    /** Physical height of the chart; i.e., height onscreen after any rotation. */
    get height(): number;
    set height(height: number);
    get logicalWidth(): number;
    set logicalWidth(logicalWidth: number);
    get logicalHeight(): number;
    set logicalHeight(logicalHeight: number);
    get orientation(): CardinalDirection;
    get dataLayer(): DataLayer;
    get highlightsLayer(): HighlightsLayer;
    get selectionLayer(): SelectionLayer;
    protected _resizeLayers(): void;
    private createDataLayers;
    getXAxisInterval(): Interval;
    getYAxisInterval(): Interval;
    getAxisInterval(coord: AxisCoord): Interval | undefined;
    updateLoc(): void;
    setLowVisionMode(lvm: boolean): void;
    render(): TemplateResult_2<2>;
}

declare class ChartPanel extends ControlPanelTabPanel {
    protected _generalSettingViewsRef: Ref<HTMLDivElement>;
    protected _chartSettingViewsRef: Ref<HTMLDivElement>;
    static styles: CSSResult[];
    render(): TemplateResult_2<1>;
}

/**
 * Basic point marker.
 */
declare class ChartPoint extends XYDatapointView {
    readonly chart: PointChart;
    static width: number;
    constructor(seriesView: SeriesView);
    get width(): number;
    get height(): number;
    get _selectedMarkerX(): number;
    get _selectedMarkerY(): number;
    protected _computeX(): number;
    protected _computeY(): number;
    computeLocation(): void;
}

/** @public */
declare interface ChartSettings extends SettingGroup {
    type: ChartType;
    size: Partial<Size2d>;
    title: TitleSettings;
    orientation: CardinalDirection;
    padding: string;
    fontFamily: string;
    fontWeight: string;
    strokeWidth: number;
    strokeHighlightScale: number;
    symbolStrokeWidth: number;
    symbolHighlightScale: number;
    hasDirectLabels: boolean;
    hasLegendWithDirectLabels: boolean;
    isDrawSymbols: boolean;
}

/** @public */
declare type ChartType = XYChartType | RadialChartType;

/** @public */
declare interface ChartTypeSettings extends SettingGroup {
    bar: BarSettings;
    column: BarSettings;
    line: LineSettings;
    scatter: ScatterSettings;
    pie: RadialSettings;
    donut: RadialSettings;
    gauge: RadialSettings;
    stepline: StepLineSettings;
    lollipop: LollipopSettings;
}

declare interface CheckboxSettingControlOptions {
}

declare type ChildTier = ChildTierItem[];

declare interface ChildTierItem {
    label: string;
    parent: number;
}

declare class Collision {
    protected _centerDiffX: number;
    protected _centerDiffY: number;
    protected _rSumX: number;
    protected _rSumY: number;
    constructor(_centerDiffX: number, _centerDiffY: number, _rSumX: number, _rSumY: number);
    escape(): CollisionEscape;
    escapeVector(): {
        x: number;
        y: number;
    };
}

declare interface CollisionEscape {
    dists: number[];
    shortest: number;
}

/** Any valid CSS color value */
declare type Color = RGB | RGBA | HSL | HSLA | HEX | ModernRGB | ModernHSL | ColorKeyword | CSSVar;

declare interface Color_2 {
    value: string;
    name: string;
    contrastValue?: string;
}

/** CSS color keywords (e.g. 'red', 'blue', 'transparent') */
declare type ColorKeyword = 'none' | 'transparent' | 'currentColor' | 'inherit' | 'initial' | 'unset' | 'aliceblue' | 'antiquewhite' | 'aqua' | 'aquamarine' | 'azure' | 'beige' | 'bisque' | 'black' | 'blanchedalmond' | 'blue' | 'blueviolet' | 'brown' | 'burlywood' | 'cadetblue' | 'chartreuse' | 'chocolate' | 'coral' | 'cornflowerblue' | 'cornsilk' | 'crimson' | 'cyan' | 'darkblue' | 'darkcyan' | 'darkgoldenrod' | 'darkgray' | 'darkgreen' | 'darkgrey' | 'darkkhaki' | 'darkmagenta' | 'darkolivegreen' | 'darkorange' | 'darkorchid' | 'darkred' | 'darksalmon' | 'darkseagreen' | 'darkslateblue' | 'darkslategray' | 'darkslategrey' | 'darkturquoise' | 'darkviolet' | 'deeppink' | 'deepskyblue' | 'dimgray' | 'dimgrey' | 'dodgerblue' | 'firebrick' | 'floralwhite' | 'forestgreen' | 'fuchsia' | 'gainsboro' | 'ghostwhite' | 'gold' | 'goldenrod' | 'gray' | 'green' | 'greenyellow' | 'grey' | 'honeydew' | 'hotpink' | 'indianred' | 'indigo' | 'ivory' | 'khaki' | 'lavender' | 'lavenderblush' | 'lawngreen' | 'lemonchiffon' | 'lightblue' | 'lightcoral' | 'lightcyan' | 'lightgoldenrodyellow' | 'lightgray' | 'lightgreen' | 'lightgrey' | 'lightpink' | 'lightsalmon' | 'lightseagreen' | 'lightskyblue' | 'lightslategray' | 'lightslategrey' | 'lightsteelblue' | 'lightyellow' | 'lime' | 'limegreen' | 'linen' | 'magenta' | 'maroon' | 'mediumaquamarine' | 'mediumblue' | 'mediumorchid' | 'mediumpurple' | 'mediumseagreen' | 'mediumslateblue' | 'mediumspringgreen' | 'mediumturquoise' | 'mediumvioletred' | 'midnightblue' | 'mintcream' | 'mistyrose' | 'moccasin' | 'navajowhite' | 'navy' | 'oldlace' | 'olive' | 'olivedrab' | 'orange' | 'orangered' | 'orchid' | 'palegoldenrod' | 'palegreen' | 'paleturquoise' | 'palevioletred' | 'papayawhip' | 'peachpuff' | 'peru' | 'pink' | 'plum' | 'powderblue' | 'purple' | 'rebeccapurple' | 'red' | 'rosybrown' | 'royalblue' | 'saddlebrown' | 'salmon' | 'sandybrown' | 'seagreen' | 'seashell' | 'sienna' | 'silver' | 'skyblue' | 'slateblue' | 'slategray' | 'slategrey' | 'snow' | 'springgreen' | 'steelblue' | 'tan' | 'teal' | 'thistle' | 'tomato' | 'turquoise' | 'violet' | 'wheat' | 'white' | 'whitesmoke' | 'yellow' | 'yellowgreen';

declare class Colors {
    protected _store: ParaStore;
    readonly palettes: Palette[];
    keys: Map<string, Key>;
    protected _colorMap: number[] | null;
    private primary;
    private accent;
    private active;
    constructor(_store: ParaStore);
    get paletteKey(): string;
    get palette(): Palette;
    setColorMap(...colors: string[]): void;
    addPalette(palette: Palette): void;
    indexOfPalette(key: string): number;
    colorAt(index: number): string;
    /**
     * Wrap color index if out of range.
     * @param index
     * @returns valid index
     */
    wrapColorIndex(index: number): number;
    /**
     * Get palette index of a color.
     * @param name
     * @returns index or -1 if not found
     */
    colorIndex(name: string): number;
    /**
     * Get palette index of a color value.
     * @param value
     * @returns index or -1 if not found
     */
    colorValueIndex(value: string): number;
    colorValue(color: string): string;
    colorValueAt(index: number): string;
    contrastValueAt(index: number): string;
    registerKey(key: string): void;
    getPaletteList(): void;
    selectPaletteWithKey(key: string): void;
    getHslComponents(hsla: string): {
        hue: number;
        h: number;
        saturation: number;
        s: number;
        lightness: number;
        l: number;
        alpha: number;
        a: number;
    };
    lighten(hsl: string, shade_count: number): string;
    generateSequentialPalette(hsl: string, count: number, is_lighter: boolean): string[];
}

/** @public */
declare interface ColorSettings extends SettingGroup {
    colorVisionMode: ColorVisionMode;
    isDarkModeEnabled: boolean;
    contrastLevel: number;
    colorPalette: string;
    /** comma-separated list of color names */
    colorMap?: string;
}

declare class ColorsPanel extends ControlPanelTabPanel {
    protected _state: StateController;
    static styles: CSSResult[];
    connectedCallback(): void;
    render(): TemplateResult_2<1>;
}

/** @public */
declare type ColorVisionMode = 'normal' | 'deutan' | 'protan' | 'tritan' | 'grayscale';

/** @public */
declare interface ControlPanelSettings extends SettingGroup {
    isControlPanelDefaultOpen: boolean;
    tabLabelStyle: TabLabelStyle;
    isCaptionVisible: boolean;
    isStatusBarVisible: boolean;
    isSparkBrailleVisible: boolean;
    isDataTabVisible: boolean;
    isColorsTabVisible: boolean;
    isAudioTabVisible: boolean;
    isControlsTabVisible: boolean;
    isChartTabVisible: boolean;
    isAnnotationsTabVisible: boolean;
    isAnalysisTabVisible: boolean;
    isSparkBrailleControlVisible: boolean;
    isColorPaletteControlVisible: boolean;
    isCVDControlVisible: boolean;
}

declare abstract class ControlPanelTabPanel extends SettingControlContainer {
    _controlPanel: ParaControlPanel;
    get controlPanel(): ParaControlPanel;
    set controlPanel(controlPanel: ParaControlPanel);
    static styles: CSSResult[];
}

declare class ControlsPanel extends ControlPanelTabPanel {
    protected _advancedControlDialogRef: Ref<AdvancedControlSettingsDialog>;
    static styles: CSSResult[];
    connectedCallback(): void;
    protected _getHelp(): TemplateResult_2<1>;
    showHelpDialog(): void;
    protected _getKeyTable(): TemplateResult_2<1>;
    render(): TemplateResult_2<1>;
}

/** CSS custom property reference (e.g. var(--my-color)) */
declare type CSSVar = `var(${string})`;

declare interface DataCursor {
    seriesKey: string;
    index: number;
}

/**
 * Abstract base class for a data layer view where chart datapoints are rendered.
 * @public
 */
declare abstract class DataLayer extends ChartLayer {
    readonly dataLayerIndex: number;
    protected _parent: ChartLayerManager;
    soniNoteIndex: number;
    soniSequenceIndex: number;
    protected _sonifier: Sonifier;
    protected visibleSeries: string[];
    protected _chartLandingView: ChartLandingView;
    protected _playInterval: ReturnType<typeof setTimeout> | null;
    protected _speedRateIndex: number;
    protected _axisInfo: AxisInfo | null;
    protected _soniInterval: ReturnType<typeof setTimeout> | null;
    protected _soniRiffInterval: ReturnType<typeof setTimeout> | null;
    protected _soniSpeedRateIndex: number;
    protected _soniRiffSpeedRateIndex: number;
    constructor(paraview: ParaView, dataLayerIndex: number);
    protected _createId(): string;
    protected _addedToParent(): void;
    get managedSettingKeys(): string[];
    get settings(): DeepReadonly<PlotSettings>;
    get sonifier(): Sonifier;
    get chartLandingView(): ChartLandingView;
    get datapointViews(): DatapointView[];
    get visitedDatapointViews(): DatapointView[];
    get selectedDatapointViews(): DatapointView[];
    get dataset(): SVGGElement;
    get axisInfo(): AxisInfo | null;
    get role(): string;
    get ref(): DirectiveResult<RefDirective>;
    init(): void;
    protected abstract _createDatapoints(): void;
    protected _beginLayout(): void;
    protected _completeLayout(): void;
    protected _newDatapointView(seriesView: SeriesView, ..._rest: any[]): DatapointView;
    protected _newSeriesView(seriesKey: string, isStyleEnabled?: boolean, ..._rest: any[]): SeriesView;
    legend(): LegendItem[];
    datapointView(seriesKey: string, index: number): DatapointView | undefined;
    getDatapointView(seriesName: string, recordLabel: string): DatapointView | undefined;
    datapointViewForId(id: string): DatapointView | undefined;
    /**
     * Move focus to the navpoint to the right, if there is one
     */
    abstract moveRight(): void;
    /**
     * Move focus to the navpoint to the left, if there is one
     */
    abstract moveLeft(): void;
    abstract moveUp(): void;
    abstract moveDown(): void;
    protected abstract _goSeriesMinMax(isMin: boolean): void;
    protected abstract _goChartMinMax(isMin: boolean): void;
    /**
     * Clear outstanding play intervals/timeouts
     */
    clearPlay(): void;
    /**
     * Play all datapoints to the right, if there are any
     */
    abstract playRight(): void;
    /**
     * Play all datapoints to the left, if there are any
     */
    abstract playLeft(): void;
    abstract playSeriesRiff(): void;
    selectCurrent(extend?: boolean): void;
    clearDatapointSelection(quiet?: boolean): void;
    cleanup(): void;
    abstract setLowVisionMode(lvm: boolean): void;
    protected queryData(): void;
}

declare class DataPanel extends ControlPanelTabPanel {
    sparkBrailleData: string;
    isSparkBrailleVisible: boolean;
    protected _sparkBrailleRef: Ref<sb.SparkBraille>;
    protected _sparkBrailleWrapperRef: Ref<HTMLDivElement>;
    protected _saveChart(): void;
    static styles: CSSResult[];
    render(): TemplateResult_2<1>;
}

/**
 * Abstract base class for views representing datapoint values
 * (e.g., bar chart bars, pie slices, etc.).
 * @public
 */
declare class DatapointView extends DataView_2 {
    protected _parent: SeriesView;
    protected _shape: Shape | null;
    protected _symbol: DataSymbol | null;
    constructor(seriesView: SeriesView);
    protected _addedToParent(): void;
    get parent(): SeriesView;
    set parent(parent: SeriesView);
    get sameIndexers(): this[];
    get withSameIndexers(): this[];
    get nextSeriesLanding(): SeriesView | null;
    get prevSeriesLanding(): SeriesView | null;
    get datapoint(): DataPoint;
    get selectedMarker(): Shape;
    get shape(): Shape | null;
    get classInfo(): ClassInfo;
    get color(): number;
    get styleInfo(): StyleInfo_2;
    get ref(): Ref<SVGElement>;
    get el(): SVGElement;
    get x(): number;
    set x(x: number);
    get y(): number;
    set y(y: number);
    protected _createId(..._args: any[]): string;
    protected _visit(_isNewComponentFocus?: boolean): void;
    onFocus(isNewComponentFocus?: boolean): void;
    /** Compute and set `x` and `y` */
    computeLocation(): void;
    /** Do any other layout (which may depend on the location being set) */
    completeLayout(): void;
    /**
     * Subclasses should override this;
     * If there will be a shape, first set `this._shape`,
     * THEN call `super._createShape()`.
     * Otherwise, override with an empty method.
     */
    protected _createShape(): void;
    protected _createSymbol(): void;
    layoutSymbol(): void;
    protected get _symbolScale(): number;
    protected get _symbolColor(): number | undefined;
    protected _composeSelectionAnnouncement(isExtend: boolean): string;
    select(isExtend: boolean): void;
    content(): TemplateResult;
}

declare type DataState = 'initial' | 'pending' | 'complete' | 'error';

/**
 * @remarks
 * Unlike the default for `Views`, `x` and `y` here locate the center of
 * the shape, rather than the top left corner.
 */
declare class DataSymbol extends View {
    private classes;
    readonly type: DataSymbolType;
    protected _options: DataSymbolOptions;
    protected _defsKey: string;
    protected _styleInfo: StyleInfo_2;
    protected _role: string;
    static fromType(paraview: ParaView, type: DataSymbolType, options?: Partial<DataSymbolOptions>, classes?: string[]): DataSymbol;
    constructor(paraview: ParaView, shape: DataSymbolShape, fill: DataSymbolFill, options?: Partial<DataSymbolOptions>, classes?: string[]);
    get width(): number;
    get height(): number;
    get shape(): DataSymbolShape;
    get fill(): DataSymbolFill;
    get color(): number | undefined;
    set color(color: number | undefined);
    get scale(): number;
    set scale(scale: number);
    get styleInfo(): StyleInfo_2;
    set styleInfo(styleInfo: StyleInfo_2);
    get role(): string;
    set role(role: string);
    protected _updateStyleInfo(): void;
    content(): TemplateResult_2<2>;
}

declare type DataSymbolFill = 'outline' | 'solid';

declare interface DataSymbolOptions {
    strokeWidth: number;
    scale: number;
    color?: number;
    dashed: boolean;
    lighten?: boolean;
}

declare class DataSymbols {
    readonly shapes: readonly DataSymbolShape[];
    readonly fills: readonly DataSymbolFill[];
    types: readonly DataSymbolType[];
    symbolAt(index: number): DataSymbolType;
}

declare type DataSymbolShape = 'circle' | 'square' | 'triangle_up' | 'diamond' | 'plus' | 'star' | 'triangle_down' | 'x';

declare type DataSymbolType = `${DataSymbolShape}.${DataSymbolFill}` | 'default';

/** @public */
declare interface DataTableSettings extends SettingGroup {
    xValueFormat: LabelFormat;
    yValueFormat: LabelFormat;
}

/**
 * Abstract base class for datapoint and series views.
 * @public
 */
declare class DataView_2 extends View {
    readonly chart: DataLayer;
    readonly seriesKey: string;
    protected _children: DataView_2[];
    protected _prev: this | null;
    protected _next: this | null;
    protected _currFocus: DataView_2 | null;
    protected _prevFocus?: DataView_2;
    protected _series: Series;
    protected _isStyleEnabled: boolean;
    constructor(chart: DataLayer, seriesKey: string);
    get series(): Series;
    get seriesProps(): SeriesProperties;
    get children(): readonly DataView_2[];
    get siblings(): readonly this[];
    get withSiblings(): this[];
    get prev(): this | null;
    get next(): this | null;
    get currFocus(): View | null;
    set currFocus(view: View | null);
    get prevFocus(): DataView_2 | undefined;
    get color(): number;
    get styleInfo(): StyleInfo_2;
    onFocus(_isNewComponentFocus?: boolean): void;
    select(_extend: boolean): void;
}

declare type DeepReadonly<T> = {
    readonly [Property in keyof T]: T extends Setting ? T[Property] : DeepReadonly<T[Property]>;
};

declare class DescriptionPanel extends ControlPanelTabPanel {
    caption: string;
    visibleStatus: string;
    static styles: CSSResult[];
    clearStatusBar(): void;
    render(): TemplateResult_2<1>;
}

/** @public */
declare interface DevSettings extends SettingGroup {
    isDebug: boolean;
}

/**
 * Root of the view hierarchy.
 */
declare class DocumentView extends DocumentView_base {
    readonly type: ChartType_2;
    protected _chartLayers: ChartLayerManager;
    protected _seriesLabelStrip: SeriesLabelStrip | null;
    protected _titleLabel?: Label;
    protected _horizAxis?: HorizAxis;
    protected _vertAxis?: VertAxis;
    protected _titleText: string;
    protected _grid: GridLayout;
    protected _legends: Legends;
    protected _store: ParaStore;
    constructor(paraview: ParaView);
    /**
     * Parse `padding` like CSS padding (1-4 numbers, same order as CSS)
     */
    protected _parsePadding(padding: string): Padding;
    protected _populateGrid(): void;
    protected _createId(): string;
    get role(): string;
    get roleDescription(): string;
    get chartLayers(): ChartLayerManager;
    get titleText(): string;
    setTitleText(text?: string): void;
    get horizAxis(): HorizAxis | undefined;
    get vertAxis(): VertAxis | undefined;
    get xAxis(): HorizAxis | VertAxis | undefined;
    get yAxis(): HorizAxis | VertAxis | undefined;
    getAxisForCoord(coord: AxisCoord): HorizAxis | VertAxis | undefined;
    private createTitle;
    cleanup(): void;
    addLegend(position: CardinalDirection): void;
    setLowVisionMode(lvm: boolean): void;
}

declare const DocumentView_base: {
    new (...args: any[]): {
        render(): TemplateResult_2;
        readonly id: string;
        readonly x: number;
        readonly y: number;
        width: number;
        height: number;
        readonly children: readonly View[];
        get padding(): Padding;
        set padding(_padding: PaddingInput_2 | number);
        hidden: boolean;
        readonly el: SVGElement | null;
        renderChildren(): TemplateResult_2;
        content(..._options: any[]): TemplateResult_2;
        readonly classInfo?: string | undefined;
        readonly styleInfo?: StyleInfo | undefined;
        readonly role?: string | undefined;
        readonly roleDescription?: string | undefined;
        readonly ref?: DirectiveResult<RefDirective> | null | undefined;
    };
} & typeof View;

declare interface DropdownSettingControlOptions {
    /** Visible dropdown options; used as setting values if `values` not given. */
    options: string[];
    /** Optional setting values. */
    values?: string[];
}

export declare type FieldInfo = {
    name: string;
    type: Datatype_2;
};

declare const FORMAT_CONTEXT_SETTINGS: {
    xTick: string;
    yTick: string;
    linePoint: string;
    scatterPoint: string;
    barCluster: string;
    pieSliceLabel: string;
    pieSliceValue: string;
    donutSliceLabel: string;
    gaugeSliceLabel: string;
    steplinePoint: string;
    lollipopPoint: string;
    lollipopCluster: string;
    jimX: string;
    dataTableX: string;
    dataTableY: string;
    statusBar: string;
    domId: string;
};

/**
 * Context where a particular value appears.
 * @public
 */
declare type FormatContext = keyof typeof FORMAT_CONTEXT_SETTINGS;

/**
 * Grid layout for views.
 */
declare class GridLayout extends Layout {
    private _numCols;
    private _rowGaps;
    private _colGaps;
    private _rowAligns;
    private _colAligns;
    private _rows;
    private _territories;
    private _hRules;
    private _vRules;
    constructor(paraview: ParaView, options: GridOptionsInput, id?: string);
    get padding(): Padding;
    set padding(padding: PaddingInput | number);
    get numRows(): number;
    get numCols(): number;
    get rowGaps(): number | number[];
    get colGaps(): number | number[];
    get rowAligns(): SnapLocation_2 | SnapLocation_2[];
    get colAligns(): SnapLocation_2 | SnapLocation_2[];
    set numCols(numCols: number);
    set rowGaps(rowGaps: number | number[]);
    protected _expandRowGaps(rowGaps: number | number[]): number[];
    set colGaps(colGaps: number | number[]);
    protected _expandColGaps(colGaps: number | number[]): any[];
    set rowAligns(rowAligns: SnapLocation_2 | SnapLocation_2[]);
    protected _expandRowAligns(rowAligns: SnapLocation_2 | SnapLocation_2[]): SnapLocation_2[];
    set colAligns(colAligns: SnapLocation_2 | SnapLocation_2[]);
    protected _expandColAligns(colAligns: SnapLocation_2 | SnapLocation_2[]): any[];
    addColumnLeft(): void;
    addRowBottom(): void;
    insertRow(index: number): void;
    protected _resetRules(): void;
    protected _defaultMargin(x: number, y: number): Padding;
    protected _claimTerritory(child: View, territory?: GridTerritoryInput): void;
    append(child: View, territory?: GridTerritoryInput): void;
    prepend(child: View, territory?: GridTerritory): void;
    protected _didAddChild(kid: View): void;
    protected _didRemoveChild(kid: View): void;
    protected _firstEmptyCell(): number[];
    protected _arrangeChild(kid: View): void;
    protected _adjustRules(kid: View): void;
    protected _contractRules(): void;
    protected _computeColGap(index: number): number;
    protected _computeRowGap(index: number): number;
    protected _leftGapIndex(x: number): number;
    protected _rightGapIndex(x: number): number;
    protected _topGapIndex(y: number): number;
    protected _bottomGapIndex(y: number): number;
    protected _adjustGaps(kid: View): void;
    protected _updateGaps(): void;
    protected _arrangeChildren(): void;
    protected _childDidResize(kid: View): void;
    computeSize(): [number, number];
    layoutViews(): void;
    protected _snapChildX(kid: View): void;
    protected _snapChildY(kid: View): void;
}

declare interface GridOptionsInput {
    numCols: number;
    rowGaps?: number | number[];
    colGaps?: number | number[];
    rowAligns?: SnapLocation_2 | SnapLocation_2[];
    colAligns?: SnapLocation_2 | SnapLocation_2[];
}

/** @public */
declare interface GridSettings extends SettingGroup {
    isDrawHorizLines: boolean;
    isDrawVertLines: boolean;
    isDrawHorizAxisOppositeLine: boolean;
    isDrawVertAxisOppositeLine: boolean;
}

declare interface GridTerritory extends GridTerritoryInput {
    width: number;
    height: number;
    margin: Padding;
}

declare interface GridTerritoryInput {
    x: number;
    y: number;
    width?: number;
    height?: number;
    rowAlign?: SnapLocation_2;
    colAlign?: SnapLocation_2;
    margin?: PaddingInput | number;
}

/** Hexadecimal color (e.g. #ff0000, #f00) */
declare type HEX = `#${string}`;

declare class HighlightsLayer extends ChartLayer {
    protected _createId(): string;
    content(): TemplateResult_2<2>;
}

/**
 * A horizontal axis.
 * @internal
 */
declare class HorizAxis extends Axis<'horiz'> {
    constructor(docView: DocumentView, title?: string, tickStep?: number);
    computeSize(): [number, number];
    settingDidChange(key: string, value: any): boolean;
    protected _createTickLabelTiers(): HorizTickLabelTier[];
    protected _createTickStrip(): HorizTickStrip;
    protected _createAxisLine(): void;
    protected _createSpacer(): void;
    resize(width: number, height: number): void;
    layoutComponents(): void;
    setPosition(): void;
}

/** @public */
declare type HorizDirection = 'east' | 'west';

/**
 * A horizontal tier of tick labels.
 */
declare class HorizTickLabelTier extends TickLabelTier<'horiz'> {
    protected get _labelTextAnchor(): LabelTextAnchor;
    protected get _labelWrapWidth(): number;
    computeSize(): [number, number];
    protected _tickLabelX(index: number): number;
    protected _tickLabelY(index: number): number;
    createTickLabels(): void;
    protected _checkLabelSpacing(): void;
}

/**
 * A horizontal strip of tick marks.
 */
declare class HorizTickStrip extends TickStrip<'horiz'> {
    computeSize(): [number, number];
    get _length(): number;
    resize(width: number, height: number, interval: number): void;
    protected _createRules(): void;
}

/** HSL color in functional notation (e.g. hsl(0, 100%, 50%)) */
declare type HSL = `hsl(${number}, ${number}%, ${number}%)`;

/** HSLA color in functional notation (e.g. hsla(0, 100%, 50%, 0.5)) */
declare type HSLA = `hsla(${number}, ${number}%, ${number}%, ${number})`;

/** @public */
declare interface JimSettings extends SettingGroup {
    xValueFormat: LabelFormat;
}

declare interface Key {
    id?: string;
    index: number;
    base: string | null;
    light: null;
    dark: null;
}

/**
 * Keyboard event manager enables:
 * - registering/unregistering custom keyboard events
 * - generating documentations listing keyboard events
 * @internal
 */
declare class KeymapManager extends EventTarget {
    private keyDetails;
    constructor(registrations: KeyRegistrations);
    /**
     * Handle the keydown event
     * @param event - keydown event
     */
    /**
     * Register a hotkey.
     * @param keyId - the key ID string
     * @param details - the details of the key event
     * @param details.action - the action to perform if the key is pressed
     * @param details.caseSensitive - should the keypress be case sensitive?
     */
    registerHotkey(keyId: string, { action, caseSensitive }: KeyRegistration): void;
    /**
     * Register multiple hotkeys.
     * Effectively a shortcut to calling `.registerHotkey()` multiple times
     * @param keyRegistrations - hotkey registration info
     */
    registerHotkeys(keyRegistrations: KeyRegistrations): void;
    actionForKey(key: string): string | undefined;
    onKeydown(key: string): boolean;
}

/**
 * Associate a key event with an action.
 */
/**
 * Associates a key event with an action.
 */
declare interface KeyRegistration {
    label: string;
    /** ID of action to associate with this hotkey. */
    action: string;
    /** If the hotkey should be case sensitive. Default true. */
    caseSensitive?: boolean;
}

declare interface KeyRegistrations {
    [key: string]: KeyRegistration;
}

declare class Label extends View {
    private options;
    readonly classList: string[];
    protected _elRef: Ref_2<SVGTextElement>;
    protected _angle: number;
    protected _textAnchor: LabelTextAnchor;
    protected _justify: SnapLocation_2;
    protected _anchorXOffset: number;
    protected _anchorYOffset: number;
    protected _text: string;
    protected _textLines: TextLine[];
    protected _styleInfo: StyleInfo_2;
    constructor(paraview: ParaView, options: LabelOptions);
    protected _createId(): string;
    get el(): SVGTextElement;
    get text(): string;
    set text(text: string);
    get angle(): number;
    set angle(newAngle: number);
    get anchorXOffset(): number;
    get anchorYOffset(): number;
    get anchorX(): number;
    get anchorY(): number;
    get textAnchor(): LabelTextAnchor;
    set textAnchor(textAnchor: LabelTextAnchor);
    get bbox(): DOMRect;
    get left(): number;
    get right(): number;
    get top(): number;
    get bottom(): number;
    get styleInfo(): StyleInfo_2;
    set styleInfo(styleInfo: StyleInfo_2);
    computeSize(): [number, number];
    protected _makeTransform(): string | undefined;
    render(): TemplateResult_2<2>;
}

/** @public */
declare type LabelFormat = 'raw' | string;

declare interface LabelOptions {
    id?: string;
    classList?: string[];
    role?: string;
    text: string;
    loc?: Vec2;
    x?: number;
    y?: number;
    angle?: number;
    textAnchor?: LabelTextAnchor;
    isPositionAtAnchor?: boolean;
    justify?: SnapLocation_2;
    wrapWidth?: number;
}

/** @public */
declare interface LabelSettings extends SettingGroup {
    isDrawEnabled: boolean;
    margin: number;
    fontSize: number;
    color: Color;
}

declare type LabelTextAnchor = 'start' | 'middle' | 'end';

/**
 * Abstract base class for views that lay out multiple views but
 * otherwise create no DOM themselves.
 */
declare abstract class Layout extends View {
    constructor(paraview: ParaView, id?: string);
    get x(): number;
    get y(): number;
    set x(x: number);
    set y(y: number);
    setSize(width: number, height: number): void;
    abstract layoutViews(): void;
}

declare class Legend extends Legend_base {
    protected _items: LegendItem[];
    protected _options: Partial<LegendOptions>;
    protected _parent: Layout;
    protected _grid: GridLayout;
    protected _markers: Rect[];
    constructor(paraview: ParaView, _items: LegendItem[], _options?: Partial<LegendOptions>);
    get settings(): DeepReadonly<LegendSettings>;
    protected _addedToParent(): void;
    computeSize(): [number, number];
    content(): TemplateResult;
}

declare const Legend_base: {
    new (...args: any[]): {
        render(): TemplateResult;
        readonly id: string;
        readonly x: number;
        readonly y: number;
        width: number;
        height: number;
        readonly children: readonly View[];
        get padding(): Padding_2;
        set padding(_padding: PaddingInput_2 | number);
        hidden: boolean;
        readonly el: SVGElement | null;
        renderChildren(): TemplateResult;
        content(..._options: any[]): TemplateResult;
        readonly classInfo?: string | undefined;
        readonly styleInfo?: StyleInfo | undefined;
        readonly role?: string | undefined;
        readonly roleDescription?: string | undefined;
        readonly ref?: DirectiveResult<RefDirective> | null | undefined;
    };
} & typeof View;

declare interface LegendItem {
    label: string;
    symbol?: DataSymbolType;
    color: number;
    datapointIndex?: number;
}

declare type LegendItemOrder = 'lexical' | 'chart';

declare interface LegendOptions {
    orientation: LegendOrientation;
    wrapWidth: number;
}

declare type LegendOrientation = 'horiz' | 'vert';

declare type Legends = Partial<{
    [dir in CardinalDirection]: Legend;
}>;

/** @public */
declare interface LegendSettings extends SettingGroup {
    isDrawLegend: boolean;
    isDrawLegendWhenNeeded: boolean;
    isAlwaysDrawLegend: boolean;
    boxStyle: BoxStyle;
    padding: number;
    symbolLabelGap: number;
    pairGap: number;
    position: CardinalDirection;
    margin: number;
    itemOrder: LegendItemOrder;
}

/**
 * Class for drawing line charts.
 * @public
 */
declare class LineChart extends PointChart {
    protected _lowVisLineWidth: number | null;
    protected _addedToParent(): void;
    get datapointViews(): LineSection[];
    get settings(): DeepReadonly<LineSettings>;
    settingDidChange(key: string, value: any): boolean;
    protected _newDatapointView(seriesView: XYSeriesView): LineSection;
    setLowVisionMode(lvm: boolean): void;
    queryData(): void;
}

/**
 * Leader lines drawn from the endpoint of a series to its label.
 */
declare class LineLabelLeader extends View {
    private endpoint;
    private chart;
    private lineD;
    private endX;
    private endY;
    constructor(endpoint: LineSection, label: Label, chart: LineChart);
    get styles(): StyleInfo_2;
    content(): TemplateResult_2<2>;
}

/**
 * A visual indicator of a line chart datapoint, plus line segments
 * drawn halfway to its neighbors.
 */
declare class LineSection extends ChartPoint {
    readonly chart: LineChart;
    protected _prevMidX?: number;
    protected _prevMidY?: number;
    protected _nextMidX?: number;
    protected _nextMidY?: number;
    completeLayout(): void;
    protected _computePrev(): void;
    protected _computeNext(): void;
    protected _computeCentroid(): void;
    protected get _points(): Vec2[];
    get classInfo(): {
        dataLine: boolean;
    };
    get styleInfo(): StyleInfo;
    protected _createShape(): void;
}

/** @public */
declare interface LineSettings extends PointSettings {
    lineWidth: number;
    lineWidthMax: number;
    baseSymbolSize: number;
    seriesLabelPadding: number;
    leaderLineLength: number;
    isAlwaysShowSeriesLabel?: boolean;
}

declare type LoadFailure = {
    result: 'failure';
    error: string;
};

declare type LoadResult = LoadSuccess | LoadFailure;

declare type LoadSuccess = {
    result: 'success';
    manifest: Manifest;
    data?: AllSeriesData;
};

declare const Logger: {
    new (...args: any[]): {
        log(...data: any[]): void;
        logName(): string;
    };
} & {
    new (): {
        logName(): string;
    };
};

/** @public */
declare interface LollipopSettings extends BarSettings {
}

export { Manifest }

/** Modern space-separated HSL(A) notation (e.g. hsl(0 100% 50% / 50%)) */
declare type ModernHSL = `hsl(${number} ${number}% ${number}%${'' | ` / ${number}%`})`;

/** Modern space-separated RGB(A) notation (e.g. rgb(255 0 0 / 50%)) */
declare type ModernRGB = `rgb(${number} ${number} ${number}${'' | ` / ${number}%`})`;

/** @public */
declare interface OrientedAxisSettings<T extends AxisOrientation> extends SettingGroup {
    position: T extends 'horiz' ? VertDirection : HorizDirection;
    labelOrder: T extends 'horiz' ? 'westToEast' | 'eastToWest' : 'southToNorth' | 'northToSouth';
}

declare type OrthoAxis<T> = T extends 'horiz' ? 'vert' : 'horiz';

declare interface Padding {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

declare interface PaddingInput {
    all?: number;
    horiz?: number;
    vert?: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

declare interface Palette {
    key: string;
    title: string;
    cvd?: boolean;
    colors: Color_2[];
}

declare class ParaApi {
    protected _paraChart: ParaChart;
    constructor(_paraChart: ParaChart);
    serializeChart(): string;
}

export declare class ParaChart extends ParaChart_base {
    headless: boolean;
    accessor manifest: string;
    manifestType: SourceKind;
    accessor config: SettingsInput;
    accessor forcecharttype: ChartType_2 | undefined;
    protected _paraViewRef: Ref<ParaView>;
    protected _controlPanelRef: Ref<ParaControlPanel>;
    protected _ariaLiveRegionRef: Ref<AriaLive>;
    protected _manifest?: Manifest;
    protected _loader: ParaLoader;
    protected _inputSettings: SettingsInput;
    private data?;
    protected _suppleteSettingsWith?: DeepReadonly<Settings>;
    protected _readyPromise: Promise<void>;
    protected _loaderPromise: Promise<void> | null;
    constructor();
    get paraView(): ParaView;
    get controlPanel(): ParaControlPanel;
    get ready(): Promise<void>;
    get loaded(): Promise<void> | null;
    get loader(): ParaLoader;
    connectedCallback(): void;
    protected firstUpdated(_changedProperties: PropertyValues): void;
    willUpdate(changedProperties: PropertyValues<this>): void;
    static styles: CSSResult[];
    protected _runLoader(manifestInput: string, manifestType: SourceKind): Promise<void>;
    clearAriaLive(): void;
    showAriaLiveHistory(): void;
    render(): TemplateResult;
}

declare const ParaChart_base: {
    new (...args: any[]): {
        log(...data: any[]): void;
        logName(): string;
    };
} & typeof ParaComponent;

declare class ParaComponent extends LitElement {
    protected _store: ParaStore;
    protected _storeState: StateController<ParaStore>;
    get store(): ParaStore;
    set store(store: ParaStore);
    logName(): string;
}

declare class ParaControlPanel extends ParaControlPanel_base {
    sparkBrailleData: string;
    dataState: 'initial' | 'pending' | 'complete' | 'error';
    dataError?: unknown;
    paraChart: ParaChart;
    protected _isOpen: boolean;
    protected _tabDeetsRef: Ref_2<TabDetails>;
    protected _descriptionPanelRef: Ref_2<DescriptionPanel>;
    protected _dataPanelRef: Ref_2<DataPanel>;
    protected _colorsPanelRef: Ref_2<ColorsPanel>;
    protected _chartPanelRef: Ref_2<ChartPanel>;
    protected _annotationPanelRef: Ref_2<AnnotationPanel>;
    protected _controlsPanelRef: Ref_2<ControlsPanel>;
    protected _dialogRef: Ref_2<ParaDialog>;
    protected _msgDialogRef: Ref_2<MessageDialog>;
    static styles: CSSResult[];
    get settings(): DeepReadonly<ControlPanelSettings>;
    get managedSettingKeys(): string[];
    get descriptionPanel(): DescriptionPanel;
    get chartPanel(): ChartPanel;
    get annotationPanel(): AnnotationPanel;
    get dialog(): ParaDialog;
    connectedCallback(): void;
    private dataUpdated;
    settingDidChange(key: string, value: any): boolean;
    protected updated(changedProperties: PropertyValues): void;
    onFocus(): void;
    showHelpDialog(): void;
    render(): TemplateResult_2<1>;
    private renderDialog;
    private renderTabDebug;
    private getJsonStr;
}

declare const ParaControlPanel_base: {
    new (...args: any[]): {
        log(...data: any[]): void;
        logName(): string;
    };
} & typeof ParaComponent;

/**
 * Simple dialog that displays a message and a single
 * button to close the dialog.
 * @public
 */
declare class ParaDialog extends ParaComponent {
    /**
     * Title text.
     */
    title: string;
    /**
     * Close button text.
     */
    btnText: string;
    /**
     * Generic dialog.
     */
    contentArray: string[];
    /**
     * Content text.
     */
    protected _content: TemplateResult;
    protected _dialogRef: Ref_2<Dialog>;
    static styles: CSSResult;
    render(): TemplateResult<1>;
    /**
     * Show the dialog
     * @param contentArray - status bar display contentArray.
     */
    show(title: string, content?: TemplateResult): Promise<void>;
}

export declare class ParaHelper {
    protected _paraChart: ParaChart;
    protected _api: ParaApi;
    constructor();
    get ready(): Promise<void>;
    protected _createParaChart(): void;
    loadData(url: string): Promise<FieldInfo[]>;
    loadManifest(input: string, type?: SourceKind): Promise<void>;
    serializeChart(): string;
}

declare class ParaLoader {
    protected _csvParseResult: papa.ParseResult<unknown> | null;
    load(kind: SourceKind, manifestInput: string, chartType?: ChartType_2): Promise<LoadResult>;
    /**
     * Fetch and parse a CSV, storing the parse results.
     * @param url - CSV URL
     * @returns List of FieldInfo records
     */
    preloadData(url: string): Promise<FieldInfo[]>;
}

declare class ParaStore extends State {
    readonly symbols: DataSymbols;
    dataState: DataState;
    settings: Settings;
    darkMode: boolean;
    announcement: Announcement;
    protected data: AllSeriesData | null;
    protected focused: string;
    protected selected: null;
    protected queryLevel: string;
    protected _visitedDatapoints: DataCursor[];
    protected _prevVisitedDatapoints: DataCursor[];
    protected _selectedDatapoints: DataCursor[];
    protected _prevSelectedDatapoints: DataCursor[];
    protected _settingControls: SettingControlManager;
    protected _manifest: Manifest | null;
    protected _model: Model | null;
    protected _facets: FacetSignature[] | null;
    protected _type: ChartType_2;
    protected _title: string;
    protected _seriesProperties: SeriesPropertyManager | null;
    protected _colors: Colors;
    protected _keymapManager: KeymapManager;
    protected _prependAnnouncements: string[];
    protected _appendAnnouncements: string[];
    protected _summarizer: BasicXYChartSummarizer;
    idList: Record<string, boolean>;
    constructor(inputSettings: SettingsInput, suppleteSettingsWith?: DeepReadonly<Settings>);
    get settingControls(): SettingControlManager;
    get type(): "bar" | "lollipop" | "line" | "stepline" | "scatter" | "pie" | "donut" | "column";
    get model(): Model | null;
    get title(): string;
    get seriesProperties(): SeriesPropertyManager | null;
    get colors(): Colors;
    get keymapManager(): KeymapManager;
    get summarizer(): BasicXYChartSummarizer;
    setManifest(manifest: Manifest, data?: AllSeriesData): void;
    protected _propertyChanged(key: string, value: any): void;
    updateSettings(updater: (draft: Settings) => void): void;
    prependAnnouncement(msg: string): void;
    appendAnnouncement(msg: string): void;
    announce(msg: string | string[], clearAriaLive?: boolean): void;
    protected _joinStrArray(strArray: string[], linebreak?: string): string;
    get visitedDatapoints(): DataCursor[];
    get prevVisitedDatapoints(): DataCursor[];
    visit(datapoints: DataCursor[]): void;
    isVisited(seriesKey: string, index: number): boolean;
    isVisitedSeries(seriesKey: string): boolean;
    wasVisited(seriesKey: string, index: number): boolean;
    wasVisitedSeries(seriesKey: string): boolean;
    get selectedDatapoints(): DataCursor[];
    get prevSelectedDatapoints(): DataCursor[];
    select(datapoints: DataCursor[]): void;
    extendSelection(datapoints: DataCursor[]): void;
    isSelected(seriesKey: string, index: number): boolean;
    isSelectedSeries(seriesKey: string): boolean;
    wasSelected(seriesKey: string, index: number): boolean;
    wasSelectedSeries(seriesKey: string): boolean;
    getFormatType(context: FormatContext): FormatType;
}

declare class ParaView extends ParaView_base {
    paraChart: ParaChart;
    type: ChartType_2;
    chartTitle?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    contrastLevel: number;
    disableFocus: boolean;
    protected _controller: ParaViewController;
    protected _viewBox: ViewBox;
    protected _prevFocusLeaf?: View;
    protected _rootRef: Ref_2<SVGSVGElement>;
    protected _defsRef: Ref_2<SVGDefsElement>;
    protected _frameRef: Ref_2<SVGRectElement>;
    protected _dataspaceRef: Ref_2<SVGGElement>;
    protected _documentView?: DocumentView;
    private loadingMessageRectRef;
    private loadingMessageTextRef;
    private loadingMessageStyles;
    protected _chartRefs: Map<string, Ref_2<any>>;
    protected _fileSavePlaceholderRef: Ref_2<HTMLElement>;
    protected _summarizer: Summarizer;
    protected _pointerEventManager: PointerEventManager;
    protected _defs: {
        [key: string]: TemplateResult;
    };
    static styles: CSSResult[];
    get viewBox(): ViewBox;
    get root(): SVGSVGElement | undefined;
    get frame(): SVGRectElement | undefined;
    get dataspace(): SVGGElement | undefined;
    get documentView(): DocumentView | undefined;
    get prevFocusLeaf(): View | undefined;
    set prevFocusLeaf(view: View | undefined);
    get fileSavePlaceholder(): HTMLElement;
    get summarizer(): Summarizer;
    get defs(): {
        [key: string]: TemplateResult;
    };
    connectedCallback(): void;
    private dataUpdated;
    protected willUpdate(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    ref<T>(key: string): Ref_2<T>;
    unref(key: string): void;
    createDocumentView(contentWidth?: number): void;
    protected _computeViewBox(): void;
    updateViewbox(x?: number, y?: number, width?: number, height?: number): void;
    serialize(): string;
    protected _extractStyles(id: string): string;
    addDef(key: string, template: TemplateResult): void;
    protected _rootStyle(): {
        [prop: string]: any;
    };
    protected _rootClasses(): {
        darkmode: boolean;
    };
    setFullscreen(): void;
    render(): TemplateResult;
}

declare const ParaView_base: {
    new (...args: any[]): {
        log(...data: any[]): void;
        logName(): string;
    };
} & typeof ParaComponent;

declare class ParaViewController extends Logger {
    protected _store: ParaStore;
    constructor(_store: ParaStore);
    logName(): string;
    handleKeyEvent(event: KeyboardEvent): void;
}

/** @public */
declare interface PlotSettings extends SettingGroup {
}

declare interface Point {
    x: number;
    y: number;
}

/**
 * Abstract base class for charts that represent data values as points
 * (connected or not).
 */
declare abstract class PointChart extends XYChart {
    protected _addedToParent(): void;
    get datapointViews(): ChartPoint[];
    protected _newSeriesView(seriesKey: string): PointSeriesView;
    protected _newDatapointView(seriesView: SeriesView): ChartPoint;
    protected _createDatapoints(): void;
    seriesRef(series: string): Ref<SVGGElement>;
    raiseSeries(series: string): void;
    getDatapointGroupBbox(labelText: string): DOMRect;
    getTickX(idx: number): number;
}

/** @public */
declare type PointChartType = 'line' | 'stepline' | 'scatter';

declare interface PointerDetails {
    id: number;
    target: Element;
    x: number;
    y: number;
    value?: {
        x: any;
        y: any;
    };
}

/**
 * Pointer event manager enables:
 * - registering/unregistering custom pointer events
 * - generating documentations listing pointer events
 * @internal
 */
declare class PointerEventManager {
    protected _paraView: ParaView;
    private _dataRoot;
    private _dataRect;
    private _touchArray;
    private _currentTarget;
    private _selectedElement;
    private _selectedElements;
    private _highlightBoxes;
    private _coords;
    constructor(_paraView: ParaView);
    /**
     * Records pointer event info.
     * @param event - The event on the element.
     */
    protected _registerPointerEvent(event: PointerEvent): PointerDetails;
    /**
     * Starts pointer events.
     * @param event - The event on the element.
     */
    handleStart(event: PointerEvent): void;
    /**
     * Ends pointer events.
     * @param event - The event on the element.
     */
    handleEnd(event: PointerEvent): void;
    /**
     * Cancels pointer events.
     * @param event - The event on the element.
     */
    handleCancel(event: PointerEvent): void;
    /**
     * Reads element labels and default settings, and triggers speech.
     * @param event - The event on the element.
     */
    handleMove(event: PointerEvent): void;
    /**
     * .
     * @param event - The event on the element.
     */
    protected _updateTouchArray(event: PointerEvent): void;
    /**
     * Reads element labels and default settings, and triggers speech.
     * @param event - The event on the element.
     */
    handleClick(event: PointerEvent | MouseEvent): void;
    /**
     * Double click handler.
     * @param event - The event on the element.
     */
    handleDoubleClick(event: PointerEvent | MouseEvent): void;
    /**
     * Set selected element and add a highlight box.
     * @param target - The element to be selected; deselects if absent or `null`.
     */
    protected _selectElement(target: SVGGraphicsElement, isAdd?: boolean): void;
    /**
     * Remove selected element and remove its highlight box.
     * @param target - The element to be selected; deselects if absent or `null`.
     */
    protected _deselectElement(target: SVGGraphicsElement): void;
    /**
     * Deselect all elements.
     */
    protected _clearSelectedElements(): void;
    /**
     * Adjust the coordinates for transforms
     * @param event - The mouse event with the coordinates
     * @returns A coordinate point object with the proper transforms, as a 2-precision float
     */
    protected _localCoords(event: PointerEvent): Point;
}

declare class PointSeriesView extends XYSeriesView {
    get styleInfo(): StyleInfo;
}

/** @public */
declare interface PointSettings extends PlotSettings {
    pointLabelFormat: LabelFormat;
    selectedPointMarkerSize: Size2d;
}

/** @public */
declare type RadialChartType = 'pie' | 'donut' | 'gauge';

/** @public */
declare interface RadialSettings extends SettingGroup {
    categoryLabel: LabelSettings;
    valueLabel: LabelSettings;
    isRenderCenterLabel: boolean;
    annularThickness: number;
    categoryLabelPosition: SliceLabelPosition;
    categoryLabelFormat: LabelFormat;
    categoryLabelUnderlineGap: number;
    sliceValueFormat: LabelFormat;
}

declare interface RadioSettingControlOptions {
    buttons: {
        [key: string]: ButtonDescriptor;
    };
    layout?: 'horiz' | 'compress' | 'vert';
    wrap?: boolean;
}

declare class Rect extends Shape {
    constructor(paraview: ParaView, options: RectOptions);
    render(): TemplateResult_2<2>;
}

declare interface RectOptions extends ShapeOptions {
    width: number;
    height: number;
}

/** RGB color in functional notation (e.g. rgb(255, 0, 0)) */
declare type RGB = `rgb(${number}, ${number}, ${number})`;

/** RGBA color in functional notation (e.g. rgba(255, 0, 0, 0.5)) */
declare type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;

/** @public */
declare type riffSpeeds = 'slow' | 'medium' | 'fast';

/** @public */
declare interface ScatterSettings extends PointSettings {
}

/**
 * A class that will handle passing text to screen readers to speak.
 * When a user of this class passes in a "caption" element, the renderer will add a child element to the caption for
 * each string that the screen reader should speak. The renderer will also remove old child nodes when a new string is
 * spoken.
 * The "caption" element must have a specific list of aria attributes to properly work, see the static method
 * "addAriaAttributes" for more details.
 * @internal
 */
declare class ScreenReaderBridge {
    private static readonly PADDING_CHARACTER;
    private static readonly REMOVAL_DELAY;
    static readonly ORIGINAL_TEXT_ATTRIBUTE = "data-original-text";
    private readonly _element;
    private readonly _maxNumPaddingCharacters;
    private _numPaddingCharacters;
    private _lastCreatedElement;
    /**
     * Add the required aria attributes to an element for screen readers to properly work.
     * In order for the greatest number of screen reader and browser combinations to work, the following attributes must
     * be set on the element:
     * aria-live: assertive
     * roll: status
     * aria-atomic: true
     * aria-relevant: additions text
     * For the aria-live attribute, "polite" may also work, but that will create a queue of messages for the screen
     * reader to read out one after another which is probably not what you want.
     * @param element - the "caption" element which will host the messages for the screen reader to speak
     * @param [ariaLive] - the politeness of the aria-live attribute, one of "off", "assertive", or "polite"
     * @static
     */
    static addAriaAttributes(element: HTMLElement, ariaLive?: string): void;
    /**
     * Create a ScreenReaderBridge instance.
     * @param captionElement - the "caption" element, typically a span or div element
     */
    constructor(captionElement: HTMLElement);
    /**
     * The last created child element of the "caption" element.
     */
    get lastCreatedElement(): HTMLElement | null;
    /**
     * Clear the contents of the live region
     */
    clear(): void;
    /**
     * Insert the provided text into the aria-live region.
     * @param text - the text to inserts
     */
    render(text: string): void;
    /**
     * Pad the provided text with the padding character.
     * Padding the text tricks screen readers into speaking it, even if they think it should be suppressed.
     * @param text - the text to pad
     * @private
     */
    private _createPaddedText;
    /**
     * Remove any hidden elements that were hidden longer than the set milliseconds.
     * We wait to remove those elements even though they are hidden because some screen readers don't like the DOM
     * changing that much.
     * @private
     */
    private _removeOldElements;
}

declare class SelectionLayer extends ChartLayer {
    protected _createId(): string;
    get class(): string;
    content(): TemplateResult_2<2>;
}

/**
 * Strip of series labels and leader lines.
 * @public
 */
declare class SeriesLabelStrip extends SeriesLabelStrip_base {
    private _chart;
    protected seriesLabels: Label[];
    protected leaders: LineLabelLeader[];
    constructor(_chart: LineChart);
    computeSize(): [number, number];
    private resolveSeriesLabelCollisions;
}

declare const SeriesLabelStrip_base: {
    new (...args: any[]): {
        render(): TemplateResult_2;
        readonly id: string;
        readonly x: number;
        readonly y: number;
        width: number;
        height: number;
        readonly children: readonly View[];
        get padding(): Padding_2;
        set padding(_padding: PaddingInput_2 | number);
        hidden: boolean;
        readonly el: SVGElement | null;
        renderChildren(): TemplateResult_2;
        content(..._options: any[]): TemplateResult_2;
        readonly classInfo?: string | undefined;
        readonly styleInfo?: StyleInfo_2 | undefined;
        readonly role?: string | undefined;
        readonly roleDescription?: string | undefined;
        readonly ref?: DirectiveResult<RefDirective> | null | undefined;
    };
} & typeof View;

declare class SeriesProperties {
    readonly key: string;
    color: number;
    symbol: DataSymbolType;
    constructor(key: string, color: number, symbol: DataSymbolType);
}

declare class SeriesPropertyManager {
    private store;
    private seriesList;
    constructor(store: ParaStore);
    properties(key: string): SeriesProperties;
}

/**
 * Abstract base class for a view representing an entire series.
 * @public
 */
declare class SeriesView extends SeriesView_base {
    protected _parent: ChartLandingView;
    protected _children: DatapointView[];
    constructor(chart: DataLayer, seriesKey: string, isStyleEnabled?: boolean);
    protected _createId(): string;
    protected _seriesRef(series: string): Ref<SVGGElement>;
    get ref(): DirectiveResult<RefDirective>;
    get class(): string;
    get parent(): ChartLandingView;
    set parent(parent: ChartLandingView);
    get children(): readonly DatapointView[];
    nextSeriesLanding(): this | null;
    prevSeriesLanding(): this | null;
    protected _visit(): void;
    protected _composeSelectionAnnouncement(): string;
    select(isExtend: boolean): void;
    onFocus(): void;
    getDatapointViewForLabel(label: string): DatapointView | undefined;
}

declare const SeriesView_base: {
    new (...args: any[]): {
        render(): TemplateResult_2;
        readonly id: string;
        readonly x: number;
        readonly y: number;
        width: number;
        height: number;
        readonly children: readonly View_2[];
        get padding(): Padding_3;
        set padding(_padding: PaddingInput_3 | number);
        hidden: boolean;
        readonly el: SVGElement | null;
        renderChildren(): TemplateResult_2;
        content(..._options: any[]): TemplateResult_2;
        readonly classInfo?: string | undefined;
        readonly styleInfo?: StyleInfo_2 | undefined;
        readonly role?: string | undefined;
        readonly roleDescription?: string | undefined;
        readonly ref?: DirectiveResult<RefDirective> | null | undefined;
    };
} & typeof DataView_2;

/**
 * A single setting.
 * @public
 */
declare type Setting = string | number | boolean;

declare abstract class SettingControlContainer extends SettingControlContainer_base {
    protected _controlsState: StateController;
    connectedCallback(): void;
}

declare const SettingControlContainer_base: {
    new (...args: any[]): {
        log(...data: any[]): void;
        logName(): string;
    };
} & typeof ParaComponent;

/**
 * Info stored about a setting control.
 * @internal
 */
declare interface SettingControlInfo<T extends SettingControlType = SettingControlType> {
    /** Dotted path to the setting in the setting tree. */
    key: string;
    /** Setting control element reference. */
    /** Rendered DOM content for the control. */
    render: () => TemplateResult;
    /** Tag indicating where the setting control will be displayed. */
    parentView: string;
    /** Type-specific options. */
    options?: SettingControlOptionsType<T>;
    /** Optional function for validating input. */
    validator?: (value: Setting) => SettingValidationResult;
}

/**
 * Manages setting control information.
 */
declare class SettingControlManager extends State {
    protected _store: ParaStore;
    protected _settingControlInfo: {
        [key: string]: SettingControlInfo;
    };
    constructor(_store: ParaStore);
    add<T extends SettingControlType>(controlOptions: SettingControlOptions<T>): void;
    info(key: string): SettingControlInfo<SettingControlType>;
    getContent(parentView: string): TemplateResult[];
}

/**
 * Options supplied when creating a setting control.
 * @public
 */
declare interface SettingControlOptions<T extends SettingControlType = SettingControlType> {
    /** Dotted path to the setting in the setting tree. */
    key: string;
    /** Label displayed for the control. */
    label: string;
    /** Control type. */
    type: T;
    /** Type-specific options. */
    options?: SettingControlOptionsType<T>;
    /** Optional initial control value (defaults to setting value). */
    value?: SettingControlValueType<T>;
    /** Optional function for validating input. */
    validator?: (value: Setting) => SettingValidationResult;
    /** Whether control is initially hidden. */
    hidden?: boolean;
    /** Tag indicating where the setting control will be displayed. */
    parentView: string;
}

declare type SettingControlOptionsType<T extends SettingControlType> = T extends 'textfield' ? TextfieldSettingControlOptions : T extends 'dropdown' ? DropdownSettingControlOptions : T extends 'checkbox' ? CheckboxSettingControlOptions : T extends 'radio' ? RadioSettingControlOptions : T extends 'slider' ? SliderSettingControlOptions : T extends 'button' ? ButtonSettingControlOptions : never;

declare type SettingControlType = 'textfield' | 'dropdown' | 'checkbox' | 'radio' | 'slider' | 'button';

declare type SettingControlValueType<T extends SettingControlType> = T extends 'textfield' ? string | number : T extends 'dropdown' ? string : T extends 'checkbox' ? boolean : T extends 'radio' ? string : T extends 'slider' ? number : T extends 'button' ? boolean : never;

/**
 * A group of settings (which may contain nested setting groups).
 * @public
 */
declare type SettingGroup = {
    [key: string]: Setting | SettingGroup | undefined;
};

/** @public */
declare interface Settings extends SettingGroup {
    chart: ChartSettings;
    axis: AxesSettings;
    legend: LegendSettings;
    type: ChartTypeSettings;
    grid: GridSettings;
    ui: UISettings;
    controlPanel: ControlPanelSettings;
    color: ColorSettings;
    jim: JimSettings;
    dataTable: DataTableSettings;
    statusBar: StatusBarSettings;
    sonification: SonificationSettings;
    dev: DevSettings;
}

/**
 * A mapping of dotted setting paths to values.
 * @public
 */
declare type SettingsInput = {
    [path: string]: Setting;
};

declare type SettingValidationResult = {
    err?: string;
};

declare abstract class Shape extends View {
    protected _options: ShapeOptions;
    protected _role: string;
    protected _styleInfo: StyleInfo_2;
    protected _classInfo: ClassInfo;
    protected _ref: Ref_2<SVGElement> | null;
    constructor(paraview: ParaView, _options: ShapeOptions);
    get options(): ShapeOptions;
    get role(): string;
    set role(role: string);
    get styleInfo(): StyleInfo_2;
    set styleInfo(styleInfo: StyleInfo_2);
    get classInfo(): ClassInfo;
    set classInfo(classInfo: ClassInfo);
    get ref(): Ref_2<SVGElement> | null;
    set ref(ref: Ref_2<SVGElement> | null);
}

declare interface ShapeOptions {
    x?: number;
    y?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

declare type SliceLabelPosition = 'inside' | 'outside' | 'auto';

declare interface SliderSettingControlOptions {
    min?: number;
    max?: number;
    step?: number;
    lowBound?: number;
    highBound?: number;
    percent?: boolean;
    showValue?: boolean;
    compact?: boolean;
}

declare type SnapLocation = 'start' | 'end' | 'center';

declare type SnapLocation_2 = 'start' | 'end' | 'center';

/** @public */
declare interface SonificationSettings extends SettingGroup {
    isSoniEnabled: boolean;
    isRiffEnabled: boolean;
    isNotificationEnabled: boolean;
    isChordModeEnabled: boolean;
    hertzLower: number;
    hertzUpper: number;
    soniPlaySpeed?: number;
    riffSpeed?: riffSpeeds;
}

declare class Sonifier {
    private chart;
    protected _store: ParaStore;
    private context;
    private _audioEngine;
    private _providedAudioEngine?;
    constructor(chart: DataLayer, _store: ParaStore);
    /**
     * Confirm the audio engine was initialized
     */
    private _checkAudioEngine;
    /**
     * Get the available hertzes
     * @returns number[]
     */
    private _getHertzRange;
    /**
     * Play a given data point
     * @param datapoint - the data point to play
     */
    playDatapoints(...datapoints: XYDatapoint[]): void;
    /**
     * Play an audio notification
     * @param earcon - the type of notification to play
     */
    playNotification(earcon?: string): void;
}

declare type SourceKind = 'fizz-chart-data' | 'url' | 'content';

/**
 * Invisible spacer that creates space between views.
 */
declare class Spacer extends View {
    readonly size: number;
    constructor(size: number, paraview: ParaView);
    computeSize(): [number, number];
    render(): TemplateResult_2<2>;
}

/** @public */
declare type StackContentOptions = 'all' | 'count';

/** @public */
declare interface StatusBarSettings extends SettingGroup {
    valueFormat: LabelFormat;
}

/** @public */
declare interface StepLineSettings extends PointSettings {
    lineWidth: number;
    lineWidthMax: number;
    baseSymbolSize: number;
    seriesLabelPadding: number;
    leaderLineLength: number;
    isAlwaysShowSeriesLabel?: boolean;
}

/** @public */
declare type TabLabelStyle = 'icon' | 'iconLabel' | 'label';

declare interface TextfieldSettingControlOptions {
    inputType: 'number' | 'text';
    min?: number;
    max?: number;
    size?: number;
}

declare interface TextLine {
    text: string;
    offset: number;
}

/** @public */
declare interface TickLabelSettings extends SettingGroup {
    isDrawEnabled: boolean;
    angle: number;
    offsetPadding: number;
    gap: number;
}

/**
 * A single tier of tick labels.
 */
declare abstract class TickLabelTier<T extends AxisOrientation_2> extends TickLabelTier_base {
    readonly axis: Axis<T>;
    readonly tickLabels: string[];
    protected _parent: Layout;
    protected _children: Label[];
    textHoriz?: boolean;
    /** Distance between label centers (or starts or ends) */
    protected _labelDistance: number;
    constructor(axis: Axis<T>, tickLabels: string[], length: number, paraview: ParaView);
    setLength(length: number): void;
    get length(): number;
    get class(): string;
    get parent(): Layout;
    set parent(parent: Layout);
    get tickInterval(): number;
    protected _createId(..._args: any[]): string;
    protected _maxLabelWidth(): number;
    protected _maxLabelHeight(): number;
    computeLayout(): void;
    protected abstract get _labelTextAnchor(): LabelTextAnchor;
    protected abstract get _labelWrapWidth(): number | undefined;
    createTickLabels(): void;
    updateTickLabelIds(): void;
    protected abstract _tickLabelX(index: number): number;
    protected abstract _tickLabelY(index: number): number;
}

declare const TickLabelTier_base: {
    new (...args: any[]): {
        render(): TemplateResult;
        readonly id: string;
        readonly x: number;
        readonly y: number;
        width: number;
        height: number;
        readonly children: readonly View[];
        get padding(): Padding_2;
        set padding(_padding: PaddingInput_2 | number);
        hidden: boolean;
        readonly el: SVGElement | null;
        renderChildren(): TemplateResult;
        content(..._options: any[]): TemplateResult;
        readonly classInfo?: string | undefined;
        readonly styleInfo?: StyleInfo | undefined;
        readonly role?: string | undefined;
        readonly roleDescription?: string | undefined;
        readonly ref?: DirectiveResult<RefDirective> | null | undefined;
    };
} & typeof View;

/** @public */
declare interface TickSettings extends SettingGroup {
    isDrawEnabled?: boolean;
    padding: number;
    fontSize: number;
    opacity: number;
    strokeWidth: number;
    strokeLinecap: string;
    length: number;
    labelFormat: LabelFormat;
    tickLabel: TickLabelSettings;
    step: number;
}

/**
 * A strip of tick marks.
 */
declare abstract class TickStrip<T extends AxisOrientation_2 = AxisOrientation_2> extends TickStrip_base {
    readonly axis: Axis<T>;
    protected _interval: number;
    protected _majorModulus: number;
    protected _parent: Layout;
    protected _count: number;
    protected _gridLineLength: number;
    constructor(axis: Axis<T>, _interval: number, _majorModulus: number, contentWidth: number, contentHeight: number);
    resize(_width: number, _height: number, interval: number): void;
    protected _addedToParent(): void;
    get parent(): Layout;
    get class(): string;
    set parent(parent: Layout);
    protected abstract get _length(): number;
    protected _computeCount(): number;
    protected abstract _createRules(): void;
}

declare const TickStrip_base: {
    new (...args: any[]): {
        render(): TemplateResult;
        readonly id: string;
        readonly x: number;
        readonly y: number;
        width: number;
        height: number;
        readonly children: readonly View[];
        get padding(): Padding_2;
        set padding(_padding: PaddingInput_2 | number);
        hidden: boolean;
        readonly el: SVGElement | null;
        renderChildren(): TemplateResult;
        content(..._options: any[]): TemplateResult;
        readonly classInfo?: string | undefined;
        readonly styleInfo?: StyleInfo | undefined;
        readonly role?: string | undefined;
        readonly roleDescription?: string | undefined;
        readonly ref?: DirectiveResult<RefDirective> | null | undefined;
    };
} & typeof View;

declare type Tier = string[];

/** @public */
declare interface TitleSettings extends SettingGroup {
    isDrawTitle: boolean;
    text?: string;
    margin: number;
    fontSize: number;
    align?: SnapLocation;
    position?: 'top' | 'bottom';
}

/** @public */
declare interface UISettings extends SettingGroup {
    isVoicingEnabled: boolean;
    isAnnouncementEnabled: boolean;
    speechRate: number;
    isFullScreenEnabled: boolean;
    isLowVisionModeEnabled: boolean;
}

/**
 * Basic 2D vector class.
 */
declare class Vec2 {
    protected _x: number;
    protected _y: number;
    constructor(_x?: number, _y?: number);
    get x(): number;
    set x(x: number);
    get y(): number;
    set y(y: number);
    clone(): Vec2;
    equal(other: Vec2): boolean;
    setX(x: number): Vec2;
    setY(y: number): Vec2;
    add(other: Vec2): Vec2;
    addScalar(scalar: number): Vec2;
    addX(x: number): Vec2;
    addY(y: number): Vec2;
    subtract(other: Vec2): Vec2;
    subtractScalar(scalar: number): Vec2;
    subtractX(x: number): Vec2;
    subtractY(y: number): Vec2;
    multiply(other: Vec2): Vec2;
    multiplyScalar(scalar: number): Vec2;
    divide(other: Vec2): Vec2;
    divideScalar(scalar: number): Vec2;
    dot(other: Vec2): number;
    length(): number;
    normalize(): Vec2;
    project(other: Vec2): Vec2;
}

/**
 * A vertical axis.
 * @internal
 */
declare class VertAxis extends Axis<'vert'> {
    constructor(docView: DocumentView, title?: string);
    computeSize(): [number, number];
    settingDidChange(key: string, value: any): boolean;
    protected _createTickLabelTiers(): VertTickLabelTier[];
    protected _createTickStrip(): VertTickStrip;
    protected _createAxisLine(): void;
    protected _createSpacer(): void;
    tickLabelTotalWidth(): number;
    resize(width: number, height: number): void;
    layoutComponents(): void;
    setPosition(): void;
    protected _getAxisTitleAngle(): 90 | -90;
}

/** @public */
declare type VertDirection = 'north' | 'south';

/**
 * A vertical tier of tick labels.
 */
declare class VertTickLabelTier extends TickLabelTier<'vert'> {
    protected get _labelTextAnchor(): LabelTextAnchor;
    protected get _labelWrapWidth(): undefined;
    setLength(length: number): void;
    computeSize(): [number, number];
    protected _tickLabelX(index: number): number;
    protected _tickLabelY(index: number): number;
    createTickLabels(): void;
}

/**
 * A vertical strip of tick marks.
 */
declare class VertTickStrip extends TickStrip<'vert'> {
    computeSize(): [number, number];
    get _length(): number;
    resize(width: number, height: number, interval: number): void;
    protected _createRules(): void;
}

/**
 * Something that is drawn within a rectangular bounding box
 * in the SVG element.
 * @public
 */
declare class View extends BaseView {
    readonly paraview: ParaView;
    protected _id: string;
    protected _parent: View | null;
    protected _prev: View | null;
    protected _next: View | null;
    protected _children: View[];
    protected _loc: Vec2;
    protected _width: number;
    protected _height: number;
    protected _currFocus: View | null;
    protected _padding: Padding;
    protected _hidden: boolean;
    constructor(paraview: ParaView);
    get id(): string;
    set id(id: string);
    get parent(): View | null;
    set parent(parent: View | null);
    protected _createId(..._args: any[]): string;
    protected _addedToParent(): void;
    protected _didAddChild(_kid: View): void;
    protected _didRemoveChild(_kid: View): void;
    get children(): readonly View[];
    get index(): number;
    get isFocused(): boolean;
    get loc(): Vec2;
    set loc(loc: Vec2);
    protected get _x(): number;
    protected set _x(x: number);
    protected get _y(): number;
    protected set _y(y: number);
    get x(): number;
    get y(): number;
    set x(newX: number);
    set y(newY: number);
    get width(): number;
    get height(): number;
    set width(newWidth: number);
    set height(newHeight: number);
    get boundingWidth(): number;
    get boundingHeight(): number;
    get padding(): Padding;
    set padding(padding: PaddingInput | number);
    protected _expandPadding(padding: PaddingInput | number, defaults?: Padding): Padding;
    get hidden(): boolean;
    set hidden(hidden: boolean);
    get left(): number;
    get right(): number;
    get centerX(): number;
    get top(): number;
    get bottom(): number;
    get centerY(): number;
    computeSize(): [number, number];
    setSize(width: number, height: number, isBubble?: boolean): void;
    protected _boundingSizeDidChange(): void;
    updateSize(): void;
    protected _childDidResize(_kid: View): void;
    snapXTo(other: View, where: SnapLocation_2): void;
    snapYTo(other: View, where: SnapLocation_2): void;
    get prev(): View | null;
    get next(): View | null;
    get siblings(): readonly View[];
    get withSiblings(): readonly View[];
    get sameIndexers(): readonly View[];
    get withSameIndexers(): readonly View[];
    get nextSameIndexer(): View | null;
    get prevSameIndexer(): View | null;
    get currFocus(): View | null;
    set currFocus(view: View | null);
    intersects(other: View): Collision | null;
    focus(isNewComponentFocus?: boolean, level?: number): void;
    onFocus(_isNewComponentFocus?: boolean): void;
    blur(parentOnFocus?: boolean): void;
    onBlur(): void;
    get focusLeaf(): View;
    append(child: View): void;
    prepend(child: View): void;
    insert(child: View, i: number): void;
    remove(): void;
    reverseChildren(): void;
    sortChildren(cmpFunc: (a: typeof View.children[0], b: typeof View.children[0]) => number): void;
    clearChildren(): void;
    replaceChild(oldChild: View, newChild: View): void;
}

/** @public */
declare interface ViewBox extends SettingGroup {
    x: number;
    y: number;
    width: number;
    height: number;
}

declare class Voicing {
    private _voice;
    private _lang;
    private _rate;
    private _volume;
    private _pitch;
    constructor();
    speak(msg: string): void;
    shutUp(): void;
    get lang(): string;
    set lang(lang: string);
    get rate(): number;
    set rate(rate: number);
    get volume(): number;
    set volume(volume: number);
    get pitch(): number;
    set pitch(pitch: number);
}

/** @public */
declare interface XAxisSettings extends AxisSettings {
}

/**
 * Abstract base class for charts with X and Y axes.
 */
declare abstract class XYChart extends DataLayer {
    protected isGrouping: boolean;
    protected isConnector: boolean;
    protected maxDatapointSize: number;
    constructor(paraview: ParaView, dataLayerIndex: number);
    protected _addedToParent(): void;
    get managedSettingKeys(): string[];
    get datapointViews(): XYDatapointView[];
    get visitedDatapointViews(): XYDatapointView[];
    get selectedDatapointViews(): XYDatapointView[];
    moveRight(): void;
    moveLeft(): void;
    moveUp(): void;
    moveDown(): void;
    /**
     * Navigate to the series minimum/maximum datapoint
     * @param isMin If true, go the the minimum. Otherwise, go to the maximum
     */
    protected _goSeriesMinMax(isMin: boolean): void;
    /**
     * Navigate to (one of) the chart minimum/maximum datapoint(s)
     * @param isMin If true, go the the minimum. Otherwise, go to the maximum
     */
    protected _goChartMinMax(isMin: boolean): void;
    raiseSeries(_series: string): void;
    playSeriesRiff(): void;
    /**
     * Play all datapoints to the right, if there are any
     */
    playRight(): void;
    /**
     * Play all datapoints to the left, if there are any
     */
    playLeft(): void;
    queryData(): void;
    setLowVisionMode(_lvm: boolean): void;
}

/** @public */
declare type XYChartType = 'bar' | 'lollipop' | PointChartType;

/**
 * Abstract base class for chart views representing XYChart datapoint values
 * (e.g., points, bars, etc.).
 * @public
 */
declare abstract class XYDatapointView extends DatapointView {
    readonly chart: XYChart;
    _datapoint: XYDatapoint;
    protected centroid?: string;
    constructor(seriesView: SeriesView);
    protected _createId(..._args: any[]): string;
    protected _addedToParent(): void;
    get datapoint(): XYDatapoint;
    get styleInfo(): StyleInfo;
    protected _visit(isNewComponentFocus?: boolean): void;
    onFocus(isNewComponentFocus?: boolean): void;
}

/**
 * Abstract base class for a view representing an entire series on an XYChart.
 * @public
 */
declare class XYSeriesView extends SeriesView {
    protected _children: XYDatapointView[];
    chart: XYChart;
    get children(): readonly XYDatapointView[];
    get siblings(): readonly this[];
    protected _visit(): void;
    onFocus(): void;
    onBlur(): void;
}

/** @public */
declare interface YAxisSettings extends AxisSettings {
}

export { }
