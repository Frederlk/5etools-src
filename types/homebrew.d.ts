/**
 * Manual type definitions for homebrew.json schema.
 * Based on schema/site/homebrew.json v1.11.3
 */

import type {Entry} from "./entry.js";
import type {Source} from "./util.js";

export type HomebrewStatus = "ready" | "wip" | "invalid" | "deprecated";

export type HomebrewEdition = "classic" | "one";

export interface HomebrewSource {
	json: string;
	abbreviation: string;
	full: string;
	version: string;
	color?: string;
	colorNight?: string;
	authors?: string[];
	convertedBy?: string[];
	dateReleased?: string;
	url?: string;
	partnered?: boolean;
	/** @deprecated */
	targetSchema?: string;
}

export interface HomebrewSpellSchool {
	full: string;
	short: string;
	color?: string;
}

export interface HomebrewSpellDistanceUnit {
	feetPerUnit: number;
	singular?: string;
}

export interface HomebrewPsionicType {
	full: string;
	short: string;
	color?: string;
	hasOrder?: boolean;
	isAltDisplay?: boolean;
}

export interface HomebrewCurrencyConversion {
	coin: string;
	mult: number;
	isFallback?: boolean;
}

export interface HomebrewMeta {
	sources: HomebrewSource[];
	dateAdded: number;
	dateLastModified: number;
	edition: HomebrewEdition;
	spellSchools?: Record<string, HomebrewSpellSchool>;
	spellDistanceUnits?: Record<string, HomebrewSpellDistanceUnit>;
	optionalFeatureTypes?: Record<string, string>;
	featCategories?: Record<string, string>;
	psionicTypes?: Record<string, HomebrewPsionicType>;
	currencyConversions?: Record<string, HomebrewCurrencyConversion[]>;
	_dateLastModifiedHash?: string;
	dependencies?: Record<string, string[]>;
	includes?: Record<string, string[]>;
	internalCopies?: string[];
	fonts?: Record<string, string>;
	unlisted?: true;
	status?: HomebrewStatus;
}

export interface HomebrewTest {
	additionalImageSources?: string[];
}

export interface HomebrewBlocklistItem {
	displayName: string;
	hash: string;
	category: string;
	source: Source | "*";
}

export interface WrappedAdventureBookDataItem {
	id: string;
	source: Source;
	data: AdventureBookData;
}

export interface AdventureBookData {
	[key: string]: unknown;
}

export interface SpellListSpellRef {
	name: string;
	source: Source;
}

export interface SpellListItemGroups {
	name: string;
	source: Source;
	spellListType: "groups";
	spells: SpellListSpellRef[];
}

export interface SpellListItemVariantClass {
	name: string;
	source: Source;
	spellListType: "variantClass";
	className: string;
	classSource: Source;
	spells: SpellListSpellRef[];
}

export type SpellListItem = SpellListItemGroups | SpellListItemVariantClass;

export interface Homebrew {
	_meta: HomebrewMeta;
	_test?: HomebrewTest;
	$schema?: string;
	blocklist?: HomebrewBlocklistItem[];
	adventure?: unknown[];
	adventureData?: WrappedAdventureBookDataItem[];
	monster?: unknown[];
	monsterFluff?: unknown[];
	foundryMonster?: unknown[];
	legendaryGroup?: unknown[];
	book?: unknown[];
	bookData?: WrappedAdventureBookDataItem[];
	class?: unknown[];
	classFluff?: unknown[];
	foundryClass?: unknown[];
	subclass?: unknown[];
	subclassFluff?: unknown[];
	foundrySubclass?: unknown[];
	classFeature?: unknown[];
	subclassFeature?: unknown[];
	foundryClassFeature?: unknown[];
	foundrySubclassFeature?: unknown[];
	spell?: unknown[];
	spellFluff?: unknown[];
	roll20Spell?: unknown[];
	foundrySpell?: unknown[];
	action?: unknown[];
	foundryAction?: unknown[];
	item?: unknown[];
	foundryItem?: unknown[];
	foundryMagicvariant?: unknown[];
	itemGroup?: unknown[];
	baseitem?: unknown[];
	itemProperty?: unknown[];
	itemType?: unknown[];
	itemEntry?: unknown[];
	itemTypeAdditionalEntries?: unknown[];
	itemMastery?: unknown[];
	magicvariant?: unknown[];
	linkedLootTables?: unknown[];
	itemFluff?: unknown[];
	background?: unknown[];
	backgroundFluff?: unknown[];
	foundryBackgroundFeature?: unknown[];
	charoption?: unknown[];
	charoptionFluff?: unknown[];
	condition?: unknown[];
	conditionFluff?: unknown[];
	disease?: unknown[];
	diseaseFluff?: unknown[];
	status?: unknown[];
	statusFluff?: unknown[];
	cult?: unknown[];
	boon?: unknown[];
	deity?: unknown[];
	encounter?: unknown[];
	feat?: unknown[];
	featFluff?: unknown[];
	foundryFeat?: unknown[];
	language?: unknown[];
	languageFluff?: unknown[];
	makebrewCreatureTrait?: unknown[];
	makebrewCreatureAction?: unknown[];
	reducedItemProperty?: unknown[];
	reducedItemType?: unknown[];
	monsterfeatures?: unknown[];
	name?: unknown[];
	object?: unknown[];
	objectFluff?: unknown[];
	optionalfeature?: unknown[];
	optionalfeatureFluff?: unknown[];
	foundryOptionalfeature?: unknown[];
	psionic?: unknown[];
	foundryPsionicDisciplineFocus?: unknown[];
	foundryPsionicDisciplineActive?: unknown[];
	race?: unknown[];
	subrace?: unknown[];
	foundryRace?: unknown[];
	foundryRaceFeature?: unknown[];
	raceFluff?: unknown[];
	raceFluffMeta?: unknown[];
	recipe?: unknown[];
	recipeFluff?: unknown[];
	reward?: unknown[];
	rewardFluff?: unknown[];
	foundryReward?: unknown[];
	table?: unknown[];
	trap?: unknown[];
	trapFluff?: unknown[];
	hazard?: unknown[];
	hazardFluff?: unknown[];
	variantrule?: unknown[];
	vehicle?: unknown[];
	vehicleUpgrade?: unknown[];
	foundryVehicleUpgrade?: unknown[];
	vehicleFluff?: unknown[];
	skill?: unknown[];
	sense?: unknown[];
	spellList?: SpellListItem[];
	deck?: unknown[];
	card?: unknown[];
	citation?: unknown[];
	facility?: unknown[];
	facilityFluff?: unknown[];
}
