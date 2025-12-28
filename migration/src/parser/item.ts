// Item Parser - TypeScript implementation
// Migrated from js/parser.js item-related methods

// ============ Types ============

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

// ============ Constants ============

export const COIN_ABVS: readonly CoinAbbreviation[] = ["cp", "sp", "ep", "gp", "pp"] as const;

export const COIN_ABV_TO_FULL: Record<CoinAbbreviation, string> = {
	cp: "copper pieces",
	sp: "silver pieces",
	ep: "electrum pieces",
	gp: "gold pieces",
	pp: "platinum pieces",
};

export const COIN_CONVERSIONS = [1, 10, 50, 100, 1000] as const;

export const DEFAULT_CURRENCY_CONVERSION_TABLE: readonly CurrencyConversion[] = [
	{ coin: "cp", mult: 1 },
	{ coin: "sp", mult: 0.1 },
	{ coin: "gp", mult: 0.01, isFallback: true },
] as const;

export const FULL_CURRENCY_CONVERSION_TABLE: readonly CurrencyConversion[] = [
	{ coin: "cp", mult: 1 },
	{ coin: "sp", mult: 0.1 },
	{ coin: "ep", mult: 0.02 },
	{ coin: "gp", mult: 0.01, isFallback: true },
	{ coin: "pp", mult: 0.001 },
] as const;

export const ATK_TYPE_TO_FULL: Record<string, string> = {
	MW: "Melee Weapon Attack",
	RW: "Ranged Weapon Attack",
};

export const ARMOR_ABV_TO_FULL: Record<string, string> = {
	"l.": "light",
	"m.": "medium",
	"h.": "heavy",
	"s.": "shield",
};

export const WEAPON_ABV_TO_FULL: Record<string, string> = {
	"s.": "simple",
	"m.": "martial",
};

export const ITM_RARITY_TO_SHORT: Record<string, string> = {
	common: "Com.",
	uncommon: "Unc.",
	rare: "Rare",
	"very rare": "V.Rare",
	legendary: "Leg.",
	artifact: "Art.",
	varies: "Var.",
};

export const ITEM_RECHARGE_TO_FULL: Record<string, string> = {
	round: "Every Round",
	restShort: "Short Rest",
	restLong: "Long Rest",
	dawn: "Dawn",
	dusk: "Dusk",
	midnight: "Midnight",
	week: "Week",
	month: "Month",
	year: "Year",
	decade: "Decade",
	century: "Century",
	special: "Special",
};

export const ITEM_MISC_TAG_TO_FULL: Record<string, string> = {
	"CF/W": "Creates Food/Water",
	CNS: "Consumable",
	TT: "Trinket Table",
};

// Vulgar fraction mappings
const VULGAR_FRACTIONS: Record<string, string> = {
	"125": "⅛",
	"2": "⅕",
	"25": "¼",
	"375": "⅜",
	"4": "⅖",
	"5": "½",
	"6": "⅗",
	"625": "⅝",
	"75": "¾",
	"8": "⅘",
	"875": "⅞",
};

// ============ Helper Functions ============

const parseAToB = <T extends string>(abMap: Record<string, T>, a: string, fallback?: T): T => {
	if (a == null) throw new TypeError("undefined or null object passed to parser");
	const trimmed = typeof a === "string" ? a.trim() : a;
	if (abMap[trimmed] !== undefined) return abMap[trimmed];
	return fallback !== undefined ? fallback : (trimmed as T);
};

const parseBToA = <T extends string>(abMap: Record<T, string>, b: string, fallback?: T): T => {
	if (b == null) throw new TypeError("undefined or null object passed to parser");
	const trimmed = typeof b === "string" ? b.trim() : b;
	for (const [key, value] of Object.entries(abMap)) {
		if (value === trimmed) return key as T;
	}
	return fallback !== undefined ? fallback : (trimmed as T);
};

// ============ Number Formatting Functions ============

export const numberToVulgar = (number: number, { isFallbackOnFractional = true } = {}): string | number | null => {
	const isNeg = number < 0;
	const spl = `${number}`.replace(/^-/, "").split(".");
	if (spl.length === 1) return number;

	let preDot = spl[0] === "0" ? "" : spl[0];
	if (isNeg) preDot = `-${preDot}`;

	// Check direct mappings
	if (VULGAR_FRACTIONS[spl[1]]) {
		return `${preDot}${VULGAR_FRACTIONS[spl[1]]}`;
	}

	// Handle thirds and sixths via approximation
	const asNum = Number(`0.${spl[1]}`);
	if (asNum.toFixed(2) === (1 / 3).toFixed(2)) return `${preDot}⅓`;
	if (asNum.toFixed(2) === (2 / 3).toFixed(2)) return `${preDot}⅔`;
	if (asNum.toFixed(2) === (1 / 6).toFixed(2)) return `${preDot}⅙`;
	if (asNum.toFixed(2) === (5 / 6).toFixed(2)) return `${preDot}⅚`;

	return isFallbackOnFractional ? numberToFractional(number) : null;
};

export const numberToFractional = (number: number): string => {
	const absNum = Math.abs(number);
	const wholePart = Math.floor(absNum);
	const fractionalPart = absNum - wholePart;

	if (fractionalPart === 0) return `${number}`;

	// Common fractions
	const fractions = [
		[1, 8], [1, 6], [1, 5], [1, 4], [1, 3], [3, 8], [2, 5], [1, 2],
		[3, 5], [5, 8], [2, 3], [3, 4], [4, 5], [5, 6], [7, 8],
	];

	for (const [num, denom] of fractions) {
		if (Math.abs(fractionalPart - num / denom) < 0.001) {
			const sign = number < 0 ? "-" : "";
			const whole = wholePart ? `${wholePart} ` : "";
			return `${sign}${whole}${num}/${denom}`;
		}
	}

	return `${number}`;
};

// ============ Currency Functions ============

export const coinAbvToFull = (coin: CoinAbbreviation): string => {
	return parseAToB(COIN_ABV_TO_FULL, coin);
};

export const getCurrencyConversionTable = (currencyConversionId?: string): readonly CurrencyConversion[] => {
	// In full implementation, this would check prerelease/homebrew lookups
	// For now, return default table
	return DEFAULT_CURRENCY_CONVERSION_TABLE;
};

export const getCurrencyAndMultiplier = (
	value: number | null | undefined,
	currencyConversionId?: string,
): CurrencyConversion => {
	const conversionTable = getCurrencyConversionTable(currencyConversionId);

	if (!value) {
		return conversionTable.find(it => it.isFallback) || conversionTable[0];
	}

	if (conversionTable.length === 1) return conversionTable[0];

	if (!Number.isInteger(value) && value < conversionTable[0].mult) {
		return conversionTable[0];
	}

	for (let i = conversionTable.length - 1; i >= 0; --i) {
		if (Number.isInteger(value * conversionTable[i].mult)) {
			return conversionTable[i];
		}
	}

	return conversionTable[conversionTable.length - 1];
};

export const doSimplifyCoins = (
	obj: Currency,
	{ currencyConversionId }: { currencyConversionId?: string } = {},
): Currency => {
	const conversionTable = [...getCurrencyConversionTable(currencyConversionId)]
		.map(it => ({ ...it, normalizedMult: 1 / it.mult }))
		.sort((a, b) => a.normalizedMult - b.normalizedMult);

	const result = { ...obj };

	// Convert up where possible
	for (let i = 0; i < conversionTable.length - 1; ++i) {
		const coinCur = conversionTable[i].coin;
		const coinNxt = conversionTable[i + 1].coin;
		const coinRatio = conversionTable[i + 1].normalizedMult / conversionTable[i].normalizedMult;

		const curVal = result[coinCur] || 0;
		if (curVal >= coinRatio) {
			const remainder = curVal % coinRatio;
			const toConvert = curVal - remainder;
			result[coinCur] = remainder;
			result[coinNxt] = (result[coinNxt] || 0) + (toConvert / coinRatio);
		}
	}

	// Clean up zeros
	for (const coin of COIN_ABVS) {
		if (result[coin] === 0) delete result[coin];
	}

	return result;
};

export const getAsCopper = (obj: Currency): number => {
	return FULL_CURRENCY_CONVERSION_TABLE
		.map(currencyMeta => (obj[currencyMeta.coin] || 0) * (1 / currencyMeta.mult))
		.reduce((a, b) => a + b, 0);
};

export interface GetDisplayCurrencyOptions {
	isDisplayEmpty?: boolean;
	styleHint?: StyleHint;
}

export const getDisplayCurrency = (
	currency: Currency,
	{ isDisplayEmpty = false, styleHint = null }: GetDisplayCurrencyOptions = {},
): string => {
	return [...COIN_ABVS]
		.reverse()
		.filter(abv => isDisplayEmpty ? currency[abv] != null : currency[abv])
		.map(abv => `${currency[abv]!.toLocaleString()} ${styleHint === "classic" ? abv : abv.toUpperCase()}`)
		.join(", ");
};

// ============ Value Functions ============

export interface MoneyToFullOptions {
	isShortForm?: boolean;
	isSmallUnits?: boolean;
}

const moneyToFull = (
	it: ItemValue | ItemCost,
	prop: "value" | "cost",
	propMult: "valueMult" | "costMult",
	{ isShortForm = false, isSmallUnits = false }: MoneyToFullOptions = {},
): string => {
	const value = it[prop as keyof typeof it] as number | undefined;
	const mult = it[propMult as keyof typeof it] as number | undefined;

	if (value == null && mult == null) return "";

	if (value != null) {
		const { coin, mult: coinMult } = getCurrencyAndMultiplier(value, it.currencyConversion);
		const displayValue = (value * coinMult).toLocaleString();
		return isSmallUnits
			? `${displayValue}<span class="small ml-1">${coin}</span>`
			: `${displayValue} ${coin}`;
	}

	if (mult != null) {
		return isShortForm ? `×${mult}` : `base value ×${mult}`;
	}

	return "";
};

export interface MoneyToFullMultiCurrencyOptions {
	isShortForm?: boolean;
	multiplier?: number | null;
	styleHint?: StyleHint;
}

const moneyToFullMultiCurrency = (
	it: ItemValue | ItemCost,
	prop: "value" | "cost",
	propMult: "valueMult" | "costMult",
	{ isShortForm = false, multiplier = null, styleHint = null }: MoneyToFullMultiCurrencyOptions = {},
): string => {
	const value = it[prop as keyof typeof it] as number | undefined;
	const mult = it[propMult as keyof typeof it] as number | undefined;

	if (value) {
		const conversionTable = getCurrencyConversionTable(it.currencyConversion);

		const simplified = doSimplifyCoins(
			{ cp: value * (multiplier ?? 1) },
			{ currencyConversionId: it.currencyConversion },
		);

		return [...conversionTable]
			.reverse()
			.filter(meta => simplified[meta.coin])
			.map(meta => `${simplified[meta.coin]!.toLocaleString()} ${styleHint === "classic" ? meta.coin : meta.coin.toUpperCase()}`)
			.join(", ");
	}

	if (value === 0) {
		return `0 ${styleHint === "classic" ? "gp" : "GP"}`;
	}

	if (mult) {
		return isShortForm ? `×${mult}` : `base value ×${mult}`;
	}

	return "";
};

export const itemValueToFull = (
	item: ItemValue,
	opts: MoneyToFullOptions = {},
): string => {
	return moneyToFull(item, "value", "valueMult", opts);
};

export const itemValueToFullMultiCurrency = (
	item: ItemValue,
	opts: MoneyToFullMultiCurrencyOptions = {},
): string => {
	return moneyToFullMultiCurrency(item, "value", "valueMult", opts);
};

export const spellComponentCostToFull = (
	item: ItemCost,
	isShortForm = false,
): string => {
	return moneyToFull(item, "cost", "costMult", { isShortForm });
};

export const vehicleCostToFull = (
	item: ItemCost,
	isShortForm = false,
): string => {
	return moneyToFull(item, "cost", "costMult", { isShortForm });
};

export const itemVehicleCostsToFull = (
	item: VehicleItem,
	isShortForm = false,
): { travelCostFull: string; shippingCostFull: string } => {
	return {
		travelCostFull: moneyToFull(
			{ value: item.travelCost, valueMult: item.travelCostMult, currencyConversion: item.currencyConversion } as ItemValue,
			"value",
			"valueMult",
			{ isShortForm },
		),
		shippingCostFull: moneyToFull(
			{ value: item.shippingCost, valueMult: item.shippingCostMult, currencyConversion: item.currencyConversion } as ItemValue,
			"value",
			"valueMult",
			{ isShortForm },
		),
	};
};

// ============ Weight Functions ============

export const itemWeightToFull = (item: ItemWeight, isShortForm = false): string => {
	if (item.weight) {
		// Handle pure integers
		if (Math.round(item.weight) === item.weight) {
			return `${item.weight} lb.${item.weightNote ? ` ${item.weightNote}` : ""}`;
		}

		const integerPart = Math.floor(item.weight);

		// Attempt to render as vulgar fraction
		const vulgarGlyph = numberToVulgar(item.weight - integerPart, { isFallbackOnFractional: false });
		if (vulgarGlyph) {
			return `${integerPart || ""}${vulgarGlyph} lb.${item.weightNote ? ` ${item.weightNote}` : ""}`;
		}

		// Fall back on decimal pounds or ounces
		const displayWeight = item.weight < 1 ? item.weight * 16 : item.weight;
		const unit = item.weight < 1 ? "oz" : "lb";
		return `${displayWeight.toLocaleString()} ${unit}.${item.weightNote ? ` ${item.weightNote}` : ""}`;
	}

	if (item.weightMult) {
		return isShortForm ? `×${item.weightMult}` : `base weight ×${item.weightMult}`;
	}

	return "";
};

// ============ Type/Property Functions ============

export const attackTypeToFull = (attackType: string): string => {
	return parseAToB(ATK_TYPE_TO_FULL, attackType);
};

export const armorFullToAbv = (armor: string): string => {
	return parseBToA(ARMOR_ABV_TO_FULL as Record<string, string>, armor) as string;
};

export const weaponFullToAbv = (weapon: string): string => {
	return parseBToA(WEAPON_ABV_TO_FULL as Record<string, string>, weapon) as string;
};

export const itemRarityToShort = (rarity: string | null | undefined): string => {
	if (!rarity) return rarity ?? "";
	if (ITM_RARITY_TO_SHORT[rarity]) return ITM_RARITY_TO_SHORT[rarity];
	if (rarity.length <= 4) return rarity.charAt(0).toUpperCase() + rarity.slice(1);
	return `${rarity.charAt(0).toUpperCase() + rarity.slice(1, 3)}.`;
};

export const itemRechargeToFull = (recharge: string): string => {
	return parseAToB(ITEM_RECHARGE_TO_FULL, recharge);
};

export const itemMiscTagToFull = (type: string): string => {
	return parseAToB(ITEM_MISC_TAG_TO_FULL, type);
};

// ============ Value Parsing Functions ============

const numberCleanRegexp = /[,.]*/g;
const costSplitPattern = /^(\d+(?:,\d+)*(?:\.\d+)?)\s*([a-zA-Z]+)$/;

export const coinValueToNumber = (value: string | null | undefined): number => {
	if (!value) return 0;
	if (value === "Varies") return 0;

	const cleaned = value.replace(/\s*/g, "").replace(numberCleanRegexp, "").toLowerCase();
	const match = costSplitPattern.test(cleaned) ? cleaned.match(costSplitPattern) : null;

	if (!match) throw new Error(`Badly formatted value "${value}"`);

	const ixCoin = COIN_ABVS.indexOf(match[2] as CoinAbbreviation);
	if (ixCoin === -1) throw new Error(`Unknown coin type "${match[2]}"`);

	return Number(match[1]) * COIN_CONVERSIONS[ixCoin];
};

export const weightValueToNumber = (value: string | number | null | undefined): number => {
	if (!value) return 0;
	const num = Number(value);
	if (!isNaN(num)) return num;
	throw new Error(`Badly formatted value ${value}`);
};
