import type { Entry } from "../../../types/entry.js";
import type { TrapSimple, TrapComplex, Hazard, DurationEffect } from "../../../types/trapshazards.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
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
interface DurationEntriesMeta {
    entryDuration: string;
}
export declare class TrapHazardMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(ent: TrapHazardEntry, opts?: TrapMarkdownOptions): string;
    private _renderTrapHazard;
    private _renderGenericCompact;
}
export declare class TrapMarkdownRenderer {
    private _traphazardRenderer;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(ent: TrapEntry | TrapComplexEntry, opts?: TrapMarkdownOptions): string;
}
export declare class HazardMarkdownRenderer {
    private _traphazardRenderer;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(ent: HazardEntry, opts?: TrapMarkdownOptions): string;
}
export declare const getTrapMarkdownRenderer: (styleHint?: StyleHint) => TrapMarkdownRenderer;
export declare const getHazardMarkdownRenderer: (styleHint?: StyleHint) => HazardMarkdownRenderer;
export declare const getTrapHazardMarkdownRenderer: (styleHint?: StyleHint) => TrapHazardMarkdownRenderer;
export declare const trapMarkdown: {
    getCompactRenderedString: (ent: TrapEntry | TrapComplexEntry, opts?: TrapMarkdownOptions) => string;
};
export declare const hazardMarkdown: {
    getCompactRenderedString: (ent: HazardEntry, opts?: TrapMarkdownOptions) => string;
};
export declare const traphazardMarkdown: {
    getCompactRenderedString: (ent: TrapHazardEntry, opts?: TrapMarkdownOptions) => string;
    getSubtitle: (ent: TrapHazardEntry, opts?: {
        styleHint?: StyleHint;
    }) => string | null;
    getTrapRenderableEntriesMeta: (ent: TrapHazardEntry, opts?: {
        styleHint?: StyleHint;
    }) => TrapRenderableEntriesMeta;
    getTrapInitiativeEntries: (ent: TrapComplexEntry) => Entry[];
    getRenderableDurationEntriesMeta: (duration: DurationEffect, opts?: {
        styleHint?: StyleHint;
    }) => DurationEntriesMeta;
};
export {};
//# sourceMappingURL=trap.d.ts.map