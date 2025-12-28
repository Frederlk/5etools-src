// Base Renderer - TypeScript implementation
// Migrated from js/render.js Renderer class
// Provides core rendering infrastructure for entries
import { createTextStack, createRenderMeta } from "./types.js";
import { stripTags } from "./tags.js";
export const defaultRendererConfig = {
    styleHint: "classic",
    isAddHandlers: true,
    baseUrl: "",
};
// ============ Entry Type Checking ============
export const isEntryObject = (entry) => {
    return typeof entry === "object" && entry !== null;
};
export const getEntryType = (entry) => {
    if (typeof entry === "string")
        return "string";
    if (entry == null)
        return "null";
    return entry.type ?? "entries";
};
// ============ Base Renderer Class ============
/**
 * Abstract base renderer class.
 * Provides core recursive rendering logic with hooks for customization.
 * Extend this class to create specialized renderers (HTML, Markdown, etc.)
 */
export class BaseRenderer {
    config;
    constructor(config = {}) {
        this.config = { ...defaultRendererConfig, ...config };
    }
    // ============ Configuration Methods ============
    setStyleHint(styleHint) {
        this.config.styleHint = styleHint;
        return this;
    }
    setAddHandlers(isAddHandlers) {
        this.config.isAddHandlers = isAddHandlers;
        return this;
    }
    setBaseUrl(baseUrl) {
        this.config.baseUrl = baseUrl;
        return this;
    }
    // ============ Main Render Method ============
    /**
     * Render an entry to string output.
     * @param entry - Entry to render
     * @param options - Render options
     * @returns Rendered string
     */
    render(entry, options = {}) {
        const textStack = createTextStack();
        const meta = createRenderMeta({
            styleHint: this.config.styleHint,
            ...options.meta,
        });
        this.recursiveRender(entry, textStack, meta, options);
        return textStack[0];
    }
    /**
     * Recursively render an entry, appending to textStack.
     * @param entry - Entry to render
     * @param textStack - Text accumulator
     * @param meta - Render metadata
     * @param options - Render options
     */
    recursiveRender(entry, textStack, meta, options = {}) {
        // Handle arrays (shouldn't happen normally, but be safe)
        if (Array.isArray(entry)) {
            for (const e of entry) {
                this.recursiveRender(e, textStack, meta, options);
            }
            return;
        }
        // Initialize textStack if needed
        if (!textStack[0])
            textStack[0] = "";
        // Initialize meta
        meta._typeStack = meta._typeStack || [];
        meta.depth = meta.depth ?? 0;
        meta.styleHint = meta.styleHint ?? this.config.styleHint;
        this._recursiveRender(entry, textStack, meta, options);
    }
    /**
     * Internal recursive render implementation.
     */
    _recursiveRender(entry, textStack, meta, options) {
        if (entry == null)
            return;
        // Handle wrapped entries
        if (isEntryObject(entry) && entry.type === "wrapper") {
            return this._recursiveRender(entry.wrapped, textStack, meta, options);
        }
        // Handle section type (adjusts depth)
        if (isEntryObject(entry) && entry.type === "section") {
            meta.depth = -1;
        }
        meta._didRenderPrefix = false;
        meta._didRenderSuffix = false;
        if (typeof entry === "object" && entry !== null) {
            const type = getEntryType(entry);
            meta._typeStack.push(type);
            this._renderByType(entry, type, textStack, meta, options);
            meta._typeStack.pop();
        }
        else if (typeof entry === "string") {
            this._renderPrefix(entry, textStack, meta, options);
            this._renderString(entry, textStack, meta, options);
            this._renderSuffix(entry, textStack, meta, options);
        }
        else {
            // Numbers, booleans, etc.
            this._renderPrefix(entry, textStack, meta, options);
            textStack[0] += String(entry);
            this._renderSuffix(entry, textStack, meta, options);
        }
    }
    /**
     * Route rendering to appropriate type handler.
     */
    _renderByType(entry, type, textStack, meta, options) {
        switch (type) {
            // Recursive entry types
            case "entries":
            case "section":
                this._renderEntries(entry, textStack, meta, options);
                break;
            case "options":
                this._renderOptions(entry, textStack, meta, options);
                break;
            case "list":
                this._renderList(entry, textStack, meta, options);
                break;
            case "table":
                this._renderTable(entry, textStack, meta, options);
                break;
            case "tableGroup":
                this._renderTableGroup(entry, textStack, meta, options);
                break;
            case "inset":
                this._renderInset(entry, textStack, meta, options);
                break;
            case "insetReadaloud":
                this._renderInsetReadaloud(entry, textStack, meta, options);
                break;
            case "variant":
                this._renderVariant(entry, textStack, meta, options);
                break;
            case "variantInner":
                this._renderVariantInner(entry, textStack, meta, options);
                break;
            case "variantSub":
                this._renderVariantSub(entry, textStack, meta, options);
                break;
            case "quote":
                this._renderQuote(entry, textStack, meta, options);
                break;
            case "optfeature":
                this._renderOptfeature(entry, textStack, meta, options);
                break;
            // Block types
            case "abilityDc":
                this._renderAbilityDc(entry, textStack, meta, options);
                break;
            case "abilityAttackMod":
                this._renderAbilityAttackMod(entry, textStack, meta, options);
                break;
            case "abilityGeneric":
                this._renderAbilityGeneric(entry, textStack, meta, options);
                break;
            // Inline types
            case "inline":
                this._renderInline(entry, textStack, meta, options);
                break;
            case "inlineBlock":
                this._renderInlineBlock(entry, textStack, meta, options);
                break;
            case "bonus":
                this._renderBonus(entry, textStack, meta, options);
                break;
            case "bonusSpeed":
                this._renderBonusSpeed(entry, textStack, meta, options);
                break;
            case "dice":
                this._renderDice(entry, textStack, meta, options);
                break;
            case "link":
                this._renderLink(entry, textStack, meta, options);
                break;
            // List items
            case "item":
                this._renderItem(entry, textStack, meta, options);
                break;
            case "itemSub":
                this._renderItemSub(entry, textStack, meta, options);
                break;
            case "itemSpell":
                this._renderItemSpell(entry, textStack, meta, options);
                break;
            // Images
            case "image":
                this._renderImage(entry, textStack, meta, options);
                break;
            case "gallery":
                this._renderGallery(entry, textStack, meta, options);
                break;
            // Misc
            case "hr":
                this._renderHr(entry, textStack, meta, options);
                break;
            case "code":
                this._renderCode(entry, textStack, meta, options);
                break;
            // Statblocks
            case "statblockInline":
            case "statblock":
                this._renderStatblock(entry, textStack, meta, options);
                break;
            // Actions/attacks
            case "actions":
                this._renderActions(entry, textStack, meta, options);
                break;
            case "attack":
                this._renderAttack(entry, textStack, meta, options);
                break;
            // Spellcasting
            case "spellcasting":
                this._renderSpellcasting(entry, textStack, meta, options);
                break;
            // Flowcharts
            case "flowchart":
                this._renderFlowchart(entry, textStack, meta, options);
                break;
            case "flowBlock":
                this._renderFlowBlock(entry, textStack, meta, options);
                break;
            // Ingredients (recipes)
            case "ingredient":
                this._renderIngredient(entry, textStack, meta, options);
                break;
            // Homebrew
            case "homebrew":
                this._renderHomebrew(entry, textStack, meta, options);
                break;
            // Raw HTML (skip for non-HTML renderers)
            case "wrappedHtml":
                // Override in HTML renderer
                break;
            default:
                // Unknown type - try to render as entries
                if (entry.entries) {
                    this._renderEntries(entry, textStack, meta, options);
                }
                break;
        }
    }
    // ============ Prefix/Suffix Rendering ============
    _renderPrefix(entry, textStack, meta, options) {
        if (meta._didRenderPrefix)
            return;
        if (options.prefix) {
            textStack[0] += options.prefix;
            meta._didRenderPrefix = true;
        }
    }
    _renderSuffix(entry, textStack, meta, options) {
        if (meta._didRenderSuffix)
            return;
        if (options.suffix) {
            textStack[0] += options.suffix;
            meta._didRenderSuffix = true;
        }
    }
    // ============ Optional Methods - Default implementations ============
    _renderOptions(entry, textStack, meta, options) {
        // Default: render as entries
        if (entry.entries) {
            for (const e of entry.entries) {
                this._recursiveRender(e, textStack, meta, options);
            }
        }
    }
    _renderTableGroup(entry, textStack, meta, options) {
        if (entry.tables) {
            for (const table of entry.tables) {
                this._renderTable(table, textStack, meta, options);
            }
        }
    }
    _renderInsetReadaloud(entry, textStack, meta, options) {
        // Default: same as inset (both have name and entries properties)
        this._renderInset(entry, textStack, meta, options);
    }
    _renderVariant(entry, textStack, meta, options) {
        // Default: render as entries
        if (entry.entries) {
            this._renderEntries(entry, textStack, meta, options);
        }
    }
    _renderVariantInner(entry, textStack, meta, options) {
        if (entry.entries) {
            for (const e of entry.entries) {
                this._recursiveRender(e, textStack, meta, options);
            }
        }
    }
    _renderVariantSub(entry, textStack, meta, options) {
        if (entry.entries) {
            for (const e of entry.entries) {
                this._recursiveRender(e, textStack, meta, options);
            }
        }
    }
    _renderOptfeature(entry, textStack, meta, options) {
        if (entry.entries) {
            this._renderEntries(entry, textStack, meta, options);
        }
    }
    _renderAbilityDc(entry, textStack, meta, options) {
        // Override in subclass for formatted output
        textStack[0] += `DC = 8 + proficiency bonus + ${(entry.attributes || []).join("/")} modifier`;
    }
    _renderAbilityAttackMod(entry, textStack, meta, options) {
        textStack[0] += `Attack = proficiency bonus + ${(entry.attributes || []).join("/")} modifier`;
    }
    _renderAbilityGeneric(entry, textStack, meta, options) {
        if (entry.text) {
            this._recursiveRender(entry.text, textStack, meta, options);
        }
    }
    _renderInline(entry, textStack, meta, options) {
        if (entry.entries) {
            for (const e of entry.entries) {
                this._recursiveRender(e, textStack, meta, options);
            }
        }
    }
    _renderInlineBlock(entry, textStack, meta, options) {
        this._renderInline(entry, textStack, meta, options);
    }
    _renderBonus(entry, textStack, meta, options) {
        const value = entry.value ?? 0;
        textStack[0] += value >= 0 ? `+${value}` : String(value);
    }
    _renderBonusSpeed(entry, textStack, meta, options) {
        const value = entry.value ?? 0;
        textStack[0] += value >= 0 ? `+${value} ft.` : `${value} ft.`;
    }
    _renderDice(entry, textStack, meta, options) {
        // Override in subclass for interactive dice
        const diceStr = entry.displayText || this._getDiceString(entry);
        textStack[0] += diceStr;
    }
    _getDiceString(entry) {
        if (entry.toRoll) {
            if (typeof entry.toRoll === "string")
                return entry.toRoll;
            // Legacy array format
            return entry.toRoll
                .map((r) => {
                const mod = r.modifier || r.mod || 0;
                const modStr = mod > 0 ? `+${mod}` : mod < 0 ? String(mod) : "";
                return `${r.number || 1}d${r.faces}${modStr}`;
            })
                .join("+");
        }
        return "";
    }
    _renderLink(entry, textStack, meta, options) {
        textStack[0] += entry.text || "";
    }
    _renderItemSub(entry, textStack, meta, options) {
        this._renderItem(entry, textStack, meta, options);
    }
    _renderItemSpell(entry, textStack, meta, options) {
        this._renderItem(entry, textStack, meta, options);
    }
    _renderGallery(entry, textStack, meta, options) {
        if (entry.images) {
            for (const img of entry.images) {
                this._renderImage(img, textStack, meta, options);
            }
        }
    }
    _renderHr(entry, textStack, meta, options) {
        textStack[0] += "\n---\n";
    }
    _renderCode(entry, textStack, meta, options) {
        textStack[0] += "```\n";
        if (entry.preformatted) {
            textStack[0] += entry.preformatted;
        }
        textStack[0] += "\n```\n";
    }
    _renderStatblock(entry, textStack, meta, options) {
        // Override in subclass
    }
    _renderActions(entry, textStack, meta, options) {
        if (entry.entries) {
            this._renderEntries(entry, textStack, meta, options);
        }
    }
    _renderAttack(entry, textStack, meta, options) {
        // Override in subclass for attack formatting
        const types = entry.attackType ? [entry.attackType] : entry.attackTypes || [];
        const typeStr = types.join("/");
        textStack[0] += `${typeStr} Attack: `;
        if (entry.attackEntries) {
            for (const e of entry.attackEntries) {
                this._recursiveRender(e, textStack, meta, options);
            }
        }
    }
    _renderSpellcasting(entry, textStack, meta, options) {
        if (entry.headerEntries) {
            for (const e of entry.headerEntries) {
                this._recursiveRender(e, textStack, meta, options);
            }
        }
        // Handle spell lists, daily/weekly/will spells, etc.
        if (entry.spells) {
            for (const [level, spellData] of Object.entries(entry.spells)) {
                if (spellData.spells) {
                    for (const spell of spellData.spells) {
                        this._recursiveRender(spell, textStack, meta, options);
                    }
                }
            }
        }
    }
    _renderFlowchart(entry, textStack, meta, options) {
        if (entry.blocks) {
            for (const block of entry.blocks) {
                this._renderFlowBlock(block, textStack, meta, options);
            }
        }
    }
    _renderFlowBlock(entry, textStack, meta, options) {
        if (entry.entries) {
            for (const e of entry.entries) {
                this._recursiveRender(e, textStack, meta, options);
            }
        }
    }
    _renderIngredient(entry, textStack, meta, options) {
        if (entry.entry) {
            this._recursiveRender(entry.entry, textStack, meta, options);
        }
    }
    _renderHomebrew(entry, textStack, meta, options) {
        // Render new content, ignore old
        if (entry.entries) {
            for (const e of entry.entries) {
                this._recursiveRender(e, textStack, meta, options);
            }
        }
    }
    // ============ Utility Methods ============
    /**
     * Get entry name/title.
     */
    _getEntryName(entry) {
        return entry.name ?? entry.title;
    }
    /**
     * Process tags in a string.
     * Default implementation strips tags - override for tag rendering.
     */
    _processTags(str, meta, options) {
        return stripTags(str);
    }
}
// ============ Plain Text Renderer ============
/**
 * Simple plain text renderer.
 * Strips all formatting and renders entries as plain text.
 */
export class PlainTextRenderer extends BaseRenderer {
    _renderString(entry, textStack, meta, options) {
        textStack[0] += this._processTags(entry, meta, options);
    }
    _renderEntries(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        const name = this._getEntryName(entry);
        if (name) {
            textStack[0] += `${name}\n`;
        }
        if (entry.entries) {
            const nextMeta = { ...meta, depth: meta.depth + 1 };
            for (const e of entry.entries) {
                this._recursiveRender(e, textStack, nextMeta, options);
                textStack[0] += "\n";
            }
        }
        this._renderSuffix(entry, textStack, meta, options);
    }
    _renderList(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        if (entry.items) {
            for (const item of entry.items) {
                textStack[0] += "- ";
                this._recursiveRender(item, textStack, meta, options);
                textStack[0] += "\n";
            }
        }
        this._renderSuffix(entry, textStack, meta, options);
    }
    _renderTable(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        if (entry.caption) {
            textStack[0] += `${entry.caption}\n`;
        }
        // Column labels
        if (entry.colLabels) {
            textStack[0] += entry.colLabels
                .map(c => (typeof c === "string" ? stripTags(c) : ""))
                .join(" | ");
            textStack[0] += "\n";
        }
        // Rows
        if (entry.rows) {
            for (const row of entry.rows) {
                if (Array.isArray(row)) {
                    textStack[0] += row
                        .map(cell => {
                        if (typeof cell === "string")
                            return stripTags(cell);
                        if (typeof cell === "object" && cell !== null) {
                            const cellObj = cell;
                            if (cellObj.entry)
                                return this.render(cellObj.entry);
                            if (cellObj.roll?.exact != null)
                                return String(cellObj.roll.exact);
                            if (cellObj.roll?.min != null)
                                return `${cellObj.roll.min}-${cellObj.roll.max}`;
                        }
                        return String(cell);
                    })
                        .join(" | ");
                    textStack[0] += "\n";
                }
            }
        }
        this._renderSuffix(entry, textStack, meta, options);
    }
    _renderQuote(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        if (entry.entries) {
            for (const e of entry.entries) {
                textStack[0] += '"';
                this._recursiveRender(e, textStack, meta, options);
                textStack[0] += '"\n';
            }
        }
        if (entry.by) {
            textStack[0] += `\u2014 ${entry.by}`;
            if (entry.from) {
                textStack[0] += `, ${entry.from}`;
            }
            textStack[0] += "\n";
        }
        this._renderSuffix(entry, textStack, meta, options);
    }
    _renderInset(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        const name = this._getEntryName(entry);
        if (name) {
            textStack[0] += `[${name}]\n`;
        }
        if (entry.entries) {
            for (const e of entry.entries) {
                this._recursiveRender(e, textStack, meta, options);
                textStack[0] += "\n";
            }
        }
        this._renderSuffix(entry, textStack, meta, options);
    }
    _renderItem(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        const name = this._getEntryName(entry);
        if (name) {
            textStack[0] += `${name}. `;
        }
        if (entry.entry) {
            this._recursiveRender(entry.entry, textStack, meta, options);
        }
        if (entry.entries) {
            for (const e of entry.entries) {
                this._recursiveRender(e, textStack, meta, options);
            }
        }
        this._renderSuffix(entry, textStack, meta, options);
    }
    _renderImage(entry, textStack, meta, options) {
        this._renderPrefix(entry, textStack, meta, options);
        if (entry.title) {
            textStack[0] += `[Image: ${entry.title}]\n`;
        }
        else {
            textStack[0] += "[Image]\n";
        }
        this._renderSuffix(entry, textStack, meta, options);
    }
}
// ============ Factory Functions ============
/**
 * Create a plain text renderer.
 */
export const createPlainTextRenderer = (config = {}) => {
    return new PlainTextRenderer(config);
};
/**
 * Get a shared plain text renderer instance.
 */
let _sharedPlainTextRenderer = null;
export const getPlainTextRenderer = () => {
    if (!_sharedPlainTextRenderer) {
        _sharedPlainTextRenderer = new PlainTextRenderer();
    }
    return _sharedPlainTextRenderer;
};
//# sourceMappingURL=base.js.map