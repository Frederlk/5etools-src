/**
 * Manual type definitions for recipes.json schema.
 * Based on schema/site/recipes.json v1.5.9
 */

import type {Entry} from "./entry.js";
import type {Source, Page, OtherSource, MetaBlock} from "./util.js";

export interface RecipesJson {
	recipe?: Recipe[];
	_meta?: MetaBlock;
}

export type RecipeType =
	| "Dwarven"
	| "Elixir/Ale"
	| "Elven"
	| "Halfling"
	| "Human"
	| "Uncommon Cuisine"
	| "Lost in Realmspace"
	| "Ravenloft"
	| "Sigil"
	| "Solamnia"
	| "The Feywild"
	| "The Rock of Bral"
	| "The Yawning Portal"
	| "The Hearth"
	| "The Gilded Horseshoe"
	| "The Pink Flumph Theater"
	| "The Low Lantern"
	| "The Halfway Inn"
	| "The Driftwood Tavern"
	| "One-Eyed Jax"
	| "The Moonstone Mask"
	| "The Hissing Stones";

export type RecipeDiet = "C" | "V" | "X";

export type RecipeMiscTag = "alcohol" | "feast";

export type RecipeAllergenGroup =
	| "celery"
	| "crustaceans"
	| "eggs"
	| "fish"
	| "gluten"
	| "lupin"
	| "milk"
	| "molluscs"
	| "mustard"
	| "nuts"
	| "peanuts"
	| "sesame"
	| "soya"
	| "sulphites";

export type RecipeDishType =
	| "appetizer"
	| "bread"
	| "cocktail"
	| "dessert"
	| "drink"
	| "entree"
	| "libation"
	| "pastry"
	| "salad"
	| "side"
	| "snack"
	| "soup"
	| "sweet";

export type TimeMinutes = number;

export interface RecipeTime {
	total?: TimeMinutes;
	cooking?: TimeMinutes;
	preparation?: TimeMinutes;
}

export interface RecipeServesRange {
	min: number;
	max: number;
	note?: Entry;
}

export interface RecipeServesExact {
	exact: number;
	note?: Entry;
}

export type RecipeServes = RecipeServesRange | RecipeServesExact;

export interface RecipeCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}

export interface Recipe {
	name: string;
	source: Source;
	page?: Page;
	alias?: string[];
	otherSources?: OtherSource[];
	time?: RecipeTime;
	serves?: RecipeServes;
	makes?: Entry;
	ingredients: Entry[];
	equipment?: Entry[];
	instructions: Entry[];
	noteCook?: Entry[];
	type?: RecipeType;
	diet?: RecipeDiet;
	miscTags?: RecipeMiscTag[];
	allergenGroups?: RecipeAllergenGroup[];
	dishTypes?: RecipeDishType[];
	hasFluff?: boolean;
	hasFluffImages?: boolean;
	_copy?: RecipeCopy;
}
