import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import type { Entry } from "../../../types/entry.js";

// Test background JSON → Markdown rendering
// Background uses generic entry rendering (same as original RendererMarkdown.background)

describe("background markdown rendering", () => {
	const renderer = new MarkdownRenderer();

	// Acolyte background JSON (from user's expected output)
	const acolyteBackground = {
		name: "Acolyte",
		source: "XPHB",
		page: 0,
		edition: "one",
		ability: [
			{ choose: { weighted: { from: ["int", "wis", "cha"], weights: [2, 1] } } },
			{ choose: { weighted: { from: ["int", "wis", "cha"], weights: [1, 1, 1] } } },
		],
		feats: [{ "magic initiate (cleric)|xphb": true }],
		skillProficiencies: [{ insight: true, religion: true }],
		toolProficiencies: [{ "calligrapher's supplies": true }],
		startingEquipment: [
			{
				a: [
					"calligrapher's supplies|xphb",
					{ item: "book|xphb", displayName: "Book (prayers)" },
					"holy symbol|xphb",
					{ item: "parchment|xphb", displayName: "Parchment (10 sheets)" },
					"robe|xphb",
					{ value: 800 },
				],
				b: [{ value: 5000 }],
			},
		],
		entries: [
			{
				type: "list",
				style: "list-hang-notitle",
				items: [
					{
						type: "item",
						name: "Ability Scores:",
						entry: "Intelligence, Wisdom, Charisma",
					},
					{
						type: "item",
						name: "Feat:",
						entry: "Magic Initiate (Cleric) (see chapter 5)",
					},
					{
						type: "item",
						name: "Skill Proficiencies:",
						entry: "{@skill Insight|XPHB} and {@skill Religion|XPHB}",
					},
					{
						type: "item",
						name: "Tool Proficiency:",
						entry: "{@item Calligrapher's Supplies|XPHB}",
					},
					{
						type: "item",
						name: "Equipment:",
						entry:
							"Choose A or B: (A) {@item Calligrapher's Supplies|XPHB}, {@item Book|XPHB} (prayers), {@item Holy Symbol|XPHB}, {@item Parchment|XPHB} (10 sheets), {@item Robe|XPHB}, 8 GP; or (B) 50 GP",
					},
				],
			},
		],
		fluff: {
			entries: [
				"You devoted yourself to service in a temple, either nestled in a town or secluded in a sacred grove. There you performed rites in honor of a god or pantheon. You served under a priest and studied religion. Thanks to your priest's instruction and your own devotion, you also learned how to channel a modicum of divine power in service to your place of worship and the people who prayed there.",
			],
		},
	};

	it("should render background name as header", () => {
		// Test rendering just the name
		const nameEntry = { type: "entries", name: "Acolyte", entries: [] } as Entry;
		const result = renderer.render(nameEntry);
		expect(result).toContain("Acolyte");
	});

	it("should render list-hang-notitle entries", () => {
		// Test rendering the list with item entries
		const listEntry = acolyteBackground.entries[0] as Entry;
		const result = renderer.render(listEntry);

		expect(result).toContain("Ability Scores:");
		expect(result).toContain("Intelligence, Wisdom, Charisma");
		expect(result).toContain("Feat:");
		expect(result).toContain("Skill Proficiencies:");
		expect(result).toContain("Tool Proficiency:");
		expect(result).toContain("Equipment:");
	});

	it("should render fluff entries", () => {
		// Test rendering fluff text
		const fluffEntry = acolyteBackground.fluff.entries[0] as Entry;
		const result = renderer.render(fluffEntry);

		expect(result).toContain("devoted yourself to service");
		expect(result).toContain("temple");
	});

	it("should render full background entries structure", () => {
		// Test rendering all entries
		const fullEntry = {
			type: "entries",
			name: acolyteBackground.name,
			entries: [...acolyteBackground.entries, ...acolyteBackground.fluff.entries],
		} as Entry;
		const result = renderer.render(fullEntry);

		console.log("=== Rendered Acolyte Background ===");
		console.log(result);
		console.log("===================================");

		expect(result).toContain("Acolyte");
		expect(result).toContain("Ability Scores:");
		expect(result).toContain("devoted yourself");
	});

	it("should handle tags in entries", () => {
		// Test that @skill and @item tags are processed
		const skillEntry = "{@skill Insight|XPHB} and {@skill Religion|XPHB}" as Entry;
		const result = renderer.render(skillEntry);

		// Tags should be rendered (either as markdown links or plain text depending on config)
		expect(result).toBeTruthy();
	});
});
