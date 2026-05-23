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
│   ├── #panel-overview    Tab: character info + features & traits (structured list, tap = roll or info panel, hold = info panel) + personality + Long Rest button
│   ├── #panel-abilities   Tab: ability scores + saving throws + passive perception + conditions
│   ├── #panel-skills      Tab: 18 skills with proficiency/expertise dots
│   ├── #panel-combat      Tab: HP tracker + combat stats + hit dice tracker + inspiration + death saves + attacks
│   ├── #panel-spells      Tab: spellcasting ability + spell slots (hidden levels shown as "+ Nth" pills at top; active levels show dot rows) + structured spell list (add; tap = roll or info panel; hold = info panel)
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
│   ├── #aiImportBackdrop  Fixed backdrop for the AI/SRD import modal
│   ├── #aiImportPanel  Fixed centered modal for importing spells, features, and traits; two modes — ✨ AI (prompt-copy + paste-back) and 📖 SRD (live search against dnd5eapi.co); three type tabs: Spells / Features / Traits
│   ├── #charGridOverlay  Fixed full-screen overlay for the character roster grid panel; open via the 🎭 header button; tap backdrop to dismiss
│   ├── #infoPanelBackdrop  Fixed full-screen dim layer behind the unified info panel; tap to dismiss
│   ├── #infoPanel  Fixed centered card (≤500 px, scrollable) — the single unified info panel used for skills, abilities, saving throws, combat stats, hit die, death saves, conditions, attacks, spells, class features, and traits; badge + title + optional meta + optional 3-zone roll button + optional simple roll button + description + optional action button; `.show` reveals it
│   └── #toast       Floating feedback message (non-roll events only)
└── <script>         All application logic (no external libraries)
```

---

## CSS architecture

### Design tokens (`:root` variables)

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
| `--spell` | `#5baeff` | Spell accent colour (concentration badges, spell panel borders, spell attack bonus) |
| `--spell-light` | `#7ec8ff` | Lighter spell accent (concentration badge chip) |
| `--spell-rgb` | `91,174,255` | Spell colour as `r,g,b` channels |
| `--spell-dark` | `#3d8fe0` | Pressed/active state of spell-coloured buttons |
| `--radius` | `8px` | Shared border-radius |
| `--shadow` | `0 2px 8px rgba(0,0,0,0.5)` | Shared box-shadow |
| `--roll-border` | `2px` | Border width on all tappable/rollable elements |

Themes are applied by setting `data-theme` on `<html>`. Each theme overrides the structural/accent variables above (but leaves `--red`, `--green`, `--radius`, `--roll-border` unchanged).

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
| `.ability-card` | One ability score (name, large modifier, score input); short tap → roll d20 + modifier (normal); hold 500 ms → open info panel with description + 3-zone roll button |
| `.check-list` | Unstyled `<ul>` for saving throws and skills |
| `.check-item` | One row: dots + modifier + name + ability tag; tap row to roll, tap dot to toggle prof |
| `.check-item.proficient` | Fills the first (or only) prof dot gold |
| `.check-item.expert` | Fills both dots in `.prof-dots` gold-light |
| `.prof-dot` | Single circular dot (14 px) used in saving throws; tap to toggle proficiency |
| `.prof-dots` | Flex container with two `.prof-dot`s used in skills; tap to cycle prof |
| `.hp-display` | Flex center area showing current HP, max, and bar; tap to open HP dialog |
| `.hp-bar` / `.hp-bar-fill` | Visual HP percentage bar |
| `.stat-pills` | 3-column grid of combat stat tiles |
| `.stat-pill` | One combat stat tile (value + label); short tap → rolls if rollable, otherwise opens info panel; hold 500 ms → always opens info panel |
| `.stat-pill.rollable` | Adds `cursor:pointer` and gold border on active |
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
| `.spell-level-divider` | Section header dividing spells by level (e.g. "Cantrips", "1st Level") inside `#spellListBody` |
| `.spell-item` | One spell row in the list; tap rolls the spell directly (attack or damage) if rollable, otherwise opens info panel; hold 500 ms opens info panel with Edit button; `.holding` class added during hold |
| `.spell-item-name` | Bold spell name inside a `.spell-item` |
| `.spell-item-school` | Italic muted school label (right side) inside a `.spell-item` |
| `.spell-item-tag` | Small badge chip on a spell row; `.sp-tag-conc` = blue "C" (Concentration); `.sp-tag-ritual` = gold "R" (Ritual) |
| `.spell-empty-msg` | Italic placeholder shown in `#spellListBody` when no spells have been added |
| `.trait-item` | One Features & Traits row in the Info tab; tap rolls damage directly if `rollDamage` is set, otherwise opens info panel; hold 500 ms opens info panel with Edit button; `.holding` class added during hold |
| `.trait-item-name` | Bold feature/trait name inside a `.trait-item` |
| `.trait-item-preview` | Truncated first line of the description (muted, small text, `text-overflow:ellipsis`) |
| `#traitBackdrop` | Fixed full-screen dim layer behind the trait panel; tap to dismiss |
| `#traitPanel` | Fixed centered card (≤500 px, scrollable) for viewing or editing a feature/trait; gold border in view mode, blue border in edit mode; `.edit-mode` toggles `.tr-view-section` / `.tr-edit-section` |
| `.tr-mode-badge` | Tiny uppercase label ("Feature / Trait" or "Editing Feature / Trait") at the top of the trait panel |
| `.tr-name` | Large feature/trait name heading inside the trait panel view section |
| `.tr-description` | Pre-wrapped description text block in the trait panel view section |
| `.tr-view-section` | Wrapper for all trait panel view-mode content; hidden when `#traitPanel.edit-mode` |
| `.tr-edit-section` | Wrapper for all trait panel edit form; hidden by default, shown when `#traitPanel.edit-mode` |
| `.mini-tracker` | Flex row grouping `[−][counter][+]` tightly together |
| `.mini-btn` | 38 px circular button for mini trackers; `.minus` = red, `.plus` = green |
| `.mini-val` | Small `n/max` counter label inside a mini tracker |
| `.feature-row` | One class feature row: horizontal two-column layout — left column (name + dots) and right column (controls) |
| `.feature-left-col` | Left flex column inside `.feature-row`; `flex:1`; holds `.feature-name-area` above and `.feature-dots` below |
| `.feature-name-area` | Clickable area inside `.feature-left-col`; gold left-border tint; tap rolls damage directly if `rollDamage` is set, otherwise opens info panel; hold 500 ms opens info panel with Edit button; `.holding` class added during hold; shows feature name, tags, and (when `step > 1`) the pts/dot hint |
| `.feature-dots` | Wrapping flex row of `.slot-dot`s inside `.feature-left-col`, below `.feature-name-area` and outside the clickable zone — dots can be tapped independently |
| `.feature-step-hint` | Tiny italic label inside `.feature-name-area` below the feature name (e.g. "5 pts/dot"); shown only when `step > 1` |
| `.feature-right-col` | Right controls column inside `.feature-row`; stacks `.feature-ctrl-top`, `.mini-tracker`, and (for featured spells) recharge info vertically; separated from the left column by a subtle border |
| `.feature-ctrl-top` | Top row of `.feature-right-col`; flex row containing the recharge label, the restore button, and the EDIT button |
| `.feature-restore-btn` | 28 px circular ⏻ button in `.feature-ctrl-top`; resets uses to 0 for that feature/spell |
| `#featurePanelBackdrop` | Fixed full-screen dim layer behind the feature panel; tap to dismiss |
| `#featurePanel` | Fixed centered card (≤500 px, scrollable) for viewing or editing a class feature; gold border in view mode, blue border in edit mode; `.edit-mode` toggles `.fp-view-section` / `.fp-edit-section` |
| `.fp-view-section` | Wrapper for all feature panel view-mode content; hidden when `#featurePanel.edit-mode` |
| `.fp-edit-section` | Wrapper for all feature panel edit form; hidden by default, shown when `#featurePanel.edit-mode` |
| `#featuredSpellsSection` | Block in the Features tab showing spells with `showInFeatures: true`; hidden when empty |
| `#featuredSpellsBody` | Container for spell rows inside `#featuredSpellsSection` |
| `.attack-row` | 3-column grid: name / bonus / damage; `cursor:pointer`; tap to view/roll |
| `.attack-row.spell-atk` | Spell variant of `.attack-row`; blue left-border tint; tap rolls the spell directly (same logic as spell list rows); hold 500 ms opens info panel |
| `.attack-row.atk-hidden` | Hidden attack row shown faded (`opacity: 0.4`); always visible in the list |
| `.attack-section-label` | Gold uppercase section divider inside `#attackList` (e.g. "Actions", "Bonus Actions") |
| `.attack-edit-btn` | Small "Edit" button in the top-right of spell/trait/feature/attack view panels to switch to edit mode within the same modal |
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
| `.sp-dismiss-hint` | Tiny uppercase footer "tap to dismiss" shown at the bottom of view panels |
| `.sp-view-section` | Wrapper for all view-mode content; hidden when `#spellPanel.edit-mode` |
| `.sp-edit-section` | Wrapper for all edit-mode content; hidden by default, shown when `#spellPanel.edit-mode` |
| `.sp-edit-field` | Labeled field wrapper inside the edit form; label in blue uppercase |
| `.sp-edit-checkbox-row` | Flex row for Concentration and Ritual checkboxes |
| `.sp-edit-save-btn` | Blue filled Save button in edit mode |
| `.sp-edit-cancel-btn` | Muted Cancel button in edit mode (dismisses without saving) |
| `.sp-edit-delete-btn` | Red-tinted Delete button (left-aligned); hidden when adding a new spell |
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
| `#settingsMenu` | Bottom-sheet opened by the ⚙ Settings header button; contains Save, Load, font-size, lefty-mode, and theme controls |
| `.settings-full-btn` | Full-width action button inside the settings sheet (Save / Load) |
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
| `.ai-type-toggle` | Flex row containing the three type-tab buttons (Spells / Features / Traits) inside `#aiImportPanel` |
| `.ai-type-btn` | One type-tab button; `.active` styles it in spell blue |
| `.ai-step` | Labeled step block (step label + input) in the AI mode content area |
| `.ai-step-label` | Tiny gold uppercase label above each step (e.g. "Step 1 — Describe what to add") |
| `.ai-prompt-box` | Shared text area / input style used in `#aiImportPanel` for both the "what to add" field and the paste-back area; focus turns border spell-blue |
| `.ai-copy-notice` | Small feedback line below the "Copy" or "Add Selected" button; spell-light colour |
| `.ai-select` | Full-width `<select>` styled to match the panel's dark palette; used for race / class pickers in SRD mode |
| `.srd-level-row` | Flex row containing the "Level min – max" number inputs in the class-features SRD control block |
| `.srd-lv-input` | Small 44 px number input for level bounds in the SRD class-features selector |
| `.srd-results-box` | Scrollable (max 200 px) container for the SRD search results / trait / feature list |
| `.srd-result-item` | One checkable row in `#srdResults`; flex row with a checkbox and a name span |
| `.srd-lv-group` | Level-group header row in the class-features results (e.g. "Level 3"); gold uppercase, subtle background |
| `.srd-hint` | Centred muted placeholder text shown when `#srdResults` is idle or has no matches |
| `.srd-loading` | Same style as `.srd-hint`; used while an SRD fetch is in progress |

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
STAT_PILL_INFO  // {ac, initiative, speed, dietype, spellatk, spelldc} — metadata for each combat stat pill; each entry has title, meta, desc; rollable entries add rollLabel/rollFn; simpleRollFn for hit die
SPELL_SLOTS_DEFAULT  // [{level, max}] — 9 levels, all max:0 except 1st:2
LEVEL_LABELS    // ['Cantrip','1st','2nd',...,'9th'] — display labels for spell levels 0–9
TABS            // ['overview','abilities','skills','combat','spells','features','inventory','rolls']
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
  inspiration:        false,
  hpCurrent:          10,
  spellSlots:         [ { level, max, used } ],  // 9 entries; levels with max=0 render as collapsed rows
  spells:             [ {                        // structured spell list (all fields optional except name and level)
                          name, level,           //   name: string; level: 0 (cantrip) – 9
                          school,                //   e.g. "Evocation"
                          castingTime,           //   e.g. "1 action"
                          range,                 //   e.g. "120 ft"
                          components,            //   e.g. "V, S, M (a pinch of sulfur)"
                          duration,              //   e.g. "Instantaneous"
                          saveAbility,           //   ability key ("STR"|"DEX"|"CON"|"INT"|"WIS"|"CHA") or ""
                          concentration,         //   boolean
                          ritual,                //   boolean
                          attackRoll,            //   boolean — true if spell uses a spell attack roll (d20 + spell atk bonus)
                          rolls,                 //   array of roll objects: [{dice, type, label?, mod?}]
                                                 //     dice:  string — dice expression e.g. "4d6"
                                                 //     type:  damage type key (see ROLL_TYPES) or 'not_damage' or 'other'
                                                 //     label: string — custom label when type='other'
                                                 //     mod:   ability key to add to roll result ('STR'|…|'SPELL'|'')
                          description,           //   free text (newlines preserved)
                          showInCombat,          //   boolean — true if spell appears in the combat attack block
                          combatActionType,      //   'action' | 'bonus' — sub-section in the combat block (default: 'action')
                          showInFeatures,        //   boolean — true if spell appears in the Featured Spells block in the Features tab
                        } ],
  attacks:            [ {
                          name,                  //   string — weapon or ability name
                          abilityMod,            //   '' | 'manual' | 'STR'|'DEX'|'CON'|'INT'|'WIS'|'CHA'|'SPELL'
                                                 //     '' = no attack roll; 'manual' = use bonus string; others = computed
                          proficient,            //   boolean — add proficiency bonus to computed attack roll
                          flatBonus,             //   integer — additional flat modifier added to computed roll
                          bonus,                 //   string — manual attack roll modifier (only used when abilityMod='manual')
                          rolls,                 //   array of roll objects: [{dice, type, label?, mod?}] — same shape as spells.rolls
                          actionType,            //   'action' | 'bonus' (default: 'action')
                          hidden,                //   boolean — shows row faded in the combat list; toggled via the edit panel checkbox
                          saveAbility,           //   ability key for a saving throw option, or ''
                          saveDC,                //   integer save DC, or 0
                          description,           //   free text — weapon masteries, special effects, etc.
                      } ],
  conditions:         [],   // condition name strings
  hitDiceUsed:        0,    // number of hit dice expended; max = charLevel
  classFeatures:      [ {   // Features tab trackers
                          name, max, used, recharge, step,
                          description,           //   optional — shown in feature view panel
                          attackRoll,            //   boolean — true if feature has an attack roll (e.g. Divine Smite)
                          attackMod,             //   ability key for the attack roll ('STR'|…|'SPELL'|'')
                          attackProficient,      //   boolean — add proficiency bonus to feature attack roll
                          rolls,                 //   array of roll objects: [{dice, type, label?, mod?}] — same shape as spells.rolls
                          saveAbility,           //   ability key or ""
                          saveDC,                //   integer, 0 = use current Spell Save DC
                        } ],
  infoTraits:         [ {   // Features & Traits shown in the Info tab
                          name, description,
                          damage, rollDamage,    //   optional damage roll support
                          saveAbility, saveDC,   //   optional saving throw display
                          showInCombat,          //   boolean — show as row in the combat block
                          combatActionType,      //   'action' | 'bonus' (default: 'action')
                        } ],
  portrait:           null, // base64 data URL string (e.g. "data:image/png;base64,...") or null
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
spellPanelEditIdx   // index into state.spells currently being edited; −1 = new spell
traitPressTimer     // setTimeout handle for trait row long-press (500 ms → edit mode)
traitPressActive    // boolean — true during and after a held trait press
traitPanelEditIdx   // index into state.infoTraits currently being edited; −1 = new trait
attackPanelIdx      // index into state.attacks currently being edited; −1 = new attack
abilityUndoTimers   // {[ab]: timerId} — debounce timers for ability undo entries
hpHoldTimer/Interval       // hold-to-repeat timers for HP +/− buttons
slotHoldTimer/Interval     // hold-to-repeat timers for spell slot +/− buttons
featureHoldTimer/Interval  // hold-to-repeat timers for feature +/− buttons
hitDiceHoldTimer/Interval  // hold-to-repeat timers for hit dice +/− buttons
featureNamePressTimer      // setTimeout handle for feature name long-press (500 ms → edit mode)
featureNamePressActive     // boolean — true during and after a held feature name press
featurePanelEditIdx        // index into state.classFeatures currently being edited; −1 = new feature
infoPanelCfg        // object holding the rollFn, simpleRollFn, editFn, actionFn closures for the currently-open #infoPanel
skillPressTimer / skillPressActive / skillPanelCurrentName  // skill row hold detection + current skill name
conditionPressTimer / conditionPressActive / conditionPanelCurrentName  // condition chip hold detection
abilityPressTimer / abilityPressActive  // ability card hold detection (500 ms → info panel)
savePressTimer / savePressActive        // saving throw row hold detection
statPillPressTimer / statPillPressActive  // combat stat pill hold detection
hitDiePressTimer / hitDiePressActive    // hit die roll button hold detection
fontSizeIdx         // index into FONT_SIZES; persisted separately in localStorage as 'dnd5e_fontsize'
leftyMode           // boolean; persisted separately in localStorage as 'dnd5e_lefty'
currentTheme        // string — active theme key; persisted in localStorage as 'dnd5e_theme'
srdModalMode        // 'ai' | 'srd' — which tab is active in #aiImportPanel
srdSelected         // Set<string> — SRD item indices checked in the current SRD results list
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
       ├─ buildAbilityGrid()  inject ability score cards into #abilityGrid
       ├─ buildSavingThrows() inject saving throw rows into #savingThrowsList
       ├─ buildSkillsList()   inject skill rows into #skillsList
       ├─ buildConditions()   inject condition chips into #conditionsGrid
       ├─ buildSpellSlots()   inject pill strip + active rows into #spellSlotsBody; levels with max=0 appear only as pills
       ├─ buildSpellList()      inject spell rows grouped by level into #spellListBody
       ├─ buildFeatures()       inject class feature rows into #featuresBody
       ├─ buildFeaturedSpells() inject featured spell rows into #featuredSpellsBody (Features tab)
       ├─ buildInfoTraits()     inject features & traits rows into #infoTraitsBody
       ├─ renderHitDice()       inject hit dice dots into #hitDiceDots
       ├─ recalcAll()         compute all derived values (modifiers, DC, etc.)
       ├─ setupAutoSave()     attach input/change listeners → saveData()
       └─ setupSwipe()        attach touchstart/touchend listeners for tab swiping
  └─ updateHeader()
  └─ updateHP()
  └─ renderAttacks()
  └─ set inspiration button state
```

`applyPayload(payload)` runs the same sequence (minus `loadData` and `setupAutoSave`) and is used for JSON import. It calls `buildFeaturedSpells()` and `buildInfoTraits()` as part of that sequence.

---

### Build functions

| Function | What it renders | Reads from |
|---|---|---|
| `buildAbilityGrid()` | 6 ability cards; tap → roll d20+mod (normal); hold 500 ms → open info panel with description + 3-zone roll button | `state.abilities` |
| `buildSavingThrows()` | 6 rows; short tap → roll (normal mode); hold 500 ms → open info panel with 3-zone roll button; tap prof dot → toggle proficiency | `state.saveProficiencies` |
| `buildSkillsList()` | 18 skill rows; tap row → roll; tap prof dots → cycle prof | `state.skillProficiencies`, `state.skillExpertise` |
| `buildConditions()` | 15 condition chips | `state.conditions` |
| `buildSpellSlots()` | Renders `#spellSlotsBody`: a pill strip of hidden levels (max=0) at the top, then one row per active level (max>0) with dots and mini +/− tracker | `state.spellSlots` |
| `expandSpellLevel(i)` | Sets `state.spellSlots[i].max` to 1 and rebuilds spell slots (moves that level from the pill strip into the active rows) | `state.spellSlots[i]` |
| `renderSlotDots(i)` | Dot row + counter for one spell level (gold left = available, grey right = used); counter shows `(max − used)/max` | `state.spellSlots[i]` |
| `buildSpellList()` | Groups `state.spells` by level and renders level dividers + spell rows into `#spellListBody`; shows placeholder when empty | `state.spells` |
| `buildFeatures()` | Class feature rows in `#featuresBody`; each row has a left column (clickable name area + dots below) and a right column (recharge label, ⏻ restore, EDIT button, mini tracker); pts/dot hint shown below the name when `step > 1`; empty-state placeholder when no features | `state.classFeatures` |
| `buildFeaturedSpells()` | "Featured Spells" block in `#featuredSpellsBody`; uses the same two-column layout as `buildFeatures()`; hidden when no spells have `showInFeatures: true` | `state.spells` |
| `buildInfoTraits()` | Features & Traits rows in `#infoTraitsBody`, or empty-state placeholder | `state.infoTraits` |
| `renderFeatureDots(i)` | Dot row + counter for one feature, scaled by `step` | `state.classFeatures[i]` |
| `renderHitDice()` | Hit dice dots in `#hitDiceDots`; max = character level | `state.hitDiceUsed`, `charLevel` input |
| `renderAttacks()` | Attack rows split into "Actions" and "Bonus Actions" sub-sections; combat spells (`showInCombat`) and combat traits (`showInCombat`) injected into each section; hidden attacks always shown but faded (`atk-hidden` class) | `state.attacks`, `state.spells`, `state.infoTraits` |
| `makeSpellRow(sp, spIdx)` | Returns HTML string for one spell row in the combat block; shows gold level pip for level > 0 | `state.spells[spIdx]` |
| `makeTraitRow(t, tIdx)` | Returns HTML string for one trait row in the combat block (gold colour scheme) | `state.infoTraits[tIdx]` |
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
| `getRollMod(modKey)` | Returns the numeric modifier for a `modKey` (`'STR'`/`'DEX'`/…/`'SPELL'`/`''`); reads from `state.abilities` or spell attack bonus |
| `computeRollResults(rolls)` | Evaluates each roll in a `rolls` array; returns an array of formatted strings (`"Fire: 8"`, `"Guidance: 3"`) or `null` if no valid rolls |
| `getRollSummary(rolls)` | Returns a compact display string of all roll dice expressions joined by ` + ` (e.g. `"1d8 + 1d6"`) for list view |
| `getRollBoxLabel(rolls)` | Returns `'Damage'` if any roll has a standard damage type; otherwise `'Roll'` |
| `showRollsOnly(name, rolls)` | Evaluates a rolls array and shows result in the roll overlay; single roll shows as main total, multi-roll sums all and shows individual lines in secondary |
| `getAttackBonus(a)` | Returns the formatted to-hit bonus string for an attack, computed from `abilityMod`, `proficient`, and `flatBonus`; falls back to `a.bonus` for `abilityMod='manual'` |
| `getFeatureAttackBonus(f)` | Returns the formatted attack bonus for a class feature, computed from `attackMod` and `attackProficient` |
| `rollTypeOptions(sel)` | Returns `<option>` HTML for the damage-type dropdown with the given value selected |
| `rollModOptions(sel)` | Returns `<option>` HTML for the ability-mod dropdown with the given value selected |
| `buildRollRowHTML(r)` | Returns HTML for one edit-mode roll row (`dice` + `type` + optional `label` + `mod` + ✕ button) |
| `renderRollRows(containerId, rolls)` | Renders an array of roll objects into the named container element |
| `addRollRow(containerId)` | Appends a new blank roll row to the named container |
| `removeRollRow(btn)` | Removes the closest `.roll-row-edit` ancestor from the DOM |
| `getRollsFromContainer(containerId)` | Reads all roll rows from the named container and returns a filtered array (rows without dice are dropped) |
| `onRollTypeChange(sel)` | Shows/hides the custom label input when the type dropdown is changed to/from `'other'` |
| `toggleAtkBonusFields()` | Shows the manual bonus input or proficient+flat-bonus fields depending on `atkEditAbilityMod` selection |
| `_normalizeSpell(sp)` | Ensures a spell object has a `rolls` array; migrates legacy `damage` field if needed |
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
| `startAbilityPress(e, ab)` | `pointerdown` on ability card | Starts 500 ms timer; on fire opens ability info panel via `openInfoPanel()` with roll button |
| `endAbilityPress(e, ab)` | `pointerup` on ability card | If timer hadn't fired: calls `rollAbility(ab)` directly |
| `cancelAbilityPress()` | `pointercancel` on ability card | Clears timer |
| `rollAbility(ab, mode='normal')` | Short tap on ability card or roll button in info panel | Rolls d20 + ability modifier with given mode; calls `showRoll()` |
| `toggleSaveProf(ab, el)` | Tap prof dot on saving throw row | Pushes undo; toggles ability key in `state.saveProficiencies` |
| `startSavePress(e, ab)` | `pointerdown` on saving throw row (outside dot) | Starts 500 ms timer; on fire opens saving throw info panel via `openInfoPanel()` |
| `endSavePress(e, ab)` | `pointerup` on saving throw row | If timer hadn't fired: calls `rollSave(ab)` directly |
| `cancelSavePress()` | `pointercancel` on saving throw row | Clears timer |
| `rollSave(ab, mode='normal')` | Short tap on saving throw row or roll button in info panel | Rolls d20 + save modifier with given mode; calls `showRoll()` |
| `cycleSkillProf(name, el)` | Tap prof dots on skill row | Pushes undo; cycles None → Proficient → Expert → None |
| `startSkillPress(e, name)` | `pointerdown` on skill row | Starts 500 ms timer; on fire opens skill info panel via `openInfoPanel()` |
| `clickSkillItem(e, name)` | `click` on skill row | If timer hadn't fired: calls `rollSkill(name)` |
| `cancelSkillPress()` | `pointercancel` on skill row | Clears timer |
| `openSkillPanel(name)` | Internal (fired by hold timer) | Opens info panel for the given skill with roll button |
| `dismissSkillPanel()` | (alias) | Clears `skillPanelCurrentName` and calls `dismissInfoPanel()` |
| `rollSkill(name, mode='normal')` | Short tap skill row or roll button in info panel | Rolls d20 + skill modifier with given mode; calls `showRoll()` |
| `rollInitiative(mode='normal')` | Tap Initiative stat pill (tap) or roll button in info panel | Rolls d20 + DEX modifier with given mode; calls `showRoll()` |
| `rollSpellAtk(mode='normal')` | Tap Spell Atk stat pill (tap) or roll button in info panel | Rolls d20 + spell attack bonus with given mode; calls `showRoll()` (shows toast if no spell ability set) |
| `rollSpellFromPanel(mode='normal')` | Tap zone in `.roll-tri` inside spell view panel | Reads current spell from `spellPanelEditIdx`; rolls d20 + spell attack bonus; rolls `sp.damage` as secondary if set; calls `showRoll()` |
| `rollAttack(i)` | Tap weapon attack row | If the attack is hidden, opens the panel in edit mode; if the attack has a bonus, rolls d20 + bonus and optionally rolls damage; otherwise opens info panel; no-ops if `longPressActive` |
| `startLongPress(e, i)` | `pointerdown` on weapon attack row | Starts 500 ms timer; on fire calls `openAttackPanel(i, false)` to open info/view mode |
| `cancelLongPress()` | `pointerup` / `pointercancel` on attack row | Clears the long-press timer |
| `openAttackPanel(i, editMode)` | Internal | Calls `pushModalHistory()`; populates view or edit form; sets `attackPanelIdx = i`; shows `#attackPanelBackdrop` and `#attackPanel`; `i = -1` means new attack |
| `switchToAtkEdit()` | Tap Edit button inside attack panel view | Switches `#attackPanel` to edit mode by adding `.edit-mode`; populates edit form fields |
| `saveAttackPanel()` | Tap Save in attack panel edit mode | Validates name; creates or updates `state.attacks[attackPanelIdx]`; calls `renderAttacks()` + `saveData()`; dismisses panel |
| `deleteFromAttackPanel()` | Tap Delete in attack panel edit mode | Splices `state.attacks[attackPanelIdx]`; calls `renderAttacks()` + `saveData()`; dismisses panel |
| `dismissAttackPanel()` | Backdrop tap or Cancel in panel | Calls `popModalHistory()`; removes `.show` and `.edit-mode` from `#attackPanel` |
| `rollFromAttackPanel(mode='normal')` | Tap zone in `.roll-tri` inside attack panel view | Rolls d20 + attack bonus with given mode; rolls damage as secondary; calls `showRoll()` |
| `addAttack()` | "+ Add Attack" button | Opens attack panel in edit mode with empty form (`attackPanelIdx = -1`) |
| `adjustHP(delta)` | +/− HP buttons (single tap) | Pushes undo; clamps `state.hpCurrent` to `[0, max]`; calls `updateHP()` |
| `startHpHold(delta)` / `stopHpHold()` | `pointerdown` / `pointerup` on HP buttons | Calls `adjustHP` immediately, then repeats at 80 ms after a 500 ms delay |
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
| `switchToSpellEdit()` | Tap Edit button inside spell view panel | Adds `.edit-mode` to `#spellPanel`; populates edit form; focuses the name field |
| `startTraitPress(e, i)` | `pointerdown` on a trait row (Info tab or combat list) | Starts 500 ms timer; adds `.holding` visual on fire; opens trait info panel (view mode) |
| `clickTraitItem(e, i)` | `click` on a trait row | If timer hasn't fired: rolls damage if `rollDamage && damage`; opens info panel otherwise; clears timer |
| `cancelTraitPress()` | `pointercancel` on a trait row | Clears timer and removes `.holding` class |
| `switchToTraitEdit()` | Tap Edit button inside trait view panel | Adds `.edit-mode` to `#traitPanel`; populates edit form; focuses the name field |
| `openTraitPanel(i, editMode)` | Internal | Calls `pushModalHistory()`; populates view or edit form; sets `traitPanelEditIdx = i`; shows `#traitBackdrop` and `#traitPanel`; `i = -1` means new trait |
| `addInfoTrait()` | Tap + Add in Features & Traits section header | Opens trait panel in edit mode with empty form; sets `traitPanelEditIdx = -1` |
| `saveTraitEdit()` | Tap Save in trait panel edit mode | Validates name; writes to `state.infoTraits[idx]` or pushes new entry; calls `buildInfoTraits()` + `saveData()`; dismisses panel |
| `deleteCurrentTrait()` | Tap Delete in trait panel edit mode | `confirm()` dialog → splices `state.infoTraits`; calls `buildInfoTraits()` + `saveData()`; dismisses panel |
| `dismissTraitPanel()` | Backdrop tap or Cancel in panel | Calls `popModalHistory()`; removes `.show` and `.edit-mode` from `#traitPanel` |
| `openSpellPanel(i, editMode)` | Internal | Calls `pushModalHistory()`; populates view or edit form; sets `spellPanelEditIdx = i` in both modes; shows backdrop + panel |
| `addSpell()` | Tap + Add button in Spells section | Opens spell panel in edit mode with empty form; sets `spellPanelEditIdx = -1` |
| `populateSpellViewPanel(i)` | Internal | Fills view-mode elements from `state.spells[i]`; shows save DC box if `saveAbility` is set; shows attack roll card if `attackRoll` is `true`; shows rolls box if `rolls` is non-empty and `attackRoll` is false |
| `populateSpellEditForm(i)` | Internal | Fills edit form from `state.spells[i]` including `attackRoll`, `rolls` (rendered via `renderRollRows`), `showInCombat`, `combatActionType`, and `showInFeatures`; blanks all fields when `i = -1` |
| `saveSpellEdit()` | Tap Save in edit mode | Validates name; writes all fields including `rollDamage`, `showInCombat`, `combatActionType`, `showInFeatures`; calls `buildSpellList()` + `buildFeaturedSpells()` + `renderAttacks()` + `saveData()`; dismisses panel |
| `deleteCurrentSpell()` | Tap Delete in edit mode | Confirms; splices from `state.spells`; calls `buildSpellList()` + `buildFeaturedSpells()` + `renderAttacks()` + `saveData()`; dismisses panel |
| `dismissSpellPanel()` | Backdrop tap or Cancel | Calls `popModalHistory()`; removes `.show` and `.edit-mode` from `#spellPanel` |
| `renderFeatureDots(i)` | Any feature use/restore | Updates dots and `n/max` counter for feature `i` |
| `toggleFeatureDot(i, j)` | Tap feature dot | Gold → use dots from here right; grey → restore that dot (respects `step`) |
| `featureAdjust(i, delta)` | Feature mini +/− buttons | Changes `f.used` by `±step`; rerenders dots |
| `startFeatureHold(i, delta)` / `stopFeatureHold()` | `pointerdown` / `pointerup` on feature +/− | Hold-to-repeat at 80 ms |
| `setFeatureMax(i, val)` | (internal — no longer called from the row UI; `max` is now changed only via the edit panel) | Updates `f.max`; clamps `f.used`; rerenders dots |
| `editFeature(i)` | EDIT button on a feature row | Calls `openFeaturePanel(i, true)` to open the feature in edit mode |
| `restoreFeature(i)` | ⏻ button on a feature row | Sets `f.used = 0`; rerenders dots; shows toast |
| `restoreAllFeatures()` | ↺ All button in Features section | Sets all feature `used` to `0`; rerenders all dot rows |
| `startFeatureNamePress(e, i)` | `pointerdown` on `.feature-name-area` | Starts 500 ms timer; adds `.holding` visual on fire; on fire opens feature info panel (view mode) |
| `clickFeatureName(e, i)` | `click` on `.feature-name-area` | If timer hasn't fired: rolls damage if `rollDamage && damage`; opens info panel otherwise; clears timer |
| `cancelFeatureNamePress()` | `pointercancel` on `.feature-name-area` | Clears timer and removes `.holding` class |
| `switchToFeatureEdit()` | Tap Edit button inside feature view panel | Adds `.edit-mode` to `#featurePanel`; populates edit form; focuses the name field |
| `openFeaturePanel(i, editMode)` | Internal | Calls `pushModalHistory()`; populates view or edit form; sets `featurePanelIdx = i`; shows `#featurePanelBackdrop` and `#featurePanel`; `i = -1` means new feature |
| `addFeature()` | + Add button | Calls `openFeaturePanel(-1, true)` (new feature mode) |
| `populateFeatureViewPanel(i)` | Internal | Fills view-mode elements from `state.classFeatures[i]`; shows attack roll card if `attackRoll` and `attackMod` are set; shows rolls box if `rolls` is non-empty; shows save DC box if `saveAbility` is set |
| `populateFeatureEditForm(i)` | Internal | Fills edit form from `state.classFeatures[i]` including `attackRoll`, `attackMod`, `attackProficient`, `rolls` (via `renderRollRows`); blanks all fields when `i = -1` |
| `saveFeaturePanel()` | Tap Save in feature panel edit mode | Validates name; writes all fields including `attackRoll`, `attackMod`, `attackProficient`, `rolls` to `state.classFeatures[idx]` or pushes new entry; calls `buildFeatures()` + `saveData()`; dismisses panel |
| `rollFeatureDamage()` | Tap rolls box in feature panel view mode | Calls `showRollsOnly()` with feature's `rolls` array |
| `rollFromFeaturePanel(mode)` | Tap attack roll card in feature panel view mode | Rolls d20 + computed feature attack bonus; shows all roll results in secondary |
| `deleteFeatureFromPanel()` | Tap Delete in feature panel edit mode | `confirm()` dialog → splices `state.classFeatures`; calls `buildFeatures()` + `saveData()`; dismisses panel |
| `dismissFeaturePanel()` | Backdrop tap or Cancel | Calls `popModalHistory()`; removes `.show` and `.edit-mode` from `#featurePanel` |
| `renderHitDice()` | Any hit dice change or level change | Updates dots in #hitDiceDots; counter shows `(max − used)/max` |
| `toggleHitDie(j)` | Tap hit dice dot | Gold → use from here right; grey → restore that die |
| `hitDiceAdjust(delta)` | Hit dice mini +/− buttons | Changes `state.hitDiceUsed` by ±1; `−` button passes `+1` (use), `+` passes `−1` (restore) |
| `startHitDiceHold(delta)` / `stopHitDiceHold()` | `pointerdown` / `pointerup` on hit dice +/− | Hold-to-repeat at 80 ms |
| `restoreHitDice()` | ↺ Restore button in Hit Dice section | Sets `state.hitDiceUsed = 0`; rerenders |
| `fullLongRest()` | ⟳ Long Rest button in Overview panel | Restores HP to max, resets hit dice, all spell slots, and all class features; saves |
| `removeAttack(i)` | Tap Delete button in attack edit panel | Pushes undo; splices `state.attacks`; rerenders |
| `openInfoPanel(cfg)` | Called by any item that opens the unified info panel | Applies badge, title, meta, description, optional 3-zone roll button, optional simple roll button, optional edit button, optional action button; calls `pushModalHistory()`; stores `rollFn/simpleRollFn/editFn/actionFn` in `infoPanelCfg` |
| `dismissInfoPanel()` | Backdrop tap or browser back | Calls `popModalHistory()`; hides `#infoPanel` and backdrop; clears `infoPanelCfg` |
| `infoPanelRoll(mode)` | Tap zone in `#ipRollBox` | Calls `infoPanelCfg.rollFn(mode)` |
| `infoPanelSimpleRoll()` | Tap `#ipSimpleRollBox` | Calls `infoPanelCfg.simpleRollFn()` |
| `infoPanelEdit()` | Tap Edit button (`#ipEditBtn`) in info panel | Dismisses info panel then calls `infoPanelCfg.editFn()` |
| `infoPanelAction()` | Tap action button (`#ipActionBtn`) in info panel | Dismisses info panel then calls `infoPanelCfg.actionFn()` |
| `startStatPillPress(e, key)` | `pointerdown` on combat stat pill label | Starts 500 ms timer; on fire calls `openStatPillPanel(key)` |
| `endStatPillPress(e, key)` | `pointerup` on combat stat pill label | If timer hadn't fired and stat is rollable: rolls directly (`rollInitiative()` / `rollSpellAtk()`); otherwise opens info panel |
| `cancelStatPillPress()` | `pointercancel` on stat pill | Clears timer |
| `openStatPillPanel(key)` | Internal | Opens `#infoPanel` with data from `STAT_PILL_INFO[key]`; rollable stats show a 3-zone roll button; hit die shows a simple roll button |
| `startHitDiePress(e)` | `pointerdown` on hit die roll button | Starts 500 ms timer; on fire opens `openStatPillPanel('dietype')` info panel |
| `endHitDiePress(e)` | `pointerup` on hit die roll button | If timer hadn't fired: calls `rollHitDie()` |
| `cancelHitDiePress()` | `pointercancel` on hit die roll button | Clears timer |
| `openDeathSavePanel()` | Tap Roll button next to Death Saving Throws | Opens `#infoPanel` with death save description and a 3-zone roll button |
| `rollDeathSave(mode='normal')` | Roll zone in death save info panel | Rolls d20 (no modifier); interprets nat-1/nat-20 specially; calls `showRoll()` |
| `openConditionPanel(name)` | Internal (fired by hold timer on condition chip) | Opens `#infoPanel` with condition description and an "Apply / Remove Condition" action button |
| `dismissConditionPanel()` | (alias) | Clears `conditionPanelCurrentName` and calls `dismissInfoPanel()` |
| `clickConditionItem(e, name, el)` | Tap condition chip | Calls `toggleCondition()` directly (instant on/off); no-ops if long-press already fired |
| `toggleCondition(name, el)` | Short tap on condition chip, or Apply/Remove button inside condition panel | Pushes undo; toggles name in `state.conditions`; rebuilds condition chips |
| `toggleInspiration()` | Tap inspiration button | Pushes undo; flips `state.inspiration` boolean |
| `toggleDeathSave(dot, type)` | Tap death save dot | Toggles `.filled` class on the dot element (not tracked by undo) |

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
  Tap Edit (in panel)→ switchToAtkEdit()            — switches same modal to edit mode

Spell row (spell list, combat list, featured spells)
  Tap                → clickSpellItem(e, i)         — rolls spell attack if attackRoll; rolls damage if rollDamage only; opens info panel if no roll configured
  Hold (500 ms)      → openSpellPanel(i, false)     — opens spell info panel (view mode)
  Tap Edit (in panel)→ switchToSpellEdit()          — switches same modal to edit mode

Trait row (Info tab and combat list)
  Tap                → clickTraitItem(e, i)         — rolls damage if rollDamage; opens info panel otherwise
  Hold (500 ms)      → openTraitPanel(i, false)     — opens trait info panel (view mode)
  Tap Edit (in panel)→ switchToTraitEdit()          — switches same modal to edit mode

Feature name area
  Tap                → clickFeatureName(e, i)       — rolls damage if rollDamage; opens info panel otherwise
  Hold (500 ms)      → openFeaturePanel(i, false)   — opens feature info panel (view mode)
  Tap Edit (in panel)→ switchToFeatureEdit()        — switches same modal to edit mode

Condition chip
  Tap                → toggleCondition(name, el)    — instantly toggles the condition on/off (conditions are checkboxes, not rolls)
  Hold (500 ms)      → openConditionPanel(name)     — opens condition info panel with description and Apply/Remove button

```

Attack panel states:
```
View mode  (default) — shows name, action type, attack roll card (tappable), save DC box, rolls-only box, description, Edit button (top-right)
Edit mode            — shows editable form for all fields (name, attack roll selector with proficiency/flat bonus or manual entry, rolls rows, action type, hidden checkbox, saving throw, description)
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
| `collectFormData()` | Reads all 28 form input values by element ID into a plain object |
| `buildPayload()` | Returns `{ form, state }` — the canonical serialisation format; `state` includes `spellSlots`, `attacks`, `conditions`, `classFeatures`, `infoTraits`, `hitDiceUsed`, `portrait`, and all ability/proficiency data |
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
| `updateHeader()` | Reads name/class/race/level inputs → updates sticky header display |
| `switchTab(id)` | Deactivates all panels/buttons; activates the target; scrolls its tab button into view |
| `setupSwipe()` | Attaches passive `touchstart`/`touchend` listeners to `document.body`; horizontal swipe ≥ 50 px (and greater than vertical movement) advances or retreats through `TABS`; ignored when roll result overlay is open |
| `toast(msg)` | Shows floating message for 2 seconds; used for non-roll feedback (proficiency changes, inspiration, file ops) |
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

The **⇓ Import** button in the sticky header bar (between Undo and ⚙ Settings) opens `#aiImportPanel`. The modal has two modes selected by the top toggle.

#### AI mode
Generates a copy-ready LLM prompt containing the exact JSON schema and the names of items already on the sheet; the user pastes the LLM's JSON array response into Step 2 and clicks Import.

| Function | Description |
|---|---|
| `openAIImport(type)` | Opens `#aiImportPanel` in AI mode, pre-selects the given type tab (`'spells'`, `'features'`, or `'traits'`), resets both text areas and the SRD selection set |
| `dismissAIImport()` | Hides `#aiImportPanel` and its backdrop |
| `setModalMode(mode)` | Switches between `'ai'` and `'srd'` content areas; calls `_srdInitForType()` when switching to SRD |
| `setAIImportType(type)` | Updates active state on type-tab buttons; calls `_srdInitForType()` if currently in SRD mode |
| `generateAndCopyAIPrompt()` | Builds the prompt for the active type via `_buildSpellPrompt`, `_buildFeaturePrompt`, or `_buildTraitPrompt`; writes to clipboard via `navigator.clipboard` with `execCommand` fallback |
| `_buildSpellPrompt(what)` | Returns a prompt string with the spell JSON schema and the list of already-present spell names |
| `_buildFeaturePrompt(what)` | Returns a prompt string with the classFeature JSON schema and existing feature names |
| `_buildTraitPrompt(what)` | Returns a prompt string with the infoTrait JSON schema and existing trait names |
| `importAIResponse()` | Parses the pasted text (strips markdown fences); merges into `state.spells`, `state.classFeatures`, or `state.infoTraits` depending on active type; deduplicates by lowercase name; rebuilds the relevant list |

#### SRD mode (requires internet)
Live search against the [D&D 5e SRD API](https://www.dnd5eapi.co) (2014 SRD, CC-BY). Results are cached in `localStorage` under keys prefixed `srd_v1_`. Each fetch goes to `https://www.dnd5eapi.co/api/<path>`.

| Function | Description |
|---|---|
| `_srdGet(path)` | `fetch()` wrapper with `localStorage` caching; throws on non-2xx responses |
| `_srdShowCtrls(type)` | Shows the correct control block (spell search / race select / class select) for the active type; clears `srdSelected` |
| `_srdInitForType(type)` | Async; shows the right control, pre-fetches or populates dropdown, sets idle hint text |
| `_srdSpellSearch()` | Filters the cached `/spells` index by the search input value; renders up to 40 matches via `_srdRenderList()` |
| `_srdLoadRace()` | Fetches `/races/{index}`; renders the `race.traits` array via `_srdRenderList()` |
| `_srdLoadClass()` | Fetches `/classes/{index}/levels`; filters by level range; renders features grouped by level with `.srd-lv-group` headers |
| `_srdRenderList(items)` | Renders an array of `{index, name}` objects as checkable `.srd-result-item` rows into `#srdResults`; binds change listeners via `_srdBindCbs()` |
| `_srdBindCbs()` | Attaches `change` listeners to all `.srd-cb` checkboxes; adds/removes indices from `srdSelected` |
| `addSelectedSRD()` | Async; iterates `srdSelected`, fetches full data per item, maps to sheet format, deduplicates, merges into the correct state array, rebuilds UI; shows progress counter on the button |
| `_mapSrdSpell(sp)` | Maps a `dnd5eapi.co` spell object to the sheet's spell schema; infers `combatActionType` from `casting_time`; truncates descriptions longer than 600 characters |
| `_mapSrdTrait(tr)` | Maps a trait object (from `/traits/{index}`) to the `infoTraits` schema; defaults `showInCombat: false` |
| `_mapSrdFeature(feat)` | Maps a feature object (from `/features/{index}`) to the `classFeatures` schema; defaults `max: 1`, `recharge: 'Long Rest'` — edit after import if different |

> **2024 SRD note:** `dnd5eapi.co` covers the 2014 SRD. For 2024 SRD content (released under CC-BY 4.0 as SRD 5.2), use the AI Import workflow: the prompt templates are edition-agnostic and work with any LLM that knows the 2024 rules.

---

## Adding a new field — checklist

1. Add the HTML input with a unique `id` to the relevant panel.
2. Add the `id` string to the array inside `collectFormData()`.
3. If the field affects a derived value (modifier, DC), update `recalcAll()`.
4. If the field needs dynamic rendering, add a build function and call it from `init()` and `applyPayload()`.
5. Update `REFERENCE.md` (this file) and `JSONGeneration.md`.
