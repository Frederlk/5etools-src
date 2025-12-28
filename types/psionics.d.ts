/**
 * Manual type definitions for psionics.json schema.
 * Based on schema/site/psionics.json v1.2.4
 */

import type {Entry} from "./entry.js";
import type {Source, Page} from "./util.js";

export interface PsionicsJson {
	psionic: Psionic[];
}

export type PsionicType = "D" | "T";

export type PsionicOrder =
	| "Avatar"
	| "Awakened"
	| "Immortal"
	| "Nomad"
	| "Wu Jen";

export type ConcentrationUnit = "hr" | "min" | "rnd";

export interface PsionicCost {
	min: number;
	max: number;
}

export interface PsionicConcentration {
	duration: number;
	unit: ConcentrationUnit;
}

export interface PsionicSubmode {
	name: string;
	cost: PsionicCost;
	entries: Entry[];
}

export interface PsionicMode {
	name: string;
	entries: Entry[];
	cost?: PsionicCost;
	concentration?: PsionicConcentration;
	submodes?: PsionicSubmode[];
}

export interface Psionic {
	name: string;
	source: Source;
	type: PsionicType;
	page?: Page;
	focus?: string;
	order?: PsionicOrder;
	modes?: PsionicMode[];
	entries?: Entry[];
}
