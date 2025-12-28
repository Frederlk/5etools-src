import type { Psionic, PsionicType } from "../../../types/psionics.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface PsionicEntry extends Psionic {
    _displayName?: string;
}
export interface PsionicMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export declare class PsionicMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(psi: PsionicEntry, opts?: PsionicMarkdownOptions): string;
}
export declare const getPsionicMarkdownRenderer: (styleHint?: StyleHint) => PsionicMarkdownRenderer;
export declare const psionicMarkdown: {
    getCompactRenderedString: (psi: PsionicEntry, opts?: PsionicMarkdownOptions) => string;
    getTypeOrderString: (psi: PsionicEntry) => string;
    getTypeString: (type: PsionicType) => string;
};
//# sourceMappingURL=psionic.d.ts.map