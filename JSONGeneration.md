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

  "conditions": ["Poisoned"],

  "hitDiceUsed": 2,

  "classFeatures": [
    { "name": "Channel Divinity", "max": 2,  "used": 1, "recharge": "Short Rest", "step": 1 },
    { "name": "Lay on Hands",     "max": 25, "used": 5, "recharge": "Long Rest",  "step": 5 }
  ]
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

#### `classFeatures`
Array of limited-use class feature objects. Can be empty (`[]`).

Each object:

| Key | Type | Description |
|---|---|---|
| `name` | string | Display name, e.g. `"Channel Divinity"` |
| `max` | integer | Total uses / pool size (`0`–`999`) |
| `used` | integer | Amount already expended; must be `≤ max` |
| `recharge` | string | When it recharges, e.g. `"Short Rest"`, `"Long Rest"`, or `""` |
| `step` | integer | Points per dot and per +/− tap (default `1`); set to e.g. `5` for Lay on Hands |

```json
"classFeatures": [
  { "name": "Channel Divinity", "max": 2,  "used": 0, "recharge": "Short Rest", "step": 1 },
  { "name": "Lay on Hands",     "max": 40, "used": 0, "recharge": "Long Rest",  "step": 5 }
]
```

With `step: 5` the sheet shows 8 dots (40 ÷ 5) and each +/− tap or dot click moves the counter by 5. Omitting `step` defaults to `1`.

Non-ability-using characters can omit this key or set it to `[]`.

#### `hitDiceUsed`
Integer. Number of hit dice already expended. Max is equal to the character's level (read from `form.charLevel`).

```json
"hitDiceUsed": 2
```

Omitting this key defaults to `0` (all hit dice available). A Long Rest resets this to `0`.

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
    "features":       "Divine Smite\nAura of Protection\nSacred Weapon",
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
    "attacks": [
      { "name": "Longsword",    "bonus": "+6", "damage": "1d8+4"  },
      { "name": "Divine Smite", "bonus": "—",  "damage": "2d8"    }
    ],
    "conditions": [],
    "hitDiceUsed": 0,
    "classFeatures": [
      { "name": "Channel Divinity", "max": 1,  "used": 0, "recharge": "Short Rest", "step": 1 },
      { "name": "Lay on Hands",     "max": 25, "used": 0, "recharge": "Long Rest",  "step": 5 }
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
