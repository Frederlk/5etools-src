// Markdown Converter - TypeScript implementation
// Migrated from js/render-markdown.js MarkdownConverter class
// Parses markdown back to Entry objects

import type { Entry, EntryTable, EntryList } from "../../../types/entry.js";
import { getWalker, type WalkerHandlers } from "../util/misc-util.js";
import { ascSort } from "../util/sort-util.js";
import { stripTags } from "../renderer/tags.js";

// ============ Types ============

export interface ConvertedEntry extends Record<string, unknown> {
	type?: string;
	name?: string;
	entries?: Entry[];
}

export interface TablePostProcessOptions {
	tableWidth?: number;
	diceColWidth?: number;
}

// Internal table type that matches what the converter actually produces
// The converter creates simple string[][] for rows (legacy behavior)
interface ConverterEntryTable {
	type: "table";
	caption?: string;
	colLabels?: string[];
	colStyles?: string[];
	rows?: string[][];
}

interface MdBlockMeta {
	mdType: string;
	lines: string[];
	name?: string;
	caption?: string;
}

interface EntryChildMeta {
	type: string;
	key: string;
	depth?: number;
	depthIncrement?: number;
}

// ============ Constants ============

const ENTRIES_WITH_ENUMERATED_TITLES: EntryChildMeta[] = [
	{ type: "section", key: "entries", depth: -1 },
	{ type: "entries", key: "entries", depthIncrement: 1 },
	{ type: "options", key: "entries" },
	{ type: "inset", key: "entries", depth: 2 },
	{ type: "insetReadaloud", key: "entries", depth: 2 },
	{ type: "variant", key: "entries", depth: 2 },
	{ type: "variantInner", key: "entries", depth: 2 },
	{ type: "actions", key: "entries", depth: 2 },
	{ type: "flowBlock", key: "entries", depth: 2 },
	{ type: "optfeature", key: "entries", depthIncrement: 1 },
	{ type: "patron", key: "entries" },
];

const ENTRIES_WITH_CHILDREN: EntryChildMeta[] = [
	...ENTRIES_WITH_ENUMERATED_TITLES,
	{ type: "list", key: "items" },
	{ type: "table", key: "rows" },
];

// ============ Utility Functions ============

const last = <T>(arr: T[]): T | undefined => arr[arr.length - 1];

const cleanHtmlString = (mdStr: string): string => {
	return mdStr
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/g, " ")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
};

// ============ Markdown Converter Class ============

export class MarkdownConverter {
	static getEntries(mdStr: string): Entry[] {
		mdStr = mdStr.trim();
		if (!mdStr) return [];

		mdStr = this._getCleanGmBinder(mdStr);

		const buf: (string | ConvertedEntry | MdBlockMeta)[] = mdStr.split("\n").map(line => line.trimEnd());

		this._coalesceCreatures(buf);
		this._convertCreatures(buf);

		this._coalesceInsetsReadalouds(buf);
		this._convertInsetsReadalouds(buf);

		this._coalesceTables(buf);
		this._convertTables(buf);

		this._coalesceLists(buf);
		this._convertLists(buf);

		this._coalesceHeaders(buf);

		this._convertInlineStyling(buf);
		this._cleanEmptyLines(buf);
		this._cleanEntries(buf);

		return buf as Entry[];
	}

	private static _getCleanGmBinder(mdStr: string): string {
		mdStr = mdStr.replace(/(^|\n)\s*\\(pagebreakNum|pagebreak|columnbreak)/gi, "");

		try {
			mdStr = cleanHtmlString(mdStr);
		} catch {
			// Ignore errors
		}

		return mdStr;
	}

	// ============ Creature Handling ============

	private static _coalesceCreatures(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		for (let i = 0; i < buf.length; ++i) {
			const line = typeof buf[i] === "string" ? (buf[i] as string).trim() : "";

			if (line === "___" || line === "---") {
				let j = 1;

				for (; i + j < buf.length; ++j) {
					const nxt = buf[i + j];
					if (!nxt || typeof nxt !== "string" || !nxt.startsWith(">")) break;
				}

				const creatureLines = buf.slice(i, i + j);
				if (creatureLines.length === 1) {
					buf.splice(i, 1);
					i--;
				} else {
					buf.splice(i, j, {
						mdType: "creature",
						lines: creatureLines as string[],
					} as MdBlockMeta);
				}
			}
		}
	}

	private static _convertCreatures(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		for (let i = 0; i < buf.length; ++i) {
			const line = buf[i];
			if (typeof line === "string") continue;

			if ((line as MdBlockMeta).mdType === "creature") {
				const meta = line as MdBlockMeta;
				buf[i] = {
					type: "inset",
					name: "(To convert creature stat blocks, please use the Text Converter utility)",
					entries: meta.lines.slice(1).map(it => it.slice(1).trim()),
				};
			}
		}
	}

	// ============ Inset/Readaloud Handling ============

	private static _coalesceInsetsReadalouds(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		const getCleanLine = (l: string): string => l.replace(/^>>?\s*/, "");

		for (let i = 0; i < buf.length; ++i) {
			let line = buf[i];

			if (typeof line !== "string") {
				this._coalesceConvert_doRecurse(line as ConvertedEntry, this._coalesceInsetsReadalouds.bind(this));
			} else {
				line = line.trim();

				if (this._coalesceInsets_isInsetLine(line) || this._coalesceInsets_isReadaloudLine(line)) {
					const type = this._coalesceInsets_isReadaloudLine(line) ? "insetReadaloud" : "inset";

					let j = 1;
					const header = /^>\s*#####\s+/.test(line) ? line.replace(/^>\s*#####\s+/, "") : null;

					for (; j < buf.length; ++j) {
						const lNxt = buf[i + j];
						if (typeof lNxt === "object") continue;
						if (!lNxt) break;
						if (type === "insetReadaloud" && !this._coalesceInsets_isReadaloudLine(lNxt)) break;
						if (type === "inset" && !this._coalesceInsets_isInsetLine(lNxt)) break;
					}

					const lines = buf.slice(i, i + j).map(l => getCleanLine(l as string));
					const out: MdBlockMeta = { mdType: type, lines };
					if (header) {
						out.name = header;
						lines.shift();
					}
					buf.splice(i, j, out);
				}
			}
		}
	}

	private static _coalesceInsets_isReadaloudLine(l: string): boolean {
		return l.trim().startsWith(">>");
	}

	private static _coalesceInsets_isInsetLine(l: string): boolean {
		return l.trim().startsWith(">");
	}

	private static _convertInsetsReadalouds(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		for (let i = 0; i < buf.length; ++i) {
			const line = buf[i];
			if (typeof line === "string") continue;

			const meta = line as MdBlockMeta;
			if (meta.mdType === "inset" || meta.mdType === "insetReadaloud") {
				const out: ConvertedEntry = {
					type: meta.mdType,
					name: meta.name,
					entries: meta.lines,
				};
				if (!out.name || !(out.name as string).trim()) delete out.name;
				buf[i] = out;
			}
		}
	}

	// ============ Table Handling ============

	private static _coalesce_getLastH5Index(
		line: string | ConvertedEntry | MdBlockMeta,
		i: number,
		curCaptionIx: number
	): number {
		if (typeof line === "string") {
			if (line.trim()) {
				if (line.startsWith("##### ")) return i;
				else return -1;
			}
		} else return -1;
		return curCaptionIx;
	}

	private static _coalesceTables(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		let lastCaptionIx = -1;

		for (let i = 0; i < buf.length; ++i) {
			if (i > 0) {
				const lPrev = buf[i - 1];
				lastCaptionIx = this._coalesce_getLastH5Index(lPrev, i - 1, lastCaptionIx);
			}

			const l1 = buf[i];
			const l2 = buf[i + 1];

			if (
				typeof l1 === "string" &&
				typeof l2 === "string" &&
				l1.includes("|") &&
				l2.includes("|") &&
				l2.includes("---") &&
				/^[ |:-]+$/gi.test(l2)
			) {
				let j = 2;
				for (; j < buf.length; ++j) {
					const lNxt = buf[i + j];
					if (!lNxt || !this._coalesceTables_isTableLine(lNxt)) break;
				}

				if (lastCaptionIx != null && ~lastCaptionIx) {
					const lines = buf.slice(lastCaptionIx, i + j) as string[];
					buf.splice(lastCaptionIx, j + (i - lastCaptionIx), {
						mdType: "table",
						caption: lines[0].replace("##### ", ""),
						lines: lines.slice(1),
					} as MdBlockMeta);
				} else {
					const lines = buf.slice(i, i + j) as string[];
					buf.splice(i, j, { mdType: "table", lines } as MdBlockMeta);
				}
			}
		}
	}

	private static _coalesceTables_isTableLine(l: string | ConvertedEntry | MdBlockMeta): boolean {
		if (typeof l !== "string") return false;
		l = l.trim();
		if (!l.includes("|")) return false;
		return !/^#+ /.test(l) && !l.startsWith("> ") && !/^[-*+]/.test(l);
	}

	private static _convertTables(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		for (let i = 0; i < buf.length; ++i) {
			const line = buf[i];
			if (typeof line === "string") continue;

			const entry = line as ConvertedEntry | MdBlockMeta;
			if (!(entry as MdBlockMeta).mdType) {
				this._coalesceConvert_doRecurse(entry as ConvertedEntry, this._convertTables.bind(this));
			} else {
				if ((entry as MdBlockMeta).mdType !== "table") continue;

				const meta = entry as MdBlockMeta;
				buf[i] = this.getConvertedTable(meta.lines, meta.caption) as unknown as ConvertedEntry;
			}
		}
	}

	// ============ List Handling ============

	private static _coalesceLists(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		for (let i = 0; i < buf.length; ++i) {
			const line = buf[i];

			if (typeof line !== "string") {
				this._coalesceConvert_doRecurse(line as ConvertedEntry, this._coalesceLists.bind(this));
			} else {
				const liM = this._coalesceLists_isListItem(line);
				if (liM) {
					let j = 1;
					let blankCount = 0;

					for (; i + j < buf.length; ++j) {
						const nxt = buf[i + j];
						if (!nxt || (typeof nxt === "string" && !nxt.trim())) {
							if (blankCount++ < 1) continue;
							else break;
						}
						blankCount = 0;
						if (typeof nxt !== "string") break;
						if (!this._coalesceLists_isListItem(nxt)) break;
					}

					const listLines = buf.slice(i, i + j).filter(it => typeof it === "string" && it.trim()) as string[];
					buf.splice(i, j, { mdType: "list", lines: listLines } as MdBlockMeta);
				}
			}
		}
	}

	private static _coalesceLists_isListItem(line: string): boolean {
		return /^(\s*)\* /.test(line) || /^(\s*)- /.test(line) || /^(\s*)\+ /.test(line);
	}

	private static _convertLists(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		for (let i = 0; i < buf.length; ++i) {
			const line = buf[i];
			if (typeof line === "string") continue;

			const entry = line as ConvertedEntry | MdBlockMeta;
			if (!(entry as MdBlockMeta).mdType) {
				this._coalesceConvert_doRecurse(entry as ConvertedEntry, this._convertLists.bind(this));
			} else {
				if ((entry as MdBlockMeta).mdType !== "list") continue;

				const meta = entry as MdBlockMeta;
				meta.lines = this._convertLists_doNormalise(meta.lines);

				const stack: EntryList[] = [];

				const getStackDepth = (): number | null => {
					if (!stack.length) return null;
					return stack.length - 1;
				};

				meta.lines.forEach(l => {
					const depth = l.length - l.trimStart().length;
					const lText = l.trim();

					const stackDepth = getStackDepth();
					if (stackDepth == null) {
						const list: EntryList = { type: "list", items: [lText] };
						stack.push(list);
					} else {
						if (depth === stackDepth) {
							last(stack)!.items!.push(lText);
						} else if (depth > stackDepth) {
							const list: EntryList = { type: "list", items: [lText] };
							last(stack)!.items!.push(list as unknown as Entry);
							stack.push(list);
						} else if (depth < stackDepth) {
							while (depth < getStackDepth()!) stack.pop();

							if (stack.length) last(stack)!.items!.push(lText);
							else stack.push({ type: "list", items: [lText] });
						}
					}
				});

				buf.splice(i, 1, stack[0] as unknown as ConvertedEntry);
			}
		}
	}

	private static _convertLists_doNormalise(lst: string[]): string[] {
		const getCleanLine = (l: string): string => l.replace(/^\s*[-+*]\s*/, "");

		const isInDepthRange = (depthRange: [number | null, number | null], depth: number): boolean =>
			(depthRange[0] == null && depthRange[1] == null) || (depth >= depthRange[0]! - 1 && depth <= depthRange[1]! + 1);

		const setDepthRange = (depthRange: [number | null, number | null], depth: number): void => {
			depthRange[0] = depthRange[1] = depth;
		};

		const expandDepthRange = (depthRange: [number | null, number | null], depth: number): void => {
			if (depthRange[0] == null && depthRange[1] == null) {
				depthRange[0] = depth;
				depthRange[1] = depth;
			} else {
				depthRange[0] = Math.min(depthRange[0]!, depth);
				depthRange[1] = Math.max(depthRange[1]!, depth);
			}
		};

		let targetDepth = 0;
		const depthRange: [number | null, number | null] = [null, null];

		return lst.map(l => {
			const depth = l.length - l.trimStart().length;

			if (isInDepthRange(depthRange, depth)) {
				expandDepthRange(depthRange, depth);
			} else if (depth > depthRange[1]!) {
				targetDepth++;
				setDepthRange(depthRange, depth);
			} else if (depth < depthRange[0]!) {
				const targetDepthReduction = Math.floor((depthRange[0]! - depth) / 2);
				targetDepth = Math.max(0, targetDepth - targetDepthReduction);
				setDepthRange(depthRange, depth);
			}
			return `${" ".repeat(targetDepth)}${getCleanLine(l)}`;
		});
	}

	// ============ Header Handling ============

	private static _coalesceHeaders(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		const stack: ConvertedEntry[] = [];

		const i = { _: 0 };
		for (; i._ < buf.length; ++i._) {
			let line = buf[i._];

			if (typeof line !== "string") {
				if (!stack.length) continue;
				else {
					buf.splice(i._--, 1);
					last(stack)!.entries!.push(line as Entry);
					continue;
				}
			} else line = line.trim();

			const mHashes = /^(#+) /.test(line);
			const mInlineHeaderStars = /\*\*\*\s*([^.?!:]+[.?!:])\s*\*\*\*(.*)/.test(line);
			const mInlineHeaderUnders = /___\s*([^.?!:]+[.?!:])\s*___(.*)/.test(line);

			if (mHashes) {
				const name = line.replace(/^#+ /, "");
				const numHashes = line.length - (name.length + 1);
				switch (numHashes) {
					case 1:
						this._coalesceHeaders_addBlock(buf, i, stack, -2, name);
						break;
					case 2:
						this._coalesceHeaders_addBlock(buf, i, stack, -1, name);
						break;
					case 3:
						this._coalesceHeaders_addBlock(buf, i, stack, 0, name);
						break;
					case 4:
					case 5:
						this._coalesceHeaders_addBlock(buf, i, stack, 1, name);
						break;
				}
			} else if (mInlineHeaderStars || mInlineHeaderUnders) {
				const mInline = line.match(/\*\*\*\s*([^.?!:]+[.?!:])\s*\*\*\*(.*)/) || line.match(/___\s*([^.?!:]+[.?!:])\s*___(.*)/);
				if (mInline) {
					const name = mInline[1];
					const text = mInline[2];
					this._coalesceHeaders_addBlock(buf, i, stack, 2, name.replace(/[.?!:]\s*$/, ""));
					last(stack)!.entries!.push(text);
				}
			} else {
				if (!stack.length) continue;

				buf.splice(i._--, 1);
				last(stack)!.entries!.push(line);
			}
		}
	}

	private static _coalesceHeaders_getStackDepth(stack: ConvertedEntry[]): number | null {
		if (!stack.length) return null;

		let count = 0;
		let start = 0;
		for (let i = stack.length - 1; i >= 0; --i) {
			const ent = stack[i];
			if (ent.type === "section") {
				start = -1;
				break;
			} else {
				count++;
			}
		}

		return start + count;
	}

	private static _coalesceHeaders_addBlock(
		buf: (string | ConvertedEntry | MdBlockMeta)[],
		i: { _: number },
		stack: ConvertedEntry[],
		depth: number,
		name: string
	): void {
		const targetDepth = depth === -2 ? -1 : depth;

		const curDepth = this._coalesceHeaders_getStackDepth(stack);
		if (curDepth == null || depth === -2) {
			while (stack.length) stack.pop();

			buf[i._] = this._coalesceHeaders_getRoot(stack, depth);
			if (depth <= 0) last(stack)!.name = name;
			else this._coalesceHeaders_handleTooShallow(stack, targetDepth, name);
		} else {
			if (curDepth === targetDepth) {
				this._coalesceHeaders_handleEqual(buf, i, stack, depth, targetDepth, name);
			} else if (curDepth < targetDepth) {
				buf.splice(i._--, 1);
				this._coalesceHeaders_handleTooShallow(stack, targetDepth, name);
			} else if (curDepth > targetDepth) {
				this._coalesceHeaders_handleTooDeep(buf, i, stack, depth, targetDepth, name);
			}
		}
	}

	private static _coalesceHeaders_getRoot(stack: ConvertedEntry[], depth: number): ConvertedEntry {
		const root: ConvertedEntry = { type: depth < 0 ? "section" : "entries", name: "", entries: [] };
		stack.push(root);
		return root;
	}

	private static _coalesceHeaders_handleEqual(
		buf: (string | ConvertedEntry | MdBlockMeta)[],
		i: { _: number },
		stack: ConvertedEntry[],
		depth: number,
		targetDepth: number,
		name: string
	): void {
		if (stack.length > 1) stack.pop();
		else if (targetDepth !== -1) {
			const nuRoot: ConvertedEntry = {
				type: "section",
				entries: [stack[0] as Entry],
			};
			const ixRoot = buf.indexOf(stack[0]);
			if (~ixRoot) throw new Error("Could not find root in buffer!");
			buf[ixRoot] = nuRoot;
			stack.pop();
			stack.push(nuRoot);
		}

		if (stack.length) {
			buf.splice(i._--, 1);
			const nxtBlock: ConvertedEntry = { type: depth < 0 ? "section" : "entries", name, entries: [] };
			last(stack)!.entries!.push(nxtBlock as Entry);
			stack.push(nxtBlock);
		} else {
			buf[i._] = this._coalesceHeaders_getRoot(stack, depth);
			last(stack)!.name = name;
		}
	}

	private static _coalesceHeaders_handleTooShallow(stack: ConvertedEntry[], targetDepth: number, name: string): void {
		while (this._coalesceHeaders_getStackDepth(stack)! < targetDepth) {
			const nxt: ConvertedEntry = { type: "entries", name: "", entries: [] };
			last(stack)!.entries!.push(nxt as Entry);
			stack.push(nxt);
		}
		last(stack)!.name = name;
	}

	private static _coalesceHeaders_handleTooDeep(
		buf: (string | ConvertedEntry | MdBlockMeta)[],
		i: { _: number },
		stack: ConvertedEntry[],
		depth: number,
		targetDepth: number,
		name: string
	): void {
		while (this._coalesceHeaders_getStackDepth(stack)! > targetDepth && stack.length > 1) stack.pop();
		this._coalesceHeaders_handleEqual(buf, i, stack, depth, targetDepth, name);
	}

	// ============ Inline Styling ============

	private static _convertInlineStyling(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		const handlers: WalkerHandlers = {
			object: (obj): Record<string, unknown> => {
				const record = obj as Record<string, unknown>;
				for (const meta of ENTRIES_WITH_CHILDREN) {
					if (record.type !== meta.type) continue;
					if (!record[meta.key]) continue;

					record[meta.key] = (record[meta.key] as Entry[]).map((ent: Entry) => {
						if (typeof ent !== "string") return ent;

						let result = ent.replace(/(\*+)(.+?)(\*+)|(_+)(.+?)(_+)/g, (...m: (string | number | undefined)[]) => {
							const [open, text, close] = m[1] ? [m[1], m[2], m[3]] : [m[4], m[5], m[6]];

							const minLen = Math.min((open as string).length, (close as string).length);
							const cleanOpen = (open as string).slice(minLen);
							const cleanClose = (close as string).slice(minLen);

							if (minLen === 1) return `{@i ${cleanOpen}${text}${cleanClose}}`;
							else if (minLen === 2) return `{@b ${cleanOpen}${text}${cleanClose}}`;
							else return `{@b {@i ${cleanOpen}${text}${cleanClose}}}`;
						});

						result = result.replace(/~~(.+?)~~/g, (...m) => `{@s ${m[1]}}`);
						result = result.replace(/\[(.+?)]\((.+?)\)/g, (...m) => `{@link ${m[1]}|${m[2]}}`);

						return result;
					});
				}
				return obj;
			},
		};

		const walker = getWalker();
		const nxtBuf = walker.walk(buf, handlers);
		while (buf.length) buf.pop();
		buf.push(...(nxtBuf as (string | ConvertedEntry | MdBlockMeta)[]));
	}

	// ============ Cleanup ============

	private static _cleanEmptyLines(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		const handlersDoTrim: WalkerHandlers = {
			array: (arr): unknown[] => arr.map(it => (typeof it === "string" ? it.trim() : it)),
		};
		const walker = getWalker();
		const nxtBufTrim = walker.walk(buf, handlersDoTrim);
		while (buf.length) buf.pop();
		buf.push(...(nxtBufTrim as (string | ConvertedEntry | MdBlockMeta)[]));

		const handlersRmEmpty: WalkerHandlers = {
			array: (arr): unknown[] => arr.filter(it => it && (typeof it !== "string" || it.trim())),
		};
		const nxtBufRmEmpty = walker.walk(buf, handlersRmEmpty);
		while (buf.length) buf.pop();
		buf.push(...(nxtBufRmEmpty as (string | ConvertedEntry | MdBlockMeta)[]));
	}

	private static _cleanEntries(buf: (string | ConvertedEntry | MdBlockMeta)[]): void {
		const recursiveClean = (obj: unknown): void => {
			if (typeof obj === "object" && obj !== null) {
				if (Array.isArray(obj)) {
					obj.forEach(x => recursiveClean(x));
				} else {
					const record = obj as Record<string, unknown>;
					if ((record.type === "section" || record.type === "entries") && record.name != null && !(record.name as string).trim()) {
						delete record.name;
					}
					if (record.entries && !(record.entries as unknown[]).length) {
						delete record.entries;
					}

					Object.values(record).forEach(v => recursiveClean(v));
				}
			}
		};

		recursiveClean(buf);
	}

	// ============ Recursive Helper ============

	private static _coalesceConvert_doRecurse(
		obj: ConvertedEntry,
		fn: (buf: (string | ConvertedEntry | MdBlockMeta)[]) => void
	): void {
		if (typeof obj !== "object") throw new TypeError(`Non-object ${obj} passed to object handler!`);

		if (Array.isArray(obj)) {
			fn(obj);

			obj.forEach(it => {
				if (typeof it !== "object") return;
				this._coalesceConvert_doRecurse(it as ConvertedEntry, fn);
			});
		} else {
			if (obj.type) {
				const childMeta = ENTRIES_WITH_CHILDREN.find(it => it.type === obj.type && obj[it.key]);
				if (childMeta) {
					this._coalesceConvert_doRecurse(obj[childMeta.key] as ConvertedEntry, fn);
				}
			}
		}
	}

	// ============ Table Conversion ============

	static getConvertedTable(lines: string[], caption?: string): EntryTable {
		const contentLines = lines.filter(l => l && l.trim());
		if (contentLines.every(l => l.trim().startsWith("|"))) {
			lines = lines.map(l => l.replace(/^\s*\|(.*?)$/, "$1"));
		}
		if (contentLines.every(l => l.trim().endsWith("|"))) {
			lines = lines.map(l => l.replace(/^(.*?)\|\s*$/, "$1"));
		}

		// Use internal type that matches what we actually create (string[][] for rows)
		const tbl: ConverterEntryTable = {
			type: "table",
			caption,
			colLabels: [],
			colStyles: [],
			rows: [],
		};

		let seenHeaderBreak = false;
		let alignment: string[] = [];

		lines
			.map(l => l.trim())
			.filter(Boolean)
			.forEach(l => {
				const cells = l.split("|").map(it => it.trim());
				if (cells.length) {
					if (cells.every(c => !c || /^:?\s*---+\s*:?$/.test(c))) {
						alignment = cells.map(c => {
							if (c.startsWith(":") && c.endsWith(":")) {
								return "text-center";
							} else if (c.startsWith(":")) {
								return "text-align-left";
							} else if (c.endsWith(":")) {
								return "text-right";
							} else {
								return "";
							}
						});
						seenHeaderBreak = true;
					} else if (seenHeaderBreak) {
						tbl.rows!.push(cells);
					} else {
						tbl.colLabels = cells;
					}
				}
			});

		tbl.colStyles = alignment;
		this._postProcessTableInternal(tbl);
		// Cast to EntryTable - the structure is compatible at runtime
		return tbl as unknown as EntryTable;
	}

	static postProcessTable(tbl: EntryTable, opts: TablePostProcessOptions = {}): void {
		// Cast to internal type for processing (rows are actually string[][])
		this._postProcessTableInternal(tbl as unknown as ConverterEntryTable, opts);
	}

	private static _postProcessTableInternal(tbl: ConverterEntryTable, opts: TablePostProcessOptions = {}): void {
		const tableWidth = opts.tableWidth ?? 80;
		const diceColWidth = opts.diceColWidth ?? 1;

		tbl.colStyles = tbl.colStyles ?? [];

		const maxWidth = Math.max((tbl.colLabels || []).length, ...tbl.rows!.map(it => it.length));
		tbl.rows!.forEach(row => {
			while (row.length < maxWidth) row.push("");
		});

		tbl.rows!.forEach(row => {
			if (!row[0] || typeof row[0] !== "string") return;
			row[0] = row[0].replace(/^(\d+)\s+([-\u2012-\u2014\u2212])\s+(\d+)$/, "$1$2$3");
		});

		let isDiceCol0 = true;
		tbl.rows!.forEach(r => {
			const r0Clean = stripTags((r[0] || "").trim());
			if (!/^[-+*/×÷x^.,0-9\u2012-\u2014\u2212]+(?:st|nd|rd|th)?$/i.test(r0Clean)) {
				isDiceCol0 = false;
			}
		});

		const BASE_CHAR_CAP = tableWidth;

		let isAllBelowCap = true;
		const widthMeta = (() => {
			if (!tbl.rows!.length) return null;

			const outAvgWidths = [...new Array(tbl.rows![0].length)].map(() => 0);
			const outMaxWidths = [...new Array(tbl.rows![0].length)].map((_, i) =>
				tbl.colLabels![i] ? tbl.colLabels![i].toString().length : 0
			);

			tbl.rows!.forEach(r => {
				r.forEach((cell, i) => {
					const cellStripped = stripTags(cell);
					if (cellStripped.length > BASE_CHAR_CAP) isAllBelowCap = false;
					outAvgWidths[i] += Math.min(BASE_CHAR_CAP, cellStripped.length);
					outMaxWidths[i] = Math.max(outMaxWidths[i], cellStripped.length);
				});
			});

			return {
				avgWidths: outAvgWidths.map(it => it / tbl.rows!.length),
				maxWidths: outMaxWidths,
			};
		})();

		if (widthMeta) {
			const { avgWidths, maxWidths } = widthMeta;

			const assignColWidths = (widths: number[]): void => {
				const splitInto = isDiceCol0 ? 12 - diceColWidth : 12;
				if (isDiceCol0) widths = widths.slice(1);

				const totalWidths = widths.reduce((a, b) => a + b, 0);
				const redistributedWidths = (() => {
					const MIN = totalWidths / splitInto;
					const sorted = widths.map((it, ix) => ({ ix, val: it })).sort((a, b) => ascSort(a.val, b.val));

					for (let idx = 0; idx < sorted.length - 1; ++idx) {
						const it = sorted[idx];
						if (it.val < MIN) {
							const diff = MIN - it.val;
							sorted[idx].val = MIN;
							const toSteal = diff / (sorted.length - (idx + 1));
							for (let j = idx + 1; j < sorted.length; ++j) {
								sorted[j].val -= toSteal;
							}
						}
					}

					return sorted.sort((a, b) => ascSort(a.ix, b.ix)).map(it => it.val);
				})();

				let nmlxWidths = redistributedWidths.map(it => it / totalWidths);
				while (nmlxWidths.reduce((a, b) => a + b, 0) > 1) {
					const diff = 1 - nmlxWidths.reduce((a, b) => a + b, 0);
					nmlxWidths = nmlxWidths.map(it => it + diff / nmlxWidths.length);
				}
				const twelfthWidths = nmlxWidths.map(it => Math.round(it * splitInto));

				if (isDiceCol0) tbl.colStyles![0] = `col-${diceColWidth}`;
				twelfthWidths.forEach((it, idx) => {
					const widthPart = `col-${it}`;
					const iOffset = isDiceCol0 ? idx + 1 : idx;

					tbl.colStyles![iOffset] = tbl.colStyles![iOffset] ? `${tbl.colStyles![iOffset]} ${widthPart}` : widthPart;
				});
			};

			assignColWidths(isAllBelowCap ? maxWidths : avgWidths);
		}

		if (isDiceCol0 && !tbl.colStyles!.includes("text-center")) {
			tbl.colStyles![0] += " text-center";
		}

		if (!isDiceCol0 || tbl.colStyles!.length !== 2) {
			tbl.colStyles!.forEach((col, idx) => {
				if (col.includes("text-center") || col.includes("text-right")) return;

				const counts = { number: 0, text: 0 };

				tbl.rows!.forEach(r => {
					const cell = r[idx];
					if (typeof cell !== "string") return counts.text++;
					const clean = stripTags(cell)
						.replace(/[.,]/g, "")
						.replace(/(^| )(cp|sp|gp|pp|lb\.|ft\.)( |$)/g, "")
						.trim();
					counts[isNaN(Number(clean)) ? "text" : "number"]++;
				});

				if (counts.number / tbl.rows!.length >= 0.8) {
					if (idx === 0) tbl.colStyles![idx] += " text-center";
					else tbl.colStyles![idx] += " text-right";
				}
			});
		}

		let isFewWordsCol1 = false;
		if (!isDiceCol0 || tbl.colStyles!.length !== 2) {
			for (let idx = tbl.colStyles!.length - 1; idx >= 0; --idx) {
				const col = tbl.colStyles![idx];

				if (idx === 0 && tbl.colStyles!.length > 1 && tbl.colStyles!.filter((_, j) => j !== 0).some(it => !it.includes("text-center"))) {
					continue;
				}

				const counts = { short: 0, long: 0 };

				tbl.rows!.forEach(r => {
					const cell = r[idx];
					if (typeof cell !== "string") return counts.long++;
					const words = stripTags(cell).split(" ");
					counts[words.length <= 3 ? "short" : "long"]++;
				});

				if (counts.short / tbl.rows!.length >= 0.8) {
					if (idx === 1) isFewWordsCol1 = true;
					if (col.includes("text-center") || col.includes("text-right")) continue;
					tbl.colStyles![idx] += " text-center";
				}
			}
		}

		this._doCleanTableInternal(tbl);

		if (isDiceCol0 && tbl.colStyles!.length === 2 && isFewWordsCol1) {
			tbl.colStyles = ["col-6 text-center", "col-6 text-center"];
		}

		tbl.rows = tbl.rows!.map(r => {
			return r.map(cell => {
				if (cell === "--") return "\u2014";
				return cell;
			});
		});
	}

	private static _doCleanTableInternal(tbl: ConverterEntryTable): void {
		if (!tbl.caption) delete tbl.caption;
		if (tbl.colLabels && !tbl.colLabels.some(Boolean)) delete tbl.colLabels;
		if (tbl.colStyles && !tbl.colStyles.some(Boolean)) delete tbl.colStyles;
	}
}

// ============ Factory Functions ============

export const getEntries = (mdStr: string): Entry[] => MarkdownConverter.getEntries(mdStr);

export const getConvertedTable = (lines: string[], caption?: string): EntryTable =>
	MarkdownConverter.getConvertedTable(lines, caption);

export const postProcessTable = (tbl: EntryTable, opts?: TablePostProcessOptions): void =>
	MarkdownConverter.postProcessTable(tbl, opts);

// ============ Exports ============

export { ENTRIES_WITH_CHILDREN, ENTRIES_WITH_ENUMERATED_TITLES };
