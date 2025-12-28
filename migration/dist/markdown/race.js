// Race Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.race
// Provides race-specific markdown rendering for D&D 5e races
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { getMarkdownRenderer, markdownUtils } from "./renderer.js";
// ============ Helper Functions ============
const getRenderedHeight = (height) => {
    const heightFeet = Number(Math.floor(height / 12).toFixed(3));
    const heightInches = Number((height % 12).toFixed(3));
    return `${heightFeet ? `${heightFeet}'` : ""}${heightInches ? `${heightInches}"` : ""}`;
};
const getHeightAndWeightEntries = (race) => {
    if (!race.heightAndWeight)
        return [];
    const hw = race.heightAndWeight;
    const colLabels = ["Base Height", "Base Weight", "Height Modifier", "Weight Modifier"];
    const colStyles = ["col-2-3 text-center", "col-2-3 text-center", "col-2-3 text-center", "col-2 text-center"];
    const cellHeightMod = `+${hw.heightMod}`;
    const cellWeightMod = `× ${hw.weightMod || "1"} lb.`;
    const row = [
        getRenderedHeight(hw.baseHeight),
        `${hw.baseWeight} lb.`,
        cellHeightMod,
        cellWeightMod,
    ];
    const tableEntry = {
        type: "table",
        caption: "Random Height and Weight",
        colLabels,
        colStyles,
        rows: [row],
    };
    return [
        "You may roll for your character's height and weight on the Random Height and Weight table. The roll in the Height Modifier column adds a number (in inches) to the character's base height. To get a weight, multiply the number you rolled for height by the roll in the Weight Modifier column and add the result (in pounds) to the base weight.",
        tableEntry,
    ];
};
// ============ Race Markdown Renderer ============
export class RaceMarkdownRenderer {
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
    getCompactRenderedString(race, opts = {}) {
        const meta = opts.meta ?? createRenderMeta();
        const styleHint = opts.styleHint ?? this._styleHint;
        // NOTE: In the full implementation, this would call:
        // Renderer.race.getRaceRenderableEntriesMeta(race, { styleHint })
        // which returns { entryAttributes, entryMain } containing formatted
        // ability scores, creature type, size, speed, and main race entries.
        // For now, we construct entries directly from the race data.
        const entries = [];
        // Build entries from race data
        // The HTML renderer builds entryAttributes (a list of ability, size, speed, etc.)
        // and entryMain (the main race entries or subrace entries for base races)
        if (race.entries?.length) {
            entries.push(...race.entries);
        }
        const entFull = {
            ...race,
            entries,
        };
        // Render height and weight section
        const ptHeightAndWeight = this._getHeightAndWeightPart(race);
        // Use withMetaDepth pattern: set meta.depth to 1 for rendering
        const renderedMain = markdownUtils.withMetaDepth(1, { meta }, () => {
            return this._renderGenericCompact(entFull, { meta, styleHint });
        });
        return [
            renderedMain,
            ptHeightAndWeight ? `---\n\n${ptHeightAndWeight}` : null,
        ]
            .filter(Boolean)
            .join("");
    }
    _getHeightAndWeightPart(race) {
        if (!race.heightAndWeight)
            return null;
        if (race._isBaseRace)
            return null;
        const heightWeightEntries = getHeightAndWeightEntries(race);
        if (!heightWeightEntries.length)
            return null;
        return this._renderer.render({ entries: heightWeightEntries });
    }
    _renderGenericCompact(ent, opts) {
        const meta = opts.meta ?? createRenderMeta();
        const subStack = createTextStack();
        // Race header
        const displayName = ent._displayName ?? ent.name;
        subStack[0] += `## ${displayName}\n\n`;
        // Render race entries
        if (ent.entries?.length) {
            for (const entry of ent.entries) {
                this._renderer.recursiveRender(entry, subStack, meta, { suffix: "\n" });
                subStack[0] += "\n";
            }
        }
        return `\n${markdownUtils.getNormalizedNewlines(subStack.join("").trim())}\n\n`;
    }
}
// ============ Module Export ============
let _raceRenderer = null;
export const getRaceMarkdownRenderer = (styleHint = "classic") => {
    if (!_raceRenderer) {
        _raceRenderer = new RaceMarkdownRenderer(undefined, styleHint);
    }
    else {
        _raceRenderer.setStyleHint(styleHint);
    }
    return _raceRenderer;
};
export const raceMarkdown = {
    getCompactRenderedString: (race, opts = {}) => {
        return getRaceMarkdownRenderer(opts.styleHint).getCompactRenderedString(race, opts);
    },
    getHeightAndWeightEntries: (race) => {
        return getHeightAndWeightEntries(race);
    },
    getRenderedHeight: (height) => {
        return getRenderedHeight(height);
    },
};
//# sourceMappingURL=race.js.map