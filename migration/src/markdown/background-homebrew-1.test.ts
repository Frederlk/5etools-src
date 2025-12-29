import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import backgroundsHomebrew from "../data/backgrounds-homebrew.json";
import type { Entry } from "../../../types/entry.js";

describe("homebrew background markdown rendering - Pirate Legend", () => {
	const renderer = new MarkdownRenderer();

	interface Background {
		name: string;
		source: string;
		entries: unknown[];
	}

	const pirateLegend = (backgroundsHomebrew as Background[]).find(
		(bg) => bg.name === "Pirate Legend"
	);

	if (!pirateLegend) {
		throw new Error("Pirate Legend background not found in homebrew data");
	}

	it("should find Pirate Legend background", () => {
		expect(pirateLegend).toBeDefined();
		expect(pirateLegend.name).toBe("Pirate Legend");
		expect(pirateLegend.source).toBe("TESM");
	});

	it("should render background entries to markdown", () => {
		const fullEntry = {
			type: "entries",
			name: pirateLegend.name,
			entries: pirateLegend.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		expect(result).toContain("Pirate Legend");
	});

	it("should render skill proficiencies", () => {
		const fullEntry = {
			type: "entries",
			name: pirateLegend.name,
			entries: pirateLegend.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		expect(result).toContain("Skill Proficiencies:");
		expect(result).toContain("Intimidation");
		expect(result).toContain("Survival");
	});

	it("should render Honor Among Thieves feature", () => {
		const fullEntry = {
			type: "entries",
			name: pirateLegend.name,
			entries: pirateLegend.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		expect(result).toContain("Honor Among Thieves");
	});

	it("should render feature description", () => {
		const fullEntry = {
			type: "entries",
			name: pirateLegend.name,
			entries: pirateLegend.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		expect(result).toContain("legendary");
		expect(result).toContain("pirates");
	});

	it("should render full background with all sections", () => {
		const fullEntry = {
			type: "entries",
			name: pirateLegend.name,
			entries: pirateLegend.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		console.log("=== Rendered Pirate Legend Background ===");
		console.log(result);
		console.log("==========================================");

		expect(result).toContain("Pirate Legend");
		expect(result).toContain("Skill Proficiencies:");
		expect(result).toContain("Intimidation");
		expect(result).toContain("Survival");
		expect(result).toContain("Honor Among Thieves");
		expect(result).toContain("Languages:");
		expect(result).toContain("Equipment:");
		expect(result).toContain("Tool Proficiencies:");
	});
});
