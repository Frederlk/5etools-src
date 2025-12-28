import type { Entry } from "../../../types/entry.js";
import type { FacilityBase, FacilitySpace } from "../../../types/bastions.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
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
export declare const getFacilityRenderableEntriesMeta: (ent: FacilityEntry) => FacilityRenderableEntriesMeta;
export declare class FacilityMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(ent: FacilityEntry, opts?: FacilityMarkdownOptions): string;
}
export declare const getFacilityMarkdownRenderer: (styleHint?: StyleHint) => FacilityMarkdownRenderer;
export declare const facilityMarkdown: {
    getCompactRenderedString: (ent: FacilityEntry, opts?: FacilityMarkdownOptions) => string;
    getFacilityRenderableEntriesMeta: (ent: FacilityEntry) => FacilityRenderableEntriesMeta;
    getSpaceEntry: (space: FacilitySpace, opts?: {
        isIncludeCostTime?: boolean;
    }) => string;
    getSpaceText: (ent: FacilityEntry) => string | null;
    getHirelingsText: (ent: FacilityEntry) => string | null;
    getOrdersText: (ent: FacilityEntry) => string | null;
};
//# sourceMappingURL=facility.d.ts.map