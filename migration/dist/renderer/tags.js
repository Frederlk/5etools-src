// Tag Processing Utilities - TypeScript implementation
// Migrated from js/render.js tag handling functions
// ============ Constants ============
const SPLIT_BY_TAG_LEADING_CHARS = new Set(["@", "="]);
// ============ Core Tag Functions ============
/**
 * Split a string at the first space character.
 * Used to separate tag name from tag content.
 * @param str - String to split
 * @returns Tuple of [before-space, after-space] or [str, ""] if no space
 */
export const splitFirstSpace = (str) => {
    const firstIndex = str.indexOf(" ");
    if (firstIndex === -1)
        return [str, ""];
    return [str.substring(0, firstIndex), str.substring(firstIndex + 1)];
};
/**
 * Split a string into segments by tags.
 * Tags are delimited by {@...} or {=...} patterns.
 * Handles nested tags correctly.
 *
 * @example
 * splitByTags("Hello {@bold world}!")
 * // Returns: ["Hello ", "{@bold world}", "!"]
 *
 * @param str - String containing potential tags
 * @returns Array of string segments (plain text and tag segments)
 */
export const splitByTags = (str) => {
    if (!str)
        return [];
    let tagDepth = 0;
    const out = [];
    let curStr = "";
    const pushOutput = () => {
        if (!curStr)
            return;
        out.push(curStr);
    };
    const len = str.length;
    for (let i = 0; i < len; ++i) {
        const char = str[i];
        const char2 = str[i + 1];
        switch (char) {
            case "{":
                if (!SPLIT_BY_TAG_LEADING_CHARS.has(char2)) {
                    curStr += "{";
                    break;
                }
                if (tagDepth++ > 0) {
                    curStr += "{";
                }
                else {
                    pushOutput();
                    curStr = `{${char2}`;
                    ++i;
                }
                break;
            case "}":
                curStr += "}";
                if (tagDepth !== 0 && --tagDepth === 0) {
                    pushOutput();
                    curStr = "";
                }
                break;
            case "@":
            case "=":
                curStr += char;
                break;
            default:
                curStr += char;
                break;
        }
    }
    pushOutput();
    return out;
};
/**
 * Create a pipe-splitter function for a specific leading character.
 * Handles nested tags correctly when splitting.
 *
 * @param leadingCharacter - The character that starts tags (e.g., "@")
 * @returns Function that splits a string by pipe, respecting nested tags
 */
export const createPipeSplitter = (leadingCharacter) => {
    return (str) => {
        if (!str)
            return [];
        let tagDepth = 0;
        const out = [];
        let curStr = "";
        const len = str.length;
        for (let i = 0; i < len; ++i) {
            const char0 = str[i - 1];
            const char = str[i];
            const char2 = str[i + 1];
            switch (char) {
                case "{":
                    if (char2 === leadingCharacter)
                        tagDepth++;
                    curStr += "{";
                    break;
                case "}":
                    if (tagDepth)
                        tagDepth--;
                    curStr += "}";
                    break;
                case "|":
                    // Handle escaped pipes
                    if (char0 === "\\") {
                        curStr += char;
                        break;
                    }
                    if (tagDepth) {
                        curStr += "|";
                    }
                    else {
                        out.push(curStr);
                        curStr = "";
                    }
                    break;
                default:
                    curStr += char;
                    break;
            }
        }
        if (curStr)
            out.push(curStr);
        return out;
    };
};
/**
 * Split tag content by pipe delimiter.
 * Respects nested {@...} tags when splitting.
 */
export const splitTagByPipe = createPipeSplitter("@");
/**
 * Split equality content by pipe delimiter.
 * Respects nested {=...} tags when splitting.
 */
export const splitEqualityByPipe = createPipeSplitter("=");
/**
 * Default tag info for unknown tags.
 * Returns the first pipe-delimited segment as the stripped text.
 */
export const defaultTagInfo = {
    getStripped: (_tag, text) => splitTagByPipe(text)[0] || "",
};
// ============ Common Tags ============
/**
 * Create a simple tag info that returns the first segment.
 */
export const createSimpleTagInfo = () => ({
    getStripped: (_tag, text) => splitTagByPipe(text)[0] || "",
});
/**
 * Create a tag info for dice-like tags.
 * Returns display text if provided, otherwise the first segment.
 */
export const createDiceTagInfo = () => ({
    getStripped: (_tag, text) => {
        const parts = splitTagByPipe(text);
        return parts[1] || parts[0] || "";
    },
});
/**
 * Built-in tag definitions for common 5etools tags.
 * These can be extended or overridden.
 */
export const builtInTags = {
    // Simple tags - return first segment
    "@bold": createSimpleTagInfo(),
    "@b": createSimpleTagInfo(),
    "@italic": createSimpleTagInfo(),
    "@i": createSimpleTagInfo(),
    "@s": createSimpleTagInfo(),
    "@strike": createSimpleTagInfo(),
    "@u": createSimpleTagInfo(),
    "@underline": createSimpleTagInfo(),
    "@sup": createSimpleTagInfo(),
    "@sub": createSimpleTagInfo(),
    "@kbd": createSimpleTagInfo(),
    "@code": createSimpleTagInfo(),
    "@style": createSimpleTagInfo(),
    "@font": createSimpleTagInfo(),
    "@note": createSimpleTagInfo(),
    "@tip": createSimpleTagInfo(),
    "@unit": createSimpleTagInfo(),
    "@h": { getStripped: () => "" },
    "@color": createSimpleTagInfo(),
    "@highlight": createSimpleTagInfo(),
    "@help": createSimpleTagInfo(),
    // Entity reference tags - return display text or entity name
    "@spell": createSimpleTagInfo(),
    "@item": createSimpleTagInfo(),
    "@class": createSimpleTagInfo(),
    "@creature": createSimpleTagInfo(),
    "@condition": createSimpleTagInfo(),
    "@disease": createSimpleTagInfo(),
    "@status": createSimpleTagInfo(),
    "@background": createSimpleTagInfo(),
    "@race": createSimpleTagInfo(),
    "@optfeature": createSimpleTagInfo(),
    "@feat": createSimpleTagInfo(),
    "@reward": createSimpleTagInfo(),
    "@psionic": createSimpleTagInfo(),
    "@object": createSimpleTagInfo(),
    "@boon": createSimpleTagInfo(),
    "@cult": createSimpleTagInfo(),
    "@trap": createSimpleTagInfo(),
    "@hazard": createSimpleTagInfo(),
    "@deity": createSimpleTagInfo(),
    "@variantrule": createSimpleTagInfo(),
    "@vehicle": createSimpleTagInfo(),
    "@vehupgrade": createSimpleTagInfo(),
    "@action": createSimpleTagInfo(),
    "@language": createSimpleTagInfo(),
    "@charoption": createSimpleTagInfo(),
    "@recipe": createSimpleTagInfo(),
    "@classFeature": createSimpleTagInfo(),
    "@subclassFeature": createSimpleTagInfo(),
    "@sense": createSimpleTagInfo(),
    "@skill": createSimpleTagInfo(),
    "@itemEntry": createSimpleTagInfo(),
    "@card": createSimpleTagInfo(),
    "@deck": createSimpleTagInfo(),
    "@table": createSimpleTagInfo(),
    "@tableGroup": createSimpleTagInfo(),
    "@facility": createSimpleTagInfo(),
    // Dice tags - second segment is display text
    "@dice": createDiceTagInfo(),
    "@damage": createDiceTagInfo(),
    "@d20": createDiceTagInfo(),
    "@hit": createDiceTagInfo(),
    "@recharge": {
        getStripped: (_tag, text) => {
            const [num] = splitTagByPipe(text);
            if (num === "0")
                return "(Recharge)";
            return `(Recharge ${num || 6})`;
        },
    },
    "@chance": {
        getStripped: (_tag, text) => {
            const [pct, displayText] = splitTagByPipe(text);
            return displayText ?? `${pct} percent`;
        },
    },
    "@ability": {
        getStripped: (_tag, text) => {
            const [abilAndScore, displayText] = splitTagByPipe(text);
            if (displayText)
                return displayText;
            // Format: "str 20" -> "Strength 20 (+5)"
            return abilAndScore;
        },
    },
    "@savingThrow": {
        getStripped: (_tag, text) => {
            const [dc, displayText] = splitTagByPipe(text);
            return displayText ?? `DC ${dc}`;
        },
    },
    "@skillCheck": {
        getStripped: (_tag, text) => {
            const [skillAndDc, displayText] = splitTagByPipe(text);
            return displayText ?? skillAndDc;
        },
    },
    // Ordinal/amount tags
    "@scaledice": {
        getStripped: (_tag, text) => {
            const parts = splitTagByPipe(text);
            return parts[4] || parts[0] || "";
        },
    },
    "@scaledamage": {
        getStripped: (_tag, text) => {
            const parts = splitTagByPipe(text);
            return parts[4] || parts[0] || "";
        },
    },
    // Special formatting
    "@dc": {
        getStripped: (_tag, text) => {
            const [dcText, displayText] = splitTagByPipe(text);
            return displayText ?? `DC ${dcText}`;
        },
    },
    "@coinflip": {
        getStripped: (_tag, text) => {
            const [displayText] = splitTagByPipe(text);
            return displayText ?? "flip a coin";
        },
    },
    // Adventure/book references
    "@adventure": createSimpleTagInfo(),
    "@book": createSimpleTagInfo(),
    "@area": {
        getStripped: (_tag, text) => {
            const [, areaId] = splitTagByPipe(text);
            return areaId ?? "";
        },
    },
    // Link tags
    "@link": {
        getStripped: (_tag, text) => {
            const [displayText] = splitTagByPipe(text);
            return displayText ?? "";
        },
    },
    "@5etools": {
        getStripped: (_tag, text) => {
            const [displayText] = splitTagByPipe(text);
            return displayText ?? "";
        },
    },
    "@loader": {
        getStripped: (_tag, text) => {
            const [name] = splitTagByPipe(text);
            return name ?? "";
        },
    },
    // Filter tags
    "@filter": {
        getStripped: (_tag, text) => {
            const [displayText] = splitTagByPipe(text);
            return displayText ?? "";
        },
    },
    // Homebrew change markers
    "@homebrew": {
        getStripped: (_tag, text) => {
            const [newText] = splitTagByPipe(text);
            return newText ?? "";
        },
    },
    // Quick reference
    "@quickref": {
        getStripped: (_tag, text) => {
            const [displayText] = splitTagByPipe(text);
            return displayText ?? "";
        },
    },
    // Footnote
    "@footnote": {
        getStripped: (_tag, text) => {
            const [displayText] = splitTagByPipe(text);
            return displayText ?? "";
        },
    },
    // Comic link
    "@comic": createSimpleTagInfo(),
    "@comicH": createSimpleTagInfo(),
};
/**
 * Strip 5etools tags from a string, leaving plain text.
 *
 * @example
 * stripTags("You can cast {@spell fireball} at will.")
 * // Returns: "You can cast fireball at will."
 *
 * @param str - String containing tags to strip
 * @param options - Stripping options
 * @returns Plain text with tags removed
 */
export const stripTags = (str, options = {}) => {
    if (!str)
        return str;
    const { allowlistTags = null, blocklistTags = null, tagLookup = builtInTags } = options;
    const accum = { value: "" };
    stripTagsRecursive(str, accum, allowlistTags, blocklistTags, tagLookup);
    return accum.value;
};
/**
 * Internal recursive tag stripping function.
 */
const stripTagsRecursive = (str, accum, allowlistTags, blocklistTags, tagLookup) => {
    const tagSplit = splitByTags(str);
    for (const s of tagSplit) {
        if (!s)
            continue;
        // Not a tag - just add to output
        if (!s.startsWith("{@")) {
            accum.value += s;
            continue;
        }
        // Parse tag: {@tagName content}
        const [tag, text] = splitFirstSpace(s.slice(1, -1));
        // Check allowlist/blocklist
        if ((allowlistTags != null && allowlistTags.has(tag)) ||
            (blocklistTags != null && !blocklistTags.has(tag))) {
            accum.value += s;
            continue;
        }
        // Get tag handler
        const tagInfo = tagLookup[tag] ?? defaultTagInfo;
        const stripped = tagInfo.getStripped(tag, text);
        // Recursively process the stripped content (may contain nested tags)
        stripTagsRecursive(stripped, accum, allowlistTags, blocklistTags, tagLookup);
    }
};
// ============ Tag Detection ============
/**
 * Check if a string contains any 5etools tags.
 * @param str - String to check
 * @returns True if the string contains tags
 */
export const hasTags = (str) => {
    if (!str)
        return false;
    return /{[@=][^}]+}/.test(str);
};
/**
 * Check if a string is a complete tag.
 * @param str - String to check
 * @returns True if the string is a tag
 */
export const isTag = (str) => {
    if (!str)
        return false;
    return /^{[@=][^}]+}$/.test(str);
};
/**
 * Extract the tag name from a tag string.
 * @param tag - Tag string like "{@spell fireball|phb}"
 * @returns Tag name like "@spell" or null if not a tag
 */
export const getTagName = (tag) => {
    if (!isTag(tag))
        return null;
    const [name] = splitFirstSpace(tag.slice(1, -1));
    return name;
};
/**
 * Extract the tag content from a tag string.
 * @param tag - Tag string like "{@spell fireball|phb}"
 * @returns Tag content like "fireball|phb" or null if not a tag
 */
export const getTagContent = (tag) => {
    if (!isTag(tag))
        return null;
    const [, content] = splitFirstSpace(tag.slice(1, -1));
    return content;
};
/**
 * Parse a tag string into its components.
 * @param tagStr - Tag string like "{@spell fireball|phb|My Fireball}"
 * @returns Parsed tag object or null if invalid
 */
export const parseTag = (tagStr) => {
    if (!isTag(tagStr))
        return null;
    const inner = tagStr.slice(1, -1); // Remove { and }
    const [tag, text] = splitFirstSpace(inner);
    const parts = splitTagByPipe(text);
    return {
        raw: tagStr,
        tag,
        name: parts[0] || "",
        source: parts[1],
        displayText: parts[2],
        parts,
    };
};
// ============ Tag Building ============
/**
 * Build a tag string from components.
 * @param tag - Tag name (e.g., "@spell" or "spell")
 * @param name - Entity name
 * @param source - Optional source
 * @param displayText - Optional display text
 * @returns Tag string like "{@spell fireball|phb}"
 */
export const buildTag = (tag, name, source, displayText) => {
    const tagName = tag.startsWith("@") ? tag : `@${tag}`;
    const parts = [name];
    if (source)
        parts.push(source);
    if (displayText) {
        if (!source)
            parts.push(""); // Ensure source slot exists
        parts.push(displayText);
    }
    return `{${tagName} ${parts.join("|")}}`;
};
//# sourceMappingURL=tags.js.map