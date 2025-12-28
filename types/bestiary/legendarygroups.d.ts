/**
 * Manual type definitions for bestiary/legendarygroups.json schema.
 * Based on schema/site/bestiary/legendarygroups.json v1.2.3
 */

import type {Entry} from "../entry.js";
import type {Source, Page, OtherSource, MetaBlock} from "../util.js";

export interface LegendaryGroupsJson {
	legendaryGroup: LegendaryGroup[];
	_meta?: MetaBlock;
}

export interface LegendaryGroupData {
	name?: string;
	source?: Source;
	page?: Page;
	additionalSources?: OtherSource[];
	lairActions?: Entry[];
	regionalEffects?: Entry[];
	mythicEncounter?: Entry[];
}

export type LegendaryGroup = LegendaryGroupStandard | LegendaryGroupCopy;

export interface LegendaryGroupStandard {
	name: string;
	source: Source;
	page?: Page;
	additionalSources?: OtherSource[];
	lairActions?: Entry[];
	regionalEffects?: Entry[];
	mythicEncounter?: Entry[];
}

export interface LegendaryGroupCopy {
	name?: string;
	source?: Source;
	page?: Page;
	additionalSources?: OtherSource[];
	lairActions?: Entry[];
	regionalEffects?: Entry[];
	mythicEncounter?: Entry[];
	_copy: CopyBlockGeneric;
}

export interface CopyBlockGeneric {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}
