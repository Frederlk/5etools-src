// Spell HTML Renderer - TypeScript implementation
// Migrated from js/render.js Renderer.spell class
// Provides HTML rendering utilities for D&D 5e spell display
import { spLevelSchoolMetaToFull, spTimeListToFull, spRangeToFull, spComponentsToFull, spDurationToFull, } from "../parser/spell.js";
// ============ HTML Rendering Functions ============
export const getHtmlPtLevelSchoolRitual = (spell, { styleHint = null } = {}) => {
    const levelSchoolMeta = spLevelSchoolMetaToFull(spell.level, spell.school, spell.meta, spell.subschools, { styleHint });
    return `<i>${levelSchoolMeta}</i>`;
};
export const getHtmlPtCastingTime = (spell, { styleHint = null } = {}) => {
    const timeStr = spTimeListToFull(spell.time, spell.meta, { styleHint });
    return `<b>Casting Time:</b> ${timeStr}`;
};
export const getHtmlPtRange = (spell, { styleHint = null, isDisplaySelfArea = false } = {}) => {
    const rangeStr = spRangeToFull(spell.range, { styleHint, isDisplaySelfArea });
    return `<b>Range:</b> ${rangeStr}`;
};
export const getHtmlPtComponents = (spell) => {
    const componentsStr = spComponentsToFull(spell.components, spell.level);
    return `<b>Components:</b> ${componentsStr}`;
};
export const getHtmlPtDuration = (spell, { styleHint = null } = {}) => {
    const durationStr = spDurationToFull(spell.duration, { styleHint });
    return `<b>Duration:</b> ${durationStr}`;
};
//# sourceMappingURL=spell.js.map