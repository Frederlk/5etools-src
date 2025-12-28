// Base Renderer - TypeScript implementation
// Migrated from js/render.js Renderer class
// Provides core rendering infrastructure for entries

import type {
	Entry,
	EntryObject,
	EntryEntries,
	EntrySection,
	EntryList,
	EntryTable,
	EntryQuote,
	EntryInset,
	EntryInsetReadaloud,
	EntryVariant,
	EntryItem,
	EntryImage,
	EntryTableCell,
	EntryWrapped,
	DiceExpression,
	EntryDice,
	SpellLevel,
} from "../../../types/entry.js";

import type {
	TextStack,
	RenderMeta,
	RenderOptions,
	StyleHint,
} from "./types.js";

import { createTextStack, createRenderMeta } from "./types.js";
import { splitByTags, splitFirstSpace, splitTagByPipe, stripTags } from "./tags.js";
import { getHeaderRowMetas, getAutoConvertedRollMode, RollColMode } from "./table.js";

// ============ Renderer Configuration ============

export interface RendererConfig {
	/** Default style hint */
	styleHint: StyleHint;
	/** Whether to add interactive handlers */
	isAddHandlers: boolean;
	/** Base URL for links */
	baseUrl: string;
}

export const defaultRendererConfig: RendererConfig = {
	styleHint: "classic",
	isAddHandlers: true,
	baseUrl: "",
};

// ============ Entry Type Checking ============

export const isEntryObject = (entry: Entry): entry is EntryObject => {
	return typeof entry === "object" && entry !== null;
};

export const isEntryWrapped = (entry: EntryObject): entry is EntryWrapped => {
	return entry.type === "wrapper";
};

export const isEntrySection = (entry: EntryObject): entry is EntrySection => {
	return entry.type === "section";
};

export const hasEntries = (entry: EntryObject): entry is EntryObject & { entries: Entry[] } => {
	return "entries" in entry && Array.isArray((entry as { entries?: unknown }).entries);
};

export const hasEntry = (entry: EntryObject): entry is EntryObject & { entry: Entry } => {
	return "entry" in entry && (entry as { entry?: unknown }).entry !== undefined;
};

export const hasTitle = (entry: EntryObject): entry is EntryObject & { title: string } => {
	return "title" in entry && typeof (entry as { title?: unknown }).title === "string";
};

export const isEntryTableCell = (cell: unknown): cell is EntryTableCell => {
	if (typeof cell !== "object" || cell === null) return false;
	const obj = cell as { type?: unknown; roll?: unknown };
	// Check for explicit type: "cell" OR presence of roll property (table cell characteristic)
	return obj.type === "cell" || obj.roll !== undefined;
};

type EntryWithEntries = EntryObject & { entries?: Entry[] };

export const getEntryType = (entry: Entry): string => {
	if (typeof entry === "string") return "string";
	if (entry == null) return "null";
	if (!("type" in entry)) return "entries";
	return entry.type ?? "entries";
};

// ============ Base Renderer Class ============

/**
 * Abstract base renderer class.
 * Provides core recursive rendering logic with hooks for customization.
 * Extend this class to create specialized renderers (HTML, Markdown, etc.)
 */
export abstract class BaseRenderer {
	protected config: RendererConfig;

	constructor(config: Partial<RendererConfig> = {}) {
		this.config = { ...defaultRendererConfig, ...config };
	}

	// ============ Configuration Methods ============

	setStyleHint(styleHint: StyleHint): this {
		this.config.styleHint = styleHint;
		return this;
	}

	setAddHandlers(isAddHandlers: boolean): this {
		this.config.isAddHandlers = isAddHandlers;
		return this;
	}

	setBaseUrl(baseUrl: string): this {
		this.config.baseUrl = baseUrl;
		return this;
	}

	// ============ Main Render Method ============

	/**
	 * Render an entry to string output.
	 * @param entry - Entry to render
	 * @param options - Render options
	 * @returns Rendered string
	 */
	render(entry: Entry, options: RenderOptions = {}): string {
		const textStack = createTextStack();
		const meta = createRenderMeta({
			styleHint: this.config.styleHint,
			...options.meta,
		});

		this.recursiveRender(entry, textStack, meta, options);

		return textStack[0];
	}

	/**
	 * Recursively render an entry, appending to textStack.
	 * @param entry - Entry to render
	 * @param textStack - Text accumulator
	 * @param meta - Render metadata
	 * @param options - Render options
	 */
	recursiveRender(
		entry: Entry,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions = {}
	): void {
		// Handle arrays (shouldn't happen normally, but be safe)
		if (Array.isArray(entry)) {
			for (const e of entry) {
				this.recursiveRender(e, textStack, meta, options);
			}
			return;
		}

		// Initialize textStack if needed
		if (!textStack[0]) textStack[0] = "";

		// Initialize meta
		meta._typeStack = meta._typeStack || [];
		meta.depth = meta.depth ?? 0;
		meta.styleHint = meta.styleHint ?? this.config.styleHint;

		this._recursiveRender(entry, textStack, meta, options);
	}

	/**
	 * Internal recursive render implementation.
	 */
	protected _recursiveRender(
		entry: Entry,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry == null) return;

		// Handle wrapped entries
		if (isEntryObject(entry) && isEntryWrapped(entry)) {
			if (entry.wrapped) {
				return this._recursiveRender(entry.wrapped, textStack, meta, options);
			}
			return;
		}

		// Handle section type (adjusts depth)
		if (isEntryObject(entry) && isEntrySection(entry)) {
			meta.depth = -1;
		}

		meta._didRenderPrefix = false;
		meta._didRenderSuffix = false;

		if (typeof entry === "object" && entry !== null) {
			const type = getEntryType(entry);
			meta._typeStack.push(type);

			this._renderByType(entry, type, textStack, meta, options);

			meta._typeStack.pop();
		} else if (typeof entry === "string") {
			this._renderPrefix(entry, textStack, meta, options);
			this._renderString(entry, textStack, meta, options);
			this._renderSuffix(entry, textStack, meta, options);
		} else {
			// Numbers, booleans, etc.
			this._renderPrefix(entry, textStack, meta, options);
			textStack[0] += String(entry);
			this._renderSuffix(entry, textStack, meta, options);
		}
	}

	/**
	 * Route rendering to appropriate type handler.
	 */
	protected _renderByType(
		entry: Exclude<Entry, string>,
		type: string,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		switch (type) {
			// Recursive entry types
			case "entries":
			case "section":
				this._renderEntries(entry as EntryEntries, textStack, meta, options);
				break;
			case "options":
				this._renderOptions(entry, textStack, meta, options);
				break;
			case "list":
				this._renderList(entry as EntryList, textStack, meta, options);
				break;
			case "table":
				this._renderTable(entry as EntryTable, textStack, meta, options);
				break;
			case "tableGroup":
				this._renderTableGroup(entry, textStack, meta, options);
				break;
			case "inset":
				this._renderInset(entry as EntryInset, textStack, meta, options);
				break;
			case "insetReadaloud":
				this._renderInsetReadaloud(entry as EntryInsetReadaloud, textStack, meta, options);
				break;
			case "variant":
				this._renderVariant(entry as EntryVariant, textStack, meta, options);
				break;
			case "variantInner":
				this._renderVariantInner(entry, textStack, meta, options);
				break;
			case "variantSub":
				this._renderVariantSub(entry, textStack, meta, options);
				break;
			case "quote":
				this._renderQuote(entry as EntryQuote, textStack, meta, options);
				break;
			case "optfeature":
				this._renderOptfeature(entry, textStack, meta, options);
				break;

			// Block types
			case "abilityDc":
				this._renderAbilityDc(entry, textStack, meta, options);
				break;
			case "abilityAttackMod":
				this._renderAbilityAttackMod(entry, textStack, meta, options);
				break;
			case "abilityGeneric":
				this._renderAbilityGeneric(entry, textStack, meta, options);
				break;

			// Inline types
			case "inline":
				this._renderInline(entry, textStack, meta, options);
				break;
			case "inlineBlock":
				this._renderInlineBlock(entry, textStack, meta, options);
				break;
			case "bonus":
				this._renderBonus(entry, textStack, meta, options);
				break;
			case "bonusSpeed":
				this._renderBonusSpeed(entry, textStack, meta, options);
				break;
			case "dice":
				this._renderDice(entry, textStack, meta, options);
				break;
			case "link":
				this._renderLink(entry, textStack, meta, options);
				break;

			// List items
			case "item":
				this._renderItem(entry as EntryItem, textStack, meta, options);
				break;
			case "itemSub":
				this._renderItemSub(entry, textStack, meta, options);
				break;
			case "itemSpell":
				this._renderItemSpell(entry, textStack, meta, options);
				break;

			// Images
			case "image":
				this._renderImage(entry as EntryImage, textStack, meta, options);
				break;
			case "gallery":
				this._renderGallery(entry, textStack, meta, options);
				break;

			// Misc
			case "hr":
				this._renderHr(entry, textStack, meta, options);
				break;
			case "code":
				this._renderCode(entry, textStack, meta, options);
				break;

			// Statblocks
			case "statblockInline":
			case "statblock":
				this._renderStatblock(entry, textStack, meta, options);
				break;

			// Actions/attacks
			case "actions":
				this._renderActions(entry, textStack, meta, options);
				break;
			case "attack":
				this._renderAttack(entry, textStack, meta, options);
				break;

			// Spellcasting
			case "spellcasting":
				this._renderSpellcasting(entry, textStack, meta, options);
				break;

			// Flowcharts
			case "flowchart":
				this._renderFlowchart(entry, textStack, meta, options);
				break;
			case "flowBlock":
				this._renderFlowBlock(entry, textStack, meta, options);
				break;

			// Ingredients (recipes)
			case "ingredient":
				this._renderIngredient(entry, textStack, meta, options);
				break;

			// Homebrew
			case "homebrew":
				this._renderHomebrew(entry, textStack, meta, options);
				break;

			// Raw HTML (skip for non-HTML renderers)
			case "wrappedHtml":
				// Override in HTML renderer
				break;

			default:
				// Unknown type - try to render as entries
				if (hasEntries(entry)) {
					this._renderEntries(entry as EntryEntries, textStack, meta, options);
				}
				break;
		}
	}

	// ============ Prefix/Suffix Rendering ============

	protected _renderPrefix(
		entry: Entry,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (meta._didRenderPrefix) return;
		if (options.prefix) {
			textStack[0] += options.prefix;
			meta._didRenderPrefix = true;
		}
	}

	protected _renderSuffix(
		entry: Entry,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (meta._didRenderSuffix) return;
		if (options.suffix) {
			textStack[0] += options.suffix;
			meta._didRenderSuffix = true;
		}
	}

	// ============ Abstract Methods - Must be implemented by subclasses ============

	/** Render a string entry (with tag processing) */
	protected abstract _renderString(
		entry: string,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void;

	/** Render an entries block (accepts any entry type with entries property) */
	protected abstract _renderEntries(
		entry: EntryWithEntries,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void;

	/** Render a list */
	protected abstract _renderList(
		entry: EntryList,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void;

	/** Render a table */
	protected abstract _renderTable(
		entry: EntryTable,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void;

	/** Render a quote */
	protected abstract _renderQuote(
		entry: EntryQuote,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void;

	/** Render an inset (accepts both inset and insetReadaloud types) */
	protected abstract _renderInset(
		entry: EntryInset | EntryInsetReadaloud,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void;

	/** Render an item */
	protected abstract _renderItem(
		entry: EntryItem,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void;

	/** Render an image */
	protected abstract _renderImage(
		entry: EntryImage,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void;

	// ============ Optional Methods - Default implementations ============

	protected _renderOptions(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		// Default: render as entries
		if (entry.entries) {
			for (const e of entry.entries) {
				this._recursiveRender(e, textStack, meta, options);
			}
		}
	}

	protected _renderTableGroup(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.tables) {
			for (const table of entry.tables) {
				this._renderTable(table, textStack, meta, options);
			}
		}
	}

	protected _renderInsetReadaloud(
		entry: EntryInsetReadaloud,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		// Default: same as inset (both have name and entries properties)
		this._renderInset(entry, textStack, meta, options);
	}

	protected _renderVariant(
		entry: EntryVariant,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		// Default: render as entries - EntryVariant has entries property
		if (entry.entries) {
			this._renderEntries(entry, textStack, meta, options);
		}
	}

	protected _renderVariantInner(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.entries) {
			for (const e of entry.entries) {
				this._recursiveRender(e, textStack, meta, options);
			}
		}
	}

	protected _renderVariantSub(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.entries) {
			for (const e of entry.entries) {
				this._recursiveRender(e, textStack, meta, options);
			}
		}
	}

	protected _renderOptfeature(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.entries) {
			this._renderEntries(entry, textStack, meta, options);
		}
	}

	protected _renderAbilityDc(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		// Override in subclass for formatted output
		textStack[0] += `DC = 8 + proficiency bonus + ${(entry.attributes || []).join("/")} modifier`;
	}

	protected _renderAbilityAttackMod(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += `Attack = proficiency bonus + ${(entry.attributes || []).join("/")} modifier`;
	}

	protected _renderAbilityGeneric(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.text) {
			this._recursiveRender(entry.text, textStack, meta, options);
		}
	}

	protected _renderInline(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.entries) {
			for (const e of entry.entries) {
				this._recursiveRender(e, textStack, meta, options);
			}
		}
	}

	protected _renderInlineBlock(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderInline(entry, textStack, meta, options);
	}

	protected _renderBonus(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		const value = entry.value ?? 0;
		textStack[0] += value >= 0 ? `+${value}` : String(value);
	}

	protected _renderBonusSpeed(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		const value = entry.value ?? 0;
		textStack[0] += value >= 0 ? `+${value} ft.` : `${value} ft.`;
	}

	protected _renderDice(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		// Override in subclass for interactive dice
		const diceStr = entry.displayText || this._getDiceString(entry);
		textStack[0] += diceStr;
	}

	protected _getDiceString(entry: EntryDice): string {
		if (entry.toRoll) {
			if (typeof entry.toRoll === "string") return entry.toRoll;
			// Legacy array format
			return entry.toRoll
				.map((r: DiceExpression) => {
					const mod = r.modifier ?? 0;
					const modStr = mod > 0 ? `+${mod}` : mod < 0 ? String(mod) : "";
					return `${r.number ?? 1}d${r.faces}${modStr}`;
				})
				.join("+");
		}
		return "";
	}

	protected _renderLink(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += entry.text || "";
	}

	protected _renderItemSub(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderItem(entry, textStack, meta, options);
	}

	protected _renderItemSpell(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderItem(entry, textStack, meta, options);
	}

	protected _renderGallery(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.images) {
			for (const img of entry.images) {
				this._renderImage(img, textStack, meta, options);
			}
		}
	}

	protected _renderHr(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += "\n---\n";
	}

	protected _renderCode(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += "```\n";
		if (entry.preformatted) {
			textStack[0] += entry.preformatted;
		}
		textStack[0] += "\n```\n";
	}

	protected _renderStatblock(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		// Override in subclass
	}

	protected _renderActions(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.entries) {
			this._renderEntries(entry, textStack, meta, options);
		}
	}

	protected _renderAttack(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		// Override in subclass for attack formatting
		const types = entry.attackType ? [entry.attackType] : entry.attackTypes || [];
		const typeStr = types.join("/");
		textStack[0] += `${typeStr} Attack: `;
		if (entry.attackEntries) {
			for (const e of entry.attackEntries) {
				this._recursiveRender(e, textStack, meta, options);
			}
		}
	}

	protected _renderSpellcasting(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.headerEntries) {
			for (const e of entry.headerEntries) {
				this._recursiveRender(e, textStack, meta, options);
			}
		}
		// Handle spell lists, daily/weekly/will spells, etc.
		if (entry.spells) {
			for (const [level, spellData] of Object.entries(entry.spells) as [string, SpellLevel][]) {
				if (spellData.spells) {
					for (const spell of spellData.spells) {
						this._recursiveRender(spell, textStack, meta, options);
					}
				}
			}
		}
	}

	protected _renderFlowchart(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.blocks) {
			for (const block of entry.blocks) {
				this._renderFlowBlock(block, textStack, meta, options);
			}
		}
	}

	protected _renderFlowBlock(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.entries) {
			for (const e of entry.entries) {
				this._recursiveRender(e, textStack, meta, options);
			}
		}
	}

	protected _renderIngredient(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.entry) {
			this._recursiveRender(entry.entry, textStack, meta, options);
		}
	}

	protected _renderHomebrew(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		// Render new content, ignore old
		if (entry.entries) {
			for (const e of entry.entries) {
				this._recursiveRender(e, textStack, meta, options);
			}
		}
	}

	// ============ Utility Methods ============

	/**
	 * Get entry name/title.
	 */
	protected _getEntryName(entry: any): string | undefined {
		return entry.name ?? entry.title;
	}

	/**
	 * Process tags in a string.
	 * Default implementation strips tags - override for tag rendering.
	 */
	protected _processTags(str: string, meta: RenderMeta, options: RenderOptions): string {
		return stripTags(str);
	}
}

// ============ Plain Text Renderer ============

/**
 * Simple plain text renderer.
 * Strips all formatting and renders entries as plain text.
 */
export class PlainTextRenderer extends BaseRenderer {
	protected _renderString(
		entry: string,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += this._processTags(entry, meta, options);
	}

	protected _renderEntries(
		entry: EntryWithEntries,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);

		const name = this._getEntryName(entry);
		if (name) {
			textStack[0] += `${name}\n`;
		}

		if (entry.entries) {
			const nextMeta = { ...meta, depth: meta.depth + 1 };
			for (const e of entry.entries) {
				this._recursiveRender(e, textStack, nextMeta, options);
				textStack[0] += "\n";
			}
		}

		this._renderSuffix(entry, textStack, meta, options);
	}

	protected _renderList(
		entry: EntryList,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);

		if (entry.items) {
			for (const item of entry.items) {
				textStack[0] += "- ";
				this._recursiveRender(item, textStack, meta, options);
				textStack[0] += "\n";
			}
		}

		this._renderSuffix(entry, textStack, meta, options);
	}

	protected _renderTable(
		entry: EntryTable,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);

		if (entry.caption) {
			textStack[0] += `${entry.caption}\n`;
		}

		// Column labels
		if (entry.colLabels) {
			textStack[0] += entry.colLabels
				.map(c => (typeof c === "string" ? stripTags(c) : ""))
				.join(" | ");
			textStack[0] += "\n";
		}

		// Rows
		if (entry.rows) {
			for (const row of entry.rows) {
				if (Array.isArray(row)) {
					// Table rows can contain Entry or EntryTableCell (type def is incomplete)
					const cells = row as (Entry | EntryTableCell)[];
					textStack[0] += cells
						.map(cell => {
							if (typeof cell === "string") return stripTags(cell);
							if (isEntryTableCell(cell)) {
								if (cell.entry) return this.render(cell.entry);
								if (cell.roll?.exact != null) return String(cell.roll.exact);
								if (cell.roll?.min != null) return `${cell.roll.min}-${cell.roll.max}`;
							}
							return String(cell);
						})
						.join(" | ");
					textStack[0] += "\n";
				}
			}
		}

		this._renderSuffix(entry, textStack, meta, options);
	}

	protected _renderQuote(
		entry: EntryQuote,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);

		if (entry.entries) {
			for (const e of entry.entries) {
				textStack[0] += '"';
				this._recursiveRender(e, textStack, meta, options);
				textStack[0] += '"\n';
			}
		}

		if (entry.by) {
			textStack[0] += `\u2014 ${entry.by}`;
			if (entry.from) {
				textStack[0] += `, ${entry.from}`;
			}
			textStack[0] += "\n";
		}

		this._renderSuffix(entry, textStack, meta, options);
	}

	protected _renderInset(
		entry: EntryInset | EntryInsetReadaloud,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);

		const name = this._getEntryName(entry);
		if (name) {
			textStack[0] += `[${name}]\n`;
		}

		if (entry.entries) {
			for (const e of entry.entries) {
				this._recursiveRender(e, textStack, meta, options);
				textStack[0] += "\n";
			}
		}

		this._renderSuffix(entry, textStack, meta, options);
	}

	protected _renderItem(
		entry: EntryItem,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);

		const name = this._getEntryName(entry);
		if (name) {
			textStack[0] += `${name}. `;
		}

		if (entry.entry) {
			this._recursiveRender(entry.entry, textStack, meta, options);
		}
		if (entry.entries) {
			for (const e of entry.entries) {
				this._recursiveRender(e, textStack, meta, options);
			}
		}

		this._renderSuffix(entry, textStack, meta, options);
	}

	protected _renderImage(
		entry: EntryImage,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);

		if (entry.title) {
			textStack[0] += `[Image: ${entry.title}]\n`;
		} else {
			textStack[0] += "[Image]\n";
		}

		this._renderSuffix(entry, textStack, meta, options);
	}
}

// ============ Factory Functions ============

/**
 * Create a plain text renderer.
 */
export const createPlainTextRenderer = (
	config: Partial<RendererConfig> = {}
): PlainTextRenderer => {
	return new PlainTextRenderer(config);
};

/**
 * Get a shared plain text renderer instance.
 */
let _sharedPlainTextRenderer: PlainTextRenderer | null = null;
export const getPlainTextRenderer = (): PlainTextRenderer => {
	if (!_sharedPlainTextRenderer) {
		_sharedPlainTextRenderer = new PlainTextRenderer();
	}
	return _sharedPlainTextRenderer;
};
