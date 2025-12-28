// Utility Module - Barrel export
// Note: str-util.last (string) and array-util.last (array) have different signatures
// Import from specific modules if you need the array version

// String utilities (includes str-util.last for strings)
export * from "./str-util.js";

// Array utilities - excluding 'last' to avoid conflict with str-util.last
// Use: import { last } from "./array-util.js" for array version
export {
	first,
	joinConjunct,
	filterIndex,
	equals,
	segregate,
	partition,
	getNext,
	getPrevious,
	shuffle,
	shuffled,
	mergeMap,
	findMapped,
	unique,
	zip,
	nextWrap,
	prevWrap,
	sum,
	mean,
	meanAbsoluteDeviation,
	pMap,
	pSerialAwaitMap,
	pSerialAwaitFilter,
	pSerialAwaitFind,
	pSerialAwaitSome,
	pSerialAwaitFirst,
	pSerialAwaitReduce,
} from "./array-util.js";

// Also export array's last with explicit name
export { last as arrayLast } from "./array-util.js";

// Sort utilities
export * from "./sort-util.js";

// Misc utilities
export * from "./misc-util.js";
