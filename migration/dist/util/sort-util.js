/**
 * Sort Utility Functions - Pure TypeScript implementation
 * Migrated from js/utils.js SortUtil class
 */
/**
 * Generic ascending sort comparator
 */
export const ascSort = (a, b) => {
    if (b === a)
        return 0;
    return b < a ? 1 : -1;
};
/**
 * Ascending sort by property
 */
export const ascSortProp = (prop, a, b) => {
    return ascSort(a[prop], b[prop]);
};
/**
 * Case-insensitive ascending sort
 */
export const ascSortLower = (a, b) => {
    const aLower = a?.toLowerCase() ?? "";
    const bLower = b?.toLowerCase() ?? "";
    return ascSort(aLower, bLower);
};
/**
 * Case-insensitive ascending sort by property
 */
export const ascSortLowerProp = (prop, a, b) => {
    return ascSortLower(a[prop], b[prop]);
};
/**
 * Sort with numerical suffix handling
 * e.g., "Item 2" < "Item 10"
 */
export const ascSortNumericalSuffix = (a, b, numberCleanRegexp = /[,.]*/g) => {
    const popEndNumber = (str) => {
        const spl = str.split(" ");
        const lastPart = spl[spl.length - 1];
        const isNumeric = !isNaN(parseFloat(lastPart)) && isFinite(Number(lastPart));
        if (isNumeric) {
            return [
                spl.slice(0, -1).join(" "),
                Number(lastPart.replace(numberCleanRegexp, "")),
            ];
        }
        return [spl.join(" "), 0];
    };
    const [aStr, aNum] = popEndNumber(a);
    const [bStr, bNum] = popEndNumber(b);
    const initialSort = ascSort(aStr, bStr);
    if (initialSort)
        return initialSort;
    return ascSort(aNum, bNum);
};
const RE_SORT_NUM = /\d+/g;
/**
 * Sort by property with embedded number padding for correct numerical order
 */
export const ascSortLowerPropNumeric = (prop, a, b) => {
    a._sortName ??= (a[prop] || "").replace(RE_SORT_NUM, (...m) => `${m[0].padStart(10, "0")}`);
    b._sortName ??= (b[prop] || "").replace(RE_SORT_NUM, (...m) => `${m[0].padStart(10, "0")}`);
    return ascSortLower(a._sortName, b._sortName);
};
/**
 * Sort dates in ascending order
 */
export const ascSortDate = (a, b) => {
    return b.getTime() - a.getTime();
};
/**
 * Sort date strings in ascending order
 */
export const ascSortDateString = (a, b) => {
    return ascSortDate(new Date(a || "1970-01-01"), new Date(b || "1970-01-01"));
};
/**
 * Compare list names (case-insensitive)
 */
export const compareListNames = (a, b) => {
    return ascSort(a.name.toLowerCase(), b.name.toLowerCase());
};
/**
 * D&D ability abbreviation order
 */
const ABIL_ABVS = ["str", "dex", "con", "int", "wis", "cha"];
/**
 * Sort D&D attributes in standard order (STR, DEX, CON, INT, WIS, CHA)
 */
export const ascSortAtts = (a, b) => {
    const aSpecial = a === "special";
    const bSpecial = b === "special";
    if (aSpecial && bSpecial)
        return 0;
    if (aSpecial)
        return 1;
    if (bSpecial)
        return -1;
    return ABIL_ABVS.indexOf(a) - ABIL_ABVS.indexOf(b);
};
/**
 * D&D size abbreviation order
 */
const SIZE_ABVS = ["F", "D", "T", "S", "M", "L", "H", "G", "C", "V"];
/**
 * Sort D&D sizes in order
 */
export const ascSortSize = (a, b) => {
    return SIZE_ABVS.indexOf(a) - SIZE_ABVS.indexOf(b);
};
/**
 * D&D alignment priority order
 */
const ALIGN_FIRST = ["L", "C"];
const ALIGN_SECOND = ["G", "E"];
/**
 * Sort D&D alignments
 */
export const alignmentSort = (a, b) => {
    if (a === b)
        return 0;
    if (ALIGN_FIRST.includes(a))
        return -1;
    if (ALIGN_SECOND.includes(a))
        return 1;
    if (ALIGN_FIRST.includes(b))
        return 1;
    if (ALIGN_SECOND.includes(b))
        return -1;
    return 0;
};
/**
 * Item rarity order
 */
const ITEM_RARITY_ORDER = [
    "none", "common", "uncommon", "rare", "very rare",
    "legendary", "artifact", "varies", "unknown (magic)", "unknown",
];
/**
 * Sort item rarities in D&D order
 */
export const ascSortItemRarity = (a, b) => {
    const ixA = ITEM_RARITY_ORDER.indexOf(a);
    const ixB = ITEM_RARITY_ORDER.indexOf(b);
    return (~ixA ? ixA : Number.MAX_SAFE_INTEGER) - (~ixB ? ixB : Number.MAX_SAFE_INTEGER);
};
/**
 * Monster trait sort order
 */
const MON_TRAIT_ORDER = [
    "temporary statblock",
    "special equipment",
    "shapechanger",
];
/**
 * Sort monster traits (special equipment first, then alphabetical)
 */
export const monTraitSort = (a, b, stripTags = (s) => s) => {
    if (a.sort != null && b.sort != null)
        return a.sort - b.sort;
    if (a.sort != null && b.sort == null)
        return -1;
    if (a.sort == null && b.sort != null)
        return 1;
    if (!a.name && !b.name)
        return 0;
    const aClean = stripTags(a.name || "").toLowerCase().trim();
    const bClean = stripTags(b.name || "").toLowerCase().trim();
    const isOnlyA = (a.name || "").endsWith(" Only)");
    const isOnlyB = (b.name || "").endsWith(" Only)");
    if (!isOnlyA && isOnlyB)
        return -1;
    if (isOnlyA && !isOnlyB)
        return 1;
    const ixA = MON_TRAIT_ORDER.indexOf(aClean);
    const ixB = MON_TRAIT_ORDER.indexOf(bClean);
    if (~ixA && ~ixB)
        return ixA - ixB;
    if (~ixA)
        return -1;
    if (~ixB)
        return 1;
    return ascSort(aClean, bClean);
};
/**
 * Generic entity sort (name, then source)
 */
export const ascSortGenericEntity = (a, b) => {
    return ascSortLower(a.name || "", b.name || "") || ascSortLower(a.source || "", b.source || "");
};
/**
 * Sort deities (name, source, pantheon)
 */
export const ascSortDeity = (a, b) => {
    return ascSortLower(a.name, b.name) || ascSortLower(a.source, b.source) || ascSortLower(a.pantheon, b.pantheon);
};
/**
 * Sort cards (set, source, name)
 */
export const ascSortCard = (a, b) => {
    return ascSortLower(a.set, b.set) || ascSortLower(a.source, b.source) || ascSortLower(a.name, b.name);
};
/**
 * Sort encounters (name, caption, level range)
 */
export const ascSortEncounter = (a, b) => {
    return (ascSortLower(a.name, b.name) ||
        ascSortLower(a.caption || "", b.caption || "") ||
        ascSort(a.minlvl || 0, b.minlvl || 0) ||
        ascSort(a.maxlvl || Number.MAX_SAFE_INTEGER, b.maxlvl || Number.MAX_SAFE_INTEGER));
};
/**
 * Sort adventures (published, parent source, published order, storyline, level, name)
 */
export const ascSortAdventure = (a, b) => {
    return (ascSortDateString(b.published, a.published) ||
        ascSortLower(a.parentSource || "", b.parentSource || "") ||
        ascSort(a.publishedOrder ?? 0, b.publishedOrder ?? 0) ||
        ascSortLower(a.storyline, b.storyline) ||
        ascSort(a.level?.start ?? 20, b.level?.start ?? 20) ||
        ascSortLower(a.name, b.name));
};
/**
 * Sort books (published, parent source, name)
 */
export const ascSortBook = (a, b) => {
    return (ascSortDateString(b.published, a.published) ||
        ascSortLower(a.parentSource || "", b.parentSource || "") ||
        ascSortLower(a.name, b.name));
};
/**
 * Sort book data by ID
 */
export const ascSortBookData = (a, b) => {
    return ascSortLower(a.id || "", b.id || "");
};
export { ABIL_ABVS, SIZE_ABVS, ITEM_RARITY_ORDER };
//# sourceMappingURL=sort-util.js.map