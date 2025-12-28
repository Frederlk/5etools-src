/**
 * Array Utility Functions - Pure TypeScript implementation
 * No prototype pollution, all pure functions
 */
/**
 * Get the last element of an array
 */
export const last = (arr) => {
    return arr[arr.length - 1];
};
/**
 * Get the first element of an array
 */
export const first = (arr) => {
    return arr[0];
};
/**
 * Join array elements with a conjunction (e.g., "a, b, and c")
 */
export const joinConjunct = (arr, joiner, lastJoiner, nonOxford = false) => {
    if (arr.length === 0)
        return "";
    if (arr.length === 1)
        return arr[0];
    if (arr.length === 2)
        return arr.join(lastJoiner);
    let outStr = "";
    for (let i = 0; i < arr.length; ++i) {
        outStr += arr[i];
        if (i < arr.length - 2) {
            outStr += joiner;
        }
        else if (i === arr.length - 2) {
            outStr += `${(!nonOxford && arr.length > 2 ? joiner.trim() : "")}${lastJoiner}`;
        }
    }
    return outStr;
};
/**
 * Get indices of elements that pass a predicate
 */
export const filterIndex = (arr, fnCheck) => {
    const out = [];
    arr.forEach((it, i) => {
        if (fnCheck(it))
            out.push(i);
    });
    return out;
};
/**
 * Check if two arrays are equal (same elements, any order)
 */
export const equals = (arr1, arr2) => {
    if (!arr1 && !arr2)
        return true;
    if ((!arr1 && arr2) || (arr1 && !arr2))
        return false;
    if (!arr1[0] || !arr2[0])
        return false;
    if (arr1.length !== arr2.length)
        return false;
    const temp = {};
    for (let i = 0; i < arr1.length; i++) {
        const key = `${typeof arr1[i]}~${arr1[i]}`;
        temp[key] = (temp[key] || 0) + 1;
    }
    for (let i = 0; i < arr2.length; i++) {
        const key = `${typeof arr2[i]}~${arr2[i]}`;
        if (temp[key]) {
            if (temp[key] === 0)
                return false;
            temp[key]--;
        }
        else {
            return false;
        }
    }
    return true;
};
/**
 * Partition array into two arrays based on predicate
 */
export const segregate = (arr, fnIsValid) => {
    return arr.reduce(([pass, fail], elem) => fnIsValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]], [[], []]);
};
export const partition = segregate;
/**
 * Get next element after current value (wraps around)
 */
export const getNext = (arr, curVal) => {
    let ix = arr.indexOf(curVal);
    if (!~ix)
        throw new Error("Value was not in array!");
    if (++ix >= arr.length)
        ix = 0;
    return arr[ix];
};
/**
 * Get previous element before current value (wraps around)
 */
export const getPrevious = (arr, curVal) => {
    let ix = arr.indexOf(curVal);
    if (!~ix)
        throw new Error("Value was not in array!");
    if (--ix < 0)
        ix = arr.length - 1;
    return arr[ix];
};
/**
 * Fisher-Yates shuffle (in-place)
 */
export const shuffle = (arr) => {
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
export const shuffled = (arr) => {
    return shuffle([...arr]);
};
/**
 * Map each array item to k:v pair, flatten into one object
 */
export const mergeMap = (arr, fnMap) => {
    return arr
        .map((item, index, array) => fnMap(item, index, array))
        .filter((it) => it != null)
        .reduce((a, b) => Object.assign(a, b), {});
};
/**
 * Find first mapped result that is truthy
 */
export const findMapped = (arr, fnMapFind) => {
    for (let i = 0, len = arr.length; i < len; ++i) {
        const result = fnMapFind(arr[i], i, arr);
        if (result)
            return result;
    }
    return undefined;
};
/**
 * Remove duplicates from array
 */
export const unique = (arr, fnGetProp) => {
    const seen = new Set();
    return arr.filter((item, index, array) => {
        const val = fnGetProp ? fnGetProp(item, index, array) : item;
        if (seen.has(val))
            return false;
        seen.add(val);
        return true;
    });
};
/**
 * Zip two arrays together
 */
export const zip = (arr1, arr2) => {
    const out = [];
    const len = Math.max(arr1.length, arr2.length);
    for (let i = 0; i < len; ++i) {
        out.push([arr1[i], arr2[i]]);
    }
    return out;
};
/**
 * Get next element, wrapping to start if at end
 */
export const nextWrap = (arr, item) => {
    const ix = arr.indexOf(item);
    if (~ix) {
        if (ix + 1 < arr.length)
            return arr[ix + 1];
        return arr[0];
    }
    return arr[arr.length - 1];
};
/**
 * Get previous element, wrapping to end if at start
 */
export const prevWrap = (arr, item) => {
    const ix = arr.indexOf(item);
    if (~ix) {
        if (ix - 1 >= 0)
            return arr[ix - 1];
        return arr[ix - 1 >= 0 ? ix - 1 : arr.length - 1];
    }
    return arr[0];
};
/**
 * Sum all numeric elements
 */
export const sum = (arr) => {
    let tmp = 0;
    for (let i = 0, len = arr.length; i < len; ++i) {
        tmp += arr[i];
    }
    return tmp;
};
/**
 * Calculate mean of numeric array
 */
export const mean = (arr) => {
    return sum(arr) / arr.length;
};
/**
 * Calculate mean absolute deviation
 */
export const meanAbsoluteDeviation = (arr) => {
    const m = mean(arr);
    return mean(arr.map(num => Math.abs(num - m)));
};
// Async array operations
/**
 * Parallel map with promises
 */
export const pMap = async (arr, fnMap) => {
    return Promise.all(arr.map((it, i, a) => fnMap(it, i, a)));
};
/**
 * Serial async map
 */
export const pSerialAwaitMap = async (arr, fnMap) => {
    const out = [];
    for (let i = 0, len = arr.length; i < len; ++i) {
        out.push(await fnMap(arr[i], i, arr));
    }
    return out;
};
/**
 * Serial async filter
 */
export const pSerialAwaitFilter = async (arr, fnFilter) => {
    const out = [];
    for (let i = 0, len = arr.length; i < len; ++i) {
        if (await fnFilter(arr[i], i, arr))
            out.push(arr[i]);
    }
    return out;
};
/**
 * Serial async find
 */
export const pSerialAwaitFind = async (arr, fnFind) => {
    for (let i = 0, len = arr.length; i < len; ++i) {
        if (await fnFind(arr[i], i, arr))
            return arr[i];
    }
    return undefined;
};
/**
 * Serial async some
 */
export const pSerialAwaitSome = async (arr, fnSome) => {
    for (let i = 0, len = arr.length; i < len; ++i) {
        if (await fnSome(arr[i], i, arr))
            return true;
    }
    return false;
};
/**
 * Serial async first mapped result
 */
export const pSerialAwaitFirst = async (arr, fnMapFind) => {
    for (let i = 0, len = arr.length; i < len; ++i) {
        const result = await fnMapFind(arr[i], i, arr);
        if (result)
            return result;
    }
    return undefined;
};
/**
 * Serial async reduce
 */
export const pSerialAwaitReduce = async (arr, fnReduce, initialValue) => {
    let accumulator = initialValue;
    for (let i = 0, len = arr.length; i < len; ++i) {
        accumulator = await fnReduce(accumulator, arr[i], i, arr);
    }
    return accumulator;
};
//# sourceMappingURL=array-util.js.map