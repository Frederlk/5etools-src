/**
 * Keys are source identifiers.
 */
export interface SourcesJson {
  /**
   * Keys are spell names.
   *
   * This interface was referenced by `SourcesJson`'s JSON-Schema definition
   * via the `patternProperty` "^[-a-zA-Z0-9]+$".
   */
  [k: string]: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^[-a-zA-ZÀ-ž0-9 '()/;]+$".
     */
    [k: string]: {
      /**
       * @minItems 1
       */
      class?: [
        {
          name: string;
          source: string;
          definedInSource?: string;
        },
        ...{
          name: string;
          source: string;
          definedInSource?: string;
        }[]
      ];
      /**
       * @minItems 1
       */
      classVariant?: [
        {
          name: string;
          source: string;
          definedInSource: string;
        },
        ...{
          name: string;
          source: string;
          definedInSource: string;
        }[]
      ];
    };
  };
}
