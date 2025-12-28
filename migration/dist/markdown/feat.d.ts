import type { Entry } from "../../../types/entry.js";
import type { Feat, FeatCategory } from "../../../types/feats.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface FeatEntry extends Feat {
    _displayName?: string;
    _fullEntries?: Entry[];
}
export interface FeatMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export declare class FeatMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(ent: FeatEntry, opts?: FeatMarkdownOptions): string;
    private _getGenericCompactRenderedString;
}
export declare const getFeatMarkdownRenderer: (styleHint?: StyleHint) => FeatMarkdownRenderer;
export declare const featMarkdown: {
    getCompactRenderedString: (ent: FeatEntry, opts?: FeatMarkdownOptions) => string;
    getJoinedCategoryPrerequisites: (category: FeatCategory | string | undefined, prerequisite: string | null) => string | null;
    getRenderedPrerequisite: (ent: FeatEntry) => string | null;
    getRepeatableEntry: (ent: FeatEntry) => string | null;
    getCategoryText: (category: FeatCategory | string) => string;
    getCategoryWithFeatSuffix: (category: FeatCategory | string) => string;
};
//# sourceMappingURL=feat.d.ts.map