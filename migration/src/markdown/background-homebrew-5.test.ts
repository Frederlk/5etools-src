import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import backgroundsHomebrew from "../data/backgrounds-homebrew.json";
import type { Entry } from "../../../types/entry.js";

describe("Cultist homebrew background markdown rendering", () => {
	const renderer = new MarkdownRenderer();

	const cultistBackground = backgroundsHomebrew.find(
		(bg) => bg.name === "Cultist" && bg.source === "BGO"
	);

	if (!cultistBackground) {
		throw new Error("Cultist background (BGO) not found in homebrew data");
	}

	it("should find the Cultist background", () => {
		expect(cultistBackground).toBeDefined();
		expect(cultistBackground.name).toBe("Cultist");
		expect(cultistBackground.source).toBe("BGO");
	});

	it("should render fluff text about serving in a cult", () => {
		const fluffEntry = cultistBackground.entries[0];
		const result = renderer.render(fluffEntry as Entry);

		expect(result).toContain("served alongside your fellow neophytes");
		expect(result).toContain("dark creature or eldritch god");
	});

	it("should render the skill proficiencies list", () => {
		const listEntry = cultistBackground.entries[2];
		const result = renderer.render(listEntry as Entry);

		expect(result).toContain("Skill Proficiencies");
		expect(result).toContain("Deception");
		expect(result).toContain("Religion");
	});

	it("should render the Feature: Secret Signs section", () => {
		const featureEntry = cultistBackground.entries.find(
			(e) => typeof e === "object" && "name" in e && e.name === "Feature: Secret Signs"
		);
		expect(featureEntry).toBeDefined();

		const result = renderer.render(featureEntry as Entry);

		expect(result).toContain("Secret Signs");
		expect(result).toContain("secret symbology");
		expect(result).toContain("identify themselves to fellow adherents");
	});

	it("should render the Change of Heart table", () => {
		const changeEntry = cultistBackground.entries.find(
			(e) => typeof e === "object" && "name" in e && e.name === "Change of Heart"
		);
		expect(changeEntry).toBeDefined();

		const result = renderer.render(changeEntry as Entry);

		expect(result).toContain("Change of Heart");
		expect(result).toContain("gruesome rite");
		expect(result).toContain("botched a ritual");
	});

	it("should render full background entries", () => {
		const fullEntry = {
			type: "entries",
			name: cultistBackground.name,
			entries: cultistBackground.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		expect(result).toContain("Cultist");
		expect(result).toContain("neophytes");
		expect(result).toContain("Skill Proficiencies");
		expect(result).toContain("Secret Signs");
		expect(result).toContain("Suggested Characteristics");
	});
});
