// Trap/Hazard Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.trap, .hazard, .traphazard
// Provides trap and hazard specific markdown rendering for D&D 5e

import type { Entry } from "../../../types/entry.js";
import type {
	Trap,
	TrapSimple,
	TrapComplex,
	Hazard,
	TrapHazType,
	HazardType,
	TrapHazardRating,
	TrapHazardThreat,
	TrapLevel,
	TrapHazardTier,
	DurationEffect,
	TrapHazardRatingItem,
} from "../../../types/trapshazards.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer } from "./renderer.js";

// ============ Types ============

export interface TrapEntry extends TrapSimple {
	_displayName?: string;
	__prop?: "trap" | "hazard";
}

export interface TrapComplexEntry extends TrapComplex {
	_displayName?: string;
	__prop?: "trap" | "hazard";
}

export interface HazardEntry extends Hazard {
	_displayName?: string;
	__prop?: "trap" | "hazard";
}

export type TrapHazardEntry = TrapEntry | TrapComplexEntry | HazardEntry;

export interface TrapMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

export interface TrapRenderableEntriesMeta {
	entriesHeader?: Entry[];
	entriesAttributes?: Entry[];
}

// ============ Constants ============

const TRAP_TYPES_CLASSIC: TrapHazType[] = ["MECH", "MAG", "TRP", "HAUNT"];

// ============ Type Guards ============

const isTrapSimple = (ent: TrapHazardEntry): ent is TrapEntry => {
	return "trapHazType" in ent && TRAP_TYPES_CLASSIC.includes(ent.trapHazType as TrapHazType);
};

const isTrapComplex = (ent: TrapHazardEntry): ent is TrapComplexEntry => {
	return "trapHazType" in ent &&
		(ent.trapHazType === "SMPL" || ent.trapHazType === "CMPX");
};

const isHazard = (ent: TrapHazardEntry): ent is HazardEntry => {
	return !("trapHazType" in ent) ||
		ent.trapHazType === undefined ||
		["ENV", "EST", "GEN", "WTH", "WLD"].includes(ent.trapHazType as string);
};

// ============ Parser Functions ============

const trapHazTypeToFull = (type: TrapHazType | HazardType | string): string => {
	const trapTypes: Record<string, string> = {
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

const trapInitToFull = (init: 1 | 2 | 3 | undefined): string => {
	if (init == null) return "";
	const initMap: Record<number, string> = {
		1: "initiative count 10",
		2: "initiative count 20",
		3: "initiative count 20 and initiative count 10",
	};
	return initMap[init] ?? `initiative count ${init}`;
};

const threatToFull = (threat: TrapHazardThreat): string => {
	const threatMap: Record<TrapHazardThreat, string> = {
		nuisance: "Nuisance",
		setback: "Setback",
		moderate: "Moderate",
		dangerous: "Dangerous",
		deadly: "Deadly",
	};
	return threatMap[threat] ?? threat;
};

// ============ Duration Rendering ============

interface DurationEntriesMeta {
	entryDuration: string;
}

const getRenderableDurationEntriesMeta = (
	duration: DurationEffect,
	opts: { styleHint?: StyleHint } = {},
): DurationEntriesMeta => {
	if (!duration?.length) return { entryDuration: "" };

	const parts = duration.map(d => {
		switch (d.type) {
			case "instant":
				return "Instantaneous";
			case "permanent":
				return "Until dispelled";
			case "special":
				return "Special";
			case "timed": {
				if (!d.duration) return "";
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

const getTraphazardSubtitle = (
	ent: TrapHazardEntry,
	opts: { styleHint?: StyleHint } = {},
): string | null => {
	const type = (ent as { trapHazType?: string }).trapHazType ?? "HAZ";
	if (type === "GEN") return null;

	const styleHint = opts.styleHint ?? "classic";
	const ptType = trapHazTypeToFull(type);

	const rating = (ent as { rating?: TrapHazardRating }).rating;
	if (!rating?.length) return ptType;

	const ratingParts = rating.map((ratingItem: TrapHazardRatingItem) => {
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

const getRatingPartTier = (
	tier: TrapHazardTier,
	ptThreat: string,
	styleHint: StyleHint,
): string => {
	const tierLabel = styleHint === "classic" ? "tier" : "Tier";
	return `${tierLabel} ${tier}, ${ptThreat.toLowerCase()} threat`;
};

const getRatingPartLevel = (
	level: TrapLevel,
	ptThreat: string,
	styleHint: StyleHint,
): string => {
	const levelLabel = styleHint === "classic" ? "level" : "Levels";
	const min = level.min ?? 0;
	const max = level.max ?? min;
	const levelRange = min !== max ? `${min}\u2013${max}` : `${min}`;
	return `${levelLabel} ${levelRange}`;
};

// ============ Trap Entries Meta ============

const getTrapRenderableEntriesMeta = (
	ent: TrapHazardEntry,
	opts: { styleHint?: StyleHint } = {},
): TrapRenderableEntriesMeta => {
	const styleHint = opts.styleHint ?? "classic";

	if (isTrapSimple(ent)) {
		return getTrapRenderableEntriesMeta_classic(ent, styleHint);
	}

	if (isTrapComplex(ent)) {
		return getTrapRenderableEntriesMeta_modern(ent, styleHint);
	}

	return {};
};

const getTrapRenderableEntriesMeta_classic = (
	ent: TrapEntry,
	styleHint: StyleHint,
): TrapRenderableEntriesMeta => {
	const listItems: Entry[] = [];

	if (ent.trigger) {
		listItems.push({
			type: "item",
			name: "Trigger:",
			entries: ent.trigger,
		} as Entry);
	}

	if (ent.duration) {
		const durationMeta = getRenderableDurationEntriesMeta(ent.duration, { styleHint });
		if (durationMeta.entryDuration) {
			listItems.push({
				type: "item",
				name: "Duration:",
				entries: [durationMeta.entryDuration],
			} as Entry);
		}
	}

	if (ent.hauntBonus) {
		listItems.push({
			type: "item",
			name: "Haunt Bonus:",
			entry: ent.hauntBonus,
		} as Entry);

		if (!isNaN(Number(ent.hauntBonus))) {
			listItems.push({
				type: "item",
				name: "Detection:",
				entry: `passive Wisdom ({@skill Perception}) score equals or exceeds ${10 + Number(ent.hauntBonus)}`,
			} as Entry);
		}
	}

	if (!listItems.length) return {};

	return {
		entriesHeader: [
			{
				type: "list",
				style: "list-hang-notitle",
				items: listItems,
			} as Entry,
		],
	};
};

const getTrapRenderableEntriesMeta_modern = (
	ent: TrapComplexEntry,
	styleHint: StyleHint,
): TrapRenderableEntriesMeta => {
	const entriesAttributes: Entry[] = [];

	if (ent.trigger) {
		entriesAttributes.push({
			type: "entries",
			name: "Trigger",
			entries: ent.trigger,
		} as Entry);
	}

	if (ent.effect) {
		entriesAttributes.push({
			type: "entries",
			name: "Effect",
			entries: ent.effect,
		} as Entry);
	}

	if (ent.initiative) {
		entriesAttributes.push({
			type: "entries",
			name: "Initiative",
			entries: getTrapInitiativeEntries(ent),
		} as Entry);
	}

	if (ent.eActive) {
		entriesAttributes.push({
			type: "entries",
			name: "Active Elements",
			entries: ent.eActive,
		} as Entry);
	}

	if (ent.eDynamic) {
		entriesAttributes.push({
			type: "entries",
			name: "Dynamic Elements",
			entries: ent.eDynamic,
		} as Entry);
	}

	if (ent.eConstant) {
		entriesAttributes.push({
			type: "entries",
			name: "Constant Elements",
			entries: ent.eConstant,
		} as Entry);
	}

	if (ent.countermeasures) {
		entriesAttributes.push({
			type: "entries",
			name: "Countermeasures",
			entries: ent.countermeasures,
		} as Entry);
	}

	return { entriesAttributes };
};

const getTrapInitiativeEntries = (ent: TrapComplexEntry): Entry[] => {
	const initText = trapInitToFull(ent.initiative);
	const noteText = ent.initiativeNote ? ` (${ent.initiativeNote})` : "";
	return [`The trap acts on ${initText}${noteText}.`];
};

// ============ TrapHazard Markdown Renderer ============

export class TrapHazardMarkdownRenderer {
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

	getCompactRenderedString(ent: TrapHazardEntry, opts: TrapMarkdownOptions = {}): string {
		const meta = opts.meta ?? createRenderMeta();
		const styleHint = opts.styleHint ?? this._styleHint;

		const depthCached = meta.depth;
		meta.depth = 2;

		const result = this._renderTrapHazard(ent, meta, styleHint);

		meta.depth = depthCached;
		return result;
	}

	private _renderTrapHazard(
		ent: TrapHazardEntry,
		meta: RenderMeta,
		styleHint: StyleHint,
	): string {
		const subtitle = getTraphazardSubtitle(ent, { styleHint });
		const entriesMetaTrap = getTrapRenderableEntriesMeta(ent, { styleHint });

		const entries: (Entry | null)[] = [
			subtitle ? `{@i ${subtitle}}` : null,
			...(entriesMetaTrap.entriesHeader ?? []),
			{ type: "entries", entries: ent.entries } as Entry,
			...(entriesMetaTrap.entriesAttributes ?? []),
		];

		const filteredEntries = entries.filter((e): e is Entry => e != null);

		const displayName = ent._displayName ?? ent.name;
		return this._renderGenericCompact(displayName, filteredEntries, meta);
	}

	private _renderGenericCompact(
		name: string,
		entries: Entry[],
		meta: RenderMeta,
	): string {
		const subStack: TextStack = createTextStack();
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
	private _traphazardRenderer: TrapHazardMarkdownRenderer;

	constructor(renderer?: MarkdownRenderer, styleHint: StyleHint = "classic") {
		this._traphazardRenderer = new TrapHazardMarkdownRenderer(renderer, styleHint);
	}

	setRenderer(renderer: MarkdownRenderer): this {
		this._traphazardRenderer.setRenderer(renderer);
		return this;
	}

	setStyleHint(styleHint: StyleHint): this {
		this._traphazardRenderer.setStyleHint(styleHint);
		return this;
	}

	getCompactRenderedString(ent: TrapEntry | TrapComplexEntry, opts: TrapMarkdownOptions = {}): string {
		return this._traphazardRenderer.getCompactRenderedString(ent, opts);
	}
}

// ============ Hazard Markdown Renderer ============

export class HazardMarkdownRenderer {
	private _traphazardRenderer: TrapHazardMarkdownRenderer;

	constructor(renderer?: MarkdownRenderer, styleHint: StyleHint = "classic") {
		this._traphazardRenderer = new TrapHazardMarkdownRenderer(renderer, styleHint);
	}

	setRenderer(renderer: MarkdownRenderer): this {
		this._traphazardRenderer.setRenderer(renderer);
		return this;
	}

	setStyleHint(styleHint: StyleHint): this {
		this._traphazardRenderer.setStyleHint(styleHint);
		return this;
	}

	getCompactRenderedString(ent: HazardEntry, opts: TrapMarkdownOptions = {}): string {
		return this._traphazardRenderer.getCompactRenderedString(ent, opts);
	}
}

// ============ Module Export ============

let _trapRenderer: TrapMarkdownRenderer | null = null;
let _hazardRenderer: HazardMarkdownRenderer | null = null;
let _traphazardRenderer: TrapHazardMarkdownRenderer | null = null;

export const getTrapMarkdownRenderer = (styleHint: StyleHint = "classic"): TrapMarkdownRenderer => {
	if (!_trapRenderer) {
		_trapRenderer = new TrapMarkdownRenderer(undefined, styleHint);
	} else {
		_trapRenderer.setStyleHint(styleHint);
	}
	return _trapRenderer;
};

export const getHazardMarkdownRenderer = (styleHint: StyleHint = "classic"): HazardMarkdownRenderer => {
	if (!_hazardRenderer) {
		_hazardRenderer = new HazardMarkdownRenderer(undefined, styleHint);
	} else {
		_hazardRenderer.setStyleHint(styleHint);
	}
	return _hazardRenderer;
};

export const getTrapHazardMarkdownRenderer = (styleHint: StyleHint = "classic"): TrapHazardMarkdownRenderer => {
	if (!_traphazardRenderer) {
		_traphazardRenderer = new TrapHazardMarkdownRenderer(undefined, styleHint);
	} else {
		_traphazardRenderer.setStyleHint(styleHint);
	}
	return _traphazardRenderer;
};

// ============ Convenience Exports ============

export const trapMarkdown = {
	getCompactRenderedString: (ent: TrapEntry | TrapComplexEntry, opts: TrapMarkdownOptions = {}): string => {
		return getTrapMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
	},
};

export const hazardMarkdown = {
	getCompactRenderedString: (ent: HazardEntry, opts: TrapMarkdownOptions = {}): string => {
		return getHazardMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
	},
};

export const traphazardMarkdown = {
	getCompactRenderedString: (ent: TrapHazardEntry, opts: TrapMarkdownOptions = {}): string => {
		return getTrapHazardMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
	},

	getSubtitle: getTraphazardSubtitle,
	getTrapRenderableEntriesMeta,
	getTrapInitiativeEntries,
	getRenderableDurationEntriesMeta,
};
