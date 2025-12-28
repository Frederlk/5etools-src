// Facility Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.facility
// Provides facility-specific markdown rendering for D&D 5e bastion facilities
import { getMarkdownRenderer, markdownUtils } from "./renderer.js";
const SPACE_COST_TIME = {
    cramped: { cost: 500, time: 20 },
    roomy: { cost: 1000, time: 45 },
    vast: { cost: 3000, time: 125 },
};
const SPACE_PREVIOUS = {
    cramped: null,
    roomy: "cramped",
    vast: "roomy",
};
// ============ Helper Functions ============
const toTitleCase = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
const joinConjunct = (arr, joiner, lastJoiner) => {
    if (arr.length === 0)
        return "";
    if (arr.length === 1)
        return arr[0];
    if (arr.length === 2)
        return `${arr[0]}${lastJoiner}${arr[1]}`;
    return arr.slice(0, -1).join(joiner) + lastJoiner + arr[arr.length - 1];
};
const getSpaceEntry = (space, opts = {}) => {
    const spaceTitleCase = toTitleCase(space);
    const costTimeInfo = SPACE_COST_TIME[space];
    if (!opts.isIncludeCostTime) {
        return spaceTitleCase;
    }
    const { cost, time } = costTimeInfo;
    const ptTipBasic = `${cost} GP; ${time} days`;
    const ptTxt = spaceTitleCase;
    const spcPrev = SPACE_PREVIOUS[space];
    const costTimeInfoPrev = spcPrev ? SPACE_COST_TIME[spcPrev] : null;
    if (!spcPrev || !costTimeInfoPrev) {
        return ptTxt;
    }
    const { cost: costPrev, time: timePrev } = costTimeInfoPrev;
    const expandCost = cost - costPrev;
    const expandTime = time - timePrev;
    return `${ptTxt} (${ptTipBasic}, or ${expandCost} GP and ${expandTime} days to expand from ${toTitleCase(spcPrev)})`;
};
const getFacilitySpaceText = (ent) => {
    if (!ent.space)
        return null;
    const spaceEntries = ent.space.map(spc => getSpaceEntry(spc, { isIncludeCostTime: ent.facilityType === "basic" }));
    return joinConjunct(spaceEntries, ", ", " or ");
};
const getFacilityHirelingsText = (ent) => {
    if (!ent.hirelings)
        return null;
    const parts = ent.hirelings
        .map(hire => {
        const ptSpace = hire.space ? ` (${toTitleCase(hire.space)})` : "";
        if ("exact" in hire && hire.exact != null) {
            return `${hire.exact}${ptSpace}`;
        }
        if ("min" in hire) {
            if (hire.min != null && hire.max != null) {
                return `${hire.min}\u2013${hire.max}${ptSpace}`;
            }
            if (hire.min != null) {
                return `${hire.min}+ (see below${ptSpace ? `; ${ptSpace.trim()}` : ""})`;
            }
        }
        return null;
    })
        .filter((p) => p != null);
    if (!parts.length)
        return null;
    return joinConjunct(parts, ", ", " or ");
};
const getFacilityOrdersText = (ent) => {
    if (!ent.orders)
        return null;
    const ordersParts = ent.orders.map(it => toTitleCase(it));
    return joinConjunct(ordersParts, ", ", " or ");
};
const getRenderedPrerequisite = (ent) => {
    if (!ent.prerequisite?.length)
        return null;
    const parts = [];
    for (const prereq of ent.prerequisite) {
        const prereqParts = [];
        if (prereq.level) {
            if (typeof prereq.level === "number") {
                prereqParts.push(`Level ${prereq.level}`);
            }
            else if (typeof prereq.level === "object" && prereq.level.level) {
                prereqParts.push(`Level ${prereq.level.level}`);
            }
        }
        if (prereq.other) {
            prereqParts.push(prereq.other);
        }
        if (prereq.facility) {
            const facilities = prereq.facility;
            if (Array.isArray(facilities)) {
                const facilityNames = facilities.map((f) => typeof f === "string" ? f : f.name || "").filter(Boolean);
                if (facilityNames.length) {
                    prereqParts.push(facilityNames.join(" or "));
                }
            }
        }
        if (prereqParts.length) {
            parts.push(prereqParts.join(", "));
        }
    }
    return parts.length ? parts.join("; ") : null;
};
export const getFacilityRenderableEntriesMeta = (ent) => {
    const entsList = [];
    if (ent.prerequisite) {
        const prereqText = getRenderedPrerequisite(ent);
        if (prereqText) {
            entsList.push({
                type: "item",
                name: "Prerequisite:",
                entry: prereqText,
            });
        }
    }
    else if (ent.facilityType !== "basic") {
        entsList.push({
            type: "item",
            name: "Prerequisite:",
            entry: "None",
        });
    }
    const entrySpace = getFacilitySpaceText(ent);
    if (entrySpace) {
        entsList.push({
            type: "item",
            name: "Space:",
            entry: entrySpace,
        });
    }
    const entryHirelings = getFacilityHirelingsText(ent);
    if (entryHirelings) {
        entsList.push({
            type: "item",
            name: "Hirelings:",
            entry: entryHirelings,
        });
    }
    const entryOrders = getFacilityOrdersText(ent);
    if (entryOrders) {
        const orderLabel = ent.orders && ent.orders.length !== 1 ? "Orders:" : "Order:";
        entsList.push({
            type: "item",
            name: orderLabel,
            entry: entryOrders,
        });
    }
    const entriesDescription = [];
    if (entsList.length) {
        entriesDescription.push({
            type: "list",
            style: "list-hang-notitle",
            items: entsList,
        });
    }
    if (ent.entries?.length) {
        entriesDescription.push(...ent.entries);
    }
    return {
        entryLevel: ent.level ? `*Level ${ent.level} Bastion Facility*` : null,
        entriesDescription,
        entrySpace,
        entryHirelings,
        entryOrders,
    };
};
// ============ Facility Markdown Renderer ============
export class FacilityMarkdownRenderer {
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
        const entriesMeta = getFacilityRenderableEntriesMeta(ent);
        const parts = [
            `## ${ent._displayName ?? ent.name}`,
        ];
        if (entriesMeta.entryLevel) {
            parts.push(this._renderer.render(entriesMeta.entryLevel));
        }
        for (const entry of entriesMeta.entriesDescription) {
            parts.push(this._renderer.render(entry));
        }
        const out = parts
            .filter(Boolean)
            .join("\n\n");
        return markdownUtils.getNormalizedNewlines(out);
    }
}
// ============ Module Export ============
let _facilityRenderer = null;
export const getFacilityMarkdownRenderer = (styleHint = "classic") => {
    if (!_facilityRenderer) {
        _facilityRenderer = new FacilityMarkdownRenderer(undefined, styleHint);
    }
    else {
        _facilityRenderer.setStyleHint(styleHint);
    }
    return _facilityRenderer;
};
export const facilityMarkdown = {
    getCompactRenderedString: (ent, opts = {}) => {
        return getFacilityMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
    },
    getFacilityRenderableEntriesMeta: (ent) => {
        return getFacilityRenderableEntriesMeta(ent);
    },
    getSpaceEntry: (space, opts) => {
        return getSpaceEntry(space, opts);
    },
    getSpaceText: (ent) => {
        return getFacilitySpaceText(ent);
    },
    getHirelingsText: (ent) => {
        return getFacilityHirelingsText(ent);
    },
    getOrdersText: (ent) => {
        return getFacilityOrdersText(ent);
    },
};
//# sourceMappingURL=facility.js.map