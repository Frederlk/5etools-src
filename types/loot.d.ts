export interface LootJson {
  individual: {
    name: string;
    source: string;
    page: string | number;
    crMin: Cr;
    crMax: Cr;
    table: {
      min: D100;
      max: D100;
      coins: Coin;
    }[];
  }[];
  hoard: {
    name: string;
    source: string;
    page: string | number;
    crMin: Cr;
    crMax: Cr;
    coins: Coin;
    table: {
      min: D100;
      max: D100;
      gems?: LootTypeAmount;
      artObjects?: LootTypeAmount;
      magicItems?: LootTypeAmountMagicItems;
    }[];
  }[];
  gems: GemsOrArt;
  artObjects: GemsOrArt;
  magicItems: {
    name: string;
    source: string;
    page: string | number;
    type: string;
    table: Table;
  }[];
  dragonMundaneItems: Table;
  dragon?: {
    name: string;
    source: string;
    page: string | number;
    coins: Coin;
    gems: LootTypeAmount;
    artObjects: LootTypeAmount;
    magicItems: LootTypeAmountMagicItems;
    dragonMundaneItems: {
      amount: string;
    };
  }[];
}
