/**
 * Manual type definitions for actions.json schema.
 */

import type {Entry} from "./entry.js";
import type {Source, Page, OtherSource, ReprintedAs} from "./util.js";

export interface ActionsJson {
	action?: Action[];
	_meta?: ActionsMeta;
}

export interface ActionsMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface Action {
	name: string;
	source: Source;
	page?: Page;
	alias?: string[];
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	isReprinted?: true;
	time?: ActionTime[];
	entries?: Entry[];
	seeAlsoAction?: string[];
	fromVariant?: string;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	_copy?: ActionCopy;
}

export interface ActionTime {
	number: number;
	unit: TimeUnit;
	condition?: string;
}

export type TimeUnit =
	| "action" | "bonus" | "reaction" | "round"
	| "minute" | "hour" | "day" | "week" | "year";

export interface ActionCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}
