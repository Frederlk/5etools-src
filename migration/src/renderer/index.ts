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

// ============ Spell Renderer ============

export {
	getHtmlPtLevelSchoolRitual,
	getHtmlPtCastingTime,
	getHtmlPtRange,
	getHtmlPtComponents,
	getHtmlPtDuration,
} from "./spell.js";

export type {
	SpellData,
	SpellHtmlOptions,
} from "./spell.js";

// ============ Monster Renderer ============

export {
	getShortName,
	getShortNameFromName,
	getPronounSubject,
	getPronounObject,
	getPronounPossessive,
	getLegendaryActionIntro,
	getLegendaryActionIntroEntry,
	getSectionIntro,
	getSave,
	getRenderedHp,
	getRenderedResource,
	getSafeAbilityScore,
	getSpellcastingRenderedTraits,
	getOrderedTraits,
	getOrderedActions,
	getOrderedBonusActions,
	getOrderedReactions,
	getOrderedLegendaryActions,
	getOrderedMythicActions,
	getSubEntries,
	getTypeAlignmentPart,
	getInitiativeBonusNumber,
	getInitiativePart,
	getSavesPart,
	getSensesPart,
	getPbPart,
	getChallengeRatingPart,
	getImmunitiesCombinedPart,
	getGearPart,
	getSkillsString,
	getToolsString,
	getRenderedLanguages,
	hasLegendaryActions,
	hasMythicActions,
	hasReactions,
	hasBonusActions,
	CHILD_PROPS,
	CHILD_PROPS__SPELLCASTING_DISPLAY_AS,
} from "./monster.js";

export type {
	Monster,
	Entry as MonsterEntry,
	SpellcastingEntry,
	HpEntry,
	CrObject,
	InitiativeObject,
	SpecialAbilityScore,
	MonsterSkillOther,
	MonsterSkills,
	MonsterTypeObject,
	AlignmentObject,
	ImmResValue,
	CondImmValue,
	GearEntry,
	ResourceEntry,
	LegendaryGroup,
	ShortNameOptions,
	LegendaryActionIntroOptions,
	HpRenderOptions,
	CrRenderOptions,
	SensesOptions,
	LanguagesOptions,
	ToolsOptions,
	SubEntriesOptions,
	TraitEntry,
	SubEntriesResult,
	RenderFn,
} from "./monster.js";

// ============ Item Renderer ============

export {
	getPropertiesText,
	getRenderedDamageAndProperties,
	getRenderedMastery,
	getTransformedTypeEntriesMeta,
	getTypeRarityAndAttunementHtmlParts,
	getAttunementAndAttunementCatText,
	getRenderableTypeEntriesMeta,
	getRenderedEntries,
	hasEntries,
	getTypeRarityAndAttunementHtml,
	doRenderRarity,
	isMundane,
	dmgTypeToFull,
	HIDDEN_RARITY,
	itemRenderer,
} from "./item.js";

export type {
	ItemProperty,
	ItemMastery,
	ItemEntry,
	TransformedTypeEntriesMeta,
	TypeRarityAttunementParts,
	RenderableTypeEntriesMeta,
	ItemRenderOptions,
	ItemRenderer,
} from "./item.js";
