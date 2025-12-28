# RendererMarkdown TypeScript Migration Plan

Phased migration from legacy JS to modern TypeScript, starting with smallest dependencies.

## Overview

**Goal**: Modern, type-safe, tree-shakeable TypeScript implementation
**Approach**: Bottom-up migration (utilities → parser → renderer → markdown renderer)
**Output**: ESM modules with full type definitions
**Output Location**: `/migration/` directory

> **IMPORTANT**: Mark each phase/task as ✅ COMPLETED in the checklist when done.

---

## Phase 1: Core Utilities

### 1.1 String Utilities (`str-util.ts`)
```
Source: utils.js (StrUtil class + String.prototype extensions)
Priority: HIGHEST (no dependencies)
Size: ~200 lines
```

**Functions to migrate:**
- `padNumber(num, len, padStr)`
- `toTitleCase(str)`
- `uppercaseFirst(str)`
- `lowercaseFirst(str)`

**TypeScript approach:**
```typescript
export const padNumber = (num: number, len: number, padStr = "0"): string => ...
export const toTitleCase = (str: string): string => ...
```

**Notes:**
- Remove prototype pollution, use pure functions
- Add proper Unicode handling for title case

---

### 1.2 Array Utilities (`array-util.ts`)
```
Source: utils.js (Array.prototype extensions)
Priority: HIGHEST (no dependencies)
Size: ~100 lines
```

**Functions to migrate:**
- `last<T>(arr: T[]): T | undefined`
- `joinConjunct(arr: string[], joiner: string, lastJoiner: string): string`

**Notes:**
- Generic type parameters for type safety
- No mutation, pure functions only

---

### 1.3 Sort Utilities (`sort-util.ts`)
```
Source: utils.js (SortUtil class)
Priority: HIGH (no dependencies)
Size: ~150 lines
```

**Functions to migrate:**
- `ascSort(a, b)` → generic comparator
- `ascSortAtts(a, b)` → D&D attribute sorting

**TypeScript approach:**
```typescript
export const ascSort = <T extends string | number>(a: T, b: T): number => ...
export const ascSortAtts = (a: string, b: string): number => ...
```

---

### 1.4 Misc Utilities (`misc-util.ts`)
```
Source: utils.js (MiscUtil class)
Priority: HIGH (no dependencies)
Size: ~300 lines
```

**Functions to migrate:**
- `copy<T>(obj: T): T` - deep clone
- `copyFast<T>(obj: T): T` - JSON-based clone
- `getWalker(opts?)` - object tree walker

**Notes:**
- Use `structuredClone` for modern copy
- Walker should use generics and visitor pattern

---

## Phase 2: Type Definitions

> **NOTE**: 5etools already has comprehensive TypeScript types in `/types/`.
> See `/types/README.md` for architecture and usage.
> We import from existing types rather than creating duplicates.

### 2.1 Use Existing Entry Types
```
Source: /types/entry.d.ts (manually maintained)
Status: EXISTING - import directly
```

**Available types:**
```typescript
import type { Entry, EntryObject, EntryBase } from "../../types/entry.js";
import type { EntryEntries, EntryList, EntryTable } from "../../types/entry.js";
import type { EntryQuote, EntryInset, EntryImage } from "../../types/entry.js";
import type { EntrySpellcasting, EntryDice } from "../../types/entry.js";
// ... 30+ entry types defined
```

---

### 2.2 Use Existing Entity Types
```
Source: /types/bestiary/, /types/spells/, /types/items.d.ts, etc.
Status: EXISTING - import directly
```

**Available types:**
```typescript
import type { Monster, BestiaryJson } from "../../types/bestiary/bestiary.js";
import type { Spell, SpellsJson } from "../../types/spells/spells.js";
import type { Item, ItemsJson } from "../../types/items.js";
import type { Class, Subclass } from "../../types/class/class.js";
import type { Feat } from "../../types/feats.js";
import type { Race } from "../../types/races.js";
// ... 90+ type definition files
```

---

### 2.3 Use Existing Util Types
```
Source: /types/util.d.ts (manually maintained)
Status: EXISTING - import directly
```

**Available types:**
```typescript
import type { Source, Page, Size, Alignment } from "../../types/util.js";
import type { AbilityScoreAbbreviation, CreatureType } from "../../types/util.js";
import type { DamageType, Condition, SpellSchool, Rarity } from "../../types/util.js";
import type { Speed, Senses, Prerequisite } from "../../types/util.js";
```

---

### 2.4 Renderer Types (`renderer/types.ts`) - NEW
```
Priority: MEDIUM (for renderer migration)
Size: ~50 lines
```

**Types to define (renderer-specific only):**
```typescript
export interface RenderOptions {
  prefix?: string;
  suffix?: string;
  isSkipNameRow?: boolean;
}

export interface RenderMeta {
  depth: number;
  _typeStack: string[];
}

export type TextStack = [string];

export interface TagRenderInfo {
  page: string;
  source: string;
  hash: string;
  displayText?: string;
}
```

---

## Phase 3: Parser Migration

### 3.1 Attribute Parser (`parser/attributes.ts`)
```
Source: parser.js (attribute-related methods)
Priority: MEDIUM
Size: ~200 lines
```

**Functions:**
- `attrChooseToFull(attrs: string[]): string`
- `attAbvToFull(abv: string): string`
- `getAbilityModifier(score: number): number`
- `ABIL_ABVS: readonly string[]`

---

### 3.2 Monster Parser (`parser/monster.ts`)
```
Source: parser.js (monster-related methods)
Priority: MEDIUM
Size: ~400 lines
```

**Functions:**
- `monTypeToFullObj(type): MonsterType`
- `acToFull(ac, opts): string`
- `getSpeedString(speed): string`
- `getFullImmRes(arr, opts): string`
- `getFullCondImm(arr, opts): string`
- `alignmentListToFull(align): string`

---

### 3.3 Spell Parser (`parser/spell.ts`)
```
Source: parser.js (spell-related methods)
Priority: MEDIUM
Size: ~300 lines
```

**Functions:**
- `spLevelSchoolMetaToFull(level, school, meta, subschools): string`
- `spTimeListToFull(times, meta): string`
- `spRangeToFull(range): string`
- `spComponentsToFull(comp, level, opts): string`
- `spDurationToFull(dur, opts): string`

---

### 3.4 Item Parser (`parser/item.ts`)
```
Source: parser.js (item-related methods)
Priority: MEDIUM
Size: ~200 lines
```

**Functions:**
- `itemValueToFullMultiCurrency(item, opts): string`
- `itemWeightToFull(item): string`
- `attackTypeToFull(type): string`

---

## Phase 4: Base Renderer

### 4.1 Tag Processor (`renderer/tags.ts`)
```
Source: render.js (tag handling)
Priority: HIGH
Size: ~500 lines
```

**Functions:**
- `stripTags(str): string`
- `splitByTags(str): string[]`
- `splitFirstSpace(str): [string, string]`
- `splitTagByPipe(str): string[]`

---

### 4.2 Table Utilities (`renderer/table.ts`)
```
Source: render.js (Renderer.table.*)
Priority: MEDIUM
Size: ~200 lines
```

**Functions:**
- `getHeaderRowMetas(entry): HeaderRowMeta[] | null`
- `getHeaderRowSpanWidth(row): number`

---

### 4.3 Base Renderer (`renderer/renderer.ts`)
```
Source: render.js (Renderer class core)
Priority: HIGH (largest component)
Size: ~2000 lines (extract only needed methods)
```

**Core methods:**
- `render(entry, opts): string`
- `recursiveRender(entry, textStack, meta, opts)`
- `_renderEntries`, `_renderList`, `_renderTable`, etc.

**Notes:**
- Use abstract class or interface for renderer contract
- Strategy pattern for different output formats (HTML, Markdown, plain text)

---

## Phase 5: Entity Renderers

### 5.1 Monster Renderer Utils (`renderer/monster.ts`)
```
Source: render.js (Renderer.monster.*)
Priority: MEDIUM
Size: ~600 lines
```

**Functions:**
- `getRenderedHp(hp, opts): string`
- `getRenderedResource(res, isPlainText): string`
- `getInitiativePart(mon, opts): string`
- `getLegendaryActionIntro(mon, opts): string`
- `getSubEntries(mon, opts): SubEntries`

---

### 5.2 Spell Renderer Utils (`renderer/spell.ts`)
```
Source: render.js (Renderer.spell.*)
Priority: LOW
Size: ~200 lines
```

---

### 5.3 Item Renderer Utils (`renderer/item.ts`)
```
Source: render.js (Renderer.item.*)
Priority: LOW
Size: ~300 lines
```

---

## Phase 6: Markdown Renderer

### 6.1 Markdown Renderer Core (`markdown/renderer.ts`)
```
Source: render-markdown.js (RendererMarkdown class)
Priority: FINAL
Size: ~800 lines
```

**Class structure:**
```typescript
export class MarkdownRenderer extends BaseRenderer {
  protected _renderList(entry: EntryList, textStack: TextStack, meta: RenderMeta, opts: RenderOptions): void
  protected _renderTable(entry: EntryTable, textStack: TextStack, meta: RenderMeta, opts: RenderOptions): void
  // ... etc
}
```

---

### 6.2 Monster Markdown (`markdown/monster.ts`)
```
Source: render-markdown.js (RendererMarkdown.monster)
Priority: FINAL
Size: ~500 lines
```

---

### 6.3 Spell Markdown (`markdown/spell.ts`)
```
Source: render-markdown.js (RendererMarkdown.spell)
Priority: FINAL
Size: ~100 lines
```

---

### 6.4 Item Markdown (`markdown/item.ts`)
```
Source: render-markdown.js (RendererMarkdown.item)
Priority: FINAL
Size: ~150 lines
```

---

### 6.5 Other Entity Markdown (`markdown/entities/`)
```
Source: render-markdown.js (remaining entity renderers)
Priority: FINAL (migrate as needed)
```

Entities: `race`, `feat`, `vehicle`, `object`, `deity`, `language`, `reward`, `psionic`, `cult`, `boon`, `charoption`, `recipe`, `facility`, `trap`, `hazard`, `legendaryGroup`

---

## Phase 7: Markdown Converter

### 7.1 Markdown to Entry Converter (`markdown/converter.ts`)
```
Source: render-markdown.js (MarkdownConverter class)
Priority: FINAL
Size: ~800 lines
```

**Core methods:**
- `getEntries(mdStr): Entry[]`
- `getConvertedTable(lines, caption): EntryTable`
- `postProcessTable(tbl, opts): void`

---

## Project Structure

All migrated TypeScript files go in `/migration/` directory:

```
migration/
├── src/
│   ├── types/
│   │   ├── entries.ts
│   │   ├── entities.ts
│   │   └── renderer.ts
│   ├── util/
│   │   ├── str-util.ts
│   │   ├── array-util.ts
│   │   ├── sort-util.ts
│   │   └── misc-util.ts
│   ├── parser/
│   │   ├── index.ts
│   │   ├── attributes.ts
│   │   ├── monster.ts
│   │   ├── spell.ts
│   │   └── item.ts
│   ├── renderer/
│   │   ├── index.ts
│   │   ├── base.ts
│   │   ├── tags.ts
│   │   ├── table.ts
│   │   ├── monster.ts
│   │   ├── spell.ts
│   │   └── item.ts
│   ├── markdown/
│   │   ├── index.ts
│   │   ├── renderer.ts
│   │   ├── converter.ts
│   │   ├── monster.ts
│   │   ├── spell.ts
│   │   ├── item.ts
│   │   └── entities/
│   │       ├── race.ts
│   │       ├── feat.ts
│   │       └── ... (other entities)
│   └── index.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Configuration

### 7.1 Config Interface (`config.ts`)
```typescript
export interface MarkdownConfig {
  tagRenderMode: "convertMarkdown" | "ignore" | "convertText";
  isAddColumnBreaks: boolean;
  isAddPageBreaks: boolean;
  style: "classic" | "one";
}

export const defaultConfig: MarkdownConfig = {
  tagRenderMode: "convertMarkdown",
  isAddColumnBreaks: false,
  isAddPageBreaks: false,
  style: "classic"
};
```

---

## Migration Checklist

### Phase 1 - Utilities
- [x] 1.1 str-util.ts
- [x] 1.2 array-util.ts
- [x] 1.3 sort-util.ts
- [x] 1.4 misc-util.ts
- [x] Unit tests for utilities

### Phase 2 - Types
- [x] 2.1 Entry types (use existing /types/entry.d.ts)
- [x] 2.2 Entity types (use existing /types/bestiary/, /types/spells/, etc.)
- [x] 2.3 Util types (use existing /types/util.d.ts)
- [x] 2.4 renderer/types.ts (renderer-specific types)

### Phase 3 - Parser
- [x] 3.1 parser/attributes.ts
- [x] 3.2 parser/monster.ts
- [x] 3.3 parser/spell.ts
- [x] 3.4 parser/item.ts
- [ ] Unit tests for parser

### Phase 4 - Base Renderer
- [x] 4.1 renderer/tags.ts
- [x] 4.2 renderer/table.ts
- [x] 4.3 renderer/base.ts
- [ ] Integration tests

### Phase 5 - Entity Renderers
- [ ] 5.1 renderer/monster.ts
- [ ] 5.2 renderer/spell.ts
- [ ] 5.3 renderer/item.ts

### Phase 6 - Markdown Renderer
- [ ] 6.1 markdown/renderer.ts
- [ ] 6.2 markdown/monster.ts
- [ ] 6.3 markdown/spell.ts
- [ ] 6.4 markdown/item.ts
- [ ] 6.5 Other entities (as needed)

### Phase 7 - Converter
- [ ] 7.1 markdown/converter.ts
- [ ] E2E tests with real data

---

## Build Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### package.json exports
```json
{
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./markdown": "./dist/markdown/index.js",
    "./parser": "./dist/parser/index.js",
    "./util": "./dist/util/index.js"
  }
}
```

---

## Design Decisions

| Question | Decision |
|----------|----------|
| **Renderer pattern** | Composition over inheritance - better tree-shaking, cleaner DRY code |
| **Bundle strategy** | Modular imports - consumers import only what they need |
| **Runtime validation** | Trust input - no Zod/io-ts overhead, types for dev-time safety only |
| **Legacy compat** | None - clean break, no globalThis bindings |
| **Test data** | TBD - define test fixtures later |

---

## Architecture Principles

Goals: **performance**, **maintainability**, **clean DRY code**

1. **Composition over inheritance**
   - Renderer as composable functions, not class hierarchy
   - Entity renderers as standalone modules
   - Shared logic extracted to pure utility functions

2. **Single responsibility**
   - Each module does one thing well
   - No god classes or mega-files

3. **Zero duplication**
   - Shared tag processing logic
   - Common formatting patterns extracted
   - Generic helpers over copy-paste

4. **Lazy evaluation**
   - Render only what's requested
   - No eager computation of unused properties

5. **Minimal allocations**
   - Reuse buffers where possible
   - Avoid unnecessary object creation in hot paths
