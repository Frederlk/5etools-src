import type { Entry } from "../../../types/entry.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface ItemEntry {
    name: string;
    _displayName?: string;
    source: string;
    type?: string;
    typeAlt?: string;
    rarity?: string;
    reqAttune?: boolean | string;
    reqAttuneAlt?: string;
    tier?: string;
    value?: number;
    valueMult?: number;
    weight?: number;
    weightMult?: number;
    weightNote?: string;
    currencyConversion?: string;
    entries?: Entry[];
    _fullEntries?: Entry[];
    additionalEntries?: Entry[];
    _fullAdditionalEntries?: Entry[];
    damage?: string;
    damageType?: string;
    property?: string[];
    mastery?: string[];
    weapon?: boolean;
    weaponCategory?: string;
    armor?: boolean;
    ac?: number;
    strength?: string;
    stealth?: boolean;
    baseItem?: string;
    wondrous?: boolean;
    tattoo?: boolean;
    staff?: boolean;
    age?: string;
}
export interface ItemMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface TypeRarityAttunementParts {
    typeRarityText: string;
    subTypeText: string;
    tierText: string;
}
export declare class ItemMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(item: ItemEntry, opts?: ItemMarkdownOptions): string;
}
export declare const getItemMarkdownRenderer: (styleHint?: StyleHint) => ItemMarkdownRenderer;
export declare const itemMarkdown: {
    getCompactRenderedString: (item: ItemEntry, opts?: ItemMarkdownOptions) => string;
    getTypeRarityAndAttunementTextParts: (item: ItemEntry, opts?: {
        styleHint?: StyleHint;
    }) => TypeRarityAttunementParts;
};
export declare const baseItemMarkdown: {
    getCompactRenderedString: (item: ItemEntry, opts?: ItemMarkdownOptions) => string;
};
export declare const magicVariantMarkdown: {
    getCompactRenderedString: (item: ItemEntry, opts?: ItemMarkdownOptions) => string;
};
export declare const itemGroupMarkdown: {
    getCompactRenderedString: (item: ItemEntry, opts?: ItemMarkdownOptions) => string;
};
//# sourceMappingURL=item.d.ts.map