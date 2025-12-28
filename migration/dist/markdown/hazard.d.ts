import type { Entry } from "../../../types/entry.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface HazardRating {
    threat?: string;
    tier?: number;
    level?: {
        min?: number;
        max?: number;
    };
}
export interface HazardEntry {
    name: string;
    _displayName?: string;
    source: string;
    entries?: Entry[];
    trapHazType?: string;
    rating?: HazardRating[];
    trigger?: Entry[];
    duration?: unknown;
    hauntBonus?: number | string;
    effect?: Entry[];
    initiative?: number;
    initiativeNote?: string;
    eActive?: Entry[];
    eDynamic?: Entry[];
    eConstant?: Entry[];
    countermeasures?: Entry[];
    __prop?: string;
}
export interface HazardMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface TrapHazardEntriesMeta {
    entriesHeader?: Entry[];
    entriesAttributes?: Entry[];
}
export declare class TrapHazardMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(ent: HazardEntry, opts?: HazardMarkdownOptions): string;
}
export declare class HazardMarkdownRenderer {
    private _traphazardRenderer;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(ent: HazardEntry, opts?: HazardMarkdownOptions): string;
}
export declare const getTraphazardMarkdownRenderer: (styleHint?: StyleHint) => TrapHazardMarkdownRenderer;
export declare const getHazardMarkdownRenderer: (styleHint?: StyleHint) => HazardMarkdownRenderer;
export declare const traphazardMarkdown: {
    getCompactRenderedString: (ent: HazardEntry, opts?: HazardMarkdownOptions) => string;
    getSubtitle: (ent: HazardEntry, styleHint: StyleHint) => string | null;
    getRenderedTrapHazardRatingPart: (rating: HazardRating, styleHint: StyleHint) => string;
    getTrapRenderableEntriesMeta: (ent: HazardEntry, styleHint: StyleHint) => TrapHazardEntriesMeta;
    getTrapInitiativeEntries: (ent: HazardEntry) => string[];
};
export declare const hazardMarkdown: {
    getCompactRenderedString: (ent: HazardEntry, opts?: HazardMarkdownOptions) => string;
};
//# sourceMappingURL=hazard.d.ts.map