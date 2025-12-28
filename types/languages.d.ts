/**
 * Manual type definitions for languages.json schema.
 * Based on schema/site/languages.json v1.1.17
 */

import type {Entry} from "./entry.js";
import type {Source, Page, OtherSource, ReprintedAs} from "./util.js";

export interface LanguagesJson {
	language: Language[];
	languageScript?: LanguageScript[];
}

export type LanguageType = "standard" | "rare" | "exotic" | "secret";

export interface Language {
	name: string;
	source: Source;
	page?: Page;
	entries?: Entry[];
	legacy?: boolean;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	typicalSpeakers?: string[];
	origin?: string;
	script?: string;
	type?: LanguageType;
	additionalSources?: OtherSource[];
	dialects?: string[];
	fonts?: string[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}

export interface LanguageScript {
	name: string;
	source: Source;
	fonts: string[];
}
