import type { StyleHint } from "./types.js";
export interface Monster {
    name: string;
    shortName?: string | boolean;
    isNamedCreature?: boolean;
    _displayName?: string;
    _displayShortName?: string;
    legendary?: Entry[];
    legendaryHeader?: Entry[];
    legendaryActions?: number;
    legendaryActionsLair?: number;
    mythic?: Entry[];
    trait?: Entry[];
    action?: Entry[];
    bonus?: Entry[];
    reaction?: Entry[];
    variant?: Entry[];
    spellcasting?: SpellcastingEntry[];
    hp?: HpEntry;
    cr?: string | CrObject;
    pbNote?: string;
    passive?: number;
    wis?: number | SpecialAbilityScore;
    dex?: number | SpecialAbilityScore;
    str?: number | SpecialAbilityScore;
    con?: number | SpecialAbilityScore;
    int?: number | SpecialAbilityScore;
    cha?: number | SpecialAbilityScore;
    save?: Record<string, string>;
    skill?: MonsterSkills;
    tool?: Record<string, number>;
    senses?: string;
    languages?: string | string[];
    type?: string | MonsterTypeObject;
    size?: string | string[];
    sizeNote?: string;
    alignment?: (string | AlignmentObject)[];
    alignmentPrefix?: string;
    level?: number;
    initiative?: number | InitiativeObject;
    immune?: ImmResValue[];
    conditionImmune?: CondImmValue[];
    gear?: (string | GearEntry)[];
    attachedItems?: (string | GearEntry)[];
    source?: string;
    dragonCastingColor?: string;
}
export interface Entry {
    type?: string;
    name?: string;
    entries?: Entry[] | string[];
    rendered?: string;
    sort?: number;
}
export interface SpellcastingEntry {
    name: string;
    type?: string;
    displayAs?: string;
    headerEntries?: Entry[];
}
export interface HpEntry {
    average?: number;
    formula?: string;
    special?: string;
}
export interface CrObject {
    cr?: string;
    xp?: number;
    lair?: string;
    xpLair?: number;
    coven?: string;
    xpCoven?: number;
}
export interface InitiativeObject {
    initiative?: number;
    proficiency?: number;
    advantageMode?: "adv" | "dis";
}
export interface SpecialAbilityScore {
    special: string;
}
export interface MonsterSkillOther {
    oneOf?: Record<string, string>;
}
export interface MonsterSkills {
    [key: string]: string | MonsterSkillOther[] | undefined;
    other?: MonsterSkillOther[];
    special?: string;
}
export interface MonsterTypeObject {
    type: string | {
        choose: string[];
    };
    swarmSize?: string;
    tags?: (string | {
        tag: string;
        prefix: string;
    })[];
    note?: string;
    sidekickType?: string;
    sidekickTags?: (string | {
        tag: string;
        prefix: string;
    })[];
    sidekickHidden?: boolean;
}
export interface AlignmentObject {
    alignment?: string[];
    special?: string;
    chance?: number;
    note?: string;
}
export interface ImmResValue {
    immune?: string[];
    resist?: string[];
    vulnerable?: string[];
    preNote?: string;
    note?: string;
    special?: string;
}
export interface CondImmValue {
    conditionImmune?: string[];
    preNote?: string;
    note?: string;
    special?: string;
}
export interface GearEntry {
    item?: string;
    quantity?: number;
}
export interface ResourceEntry {
    name?: string;
    value: number;
    formula?: string;
}
export interface LegendaryGroup {
    lairActions?: Entry[];
    regionalEffects?: Entry[];
    mythicEncounter?: Entry[];
}
export interface ShortNameOptions {
    isTitleCase?: boolean;
    isSentenceCase?: boolean;
    isUseDisplayName?: boolean;
}
export interface LegendaryActionIntroOptions {
    renderer?: RenderFn;
    isUseDisplayName?: boolean;
    styleHint?: StyleHint | null;
}
export interface HpRenderOptions {
    isPlainText?: boolean;
}
export interface CrRenderOptions {
    styleHint?: StyleHint | null;
    isPlainText?: boolean;
}
export interface SensesOptions {
    isTitleCase?: boolean;
    isForcePassive?: boolean;
}
export interface LanguagesOptions {
    styleHint?: StyleHint | null;
}
export interface ToolsOptions {
    styleHint?: StyleHint | null;
}
export interface SubEntriesOptions {
    renderer?: RenderFn;
    fnGetSpellTraits?: (mon: Monster, opts: {
        displayAsProp: string;
    }) => TraitEntry[];
}
export interface TraitEntry {
    name: string;
    entries?: Entry[];
    rendered?: string;
    type?: string;
}
export type RenderFn = (entry: string | Entry | Entry[]) => string;
export declare const CHILD_PROPS: readonly ["action", "bonus", "reaction", "trait", "legendary", "mythic", "variant", "spellcasting"];
export declare const CHILD_PROPS__SPELLCASTING_DISPLAY_AS: readonly ["trait", "action", "bonus", "reaction", "legendary", "mythic"];
export declare const getShortName: (mon: Monster, { isTitleCase, isSentenceCase, isUseDisplayName }?: ShortNameOptions) => string;
export declare const getShortNameFromName: (name: string, { isNamedCreature }?: {
    isNamedCreature?: boolean;
}) => string;
export declare const getPronounSubject: (mon: Monster) => string;
export declare const getPronounObject: (mon: Monster) => string;
export declare const getPronounPossessive: (mon: Monster) => string;
export declare const getLegendaryActionIntro: (mon: Monster, { renderer, isUseDisplayName, styleHint }?: LegendaryActionIntroOptions) => string;
export declare const getLegendaryActionIntroEntry: (mon: Monster, { isUseDisplayName, styleHint }?: {
    isUseDisplayName?: boolean;
    styleHint?: StyleHint | null;
}) => Entry;
export declare const getSectionIntro: (mon: Monster, { renderer, prop }: {
    renderer?: RenderFn;
    prop: string;
}) => string;
export declare const getSave: (renderer: RenderFn, attr: string, mod: string) => string;
export declare const getRenderedHp: (hp: HpEntry, { isPlainText }?: HpRenderOptions) => string;
export declare const getRenderedResource: (res: ResourceEntry, isPlainText?: boolean) => string;
export declare const getSafeAbilityScore: (mon: Monster | null | undefined, abil: string | null, { defaultScore }?: {
    defaultScore?: number;
}) => number;
export declare const getSpellcastingRenderedTraits: (renderer: RenderFn, mon: Monster, { displayAsProp }?: {
    displayAsProp?: string;
}) => TraitEntry[];
export declare const getOrderedTraits: (mon: Monster, { fnGetSpellTraits }?: {
    fnGetSpellTraits?: (mon: Monster, opts: {
        displayAsProp: string;
    }) => TraitEntry[];
}) => TraitEntry[] | null;
export declare const getOrderedActions: (mon: Monster, { fnGetSpellTraits }?: {
    fnGetSpellTraits?: (mon: Monster, opts: {
        displayAsProp: string;
    }) => TraitEntry[];
}) => TraitEntry[] | null;
export declare const getOrderedBonusActions: (mon: Monster, { fnGetSpellTraits }?: {
    fnGetSpellTraits?: (mon: Monster, opts: {
        displayAsProp: string;
    }) => TraitEntry[];
}) => TraitEntry[] | null;
export declare const getOrderedReactions: (mon: Monster, { fnGetSpellTraits }?: {
    fnGetSpellTraits?: (mon: Monster, opts: {
        displayAsProp: string;
    }) => TraitEntry[];
}) => TraitEntry[] | null;
export declare const getOrderedLegendaryActions: (mon: Monster, { fnGetSpellTraits }?: {
    fnGetSpellTraits?: (mon: Monster, opts: {
        displayAsProp: string;
    }) => TraitEntry[];
}) => TraitEntry[] | null;
export declare const getOrderedMythicActions: (mon: Monster, { fnGetSpellTraits }?: {
    fnGetSpellTraits?: (mon: Monster, opts: {
        displayAsProp: string;
    }) => TraitEntry[];
}) => TraitEntry[] | null;
export interface SubEntriesResult {
    entsTrait: TraitEntry[] | null;
    entsAction: TraitEntry[] | null;
    entsBonusAction: TraitEntry[] | null;
    entsReaction: TraitEntry[] | null;
    entsLegendaryAction: TraitEntry[] | null;
    entsMythicAction: TraitEntry[] | null;
    legGroup: LegendaryGroup | null;
}
export declare const getSubEntries: (mon: Monster, { renderer, fnGetSpellTraits }?: SubEntriesOptions) => SubEntriesResult;
export declare const getTypeAlignmentPart: (mon: Monster) => string;
export declare const getInitiativeBonusNumber: ({ mon }: {
    mon: Monster;
}) => number | null;
export declare const getInitiativePart: (mon: Monster, { isPlainText, renderer }?: {
    isPlainText?: boolean;
    renderer?: RenderFn;
}) => string;
export declare const getSavesPart: (mon: Monster) => string;
export declare const getSensesPart: (mon: Monster, { isTitleCase, isForcePassive }?: SensesOptions) => string;
export declare const getPbPart: (mon: Monster, { isPlainText }?: {
    isPlainText?: boolean;
}) => string;
export declare const getChallengeRatingPart: (mon: Monster, { styleHint, isPlainText }?: CrRenderOptions) => string;
export declare const getImmunitiesCombinedPart: (mon: Monster, { isPlainText }?: {
    isPlainText?: boolean;
}) => string;
export declare const getGearPart: (mon: Monster, { renderer }?: {
    renderer?: RenderFn;
}) => string;
export declare const getSkillsString: (renderer: RenderFn, mon: Monster) => string;
export declare const getToolsString: (renderer: RenderFn, mon: Monster, { styleHint }?: ToolsOptions) => string;
export declare const getRenderedLanguages: (languages: string | string[] | null | undefined, { styleHint }?: LanguagesOptions) => string;
export declare const hasLegendaryActions: (mon: Monster) => boolean;
export declare const hasMythicActions: (mon: Monster) => boolean;
export declare const hasReactions: (mon: Monster) => boolean;
export declare const hasBonusActions: (mon: Monster) => boolean;
//# sourceMappingURL=monster.d.ts.map