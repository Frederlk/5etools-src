// Deity Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.deity
// Provides deity-specific markdown rendering for D&D 5e deities

import type { Entry } from "../../../types/entry.js";
import type { Deity } from "../../../types/deities.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer } from "./renderer.js";
import { toTitleCase } from "../util/str-util.js";
import { alignmentAbvToFull } from "../parser/monster.js";

// ============ Types ============

export interface DeityEntry extends Deity {
	_displayName?: string;
	customProperties?: Record<string, string>;
}

export interface DeityMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

export interface DeityEntriesMeta {
	entriesAttributes: string[];
}

// ============ Helper Functions ============

const getAlignmentText = (alignments: string[]): string => {
	const joined = alignments
		.map(a => alignmentAbvToFull(a))
		.filter(Boolean)
		.join(" ");
	return toTitleCase(joined);
};

const BASE_PART_TRANSLATORS: Record<string, { name: string; displayFn?: (val: unknown) => string }> = {
	alignment: {
		name: "Alignment",
		displayFn: (it) => getAlignmentText(it as string[]),
	},
	pantheon: {
		name: "Pantheon",
	},
	category: {
		name: "Category",
		displayFn: (it) => typeof it === "string" ? it : (it as string[]).join(", "),
	},
	domains: {
		name: "Domains",
		displayFn: (it) => (it as string[]).join(", "),
	},
	province: {
		name: "Province",
	},
	dogma: {
		name: "Dogma",
	},
	altNames: {
		name: "Alternate Names",
		displayFn: (it) => (it as string[]).join(", "),
	},
	plane: {
		name: "Home Plane",
	},
	worshipers: {
		name: "Typical Worshipers",
	},
	symbol: {
		name: "Symbol",
	},
};

const getDeityRenderableEntriesMeta = (deity: DeityEntry): DeityEntriesMeta => {
	const entriesAttributes: { name: string; entry: string }[] = [];

	for (const [prop, { name, displayFn }] of Object.entries(BASE_PART_TRANSLATORS)) {
		const value = (deity as unknown as Record<string, unknown>)[prop];
		if (value == null) continue;

		const displayVal = displayFn ? displayFn(value) : String(value);
		entriesAttributes.push({
			name,
			entry: `**${name}:** ${displayVal}`,
		});
	}

	if (deity.customProperties) {
		for (const [name, val] of Object.entries(deity.customProperties)) {
			entriesAttributes.push({
				name,
				entry: `**${name}:** ${val}`,
			});
		}
	}

	entriesAttributes.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

	return {
		entriesAttributes: entriesAttributes.map(({ entry }) => entry),
	};
};

// ============ Deity Markdown Renderer ============

export class DeityMarkdownRenderer {
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

	getCompactRenderedString(deity: DeityEntry, opts: DeityMarkdownOptions = {}): string {
		const meta = opts.meta ?? createRenderMeta();
		const subStack: TextStack = createTextStack();

		const entriesMeta = getDeityRenderableEntriesMeta(deity);

		const entries: (string | { entries: Entry[] })[] = [
			...entriesMeta.entriesAttributes,
			deity.entries ? { entries: deity.entries } : null,
		].filter((e): e is NonNullable<typeof e> => e != null);

		const displayName = deity.title
			? `${deity._displayName ?? deity.name}, ${toTitleCase(deity.title)}`
			: (deity._displayName ?? deity.name);

		return this._renderGenericCompact(displayName, entries, subStack, meta);
	}

	private _renderGenericCompact(
		name: string,
		entries: (string | { entries: Entry[] })[],
		subStack: TextStack,
		meta: RenderMeta,
	): string {
		subStack[0] += `#### ${name}`;
		subStack[0] += "\n\n";

		if (entries?.length) {
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

		const deityRender = subStack.join("").trim();
		return `\n${deityRender}\n\n`;
	}
}

// ============ Module Export ============

let _deityRenderer: DeityMarkdownRenderer | null = null;

export const getDeityMarkdownRenderer = (styleHint: StyleHint = "classic"): DeityMarkdownRenderer => {
	if (!_deityRenderer) {
		_deityRenderer = new DeityMarkdownRenderer(undefined, styleHint);
	} else {
		_deityRenderer.setStyleHint(styleHint);
	}
	return _deityRenderer;
};

export const deityMarkdown = {
	getCompactRenderedString: (deity: DeityEntry, opts: DeityMarkdownOptions = {}): string => {
		return getDeityMarkdownRenderer(opts.styleHint).getCompactRenderedString(deity, opts);
	},

	getDeityRenderableEntriesMeta,
};
