// Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown class
// Provides markdown-specific rendering for D&D 5e entries

import type {
	Entry,
	EntryEntries,
	EntryList,
	EntryTable,
	EntryQuote,
	EntryInset,
	EntryInsetReadaloud,
	EntryVariant,
	EntryItem,
	EntryImage,
} from "../../../types/entry.js";

import type {
	TextStack,
	RenderMeta,
	RenderOptions,
	MarkdownConfig,
	StyleHint,
} from "../renderer/types.js";

import { createTextStack, createRenderMeta, defaultMarkdownConfig } from "../renderer/types.js";
import { BaseRenderer, type RendererConfig } from "../renderer/base.js";
import { splitByTags, splitFirstSpace, splitTagByPipe, stripTags } from "../renderer/tags.js";
import { getHeaderRowMetas, getHeaderRowSpanWidth } from "../renderer/table.js";
import { attrChooseToFull, attAbvToFull, ABIL_ABVS } from "../parser/attributes.js";

// ============ Constants ============

export const CHARS_PER_PAGE = 5500;

// ============ Utility Functions ============

const getNextPrefix = (options: RenderOptions, prefix = ""): string => {
	return options.prefix === ">" || options.prefix === ">>"
		? `${options.prefix}${prefix}`
		: prefix;
};

const postProcess = (str: string): string => {
	return str
		.replace(/^\s+/, "")
		.replace(/\n+$/, "\n")
		.replace(/\n\n+/g, "\n\n")
		.replace(/(>\n>\n)+/g, ">\n");
};

// ============ Markdown Renderer Configuration ============

export interface MarkdownRendererConfig extends RendererConfig {
	markdownConfig: MarkdownConfig;
	isSkipStylingItemLinks: boolean;
}

export const defaultMarkdownRendererConfig: MarkdownRendererConfig = {
	styleHint: "classic",
	isAddHandlers: false,
	baseUrl: "",
	markdownConfig: { ...defaultMarkdownConfig },
	isSkipStylingItemLinks: false,
};

// ============ Markdown Renderer Class ============

export class MarkdownRenderer extends BaseRenderer {
	protected override config: MarkdownRendererConfig;
	private _isFirstSection = true;

	constructor(config: Partial<MarkdownRendererConfig> = {}) {
		super(config);
		this.config = { ...defaultMarkdownRendererConfig, ...config };
	}

	// ============ Configuration Methods ============

	setTagRenderMode(mode: MarkdownConfig["tagRenderMode"]): this {
		this.config.markdownConfig.tagRenderMode = mode;
		return this;
	}

	setAddColumnBreaks(isAdd: boolean): this {
		this.config.markdownConfig.isAddColumnBreaks = isAdd;
		return this;
	}

	setAddPageBreaks(isAdd: boolean): this {
		this.config.markdownConfig.isAddPageBreaks = isAdd;
		return this;
	}

	setFirstSection(isFirst: boolean): this {
		this._isFirstSection = isFirst;
		return this;
	}

	setSkipStylingItemLinks(isSkip: boolean): this {
		this.config.isSkipStylingItemLinks = isSkip;
		return this;
	}

	getLineBreak(): string {
		return "\n";
	}

	// ============ Main Render Method Override ============

	override render(entry: Entry, options: RenderOptions = {}): string {
		const result = super.render(entry, options);
		return postProcess(result);
	}

	// ============ String Rendering ============

	protected _renderString(
		entry: string,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		const mode = this.config.markdownConfig.tagRenderMode;

		switch (mode) {
			case "convertMarkdown":
				this._renderString_renderModeConvertMarkdown(entry, textStack, meta, options);
				break;
			case "ignore":
				textStack[0] += entry;
				break;
			case "convertText":
				textStack[0] += stripTags(entry);
				break;
		}
	}

	private _renderString_renderModeConvertMarkdown(
		entry: string,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		const tagSplit = splitByTags(entry);

		for (const s of tagSplit) {
			if (!s) continue;

			if (s.startsWith("{@")) {
				const [tag, text] = splitFirstSpace(s.slice(1, -1));
				this._renderString_renderTag(textStack, meta, options, tag, text);
			} else {
				textStack[0] += s;
			}
		}
	}

	private _renderString_renderTag(
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions,
		tag: string,
		text: string
	): void {
		switch (tag) {
			case "@b":
			case "@bold":
				textStack[0] += "**";
				this._recursiveRender(text, textStack, meta, options);
				textStack[0] += "**";
				break;

			case "@i":
			case "@italic":
				textStack[0] += "*";
				this._recursiveRender(text, textStack, meta, options);
				textStack[0] += "*";
				break;

			case "@s":
			case "@strike":
			case "@s2":
			case "@strikeDouble":
				textStack[0] += "~~";
				this._recursiveRender(text, textStack, meta, options);
				textStack[0] += "~~";
				break;

			case "@note":
				textStack[0] += "*";
				this._recursiveRender(text, textStack, meta, options);
				textStack[0] += "*";
				break;

			case "@atk":
			case "@atkr":
				textStack[0] += `*${this._getAttackTagText(text, tag === "@atkr")}* `;
				break;

			case "@h":
				textStack[0] += "*Hit:* ";
				break;

			case "@m":
				textStack[0] += "*Miss:* ";
				break;

			case "@hom":
				textStack[0] += "*Hit or Miss:* ";
				break;

			case "@dc": {
				const [dcText, displayText] = splitTagByPipe(text);
				textStack[0] += `DC ${displayText || dcText}`;
				break;
			}

			case "@dice":
			case "@damage":
			case "@hit":
			case "@d20":
			case "@chance":
			case "@recharge":
			case "@coinflip":
			case "@scaledice":
			case "@scaledamage":
			case "@filter":
			case "@footnote":
			case "@homebrew":
			case "@skill":
			case "@sense":
			case "@area":
			case "@cite":
				textStack[0] += stripTags(`{${tag} ${text}}`);
				break;

			case "@link":
			case "@5etools": {
				const parts = splitTagByPipe(text);
				const displayText = parts[0] || "";
				const url = parts[1] || "";
				textStack[0] += `[${displayText}](${url})`;
				break;
			}

			case "@book":
			case "@adventure":
				textStack[0] += `*${stripTags(`{${tag} ${text}}`)}*`;
				break;

			case "@deity":
				textStack[0] += `**${stripTags(`{${tag} ${text}}`)}**`;
				break;

			case "@item":
				if (this.config.isSkipStylingItemLinks) {
					textStack[0] += stripTags(`{${tag} ${text}}`);
				} else {
					textStack[0] += `*${stripTags(`{${tag} ${text}}`)}*`;
				}
				break;

			case "@spell":
			case "@psionic":
				textStack[0] += `*${stripTags(`{${tag} ${text}}`)}*`;
				break;

			case "@creature":
				textStack[0] += `**${stripTags(`{${tag} ${text}}`)}**`;
				break;

			case "@actSave":
				textStack[0] += `*${attAbvToFull(text)} Saving Throw:*`;
				break;

			case "@actSaveSuccess":
				textStack[0] += "*Success:*";
				break;

			case "@actSaveFail": {
				const [ordinal] = splitTagByPipe(text);
				if (ordinal) {
					textStack[0] += `*${this._getOrdinalText(parseInt(ordinal, 10))} Failure:*`;
				} else {
					textStack[0] += "*Failure:*";
				}
				break;
			}

			case "@actSaveFailBy": {
				const [amount] = splitTagByPipe(text);
				textStack[0] += `*Failure by ${amount} or More:*`;
				break;
			}

			case "@actSaveSuccessOrFail":
				textStack[0] += "*Failure or Success:*";
				break;

			case "@actTrigger":
				textStack[0] += "*Trigger:*";
				break;

			case "@actResponse":
				textStack[0] += `*Response${text.includes("d") ? "\u2014" : ":"}*`;
				break;

			default:
				textStack[0] += stripTags(`{${tag} ${text}}`);
				break;
		}
	}

	private _getAttackTagText(text: string, isRoll: boolean): string {
		const parts = text.split(",").map(s => s.trim());
		const mapped = parts.map(pt => {
			switch (pt) {
				case "mw": return "Melee Weapon";
				case "rw": return "Ranged Weapon";
				case "ms": return "Melee Spell";
				case "rs": return "Ranged Spell";
				case "m": return "Melee";
				case "r": return "Ranged";
				case "s": return "Spell";
				case "w": return "Weapon";
				default: return pt;
			}
		});
		return `${mapped.join(" or ")} Attack${isRoll ? " Roll" : ""}:`;
	}

	private _getOrdinalText(num: number): string {
		const suffixes = ["th", "st", "nd", "rd"];
		const v = num % 100;
		return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
	}

	// ============ Entries Rendering ============

	protected _renderEntries(
		entry: EntryEntries,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderEntriesSubtypes(entry, textStack, meta, options, true);
	}

	protected _renderEntriesSubtypes(
		entry: EntryEntries,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions,
		incDepth = true
	): void {
		const isInlineTitle = meta.depth >= 2;
		const nextDepth = incDepth && meta.depth < 2 ? meta.depth + 1 : meta.depth;

		const nxtPrefix = getNextPrefix(options);
		const name = this._getEntryName(entry);

		if (name) {
			const strippedName = stripTags(name);
			if (isInlineTitle) {
				textStack[0] += `${nxtPrefix}***${strippedName}.*** `;
			} else {
				const hashCount = meta._typeStack.length === 1 && meta.depth === -1
					? 1
					: Math.min(6, meta.depth + 3);
				textStack[0] += `\n${nxtPrefix}${"#".repeat(hashCount)} ${strippedName}\n\n`;
			}
		}

		if (entry.entries) {
			this._renderEntriesSubtypes_renderPreReqText(entry, textStack, meta);
			const cacheDepth = meta.depth;
			const len = entry.entries.length;

			for (let i = 0; i < len; ++i) {
				meta.depth = nextDepth;
				const isFirstInline = i === 0 && name && isInlineTitle;
				const suffix = meta.isStatblockInlineMonster ? "  \n" : "\n\n";
				this._recursiveRender(
					entry.entries[i],
					textStack,
					meta,
					{ prefix: isFirstInline ? "" : getNextPrefix(options), suffix }
				);
			}

			if (meta.isStatblockInlineMonster) textStack[0] += "\n";
			meta.depth = cacheDepth;
		}
	}

	private _renderEntriesSubtypes_renderPreReqText(
		entry: EntryEntries & { prerequisite?: Entry },
		textStack: TextStack,
		meta: RenderMeta
	): void {
		if ((entry as any).prerequisite) {
			textStack[0] += "*Prerequisite: ";
			this._recursiveRender(
				{ type: "inline", entries: [(entry as any).prerequisite] } as any,
				textStack,
				meta,
				{}
			);
			textStack[0] += "*\n\n";
		}
	}

	// ============ List Rendering ============

	protected _renderList(
		entry: EntryList,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (!entry.items) return;

		if (textStack[0] && textStack[0].slice(-1) !== "\n") {
			textStack[0] += "\n";
		}

		const listDepth = Math.max(meta._typeStack.filter(it => it === "list").length - 1, 0);
		const name = this._getEntryName(entry);

		if (name) {
			textStack[0] += `##### ${stripTags(name)}`;
		}

		const indentSpaces = "  ".repeat(listDepth);
		const len = entry.items.length;

		const isSpellList = (entry as any).data?.isSpellList;

		if (isSpellList) {
			textStack[0] += `${getNextPrefix(options)}\n`;
			for (let i = 0; i < len; ++i) {
				textStack[0] += `${getNextPrefix(options)}${indentSpaces}`;
				const cacheDepth = this._adjustDepth(meta, 1);
				this._recursiveRender(entry.items[i], textStack, meta, { suffix: "\n" });
				meta.depth = cacheDepth;
			}
		} else {
			for (let i = 0; i < len; ++i) {
				const item = entry.items[i];
				const isNestedList = typeof item === "object" && (item as any).type === "list";

				textStack[0] += `${getNextPrefix(options)}${indentSpaces}${isNestedList ? "" : "- "}`;

				const cacheDepth = this._adjustDepth(meta, 1);

				if (typeof item === "object" && (item as any).rendered) {
					textStack[0] += (item as any).rendered;
				} else {
					this._recursiveRender(item, textStack, meta, { suffix: "\n" });
				}

				if (textStack[0].slice(-2) === "\n\n") {
					textStack[0] = textStack[0].slice(0, -1);
				}

				meta.depth = cacheDepth;
			}
		}

		textStack[0] += "\n";
	}

	// ============ Table Rendering ============

	protected _renderTable(
		entry: EntryTable,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if ((entry as any).intro) {
			for (const ent of (entry as any).intro) {
				this._recursiveRender(ent, textStack, meta, options);
			}
		}

		textStack[0] += "\n";

		if (entry.caption) {
			textStack[0] += `##### ${entry.caption}\n`;
		}

		const headerRowMetas = getHeaderRowMetas(entry);
		const hasLabels = headerRowMetas != null;

		if (!hasLabels && (!entry.rows || !entry.rows.length)) {
			textStack[0] += "|   |\n";
			textStack[0] += "|---|\n";
			textStack[0] += "|   |\n";
			return;
		}

		let labelRows: any[][] = headerRowMetas ? [...headerRowMetas] : [];
		if (!hasLabels && entry.rows) {
			const numCells = Math.max(...entry.rows.map(r => Array.isArray(r) ? r.length : 0));
			labelRows = [[...new Array(numCells)].map(() => "")];
		}

		const colStyles = entry.colStyles ?? [];
		if (colStyles.length) {
			labelRows
				.filter(labelRow => getHeaderRowSpanWidth(labelRow) < colStyles.length)
				.forEach(labelRow => {
					const padCount = colStyles.length - getHeaderRowSpanWidth(labelRow);
					labelRow.push(...new Array(padCount).fill(""));
				});
		}

		let styles: string[] = [];
		if (colStyles.length) {
			styles = [...colStyles];
			labelRows.forEach(labelRow => {
				const rowWidth = getHeaderRowSpanWidth(labelRow);
				if (rowWidth > styles.length) {
					styles = styles.concat(new Array(rowWidth - styles.length).fill(""));
				}
			});
		}

		const mdHeaderRows = labelRows.map(labelRow => {
			return labelRow.flatMap((entCellHeader: any) => {
				const entryNxt = entCellHeader?.type === "cellHeader"
					? entCellHeader.entry
					: entCellHeader;
				const ptCellPrimary = ` ${stripTags(String(entryNxt ?? ""))} `;

				const cntPadCells = ((entCellHeader?.type === "cellHeader" ? entCellHeader?.width || 1 : 1) - 1);
				if (!cntPadCells) return [ptCellPrimary];

				return [ptCellPrimary, " ".repeat(cntPadCells)];
			});
		});

		const widths = [...new Array(Math.max(...mdHeaderRows.map(mdHeaderRow => mdHeaderRow.length)))]
			.map((_, i) => {
				return Math.max(
					...mdHeaderRows.map(mdHeaderRow => (mdHeaderRow[i] || "").length),
					this._getPaddedStyleText({ style: styles[i] || "" }).length
				);
			});

		const mdTable: string[][] = [];
		const numRows = entry.rows?.length ?? 0;

		for (let ixRow = 0; ixRow < numRows; ++ixRow) {
			const row = entry.rows![ixRow];
			const rowRender = (row as any).type === "row" ? (row as any).row : row;

			if (!Array.isArray(rowRender)) continue;

			const numCells = rowRender.length;
			for (let ixCell = 0; ixCell < numCells; ++ixCell) {
				const cell = rowRender[ixCell];
				let toRenderCell: Entry;

				if (typeof cell === "object" && cell !== null && (cell as any).type === "cell") {
					const cellObj = cell as any;
					if (cellObj.roll) {
						if (cellObj.roll.entry) {
							toRenderCell = cellObj.roll.entry;
						} else if (cellObj.roll.exact != null) {
							toRenderCell = cellObj.roll.pad
								? String(cellObj.roll.exact).padStart(2, "0")
								: String(cellObj.roll.exact);
						} else {
							const min = cellObj.roll.pad
								? String(cellObj.roll.min).padStart(2, "0")
								: String(cellObj.roll.min);
							const max = cellObj.roll.pad
								? String(cellObj.roll.max).padStart(2, "0")
								: String(cellObj.roll.max);
							toRenderCell = `${min}-${max}`;
						}
					} else if (cellObj.entry) {
						toRenderCell = cellObj.entry;
					} else {
						toRenderCell = "";
					}
				} else {
					toRenderCell = cell;
				}

				const textStackCell = createTextStack();
				const cacheDepth = this._adjustDepth(meta, 1);
				this._recursiveRender(toRenderCell, textStackCell, meta, {});
				meta.depth = cacheDepth;

				const mdCell = ` ${textStackCell[0].trim()} `
					.split(/\n+/)
					.join("<br>");

				widths[ixCell] = Math.max(widths[ixCell] || 0, mdCell.length);
				(mdTable[ixRow] = mdTable[ixRow] || [])[ixCell] = mdCell;
			}
		}

		const mdHeaderRowsPadded = mdHeaderRows.map(mdHeaderRow => {
			return mdHeaderRow.map((header, ixCell) =>
				this._getPaddedTableText({ text: header, width: widths[ixCell], ixCell, styles })
			);
		});

		const mdStyles: string[] = [];
		if (styles.length) {
			styles.forEach((style, i) => {
				mdStyles.push(this._getPaddedStyleText({ style, width: widths[i] }));
			});
		}

		for (const mdHeaderRowPadded of mdHeaderRowsPadded) {
			textStack[0] += `|${mdHeaderRowPadded.join("|")}|\n`;
		}

		if (mdStyles.length) {
			textStack[0] += `|${mdStyles.join("|")}|\n`;
		}

		for (const mdRow of mdTable) {
			textStack[0] += "|";
			const numCells = mdRow.length;
			for (let ixCell = 0; ixCell < numCells; ++ixCell) {
				textStack[0] += this._getPaddedTableText({
					text: mdRow[ixCell],
					width: widths[ixCell],
					ixCell,
					styles
				});
				textStack[0] += "|";
			}
			textStack[0] += "\n";
		}

		if ((entry as any).footnotes) {
			for (const ent of (entry as any).footnotes) {
				const cacheDepth = this._adjustDepth(meta, 1);
				this._recursiveRender(ent, textStack, meta, options);
				meta.depth = cacheDepth;
			}
		}

		if ((entry as any).outro) {
			for (const ent of (entry as any).outro) {
				this._recursiveRender(ent, textStack, meta, options);
			}
		}

		if (!entry.rows) {
			textStack[0] += "||\n";
			return;
		}

		textStack[0] += "\n";
	}

	private _getPaddedTableText(opts: {
		text: string;
		width: number;
		ixCell: number;
		styles: string[];
	}): string {
		const { text, width, ixCell, styles } = opts;
		if (text.length >= width) return text;

		if (styles?.[ixCell]?.includes("text-center")) {
			return text
				.padStart(Math.ceil((width - text.length) / 2) + text.length, " ")
				.padEnd(width, " ");
		}
		if (styles?.[ixCell]?.includes("text-right")) {
			return text.padStart(width, " ");
		}
		return text.padEnd(width, " ");
	}

	private _getPaddedStyleText(opts: { style: string; width?: number }): string {
		const { style, width = 0 } = opts;

		if (style.includes("text-center")) {
			return `:${"-".repeat(Math.max(width - 2, 3))}:`;
		}
		if (style.includes("text-right")) {
			return `${"-".repeat(Math.max(width - 1, 3))}:`;
		}
		return "-".repeat(Math.max(width, 3));
	}

	// ============ Quote Rendering ============

	protected _renderQuote(
		entry: EntryQuote,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (!entry.entries?.length) return;

		const len = entry.entries.length;
		for (let i = 0; i < len; ++i) {
			this._recursiveRender(
				entry.entries[i],
				textStack,
				meta,
				{ prefix: getNextPrefix(options, "*"), suffix: "*" }
			);
			if (i !== len - 1) textStack[0] += "\n\n";
		}

		const byArr = this._getQuoteBy(entry);
		if (byArr) {
			const tempStack = createTextStack();
			for (let i = 0, len = byArr.length; i < len; ++i) {
				const by = byArr[i];
				this._recursiveRender(by, tempStack, meta, {});
				if (i < len - 1) tempStack[0] += "\n";
			}
			textStack[0] += `\u2014 ${tempStack[0]}`;
			if (entry.from) {
				textStack[0] += `, *${this.render(entry.from)}*`;
			}
		}
	}

	private _getQuoteBy(entry: EntryQuote): string[] | null {
		if (!entry.by) return null;
		if (Array.isArray(entry.by)) return entry.by;
		return [entry.by];
	}

	// ============ Inset Rendering ============

	protected _renderInset(
		entry: EntryInset,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += "\n";
		const name = this._getEntryName(entry);
		if (name != null) {
			textStack[0] += `> ##### ${stripTags(name)}\n>\n`;
		}

		const entries = (entry as any).entries;
		if (entries) {
			const len = entries.length;
			for (let i = 0; i < len; ++i) {
				const cacheDepth = meta.depth;
				meta.depth = 2;
				this._recursiveRender(entries[i], textStack, meta, { prefix: ">", suffix: "\n>\n" });
				meta.depth = cacheDepth;
			}
		}
		textStack[0] += "\n";
	}

	protected override _renderInsetReadaloud(
		entry: EntryInsetReadaloud,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += "\n";
		const name = this._getEntryName(entry);
		if (name != null) {
			textStack[0] += `>> ##### ${stripTags(name)}\n>>\n`;
		}

		const entries = (entry as any).entries;
		if (entries) {
			const len = entries.length;
			for (let i = 0; i < len; ++i) {
				const cacheDepth = meta.depth;
				meta.depth = 2;
				this._recursiveRender(entries[i], textStack, meta, { prefix: ">>", suffix: "\n>>\n" });
				meta.depth = cacheDepth;
			}
		}
		textStack[0] += "\n";
	}

	protected override _renderVariant(
		entry: EntryVariant,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += "\n";
		const name = this._getEntryName(entry);
		if (name != null) {
			textStack[0] += `> ##### Variant: ${stripTags(name)}\n>\n`;
		}

		const entries = (entry as any).entries;
		if (entries) {
			const len = entries.length;
			for (let i = 0; i < len; ++i) {
				const cacheDepth = meta.depth;
				meta.depth = 2;
				this._recursiveRender(entries[i], textStack, meta, { prefix: ">", suffix: "\n>\n" });
				meta.depth = cacheDepth;
			}
		}

		const source = (entry as any).source;
		const page = (entry as any).page;
		if (source) {
			textStack[0] += `>${this._getPageText({ source, page })}\n`;
		}
		textStack[0] += "\n";
	}

	protected override _renderVariantSub(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		const name = this._getEntryName(entry);
		if (name) {
			textStack[0] += `*${stripTags(name)}.* `;
		}

		if (entry.entries) {
			const len = entry.entries.length;
			for (let i = 0; i < len; ++i) {
				this._recursiveRender(
					entry.entries[i],
					textStack,
					meta,
					{ prefix: getNextPrefix(options), suffix: "\n>\n" }
				);
			}
		}
	}

	// ============ Item Rendering ============

	protected _renderItem(
		entry: EntryItem,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);

		const name = this._getEntryName(entry);
		const renderedName = name ? this.render(name) : "";
		const addPeriod = this._shouldAddPeriod(entry);

		textStack[0] += `**${renderedName}${addPeriod ? "." : ""}** `;

		let addedNewline = false;

		if ((entry as any).entry) {
			this._recursiveRender((entry as any).entry, textStack, meta, options);
		} else if ((entry as any).entries) {
			const entries = (entry as any).entries;
			const len = entries.length;
			for (let i = 0; i < len; ++i) {
				const nxtPrefix = getNextPrefix(options, i > 0 ? "  " : "");
				this._recursiveRender(entries[i], textStack, meta, { prefix: nxtPrefix, suffix: "\n" });
			}
			addedNewline = true;
		}

		if (!addedNewline) textStack[0] += "\n";
		this._renderSuffix(entry, textStack, meta, options);
	}

	private _shouldAddPeriod(entry: EntryItem): boolean {
		const name = this._getEntryName(entry);
		if (!name) return false;
		const lastChar = name[name.length - 1];
		return ![".", "?", "!"].includes(lastChar);
	}

	protected override _renderItemSub(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);
		const name = this._getEntryName(entry);
		const renderedName = name ? this.render(name) : "";
		const nxtPrefix = getNextPrefix(options, `*${renderedName}* `);
		this._recursiveRender(entry.entry, textStack, meta, { prefix: nxtPrefix, suffix: "\n" });
		this._renderSuffix(entry, textStack, meta, options);
	}

	protected override _renderItemSpell(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);
		const name = this._getEntryName(entry);
		this._recursiveRender(
			entry.entry,
			textStack,
			meta,
			{ prefix: getNextPrefix(options, `${name} `), suffix: "  \n" }
		);
		this._renderSuffix(entry, textStack, meta, options);
	}

	// ============ Image Rendering ============

	protected _renderImage(
		entry: EntryImage,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);
		const href = this._getImageUrl(entry);
		const title = (entry as any).title || "";
		textStack[0] += `![${title}](${href})`;
		this._renderSuffix(entry, textStack, meta, options);
	}

	private _getImageUrl(entry: EntryImage): string {
		const href = (entry as any).href;
		if (!href) return "";
		if (typeof href === "string") return href;
		if (href.type === "internal") {
			return `${this.config.baseUrl}img/${href.path}`;
		}
		if (href.type === "external") {
			return href.url || "";
		}
		return "";
	}

	protected override _renderGallery(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		const name = this._getEntryName(entry);
		if (name) {
			textStack[0] += `##### ${name}\n`;
		}

		const images = entry.images || [];
		for (const img of images) {
			this._recursiveRender(img, textStack, meta, options);
		}
	}

	// ============ Block Elements ============

	protected override _renderAbilityDc(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);
		const name = entry.name || "Ability";
		const attrStr = attrChooseToFull(entry.attributes || []);
		textStack[0] += `**${name} save DC** = 8 + your proficiency bonus + your ${attrStr}`;
		this._renderSuffix(entry, textStack, meta, options);
	}

	protected override _renderAbilityAttackMod(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);
		const name = entry.name || "Ability";
		const attrStr = attrChooseToFull(entry.attributes || []);
		textStack[0] += `**${name} attack modifier** = your proficiency bonus + your ${attrStr}`;
		this._renderSuffix(entry, textStack, meta, options);
	}

	protected override _renderAbilityGeneric(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);
		const name = entry.name ? `**${entry.name}**  = ` : "";
		const attrStr = entry.attributes ? ` ${attrChooseToFull(entry.attributes)}` : "";
		textStack[0] += `${name}${entry.text || ""}${attrStr}`;
		this._renderSuffix(entry, textStack, meta, options);
	}

	// ============ Special Elements ============

	protected override _renderDice(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += this._getDiceDisplayText(entry, entry.name);
	}

	private _getDiceDisplayText(entry: any, name?: string): string {
		if (entry.displayText) return entry.displayText;
		if (name) return name;
		return this._getDiceString(entry);
	}

	protected override _renderLink(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		const href = this._getLinkHref(entry);
		const text = entry.text || href;
		textStack[0] += `[${text}](${href})`;
	}

	private _getLinkHref(entry: any): string {
		const href = entry.href;
		if (!href) return "";
		if (typeof href === "string") return href;
		if (href.type === "internal") {
			return `${this.config.baseUrl}${href.path}`;
		}
		if (href.type === "external") {
			return href.url || "";
		}
		return "";
	}

	protected override _renderActions(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		const cachedDepth = meta.depth;
		meta.depth = 2;
		this._renderEntriesSubtypes(
			{ ...entry, type: "entries" } as EntryEntries,
			textStack,
			meta,
			options
		);
		meta.depth = cachedDepth;
	}

	protected override _renderAttack(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		this._renderPrefix(entry, textStack, meta, options);

		const attackType = this._getAttackTypeText(entry.attackType);
		textStack[0] += `*${attackType}:* `;

		if (entry.attackEntries) {
			for (const ent of entry.attackEntries) {
				this._recursiveRender(ent, textStack, meta, options);
			}
		}

		textStack[0] += " *Hit:* ";

		if (entry.hitEntries) {
			for (const ent of entry.hitEntries) {
				this._recursiveRender(ent, textStack, meta, options);
			}
		}

		this._renderSuffix(entry, textStack, meta, options);
	}

	private _getAttackTypeText(attackType: string): string {
		switch (attackType) {
			case "mw": return "Melee Weapon Attack";
			case "rw": return "Ranged Weapon Attack";
			case "ms": return "Melee Spell Attack";
			case "rs": return "Ranged Spell Attack";
			case "mw,rw": return "Melee or Ranged Weapon Attack";
			default: return "Attack";
		}
	}

	protected override _renderSpellcasting(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		const toRender = this._getSpellcastingEntries(entry);
		if (!toRender?.[0]?.entries?.length) return;

		this._recursiveRender(
			{ type: "entries", entries: toRender } as EntryEntries,
			textStack,
			meta,
			{ prefix: getNextPrefix(options), suffix: "\n" }
		);
	}

	private _getSpellcastingEntries(entry: any): any[] {
		const out: any[] = [];

		if (entry.headerEntries) {
			out.push({ type: "entries", entries: entry.headerEntries });
		}

		if (entry.will) {
			out.push({
				type: "list",
				data: { isSpellList: true },
				items: entry.will,
			});
		}

		if (entry.daily) {
			for (const [frequency, spells] of Object.entries(entry.daily)) {
				if (Array.isArray(spells) && spells.length) {
					out.push({
						type: "list",
						data: { isSpellList: true },
						items: spells,
					});
				}
			}
		}

		if (entry.spells) {
			for (const [level, spellData] of Object.entries(entry.spells)) {
				const data = spellData as any;
				if (data.spells?.length) {
					out.push({
						type: "list",
						data: { isSpellList: true },
						items: data.spells,
					});
				}
			}
		}

		return out;
	}

	protected override _renderFlowBlock(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += "\n";
		const name = this._getEntryName(entry);
		if (name != null) {
			textStack[0] += `> ##### ${name}\n>\n`;
		}

		if (entry.entries) {
			const len = entry.entries.length;
			for (let i = 0; i < len; ++i) {
				const cacheDepth = meta.depth;
				meta.depth = 2;
				this._recursiveRender(entry.entries[i], textStack, meta, { prefix: ">", suffix: "\n>\n" });
				meta.depth = cacheDepth;
			}
		}
		textStack[0] += "\n";
	}

	protected override _renderHomebrew(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		if (entry.oldEntries) {
			let markerText: string;
			if (entry.movedTo) {
				markerText = "*Homebrew:* The following content has been moved:";
			} else if (entry.entries) {
				markerText = "*Homebrew:* The following content has been replaced:";
			} else {
				markerText = "*Homebrew:* The following content has been removed:";
			}

			textStack[0] += `##### ${markerText}\n`;
			this._recursiveRender(
				{ type: "entries", entries: entry.oldEntries } as EntryEntries,
				textStack,
				meta,
				{ suffix: "\n" }
			);
		}

		if (entry.entries) {
			const len = entry.entries.length;
			if (entry.oldEntries) {
				textStack[0] += "*The replacement is as follows:*\n";
			}
			for (let i = 0; i < len; ++i) {
				this._recursiveRender(entry.entries[i], textStack, meta, { suffix: "\n" });
			}
		} else if (entry.movedTo) {
			textStack[0] += `*This content has been moved to ${entry.movedTo}.*\n`;
		} else {
			textStack[0] += "*This content has been deleted.*\n";
		}
	}

	protected override _renderCode(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += "\n```\n";
		if (entry.preformatted) {
			textStack[0] += entry.preformatted;
		}
		textStack[0] += "\n```\n";
	}

	protected override _renderHr(
		entry: any,
		textStack: TextStack,
		meta: RenderMeta,
		options: RenderOptions
	): void {
		textStack[0] += "\n---\n";
	}

	// ============ Utility Methods ============

	protected _adjustDepth(meta: RenderMeta, adjustment: number): number {
		const cacheDepth = meta.depth;
		meta.depth += adjustment;
		return cacheDepth;
	}

	private _getPageText(opts: { source: string; page?: number }): string {
		const { source, page } = opts;
		if (page != null && page > 0) {
			return `**Source:** *${source}*, page ${page}`;
		}
		return `**Source:** *${source}*`;
	}
}

// ============ Factory Functions ============

export const createMarkdownRenderer = (
	config: Partial<MarkdownRendererConfig> = {}
): MarkdownRenderer => {
	return new MarkdownRenderer(config);
};

let _sharedMarkdownRenderer: MarkdownRenderer | null = null;

export const getMarkdownRenderer = (): MarkdownRenderer => {
	if (!_sharedMarkdownRenderer) {
		_sharedMarkdownRenderer = new MarkdownRenderer();
	}
	return _sharedMarkdownRenderer;
};

// ============ Utility Exports ============

export const markdownUtils = {
	getPageText(it: { source: string; page?: number }): string {
		const { source, page } = it;
		if (page != null && page > 0) {
			return `**Source:** *${source}*, page ${page}`;
		}
		return `**Source:** *${source}*`;
	},

	withMetaDepth<T>(depth: number, opts: { meta?: RenderMeta }, fn: () => T): T {
		opts.meta ||= createRenderMeta();
		const depthCached = opts.meta.depth;
		opts.meta.depth = depth;
		const out = fn();
		opts.meta.depth = depthCached;
		return out;
	},

	getNormalizedNewlines(str: string): string {
		return str.replace(/\n\n+/g, "\n\n");
	},

	getRenderedAbilityScores(ent: Record<string, number | null>, opts: { prefix?: string } = {}): string {
		const { prefix = "" } = opts;
		const header = `${prefix}|${ABIL_ABVS.map(it => `${it.toUpperCase()}|`).join("")}`;
		const separator = `${prefix}|:---:|:---:|:---:|:---:|:---:|:---:|`;

		const values = ABIL_ABVS.map(ab => {
			const score = ent[ab];
			if (score == null) return "\u2014|";
			const mod = Math.floor((score - 10) / 2);
			const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
			return `${score} (${modStr})|`;
		}).join("");

		return `${header}\n${separator}\n${prefix}|${values}`;
	},
};
