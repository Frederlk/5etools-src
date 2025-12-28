// Facility Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.facility
// Provides facility-specific markdown rendering for D&D 5e bastion facilities

import type { Entry } from "../../../types/entry.js";
import type {
	FacilityBase,
	FacilitySpace,
	FacilityType,
	FacilityOrder,
	Hireling,
} from "../../../types/bastions.js";
import type { Prerequisite } from "../../../types/util.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer, markdownUtils } from "./renderer.js";

// ============ Types ============

interface FacilityPrerequisite extends Prerequisite {
	facility?: (string | { name: string })[];
}

export interface FacilityEntry extends FacilityBase {
	_displayName?: string;
}

export interface FacilityMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

export interface FacilityRenderableEntriesMeta {
	entryLevel: string | null;
	entriesDescription: Entry[];
	entrySpace: string | null;
	entryHirelings: string | null;
	entryOrders: string | null;
}

// ============ Space Cost/Time Mappings ============

interface SpaceCostTimeInfo {
	cost: number;
	time: number;
}

const SPACE_COST_TIME: Record<FacilitySpace, SpaceCostTimeInfo> = {
	cramped: { cost: 500, time: 20 },
	roomy: { cost: 1000, time: 45 },
	vast: { cost: 3000, time: 125 },
};

const SPACE_PREVIOUS: Record<FacilitySpace, FacilitySpace | null> = {
	cramped: null,
	roomy: "cramped",
	vast: "roomy",
};

// ============ Helper Functions ============

const toTitleCase = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const joinConjunct = (arr: string[], joiner: string, lastJoiner: string): string => {
	if (arr.length === 0) return "";
	if (arr.length === 1) return arr[0];
	if (arr.length === 2) return `${arr[0]}${lastJoiner}${arr[1]}`;
	return arr.slice(0, -1).join(joiner) + lastJoiner + arr[arr.length - 1];
};

const getSpaceEntry = (
	space: FacilitySpace,
	opts: { isIncludeCostTime?: boolean } = {},
): string => {
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

const getFacilitySpaceText = (ent: FacilityEntry): string | null => {
	if (!ent.space) return null;
	const spaceEntries = ent.space.map(spc =>
		getSpaceEntry(spc, { isIncludeCostTime: ent.facilityType === "basic" }),
	);
	return joinConjunct(spaceEntries, ", ", " or ");
};

const getFacilityHirelingsText = (ent: FacilityEntry): string | null => {
	if (!ent.hirelings) return null;

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
		.filter((p): p is string => p != null);

	if (!parts.length) return null;
	return joinConjunct(parts, ", ", " or ");
};

const getFacilityOrdersText = (ent: FacilityEntry): string | null => {
	if (!ent.orders) return null;
	const ordersParts = ent.orders.map(it => toTitleCase(it));
	return joinConjunct(ordersParts, ", ", " or ");
};

const getRenderedPrerequisite = (ent: FacilityEntry): string | null => {
	if (!ent.prerequisite?.length) return null;

	const parts: string[] = [];

	for (const prereq of ent.prerequisite as FacilityPrerequisite[]) {
		const prereqParts: string[] = [];

		if (prereq.level) {
			if (typeof prereq.level === "number") {
				prereqParts.push(`Level ${prereq.level}`);
			} else if (typeof prereq.level === "object" && prereq.level.level) {
				prereqParts.push(`Level ${prereq.level.level}`);
			}
		}

		if (prereq.other) {
			prereqParts.push(prereq.other);
		}

		if (prereq.facility) {
			const facilityNames = prereq.facility
				.map(f => typeof f === "string" ? f : f.name || "")
				.filter(Boolean);
			if (facilityNames.length) {
				prereqParts.push(facilityNames.join(" or "));
			}
		}

		if (prereqParts.length) {
			parts.push(prereqParts.join(", "));
		}
	}

	return parts.length ? parts.join("; ") : null;
};

export const getFacilityRenderableEntriesMeta = (ent: FacilityEntry): FacilityRenderableEntriesMeta => {
	const entsList: Entry[] = [];

	if (ent.prerequisite) {
		const prereqText = getRenderedPrerequisite(ent);
		if (prereqText) {
			entsList.push({
				type: "item",
				name: "Prerequisite:",
				entry: prereqText,
			} as Entry);
		}
	} else if (ent.facilityType !== "basic") {
		entsList.push({
			type: "item",
			name: "Prerequisite:",
			entry: "None",
		} as Entry);
	}

	const entrySpace = getFacilitySpaceText(ent);
	if (entrySpace) {
		entsList.push({
			type: "item",
			name: "Space:",
			entry: entrySpace,
		} as Entry);
	}

	const entryHirelings = getFacilityHirelingsText(ent);
	if (entryHirelings) {
		entsList.push({
			type: "item",
			name: "Hirelings:",
			entry: entryHirelings,
		} as Entry);
	}

	const entryOrders = getFacilityOrdersText(ent);
	if (entryOrders) {
		const orderLabel = ent.orders && ent.orders.length !== 1 ? "Orders:" : "Order:";
		entsList.push({
			type: "item",
			name: orderLabel,
			entry: entryOrders,
		} as Entry);
	}

	const entriesDescription: Entry[] = [];

	if (entsList.length) {
		entriesDescription.push({
			type: "list",
			style: "list-hang-notitle",
			items: entsList,
		} as Entry);
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
	private _renderer: MarkdownRenderer;
	private _styleHint: StyleHint;

	constructor(renderer?: MarkdownRenderer, styleHint: StyleHint = "classic") {
		this._renderer = renderer ?? getMarkdownRenderer();
		this._styleHint = styleHint;
	}

	setRenderer(renderer: MarkdownRenderer): this {
		this._renderer = renderer;
		return this;
	}

	setStyleHint(styleHint: StyleHint): this {
		this._styleHint = styleHint;
		return this;
	}

	getCompactRenderedString(ent: FacilityEntry, opts: FacilityMarkdownOptions = {}): string {
		const entriesMeta = getFacilityRenderableEntriesMeta(ent);

		const parts: string[] = [
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

let _facilityRenderer: FacilityMarkdownRenderer | null = null;

export const getFacilityMarkdownRenderer = (styleHint: StyleHint = "classic"): FacilityMarkdownRenderer => {
	if (!_facilityRenderer) {
		_facilityRenderer = new FacilityMarkdownRenderer(undefined, styleHint);
	} else {
		_facilityRenderer.setStyleHint(styleHint);
	}
	return _facilityRenderer;
};

export const facilityMarkdown = {
	getCompactRenderedString: (ent: FacilityEntry, opts: FacilityMarkdownOptions = {}): string => {
		return getFacilityMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
	},

	getFacilityRenderableEntriesMeta: (ent: FacilityEntry): FacilityRenderableEntriesMeta => {
		return getFacilityRenderableEntriesMeta(ent);
	},

	getSpaceEntry: (space: FacilitySpace, opts?: { isIncludeCostTime?: boolean }): string => {
		return getSpaceEntry(space, opts);
	},

	getSpaceText: (ent: FacilityEntry): string | null => {
		return getFacilitySpaceText(ent);
	},

	getHirelingsText: (ent: FacilityEntry): string | null => {
		return getFacilityHirelingsText(ent);
	},

	getOrdersText: (ent: FacilityEntry): string | null => {
		return getFacilityOrdersText(ent);
	},
};
