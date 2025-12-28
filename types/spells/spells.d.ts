/**
 * Manual type definitions for spells/spells.json schema.
 * Based on schema/site/spells/spells.json v1.9.24
 */

import type {Entry} from "../entry.js";
import type {
	Source, Page, SpellSchool, DamageType, Condition,
	CreatureType, OtherSource, ReprintedAs
} from "../util.js";

export interface SpellsJson {
	spell?: Spell[];
	_meta?: SpellsMeta;
}

export interface SpellsMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface Spell {
	name: string;
	source: Source;
	page?: Page;
	level: number;
	school: SpellSchool;
	subschools?: ("contaminated")[];
	meta?: SpellMeta;
	time: SpellTime[];
	range: SpellRange;
	components?: SpellComponents;
	duration: SpellDuration[];
	entries?: Entry[];
	entriesHigherLevel?: Entry[];
	alias?: string[];
	additionalSources?: OtherSource[];
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	damageInflict?: DamageType[];
	damageResist?: DamageType[];
	damageImmune?: DamageType[];
	damageVulnerable?: DamageType[];
	conditionInflict?: Condition[];
	conditionImmune?: Condition[];
	savingThrow?: AbilityFull[];
	abilityCheck?: AbilityFull[];
	spellAttack?: SpellAttackType[];
	areaTags?: AreaTag[];
	miscTags?: MiscTag[];
	affectsCreatureType?: CreatureType[];
	scalingLevelDice?: ScalingLevelDice | ScalingLevelDice[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	classes?: SpellClasses;
	races?: SpellRaces;
	backgrounds?: SpellBackgrounds;
	optionalfeatures?: SpellOptionalFeatures;
	feats?: SpellFeats;
}

export type AbilityFull =
	| "strength" | "dexterity" | "constitution"
	| "intelligence" | "wisdom" | "charisma";

export type SpellAttackType = "M" | "R" | "O";

export type AreaTag =
	| "ST" | "MT" | "R" | "N" | "C" | "Y"
	| "H" | "L" | "S" | "Q" | "W";

export type MiscTag =
	| "AAD" | "ADV" | "DFT" | "FMV" | "HL" | "LGT" | "LGTS"
	| "MAC" | "OBJ" | "OBS" | "PIR" | "PRM" | "PS" | "RO"
	| "SCL" | "SCT" | "SMN" | "SGT" | "THP" | "TP" | "UBA";

export interface SpellMeta {
	ritual?: boolean;
	technomagic?: boolean;
}

export interface SpellTime {
	number: number;
	unit: TimeUnit;
	condition?: string;
}

export type TimeUnit =
	| "action" | "bonus" | "reaction" | "round"
	| "minute" | "hour" | "day" | "week" | "year";

export interface SpellRange {
	type: RangeType;
	distance?: SpellDistance;
}

export type RangeType =
	| "special" | "point" | "line" | "cube" | "cone"
	| "emanation" | "radius" | "sphere" | "hemisphere" | "cylinder";

export interface SpellDistance {
	type: DistanceType;
	amount?: number;
}

export type DistanceType =
	| "feet" | "yards" | "miles" | "self"
	| "touch" | "unlimited" | "plane" | "sight";

export interface SpellComponents {
	v?: boolean;
	s?: boolean;
	m?: boolean | string | SpellMaterialComponent;
	r?: boolean;
}

export interface SpellMaterialComponent {
	text: string;
	cost?: number;
	consume?: boolean | "optional";
}

export interface SpellDuration {
	type: DurationType;
	duration?: DurationValue;
	concentration?: boolean;
	ends?: DurationEnd[];
	condition?: string;
}

export type DurationType =
	| "instant" | "timed" | "permanent" | "special";

export interface DurationValue {
	type: TimeUnit;
	amount: number;
	upTo?: boolean;
}

export type DurationEnd = "dispel" | "trigger" | "discharge";

export interface ScalingLevelDice {
	label?: string;
	scaling: Record<string, string>;
}

export interface SpellClasses {
	fromClassList?: SpellClassRef[];
	fromClassListVariant?: SpellClassRef[];
	fromSubclass?: SpellSubclassRef[];
}

export interface SpellClassRef {
	name: string;
	source: Source;
	definedInSource?: Source;
}

export interface SpellSubclassRef {
	class: {name: string; source: Source};
	subclass: {name: string; source: Source; shortName: string};
}

export interface SpellRaces {
	name: string;
	source: Source;
	baseName?: string;
	baseSource?: Source;
}

export interface SpellBackgrounds {
	name: string;
	source: Source;
}

export interface SpellOptionalFeatures {
	name: string;
	source: Source;
}

export interface SpellFeats {
	name: string;
	source: Source;
}
