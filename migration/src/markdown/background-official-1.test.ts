import { describe, it, expect } from "vitest";
import { MarkdownRenderer } from "./renderer.js";
import backgrounds from "../data/backgrounds.json";
import type { Entry } from "../../../types/entry.js";

describe("Aberrant Heir background markdown rendering", () => {
	const renderer = new MarkdownRenderer();
	const aberrantHeir = backgrounds.find((b) => b.name === "Aberrant Heir");

	it("should find Aberrant Heir background", () => {
		expect(aberrantHeir).toBeDefined();
	});

	it("should render background entries with key content", () => {
		if (!aberrantHeir) throw new Error("Aberrant Heir not found");

		const fullEntry = {
			type: "entries",
			name: aberrantHeir.name,
			entries: aberrantHeir.entries,
		} as Entry;
		const result = renderer.render(fullEntry);

		expect(result).toContain("Aberrant Heir");
		expect(result).toContain("Ability Scores:");
		expect(result).toContain("Strength, Constitution, Charisma");
		expect(result).toContain("Feat:");
		expect(result).toContain("Skill Proficiencies:");
		expect(result).toContain("History");
		expect(result).toContain("Intimidation");
		expect(result).toContain("Tool Proficiencies:");
		expect(result).toContain("Disguise Kit");
		expect(result).toContain("Equipment:");
	});
});
