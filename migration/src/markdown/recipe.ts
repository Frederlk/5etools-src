// Recipe Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.recipe
// Provides recipe-specific markdown rendering for D&D 5e recipes

import type { Entry } from "../../../types/entry.js";
import type {
	Recipe,
	RecipeServes,
	RecipeServesRange,
	RecipeServesExact,
} from "../../../types/recipes.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer, markdownUtils } from "./renderer.js";

// ============ Types ============

interface TimeRange {
	min: number;
	max: number;
}

type TimeValue = number | TimeRange;

interface RecipeTimeExtended {
	total?: TimeValue;
	cooking?: TimeValue;
	preparation?: TimeValue;
	[key: string]: TimeValue | undefined;
}

export interface RecipeEntry extends Omit<Recipe, "time"> {
	time?: RecipeTimeExtended;
	_displayName?: string;
	_fullIngredients?: Entry[];
	_fullEquipment?: Entry[];
	_scaleFactor?: number;
}

export interface RecipeMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

export interface RecipeTimeMeta {
	entryName: string;
	entryContent: string;
}

export interface RecipeRenderableEntriesMeta {
	entryMakes: string | null;
	entryServes: string | null;
	entryMetasTime: RecipeTimeMeta[] | null;
	entryIngredients: { type: "entries"; entries: Entry[] };
	entryEquipment: { type: "entries"; entries: Entry[] } | null;
	entryCooksNotes: { type: "entries"; entries: Entry[] } | null;
	entryInstructions: { type: "entries"; entries: Entry[] };
}

// ============ Helper Functions ============

const toTitleCase = (str: string): string => {
	return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};

const getMinutesToFull = (minutes: number): string => {
	if (minutes < 60) {
		return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	const hourPart = `${hours} hour${hours !== 1 ? "s" : ""}`;
	if (remainingMinutes === 0) {
		return hourPart;
	}
	return `${hourPart}, ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
};

const findCommonSuffix = (arr: string[]): string => {
	if (arr.length === 0) return "";
	if (arr.length === 1) return "";

	const minLen = Math.min(...arr.map(s => s.length));
	let suffix = "";

	for (let i = 1; i <= minLen; i++) {
		const char = arr[0].slice(-i, -i + 1 || undefined);
		if (arr.every(s => s.slice(-i, -i + 1 || undefined) === char)) {
			suffix = arr[0].slice(-i);
		} else {
			break;
		}
	}

	const lastSpaceIndex = suffix.lastIndexOf(" ");
	if (lastSpaceIndex > 0) {
		return suffix.slice(lastSpaceIndex);
	}

	return suffix;
};

const isTimeRange = (val: TimeValue): val is TimeRange => {
	return typeof val === "object" && val !== null && "min" in val && "max" in val;
};

const getEntryMetasTime = (ent: RecipeEntry): RecipeTimeMeta[] | null => {
	if (!ent.time || Object.keys(ent.time).length === 0) return null;

	const timeProps = [
		"total",
		"preparation",
		"cooking",
		...Object.keys(ent.time),
	].filter((v, i, a) => a.indexOf(v) === i);

	return timeProps
		.filter(prop => ent.time?.[prop] !== undefined)
		.map(prop => {
			const val = ent.time![prop];
			if (val === undefined) return null;

			let ptsTime: string[];
			if (isTimeRange(val)) {
				ptsTime = [
					getMinutesToFull(val.min),
					getMinutesToFull(val.max),
				];
			} else {
				ptsTime = [getMinutesToFull(val)];
			}

			const suffix = findCommonSuffix(ptsTime);
			const ptTime = ptsTime
				.map(it => !suffix.length ? it : it.slice(0, -suffix.length))
				.join(" to ");

			return {
				entryName: `{@b {@style ${toTitleCase(prop)} Time:|small-caps}}`,
				entryContent: `${ptTime}${suffix}`,
			};
		})
		.filter((it): it is RecipeTimeMeta => it !== null);
};

const isServesRange = (serves: RecipeServes): serves is RecipeServesRange => {
	return "min" in serves && "max" in serves;
};

const isServesExact = (serves: RecipeServes): serves is RecipeServesExact => {
	return "exact" in serves;
};

const getServesText = (serves: RecipeServes): string => {
	if (isServesRange(serves)) {
		const note = serves.note ? ` ${serves.note}` : "";
		return `${serves.min} to ${serves.max}${note}`;
	}
	if (isServesExact(serves)) {
		const note = serves.note ? ` ${serves.note}` : "";
		return `${serves.exact}${note}`;
	}
	return "";
};

export const getRecipeRenderableEntriesMeta = (ent: RecipeEntry): RecipeRenderableEntriesMeta => {
	const scalePrefix = ent._scaleFactor ? `${ent._scaleFactor}x ` : "";

	return {
		entryMakes: ent.makes
			? `{@b {@style Makes|small-caps}} ${scalePrefix}${ent.makes}`
			: null,
		entryServes: ent.serves
			? `{@b {@style Serves|small-caps}} ${getServesText(ent.serves)}`
			: null,
		entryMetasTime: getEntryMetasTime(ent),
		entryIngredients: { type: "entries", entries: ent._fullIngredients ?? ent.ingredients },
		entryEquipment: ent._fullEquipment?.length
			? { type: "entries", entries: ent._fullEquipment }
			: null,
		entryCooksNotes: ent.noteCook
			? { type: "entries", entries: ent.noteCook }
			: null,
		entryInstructions: { type: "entries", entries: ent.instructions },
	};
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

const getRenderedSubEntry = (
	entry: { type: "entries"; entries: Entry[] },
	renderer: MarkdownRenderer,
	meta: RenderMeta,
): string => {
	const subStack: TextStack = createTextStack();
	renderer.recursiveRender(entry as unknown as Entry, subStack, meta, { suffix: "\n" });
	return markdownUtils.getNormalizedNewlines(subStack.join("").trim());
};

// ============ Recipe Markdown Renderer ============

export class RecipeMarkdownRenderer {
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

	getCompactRenderedString(recipe: RecipeEntry, opts: RecipeMarkdownOptions = {}): string {
		const meta = opts.meta ?? createRenderMeta();
		const entriesMeta = getRecipeRenderableEntriesMeta(recipe);

		const ptHead = markdownUtils.withMetaDepth(0, { meta }, () => {
			const entries: Entry[] = [
				...(entriesMeta.entryMetasTime || [])
					.map(({ entryName, entryContent }) => `${entryName} ${entryContent}`),
				entriesMeta.entryMakes,
				entriesMeta.entryServes,
				entriesMeta.entryIngredients as unknown as Entry,
			].filter(Boolean) as Entry[];

			const entFull = {
				...recipe,
				entries,
			};

			return getGenericCompactRenderedString(entFull, this._renderer, meta);
		});

		const ptInstructions = markdownUtils.withMetaDepth(2, { meta }, () => {
			return getRenderedSubEntry(entriesMeta.entryInstructions, this._renderer, meta);
		});

		const out = [
			ptHead,
			entriesMeta.entryEquipment
				? this._renderer.render(entriesMeta.entryEquipment as unknown as Entry)
				: null,
			entriesMeta.entryCooksNotes
				? this._renderer.render(entriesMeta.entryCooksNotes as unknown as Entry)
				: null,
			ptInstructions,
		]
			.filter(Boolean)
			.join("\n\n");

		return markdownUtils.getNormalizedNewlines(out);
	}
}

// ============ Module Export ============

let _recipeRenderer: RecipeMarkdownRenderer | null = null;

export const getRecipeMarkdownRenderer = (styleHint: StyleHint = "classic"): RecipeMarkdownRenderer => {
	if (!_recipeRenderer) {
		_recipeRenderer = new RecipeMarkdownRenderer(undefined, styleHint);
	} else {
		_recipeRenderer.setStyleHint(styleHint);
	}
	return _recipeRenderer;
};

export const recipeMarkdown = {
	getCompactRenderedString: (recipe: RecipeEntry, opts: RecipeMarkdownOptions = {}): string => {
		return getRecipeMarkdownRenderer(opts.styleHint).getCompactRenderedString(recipe, opts);
	},

	getRecipeRenderableEntriesMeta,
	getEntryMetasTime,
	getServesText,
};
