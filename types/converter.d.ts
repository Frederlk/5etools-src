export interface ConverterJson {
  /**
   * @minItems 1
   */
  converterSample?: [
    {
      converterId: "background" | "monster" | "generic" | "feat" | "item" | "race" | "spell" | "table";
      format: "txt" | "md" | "html";
      /**
       * A context-sensitive behaviour hint. Generally, entities marked with `"edition": "one"` will not be modified (as they are assumed to be up-to-date) prior to display/use, and entities lacking an `"edition"` or using `"edition": "classic"` may be modified to better suit modern rules. For example:
       * - Classes/subclasses: an edition mismatch between class and subclass will prompt the renderer to add a note that the subclass is from a different game edition, and that feature levels may have to be adjusted accordingly (notably, when rendering synthetic subclass copies)
       * - Plutonium, when using the "Modern (2024)" rules version: non-"one" species will be stripped of their ability scores; non-"one" backgrounds will gain extra ability scores; etc.
       */
      edition: "classic" | "one";
      text: string;
    },
    ...{
      converterId: "background" | "monster" | "generic" | "feat" | "item" | "race" | "spell" | "table";
      format: "txt" | "md" | "html";
      /**
       * A context-sensitive behaviour hint. Generally, entities marked with `"edition": "one"` will not be modified (as they are assumed to be up-to-date) prior to display/use, and entities lacking an `"edition"` or using `"edition": "classic"` may be modified to better suit modern rules. For example:
       * - Classes/subclasses: an edition mismatch between class and subclass will prompt the renderer to add a note that the subclass is from a different game edition, and that feature levels may have to be adjusted accordingly (notably, when rendering synthetic subclass copies)
       * - Plutonium, when using the "Modern (2024)" rules version: non-"one" species will be stripped of their ability scores; non-"one" backgrounds will gain extra ability scores; etc.
       */
      edition: "classic" | "one";
      text: string;
    }[]
  ];
}
