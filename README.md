# prova

Small game project. Currently contains a minimal D&D 5e–style character sheet
system and one creature (Goblin). A behavior tree for NPC AI is planned next.

## Entrypoints

Run from the project root:

| Command | What it does |
|---|---|
| `python -m src.creatures.goblin` | Print the Goblin stat block to stdout. |

In an editor: open `src/creatures/goblin.py` and run the file — the
`__main__` block prints the goblin.

## Expected input

None. Creatures are defined directly in code under `src/creatures/`.

## Expected output

A formatted stat block printed to stdout (name, AC, HP, ability scores,
skills, senses, languages, challenge rating, traits, and actions).

## Directory map

```text
prova/
|-- README.md
|-- CLAUDE.md
`-- src/
    |-- __init__.py
    |-- character_sheet.py        <-- CharacterSheet, AbilityScores, Attack dataclasses
    `-- creatures/
        |-- __init__.py
        `-- goblin.py             <-- Goblin factory + runnable __main__
```

## Examples

The Goblin in `src/creatures/goblin.py` is the only creature so far and
doubles as a runnable example. To add a new creature, copy that file,
rename it, and adjust the values.
