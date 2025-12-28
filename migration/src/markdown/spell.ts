// Spell Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.spell
// Provides spell-specific markdown rendering for D&D 5e spells

import type { Entry } from "../../../types/entry.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { stripTags } from "../renderer/tags.js";
import {
	spLevelSchoolMetaToFull,
	spTimeListToFull,
	spRangeToFull,
	spComponentsToFull,
	spDurationToFull,
	type SpellTime,
	type SpellMeta,
	type SpellRange,
	type SpellComponents,
	type SpellDuration,
} from "../parser/spell.js";
import { MarkdownRenderer, getMarkdownRenderer } from "./renderer.js";

// ============ Types ============

export interface SpellEntry {
	name: string;
	_displayName?: string;
	source: string;
	level: number;
	school: string;
	meta?: SpellMeta;
	subschools?: string[];
	time: SpellTime[];
	range: SpellRange;
	components?: SpellComponents;
	duration: SpellDuration[];
	entries?: Entry[];
	entriesHigherLevel?: Entry[];
}

export interface SpellMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

export interface SpellClassRef {
	name: string;
	source: string;
}

export interface SpellClassList {
	fromClassList?: SpellClassRef[];
	fromClassListVariant?: SpellClassRef[];
}

// ============ Helper Functions ============

const getCombinedClasses = (spell: SpellEntry & SpellClassList, prop: keyof SpellClassList): SpellClassRef[] => {
	if (!spell[prop]) return [];
	return spell[prop] ?? [];
};

const spClassesToCurrentAndLegacy = (fromClassList: SpellClassRef[]): [SpellClassRef[], SpellClassRef[]] => {
	const legacySources = new Set(["PHB", "XGE", "TCE"]);
	const current: SpellClassRef[] = [];
	const legacy: SpellClassRef[] = [];

	for (const cls of fromClassList) {
		if (legacySources.has(cls.source)) {
			legacy.push(cls);
		} else {
			current.push(cls);
		}
	}

	return [current, legacy];
};

const spMainClassesToFull = (classes: SpellClassRef[], { isTextOnly = false } = {}): string => {
	if (!classes.length) return "";

	const classNames = [...new Set(classes.map(cls => cls.name))].sort();
	return classNames.join(", ");
};

// ============ Spell Markdown Renderer ============

export class SpellMarkdownRenderer {
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

	getCompactRenderedString(spell: SpellEntry & SpellClassList, opts: SpellMarkdownOptions = {}): string {
		const meta = opts.meta ?? createRenderMeta();
		const styleHint = opts.styleHint ?? this._styleHint;
		const subStack: TextStack = createTextStack();

		// Spell header
		const displayName = spell._displayName ?? spell.name;
		const levelSchoolMeta = spLevelSchoolMetaToFull(
			spell.level,
			spell.school,
			spell.meta,
			spell.subschools,
			{ styleHint },
		);

		subStack[0] += `#### ${displayName}
*${levelSchoolMeta}*
___
- **Casting Time:** ${spTimeListToFull(spell.time, spell.meta, { styleHint }, stripTags)}
- **Range:** ${spRangeToFull(spell.range, { styleHint })}
- **Components:** ${spComponentsToFull(spell.components, spell.level, { isPlainText: true }, stripTags)}
- **Duration:** ${spDurationToFull(spell.duration, { isPlainText: true, styleHint }, stripTags)}
---\n`;

		// Render spell entries
		const cacheDepth = meta.depth;
		meta.depth = 2;

		if (spell.entries?.length) {
			this._renderer.recursiveRender(
				{ entries: spell.entries } as Entry,
				subStack,
				meta,
				{ suffix: "\n" },
			);
		}

		if (spell.entriesHigherLevel?.length) {
			this._renderer.recursiveRender(
				{ entries: spell.entriesHigherLevel } as Entry,
				subStack,
				meta,
				{ suffix: "\n" },
			);
		}

		meta.depth = cacheDepth;

		// Render class list
		const fromClassList = getCombinedClasses(spell, "fromClassList");
		if (fromClassList.length) {
			const [current] = spClassesToCurrentAndLegacy(fromClassList);
			if (current.length) {
				const classListStr = spMainClassesToFull(current, { isTextOnly: true });
				subStack[0] = `${subStack[0].trimEnd()}\n\n**Classes:** ${classListStr}`;
			}
		}

		const spellRender = subStack.join("").trim();
		return `\n${spellRender}\n\n`;
	}
}

// ============ Module Export ============

let _spellRenderer: SpellMarkdownRenderer | null = null;

export const getSpellMarkdownRenderer = (styleHint: StyleHint = "classic"): SpellMarkdownRenderer => {
	if (!_spellRenderer) {
		_spellRenderer = new SpellMarkdownRenderer(undefined, styleHint);
	} else {
		_spellRenderer.setStyleHint(styleHint);
	}
	return _spellRenderer;
};

export const spellMarkdown = {
	getCompactRenderedString: (spell: SpellEntry & SpellClassList, opts: SpellMarkdownOptions = {}): string => {
		return getSpellMarkdownRenderer(opts.styleHint).getCompactRenderedString(spell, opts);
	},
};
