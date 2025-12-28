// Feat Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.feat
// Provides feat-specific markdown rendering for D&D 5e feats
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer, markdownUtils } from "./renderer.js";
// ============ Category Lookup ============
const FEAT_CATEGORY_TO_FULL = {
    D: "Dragonmark",
    G: "General",
    O: "Origin",
    FS: "Fighting Style",
    "FS:P": "Fighting Style Replacement (Paladin)",
    "FS:R": "Fighting Style Replacement (Ranger)",
    EB: "Epic Boon",
};
// ============ Helper Functions ============
const getCategoryText = (category) => {
    return FEAT_CATEGORY_TO_FULL[category] ?? category;
};
const getCategoryWithFeatSuffix = (category) => {
    const categoryText = getCategoryText(category);
    if (["FS:P", "FS:R"].includes(category)) {
        return categoryText;
    }
    return `${categoryText} Feat`;
};
const getJoinedCategoryPrerequisites = (category, prerequisite) => {
    const ptCategory = category ? getCategoryWithFeatSuffix(category) : "";
    if (ptCategory && prerequisite) {
        return `${ptCategory} (${prerequisite})`;
    }
    return ptCategory || prerequisite || null;
};
const getRenderedPrerequisite = (ent, renderer) => {
    if (!ent.prerequisite?.length)
        return null;
    const parts = [];
    for (const prereq of ent.prerequisite) {
        const prereqParts = [];
        if (prereq.level) {
            if (typeof prereq.level === "number") {
                prereqParts.push(`Level ${prereq.level}`);
            }
            else if (prereq.level.level) {
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
            const raceNames = prereq.race.map((r) => {
                if (typeof r === "string")
                    return r;
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
        if (prereq.feat) {
            const featNames = prereq.feat.map((f) => f.split("|")[0]).join(" or ");
            prereqParts.push(featNames);
        }
        if (prereq.feature) {
            const featureNames = prereq.feature.map((f) => {
                if (typeof f === "string")
                    return f;
                return f.feature || "";
            }).filter(Boolean);
            if (featureNames.length)
                prereqParts.push(featureNames.join(" or "));
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
const getRepeatableEntry = (ent) => {
    if (!ent.repeatable)
        return null;
    const note = ent.repeatableNote || (ent.repeatable ? "Yes" : "No");
    return `{@b Repeatable:} ${note}`;
};
const getFeatRenderableEntriesMeta = (ent) => {
    const entries = ent._fullEntries ?? ent.entries;
    if (!entries?.length)
        return null;
    return {
        entryMain: { type: "entries", entries },
    };
};
// ============ Feat Markdown Renderer ============
export class FeatMarkdownRenderer {
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
        const categoryPrerequisite = getJoinedCategoryPrerequisites(ent.category, prerequisiteText);
        const repeatableEntry = getRepeatableEntry(ent);
        const entriesMeta = getFeatRenderableEntriesMeta(ent);
        const entries = [
            categoryPrerequisite,
            repeatableEntry,
            entriesMeta?.entryMain,
        ].filter((e) => e != null);
        const entFull = {
            ...ent,
            entries,
        };
        return markdownUtils.withMetaDepth(2, opts, () => {
            return this._getGenericCompactRenderedString(entFull, opts);
        });
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
        const featRender = subStack.join("").trim();
        return `\n${featRender}\n\n`;
    }
}
// ============ Module Export ============
let _featRenderer = null;
export const getFeatMarkdownRenderer = (styleHint = "classic") => {
    if (!_featRenderer) {
        _featRenderer = new FeatMarkdownRenderer(undefined, styleHint);
    }
    else {
        _featRenderer.setStyleHint(styleHint);
    }
    return _featRenderer;
};
export const featMarkdown = {
    getCompactRenderedString: (ent, opts = {}) => {
        return getFeatMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
    },
    getJoinedCategoryPrerequisites: (category, prerequisite) => {
        return getJoinedCategoryPrerequisites(category, prerequisite);
    },
    getRenderedPrerequisite: (ent) => {
        return getRenderedPrerequisite(ent, getMarkdownRenderer());
    },
    getRepeatableEntry: (ent) => {
        return getRepeatableEntry(ent);
    },
    getCategoryText: (category) => {
        return getCategoryText(category);
    },
    getCategoryWithFeatSuffix: (category) => {
        return getCategoryWithFeatSuffix(category);
    },
};
//# sourceMappingURL=feat.js.map