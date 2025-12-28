import { describe, it, expect } from "vitest";
import {
	getHtmlPtLevelSchoolRitual,
	getHtmlPtCastingTime,
	getHtmlPtRange,
	getHtmlPtComponents,
	getHtmlPtDuration,
	type SpellData,
} from "./spell.js";

describe("spell HTML renderer", () => {
	const mockSpell: SpellData = {
		name: "Fireball",
		level: 3,
		school: "V",
		time: [{ number: 1, unit: "action" }],
		range: { type: "point", distance: { type: "feet", amount: 150 } },
		components: { v: true, s: true, m: "a tiny ball of bat guano and sulfur" },
		duration: [{ type: "instant" }],
	};

	describe("getHtmlPtLevelSchoolRitual", () => {
		it("renders level/school for regular spell (classic)", () => {
			const result = getHtmlPtLevelSchoolRitual(mockSpell, { styleHint: "classic" });
			expect(result).toBe("<i>3rd-level evocation</i>");
		});

		it("renders level/school for regular spell (one)", () => {
			const result = getHtmlPtLevelSchoolRitual(mockSpell, { styleHint: "one" });
			expect(result).toBe("<i>Level 3 Evocation</i>");
		});

		it("renders cantrip correctly (classic)", () => {
			const cantrip: SpellData = { ...mockSpell, level: 0 };
			const result = getHtmlPtLevelSchoolRitual(cantrip, { styleHint: "classic" });
			expect(result).toBe("<i>Evocation cantrip</i>");
		});

		it("renders cantrip correctly (one)", () => {
			const cantrip: SpellData = { ...mockSpell, level: 0 };
			const result = getHtmlPtLevelSchoolRitual(cantrip, { styleHint: "one" });
			expect(result).toBe("<i>Evocation Cantrip</i>");
		});

		it("renders ritual spell (classic)", () => {
			const ritualSpell: SpellData = {
				...mockSpell,
				level: 1,
				meta: { ritual: true },
			};
			const result = getHtmlPtLevelSchoolRitual(ritualSpell, { styleHint: "classic" });
			expect(result).toBe("<i>1st-level evocation (ritual)</i>");
		});

		it("renders ritual spell (one)", () => {
			const ritualSpell: SpellData = {
				...mockSpell,
				level: 1,
				meta: { ritual: true },
			};
			const result = getHtmlPtLevelSchoolRitual(ritualSpell, { styleHint: "one" });
			expect(result).toBe("<i>Level 1 Evocation</i>");
		});

		it("renders with subschools", () => {
			const spellWithSub: SpellData = {
				...mockSpell,
				subschools: ["dunamancy"],
			};
			const result = getHtmlPtLevelSchoolRitual(spellWithSub, { styleHint: "classic" });
			expect(result).toBe("<i>3rd-level evocation (dunamancy)</i>");
		});
	});

	describe("getHtmlPtCastingTime", () => {
		it("renders action casting time (classic)", () => {
			const result = getHtmlPtCastingTime(mockSpell, { styleHint: "classic" });
			expect(result).toBe("<b>Casting Time:</b> 1 action");
		});

		it("renders action casting time (one)", () => {
			const result = getHtmlPtCastingTime(mockSpell, { styleHint: "one" });
			expect(result).toBe("<b>Casting Time:</b> Action");
		});

		it("renders bonus action", () => {
			const bonusSpell: SpellData = {
				...mockSpell,
				time: [{ number: 1, unit: "bonus" }],
			};
			const result = getHtmlPtCastingTime(bonusSpell, { styleHint: "one" });
			expect(result).toBe("<b>Casting Time:</b> Bonus action");
		});

		it("renders multiple minute casting time", () => {
			const longSpell: SpellData = {
				...mockSpell,
				time: [{ number: 10, unit: "minute" }],
			};
			const result = getHtmlPtCastingTime(longSpell, { styleHint: "classic" });
			expect(result).toBe("<b>Casting Time:</b> 10 minutes");
		});

		it("renders ritual as option (one style)", () => {
			const ritualSpell: SpellData = {
				...mockSpell,
				meta: { ritual: true },
			};
			const result = getHtmlPtCastingTime(ritualSpell, { styleHint: "one" });
			expect(result).toContain("Ritual");
		});
	});

	describe("getHtmlPtRange", () => {
		it("renders point range", () => {
			const result = getHtmlPtRange(mockSpell);
			expect(result).toBe("<b>Range:</b> 150 feet");
		});

		it("renders touch range", () => {
			const touchSpell: SpellData = {
				...mockSpell,
				range: { type: "point", distance: { type: "touch" } },
			};
			const result = getHtmlPtRange(touchSpell);
			expect(result).toBe("<b>Range:</b> Touch");
		});

		it("renders self range", () => {
			const selfSpell: SpellData = {
				...mockSpell,
				range: { type: "point", distance: { type: "self" } },
			};
			const result = getHtmlPtRange(selfSpell);
			expect(result).toBe("<b>Range:</b> Self");
		});

		it("renders self with radius (classic)", () => {
			const aoeSpell: SpellData = {
				...mockSpell,
				range: { type: "sphere", distance: { type: "feet", amount: 20 } },
			};
			const result = getHtmlPtRange(aoeSpell, { styleHint: "classic" });
			expect(result).toBe("<b>Range:</b> Self (20-foot radius)");
		});

		it("renders self with radius (one, not displaying area)", () => {
			const aoeSpell: SpellData = {
				...mockSpell,
				range: { type: "sphere", distance: { type: "feet", amount: 20 } },
			};
			const result = getHtmlPtRange(aoeSpell, { styleHint: "one", isDisplaySelfArea: false });
			expect(result).toBe("<b>Range:</b> Self");
		});

		it("renders self with radius (one, displaying area)", () => {
			const aoeSpell: SpellData = {
				...mockSpell,
				range: { type: "sphere", distance: { type: "feet", amount: 20 } },
			};
			const result = getHtmlPtRange(aoeSpell, { styleHint: "one", isDisplaySelfArea: true });
			expect(result).toBe("<b>Range:</b> Self (20-foot radius)");
		});
	});

	describe("getHtmlPtComponents", () => {
		it("renders V, S, M components", () => {
			const result = getHtmlPtComponents(mockSpell);
			expect(result).toBe("<b>Components:</b> V, S, M (a tiny ball of bat guano and sulfur)");
		});

		it("renders V only", () => {
			const vOnlySpell: SpellData = {
				...mockSpell,
				components: { v: true },
			};
			const result = getHtmlPtComponents(vOnlySpell);
			expect(result).toBe("<b>Components:</b> V");
		});

		it("renders V, S", () => {
			const vsSpell: SpellData = {
				...mockSpell,
				components: { v: true, s: true },
			};
			const result = getHtmlPtComponents(vsSpell);
			expect(result).toBe("<b>Components:</b> V, S");
		});

		it("renders M with object material", () => {
			const objMatSpell: SpellData = {
				...mockSpell,
				components: { v: true, s: true, m: { text: "a diamond worth 500 gp", cost: 50000 } },
			};
			const result = getHtmlPtComponents(objMatSpell);
			expect(result).toBe("<b>Components:</b> V, S, M (a diamond worth 500 gp)");
		});

		it("renders None when no components", () => {
			const noCompSpell: SpellData = {
				...mockSpell,
				components: undefined,
			};
			const result = getHtmlPtComponents(noCompSpell);
			expect(result).toBe("<b>Components:</b> None");
		});

		it("renders royalty component", () => {
			const royaltySpell: SpellData = {
				...mockSpell,
				level: 3,
				components: { v: true, r: true },
			};
			const result = getHtmlPtComponents(royaltySpell);
			expect(result).toBe("<b>Components:</b> V, R (3 gp)");
		});
	});

	describe("getHtmlPtDuration", () => {
		it("renders instantaneous duration", () => {
			const result = getHtmlPtDuration(mockSpell);
			expect(result).toBe("<b>Duration:</b> Instantaneous");
		});

		it("renders timed duration", () => {
			const timedSpell: SpellData = {
				...mockSpell,
				duration: [{ type: "timed", duration: { amount: 1, type: "hour" } }],
			};
			const result = getHtmlPtDuration(timedSpell);
			expect(result).toBe("<b>Duration:</b> 1 hour");
		});

		it("renders concentration (classic)", () => {
			const concSpell: SpellData = {
				...mockSpell,
				duration: [{
					type: "timed",
					concentration: true,
					duration: { amount: 1, type: "minute", upTo: true },
				}],
			};
			const result = getHtmlPtDuration(concSpell, { styleHint: "classic" });
			expect(result).toBe("<b>Duration:</b> Concentration, up to 1 minute");
		});

		it("renders concentration (one)", () => {
			const concSpell: SpellData = {
				...mockSpell,
				duration: [{
					type: "timed",
					concentration: true,
					duration: { amount: 1, type: "minute", upTo: true },
				}],
			};
			const result = getHtmlPtDuration(concSpell, { styleHint: "one" });
			expect(result).toContain("Concentration");
			expect(result).toContain("up to 1 minute");
		});

		it("renders permanent until dispelled", () => {
			const permSpell: SpellData = {
				...mockSpell,
				duration: [{ type: "permanent", ends: ["dispel"] }],
			};
			const result = getHtmlPtDuration(permSpell);
			expect(result).toBe("<b>Duration:</b> Until dispelled");
		});

		it("renders permanent until dispelled or triggered", () => {
			const permSpell: SpellData = {
				...mockSpell,
				duration: [{ type: "permanent", ends: ["dispel", "trigger"] }],
			};
			const result = getHtmlPtDuration(permSpell);
			expect(result).toBe("<b>Duration:</b> Until dispelled or triggered");
		});
	});
});
