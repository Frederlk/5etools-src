// Deity Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.deity
// Provides deity-specific markdown rendering for D&D 5e deities
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer } from "./renderer.js";
import { toTitleCase } from "../util/str-util.js";
import { alignmentAbvToFull } from "../parser/monster.js";
// ============ Helper Functions ============
const getAlignmentText = (alignments) => {
    const joined = alignments
        .map(a => alignmentAbvToFull(a))
        .filter(Boolean)
        .join(" ");
    return toTitleCase(joined);
};
const BASE_PART_TRANSLATORS = {
    alignment: {
        name: "Alignment",
        displayFn: (it) => getAlignmentText(it),
    },
    pantheon: {
        name: "Pantheon",
    },
    category: {
        name: "Category",
        displayFn: (it) => typeof it === "string" ? it : it.join(", "),
    },
    domains: {
        name: "Domains",
        displayFn: (it) => it.join(", "),
    },
    province: {
        name: "Province",
    },
    dogma: {
        name: "Dogma",
    },
    altNames: {
        name: "Alternate Names",
        displayFn: (it) => it.join(", "),
    },
    plane: {
        name: "Home Plane",
    },
    worshipers: {
        name: "Typical Worshipers",
    },
    symbol: {
        name: "Symbol",
    },
};
const getDeityRenderableEntriesMeta = (deity) => {
    const entriesAttributes = [];
    for (const [prop, { name, displayFn }] of Object.entries(BASE_PART_TRANSLATORS)) {
        const value = deity[prop];
        if (value == null)
            continue;
        const displayVal = displayFn ? displayFn(value) : String(value);
        entriesAttributes.push({
            name,
            entry: `**${name}:** ${displayVal}`,
        });
    }
    if (deity.customProperties) {
        for (const [name, val] of Object.entries(deity.customProperties)) {
            entriesAttributes.push({
                name,
                entry: `**${name}:** ${val}`,
            });
        }
    }
    entriesAttributes.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    return {
        entriesAttributes: entriesAttributes.map(({ entry }) => entry),
    };
};
// ============ Deity Markdown Renderer ============
export class DeityMarkdownRenderer {
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
    getCompactRenderedString(deity, opts = {}) {
        const meta = opts.meta ?? createRenderMeta();
        const subStack = createTextStack();
        const entriesMeta = getDeityRenderableEntriesMeta(deity);
        const entries = [
            ...entriesMeta.entriesAttributes,
            deity.entries ? { entries: deity.entries } : null,
        ].filter((e) => e != null);
        const displayName = deity.title
            ? `${deity._displayName ?? deity.name}, ${toTitleCase(deity.title)}`
            : (deity._displayName ?? deity.name);
        return this._renderGenericCompact(displayName, entries, subStack, meta);
    }
    _renderGenericCompact(name, entries, subStack, meta) {
        subStack[0] += `#### ${name}`;
        subStack[0] += "\n\n";
        if (entries?.length) {
            const cacheDepth = meta.depth;
            meta.depth = 1;
            for (const entry of entries) {
                this._renderer.recursiveRender(entry, subStack, meta, { suffix: "\n\n" });
            }
            meta.depth = cacheDepth;
        }
        const deityRender = subStack.join("").trim();
        return `\n${deityRender}\n\n`;
    }
}
// ============ Module Export ============
let _deityRenderer = null;
export const getDeityMarkdownRenderer = (styleHint = "classic") => {
    if (!_deityRenderer) {
        _deityRenderer = new DeityMarkdownRenderer(undefined, styleHint);
    }
    else {
        _deityRenderer.setStyleHint(styleHint);
    }
    return _deityRenderer;
};
export const deityMarkdown = {
    getCompactRenderedString: (deity, opts = {}) => {
        return getDeityMarkdownRenderer(opts.styleHint).getCompactRenderedString(deity, opts);
    },
    getDeityRenderableEntriesMeta,
};
//# sourceMappingURL=deity.js.map