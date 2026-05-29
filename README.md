# D&D 5e Character Sheet

A mobile-first D&D 5th Edition character sheet. No build step required — serve or open the whole folder in a browser. `shared.js` and `shared.css` must be in the same directory as the HTML files.

---

## How to run

**Minimum requirement: the whole folder**

`dnd-character-sheet.html` loads `shared.css` and `shared.js` from the same directory. Opening just the HTML file on its own will not work — you need the full project folder.

**From a local server (recommended)**

```bash
python3 -m http.server 8080
# then open http://localhost:8080/dnd-character-sheet.html
```

This is the simplest way to get everything working, including the `srd2024/` data files, and makes it easy to test on mobile devices on the same network.

**From the file system**

```
open dnd-character-sheet.html        # macOS
xdg-open dnd-character-sheet.html   # Linux
start dnd-character-sheet.html       # Windows
```

Dragging `dnd-character-sheet.html` into a browser also works as long as `shared.css` and `shared.js` are in the same folder. Core sheet functionality (character editing, dice rolling, localStorage save/load, JSON import/export) works this way. The `srd2024/` data files require a server.

> **SRD Browse (2014)** fetches live data from [dnd5eapi.co](https://www.dnd5eapi.co) and requires an internet connection. Results are cached in `localStorage` after the first fetch so subsequent lookups work offline.

---

## Feature tiers

| Tier | Requirement | Available features |
|---|---|---|
| **File system** | Whole folder open in browser | All core sheet features: character editing, spells, attacks, features, dice rolling, conditions, companions, localStorage save/load, JSON export/import |
| **Served** | Whole folder served (local server or Netlify) | Everything above, plus: 2024 SRD lookups (`srd2024/*.json`), 2014 SRD lookups (internet required) |

---

## Features

| Tab | What you can do |
|---|---|
| **Info** | Name, class, subclass, race, level, background, alignment, XP, portrait, personality traits |
| **Stats** | Ability scores with auto-calculated modifiers, saving throws, skills (18 skills with proficiency/expertise dot tracking) |
| **Combat** | HP tracker (tap to edit, hold +/− to fast-change), AC, Speed, Initiative, spell attack/save DC, death saves, hit dice, conditions, damage resistances/immunities/vulnerabilities |
| **Spells** | Spell slot tracking (1st–9th), full spell library with Concentration / Ritual / attack roll support |
| **Features** | Class features with dot trackers, recharge types (Short/Long Rest), custom step sizes |
| **Gear** | Currency (CP/SP/EP/GP/PP), equipment list, proficiencies, languages, notes |
| **Dice** | Custom dice roller (d4–d100 + custom expressions) with modifier support |
| **Logs** | Session roll history |
| **Companions** | Linked creature stat blocks; tap to open in `creature-stat-block.html` |

**Additional tools:**
- `character-creator.html` — step-by-step character creation wizard; exports a JSON payload loadable by the main sheet
- `creature-stat-block.html` — standalone creature stat block viewer and editor; creatures can be linked to a character as companions

**Import hub (⇓ button in the header):**
- **AI / SRD Import** — fill spells, features, traits, or items from AI or SRD data
- **Import Character** — load a character from a JSON file, or generate one from a photo via AI
- **Import Information** — AI or SRD description fill with Missing-only or All-entries scope

---

## Settings (⚙ button in the header)

| Setting | Description |
|---|---|
| **Save** | Export current character as a JSON file |
| **Load Character** | Import a character JSON file |
| **New Character** | Add a blank character to the roster |
| **Font Size** | 6 zoom levels (75 % – 150 %) |
| **Lefty Mode** | Moves +/− tracker buttons to the left side |
| **Theme** | 5 colour themes — Gold (default), Dark, Red, Forest, Ocean |
| **Language** | UI language (currently: English, Italian) |

All settings persist in `localStorage` between sessions.

---

## Multi-character roster

The header shows the active character name. Tap it to open the roster, where you can switch between characters, add new ones, or delete existing ones. Each character is saved independently under the `dnd5e_roster` key.

---

## Expected input

### JSON file format (brief)

```json
{
  "form": { "charName": "Aria", "charClass": "Wizard", "charLevel": "5", ... },
  "state": {
    "abilities": { "STR": 10, "DEX": 14, "CON": 12, "INT": 18, "WIS": 13, "CHA": 10 },
    "hpCurrent": 28,
    "spellSlots": [ { "level": 1, "max": 4, "used": 1 }, ... ],
    "spells": [ { "name": "Fireball", "level": 3, "school": "Evocation", ... } ],
    "attacks": [ { "name": "Dagger", "bonus": "+4", "damage": "1d4+2" } ],
    "classFeatures": [ { "name": "Arcane Recovery", "max": 1, "used": 0, "recharge": "Short Rest", "step": 1 } ],
    "saveProficiencies": ["INT", "WIS"],
    "skillProficiencies": ["Arcana", "History"],
    "skillExpertise": [],
    "conditions": [],
    "companions": [],
    "portrait": "",
    "hitDiceUsed": 0,
    "inspiration": false
  }
}
```

See `JSONGeneration.md` for the full field reference, valid values, and annotated examples.

---

## Expected output

| Output | Location | When |
|---|---|---|
| Auto-save | `localStorage` (`dnd5e_roster`) | Every input change |
| JSON export | `<charname>.json` download | ⚙ → Save |

The app produces no server-side output and writes no files to disk except via the browser's download mechanism.

---

## localStorage keys

| Key | Contents |
|---|---|
| `dnd5e_roster` | Full roster: `{ chars: { [id]: { name, payload } }, activeId }` |
| `dnd5e_fontsize` | Font size index (integer) |
| `dnd5e_lefty` | Lefty mode flag (`"1"` / absent) |
| `dnd5e_theme` | Active theme key (string) |
| `dnd5e_lang` | UI language code (string, e.g. `"en"`, `"it"`) |
| `srd_v1_*` | 2014 SRD API response cache entries |
| `srd24_v1_*` | 2024 SRD response cache entries |
| `dnd5e_pending_import` | Transient: payload written by `character-creator.html`; consumed and removed on next load |

---

## Directory map

```
prova/
├── dnd-character-sheet.html              ← core app (open this in your browser)
├── character-creator.html                ← character creation wizard
├── creature-stat-block.html              ← creature stat block viewer/editor
├── index.html                            ← redirects to dnd-character-sheet.html (Netlify)
├── shared.js                             ← shared utilities (dice, roll overlay, info panel, toast, theme)
├── shared.css                            ← shared CSS tokens, themes, and component classes
├── netlify.toml                          ← Netlify deployment config
├── build-srd2024.js                      ← build script for srd2024/bundle.js
├── CLAUDE.md                             ← project instructions for AI assistants
├── REFERENCE.md                          ← developer reference: CSS tokens, JS functions, state shape
├── REFERENCE-character-creator.md        ← developer reference for character-creator.html
├── JSONGeneration.md                     ← JSON import/export schema for character sheets
├── stat-blockJsongeneration.md           ← JSON import/export schema for creature stat blocks
├── languages/
│   └── it.json                           ← Italian UI translation
├── srd2024/                              ← 2024 SRD data files (requires serving)
│   ├── translation.json                  ←   terminology map: 2014↔2024 field names
│   ├── bundle.js
│   ├── spells.json
│   ├── species.json
│   ├── classes.json
│   ├── equipment.json
│   ├── creatures.json
│   ├── conditions.json
│   ├── feats.json
│   ├── magic-items.json
│   ├── backgrounds.json
│   └── weapon-properties.json
└── examples/
    └── data/
        ├── ernenegilia-warlock.json      ← sample: Aasimar Warlock lv1
        └── seraphina-dawnblade.json      ← sample: Human Paladin lv8
```

---

## Examples

Sample character JSON files live in `examples/data/`.

| File | Character | Demonstrates |
|---|---|---|
| `ernenegilia-warlock.json` | Ernenegilia, Aasimar Warlock lv1 | Cantrips with `attackRoll`/`rollDamage`, Hex with concentration + bonus-action combat, Pact of the Chain trait, minimal currency |
| `seraphina-dawnblade.json` | Seraphina Dawnblade, Human Paladin lv8 | Multi-slot spellcasting, `classFeatures` with `step`, `infoTraits` with `showInCombat`, portrait field, full proficiency/expertise setup |

To load a sample:
1. Open `dnd-character-sheet.html` in your browser.
2. Tap ⇓ Import → **Import Character** → **JSON**.
3. Select a file from `examples/data/`.
