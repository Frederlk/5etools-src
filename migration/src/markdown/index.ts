// Markdown Module - TypeScript implementation
// Exports all markdown rendering components for D&D 5e entities

// ============ Core Renderer ============

export {
	MarkdownRenderer,
	createMarkdownRenderer,
	getMarkdownRenderer,
	markdownUtils,
	CHARS_PER_PAGE,
	type MarkdownRendererConfig,
} from "./renderer.js";

// ============ Monster Markdown ============

export {
	MonsterMarkdownRendererBase,
	MonsterMarkdownRendererClassic,
	MonsterMarkdownRendererOne,
	getMonsterMarkdownRenderer,
	monsterMarkdown,
	type MonsterEntry,
	type MonsterMarkdownOptions,
} from "./monster.js";

// ============ Spell Markdown ============

export {
	SpellMarkdownRenderer,
	getSpellMarkdownRenderer,
	spellMarkdown,
	type SpellEntry,
	type SpellMarkdownOptions,
	type SpellClassRef,
	type SpellClassList,
} from "./spell.js";

// ============ Item Markdown ============

export {
	ItemMarkdownRenderer,
	getItemMarkdownRenderer,
	itemMarkdown,
	baseItemMarkdown,
	magicVariantMarkdown,
	itemGroupMarkdown,
	type ItemEntry,
	type ItemMarkdownOptions,
	type TypeRarityAttunementParts,
} from "./item.js";

// ============ Language Markdown ============

export {
	LanguageMarkdownRenderer,
	getLanguageMarkdownRenderer,
	languageMarkdown,
	type LanguageEntry,
	type LanguageMarkdownOptions,
	type LanguageEntriesMeta,
} from "./language.js";

// ============ Psionic Markdown ============

export {
	PsionicMarkdownRenderer,
	getPsionicMarkdownRenderer,
	psionicMarkdown,
	type PsionicEntry,
	type PsionicMarkdownOptions,
} from "./psionic.js";

// ============ Reward Markdown ============

export {
	RewardMarkdownRenderer,
	getRewardMarkdownRenderer,
	rewardMarkdown,
	type RewardEntry,
	type RewardMarkdownOptions,
	type RewardEntriesMeta,
} from "./reward.js";

// ============ Object Markdown ============

export {
	ObjectMarkdownRenderer,
	getObjectMarkdownRenderer,
	objectMarkdown,
	RENDERABLE_ENTRIES_PROP_ORDER,
	type ObjectEntry,
	type ObjectMarkdownOptions,
	type ObjectRenderableEntriesMeta,
} from "./object.js";

// ============ Vehicle Markdown ============

export {
	VehicleMarkdownRenderer,
	getVehicleMarkdownRenderer,
	vehicleMarkdown,
	vehicleUpgradeMarkdown,
	type VehicleMarkdownOptions,
	type VehicleUpgradeMarkdownOptions,
} from "./vehicle.js";

// ============ Race Markdown ============

export {
	RaceMarkdownRenderer,
	getRaceMarkdownRenderer,
	raceMarkdown,
	type RaceEntry,
	type RaceMarkdownOptions,
	type RaceRenderableEntriesMeta,
} from "./race.js";

// ============ Feat Markdown ============

export {
	FeatMarkdownRenderer,
	getFeatMarkdownRenderer,
	featMarkdown,
	type FeatEntry,
	type FeatMarkdownOptions,
} from "./feat.js";

// ============ Deity Markdown ============

export {
	DeityMarkdownRenderer,
	getDeityMarkdownRenderer,
	deityMarkdown,
	type DeityEntry,
	type DeityMarkdownOptions,
	type DeityEntriesMeta,
} from "./deity.js";

// ============ Cult Markdown ============

export {
	CultMarkdownRenderer,
	getCultMarkdownRenderer,
	cultMarkdown,
	type CultEntry,
	type CultMarkdownOptions,
	type CultEntriesMeta,
} from "./cult.js";

// ============ Boon Markdown ============

export {
	BoonMarkdownRenderer,
	getBoonMarkdownRenderer,
	boonMarkdown,
	type BoonEntry,
	type BoonMarkdownOptions,
	type BoonRenderableEntriesMeta,
} from "./boon.js";

// ============ Legendary Group Markdown ============

export {
	LegendaryGroupMarkdownRenderer,
	getLegendaryGroupMarkdownRenderer,
	legendaryGroupMarkdown,
	type LegendaryGroupEntry,
	type LegendaryGroupMarkdownOptions,
} from "./legendaryGroup.js";

// ============ Character Option Markdown ============

export {
	CharoptionMarkdownRenderer,
	getCharoptionMarkdownRenderer,
	charoptionMarkdown,
	type CharoptionEntry,
	type CharoptionMarkdownOptions,
	type CharoptionRenderableEntriesMeta,
} from "./charoption.js";

// ============ Recipe Markdown ============

export {
	RecipeMarkdownRenderer,
	getRecipeMarkdownRenderer,
	recipeMarkdown,
	getRecipeRenderableEntriesMeta,
	type RecipeEntry,
	type RecipeMarkdownOptions,
	type RecipeRenderableEntriesMeta,
	type RecipeTimeMeta,
} from "./recipe.js";

// ============ Trap/Hazard Markdown ============

export {
	TrapMarkdownRenderer,
	HazardMarkdownRenderer,
	TrapHazardMarkdownRenderer,
	getTrapMarkdownRenderer,
	getHazardMarkdownRenderer,
	getTrapHazardMarkdownRenderer,
	trapMarkdown,
	hazardMarkdown,
	traphazardMarkdown,
	type TrapEntry,
	type TrapComplexEntry,
	type HazardEntry,
	type TrapHazardEntry,
	type TrapMarkdownOptions,
	type TrapRenderableEntriesMeta,
} from "./trap.js";

// ============ Markdown Converter ============

export {
	MarkdownConverter,
	getEntries,
	getConvertedTable,
	postProcessTable,
	ENTRIES_WITH_CHILDREN,
	ENTRIES_WITH_ENUMERATED_TITLES,
	type ConvertedEntry,
	type TablePostProcessOptions,
} from "./converter.js";

// ============ Re-export Types ============

export type {
	TextStack,
	RenderMeta,
	RenderOptions,
	MarkdownConfig,
	StyleHint,
} from "../renderer/types.js";

export { createTextStack, createRenderMeta, defaultMarkdownConfig } from "../renderer/types.js";
