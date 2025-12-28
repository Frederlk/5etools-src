// Spell Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.spell
// Provides spell-specific markdown rendering for D&D 5e spells
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { stripTags } from "../renderer/tags.js";
import { spLevelSchoolMetaToFull, spTimeListToFull, spRangeToFull, spComponentsToFull, spDurationToFull, } from "../parser/spell.js";
import { getMarkdownRenderer } from "./renderer.js";
// ============ Helper Functions ============
const getCombinedClasses = (spell, prop) => {
    if (!spell[prop])
        return [];
    return spell[prop] ?? [];
};
const spClassesToCurrentAndLegacy = (fromClassList) => {
    const legacySources = new Set(["PHB", "XGE", "TCE"]);
    const current = [];
    const legacy = [];
    for (const cls of fromClassList) {
        if (legacySources.has(cls.source)) {
            legacy.push(cls);
        }
        else {
            current.push(cls);
        }
    }
    return [current, legacy];
};
const spMainClassesToFull = (classes, { isTextOnly = false } = {}) => {
    if (!classes.length)
        return "";
    const classNames = [...new Set(classes.map(cls => cls.name))].sort();
    return classNames.join(", ");
};
// ============ Spell Markdown Renderer ============
export class SpellMarkdownRenderer {
    _renderer;
    _styleHint;
    constructor(renderer, styleHint = "classic") {
        this._renderer = renderer ?? getMarkdownRenderer();
        this._styleHint = styleHint;
    }
    setRenderer(renderer) {
        this._renderer = renderer;
        return this;
    }
    setStyleHint(styleHint) {
        this._styleHint = styleHint;
        return this;
    }
    getCompactRenderedString(spell, opts = {}) {
        const meta = opts.meta ?? createRenderMeta();
        const styleHint = opts.styleHint ?? this._styleHint;
        const subStack = createTextStack();
        // Spell header
        const displayName = spell._displayName ?? spell.name;
        const levelSchoolMeta = spLevelSchoolMetaToFull(spell.level, spell.school, spell.meta, spell.subschools, { styleHint });
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
            this._renderer.recursiveRender({ entries: spell.entries }, subStack, meta, { suffix: "\n" });
        }
        if (spell.entriesHigherLevel?.length) {
            this._renderer.recursiveRender({ entries: spell.entriesHigherLevel }, subStack, meta, { suffix: "\n" });
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
let _spellRenderer = null;
export const getSpellMarkdownRenderer = (styleHint = "classic") => {
    if (!_spellRenderer) {
        _spellRenderer = new SpellMarkdownRenderer(undefined, styleHint);
    }
    else {
        _spellRenderer.setStyleHint(styleHint);
    }
    return _spellRenderer;
};
export const spellMarkdown = {
    getCompactRenderedString: (spell, opts = {}) => {
        return getSpellMarkdownRenderer(opts.styleHint).getCompactRenderedString(spell, opts);
    },
};
//# sourceMappingURL=spell.js.map