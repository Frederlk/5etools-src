/**
 * Manual type definitions for conditionsdiseases.json schema.
 * Based on schema/site/conditionsdiseases.json v1.2.12
 */

import type {Entry} from "./entry.js";
import type {Source, Page, OtherSource, ReprintedAs} from "./util.js";

export interface ConditionsDiseasesJson {
	condition: Condition[];
	disease: Disease[];
	status: Status[];
}

interface ConditionDiseaseBase {
	name: string;
	entries: Entry[];
	source: Source;
	alias?: string[];
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}

export interface Condition extends ConditionDiseaseBase {}

export interface Status extends ConditionDiseaseBase {}

export type DiseaseType = "Magical Contagion";

export interface Disease extends ConditionDiseaseBase {
	type?: DiseaseType;
}
