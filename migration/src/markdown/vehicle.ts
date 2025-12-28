// Vehicle Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.vehicle
// Provides vehicle-specific markdown rendering for D&D 5e vehicles

import type { Entry, EntryTable } from "../../../types/entry.js";
import type {
	Vehicle,
	VehicleShip,
	VehicleSpelljammer,
	VehicleElementalAirship,
	VehicleInfernalWarMachine,
	VehicleUpgrade,
	VehicleType,
	ShipControl,
	ShipMovement,
	ShipWeapon,
	ShipOther,
	SpelljammerStation,
} from "../../../types/vehicles.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { createRenderMeta } from "../renderer/types.js";
import { stripTags } from "../renderer/tags.js";
import { ABIL_ABVS } from "../parser/attributes.js";
import { getMarkdownRenderer, markdownUtils, type MarkdownRenderer } from "./renderer.js";

// ============ Types ============

interface ShipOtherExtended extends ShipOther {
	isAction?: boolean;
}

interface AbilityScores {
	str?: number;
	dex?: number;
	con?: number;
	int?: number;
	wis?: number;
	cha?: number;
}

interface VehicleTableEntry extends Omit<EntryTable, "rows"> {
	type: "table";
	colStyles: string[];
	rows: string[][];
}

const extractAbilityScores = (ent: AbilityScores): Record<string, number | null | undefined> => ({
	str: ent.str,
	dex: ent.dex,
	con: ent.con,
	int: ent.int,
	wis: ent.wis,
	cha: ent.cha,
});

export interface VehicleMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
	isHideLanguages?: boolean;
	isHideSenses?: boolean;
	page?: string;
}

export interface VehicleUpgradeMarkdownOptions {
	meta?: RenderMeta;
	styleHint?: StyleHint;
}

interface SectionHpEntriesMeta {
	entryArmorClass: string | null;
	entryHitPoints: string | null;
}

interface ShipRenderableEntriesMeta {
	entrySizeDimensions: string;
	entryCrewPassengers?: string;
	entryCargo?: string;
	entryTravelPace?: string;
	entrySpeed?: string;
	entriesOtherActions?: ShipOther[];
	entriesOtherOthers?: ShipOther[];
}

interface VehicleRenderableEntriesMeta {
	entryDamageVulnerabilities: string | null;
	entryDamageResistances: string | null;
	entryDamageImmunities: string | null;
	entryConditionImmunities: string | null;
}

interface SpelljammerRenderableEntriesMeta {
	entryTableSummary: VehicleTableEntry;
}

interface ElementalAirshipRenderableEntriesMeta {
	entryTableSummary: VehicleTableEntry;
}

interface InfwarRenderableEntriesMeta {
	entrySizeWeight: string;
	entryCreatureCapacity?: string;
	entryCargoCapacity?: string;
	entryArmorClass?: string;
	entryHitPoints?: string;
	entrySpeed?: string;
	entrySpeedNote?: string;
}

interface StationEntriesMeta {
	entryName: string;
	entryArmorClass: string | null;
	entryHitPoints: string | null;
	entryCost: string | null;
}

// ============ Renderable Entries Meta Generators ============

const getVehicleRenderableEntriesMeta = (ent: Vehicle): VehicleRenderableEntriesMeta => {
	const ship = ent as VehicleShip;
	return {
		entryDamageVulnerabilities: ship.vulnerable?.length
			? `**Damage Vulnerabilities** ${getDamageString(ship.vulnerable)}`
			: null,
		entryDamageResistances: ship.resist?.length
			? `**Damage Resistances** ${getDamageString(ship.resist)}`
			: null,
		entryDamageImmunities: ship.immune?.length
			? `**Damage Immunities** ${getDamageString(ship.immune)}`
			: null,
		entryConditionImmunities: ship.conditionImmune?.length
			? `**Condition Immunities** ${getConditionString(ship.conditionImmune)}`
			: null,
	};
};

const getDamageString = (arr: any[]): string => {
	return arr.map(it => {
		if (typeof it === "string") return it;
		if (it.special) return it.special;

		const dmgTypes = it.immune || it.resist || it.vulnerable || [];
		let out = Array.isArray(dmgTypes) ? dmgTypes.join(", ") : dmgTypes;
		if (it.preNote) out = `${it.preNote} ${out}`;
		if (it.note) out += ` ${it.note}`;
		if (it.cond) out += ` ${stripTags(it.cond)}`;
		return out;
	}).join("; ");
};

const getConditionString = (arr: any[]): string => {
	return arr.map(it => {
		if (typeof it === "string") return it;
		if (it.special) return it.special;

		const conditions = it.conditionImmune || [];
		let out = Array.isArray(conditions) ? conditions.join(", ") : conditions;
		if (it.preNote) out = `${it.preNote} ${out}`;
		if (it.note) out += ` ${it.note}`;
		return out;
	}).join("; ");
};

const getSizeString = (size: string | undefined): string => {
	if (!size) return "";
	const sizeMap: Record<string, string> = {
		F: "Fine",
		D: "Diminutive",
		T: "Tiny",
		S: "Small",
		M: "Medium",
		L: "Large",
		H: "Huge",
		G: "Gargantuan",
		C: "Colossal",
	};
	return sizeMap[size] || size;
};

// ============ Ship Helpers ============

const getVehicleShipRenderableEntriesMeta = (ent: VehicleShip): ShipRenderableEntriesMeta => {
	const sizeStr = getSizeString(ent.size);
	const dimensionsStr = ent.dimensions?.join(" by ") || "";
	const entrySizeDimensions = `*${sizeStr} vehicle${dimensionsStr ? ` (${dimensionsStr})` : ""}*`;

	const crewPassengerParts: string[] = [];
	if (ent.capCrew != null) crewPassengerParts.push(`**Crew** ${ent.capCrew}`);
	if (ent.capPassenger != null) crewPassengerParts.push(`**Passengers** ${ent.capPassenger}`);
	const entryCrewPassengers = crewPassengerParts.length ? crewPassengerParts.join(", ") : undefined;

	const entryCargo = ent.capCargo != null
		? `**Cargo** ${typeof ent.capCargo === "number" ? `${ent.capCargo} tons` : ent.capCargo}`
		: undefined;

	const entryTravelPace = ent.pace != null
		? `**Travel Pace** ${ent.pace} miles per hour (${ent.pace * 24} miles per day)`
		: undefined;

	const entriesOtherActions: ShipOther[] = [];
	const entriesOtherOthers: ShipOther[] = [];

	if (ent.other?.length) {
		for (const other of ent.other) {
			if ((other as ShipOtherExtended).isAction) {
				entriesOtherActions.push(other);
			} else {
				entriesOtherOthers.push(other);
			}
		}
	}

	return {
		entrySizeDimensions,
		entryCrewPassengers,
		entryCargo,
		entryTravelPace,
		entriesOtherActions,
		entriesOtherOthers,
	};
};

const getSectionHpEntriesMeta = (opts: { entry: any; isEach?: boolean }): SectionHpEntriesMeta => {
	const { entry, isEach = false } = opts;

	const entryArmorClass = entry.ac != null
		? `**Armor Class** ${entry.ac}${isEach ? " each" : ""}`
		: null;

	let hpStr = "";
	if (entry.hp != null) {
		hpStr = `${entry.hp}${isEach ? " each" : ""}`;
		if (entry.hpNote) hpStr += ` ${entry.hpNote}`;
		if (entry.dt != null) hpStr += `; damage threshold ${entry.dt}`;
	}
	const entryHitPoints = hpStr ? `**Hit Points** ${hpStr}` : null;

	return { entryArmorClass, entryHitPoints };
};

// ============ Spelljammer/Elemental Airship Helpers ============

const getSpelljammerRenderableEntriesMeta = (ent: VehicleSpelljammer): SpelljammerRenderableEntriesMeta => {
	const rows: string[][] = [];

	if (ent.capCrew != null) {
		let crewStr = String(ent.capCrew);
		if (ent.capCrewNote) crewStr += ` ${ent.capCrewNote}`;
		rows.push(["Crew", crewStr]);
	}

	if (ent.capCargo != null) {
		rows.push(["Cargo", typeof ent.capCargo === "number" ? `${ent.capCargo} tons` : String(ent.capCargo)]);
	}

	if (ent.pace) {
		const paceEntries = Object.entries(ent.pace)
			.filter(([_, v]) => v != null)
			.map(([k, v]) => `${k} ${v}`);
		if (paceEntries.length) {
			rows.push(["Travel Pace", paceEntries.join(", ")]);
		}
	}

	if (ent.speed) {
		const speedStr = typeof ent.speed === "number" ? `${ent.speed} ft.` : formatSpeed(ent.speed);
		rows.push(["Speed", speedStr]);
	}

	if (ent.hull) {
		let hullStr = `AC ${ent.hull.ac}, HP ${ent.hull.hp}`;
		if (ent.hull.dt != null) hullStr += ` (threshold ${ent.hull.dt})`;
		rows.push(["Hull", hullStr]);
	}

	if (ent.cost != null) {
		rows.push(["Cost", `${ent.cost.toLocaleString()} gp`]);
	}

	const tableEntry: VehicleTableEntry = {
		type: "table",
		colStyles: ["col-6", "col-6"],
		rows,
	};

	return { entryTableSummary: tableEntry };
};

const getElementalAirshipRenderableEntriesMeta = (ent: VehicleElementalAirship): ElementalAirshipRenderableEntriesMeta => {
	const rows: string[][] = [];

	if (ent.capCrew != null) {
		let crewStr = String(ent.capCrew);
		if (ent.capCrewNote) crewStr += ` ${ent.capCrewNote}`;
		rows.push(["Crew", crewStr]);
	}

	if (ent.capPassenger != null) {
		rows.push(["Passengers", String(ent.capPassenger)]);
	}

	if (ent.capCargo != null) {
		rows.push(["Cargo", typeof ent.capCargo === "number" ? `${ent.capCargo} tons` : String(ent.capCargo)]);
	}

	if (ent.pace) {
		const paceEntries = Object.entries(ent.pace)
			.filter(([_, v]) => v != null)
			.map(([k, v]) => `${k} ${v}`);
		if (paceEntries.length) {
			rows.push(["Travel Pace", paceEntries.join(", ")]);
		}
	}

	if (ent.speed) {
		const speedStr = typeof ent.speed === "number" ? `${ent.speed} ft.` : formatSpeed(ent.speed);
		rows.push(["Speed", speedStr]);
	}

	if (ent.hull) {
		let hullStr = `AC ${ent.hull.ac}, HP ${ent.hull.hp}`;
		if (ent.hull.dt != null) hullStr += ` (threshold ${ent.hull.dt})`;
		rows.push(["Hull", hullStr]);
	}

	if (ent.cost != null) {
		rows.push(["Cost", `${ent.cost.toLocaleString()} gp`]);
	}

	const tableEntry: VehicleTableEntry = {
		type: "table",
		colStyles: ["col-6", "col-6"],
		rows,
	};

	return { entryTableSummary: tableEntry };
};

const formatSpeed = (speed: any): string => {
	if (typeof speed === "number") return `${speed} ft.`;
	if (typeof speed === "string") return speed;

	const parts: string[] = [];
	if (speed.walk != null) parts.push(`${speed.walk} ft.`);
	if (speed.fly != null) parts.push(`fly ${speed.fly} ft.`);
	if (speed.swim != null) parts.push(`swim ${speed.swim} ft.`);
	if (speed.burrow != null) parts.push(`burrow ${speed.burrow} ft.`);
	if (speed.climb != null) parts.push(`climb ${speed.climb} ft.`);

	return parts.join(", ") || "\u2014";
};

const getSpelljammerStationEntriesMeta = (entry: SpelljammerStation): StationEntriesMeta => {
	return {
		entryName: entry.name,
		entryArmorClass: entry.ac != null ? `**Armor Class** ${entry.ac}` : null,
		entryHitPoints: entry.hp != null ? `**Hit Points** ${entry.hp}` : null,
		entryCost: entry.costs?.length
			? `**Cost** ${entry.costs.map(c => c.note || (c.cost != null ? `${c.cost} gp` : "")).filter(Boolean).join(", ")}`
			: null,
	};
};

const getElementalAirshipStationEntriesMeta = (entry: SpelljammerStation): StationEntriesMeta => {
	return {
		entryName: entry.name,
		entryArmorClass: entry.ac != null ? `**Armor Class** ${entry.ac}` : null,
		entryHitPoints: entry.hp != null ? `**Hit Points** ${entry.hp}` : null,
		entryCost: entry.costs?.length
			? `**Cost** ${entry.costs.map(c => c.note || (c.cost != null ? `${c.cost} gp` : "")).filter(Boolean).join(", ")}`
			: null,
	};
};

// ============ Infernal War Machine Helpers ============

const getVehicleInfwarRenderableEntriesMeta = (ent: VehicleInfernalWarMachine): InfwarRenderableEntriesMeta => {
	const sizeStr = getSizeString(ent.size);
	const weightStr = ent.weight != null ? ` (${ent.weight.toLocaleString()} lb.)` : "";
	const entrySizeWeight = `*${sizeStr} vehicle${weightStr}*`;

	return {
		entrySizeWeight,
		entryCreatureCapacity: ent.capCreature != null
			? `**Creature Capacity** ${ent.capCreature}`
			: undefined,
		entryCargoCapacity: ent.capCargo != null
			? `**Cargo Capacity** ${ent.capCargo} lb.`
			: undefined,
		entryArmorClass: ent.ac != null
			? `**Armor Class** ${ent.ac}`
			: undefined,
		entryHitPoints: ent.hp != null
			? `**Hit Points** ${ent.hp.hp}${ent.hp.dt != null ? ` (damage threshold ${ent.hp.dt}${ent.hp.mt != null ? `, mishap threshold ${ent.hp.mt}` : ""})` : ""}`
			: undefined,
		entrySpeed: ent.speed != null
			? `**Speed** ${ent.speed} ft.`
			: undefined,
		entrySpeedNote: "",
	};
};

// ============ Ship Section Renderers ============

const shipHelpers = {
	getCrewCargoPaceSection_(ent: VehicleShip, opts: { entriesMetaShip?: ShipRenderableEntriesMeta } = {}): string {
		const entriesMetaShip = opts.entriesMetaShip || getVehicleShipRenderableEntriesMeta(ent);
		const renderer = getMarkdownRenderer();

		const parts = [
			entriesMetaShip.entryCrewPassengers,
			entriesMetaShip.entryCargo,
			entriesMetaShip.entryTravelPace,
		].filter(Boolean) as string[];

		return parts
			.map(p => renderer.render(p).trim())
			.join("\n\n");
	},

	getControlSection_(opts: { entry: ShipControl }): string {
		const { entry } = opts;
		const renderer = getMarkdownRenderer();
		const entriesMetaSection = getSectionHpEntriesMeta({ entry });

		const parts = [
			`### Control: ${entry.name || "Control"}`,
			entriesMetaSection.entryArmorClass ? renderer.render(entriesMetaSection.entryArmorClass) : null,
			entriesMetaSection.entryHitPoints ? renderer.render(entriesMetaSection.entryHitPoints) : null,
			renderer.render({ entries: entry.entries } as Entry),
		];

		return parts
			.map(it => it != null ? it.trim() : it)
			.filter(Boolean)
			.join("\n\n");
	},

	getMovementSection_(opts: { entry: ShipMovement }): string {
		const { entry } = opts;
		const renderer = getMarkdownRenderer();
		const entriesMetaSection = getSectionHpEntriesMeta({ entry });

		const titlePrefix = entry.isControl ? "Control and " : "";
		const parts: (string | null)[] = [
			`### ${titlePrefix}Movement: ${entry.name || "Movement"}`,
			entriesMetaSection.entryArmorClass ? renderer.render(entriesMetaSection.entryArmorClass) : null,
			entriesMetaSection.entryHitPoints ? renderer.render(entriesMetaSection.entryHitPoints) : null,
		];

		if (entry.locomotion?.length) {
			for (const loco of entry.locomotion) {
				const locoEntry = {
					type: "entries",
					name: `Locomotion (${loco.mode})`,
					entries: loco.entries,
				};
				parts.push(renderer.render(locoEntry as Entry));
			}
		}

		if (entry.speed?.length) {
			for (const spd of entry.speed) {
				const spdEntry = {
					type: "entries",
					name: `Speed (${spd.mode})`,
					entries: spd.entries,
				};
				parts.push(renderer.render(spdEntry as Entry));
			}
		}

		return parts
			.map(it => it != null ? it.trim() : it)
			.filter(Boolean)
			.join("\n\n");
	},

	getWeaponSection_(opts: { entry: ShipWeapon }): string {
		const { entry } = opts;
		const renderer = getMarkdownRenderer();
		const entriesMetaSection = getSectionHpEntriesMeta({ entry, isEach: !!entry.count });

		const countStr = entry.count ? ` (${entry.count})` : "";
		const parts = [
			`### Weapons: ${entry.name}${countStr}`,
			entriesMetaSection.entryArmorClass ? renderer.render(entriesMetaSection.entryArmorClass) : null,
			entriesMetaSection.entryHitPoints ? renderer.render(entriesMetaSection.entryHitPoints) : null,
			renderer.render({ entries: entry.entries } as Entry),
		];

		return parts
			.map(it => it != null ? it.trim() : it)
			.filter(Boolean)
			.join("\n\n");
	},

	getOtherSection_(opts: { entry: ShipOther }): string {
		const { entry } = opts;
		const renderer = getMarkdownRenderer();
		const entriesMetaSection = getSectionHpEntriesMeta({ entry });

		const parts = [
			`### ${entry.name}`,
			entriesMetaSection.entryArmorClass ? renderer.render(entriesMetaSection.entryArmorClass) : null,
			entriesMetaSection.entryHitPoints ? renderer.render(entriesMetaSection.entryHitPoints) : null,
			renderer.render({ entries: entry.entries } as Entry),
		];

		return parts
			.map(it => it != null ? it.trim() : it)
			.filter(Boolean)
			.join("\n\n");
	},
};

// ============ Spelljammer/Elemental Airship Section Renderers ============

const spelljammerElementalAirshipHelpers = {
	getStationSection_(opts: {
		entriesMetaParent: StationEntriesMeta;
		entry: SpelljammerStation;
		isDisplayEmptyCost?: boolean;
	}): string {
		const { entriesMetaParent, entry, isDisplayEmptyCost = false } = opts;
		const renderer = getMarkdownRenderer();

		const parts: (string | null)[] = [
			`### ${entriesMetaParent.entryName}`,
			entriesMetaParent.entryArmorClass ? renderer.render(entriesMetaParent.entryArmorClass) : null,
			entriesMetaParent.entryHitPoints ? renderer.render(entriesMetaParent.entryHitPoints) : null,
			(isDisplayEmptyCost || entry.costs?.length) && entriesMetaParent.entryCost
				? renderer.render(entriesMetaParent.entryCost)
				: null,
			renderer.render({ entries: entry.entries } as Entry),
		];

		if (entry.action?.length) {
			for (const act of entry.action) {
				if (act.entries?.length) {
					parts.push(renderer.render({ type: "entries", name: act.name, entries: act.entries } as Entry, { meta: createRenderMeta({ depth: 2 }) }));
				}
			}
		}

		return parts
			.map(it => it != null ? it.trim() : it)
			.filter(Boolean)
			.join("\n\n");
	},
};

const spelljammerHelpers = {
	getStationSection_(opts: { entry: SpelljammerStation }): string {
		const { entry } = opts;
		const entriesMeta = getSpelljammerStationEntriesMeta(entry);
		return spelljammerElementalAirshipHelpers.getStationSection_({
			entriesMetaParent: entriesMeta,
			entry,
			isDisplayEmptyCost: true,
		});
	},
};

const elementalAirshipHelpers = {
	getStationSection_(opts: { entry: SpelljammerStation }): string {
		const { entry } = opts;
		const entriesMeta = getElementalAirshipStationEntriesMeta(entry);
		return spelljammerElementalAirshipHelpers.getStationSection_({
			entriesMetaParent: entriesMeta,
			entry,
		});
	},
};

// ============ Trait Rendering ============

const getLinesRenderedTraits = (opts: { ent: any; renderer: MarkdownRenderer }): (string | null)[] => {
	const { ent, renderer } = opts;

	if (!ent.trait?.length) return [];

	const orderedTraits = [...ent.trait].sort((a: any, b: any) => {
		const sortA = a.sort ?? 0;
		const sortB = b.sort ?? 0;
		return sortA - sortB;
	});

	return [
		ent.trait ? "### Traits" : null,
		...orderedTraits.map((entry: any) => renderer.render(entry, { meta: createRenderMeta({ depth: 2 }) })),
	];
};

// ============ Vehicle Type Renderers ============

const getRenderedStringShip = (ent: VehicleShip, opts: VehicleMarkdownOptions): string => {
	const renderer = getMarkdownRenderer();
	const entriesMeta = getVehicleRenderableEntriesMeta(ent);
	const entriesMetaShip = getVehicleShipRenderableEntriesMeta(ent);

	const entriesMetaSectionHull = ent.hull
		? getSectionHpEntriesMeta({ entry: ent.hull })
		: null;

	const ptsJoined = [
		`## ${ent.name}`,
		renderer.render(entriesMetaShip.entrySizeDimensions),
		shipHelpers.getCrewCargoPaceSection_(ent, { entriesMetaShip }),
		markdownUtils.getRenderedAbilityScores(extractAbilityScores(ent)),
		entriesMeta.entryDamageVulnerabilities ? renderer.render(entriesMeta.entryDamageVulnerabilities) : null,
		entriesMeta.entryDamageResistances ? renderer.render(entriesMeta.entryDamageResistances) : null,
		entriesMeta.entryDamageImmunities ? renderer.render(entriesMeta.entryDamageImmunities) : null,
		entriesMeta.entryConditionImmunities ? renderer.render(entriesMeta.entryConditionImmunities) : null,
		ent.action ? "### Actions" : null,
		ent.action ? renderer.render({ entries: ent.action } as Entry) : null,
		...(entriesMetaShip.entriesOtherActions || [])
			.map(entry => shipHelpers.getOtherSection_({ entry })),
		ent.hull ? "### Hull" : null,
		entriesMetaSectionHull?.entryArmorClass ? renderer.render(entriesMetaSectionHull.entryArmorClass) : null,
		entriesMetaSectionHull?.entryHitPoints ? renderer.render(entriesMetaSectionHull.entryHitPoints) : null,
		...getLinesRenderedTraits({ ent, renderer }),
		...(ent.control || [])
			.map(entry => shipHelpers.getControlSection_({ entry })),
		...(ent.movement || [])
			.map(entry => shipHelpers.getMovementSection_({ entry })),
		...(ent.weapon || [])
			.map(entry => shipHelpers.getWeaponSection_({ entry })),
		...(entriesMetaShip.entriesOtherOthers || [])
			.map(entry => shipHelpers.getOtherSection_({ entry })),
	]
		.map(it => it != null ? it.trim() : it)
		.filter(Boolean)
		.join("\n\n");

	return ptsJoined.trim();
};

const getRenderedStringSpelljammer = (ent: VehicleSpelljammer, opts: VehicleMarkdownOptions): string => {
	const renderer = getMarkdownRenderer();
	const entriesMeta = getSpelljammerRenderableEntriesMeta(ent);

	const ptsJoined = [
		`## ${ent.name}`,
		renderer.render(entriesMeta.entryTableSummary),
		...(ent.weapon || [])
			.map(entry => spelljammerHelpers.getStationSection_({ entry })),
	]
		.map(it => it != null ? it.trim() : it)
		.filter(Boolean)
		.join("\n\n");

	return ptsJoined.trim();
};

const getRenderedStringElementalAirship = (ent: VehicleElementalAirship, opts: VehicleMarkdownOptions): string => {
	const renderer = getMarkdownRenderer();
	const entriesMeta = getElementalAirshipRenderableEntriesMeta(ent);

	const ptsJoined = [
		`## ${ent.name}`,
		renderer.render(entriesMeta.entryTableSummary),
		...(ent.weapon || [])
			.map(entry => elementalAirshipHelpers.getStationSection_({ entry })),
		...(ent.station || [])
			.map(entry => elementalAirshipHelpers.getStationSection_({ entry })),
	]
		.map(it => it != null ? it.trim() : it)
		.filter(Boolean)
		.join("\n\n");

	return ptsJoined.trim();
};

const getRenderedStringInfwar = (ent: VehicleInfernalWarMachine, opts: VehicleMarkdownOptions): string => {
	const renderer = getMarkdownRenderer();
	const meta = opts.meta || createRenderMeta();

	const entriesMeta = getVehicleRenderableEntriesMeta(ent);
	const entriesMetaInfwar = getVehicleInfwarRenderableEntriesMeta(ent);

	const orderedReactions = ent.reaction ? [...ent.reaction].sort((a, b) => {
		const nameA = a.name || "";
		const nameB = b.name || "";
		return nameA.localeCompare(nameB);
	}) : [];

	const ptsJoined = [
		`## ${ent.name}`,
		renderer.render(entriesMetaInfwar.entrySizeWeight),
		entriesMetaInfwar.entryCreatureCapacity ? renderer.render(entriesMetaInfwar.entryCreatureCapacity) : null,
		entriesMetaInfwar.entryCargoCapacity ? renderer.render(entriesMetaInfwar.entryCargoCapacity) : null,
		entriesMetaInfwar.entryArmorClass ? renderer.render(entriesMetaInfwar.entryArmorClass) : null,
		entriesMetaInfwar.entryHitPoints ? renderer.render(entriesMetaInfwar.entryHitPoints) : null,
		entriesMetaInfwar.entrySpeed ? renderer.render(entriesMetaInfwar.entrySpeed) : null,
		entriesMetaInfwar.entrySpeedNote ? renderer.render(entriesMetaInfwar.entrySpeedNote) : null,
		markdownUtils.getRenderedAbilityScores(extractAbilityScores(ent)),
		entriesMeta.entryDamageVulnerabilities ? renderer.render(entriesMeta.entryDamageVulnerabilities) : null,
		entriesMeta.entryDamageResistances ? renderer.render(entriesMeta.entryDamageResistances) : null,
		entriesMeta.entryDamageImmunities ? renderer.render(entriesMeta.entryDamageImmunities) : null,
		entriesMeta.entryConditionImmunities ? renderer.render(entriesMeta.entryConditionImmunities) : null,
		...getLinesRenderedTraits({ ent, renderer }),
		ent.actionStation?.length ? getRenderedSection({
			arr: ent.actionStation,
			ent,
			prop: "actionStation",
			title: "Action Stations",
			meta,
		}) : null,
		orderedReactions.length ? getRenderedSection({
			arr: orderedReactions,
			ent,
			prop: "reaction",
			title: "Reactions",
			meta,
		}) : null,
	]
		.map(it => it != null ? it.trim() : it)
		.filter(Boolean)
		.join("\n\n");

	return ptsJoined.trim();
};

const getRenderedSection = (params: {
	arr: any[];
	ent: any;
	prop: string;
	title: string;
	meta: RenderMeta;
}): string => {
	const { arr, ent, prop, title, meta } = params;
	if (!arr?.length) return "";

	const renderer = getMarkdownRenderer();
	const parts: string[] = [`### ${title}`];

	for (const entry of arr) {
		const cacheDepth = meta.depth;
		meta.depth = 2;
		parts.push(renderer.render(entry, { meta }));
		meta.depth = cacheDepth;
	}

	return parts.join("\n\n");
};

// ============ Vehicle Upgrade Renderer ============

const getUpgradeSummary = (ent: VehicleUpgrade): string | null => {
	const parts: string[] = [];

	if (ent.upgradeType?.length) {
		const vehicleTypes = ent.upgradeType.map(t => {
			const typeMap: Record<string, string> = {
				"SHP:H": "Ship Helm",
				"SHP:M": "Ship Movement",
				"SHP:W": "Ship Weapon",
				"SHP:F": "Ship Figurehead",
				"SHP:O": "Ship Hull",
				"IWM:W": "Infernal War Machine Weapon",
				"IWM:A": "Infernal War Machine Armor",
				"IWM:G": "Infernal War Machine Gadget",
			};
			return typeMap[t] || t;
		});
		parts.push(vehicleTypes.join(", "));
	}

	if (!parts.length) return null;
	return `*${parts.join(", ")}*`;
};

const getVehicleUpgradeCompactRenderedString = (ent: VehicleUpgrade, opts: VehicleUpgradeMarkdownOptions = {}): string => {
	const renderer = getMarkdownRenderer();

	const entries: (Entry | string | null)[] = [
		getUpgradeSummary(ent),
		{ entries: ent.entries } as Entry,
	].filter(Boolean);

	const ptHeader = `## ${ent.name}`;

	const ptBody = entries
		.map(e => {
			if (typeof e === "string") return e;
			return renderer.render(e as Entry, { meta: createRenderMeta({ depth: 1 }) });
		})
		.filter(Boolean)
		.join("\n\n");

	return `${ptHeader}\n\n${ptBody}`.trim();
};

// ============ Main Vehicle Renderer Class ============

export class VehicleMarkdownRenderer {
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

	getCompactRenderedString(ent: Vehicle | VehicleUpgrade, opts: VehicleMarkdownOptions = {}): string {
		if ((ent as VehicleUpgrade).upgradeType) {
			return getVehicleUpgradeCompactRenderedString(ent as VehicleUpgrade, opts);
		}

		const vehicle = ent as Vehicle;
		const vehicleType: VehicleType = vehicle.vehicleType ?? "SHIP";

		switch (vehicleType) {
			case "SHIP":
				return getRenderedStringShip(vehicle as VehicleShip, opts);

			case "SPELLJAMMER":
				return getRenderedStringSpelljammer(vehicle as VehicleSpelljammer, opts);

			case "ELEMENTAL_AIRSHIP":
				return getRenderedStringElementalAirship(vehicle as VehicleElementalAirship, opts);

			case "INFWAR":
				return getRenderedStringInfwar(vehicle as VehicleInfernalWarMachine, opts);

			case "CREATURE":
				// CREATURE vehicles delegate to monster renderer
				// Use: monsterMarkdown.getCompactRenderedString(ent, { ...opts, isHideLanguages: true, isHideSenses: true })
				throw new Error("CREATURE vehicles should use the monster renderer directly");

			case "OBJECT":
				// OBJECT vehicles delegate to object renderer
				// Use: objectMarkdown.getCompactRenderedString(ent, opts)
				throw new Error("OBJECT vehicles should use the object renderer directly");

			default:
				throw new Error(`Unhandled vehicle type "${vehicleType}"`);
		}
	}
}

// ============ Module Export ============

let _vehicleRenderer: VehicleMarkdownRenderer | null = null;

export const getVehicleMarkdownRenderer = (styleHint: StyleHint = "classic"): VehicleMarkdownRenderer => {
	if (!_vehicleRenderer) {
		_vehicleRenderer = new VehicleMarkdownRenderer(undefined, styleHint);
	} else {
		_vehicleRenderer.setStyleHint(styleHint);
	}
	return _vehicleRenderer;
};

export const vehicleMarkdown = {
	getCompactRenderedString: (ent: Vehicle | VehicleUpgrade, opts: VehicleMarkdownOptions = {}): string => {
		return getVehicleMarkdownRenderer(opts.styleHint).getCompactRenderedString(ent, opts);
	},

	ship: shipHelpers,
	spelljammer: spelljammerHelpers,
	elementalAirship: elementalAirshipHelpers,
	spelljammerElementalAirship: spelljammerElementalAirshipHelpers,
};

export const vehicleUpgradeMarkdown = {
	getCompactRenderedString: (ent: VehicleUpgrade, opts: VehicleUpgradeMarkdownOptions = {}): string => {
		return getVehicleUpgradeCompactRenderedString(ent, opts);
	},

	getUpgradeSummary,
};

export default vehicleMarkdown;
