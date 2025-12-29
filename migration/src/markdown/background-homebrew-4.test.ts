import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import backgroundsHomebrew from "../data/backgrounds-homebrew.json" with { type: "json" };
import type { Entry } from "../../../types/entry.js";

describe("Chosen One background markdown rendering", () => {
	const renderer = new MarkdownRenderer();

	const chosenOne = backgroundsHomebrew.find(
		(bg) => bg.name === "Chosen One" && bg.source === "BGO"
	);

	if (!chosenOne) {
		throw new Error("Chosen One background not found in backgrounds-homebrew.json");
	}

	it("should render the introductory text", () => {
		const introEntry = chosenOne.entries[0];
		const result = renderer.render(introEntry as Entry);

		expect(result).toContain("destined for something greater");
		expect(result).toContain("ancient prophecy");
	});

	it("should render skill proficiencies list", () => {
		const listEntry = chosenOne.entries[1];
		const result = renderer.render(listEntry as Entry);

		expect(result).toContain("Skill Proficiencies");
		expect(result).toContain("History");
		expect(result).toContain("Religion");
	});

	it("should render languages in equipment list", () => {
		const listEntry = chosenOne.entries[1];
		const result = renderer.render(listEntry as Entry);

		expect(result).toContain("Languages");
		expect(result).toContain("Two exotic languages");
	});

	it("should render equipment description", () => {
		const listEntry = chosenOne.entries[1];
		const result = renderer.render(listEntry as Entry);

		expect(result).toContain("Equipment");
		expect(result).toContain("common clothes");
		expect(result).toContain("prophecy");
		expect(result).toContain("talisman");
		expect(result).toContain("journal");
	});

	it("should render Predestiny section with tables", () => {
		const predestinyEntry = chosenOne.entries[2];
		const result = renderer.render(predestinyEntry as Entry);

		expect(result).toContain("Predestiny");
		expect(result).toContain("fulfillment of a prophecy");
		expect(result).toContain("I will...");
		expect(result).toContain("Save the world from a dark, evil force");
		expect(result).toContain("Using...");
		expect(result).toContain("cunning, skill, and determination");
	});

	it("should render Feature: Mark of the Chosen", () => {
		const featureEntry = chosenOne.entries[3];
		const result = renderer.render(featureEntry as Entry);

		expect(result).toContain("Mark of the Chosen");
		expect(result).toContain("unusual physical feature");
		expect(result).toContain("birthmark");
		expect(result).toContain("People familiar with the prophecy");
	});

	it("should render Suggested Characteristics section", () => {
		const characteristicsEntry = chosenOne.entries[4];
		const result = renderer.render(characteristicsEntry as Entry);

		expect(result).toContain("Suggested Characteristics");
		expect(result).toContain("weight of the world");
		expect(result).toContain("Charisma Trait");
	});

	it("should render full background entries structure", () => {
		const fullEntry = {
			type: "entries",
			name: chosenOne.name,
			entries: chosenOne.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		console.log("=== Rendered Chosen One Background ===");
		console.log(result);
		console.log("======================================");

		expect(result).toContain("Chosen One");
		expect(result).toContain("destined for something greater");
		expect(result).toContain("Skill Proficiencies");
		expect(result).toContain("Predestiny");
		expect(result).toContain("Mark of the Chosen");
		expect(result).toContain("Suggested Characteristics");
	});
});
