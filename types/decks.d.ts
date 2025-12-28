/**
 * Manual type definitions for decks.json schema.
 * Based on schema/site/decks.json v1.0.5
 */

import type {Entry, EntryImage} from "./entry.js";
import type {Source, Page, OtherSource, MetaBlock} from "./util.js";

export interface DecksJson {
	deck: Deck[];
	card: Card[];
	_meta?: MetaBlock;
}

export interface DeckCardReference {
	uid: string;
	count?: number;
	replacement?: true;
}

export type DeckCard = string | DeckCardReference;

export interface DeckData {
	name?: string;
	alias?: string[];
	source?: Source;
	otherSources?: OtherSource[];
	page?: Page;
	cards?: DeckCard[];
	entries?: Entry[];
	back?: EntryImage;
	hasCardArt?: boolean;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}

export interface DeckCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}

export type Deck = DeckBase | DeckWithCopy;

export interface DeckBase extends DeckData {
	name: string;
	source: Source;
	cards: DeckCard[];
}

export interface DeckWithCopy extends DeckData {
	_copy: DeckCopy;
}

export interface CardData {
	name?: string;
	alias?: string[];
	source?: Source;
	otherSources?: OtherSource[];
	set?: string;
	page?: Page;
	entries?: Entry[];
	face?: EntryImage;
	back?: EntryImage;
	suit?: string;
	value?: number;
	valueName?: string;
	srd?: boolean | string;
	srd52?: boolean | string;
	basicRules?: boolean;
	basicRules2024?: boolean;
}

export interface CardCopy {
	name: string;
	source: Source;
	_mod?: Record<string, unknown>;
	_preserve?: Record<string, boolean>;
}

export type Card = CardBase | CardWithCopy;

export interface CardBase extends CardData {
	name: string;
	source: Source;
	set: string;
}

export interface CardWithCopy extends CardData {
	_copy: CardCopy;
}
