import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import backgrounds from "../data/backgrounds.json" with { type: "json" };
import type { Entry } from "../../../types/entry.js";

interface BackgroundEntry {
	name: string;
	source: string;
	entries?: unknown[];
}

describe("background official data rendering", () => {
	const renderer = new MarkdownRenderer();

	it("should render Acolyte background from official data", () => {
		const acolyte = (backgrounds as BackgroundEntry[]).find(
			(bg) => bg.name === "Acolyte" && bg.source === "XPHB"
		);

		expect(acolyte).toBeDefined();
		expect(acolyte!.entries).toBeDefined();

		const fullEntry = {
			type: "entries",
			name: acolyte!.name,
			entries: acolyte!.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		expect(result).toContain("Acolyte");
		expect(result).toContain("Ability Scores:");
		expect(result).toContain("Intelligence, Wisdom, Charisma");
		expect(result).toContain("Insight");
		expect(result).toContain("Religion");
		expect(result).toContain("Calligrapher");
	});
});
