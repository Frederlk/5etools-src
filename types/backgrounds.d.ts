/**
 * Manual type definitions for backgrounds.json schema.
 */

import type {Entry} from "./entry.js";
import type {
	Source, Page, SkillProficiency, ToolProficiency,
	LanguageProficiency, StartingEquipment, OtherSource, ReprintedAs
} from "./util.js";

export interface BackgroundsJson {
	background?: Background[];
	_meta?: BackgroundsMeta;
}

export interface BackgroundsMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface Background {
	name: string;
	source: Source;
	page?: Page;
	alias?: string[];
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	isReprinted?: true;
	skillProficiencies?: SkillProficiency[];
	toolProficiencies?: ToolProficiency[];
	languageProficiencies?: LanguageProficiency[];
	startingEquipment?: StartingEquipment;
	additionalSpells?: AdditionalSpell[];
	feats?: BackgroundFeats;
	entries?: Entry[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	_copy?: BackgroundCopy;
}

export interface AdditionalSpell {
	innate?: Record<string, string[]>;
	known?: Record<string, string[]>;
	prepared?: Record<string, string[]>;
	expanded?: Record<string, string[]>;
	ability?: string | {choose: string[]};
}

export interface BackgroundFeats {
	any?: number;
	anyFromCategory?: {category: string; count?: number}[];
}

export interface BackgroundCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}
