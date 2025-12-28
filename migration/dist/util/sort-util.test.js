import { describe, it, expect } from "vitest";
import { ascSort, ascSortProp, ascSortLower, ascSortLowerProp, ascSortNumericalSuffix, ascSortLowerPropNumeric, ascSortDate, ascSortDateString, compareListNames, ascSortAtts, ascSortSize, alignmentSort, ascSortItemRarity, monTraitSort, ascSortGenericEntity, ascSortDeity, ascSortCard, ascSortEncounter, ascSortAdventure, ascSortBook, ascSortBookData, ABIL_ABVS, SIZE_ABVS, ITEM_RARITY_ORDER, } from "./sort-util.js";
describe("sort-util", () => {
    describe("ascSort", () => {
        it("should return 0 for equal values", () => {
            expect(ascSort(5, 5)).toBe(0);
            expect(ascSort("a", "a")).toBe(0);
        });
        it("should return 1 when a > b", () => {
            expect(ascSort(5, 3)).toBe(1);
            expect(ascSort("b", "a")).toBe(1);
        });
        it("should return -1 when a < b", () => {
            expect(ascSort(3, 5)).toBe(-1);
            expect(ascSort("a", "b")).toBe(-1);
        });
        it("should sort array ascending", () => {
            expect([3, 1, 4, 1, 5].sort(ascSort)).toEqual([1, 1, 3, 4, 5]);
            expect(["c", "a", "b"].sort(ascSort)).toEqual(["a", "b", "c"]);
        });
    });
    describe("ascSortProp", () => {
        it("should sort by property", () => {
            const arr = [{ val: 3 }, { val: 1 }, { val: 2 }];
            arr.sort((a, b) => ascSortProp("val", a, b));
            expect(arr).toEqual([{ val: 1 }, { val: 2 }, { val: 3 }]);
        });
    });
    describe("ascSortLower", () => {
        it("should sort case-insensitively", () => {
            const arr = ["B", "a", "C"];
            arr.sort(ascSortLower);
            expect(arr).toEqual(["a", "B", "C"]);
        });
        it("should handle null/undefined", () => {
            expect(ascSortLower(null, "a")).toBe(-1);
            expect(ascSortLower("a", null)).toBe(1);
            expect(ascSortLower(null, null)).toBe(0);
        });
    });
    describe("ascSortLowerProp", () => {
        it("should sort by property case-insensitively", () => {
            const arr = [{ name: "Banana" }, { name: "apple" }, { name: "Cherry" }];
            arr.sort((a, b) => ascSortLowerProp("name", a, b));
            expect(arr.map((x) => x.name)).toEqual(["apple", "Banana", "Cherry"]);
        });
    });
    describe("ascSortNumericalSuffix", () => {
        it("should sort numerical suffixes correctly", () => {
            const arr = ["Item 2", "Item 10", "Item 1"];
            arr.sort(ascSortNumericalSuffix);
            expect(arr).toEqual(["Item 1", "Item 2", "Item 10"]);
        });
        it("should sort by string first, then number", () => {
            const arr = ["B 1", "A 2", "A 1"];
            arr.sort(ascSortNumericalSuffix);
            expect(arr).toEqual(["A 1", "A 2", "B 1"]);
        });
        it("should handle no numerical suffix", () => {
            const arr = ["Foo", "Bar", "Baz"];
            arr.sort(ascSortNumericalSuffix);
            expect(arr).toEqual(["Bar", "Baz", "Foo"]);
        });
    });
    describe("ascSortLowerPropNumeric", () => {
        it("should sort with embedded numbers correctly", () => {
            const arr = [{ name: "Item 2" }, { name: "Item 10" }, { name: "Item 1" }];
            arr.sort((a, b) => ascSortLowerPropNumeric("name", a, b));
            expect(arr.map((x) => x.name)).toEqual(["Item 1", "Item 2", "Item 10"]);
        });
        it("should cache _sortName", () => {
            const item = { name: "Test 5" };
            ascSortLowerPropNumeric("name", item, { name: "Test 3" });
            expect(item._sortName).toBeDefined();
        });
    });
    describe("ascSortDate", () => {
        it("should sort dates descending (newer first)", () => {
            const dates = [new Date("2020-01-01"), new Date("2021-01-01"), new Date("2019-01-01")];
            dates.sort(ascSortDate);
            expect(dates[0].getFullYear()).toBe(2021);
            expect(dates[2].getFullYear()).toBe(2019);
        });
    });
    describe("ascSortDateString", () => {
        it("should sort date strings", () => {
            const arr = ["2020-01-01", "2021-01-01", "2019-01-01"];
            arr.sort(ascSortDateString);
            expect(arr[0]).toBe("2021-01-01");
            expect(arr[2]).toBe("2019-01-01");
        });
        it("should handle null values", () => {
            const arr = ["2020-01-01", null, "2019-01-01"];
            arr.sort(ascSortDateString);
            expect(arr[2]).toBe(null);
        });
    });
    describe("compareListNames", () => {
        it("should compare by name case-insensitively", () => {
            const arr = [{ name: "Banana" }, { name: "apple" }];
            arr.sort(compareListNames);
            expect(arr[0].name).toBe("apple");
        });
    });
    describe("ascSortAtts", () => {
        it("should sort D&D attributes in standard order", () => {
            const atts = ["wis", "str", "dex", "cha", "con", "int"];
            atts.sort(ascSortAtts);
            expect(atts).toEqual(["str", "dex", "con", "int", "wis", "cha"]);
        });
        it("should put 'special' at end", () => {
            const atts = ["str", "special", "dex"];
            atts.sort(ascSortAtts);
            expect(atts).toEqual(["str", "dex", "special"]);
        });
        it("should handle two specials", () => {
            expect(ascSortAtts("special", "special")).toBe(0);
        });
    });
    describe("ascSortSize", () => {
        it("should sort D&D sizes in order", () => {
            const sizes = ["M", "L", "S", "T", "H"];
            sizes.sort(ascSortSize);
            expect(sizes).toEqual(["T", "S", "M", "L", "H"]);
        });
    });
    describe("alignmentSort", () => {
        it("should put L and C first", () => {
            expect(alignmentSort("L", "G")).toBe(-1);
            expect(alignmentSort("C", "E")).toBe(-1);
        });
        it("should put G and E second", () => {
            expect(alignmentSort("G", "N")).toBe(1);
            expect(alignmentSort("E", "N")).toBe(1);
        });
        it("should return 0 for equal", () => {
            expect(alignmentSort("N", "N")).toBe(0);
        });
    });
    describe("ascSortItemRarity", () => {
        it("should sort rarities in D&D order", () => {
            const rarities = ["rare", "common", "legendary", "uncommon"];
            rarities.sort(ascSortItemRarity);
            expect(rarities).toEqual(["common", "uncommon", "rare", "legendary"]);
        });
        it("should handle unknown rarities", () => {
            const rarities = ["common", "custom"];
            rarities.sort(ascSortItemRarity);
            expect(rarities[0]).toBe("common");
        });
    });
    describe("monTraitSort", () => {
        it("should sort by sort property if present", () => {
            const traits = [{ name: "B", sort: 2 }, { name: "A", sort: 1 }];
            traits.sort(monTraitSort);
            expect(traits[0].name).toBe("A");
        });
        it("should put items with sort before those without", () => {
            const traits = [{ name: "B" }, { name: "A", sort: 1 }];
            traits.sort(monTraitSort);
            expect(traits[0].name).toBe("A");
        });
        it("should sort 'Only)' traits after regular", () => {
            const traits = [{ name: "Trait (Elf Only)" }, { name: "Regular" }];
            traits.sort(monTraitSort);
            expect(traits[0].name).toBe("Regular");
        });
        it("should put special equipment first", () => {
            const traits = [{ name: "Other" }, { name: "Special Equipment" }];
            traits.sort(monTraitSort);
            expect(traits[0].name).toBe("Special Equipment");
        });
    });
    describe("ascSortGenericEntity", () => {
        it("should sort by name then source", () => {
            const entities = [
                { name: "B", source: "PHB" },
                { name: "A", source: "DMG" },
                { name: "A", source: "PHB" },
            ];
            entities.sort(ascSortGenericEntity);
            expect(entities[0]).toEqual({ name: "A", source: "DMG" });
            expect(entities[1]).toEqual({ name: "A", source: "PHB" });
        });
    });
    describe("ascSortDeity", () => {
        it("should sort by name, source, pantheon", () => {
            const deities = [
                { name: "A", source: "PHB", pantheon: "Greek" },
                { name: "A", source: "PHB", pantheon: "Celtic" },
            ];
            deities.sort(ascSortDeity);
            expect(deities[0].pantheon).toBe("Celtic");
        });
    });
    describe("ascSortCard", () => {
        it("should sort by set, source, name", () => {
            const cards = [
                { set: "B", source: "PHB", name: "Card" },
                { set: "A", source: "PHB", name: "Card" },
            ];
            cards.sort(ascSortCard);
            expect(cards[0].set).toBe("A");
        });
    });
    describe("ascSortEncounter", () => {
        it("should sort by name, caption, level range", () => {
            const encounters = [
                { name: "A", minlvl: 5 },
                { name: "A", minlvl: 1 },
            ];
            encounters.sort(ascSortEncounter);
            expect(encounters[0].minlvl).toBe(1);
        });
    });
    describe("ascSortAdventure", () => {
        it("should sort by published date (older first due to double inversion)", () => {
            const adventures = [
                { name: "A", published: "2020-01-01" },
                { name: "B", published: "2021-01-01" },
            ];
            adventures.sort(ascSortAdventure);
            expect(adventures[0].name).toBe("A");
        });
    });
    describe("ascSortBook", () => {
        it("should sort by published date (older first due to double inversion)", () => {
            const books = [
                { name: "A", published: "2020-01-01" },
                { name: "B", published: "2021-01-01" },
            ];
            books.sort(ascSortBook);
            expect(books[0].name).toBe("A");
        });
    });
    describe("ascSortBookData", () => {
        it("should sort by id", () => {
            const data = [{ id: "b" }, { id: "a" }];
            data.sort(ascSortBookData);
            expect(data[0].id).toBe("a");
        });
    });
    describe("exported constants", () => {
        it("should export ABIL_ABVS", () => {
            expect(ABIL_ABVS).toEqual(["str", "dex", "con", "int", "wis", "cha"]);
        });
        it("should export SIZE_ABVS", () => {
            expect(SIZE_ABVS).toEqual(["F", "D", "T", "S", "M", "L", "H", "G", "C", "V"]);
        });
        it("should export ITEM_RARITY_ORDER", () => {
            expect(ITEM_RARITY_ORDER).toContain("common");
            expect(ITEM_RARITY_ORDER).toContain("legendary");
        });
    });
});
//# sourceMappingURL=sort-util.test.js.map