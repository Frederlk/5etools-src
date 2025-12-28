/**
 * Manual type definitions for encounters.json schema.
 * Based on schema/site/encounters.json v1.3.3
 */

import type {Entry} from "./entry.js";
import type {Page, Source} from "./util.js";

export interface EncounterTableRow {
	min: number;
	max: number;
	result: Entry;
	resultAttitude?: Entry;
}

interface EncounterTableBase {
	minlvl?: number;
	maxlvl?: number;
	diceExpression?: string;
	rollAttitude?: boolean;
	table: EncounterTableRow[];
	footnotes?: Entry[];
}

export interface EncounterTableWithCaption extends EncounterTableBase {
	caption?: string;
}

export interface EncounterTableWithCaptionParts extends EncounterTableBase {
	captionPrefix?: string;
	captionSuffix?: string;
}

export type EncounterTable = EncounterTableWithCaption | EncounterTableWithCaptionParts;

export interface Encounter {
	name: string;
	source: Source;
	tables: EncounterTable[];
	page?: Page;
}

export interface EncounterArray {
	encounter: Encounter[];
}
