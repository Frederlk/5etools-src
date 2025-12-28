// Item Parser - TypeScript implementation
// Migrated from js/parser.js item-related methods
// ============ Constants ============
export const COIN_ABVS = ["cp", "sp", "ep", "gp", "pp"];
export const COIN_ABV_TO_FULL = {
    cp: "copper pieces",
    sp: "silver pieces",
    ep: "electrum pieces",
    gp: "gold pieces",
    pp: "platinum pieces",
};
export const COIN_CONVERSIONS = [1, 10, 50, 100, 1000];
export const DEFAULT_CURRENCY_CONVERSION_TABLE = [
    { coin: "cp", mult: 1 },
    { coin: "sp", mult: 0.1 },
    { coin: "gp", mult: 0.01, isFallback: true },
];
export const FULL_CURRENCY_CONVERSION_TABLE = [
    { coin: "cp", mult: 1 },
    { coin: "sp", mult: 0.1 },
    { coin: "ep", mult: 0.02 },
    { coin: "gp", mult: 0.01, isFallback: true },
    { coin: "pp", mult: 0.001 },
];
export const ATK_TYPE_TO_FULL = {
    MW: "Melee Weapon Attack",
    RW: "Ranged Weapon Attack",
};
export const ARMOR_ABV_TO_FULL = {
    "l.": "light",
    "m.": "medium",
    "h.": "heavy",
    "s.": "shield",
};
export const WEAPON_ABV_TO_FULL = {
    "s.": "simple",
    "m.": "martial",
};
export const ITM_RARITY_TO_SHORT = {
    common: "Com.",
    uncommon: "Unc.",
    rare: "Rare",
    "very rare": "V.Rare",
    legendary: "Leg.",
    artifact: "Art.",
    varies: "Var.",
};
export const ITEM_RECHARGE_TO_FULL = {
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
export const ITEM_MISC_TAG_TO_FULL = {
    "CF/W": "Creates Food/Water",
    CNS: "Consumable",
    TT: "Trinket Table",
};
// Vulgar fraction mappings
const VULGAR_FRACTIONS = {
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
const parseAToB = (abMap, a, fallback) => {
    if (a == null)
        throw new TypeError("undefined or null object passed to parser");
    const trimmed = typeof a === "string" ? a.trim() : a;
    if (abMap[trimmed] !== undefined)
        return abMap[trimmed];
    return fallback !== undefined ? fallback : trimmed;
};
const parseBToA = (abMap, b, fallback) => {
    if (b == null)
        throw new TypeError("undefined or null object passed to parser");
    const trimmed = typeof b === "string" ? b.trim() : b;
    for (const [key, value] of Object.entries(abMap)) {
        if (value === trimmed)
            return key;
    }
    return fallback !== undefined ? fallback : trimmed;
};
// ============ Number Formatting Functions ============
export const numberToVulgar = (number, { isFallbackOnFractional = true } = {}) => {
    const isNeg = number < 0;
    const spl = `${number}`.replace(/^-/, "").split(".");
    if (spl.length === 1)
        return number;
    let preDot = spl[0] === "0" ? "" : spl[0];
    if (isNeg)
        preDot = `-${preDot}`;
    // Check direct mappings
    if (VULGAR_FRACTIONS[spl[1]]) {
        return `${preDot}${VULGAR_FRACTIONS[spl[1]]}`;
    }
    // Handle thirds and sixths via approximation
    const asNum = Number(`0.${spl[1]}`);
    if (asNum.toFixed(2) === (1 / 3).toFixed(2))
        return `${preDot}⅓`;
    if (asNum.toFixed(2) === (2 / 3).toFixed(2))
        return `${preDot}⅔`;
    if (asNum.toFixed(2) === (1 / 6).toFixed(2))
        return `${preDot}⅙`;
    if (asNum.toFixed(2) === (5 / 6).toFixed(2))
        return `${preDot}⅚`;
    return isFallbackOnFractional ? numberToFractional(number) : null;
};
export const numberToFractional = (number) => {
    const absNum = Math.abs(number);
    const wholePart = Math.floor(absNum);
    const fractionalPart = absNum - wholePart;
    if (fractionalPart === 0)
        return `${number}`;
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
export const coinAbvToFull = (coin) => {
    return parseAToB(COIN_ABV_TO_FULL, coin);
};
export const getCurrencyConversionTable = (currencyConversionId) => {
    // In full implementation, this would check prerelease/homebrew lookups
    // For now, return default table
    return DEFAULT_CURRENCY_CONVERSION_TABLE;
};
export const getCurrencyAndMultiplier = (value, currencyConversionId) => {
    const conversionTable = getCurrencyConversionTable(currencyConversionId);
    if (!value) {
        return conversionTable.find(it => it.isFallback) || conversionTable[0];
    }
    if (conversionTable.length === 1)
        return conversionTable[0];
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
export const doSimplifyCoins = (obj, { currencyConversionId } = {}) => {
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
        if (result[coin] === 0)
            delete result[coin];
    }
    return result;
};
export const getAsCopper = (obj) => {
    return FULL_CURRENCY_CONVERSION_TABLE
        .map(currencyMeta => (obj[currencyMeta.coin] || 0) * (1 / currencyMeta.mult))
        .reduce((a, b) => a + b, 0);
};
export const getDisplayCurrency = (currency, { isDisplayEmpty = false, styleHint = null } = {}) => {
    return [...COIN_ABVS]
        .reverse()
        .filter(abv => isDisplayEmpty ? currency[abv] != null : currency[abv])
        .map(abv => `${currency[abv].toLocaleString()} ${styleHint === "classic" ? abv : abv.toUpperCase()}`)
        .join(", ");
};
const moneyToFull = (it, prop, propMult, { isShortForm = false, isSmallUnits = false } = {}) => {
    const value = it[prop];
    const mult = it[propMult];
    if (value == null && mult == null)
        return "";
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
const moneyToFullMultiCurrency = (it, prop, propMult, { isShortForm = false, multiplier = null, styleHint = null } = {}) => {
    const value = it[prop];
    const mult = it[propMult];
    if (value) {
        const conversionTable = getCurrencyConversionTable(it.currencyConversion);
        const simplified = doSimplifyCoins({ cp: value * (multiplier ?? 1) }, { currencyConversionId: it.currencyConversion });
        return [...conversionTable]
            .reverse()
            .filter(meta => simplified[meta.coin])
            .map(meta => `${simplified[meta.coin].toLocaleString()} ${styleHint === "classic" ? meta.coin : meta.coin.toUpperCase()}`)
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
export const itemValueToFull = (item, opts = {}) => {
    return moneyToFull(item, "value", "valueMult", opts);
};
export const itemValueToFullMultiCurrency = (item, opts = {}) => {
    return moneyToFullMultiCurrency(item, "value", "valueMult", opts);
};
export const spellComponentCostToFull = (item, isShortForm = false) => {
    return moneyToFull(item, "cost", "costMult", { isShortForm });
};
export const vehicleCostToFull = (item, isShortForm = false) => {
    return moneyToFull(item, "cost", "costMult", { isShortForm });
};
export const itemVehicleCostsToFull = (item, isShortForm = false) => {
    return {
        travelCostFull: moneyToFull({ value: item.travelCost, valueMult: item.travelCostMult, currencyConversion: item.currencyConversion }, "value", "valueMult", { isShortForm }),
        shippingCostFull: moneyToFull({ value: item.shippingCost, valueMult: item.shippingCostMult, currencyConversion: item.currencyConversion }, "value", "valueMult", { isShortForm }),
    };
};
// ============ Weight Functions ============
export const itemWeightToFull = (item, isShortForm = false) => {
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
export const attackTypeToFull = (attackType) => {
    return parseAToB(ATK_TYPE_TO_FULL, attackType);
};
export const armorFullToAbv = (armor) => {
    return parseBToA(ARMOR_ABV_TO_FULL, armor);
};
export const weaponFullToAbv = (weapon) => {
    return parseBToA(WEAPON_ABV_TO_FULL, weapon);
};
export const itemRarityToShort = (rarity) => {
    if (!rarity)
        return rarity ?? "";
    if (ITM_RARITY_TO_SHORT[rarity])
        return ITM_RARITY_TO_SHORT[rarity];
    if (rarity.length <= 4)
        return rarity.charAt(0).toUpperCase() + rarity.slice(1);
    return `${rarity.charAt(0).toUpperCase() + rarity.slice(1, 3)}.`;
};
export const itemRechargeToFull = (recharge) => {
    return parseAToB(ITEM_RECHARGE_TO_FULL, recharge);
};
export const itemMiscTagToFull = (type) => {
    return parseAToB(ITEM_MISC_TAG_TO_FULL, type);
};
// ============ Value Parsing Functions ============
const numberCleanRegexp = /[,.]*/g;
const costSplitPattern = /^(\d+(?:,\d+)*(?:\.\d+)?)\s*([a-zA-Z]+)$/;
export const coinValueToNumber = (value) => {
    if (!value)
        return 0;
    if (value === "Varies")
        return 0;
    const cleaned = value.replace(/\s*/g, "").replace(numberCleanRegexp, "").toLowerCase();
    const match = costSplitPattern.test(cleaned) ? cleaned.match(costSplitPattern) : null;
    if (!match)
        throw new Error(`Badly formatted value "${value}"`);
    const ixCoin = COIN_ABVS.indexOf(match[2]);
    if (ixCoin === -1)
        throw new Error(`Unknown coin type "${match[2]}"`);
    return Number(match[1]) * COIN_CONVERSIONS[ixCoin];
};
export const weightValueToNumber = (value) => {
    if (!value)
        return 0;
    const num = Number(value);
    if (!isNaN(num))
        return num;
    throw new Error(`Badly formatted value ${value}`);
};
//# sourceMappingURL=item.js.map