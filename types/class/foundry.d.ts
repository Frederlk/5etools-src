export interface FoundryClassJson {
  /**
   * @minItems 1
   */
  class: [
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
      entries?: Entry[];
      entryData?: EntryDataObject;
      chooseSystem?: FoundrySystemObject[];
      isChooseSystemRenderEntries?: boolean;
      isChooseFlagsRenderEntries?: boolean;
      isIgnored?: true;
      ignoreSrdActivities?: true;
      ignoreSrdEffects?: true;
      actorTokenMod?: {
        [k: string]: unknown;
      };
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
      entries?: Entry[];
      entryData?: EntryDataObject;
      chooseSystem?: FoundrySystemObject[];
      isChooseSystemRenderEntries?: boolean;
      isChooseFlagsRenderEntries?: boolean;
      isIgnored?: true;
      ignoreSrdActivities?: true;
      ignoreSrdEffects?: true;
      actorTokenMod?: {
        [k: string]: unknown;
      };
      subEntities?: FoundrySubEntitiesObject;
    }[]
  ];
  /**
   * @minItems 1
   */
  subclass: [
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
      shortName: string;
      className: string;
      classSource: string;
      entries?: Entry[];
      entryData?: EntryDataObject;
      chooseSystem?: FoundrySystemObject[];
      isChooseSystemRenderEntries?: boolean;
      isChooseFlagsRenderEntries?: boolean;
      isIgnored?: true;
      ignoreSrdActivities?: true;
      ignoreSrdEffects?: true;
      actorTokenMod?: {
        [k: string]: unknown;
      };
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
      shortName: string;
      className: string;
      classSource: string;
      entries?: Entry[];
      entryData?: EntryDataObject;
      chooseSystem?: FoundrySystemObject[];
      isChooseSystemRenderEntries?: boolean;
      isChooseFlagsRenderEntries?: boolean;
      isIgnored?: true;
      ignoreSrdActivities?: true;
      ignoreSrdEffects?: true;
      actorTokenMod?: {
        [k: string]: unknown;
      };
      subEntities?: FoundrySubEntitiesObject;
    }[]
  ];
  /**
   * @minItems 1
   */
  classFeature: [
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
      className: string;
      classSource: string;
      level: number;
      entries?: Entry[];
      entryData?: EntryDataObject;
      chooseSystem?: FoundrySystemObject[];
      isChooseSystemRenderEntries?: boolean;
      isChooseFlagsRenderEntries?: boolean;
      isIgnored?: true;
      ignoreSrdActivities?: true;
      ignoreSrdEffects?: true;
      actorTokenMod?: {
        [k: string]: unknown;
      };
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
      className: string;
      classSource: string;
      level: number;
      entries?: Entry[];
      entryData?: EntryDataObject;
      chooseSystem?: FoundrySystemObject[];
      isChooseSystemRenderEntries?: boolean;
      isChooseFlagsRenderEntries?: boolean;
      isIgnored?: true;
      ignoreSrdActivities?: true;
      ignoreSrdEffects?: true;
      actorTokenMod?: {
        [k: string]: unknown;
      };
      subEntities?: FoundrySubEntitiesObject;
    }[]
  ];
  /**
   * @minItems 1
   */
  subclassFeature: [
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
      className: string;
      classSource: string;
      level: number;
      subclassShortName: string;
      subclassSource: string;
      entries?: Entry[];
      entryData?: EntryDataObject;
      chooseSystem?: FoundrySystemObject[];
      isChooseSystemRenderEntries?: boolean;
      isChooseFlagsRenderEntries?: boolean;
      isIgnored?: true;
      ignoreSrdActivities?: true;
      ignoreSrdEffects?: true;
      actorTokenMod?: {
        [k: string]: unknown;
      };
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
      className: string;
      classSource: string;
      level: number;
      subclassShortName: string;
      subclassSource: string;
      entries?: Entry[];
      entryData?: EntryDataObject;
      chooseSystem?: FoundrySystemObject[];
      isChooseSystemRenderEntries?: boolean;
      isChooseFlagsRenderEntries?: boolean;
      isIgnored?: true;
      ignoreSrdActivities?: true;
      ignoreSrdEffects?: true;
      actorTokenMod?: {
        [k: string]: unknown;
      };
      subEntities?: FoundrySubEntitiesObject;
    }[]
  ];
}
