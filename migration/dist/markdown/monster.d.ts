import type { Monster } from "../../../types/bestiary/bestiary.js";
import type { RenderMeta, StyleHint, CompactRenderResult } from "../renderer/types.js";
import { type MarkdownRenderer } from "./renderer.js";
export interface MonsterRenderOptions {
    meta?: RenderMeta;
    isHideSenses?: boolean;
    isHideLanguages?: boolean;
    styleHint?: StyleHint;
    isAddColumnBreaks?: boolean;
}
export interface MonsterMdParts {
    mdPtName: string;
    mdPtSizeTypeAlignment: string;
    mdPtAc: string;
    mdPtHpResource: string;
    mdPtSpeedInitiative: string;
    mdPtAbilityScores: string;
    mdPtSave: string;
    mdPtSkill: string;
    mdPtTool: string;
    mdPtDamVuln: string;
    mdPtDamRes: string;
    mdPtSense: string;
    mdPtLanguage: string;
    mdPtCr: string;
    mdPtPb: string;
    mdPtBreakable: string;
}
export declare abstract class MonsterMarkdownRendererBase {
    protected abstract _style: StyleHint;
    getCompactRenderedString(mon: Monster, opts?: MonsterRenderOptions): string;
    protected abstract _getCompactRenderedString(params: {
        mon: Monster;
        opts: MonsterRenderOptions;
        meta: RenderMeta;
        renderer: MarkdownRenderer;
    }): CompactRenderResult;
    protected _getCommonMdParts(params: {
        mon: Monster;
        opts: MonsterRenderOptions;
        renderer: MarkdownRenderer;
    }): MonsterMdParts;
    protected _getCommonMdParts_name(mon: Monster): string;
    protected _getCommonMdParts_sizeTypeAlignment(mon: Monster): string;
    protected _getOrdinal(n: number): string;
    protected _getCommonMdParts_ac(mon: Monster, renderer: MarkdownRenderer): string;
    protected _getCommonMdParts_hpResource(mon: Monster): string;
    protected _getResourceString(res: any): string;
    protected _getCommonMdParts_speedInitiative(mon: Monster): string;
    protected _getInitiativeString(mon: Monster): string;
    protected _getCommonMdParts_abilityScores(mon: Monster): string;
    protected _getCommonMdParts_save(mon: Monster): string;
    protected _getCommonMdParts_skill(mon: Monster): string;
    protected _getSkillsString(mon: Monster): string;
    protected _getCommonMdParts_tool(mon: Monster): string;
    protected _getToolsString(mon: Monster): string;
    protected _getCommonMdParts_damVuln(mon: Monster): string;
    protected _getCommonMdParts_damRes(mon: Monster): string;
    protected _getCommonMdParts_sense(mon: Monster, opts: MonsterRenderOptions): string;
    protected _getSensesString(senses: any): string;
    protected _getCommonMdParts_language(mon: Monster, opts: MonsterRenderOptions): string;
    protected _getCommonMdParts_cr(mon: Monster): string;
    protected _getCommonMdParts_pb(mon: Monster): string;
    protected _getCommonMdParts_breakable(mon: Monster, opts: MonsterRenderOptions): string;
    protected _getRenderedSectionWithHeader(params: {
        mon: Monster;
        arr: any[];
        prop: string;
        title: string;
        meta: RenderMeta;
        prefix?: string;
    }): string;
    protected _getRenderedSectionHeader(params: {
        mon: Monster;
        title: string;
        prop: string;
        prefix?: string;
    }): string;
    protected _getRenderedSection(params: {
        prop: string;
        entries: any[];
        depth: number;
        meta: RenderMeta;
        prefix?: string;
    }): string;
    protected _getRenderedLegendarySection(entries: any[], depth: number, meta: RenderMeta): string;
    protected _getLegendaryIntro(mon: Monster): string;
    protected _getMythicIntro(mon: Monster): string;
}
export declare class MonsterMarkdownRendererClassic extends MonsterMarkdownRendererBase {
    protected _style: StyleHint;
    protected _getCompactRenderedString(params: {
        mon: Monster;
        opts: MonsterRenderOptions;
        meta: RenderMeta;
        renderer: MarkdownRenderer;
    }): CompactRenderResult;
    private _getMdParts_damageImmunities;
    private _getMdParts_conditionImmunities;
}
export declare class MonsterMarkdownRendererOne extends MonsterMarkdownRendererBase {
    protected _style: StyleHint;
    protected _getCompactRenderedString(params: {
        mon: Monster;
        opts: MonsterRenderOptions;
        meta: RenderMeta;
        renderer: MarkdownRenderer;
    }): CompactRenderResult;
    private _getMdParts_immunities;
    private _getMdParts_gear;
}
export declare const monsterMarkdown: {
    getCompactRenderedString(mon: Monster, opts?: MonsterRenderOptions): string;
    getSave(attr: string, mod: string): string;
    getSkillsString(mon: Monster): string;
    getToolsString(mon: Monster): string;
    getRenderedSection(params: {
        arr: any[];
        ent: Monster;
        prop: string;
        title: string;
        meta: RenderMeta;
        prefix?: string;
    }): string;
};
export type MonsterEntry = Monster;
export type MonsterMarkdownOptions = MonsterRenderOptions;
export declare const getMonsterMarkdownRenderer: (styleHint?: StyleHint) => MonsterMarkdownRendererBase;
export default monsterMarkdown;
//# sourceMappingURL=monster.d.ts.map