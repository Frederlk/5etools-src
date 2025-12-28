// Psionic Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.psionic
// Provides psionic-specific markdown rendering for D&D 5e psionics

import type { Entry } from "../../../types/entry.js";
import type { Psionic, PsionicMode, PsionicType, PsionicOrder } from "../../../types/psionics.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer, markdownUtils } from "./renderer.js";

// ============ Types ============

export interface PsionicEntry extends Psionic {
	_displayName?: string;
}

export interface PsionicMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

interface PsionicEntriesMeta {
	entryTypeOrder: string;
	entryContent: Entry | null;
	entryFocus: string | null;
	entriesModes: Entry[] | null;
}

// ============ Helper Functions ============

const getTypeString = (type: PsionicType): string => {
	return type === "D" ? "Discipline" : "Talent";
};

const getTypeOrderString = (psi: PsionicEntry): string => {
	const type = getTypeString(psi.type);
	if (psi.order) {
		return `${type} (${psi.order})`;
	}
	return type;
};

const getModeEntry = (mode: PsionicMode): Entry => {
	const parts: string[] = [mode.name];

	if (mode.cost) {
		parts.push(` (${mode.cost.min}-${mode.cost.max} psi)`);
	}

	if (mode.concentration) {
		const unitMap: Record<string, string> = {
			hr: "hour",
			min: "minute",
			rnd: "round",
		};
		const unit = unitMap[mode.concentration.unit] ?? mode.concentration.unit;
		const plural = mode.concentration.duration !== 1 ? "s" : "";
		parts.push(`, conc., up to ${mode.concentration.duration} ${unit}${plural}`);
	}

	const modeEntry: Entry = {
		type: "entries",
		name: parts.join(""),
		entries: [...mode.entries],
	};

	if (mode.submodes?.length) {
		const submodeEntries = mode.submodes.map((submode) => {
			const costStr = submode.cost
				? ` (${submode.cost.min}-${submode.cost.max} psi)`
				: "";
			return {
				type: "entries",
				name: `${submode.name}${costStr}`,
				entries: submode.entries,
			} as Entry;
		});
		modeEntry?.entries?.push(...submodeEntries);
	}

	return modeEntry;
};

const getPsionicRenderableEntriesMeta = (psi: PsionicEntry): PsionicEntriesMeta => {
	return {
		entryTypeOrder: `*${getTypeOrderString(psi)}*`,
		entryContent: psi.entries?.length ? { type: "entries", entries: psi.entries } as Entry : null,
		entryFocus: psi.focus ? `**Psychic Focus.** ${psi.focus}` : null,
		entriesModes: psi.modes?.map((mode) => getModeEntry(mode)) ?? null,
	};
};

// ============ Psionic Markdown Renderer ============

export class PsionicMarkdownRenderer {
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

	getCompactRenderedString(psi: PsionicEntry, opts: PsionicMarkdownOptions = {}): string {
		const entriesMeta = getPsionicRenderableEntriesMeta(psi);

		const entries: Entry[] = [
			entriesMeta.entryTypeOrder,
			entriesMeta.entryContent,
			entriesMeta.entryFocus,
			...(entriesMeta.entriesModes ?? []),
		].filter(Boolean) as Entry[];

		const entFull: Entry = {
			type: "entries",
			name: psi._displayName ?? psi.name,
			entries,
		};

		return markdownUtils.withMetaDepth(2, opts, () => {
			const subStack: TextStack = createTextStack();
			const meta = opts.meta ?? createRenderMeta();
			meta.depth = 2;

			this._renderer.recursiveRender(entFull, subStack, meta, { suffix: "\n" });

			const rendered = subStack.join("").trim();
			return `\n${rendered}\n\n`;
		});
	}
}

// ============ Module Export ============

let _psionicRenderer: PsionicMarkdownRenderer | null = null;

export const getPsionicMarkdownRenderer = (styleHint: StyleHint = "classic"): PsionicMarkdownRenderer => {
	if (!_psionicRenderer) {
		_psionicRenderer = new PsionicMarkdownRenderer(undefined, styleHint);
	} else {
		_psionicRenderer.setStyleHint(styleHint);
	}
	return _psionicRenderer;
};

export const psionicMarkdown = {
	getCompactRenderedString: (psi: PsionicEntry, opts: PsionicMarkdownOptions = {}): string => {
		return getPsionicMarkdownRenderer(opts.styleHint).getCompactRenderedString(psi, opts);
	},

	getTypeOrderString: (psi: PsionicEntry): string => {
		return getTypeOrderString(psi);
	},

	getTypeString: (type: PsionicType): string => {
		return getTypeString(type);
	},
};
