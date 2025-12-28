import type { Entry } from "../../../types/entry.js";
import type { CharCreationOption } from "../../../types/charcreationoptions.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface CharoptionEntry extends CharCreationOption {
    _displayName?: string;
}
export interface CharoptionMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface CharoptionRenderableEntriesMeta {
    entryOptionType: Entry;
}
export declare class CharoptionMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(ent: CharoptionEntry, opts?: CharoptionMarkdownOptions): string;
    private _getGenericCompactRenderedString;
}
export declare const getCharoptionMarkdownRenderer: (styleHint?: StyleHint) => CharoptionMarkdownRenderer;
export declare const charoptionMarkdown: {
    getCompactRenderedString: (ent: CharoptionEntry, opts?: CharoptionMarkdownOptions) => string;
    getCharoptionRenderableEntriesMeta: (ent: CharoptionEntry) => CharoptionRenderableEntriesMeta | null;
    getRenderedPrerequisite: (ent: CharoptionEntry) => string | null;
    getOptionTypeEntries: () => Record<string, string>;
};
//# sourceMappingURL=charoption.d.ts.map