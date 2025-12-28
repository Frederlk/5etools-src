// Renderer Module - Barrel export

// ============ Types ============

export type {
	TextStack,
	StyleHint,
	RenderMeta,
	RenderOptions,
	CompactRenderOptions,
	TableProcessOptions,
	TagRenderInfo,
	TagParts,
	MarkdownConfig,
	CompactRenderResult,
	SectionRenderParams,
} from "./types.js";

export {
	defaultMarkdownConfig,
	createTextStack,
	createRenderMeta,
	createRenderOptions,
} from "./types.js";

// ============ Tag Processing ============

export {
	splitFirstSpace,
	splitByTags,
	createPipeSplitter,
	splitTagByPipe,
	splitEqualityByPipe,
	stripTags,
	hasTags,
	isTag,
	getTagName,
	getTagContent,
	parseTag,
	buildTag,
	builtInTags,
	defaultTagInfo,
	createSimpleTagInfo,
	createDiceTagInfo,
} from "./tags.js";

export type {
	TagInfo,
	TagLookup,
	StripTagsOptions,
	ParsedTag,
} from "./tags.js";

// ============ Table Utilities ============

export {
	RollColMode,
	getRowCells,
	getHeaderRowMetas,
	getHeaderRowSpanWidth,
	isRollableCell,
	isEveryRowRollable,
	getAutoConvertedRollMode,
	getColRollType,
	parseRollCell,
	convertRowsToRollable,
	getTableColumns,
	getColumnCount,
} from "./table.js";

export type {
	TableRowInput,
	HeaderRowMeta,
	ParsedRollCell,
	TableColumn,
} from "./table.js";

// ============ Base Renderer ============

export {
	BaseRenderer,
	PlainTextRenderer,
	createPlainTextRenderer,
	getPlainTextRenderer,
	isEntryObject,
	getEntryType,
	defaultRendererConfig,
} from "./base.js";

export type {
	RendererConfig,
} from "./base.js";
