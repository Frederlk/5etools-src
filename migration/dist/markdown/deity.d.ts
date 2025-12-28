import type { Deity } from "../../../types/deities.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface DeityEntry extends Deity {
    _displayName?: string;
    customProperties?: Record<string, string>;
}
export interface DeityMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface DeityEntriesMeta {
    entriesAttributes: string[];
}
export declare class DeityMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(deity: DeityEntry, opts?: DeityMarkdownOptions): string;
    private _renderGenericCompact;
}
export declare const getDeityMarkdownRenderer: (styleHint?: StyleHint) => DeityMarkdownRenderer;
export declare const deityMarkdown: {
    getCompactRenderedString: (deity: DeityEntry, opts?: DeityMarkdownOptions) => string;
    getDeityRenderableEntriesMeta: (deity: DeityEntry) => DeityEntriesMeta;
};
//# sourceMappingURL=deity.d.ts.map