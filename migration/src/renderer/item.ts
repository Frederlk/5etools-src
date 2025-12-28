// Item Renderer - TypeScript implementation
// Migrated from js/render.js Renderer.item class
// Provides HTML rendering utilities for D&D 5e items

import type { Entry } from "../../../types/entry.js";
import type { StyleHint, RenderMeta, TextStack } from "./types.js";
import { createTextStack, createRenderMeta } from "./types.js";
import { itemValueToFullMultiCurrency, itemWeightToFull } from "../parser/item.js";
import { uppercaseFirst, toTitleCase } from "../util/str-util.js";

// ============ Types ============

export interface ItemProperty {
	uid?: string;
	note?: string;
}

export interface ItemMastery {
	uid?: string;
	note?: string;
}

export interface ItemEntry {
	name: string;
	_displayName?: string;
	source: string;
	type?: string;
	bardingType?: string;
	typeAlt?: string;
	rarity?: string;
	reqAttune?: boolean | string;
	reqAttuneAlt?: boolean | string;
	_attunement?: string;
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
	_entryType?: string;
	_entrySubType?: string;
	property?: (string | ItemProperty)[];
	mastery?: (string | ItemMastery)[];
	dmg1?: string;
	dmg2?: string;
	dmgType?: string;
	ac?: number;
	acSpecial?: string;
	dexterityMax?: number | null;
	speed?: string;
	carryingCapacity?: number;
	vehSpeed?: number;
	capCargo?: number;
	capPassenger?: number;
	crew?: number;
	crewMin?: number;
	crewMax?: number;
	vehAc?: number;
	vehHp?: number;
	vehDmgThresh?: number;
	travelCost?: number;
	shippingCost?: number;
	barDimensions?: {
		l?: number;
		w?: number;
		h?: number;
	};
	range?: number;
	weaponCategory?: string;
	wondrous?: boolean;
	tattoo?: boolean;
	staff?: boolean;
	ammo?: boolean;
	age?: string;
	firearm?: boolean;
	poison?: boolean;
	poisonTypes?: string[];
	baseItem?: string;
	sentient?: boolean;
	_category?: string;
	_variantName?: string;
	lootTables?: string[];
}

export interface TransformedTypeEntriesMeta {
	entryType: string;
	entryTypeRarity: string;
	entrySubtype: string;
	entryTier: string;
}

export interface TypeRarityAttunementParts {
	typeRarityHtml: string;
	subTypeHtml: string;
	tierHtml: string;
}

export interface RenderableTypeEntriesMeta {
	textTypes: string[];
	entryType: string;
	entrySubType: string;
}

export interface ItemRenderOptions {
	styleHint?: StyleHint;
	renderer?: ItemRenderer;
	isSkipPrefix?: boolean;
	isCompact?: boolean;
	wrappedTypeAllowlist?: Set<string> | null;
}

export interface ItemRenderer {
	render(entry: Entry | string): string;
	recursiveRender(entry: Entry, textStack: TextStack, meta: RenderMeta, options?: { depth?: number }): void;
	getLineBreak(): string;
}

// ============ Constants ============

export const HIDDEN_RARITY = new Set(["none", "unknown", "unknown (magic)", "varies"]);

const ITM_TYP_ABV_MEDIUM_ARMOR = "MA";
const ITM_TYP_ABV_HEAVY_ARMOR = "HA";
const ITM_TYP_ABV_SHIELD = "S";
const ITM_TYP_ABV_MELEE_WEAPON = "M";

const DMGTYPE_JSON_TO_FULL: Record<string, string> = {
	A: "acid",
	B: "bludgeoning",
	C: "cold",
	F: "fire",
	O: "force",
	L: "lightning",
	N: "necrotic",
	P: "piercing",
	I: "poison",
	Y: "psychic",
	R: "radiant",
	S: "slashing",
	T: "thunder",
};

// ============ Damage Type Helpers ============

export const dmgTypeToFull = (dmgType: string, opts: { styleHint?: StyleHint } = {}): string => {
	if (!dmgType) return dmgType;

	const styleHint = opts.styleHint ?? "classic";
	const out = DMGTYPE_JSON_TO_FULL[dmgType] ?? dmgType;

	if (styleHint !== "classic") return toTitleCase(out);
	return out;
};

// ============ Property Sorting ============

const sortProperties = (a: string | ItemProperty, b: string | ItemProperty): number => {
	const uidA = typeof a === "string" ? a : a.uid ?? "";
	const uidB = typeof b === "string" ? b : b.uid ?? "";
	return uidA.localeCompare(uidB);
};

// ============ Core Rendering Functions ============

const getTaggedDamage = (dmg: string | undefined, opts: { renderer?: ItemRenderer } = {}): string => {
	if (!dmg) return "";
	return `{@damage ${dmg.trim()}}`;
};

const renderDamage = (dmg: string | undefined, opts: { renderer?: ItemRenderer } = {}): string => {
	if (!dmg) return "";
	if (opts.renderer) {
		return opts.renderer.render(getTaggedDamage(dmg, opts));
	}
	return dmg.trim();
};

const getPropertyText = (
	item: ItemEntry,
	property: string | ItemProperty,
	valsUsed: { dmg2: boolean; range: boolean },
	opts: { renderer?: ItemRenderer } = {},
): string => {
	const propUid = typeof property === "string" ? property : property.uid ?? "";
	const note = typeof property === "string" ? "" : property.note ?? "";
	const ptNote = note ? ` (${note})` : "";

	return `${propUid}${ptNote}`;
};

const getPropertiesTextUnusedDmg2 = (item: ItemEntry, opts: { renderer?: ItemRenderer } = {}): string => {
	return `alt. ${renderDamage(item.dmg2, opts)}`;
};

const getPropertiesTextUnusedRange = (item: ItemEntry): string => {
	return `range ${item.range} ft.`;
};

const getPropertiesTextNoProperties = (item: ItemEntry, opts: { renderer?: ItemRenderer } = {}): string => {
	const parts: string[] = [];
	if (item.dmg2) parts.push(getPropertiesTextUnusedDmg2(item, opts));
	if (item.range) parts.push(getPropertiesTextUnusedRange(item));
	return parts.join(", ");
};

export const getPropertiesText = (item: ItemEntry, opts: { renderer?: ItemRenderer } = {}): string => {
	if (!item.property) return getPropertiesTextNoProperties(item, opts);

	const valsUsed = {
		dmg2: false,
		range: false,
	};

	const renderedProperties = [...item.property]
		.sort(sortProperties)
		.map(property => getPropertyText(item, property, valsUsed, opts))
		.filter(Boolean);

	if (!valsUsed.dmg2 && item.dmg2) {
		renderedProperties.unshift(getPropertiesTextUnusedDmg2(item, opts));
	}
	if (!valsUsed.range && item.range) {
		renderedProperties.push(getPropertiesTextUnusedRange(item));
	}

	return renderedProperties.join(", ");
};

// ============ Damage and Properties ============

const getItemTypeAbbreviation = (type: string | undefined): string | null => {
	if (!type) return null;
	if (type.includes("|")) {
		return type.split("|")[0];
	}
	return type;
};

const getInchesToFull = (inches: number, opts: { isShort?: boolean } = {}): string => {
	const feet = Math.floor(inches / 12);
	const remainingInches = inches % 12;

	if (opts.isShort) {
		if (feet && remainingInches) return `${feet}'${remainingInches}"`;
		if (feet) return `${feet}'`;
		return `${remainingInches}"`;
	}

	if (feet && remainingInches) return `${feet} feet ${remainingInches} inches`;
	if (feet) return `${feet} feet`;
	return `${remainingInches} inches`;
};

export const getRenderedDamageAndProperties = (
	item: ItemEntry,
	opts: ItemRenderOptions = {},
): [string, string] => {
	const damageParts: string[] = [];
	const styleHint = opts.styleHint ?? "classic";

	const itemType = item.bardingType ?? item.type;
	const itemTypeAbv = getItemTypeAbbreviation(itemType);

	// Armor
	if (item.ac != null) {
		const dexterityMax = (itemTypeAbv === ITM_TYP_ABV_MEDIUM_ARMOR && item.dexterityMax === undefined)
			? 2
			: item.dexterityMax;
		const isAddDex = item.dexterityMax !== undefined ||
			![ITM_TYP_ABV_HEAVY_ARMOR, ITM_TYP_ABV_SHIELD].includes(itemTypeAbv ?? "");

		const prefix = itemTypeAbv === ITM_TYP_ABV_SHIELD ? "+" : "";
		const suffix = isAddDex ? ` + Dex${dexterityMax ? ` (max ${dexterityMax})` : ""}` : "";

		damageParts.push(`AC ${prefix}${item.ac}${suffix}`);
	}
	if (item.acSpecial != null) {
		damageParts.push(item.ac != null ? item.acSpecial : `AC ${item.acSpecial}`);
	}

	// Damage
	if (item.dmg1) {
		damageParts.push(
			[
				renderDamage(item.dmg1, opts),
				item.dmgType ? dmgTypeToFull(item.dmgType, { styleHint }) : "",
			]
				.filter(Boolean)
				.join(" "),
		);
	}

	// Mounts
	if (item.speed != null) damageParts.push(`Speed: ${item.speed}`);
	if (item.carryingCapacity) damageParts.push(`Carrying Capacity: ${item.carryingCapacity} lb.`);

	// Vehicles
	if (item.vehSpeed || item.capCargo || item.capPassenger || item.crew || item.crewMin ||
		item.crewMax || item.vehAc || item.vehHp || item.vehDmgThresh ||
		item.travelCost || item.shippingCost) {

		const vehPartUpper = item.vehSpeed ? `Speed: ${item.vehSpeed} mph` : null;

		const vehPartMiddle = item.capCargo || item.capPassenger
			? `Carrying Capacity: ${[
				item.capCargo ? `${item.capCargo} ton${item.capCargo === 0 || item.capCargo > 1 ? "s" : ""} cargo` : null,
				item.capPassenger ? `${item.capPassenger} passenger${item.capPassenger === 1 ? "" : "s"}` : null,
			].filter(Boolean).join(", ")}`
			: null;

		const { travelCostFull, shippingCostFull } = getItemVehicleCostsToFull(item);

		const vehPartLower = [
			item.crew ? `Crew ${item.crew}` : null,
			item.crewMin && item.crewMax ? `Crew ${item.crewMin}-${item.crewMax}` : null,
			item.vehAc ? `AC ${item.vehAc}` : null,
			item.vehHp ? `HP ${item.vehHp}${item.vehDmgThresh ? `, Damage Threshold ${item.vehDmgThresh}` : ""}` : null,
		].filter(Boolean).join(", ");

		const lineBreak = opts.renderer?.getLineBreak() ?? "<br>";
		damageParts.push([
			vehPartUpper,
			vehPartMiddle,
			travelCostFull ? `Personal Travel Cost: ${travelCostFull} per mile per passenger` : null,
			shippingCostFull ? `Shipping Cost: ${shippingCostFull} per 100 pounds per mile` : null,
			vehPartLower,
		].filter(Boolean).join(lineBreak));
	}

	// Bars
	if (item.barDimensions) {
		damageParts.push(
			[
				item.barDimensions.l ? `${getInchesToFull(item.barDimensions.l, { isShort: true })} long` : "",
				item.barDimensions.w ? `${getInchesToFull(item.barDimensions.w, { isShort: true })} wide` : "",
				item.barDimensions.h ? `${getInchesToFull(item.barDimensions.h, { isShort: true })} thick` : "",
			]
				.filter(Boolean)
				.join(" \u00D7 "),
		);
	}

	const ptDamage = damageParts.join(", ");
	const ptProperties = getPropertiesText(item, opts);

	return [ptDamage, ptProperties];
};

// ============ Vehicle Costs Helper ============

const getItemVehicleCostsToFull = (
	item: ItemEntry,
	isShortForm = false,
): { travelCostFull: string; shippingCostFull: string } => {
	return {
		travelCostFull: item.travelCost
			? `${item.travelCost} gp`
			: "",
		shippingCostFull: item.shippingCost
			? `${item.shippingCost} gp`
			: "",
	};
};

// ============ Mastery ============

export const getRenderedMastery = (
	item: ItemEntry,
	opts: ItemRenderOptions = {},
): string => {
	if (!item.mastery) return "";

	const isSkipPrefix = opts.isSkipPrefix ?? false;

	const masteryParts = item.mastery.map(info => {
		if (typeof info === "string") {
			return `{@itemMastery ${info}}`;
		}
		if (info.uid) {
			return info.note
				? `{@itemMastery ${info.uid}} {@style (${info.note})|small}`
				: `{@itemMastery ${info.uid}}`;
		}
		return "";
	}).filter(Boolean);

	if (opts.renderer) {
		const rendered = masteryParts.map(p => opts.renderer!.render(p)).join(", ");
		return [
			isSkipPrefix ? "" : "Mastery: ",
			rendered,
		].filter(Boolean).join(" ");
	}

	return [
		isSkipPrefix ? "" : "Mastery: ",
		masteryParts.join(", "),
	].filter(Boolean).join(" ");
};

// ============ Type Entries Meta ============

export const getTransformedTypeEntriesMeta = (
	item: ItemEntry,
	opts: { styleHint?: StyleHint } = {},
): TransformedTypeEntriesMeta => {
	const styleHint = opts.styleHint ?? "classic";
	const fnTransform = styleHint === "classic" ? uppercaseFirst : toTitleCase;

	const entryType = fnTransform(item._entryType ?? "");
	const entrySubtype = fnTransform(item._entrySubType ?? "");

	const typeRarity = [
		item._entryType === "other" ? "" : entryType,
		(item.rarity && doRenderRarity(item.rarity) ? fnTransform(item.rarity) : ""),
	]
		.filter(Boolean)
		.join(", ");

	const ptAttunement = item.reqAttune ? fnTransform(item._attunement ?? "") : "";

	return {
		entryType,
		entryTypeRarity: [typeRarity, ptAttunement].filter(Boolean).join(" "),
		entrySubtype,
		entryTier: item.tier
			? fnTransform(`${item.tier} tier`)
			: "",
	};
};

// ============ Type/Rarity/Attunement HTML Parts ============

export const getTypeRarityAndAttunementHtmlParts = (
	item: ItemEntry,
	opts: { styleHint?: StyleHint; renderer?: ItemRenderer } = {},
): TypeRarityAttunementParts => {
	const styleHint = opts.styleHint ?? "classic";

	const {
		entryTypeRarity,
		entrySubtype,
		entryTier,
	} = getTransformedTypeEntriesMeta(item, { styleHint });

	if (opts.renderer) {
		return {
			typeRarityHtml: opts.renderer.render(entryTypeRarity),
			subTypeHtml: opts.renderer.render(entrySubtype),
			tierHtml: opts.renderer.render(entryTier),
		};
	}

	return {
		typeRarityHtml: entryTypeRarity,
		subTypeHtml: entrySubtype,
		tierHtml: entryTier,
	};
};

// ============ Attunement Text ============

export const getAttunementAndAttunementCatText = (
	item: ItemEntry,
	prop: "reqAttune" | "reqAttuneAlt" = "reqAttune",
): [string | null, string] => {
	const STR_NO_ATTUNEMENT = "No Attunement Required";
	let attunement: string | null = null;
	let attunementCat = STR_NO_ATTUNEMENT;

	const attuneVal = prop === "reqAttune" ? item.reqAttune : item.reqAttuneAlt;

	if (attuneVal != null && attuneVal !== false) {
		if (attuneVal === true) {
			attunementCat = "Requires Attunement";
			attunement = "(requires attunement)";
		} else if (attuneVal === "optional") {
			attunementCat = "Attunement Optional";
			attunement = "(attunement optional)";
		} else if (typeof attuneVal === "string" && attuneVal.toLowerCase().startsWith("by")) {
			attunementCat = "Requires Attunement By...";
			attunement = `(requires attunement ${attuneVal})`;
		} else {
			attunementCat = "Requires Attunement";
			attunement = `(requires attunement ${attuneVal})`;
		}
	}

	return [attunement, attunementCat];
};

// ============ Renderable Type Entries Meta ============

export const getRenderableTypeEntriesMeta = (
	item: ItemEntry,
	opts: { styleHint?: StyleHint } = {},
): RenderableTypeEntriesMeta => {
	const styleHint = opts.styleHint ?? "classic";

	const textTypes: string[] = [];
	const ptsEntryType: string[] = [];
	const ptsEntrySubType: string[] = [];

	const itemTypeAbv = getItemTypeAbbreviation(item.type);
	const itemTypeAltAbv = getItemTypeAbbreviation(item.typeAlt);

	let showingBase = false;

	if (item.wondrous) {
		ptsEntryType.push(`wondrous item${item.tattoo ? ` (tattoo)` : ""}`);
		textTypes.push("wondrous item");
	}
	if (item.tattoo) {
		textTypes.push("tattoo");
	}
	if (item.staff) {
		ptsEntryType.push("staff");
		textTypes.push("staff");
	}
	if (item.ammo) {
		ptsEntryType.push("ammunition");
		textTypes.push("ammunition");
	}
	if (item.age) {
		ptsEntrySubType.push(item.age);
		textTypes.push(item.age);
	}
	if (item.weaponCategory) {
		const baseItemRef = item.baseItem
			? ` ({@item ${styleHint === "classic" ? item.baseItem : toTitleCase(item.baseItem)}})`
			: "";
		ptsEntryType.push(`weapon${baseItemRef}`);
		ptsEntrySubType.push(`${item.weaponCategory} weapon`);
		textTypes.push(`${item.weaponCategory} weapon`);
		showingBase = true;
	}
	if (item.staff && itemTypeAbv !== ITM_TYP_ABV_MELEE_WEAPON && itemTypeAltAbv !== ITM_TYP_ABV_MELEE_WEAPON) {
		ptsEntrySubType.push("melee weapon");
		textTypes.push("melee weapon");
	}

	if (item.type) {
		addHtmlAndTextTypesType({
			type: item.type,
			typeAbv: itemTypeAbv,
			ptsEntryType,
			textTypes,
			ptsEntrySubType,
			showingBase,
			item,
			styleHint,
		});
	}
	if (item.typeAlt) {
		addHtmlAndTextTypesType({
			type: item.typeAlt,
			typeAbv: itemTypeAltAbv,
			ptsEntryType,
			textTypes,
			ptsEntrySubType,
			showingBase,
			item,
			styleHint,
		});
	}

	if (item.firearm) {
		ptsEntrySubType.push("firearm");
		textTypes.push("firearm");
	}
	if (item.poison) {
		const poisonTypesStr = item.poisonTypes
			? ` (${item.poisonTypes.join(", ")})`
			: "";
		ptsEntryType.push(`poison${poisonTypesStr}`);
		textTypes.push("poison");
	}

	return {
		textTypes,
		entryType: ptsEntryType.join(", "),
		entrySubType: ptsEntrySubType.join(", "),
	};
};

const addHtmlAndTextTypesType = (opts: {
	type: string;
	typeAbv: string | null;
	ptsEntryType: string[];
	textTypes: string[];
	ptsEntrySubType: string[];
	showingBase: boolean;
	item: ItemEntry;
	styleHint: StyleHint;
}): void => {
	const { type, typeAbv, ptsEntryType, textTypes, ptsEntrySubType, showingBase, item, styleHint } = opts;

	const fullType = getItemTypeName(type);

	const isSub = (textTypes.some(it => it.includes("weapon")) && fullType.includes("weapon"))
		|| (textTypes.some(it => it.includes("armor")) && fullType.includes("armor"));

	if (!showingBase && !!item.baseItem) {
		(isSub ? ptsEntrySubType : ptsEntryType).push(`${fullType} ({@item ${item.baseItem}})`);
	} else if (typeAbv === ITM_TYP_ABV_SHIELD) {
		(isSub ? ptsEntrySubType : ptsEntryType).push(`armor ({@item shield|phb})`);
	} else {
		(isSub ? ptsEntrySubType : ptsEntryType).push(fullType);
	}

	textTypes.push(fullType);
};

const getItemTypeName = (type: string): string => {
	return type.toLowerCase();
};

// ============ Rendered Entries ============

export const getRenderedEntries = (
	item: ItemEntry,
	opts: ItemRenderOptions = {},
): string => {
	const isCompact = opts.isCompact ?? false;
	const wrappedTypeAllowlist = opts.wrappedTypeAllowlist ?? null;

	if (!opts.renderer) {
		return "";
	}

	const renderer = opts.renderer;
	const renderStack: TextStack = createTextStack();

	if (item._fullEntries?.length || item.entries?.length) {
		const entries = item._fullEntries ?? item.entries ?? [];
		const entry = { type: "entries", entries };
		renderer.recursiveRender(entry as Entry, renderStack, createRenderMeta(), { depth: 1 });
	}

	if (item._fullAdditionalEntries?.length || item.additionalEntries?.length) {
		const entries = item._fullAdditionalEntries ?? item.additionalEntries ?? [];
		const entry = { type: "entries", entries };
		renderer.recursiveRender(entry as Entry, renderStack, createRenderMeta(), { depth: 1 });
	}

	if (!isCompact && item.lootTables?.length) {
		const lootTableLinks = item.lootTables
			.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
			.map(tbl => renderer.render(`{@table ${tbl}}`))
			.join(", ");
		renderStack[0] += `<div><span class="bold">Found On: </span>${lootTableLinks}</div>`;
	}

	return renderStack.join("").trim();
};

// ============ Has Entries ============

export const hasEntries = (item: ItemEntry): boolean => {
	return !!(
		item._fullAdditionalEntries?.length ||
		item._fullEntries?.length ||
		item.entries?.length
	);
};

// ============ Type/Rarity/Attunement HTML ============

export const getTypeRarityAndAttunementHtml = (
	parts: TypeRarityAttunementParts,
	opts: { styleHint?: StyleHint } = {},
): string => {
	const { typeRarityHtml = "", subTypeHtml = "", tierHtml = "" } = parts;

	return `<div class="ve-flex-col">
		${typeRarityHtml || tierHtml ? `<div class="split ${subTypeHtml ? "mb-1" : ""}">
			<div class="italic">${typeRarityHtml || ""}</div>
			<div class="no-wrap ${tierHtml ? `ml-2` : ""}">${subTypeHtml || ""}</div>
		</div>` : ""}
		${subTypeHtml ? `<div class="italic">${subTypeHtml}</div>` : ""}
	</div>`;
};

// ============ Rarity Check ============

export const doRenderRarity = (rarity: string): boolean => {
	return !HIDDEN_RARITY.has(rarity);
};

// ============ Mundane Check ============

export const isMundane = (item: Pick<ItemEntry, "rarity" | "_category">): boolean => {
	return item.rarity === "none" || item.rarity === "unknown" || item._category === "Basic";
};

// ============ Module Exports ============

export const itemRenderer = {
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
};
