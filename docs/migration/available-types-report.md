# Available Types Report: Migration Type Safety

**Generated**: 2025-12-28
**Source**: `D:\_Coding\Courses\5etools-src\types`
**Target**: `D:\_Coding\Courses\5etools-src\migration`

## Executive Summary

The `/types` directory contains **99 TypeScript definition files** with comprehensive type coverage for D&D 5e data. Most type safety issues in `/migration` can be resolved by importing existing types.

| Category | Available Types | Migration Files Affected | Est. Casts Fixable |
|----------|----------------|-------------------------|-------------------|
| Entry System | 38+ entry types | All renderers | ~50 |
| Monster | Full interface + damage/condition | monster.ts | ~25 |
| Prerequisite | Complete interface | charoption.ts, facility.ts | ~16 |
| Table/Cell | 5 table types | table.ts, renderer.ts | ~10 |
| Vehicle | 6 vehicle types | vehicle.ts | ~4 |
| Spell | Full spell system | spell.ts | ~5 |
| Entity Types | Recipe, Deity, Race, Object | entity renderers | ~15 |

---

## 1. Entry Types (Highest Impact)

**File**: `types/entry.d.ts`

### Core Types
```typescript
export type Entry = string | EntryObject;
export type EntryObject = EntrySection | EntryEntries | EntryQuote | ... // 38+ types
```

### Discriminated Union (38 entry types)
| Type | Discriminator | Use Case |
|------|--------------|----------|
| `EntrySection` | `type: "section"` | Major sections |
| `EntryEntries` | `type: "entries"` | Generic container |
| `EntryTable` | `type: "table"` | Data tables |
| `EntryList` | `type: "list"` | Bulleted lists |
| `EntryInset` | `type: "inset"` | Sidebar boxes |
| `EntryQuote` | `type: "quote"` | Quoted text |
| `EntryImage` | `type: "image"` | Images |
| `EntrySpellcasting` | `type: "spellcasting"` | Spell blocks |
| `EntryItem` | `type: "item"` | Items with entries |
| `EntryWrapped` | `type: "wrapper"` | Wrapper container |
| ... | ... | 28+ more types |

### Type Guard Pattern
```typescript
function isEntryObject(entry: Entry): entry is EntryObject {
  return typeof entry === "object";
}

// Use discriminated union for narrowing
if (entry.type === "table") {
  // TypeScript knows entry is EntryTable
}
```

### Migration Impact
**Fixes**: `(entry as any).type`, `as unknown as Entry`, `(entry as any).entries`

---

## 2. Monster Types

**File**: `types/bestiary/bestiary.d.ts`

### Main Interface
```typescript
export interface Monster {
  name: string;
  source: Source;
  level?: number;                    // Already typed!
  alignmentPrefix?: string;          // Already typed!
  initiative?: number | MonsterInitiative;  // Already typed!
  bonus?: MonsterAction[];           // Already typed!
  mythic?: MonsterAction[];          // Already typed!
  legendaryActions?: number;         // Already typed!
  save?: MonsterSaves;
  skill?: MonsterSkills;
  resist?: DamageResistEntry[];
  immune?: DamageImmunityEntry[];
  vulnerable?: DamageVulnerabilityEntry[];
  conditionImmune?: ConditionImmuneEntry[];
  // ... 50+ more properties
}
```

### Missing Properties (Need Extension)
These properties are used in `monster.ts` but NOT in Monster interface:
```typescript
// Extend Monster interface in migration:
interface MonsterExtended extends Monster {
  _displayName?: string;      // Display override
  resource?: MonsterResource[];  // Resource pools
  tool?: string[];            // Tool proficiencies
  gear?: string[];            // Equipment
}

interface MonsterResource {
  name: string;
  value?: number;
  formula?: string;
}
```

### Damage/Condition Types
```typescript
export type DamageResistEntry = DamageType | string | DamageResistObject;
export type DamageImmunityEntry = DamageType | string | DamageImmunityObject;
export type ConditionImmuneEntry = Condition | string | ConditionImmuneObject;

// Object variants include: note, cond, preNote, special
```

### Migration Impact
**Immediate fixes** (6 properties already typed): `level`, `alignmentPrefix`, `initiative`, `bonus`, `mythic`, `legendaryActions`
**Needs extension** (4 properties): `_displayName`, `resource`, `tool`, `gear`

---

## 3. Prerequisite Types

**File**: `types/util.d.ts` (lines 166-189)

### Interface
```typescript
export interface Prerequisite {
  level?: number | {level: number; class?: {name: string; source?: Source}};
  race?: {name: string; displayEntry?: string; source?: Source}[];
  ability?: Record<AbilityScoreAbbreviation, number>[];
  spellcasting?: boolean;
  spellcasting2020?: boolean;
  pact?: string;
  patron?: string;
  spell?: string[];
  feat?: string[];
  feature?: string[];
  item?: string[];
  psionics?: boolean;
  proficiency?: { armor?: string; weapon?: string; }[];
  other?: string;
  otherSummary?: { entry: string; entrySummary: string; };
  campaign?: string[];
}
```

### Missing Properties (Need Extension)
```typescript
// Extend for charoption.ts and facility.ts:
interface PrerequisiteExtended extends Prerequisite {
  background?: {name: string; displayEntry?: string; source?: Source}[];
  facility?: string[];
}
```

### Migration Impact
**charoption.ts**: All `(prereq as any).X` casts fixable except `background`
**facility.ts**: All casts fixable except `facility`

---

## 4. Table/Cell Types

**File**: `types/entry.d.ts`

### Types
```typescript
export interface EntryTable extends EntryBase {
  type: "table";
  colLabels?: (string | EntryTableHeaderCell)[];
  colStyles?: string[];
  rows?: EntryTableRow[];
  caption?: string;
  footnotes?: Entry[];
}

export interface EntryTableRow {
  type: "row";
  row?: (string | EntryTableCell | Entry)[];
  style?: string;
}

export interface EntryTableCell {
  type: "cell";
  entry?: Entry;
  width?: number;
  roll?: { exact?: number; min?: number; max?: number; pad?: boolean };
}

export interface EntryTableHeaderCell {
  type?: "cell";
  entry?: Entry;
  width?: number;
  isRoller?: boolean;
}
```

### Additional Table Type
**File**: `types/tables.d.ts`
```typescript
export interface Table {
  colLabelRows?: (string | EntryTableHeaderCell)[][];  // Multi-row headers
  rowLabels?: string[];  // Row labels
  // ... same as EntryTable
}
```

### Migration Impact
**Fixes**: `(row as any).type`, `(cell as any).type`, `tbl as unknown as EntryTable`

---

## 5. Vehicle Types

**File**: `types/vehicles.d.ts`

### Union Type
```typescript
export type Vehicle =
  | VehicleShip
  | VehicleSpelljammer
  | VehicleElementalAirship
  | VehicleInfernalWarMachine
  | VehicleCreature
  | VehicleObject;

export type VehicleType = "SHIP" | "SPELLJAMMER" | "ELEMENTAL_AIRSHIP" | "INFWAR" | "CREATURE" | "OBJECT";
```

### Ship-Specific Types
```typescript
export interface VehicleShip {
  vehicleType?: "SHIP";
  other?: ShipOther[];
  // ... full ship properties
}

export interface ShipOther {
  name: string;
  entries: Entry[];
  // Missing: isAction?: boolean  (needs extension)
}
```

### Migration Impact
**Fixes**: `(vehicle as any).vehicleType`
**Needs extension**: `ShipOther.isAction`

---

## 6. Spell Types

**File**: `types/spells/spells.d.ts`

### Main Interface
```typescript
export interface Spell {
  name: string;
  source: Source;
  level: number;
  school: SpellSchool;
  time: SpellTime[];
  range: SpellRange;
  components?: SpellComponents;
  duration: SpellDuration[];
  entries?: Entry[];
  entriesHigherLevel?: Entry[];
  damageInflict?: DamageType[];
  savingThrow?: AbilityFull[];
  spellAttack?: SpellAttackType[];
  classes?: SpellClasses;
  // ... 30+ more properties
}
```

### Spellcasting Entry
**File**: `types/entry.d.ts`
```typescript
export interface EntrySpellcasting extends EntryBase {
  type: "spellcasting";
  will?: string[];
  daily?: SpellcastingFrequency;
  spells?: Record<string, SpellLevel>;
  ability?: string;
}
```

---

## 7. Entity Types

### Recipe (`types/recipes.d.ts`)
```typescript
export interface Recipe {
  name: string;
  ingredients: Entry[];     // Not entryIngredients
  equipment?: Entry[];      // Not entryEquipment
  instructions: Entry[];
  noteCook?: Entry[];       // Not entryCooksNotes
  time?: RecipeTime;
  serves?: RecipeServes;
}
```

### Deity (`types/deities.d.ts`)
```typescript
export interface Deity {
  name: string;
  pantheon: Pantheon;
  domains?: DeityDomain[];
  symbol?: string;
  entries?: Entry[];
  // ... 25+ properties
}
```

### Race (`types/races.d.ts`)
```typescript
export interface Race {
  name: string;
  ability?: AbilityScores[];
  speed?: number | Speed;
  entries?: Entry[];
  additionalSpells?: AdditionalSpell[];
  // ... 35+ properties
}
```

### Object (`types/objects.d.ts`)
```typescript
export interface ObjectItem {
  name: string;
  objectType: ObjectType;  // "GEN" | "SW" | "U"
  str?: number; dex?: number; con?: number;
  int?: number; wis?: number; cha?: number;
  ac?: number | ObjectAcSpecial;
  hp: number | ObjectHpSpecial;
  // ... 30+ properties
}
```

---

## 8. Utility Types

**File**: `types/util.d.ts`

### Core Types
```typescript
export type Source = string;
export type Page = number | string;
export type AbilityScoreAbbreviation = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type DamageType = "acid" | "bludgeoning" | "cold" | ... | "thunder";
export type Condition = "blinded" | "charmed" | ... | "unconscious";
export type SpellSchool = "A" | "C" | "D" | "E" | "I" | "N" | "T" | "V" | "P";
```

### Proficiency Types
```typescript
export interface SkillProficiency { ... }
export interface ToolProficiency { ... }
export interface WeaponProficiency { ... }
export interface ArmorProficiency { ... }
export interface LanguageProficiency { ... }
```

---

## Type Mapping: Migration → Types

| Migration File | Current Pattern | Import From | Type to Use |
|----------------|-----------------|-------------|-------------|
| `monster.ts` | `(mon as any).level` | `types/bestiary/bestiary.d.ts` | `Monster.level` (exists) |
| `monster.ts` | `(mon as any)._displayName` | Create extension | `MonsterExtended._displayName` |
| `monster.ts` | `mon.immune as any[]` | `types/bestiary/bestiary.d.ts` | `DamageImmunityEntry[]` |
| `charoption.ts` | `(prereq as any).level` | `types/util.d.ts` | `Prerequisite.level` |
| `charoption.ts` | `(prereq as any).background` | Create extension | `PrerequisiteExtended.background` |
| `facility.ts` | `(prereq as any).facility` | Create extension | `PrerequisiteExtended.facility` |
| `vehicle.ts` | `(vehicle as any).vehicleType` | `types/vehicles.d.ts` | `Vehicle.vehicleType` |
| `vehicle.ts` | `(other as any).isAction` | Create extension | `ShipOtherExtended.isAction` |
| `renderer.ts` | `(entry as any).type` | `types/entry.d.ts` | Use discriminated union |
| `renderer.ts` | `(entry as any).entries` | `types/entry.d.ts` | `EntryEntries.entries` |
| `base.ts` | `(entry as any).type` | `types/entry.d.ts` | Use type guards |
| `table.ts` | `(row as any).type` | `types/entry.d.ts` | `EntryTableRow` |
| `recipe.ts` | `entry as unknown as Entry` | `types/entry.d.ts` | Direct `Entry` type |
| `converter.ts` | `as unknown as EntryTable` | `types/entry.d.ts` | `EntryTable` |

---

## Recommended Import Structure

```typescript
// Core types
import type { Entry, EntryObject, EntryTable, EntryTableRow, EntryTableCell } from "../../types/entry.js";
import type { Source, Page, Prerequisite, DamageType, Condition } from "../../types/util.js";

// Entity types
import type { Monster, DamageResistEntry, DamageImmunityEntry } from "../../types/bestiary/bestiary.js";
import type { Spell, SpellComponents } from "../../types/spells/spells.js";
import type { Vehicle, VehicleShip, ShipOther } from "../../types/vehicles.js";
import type { Recipe } from "../../types/recipes.js";
import type { Deity } from "../../types/deities.js";
import type { Race } from "../../types/races.js";
import type { ObjectItem } from "../../types/objects.js";
import type { Feat } from "../../types/feats.js";
import type { CharCreationOption } from "../../types/charcreationoptions.js";
```

---

## Types Needing Extension

Create in `migration/src/types/extensions.ts`:

```typescript
import type { Monster } from "../../types/bestiary/bestiary.js";
import type { Prerequisite } from "../../types/util.js";
import type { ShipOther } from "../../types/vehicles.js";

// Monster extensions for markdown renderer
export interface MonsterExtended extends Monster {
  _displayName?: string;
  resource?: Array<{ name: string; value?: number; formula?: string }>;
  tool?: string[];
  gear?: string[];
}

// Prerequisite extensions
export interface PrerequisiteExtended extends Prerequisite {
  background?: Array<{ name: string; displayEntry?: string; source?: string }>;
  facility?: string[];
}

// ShipOther extension
export interface ShipOtherExtended extends ShipOther {
  isAction?: boolean;
}
```

---

## Action Items

### Immediate (No Extension Needed)
1. Import `Entry` types and use discriminated union pattern
2. Import `Monster` and use existing properties (`level`, `initiative`, etc.)
3. Import `Prerequisite` for most prerequisite checks
4. Import table types for proper row/cell handling
5. Import `Vehicle` types for vehicleType discrimination

### Requires Type Extension
1. Create `MonsterExtended` for `_displayName`, `resource`, `tool`, `gear`
2. Create `PrerequisiteExtended` for `background`, `facility`
3. Create `ShipOtherExtended` for `isAction`

### Consider Schema Update
These missing properties may need to be added to the canonical `/types` definitions if they're part of the official 5etools schema.

---

## Questions

1. Should extensions live in `/migration/src/types/` or be added to `/types/`?
2. Are `_displayName`, `resource`, `tool`, `gear` official 5etools schema properties?
3. Is `background` prerequisite used elsewhere in the codebase?
4. Should test files use stricter typing or remain with `as any` for mock flexibility?
