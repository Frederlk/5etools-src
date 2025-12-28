/**
 * Manual type definitions for feats.json schema.
 */

import type {Entry} from "./entry.js";
import type {
	Source, Page, AbilityScores, Prerequisite,
	SkillProficiency, ToolProficiency, LanguageProficiency,
	WeaponProficiency, ArmorProficiency,
	OtherSource, ReprintedAs
} from "./util.js";

export interface FeatsJson {
	feat?: Feat[];
	_meta?: FeatsMeta;
}

export interface FeatsMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface Feat {
	name: string;
	source: Source;
	page?: Page;
	alias?: string[];
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	isReprinted?: true;
	prerequisite?: Prerequisite[];
	ability?: AbilityScores[];
	additionalSpells?: AdditionalSpell[];
	skillProficiencies?: SkillProficiency[];
	toolProficiencies?: ToolProficiency[];
	languageProficiencies?: LanguageProficiency[];
	weaponProficiencies?: WeaponProficiency[];
	armorProficiencies?: ArmorProficiency[];
	expertise?: ExpertiseChoice[];
	optionalfeatureProgression?: OptionalfeatureProgression[];
	entries?: Entry[];
	repeatable?: boolean;
	repeatableNote?: string;
	category?: FeatCategory;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	_copy?: FeatCopy;
}

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

export interface OptionalfeatureProgression {
	name: string;
	featureType: string[];
	progression: Record<string, number>;
}

export type FeatCategory = "G" | "O" | "EG" | "FF";

export interface FeatCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}
