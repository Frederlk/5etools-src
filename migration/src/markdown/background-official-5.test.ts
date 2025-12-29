import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import backgroundsData from "../data/backgrounds.json" with { type: "json" };
import type { Entry } from "../../../types/entry.js";

interface Background {
	name: string;
	source: string;
	entries: unknown[];
	fluff?: { entries: unknown[] };
}

describe("Athlete background markdown rendering (MOT)", () => {
	const renderer = new MarkdownRenderer();

	const athleteBackground = (backgroundsData as Background[]).find(
		(bg) => bg.name === "Athlete" && bg.source === "MOT"
	);

	if (!athleteBackground) {
		throw new Error("Athlete background not found in backgrounds.json");
	}

	it("should render skill proficiencies list item", () => {
		const listEntry = athleteBackground.entries[0] as Entry;
		const result = renderer.render(listEntry);

		expect(result).toContain("Skill Proficiencies:");
		expect(result).toContain("Acrobatics");
		expect(result).toContain("Athletics");
	});

	it("should render languages list item", () => {
		const listEntry = athleteBackground.entries[0] as Entry;
		const result = renderer.render(listEntry);

		expect(result).toContain("Languages:");
		expect(result).toContain("One of your choice");
	});

	it("should render tool proficiencies list item", () => {
		const listEntry = athleteBackground.entries[0] as Entry;
		const result = renderer.render(listEntry);

		expect(result).toContain("Tool Proficiencies:");
		expect(result).toContain("Vehicles (land)");
	});

	it("should render equipment list item", () => {
		const listEntry = athleteBackground.entries[0] as Entry;
		const result = renderer.render(listEntry);

		expect(result).toContain("Equipment:");
		expect(result).toContain("bronze discus");
		expect(result).toContain("leather ball");
		expect(result).toContain("lucky charm");
	});

	it("should render Feature: Echoes of Victory", () => {
		const featureEntry = athleteBackground.entries[1] as Entry;
		const result = renderer.render(featureEntry);

		expect(result).toContain("Echoes of Victory");
		expect(result).toContain("admiration among spectators");
		expect(result).toContain("100 miles");
		expect(result).toContain("temporary shelter");
	});

	it("should render Favored Event section with table", () => {
		const favoredEventEntry = athleteBackground.entries[2] as Entry;
		const result = renderer.render(favoredEventEntry);

		expect(result).toContain("Favored Event");
		expect(result).toContain("Marathon");
		expect(result).toContain("Wrestling");
		expect(result).toContain("Boxing");
		expect(result).toContain("Chariot or horse race");
		expect(result).toContain("Pankration");
		expect(result).toContain("Pentathlon");
	});

	it("should render Suggested Characteristics with personality traits table", () => {
		const suggestedCharsEntry = athleteBackground.entries[3] as Entry;
		const result = renderer.render(suggestedCharsEntry);

		expect(result).toContain("Suggested Characteristics");
		expect(result).toContain("Personality Trait");
		expect(result).toContain("physical exertion");
		expect(result).toContain("daily exercise routine");
		expect(result).toContain("Obstacles exist to be overcome");
	});

	it("should render full background entries structure", () => {
		const fullEntry = {
			type: "entries",
			name: athleteBackground.name,
			entries: athleteBackground.entries as Entry[],
		} as Entry;
		const result = renderer.render(fullEntry);

		console.log("=== Rendered Athlete Background ===");
		console.log(result);
		console.log("===================================");

		expect(result).toContain("Athlete");
		expect(result).toContain("Skill Proficiencies:");
		expect(result).toContain("Echoes of Victory");
		expect(result).toContain("Favored Event");
	});
});
