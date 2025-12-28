import { describe, it, expect } from "vitest";
import { ABIL_ABVS, ATB_ABV_TO_FULL, attAbvToFull, attFullToAbv, attrChooseToFull, getAbilityModNumber, getAbilityModifier, isValidAbilityAbv, isValidAbilityExtended, } from "./attributes.js";
describe("attributes", () => {
    describe("ABIL_ABVS constant", () => {
        it("should contain all six ability abbreviations", () => {
            expect(ABIL_ABVS).toEqual(["str", "dex", "con", "int", "wis", "cha"]);
        });
        it("should be readonly", () => {
            expect(ABIL_ABVS.length).toBe(6);
        });
    });
    describe("ATB_ABV_TO_FULL constant", () => {
        it("should map all ability abbreviations to full names", () => {
            expect(ATB_ABV_TO_FULL.str).toBe("Strength");
            expect(ATB_ABV_TO_FULL.dex).toBe("Dexterity");
            expect(ATB_ABV_TO_FULL.con).toBe("Constitution");
            expect(ATB_ABV_TO_FULL.int).toBe("Intelligence");
            expect(ATB_ABV_TO_FULL.wis).toBe("Wisdom");
            expect(ATB_ABV_TO_FULL.cha).toBe("Charisma");
        });
    });
    describe("attAbvToFull", () => {
        it("should convert lowercase abbreviations to full names", () => {
            expect(attAbvToFull("str")).toBe("Strength");
            expect(attAbvToFull("dex")).toBe("Dexterity");
            expect(attAbvToFull("con")).toBe("Constitution");
            expect(attAbvToFull("int")).toBe("Intelligence");
            expect(attAbvToFull("wis")).toBe("Wisdom");
            expect(attAbvToFull("cha")).toBe("Charisma");
        });
        it("should handle uppercase abbreviations", () => {
            expect(attAbvToFull("STR")).toBe("Strength");
            expect(attAbvToFull("DEX")).toBe("Dexterity");
        });
        it("should handle mixed case abbreviations", () => {
            expect(attAbvToFull("Str")).toBe("Strength");
            expect(attAbvToFull("DeX")).toBe("Dexterity");
        });
        it("should handle whitespace", () => {
            expect(attAbvToFull("  str  ")).toBe("Strength");
            expect(attAbvToFull("\tcon\t")).toBe("Constitution");
        });
        it("should return input for unknown abbreviations", () => {
            expect(attAbvToFull("foo")).toBe("foo");
            expect(attAbvToFull("xyz")).toBe("xyz");
        });
        it("should throw TypeError for null or undefined", () => {
            expect(() => attAbvToFull(null)).toThrow(TypeError);
            expect(() => attAbvToFull(undefined)).toThrow(TypeError);
        });
    });
    describe("attFullToAbv", () => {
        it("should convert full names to abbreviations", () => {
            expect(attFullToAbv("Strength")).toBe("str");
            expect(attFullToAbv("Dexterity")).toBe("dex");
            expect(attFullToAbv("Constitution")).toBe("con");
            expect(attFullToAbv("Intelligence")).toBe("int");
            expect(attFullToAbv("Wisdom")).toBe("wis");
            expect(attFullToAbv("Charisma")).toBe("cha");
        });
        it("should handle whitespace", () => {
            expect(attFullToAbv("  Strength  ")).toBe("str");
        });
        it("should return input for unknown names", () => {
            expect(attFullToAbv("strength")).toBe("strength");
            expect(attFullToAbv("Unknown")).toBe("Unknown");
        });
        it("should throw TypeError for null or undefined", () => {
            expect(() => attFullToAbv(null)).toThrow(TypeError);
            expect(() => attFullToAbv(undefined)).toThrow(TypeError);
        });
    });
    describe("attrChooseToFull", () => {
        it("should format single ability", () => {
            expect(attrChooseToFull(["str"])).toBe("Strength modifier");
            expect(attrChooseToFull(["dex"])).toBe("Dexterity modifier");
        });
        it("should format two abilities with choice", () => {
            expect(attrChooseToFull(["str", "dex"])).toBe("Strength or Dexterity modifier (your choice)");
        });
        it("should format multiple abilities with choice", () => {
            expect(attrChooseToFull(["str", "dex", "con"])).toBe("Strength or Dexterity or Constitution modifier (your choice)");
        });
        it("should handle spellcasting ability", () => {
            expect(attrChooseToFull(["spellcasting"])).toBe("Spellcasting ability modifier");
        });
        it("should handle spellcasting with other abilities", () => {
            expect(attrChooseToFull(["str", "spellcasting"])).toBe("Strength or Spellcasting modifier (your choice)");
        });
        it("should return empty string for empty array", () => {
            expect(attrChooseToFull([])).toBe("");
        });
        it("should return empty string for null/undefined", () => {
            expect(attrChooseToFull(null)).toBe("");
            expect(attrChooseToFull(undefined)).toBe("");
        });
    });
    describe("getAbilityModNumber", () => {
        it("should calculate modifier for score 10 (baseline)", () => {
            expect(getAbilityModNumber(10)).toBe(0);
            expect(getAbilityModNumber(11)).toBe(0);
        });
        it("should calculate positive modifiers", () => {
            expect(getAbilityModNumber(12)).toBe(1);
            expect(getAbilityModNumber(13)).toBe(1);
            expect(getAbilityModNumber(14)).toBe(2);
            expect(getAbilityModNumber(15)).toBe(2);
            expect(getAbilityModNumber(16)).toBe(3);
            expect(getAbilityModNumber(18)).toBe(4);
            expect(getAbilityModNumber(20)).toBe(5);
        });
        it("should calculate negative modifiers", () => {
            expect(getAbilityModNumber(8)).toBe(-1);
            expect(getAbilityModNumber(9)).toBe(-1);
            expect(getAbilityModNumber(6)).toBe(-2);
            expect(getAbilityModNumber(7)).toBe(-2);
            expect(getAbilityModNumber(4)).toBe(-3);
            expect(getAbilityModNumber(1)).toBe(-5);
        });
        it("should handle extreme scores", () => {
            expect(getAbilityModNumber(30)).toBe(10);
            expect(getAbilityModNumber(0)).toBe(-5);
        });
    });
    describe("getAbilityModifier", () => {
        it("should format positive modifiers with plus sign", () => {
            expect(getAbilityModifier(12)).toBe("+1");
            expect(getAbilityModifier(14)).toBe("+2");
            expect(getAbilityModifier(18)).toBe("+4");
            expect(getAbilityModifier(20)).toBe("+5");
        });
        it("should format zero modifier with plus sign", () => {
            expect(getAbilityModifier(10)).toBe("+0");
            expect(getAbilityModifier(11)).toBe("+0");
        });
        it("should format negative modifiers with minus sign", () => {
            expect(getAbilityModifier(8)).toBe("-1");
            expect(getAbilityModifier(6)).toBe("-2");
            expect(getAbilityModifier(4)).toBe("-3");
            expect(getAbilityModifier(1)).toBe("-5");
        });
        it("should handle standard array scores", () => {
            expect(getAbilityModifier(15)).toBe("+2");
            expect(getAbilityModifier(14)).toBe("+2");
            expect(getAbilityModifier(13)).toBe("+1");
            expect(getAbilityModifier(12)).toBe("+1");
            expect(getAbilityModifier(10)).toBe("+0");
            expect(getAbilityModifier(8)).toBe("-1");
        });
    });
    describe("isValidAbilityAbv", () => {
        it("should return true for valid abbreviations", () => {
            expect(isValidAbilityAbv("str")).toBe(true);
            expect(isValidAbilityAbv("dex")).toBe(true);
            expect(isValidAbilityAbv("con")).toBe(true);
            expect(isValidAbilityAbv("int")).toBe(true);
            expect(isValidAbilityAbv("wis")).toBe(true);
            expect(isValidAbilityAbv("cha")).toBe(true);
        });
        it("should return true for uppercase abbreviations", () => {
            expect(isValidAbilityAbv("STR")).toBe(true);
            expect(isValidAbilityAbv("DEX")).toBe(true);
        });
        it("should return false for invalid abbreviations", () => {
            expect(isValidAbilityAbv("foo")).toBe(false);
            expect(isValidAbilityAbv("spellcasting")).toBe(false);
            expect(isValidAbilityAbv("")).toBe(false);
        });
    });
    describe("isValidAbilityExtended", () => {
        it("should return true for standard abilities", () => {
            expect(isValidAbilityExtended("str")).toBe(true);
            expect(isValidAbilityExtended("dex")).toBe(true);
        });
        it("should return true for spellcasting", () => {
            expect(isValidAbilityExtended("spellcasting")).toBe(true);
        });
        it("should return false for invalid values", () => {
            expect(isValidAbilityExtended("foo")).toBe(false);
            expect(isValidAbilityExtended("")).toBe(false);
        });
    });
});
//# sourceMappingURL=attributes.test.js.map