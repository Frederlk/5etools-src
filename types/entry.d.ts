/**
 * Manual type definitions for entry.json schema.
 * This schema is recursive and cannot be auto-generated.
 * Based on schema/site/entry.json v1.9.16
 */

export type Entry = string | EntryObject;

export type EntryObject =
	| EntrySection
	| EntryEntries
	| EntryQuote
	| EntryInlineEntries
	| EntryOptions
	| EntryTable
	| EntryTableGroup
	| EntryList
	| EntryBonus
	| EntryBonusSpeed
	| EntryDice
	| EntryAbilityDc
	| EntryAbilityAttackMod
	| EntryLink
	| EntryOptFeature
	| EntryInset
	| EntryInsetReadaloud
	| EntryVariant
	| EntryVariantInner
	| EntryVariantSub
	| EntryItem
	| EntryItemSub
	| EntryItemSpell
	| EntryImage
	| EntryGallery
	| EntryActions
	| EntryAttack
	| EntryFlowchart
	| EntryFlowBlock
	| EntryIngredient
	| EntryStatblockInline
	| EntryStatblock
	| EntryRefClassFeature
	| EntryRefSubclassFeature
	| EntryRefOptionalfeature
	| EntryRefFeat
	| EntryHr
	| EntrySpellcasting
	| EntryWrapped;

export interface EntryBase {
	name?: string;
	source?: string;
	page?: number | string;
	data?: Record<string, unknown>;
	id?: string;
}

export interface EntrySection extends EntryBase {
	type: "section";
	entries?: Entry[];
}

export interface EntryEntries extends EntryBase {
	type: "entries";
	entries?: Entry[];
	alias?: string[];
}

export interface EntryQuote extends EntryBase {
	type: "quote";
	entries?: Entry[];
	by?: string;
	from?: string;
	skipMarks?: boolean;
	skipItalics?: boolean;
}

export interface EntryInlineEntries extends EntryBase {
	type: "inline";
	entries?: Entry[];
}

export interface EntryOptions extends EntryBase {
	type: "options";
	entries?: Entry[];
	count?: number;
	style?: string;
}

export interface EntryTable extends EntryBase {
	type: "table";
	caption?: string;
	colLabels?: (string | EntryTableHeaderCell)[];
	colStyles?: string[];
	rows?: EntryTableRow[];
	rowStyles?: string[];
	footnotes?: Entry[];
	intro?: Entry[];
	outro?: Entry[];
}

export interface EntryTableGroup extends EntryBase {
	type: "tableGroup";
	tables?: EntryTable[];
}

export interface EntryTableRow {
	type: "row";
	row?: (string | EntryTableCell | Entry)[];
	style?: string;
}

export interface EntryTableHeaderCell {
	type?: "cell";
	entry?: Entry;
	width?: number;
	isRoller?: boolean;
}

export interface EntryTableCell {
	type: "cell";
	entry?: Entry;
	width?: number;
	roll?: {
		exact?: number;
		min?: number;
		max?: number;
		pad?: boolean;
	};
}

export interface EntryList extends EntryBase {
	type: "list";
	items?: Entry[];
	style?: string;
	columns?: number;
}

export interface EntryBonus extends EntryBase {
	type: "bonus";
	value?: number;
}

export interface EntryBonusSpeed extends EntryBase {
	type: "bonusSpeed";
	value?: number;
}

export interface EntryDice extends EntryBase {
	type: "dice";
	toRoll?: DiceExpression[];
	rollable?: boolean;
}

export interface DiceExpression {
	number?: number;
	faces?: number;
	modifier?: number;
	hideModifier?: boolean;
}

export interface EntryAbilityDc extends EntryBase {
	type: "abilityDc";
	attributes?: string[];
}

export interface EntryAbilityAttackMod extends EntryBase {
	type: "abilityAttackMod";
	attributes?: string[];
}

export interface EntryLink extends EntryBase {
	type: "link";
	text?: string;
	href?: MediaHref;
}

export interface EntryOptFeature extends EntryBase {
	type: "optfeature";
	prerequisite?: string;
	entries?: Entry[];
}

export interface EntryInset extends EntryBase {
	type: "inset";
	entries?: Entry[];
}

export interface EntryInsetReadaloud extends EntryBase {
	type: "insetReadaloud";
	entries?: Entry[];
}

export interface EntryVariant extends EntryBase {
	type: "variant";
	entries?: Entry[];
}

export interface EntryVariantInner extends EntryBase {
	type: "variantInner";
	entries?: Entry[];
}

export interface EntryVariantSub extends EntryBase {
	type: "variantSub";
	entries?: Entry[];
}

export interface EntryItem extends EntryBase {
	type: "item";
	entry?: Entry;
	entries?: Entry[];
}

export interface EntryItemSub extends EntryBase {
	type: "itemSub";
	entry?: Entry;
	entries?: Entry[];
}

export interface EntryItemSpell extends EntryBase {
	type: "itemSpell";
	entry?: Entry;
	entries?: Entry[];
}

export interface EntryImage extends EntryBase {
	type: "image";
	href?: MediaHref;
	hrefThumbnail?: MediaHref;
	title?: string;
	altText?: string;
	imageType?: string;
	width?: number;
	height?: number;
	maxWidth?: number;
	maxHeight?: number;
	maxWidthUnits?: string;
	maxHeightUnits?: string;
	style?: string;
}

export interface EntryGallery extends EntryBase {
	type: "gallery";
	images?: EntryImage[];
}

export interface EntryActions extends EntryBase {
	type: "actions";
	entries?: Entry[];
}

export interface EntryAttack extends EntryBase {
	type: "attack";
	attackType?: string;
	attackEntries?: Entry[];
	hitEntries?: Entry[];
}

export interface EntryFlowchart extends EntryBase {
	type: "flowchart";
	blocks?: EntryFlowBlock[];
}

export interface EntryFlowBlock extends EntryBase {
	type: "flowBlock";
	entries?: Entry[];
}

export interface EntryIngredient extends EntryBase {
	type: "ingredient";
	entry?: Entry;
}

export interface EntryStatblockInline extends EntryBase {
	type: "statblockInline";
	dataType?: string;
	data?: Record<string, unknown>;
	displayName?: string;
	style?: "inset" | "narrow";
	collapsed?: true;
}

export interface EntryStatblock extends EntryBase {
	type: "statblock";
	tag?: string;
	hash?: string;
	displayName?: string;
	style?: "inset" | "narrow";
	collapsed?: true;
}

export interface EntryRefClassFeature extends EntryBase {
	type: "refClassFeature";
	classFeature?: string;
}

export interface EntryRefSubclassFeature extends EntryBase {
	type: "refSubclassFeature";
	subclassFeature?: string;
}

export interface EntryRefOptionalfeature extends EntryBase {
	type: "refOptionalfeature";
	optionalfeature?: string;
}

export interface EntryRefFeat extends EntryBase {
	type: "refFeat";
	feat?: string;
}

export interface EntryHr extends EntryBase {
	type: "hr";
}

export interface EntrySpellcasting extends EntryBase {
	type: "spellcasting";
	headerEntries?: Entry[];
	will?: string[];
	ritual?: string[];
	daily?: SpellcastingFrequency;
	weekly?: SpellcastingFrequency;
	monthly?: SpellcastingFrequency;
	yearly?: SpellcastingFrequency;
	recharge?: SpellcastingRecharge;
	charges?: SpellcastingCharges;
	rest?: SpellcastingRest;
	spells?: Record<string, SpellLevel>;
	footerEntries?: Entry[];
	hidden?: string[];
	displayAs?: string;
	ability?: string;
}

export interface SpellcastingFrequency {
	"1"?: string[];
	"2"?: string[];
	"3"?: string[];
	"1e"?: string[];
	"2e"?: string[];
	"3e"?: string[];
}

export interface SpellcastingRecharge {
	"4"?: string[];
	"5"?: string[];
	"6"?: string[];
	"4e"?: string[];
	"5e"?: string[];
	"6e"?: string[];
}

export interface SpellcastingCharges {
	[key: string]: string[];
}

export interface SpellcastingRest {
	short?: SpellcastingFrequency;
	long?: SpellcastingFrequency;
}

export interface SpellLevel {
	slots?: number;
	spells?: string[];
	lower?: number;
}

export interface EntryWrapped extends EntryBase {
	type: "wrapper";
	wrapped?: Entry;
}

export interface MediaHrefInternal {
	type: "internal";
	path: string;
}

export interface MediaHrefExternal {
	type: "external";
	url: string;
}

export type MediaHref = MediaHrefInternal | MediaHrefExternal;
