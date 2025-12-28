// Feat Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.feat
// Provides feat-specific markdown rendering for D&D 5e feats

import type { Entry } from "../../../types/entry.js";
import type { Feat, FeatCategory } from "../../../types/feats.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer, markdownUtils } from "./renderer.js";

// ============ Types ============

export interface FeatEntry extends Feat {
	_displayName?: string;
	_fullEntries?: Entry[];
}

export interface FeatMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

// ============ Category Lookup ============

const FEAT_CATEGORY_TO_FULL: Record<string, string> = {
	D: "Dragonmark",
	G: "General",
	O: "Origin",
	FS: "Fighting Style",
	"FS:P": "Fighting Style Replacement (Paladin)",
	"FS:R": "Fighting Style Replacement (Ranger)",
	EB: "Epic Boon",
};

// ============ Helper Functions ============

const getCategoryText = (category: FeatCategory | string): string => {
	return FEAT_CATEGORY_TO_FULL[category] ?? category;
};

const getCategoryWithFeatSuffix = (category: FeatCategory | string): string => {
	const categoryText = getCategoryText(category);
	if (["FS:P", "FS:R"].includes(category)) {
		return categoryText;
	}
	return `${categoryText} Feat`;
};

const getJoinedCategoryPrerequisites = (
	category: FeatCategory | string | undefined,
	prerequisite: string | null,
): string | null => {
	const ptCategory = category ? getCategoryWithFeatSuffix(category) : "";

	if (ptCategory && prerequisite) {
		return `${ptCategory} (${prerequisite})`;
	}
	return ptCategory || prerequisite || null;
};

const getRenderedPrerequisite = (
	ent: FeatEntry,
	renderer: MarkdownRenderer,
): string | null => {
	if (!ent.prerequisite?.length) return null;

	const parts: string[] = [];

	for (const prereq of ent.prerequisite) {
		const prereqParts: string[] = [];

		if (prereq.level) {
			if (typeof prereq.level === "number") {
				prereqParts.push(`Level ${prereq.level}`);
			} else if (prereq.level.level) {
				prereqParts.push(`Level ${prereq.level.level}`);
				if (prereq.level.class) {
					const className = typeof prereq.level.class === "string"
						? prereq.level.class
						: prereq.level.class.name;
					prereqParts.push(className);
				}
			}
		}

		if (prereq.race) {
			const raceNames = prereq.race.map((r: any) => {
				if (typeof r === "string") return r;
				let name = r.name || "";
				if (r.subrace) name += ` (${r.subrace})`;
				return name;
			}).filter(Boolean);
			if (raceNames.length) prereqParts.push(raceNames.join(" or "));
		}

		if (prereq.ability) {
			const abilityParts = prereq.ability.map((ab: any) => {
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
			const profParts = prereq.proficiency.map((p: any) => {
				if (p.armor) return `proficiency with ${p.armor} armor`;
				if (p.weapon) return `proficiency with ${p.weapon} weapons`;
				return "";
			}).filter(Boolean);
			if (profParts.length) prereqParts.push(profParts.join(" and "));
		}

		if (prereq.feat) {
			const featNames = prereq.feat.map((f: string) => f.split("|")[0]).join(" or ");
			prereqParts.push(featNames);
		}

		if (prereq.feature) {
			const featureNames = prereq.feature.map((f: any) => {
				if (typeof f === "string") return f;
				return f.feature || "";
			}).filter(Boolean);
			if (featureNames.length) prereqParts.push(featureNames.join(" or "));
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

const getRepeatableEntry = (ent: FeatEntry): string | null => {
	if (!ent.repeatable) return null;
	const note = ent.repeatableNote || (ent.repeatable ? "Yes" : "No");
	return `{@b Repeatable:} ${note}`;
};

const getFeatRenderableEntriesMeta = (ent: FeatEntry): { entryMain: Entry } | null => {
	const entries = ent._fullEntries ?? ent.entries;
	if (!entries?.length) return null;
	return {
		entryMain: { type: "entries", entries } as Entry,
	};
};

// ============ Feat Markdown Renderer ============

export class FeatMarkdownRenderer {
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

	getCompactRenderedString(ent: FeatEntry, opts: FeatMarkdownOptions = {}): string {
		const prerequisiteText = getRenderedPrerequisite(ent, this._renderer);
		const categoryPrerequisite = getJoinedCategoryPrerequisites(ent.category, prerequisiteText);
		const repeatableEntry = getRepeatableEntry(ent);
		const entriesMeta = getFeatRenderableEntriesMeta(ent);

		const entries: Entry[] = [
			categoryPrerequisite,
			repeatableEntry,
			entriesMeta?.entryMain,
		].filter((e): e is Entry => e != null);

		const entFull: FeatEntry & { entries: Entry[] } = {
			...ent,
			entries,
		};

		return markdownUtils.withMetaDepth(2, opts, () => {
			return this._getGenericCompactRenderedString(entFull, opts);
		});
	}

	private _getGenericCompactRenderedString(
		ent: FeatEntry & { entries: Entry[] },
		opts: FeatMarkdownOptions,
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

		const featRender = subStack.join("").trim();
		return `\n${featRender}\n\n`;
	}
}

// ============ Module Export ============

let _featRenderer: FeatMarkdownRenderer | null = null;

export const getFeatMarkdownRenderer = (styleHint: StyleHint = "classic"): FeatMarkdownRenderer => {
	if (!_featRenderer) {
		_featRenderer = new FeatMarkdownRenderer(undefined, styleHint);
	} else {
		_featRenderer.setStyleHint(styleHint);
	}
	return _featRenderer;
};

export const featMarkdown = {
	getCompactRenderedString: (ent: FeatEntry, opts: FeatMarkdownOptions = {}): string => {
		return getFeatMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
	},

	getJoinedCategoryPrerequisites: (
		category: FeatCategory | string | undefined,
		prerequisite: string | null,
	): string | null => {
		return getJoinedCategoryPrerequisites(category, prerequisite);
	},

	getRenderedPrerequisite: (ent: FeatEntry): string | null => {
		return getRenderedPrerequisite(ent, getMarkdownRenderer());
	},

	getRepeatableEntry: (ent: FeatEntry): string | null => {
		return getRepeatableEntry(ent);
	},

	getCategoryText: (category: FeatCategory | string): string => {
		return getCategoryText(category);
	},

	getCategoryWithFeatSuffix: (category: FeatCategory | string): string => {
		return getCategoryWithFeatSuffix(category);
	},
};
