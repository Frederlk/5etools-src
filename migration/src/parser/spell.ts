// Spell Parser - TypeScript implementation
// Migrated from js/parser.js spell-related methods

import { joinConjunct } from "../util/array-util.js";
import { uppercaseFirst } from "../util/str-util.js";

// ============ Types ============

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

export type SpellRangeType =
	| "special" | "point" | "line" | "cube" | "cone"
	| "emanation" | "radius" | "sphere" | "hemisphere" | "cylinder";

export type SpellDistanceType =
	| "self" | "touch" | "sight" | "unlimited" | "plane"
	| "feet" | "miles" | "yards" | "inches" | "special";

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
	m?: boolean | string | { text: string; cost?: number; consume?: boolean | string };
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

// ============ Constants ============

export const SP_SCHOOL_ABV_TO_FULL: Record<string, string> = {
	A: "Abjuration",
	V: "Evocation",
	E: "Enchantment",
	I: "Illusion",
	D: "Divination",
	N: "Necromancy",
	T: "Transmutation",
	C: "Conjuration",
	P: "Psionic",
};

export const SP_SCHOOL_ABV_TO_SHORT: Record<string, string> = {
	A: "Abj.",
	V: "Evoc.",
	E: "Ench.",
	I: "Illu.",
	D: "Divin.",
	N: "Necro.",
	T: "Trans.",
	C: "Conj.",
	P: "Psi.",
};

export const SP_TM_ACTION = "action";
export const SP_TM_B_ACTION = "bonus";
export const SP_TM_REACTION = "reaction";
export const SP_TM_ROUND = "round";
export const SP_TM_MINS = "minute";
export const SP_TM_HRS = "hour";
export const SP_TM_SPECIAL = "special";

export const SP_TIME_SINGLETONS = [SP_TM_ACTION, SP_TM_B_ACTION, SP_TM_REACTION, SP_TM_ROUND] as const;

export const SP_TIME_TO_FULL: Record<string, string> = {
	[SP_TM_ACTION]: "Action",
	[SP_TM_B_ACTION]: "Bonus Action",
	[SP_TM_REACTION]: "Reaction",
	[SP_TM_ROUND]: "Rounds",
	[SP_TM_MINS]: "Minutes",
	[SP_TM_HRS]: "Hours",
	[SP_TM_SPECIAL]: "Special",
};

export const SP_TIME_TO_ABV: Record<string, string> = {
	[SP_TM_ACTION]: "A",
	[SP_TM_B_ACTION]: "BA",
	[SP_TM_REACTION]: "R",
	[SP_TM_ROUND]: "rnd",
	[SP_TM_MINS]: "min",
	[SP_TM_HRS]: "hr",
	[SP_TM_SPECIAL]: "SPC",
};

const TIME_UNITS_SHORTHAND = new Set([SP_TM_ACTION, SP_TM_B_ACTION, SP_TM_REACTION, "ritual"]);

export const RNG_SPECIAL = "special";
export const RNG_POINT = "point";
export const RNG_LINE = "line";
export const RNG_CUBE = "cube";
export const RNG_CONE = "cone";
export const RNG_EMANATION = "emanation";
export const RNG_RADIUS = "radius";
export const RNG_SPHERE = "sphere";
export const RNG_HEMISPHERE = "hemisphere";
export const RNG_CYLINDER = "cylinder";
export const RNG_SELF = "self";
export const RNG_SIGHT = "sight";
export const RNG_UNLIMITED = "unlimited";
export const RNG_UNLIMITED_SAME_PLANE = "plane";
export const RNG_TOUCH = "touch";

export const UNT_INCHES = "inches";
export const UNT_FEET = "feet";
export const UNT_YARDS = "yards";
export const UNT_MILES = "miles";

export const SP_RANGE_TYPE_TO_FULL: Record<string, string> = {
	[RNG_SPECIAL]: "Special",
	[RNG_POINT]: "Point",
	[RNG_LINE]: "Line",
	[RNG_CUBE]: "Cube",
	[RNG_CONE]: "Cone",
	[RNG_EMANATION]: "Emanation",
	[RNG_RADIUS]: "Radius",
	[RNG_SPHERE]: "Sphere",
	[RNG_HEMISPHERE]: "Hemisphere",
	[RNG_CYLINDER]: "Cylinder",
	[RNG_SELF]: "Self",
	[RNG_SIGHT]: "Sight",
	[RNG_UNLIMITED]: "Unlimited",
	[RNG_UNLIMITED_SAME_PLANE]: "Unlimited on the same plane",
	[RNG_TOUCH]: "Touch",
};

export const SP_END_TYPE_TO_FULL: Record<string, string> = {
	dispel: "dispelled",
	trigger: "triggered",
	discharge: "discharged",
};

export const DURATION_TYPES = [
	{ type: "instant", full: "Instantaneous" },
	{ type: "timed", hasAmount: true },
	{ type: "permanent", hasEnds: true },
	{ type: "special" },
] as const;

export const DURATION_AMOUNT_TYPES = [
	"turn", "round", "minute", "hour", "day", "week", "month", "year",
] as const;

// ============ Helper Functions ============

export const getOrdinalForm = (i: number | string): string => {
	const num = Number(i);
	if (isNaN(num)) return "";
	const j = num % 10;
	const k = num % 100;
	if (j === 1 && k !== 11) return `${num}st`;
	if (j === 2 && k !== 12) return `${num}nd`;
	if (j === 3 && k !== 13) return `${num}rd`;
	return `${num}th`;
};

export const spLevelToFull = (level: number): string => {
	if (level === 0) return "Cantrip";
	return getOrdinalForm(level);
};

export const spSchoolAbvToFull = (schoolOrSubschool: string): string => {
	return SP_SCHOOL_ABV_TO_FULL[schoolOrSubschool] ?? schoolOrSubschool;
};

export const spSchoolAbvToShort = (schoolOrSubschool: string): string => {
	return SP_SCHOOL_ABV_TO_SHORT[schoolOrSubschool] ?? schoolOrSubschool;
};

export const spRangeTypeToFull = (type: string): string => {
	return SP_RANGE_TYPE_TO_FULL[type] ?? type;
};

export const spEndTypeToFull = (type: string): string => {
	return SP_END_TYPE_TO_FULL[type] ?? type;
};

export const getSingletonUnit = (unit: string, isShort = false): string => {
	if (!unit) return unit;
	switch (unit) {
		case UNT_INCHES: return isShort ? "in." : "inch";
		case UNT_FEET: return isShort ? "ft." : "foot";
		case UNT_YARDS: return isShort ? "yd." : "yard";
		case UNT_MILES: return isShort ? "mi." : "mile";
		default:
			if (unit.charAt(unit.length - 1) === "s") return unit.slice(0, -1);
			return unit;
	}
};

// ============ Spell Meta Functions ============

export const spMetaToArr = (meta: SpellMeta | undefined, { styleHint = null }: { styleHint?: StyleHint } = {}): string[] => {
	if (!meta) return [];
	return Object.entries(meta)
		.filter(([_, v]) => v)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k]) => styleHint === "classic" ? k : uppercaseFirst(k));
};

// ============ Level/School/Meta Functions ============

const spLevelSchoolMetaToFull_level = (level: number, styleHint: StyleHint): string => {
	if (styleHint === "classic") {
		return level === 0 ? spLevelToFull(level).toLowerCase() : `${spLevelToFull(level)}-level`;
	}
	return level === 0 ? spLevelToFull(level) : `Level ${level}`;
};

const spLevelSchoolMetaToFull_levelSchool = (level: number, school: string, styleHint: StyleHint, ptLevel: string): string => {
	if (level === 0) return `${spSchoolAbvToFull(school)} ${ptLevel}`;
	if (styleHint === "classic") return `${ptLevel} ${spSchoolAbvToFull(school).toLowerCase()}`;
	return `${ptLevel} ${spSchoolAbvToFull(school)}`;
};

export interface SpLevelSchoolMetaToFullOptions {
	styleHint?: StyleHint;
}

export const spLevelSchoolMetaToFull = (
	level: number,
	school: string,
	meta?: SpellMeta,
	subschools?: string[],
	{ styleHint = null }: SpLevelSchoolMetaToFullOptions = {},
): string => {
	const ptLevel = spLevelSchoolMetaToFull_level(level, styleHint);
	const ptLevelSchool = spLevelSchoolMetaToFull_levelSchool(level, school, styleHint, ptLevel);

	const metaArr = spMetaToArr(meta, { styleHint })
		.filter(k => styleHint === "classic" || k.toLowerCase() !== "ritual");

	if (metaArr.length || subschools?.length) {
		const ptMetaAndSubschools = [
			(subschools || []).map(sub => spSchoolAbvToFull(sub)).join(", "),
			metaArr.join(", "),
		]
			.filter(Boolean)
			.join("; ");

		if (styleHint === "classic") return `${ptLevelSchool} (${ptMetaAndSubschools.toLowerCase()})`;
		return `${ptLevelSchool} (${ptMetaAndSubschools})`;
	}

	return ptLevelSchool;
};

// ============ Casting Time Functions ============

const getTimeToFull_number = (time: SpellTime, styleHint: StyleHint): string => {
	if (!time.number) return "";
	if (styleHint === "classic") return `${time.number} `;
	if (time.number === 1 && TIME_UNITS_SHORTHAND.has(time.unit)) return "";
	return `${time.number} `;
};

export const getTimeToFull = (time: SpellTime, { styleHint = null }: { styleHint?: StyleHint } = {}): string => {
	const ptNumber = getTimeToFull_number(time, styleHint);
	const unitDisplay = time.unit === SP_TM_B_ACTION ? "bonus action" : time.unit;
	const ptUnit = (styleHint === "classic" || ptNumber) ? unitDisplay : uppercaseFirst(unitDisplay);
	return `${ptNumber}${ptUnit}${time.number > 1 ? "s" : ""}`;
};

export interface SpTimeListToFullOptions {
	isStripTags?: boolean;
	styleHint?: StyleHint;
}

export const spTimeListToFull = (
	times: SpellTime[],
	meta?: SpellMeta,
	{ isStripTags = false, styleHint = null }: SpTimeListToFullOptions = {},
	stripTags: (s: string) => string = (s) => s,
	renderFn: (s: string) => string = (s) => s,
): string => {
	const allTimes: SpellTime[] = [
		...times,
		...(styleHint === "classic" || !meta?.ritual
			? []
			: [{ number: 1, unit: "ritual" as SpellTimeUnit }]),
	];

	return joinConjunct(
		allTimes.map(time => {
			return [
				getTimeToFull(time, { styleHint }),
				time.condition ? `, ${isStripTags ? stripTags(time.condition) : renderFn(time.condition)}` : "",
				time.note ? ` (${isStripTags ? stripTags(time.note) : renderFn(time.note)})` : "",
			]
				.filter(Boolean)
				.join("");
		}),
		", ",
		" or ",
	);
};

// ============ Range Functions ============

const getAreaStyleString = (range: SpellRange): string => {
	switch (range.type) {
		case RNG_SPHERE: return " radius";
		case RNG_HEMISPHERE: return `-radius ${range.type}`;
		case RNG_CYLINDER: return "-radius";
		default: return ` ${range.type}`;
	}
};

const renderPoint = (range: SpellRange): string => {
	const dist = range.distance;
	switch (dist.type) {
		case RNG_SELF:
		case RNG_SIGHT:
		case RNG_UNLIMITED:
		case RNG_UNLIMITED_SAME_PLANE:
		case RNG_SPECIAL:
		case RNG_TOUCH:
			return spRangeTypeToFull(dist.type);
		case UNT_INCHES:
		case UNT_FEET:
		case UNT_YARDS:
		case UNT_MILES:
		default:
			return `${dist.amount} ${dist.amount === 1 ? getSingletonUnit(dist.type) : dist.type}`;
	}
};

const renderArea = (range: SpellRange, styleHint: StyleHint, isDisplaySelfArea: boolean): string => {
	if (styleHint !== "classic" && !isDisplaySelfArea) return "Self";

	const size = range.distance;
	let result = `Self (${size.amount}-${getSingletonUnit(size.type)}${getAreaStyleString(range)}`;

	if (range.type === RNG_CYLINDER && size.amountSecondary != null && size.typeSecondary != null) {
		result += `, ${size.amountSecondary}-${getSingletonUnit(size.typeSecondary)}-high`;
	}

	if (range.type === RNG_CYLINDER) {
		result += " cylinder";
	}

	result += ")";
	return result;
};

export interface SpRangeToFullOptions {
	styleHint?: StyleHint;
	isDisplaySelfArea?: boolean;
}

export const spRangeToFull = (
	range: SpellRange,
	{ styleHint = null, isDisplaySelfArea = false }: SpRangeToFullOptions = {},
): string => {
	switch (range.type) {
		case RNG_SPECIAL:
			return spRangeTypeToFull(range.type);
		case RNG_POINT:
			return renderPoint(range);
		case RNG_LINE:
		case RNG_CUBE:
		case RNG_CONE:
		case RNG_EMANATION:
		case RNG_RADIUS:
		case RNG_SPHERE:
		case RNG_HEMISPHERE:
		case RNG_CYLINDER:
			return renderArea(range, styleHint, isDisplaySelfArea);
		default:
			return range.type;
	}
};

// ============ Components Functions ============

export interface SpComponentsToFullOptions {
	isPlainText?: boolean;
}

export const spComponentsToFull = (
	comp: SpellComponents | undefined,
	level: number,
	{ isPlainText = false }: SpComponentsToFullOptions = {},
	stripTags: (s: string) => string = (s) => s,
	renderFn: (s: string) => string = (s) => s,
): string => {
	if (!comp) return "None";

	const out: string[] = [];
	const fnRender = isPlainText ? stripTags : renderFn;

	if (comp.v) out.push("V");
	if (comp.s) out.push("S");

	if (comp.m != null && comp.m !== false) {
		if (comp.m === true) {
			out.push("M");
		} else if (typeof comp.m === "string") {
			out.push(`M (${fnRender(comp.m)})`);
		} else if (typeof comp.m === "object" && comp.m.text != null) {
			out.push(`M (${fnRender(comp.m.text)})`);
		}
	}

	if (comp.r) out.push(`R (${level} gp)`);

	return out.join(", ") || "None";
};

// ============ Duration Functions ============

export interface SpDurationToFullOptions {
	isPlainText?: boolean;
	styleHint?: StyleHint;
}

export const spDurationToFull = (
	durations: SpellDuration[],
	{ isPlainText = false, styleHint = null }: SpDurationToFullOptions = {},
	stripTags: (s: string) => string = (s) => s,
	renderFn: (s: string) => string = (s) => s,
): string => {
	let hasSubOr = false;

	const outParts = durations.map(duration => {
		const ptCondition = duration.condition ? ` (${duration.condition})` : "";

		switch (duration.type) {
			case "special":
				if (duration.concentration) {
					return styleHint === "classic"
						? "Concentration"
						: `{@status Concentration|XPHB}`;
				}
				return `Special${ptCondition}`;

			case "instant":
				return `Instantaneous${ptCondition}`;

			case "timed": {
				const dur = duration.duration!;
				const prefix = duration.concentration
					? (styleHint === "classic" ? "Concentration, " : "{@status Concentration|XPHB}, ")
					: "";
				const upToPrefix = duration.concentration || dur.upTo
					? (duration.concentration ? "u" : "U") + "p to "
					: "";
				const amount = dur.amount;
				const unit = amount === 1 ? dur.type : `${dur.type}s`;
				return `${prefix}${upToPrefix}${amount} ${unit}${ptCondition}`;
			}

			case "permanent": {
				if (!duration.ends) return `Permanent${ptCondition}`;
				const endsToJoin = duration.ends.map(m => spEndTypeToFull(m));
				hasSubOr = hasSubOr || endsToJoin.length > 1;
				return `Until ${joinConjunct(endsToJoin, ", ", " or ")}${ptCondition}`;
			}

			default:
				return duration.type;
		}
	});

	const joiner = hasSubOr ? "; " : ", ";
	let result = joinConjunct(outParts, joiner, " or ");
	if (durations.length > 1) result += " (see below)";

	if (isPlainText) return stripTags(result);
	return renderFn(result);
};
