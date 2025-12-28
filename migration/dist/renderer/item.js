// Item Renderer - TypeScript implementation
// Migrated from js/render.js Renderer.item class
// Provides HTML rendering utilities for D&D 5e items
import { createTextStack, createRenderMeta } from "./types.js";
import { uppercaseFirst, toTitleCase } from "../util/str-util.js";
// ============ Constants ============
export const HIDDEN_RARITY = new Set(["none", "unknown", "unknown (magic)", "varies"]);
const ITM_TYP_ABV_MEDIUM_ARMOR = "MA";
const ITM_TYP_ABV_HEAVY_ARMOR = "HA";
const ITM_TYP_ABV_SHIELD = "S";
const ITM_TYP_ABV_MELEE_WEAPON = "M";
const DMGTYPE_JSON_TO_FULL = {
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
export const dmgTypeToFull = (dmgType, opts = {}) => {
    if (!dmgType)
        return dmgType;
    const styleHint = opts.styleHint ?? "classic";
    const out = DMGTYPE_JSON_TO_FULL[dmgType] ?? dmgType;
    if (styleHint !== "classic")
        return toTitleCase(out);
    return out;
};
// ============ Property Sorting ============
const sortProperties = (a, b) => {
    const uidA = typeof a === "string" ? a : a.uid ?? "";
    const uidB = typeof b === "string" ? b : b.uid ?? "";
    return uidA.localeCompare(uidB);
};
// ============ Core Rendering Functions ============
const getTaggedDamage = (dmg, opts = {}) => {
    if (!dmg)
        return "";
    return `{@damage ${dmg.trim()}}`;
};
const renderDamage = (dmg, opts = {}) => {
    if (!dmg)
        return "";
    if (opts.renderer) {
        return opts.renderer.render(getTaggedDamage(dmg, opts));
    }
    return dmg.trim();
};
const getPropertyText = (item, property, valsUsed, opts = {}) => {
    const propUid = typeof property === "string" ? property : property.uid ?? "";
    const note = typeof property === "string" ? "" : property.note ?? "";
    const ptNote = note ? ` (${note})` : "";
    return `${propUid}${ptNote}`;
};
const getPropertiesTextUnusedDmg2 = (item, opts = {}) => {
    return `alt. ${renderDamage(item.dmg2, opts)}`;
};
const getPropertiesTextUnusedRange = (item) => {
    return `range ${item.range} ft.`;
};
const getPropertiesTextNoProperties = (item, opts = {}) => {
    const parts = [];
    if (item.dmg2)
        parts.push(getPropertiesTextUnusedDmg2(item, opts));
    if (item.range)
        parts.push(getPropertiesTextUnusedRange(item));
    return parts.join(", ");
};
export const getPropertiesText = (item, opts = {}) => {
    if (!item.property)
        return getPropertiesTextNoProperties(item, opts);
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
const getItemTypeAbbreviation = (type) => {
    if (!type)
        return null;
    if (type.includes("|")) {
        return type.split("|")[0];
    }
    return type;
};
const getInchesToFull = (inches, opts = {}) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    if (opts.isShort) {
        if (feet && remainingInches)
            return `${feet}'${remainingInches}"`;
        if (feet)
            return `${feet}'`;
        return `${remainingInches}"`;
    }
    if (feet && remainingInches)
        return `${feet} feet ${remainingInches} inches`;
    if (feet)
        return `${feet} feet`;
    return `${remainingInches} inches`;
};
export const getRenderedDamageAndProperties = (item, opts = {}) => {
    const damageParts = [];
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
        damageParts.push([
            renderDamage(item.dmg1, opts),
            item.dmgType ? dmgTypeToFull(item.dmgType, { styleHint }) : "",
        ]
            .filter(Boolean)
            .join(" "));
    }
    // Mounts
    if (item.speed != null)
        damageParts.push(`Speed: ${item.speed}`);
    if (item.carryingCapacity)
        damageParts.push(`Carrying Capacity: ${item.carryingCapacity} lb.`);
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
        damageParts.push([
            item.barDimensions.l ? `${getInchesToFull(item.barDimensions.l, { isShort: true })} long` : "",
            item.barDimensions.w ? `${getInchesToFull(item.barDimensions.w, { isShort: true })} wide` : "",
            item.barDimensions.h ? `${getInchesToFull(item.barDimensions.h, { isShort: true })} thick` : "",
        ]
            .filter(Boolean)
            .join(" \u00D7 "));
    }
    const ptDamage = damageParts.join(", ");
    const ptProperties = getPropertiesText(item, opts);
    return [ptDamage, ptProperties];
};
// ============ Vehicle Costs Helper ============
const getItemVehicleCostsToFull = (item, isShortForm = false) => {
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
export const getRenderedMastery = (item, opts = {}) => {
    if (!item.mastery)
        return "";
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
        const rendered = masteryParts.map(p => opts.renderer.render(p)).join(", ");
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
export const getTransformedTypeEntriesMeta = (item, opts = {}) => {
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
export const getTypeRarityAndAttunementHtmlParts = (item, opts = {}) => {
    const styleHint = opts.styleHint ?? "classic";
    const { entryTypeRarity, entrySubtype, entryTier, } = getTransformedTypeEntriesMeta(item, { styleHint });
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
export const getAttunementAndAttunementCatText = (item, prop = "reqAttune") => {
    const STR_NO_ATTUNEMENT = "No Attunement Required";
    let attunement = null;
    let attunementCat = STR_NO_ATTUNEMENT;
    const attuneVal = prop === "reqAttune" ? item.reqAttune : item.reqAttuneAlt;
    if (attuneVal != null && attuneVal !== false) {
        if (attuneVal === true) {
            attunementCat = "Requires Attunement";
            attunement = "(requires attunement)";
        }
        else if (attuneVal === "optional") {
            attunementCat = "Attunement Optional";
            attunement = "(attunement optional)";
        }
        else if (typeof attuneVal === "string" && attuneVal.toLowerCase().startsWith("by")) {
            attunementCat = "Requires Attunement By...";
            attunement = `(requires attunement ${attuneVal})`;
        }
        else {
            attunementCat = "Requires Attunement";
            attunement = `(requires attunement ${attuneVal})`;
        }
    }
    return [attunement, attunementCat];
};
// ============ Renderable Type Entries Meta ============
export const getRenderableTypeEntriesMeta = (item, opts = {}) => {
    const styleHint = opts.styleHint ?? "classic";
    const textTypes = [];
    const ptsEntryType = [];
    const ptsEntrySubType = [];
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
const addHtmlAndTextTypesType = (opts) => {
    const { type, typeAbv, ptsEntryType, textTypes, ptsEntrySubType, showingBase, item, styleHint } = opts;
    const fullType = getItemTypeName(type);
    const isSub = (textTypes.some(it => it.includes("weapon")) && fullType.includes("weapon"))
        || (textTypes.some(it => it.includes("armor")) && fullType.includes("armor"));
    if (!showingBase && !!item.baseItem) {
        (isSub ? ptsEntrySubType : ptsEntryType).push(`${fullType} ({@item ${item.baseItem}})`);
    }
    else if (typeAbv === ITM_TYP_ABV_SHIELD) {
        (isSub ? ptsEntrySubType : ptsEntryType).push(`armor ({@item shield|phb})`);
    }
    else {
        (isSub ? ptsEntrySubType : ptsEntryType).push(fullType);
    }
    textTypes.push(fullType);
};
const getItemTypeName = (type) => {
    return type.toLowerCase();
};
// ============ Rendered Entries ============
export const getRenderedEntries = (item, opts = {}) => {
    const isCompact = opts.isCompact ?? false;
    const wrappedTypeAllowlist = opts.wrappedTypeAllowlist ?? null;
    if (!opts.renderer) {
        return "";
    }
    const renderer = opts.renderer;
    const renderStack = createTextStack();
    if (item._fullEntries?.length || item.entries?.length) {
        const entries = item._fullEntries ?? item.entries ?? [];
        const entry = { type: "entries", entries };
        renderer.recursiveRender(entry, renderStack, createRenderMeta(), { depth: 1 });
    }
    if (item._fullAdditionalEntries?.length || item.additionalEntries?.length) {
        const entries = item._fullAdditionalEntries ?? item.additionalEntries ?? [];
        const entry = { type: "entries", entries };
        renderer.recursiveRender(entry, renderStack, createRenderMeta(), { depth: 1 });
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
export const hasEntries = (item) => {
    return !!(item._fullAdditionalEntries?.length ||
        item._fullEntries?.length ||
        item.entries?.length);
};
// ============ Type/Rarity/Attunement HTML ============
export const getTypeRarityAndAttunementHtml = (parts, opts = {}) => {
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
export const doRenderRarity = (rarity) => {
    return !HIDDEN_RARITY.has(rarity);
};
// ============ Mundane Check ============
export const isMundane = (item) => {
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
//# sourceMappingURL=item.js.map