export type AbilityScore = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type AbilityScoreExtended = AbilityScore | "spellcasting";
export declare const ABIL_ABVS: readonly AbilityScore[];
export declare const ATB_ABV_TO_FULL: Record<AbilityScore, string>;
/**
 * Convert ability abbreviation to full name
 * @param abv - Ability abbreviation (str, dex, con, int, wis, cha)
 * @returns Full ability name or input if not found
 */
export declare const attAbvToFull: (abv: string) => string;
/**
 * Convert full ability name to abbreviation
 * @param full - Full ability name (Strength, Dexterity, etc.)
 * @returns Ability abbreviation or input if not found
 */
export declare const attFullToAbv: (full: string) => string;
/**
 * Convert array of ability abbreviations to human-readable choice string
 * @param attList - Array of ability abbreviations
 * @returns Formatted string like "Strength modifier" or "Strength or Dexterity modifier (your choice)"
 */
export declare const attrChooseToFull: (attList: AbilityScoreExtended[]) => string;
/**
 * Calculate D&D 5e ability modifier from score (as number)
 * @param abilityScore - Ability score value (typically 1-30)
 * @returns Modifier as number (e.g., 10 → 0, 18 → 4, 8 → -1)
 */
export declare const getAbilityModNumber: (abilityScore: number) => number;
/**
 * Calculate D&D 5e ability modifier from score (as formatted string)
 * @param abilityScore - Ability score value (typically 1-30)
 * @returns Modifier as string with sign (e.g., "+4", "-1", "+0")
 */
export declare const getAbilityModifier: (abilityScore: number) => string;
/**
 * Check if string is a valid ability abbreviation
 */
export declare const isValidAbilityAbv: (abv: string) => abv is AbilityScore;
/**
 * Check if string is a valid extended ability (includes spellcasting)
 */
export declare const isValidAbilityExtended: (abv: string) => abv is AbilityScoreExtended;
//# sourceMappingURL=attributes.d.ts.map