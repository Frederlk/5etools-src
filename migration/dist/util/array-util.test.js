import { describe, it, expect } from "vitest";
import { last, first, joinConjunct, filterIndex, equals, segregate, partition, getNext, getPrevious, shuffle, shuffled, mergeMap, findMapped, unique, zip, nextWrap, prevWrap, sum, mean, meanAbsoluteDeviation, pMap, pSerialAwaitMap, pSerialAwaitFilter, pSerialAwaitFind, pSerialAwaitSome, pSerialAwaitFirst, pSerialAwaitReduce, } from "./array-util.js";
describe("array-util", () => {
    describe("first", () => {
        it("should return first element", () => {
            expect(first([1, 2, 3])).toBe(1);
            expect(first(["a", "b"])).toBe("a");
        });
        it("should return undefined for empty array", () => {
            expect(first([])).toBeUndefined();
        });
    });
    describe("last", () => {
        it("should return last element", () => {
            expect(last([1, 2, 3])).toBe(3);
            expect(last(["a", "b"])).toBe("b");
        });
        it("should return undefined for empty array", () => {
            expect(last([])).toBeUndefined();
        });
    });
    describe("joinConjunct", () => {
        it("should return empty string for empty array", () => {
            expect(joinConjunct([], ", ", " and ")).toBe("");
        });
        it("should return single element as-is", () => {
            expect(joinConjunct(["one"], ", ", " and ")).toBe("one");
        });
        it("should join two elements with lastJoiner", () => {
            expect(joinConjunct(["one", "two"], ", ", " and ")).toBe("one and two");
        });
        it("should use Oxford comma by default for 3+ elements", () => {
            expect(joinConjunct(["one", "two", "three"], ", ", " and ")).toBe("one, two, and three");
        });
        it("should omit Oxford comma when nonOxford=true", () => {
            expect(joinConjunct(["one", "two", "three"], ", ", " and ", true)).toBe("one, two and three");
        });
        it("should handle different joiners", () => {
            expect(joinConjunct(["a", "b", "c"], "; ", " or ")).toBe("a; b; or c");
        });
    });
    describe("filterIndex", () => {
        it("should return indices of matching elements", () => {
            expect(filterIndex([1, 2, 3, 4, 5], (x) => x % 2 === 0)).toEqual([1, 3]);
        });
        it("should return empty array when nothing matches", () => {
            expect(filterIndex([1, 3, 5], (x) => x % 2 === 0)).toEqual([]);
        });
    });
    describe("equals", () => {
        it("should return true for equal arrays", () => {
            expect(equals([1, 2, 3], [1, 2, 3])).toBe(true);
            expect(equals([1, 2, 3], [3, 2, 1])).toBe(true);
        });
        it("should return false for different arrays", () => {
            expect(equals([1, 2, 3], [1, 2, 4])).toBe(false);
            expect(equals([1, 2, 3], [1, 2])).toBe(false);
        });
        it("should handle both null/undefined", () => {
            expect(equals(null, null)).toBe(true);
        });
        it("should handle one null", () => {
            expect(equals([1], null)).toBe(false);
            expect(equals(null, [1])).toBe(false);
        });
        it("should handle empty first elements", () => {
            expect(equals([], [])).toBe(false);
        });
        it("should distinguish types", () => {
            expect(equals([1, "1"], ["1", 1])).toBe(true);
        });
    });
    describe("segregate / partition", () => {
        it("should partition array by predicate", () => {
            const [evens, odds] = segregate([1, 2, 3, 4, 5], (x) => x % 2 === 0);
            expect(evens).toEqual([2, 4]);
            expect(odds).toEqual([1, 3, 5]);
        });
        it("should handle all pass", () => {
            const [pass, fail] = partition([2, 4, 6], (x) => x % 2 === 0);
            expect(pass).toEqual([2, 4, 6]);
            expect(fail).toEqual([]);
        });
        it("should handle all fail", () => {
            const [pass, fail] = partition([1, 3, 5], (x) => x % 2 === 0);
            expect(pass).toEqual([]);
            expect(fail).toEqual([1, 3, 5]);
        });
        it("partition should be alias for segregate", () => {
            expect(partition).toBe(segregate);
        });
    });
    describe("getNext", () => {
        it("should get next element", () => {
            expect(getNext([1, 2, 3], 1)).toBe(2);
            expect(getNext([1, 2, 3], 2)).toBe(3);
        });
        it("should wrap around", () => {
            expect(getNext([1, 2, 3], 3)).toBe(1);
        });
        it("should throw if value not in array", () => {
            expect(() => getNext([1, 2, 3], 4)).toThrow("Value was not in array!");
        });
    });
    describe("getPrevious", () => {
        it("should get previous element", () => {
            expect(getPrevious([1, 2, 3], 2)).toBe(1);
            expect(getPrevious([1, 2, 3], 3)).toBe(2);
        });
        it("should wrap around", () => {
            expect(getPrevious([1, 2, 3], 1)).toBe(3);
        });
        it("should throw if value not in array", () => {
            expect(() => getPrevious([1, 2, 3], 4)).toThrow("Value was not in array!");
        });
    });
    describe("shuffle", () => {
        it("should mutate and return same array", () => {
            const arr = [1, 2, 3, 4, 5];
            const result = shuffle(arr);
            expect(result).toBe(arr);
        });
        it("should maintain all elements", () => {
            const arr = [1, 2, 3, 4, 5];
            shuffle(arr);
            expect(arr.sort()).toEqual([1, 2, 3, 4, 5]);
        });
    });
    describe("shuffled", () => {
        it("should return new array", () => {
            const arr = [1, 2, 3, 4, 5];
            const result = shuffled(arr);
            expect(result).not.toBe(arr);
        });
        it("should not mutate original", () => {
            const arr = [1, 2, 3, 4, 5];
            shuffled(arr);
            expect(arr).toEqual([1, 2, 3, 4, 5]);
        });
    });
    describe("mergeMap", () => {
        it("should merge mapped objects", () => {
            const arr = [{ a: 1 }, { b: 2 }, { c: 3 }];
            const result = mergeMap(arr, (item) => item);
            expect(result).toEqual({ a: 1, b: 2, c: 3 });
        });
        it("should filter null/undefined", () => {
            const arr = [1, 2, 3];
            const result = mergeMap(arr, (x) => (x % 2 === 0 ? { even: x } : null));
            expect(result).toEqual({ even: 2 });
        });
    });
    describe("findMapped", () => {
        it("should find first truthy mapped result", () => {
            const arr = [1, 2, 3, 4];
            const result = findMapped(arr, (x) => (x > 2 ? x * 10 : undefined));
            expect(result).toBe(30);
        });
        it("should return undefined if nothing found", () => {
            const arr = [1, 2, 3];
            const result = findMapped(arr, () => undefined);
            expect(result).toBeUndefined();
        });
    });
    describe("unique", () => {
        it("should remove duplicates", () => {
            expect(unique([1, 2, 2, 3, 1, 3])).toEqual([1, 2, 3]);
        });
        it("should handle empty array", () => {
            expect(unique([])).toEqual([]);
        });
        it("should use custom property function", () => {
            const arr = [{ id: 1 }, { id: 2 }, { id: 1 }];
            expect(unique(arr, (x) => x.id)).toEqual([{ id: 1 }, { id: 2 }]);
        });
    });
    describe("zip", () => {
        it("should zip equal length arrays", () => {
            expect(zip([1, 2, 3], ["a", "b", "c"])).toEqual([
                [1, "a"],
                [2, "b"],
                [3, "c"],
            ]);
        });
        it("should handle different length arrays", () => {
            expect(zip([1, 2], ["a", "b", "c"])).toEqual([
                [1, "a"],
                [2, "b"],
                [undefined, "c"],
            ]);
        });
        it("should handle empty arrays", () => {
            expect(zip([], [])).toEqual([]);
        });
    });
    describe("nextWrap", () => {
        it("should get next element", () => {
            expect(nextWrap([1, 2, 3], 1)).toBe(2);
        });
        it("should wrap to start", () => {
            expect(nextWrap([1, 2, 3], 3)).toBe(1);
        });
        it("should return last element if item not found", () => {
            expect(nextWrap([1, 2, 3], 4)).toBe(3);
        });
    });
    describe("prevWrap", () => {
        it("should get previous element", () => {
            expect(prevWrap([1, 2, 3], 2)).toBe(1);
        });
        it("should wrap to end", () => {
            expect(prevWrap([1, 2, 3], 1)).toBe(3);
        });
        it("should return first element if item not found", () => {
            expect(prevWrap([1, 2, 3], 4)).toBe(1);
        });
    });
    describe("sum", () => {
        it("should sum numbers", () => {
            expect(sum([1, 2, 3, 4])).toBe(10);
        });
        it("should handle empty array", () => {
            expect(sum([])).toBe(0);
        });
        it("should handle negative numbers", () => {
            expect(sum([1, -2, 3, -4])).toBe(-2);
        });
    });
    describe("mean", () => {
        it("should calculate average", () => {
            expect(mean([1, 2, 3, 4, 5])).toBe(3);
        });
        it("should handle single element", () => {
            expect(mean([10])).toBe(10);
        });
        it("should handle decimals", () => {
            expect(mean([1, 2])).toBe(1.5);
        });
    });
    describe("meanAbsoluteDeviation", () => {
        it("should calculate MAD", () => {
            expect(meanAbsoluteDeviation([1, 2, 3, 4, 5])).toBe(1.2);
        });
        it("should return 0 for identical values", () => {
            expect(meanAbsoluteDeviation([5, 5, 5])).toBe(0);
        });
    });
    describe("pMap", () => {
        it("should map in parallel", async () => {
            const result = await pMap([1, 2, 3], async (x) => x * 2);
            expect(result).toEqual([2, 4, 6]);
        });
    });
    describe("pSerialAwaitMap", () => {
        it("should map serially", async () => {
            const order = [];
            const result = await pSerialAwaitMap([1, 2, 3], async (x) => {
                order.push(x);
                return x * 2;
            });
            expect(result).toEqual([2, 4, 6]);
            expect(order).toEqual([1, 2, 3]);
        });
    });
    describe("pSerialAwaitFilter", () => {
        it("should filter serially", async () => {
            const result = await pSerialAwaitFilter([1, 2, 3, 4], async (x) => x % 2 === 0);
            expect(result).toEqual([2, 4]);
        });
    });
    describe("pSerialAwaitFind", () => {
        it("should find first match", async () => {
            const result = await pSerialAwaitFind([1, 2, 3, 4], async (x) => x > 2);
            expect(result).toBe(3);
        });
        it("should return undefined if not found", async () => {
            const result = await pSerialAwaitFind([1, 2], async (x) => x > 10);
            expect(result).toBeUndefined();
        });
    });
    describe("pSerialAwaitSome", () => {
        it("should return true if any match", async () => {
            const result = await pSerialAwaitSome([1, 2, 3], async (x) => x === 2);
            expect(result).toBe(true);
        });
        it("should return false if none match", async () => {
            const result = await pSerialAwaitSome([1, 2, 3], async (x) => x === 5);
            expect(result).toBe(false);
        });
    });
    describe("pSerialAwaitFirst", () => {
        it("should return first truthy mapped result", async () => {
            const result = await pSerialAwaitFirst([1, 2, 3], async (x) => x > 1 ? x * 10 : undefined);
            expect(result).toBe(20);
        });
        it("should return undefined if nothing found", async () => {
            const result = await pSerialAwaitFirst([1, 2], async () => undefined);
            expect(result).toBeUndefined();
        });
    });
    describe("pSerialAwaitReduce", () => {
        it("should reduce serially", async () => {
            const result = await pSerialAwaitReduce([1, 2, 3, 4], async (acc, x) => acc + x, 0);
            expect(result).toBe(10);
        });
        it("should work with complex accumulator", async () => {
            const result = await pSerialAwaitReduce(["a", "b", "c"], async (acc, x) => ({ ...acc, [x]: true }), {});
            expect(result).toEqual({ a: true, b: true, c: true });
        });
    });
});
//# sourceMappingURL=array-util.test.js.map