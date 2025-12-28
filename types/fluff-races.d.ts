/**
 * Manual type definitions for fluff-races.json schema.
 * Based on schema/site/fluff-races.json v2.2.0
 */

import type {Entry, EntryImage} from "./entry.js";
import type {Source, MetaBlock} from "./util.js";

export interface FluffRacesJson {
	raceFluff?: RaceFluff[];
	raceFluffMeta?: RaceFluffMeta;
	_meta?: MetaBlock;
}

export interface RaceFluffMeta {
	uncommon?: Entry;
	monstrous?: Entry;
}

export type RaceFluff = RaceFluffData | RaceFluffCopy;

export interface RaceFluffData {
	name: string;
	source: Source;
	images?: EntryImage[] | null;
	entries?: Entry[];
	uncommon?: true;
	monstrous?: true;
}

export interface RaceFluffCopy {
	name?: string;
	source?: Source;
	images?: EntryImage[] | null;
	entries?: Entry[];
	uncommon?: true;
	monstrous?: true;
	_copy: CopyBlockGeneric;
}

export interface CopyBlockGeneric {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_templates?: CopyTemplate[];
	_preserve?: Record<string, boolean>;
}

export interface CopyTemplate {
	name: string;
	source: Source;
}
