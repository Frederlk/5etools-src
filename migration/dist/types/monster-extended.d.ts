import type { Monster } from "../../../types/bestiary/bestiary.js";
export interface MonsterResource {
    name: string;
    value?: number;
    formula?: string;
}
export interface MonsterSkillOther {
    oneOf: Record<string, string>;
}
export interface MonsterExtended extends Monster {
    _displayName?: string;
    resource?: MonsterResource[];
    tool?: Record<string, string>;
    gear?: string[];
}
export interface MonsterSaveWithSpecial {
    str?: string;
    dex?: string;
    con?: string;
    int?: string;
    wis?: string;
    cha?: string;
    special?: string;
}
export interface MonsterSkillWithOther {
    [key: string]: string | MonsterSkillOther[] | undefined;
    other?: MonsterSkillOther[];
    special?: string;
}
//# sourceMappingURL=monster-extended.d.ts.map