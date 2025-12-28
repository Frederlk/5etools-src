import { describe, it, expect } from "vitest";
import { SIZE_ABV_TO_FULL, MON_TYPE_TO_PLURAL, ALIGNMENT_ABV_TO_FULL, SPEED_MODES, DMG_TYPES, sizeAbvToFull, monTypeToPlural, monTypeToFullObj, acToFull, getSpeedString, getFullImmRes, getFullCondImm, alignmentAbvToFull, alignmentListToFull, } from "./monster.js";
describe("monster", () => {
    describe("SIZE_ABV_TO_FULL constant", () => {
        it("should contain all size abbreviations", () => {
            expect(SIZE_ABV_TO_FULL.F).toBe("Fine");
            expect(SIZE_ABV_TO_FULL.D).toBe("Diminutive");
            expect(SIZE_ABV_TO_FULL.T).toBe("Tiny");
            expect(SIZE_ABV_TO_FULL.S).toBe("Small");
            expect(SIZE_ABV_TO_FULL.M).toBe("Medium");
            expect(SIZE_ABV_TO_FULL.L).toBe("Large");
            expect(SIZE_ABV_TO_FULL.H).toBe("Huge");
            expect(SIZE_ABV_TO_FULL.G).toBe("Gargantuan");
            expect(SIZE_ABV_TO_FULL.C).toBe("Colossal");
            expect(SIZE_ABV_TO_FULL.V).toBe("Varies");
        });
    });
    describe("MON_TYPE_TO_PLURAL constant", () => {
        it("should contain all monster type plurals", () => {
            expect(MON_TYPE_TO_PLURAL.aberration).toBe("aberrations");
            expect(MON_TYPE_TO_PLURAL.beast).toBe("beasts");
            expect(MON_TYPE_TO_PLURAL.fey).toBe("fey");
            expect(MON_TYPE_TO_PLURAL.undead).toBe("undead");
            expect(MON_TYPE_TO_PLURAL.monstrosity).toBe("monstrosities");
        });
    });
    describe("SPEED_MODES constant", () => {
        it("should contain all speed modes", () => {
            expect(SPEED_MODES).toEqual(["walk", "burrow", "climb", "fly", "swim"]);
        });
    });
    describe("sizeAbvToFull", () => {
        it("should convert size abbreviations to full names", () => {
            expect(sizeAbvToFull("T")).toBe("Tiny");
            expect(sizeAbvToFull("S")).toBe("Small");
            expect(sizeAbvToFull("M")).toBe("Medium");
            expect(sizeAbvToFull("L")).toBe("Large");
            expect(sizeAbvToFull("H")).toBe("Huge");
            expect(sizeAbvToFull("G")).toBe("Gargantuan");
        });
        it("should return input for unknown abbreviations", () => {
            expect(sizeAbvToFull("X")).toBe("X");
            expect(sizeAbvToFull("unknown")).toBe("unknown");
        });
        it("should throw TypeError for null or undefined", () => {
            expect(() => sizeAbvToFull(null)).toThrow(TypeError);
            expect(() => sizeAbvToFull(undefined)).toThrow(TypeError);
        });
    });
    describe("monTypeToPlural", () => {
        it("should pluralize monster types", () => {
            expect(monTypeToPlural("aberration")).toBe("aberrations");
            expect(monTypeToPlural("beast")).toBe("beasts");
            expect(monTypeToPlural("celestial")).toBe("celestials");
            expect(monTypeToPlural("dragon")).toBe("dragons");
            expect(monTypeToPlural("humanoid")).toBe("humanoids");
        });
        it("should handle types that stay the same in plural", () => {
            expect(monTypeToPlural("fey")).toBe("fey");
            expect(monTypeToPlural("undead")).toBe("undead");
        });
        it("should handle irregular plurals", () => {
            expect(monTypeToPlural("monstrosity")).toBe("monstrosities");
        });
        it("should return input for unknown types", () => {
            expect(monTypeToPlural("unknown")).toBe("unknown");
        });
    });
    describe("monTypeToFullObj", () => {
        it("should handle null input", () => {
            const result = monTypeToFullObj(null);
            expect(result.types).toEqual([]);
            expect(result.tags).toEqual([]);
            expect(result.asText).toBe("");
        });
        it("should handle simple string type", () => {
            const result = monTypeToFullObj("humanoid");
            expect(result.types).toEqual(["humanoid"]);
            expect(result.asText).toBe("Humanoid");
            expect(result.asTextShort).toBe("Humanoid");
        });
        it("should handle object with simple type", () => {
            const result = monTypeToFullObj({ type: "fiend" });
            expect(result.types).toEqual(["fiend"]);
            expect(result.asText).toBe("Fiend");
        });
        it("should handle type with tags", () => {
            const result = monTypeToFullObj({
                type: "humanoid",
                tags: ["elf", "wizard"],
            });
            expect(result.types).toEqual(["humanoid"]);
            expect(result.tags).toContain("elf");
            expect(result.tags).toContain("wizard");
            expect(result.asText).toBe("Humanoid (Elf, Wizard)");
        });
        it("should handle swarm type", () => {
            const result = monTypeToFullObj({
                type: "beast",
                swarmSize: "T",
            });
            expect(result.tags).toContain("swarm");
            expect(result.asText).toBe("swarm of Tiny Beasts");
            expect(result.swarmSize).toBe("T");
        });
        it("should handle type with note", () => {
            const result = monTypeToFullObj({
                type: "fiend",
                note: "(demon)",
            });
            expect(result.asText).toBe("Fiend (demon)");
        });
        it("should handle type with choose array", () => {
            const result = monTypeToFullObj({
                type: { choose: ["beast", "humanoid"] },
            });
            expect(result.types).toEqual(["beast", "humanoid"]);
            expect(result.asText).toBe("Beast or Humanoid");
        });
        it("should handle sidekick type", () => {
            const result = monTypeToFullObj({
                type: "humanoid",
                sidekickType: "Expert",
            });
            expect(result.typeSidekick).toBe("Expert");
            expect(result.asTextSidekick).toBe("Expert");
        });
        it("should handle tag with prefix", () => {
            const result = monTypeToFullObj({
                type: "humanoid",
                tags: [{ tag: "elf", prefix: "high" }],
            });
            expect(result.tags).toContain("elf");
            expect(result.asText).toContain("High Elf");
        });
    });
    describe("acToFull", () => {
        it("should return string input unchanged", () => {
            expect(acToFull("special AC")).toBe("special AC");
        });
        it("should format simple numeric AC", () => {
            expect(acToFull([15])).toBe("15");
            expect(acToFull([10])).toBe("10");
        });
        it("should format AC with armor source", () => {
            expect(acToFull([{ ac: 18, from: ["plate armor"] }])).toBe("18 (plate armor)");
        });
        it("should format AC with multiple sources", () => {
            expect(acToFull([{ ac: 16, from: ["chain mail", "shield"] }])).toBe("16 (chain mail, shield)");
        });
        it("should format AC with condition", () => {
            expect(acToFull([{ ac: 14, condition: "with {@spell mage armor}" }])).toBe("14 with {@spell mage armor}");
        });
        it("should format multiple AC entries", () => {
            expect(acToFull([15, 17])).toBe("15, 17");
        });
        it("should format AC with special text", () => {
            expect(acToFull([{ special: "equal to 10 + its proficiency bonus" }])).toBe("equal to 10 + its proficiency bonus");
        });
        it("should hide from when isHideFrom is true", () => {
            expect(acToFull([{ ac: 18, from: ["plate armor"] }], { isHideFrom: true })).toBe("18");
        });
        it("should apply custom renderFn", () => {
            const renderFn = (s) => `[${s}]`;
            expect(acToFull([{ ac: 15, from: ["leather armor"] }], { renderFn })).toBe("15 ([leather armor])");
        });
        it("should handle braces for alternate ACs", () => {
            expect(acToFull([
                { ac: 15, from: ["natural armor"] },
                { ac: 17, from: ["natural armor"], braces: true },
            ])).toBe("15 (natural armor; 17 (natural armor))");
        });
    });
    describe("getSpeedString", () => {
        it("should return em-dash for null/undefined speed", () => {
            expect(getSpeedString({})).toBe("\u2014");
            expect(getSpeedString({ speed: undefined })).toBe("\u2014");
        });
        it("should handle simple numeric speed", () => {
            expect(getSpeedString({ speed: 30 })).toBe("30 ft. ");
        });
        it("should handle speed object with walk only", () => {
            expect(getSpeedString({ speed: { walk: 30 } })).toBe("30 ft.");
        });
        it("should handle speed object with multiple modes", () => {
            const result = getSpeedString({ speed: { walk: 30, fly: 60 } });
            expect(result).toContain("30 ft.");
            expect(result).toContain("Fly 60 ft.");
        });
        it("should handle swim speed", () => {
            const result = getSpeedString({ speed: { walk: 30, swim: 30 } });
            expect(result).toContain("Swim 30 ft.");
        });
        it("should handle burrow speed", () => {
            const result = getSpeedString({ speed: { walk: 25, burrow: 15 } });
            expect(result).toContain("Burrow 15 ft.");
        });
        it("should handle climb speed", () => {
            const result = getSpeedString({ speed: { walk: 30, climb: 30 } });
            expect(result).toContain("Climb 30 ft.");
        });
        it("should handle speed with condition", () => {
            const result = getSpeedString({
                speed: {
                    walk: 30,
                    fly: { number: 60, condition: "with wings" },
                },
            });
            expect(result).toContain("Fly 60 ft.");
            expect(result).toContain("with wings");
        });
        it("should handle metric conversion", () => {
            expect(getSpeedString({ speed: 30 }, { isMetric: true })).toBe("9 m ");
        });
        it("should handle long form units", () => {
            expect(getSpeedString({ speed: 30 }, { isLongForm: true })).toBe("30 feet ");
        });
        it("should skip zero walk when option set and walk is undefined", () => {
            const result = getSpeedString({ speed: { fly: 60 } }, { isSkipZeroWalk: true });
            expect(result).toBe("Fly 60 ft.");
        });
        it("should handle choose speed option", () => {
            const result = getSpeedString({
                speed: {
                    walk: 30,
                    choose: { from: ["fly", "swim"], amount: 30 },
                },
            });
            expect(result).toContain("Fly or Swim 30 ft.");
        });
        it("should handle hidden speed modes", () => {
            const result = getSpeedString({
                speed: { walk: 30, fly: 60, hidden: ["fly"] },
            });
            expect(result).not.toContain("fly");
        });
        it("should apply classic style hint", () => {
            const result = getSpeedString({ speed: { walk: 30, fly: 60 } }, { styleHint: "classic" });
            expect(result).toContain("fly 60 ft.");
        });
    });
    describe("getFullImmRes", () => {
        it("should return empty string for null/undefined", () => {
            expect(getFullImmRes(null)).toBe("");
            expect(getFullImmRes(undefined)).toBe("");
            expect(getFullImmRes([])).toBe("");
        });
        it("should format simple damage types", () => {
            expect(getFullImmRes(["fire"])).toBe("fire");
            expect(getFullImmRes(["fire", "cold"])).toBe("fire, cold");
        });
        it("should format with title case option", () => {
            expect(getFullImmRes(["fire", "cold"], { isTitleCase: true })).toBe("Fire, Cold");
        });
        it("should format all damage types as 'all damage'", () => {
            const allTypes = [...DMG_TYPES];
            expect(getFullImmRes(allTypes)).toBe("all damage");
            expect(getFullImmRes(allTypes, { isTitleCase: true })).toBe("All Damage");
        });
        it("should handle special immunity", () => {
            const result = getFullImmRes([{ special: "damage from nonmagical attacks" }]);
            expect(result).toBe("damage from nonmagical attacks");
        });
        it("should handle nested immunity with note", () => {
            const result = getFullImmRes([
                "fire",
                { immune: ["cold"], note: "from nonmagical weapons" },
            ]);
            expect(result).toContain("fire");
            expect(result).toContain("cold");
            expect(result).toContain("from nonmagical weapons");
        });
        it("should handle preNote", () => {
            const result = getFullImmRes([
                { immune: ["fire", "cold"], preNote: "bludgeoning," },
            ]);
            expect(result).toContain("bludgeoning,");
        });
    });
    describe("getFullCondImm", () => {
        it("should return empty string for null/undefined", () => {
            expect(getFullCondImm(null)).toBe("");
            expect(getFullCondImm(undefined)).toBe("");
            expect(getFullCondImm([])).toBe("");
        });
        it("should format simple conditions", () => {
            expect(getFullCondImm(["charmed"])).toBe("{@condition charmed}");
            expect(getFullCondImm(["charmed", "frightened"])).toContain("{@condition charmed}");
            expect(getFullCondImm(["charmed", "frightened"])).toContain("{@condition frightened}");
        });
        it("should handle plain text option", () => {
            expect(getFullCondImm(["charmed"], { isPlainText: true })).toBe("charmed");
        });
        it("should handle title case option", () => {
            expect(getFullCondImm(["charmed"], { isTitleCase: true })).toBe("{@condition Charmed}");
        });
        it("should handle isEntry option", () => {
            expect(getFullCondImm(["charmed"], { isEntry: true })).toBe("{@condition charmed}");
        });
        it("should throw when both isPlainText and isEntry are true", () => {
            expect(() => getFullCondImm(["charmed"], { isPlainText: true, isEntry: true })).toThrow();
        });
        it("should handle special condition immunity", () => {
            const result = getFullCondImm([{ special: "any condition from a spell" }]);
            expect(result).toContain("any condition from a spell");
        });
        it("should handle condition object with note", () => {
            const result = getFullCondImm([
                { conditionImmune: ["charmed"], note: "(while wearing the amulet)" },
            ]);
            expect(result).toContain("charmed");
            expect(result).toContain("(while wearing the amulet)");
        });
    });
    describe("alignmentAbvToFull", () => {
        it("should convert abbreviations to full alignment names", () => {
            expect(alignmentAbvToFull("L")).toBe("lawful");
            expect(alignmentAbvToFull("N")).toBe("neutral");
            expect(alignmentAbvToFull("C")).toBe("chaotic");
            expect(alignmentAbvToFull("G")).toBe("good");
            expect(alignmentAbvToFull("E")).toBe("evil");
        });
        it("should handle special neutral cases", () => {
            expect(alignmentAbvToFull("NX")).toBe("neutral (law/chaos axis)");
            expect(alignmentAbvToFull("NY")).toBe("neutral (good/evil axis)");
        });
        it("should handle unaligned and any", () => {
            expect(alignmentAbvToFull("U")).toBe("unaligned");
            expect(alignmentAbvToFull("A")).toBe("any alignment");
        });
        it("should handle lowercase input", () => {
            expect(alignmentAbvToFull("l")).toBe("lawful");
            expect(alignmentAbvToFull("g")).toBe("good");
        });
        it("should return null for null input", () => {
            expect(alignmentAbvToFull(null)).toBe(null);
        });
        it("should handle object with special", () => {
            expect(alignmentAbvToFull({ special: "typically neutral" })).toBe("typically neutral");
        });
        it("should handle object with chance", () => {
            expect(alignmentAbvToFull({ alignment: ["L", "G"], chance: 50 })).toBe("lawful good (50%)");
        });
        it("should handle object with note", () => {
            expect(alignmentAbvToFull({ alignment: ["C", "E"], note: "in combat" })).toBe("chaotic evil (in combat)");
        });
    });
    describe("alignmentListToFull", () => {
        it("should return empty string for null", () => {
            expect(alignmentListToFull(null)).toBe("");
        });
        it("should handle single alignment", () => {
            expect(alignmentListToFull(["L"])).toBe("lawful");
            expect(alignmentListToFull(["G"])).toBe("good");
        });
        it("should handle two-part alignment", () => {
            expect(alignmentListToFull(["L", "G"])).toBe("lawful good");
            expect(alignmentListToFull(["C", "E"])).toBe("chaotic evil");
            expect(alignmentListToFull(["N", "N"])).toBe("neutral neutral");
        });
        it("should handle any neutral alignment", () => {
            expect(alignmentListToFull(["NX", "NY", "N"])).toBe("any neutral alignment");
        });
        it("should handle non-good alignment (5 options)", () => {
            expect(alignmentListToFull(["L", "NX", "NY", "C", "E"])).toBe("any non-good alignment");
        });
        it("should handle non-evil alignment (5 options)", () => {
            expect(alignmentListToFull(["L", "NX", "NY", "C", "G"])).toBe("any non-evil alignment");
        });
        it("should handle chaotic alignment (4 options)", () => {
            expect(alignmentListToFull(["C", "NY", "G", "E"])).toBe("any chaotic alignment");
        });
        it("should handle lawful alignment (4 options)", () => {
            expect(alignmentListToFull(["L", "NY", "G", "E"])).toBe("any lawful alignment");
        });
        it("should handle alignment objects with or", () => {
            const result = alignmentListToFull([
                { alignment: ["L", "G"] },
                { alignment: ["N", "G"] },
            ]);
            expect(result).toBe("lawful good or neutral good");
        });
        it("should throw for unmapped alignment combinations", () => {
            expect(() => alignmentListToFull(["L", "G", "E"])).toThrow("Unmapped alignment");
        });
    });
    describe("ALIGNMENT_ABV_TO_FULL constant", () => {
        it("should contain all alignment abbreviations", () => {
            expect(ALIGNMENT_ABV_TO_FULL.L).toBe("lawful");
            expect(ALIGNMENT_ABV_TO_FULL.N).toBe("neutral");
            expect(ALIGNMENT_ABV_TO_FULL.C).toBe("chaotic");
            expect(ALIGNMENT_ABV_TO_FULL.G).toBe("good");
            expect(ALIGNMENT_ABV_TO_FULL.E).toBe("evil");
            expect(ALIGNMENT_ABV_TO_FULL.U).toBe("unaligned");
            expect(ALIGNMENT_ABV_TO_FULL.A).toBe("any alignment");
        });
    });
});
//# sourceMappingURL=monster.test.js.map