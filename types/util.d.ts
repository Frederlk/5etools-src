/**
 * Manual type definitions for util.json schema.
 * Based on schema/site/util.json v1.17.37
 */

import type {Entry} from "./entry.js";

export type Source = string;
export type Page = number | string;
export type Url = string;

export type AbilityScoreAbbreviation = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type LanguageNameLower =
	| "abyssal" | "aquan" | "auran" | "celestial" | "common"
	| "common sign language" | "deep speech" | "draconic" | "druidic"
	| "dwarvish" | "elvish" | "giant" | "gith" | "gnomish" | "goblin"
	| "halfling" | "ignan" | "infernal" | "orc" | "other" | "primordial"
	| "sylvan" | "terran" | "thieves' cant" | "undercommon";

export type SkillNameLower =
	| "acrobatics" | "animal handling" | "arcana" | "athletics"
	| "deception" | "history" | "insight" | "intimidation"
	| "investigation" | "medicine" | "nature" | "perception"
	| "performance" | "persuasion" | "religion" | "sleight of hand"
	| "stealth" | "survival";

export type ToolNameLower =
	| "alchemist's supplies" | "brewer's supplies" | "calligrapher's supplies"
	| "carpenter's tools" | "cartographer's tools" | "cobbler's tools"
	| "cook's utensils" | "disguise kit" | "forgery kit" | "glassblower's tools"
	| "herbalism kit" | "jeweler's tools" | "leatherworker's tools"
	| "mason's tools" | "navigator's tools" | "painter's supplies"
	| "poisoner's kit" | "potter's tools" | "smith's tools"
	| "thieves' tools" | "tinker's tools" | "weaver's tools" | "woodcarver's tools";

export type CreatureType =
	| "aberration" | "beast" | "celestial" | "construct" | "dragon"
	| "elemental" | "fey" | "fiend" | "giant" | "humanoid"
	| "monstrosity" | "ooze" | "plant" | "undead";

export type Alignment =
	| "L" | "N" | "C" | "G" | "E"
	| "LG" | "LN" | "LE" | "NG" | "NE" | "CG" | "CN" | "CE"
	| "U" | "A" | "NX" | "NY";

export type Size = "F" | "D" | "T" | "S" | "M" | "L" | "H" | "G" | "C" | "V";

export type DamageType =
	| "acid" | "bludgeoning" | "cold" | "fire" | "force"
	| "lightning" | "necrotic" | "piercing" | "poison"
	| "psychic" | "radiant" | "slashing" | "thunder";

export type Condition =
	| "blinded" | "charmed" | "deafened" | "exhaustion"
	| "frightened" | "grappled" | "incapacitated" | "invisible"
	| "paralyzed" | "petrified" | "poisoned" | "prone"
	| "restrained" | "stunned" | "unconscious";

export type SpellSchool = "A" | "C" | "D" | "E" | "I" | "N" | "T" | "V" | "P";

export type Rarity =
	| "common" | "uncommon" | "rare" | "very rare"
	| "legendary" | "artifact" | "none" | "unknown"
	| "unknown (magic)" | "varies";

export type Edition = "classic" | "one";

export interface OtherSource {
	source: Source;
	page?: Page;
}

export interface ReprintedAsItem {
	uid: string;
	tag?: string;
	edition?: Edition;
}

export type ReprintedAs = (string | ReprintedAsItem)[];

export interface MetaBlock {
	dependencies?: Record<string, string[]>;
	otherSources?: {
		monster?: Record<string, unknown>;
	};
}

export interface Speed {
	walk?: number | SpeedValue;
	fly?: number | SpeedValue;
	swim?: number | SpeedValue;
	climb?: number | SpeedValue;
	burrow?: number | SpeedValue;
	hover?: boolean;
	canHover?: boolean;
}

export interface SpeedValue {
	number: number;
	condition?: string;
}

export interface LanguageProficiency {
	any?: number;
	anyStandard?: number;
	[key: string]: number | boolean | undefined;
}

export interface SkillProficiency {
	any?: number;
	choose?: {
		from: SkillNameLower[];
		count?: number;
	};
	[key: string]: number | boolean | {from: SkillNameLower[]; count?: number} | undefined;
}

export interface ToolProficiency {
	any?: number;
	choose?: {
		from: ToolNameLower[];
		count?: number;
	};
	[key: string]: number | boolean | {from: ToolNameLower[]; count?: number} | undefined;
}

export interface WeaponProficiency {
	any?: number;
	choose?: {
		from: string[];
		count?: number;
	};
	[key: string]: number | boolean | {from: string[]; count?: number} | undefined;
}

export interface ArmorProficiency {
	light?: boolean;
	medium?: boolean;
	heavy?: boolean;
	shield?: boolean;
}

export interface SavingThrowProficiency {
	choose?: {
		from: AbilityScoreAbbreviation[];
		count?: number;
	};
	[key: string]: boolean | {from: AbilityScoreAbbreviation[]; count?: number} | undefined;
}

export interface AbilityScores {
	str?: number;
	dex?: number;
	con?: number;
	int?: number;
	wis?: number;
	cha?: number;
	choose?: {
		from: AbilityScoreAbbreviation[];
		count?: number;
		amount?: number;
	};
}

export interface Prerequisite {
	level?: number | {level: number; class?: {name: string; source?: Source}};
	race?: {name: string; displayEntry?: string; source?: Source}[];
	ability?: Record<AbilityScoreAbbreviation, number>[];
	spellcasting?: boolean;
	spellcasting2020?: boolean;
	pact?: string;
	patron?: string;
	spell?: string[];
	feat?: string[];
	feature?: string[];
	item?: string[];
	psionics?: boolean;
	proficiency?: {
		armor?: string;
		weapon?: string;
	}[];
	other?: string;
	otherSummary?: {
		entry: string;
		entrySummary: string;
	};
	campaign?: string[];
}

export interface DamageImmunity {
	immune?: DamageType[];
	note?: string;
	cond?: boolean;
	preNote?: string;
}

export interface DamageResistance {
	resist?: DamageType[];
	note?: string;
	cond?: boolean;
	preNote?: string;
}

export interface DamageVulnerability {
	vulnerable?: DamageType[];
	note?: string;
	cond?: boolean;
	preNote?: string;
}

export interface ConditionImmunity {
	conditionImmune?: Condition[];
	note?: string;
	cond?: boolean;
	preNote?: string;
}

export interface Senses {
	blindsight?: number | string;
	darkvision?: number | string;
	tremorsense?: number | string;
	truesight?: number | string;
	other?: string;
}

export interface FluffObject {
	name?: string;
	source?: Source;
	entries?: Entry[];
	images?: EntryImage[];
}

export interface EntryImage {
	type: "image";
	href: {type: "internal" | "external"; path?: string; url?: string};
	title?: string;
}

export interface StartingEquipment {
	additionalFromBackground?: boolean;
	default?: string[];
	defaultData?: StartingEquipmentDefaultData[];
	goldAlternative?: string;
}

export interface StartingEquipmentDefaultData {
	_?: string[];
	a?: string[];
	b?: string[];
	c?: string[];
	d?: string[];
}

export interface AdventureBookData {
	id: string;
	source: Source;
}

export interface OptionalfeatureProgression {
	name: string;
	featureType: string[];
	progression: Record<string, number>;
}

export interface FeatProgression {
	name: string;
	progression: Record<string, number>;
}

export type ProficiencyLevel = 0 | 1 | 2;

export interface Resource {
	name: string;
	value: number;
	formula?: string;
}
