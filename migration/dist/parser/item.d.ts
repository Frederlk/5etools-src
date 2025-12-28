export type StyleHint = "classic" | "one" | null;
export type CoinAbbreviation = "cp" | "sp" | "ep" | "gp" | "pp";
export interface CurrencyConversion {
    coin: CoinAbbreviation;
    mult: number;
    isFallback?: boolean;
}
export interface Currency {
    cp?: number;
    sp?: number;
    ep?: number;
    gp?: number;
    pp?: number;
}
export interface ItemValue {
    value?: number;
    valueMult?: number;
    currencyConversion?: string;
}
export interface ItemWeight {
    weight?: number;
    weightMult?: number;
    weightNote?: string;
}
export interface ItemCost {
    cost?: number;
    costMult?: number;
    currencyConversion?: string;
}
export interface VehicleItem {
    travelCost?: number;
    travelCostMult?: number;
    shippingCost?: number;
    shippingCostMult?: number;
    currencyConversion?: string;
}
export declare const COIN_ABVS: readonly CoinAbbreviation[];
export declare const COIN_ABV_TO_FULL: Record<CoinAbbreviation, string>;
export declare const COIN_CONVERSIONS: readonly [1, 10, 50, 100, 1000];
export declare const DEFAULT_CURRENCY_CONVERSION_TABLE: readonly CurrencyConversion[];
export declare const FULL_CURRENCY_CONVERSION_TABLE: readonly CurrencyConversion[];
export declare const ATK_TYPE_TO_FULL: Record<string, string>;
export declare const ARMOR_ABV_TO_FULL: Record<string, string>;
export declare const WEAPON_ABV_TO_FULL: Record<string, string>;
export declare const ITM_RARITY_TO_SHORT: Record<string, string>;
export declare const ITEM_RECHARGE_TO_FULL: Record<string, string>;
export declare const ITEM_MISC_TAG_TO_FULL: Record<string, string>;
export declare const numberToVulgar: (number: number, { isFallbackOnFractional }?: {
    isFallbackOnFractional?: boolean | undefined;
}) => string | number | null;
export declare const numberToFractional: (number: number) => string;
export declare const coinAbvToFull: (coin: CoinAbbreviation) => string;
export declare const getCurrencyConversionTable: (currencyConversionId?: string) => readonly CurrencyConversion[];
export declare const getCurrencyAndMultiplier: (value: number | null | undefined, currencyConversionId?: string) => CurrencyConversion;
export declare const doSimplifyCoins: (obj: Currency, { currencyConversionId }?: {
    currencyConversionId?: string;
}) => Currency;
export declare const getAsCopper: (obj: Currency) => number;
export interface GetDisplayCurrencyOptions {
    isDisplayEmpty?: boolean;
    styleHint?: StyleHint;
}
export declare const getDisplayCurrency: (currency: Currency, { isDisplayEmpty, styleHint }?: GetDisplayCurrencyOptions) => string;
export interface MoneyToFullOptions {
    isShortForm?: boolean;
    isSmallUnits?: boolean;
}
export interface MoneyToFullMultiCurrencyOptions {
    isShortForm?: boolean;
    multiplier?: number | null;
    styleHint?: StyleHint;
}
export declare const itemValueToFull: (item: ItemValue, opts?: MoneyToFullOptions) => string;
export declare const itemValueToFullMultiCurrency: (item: ItemValue, opts?: MoneyToFullMultiCurrencyOptions) => string;
export declare const spellComponentCostToFull: (item: ItemCost, isShortForm?: boolean) => string;
export declare const vehicleCostToFull: (item: ItemCost, isShortForm?: boolean) => string;
export declare const itemVehicleCostsToFull: (item: VehicleItem, isShortForm?: boolean) => {
    travelCostFull: string;
    shippingCostFull: string;
};
export declare const itemWeightToFull: (item: ItemWeight, isShortForm?: boolean) => string;
export declare const attackTypeToFull: (attackType: string) => string;
export declare const armorFullToAbv: (armor: string) => string;
export declare const weaponFullToAbv: (weapon: string) => string;
export declare const itemRarityToShort: (rarity: string | null | undefined) => string;
export declare const itemRechargeToFull: (recharge: string) => string;
export declare const itemMiscTagToFull: (type: string) => string;
export declare const coinValueToNumber: (value: string | null | undefined) => number;
export declare const weightValueToNumber: (value: string | number | null | undefined) => number;
//# sourceMappingURL=item.d.ts.map