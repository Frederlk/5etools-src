// Character Option Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.charoption
// Provides character creation option markdown rendering for D&D 5e
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer } from "./renderer.js";
// ============ Option Type Entries ============
const OPTION_TYPE_ENTRIES = {
    "RF:B": `{@note You may replace the standard feature of your background with this feature.}`,
    "CS": `{@note See the {@adventure Character Secrets|IDRotF|0|character secrets} section for more information.}`,
};
// ============ Helper Functions ============
const getCharoptionRenderableEntriesMeta = (ent) => {
    const optsMapped = ent.optionType
        .map(it => OPTION_TYPE_ENTRIES[it])
        .filter(Boolean);
    if (!optsMapped.length)
        return null;
    return {
        entryOptionType: { type: "entries", entries: optsMapped },
    };
};
const getRenderedPrerequisite = (ent, renderer) => {
    if (!ent.prerequisite?.length)
        return null;
    const parts = [];
    for (const prereq of ent.prerequisite) {
        const prereqParts = [];
        if (prereq.level) {
            const level = prereq.level;
            if (typeof level === "number") {
                prereqParts.push(`Level ${level}`);
            }
            else if (level.level) {
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
                if (r.subrace)
                    name += ` (${r.subrace})`;
                return name;
            }).filter(Boolean);
            if (raceNames.length)
                prereqParts.push(raceNames.join(" or "));
        }
        if (prereq.ability) {
            const abilityParts = prereq.ability.map((ab) => {
                const entries = Object.entries(ab);
                return entries.map(([attr, val]) => `${getAbilityName(attr)} ${val}`).join(" and ");
            });
            if (abilityParts.length)
                prereqParts.push(abilityParts.join("; "));
        }
        if (prereq.spellcasting) {
            prereqParts.push("Spellcasting or Pact Magic feature");
        }
        if (prereq.spellcasting2020) {
            prereqParts.push("The ability to cast at least one spell");
        }
        if (prereq.proficiency) {
            const profParts = prereq.proficiency.map((p) => {
                if (p.armor)
                    return `proficiency with ${p.armor} armor`;
                if (p.weapon)
                    return `proficiency with ${p.weapon} weapons`;
                return "";
            }).filter(Boolean);
            if (profParts.length)
                prereqParts.push(profParts.join(" and "));
        }
        if (prereq.background) {
            const bgNames = prereq.background.map((b) => {
                return b.name || "";
            }).filter(Boolean);
            if (bgNames.length)
                prereqParts.push(bgNames.join(" or ") + " background");
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
const getAbilityName = (abbr) => {
    const abilityMap = {
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
    getCompactRenderedString(ent, opts = {}) {
        const prerequisiteText = getRenderedPrerequisite(ent, this._renderer);
        const entriesMeta = getCharoptionRenderableEntriesMeta(ent);
        const entries = [
            prerequisiteText,
            entriesMeta?.entryOptionType,
            ...ent.entries,
        ].filter((e) => e != null);
        const entFull = {
            ...ent,
            entries,
        };
        return this._getGenericCompactRenderedString(entFull, opts);
    }
    _getGenericCompactRenderedString(ent, opts) {
        const meta = opts.meta ?? createRenderMeta();
        const subStack = createTextStack();
        const displayName = ent._displayName ?? ent.name;
        subStack[0] += `#### ${displayName}\n\n`;
        if (ent.entries?.length) {
            const cacheDepth = meta.depth;
            for (const entry of ent.entries) {
                this._renderer.recursiveRender(entry, subStack, meta, { suffix: "\n\n" });
            }
            meta.depth = cacheDepth;
        }
        const charoptionRender = subStack.join("").trim();
        return `\n${charoptionRender}\n\n`;
    }
}
// ============ Module Export ============
let _charoptionRenderer = null;
export const getCharoptionMarkdownRenderer = (styleHint = "classic") => {
    if (!_charoptionRenderer) {
        _charoptionRenderer = new CharoptionMarkdownRenderer(undefined, styleHint);
    }
    else {
        _charoptionRenderer.setStyleHint(styleHint);
    }
    return _charoptionRenderer;
};
export const charoptionMarkdown = {
    getCompactRenderedString: (ent, opts = {}) => {
        return getCharoptionMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
    },
    getCharoptionRenderableEntriesMeta: (ent) => {
        return getCharoptionRenderableEntriesMeta(ent);
    },
    getRenderedPrerequisite: (ent) => {
        return getRenderedPrerequisite(ent, getMarkdownRenderer());
    },
    getOptionTypeEntries: () => {
        return { ...OPTION_TYPE_ENTRIES };
    },
};
//# sourceMappingURL=charoption.js.map