/**
 * Manual type definitions for variantrules.json schema.
 */

import type {Entry} from "./entry.js";
import type {Source, Page, OtherSource, ReprintedAs} from "./util.js";

export interface VariantRulesJson {
	variantrule?: VariantRule[];
}

export type VariantRuleType = "C" | "O" | "V" | "VO" | "VV";

export interface VariantRule {
	name: string;
	source: Source;
	entries: Entry[];
	type?: string;
	page?: Page;
	ruleType?: VariantRuleType;
	legacy?: boolean;
	additionalSources?: OtherSource[];
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}
