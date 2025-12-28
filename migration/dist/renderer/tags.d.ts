/**
 * Split a string at the first space character.
 * Used to separate tag name from tag content.
 * @param str - String to split
 * @returns Tuple of [before-space, after-space] or [str, ""] if no space
 */
export declare const splitFirstSpace: (str: string) => [string, string];
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
export declare const splitByTags: (str: string) => string[];
/**
 * Create a pipe-splitter function for a specific leading character.
 * Handles nested tags correctly when splitting.
 *
 * @param leadingCharacter - The character that starts tags (e.g., "@")
 * @returns Function that splits a string by pipe, respecting nested tags
 */
export declare const createPipeSplitter: (leadingCharacter: string) => ((str: string) => string[]);
/**
 * Split tag content by pipe delimiter.
 * Respects nested {@...} tags when splitting.
 */
export declare const splitTagByPipe: (str: string) => string[];
/**
 * Split equality content by pipe delimiter.
 * Respects nested {=...} tags when splitting.
 */
export declare const splitEqualityByPipe: (str: string) => string[];
/**
 * Information about a stripped tag.
 */
export interface TagInfo {
    /** Get the stripped (plain text) version of a tag */
    getStripped: (tag: string, text: string) => string;
}
/**
 * Default tag info for unknown tags.
 * Returns the first pipe-delimited segment as the stripped text.
 */
export declare const defaultTagInfo: TagInfo;
/**
 * Tag lookup registry type.
 */
export type TagLookup = Record<string, TagInfo>;
/**
 * Create a simple tag info that returns the first segment.
 */
export declare const createSimpleTagInfo: () => TagInfo;
/**
 * Create a tag info for dice-like tags.
 * Returns display text if provided, otherwise the first segment.
 */
export declare const createDiceTagInfo: () => TagInfo;
/**
 * Built-in tag definitions for common 5etools tags.
 * These can be extended or overridden.
 */
export declare const builtInTags: TagLookup;
export interface StripTagsOptions {
    /** Tags to keep (whitelist) */
    allowlistTags?: Set<string> | null;
    /** Tags to remove (blacklist) */
    blocklistTags?: Set<string> | null;
    /** Custom tag lookup registry */
    tagLookup?: TagLookup;
}
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
export declare const stripTags: (str: string, options?: StripTagsOptions) => string;
/**
 * Check if a string contains any 5etools tags.
 * @param str - String to check
 * @returns True if the string contains tags
 */
export declare const hasTags: (str: string) => boolean;
/**
 * Check if a string is a complete tag.
 * @param str - String to check
 * @returns True if the string is a tag
 */
export declare const isTag: (str: string) => boolean;
/**
 * Extract the tag name from a tag string.
 * @param tag - Tag string like "{@spell fireball|phb}"
 * @returns Tag name like "@spell" or null if not a tag
 */
export declare const getTagName: (tag: string) => string | null;
/**
 * Extract the tag content from a tag string.
 * @param tag - Tag string like "{@spell fireball|phb}"
 * @returns Tag content like "fireball|phb" or null if not a tag
 */
export declare const getTagContent: (tag: string) => string | null;
export interface ParsedTag {
    /** Full tag string */
    raw: string;
    /** Tag name (e.g., "@spell") */
    tag: string;
    /** First segment (usually entity name) */
    name: string;
    /** Source book/document (optional) */
    source?: string;
    /** Display text override (optional) */
    displayText?: string;
    /** All pipe-separated segments */
    parts: string[];
}
/**
 * Parse a tag string into its components.
 * @param tagStr - Tag string like "{@spell fireball|phb|My Fireball}"
 * @returns Parsed tag object or null if invalid
 */
export declare const parseTag: (tagStr: string) => ParsedTag | null;
/**
 * Build a tag string from components.
 * @param tag - Tag name (e.g., "@spell" or "spell")
 * @param name - Entity name
 * @param source - Optional source
 * @param displayText - Optional display text
 * @returns Tag string like "{@spell fireball|phb}"
 */
export declare const buildTag: (tag: string, name: string, source?: string, displayText?: string) => string;
//# sourceMappingURL=tags.d.ts.map