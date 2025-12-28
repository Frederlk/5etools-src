/**
 * Array Utility Functions - Pure TypeScript implementation
 * No prototype pollution, all pure functions
 */

/**
 * Get the last element of an array
 */
export const last = <T>(arr: T[]): T | undefined => {
	return arr[arr.length - 1];
};

/**
 * Get the first element of an array
 */
export const first = <T>(arr: T[]): T | undefined => {
	return arr[0];
};

/**
 * Join array elements with a conjunction (e.g., "a, b, and c")
 */
export const joinConjunct = (
	arr: string[],
	joiner: string,
	lastJoiner: string,
	nonOxford = false,
): string => {
	if (arr.length === 0) return "";
	if (arr.length === 1) return arr[0];
	if (arr.length === 2) return arr.join(lastJoiner);

	let outStr = "";
	for (let i = 0; i < arr.length; ++i) {
		outStr += arr[i];
		if (i < arr.length - 2) {
			outStr += joiner;
		} else if (i === arr.length - 2) {
			outStr += `${(!nonOxford && arr.length > 2 ? joiner.trim() : "")}${lastJoiner}`;
		}
	}
	return outStr;
};

/**
 * Get indices of elements that pass a predicate
 */
export const filterIndex = <T>(arr: T[], fnCheck: (item: T) => boolean): number[] => {
	const out: number[] = [];
	arr.forEach((it, i) => {
		if (fnCheck(it)) out.push(i);
	});
	return out;
};

/**
 * Check if two arrays are equal (same elements, any order)
 */
export const equals = <T>(arr1: T[], arr2: T[]): boolean => {
	if (!arr1 && !arr2) return true;
	if ((!arr1 && arr2) || (arr1 && !arr2)) return false;
	if (!arr1[0] || !arr2[0]) return false;
	if (arr1.length !== arr2.length) return false;

	const temp: Record<string, number> = {};
	for (let i = 0; i < arr1.length; i++) {
		const key = `${typeof arr1[i]}~${arr1[i]}`;
		temp[key] = (temp[key] || 0) + 1;
	}

	for (let i = 0; i < arr2.length; i++) {
		const key = `${typeof arr2[i]}~${arr2[i]}`;
		if (temp[key]) {
			if (temp[key] === 0) return false;
			temp[key]--;
		} else {
			return false;
		}
	}
	return true;
};

/**
 * Partition array into two arrays based on predicate
 */
export const segregate = <T>(arr: T[], fnIsValid: (item: T) => boolean): [T[], T[]] => {
	return arr.reduce<[T[], T[]]>(
		([pass, fail], elem) => fnIsValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]],
		[[], []],
	);
};

export const partition = segregate;

/**
 * Get next element after current value (wraps around)
 */
export const getNext = <T>(arr: T[], curVal: T): T => {
	let ix = arr.indexOf(curVal);
	if (!~ix) throw new Error("Value was not in array!");
	if (++ix >= arr.length) ix = 0;
	return arr[ix];
};

/**
 * Get previous element before current value (wraps around)
 */
export const getPrevious = <T>(arr: T[], curVal: T): T => {
	let ix = arr.indexOf(curVal);
	if (!~ix) throw new Error("Value was not in array!");
	if (--ix < 0) ix = arr.length - 1;
	return arr[ix];
};

/**
 * Fisher-Yates shuffle (in-place)
 */
export const shuffle = <T>(arr: T[]): T[] => {
	const len = arr.length;
	const ixLast = len - 1;
	for (let i = 0; i < len; ++i) {
		const j = i + Math.floor(Math.random() * (ixLast - i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
};

/**
 * Shuffle array (returns new array, doesn't mutate original)
 */
export const shuffled = <T>(arr: T[]): T[] => {
	return shuffle([...arr]);
};

/**
 * Map each array item to k:v pair, flatten into one object
 */
export const mergeMap = <T, R extends object>(
	arr: T[],
	fnMap: (item: T, index: number, array: T[]) => R | null | undefined,
): R => {
	return arr
		.map((item, index, array) => fnMap(item, index, array))
		.filter((it): it is R => it != null)
		.reduce((a, b) => Object.assign(a, b), {} as R);
};

/**
 * Find first mapped result that is truthy
 */
export const findMapped = <T, R>(
	arr: T[],
	fnMapFind: (item: T, index: number, array: T[]) => R | undefined,
): R | undefined => {
	for (let i = 0, len = arr.length; i < len; ++i) {
		const result = fnMapFind(arr[i], i, arr);
		if (result) return result;
	}
	return undefined;
};

/**
 * Remove duplicates from array
 */
export function unique<T>(arr: T[]): T[];
export function unique<T, K>(arr: T[], fnGetProp: (item: T, index: number, array: T[]) => K): T[];
export function unique<T, K = T>(arr: T[], fnGetProp?: (item: T, index: number, array: T[]) => K): T[] {
	const seen = new Set<T | K>();
	return arr.filter((item, index, array) => {
		const val = fnGetProp ? fnGetProp(item, index, array) : item;
		if (seen.has(val)) return false;
		seen.add(val);
		return true;
	});
}

/**
 * Zip two arrays together
 */
export const zip = <T, U>(arr1: T[], arr2: U[]): [T | undefined, U | undefined][] => {
	const out: [T | undefined, U | undefined][] = [];
	const len = Math.max(arr1.length, arr2.length);
	for (let i = 0; i < len; ++i) {
		out.push([arr1[i], arr2[i]]);
	}
	return out;
};

/**
 * Get next element, wrapping to start if at end
 */
export const nextWrap = <T>(arr: T[], item: T): T | undefined => {
	const ix = arr.indexOf(item);
	if (~ix) {
		if (ix + 1 < arr.length) return arr[ix + 1];
		return arr[0];
	}
	return arr[arr.length - 1];
};

/**
 * Get previous element, wrapping to end if at start
 */
export const prevWrap = <T>(arr: T[], item: T): T | undefined => {
	const ix = arr.indexOf(item);
	if (~ix) {
		if (ix - 1 >= 0) return arr[ix - 1];
		return arr[ix - 1 >= 0 ? ix - 1 : arr.length - 1];
	}
	return arr[0];
};

/**
 * Sum all numeric elements
 */
export const sum = (arr: number[]): number => {
	let tmp = 0;
	for (let i = 0, len = arr.length; i < len; ++i) {
		tmp += arr[i];
	}
	return tmp;
};

/**
 * Calculate mean of numeric array
 */
export const mean = (arr: number[]): number => {
	return sum(arr) / arr.length;
};

/**
 * Calculate mean absolute deviation
 */
export const meanAbsoluteDeviation = (arr: number[]): number => {
	const m = mean(arr);
	return mean(arr.map(num => Math.abs(num - m)));
};

// Async array operations

/**
 * Parallel map with promises
 */
export const pMap = async <T, R>(
	arr: T[],
	fnMap: (item: T, index: number, array: T[]) => Promise<R>,
): Promise<R[]> => {
	return Promise.all(arr.map((it, i, a) => fnMap(it, i, a)));
};

/**
 * Serial async map
 */
export const pSerialAwaitMap = async <T, R>(
	arr: T[],
	fnMap: (item: T, index: number, array: T[]) => Promise<R>,
): Promise<R[]> => {
	const out: R[] = [];
	for (let i = 0, len = arr.length; i < len; ++i) {
		out.push(await fnMap(arr[i], i, arr));
	}
	return out;
};

/**
 * Serial async filter
 */
export const pSerialAwaitFilter = async <T>(
	arr: T[],
	fnFilter: (item: T, index: number, array: T[]) => Promise<boolean>,
): Promise<T[]> => {
	const out: T[] = [];
	for (let i = 0, len = arr.length; i < len; ++i) {
		if (await fnFilter(arr[i], i, arr)) out.push(arr[i]);
	}
	return out;
};

/**
 * Serial async find
 */
export const pSerialAwaitFind = async <T>(
	arr: T[],
	fnFind: (item: T, index: number, array: T[]) => Promise<boolean>,
): Promise<T | undefined> => {
	for (let i = 0, len = arr.length; i < len; ++i) {
		if (await fnFind(arr[i], i, arr)) return arr[i];
	}
	return undefined;
};

/**
 * Serial async some
 */
export const pSerialAwaitSome = async <T>(
	arr: T[],
	fnSome: (item: T, index: number, array: T[]) => Promise<boolean>,
): Promise<boolean> => {
	for (let i = 0, len = arr.length; i < len; ++i) {
		if (await fnSome(arr[i], i, arr)) return true;
	}
	return false;
};

/**
 * Serial async first mapped result
 */
export const pSerialAwaitFirst = async <T, R>(
	arr: T[],
	fnMapFind: (item: T, index: number, array: T[]) => Promise<R | undefined>,
): Promise<R | undefined> => {
	for (let i = 0, len = arr.length; i < len; ++i) {
		const result = await fnMapFind(arr[i], i, arr);
		if (result) return result;
	}
	return undefined;
};

/**
 * Serial async reduce
 */
export const pSerialAwaitReduce = async <T, R>(
	arr: T[],
	fnReduce: (accumulator: R, item: T, index: number, array: T[]) => Promise<R>,
	initialValue: R,
): Promise<R> => {
	let accumulator = initialValue;
	for (let i = 0, len = arr.length; i < len; ++i) {
		accumulator = await fnReduce(accumulator, arr[i], i, arr);
	}
	return accumulator;
};
