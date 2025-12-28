export interface MonsterfeaturesJson {
  /**
   * @minItems 1
   */
  monsterfeatures: [
    {
      name: string;
      example: string;
      effect: string;
      hp?: string;
      ac?: string;
      dpr?: string;
      attackBonus?: string;
      /**
       * Whether this feature requires an automatic input when applied.
       */
      hasNumberParam?: boolean;
    },
    ...{
      name: string;
      example: string;
      effect: string;
      hp?: string;
      ac?: string;
      dpr?: string;
      attackBonus?: string;
      /**
       * Whether this feature requires an automatic input when applied.
       */
      hasNumberParam?: boolean;
    }[]
  ];
}
