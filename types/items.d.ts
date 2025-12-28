/**
 * Manual type definitions for items.json schema.
 * Based on schema/site/items.json v1.14.28
 */

import type {Entry} from "./entry.js";
import type {
	Source, Page, Rarity, DamageType, Condition,
	OtherSource, ReprintedAs, AbilityScoreAbbreviation
} from "./util.js";

export interface ItemsJson {
	item?: Item[];
	itemGroup?: ItemGroup[];
	_meta?: ItemsMeta;
}

export interface ItemsMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface Item {
	name: string;
	source: Source;
	page?: Page;
	alias?: string[];
	group?: string[] | null;
	type?: ItemType;
	typeAlt?: ItemType;
	rarity?: Rarity;
	additionalSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	baseItem?: string;
	ac?: number;
	age?: ItemAge;
	carryingCapacity?: number;
	dmg1?: string;
	dmg2?: string;
	dmgType?: DamageType;
	entries?: Entry[];
	additionalEntries?: Entry[];
	property?: ItemProperty[];
	range?: string;
	reload?: string | number;
	reqAttune?: string | boolean;
	reqAttuneAlt?: string | boolean;
	curse?: boolean;
	vulnerable?: DamageVulnerabilityEntry[];
	resist?: DamageResistEntry[];
	immune?: DamageImmunityEntry[];
	conditionImmune?: ConditionImmuneEntry[];
	detail1?: string;
	detail2?: string;
	scfType?: ScfType;
	speed?: number;
	stealth?: boolean;
	strength?: string | null;
	dexterityMax?: DexterityMax;
	firearm?: boolean;
	staff?: boolean;
	tier?: ItemTier;
	value?: number | null;
	valueMult?: number;
	valueRarity?: Rarity;
	weaponCategory?: WeaponCategory;
	weight?: number;
	weightMult?: number;
	weightNote?: string;
	wondrous?: boolean;
	tattoo?: boolean;
	sentient?: boolean;
	poison?: boolean;
	poisonTypes?: PoisonType[];
	crew?: number;
	crewMin?: number;
	crewMax?: number;
	capPassenger?: number;
	capCargo?: number;
	vehSpeed?: number;
	vehAc?: number;
	vehHp?: number;
	vehDmgThresh?: number;
	travelCost?: number;
	shippingCost?: number;
	charges?: string | number;
	recharge?: ItemRecharge;
	rechargeAmount?: number | string;
	optionalfeatures?: string[];
	classFeatures?: string[];
	attachedSpells?: string[];
	ability?: ItemAbility;
	focus?: boolean | FocusClass[];
	lootTables?: string[];
	bonusAc?: string;
	bonusWeapon?: string;
	bonusWeaponAttack?: string;
	bonusWeaponDamage?: string;
	bonusWeaponCritDamage?: string;
	bonusSpellAttack?: string;
	bonusSpellDamage?: string;
	bonusSpellSaveDc?: string;
	bonusSavingThrow?: string;
	bonusAbilityCheck?: string;
	bonusProficiencyBonus?: string;
	modifySpeed?: ModifySpeed;
	grantsProficiency?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	legacy?: boolean;
	otherSources?: OtherSource[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	packContents?: PackContent[];
	atomicPackContents?: boolean;
	containerCapacity?: ContainerCapacity;
	ammoType?: string;
	mastery?: string[];
	reach?: number;
	axe?: boolean;
	sword?: boolean;
	mace?: boolean;
	spear?: boolean;
	hammer?: boolean;
	bow?: boolean;
	crossbow?: boolean;
	club?: boolean;
	dagger?: boolean;
	_copy?: ItemCopy;
}

export type ItemType = string;

export type ItemAge = "futuristic" | "modern" | "renaissance";

export type ItemProperty =
	| "2H" | "A" | "AF" | "BF" | "EM" | "F" | "H" | "L" | "LD"
	| "M" | "OTH" | "R" | "RLD" | "S" | "T" | "V";

export type ScfType = "arcane" | "druid" | "holy";

export type DexterityMax = null | number | {dexterityMax: number};

export type ItemTier = "minor" | "major";

export type WeaponCategory = "simple" | "martial";

export type PoisonType = "contact" | "ingested" | "injury" | "inhaled";

export type ItemRecharge =
	| "round" | "restShort" | "restLong" | "dawn" | "dusk"
	| "midnight" | "week" | "month" | "year" | "decade"
	| "century" | "special";

export interface ItemAbility {
	str?: number;
	dex?: number;
	con?: number;
	int?: number;
	wis?: number;
	cha?: number;
	static?: Record<AbilityScoreAbbreviation, number>;
	choose?: AbilityChoose[];
}

export interface AbilityChoose {
	from: AbilityScoreAbbreviation[];
	amount?: number;
	count?: number;
}

export type FocusClass =
	| "Artificer" | "Bard" | "Cleric" | "Druid"
	| "Paladin" | "Ranger" | "Sorcerer" | "Warlock" | "Wizard";

export interface ModifySpeed {
	equal?: Record<string, string>;
	bonus?: Record<string, number>;
	multiply?: Record<string, number>;
	static?: Record<string, number>;
}

export interface PackContent {
	item?: string;
	special?: string;
	quantity?: number;
}

export interface ContainerCapacity {
	weight?: number[];
	item?: ContainerItem[];
	weightless?: boolean;
}

export interface ContainerItem {
	[key: string]: number;
}

export type DamageResistEntry = DamageType | string | {
	resist?: (DamageType | string)[];
	note?: string;
	cond?: boolean;
	preNote?: string;
	special?: string;
};

export type DamageImmunityEntry = DamageType | string | {
	immune?: (DamageType | string)[];
	note?: string;
	cond?: boolean;
	preNote?: string;
	special?: string;
};

export type DamageVulnerabilityEntry = DamageType | string | {
	vulnerable?: (DamageType | string)[];
	note?: string;
	cond?: boolean;
	preNote?: string;
	special?: string;
};

export type ConditionImmuneEntry = Condition | string | {
	conditionImmune?: (Condition | string)[];
	note?: string;
	cond?: boolean;
	preNote?: string;
	special?: string;
};

export interface ItemGroup {
	name: string;
	source: Source;
	page?: Page;
	items?: string[];
	entries?: Entry[];
}

export interface ItemCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}
