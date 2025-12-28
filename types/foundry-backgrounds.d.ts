export interface FoundryBackgroundsJson {
  /**
   * @minItems 1
   */
  backgroundFeature?: [
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
      backgroundName: string;
      backgroundSource: string;
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
      backgroundName: string;
      backgroundSource: string;
    }[]
  ];
}
