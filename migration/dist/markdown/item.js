// Item Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.item
// Provides item-specific markdown rendering for D&D 5e items
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { itemValueToFullMultiCurrency, itemWeightToFull } from "../parser/item.js";
import { getMarkdownRenderer } from "./renderer.js";
import { uppercaseFirst } from "../util/str-util.js";
// ============ Helper Functions ============
const getItemTypeText = (item, styleHint) => {
    const typeParts = [];
    if (item.wondrous) {
        typeParts.push("Wondrous Item");
    }
    else if (item.staff) {
        typeParts.push("Staff");
    }
    else if (item.tattoo) {
        typeParts.push("Tattoo");
    }
    else if (item.armor) {
        if (item.type) {
            typeParts.push(getArmorTypeText(item.type));
        }
        else {
            typeParts.push("Armor");
        }
    }
    else if (item.weapon) {
        typeParts.push(item.weaponCategory ? `${uppercaseFirst(item.weaponCategory)} Weapon` : "Weapon");
    }
    else if (item.type) {
        typeParts.push(getItemTypeFromAbbreviation(item.type));
    }
    if (item.rarity && item.rarity !== "none") {
        typeParts.push(item.rarity);
    }
    return typeParts.join(", ");
};
const getArmorTypeText = (type) => {
    const armorTypes = {
        LA: "Light Armor",
        MA: "Medium Armor",
        HA: "Heavy Armor",
        S: "Shield",
    };
    return armorTypes[type] ?? type;
};
const getItemTypeFromAbbreviation = (type) => {
    const itemTypes = {
        A: "Ammunition",
        AF: "Ammunition (futuristic)",
        AIR: "Vehicle (air)",
        AT: "Artisan's Tools",
        EXP: "Explosive",
        FD: "Food and Drink",
        G: "Adventuring Gear",
        GS: "Gaming Set",
        GV: "Generic Variant",
        HA: "Heavy Armor",
        INS: "Instrument",
        LA: "Light Armor",
        M: "Melee Weapon",
        MA: "Medium Armor",
        MNT: "Mount",
        OTH: "Other",
        P: "Potion",
        R: "Ranged Weapon",
        RD: "Rod",
        RG: "Ring",
        S: "Shield",
        SC: "Scroll",
        SCF: "Spellcasting Focus",
        SHP: "Vehicle (water)",
        SPC: "Vehicle (space)",
        T: "Tool",
        TAH: "Tack and Harness",
        TG: "Trade Good",
        VEH: "Vehicle (land)",
        WD: "Wand",
    };
    return itemTypes[type] ?? type;
};
const getAttunementText = (item) => {
    if (!item.reqAttune)
        return "";
    if (item.reqAttune === true)
        return "(requires attunement)";
    if (typeof item.reqAttune === "string") {
        return `(requires attunement ${item.reqAttune})`;
    }
    return "";
};
const getDamageText = (item) => {
    if (!item.damage)
        return "";
    const damageType = item.damageType ? ` ${item.damageType}` : "";
    return `${item.damage}${damageType}`;
};
const getPropertiesText = (item) => {
    if (!item.property?.length)
        return "";
    const propertyMap = {
        A: "Ammunition",
        AF: "Ammunition (Firearms)",
        BF: "Burst Fire",
        F: "Finesse",
        H: "Heavy",
        L: "Light",
        LD: "Loading",
        R: "Reach",
        RLD: "Reload",
        S: "Special",
        T: "Thrown",
        "2H": "Two-Handed",
        V: "Versatile",
    };
    return item.property
        .map(p => propertyMap[p] ?? p)
        .join(", ");
};
const getMasteryText = (item) => {
    if (!item.mastery?.length)
        return "";
    return `Mastery: ${item.mastery.join(", ")}`;
};
const hasItemEntries = (item) => {
    return !!(item.entries?.length ||
        item._fullEntries?.length ||
        item.additionalEntries?.length ||
        item._fullAdditionalEntries?.length);
};
const getTypeRarityAndAttunementTextParts = (item, renderer, styleHint) => {
    const parts = [];
    // Type
    const typeText = getItemTypeText(item, styleHint);
    if (typeText)
        parts.push(typeText);
    // Attunement
    const attunementText = getAttunementText(item);
    return {
        typeRarityText: parts.join(", ") + (attunementText ? ` ${attunementText}` : ""),
        subTypeText: item.typeAlt ?? "",
        tierText: item.tier ?? "",
    };
};
// ============ Item Markdown Renderer ============
export class ItemMarkdownRenderer {
    _renderer;
    _styleHint;
    constructor(renderer, styleHint = "classic") {
        this._renderer = renderer ?? getMarkdownRenderer();
        this._styleHint = styleHint;
    }
    setRenderer(renderer) {
        this._renderer = renderer;
        return this;
    }
    setStyleHint(styleHint) {
        this._styleHint = styleHint;
        return this;
    }
    getCompactRenderedString(item, opts = {}) {
        const meta = opts.meta ?? createRenderMeta();
        const styleHint = opts.styleHint ?? this._styleHint;
        const subStack = createTextStack();
        // Get type/rarity parts
        const { typeRarityText, subTypeText, tierText } = getTypeRarityAndAttunementTextParts(item, this._renderer, styleHint);
        // Build damage/properties line
        const ptDamage = getDamageText(item);
        const ptProperties = getPropertiesText(item);
        const ptMastery = getMasteryText(item);
        // Build subtitle parts
        const typeRarityTierValueWeight = [
            typeRarityText,
            subTypeText,
            tierText,
            itemValueToFullMultiCurrency(item, { styleHint }),
            itemWeightToFull(item),
        ]
            .filter(Boolean)
            .join(", ");
        const ptSubtitle = [
            typeRarityTierValueWeight ? uppercaseFirst(typeRarityTierValueWeight) : "",
            ptDamage,
            ptProperties,
            ptMastery,
        ]
            .filter(Boolean)
            .join("\n\n");
        // Item header
        const displayName = item._displayName ?? item.name;
        subStack[0] += `#### ${displayName}`;
        if (ptSubtitle) {
            subStack[0] += `\n\n${ptSubtitle}\n\n---\n\n`;
        }
        else {
            subStack[0] += `\n\n`;
        }
        // Render item entries
        if (hasItemEntries(item)) {
            const cacheDepth = meta.depth;
            meta.depth = 1;
            const mainEntries = item._fullEntries ?? item.entries;
            if (mainEntries?.length) {
                this._renderer.recursiveRender({ type: "entries", entries: mainEntries }, subStack, meta, { suffix: "\n" });
            }
            const additionalEntries = item._fullAdditionalEntries ?? item.additionalEntries;
            if (additionalEntries?.length) {
                this._renderer.recursiveRender({ type: "entries", entries: additionalEntries }, subStack, meta, { suffix: "\n" });
            }
            meta.depth = cacheDepth;
        }
        const itemRender = subStack.join("").trim();
        return `\n${itemRender}\n\n`;
    }
}
// ============ Module Export ============
let _itemRenderer = null;
export const getItemMarkdownRenderer = (styleHint = "classic") => {
    if (!_itemRenderer) {
        _itemRenderer = new ItemMarkdownRenderer(undefined, styleHint);
    }
    else {
        _itemRenderer.setStyleHint(styleHint);
    }
    return _itemRenderer;
};
export const itemMarkdown = {
    getCompactRenderedString: (item, opts = {}) => {
        return getItemMarkdownRenderer(opts.styleHint).getCompactRenderedString(item, opts);
    },
    getTypeRarityAndAttunementTextParts: (item, opts = {}) => {
        const renderer = getMarkdownRenderer();
        return getTypeRarityAndAttunementTextParts(item, renderer, opts.styleHint ?? "classic");
    },
};
// ============ Variant Renderers ============
export const baseItemMarkdown = {
    getCompactRenderedString: (item, opts = {}) => {
        return itemMarkdown.getCompactRenderedString(item, opts);
    },
};
export const magicVariantMarkdown = {
    getCompactRenderedString: (item, opts = {}) => {
        return itemMarkdown.getCompactRenderedString(item, opts);
    },
};
export const itemGroupMarkdown = {
    getCompactRenderedString: (item, opts = {}) => {
        return itemMarkdown.getCompactRenderedString(item, opts);
    },
};
//# sourceMappingURL=item.js.map