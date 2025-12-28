# Type Safety Report: Migration Directory

**Generated**: 2025-12-28
**Scope**: `D:\_Coding\Courses\5etools-src\migration`

## Executive Summary

| Pattern | Count | Severity | Location |
|---------|-------|----------|----------|
| `as any` | **166** | High | 13 files |
| `as unknown as` | **41** | Medium | 11 files |
| `@ts-ignore` | **0** | None | - |
| `@ts-expect-error` | **0** | None | - |

**Codebase Context**: 54 TypeScript files (40 impl, 14 test), 748KB source

---

## Detailed Findings

### 1. `as any` — 166 occurrences (Priority: High)

**Hotspots by file**:

| File | Count | Category |
|------|-------|----------|
| `monster.ts` (markdown) | 32 | Production |
| `base.test.ts` (renderer) | 29 | Test |
| `renderer.ts` (markdown) | 27 | Production |
| `base.ts` (renderer) | 19 | Production |
| `charoption.ts` | 14 | Production |
| `vehicle.ts` | 4 | Production |
| `table.ts` / `table.test.ts` | 5 | Mixed |
| `psionic.ts` | 1 | Production |
| `facility.ts` | 2 | Production |

**Common patterns**:
- **Property access on untyped objects**: `(mon as any).resource`, `(prereq as any).level`
- **Test mocking**: `{} as any`, `{ type: "..." } as any`
- **Flexible entry types**: `(entry as any).entries`, `(entry as any).type`

#### Detailed Locations

**charoption.ts**
| Line | Code |
|------|------|
| 60 | `if ((prereq as any).level) {` |
| 61 | `const level = (prereq as any).level;` |
| 75 | `if ((prereq as any).race) {` |
| 76 | `const raceNames = (prereq as any).race.map((r: any) => {` |
| 85 | `if ((prereq as any).ability) {` |
| 86 | `const abilityParts = (prereq as any).ability.map((ab: any) => {` |
| 93 | `if ((prereq as any).spellcasting) {` |
| 97 | `if ((prereq as any).spellcasting2020) {` |
| 101 | `if ((prereq as any).proficiency) {` |
| 102 | `const profParts = (prereq as any).proficiency.map((p: any) => {` |
| 110 | `if ((prereq as any).background) {` |
| 111 | `const bgNames = (prereq as any).background.map((b: any) => {` |
| 118 | `if ((prereq as any).other) {` |
| 119 | `prereqParts.push((prereq as any).other);` |

**facility.ts**
| Line | Code |
|------|------|
| 158 | `if ((prereq as any).facility) {` |
| 159 | `const facilities = (prereq as any).facility;` |

**base.ts (renderer)**
| Line | Code |
|------|------|
| 56 | `return (entry as any).type ?? "entries";` |
| 154 | `if (isEntryObject(entry) && (entry as any).type === "wrapper") {` |
| 155 | `return this._recursiveRender((entry as any).wrapped, textStack, meta, options);` |
| 159 | `if (isEntryObject(entry) && (entry as any).type === "section") {` |
| 337 | `if ((entry as any).entries) {` |
| 484 | `if ((entry as any).entries) {` |
| 485 | `this._renderEntries(entry as any, textStack, meta, options);` |
| 613 | `return (entry.toRoll as any[])` |
| 737 | `if ((spellData as any).spells) {` |
| 738 | `for (const spell of (spellData as any).spells) {` |
| 902 | `const cellObj = cell as any;` |
| 958 | `if ((entry as any).entries) {` |
| 959 | `for (const e of (entry as any).entries) {` |
| 981 | `if ((entry as any).entry) {` |
| 982 | `this._recursiveRender((entry as any).entry, textStack, meta, options);` |
| 984 | `if ((entry as any).entries) {` |
| 985 | `for (const e of (entry as any).entries) {` |
| 1001 | `if ((entry as any).title) {` |
| 1002 | `textStack[0] += \`[Image: ${(entry as any).title}]\n\`;` |

**monster.ts (markdown)**
| Line | Code |
|------|------|
| 392 | `return \`>## ${(mon as any)._displayName \|\| mon.name}\`;` |
| 400-401 | `(mon as any).level` prefix handling |
| 406-407 | `(mon as any).alignmentPrefix` handling |
| 432-433 | `(mon as any).resource` array handling |
| 451-459 | `(mon as any).initiative` handling |
| 471 | `markdownUtils.getRenderedAbilityScores(mon as any, { prefix: ">" });` |
| 485-518 | `(mon.save as any).special`, `(mon.skill as any).*` handling |
| 525-530 | `(mon as any).tool` handling |
| 543-552 | `mon.vulnerable as any[]`, `mon.resist as any[]` |
| 621-624 | `(mon as any).bonus` handling |
| 650-653 | `(mon as any).mythic` handling |
| 691 | `(mon as any)[propNote]` dynamic property access |
| 740-747 | `(mon as any)._displayName`, `(mon as any).legendaryActions` |
| 791-797 | `mon.immune as any[]`, `mon.conditionImmune as any[]` |
| 843-863 | Additional immune/condition/gear handling |

**renderer.ts (markdown)**
| Line | Code |
|------|------|
| 402-405 | `(entry as any).prerequisite` handling |
| 438-458 | `(entry as any).data`, `(item as any).type`, `(item as any).rendered` |
| 482-483 | `(entry as any).intro` handling |
| 558-568 | `(row as any).type`, `(cell as any).type` handling |
| 644-653 | `(entry as any).footnotes`, `(entry as any).outro` handling |
| 754-816 | `(entry as any).entries`, `(entry as any).source`, `(entry as any).page` |
| 865-868 | `(entry as any).entry`, `(entry as any).entries` |
| 929-935 | `(entry as any).title`, `(entry as any).href` |
| 1148 | `const data = spellData as any;` |

---

### 2. `as unknown as` — 41 occurrences (Priority: Medium)

**Hotspots by file**:

| File | Count | Category |
|------|-------|----------|
| `converter.test.ts` | 17 | Test |
| `converter.ts` | 5 | Production |
| `misc-util.test.ts` | 5 | Test |
| `recipe.ts` | 4 | Production |
| `array-util.test.ts` | 4 | Test |
| `deity.ts` | 1 | Production |
| `object.ts` | 1 | Production |
| `vehicle.ts` | 2 | Production |
| `race.ts` | 1 | Production |
| `array-util.ts` | 1 | Production |
| `tags.test.ts` | 2 | Test |

**Common patterns**:
- **Test null handling**: `null as unknown as []`
- **Entry type coercion**: `entry as unknown as Entry`
- **Table structure casting**: `tbl as unknown as EntryTable`

#### Detailed Locations

**converter.ts**
| Line | Code | Context |
|------|------|---------|
| 313 | `buf[i] = this.getConvertedTable(...) as unknown as ConvertedEntry;` | Table to entry |
| 388 | `last(stack)!.items!.push(list as unknown as Entry);` | List to entry |
| 399 | `buf.splice(i, 1, stack[0] as unknown as ConvertedEntry);` | Stack to entry |
| 766 | `return tbl as unknown as EntryTable;` | Internal to public type |
| 771 | `this._postProcessTableInternal(tbl as unknown as ConverterEntryTable, opts);` | Public to internal |

**recipe.ts**
| Line | Code | Context |
|------|------|---------|
| 216 | `renderer.recursiveRender(entry as unknown as Entry, ...);` | Recipe entry casting |
| 251 | `entriesMeta.entryIngredients as unknown as Entry` | Ingredients to entry |
| 269 | `this._renderer.render(entriesMeta.entryEquipment as unknown as Entry)` | Equipment to entry |
| 272 | `this._renderer.render(entriesMeta.entryCooksNotes as unknown as Entry)` | Notes to entry |

**Test files** (array-util.test.ts, misc-util.test.ts, converter.test.ts, tags.test.ts)
- Primarily null/undefined edge case testing
- Result type assertions for parsed data

---

### 3. `@ts-ignore` / `@ts-expect-error` — 0 occurrences

No TypeScript suppression directives in project source code. Only found in `node_modules/` (external deps).

---

## Analysis by Domain

### High-Risk Files (Production Code)

1. **`src/markdown/monster.ts:392-863`** — 32 `as any` casts
   - Monster stat blocks have highly variable structure
   - Many optional/conditional properties accessed unsafely

2. **`src/markdown/renderer.ts:402-1148`** — 27 `as any` casts
   - Entry rendering with polymorphic types
   - Table/list/cell structure handling

3. **`src/renderer/base.ts:56-1002`** — 19 `as any` casts
   - Base renderer with generic entry handling
   - Type discrimination logic using unsafe casts

4. **`src/markdown/charoption.ts:60-119`** — 14 `as any` casts
   - Prerequisite object property access
   - Each prereq type (level, race, ability, etc.) cast separately

### Test Files (Lower Risk)

- `base.test.ts`: 29 casts — mock object creation
- `converter.test.ts`: 17 casts — result assertion checks
- `misc-util.test.ts`: 5 casts — null/undefined edge cases

---

## Root Causes

1. **Missing discriminated union types** — Entry types lack proper `type` discriminators
2. **Incomplete type definitions** — Monster/entry schemas not fully typed
3. **Optional property sprawl** — Many `(obj as any).prop` for optional fields
4. **Test shortcuts** — Mocks bypass type system entirely

---

## Codebase Structure

```
migration/
├── src/                          (748KB)
│   ├── markdown/                 (21 impl, 1 test)
│   │   ├── converter.ts          (Main converter)
│   │   ├── renderer.ts           (Markdown renderer)
│   │   └── 18 entity renderers   (boon, charoption, cult, deity, facility,
│   │                              feat, item, language, legendaryGroup,
│   │                              monster, object, psionic, race, recipe,
│   │                              reward, spell, trap, vehicle)
│   ├── parser/                   (5 impl, 4 test)
│   ├── renderer/                 (8 impl, 5 test)
│   └── util/                     (5 impl, 4 test)
├── dist/
├── tsconfig.json                 (strict: true)
└── package.json
```

---

## Recommendations

| Priority | Action | Files | Est. Casts Fixed |
|----------|--------|-------|------------------|
| P1 | Define `EntryType` discriminated union | `types/`, renderers | ~50 |
| P2 | Type monster stat block schema | `monster.ts`, `parser/monster.ts` | ~35 |
| P3 | Add prerequisite types | `charoption.ts`, `facility.ts` | ~16 |
| P4 | Create test type utilities | `*.test.ts` | ~65 |

---

## Open Questions

1. Are entry types from external schema (5etools JSON)? May need codegen
2. Is `monster.ts` handling legacy + 2024 monster format variants?
3. Should test files have stricter typing or is `as any` acceptable there?
4. Any plans to migrate to Zod/io-ts for runtime validation?
