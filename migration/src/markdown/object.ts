// Object Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.object
// Provides object-specific markdown rendering for D&D 5e objects

import type { Entry } from "../../../types/entry.js";
import type {
	ObjectItem,
	ObjectType,
	ObjectCreatureType,
	ObjectAcSpecial,
	ObjectHpSpecial,
	DamageImmunityEntry,
	DamageResistEntry,
	DamageVulnerabilityEntry,
	ConditionImmuneEntry,
} from "../../../types/objects.js";
import type { Size, Speed } from "../../../types/util.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { createRenderMeta } from "../renderer/types.js";
import { stripTags } from "../renderer/tags.js";
import { ABIL_ABVS, getAbilityModNumber } from "../parser/attributes.js";
import { getMarkdownRenderer, markdownUtils, type MarkdownRenderer } from "./renderer.js";

// ============ Types ============

export interface ObjectEntry extends ObjectItem {
	_displayName?: string;
	capCrew?: number;
	capPassenger?: number;
	capCargo?: number;
}

export interface ObjectMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

export interface ObjectRenderableEntriesMeta {
	entrySize: string | null;
	entryCreatureCapacity: string | null;
	entryCargoCapacity: string | null;
	entryArmorClass: string | null;
	entryHitPoints: string | null;
	entrySpeed: string | null;
	entryAbilityScores: string | null;
	entryDamageImmunities: string | null;
	entryDamageResistances: string | null;
	entryDamageVulnerabilities: string | null;
	entryConditionImmunities: string | null;
	entrySenses: string | null;
}

// ============ Constants ============

const RENDERABLE_ENTRIES_PROP_ORDER: (keyof ObjectRenderableEntriesMeta)[] = [
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

const getSizeString = (size: Size | Size[]): string => {
	if (Array.isArray(size)) {
		return size.map(s => getSizeAbbreviation(s)).join(" or ");
	}
	return getSizeAbbreviation(size);
};

const getSizeAbbreviation = (size: Size): string => {
	const map: Record<Size, string> = {
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

const getCreatureTypeString = (type: ObjectCreatureType | undefined): string => {
	if (!type) return "object";
	if (typeof type === "string") return type;

	let typeStr = type.type || "object";
	if (type.tags?.length) {
		typeStr += ` (${type.tags.join(", ")})`;
	}
	return typeStr;
};

const getSpeedString = (speed: Speed | undefined): string => {
	if (!speed) return "";
	if (typeof speed === "number") return `${speed} ft.`;

	const parts: string[] = [];

	if (speed.walk != null) {
		const walkVal = typeof speed.walk === "number"
			? speed.walk
			: speed.walk.number;
		parts.push(`${walkVal} ft.`);
	}

	const modes: (keyof Speed)[] = ["burrow", "climb", "fly", "swim"];
	for (const mode of modes) {
		const modeSpeed = speed[mode];
		if (modeSpeed != null) {
			const modeVal = typeof modeSpeed === "number"
				? modeSpeed
				: (modeSpeed as { number: number }).number;
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

const getImmResString = (arr: (DamageImmunityEntry | DamageResistEntry | DamageVulnerabilityEntry)[]): string => {
	if (!arr?.length) return "";

	return arr.map(it => {
		if (typeof it === "string") return it;
		if (typeof it === "object" && "special" in it && it.special) return it.special;

		const dmgTypes: string[] = [];
		if ("immune" in it && it.immune) dmgTypes.push(...it.immune);
		if ("resist" in it && it.resist) dmgTypes.push(...it.resist);
		if ("vulnerable" in it && it.vulnerable) dmgTypes.push(...it.vulnerable);

		let out = dmgTypes.join(", ");
		if ("preNote" in it && it.preNote) out = `${it.preNote} ${out}`;
		if ("note" in it && it.note) out += ` ${it.note}`;

		return out;
	}).join("; ");
};

const getCondImmString = (arr: ConditionImmuneEntry[]): string => {
	if (!arr?.length) return "";

	return arr.map(it => {
		if (typeof it === "string") return it;
		if (typeof it === "object" && "special" in it && it.special) return it.special;

		const conditions = ("conditionImmune" in it && it.conditionImmune) || [];
		let out = conditions.join(", ");
		if ("preNote" in it && it.preNote) out = `${it.preNote} ${out}`;
		if ("note" in it && it.note) out += ` ${it.note}`;

		return out;
	}).join("; ");
};

const getSensesString = (senses: string[] | undefined): string => {
	if (!senses?.length) return "";
	return senses.join(", ");
};

const getCreatureCapacity = (obj: ObjectEntry): string | null => {
	const parts: string[] = [];
	if (obj.capCrew != null) {
		parts.push(`${obj.capCrew} crew`);
	}
	if (obj.capPassenger != null) {
		parts.push(`${obj.capPassenger} passenger${obj.capPassenger === 1 ? "" : "s"}`);
	}
	if (!parts.length) return null;
	return parts.join(", ");
};

const getCargoCapacity = (obj: ObjectEntry): string | null => {
	if (obj.capCargo == null) return null;
	return `${obj.capCargo} ton${obj.capCargo === 1 ? "" : "s"}`;
};

const getAbilityScoresString = (obj: ObjectEntry): string | null => {
	const objAny = obj as unknown as Record<string, number | undefined>;
	const hasAbilities = ABIL_ABVS.some(ab => objAny[ab] != null);
	if (!hasAbilities) return null;

	const abilityParts = ABIL_ABVS
		.filter(ab => objAny[ab] != null)
		.map(ab => {
			const score = objAny[ab]!;
			const mod = getAbilityModNumber(score);
			const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
			return `${ab.toUpperCase()}\u00A0${score} (${modStr})`;
		});

	return abilityParts.join(", ");
};

// ============ Renderable Entries Meta ============

const getObjectRenderableEntriesMeta = (obj: ObjectEntry): ObjectRenderableEntriesMeta => {
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
			? `{@b Armor Class:} ${typeof obj.ac === "object" && "special" in obj.ac ? (obj.ac as ObjectAcSpecial).special : obj.ac}`
			: null,

		entryHitPoints: obj.hp != null
			? `{@b Hit Points:} ${typeof obj.hp === "object" && "special" in obj.hp ? (obj.hp as ObjectHpSpecial).special : obj.hp}`
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
	private _renderer: MarkdownRenderer;
	private _styleHint: StyleHint;

	constructor(renderer?: MarkdownRenderer, styleHint: StyleHint = "classic") {
		this._renderer = renderer ?? getMarkdownRenderer();
		this._styleHint = styleHint;
	}

	setRenderer(renderer: MarkdownRenderer): this {
		this._renderer = renderer;
		return this;
	}

	setStyleHint(styleHint: StyleHint): this {
		this._styleHint = styleHint;
		return this;
	}

	getCompactRenderedString(obj: ObjectEntry, opts: ObjectMarkdownOptions = {}): string {
		const entriesMeta = getObjectRenderableEntriesMeta(obj);

		const entries: (Entry | null)[] = [
			entriesMeta.entrySize,
			...RENDERABLE_ENTRIES_PROP_ORDER
				.filter(prop => entriesMeta[prop] != null)
				.map(prop => entriesMeta[prop]),
			obj.entries ? { type: "entries" as const, entries: obj.entries } : null,
			obj.actionEntries ? { type: "entries" as const, entries: obj.actionEntries } : null,
		];

		const filteredEntries = entries.filter(Boolean) as Entry[];

		const entFull = {
			...obj,
			entries: filteredEntries,
		};

		return markdownUtils.withMetaDepth(2, opts, () => {
			return this._getGenericCompactRenderedString(entFull, opts);
		});
	}

	private _getGenericCompactRenderedString(
		ent: ObjectEntry & { entries: Entry[] },
		opts: ObjectMarkdownOptions,
	): string {
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

let _objectRenderer: ObjectMarkdownRenderer | null = null;

export const getObjectMarkdownRenderer = (styleHint: StyleHint = "classic"): ObjectMarkdownRenderer => {
	if (!_objectRenderer) {
		_objectRenderer = new ObjectMarkdownRenderer(undefined, styleHint);
	} else {
		_objectRenderer.setStyleHint(styleHint);
	}
	return _objectRenderer;
};

export const objectMarkdown = {
	getCompactRenderedString: (obj: ObjectEntry, opts: ObjectMarkdownOptions = {}): string => {
		return getObjectMarkdownRenderer(opts.styleHint).getCompactRenderedString(obj, opts);
	},

	getObjectRenderableEntriesMeta: (obj: ObjectEntry): ObjectRenderableEntriesMeta => {
		return getObjectRenderableEntriesMeta(obj);
	},
};

// ============ Export Constants ============

export { RENDERABLE_ENTRIES_PROP_ORDER };

export default objectMarkdown;
