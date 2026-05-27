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

// ── Dice rolling utilities ────────────────────────────────────────────────────

/** Rolls a single d20. */
function d20() { return Math.floor(Math.random() * 20) + 1; }

/** Returns a descriptive string for a natural 20 or natural 1. */
function natMsg(roll) { return roll === 20 ? ' ★ NAT 20!' : roll === 1 ? ' ✦ Nat 1' : ''; }

/**
 * Parses and rolls a dice expression such as "2d6+3" or "1d8-1".
 * Returns the integer total, or null if the expression is invalid/empty.
 */
function rollDiceExpr(expr) {
  if (!expr || expr === '—') return null;
  let total = 0;
  let s = expr.replace(/([+-]?)(\d+)d(\d+)/gi, (_, sign, n, y) => {
    const sides = parseInt(y);
    let sum = 0;
    for (let i = 0; i < parseInt(n); i++) sum += Math.floor(Math.random() * sides) + 1;
    return (sign === '-' ? -sum : ('+' + sum)).toString();
  });
  const parts = s.match(/[+-]?\d+/g);
  if (!parts) return null;
  parts.forEach(p => { total += parseInt(p); });
  return total;
}

/**
 * Rolls a d20 with optional advantage or disadvantage.
 * @param {'normal'|'adv'|'dis'} mode
 * @returns {{roll: number, breakdown: string}}
 */
function d20Roll(mode) {
  if (mode === 'adv') {
    const r1 = d20(), r2 = d20();
    return { roll: Math.max(r1, r2), breakdown: `d20(${r1},${r2})` };
  }
  if (mode === 'dis') {
    const r1 = d20(), r2 = d20();
    return { roll: Math.min(r1, r2), breakdown: `d20(${r1},${r2})` };
  }
  const roll = d20();
  return { roll, breakdown: `d20(${roll})` };
}

// ── ID generation ─────────────────────────────────────────────────────────────

/** Generates a unique short ID using timestamp + random characters. */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── HTML escaping ─────────────────────────────────────────────────────────────

/** Escapes special HTML characters in a string to prevent XSS. */
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Tab / Panel navigation ────────────────────────────────────────────────────

/**
 * Activates a named tab and its associated panel.
 * Removes .active from every .tab-btn and .panel on the page, then adds it to
 * the button matching [data-tab="id"] and the element with id="panel-<id>".
 * Any page that uses the tab-btn / panel-* naming convention can call this.
 * @param {string} id  The data-tab value to activate.
 */
function switchTab(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  const btn = document.querySelector(`.tab-btn[data-tab="${id}"]`);
  if (btn) { btn.classList.add('active'); btn.scrollIntoView({inline: 'center', block: 'nearest'}); }
}

/**
 * Attaches horizontal touch-swipe listeners to document.body so the user can
 * swipe left/right to move between tabs.
 * @param {string[]}           tabs          Ordered list of tab IDs to cycle through.
 * @param {function():boolean} [shouldBlock] Optional. Called before each swipe attempt;
 *                                           return true to suppress the navigation.
 */
function setupSwipe(tabs, shouldBlock) {
  let x0 = null, y0 = null, xLast = null, yLast = null;
  let startedOnTabBar = false;
  let startedOnTabButton = false;
  let tabBarDrag = false;
  let suppressNextTabClick = false;
  document.body.addEventListener('touchstart', e => {
    suppressNextTabClick = false;
    x0    = e.touches[0].clientX;
    y0    = e.touches[0].clientY;
    xLast = x0;
    yLast = y0;
    tabBarDrag = false;
    startedOnTabButton = !!e.target.closest('.tab-btn');
    const tb = document.querySelector('.tab-bar');
    if (tb) {
      const r = tb.getBoundingClientRect();
      startedOnTabBar = x0 >= r.left && x0 <= r.right && y0 >= r.top && y0 <= r.bottom;
    } else {
      startedOnTabBar = false;
    }
  }, {passive: true});
  document.body.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      xLast = e.touches[0].clientX;
      yLast = e.touches[0].clientY;
      if (!tabBarDrag && startedOnTabBar && startedOnTabButton && Math.abs(xLast - x0) > 10) {
        tabBarDrag = true;
      }
    }
  }, {passive: true});
  function applySwipe(endX, endY) {
    if (x0 === null) return false;
    const wasOnTabBar = startedOnTabBar;
    const dx = endX - x0;
    const dy = endY - y0;
    x0 = null; xLast = null; yLast = null;
    startedOnTabBar = false;
    startedOnTabButton = false;
    tabBarDrag = false;
    if (shouldBlock && shouldBlock()) return false;
    if (wasOnTabBar) return false;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return false;
    const cur = tabs.indexOf(document.querySelector('.tab-btn.active')?.dataset.tab ?? tabs[0]);
    const next = Math.max(0, Math.min(tabs.length - 1, cur + (dx < 0 ? 1 : -1)));
    if (next !== cur) switchTab(tabs[next]);
    return true;
  }
  // non-passive so we can call preventDefault() and cancel the click that
  // would otherwise fire on whichever tab button the finger landed on.
  document.body.addEventListener('touchend', e => {
    if (tabBarDrag) {
      suppressNextTabClick = true;
      e.preventDefault();
    }
    const swipe = applySwipe(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    if (swipe) e.preventDefault();
  });
  // touchcancel: browser took over the gesture (e.g. scroll); use last tracked position.
  document.body.addEventListener('touchcancel', () => {
    applySwipe(xLast ?? x0 ?? 0, yLast ?? y0 ?? 0);
  }, {passive: true});
  document.body.addEventListener('click', e => {
    if (!suppressNextTabClick) return;
    suppressNextTabClick = false;
    if (!e.target.closest('.tab-btn')) return;
    e.preventDefault();
    e.stopPropagation();
  }, true);
}

