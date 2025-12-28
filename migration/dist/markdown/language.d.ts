import type { Entry } from "../../../types/entry.js";
import type { Language } from "../../../types/languages.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface LanguageEntry extends Language {
    _displayName?: string;
}
export interface LanguageMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface LanguageEntriesMeta {
    entryType: string | null;
    entryTypicalSpeakers: string | null;
    entryScript: string | null;
    entriesContent: Entry[] | null;
}
export declare class LanguageMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(lang: LanguageEntry, opts?: LanguageMarkdownOptions): string;
}
export declare const getLanguageMarkdownRenderer: (styleHint?: StyleHint) => LanguageMarkdownRenderer;
export declare const languageMarkdown: {
    getCompactRenderedString: (lang: LanguageEntry, opts?: LanguageMarkdownOptions) => string;
    getLanguageRenderableEntriesMeta: (lang: LanguageEntry) => LanguageEntriesMeta;
};
//# sourceMappingURL=language.d.ts.map