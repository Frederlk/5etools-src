import type {Entry, EntryImage} from "../entry.js";
import type {Source, MetaBlock} from "../util.js";
import type {CopyBlock} from "../util-copy.js";

export interface ClassFluffItem {
	name: string;
	source: Source;
	preserveName?: true;
	images?: EntryImage[] | null;
	entries?: Entry[];
}

export interface ClassFluffItemCopy {
	name?: string;
	source?: Source;
	preserveName?: true;
	images?: EntryImage[] | null;
	entries?: Entry[];
	_copy: CopyBlock;
}

export type ClassFluff = ClassFluffItem | ClassFluffItemCopy;

export interface SubclassFluffItem {
	name: string;
	shortName: string;
	source: Source;
	className: string;
	classSource: Source;
	preserveName?: true;
	images?: EntryImage[] | null;
	entries?: Entry[];
}

export interface SubclassFluffItemCopy {
	name?: string;
	shortName?: string;
	source?: Source;
	className?: string;
	classSource?: Source;
	preserveName?: true;
	images?: EntryImage[] | null;
	entries?: Entry[];
	_copy: CopyBlock;
}

export type SubclassFluff = SubclassFluffItem | SubclassFluffItemCopy;

export interface FluffClassJson {
	_meta?: MetaBlock;
	classFluff?: ClassFluff[];
	subclassFluff?: SubclassFluff[];
}
