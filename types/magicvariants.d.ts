/**
 * Manual type definitions for magicvariants.json schema.
 * Based on schema/site/magicvariants.json v1.9.18
 */

import type {Entry} from "./entry.js";
import type {
	Source, Page, Rarity, DamageType, OtherSource, ReprintedAs,
	DamageImmunity, DamageResistance, DamageVulnerability, ConditionImmunity,
	Edition
} from "./util.js";
import type {
	ItemType, ItemAge, ItemProperty, ScfType, DexterityMax,
	ItemTier, WeaponCategory, ItemRecharge, ItemAbility, ModifySpeed,
	DamageResistEntry, DamageImmunityEntry, DamageVulnerabilityEntry,
	ConditionImmuneEntry
} from "./items.js";

export interface MagicVariantsJson {
	magicvariant: MagicVariant[];
	linkedLootTables?: LinkedLootTables;
}

export interface LinkedLootTables {
	DMG?: Record<string, unknown>;
}

export type MagicVariant = MagicVariantData | MagicVariantCopy;

export interface MagicVariantData {
	name: string;
	alias?: string[];
	group?: string[] | null;
	edition?: Edition;
	type?: ItemType;
	entries?: Entry[];
	requires: MagicVariantRequirement[];
	inherits: MagicVariantInherits;
	excludes?: MagicVariantExcludes;
	noDisplay?: boolean;
	charges?: string | number;
	attachedSpells?: string[];
	ammo?: boolean;
	reqAttuneTags?: ReqAttuneTag[];
	reqAttuneAltTags?: ReqAttuneTag[];
	weaponCategory?: WeaponCategory;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
}

export interface MagicVariantCopy {
	name?: string;
	alias?: string[];
	group?: string[] | null;
	edition?: Edition;
	type?: ItemType;
	entries?: Entry[];
	requires?: MagicVariantRequirement[];
	inherits?: MagicVariantInherits;
	excludes?: MagicVariantExcludes;
	noDisplay?: boolean;
	charges?: string | number;
	attachedSpells?: string[];
	ammo?: boolean;
	reqAttuneTags?: ReqAttuneTag[];
	reqAttuneAltTags?: ReqAttuneTag[];
	weaponCategory?: WeaponCategory;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	rarity?: Rarity;
	_copy: CopyBlock;
	source: Source;
}

export interface CopyBlock {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}

export interface MagicVariantRequirement {
	name?: string;
	property?: string;
	armor?: boolean;
	axe?: boolean;
	bow?: boolean;
	crossbow?: boolean;
	sword?: boolean;
	weapon?: boolean;
	firearm?: boolean;
	mace?: boolean;
	spear?: boolean;
	hammer?: boolean;
	club?: boolean;
	dagger?: boolean;
	dmgType?: DamageType;
	source?: Source;
	type?: ItemType;
	scfType?: ScfType;
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
	weaponCategory?: WeaponCategory;
	staff?: boolean;
}

export interface MagicVariantExcludes {
	name?: string | string[];
	page?: Page;
	property?: string | string[];
	armor?: boolean;
	axe?: boolean;
	bow?: boolean;
	crossbow?: boolean;
	sword?: boolean;
	weapon?: boolean;
	firearm?: boolean;
	mace?: boolean;
	spear?: boolean;
	hammer?: boolean;
	club?: boolean;
	dagger?: boolean;
	dmgType?: DamageType;
	source?: Source;
	type?: ItemType;
	scfType?: ScfType;
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
	weaponCategory?: WeaponCategory;
	staff?: boolean;
}

export interface MagicVariantInherits {
	type?: ItemType;
	typeAlt?: ItemType;
	property?: ItemPropertyEntry[];
	propertyAdd?: ItemPropertyEntry[];
	propertyRemove?: ItemPropertyEntry[];
	range?: string;
	ac?: number;
	age?: ItemAge;
	critThreshold?: number;
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
	modifySpeed?: ModifySpeed;
	tier?: ItemTier;
	rarity?: Rarity;
	source?: Source;
	page?: Page;
	reprintedAs?: ReprintedAs;
	namePrefix?: string;
	nameSuffix?: string;
	nameRemove?: string;
	grantsProficiency?: boolean;
	grantsLanguage?: boolean;
	reqAttune?: string | boolean;
	curse?: boolean;
	vulnerable?: DamageVulnerabilityEntry[];
	resist?: DamageResistEntry[];
	immune?: DamageImmunityEntry[];
	conditionImmune?: ConditionImmuneEntry[];
	stealth?: boolean;
	strength?: string | null;
	dexterityMax?: DexterityMax;
	wondrous?: boolean;
	sentient?: true;
	entries?: Entry[];
	charges?: string | number;
	recharge?: ItemRecharge;
	rechargeAmount?: number | string;
	attachedSpells?: string[];
	optionalfeatures?: string[];
	classFeatures?: string[];
	ability?: ItemAbility;
	lootTables?: LootTableEntry[];
	legacy?: boolean;
	otherSources?: OtherSource[];
	valueMult?: number;
	valueExpression?: string;
	valueRarity?: Rarity;
	weaponCategory?: WeaponCategory;
	weight?: number;
	weightMult?: number;
	weightExpression?: string;
	barding?: boolean;
	spellScrollLevel?: number;
	reqAttuneTags?: ReqAttuneTag[];
	reqAttuneAltTags?: ReqAttuneTag[];
	miscTags?: string[];
	mastery?: string[];
	reach?: number;
	light?: ItemLight;
	hasRefs?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}

export type ItemPropertyEntry = ItemProperty | ItemPropertyWrapper;

export interface ItemPropertyWrapper {
	choose: {
		from: ItemProperty[];
	};
}

export type LootTableEntry = string | LootTableObject;

export interface LootTableObject {
	name?: string;
	source?: Source;
}

export interface ReqAttuneTag {
	class?: string;
	subclass?: {name: string; source: Source};
	background?: string;
	race?: string;
	creatureType?: string;
	size?: string;
	alignment?: string;
	psionics?: boolean;
	spellcasting?: boolean;
	spellcastingPrepared?: boolean;
}

export interface ItemLight {
	bright?: number;
	dim?: number;
	condition?: string;
}
