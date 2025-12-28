import { describe, it, expect } from "vitest";
import {
	splitFirstSpace,
	splitByTags,
	splitTagByPipe,
	splitEqualityByPipe,
	createPipeSplitter,
	stripTags,
	hasTags,
	isTag,
	getTagName,
	getTagContent,
	parseTag,
	buildTag,
	builtInTags,
	defaultTagInfo,
	createSimpleTagInfo,
	createDiceTagInfo,
} from "./tags.js";

describe("tags", () => {
	describe("splitFirstSpace", () => {
		it("should split at first space", () => {
			expect(splitFirstSpace("hello world")).toEqual(["hello", "world"]);
		});

		it("should return original string and empty for no space", () => {
			expect(splitFirstSpace("hello")).toEqual(["hello", ""]);
		});

		it("should handle multiple spaces", () => {
			expect(splitFirstSpace("hello world foo bar")).toEqual(["hello", "world foo bar"]);
		});

		it("should handle leading space", () => {
			expect(splitFirstSpace(" hello")).toEqual(["", "hello"]);
		});

		it("should handle empty string", () => {
			expect(splitFirstSpace("")).toEqual(["", ""]);
		});

		it("should handle single word", () => {
			expect(splitFirstSpace("word")).toEqual(["word", ""]);
		});

		it("should handle spaces only", () => {
			expect(splitFirstSpace("   ")).toEqual(["", "  "]);
		});
	});

	describe("splitByTags", () => {
		it("should return empty array for empty string", () => {
			expect(splitByTags("")).toEqual([]);
		});

		it("should return empty array for null/undefined", () => {
			expect(splitByTags(null as unknown as string)).toEqual([]);
			expect(splitByTags(undefined as unknown as string)).toEqual([]);
		});

		it("should return plain text without tags", () => {
			expect(splitByTags("hello world")).toEqual(["hello world"]);
		});

		it("should split single tag", () => {
			expect(splitByTags("{@bold text}")).toEqual(["{@bold text}"]);
		});

		it("should split tag with surrounding text", () => {
			expect(splitByTags("Hello {@bold world}!")).toEqual(["Hello ", "{@bold world}", "!"]);
		});

		it("should split multiple tags", () => {
			expect(splitByTags("{@bold a} and {@italic b}")).toEqual([
				"{@bold a}",
				" and ",
				"{@italic b}",
			]);
		});

		it("should handle nested tags", () => {
			const result = splitByTags("outer {@tag inner {@nested deep}}");
			expect(result).toEqual(["outer ", "{@tag inner {@nested deep}}"]);
		});

		it("should handle equality tags {=...}", () => {
			expect(splitByTags("text {=var} more")).toEqual(["text ", "{=var}", " more"]);
		});

		it("should not split regular braces", () => {
			expect(splitByTags("function() { return 1; }")).toEqual(["function() { return 1; }"]);
		});

		it("should handle consecutive tags", () => {
			expect(splitByTags("{@a 1}{@b 2}")).toEqual(["{@a 1}", "{@b 2}"]);
		});

		it("should handle tag at start", () => {
			expect(splitByTags("{@tag content} rest")).toEqual(["{@tag content}", " rest"]);
		});

		it("should handle tag at end", () => {
			expect(splitByTags("start {@tag content}")).toEqual(["start ", "{@tag content}"]);
		});

		it("should handle deeply nested tags", () => {
			const result = splitByTags("{@outer {@middle {@inner text}}}");
			expect(result).toEqual(["{@outer {@middle {@inner text}}}"]);
		});
	});

	describe("splitTagByPipe", () => {
		it("should return empty array for empty string", () => {
			expect(splitTagByPipe("")).toEqual([]);
		});

		it("should split by pipe", () => {
			expect(splitTagByPipe("a|b|c")).toEqual(["a", "b", "c"]);
		});

		it("should handle no pipes", () => {
			expect(splitTagByPipe("content")).toEqual(["content"]);
		});

		it("should preserve nested tags when splitting", () => {
			expect(splitTagByPipe("text|{@nested a|b}|more")).toEqual([
				"text",
				"{@nested a|b}",
				"more",
			]);
		});

		it("should handle empty segments", () => {
			expect(splitTagByPipe("a||c")).toEqual(["a", "", "c"]);
		});

		it("should handle trailing pipe", () => {
			expect(splitTagByPipe("a|b|")).toEqual(["a", "b"]);
		});

		it("should handle escaped pipes", () => {
			expect(splitTagByPipe("a\\|b|c")).toEqual(["a\\|b", "c"]);
		});

		it("should handle multiple nested tags", () => {
			expect(splitTagByPipe("{@a x}|{@b y}")).toEqual(["{@a x}", "{@b y}"]);
		});
	});

	describe("splitEqualityByPipe", () => {
		it("should split by pipe", () => {
			expect(splitEqualityByPipe("a|b")).toEqual(["a", "b"]);
		});

		it("should preserve nested equality tags", () => {
			expect(splitEqualityByPipe("text|{=nested a|b}|more")).toEqual([
				"text",
				"{=nested a|b}",
				"more",
			]);
		});
	});

	describe("createPipeSplitter", () => {
		it("should create a splitter for custom leading character", () => {
			const splitter = createPipeSplitter("#");
			expect(splitter("a|{#tag x|y}|b")).toEqual(["a", "{#tag x|y}", "b"]);
		});
	});

	describe("stripTags", () => {
		it("should return empty string for empty input", () => {
			expect(stripTags("")).toBe("");
		});

		it("should return null/undefined as-is", () => {
			expect(stripTags(null as unknown as string)).toBe(null);
			expect(stripTags(undefined as unknown as string)).toBe(undefined);
		});

		it("should return plain text unchanged", () => {
			expect(stripTags("hello world")).toBe("hello world");
		});

		it("should strip simple tag", () => {
			expect(stripTags("{@bold text}")).toBe("text");
		});

		it("should strip tag and preserve surrounding text", () => {
			expect(stripTags("You can cast {@spell fireball} at will.")).toBe(
				"You can cast fireball at will."
			);
		});

		it("should strip multiple tags", () => {
			expect(stripTags("{@bold hello} and {@italic world}")).toBe("hello and world");
		});

		it("should strip nested tags", () => {
			expect(stripTags("{@bold outer {@italic inner}}")).toBe("outer inner");
		});

		it("should handle dice tags with display text", () => {
			expect(stripTags("{@dice 2d6|2d6 fire damage}")).toBe("2d6 fire damage");
		});

		it("should handle dice tags without display text", () => {
			expect(stripTags("{@dice 2d6}")).toBe("2d6");
		});

		it("should handle @h tag (empty)", () => {
			expect(stripTags("{@h}")).toBe("");
		});

		it("should handle @recharge tag with number", () => {
			expect(stripTags("{@recharge 5}")).toBe("(Recharge 5)");
		});

		it("should handle @recharge tag without number", () => {
			expect(stripTags("{@recharge}")).toBe("(Recharge 6)");
		});

		it("should handle @recharge 0", () => {
			expect(stripTags("{@recharge 0}")).toBe("(Recharge)");
		});

		it("should handle @chance tag", () => {
			expect(stripTags("{@chance 50}")).toBe("50 percent");
			expect(stripTags("{@chance 50|half the time}")).toBe("half the time");
		});

		it("should handle @dc tag", () => {
			expect(stripTags("{@dc 15}")).toBe("DC 15");
			expect(stripTags("{@dc 15|Dex save DC 15}")).toBe("Dex save DC 15");
		});

		it("should handle @savingThrow tag", () => {
			expect(stripTags("{@savingThrow 15}")).toBe("DC 15");
			expect(stripTags("{@savingThrow 15|save}")).toBe("save");
		});

		it("should handle @link tag", () => {
			expect(stripTags("{@link Display Text|http://example.com}")).toBe("Display Text");
		});

		it("should handle @scaledice tag", () => {
			expect(stripTags("{@scaledice 1d8|2|1|1d8|fire}")).toBe("fire");
		});

		it("should respect allowlist", () => {
			const result = stripTags("{@bold keep} and {@italic strip}", {
				allowlistTags: new Set(["@bold"]),
			});
			expect(result).toBe("{@bold keep} and strip");
		});

		it("should respect blocklist", () => {
			const result = stripTags("{@bold strip} and {@italic keep}", {
				blocklistTags: new Set(["@bold"]),
			});
			expect(result).toBe("strip and {@italic keep}");
		});

		it("should use custom tag lookup", () => {
			const customTags = {
				"@custom": {
					getStripped: (_tag: string, text: string) => `[${text}]`,
				},
			};
			expect(stripTags("{@custom value}", { tagLookup: customTags })).toBe("[value]");
		});

		it("should handle entity reference tags", () => {
			expect(stripTags("{@creature goblin}")).toBe("goblin");
			expect(stripTags("{@item longsword|phb}")).toBe("longsword");
			expect(stripTags("{@condition frightened}")).toBe("frightened");
		});

		it("should handle @area tag", () => {
			expect(stripTags("{@area 1|A1}")).toBe("A1");
		});

		it("should handle @homebrew tag", () => {
			expect(stripTags("{@homebrew new text|old}")).toBe("new text");
		});

		it("should handle @coinflip tag", () => {
			expect(stripTags("{@coinflip}")).toBe("flip a coin");
			expect(stripTags("{@coinflip flip it}")).toBe("flip it");
		});
	});

	describe("hasTags", () => {
		it("should return false for empty string", () => {
			expect(hasTags("")).toBe(false);
		});

		it("should return false for null/undefined", () => {
			expect(hasTags(null as unknown as string)).toBe(false);
			expect(hasTags(undefined as unknown as string)).toBe(false);
		});

		it("should return false for plain text", () => {
			expect(hasTags("hello world")).toBe(false);
		});

		it("should return true for string with tag", () => {
			expect(hasTags("text {@tag content}")).toBe(true);
		});

		it("should return true for equality tag", () => {
			expect(hasTags("value {=variable}")).toBe(true);
		});

		it("should return false for regular braces", () => {
			expect(hasTags("{ regular }")).toBe(false);
		});

		it("should return true for tag only", () => {
			expect(hasTags("{@spell fireball}")).toBe(true);
		});
	});

	describe("isTag", () => {
		it("should return false for empty string", () => {
			expect(isTag("")).toBe(false);
		});

		it("should return false for null/undefined", () => {
			expect(isTag(null as unknown as string)).toBe(false);
			expect(isTag(undefined as unknown as string)).toBe(false);
		});

		it("should return true for valid tag", () => {
			expect(isTag("{@spell fireball}")).toBe(true);
		});

		it("should return true for equality tag", () => {
			expect(isTag("{=variable}")).toBe(true);
		});

		it("should return false for partial tag", () => {
			expect(isTag("text {@tag}")).toBe(false);
			expect(isTag("{@tag} text")).toBe(false);
		});

		it("should return false for plain text", () => {
			expect(isTag("hello")).toBe(false);
		});

		it("should return false for regular braces", () => {
			expect(isTag("{ not a tag }")).toBe(false);
		});
	});

	describe("getTagName", () => {
		it("should return null for invalid tag", () => {
			expect(getTagName("not a tag")).toBe(null);
			expect(getTagName("")).toBe(null);
		});

		it("should extract tag name", () => {
			expect(getTagName("{@spell fireball}")).toBe("@spell");
		});

		it("should handle tag with pipes", () => {
			expect(getTagName("{@item longsword|phb}")).toBe("@item");
		});

		it("should handle equality tag", () => {
			expect(getTagName("{=variable}")).toBe("=variable");
		});

		it("should handle tag without content", () => {
			expect(getTagName("{@h}")).toBe("@h");
		});
	});

	describe("getTagContent", () => {
		it("should return null for invalid tag", () => {
			expect(getTagContent("not a tag")).toBe(null);
			expect(getTagContent("")).toBe(null);
		});

		it("should extract tag content", () => {
			expect(getTagContent("{@spell fireball}")).toBe("fireball");
		});

		it("should handle tag with pipes", () => {
			expect(getTagContent("{@item longsword|phb}")).toBe("longsword|phb");
		});

		it("should return empty for tag without content", () => {
			expect(getTagContent("{@h}")).toBe("");
		});

		it("should handle content with spaces", () => {
			expect(getTagContent("{@spell magic missile}")).toBe("magic missile");
		});
	});

	describe("parseTag", () => {
		it("should return null for invalid tag", () => {
			expect(parseTag("not a tag")).toBe(null);
			expect(parseTag("")).toBe(null);
		});

		it("should parse simple tag", () => {
			const result = parseTag("{@spell fireball}");
			expect(result).toEqual({
				raw: "{@spell fireball}",
				tag: "@spell",
				name: "fireball",
				source: undefined,
				displayText: undefined,
				parts: ["fireball"],
			});
		});

		it("should parse tag with source", () => {
			const result = parseTag("{@spell fireball|phb}");
			expect(result).toEqual({
				raw: "{@spell fireball|phb}",
				tag: "@spell",
				name: "fireball",
				source: "phb",
				displayText: undefined,
				parts: ["fireball", "phb"],
			});
		});

		it("should parse tag with display text", () => {
			const result = parseTag("{@spell fireball|phb|Big Boom}");
			expect(result).toEqual({
				raw: "{@spell fireball|phb|Big Boom}",
				tag: "@spell",
				name: "fireball",
				source: "phb",
				displayText: "Big Boom",
				parts: ["fireball", "phb", "Big Boom"],
			});
		});

		it("should parse tag with empty source and display text", () => {
			const result = parseTag("{@dice 2d6||damage}");
			expect(result).toEqual({
				raw: "{@dice 2d6||damage}",
				tag: "@dice",
				name: "2d6",
				source: "",
				displayText: "damage",
				parts: ["2d6", "", "damage"],
			});
		});

		it("should parse tag without content", () => {
			const result = parseTag("{@h}");
			expect(result).toEqual({
				raw: "{@h}",
				tag: "@h",
				name: "",
				source: undefined,
				displayText: undefined,
				parts: [],
			});
		});
	});

	describe("buildTag", () => {
		it("should build simple tag", () => {
			expect(buildTag("spell", "fireball")).toBe("{@spell fireball}");
		});

		it("should build tag with source", () => {
			expect(buildTag("spell", "fireball", "phb")).toBe("{@spell fireball|phb}");
		});

		it("should build tag with display text", () => {
			expect(buildTag("spell", "fireball", "phb", "Big Boom")).toBe(
				"{@spell fireball|phb|Big Boom}"
			);
		});

		it("should handle @ prefix in tag name", () => {
			expect(buildTag("@spell", "fireball")).toBe("{@spell fireball}");
		});

		it("should handle display text without source", () => {
			expect(buildTag("dice", "2d6", undefined, "damage")).toBe("{@dice 2d6||damage}");
		});
	});

	describe("builtInTags", () => {
		it("should contain common formatting tags", () => {
			expect(builtInTags["@bold"]).toBeDefined();
			expect(builtInTags["@b"]).toBeDefined();
			expect(builtInTags["@italic"]).toBeDefined();
			expect(builtInTags["@i"]).toBeDefined();
			expect(builtInTags["@strike"]).toBeDefined();
			expect(builtInTags["@underline"]).toBeDefined();
		});

		it("should contain entity reference tags", () => {
			expect(builtInTags["@spell"]).toBeDefined();
			expect(builtInTags["@item"]).toBeDefined();
			expect(builtInTags["@creature"]).toBeDefined();
			expect(builtInTags["@condition"]).toBeDefined();
		});

		it("should contain dice tags", () => {
			expect(builtInTags["@dice"]).toBeDefined();
			expect(builtInTags["@damage"]).toBeDefined();
			expect(builtInTags["@d20"]).toBeDefined();
			expect(builtInTags["@hit"]).toBeDefined();
		});

		it("should contain special tags", () => {
			expect(builtInTags["@h"]).toBeDefined();
			expect(builtInTags["@recharge"]).toBeDefined();
			expect(builtInTags["@chance"]).toBeDefined();
			expect(builtInTags["@dc"]).toBeDefined();
		});
	});

	describe("defaultTagInfo", () => {
		it("should return first pipe segment", () => {
			expect(defaultTagInfo.getStripped("@unknown", "first|second|third")).toBe("first");
		});

		it("should handle no pipes", () => {
			expect(defaultTagInfo.getStripped("@unknown", "content")).toBe("content");
		});

		it("should handle empty string", () => {
			expect(defaultTagInfo.getStripped("@unknown", "")).toBe("");
		});
	});

	describe("createSimpleTagInfo", () => {
		it("should create tag info that returns first segment", () => {
			const tagInfo = createSimpleTagInfo();
			expect(tagInfo.getStripped("@tag", "first|second")).toBe("first");
		});
	});

	describe("createDiceTagInfo", () => {
		it("should return display text if provided", () => {
			const tagInfo = createDiceTagInfo();
			expect(tagInfo.getStripped("@dice", "2d6|2d6 fire")).toBe("2d6 fire");
		});

		it("should return dice string if no display text", () => {
			const tagInfo = createDiceTagInfo();
			expect(tagInfo.getStripped("@dice", "2d6")).toBe("2d6");
		});

		it("should handle empty content", () => {
			const tagInfo = createDiceTagInfo();
			expect(tagInfo.getStripped("@dice", "")).toBe("");
		});
	});
});
