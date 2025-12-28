import { describe, it, expect } from "vitest";
import { getRowCells, getHeaderRowMetas, getHeaderRowSpanWidth, isRollableCell, isEveryRowRollable, getAutoConvertedRollMode, getColRollType, parseRollCell, convertRowsToRollable, getTableColumns, getColumnCount, RollColMode, } from "./table.js";
describe("table", () => {
    describe("getRowCells", () => {
        it("should return null for null input", () => {
            expect(getRowCells(null)).toBe(null);
        });
        it("should return null for undefined input", () => {
            expect(getRowCells(undefined)).toBe(null);
        });
        it("should return array as-is", () => {
            const cells = ["a", "b", "c"];
            expect(getRowCells(cells)).toBe(cells);
        });
        it("should extract row property from object", () => {
            const rowObj = { type: "row", row: ["x", "y", "z"] };
            expect(getRowCells(rowObj)).toEqual(["x", "y", "z"]);
        });
        it("should return null for object without row property", () => {
            expect(getRowCells({ type: "other" })).toBe(null);
        });
        it("should return null for object with null row", () => {
            const rowObj = { type: "row", row: null };
            expect(getRowCells(rowObj)).toBe(null);
        });
        it("should handle empty array", () => {
            expect(getRowCells([])).toEqual([]);
        });
        it("should handle row with complex cell objects", () => {
            const cells = [{ roll: { exact: 1 } }, "text", 42];
            expect(getRowCells(cells)).toBe(cells);
        });
    });
    describe("getHeaderRowMetas", () => {
        it("should return null for table without labels", () => {
            const table = { type: "table", rows: [] };
            expect(getHeaderRowMetas(table)).toBe(null);
        });
        it("should return single row for colLabels", () => {
            const table = {
                type: "table",
                colLabels: ["Col A", "Col B"],
                rows: [],
            };
            expect(getHeaderRowMetas(table)).toEqual([["Col A", "Col B"]]);
        });
        it("should return multiple rows for colLabelRows", () => {
            const table = {
                type: "table",
                colLabelRows: [
                    ["Header 1", "Header 2"],
                    ["Sub A", "Sub B"],
                ],
                rows: [],
            };
            expect(getHeaderRowMetas(table)).toEqual([
                ["Header 1", "Header 2"],
                ["Sub A", "Sub B"],
            ]);
        });
        it("should prefer colLabels over colLabelRows", () => {
            const table = {
                type: "table",
                colLabels: ["Primary"],
                colLabelRows: [["Secondary"]],
                rows: [],
            };
            expect(getHeaderRowMetas(table)).toEqual([["Primary"]]);
        });
        it("should pad shorter rows to match longest", () => {
            const table = {
                type: "table",
                colLabelRows: [
                    ["A", "B", "C"],
                    ["X", "Y"],
                ],
                rows: [],
            };
            const result = getHeaderRowMetas(table);
            expect(result).toEqual([
                ["A", "B", "C"],
                ["X", "Y", ""],
            ]);
        });
        it("should handle header cells with width", () => {
            const table = {
                type: "table",
                colLabelRows: [
                    [{ type: "cell", entry: "Wide", width: 2 }, "Normal"],
                    ["A", "B", "C"],
                ],
                rows: [],
            };
            const result = getHeaderRowMetas(table);
            expect(result?.[0]).toHaveLength(2);
            expect(result?.[1]).toHaveLength(3);
        });
    });
    describe("getHeaderRowSpanWidth", () => {
        it("should count string cells as width 1", () => {
            expect(getHeaderRowSpanWidth(["A", "B", "C"])).toBe(3);
        });
        it("should use width property from header cells", () => {
            const row = [
                { type: "cell", entry: "Wide", width: 2 },
                "Normal",
            ];
            expect(getHeaderRowSpanWidth(row)).toBe(3);
        });
        it("should default to width 1 for cells without width", () => {
            const row = [{ type: "cell", entry: "Normal" }, "Text"];
            expect(getHeaderRowSpanWidth(row)).toBe(2);
        });
        it("should handle empty row", () => {
            expect(getHeaderRowSpanWidth([])).toBe(0);
        });
        it("should sum multiple wide cells", () => {
            const row = [
                { type: "cell", entry: "A", width: 3 },
                { type: "cell", entry: "B", width: 2 },
            ];
            expect(getHeaderRowSpanWidth(row)).toBe(5);
        });
    });
    describe("isRollableCell", () => {
        it("should return false for null/undefined", () => {
            expect(isRollableCell(null)).toBe(false);
            expect(isRollableCell(undefined)).toBe(false);
        });
        it("should return true for integer numbers", () => {
            expect(isRollableCell(1)).toBe(true);
            expect(isRollableCell(20)).toBe(true);
            expect(isRollableCell(100)).toBe(true);
        });
        it("should return false for non-integer numbers", () => {
            expect(isRollableCell(1.5)).toBe(false);
            expect(isRollableCell(3.14)).toBe(false);
        });
        it("should return true for numeric strings", () => {
            expect(isRollableCell("1")).toBe(true);
            expect(isRollableCell("20")).toBe(true);
            expect(isRollableCell("01")).toBe(true);
        });
        it("should return true for range strings", () => {
            expect(isRollableCell("1-4")).toBe(true);
            expect(isRollableCell("95-00")).toBe(true);
            expect(isRollableCell("01-04")).toBe(true);
        });
        it("should return true for range with en-dash", () => {
            expect(isRollableCell("1\u20134")).toBe(true);
        });
        it("should return true for range with em-dash", () => {
            expect(isRollableCell("1\u20144")).toBe(true);
        });
        it("should return true for range with minus sign", () => {
            expect(isRollableCell("1\u22124")).toBe(true);
        });
        it("should return false for non-rollable strings", () => {
            expect(isRollableCell("abc")).toBe(false);
            expect(isRollableCell("text")).toBe(false);
        });
        it("should return true for dice-like patterns starting with digit", () => {
            expect(isRollableCell("1d6")).toBe(true);
        });
        it("should return true for object with roll data", () => {
            expect(isRollableCell({ roll: { exact: 1 } })).toBe(true);
            expect(isRollableCell({ roll: { min: 1, max: 4 } })).toBe(true);
        });
        it("should return false for object without roll data", () => {
            expect(isRollableCell({ entry: "text" })).toBe(false);
            expect(isRollableCell({})).toBe(false);
        });
        it("should handle whitespace", () => {
            expect(isRollableCell("  5  ")).toBe(true);
            expect(isRollableCell(" 1-4 ")).toBe(true);
        });
    });
    describe("isEveryRowRollable", () => {
        it("should return true for all rollable rows", () => {
            const rows = [
                [1, "Effect A"],
                [2, "Effect B"],
                [3, "Effect C"],
            ];
            expect(isEveryRowRollable(rows)).toBe(true);
        });
        it("should return false if any row is not rollable", () => {
            const rows = [
                [1, "Effect A"],
                ["text", "Effect B"],
                [3, "Effect C"],
            ];
            expect(isEveryRowRollable(rows)).toBe(false);
        });
        it("should handle EntryTableRow objects", () => {
            const rows = [
                { type: "row", row: ["1-2", "Effect"] },
                { type: "row", row: ["3-4", "Effect"] },
            ];
            expect(isEveryRowRollable(rows)).toBe(true);
        });
        it("should return false for empty rows", () => {
            const rows = [[], ["1", "text"]];
            expect(isEveryRowRollable(rows)).toBe(false);
        });
        it("should return true for empty array", () => {
            expect(isEveryRowRollable([])).toBe(true);
        });
        it("should handle mixed array and object rows", () => {
            const rows = [
                [1, "A"],
                { type: "row", row: [2, "B"] },
            ];
            expect(isEveryRowRollable(rows)).toBe(true);
        });
    });
    describe("getColRollType", () => {
        it("should return null for null/undefined", () => {
            expect(getColRollType(null)).toBe(null);
            expect(getColRollType(undefined)).toBe(null);
        });
        it("should return STANDARD for dice tag", () => {
            expect(getColRollType("{@dice d20}")).toBe(RollColMode.STANDARD);
            expect(getColRollType("{@dice 1d100}")).toBe(RollColMode.STANDARD);
        });
        it("should return STANDARD for d20 tag", () => {
            expect(getColRollType("{@d20 +5}")).toBe(RollColMode.STANDARD);
        });
        it("should return STANDARD for raw dice notation", () => {
            expect(getColRollType("d20")).toBe(RollColMode.STANDARD);
            expect(getColRollType("d100")).toBe(RollColMode.STANDARD);
            expect(getColRollType("D6")).toBe(RollColMode.STANDARD);
        });
        it("should return null for non-dice text", () => {
            expect(getColRollType("Result")).toBe(null);
            expect(getColRollType("Effect")).toBe(null);
        });
        it("should return STANDARD for header cell with isRoller", () => {
            expect(getColRollType({ type: "cell", isRoller: true })).toBe(RollColMode.STANDARD);
        });
        it("should check entry string in header cell", () => {
            expect(getColRollType({ type: "cell", entry: "d20" })).toBe(RollColMode.STANDARD);
            expect(getColRollType({ type: "cell", entry: "Result" })).toBe(null);
        });
        it("should return null for non-string entry", () => {
            expect(getColRollType({ type: "cell", entry: { type: "entries" } })).toBe(null);
        });
    });
    describe("getAutoConvertedRollMode", () => {
        it("should return NONE for table without headers", () => {
            const table = { type: "table", rows: [[1, "A"]] };
            expect(getAutoConvertedRollMode(table)).toBe(RollColMode.NONE);
        });
        it("should return NONE for table with non-dice header", () => {
            const table = {
                type: "table",
                colLabels: ["Result", "Effect"],
                rows: [[1, "A"]],
            };
            expect(getAutoConvertedRollMode(table)).toBe(RollColMode.NONE);
        });
        it("should return STANDARD for dice table", () => {
            const table = {
                type: "table",
                colLabels: ["d6", "Effect"],
                rows: [
                    [1, "A"],
                    [2, "B"],
                ],
            };
            expect(getAutoConvertedRollMode(table)).toBe(RollColMode.STANDARD);
        });
        it("should return NONE if rows are not rollable", () => {
            const table = {
                type: "table",
                colLabels: ["d6", "Effect"],
                rows: [
                    ["text", "A"],
                    [2, "B"],
                ],
            };
            expect(getAutoConvertedRollMode(table)).toBe(RollColMode.NONE);
        });
        it("should return NONE for single column header", () => {
            const table = {
                type: "table",
                colLabels: ["d6"],
                rows: [[1]],
            };
            expect(getAutoConvertedRollMode(table)).toBe(RollColMode.NONE);
        });
        it("should use provided headerRowMetas", () => {
            const table = {
                type: "table",
                rows: [
                    [1, "A"],
                    [2, "B"],
                ],
            };
            const headerRowMetas = [["d6", "Effect"]];
            expect(getAutoConvertedRollMode(table, { headerRowMetas })).toBe(RollColMode.STANDARD);
        });
    });
    describe("parseRollCell", () => {
        it("should return null for null/undefined", () => {
            expect(parseRollCell(null)).toBe(null);
            expect(parseRollCell(undefined)).toBe(null);
        });
        it("should return existing roll object as-is", () => {
            const cell = { type: "cell", roll: { exact: 5 } };
            expect(parseRollCell(cell)).toBe(cell);
        });
        it("should return null for object without roll", () => {
            expect(parseRollCell({ entry: "text" })).toBe(null);
        });
        it("should parse single number", () => {
            expect(parseRollCell("12")).toEqual({
                type: "cell",
                roll: { exact: 12 },
            });
        });
        it("should parse padded number", () => {
            expect(parseRollCell("01")).toEqual({
                type: "cell",
                roll: { exact: 1, pad: true },
            });
        });
        it("should parse number range", () => {
            expect(parseRollCell("1-4")).toEqual({
                type: "cell",
                roll: { min: 1, max: 4 },
            });
        });
        it("should parse padded range", () => {
            expect(parseRollCell("01-04")).toEqual({
                type: "cell",
                roll: { min: 1, max: 4, pad: true },
            });
        });
        it("should handle 95-00 as 95-100", () => {
            expect(parseRollCell("95-00")).toEqual({
                type: "cell",
                roll: { min: 95, max: 100, pad: true },
            });
        });
        it("should parse with en-dash", () => {
            expect(parseRollCell("1\u20134")).toEqual({
                type: "cell",
                roll: { min: 1, max: 4 },
            });
        });
        it("should parse 'X or lower' format", () => {
            expect(parseRollCell("20 or lower")).toEqual({
                type: "cell",
                entry: "20 or lower",
                roll: { min: Number.MIN_SAFE_INTEGER, max: 20 },
            });
        });
        it("should parse 'X or higher' format", () => {
            expect(parseRollCell("99 or higher")).toEqual({
                type: "cell",
                entry: "99 or higher",
                roll: { min: 99, max: Number.MAX_SAFE_INTEGER },
            });
        });
        it("should handle case-insensitive 'or lower/higher'", () => {
            expect(parseRollCell("5 OR LOWER")?.roll?.max).toBe(5);
            expect(parseRollCell("95 OR HIGHER")?.roll?.min).toBe(95);
        });
        it("should return null for non-parseable string", () => {
            expect(parseRollCell("text")).toBe(null);
            expect(parseRollCell("abc-def")).toBe(null);
        });
        it("should parse number input", () => {
            expect(parseRollCell(5)).toEqual({
                type: "cell",
                roll: { exact: 5 },
            });
        });
        it("should handle whitespace", () => {
            expect(parseRollCell("  12  ")).toEqual({
                type: "cell",
                roll: { exact: 12 },
            });
        });
    });
    describe("convertRowsToRollable", () => {
        it("should convert first cell to roll object", () => {
            const rows = [
                ["1", "Effect A"],
                ["2-3", "Effect B"],
            ];
            const result = convertRowsToRollable(rows);
            expect(result[0][0]).toEqual({ type: "cell", roll: { exact: 1 } });
            expect(result[1][0]).toEqual({ type: "cell", roll: { min: 2, max: 3 } });
        });
        it("should preserve non-rollable first cells", () => {
            const rows = [
                ["text", "A"],
                [1, "B"],
            ];
            const result = convertRowsToRollable(rows);
            expect(result[0][0]).toBe("text");
            expect(result[1][0]).toEqual({ type: "cell", roll: { exact: 1 } });
        });
        it("should handle EntryTableRow objects", () => {
            const rows = [{ type: "row", row: ["5", "Effect"] }];
            const result = convertRowsToRollable(rows);
            expect(result[0][0]).toEqual({ type: "cell", roll: { exact: 5 } });
        });
        it("should preserve rest of row", () => {
            const rows = [[1, "A", "B", "C"]];
            const result = convertRowsToRollable(rows);
            expect(result[0]).toEqual([{ type: "cell", roll: { exact: 1 } }, "A", "B", "C"]);
        });
        it("should handle empty rows", () => {
            const rows = [[], ["1", "A"]];
            const result = convertRowsToRollable(rows);
            expect(result[0]).toEqual([]);
        });
        it("should handle null row cells", () => {
            const rows = [{ type: "row", row: null }];
            const result = convertRowsToRollable(rows);
            expect(result[0]).toEqual([]);
        });
    });
    describe("getTableColumns", () => {
        it("should return empty array for table without headers", () => {
            const table = { type: "table", rows: [] };
            expect(getTableColumns(table)).toEqual([]);
        });
        it("should extract columns from colLabels", () => {
            const table = {
                type: "table",
                colLabels: ["A", "B", "C"],
                rows: [],
            };
            expect(getTableColumns(table)).toEqual([
                { label: "A", style: undefined },
                { label: "B", style: undefined },
                { label: "C", style: undefined },
            ]);
        });
        it("should include colStyles", () => {
            const table = {
                type: "table",
                colLabels: ["A", "B"],
                colStyles: ["col-1", "col-2"],
                rows: [],
            };
            expect(getTableColumns(table)).toEqual([
                { label: "A", style: "col-1" },
                { label: "B", style: "col-2" },
            ]);
        });
        it("should extract width from header cells", () => {
            const table = {
                type: "table",
                colLabelRows: [[{ type: "cell", entry: "Wide", width: 2 }, "Normal"]],
                rows: [],
            };
            expect(getTableColumns(table)).toEqual([
                { label: "Wide", width: 2, style: undefined },
                { label: "Normal", style: undefined },
            ]);
        });
        it("should use bottom row of multi-row headers", () => {
            const table = {
                type: "table",
                colLabelRows: [
                    ["Top A", "Top B"],
                    ["Bottom A", "Bottom B"],
                ],
                rows: [],
            };
            expect(getTableColumns(table)).toEqual([
                { label: "Bottom A", style: undefined },
                { label: "Bottom B", style: undefined },
            ]);
        });
        it("should handle non-string entry in header cell", () => {
            const table = {
                type: "table",
                colLabelRows: [[{ type: "cell", entry: { type: "entries" } }]],
                rows: [],
            };
            expect(getTableColumns(table)).toEqual([{ label: "", style: undefined }]);
        });
    });
    describe("getColumnCount", () => {
        it("should return 0 for empty table", () => {
            const table = { type: "table", rows: [] };
            expect(getColumnCount(table)).toBe(0);
        });
        it("should count from colLabels", () => {
            const table = {
                type: "table",
                colLabels: ["A", "B", "C"],
                rows: [],
            };
            expect(getColumnCount(table)).toBe(3);
        });
        it("should count span width from header rows", () => {
            const table = {
                type: "table",
                colLabelRows: [[{ type: "cell", entry: "Wide", width: 2 }, "Normal"]],
                rows: [],
            };
            expect(getColumnCount(table)).toBe(3);
        });
        it("should fall back to first row length", () => {
            const table = {
                type: "table",
                rows: [["A", "B", "C", "D"]],
            };
            expect(getColumnCount(table)).toBe(4);
        });
        it("should prefer colLabels over first row", () => {
            const table = {
                type: "table",
                colLabels: ["A", "B"],
                rows: [["X", "Y", "Z"]],
            };
            expect(getColumnCount(table)).toBe(2);
        });
    });
    describe("RollColMode enum", () => {
        it("should have expected values", () => {
            expect(RollColMode.NONE).toBe(0);
            expect(RollColMode.STANDARD).toBe(1);
            expect(RollColMode.EXACT).toBe(2);
            expect(RollColMode.RESULT).toBe(3);
        });
    });
});
//# sourceMappingURL=table.test.js.map