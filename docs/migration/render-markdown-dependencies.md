# RendererMarkdown Migration Dependencies

Analysis of files required to migrate `RendererMarkdown` to another project.

## Core Dependencies

| File | Classes/Objects Used |
|------|---------------------|
| `js/render.js` | `Renderer` (base class), `Renderer.stripTags`, `Renderer.table.*`, `Renderer.monster.*`, `Renderer.spell.*`, `Renderer.item.*`, `Renderer.vehicle.*`, etc. |
| `js/parser.js` | `Parser` - many methods: `attrChooseToFull`, `attackTypeToFull`, `monTypeToFullObj`, `acToFull`, `getSpeedString`, `spLevelSchoolMetaToFull`, `spTimeListToFull`, etc. |
| `js/utils.js` | `MiscUtil` (`copy`, `copyFast`, `getWalker`), `StrUtil` (`padNumber`), `SortUtil` (`ascSort`, `ascSortAtts`), `DataUtil` (`monster.getLegendaryGroup`, `proxy.unpackUid`), `UrlUtil`, global prototypes (`uppercaseFirst`, `toTitleCase`, `joinConjunct`) |

## Configuration Dependencies

| File | Classes/Objects Used |
|------|---------------------|
| `js/utils-config.js` / `js/utils-config/utils-config-config.js` | `VetoolsConfig.get()` - for markdown settings, style switching |
| `js/utils-config/utils-config-ui.js` | `ConfigUi.show()` - settings modal |

## Dependency Graph

```
RendererMarkdown
├── render.js (Renderer base class)
│   └── Renderer.* static methods
├── parser.js (Parser)
│   └── D&D-specific parsing/formatting
├── utils.js
│   ├── MiscUtil (copy, copyFast, getWalker)
│   ├── StrUtil (padNumber)
│   ├── SortUtil (ascSort, ascSortAtts)
│   ├── DataUtil (monster.getLegendaryGroup, proxy.unpackUid)
│   └── Global prototypes (String, Array extensions)
└── utils-config.js (optional)
    └── VetoolsConfig, ConfigUi
```

## Specific Dependencies by Feature

### RendererMarkdown Core
- `Renderer` (render.js) - base class inheritance
- `MiscUtil.copy/copyFast/getWalker` (utils.js)
- `Renderer.stripTags` (render.js)
- `Renderer.splitByTags/splitFirstSpace/splitTagByPipe` (render.js)

### Monster Rendering
- `Parser.monTypeToFullObj/acToFull/getSpeedString/getFullImmRes` (parser.js)
- `Renderer.monster.*` (render.js)
- `DataUtil.monster.getLegendaryGroup` (utils.js)
- `SortUtil.ascSortAtts` (utils.js)

### Spell Rendering
- `Parser.spLevelSchoolMetaToFull/spTimeListToFull/spRangeToFull` (parser.js)
- `Renderer.spell.getCombinedClasses` (render.js)

### Item Rendering
- `Parser.itemValueToFullMultiCurrency/itemWeightToFull` (parser.js)
- `Renderer.item.*` (render.js)

### Table Conversion (MarkdownConverter)
- `Renderer.ENTRIES_WITH_CHILDREN` (render.js)
- `Renderer.stripTags` (render.js)
- `SortUtil.ascSort` (utils.js)

## Files to Copy

### Required (minimum)
1. `js/render-markdown.js` - main file
2. `js/render.js` - Renderer base class
3. `js/parser.js` - Parser utilities
4. `js/utils.js` - Core utilities

### Optional (for full config support)
5. `js/utils-config.js`
6. `js/utils-config/utils-config-config.js`
7. `js/utils-config/utils-config-ui.js`

## Migration Notes

### VetoolsConfig Stubbing
If you don't need the full config system, stub it:
```javascript
globalThis.VetoolsConfig = {
    get: (group, key) => {
        const defaults = {
            "markdown": { "tagRenderMode": "convertMarkdown", "isAddColumnBreaks": false, "isAddPageBreaks": false },
            "styleSwitcher": { "style": "classic" }
        };
        return defaults[group]?.[key];
    }
};
```

### Global Prototypes (utils.js)
These are added to built-in prototypes and must be included:
- `String.prototype.uppercaseFirst`
- `String.prototype.toTitleCase`
- `String.prototype.lowercaseFirst`
- `Array.prototype.last`
- `Array.prototype.joinConjunct`

### Heavy Dependencies
- **render.js** is the largest dependency (~8000+ lines)
- **parser.js** contains D&D-specific parsing logic
- Consider extracting only needed methods if size is a concern

### DataUtil Usage
- `DataUtil.monster.getLegendaryGroup` - only for legendary monster groups
- `DataUtil.proxy.unpackUid` - for tool proficiency parsing in monsters
- Can be stubbed if not rendering monsters with these features

## Entity-Specific Renderers

`RendererMarkdown` includes sub-renderers for many entity types:
- `RendererMarkdown.monster` - creature statblocks
- `RendererMarkdown.spell` - spell entries
- `RendererMarkdown.item` - magic items
- `RendererMarkdown.legendaryGroup` - legendary groups
- `RendererMarkdown.object` - objects
- `RendererMarkdown.vehicle` - vehicles (ships, spelljammers, infernal war machines)
- `RendererMarkdown.race` - races
- `RendererMarkdown.feat` - feats
- `RendererMarkdown.optionalfeature` - optional features
- `RendererMarkdown.reward` - rewards
- `RendererMarkdown.deity` - deities
- `RendererMarkdown.language` - languages
- `RendererMarkdown.psionic` - psionics
- `RendererMarkdown.cult` / `RendererMarkdown.boon` - cults and boons
- `RendererMarkdown.charoption` - character options
- `RendererMarkdown.recipe` - recipes
- `RendererMarkdown.facility` - bastion facilities
- `RendererMarkdown.trap` / `RendererMarkdown.hazard` - traps and hazards

You can remove unused sub-renderers to reduce complexity.
