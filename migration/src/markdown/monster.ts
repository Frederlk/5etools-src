// Monster Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.monster
// Provides monster-specific markdown rendering

import type { Monster, DamageImmunityEntry, ConditionImmuneEntry, DamageResistEntry, DamageVulnerabilityEntry } from "../../../types/bestiary/bestiary.js";
import type { MonsterExtended, MonsterResource, MonsterSaveWithSpecial, MonsterSkillWithOther } from "../types/monster-extended.js";
import type { Entry } from "../../../types/entry.js";
import type { RenderMeta, StyleHint, CompactRenderResult } from "../renderer/types.js";
import { createRenderMeta } from "../renderer/types.js";
import { stripTags } from "../renderer/tags.js";
import { ABIL_ABVS, getAbilityModifier } from "../parser/attributes.js";
import { ascSortAtts } from "../util/sort-util.js";
import { getMarkdownRenderer, markdownUtils, type MarkdownRenderer } from "./renderer.js";

// ============ Types ============

export interface MonsterRenderOptions {
	meta?: RenderMeta;
	isHideSenses?: boolean;
	isHideLanguages?: boolean;
	styleHint?: StyleHint;
	isAddColumnBreaks?: boolean;
}

export interface MonsterMdParts {
	mdPtName: string;
	mdPtSizeTypeAlignment: string;
	mdPtAc: string;
	mdPtHpResource: string;
	mdPtSpeedInitiative: string;
	mdPtAbilityScores: string;
	mdPtSave: string;
	mdPtSkill: string;
	mdPtTool: string;
	mdPtDamVuln: string;
	mdPtDamRes: string;
	mdPtSense: string;
	mdPtLanguage: string;
	mdPtCr: string;
	mdPtPb: string;
	mdPtBreakable: string;
}

// ============ Helper Functions ============

const getMonsterTypeString = (type: any): string => {
	if (typeof type === "string") return type;
	if (!type) return "";

	let typeStr = type.type || "";

	if (type.swarmSize) {
		typeStr = `swarm of ${type.swarmSize} ${typeStr}s`;
	}

	if (type.tags?.length) {
		const tagStrs = type.tags.map((t: any) => {
			if (typeof t === "string") return t;
			return t.prefix ? `${t.prefix} ${t.tag}` : t.tag;
		});
		typeStr += ` (${tagStrs.join(", ")})`;
	}

	return typeStr;
};

const getAlignmentString = (alignment: any): string => {
	if (!alignment) return "";
	if (typeof alignment === "string") return alignment;

	if (Array.isArray(alignment)) {
		const mapped = alignment.map(a => {
			if (typeof a === "string") return getAlignmentAbbreviation(a);
			if (a.alignment) {
				return a.alignment.map((aa: string) => getAlignmentAbbreviation(aa)).join(" ");
			}
			if (a.special) return a.special;
			return "";
		});
		return mapped.filter(Boolean).join(" or ");
	}

	return "";
};

const getAlignmentAbbreviation = (align: string): string => {
	const map: Record<string, string> = {
		L: "Lawful",
		N: "Neutral",
		C: "Chaotic",
		G: "Good",
		E: "Evil",
		U: "Unaligned",
		A: "Any",
	};
	return map[align] || align;
};

const getSizeString = (size: any): string => {
	if (typeof size === "string") return getSizeAbbreviation(size);
	if (Array.isArray(size)) {
		return size.map(s => getSizeString(s)).join(" or ");
	}
	if (size?.size) return getSizeString(size.size);
	return "";
};

const getSizeAbbreviation = (size: string): string => {
	const map: Record<string, string> = {
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

const getAcString = (ac: any, renderer: MarkdownRenderer): string => {
	if (ac == null) return "\u2014";
	if (typeof ac === "number") return String(ac);
	if (typeof ac === "string") return ac;

	if (Array.isArray(ac)) {
		return ac.map(a => getAcString(a, renderer)).join(", ");
	}

	let out = "";
	if (ac.ac != null) out += ac.ac;
	if (ac.from?.length) {
		const fromStr = ac.from.map((f: string) => stripTags(f)).join(", ");
		out += ` (${fromStr})`;
	}
	if (ac.condition) {
		out += ` ${stripTags(ac.condition)}`;
	}
	if (ac.braces) {
		out = `(${out})`;
	}

	return out;
};

const getHpString = (hp: any): string => {
	if (hp == null) return "\u2014";
	if (typeof hp === "number") return String(hp);
	if (typeof hp === "string") return hp;

	let out = "";
	if (hp.average != null) out += hp.average;
	if (hp.formula) {
		out += ` (${hp.formula})`;
	}
	if (hp.special) {
		out = hp.special;
	}

	return out;
};

const getSpeedString = (speed: any): string => {
	if (!speed) return "\u2014";
	if (typeof speed === "string") return speed;
	if (typeof speed === "number") return `${speed} ft.`;

	const parts: string[] = [];

	if (speed.walk != null) {
		const walkStr = typeof speed.walk === "number"
			? `${speed.walk} ft.`
			: getSpeedValue(speed.walk);
		parts.push(walkStr);
	}

	const modes = ["burrow", "climb", "fly", "swim"];
	for (const mode of modes) {
		if (speed[mode] != null) {
			const modeVal = typeof speed[mode] === "number"
				? speed[mode]
				: speed[mode].number || speed[mode];
			let modeStr = `${mode} ${modeVal} ft.`;

			if (typeof speed[mode] === "object" && speed[mode].condition) {
				modeStr += ` ${stripTags(speed[mode].condition)}`;
			}
			if (mode === "fly" && speed.canHover) {
				modeStr += " (hover)";
			}
			parts.push(modeStr);
		}
	}

	return parts.join(", ") || "\u2014";
};

const getSpeedValue = (val: any): string => {
	if (typeof val === "number") return `${val} ft.`;
	if (val.number != null) {
		let out = `${val.number} ft.`;
		if (val.condition) out += ` ${stripTags(val.condition)}`;
		return out;
	}
	return String(val);
};

const getImmResString = (arr: any[], opts: { isPlainText?: boolean; isTitleCase?: boolean } = {}): string => {
	if (!arr?.length) return "";

	return arr.map(it => {
		if (typeof it === "string") {
			return opts.isTitleCase ? it.charAt(0).toUpperCase() + it.slice(1) : it;
		}
		if (it.special) return it.special;

		const dmgTypes = it[it.immune ? "immune" : it.resist ? "resist" : "vulnerable"] || [];
		let out = dmgTypes.map((d: string) =>
			opts.isTitleCase ? d.charAt(0).toUpperCase() + d.slice(1) : d
		).join(", ");

		if (it.preNote) out = `${it.preNote} ${out}`;
		if (it.note) out += ` ${it.note}`;
		if (it.cond) out += ` ${stripTags(it.cond)}`;

		return out;
	}).join("; ");
};

const getCondImmString = (arr: any[], opts: { isPlainText?: boolean; isTitleCase?: boolean } = {}): string => {
	if (!arr?.length) return "";

	return arr.map(it => {
		if (typeof it === "string") {
			return opts.isTitleCase ? it.charAt(0).toUpperCase() + it.slice(1) : it;
		}
		if (it.special) return it.special;

		const conditions = it.conditionImmune || [];
		let out = conditions.map((c: string) =>
			opts.isTitleCase ? c.charAt(0).toUpperCase() + c.slice(1) : c
		).join(", ");

		if (it.preNote) out = `${it.preNote} ${out}`;
		if (it.note) out += ` ${it.note}`;

		return out;
	}).join("; ");
};

const getLanguagesString = (languages: any, styleHint: StyleHint = "classic"): string => {
	if (!languages) return "\u2014";
	if (typeof languages === "string") return languages;
	if (Array.isArray(languages)) return languages.join(", ") || "\u2014";
	return "\u2014";
};

const getCrString = (cr: any, styleHint: StyleHint = "classic"): string => {
	if (cr == null) return "\u2014";
	if (typeof cr === "string") return cr;
	if (typeof cr === "number") return String(cr);

	if (cr.cr) {
		let out = cr.cr;
		if (cr.lair) out += ` (${cr.lair} in lair)`;
		if (cr.coven) out += ` (${cr.coven} in coven)`;
		return out;
	}

	return "\u2014";
};

const getXpString = (cr: any): string => {
	const xpByCr: Record<string, number> = {
		"0": 0, "1/8": 25, "1/4": 50, "1/2": 100,
		"1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
		"6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
		"11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000,
		"16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
		"21": 33000, "22": 41000, "23": 50000, "24": 62000, "25": 75000,
		"26": 90000, "27": 105000, "28": 120000, "29": 135000, "30": 155000,
	};

	const crVal = typeof cr === "object" ? cr.cr : cr;
	const xp = xpByCr[String(crVal)];

	if (xp == null) return "";
	return `${xp.toLocaleString()} XP`;
};

const getPbString = (mon: any): string => {
	if (mon.pbNote) return mon.pbNote;
	if (mon.cr == null) return "";

	const cr = typeof mon.cr === "object" ? mon.cr.cr : mon.cr;
	const pb = Math.max(2, Math.floor((parseFloat(cr) - 1) / 4) + 2);
	return `+${pb}`;
};

// ============ Monster Renderer Class ============

export abstract class MonsterMarkdownRendererBase {
	protected abstract _style: StyleHint;

	getCompactRenderedString(mon: Monster, opts: MonsterRenderOptions = {}): string {
		const meta = opts.meta || createRenderMeta();
		const renderer = getMarkdownRenderer();

		let addedStatblockInline = false;
		if (!meta.isStatblockInlineMonster) {
			meta.isStatblockInlineMonster = true;
			addedStatblockInline = true;
		}

		let { ptUnbreakable, ptBreakable } = this._getCompactRenderedString({
			mon,
			opts,
			meta,
			renderer,
		});

		ptBreakable = ptBreakable
			.replace(/\n>\n/g, "\n\n")
			.replace(/\n\n+/g, "\n\n");

		if (opts.isAddColumnBreaks) {
			let charAllowanceFirstCol = 2200 - ptUnbreakable.length;

			const breakableLines = ptBreakable.split("\n");
			for (let i = 0; i < breakableLines.length; ++i) {
				const l = breakableLines[i];
				if ((charAllowanceFirstCol -= l.length) < 0) {
					breakableLines.splice(i, 0, ">", "> \\columnbreak", ">");
					break;
				}
			}
			ptBreakable = breakableLines.join("\n");
		}

		const monRender = `${ptUnbreakable}${ptBreakable}`
			.trim()
			.split("\n")
			.map(it => it.trim() ? it : ">")
			.join("\n");

		const out = `\n${monRender}\n\n`;

		if (addedStatblockInline) {
			delete meta.isStatblockInlineMonster;
		}

		return out;
	}

	protected abstract _getCompactRenderedString(params: {
		mon: Monster;
		opts: MonsterRenderOptions;
		meta: RenderMeta;
		renderer: MarkdownRenderer;
	}): CompactRenderResult;

	protected _getCommonMdParts(params: {
		mon: Monster;
		opts: MonsterRenderOptions;
		renderer: MarkdownRenderer;
	}): MonsterMdParts {
		const { mon, opts, renderer } = params;

		return {
			mdPtName: this._getCommonMdParts_name(mon),
			mdPtSizeTypeAlignment: this._getCommonMdParts_sizeTypeAlignment(mon),
			mdPtAc: this._getCommonMdParts_ac(mon, renderer),
			mdPtHpResource: this._getCommonMdParts_hpResource(mon),
			mdPtSpeedInitiative: this._getCommonMdParts_speedInitiative(mon),
			mdPtAbilityScores: this._getCommonMdParts_abilityScores(mon),
			mdPtSave: this._getCommonMdParts_save(mon),
			mdPtSkill: this._getCommonMdParts_skill(mon),
			mdPtTool: this._getCommonMdParts_tool(mon),
			mdPtDamVuln: this._getCommonMdParts_damVuln(mon),
			mdPtDamRes: this._getCommonMdParts_damRes(mon),
			mdPtSense: this._getCommonMdParts_sense(mon, opts),
			mdPtLanguage: this._getCommonMdParts_language(mon, opts),
			mdPtCr: this._getCommonMdParts_cr(mon),
			mdPtPb: this._getCommonMdParts_pb(mon),
			mdPtBreakable: this._getCommonMdParts_breakable(mon, opts),
		};
	}

	protected _getCommonMdParts_name(mon: Monster): string {
		const monExt = mon as MonsterExtended;
		return `>## ${monExt._displayName || mon.name}`;
	}

	protected _getCommonMdParts_sizeTypeAlignment(mon: Monster): string {
		const typeStr = getMonsterTypeString(mon.type);
		const sizeStr = getSizeString(mon.size);
		const alignStr = getAlignmentString(mon.alignment);

		const levelPrefix = mon.level
			? `${this._getOrdinal(mon.level)}-level `
			: "";

		let alignPart = "";
		if (alignStr) {
			const alignPrefix = mon.alignmentPrefix
				? stripTags(mon.alignmentPrefix)
				: "";
			alignPart = `, ${alignPrefix}${alignStr}`;
		}

		return `>*${levelPrefix}${sizeStr} ${typeStr}${alignPart}*`;
	}

	protected _getOrdinal(n: number): string {
		const s = ["th", "st", "nd", "rd"];
		const v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	}

	protected _getCommonMdParts_ac(mon: Monster, renderer: MarkdownRenderer): string {
		renderer.setSkipStylingItemLinks(true);
		const acPart = getAcString(mon.ac, renderer);
		renderer.setSkipStylingItemLinks(false);
		return `>- **Armor Class** ${acPart}`;
	}

	protected _getCommonMdParts_hpResource(mon: Monster): string {
		const hpPart = getHpString(mon.hp);
		const monExt = mon as MonsterExtended;

		let resourcePart = "";
		if (monExt.resource?.length) {
			resourcePart = monExt.resource
				.map((res: MonsterResource) => `\n>- **${res.name}** ${this._getResourceString(res)}`)
				.join("");
		}

		return `>- **Hit Points** ${hpPart}${resourcePart}`;
	}

	protected _getResourceString(res: MonsterResource): string {
		if (typeof res.value === "number") return String(res.value);
		if (res.formula) return res.formula;
		return "";
	}

	protected _getCommonMdParts_speedInitiative(mon: Monster): string {
		const speedPart = getSpeedString(mon.speed);

		let initiativePart = "";
		if (this._style !== "classic" && mon.initiative) {
			initiativePart = `\n>- **Initiative** ${this._getInitiativeString(mon)}`;
		}

		return `>- **Speed** ${speedPart}${initiativePart}`;
	}

	protected _getInitiativeString(mon: Monster): string {
		const init = mon.initiative;
		if (init == null) return "";
		if (typeof init === "number") return init >= 0 ? `+${init}` : String(init);
		if (init.initiative != null) {
			const base = init.initiative >= 0 ? `+${init.initiative}` : String(init.initiative);
			if (init.proficiency) return `${base} (${init.initiative + 2})`;
			return base;
		}
		return "";
	}

	protected _getCommonMdParts_abilityScores(mon: Monster): string {
		const getScore = (val: number | null | { special: string } | undefined): number | null | undefined => {
			if (val == null) return val;
			if (typeof val === "number") return val;
			return null;
		};
		const abilityScores = {
			str: getScore(mon.str),
			dex: getScore(mon.dex),
			con: getScore(mon.con),
			int: getScore(mon.int),
			wis: getScore(mon.wis),
			cha: getScore(mon.cha),
		};
		return markdownUtils.getRenderedAbilityScores(abilityScores, { prefix: ">" });
	}

	protected _getCommonMdParts_save(mon: Monster): string {
		if (!mon.save) return "";
		const saveExt = mon.save as MonsterSaveWithSpecial;

		const saves = Object.keys(mon.save)
			.filter(k => k !== "special")
			.sort(ascSortAtts)
			.map(attr => {
				const val = (mon.save as Record<string, string>)[attr];
				return `${attr.charAt(0).toUpperCase() + attr.slice(1)} ${val}`;
			});

		if (saveExt.special) {
			saves.push(stripTags(saveExt.special));
		}

		return saves.length ? `\n>- **Saving Throws** ${saves.join(", ")}` : "";
	}

	protected _getCommonMdParts_skill(mon: Monster): string {
		if (!mon.skill) return "";
		return `\n>- **Skills** ${this._getSkillsString(mon)}`;
	}

	protected _getSkillsString(mon: Monster): string {
		if (!mon.skill) return "";
		const skillExt = mon.skill as MonsterSkillWithOther;

		const skills = Object.keys(mon.skill)
			.filter(k => k !== "other" && k !== "special")
			.sort()
			.map(s => `${s.charAt(0).toUpperCase() + s.slice(1)} ${skillExt[s]}`);

		if (skillExt.other) {
			for (const other of skillExt.other) {
				if (other.oneOf) {
					const oneOfStr = Object.keys(other.oneOf)
						.sort()
						.map(s => `${s.charAt(0).toUpperCase() + s.slice(1)} ${other.oneOf[s]}`)
						.join(" or ");
					skills.push(`plus one of the following: ${oneOfStr}`);
				}
			}
		}

		if (skillExt.special) {
			skills.push(stripTags(skillExt.special));
		}

		return skills.join(", ");
	}

	protected _getCommonMdParts_tool(mon: Monster): string {
		const monExt = mon as MonsterExtended;
		if (!monExt.tool) return "";
		return `\n>- **Tools** ${this._getToolsString(mon)}`;
	}

	protected _getToolsString(mon: Monster): string {
		const monExt = mon as MonsterExtended;
		if (!monExt.tool) return "";

		return Object.entries(monExt.tool)
			.map(([uid, bonus]) => {
				const name = uid.split("|")[0];
				return `${name.charAt(0).toUpperCase() + name.slice(1)} ${bonus}`;
			})
			.join(", ");
	}

	protected _getCommonMdParts_damVuln(mon: Monster): string {
		if (!mon.vulnerable) return "";
		const vulnStr = getImmResString(mon.vulnerable as DamageVulnerabilityEntry[], {
			isPlainText: true,
			isTitleCase: this._style !== "classic",
		});
		return `\n>- **Damage Vulnerabilities** ${vulnStr}`;
	}

	protected _getCommonMdParts_damRes(mon: Monster): string {
		if (!mon.resist) return "";
		const resStr = getImmResString(mon.resist as DamageResistEntry[], {
			isPlainText: true,
			isTitleCase: this._style !== "classic",
		});
		return `\n>- **Damage Resistances** ${resStr}`;
	}

	protected _getCommonMdParts_sense(mon: Monster, opts: MonsterRenderOptions): string {
		if (opts.isHideSenses) return "";

		const ptLblPassive = this._style !== "classic" ? "Passive Perception" : "passive Perception";
		const sensesStr = mon.senses
			? `${this._getSensesString(mon.senses)}, `
			: "";

		return `\n>- **Senses** ${sensesStr}${ptLblPassive} ${mon.passive || "\u2014"}`;
	}

	protected _getSensesString(senses: any): string {
		if (!senses) return "";
		if (typeof senses === "string") return senses;
		if (Array.isArray(senses)) return senses.join(", ");
		return "";
	}

	protected _getCommonMdParts_language(mon: Monster, opts: MonsterRenderOptions): string {
		if (opts.isHideLanguages) return "";
		const langStr = getLanguagesString(mon.languages, this._style);
		return `\n>- **Languages** ${langStr}`;
	}

	protected _getCommonMdParts_cr(mon: Monster): string {
		const crStr = getCrString(mon.cr, this._style);
		const xpStr = getXpString(mon.cr);
		const crPart = xpStr ? `${crStr} (${xpStr})` : crStr;
		return `>- **Challenge** ${crPart}`;
	}

	protected _getCommonMdParts_pb(mon: Monster): string {
		const pbPart = getPbString(mon);
		return pbPart ? `>- **Proficiency Bonus** ${pbPart}` : "";
	}

	protected _getCommonMdParts_breakable(mon: Monster, opts: MonsterRenderOptions): string {
		const meta = opts.meta || createRenderMeta();
		const renderer = getMarkdownRenderer();
		const parts: string[] = [];

		if (mon.trait?.length) {
			parts.push(`\n${this._getRenderedSection({
				prop: "trait",
				entries: mon.trait,
				depth: 1,
				meta,
				prefix: ">",
			})}`);
		}

		if (mon.action?.length) {
			parts.push(this._getRenderedSectionWithHeader({
				mon,
				arr: mon.action,
				prop: "action",
				title: "Actions",
				meta,
				prefix: ">",
			}));
		}

		if (mon.bonus?.length) {
			parts.push(this._getRenderedSectionWithHeader({
				mon,
				arr: mon.bonus,
				prop: "bonus",
				title: "Bonus Actions",
				meta,
				prefix: ">",
			}));
		}

		if (mon.reaction?.length) {
			parts.push(this._getRenderedSectionWithHeader({
				mon,
				arr: mon.reaction,
				prop: "reaction",
				title: "Reactions",
				meta,
				prefix: ">",
			}));
		}

		if (mon.legendary?.length) {
			const header = this._getRenderedSectionHeader({ mon, title: "Legendary Actions", prop: "legendary", prefix: ">" });
			const intro = this._getLegendaryIntro(mon);
			const content = this._getRenderedLegendarySection(mon.legendary, 1, meta);
			parts.push(`${header}>${intro}\n>\n${content}`);
		}

		if (mon.mythic?.length) {
			const header = this._getRenderedSectionHeader({ mon, title: "Mythic Actions", prop: "mythic", prefix: ">" });
			const intro = this._getMythicIntro(mon);
			const content = this._getRenderedLegendarySection(mon.mythic, 1, meta);
			parts.push(`${header}>${intro}\n>\n${content}`);
		}

		return parts.join("");
	}

	protected _getRenderedSectionWithHeader(params: {
		mon: Monster;
		arr: any[];
		prop: string;
		title: string;
		meta: RenderMeta;
		prefix?: string;
	}): string {
		const { mon, arr, prop, title, meta, prefix = "" } = params;
		if (!arr?.length) return "";

		const header = this._getRenderedSectionHeader({ mon, title, prop, prefix });
		const content = this._getRenderedSection({
			prop,
			entries: arr,
			depth: 1,
			meta,
			prefix,
		});

		return `${header}${content}`;
	}

	protected _getRenderedSectionHeader(params: {
		mon: Monster;
		title: string;
		prop: string;
		prefix?: string;
	}): string {
		const { mon, title, prop, prefix = "" } = params;
		const propNote = `${prop}Note` as keyof Monster;
		const note = mon[propNote] as string | undefined;
		const ptTitle = `\n${prefix}### ${title}`;

		if (!note) return `${ptTitle}\n`;
		return `${ptTitle} (${note})\n`;
	}

	protected _getRenderedSection(params: {
		prop: string;
		entries: any[];
		depth: number;
		meta: RenderMeta;
		prefix?: string;
	}): string {
		const { entries, depth, meta, prefix = "" } = params;
		const renderer = getMarkdownRenderer();

		return entries.map(entry => {
			if (entry.rendered) return entry.rendered;

			const cacheDepth = meta.depth;
			meta.depth = depth + 1;
			const result = renderer.render(entry, { prefix, meta });
			meta.depth = cacheDepth;
			return result;
		}).join("");
	}

	protected _getRenderedLegendarySection(entries: any[], depth: number, meta: RenderMeta): string {
		const renderer = getMarkdownRenderer();
		const processed = entries.map(it => {
			const copy = { ...it };
			if (copy.name && copy.entries) {
				copy.name = `${copy.name}.`;
				copy.type = copy.type || "item";
			}
			return copy;
		});

		const toRender = { type: "list", style: "list-hang-notitle", items: processed } as Entry;
		const cacheDepth = meta.depth;
		meta.depth = depth;
		const result = renderer.render(toRender, { prefix: ">", meta });
		meta.depth = cacheDepth;

		return result;
	}

	protected _getLegendaryIntro(mon: Monster): string {
		const monExt = mon as MonsterExtended;
		const name = monExt._displayName || mon.name;
		const actionCount = mon.legendaryActions || 3;

		return `The ${name.toLowerCase()} can take ${actionCount} legendary action${actionCount === 1 ? "" : "s"}, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The ${name.toLowerCase()} regains spent legendary actions at the start of its turn.`;
	}

	protected _getMythicIntro(mon: Monster): string {
		const monExt = mon as MonsterExtended;
		const name = monExt._displayName || mon.name;
		return `If ${name}'s mythic trait is active, it can use the options below as legendary actions.`;
	}
}

// ============ Classic Style Renderer ============

export class MonsterMarkdownRendererClassic extends MonsterMarkdownRendererBase {
	protected _style: StyleHint = "classic";

	protected _getCompactRenderedString(params: {
		mon: Monster;
		opts: MonsterRenderOptions;
		meta: RenderMeta;
		renderer: MarkdownRenderer;
	}): CompactRenderResult {
		const { mon, opts, renderer } = params;

		const common = this._getCommonMdParts({ mon, opts, renderer });
		const mdPtDamageImmunities = this._getMdParts_damageImmunities(mon);
		const mdPtConditionImmunities = this._getMdParts_conditionImmunities(mon);

		const ptUnbreakable = `___
${common.mdPtName}
${common.mdPtSizeTypeAlignment}
>___
${common.mdPtAc}
${common.mdPtHpResource}
${common.mdPtSpeedInitiative}
>___
${common.mdPtAbilityScores}
>___${common.mdPtSave}${common.mdPtSkill}${common.mdPtTool}${common.mdPtDamVuln}${common.mdPtDamRes}${mdPtDamageImmunities}${mdPtConditionImmunities}${common.mdPtSense}${common.mdPtLanguage}
${common.mdPtCr}
${common.mdPtPb}
>___`;

		return {
			ptUnbreakable,
			ptBreakable: common.mdPtBreakable,
		};
	}

	private _getMdParts_damageImmunities(mon: Monster): string {
		if (!mon.immune) return "";
		const immStr = getImmResString(mon.immune as DamageImmunityEntry[], { isPlainText: true });
		return `\n>- **Damage Immunities** ${immStr}`;
	}

	private _getMdParts_conditionImmunities(mon: Monster): string {
		if (!mon.conditionImmune) return "";
		const condStr = getCondImmString(mon.conditionImmune as ConditionImmuneEntry[], { isPlainText: true });
		return `\n>- **Condition Immunities** ${condStr}`;
	}
}

// ============ "One" Style Renderer ============

export class MonsterMarkdownRendererOne extends MonsterMarkdownRendererBase {
	protected _style: StyleHint = "one";

	protected _getCompactRenderedString(params: {
		mon: Monster;
		opts: MonsterRenderOptions;
		meta: RenderMeta;
		renderer: MarkdownRenderer;
	}): CompactRenderResult {
		const { mon, opts, renderer } = params;

		const common = this._getCommonMdParts({ mon, opts, renderer });
		const mdPtImmunities = this._getMdParts_immunities(mon);
		const mdPtGear = this._getMdParts_gear(mon, renderer);

		const ptUnbreakable = `___
${common.mdPtName}
${common.mdPtSizeTypeAlignment}
>___
${common.mdPtAc}
${common.mdPtHpResource}
${common.mdPtSpeedInitiative}
>___
${common.mdPtAbilityScores}
>___${common.mdPtSave}${common.mdPtSkill}${common.mdPtTool}${common.mdPtDamVuln}${common.mdPtDamRes}${mdPtImmunities}${mdPtGear}${common.mdPtSense}${common.mdPtLanguage}
${common.mdPtCr}
${common.mdPtPb}
>___`;

		return {
			ptUnbreakable,
			ptBreakable: common.mdPtBreakable,
		};
	}

	private _getMdParts_immunities(mon: Monster): string {
		const parts: string[] = [];

		if (mon.immune) {
			const immStr = getImmResString(mon.immune as DamageImmunityEntry[], {
				isPlainText: true,
				isTitleCase: true,
			});
			if (immStr) parts.push(immStr);
		}

		if (mon.conditionImmune) {
			const condStr = getCondImmString(mon.conditionImmune as ConditionImmuneEntry[], {
				isPlainText: true,
				isTitleCase: true,
			});
			if (condStr) parts.push(condStr);
		}

		if (!parts.length) return "";
		return `\n>- **Immunities** ${parts.join("; ")}`;
	}

	private _getMdParts_gear(mon: Monster, renderer: MarkdownRenderer): string {
		const monExt = mon as MonsterExtended;
		if (!monExt.gear?.length) return "";

		const gearStr = monExt.gear.map((g: string) => stripTags(g)).join(", ");
		return `\n>- **Gear** ${gearStr}`;
	}
}

// ============ Monster Markdown Module ============

const _RENDER_CLASSIC = new MonsterMarkdownRendererClassic();
const _RENDER_ONE = new MonsterMarkdownRendererOne();

export const monsterMarkdown = {
	getCompactRenderedString(mon: Monster, opts: MonsterRenderOptions = {}): string {
		const styleHint = opts.styleHint || "classic";

		switch (styleHint) {
			case "classic":
				return _RENDER_CLASSIC.getCompactRenderedString(mon, opts);
			case "one":
				return _RENDER_ONE.getCompactRenderedString(mon, opts);
			default:
				throw new Error(`Unhandled style "${styleHint}"!`);
		}
	},

	getSave(attr: string, mod: string): string {
		if (attr === "special") return stripTags(mod);
		return `${attr.charAt(0).toUpperCase() + attr.slice(1)} ${mod}`;
	},

	getSkillsString(mon: Monster): string {
		return _RENDER_CLASSIC["_getSkillsString"](mon);
	},

	getToolsString(mon: Monster): string {
		return _RENDER_CLASSIC["_getToolsString"](mon);
	},

	getRenderedSection(params: {
		arr: any[];
		ent: Monster;
		prop: string;
		title: string;
		meta: RenderMeta;
		prefix?: string;
	}): string {
		const { arr, ent, prop, title, meta, prefix = "" } = params;
		if (!arr?.length) return "";

		return _RENDER_CLASSIC["_getRenderedSectionWithHeader"]({
			mon: ent,
			arr,
			prop,
			title,
			meta,
			prefix,
		});
	},
};

// ============ Type Aliases for Consistent API ============

export type MonsterEntry = Monster;
export type MonsterMarkdownOptions = MonsterRenderOptions;

export const getMonsterMarkdownRenderer = (styleHint: StyleHint = "classic"): MonsterMarkdownRendererBase => {
	switch (styleHint) {
		case "classic":
			return _RENDER_CLASSIC;
		case "one":
			return _RENDER_ONE;
		default:
			return _RENDER_CLASSIC;
	}
};

export default monsterMarkdown;
