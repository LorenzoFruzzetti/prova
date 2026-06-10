# CLAUDE.md — Project Instructions for AI Assistants

You are working on a **mobile-first D&D 5e character sheet**. The core application is `dnd-character-sheet.html` — no build step, no server required. It works as a standalone file, but additional companion files in the same directory unlock optional features when served (e.g. via Netlify).

---

## 1. Actual project structure

```
prova/
├── dnd-character-sheet.html              ← core app (HTML + CSS + JS, standalone-capable)
├── character-creator.html                ← character creation wizard (produces JSON for the core app)
├── creature-stat-block.html              ← creature stat block viewer/editor (standalone-capable)
├── shared.js                             ← shared utilities loaded by all HTML pages
├── shared.css                            ← shared CSS (tokens, themes, component classes) loaded by all HTML pages
├── CLAUDE.md                             ← this file (AI instructions)
├── REFERENCE.md                          ← developer reference: CSS tokens, JS functions, state shape
├── REFERENCE-character-creator.md        ← developer reference for the character creator
├── JSONGeneration.md                     ← JSON import/export schema for character sheets
├── stat-blockJsongeneration.md           ← JSON import/export schema for creature stat blocks
├── README.md                             ← user-facing documentation
├── srd2024/                              ← optional: 2024 SRD data files (requires serving)
│   ├── translation.json                  ←   terminology map: 2014↔2024 field names and UI labels
│   ├── spells.json
│   ├── species.json
│   ├── classes.json
│   └── equipment.json
└── examples/
    └── data/
        ├── ernenegilia-warlock.json   ← sample: Aasimar Warlock lv1
        └── seraphina-dawnblade.json   ← sample: Human Paladin lv8
```

There is no build toolchain, no `src/` directory, no `tests/` directory, no `.env/` directory.

### Key files

| File | Purpose |
|---|---|
| `dnd-character-sheet.html` | Core app: HTML + `<style>` + `<script>` in one file |
| `creature-stat-block.html` | Creature stat block viewer/editor: HTML + `<style>` + `<script>` in one file |
| `character-creator.html` | Step-by-step character creation wizard; outputs a `{form,state}` JSON loadable in the core app, or sends it directly to the sheet via localStorage |
| `REFERENCE.md` | CSS tokens, component classes, JS constants, state object shape, all functions for the core app |
| `REFERENCE-character-creator.md` | Developer reference for `character-creator.html`: wizard steps, state shape, all functions |
| `JSONGeneration.md` | JSON field names, types, valid values, full annotated example for **character sheets** |
| `stat-blockJsongeneration.md` | JSON field names, types, valid values, full annotated example for **creature stat blocks** |
| `README.md` | User-facing: how to open, features, input/output, directory map |
| `shared.js` | Utilities shared by all HTML pages: `mod`, `fmtMod`, `profBonus`, spell slot tables, dice functions (`d20Roll`, `rollDiceExpr`, `natMsg`), `genId`, `escHtml`, `switchTab`, `setupSwipe`, `toast`, `showRoll`, `dismissRollResult`, `_applyTheme`, `openInfoPanel`, `dismissInfoPanel`, `infoPanelRoll`, `infoPanelSimpleRoll`, `infoPanelEdit`, `infoPanelAction`, `extractAiPromptSchema`; global `infoPanelCfg` |
| `shared.css` | CSS shared by all HTML pages: `:root` design tokens, all 4 theme overrides, CSS reset, `.feature-row`, `.mini-tracker`, `.slot-dot`, `.spell-item-tag`, `.action-bonus-tag`, `.roll-tri`/`.rtz-*`, `.sp-save-dc-*`, `.sp-atk-*`, `#rollResult`, `#infoPanel`, `.rr-*`, `#toast`, `.hp-dlg-btn`, `.attack-edit-btn`, `.settings-full-btn`, `.cond-toggle-btn` |
| `examples/data/` | Two sample characters for import testing |
| `srd2024/translation.json` | Terminology map between 2014 API field names and 2024 SRD field names / UI labels |
| `srd2024/*.json` | 2024 SRD data files fetched at runtime; absent = feature hidden, not an error |

---

## 2. Application architecture

`dnd-character-sheet.html` is structured as:

```
<link>     — Loads shared.css (design tokens, themes, shared component classes)
<style>    — Page-specific CSS only (layout, page-specific classes, contextual overrides)
<body>     — Static HTML: header, tab bar, 8 panels, all modal overlays
<script src="shared.js">  — Shared utilities (dice, roll overlay, info panel, toast, theme)
<script>   — All page JS: constants, state object, build/calc/handler/persistence functions
```

### State model

Character data lives in two places:
- **`state` object** — structured data (abilities, spells, attacks, features, etc.)
- **HTML form inputs** — flat values read directly by `document.getElementById` (charName, hpMax, AC, etc.)

Both are serialised together by `buildPayload()` → `{ form, state }` and stored in `localStorage` under `dnd5e_roster`.

### Tab panels

Eight tabs in order (used by swipe navigation and `switchTab()`):
`overview` → `abilities` → `combat` → `spells` → `features` → `inventory` → `dice` → `rolls`

The tab bar is an infinite-loop carousel (`setupTabCarousel()`): content swipes navigate with wrap-around, and dragging the tab bar reveals a 2-row grid of all tabs (`setupTabBarExpansion()` → `#tabPushExp`).

### Key entry points

| Function | Role |
|---|---|
| `init()` | Called on `DOMContentLoaded`; loads data, builds all dynamic UI, sets up listeners |
| `applyPayload(payload)` | Used for JSON import; same rebuild sequence as `init()` minus `loadData`/`setupAutoSave` |
| `recalcAll()` | Recomputes all derived values (modifiers, DC, proficiency bonus); calls `saveData()` |
| `saveData()` | Serialises active character and writes to `localStorage` |
| `loadData()` | Restores form + state from `localStorage`; handles legacy migration |

---

## 3. Documentation sync rules

`shared.js` and `shared.css` are companion files that must stay in sync:

| Doc | Covers | Update when |
|---|---|----|  
| `REFERENCE.md` | Shared function signatures, CSS class documentation | Any function added/removed/renamed in `shared.js`, or any CSS class added/removed/renamed in `shared.css` |

`dnd-character-sheet.html` has **two companion docs** that must stay in sync:

| Doc | Covers | Update when |
|---|---|---|
| `REFERENCE.md` | CSS tokens, component classes, JS constants, state shape, all function signatures | Any HTML structure, CSS class, JS function, state key, or data-flow change |
| `JSONGeneration.md` | JSON field names, types, valid values, examples, common mistakes | Any change to `collectFormData()`, `buildPayload()`, or the `state` object shape |

`creature-stat-block.html` has **one companion doc** that must stay in sync:

| Doc | Covers | Update when |
|---|---|---|
| `stat-blockJsongeneration.md` | Creature JSON field names, types, valid values, section schemas, full annotated example | Any change to `defaultCreature()`, `_defaultActionItem()`, `saveEditPanel()`, `parseSrd2024Monster()`, or the AI prompt in `generateAndCopyCreaturePrompt()` |

**Every feature addition or change must include the corresponding documentation update in the same commit.** Do not leave REFERENCE.md, JSONGeneration.md, or stat-blockJsongeneration.md lagging behind the code.

### Conflict resolution: code wins

When any companion doc describes something that contradicts what the actual code does, **the code is the source of truth**. Update the documentation to match the code — never change the code just to match a stale doc entry. If you notice a conflict while working on a task, fix the doc entry as part of that task even if the doc change was not explicitly requested.

### Pre-commit checklist for `dnd-character-sheet.html` changes

1. **New form field** (new `id` + added to `collectFormData()`):
   - Add to the `form` field reference table in `JSONGeneration.md`
   - Add to the annotated example in `JSONGeneration.md` if relevant
   - If it drives a derived value, note it in the `recalcAll()` row of `REFERENCE.md`

2. **State object changed** (new key, or changed type):
   - Update the `state` object block in `REFERENCE.md`
   - Update the `state` field reference section in `JSONGeneration.md`
   - Update the complete annotated example in `JSONGeneration.md`

3. **New JS function added or renamed**:
   - Add/update the entry in the relevant function table in `REFERENCE.md`
     (Build · Calculation · Interaction handlers · Roll result · Undo · Persistence · Roster · Utility · AI/SRD Import)

4. **New CSS class added or renamed**:
   - Add/update the entry in the Key component classes table in `REFERENCE.md`
   - If it is a new design token (`--variable`), add it to the Design tokens table

5. **New tab or panel added**:
   - Update the Top-level layout diagram in `REFERENCE.md`
   - Update the Initialisation flow section if new build functions are needed

6. **New skill, condition, or class option added**:
   - Update the valid values list in `JSONGeneration.md`

---

## 4. Development conventions

### No build step
Open `dnd-character-sheet.html` directly in a browser. There is no transpilation, bundling, or npm. Test changes by refreshing the page.

### Progressive enhancement — feature tiers

The app has two tiers:

| Tier | What is required | Features available |
|---|---|---|
| **Standalone** | `dnd-character-sheet.html` only | All core sheet functionality: character creation/editing, spells, attacks, features, dice rolls, localStorage save/load, JSON export, JSON file import |
| **Served** (Netlify / local server) | HTML + companion files in same directory | Everything above, plus: 2024 SRD lookup (requires `srd2024/*.json`), 2014 SRD lookup (requires internet) |

**Rules for companion files:**
- Companion files are primarily **data assets** (`.json`). However, shared utility logic and CSS needed by more than one HTML file **may** be extracted into external `.js` and `.css` files (`shared.js`, `shared.css`) and loaded with `<script src="shared.js">` and `<link rel="stylesheet" href="shared.css">`. Logic or CSS that is only used by a single HTML file should remain inline in that file.
- The `srd2024/translation.json` file is the single source of truth for 2014↔2024 terminology differences (endpoint aliases, field name aliases, UI label overrides). Do not scatter edition-specific string checks through the main code.

This model is consistent with existing precedent: the SRD tab already requires internet (graceful degradation when offline), and the AI-assisted import workflow already references `JSONGeneration.md` as an external document.

### State vs form inputs
- Store structured, typed data in `state` (arrays, booleans, integers).
- Store flat string values in HTML `<input>` elements (read with `document.getElementById(id).value`).
- Never duplicate data between `state` and form inputs.
- Do not store derived values (modifiers, save DC, proficiency bonus) — always recalculate them.

### CSS tokens
Use the `:root` CSS variables (`--bg`, `--gold`, `--surface`, etc.) rather than hardcoded colours. Themes work by overriding these variables on `[data-theme]` selectors. Never add a new hardcoded colour without adding a token first.

### Interaction model (tap/hold)
All interactive rows follow the same pattern:
- **Tap** → roll directly if the item is rollable; open info panel otherwise
- **Hold (500 ms)** → always open the info/view panel

Timers are `pointerdown`-started and cleared on `pointerup`/`pointercancel`.

### Undo
Use `pushUndo(action)` before any state mutation that should be undoable. The `undoStack` is session-only (not persisted). Maximum 50 entries.

### localStorage keys
| Key | Contents |
|---|---|
| `dnd5e_roster` | Full roster: `{ chars: { [id]: { name, payload } }, activeId }` |
| `dnd5e_fontsize` | Font size index (integer) |
| `dnd5e_lefty` | Lefty mode flag (boolean) |
| `dnd5e_theme` | Active theme key (string) |
| `srd_v1_*` | SRD API response cache entries |
| `dnd5e_pending_import` | Transient: payload written by `character-creator.html`; consumed and removed by `dnd-character-sheet.html` on next load |

### SRD integration

Two SRD sources are supported:

| Source | Endpoint | Requires | Cache key prefix |
|---|---|---|---|
| 2014 SRD (dnd5eapi.co) | `https://www.dnd5eapi.co/api/<path>` | Internet | `srd_v1_` |
| 2024 SRD (local) | `/srd2024/<file>.json` | Served + companion files present | `srd24_v1_` |

`_srdGet(path)` checks `localStorage` first; on miss it fetches and caches the response. The translation layer (`srd2024/translation.json`) is loaded once on first 2024 SRD use and cached in memory; it maps 2014 endpoint paths and response field names to their 2024 equivalents, and provides UI label overrides (e.g. `"Race" → "Species"`). If `translation.json` cannot be fetched, 2024 SRD lookup is disabled silently.

---

## 5. README.md requirements

`README.md` must always contain:
1. **How to run** — exact OS commands and browser instructions
2. **Features** — a summary table
3. **Settings** — what the ⚙ button exposes
4. **Expected input** — JSON schema overview, link to `JSONGeneration.md`
5. **Expected output** — localStorage + file download behaviour
6. **Directory map** — accurate paths relative to project root

Update `README.md` whenever new features, settings, or input/output behaviour changes.

---

## 6. Examples

Sample JSON files live in `examples/data/`. Each file is a complete `{ form, state }` payload loadable via ⚙ → Load Character.

| File | Character | Demonstrates |
|---|---|---|
| `examples/data/ernenegilia-warlock.json` | Ernenegilia, Aasimar Warlock lv1 | Cantrips with `attackRoll`/`rollDamage`, Hex with concentration + bonus-action combat, Pact of the Chain trait, minimal currency |
| `examples/data/seraphina-dawnblade.json` | Seraphina Dawnblade, Human Paladin lv8 | Multi-slot spellcasting, `classFeatures` with `step`, `infoTraits` with `showInCombat`, portrait field, full proficiency/expertise setup |

When adding a new example: document what it demonstrates in this table and in `examples/README.md` (create the file if it does not exist yet).

---

## 7. What is intentionally absent

The following directories are referenced in older docs but **do not exist** in this repo:

- `src/` — no separate source directory; everything is in the HTML file
- `tests/` — no automated test suite
- `.env/` — no environment configuration needed
- `temp_image/`, `temporary_files/`, `debugging_scripts/` — scratch directories not committed

Do not create these directories unless there is a concrete need. Do not reference them in documentation.

---

## 9. Known Issues Fixed

- Date: 2026-05-27
- File: `shared.js`
- Problem: Declared `const DAMAGE_RESIST_TYPES` (and related resistance helpers) that were already declared in `dnd-character-sheet.html`, causing a global redeclaration runtime error (`Identifier 'DAMAGE_RESIST_TYPES' has already been declared`). This halted inline script initialization and made multiple UI features appear missing (e.g. Settings/Import panel actions, hit dice/resistance rendering).
- Fix applied: Removed the duplicated damage resistance constant/functions from `shared.js`, keeping the page-specific implementation only in `dnd-character-sheet.html`.

---

- Date: 2026-05-27
- Files: `shared.css` (new), `shared.js` (expanded), `dnd-character-sheet.html`, `creature-stat-block.html`
- Change: Major CSS/JS refactoring to unify the info panel, roll overlay, toast, and theme system across both HTML apps.
- What moved to `shared.css`: `:root` design tokens, all 4 `[data-theme]` overrides, CSS reset, `.feature-row` + sub-elements, `.mini-tracker`/`.mini-btn`/`.mini-val`, `.slot-dot`, `.spell-item-tag`, `.action-bonus-tag`, `.roll-tri`/`.rtz-*`, `.sp-save-dc-*`, `.sp-atk-*`, `#rollBackdrop`/`#rollResult`/`.rr-*`, `#infoPanelBackdrop`/`#infoPanel`/`.sp-mode-badge`/`.sp-name`/`.sp-meta`/`.sp-description`/`.sp-dismiss-hint`, `#toast`, `.hp-dlg-btn`, `.attack-edit-btn`, `.settings-full-btn`, `.cond-toggle-btn`.
- What moved to `shared.js`: `toast`, `showRoll`, `dismissRollResult`, `_applyTheme`, `infoPanelCfg` declaration, `openInfoPanel`, `dismissInfoPanel`, `infoPanelRoll`, `infoPanelSimpleRoll`, `infoPanelDmg` (alias for `infoPanelSimpleRoll`), `infoPanelEdit`, `infoPanelAction`.
- `creature-stat-block.html` `openActionInfoPanel`, `openCreatureInfoPanel`, `openSectionInfoPanel` rewritten to call the shared `openInfoPanel()` using the `cfg` object API.
- Note: `#ipDmgBox`/`#ipDmgLabel`/`#ipDmgDice` IDs in creature HTML were renamed to `#ipSimpleRollBox`/`#ipSimpleRollLabel`/`#ipSimpleRollBonus` to match the character sheet's element IDs.
