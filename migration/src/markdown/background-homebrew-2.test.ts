import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import backgroundsHomebrew from "../data/backgrounds-homebrew.json";
import type { Entry } from "../../../types/entry.js";

describe("homebrew background markdown rendering - Adventurer", () => {
	const renderer = new MarkdownRenderer();

	const adventurerBackground = (backgroundsHomebrew as Array<{ name: string; source: string; entries: unknown[] }>).find(
		(bg) => bg.name === "Adventurer" && bg.source === "BGO"
	);

	if (!adventurerBackground) {
		throw new Error("Adventurer background (BGO) not found in homebrew data");
	}

	it("should render background name as header", () => {
		const nameEntry = { type: "entries", name: "Adventurer", entries: [] } as Entry;
		const result = renderer.render(nameEntry);
		expect(result).toContain("Adventurer");
	});

	it("should render introductory fluff text", () => {
		const fluffEntry = adventurerBackground.entries[0] as Entry;
		const result = renderer.render(fluffEntry);

		expect(result).toContain("Brave deeds and danger are nothing new to you");
		expect(result).toContain("wandering heroes");
	});

	it("should render list-hang-notitle entries", () => {
		const listEntry = adventurerBackground.entries[1] as Entry;
		const result = renderer.render(listEntry);

		expect(result).toContain("Skill Proficiencies");
		expect(result).toContain("Tool Proficiencies");
		expect(result).toContain("Languages");
		expect(result).toContain("Equipment");
	});

	it("should render feature entry", () => {
		const featureEntry = adventurerBackground.entries[2] as Entry;
		const result = renderer.render(featureEntry);

		expect(result).toContain("Guild Membership");
		expect(result).toContain("established and respected member");
		expect(result).toContain("political power");
	});

	it("should render variant feature with inset", () => {
		const variantEntry = adventurerBackground.entries[3] as Entry;
		const result = renderer.render(variantEntry);

		expect(result).toContain("Community Support");
		expect(result).toContain("Local Hero");
	});

	it("should render full background entries structure", () => {
		const fullEntry = {
			type: "entries",
			name: adventurerBackground.name,
			entries: adventurerBackground.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		expect(result).toContain("Adventurer");
		expect(result).toContain("Brave deeds");
		expect(result).toContain("Guild Membership");
		expect(result).toContain("Local Hero");
	});
});
