/**
 * Manual type definitions for skills.json schema.
 * Based on schema/site/skills.json v1.0.6
 */

import type {Entry} from "./entry.js";
import type {Source, Page, ReprintedAs, AbilityScoreAbbreviation} from "./util.js";

export interface SkillsJson {
	skill: Skill[];
}

export interface Skill {
	name: string;
	source: Source;
	page?: Page;
	reprintedAs?: ReprintedAs;
	ability?: AbilityScoreAbbreviation;
	entries: Entry[];
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}
