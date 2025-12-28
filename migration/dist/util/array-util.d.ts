/**
 * Array Utility Functions - Pure TypeScript implementation
 * No prototype pollution, all pure functions
 */
/**
 * Get the last element of an array
 */
export declare const last: <T>(arr: T[]) => T | undefined;
/**
 * Get the first element of an array
 */
export declare const first: <T>(arr: T[]) => T | undefined;
/**
 * Join array elements with a conjunction (e.g., "a, b, and c")
 */
export declare const joinConjunct: (arr: string[], joiner: string, lastJoiner: string, nonOxford?: boolean) => string;
/**
 * Get indices of elements that pass a predicate
 */
export declare const filterIndex: <T>(arr: T[], fnCheck: (item: T) => boolean) => number[];
/**
 * Check if two arrays are equal (same elements, any order)
 */
export declare const equals: <T>(arr1: T[], arr2: T[]) => boolean;
/**
 * Partition array into two arrays based on predicate
 */
export declare const segregate: <T>(arr: T[], fnIsValid: (item: T) => boolean) => [T[], T[]];
export declare const partition: <T>(arr: T[], fnIsValid: (item: T) => boolean) => [T[], T[]];
/**
 * Get next element after current value (wraps around)
 */
export declare const getNext: <T>(arr: T[], curVal: T) => T;
/**
 * Get previous element before current value (wraps around)
 */
export declare const getPrevious: <T>(arr: T[], curVal: T) => T;
/**
 * Fisher-Yates shuffle (in-place)
 */
export declare const shuffle: <T>(arr: T[]) => T[];
/**
 * Shuffle array (returns new array, doesn't mutate original)
 */
export declare const shuffled: <T>(arr: T[]) => T[];
/**
 * Map each array item to k:v pair, flatten into one object
 */
export declare const mergeMap: <T, R extends object>(arr: T[], fnMap: (item: T, index: number, array: T[]) => R | null | undefined) => R;
/**
 * Find first mapped result that is truthy
 */
export declare const findMapped: <T, R>(arr: T[], fnMapFind: (item: T, index: number, array: T[]) => R | undefined) => R | undefined;
/**
 * Remove duplicates from array
 */
export declare function unique<T>(arr: T[]): T[];
export declare function unique<T, K>(arr: T[], fnGetProp: (item: T, index: number, array: T[]) => K): T[];
/**
 * Zip two arrays together
 */
export declare const zip: <T, U>(arr1: T[], arr2: U[]) => [T | undefined, U | undefined][];
/**
 * Get next element, wrapping to start if at end
 */
export declare const nextWrap: <T>(arr: T[], item: T) => T | undefined;
/**
 * Get previous element, wrapping to end if at start
 */
export declare const prevWrap: <T>(arr: T[], item: T) => T | undefined;
/**
 * Sum all numeric elements
 */
export declare const sum: (arr: number[]) => number;
/**
 * Calculate mean of numeric array
 */
export declare const mean: (arr: number[]) => number;
/**
 * Calculate mean absolute deviation
 */
export declare const meanAbsoluteDeviation: (arr: number[]) => number;
/**
 * Parallel map with promises
 */
export declare const pMap: <T, R>(arr: T[], fnMap: (item: T, index: number, array: T[]) => Promise<R>) => Promise<R[]>;
/**
 * Serial async map
 */
export declare const pSerialAwaitMap: <T, R>(arr: T[], fnMap: (item: T, index: number, array: T[]) => Promise<R>) => Promise<R[]>;
/**
 * Serial async filter
 */
export declare const pSerialAwaitFilter: <T>(arr: T[], fnFilter: (item: T, index: number, array: T[]) => Promise<boolean>) => Promise<T[]>;
/**
 * Serial async find
 */
export declare const pSerialAwaitFind: <T>(arr: T[], fnFind: (item: T, index: number, array: T[]) => Promise<boolean>) => Promise<T | undefined>;
/**
 * Serial async some
 */
export declare const pSerialAwaitSome: <T>(arr: T[], fnSome: (item: T, index: number, array: T[]) => Promise<boolean>) => Promise<boolean>;
/**
 * Serial async first mapped result
 */
export declare const pSerialAwaitFirst: <T, R>(arr: T[], fnMapFind: (item: T, index: number, array: T[]) => Promise<R | undefined>) => Promise<R | undefined>;
/**
 * Serial async reduce
 */
export declare const pSerialAwaitReduce: <T, R>(arr: T[], fnReduce: (accumulator: R, item: T, index: number, array: T[]) => Promise<R>, initialValue: R) => Promise<R>;
//# sourceMappingURL=array-util.d.ts.map