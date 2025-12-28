/**
 * Manual type definitions for bastions.json schema.
 */

import type {Entry} from "./entry.js";
import type {
	Source, Page, Prerequisite,
	OtherSource, ReprintedAs, MetaBlock
} from "./util.js";

export interface BastionsJson {
	facility: Facility[];
	_meta?: MetaBlock;
}

export type FacilitySpace = "cramped" | "roomy" | "vast";

export type FacilityType = "basic" | "special";

export type FacilityOrder =
	| "craft"
	| "empower"
	| "harvest"
	| "maintain"
	| "recruit"
	| "research"
	| "trade";

export interface HirelingExact {
	exact: number;
	space?: FacilitySpace;
}

export interface HirelingRange {
	min: number;
	max?: number;
	space?: FacilitySpace;
}

export type Hireling = HirelingExact | HirelingRange;

export interface FacilityBase {
	name: string;
	source: Source;
	page?: Page;
	alias?: string[];
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	facilityType: FacilityType;
	level?: number;
	prerequisite?: Prerequisite[];
	space?: FacilitySpace[];
	hirelings?: Hireling[];
	orders?: FacilityOrder[];
	entries: Entry[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}

export interface FacilityCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}

export interface FacilityWithCopy {
	name?: string;
	source?: Source;
	page?: Page;
	alias?: string[];
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	facilityType?: FacilityType;
	level?: number;
	prerequisite?: Prerequisite[];
	space?: FacilitySpace[];
	hirelings?: Hireling[];
	orders?: FacilityOrder[];
	entries?: Entry[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	_copy: FacilityCopy;
}

export type Facility = FacilityBase | FacilityWithCopy;
