import type { EntryList } from "../../../types/entry.js";
import type { Boon } from "../../../types/cultsboons.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface BoonEntry extends Boon {
    _displayName?: string;
}
export interface BoonMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface BoonRenderableEntriesMeta {
    listBenefits: EntryList | null;
}
export declare class BoonMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(boon: BoonEntry, opts?: BoonMarkdownOptions): string;
}
export declare const getBoonMarkdownRenderer: (styleHint?: StyleHint) => BoonMarkdownRenderer;
export declare const boonMarkdown: {
    getCompactRenderedString: (boon: BoonEntry, opts?: BoonMarkdownOptions) => string;
    getBoonRenderableEntriesMeta: (boon: BoonEntry) => BoonRenderableEntriesMeta;
};
//# sourceMappingURL=boon.d.ts.map