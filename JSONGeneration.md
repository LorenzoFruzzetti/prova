# JSONGeneration — Compatible JSON File Format

This document describes the exact structure of JSON files that can be loaded into `dnd-character-sheet.html` via the **Load** button, and that are produced by the **Save** button.

---

## Top-level structure

```json
{
  "form":  { ... },
  "state": { ... }
}
```

Both keys are required. Unknown keys at any level are silently ignored.

---

## `form` object

Contains every HTML form field value as a **string**, even when the field holds a number. This mirrors what the browser stores in `input.value`.

```json
"form": {
  "charName":       "Aria Swiftblade",
  "charClass":      "Rogue",
  "charSubclass":   "Arcane Trickster",
  "charRace":       "Half-Elf",
  "charLevel":      "7",
  "charBackground": "Criminal",
  "charAlignment":  "Chaotic Neutral",
  "charXP":         "23000",

  "personality":    "I always have a plan for when things go wrong.",
  "ideals":         "Freedom. Chains are meant to be broken.",
  "bonds":          "I owe my mentor a life debt.",
  "flaws":          "I turn tail and run when things look bad.",

  "hpMax":          "52",
  "hpTemp":         "0",
  "statAC":         "15",
  "statSpeed":      "30",
  "statHitDice":    "7d8",

  "spellAbility":   "INT",

  "equipment":      "- Rapier (1d8 piercing)\n- Hand Crossbow\n- Thieves' Tools\n- Bag of Holding",
  "proficiencies":  "Light armor, simple weapons, hand crossbows, longswords, rapiers, shortswords",
  "languages":      "Common, Elvish, Thieves' Cant",
  "notes":          "Session 12: found the map to the vault.",

  "cp":  "0",
  "sp":  "50",
  "ep":  "0",
  "gp":  "340",
  "pp":  "5"
}
```

### `form` field reference

| Key | Type | Accepted values |
|---|---|---|
| `charName` | string | Any text |
| `charClass` | string | One of: `Barbarian`, `Bard`, `Cleric`, `Druid`, `Fighter`, `Monk`, `Paladin`, `Ranger`, `Rogue`, `Sorcerer`, `Warlock`, `Wizard`, `Artificer`, or `""` |
| `charSubclass` | string | Any text |
| `charRace` | string | Any text |
| `charLevel` | string (int) | `"1"` – `"20"` |
| `charBackground` | string | Any text |
| `charAlignment` | string | One of the nine alignments or `""` |
| `charXP` | string (int) | `"0"` or higher |
| `personality` | string | Free text, newlines allowed |
| `ideals` | string | Free text |
| `bonds` | string | Free text |
| `flaws` | string | Free text |
| `hpMax` | string (int) | `"1"` or higher |
| `hpTemp` | string (int) | `"0"` or higher |
| `statAC` | string (int) | Any integer |
| `statSpeed` | string (int) | Any integer (feet) |
| `statHitDice` | string | Dice notation e.g. `"7d8"` |
| `spellAbility` | string | `"INT"`, `"WIS"`, `"CHA"`, or `""` |
| `equipment` | string | Free text |
| `proficiencies` | string | Free text |
| `languages` | string | Free text |
| `notes` | string | Free text |
| `cp` | string (int) | `"0"` or higher (copper pieces) |
| `sp` | string (int) | `"0"` or higher (silver pieces) |
| `ep` | string (int) | `"0"` or higher (electrum pieces) |
| `gp` | string (int) | `"0"` or higher (gold pieces) |
| `pp` | string (int) | `"0"` or higher (platinum pieces) |

> **All values are strings.** Do not use JSON numbers here — use `"10"` not `10`.

---

## `state` object

Contains structured game data that cannot be expressed as plain form inputs.

```json
"state": {
  "abilities": {
    "STR": 10,
    "DEX": 18,
    "CON": 14,
    "INT": 16,
    "WIS": 12,
    "CHA": 14
  },

  "saveProficiencies": ["DEX", "INT"],

  "skillProficiencies": [
    "Acrobatics",
    "Deception",
    "Perception",
    "Sleight of Hand",
    "Stealth"
  ],

  "skillExpertise": [
    "Stealth",
    "Sleight of Hand"
  ],

  "inspiration": false,

  "hpCurrent": 45,

  "spellSlots": [
    { "level": "1st", "max": 3, "used": 1 },
    { "level": "2nd", "max": 0, "used": 0 },
    { "level": "3rd", "max": 0, "used": 0 },
    { "level": "4th", "max": 0, "used": 0 },
    { "level": "5th", "max": 0, "used": 0 },
    { "level": "6th", "max": 0, "used": 0 },
    { "level": "7th", "max": 0, "used": 0 },
    { "level": "8th", "max": 0, "used": 0 },
    { "level": "9th", "max": 0, "used": 0 }
  ],

  "spells": [
    {
      "name":        "Fire Bolt",
      "level":       0,
      "school":      "Evocation",
      "castingTime": "1 action",
      "range":       "120 ft",
      "components":  "V, S",
      "duration":    "Instantaneous",
      "saveAbility": "",
      "concentration": false,
      "ritual":      false,
      "attackRoll":  true,
      "damage":      "2d10 fire",
      "description": "You hurl a mote of fire at a creature or object within range.",
      "showInCombat": true,
      "combatActionType": "action"
    },
    {
      "name":        "Shield",
      "level":       1,
      "school":      "Abjuration",
      "castingTime": "1 reaction",
      "range":       "Self",
      "components":  "V, S",
      "duration":    "1 round",
      "saveAbility": "",
      "concentration": false,
      "ritual":      false,
      "attackRoll":  false,
      "damage":      "",
      "description": "+5 bonus to AC until the start of your next turn.",
      "showInCombat": false,
      "combatActionType": "action"
    },
    {
      "name":        "Hypnotic Pattern",
      "level":       3,
      "school":      "Illusion",
      "castingTime": "1 action",
      "range":       "120 ft",
      "components":  "S, M (a glowing stick of incense or a crystal vial filled with phosphorescent material)",
      "duration":    "1 minute",
      "saveAbility": "WIS",
      "concentration": true,
      "ritual":      false,
      "attackRoll":  false,
      "damage":      "",
      "description": "Each creature in a 30-foot cube originating from a point you choose makes a WIS save or becomes charmed.",
      "showInCombat": true,
      "combatActionType": "action"
    }
  ],

  "attacks": [
    { "name": "Rapier",        "bonus": "+7", "damage": "1d8+4", "actionType": "action" },
    { "name": "Hand Crossbow", "bonus": "+7", "damage": "1d6+4", "actionType": "action" },
    { "name": "Sneak Attack",  "bonus": "—",  "damage": "4d6",   "actionType": "action",
      "description": "Once per turn when you have advantage or an ally is adjacent to target." }
  ],

  "conditions": ["Poisoned"],

  "hitDiceUsed": 2,

  "classFeatures": [
    { "name": "Channel Divinity", "max": 2,  "used": 1, "recharge": "Short Rest", "step": 1 },
    { "name": "Lay on Hands",     "max": 25, "used": 5, "recharge": "Long Rest",  "step": 5 }
  ],

  "infoTraits": [
    { "name": "Sneak Attack", "description": "Once per turn, deal extra 4d6 damage when you have advantage or an ally is adjacent to the target." },
    { "name": "Cunning Action", "description": "As a bonus action, Dash, Disengage, or Hide." },
    { "name": "Uncanny Dodge", "description": "When an attacker you can see hits you, use your reaction to halve the attack's damage." }
  ],

  "portrait": null
}
```

### `state` field reference

#### `abilities`
Object with exactly six keys. Values are **integers** in the range 1–30.

```json
"abilities": { "STR": 10, "DEX": 10, "CON": 10, "INT": 10, "WIS": 10, "CHA": 10 }
```

The app derives modifiers and all dependent values (saving throws, skills, initiative, spell DC) automatically — do not store modifiers in the JSON.

#### `saveProficiencies`
Array of ability key strings. Include a key to mark that saving throw as proficient.

```json
"saveProficiencies": ["STR", "CON"]
```

Valid keys: `"STR"`, `"DEX"`, `"CON"`, `"INT"`, `"WIS"`, `"CHA"`.

#### `skillProficiencies`
Array of skill name strings (exact spelling required).

```json
"skillProficiencies": ["Acrobatics", "Stealth", "Perception"]
```

Valid skill names:

```
Acrobatics, Animal Handling, Arcana, Athletics, Deception, History,
Insight, Intimidation, Investigation, Medicine, Nature, Perception,
Performance, Persuasion, Religion, Sleight of Hand, Stealth, Survival
```

#### `skillExpertise`
Array of skill name strings. Every name here **must also appear** in `skillProficiencies`.
Expertise doubles the proficiency bonus for that skill.

```json
"skillExpertise": ["Stealth", "Perception"]
```

Visual effect: two filled dots instead of one.

#### `inspiration`
Boolean. `true` = character currently has inspiration.

```json
"inspiration": false
```

#### `hpCurrent`
Integer. Must be between `0` and the value in `form.hpMax`.

```json
"hpCurrent": 45
```

#### `spellSlots`
Array of **exactly 9 objects**, one per spell level in order from 1st to 9th.

Each object:

| Key | Type | Description |
|---|---|---|
| `level` | string | `"1st"` through `"9th"` (used for display only) |
| `max` | integer | Total slots available at this level (`0`–`9`) |
| `used` | integer | Slots already expended; must be `≤ max` |

Non-casters can set all `max` values to `0`.

#### `spells`
Array of spell objects stored in the character's spell list. Can be empty (`[]`).

Each object:

| Key | Type | Description |
|---|---|---|
| `name` | string | Spell name (required) |
| `level` | integer | `0` = Cantrip; `1`–`9` = spell level |
| `school` | string | Magic school, e.g. `"Evocation"`, `"Illusion"` (optional) |
| `castingTime` | string | e.g. `"1 action"`, `"1 bonus action"`, `"1 minute"` (optional) |
| `range` | string | e.g. `"120 ft"`, `"Self"`, `"Touch"` (optional) |
| `components` | string | e.g. `"V, S"`, `"V, S, M (a pinch of sulfur)"` (optional) |
| `duration` | string | e.g. `"Instantaneous"`, `"1 hour"` (optional) |
| `saveAbility` | string | Ability for the saving throw: `"STR"`, `"DEX"`, `"CON"`, `"INT"`, `"WIS"`, `"CHA"`, or `""` if the spell has no save |
| `concentration` | boolean | `true` if the spell requires concentration |
| `ritual` | boolean | `true` if the spell can be cast as a ritual |
| `attackRoll` | boolean | `true` if the spell requires a ranged/melee spell attack roll (shows a tappable d20 roll card in the view panel) |
| `rolls` | array | Array of roll objects `[{dice, type, label?, mod?}]`. Each entry: `dice` = expression (`"4d6"`); `type` = damage type key or `"not_damage"` or `"other"`; `label` = custom label when `type="other"`; `mod` = ability key to add (`"STR"`/`"DEX"`/…/`"SPELL"` or `""`). |
| `description` | string | Full spell description; newlines are preserved |
| `showInCombat` | boolean | `true` to show the spell as a row in the combat attack block. Use this instead of duplicating the spell in `state.attacks[]` |
| `combatActionType` | string | `"action"` (default) or `"bonus"` — which sub-section of the combat block the spell appears in when `showInCombat` is `true` |
| `showInFeatures` | boolean | `true` to show the spell in the "Featured Spells" block inside the Features tab — useful for spells that function like limited-use class features |

When a spell has a `saveAbility` set, the view panel shows the current **Spell Save DC** prominently. The view panel contains a tappable attack-roll card (when `attackRoll` is `true`) and a tappable rolls card (when `rolls` is non-empty and `attackRoll` is `false`).

**Tap/hold behaviour on spell rows:** tapping a spell row rolls directly — d20 + spell attack bonus if `attackRoll` is `true` (rolls are shown in secondary); all `rolls` dice if `rolls` is non-empty and `attackRoll` is `false`; opens the info panel when neither is set. Holding (500 ms) always opens the info panel.

Spells with `showInCombat: true` appear in the combat attack block under "Actions" or "Bonus Actions" depending on `combatActionType`. The same tap/hold rules apply there. The spell level is shown as a gold circle badge (level 1–9); cantrips (level 0) show no badge. **Do not duplicate a spell in `state.attacks[]` — set `showInCombat: true` on the spell object instead.**

```json
"spells": [
  {
    "name": "Fireball", "level": 3, "school": "Evocation",
    "castingTime": "1 action", "range": "150 ft",
    "components": "V, S, M (a tiny ball of bat guano and sulfur)",
    "duration": "Instantaneous", "saveAbility": "DEX",
    "concentration": false, "ritual": false,
    "attackRoll": false,
    "rolls": [{"dice": "8d6", "type": "fire", "mod": ""}],
    "description": "A bright streak flashes from your pointing finger...",
    "showInCombat": true, "combatActionType": "action", "showInFeatures": false
  },
  {
    "name": "Guiding Bolt", "level": 1, "school": "Evocation",
    "castingTime": "1 action", "range": "120 feet",
    "components": "V, S", "duration": "1 round",
    "saveAbility": "", "concentration": false, "ritual": false,
    "attackRoll": true,
    "rolls": [{"dice": "4d6", "type": "radiant", "mod": ""}],
    "description": "A flash of light streaks toward a creature...",
    "showInCombat": true, "combatActionType": "action", "showInFeatures": false
  },
  {
    "name": "Guidance", "level": 0, "school": "Divination",
    "castingTime": "1 action", "range": "Touch",
    "components": "V, S", "duration": "Concentration, 1 minute",
    "saveAbility": "", "concentration": true, "ritual": false,
    "attackRoll": false,
    "rolls": [{"dice": "1d4", "type": "not_damage", "mod": ""}],
    "description": "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice.",
    "showInCombat": false, "combatActionType": "action", "showInFeatures": false
  },
  {
    "name": "Healing Word", "level": 1, "school": "Evocation",
    "castingTime": "1 bonus action", "range": "60 ft",
    "components": "V", "duration": "Instantaneous",
    "saveAbility": "", "concentration": false, "ritual": false,
    "attackRoll": false,
    "rolls": [{"dice": "1d4", "type": "healing", "mod": "SPELL"}],
    "description": "A creature of your choice regains HP equal to 1d4 + your spellcasting modifier.",
    "showInCombat": true, "combatActionType": "bonus", "showInFeatures": false
  }
]
```

#### `attacks`
Array of attack objects. Can be empty (`[]`).

Each object:

| Key | Type | Description |
|---|---|---|
| `name` | string | Weapon or ability name (required) |
| `abilityMod` | string | Which ability drives the to-hit roll: `""` (no roll), `"manual"` (use `bonus` string), `"STR"`/`"DEX"`/`"CON"`/`"INT"`/`"WIS"`/`"CHA"`, or `"SPELL"` (spell attack bonus) |
| `proficient` | boolean | Add proficiency bonus to the computed attack roll (only when `abilityMod` is an ability key or `"SPELL"`) |
| `flatBonus` | integer | Additional flat modifier added to the computed roll (default `0`) |
| `bonus` | string | Manual attack roll modifier string, e.g. `"+7"` — only used when `abilityMod: "manual"` |
| `rolls` | array | Roll objects `[{dice, type, label?, mod?}]` — same structure as `spells.rolls` |
| `actionType` | string | `"action"` (default) or `"bonus"` — which combat sub-section to show in |
| `hidden` | boolean | `true` to hide the row from normal view; visible only in manage mode (default `false`) |
| `saveAbility` | string | Ability key for a saving throw option: `"STR"`, `"DEX"`, `"CON"`, `"INT"`, `"WIS"`, `"CHA"`, or `""` for none |
| `saveDC` | integer | Save DC value (e.g. `15`); `0` or omitted means no save DC displayed |
| `description` | string | Free text shown in the attack view panel — weapon masteries, special effects, etc. (optional) |

All fields except `name` are optional and default gracefully when absent.

```json
"attacks": [
  { "name": "Longsword", "abilityMod": "STR", "proficient": true, "flatBonus": 0,
    "rolls": [{"dice": "1d8", "type": "slashing", "mod": "STR"}], "actionType": "action" },
  { "name": "Hand Crossbow", "abilityMod": "DEX", "proficient": true, "flatBonus": 0,
    "rolls": [{"dice": "1d6", "type": "piercing", "mod": "DEX"}], "actionType": "action" },
  { "name": "Shove", "abilityMod": "", "bonus": "—",
    "rolls": [], "actionType": "action",
    "saveAbility": "STR", "saveDC": 14, "description": "Contested Strength (Athletics) check." },
  { "name": "Eldritch Blast", "abilityMod": "SPELL", "proficient": true, "flatBonus": 0,
    "rolls": [{"dice": "1d10", "type": "force", "mod": "CHA"}], "actionType": "action" }
]
```

#### `classFeatures`
Array of limited-use class feature objects. Can be empty (`[]`).

Each object:

| Key | Type | Description |
|---|---|---|
| `name` | string | Display name, e.g. `"Channel Divinity"` (required) |
| `max` | integer | Total uses / pool size (`0`–`999`) (required) |
| `used` | integer | Amount already expended; must be `≤ max` (required) |
| `recharge` | string | When it recharges, e.g. `"Short Rest"`, `"Long Rest"`, or `""` |
| `step` | integer | Points per dot and per +/− tap (default `1`); set to e.g. `5` for Lay on Hands |
| `description` | string | Full description shown in the feature view panel (optional) |
| `attackRoll` | boolean | `true` if the feature has an attack roll (e.g. Divine Smite) — shows a tappable d20 roll card |
| `attackMod` | string | Ability key for the attack roll: `"STR"`/`"DEX"`/`"CON"`/`"INT"`/`"WIS"`/`"CHA"`/`"SPELL"` or `""` |
| `attackProficient` | boolean | Add proficiency bonus to the feature's attack roll |
| `rolls` | array | Roll objects `[{dice, type, label?, mod?}]` — same structure as `spells.rolls` |
| `saveAbility` | string | Ability key for a saving throw: `"STR"`, `"DEX"`, `"CON"`, `"INT"`, `"WIS"`, `"CHA"`, or `""` |
| `saveDC` | integer | Override DC; if `0` or omitted, the sheet's current Spell Save DC is used |

**Tap/hold behaviour on feature rows:** tapping the feature name area runs rolls directly if `rolls` is non-empty (opens panel first if `attackRoll` is also `true`); otherwise opens the info panel. Holding (500 ms) always opens the info panel.

```json
"classFeatures": [
  { "name": "Channel Divinity", "max": 2, "used": 0, "recharge": "Short Rest", "step": 1,
    "attackRoll": false, "attackMod": "", "attackProficient": false, "rolls": [],
    "description": "Sacred Weapon: imbue a weapon with your holy symbol for 1 minute." },
  { "name": "Lay on Hands", "max": 40, "used": 0, "recharge": "Long Rest", "step": 5,
    "attackRoll": false, "attackMod": "", "attackProficient": false, "rolls": [],
    "description": "Restore HP by touching a creature (pool of 40 HP per Long Rest)." },
  { "name": "Divine Smite", "max": 0, "used": 0, "recharge": "", "step": 1,
    "attackRoll": true, "attackMod": "STR", "attackProficient": true,
    "rolls": [{"dice": "2d8", "type": "radiant", "mod": ""}],
    "description": "Expend a spell slot on a melee hit to deal radiant damage." }
]
```

With `step: 5` the sheet shows 8 dots (40 ÷ 5) and each +/− tap or dot click moves the counter by 5. Omitting `step` defaults to `1`. Features with `max: 0` display no tracking dots but still show a tappable name area.

Non-ability-using characters can omit this key or set it to `[]`.

#### `infoTraits`
Array of feature and trait objects displayed in the Info tab (Features & Traits section). Can be empty (`[]`).

Each object:

| Key | Type | Description |
|---|---|---|
| `name` | string | Feature or trait name (required) |
| `description` | string | Full description text; newlines are preserved (optional) |
| `damage` | string | Damage expression, e.g. `"2d6 fire"` — shown as a rollable card in the view panel (optional) |
| `rollDamage` | boolean | `true` to enable a tappable damage roll button in the view panel |
| `saveAbility` | string | Ability key for a saving throw: `"STR"`, `"DEX"`, `"CON"`, `"INT"`, `"WIS"`, `"CHA"`, or `""` |
| `saveDC` | integer | Override DC; if `0` or omitted, the sheet's current Spell Save DC is used |
| `showInCombat` | boolean | `true` to show this trait as a row in the combat attack block |
| `combatActionType` | string | `"action"` (default) or `"bonus"` — which sub-section of the combat block it appears in |

**Tap/hold behaviour on trait rows:** tapping rolls the damage expression directly if `rollDamage` is `true`; otherwise it opens the info panel (description + optional damage roll card + save DC display). Holding (500 ms) always opens the info panel. An **Edit** button in the top-right of the info panel switches to edit mode within the same modal. The same rules apply when a trait appears in the combat attack block via `showInCombat`.

```json
"infoTraits": [
  { "name": "Darkvision",   "description": "See in darkness as dim light, dim light as bright light within 60 ft." },
  { "name": "Fey Ancestry", "description": "Advantage on saves against being charmed; magic cannot put you to sleep." },
  { "name": "Breath Weapon", "description": "Exhale destructive energy (5 ft × 30 ft line).",
    "damage": "2d6 fire", "rollDamage": true, "saveAbility": "DEX", "saveDC": 0,
    "showInCombat": true, "combatActionType": "action" }
]
```

#### `hitDiceUsed`
Integer. Number of hit dice already expended. Max is equal to the character's level (read from `form.charLevel`).

```json
"hitDiceUsed": 2
```

Omitting this key defaults to `0` (all hit dice available). A Long Rest resets this to `0`.

#### `portrait`
String or `null`. A base64-encoded data URL for the character portrait image (e.g. `"data:image/png;base64,..."`). Omitting this key or setting it to `null` leaves the portrait empty.

```json
"portrait": null
```

The user sets this by tapping the portrait box or the Upload Image button at the top of the Info tab. The image is stored inline in the save file; large images will increase file size. Supported formats are whatever the browser accepts for `<img>` elements (JPEG, PNG, WebP, GIF, etc.).

#### `conditions`
Array of active condition name strings.

```json
"conditions": ["Poisoned", "Prone"]
```

Valid conditions:

```
Blinded, Charmed, Deafened, Exhausted, Frightened, Grappled,
Incapacitated, Invisible, Paralyzed, Petrified, Poisoned,
Prone, Restrained, Stunned, Unconscious
```

Unknown condition names are ignored (the chip will not appear).

---

## Minimal valid file

A file that loads without errors and leaves everything at defaults:

```json
{
  "form": {},
  "state": {}
}
```

Missing `form` keys leave the corresponding input at its HTML default. Missing `state` keys leave the runtime state at its initialised default.

---

## Complete annotated example

The example uses a level-5 Paladin (Oath of Devotion) to demonstrate `classFeatures`.

```json
{
  "form": {
    "charName":       "Ser Aldric Stoneheart",
    "charClass":      "Paladin",
    "charSubclass":   "Oath of Devotion",
    "charRace":       "Human",
    "charLevel":      "5",
    "charBackground": "Noble",
    "charAlignment":  "Lawful Good",
    "charXP":         "6500",
    "personality":    "I face problems head-on. A simple, direct solution is best.",
    "ideals":         "Responsibility. I do what I must and accept the consequences.",
    "bonds":          "I will face any challenge to protect those in my charge.",
    "flaws":          "I hide a truly scandalous secret that could ruin my family.",
    "hpMax":          "47",
    "hpTemp":         "0",
    "statAC":         "18",
    "statSpeed":      "30",
    "statHitDice":    "5d10",
    "spellAbility":   "CHA",
    "spellsList":     "1st: Bless, Cure Wounds, Shield of Faith\n2nd: Aid, Lesser Restoration",
    "equipment":      "- Longsword (1d8 slashing)\n- Shield\n- Plate Armor\n- Holy Symbol\n- Explorer's Pack",
    "proficiencies":  "All armor, shields, simple and martial weapons",
    "languages":      "Common, Celestial",
    "notes":          "",
    "cp": "0", "sp": "0", "ep": "0", "gp": "150", "pp": "2"
  },
  "state": {
    "abilities": { "STR": 18, "DEX": 10, "CON": 16, "INT": 8, "WIS": 12, "CHA": 16 },
    "saveProficiencies": ["WIS", "CHA"],
    "skillProficiencies": ["Athletics", "Insight", "Persuasion", "Religion"],
    "skillExpertise": [],
    "inspiration": false,
    "hpCurrent": 47,
    "spellSlots": [
      { "level": "1st", "max": 4, "used": 1 },
      { "level": "2nd", "max": 2, "used": 0 },
      { "level": "3rd", "max": 0, "used": 0 },
      { "level": "4th", "max": 0, "used": 0 },
      { "level": "5th", "max": 0, "used": 0 },
      { "level": "6th", "max": 0, "used": 0 },
      { "level": "7th", "max": 0, "used": 0 },
      { "level": "8th", "max": 0, "used": 0 },
      { "level": "9th", "max": 0, "used": 0 }
    ],
    "spells": [
      {
        "name": "Bless", "level": 1, "school": "Enchantment",
        "castingTime": "1 action", "range": "30 ft",
        "components": "V, S, M (a sprinkling of holy water)",
        "duration": "1 minute", "saveAbility": "",
        "concentration": true, "ritual": false,
        "attackRoll": false, "damage": "",
        "description": "Up to three creatures of your choice within range add 1d4 to attack rolls and saving throws.",
        "showInCombat": true, "combatActionType": "action"
      },
      {
        "name": "Cure Wounds", "level": 1, "school": "Evocation",
        "castingTime": "1 action", "range": "Touch",
        "components": "V, S", "duration": "Instantaneous",
        "saveAbility": "", "concentration": false, "ritual": false,
        "attackRoll": false, "damage": "1d8+3",
        "description": "A creature you touch regains 1d8 + spellcasting modifier HP.",
        "showInCombat": false, "combatActionType": "action"
      }
    ],
    "attacks": [
      { "name": "Longsword",    "bonus": "+6", "damage": "1d8+4", "actionType": "action",
        "description": "Versatile (1d10 two-handed). Dueling fighting style adds +2 to damage." },
      { "name": "Divine Smite", "bonus": "—",  "damage": "2d8",   "actionType": "action",
        "description": "Extra 2d8 radiant damage on hit; expend a spell slot to upcast." }
    ],
    "conditions": [],
    "hitDiceUsed": 0,
    "classFeatures": [
      { "name": "Channel Divinity", "max": 1,  "used": 0, "recharge": "Short Rest", "step": 1 },
      { "name": "Lay on Hands",     "max": 25, "used": 0, "recharge": "Long Rest",  "step": 5 }
    ],
    "infoTraits": [
      { "name": "Divine Smite",      "description": "When you hit with a melee weapon, expend a spell slot to deal +2d8 radiant damage per slot level (max 5d8). +1d8 vs undead or fiends." },
      { "name": "Aura of Protection","description": "While conscious, you and friendly creatures within 10 ft add your CHA modifier (min +1) to saving throws." },
      { "name": "Sacred Weapon",     "description": "As an action, imbue a weapon with your holy symbol for 1 minute. It becomes magical, adds CHA modifier to attack rolls, and sheds light." }
    ]
  }
}
```

---

## Common mistakes

| Mistake | Effect | Fix |
|---|---|---|
| `"charLevel": 7` (number) | Field shows empty or `"[object Object]"` | Use `"charLevel": "7"` (string) |
| Skill in `skillExpertise` but not in `skillProficiencies` | Modifier is correct but dot display may be inconsistent | Add the skill to both arrays |
| `spellSlots` with fewer than 9 entries | Missing levels default to `{max:0, used:0}` — harmless but may shift level labels | Always supply all 9 |
| `used > max` on a spell slot | Dots render correctly (capped to max) but the value is misleading | Keep `used ≤ max` |
| Misspelled skill or condition name | Entry is silently ignored | Use exact names from the lists above |
| `attacks[].actionType` set to `"Action"` (capital A) | Attack appears under "Actions" only if the check is case-insensitive, but may silently fall through | Use lowercase `"action"` or `"bonus"` |
| Spell in `state.spells` with `showInCombat: true` but no `spellAbility` set in `form` | Spell attack bonus shows as `+0`; roll still works | Set `form.spellAbility` to the correct ability key |
| Spell duplicated in both `state.spells` and `state.attacks[]` | The spell appears twice in the combat block | Remove the `attacks[]` entry; set `showInCombat: true` on the spell object instead |
| `attacks[].saveDC` as a string (`"15"`) | DC displays correctly but numeric comparison may fail in future | Use an integer: `15` not `"15"` |
| `form.features` present in file | Field is silently ignored (the textarea no longer exists); data is lost | Move features to `state.infoTraits` as `{ name, description }` objects |
