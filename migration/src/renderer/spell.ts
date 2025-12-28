// Spell HTML Renderer - TypeScript implementation
// Migrated from js/render.js Renderer.spell class
// Provides HTML rendering utilities for D&D 5e spell display

import type { StyleHint } from "./types.js";
import {
	spLevelSchoolMetaToFull,
	spTimeListToFull,
	spRangeToFull,
	spComponentsToFull,
	spDurationToFull,
	type SpellTime,
	type SpellMeta,
	type SpellRange,
	type SpellComponents,
	type SpellDuration,
} from "../parser/spell.js";

// ============ Types ============

export interface SpellData {
	name: string;
	level: number;
	school: string;
	meta?: SpellMeta;
	subschools?: string[];
	time: SpellTime[];
	range: SpellRange;
	components?: SpellComponents;
	duration: SpellDuration[];
}

export interface SpellHtmlOptions {
	styleHint?: StyleHint | null;
	isDisplaySelfArea?: boolean;
}

// ============ HTML Rendering Functions ============

export const getHtmlPtLevelSchoolRitual = (
	spell: SpellData,
	{ styleHint = null }: SpellHtmlOptions = {},
): string => {
	const levelSchoolMeta = spLevelSchoolMetaToFull(
		spell.level,
		spell.school,
		spell.meta,
		spell.subschools,
		{ styleHint },
	);
	return `<i>${levelSchoolMeta}</i>`;
};

export const getHtmlPtCastingTime = (
	spell: SpellData,
	{ styleHint = null }: SpellHtmlOptions = {},
): string => {
	const timeStr = spTimeListToFull(spell.time, spell.meta, { styleHint });
	return `<b>Casting Time:</b> ${timeStr}`;
};

export const getHtmlPtRange = (
	spell: SpellData,
	{ styleHint = null, isDisplaySelfArea = false }: SpellHtmlOptions = {},
): string => {
	const rangeStr = spRangeToFull(spell.range, { styleHint, isDisplaySelfArea });
	return `<b>Range:</b> ${rangeStr}`;
};

export const getHtmlPtComponents = (spell: SpellData): string => {
	const componentsStr = spComponentsToFull(spell.components, spell.level);
	return `<b>Components:</b> ${componentsStr}`;
};

export const getHtmlPtDuration = (
	spell: SpellData,
	{ styleHint = null }: SpellHtmlOptions = {},
): string => {
	const durationStr = spDurationToFull(spell.duration, { styleHint });
	return `<b>Duration:</b> ${durationStr}`;
};
