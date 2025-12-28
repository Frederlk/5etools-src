/**
 * Manual type definitions for book.json and books.json schema.
 */

import type {Entry} from "./entry.js";
import type {Source, Page} from "./util.js";

export interface BooksJson {
	book?: BookIndex[];
}

export interface BookIndex {
	id: string;
	name: string;
	source: Source;
	group: BookGroup;
	cover?: MediaHref;
	published?: string;
	publishedOrder?: number;
	author?: string;
	contents?: BookContents[];
}

export type BookGroup =
	| "core" | "supplement" | "adventures" | "prerelease"
	| "homebrew" | "other" | "screen";

export interface BookContents {
	name: string;
	headers?: string[];
	ordinal?: ContentsOrdinal;
}

export interface ContentsOrdinal {
	type?: "chapter" | "appendix" | "part";
	identifier?: number | string;
}

export interface BookJson {
	data?: BookData[];
	_meta?: BookMeta;
}

export interface BookMeta {
	dependencies?: Record<string, string[]>;
	otherSources?: Record<string, unknown>;
}

export interface BookData {
	type: "section";
	name: string;
	page?: Page;
	id?: string;
	entries?: Entry[];
	data?: Record<string, unknown>;
}

export interface MediaHref {
	type: "internal" | "external";
	path?: string;
	url?: string;
}
