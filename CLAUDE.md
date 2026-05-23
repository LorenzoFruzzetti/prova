# CLAUDE.md — Project Instructions for AI Assistants

You are working on a **single-file mobile-first D&D 5e character sheet**. The entire application is `dnd-character-sheet.html` — no build step, no dependencies, no server required.

---

## 1. Actual project structure

```
prova/
├── dnd-character-sheet.html   ← the entire application
├── CLAUDE.md                  ← this file (AI instructions)
├── REFERENCE.md               ← developer reference: CSS tokens, JS functions, state shape
├── JSONGeneration.md          ← JSON import/export schema specification
├── README.md                  ← user-facing documentation
└── examples/
    └── data/
        ├── ernenegilia-warlock.json   ← sample: Aasimar Warlock lv1
        └── seraphina-dawnblade.json   ← sample: Human Paladin lv8
```

There is no build toolchain, no `src/` directory, no `tests/` directory, no `.env/` directory. Everything is in one HTML file.

### Key files

| File | Purpose |
|---|---|
| `dnd-character-sheet.html` | The complete app: HTML + `<style>` + `<script>` in one file |
| `REFERENCE.md` | CSS tokens, component classes, JS constants, state object shape, all functions |
| `JSONGeneration.md` | JSON field names, types, valid values, full annotated example |
| `README.md` | User-facing: how to open, features, input/output, directory map |
| `examples/data/` | Two sample characters for import testing |

---

## 2. Application architecture

`dnd-character-sheet.html` is structured as:

```
<style>    — All CSS (variables, component classes, theme overrides)
<body>     — Static HTML: header, tab bar, 8 panels, all modal overlays
<script>   — All JS: constants, state object, build/calc/handler/persistence functions
```

### State model

Character data lives in two places:
- **`state` object** — structured data (abilities, spells, attacks, features, etc.)
- **HTML form inputs** — flat values read directly by `document.getElementById` (charName, hpMax, AC, etc.)

Both are serialised together by `buildPayload()` → `{ form, state }` and stored in `localStorage` under `dnd5e_roster`.

### Tab panels

Eight tabs in order (used by swipe navigation and `switchTab()`):
`overview` → `abilities` → `skills` → `combat` → `spells` → `features` → `inventory` → `rolls`

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

`dnd-character-sheet.html` has **two companion docs** that must stay in sync:

| Doc | Covers | Update when |
|---|---|---|
| `REFERENCE.md` | CSS tokens, component classes, JS constants, state shape, all function signatures | Any HTML structure, CSS class, JS function, state key, or data-flow change |
| `JSONGeneration.md` | JSON field names, types, valid values, examples, common mistakes | Any change to `collectFormData()`, `buildPayload()`, or the `state` object shape |

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

### Single-file discipline
Keep all HTML, CSS, and JS in `dnd-character-sheet.html`. Do not create external `.css`, `.js`, or module files.

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

### SRD API
The SRD tab in the Import modal calls `https://www.dnd5eapi.co/api/<path>` with `localStorage` caching. Responses are cached under keys prefixed `srd_v1_`. Requires internet; the rest of the app works fully offline.

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
