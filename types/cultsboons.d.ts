/**
 * Manual type definitions for cultsboons.json schema.
 * Based on schema/site/cultsboons.json v1.2.2
 */

import type {Entry} from "./entry.js";
import type {Source, Page, OtherSource, ReprintedAs} from "./util.js";

export interface CultsBoonsJson {
	cult: Cult[];
	boon: Boon[];
}

export type CultType = "Demonic" | "Diabolical" | "Elder Evil" | "Elemental";

export type BoonType = "Demonic";

export interface CultGoal {
	entry: string;
}

export interface CultCultists {
	entry: string;
}

export interface CultSignatureSpells {
	entry: string;
}

export interface Cult {
	name: string;
	source: Source;
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	legacy?: boolean;
	type?: CultType;
	goal?: CultGoal;
	cultists?: CultCultists;
	signatureSpells?: CultSignatureSpells;
	entries: Entry[];
}

export interface BoonAbility {
	entry: Entry;
}

export interface BoonSignatureSpells {
	entry: Entry;
}

export interface Boon {
	name: string;
	source: Source;
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	type: BoonType;
	ability?: BoonAbility;
	signatureSpells?: BoonSignatureSpells;
	entries: Entry[];
}
