import { describe, it, expect } from "vitest";
import { SP_SCHOOL_ABV_TO_FULL, SP_SCHOOL_ABV_TO_SHORT, SP_TIME_TO_FULL, SP_END_TYPE_TO_FULL, getOrdinalForm, spLevelToFull, spSchoolAbvToFull, spSchoolAbvToShort, spRangeTypeToFull, spEndTypeToFull, getSingletonUnit, spMetaToArr, spLevelSchoolMetaToFull, getTimeToFull, spTimeListToFull, spRangeToFull, spComponentsToFull, spDurationToFull, } from "./spell.js";
describe("spell", () => {
    describe("SP_SCHOOL_ABV_TO_FULL constant", () => {
        it("should contain all spell school abbreviations", () => {
            expect(SP_SCHOOL_ABV_TO_FULL.A).toBe("Abjuration");
            expect(SP_SCHOOL_ABV_TO_FULL.V).toBe("Evocation");
            expect(SP_SCHOOL_ABV_TO_FULL.E).toBe("Enchantment");
            expect(SP_SCHOOL_ABV_TO_FULL.I).toBe("Illusion");
            expect(SP_SCHOOL_ABV_TO_FULL.D).toBe("Divination");
            expect(SP_SCHOOL_ABV_TO_FULL.N).toBe("Necromancy");
            expect(SP_SCHOOL_ABV_TO_FULL.T).toBe("Transmutation");
            expect(SP_SCHOOL_ABV_TO_FULL.C).toBe("Conjuration");
            expect(SP_SCHOOL_ABV_TO_FULL.P).toBe("Psionic");
        });
    });
    describe("SP_SCHOOL_ABV_TO_SHORT constant", () => {
        it("should contain shortened school names", () => {
            expect(SP_SCHOOL_ABV_TO_SHORT.A).toBe("Abj.");
            expect(SP_SCHOOL_ABV_TO_SHORT.V).toBe("Evoc.");
            expect(SP_SCHOOL_ABV_TO_SHORT.N).toBe("Necro.");
        });
    });
    describe("getOrdinalForm", () => {
        it("should return 1st for 1", () => {
            expect(getOrdinalForm(1)).toBe("1st");
        });
        it("should return 2nd for 2", () => {
            expect(getOrdinalForm(2)).toBe("2nd");
        });
        it("should return 3rd for 3", () => {
            expect(getOrdinalForm(3)).toBe("3rd");
        });
        it("should return 4th-9th with th suffix", () => {
            expect(getOrdinalForm(4)).toBe("4th");
            expect(getOrdinalForm(5)).toBe("5th");
            expect(getOrdinalForm(6)).toBe("6th");
            expect(getOrdinalForm(7)).toBe("7th");
            expect(getOrdinalForm(8)).toBe("8th");
            expect(getOrdinalForm(9)).toBe("9th");
        });
        it("should handle teens correctly", () => {
            expect(getOrdinalForm(11)).toBe("11th");
            expect(getOrdinalForm(12)).toBe("12th");
            expect(getOrdinalForm(13)).toBe("13th");
        });
        it("should handle larger numbers", () => {
            expect(getOrdinalForm(21)).toBe("21st");
            expect(getOrdinalForm(22)).toBe("22nd");
            expect(getOrdinalForm(23)).toBe("23rd");
            expect(getOrdinalForm(100)).toBe("100th");
        });
        it("should handle string input", () => {
            expect(getOrdinalForm("5")).toBe("5th");
        });
        it("should return empty string for invalid input", () => {
            expect(getOrdinalForm("abc")).toBe("");
        });
    });
    describe("spLevelToFull", () => {
        it("should return Cantrip for level 0", () => {
            expect(spLevelToFull(0)).toBe("Cantrip");
        });
        it("should return ordinal for levels 1-9", () => {
            expect(spLevelToFull(1)).toBe("1st");
            expect(spLevelToFull(2)).toBe("2nd");
            expect(spLevelToFull(3)).toBe("3rd");
            expect(spLevelToFull(4)).toBe("4th");
            expect(spLevelToFull(5)).toBe("5th");
            expect(spLevelToFull(6)).toBe("6th");
            expect(spLevelToFull(7)).toBe("7th");
            expect(spLevelToFull(8)).toBe("8th");
            expect(spLevelToFull(9)).toBe("9th");
        });
    });
    describe("spSchoolAbvToFull", () => {
        it("should convert school abbreviations to full names", () => {
            expect(spSchoolAbvToFull("A")).toBe("Abjuration");
            expect(spSchoolAbvToFull("V")).toBe("Evocation");
            expect(spSchoolAbvToFull("E")).toBe("Enchantment");
            expect(spSchoolAbvToFull("I")).toBe("Illusion");
            expect(spSchoolAbvToFull("D")).toBe("Divination");
            expect(spSchoolAbvToFull("N")).toBe("Necromancy");
            expect(spSchoolAbvToFull("T")).toBe("Transmutation");
            expect(spSchoolAbvToFull("C")).toBe("Conjuration");
        });
        it("should return input for unknown abbreviation", () => {
            expect(spSchoolAbvToFull("X")).toBe("X");
            expect(spSchoolAbvToFull("unknown")).toBe("unknown");
        });
    });
    describe("spSchoolAbvToShort", () => {
        it("should convert to shortened school names", () => {
            expect(spSchoolAbvToShort("A")).toBe("Abj.");
            expect(spSchoolAbvToShort("V")).toBe("Evoc.");
            expect(spSchoolAbvToShort("N")).toBe("Necro.");
        });
    });
    describe("spRangeTypeToFull", () => {
        it("should convert range types to full names", () => {
            expect(spRangeTypeToFull("special")).toBe("Special");
            expect(spRangeTypeToFull("point")).toBe("Point");
            expect(spRangeTypeToFull("line")).toBe("Line");
            expect(spRangeTypeToFull("cone")).toBe("Cone");
            expect(spRangeTypeToFull("sphere")).toBe("Sphere");
            expect(spRangeTypeToFull("self")).toBe("Self");
            expect(spRangeTypeToFull("touch")).toBe("Touch");
        });
    });
    describe("spEndTypeToFull", () => {
        it("should convert end types to full names", () => {
            expect(spEndTypeToFull("dispel")).toBe("dispelled");
            expect(spEndTypeToFull("trigger")).toBe("triggered");
            expect(spEndTypeToFull("discharge")).toBe("discharged");
        });
    });
    describe("getSingletonUnit", () => {
        it("should return singular unit names", () => {
            expect(getSingletonUnit("feet")).toBe("foot");
            expect(getSingletonUnit("miles")).toBe("mile");
            expect(getSingletonUnit("inches")).toBe("inch");
            expect(getSingletonUnit("yards")).toBe("yard");
        });
        it("should return short form when requested", () => {
            expect(getSingletonUnit("feet", true)).toBe("ft.");
            expect(getSingletonUnit("miles", true)).toBe("mi.");
            expect(getSingletonUnit("inches", true)).toBe("in.");
            expect(getSingletonUnit("yards", true)).toBe("yd.");
        });
        it("should strip trailing s from unknown units", () => {
            expect(getSingletonUnit("rounds")).toBe("round");
            expect(getSingletonUnit("minutes")).toBe("minute");
        });
        it("should return empty for empty input", () => {
            expect(getSingletonUnit("")).toBe("");
        });
    });
    describe("spMetaToArr", () => {
        it("should return empty array for undefined", () => {
            expect(spMetaToArr(undefined)).toEqual([]);
        });
        it("should return array of truthy meta keys", () => {
            expect(spMetaToArr({ ritual: true, concentration: true })).toEqual(["Concentration", "Ritual"]);
        });
        it("should filter out falsy values", () => {
            expect(spMetaToArr({ ritual: true, concentration: false })).toEqual(["Ritual"]);
        });
        it("should use lowercase for classic style", () => {
            expect(spMetaToArr({ ritual: true }, { styleHint: "classic" })).toEqual(["ritual"]);
        });
    });
    describe("spLevelSchoolMetaToFull", () => {
        it("should format cantrip", () => {
            expect(spLevelSchoolMetaToFull(0, "V")).toBe("Evocation Cantrip");
        });
        it("should format leveled spells", () => {
            expect(spLevelSchoolMetaToFull(1, "A")).toBe("Level 1 Abjuration");
            expect(spLevelSchoolMetaToFull(3, "N")).toBe("Level 3 Necromancy");
            expect(spLevelSchoolMetaToFull(9, "C")).toBe("Level 9 Conjuration");
        });
        it("should format with classic style", () => {
            expect(spLevelSchoolMetaToFull(0, "V", undefined, undefined, { styleHint: "classic" })).toBe("Evocation cantrip");
            expect(spLevelSchoolMetaToFull(1, "A", undefined, undefined, { styleHint: "classic" })).toBe("1st-level abjuration");
            expect(spLevelSchoolMetaToFull(3, "N", undefined, undefined, { styleHint: "classic" })).toBe("3rd-level necromancy");
        });
        it("should include ritual meta for classic style", () => {
            const result = spLevelSchoolMetaToFull(1, "A", { ritual: true }, undefined, { styleHint: "classic" });
            expect(result).toContain("ritual");
        });
        it("should include concentration meta for classic style", () => {
            const result = spLevelSchoolMetaToFull(1, "A", { concentration: true }, undefined, { styleHint: "classic" });
            expect(result).toContain("concentration");
        });
        it("should filter ritual from non-classic meta", () => {
            const result = spLevelSchoolMetaToFull(1, "A", { ritual: true, concentration: true });
            expect(result).toContain("Concentration");
            expect(result).not.toContain("Ritual");
        });
        it("should include subschools", () => {
            const result = spLevelSchoolMetaToFull(1, "A", undefined, ["P"]);
            expect(result).toContain("Psionic");
        });
    });
    describe("getTimeToFull", () => {
        it("should format action", () => {
            expect(getTimeToFull({ number: 1, unit: "action" })).toBe("Action");
        });
        it("should format bonus action", () => {
            expect(getTimeToFull({ number: 1, unit: "bonus" })).toBe("Bonus action");
        });
        it("should format reaction", () => {
            expect(getTimeToFull({ number: 1, unit: "reaction" })).toBe("Reaction");
        });
        it("should format minutes", () => {
            expect(getTimeToFull({ number: 1, unit: "minute" })).toBe("1 minute");
            expect(getTimeToFull({ number: 10, unit: "minute" })).toBe("10 minutes");
        });
        it("should format hours", () => {
            expect(getTimeToFull({ number: 1, unit: "hour" })).toBe("1 hour");
            expect(getTimeToFull({ number: 8, unit: "hour" })).toBe("8 hours");
        });
        it("should use classic style", () => {
            expect(getTimeToFull({ number: 1, unit: "action" }, { styleHint: "classic" })).toBe("1 action");
            expect(getTimeToFull({ number: 1, unit: "bonus" }, { styleHint: "classic" })).toBe("1 bonus action");
        });
    });
    describe("spTimeListToFull", () => {
        it("should format single time", () => {
            expect(spTimeListToFull([{ number: 1, unit: "action" }])).toBe("Action");
        });
        it("should format multiple times", () => {
            const result = spTimeListToFull([
                { number: 1, unit: "action" },
                { number: 1, unit: "reaction" },
            ]);
            expect(result).toContain("Action");
            expect(result).toContain("Reaction");
        });
        it("should include ritual when meta has it", () => {
            const result = spTimeListToFull([{ number: 1, unit: "action" }], { ritual: true });
            expect(result).toContain("Ritual");
        });
        it("should not include ritual for classic style", () => {
            const result = spTimeListToFull([{ number: 1, unit: "action" }], { ritual: true }, { styleHint: "classic" });
            expect(result).not.toContain("Ritual");
        });
        it("should include condition text", () => {
            const result = spTimeListToFull([{ number: 1, unit: "reaction", condition: "when hit" }]);
            expect(result).toContain("when hit");
        });
        it("should include note text", () => {
            const result = spTimeListToFull([{ number: 1, unit: "action", note: "only on your turn" }]);
            expect(result).toContain("only on your turn");
        });
    });
    describe("spRangeToFull", () => {
        it("should format special range", () => {
            expect(spRangeToFull({ type: "special", distance: { type: "special" } })).toBe("Special");
        });
        it("should format self range", () => {
            expect(spRangeToFull({ type: "point", distance: { type: "self" } })).toBe("Self");
        });
        it("should format touch range", () => {
            expect(spRangeToFull({ type: "point", distance: { type: "touch" } })).toBe("Touch");
        });
        it("should format sight range", () => {
            expect(spRangeToFull({ type: "point", distance: { type: "sight" } })).toBe("Sight");
        });
        it("should format unlimited range", () => {
            expect(spRangeToFull({ type: "point", distance: { type: "unlimited" } })).toBe("Unlimited");
        });
        it("should format feet range", () => {
            expect(spRangeToFull({ type: "point", distance: { type: "feet", amount: 60 } })).toBe("60 feet");
            expect(spRangeToFull({ type: "point", distance: { type: "feet", amount: 1 } })).toBe("1 foot");
        });
        it("should format miles range", () => {
            expect(spRangeToFull({ type: "point", distance: { type: "miles", amount: 1 } })).toBe("1 mile");
            expect(spRangeToFull({ type: "point", distance: { type: "miles", amount: 500 } })).toBe("500 miles");
        });
        it("should format cone area", () => {
            const result = spRangeToFull({ type: "cone", distance: { type: "feet", amount: 15 } }, { styleHint: "classic", isDisplaySelfArea: true });
            expect(result).toContain("Self");
            expect(result).toContain("15");
            expect(result).toContain("cone");
        });
        it("should format sphere area", () => {
            const result = spRangeToFull({ type: "sphere", distance: { type: "feet", amount: 20 } }, { styleHint: "classic", isDisplaySelfArea: true });
            expect(result).toContain("Self");
            expect(result).toContain("20");
            expect(result).toContain("radius");
        });
        it("should format line area", () => {
            const result = spRangeToFull({ type: "line", distance: { type: "feet", amount: 30 } }, { styleHint: "classic", isDisplaySelfArea: true });
            expect(result).toContain("Self");
            expect(result).toContain("30");
            expect(result).toContain("line");
        });
        it("should format cube area", () => {
            const result = spRangeToFull({ type: "cube", distance: { type: "feet", amount: 10 } }, { styleHint: "classic", isDisplaySelfArea: true });
            expect(result).toContain("Self");
            expect(result).toContain("10");
            expect(result).toContain("cube");
        });
        it("should format cylinder with height", () => {
            const result = spRangeToFull({
                type: "cylinder",
                distance: { type: "feet", amount: 10, amountSecondary: 40, typeSecondary: "feet" },
            }, { styleHint: "classic", isDisplaySelfArea: true });
            expect(result).toContain("Self");
            expect(result).toContain("10");
            expect(result).toContain("40");
            expect(result).toContain("cylinder");
        });
        it("should return Self for area without classic style hint", () => {
            expect(spRangeToFull({ type: "cone", distance: { type: "feet", amount: 15 } })).toBe("Self");
        });
    });
    describe("spComponentsToFull", () => {
        it("should return None for undefined", () => {
            expect(spComponentsToFull(undefined, 1)).toBe("None");
        });
        it("should return None for empty components", () => {
            expect(spComponentsToFull({}, 1)).toBe("None");
        });
        it("should format verbal only", () => {
            expect(spComponentsToFull({ v: true }, 1)).toBe("V");
        });
        it("should format somatic only", () => {
            expect(spComponentsToFull({ s: true }, 1)).toBe("S");
        });
        it("should format V, S", () => {
            expect(spComponentsToFull({ v: true, s: true }, 1)).toBe("V, S");
        });
        it("should format V, S, M", () => {
            expect(spComponentsToFull({ v: true, s: true, m: true }, 1)).toBe("V, S, M");
        });
        it("should format material with text", () => {
            expect(spComponentsToFull({ v: true, s: true, m: "a bit of fleece" }, 1)).toBe("V, S, M (a bit of fleece)");
        });
        it("should format material with object text", () => {
            expect(spComponentsToFull({ v: true, s: true, m: { text: "a gem worth 100 gp" } }, 1)).toBe("V, S, M (a gem worth 100 gp)");
        });
        it("should format royalty component", () => {
            expect(spComponentsToFull({ v: true, r: true }, 5)).toBe("V, R (5 gp)");
        });
        it("should apply renderFn to material text", () => {
            const renderFn = (s) => `[${s}]`;
            expect(spComponentsToFull({ m: "holy water" }, 1, {}, (s) => s, renderFn)).toBe("M ([holy water])");
        });
        it("should strip tags when isPlainText is true", () => {
            const stripTags = (s) => s.replace(/{@\w+ ([^}]+)}/g, "$1");
            expect(spComponentsToFull({ m: "{@item diamond}" }, 1, { isPlainText: true }, stripTags)).toBe("M (diamond)");
        });
    });
    describe("spDurationToFull", () => {
        it("should format instantaneous", () => {
            expect(spDurationToFull([{ type: "instant" }])).toBe("Instantaneous");
        });
        it("should format special", () => {
            expect(spDurationToFull([{ type: "special" }])).toBe("Special");
        });
        it("should format concentration special", () => {
            const result = spDurationToFull([{ type: "special", concentration: true }]);
            expect(result).toContain("Concentration");
        });
        it("should format concentration special with classic style", () => {
            expect(spDurationToFull([{ type: "special", concentration: true }], { styleHint: "classic" })).toBe("Concentration");
        });
        it("should format timed duration", () => {
            expect(spDurationToFull([{ type: "timed", duration: { amount: 1, type: "hour" } }])).toBe("1 hour");
            expect(spDurationToFull([{ type: "timed", duration: { amount: 8, type: "hour" } }])).toBe("8 hours");
        });
        it("should format timed with up to", () => {
            expect(spDurationToFull([{ type: "timed", duration: { amount: 1, type: "minute", upTo: true } }])).toBe("Up to 1 minute");
        });
        it("should format concentration timed", () => {
            const result = spDurationToFull([{ type: "timed", concentration: true, duration: { amount: 1, type: "hour" } }]);
            expect(result).toContain("Concentration");
            expect(result).toContain("up to 1 hour");
        });
        it("should format permanent until dispelled", () => {
            expect(spDurationToFull([{ type: "permanent", ends: ["dispel"] }])).toBe("Until dispelled");
        });
        it("should format permanent until triggered", () => {
            expect(spDurationToFull([{ type: "permanent", ends: ["trigger"] }])).toBe("Until triggered");
        });
        it("should format permanent until dispelled or triggered", () => {
            expect(spDurationToFull([{ type: "permanent", ends: ["dispel", "trigger"] }])).toBe("Until dispelled or triggered");
        });
        it("should format permanent without ends", () => {
            expect(spDurationToFull([{ type: "permanent" }])).toBe("Permanent");
        });
        it("should format with condition", () => {
            expect(spDurationToFull([{ type: "instant", condition: "if used this way" }])).toBe("Instantaneous (if used this way)");
        });
        it("should format multiple durations", () => {
            const result = spDurationToFull([
                { type: "instant" },
                { type: "timed", duration: { amount: 1, type: "hour" } },
            ]);
            expect(result).toContain("Instantaneous");
            expect(result).toContain("1 hour");
            expect(result).toContain("(see below)");
        });
    });
    describe("SP_TIME_TO_FULL constant", () => {
        it("should contain all time units", () => {
            expect(SP_TIME_TO_FULL.action).toBe("Action");
            expect(SP_TIME_TO_FULL.bonus).toBe("Bonus Action");
            expect(SP_TIME_TO_FULL.reaction).toBe("Reaction");
            expect(SP_TIME_TO_FULL.round).toBe("Rounds");
            expect(SP_TIME_TO_FULL.minute).toBe("Minutes");
            expect(SP_TIME_TO_FULL.hour).toBe("Hours");
            expect(SP_TIME_TO_FULL.special).toBe("Special");
        });
    });
    describe("SP_END_TYPE_TO_FULL constant", () => {
        it("should contain all end types", () => {
            expect(SP_END_TYPE_TO_FULL.dispel).toBe("dispelled");
            expect(SP_END_TYPE_TO_FULL.trigger).toBe("triggered");
            expect(SP_END_TYPE_TO_FULL.discharge).toBe("discharged");
        });
    });
});
//# sourceMappingURL=spell.test.js.map