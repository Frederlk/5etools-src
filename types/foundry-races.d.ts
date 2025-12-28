import type {Source} from "./util.js";
import type {Entry} from "./entry.js";

export type FoundrySystemObject = Record<string, unknown>;
export type FoundryFlagsObject = Record<string, unknown>;
export type FoundryAdvancementObject = Record<string, unknown>;
export type FoundryAdvancementsArray = FoundryAdvancementObject[];

export interface FoundryMergeObject {
  system?: true;
  chooseSystem?: true;
  effects?: true;
  flags?: true;
  chooseFlags?: true;
  activities?: true;
}

export type FoundryEffectStatus =
  | "bleeding" | "blinded" | "burning" | "charmed" | "cursed"
  | "deafened" | "dehydration" | "diseased" | "exhaustion" | "falling"
  | "frightened" | "grappled" | "incapacitated" | "invisible" | "malnutrition"
  | "paralyzed" | "petrified" | "poisoned" | "prone" | "restrained"
  | "silenced" | "stunned" | "suffocation" | "surprised" | "transformed"
  | "unconscious" | "coverHalf" | "coverThreeQuarters" | "dead" | "dodging"
  | "ethereal" | "hiding" | "marked" | "stable" | "flying";

export interface FoundryEffectChange {
  key: string;
  mode: string | number;
  value: unknown;
  priority?: string | number;
}

export interface FoundryEffectObject {
  foundryId?: string;
  name?: string;
  img?: string;
  description?: string;
  descriptionEntries?: Entry[];
  changes?: FoundryEffectChange[];
  statuses?: FoundryEffectStatus[];
  flags?: Record<string, unknown>;
  duration?: Record<string, unknown>;
  disabled?: true;
  transfer?: true;
  enchantmentLevelMin?: number;
  enchantmentLevelMax?: number;
  enchantmentRiderParent?: string;
  type?: "enchantment";
  [k: string]: unknown;
}

export interface FoundryActivityConsumptionTarget {
  target: string | {prop: string; uid: string} | {consumes: {name: string}};
}

export interface FoundryActivityConsumption {
  targets?: {target?: FoundryActivityConsumptionTarget["target"]}[];
}

export interface FoundryActivityBase {
  foundryId?: string;
  img?: string;
  description?: Record<string, unknown>;
  descriptionEntries?: Entry[];
  consumption?: FoundryActivityConsumption;
  effects?: {foundryId: string}[];
}

export interface FoundryActivityObjectAttack extends FoundryActivityBase {
  type: "attack";
}

export interface FoundryActivityObjectDamage extends FoundryActivityBase {
  type: "damage";
}

export interface FoundryActivityObjectSave extends FoundryActivityBase {
  type: "save";
}

export interface FoundryActivityObjectCheck extends FoundryActivityBase {
  type: "check";
  check?: {
    associated?: string[];
    ability?: string;
  };
}

export interface FoundryActivityObjectHeal extends FoundryActivityBase {
  type: "heal";
}

export interface FoundryActivityObjectCast extends FoundryActivityBase {
  type: "cast";
  spell?: {uuid?: string};
}

export interface FoundryActivityObjectSummon extends FoundryActivityBase {
  type: "summon";
  profiles?: FoundryActivityProfile[];
}

export interface FoundryActivityObjectEnchant extends FoundryActivityBase {
  type: "enchant";
  enchant?: {self?: true};
  effects?: {
    foundryId: string;
    riders?: {
      activity?: {foundryId: string}[];
      effect?: {foundryId: string}[];
    };
  }[];
}

export interface FoundryActivityObjectTransform extends FoundryActivityBase {
  type: "transform";
  profiles?: FoundryActivityProfile[];
  transform?: {customize?: true};
}

export interface FoundryActivityObjectUtility extends FoundryActivityBase {
  type: "utility";
}

export interface FoundryActivityProfile {
  name?: string;
  types?: string[];
  movement?: string[];
  sizes?: string[];
  count?: number | string;
  level?: {min?: number; max?: number};
  cr?: string;
  uuid?: string;
}

export type FoundryActivityObject =
  | FoundryActivityObjectAttack
  | FoundryActivityObjectDamage
  | FoundryActivityObjectSave
  | FoundryActivityObjectCheck
  | FoundryActivityObjectHeal
  | FoundryActivityObjectCast
  | FoundryActivityObjectSummon
  | FoundryActivityObjectEnchant
  | FoundryActivityObjectTransform
  | FoundryActivityObjectUtility;

export interface EntryDataObject {
  languageProficiencies?: unknown[];
  skillProficiencies?: unknown[];
  weaponProficiencies?: unknown[];
  armorProficiencies?: unknown[];
  toolProficiencies?: unknown[];
  savingThrowProficiencies?: unknown[];
  skillToolLanguageProficiencies?: unknown[];
  expertise?: unknown[];
  resist?: unknown[];
  immune?: unknown[];
  vulnerable?: unknown[];
  conditionImmune?: unknown[];
  resources?: unknown[];
  senses?: unknown[];
  additionalSpells?: unknown[];
}

export interface CopyBlockGeneric {
  name: string;
  source: Source;
  _mod?: unknown;
  _trait?: unknown;
  _preserve?: Record<string, true>;
}

export interface FoundryRaceData {
  name: string;
  source: Source;
  identifier?: string;
  system?: FoundrySystemObject;
  activities?: FoundryActivityObject[];
  effects?: FoundryEffectObject[];
  flags?: FoundryFlagsObject;
  advice?: Entry;
  img?: string;
  advancement?: FoundryAdvancementsArray;
  migrationVersion?: number;
  _merge?: FoundryMergeObject;
  entryData?: EntryDataObject;
}

export interface FoundryRaceWithCopy extends FoundryRaceData {
  _copy: CopyBlockGeneric;
}

export type FoundryRace = FoundryRaceData | FoundryRaceWithCopy;

export interface FoundryRaceFeatureData {
  name: string;
  source: Source;
  identifier?: string;
  system?: FoundrySystemObject;
  activities?: FoundryActivityObject[];
  effects?: FoundryEffectObject[];
  flags?: FoundryFlagsObject;
  advice?: Entry;
  img?: string;
  advancement?: FoundryAdvancementsArray;
  migrationVersion?: number;
  _merge?: FoundryMergeObject;
  raceName?: string;
  raceSource?: Source;
}

export interface FoundryRaceFeatureWithRequired extends FoundryRaceFeatureData {
  raceName: string;
  raceSource: Source;
}

export interface FoundryRaceFeatureWithCopy extends FoundryRaceFeatureData {
  _copy: CopyBlockGeneric;
}

export type FoundryRaceFeature = FoundryRaceFeatureWithRequired | FoundryRaceFeatureWithCopy;

export interface FoundryRacesJson {
  _meta?: {
    dependencies?: Record<string, string[]>;
    otherSources?: Record<string, unknown>;
  };
  race: FoundryRace[];
  raceFeature: FoundryRaceFeature[];
}
