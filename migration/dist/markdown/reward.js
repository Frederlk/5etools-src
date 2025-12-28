// Reward Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.reward
// Provides reward-specific markdown rendering for D&D 5e rewards
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer, markdownUtils } from "./renderer.js";
// ============ Helper Functions ============
const getRewardSubtitle = (reward) => {
    const parts = [];
    if (reward.type) {
        parts.push(toTitleCase(reward.type));
    }
    if (reward.rarity) {
        parts.push(toTitleCase(reward.rarity));
    }
    return parts.join(", ");
};
const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};
const getRewardRenderableEntriesMeta = (reward) => {
    const ptSubtitle = getRewardSubtitle(reward);
    return {
        entriesContent: [
            ptSubtitle ? `{@i ${ptSubtitle}}` : "",
            ...(reward.entries ?? []),
        ].filter(Boolean),
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
// ============ Reward Markdown Renderer ============
export class RewardMarkdownRenderer {
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
    getCompactRenderedString(reward, opts = {}) {
        const meta = opts.meta ?? createRenderMeta();
        const entriesMeta = getRewardRenderableEntriesMeta(reward);
        const entries = [
            { entries: entriesMeta.entriesContent },
        ].filter(Boolean);
        const entFull = {
            ...reward,
            entries,
        };
        return markdownUtils.withMetaDepth(1, { meta }, () => {
            return getGenericCompactRenderedString(entFull, this._renderer, meta);
        });
    }
}
// ============ Module Export ============
let _rewardRenderer = null;
export const getRewardMarkdownRenderer = (styleHint = "classic") => {
    if (!_rewardRenderer) {
        _rewardRenderer = new RewardMarkdownRenderer(undefined, styleHint);
    }
    else {
        _rewardRenderer.setStyleHint(styleHint);
    }
    return _rewardRenderer;
};
export const rewardMarkdown = {
    getCompactRenderedString: (reward, opts = {}) => {
        return getRewardMarkdownRenderer(opts.styleHint).getCompactRenderedString(reward, opts);
    },
    getRewardRenderableEntriesMeta,
    getRewardSubtitle,
};
//# sourceMappingURL=reward.js.map