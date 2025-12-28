/**
 * Manual type definitions for objects.json schema.
 * Based on schema/site/objects.json v1.3.12
 */

import type {Entry} from "./entry.js";
import type {
	Source, Page, Size, Speed, ReprintedAs,
	DamageType, Condition
} from "./util.js";

export interface ObjectsJson {
	object?: ObjectItem[];
}

export type ObjectType = "GEN" | "SW" | "U";

export interface ObjectItem {
	name: string;
	source: Source;
	page?: Page;
	reprintedAs?: ReprintedAs;
	size: Size[];
	creatureType?: ObjectCreatureType;
	objectType: ObjectType;
	str?: number;
	dex?: number;
	con?: number;
	int?: number;
	wis?: number;
	cha?: number;
	ac?: number | ObjectAcSpecial;
	hp: number | ObjectHpSpecial;
	speed?: Speed;
	senses?: string[];
	resist?: DamageResistEntry[];
	immune?: DamageImmunityEntry[];
	vulnerable?: DamageVulnerabilityEntry[];
	conditionImmune?: ConditionImmuneEntry[];
	entries?: Entry[];
	actionEntries?: Entry[];
	token?: ObjectToken;
	tokenCredit?: string;
	tokenCustom?: true;
	foundryTokenScale?: number;
	altArt?: AltArtItem[];
	isNpc?: boolean;
	hasToken?: boolean;
	hasFluff?: true;
	hasFluffImages?: true;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}

export interface ObjectAcSpecial {
	special: string;
}

export interface ObjectHpSpecial {
	special: string;
}

export type ObjectCreatureType = string | ObjectCreatureTypeObject;

export interface ObjectCreatureTypeObject {
	type: string;
	tags?: string[];
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

export interface ObjectToken {
	name?: string;
	source?: Source;
	page?: Page;
}

export interface AltArtItem {
	name?: string;
	source?: Source;
	page?: Page;
}
