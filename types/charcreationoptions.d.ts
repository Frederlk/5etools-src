/**
 * Manual type definitions for charcreationoptions.json schema.
 * Based on schema/site/charcreationoptions.json v1.2.6
 */

import type {Entry} from "./entry.js";
import type {Source, Page, OtherSource, Prerequisite} from "./util.js";

export interface CharCreationOptionsJson {
	charoption?: CharCreationOption[];
}

export type CharCreationOptionType =
	| "CS"
	| "DG"
	| "OF"
	| "RF:B"
	| "SG";

export interface CharCreationOption {
	name: string;
	entries: Entry[];
	source: Source;
	optionType: (CharCreationOptionType | string)[];
	page?: Page;
	otherSources?: OtherSource[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	prerequisite?: Prerequisite[];
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}
