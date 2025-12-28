// String Utility Functions - Pure TypeScript implementation

// ============ Regex Constants ============

export const COMMAS_NOT_IN_PARENTHESES_REGEX = /,\s?(?![^(]*\))/g;
export const COMMA_SPACE_NOT_IN_PARENTHESES_REGEX = /, (?![^(]*\))/g;
export const SEMICOLON_SPACE_NOT_IN_PARENTHESES_REGEX = /; (?![^(]*\))/g;

// ============ Case Transformation ============

export const uppercaseFirst = (str: string): string => {
	if (str.length === 0) return str;
	if (str.length === 1) return str.charAt(0).toUpperCase();
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const lowercaseFirst = (str: string): string => {
	if (str.length === 0) return str;
	if (str.length === 1) return str.charAt(0).toLowerCase();
	return str.charAt(0).toLowerCase() + str.slice(1);
};

// ============ Title Case ============

const TITLE_LOWER_WORDS = ["a", "an", "the", "and", "but", "or", "for", "nor", "as", "at", "by", "for", "from", "in", "into", "near", "of", "on", "onto", "to", "with", "over", "von", "between", "per", "beyond", "among"];
const TITLE_UPPER_WORDS = ["Id", "Tv", "Dm", "Ok", "Npc", "Pc", "Tpk", "Wip", "Dc", "D&d", "Ac", "Hp"];
const TITLE_UPPER_WORDS_PLURAL = ["Ids", "Tvs", "Dms", "Oks", "Npcs", "Pcs", "Tpks", "Wips", "Dcs"];

const TITLE_RE_INITIAL = /(?<!{[@=])(\b\w+[^-\u2014\s/|]*) */g;
const TITLE_RE_COMPOUND_LOWER = /([a-z]-(?:Like|Kreen|Toa))/g;
const TITLE_RE_POST_PUNCT = /([;:?!.])(\s*)(\S)/g;

let _TITLE_LOWER_WORDS_RE: RegExp | null = null;
let _TITLE_UPPER_WORDS_RE: RegExp | null = null;
let _TITLE_UPPER_WORDS_PLURAL_RE: RegExp | null = null;

const initTitleCase = (): void => {
	_TITLE_LOWER_WORDS_RE ??= new RegExp(`\\s(${TITLE_LOWER_WORDS.join("|")})(?=\\s)`, "gi");
	_TITLE_UPPER_WORDS_RE ??= new RegExp(`\\b(${TITLE_UPPER_WORDS.join("|")})\\b`, "g");
	_TITLE_UPPER_WORDS_PLURAL_RE ??= new RegExp(`\\b(${TITLE_UPPER_WORDS_PLURAL.join("|")})\\b`, "g");
};

export const toTitleCase = (str: string): string => {
	initTitleCase();
	return str
		.replace(TITLE_RE_INITIAL, m0 => m0.charAt(0).toUpperCase() + m0.substring(1).toLowerCase())
		.replace(_TITLE_LOWER_WORDS_RE!, m0 => m0.toLowerCase())
		.replace(_TITLE_UPPER_WORDS_RE!, m0 => m0.toUpperCase())
		.replace(_TITLE_UPPER_WORDS_PLURAL_RE!, m0 => `${m0.slice(0, -1).toUpperCase()}${m0.slice(-1).toLowerCase()}`)
		.replace(TITLE_RE_COMPOUND_LOWER, m0 => m0.toLowerCase())
		.replace(TITLE_RE_POST_PUNCT, (_, m1, m2, m3) => `${m1}${m2}${m3.toUpperCase()}`);
};

// ============ Padding ============

export const padNumber = (n: number, len: number, padder = "0"): string => {
	return String(n).padStart(len, padder);
};

// ============ Truncation ============

export const ellipsisTruncate = (str: string, atLeastPre = 5, atLeastSuff = 0, maxLen = 20): string => {
	if (maxLen >= str.length) return str;
	maxLen = Math.max(atLeastPre + atLeastSuff + 3, maxLen);
	let out = "";
	let remain = maxLen - (3 + atLeastPre + atLeastSuff);
	for (let i = 0; i < str.length - atLeastSuff; ++i) {
		const c = str[i];
		if (i < atLeastPre) out += c;
		else if ((remain--) > 0) out += c;
	}
	if (remain < 0) out += "...";
	out += str.substring(str.length - atLeastSuff, str.length);
	return out;
};

// ============ HTML Escaping ============

export const escapeQuotes = (str: string): string => {
	return str.replace(/&/g, "&amp;").replace(/'/g, "&apos;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

export const unescapeQuotes = (str: string): string => {
	return str.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
};

export const qq = escapeQuotes;
export const uq = unescapeQuotes;

// ============ URL Encoding ============

export const encodeApos = (str: string): string => str.replace(/'/g, "%27");
export const toUrlified = (str: string): string => encodeURIComponent(str.toLowerCase()).toLowerCase();

// ============ String Utilities ============

export const escapeRegexp = (str: string): string => str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
export const isNumeric = (str: string): boolean => !isNaN(parseFloat(str)) && isFinite(Number(str));
export const last = (str: string): string => str[str.length - 1];

// ============ Camel Case ============

export const toCamelCase = (str: string): string => {
	return str.split(" ").map((word, index) => {
		if (index === 0) return word.toLowerCase();
		return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
	}).join("");
};

// ============ Sentence Case ============

export const toSentenceCase = (str: string): string => {
	const out: string[] = [];
	const re = /([^.!?]+)([.!?]\s*|$)/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(str)) !== null) {
		out.push(uppercaseFirst(m[0].toLowerCase()));
	}
	return out.join("");
};

// ============ Chunking ============

export const toChunks = (str: string, size: number): string[] => {
	const numChunks = Math.ceil(str.length / size);
	const chunks = new Array<string>(numChunks);
	for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
		chunks[i] = str.substr(o, size);
	}
	return chunks;
};

// ============ ASCII Conversion ============

export const toAscii = (str: string): string => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/Æ/g, "AE")
		.replace(/æ/g, "ae");
};

// ============ Trimming ============

export const trimChar = (str: string, ch: string): string => {
	let start = 0;
	let end = str.length;
	while (start < end && str[start] === ch) ++start;
	while (end > start && str[end - 1] === ch) --end;
	return (start > 0 || end < str.length) ? str.substring(start, end) : str;
};

export const trimAnyChar = (str: string, chars: string): string => {
	let start = 0;
	let end = str.length;
	while (start < end && chars.indexOf(str[start]) >= 0) ++start;
	while (end > start && chars.indexOf(str[end - 1]) >= 0) --end;
	return (start > 0 || end < str.length) ? str.substring(start, end) : str;
};

// ============ Counting ============

export const countSubstring = (str: string, term: string): number => {
	return (str.match(new RegExp(escapeRegexp(term), "g")) || []).length;
};

// ============ Damerau-Levenshtein Distance ============

export const distance = (source: string, target: string): number => {
	if (!source) return target ? target.length : 0;
	if (!target) return source.length;

	const m = source.length;
	const n = target.length;
	const INF = m + n;
	const score: number[][] = new Array(m + 2);
	const sd: Record<string, number> = {};

	for (let i = 0; i < m + 2; i++) score[i] = new Array(n + 2);
	score[0][0] = INF;

	for (let i = 0; i <= m; i++) {
		score[i + 1][1] = i;
		score[i + 1][0] = INF;
		sd[source[i]] = 0;
	}

	for (let j = 0; j <= n; j++) {
		score[1][j + 1] = j;
		score[0][j + 1] = INF;
		sd[target[j]] = 0;
	}

	for (let i = 1; i <= m; i++) {
		let DB = 0;
		for (let j = 1; j <= n; j++) {
			const i1 = sd[target[j - 1]];
			const j1 = DB;
			if (source[i - 1] === target[j - 1]) {
				score[i + 1][j + 1] = score[i][j];
				DB = j;
			} else {
				score[i + 1][j + 1] = Math.min(score[i][j], Math.min(score[i + 1][j], score[i][j + 1])) + 1;
			}
			score[i + 1][j + 1] = Math.min(
				score[i + 1][j + 1],
				score[i1] ? score[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1) : Infinity
			);
		}
		sd[source[i - 1]] = i;
	}

	return score[m + 1][n + 1];
};

// ============ Pluralization ============

const IRREGULAR_PLURAL_WORDS: Record<string, string> = {
	"aarakocra": "aarakocra",
	"cactus": "cacti",
	"child": "children",
	"dao": "dao",
	"die": "dice",
	"djinni": "djinn",
	"drow": "drow",
	"duergar": "duergar",
	"dwarf": "dwarves",
	"efreeti": "efreet",
	"el'tael": "el'tael",
	"eladrin": "eladrin",
	"elf": "elves",
	"erinyes": "erinyes",
	"fey": "fey",
	"foot": "feet",
	"foulspawn": "foulspawn",
	"genasi": "genasi",
	"goose": "geese",
	"incubus": "incubi",
	"ki": "ki",
	"kenku": "kenku",
	"larva": "larvae",
	"lizardfolk": "lizardfolk",
	"man": "men",
	"merfolk": "merfolk",
	"merrow": "merrow",
	"mouse": "mice",
	"oni": "oni",
	"ox": "oxen",
	"person": "people",
	"sahuagin": "sahuagin",
	"sheep": "sheep",
	"slaad": "slaadi",
	"succubus": "succubi",
	"svirfneblin": "svirfneblin",
	"tael": "tael",
	"thri-kreen": "thri-kreen",
	"tooth": "teeth",
	"undead": "undead",
	"wolf": "wolves",
	"woman": "women",
	"xorn": "xorn",
	"yuan-ti": "yuan-ti",
};

const IRREGULAR_SINGLE_WORDS: Record<string, string> = Object.fromEntries(
	Object.entries(IRREGULAR_PLURAL_WORDS).map(([k, v]) => [v, k])
);

const IRREGULAR_SINGLE_PATTERNS: [RegExp, string][] = [
	[/(axe)s$/i, "$1"],
];

const getMatchedCase = (original: string, replacement: string): string => {
	if (original === original.toLowerCase()) return replacement.toLowerCase();
	if (original === original.toUpperCase()) return replacement.toUpperCase();
	if (original[0] === original[0].toUpperCase()) return uppercaseFirst(replacement);
	return replacement;
};

export const toSingle = (str: string): string => {
	const lower = str.toLowerCase();
	if (IRREGULAR_SINGLE_WORDS[lower]) {
		return getMatchedCase(str, IRREGULAR_SINGLE_WORDS[lower]);
	}

	for (const [re, repl] of IRREGULAR_SINGLE_PATTERNS) {
		if (re.test(str)) return str.replace(re, repl);
	}

	if (/(s|x|z|ch|sh)es$/i.test(str)) return str.slice(0, -2);
	if (/[bcdfghjklmnpqrstvwxyz]ies$/i.test(str)) return `${str.slice(0, -3)}y`;
	return str.replace(/s$/i, "");
};

export const toPlural = (str: string): string => {
	const lower = str.toLowerCase();
	if (IRREGULAR_PLURAL_WORDS[lower]) {
		return getMatchedCase(str, IRREGULAR_PLURAL_WORDS[lower]);
	}

	if (/[sxz]$/i.test(str) || /(ch|sh)$/i.test(str)) return `${str}es`;
	if (/[bcdfghjklmnpqrstvwxyz]y$/i.test(str)) return `${str.slice(0, -1)}ies`;
	return `${str}s`;
};

// ============ Duplicate Naming ============

export const getNextDuplicateName = (str: string | null): string | null => {
	if (str == null) return null;
	const m = /^(?<name>.*?) \((?<ordinal>\d+)\)$/.exec(str.trim());
	if (!m || !m.groups) return `${str} (1)`;
	return `${m.groups.name} (${Number(m.groups.ordinal) + 1})`;
};
