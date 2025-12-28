export interface Roll20 {
    spell?: Roll2[];
    [property: string]: any;
}

export interface Roll2 {
    /**
     * Based on the Roll20 data, available e.g. here:
     * https://app.roll20.net/compendium/dnd5e/Spells:Fireball.json
     */
    data:        Data;
    name:        string;
    shapedData?: { [key: string]: any };
    source:      string;
}

/**
 * Based on the Roll20 data, available e.g. here:
 * https://app.roll20.net/compendium/dnd5e/Spells:Fireball.json
 */
export interface Data {
    "Add Casting Modifier"?:             string;
    Crit?:                               string;
    "Crit Range"?:                       string;
    Damage?:                             string;
    "Damage Progression"?:               string;
    "Damage Type"?:                      string;
    "data-Cantrip Scaling"?:             string;
    Healing?:                            string;
    "Higher Level Healing"?:             string;
    "Higher Spell Slot Bonus"?:          string;
    "Higher Spell Slot Dice"?:           string;
    "Higher Spell Slot Die"?:            string;
    Save?:                               string;
    "Save Success"?:                     string;
    "Secondary Add Casting Modifier"?:   string;
    "Secondary Damage"?:                 string;
    "Secondary Damage Progression"?:     string;
    "Secondary Damage Type"?:            string;
    "Secondary Higher Spell Slot Dice"?: string;
    "Secondary Higher Spell Slot Die"?:  string;
    "Spell Attack"?:                     string;
    Target?:                             string;
}
