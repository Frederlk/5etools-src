/**
 * Manual type definitions for vehicles.json schema.
 * Based on schema/site/vehicles.json v1.8.0
 */

import type {Entry} from "./entry.js";
import type {
	Source, Page, Size, Speed,
	OtherSource, ReprintedAs,
	DamageResistance, DamageImmunity, DamageVulnerability, ConditionImmunity
} from "./util.js";

// ============ Root Types ============

export interface VehiclesJson {
	vehicle?: Vehicle[];
	vehicleUpgrade?: VehicleUpgrade[];
}

// ============ Vehicle Type Union ============

export type Vehicle =
	| VehicleShip
	| VehicleSpelljammer
	| VehicleElementalAirship
	| VehicleInfernalWarMachine
	| VehicleCreature
	| VehicleObject;

export type VehicleType =
	| "SHIP"
	| "SPELLJAMMER"
	| "ELEMENTAL_AIRSHIP"
	| "INFWAR"
	| "CREATURE"
	| "OBJECT";

export type VehicleTerrain = ("land" | "sea" | "air" | "space")[];

// ============ Vehicle Upgrade ============

export interface VehicleUpgrade {
	name: string;
	source: Source;
	entries: Entry[];
	upgradeType: string[];
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	legacy?: boolean;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
}

// ============ Ship Vehicle ============

export interface VehicleShip {
	name: string;
	source: Source;
	vehicleType?: "SHIP";
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	legacy?: boolean;
	terrain?: VehicleTerrain;
	size?: Size;
	dimensions?: string[];
	capCrew?: number;
	capPassenger?: number;
	capCargo?: number | string;
	pace?: number;
	str?: number;
	dex?: number;
	con?: number;
	int?: number;
	wis?: number;
	cha?: number;
	resist?: (string | DamageResistance)[];
	immune?: (string | DamageImmunity)[];
	vulnerable?: (string | DamageVulnerability)[];
	conditionImmune?: (string | ConditionImmunity)[];
	actionThresholds?: Record<string, number>;
	action?: Entry[];
	hull?: ShipHull;
	control?: ShipControl[];
	movement?: ShipMovement[];
	weapon?: ShipWeapon[];
	other?: ShipOther[];
	trait?: ShipTrait[] | null;
	token?: string;
	tokenCredit?: string;
	tokenCustom?: true;
	hasToken?: boolean;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
}

export interface ShipHull {
	ac: number;
	hp: number;
	hpNote?: string;
	dt?: number;
}

export interface ShipControl {
	name?: string;
	ac: number;
	hp: number;
	dt?: number;
	entries: Entry[];
}

export interface ShipMovement {
	name?: string;
	isControl?: boolean;
	ac: number;
	hp: number;
	hpNote?: string;
	dt?: number;
	locomotion?: ShipLocomotion[];
	speed?: ShipSpeed[];
}

export interface ShipLocomotion {
	mode: string;
	entries: Entry[];
}

export interface ShipSpeed {
	mode: string;
	entries: Entry[];
}

export interface ShipWeapon {
	name: string;
	entries: Entry[];
	ac?: number;
	hp?: number;
	count?: number;
	dt?: number;
}

export interface ShipOther {
	name: string;
	entries: Entry[];
}

export interface ShipTrait {
	name: string;
	entries: Entry[];
	type?: "entries" | "inset";
	sort?: number;
}

// ============ Spelljammer Vehicle ============

export interface VehicleSpelljammer {
	name: string;
	source: Source;
	vehicleType?: "SPELLJAMMER";
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	legacy?: boolean;
	terrain?: VehicleTerrain;
	dimensions?: string[];
	capCrew?: number;
	capCrewNote?: string;
	capCargo?: number | string;
	pace?: SpelljammerPace;
	speed?: Speed;
	hull?: SpelljammerHull;
	cost?: number;
	weapon?: SpelljammerStation[];
	token?: string;
	tokenCredit?: string;
	tokenCustom?: true;
	hasToken?: boolean;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
}

// ============ Elemental Airship Vehicle ============

export interface VehicleElementalAirship {
	name: string;
	source: Source;
	vehicleType?: "ELEMENTAL_AIRSHIP";
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	legacy?: boolean;
	terrain?: VehicleTerrain;
	capCrew?: number;
	capCrewNote?: string;
	capPassenger?: number;
	capCargo?: number | string;
	pace?: SpelljammerPace;
	speed?: Speed;
	hull?: SpelljammerHull;
	cost?: number;
	weapon?: SpelljammerStation[];
	station?: SpelljammerStation[];
	token?: string;
	tokenCredit?: string;
	tokenCustom?: true;
	hasToken?: boolean;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
}

// ============ Shared Spelljammer/Elemental Airship Types ============

export interface SpelljammerPace {
	walk?: string | number;
	burrow?: string | number;
	climb?: string | number;
	fly?: string | number;
	swim?: string | number;
}

export interface SpelljammerHull {
	ac: number;
	hp: number;
	acFrom?: string[];
	dt?: number;
}

export interface SpelljammerStation {
	name: string;
	entries: Entry[];
	size?: Size[];
	ac?: number;
	hp?: number;
	count?: number;
	crew?: number;
	costs?: SpelljammerStationCost[];
	action?: SpelljammerAction[];
}

export interface SpelljammerStationCost {
	cost?: number;
	note?: string;
}

export interface SpelljammerAction {
	name?: string;
	entries?: Entry[];
}

// ============ Infernal War Machine Vehicle ============

export interface VehicleInfernalWarMachine {
	name: string;
	source: Source;
	vehicleType?: "INFWAR";
	page?: Page;
	otherSources?: OtherSource[];
	reprintedAs?: ReprintedAs;
	legacy?: boolean;
	terrain?: VehicleTerrain;
	size?: Size;
	weight?: number;
	capCreature?: number;
	capCargo?: number;
	speed?: number;
	str?: number;
	dex?: number;
	con?: number;
	int?: number;
	wis?: number;
	cha?: number;
	hp?: InfernalWarMachineHp;
	ac?: number;
	resist?: (string | DamageResistance)[];
	immune?: (string | DamageImmunity)[];
	vulnerable?: (string | DamageVulnerability)[];
	conditionImmune?: (string | ConditionImmunity)[];
	trait?: InfernalWarMachineTrait[];
	actionStation?: InfernalWarMachineActionStation[];
	reaction?: InfernalWarMachineReaction[];
	token?: string;
	tokenCredit?: string;
	tokenCustom?: true;
	hasToken?: boolean;
	hasFluff?: boolean;
	hasFluffImages?: boolean;
}

export interface InfernalWarMachineHp {
	hp: number;
	dt: number;
	mt?: number;
}

export interface InfernalWarMachineTrait {
	name?: string;
	entries?: Entry[];
}

export interface InfernalWarMachineActionStation {
	name?: string;
	entries?: Entry[];
}

export interface InfernalWarMachineReaction {
	name?: string;
	entries?: Entry[];
}

// ============ Creature/Object Vehicles ============

export interface VehicleCreature {
	vehicleType: "CREATURE";
	terrain?: VehicleTerrain;
	[key: string]: unknown;
}

export interface VehicleObject {
	vehicleType: "OBJECT";
	terrain?: VehicleTerrain;
	[key: string]: unknown;
}
