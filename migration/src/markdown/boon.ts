// Boon Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.boon
// Provides boon-specific markdown rendering for D&D 5e demonic boons

import type { Entry, EntryList, EntryItem } from "../../../types/entry.js";
import type { Boon, BoonAbility, BoonSignatureSpells, BoonType } from "../../../types/cultsboons.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer, markdownUtils } from "./renderer.js";

// ============ Types ============

export interface BoonEntry extends Boon {
	_displayName?: string;
}

export interface BoonMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

export interface BoonRenderableEntriesMeta {
	listBenefits: EntryList | null;
}

// ============ Helper Functions ============

const getBoonRenderableEntriesMeta = (boon: BoonEntry): BoonRenderableEntriesMeta => {
	if (!boon.ability && !boon.signatureSpells) {
		return { listBenefits: null };
	}

	const items: EntryItem[] = [];

	if (boon.ability) {
		items.push({
			type: "item",
			name: "Ability Score Adjustment:",
			entry: boon.ability.entry,
		} as EntryItem);
	}

	if (boon.signatureSpells) {
		items.push({
			type: "item",
			name: "Signature Spells:",
			entry: boon.signatureSpells.entry,
		} as EntryItem);
	}

	const listBenefits: EntryList = {
		type: "list",
		style: "list-hang-notitle",
		items,
	};

	return { listBenefits };
};

// ============ Generic Rendering Helpers ============

const getGenericCompactRenderedString = (
	ent: { name: string; _displayName?: string; entries?: Entry[] },
	renderer: MarkdownRenderer,
	meta: RenderMeta,
): string => {
	const subStack: TextStack = createTextStack();
	const displayName = ent._displayName ?? ent.name;

	subStack[0] += `## ${displayName}\n\n`;

	if (ent.entries) {
		for (const entry of ent.entries) {
			renderer.recursiveRender(entry, subStack, meta, { suffix: "\n" });
			subStack[0] += "\n";
		}
	}

	return `\n${markdownUtils.getNormalizedNewlines(subStack.join("").trim())}\n\n`;
};

// ============ Boon Markdown Renderer ============

export class BoonMarkdownRenderer {
	private _renderer: MarkdownRenderer;
	private _styleHint: StyleHint;

	constructor(renderer?: MarkdownRenderer, styleHint: StyleHint = "classic") {
		this._renderer = renderer ?? getMarkdownRenderer();
		this._styleHint = styleHint;
	}

	setRenderer(renderer: MarkdownRenderer): this {
		this._renderer = renderer;
		return this;
	}

	setStyleHint(styleHint: StyleHint): this {
		this._styleHint = styleHint;
		return this;
	}

	getCompactRenderedString(boon: BoonEntry, opts: BoonMarkdownOptions = {}): string {
		const meta = opts.meta ?? createRenderMeta();

		const entriesMeta = getBoonRenderableEntriesMeta(boon);

		const entries: Entry[] = [
			entriesMeta.listBenefits,
			...boon.entries,
		].filter(Boolean) as Entry[];

		const entFull = {
			...boon,
			entries,
		};

		return markdownUtils.withMetaDepth(1, { meta }, () => {
			return getGenericCompactRenderedString(entFull, this._renderer, meta);
		});
	}
}

// ============ Module Export ============

let _boonRenderer: BoonMarkdownRenderer | null = null;

export const getBoonMarkdownRenderer = (styleHint: StyleHint = "classic"): BoonMarkdownRenderer => {
	if (!_boonRenderer) {
		_boonRenderer = new BoonMarkdownRenderer(undefined, styleHint);
	} else {
		_boonRenderer.setStyleHint(styleHint);
	}
	return _boonRenderer;
};

export const boonMarkdown = {
	getCompactRenderedString: (boon: BoonEntry, opts: BoonMarkdownOptions = {}): string => {
		return getBoonMarkdownRenderer(opts.styleHint).getCompactRenderedString(boon, opts);
	},

	getBoonRenderableEntriesMeta,
};
