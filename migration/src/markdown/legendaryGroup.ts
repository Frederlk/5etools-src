// Legendary Group Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.legendaryGroup
// Provides legendary group-specific markdown rendering for D&D 5e creatures

import type { Entry } from "../../../types/entry.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer } from "./renderer.js";

// ============ Types ============

export interface LegendaryGroupEntry {
	name: string;
	_displayName?: string;
	source: string;
	page?: number;
	additionalSources?: Array<{ source: string; page?: number }>;
	lairActions?: Entry[];
	regionalEffects?: Entry[];
	mythicEncounter?: Entry[];
}

export interface LegendaryGroupMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

// ============ Helper Functions ============

const hasLegendaryContent = (lg: LegendaryGroupEntry): boolean => {
	return !!(lg.lairActions?.length || lg.regionalEffects?.length || lg.mythicEncounter?.length);
};

const getSummaryEntry = (lg: LegendaryGroupEntry): Entry | null => {
	if (!lg || !hasLegendaryContent(lg)) return null;

	const entries: Entry[] = [];

	if (lg.lairActions?.length) {
		entries.push({
			type: "entries",
			name: "Lair Actions",
			entries: lg.lairActions,
		} as Entry);
	}

	if (lg.regionalEffects?.length) {
		entries.push({
			type: "entries",
			name: "Regional Effects",
			entries: lg.regionalEffects,
		} as Entry);
	}

	if (lg.mythicEncounter?.length) {
		entries.push({
			type: "entries",
			name: "As a Mythic Encounter",
			entries: lg.mythicEncounter,
		} as Entry);
	}

	return {
		type: "section",
		entries,
	} as Entry;
};

// ============ Legendary Group Markdown Renderer ============

export class LegendaryGroupMarkdownRenderer {
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

	getCompactRenderedString(lg: LegendaryGroupEntry, opts: LegendaryGroupMarkdownOptions = {}): string {
		const meta = opts.meta ?? createRenderMeta();

		const subEntry = getSummaryEntry(lg);
		if (!subEntry) return "";

		const subStack: TextStack = createTextStack();

		subStack[0] += `## ${lg._displayName ?? lg.name}`;
		this._renderer.recursiveRender(subEntry, subStack, meta, { suffix: "\n" });

		const lgRender = subStack.join("").trim();
		return `\n${lgRender}\n\n`;
	}

	getSummaryEntry(lg: LegendaryGroupEntry): Entry | null {
		return getSummaryEntry(lg);
	}
}

// ============ Module Export ============

let _legendaryGroupRenderer: LegendaryGroupMarkdownRenderer | null = null;

export const getLegendaryGroupMarkdownRenderer = (
	styleHint: StyleHint = "classic",
): LegendaryGroupMarkdownRenderer => {
	if (!_legendaryGroupRenderer) {
		_legendaryGroupRenderer = new LegendaryGroupMarkdownRenderer(undefined, styleHint);
	} else {
		_legendaryGroupRenderer.setStyleHint(styleHint);
	}
	return _legendaryGroupRenderer;
};

export const legendaryGroupMarkdown = {
	getCompactRenderedString: (
		lg: LegendaryGroupEntry,
		opts: LegendaryGroupMarkdownOptions = {},
	): string => {
		return getLegendaryGroupMarkdownRenderer(opts.styleHint).getCompactRenderedString(lg, opts);
	},

	getSummaryEntry: (lg: LegendaryGroupEntry): Entry | null => {
		return getSummaryEntry(lg);
	},

	hasLegendaryContent: (lg: LegendaryGroupEntry): boolean => {
		return hasLegendaryContent(lg);
	},
};
