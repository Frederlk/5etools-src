export interface MakebrewCreatureJson {
  /**
   * Additional trait templates which can be used in the homebrew builder.
   *
   * @minItems 1
   */
  makebrewCreatureTrait?: [
    {
      name: string;
      source?: string;
      reprintedAs?: ReprintedAs;
      entries: Entry[];
    },
    ...{
      name: string;
      source?: string;
      reprintedAs?: ReprintedAs;
      entries: Entry[];
    }[]
  ];
  /**
   * Additional action templates which can be used in the homebrew builder.
   *
   * @minItems 1
   */
  makebrewCreatureAction?: [
    {
      name: string;
      source?: string;
      reprintedAs?: ReprintedAs;
      entries: Entry[];
    },
    ...{
      name: string;
      source?: string;
      reprintedAs?: ReprintedAs;
      entries: Entry[];
    }[]
  ];
}
