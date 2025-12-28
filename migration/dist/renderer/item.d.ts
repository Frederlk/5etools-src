import type { Entry } from "../../../types/entry.js";
import type { StyleHint, RenderMeta, TextStack } from "./types.js";
export interface ItemProperty {
    uid?: string;
    note?: string;
}
export interface ItemMastery {
    uid?: string;
    note?: string;
}
export interface ItemEntry {
    name: string;
    _displayName?: string;
    source: string;
    type?: string;
    bardingType?: string;
    typeAlt?: string;
    rarity?: string;
    reqAttune?: boolean | string;
    reqAttuneAlt?: boolean | string;
    _attunement?: string;
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
    _entryType?: string;
    _entrySubType?: string;
    property?: (string | ItemProperty)[];
    mastery?: (string | ItemMastery)[];
    dmg1?: string;
    dmg2?: string;
    dmgType?: string;
    ac?: number;
    acSpecial?: string;
    dexterityMax?: number | null;
    speed?: string;
    carryingCapacity?: number;
    vehSpeed?: number;
    capCargo?: number;
    capPassenger?: number;
    crew?: number;
    crewMin?: number;
    crewMax?: number;
    vehAc?: number;
    vehHp?: number;
    vehDmgThresh?: number;
    travelCost?: number;
    shippingCost?: number;
    barDimensions?: {
        l?: number;
        w?: number;
        h?: number;
    };
    range?: number;
    weaponCategory?: string;
    wondrous?: boolean;
    tattoo?: boolean;
    staff?: boolean;
    ammo?: boolean;
    age?: string;
    firearm?: boolean;
    poison?: boolean;
    poisonTypes?: string[];
    baseItem?: string;
    sentient?: boolean;
    _category?: string;
    _variantName?: string;
    lootTables?: string[];
}
export interface TransformedTypeEntriesMeta {
    entryType: string;
    entryTypeRarity: string;
    entrySubtype: string;
    entryTier: string;
}
export interface TypeRarityAttunementParts {
    typeRarityHtml: string;
    subTypeHtml: string;
    tierHtml: string;
}
export interface RenderableTypeEntriesMeta {
    textTypes: string[];
    entryType: string;
    entrySubType: string;
}
export interface ItemRenderOptions {
    styleHint?: StyleHint;
    renderer?: ItemRenderer;
    isSkipPrefix?: boolean;
    isCompact?: boolean;
    wrappedTypeAllowlist?: Set<string> | null;
}
export interface ItemRenderer {
    render(entry: Entry | string): string;
    recursiveRender(entry: Entry, textStack: TextStack, meta: RenderMeta, options?: {
        depth?: number;
    }): void;
    getLineBreak(): string;
}
export declare const HIDDEN_RARITY: Set<string>;
export declare const dmgTypeToFull: (dmgType: string, opts?: {
    styleHint?: StyleHint;
}) => string;
export declare const getPropertiesText: (item: ItemEntry, opts?: {
    renderer?: ItemRenderer;
}) => string;
export declare const getRenderedDamageAndProperties: (item: ItemEntry, opts?: ItemRenderOptions) => [string, string];
export declare const getRenderedMastery: (item: ItemEntry, opts?: ItemRenderOptions) => string;
export declare const getTransformedTypeEntriesMeta: (item: ItemEntry, opts?: {
    styleHint?: StyleHint;
}) => TransformedTypeEntriesMeta;
export declare const getTypeRarityAndAttunementHtmlParts: (item: ItemEntry, opts?: {
    styleHint?: StyleHint;
    renderer?: ItemRenderer;
}) => TypeRarityAttunementParts;
export declare const getAttunementAndAttunementCatText: (item: ItemEntry, prop?: "reqAttune" | "reqAttuneAlt") => [string | null, string];
export declare const getRenderableTypeEntriesMeta: (item: ItemEntry, opts?: {
    styleHint?: StyleHint;
}) => RenderableTypeEntriesMeta;
export declare const getRenderedEntries: (item: ItemEntry, opts?: ItemRenderOptions) => string;
export declare const hasEntries: (item: ItemEntry) => boolean;
export declare const getTypeRarityAndAttunementHtml: (parts: TypeRarityAttunementParts, opts?: {
    styleHint?: StyleHint;
}) => string;
export declare const doRenderRarity: (rarity: string) => boolean;
export declare const isMundane: (item: Pick<ItemEntry, "rarity" | "_category">) => boolean;
export declare const itemRenderer: {
    getPropertiesText: (item: ItemEntry, opts?: {
        renderer?: ItemRenderer;
    }) => string;
    getRenderedDamageAndProperties: (item: ItemEntry, opts?: ItemRenderOptions) => [string, string];
    getRenderedMastery: (item: ItemEntry, opts?: ItemRenderOptions) => string;
    getTransformedTypeEntriesMeta: (item: ItemEntry, opts?: {
        styleHint?: StyleHint;
    }) => TransformedTypeEntriesMeta;
    getTypeRarityAndAttunementHtmlParts: (item: ItemEntry, opts?: {
        styleHint?: StyleHint;
        renderer?: ItemRenderer;
    }) => TypeRarityAttunementParts;
    getAttunementAndAttunementCatText: (item: ItemEntry, prop?: "reqAttune" | "reqAttuneAlt") => [string | null, string];
    getRenderableTypeEntriesMeta: (item: ItemEntry, opts?: {
        styleHint?: StyleHint;
    }) => RenderableTypeEntriesMeta;
    getRenderedEntries: (item: ItemEntry, opts?: ItemRenderOptions) => string;
    hasEntries: (item: ItemEntry) => boolean;
    getTypeRarityAndAttunementHtml: (parts: TypeRarityAttunementParts, opts?: {
        styleHint?: StyleHint;
    }) => string;
    doRenderRarity: (rarity: string) => boolean;
    isMundane: (item: Pick<ItemEntry, "rarity" | "_category">) => boolean;
    dmgTypeToFull: (dmgType: string, opts?: {
        styleHint?: StyleHint;
    }) => string;
    HIDDEN_RARITY: Set<string>;
};
//# sourceMappingURL=item.d.ts.map