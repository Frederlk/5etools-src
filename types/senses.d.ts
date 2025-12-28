/**
 * Manual type definitions for senses.json schema.
 * Based on schema/site/senses.json v1.0.5
 */

import type {Entry} from "./entry.js";
import type {Source, Page, ReprintedAs} from "./util.js";

export interface SensesJson {
	sense: Sense[];
}

export interface Sense {
	name: string;
	source: Source;
	entries: Entry[];
	page?: Page;
	reprintedAs?: ReprintedAs;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}
