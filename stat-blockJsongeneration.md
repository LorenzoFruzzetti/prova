# Stat-Block JSON Generation Guide

This document describes the JSON schema used by `creature-stat-block.html` for importing and exporting creature stat blocks. Use this guide when asking an AI assistant to generate a creature, when writing manual JSON, or when validating imported data.

---

## How to use this with an AI

1. Open `creature-stat-block.html`.
2. Tap **⚙ → AI-Generate Creature** (or the equivalent menu item).
3. Copy the generated prompt and paste it into an AI assistant (ChatGPT, Claude, etc.).
4. The AI will return a JSON object. Paste it back into the app to import the creature.

The prompt embedded in the app already includes the full schema below, so you do not need to quote this file to the AI.

The generated prompt also includes these rules:
- Every `desc` field (in `specialAbilities`, `actions`, `bonusActions`, `reactions`, `legendaryActions`, and `lairActions`) must be non-empty — the AI fills in a concise best-guess description from the entry's name and its D&D 5e knowledge if one isn't otherwise specified.
- An ability, attack, or trait that isn't a standard D&D 5e mechanic is not dropped — the AI maps it to a reasonable `specialAbilities` (passive) or `actions` (active) entry instead.

---

## Top-level shape

```json
{
  "name": string,
  "source": string,
  "portrait": null,
  "notes": string,
  "initiative": string,
  "habitat": string,
  "treasure": string,
  "lairDescription": string,
  "size": string,
  "type": string,
  "subtype": string,
  "alignment": string,
  "cr": number,
  "xp": integer,
  "ac": integer,
  "acDetail": string,
  "hp": integer,
  "hitDice": string,
  "speed": { ... },
  "abilities": { ... },
  "savingThrows": { ... },
  "skills": { ... },
  "damageImmunities": string[],
  "damageResistances": string[],
  "damageVulnerabilities": string[],
  "conditionImmunities": string[],
  "senses": { ... },
  "telepathy": integer,
  "languages": string,
  "legendaryActionsMax": integer,
  "legendaryActionsUsed": integer,
  "specialAbilities": [ ... ],
  "actions": [ ... ],
  "bonusActions": [ ... ],
  "reactions": [ ... ],
  "legendaryActions": [ ... ],
  "lairActions": [ ... ]
}
```

---

## Field reference

### Identity

| Field | Type | Notes |
|---|---|---|
| `name` | string | Creature name |
| `source` | string | `"manual"`, `"srd2024"`, `"srd2014"`, or any string |
| `portrait` | null or base64 data URL | Set by the user; always `null` in generated JSON |
| `notes` | string | Free-form description / lore (shown in the **Info** tab) |

### Metadata (Info tab)

| Field | Type | Notes |
|---|---|---|
| `initiative` | string | Initiative modifier, e.g. `"+5"` or `"+12 (22)"`. Empty string if not specified |
| `habitat` | string | Typical environment, e.g. `"Swamp"`, `"Underdark"`, `"Forest"`. Empty string if none |
| `treasure` | string | Treasure type, e.g. `"Relics"`, `"Coins"`, `"Art Objects"`. Empty string if none |
| `lairDescription` | string | Narrative description of the lair and its regional effects (shown in the **Lair** tab) |

### Type and Alignment

| Field | Type | Valid values / notes |
|---|---|---|
| `size` | string | `"Tiny"`, `"Small"`, `"Medium"`, `"Large"`, `"Huge"`, `"Gargantuan"` |
| `type` | string | `"aberration"`, `"beast"`, `"celestial"`, `"construct"`, `"dragon"`, `"elemental"`, `"fey"`, `"fiend"`, `"giant"`, `"humanoid"`, `"monstrosity"`, `"ooze"`, `"plant"`, `"undead"` |
| `subtype` | string | Optional sub-type shown in parentheses, e.g. `"demon"`, `"shapechanger"`, `""` |
| `alignment` | string | e.g. `"lawful evil"`, `"chaotic neutral"`, `"unaligned"`, `"any alignment"` |

### Combat stats

| Field | Type | Notes |
|---|---|---|
| `cr` | number | `0`, `0.125`, `0.25`, `0.5`, `1`–`30` |
| `xp` | integer | XP for the CR (informational; recalculated from CR table) |
| `ac` | integer | Armour Class value |
| `acDetail` | string | Source of AC, e.g. `"natural armor"`, `"chain mail + shield"` |
| `hp` | integer | Hit point maximum |
| `hitDice` | string | Hit dice expression, e.g. `"15d10+45"` |

### Speed

```json
"speed": {
  "walk":   integer,
  "fly":    integer,
  "swim":   integer,
  "climb":  integer,
  "burrow": integer,
  "hover":  boolean
}
```

Omit or set to `0` for speeds the creature does not have.

### Ability Scores

```json
"abilities": { "STR":int, "DEX":int, "CON":int, "INT":int, "WIS":int, "CHA":int }
```

All six abilities must be present. Standard range 1–30, typical 3–30.

### Saving Throws

```json
"savingThrows": { "STR":int, "DEX":int }
```

Only include abilities where the creature has a **proficient** saving throw. Omit the others entirely. Values are the **total modifier**, not the bonus over base (e.g. STR 16 + proficiency 4 → `"STR": 7`).

### Skills

```json
"skills": { "perception": 7, "stealth": 5 }
```

Include only skills with a **non-standard modifier** (proficiency or expertise). Keys are lowercase, space-separated names: `"perception"`, `"sleight of hand"`, `"animal handling"`, etc. Values are **total modifiers**.

Full list of valid keys: `athletics`, `acrobatics`, `sleight of hand`, `stealth`, `arcana`, `history`, `investigation`, `nature`, `religion`, `animal handling`, `insight`, `medicine`, `perception`, `survival`, `deception`, `intimidation`, `performance`, `persuasion`.

### Damage interactions

```json
"damageImmunities":      ["fire", "poison"],
"damageResistances":     ["bludgeoning", "piercing", "slashing"],
"damageVulnerabilities": ["cold"],
"conditionImmunities":   ["charmed", "frightened"]
```

Values are lowercase strings. Damage types: `acid`, `bludgeoning`, `cold`, `fire`, `force`, `lightning`, `necrotic`, `piercing`, `poison`, `psychic`, `radiant`, `slashing`, `thunder`. Condition names: standard 5e condition names in lowercase.

### Senses

```json
"senses": {
  "darkvision":        integer,
  "blindsight":        integer,
  "truesight":         integer,
  "tremorsense":       integer,
  "passivePerception": integer
}
```

Values are feet. Omit or set to `0` for senses the creature does not have. `passivePerception` is always present (10 + Perception modifier).

```json
"telepathy": integer
```

Range in feet; `0` if none.

### Languages

```json
"languages": "Common, Elvish, telepathy 120 ft."
```

Free-form string listing all languages. Use `""` if none.

### Legendary action pool

| Field | Type | Notes |
|---|---|---|
| `legendaryActionsMax` | integer | Pool size (usually 3); `0` if not legendary |
| `legendaryActionsUsed` | integer | Always `0` in exported JSON (runtime state) |

---

## Section schemas

All sections follow the same base pattern. Optional fields may be omitted; the app defaults them.

### `specialAbilities` — Traits

```json
"specialAbilities": [
  {
    "name":     string,
    "desc":     string,
    "max":      integer,
    "used":     0,
    "step":     1,
    "recharge": string
  }
]
```

| Field | Notes |
|---|---|
| `name` | Trait name, e.g. `"Legendary Resistance (3/Day)"` |
| `desc` | Full text description |
| `max` | `0` for passive traits; number of uses for limited-use traits (e.g. `3`) |
| `used` | Always `0` in exported JSON |
| `step` | How many charges are consumed per use; usually `1` |
| `recharge` | How uses are replenished: `""`, `"Day"`, `"Long Rest"`, `"Short Rest"`, `"Turn"`, `"Dawn"` |

### `actions` — Actions

```json
"actions": [
  {
    "name":        string,
    "desc":        string,
    "attackBonus": string or null,
    "rolls":       [ { "dice": string, "type": string } ],
    "saveAbility": string,
    "saveDC":      integer,
    "max":         integer,
    "used":        0,
    "step":        1,
    "recharge":    string,
    "cost":        1
  }
]
```

| Field | Notes |
|---|---|
| `attackBonus` | Attack roll bonus including sign, e.g. `"+7"`. `null` or `""` for non-attack actions |
| `rolls` | Array of damage dice expressions; `[]` if no damage. Each entry: `{ "dice": "2d6+5", "type": "slashing" }` |
| `saveAbility` | `"STR"`, `"DEX"`, `"CON"`, `"INT"`, `"WIS"`, `"CHA"`, or `""` |
| `saveDC` | Save DC value; `0` if none |
| `max` | `0` for unlimited; positive for limited-use (e.g. `1` for a recharge ability) |
| `recharge` | `"Recharge 5-6"`, `"Recharge 6"`, `"Day"`, `"Long Rest"`, etc. |
| `cost` | Legendary action pool cost; always `1` for regular actions |

### `bonusActions` — Bonus Actions

Same schema as `actions`. Set `cost: 1`.

```json
"bonusActions": [
  {
    "name":        string,
    "desc":        string,
    "attackBonus": string or null,
    "rolls":       [ { "dice": string, "type": string } ],
    "saveAbility": string,
    "saveDC":      integer,
    "max":         integer,
    "used":        0,
    "step":        1,
    "recharge":    string,
    "cost":        1
  }
]
```

### `reactions` — Reactions

```json
"reactions": [
  {
    "name":     string,
    "desc":     string,
    "max":      integer,
    "used":     0,
    "step":     1,
    "recharge": string
  }
]
```

### `legendaryActions` — Legendary Actions

```json
"legendaryActions": [
  {
    "name":        string,
    "desc":        string,
    "cost":        integer,
    "attackBonus": string or null,
    "rolls":       [ { "dice": string, "type": string } ],
    "max":         integer,
    "used":        0,
    "step":        1,
    "recharge":    string
  }
]
```

`cost` is the number of legendary action pool points spent (default `1`; uncommon values: `2`, `3`).

### `lairActions` — Lair Actions

```json
"lairActions": [
  {
    "name":     string,
    "desc":     string,
    "max":      0,
    "used":     0,
    "step":     1,
    "recharge": ""
  }
]
```

---

## Complete minimal example

```json
{
  "name": "Shadow",
  "source": "srd2014",
  "portrait": null,
  "notes": "",
  "size": "Medium",
  "type": "undead",
  "subtype": "",
  "alignment": "chaotic evil",
  "cr": 0.5,
  "xp": 100,
  "ac": 12,
  "acDetail": "",
  "hp": 16,
  "hitDice": "3d8+3",
  "speed": { "walk": 40, "fly": 0, "swim": 0, "climb": 0, "burrow": 0, "hover": false },
  "abilities": { "STR": 6, "DEX": 14, "CON": 13, "INT": 6, "WIS": 10, "CHA": 8 },
  "savingThrows": {},
  "skills": { "stealth": 4 },
  "damageImmunities": ["necrotic", "poison"],
  "damageResistances": ["acid", "fire", "lightning", "thunder", "bludgeoning", "piercing", "slashing"],
  "damageVulnerabilities": [],
  "conditionImmunities": ["exhaustion", "frightened", "grappled", "paralyzed", "petrified", "poisoned", "prone", "restrained"],
  "senses": { "darkvision": 60, "blindsight": 0, "truesight": 0, "tremorsense": 0, "passivePerception": 10 },
  "telepathy": 0,
  "languages": "",
  "legendaryActionsMax": 0,
  "legendaryActionsUsed": 0,
  "specialAbilities": [
    {
      "name": "Amorphous",
      "desc": "The shadow can move through a space as narrow as 1 inch wide without squeezing.",
      "max": 0, "used": 0, "step": 1, "recharge": ""
    },
    {
      "name": "Shadow Stealth",
      "desc": "While in dim light or darkness, the shadow can take the Hide action as a bonus action.",
      "max": 0, "used": 0, "step": 1, "recharge": ""
    }
  ],
  "actions": [
    {
      "name": "Strength Drain",
      "desc": "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 9 (2d6 + 2) necrotic damage, and the target's Strength score is reduced by 1d4. The target dies if this reduces its Strength to 0. Otherwise, the reduction lasts until the target finishes a short or long rest.",
      "attackBonus": "+4",
      "rolls": [{ "dice": "2d6+2", "type": "necrotic" }],
      "saveAbility": "", "saveDC": 0,
      "max": 0, "used": 0, "step": 1, "recharge": "", "cost": 1
    }
  ],
  "bonusActions": [],
  "reactions": [],
  "legendaryActions": [],
  "lairActions": []
}
```

---

## Common mistakes

| Mistake | Correct approach |
|---|---|
| Including all six ability saves in `savingThrows` | Only include saves the creature is **proficient** in |
| Using signed string for ability scores (`"+3"`) | Use plain integer `10` for the score, not the modifier |
| Setting `used` to a non-zero value | Always `0` in exported/generated JSON |
| Using title-case for damage types (`"Fire"`) | Use lowercase `"fire"` |
| Omitting `cost` from legendary actions | Always include `"cost": 1` (or `2`/`3` for expensive actions) |
| Putting reactions in `actions` | Place them in `"reactions": [...]` |
| Putting bonus actions in `actions` | Place them in `"bonusActions": [...]` |
| Using `"Recharge 5-6"` for daily abilities | Use `"recharge": "Day"` and `"max": 1` instead |

---

## Maintenance rules

Update this file whenever:
1. A new top-level field is added to `defaultCreature()` in `creature-stat-block.html`
2. A section schema field is added, removed, or renamed (e.g. in `_defaultActionItem()` or `saveEditPanel()`)
3. The AI prompt inside `generateAndCopyCreaturePrompt()` is changed
4. A new section type is added (beyond the six: specialAbilities, actions, bonusActions, reactions, legendaryActions, lairActions)
5. `parseSrd2024Monster()` or `parseSrdMonster()` maps new fields from SRD data

**The code is the source of truth.** If this document contradicts `creature-stat-block.html`, update this document.
