/**
 * Manual type definitions for deities.json schema.
 * Based on schema/site/deities.json v1.2.14
 */

import type {Entry, EntryImage} from "./entry.js";
import type {Source, Page, Alignment, OtherSource} from "./util.js";

export interface DeitiesJson {
	deity?: Deity[];
	_meta?: DeitiesMeta;
}

export interface DeitiesMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export type Pantheon =
	| "Amaranthine"
	| "Celtic"
	| "Dawn War"
	| "Dragonlance"
	| "Drow"
	| "Dwarven"
	| "Eberron"
	| "Egyptian"
	| "Elven"
	| "Faerûnian"
	| "Forgotten Realms"
	| "Gnomish"
	| "Greek"
	| "Greyhawk"
	| "Halfling"
	| "Nonhuman"
	| "Norse"
	| "Orc"
	| "Gnome"
	| "Duergar"
	| "Exandria"
	| "Theros"
	| "Unknown"
	| "Yuan-ti"
	| "Umbral"
	| "Shadow Realm Godlings"
	| "Shadow Realm Dark Gods";

export type DeityDomain =
	| "Arcana"
	| "Community"
	| "Death"
	| "Forge"
	| "Grave"
	| "Knowledge"
	| "Life"
	| "Light"
	| "Moon"
	| "Nature"
	| "Night"
	| "Order"
	| "Peace"
	| "Tempest"
	| "Trickery"
	| "Twilight"
	| "Unknown"
	| "War"
	| "Apocalypse"
	| "Wine"
	| "Cat"
	| "Darkness"
	| "Hunger"
	| "Hunting"
	| "Justice"
	| "Keeper"
	| "Labyrinth"
	| "Lust"
	| "Mercy"
	| "Ocean"
	| "Portal"
	| "Prophecy"
	| "Shadow"
	| "Travel"
	| "Void"
	| "Wind";

export interface Deity {
	name: string;
	pantheon: Pantheon;
	source: Source;
	page?: Page;
	alias?: string[];
	reprintAlias?: string;
	alignment?: Alignment[];
	title?: string;
	category?: string;
	domains?: DeityDomain[];
	province?: string;
	symbol?: string;
	dogma?: string;
	favoredWeapons?: string;
	plane?: string;
	worshipers?: string;
	entries?: Entry[];
	additionalSources?: OtherSource[];
	altNames?: string[];
	symbolImg?: EntryImage;
	legacy?: boolean;
	customExtensionOf?: string;
	piety?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
	_copy?: DeityCopy;
}

export interface DeityCopy {
	name: string;
	source: Source;
	pantheon?: Pantheon;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}
