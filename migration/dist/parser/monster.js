// Monster Parser - TypeScript implementation
// Migrated from js/parser.js monster-related methods
import { joinConjunct } from "../util/array-util.js";
import { toTitleCase } from "../util/str-util.js";
import { ascSortLower } from "../util/sort-util.js";
// ============ Constants ============
export const SPEED_MODES = ["walk", "burrow", "climb", "fly", "swim"];
export const SIZE_ABV_TO_FULL = {
    F: "Fine",
    D: "Diminutive",
    T: "Tiny",
    S: "Small",
    M: "Medium",
    L: "Large",
    H: "Huge",
    G: "Gargantuan",
    C: "Colossal",
    V: "Varies",
};
export const MON_TYPE_TO_PLURAL = {
    aberration: "aberrations",
    beast: "beasts",
    celestial: "celestials",
    construct: "constructs",
    dragon: "dragons",
    elemental: "elementals",
    fey: "fey",
    fiend: "fiends",
    giant: "giants",
    humanoid: "humanoids",
    monstrosity: "monstrosities",
    ooze: "oozes",
    plant: "plants",
    undead: "undead",
};
export const ALIGNMENT_ABV_TO_FULL = {
    L: "lawful",
    N: "neutral",
    NX: "neutral (law/chaos axis)",
    NY: "neutral (good/evil axis)",
    C: "chaotic",
    G: "good",
    E: "evil",
    U: "unaligned",
    A: "any alignment",
};
export const DMG_TYPES = [
    "acid", "bludgeoning", "cold", "fire", "force", "lightning",
    "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder",
];
// ============ Helper Functions ============
const parseAToB = (abMap, a, fallback) => {
    if (a == null)
        throw new TypeError("undefined or null object passed to parser");
    const trimmed = typeof a === "string" ? a.trim() : a;
    if (abMap[trimmed] !== undefined)
        return abMap[trimmed];
    return fallback !== undefined ? fallback : trimmed;
};
export const sizeAbvToFull = (abv) => {
    return parseAToB(SIZE_ABV_TO_FULL, abv);
};
export const monTypeToPlural = (type) => {
    return parseAToB(MON_TYPE_TO_PLURAL, type);
};
// ============ Monster Type Functions ============
const getTagMetas = (tags) => {
    if (!tags)
        return [];
    return tags.map(tag => {
        if (typeof tag === "string") {
            return {
                filterTag: tag.toLowerCase(),
                displayTag: toTitleCase(tag),
            };
        }
        return {
            filterTag: tag.tag.toLowerCase(),
            displayTag: toTitleCase(`${tag.prefix} ${tag.tag}`),
        };
    });
};
export const monTypeToFullObj = (type) => {
    const out = {
        types: [],
        tags: [],
        asText: "",
        asTextShort: "",
        typeSidekick: null,
        tagsSidekick: [],
        asTextSidekick: null,
    };
    if (type == null)
        return out;
    if (typeof type === "string") {
        out.types = [type];
        out.asText = toTitleCase(type);
        out.asTextShort = out.asText;
        return out;
    }
    if (typeof type.type === "object" && type.type.choose) {
        out.types = type.type.choose;
    }
    else {
        out.types = [type.type];
    }
    if (type.swarmSize) {
        out.tags.push("swarm");
        out.asText = `swarm of ${sizeAbvToFull(type.swarmSize)} ${joinConjunct(out.types.map(typ => toTitleCase(monTypeToPlural(typ))), ", ", " or ")}`;
        out.asTextShort = out.asText;
        out.swarmSize = type.swarmSize;
    }
    else {
        out.asText = joinConjunct(out.types.map(typ => toTitleCase(typ)), ", ", " or ");
        out.asTextShort = out.asText;
    }
    const tagMetas = getTagMetas(type.tags);
    if (tagMetas.length) {
        out.tags.push(...tagMetas.map(({ filterTag }) => filterTag));
        const ptTags = ` (${tagMetas.map(({ displayTag }) => displayTag).join(", ")})`;
        out.asText += ptTags;
        out.asTextShort += ptTags;
    }
    if (type.note)
        out.asText += ` ${type.note}`;
    if (type.sidekickType) {
        out.typeSidekick = type.sidekickType;
        if (!type.sidekickHidden)
            out.asTextSidekick = `${type.sidekickType}`;
        const sidekickTagMetas = getTagMetas(type.sidekickTags);
        if (sidekickTagMetas.length) {
            out.tagsSidekick.push(...sidekickTagMetas.map(({ filterTag }) => filterTag));
            if (!type.sidekickHidden) {
                out.asTextSidekick = (out.asTextSidekick ?? "") + ` (${sidekickTagMetas.map(({ displayTag }) => displayTag).join(", ")})`;
            }
        }
    }
    return out;
};
export const acToFull = (ac, { renderFn = (s) => s, isHideFrom = false } = {}) => {
    if (typeof ac === "string")
        return ac;
    let stack = "";
    let inBraces = false;
    for (let i = 0; i < ac.length; ++i) {
        const cur = ac[i];
        const nxt = ac[i + 1];
        if (typeof cur === "number") {
            stack += cur;
        }
        else if (cur.special != null) {
            if (inBraces)
                inBraces = false;
            stack += cur.special;
        }
        else if (cur.ac) {
            const isNxtBraces = nxt && typeof nxt !== "number" && nxt.braces;
            if (!inBraces && cur.braces) {
                stack += "(";
                inBraces = true;
            }
            stack += cur.ac;
            if (!isHideFrom && cur.from) {
                if (cur.braces) {
                    stack += " (";
                }
                else {
                    stack += inBraces ? "; " : " (";
                }
                inBraces = true;
                stack += cur.from.map(it => renderFn(it)).join(", ");
                if (cur.braces) {
                    stack += ")";
                }
                else if (!isNxtBraces) {
                    stack += ")";
                    inBraces = false;
                }
            }
            if (cur.condition)
                stack += ` ${renderFn(cur.condition)}`;
            if (inBraces && !isNxtBraces) {
                stack += ")";
                inBraces = false;
            }
        }
        if (nxt) {
            if (typeof nxt !== "number" && nxt.braces) {
                stack += inBraces ? "; " : " (";
                inBraces = true;
            }
            else {
                stack += ", ";
            }
        }
    }
    if (inBraces)
        stack += ")";
    return stack.trim();
};
const getSpeedName = (prop, styleHint) => {
    if (prop === "walk")
        return "";
    return `${styleHint === "classic" ? prop : toTitleCase(prop)} `;
};
const getSpeedVal = (prop, speed, isMetric) => {
    if (speed === true && prop !== "walk")
        return "equal to your walking speed";
    const num = speed === true
        ? 0
        : typeof speed === "object" && speed.number != null
            ? speed.number
            : speed;
    return isMetric ? Math.round(num * 0.3) : num;
};
const getSpeedCondition = (speed, renderFn) => {
    if (typeof speed === "object" && speed.condition) {
        return ` ${renderFn(speed.condition)}`;
    }
    return "";
};
const addSpeed = (prop, speed, isMetric, unit, stack, styleHint, renderFn) => {
    const ptName = getSpeedName(prop, styleHint);
    const ptValue = getSpeedVal(prop, speed, isMetric);
    const ptUnit = speed === true ? "" : ` ${unit}`;
    const ptCondition = getSpeedCondition(speed, renderFn);
    stack.push([ptName, ptValue, ptUnit, ptCondition].join(""));
};
const getSpeedForMode = (speedObj, mode) => {
    return speedObj[mode];
};
const addSpeedMode = (ent, prop, stack, isMetric, isSkipZeroWalk, unit, styleHint, renderFn) => {
    const speedObj = ent.speed;
    const propSpeed = getSpeedForMode(speedObj, prop);
    if (propSpeed !== undefined || (!isSkipZeroWalk && prop === "walk")) {
        addSpeed(prop, propSpeed ?? 0, isMetric, unit, stack, styleHint, renderFn);
    }
    if (speedObj.alternate?.[prop]) {
        for (const altSpeed of speedObj.alternate[prop]) {
            addSpeed(prop, altSpeed, isMetric, unit, stack, styleHint, renderFn);
        }
    }
};
export const getSpeedString = (ent, { isMetric = false, isSkipZeroWalk = false, isLongForm = false, styleHint = null, } = {}, renderFn = (s) => s) => {
    if (ent.speed == null)
        return "\u2014";
    const unit = isMetric
        ? (isLongForm ? "meters" : "m")
        : (isLongForm ? "feet" : "ft.");
    if (typeof ent.speed === "object") {
        const stack = [];
        let joiner = ", ";
        const speedObj = ent.speed;
        for (const mode of SPEED_MODES) {
            if (!speedObj.hidden?.includes(mode)) {
                addSpeedMode({ speed: speedObj }, mode, stack, isMetric, isSkipZeroWalk, unit, styleHint, renderFn);
            }
        }
        if (speedObj.choose && !speedObj.hidden?.includes("choose")) {
            joiner = "; ";
            const chooseFrom = speedObj.choose.from
                .sort()
                .map(prop => getSpeedName(prop, styleHint).trim() || prop);
            stack.push(`${joinConjunct(chooseFrom, ", ", " or ")} ${speedObj.choose.amount} ${unit}${speedObj.choose.note ? ` ${speedObj.choose.note}` : ""}`);
        }
        return stack.join(joiner) + (speedObj.note ? ` ${speedObj.note}` : "");
    }
    const speedVal = isMetric ? Math.round(ent.speed * 0.3) : ent.speed;
    return `${speedVal}${ent.speed === "Varies" ? "" : ` ${unit} `}`;
};
const isSimpleTerm = (val) => {
    if (typeof val === "string")
        return true;
    if ("special" in val)
        return true;
    return getNextProp(val) == null;
};
const getNextProp = (obj) => {
    if (obj.immune)
        return "immune";
    if (obj.resist)
        return "resist";
    if (obj.vulnerable)
        return "vulnerable";
    return null;
};
const getRenderedString = (str, { isPlainText = false, isTitleCase = false } = {}, stripTags = (s) => s, renderFn = (s) => s) => {
    if (isTitleCase)
        str = toTitleCase(str);
    return isPlainText ? stripTags(str) : renderFn(str);
};
const getRenderedObject = (obj, options, stripTags, renderFn) => {
    const stack = [];
    if (obj.preNote)
        stack.push(getRenderedString(obj.preNote, { isPlainText: options.isPlainText }, stripTags, renderFn));
    const prop = getNextProp(obj);
    if (prop && obj[prop]) {
        stack.push(getRenderedArray(obj[prop], { ...options, isGroup: true }, stripTags, renderFn));
    }
    if (obj.note)
        stack.push(getRenderedString(obj.note, { isPlainText: options.isPlainText }, stripTags, renderFn));
    return stack.join(" ");
};
const getRenderedArray = (values, options, stripTags, renderFn) => {
    const { isPlainText = false, isTitleCase = false, isGroup = false } = options;
    if (values.length === DMG_TYPES.length && DMG_TYPES.every((t, i) => t === values[i])) {
        return isTitleCase ? "All Damage" : "all damage";
    }
    return values
        .map((val, i, arr) => {
        const isSimpleCur = isSimpleTerm(val);
        const rendCur = isSimpleCur
            ? (typeof val === "object" && "special" in val && val.special)
                ? getRenderedString(val.special, { isPlainText, isTitleCase: false }, stripTags, renderFn)
                : getRenderedString(val, { isPlainText, isTitleCase }, stripTags, renderFn)
            : getRenderedObject(val, { isPlainText, isTitleCase }, stripTags, renderFn);
        if (i === arr.length - 1)
            return rendCur;
        const isSimpleNxt = isSimpleTerm(arr[i + 1]);
        if (!isSimpleCur || !isSimpleNxt)
            return `${rendCur}; `;
        if (!isGroup || i !== arr.length - 2 || arr.length < 2)
            return `${rendCur}, `;
        if (arr.length === 2)
            return `${rendCur} and `;
        return `${rendCur}, and `;
    })
        .join("");
};
export const getFullImmRes = (values, options = {}, stripTags = (s) => s, renderFn = (s) => s) => {
    if (!values?.length)
        return "";
    return getRenderedArray(values, options, stripTags, renderFn);
};
export const getFullCondImm = (condImm, { isPlainText = false, isEntry = false, isTitleCase = false } = {}, renderFn = (s) => s) => {
    if (isPlainText && isEntry) {
        throw new Error(`Options "isPlainText" and "isEntry" are mutually exclusive!`);
    }
    if (!condImm?.length)
        return "";
    const render = (condition) => {
        if (isTitleCase)
            condition = toTitleCase(condition);
        if (isPlainText)
            return condition;
        const ent = `{@condition ${condition}}`;
        if (isEntry)
            return ent;
        return renderFn(ent);
    };
    return condImm
        .map(it => {
        if (typeof it === "object" && "special" in it)
            return renderFn(it.special);
        if (typeof it === "object" && "conditionImmune" in it) {
            return `${it.preNote ? `${it.preNote} ` : ""}${it.conditionImmune.map(render).join(", ")}${it.note ? ` ${it.note}` : ""}`;
        }
        return render(it);
    })
        .sort(ascSortLower)
        .join(", ");
};
// ============ Alignment Functions ============
export const alignmentAbvToFull = (alignment) => {
    if (!alignment)
        return null;
    if (typeof alignment === "object") {
        if (alignment.special != null)
            return alignment.special;
        return `${alignmentListToFull(alignment.alignment ?? [])}${alignment.chance ? ` (${alignment.chance}%)` : ""}${alignment.note ? ` (${alignment.note})` : ""}`;
    }
    const upper = alignment.toUpperCase();
    return ALIGNMENT_ABV_TO_FULL[upper] ?? alignment;
};
export const alignmentListToFull = (alignList) => {
    if (!alignList)
        return "";
    if (alignList.some(it => typeof it !== "string")) {
        if (alignList.some(it => typeof it === "string")) {
            throw new Error(`Mixed alignment types: ${JSON.stringify(alignList)}`);
        }
        return alignList
            .filter(it => it.alignment === undefined || it.alignment != null)
            .map(it => {
            if (it.special != null || it.chance != null || it.note != null) {
                return alignmentAbvToFull(it);
            }
            return alignmentListToFull(it.alignment ?? []);
        })
            .join(" or ");
    }
    const strList = alignList;
    if (strList.length === 1)
        return alignmentAbvToFull(strList[0]) ?? "";
    if (strList.length === 2) {
        return strList.map(a => alignmentAbvToFull(a)).join(" ");
    }
    if (strList.length === 3) {
        if (strList.includes("NX") && strList.includes("NY") && strList.includes("N")) {
            return "any neutral alignment";
        }
    }
    if (strList.length === 5) {
        if (!strList.includes("G"))
            return "any non-good alignment";
        if (!strList.includes("E"))
            return "any non-evil alignment";
        if (!strList.includes("L"))
            return "any non-lawful alignment";
        if (!strList.includes("C"))
            return "any non-chaotic alignment";
    }
    if (strList.length === 4) {
        if (!strList.includes("L") && !strList.includes("NX"))
            return "any chaotic alignment";
        if (!strList.includes("G") && !strList.includes("NY"))
            return "any evil alignment";
        if (!strList.includes("C") && !strList.includes("NX"))
            return "any lawful alignment";
        if (!strList.includes("E") && !strList.includes("NY"))
            return "any good alignment";
    }
    throw new Error(`Unmapped alignment: ${JSON.stringify(alignList)}`);
};
//# sourceMappingURL=monster.js.map