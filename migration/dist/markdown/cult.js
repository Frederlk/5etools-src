// Cult Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.cult
// Provides cult-specific markdown rendering for D&D 5e cults
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer, markdownUtils } from "./renderer.js";
// ============ Helper Functions ============
const getCultRenderableEntriesMeta = (cult) => {
    if (!cult.goal && !cult.cultists && !cult.signatureSpells) {
        return { listGoalsCultistsSpells: null };
    }
    const items = [];
    if (cult.goal) {
        items.push({
            type: "item",
            name: "Goals:",
            entry: cult.goal.entry,
        });
    }
    if (cult.cultists) {
        items.push({
            type: "item",
            name: "Typical Cultists:",
            entry: cult.cultists.entry,
        });
    }
    if (cult.signatureSpells) {
        items.push({
            type: "item",
            name: "Signature Spells:",
            entry: cult.signatureSpells.entry,
        });
    }
    return {
        listGoalsCultistsSpells: {
            type: "list",
            style: "list-hang-notitle",
            items,
        },
    };
};
// ============ Generic Rendering Helper ============
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
// ============ Cult Markdown Renderer ============
export class CultMarkdownRenderer {
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
    getCompactRenderedString(cult, opts = {}) {
        const meta = opts.meta ?? createRenderMeta();
        const cultEntriesMeta = getCultRenderableEntriesMeta(cult);
        const entries = [
            cultEntriesMeta.listGoalsCultistsSpells,
            ...cult.entries,
        ].filter(Boolean);
        const entFull = {
            ...cult,
            entries,
        };
        return markdownUtils.withMetaDepth(2, { meta }, () => {
            return getGenericCompactRenderedString(entFull, this._renderer, meta);
        });
    }
}
// ============ Module Export ============
let _cultRenderer = null;
export const getCultMarkdownRenderer = (styleHint = "classic") => {
    if (!_cultRenderer) {
        _cultRenderer = new CultMarkdownRenderer(undefined, styleHint);
    }
    else {
        _cultRenderer.setStyleHint(styleHint);
    }
    return _cultRenderer;
};
export const cultMarkdown = {
    getCompactRenderedString: (cult, opts = {}) => {
        return getCultMarkdownRenderer(opts.styleHint).getCompactRenderedString(cult, opts);
    },
    getCultRenderableEntriesMeta,
};
//# sourceMappingURL=cult.js.map