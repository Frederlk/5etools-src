export interface FluffCharcreationoptionsJson {
  /**
   * @minItems 1
   */
  charoptionFluff?: [
    {
      name: string;
      source: string;
      /**
       * @minItems 1
       */
      images?: [EntryImage, ...EntryImage[]];
      entries?: Entry[];
    },
    ...{
      name: string;
      source: string;
      /**
       * @minItems 1
       */
      images?: [EntryImage, ...EntryImage[]];
      entries?: Entry[];
    }[]
  ];
}
