# REFERENCE — D&D Character Sheet Code Structure

**File:** `dnd-character-sheet.html`
A self-contained single-file application. No build step, no dependencies. Open directly in any browser.

---

## Top-level layout

```
dnd-character-sheet.html
├── <style>          CSS — variables, component classes
├── <body>
│   ├── .header      Sticky top bar (title, Undo/Save/Load buttons, character name, meta)
│   ├── input#jsonFileInput   Hidden file picker for JSON import
│   ├── .tab-bar     Eight sticky tab buttons (Info / Stats / Skills / Combat / Spells / Features / Gear / Rolls)
│   │                Each button carries data-tab="<id>" for programmatic activation
│   ├── #panel-overview    Tab: character info + personality + features + Long Rest button
│   ├── #panel-abilities   Tab: ability scores + saving throws + passive perception + conditions
│   ├── #panel-skills      Tab: 18 skills with proficiency/expertise dots
│   ├── #panel-combat      Tab: HP tracker + combat stats + hit dice tracker + inspiration + death saves + attacks
│   ├── #panel-spells      Tab: spellcasting ability + spell slots (with ↺ All) + spell list textarea
│   ├── #panel-features    Tab: limited-use class features with dot trackers and +/− controls
│   ├── #panel-inventory   Tab: currency + equipment + proficiencies + notes
│   ├── #panel-rolls       Tab: session roll history log with Clear button
│   ├── #hpBackdrop  Fixed backdrop for HP dialog
│   ├── #hpDialog    Bottom-sheet for setting HP to a specific value
│   ├── #stepBackdrop  Fixed backdrop for feature editor sheet
│   ├── #stepMenu    Bottom-sheet for adding/editing a class feature (name, max, step, recharge)
│   ├── #rollBackdrop  Fixed backdrop for roll result overlay
│   ├── #rollResult  Fixed centered overlay showing the last roll result
│   └── #toast       Floating feedback message (non-roll events only)
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
| `.header-btn` | Undo / Save / Load buttons in the header; `:disabled` reduces opacity |
| `.tab-bar` | Sticky tab strip below header; `z-index: 99`; horizontally scrollable |
| `.tab-btn` | Individual tab button; `.active` adds gold underline |
| `.panel` | Tab content area; hidden by default; `.active` shows it |
| `.section` | Grouped content card (border + radius) |
| `.section-title` | Dark strip title bar inside a `.section` |
| `.section-body` | Padded content area inside a `.section` |
| `.field-row` | CSS grid row for form inputs; `.col-2` / `.col-3` variants |
| `.ability-grid` | 3-column grid of ability score cards |
| `.ability-card` | One ability score (name, large modifier, score input); tap to roll d20 + modifier |
| `.check-list` | Unstyled `<ul>` for saving throws and skills |
| `.check-item` | One row: dots + modifier + name + ability tag; tap row to roll, tap dot to toggle prof |
| `.check-item.proficient` | Fills the first (or only) prof dot gold |
| `.check-item.expert` | Fills both dots in `.prof-dots` gold-light |
| `.prof-dot` | Single circular dot (14 px) used in saving throws; tap to toggle proficiency |
| `.prof-dots` | Flex container with two `.prof-dot`s used in skills; tap to cycle prof |
| `.hp-display` | Flex center area showing current HP, max, and bar; tap to open HP dialog |
| `.hp-bar` / `.hp-bar-fill` | Visual HP percentage bar |
| `.stat-pills` | 3-column grid of combat stat tiles |
| `.stat-pill` | One combat stat tile (value + label) |
| `.stat-pill.rollable` | Adds `cursor:pointer` and gold border on active; tap to roll |
| `.death-saves` | Side-by-side success/failure dot groups |
| `.save-dot` | 22 px circle; `.filled` colors it green or red |
| `.spell-level-row` | One spell-slot level row (label + dots + mini tracker + max input) |
| `.slot-dot` | 18 px circle; `.available` = gold left (remaining), `.used` = grey right (expended) |
| `.mini-tracker` | Flex row grouping `[−][counter][+]` tightly together |
| `.mini-btn` | 38 px circular button for mini trackers; `.minus` = red, `.plus` = green |
| `.mini-val` | Small `n/max` counter label inside a mini tracker |
| `.feature-row` | One class feature block (header + track row + optional step hint) |
| `.feature-header` | Flex row: name · recharge · ↺ · Edit · ✕ buttons |
| `.feature-name` | Gold-light bold feature name inside the header |
| `.feature-recharge` | Italic muted recharge label (e.g. "Short Rest") |
| `.feature-track` | Flex row: dots · mini tracker · max input |
| `.feature-dots` | Wrapping flex container for feature `.slot-dot`s |
| `.feature-step-hint` | Tiny italic label shown below track row when step > 1 (e.g. "5 pts/dot") |
| `.fe-label` | Small uppercase label inside the feature editor sheet |
| `.fe-input` | Compact text/number input inside the feature editor sheet (15 px font) |
| `.fe-row2` | Two-column grid inside the feature editor sheet (Max + Step fields) |
| `.attack-row` | 4-column grid: name / bonus / damage / delete; `cursor:pointer`; tap to roll |
| `.attack-row.del-ready` | Shows the bin button for that row (long-press reveal) |
| `.attack-del` | 🗑 bin button; hidden by default; shown via `.del-ready` or `#attackList.delete-all` |
| `.attack-edit-btn` | Edit/Done toggle button in the Attacks section title |
| `.condition-tag` | Pill chip; `.active` turns it red |
| `.currency-grid` | 5-column grid for CP/SP/EP/GP/PP |
| `#toast` | Fixed floating feedback pill (2 s); `.show` fades it in; used for non-roll events |
| `#rollBackdrop` | Fixed full-screen dim layer behind the roll result; tap to dismiss |
| `#rollResult` | Fixed centered card showing label, large total, breakdown, damage, nat callout |
| `.rr-label` | Small uppercase label inside roll result (e.g. "Strength Check") |
| `.rr-total` | 80 px bold total number inside roll result |
| `.rr-breakdown` | Dice breakdown line (e.g. "d20(14) +4 = 18") |
| `.rr-secondary` | Optional secondary line (e.g. damage for attacks) |
| `.rr-nat` | Nat 20 / Nat 1 callout line |
| `.roll-log-entry` | One row in the Rolls tab history list |
| `.roll-log-lbl` | Roll label (left) |
| `.roll-log-total` | Roll total (bold, gold) |
| `.roll-log-time` | Timestamp (right, muted) |
| `.roll-log-sub` | Breakdown + nat callout on the second line |
| `#hpBackdrop` | Fixed dim layer behind the HP dialog; tap to dismiss |
| `#hpDialog` | Bottom-sheet for setting HP to a specific value; slides up on open |
| `.hp-dlg-input` | Large centered number input inside the HP dialog (36 px font) |
| `.hp-dlg-btn` | Cancel / confirm buttons; `.primary` styles the confirm button |
| `#stepBackdrop` | Fixed dim layer behind the feature editor sheet; tap to dismiss |
| `#stepMenu` | Bottom-sheet for adding or editing a class feature; contains Name, Max, Step, Recharge fields |
| `#settingsBackdrop` | Fixed dim layer behind the settings sheet; tap to dismiss |
| `#settingsMenu` | Bottom-sheet opened by the ⚙ Settings header button; contains Save, Load, font-size, and lefty-mode controls |
| `.settings-full-btn` | Full-width action button inside the settings sheet (Save / Load) |
| `.settings-divider` | Thin horizontal rule separating sections inside the settings sheet |
| `.settings-row` | Flex row pairing a label+sub-label on the left with a control on the right |
| `.font-ctrl` | Flex row grouping `[−][value][+]` for the font-size control |
| `.font-ctrl-btn` | 36 px circular `−`/`+` buttons for font-size adjustment |
| `.font-ctrl-value` | Gold-light bold label showing current font size percentage |
| `.settings-toggle` | Pill-shaped On/Off toggle button; `.on` styles it gold when active |
| `.tracker-row` | Flex row wrapping hit-dice dots + mini-tracker (replaces inline flex style) |
| `body.lefty` | Applied when lefty mode is on; swaps CSS `order` of dots and mini-tracker in every tracker row |

---

## JavaScript architecture

### Constants

```js
ABILITIES       // ['STR','DEX','CON','INT','WIS','CHA']
ABILITY_NAMES   // ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma']
SAVES           // [{name, ab}] — 6 saving throw definitions
SKILLS          // [{name, ab}] — 18 skill definitions
CONDITIONS      // 15 condition strings
SPELL_SLOTS_DEFAULT  // [{level, max}] — 9 levels, all max:0 except 1st:2
TABS            // ['overview','abilities','skills','combat','spells','features','inventory','rolls']
                //   Order used by swipe navigation and switchTab()
FONT_SIZES      // [75, 85, 100, 110, 125, 150] — allowed zoom levels in percent
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
  hitDiceUsed:        0,    // number of hit dice expended; max = charLevel
  classFeatures:      [],   // [ { name, max, used, recharge, step } ]
}
```

Session-only (not persisted to localStorage):
```js
undoStack           // array of undo action objects (max 50)
rollLog             // array of roll history entries (max 50)
longPressTimer      // setTimeout handle for attack long-press
longPressActive     // boolean — suppresses roll on release after long-press
abilityUndoTimers   // {[ab]: timerId} — debounce timers for ability undo entries
hpHoldTimer/Interval       // hold-to-repeat timers for HP +/− buttons
slotHoldTimer/Interval     // hold-to-repeat timers for spell slot +/− buttons
featureHoldTimer/Interval  // hold-to-repeat timers for feature +/− buttons
hitDiceHoldTimer/Interval  // hold-to-repeat timers for hit dice +/− buttons
featureLpTimer      // long-press timer for opening the feature editor sheet
currentStepMenuIdx  // index of the feature currently being edited (−1 = new feature)
fontSizeIdx         // index into FONT_SIZES; persisted separately in localStorage as 'dnd5e_fontsize'
leftyMode           // boolean; persisted separately in localStorage as 'dnd5e_lefty'
```

All other values (character name, HP max, AC, etc.) live in HTML form inputs and are read directly via `document.getElementById`.

---

### Initialisation flow

```
DOMContentLoaded
  └─ loadFontSize()    restore font-size zoom from localStorage; apply to body
  └─ loadLeftyMode()   restore lefty-mode flag from localStorage; apply body.lefty class
  └─ init()
       ├─ loadData()          restore state + form fields from localStorage
       ├─ buildAbilityGrid()  inject ability score cards into #abilityGrid
       ├─ buildSavingThrows() inject saving throw rows into #savingThrowsList
       ├─ buildSkillsList()   inject skill rows into #skillsList
       ├─ buildConditions()   inject condition chips into #conditionsGrid
       ├─ buildSpellSlots()   inject spell-slot rows into #spellSlotsBody
       ├─ buildFeatures()     inject class feature rows into #featuresBody
       ├─ renderHitDice()     inject hit dice dots into #hitDiceDots
       ├─ recalcAll()         compute all derived values (modifiers, DC, etc.)
       ├─ setupAutoSave()     attach input/change listeners → saveData()
       └─ setupSwipe()        attach touchstart/touchend listeners for tab swiping
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
| `buildAbilityGrid()` | 6 ability cards; tap card → roll d20+mod | `state.abilities` |
| `buildSavingThrows()` | 6 rows; tap row → roll; tap prof dot → toggle proficiency | `state.saveProficiencies` |
| `buildSkillsList()` | 18 skill rows; tap row → roll; tap prof dots → cycle prof | `state.skillProficiencies`, `state.skillExpertise` |
| `buildConditions()` | 15 condition chips | `state.conditions` |
| `buildSpellSlots()` | 9 spell-level rows, each with dots and a mini +/− tracker | `state.spellSlots` |
| `renderSlotDots(i)` | Dot row + counter for one spell level (gold left = available, grey right = used); counter shows `(max − used)/max` | `state.spellSlots[i]` |
| `buildFeatures()` | Class feature rows in #featuresBody, or empty-state placeholder | `state.classFeatures` |
| `renderFeatureDots(i)` | Dot row + counter for one feature, scaled by `step` | `state.classFeatures[i]` |
| `renderHitDice()` | Hit dice dots in #hitDiceDots; max = character level | `state.hitDiceUsed`, `charLevel` input |
| `renderAttacks()` | Attack rows (tap to roll, long-press/Edit for delete) or empty placeholder | `state.attacks` |
| `renderRollLog()` | Roll history entries in #panel-rolls | `rollLog` |

---

### Dice helpers

| Function | Description |
|---|---|
| `d20()` | Returns a random integer 1–20 |
| `natMsg(roll)` | Returns `' ★ NAT 20!'`, `' ✦ Nat 1'`, or `''` |
| `rollDiceExpr(expr)` | Parses and rolls a dice expression (e.g. `"2d6+4"`, `"+2d8 radiant"`); returns integer total or `null` if unparseable |

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
| `onAbilityInput(ab, val)` | Ability score input | Pushes debounced undo entry; updates `state.abilities[ab]`; calls `recalcAll()` |
| `rollAbility(ab)` | Tap ability card | Rolls d20 + ability modifier; calls `showRoll()` |
| `toggleSaveProf(ab, el)` | Tap prof dot on saving throw row | Pushes undo; toggles ability key in `state.saveProficiencies` |
| `rollSave(ab)` | Tap saving throw row (outside dot) | Rolls d20 + save modifier; calls `showRoll()` |
| `cycleSkillProf(name, el)` | Tap prof dots on skill row | Pushes undo; cycles None → Proficient → Expert → None |
| `rollSkill(name)` | Tap skill row (outside dots) | Rolls d20 + skill modifier; calls `showRoll()` |
| `rollInitiative()` | Tap Initiative stat pill | Rolls d20 + DEX modifier; calls `showRoll()` |
| `rollSpellAtk()` | Tap Spell Atk stat pill | Rolls d20 + spell attack bonus; calls `showRoll()` (shows toast if no spell ability set) |
| `rollAttack(i)` | Tap attack row | Rolls d20 + attack bonus and damage dice; calls `showRoll()`; no-ops if `longPressActive` |
| `startLongPress(e, i)` | `pointerdown` on attack row | Starts 500 ms timer; on fire sets `del-ready` on that row and adds a one-shot dismiss listener |
| `cancelLongPress()` | `pointerup` / `pointercancel` on attack row | Clears the long-press timer |
| `dismissDelReady(e)` | Next `pointerdown` after long-press | Removes `del-ready` from all rows (skips if target is the bin button) |
| `toggleAttackEdit()` | Tap Edit/Done button in Attacks section | Toggles `delete-all` class on `#attackList`; shows/hides all bin buttons |
| `adjustHP(delta)` | +/− HP buttons (single tap) | Pushes undo; clamps `state.hpCurrent` to `[0, max]`; calls `updateHP()` |
| `startHpHold(delta)` / `stopHpHold()` | `pointerdown` / `pointerup` on HP buttons | Calls `adjustHP` immediately, then repeats at 80 ms after a 500 ms delay |
| `resetHPToFull()` | ↺ Restore HP button | Pushes undo; sets `state.hpCurrent = hpMax`; calls `updateHP()` |
| `updateHP()` | Max/Temp HP input or any HP adjustment | Refreshes HP display, bar color, and max label |
| `openHpDialog()` | Tap HP display area | Populates and shows the HP bottom sheet; auto-selects the input after transition |
| `dismissHpDialog()` | Cancel button or backdrop tap | Slides the HP dialog down |
| `applyHpDialog()` | Set HP button or Enter key | Pushes undo; clamps input value to `[0, max]`; calls `updateHP()`; dismisses dialog |
| `setSlotMax(i, val)` | Spell slot max input | Updates `state.spellSlots[i].max`; rerenders dots |
| `toggleSlot(i, j)` | Tap spell slot dot | Gold dot → use from here to end; grey dot → restore that dot |
| `slotAdjust(i, delta)` | Mini +/− buttons on slot row | Clamps `state.spellSlots[i].used` by ±1; `−` passes `+1` (use), `+` passes `−1` (restore); rerenders dots |
| `startSlotHold(i, delta)` / `stopSlotHold()` | `pointerdown` / `pointerup` on slot +/− | Hold-to-repeat at 80 ms |
| `restoreAllSlots()` | ↺ All button in Spell Slots section | Sets all slot `used` to `0`; rerenders all dot rows |
| `renderFeatureDots(i)` | Any feature use/restore | Updates dots and `n/max` counter for feature `i` |
| `toggleFeatureDot(i, j)` | Tap feature dot | Gold → use dots from here right; grey → restore that dot (respects `step`) |
| `featureAdjust(i, delta)` | Feature mini +/− buttons | Changes `f.used` by `±step`; rerenders dots |
| `startFeatureHold(i, delta)` / `stopFeatureHold()` | `pointerdown` / `pointerup` on feature +/− | Hold-to-repeat at 80 ms |
| `setFeatureMax(i, val)` | Feature max input | Updates `f.max`; clamps `f.used`; rerenders dots |
| `restoreFeature(i)` | ↺ button on a feature row | Sets `f.used = 0`; rerenders dots; shows toast |
| `restoreAllFeatures()` | ↺ All button in Features section | Sets all feature `used` to `0`; rerenders all dot rows |
| `addFeature()` | + Add button | Opens feature editor sheet in "New Feature" mode (`currentStepMenuIdx = -1`) |
| `editFeature(i)` | Edit button on a feature row | Opens feature editor sheet pre-filled with feature `i` |
| `removeFeature(i)` | ✕ button on a feature row | `confirm()` dialog → splices `state.classFeatures`; rebuilds feature list |
| `startFeatureLongPress(i, e)` / `cancelFeatureLongPress()` | `pointerdown` / `pointerup` on feature row | 600 ms timer; opens feature editor sheet; ignored if target is a button or input |
| `showStepMenu(i)` | Long-press or Edit; `i = -1` for new | Populates and shows the feature editor sheet |
| `dismissStepMenu()` | Cancel button or backdrop tap | Hides the feature editor sheet |
| `applyStepMenu()` | Save button or Enter on last field | Validates name; creates or updates the feature; rebuilds list; hides sheet |
| `renderHitDice()` | Any hit dice change or level change | Updates dots in #hitDiceDots; counter shows `(max − used)/max` |
| `toggleHitDie(j)` | Tap hit dice dot | Gold → use from here right; grey → restore that die |
| `hitDiceAdjust(delta)` | Hit dice mini +/− buttons | Changes `state.hitDiceUsed` by ±1; `−` button passes `+1` (use), `+` passes `−1` (restore) |
| `startHitDiceHold(delta)` / `stopHitDiceHold()` | `pointerdown` / `pointerup` on hit dice +/− | Hold-to-repeat at 80 ms |
| `restoreHitDice()` | ↺ Restore button in Hit Dice section | Sets `state.hitDiceUsed = 0`; rerenders |
| `fullLongRest()` | ⟳ Long Rest button in Overview panel | Restores HP to max, resets hit dice, all spell slots, and all class features; saves |
| `addAttack()` | "+ Add Attack" button | `prompt()` dialog → pushes to `state.attacks`; pushes undo entry |
| `removeAttack(i)` | Tap bin button (🗑) on attack row | Pushes undo; splices `state.attacks`; rerenders |
| `toggleCondition(name, el)` | Tap condition chip | Pushes undo; toggles name in `state.conditions` |
| `toggleInspiration()` | Tap inspiration button | Pushes undo; flips `state.inspiration` boolean |
| `toggleDeathSave(dot, type)` | Tap death save dot | Toggles `.filled` class on the dot element (not tracked by undo) |

#### Skill proficiency cycle detail
```
tap dots 1: None       → Proficient  (add to skillProficiencies)
tap dots 2: Proficient → Expert      (add to skillExpertise; keep in skillProficiencies)
tap dots 3: Expert     → None        (remove from BOTH skillExpertise and skillProficiencies)
```

#### Attack row interaction model
```
Tap row            → rollAttack(i)         — rolls d20 + bonus, damage dice
Long press row     → reveals bin button on that row only; tap elsewhere to dismiss
Tap Edit button    → toggleAttackEdit()    — reveals bin buttons on all rows
Tap bin button (🗑) → removeAttack(i)      — deletes with undo support; no confirm dialog
```

---

### Roll result functions

| Function | Description |
|---|---|
| `showRoll(label, breakdown, total, nat, secondary?)` | Displays the roll result overlay and logs to `rollLog`; `secondary` is optional (e.g. damage line for attacks) |
| `dismissRollResult()` | Hides the roll result overlay and backdrop |
| `renderRollLog()` | Renders all entries in `rollLog` into `#rollLogList` |
| `clearRollLog()` | Empties `rollLog` and re-renders the log panel |

---

### Undo functions

| Function | Description |
|---|---|
| `pushUndo(action)` | Appends an action object to `undoStack` (max 50); enables the Undo button |
| `undo()` | Pops the top action from `undoStack`; calls `applyUndo()`; disables button if stack empties |
| `applyUndo(action)` | Reverses the action by type: `removeAttack`, `addAttack`, `hp`, `saveProf`, `skillProf`, `ability`, `condition`, `inspiration` |

Undo is session-only and not persisted. The undo button (`#undoBtn`) is disabled when the stack is empty.

---

### Persistence functions

| Function | Description |
|---|---|
| `collectFormData()` | Reads all 29 form input values by element ID into a plain object |
| `buildPayload()` | Returns `{ form, state }` — the canonical serialisation format; `state` includes `spellSlots`, `attacks`, `conditions`, `classFeatures`, `hitDiceUsed`, and all ability/proficiency data |
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
| `switchTab(id)` | Deactivates all panels/buttons; activates the target; scrolls its tab button into view |
| `setupSwipe()` | Attaches passive `touchstart`/`touchend` listeners to `document.body`; horizontal swipe ≥ 50 px (and greater than vertical movement) advances or retreats through `TABS`; ignored when roll result overlay is open |
| `toast(msg)` | Shows floating message for 2 seconds; used for non-roll feedback (proficiency changes, inspiration, file ops) |
| `setupAutoSave()` | Attaches `saveData` as `input` + `change` listener to every form element |
| `openSettings()` / `dismissSettings()` | Opens / closes the ⚙ settings bottom-sheet; manages `pushModalHistory` / `popModalHistory` |
| `loadFontSize()` | Reads `dnd5e_fontsize` from `localStorage`; resolves index into `FONT_SIZES`; calls `applyFontSize()` |
| `applyFontSize()` | Sets `document.body.style.zoom` to the current `FONT_SIZES[fontSizeIdx]` value; updates `#fontSizeLabel` |
| `changeFontSize(dir)` | Increments or decrements `fontSizeIdx` (clamped to `FONT_SIZES` bounds); calls `applyFontSize()`; persists to `localStorage` |
| `loadLeftyMode()` | Reads `dnd5e_lefty` from `localStorage`; calls `applyLeftyMode()` |
| `applyLeftyMode()` | Toggles `body.lefty` class and updates `#leftyToggle` button state |
| `toggleLeftyMode()` | Flips `leftyMode`; calls `applyLeftyMode()`; persists to `localStorage` |

---

## Adding a new field — checklist

1. Add the HTML input with a unique `id` to the relevant panel.
2. Add the `id` string to the array inside `collectFormData()`.
3. If the field affects a derived value (modifier, DC), update `recalcAll()`.
4. If the field needs dynamic rendering, add a build function and call it from `init()` and `applyPayload()`.
5. Update `REFERENCE.md` (this file) and `JSONGeneration.md`.
