// Monster Renderer - TypeScript implementation
// Migrated from js/render.js Renderer.monster class
// Provides HTML rendering utilities for monster statblocks
import { stripTags } from "./tags.js";
import { toTitleCase, uppercaseFirst } from "../util/str-util.js";
import { ascSortAtts, monTraitSort } from "../util/sort-util.js";
import { copyFast } from "../util/misc-util.js";
// ============ Constants ============
export const CHILD_PROPS = [
    "action",
    "bonus",
    "reaction",
    "trait",
    "legendary",
    "mythic",
    "variant",
    "spellcasting",
];
export const CHILD_PROPS__SPELLCASTING_DISPLAY_AS = [
    "trait",
    "action",
    "bonus",
    "reaction",
    "legendary",
    "mythic",
];
const ABIL_ABVS = ["str", "dex", "con", "int", "wis", "cha"];
const CR_CUSTOM = 100001;
const CR_UNKNOWN = 100000;
// ============ Short Name Functions ============
export const getShortName = (mon, { isTitleCase = false, isSentenceCase = false, isUseDisplayName = false } = {}) => {
    const name = isUseDisplayName ? (mon._displayName ?? mon.name) : mon.name;
    const shortName = isUseDisplayName ? (mon._displayShortName ?? mon.shortName) : mon.shortName;
    const prefix = mon.isNamedCreature ? "" : isTitleCase || isSentenceCase ? "The " : "the ";
    if (shortName === true)
        return `${prefix}${name}`;
    if (shortName) {
        return `${prefix}${!prefix && isTitleCase ? toTitleCase(String(shortName)) : String(shortName).toLowerCase()}`;
    }
    const out = getShortNameFromName(name, { isNamedCreature: mon.isNamedCreature });
    return `${prefix}${out}`;
};
export const getShortNameFromName = (name, { isNamedCreature = false } = {}) => {
    const base = name.split(",")[0];
    let out = base.replace(/(?:adult|ancient|young) \w+ (dragon|dracolich)/gi, "$1");
    out = isNamedCreature ? out.split(" ")[0] : out.toLowerCase();
    return out;
};
// ============ Pronoun Functions ============
export const getPronounSubject = (mon) => {
    return mon.isNamedCreature ? "they" : "it";
};
export const getPronounObject = (mon) => {
    return mon.isNamedCreature ? "them" : "its";
};
export const getPronounPossessive = (mon) => {
    return mon.isNamedCreature ? "their" : "its";
};
// ============ Legendary Action Functions ============
export const getLegendaryActionIntro = (mon, { renderer = defaultRender, isUseDisplayName = false, styleHint = null } = {}) => {
    const entry = getLegendaryActionIntroEntry(mon, { isUseDisplayName, styleHint });
    return renderer(entry);
};
export const getLegendaryActionIntroEntry = (mon, { isUseDisplayName = false, styleHint = null } = {}) => {
    if (mon.legendaryHeader) {
        return { entries: mon.legendaryHeader };
    }
    styleHint = styleHint ?? "classic";
    const legendaryActions = mon.legendaryActions ?? 3;
    const legendaryActionsLair = mon.legendaryActionsLair ?? legendaryActions;
    const legendaryNameTitle = getShortName(mon, { isTitleCase: true, isUseDisplayName });
    const proPossessive = getPronounPossessive(mon);
    if (styleHint === "classic") {
        return {
            entries: [
                `${legendaryNameTitle} can take ${legendaryActions} legendary action${legendaryActions > 1 ? "s" : ""}${legendaryActionsLair !== legendaryActions ? ` (or ${legendaryActionsLair} when in ${proPossessive} lair)` : ""}, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. ${legendaryNameTitle} regains spent legendary actions at the start of ${proPossessive} turn.`,
            ],
        };
    }
    const legendaryNameSentence = getShortName(mon, { isSentenceCase: true, isUseDisplayName });
    return {
        entries: [
            `{@note Legendary Action Uses: ${legendaryActions}${legendaryActionsLair !== legendaryActions ? ` (${legendaryActionsLair} in Lair)` : ""}. Immediately after another creature's turn, ${legendaryNameSentence} can expend a use to take one of the following actions. ${legendaryNameTitle} regains all expended uses at the start of each of ${proPossessive} turns.}`,
        ],
    };
};
// ============ Section Functions ============
export const getSectionIntro = (mon, { renderer = defaultRender, prop }) => {
    const headerProp = `${prop}Header`;
    const header = mon[headerProp];
    if (header)
        return renderer({ entries: header });
    return "";
};
// ============ Save Rendering ============
export const getSave = (renderer, attr, mod) => {
    if (attr === "special")
        return renderer(mod);
    return renderer(`<span>${uppercaseFirst(attr)} {@savingThrow ${attr} ${mod}}</span>`);
};
// ============ HP Rendering ============
const getFormulaMax = (formula) => {
    const match = formula.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match)
        return null;
    const [, numDice, diceSize, modifier] = match;
    const max = parseInt(numDice) * parseInt(diceSize) + (parseInt(modifier || "0") || 0);
    return max;
};
export const getRenderedHp = (hp, { isPlainText = false } = {}) => {
    if (hp.special != null)
        return isPlainText ? stripTags(hp.special) : hp.special;
    if (/^\d+d1$/.test(hp.formula ?? "")) {
        return String(hp.average);
    }
    if (isPlainText)
        return `${hp.average} (${hp.formula})`;
    const maxVal = hp.formula ? getFormulaMax(hp.formula) : null;
    const maxStr = maxVal ? `Maximum: ${maxVal}` : "";
    return `${maxStr ? `<span title="${maxStr}" class="help-subtle">` : ""}${hp.average}${maxStr ? "</span>" : ""} ({@dice ${hp.formula}|${hp.formula}|Hit Points})`;
};
// ============ Resource Rendering ============
export const getRenderedResource = (res, isPlainText = false) => {
    if (!res.formula)
        return `${res.value}`;
    if (isPlainText)
        return `${res.value} (${res.formula})`;
    const maxVal = getFormulaMax(res.formula);
    const maxStr = maxVal ? `Maximum: ${maxVal}` : "";
    return `${maxStr ? `<span title="${maxStr}" class="help-subtle">` : ""}${res.value}${maxStr ? "</span>" : ""} ({@dice ${res.formula}|${res.formula}|${res.name ?? "Resource"}})`;
};
// ============ Ability Score Functions ============
export const getSafeAbilityScore = (mon, abil, { defaultScore = 0 } = {}) => {
    if (!mon || abil == null)
        return defaultScore;
    const score = mon[abil];
    if (score == null)
        return defaultScore;
    return typeof score === "number" ? score : defaultScore;
};
const getAbilityModNumber = (score) => {
    return Math.floor((score - 10) / 2);
};
// ============ Sub-Entries Functions ============
export const getSpellcastingRenderedTraits = (renderer, mon, { displayAsProp = "trait" } = {}) => {
    return (mon.spellcasting || [])
        .filter(entry => (entry.displayAs || "trait") === displayAsProp)
        .map(entry => {
        const isLegendaryMythic = ["legendary", "mythic"].includes(displayAsProp);
        if (isLegendaryMythic) {
            if (!entry.headerEntries?.length)
                return null;
            return { type: "item", name: entry.name, entries: entry.headerEntries };
        }
        const entryWithType = { ...entry, type: entry.type ?? "spellcasting" };
        const rendered = renderer(entryWithType);
        if (!rendered.length)
            return null;
        return { name: entry.name, rendered };
    })
        .filter((it) => it != null);
};
export const getOrderedTraits = (mon, { fnGetSpellTraits } = {}) => {
    let traits = mon.trait ? copyFast(mon.trait) : null;
    if (fnGetSpellTraits) {
        const spellTraits = fnGetSpellTraits(mon, { displayAsProp: "trait" });
        if (spellTraits.length)
            traits = traits ? traits.concat(spellTraits) : spellTraits;
    }
    if (traits?.length)
        return traits.sort((a, b) => monTraitSort(a, b, stripTags));
    return null;
};
const getOrderedActionsBonusActions = ({ mon, fnGetSpellTraits, prop }) => {
    const propValue = mon[prop];
    let actions = propValue ? copyFast(propValue) : null;
    let spellActions;
    if (fnGetSpellTraits) {
        spellActions = fnGetSpellTraits(mon, { displayAsProp: prop });
    }
    if (!spellActions?.length && !actions?.length)
        return null;
    if (!actions?.length)
        return spellActions ?? null;
    if (!spellActions?.length)
        return actions;
    let ixLastAttack = -1;
    for (let i = actions.length - 1; i >= 0; i--) {
        const it = actions[i];
        if (it.entries && it.entries.length && typeof it.entries[0] === "string" && /{@atkr? /.test(it.entries[0])) {
            ixLastAttack = i;
            break;
        }
    }
    const actionsAttack = ~ixLastAttack ? actions.slice(0, ixLastAttack + 1) : [];
    const actionsOther = ~ixLastAttack ? actions.slice(ixLastAttack + 1) : actions;
    spellActions.forEach(ent => {
        if (!ent.name) {
            actionsOther.push(ent);
            return;
        }
        const ixInsert = actionsOther.findIndex((entAction) => entAction.name && (entAction.name.toLowerCase() >= ent.name.toLowerCase()));
        if (~ixInsert)
            actionsOther.splice(ixInsert, 0, ent);
        else
            actionsOther.push(ent);
    });
    return [...actionsAttack, ...actionsOther];
};
export const getOrderedActions = (mon, { fnGetSpellTraits } = {}) => {
    return getOrderedActionsBonusActions({ mon, fnGetSpellTraits, prop: "action" });
};
export const getOrderedBonusActions = (mon, { fnGetSpellTraits } = {}) => {
    return getOrderedActionsBonusActions({ mon, fnGetSpellTraits, prop: "bonus" });
};
export const getOrderedReactions = (mon, { fnGetSpellTraits } = {}) => {
    return getOrderedActionsBonusActions({ mon, fnGetSpellTraits, prop: "reaction" });
};
export const getOrderedLegendaryActions = (mon, { fnGetSpellTraits } = {}) => {
    return getOrderedActionsBonusActions({ mon, fnGetSpellTraits, prop: "legendary" });
};
export const getOrderedMythicActions = (mon, { fnGetSpellTraits } = {}) => {
    return getOrderedActionsBonusActions({ mon, fnGetSpellTraits, prop: "mythic" });
};
export const getSubEntries = (mon, { renderer = defaultRender, fnGetSpellTraits } = {}) => {
    const spellTraitsFn = fnGetSpellTraits ?? ((m, opts) => getSpellcastingRenderedTraits(renderer, m, opts));
    const entsTrait = getOrderedTraits(mon, { fnGetSpellTraits: spellTraitsFn });
    const entsAction = getOrderedActions(mon, { fnGetSpellTraits: spellTraitsFn });
    const entsBonusAction = getOrderedBonusActions(mon, { fnGetSpellTraits: spellTraitsFn });
    const entsReaction = getOrderedReactions(mon, { fnGetSpellTraits: spellTraitsFn });
    const entsLegendaryAction = getOrderedLegendaryActions(mon, { fnGetSpellTraits: spellTraitsFn });
    const entsMythicAction = getOrderedMythicActions(mon, { fnGetSpellTraits: spellTraitsFn });
    return {
        entsTrait,
        entsAction,
        entsBonusAction,
        entsReaction,
        entsLegendaryAction,
        entsMythicAction,
        legGroup: null,
    };
};
// ============ Type/Alignment Functions ============
export const getTypeAlignmentPart = (mon) => {
    const typeObj = getMonTypeFullObj(mon.type);
    const ptLevel = mon.level != null ? `${getOrdinalForm(mon.level)}-level ` : "";
    const ptSidekick = typeObj.asTextSidekick ? `${typeObj.asTextSidekick}; ` : "";
    const ptSize = getRenderedSize(mon.size);
    const ptSizeNote = mon.sizeNote ? ` ${mon.sizeNote}` : "";
    const ptType = typeObj.asText;
    const ptAlignment = mon.alignment
        ? `, ${mon.alignmentPrefix ? mon.alignmentPrefix : ""}${toTitleCase(alignmentListToFull(mon.alignment))}`
        : "";
    return `${ptLevel}${ptSidekick}${ptSize}${ptSizeNote} ${ptType}${ptAlignment}`;
};
// ============ Initiative Functions ============
const getInitiativePassive = ({ mon, initBonus }) => {
    if (initBonus == null)
        return null;
    if (mon.initiative == null || typeof mon.initiative !== "object")
        return 10 + initBonus;
    const init = mon.initiative;
    const advDisMod = init.advantageMode === "adv" ? 5 : init.advantageMode === "dis" ? -5 : 0;
    return 10 + initBonus + advDisMod;
};
export const getInitiativeBonusNumber = ({ mon }) => {
    if (mon.initiative == null && (mon.dex == null || isSpecialAbilityScore(mon.dex)))
        return null;
    if (mon.initiative == null)
        return getAbilityModNumber(mon.dex);
    if (typeof mon.initiative === "number")
        return mon.initiative;
    if (typeof mon.initiative !== "object")
        return null;
    const init = mon.initiative;
    if (typeof init.initiative === "number")
        return init.initiative;
    if (mon.dex == null)
        return null;
    const crNum = crToNumber(mon.cr);
    const profBonus = init.proficiency && crNum < CR_CUSTOM
        ? init.proficiency * crToPb(crNum)
        : 0;
    return getAbilityModNumber(mon.dex) + profBonus;
};
const getInitiativePartPassive = ({ mon, initPassive }) => {
    if (!mon.initiative || typeof mon.initiative !== "object")
        return String(initPassive);
    const init = mon.initiative;
    if (!init.advantageMode)
        return String(initPassive);
    const ptTitle = `This creature has ${init.advantageMode === "adv" ? "Advantage" : "Disadvantage"} on Initiative.`;
    return `<span title="${escapeQuotes(ptTitle)}" class="help-subtle">${initPassive}</span>`;
};
export const getInitiativePart = (mon, { isPlainText = false, renderer = defaultRender } = {}) => {
    const initBonus = getInitiativeBonusNumber({ mon });
    const initPassive = getInitiativePassive({ mon, initBonus });
    if (initBonus == null || initPassive == null)
        return "\u2014";
    const entry = `{@initiative ${initBonus}} (${getInitiativePartPassive({ mon, initPassive })})`;
    return isPlainText ? stripTags(entry) : renderer(entry);
};
// ============ Saves Functions ============
export const getSavesPart = (mon) => {
    const saves = mon.save || {};
    return Object.keys(saves)
        .sort(ascSortAtts)
        .map(s => getSave(defaultRender, s, saves[s]))
        .join(", ");
};
// ============ Senses Functions ============
export const getSensesPart = (mon, { isTitleCase = false, isForcePassive = false } = {}) => {
    const passive = mon.passive ?? (typeof mon.wis === "number" ? 10 + getAbilityModNumber(mon.wis) : null);
    const pts = [
        mon.senses ? getRenderedSenses(mon.senses, { isTitleCase }) : "",
        passive != null
            ? `${isTitleCase ? "Passive" : "passive"} Perception ${passive}`
            : (isForcePassive || mon.senses) ? "\u2014" : "",
    ].filter(Boolean);
    return pts.join(", ");
};
// ============ Proficiency Bonus Functions ============
export const getPbPart = (mon, { isPlainText = false } = {}) => {
    const crNum = crToNumber(mon.cr);
    if (!mon.pbNote && crNum >= CR_CUSTOM)
        return "";
    if (mon.pbNote)
        return mon.pbNote;
    return intToBonus(crToPb(crNum), { isPretty: true });
};
// ============ Challenge Rating Functions ============
const getChallengeRatingPartClassicBasicRender = ({ cr = null, xp = null, isMythic = false } = {}) => {
    if (cr == null && xp == null)
        return null;
    const crNum = cr ? crToNumber(cr) : CR_CUSTOM;
    xp = xp ?? (crNum < CR_CUSTOM ? crToXpNumber(crNum) : null);
    const xpMythic = xp != null && isMythic ? xp * 2 : null;
    const ptXp = xp != null ? xp.toLocaleString() : null;
    const ptXpMythic = xpMythic != null ? xpMythic.toLocaleString() : null;
    const ptXps = [
        ptXp != null ? `${ptXp} XP` : null,
        ptXpMythic != null ? `${ptXpMythic} XP as a mythic encounter` : null,
    ].filter(Boolean).join(", or ");
    if (cr == null && !ptXps)
        return null;
    if (cr == null)
        return `(${ptXps})`;
    if (crNum >= CR_CUSTOM)
        return `${cr}${ptXps ? ` (${ptXps})` : ""}`;
    return `${cr} (${ptXps})`;
};
const getChallengeRatingPartClassic = ({ mon, isPlainText = false }) => {
    if (mon.cr == null)
        return "\u2014";
    if (typeof mon.cr === "string") {
        return getChallengeRatingPartClassicBasicRender({ cr: mon.cr, isMythic: hasMythicActions(mon) }) ?? "\u2014";
    }
    const stack = [];
    const crObj = mon.cr;
    const basic = getChallengeRatingPartClassicBasicRender({ cr: crObj.cr, xp: crObj.xp, isMythic: hasMythicActions(mon) });
    if (basic)
        stack.push(basic);
    if (crObj.lair || crObj.xpLair) {
        const lairPart = getChallengeRatingPartClassicBasicRender({ cr: crObj.lair, xp: crObj.xpLair });
        if (lairPart)
            stack.push(`${lairPart} when encountered in lair`);
    }
    if (crObj.coven || crObj.xpCoven) {
        const covenPart = getChallengeRatingPartClassicBasicRender({ cr: crObj.coven, xp: crObj.xpCoven });
        if (covenPart)
            stack.push(`${covenPart} when part of a coven`);
    }
    return stack.filter(Boolean).join(", or ") || "\u2014";
};
const getChallengeRatingPartOne = ({ mon, isPlainText = false }) => {
    const crObj = typeof mon.cr === "object" ? mon.cr : null;
    const crBase = crObj?.cr ?? mon.cr;
    const crNum = crToNumber(crBase);
    const xpBase = crObj?.xp ?? (crNum < CR_CUSTOM ? crToXpNumber(crNum) : 0);
    const ptsXp = crNum >= CR_CUSTOM
        ? [String(xpBase)]
        : [
            xpBase ? xpBase.toLocaleString() : null,
            hasMythicActions(mon) ? `${(xpBase * 2).toLocaleString()} as a mythic encounter` : null,
        ].filter((it) => it != null);
    if (crObj) {
        if (crObj.lair || crObj.xpLair) {
            const lairXp = crObj.xpLair?.toLocaleString() ?? (crObj.lair ? crToXp(crObj.lair) : null);
            if (lairXp)
                ptsXp.push(`${lairXp} in lair`);
        }
        if (crObj.coven || crObj.xpCoven) {
            const covenXp = crObj.xpCoven?.toLocaleString() ?? (crObj.coven ? crToXp(crObj.coven) : null);
            if (covenXp)
                ptsXp.push(`${covenXp} when part of a coven`);
        }
    }
    const ptPbVal = getPbPart(mon, { isPlainText });
    const ptParens = [
        ptsXp.length ? `XP ${ptsXp.join(", or ")}` : "",
        ptPbVal ? `${isPlainText ? "PB" : `<span title="Proficiency Bonus">PB</span>`} ${ptPbVal}` : "",
    ].filter(Boolean).join("; ");
    return `${crBase || "None"}${ptParens ? ` (${ptParens})` : ""}`;
};
export const getChallengeRatingPart = (mon, { styleHint = null, isPlainText = false } = {}) => {
    styleHint = styleHint ?? "classic";
    switch (styleHint) {
        case "classic": return getChallengeRatingPartClassic({ mon, isPlainText });
        case "one": return getChallengeRatingPartOne({ mon, isPlainText });
        default: throw new Error(`Unhandled style "${styleHint}"!`);
    }
};
// ============ Immunities Functions ============
export const getImmunitiesCombinedPart = (mon, { isPlainText = false } = {}) => {
    if (!mon.immune && !mon.conditionImmune)
        return "";
    const ptImmune = mon.immune ? getFullImmRes(mon.immune, { isTitleCase: true, isPlainText }) : "";
    const ptConditionImmune = mon.conditionImmune ? getFullCondImm(mon.conditionImmune, { isTitleCase: true, isPlainText }) : "";
    const hasSemi = ptImmune && ptConditionImmune && (ptImmune.includes(";") || ptConditionImmune.includes(";"));
    const joiner = !hasSemi || !isPlainText ? "; " : `<span class="italic">;</span> `;
    return [ptImmune, ptConditionImmune].filter(Boolean).join(joiner);
};
// ============ Gear Functions ============
export const getGearPart = (mon, { renderer = defaultRender } = {}) => {
    if (!mon.gear?.length && !mon.attachedItems?.length)
        return "";
    const items = mon.gear || mon.attachedItems || [];
    return items
        .map(ref => {
        const uid = typeof ref === "string" ? ref : ref.item ?? "";
        const quantity = typeof ref === "object" ? ref.quantity ?? 1 : 1;
        const namePart = uid.split("|")[0];
        const titleCaseName = toTitleCase(namePart);
        if (quantity === 1)
            return renderer(`{@item ${titleCaseName}}`);
        const displayName = toPlural(titleCaseName);
        return renderer(`${numberToText(quantity)} {@item ${titleCaseName}|${displayName}}`);
    })
        .join(", ");
};
// ============ Skills Functions ============
export const getSkillsString = (renderer, mon) => {
    if (!mon.skill)
        return "";
    const doSortMapJoinSkillKeys = (obj, keys, joinWithOr = false) => {
        const toJoin = keys.sort().map(s => `<span data-mon-skill="${toTitleCase(s)}|${obj[s]}">${renderer(`{@skill ${toTitleCase(s)}}`)} ${renderer(`{@skillCheck ${s.replace(/ /g, "_")} ${obj[s]}}`)}</span>`);
        return joinWithOr ? joinConjunct(toJoin, ", ", " or ") : toJoin.join(", ");
    };
    const skillKeys = Object.keys(mon.skill).filter(k => k !== "other" && k !== "special");
    const skills = doSortMapJoinSkillKeys(mon.skill, skillKeys);
    if (mon.skill.other || mon.skill.special) {
        const others = mon.skill.other?.map(it => {
            if (it.oneOf) {
                return `plus one of the following: ${doSortMapJoinSkillKeys(it.oneOf, Object.keys(it.oneOf), true)}`;
            }
            throw new Error("Unhandled monster 'other' skill properties!");
        });
        const special = mon.skill.special ? renderer(mon.skill.special) : null;
        return [skills, ...(others ?? []), special].filter(Boolean).join(", ");
    }
    return skills;
};
// ============ Tools Functions ============
const TOOL_PROF_TO_SOURCE_CLASSIC = {
    "vehicles": false,
    "vehicles (air)": false,
    "vehicles (land)": false,
    "vehicles (water)": false,
    "vehicles (space)": false,
};
const TOOL_PROF_TO_SOURCE_ONE = {
    "playing card set": { name: "Playing Cards" },
};
export const getToolsString = (renderer, mon, { styleHint = null } = {}) => {
    if (!mon.tool)
        return "";
    styleHint = styleHint ?? "classic";
    return Object.entries(mon.tool)
        .map(([uid, bonus]) => {
        if (uid.includes("|")) {
            const namePart = uid.split("|")[0];
            const sourcePart = uid.split("|")[1];
            return `${renderer(`{@item ${toTitleCase(namePart)}|${sourcePart}} {@d20 ${bonus}||${toTitleCase(namePart)}}`)}`;
        }
        const mappingClassic = TOOL_PROF_TO_SOURCE_CLASSIC[uid];
        const mappingOne = TOOL_PROF_TO_SOURCE_ONE[uid];
        const mapping = mappingClassic ?? mappingOne;
        if (mapping === false) {
            return `${toTitleCase(uid)} ${renderer(`{@d20 ${bonus}||${toTitleCase(uid)}}`)}`;
        }
        const source = styleHint === "one" ? "XPHB" : "PHB";
        const itemName = mapping?.name ?? uid;
        return `${renderer(`{@item ${toTitleCase(itemName)}|${source}} {@d20 ${bonus}||${toTitleCase(itemName)}}`)}`;
    })
        .join(", ");
};
// ============ Languages Functions ============
export const getRenderedLanguages = (languages, { styleHint = null } = {}) => {
    styleHint = styleHint ?? "classic";
    if (typeof languages === "string")
        languages = [languages];
    if (!languages?.length)
        return "\u2014";
    const out = languages.map(it => defaultRender(it)).join(", ");
    if (styleHint === "classic")
        return out;
    return uppercaseFirst(out);
};
// ============ Action Check Functions ============
export const hasLegendaryActions = (mon) => {
    return !!(mon.legendary?.length || mon.spellcasting?.some(ent => ent.displayAs === "legendary"));
};
export const hasMythicActions = (mon) => {
    return !!(mon.mythic?.length || mon.spellcasting?.some(ent => ent.displayAs === "mythic"));
};
export const hasReactions = (mon) => {
    return !!(mon.reaction?.length || mon.spellcasting?.some(ent => ent.displayAs === "reaction"));
};
export const hasBonusActions = (mon) => {
    return !!(mon.bonus?.length || mon.spellcasting?.some(ent => ent.displayAs === "bonus"));
};
// ============ Helper Functions ============
const defaultRender = (entry) => {
    if (typeof entry === "string")
        return entry;
    if (Array.isArray(entry))
        return entry.map(defaultRender).join("");
    return JSON.stringify(entry);
};
const isSpecialAbilityScore = (score) => {
    return score != null && typeof score === "object" && "special" in score;
};
const crToNumber = (cr) => {
    if (cr == null)
        return CR_UNKNOWN;
    const crStr = typeof cr === "object" ? cr.cr : cr;
    if (!crStr)
        return CR_UNKNOWN;
    if (crStr === "Unknown" || crStr === "\u2014")
        return CR_UNKNOWN;
    const match = crStr.match(/^(\d+)\/(\d+)$/);
    if (match)
        return parseInt(match[1]) / parseInt(match[2]);
    const num = parseFloat(crStr);
    return isNaN(num) ? CR_UNKNOWN : num;
};
const crToPb = (crNum) => {
    if (crNum < 5)
        return 2;
    return Math.ceil(crNum / 4) + 1;
};
const XP_BY_CR = {
    "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
    "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
    "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
    "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000,
    "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
    "21": 33000, "22": 41000, "23": 50000, "24": 62000, "25": 75000,
    "26": 90000, "27": 105000, "28": 120000, "29": 135000, "30": 155000,
};
const crToXpNumber = (crNum) => {
    const crStr = crNum < 1 ? `1/${Math.round(1 / crNum)}` : String(crNum);
    return XP_BY_CR[crStr] ?? 0;
};
const crToXp = (cr) => {
    const xp = XP_BY_CR[cr];
    return xp != null ? xp.toLocaleString() : "0";
};
const intToBonus = (num, { isPretty = false } = {}) => {
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num}`;
};
const escapeQuotes = (str) => {
    return str.replace(/"/g, "&quot;").replace(/'/g, "&apos;");
};
const getOrdinalForm = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};
const SIZE_ABV_TO_FULL = {
    F: "Fine", D: "Diminutive", T: "Tiny", S: "Small", M: "Medium",
    L: "Large", H: "Huge", G: "Gargantuan", C: "Colossal", V: "Varies",
};
const getRenderedSize = (size) => {
    if (!size)
        return "";
    if (Array.isArray(size))
        return size.map(s => SIZE_ABV_TO_FULL[s] || s).join("/");
    return SIZE_ABV_TO_FULL[size] || size;
};
const getRenderedSenses = (senses, { isTitleCase = false } = {}) => {
    if (isTitleCase)
        return toTitleCase(senses);
    return senses;
};
const getMonTypeFullObj = (type) => {
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
    const typeObj = type;
    if (typeof typeObj.type === "object" && "choose" in typeObj.type) {
        out.types = typeObj.type.choose;
    }
    else {
        out.types = [typeObj.type];
    }
    if (typeObj.swarmSize) {
        out.tags.push("swarm");
        const pluralTypes = out.types.map(t => toPlural(toTitleCase(t)));
        out.asText = `swarm of ${SIZE_ABV_TO_FULL[typeObj.swarmSize] || typeObj.swarmSize} ${joinConjunct(pluralTypes, ", ", " or ")}`;
        out.asTextShort = out.asText;
        out.swarmSize = typeObj.swarmSize;
    }
    else {
        out.asText = joinConjunct(out.types.map(t => toTitleCase(t)), ", ", " or ");
        out.asTextShort = out.asText;
    }
    if (typeObj.tags?.length) {
        const tagMetas = typeObj.tags.map(tag => {
            if (typeof tag === "string")
                return { filterTag: tag.toLowerCase(), displayTag: toTitleCase(tag) };
            return { filterTag: tag.tag.toLowerCase(), displayTag: toTitleCase(`${tag.prefix} ${tag.tag}`) };
        });
        out.tags.push(...tagMetas.map(m => m.filterTag));
        const ptTags = ` (${tagMetas.map(m => m.displayTag).join(", ")})`;
        out.asText += ptTags;
        out.asTextShort += ptTags;
    }
    if (typeObj.note)
        out.asText += ` ${typeObj.note}`;
    if (typeObj.sidekickType) {
        out.typeSidekick = typeObj.sidekickType;
        if (!typeObj.sidekickHidden)
            out.asTextSidekick = typeObj.sidekickType;
        if (typeObj.sidekickTags?.length) {
            const sidekickTagMetas = typeObj.sidekickTags.map(tag => {
                if (typeof tag === "string")
                    return { filterTag: tag.toLowerCase(), displayTag: toTitleCase(tag) };
                return { filterTag: tag.tag.toLowerCase(), displayTag: toTitleCase(`${tag.prefix} ${tag.tag}`) };
            });
            out.tagsSidekick.push(...sidekickTagMetas.map(m => m.filterTag));
            if (!typeObj.sidekickHidden) {
                out.asTextSidekick = (out.asTextSidekick ?? "") + ` (${sidekickTagMetas.map(m => m.displayTag).join(", ")})`;
            }
        }
    }
    return out;
};
const ALIGNMENT_ABV_TO_FULL = {
    L: "lawful", N: "neutral", NX: "neutral (law/chaos axis)", NY: "neutral (good/evil axis)",
    C: "chaotic", G: "good", E: "evil", U: "unaligned", A: "any alignment",
};
const alignmentListToFull = (alignList) => {
    if (!alignList)
        return "";
    if (alignList.some(it => typeof it !== "string")) {
        if (alignList.some(it => typeof it === "string")) {
            throw new Error(`Mixed alignment types: ${JSON.stringify(alignList)}`);
        }
        return alignList
            .filter(it => it.alignment === undefined || it.alignment != null)
            .map(it => {
            if (it.special != null)
                return it.special;
            if (it.chance != null || it.note != null) {
                const base = alignmentListToFull(it.alignment ?? []);
                return `${base}${it.chance ? ` (${it.chance}%)` : ""}${it.note ? ` (${it.note})` : ""}`;
            }
            return alignmentListToFull(it.alignment ?? []);
        })
            .join(" or ");
    }
    const strList = alignList;
    if (strList.length === 1)
        return ALIGNMENT_ABV_TO_FULL[strList[0].toUpperCase()] ?? strList[0];
    if (strList.length === 2)
        return strList.map(a => ALIGNMENT_ABV_TO_FULL[a.toUpperCase()] ?? a).join(" ");
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
const getFullImmRes = (values, { isTitleCase = false, isPlainText = false } = {}) => {
    if (!values?.length)
        return "";
    return values
        .map(val => {
        if (typeof val === "string")
            return isTitleCase ? toTitleCase(val) : val;
        if (val.special)
            return isPlainText ? stripTags(val.special) : val.special;
        const parts = [];
        if (val.preNote)
            parts.push(val.preNote);
        const innerTypes = val.immune || val.resist || val.vulnerable || [];
        parts.push(innerTypes.map(t => isTitleCase ? toTitleCase(t) : t).join(", "));
        if (val.note)
            parts.push(val.note);
        return parts.join(" ");
    })
        .join("; ");
};
const getFullCondImm = (values, { isTitleCase = false, isPlainText = false } = {}) => {
    if (!values?.length)
        return "";
    return values
        .map(val => {
        if (typeof val === "string") {
            const formatted = isTitleCase ? toTitleCase(val) : val;
            return isPlainText ? formatted : `{@condition ${formatted}}`;
        }
        if (val.special)
            return isPlainText ? stripTags(val.special) : val.special;
        const condVal = val;
        const parts = [];
        if (condVal.preNote)
            parts.push(condVal.preNote);
        const conditions = condVal.conditionImmune || [];
        parts.push(conditions
            .map(c => {
            const formatted = isTitleCase ? toTitleCase(c) : c;
            return isPlainText ? formatted : `{@condition ${formatted}}`;
        })
            .join(", "));
        if (condVal.note)
            parts.push(condVal.note);
        return parts.join(" ");
    })
        .join(", ");
};
const numberToText = (num) => {
    const NUMBERS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    if (num >= 0 && num <= 10)
        return NUMBERS[num];
    return String(num);
};
const toPlural = (str) => {
    if (/[sxz]$/i.test(str) || /(ch|sh)$/i.test(str))
        return `${str}es`;
    if (/[bcdfghjklmnpqrstvwxyz]y$/i.test(str))
        return `${str.slice(0, -1)}ies`;
    return `${str}s`;
};
const joinConjunct = (arr, joiner, lastJoiner) => {
    if (arr.length === 0)
        return "";
    if (arr.length === 1)
        return arr[0];
    if (arr.length === 2)
        return arr.join(lastJoiner);
    return `${arr.slice(0, -1).join(joiner)}${lastJoiner}${arr[arr.length - 1]}`;
};
//# sourceMappingURL=monster.js.map