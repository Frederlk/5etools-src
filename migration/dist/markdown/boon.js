// Boon Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.boon
// Provides boon-specific markdown rendering for D&D 5e demonic boons
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer, markdownUtils } from "./renderer.js";
// ============ Helper Functions ============
const getBoonRenderableEntriesMeta = (boon) => {
    if (!boon.ability && !boon.signatureSpells) {
        return { listBenefits: null };
    }
    const items = [];
    if (boon.ability) {
        items.push({
            type: "item",
            name: "Ability Score Adjustment:",
            entry: boon.ability.entry,
        });
    }
    if (boon.signatureSpells) {
        items.push({
            type: "item",
            name: "Signature Spells:",
            entry: boon.signatureSpells.entry,
        });
    }
    const listBenefits = {
        type: "list",
        style: "list-hang-notitle",
        items,
    };
    return { listBenefits };
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
// ============ Boon Markdown Renderer ============
export class BoonMarkdownRenderer {
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
    getCompactRenderedString(boon, opts = {}) {
        const meta = opts.meta ?? createRenderMeta();
        const entriesMeta = getBoonRenderableEntriesMeta(boon);
        const entries = [
            entriesMeta.listBenefits,
            ...boon.entries,
        ].filter(Boolean);
        const entFull = {
            ...boon,
            entries,
        };
        return markdownUtils.withMetaDepth(1, { meta }, () => {
            return getGenericCompactRenderedString(entFull, this._renderer, meta);
        });
    }
}
// ============ Module Export ============
let _boonRenderer = null;
export const getBoonMarkdownRenderer = (styleHint = "classic") => {
    if (!_boonRenderer) {
        _boonRenderer = new BoonMarkdownRenderer(undefined, styleHint);
    }
    else {
        _boonRenderer.setStyleHint(styleHint);
    }
    return _boonRenderer;
};
export const boonMarkdown = {
    getCompactRenderedString: (boon, opts = {}) => {
        return getBoonMarkdownRenderer(opts.styleHint).getCompactRenderedString(boon, opts);
    },
    getBoonRenderableEntriesMeta,
};
//# sourceMappingURL=boon.js.map