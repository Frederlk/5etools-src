// Object Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.object
// Provides object-specific markdown rendering for D&D 5e objects
import { createRenderMeta } from "../renderer/types.js";
import { stripTags } from "../renderer/tags.js";
import { ABIL_ABVS, getAbilityModNumber } from "../parser/attributes.js";
import { getMarkdownRenderer, markdownUtils } from "./renderer.js";
// ============ Constants ============
const RENDERABLE_ENTRIES_PROP_ORDER = [
    "entryCreatureCapacity",
    "entryCargoCapacity",
    "entryArmorClass",
    "entryHitPoints",
    "entrySpeed",
    "entryAbilityScores",
    "entryDamageImmunities",
    "entryDamageResistances",
    "entryDamageVulnerabilities",
    "entryConditionImmunities",
    "entrySenses",
];
// ============ Helper Functions ============
const getSizeString = (size) => {
    if (Array.isArray(size)) {
        return size.map(s => getSizeAbbreviation(s)).join(" or ");
    }
    return getSizeAbbreviation(size);
};
const getSizeAbbreviation = (size) => {
    const map = {
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
    return map[size] || size;
};
const getCreatureTypeString = (type) => {
    if (!type)
        return "object";
    if (typeof type === "string")
        return type;
    let typeStr = type.type || "object";
    if (type.tags?.length) {
        typeStr += ` (${type.tags.join(", ")})`;
    }
    return typeStr;
};
const getSpeedString = (speed) => {
    if (!speed)
        return "";
    if (typeof speed === "number")
        return `${speed} ft.`;
    const parts = [];
    if (speed.walk != null) {
        const walkVal = typeof speed.walk === "number"
            ? speed.walk
            : speed.walk.number;
        parts.push(`${walkVal} ft.`);
    }
    const modes = ["burrow", "climb", "fly", "swim"];
    for (const mode of modes) {
        const modeSpeed = speed[mode];
        if (modeSpeed != null) {
            const modeVal = typeof modeSpeed === "number"
                ? modeSpeed
                : modeSpeed.number;
            let modeStr = `${mode} ${modeVal} ft.`;
            if (typeof modeSpeed === "object" && "condition" in modeSpeed && modeSpeed.condition) {
                modeStr += ` ${stripTags(modeSpeed.condition)}`;
            }
            if (mode === "fly" && (speed.hover || speed.canHover)) {
                modeStr += " (hover)";
            }
            parts.push(modeStr);
        }
    }
    return parts.join(", ");
};
const getImmResString = (arr) => {
    if (!arr?.length)
        return "";
    return arr.map(it => {
        if (typeof it === "string")
            return it;
        if (typeof it === "object" && "special" in it && it.special)
            return it.special;
        const dmgTypes = [];
        if ("immune" in it && it.immune)
            dmgTypes.push(...it.immune);
        if ("resist" in it && it.resist)
            dmgTypes.push(...it.resist);
        if ("vulnerable" in it && it.vulnerable)
            dmgTypes.push(...it.vulnerable);
        let out = dmgTypes.join(", ");
        if ("preNote" in it && it.preNote)
            out = `${it.preNote} ${out}`;
        if ("note" in it && it.note)
            out += ` ${it.note}`;
        return out;
    }).join("; ");
};
const getCondImmString = (arr) => {
    if (!arr?.length)
        return "";
    return arr.map(it => {
        if (typeof it === "string")
            return it;
        if (typeof it === "object" && "special" in it && it.special)
            return it.special;
        const conditions = ("conditionImmune" in it && it.conditionImmune) || [];
        let out = conditions.join(", ");
        if ("preNote" in it && it.preNote)
            out = `${it.preNote} ${out}`;
        if ("note" in it && it.note)
            out += ` ${it.note}`;
        return out;
    }).join("; ");
};
const getSensesString = (senses) => {
    if (!senses?.length)
        return "";
    return senses.join(", ");
};
const getCreatureCapacity = (obj) => {
    const parts = [];
    if (obj.capCrew != null) {
        parts.push(`${obj.capCrew} crew`);
    }
    if (obj.capPassenger != null) {
        parts.push(`${obj.capPassenger} passenger${obj.capPassenger === 1 ? "" : "s"}`);
    }
    if (!parts.length)
        return null;
    return parts.join(", ");
};
const getCargoCapacity = (obj) => {
    if (obj.capCargo == null)
        return null;
    return `${obj.capCargo} ton${obj.capCargo === 1 ? "" : "s"}`;
};
const getAbilityScore = (obj, ab) => {
    return obj[ab];
};
const getAbilityScoresString = (obj) => {
    const hasAbilities = ABIL_ABVS.some(ab => getAbilityScore(obj, ab) != null);
    if (!hasAbilities)
        return null;
    const abilityParts = ABIL_ABVS
        .filter(ab => getAbilityScore(obj, ab) != null)
        .map(ab => {
        const score = getAbilityScore(obj, ab);
        const mod = getAbilityModNumber(score);
        const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
        return `${ab.toUpperCase()}\u00A0${score} (${modStr})`;
    });
    return abilityParts.join(", ");
};
// ============ Renderable Entries Meta ============
const getObjectRenderableEntriesMeta = (obj) => {
    const sizeStr = getSizeString(obj.size);
    const typeStr = obj.objectType !== "GEN"
        ? `${sizeStr} ${getCreatureTypeString(obj.creatureType)}`
        : "Variable size object";
    return {
        entrySize: `{@i ${typeStr}}`,
        entryCreatureCapacity: obj.capCrew != null || obj.capPassenger != null
            ? `{@b Creature Capacity:} ${getCreatureCapacity(obj)}`
            : null,
        entryCargoCapacity: obj.capCargo != null
            ? `{@b Cargo Capacity:} ${getCargoCapacity(obj)}`
            : null,
        entryArmorClass: obj.ac != null
            ? `{@b Armor Class:} ${typeof obj.ac === "object" && "special" in obj.ac ? obj.ac.special : obj.ac}`
            : null,
        entryHitPoints: obj.hp != null
            ? `{@b Hit Points:} ${typeof obj.hp === "object" && "special" in obj.hp ? obj.hp.special : obj.hp}`
            : null,
        entrySpeed: obj.speed != null
            ? `{@b Speed:} ${getSpeedString(obj.speed)}`
            : null,
        entryAbilityScores: getAbilityScoresString(obj)
            ? `{@b Ability Scores:} ${getAbilityScoresString(obj)}`
            : null,
        entryDamageImmunities: obj.immune != null
            ? `{@b Damage Immunities:} ${getImmResString(obj.immune)}`
            : null,
        entryDamageResistances: obj.resist != null
            ? `{@b Damage Resistances:} ${getImmResString(obj.resist)}`
            : null,
        entryDamageVulnerabilities: obj.vulnerable != null
            ? `{@b Damage Vulnerabilities:} ${getImmResString(obj.vulnerable)}`
            : null,
        entryConditionImmunities: obj.conditionImmune != null
            ? `{@b Condition Immunities:} ${getCondImmString(obj.conditionImmune)}`
            : null,
        entrySenses: obj.senses != null
            ? `{@b Senses:} ${getSensesString(obj.senses)}`
            : null,
    };
};
// ============ Object Markdown Renderer Class ============
export class ObjectMarkdownRenderer {
    _renderer;
    _styleHint;
    constructor(renderer, styleHint = "classic") {
        this._renderer = renderer ?? getMarkdownRenderer();
        this._styleHint = styleHint;
    }
    setRenderer(renderer) {
        this._renderer = renderer;
        return this;
    }
    setStyleHint(styleHint) {
        this._styleHint = styleHint;
        return this;
    }
    getCompactRenderedString(obj, opts = {}) {
        const entriesMeta = getObjectRenderableEntriesMeta(obj);
        const entries = [
            entriesMeta.entrySize,
            ...RENDERABLE_ENTRIES_PROP_ORDER
                .filter(prop => entriesMeta[prop] != null)
                .map(prop => entriesMeta[prop]),
            obj.entries ? { type: "entries", entries: obj.entries } : null,
            obj.actionEntries ? { type: "entries", entries: obj.actionEntries } : null,
        ];
        const filteredEntries = entries.filter(Boolean);
        const entFull = {
            ...obj,
            entries: filteredEntries,
        };
        return markdownUtils.withMetaDepth(2, opts, () => {
            return this._getGenericCompactRenderedString(entFull, opts);
        });
    }
    _getGenericCompactRenderedString(ent, opts) {
        const meta = opts.meta ?? createRenderMeta();
        const displayName = ent._displayName ?? ent.name;
        let out = `#### ${displayName}\n\n`;
        if (ent.entries?.length) {
            const cacheDepth = meta.depth;
            meta.depth = 2;
            for (const entry of ent.entries) {
                out += this._renderer.render(entry, { meta });
                out += "\n\n";
            }
            meta.depth = cacheDepth;
        }
        return `\n${out.trim()}\n\n`;
    }
}
// ============ Module Export ============
let _objectRenderer = null;
export const getObjectMarkdownRenderer = (styleHint = "classic") => {
    if (!_objectRenderer) {
        _objectRenderer = new ObjectMarkdownRenderer(undefined, styleHint);
    }
    else {
        _objectRenderer.setStyleHint(styleHint);
    }
    return _objectRenderer;
};
export const objectMarkdown = {
    getCompactRenderedString: (obj, opts = {}) => {
        return getObjectMarkdownRenderer(opts.styleHint).getCompactRenderedString(obj, opts);
    },
    getObjectRenderableEntriesMeta: (obj) => {
        return getObjectRenderableEntriesMeta(obj);
    },
};
// ============ Export Constants ============
export { RENDERABLE_ENTRIES_PROP_ORDER };
export default objectMarkdown;
//# sourceMappingURL=object.js.map