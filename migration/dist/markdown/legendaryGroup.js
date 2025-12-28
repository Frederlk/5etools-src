// Legendary Group Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.legendaryGroup
// Provides legendary group-specific markdown rendering for D&D 5e creatures
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer } from "./renderer.js";
// ============ Helper Functions ============
const hasLegendaryContent = (lg) => {
    return !!(lg.lairActions?.length || lg.regionalEffects?.length || lg.mythicEncounter?.length);
};
const getSummaryEntry = (lg) => {
    if (!lg || !hasLegendaryContent(lg))
        return null;
    const entries = [];
    if (lg.lairActions?.length) {
        entries.push({
            type: "entries",
            name: "Lair Actions",
            entries: lg.lairActions,
        });
    }
    if (lg.regionalEffects?.length) {
        entries.push({
            type: "entries",
            name: "Regional Effects",
            entries: lg.regionalEffects,
        });
    }
    if (lg.mythicEncounter?.length) {
        entries.push({
            type: "entries",
            name: "As a Mythic Encounter",
            entries: lg.mythicEncounter,
        });
    }
    return {
        type: "section",
        entries,
    };
};
// ============ Legendary Group Markdown Renderer ============
export class LegendaryGroupMarkdownRenderer {
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
    getCompactRenderedString(lg, opts = {}) {
        const meta = opts.meta ?? createRenderMeta();
        const subEntry = getSummaryEntry(lg);
        if (!subEntry)
            return "";
        const subStack = createTextStack();
        subStack[0] += `## ${lg._displayName ?? lg.name}`;
        this._renderer.recursiveRender(subEntry, subStack, meta, { suffix: "\n" });
        const lgRender = subStack.join("").trim();
        return `\n${lgRender}\n\n`;
    }
    getSummaryEntry(lg) {
        return getSummaryEntry(lg);
    }
}
// ============ Module Export ============
let _legendaryGroupRenderer = null;
export const getLegendaryGroupMarkdownRenderer = (styleHint = "classic") => {
    if (!_legendaryGroupRenderer) {
        _legendaryGroupRenderer = new LegendaryGroupMarkdownRenderer(undefined, styleHint);
    }
    else {
        _legendaryGroupRenderer.setStyleHint(styleHint);
    }
    return _legendaryGroupRenderer;
};
export const legendaryGroupMarkdown = {
    getCompactRenderedString: (lg, opts = {}) => {
        return getLegendaryGroupMarkdownRenderer(opts.styleHint).getCompactRenderedString(lg, opts);
    },
    getSummaryEntry: (lg) => {
        return getSummaryEntry(lg);
    },
    hasLegendaryContent: (lg) => {
        return hasLegendaryContent(lg);
    },
};
//# sourceMappingURL=legendaryGroup.js.map