export declare const COLOR_HEALTHY = "#00bb20";
export declare const COLOR_HURT = "#c5ca00";
export declare const COLOR_BLOODIED = "#f7a100";
export declare const COLOR_DEFEATED = "#cc0000";
export declare const copy: <T>(obj: T, options?: {
    isSafe?: boolean;
}) => T;
export declare const copyFast: <T>(obj: T) => T;
export declare const checkProperty: (object: unknown, ...path: string[]) => boolean;
export declare const get: <T = unknown>(object: unknown, ...path: string[]) => T | undefined;
export declare const set: <T>(object: Record<string, unknown>, ...pathAndVal: [...string[], T]) => T | null;
export declare const getOrSet: <T>(object: Record<string, unknown>, ...pathAndVal: [...string[], T]) => T | null;
export declare const deleteProperty: (object: unknown, ...path: string[]) => boolean;
export declare const deleteObjectPath: (object: Record<string, unknown>, ...path: string[]) => boolean;
export declare const merge: <T extends Record<string, unknown>>(obj1: T, obj2: T) => T;
export declare const expand: <T>(obj: T) => T;
export declare const flatten: <T>(obj: T) => T;
export declare const setComposite: (obj: Record<string, unknown>, path: string, val: unknown) => unknown;
export declare const isNearStrictlyEqual: <T>(a: T, b: T) => boolean;
export declare const parseNumberRange: (input: string | null | undefined, min?: number, max?: number) => Set<number> | null;
export declare const findCommonPrefix: (strArr: string[] | null | undefined, options?: {
    isRespectWordBoundaries?: boolean;
}) => string;
export declare const findCommonSuffix: (strArr: string[] | null | undefined, options?: {
    isRespectWordBoundaries?: boolean;
}) => string;
export declare const invertColor: (hex: string, options?: {
    bw?: boolean;
    dark?: string;
    light?: string;
}) => string;
export declare const pDelay: <T = void>(msecs: number, resolveAs?: T) => Promise<T>;
type WalkerHandler<T> = (obj: T, lastKey?: string, stack?: unknown[]) => T | void;
type WalkerRunHandler<T> = (obj: T, lastKey?: string, stack?: unknown[]) => void;
export interface WalkerHandlers {
    string?: WalkerHandler<string> | WalkerHandler<string>[];
    number?: WalkerHandler<number> | WalkerHandler<number>[];
    boolean?: WalkerHandler<boolean> | WalkerHandler<boolean>[];
    null?: WalkerHandler<null> | WalkerHandler<null>[];
    undefined?: WalkerHandler<undefined> | WalkerHandler<undefined>[];
    object?: WalkerHandler<Record<string, unknown>> | WalkerHandler<Record<string, unknown>>[];
    array?: WalkerHandler<unknown[]> | WalkerHandler<unknown[]>[];
    preString?: WalkerRunHandler<string> | WalkerRunHandler<string>[];
    postString?: WalkerRunHandler<string> | WalkerRunHandler<string>[];
    preNumber?: WalkerRunHandler<number> | WalkerRunHandler<number>[];
    postNumber?: WalkerRunHandler<number> | WalkerRunHandler<number>[];
    preBoolean?: WalkerRunHandler<boolean> | WalkerRunHandler<boolean>[];
    postBoolean?: WalkerRunHandler<boolean> | WalkerRunHandler<boolean>[];
    preNull?: WalkerRunHandler<null> | WalkerRunHandler<null>[];
    postNull?: WalkerRunHandler<null> | WalkerRunHandler<null>[];
    preUndefined?: WalkerRunHandler<undefined> | WalkerRunHandler<undefined>[];
    postUndefined?: WalkerRunHandler<undefined> | WalkerRunHandler<undefined>[];
    preObject?: WalkerRunHandler<Record<string, unknown>> | WalkerRunHandler<Record<string, unknown>>[];
    postObject?: WalkerRunHandler<Record<string, unknown>> | WalkerRunHandler<Record<string, unknown>>[];
    preArray?: WalkerRunHandler<unknown[]> | WalkerRunHandler<unknown[]>[];
    postArray?: WalkerRunHandler<unknown[]> | WalkerRunHandler<unknown[]>[];
}
export interface WalkerOptions {
    keyBlocklist?: Set<string>;
    isAllowDeleteObjects?: boolean;
    isAllowDeleteArrays?: boolean;
    isDepthFirst?: boolean;
    isNoModification?: boolean;
    isBreakOnReturn?: boolean;
}
declare const SYM_WALKER_BREAK: unique symbol;
export declare const getWalker: (opts?: WalkerOptions) => {
    walk: <T>(obj: T, handlers: WalkerHandlers, lastKey?: string, stack?: unknown[]) => T | typeof SYM_WALKER_BREAK;
};
export declare const GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST: Set<string>;
export {};
//# sourceMappingURL=misc-util.d.ts.map