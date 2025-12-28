/**
 * @minItems 1
 */
export type ChangelogJson = [
  {
    ver: string;
    date: string;
    title?: string;
    titleAlt?: string;
    txt: string;
  },
  ...{
    ver: string;
    date: string;
    title?: string;
    titleAlt?: string;
    txt: string;
  }[]
];
