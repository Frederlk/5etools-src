import type {Entry} from "./entry.js";
import type {Source, AbilityScoreAbbreviation} from "./util.js";

export type FoundryId = string;

export type FoundryIdShort = string;

export type FoundryTokenScale = number;

export type FoundryTokenSubjectScale = number;

export type FoundryIdentifier = string;

export type FoundryImg = string;

export type FoundrySkill =
	| "acr" | "ani" | "arc" | "ath" | "dec" | "his" | "ins" | "itm"
	| "inv" | "med" | "nat" | "prc" | "prf" | "per" | "rel" | "slt" | "ste" | "sur";

export type FoundryTool =
	| "alchemist" | "bagpipes" | "brewer" | "calligrapher" | "card" | "carpenter"
	| "cartographer" | "chess" | "cobbler" | "cook" | "dice" | "disg" | "drum"
	| "dulcimer" | "flute" | "forg" | "glassblower" | "herb" | "horn" | "jeweler"
	| "leatherworker" | "lute" | "lyre" | "mason" | "navg" | "painter" | "panflute"
	| "pois" | "potter" | "shawm" | "smith" | "thief" | "tinker" | "viol"
	| "weaver" | "woodcarver";

export type FoundryStatus =
	| "bleeding" | "blinded" | "burning" | "charmed" | "cursed" | "deafened"
	| "dehydration" | "diseased" | "exhaustion" | "falling" | "frightened"
	| "grappled" | "incapacitated" | "invisible" | "malnutrition" | "paralyzed"
	| "petrified" | "poisoned" | "prone" | "restrained" | "silenced" | "stunned"
	| "suffocation" | "surprised" | "transformed" | "unconscious" | "coverHalf"
	| "coverThreeQuarters" | "dead" | "dodging" | "ethereal" | "hiding" | "marked"
	| "stable" | "flying";

export interface FoundrySystemObject {
	[key: string]: unknown;
}

export interface FoundryFlagsObject {
	[key: string]: unknown;
}

export interface FoundryAdvancementObject {
	[key: string]: unknown;
}

export type FoundryAdvancementsArray = FoundryAdvancementObject[];

export interface FoundryPrototypeTokenObject {
	[key: string]: unknown;
}

export interface FoundryIdRef {
	foundryId: FoundryIdShort;
}

export interface FoundryActivityProfileLevel {
	min?: number;
	max?: number;
}

export interface FoundryActivityProfileBase {
	name?: string;
	types?: string[];
	movement?: string[];
	sizes?: string[];
	count?: number | string;
	level?: FoundryActivityProfileLevel;
}

export interface FoundryActivityProfileWithCr extends FoundryActivityProfileBase {
	cr: string;
}

export interface FoundryActivityProfileWithUuid extends FoundryActivityProfileBase {
	uuid: string;
}

export type FoundryActivityProfile =
	| FoundryActivityProfileBase
	| FoundryActivityProfileWithCr
	| FoundryActivityProfileWithUuid;

export type FoundryActivityProfiles = FoundryActivityProfile[];

export interface ConsumesRef {
	name: string;
}

export interface ConsumptionTargetImportable {
	prop: string;
	uid: string;
}

export interface ConsumptionTargetResource {
	consumes: ConsumesRef;
}

export type ConsumptionTarget = string | ConsumptionTargetImportable | ConsumptionTargetResource;

export interface ConsumptionTargetObject {
	target?: ConsumptionTarget;
}

export interface FoundryActivityConsumption {
	targets?: ConsumptionTargetObject[];
}

export interface FoundryActivityDescription {
	[key: string]: unknown;
}

export interface _FoundryActivityObjectBase {
	foundryId?: FoundryIdShort;
	img?: string;
	description?: FoundryActivityDescription;
	descriptionEntries?: Entry[];
	consumption?: FoundryActivityConsumption;
	effects?: FoundryIdRef[];
}

export interface _FoundryActivityObjectAttack extends _FoundryActivityObjectBase {
	type: "attack";
}

export interface _FoundryActivityObjectDamage extends _FoundryActivityObjectBase {
	type: "damage";
}

export interface _FoundryActivityObjectSave extends _FoundryActivityObjectBase {
	type: "save";
}

export interface FoundryActivityCheck {
	associated?: (FoundrySkill | FoundryTool)[];
	ability?: AbilityScoreAbbreviation;
}

export interface _FoundryActivityObjectCheck extends _FoundryActivityObjectBase {
	type: "check";
	check?: FoundryActivityCheck;
}

export interface _FoundryActivityObjectHeal extends _FoundryActivityObjectBase {
	type: "heal";
}

export interface FoundryActivitySpell {
	uuid?: string;
}

export interface _FoundryActivityObjectCast extends _FoundryActivityObjectBase {
	type: "cast";
	spell?: FoundryActivitySpell;
}

export interface FoundryEnchantEffectRiders {
	activity?: FoundryIdRef[];
	effect?: FoundryIdRef[];
}

export interface FoundryEnchantEffectRef extends FoundryIdRef {
	riders?: FoundryEnchantEffectRiders;
}

export interface FoundryActivityEnchant {
	self?: true;
}

export interface _FoundryActivityObjectEnchant extends _FoundryActivityObjectBase {
	type: "enchant";
	effects?: FoundryEnchantEffectRef[];
	enchant?: FoundryActivityEnchant;
}

export interface _FoundryActivityObjectSummon extends _FoundryActivityObjectBase {
	type: "summon";
	profiles?: FoundryActivityProfiles;
}

export interface FoundryActivityTransform {
	customize?: true;
}

export interface _FoundryActivityObjectTransform extends _FoundryActivityObjectBase {
	type: "transform";
	profiles?: FoundryActivityProfiles;
	transform?: FoundryActivityTransform;
}

export interface _FoundryActivityObjectUtility extends _FoundryActivityObjectBase {
	type: "utility";
}

export type FoundryActivityObject =
	| _FoundryActivityObjectAttack
	| _FoundryActivityObjectDamage
	| _FoundryActivityObjectSave
	| _FoundryActivityObjectCheck
	| _FoundryActivityObjectHeal
	| _FoundryActivityObjectCast
	| _FoundryActivityObjectSummon
	| _FoundryActivityObjectEnchant
	| _FoundryActivityObjectTransform
	| _FoundryActivityObjectUtility;

export type FoundryActivitiesArray = FoundryActivityObject[];

export interface FoundryEffectChange {
	key: string;
	mode: string | number;
	value: unknown;
	priority?: string | number;
}

export interface FoundryEffectDuration {
	[key: string]: unknown;
}

export interface _FoundryEffectObject {
	foundryId?: FoundryIdShort;
	name?: string;
	img?: string;
	description?: string;
	descriptionEntries?: Entry[];
	changes?: FoundryEffectChange[];
	statuses?: FoundryStatus[];
	flags?: FoundryFlagsObject;
	duration?: FoundryEffectDuration;
	disabled?: true;
	transfer?: true;
	enchantmentLevelMin?: number;
	enchantmentLevelMax?: number;
	enchantmentRiderParent?: FoundryIdShort;
	type?: "enchantment";
}

export type FoundryEffectObjectWithChanges = _FoundryEffectObject & {
	changes: FoundryEffectChange[];
};

export type FoundryEffectObjectWithStatuses = _FoundryEffectObject & {
	statuses: FoundryStatus[];
};

export type FoundryEffectObjectWithName = _FoundryEffectObject & {
	name: string;
};

export type FoundryEffectObjectWithDuration = _FoundryEffectObject & {
	duration: FoundryEffectDuration;
};

export type FoundryEffectObjectWithDescription = _FoundryEffectObject & {
	description: string;
};

export type FoundryEffectObjectWithDescriptionEntries = _FoundryEffectObject & {
	descriptionEntries: Entry[];
};

export type FoundryEffectObjectEnchantment = _FoundryEffectObject & {
	foundryId: FoundryIdShort;
	type: "enchantment";
};

export type FoundryEffectObject =
	| FoundryEffectObjectWithChanges
	| FoundryEffectObjectWithStatuses
	| FoundryEffectObjectWithName
	| FoundryEffectObjectWithDuration
	| FoundryEffectObjectWithDescription
	| FoundryEffectObjectWithDescriptionEntries
	| FoundryEffectObjectEnchantment;

export type FoundryEffectsArray = FoundryEffectObject[];

export interface FoundryMergeObject {
	system?: true;
	chooseSystem?: true;
	effects?: true;
	flags?: true;
	chooseFlags?: true;
	activities?: true;
}

export interface FoundrySubEntitiesItem {
	[key: string]: unknown;
}

export interface FoundrySubEntitiesObject {
	item?: FoundrySubEntitiesItem[];
}

export interface EntryDataObject {
	languageProficiencies?: unknown;
	skillProficiencies?: unknown;
	weaponProficiencies?: unknown;
	armorProficiencies?: unknown;
	toolProficiencies?: unknown;
	savingThrowProficiencies?: unknown;
	skillToolLanguageProficiencies?: unknown;
	expertise?: unknown;
	resist?: unknown;
	immune?: unknown;
	vulnerable?: unknown;
	conditionImmune?: unknown;
	resources?: unknown;
	senses?: unknown;
	additionalSpells?: unknown;
}

export interface FoundrySideDataGenericObject {
	name: string;
	source: Source;
	identifier?: FoundryIdentifier;
	system?: FoundrySystemObject;
	activities?: FoundryActivityObject[];
	effects?: FoundryEffectObject[];
	flags?: FoundryFlagsObject;
	advice?: Entry;
	img?: string;
	advancement?: FoundryAdvancementsArray;
	migrationVersion?: number;
	_merge?: FoundryMergeObject;
}

export type FoundrySideDataGenericArray = FoundrySideDataGenericObject[];

export interface FoundrySideDataGenericFeatureObject extends FoundrySideDataGenericObject {
	entries?: Entry[];
	isIgnored?: true;
	ignoreSrdActivities?: true;
	ignoreSrdEffects?: true;
	subEntities?: FoundrySubEntitiesObject;
}

export type FoundrySideDataGenericFeatureArray = FoundrySideDataGenericFeatureObject[];

export interface FoundrySideDataGenericActorObject extends FoundrySideDataGenericObject {
	prototypeToken?: FoundryPrototypeTokenObject;
}

export type FoundrySideDataGenericActorArray = FoundrySideDataGenericActorObject[];
