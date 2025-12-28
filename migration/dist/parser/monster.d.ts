export type SizeAbbreviation = "F" | "D" | "T" | "S" | "M" | "L" | "H" | "G" | "C" | "V";
export type AlignmentAbbreviation = "L" | "N" | "NX" | "NY" | "C" | "G" | "E" | "U" | "A";
export type MonsterType = "aberration" | "beast" | "celestial" | "construct" | "dragon" | "elemental" | "fey" | "fiend" | "giant" | "humanoid" | "monstrosity" | "ooze" | "plant" | "undead";
export interface SpeedValue {
    number?: number;
    condition?: string;
}
export interface SpeedObject {
    walk?: number | SpeedValue;
    burrow?: number | SpeedValue;
    climb?: number | SpeedValue;
    fly?: number | SpeedValue;
    swim?: number | SpeedValue;
    hidden?: string[];
    alternate?: Record<string, SpeedValue[]>;
    choose?: {
        from: string[];
        amount: number;
        note?: string;
    };
    note?: string;
}
export interface AcEntry {
    ac?: number;
    from?: string[];
    condition?: string;
    braces?: boolean;
    special?: string;
}
export interface MonsterTypeTag {
    tag: string;
    prefix: string;
}
export interface MonsterTypeObject {
    type: string | {
        choose: string[];
    };
    swarmSize?: string;
    tags?: (string | MonsterTypeTag)[];
    note?: string;
    sidekickType?: string;
    sidekickTags?: (string | MonsterTypeTag)[];
    sidekickHidden?: boolean;
}
export interface MonTypeFullObj {
    types: string[];
    tags: string[];
    asText: string;
    asTextShort: string;
    typeSidekick: string | null;
    tagsSidekick: string[];
    asTextSidekick: string | null;
    swarmSize?: string;
}
export interface ImmResObject {
    immune?: ImmResValue[];
    resist?: ImmResValue[];
    vulnerable?: ImmResValue[];
    preNote?: string;
    note?: string;
}
export type ImmResValue = string | ImmResObject | {
    special: string;
};
export interface CondImmObject {
    conditionImmune: string[];
    preNote?: string;
    note?: string;
}
export type CondImmValue = string | CondImmObject | {
    special: string;
};
export interface AlignmentObject {
    alignment?: string[];
    special?: string;
    chance?: number;
    note?: string;
}
export type StyleHint = "classic" | "one" | null;
export declare const SPEED_MODES: readonly ["walk", "burrow", "climb", "fly", "swim"];
export declare const SIZE_ABV_TO_FULL: Record<string, string>;
export declare const MON_TYPE_TO_PLURAL: Record<string, string>;
export declare const ALIGNMENT_ABV_TO_FULL: Record<string, string>;
export declare const DMG_TYPES: readonly ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];
export declare const sizeAbvToFull: (abv: string) => string;
export declare const monTypeToPlural: (type: string) => string;
export declare const monTypeToFullObj: (type: string | MonsterTypeObject | null) => MonTypeFullObj;
export interface AcToFullOptions {
    renderFn?: (entry: string) => string;
    isHideFrom?: boolean;
}
export declare const acToFull: (ac: string | (number | AcEntry)[], { renderFn, isHideFrom }?: AcToFullOptions) => string;
export interface GetSpeedStringOptions {
    isMetric?: boolean;
    isSkipZeroWalk?: boolean;
    isLongForm?: boolean;
    styleHint?: StyleHint;
}
export declare const getSpeedString: (ent: {
    speed?: number | string | SpeedObject;
}, { isMetric, isSkipZeroWalk, isLongForm, styleHint, }?: GetSpeedStringOptions, renderFn?: (s: string) => string) => string;
export interface GetFullImmResOptions {
    isPlainText?: boolean;
    isTitleCase?: boolean;
}
export declare const getFullImmRes: (values: ImmResValue[] | null | undefined, options?: GetFullImmResOptions, stripTags?: (s: string) => string, renderFn?: (s: string) => string) => string;
export interface GetFullCondImmOptions {
    isPlainText?: boolean;
    isEntry?: boolean;
    isTitleCase?: boolean;
}
export declare const getFullCondImm: (condImm: CondImmValue[] | null | undefined, { isPlainText, isEntry, isTitleCase }?: GetFullCondImmOptions, renderFn?: (s: string) => string) => string;
export declare const alignmentAbvToFull: (alignment: string | AlignmentObject | null) => string | null;
export declare const alignmentListToFull: (alignList: (string | AlignmentObject)[] | null) => string;
//# sourceMappingURL=monster.d.ts.map