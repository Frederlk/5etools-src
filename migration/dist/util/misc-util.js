// Misc Utility Functions - Pure TypeScript implementation
// ============ Color Constants ============
export const COLOR_HEALTHY = "#00bb20";
export const COLOR_HURT = "#c5ca00";
export const COLOR_BLOODIED = "#f7a100";
export const COLOR_DEFEATED = "#cc0000";
// ============ Object Copy Functions ============
export const copy = (obj, options = {}) => {
    if (options.isSafe && obj === undefined)
        return undefined;
    return JSON.parse(JSON.stringify(obj));
};
export const copyFast = (obj) => {
    if (typeof obj !== "object" || obj == null)
        return obj;
    if (Array.isArray(obj))
        return obj.map(copyFast);
    const cpy = {};
    for (const k of Object.keys(obj)) {
        cpy[k] = copyFast(obj[k]);
    }
    return cpy;
};
// ============ Property Access Functions ============
export const checkProperty = (object, ...path) => {
    let current = object;
    for (const key of path) {
        if (current == null)
            return false;
        current = current[key];
    }
    return current != null;
};
export const get = (object, ...path) => {
    let current = object;
    if (current == null)
        return undefined;
    for (const key of path) {
        current = current[key];
        if (current == null)
            return undefined;
    }
    return current;
};
export const set = (object, ...pathAndVal) => {
    if (object == null)
        return null;
    const val = pathAndVal.pop();
    const path = pathAndVal;
    if (!path.length)
        return null;
    let current = object;
    for (let i = 0; i < path.length; ++i) {
        const key = path[i];
        if (i === path.length - 1) {
            current[key] = val;
        }
        else {
            current = (current[key] = current[key] || {});
        }
    }
    return val;
};
export const getOrSet = (object, ...pathAndVal) => {
    if (pathAndVal.length < 2)
        return null;
    const existing = get(object, ...pathAndVal.slice(0, -1));
    if (existing != null)
        return existing;
    return set(object, ...pathAndVal);
};
export const deleteProperty = (object, ...path) => {
    let current = object;
    if (current == null)
        return false;
    for (let i = 0; i < path.length - 1; ++i) {
        current = current[path[i]];
        if (current == null)
            return false;
    }
    return delete current[path[path.length - 1]];
};
export const deleteObjectPath = (object, ...path) => {
    const stack = [object];
    let current = object;
    for (let i = 0; i < path.length - 1; ++i) {
        current = current[path[i]];
        if (current === undefined)
            return false;
        stack.push(current);
    }
    const result = delete current[path[path.length - 1]];
    for (let i = path.length - 1; i > 0; --i) {
        if (!Object.keys(stack[i]).length) {
            delete stack[i - 1][path[i - 1]];
        }
    }
    return result;
};
// ============ Object Merge/Transform Functions ============
export const merge = (obj1, obj2) => {
    const obj2Copy = copyFast(obj2);
    for (const [k, v] of Object.entries(obj2Copy)) {
        if (obj1[k] == null) {
            obj1[k] = v;
            continue;
        }
        if (typeof obj1[k] === "object" &&
            typeof v === "object" &&
            !Array.isArray(obj1[k]) &&
            !Array.isArray(v)) {
            merge(obj1[k], v);
            continue;
        }
        obj1[k] = v;
    }
    return obj1;
};
export const expand = (obj) => {
    if (!obj)
        return obj;
    if (Array.isArray(obj))
        return obj.map(it => expand(it));
    if (typeof obj !== "object")
        return obj;
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        setComposite(out, k, expand(v));
    }
    return out;
};
export const flatten = (obj) => {
    if (!obj)
        return obj;
    if (Array.isArray(obj))
        return obj.map(it => flatten(it));
    if (typeof obj !== "object")
        return obj;
    if (!Object.keys(obj).length)
        return obj;
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v == null || typeof v !== "object" || !Object.keys(v).length) {
            out[k] = v;
            continue;
        }
        if (Array.isArray(v)) {
            out[k] = v.map(it => flatten(it));
            continue;
        }
        for (const [k2, v2] of Object.entries(flatten(v))) {
            out[k + "." + k2] = v2;
        }
    }
    return out;
};
export const setComposite = (obj, path, val) => {
    if (!path)
        return val;
    const parts = path.split(".");
    return set(obj, ...parts, val);
};
// ============ Comparison Functions ============
export const isNearStrictlyEqual = (a, b) => {
    if (a == null && b == null)
        return true;
    if (a == null && b != null)
        return false;
    if (a != null && b == null)
        return false;
    return a === b;
};
// ============ Parsing Functions ============
export const parseNumberRange = (input, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) => {
    if (!input?.trim())
        return null;
    const errInvalid = (inp) => {
        throw new Error(`Could not parse range input "${inp}"`);
    };
    const errOutOfRange = () => {
        throw new Error(`Number was out of range! Range was ${min}-${max} (inclusive).`);
    };
    const isOutOfRange = (num) => num < min || num > max;
    const clean = input.replace(/\s*/g, "");
    if (!/^((\d+-\d+|\d+),)*(\d+-\d+|\d+)$/.test(clean))
        errInvalid(input);
    const parts = clean.split(",");
    const out = new Set();
    for (const part of parts) {
        if (part.includes("-")) {
            const spl = part.split("-");
            const numLo = Number(spl[0]);
            const numHi = Number(spl[1]);
            if (isNaN(numLo) || isNaN(numHi) || numLo === 0 || numHi === 0 || numLo > numHi) {
                errInvalid(input);
            }
            if (isOutOfRange(numLo) || isOutOfRange(numHi))
                errOutOfRange();
            for (let i = numLo; i <= numHi; ++i)
                out.add(i);
            continue;
        }
        const num = Number(part);
        if (isNaN(num) || num === 0)
            errInvalid(input);
        if (isOutOfRange(num))
            errOutOfRange();
        out.add(num);
    }
    return out;
};
// ============ String Functions ============
export const findCommonPrefix = (strArr, options = {}) => {
    if (!strArr?.length)
        return "";
    if (options.isRespectWordBoundaries) {
        return findCommonPrefixSuffixWords(strArr, false);
    }
    let prefix = null;
    for (const s of strArr) {
        if (prefix == null) {
            prefix = s;
            continue;
        }
        const minLen = Math.min(s.length, prefix.length);
        for (let i = 0; i < minLen; ++i) {
            if (prefix[i] !== s[i]) {
                prefix = prefix.substring(0, i);
                break;
            }
        }
    }
    return prefix ?? "";
};
export const findCommonSuffix = (strArr, options = {}) => {
    if (!options.isRespectWordBoundaries) {
        throw new Error("Non-word-boundary suffix finding is not implemented");
    }
    if (!strArr?.length)
        return "";
    return findCommonPrefixSuffixWords(strArr, true);
};
const findCommonPrefixSuffixWords = (strArr, isSuffix) => {
    let prefixTks = null;
    let lenMax = -1;
    const tokenizedArr = strArr.map(str => {
        lenMax = Math.max(lenMax, str.length);
        return str.split(" ");
    });
    for (const tks of tokenizedArr) {
        if (isSuffix)
            tks.reverse();
        if (prefixTks == null) {
            prefixTks = [...tks];
            continue;
        }
        const minLen = Math.min(tks.length, prefixTks.length);
        while (prefixTks.length > minLen)
            prefixTks.pop();
        for (let i = 0; i < minLen; ++i) {
            if (prefixTks[i] !== tks[i]) {
                prefixTks = prefixTks.slice(0, i);
                break;
            }
        }
    }
    if (!prefixTks?.length)
        return "";
    if (isSuffix)
        prefixTks.reverse();
    const out = prefixTks.join(" ");
    if (out.length === lenMax)
        return out;
    return isSuffix ? " " + out : out + " ";
};
// ============ Color Functions ============
export const invertColor = (hex, options = {}) => {
    hex = hex.slice(1); // remove #
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    const isDark = (r * 0.299 + g * 0.587 + b * 0.114) > 186;
    if (options.dark && options.light) {
        return isDark ? options.dark : options.light;
    }
    if (options.bw) {
        return isDark ? "#000000" : "#FFFFFF";
    }
    const rInv = (255 - r).toString(16).padStart(2, "0");
    const gInv = (255 - g).toString(16).padStart(2, "0");
    const bInv = (255 - b).toString(16).padStart(2, "0");
    return "#" + rInv + gInv + bInv;
};
// ============ Async Functions ============
export const pDelay = (msecs, resolveAs) => {
    return new Promise(resolve => setTimeout(() => resolve(resolveAs), msecs));
};
const SYM_WALKER_BREAK = Symbol("WALKER_BREAK");
// ============ Walker Implementation ============
export const getWalker = (opts = {}) => {
    const keyBlocklist = opts.keyBlocklist || new Set();
    const isAllowDeleteObjects = opts.isAllowDeleteObjects ?? false;
    const isAllowDeleteArrays = opts.isAllowDeleteArrays ?? false;
    const isDepthFirst = opts.isDepthFirst ?? false;
    const isNoModification = opts.isNoModification ?? false;
    const isBreakOnReturn = opts.isBreakOnReturn ?? false;
    if (isBreakOnReturn && !isNoModification) {
        throw new Error('"isBreakOnReturn" may only be used in "isNoModification" mode!');
    }
    const applyHandlers = (handlers, obj, lastKey, stack) => {
        const handlerArr = Array.isArray(handlers) ? handlers : [handlers];
        for (const h of handlerArr) {
            const out = h(obj, lastKey, stack);
            if (isBreakOnReturn && out !== undefined)
                return SYM_WALKER_BREAK;
            if (!isNoModification && out !== undefined)
                obj = out;
        }
        return obj;
    };
    const runHandlers = (handlers, obj, lastKey, stack) => {
        const handlerArr = Array.isArray(handlers) ? handlers : [handlers];
        for (const h of handlerArr)
            h(obj, lastKey, stack);
    };
    const walk = (obj, handlers, lastKey, stack) => {
        if (obj === null) {
            if (handlers.preNull)
                runHandlers(handlers.preNull, null, lastKey, stack);
            let result = null;
            if (handlers.null) {
                result = applyHandlers(handlers.null, null, lastKey, stack);
                if (result === SYM_WALKER_BREAK)
                    return SYM_WALKER_BREAK;
            }
            if (handlers.postNull)
                runHandlers(handlers.postNull, null, lastKey, stack);
            return result;
        }
        switch (typeof obj) {
            case "undefined": {
                if (handlers.preUndefined)
                    runHandlers(handlers.preUndefined, undefined, lastKey, stack);
                let result = undefined;
                if (handlers.undefined) {
                    result = applyHandlers(handlers.undefined, undefined, lastKey, stack);
                    if (result === SYM_WALKER_BREAK)
                        return SYM_WALKER_BREAK;
                }
                if (handlers.postUndefined)
                    runHandlers(handlers.postUndefined, undefined, lastKey, stack);
                return result;
            }
            case "boolean": {
                if (handlers.preBoolean)
                    runHandlers(handlers.preBoolean, obj, lastKey, stack);
                let result = obj;
                if (handlers.boolean) {
                    result = applyHandlers(handlers.boolean, obj, lastKey, stack);
                    if (result === SYM_WALKER_BREAK)
                        return SYM_WALKER_BREAK;
                }
                if (handlers.postBoolean)
                    runHandlers(handlers.postBoolean, result, lastKey, stack);
                return result;
            }
            case "number": {
                if (handlers.preNumber)
                    runHandlers(handlers.preNumber, obj, lastKey, stack);
                let result = obj;
                if (handlers.number) {
                    result = applyHandlers(handlers.number, obj, lastKey, stack);
                    if (result === SYM_WALKER_BREAK)
                        return SYM_WALKER_BREAK;
                }
                if (handlers.postNumber)
                    runHandlers(handlers.postNumber, result, lastKey, stack);
                return result;
            }
            case "string": {
                if (handlers.preString)
                    runHandlers(handlers.preString, obj, lastKey, stack);
                let result = obj;
                if (handlers.string) {
                    result = applyHandlers(handlers.string, obj, lastKey, stack);
                    if (result === SYM_WALKER_BREAK)
                        return SYM_WALKER_BREAK;
                }
                if (handlers.postString)
                    runHandlers(handlers.postString, result, lastKey, stack);
                return result;
            }
            case "object": {
                if (Array.isArray(obj)) {
                    if (handlers.preArray)
                        runHandlers(handlers.preArray, obj, lastKey, stack);
                    let arr = obj;
                    if (isDepthFirst) {
                        if (stack)
                            stack.push(arr);
                        const out = new Array(arr.length);
                        for (let i = 0; i < arr.length; ++i) {
                            const result = walk(arr[i], handlers, lastKey, stack);
                            if (result === SYM_WALKER_BREAK)
                                return SYM_WALKER_BREAK;
                            out[i] = result;
                        }
                        if (!isNoModification)
                            arr = out;
                        if (stack)
                            stack.pop();
                        if (handlers.array) {
                            const result = applyHandlers(handlers.array, arr, lastKey, stack);
                            if (result === SYM_WALKER_BREAK)
                                return SYM_WALKER_BREAK;
                            if (!isNoModification)
                                arr = result;
                        }
                        if (arr == null && !isAllowDeleteArrays) {
                            throw new Error("Array handler(s) returned null!");
                        }
                    }
                    else {
                        if (handlers.array) {
                            const result = applyHandlers(handlers.array, arr, lastKey, stack);
                            if (result === SYM_WALKER_BREAK)
                                return SYM_WALKER_BREAK;
                            if (!isNoModification)
                                arr = result;
                        }
                        if (arr != null) {
                            if (stack)
                                stack.push(arr);
                            const out = new Array(arr.length);
                            for (let i = 0; i < arr.length; ++i) {
                                const result = walk(arr[i], handlers, lastKey, stack);
                                if (result === SYM_WALKER_BREAK)
                                    return SYM_WALKER_BREAK;
                                out[i] = result;
                            }
                            if (!isNoModification)
                                arr = out;
                            if (stack)
                                stack.pop();
                        }
                        else if (!isAllowDeleteArrays) {
                            throw new Error("Array handler(s) returned null!");
                        }
                    }
                    if (handlers.postArray)
                        runHandlers(handlers.postArray, arr, lastKey, stack);
                    return arr;
                }
                // Object
                if (handlers.preObject)
                    runHandlers(handlers.preObject, obj, lastKey, stack);
                let objRecord = obj;
                const doObjectRecurse = () => {
                    for (const k of Object.keys(objRecord)) {
                        if (keyBlocklist.has(k))
                            continue;
                        const result = walk(objRecord[k], handlers, k, stack);
                        if (result === SYM_WALKER_BREAK)
                            return SYM_WALKER_BREAK;
                        if (!isNoModification)
                            objRecord[k] = result;
                    }
                };
                if (isDepthFirst) {
                    if (stack)
                        stack.push(objRecord);
                    const flag = doObjectRecurse();
                    if (stack)
                        stack.pop();
                    if (flag === SYM_WALKER_BREAK)
                        return SYM_WALKER_BREAK;
                    if (handlers.object) {
                        const result = applyHandlers(handlers.object, objRecord, lastKey, stack);
                        if (result === SYM_WALKER_BREAK)
                            return SYM_WALKER_BREAK;
                        if (!isNoModification)
                            objRecord = result;
                    }
                    if (objRecord == null && !isAllowDeleteObjects) {
                        throw new Error("Object handler(s) returned null!");
                    }
                }
                else {
                    if (handlers.object) {
                        const result = applyHandlers(handlers.object, objRecord, lastKey, stack);
                        if (result === SYM_WALKER_BREAK)
                            return SYM_WALKER_BREAK;
                        if (!isNoModification)
                            objRecord = result;
                    }
                    if (objRecord == null) {
                        if (!isAllowDeleteObjects)
                            throw new Error("Object handler(s) returned null!");
                    }
                    else {
                        if (stack)
                            stack.push(objRecord);
                        const flag = doObjectRecurse();
                        if (stack)
                            stack.pop();
                        if (flag === SYM_WALKER_BREAK)
                            return SYM_WALKER_BREAK;
                    }
                }
                if (handlers.postObject)
                    runHandlers(handlers.postObject, objRecord, lastKey, stack);
                return objRecord;
            }
            default:
                throw new Error("Unhandled type: " + typeof obj);
        }
    };
    return { walk };
};
// ============ Walker Key Blocklist ============
export const GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST = new Set([
    "caption", "type", "colLabels", "colLabelRows", "name",
    "colStyles", "style", "shortName", "subclassShortName",
    "id", "path", "source"
]);
//# sourceMappingURL=misc-util.js.map