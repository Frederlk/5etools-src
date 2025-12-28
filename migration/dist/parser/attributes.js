// Attribute Parser - TypeScript implementation
// Migrated from js/parser.js attribute-related methods
// ============ Constants ============
export const ABIL_ABVS = ["str", "dex", "con", "int", "wis", "cha"];
export const ATB_ABV_TO_FULL = {
    str: "Strength",
    dex: "Dexterity",
    con: "Constitution",
    int: "Intelligence",
    wis: "Wisdom",
    cha: "Charisma",
};
const ATB_FULL_TO_ABV = {
    Strength: "str",
    Dexterity: "dex",
    Constitution: "con",
    Intelligence: "int",
    Wisdom: "wis",
    Charisma: "cha",
};
// ============ Core Functions ============
/**
 * Convert ability abbreviation to full name
 * @param abv - Ability abbreviation (str, dex, con, int, wis, cha)
 * @returns Full ability name or input if not found
 */
export const attAbvToFull = (abv) => {
    if (abv == null)
        throw new TypeError("undefined or null object passed to parser");
    const trimmed = abv.trim().toLowerCase();
    return ATB_ABV_TO_FULL[trimmed] ?? abv;
};
/**
 * Convert full ability name to abbreviation
 * @param full - Full ability name (Strength, Dexterity, etc.)
 * @returns Ability abbreviation or input if not found
 */
export const attFullToAbv = (full) => {
    if (full == null)
        throw new TypeError("undefined or null object passed to parser");
    const trimmed = full.trim();
    return ATB_FULL_TO_ABV[trimmed] ?? full;
};
/**
 * Convert array of ability abbreviations to human-readable choice string
 * @param attList - Array of ability abbreviations
 * @returns Formatted string like "Strength modifier" or "Strength or Dexterity modifier (your choice)"
 */
export const attrChooseToFull = (attList) => {
    if (!attList?.length)
        return "";
    if (attList.length === 1) {
        const attr = attList[0];
        const full = attr === "spellcasting" ? "Spellcasting" : attAbvToFull(attr);
        return `${full}${attr === "spellcasting" ? " ability" : ""} modifier`;
    }
    const attsTemp = attList.map(attr => attr === "spellcasting" ? "Spellcasting" : attAbvToFull(attr));
    return `${attsTemp.join(" or ")} modifier (your choice)`;
};
/**
 * Calculate D&D 5e ability modifier from score (as number)
 * @param abilityScore - Ability score value (typically 1-30)
 * @returns Modifier as number (e.g., 10 → 0, 18 → 4, 8 → -1)
 */
export const getAbilityModNumber = (abilityScore) => {
    return Math.floor((abilityScore - 10) / 2);
};
/**
 * Calculate D&D 5e ability modifier from score (as formatted string)
 * @param abilityScore - Ability score value (typically 1-30)
 * @returns Modifier as string with sign (e.g., "+4", "-1", "+0")
 */
export const getAbilityModifier = (abilityScore) => {
    const modifier = getAbilityModNumber(abilityScore);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};
// ============ Validation Helpers ============
/**
 * Check if string is a valid ability abbreviation
 */
export const isValidAbilityAbv = (abv) => {
    return ABIL_ABVS.includes(abv.toLowerCase());
};
/**
 * Check if string is a valid extended ability (includes spellcasting)
 */
export const isValidAbilityExtended = (abv) => {
    return abv === "spellcasting" || isValidAbilityAbv(abv);
};
//# sourceMappingURL=attributes.js.map