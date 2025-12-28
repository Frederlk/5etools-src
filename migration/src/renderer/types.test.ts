import { describe, it, expect } from "vitest";
import {
	createTextStack,
	createRenderMeta,
	createRenderOptions,
	defaultMarkdownConfig,
} from "./types.js";
import type { TextStack, RenderMeta, RenderOptions, MarkdownConfig } from "./types.js";

describe("types", () => {
	describe("createTextStack", () => {
		it("should create a text stack with empty string", () => {
			const stack = createTextStack();
			expect(stack).toEqual([""]);
		});

		it("should return a single-element tuple", () => {
			const stack = createTextStack();
			expect(stack).toHaveLength(1);
		});

		it("should be mutable for accumulation", () => {
			const stack = createTextStack();
			stack[0] += "hello";
			stack[0] += " world";
			expect(stack[0]).toBe("hello world");
		});

		it("should create independent instances", () => {
			const stack1 = createTextStack();
			const stack2 = createTextStack();
			stack1[0] = "modified";
			expect(stack2[0]).toBe("");
		});
	});

	describe("createRenderMeta", () => {
		it("should create render meta with default values", () => {
			const meta = createRenderMeta();
			expect(meta.depth).toBe(0);
			expect(meta._typeStack).toEqual([]);
		});

		it("should accept depth override", () => {
			const meta = createRenderMeta({ depth: 2 });
			expect(meta.depth).toBe(2);
		});

		it("should accept styleHint override", () => {
			const meta = createRenderMeta({ styleHint: "one" });
			expect(meta.styleHint).toBe("one");
		});

		it("should accept _typeStack override", () => {
			const meta = createRenderMeta({ _typeStack: ["entries", "list"] });
			expect(meta._typeStack).toEqual(["entries", "list"]);
		});

		it("should preserve all provided overrides", () => {
			const meta = createRenderMeta({
				depth: 3,
				styleHint: "classic",
				_typeStack: ["table"],
				isStatblockInlineMonster: true,
			});
			expect(meta.depth).toBe(3);
			expect(meta.styleHint).toBe("classic");
			expect(meta._typeStack).toEqual(["table"]);
			expect(meta.isStatblockInlineMonster).toBe(true);
		});

		it("should accept internal tracking flags", () => {
			const meta = createRenderMeta({
				_didRenderPrefix: true,
				_didRenderSuffix: false,
			});
			expect(meta._didRenderPrefix).toBe(true);
			expect(meta._didRenderSuffix).toBe(false);
		});

		it("should accept adventure book context", () => {
			const meta = createRenderMeta({
				adventureBookPage: "1",
				adventureBookSource: "LMoP",
				adventureBookHash: "chapter-1",
			});
			expect(meta.adventureBookPage).toBe("1");
			expect(meta.adventureBookSource).toBe("LMoP");
			expect(meta.adventureBookHash).toBe("chapter-1");
		});

		it("should create independent instances", () => {
			const meta1 = createRenderMeta();
			const meta2 = createRenderMeta();
			meta1._typeStack.push("entries");
			expect(meta2._typeStack).toEqual([]);
		});
	});

	describe("createRenderOptions", () => {
		it("should create render options with default values", () => {
			const options = createRenderOptions();
			expect(options.prefix).toBe("");
			expect(options.suffix).toBe("");
		});

		it("should accept prefix override", () => {
			const options = createRenderOptions({ prefix: "> " });
			expect(options.prefix).toBe("> ");
		});

		it("should accept suffix override", () => {
			const options = createRenderOptions({ suffix: "\n\n" });
			expect(options.suffix).toBe("\n\n");
		});

		it("should accept both prefix and suffix", () => {
			const options = createRenderOptions({ prefix: "* ", suffix: "!" });
			expect(options.prefix).toBe("* ");
			expect(options.suffix).toBe("!");
		});

		it("should accept isSkipNameRow", () => {
			const options = createRenderOptions({ isSkipNameRow: true });
			expect(options.isSkipNameRow).toBe(true);
		});

		it("should accept meta override", () => {
			const meta = createRenderMeta({ depth: 5 });
			const options = createRenderOptions({ meta });
			expect(options.meta).toBe(meta);
			expect(options.meta?.depth).toBe(5);
		});

		it("should preserve all provided overrides", () => {
			const meta = createRenderMeta();
			const options = createRenderOptions({
				prefix: ">>",
				suffix: "<<",
				isSkipNameRow: true,
				meta,
			});
			expect(options.prefix).toBe(">>");
			expect(options.suffix).toBe("<<");
			expect(options.isSkipNameRow).toBe(true);
			expect(options.meta).toBe(meta);
		});
	});

	describe("defaultMarkdownConfig", () => {
		it("should have expected default values", () => {
			expect(defaultMarkdownConfig.tagRenderMode).toBe("convertMarkdown");
			expect(defaultMarkdownConfig.isAddColumnBreaks).toBe(false);
			expect(defaultMarkdownConfig.isAddPageBreaks).toBe(false);
			expect(defaultMarkdownConfig.style).toBe("classic");
		});

		it("should be a MarkdownConfig", () => {
			const config: MarkdownConfig = defaultMarkdownConfig;
			expect(config.tagRenderMode).toBeDefined();
			expect(config.isAddColumnBreaks).toBeDefined();
			expect(config.isAddPageBreaks).toBeDefined();
			expect(config.style).toBeDefined();
		});
	});

	describe("type definitions", () => {
		it("TextStack should be a single-element string array", () => {
			const stack: TextStack = ["content"];
			expect(stack[0]).toBe("content");
		});

		it("RenderMeta should have required depth and _typeStack", () => {
			const meta: RenderMeta = {
				depth: 0,
				_typeStack: [],
			};
			expect(meta.depth).toBe(0);
			expect(meta._typeStack).toEqual([]);
		});

		it("RenderOptions should allow all optional properties", () => {
			const options: RenderOptions = {};
			expect(options.prefix).toBeUndefined();
			expect(options.suffix).toBeUndefined();
			expect(options.isSkipNameRow).toBeUndefined();
			expect(options.meta).toBeUndefined();
		});

		it("MarkdownConfig should have all required properties", () => {
			const config: MarkdownConfig = {
				tagRenderMode: "ignore",
				isAddColumnBreaks: true,
				isAddPageBreaks: true,
				style: "one",
			};
			expect(config.tagRenderMode).toBe("ignore");
			expect(config.isAddColumnBreaks).toBe(true);
			expect(config.isAddPageBreaks).toBe(true);
			expect(config.style).toBe("one");
		});

		it("tagRenderMode should accept all valid values", () => {
			const modes: MarkdownConfig["tagRenderMode"][] = [
				"convertMarkdown",
				"ignore",
				"convertText",
			];
			modes.forEach(mode => {
				const config: MarkdownConfig = {
					...defaultMarkdownConfig,
					tagRenderMode: mode,
				};
				expect(config.tagRenderMode).toBe(mode);
			});
		});

		it("StyleHint should accept classic and one", () => {
			const meta1: RenderMeta = createRenderMeta({ styleHint: "classic" });
			const meta2: RenderMeta = createRenderMeta({ styleHint: "one" });
			expect(meta1.styleHint).toBe("classic");
			expect(meta2.styleHint).toBe("one");
		});
	});

	describe("RenderMeta optional properties", () => {
		it("should support _trackTitles Set", () => {
			const meta = createRenderMeta();
			meta._trackTitles = new Set(["Title 1", "Title 2"]);
			expect(meta._trackTitles.has("Title 1")).toBe(true);
			expect(meta._trackTitles.size).toBe(2);
		});

		it("should support _headersIndexed Map", () => {
			const meta = createRenderMeta();
			meta._headersIndexed = new Map([
				["header1", 0],
				["header2", 1],
			]);
			expect(meta._headersIndexed.get("header1")).toBe(0);
		});

		it("should support _hoistedFloatingElements array", () => {
			const meta = createRenderMeta();
			meta._hoistedFloatingElements = ["<div>float1</div>", "<div>float2</div>"];
			expect(meta._hoistedFloatingElements).toHaveLength(2);
		});
	});

	describe("CompactRenderOptions type", () => {
		it("should extend RenderOptions", () => {
			const options: import("./types.js").CompactRenderOptions = {
				prefix: "> ",
				suffix: "\n",
				isHideSenses: true,
				isHideLanguages: false,
				isPlainText: true,
				isTextOnly: false,
			};
			expect(options.prefix).toBe("> ");
			expect(options.isHideSenses).toBe(true);
			expect(options.isHideLanguages).toBe(false);
			expect(options.isPlainText).toBe(true);
			expect(options.isTextOnly).toBe(false);
		});
	});

	describe("TableProcessOptions type", () => {
		it("should have optional tableWidth and diceColWidth", () => {
			const options: import("./types.js").TableProcessOptions = {
				tableWidth: 100,
				diceColWidth: 2,
			};
			expect(options.tableWidth).toBe(100);
			expect(options.diceColWidth).toBe(2);
		});

		it("should allow empty options", () => {
			const options: import("./types.js").TableProcessOptions = {};
			expect(options.tableWidth).toBeUndefined();
			expect(options.diceColWidth).toBeUndefined();
		});
	});

	describe("TagRenderInfo type", () => {
		it("should have required page, source, hash", () => {
			const info: import("./types.js").TagRenderInfo = {
				page: "spells.html",
				source: "PHB",
				hash: "fireball",
			};
			expect(info.page).toBe("spells.html");
			expect(info.source).toBe("PHB");
			expect(info.hash).toBe("fireball");
		});

		it("should allow optional displayText", () => {
			const info: import("./types.js").TagRenderInfo = {
				page: "spells.html",
				source: "PHB",
				hash: "fireball",
				displayText: "Big Boom",
			};
			expect(info.displayText).toBe("Big Boom");
		});
	});

	describe("TagParts type", () => {
		it("should have required name", () => {
			const parts: import("./types.js").TagParts = {
				name: "fireball",
			};
			expect(parts.name).toBe("fireball");
		});

		it("should allow optional source and displayText", () => {
			const parts: import("./types.js").TagParts = {
				name: "fireball",
				source: "PHB",
				displayText: "Big Boom",
			};
			expect(parts.source).toBe("PHB");
			expect(parts.displayText).toBe("Big Boom");
		});

		it("should allow additional string properties", () => {
			const parts: import("./types.js").TagParts = {
				name: "item",
				customProp: "value",
			};
			expect(parts.customProp).toBe("value");
		});
	});

	describe("SectionRenderParams type", () => {
		it("should have all required properties", () => {
			const params: import("./types.js").SectionRenderParams = {
				arr: ["entry1", "entry2"],
				ent: { name: "Monster" },
				prop: "action",
				title: "Actions",
				meta: createRenderMeta(),
			};
			expect(params.arr).toHaveLength(2);
			expect(params.ent).toEqual({ name: "Monster" });
			expect(params.prop).toBe("action");
			expect(params.title).toBe("Actions");
			expect(params.meta.depth).toBe(0);
		});

		it("should allow optional prefix", () => {
			const params: import("./types.js").SectionRenderParams = {
				arr: [],
				ent: {},
				prop: "trait",
				title: "Traits",
				meta: createRenderMeta(),
				prefix: "**",
			};
			expect(params.prefix).toBe("**");
		});

		it("should support generic type parameter", () => {
			interface Monster {
				name: string;
				hp: number;
			}
			const params: import("./types.js").SectionRenderParams<Monster> = {
				arr: [],
				ent: { name: "Goblin", hp: 7 },
				prop: "action",
				title: "Actions",
				meta: createRenderMeta(),
			};
			expect(params.ent.name).toBe("Goblin");
			expect(params.ent.hp).toBe(7);
		});
	});

	describe("CompactRenderResult type", () => {
		it("should have ptUnbreakable and ptBreakable", () => {
			const result: import("./types.js").CompactRenderResult = {
				ptUnbreakable: "Header content",
				ptBreakable: "Body content that can split",
			};
			expect(result.ptUnbreakable).toBe("Header content");
			expect(result.ptBreakable).toBe("Body content that can split");
		});
	});
});
