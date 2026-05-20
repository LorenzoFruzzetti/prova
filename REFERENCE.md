# REFERENCE — D&D Character Sheet Code Structure

**File:** `dnd-character-sheet.html`
A self-contained single-file application. No build step, no dependencies. Open directly in any browser.

---

## Top-level layout

```
dnd-character-sheet.html
├── <style>          CSS — variables, component classes
├── <body>
│   ├── .header      Sticky top bar (title, Save/Load buttons, character name, meta)
│   ├── input#jsonFileInput   Hidden file picker for JSON import
│   ├── .tab-bar     Six sticky tab buttons (Info / Stats / Skills / Combat / Spells / Gear)
│   ├── #panel-overview    Tab: character info + personality + features
│   ├── #panel-abilities   Tab: ability scores + saving throws + passive perception + conditions
│   ├── #panel-skills      Tab: 18 skills with proficiency/expertise dots
│   ├── #panel-combat      Tab: HP tracker + combat stats + inspiration + death saves + attacks
│   ├── #panel-spells      Tab: spellcasting ability + spell slots + spell list textarea
│   ├── #panel-inventory   Tab: currency + equipment + proficiencies + notes
│   └── #toast       Floating feedback message
└── <script>         All application logic (no external libraries)
```

---

## CSS architecture

### Design tokens (`:root` variables)

| Variable | Value | Role |
|---|---|---|
| `--bg` | `#1a1410` | Page background |
| `--surface` | `#2a2018` | Card/section background |
| `--surface2` | `#352a1e` | Section title strip |
| `--border` | `#5c4a2a` | All borders |
| `--gold` | `#c9a84c` | Primary accent, labels |
| `--gold-light` | `#e8c96a` | Values, active states |
| `--red-light` | `#e74c3c` | Damage, failures, danger HP |
| `--green` | `#27ae60` | Healthy HP, successes |
| `--text` | `#e8d9b8` | Body text |
| `--text-muted` | `#9a8a6a` | Labels, secondary info |
| `--radius` | `8px` | Shared border-radius |

### Key component classes

| Class | Purpose |
|---|---|
| `.header` | Sticky top bar; `z-index: 100` |
| `.header-top` | Flex row inside header (title left, buttons right) |
| `.header-btn` | Save / Load buttons in the header |
| `.tab-bar` | Sticky tab strip below header; `z-index: 99` |
| `.tab-btn` | Individual tab button; `.active` adds gold underline |
| `.panel` | Tab content area; hidden by default; `.active` shows it |
| `.section` | Grouped content card (border + radius) |
| `.section-title` | Dark strip title bar inside a `.section` |
| `.section-body` | Padded content area inside a `.section` |
| `.field-row` | CSS grid row for form inputs; `.col-2` / `.col-3` variants |
| `.ability-grid` | 3-column grid of ability score cards |
| `.ability-card` | One ability score (name, large modifier, score input) |
| `.check-list` | Unstyled `<ul>` for saving throws and skills |
| `.check-item` | One row: dots + modifier + name + ability tag |
| `.check-item.proficient` | Fills the first (or only) prof dot gold |
| `.check-item.expert` | Fills both dots in `.prof-dots` gold-light |
| `.prof-dot` | Single circular dot (14 px) used in saving throws |
| `.prof-dots` | Flex container with two `.prof-dot`s used in skills |
| `.hp-tracker` | Flex row: minus button — HP display — plus button |
| `.hp-bar` / `.hp-bar-fill` | Visual HP percentage bar |
| `.stat-pills` | 3-column grid of combat stat tiles |
| `.stat-pill` | One combat stat tile (value + label) |
| `.death-saves` | Side-by-side success/failure dot groups |
| `.save-dot` | 22 px circle; `.filled` colors it green or red |
| `.spell-level-row` | One spell-slot level row (label + dots + max input) |
| `.slot-dot` | 18 px circle; `.available` = gold filled, `.used` = faded |
| `.attack-row` | 3-column grid: name / bonus / damage |
| `.condition-tag` | Pill chip; `.active` turns it red |
| `.currency-grid` | 5-column grid for CP/SP/EP/GP/PP |
| `#toast` | Fixed floating feedback pill; `.show` fades it in |

---

## JavaScript architecture

### Constants

```js
ABILITIES       // ['STR','DEX','CON','INT','WIS','CHA']
ABILITY_NAMES   // Full names (unused in UI, available for reference)
SAVES           // [{name, ab}] — 6 saving throw definitions
SKILLS          // [{name, ab}] — 18 skill definitions
CONDITIONS      // 15 condition strings
SPELL_SLOTS_DEFAULT  // [{level, max}] — 9 levels, all max:0 except 1st:2
```

### Runtime state object

```js
let state = {
  abilities:          { STR, DEX, CON, INT, WIS, CHA },  // integers 1–30
  saveProficiencies:  [],   // ability keys e.g. ['STR', 'CON']
  skillProficiencies: [],   // skill names e.g. ['Perception']
  skillExpertise:     [],   // skill names (subset of skillProficiencies)
  inspiration:        false,
  hpCurrent:          10,
  spellSlots:         [ { level, max, used } ],  // 9 entries
  attacks:            [ { name, bonus, damage } ],
  conditions:         [],   // condition name strings
}
```

All other values (character name, HP max, AC, etc.) live in HTML form inputs and are read directly via `document.getElementById`.

---

### Initialisation flow

```
DOMContentLoaded
  └─ init()
       ├─ loadData()          restore state + form fields from localStorage
       ├─ buildAbilityGrid()  inject ability score cards into #abilityGrid
       ├─ buildSavingThrows() inject saving throw rows into #savingThrowsList
       ├─ buildSkillsList()   inject skill rows into #skillsList
       ├─ buildConditions()   inject condition chips into #conditionsGrid
       ├─ buildSpellSlots()   inject spell-slot rows into #spellSlotsBody
       ├─ recalcAll()         compute all derived values (modifiers, DC, etc.)
       └─ setupAutoSave()     attach input/change listeners → saveData()
  └─ updateHeader()
  └─ updateHP()
  └─ renderAttacks()
  └─ set inspiration button state
```

`applyPayload(payload)` runs the same sequence (minus `loadData` and `setupAutoSave`) and is used for JSON import.

---

### Build functions

| Function | What it renders | Reads from |
|---|---|---|
| `buildAbilityGrid()` | 6 ability cards with score inputs | `state.abilities` |
| `buildSavingThrows()` | 6 saving throw rows | `state.saveProficiencies` |
| `buildSkillsList()` | 18 skill rows with 2 dots each | `state.skillProficiencies`, `state.skillExpertise` |
| `buildConditions()` | 15 condition chips | `state.conditions` |
| `buildSpellSlots()` | 9 spell-level rows | `state.spellSlots` |
| `renderSlotDots(i)` | Dot row for one spell level | `state.spellSlots[i]` |
| `renderAttacks()` | Attack rows or empty placeholder | `state.attacks` |

---

### Calculation functions

| Function | Description |
|---|---|
| `mod(score)` | `Math.floor((score - 10) / 2)` — D&D ability modifier formula |
| `fmtMod(m)` | Formats integer as `+2` or `-1` |
| `getProfBonus()` | `Math.ceil(level / 4) + 1` — proficiency bonus from level |
| `recalcAll()` | Recomputes ability modifiers, saving throw modifiers, skill modifiers, passive perception, initiative, spell attack bonus, spell save DC; calls `saveData()` at the end |

---

### Interaction handlers

| Function | Trigger | Effect |
|---|---|---|
| `onAbilityInput(ab, val)` | Ability score input | Updates `state.abilities[ab]`, calls `recalcAll()` |
| `toggleSaveProf(ab, el)` | Tap saving throw row | Toggles ability key in `state.saveProficiencies` |
| `cycleSkillProf(name, el)` | Tap skill row | Cycles: None → Proficient → Expert → None |
| `adjustHP(delta)` | +/− HP buttons | Clamps `state.hpCurrent` to `[0, max]`, calls `updateHP()` |
| `updateHP()` | Max/Temp HP input or `adjustHP` | Refreshes HP display, bar, and color |
| `setSlotMax(i, val)` | Spell slot max input | Updates `state.spellSlots[i].max`, rerenders dots |
| `toggleSlot(i, j)` | Tap spell slot dot | Toggles `state.spellSlots[i].used` |
| `addAttack()` | "+ Add Attack" button | `prompt()` dialog → pushes to `state.attacks` |
| `removeAttack(i)` | Tap attack row | `confirm()` dialog → splices `state.attacks` |
| `toggleCondition(name, el)` | Tap condition chip | Toggles name in `state.conditions` |
| `toggleInspiration()` | Tap inspiration button | Flips `state.inspiration` boolean |
| `toggleDeathSave(dot, type)` | Tap death save dot | Toggles `.filled` class on the dot element |

#### Skill proficiency cycle detail
```
tap 1: None       → Proficient  (add to skillProficiencies)
tap 2: Proficient → Expert      (add to skillExpertise; keep in skillProficiencies)
tap 3: Expert     → None        (remove from BOTH skillExpertise and skillProficiencies)
```

---

### Persistence functions

| Function | Description |
|---|---|
| `collectFormData()` | Reads all 29 form input values by element ID into a plain object |
| `buildPayload()` | Returns `{ form, state }` — the canonical serialisation format |
| `saveData()` | Writes `buildPayload()` to `localStorage` key `dnd5e_sheet` |
| `loadData()` | Reads from `localStorage`, populates form fields and `state` (no UI rebuild) |
| `exportToJSON()` | Downloads `buildPayload()` as `<charname>.json` via a temporary `<a>` element |
| `importFromJSON(input)` | Reads a `.json` file with `FileReader`, calls `applyPayload()` + `saveData()` |
| `applyPayload(payload)` | Applies a payload object: restores form fields, updates `state`, rebuilds all dynamic UI |

---

### Utility functions

| Function | Description |
|---|---|
| `updateHeader()` | Reads name/class/race/level inputs → updates sticky header display |
| `switchTab(id)` | Removes `.active` from all panels/buttons, adds to selected |
| `toast(msg)` | Shows floating message for 2 seconds |
| `setupAutoSave()` | Attaches `saveData` as `input` + `change` listener to every form element |

---

## Adding a new field — checklist

1. Add the HTML input with a unique `id` to the relevant panel.
2. Add the `id` string to the array inside `collectFormData()`.
3. If the field affects a derived value (modifier, DC), update `recalcAll()`.
4. If the field needs dynamic rendering, add a build function and call it from `init()` and `applyPayload()`.
5. Update `REFERENCE.md` (this file) and `JSONGeneration.md`.
