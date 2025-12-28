/**
 * Manual type definitions for optionalfeatures.json schema.
 */

import type {Entry} from "./entry.js";
import type {
	Source, Page, AbilityScores, Prerequisite,
	SkillProficiency, ToolProficiency, LanguageProficiency,
	WeaponProficiency, ArmorProficiency,
	OtherSource, ReprintedAs
} from "./util.js";

export interface OptionalFeaturesJson {
	optionalfeature?: OptionalFeature[];
	_meta?: OptionalFeaturesMeta;
}

export interface OptionalFeaturesMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface OptionalFeature {
	name: string;
	source: Source;
	page?: Page;
	alias?: string[];
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	isReprinted?: true;
	featureType: OptionalFeatureType[];
	prerequisite?: Prerequisite[];
	ability?: AbilityScores[];
	additionalSpells?: AdditionalSpell[];
	skillProficiencies?: SkillProficiency[];
	toolProficiencies?: ToolProficiency[];
	languageProficiencies?: LanguageProficiency[];
	weaponProficiencies?: WeaponProficiency[];
	armorProficiencies?: ArmorProficiency[];
	expertise?: ExpertiseChoice[];
	entries?: Entry[];
	consumes?: Consumes;
	previousVersion?: PreviousVersion;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	_copy?: OptionalFeatureCopy;
}

export type OptionalFeatureType =
	| "AI" | "ED" | "EI" | "MM" | "MV" | "MV:B" | "MV:C2-UA"
	| "OTH" | "PB" | "FS:F" | "FS:B" | "FS:R" | "FS:P"
	| "AS" | "AS:V1-UA" | "AS:V2-UA" | "SHP:H" | "SHP:M"
	| "SHP:W" | "SHP:F" | "SHP:O" | "IWM:W" | "IWM:A" | "IWM:G"
	| "OR" | "RN" | "AF";

export interface AdditionalSpell {
	innate?: Record<string, string[]>;
	known?: Record<string, string[]>;
	prepared?: Record<string, string[]>;
	expanded?: Record<string, string[]>;
	ability?: string | {choose: string[]};
}

export interface ExpertiseChoice {
	skills?: {from: string[]; count?: number};
	tools?: {from: string[]; count?: number};
	anyProficiency?: number;
}

export interface Consumes {
	name?: string;
	amount?: number;
}

export interface PreviousVersion {
	name: string;
	source: Source;
}

export interface OptionalFeatureCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}
