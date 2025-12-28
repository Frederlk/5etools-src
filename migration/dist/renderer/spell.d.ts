import type { StyleHint } from "./types.js";
import { type SpellTime, type SpellMeta, type SpellRange, type SpellComponents, type SpellDuration } from "../parser/spell.js";
export interface SpellData {
    name: string;
    level: number;
    school: string;
    meta?: SpellMeta;
    subschools?: string[];
    time: SpellTime[];
    range: SpellRange;
    components?: SpellComponents;
    duration: SpellDuration[];
}
export interface SpellHtmlOptions {
    styleHint?: StyleHint | null;
    isDisplaySelfArea?: boolean;
}
export declare const getHtmlPtLevelSchoolRitual: (spell: SpellData, { styleHint }?: SpellHtmlOptions) => string;
export declare const getHtmlPtCastingTime: (spell: SpellData, { styleHint }?: SpellHtmlOptions) => string;
export declare const getHtmlPtRange: (spell: SpellData, { styleHint, isDisplaySelfArea }?: SpellHtmlOptions) => string;
export declare const getHtmlPtComponents: (spell: SpellData) => string;
export declare const getHtmlPtDuration: (spell: SpellData, { styleHint }?: SpellHtmlOptions) => string;
//# sourceMappingURL=spell.d.ts.map