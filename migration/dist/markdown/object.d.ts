import type { ObjectItem } from "../../../types/objects.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { type MarkdownRenderer } from "./renderer.js";
export interface ObjectEntry extends ObjectItem {
    _displayName?: string;
    capCrew?: number;
    capPassenger?: number;
    capCargo?: number;
}
export interface ObjectMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface ObjectRenderableEntriesMeta {
    entrySize: string | null;
    entryCreatureCapacity: string | null;
    entryCargoCapacity: string | null;
    entryArmorClass: string | null;
    entryHitPoints: string | null;
    entrySpeed: string | null;
    entryAbilityScores: string | null;
    entryDamageImmunities: string | null;
    entryDamageResistances: string | null;
    entryDamageVulnerabilities: string | null;
    entryConditionImmunities: string | null;
    entrySenses: string | null;
}
declare const RENDERABLE_ENTRIES_PROP_ORDER: (keyof ObjectRenderableEntriesMeta)[];
export declare class ObjectMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(obj: ObjectEntry, opts?: ObjectMarkdownOptions): string;
    private _getGenericCompactRenderedString;
}
export declare const getObjectMarkdownRenderer: (styleHint?: StyleHint) => ObjectMarkdownRenderer;
export declare const objectMarkdown: {
    getCompactRenderedString: (obj: ObjectEntry, opts?: ObjectMarkdownOptions) => string;
    getObjectRenderableEntriesMeta: (obj: ObjectEntry) => ObjectRenderableEntriesMeta;
};
export { RENDERABLE_ENTRIES_PROP_ORDER };
export default objectMarkdown;
//# sourceMappingURL=object.d.ts.map