# 5etools TypeScript Type Definitions

Auto-generated TypeScript types from 5etools JSON schemas.

## Quick Start

```typescript
import type { Monster } from "./bestiary/bestiary.js";
import type { Spell } from "./spells/spells.js";
import type { Item } from "./items.js";
import type { Entry } from "./entry.js";
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CORE TYPES                           │
├─────────────────────────────────────────────────────────────┤
│  entry.d.ts    - Rich text entries (recursive, manual)      │
│  util.d.ts     - Shared enums & primitives (manual)         │
└───────────────────────────┬─────────────────────────────────┘
                            │ imported by
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   BESTIARY    │   │    SPELLS     │   │    CLASS      │
│   bestiary/   │   │    spells/    │   │    class/     │
├───────────────┤   ├───────────────┤   ├───────────────┤
│ bestiary.d.ts │   │ spells.d.ts   │   │ class.d.ts    │
│ template.d.ts │   │ sources.d.ts  │   │ foundry.d.ts  │
│ legendary*.ts │   │ roll20.d.ts   │   │ fluff-*.d.ts  │
│ fluff-*.d.ts  │   │ fluff-*.d.ts  │   └───────────────┘
│ foundry.d.ts  │   │ foundry.d.ts  │
└───────────────┘   └───────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ENTITY TYPES (Root)                      │
├─────────────────────────────────────────────────────────────┤
│  items.d.ts         - Magic items, equipment                │
│  items-base.d.ts    - Base item templates                   │
│  magicvariants.d.ts - Magic item variants                   │
│  feats.d.ts         - Character feats                       │
│  backgrounds.d.ts   - Character backgrounds                 │
│  races.d.ts         - Playable races                        │
│  optionalfeatures   - Class optional features               │
│  vehicles.d.ts      - Mounts & vehicles                     │
│  objects.d.ts       - Interactive objects                   │
│  trapshazards.d.ts  - Traps & hazards                       │
│  deities.d.ts       - Gods & pantheons                      │
│  rewards.d.ts       - Supernatural gifts, blessings         │
│  recipes.d.ts       - Crafting recipes                      │
│  decks.d.ts         - Card decks                            │
│  bastions.d.ts      - Bastion facilities                    │
│  cultsboons.d.ts    - Cults & demonic boons                 │
│  psionics.d.ts      - Psionic abilities                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    REFERENCE TYPES                          │
├─────────────────────────────────────────────────────────────┤
│  conditionsdiseases - Conditions & diseases                 │
│  languages.d.ts     - Language definitions                  │
│  senses.d.ts        - Sense types                           │
│  skills.d.ts        - Skill definitions                     │
│  actions.d.ts       - Action types                          │
│  variantrules.d.ts  - Variant/optional rules                │
│  tables.d.ts        - Random tables                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CONTENT TYPES                            │
├─────────────────────────────────────────────────────────────┤
│  adventures.d.ts    - Adventure metadata                    │
│  books.d.ts         - Book metadata                         │
│  adventure/         - Adventure content                     │
│  book/              - Book content                          │
│  encounters.d.ts    - Pre-built encounters                  │
│  names.d.ts         - Name generation tables                │
│  loot.d.ts          - Loot tables                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    INTEGRATION TYPES                        │
├─────────────────────────────────────────────────────────────┤
│  foundry-*.d.ts     - FoundryVTT module data                │
│  util-foundry.d.ts  - FoundryVTT shared utilities           │
│  homebrew.d.ts      - Homebrew content structure            │
│  converter.d.ts     - Data converter types                  │
│  encounterbuilder   - Encounter builder data                │
│  makebrew-*.d.ts    - Homebrew creation helpers             │
└─────────────────────────────────────────────────────────────┘
```

## Core Types

### `entry.d.ts` - Rich Text System

The `Entry` type is the foundation for all descriptive content. It's a recursive union type representing 5etools' rich text format.

```typescript
type Entry = string | EntryObject;

// Common entry types:
EntrySection      // Major section with heading
EntryEntries      // Nested entries container
EntryList         // Bulleted/numbered lists
EntryTable        // Data tables
EntryQuote        // Quoted text
EntryInset        // Sidebar content
EntryImage        // Image references
EntryLink         // External links
EntryDice         // Dice notation
EntrySpellcasting // Spellcasting blocks
```

**Usage:**
```typescript
import type { Entry, EntryTable, EntryList } from "./entry.js";

function renderEntry(entry: Entry): string {
  if (typeof entry === "string") return entry;
  if (entry.type === "list") return renderList(entry as EntryList);
  // ...
}
```

### `util.d.ts` - Shared Primitives

Common types used across all schemas:

| Type | Description | Example Values |
|------|-------------|----------------|
| `Source` | Source book code | `"PHB"`, `"DMG"`, `"XGE"` |
| `Page` | Page reference | `42`, `"123-125"` |
| `Size` | Creature size | `"T"`, `"S"`, `"M"`, `"L"`, `"H"`, `"G"` |
| `Alignment` | Alignment codes | `"LG"`, `"N"`, `"CE"` |
| `CreatureType` | Monster types | `"humanoid"`, `"fiend"`, `"dragon"` |
| `DamageType` | Damage types | `"fire"`, `"radiant"`, `"necrotic"` |
| `Condition` | Status conditions | `"blinded"`, `"stunned"` |
| `Rarity` | Item rarity | `"common"`, `"legendary"` |
| `SpellSchool` | Magic schools | `"A"` (abjuration), `"V"` (evocation) |
| `AbilityScoreAbbreviation` | Ability scores | `"str"`, `"dex"`, `"con"` |

## Entity Types

### Creatures (`bestiary/`)

```typescript
import type { Monster, BestiaryJson } from "./bestiary/bestiary.js";
import type { LegendaryGroup } from "./bestiary/legendarygroups.js";
import type { CreatureTemplate } from "./bestiary/template.js";

interface Monster {
  name: string;
  source: Source;
  type: MonsterType;
  cr?: ChallengeRating;
  hp?: MonsterHp;
  ac?: AcItem[];
  speed?: Speed;
  // abilities, actions, legendary actions, etc.
}
```

### Spells (`spells/`)

```typescript
import type { Spell, SpellsJson } from "./spells/spells.js";

interface Spell {
  name: string;
  source: Source;
  level: number;           // 0 = cantrip
  school: SpellSchool;
  time: SpellTime[];
  range: SpellRange;
  components?: SpellComponents;
  duration: SpellDuration[];
  entries?: Entry[];
  classes?: SpellClasses;
}
```

### Classes (`class/`)

```typescript
import type { Class, Subclass, ClassFeature } from "./class/class.js";

interface Class {
  name: string;
  source: Source;
  hd: { faces: number };
  proficiency: AbilityAbbreviation[];
  classFeatures: (string | ClassFeature)[];
  subclasses?: Subclass[];
}
```

### Items

```typescript
import type { Item, ItemsJson } from "./items.js";
import type { BaseItem } from "./items-base.js";
import type { MagicVariant } from "./magicvariants.js";

interface Item {
  name: string;
  source: Source;
  type?: ItemType;
  rarity?: Rarity;
  reqAttune?: string | boolean;
  entries?: Entry[];
  // damage, AC, properties, etc.
}
```

## Fluff Types

"Fluff" files contain supplementary lore content (descriptions, images, flavor text):

```typescript
import type { MonsterFluff } from "./bestiary/fluff-bestiary.js";
import type { SpellFluff } from "./spells/fluff-spells.js";

// Pattern: fluff-{entity}.d.ts
// Contains: images, extended descriptions, lore entries
```

## Foundry VTT Types

Types for FoundryVTT module integration:

```typescript
import type { FoundryMonster } from "./bestiary/foundry.js";
import type { FoundryItem } from "./foundry-items.js";
import type { FoundrySpell } from "./spells/foundry.js";

// Foundry-specific fields: effects, activeEffects, flags, etc.
```

## Type Relationships

```
                    ┌──────────────┐
                    │   util.d.ts  │
                    │  (primitives)│
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ entry.ts │ │ Source   │ │ DamageType│
        │ (Entry)  │ │ Page     │ │ Condition │
        └────┬─────┘ │ Size     │ │ Rarity    │
             │       │ Alignment│ │ CreatureType
             │       └────┬─────┘ └─────┬─────┘
             │            │             │
             ▼            ▼             ▼
     ┌───────────────────────────────────────┐
     │           All Entity Types            │
     │  Monster, Spell, Item, Class, etc.    │
     └───────────────────────────────────────┘
```

## File Naming Conventions

| Pattern | Description | Example |
|---------|-------------|---------|
| `{entity}.d.ts` | Main entity type | `items.d.ts` |
| `{entity}-base.d.ts` | Base/template types | `items-base.d.ts` |
| `fluff-{entity}.d.ts` | Lore/flavor content | `fluff-items.d.ts` |
| `foundry-{entity}.d.ts` | FoundryVTT types | `foundry-items.d.ts` |
| `util-{domain}.d.ts` | Domain utilities | `util-foundry.d.ts` |
| `{entity}/index.d.ts` | Barrel exports | `spells/index.d.ts` |

## Regenerating Types

```bash
npm run build:types
```

Generates `.d.ts` files from `schema/site/` JSON schemas.

**Note:** `entry.d.ts` and `util.d.ts` are manually maintained due to recursive structures and special handling requirements.

## Common Patterns

### Loading JSON Data

```typescript
import type { BestiaryJson } from "./bestiary/bestiary.js";
import type { SpellsJson } from "./spells/spells.js";

async function loadBestiary(): Promise<BestiaryJson> {
  const response = await fetch("data/bestiary/bestiary-mm.json");
  return response.json();
}

const data = await loadBestiary();
for (const monster of data.monster ?? []) {
  console.log(monster.name, monster.cr);
}
```

### Type Guards

```typescript
import type { Entry, EntryList, EntryTable } from "./entry.js";

function isEntryList(entry: Entry): entry is EntryList {
  return typeof entry === "object" && entry.type === "list";
}

function isEntryTable(entry: Entry): entry is EntryTable {
  return typeof entry === "object" && entry.type === "table";
}
```

### Rendering Entries

```typescript
import type { Entry } from "./entry.js";

function renderEntries(entries: Entry[]): string {
  return entries.map(entry => {
    if (typeof entry === "string") return entry;

    switch (entry.type) {
      case "entries":
        return renderEntries(entry.entries ?? []);
      case "list":
        return entry.items.map(i => `• ${i}`).join("\n");
      // ... handle other types
    }
  }).join("\n");
}
```
