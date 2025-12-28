export type StyleHint = "classic" | "one" | null;
export type SpellSchoolAbbreviation = "A" | "V" | "E" | "I" | "D" | "N" | "T" | "C" | "P";
export type SpellTimeUnit = "action" | "bonus" | "reaction" | "round" | "minute" | "hour" | "ritual" | "special";
export interface SpellTime {
    number: number;
    unit: SpellTimeUnit;
    condition?: string;
    note?: string;
}
export interface SpellMeta {
    ritual?: boolean;
    concentration?: boolean;
    [key: string]: boolean | undefined;
}
export type SpellRangeType = "special" | "point" | "line" | "cube" | "cone" | "emanation" | "radius" | "sphere" | "hemisphere" | "cylinder";
export type SpellDistanceType = "self" | "touch" | "sight" | "unlimited" | "plane" | "feet" | "miles" | "yards" | "inches" | "special";
export interface SpellRange {
    type: SpellRangeType;
    distance: {
        type: SpellDistanceType;
        amount?: number;
        amountSecondary?: number;
        typeSecondary?: string;
    };
}
export interface SpellComponents {
    v?: boolean;
    s?: boolean;
    m?: boolean | string | {
        text: string;
        cost?: number;
        consume?: boolean | string;
    };
    r?: boolean;
}
export type SpellDurationType = "instant" | "timed" | "permanent" | "special";
export interface SpellDuration {
    type: SpellDurationType;
    concentration?: boolean;
    condition?: string;
    duration?: {
        amount: number;
        type: string;
        upTo?: boolean;
    };
    ends?: ("dispel" | "trigger" | "discharge")[];
}
export declare const SP_SCHOOL_ABV_TO_FULL: Record<string, string>;
export declare const SP_SCHOOL_ABV_TO_SHORT: Record<string, string>;
export declare const SP_TM_ACTION = "action";
export declare const SP_TM_B_ACTION = "bonus";
export declare const SP_TM_REACTION = "reaction";
export declare const SP_TM_ROUND = "round";
export declare const SP_TM_MINS = "minute";
export declare const SP_TM_HRS = "hour";
export declare const SP_TM_SPECIAL = "special";
export declare const SP_TIME_SINGLETONS: readonly ["action", "bonus", "reaction", "round"];
export declare const SP_TIME_TO_FULL: Record<string, string>;
export declare const SP_TIME_TO_ABV: Record<string, string>;
export declare const RNG_SPECIAL = "special";
export declare const RNG_POINT = "point";
export declare const RNG_LINE = "line";
export declare const RNG_CUBE = "cube";
export declare const RNG_CONE = "cone";
export declare const RNG_EMANATION = "emanation";
export declare const RNG_RADIUS = "radius";
export declare const RNG_SPHERE = "sphere";
export declare const RNG_HEMISPHERE = "hemisphere";
export declare const RNG_CYLINDER = "cylinder";
export declare const RNG_SELF = "self";
export declare const RNG_SIGHT = "sight";
export declare const RNG_UNLIMITED = "unlimited";
export declare const RNG_UNLIMITED_SAME_PLANE = "plane";
export declare const RNG_TOUCH = "touch";
export declare const UNT_INCHES = "inches";
export declare const UNT_FEET = "feet";
export declare const UNT_YARDS = "yards";
export declare const UNT_MILES = "miles";
export declare const SP_RANGE_TYPE_TO_FULL: Record<string, string>;
export declare const SP_END_TYPE_TO_FULL: Record<string, string>;
export declare const DURATION_TYPES: readonly [{
    readonly type: "instant";
    readonly full: "Instantaneous";
}, {
    readonly type: "timed";
    readonly hasAmount: true;
}, {
    readonly type: "permanent";
    readonly hasEnds: true;
}, {
    readonly type: "special";
}];
export declare const DURATION_AMOUNT_TYPES: readonly ["turn", "round", "minute", "hour", "day", "week", "month", "year"];
export declare const getOrdinalForm: (i: number | string) => string;
export declare const spLevelToFull: (level: number) => string;
export declare const spSchoolAbvToFull: (schoolOrSubschool: string) => string;
export declare const spSchoolAbvToShort: (schoolOrSubschool: string) => string;
export declare const spRangeTypeToFull: (type: string) => string;
export declare const spEndTypeToFull: (type: string) => string;
export declare const getSingletonUnit: (unit: string, isShort?: boolean) => string;
export declare const spMetaToArr: (meta: SpellMeta | undefined, { styleHint }?: {
    styleHint?: StyleHint;
}) => string[];
export interface SpLevelSchoolMetaToFullOptions {
    styleHint?: StyleHint;
}
export declare const spLevelSchoolMetaToFull: (level: number, school: string, meta?: SpellMeta, subschools?: string[], { styleHint }?: SpLevelSchoolMetaToFullOptions) => string;
export declare const getTimeToFull: (time: SpellTime, { styleHint }?: {
    styleHint?: StyleHint;
}) => string;
export interface SpTimeListToFullOptions {
    isStripTags?: boolean;
    styleHint?: StyleHint;
}
export declare const spTimeListToFull: (times: SpellTime[], meta?: SpellMeta, { isStripTags, styleHint }?: SpTimeListToFullOptions, stripTags?: (s: string) => string, renderFn?: (s: string) => string) => string;
export interface SpRangeToFullOptions {
    styleHint?: StyleHint;
    isDisplaySelfArea?: boolean;
}
export declare const spRangeToFull: (range: SpellRange, { styleHint, isDisplaySelfArea }?: SpRangeToFullOptions) => string;
export interface SpComponentsToFullOptions {
    isPlainText?: boolean;
}
export declare const spComponentsToFull: (comp: SpellComponents | undefined, level: number, { isPlainText }?: SpComponentsToFullOptions, stripTags?: (s: string) => string, renderFn?: (s: string) => string) => string;
export interface SpDurationToFullOptions {
    isPlainText?: boolean;
    styleHint?: StyleHint;
}
export declare const spDurationToFull: (durations: SpellDuration[], { isPlainText, styleHint }?: SpDurationToFullOptions, stripTags?: (s: string) => string, renderFn?: (s: string) => string) => string;
//# sourceMappingURL=spell.d.ts.map