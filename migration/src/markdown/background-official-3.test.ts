import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import backgroundsData from "../data/backgrounds.json";
import type { Entry } from "../../../types/entry.js";

describe("Anthropologist background markdown rendering", () => {
	const renderer = new MarkdownRenderer();

	const anthropologistBackground = (backgroundsData as unknown[]).find(
		(bg: unknown) => (bg as { name: string }).name === "Anthropologist"
	) as {
		name: string;
		source: string;
		entries: unknown[];
	};

	it("should find the Anthropologist background in data", () => {
		expect(anthropologistBackground).toBeDefined();
		expect(anthropologistBackground.name).toBe("Anthropologist");
		expect(anthropologistBackground.source).toBe("ToA");
	});

	it("should render skill proficiencies from list entry", () => {
		const listEntry = anthropologistBackground.entries[0];
		const result = renderer.render(listEntry as Entry);

		expect(result).toContain("Skill Proficiencies:");
		expect(result).toContain("Insight");
		expect(result).toContain("Religion");
	});

	it("should render languages entry", () => {
		const listEntry = anthropologistBackground.entries[0];
		const result = renderer.render(listEntry as Entry);

		expect(result).toContain("Languages:");
		expect(result).toContain("Two of your choice");
	});

	it("should render equipment entry", () => {
		const listEntry = anthropologistBackground.entries[0];
		const result = renderer.render(listEntry as Entry);

		expect(result).toContain("Equipment:");
		expect(result).toContain("leather-bound diary");
	});

	it("should render Cultural Chameleon feature", () => {
		const culturalChameleonEntry = anthropologistBackground.entries[1];
		const result = renderer.render(culturalChameleonEntry as Entry);

		expect(result).toContain("Cultural Chameleon");
		expect(result).toContain("Before becoming an adventurer");
		expect(result).toContain("foreign cultures");
	});

	it("should render Adopted Culture table", () => {
		const culturalChameleonEntry = anthropologistBackground.entries[1];
		const result = renderer.render(culturalChameleonEntry as Entry);

		expect(result).toContain("d8");
		expect(result).toContain("Culture");
		expect(result).toContain("Aarakocra");
		expect(result).toContain("Dwarf");
		expect(result).toContain("Elf");
		expect(result).toContain("Goblin");
		expect(result).toContain("Halfling");
		expect(result).toContain("Human");
		expect(result).toContain("Lizardfolk");
		expect(result).toContain("Orc");
	});

	it("should render Feature: Adept Linguist", () => {
		const adeptLinguistEntry = anthropologistBackground.entries[2];
		const result = renderer.render(adeptLinguistEntry as Entry);

		expect(result).toContain("Adept Linguist");
		expect(result).toContain("communicate with humanoids");
		expect(result).toContain("observe the humanoids interacting");
		expect(result).toContain("at least 1 day");
	});

	it("should render Suggested Characteristics", () => {
		const suggestedCharsEntry = anthropologistBackground.entries[3];
		const result = renderer.render(suggestedCharsEntry as Entry);

		expect(result).toContain("Suggested Characteristics");
		expect(result).toContain("Anthropologists leave behind the societies");
		expect(result).toContain("intellectual curiosity");
	});

	it("should render Personality Trait table", () => {
		const suggestedCharsEntry = anthropologistBackground.entries[3];
		const result = renderer.render(suggestedCharsEntry as Entry);

		expect(result).toContain("d6");
		expect(result).toContain("Personality Trait");
		expect(result).toContain("prefer the company of those who aren't like me");
	});

	it("should render full background entries structure", () => {
		const fullEntry = {
			type: "entries",
			name: anthropologistBackground.name,
			entries: anthropologistBackground.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		console.log("=== Rendered Anthropologist Background ===");
		console.log(result);
		console.log("==========================================");

		expect(result).toContain("Anthropologist");
		expect(result).toContain("Skill Proficiencies:");
		expect(result).toContain("Cultural Chameleon");
		expect(result).toContain("Adept Linguist");
		expect(result).toContain("Suggested Characteristics");
	});
});
