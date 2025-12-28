import { describe, it, expect } from "vitest";
import { COLOR_HEALTHY, COLOR_HURT, COLOR_BLOODIED, COLOR_DEFEATED, copy, copyFast, checkProperty, get, set, getOrSet, deleteProperty, deleteObjectPath, merge, expand, flatten, setComposite, isNearStrictlyEqual, parseNumberRange, findCommonPrefix, findCommonSuffix, invertColor, pDelay, getWalker, GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST, } from "./misc-util.js";
describe("misc-util", () => {
    describe("color constants", () => {
        it("should export color constants", () => {
            expect(COLOR_HEALTHY).toBe("#00bb20");
            expect(COLOR_HURT).toBe("#c5ca00");
            expect(COLOR_BLOODIED).toBe("#f7a100");
            expect(COLOR_DEFEATED).toBe("#cc0000");
        });
    });
    describe("copy", () => {
        it("should deep copy object", () => {
            const obj = { a: 1, b: { c: 2 } };
            const copied = copy(obj);
            expect(copied).toEqual(obj);
            expect(copied).not.toBe(obj);
            expect(copied.b).not.toBe(obj.b);
        });
        it("should deep copy array", () => {
            const arr = [1, [2, 3], { a: 4 }];
            const copied = copy(arr);
            expect(copied).toEqual(arr);
            expect(copied).not.toBe(arr);
        });
        it("should handle isSafe option for undefined", () => {
            expect(copy(undefined, { isSafe: true })).toBeUndefined();
        });
    });
    describe("copyFast", () => {
        it("should deep copy object", () => {
            const obj = { a: 1, b: { c: 2 } };
            const copied = copyFast(obj);
            expect(copied).toEqual(obj);
            expect(copied).not.toBe(obj);
        });
        it("should return primitives as-is", () => {
            expect(copyFast(5)).toBe(5);
            expect(copyFast("hello")).toBe("hello");
            expect(copyFast(null)).toBe(null);
        });
        it("should deep copy arrays", () => {
            const arr = [1, [2, 3]];
            const copied = copyFast(arr);
            expect(copied).toEqual(arr);
            expect(copied[1]).not.toBe(arr[1]);
        });
    });
    describe("checkProperty", () => {
        it("should return true for existing path", () => {
            const obj = { a: { b: { c: 1 } } };
            expect(checkProperty(obj, "a", "b", "c")).toBe(true);
        });
        it("should return false for missing path", () => {
            const obj = { a: { b: 1 } };
            expect(checkProperty(obj, "a", "b", "c")).toBe(false);
        });
        it("should handle null object", () => {
            expect(checkProperty(null, "a")).toBe(false);
        });
    });
    describe("get", () => {
        it("should get nested value", () => {
            const obj = { a: { b: { c: 42 } } };
            expect(get(obj, "a", "b", "c")).toBe(42);
        });
        it("should return undefined for missing path", () => {
            const obj = { a: { b: 1 } };
            expect(get(obj, "a", "x", "y")).toBeUndefined();
        });
        it("should handle null object", () => {
            expect(get(null, "a")).toBeUndefined();
        });
    });
    describe("set", () => {
        it("should set nested value", () => {
            const obj = {};
            set(obj, "a", "b", "c", 42);
            expect(obj).toEqual({ a: { b: { c: 42 } } });
        });
        it("should return the set value", () => {
            const obj = {};
            expect(set(obj, "a", 42)).toBe(42);
        });
        it("should return null for null object", () => {
            expect(set(null, "a", 1)).toBe(null);
        });
        it("should return null for empty path", () => {
            expect(set({}, 1)).toBe(null);
        });
    });
    describe("getOrSet", () => {
        it("should get existing value", () => {
            const obj = { a: { b: 42 } };
            expect(getOrSet(obj, "a", "b", 99)).toBe(42);
        });
        it("should set and return new value if missing", () => {
            const obj = {};
            expect(getOrSet(obj, "a", "b", 99)).toBe(99);
            expect(obj).toEqual({ a: { b: 99 } });
        });
        it("should return null for insufficient args", () => {
            expect(getOrSet({}, 1)).toBe(null);
        });
    });
    describe("deleteProperty", () => {
        it("should delete nested property", () => {
            const obj = { a: { b: { c: 1 } } };
            deleteProperty(obj, "a", "b", "c");
            expect(obj.a.b).toEqual({});
        });
        it("should return true on success", () => {
            const obj = { a: 1 };
            expect(deleteProperty(obj, "a")).toBe(true);
        });
        it("should return false for null object", () => {
            expect(deleteProperty(null, "a")).toBe(false);
        });
    });
    describe("deleteObjectPath", () => {
        it("should delete property and clean empty parents", () => {
            const obj = { a: { b: { c: 1 } } };
            deleteObjectPath(obj, "a", "b", "c");
            expect(obj).toEqual({});
        });
        it("should not delete non-empty parents", () => {
            const obj = { a: { b: { c: 1 }, d: 2 } };
            deleteObjectPath(obj, "a", "b", "c");
            expect(obj).toEqual({ a: { d: 2 } });
        });
    });
    describe("merge", () => {
        it("should merge objects", () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { c: 3 };
            const result = merge(obj1, obj2);
            expect(result).toEqual({ a: 1, b: 2, c: 3 });
        });
        it("should deep merge nested objects", () => {
            const obj1 = { a: { b: 1, c: 2 } };
            const obj2 = { a: { d: 3 } };
            const result = merge(obj1, obj2);
            expect(result).toEqual({ a: { b: 1, c: 2, d: 3 } });
        });
        it("should overwrite with second value for conflicts", () => {
            const obj1 = { a: 1 };
            const obj2 = { a: 2 };
            const result = merge(obj1, obj2);
            expect(result).toEqual({ a: 2 });
        });
        it("should not merge arrays (overwrite)", () => {
            const obj1 = { a: [1, 2] };
            const obj2 = { a: [3, 4] };
            const result = merge(obj1, obj2);
            expect(result).toEqual({ a: [3, 4] });
        });
    });
    describe("flatten", () => {
        it("should flatten nested objects", () => {
            const obj = { a: { b: { c: 1 } } };
            expect(flatten(obj)).toEqual({ "a.b.c": 1 });
        });
        it("should handle arrays", () => {
            const obj = { a: [1, 2] };
            expect(flatten(obj)).toEqual({ a: [1, 2] });
        });
        it("should handle null/undefined", () => {
            expect(flatten(null)).toBe(null);
            expect(flatten(undefined)).toBe(undefined);
        });
        it("should handle primitives", () => {
            expect(flatten(5)).toBe(5);
        });
        it("should handle empty objects", () => {
            expect(flatten({})).toEqual({});
        });
    });
    describe("expand", () => {
        it("should expand dotted keys", () => {
            const obj = { "a.b.c": 1 };
            expect(expand(obj)).toEqual({ a: { b: { c: 1 } } });
        });
        it("should handle arrays", () => {
            const arr = [{ "a.b": 1 }];
            expect(expand(arr)).toEqual([{ a: { b: 1 } }]);
        });
        it("should handle null/undefined", () => {
            expect(expand(null)).toBe(null);
            expect(expand(undefined)).toBeUndefined();
        });
    });
    describe("setComposite", () => {
        it("should set value at dotted path", () => {
            const obj = {};
            setComposite(obj, "a.b.c", 42);
            expect(obj).toEqual({ a: { b: { c: 42 } } });
        });
        it("should return value for empty path", () => {
            expect(setComposite({}, "", 42)).toBe(42);
        });
    });
    describe("isNearStrictlyEqual", () => {
        it("should return true for equal values", () => {
            expect(isNearStrictlyEqual(5, 5)).toBe(true);
            expect(isNearStrictlyEqual("a", "a")).toBe(true);
        });
        it("should return true for both null/undefined", () => {
            expect(isNearStrictlyEqual(null, null)).toBe(true);
            expect(isNearStrictlyEqual(undefined, undefined)).toBe(true);
            expect(isNearStrictlyEqual(null, undefined)).toBe(true);
        });
        it("should return false for mismatched nullish", () => {
            expect(isNearStrictlyEqual(null, 1)).toBe(false);
            expect(isNearStrictlyEqual(1, null)).toBe(false);
        });
    });
    describe("parseNumberRange", () => {
        it("should parse single numbers", () => {
            expect(parseNumberRange("1")).toEqual(new Set([1]));
            expect(parseNumberRange("5")).toEqual(new Set([5]));
        });
        it("should parse ranges", () => {
            expect(parseNumberRange("1-3")).toEqual(new Set([1, 2, 3]));
        });
        it("should parse comma-separated values", () => {
            expect(parseNumberRange("1,3,5")).toEqual(new Set([1, 3, 5]));
        });
        it("should parse mixed", () => {
            expect(parseNumberRange("1-3,5,7-9")).toEqual(new Set([1, 2, 3, 5, 7, 8, 9]));
        });
        it("should handle whitespace", () => {
            expect(parseNumberRange(" 1 - 3 , 5 ")).toEqual(new Set([1, 2, 3, 5]));
        });
        it("should return null for empty input", () => {
            expect(parseNumberRange("")).toBe(null);
            expect(parseNumberRange(null)).toBe(null);
        });
        it("should throw for invalid input", () => {
            expect(() => parseNumberRange("abc")).toThrow();
            expect(() => parseNumberRange("1--2")).toThrow();
        });
        it("should throw for out of range", () => {
            expect(() => parseNumberRange("5", 1, 3)).toThrow(/out of range/);
        });
        it("should throw for inverted range", () => {
            expect(() => parseNumberRange("5-3")).toThrow();
        });
    });
    describe("findCommonPrefix", () => {
        it("should find common prefix", () => {
            expect(findCommonPrefix(["hello", "help", "helicopter"])).toBe("hel");
        });
        it("should return empty for no common prefix", () => {
            expect(findCommonPrefix(["abc", "xyz"])).toBe("");
        });
        it("should handle single item", () => {
            expect(findCommonPrefix(["hello"])).toBe("hello");
        });
        it("should handle empty array", () => {
            expect(findCommonPrefix([])).toBe("");
            expect(findCommonPrefix(null)).toBe("");
        });
        it("should respect word boundaries when specified", () => {
            const result = findCommonPrefix(["The Quick Fox", "The Quick Dog"], {
                isRespectWordBoundaries: true,
            });
            expect(result).toBe("The Quick ");
        });
    });
    describe("findCommonSuffix", () => {
        it("should find common suffix with word boundaries", () => {
            const result = findCommonSuffix(["Hello World", "Goodbye World"], {
                isRespectWordBoundaries: true,
            });
            expect(result).toBe(" World");
        });
        it("should throw without word boundaries", () => {
            expect(() => findCommonSuffix(["abc", "xbc"])).toThrow();
        });
    });
    describe("invertColor", () => {
        it("should invert color", () => {
            expect(invertColor("#000000")).toBe("#ffffff");
            expect(invertColor("#ffffff")).toBe("#000000");
        });
        it("should return black/white with bw option", () => {
            expect(invertColor("#ffffff", { bw: true })).toBe("#000000");
            expect(invertColor("#000000", { bw: true })).toBe("#FFFFFF");
        });
        it("should return dark/light with options", () => {
            expect(invertColor("#ffffff", { dark: "#333", light: "#eee" })).toBe("#333");
            expect(invertColor("#000000", { dark: "#333", light: "#eee" })).toBe("#eee");
        });
    });
    describe("pDelay", () => {
        it("should delay and resolve", async () => {
            const start = Date.now();
            await pDelay(50);
            expect(Date.now() - start).toBeGreaterThanOrEqual(40);
        });
        it("should resolve with value", async () => {
            const result = await pDelay(10, "value");
            expect(result).toBe("value");
        });
    });
    describe("getWalker", () => {
        describe("string handler", () => {
            it("should transform strings", () => {
                const walker = getWalker();
                const result = walker.walk({ a: "hello" }, {
                    string: (s) => s.toUpperCase(),
                });
                expect(result).toEqual({ a: "HELLO" });
            });
            it("should handle array of handlers", () => {
                const walker = getWalker();
                const result = walker.walk({ a: "hi" }, {
                    string: [(s) => s + "!", (s) => s.toUpperCase()],
                });
                expect(result).toEqual({ a: "HI!" });
            });
        });
        describe("number handler", () => {
            it("should transform numbers", () => {
                const walker = getWalker();
                const result = walker.walk({ a: 5 }, {
                    number: (n) => n * 2,
                });
                expect(result).toEqual({ a: 10 });
            });
        });
        describe("object handler", () => {
            it("should transform objects", () => {
                const walker = getWalker();
                const result = walker.walk({ a: 1 }, {
                    object: (obj) => ({ ...obj, b: 2 }),
                });
                expect(result).toEqual({ a: 1, b: 2 });
            });
            it("should throw on null return without allowDelete", () => {
                const walker = getWalker();
                expect(() => walker.walk({ a: 1 }, {
                    object: () => null,
                })).toThrow("Object handler(s) returned null!");
            });
            it("should allow null with isAllowDeleteObjects", () => {
                const walker = getWalker({ isAllowDeleteObjects: true });
                const result = walker.walk({ a: { b: 1 } }, {
                    object: (obj) => (Object.keys(obj).length ? obj : null),
                });
                expect(result).toBeDefined();
            });
        });
        describe("array handler", () => {
            it("should transform arrays", () => {
                const walker = getWalker();
                const result = walker.walk({ a: [1, 2, 3] }, {
                    array: (arr) => [...arr, 4],
                });
                expect(result).toEqual({ a: [1, 2, 3, 4] });
            });
            it("should throw on null return without allowDelete", () => {
                const walker = getWalker();
                expect(() => walker.walk({ a: [1] }, {
                    array: () => null,
                })).toThrow("Array handler(s) returned null!");
            });
        });
        describe("null handler", () => {
            it("should handle null values", () => {
                const walker = getWalker();
                const result = walker.walk({ a: null }, {
                    null: () => "was null",
                });
                expect(result).toEqual({ a: "was null" });
            });
        });
        describe("boolean handler", () => {
            it("should transform booleans", () => {
                const walker = getWalker();
                const result = walker.walk({ a: true }, {
                    boolean: (b) => !b,
                });
                expect(result).toEqual({ a: false });
            });
        });
        describe("pre/post handlers", () => {
            it("should call preString/postString", () => {
                const calls = [];
                const walker = getWalker({ isNoModification: true });
                walker.walk({ a: "test" }, {
                    preString: () => calls.push("pre"),
                    postString: () => calls.push("post"),
                });
                expect(calls).toEqual(["pre", "post"]);
            });
            it("should call preObject/postObject", () => {
                const calls = [];
                const walker = getWalker({ isNoModification: true });
                walker.walk({ a: 1 }, {
                    preObject: () => calls.push("pre"),
                    postObject: () => calls.push("post"),
                });
                expect(calls).toEqual(["pre", "post"]);
            });
        });
        describe("keyBlocklist", () => {
            it("should skip blocked keys", () => {
                const walker = getWalker({ keyBlocklist: new Set(["skip"]) });
                const calls = [];
                walker.walk({ skip: "skipped", keep: "kept" }, {
                    string: (s) => {
                        calls.push(s);
                        return s;
                    },
                });
                expect(calls).toEqual(["kept"]);
            });
        });
        describe("isDepthFirst", () => {
            it("should process children before parent", () => {
                const walker = getWalker({ isDepthFirst: true });
                const calls = [];
                walker.walk({ a: { b: "child" } }, {
                    object: (obj) => {
                        calls.push(JSON.stringify(obj));
                        return obj;
                    },
                    string: (s) => {
                        calls.push(s);
                        return s;
                    },
                });
                expect(calls[0]).toBe("child");
            });
        });
        describe("isNoModification", () => {
            it("should not modify when isNoModification is true", () => {
                const walker = getWalker({ isNoModification: true });
                const obj = { a: "original" };
                walker.walk(obj, {
                    string: () => "modified",
                });
                expect(obj.a).toBe("original");
            });
        });
        describe("isBreakOnReturn", () => {
            it("should break on truthy return with isBreakOnReturn", () => {
                const walker = getWalker({ isNoModification: true, isBreakOnReturn: true });
                const calls = [];
                walker.walk({ a: "one", b: "two", c: "three" }, {
                    string: (s) => {
                        calls.push(s);
                        if (s === "two")
                            return s;
                        return undefined;
                    },
                });
                expect(calls).toEqual(["one", "two"]);
            });
            it("should throw if isBreakOnReturn without isNoModification", () => {
                expect(() => getWalker({ isBreakOnReturn: true })).toThrow();
            });
        });
        describe("nested structures", () => {
            it("should walk nested objects and arrays", () => {
                const walker = getWalker();
                const result = walker.walk({
                    nested: {
                        arr: [1, 2, { deep: "value" }],
                    },
                }, {
                    string: (s) => s.toUpperCase(),
                    number: (n) => n * 10,
                });
                expect(result).toEqual({
                    nested: {
                        arr: [10, 20, { deep: "VALUE" }],
                    },
                });
            });
        });
    });
    describe("GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST", () => {
        it("should contain expected keys", () => {
            expect(GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST.has("name")).toBe(true);
            expect(GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST.has("source")).toBe(true);
            expect(GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST.has("type")).toBe(true);
        });
    });
});
//# sourceMappingURL=misc-util.test.js.map