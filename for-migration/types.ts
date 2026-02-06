// Renderer Type Definitions - TypeScript types for the rendering system
// These are renderer-specific types; entity types are imported from /types/

import type { Entry } from "./entry.js";

// ============ Core Rendering Types ============

/**
 * Text accumulator used during recursive rendering.
 * Single-element tuple that accumulates rendered output.
 */
export type TextStack = [string];

/**
 * Style hint for rendering variants.
 */
export type StyleHint = "classic" | "one";

// ============ Render Meta ============

/**
 * Metadata tracked during recursive rendering.
 * Maintains state as the renderer traverses nested entries.
 */
export interface RenderMeta {
	/** Current recursion depth (-1 to 2+ typical range) */
	depth: number;

	/** Stack of entry types being rendered (e.g., ["entries", "list"]) */
	_typeStack: string[];

	/** Style variant for output formatting */
	styleHint?: StyleHint;

	/** Enables compact inline statblock formatting */
	isStatblockInlineMonster?: boolean;

	/** Internal: tracks if prefix was rendered */
	_didRenderPrefix?: boolean;

	/** Internal: tracks if suffix was rendered */
	_didRenderSuffix?: boolean;

	/** Internal: tracks rendered titles for deduplication */
	_trackTitles?: Set<string>;

	/** Internal: indexed headers for navigation */
	_headersIndexed?: Map<string, number>;

	/** Internal: hoisted floating elements (images, etc.) */
	_hoistedFloatingElements?: string[];

	/** Adventure book context: current page */
	adventureBookPage?: string;

	/** Adventure book context: source */
	adventureBookSource?: string;

	/** Adventure book context: hash */
	adventureBookHash?: string;
}

// ============ Render Options ============

/**
 * Options passed to render methods to control output formatting.
 */
export interface RenderOptions {
	/** Text prefix for output (e.g., ">" for blockquotes) */
	prefix?: string;

	/** Text suffix for output (e.g., "\n\n" for paragraph breaks) */
	suffix?: string;

	/** Skip rendering the name/title row */
	isSkipNameRow?: boolean;

	/** Render meta state (can be passed through options) */
	meta?: RenderMeta;
}

/**
 * Options for compact/statblock rendering.
 */
export interface CompactRenderOptions extends RenderOptions {
	/** Hide senses section (monster rendering) */
	isHideSenses?: boolean;

	/** Hide languages section (monster rendering) */
	isHideLanguages?: boolean;

	/** Plain text mode (no markdown/HTML formatting) */
	isPlainText?: boolean;

	/** Text-only mode */
	isTextOnly?: boolean;
}

/**
 * Options for table post-processing.
 */
export interface TableProcessOptions {
	/** Table width in characters (default: 80) */
	tableWidth?: number;

	/** Width of dice column in 12ths (default: 1) */
	diceColWidth?: number;
}

// ============ Tag Rendering ============

/**
 * Information extracted from a parsed tag for rendering.
 */
export interface TagRenderInfo {
	/** Page/route for the entity */
	page: string;

	/** Source book/document */
	source: string;

	/** URL hash for linking */
	hash: string;

	/** Display text override */
	displayText?: string;

	/** Pre-loaded entity data */
	preloadId?: string;

	/** Hash for embedded subentity */
	hashPreEncoded?: string;

	/** Page hash override */
	pageHover?: string;

	/** Source for hover */
	sourceHover?: string;
}

/**
 * Result from splitting a tag string by pipe delimiter.
 */
export interface TagParts {
	/** Tag name (e.g., "spell", "creature") */
	name: string;

	/** Source identifier */
	source?: string;

	/** Display text override */
	displayText?: string;

	/** Additional tag-specific parts */
	[key: string]: string | undefined;
}

// ============ Renderer Configuration ============

/**
 * Configuration for markdown renderer.
 */
export interface MarkdownConfig {
	/** How to handle inline tags */
	tagRenderMode: "convertMarkdown" | "ignore" | "convertText";

	/** Add column break markers for multi-column layouts */
	isAddColumnBreaks: boolean;

	/** Add page break markers */
	isAddPageBreaks: boolean;

	/** Output style variant */
	style: StyleHint;
}

/**
 * Default markdown configuration.
 */
export const defaultMarkdownConfig: MarkdownConfig = {
	tagRenderMode: "convertMarkdown",
	isAddColumnBreaks: false,
	isAddPageBreaks: false,
	style: "classic",
};

// ============ Renderer Section Results ============

/**
 * Result from compact string rendering with breakable sections.
 */
export interface CompactRenderResult {
	/** Content that shouldn't be split across columns/pages */
	ptUnbreakable: string;

	/** Content that can be split */
	ptBreakable: string;
}

/**
 * Parameters for section rendering.
 */
export interface SectionRenderParams<T = unknown> {
	/** Array of entries to render */
	arr: Entry[];

	/** Parent entity (monster, spell, etc.) */
	ent: T;

	/** Property name being rendered (e.g., "action", "trait") */
	prop: string;

	/** Section title */
	title: string;

	/** Render meta state */
	meta: RenderMeta;

	/** Output prefix */
	prefix?: string;
}

// ============ Factory Functions ============

/**
 * Create a new TextStack for accumulating rendered output.
 */
export const createTextStack = (): TextStack => [""];

/**
 * Create a new RenderMeta with default values.
 */
export const createRenderMeta = (overrides?: Partial<RenderMeta>): RenderMeta => ({
	depth: 0,
	_typeStack: [],
	...overrides,
});

/**
 * Create a new RenderOptions with default values.
 */
export const createRenderOptions = (overrides?: Partial<RenderOptions>): RenderOptions => ({
	prefix: "",
	suffix: "",
	...overrides,
});
