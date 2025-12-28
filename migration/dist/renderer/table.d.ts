import type { EntryTable, EntryTableHeaderCell, EntryTableRow } from "../../../types/entry.js";
/**
 * A table row can be either:
 * - A plain array of cells (shorthand format)
 * - An EntryTableRow object with a row property
 */
export type TableRowInput = unknown[] | EntryTableRow;
/**
 * Roll column mode for tables with dice/number first columns.
 */
export declare enum RollColMode {
    NONE = 0,
    STANDARD = 1,
    EXACT = 2,
    RESULT = 3
}
/**
 * Header row metadata - normalized array of column labels.
 */
export type HeaderRowMeta = (string | EntryTableHeaderCell)[];
/**
 * Extract the cell array from a table row.
 * Handles both plain array format and EntryTableRow object format.
 *
 * @param row - Table row in either format
 * @returns Array of cells or null if invalid
 */
export declare const getRowCells: (row: TableRowInput) => unknown[] | null;
/**
 * Get header row metadata from a table entry.
 * Normalizes colLabels and colLabelRows into a consistent array of rows.
 *
 * @param ent - Table entry
 * @returns Array of header row metadata or null if no labels
 */
export declare const getHeaderRowMetas: (ent: EntryTable) => HeaderRowMeta[] | null;
/**
 * Calculate the total span width of a header row.
 * Cells with width property are counted, others default to 1.
 *
 * @param colLabelRow - Array of column labels/headers
 * @returns Total span width
 */
export declare const getHeaderRowSpanWidth: (colLabelRow: HeaderRowMeta) => number;
/**
 * Check if a cell represents a rollable value.
 * Rollable cells are either:
 * - Cells with roll data
 * - Integer numbers
 * - Strings matching dashed number patterns (e.g., "1-4", "12")
 *
 * @param cell - Table cell value
 * @returns True if the cell is rollable
 */
export declare const isRollableCell: (cell: unknown) => boolean;
/**
 * Check if every row in a table has a rollable first cell.
 *
 * @param rows - Table rows (can be arrays or EntryTableRow objects)
 * @returns True if all rows have rollable first cells
 */
export declare const isEveryRowRollable: (rows: TableRowInput[]) => boolean;
/**
 * Determine the roll column mode for a table.
 * Checks if the first column contains dice notation or rollable values.
 *
 * @param table - Table entry
 * @param options - Options with optional pre-computed header row metas
 * @returns Roll column mode
 */
export declare const getAutoConvertedRollMode: (table: EntryTable, options?: {
    headerRowMetas?: HeaderRowMeta[] | null;
}) => RollColMode;
/**
 * Determine the roll type from a column header.
 * Checks for dice notation patterns like @dice d20 or just "d100".
 *
 * @param cell - Header cell value
 * @returns Roll column mode or null if not a dice column
 */
export declare const getColRollType: (cell: unknown) => RollColMode | null;
export interface ParsedRollCell {
    type: "cell";
    entry?: string;
    roll: {
        exact?: number;
        min?: number;
        max?: number;
        pad?: boolean;
    };
}
/**
 * Parse a roll value from a table cell.
 * Handles formats like "20", "1-4", "01-04", "95-00".
 *
 * @param value - Cell value (string or number)
 * @returns Parsed roll cell or null if not parseable
 */
export declare const parseRollCell: (value: unknown) => ParsedRollCell | null;
/**
 * Convert table rows to have parsed roll cells.
 *
 * @param rows - Table rows (can be arrays or EntryTableRow objects)
 * @returns Rows with parsed roll cells in the first column (always as arrays)
 */
export declare const convertRowsToRollable: (rows: TableRowInput[]) => unknown[][];
export interface TableColumn {
    label: string;
    width?: number;
    style?: string;
}
/**
 * Extract column metadata from a table entry.
 *
 * @param table - Table entry
 * @returns Array of column metadata
 */
export declare const getTableColumns: (table: EntryTable) => TableColumn[];
/**
 * Calculate the number of columns in a table.
 *
 * @param table - Table entry
 * @returns Column count
 */
export declare const getColumnCount: (table: EntryTable) => number;
//# sourceMappingURL=table.d.ts.map