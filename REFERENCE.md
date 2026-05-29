# REFERENCE — D&D Character Sheet Code Structure

**File:** `dnd-character-sheet.html`
A self-contained single-file application. No build step, no dependencies. Open directly in any browser.

---

## Shared terminology

This section is the authoritative vocabulary for conversations, issues, and pull requests. When a user or AI assistant refers to any term below, the definition here takes precedence over any other interpretation.

---

### Application structure

**Tab** — One of the eight top-level navigation buttons in the tab bar. Each tab button carries a `data-tab` attribute identifying the panel it activates. The currently active tab has the `.active` CSS class on its button.

**Panel** — The content area shown when a tab is selected. Each panel is a `<div class="panel">` whose `id` matches the tab's `data-tab` value prefixed with `panel-`. Panels are hidden by default; the active one gets the `.active` class.

**Section** — A card-like visual grouping inside a panel. Implemented as `<div class="section">`, which contains a `.section-title` strip at the top and a `.section-body` below. Multiple sections stack vertically within a panel.

**Header** — The top bar (`<div class="header">`). Contains the app title on the left, action buttons (Undo, Import, Settings) on the right, and character name + meta on a second line. It scrolls with the page instead of staying fixed.

---

### The eight tabs

| Button label | `data-tab` | Panel ID | What it contains |
|---|---|---|---|
| Info | `overview` | `#panel-overview` | Character Info (portrait + form fields), Features & Traits, Personality, Long Rest |
| Stats | `abilities` | `#panel-abilities` | Ability Scores & Saving Throws, Skills, Passive Perception |
| Combat | `combat` | `#panel-combat` | Hit Points, Combat Stats, Hit Dice, Resistances & Vulnerabilities, Inspiration & Death Saves, Turn block, Conditions |
| Spells | `spells` | `#panel-spells` | Spellcasting ability, Spells Known (collapsible, with prep counter + max), Spell Slots, Spells Prepared |
| Features | `features` | `#panel-features` | Class Features & Featured Entries (dot trackers for all entries with `showInFeatures:true`) |
| Gear | `inventory` | `#panel-inventory` | Currency, Equipment, All Proficiencies (collapsible dot list), Your Proficiencies (active items with descriptions), Languages, Notes |
| Dice | `dice` | `#panel-dice` | Free-form Dice Roller |
| Logs | `rolls` | `#panel-rolls` | Roll Log (session history) |

> The `TABS` constant defines swipe order: `['overview','abilities','combat','spells','features','inventory','dice','rolls']`. Swipe navigation **wraps**: swiping past the last panel loops back to the first, and vice versa.

---

### Data model

**State object (`state`)** — The JavaScript object that holds all structured, typed character data: ability scores, proficiencies, HP, spell slots, spells, attacks, conditions, class features, traits, hit dice, portrait, and stat mods. Lives in memory; serialised to `localStorage` by `saveData()`.

**Form inputs** — Flat string values stored directly in HTML `<input>` / `<textarea>` / `<select>` elements (character name, HP max, AC, equipment text, etc.). Read by `collectFormData()` and written back by `applyPayload()`. Never duplicated in `state`.

**Payload** — The canonical save format: `{ form, state }`. `form` is the flat object from `collectFormData()`; `state` is the structured object. Written to `localStorage` by `saveData()` and exported as JSON by `exportToJSON()`.

**Roster** — The collection of all saved characters, stored in `localStorage` under `dnd5e_roster` as `{ chars: { [id]: { name, payload } }, activeId }`. The 🎭 header button opens the Character Grid to browse and switch between roster entries.

---

### Key data distinctions

**Unified entries model** — All spells, class features, and info traits are stored in `state.entries[]`. Each entry is a single object with `showIn*` flags controlling where it appears:
- `showInSpells: true` → Spells tab (Known/Prepared lists). Spell-specific fields (`level`, `school`, `castingTime`, etc.) are used.
- `showInFeatures: true` → Features tab with a dot tracker using `max`, `used`, `step`, `recharge`.
- `showInTraits: true` → Info tab's "Features & Traits" section. No tracking shown there.
- `showInCombat: true` → Turn block on the Combat tab (in the sub-section given by `combatActionType`).
An entry may have any combination of these flags set — for example a healing spell that also tracks uses as a feature. The edit panel that opens (spell/feature/trait) is routed based on the entry's dominant `showIn*` flag.

**Stats tab vs Skills tab** — There is no separate Skills tab. The tab labelled **Stats** (`#panel-abilities`) contains three sections: Ability Scores & Saving Throws, Skills, and Passive Perception — all on the same panel.

**Logs tab vs panel ID** — The tab button is labelled **Logs** but its `data-tab` is `rolls` and the panel is `#panel-rolls`. This is a historical naming inconsistency; the code identifier is `rolls`.

---

### Combat tab concepts

**Turn block** — The section titled "Turn" inside `#panel-combat`. Renders `state.attacks` alongside entries from `state.entries[]` that have `showInCombat: true`, grouped into three always-visible sub-sections: **Actions**, **Bonus Actions**, and **Reactions**. An **Other** sub-section appears only when items use `actionType: 'other'`. The section title is holdable (500 ms) and opens an info panel explaining the anatomy of a D&D turn. Previously called "Attacks" / "combat block" in older documentation; "Turn block" is now the correct term.

**Default Actions** — A collapsible list inside the Turn block (collapsed by default), showing the standard D&D 5e actions available to any character (Dash, Dodge, Disengage, Grapple, etc.). Each row follows the standard tap/hold model: tap opens a generic info panel immediately; hold (500 ms) shows `.holding` feedback then opens the same panel. Populated from the `DEFAULT_ACTIONS` constant.

**Combat stat pills** — The six tiles in the Combat Stats section of the Combat tab: AC, Speed, Initiative, Hit Die, Spell Atk, Spell DC. Each is a `.stat-pill` element. Rollable pills (Initiative, Spell Atk) respond to short-tap with a roll; all pills respond to hold (500 ms) with a generic info panel. Hit Die is a separate element (`.hit-die-roll`) that rolls on tap and opens an info panel on hold.

**Dot tracker** — The row of circular `.slot-dot` elements used to track limited-use resources. Gold dots = available, grey dots = used. Appears for spell slots, class features, and hit dice. Tapping a dot uses or restores from that point.

**Featured Entries** — Entries in `state.entries[]` with `showInFeatures: true` that appear in the Features tab with the dot-tracker layout (`max`, `used`, `step`, `recharge`). All such entries appear together, sorted spells first then others. There are no longer separate "Featured Spells" or "Featured Traits" sections — all featured entries share a unified list. Set per entry in the spell/feature/trait edit panel.

---

### Panels and overlays

**Info panel** — User-facing term for any floating card that slides in to show item details. Depending on context this may mean the generic panel or a dedicated panel — see the two definitions below.

**Generic info panel (`#infoPanel`)** — The single reusable floating card for items that have no dedicated panel: skills, ability scores, saving throws, combat stat pills, hit die, death saves, conditions, and the Turn title hold. Opened via `openInfoPanel(cfg)`. Accepts: badge label, title, optional meta line, optional 3-zone roll button, optional simple roll button, description text, and an optional action button (e.g. "Apply Condition"). Does **not** handle spells, traits, attacks, or class features — those use dedicated panels.

**Dedicated view/edit panels** — Five item-specific panels: `#spellPanel`, `#traitPanel`, `#featurePanel`, `#attackPanel`, and `#equipItemPanel`. Each has two modes toggled by the `.edit-mode` CSS class:
- *View mode* — read-only display of the item (name, description, roll boxes); Edit button top-right switches to edit mode; "tap to dismiss" hint at the bottom.
- *Edit mode* — editable form with labeled fields; Delete / Cancel / Save button row at the bottom.

**Edit mode button row** — The `.sp-edit-actions` footer inside the edit section of each dedicated panel. **Delete** removes the item permanently. **Cancel** discards unsaved edits and dismisses. **Save** validates, writes to `state`, rebuilds the relevant list, and dismisses.

**Roll result overlay (`#rollResult`)** — The centered card shown after any dice roll. Displays roll label, large total, dice breakdown line, optional secondary line (damage), and a nat-20 / nat-1 callout. Dismissed by tapping the backdrop or anywhere on the overlay.

**Backdrop** — The semi-transparent dark `<div>` placed behind an open panel or dialog. Each panel/dialog has its own named backdrop element (e.g. `#attackPanelBackdrop`). Tapping the backdrop calls the panel's dismiss function.

**HP dialog (`#hpDialog`)** — Bottom-sheet for typing an exact HP value. Opened by tapping the HP display area. Dismissed via Cancel, by pressing Enter, or by tapping the backdrop.

**Stat modifier dialog (`#statModDialog`)** — Bottom-sheet for entering a custom numeric bonus for one combat stat (AC, Speed, Initiative, Spell Atk, or Spell DC). Opened via the Edit button inside the stat pill's info panel. The bonus is stored in `state.statMods[key]` and displayed as a `.stat-pill-mod` badge inside the pill.

**Settings sheet (`#settingsMenu`)** — Bottom-sheet opened by the ⚙ header button. Contains Save to file, creature stat block shortcut, font size control, lefty mode toggle, theme/language controls, and a "📋 All Entries" button that opens `#entryManagerPanel`.

**Import hub (`#importHubPanel`)** — Modal opened by the ⇓ Import header button. Contains three entry points: **AI / SRD Import**, **Import Character**, and **Import Information**.

**AI / SRD Import panel (`#aiImportPanel`)** — Modal opened from the Import hub, or by any "+ Add" section button (pre-selected to the matching type tab). Two modes: **AI mode** generates a copy-ready LLM prompt and accepts paste-back JSON, plus a "+ Create custom" button that opens the matching item panel directly; **SRD mode** searches/imports from SRD sources. Four type tabs: **Spells** / **Features** / **Traits** / **Items** (equipment).

**Item Content Assist (inline ✨ Fill)** — Collapsible section that appears inside the edit form of each dedicated panel (spell, trait, class feature, equipment item), revealed by tapping the **✨ Fill** button next to the Description label. Two modes: **📖 SRD** searches the live SRD API by the item's current name and previews the found description; **✨ AI Prompt** generates a copy-ready LLM prompt and accepts a pasted response. For spells and equipment, "Apply All Fields" also fills mechanical fields (level, school, casting time, range, etc. for spells; weight, cost, category for equipment). For all types, "Desc Only" / "Apply Description" fills only the description textarea. Controlled by `toggleIca(p)`, `setIcaMode(p, mode)`, `icaSearchSrd(p, type)`, `icaApply(p)`, `icaApplyDesc(p)`, `icaCopyPrompt(p, type)`, `icaApplyAI(p, type)`, `icaApplyAIDesc(p)` where `p` is a panel prefix (`'sp'`/`'tr'`/`'fp'`/`'eq'`). Requires internet for SRD mode; clipboard API for copy (degrades gracefully on `file://`). The section is automatically collapsed when `populate*EditForm()` is called.

**Character Import panel (`#charImportPanel`)** — Modal opened from the Import hub → Import Character. Two modes: **AI** (schema-rich prompt workflow for photo-to-JSON import, then paste response) and **JSON** (opens file picker and imports a `{form,state}` file via `importFromJSON`).

**Information Import panel (`#descEnrichPanel`)** — Modal opened from the Import hub → Import Information. Two modes: **AI** (generate prompt and paste JSON descriptions) and **SRD** (auto-search by existing entry names). Scope toggle supports **Missing Only** or **All Entries** (refresh existing descriptions too).

**Entry Manager (`#entryManagerPanel`)** — Bottom-sheet opened from Settings → 📋 All Entries. Lists all `state.entries[]` alphabetically. Tap an entry row to open its view panel (generic info panel); hold 500 ms to open the matching edit panel (routed to spell/feature/trait panel based on which `showIn*` flag is set). Backdrop: `#entryManagerBackdrop`.

**Character Grid (`#charGridOverlay`)** — Full-screen overlay opened by the 🎭 header button. Displays one card per saved character; supports switching, creating, and deleting characters.

**Toast (`#toast`)** — A small floating pill that appears for 2 seconds to confirm non-roll actions (e.g. "Saved", "Attack deleted", proficiency changes). Not used for roll results — those go to the roll result overlay.

---

### Interaction model

**Tap** — A short pointer-down + pointer-up on an interactive element (no hold). On rollable elements, tap triggers a dice roll immediately. On non-rollable elements, tap opens the relevant info panel or performs the element's primary action (toggle, adjust, etc.).

**Hold (long press)** — Keeping a finger or cursor pressed on an element for 500 ms before releasing. Hold always opens the info or view panel for the element. Implemented with a `setTimeout` started on `pointerdown` and cleared on `onclick` / `pointercancel`. The `.holding` CSS class is applied to the element when the timer fires to give visual press feedback.

**Hold hint** — A small visual indicator on elements that support hold. Implemented as a `"hold"` badge (`.turn-hold-hint`) on: the Turn section title, the Spells Known section title, and the Spells Prepared section title. Other holdable elements (spell rows, skill rows, ability cards, etc.) use the `.holding` class for press feedback but have no persistent pre-hold badge.

**3-zone roll button (`.roll-tri`)** — A d20 roll widget split into three tap zones: centre-top for normal roll, bottom-left for disadvantage, bottom-right for advantage. Used inside `#infoPanel` and the dedicated spell and attack panels.

**Hold-to-repeat** — Used on HP +/−, spell slot +/−, hit dice +/−, and class feature +/− buttons. On `pointerdown`, the action fires once immediately, then repeats every 80 ms after a 500 ms delay. Stopped on `pointerup` / `pointercancel`.

---

### SRD sources and edition terminology

The app integrates two separate D&D 5e SRD sources with different terminology conventions.

**2014 SRD (`dnd5eapi.co`)** — A public REST API (CC-BY). Endpoint base: `https://www.dnd5eapi.co/api/`. Available whenever the device has internet access. Response field names follow the 2014 edition. Cache key prefix: `srd_v1_`.

**2024 SRD (local)** — Static JSON files in `srd2024/`. Available only when the app is served from a web server (not a `file://` URL) and the companion files are present. Cache key prefix: `srd24_v1_`.

**`srd2024/translation.json`** — The single source of truth for every 2014↔2024 difference. Loaded once on the first 2024 SRD request and kept in memory; never re-fetched during a session. If it cannot be fetched, 2024 SRD lookup is silently disabled. Three top-level keys:

| Key | Type | Purpose |
|---|---|---|
| `endpoints` | `object` | Maps a 2014 API path prefix (e.g. `"races"`) to the 2024 local file name without extension (e.g. `"species"`) |
| `fields` | `object` | Maps a 2014 JSON response field name (e.g. `"race"`) to its 2024 equivalent field name (e.g. `"species"`) |
| `labels` | `object` | Maps a 2014 UI label string (e.g. `"Race"`) to the 2024 display string shown in the app (e.g. `"Species"`) |

Minimal valid `translation.json`:
```json
{
  "endpoints": {
    "races": "species",
    "subraces": "subspecies"
  },
  "fields": {
    "race": "species",
    "subrace": "subspecies",
    "racial_traits": "species_traits",
    "subraces": "subspecies"
  },
  "labels": {
    "Race": "Species",
    "Subrace": "Subspecies",
    "Racial Traits": "Species Traits"
  }
}
```

---

### 2014 ↔ 2024 terminology reference

Canonical mapping between D&D 5e 2014 and 2024 terms as used throughout the codebase, UI labels, and API field names.

| Concept | 2014 term | 2024 term | Where it appears |
|---|---|---|---|
| Character ancestry | Race | Species | `charRace` form field label; `translation.json` `labels.Race` |
| Sub-ancestry | Subrace | Subspecies | Ancestry detail data; `translation.json` `labels.Subrace` |
| Ancestry-granted features | Racial traits | Species traits | Trait list inside a Species entry; `translation.json` `labels.Racial Traits` |
| 2014 API path segment | `races` | `species` | `_srdGet()` endpoint resolution; `translation.json` `endpoints.races` |
| 2014 API path segment | `subraces` | `subspecies` | `_srdGet()` endpoint resolution; `translation.json` `endpoints.subraces` |
| 2014 response field | `race` | `species` | `_mapSrdTrait()` / `_mapSrdFeature()` field lookup; `translation.json` `fields.race` |
| 2014 response field | `subrace` | `subspecies` | Species sub-entry field; `translation.json` `fields.subrace` |
| 2014 response field | `racial_traits` | `species_traits` | Trait array field on an ancestry object; `translation.json` `fields.racial_traits` |

> The table above reflects only the differences. All other 2014 terms (spell fields, class/feature fields, equipment fields) are **identical** in 2024 and do not require entries in `translation.json`.

**How the translation layer is applied:**
1. On first 2024 SRD use, `_srdGet()` fetches `translation.json` and caches it in a module-level variable.
2. When resolving a 2014-style endpoint path (e.g. `"races/elf"`), the path's first segment is looked up in `translation.endpoints`; if a mapping exists the segment is replaced before constructing the local file path.
3. When reading a field from a 2024 SRD response object, `translation.fields` is checked first; if a mapping exists the translated field name is used instead of the 2014 name.
4. When rendering a UI label (e.g. the section title above `charRace`), `translation.labels` is checked; if a mapping exists the 2024 string is substituted for display only — the underlying form field ID and state key are never renamed.

---

## Variable name glossary

This section is the authoritative map from every significant identifier in the codebase to its plain-English meaning. Use it whenever a name is ambiguous or unfamiliar.

---

### Form field IDs (`form.*` in the saved payload)

These are the flat string values stored directly in HTML `<input>` / `<textarea>` / `<select>` elements. `collectFormData()` reads them by ID and writes the results to `payload.form`. When loaded, `applyPayload()` writes them back with `el.value = payload.form[id]`.

| ID | Meaning | Notes |
|---|---|---|
| `charName` | Character name | Displayed in the header |
| `charClass` | Class (e.g. "Wizard") | Used in character grid card meta |
| `charSubclass` | Subclass (e.g. "Evocation") | Sub-field below class on the Info tab |
| `charRace` | Race / species (e.g. "High Elf") | Used in character grid card meta |
| `charLevel` | Total character level (integer string) | Drives proficiency bonus and hit dice max |
| `charBackground` | Background (e.g. "Sage") | Info tab, character flavour |
| `charAlignment` | Alignment (e.g. "Neutral Good") | Info tab |
| `charXP` | Experience points | Info tab |
| `personality` | Personality traits text | Personality section, Info tab |
| `ideals` | Ideals text | Personality section |
| `bonds` | Bonds text | Personality section |
| `flaws` | Flaws text | Personality section |
| `hpMax` | Maximum hit points | Combat tab; `recalcAll()` reads this |
| `hpTemp` | Temporary hit points | Displayed separately next to current HP |
| `statAC` | Armour Class (base value before `statMods.ac`) | Combat Stats section |
| `statSpeed` | Movement speed in feet (before `statMods.speed`) | Combat Stats section |
| `statHitDice` | Hit die type string (e.g. "d8") | Used by `rollHitDie()` and displayed in the Hit Dice pill |
| `spellAbility` | Spellcasting ability key (`STR`/`DEX`/`CON`/`INT`/`WIS`/`CHA` or blank) | Drives spell attack bonus and spell save DC via `recalcAll()` |
| `languages` | Languages free-text | Inventory tab |
| `notes` | Campaign notes free-text | Inventory tab |
| `cp` | Copper pieces | Currency grid |
| `sp` | Silver pieces | Currency grid |
| `ep` | Electrum pieces | Currency grid |
| `gp` | Gold pieces | Currency grid |
| `pp` | Platinum pieces | Currency grid |

---

### State object keys (`state.*`)

These are the structured, typed values in the `state` object. They are persisted via `buildPayload()` and restored via `applyPayload()`.

| Key | Type | Meaning |
|---|---|---|
| `abilities` | `{STR,DEX,CON,INT,WIS,CHA}` | Six ability scores as integers 1–30 |
| `saveProficiencies` | `string[]` | Ability keys (e.g. `['STR','CON']`) the character is proficient in for saving throws |
| `skillProficiencies` | `string[]` | Skill names the character is proficient in (e.g. `['Perception','Arcana']`) |
| `skillExpertise` | `string[]` | Subset of `skillProficiencies`; these skills use double proficiency bonus |
| `equipProficiencies` | `string[]` | Item/category names the character is proficient with (e.g. `['Light Armor','Martial Weapons']`); tapped against the `EQUIP_PROF_GROUPS` constant for predefined items, or `customEquipProfRows` for user-added entries |
| `customEquipProfRows` | `string[]` | Names of custom equipment/tool entries the user has added to the proficiency list; each entry renders as a row with a single prof dot and a delete (×) button |
| `inspiration` | `boolean` | Whether the character currently has Inspiration |
| `hpCurrent` | `integer` | Current hit points; clamped to `[0, hpMax]` |
| `spellSlots` | `object[]` | Nine spell slot levels; each entry: `{level, max, used}` |
| `entries` | `object[]` | All spells, class features, and traits; each carries `showIn*` flags (see Unified entry fields) |
| `maxSpellsPrepared` | `integer` | Daily preparation limit for P-marked spells; `0` = no limit enforced; always-prepared spells (∞) never count toward this |
| `attacks` | `object[]` | All weapon / ability attacks in the Turn block (see nested fields below) |
| `conditions` | `string[]` | Names of active conditions (e.g. `['Poisoned','Frightened']`) |
| `hitDiceUsed` | `integer` | Number of hit dice expended; max equals `charLevel` |
| `diceRoller` | `{sides,count}[]|null` | Free-form dice roller configuration; `null` means use defaults (d4/d6/d8/d10/d12/d20/d100, count 1 each) |
| `portrait` | `string|null` | Base64 data URL for the character portrait, or `null` |
| `statMods` | `{ac,speed,initiative,spellatk,spelldc}` | Custom numeric bonuses added on top of the base stat values |
| `damageResistances` | `{[damageType]: -1|0|1|2}` | Per damage-type resistance state: `1` = resistant (green), `2` = immune (black), `-1` = vulnerable (red), `0` or absent = normal |
| `equipmentItems` | `object[]` | Structured equipment items in the Inventory tab; each entry: `{name, quantity, weight, cost, category, description}` (see nested fields below) |

---

### Unified entry fields (`state.entries[]` items)

All entries in `state.entries[]` share the same full schema regardless of whether they represent a spell, feature, or trait. Irrelevant fields default to empty/false/0.

| Field | Type | Meaning |
|---|---|---|
| `name` | `string` | Display name of the entry |
| `description` | `string` | Free-text description; newlines are preserved |
| `showInSpells` | `boolean` | True if entry appears in the Spells tab (Known/Prepared lists) |
| `showInFeatures` | `boolean` | True if entry appears in the Features tab with a dot tracker |
| `showInTraits` | `boolean` | True if entry appears in the Info tab's Features & Traits section |
| `showInCombat` | `boolean` | True if entry appears as a row in the Turn block in the Combat tab |
| `combatActionType` | `'action'\|'bonus'\|'reaction'\|'other'` | Which Turn sub-section the entry appears in when `showInCombat` is true (default `'action'`) |
| `level` | `integer` | Spell level 0–9 (`0` = cantrip); `0` for non-spell entries |
| `school` | `string` | Magic school (e.g. `"Evocation"`); empty for non-spells |
| `castingTime` | `string` | Casting time string (e.g. `"1 action"`); empty for non-spells |
| `range` | `string` | Range string (e.g. `"60 ft"`); empty for non-spells |
| `components` | `string` | Components string (e.g. `"V, S, M (a drop of blood)"`); empty for non-spells |
| `duration` | `string` | Duration string (e.g. `"Concentration, up to 1 minute"`); empty for non-spells |
| `concentration` | `boolean` | True if the spell requires concentration; `false` for non-spells |
| `ritual` | `boolean` | True if the spell can be cast as a ritual; `false` for non-spells |
| `prepared` | `boolean` | True if the spell is prepared for the day (counts toward `maxSpellsPrepared`); mutually exclusive with `alwaysPrepared`; `false` for non-spells |
| `alwaysPrepared` | `boolean` | True if always prepared (e.g. domain spells); never counts toward `maxSpellsPrepared`; mutually exclusive with `prepared`; `false` for non-spells |
| `attackRoll` | `boolean` | True if the entry uses an attack roll (shows a tappable d20 card) |
| `attackMod` | `string` | Ability key for the attack roll: `''`, ability key (`'STR'`…`'CHA'`), `'SPELL'`, or `'manual'` |
| `attackBonus` | `string` | Manual to-hit string used when `attackMod === 'manual'` (e.g. `"+7"`) |
| `attackProficient` | `boolean` | Add proficiency bonus to the computed attack roll |
| `rolls` | `object[]` | Array of roll objects: `{dice, type, label?, mod?}`; `dice` is a string expression like `"2d6"` |
| `saveAbility` | `string` | Ability key for a saving throw (`'STR'`…`'CHA'`), or empty string for none |
| `saveDC` | `integer` | Saving throw DC override; `0` means use the character's current Spell Save DC |
| `max` | `integer` | Maximum number of uses / pool size for dot-tracked entries; `0` = no tracker shown |
| `used` | `integer` | How many uses have been expended; reset to `0` on Long Rest |
| `step` | `integer` | How many "uses" one dot on the tracker represents (default `1`) |
| `recharge` | `string` | When the entry recharges (e.g. `'Long Rest'`, `'Short Rest'`, `'Dawn'`); empty for none |
| `damage` | `string` | Legacy damage expression field (e.g. `"1d8+3 necrotic"`); prefer `rolls` for new entries |
| `rollDamage` | `boolean` | True if tapping the trait row should roll the `damage` expression directly |

### Attack fields (`state.attacks[]` items)

Attacks remain a separate array and are NOT part of `state.entries[]`.

| Field | Used in | Type | Meaning |
|---|---|---|---|
| `name` | `attacks` | `string` | Display name of the attack |
| `description` | `attacks` | `string` | Free-text description; newlines are preserved |
| `actionType` | `attacks` | `'action'\|'bonus'\|'reaction'\|'other'` | Which Turn sub-section the attack appears in (default `'action'`) |
| `rolls` | `attacks` | `object[]` | Array of roll objects: `{dice, type, label?, mod?}`; `dice` is a string expression like `"2d6"` |
| `saveAbility` | `attacks` | `string` | Ability key for a saving throw (`'STR'`…`'CHA'`), or empty string for none |
| `saveDC` | `attacks` | `integer` | Saving throw DC override; `0` = no save DC displayed |
| `hidden` | `attacks` | `boolean` | When true the attack row appears faded; tapping opens the edit panel rather than rolling |
| `abilityMod` | `attacks` | `string` | Ability used for the attack roll: `''` (no roll), ability key (`'STR'`…`'CHA'`), `'SPELL'`, or `'manual'` |
| `proficient` | `attacks` | `boolean` | Add proficiency bonus to the computed attack roll |
| `flatBonus` | `attacks` | `integer` | Additional flat bonus added on top of the computed modifier |
| `bonus` | `attacks` | `string` | Manual to-hit string used only when `abilityMod === 'manual'` (e.g. `"+5"`) |
| `max` | `spellSlots` | `integer` | Maximum number of available slots |
| `used` | `spellSlots` | `integer` | How many slots have been expended |

---

### Roll object fields (`rolls[]` entries)

| Field | Type | Meaning |
|---|---|---|
| `dice` | `string` | Dice expression (e.g. `"2d6"`, `"1d8"`); required |
| `type` | `string` | Damage type key from `ROLL_TYPES` (e.g. `'fire'`, `'slashing'`), or `'not_damage'` for non-damage rolls, or `'other'` for custom-labelled rolls |
| `label` | `string` | Custom display label; only shown when `type === 'other'` |
| `mod` | `string` | Modifier to add to the roll result: ability key (`'STR'`…`'CHA'`), `'SPELLMOD'` (spellcasting ability modifier only — for healing/damage), `'SPELL'` (full spell attack bonus = ability mod + proficiency — for attack rolls), or `''` for none |

---

### Session-only runtime variables

Not persisted. Reset on page reload or character switch.

| Variable | Meaning |
|---|---|
| `rosterActiveId` | String ID of the character currently loaded in the UI |
| `undoStack` | Array of undo action objects (max 50); top is most recent |
| `rollLog` | Array of roll history entries (max 50) shown in the Rolls tab |
| `infoPanelCfg` | **`shared.js`** — Object holding the `rollFn`, `simpleRollFn`, `editFn`, `actionFn` closures for the currently-open `#infoPanel` |
| `attackPanelIdx` | Index into `state.attacks` for the attack panel currently open; `-1` = new attack being created |
| `spellPanelEditIdx` | Index into `state.entries[]`; `-1` = new spell |
| `traitPanelEditIdx` | Index into `state.entries[]`; `-1` = new trait |
| `featurePanelIdx` | Index into `state.entries[]`; `-1` = new feature |
| `_emPressIdx` | Index into `state.entries[]` for the entry row currently being pressed in `#entryManagerPanel`; `-1` when none |
| `_emPressTimer` | `setTimeout` handle for the hold timer on an entry row in `#entryManagerPanel` |
| `equipItemPanelIdx` | Index into `state.equipmentItems`; `-1` = new item |
| `statModDialogKey` | Key string (`'ac'`\|`'speed'`\|`'initiative'`\|`'spellatk'`\|`'spelldc'`) for the stat modifier dialog currently open |
| `fontSizeIdx` | Current index into `FONT_SIZES`; persisted separately in `localStorage` as `dnd5e_fontsize` |
| `leftyMode` | Boolean; persisted in `localStorage` as `dnd5e_lefty` |
| `currentTheme` | Active theme key string; persisted in `localStorage` as `dnd5e_theme` |
| `srdModalMode` | `'ai'` or `'srd'` — which tab is active in `#aiImportPanel` |
| `srdSelected` | `Set<string>` of SRD item indices checked in the current search results |
| `_icaCache` | `{sp?, tr?, fp?, eq?}` — holds the last SRD detail object fetched for each panel prefix by `icaSearchSrd`; cleared by `_icaReset` |
| `longPressActive` | `true` after a hold fires on an attack row; causes the click handler to no-op and then reset |
| `charMenuOpen` | `true` while the character grid overlay (`#charGridOverlay`) is visible |

---

### Naming conventions

#### Function name prefixes

| Pattern | Meaning |
|---|---|
| `build*()` | Renders a UI section from scratch by generating and injecting HTML into a container element (e.g. `buildSpellList()`, `buildFeatures()`) |
| `render*()` | Updates one rendered item or a narrower slice of the UI without rebuilding the whole section (e.g. `renderAttacks()`, `renderSlotDots(i)`, `renderFeatureDots(i)`) |
| `open*()` | Makes a panel or dialog visible and populates it (e.g. `openInfoPanel()`, `openAttackPanel()`) |
| `dismiss*()` | Hides a panel or dialog and cleans up state (e.g. `dismissInfoPanel()`, `dismissAttackPanel()`) |
| `populate*()` | Fills in the fields of an already-visible panel from a state entry; called by the matching `open*()` (e.g. `populateSpellViewPanel(i)`) |
| `start*Press()` | `pointerdown` handler that starts a 500 ms hold timer; captures `e.currentTarget` before the async timeout so `.holding` can be added when the timer fires |
| `end*Press()` | Legacy `pointerup`-based tap handler; replaced by `click*Item()` on most elements — kept only where noted |
| `cancel*Press()` | `pointercancel` handler; clears the timer, resets the guard flag, and removes `.holding` |
| `click*Item()` | `onclick` handler that checks whether a hold already fired (via the `*PressActive` guard) before performing the tap action; used on all rollable elements so `onclick` (not `pointerup`) fires the roll — more reliable on touch devices where `pointercancel` can swallow a quick release |
| `roll*()` | Performs a dice roll and calls `showRoll()` (e.g. `rollAbility()`, `rollAttack()`, `rollSave()`) |
| `toggle*()` | Flips a boolean state value and updates the UI (e.g. `toggleInspiration()`, `toggleCondition()`) |
| `apply*()` | Commits a value from a dialog input to state (e.g. `applyHpDialog()`, `applyStatModDialog()`) |
| `recalc*()` | Recomputes derived values from current state and form inputs (e.g. `recalcAll()`) |
| `_*()` | Private helper; not intended to be called directly from HTML event attributes (e.g. `_populateAtkView()`, `_srdGet()`) |

#### Variable name suffixes

| Suffix | Meaning |
|---|---|
| `*Timer` | `setTimeout` handle for a hold / repeat interaction; cleared by `clearTimeout()` |
| `*Interval` | `setInterval` handle for a hold-to-repeat interaction; cleared by `clearInterval()` |
| `*Active` | Boolean set to `true` once a hold fires; used as a guard so the subsequent `click` / `pointerup` handler can tell that the short-tap action should not run |
| `*Idx` | Integer index into a state array for the item currently shown in a panel; `-1` means a new item not yet in the array |
| `*Key` | String key identifying the currently active item from a fixed set (e.g. `statModDialogKey`, `conditionPanelCurrentName`) |
| `*Body` | A scrollable or expandable container element for a section's content (e.g. `#spellSlotsBody`, `#infoTraitsBody`) |
| `*Backdrop` | A fixed full-screen semi-transparent overlay that sits behind a panel; tapping it dismisses the panel |

#### CSS class name conventions

| Pattern | Meaning |
|---|---|
| `.section` / `.section-title` / `.section-body` | Standard three-part card: outer border, dark header strip, padded content |
| `#panel-*` | One of the eight main tab panels (e.g. `#panel-combat`, `#panel-spells`) |
| `#*Backdrop` | Dim overlay behind a panel (e.g. `#attackPanelBackdrop`) |
| `#*Panel` / `#*Dialog` / `#*Menu` | A modal or bottom-sheet overlay (e.g. `#attackPanel`, `#hpDialog`, `#stepMenu`) |
| `.sp-*` | Spell panel class; also reused in the attack panel for shared layout elements (e.g. `.sp-mode-badge`, `.sp-name`, `.sp-description`) |
| `.rtz-*` | Roll tri-zone classes inside a `.roll-tri` element (`.rtz-top`, `.rtz-bottom`, `.rtz-adv`, `.rtz-dis`) |
| `.rr-*` | Roll result classes inside `#rollResult` (`.rr-total`, `.rr-breakdown`, `.rr-nat`) |
| `.atk-*` | Attack-panel-specific classes (`.atk-view-section`, `.atk-edit-section`, `.atk-hidden`) |
| `.fp-*` | Feature panel classes (`.fp-view-section`, `.fp-edit-section`) |
| `.tr-*` | Trait panel classes (`.tr-view-section`, `.tr-edit-section`, `.tr-name`) |
| `.srd-*` | SRD import modal classes (`.srd-result-item`, `.srd-results-box`, `.srd-hint`) |
| `.ai-*` | AI import modal classes (`.ai-mode-btn`, `.ai-type-btn`, `.ai-step`) |
| `.char-*` | Character roster overlay classes (`.char-grid`, `.char-card`, `.char-card-name`) |
| `.holding` | Applied during an active hold (500 ms timer running); provides visual press feedback; removed on `pointerup` / `pointercancel` |

---

### Key enum values

These are the discrete string values used in state fields. When the code falls back to a default with `||`, the fallback value is the one listed first.

| Field | Valid values | Default | Where used |
|---|---|---|---|
| `actionType` | `'action'`, `'bonus'`, `'reaction'`, `'other'` | `'action'` | `attacks[i].actionType` — Turn block sub-section |
| `combatActionType` | `'action'`, `'bonus'`, `'reaction'`, `'other'` | `'action'` | `entries[i].combatActionType` — same sub-section logic |
| `abilityMod` | `''`, `'STR'`, `'DEX'`, `'CON'`, `'INT'`, `'WIS'`, `'CHA'`, `'SPELL'`, `'manual'` | `''` | `attacks[i].abilityMod` — `''` = no attack roll; `'manual'` = use `bonus` string; otherwise computed |
| `attackMod` | same set as `abilityMod` | `''` | `entries[i].attackMod` — same semantics |
| `rolls[].type` | `'slashing'`, `'piercing'`, `'bludgeoning'`, `'fire'`, `'cold'`, `'lightning'`, `'thunder'`, `'acid'`, `'poison'`, `'necrotic'`, `'radiant'`, `'force'`, `'psychic'`, `'healing'`, `'not_damage'`, `'other'` | — | Damage type for a roll entry; `'not_damage'` for non-damage rolls; `'other'` uses `label` field |
| `rolls[].mod` | `''`, `'STR'`, `'DEX'`, `'CON'`, `'INT'`, `'WIS'`, `'CHA'`, `'SPELLMOD'`, `'SPELL'` | `''` | Modifier added to a roll result (`'SPELLMOD'` = spellcasting ability mod only; `'SPELL'` = full spell attack bonus) |
| `spellAbility` (form input) | `'STR'`, `'DEX'`, `'CON'`, `'INT'`, `'WIS'`, `'CHA'`, or blank | blank | Drives spell attack bonus and spell save DC |
| `DEFAULT_ACTIONS[i].type` | `'action'`, `'bonus'`, `'reaction'`, `'free'` | — | Categorises default D&D actions in the collapsible Default Actions list |
| `recharge` | `'Long Rest'`, `'Short Rest'`, `'Dawn'`, `'Turn'`, or any custom string | — | `entries[i].recharge` — shown as a label; no mechanical enforcement |
| `currentTheme` | `'gold'`, `'dark'`, `'red'`, `'forest'`, `'ocean'` | `'gold'` | Persisted in `localStorage` as `dnd5e_theme`; applied as `data-theme` on `<html>` |

---

## Top-level layout

```
dnd-character-sheet.html
├── <link>           Loads shared.css — design tokens, themes, shared component classes
├── <style>          Page-specific CSS — layout, page-specific classes, contextual overrides
├── <body>
│   ├── .header      Top bar (title, Undo/Save/Load buttons, character name, meta); scrolls with page content
│   ├── input#jsonFileInput   Hidden file picker for JSON import
│   ├── .tab-bar     Eight tab buttons (Info / Stats / Skills / Combat / Spells / Features / Gear / Rolls); sticky at viewport top during scroll
│   │                Each button carries data-tab="<id>" for programmatic activation
│   ├── #panel-overview    Tab: character info + features & traits (structured list, tap = roll or info panel, hold = info panel) + personality + Long Rest button
│   ├── #panel-abilities   Tab: ability scores + saving throws + passive perception + conditions
│   ├── #panel-skills      Tab: 18 skills with proficiency/expertise dots
│   ├── #panel-combat      Tab: HP tracker + combat stats + hit dice tracker + inspiration + death saves + attacks
│   ├── #panel-spells      Tab: Spellcasting ability · Spells Known (collapsible; hold title = info panel; each row has P dot and ∞ dot; header shows prepared-count/max with editable max input) · Spell Slots (hidden levels as "+ Nth" pills; active levels show dot rows) · Spells Prepared (hold title = info panel; lists all prepared + always-prepared spells)
│   ├── #panel-features    Tab: limited-use class features with dot trackers and +/− controls
│   ├── #panel-inventory   Tab: currency + equipment + proficiencies + notes
│   ├── #panel-rolls       Tab: session roll history log with Clear button
│   ├── #hpBackdrop  Fixed backdrop for HP dialog
│   ├── #hpDialog    Bottom-sheet for setting HP to a specific value
│   ├── #stepBackdrop  Fixed backdrop for feature editor sheet
│   ├── #stepMenu    Bottom-sheet for adding/editing a class feature (name, max, step, recharge)
│   ├── #rollBackdrop  Fixed backdrop for roll result overlay
│   ├── #rollResult  Fixed centered overlay showing the last roll result
│   ├── #spellBackdrop  Fixed backdrop for spell description / edit panel
│   ├── #spellPanel  Fixed centered overlay showing spell details (view mode) or editable form (edit mode)
│   ├── #attackPanelBackdrop  Fixed backdrop for attack view / edit panel
│   ├── #attackPanel  Fixed centered overlay showing attack details (view mode) or editable form (edit mode)
│   ├── #traitBackdrop  Fixed backdrop for the trait view/edit panel
│   ├── #traitPanel  Fixed centered overlay showing a feature/trait (view mode) or editable form (edit mode)
│   ├── #importHubBackdrop  Fixed backdrop for the 3-option import hub
│   ├── #importHubPanel  Fixed centered import hub modal with 3 actions: AI/SRD item import, character import, information import
│   ├── #aiImportBackdrop  Fixed backdrop for the AI/SRD import modal
│   ├── #aiImportPanel  Fixed centered modal for importing spells/features/traits/items; two modes — ✨ AI (prompt-copy + paste-back) and 📖 SRD; four type tabs: Spells / Features / Traits / Items
│   ├── #charImportPanel  Fixed centered modal for character import; AI mode (prompt + paste) and JSON mode (file picker)
│   ├── #descEnrichPanel  Fixed centered modal for information import; AI/SRD modes plus Missing-only/All-entries scope toggle
│   ├── #charGridOverlay  Fixed full-screen overlay for the character roster grid panel; open via the 🎭 header button; tap backdrop to dismiss
│   ├── #infoPanelBackdrop  Fixed full-screen dim layer behind the unified info panel; tap to dismiss
│   ├── #infoPanel  Fixed centered card (≤500 px, scrollable) — the generic unified info panel used for skills, abilities, saving throws, combat stats, hit die, death saves, and conditions (NOT for spells, traits, attacks, or class features — those have their own dedicated panels); badge + title + optional meta + optional 3-zone roll button + optional simple roll button + description + optional action button + "tap to dismiss" hint; `.show` reveals it
│   └── #toast       Floating feedback message (non-roll events only)
├── <script src="shared.js">  Shared utilities: mod/fmtMod/profBonus, dice functions, toast, showRoll, dismissRollResult, _applyTheme, openInfoPanel, dismissInfoPanel, infoPanelRoll/SimpleRoll/Edit/Action, infoPanelCfg, switchTab, setupSwipe
└── <script>         All page application logic (constants, state, build/calc/handler/persistence functions)
```

---

## CSS architecture

> **Design tokens, theme overrides, and all shared component classes live in `shared.css`**, which is loaded via `<link rel="stylesheet" href="shared.css">` before the inline `<style>` tag. The inline `<style>` contains only page-specific classes and contextual overrides.

### Design tokens (`:root` variables — defined in `shared.css`)

| Variable | Gold default | Role |
|---|---|---|
| `--bg` | `#1a1410` | Page background |
| `--surface` | `#2a2018` | Card/section background |
| `--surface2` | `#352a1e` | Section title strip |
| `--border` | `#5c4a2a` | All borders |
| `--border-rgb` | `92,74,42` | Border colour as `r,g,b` channels (used in `rgba()`) |
| `--gold` | `#c9a84c` | Primary accent colour — overridden by each theme |
| `--gold-light` | `#e8c96a` | Lighter accent — overridden by each theme |
| `--accent-rgb` | `201,168,76` | Accent colour as `r,g,b` channels (used in `rgba()`) |
| `--red` | `#c0392b` | Danger / failure (semantic; unchanged across themes) |
| `--red-light` | `#e74c3c` | Damage, failures, danger HP (semantic) |
| `--green` | `#27ae60` | Healthy HP, successes (semantic) |
| `--text` | `#e8d9b8` | Body text |
| `--text-muted` | `#9a8a6a` | Labels, secondary info |
| `--tab-active` | `#3d2e1a` | Active tab background |
| `--header-bg-1` | `#2a1a0a` | Header gradient start |
| `--header-bg-2` | `#1a0e05` | Header gradient end |
| `--tabbar-bg` | `#120d08` | Tab bar background |
| `--panel-bg-1` | `#2a1e0e` | Modal panel gradient start (roll result, spell panel, attack panel) |
| `--panel-bg-2` | `#1a1206` | Modal panel gradient end |
| `--spell` | `#5baeff` (gold theme) | Spell accent colour (concentration badges, spell panel borders, spell attack bonus); each non-gold theme overrides this with its own spell colour |
| `--spell-light` | `#7ec8ff` | Lighter spell accent (concentration badge chip) |
| `--spell-rgb` | `91,174,255` | Spell colour as `r,g,b` channels |
| `--spell-dark` | `#3d8fe0` | Pressed/active state of spell-coloured buttons |
| `--radius` | `8px` | Shared border-radius |
| `--shadow` | `0 2px 8px rgba(0,0,0,0.5)` | Shared box-shadow |
| `--roll-border` | `2px` | Border width on all tappable/rollable elements |

Themes are applied by setting `data-theme` on `<html>`. Each theme overrides the structural/accent variables above (but leaves `--red`, `--green`, `--radius`, `--roll-border` unchanged). Theme override rules are defined in `shared.css`.

| Theme key | Accent feel | Spell accent |
|---|---|---|
| `gold` | Warm gold (default) | Blue `#5baeff` |
| `dark` | Silver / slate | Purple `#b07fff` |
| `red` | Crimson | Amber `#ffad50` |
| `forest` | Emerald green | Teal `#40c8c0` |
| `ocean` | Sapphire blue | Violet `#c06eff` |

### Key component classes

| Class | Purpose |
|---|---|
| `.header` | Top bar section; `z-index: 100` |
| `.header-top` | Flex row inside header (title left, buttons right) |
| `.header-btn` | Undo / Save / Load buttons in the header; `:disabled` reduces opacity |
| `.tab-bar` | Sticky tab strip; `z-index: 99`; horizontally scrollable; pinned at `top:0` |
| `.tab-btn` | Individual tab button; `.active` adds gold underline |
| `.panel` | Tab content area; hidden by default; `.active` shows it |
| `.section` | Grouped content card (border + radius) |
| `.section-title` | Dark strip title bar inside a `.section` |
| `.section-body` | Padded content area inside a `.section` |
| `.field-row` | CSS grid row for form inputs; `.col-2` / `.col-3` variants |
| `.ability-grid` | 3-column grid of ability score cards |
| `.ability-card` | One ability score (name, large modifier, score input); short tap → roll d20 + modifier (normal); hold 500 ms → open info panel with description + 3-zone roll button |
| `.check-list` | Unstyled `<ul>` for saving throws and skills |
| `.check-item` | One row: dots + modifier + name + ability tag; tap row to roll, tap dot to toggle prof |
| `.check-item.proficient` | Fills the first (or only) prof dot gold |
| `.check-item.expert` | Fills both dots in `.prof-dots` gold-light |
| `.prof-dot` | Single circular dot (14 px) used in saving throws and equipment proficiencies; tap to toggle proficiency |
| `.prof-dots` | Flex container with two `.prof-dot`s used in skills (one `.prof-dot` in equipment proficiency rows); tap to cycle prof |
| `.equip-prof-group-header` | Section divider `<li>` inside `#equipProfList`; small-caps gold-muted text (e.g. "Armor", "Artisan Tools"); no dot or interaction |
| `.equip-prof-del-btn` | Small × button on the right of custom proficiency rows; red tint on hover; tap calls `deleteCustomEquipProf(name)` |
| `.equip-prof-active-item` | One row in the "Your Proficiencies" section (`#equipProfActiveBody`); contains `.equip-prof-active-name`; tap or hold opens info panel (description visible there only); `.holding` applied during 500 ms press |
| `.equip-prof-active-name` | Bold gold-light item name inside `.equip-prof-active-item` |
| `.equip-prof-active-empty` | Italic muted placeholder inside `#equipProfActiveBody` shown when no proficiencies are marked |
| `.hp-display` | Flex center area showing current HP, max, and bar; tap to open HP dialog |
| `.hp-bar` / `.hp-bar-fill` | Visual HP percentage bar |
| `.stat-pills` | 3-column grid of combat stat tiles |
| `.stat-pill` | One combat stat tile (value + label); short tap → rolls if rollable, otherwise opens info panel; hold 500 ms → always opens info panel. Pills that contain an `<input>` keep `--bg` (base) background to signal editability; the input's pointer events are stopped so the hold handler fires from the pill. |
| `.stat-pill.rollable` | Adds `cursor:pointer`, gold-accent border, and slight accent background; active state deepens both. Used for Initiative and Spell Attack. |
| `.stat-pill.interactive` | Same visual as `.rollable` but without an implicit roll on short-tap. Used for Spell DC (hold = info panel only). |
| `.stat-pill-mod` | Tiny gold badge line inside a stat pill; shown only when a custom bonus is non-zero (set via `openStatModDialog`); hidden by default via `display:none` |
| `#statModBackdrop` | Fixed dim layer behind the stat modifier dialog; tap to dismiss |
| `#statModDialog` | Bottom-sheet dialog for entering a custom numeric bonus for a combat stat; same structure as `#hpDialog`; opened by `openStatModDialog(key)` |
| `.death-saves` | Flex column stacking Successes above Failures; a `border-top` on `.save-group + .save-group` creates the horizontal divider |
| `.save-dot` | 22 px circle; `.filled` colors it green or red |
| `.inspiration-death-row` | Flex row containing the inspiration block (left) and death saves block (right) side by side inside a single `.section` |
| `.inspiration-block` | Compact left sub-card (`flex:0 0 auto`); holds `.insp-block-title` and the `#inspirationBtn`; centered column layout |
| `.insp-block-title` | Tiny gold uppercase label "Inspiration" inside `.inspiration-block` |
| `.death-block` | Wider right sub-card (`flex:1`); holds `.death-block-title` and the `.death-saves` column |
| `.death-block-title` | Tiny gold uppercase label "Death Saving Throws" inside `.death-block` |
| `.spell-level-row` | One spell-slot level row (label + dots + mini tracker + max input); only rendered when `max > 0` |
| `.spell-slots-add-row` | Flex-wrap pill strip at the top of `#spellSlotsBody`; shown only when one or more levels have `max === 0`; contains one `.spell-slot-add-btn` per hidden level |
| `.spell-slot-add-btn` | Dashed-border pill chip (e.g. `+ 3rd`); clicking calls `expandSpellLevel(i)` to set that level's max to 1 and make it appear |
| `.slot-dot` | 18 px circle; `.available` = gold left (remaining), `.used` = grey right (expended) |
| `.spell-section-title` | Extends `.section-title`; flex layout with `display:flex; justify-content:space-between; align-items:center; cursor:pointer`; used on the Spells Known and Spells Prepared section title bars; supports the hold-to-explain pattern; `.holding` class added on pointer-down |
| `.spell-level-divider` | Section header dividing spells by level (e.g. "Cantrips", "1st Level") inside `#spellsKnownBody` or `#spellsPreparedBody` |
| `.spell-item` | One spell row in either the Spells Known or Spells Prepared list; tap rolls the spell (attack or damage) if rollable, otherwise opens spell view panel; hold 500 ms opens spell view panel; `.holding` class added during hold |
| `.spell-item-name` | Bold spell name inside a `.spell-item` |
| `.spell-item-school` | Italic muted school label (right side) inside a `.spell-item` |
| `.spell-item-tag` | Small badge chip on a spell row; `.sp-tag-conc` = blue "C" (Concentration); `.sp-tag-ritual` = gold "R" (Ritual) |
| `.spell-empty-msg` | Italic placeholder shown in `#spellsKnownBody` or `#spellsPreparedBody` when the section has no entries |
| `.spell-prep-dot` | 20 px circular toggle button on the right of each Spells Known row; two per spell — the P dot (prepared) and the ∞ dot (always prepared); `.prepared` = spell-colour fill; `.always-prepared` = gold fill; `.at-max` = dimmed with `cursor:not-allowed` when the preparation limit is full |
| `.spell-prep-count` | Small muted label showing the current prepared count (e.g. `"3"`) or the `"/"` separator inside `.spell-prep-count-group` in the Spells Known section header; turns red (`.at-max`) when the prepared count equals `maxSpellsPrepared` |
| `.spell-prep-count-group` | Flex container (`gap:2px`) wrapping the count label, the `"/"` span, and the max input in the Spells Known header, so they read as a single `"3 / 5"` unit |
| `.prep-max-input` | 28 px number `<input>` in the Spells Known section header; edits `state.maxSpellsPrepared`; styled to match dark palette with no browser spin buttons |
| `.spell-known-chevron` | Inline chevron indicator (`▾`) inside the Spells Known section title; rotated −90 ° (via `.collapsed`) when the section is collapsed |
| `.trait-item` | One Features & Traits row in the Info tab; tap rolls damage directly if `rollDamage` is set, otherwise opens trait view panel; hold 500 ms opens trait view panel (with Delete/Cancel/Save footer); `.holding` class added during hold |
| `.trait-item-name` | Bold feature/trait name inside a `.trait-item` |
| `.trait-item-preview` | Truncated first line of the description (muted, small text, `text-overflow:ellipsis`) |
| `#traitBackdrop` | Fixed full-screen dim layer behind the trait panel; tap to dismiss |
| `#traitPanel` | Fixed centered card (≤500 px, scrollable) for viewing or editing a feature/trait; gold border in view mode, blue border in edit mode; `.edit-mode` toggles `.tr-view-section` / `.tr-edit-section` |
| `.tr-mode-badge` | Tiny uppercase label ("Feature / Trait" or "Editing Feature / Trait") at the top of the trait panel |
| `.tr-name` | Large feature/trait name heading inside the trait panel view section |
| `.tr-description` | Pre-wrapped description text block in the trait panel view section |
| `.tr-view-section` | Wrapper for all trait panel view-mode content; hidden when `#traitPanel.edit-mode` |
| `.tr-edit-section` | Wrapper for all trait panel edit form; hidden by default, shown when `#traitPanel.edit-mode` |
| `.eq-item-row` | One equipment item row in `#equipmentItemsBody`; gold-left-border tint; tap opens item view panel; hold 500 ms also opens view panel; `.holding` added during hold |
| `.eq-item-name` | Bold item name inside `.eq-item-row` |
| `.eq-item-qty` | Gold-light quantity badge (e.g. "×3") inside `.eq-item-row`; hidden when quantity = 1 |
| `.eq-item-tag` | Small muted category badge inside `.eq-item-row` (e.g. "Weapon") |
| `.eq-item-weight` | Muted weight label inside `.eq-item-row` (e.g. "3 lb") |
| `#equipItemBackdrop` | Fixed full-screen dim layer behind the equipment item panel; tap to dismiss |
| `#equipItemPanel` | Fixed centered card (≤500 px, scrollable) for viewing or editing an equipment item; gold border in view mode, blue border in edit mode; `.edit-mode` toggles `.eq-view-section` / `.eq-edit-section` |
| `.eq-mode-badge` | Tiny uppercase label ("Equipment" or "Editing Equipment") at the top of the equipment item panel |
| `.eq-panel-name` | Large item name heading inside the equipment panel view section |
| `.eq-panel-meta` | Muted meta line (qty · category · weight · cost) in the equipment panel view section |
| `.eq-panel-description` | Pre-wrapped description text block in the equipment panel view section |
| `.eq-view-section` | Wrapper for all equipment panel view-mode content; hidden when `#equipItemPanel.edit-mode` |
| `.eq-edit-section` | Wrapper for all equipment panel edit form; hidden by default, shown when `#equipItemPanel.edit-mode` |
| `.mini-tracker` | Flex row grouping `[−][counter][+]` tightly together |
| `.mini-btn` | 38 px circular button for mini trackers; `.minus` = red, `.plus` = green |
| `.mini-val` | Small `n/max` counter label inside a mini tracker |
| `.feature-row` | One class feature row: horizontal two-column layout — left column (name + dots) and right column (controls) |
| `.feature-left-col` | Left flex column inside `.feature-row`; `flex:1`; holds `.feature-name-area` above and `.feature-dots` below |
| `.feature-name-area` | Clickable area inside `.feature-left-col`; gold left-border tint; tap rolls damage directly if `rollDamage` is set, otherwise opens feature view panel; hold 500 ms opens feature view panel (with Delete/Cancel/Save footer); `.holding` class added during hold; shows feature name, tags, and (when `step > 1`) the pts/dot hint |
| `.feature-dots` | Wrapping flex row of `.slot-dot`s inside `.feature-left-col`, below `.feature-name-area` and outside the clickable zone — dots can be tapped independently |
| `.feature-step-hint` | Tiny italic label inside `.feature-name-area` below the feature name (e.g. "5 pts/dot"); shown only when `step > 1` |
| `.feature-right-col` | Right controls column inside `.feature-row`; stacks `.feature-ctrl-top`, `.mini-tracker`, and (for featured spells) recharge info vertically; separated from the left column by a subtle border |
| `.feature-ctrl-top` | Top row of `.feature-right-col`; flex row containing the recharge label, the restore button, and the EDIT button |
| `.feature-restore-btn` | 28 px circular ⏻ button in `.feature-ctrl-top`; resets uses to 0 for that feature/spell |
| `#featurePanelBackdrop` | Fixed full-screen dim layer behind the feature panel; tap to dismiss |
| `#featurePanel` | Fixed centered card (≤500 px, scrollable) for viewing or editing a class feature; gold border in view mode, blue border in edit mode; `.edit-mode` toggles `.fp-view-section` / `.fp-edit-section` |
| `.fp-view-section` | Wrapper for all feature panel view-mode content; hidden when `#featurePanel.edit-mode` |
| `.fp-edit-section` | Wrapper for all feature panel edit form; hidden by default, shown when `#featurePanel.edit-mode` |
| `#entryManagerBackdrop` | Fixed full-screen dim layer behind `#entryManagerPanel`; tap to dismiss |
| `#entryManagerPanel` | Bottom-sheet opened from Settings → 📋 All Entries; lists all `state.entries[]` alphabetically; `.em-entry-row` rows with `.em-entry-name` and `.em-entry-tags`; tap = view info panel, hold 500 ms = open matching edit panel |
| `.em-entry-row` | One row in `#entryManagerPanel`; flex layout with name on the left and tag pills on the right; `.holding` applied during 500 ms hold |
| `.em-entry-name` | Bold entry name text inside `.em-entry-row` |
| `.em-entry-tags` | Flex container for badge pills on the right of `.em-entry-row` |
| `.em-entry-tag` | Small badge pill (e.g. "Spell", "Feature", "Trait", "Combat") inside `.em-entry-tags` |
| `.attack-row` | 3-column grid: name / bonus / damage; `cursor:pointer`; tap to view/roll |
| `.attack-row.spell-atk` | Spell variant of `.attack-row`; blue left-border tint; tap rolls the spell directly (same logic as spell list rows); hold 500 ms opens info panel |
| `.attack-row.atk-hidden` | Hidden attack row shown faded (`opacity: 0.4`); always visible in the list |
| `.attack-section-label` | Gold uppercase section divider inside `#attackList` (e.g. "Actions", "Bonus Actions", "Reactions") |
| `.turn-section-title` | Extends `.section-title`; flex layout with `cursor:pointer`; adds `.holding` class on pointer-down for visual feedback |
| `.turn-hold-hint` | Small muted badge ("hold") on the right side of the Turn section title indicating the element is holdable |
| `.turn-defaults-header` | Collapsible header row below `#attackList`; uppercase muted text + chevron; tap to toggle default actions list |
| `.turn-chevron` | Right-side chevron in `.turn-defaults-header`; `transform: rotate(90deg)` when `.open` class is added |
| `.turn-defaults-body` | Container for default action rows; hidden by default; filled by `buildDefaultActions()` |
| `.default-action-row` | Flex row for a single default action item (name + type badge); tap opens info panel |
| `.default-action-name` | Name text in a `.default-action-row` |
| `.default-action-type` | Type badge in `.default-action-row`; variants `.bonus` (blue), `.reaction` (red), `.free` (gold); no modifier = action (muted) |
| `.attack-edit-btn` | Small muted bordered pill button; used for the "Edit" button in the top-right header of each dedicated view panel, for the `#ipEditBtn` inside `#infoPanel`, and for "+ Add" buttons in section headers |
| `.spell-lvl-pip` | Gold circle badge (15 px) showing spell level (1–9) next to a spell name in the combat block; not rendered for cantrips |
| `#attackPanelBackdrop` | Fixed full-screen dim layer behind the attack panel; tap to dismiss |
| `#attackPanel` | Fixed centered card (≤500 px, scrollable) showing attack details (view mode) or editable form (edit mode); gold border in view mode, blue border in edit mode; `.edit-mode` class toggles `.atk-view-section` / `.atk-edit-section` |
| `.atk-view-section` | Wrapper for all attack panel view-mode content; hidden when `#attackPanel.edit-mode` |
| `.atk-edit-section` | Wrapper for all attack panel edit form; hidden by default, shown when `#attackPanel.edit-mode` |
| `#infoPanelBackdrop` | Fixed full-screen dim layer behind `#infoPanel`; tap dismisses |
| `#infoPanel` | Fixed centered card; `.show` reveals it; `border-color` is set per invocation (gold default, red for death saves / conditions, etc.) |
| `#ipBadge` | Tiny uppercase badge label at the top of `#infoPanel` (e.g. "Skill", "Ability", "Combat Stat") |
| `#ipEditBtn` | "Edit" button in the top-right of `#infoPanel`; hidden when no `editFn` is provided |
| `#ipTitle` | Large title heading inside `#infoPanel` |
| `#ipMeta` | Italic muted subtitle line inside `#infoPanel`; hidden when empty |
| `#ipRollBox` | `.roll-tri` 3-zone roll button inside `#infoPanel`; hidden when no `rollFn` is provided |
| `#ipSimpleRollBox` | `.sp-atk-box` simple (no advantage/disadvantage) roll button inside `#infoPanel`; hidden when no `simpleRollFn` is provided |
| `#ipDesc` | Pre-wrapped description text block inside `#infoPanel` |
| `#ipActionBtn` | Action button at the bottom of `#infoPanel` (e.g. "Apply Condition" / "Remove Condition"); hidden when no `actionFn` is provided |
| `.condition-tag` | Pill chip; `.active` turns it red |
| `.currency-grid` | 5-column grid for CP/SP/EP/GP/PP |
| `#toast` | Fixed floating feedback pill (2 s); `.show` fades it in; used for non-roll events |
| `#rollBackdrop` | Fixed full-screen dim layer behind the roll result; tap to dismiss |
| `#rollResult` | Fixed centered card showing label, large total, breakdown, damage, nat callout |
| `#spellBackdrop` | Fixed full-screen dim layer behind the spell panel; tap to dismiss |
| `#spellPanel` | Fixed centered card (≤500 px, scrollable) showing spell details; gold border in view mode, blue border in edit mode; `.edit-mode` class toggles between `.sp-view-section` and `.sp-edit-section` |
| `.sp-mode-badge` | Tiny uppercase label ("Spell" / "Editing Spell") at the top of the spell panel; gold in view, blue in edit |
| `.sp-name` | Large spell name heading inside the spell panel |
| `.sp-meta` | Italic muted line (level · school · Concentration · Ritual) |
| `.sp-details-grid` | Two-column label/value grid for Casting Time, Range, Components, Duration |
| `.sp-detail-label` | Tiny uppercase gold label in the details grid |
| `.sp-detail-value` | Value text in the details grid |
| `.sp-save-dc-box` | Gold-tinted box shown only when the spell has a saving throw; displays the current Spell Save DC and ability |
| `.sp-save-dc-value` | 34 px bold DC number inside `.sp-save-dc-box` |
| `.sp-atk-box` | Blue-tinted tappable card; used for simple (non-d20) roll buttons where advantage/disadvantage doesn't apply |
| `.sp-atk-bonus` | 34 px bold value in blue inside `.sp-atk-box` |
| `.sp-atk-damage` | Small secondary line inside `.sp-atk-box` |
| `.roll-tri` | 3-zone d20 roll button: top zone = normal roll, bottom-left = disadvantage, bottom-right = advantage; gold border; used in `#infoPanel`, spell panel, and attack panel |
| `.rtz-top` | Top zone of `.roll-tri`; displays roll label and bonus; tap triggers normal roll |
| `.rtz-label` | Tiny uppercase label inside `.rtz-top` (e.g. "Skill Check") |
| `.rtz-bonus` | Large bold modifier value inside `.rtz-top` (e.g. "+5") |
| `.rtz-damage` | Optional small secondary line inside `.rtz-top` (e.g. damage expression) |
| `.rtz-bottom` | Flex row containing `.rtz-dis` and `.rtz-adv` side by side |
| `.rtz-dis` | Left half of `.rtz-bottom`; red tint; tap triggers disadvantage roll |
| `.rtz-adv` | Right half of `.rtz-bottom`; green tint; tap triggers advantage roll |
| `.sp-description` | Pre-wrapped description text block |
| `.sp-dismiss-hint` | Tiny uppercase footer "tap to dismiss" shown at the bottom of all view panels (`#infoPanel` and the four dedicated panels) |
| `.sp-view-section` | Wrapper for all view-mode content; hidden when `#spellPanel.edit-mode` |
| `.sp-edit-section` | Wrapper for all edit-mode content; hidden by default, shown when `#spellPanel.edit-mode` |
| `.sp-edit-field` | Labeled field wrapper inside the edit form; label in blue uppercase |
| `.sp-edit-checkbox-row` | Flex row for Concentration and Ritual checkboxes |
| `.sp-edit-save-btn` | Green filled button (`var(--green)`, theme-invariant); in view mode labeled "Edit" and opens the edit form; in edit mode labeled "Save" and persists changes then dismisses |
| `.sp-edit-cancel-btn` | Muted button; dismisses the panel without saving (both view and edit mode) |
| `.sp-edit-delete-btn` | Red-tinted button (left-aligned via `margin-right:auto`); in view mode deletes the item immediately with a confirm dialog; in edit mode same; hidden when `i = -1` (new item, edit mode only) |
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
| `#stepBackdrop` | Fixed dim layer behind the legacy feature editor sheet (retained in HTML but no longer triggered) |
| `#stepMenu` | Legacy bottom-sheet for adding/editing class features; superseded by `#featurePanel` |
| `#settingsBackdrop` | Fixed dim layer behind the settings sheet; tap to dismiss |
| `#settingsMenu` | Bottom-sheet opened by the ⚙ Settings header button; contains Save, Creature Stat Blocks shortcut, font-size, lefty-mode, theme, and language controls |
| `.settings-full-btn` | Full-width action button used in Settings and import-related modals |
| `.settings-divider` | Thin horizontal rule separating sections inside the settings sheet |
| `.settings-row` | Flex row pairing a label+sub-label on the left with a control on the right |
| `.font-ctrl` | Flex row grouping `[−][value][+]` for the font-size control |
| `.font-ctrl-btn` | 36 px circular `−`/`+` buttons for font-size adjustment |
| `.font-ctrl-value` | Gold-light bold label showing current font size percentage |
| `.settings-toggle` | Pill-shaped On/Off toggle button; `.on` styles it gold when active |
| `.theme-swatches` | Flex row containing one `.theme-swatch` button per available theme |
| `.theme-swatch` | 30 px circular swatch button; `.active` adds a white ring and 1.15× scale; `data-theme` attribute matches a key in `THEMES` |
| `.tracker-row` | Flex row wrapping hit-dice dots + mini-tracker (replaces inline flex style) |
| `body.lefty` | Applied when lefty mode is on; swaps CSS `order` of `.feature-left-col` and `.feature-right-col` in feature rows, and of dots and mini-tracker in spell-slot and hit-dice tracker rows |
| `.char-grid-overlay` | Fixed full-screen overlay (dark + blur backdrop) for the character roster panel; `.open` switches `display` to `flex` and centers `.char-grid-panel` |
| `.char-grid-panel` | Centered modal card inside `.char-grid-overlay`; max 560 px wide, max 88 vh tall; flex column: header / scrollable grid / footer |
| `.char-grid-header` | Title row at the top of `.char-grid-panel`; contains `.char-grid-title` and `.char-grid-close` |
| `.char-grid-title` | Gold uppercase "Characters" label inside `.char-grid-header` |
| `.char-grid-close` | ✕ dismiss button in `.char-grid-header`; calls `closeCharMenu()` |
| `.char-grid-scroll` | Scrollable flex-growing area inside `.char-grid-panel`; wraps `.char-grid` |
| `.char-grid` | CSS grid (`auto-fill`, min 130 px per column) containing `.char-card` elements |
| `.char-card` | One character card: circular portrait, name, race·class meta; clicking calls `switchCharacter(id)` |
| `.char-card.active` | Active character variant: gold border, subtle glow, gold name text |
| `.char-card-portrait` | 72 × 72 px circular image area; shows portrait `<img>` or 👤 placeholder emoji |
| `.char-card-info` | Text block below portrait inside `.char-card`; contains `.char-card-name` and `.char-card-meta` |
| `.char-card-name` | Bold character name (truncated with ellipsis); gold when `.active` |
| `.char-card-meta` | Small muted line below name: race · class (e.g. "Elf · Wizard"), or "—" when both are blank |
| `.char-card-del` | Absolute-positioned ✕ delete button (top-right of card); hidden until the card is hovered |
| `.char-grid-footer` | Bottom strip of `.char-grid-panel`; holds the "+ New Character" button |
| `.char-menu-new-btn` | Full-width dashed "+ New Character" button in `.char-grid-footer`; calls `newCharacter()` |
| `.portrait-section` | Centered column widget at the top of the Character Info section; wraps portrait box + action buttons |
| `.portrait-box` | 120×120 px bordered container for the character portrait; tapping it triggers the hidden file input |
| `.portrait-img` | `<img>` element inside `.portrait-box`; `object-fit:cover`; hidden when no portrait is set |
| `.portrait-placeholder` | Centered column shown inside `.portrait-box` when no portrait exists; person icon + hint text |
| `.portrait-actions` | Flex row holding the Upload and Remove buttons below `.portrait-box` |
| `.portrait-btn` | Muted bordered button used for portrait upload/remove actions |
| `.portrait-remove-btn` | Modifier on `.portrait-btn`; red tint; hidden until a portrait is set |
| `.ai-mode-row` | Flex row containing the AI / SRD mode toggle buttons at the top of `#aiImportPanel` |
| `.ai-mode-btn` | One of the two mode-toggle pill buttons (✨ AI or 📖 SRD); `.active` styles it gold |
| `.ai-type-toggle` | Flex row containing type/scope tab buttons in import modals (e.g. Spells/Features/Traits/Items in `#aiImportPanel`) |
| `.ai-type-btn` | One type-tab button; `.active` styles it in spell blue |
| `.import-upper` | Fixed-height wrapper (`min-height: 360px`) containing both `#aiModeContent` and `#srdModeContent`; prevents the panel from resizing when switching between AI and SRD tabs or between type tabs |
| `.ai-step` | Labeled step block (step label + input) in the AI mode content area |
| `.ai-step-label` | Tiny gold uppercase label above each step (e.g. "Step 1 — Describe what to add") |
| `.ai-prompt-box` | Shared text area / input style used in `#aiImportPanel` for both the "what to add" field and the paste-back area; focus turns border spell-blue |
| `.ai-copy-notice` | Small feedback line below the "Copy" or "Add Selected" button; spell-light colour |
| `.ci-schema-status` | Status line inside `#charImportPanel` showing schema load result; `.ok` modifier makes it green |
| `.ci-file-picker` | Flex column holding the "Select JSONGeneration.md" and "Use built-in schema" fallback buttons; shown only when auto-fetch fails |
| `.ci-or-divider` | Centred "or" separator between the two fallback buttons in `.ci-file-picker` |
| `.ai-select` | Full-width `<select>` styled to match the panel's dark palette; used for race / class pickers in SRD mode |
| `.srd-level-row` | Flex row containing the "Level min – max" number inputs in the class-features SRD control block |
| `.srd-lv-input` | Small 44 px number input for level bounds in the SRD class-features selector |
| `.srd-results-box` | Scrollable (max 200 px) container for the SRD search results / trait / feature list |
| `.srd-result-item` | One checkable row in `#srdResults`; flex row with a checkbox and a name span |
| `.srd-lv-group` | Level-group header row in the class-features results (e.g. "Level 3"); gold uppercase, subtle background |
| `.srd-hint` | Centred muted placeholder text shown when `#srdResults` is idle or has no matches |
| `.srd-loading` | Same style as `.srd-hint`; used while an SRD fetch is in progress |
| `.ica-label-row` | Flex row inside each edit panel's Description field; holds the label on the left and the `✨ Fill` button on the right |
| `.ica-fill-btn` | Small spell-blue bordered button that toggles the Item Content Assist section |
| `.item-content-assist` | Collapsible block shown below the Description label in edit panels; spell-blue tinted background |
| `.ica-tabs` | Two-button tab row inside `.item-content-assist` (📖 SRD / ✨ AI Prompt) |
| `.ica-tab` | One tab button; `.active` styles it spell-blue |
| `.ica-status` | Status / hint line below the tabs |
| `.ica-preview` | Scrollable text box showing a SRD description preview before applying |
| `.ica-btn-row` | Flex row for action buttons (Search SRD, Apply All Fields, Desc Only) |
| `.ica-copy-notice` | Temporary "✓ Copied!" feedback line in AI Prompt mode |
| `.ica-paste-area` | Textarea for pasting an AI response in AI Prompt mode |

---

## JavaScript architecture

### Constants

```js
ABILITIES       // ['STR','DEX','CON','INT','WIS','CHA']
ABILITY_NAMES   // ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma']
ABILITY_DESCS   // {STR,DEX,CON,INT,WIS,CHA} — one-paragraph description of each ability score; used in ability card hold panels
SAVES           // [{name, ab}] — 6 saving throw definitions
SKILLS          // [{name, ab}] — 18 skill definitions; each entry has a .desc field with a short description used in the skill info panel
CONDITIONS      // array of {name, desc} objects — 15 conditions with descriptions
EQUIP_PROF_GROUPS  // array of {group, items[]} — predefined armor/weapon/tool proficiency groups for the Inventory tab;
                   //   each item: {name, desc}; groups: Armor, Weapons, Artisan Tools, Other Tools & Kits,
                   //   Musical Instruments, Gaming Sets, Vehicles
STAT_PILL_INFO  // {ac, initiative, speed, dietype, spellatk, spelldc} — metadata for each combat stat pill; each entry has title, meta, desc; rollable entries add rollLabel/rollFn; simpleRollFn for hit die
SPELL_SLOTS_DEFAULT  // [{level, max}] — 9 levels, all max:0 except 1st:2
LEVEL_LABELS    // ['Cantrip','1st','2nd',...,'9th'] — display labels for spell levels 0–9
DEFAULT_ACTIONS // [{key, name, type, description}] — standard D&D 5e actions; type ∈ 'action'|'bonus'|'reaction'|'free'
TABS            // ['overview','abilities','combat','spells','features','inventory','dice','rolls']
                //   Order used by swipe navigation and switchTab()
FONT_SIZES      // [75, 85, 100, 110, 125, 150] — allowed zoom levels in percent
THEMES          // ['gold', 'dark', 'red', 'forest', 'ocean'] — valid data-theme values
```

### Runtime state object

```js
let state = {
  abilities:          { STR, DEX, CON, INT, WIS, CHA },  // integers 1–30
  saveProficiencies:  [],   // ability keys e.g. ['STR', 'CON']
  skillProficiencies: [],   // skill names e.g. ['Perception']
  skillExpertise:     [],   // skill names (subset of skillProficiencies)
  equipProficiencies: [],   // item/category names e.g. ['Light Armor', 'Martial Weapons']
  customEquipProfRows:[],   // user-added item names (appear at bottom of proficiency list)
  inspiration:        false,
  hpCurrent:          10,
  spellSlots:         [ { level, max, used } ],  // 9 entries; levels with max=0 render as collapsed rows
  entries:            [ {                        // unified array: all spells, class features, and traits
                          name,                  //   string — display name
                          description,           //   free text (newlines preserved)
                          showInSpells,          //   boolean — true → appears in Spells tab lists
                          showInFeatures,        //   boolean — true → appears in Features tab with dot tracker
                          showInTraits,          //   boolean — true → appears in Info tab Features & Traits
                          showInCombat,          //   boolean — true → appears in Turn block (Combat tab)
                          combatActionType,      //   'action' | 'bonus' | 'reaction' | 'other' (default: 'action')
                          level,                 //   spell level 0–9 (0 = cantrip); 0 for non-spells
                          school,                //   e.g. "Evocation"; "" for non-spells
                          castingTime,           //   e.g. "1 action"; "" for non-spells
                          range,                 //   e.g. "120 ft"; "" for non-spells
                          components,            //   e.g. "V, S, M (...)"; "" for non-spells
                          duration,              //   e.g. "Instantaneous"; "" for non-spells
                          concentration,         //   boolean (false for non-spells)
                          ritual,                //   boolean (false for non-spells)
                          prepared,              //   boolean — true if prepared for the day (counts toward maxSpellsPrepared)
                          alwaysPrepared,        //   boolean — true if always prepared (does NOT count toward maxSpellsPrepared); mutually exclusive with prepared
                          attackRoll,            //   boolean — true if entry uses an attack roll
                          attackMod,             //   '' | 'manual' | 'STR'|…|'CHA'|'SPELL'
                          attackBonus,           //   string — manual bonus string; only used when attackMod='manual'
                          attackProficient,      //   boolean — add proficiency bonus to computed attack roll
                          rolls,                 //   array of roll objects: [{dice, type, label?, mod?}]
                                                 //     dice:  string — dice expression e.g. "4d6"
                                                 //     type:  damage type key (see ROLL_TYPES) or 'not_damage' or 'other'
                                                 //     label: string — custom label when type='other'
                                                 //     mod:   modifier key ('STR'|…|'CHA'|'SPELLMOD'|'SPELL'|'')
                          saveAbility,           //   ability key for saving throw or ''
                          saveDC,                //   integer override DC; 0 = use character's spell save DC
                          max,                   //   integer — total uses / pool for tracked entries; 0 = no tracker
                          used,                  //   integer — uses already expended (reset on Long Rest)
                          step,                  //   integer — uses per dot (default 1)
                          recharge,              //   string — recharge label (e.g. 'Long Rest') or ''
                          damage,                //   legacy damage expression; prefer rolls[] for new entries
                          rollDamage,            //   boolean — true if tap should roll the damage expression
                        } ],
  attacks:            [ {
                          name,                  //   string — weapon or ability name
                          abilityMod,            //   '' | 'manual' | 'STR'|'DEX'|'CON'|'INT'|'WIS'|'CHA'|'SPELL'
                                                 //     '' = no attack roll; 'manual' = use bonus string; others = computed
                          proficient,            //   boolean — add proficiency bonus to computed attack roll
                          flatBonus,             //   integer — additional flat modifier added to computed roll
                          bonus,                 //   string — manual attack roll modifier (only used when abilityMod='manual')
                          rolls,                 //   array of roll objects: [{dice, type, label?, mod?}]
                          actionType,            //   'action' | 'bonus' | 'reaction' | 'other' (default: 'action')
                          hidden,                //   boolean — shows row faded in the combat list; toggled via the edit panel checkbox
                          saveAbility,           //   ability key for a saving throw option, or ''
                          saveDC,                //   integer save DC, or 0
                          description,           //   free text — weapon masteries, special effects, etc.
                      } ],
  conditions:         [],   // condition name strings
  hitDiceUsed:        0,    // number of hit dice expended; max = charLevel
  diceRoller:         null, // null = use defaults [{sides:4,count:1},…,{sides:100,count:1}]; array when customised
  portrait:           null, // base64 data URL string (e.g. "data:image/png;base64,...") or null
  statMods:           {     // custom numeric bonuses added on top of each combat stat
    ac: 0,            //   added to AC input value for display (visual badge only)
    speed: 0,         //   added to Speed input value for display (visual badge only)
    initiative: 0,    //   added to DEX modifier when computing statInit display & roll
    spellatk: 0,      //   added to prof+spellMod when computing statSpellAtk display & roll
    spelldc: 0,       //   added to 8+prof+spellMod when computing statSpellDC display
  },
  maxSpellsPrepared:  0,    // daily preparation limit for spells with prepared:true; 0 = no limit enforced
  damageResistances:  {     // damage-type resistance states; absent key = normal (0)
    // slashing: 1,   //   1  = resistant (green dot)
    // necrotic: 2,   //   2  = immune (black dot)
    // fire: -1,      //  -1  = vulnerable (red dot)
    // ...            //   0 or absent = normal (empty dot)
  },
}
```

Session-only (not persisted to localStorage):
```js
rosterActiveId      // string — id of the currently loaded character (written to roster.activeId on save)
charMenuOpen        // boolean — true while the character grid overlay is visible
undoStack           // array of undo action objects (max 50)
rollLog             // array of roll history entries (max 50)
longPressTimer      // setTimeout handle for attack long-press
longPressActive     // boolean — suppresses roll on release after long-press
spellPressTimer     // setTimeout handle for spell long-press (500 ms → edit mode)
spellPressActive    // boolean — true during and after a held spell press
spellPanelEditIdx   // index into state.entries[] currently being edited in the spell panel; −1 = new spell
traitPressTimer     // setTimeout handle for trait row long-press (500 ms → edit mode)
traitPressActive    // boolean — true during and after a held trait press
traitPanelEditIdx   // index into state.entries[] currently being edited in the trait panel; −1 = new trait
attackPanelIdx      // index into state.attacks currently being edited; −1 = new attack
abilityUndoTimers   // {[ab]: timerId} — debounce timers for ability undo entries
hpHoldTimer/Interval       // hold-to-repeat timers for HP +/− buttons
spellsKnownCollapsed       // boolean — true when the Spells Known section body is collapsed; initialised to true on every page load; not persisted
spellsKnownTitlePressTimer / spellsKnownTitlePressActive   // Spells Known header hold detection (tap = toggle collapse, hold 500 ms = info panel)
spellsPreparedTitlePressTimer / spellsPreparedTitlePressActive  // Spells Prepared header hold detection (hold 500 ms = info panel)
slotHoldTimer/Interval     // hold-to-repeat timers for spell slot +/− buttons
featureHoldTimer/Interval  // hold-to-repeat timers for feature +/− buttons
featSpellHoldTimer/featSpellHoldInterval/featSpellHoldPending  // hold-to-repeat timers for featured spell +/− buttons
featTraitHoldTimer/featTraitHoldInterval/featTraitHoldPending  // hold-to-repeat timers for featured trait +/− buttons
hitDiceHoldTimer/Interval  // hold-to-repeat timers for hit dice +/− buttons
featureNamePressTimer      // setTimeout handle for feature name long-press (500 ms → edit mode)
featureNamePressActive     // boolean — true during and after a held feature name press
featurePanelEditIdx        // index into state.entries[] currently being edited in the feature panel; −1 = new feature
_emPressIdx                // index into state.entries[] for the entry row being pressed in #entryManagerPanel; −1 when none
_emPressTimer              // setTimeout handle for the hold timer on an entry row in #entryManagerPanel
infoPanelCfg        // shared.js — object holding the rollFn, simpleRollFn, editFn, actionFn closures for the currently-open #infoPanel
skillPressTimer / skillPressActive / skillPanelCurrentName  // skill row hold detection + current skill name
equipProfPressTimer / equipProfPressActive  // equipment proficiency row hold detection (tap = info panel, hold 500 ms = same)
equipProfAllCollapsed                       // boolean — true when the "All Proficiencies" section body is hidden; default true; not persisted
equipProfAllTitlePressTimer / equipProfAllTitlePressActive   // "All Proficiencies" title hold detection (tap = toggle collapse, hold 500 ms = info panel)
equipProfActiveTitlePressTimer / equipProfActiveTitlePressActive  // "Your Proficiencies" title hold detection (hold 500 ms = info panel)
conditionPressTimer / conditionPressActive / conditionPanelCurrentName  // condition chip hold detection
abilityPressTimer / abilityPressActive  // ability card hold detection (500 ms → info panel)
statPillPressTimer / statPillPressActive  // combat stat pill hold detection (500 ms → info panel)
statModDialogKey    // string key ('ac'|'speed'|'initiative'|'spellatk'|'spelldc') for the currently-open stat modifier dialog
inspirationPressTimer / inspirationPressActive  // inspiration button hold detection (tap = toggle, hold 500 ms = info panel)
savePressTimer / savePressActive        // saving throw row hold detection
statPillPressTimer / statPillPressActive  // combat stat pill hold detection
hitDiePressTimer / hitDiePressActive    // hit die roll button hold detection
fontSizeIdx         // index into FONT_SIZES; persisted separately in localStorage as 'dnd5e_fontsize'
leftyMode           // boolean; persisted separately in localStorage as 'dnd5e_lefty'
currentTheme        // string — active theme key; persisted in localStorage as 'dnd5e_theme'
srdModalMode        // 'ai' | 'srd' — which tab is active in #aiImportPanel
srdSelected         // Set<string> — SRD item indices checked in the current SRD results list
_charImportSchema   // string | null — schema text loaded for AI character import; null until loaded
```

All other values (character name, HP max, AC, etc.) live in HTML form inputs and are read directly via `document.getElementById`.

---

### Initialisation flow

```
DOMContentLoaded
  └─ loadTheme()       restore theme from localStorage; set data-theme on <html>; mark active swatch
  └─ loadFontSize()    restore font-size zoom from localStorage; apply to body
  └─ loadLeftyMode()   restore lefty-mode flag from localStorage; apply body.lefty class
  └─ init()
       ├─ loadData()          restore state + form fields from localStorage
       ├─ buildAbilityGrid()  inject ability cards (+ saving throw rows) into #abilityGrid
       ├─ buildSkillsList()   inject skill rows into #skillsList
       ├─ buildEquipProfList() sync chevron + collapse state; inject proficiency rows into #equipProfList; always calls buildEquipProfActiveList()
       ├─ buildConditions()   inject condition chips into #conditionsGrid
       ├─ buildSpellsKnown()   inject spell rows with P/∞ dots into #spellsKnownBody (collapsed by default); levels with max=0 appear only as pills
       ├─ buildSpellsPrepared() inject prepared+always-prepared spell rows into #spellsPreparedBody; calls updatePreparedCount()
       ├─ buildSpellSlots()   inject pill strip + active rows into #spellSlotsBody; levels with max=0 appear only as pills
       ├─ buildFeatures()       inject all entries with showInFeatures:true into #featuresBody (sorted spells-first)
       ├─ buildInfoTraits()         inject all entries with showInTraits:true into #infoTraitsBody
       ├─ buildDiceRoller()         inject die rows into #diceRollerBody
       ├─ renderHitDice()           inject hit dice dots into #hitDiceDots
       ├─ buildDamageResistances() inject resistance/vulnerability dots into #dmgResistGrid
       ├─ recalcAll()         compute all derived values (modifiers, DC, etc.)
       ├─ setupAutoSave()     attach input/change listeners → saveData()
       └─ setupSwipe()        attach touchstart/touchend listeners for tab swiping
  └─ updateHeader()
  └─ updateHP()
  └─ renderAttacks()
  └─ set inspiration button state
```

`applyPayload(payload)` runs the same sequence (minus `loadData` and `setupAutoSave`) and is used for JSON import. It calls `buildFeatures()` and `buildInfoTraits()` as part of that sequence. It also auto-migrates old-format payloads that contain `spells`, `classFeatures`, or `infoTraits` arrays by merging them into `state.entries[]`.

---

### Build functions

| Function | What it renders | Reads from |
|---|---|---|
| `buildAbilityGrid()` | 6 ability cards in `#abilityGrid`; each card contains the score input, modifier, and a saving throw row with prof dot. Tap card → roll d20+mod; hold 500 ms → open info panel with 3-zone roll button. Tap save row → roll save; tap prof dot → toggle proficiency. | `state.abilities`, `state.saveProficiencies` |
| `buildDiceRoller()` | Die rows in `#diceRollerBody`; one row per entry in `getDiceRoller()`; default set is d4/d6/d8/d10/d12/d20/d100. Each row has a count tracker and a roll button. Custom dice (non-default sides) show a remove button. | `state.diceRoller` |
| `buildSkillsList()` | 18 skill rows; tap row → roll; tap prof dots → cycle prof | `state.skillProficiencies`, `state.skillExpertise` |
| `buildEquipProfList()` | Manages the collapsible "All Proficiencies" section: syncs the chevron and shows/hides `#equipProfAllBody` based on `equipProfAllCollapsed`; if collapsed returns early after calling `buildEquipProfActiveList()`; when expanded renders all predefined items (from `EQUIP_PROF_GROUPS`) plus custom rows into `#equipProfList`; each row has a single prof dot (gold = proficient); group headers use `.equip-prof-group-header`; custom rows include a × delete button | `state.equipProficiencies`, `state.customEquipProfRows`, `EQUIP_PROF_GROUPS` |
| `buildEquipProfActiveList()` | Renders the "Your Proficiencies" section (`#equipProfActiveBody`): shows only items in `state.equipProficiencies`, ordered to match `EQUIP_PROF_GROUPS` then custom rows; each row is a `.equip-prof-active-item` with a bold name only — description is shown in the info panel on hold; shows `.equip-prof-active-empty` placeholder when no proficiencies are set | `state.equipProficiencies`, `state.customEquipProfRows`, `EQUIP_PROF_GROUPS` |
| `buildConditions()` | 15 condition chips | `state.conditions` |
| `buildSpellSlots()` | Renders `#spellSlotsBody`: a pill strip of hidden levels (max=0) at the top, then one row per active level (max>0) with dots and mini +/− tracker | `state.spellSlots` |
| `expandSpellLevel(i)` | Sets `state.spellSlots[i].max` to 1 and rebuilds spell slots (moves that level from the pill strip into the active rows) | `state.spellSlots[i]` |
| `renderSlotDots(i)` | Dot row + counter for one spell level (gold left = available, grey right = used); counter shows `(max − used)/max` | `state.spellSlots[i]` |
| `buildSpellsKnown()` | Renders all entries with `showInSpells: true` grouped by level into `#spellsKnownBody`; each row includes a P dot (prepared toggle) and a ∞ dot (always-prepared toggle); P dots are dimmed with `.at-max` when the preparation limit is full; collapses body and rotates chevron when `spellsKnownCollapsed` is true; shows placeholder when empty | `state.entries`, `state.maxSpellsPrepared` |
| `buildSpellsPrepared()` | Renders entries with `showInSpells: true` and `prepared:true` or `alwaysPrepared:true` into `#spellsPreparedBody`; always-prepared entries show a ∞ badge; calls `updatePreparedCount()`; shows placeholder when no spells are prepared | `state.entries` |
| `updatePreparedCount()` | Refreshes the `#spellPrepCountDisplay` number and the `#maxPreparedInput` value; applies `.at-max` to the count span when the prepared count equals `state.maxSpellsPrepared` | `state.entries`, `state.maxSpellsPrepared` |
| `buildFeatures()` | All entries with `showInFeatures: true` rendered into `#featuresBody`; sorted spells-first then others; each row has a left column (clickable name area + dots below) and a right column (recharge label, ⏻ restore, EDIT button, mini tracker); pts/dot hint shown below the name when `step > 1`; empty-state placeholder when no entries | `state.entries` |
| `buildInfoTraits()` | Features & Traits rows in `#infoTraitsBody` (entries with `showInTraits: true`), or empty-state placeholder | `state.entries` |
| `buildEntryManager()` | Alphabetical list of all `state.entries[]` in `#entryManagerPanel`; each row shows name and tags (Spell / Feature / Trait / Combat badges); tap = view, hold 500 ms = edit | `state.entries` |
| `openEntryManager()` | Opens `#entryManagerPanel` and its backdrop; calls `buildEntryManager()` | — |
| `dismissEntryManager()` | Hides `#entryManagerPanel` and its backdrop | — |
| `switchToEntryManager()` | Saves current character and re-opens the Entry Manager (used after edit panel saves) | — |
| `renderFeatureDots(i)` | Dot row + counter for one featured entry, scaled by `step` | `state.entries[i]` |
| `renderHitDice()` | Hit dice dots in `#hitDiceDots`; max = character level | `state.hitDiceUsed`, `charLevel` input |
| `buildDamageResistances()` | **`shared.js`** — Resistance/immunity/vulnerability dot grid in `#dmgResistGrid`; one dot per damage type (13 types); dot is empty (normal), green (resistant), black (immune), or red (vulnerable) | `state.damageResistances` |
| `renderAttacks()` | Renders the Turn block: "Actions", "Bonus Actions", and "Reactions" sub-sections always rendered (with empty-state placeholders when empty); "Other" section rendered only when items exist; entries with `showInCombat: true` injected per section; hidden attacks faded (`atk-hidden`) | `state.attacks`, `state.entries` |
| `startTurnTitlePress(e)` | `pointerdown` on the "Turn" section title | Adds `.holding` class; starts 500 ms timer; on fire calls `openTurnInfoPanel()` |
| `endTurnTitlePress(e)` / `cancelTurnTitlePress()` | `pointerup` / `pointercancel` on "Turn" title | Clears timer; removes `.holding` class |
| `openTurnInfoPanel()` | Called on hold of "Turn" title | Opens info panel describing the parts of a turn (movement, action, bonus action, reaction, free interaction) |
| `toggleDefaultActions()` | Tap "Default Actions" collapsible header | Toggles `#defaultActionsList` visibility; rotates chevron; calls `buildDefaultActions()` on first open |
| `buildDefaultActions()` | Fills `#defaultActionsList` with rows from `DEFAULT_ACTIONS` | `DEFAULT_ACTIONS` constant |
| `startDefaultActionPress(e, key)` | `pointerdown` on a default action row | Starts 500 ms timer; on fire adds `.holding` to row and calls `openDefaultActionPanel(key)` |
| `endDefaultActionPress(e, key)` | `pointerup` on a default action row | If timer hadn't fired: calls `openDefaultActionPanel(key)`; always clears timer and removes `.holding` |
| `cancelDefaultActionPress()` | `pointercancel` on a default action row | Clears timer; removes `.holding` |
| `openDefaultActionPanel(key)` | Tap or hold on a default action row | Opens info panel with name, type badge, and description for the selected default action |
| `startFeatureCombatPress(e, i)` | `pointerdown` on a feature row in the combat block | Starts 500 ms timer; on fire opens feature panel (view mode) |
| `clickFeatureCombatItem(e, i)` | `click` on a feature row in the combat block | Rolls attack (opens panel) or rolls damage if only rolls are set; opens panel if neither |
| `cancelFeatureCombatPress()` | `pointercancel` on a feature row in the combat block | Clears timer |
| `makeSpellRow(sp, spIdx)` | Returns HTML string for one spell entry row in the combat block; shows gold level pip for level > 0 | `state.entries[spIdx]` |
| `makeTraitRow(t, tIdx)` | Returns HTML string for one trait/feature entry row in the combat block (gold colour scheme) | `state.entries[tIdx]` |
| `getSpellAtkBonus()` | Returns formatted spell attack bonus string (e.g. `"+5"`) from current spellcasting ability and proficiency bonus | form inputs, `state.abilities` |
| `renderRollLog()` | Roll history entries in #panel-rolls | `rollLog` |

---

### Dice helpers

| Function | Description |
|---|---|
| `d20()` | Returns a random integer 1–20 |
| `d20Roll(mode)` | Rolls one or two d20s depending on mode (`'normal'` / `'adv'` / `'dis'`); returns `{roll, breakdown}` where `roll` is the final value and `breakdown` is the display string (e.g. `"d20(14,8)"`) |
| `modeSuffix(mode)` | Returns `' (Adv)'`, `' (Disadv)'`, or `''`; appended to roll labels |
| `natMsg(roll)` | Returns `' ★ NAT 20!'`, `' ✦ Nat 1'`, or `''` |
| `rollDiceExpr(expr)` | Parses and rolls a dice expression (e.g. `"2d6+4"`, `"+2d8 radiant"`); returns integer total or `null` if unparseable |
| `getRollMod(modKey)` | Returns the numeric modifier for a `modKey` (`'STR'`/`'DEX'`/…/`'SPELLMOD'`/`'SPELL'`/`''`); `'SPELLMOD'` reads `state.abilities[spellAbility]` as a modifier; `'SPELL'` reads the full spell attack bonus from `#statSpellAtk` |
| `computeRollResults(rolls)` | Evaluates each roll in a `rolls` array; returns an array of formatted strings (`"Fire: 8"`, `"Guidance: 3"`) or `null` if no valid rolls |
| `getRollSummary(rolls)` | Returns a compact display string of all roll dice expressions joined by ` + ` (e.g. `"1d8 + 1d6"`) for list view |
| `getRollBoxLabel(rolls)` | Returns `'Damage'` if any roll has a standard damage type; otherwise `'Roll'` |
| `showRollsOnly(name, rolls)` | Evaluates a rolls array and shows result in the roll overlay; single roll shows as main total, multi-roll sums all and shows individual lines in secondary |
| `getAttackBonus(a)` | Returns the formatted to-hit bonus string for an attack, computed from `abilityMod`, `proficient`, and `flatBonus`; falls back to `a.bonus` for `abilityMod='manual'` |
| `getFeatureAttackBonus(f)` | Returns the formatted attack bonus for a class feature; falls back to `f.attackBonus` for `attackMod='manual'`, otherwise computes from ability score and `attackProficient` |
| `toggleFpAtkBonusFields()` | Called on `fpEditAttackMod` change; shows manual bonus input when `manual` is selected, shows/hides the Prof checkbox based on selection |
| `rollTypeOptions(sel)` | Returns `<option>` HTML for the damage-type dropdown with the given value selected |
| `rollModOptions(sel)` | Returns `<option>` HTML for the ability-mod dropdown with the given value selected |
| `buildRollRowHTML(r)` | Returns HTML for one edit-mode roll row (`dice` + `type` + optional `label` + `mod` + ✕ button) |
| `renderRollRows(containerId, rolls)` | Renders an array of roll objects into the named container element |
| `addRollRow(containerId)` | Appends a new blank roll row to the named container |
| `removeRollRow(btn)` | Removes the closest `.roll-row-edit` ancestor from the DOM |
| `getRollsFromContainer(containerId)` | Reads all roll rows from the named container and returns a filtered array (rows without dice are dropped) |
| `onRollTypeChange(sel)` | Shows/hides the custom label input when the type dropdown is changed to/from `'other'` |
| `toggleAtkBonusFields()` | Shows the manual bonus input or proficient+flat-bonus fields depending on `atkEditAbilityMod` selection |
| `_normalizeSpell(sp)` | Ensures a spell object has a `rolls` array and `prepared`/`alwaysPrepared` booleans; migrates legacy `damage` field if needed |
| `_normalizeFeature(f)` | Ensures a feature object has `rolls`, `attackRoll`, `attackMod`, `attackProficient`; migrates legacy `rollDamage`/`damage` |

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
| `startAbilityPress(e, ab)` | `pointerdown` on ability card | Starts 500 ms timer; on fire sets `abilityPressActive`, adds `.holding`, opens ability info panel via `openInfoPanel()` with roll button |
| `clickAbilityItem(e, ab)` | `onclick` on ability card | If guard not set: calls `rollAbility(ab)`; always clears timer and removes `.holding` |
| `cancelAbilityPress()` | `pointercancel` on ability card | Clears timer; removes `.holding` |
| `rollAbility(ab, mode='normal')` | Short tap on ability card or roll button in info panel | Rolls d20 + ability modifier with given mode; calls `showRoll()` |
| `toggleSaveProf(ab, el)` | Tap prof dot on saving throw row | Pushes undo; toggles ability key in `state.saveProficiencies` |
| `startSavePress(e, ab)` | `pointerdown` on saving throw row (outside dot) | Starts 500 ms timer; on fire sets `savePressActive`, adds `.holding`, opens saving throw info panel via `openInfoPanel()` |
| `clickSaveItem(e, ab)` | `onclick` on saving throw row | If guard not set: calls `rollSave(ab)`; always clears timer and removes `.holding` |
| `cancelSavePress()` | `pointercancel` on saving throw row | Clears timer |
| `rollSave(ab, mode='normal')` | Short tap on saving throw row or roll button in info panel | Rolls d20 + save modifier with given mode; calls `showRoll()` |
| `cycleSkillProf(name, el)` | Tap prof dots on skill row | Pushes undo; cycles None → Proficient → Expert → None |
| `startSkillPress(e, name)` | `pointerdown` on skill row | Starts 500 ms timer; on fire opens skill info panel via `openInfoPanel()` |
| `clickSkillItem(e, name)` | `click` on skill row | If timer hadn't fired: calls `rollSkill(name)` |
| `cancelSkillPress()` | `pointercancel` on skill row | Clears timer |
| `openSkillPanel(name)` | Internal (fired by hold timer) | Opens info panel for the given skill with roll button |
| `cycleEquipProf(name, el)` | Tap prof dot on equipment proficiency row | Pushes undo; toggles `name` in `state.equipProficiencies` (None ↔ Proficient); calls `buildEquipProfActiveList()` + `saveData()` |
| `openEquipProfPanel(name)` | Tap or hold on equipment proficiency row name area | Opens info panel (badge: "Proficiency") with item description from `EQUIP_PROF_GROUPS`; meta line shows "Proficient" or "Not Proficient" |
| `startEquipProfPress(e, name)` | `pointerdown` on equipment proficiency row name area | Starts 500 ms timer; on fire adds `.holding`, calls `openEquipProfPanel(name)` |
| `clickEquipProfItem(e, name)` | `click` on equipment proficiency row name area | If hold hadn't fired: calls `openEquipProfPanel(name)`; otherwise clears guard |
| `cancelEquipProfPress()` | `pointercancel` on equipment proficiency row | Clears timer; removes `.holding` from both `.check-roll-area` and `.equip-prof-active-item` |
| `startEquipProfAllTitlePress(e)` | `pointerdown` on "All Proficiencies" section title | Adds `.holding`; starts 500 ms timer; on fire opens info panel explaining the proficiency system |
| `endEquipProfAllTitlePress(e)` | `pointerup` on "All Proficiencies" title | If hold hadn't fired: toggles `equipProfAllCollapsed` and calls `buildEquipProfList()`; always clears timer and removes `.holding` |
| `cancelEquipProfAllTitlePress()` | `pointercancel` on "All Proficiencies" title | Clears timer; removes `.holding` |
| `startEquipProfActiveTitlePress(e)` | `pointerdown` on "Your Proficiencies" section title | Adds `.holding`; starts 500 ms timer; on fire opens info panel explaining the active section |
| `endEquipProfActiveTitlePress(e)` / `cancelEquipProfActiveTitlePress()` | `pointerup` / `pointercancel` on "Your Proficiencies" title | Clears timer; removes `.holding` |
| `showEquipProfAddInput()` | Tap `+ Add` button in the "All Proficiencies" section title bar | If section is collapsed, expands it first (`equipProfAllCollapsed = false`, calls `buildEquipProfList()`); then reveals `#equipProfAddRow` (text input + Add + ✕ buttons) inside the section body |
| `confirmAddEquipProf()` | Tap `Add` button or press Enter in add input | Validates name is non-empty and not a duplicate; pushes undo; appends to `state.customEquipProfRows`; calls `buildEquipProfList()` + `saveData()`; calls `cancelEquipProfAdd()` |
| `cancelEquipProfAdd()` | Tap ✕ or after confirm | Hides `#equipProfAddRow` |
| `deleteCustomEquipProf(name)` | Tap × on a custom proficiency row | Pushes undo; removes from `state.customEquipProfRows` and (if present) from `state.equipProficiencies`; calls `buildEquipProfList()` + `saveData()` |
| `dismissSkillPanel()` | (alias) | Clears `skillPanelCurrentName` and calls `dismissInfoPanel()` |
| `rollSkill(name, mode='normal')` | Short tap skill row or roll button in info panel | Rolls d20 + skill modifier with given mode; calls `showRoll()` |
| `rollInitiative(mode='normal')` | Tap Initiative stat pill (tap) or roll button in info panel | Rolls d20 + DEX modifier with given mode; calls `showRoll()` |
| `rollSpellAtk(mode='normal')` | Tap Spell Atk stat pill (tap) or roll button in info panel | Rolls d20 + spell attack bonus with given mode; calls `showRoll()` (shows toast if no spell ability set) |
| `rollSpellFromPanel(mode='normal')` | Tap zone in `.roll-tri` inside spell view panel | Reads current spell from `spellPanelEditIdx`; rolls d20 + spell attack bonus; rolls `sp.damage` as secondary if set; calls `showRoll()` |
| `rollAttack(i)` | Tap weapon attack row | If the attack is hidden, opens the panel in edit mode; if the attack has a bonus, rolls d20 + bonus and optionally rolls damage; otherwise opens info panel; no-ops if `longPressActive` |
| `startLongPress(e, i)` | `pointerdown` on weapon attack row | Starts 500 ms timer; on fire calls `openAttackPanel(i, false)` to open info/view mode |
| `cancelLongPress()` | `pointerup` / `pointercancel` on attack row | Clears the long-press timer |
| `openAttackPanel(i, editMode)` | Internal | Calls `pushModalHistory()`; populates view or edit form; sets `attackPanelIdx = i`; shows `#attackPanelBackdrop` and `#attackPanel`; `i = -1` means new attack |
| `switchToAtkEdit()` | Tap Save button in attack panel view mode (bottom button row) | Switches `#attackPanel` to edit mode by adding `.edit-mode`; populates edit form fields |
| `saveAttackPanel()` | Tap Save in attack panel edit mode | Validates name; creates or updates `state.attacks[attackPanelIdx]`; calls `renderAttacks()` + `saveData()`; dismisses panel |
| `deleteFromAttackPanel()` | Tap Delete in attack panel (view or edit mode) | Splices `state.attacks[attackPanelIdx]`; calls `renderAttacks()` + `saveData()`; dismisses panel |
| `dismissAttackPanel()` | Backdrop tap or Cancel in panel | Calls `popModalHistory()`; removes `.show` and `.edit-mode` from `#attackPanel` |
| `rollFromAttackPanel(mode='normal')` | Tap zone in `.roll-tri` inside attack panel view | Rolls d20 + attack bonus with given mode; rolls damage as secondary; calls `showRoll()` |
| `addAttack()` | "+ Add Attack" button | Opens attack panel in edit mode with empty form (`attackPanelIdx = -1`) |
| `applyHpDelta(delta)` | Core HP mutation (no undo) | Damage (`delta<0`): depletes temp HP first, then current HP. Healing (`delta>0`): if result exceeds max, overflow adds to temp HP. Calls `updateHP()` |
| `adjustHP(delta)` | +/− HP buttons (single tap) | Pushes undo (saves both `hpCurrent` and `hpTemp`); delegates to `applyHpDelta(delta)` |
| `startHpHold(delta)` / `stopHpHold()` | `pointerdown` / `pointerup` on HP buttons | Calls `adjustHP` immediately, then calls `applyHpDelta` at 80 ms intervals after a 500 ms delay |
| `resetHPToFull()` | ↺ Restore HP button | Pushes undo; sets `state.hpCurrent = hpMax`; calls `updateHP()` |
| `updateHP()` | Max/Temp HP input or any HP adjustment | Refreshes HP display, bar color, and max label |
| `openHpDialog()` | Tap HP display area | Populates and shows the HP bottom sheet; auto-selects the input after transition |
| `dismissHpDialog()` | Cancel button or backdrop tap | Slides the HP dialog down |
| `applyHpDialog()` | Set HP button or Enter key | Pushes undo; clamps input value to `[0, max]`; calls `updateHP()`; dismisses dialog |
| `expandSpellLevel(i)` | Tap `▸ Add` on collapsed slot row | Sets `state.spellSlots[i].max` to 1; calls `buildSpellSlots()` |
| `setSlotMax(i, val)` | Spell slot max input | Updates `state.spellSlots[i].max`; rebuilds entire slot list when crossing 0 ↔ non-zero boundary; otherwise rerenders dots only |
| `toggleSlot(i, j)` | Tap spell slot dot | Gold dot → use from here to end; grey dot → restore that dot |
| `slotAdjust(i, delta)` | Mini +/− buttons on slot row | Clamps `state.spellSlots[i].used` by ±1; `−` passes `+1` (use), `+` passes `−1` (restore); rerenders dots |
| `startSlotHold(i, delta)` / `stopSlotHold()` | `pointerdown` / `pointerup` on slot +/− | Hold-to-repeat at 80 ms |
| `restoreAllSlots()` | ↺ All button in Spell Slots section | Sets all slot `used` to `0`; rerenders all dot rows |
| `startSpellPress(e, i)` | `pointerdown` on spell row (spell list, featured spells, or combat list) | Starts 500 ms timer; adds `.holding` visual on fire; on fire opens spell info panel (view mode) |
| `clickSpellItem(e, i)` | `click` on spell row | If timer hasn't fired: rolls spell attack if `attackRoll` is true; rolls damage if `rollDamage && !attackRoll`; opens info panel if no roll is configured; clears timer |
| `cancelSpellPress()` | `pointercancel` on spell row | Clears timer and removes `.holding` class |
| `switchToSpellEdit()` | Tap Save button in spell view mode (bottom button row) | Adds `.edit-mode` to `#spellPanel`; populates edit form; focuses the name field |
| `startTraitPress(e, i)` | `pointerdown` on a trait row (Info tab or combat list) | Starts 500 ms timer; adds `.holding` visual on fire; opens trait info panel (view mode) |
| `clickTraitItem(e, i)` | `click` on a trait row | If timer hasn't fired: rolls damage if `rollDamage && damage`; opens info panel otherwise; clears timer |
| `cancelTraitPress()` | `pointercancel` on a trait row | Clears timer and removes `.holding` class |
| `switchToTraitEdit()` | Tap Save button in trait view mode (bottom button row) | Adds `.edit-mode` to `#traitPanel`; populates edit form; focuses the name field |
| `openTraitPanel(i, editMode)` | Internal | Calls `pushModalHistory()`; populates view or edit form; sets `traitPanelEditIdx = i`; shows `#traitBackdrop` and `#traitPanel`; `i = -1` means new trait |
| `addInfoTrait()` | Tap + Add in Features & Traits section header | Opens trait panel in edit mode with empty form; sets `traitPanelEditIdx = -1` |
| `populateTraitEditForm(i)` | Internal | Fills edit form from `state.entries[i]` including `showInCombat`, `combatActionType`, `showInFeatures`, `max`, `step`, `recharge`; calls `toggleTrFeaturesTrack()`; blanks all fields when `i = -1` |
| `saveTraitEdit()` | Tap Save in trait panel edit mode | Validates name; writes all fields including `showInFeatures`, `max`, `used`, `step`, `recharge` to `state.entries[idx]` or pushes new entry; calls `buildInfoTraits()` + `buildFeatures()` + `saveData()`; dismisses panel |
| `toggleTrFeaturesTrack(show)` | `onchange` on `#trEditShowInFeatures` checkbox | Shows or hides the `#trEditFeaturesTrack` block (Max Uses / Step / Recharge fields) |
| `renderFeatTraitDots(traitIdx)` | Any featured entry use/restore | Updates dots and counter for `state.entries[traitIdx]`; reads `max`, `used`, `step` |
| `toggleFeatTraitDot(traitIdx, j)` | Tap dot in a featured entry row | Gold → use from here right; grey → restore that dot (respects `step`) |
| `featTraitAdjust(traitIdx, delta)` | Featured entry mini +/− buttons | Changes `entry.used` by `±step`; rerenders dots |
| `startFeatTraitHold(traitIdx, delta)` / `stopFeatTraitHold()` / `cancelFeatTraitHold()` | `pointerdown` / `pointerup` / `pointercancel` on featured entry +/− | Hold-to-repeat at 80 ms |
| `restoreFeatTrait(traitIdx)` | ⏻ button on a featured entry row | Sets `entry.used = 0`; rerenders dots |
| `deleteCurrentTrait()` | Tap Delete in trait panel (view or edit mode) | `confirm()` dialog → splices `state.entries`; calls `buildInfoTraits()` + `buildFeatures()` + `saveData()`; dismisses panel |
| `dismissTraitPanel()` | Backdrop tap or Cancel in panel | Calls `popModalHistory()`; removes `.show` and `.edit-mode` from `#traitPanel` |
| `openSpellPanel(i, editMode)` | Internal | Calls `pushModalHistory()`; populates view or edit form; sets `spellPanelEditIdx = i` in both modes; shows backdrop + panel |
| `toggleSpellPrepared(i)` | Tap P dot on a Spells Known row | If the spell is already prepared: unprepares it. If not: checks `maxSpellsPrepared`; shows toast and briefly pulses `.at-max` on the dot if the limit is full; otherwise sets `prepared:true`, clears `alwaysPrepared`; calls `buildSpellsKnown()` + `buildSpellsPrepared()` + `saveData()` |
| `toggleSpellAlwaysPrepared(i)` | Tap ∞ dot on a Spells Known row | Toggles `alwaysPrepared`; when activating, clears `prepared` (mutually exclusive); calls `buildSpellsKnown()` + `buildSpellsPrepared()` + `saveData()` |
| `onMaxPreparedInput(val)` | Input event on `#maxPreparedInput` | Updates `state.maxSpellsPrepared`; calls `updatePreparedCount()` + `saveData()` |
| `startSpellsKnownTitlePress(e)` | `pointerdown` on `#spellsKnownTitle` | Adds `.holding`; starts 500 ms timer; on fire calls `openSpellsKnownInfoPanel()` |
| `endSpellsKnownTitlePress(e)` | `pointerup` on `#spellsKnownTitle` | Clears timer; removes `.holding`; if hold did NOT fire: toggles `spellsKnownCollapsed` and calls `buildSpellsKnown()` |
| `cancelSpellsKnownTitlePress()` | `pointercancel` on `#spellsKnownTitle` | Clears timer; removes `.holding` |
| `openSpellsKnownInfoPanel()` | Internal (fired by hold on Spells Known title) | Opens info panel explaining the P/∞ dot system, preparation rules, and cantrips |
| `startSpellsPreparedTitlePress(e)` | `pointerdown` on `#spellsPreparedTitle` | Adds `.holding`; starts 500 ms timer; on fire calls `openSpellsPreparedInfoPanel()` |
| `endSpellsPreparedTitlePress(e)` / `cancelSpellsPreparedTitlePress()` | `pointerup` / `pointercancel` on `#spellsPreparedTitle` | Clears timer; removes `.holding` |
| `openSpellsPreparedInfoPanel()` | Internal (fired by hold on Spells Prepared title) | Opens info panel explaining spell slots, known vs prepared classes, the max prepared formula, and always-prepared spells |
| `addSpell()` | Tap + Add button in Spells Known header | Opens spell panel in edit mode with empty form; sets `spellPanelEditIdx = -1` |
| `populateSpellViewPanel(i)` | Internal | Fills view-mode elements from `state.entries[i]`; shows save DC box if `saveAbility` is set (uses per-entry `saveDC` override when > 0, otherwise character's spell DC); shows attack roll card if `attackRoll` is `true`; shows rolls box if `rolls` is non-empty and `attackRoll` is false |
| `populateSpellEditForm(i)` | Internal | Fills edit form from `state.entries[i]` including `saveAbility`, `saveDC`, `attackRoll`, `rolls` (rendered via `renderRollRows`), `showInCombat`, `combatActionType`, `showInFeatures`, and `showInTraits`; blanks all fields when `i = -1` |
| `saveSpellEdit()` | Tap Save in edit mode | Validates name; writes all fields including `saveAbility`, `saveDC`, `showInCombat`, `combatActionType`, `showInFeatures`, `showInTraits`, and preserves `prepared`/`alwaysPrepared` from existing entry when editing; calls `buildSpellsKnown()` + `buildSpellsPrepared()` + `buildFeatures()` + `renderAttacks()` + `saveData()`; dismisses panel |
| `deleteCurrentSpell()` | Tap Delete in spell panel (view or edit mode) | Confirms; splices from `state.entries`; calls `buildSpellsKnown()` + `buildSpellsPrepared()` + `buildFeatures()` + `renderAttacks()` + `saveData()`; dismisses panel |
| `dismissSpellPanel()` | Backdrop tap or Cancel | Calls `popModalHistory()`; removes `.show` and `.edit-mode` from `#spellPanel` |
| `renderFeatureDots(i)` | Any feature use/restore | Updates dots and `n/max` counter for feature `i` |
| `toggleFeatureDot(i, j)` | Tap feature dot | Gold → use dots from here right; grey → restore that dot (respects `step`) |
| `featureAdjust(i, delta)` | Feature mini +/− buttons | Changes `f.used` by `±step`; rerenders dots |
| `startFeatureHold(i, delta)` / `stopFeatureHold()` | `pointerdown` / `pointerup` on feature +/− | Hold-to-repeat at 80 ms |
| `setFeatureMax(i, val)` | (internal — no longer called from the row UI; `max` is now changed only via the edit panel) | Updates `f.max`; clamps `f.used`; rerenders dots |
| `editFeature(i)` | EDIT button on a feature row | Calls `openFeaturePanel(i, true)` to open the feature in edit mode |
| `restoreFeature(i)` | ⏻ button on a feature row | Sets `f.used = 0`; rerenders dots; shows toast |
| `restoreAllFeatures()` | ↺ All button in Features section | Sets all feature `used` to `0`; rerenders all dot rows |
| `startEmPress(e, i)` | `pointerdown` on an entry row in `#entryManagerPanel` | Sets `_emPressIdx = i`; starts 500 ms timer; on fire adds `.holding`, calls `openEmEdit(i)` |
| `endEmPress(e, i)` | `pointerup` on an entry row in `#entryManagerPanel` | If hold hadn't fired: calls `openEmView(i)`; always clears timer and removes `.holding` |
| `cancelEmPress()` | `pointercancel` on an entry row in `#entryManagerPanel` | Clears timer; removes `.holding` |
| `openEmView(i)` | Tap on entry row in Entry Manager | Opens the generic info panel (view) for `state.entries[i]` |
| `openEmEdit(i)` | Hold on entry row in Entry Manager | Routes to `openSpellPanel(i)` / `openFeaturePanel(i)` / `openTraitPanel(i)` based on the entry's dominant `showIn*` flag |
| `startFeatureNamePress(e, i)` | `pointerdown` on `.feature-name-area` | Starts 500 ms timer; adds `.holding` visual on fire; on fire opens feature info panel (view mode) |
| `clickFeatureName(e, i)` | `click` on `.feature-name-area` | If timer hasn't fired: rolls damage if `rollDamage && damage`; opens info panel otherwise; clears timer |
| `cancelFeatureNamePress()` | `pointercancel` on `.feature-name-area` | Clears timer and removes `.holding` class |
| `switchToFeatureEdit()` | Tap Save button in feature view mode (bottom button row) | Adds `.edit-mode` to `#featurePanel`; populates edit form; focuses the name field |
| `openFeaturePanel(i, editMode)` | Internal | Calls `pushModalHistory()`; populates view or edit form; sets `featurePanelIdx = i`; shows `#featurePanelBackdrop` and `#featurePanel`; `i = -1` means new feature |
| `addFeature()` | + Add button | Calls `openFeaturePanel(-1, true)` (new feature mode) |
| `populateFeatureViewPanel(i)` | Internal | Fills view-mode elements from `state.entries[i]`; shows attack roll card if `attackRoll` and `attackMod` are set; shows rolls box if `rolls` is non-empty; shows save DC box if `saveAbility` is set |
| `populateFeatureEditForm(i)` | Internal | Fills edit form from `state.entries[i]` including `attackRoll`, `attackMod`, `attackBonus`, `attackProficient`, `rolls` (via `renderRollRows`); calls `toggleFpAtkBonusFields()`; blanks all fields when `i = -1` |
| `saveFeaturePanel()` | Tap Save in feature panel edit mode | Validates name; writes all fields including `attackRoll`, `attackMod`, `attackBonus`, `attackProficient`, `rolls` to `state.entries[idx]` or pushes new entry; calls `buildFeatures()` + `saveData()`; dismisses panel |
| `rollFeatureDamage()` | Tap rolls box in feature panel view mode | Calls `showRollsOnly()` with feature's `rolls` array |
| `rollFromFeaturePanel(mode)` | Tap attack roll card in feature panel view mode | Rolls d20 + computed feature attack bonus; shows all roll results in secondary |
| `deleteFeatureFromPanel()` | Tap Delete in feature panel (view or edit mode) | `confirm()` dialog → splices `state.entries`; calls `buildFeatures()` + `saveData()`; dismisses panel |
| `dismissFeaturePanel()` | Backdrop tap or Cancel | Calls `popModalHistory()`; removes `.show` and `.edit-mode` from `#featurePanel` |
| `renderHitDice()` | Any hit dice change or level change | Updates dots in #hitDiceDots; counter shows `(max − used)/max` |
| `toggleHitDie(j)` | Tap hit dice dot | Gold → use from here right; grey → restore that die |
| `hitDiceAdjust(delta)` | Hit dice mini +/− buttons | Changes `state.hitDiceUsed` by ±1; `−` button passes `+1` (use), `+` passes `−1` (restore) |
| `startHitDiceHold(delta)` / `stopHitDiceHold()` | `pointerdown` / `pointerup` on hit dice +/− | Hold-to-repeat at 80 ms |
| `restoreHitDice()` | ↺ Restore button in Hit Dice section | Sets `state.hitDiceUsed = 0`; rerenders |
| `fullLongRest()` | ⟳ Long Rest button in Overview panel | Restores HP to max, resets hit dice, all spell slots, all class features, all featured spell uses, and all featured trait uses; saves |
| `removeAttack(i)` | Tap Delete button in attack edit panel | Pushes undo; splices `state.attacks`; rerenders |
| `openInfoPanel(cfg)` | **`shared.js`** — Called by any item that opens the unified info panel | Applies badge, title, meta, description, optional 3-zone roll button, optional simple roll button, optional edit button, optional action button; calls `pushModalHistory()` (if present); stores `rollFn/simpleRollFn/editFn/actionFn` in `infoPanelCfg` |
| `dismissInfoPanel()` | **`shared.js`** — Backdrop tap or browser back | Calls `popModalHistory()` (if present); hides `#infoPanel` and backdrop; clears `infoPanelCfg` |
| `infoPanelRoll(mode)` | **`shared.js`** — Tap zone in `#ipRollBox` | Calls `infoPanelCfg.rollFn(mode)` |
| `infoPanelSimpleRoll()` | **`shared.js`** — Tap `#ipSimpleRollBox` | Calls `infoPanelCfg.simpleRollFn()` |
| `infoPanelEdit()` | **`shared.js`** — Tap Edit button (`#ipEditBtn`) in info panel | Dismisses info panel then calls `infoPanelCfg.editFn()` |
| `infoPanelAction()` | **`shared.js`** — Tap action button (`#ipActionBtn`) in info panel | Dismisses info panel then calls `infoPanelCfg.actionFn()` |
| `startStatPillPress(e, key)` | `pointerdown` on a combat stat pill | Starts 500 ms timer; on fire sets `statPillPressActive`, adds `.holding`, calls `openStatPillPanel(key)`. Input elements inside pills stop propagation so typing doesn't trigger hold. |
| `clickStatPillItem(e, key)` | `onclick` on a combat stat pill | If guard not set and stat is rollable: calls `rollInitiative()` or `rollSpellAtk()`; otherwise opens info panel; always clears timer and removes `.holding` |
| `cancelStatPillPress()` | `pointercancel` on stat pill | Clears timer; removes `.holding` |
| `openStatPillPanel(key)` | Internal | Opens `#infoPanel` with data from `STAT_PILL_INFO[key]`; rollable stats show a 3-zone roll button; hit die shows a simple roll button; if a non-zero `statMods[key]` exists its value appears in the meta line; if the info entry has an `editFn` the Edit button appears in the panel header |
| `_updateStatModBadge(key)` | Called at end of `recalcAll()` | Shows or hides the `.stat-pill-mod` badge inside the pill for `key`; badge reads e.g. "+2 bonus" when non-zero, hidden when zero |
| `openStatModDialog(key)` | `editFn` inside `STAT_PILL_INFO` entries | Dismisses info panel, opens `#statModDialog` bottom-sheet pre-filled with `state.statMods[key]`; calls `pushModalHistory()` |
| `dismissStatModDialog()` | Cancel button or backdrop tap | Hides `#statModDialog`; calls `popModalHistory()` |
| `applyStatModDialog()` | "Set Modifier" button in `#statModDialog` | Pushes undo (type `statMod`); writes `parseInt(input.value)` to `state.statMods[key]`; calls `recalcAll()` |
| `startInspirationPress(e)` | `pointerdown` on `#inspirationBtn` | Starts 500 ms hold timer; on fire calls `openInspirationPanel()` |
| `endInspirationPress(e)` | `pointerup` on `#inspirationBtn` | If timer hadn't fired: calls `toggleInspiration()` |
| `cancelInspirationPress()` | `pointercancel` on inspiration button | Clears timer |
| `openInspirationPanel()` | Internal (fired by hold timer) | Opens `#infoPanel` with Inspiration description and a "Gain / Remove Inspiration" action button |
| `startHitDiePress(e)` | `pointerdown` on hit die roll button | Starts 500 ms timer; on fire sets `hitDiePressActive`, adds `.holding`, opens `openStatPillPanel('dietype')` info panel |
| `clickHitDieItem(e)` | `onclick` on hit die roll button | If guard not set: calls `rollHitDie()`; always clears timer and removes `.holding` |
| `cancelHitDiePress()` | `pointercancel` on hit die roll button | Clears timer; removes `.holding` |
| `openDeathSavePanel()` | Tap Roll button next to Death Saving Throws | Opens `#infoPanel` with death save description and a 3-zone roll button |
| `rollDeathSave(mode='normal')` | Roll zone in death save info panel | Rolls d20 (no modifier); interprets nat-1/nat-20 specially; calls `showRoll()` |
| `openConditionPanel(name)` | Internal (fired by hold timer on condition chip) | Opens `#infoPanel` with condition description and an "Apply / Remove Condition" action button |
| `dismissConditionPanel()` | (alias) | Clears `conditionPanelCurrentName` and calls `dismissInfoPanel()` |
| `clickConditionItem(e, name, el)` | Tap condition chip | Calls `toggleCondition()` directly (instant on/off); no-ops if long-press already fired |
| `toggleCondition(name, el)` | Short tap on condition chip, or Apply/Remove button inside condition panel | Pushes undo; toggles name in `state.conditions`; rebuilds condition chips |
| `toggleInspiration()` | Tap inspiration button | Pushes undo; flips `state.inspiration` boolean |
| `toggleDeathSave(dot, type)` | Tap death save dot | Toggles `.filled` class on the dot element (not tracked by undo) |
| `cycleDamageResistance(type)` | Tap a damage-type dot in the Resistances & Vulnerabilities section | Pushes undo; cycles Normal → Resistant → Vulnerable → Normal; shows toast feedback |
| `startDmgResistTitlePress(e)` | `pointerdown` on "Resistances & Vulnerabilities" section title | Adds `.holding` class; starts 500 ms timer; on fire calls `openDmgResistInfoPanel()` |
| `endDmgResistTitlePress(e)` / `cancelDmgResistTitlePress()` | `pointerup` / `pointercancel` on the section title | Clears timer; removes `.holding` class |
| `openDmgResistInfoPanel()` | Called on hold of the section title | Opens info panel explaining resistance (half damage), vulnerability (double damage), and how they interact |

#### Skill proficiency cycle detail
```
tap dots 1: None       → Proficient  (add to skillProficiencies)
tap dots 2: Proficient → Expert      (add to skillExpertise; keep in skillProficiencies)
tap dots 3: Expert     → None        (remove from BOTH skillExpertise and skillProficiencies)
```

#### Unified tap/hold interaction model

All interactive items follow a single consistent rule:

```
Tap   → roll directly if the item is rollable; open info panel otherwise
Hold  → always open the info/view panel (500 ms threshold)
```

Specific behaviours per item type:

```
Ability card
  Tap                → rollAbility(ab)              — rolls d20 + modifier; normal mode
  Hold (500 ms)      → openInfoPanel(...)           — shows description + 3-zone roll button (normal / adv / dis)

Saving throw row (outside dot)
  Tap                → rollSave(ab)                 — rolls d20 + save modifier; normal mode
  Hold (500 ms)      → openInfoPanel(...)           — shows description + 3-zone roll button

Skill row (outside dots)
  Tap                → rollSkill(name)              — rolls d20 + skill modifier; normal mode
  Hold (500 ms)      → openSkillPanel(name)         — shows description + 3-zone roll button

Combat stat pill (AC, Initiative, Speed, Hit Die, Spell Atk, Spell DC)
  Tap (rollable)     → rollInitiative() / rollSpellAtk()    — normal roll
  Tap (info-only)    → openStatPillPanel(key)               — opens info panel; no roll button shown
  Hold (500 ms)      → openStatPillPanel(key)               — always opens info panel

Hit Die roll button
  Tap                → rollHitDie()                — rolls the hit die + CON modifier
  Hold (500 ms)      → openStatPillPanel('dietype')— opens Hit Die info panel with simple roll button

Death Save Roll button
  Tap                → openDeathSavePanel()        — opens info panel with 3-zone roll button (no modifier)

Weapon attack row
  Tap                → rollAttack(i)               — rolls d20 + bonus + optional damage; opens info panel if no bonus; edit mode if attack is hidden
  Hold (500 ms)      → openAttackPanel(i, false)   — opens attack info panel (view mode)
  Tap Edit (top-right) → switchToAtkEdit()          — switches same modal to edit mode

Spells Known section title
  Tap                → toggle collapse (show/hide #spellsKnownBody)
  Hold (500 ms)      → openSpellsKnownInfoPanel()  — explains P/∞ dot system and preparation rules

Spells Prepared section title
  Hold (500 ms)      → openSpellsPreparedInfoPanel() — explains slots, known vs prepared, max formula, ∞ spells
  (Short tap has no action; the hold hint badge indicates this)

Spell row (spell list, combat list, featured spells)
  Tap                → clickSpellItem(e, i)         — rolls spell attack if attackRoll; rolls damage if rollDamage only; opens info panel if no roll configured
  Hold (500 ms)      → openSpellPanel(i, false)     — opens spell info panel (view mode)
  Tap Edit (top-right) → switchToSpellEdit()        — switches same modal to edit mode

Trait row (Info tab and combat list)
  Tap                → clickTraitItem(e, i)         — rolls damage if rollDamage; opens info panel otherwise
  Hold (500 ms)      → openTraitPanel(i, false)     — opens trait info panel (view mode)
  Tap Edit (top-right) → switchToTraitEdit()        — switches same modal to edit mode

Feature name area
  Tap                → clickFeatureName(e, i)       — rolls damage if rollDamage; opens info panel otherwise
  Hold (500 ms)      → openFeaturePanel(i, false)   — opens feature info panel (view mode)
  Tap Edit (top-right) → switchToFeatureEdit()      — switches same modal to edit mode

Condition chip
  Tap                → toggleCondition(name, el)    — instantly toggles the condition on/off (conditions are checkboxes, not rolls)
  Hold (500 ms)      → openConditionPanel(name)     — opens condition info panel with description and Apply/Remove button

```

Attack panel states:
```
View mode  (default) — shows name, action type, attack roll card (tappable), save DC box, rolls-only box, description,
                       "tap to dismiss" hint; Edit button top-right switches to edit mode
Edit mode            — shows editable form for all fields (name, attack roll selector with proficiency/flat bonus or manual
                       entry, rolls rows, action type, hidden checkbox, saving throw, description),
                       Delete / Cancel / Save button row at the bottom
```

---

### Roll result functions

| Function | Description |
|---|---|
| `showRoll(label, breakdown, total, nat, secondary?)` | **`shared.js`** — Displays the roll result overlay; appends to `rollLog` (if present) and calls `renderRollLog()`; `secondary` is optional (e.g. damage line for attacks) |
| `dismissRollResult()` | **`shared.js`** — Hides the roll result overlay and backdrop |
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
| `collectFormData()` | Reads all 28 form input values by element ID into a plain object |
| `buildPayload()` | Returns `{ form, state }` — the canonical serialisation format. `form` is from `collectFormData()`; `state` includes all keys: `abilities`, `saveProficiencies`, `skillProficiencies`, `skillExpertise`, `inspiration`, `hpCurrent`, `spellSlots`, `entries` (unified spells/features/traits array), `attacks`, `conditions`, `hitDiceUsed`, `diceRoller`, `portrait`, `statMods`, `damageResistances`, `maxSpellsPrepared` |
| `saveData()` | Serialises the active character via `buildPayload()` and writes it into the roster entry in `localStorage` (`dnd5e_roster`) |
| `loadData()` | Reads the roster from `localStorage`; migrates a legacy `dnd5e_sheet` entry if no roster exists; restores form fields and `state` for the active character (no UI rebuild) |
| `exportToJSON()` | Downloads `buildPayload()` as `<charname>.json` via a temporary `<a>` element |
| `importFromJSON(input)` | Reads a `.json` file with `FileReader`, calls `applyPayload()` + `saveData()` |
| `applyPayload(payload)` | Applies a payload object: restores form fields, updates `state`, rebuilds all dynamic UI |
| `applyPortrait()` | Shows or hides `#portraitImg` / `#portraitPlaceholder` / `#portraitRemoveBtn` based on `state.portrait` |
| `handlePortraitUpload(input)` | `FileReader` callback; pushes undo, stores base64 data URL in `state.portrait`, calls `applyPortrait()` + `saveData()` |
| `removePortrait()` | Pushes undo, clears `state.portrait`, calls `applyPortrait()` + `saveData()` |

---

### Character roster functions

The roster is stored in `localStorage` under the key `dnd5e_roster` as `{ chars: { [id]: { name, payload } }, activeId }`. `payload` is the full `buildPayload()` result, which includes `state.portrait`, `form.charRace`, and `form.charClass` — the three fields displayed in character grid cards.

The session variable `rosterActiveId` (string) holds the currently loaded character's id.

| Function | Description |
|---|---|
| `genCharId()` | Returns a short unique id (`Date.now().toString(36)` + random suffix) |
| `loadRosterData()` | Parses and returns the roster from `localStorage`; returns `null` on missing or invalid data |
| `persistRoster(roster)` | JSON-serialises and writes the roster object to `localStorage` |
| `migrateOldSheet()` | One-time migration: if `dnd5e_roster` is absent but `dnd5e_sheet` exists, wraps the old payload into a new single-character roster |
| `clearSheet()` | Resets all form inputs and `state` to default values; clears the undo stack |
| `_rebuildAll()` | Calls every build/render function and `recalcAll()` + `updateHeader()` + `updateHP()`; used after switching or creating a character |
| `switchCharacter(id)` | Saves current character, loads the target roster entry, calls `_rebuildAll()`; no-op if `id` is already active |
| `newCharacter()` | Saves current character, creates a blank roster entry, activates it, calls `_rebuildAll()` |
| `deleteCharacter(id)` | Removes the entry from the roster; if it was active, switches to the first remaining character; refuses if only one character exists |
| `toggleCharMenu()` | Opens or closes the character grid overlay (`#charGridOverlay`) and calls `renderCharMenu()` on open |
| `closeCharMenu()` | Removes `.open` from `#charGridOverlay` |
| `handleCharGridOverlayClick(e)` | Closes the overlay when the user clicks the dark backdrop (i.e. the overlay element itself, not the panel) |
| `renderCharMenu()` | Clears and rebuilds `#charMenuList` (the `.char-grid` inside the overlay) with one `.char-card` per roster entry; reads `payload.state.portrait`, `payload.form.charRace`, and `payload.form.charClass` from each stored payload to populate the card |

---

### Utility functions

| Function | Description |
|---|---|
| `updateHeader()` | Reads name/class/race/level inputs → updates header display |
| `switchTab(id)` | **`shared.js`** — Deactivates all panels/buttons; activates the target; scrolls its tab button into view |
| `setupSwipe(tabs, shouldBlock?, switchFn?, getActiveFn?)` | **`shared.js`** — Attaches `touchstart`/`touchend` listeners to `document.body`; horizontal swipe ≥ 50 px (and greater than vertical movement) cycles through `tabs` with wrap-around. `shouldBlock` suppresses navigation when it returns true. `switchFn` overrides `switchTab()` for callers that manage panels differently. `getActiveFn` overrides reading `.tab-btn.active[data-tab]` to find the current tab. |
| `toast(msg)` | **`shared.js`** — Shows floating message for 2 seconds; used for non-roll feedback (proficiency changes, inspiration, file ops) |
| `_applyTheme()` | **`shared.js`** — Reads `dnd5e_theme` from `localStorage` and applies as `data-theme` on `<html>`; called at page init |
| `setupAutoSave()` | Attaches `saveData` as `input` + `change` listener to every form element |
| `openSettings()` / `dismissSettings()` | Opens / closes the ⚙ settings bottom-sheet; manages `pushModalHistory` / `popModalHistory` |
| `pushModalHistory()` | Calls `history.pushState()` to add an entry so the browser back button can dismiss the open modal |
| `popModalHistory()` | Called by each dismiss function; the `popstate` handler fires on browser back and calls the appropriate dismiss function — cascade order: `#rollResult` → `#spellPanel` → `#traitPanel` → `#featurePanel` → `#stepMenu` → `#hpDialog` → `#settingsMenu` → `#attackPanel` → `#infoPanel` |
| `loadFontSize()` | Reads `dnd5e_fontsize` from `localStorage`; resolves index into `FONT_SIZES`; calls `applyFontSize()` |
| `applyFontSize()` | Sets `document.body.style.zoom` to the current `FONT_SIZES[fontSizeIdx]` value; updates `#fontSizeLabel` |
| `changeFontSize(dir)` | Increments or decrements `fontSizeIdx` (clamped to `FONT_SIZES` bounds); calls `applyFontSize()`; persists to `localStorage` |
| `loadLeftyMode()` | Reads `dnd5e_lefty` from `localStorage`; calls `applyLeftyMode()` |
| `applyLeftyMode()` | Toggles `body.lefty` class and updates `#leftyToggle` button state |
| `toggleLeftyMode()` | Flips `leftyMode`; calls `applyLeftyMode()`; persists to `localStorage` |
| `loadTheme()` | Reads `dnd5e_theme` from `localStorage` (defaults to `'gold'`); calls `applyTheme()` |
| `applyTheme(theme)` | Sets `data-theme` attribute on `<html>`; marks the matching `.theme-swatch` as `.active` |
| `setTheme(theme)` | Calls `applyTheme()`; persists choice to `localStorage` key `dnd5e_theme` |

---

### AI / SRD Import functions

The **⇓ Import** button in the header bar opens `#importHubPanel`, which routes to item import (`#aiImportPanel`), character import (`#charImportPanel`), or information import (`#descEnrichPanel`).

#### AI mode
Generates a copy-ready LLM prompt containing the exact JSON schema and the names of items already on the sheet; the user pastes the LLM's JSON array response into Step 2 and clicks Import.

| Function | Description |
|---|---|
| `openAIImport(type)` | Opens `#aiImportPanel` in AI mode, pre-selects the given type tab (`'spells'`, `'features'`, `'traits'`, or `'equipment'`), resets both text areas and the SRD selection set |
| `dismissAIImport()` | Hides `#aiImportPanel` and its backdrop |
| `setModalMode(mode)` | Switches between `'ai'` and `'srd'` content areas; also shows/hides `#srdResultsArea` (the detached results section below `.import-upper`); calls `_srdInitForType()` when switching to SRD |
| `setAIImportType(type)` | Updates active state on type-tab buttons; calls `_srdInitForType()` if currently in SRD mode |
| `generateAndCopyAIPrompt()` | Builds the prompt for the active type via `_buildSpellPrompt`, `_buildFeaturePrompt`, or `_buildTraitPrompt`; writes to clipboard via `navigator.clipboard` with `execCommand` fallback |
| `_buildSpellPrompt(what)` | Returns a prompt string with the unified entry JSON schema (spell fields; uses `rolls` array, not legacy `damage` field) and the list of already-present spell names; instructs the AI to set `"mod":"SPELL"` when the spell text says "add your spellcasting ability modifier" |
| `_buildFeaturePrompt(what)` | Returns a prompt string with the unified entry JSON schema (feature fields; uses `rolls` array) and existing feature names; instructs the AI to set `"mod":"SPELL"` when the feature text says "add your spellcasting ability modifier" |
| `_buildTraitPrompt(what)` | Returns a prompt string with the unified entry JSON schema (trait fields) and existing trait names |
| `importAIResponse()` | Parses the pasted text (strips markdown fences); merges new entries into `state.entries[]` with the appropriate `showIn*` flags set based on active type; deduplicates by lowercase name; rebuilds the relevant lists |

#### AI Character Import (full sheet from photos)
Full-character import modal (`#charImportPanel`) opened from Import hub → Import Character. It has AI mode (photo-to-JSON prompt workflow) and JSON mode (file picker for direct character import).

| Function | Description |
|---|---|
| `openCharImport()` | Shows `#charImportPanel` in AI mode, resets state, triggers `_tryLoadCharSchema()` |
| `dismissCharImport()` | Hides `#charImportPanel` and its backdrop |
| `setCharImportMode(mode)` | Switches character import between `'ai'` and `'json'` sub-views |
| `openJsonImportFromCharPanel()` | Closes `#charImportPanel` and opens hidden `#jsonFileInput` after a short delay |
| `_tryLoadCharSchema()` | Async; `fetch('./JSONGeneration.md')`; on success sets `_charImportSchema`; on failure shows `#ciSchemaFilePicker` |
| `loadSchemaFromFile(input)` | `FileReader` handler for the manual file picker; loads selected `.md`/`.txt` into `_charImportSchema` |
| `useBuiltinSchema()` | Sets `_charImportSchema` to the embedded `_BUILTIN_CHAR_SCHEMA` constant |
| `generateCharImportPrompt()` | Builds and clipboard-copies a prompt embedding `_charImportSchema`; on clipboard failure falls back to showing the prompt in `#ciResponsePaste` |
| `importCharFromAI()` | Strips markdown fences, parses JSON, validates shape (`{form,state}`), calls `applyPayload()` + `saveData()` |
| `_BUILTIN_CHAR_SCHEMA` | `const` string — compact but complete schema description used when `JSONGeneration.md` cannot be loaded |
| `_charImportSchema` | `let` variable — holds the active schema text; `null` until loaded |

#### SRD mode

The app supports two SRD sources that are used automatically based on what is available:

- **2014 SRD (`dnd5eapi.co`)** — Requires internet. Results cached in `localStorage` under keys prefixed `srd_v1_`. Active when the local 2024 index is not present.
- **2024 SRD (local index)** — Requires Netlify / server. Static JSON files fetched from `/srd2024/*.json`. Loaded once into the `_srd24Files` in-memory cache; no `localStorage` usage. Active when `/srd2024/translation.json` can be fetched successfully.

Edition availability is detected automatically on modal open via `_srd24Detect()`. Users can override the edition with the **2014 / 2024 pill toggle** displayed in the import modal (between the type tabs and the content area); preference is stored in `_srdEditionPref`. All edition-dependent code calls `_srdUse24()` rather than `_srd24Detect()` directly.

##### 2024 local index infrastructure

| Symbol | Type | Description |
|---|---|---|
| `_srd24Available` | `boolean\|null` | `null` until probed; `true`/`false` after `_srd24Detect()` |
| `_srd24Translation` | `object\|null` | Parsed `translation.json`; loaded once by `_srd24Detect()` |
| `_srd24Files` | `{[category]: Array}` | In-memory cache of loaded local JSON files |
| `_srd24FeatureMap` | `{[key]: object}` | Maps checkbox-value keys → full item objects; populated by `_srdLoadRace()` and `_srdLoadClass()` in 2024 mode |
| `_srdEditionPref` | `'2014'\|'2024'\|'auto'` | User-selected edition preference; `'2014'` by default |
| `_srd24Detect()` | async fn | Probes `/srd2024/translation.json`; sets `_srd24Available` and `_srd24Translation`; idempotent |
| `_srd24Load(category)` | async fn | Fetches `/srd2024/{category}.json` if not already in `_srd24Files`; returns the array |
| `_srdUse24()` | async fn | Returns `true` if the 2024 edition should be used, honouring `_srdEditionPref`; delegates to `_srd24Detect()` for `'auto'` |
| `_srdEditionLabel()` | fn | Returns a human-readable string like `"5e (2024 edition)"` for use in AI prompts; reflects current `_srdEditionPref` |
| `_srdUpdateEditionUI()` | fn | Updates `.active` class on the 2014/2024 pill buttons; disables the 2024 button when `_srd24Available === false` |
| `setSrdEdition(ed)` | fn | Sets `_srdEditionPref` to `'2014'` or `'2024'`, updates the UI, and re-initialises the current type tab |

##### Core SRD functions (edition-aware)

| Function | Description |
|---|---|
| `_srdGet(path)` | `fetch()` wrapper with `localStorage` caching for 2014 API calls; throws on non-2xx |
| `_srdShowCtrls(type)` | Shows the correct control block (spell search / species select / class select) for the active type; clears `srdSelected` |
| `_srdInitForType(type)` | Async; detects edition, populates species/class dropdowns from local data or API, pre-warms spell/equipment caches |
| `_srdSpellSearch()` | Filters spell list by search input; in 2024 mode searches `_srd24Files.spells`; in 2014 mode searches cached API `/spells` index; renders up to 40 matches |
| `_srdEquipSearch()` | Same pattern as `_srdSpellSearch()` for equipment; up to 50 matches |
| `_srdLoadRace()` | In 2024 mode: finds species in `_srd24Files.species`, populates `_srd24FeatureMap` with traits, renders via `_srdRenderList()`. In 2014 mode: fetches `/races/{index}` |
| `_srdLoadClass()` | In 2024 mode: renders base class features (flat, no level) and subclass features (grouped by level) from `_srd24Files.classes`; populates `_srd24FeatureMap`. In 2014 mode: fetches `/classes/{index}/levels` |
| `_srdRenderList(items)` | Renders an array of `{index, name}` objects as checkable `.srd-result-item` rows into `#srdResults`; binds change listeners via `_srdBindCbs()` |
| `_srdBindCbs()` | Attaches `change` listeners to all `.srd-cb` checkboxes; adds/removes indices from `srdSelected` |
| `addSelectedSRD()` | Async; iterates `srdSelected`; in 2024 mode resolves items from `_srd24Files` or `_srd24FeatureMap` (no network); in 2014 mode fetches each item from API; maps, deduplicates, merges into state, rebuilds UI |

##### Mappers

| Function | Source format | Target |
|---|---|---|
| `_mapSrdSpell(sp)` | 2014 API spell object | `state.entries` entry with `showInSpells:true`; sets `rolls[].mod = 'SPELL'` when the description mentions "spellcasting ability modifier" or "spellcasting modifier" |
| `_mapSrdTrait(tr)` | 2014 API trait object | `state.entries` entry with `showInTraits:true` |
| `_mapSrdFeature(feat)` | 2014 API feature object | `state.entries` entry with `showInFeatures:true` |
| `_mapSrdEquipment(eq)` | 2014 API equipment object | `state.equipmentItems` entry |
| `_mapSrd24Spell(sp)` | 2024 local `spells.json` entry | `state.entries` entry with `showInSpells:true`; sets `rolls[].mod = 'SPELL'` when the description mentions "spellcasting ability modifier" or "spellcasting modifier" |
| `_mapSrd24Trait(tr)` | 2024 local species trait (`description` field) | `state.entries` entry with `showInTraits:true` |
| `_mapSrd24Feature(f)` | 2024 local class feature (`description` field) | `state.entries` entry with `showInFeatures:true` |
| `_mapSrd24Equipment(eq)` | 2024 local `equipment.json` entry | `state.equipmentItems` entry |
| `_nameToSrdIdx(name)` | Display name | SRD index slug (lowercase, hyphens) |

##### Item Content Assist and enrich

| Function | Description |
|---|---|
| `toggleIca(p)` | Shows or hides the Item Content Assist block (`#<p>Ica`); calls `_icaReset(p)` on open |
| `_icaReset(p)` | Resets ICA to SRD mode, clears preview and apply buttons, empties paste area, deletes `_icaCache[p]` |
| `setIcaMode(p, mode)` | Switches ICA between `'srd'` and `'ai'` tabs for panel prefix `p` |
| `icaSearchSrd(p, type)` | Async; in 2024 mode searches the appropriate local file pool (traits flattened from species, features flattened from classes); in 2014 mode fetches from API. Caches detail with `_srd24: true` flag for 2024 results; shows preview and reveals Apply buttons |
| `icaApply(p)` | Applies cached SRD data: selects `_mapSrd24Spell`/`_mapSrd24Equipment` for 2024 results or `_mapSrdSpell`/`_mapSrdEquipment` for 2014; for traits/features calls `icaApplyDesc` |
| `icaApplyDesc(p)` | Writes cached item description to the textarea; reads `description` for 2024 results, `desc` for 2014; closes ICA block |
| `icaCopyPrompt(p, type)` | Generates a LLM prompt and writes it to the clipboard |
| `icaApplyAI(p, type)` | Parses pasted JSON for spells; falls through to `icaApplyAIDesc` otherwise |
| `icaApplyAIDesc(p)` | Writes paste area raw text to description textarea and closes ICA block |
| `_enrichEquipDescriptions(items)` | Async; fills missing equipment fields from SRD (2014 or 2024 path); called after AI import |
| `enrichAllFromSrd(opts)` | Async; SRD-based description enrichment for `state.entries[]` (spells/features/traits) and `state.equipmentItems`. `opts.includeExisting=true` refreshes all entries, otherwise only fills missing descriptions |
| `openDescEnrichPanel()` | Opens `#descEnrichPanel` with default mode AI + scope Missing-only |
| `dismissDescEnrichPanel()` | Hides `#descEnrichPanel` and its backdrop |
| `setDescImportMode(mode)` | Toggles information import mode between `'ai'` and `'srd'` |
| `setDescImportScope(scope)` | Toggles scope between `'missing'` and `'all'` |
| `runDescImportSrd()` | Runs SRD enrichment from `#descEnrichPanel` using the selected scope |
| `generateDescEnrichPrompt()` | Builds and copies an AI prompt from selected scope (Missing-only or All-entries) |
| `applyDescEnrichResponse()` | Applies pasted AI descriptions according to selected scope (fill missing only or overwrite existing) |

> **2024 SRD note:** `dnd5eapi.co` covers the 2014 SRD. For 2024 SRD content (released under CC-BY 4.0 as SRD 5.2), use the AI Import workflow: the prompt templates are edition-agnostic and work with any LLM that knows the 2024 rules.

---

## Adding a new field — checklist

1. Add the HTML input with a unique `id` to the relevant panel.
2. Add the `id` string to the array inside `collectFormData()`.
3. If the field affects a derived value (modifier, DC), update `recalcAll()`.
4. If the field needs dynamic rendering, add a build function and call it from `init()` and `applyPayload()`.
5. Update `REFERENCE.md` (this file) and `JSONGeneration.md`.
