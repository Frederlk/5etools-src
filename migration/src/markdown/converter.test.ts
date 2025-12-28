import { describe, it, expect } from "vitest";
import {
	MarkdownConverter,
	getEntries,
	getConvertedTable,
	postProcessTable,
	ENTRIES_WITH_CHILDREN,
	ENTRIES_WITH_ENUMERATED_TITLES,
} from "./converter.js";
import type { EntryTable, EntryList, EntryEntries } from "../../../types/entry.js";

describe("converter", () => {
	describe("MarkdownConverter.getEntries", () => {
		describe("basic text handling", () => {
			it("should return empty array for empty string", () => {
				expect(MarkdownConverter.getEntries("")).toEqual([]);
			});

			it("should return empty array for whitespace only", () => {
				expect(MarkdownConverter.getEntries("   \n\t  ")).toEqual([]);
			});

			it("should parse simple text", () => {
				const result = MarkdownConverter.getEntries("Hello world");
				expect(result).toContain("Hello world");
			});
		});

		describe("header parsing", () => {
			it("should parse h1 header as section", () => {
				const result = MarkdownConverter.getEntries("# Chapter Title\n\nSome content here.");
				expect(result.length).toBeGreaterThan(0);
				const section = result[0] as unknown as Record<string, unknown>;
				expect(section.type).toBe("section");
				expect(section.name).toBe("Chapter Title");
			});

			it("should parse h2 header as section", () => {
				const result = MarkdownConverter.getEntries("## Section Title\n\nContent.");
				expect(result.length).toBeGreaterThan(0);
				const section = result[0] as unknown as Record<string, unknown>;
				expect(section.type).toBe("section");
			});

			it("should parse h3 header as entries", () => {
				const result = MarkdownConverter.getEntries("### Subsection\n\nText here.");
				expect(result.length).toBeGreaterThan(0);
				const entries = result[0] as unknown as Record<string, unknown>;
				expect(entries.type).toBe("entries");
				expect(entries.name).toBe("Subsection");
			});

			it("should handle nested headers", () => {
				const md = `# Main
## Sub1
Content 1
## Sub2
Content 2`;
				const result = MarkdownConverter.getEntries(md);
				expect(result.length).toBeGreaterThan(0);
			});

			it("should parse inline bold headers (***Header.***)", () => {
				const result = MarkdownConverter.getEntries("***Ability Name.*** Some description text.");
				expect(result.length).toBeGreaterThan(0);
			});
		});

		describe("list parsing", () => {
			it("should parse simple unordered list", () => {
				const md = `- Item 1
- Item 2
- Item 3`;
				const result = MarkdownConverter.getEntries(md);
				expect(result.length).toBeGreaterThan(0);
				const list = result[0] as EntryList;
				expect(list.type).toBe("list");
				expect(list.items?.length).toBe(3);
			});

			it("should parse list with asterisks", () => {
				const md = `* Item A
* Item B`;
				const result = MarkdownConverter.getEntries(md);
				expect(result.length).toBeGreaterThan(0);
				const list = result[0] as EntryList;
				expect(list.type).toBe("list");
			});

			it("should parse list with plus signs", () => {
				const md = `+ Item X
+ Item Y`;
				const result = MarkdownConverter.getEntries(md);
				const list = result[0] as EntryList;
				expect(list.type).toBe("list");
			});

			it("should parse nested lists", () => {
				const md = `- Level 1
  - Level 2
    - Level 3
- Back to Level 1`;
				const result = MarkdownConverter.getEntries(md);
				expect(result.length).toBeGreaterThan(0);
				const list = result[0] as EntryList;
				expect(list.type).toBe("list");
			});
		});

		describe("table parsing", () => {
			it("should parse simple table", () => {
				const md = `| Col 1 | Col 2 |
|-------|-------|
| A     | B     |
| C     | D     |`;
				const result = MarkdownConverter.getEntries(md);
				expect(result.length).toBeGreaterThan(0);
				const table = result[0] as EntryTable;
				expect(table.type).toBe("table");
				expect(table.colLabels).toEqual(["Col 1", "Col 2"]);
				expect(table.rows?.length).toBe(2);
			});

			it("should parse table with caption", () => {
				const md = `##### My Table
| A | B |
|---|---|
| 1 | 2 |`;
				const result = MarkdownConverter.getEntries(md);
				const table = result[0] as EntryTable;
				expect(table.type).toBe("table");
				expect(table.caption).toBe("My Table");
			});

			it("should handle table alignment", () => {
				const md = `| Left | Center | Right |
|:-----|:------:|------:|
| L    | C      | R     |`;
				const result = MarkdownConverter.getEntries(md);
				const table = result[0] as EntryTable;
				expect(table.colStyles).toBeDefined();
			});
		});

		describe("inset parsing", () => {
			it("should parse blockquote as inset", () => {
				const md = `> This is an inset
> with multiple lines`;
				const result = MarkdownConverter.getEntries(md);
				expect(result.length).toBeGreaterThan(0);
				const inset = result[0] as unknown as Record<string, unknown>;
				expect(inset.type).toBe("inset");
			});

			it("should parse named inset with header", () => {
				const md = `> ##### Sidebar Title
> Content of the sidebar`;
				const result = MarkdownConverter.getEntries(md);
				const inset = result[0] as unknown as Record<string, unknown>;
				expect(inset.type).toBe("inset");
				expect(inset.name).toBe("Sidebar Title");
			});

			it("should parse readaloud block (>>)", () => {
				const md = `>> The DM reads this aloud
>> to the players`;
				const result = MarkdownConverter.getEntries(md);
				const inset = result[0] as unknown as Record<string, unknown>;
				expect(inset.type).toBe("insetReadaloud");
			});
		});

		describe("creature stat block detection", () => {
			it("should detect creature blocks starting with ___", () => {
				const md = `___
> ## Monster Name
> *Medium beast*`;
				const result = MarkdownConverter.getEntries(md);
				expect(result.length).toBeGreaterThan(0);
				const creature = result[0] as unknown as Record<string, unknown>;
				expect(creature.type).toBe("inset");
				expect((creature.name as string)).toContain("Text Converter");
			});

			it("should detect creature blocks starting with ---", () => {
				const md = `---
> ## Another Monster
> *Large dragon*`;
				const result = MarkdownConverter.getEntries(md);
				const creature = result[0] as unknown as Record<string, unknown>;
				expect(creature.type).toBe("inset");
			});
		});

		describe("inline styling conversion", () => {
			it("should convert bold (**text**) to {@b}", () => {
				const md = `### Test
This has **bold text** in it.`;
				const result = MarkdownConverter.getEntries(md);
				const entries = result[0] as EntryEntries;
				const content = entries.entries?.find(e => typeof e === "string" && e.includes("{@b")) as string;
				expect(content).toBeDefined();
			});

			it("should convert italic (*text*) to {@i}", () => {
				const md = `### Test
This has *italic text* here.`;
				const result = MarkdownConverter.getEntries(md);
				const entries = result[0] as EntryEntries;
				const content = entries.entries?.find(e => typeof e === "string" && e.includes("{@i")) as string;
				expect(content).toBeDefined();
			});

			it("should convert strikethrough (~~text~~) to {@s}", () => {
				const md = `### Test
This has ~~struck text~~ here.`;
				const result = MarkdownConverter.getEntries(md);
				const entries = result[0] as EntryEntries;
				const content = entries.entries?.find(e => typeof e === "string" && e.includes("{@s")) as string;
				expect(content).toBeDefined();
			});

			it("should convert links to {@link}", () => {
				const md = `### Test
Check [this link](http://example.com) out.`;
				const result = MarkdownConverter.getEntries(md);
				const entries = result[0] as EntryEntries;
				const content = entries.entries?.find(e => typeof e === "string" && e.includes("{@link")) as string;
				expect(content).toBeDefined();
			});
		});

		describe("GM Binder cleanup", () => {
			it("should remove pagebreak markers", () => {
				const md = `Some text
\\pagebreak
More text`;
				const result = MarkdownConverter.getEntries(md);
				const hasPagebreak = result.some(e => typeof e === "string" && e.includes("pagebreak"));
				expect(hasPagebreak).toBe(false);
			});

			it("should remove columnbreak markers", () => {
				const md = `Column 1
\\columnbreak
Column 2`;
				const result = MarkdownConverter.getEntries(md);
				const hasColumnbreak = result.some(e => typeof e === "string" && e.includes("columnbreak"));
				expect(hasColumnbreak).toBe(false);
			});
		});
	});

	describe("getEntries (factory function)", () => {
		it("should be equivalent to MarkdownConverter.getEntries", () => {
			const md = "# Test\nContent";
			expect(getEntries(md)).toEqual(MarkdownConverter.getEntries(md));
		});
	});

	describe("getConvertedTable", () => {
		it("should convert table lines to EntryTable", () => {
			const lines = [
				"| Header 1 | Header 2 |",
				"|----------|----------|",
				"| Cell A   | Cell B   |",
			];
			const result = getConvertedTable(lines);
			expect(result.type).toBe("table");
			expect(result.colLabels).toEqual(["Header 1", "Header 2"]);
			expect(result.rows?.length).toBe(1);
		});

		it("should handle caption", () => {
			const lines = [
				"| A | B |",
				"|---|---|",
				"| 1 | 2 |",
			];
			const result = getConvertedTable(lines, "Table Caption");
			expect(result.caption).toBe("Table Caption");
		});

		it("should trim leading pipes", () => {
			const lines = [
				"| Col |",
				"|-----|",
				"| Val |",
			];
			const result = getConvertedTable(lines);
			expect(result.colLabels).toBeDefined();
		});

		it("should handle alignment markers", () => {
			const lines = [
				"| Left | Center | Right |",
				"|:-----|:------:|------:|",
				"| L    | C      | R     |",
			];
			const result = getConvertedTable(lines);
			// Styles include both alignment and column width (e.g., "text-align-left col-3")
			expect(result.colStyles?.some(s => s.includes("text-align-left"))).toBe(true);
			expect(result.colStyles?.some(s => s.includes("text-center"))).toBe(true);
			expect(result.colStyles?.some(s => s.includes("text-right"))).toBe(true);
		});
	});

	describe("postProcessTable", () => {
		it("should normalize cell counts", () => {
			// Note: postProcessTable works with simple string[][] rows (legacy behavior)
			const tbl = {
				type: "table",
				colLabels: ["A", "B", "C"],
				colStyles: [],
				rows: [["1", "2"], ["X"]],
			} as unknown as EntryTable;
			postProcessTable(tbl);
			expect((tbl.rows![0] as unknown as string[]).length).toBe(3);
			expect((tbl.rows![1] as unknown as string[]).length).toBe(3);
		});

		it("should convert -- to em dash", () => {
			const tbl = {
				type: "table",
				colLabels: ["A"],
				colStyles: [],
				rows: [["--"], ["value"]],
			} as unknown as EntryTable;
			postProcessTable(tbl);
			expect((tbl.rows![0] as unknown as string[])[0]).toBe("\u2014");
		});

		it("should accept custom options", () => {
			const tbl = {
				type: "table",
				colLabels: ["A", "B"],
				colStyles: [],
				rows: [["1", "2"]],
			} as unknown as EntryTable;
			postProcessTable(tbl, { tableWidth: 150, diceColWidth: 2 });
			expect(tbl.colStyles).toBeDefined();
		});

		it("should clean empty caption", () => {
			const tbl = {
				type: "table",
				caption: "",
				colLabels: ["A"],
				colStyles: [],
				rows: [["1"]],
			} as unknown as EntryTable;
			postProcessTable(tbl);
			expect(tbl.caption).toBeUndefined();
		});

		it("should clean empty colLabels", () => {
			const tbl = {
				type: "table",
				colLabels: ["", ""],
				colStyles: [],
				rows: [["1", "2"]],
			} as unknown as EntryTable;
			postProcessTable(tbl);
			expect(tbl.colLabels).toBeUndefined();
		});
	});

	describe("ENTRIES_WITH_CHILDREN", () => {
		it("should include list type", () => {
			const listEntry = ENTRIES_WITH_CHILDREN.find(e => e.type === "list");
			expect(listEntry).toBeDefined();
			expect(listEntry?.key).toBe("items");
		});

		it("should include table type", () => {
			const tableEntry = ENTRIES_WITH_CHILDREN.find(e => e.type === "table");
			expect(tableEntry).toBeDefined();
			expect(tableEntry?.key).toBe("rows");
		});

		it("should include entries type", () => {
			const entriesEntry = ENTRIES_WITH_CHILDREN.find(e => e.type === "entries");
			expect(entriesEntry).toBeDefined();
			expect(entriesEntry?.key).toBe("entries");
		});

		it("should include inset type", () => {
			const insetEntry = ENTRIES_WITH_CHILDREN.find(e => e.type === "inset");
			expect(insetEntry).toBeDefined();
		});
	});

	describe("ENTRIES_WITH_ENUMERATED_TITLES", () => {
		it("should include section type", () => {
			const sectionEntry = ENTRIES_WITH_ENUMERATED_TITLES.find(e => e.type === "section");
			expect(sectionEntry).toBeDefined();
			expect(sectionEntry?.depth).toBe(-1);
		});

		it("should include entries type with depthIncrement", () => {
			const entriesEntry = ENTRIES_WITH_ENUMERATED_TITLES.find(e => e.type === "entries");
			expect(entriesEntry?.depthIncrement).toBe(1);
		});
	});

	describe("E2E: round-trip scenarios", () => {
		it("should parse complex markdown document", () => {
			const md = `# Adventure Title

## Chapter 1: The Beginning

This is the introduction to the adventure.

### The Village

The heroes arrive at a small village.

- The inn is on the left
- The blacksmith is on the right
- The temple is in the center

> ##### Sidebar: Village History
> The village was founded 100 years ago.

#### Notable NPCs

***Innkeeper.*** A friendly halfling named Rosie.

***Blacksmith.*** A gruff dwarf named Thorin.

### The Quest

| d6 | Reward |
|----|--------|
| 1-2 | 10 gp |
| 3-4 | 25 gp |
| 5-6 | 50 gp |

>> The mayor speaks: "Please help us!"`;

			const result = MarkdownConverter.getEntries(md);
			expect(result.length).toBeGreaterThan(0);

			// Should have top-level section
			const topSection = result[0] as unknown as Record<string, unknown>;
			expect(topSection.type).toBe("section");
			expect(topSection.name).toBe("Adventure Title");
		});

		it("should handle spell-like formatting", () => {
			const md = `### Fireball

*3rd-level evocation*

**Casting Time:** 1 action

**Range:** 150 feet

A bright streak flashes from your pointing finger.`;

			const result = MarkdownConverter.getEntries(md);
			expect(result.length).toBeGreaterThan(0);
		});

		it("should handle monster stat block format", () => {
			const md = `### Goblin

*Small humanoid (goblinoid), neutral evil*

- **Armor Class** 15
- **Hit Points** 7 (2d6)
- **Speed** 30 ft.`;

			const result = MarkdownConverter.getEntries(md);
			expect(result.length).toBeGreaterThan(0);
		});
	});
});
