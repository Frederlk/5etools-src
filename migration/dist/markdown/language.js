// Language Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.language
// Provides language-specific markdown rendering for D&D 5e languages
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer } from "./renderer.js";
import { uppercaseFirst } from "../util/str-util.js";
// ============ Helper Functions ============
const getLanguageRenderableEntriesMeta = (lang) => {
    return {
        entryType: lang.type ? `**Type:** ${uppercaseFirst(lang.type)}` : null,
        entryTypicalSpeakers: lang.typicalSpeakers?.length
            ? `**Typical Speakers:** ${lang.typicalSpeakers.join(", ")}`
            : null,
        entryScript: lang.script ? `**Script:** ${lang.script}` : null,
        entriesContent: lang.entries ?? null,
    };
};
// ============ Language Markdown Renderer ============
export class LanguageMarkdownRenderer {
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
    getCompactRenderedString(lang, opts = {}) {
        const meta = opts.meta ?? createRenderMeta();
        const subStack = createTextStack();
        const entriesMeta = getLanguageRenderableEntriesMeta(lang);
        const entries = [
            entriesMeta.entryType,
            entriesMeta.entryTypicalSpeakers,
            entriesMeta.entryScript,
            entriesMeta.entriesContent ? { entries: entriesMeta.entriesContent } : null,
        ].filter((e) => e != null);
        const displayName = lang._displayName ?? lang.name;
        subStack[0] += `#### ${displayName}`;
        subStack[0] += "\n\n";
        if (entries.length) {
            const cacheDepth = meta.depth;
            meta.depth = 1;
            for (const entry of entries) {
                this._renderer.recursiveRender(entry, subStack, meta, { suffix: "\n\n" });
            }
            meta.depth = cacheDepth;
        }
        const langRender = subStack.join("").trim();
        return `\n${langRender}\n\n`;
    }
}
// ============ Module Export ============
let _languageRenderer = null;
export const getLanguageMarkdownRenderer = (styleHint = "classic") => {
    if (!_languageRenderer) {
        _languageRenderer = new LanguageMarkdownRenderer(undefined, styleHint);
    }
    else {
        _languageRenderer.setStyleHint(styleHint);
    }
    return _languageRenderer;
};
export const languageMarkdown = {
    getCompactRenderedString: (lang, opts = {}) => {
        return getLanguageMarkdownRenderer(opts.styleHint).getCompactRenderedString(lang, opts);
    },
    getLanguageRenderableEntriesMeta,
};
//# sourceMappingURL=language.js.map