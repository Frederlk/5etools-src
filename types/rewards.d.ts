/**
 * Manual type definitions for rewards.json schema.
 * Based on schema/site/rewards.json v1.2.4
 */

import type {Entry} from "./entry.js";
import type {Source, Page, OtherSource, ReprintedAs, Rarity} from "./util.js";

export interface RewardsJson {
	reward: Reward[];
}

export type RewardType =
	| "Blessing"
	| "Boon"
	| "Charm"
	| "Curse"
	| "Draconic Gift"
	| "Inhabitation"
	| "Fragment of Suffering"
	| "Other"
	| "Piety Trait";

export interface RewardAbility {
	entry: Entry;
}

export interface AdditionalSpell {
	name?: string;
	ability?: string | {choose: string[]};
	resourceName?: string;
	innate?: Record<string, string[] | AdditionalSpellLevelObject>;
	known?: Record<string, string[] | AdditionalSpellLevelObject>;
	prepared?: Record<string, string[] | AdditionalSpellLevelObject>;
	expanded?: Record<string, string[] | AdditionalSpellLevelObject>;
}

export interface AdditionalSpellLevelObject {
	rest?: Record<string, string[]>;
	daily?: Record<string, string[]>;
	will?: string[];
	ritual?: string[];
	resource?: Record<string, string[]>;
	limited?: Record<string, string[]>;
	_?: string[];
}

export interface Reward {
	name: string;
	source: Source;
	type: RewardType;
	entries: Entry[];
	page?: Page;
	otherSources?: OtherSource[];
	legacy?: boolean;
	reprintedAs?: ReprintedAs;
	ability?: RewardAbility;
	rarity?: Rarity;
	additionalSpells?: AdditionalSpell[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
}
