// Character Option Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.charoption
// Provides character creation option markdown rendering for D&D 5e

import type { Entry } from "../../../types/entry.js";
import type { CharCreationOption, CharCreationOptionType } from "../../../types/charcreationoptions.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer, markdownUtils } from "./renderer.js";

// ============ Types ============

export interface CharoptionEntry extends CharCreationOption {
	_displayName?: string;
}

export interface CharoptionMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

export interface CharoptionRenderableEntriesMeta {
	entryOptionType: Entry;
}

// ============ Option Type Entries ============

const OPTION_TYPE_ENTRIES: Record<string, string> = {
	"RF:B": `{@note You may replace the standard feature of your background with this feature.}`,
	"CS": `{@note See the {@adventure Character Secrets|IDRotF|0|character secrets} section for more information.}`,
};

// ============ Helper Functions ============

const getCharoptionRenderableEntriesMeta = (
	ent: CharoptionEntry,
): CharoptionRenderableEntriesMeta | null => {
	const optsMapped = ent.optionType
		.map(it => OPTION_TYPE_ENTRIES[it])
		.filter(Boolean);

	if (!optsMapped.length) return null;

	return {
		entryOptionType: { type: "entries", entries: optsMapped } as Entry,
	};
};

const getRenderedPrerequisite = (
	ent: CharoptionEntry,
	renderer: MarkdownRenderer,
): string | null => {
	if (!ent.prerequisite?.length) return null;

	const parts: string[] = [];

	for (const prereq of ent.prerequisite) {
		const prereqParts: string[] = [];

		if ((prereq as any).level) {
			const level = (prereq as any).level;
			if (typeof level === "number") {
				prereqParts.push(`Level ${level}`);
			} else if (level.level) {
				prereqParts.push(`Level ${level.level}`);
				if (level.class) {
					const className = typeof level.class === "string"
						? level.class
						: level.class.name;
					prereqParts.push(className);
				}
			}
		}

		if ((prereq as any).race) {
			const raceNames = (prereq as any).race.map((r: any) => {
				if (typeof r === "string") return r;
				let name = r.name || "";
				if (r.subrace) name += ` (${r.subrace})`;
				return name;
			}).filter(Boolean);
			if (raceNames.length) prereqParts.push(raceNames.join(" or "));
		}

		if ((prereq as any).ability) {
			const abilityParts = (prereq as any).ability.map((ab: any) => {
				const entries = Object.entries(ab);
				return entries.map(([attr, val]) => `${getAbilityName(attr)} ${val}`).join(" and ");
			});
			if (abilityParts.length) prereqParts.push(abilityParts.join("; "));
		}

		if ((prereq as any).spellcasting) {
			prereqParts.push("Spellcasting or Pact Magic feature");
		}

		if ((prereq as any).spellcasting2020) {
			prereqParts.push("The ability to cast at least one spell");
		}

		if ((prereq as any).proficiency) {
			const profParts = (prereq as any).proficiency.map((p: any) => {
				if (p.armor) return `proficiency with ${p.armor} armor`;
				if (p.weapon) return `proficiency with ${p.weapon} weapons`;
				return "";
			}).filter(Boolean);
			if (profParts.length) prereqParts.push(profParts.join(" and "));
		}

		if ((prereq as any).background) {
			const bgNames = (prereq as any).background.map((b: any) => {
				if (typeof b === "string") return b;
				return b.name || "";
			}).filter(Boolean);
			if (bgNames.length) prereqParts.push(bgNames.join(" or ") + " background");
		}

		if ((prereq as any).other) {
			prereqParts.push((prereq as any).other);
		}

		if (prereqParts.length) {
			parts.push(prereqParts.join(", "));
		}
	}

	return parts.length ? `Prerequisite: ${parts.join("; ")}` : null;
};

const getAbilityName = (abbr: string): string => {
	const abilityMap: Record<string, string> = {
		str: "Strength",
		dex: "Dexterity",
		con: "Constitution",
		int: "Intelligence",
		wis: "Wisdom",
		cha: "Charisma",
	};
	return abilityMap[abbr.toLowerCase()] ?? abbr;
};

// ============ Character Option Markdown Renderer ============

export class CharoptionMarkdownRenderer {
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

	getCompactRenderedString(ent: CharoptionEntry, opts: CharoptionMarkdownOptions = {}): string {
		const prerequisiteText = getRenderedPrerequisite(ent, this._renderer);
		const entriesMeta = getCharoptionRenderableEntriesMeta(ent);

		const entries: Entry[] = [
			prerequisiteText,
			entriesMeta?.entryOptionType,
			...ent.entries,
		].filter((e): e is Entry => e != null);

		const entFull: CharoptionEntry & { entries: Entry[] } = {
			...ent,
			entries,
		};

		return this._getGenericCompactRenderedString(entFull, opts);
	}

	private _getGenericCompactRenderedString(
		ent: CharoptionEntry & { entries: Entry[] },
		opts: CharoptionMarkdownOptions,
	): string {
		const meta = opts.meta ?? createRenderMeta();
		const subStack: TextStack = createTextStack();

		const displayName = ent._displayName ?? ent.name;
		subStack[0] += `#### ${displayName}\n\n`;

		if (ent.entries?.length) {
			const cacheDepth = meta.depth;

			for (const entry of ent.entries) {
				this._renderer.recursiveRender(
					entry,
					subStack,
					meta,
					{ suffix: "\n\n" },
				);
			}

			meta.depth = cacheDepth;
		}

		const charoptionRender = subStack.join("").trim();
		return `\n${charoptionRender}\n\n`;
	}
}

// ============ Module Export ============

let _charoptionRenderer: CharoptionMarkdownRenderer | null = null;

export const getCharoptionMarkdownRenderer = (
	styleHint: StyleHint = "classic",
): CharoptionMarkdownRenderer => {
	if (!_charoptionRenderer) {
		_charoptionRenderer = new CharoptionMarkdownRenderer(undefined, styleHint);
	} else {
		_charoptionRenderer.setStyleHint(styleHint);
	}
	return _charoptionRenderer;
};

export const charoptionMarkdown = {
	getCompactRenderedString: (
		ent: CharoptionEntry,
		opts: CharoptionMarkdownOptions = {},
	): string => {
		return getCharoptionMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
	},

	getCharoptionRenderableEntriesMeta: (
		ent: CharoptionEntry,
	): CharoptionRenderableEntriesMeta | null => {
		return getCharoptionRenderableEntriesMeta(ent);
	},

	getRenderedPrerequisite: (ent: CharoptionEntry): string | null => {
		return getRenderedPrerequisite(ent, getMarkdownRenderer());
	},

	getOptionTypeEntries: (): Record<string, string> => {
		return { ...OPTION_TYPE_ENTRIES };
	},
};
