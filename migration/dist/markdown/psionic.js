// Psionic Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.psionic
// Provides psionic-specific markdown rendering for D&D 5e psionics
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer, markdownUtils } from "./renderer.js";
// ============ Helper Functions ============
const getTypeString = (type) => {
    return type === "D" ? "Discipline" : "Talent";
};
const getTypeOrderString = (psi) => {
    const type = getTypeString(psi.type);
    if (psi.order) {
        return `${type} (${psi.order})`;
    }
    return type;
};
const getModeEntry = (mode) => {
    const parts = [mode.name];
    if (mode.cost) {
        parts.push(` (${mode.cost.min}-${mode.cost.max} psi)`);
    }
    if (mode.concentration) {
        const unitMap = {
            hr: "hour",
            min: "minute",
            rnd: "round",
        };
        const unit = unitMap[mode.concentration.unit] ?? mode.concentration.unit;
        const plural = mode.concentration.duration !== 1 ? "s" : "";
        parts.push(`, conc., up to ${mode.concentration.duration} ${unit}${plural}`);
    }
    const modeEntry = {
        type: "entries",
        name: parts.join(""),
        entries: [...mode.entries],
    };
    if (mode.submodes?.length) {
        const submodeEntries = mode.submodes.map((submode) => {
            const costStr = submode.cost
                ? ` (${submode.cost.min}-${submode.cost.max} psi)`
                : "";
            return {
                type: "entries",
                name: `${submode.name}${costStr}`,
                entries: submode.entries,
            };
        });
        modeEntry?.entries?.push(...submodeEntries);
    }
    return modeEntry;
};
const getPsionicRenderableEntriesMeta = (psi) => {
    return {
        entryTypeOrder: `*${getTypeOrderString(psi)}*`,
        entryContent: psi.entries?.length ? { type: "entries", entries: psi.entries } : null,
        entryFocus: psi.focus ? `**Psychic Focus.** ${psi.focus}` : null,
        entriesModes: psi.modes?.map((mode) => getModeEntry(mode)) ?? null,
    };
};
// ============ Psionic Markdown Renderer ============
export class PsionicMarkdownRenderer {
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
    getCompactRenderedString(psi, opts = {}) {
        const entriesMeta = getPsionicRenderableEntriesMeta(psi);
        const entries = [
            entriesMeta.entryTypeOrder,
            entriesMeta.entryContent,
            entriesMeta.entryFocus,
            ...(entriesMeta.entriesModes ?? []),
        ].filter(Boolean);
        const entFull = {
            type: "entries",
            name: psi._displayName ?? psi.name,
            entries,
        };
        return markdownUtils.withMetaDepth(2, opts, () => {
            const subStack = createTextStack();
            const meta = opts.meta ?? createRenderMeta();
            meta.depth = 2;
            this._renderer.recursiveRender(entFull, subStack, meta, { suffix: "\n" });
            const rendered = subStack.join("").trim();
            return `\n${rendered}\n\n`;
        });
    }
}
// ============ Module Export ============
let _psionicRenderer = null;
export const getPsionicMarkdownRenderer = (styleHint = "classic") => {
    if (!_psionicRenderer) {
        _psionicRenderer = new PsionicMarkdownRenderer(undefined, styleHint);
    }
    else {
        _psionicRenderer.setStyleHint(styleHint);
    }
    return _psionicRenderer;
};
export const psionicMarkdown = {
    getCompactRenderedString: (psi, opts = {}) => {
        return getPsionicMarkdownRenderer(opts.styleHint).getCompactRenderedString(psi, opts);
    },
    getTypeOrderString: (psi) => {
        return getTypeOrderString(psi);
    },
    getTypeString: (type) => {
        return getTypeString(type);
    },
};
//# sourceMappingURL=psionic.js.map