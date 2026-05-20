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
  "features":       "Sneak Attack 4d6\nCunning Action\nUncanny Dodge",

  "hpMax":          "52",
  "hpTemp":         "0",
  "statAC":         "15",
  "statSpeed":      "30",
  "statHitDice":    "7d8",

  "spellAbility":   "INT",
  "spellsList":     "Cantrips: Mage Hand, Minor Illusion\n1st: Charm Person, Disguise Self",

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
| `features` | string | Free text |
| `hpMax` | string (int) | `"1"` or higher |
| `hpTemp` | string (int) | `"0"` or higher |
| `statAC` | string (int) | Any integer |
| `statSpeed` | string (int) | Any integer (feet) |
| `statHitDice` | string | Dice notation e.g. `"7d8"` |
| `spellAbility` | string | `"INT"`, `"WIS"`, `"CHA"`, or `""` |
| `spellsList` | string | Free text |
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

  "attacks": [
    { "name": "Rapier",        "bonus": "+7", "damage": "1d8+4" },
    { "name": "Hand Crossbow", "bonus": "+7", "damage": "1d6+4" },
    { "name": "Sneak Attack",  "bonus": "—",  "damage": "4d6"   }
  ],

  "conditions": ["Poisoned"]
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

#### `attacks`
Array of attack objects. Can be empty (`[]`).

Each object:

| Key | Type | Description |
|---|---|---|
| `name` | string | Weapon or ability name |
| `bonus` | string | Attack roll modifier, e.g. `"+7"` or `"—"` |
| `damage` | string | Damage expression, e.g. `"1d8+4"` |

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

```json
{
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
    "features":       "Sneak Attack 4d6\nCunning Action\nUncanny Dodge",
    "hpMax":          "52",
    "hpTemp":         "0",
    "statAC":         "15",
    "statSpeed":      "30",
    "statHitDice":    "7d8",
    "spellAbility":   "INT",
    "spellsList":     "Cantrips: Mage Hand, Minor Illusion\n1st: Charm Person",
    "equipment":      "- Rapier\n- Hand Crossbow\n- Thieves' Tools",
    "proficiencies":  "Light armor, simple weapons, rapiers, shortswords",
    "languages":      "Common, Elvish, Thieves' Cant",
    "notes":          "",
    "cp": "0", "sp": "50", "ep": "0", "gp": "340", "pp": "5"
  },
  "state": {
    "abilities": { "STR": 10, "DEX": 18, "CON": 14, "INT": 16, "WIS": 12, "CHA": 14 },
    "saveProficiencies": ["DEX", "INT"],
    "skillProficiencies": ["Acrobatics", "Deception", "Perception", "Sleight of Hand", "Stealth"],
    "skillExpertise": ["Stealth", "Sleight of Hand"],
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
    "attacks": [
      { "name": "Rapier",        "bonus": "+7", "damage": "1d8+4" },
      { "name": "Hand Crossbow", "bonus": "+7", "damage": "1d6+4" },
      { "name": "Sneak Attack",  "bonus": "—",  "damage": "4d6"   }
    ],
    "conditions": []
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
