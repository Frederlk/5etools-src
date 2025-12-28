// Character Option Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.charoption
// Provides character creation option markdown rendering for D&D 5e

import type { Entry } from "../../../types/entry.js";
import type { CharCreationOption, CharCreationOptionType } from "../../../types/charcreationoptions.js";
import type { Prerequisite } from "../../../types/util.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer, markdownUtils } from "./renderer.js";

interface PrerequisiteExtended extends Prerequisite {
	background?: Array<{ name: string; displayEntry?: string; source?: string }>;
}

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

	for (const prereq of ent.prerequisite as PrerequisiteExtended[]) {
		const prereqParts: string[] = [];

		if (prereq.level) {
			const level = prereq.level;
			if (typeof level === "number") {
				prereqParts.push(`Level ${level}`);
			} else if (level.level) {
				prereqParts.push(`Level ${level.level}`);
				if (level.class) {
					const className = level.class.name;
					prereqParts.push(className);
				}
			}
		}

		if (prereq.race) {
			const raceNames = prereq.race.map((r) => {
				let name = r.name || "";
				if ((r as { subrace?: string }).subrace) name += ` (${(r as { subrace?: string }).subrace})`;
				return name;
			}).filter(Boolean);
			if (raceNames.length) prereqParts.push(raceNames.join(" or "));
		}

		if (prereq.ability) {
			const abilityParts = prereq.ability.map((ab) => {
				const entries = Object.entries(ab);
				return entries.map(([attr, val]) => `${getAbilityName(attr)} ${val}`).join(" and ");
			});
			if (abilityParts.length) prereqParts.push(abilityParts.join("; "));
		}

		if (prereq.spellcasting) {
			prereqParts.push("Spellcasting or Pact Magic feature");
		}

		if (prereq.spellcasting2020) {
			prereqParts.push("The ability to cast at least one spell");
		}

		if (prereq.proficiency) {
			const profParts = prereq.proficiency.map((p) => {
				if (p.armor) return `proficiency with ${p.armor} armor`;
				if (p.weapon) return `proficiency with ${p.weapon} weapons`;
				return "";
			}).filter(Boolean);
			if (profParts.length) prereqParts.push(profParts.join(" and "));
		}

		if (prereq.background) {
			const bgNames = prereq.background.map((b) => {
				return b.name || "";
			}).filter(Boolean);
			if (bgNames.length) prereqParts.push(bgNames.join(" or ") + " background");
		}

		if (prereq.other) {
			prereqParts.push(prereq.other);
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
