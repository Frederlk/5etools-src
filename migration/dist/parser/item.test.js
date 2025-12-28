import { describe, it, expect } from "vitest";
import { COIN_ABVS, COIN_ABV_TO_FULL, COIN_CONVERSIONS, DEFAULT_CURRENCY_CONVERSION_TABLE, FULL_CURRENCY_CONVERSION_TABLE, ATK_TYPE_TO_FULL, ARMOR_ABV_TO_FULL, WEAPON_ABV_TO_FULL, ITM_RARITY_TO_SHORT, ITEM_RECHARGE_TO_FULL, numberToVulgar, numberToFractional, coinAbvToFull, getCurrencyAndMultiplier, doSimplifyCoins, getAsCopper, getDisplayCurrency, itemValueToFull, itemValueToFullMultiCurrency, itemWeightToFull, attackTypeToFull, armorFullToAbv, weaponFullToAbv, itemRarityToShort, itemRechargeToFull, itemMiscTagToFull, coinValueToNumber, weightValueToNumber, } from "./item.js";
describe("item", () => {
    describe("COIN_ABVS constant", () => {
        it("should contain all coin abbreviations in order", () => {
            expect(COIN_ABVS).toEqual(["cp", "sp", "ep", "gp", "pp"]);
        });
    });
    describe("COIN_ABV_TO_FULL constant", () => {
        it("should map coin abbreviations to full names", () => {
            expect(COIN_ABV_TO_FULL.cp).toBe("copper pieces");
            expect(COIN_ABV_TO_FULL.sp).toBe("silver pieces");
            expect(COIN_ABV_TO_FULL.ep).toBe("electrum pieces");
            expect(COIN_ABV_TO_FULL.gp).toBe("gold pieces");
            expect(COIN_ABV_TO_FULL.pp).toBe("platinum pieces");
        });
    });
    describe("COIN_CONVERSIONS constant", () => {
        it("should contain copper equivalents", () => {
            expect(COIN_CONVERSIONS).toEqual([1, 10, 50, 100, 1000]);
        });
    });
    describe("numberToVulgar", () => {
        it("should return number for integers", () => {
            expect(numberToVulgar(5)).toBe(5);
            expect(numberToVulgar(10)).toBe(10);
            expect(numberToVulgar(-3)).toBe(-3);
        });
        it("should convert common fractions to vulgar symbols", () => {
            expect(numberToVulgar(0.5)).toBe("\u00bd");
            expect(numberToVulgar(0.25)).toBe("\u00bc");
            expect(numberToVulgar(0.75)).toBe("\u00be");
            expect(numberToVulgar(0.125)).toBe("\u215b");
        });
        it("should handle fractions with integer part", () => {
            expect(numberToVulgar(1.5)).toBe("1\u00bd");
            expect(numberToVulgar(2.25)).toBe("2\u00bc");
        });
        it("should handle negative fractions", () => {
            expect(numberToVulgar(-0.5)).toBe("-\u00bd");
            expect(numberToVulgar(-1.5)).toBe("-1\u00bd");
        });
        it("should handle thirds", () => {
            const third = 1 / 3;
            expect(numberToVulgar(third)).toBe("\u2153");
            expect(numberToVulgar(2 / 3)).toBe("\u2154");
        });
        it("should handle sixths", () => {
            expect(numberToVulgar(1 / 6)).toBe("\u2159");
            expect(numberToVulgar(5 / 6)).toBe("\u215a");
        });
        it("should fallback to fractional for unknown decimals", () => {
            const result = numberToVulgar(0.7);
            expect(typeof result).toBe("string");
        });
        it("should return null when fallback disabled and no match", () => {
            expect(numberToVulgar(0.123456, { isFallbackOnFractional: false })).toBe(null);
        });
    });
    describe("numberToFractional", () => {
        it("should return string for integers", () => {
            expect(numberToFractional(5)).toBe("5");
            expect(numberToFractional(-3)).toBe("-3");
        });
        it("should format common fractions", () => {
            expect(numberToFractional(0.5)).toBe("1/2");
            expect(numberToFractional(0.25)).toBe("1/4");
            expect(numberToFractional(0.75)).toBe("3/4");
        });
        it("should format fractions with integer part", () => {
            expect(numberToFractional(1.5)).toBe("1 1/2");
            expect(numberToFractional(2.25)).toBe("2 1/4");
        });
        it("should format negative fractions", () => {
            expect(numberToFractional(-0.5)).toBe("-1/2");
            expect(numberToFractional(-1.5)).toBe("-1 1/2");
        });
        it("should handle eighths", () => {
            expect(numberToFractional(0.125)).toBe("1/8");
            expect(numberToFractional(0.375)).toBe("3/8");
            expect(numberToFractional(0.625)).toBe("5/8");
            expect(numberToFractional(0.875)).toBe("7/8");
        });
    });
    describe("coinAbvToFull", () => {
        it("should convert coin abbreviations to full names", () => {
            expect(coinAbvToFull("cp")).toBe("copper pieces");
            expect(coinAbvToFull("sp")).toBe("silver pieces");
            expect(coinAbvToFull("ep")).toBe("electrum pieces");
            expect(coinAbvToFull("gp")).toBe("gold pieces");
            expect(coinAbvToFull("pp")).toBe("platinum pieces");
        });
        it("should throw TypeError for null", () => {
            expect(() => coinAbvToFull(null)).toThrow(TypeError);
        });
    });
    describe("getCurrencyAndMultiplier", () => {
        it("should return fallback for null/undefined value", () => {
            const result = getCurrencyAndMultiplier(null);
            expect(result.coin).toBe("gp");
            expect(result.isFallback).toBe(true);
        });
        it("should return appropriate currency for integer values", () => {
            expect(getCurrencyAndMultiplier(100).coin).toBe("gp");
            expect(getCurrencyAndMultiplier(10).coin).toBe("sp");
            expect(getCurrencyAndMultiplier(1).coin).toBe("cp");
        });
        it("should handle fractional copper values", () => {
            const result = getCurrencyAndMultiplier(0.5);
            expect(result.coin).toBe("cp");
        });
    });
    describe("doSimplifyCoins", () => {
        it("should simplify copper to silver", () => {
            const result = doSimplifyCoins({ cp: 100 });
            expect(result.gp).toBe(1);
            expect(result.cp).toBeUndefined();
            expect(result.sp).toBeUndefined();
        });
        it("should simplify copper to gold", () => {
            const result = doSimplifyCoins({ cp: 1000 });
            expect(result.gp).toBe(10);
        });
        it("should handle mixed currencies", () => {
            const result = doSimplifyCoins({ cp: 50, sp: 5 });
            expect(result.gp).toBe(1);
            expect(result.cp).toBeUndefined();
            expect(result.sp).toBeUndefined();
        });
        it("should preserve remainders", () => {
            const result = doSimplifyCoins({ cp: 15 });
            expect(result.sp).toBe(1);
            expect(result.cp).toBe(5);
        });
        it("should remove zero values", () => {
            const result = doSimplifyCoins({ cp: 0, sp: 10 });
            expect(result.cp).toBeUndefined();
            expect(result.gp).toBe(1);
        });
    });
    describe("getAsCopper", () => {
        it("should convert single currencies to copper", () => {
            expect(getAsCopper({ cp: 10 })).toBe(10);
            expect(getAsCopper({ sp: 1 })).toBe(10);
            expect(getAsCopper({ gp: 1 })).toBe(100);
            expect(getAsCopper({ pp: 1 })).toBe(1000);
        });
        it("should sum mixed currencies", () => {
            expect(getAsCopper({ cp: 5, sp: 2, gp: 1 })).toBe(5 + 20 + 100);
        });
        it("should handle electrum", () => {
            expect(getAsCopper({ ep: 1 })).toBe(50);
        });
        it("should return 0 for empty object", () => {
            expect(getAsCopper({})).toBe(0);
        });
    });
    describe("getDisplayCurrency", () => {
        it("should display single currency", () => {
            expect(getDisplayCurrency({ gp: 100 })).toBe("100 GP");
        });
        it("should display multiple currencies", () => {
            const result = getDisplayCurrency({ gp: 10, sp: 5 });
            expect(result).toContain("10 GP");
            expect(result).toContain("5 SP");
        });
        it("should use classic style lowercase", () => {
            expect(getDisplayCurrency({ gp: 100 }, { styleHint: "classic" })).toBe("100 gp");
        });
        it("should display zeros when isDisplayEmpty is true", () => {
            expect(getDisplayCurrency({ gp: 0 }, { isDisplayEmpty: true })).toBe("0 GP");
        });
        it("should hide zeros by default", () => {
            expect(getDisplayCurrency({ gp: 0, sp: 5 })).toBe("5 SP");
        });
        it("should order from highest to lowest", () => {
            const result = getDisplayCurrency({ cp: 1, sp: 2, gp: 3 });
            expect(result.indexOf("GP")).toBeLessThan(result.indexOf("SP"));
            expect(result.indexOf("SP")).toBeLessThan(result.indexOf("CP"));
        });
    });
    describe("itemValueToFull", () => {
        it("should format copper value", () => {
            expect(itemValueToFull({ value: 5 })).toBe("5 cp");
        });
        it("should format silver value", () => {
            expect(itemValueToFull({ value: 50 })).toBe("5 sp");
        });
        it("should format gold value", () => {
            expect(itemValueToFull({ value: 100 })).toBe("1 gp");
            expect(itemValueToFull({ value: 10000 })).toBe("100 gp");
        });
        it("should format with multiplier", () => {
            expect(itemValueToFull({ valueMult: 2 })).toBe("base value \u00d72");
        });
        it("should format with short form multiplier", () => {
            expect(itemValueToFull({ valueMult: 2 }, { isShortForm: true })).toBe("\u00d72");
        });
        it("should return empty string for no value", () => {
            expect(itemValueToFull({})).toBe("");
        });
    });
    describe("itemValueToFullMultiCurrency", () => {
        it("should format simple gold value", () => {
            expect(itemValueToFullMultiCurrency({ value: 100 })).toBe("1 GP");
        });
        it("should format zero value", () => {
            expect(itemValueToFullMultiCurrency({ value: 0 })).toBe("0 GP");
        });
        it("should use classic style", () => {
            expect(itemValueToFullMultiCurrency({ value: 100 }, { styleHint: "classic" })).toBe("1 gp");
        });
        it("should apply multiplier", () => {
            expect(itemValueToFullMultiCurrency({ value: 100 }, { multiplier: 2 })).toBe("2 GP");
        });
        it("should format with valueMult", () => {
            expect(itemValueToFullMultiCurrency({ valueMult: 3 })).toBe("base value \u00d73");
        });
    });
    describe("itemWeightToFull", () => {
        it("should format integer weight", () => {
            expect(itemWeightToFull({ weight: 5 })).toBe("5 lb.");
            expect(itemWeightToFull({ weight: 1 })).toBe("1 lb.");
        });
        it("should format fractional weight with vulgar fraction", () => {
            expect(itemWeightToFull({ weight: 0.5 })).toBe("\u00bd lb.");
            expect(itemWeightToFull({ weight: 0.25 })).toBe("\u00bc lb.");
        });
        it("should format weight with integer and fraction", () => {
            expect(itemWeightToFull({ weight: 1.5 })).toBe("1\u00bd lb.");
        });
        it("should format small weights in ounces", () => {
            const result = itemWeightToFull({ weight: 0.0625 });
            expect(result).toContain("oz.");
        });
        it("should format weight with note", () => {
            expect(itemWeightToFull({ weight: 10, weightNote: "(per 100)" })).toBe("10 lb. (per 100)");
        });
        it("should format with weight multiplier", () => {
            expect(itemWeightToFull({ weightMult: 2 })).toBe("base weight \u00d72");
        });
        it("should format with short form multiplier", () => {
            expect(itemWeightToFull({ weightMult: 2 }, true)).toBe("\u00d72");
        });
        it("should return empty string for no weight", () => {
            expect(itemWeightToFull({})).toBe("");
        });
    });
    describe("attackTypeToFull", () => {
        it("should convert attack type abbreviations", () => {
            expect(attackTypeToFull("MW")).toBe("Melee Weapon Attack");
            expect(attackTypeToFull("RW")).toBe("Ranged Weapon Attack");
        });
        it("should return input for unknown types", () => {
            expect(attackTypeToFull("XX")).toBe("XX");
        });
        it("should throw TypeError for null", () => {
            expect(() => attackTypeToFull(null)).toThrow(TypeError);
        });
    });
    describe("armorFullToAbv", () => {
        it("should convert full armor types to abbreviations", () => {
            expect(armorFullToAbv("light")).toBe("l.");
            expect(armorFullToAbv("medium")).toBe("m.");
            expect(armorFullToAbv("heavy")).toBe("h.");
            expect(armorFullToAbv("shield")).toBe("s.");
        });
        it("should return input for unknown types", () => {
            expect(armorFullToAbv("unknown")).toBe("unknown");
        });
    });
    describe("weaponFullToAbv", () => {
        it("should convert full weapon types to abbreviations", () => {
            expect(weaponFullToAbv("simple")).toBe("s.");
            expect(weaponFullToAbv("martial")).toBe("m.");
        });
    });
    describe("itemRarityToShort", () => {
        it("should convert rarity to short form", () => {
            expect(itemRarityToShort("common")).toBe("Com.");
            expect(itemRarityToShort("uncommon")).toBe("Unc.");
            expect(itemRarityToShort("rare")).toBe("Rare");
            expect(itemRarityToShort("very rare")).toBe("V.Rare");
            expect(itemRarityToShort("legendary")).toBe("Leg.");
            expect(itemRarityToShort("artifact")).toBe("Art.");
            expect(itemRarityToShort("varies")).toBe("Var.");
        });
        it("should handle null/undefined", () => {
            expect(itemRarityToShort(null)).toBe("");
            expect(itemRarityToShort(undefined)).toBe("");
        });
        it("should handle short unknown rarities", () => {
            expect(itemRarityToShort("epic")).toBe("Epic");
        });
        it("should abbreviate long unknown rarities", () => {
            expect(itemRarityToShort("unique")).toBe("Uni.");
        });
    });
    describe("itemRechargeToFull", () => {
        it("should convert recharge abbreviations", () => {
            expect(itemRechargeToFull("dawn")).toBe("Dawn");
            expect(itemRechargeToFull("dusk")).toBe("Dusk");
            expect(itemRechargeToFull("restShort")).toBe("Short Rest");
            expect(itemRechargeToFull("restLong")).toBe("Long Rest");
            expect(itemRechargeToFull("round")).toBe("Every Round");
        });
    });
    describe("itemMiscTagToFull", () => {
        it("should convert misc tags", () => {
            expect(itemMiscTagToFull("CF/W")).toBe("Creates Food/Water");
            expect(itemMiscTagToFull("CNS")).toBe("Consumable");
            expect(itemMiscTagToFull("TT")).toBe("Trinket Table");
        });
    });
    describe("coinValueToNumber", () => {
        it("should parse copper values", () => {
            expect(coinValueToNumber("10cp")).toBe(10);
            expect(coinValueToNumber("10 cp")).toBe(10);
        });
        it("should parse silver values", () => {
            expect(coinValueToNumber("5sp")).toBe(50);
            expect(coinValueToNumber("5 sp")).toBe(50);
        });
        it("should parse gold values", () => {
            expect(coinValueToNumber("100gp")).toBe(10000);
            expect(coinValueToNumber("100 gp")).toBe(10000);
        });
        it("should parse platinum values", () => {
            expect(coinValueToNumber("1pp")).toBe(1000);
        });
        it("should parse electrum values", () => {
            expect(coinValueToNumber("2ep")).toBe(100);
        });
        it("should return 0 for null/undefined", () => {
            expect(coinValueToNumber(null)).toBe(0);
            expect(coinValueToNumber(undefined)).toBe(0);
        });
        it("should return 0 for Varies", () => {
            expect(coinValueToNumber("Varies")).toBe(0);
        });
        it("should handle comma-separated numbers", () => {
            expect(coinValueToNumber("1,000gp")).toBe(100000);
        });
        it("should throw for badly formatted values", () => {
            expect(() => coinValueToNumber("invalid")).toThrow("Badly formatted value");
        });
        it("should throw for unknown coin type", () => {
            expect(() => coinValueToNumber("10xx")).toThrow("Unknown coin type");
        });
    });
    describe("weightValueToNumber", () => {
        it("should parse numeric strings", () => {
            expect(weightValueToNumber("10")).toBe(10);
            expect(weightValueToNumber("3.5")).toBe(3.5);
        });
        it("should pass through numbers", () => {
            expect(weightValueToNumber(5)).toBe(5);
            expect(weightValueToNumber(0.25)).toBe(0.25);
        });
        it("should return 0 for null/undefined", () => {
            expect(weightValueToNumber(null)).toBe(0);
            expect(weightValueToNumber(undefined)).toBe(0);
        });
        it("should throw for non-numeric strings", () => {
            expect(() => weightValueToNumber("heavy")).toThrow("Badly formatted value");
        });
    });
    describe("ATK_TYPE_TO_FULL constant", () => {
        it("should contain attack type mappings", () => {
            expect(ATK_TYPE_TO_FULL.MW).toBe("Melee Weapon Attack");
            expect(ATK_TYPE_TO_FULL.RW).toBe("Ranged Weapon Attack");
        });
    });
    describe("ARMOR_ABV_TO_FULL constant", () => {
        it("should contain armor type mappings", () => {
            expect(ARMOR_ABV_TO_FULL["l."]).toBe("light");
            expect(ARMOR_ABV_TO_FULL["m."]).toBe("medium");
            expect(ARMOR_ABV_TO_FULL["h."]).toBe("heavy");
            expect(ARMOR_ABV_TO_FULL["s."]).toBe("shield");
        });
    });
    describe("WEAPON_ABV_TO_FULL constant", () => {
        it("should contain weapon type mappings", () => {
            expect(WEAPON_ABV_TO_FULL["s."]).toBe("simple");
            expect(WEAPON_ABV_TO_FULL["m."]).toBe("martial");
        });
    });
    describe("ITM_RARITY_TO_SHORT constant", () => {
        it("should contain rarity mappings", () => {
            expect(ITM_RARITY_TO_SHORT.common).toBe("Com.");
            expect(ITM_RARITY_TO_SHORT.legendary).toBe("Leg.");
        });
    });
    describe("ITEM_RECHARGE_TO_FULL constant", () => {
        it("should contain recharge mappings", () => {
            expect(ITEM_RECHARGE_TO_FULL.dawn).toBe("Dawn");
            expect(ITEM_RECHARGE_TO_FULL.restLong).toBe("Long Rest");
        });
    });
    describe("DEFAULT_CURRENCY_CONVERSION_TABLE constant", () => {
        it("should contain cp, sp, gp conversions", () => {
            expect(DEFAULT_CURRENCY_CONVERSION_TABLE.length).toBe(3);
            expect(DEFAULT_CURRENCY_CONVERSION_TABLE[0].coin).toBe("cp");
            expect(DEFAULT_CURRENCY_CONVERSION_TABLE[1].coin).toBe("sp");
            expect(DEFAULT_CURRENCY_CONVERSION_TABLE[2].coin).toBe("gp");
        });
    });
    describe("FULL_CURRENCY_CONVERSION_TABLE constant", () => {
        it("should contain all coin conversions", () => {
            expect(FULL_CURRENCY_CONVERSION_TABLE.length).toBe(5);
            const coins = FULL_CURRENCY_CONVERSION_TABLE.map(c => c.coin);
            expect(coins).toContain("cp");
            expect(coins).toContain("sp");
            expect(coins).toContain("ep");
            expect(coins).toContain("gp");
            expect(coins).toContain("pp");
        });
    });
});
//# sourceMappingURL=item.test.js.map