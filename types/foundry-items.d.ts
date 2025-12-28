export interface FoundryItemsJson {
  magicvariant: FoundrySideDataGenericArray;
  /**
   * @minItems 1
   */
  item: [
    {
      name: string;
      source: string;
      identifier?: string;
      system?: FoundrySystemObject;
      activities?: (
        | _FoundryActivityObjectAttack
        | _FoundryActivityObjectDamage
        | _FoundryActivityObjectSave
        | _FoundryActivityObjectCheck
        | _FoundryActivityObjectHeal
        | _FoundryActivityObjectCast
        | _FoundryActivityObjectSummon
        | _FoundryActivityObjectEnchant
        | _FoundryActivityObjectTransform
        | _FoundryActivityObjectUtility
      )[];
      effects?: (
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            type: "enchantment";
            [k: string]: unknown;
          })
      )[];
      flags?: FoundryFlagsObject;
      advice?: Entry;
      img?: string;
      advancement?: FoundryAdvancementsArray;
      migrationVersion?: number;
      _merge?: FoundryMergeObject;
      type?: "weapon" | "tool" | "consumable" | "equipment" | "container" | "loot";
      subEntities?: FoundrySubEntitiesObject;
    },
    ...{
      name: string;
      source: string;
      identifier?: string;
      system?: FoundrySystemObject;
      activities?: (
        | _FoundryActivityObjectAttack
        | _FoundryActivityObjectDamage
        | _FoundryActivityObjectSave
        | _FoundryActivityObjectCheck
        | _FoundryActivityObjectHeal
        | _FoundryActivityObjectCast
        | _FoundryActivityObjectSummon
        | _FoundryActivityObjectEnchant
        | _FoundryActivityObjectTransform
        | _FoundryActivityObjectUtility
      )[];
      effects?: (
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            [k: string]: unknown;
          })
        | (_FoundryEffectObject & {
            type: "enchantment";
            [k: string]: unknown;
          })
      )[];
      flags?: FoundryFlagsObject;
      advice?: Entry;
      img?: string;
      advancement?: FoundryAdvancementsArray;
      migrationVersion?: number;
      _merge?: FoundryMergeObject;
      type?: "weapon" | "tool" | "consumable" | "equipment" | "container" | "loot";
      subEntities?: FoundrySubEntitiesObject;
    }[]
  ];
}
