# REFERENCE — D&D Character Creator

**File:** `character-creator.html`
A standalone, single-file character creation wizard that produces a `{form, state}` JSON payload compatible with `dnd-character-sheet.html`.

---

## Purpose

Guides the user step-by-step through character creation (species, class, background, ability scores, personality), pulling data from either the **2024 SRD** (local JSON files) or the **2014 SRD** (live dnd5eapi.co API). On the final step the user can click **Open in Character Sheet** to load the character directly, or download/copy the JSON for manual import.

The header also exposes an **AI Character Generator** button (🤖 AI) that generates a prompt for Claude, ChatGPT, or Gemini to produce a complete `{form, state}` JSON. The user loads the saved `.json` file (or pastes the response) directly into the creator, which skips to the Review step with the full character ready to send to the sheet.

No build step. Open `character-creator.html` in a browser. For 2024 SRD data the file must be **served** (same requirement as the main sheet companion files).

---

## Wizard steps

| Step | Label | What it collects |
|---|---|---|
| 0 | Basics | Character name (required), level, alignment, XP |
| 1 | Species | SRD species/race, optional subspecies, ability score bonus allocation, species traits to import as `infoTraits` |
| 2 | Class | SRD class, optional subclass, skill proficiency choices (N chosen from class list), equipment proficiency toggles |
| 3 | Background | SRD background, ability score bonus allocation (2024 only), skill/tool proficiencies |
| 4 | Ability Scores | Base scores via Manual / Standard Array / Point Buy; live preview of HP, AC, proficiency bonus |
| 5 | Personality | Languages, personality traits, ideals, bonds, flaws, notes |
| 6 | Review | Character summary, truncated JSON preview, "Open in Character Sheet" button (direct import via localStorage), download button, copy-to-clipboard button |

Navigation is linear (Back / Next). All steps except Step 0 are optional — the user can skip any step and the payload will default gracefully.

---

## Edition system

Two SRD sources are supported, toggled with the header buttons:

| Edition | Source | Requires | Notes |
|---|---|---|---|
| **2024 SRD** | `/srd2024/*.json` local files | Web server (same as main sheet) | 9 species, 12 classes, 4 backgrounds from SRD 5.2 |
| **2014 SRD** | `https://www.dnd5eapi.co/api/` | Internet access | Full SRD content; trait descriptions fetched per-trait |

Switching edition resets all SRD-dependent state (species, class, background selections and cached responses).

---

## Ability score bonus system (flexible)

The user is **never locked** into the default racial/background bonuses. Three distinct bonus allocation UIs are used depending on context:

### 2024 species bonuses
Two free-choice dropdowns: **+2 to any ability** and **+1 to any different ability** (2024 rules: no fixed species bonuses). Both dropdowns list all six abilities.

### 2014 race bonuses
Fixed bonuses are shown (e.g., Elf +2 DEX) but each bonus has an override dropdown allowing the user to redirect it to any other ability. Stored in `W.speciesBonusCustom` as `{ originalKey: redirectedKey }`.

### 2024 background bonuses
Two dropdowns filtered to the background's `ability_scores` list (e.g., `["INT","WIS","CHA"]` for Acolyte), plus a **Custom** option group listing all six abilities for house-rule flexibility.

### 2014 background bonuses
Not available — 2014 backgrounds have no standardized ability score bonuses in the API.

---

## Spell slot generation

Spell slots are computed from a hardcoded table indexed by `[classIndex][level-1]`. Each entry is a 9-element array: `[1st, 2nd, … 9th]` slot counts.

| Class group | Table constant | Notes |
|---|---|---|
| Full casters (Bard, Cleric, Druid, Sorcerer, Wizard) | `SLOTS_FULL` | Standard progression |
| Half casters in 2024 edition (Paladin, Ranger) | `SLOTS_HALF_2024` | Start at level 1 (2024 rule change) |
| Half casters in 2014 edition (Paladin, Ranger) | `SLOTS_HALF_2014` | Paladin starts level 2; Ranger starts level 5 |
| Pact Magic (Warlock) | `SLOTS_WARLOCK` | Single slot level at a time |
| Non-casters (Barbarian, Fighter, Monk, Rogue) | `SLOTS_NONE` | All zeros |

`classSlotTable(classIndex, edition)` selects the correct table.

---

## Equipment proficiency defaults

`CLASS_EQUIP` maps each class index to:
- `groups` — broad predefined categories matching the main sheet's `EQUIP_PROF_GROUPS` (e.g., `"Light Armor"`, `"Simple Weapons"`)
- `custom` — specific weapon/tool names added as `customEquipProfRows` (e.g., `"Longsword"` for Bard)

All entries are pre-toggled on and editable as chip buttons in Step 2.

---

## State object (`W`)

All wizard state lives in the module-level `W` object. It is not persisted.

| Key | Type | Meaning |
|---|---|---|
| `edition` | `'2024'|'2014'` | Active SRD edition |
| `step` | `integer` | Current wizard step index (0–6) |
| `basic` | `{name, level, alignment, xp}` | Step 0 data |
| `speciesIndex` | `string` | SRD index of selected species |
| `speciesData` | `object|null` | Normalized species (see below) |
| `subspeciesIndex` | `string` | SRD index of selected subspecies |
| `subspeciesData` | `object|null` | Normalized subspecies data |
| `speciesBonus` | `{big, small}` | Ability keys for the +2 and +1 species bonus (2024) |
| `speciesBonusCustom` | `{[origKey]: targetKey}` | Per-bonus override map (2014) |
| `selectedTraits` | `integer[]` | Indices into the combined species+subspecies trait array that will be imported as `infoTraits` |
| `classIndex` | `string` | SRD index of selected class |
| `classData` | `object|null` | Normalized class (see below) |
| `subclassIndex` | `string` | SRD index of selected subclass |
| `subclassName` | `string` | Display name of subclass (written to `form.charSubclass`) |
| `chosenSkills` | `string[]` | Skill names selected by the user in Step 2 |
| `equipProfs` | `string[]` | Active group proficiency names (from `CLASS_EQUIP.groups`) |
| `equipCustom` | `string[]` | Active custom proficiency names (from `CLASS_EQUIP.custom`) |
| `bgIndex` | `string` | SRD index of selected background |
| `bgData` | `object|null` | Normalized background (see below) |
| `bgBonus` | `{big, small}` | Ability keys for background +2/+1 bonus (2024) |
| `scoreMethod` | `'manual'|'standard'|'pointbuy'` | Active score entry method |
| `baseScores` | `{STR…CHA}` | Manual entry scores (integers) |
| `stdAssign` | `{STR…CHA}` | Standard array assignment (each value is a string from `"8"–"15"`) |
| `pbScores` | `{STR…CHA}` | Point buy scores (integers 8–15) |
| `personality` | `{personality, ideals, bonds, flaws, languages, notes}` | Step 5 text fields |
| `_cache` | `object` | Keyed by `"edition|path"` → parsed JSON response; prevents duplicate fetches |
| `_srdLoaded` | `{species, classes, backgrounds}` | Booleans tracking whether the list fetch for each section has completed |
| `_aiPayload` | `object\|null` | Full `{form,state}` payload from the AI generator; when set, `buildPayload()` returns it instead of building from wizard state |

---

## Normalized data shapes

All SRD data is normalized to a common internal shape immediately after fetching. The normalization functions handle the structural differences between 2014 and 2024 APIs.

### Species / Race

```javascript
{
  index: string,
  name: string,
  speed: integer,        // ft per round
  size: string,          // "Medium", "Small", etc.
  traits: [{ name: string, description: string }],
  abilityBonuses: { [abilityKey]: integer },  // empty for 2024 (free choice)
  subspecies: [{ index, name, traits?, abilityBonuses? }],
  languages: string,     // comma-separated; populated from 2014 API only
}
```

### Class

```javascript
{
  index: string,
  name: string,
  hitDie: integer,              // e.g. 8 for Bard
  spellcasting: string|null,    // ability key e.g. 'CHA', or null for non-casters
  savingThrows: string[],       // e.g. ['DEX', 'INT']
  skillChoices: { choose: integer, from: string[] },
  subclasses: [{ index, name }],
}
```

### Background

```javascript
{
  index: string,
  name: string,
  skillProfs: string[],       // skill names (without "Skill: " prefix)
  toolProfs: string[],        // tool names (without "Tool: " prefix)
  abilityScores: string[]|null,  // 2024: eligible abilities for bonus; null for 2014
  feat: string,               // 2024 origin feat name; '' for 2014
}
```

---

## Key functions

### SRD / loading

| Function | Signature | Role |
|---|---|---|
| `srdGet(path)` | `async (path: string) → object` | Fetches and caches SRD data. Prepends the correct base URL based on `W.edition`. Returns parsed JSON. Caches by `"edition|path"` key. |
| `loadSpeciesList()` | `async ()` | Fetches species/race list for the active edition; populates the `#sp-sel` dropdown |
| `onSpeciesChange(idx)` | `async (idx: string)` | Fetches full species detail, normalizes it, fetches trait descriptions (2014), renders Step 1 detail sections |
| `onSubspeciesChange(idx)` | `async (idx: string)` | Fetches subspecies detail (2014) or reads from local data (2024); merges subspecies traits and bonuses |
| `loadClassList()` | `async ()` | Fetches class list; populates `#cl-sel` |
| `onClassChange(idx)` | `async (idx: string)` | Fetches full class detail, normalizes, sets `W.equipProfs`/`W.equipCustom` from `CLASS_EQUIP`, renders Step 2 |
| `loadBackgroundList()` | `async ()` | Fetches background list; populates `#bg-sel` |
| `onBackgroundChange(idx)` | `async (idx: string)` | Fetches background detail, normalizes, renders Step 3 |

### Normalization

| Function | Role |
|---|---|
| `normalizeSpecies2024(raw)` | Converts 2024 local JSON entry to normalized species shape |
| `normalizeSpecies2014(raw, traitDescMap)` | Converts 2014 API race response + pre-fetched trait descriptions to normalized shape |
| `normalizeClass2024(raw)` | Converts 2024 local JSON entry to normalized class shape |
| `normalizeClass2014(raw)` | Converts 2014 API class response (including `proficiency_choices` parsing) to normalized class shape |
| `normalizeBackground2024(raw)` | Converts 2024 local JSON entry to normalized background shape |
| `normalizeBackground2014(raw)` | Converts 2014 API background response to normalized background shape |

### Score computation

| Function | Role |
|---|---|
| `totalBonuses()` | Sums all active ability score bonuses (species + subspecies + background) and returns `{STR…CHA}` integer map |
| `totalScores()` | Returns final ability scores: base (from whichever method is active) + `totalBonuses()` |
| `stdArrayTotals()` | Reads `W.stdAssign` and converts to `{STR…CHA}` integer map |
| `updateStatPreview()` | Recalculates HP, AC, and proficiency bonus; updates the Step 4 preview cards |

### Score entry UIs

| Function | Role |
|---|---|
| `setScoreMethod(method)` | Switches between `'manual'`, `'standard'`, `'pointbuy'`; shows/hides the correct section |
| `initManualScores()` | Builds the manual score table with per-row inputs; called when Step 4 becomes visible |
| `updateManualRow(k)` | Updates one row of the manual table when its input changes |
| `refreshManualBonuses()` | Refreshes bonus/total/modifier columns of the manual table (called when bonuses change on other steps) |
| `renderStandardArray()` | Renders the standard-array assignment UI; re-renders on every select change |
| `renderPointBuy()` | Renders the point-buy UI; re-renders on every +/− click |
| `pbAdj(k, delta)` | Adjusts a point-buy score up or down, respecting the 27-point budget and 8–15 range |

### Bonus UI

| Function | Role |
|---|---|
| `renderBonusUI()` | Builds the ability bonus picker in Step 1 (species); handles 2024 free-choice and 2014 override modes |
| `buildBonusPicker(idBig, idSmall, labelBig, labelSmall, badgeClass, valBig, valSmall)` | Returns HTML for a +2/+1 dropdown pair |
| `validateBonusConflict(changed, other)` | Ensures the +2 and +1 species selects don't choose the same ability |
| `renderBackgroundDetail(bg)` | Renders the background bonus picker and proficiency badges in Step 3 |

### Trait management

| Function | Role |
|---|---|
| `renderTraitList()` | Renders the trait toggle list in Step 1 from the combined species+subspecies trait arrays |
| `toggleTrait(i)` | Adds or removes an index from `W.selectedTraits` and re-renders the list |

### Navigation

| Function | Role |
|---|---|
| `showStep(n)` | Activates step panel `n`, updates progress bar, triggers lazy SRD loading, calls `updateNav()` |
| `updateNav()` | Sets Back/Next button states; disables Next on Step 0 when name is empty |
| `canProceed()` | Returns `true` if the current step allows advancing (Step 0 requires a non-empty name; all other steps are optional) |
| `goNext()` / `goBack()` | Advance or retreat one step |

### Export

| Function | Role |
|---|---|
| `buildPayload()` | Assembles the complete `{form, state}` payload from `W`; computes HP, AC, spell slots, saves, skill proficiencies, infoTraits from selected traits, equipment proficiencies |
| `renderReview()` | Builds the summary card and JSON preview in Step 6; calls `buildPayload()` |
| `openInSheet()` | Writes the payload to `localStorage` key `dnd5e_pending_import`, then navigates to `dnd-character-sheet.html`; the sheet picks it up on load and adds it as a new roster character |
| `downloadJSON()` | Triggers a browser file download of the payload as `<name>.json` |
| `copyJSON()` | Copies the payload JSON string to the clipboard via the Clipboard API |
| `openAICreate()` | Opens the AI Character Generator modal; triggers `_tryLoadAISchema()` |
| `dismissAICreate()` | Closes the AI modal |
| `_tryLoadAISchema()` | Async; `fetch('./JSONGeneration.md')`; on success sets `_aiSchema` to `extractAiPromptSchema(text)` (the compact `AI_SCHEMA_START`/`END` section, not the whole file); on failure shows `#aiSchemaFilePicker` |
| `generateAICreatePrompt()` | Builds an LLM prompt from the schema + optional character description; copies to clipboard |
| `importAIFromFile(input)` | Reads a `.json` file chosen by the user and calls `_parseAndApplyAI()` |
| `importAIFromPaste()` | Reads the pasted textarea and calls `_parseAndApplyAI()` |
| `_parseAndApplyAI(raw, source)` | Strips code fences, parses JSON, populates `W` basic fields and ability scores, stores full payload in `W._aiPayload`, then navigates to step 6 |
| `aiLoadSchemaFromFile(input)` | Loads a manually selected schema file, runs it through `extractAiPromptSchema()`, and stores the result in `_aiSchema` |
| `aiUseBuiltinSchema()` | Sets `_aiSchema` to `_BUILTIN_AI_SCHEMA` |
| `_BUILTIN_AI_SCHEMA` | `const` string — compact schema description used when `JSONGeneration.md` cannot be loaded; byte-identical to `_BUILTIN_CHAR_SCHEMA` (dnd-character-sheet.html) and to the `AI_SCHEMA_START`/`END` section of `JSONGeneration.md` |
| `_aiSchema` | `let` variable — holds the active (compact) schema text; `null` until loaded |

### Utility

| Function | Signature | Role |
|---|---|---|
| `abilityMod(score)` | `(integer) → integer` | `Math.floor((score-10)/2)` |
| `modStr(mod)` | `(integer) → string` | Returns `"+3"` or `"-1"` |
| `profBonus(level)` | `(integer) → integer` | `Math.ceil(level/4)+1` |
| `el(id)` | `(string) → HTMLElement` | Shorthand for `document.getElementById` |
| `classSlotTable(classIndex, edition)` | `(string, string) → number[][]` | Returns the correct spell-slot progression table for a given class and edition |
| `extractAiPromptSchema(text)` | `(string) → string` | Returns the text between `<!-- AI_SCHEMA_START -->`/`<!-- AI_SCHEMA_END -->` markers (fence lines stripped); returns `text` unchanged if the markers are absent |

---

## HP and AC calculation

Both values are derived at export time and written to `form.hpMax` and `form.statAC`. Users can adjust them in the character sheet after import.

**HP (average method):**
```
hpMax = hitDie + conMod + (level - 1) × (floor(hitDie / 2) + 1 + conMod)
```
Level 1 always gets the maximum hit die result. Subsequent levels use the average. `conMod` is derived from `totalScores().CON`.

**AC (unarmored default):**
```
ac = 10 + DEX modifier
```
Does not account for armor or class features (Unarmored Defense, etc.). Adjust `statAC` in the character sheet.

**`statHitDice`:** written as `"{level}d{hitDie}"` (e.g., `"5d8"` for a level 5 Bard).

---

## CSS architecture

Shares the same design tokens (`:root` CSS variables) as `dnd-character-sheet.html`:
`--bg`, `--surface`, `--surface2`, `--border`, `--gold`, `--gold-light`, `--red`, `--red-light`, `--green`, `--text`, `--text-muted`, `--spell`, `--spell-light`, `--radius`, `--shadow`.

No external dependencies. All CSS is scoped to short utility classes (`.wh`, `.sec`, `.pill`, `.trait-tog`, `.ab-table`, `.pb-row`, etc.) defined inline in the file's `<style>` block.

---

## Companion file requirements

| File | Required by helper | What happens without it |
|---|---|---|
| `srd2024/species.json` | 2024 SRD species step | Loading fails; user must switch to 2014 edition |
| `srd2024/classes.json` | 2024 SRD class step | Loading fails; user must switch to 2014 edition |
| `srd2024/backgrounds.json` | 2024 SRD background step | Loading fails; user must switch to 2014 edition |
| `dnd-character-sheet.html` | Import destination | Export still works; user loads the downloaded file manually |

The helper does not read or write `localStorage`. It produces a JSON file; all persistence happens in the main character sheet.

---

## Output payload structure

The exported JSON matches the format documented in `JSONGeneration.md`. Key fields populated by the wizard:

| `form` field | Source |
|---|---|
| `charName` | Step 0 name input |
| `charClass` / `charSubclass` | Step 2 class/subclass selection |
| `charRace` | Step 1 species name |
| `charLevel` | Step 0 level select |
| `charBackground` | Step 3 background name |
| `charAlignment` / `charXP` | Step 0 |
| `hpMax` | Calculated from class hit die + CON modifier |
| `statAC` | `10 + DEX modifier` |
| `statSpeed` | Species speed (default 30 ft) |
| `statHitDice` | `"{level}d{hitDie}"` |
| `spellAbility` | Class spellcasting ability key |
| `languages`, `personality`, `ideals`, `bonds`, `flaws`, `notes` | Step 5 |

| `state` field | Source |
|---|---|
| `abilities` | Computed total scores (base + bonuses) |
| `saveProficiencies` | Class saving throws |
| `skillProficiencies` | Class skill choices + background skills |
| `equipProficiencies` | Class equipment groups (toggled in Step 2) |
| `customEquipProfRows` | Class custom weapon/tool entries (toggled in Step 2) |
| `spellSlots` | `classSlotTable(classIndex, edition)[level-1]` |
| `infoTraits` | Selected species/subspecies traits |
| `hpCurrent` | Set equal to `hpMax` |
| Everything else | Default values (empty arrays, zero, null) |
