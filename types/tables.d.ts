/**
 * Manual type definitions for tables.json schema.
 * Based on schema/site/tables.json v1.1.12
 */

import type {Entry, EntryTableHeaderCell, EntryTableRow} from "./entry.js";
import type {Source, Page, OtherSource, MetaBlock} from "./util.js";

export interface TablesJson {
	table: TableData[];
	_meta?: MetaBlock;
}

export type TableData = Table | TableGroup;

export interface TableBase {
	name: string;
	source: Source;
	page?: Page;
	data?: Record<string, unknown>;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	otherSources?: OtherSource[];
	chapter?: TableChapter;
}

export interface Table extends TableBase {
	type?: "table";
	caption?: string;
	isStriped?: boolean;
	isNameGenerator?: boolean;
	style?: string;
	colLabels?: (string | EntryTableHeaderCell)[];
	colLabelRows?: (string | EntryTableHeaderCell)[][];
	colStyles?: string[];
	rowLabels?: string[];
	rowStyles?: string[];
	rows: (Entry[] | EntryTableRow)[];
	footnotes?: Entry[];
}

export interface TableGroup extends TableBase {
	type: "tableGroup";
	tables: TableData[];
}

export interface TableChapter {
	name?: string;
	ordinal?: TableChapterOrdinal;
	index?: number;
}

export interface TableChapterOrdinal {
	type: "chapter" | "appendix" | "part" | "episode" | "level" | "section";
	identifier: number | string;
}
