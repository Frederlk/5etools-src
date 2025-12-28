/**
 * Manual type definitions for bestiary/bestiary.json schema.
 * Based on schema/site/bestiary/bestiary.json v1.21.56
 */

import type {Entry} from "../entry.js";
import type {
	Source, Page, Size, CreatureType, Alignment, Speed,
	DamageType, Condition, OtherSource, ReprintedAs, Senses,
	SkillNameLower, LanguageNameLower, ProficiencyLevel
} from "../util.js";

export interface BestiaryJson {
	monster?: Monster[];
	_meta?: BestiaryMeta;
}

export interface BestiaryMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface Monster {
	name: string;
	source: Source;
	page?: Page;
	shortName?: string | boolean;
	alias?: string[];
	group?: string[] | null;
	level?: number;
	size?: Size[];
	sizeNote?: string;
	type: MonsterType;
	sourceSub?: string;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	isReprinted?: true;
	alignment?: MonsterAlignment[];
	alignmentPrefix?: string;
	ac?: AcItem[];
	hp?: MonsterHp;
	speed?: Speed;
	initiative?: number | MonsterInitiative;
	str?: AbilityScore;
	dex?: AbilityScore;
	con?: AbilityScore;
	int?: AbilityScore;
	wis?: AbilityScore;
	cha?: AbilityScore;
	save?: MonsterSaves;
	skill?: MonsterSkills;
	senses?: (string | Senses)[];
	passive?: number;
	resist?: DamageResistEntry[];
	immune?: DamageImmunityEntry[];
	vulnerable?: DamageVulnerabilityEntry[];
	conditionImmune?: ConditionImmuneEntry[];
	languages?: string[];
	languageTags?: LanguageTag[];
	cr?: ChallengeRating;
	pbNote?: string;
	spellcasting?: MonsterSpellcasting[];
	trait?: MonsterTrait[];
	action?: MonsterAction[];
	bonus?: MonsterAction[];
	reaction?: MonsterAction[];
	legendary?: MonsterAction[];
	legendaryActions?: number;
	legendaryHeader?: Entry[];
	legendaryGroup?: LegendaryGroup;
	mythic?: MonsterAction[];
	mythicHeader?: Entry[];
	lair?: MonsterAction[];
	lairHeader?: Entry[];
	regional?: MonsterAction[];
	regionalHeader?: Entry[];
	variant?: Entry[];
	environment?: Environment[];
	fluff?: MonsterFluff;
	dragonCastingColor?: string;
	dragonAge?: string;
	familiar?: boolean;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	hasToken?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	summonedBySpell?: string;
	summonedBySpellLevel?: number;
	summonedByClass?: string;
	_isCopy?: boolean;
	_copy?: MonsterCopy;
}

export type MonsterType = CreatureType | MonsterTypeObject;

export interface MonsterTypeObject {
	type: CreatureType | {choose: CreatureType[]};
	swarmSize?: Size;
	tags?: (string | MonsterTypeTag)[];
	sidekickType?: "expert" | "spellcaster" | "warrior";
	sidekickTags?: (string | MonsterTypeTag)[];
	sidekickHidden?: true;
	note?: string;
}

export interface MonsterTypeTag {
	tag: string;
	prefix: string;
}

export type MonsterAlignment = Alignment | MonsterAlignmentObject | MonsterAlignmentSpecial;

export interface MonsterAlignmentObject {
	alignment: Alignment[];
	chance?: number;
	note?: string;
}

export interface MonsterAlignmentSpecial {
	special: string;
}

export type AcItem = number | AcItemObject | AcItemSpecial;

export interface AcItemObject {
	ac: number;
	from?: string[];
	condition?: string;
	braces?: true;
}

export interface AcItemSpecial {
	special: string;
}

export type AbilityScore = number | null | {special: string};

export type MonsterHp = MonsterHpStandard | MonsterHpSpecial;

export interface MonsterHpStandard {
	average: number;
	formula: string;
}

export interface MonsterHpSpecial {
	special: string;
}

export interface MonsterInitiative {
	initiative?: number;
	proficiency?: ProficiencyLevel;
	advantageMode?: "adv" | "dis";
}

export interface MonsterSaves {
	str?: string;
	dex?: string;
	con?: string;
	int?: string;
	wis?: string;
	cha?: string;
}

export interface MonsterSkills {
	[key: string]: string | MonsterSkillSpecial;
}

export interface MonsterSkillSpecial {
	special: string;
}

export type DamageResistEntry = DamageType | string | DamageResistObject;

export interface DamageResistObject {
	resist?: (DamageType | string)[];
	note?: string;
	cond?: boolean;
	preNote?: string;
	special?: string;
}

export type DamageImmunityEntry = DamageType | string | DamageImmunityObject;

export interface DamageImmunityObject {
	immune?: (DamageType | string)[];
	note?: string;
	cond?: boolean;
	preNote?: string;
	special?: string;
}

export type DamageVulnerabilityEntry = DamageType | string | DamageVulnerabilityObject;

export interface DamageVulnerabilityObject {
	vulnerable?: (DamageType | string)[];
	note?: string;
	cond?: boolean;
	preNote?: string;
	special?: string;
}

export type ConditionImmuneEntry = Condition | string | ConditionImmuneObject;

export interface ConditionImmuneObject {
	conditionImmune?: (Condition | string)[];
	note?: string;
	cond?: boolean;
	preNote?: string;
	special?: string;
}

export type LanguageTag =
	| "AB" | "AQ" | "AU" | "C" | "CE" | "CS" | "D" | "DR"
	| "DU" | "E" | "G" | "GI" | "GO" | "GTH" | "H" | "I"
	| "IG" | "O" | "OTH" | "P" | "S" | "T" | "TC" | "TP"
	| "U" | "X" | "XX";

export type ChallengeRating = string | ChallengeRatingObject;

export interface ChallengeRatingObject {
	cr: string;
	lair?: string;
	coven?: string;
	xp?: number;
}

export interface MonsterSpellcasting {
	name: string;
	headerEntries?: Entry[];
	footerEntries?: Entry[];
	ability?: string;
	type?: SpellcastingType;
	spells?: Record<string, SpellLevel>;
	will?: (string | SpellEntry)[];
	ritual?: (string | SpellEntry)[];
	daily?: SpellcastingFrequency;
	weekly?: SpellcastingFrequency;
	monthly?: SpellcastingFrequency;
	yearly?: SpellcastingFrequency;
	recharge?: SpellcastingRecharge;
	charges?: SpellcastingCharges;
	rest?: SpellcastingRest;
	displayAs?: string;
	hidden?: string[];
}

export type SpellcastingType = "spellcasting" | "pact" | "focus" | "psionics";

export interface SpellLevel {
	slots?: number;
	spells?: (string | SpellEntry)[];
	lower?: number;
}

export interface SpellEntry {
	entry: string;
	hidden?: boolean;
}

export interface SpellcastingFrequency {
	"1"?: (string | SpellEntry)[];
	"2"?: (string | SpellEntry)[];
	"3"?: (string | SpellEntry)[];
	"1e"?: (string | SpellEntry)[];
	"2e"?: (string | SpellEntry)[];
	"3e"?: (string | SpellEntry)[];
}

export interface SpellcastingRecharge {
	"4"?: (string | SpellEntry)[];
	"5"?: (string | SpellEntry)[];
	"6"?: (string | SpellEntry)[];
	"4e"?: (string | SpellEntry)[];
	"5e"?: (string | SpellEntry)[];
	"6e"?: (string | SpellEntry)[];
}

export interface SpellcastingCharges {
	[key: string]: (string | SpellEntry)[];
}

export interface SpellcastingRest {
	short?: SpellcastingFrequency;
	long?: SpellcastingFrequency;
}

export interface MonsterTrait {
	name: string;
	entries: Entry[];
	type?: string;
	sort?: number;
}

export interface MonsterAction {
	name: string;
	entries: Entry[];
	type?: string;
	sort?: number;
}

export interface LegendaryGroup {
	name: string;
	source: Source;
}

export type Environment =
	| "arctic" | "coastal" | "desert" | "forest" | "grassland"
	| "hill" | "mountain" | "swamp" | "underdark" | "underwater" | "urban";

export interface MonsterFluff {
	entries?: Entry[];
	images?: EntryImage[];
}

export interface EntryImage {
	type: "image";
	href: {type: "internal" | "external"; path?: string; url?: string};
}

export interface MonsterCopy {
	name: string;
	source: Source;
	_mod?: MonsterMod;
	_trait?: MonsterTraitCopy;
	_preserve?: Record<string, boolean>;
}

export interface MonsterMod {
	[key: string]: unknown;
}

export interface MonsterTraitCopy {
	name: string;
	source: Source;
}
