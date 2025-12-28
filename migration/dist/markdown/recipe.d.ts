import type { Entry } from "../../../types/entry.js";
import type { Recipe, RecipeServes } from "../../../types/recipes.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
interface TimeRange {
    min: number;
    max: number;
}
type TimeValue = number | TimeRange;
interface RecipeTimeExtended {
    total?: TimeValue;
    cooking?: TimeValue;
    preparation?: TimeValue;
    [key: string]: TimeValue | undefined;
}
export interface RecipeEntry extends Omit<Recipe, "time"> {
    time?: RecipeTimeExtended;
    _displayName?: string;
    _fullIngredients?: Entry[];
    _fullEquipment?: Entry[];
    _scaleFactor?: number;
}
export interface RecipeMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface RecipeTimeMeta {
    entryName: string;
    entryContent: string;
}
export interface RecipeRenderableEntriesMeta {
    entryMakes: string | null;
    entryServes: string | null;
    entryMetasTime: RecipeTimeMeta[] | null;
    entryIngredients: {
        type: "entries";
        entries: Entry[];
    };
    entryEquipment: {
        type: "entries";
        entries: Entry[];
    } | null;
    entryCooksNotes: {
        type: "entries";
        entries: Entry[];
    } | null;
    entryInstructions: {
        type: "entries";
        entries: Entry[];
    };
}
export declare const getRecipeRenderableEntriesMeta: (ent: RecipeEntry) => RecipeRenderableEntriesMeta;
export declare class RecipeMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(recipe: RecipeEntry, opts?: RecipeMarkdownOptions): string;
}
export declare const getRecipeMarkdownRenderer: (styleHint?: StyleHint) => RecipeMarkdownRenderer;
export declare const recipeMarkdown: {
    getCompactRenderedString: (recipe: RecipeEntry, opts?: RecipeMarkdownOptions) => string;
    getRecipeRenderableEntriesMeta: (ent: RecipeEntry) => RecipeRenderableEntriesMeta;
    getEntryMetasTime: (ent: RecipeEntry) => RecipeTimeMeta[] | null;
    getServesText: (serves: RecipeServes) => string;
};
export {};
//# sourceMappingURL=recipe.d.ts.map