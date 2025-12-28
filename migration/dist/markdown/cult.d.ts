import type { Entry } from "../../../types/entry.js";
import type { Cult } from "../../../types/cultsboons.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface CultEntry extends Cult {
    _displayName?: string;
}
export interface CultMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface CultEntriesMeta {
    listGoalsCultistsSpells: Entry | null;
}
export declare class CultMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(cult: CultEntry, opts?: CultMarkdownOptions): string;
}
export declare const getCultMarkdownRenderer: (styleHint?: StyleHint) => CultMarkdownRenderer;
export declare const cultMarkdown: {
    getCompactRenderedString: (cult: CultEntry, opts?: CultMarkdownOptions) => string;
    getCultRenderableEntriesMeta: (cult: CultEntry) => CultEntriesMeta;
};
//# sourceMappingURL=cult.d.ts.map