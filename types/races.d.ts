/**
 * Manual type definitions for races.json schema.
 */

import type {Entry} from "./entry.js";
import type {
	Source, Page, Size, Speed, CreatureType,
	LanguageProficiency, SkillProficiency, ToolProficiency,
	WeaponProficiency, ArmorProficiency, AbilityScores,
	OtherSource, ReprintedAs, DamageType, Condition
} from "./util.js";

export interface RacesJson {
	race?: Race[];
	subrace?: Subrace[];
	_meta?: RacesMeta;
}

export interface RacesMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface Race {
	name: string;
	source: Source;
	page?: Page;
	alias?: string[];
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	size?: Size[];
	speed?: number | Speed;
	ability?: AbilityScores[];
	heightAndWeight?: HeightAndWeight;
	age?: RaceAge;
	darkvision?: number;
	blindsight?: number;
	trueForm?: RaceTrueForm;
	feats?: RaceFeats;
	additionalSpells?: AdditionalSpell[];
	resist?: (DamageType | string)[];
	immune?: (DamageType | string)[];
	vulnerable?: (DamageType | string)[];
	conditionImmune?: (Condition | string)[];
	languageProficiencies?: LanguageProficiency[];
	skillProficiencies?: SkillProficiency[];
	toolProficiencies?: ToolProficiency[];
	weaponProficiencies?: WeaponProficiency[];
	armorProficiencies?: ArmorProficiency[];
	entries?: Entry[];
	creatureTypes?: CreatureType[];
	creatureTypeTags?: string[];
	lineage?: RaceLineage;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	_versions?: RaceVersion[];
	_copy?: RaceCopy;
}

export interface Subrace {
	name: string;
	source: Source;
	raceName: string;
	raceSource: Source;
	page?: Page;
	alias?: string[];
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	ability?: AbilityScores[];
	speed?: number | Speed;
	entries?: Entry[];
	overwrite?: SubraceOverwrite;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	_copy?: RaceCopy;
}

export interface HeightAndWeight {
	baseHeight: number;
	heightMod: string;
	baseWeight: number;
	weightMod?: string;
}

export interface RaceAge {
	mature?: number;
	max?: number;
}

export interface RaceTrueForm {
	name: string;
	source: Source;
}

export interface RaceFeats {
	any?: number;
	anyFromCategory?: {category: string; count?: number}[];
}

export interface AdditionalSpell {
	innate?: Record<string, SpellList>;
	known?: Record<string, SpellList>;
	prepared?: Record<string, SpellList>;
	expanded?: Record<string, SpellList>;
	ability?: string | {choose: string[]};
	resourceName?: string;
}

export type SpellList = string[] | {
	daily?: Record<string, string[]>;
	rest?: Record<string, string[]>;
	ritual?: string[];
	will?: string[];
};

export type RaceLineage = "UA1" | "VRGR" | "UA2";

export interface RaceVersion {
	name?: string;
	source?: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
	_abstract?: RaceVersionAbstract;
	_implementations?: RaceVersionImplementation[];
}

export interface RaceVersionAbstract {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
}

export interface RaceVersionImplementation {
	_variables?: Record<string, unknown>;
}

export interface SubraceOverwrite {
	ability?: boolean;
	speed?: boolean;
	entries?: boolean;
	languageProficiencies?: boolean;
	skillProficiencies?: boolean;
	toolProficiencies?: boolean;
	weaponProficiencies?: boolean;
	armorProficiencies?: boolean;
}

export interface RaceCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}
