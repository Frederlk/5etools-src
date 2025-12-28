// Cult Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.cult
// Provides cult-specific markdown rendering for D&D 5e cults

import type { Entry } from "../../../types/entry.js";
import type { Cult, CultGoal, CultCultists, CultSignatureSpells, CultType } from "../../../types/cultsboons.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer, markdownUtils } from "./renderer.js";

// ============ Types ============

export interface CultEntry extends Cult {
	_displayName?: string;
}

export interface CultMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

export interface CultEntriesMeta {
	listGoalsCultistsSpells: Entry | null;
}

// ============ Helper Functions ============

const getCultRenderableEntriesMeta = (cult: CultEntry): CultEntriesMeta => {
	if (!cult.goal && !cult.cultists && !cult.signatureSpells) {
		return { listGoalsCultistsSpells: null };
	}

	const items: Entry[] = [];

	if (cult.goal) {
		items.push({
			type: "item",
			name: "Goals:",
			entry: cult.goal.entry,
		} as Entry);
	}

	if (cult.cultists) {
		items.push({
			type: "item",
			name: "Typical Cultists:",
			entry: cult.cultists.entry,
		} as Entry);
	}

	if (cult.signatureSpells) {
		items.push({
			type: "item",
			name: "Signature Spells:",
			entry: cult.signatureSpells.entry,
		} as Entry);
	}

	return {
		listGoalsCultistsSpells: {
			type: "list",
			style: "list-hang-notitle",
			items,
		} as Entry,
	};
};

// ============ Generic Rendering Helper ============

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

// ============ Cult Markdown Renderer ============

export class CultMarkdownRenderer {
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

	getCompactRenderedString(cult: CultEntry, opts: CultMarkdownOptions = {}): string {
		const meta = opts.meta ?? createRenderMeta();

		const cultEntriesMeta = getCultRenderableEntriesMeta(cult);

		const entries: Entry[] = [
			cultEntriesMeta.listGoalsCultistsSpells,
			...cult.entries,
		].filter(Boolean) as Entry[];

		const entFull = {
			...cult,
			entries,
		};

		return markdownUtils.withMetaDepth(2, { meta }, () => {
			return getGenericCompactRenderedString(entFull, this._renderer, meta);
		});
	}
}

// ============ Module Export ============

let _cultRenderer: CultMarkdownRenderer | null = null;

export const getCultMarkdownRenderer = (styleHint: StyleHint = "classic"): CultMarkdownRenderer => {
	if (!_cultRenderer) {
		_cultRenderer = new CultMarkdownRenderer(undefined, styleHint);
	} else {
		_cultRenderer.setStyleHint(styleHint);
	}
	return _cultRenderer;
};

export const cultMarkdown = {
	getCompactRenderedString: (cult: CultEntry, opts: CultMarkdownOptions = {}): string => {
		return getCultMarkdownRenderer(opts.styleHint).getCompactRenderedString(cult, opts);
	},

	getCultRenderableEntriesMeta,
};
