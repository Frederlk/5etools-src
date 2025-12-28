import { describe, it, expect } from "vitest";
import {
	uppercaseFirst,
	lowercaseFirst,
	toTitleCase,
	padNumber,
	ellipsisTruncate,
	escapeQuotes,
	unescapeQuotes,
	qq,
	uq,
	encodeApos,
	toUrlified,
	escapeRegexp,
	isNumeric,
	last,
	toCamelCase,
	toSentenceCase,
	toChunks,
	toAscii,
	trimChar,
	trimAnyChar,
	countSubstring,
	distance,
	toSingle,
	toPlural,
	getNextDuplicateName,
	COMMAS_NOT_IN_PARENTHESES_REGEX,
	COMMA_SPACE_NOT_IN_PARENTHESES_REGEX,
	SEMICOLON_SPACE_NOT_IN_PARENTHESES_REGEX,
} from "./str-util.js";

describe("str-util", () => {
	describe("uppercaseFirst", () => {
		it("should uppercase first character", () => {
			expect(uppercaseFirst("hello")).toBe("Hello");
		});

		it("should handle single character", () => {
			expect(uppercaseFirst("h")).toBe("H");
		});

		it("should handle empty string", () => {
			expect(uppercaseFirst("")).toBe("");
		});

		it("should preserve rest of string", () => {
			expect(uppercaseFirst("hELLO")).toBe("HELLO");
		});

		it("should handle already uppercase", () => {
			expect(uppercaseFirst("Hello")).toBe("Hello");
		});
	});

	describe("lowercaseFirst", () => {
		it("should lowercase first character", () => {
			expect(lowercaseFirst("Hello")).toBe("hello");
		});

		it("should handle single character", () => {
			expect(lowercaseFirst("H")).toBe("h");
		});

		it("should handle empty string", () => {
			expect(lowercaseFirst("")).toBe("");
		});

		it("should preserve rest of string", () => {
			expect(lowercaseFirst("HELLO")).toBe("hELLO");
		});
	});

	describe("toTitleCase", () => {
		it("should capitalize words", () => {
			expect(toTitleCase("the quick brown fox")).toBe("The Quick Brown Fox");
		});

		it("should handle lowercase articles mid-sentence", () => {
			expect(toTitleCase("the lord of the rings")).toBe("The Lord of the Rings");
		});

		it("should uppercase special abbreviations", () => {
			expect(toTitleCase("the npc guide")).toBe("The NPC Guide");
			expect(toTitleCase("a dm handbook")).toBe("A DM Handbook");
		});

		it("should handle D&D", () => {
			expect(toTitleCase("d&d adventure")).toBe("D&D Adventure");
		});

		it("should handle post-punctuation capitalization", () => {
			expect(toTitleCase("hello. world")).toBe("Hello. World");
			expect(toTitleCase("hello! world")).toBe("Hello! World");
			expect(toTitleCase("hello? world")).toBe("Hello? World");
		});
	});

	describe("padNumber", () => {
		it("should pad with zeros by default", () => {
			expect(padNumber(5, 3)).toBe("005");
			expect(padNumber(42, 4)).toBe("0042");
		});

		it("should use custom padder", () => {
			expect(padNumber(5, 3, " ")).toBe("  5");
		});

		it("should not truncate if already long enough", () => {
			expect(padNumber(12345, 3)).toBe("12345");
		});
	});

	describe("ellipsisTruncate", () => {
		it("should not truncate short strings", () => {
			expect(ellipsisTruncate("hello", 5, 0, 20)).toBe("hello");
		});

		it("should truncate with ellipsis", () => {
			expect(ellipsisTruncate("hello world foo bar", 5, 0, 10)).toBe("hello w...");
		});

		it("should not truncate when length equals maxLen", () => {
			expect(ellipsisTruncate("hello world!", 5, 1, 12)).toBe("hello world!");
		});

		it("should truncate long string with suffix preservation", () => {
			expect(ellipsisTruncate("hello world this is long!", 5, 1, 15)).toBe("hello world...!");
		});
	});

	describe("escapeQuotes / unescapeQuotes", () => {
		it("should escape HTML entities", () => {
			expect(escapeQuotes("<div class=\"test\">It's & fine</div>")).toBe(
				"&lt;div class=&quot;test&quot;&gt;It&apos;s &amp; fine&lt;/div&gt;"
			);
		});

		it("should unescape HTML entities", () => {
			expect(unescapeQuotes("&lt;div&gt;&amp;&apos;&quot;&lt;/div&gt;")).toBe(
				"<div>&'\"</div>"
			);
		});

		it("qq and uq should be aliases", () => {
			expect(qq).toBe(escapeQuotes);
			expect(uq).toBe(unescapeQuotes);
		});
	});

	describe("encodeApos", () => {
		it("should encode apostrophes", () => {
			expect(encodeApos("it's fine")).toBe("it%27s fine");
		});
	});

	describe("toUrlified", () => {
		it("should lowercase and encode", () => {
			expect(toUrlified("Hello World")).toBe("hello%20world");
		});

		it("should handle special characters", () => {
			expect(toUrlified("Test & Demo")).toBe("test%20%26%20demo");
		});
	});

	describe("escapeRegexp", () => {
		it("should escape regex special characters", () => {
			expect(escapeRegexp("test.*()+?[]{}|^$\\")).toBe(
				"test\\.\\*\\(\\)\\+\\?\\[\\]\\{\\}\\|\\^\\$\\\\"
			);
		});
	});

	describe("isNumeric", () => {
		it("should return true for numeric strings", () => {
			expect(isNumeric("123")).toBe(true);
			expect(isNumeric("3.14")).toBe(true);
			expect(isNumeric("-42")).toBe(true);
		});

		it("should return false for non-numeric strings", () => {
			expect(isNumeric("abc")).toBe(false);
			expect(isNumeric("12abc")).toBe(false);
			expect(isNumeric("")).toBe(false);
			expect(isNumeric("Infinity")).toBe(false);
		});
	});

	describe("last", () => {
		it("should return last character", () => {
			expect(last("hello")).toBe("o");
			expect(last("a")).toBe("a");
		});
	});

	describe("toCamelCase", () => {
		it("should convert to camelCase", () => {
			expect(toCamelCase("hello world")).toBe("helloWorld");
			expect(toCamelCase("The Quick Fox")).toBe("theQuickFox");
		});
	});

	describe("toSentenceCase", () => {
		it("should capitalize first letter of each sentence", () => {
			expect(toSentenceCase("hello world. this is a test.")).toBe(
				"Hello world. This is a test."
			);
		});

		it("should handle different punctuation", () => {
			expect(toSentenceCase("hello! how are you? fine.")).toBe(
				"Hello! How are you? Fine."
			);
		});
	});

	describe("toChunks", () => {
		it("should split into chunks", () => {
			expect(toChunks("abcdefgh", 3)).toEqual(["abc", "def", "gh"]);
		});

		it("should handle exact division", () => {
			expect(toChunks("abcd", 2)).toEqual(["ab", "cd"]);
		});

		it("should handle size larger than string", () => {
			expect(toChunks("ab", 5)).toEqual(["ab"]);
		});
	});

	describe("toAscii", () => {
		it("should convert accented characters", () => {
			expect(toAscii("cafe")).toBe("cafe");
			expect(toAscii("cafe\u0301")).toBe("cafe");
		});

		it("should handle ligatures", () => {
			expect(toAscii("Aethelred")).toBe("Aethelred");
			expect(toAscii("AEthelred")).toBe("AEthelred");
		});
	});

	describe("trimChar", () => {
		it("should trim specific character from both ends", () => {
			expect(trimChar("///path/to/file///", "/")).toBe("path/to/file");
		});

		it("should not trim if char not present", () => {
			expect(trimChar("hello", "/")).toBe("hello");
		});

		it("should handle all same char", () => {
			expect(trimChar("////", "/")).toBe("");
		});
	});

	describe("trimAnyChar", () => {
		it("should trim any of the specified characters", () => {
			expect(trimAnyChar("--hello--", "-=")).toBe("hello");
			expect(trimAnyChar("=-=hello=-=", "-=")).toBe("hello");
		});
	});

	describe("countSubstring", () => {
		it("should count occurrences", () => {
			expect(countSubstring("banana", "a")).toBe(3);
			expect(countSubstring("hello world", "l")).toBe(3);
		});

		it("should handle no matches", () => {
			expect(countSubstring("hello", "x")).toBe(0);
		});

		it("should escape regex special chars", () => {
			expect(countSubstring("a.b.c", ".")).toBe(2);
		});
	});

	describe("distance (Damerau-Levenshtein)", () => {
		it("should return 0 for identical strings", () => {
			expect(distance("hello", "hello")).toBe(0);
		});

		it("should calculate substitution distance", () => {
			expect(distance("cat", "bat")).toBe(1);
		});

		it("should calculate insertion distance", () => {
			expect(distance("cat", "cats")).toBe(1);
		});

		it("should calculate deletion distance", () => {
			expect(distance("cats", "cat")).toBe(1);
		});

		it("should calculate transposition distance", () => {
			expect(distance("ab", "ba")).toBe(1);
		});

		it("should handle empty strings", () => {
			expect(distance("", "hello")).toBe(5);
			expect(distance("hello", "")).toBe(5);
			expect(distance("", "")).toBe(0);
		});
	});

	describe("toPlural", () => {
		it("should handle regular plurals", () => {
			expect(toPlural("cat")).toBe("cats");
			expect(toPlural("dog")).toBe("dogs");
		});

		it("should handle -s, -x, -z endings", () => {
			expect(toPlural("bus")).toBe("buses");
			expect(toPlural("box")).toBe("boxes");
			expect(toPlural("fuzz")).toBe("fuzzes");
		});

		it("should handle -ch, -sh endings", () => {
			expect(toPlural("church")).toBe("churches");
			expect(toPlural("wish")).toBe("wishes");
		});

		it("should handle consonant + y endings", () => {
			expect(toPlural("baby")).toBe("babies");
			expect(toPlural("city")).toBe("cities");
		});

		it("should handle irregular plurals", () => {
			expect(toPlural("child")).toBe("children");
			expect(toPlural("man")).toBe("men");
			expect(toPlural("woman")).toBe("women");
			expect(toPlural("die")).toBe("dice");
			expect(toPlural("elf")).toBe("elves");
			expect(toPlural("dwarf")).toBe("dwarves");
		});

		it("should handle D&D-specific irregulars", () => {
			expect(toPlural("drow")).toBe("drow");
			expect(toPlural("kenku")).toBe("kenku");
			expect(toPlural("djinni")).toBe("djinn");
			expect(toPlural("slaad")).toBe("slaadi");
		});

		it("should preserve case", () => {
			expect(toPlural("Child")).toBe("Children");
			expect(toPlural("CHILD")).toBe("CHILDREN");
		});
	});

	describe("toSingle", () => {
		it("should handle regular singulars", () => {
			expect(toSingle("cats")).toBe("cat");
			expect(toSingle("dogs")).toBe("dog");
		});

		it("should handle -es endings", () => {
			expect(toSingle("buses")).toBe("bus");
			expect(toSingle("boxes")).toBe("box");
			expect(toSingle("churches")).toBe("church");
			expect(toSingle("wishes")).toBe("wish");
		});

		it("should handle -ies endings", () => {
			expect(toSingle("babies")).toBe("baby");
			expect(toSingle("cities")).toBe("city");
		});

		it("should handle irregular singulars", () => {
			expect(toSingle("children")).toBe("child");
			expect(toSingle("men")).toBe("man");
			expect(toSingle("women")).toBe("woman");
			expect(toSingle("dice")).toBe("die");
			expect(toSingle("elves")).toBe("elf");
		});

		it("should handle axes -> axe pattern", () => {
			expect(toSingle("axes")).toBe("axe");
		});
	});

	describe("getNextDuplicateName", () => {
		it("should add (1) to name without ordinal", () => {
			expect(getNextDuplicateName("Item")).toBe("Item (1)");
		});

		it("should increment existing ordinal", () => {
			expect(getNextDuplicateName("Item (1)")).toBe("Item (2)");
			expect(getNextDuplicateName("Item (5)")).toBe("Item (6)");
		});

		it("should handle null input", () => {
			expect(getNextDuplicateName(null)).toBe(null);
		});

		it("should trim whitespace", () => {
			expect(getNextDuplicateName("  Item (3)  ")).toBe("Item (4)");
		});
	});

	describe("regex constants", () => {
		it("COMMAS_NOT_IN_PARENTHESES_REGEX should split correctly", () => {
			const str = "a, b, c (d, e), f";
			const result = str.split(COMMAS_NOT_IN_PARENTHESES_REGEX);
			expect(result).toEqual(["a", "b", "c (d, e)", "f"]);
		});

		it("COMMA_SPACE_NOT_IN_PARENTHESES_REGEX should split correctly", () => {
			const str = "a, b, c (d, e), f";
			const result = str.split(COMMA_SPACE_NOT_IN_PARENTHESES_REGEX);
			expect(result).toEqual(["a", "b", "c (d, e)", "f"]);
		});

		it("SEMICOLON_SPACE_NOT_IN_PARENTHESES_REGEX should split correctly", () => {
			const str = "a; b; c (d; e); f";
			const result = str.split(SEMICOLON_SPACE_NOT_IN_PARENTHESES_REGEX);
			expect(result).toEqual(["a", "b", "c (d; e)", "f"]);
		});
	});
});
