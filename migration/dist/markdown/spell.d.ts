import type { Entry } from "../../../types/entry.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { type SpellTime, type SpellMeta, type SpellRange, type SpellComponents, type SpellDuration } from "../parser/spell.js";
import { MarkdownRenderer } from "./renderer.js";
export interface SpellEntry {
    name: string;
    _displayName?: string;
    source: string;
    level: number;
    school: string;
    meta?: SpellMeta;
    subschools?: string[];
    time: SpellTime[];
    range: SpellRange;
    components?: SpellComponents;
    duration: SpellDuration[];
    entries?: Entry[];
    entriesHigherLevel?: Entry[];
}
export interface SpellMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface SpellClassRef {
    name: string;
    source: string;
}
export interface SpellClassList {
    fromClassList?: SpellClassRef[];
    fromClassListVariant?: SpellClassRef[];
}
export declare class SpellMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(spell: SpellEntry & SpellClassList, opts?: SpellMarkdownOptions): string;
}
export declare const getSpellMarkdownRenderer: (styleHint?: StyleHint) => SpellMarkdownRenderer;
export declare const spellMarkdown: {
    getCompactRenderedString: (spell: SpellEntry & SpellClassList, opts?: SpellMarkdownOptions) => string;
};
//# sourceMappingURL=spell.d.ts.map