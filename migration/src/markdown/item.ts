// Item Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.item
// Provides item-specific markdown rendering for D&D 5e items

import type { Entry } from "../../../types/entry.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { stripTags } from "../renderer/tags.js";
import { itemValueToFullMultiCurrency, itemWeightToFull } from "../parser/item.js";
import { MarkdownRenderer, getMarkdownRenderer } from "./renderer.js";
import { uppercaseFirst } from "../util/str-util.js";

// ============ Types ============

export interface ItemEntry {
	name: string;
	_displayName?: string;
	source: string;
	type?: string;
	typeAlt?: string;
	rarity?: string;
	reqAttune?: boolean | string;
	reqAttuneAlt?: string;
	tier?: string;
	value?: number;
	valueMult?: number;
	weight?: number;
	weightMult?: number;
	weightNote?: string;
	currencyConversion?: string;
	entries?: Entry[];
	_fullEntries?: Entry[];
	additionalEntries?: Entry[];
	_fullAdditionalEntries?: Entry[];
	damage?: string;
	damageType?: string;
	property?: string[];
	mastery?: string[];
	weapon?: boolean;
	weaponCategory?: string;
	armor?: boolean;
	ac?: number;
	strength?: string;
	stealth?: boolean;
	baseItem?: string;
	wondrous?: boolean;
	tattoo?: boolean;
	staff?: boolean;
	age?: string;
}

export interface ItemMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

// ============ Helper Functions ============

const getItemTypeText = (item: ItemEntry, styleHint: StyleHint): string => {
	const typeParts: string[] = [];

	if (item.wondrous) {
		typeParts.push("Wondrous Item");
	} else if (item.staff) {
		typeParts.push("Staff");
	} else if (item.tattoo) {
		typeParts.push("Tattoo");
	} else if (item.armor) {
		if (item.type) {
			typeParts.push(getArmorTypeText(item.type));
		} else {
			typeParts.push("Armor");
		}
	} else if (item.weapon) {
		typeParts.push(item.weaponCategory ? `${uppercaseFirst(item.weaponCategory)} Weapon` : "Weapon");
	} else if (item.type) {
		typeParts.push(getItemTypeFromAbbreviation(item.type));
	}

	if (item.rarity && item.rarity !== "none") {
		typeParts.push(item.rarity);
	}

	return typeParts.join(", ");
};

const getArmorTypeText = (type: string): string => {
	const armorTypes: Record<string, string> = {
		LA: "Light Armor",
		MA: "Medium Armor",
		HA: "Heavy Armor",
		S: "Shield",
	};
	return armorTypes[type] ?? type;
};

const getItemTypeFromAbbreviation = (type: string): string => {
	const itemTypes: Record<string, string> = {
		A: "Ammunition",
		AF: "Ammunition (futuristic)",
		AIR: "Vehicle (air)",
		AT: "Artisan's Tools",
		EXP: "Explosive",
		FD: "Food and Drink",
		G: "Adventuring Gear",
		GS: "Gaming Set",
		GV: "Generic Variant",
		HA: "Heavy Armor",
		INS: "Instrument",
		LA: "Light Armor",
		M: "Melee Weapon",
		MA: "Medium Armor",
		MNT: "Mount",
		OTH: "Other",
		P: "Potion",
		R: "Ranged Weapon",
		RD: "Rod",
		RG: "Ring",
		S: "Shield",
		SC: "Scroll",
		SCF: "Spellcasting Focus",
		SHP: "Vehicle (water)",
		SPC: "Vehicle (space)",
		T: "Tool",
		TAH: "Tack and Harness",
		TG: "Trade Good",
		VEH: "Vehicle (land)",
		WD: "Wand",
	};
	return itemTypes[type] ?? type;
};

const getAttunementText = (item: ItemEntry): string => {
	if (!item.reqAttune) return "";
	if (item.reqAttune === true) return "(requires attunement)";
	if (typeof item.reqAttune === "string") {
		return `(requires attunement ${item.reqAttune})`;
	}
	return "";
};

const getDamageText = (item: ItemEntry): string => {
	if (!item.damage) return "";
	const damageType = item.damageType ? ` ${item.damageType}` : "";
	return `${item.damage}${damageType}`;
};

const getPropertiesText = (item: ItemEntry): string => {
	if (!item.property?.length) return "";

	const propertyMap: Record<string, string> = {
		A: "Ammunition",
		AF: "Ammunition (Firearms)",
		BF: "Burst Fire",
		F: "Finesse",
		H: "Heavy",
		L: "Light",
		LD: "Loading",
		R: "Reach",
		RLD: "Reload",
		S: "Special",
		T: "Thrown",
		"2H": "Two-Handed",
		V: "Versatile",
	};

	return item.property
		.map(p => propertyMap[p] ?? p)
		.join(", ");
};

const getMasteryText = (item: ItemEntry): string => {
	if (!item.mastery?.length) return "";
	return `Mastery: ${item.mastery.join(", ")}`;
};

const hasItemEntries = (item: ItemEntry): boolean => {
	return !!(
		item.entries?.length ||
		item._fullEntries?.length ||
		item.additionalEntries?.length ||
		item._fullAdditionalEntries?.length
	);
};

// ============ Type/Rarity/Attunement Parts ============

export interface TypeRarityAttunementParts {
	typeRarityText: string;
	subTypeText: string;
	tierText: string;
}

const getTypeRarityAndAttunementTextParts = (
	item: ItemEntry,
	renderer: MarkdownRenderer,
	styleHint: StyleHint,
): TypeRarityAttunementParts => {
	const parts: string[] = [];

	// Type
	const typeText = getItemTypeText(item, styleHint);
	if (typeText) parts.push(typeText);

	// Attunement
	const attunementText = getAttunementText(item);

	return {
		typeRarityText: parts.join(", ") + (attunementText ? ` ${attunementText}` : ""),
		subTypeText: item.typeAlt ?? "",
		tierText: item.tier ?? "",
	};
};

// ============ Item Markdown Renderer ============

export class ItemMarkdownRenderer {
	private _renderer: MarkdownRenderer;
	private _styleHint: StyleHint;

	constructor(renderer?: MarkdownRenderer, styleHint: StyleHint = "classic") {
		this._renderer = renderer ?? getMarkdownRenderer();
		this._styleHint = styleHint;
	}

	setRenderer(renderer: MarkdownRenderer): this {
		this._renderer = renderer;
		return this;
	}

	setStyleHint(styleHint: StyleHint): this {
		this._styleHint = styleHint;
		return this;
	}

	getCompactRenderedString(item: ItemEntry, opts: ItemMarkdownOptions = {}): string {
		const meta = opts.meta ?? createRenderMeta();
		const styleHint = opts.styleHint ?? this._styleHint;
		const subStack: TextStack = createTextStack();

		// Get type/rarity parts
		const { typeRarityText, subTypeText, tierText } = getTypeRarityAndAttunementTextParts(
			item,
			this._renderer,
			styleHint,
		);

		// Build damage/properties line
		const ptDamage = getDamageText(item);
		const ptProperties = getPropertiesText(item);
		const ptMastery = getMasteryText(item);

		// Build subtitle parts
		const typeRarityTierValueWeight = [
			typeRarityText,
			subTypeText,
			tierText,
			itemValueToFullMultiCurrency(item, { styleHint }),
			itemWeightToFull(item),
		]
			.filter(Boolean)
			.join(", ");

		const ptSubtitle = [
			typeRarityTierValueWeight ? uppercaseFirst(typeRarityTierValueWeight) : "",
			ptDamage,
			ptProperties,
			ptMastery,
		]
			.filter(Boolean)
			.join("\n\n");

		// Item header
		const displayName = item._displayName ?? item.name;
		subStack[0] += `#### ${displayName}`;

		if (ptSubtitle) {
			subStack[0] += `\n\n${ptSubtitle}\n\n---\n\n`;
		} else {
			subStack[0] += `\n\n`;
		}

		// Render item entries
		if (hasItemEntries(item)) {
			const cacheDepth = meta.depth;
			meta.depth = 1;

			const mainEntries = item._fullEntries ?? item.entries;
			if (mainEntries?.length) {
				this._renderer.recursiveRender(
					{ type: "entries", entries: mainEntries } as Entry,
					subStack,
					meta,
					{ suffix: "\n" },
				);
			}

			const additionalEntries = item._fullAdditionalEntries ?? item.additionalEntries;
			if (additionalEntries?.length) {
				this._renderer.recursiveRender(
					{ type: "entries", entries: additionalEntries } as Entry,
					subStack,
					meta,
					{ suffix: "\n" },
				);
			}

			meta.depth = cacheDepth;
		}

		const itemRender = subStack.join("").trim();
		return `\n${itemRender}\n\n`;
	}
}

// ============ Module Export ============

let _itemRenderer: ItemMarkdownRenderer | null = null;

export const getItemMarkdownRenderer = (styleHint: StyleHint = "classic"): ItemMarkdownRenderer => {
	if (!_itemRenderer) {
		_itemRenderer = new ItemMarkdownRenderer(undefined, styleHint);
	} else {
		_itemRenderer.setStyleHint(styleHint);
	}
	return _itemRenderer;
};

export const itemMarkdown = {
	getCompactRenderedString: (item: ItemEntry, opts: ItemMarkdownOptions = {}): string => {
		return getItemMarkdownRenderer(opts.styleHint).getCompactRenderedString(item, opts);
	},

	getTypeRarityAndAttunementTextParts: (
		item: ItemEntry,
		opts: { styleHint?: StyleHint } = {},
	): TypeRarityAttunementParts => {
		const renderer = getMarkdownRenderer();
		return getTypeRarityAndAttunementTextParts(item, renderer, opts.styleHint ?? "classic");
	},
};

// ============ Variant Renderers ============

export const baseItemMarkdown = {
	getCompactRenderedString: (item: ItemEntry, opts: ItemMarkdownOptions = {}): string => {
		return itemMarkdown.getCompactRenderedString(item, opts);
	},
};

export const magicVariantMarkdown = {
	getCompactRenderedString: (item: ItemEntry, opts: ItemMarkdownOptions = {}): string => {
		return itemMarkdown.getCompactRenderedString(item, opts);
	},
};

export const itemGroupMarkdown = {
	getCompactRenderedString: (item: ItemEntry, opts: ItemMarkdownOptions = {}): string => {
		return itemMarkdown.getCompactRenderedString(item, opts);
	},
};
