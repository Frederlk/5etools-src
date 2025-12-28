// Language Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.language
// Provides language-specific markdown rendering for D&D 5e languages

import type { Entry } from "../../../types/entry.js";
import type { Language } from "../../../types/languages.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer } from "./renderer.js";
import { uppercaseFirst } from "../util/str-util.js";

// ============ Types ============

export interface LanguageEntry extends Language {
	_displayName?: string;
}

export interface LanguageMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

export interface LanguageEntriesMeta {
	entryType: string | null;
	entryTypicalSpeakers: string | null;
	entryScript: string | null;
	entriesContent: Entry[] | null;
}

type LanguageRenderEntry = string | { entries: Entry[] };

// ============ Helper Functions ============

const getLanguageRenderableEntriesMeta = (lang: LanguageEntry): LanguageEntriesMeta => {
	return {
		entryType: lang.type ? `**Type:** ${uppercaseFirst(lang.type)}` : null,
		entryTypicalSpeakers: lang.typicalSpeakers?.length
			? `**Typical Speakers:** ${lang.typicalSpeakers.join(", ")}`
			: null,
		entryScript: lang.script ? `**Script:** ${lang.script}` : null,
		entriesContent: lang.entries ?? null,
	};
};

// ============ Language Markdown Renderer ============

export class LanguageMarkdownRenderer {
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

	getCompactRenderedString(lang: LanguageEntry, opts: LanguageMarkdownOptions = {}): string {
		const meta = opts.meta ?? createRenderMeta();
		const subStack: TextStack = createTextStack();

		const entriesMeta = getLanguageRenderableEntriesMeta(lang);

		const entries: LanguageRenderEntry[] = [
			entriesMeta.entryType,
			entriesMeta.entryTypicalSpeakers,
			entriesMeta.entryScript,
			entriesMeta.entriesContent ? { entries: entriesMeta.entriesContent } : null,
		].filter((e): e is NonNullable<typeof e> => e != null);

		const displayName = lang._displayName ?? lang.name;
		subStack[0] += `#### ${displayName}`;
		subStack[0] += "\n\n";

		if (entries.length) {
			const cacheDepth = meta.depth;
			meta.depth = 1;

			for (const entry of entries) {
				this._renderer.recursiveRender(
					entry as Entry,
					subStack,
					meta,
					{ suffix: "\n\n" },
				);
			}

			meta.depth = cacheDepth;
		}

		const langRender = subStack.join("").trim();
		return `\n${langRender}\n\n`;
	}
}

// ============ Module Export ============

let _languageRenderer: LanguageMarkdownRenderer | null = null;

export const getLanguageMarkdownRenderer = (styleHint: StyleHint = "classic"): LanguageMarkdownRenderer => {
	if (!_languageRenderer) {
		_languageRenderer = new LanguageMarkdownRenderer(undefined, styleHint);
	} else {
		_languageRenderer.setStyleHint(styleHint);
	}
	return _languageRenderer;
};

export const languageMarkdown = {
	getCompactRenderedString: (lang: LanguageEntry, opts: LanguageMarkdownOptions = {}): string => {
		return getLanguageMarkdownRenderer(opts.styleHint).getCompactRenderedString(lang, opts);
	},

	getLanguageRenderableEntriesMeta,
};
