import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import backgroundsHomebrew from "../data/backgrounds-homebrew.json";
import type { Entry } from "../../../types/entry.js";

describe("Barkeep homebrew background markdown rendering", () => {
	const renderer = new MarkdownRenderer();

	const barkeepBackground = backgroundsHomebrew.find(
		(bg) => bg.name === "Barkeep"
	);

	if (!barkeepBackground) {
		throw new Error("Barkeep background not found in homebrew data");
	}

	it("should render introductory text", () => {
		const introEntry = barkeepBackground.entries[0];
		const result = renderer.render(introEntry as Entry);

		expect(result).toContain("everybody knows your name");
		expect(result).toContain("charismatic fellow");
		expect(result).toContain("trustworthy nature");
	});

	it("should render skill and tool proficiencies list", () => {
		const listEntry = barkeepBackground.entries[1];
		const result = renderer.render(listEntry as Entry);

		expect(result).toContain("Skill Proficiencies");
		expect(result).toContain("Insight");
		expect(result).toContain("Persuasion");
		expect(result).toContain("Tool Proficiencies");
		expect(result).toContain("Brewer's Supplies");
		expect(result).toContain("Languages");
		expect(result).toContain("One of your choice");
		expect(result).toContain("Equipment");
		expect(result).toContain("15 gp");
	});

	it("should render feature entry", () => {
		const featureEntry = barkeepBackground.entries[2];
		const result = renderer.render(featureEntry as Entry);

		expect(result).toContain("Social Lubricant");
		expect(result).toContain("places that serve drinks");
		expect(result).toContain("share gossip");
	});

	it("should render suggested characteristics with tables", () => {
		const characteristicsEntry = barkeepBackground.entries[3];
		const result = renderer.render(characteristicsEntry as Entry);

		expect(result).toContain("Suggested Characteristics");
		expect(result).toContain("Charisma Trait");
		expect(result).toContain("Ideal");
		expect(result).toContain("Bond");
		expect(result).toContain("Flaw");
		expect(result).toContain("Cheer");
		expect(result).toContain("Brewing is my craft");
		expect(result).toContain("gutter is my second home");
	});

	it("should render full background structure", () => {
		const fullEntry = {
			type: "entries",
			name: barkeepBackground.name,
			entries: barkeepBackground.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		console.log("=== Rendered Barkeep Background ===");
		console.log(result);
		console.log("===================================");

		expect(result).toContain("Barkeep");
		expect(result).toContain("Social Lubricant");
		expect(result).toContain("Suggested Characteristics");
	});
});
