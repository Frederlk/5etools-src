/**
 * Manual type definitions for items-base.json schema.
 * Based on schema/site/items-base.json v1.6.16
 */

import type {Entry} from "./entry.js";
import type {
	Source, Page, Rarity, DamageType, Condition,
	OtherSource, ReprintedAs, Edition, Prerequisite
} from "./util.js";

export interface ItemsBaseJson {
	_meta?: MetaBlock;
	baseitem?: BaseItem[];
	itemProperty?: ItemPropertyLookup[];
	itemType?: ItemTypeLookup[];
	itemEntry?: ItemEntry[];
	itemTypeAdditionalEntries?: ItemTypeAdditionalEntry[];
	itemMastery?: ItemMasteryEntry[];
}

export interface MetaBlock {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface ItemLookupBase {
	abbreviation?: string;
	source?: Source;
	page?: Page;
	reprintedAs?: ReprintedAs;
	name?: string;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}

export interface ItemPropertyLookup extends ItemLookupBase {
	abbreviation: string;
	source: Source;
	page: Page;
	template?: string;
	entries?: Entry[];
	entriesTemplate?: Entry[];
}

export interface ItemTypeLookup extends ItemLookupBase {
	abbreviation: string;
	source: Source;
	page: Page;
	entries?: Entry[];
	entriesTemplate?: Entry[];
	_copy?: ItemTypeCopy;
}

export interface ItemTypeCopy {
	abbreviation: string;
	source: Source;
	_mod?: CopyMod;
	_templates?: CopyTemplate[];
	_preserve?: Record<string, true>;
}

export interface CopyMod {
	[key: string]: unknown;
}

export interface CopyTemplate {
	name: string;
	source: Source;
}

export interface BaseItem {
	name: string;
	source: Source;
	type: ItemTypeAbbreviation;
	rarity: ItemRarity;
	page?: Page;
	alias?: string[];
	group?: string[] | null;
	edition?: Edition;
	typeAlt?: ItemTypeAbbreviation;
	reprintedAs?: ReprintedAs;
	ac?: number;
	age?: ItemAge;
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
	bonusSavingThrowConcentration?: string;
	dmg1?: string;
	dmg2?: string;
	dmgType?: DamageType;
	entries?: Entry[];
	property?: ItemPropertyEntry[];
	range?: string;
	reload?: number;
	scfType?: ScfType;
	vulnerable?: DamageVulnerabilityEntry[];
	resist?: DamageResistEntry[];
	immune?: DamageImmunityEntry[];
	conditionImmune?: ConditionImmuneEntry[];
	stealth?: boolean;
	strength?: string;
	dexterityMax?: number | null;
	armor?: boolean;
	axe?: boolean;
	sword?: boolean;
	mace?: boolean;
	spear?: boolean;
	hammer?: boolean;
	bow?: boolean;
	crossbow?: boolean;
	club?: boolean;
	dagger?: boolean;
	net?: boolean;
	polearm?: boolean;
	lance?: boolean;
	rapier?: boolean;
	whip?: boolean;
	halberd?: boolean;
	glaive?: boolean;
	arrow?: boolean;
	bolt?: boolean;
	bulletFirearm?: boolean;
	bulletSling?: boolean;
	cellEnergy?: boolean;
	needleBlowgun?: boolean;
	weapon?: boolean;
	firearm?: boolean;
	staff?: boolean;
	value?: number;
	carryingCapacity?: number;
	speed?: number;
	charges?: string | number;
	recharge?: ItemRecharge;
	rechargeAmount?: number | string;
	valueMult?: number;
	valueRarity?: ItemRarity;
	weaponCategory?: WeaponCategory;
	weight?: number;
	weightMult?: number;
	quantity?: number;
	legacy?: boolean;
	otherSources?: OtherSource[];
	ammoType?: ItemAmmoType;
	packContents?: PackContent[];
	lootTables?: string[];
	miscTags?: ItemMiscTag[];
	mastery?: MasteryEntry[];
	reach?: number;
	light?: ItemLight[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	_copy?: BaseItemCopy;
}

export interface BaseItemCopy {
	name: string;
	source: Source;
	_mod?: CopyMod;
	_preserve?: Record<string, boolean>;
}

export type ItemTypeAbbreviation =
	| "$|DMG" | "$A|DMG" | "$A|XDMG" | "$C" | "$C|XPHB" | "$G|DMG" | "$G|XDMG"
	| "A" | "A|XPHB" | "AF|DMG" | "AF|XDMG" | "AIR|DMG" | "AIR|XPHB"
	| "AT" | "AT|XPHB" | "EXP|DMG" | "EXP|XDMG" | "FD" | "FD|XPHB"
	| "G" | "G|XPHB" | "GS" | "GS|XPHB" | "GV|DMG" | "GV|XDMG"
	| "HA" | "HA|XPHB" | "INS" | "INS|XPHB" | "LA" | "LA|XPHB"
	| "M" | "M|XPHB" | "MA" | "MA|XPHB" | "MNT" | "MNT|XPHB" | "OTH"
	| "P" | "P|XPHB" | "R" | "R|XPHB" | "RD|DMG" | "RD|XDMG"
	| "RG|DMG" | "RG|XDMG" | "S" | "S|XPHB" | "SC|DMG" | "SC|XPHB"
	| "SCF" | "SCF|XPHB" | "SHP" | "SHP|XPHB" | "SPC|AAG"
	| "T" | "T|XPHB" | "TAH" | "TAH|XPHB" | "TB|XDMG"
	| "TG" | "TG|XDMG" | "VEH" | "VEH|XPHB" | "WD|DMG" | "WD|XDMG"
	| string;

export type ItemRarity =
	| "common" | "uncommon" | "rare" | "very rare"
	| "legendary" | "artifact" | "none" | "unknown"
	| "unknown (magic)" | "varies";

export type ItemAge = "futuristic" | "modern" | "renaissance";

export type ItemPropertyAbbreviation =
	| "2H" | "2H|XPHB" | "A" | "A|XPHB" | "AF|DMG" | "AF|XDMG"
	| "BF|DMG" | "BF|XDMG" | "F" | "F|XPHB" | "H" | "H|XPHB"
	| "L" | "L|XPHB" | "LD" | "LD|XPHB" | "OTH" | "R" | "R|XPHB"
	| "RLD" | "RLD|XDMG" | "S" | "T" | "T|XPHB" | "V" | "V|XPHB"
	| "Vst|EGW"
	| string;

export type ItemPropertyEntry = ItemPropertyAbbreviation | ItemPropertyWrapper;

export interface ItemPropertyWrapper {
	uid: ItemPropertyAbbreviation;
	note: string;
}

export type ScfType = "arcane" | "druid" | "holy";

export type WeaponCategory = "simple" | "martial";

export type ItemRecharge =
	| "round" | "restShort" | "restLong" | "dawn" | "dusk"
	| "midnight" | "week" | "month" | "year" | "decade"
	| "century" | "special";

export type ItemAmmoType =
	| "energy cell" | "energy cell|xdmg" | "modern bullet"
	| "blowgun needle|phb" | "crossbow bolt|phb" | "arrow|phb"
	| "renaissance bullet" | "sling bullet|phb" | "needle|xphb"
	| "bolt|xphb" | "arrow|xphb" | "firearm bullet|xphb" | "sling bullet|xphb";

export type ItemMiscTag = "CF/W" | "CNS" | "TT";

export type MasteryEntry = string | MasteryWrapper;

export interface MasteryWrapper {
	uid: string;
	note: string;
}

export interface ItemLight {
	dim?: number;
	bright?: number;
	shape?: "radius" | "cone";
}

export type PackContent = string | PackContentSpecial | PackContentItem;

export interface PackContentSpecial {
	special: string;
	quantity?: number;
}

export interface PackContentItem {
	item: string;
	quantity?: number;
	displayName?: string;
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

export interface ItemEntry {
	name?: string;
	source?: Source;
	entriesTemplate?: Entry[];
}

export interface ItemTypeAdditionalEntry {
	name?: string;
	source?: Source;
	appliesTo?: string;
	entries?: Entry[];
}

export interface ItemMasteryEntry {
	name: string;
	source: Source;
	entries: Entry[];
	page?: Page;
	prerequisite?: Prerequisite[];
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}
