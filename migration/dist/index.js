// 5etools Renderer Markdown - TypeScript Migration
// Entry point - re-exports all migrated modules
// Note: Some types/constants have name conflicts across modules
// Import from specific modules (./util, ./renderer, ./parser) for full control
// Utilities (use ./util for granular imports)
export * from "./util/index.js";
// Renderer types (StyleHint is also in parser modules)
export * from "./renderer/index.js";
// Parser functions - explicit exports to avoid conflicts
// ABIL_ABVS conflict: attributes.ts and sort-util.ts both export this
// StyleHint conflict: renderer and parser modules both export this
export { attAbvToFull, attFullToAbv, attrChooseToFull, getAbilityModNumber, getAbilityModifier, isValidAbilityAbv, isValidAbilityExtended, ATB_ABV_TO_FULL, 
// Re-export ABIL_ABVS from attributes as the canonical one for parser
ABIL_ABVS as PARSER_ABIL_ABVS, SPEED_MODES, SIZE_ABV_TO_FULL, MON_TYPE_TO_PLURAL, ALIGNMENT_ABV_TO_FULL, DMG_TYPES, sizeAbvToFull, monTypeToPlural, monTypeToFullObj, acToFull, getSpeedString, getFullImmRes, getFullCondImm, alignmentAbvToFull, alignmentListToFull, SP_SCHOOL_ABV_TO_FULL, SP_SCHOOL_ABV_TO_SHORT, SP_TM_ACTION, SP_TM_B_ACTION, SP_TM_REACTION, SP_TM_ROUND, SP_TM_MINS, SP_TM_HRS, SP_TM_SPECIAL, SP_TIME_SINGLETONS, SP_TIME_TO_FULL, SP_TIME_TO_ABV, RNG_SPECIAL, RNG_POINT, RNG_LINE, RNG_CUBE, RNG_CONE, RNG_EMANATION, RNG_RADIUS, RNG_SPHERE, RNG_HEMISPHERE, RNG_CYLINDER, RNG_SELF, RNG_SIGHT, RNG_UNLIMITED, RNG_UNLIMITED_SAME_PLANE, RNG_TOUCH, UNT_INCHES, UNT_FEET, UNT_YARDS, UNT_MILES, SP_RANGE_TYPE_TO_FULL, SP_END_TYPE_TO_FULL, DURATION_TYPES, DURATION_AMOUNT_TYPES, getOrdinalForm, spLevelToFull, spSchoolAbvToFull, spSchoolAbvToShort, spRangeTypeToFull, spEndTypeToFull, getSingletonUnit, spMetaToArr, spLevelSchoolMetaToFull, getTimeToFull, spTimeListToFull, spRangeToFull, spComponentsToFull, spDurationToFull, COIN_ABVS, COIN_ABV_TO_FULL, COIN_CONVERSIONS, DEFAULT_CURRENCY_CONVERSION_TABLE, FULL_CURRENCY_CONVERSION_TABLE, ATK_TYPE_TO_FULL, ARMOR_ABV_TO_FULL, WEAPON_ABV_TO_FULL, ITM_RARITY_TO_SHORT, ITEM_RECHARGE_TO_FULL, ITEM_MISC_TAG_TO_FULL, numberToVulgar, numberToFractional, coinAbvToFull, getCurrencyConversionTable, getCurrencyAndMultiplier, doSimplifyCoins, getAsCopper, getDisplayCurrency, itemValueToFull, itemValueToFullMultiCurrency, spellComponentCostToFull, vehicleCostToFull, itemVehicleCostsToFull, itemWeightToFull, attackTypeToFull, armorFullToAbv, weaponFullToAbv, itemRarityToShort, itemRechargeToFull, itemMiscTagToFull, coinValueToNumber, weightValueToNumber, } from "./parser/index.js";
//# sourceMappingURL=index.js.map