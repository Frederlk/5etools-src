import type { Entry } from "../../../types/entry.js";
import type { Race } from "../../../types/races.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface RaceEntry extends Race {
    _displayName?: string;
    _isBaseRace?: boolean;
}
export interface RaceMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface RaceRenderableEntriesMeta {
    entryAttributes: Entry | null;
    entryMain: Entry;
}
export declare class RaceMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(race: RaceEntry, opts?: RaceMarkdownOptions): string;
    private _getHeightAndWeightPart;
    private _renderGenericCompact;
}
export declare const getRaceMarkdownRenderer: (styleHint?: StyleHint) => RaceMarkdownRenderer;
export declare const raceMarkdown: {
    getCompactRenderedString: (race: RaceEntry, opts?: RaceMarkdownOptions) => string;
    getHeightAndWeightEntries: (race: RaceEntry) => Entry[];
    getRenderedHeight: (height: number) => string;
};
//# sourceMappingURL=race.d.ts.map