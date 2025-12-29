import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import backgrounds from "../data/backgrounds.json" with { type: "json" };
import type { Entry } from "../../../types/entry.js";

interface BackgroundEntry {
	name: string;
	source: string;
	entries?: unknown[];
}

describe("Artisan background markdown rendering", () => {
	const renderer = new MarkdownRenderer();

	const artisanBackground = (backgrounds as BackgroundEntry[]).find(
		(bg) => bg.name === "Artisan" && bg.source === "XPHB"
	);

	if (!artisanBackground) {
		throw new Error("Artisan background not found in backgrounds.json");
	}

	it("should find the Artisan background", () => {
		expect(artisanBackground).toBeDefined();
		expect(artisanBackground.name).toBe("Artisan");
		expect(artisanBackground.source).toBe("XPHB");
	});

	it("should render background entries", () => {
		const result = renderer.render(artisanBackground.entries as unknown as Entry);

		expect(result).toContain("Ability Scores:");
		expect(result).toContain("Strength, Dexterity, Intelligence");
	});

	it("should render feat entry", () => {
		const result = renderer.render(artisanBackground.entries as unknown as Entry);

		expect(result).toContain("Feat:");
		expect(result).toContain("Crafter");
	});

	it("should render skill proficiencies", () => {
		const result = renderer.render(artisanBackground.entries as unknown as Entry);

		expect(result).toContain("Skill Proficiencies:");
		expect(result).toContain("Investigation");
		expect(result).toContain("Persuasion");
	});

	it("should render tool proficiency", () => {
		const result = renderer.render(artisanBackground.entries as unknown as Entry);

		expect(result).toContain("Tool Proficiency:");
		expect(result).toContain("Artisan's Tools");
	});

	it("should render equipment entry", () => {
		const result = renderer.render(artisanBackground.entries as unknown as Entry);

		expect(result).toContain("Equipment:");
		expect(result).toContain("Choose A or B:");
		expect(result).toContain("Pouch");
		expect(result).toContain("Traveler's Clothes");
		expect(result).toContain("32 GP");
		expect(result).toContain("50 GP");
	});

	it("should render full background structure", () => {
		const fullEntry = {
			type: "entries" as const,
			name: artisanBackground.name,
			entries: artisanBackground.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		console.log("=== Rendered Artisan Background ===");
		console.log(result);
		console.log("===================================");

		expect(result).toContain("Artisan");
		expect(result).toContain("Ability Scores:");
		expect(result).toContain("Feat:");
		expect(result).toContain("Skill Proficiencies:");
		expect(result).toContain("Tool Proficiency:");
		expect(result).toContain("Equipment:");
	});
});
