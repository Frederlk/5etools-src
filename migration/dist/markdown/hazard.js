// Hazard Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.hazard
// Provides hazard-specific markdown rendering for D&D 5e hazards
// Note: Hazards delegate to traphazard rendering logic
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer, markdownUtils } from "./renderer.js";
// ============ Parser Constants ============
const TRAP_HAZARD_TYPE_TO_FULL = {
    MECH: "Mechanical Trap",
    MAG: "Magical Trap",
    SMPL: "Simple Trap",
    CMPX: "Complex Trap",
    HAZ: "Hazard",
    WTH: "Weather",
    ENV: "Environmental Hazard",
    WLD: "Wilderness Hazard",
    GEN: "Generic",
    TRP: "Trap",
    HAUNT: "Haunt",
};
const TRAP_INIT_TO_FULL = {
    1: "initiative count 10",
    2: "initiative count 20",
    3: "initiative count 20 and initiative count 10",
};
const TRAP_TYPES_CLASSIC = ["MECH", "MAG", "TRP", "HAUNT"];
// ============ Helper Functions ============
const trapHazTypeToFull = (type) => {
    return TRAP_HAZARD_TYPE_TO_FULL[type] ?? type;
};
const trapInitToFull = (init) => {
    return TRAP_INIT_TO_FULL[init] ?? `initiative count ${init}`;
};
const tierToFullLevel = (tier, styleHint) => {
    const tierToLevelRange = {
        1: [1, 4],
        2: [5, 10],
        3: [11, 16],
        4: [17, 20],
    };
    const range = tierToLevelRange[tier];
    if (!range)
        return `Tier ${tier}`;
    if (styleHint === "classic") {
        const getOrdinal = (n) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        return `${getOrdinal(range[0])}\u2013${getOrdinal(range[1])} Level`;
    }
    return `Levels ${range[0]}\u2013${range[1]}`;
};
const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};
const joinConjunct = (arr, joiner, lastJoiner) => {
    if (arr.length === 0)
        return "";
    if (arr.length === 1)
        return arr[0];
    if (arr.length === 2)
        return arr.join(lastJoiner);
    return arr.slice(0, -1).join(joiner) + lastJoiner + arr[arr.length - 1];
};
// ============ TrapHazard Subtitle Generation ============
const getRenderedTrapHazardRatingPart = (rating, styleHint) => {
    if (rating.tier)
        return tierToFullLevel(rating.tier, styleHint);
    if (rating.level?.min == null || rating.level?.max == null)
        return "";
    const ptLevelLabel = styleHint === "classic" ? "level" : "Levels";
    return `${ptLevelLabel} ${rating.level.min}${rating.level.min !== rating.level.max ? `\u2013${rating.level.max}` : ""}`;
};
const getTraphazardSubtitle = (ent, styleHint) => {
    const type = ent.trapHazType || "HAZ";
    if (type === "GEN")
        return null;
    const ptType = trapHazTypeToFull(type);
    if (!ent.rating?.length)
        return ptType;
    const parts = ent.rating.map(rating => {
        const ptThreat = rating.threat ? toTitleCase(rating.threat) : "";
        const ptThreatType = [ptThreat, ptType]
            .filter(Boolean)
            .join(" ");
        const ptLevelTier = getRenderedTrapHazardRatingPart(rating, styleHint);
        return [
            ptThreatType,
            ptLevelTier ? `(${ptLevelTier})` : "",
        ]
            .filter(Boolean)
            .join(" ");
    }).filter(Boolean);
    return joinConjunct(parts, ", ", " or ");
};
// ============ Trap Entries Meta Generation ============
const getTrapInitiativeEntries = (ent) => {
    const initFull = ent.initiative != null ? trapInitToFull(ent.initiative) : "";
    return [`The trap acts on ${initFull}${ent.initiativeNote ? ` (${ent.initiativeNote})` : ""}.`];
};
const getTrapRenderableEntriesMeta = (ent, styleHint) => {
    if (TRAP_TYPES_CLASSIC.includes(ent.trapHazType ?? "")) {
        const listItems = [
            ent.trigger ? {
                type: "item",
                name: "Trigger:",
                entries: ent.trigger,
            } : null,
            ent.duration ? {
                type: "item",
                name: "Duration:",
                entries: [String(ent.duration)],
            } : null,
            ent.hauntBonus ? {
                type: "item",
                name: "Haunt Bonus:",
                entry: String(ent.hauntBonus),
            } : null,
            ent.hauntBonus && !isNaN(Number(ent.hauntBonus)) ? {
                type: "item",
                name: "Detection:",
                entry: `passive Wisdom ({@skill Perception}) score equals or exceeds ${10 + Number(ent.hauntBonus)}`,
            } : null,
        ].filter((x) => x != null);
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
    }
    return {
        entriesAttributes: [
            ent.trigger ? {
                type: "entries",
                name: "Trigger",
                entries: ent.trigger,
            } : null,
            ent.effect ? {
                type: "entries",
                name: "Effect",
                entries: ent.effect,
            } : null,
            ent.initiative != null ? {
                type: "entries",
                name: "Initiative",
                entries: getTrapInitiativeEntries(ent),
            } : null,
            ent.eActive ? {
                type: "entries",
                name: "Active Elements",
                entries: ent.eActive,
            } : null,
            ent.eDynamic ? {
                type: "entries",
                name: "Dynamic Elements",
                entries: ent.eDynamic,
            } : null,
            ent.eConstant ? {
                type: "entries",
                name: "Constant Elements",
                entries: ent.eConstant,
            } : null,
            ent.countermeasures ? {
                type: "entries",
                name: "Countermeasures",
                entries: ent.countermeasures,
            } : null,
        ].filter((x) => x != null),
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
        return markdownUtils.withMetaDepth(2, { meta }, () => {
            const subtitle = getTraphazardSubtitle(ent, styleHint);
            const entriesMetaTrap = getTrapRenderableEntriesMeta(ent, styleHint);
            const entries = [
                subtitle ? `{@i ${subtitle}}` : null,
                ...(entriesMetaTrap.entriesHeader || []),
                { entries: ent.entries },
                ...(entriesMetaTrap.entriesAttributes || []),
            ].filter((x) => x != null);
            const entFull = {
                ...ent,
                entries,
            };
            return getGenericCompactRenderedString(entFull, this._renderer, meta);
        });
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
let _traphazardRenderer = null;
let _hazardRenderer = null;
export const getTraphazardMarkdownRenderer = (styleHint = "classic") => {
    if (!_traphazardRenderer) {
        _traphazardRenderer = new TrapHazardMarkdownRenderer(undefined, styleHint);
    }
    else {
        _traphazardRenderer.setStyleHint(styleHint);
    }
    return _traphazardRenderer;
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
export const traphazardMarkdown = {
    getCompactRenderedString: (ent, opts = {}) => {
        return getTraphazardMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
    },
    getSubtitle: getTraphazardSubtitle,
    getRenderedTrapHazardRatingPart,
    getTrapRenderableEntriesMeta,
    getTrapInitiativeEntries,
};
export const hazardMarkdown = {
    getCompactRenderedString: (ent, opts = {}) => {
        return getHazardMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
    },
};
//# sourceMappingURL=hazard.js.map