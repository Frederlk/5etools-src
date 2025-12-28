import type { Entry } from "../../../types/entry.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface LegendaryGroupEntry {
    name: string;
    _displayName?: string;
    source: string;
    page?: number;
    additionalSources?: Array<{
        source: string;
        page?: number;
    }>;
    lairActions?: Entry[];
    regionalEffects?: Entry[];
    mythicEncounter?: Entry[];
}
export interface LegendaryGroupMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export declare class LegendaryGroupMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(lg: LegendaryGroupEntry, opts?: LegendaryGroupMarkdownOptions): string;
    getSummaryEntry(lg: LegendaryGroupEntry): Entry | null;
}
export declare const getLegendaryGroupMarkdownRenderer: (styleHint?: StyleHint) => LegendaryGroupMarkdownRenderer;
export declare const legendaryGroupMarkdown: {
    getCompactRenderedString: (lg: LegendaryGroupEntry, opts?: LegendaryGroupMarkdownOptions) => string;
    getSummaryEntry: (lg: LegendaryGroupEntry) => Entry | null;
    hasLegendaryContent: (lg: LegendaryGroupEntry) => boolean;
};
//# sourceMappingURL=legendaryGroup.d.ts.map