/**
 * Sort Utility Functions - Pure TypeScript implementation
 * Migrated from js/utils.js SortUtil class
 */
/**
 * Generic ascending sort comparator
 */
export declare const ascSort: <T extends string | number>(a: T, b: T) => number;
/**
 * Ascending sort by property
 */
export declare const ascSortProp: <T, K extends keyof T>(prop: K, a: T, b: T) => number;
/**
 * Case-insensitive ascending sort
 */
export declare const ascSortLower: (a: string | null | undefined, b: string | null | undefined) => number;
/**
 * Case-insensitive ascending sort by property
 */
export declare const ascSortLowerProp: <T>(prop: keyof T, a: T, b: T) => number;
/**
 * Sort with numerical suffix handling
 * e.g., "Item 2" < "Item 10"
 */
export declare const ascSortNumericalSuffix: (a: string, b: string, numberCleanRegexp?: RegExp) => number;
/**
 * Sort by property with embedded number padding for correct numerical order
 */
export declare const ascSortLowerPropNumeric: <T extends {
    _sortName?: string;
}>(prop: keyof T, a: T, b: T) => number;
/**
 * Sort dates in ascending order
 */
export declare const ascSortDate: (a: Date, b: Date) => number;
/**
 * Sort date strings in ascending order
 */
export declare const ascSortDateString: (a: string | null | undefined, b: string | null | undefined) => number;
/**
 * Compare list names (case-insensitive)
 */
export declare const compareListNames: <T extends {
    name: string;
}>(a: T, b: T) => number;
/**
 * D&D ability abbreviation order
 */
declare const ABIL_ABVS: readonly ["str", "dex", "con", "int", "wis", "cha"];
/**
 * Sort D&D attributes in standard order (STR, DEX, CON, INT, WIS, CHA)
 */
export declare const ascSortAtts: (a: string, b: string) => number;
/**
 * D&D size abbreviation order
 */
declare const SIZE_ABVS: readonly ["F", "D", "T", "S", "M", "L", "H", "G", "C", "V"];
/**
 * Sort D&D sizes in order
 */
export declare const ascSortSize: (a: string, b: string) => number;
/**
 * Sort D&D alignments
 */
export declare const alignmentSort: (a: string, b: string) => number;
/**
 * Item rarity order
 */
declare const ITEM_RARITY_ORDER: readonly ["none", "common", "uncommon", "rare", "very rare", "legendary", "artifact", "varies", "unknown (magic)", "unknown"];
/**
 * Sort item rarities in D&D order
 */
export declare const ascSortItemRarity: (a: string, b: string) => number;
/**
 * Sort monster traits (special equipment first, then alphabetical)
 */
export declare const monTraitSort: <T extends {
    sort?: number;
    name?: string;
}>(a: T, b: T, stripTags?: (str: string) => string) => number;
/**
 * Generic entity sort (name, then source)
 */
export declare const ascSortGenericEntity: <T extends {
    name?: string;
    source?: string;
}>(a: T, b: T) => number;
/**
 * Sort deities (name, source, pantheon)
 */
export declare const ascSortDeity: <T extends {
    name: string;
    source: string;
    pantheon: string;
}>(a: T, b: T) => number;
/**
 * Sort cards (set, source, name)
 */
export declare const ascSortCard: <T extends {
    set: string;
    source: string;
    name: string;
}>(a: T, b: T) => number;
/**
 * Sort encounters (name, caption, level range)
 */
export declare const ascSortEncounter: <T extends {
    name: string;
    caption?: string;
    minlvl?: number;
    maxlvl?: number;
}>(a: T, b: T) => number;
/**
 * Sort adventures (published, parent source, published order, storyline, level, name)
 */
export declare const ascSortAdventure: <T extends {
    published?: string;
    parentSource?: string;
    publishedOrder?: number;
    storyline?: string;
    level?: {
        start?: number;
    };
    name: string;
}>(a: T, b: T) => number;
/**
 * Sort books (published, parent source, name)
 */
export declare const ascSortBook: <T extends {
    published?: string;
    parentSource?: string;
    name: string;
}>(a: T, b: T) => number;
/**
 * Sort book data by ID
 */
export declare const ascSortBookData: <T extends {
    id?: string;
}>(a: T, b: T) => number;
export { ABIL_ABVS, SIZE_ABVS, ITEM_RARITY_ORDER };
//# sourceMappingURL=sort-util.d.ts.map