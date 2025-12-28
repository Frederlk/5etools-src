import type { Vehicle, VehicleShip, VehicleUpgrade, ShipControl, ShipMovement, ShipWeapon, ShipOther, SpelljammerStation } from "../../../types/vehicles.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { type MarkdownRenderer } from "./renderer.js";
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
interface ShipRenderableEntriesMeta {
    entrySizeDimensions: string;
    entryCrewPassengers?: string;
    entryCargo?: string;
    entryTravelPace?: string;
    entrySpeed?: string;
    entriesOtherActions?: ShipOther[];
    entriesOtherOthers?: ShipOther[];
}
interface StationEntriesMeta {
    entryName: string;
    entryArmorClass: string | null;
    entryHitPoints: string | null;
    entryCost: string | null;
}
export declare class VehicleMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(ent: Vehicle | VehicleUpgrade, opts?: VehicleMarkdownOptions): string;
}
export declare const getVehicleMarkdownRenderer: (styleHint?: StyleHint) => VehicleMarkdownRenderer;
export declare const vehicleMarkdown: {
    getCompactRenderedString: (ent: Vehicle | VehicleUpgrade, opts?: VehicleMarkdownOptions) => string;
    ship: {
        getCrewCargoPaceSection_(ent: VehicleShip, opts?: {
            entriesMetaShip?: ShipRenderableEntriesMeta;
        }): string;
        getControlSection_(opts: {
            entry: ShipControl;
        }): string;
        getMovementSection_(opts: {
            entry: ShipMovement;
        }): string;
        getWeaponSection_(opts: {
            entry: ShipWeapon;
        }): string;
        getOtherSection_(opts: {
            entry: ShipOther;
        }): string;
    };
    spelljammer: {
        getStationSection_(opts: {
            entry: SpelljammerStation;
        }): string;
    };
    elementalAirship: {
        getStationSection_(opts: {
            entry: SpelljammerStation;
        }): string;
    };
    spelljammerElementalAirship: {
        getStationSection_(opts: {
            entriesMetaParent: StationEntriesMeta;
            entry: SpelljammerStation;
            isDisplayEmptyCost?: boolean;
        }): string;
    };
};
export declare const vehicleUpgradeMarkdown: {
    getCompactRenderedString: (ent: VehicleUpgrade, opts?: VehicleUpgradeMarkdownOptions) => string;
    getUpgradeSummary: (ent: VehicleUpgrade) => string | null;
};
export default vehicleMarkdown;
//# sourceMappingURL=vehicle.d.ts.map