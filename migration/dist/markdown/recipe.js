// Recipe Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.recipe
// Provides recipe-specific markdown rendering for D&D 5e recipes
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer, markdownUtils } from "./renderer.js";
// ============ Helper Functions ============
const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};
const getMinutesToFull = (minutes) => {
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
const findCommonSuffix = (arr) => {
    if (arr.length === 0)
        return "";
    if (arr.length === 1)
        return "";
    const minLen = Math.min(...arr.map(s => s.length));
    let suffix = "";
    for (let i = 1; i <= minLen; i++) {
        const char = arr[0].slice(-i, -i + 1 || undefined);
        if (arr.every(s => s.slice(-i, -i + 1 || undefined) === char)) {
            suffix = arr[0].slice(-i);
        }
        else {
            break;
        }
    }
    const lastSpaceIndex = suffix.lastIndexOf(" ");
    if (lastSpaceIndex > 0) {
        return suffix.slice(lastSpaceIndex);
    }
    return suffix;
};
const isTimeRange = (val) => {
    return typeof val === "object" && val !== null && "min" in val && "max" in val;
};
const getEntryMetasTime = (ent) => {
    if (!ent.time || Object.keys(ent.time).length === 0)
        return null;
    const timeProps = [
        "total",
        "preparation",
        "cooking",
        ...Object.keys(ent.time),
    ].filter((v, i, a) => a.indexOf(v) === i);
    return timeProps
        .filter(prop => ent.time?.[prop] !== undefined)
        .map(prop => {
        const val = ent.time[prop];
        if (val === undefined)
            return null;
        let ptsTime;
        if (isTimeRange(val)) {
            ptsTime = [
                getMinutesToFull(val.min),
                getMinutesToFull(val.max),
            ];
        }
        else {
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
        .filter((it) => it !== null);
};
const isServesRange = (serves) => {
    return "min" in serves && "max" in serves;
};
const isServesExact = (serves) => {
    return "exact" in serves;
};
const getServesText = (serves) => {
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
export const getRecipeRenderableEntriesMeta = (ent) => {
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
const getGenericCompactRenderedString = (ent, renderer, meta) => {
    const subStack = createTextStack();
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
const getRenderedSubEntry = (entry, renderer, meta) => {
    const subStack = createTextStack();
    renderer.recursiveRender(entry, subStack, meta, { suffix: "\n" });
    return markdownUtils.getNormalizedNewlines(subStack.join("").trim());
};
// ============ Recipe Markdown Renderer ============
export class RecipeMarkdownRenderer {
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
    getCompactRenderedString(recipe, opts = {}) {
        const meta = opts.meta ?? createRenderMeta();
        const entriesMeta = getRecipeRenderableEntriesMeta(recipe);
        const ptHead = markdownUtils.withMetaDepth(0, { meta }, () => {
            const entries = [
                ...(entriesMeta.entryMetasTime || [])
                    .map(({ entryName, entryContent }) => `${entryName} ${entryContent}`),
                entriesMeta.entryMakes,
                entriesMeta.entryServes,
                entriesMeta.entryIngredients,
            ].filter((e) => e != null);
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
                ? this._renderer.render(entriesMeta.entryEquipment)
                : null,
            entriesMeta.entryCooksNotes
                ? this._renderer.render(entriesMeta.entryCooksNotes)
                : null,
            ptInstructions,
        ]
            .filter(Boolean)
            .join("\n\n");
        return markdownUtils.getNormalizedNewlines(out);
    }
}
// ============ Module Export ============
let _recipeRenderer = null;
export const getRecipeMarkdownRenderer = (styleHint = "classic") => {
    if (!_recipeRenderer) {
        _recipeRenderer = new RecipeMarkdownRenderer(undefined, styleHint);
    }
    else {
        _recipeRenderer.setStyleHint(styleHint);
    }
    return _recipeRenderer;
};
export const recipeMarkdown = {
    getCompactRenderedString: (recipe, opts = {}) => {
        return getRecipeMarkdownRenderer(opts.styleHint).getCompactRenderedString(recipe, opts);
    },
    getRecipeRenderableEntriesMeta,
    getEntryMetasTime,
    getServesText,
};
//# sourceMappingURL=recipe.js.map