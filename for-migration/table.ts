// Table Utilities - TypeScript implementation
// Migrated from js/render.js Renderer.table class

import type { EntryTable, EntryTableHeaderCell, EntryTableCell, EntryTableRow } from "./entry.js";
import { copyFast } from "./misc-util.js";

// ============ Types ============

/**
 * A table row can be either:
 * - A plain array of cells (shorthand format)
 * - An EntryTableRow object with a row property
 */
export type TableRowInput = unknown[] | EntryTableRow;

/**
 * Roll column mode for tables with dice/number first columns.
 */
export enum RollColMode {
	NONE = 0,
	STANDARD = 1,
	EXACT = 2,
	RESULT = 3,
}

/**
 * Header row metadata - normalized array of column labels.
 */
export type HeaderRowMeta = (string | EntryTableHeaderCell)[];

// ============ Constants ============

const RE_TABLE_ROW_DASHED_NUMBERS = /^\d+([-\u2012-\u2014\u2212]\d+)?/;

// ============ Row Helper Functions ============

/**
 * Extract the cell array from a table row.
 * Handles both plain array format and EntryTableRow object format.
 *
 * @param row - Table row in either format
 * @returns Array of cells or null if invalid
 */
export const getRowCells = (row: TableRowInput): unknown[] | null => {
	if (row == null) return null;
	if (Array.isArray(row)) return row;
	if (typeof row === "object" && "row" in row) {
		return (row as EntryTableRow).row ?? null;
	}
	return null;
};

// ============ Header Row Functions ============

/**
 * Get header row metadata from a table entry.
 * Normalizes colLabels and colLabelRows into a consistent array of rows.
 *
 * @param ent - Table entry
 * @returns Array of header row metadata or null if no labels
 */
export const getHeaderRowMetas = (ent: EntryTable): HeaderRowMeta[] | null => {
	if (!ent.colLabels?.length && !ent.colLabelRows?.length) return null;

	// Simple case: single row of column labels
	if (ent.colLabels?.length) return [ent.colLabels];

	// Multiple header rows
	const colLabelRows = ent.colLabelRows as HeaderRowMeta[];

	// Calculate widths for each row
	const lenPer = colLabelRows.map(row => getHeaderRowSpanWidth(row));
	const lenMax = Math.max(...lenPer);

	// If all rows have the same width, return as-is
	if (lenPer.every(len => len === lenMax)) return colLabelRows;

	// Pad shorter rows to match the longest
	const cpy = copyFast(colLabelRows);
	cpy.forEach((row, i) => {
		const len = lenPer[i];
		for (let j = len; j < lenMax; ++j) {
			row.push("");
		}
	});

	return cpy;
};

/**
 * Calculate the total span width of a header row.
 * Cells with width property are counted, others default to 1.
 *
 * @param colLabelRow - Array of column labels/headers
 * @returns Total span width
 */
export const getHeaderRowSpanWidth = (colLabelRow: HeaderRowMeta): number => {
	return colLabelRow.reduce((acc: number, cell) => {
		if (typeof cell === "object" && cell !== null && "type" in cell) {
			const headerCell = cell as EntryTableHeaderCell;
			return acc + (headerCell.width ?? 1);
		}
		return acc + 1;
	}, 0);
};

// ============ Roll Detection Functions ============

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
export const isRollableCell = (cell: unknown): boolean => {
	if (cell == null) return false;

	// Object cells with roll data
	if (typeof cell === "object" && cell !== null) {
		const cellObj = cell as EntryTableCell;
		if (cellObj.roll) return true;
		return false;
	}

	// Integer numbers are rollable
	if (typeof cell === "number") return Number.isInteger(cell);

	// String patterns like "1-4", "20", "01-04"
	if (typeof cell === "string") {
		return RE_TABLE_ROW_DASHED_NUMBERS.test(cell.trim());
	}

	return false;
};

/**
 * Check if every row in a table has a rollable first cell.
 *
 * @param rows - Table rows (can be arrays or EntryTableRow objects)
 * @returns True if all rows have rollable first cells
 */
export const isEveryRowRollable = (rows: TableRowInput[]): boolean => {
	return rows.every(row => {
		const cells = getRowCells(row);
		if (!cells || !cells.length) return false;
		const [cell] = cells;
		return isRollableCell(cell);
	});
};

/**
 * Determine the roll column mode for a table.
 * Checks if the first column contains dice notation or rollable values.
 *
 * @param table - Table entry
 * @param options - Options with optional pre-computed header row metas
 * @returns Roll column mode
 */
export const getAutoConvertedRollMode = (
	table: EntryTable,
	options: { headerRowMetas?: HeaderRowMeta[] | null } = {}
): RollColMode => {
	const headerRowMetas = options.headerRowMetas ?? getHeaderRowMetas(table);

	if (!headerRowMetas) return RollColMode.NONE;

	const headerRowMetaBottom = headerRowMetas[headerRowMetas.length - 1];
	if (!headerRowMetaBottom || headerRowMetaBottom.length < 2) return RollColMode.NONE;

	const [cellFirst] = headerRowMetaBottom;

	// Check if first column header contains dice notation
	const rollColMode = getColRollType(cellFirst);
	if (!rollColMode) return RollColMode.NONE;

	// Verify all rows have rollable first cells
	if (!table.rows || !isEveryRowRollable(table.rows as TableRowInput[])) {
		return RollColMode.NONE;
	}

	return rollColMode;
};

/**
 * Determine the roll type from a column header.
 * Checks for dice notation patterns like @dice d20 or just "d100".
 *
 * @param cell - Header cell value
 * @returns Roll column mode or null if not a dice column
 */
export const getColRollType = (cell: unknown): RollColMode | null => {
	if (cell == null) return null;

	let text: string;
	if (typeof cell === "string") {
		text = cell;
	} else if (typeof cell === "object" && cell !== null) {
		const headerCell = cell as EntryTableHeaderCell;
		if (headerCell.isRoller) return RollColMode.STANDARD;
		if (typeof headerCell.entry === "string") {
			text = headerCell.entry;
		} else {
			return null;
		}
	} else {
		return null;
	}

	// Check for dice tag patterns
	if (/{@dice\s+[^}]+}/.test(text)) return RollColMode.STANDARD;
	if (/{@d20\s+[^}]+}/.test(text)) return RollColMode.STANDARD;

	// Check for raw dice notation
	if (/^d\d+$/i.test(text.trim())) return RollColMode.STANDARD;

	return null;
};

// ============ Table Parsing Functions ============

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
export const parseRollCell = (value: unknown): ParsedRollCell | null => {
	if (value == null) return null;

	// Already parsed
	if (typeof value === "object" && value !== null) {
		const cell = value as EntryTableCell;
		if (cell.roll) return value as ParsedRollCell;
		return null;
	}

	const cleanRow = String(value).trim();

	// Format: "20 or lower" or "99 or higher"
	const mLowHigh = /^(\d+) or (lower|higher)$/i.exec(cleanRow);
	if (mLowHigh) {
		const result: ParsedRollCell = {
			type: "cell",
			entry: cleanRow,
			roll: {},
		};

		if (mLowHigh[2].toLowerCase() === "lower") {
			result.roll = {
				min: Number.MIN_SAFE_INTEGER,
				max: Number(mLowHigh[1]),
			};
		} else {
			result.roll = {
				min: Number(mLowHigh[1]),
				max: Number.MAX_SAFE_INTEGER,
			};
		}

		return result;
	}

	// Format: "95-00" or "12" or "1-4"
	// u2012 = figure dash; u2013 = en-dash; u2014 = em dash; u2212 = minus sign
	const m = /^(\d+)([-\u2012-\u2014\u2212](\d+))?$/.exec(cleanRow);
	if (m) {
		// Single number: "12"
		if (m[1] && !m[2]) {
			const result: ParsedRollCell = {
				type: "cell",
				roll: {
					exact: Number(m[1]),
				},
			};
			// Preserve padding for numbers like "01"
			if (m[1][0] === "0") result.roll.pad = true;
			return result;
		}

		// Range: "1-4" or "95-00"
		if (m[1] && m[3]) {
			let min = Number(m[1]);
			let max = Number(m[3]);

			// Handle "95-00" meaning 95-100
			if (max === 0) max = 100;

			const result: ParsedRollCell = {
				type: "cell",
				roll: {
					min,
					max,
				},
			};

			// Preserve padding
			if (m[1][0] === "0" || m[3][0] === "0") result.roll.pad = true;

			return result;
		}
	}

	return null;
};

/**
 * Convert table rows to have parsed roll cells.
 *
 * @param rows - Table rows (can be arrays or EntryTableRow objects)
 * @returns Rows with parsed roll cells in the first column (always as arrays)
 */
export const convertRowsToRollable = (rows: TableRowInput[]): unknown[][] => {
	return rows.map(row => {
		const cells = getRowCells(row);
		if (!cells || !cells.length) return cells ?? [];

		const [first, ...rest] = cells;
		const parsed = parseRollCell(first);

		if (parsed) {
			return [parsed, ...rest];
		}

		return cells;
	});
};

// ============ Table Formatting Functions ============

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
export const getTableColumns = (table: EntryTable): TableColumn[] => {
	const headerRowMetas = getHeaderRowMetas(table);
	if (!headerRowMetas?.length) return [];

	// Use the bottom row of headers
	const bottomRow = headerRowMetas[headerRowMetas.length - 1];
	const styles = table.colStyles || [];

	return bottomRow.map((cell, i) => {
		if (typeof cell === "string") {
			return {
				label: cell,
				style: styles[i],
			};
		}

		const headerCell = cell as EntryTableHeaderCell;
		return {
			label: typeof headerCell.entry === "string" ? headerCell.entry : "",
			width: headerCell.width,
			style: styles[i],
		};
	});
};

/**
 * Calculate the number of columns in a table.
 *
 * @param table - Table entry
 * @returns Column count
 */
export const getColumnCount = (table: EntryTable): number => {
	// Try column labels first
	if (table.colLabels?.length) return table.colLabels.length;

	// Try column label rows
	const headerRowMetas = getHeaderRowMetas(table);
	if (headerRowMetas?.length) {
		return getHeaderRowSpanWidth(headerRowMetas[headerRowMetas.length - 1]);
	}

	// Fall back to first row length
	if (table.rows?.length) {
		const firstRow = table.rows[0];
		if (Array.isArray(firstRow)) return firstRow.length;
	}

	return 0;
};
