'use strict';
// ── shared.js ────────────────────────────────────────────────────────────────
// Utilities shared across all D&D 5e character-tool pages.
// Load BEFORE any page-specific <script> block:
//   <script src="shared.js"></script>
//
// How to move a function here from an HTML file:
//  1. Confirm the function is truly file-agnostic (no DOM references, no
//     page-specific state). Pure data and pure math are the best candidates.
//  2. Copy the function/constant into the appropriate section below.
//  3. Remove the original definition from EVERY HTML file that had it.
//  4. Add <script src="shared.js"></script> to any HTML file that does not
//     already load it (place it before the inline <script> block).
//  5. Open each affected page in a browser and confirm no console errors.
//  6. Update REFERENCE.md and CLAUDE.md if the moved symbol is documented there.
// ─────────────────────────────────────────────────────────────────────────────

// ── Ability score math ────────────────────────────────────────────────────────

/** Modifier for a given ability score: floor((score − 10) / 2). */
function mod(score) { return Math.floor((score - 10) / 2); }

/** Formats a modifier with an explicit +/− sign, e.g. +3 or -1. */
function fmtMod(m) { return (m >= 0 ? '+' : '') + m; }

/** Proficiency bonus for a given character level (pure; no DOM dependency). */
function profBonus(lvl) { return Math.ceil(lvl / 4) + 1; }

// Backwards-compatibility aliases used by character-creator.html
const abilityMod = mod;
const modStr     = fmtMod;

// ── Spell slot progression tables ─────────────────────────────────────────────
// Index 0 = character level 1; each inner array = [1st…9th level slot counts].

const SLOT_LABELS = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'];

const SLOTS_FULL = [
  [2,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0],[4,3,3,3,2,0,0,0,0],[4,3,3,3,2,1,0,0,0],[4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,0,0],[4,3,3,3,2,1,1,1,0],[4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]
];
const SLOTS_HALF_2024 = [
  [2,0,0,0,0,0,0,0,0],[2,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],
  [4,2,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0],[4,3,2,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],
  [4,3,3,1,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0],[4,3,3,3,1,0,0,0,0],[4,3,3,3,2,0,0,0,0],[4,3,3,3,2,0,0,0,0]
];
const SLOTS_HALF_2014 = [
  [0,0,0,0,0,0,0,0,0],[2,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],[3,0,0,0,0,0,0,0,0],
  [4,2,0,0,0,0,0,0,0],[4,2,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],[4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0],[4,3,2,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],[4,3,3,0,0,0,0,0,0],
  [4,3,3,1,0,0,0,0,0],[4,3,3,1,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],[4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0],[4,3,3,3,1,0,0,0,0],[4,3,3,3,2,0,0,0,0],[4,3,3,3,2,0,0,0,0]
];
const SLOTS_WARLOCK = [
  [1,0,0,0,0,0,0,0,0],[2,0,0,0,0,0,0,0,0],[0,2,0,0,0,0,0,0,0],[0,2,0,0,0,0,0,0,0],
  [0,0,2,0,0,0,0,0,0],[0,0,2,0,0,0,0,0,0],[0,0,0,2,0,0,0,0,0],[0,0,0,2,0,0,0,0,0],
  [0,0,0,0,2,0,0,0,0],[0,0,0,0,2,0,0,0,0],[0,0,0,0,3,0,0,0,0],[0,0,0,0,3,0,0,0,0],
  [0,0,0,0,3,0,0,0,0],[0,0,0,0,3,0,0,0,0],[0,0,0,0,3,0,0,0,0],[0,0,0,0,3,0,0,0,0],
  [0,0,0,0,4,0,0,0,0],[0,0,0,0,4,0,0,0,0],[0,0,0,0,4,0,0,0,0],[0,0,0,0,4,0,0,0,0]
];
const SLOTS_NONE = Array.from({length:20}, () => [0,0,0,0,0,0,0,0,0]);

/**
 * Returns the spell slot progression table for a class.
 * @param {string} idx      Lowercase class index, e.g. 'wizard', 'paladin'.
 * @param {string} edition  '2024' or '2014'.
 * @returns {number[][]}    20-row table of 9-slot arrays.
 */
function classSlotTable(idx, edition) {
  if (['bard','cleric','druid','sorcerer','wizard'].includes(idx)) return SLOTS_FULL;
  if (idx === 'warlock') return SLOTS_WARLOCK;
  if (['paladin','ranger'].includes(idx)) return edition === '2024' ? SLOTS_HALF_2024 : SLOTS_HALF_2014;
  return SLOTS_NONE;
}
