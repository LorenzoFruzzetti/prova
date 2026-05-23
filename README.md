# D&D 5e Character Sheet

A mobile-first, single-file D&D 5th Edition character sheet. No server, no build step, no dependencies — just open the HTML file in any browser.

---

## How to run

**From the file system (recommended)**

```
open dnd-character-sheet.html        # macOS
xdg-open dnd-character-sheet.html   # Linux
start dnd-character-sheet.html       # Windows
```

Or drag `dnd-character-sheet.html` into any browser window. Everything runs locally; no internet connection is needed for core functionality.

> **SRD Browse** (the 📖 SRD tab in the Import modal) fetches live data from [dnd5eapi.co](https://www.dnd5eapi.co) and requires an internet connection. Results are cached in `localStorage` after the first fetch so subsequent searches work offline.

**From a local server (optional, e.g. for mobile testing on the same network)**

```bash
python3 -m http.server 8080
# then open http://localhost:8080/dnd-character-sheet.html
```

---

## Features

| Area | What you can do |
|---|---|
| **Info** | Name, class, subclass, race, level, background, alignment, XP, personality traits |
| **Stats** | Ability scores with auto-calculated modifiers and saving throws |
| **Skills** | 18 skills with proficiency / expertise dot tracking |
| **Combat** | HP tracker (tap to edit, hold +/− to fast-change), AC, Speed, Initiative, spell attack, death saves, hit dice |
| **Spells** | Spell slot tracking (1st–9th), full spell library with Concentration / Ritual / attack roll support |
| **Features** | Class features with dot trackers, recharge types, and custom step sizes |
| **Import** | ⇓ Import button in the header bar — two modes: ✨ AI (generate a prompt, paste back the JSON) and 📖 SRD (search spells, racial traits, and class features directly from the 2014 SRD via [dnd5eapi.co](https://www.dnd5eapi.co); internet required, results cached locally) |
| **Gear** | Currency (CP/SP/EP/GP/PP), equipment, proficiencies, languages, notes |
| **Rolls** | Session roll history; swipe left/right to change tabs |
| **Long Rest** | Restores HP, spell slots, hit dice, and all feature uses in one tap |

---

## Settings (⚙ button in the header)

| Setting | Description |
|---|---|
| **Save / Load** | Export character as a JSON file or import one; the AI Import modal also accepts a JSON array of spells, features, or traits pasted directly |
| **Font Size** | 6 zoom levels (75 % – 150 %) |
| **Lefty Mode** | Moves +/− tracker buttons to the left side |
| **Theme** | 5 colour themes — Gold (default), Dark, Red, Forest, Ocean |

All settings are saved in `localStorage` and persist between sessions.

---

## Expected input

The sheet reads from and writes to:

- **`localStorage` key `dnd5e_sheet`** — auto-saved on every input change; restored on page load.
- **JSON import file** — produced by "Save Character" or any compatible tool; must follow the schema in `JSONGeneration.md`.

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
    "hitDiceUsed": 0,
    "inspiration": false
  }
}
```

See `JSONGeneration.md` for the full field reference and valid values.

---

## Expected output

| Output | Location | When |
|---|---|---|
| Auto-save | `localStorage` (`dnd5e_sheet`) | Every input change |
| JSON export | `<charname>.json` download | "Save Character" in Settings |

The app produces no server-side output and writes no files to disk except via the browser's download mechanism.

---

## Directory map

```
prova/
├── dnd-character-sheet.html   ← open this in your browser
├── CLAUDE.md                  ← project instructions for AI assistants
├── REFERENCE.md               ← developer reference: CSS tokens, JS functions, state shape
├── JSONGeneration.md          ← JSON import/export schema
├── .env/
│   ├── environment.yml        ← Conda environment (Python tooling, not required for the sheet)
│   ├── requirements.txt
│   ├── .envVariables
│   └── ENVIRONMENT_SETUP.md
├── src/                       ← production source code (classes, utilities, packages)
├── tests/                     ← unit and integration tests
├── examples/
│   ├── README.md
│   └── data/                  ← sample JSON files for import testing
├── temp_image/                ← transient images (not project output)
├── temporary_files/           ← transient scratch files
└── debugging_scripts/         ← experimental / diagnostic scripts
```

---

## Examples

Sample character JSON files live in `examples/data/`. See `examples/README.md` for what each file demonstrates and how to load it.

To load a sample:
1. Open `dnd-character-sheet.html` in your browser.
2. Tap ⚙ → **Load Character**.
3. Select a file from `examples/data/`.
