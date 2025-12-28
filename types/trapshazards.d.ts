/**
 * Manual type definitions for trapshazards.json schema.
 * Based on schema/site/trapshazards.json v1.4.8
 */

import type {Entry} from "./entry.js";
import type {Source, Page, OtherSource, ReprintedAs} from "./util.js";

export interface TrapshazardsJson {
	trap?: Trap[];
	hazard?: Hazard[];
}

export type TrapHazardTier = 1 | 2 | 3 | 4;

export interface TrapLevel {
	min?: number;
	max?: number;
}

export type TrapHazardThreat =
	| "nuisance"
	| "setback"
	| "moderate"
	| "dangerous"
	| "deadly";

export type TrapHazardRatingItem =
	| TrapHazardRatingWithLevel
	| TrapHazardRatingWithTier;

export interface TrapHazardRatingWithLevel {
	level?: TrapLevel;
	threat: TrapHazardThreat;
}

export interface TrapHazardRatingWithTier {
	tier?: TrapHazardTier;
	threat: TrapHazardThreat;
}

export type TrapHazardRating = TrapHazardRatingItem[];

export type TrapTrigger = Entry[];

export type DurationEffectType = "instant" | "timed" | "permanent" | "special";

export type DurationUnit =
	| "turn"
	| "round"
	| "minute"
	| "hour"
	| "day"
	| "week"
	| "month"
	| "year";

export type DurationEndCondition = "dispel" | "trigger" | "discharge";

export interface Duration {
	type: DurationUnit;
	amount?: number;
	upTo?: boolean;
}

export interface DurationEffectItem {
	type: DurationEffectType;
	duration?: Duration;
	concentration?: boolean;
	ends?: DurationEndCondition[];
	condition?: string;
}

export type DurationEffect = DurationEffectItem[];

export type TrapHazType =
	| "MECH"
	| "MAG"
	| "TRP"
	| "HAUNT"
	| "SMPL"
	| "CMPX";

export type HazardType =
	| "ENV"
	| "EST"
	| "GEN"
	| "WTH"
	| "WLD";

interface TrapBase {
	name: string;
	alias?: string[];
	source: Source;
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	entries: Entry[];
	rating?: TrapHazardRating;
	legacy?: boolean;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}

export interface TrapSimple extends TrapBase {
	trapHazType: "MECH" | "MAG" | "TRP" | "HAUNT";
	trigger?: TrapTrigger;
	duration?: DurationEffect;
	hauntBonus?: string;
}

export interface TrapComplex extends TrapBase {
	trapHazType: "SMPL" | "CMPX";
	trigger: TrapTrigger;
	initiative?: 1 | 2 | 3;
	initiativeNote?: Entry;
	effect?: Entry[];
	eActive?: Entry[];
	eDynamic?: Entry[];
	eConstant?: Entry[];
	countermeasures: Entry[];
}

export type Trap = TrapSimple | TrapComplex;

export interface Hazard {
	name: string;
	alias?: string[];
	trapHazType?: HazardType;
	source: Source;
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	entries: Entry[];
	rating?: TrapHazardRating;
	legacy?: boolean;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}
