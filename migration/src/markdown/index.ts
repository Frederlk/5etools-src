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

// ============ Re-export Types ============

export type {
	TextStack,
	RenderMeta,
	RenderOptions,
	MarkdownConfig,
	StyleHint,
} from "../renderer/types.js";

export { createTextStack, createRenderMeta, defaultMarkdownConfig } from "../renderer/types.js";
