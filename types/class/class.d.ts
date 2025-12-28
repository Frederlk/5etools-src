/**
 * Manual type definitions for class/class.json schema.
 */

import type {Entry} from "../entry.js";
import type {
	Source, Page, Speed,
	SkillProficiency, ToolProficiency, WeaponProficiency,
	ArmorProficiency, SavingThrowProficiency,
	AbilityScoreAbbreviation, OtherSource, ReprintedAs,
	StartingEquipment, OptionalfeatureProgression
} from "../util.js";

export interface ClassesJson {
	class?: Class[];
	subclass?: Subclass[];
	classFeature?: ClassFeature[];
	subclassFeature?: SubclassFeature[];
	_meta?: ClassesMeta;
}

export interface ClassesMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface Class {
	name: string;
	source: Source;
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	isReprinted?: true;
	isSidekick?: boolean;
	sideKickHidden?: boolean;
	hd?: HitDice;
	proficiency?: AbilityScoreAbbreviation[];
	spellcastingAbility?: AbilityScoreAbbreviation;
	casterProgression?: CasterProgression;
	preparedSpells?: string;
	preparedSpellsProgression?: number[];
	cantripProgression?: number[];
	spellsKnownProgression?: number[];
	spellsKnownProgressionFixed?: Record<string, number>;
	spellsKnownProgressionFixedAllowLowerLevel?: boolean;
	spellsKnownProgressionFixedByLevel?: Record<string, SpellsKnownFixed>;
	optionalfeatureProgression?: OptionalfeatureProgression[];
	startingProficiencies?: StartingProficiencies;
	startingEquipment?: StartingEquipment;
	multiclassing?: Multiclassing;
	classTableGroups?: ClassTableGroup[];
	classFeatures?: (string | ClassFeatureRef)[];
	subclassTitle?: string;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	fluff?: ClassFluff[];
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	_copy?: ClassCopy;
}

export interface HitDice {
	number: number;
	faces: number;
}

export type CasterProgression =
	| "full" | "1/2" | "1/3" | "pact" | "artificer";

export interface SpellsKnownFixed {
	[key: string]: number;
}

export interface StartingProficiencies {
	armor?: (string | ArmorProficiency)[];
	weapons?: (string | WeaponProficiency)[];
	tools?: (string | ToolProficiency)[];
	skills?: SkillProficiency[];
}

export interface Multiclassing {
	requirements?: MulticlassingRequirements;
	proficienciesGained?: StartingProficiencies;
}

export interface MulticlassingRequirements {
	or?: AbilityRequirement[];
	and?: AbilityRequirement[];
	[key: string]: number | AbilityRequirement[] | undefined;
}

export interface AbilityRequirement {
	[key: string]: number;
}

export interface ClassTableGroup {
	title?: string;
	colLabels?: string[];
	rows?: (string | number)[][];
	rowsSpellProgression?: number[][];
}

export interface ClassFeatureRef {
	classFeature: string;
	gainSubclassFeature?: boolean;
}

export interface ClassFluff {
	name: string;
	source: Source;
	entries?: Entry[];
}

export interface Subclass {
	name: string;
	shortName: string;
	source: Source;
	className: string;
	classSource: Source;
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	isReprinted?: true;
	spellcastingAbility?: AbilityScoreAbbreviation;
	casterProgression?: CasterProgression;
	preparedSpells?: string;
	preparedSpellsProgression?: number[];
	cantripProgression?: number[];
	spellsKnownProgression?: number[];
	additionalSpells?: AdditionalSpell[];
	subclassTableGroups?: ClassTableGroup[];
	subclassFeatures?: (string | SubclassFeatureRef)[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	_copy?: SubclassCopy;
}

export interface SubclassFeatureRef {
	subclassFeature: string;
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

export interface ClassFeature {
	name: string;
	source: Source;
	page?: Page;
	className: string;
	classSource: Source;
	level: number;
	header?: number;
	type?: string;
	entries?: Entry[];
	isClassFeatureVariant?: boolean;
	otherSources?: OtherSource[];
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	consumes?: Consumes;
	_copy?: FeatureCopy;
}

export interface SubclassFeature {
	name: string;
	source: Source;
	page?: Page;
	className: string;
	classSource: Source;
	subclassShortName: string;
	subclassSource: Source;
	level: number;
	header?: number;
	type?: string;
	entries?: Entry[];
	isClassFeatureVariant?: boolean;
	isGainAtNextFeatureLevel?: boolean;
	otherSources?: OtherSource[];
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	consumes?: Consumes;
	_copy?: FeatureCopy;
}

export interface Consumes {
	name?: string;
	amount?: number;
}

export interface ClassCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}

export interface SubclassCopy {
	name: string;
	shortName: string;
	source: Source;
	className: string;
	classSource: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}

export interface FeatureCopy {
	name: string;
	source: Source;
	className: string;
	classSource: Source;
	level?: number;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}
