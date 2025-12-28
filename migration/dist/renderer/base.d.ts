import type { Entry, EntryObject, EntrySection, EntryList, EntryTable, EntryQuote, EntryInset, EntryInsetReadaloud, EntryVariant, EntryItem, EntryImage, EntryTableCell, EntryWrapped, EntryDice } from "../../../types/entry.js";
import type { TextStack, RenderMeta, RenderOptions, StyleHint } from "./types.js";
export interface RendererConfig {
    /** Default style hint */
    styleHint: StyleHint;
    /** Whether to add interactive handlers */
    isAddHandlers: boolean;
    /** Base URL for links */
    baseUrl: string;
}
export declare const defaultRendererConfig: RendererConfig;
export declare const isEntryObject: (entry: Entry) => entry is EntryObject;
export declare const isEntryWrapped: (entry: EntryObject) => entry is EntryWrapped;
export declare const isEntrySection: (entry: EntryObject) => entry is EntrySection;
export declare const hasEntries: (entry: EntryObject) => entry is EntryObject & {
    entries: Entry[];
};
export declare const hasEntry: (entry: EntryObject) => entry is EntryObject & {
    entry: Entry;
};
export declare const hasTitle: (entry: EntryObject) => entry is EntryObject & {
    title: string;
};
export declare const isEntryTableCell: (cell: unknown) => cell is EntryTableCell;
type EntryWithEntries = EntryObject & {
    entries?: Entry[];
};
export declare const getEntryType: (entry: Entry) => string;
/**
 * Abstract base renderer class.
 * Provides core recursive rendering logic with hooks for customization.
 * Extend this class to create specialized renderers (HTML, Markdown, etc.)
 */
export declare abstract class BaseRenderer {
    protected config: RendererConfig;
    constructor(config?: Partial<RendererConfig>);
    setStyleHint(styleHint: StyleHint): this;
    setAddHandlers(isAddHandlers: boolean): this;
    setBaseUrl(baseUrl: string): this;
    /**
     * Render an entry to string output.
     * @param entry - Entry to render
     * @param options - Render options
     * @returns Rendered string
     */
    render(entry: Entry, options?: RenderOptions): string;
    /**
     * Recursively render an entry, appending to textStack.
     * @param entry - Entry to render
     * @param textStack - Text accumulator
     * @param meta - Render metadata
     * @param options - Render options
     */
    recursiveRender(entry: Entry, textStack: TextStack, meta: RenderMeta, options?: RenderOptions): void;
    /**
     * Internal recursive render implementation.
     */
    protected _recursiveRender(entry: Entry, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    /**
     * Route rendering to appropriate type handler.
     */
    protected _renderByType(entry: Exclude<Entry, string>, type: string, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderPrefix(entry: Entry, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderSuffix(entry: Entry, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    /** Render a string entry (with tag processing) */
    protected abstract _renderString(entry: string, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    /** Render an entries block (accepts any entry type with entries property) */
    protected abstract _renderEntries(entry: EntryWithEntries, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    /** Render a list */
    protected abstract _renderList(entry: EntryList, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    /** Render a table */
    protected abstract _renderTable(entry: EntryTable, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    /** Render a quote */
    protected abstract _renderQuote(entry: EntryQuote, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    /** Render an inset (accepts both inset and insetReadaloud types) */
    protected abstract _renderInset(entry: EntryInset | EntryInsetReadaloud, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    /** Render an item */
    protected abstract _renderItem(entry: EntryItem, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    /** Render an image */
    protected abstract _renderImage(entry: EntryImage, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderOptions(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderTableGroup(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderInsetReadaloud(entry: EntryInsetReadaloud, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderVariant(entry: EntryVariant, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderVariantInner(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderVariantSub(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderOptfeature(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderAbilityDc(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderAbilityAttackMod(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderAbilityGeneric(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderInline(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderInlineBlock(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderBonus(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderBonusSpeed(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderDice(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _getDiceString(entry: EntryDice): string;
    protected _renderLink(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderItemSub(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderItemSpell(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderGallery(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderHr(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderCode(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderStatblock(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderActions(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderAttack(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderSpellcasting(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderFlowchart(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderFlowBlock(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderIngredient(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderHomebrew(entry: any, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    /**
     * Get entry name/title.
     */
    protected _getEntryName(entry: any): string | undefined;
    /**
     * Process tags in a string.
     * Default implementation strips tags - override for tag rendering.
     */
    protected _processTags(str: string, meta: RenderMeta, options: RenderOptions): string;
}
/**
 * Simple plain text renderer.
 * Strips all formatting and renders entries as plain text.
 */
export declare class PlainTextRenderer extends BaseRenderer {
    protected _renderString(entry: string, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderEntries(entry: EntryWithEntries, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderList(entry: EntryList, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderTable(entry: EntryTable, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderQuote(entry: EntryQuote, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderInset(entry: EntryInset | EntryInsetReadaloud, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderItem(entry: EntryItem, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
    protected _renderImage(entry: EntryImage, textStack: TextStack, meta: RenderMeta, options: RenderOptions): void;
}
/**
 * Create a plain text renderer.
 */
export declare const createPlainTextRenderer: (config?: Partial<RendererConfig>) => PlainTextRenderer;
export declare const getPlainTextRenderer: () => PlainTextRenderer;
export {};
//# sourceMappingURL=base.d.ts.map