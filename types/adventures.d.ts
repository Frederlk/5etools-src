export interface Adventures {
    adventure?: Adventure[];
}

export interface Adventure {
    alias?:   string[];
    author?:  string;
    contents: CorpusShared[];
    cover?:   Cover;
    /**
     * The group under which this adventure should be listed in the navbar.
     */
    group: Group;
    id:    string;
    /**
     * The character levels that the adventure ranges across.
     */
    level:         Level;
    name:          string;
    parentSource?: string;
    published:     Date;
    /**
     * A sorting order for adventures within a single source.
     */
    publishedOrder?: number;
    source:          string;
    storyline:       Storyline;
}

/**
 * The linked Table of Contents of the corpus.
 */
export interface CorpusShared {
    headers?: Array<HeaderObject | string>;
    name:     string;
    ordinal?: Ordinal;
}

export interface HeaderObject {
    depth?: number;
    header: string;
    /**
     * The relative index of this header in the current chapter, i.e. if "Treasure" appears
     * twice and you wish the contents entry to link to the second instance, set the "index" to
     * 1.
     */
    index?: number;
    [property: string]: any;
}

export interface Ordinal {
    identifier?: number | string;
    type:        OrdinalType;
}

export type OrdinalType = "chapter" | "appendix" | "part" | "episode" | "level" | "section";

/**
 * A link to an image. Preferred sizes are 300 x 300px or 600 x 600px.
 */
export interface Cover {
    path?: string;
    type?: CoverType;
    /**
     * Restrict the usage of:
     *
     * - Site URLs -- these should be `"internal"` URLs instead
     * - Imgur links -- these are not accessible in the UK
     * https://help.imgur.com/hc/en-us/articles/41592665292443-Imgur-access-in-the-United-Kingdom
     */
    url?: string;
}

export type CoverType = "internal" | "external";

/**
 * The group under which this adventure should be listed in the navbar.
 */
export type Group = "supplement" | "supplement-alt" | "prerelease" | "homebrew" | "organized-play" | "other";

/**
 * The character levels that the adventure ranges across.
 */
export interface Level {
    end?:    number;
    start?:  number;
    custom?: string;
}

export type Storyline = "Starter Set" | "Tyranny of Dragons" | "Elemental Evil" | "Rage of Demons" | "Ravenloft" | "Storm King's Thunder" | "Tales from the Yawning Portal" | "Tomb of Annihilation" | "Waterdeep" | "Ravnica" | "Extra Life" | "Ghosts of Saltmarsh" | "Acquisitions Incorporated" | "Essentials Kit" | "Stranger Things" | "Baldur's Gate" | "Eberron" | "Rick and Morty" | "Wildemount" | "Icewind Dale" | "Mythic Odysseys of Theros" | "Candlekeep Mysteries" | "Adventures in the Forgotten Realms" | "The Wild Beyond the Witchlight" | "Ixalan" | "NERDS Restoring Harmony" | "Strixhaven" | "Critical Role" | "Journeys through the Radiant Citadel" | "Spelljammer" | "Dragonlance" | "Keys from the Golden Vault" | "Giants of the Star Forge" | "Minecraft" | "Planescape" | "Adventure Atlas" | "Heroes' Feast" | "Family Friendly" | "Vecna" | "Quests from the Infinite Staircase" | "LEGO" | "Shadow Realm" | "Animated Series" | "Dragon Delves" | "Forgotten Realms" | "Miscellaneous";
