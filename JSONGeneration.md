# JSONGeneration — Compatible JSON File Format

This document describes the exact structure of JSON files that can be loaded into `dnd-character-sheet.html` via the **Load** button, and that are produced by the **Save** button.

---

## AI Prompt Schema (compact)

`generateCharImportPrompt()` (dnd-character-sheet.html) and `generateAICreatePrompt()`
(character-creator.html) fetch this file and embed only the text between the
`AI_SCHEMA_START`/`AI_SCHEMA_END` markers below into the AI prompt — not the whole
document — so the prompt stays short. If this file cannot be fetched (e.g. opened via
`file://`), the `_BUILTIN_CHAR_SCHEMA` / `_BUILTIN_AI_SCHEMA` constants in those files are
used instead.

**`_BUILTIN_CHAR_SCHEMA` (dnd-character-sheet.html) and `_BUILTIN_AI_SCHEMA`
(character-creator.html) are byte-identical to the fenced ` ```text ` block below**
(everything between `AI_SCHEMA_START` and the closing ` ``` `, excluding the RULES
list). Whenever the `state` shape changes, update the fenced block here first, then
copy it verbatim into both `_BUILTIN_*` constants — see the detailed field reference
further down for the full description of each field.

<!-- AI_SCHEMA_START -->
```text
COMPLETE CHARACTER JSON FORMAT: { "form": {...}, "state": {...} }

FORM — all values must be strings, even numbers ("18" not 18):
  charName: character name
  charClass: Barbarian|Bard|Cleric|Druid|Fighter|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard|Artificer|""
  charSubclass: subclass name
  charRace: race or species
  charLevel: "1"–"20"
  charBackground: background name
  charAlignment: e.g. "Lawful Good", "Chaotic Neutral"
  charXP: total XP as string ("6500")
  personality, ideals, bonds, flaws: free text strings
  hpMax: max HP ("47")
  hpTemp: temp HP ("0")
  statAC: Armor Class ("18")
  statSpeed: speed in feet ("30")
  statHitDice: hit dice ("5d10")
  spellAbility: "INT"|"WIS"|"CHA"|"" (blank for non-casters)
  languages: comma-separated ("Common, Elvish")
  notes: free text
  cp, sp, ep, gp, pp: currency as strings ("0")

STATE:
abilities (integers 1–30):
  { "STR": 18, "DEX": 10, "CON": 16, "INT": 8, "WIS": 12, "CHA": 16 }

saveProficiencies: array of ability keys with saving throw proficiency ["STR","CON"]

skillProficiencies: array of skill names —
  Acrobatics, Animal Handling, Arcana, Athletics, Deception, History,
  Insight, Intimidation, Investigation, Medicine, Nature, Perception,
  Performance, Persuasion, Religion, Sleight of Hand, Stealth, Survival

skillExpertise: subset of skillProficiencies with double proficiency bonus

equipProficiencies: ["Light Armor","Medium Armor","Heavy Armor","Shields","Simple Weapons","Martial Weapons","Thieves' Tools", ...]
customEquipProfRows: []
inspiration: false
hpCurrent: integer (current HP)

spellSlots — exactly 9 objects, one per level:
[{"level":"1st","max":3,"used":0},{"level":"2nd","max":2,"used":0},{"level":"3rd","max":0,"used":0},
 {"level":"4th","max":0,"used":0},{"level":"5th","max":0,"used":0},{"level":"6th","max":0,"used":0},
 {"level":"7th","max":0,"used":0},{"level":"8th","max":0,"used":0},{"level":"9th","max":0,"used":0}]

entries array — UNIFIED array covering ALL spells, class features, and passive traits.
Every object below uses the SAME schema; set irrelevant fields to their defaults
(empty string / 0 / false). A single entry can have MULTIPLE showIn* flags set true
at once (e.g. a class feature that is both dot-tracked AND shown in Combat).

Field reference (applies to EVERY entry, spell or not):
  name: display name (required)
  description: full text, newlines preserved
  showInSpells: true → appears in Spells tab Known/Prepared lists
  showInFeatures: true → appears in Features tab with a dot-tracker
  showInTraits: true → appears in Info tab "Features & Traits" section
  showInCombat: true → appears as a row in the Turn block on Combat tab
  combatActionType: "action"|"bonus"|"reaction"|"other" (default "action")
  level: 0 (cantrip) – 9 for spells; 0 for non-spells
  school: Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation; "" for non-spells
  castingTime, range, components, duration: spell strings (e.g. "1 action","150 ft","V, S, M (bat guano)","Instantaneous"); "" for non-spells
  concentration, ritual: booleans; false for non-spells
  prepared: true if prepared today (counts toward maxSpellsPrepared); mutually exclusive with alwaysPrepared; false for non-spells
  alwaysPrepared: true if always prepared (e.g. domain spells, does NOT count toward maxSpellsPrepared); mutually exclusive with prepared; false for non-spells
  attackRoll: true if this entry has a tappable attack roll (d20 + bonus)
  attackMod: "STR"|"DEX"|"CON"|"INT"|"WIS"|"CHA"|"SPELL"|"manual"|"" — ability used for the attack roll
  attackBonus: manual attack bonus string (e.g. "+7"); only used when attackMod="manual"
  attackProficient: true to add proficiency bonus to the computed attack roll; ignored when attackMod="manual"
  rolls: array of roll objects [{dice, type, label?, mod?}], or [] if no roll
    rolls[].dice: dice expression, e.g. "8d6"
    rolls[].type: slashing|piercing|bludgeoning|fire|cold|lightning|thunder|acid|poison|necrotic|radiant|force|psychic|healing|not_damage|other
    rolls[].label: custom label string, only used when type="other"
    rolls[].mod: ""(none) | STR|DEX|CON|INT|WIS|CHA | "SPELLMOD" (spellcasting ability modifier only) | "SPELL" (full spell attack bonus = ability mod + proficiency)
      CRITICAL: use "SPELLMOD" when the spell or feature text says "add your spellcasting ability modifier"
      (e.g. Healing Word "1d4 + your spellcasting ability modifier" → "mod":"SPELLMOD")
      Only use "SPELL" if the roll explicitly adds the full spell attack bonus (rare)
  saveAbility: "STR"|"DEX"|"CON"|"INT"|"WIS"|"CHA"|"" — ability for a saving throw, or "" for none
  saveDC: integer override for save DC; 0 means use the character's current Spell Save DC
  max: total uses / pool size for dot-tracked entries (relevant when showInFeatures=true); 0 = no tracker shown
  used: uses already expended; must be ≤ max
  step: how many uses one dot represents (default 1; e.g. 5 for a resource like Lay on Hands)
  recharge: "Short Rest"|"Long Rest"|"Dawn"|... or "" — when the entry recharges
  damage: legacy damage expression (e.g. "2d6 fire"); prefer rolls for new entries
  rollDamage: true to make the row roll the damage expression directly on tap

IMPORTANT: passive features and racial traits (anything that should appear in the Info
tab's "Features & Traits" section, e.g. Darkvision, Fey Ancestry) MUST set
"showInTraits":true. An entry can combine showInTraits:true with showInFeatures:true
and/or showInCombat:true if it is also tracked or used in combat.

Example — prepared spell, shown in Spells tab and used in combat:
{ "name":"Fireball","level":3,"school":"Evocation","castingTime":"1 action","range":"150 ft",
  "components":"V, S, M (bat guano)","duration":"Instantaneous",
  "concentration":false,"ritual":false,"prepared":true,"alwaysPrepared":false,
  "attackRoll":false,"attackMod":"","attackBonus":"—","attackProficient":false,
  "rolls":[{"dice":"8d6","type":"fire","mod":""}],
  "description":"8d6 fire in 20-ft radius, DEX save for half.",
  "saveAbility":"DEX","saveDC":0,
  "max":0,"used":0,"step":1,"recharge":"","damage":"","rollDamage":false,
  "showInSpells":true,"showInFeatures":false,"showInTraits":false,
  "showInCombat":true,"combatActionType":"action" }

Example — limited-use class feature (Channel Divinity), dot-tracked in Features tab:
{ "name":"Channel Divinity","level":0,"school":"","castingTime":"","range":"","components":"","duration":"",
  "concentration":false,"ritual":false,"prepared":false,"alwaysPrepared":false,
  "attackRoll":false,"attackMod":"","attackBonus":"—","attackProficient":false,
  "rolls":[],"description":"Sacred Weapon: imbue a weapon with holy power for 1 minute.",
  "saveAbility":"","saveDC":0,
  "max":1,"used":0,"step":1,"recharge":"Short Rest","damage":"","rollDamage":false,
  "showInSpells":false,"showInFeatures":true,"showInTraits":false,
  "showInCombat":false,"combatActionType":"action" }

Example — passive racial trait (Darkvision), shown ONLY in Info tab Features & Traits:
{ "name":"Darkvision","level":0,"school":"","castingTime":"","range":"","components":"","duration":"",
  "concentration":false,"ritual":false,"prepared":false,"alwaysPrepared":false,
  "attackRoll":false,"attackMod":"","attackBonus":"—","attackProficient":false,
  "rolls":[],"description":"You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.",
  "saveAbility":"","saveDC":0,
  "max":0,"used":0,"step":1,"recharge":"","damage":"","rollDamage":false,
  "showInSpells":false,"showInFeatures":false,"showInTraits":true,
  "showInCombat":false,"combatActionType":"action" }

attacks array — each weapon/attack object:
{ "name":"Longsword","abilityMod":"STR","proficient":true,"flatBonus":0,
  "rolls":[{"dice":"1d8","type":"slashing","mod":"STR"}],
  "actionType":"action","saveAbility":"","saveDC":0,"description":"" }
abilityMod values: STR|DEX|CON|INT|WIS|CHA|SPELL|manual|""
Use "manual" with "bonus":"+7" for fixed modifiers. Use "" for no attack roll.

equipmentItems array:
{ "name":"Longsword","quantity":1,"weight":"3 lb","cost":"15 gp","category":"Weapon","description":"Versatile (1d10). Slashing." }

conditions: [] (from: Blinded|Charmed|Deafened|Exhausted|Frightened|Grappled|
  Incapacitated|Invisible|Paralyzed|Petrified|Poisoned|Prone|Restrained|Stunned|Unconscious)
hitDiceUsed: 0
statMods: {"ac":0,"speed":0,"initiative":0,"spellatk":0,"spelldc":0}
damageResistances: {} (e.g. {"fire":1,"necrotic":-1} — 1=resistant, -1=vulnerable)
maxSpellsPrepared: 0 (daily prep limit for Wizard/Cleric etc.; 0=unlimited)
diceRoller: null
portrait: null
```

RULES (apply both when extracting from a sheet/photo and when generating a new character):
- Output ONLY raw JSON — no markdown code fences, no explanation, no trailing text.
- All form.* values must be strings, even numbers ("18" not 18).
- state.abilities values are integers.
- If something in the source material is not standard D&D 5e terminology, make a
  reasonable assumption about its intended meaning and add it as an entries item
  (set showInFeatures and/or showInTraits true as appropriate) instead of dropping it.
- Every entries item, attack, and equipment item must have a non-empty description —
  write a concise best-guess description based on its name and your D&D 5e knowledge
  if one is not otherwise available.
<!-- AI_SCHEMA_END -->

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

  "entries": [
    {
      "name": "Fire Bolt",
      "description": "You hurl a mote of fire at a creature or object within range.",
      "showInSpells": true,
      "showInFeatures": false,
      "showInTraits": false,
      "showInCombat": true,
      "combatActionType": "action",
      "level": 0,
      "school": "Evocation",
      "castingTime": "1 action",
      "range": "120 ft",
      "components": "V, S",
      "duration": "Instantaneous",
      "concentration": false,
      "ritual": false,
      "prepared": false,
      "alwaysPrepared": false,
      "attackRoll": true,
      "attackMod": "",
      "attackBonus": "—",
      "attackProficient": false,
      "rolls": [{"dice": "2d10", "type": "fire", "mod": ""}],
      "saveAbility": "",
      "saveDC": 0,
      "max": 0,
      "used": 0,
      "step": 1,
      "recharge": "",
      "damage": "",
      "rollDamage": false
    },
    {
      "name": "Lay on Hands",
      "description": "Touch a creature to restore HP from a pool of 25 HP per Long Rest. Can spend 5 HP to cure a disease or neutralize a poison.",
      "showInSpells": false,
      "showInFeatures": true,
      "showInTraits": false,
      "showInCombat": false,
      "combatActionType": "action",
      "level": 0,
      "school": "",
      "castingTime": "",
      "range": "",
      "components": "",
      "duration": "",
      "concentration": false,
      "ritual": false,
      "prepared": false,
      "alwaysPrepared": false,
      "attackRoll": false,
      "attackMod": "",
      "attackBonus": "—",
      "attackProficient": false,
      "rolls": [],
      "saveAbility": "",
      "saveDC": 0,
      "max": 25,
      "used": 5,
      "step": 5,
      "recharge": "Long Rest",
      "damage": "",
      "rollDamage": false
    },
    {
      "name": "Sneak Attack",
      "description": "Once per turn, deal extra 4d6 damage when you have advantage or an ally is adjacent to the target.",
      "showInSpells": false,
      "showInFeatures": false,
      "showInTraits": true,
      "showInCombat": false,
      "combatActionType": "action",
      "level": 0,
      "school": "",
      "castingTime": "",
      "range": "",
      "components": "",
      "duration": "",
      "concentration": false,
      "ritual": false,
      "prepared": false,
      "alwaysPrepared": false,
      "attackRoll": false,
      "attackMod": "",
      "attackBonus": "—",
      "attackProficient": false,
      "rolls": [],
      "saveAbility": "",
      "saveDC": 0,
      "max": 0,
      "used": 0,
      "step": 1,
      "recharge": "",
      "damage": "",
      "rollDamage": false
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

  "statMods": { "ac": 0, "speed": 0, "initiative": 0, "spellatk": 0, "spelldc": 0 },

  "damageResistances": { "fire": 1, "poison": -1 },

  "diceRoller": null,

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

#### `equipProficiencies`
Array of equipment/tool category name strings the character is proficient with. Each entry corresponds to a row in the Inventory tab's collapsible "All Proficiencies" section. Tap the dot next to an item to toggle it; proficient items are also shown in the always-visible "Your Proficiencies" section below.

```json
"equipProficiencies": ["Light Armor", "Simple Weapons", "Thieves' Tools"]
```

Predefined item names (use exact spelling):

**Armor:** `Light Armor`, `Medium Armor`, `Heavy Armor`, `Shields`

**Weapons:** `Simple Weapons`, `Martial Weapons`, `Simple Melee Weapons`, `Simple Ranged Weapons`, `Martial Melee Weapons`, `Martial Ranged Weapons`

**Artisan Tools:** `Alchemist's Supplies`, `Brewer's Supplies`, `Calligrapher's Supplies`, `Carpenter's Tools`, `Cartographer's Tools`, `Cobbler's Tools`, `Cook's Utensils`, `Glassblower's Tools`, `Jeweler's Tools`, `Leatherworker's Tools`, `Mason's Tools`, `Painter's Supplies`, `Potter's Tools`, `Smith's Tools`, `Tinker's Tools`, `Weaver's Tools`, `Woodcarver's Tools`

**Other Tools & Kits:** `Thieves' Tools`, `Disguise Kit`, `Forgery Kit`, `Herbalism Kit`, `Navigator's Tools`, `Poisoner's Kit`, `Healer's Kit`

**Musical Instruments:** `Bagpipes`, `Drum`, `Dulcimer`, `Flute`, `Lute`, `Lyre`, `Horn`, `Pan Flute`, `Shawm`, `Viol`

**Gaming Sets:** `Dice Set`, `Dragonchess Set`, `Playing Card Set`, `Three-Dragon Ante Set`

**Vehicles:** `Land Vehicles`, `Water Vehicles`

Names from `customEquipProfRows` can also appear here.

#### `customEquipProfRows`
Array of custom item name strings the user has added to the proficiency list (rows not found in the predefined `EQUIP_PROF_GROUPS`). These appear under a "Custom" group header at the bottom of the list and include a × delete button.

```json
"customEquipProfRows": ["Firearms", "Net"]
```

Any name in this array that also appears in `equipProficiencies` will render its dot as filled (proficient).

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

#### `entries`
Array of unified entry objects covering all spells, class features, and info traits on the sheet. Can be empty (`[]`). Each entry carries `showIn*` boolean flags that determine which sections of the UI display it. Old-format payloads with separate `spells`, `classFeatures`, and `infoTraits` arrays are automatically migrated to `entries` on load, so existing saves continue to work.

All fields below exist on every entry object; set irrelevant ones to their defaults.

| Key | Type | Description |
|---|---|---|
| `name` | string | Display name (required) |
| `description` | string | Full description text; newlines are preserved |
| `showInSpells` | boolean | `true` → appears in the Spells tab Known/Prepared lists |
| `showInFeatures` | boolean | `true` → appears in the Features tab with a dot tracker |
| `showInTraits` | boolean | `true` → appears in the Features & Traits section on the Info tab |
| `showInCombat` | boolean | `true` → appears as a row in the Turn block on the Combat tab |
| `combatActionType` | string | `"action"` (default), `"bonus"`, `"reaction"`, or `"other"` — which Turn sub-section the entry appears in when `showInCombat` is `true` |
| `level` | integer | Spell level: `0` = Cantrip; `1`–`9` = spell level; `0` for non-spells |
| `school` | string | Magic school (e.g. `"Evocation"`); empty for non-spells |
| `castingTime` | string | e.g. `"1 action"`, `"1 bonus action"`; empty for non-spells |
| `range` | string | e.g. `"120 ft"`, `"Touch"`; empty for non-spells |
| `components` | string | e.g. `"V, S, M (a pinch of sulfur)"`; empty for non-spells |
| `duration` | string | e.g. `"Instantaneous"`, `"1 hour"`; empty for non-spells |
| `concentration` | boolean | `true` if the spell requires concentration; `false` for non-spells |
| `ritual` | boolean | `true` if the spell can be cast as a ritual; `false` for non-spells |
| `prepared` | boolean | `true` if the spell is prepared for the day (counts toward `maxSpellsPrepared`); mutually exclusive with `alwaysPrepared`; `false` for non-spells |
| `alwaysPrepared` | boolean | `true` if always prepared (e.g. domain spells); does **not** count toward `maxSpellsPrepared`; mutually exclusive with `prepared`; `false` for non-spells |
| `attackRoll` | boolean | `true` if the entry uses a spell/feature attack roll (shows a tappable d20 card in view panel) |
| `attackMod` | string | Ability key for the attack roll: `"STR"`/`"DEX"`/`"CON"`/`"INT"`/`"WIS"`/`"CHA"`/`"SPELL"`/`"manual"` or `""` |
| `attackBonus` | string | Manual attack modifier string (e.g. `"+7"`); only used when `attackMod` is `"manual"` |
| `attackProficient` | boolean | Add proficiency bonus to the computed attack roll; ignored when `attackMod` is `"manual"` |
| `rolls` | array | Roll objects `[{dice, type, label?, mod?}]`. `dice` = expression (`"4d6"`); `type` = damage type key or `"not_damage"` or `"other"`; `label` = custom label when `type="other"`; `mod` = ability key, `"SPELLMOD"` (spellcasting ability modifier only), `"SPELL"` (full spell attack bonus), or `""`. **Use `"SPELLMOD"` when text says "add your spellcasting ability modifier"**; use `"SPELL"` only for rolls that add the full spell attack bonus. |
| `saveAbility` | string | Ability for the saving throw: `"STR"`, `"DEX"`, `"CON"`, `"INT"`, `"WIS"`, `"CHA"`, or `""` for none |
| `saveDC` | integer | Override save DC; `0` or omitted means use the character's current Spell Save DC |
| `max` | integer | Total uses / pool size for dot-tracked entries (`showInFeatures: true`); `0` for entries with no tracking |
| `used` | integer | Uses already expended; must be `≤ max`; reset to `0` on Long Rest for tracked entries |
| `step` | integer | How many uses one dot represents (default `1`); set to e.g. `5` for a resource like Lay on Hands |
| `recharge` | string | When the entry recharges, e.g. `"Short Rest"`, `"Long Rest"`, or `""` |
| `damage` | string | Legacy damage expression field (e.g. `"2d6 fire"`); prefer `rolls` for new entries |
| `rollDamage` | boolean | `true` to make the trait row roll the `damage` expression directly on tap |

**Tap/hold behaviour:** tapping a spell entry row rolls d20 + spell attack bonus if `attackRoll` is `true` (secondary shows rolls); rolls all `rolls` dice if only `rolls` is set; opens the info panel otherwise. Holding (500 ms) always opens the info/view panel.

Entries in the Features tab (`showInFeatures: true`) share the same two-column dot-tracker layout regardless of whether they are spells, features, or traits. `max`, `used`, `step`, and `recharge` control the tracker. Entries with `max: 0` display no tracking dots but still show a tappable name area.

**Do not duplicate a spell or feature in `state.attacks[]`** — set `showInCombat: true` on the entry instead.

```json
"entries": [
  {
    "name": "Fireball",
    "description": "A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.",
    "showInSpells": true,
    "showInFeatures": false,
    "showInTraits": false,
    "showInCombat": true,
    "combatActionType": "action",
    "level": 3,
    "school": "Evocation",
    "castingTime": "1 action",
    "range": "150 ft",
    "components": "V, S, M (a tiny ball of bat guano and sulfur)",
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "prepared": true,
    "alwaysPrepared": false,
    "attackRoll": false,
    "attackMod": "",
    "attackBonus": "—",
    "attackProficient": false,
    "rolls": [{"dice": "8d6", "type": "fire", "mod": ""}],
    "saveAbility": "DEX",
    "saveDC": 0,
    "max": 0,
    "used": 0,
    "step": 1,
    "recharge": "",
    "damage": "",
    "rollDamage": false
  },
  {
    "name": "Channel Divinity",
    "description": "Expend to use Sacred Weapon (imbue a weapon with holy power) or Turn the Unholy (turn undead and fiends).",
    "showInSpells": false,
    "showInFeatures": true,
    "showInTraits": false,
    "showInCombat": false,
    "combatActionType": "action",
    "level": 0,
    "school": "",
    "castingTime": "",
    "range": "",
    "components": "",
    "duration": "",
    "concentration": false,
    "ritual": false,
    "prepared": false,
    "alwaysPrepared": false,
    "attackRoll": false,
    "attackMod": "",
    "attackBonus": "—",
    "attackProficient": false,
    "rolls": [],
    "saveAbility": "",
    "saveDC": 0,
    "max": 1,
    "used": 0,
    "step": 1,
    "recharge": "Short Rest",
    "damage": "",
    "rollDamage": false
  },
  {
    "name": "Healing Word",
    "description": "A creature of your choice regains HP equal to 1d4 + your spellcasting modifier.",
    "showInSpells": true,
    "showInFeatures": true,
    "showInTraits": false,
    "showInCombat": true,
    "combatActionType": "bonus",
    "level": 1,
    "school": "Evocation",
    "castingTime": "1 bonus action",
    "range": "60 ft",
    "components": "V",
    "duration": "Instantaneous",
    "concentration": false,
    "ritual": false,
    "prepared": false,
    "alwaysPrepared": true,
    "attackRoll": false,
    "attackMod": "",
    "attackBonus": "—",
    "attackProficient": false,
    "rolls": [{"dice": "1d4", "type": "healing", "mod": "SPELLMOD"}],
    "saveAbility": "",
    "saveDC": 0,
    "max": 0,
    "used": 0,
    "step": 1,
    "recharge": "",
    "damage": "",
    "rollDamage": false
  },
  {
    "name": "Darkvision",
    "description": "You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.",
    "showInSpells": false,
    "showInFeatures": false,
    "showInTraits": true,
    "showInCombat": false,
    "combatActionType": "action",
    "level": 0,
    "school": "",
    "castingTime": "",
    "range": "",
    "components": "",
    "duration": "",
    "concentration": false,
    "ritual": false,
    "prepared": false,
    "alwaysPrepared": false,
    "attackRoll": false,
    "attackMod": "",
    "attackBonus": "—",
    "attackProficient": false,
    "rolls": [],
    "saveAbility": "",
    "saveDC": 0,
    "max": 0,
    "used": 0,
    "step": 1,
    "recharge": "",
    "damage": "",
    "rollDamage": false
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
| `actionType` | string | `"action"` (default), `"bonus"`, `"reaction"`, or `"other"` — which combat sub-section to show in |
| `hidden` | boolean | `true` to show the row faded in the combat list; toggled via "Hide from combat list" in the edit panel (default `false`) |
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

#### `hitDiceUsed`
Integer. Number of hit dice already expended. Max is equal to the character's level (read from `form.charLevel`).

```json
"hitDiceUsed": 2
```

Omitting this key defaults to `0` (all hit dice available). A Long Rest resets this to `0`.

#### `diceRoller`
Array or `null`. Defines the dice shown in the Dice tab's free-form roller. `null` means use the default set (d4, d6, d8, d10, d12, d20, d100 — each with count 1). Supply an array to persist custom counts or custom die types.

```json
"diceRoller": null
```

Each entry: `{ "sides": <integer>, "count": <integer> }`. Non-default `sides` values render with a remove button. Omitting this key is equivalent to `null`.

#### `portrait`
String or `null`. A base64-encoded data URL for the character portrait image (e.g. `"data:image/png;base64,..."`). Omitting this key or setting it to `null` leaves the portrait empty.

```json
"portrait": null
```

The user sets this by tapping the portrait box or the Upload Image button at the top of the Info tab. The image is stored inline in the save file; large images will increase file size. Supported formats are whatever the browser accepts for `<img>` elements (JPEG, PNG, WebP, GIF, etc.).

#### `statMods`
Object of custom numeric bonuses applied on top of each combat stat. All keys are optional and default to `0`. Omitting the entire object is safe — the app initialises it to all-zeros.

```json
"statMods": {
  "ac": 0,
  "speed": 0,
  "initiative": 0,
  "spellatk": 0,
  "spelldc": 0
}
```

| Key | Effect |
|---|---|
| `ac` | Displayed as a badge in the AC pill; does not change the raw `statAC` form input |
| `speed` | Displayed as a badge in the Speed pill; does not change the raw `statSpeed` form input |
| `initiative` | Added to `DEX modifier` before displaying `statInit` and before rolling initiative |
| `spellatk` | Added to `prof + spellcasting mod` before displaying `statSpellAtk` and before rolling Spell Attack |
| `spelldc` | Added to `8 + prof + spellcasting mod` before displaying `statSpellDC` |

Set via hold → Edit on any combat stat pill. Undoable via the Undo button.

#### `damageResistances`
Object mapping damage type keys to resistance state. Each entry is optional; omitting a key means normal damage for that type.

```json
"damageResistances": {
  "fire": 1,
  "necrotic": 2,
  "cold": -1,
  "slashing": 0
}
```

| Value | Meaning | Dot colour |
|---|---|---|
| `1` | Resistant — half damage | Green |
| `2` | Immune — zero damage | Black |
| `-1` | Vulnerable — double damage | Red |
| `0` or absent | Normal | Empty |

Valid damage type keys: `slashing`, `piercing`, `bludgeoning`, `fire`, `cold`, `lightning`, `thunder`, `acid`, `poison`, `necrotic`, `radiant`, `force`, `psychic`.

Cycled by tapping a dot in the Resistances, Immunities & Vulnerabilities section of the Combat tab (cycle: normal → resistant → immune → vulnerable → normal). Undoable.

#### `maxSpellsPrepared`
Integer. The daily preparation limit for spells marked with the P dot (`prepared: true`). `0` (default) means no limit is enforced. Always-prepared spells (`alwaysPrepared: true`) never count toward this limit.

```json
"maxSpellsPrepared": 5
```

Set via the editable number input in the Spells Known section header. Omitting this key defaults to `0` (unlimited).

#### `equipmentItems`
Array of equipment item objects displayed in the Inventory tab. Can be empty (`[]`). Each row is tappable (opens view panel) and hold-able (500 ms, opens same view panel). The view panel shows description and meta info; an Edit button switches to edit mode.

Each object:

| Key | Type | Description |
|---|---|---|
| `name` | string | Item name (required) |
| `quantity` | integer | How many the character carries (default `1`; not shown in row when `1`) |
| `weight` | string | Weight string (e.g. `"3 lb"`) — shown in the row and view panel (optional) |
| `cost` | string | Cost string (e.g. `"15 gp"`) — shown in the view panel only (optional) |
| `category` | string | Category label (e.g. `"Weapon"`, `"Armor"`, `"Adventuring Gear"`) — shown as a small badge in the row (optional) |
| `description` | string | Free text shown in the view panel; newlines are preserved (optional) |

```json
"equipmentItems": [
  { "name": "Longsword", "quantity": 1, "weight": "3 lb", "cost": "15 gp",
    "category": "Weapon", "description": "Versatile (1d10). Slashing damage." },
  { "name": "Chain Mail", "quantity": 1, "weight": "55 lb", "cost": "75 gp",
    "category": "Armor", "description": "AC 16. Disadvantage on Stealth." },
  { "name": "Explorer's Pack", "quantity": 1, "weight": "59 lb", "cost": "10 gp",
    "category": "Adventuring Gear", "description": "Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days of rations, waterskin, 50 ft of hempen rope." }
]
```

Items can be imported from the SRD (`/equipment` endpoint) via the **Items** tab in the Import modal, generated via AI prompt, or created manually via the "+ Create custom" button in the Import modal.

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

The example uses a level-5 Paladin (Oath of Devotion) to demonstrate the unified `state.entries[]` model.

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
    "equipment":      "- Longsword (1d8 slashing)\n- Shield\n- Plate Armor\n- Holy Symbol\n- Explorer's Pack",
    "languages":      "Common, Celestial",
    "notes":          "",
    "cp": "0", "sp": "0", "ep": "0", "gp": "150", "pp": "2"
  },
  "state": {
    "abilities": { "STR": 18, "DEX": 10, "CON": 16, "INT": 8, "WIS": 12, "CHA": 16 },
    "saveProficiencies": ["WIS", "CHA"],
    "skillProficiencies": ["Athletics", "Insight", "Persuasion", "Religion"],
    "skillExpertise": [],
    "equipProficiencies": ["Light Armor", "Medium Armor", "Heavy Armor", "Shields", "Simple Weapons", "Martial Weapons"],
    "customEquipProfRows": [],
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
    "maxSpellsPrepared": 6,
    "entries": [
      {
        "name": "Bless",
        "description": "Up to three creatures of your choice within range add 1d4 to attack rolls and saving throws.",
        "showInSpells": true,
        "showInFeatures": false,
        "showInTraits": false,
        "showInCombat": true,
        "combatActionType": "action",
        "level": 1,
        "school": "Enchantment",
        "castingTime": "1 action",
        "range": "30 ft",
        "components": "V, S, M (a sprinkling of holy water)",
        "duration": "1 minute",
        "concentration": true,
        "ritual": false,
        "prepared": true,
        "alwaysPrepared": false,
        "attackRoll": false,
        "attackMod": "",
        "attackBonus": "—",
        "attackProficient": false,
        "rolls": [],
        "saveAbility": "",
        "saveDC": 0,
        "max": 0,
        "used": 0,
        "step": 1,
        "recharge": "",
        "damage": "",
        "rollDamage": false
      },
      {
        "name": "Cure Wounds",
        "description": "A creature you touch regains 1d8 + spellcasting modifier HP.",
        "showInSpells": true,
        "showInFeatures": false,
        "showInTraits": false,
        "showInCombat": false,
        "combatActionType": "action",
        "level": 1,
        "school": "Evocation",
        "castingTime": "1 action",
        "range": "Touch",
        "components": "V, S",
        "duration": "Instantaneous",
        "concentration": false,
        "ritual": false,
        "prepared": false,
        "alwaysPrepared": true,
        "attackRoll": false,
        "attackMod": "",
        "attackBonus": "—",
        "attackProficient": false,
        "rolls": [{"dice": "1d8", "type": "healing", "mod": "SPELLMOD"}],
        "saveAbility": "",
        "saveDC": 0,
        "max": 0,
        "used": 0,
        "step": 1,
        "recharge": "",
        "damage": "",
        "rollDamage": false
      },
      {
        "name": "Channel Divinity",
        "description": "Expend to use Sacred Weapon (imbue a weapon with holy power) or Turn the Unholy (turn undead and fiends).",
        "showInSpells": false,
        "showInFeatures": true,
        "showInTraits": false,
        "showInCombat": false,
        "combatActionType": "action",
        "level": 0,
        "school": "",
        "castingTime": "",
        "range": "",
        "components": "",
        "duration": "",
        "concentration": false,
        "ritual": false,
        "prepared": false,
        "alwaysPrepared": false,
        "attackRoll": false,
        "attackMod": "",
        "attackBonus": "—",
        "attackProficient": false,
        "rolls": [],
        "saveAbility": "",
        "saveDC": 0,
        "max": 1,
        "used": 0,
        "step": 1,
        "recharge": "Short Rest",
        "damage": "",
        "rollDamage": false
      },
      {
        "name": "Lay on Hands",
        "description": "Touch a creature to restore HP from a pool of 25 HP. Can spend 5 HP to cure a disease or neutralize a poison.",
        "showInSpells": false,
        "showInFeatures": true,
        "showInTraits": false,
        "showInCombat": false,
        "combatActionType": "action",
        "level": 0,
        "school": "",
        "castingTime": "",
        "range": "",
        "components": "",
        "duration": "",
        "concentration": false,
        "ritual": false,
        "prepared": false,
        "alwaysPrepared": false,
        "attackRoll": false,
        "attackMod": "",
        "attackBonus": "—",
        "attackProficient": false,
        "rolls": [],
        "saveAbility": "",
        "saveDC": 0,
        "max": 25,
        "used": 0,
        "step": 5,
        "recharge": "Long Rest",
        "damage": "",
        "rollDamage": false
      },
      {
        "name": "Divine Smite",
        "description": "When you hit with a melee weapon, expend a spell slot to deal +2d8 radiant damage per slot level (max 5d8). +1d8 vs undead or fiends.",
        "showInSpells": false,
        "showInFeatures": false,
        "showInTraits": true,
        "showInCombat": false,
        "combatActionType": "action",
        "level": 0,
        "school": "",
        "castingTime": "",
        "range": "",
        "components": "",
        "duration": "",
        "concentration": false,
        "ritual": false,
        "prepared": false,
        "alwaysPrepared": false,
        "attackRoll": false,
        "attackMod": "",
        "attackBonus": "—",
        "attackProficient": false,
        "rolls": [],
        "saveAbility": "",
        "saveDC": 0,
        "max": 0,
        "used": 0,
        "step": 1,
        "recharge": "",
        "damage": "",
        "rollDamage": false
      },
      {
        "name": "Aura of Protection",
        "description": "While conscious, you and friendly creatures within 10 ft add your CHA modifier (min +1) to saving throws.",
        "showInSpells": false,
        "showInFeatures": false,
        "showInTraits": true,
        "showInCombat": false,
        "combatActionType": "action",
        "level": 0,
        "school": "",
        "castingTime": "",
        "range": "",
        "components": "",
        "duration": "",
        "concentration": false,
        "ritual": false,
        "prepared": false,
        "alwaysPrepared": false,
        "attackRoll": false,
        "attackMod": "",
        "attackBonus": "—",
        "attackProficient": false,
        "rolls": [],
        "saveAbility": "",
        "saveDC": 0,
        "max": 0,
        "used": 0,
        "step": 1,
        "recharge": "",
        "damage": "",
        "rollDamage": false
      },
      {
        "name": "Sacred Weapon",
        "description": "As an action, imbue a weapon with your holy symbol for 1 minute. It becomes magical, adds CHA modifier to attack rolls, and sheds light.",
        "showInSpells": false,
        "showInFeatures": true,
        "showInTraits": true,
        "showInCombat": true,
        "combatActionType": "action",
        "level": 0,
        "school": "",
        "castingTime": "",
        "range": "",
        "components": "",
        "duration": "",
        "concentration": false,
        "ritual": false,
        "prepared": false,
        "alwaysPrepared": false,
        "attackRoll": false,
        "attackMod": "",
        "attackBonus": "—",
        "attackProficient": false,
        "rolls": [],
        "saveAbility": "",
        "saveDC": 0,
        "max": 1,
        "used": 0,
        "step": 1,
        "recharge": "Short Rest",
        "damage": "",
        "rollDamage": false
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
    "statMods": { "ac": 0, "speed": 0, "initiative": 0, "spellatk": 0, "spelldc": 0 },
    "damageResistances": { "fire": 1, "necrotic": -1 },
    "diceRoller": null,
    "portrait": null
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
| Entry in `state.entries` with `showInCombat: true` but no `spellAbility` set in `form` | Spell attack bonus shows as `+0`; roll still works | Set `form.spellAbility` to the correct ability key |
| Spell/feature/trait duplicated in both `state.entries` and `state.attacks[]` | The item appears twice in the combat block | Remove the `attacks[]` entry; set `showInCombat: true` on the entry instead |
| `prepared: true` and `alwaysPrepared: true` both set on the same entry | Only `alwaysPrepared` is meaningful; the spell shows in Spells Prepared but the P dot renders incorrectly | Set exactly one to `true`; the app enforces mutual exclusivity when toggling via the UI |
| `maxSpellsPrepared` omitted on a class that uses preparation (Wizard, Cleric, etc.) | The prepared-count display shows `0 / 0` and no limit is enforced | Set `"maxSpellsPrepared"` to the character's daily preparation limit (e.g. `5` for a level 3 Wizard with INT 14) |
| `attacks[].saveDC` as a string (`"15"`) | DC displays correctly but numeric comparison may fail in future | Use an integer: `15` not `"15"` |
| Separate `spells`, `classFeatures`, or `infoTraits` arrays in new files | Old format still loads (auto-migrated on load), but is not the canonical format | Use `state.entries[]` with `showIn*` flags instead; set `showInSpells: true` for spells, `showInFeatures: true` for dot-tracked features, `showInTraits: true` for info traits |
| `form.features` present in file | Field is silently ignored (the textarea no longer exists); data is lost | Move features to `state.entries` as objects with `showInTraits: true` |
