// Trap/Hazard Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.trap, .hazard, .traphazard
// Provides trap and hazard specific markdown rendering for D&D 5e
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer } from "./renderer.js";
// ============ Constants ============
const TRAP_TYPES_CLASSIC = ["MECH", "MAG", "TRP", "HAUNT"];
// ============ Type Guards ============
const isTrapSimple = (ent) => {
    return "trapHazType" in ent && TRAP_TYPES_CLASSIC.includes(ent.trapHazType);
};
const isTrapComplex = (ent) => {
    return "trapHazType" in ent &&
        (ent.trapHazType === "SMPL" || ent.trapHazType === "CMPX");
};
const isHazard = (ent) => {
    return !("trapHazType" in ent) ||
        ent.trapHazType === undefined ||
        ["ENV", "EST", "GEN", "WTH", "WLD"].includes(ent.trapHazType);
};
// ============ Parser Functions ============
const trapHazTypeToFull = (type) => {
    const trapTypes = {
        MECH: "Mechanical Trap",
        MAG: "Magical Trap",
        TRP: "Trap",
        HAUNT: "Haunt",
        SMPL: "Simple Trap",
        CMPX: "Complex Trap",
        ENV: "Environmental Hazard",
        EST: "Eldritch Storm",
        GEN: "Generic",
        WTH: "Weather",
        WLD: "Wilderness Hazard",
        HAZ: "Hazard",
    };
    return trapTypes[type] ?? type;
};
const trapInitToFull = (init) => {
    if (init == null)
        return "";
    const initMap = {
        1: "initiative count 10",
        2: "initiative count 20",
        3: "initiative count 20 and initiative count 10",
    };
    return initMap[init] ?? `initiative count ${init}`;
};
const threatToFull = (threat) => {
    const threatMap = {
        nuisance: "Nuisance",
        setback: "Setback",
        moderate: "Moderate",
        dangerous: "Dangerous",
        deadly: "Deadly",
    };
    return threatMap[threat] ?? threat;
};
const getRenderableDurationEntriesMeta = (duration, opts = {}) => {
    if (!duration?.length)
        return { entryDuration: "" };
    const parts = duration.map(d => {
        switch (d.type) {
            case "instant":
                return "Instantaneous";
            case "permanent":
                return "Until dispelled";
            case "special":
                return "Special";
            case "timed": {
                if (!d.duration)
                    return "";
                const { amount = 1, type, upTo } = d.duration;
                const unitLabel = amount === 1 ? type : `${type}s`;
                const prefix = upTo ? "Up to " : "";
                return `${prefix}${amount} ${unitLabel}`;
            }
            default:
                return "";
        }
    });
    return { entryDuration: parts.filter(Boolean).join(", ") };
};
// ============ Subtitle Generation ============
const getTraphazardSubtitle = (ent, opts = {}) => {
    const type = ent.trapHazType ?? "HAZ";
    if (type === "GEN")
        return null;
    const styleHint = opts.styleHint ?? "classic";
    const ptType = trapHazTypeToFull(type);
    const rating = ent.rating;
    if (!rating?.length)
        return ptType;
    const ratingParts = rating.map((ratingItem) => {
        const ptThreat = threatToFull(ratingItem.threat);
        if ("tier" in ratingItem && ratingItem.tier != null) {
            return getRatingPartTier(ratingItem.tier, ptThreat, styleHint);
        }
        if ("level" in ratingItem && ratingItem.level != null) {
            return getRatingPartLevel(ratingItem.level, ptThreat, styleHint);
        }
        return ptThreat;
    });
    const ptRating = ratingParts.join(", ");
    return `${ptType} (${ptRating})`;
};
const getRatingPartTier = (tier, ptThreat, styleHint) => {
    const tierLabel = styleHint === "classic" ? "tier" : "Tier";
    return `${tierLabel} ${tier}, ${ptThreat.toLowerCase()} threat`;
};
const getRatingPartLevel = (level, ptThreat, styleHint) => {
    const levelLabel = styleHint === "classic" ? "level" : "Levels";
    const min = level.min ?? 0;
    const max = level.max ?? min;
    const levelRange = min !== max ? `${min}\u2013${max}` : `${min}`;
    return `${levelLabel} ${levelRange}`;
};
// ============ Trap Entries Meta ============
const getTrapRenderableEntriesMeta = (ent, opts = {}) => {
    const styleHint = opts.styleHint ?? "classic";
    if (isTrapSimple(ent)) {
        return getTrapRenderableEntriesMeta_classic(ent, styleHint);
    }
    if (isTrapComplex(ent)) {
        return getTrapRenderableEntriesMeta_modern(ent, styleHint);
    }
    return {};
};
const getTrapRenderableEntriesMeta_classic = (ent, styleHint) => {
    const listItems = [];
    if (ent.trigger) {
        listItems.push({
            type: "item",
            name: "Trigger:",
            entries: ent.trigger,
        });
    }
    if (ent.duration) {
        const durationMeta = getRenderableDurationEntriesMeta(ent.duration, { styleHint });
        if (durationMeta.entryDuration) {
            listItems.push({
                type: "item",
                name: "Duration:",
                entries: [durationMeta.entryDuration],
            });
        }
    }
    if (ent.hauntBonus) {
        listItems.push({
            type: "item",
            name: "Haunt Bonus:",
            entry: ent.hauntBonus,
        });
        if (!isNaN(Number(ent.hauntBonus))) {
            listItems.push({
                type: "item",
                name: "Detection:",
                entry: `passive Wisdom ({@skill Perception}) score equals or exceeds ${10 + Number(ent.hauntBonus)}`,
            });
        }
    }
    if (!listItems.length)
        return {};
    return {
        entriesHeader: [
            {
                type: "list",
                style: "list-hang-notitle",
                items: listItems,
            },
        ],
    };
};
const getTrapRenderableEntriesMeta_modern = (ent, styleHint) => {
    const entriesAttributes = [];
    if (ent.trigger) {
        entriesAttributes.push({
            type: "entries",
            name: "Trigger",
            entries: ent.trigger,
        });
    }
    if (ent.effect) {
        entriesAttributes.push({
            type: "entries",
            name: "Effect",
            entries: ent.effect,
        });
    }
    if (ent.initiative) {
        entriesAttributes.push({
            type: "entries",
            name: "Initiative",
            entries: getTrapInitiativeEntries(ent),
        });
    }
    if (ent.eActive) {
        entriesAttributes.push({
            type: "entries",
            name: "Active Elements",
            entries: ent.eActive,
        });
    }
    if (ent.eDynamic) {
        entriesAttributes.push({
            type: "entries",
            name: "Dynamic Elements",
            entries: ent.eDynamic,
        });
    }
    if (ent.eConstant) {
        entriesAttributes.push({
            type: "entries",
            name: "Constant Elements",
            entries: ent.eConstant,
        });
    }
    if (ent.countermeasures) {
        entriesAttributes.push({
            type: "entries",
            name: "Countermeasures",
            entries: ent.countermeasures,
        });
    }
    return { entriesAttributes };
};
const getTrapInitiativeEntries = (ent) => {
    const initText = trapInitToFull(ent.initiative);
    const noteText = ent.initiativeNote ? ` (${ent.initiativeNote})` : "";
    return [`The trap acts on ${initText}${noteText}.`];
};
// ============ TrapHazard Markdown Renderer ============
export class TrapHazardMarkdownRenderer {
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
        const meta = opts.meta ?? createRenderMeta();
        const styleHint = opts.styleHint ?? this._styleHint;
        const depthCached = meta.depth;
        meta.depth = 2;
        const result = this._renderTrapHazard(ent, meta, styleHint);
        meta.depth = depthCached;
        return result;
    }
    _renderTrapHazard(ent, meta, styleHint) {
        const subtitle = getTraphazardSubtitle(ent, { styleHint });
        const entriesMetaTrap = getTrapRenderableEntriesMeta(ent, { styleHint });
        const entries = [
            subtitle ? `{@i ${subtitle}}` : null,
            ...(entriesMetaTrap.entriesHeader ?? []),
            { type: "entries", entries: ent.entries },
            ...(entriesMetaTrap.entriesAttributes ?? []),
        ];
        const filteredEntries = entries.filter((e) => e != null);
        const displayName = ent._displayName ?? ent.name;
        return this._renderGenericCompact(displayName, filteredEntries, meta);
    }
    _renderGenericCompact(name, entries, meta) {
        const subStack = createTextStack();
        subStack[0] += `## ${name}\n\n`;
        if (entries?.length) {
            for (const entry of entries) {
                this._renderer.recursiveRender(entry, subStack, meta, { suffix: "\n\n" });
            }
        }
        const trapRender = subStack.join("").trim();
        const normalizedRender = trapRender.replace(/\n\n+/g, "\n\n");
        return `\n${normalizedRender}\n\n`;
    }
}
// ============ Trap Markdown Renderer ============
export class TrapMarkdownRenderer {
    _traphazardRenderer;
    constructor(renderer, styleHint = "classic") {
        this._traphazardRenderer = new TrapHazardMarkdownRenderer(renderer, styleHint);
    }
    setRenderer(renderer) {
        this._traphazardRenderer.setRenderer(renderer);
        return this;
    }
    setStyleHint(styleHint) {
        this._traphazardRenderer.setStyleHint(styleHint);
        return this;
    }
    getCompactRenderedString(ent, opts = {}) {
        return this._traphazardRenderer.getCompactRenderedString(ent, opts);
    }
}
// ============ Hazard Markdown Renderer ============
export class HazardMarkdownRenderer {
    _traphazardRenderer;
    constructor(renderer, styleHint = "classic") {
        this._traphazardRenderer = new TrapHazardMarkdownRenderer(renderer, styleHint);
    }
    setRenderer(renderer) {
        this._traphazardRenderer.setRenderer(renderer);
        return this;
    }
    setStyleHint(styleHint) {
        this._traphazardRenderer.setStyleHint(styleHint);
        return this;
    }
    getCompactRenderedString(ent, opts = {}) {
        return this._traphazardRenderer.getCompactRenderedString(ent, opts);
    }
}
// ============ Module Export ============
let _trapRenderer = null;
let _hazardRenderer = null;
let _traphazardRenderer = null;
export const getTrapMarkdownRenderer = (styleHint = "classic") => {
    if (!_trapRenderer) {
        _trapRenderer = new TrapMarkdownRenderer(undefined, styleHint);
    }
    else {
        _trapRenderer.setStyleHint(styleHint);
    }
    return _trapRenderer;
};
export const getHazardMarkdownRenderer = (styleHint = "classic") => {
    if (!_hazardRenderer) {
        _hazardRenderer = new HazardMarkdownRenderer(undefined, styleHint);
    }
    else {
        _hazardRenderer.setStyleHint(styleHint);
    }
    return _hazardRenderer;
};
export const getTrapHazardMarkdownRenderer = (styleHint = "classic") => {
    if (!_traphazardRenderer) {
        _traphazardRenderer = new TrapHazardMarkdownRenderer(undefined, styleHint);
    }
    else {
        _traphazardRenderer.setStyleHint(styleHint);
    }
    return _traphazardRenderer;
};
// ============ Convenience Exports ============
export const trapMarkdown = {
    getCompactRenderedString: (ent, opts = {}) => {
        return getTrapMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
    },
};
export const hazardMarkdown = {
    getCompactRenderedString: (ent, opts = {}) => {
        return getHazardMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
    },
};
export const traphazardMarkdown = {
    getCompactRenderedString: (ent, opts = {}) => {
        return getTrapHazardMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
    },
    getSubtitle: getTraphazardSubtitle,
    getTrapRenderableEntriesMeta,
    getTrapInitiativeEntries,
    getRenderableDurationEntriesMeta,
};
//# sourceMappingURL=trap.js.map