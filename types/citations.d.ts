/**
 * Manual type definitions for citations.json schema.
 */

import type {Entry} from "./entry.js";
import type {Source, Page} from "./util.js";

export interface CitationsJson {
	citation: Citation[];
}

export interface Citation {
	name: string;
	source: Source;
	page?: Page;
	entries: Entry[];
}
