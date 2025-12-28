export interface BookrefQuickJson {
  reference?: {
    "bookref-quick": {
      name: string;
      id: string;
      contents: {
        name: string;
        headers?: string[];
      }[];
    };
  };
  data?: {
    /**
     * @minItems 1
     */
    "bookref-quick": [Entry, ...Entry[]];
  };
}
