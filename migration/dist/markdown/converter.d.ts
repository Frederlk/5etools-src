import type { Entry, EntryTable } from "../../../types/entry.js";
export interface ConvertedEntry extends Record<string, unknown> {
    type?: string;
    name?: string;
    entries?: Entry[];
}
export interface TablePostProcessOptions {
    tableWidth?: number;
    diceColWidth?: number;
}
interface EntryChildMeta {
    type: string;
    key: string;
    depth?: number;
    depthIncrement?: number;
}
declare const ENTRIES_WITH_ENUMERATED_TITLES: EntryChildMeta[];
declare const ENTRIES_WITH_CHILDREN: EntryChildMeta[];
export declare class MarkdownConverter {
    static getEntries(mdStr: string): Entry[];
    private static _getCleanGmBinder;
    private static _coalesceCreatures;
    private static _convertCreatures;
    private static _coalesceInsetsReadalouds;
    private static _coalesceInsets_isReadaloudLine;
    private static _coalesceInsets_isInsetLine;
    private static _convertInsetsReadalouds;
    private static _coalesce_getLastH5Index;
    private static _coalesceTables;
    private static _coalesceTables_isTableLine;
    private static _convertTables;
    private static _coalesceLists;
    private static _coalesceLists_isListItem;
    private static _convertLists;
    private static _convertLists_doNormalise;
    private static _coalesceHeaders;
    private static _coalesceHeaders_getStackDepth;
    private static _coalesceHeaders_addBlock;
    private static _coalesceHeaders_getRoot;
    private static _coalesceHeaders_handleEqual;
    private static _coalesceHeaders_handleTooShallow;
    private static _coalesceHeaders_handleTooDeep;
    private static _convertInlineStyling;
    private static _cleanEmptyLines;
    private static _cleanEntries;
    private static _coalesceConvert_doRecurse;
    static getConvertedTable(lines: string[], caption?: string): EntryTable;
    static postProcessTable(tbl: EntryTable, opts?: TablePostProcessOptions): void;
    private static _postProcessTableInternal;
    private static _doCleanTableInternal;
}
export declare const getEntries: (mdStr: string) => Entry[];
export declare const getConvertedTable: (lines: string[], caption?: string) => EntryTable;
export declare const postProcessTable: (tbl: EntryTable, opts?: TablePostProcessOptions) => void;
export { ENTRIES_WITH_CHILDREN, ENTRIES_WITH_ENUMERATED_TITLES };
//# sourceMappingURL=converter.d.ts.map