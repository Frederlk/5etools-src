import type { Entry, EntryEntries, EntryList, EntryTable, EntryQuote, EntryInset, EntryInsetReadaloud, EntryVariant, EntryItem, EntryImage } from "../../../types/entry.js";
import type { TextStack, RenderMeta, RenderOptions, MarkdownConfig } from "../renderer/types.js";
import { BaseRenderer, type RendererConfig } from "../renderer/base.js";
export declare const CHARS_PER_PAGE = 5500;
export interface MarkdownRendererConfig extends RendererConfig {
    markdownConfig: MarkdownConfig;
    isSkipStylingItemLinks: boolean;
}
export declare const defaultMarkdownRendererConfig: MarkdownRendererConfig;
export declare class MarkdownRenderer extends BaseRenderer {
    protected config: MarkdownRendererConfig;
    private _isFirstSection;
    constructor(config?: Partial<MarkdownRendererConfig>);
    setTagRenderMode(mode: MarkdownConfig["tagRenderMode"]): this;
    setAddColumnBreaks(isAdd: boolean): this;
    setAddPageBreaks(isAdd: boolean): this;
    setFirstSection(isFirst: boolean): this;
    setSkipStylingItemLinks(isSkip: boolean): this;
    getLineBreak(): string;
    render(entry: Entry, options?: RenderOptions): string;
    protected _renderString(entry: string, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    private _renderString_renderModeConvertMarkdown;
    private _renderString_renderTag;
    private _getAttackTagText;
    private _getOrdinalText;
    protected _renderEntries(entry: EntryEntries, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderEntriesSubtypes(entry: EntryEntries, textStack: TextStack, meta: RenderMeta, options: RenderOptions, incDepth?: boolean): void;
    private _renderEntriesSubtypes_renderPreReqText;
    protected _renderList(entry: EntryList, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderTable(entry: EntryTable, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    private _getPaddedTableText;
    private _getPaddedStyleText;
    protected _renderQuote(entry: EntryQuote, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    private _getQuoteBy;
    protected _renderInset(entry: EntryInset, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderInsetReadaloud(entry: EntryInsetReadaloud, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderVariant(entry: EntryVariant, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderVariantSub(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderItem(entry: EntryItem, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    private _shouldAddPeriod;
    protected _renderItemSub(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderItemSpell(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderImage(entry: EntryImage, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    private _getImageUrl;
    protected _renderGallery(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderAbilityDc(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderAbilityAttackMod(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderAbilityGeneric(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderDice(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    private _getDiceDisplayText;
    protected _renderLink(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    private _getLinkHref;
    protected _renderActions(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderAttack(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    private _getAttackTypeText;
    protected _renderSpellcasting(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    private _getSpellcastingEntries;
    protected _renderFlowBlock(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderHomebrew(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderCode(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderHr(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _adjustDepth(meta: RenderMeta, adjustment: number): number;
    private _getPageText;
}
export declare const createMarkdownRenderer: (config?: Partial<MarkdownRendererConfig>) => MarkdownRenderer;
export declare const getMarkdownRenderer: () => MarkdownRenderer;
export declare const markdownUtils: {
    getPageText(it: {
        source: string;
        page?: number;
    }): string;
    withMetaDepth<T>(depth: number, opts: {
        meta?: RenderMeta;
    }, fn: () => T): T;
    getNormalizedNewlines(str: string): string;
    getRenderedAbilityScores(ent: Record<string, number | null>, opts?: {
        prefix?: string;
    }): string;
};
//# sourceMappingURL=renderer.d.ts.map