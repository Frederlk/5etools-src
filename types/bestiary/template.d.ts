/**
 * Manual type definitions for bestiary/template.json schema.
 * Based on schema/site/bestiary/template.json v2.0.0
 */

import type {Source, Page, MetaBlock} from "../util.js";
import type {Monster} from "./bestiary.js";

export interface MonsterTemplateJson {
	monsterTemplate?: MonsterTemplate[];
	_meta?: MetaBlock;
}

export type MonsterTemplate = MonsterTemplateStandard | MonsterTemplateCopy;

export interface MonsterTemplateStandard {
	name: string;
	source: Source;
	page?: Page;
	ref?: string;
	crMin?: string;
	crMax?: string;
	prerequisite?: MonsterTemplatePrerequisite;
	apply: MonsterTemplateApply;
}

export interface MonsterTemplateCopy {
	name?: string;
	source?: Source;
	page?: Page;
	ref?: string;
	crMin?: string;
	crMax?: string;
	prerequisite?: MonsterTemplatePrerequisite;
	apply?: MonsterTemplateApply;
	_copy: CopyBlockGeneric;
}

export interface MonsterTemplatePrerequisite {
	[key: string]: PrerequisiteRange | PrerequisiteOneOf;
}

export interface PrerequisiteRange {
	min?: unknown;
	max?: unknown;
}

export interface PrerequisiteOneOf {
	oneOf: unknown[];
}

export interface MonsterTemplateApply {
	_root?: Partial<Monster>;
	_mod?: ModObject;
}

export interface CopyBlockGeneric {
	name: string;
	source: Source;
	_mod?: ModObject;
	_templates?: TemplateReference[];
	_preserve?: PreserveObject;
}

export interface TemplateReference {
	name: string;
	source: Source;
}

export interface PreserveObject {
	[key: string]: true;
}

export type ModObject = {
	[key: string]: string | CopyModifier | CopyModifier[];
};

export type CopyModifier =
	| ModReplaceTxt
	| ModReplaceName
	| ModAppendStr
	| ModPrependArr
	| ModAppendArr
	| ModAppendIfNotExistsArr
	| ModReplaceArr
	| ModReplaceOrAppendArr
	| ModInsertArr
	| ModRemoveArrByNames
	| ModRemoveArrByItems
	| ModRenameArr
	| ModSetProp
	| ModCalculateProp
	| ModReplaceSpells
	| ModRemoveSpells
	| ModAddSpells
	| ModAddSkills
	| ModAddSaves
	| ModAddAllSkills
	| ModAddAllSaves
	| ModAddSenses
	| ModScalarAddProp
	| ModScalarMultProp
	| ModScalarAddHit
	| ModScalarAddDc
	| ModMaxSize
	| ModScalarMultXp
	| ModPrefixSuffixStringProp;

export interface ModReplaceTxt {
	mode: "replaceTxt";
	replace: string;
	with: string;
	flags?: string;
	props?: (string | null)[];
}

export interface ModReplaceName {
	mode: "replaceName";
	replace: string;
	with: string;
	flags?: string;
}

export interface ModAppendStr {
	mode: "appendStr";
	str: string;
	joiner?: string;
}

export interface ModPrependArr {
	mode: "prependArr";
	items: string | object | unknown[];
}

export interface ModAppendArr {
	mode: "appendArr";
	items: string | object | unknown[];
}

export interface ModAppendIfNotExistsArr {
	mode: "appendIfNotExistsArr";
	items: string | object | unknown[];
}

export type ReplaceTarget = string | {index: number} | {regex: string; flags?: string};

export interface ModReplaceArr {
	mode: "replaceArr";
	replace: ReplaceTarget;
	items: string | object | unknown[];
}

export interface ModReplaceOrAppendArr {
	mode: "replaceOrAppendArr";
	replace: ReplaceTarget;
	items: object | unknown[];
}

export interface ModInsertArr {
	mode: "insertArr";
	index: number;
	items: string | object | unknown[];
}

export interface ModRemoveArrByNames {
	mode: "removeArr";
	names: string | string[];
	force?: true;
}

export interface ModRemoveArrByItems {
	mode: "removeArr";
	items: string | unknown[];
	force?: true;
}

export interface ModRenameArr {
	mode: "renameArr";
	renames: RenameEntry | RenameEntry[];
}

export interface RenameEntry {
	rename: string;
	with: string;
}

export interface ModSetProp {
	mode: "setProp";
	prop?: string;
	value: unknown;
}

export interface ModCalculateProp {
	mode: "calculateProp";
	prop: string;
	formula: string;
}

export interface ModReplaceSpells {
	mode: "replaceSpells";
	spells?: SpellReplacementObject;
	daily?: SpellReplacementObject;
}

export interface ModRemoveSpells {
	mode: "removeSpells";
	spells?: SpellAddRemoveObject;
	daily?: SpellAddRemoveObject;
}

export interface ModAddSpells {
	mode: "addSpells";
	name?: string;
	spells?: Record<string, {spells: string[]}>;
	will?: string[];
	daily?: SpellAddRemoveObject;
	weekly?: SpellAddRemoveObject;
	monthly?: SpellAddRemoveObject;
	yearly?: SpellAddRemoveObject;
}

export interface SpellReplacementObject {
	[level: string]: {replace: string; with: string}[];
}

export interface SpellAddRemoveObject {
	[level: string]: string[];
}

export interface ModAddSkills {
	mode: "addSkills";
	skills: Record<string, ProficiencyLevel>;
}

export interface ModAddSaves {
	mode: "addSaves";
	saves: Record<AbilityScoreAbbrev, ProficiencyLevel>;
}

export interface ModAddAllSkills {
	mode: "addAllSkills";
	skills: ProficiencyLevel;
}

export interface ModAddAllSaves {
	mode: "addAllSaves";
	saves: ProficiencyLevel;
}

export interface ModAddSenses {
	mode: "addSenses";
	senses: SenseObject | SenseObject[];
}

export interface SenseObject {
	type: "blindsight" | "darkvision" | "tremorsense" | "truesight";
	range: number;
}

export interface ModScalarAddProp {
	mode: "scalarAddProp";
	prop: string;
	scalar: number;
}

export interface ModScalarMultProp {
	mode: "scalarMultProp";
	prop: string;
	scalar: number;
	floor?: true;
}

export interface ModScalarAddHit {
	mode: "scalarAddHit";
	scalar: number;
}

export interface ModScalarAddDc {
	mode: "scalarAddDc";
	scalar: number;
}

export interface ModMaxSize {
	mode: "maxSize";
	max: Size;
}

export interface ModScalarMultXp {
	mode: "scalarMultXp";
	scalar: number;
	floor?: true;
}

export interface ModPrefixSuffixStringProp {
	mode: "prefixSuffixStringProp";
	prop?: string;
	prefix?: string;
	suffix?: string;
}

export type ProficiencyLevel = 0 | 1 | 2;
export type AbilityScoreAbbrev = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type Size = "F" | "D" | "T" | "S" | "M" | "L" | "H" | "G" | "C" | "V";
