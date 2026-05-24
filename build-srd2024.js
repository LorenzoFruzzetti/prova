#!/usr/bin/env node
'use strict';

// Fetches 2024 SRD data from:
//   5e-bits/5e-database  (CC BY / OGL — species, classes, equipment, etc.)
//   open5e/open5e-api    (CC BY 4.0  — spells, creatures)
// Produces clean JSON files in srd2024/

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const OUT  = path.join(__dirname, 'srd2024');
const BITS = 'https://raw.githubusercontent.com/5e-bits/5e-database/main/src/2024/en';
const O5E  = 'https://raw.githubusercontent.com/open5e/open5e-api/main/data/v2/wizards-of-the-coast/srd-2024';

// ── network ───────────────────────────────────────────────────────────────────

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(new Error(`JSON parse failed for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

// ── helpers ───────────────────────────────────────────────────────────────────

// Unwrap Django fixture array → plain objects; index derived from pk
function fromFixture(arr) {
  return arr.map(({ pk, fields }) => {
    const out = { index: pk.replace(/^srd-2024_/, '') };
    for (const [k, v] of Object.entries(fields)) {
      if (k === 'document') continue;
      out[k] = v;
    }
    return out;
  });
}

// Strip "srd-2024_" prefix from a string or array of strings
const strip = v =>
  Array.isArray(v) ? v.map(strip)
  : typeof v === 'string' ? v.replace(/^srd-2024_/, '')
  : v;

// Capitalise first letter of a string
const cap = s => (s && typeof s === 'string') ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// Join a description array or return a plain string
const desc = v => Array.isArray(v) ? v.join('\n').trim() || null : v || null;

function save(name, data) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n');
  const n = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`  ✓  ${name.padEnd(26)} ${n} entries`);
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const sources = {
    conditions:      `${BITS}/5e-SRD-Conditions.json`,
    species:         `${BITS}/5e-SRD-Species.json`,
    traits:          `${BITS}/5e-SRD-Traits.json`,
    subspecies:      `${BITS}/5e-SRD-Subspecies.json`,
    classes:         `${BITS}/5e-SRD-Classes.json`,
    subclasses:      `${BITS}/5e-SRD-Subclasses.json`,
    backgrounds:     `${BITS}/5e-SRD-Backgrounds.json`,
    feats:           `${BITS}/5e-SRD-Feats.json`,
    equipment:       `${BITS}/5e-SRD-Equipment.json`,
    magicItems:      `${BITS}/5e-SRD-Magic-Items.json`,
    weaponProps:     `${BITS}/5e-SRD-Weapon-Properties.json`,
    masteryProps:    `${BITS}/5e-SRD-Weapon-Mastery-Properties.json`,
    spells:          `${O5E}/Spell.json`,
    creatures:       `${O5E}/Creature.json`,
    creatureTraits:  `${O5E}/CreatureTrait.json`,
    creatureActions: `${O5E}/CreatureAction.json`,
    classFeatures:   `${O5E}/ClassFeature.json`,
  };

  console.log('Downloading source files…');
  const raw = {};
  await Promise.all(
    Object.entries(sources).map(async ([key, url]) => {
      process.stdout.write(`  fetching ${key}…`);
      raw[key] = await get(url);
      process.stdout.write(` ${raw[key].length}\n`);
    })
  );

  console.log('\nBuilding output files…');

  // ── spells ──────────────────────────────────────────────────────────────────
  save('spells.json', fromFixture(raw.spells).map(s => ({
    index:              s.index,
    name:               s.name,
    level:              s.level,
    school:             cap(s.school),
    casting_time:       cap(s.casting_time),
    range:              s.range_text || (s.range != null ? `${s.range} ${s.range_unit || ''}`.trim() : null),
    verbal:             s.verbal,
    somatic:            s.somatic,
    material:           s.material,
    material_specified: s.material_specified || null,
    ritual:             s.ritual,
    concentration:      s.concentration,
    duration:           cap(s.duration),
    desc:               s.desc || null,
    higher_level:       s.higher_level || null,
    damage_roll:        s.damage_roll || null,
    damage_types:       s.damage_types || [],
    saving_throw:       s.saving_throw_ability || null,
    attack_roll:        s.attack_roll,
    target_type:        s.target_type || null,
    shape_type:         s.shape_type || null,
    shape_size:         s.shape_size || null,
    shape_size_unit:    s.shape_size_unit || null,
    classes:            strip(s.classes || []),
  })));

  // ── conditions ──────────────────────────────────────────────────────────────
  save('conditions.json', raw.conditions.map(c => ({
    index:       c.index,
    name:        c.name,
    description: c.description || null,
  })));

  // ── species ─────────────────────────────────────────────────────────────────
  // Build lookup: trait index → full description
  const traitByIndex = Object.fromEntries(raw.traits.map(t => [t.index, t]));

  // Build lookup: species index → enriched subspecies list
  const subsBySpecies = {};
  raw.subspecies.forEach(sub => {
    const parentIdx = sub.species?.index;
    if (!parentIdx) return;
    if (!subsBySpecies[parentIdx]) subsBySpecies[parentIdx] = [];
    subsBySpecies[parentIdx].push({
      index:       sub.index,
      name:        sub.name,
      damage_type: sub.damage_type?.name || null,
      traits: (sub.traits || []).map(ref => {
        const full = traitByIndex[ref.index] || {};
        return {
          index:       ref.index,
          name:        ref.name,
          level:       ref.level || null,
          description: full.description || null,
        };
      }),
    });
  });

  save('species.json', raw.species.map(sp => ({
    index: sp.index,
    name:  sp.name,
    type:  sp.type,
    size:  sp.size,
    speed: sp.speed,
    traits: (sp.traits || []).map(ref => {
      const full = traitByIndex[ref.index] || {};
      return {
        index:       ref.index,
        name:        ref.name,
        description: full.description || null,
      };
    }),
    subspecies: subsBySpecies[sp.index] || [],
  })));

  // ── classes ─────────────────────────────────────────────────────────────────
  // The 12 SRD class indices — used to separate class features from subclass features
  const CLASS_INDICES = new Set([
    'barbarian','bard','cleric','druid','fighter','monk',
    'paladin','ranger','rogue','sorcerer','warlock','wizard',
  ]);

  // Build lookup: class index → base class features (from Open5e ClassFeature.json)
  const baseFeaturesByClass = {};
  raw.classFeatures.forEach(({ pk, fields }) => {
    if (fields.feature_type === 'CORE_TRAITS_TABLE') return;
    const parent = (fields.parent || '').replace(/^srd-2024_/, '');
    if (!CLASS_INDICES.has(parent)) return; // skip subclass features
    if (!baseFeaturesByClass[parent]) baseFeaturesByClass[parent] = [];
    baseFeaturesByClass[parent].push({
      index:       pk.replace(/^srd-2024_/, ''),
      name:        fields.name,
      description: fields.desc || null,
    });
  });

  // Build lookup: class index → subclasses (from 5e-bits, which includes level data)
  const subcsByClass = {};
  raw.subclasses.forEach(sub => {
    const parentIdx = sub.class?.index;
    if (!parentIdx) return;
    if (!subcsByClass[parentIdx]) subcsByClass[parentIdx] = [];
    subcsByClass[parentIdx].push({
      index:       sub.index,
      name:        sub.name,
      summary:     sub.summary || null,
      description: sub.description || null,
      features: (sub.features || []).map(f => ({
        name:        f.name,
        level:       f.level,
        description: f.description || null,
      })),
    });
  });

  save('classes.json', raw.classes.map(cls => ({
    index:               cls.index,
    name:                cls.name,
    hit_die:             cls.hit_die,
    primary_ability:     cls.primary_ability?.desc || null,
    saving_throws:       (cls.saving_throws || []).map(st => st.name || st),
    skill_choices: {
      choose: cls.proficiency_choices?.[0]?.choose || 2,
      from: (cls.proficiency_choices?.[0]?.from?.options || [])
        .map(o => (o.item?.name || o.name || '').replace('Skill: ', ''))
        .filter(Boolean),
    },
    spellcasting_ability: cls.spellcasting?.spellcasting_ability?.name || null,
    features:            baseFeaturesByClass[cls.index] || [],
    subclasses:          subcsByClass[cls.index] || [],
  })));

  // ── backgrounds ─────────────────────────────────────────────────────────────
  save('backgrounds.json', raw.backgrounds.map(b => ({
    index:         b.index,
    name:          b.name,
    description:   desc(b.description || b.desc),
    ability_scores: (b.ability_scores || []).map(a => a.name || a),
    feat:           b.feat?.name || b.feat || null,
    proficiencies:  (b.proficiencies || []).map(p => p.name || p),
  })));

  // ── feats ────────────────────────────────────────────────────────────────────
  save('feats.json', raw.feats.map(f => ({
    index:              f.index,
    name:               f.name,
    type:               f.type || null,
    repeatable:         f.repeatable || false,
    prerequisite_level: f.prerequisites?.minimum_level || null,
    description:        desc(f.description || f.desc),
  })));

  // ── equipment ────────────────────────────────────────────────────────────────
  save('equipment.json', raw.equipment.map(e => ({
    index:       e.index,
    name:        e.name,
    categories:  (e.equipment_categories || []).map(c => c.name || c),
    cost:        e.cost ? `${e.cost.quantity} ${e.cost.unit}` : null,
    weight:      e.weight || null,
    description: desc(e.description || e.desc),
  })));

  // ── magic items ──────────────────────────────────────────────────────────────
  save('magic-items.json', raw.magicItems.map(m => ({
    index:       m.index,
    name:        m.name,
    category:    m.equipment_category?.name || m.equipment_category || null,
    rarity:      m.rarity?.name || m.rarity || null,
    attunement:  m.attunement || false,
    variant:     m.variant || false,
    variants:    (m.variants || []).map(v => v.name || v),
    description: desc(m.desc || m.description),
  })));

  // ── weapon properties ────────────────────────────────────────────────────────
  save('weapon-properties.json', [
    ...raw.weaponProps.map(p => ({ ...p, mastery: false })),
    ...raw.masteryProps.map(p => ({ ...p, mastery: true })),
  ].map(p => ({
    index:       p.index,
    name:        p.name,
    mastery:     p.mastery,
    description: desc(p.description || p.desc),
  })));

  // ── creatures ────────────────────────────────────────────────────────────────
  // Build per-creature lookup maps from separate fixture files
  function buildPerParent(arr, mapper) {
    const map = {};
    arr.forEach(({ pk, fields }) => {
      const parent = (fields.parent || '').replace(/^srd-2024_/, '');
      if (!parent) return;
      if (!map[parent]) map[parent] = [];
      map[parent].push(mapper(fields));
    });
    return map;
  }

  const traitsByCreature = buildPerParent(raw.creatureTraits, f => ({
    name: f.name,
    desc: f.desc || null,
  }));

  const actionsByCreature = buildPerParent(raw.creatureActions, f => ({
    name:          f.name,
    desc:          f.desc || null,
    action_type:   f.action_type || 'ACTION',
    legendary_cost: f.legendary_cost || null,
    uses_type:     f.uses_type || null,
    uses_param:    f.uses_param || null,
  }));

  const SKILLS = [
    'acrobatics','animal_handling','arcana','athletics','deception',
    'history','insight','intimidation','investigation','medicine',
    'nature','perception','performance','persuasion','religion',
    'sleight_of_hand','stealth','survival',
  ];
  const ABILITIES = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
  const SHORT = { strength:'str', dexterity:'dex', constitution:'con',
                  intelligence:'int', wisdom:'wis', charisma:'cha' };

  save('creatures.json', fromFixture(raw.creatures).map(c => {
    const abilityScores = {};
    const savingThrows  = {};
    const skills        = {};

    ABILITIES.forEach(ab => {
      abilityScores[SHORT[ab]] = c[`ability_score_${ab}`] ?? null;
      const sv = c[`saving_throw_${ab}`];
      if (sv != null) savingThrows[SHORT[ab]] = sv;
    });

    SKILLS.forEach(sk => {
      const val = c[`skill_bonus_${sk}`];
      if (val != null) skills[sk.replace(/_/g, '_')] = val;
    });

    return {
      index:            c.index,
      name:             c.name,
      type:             c.type,
      size:             c.size,
      alignment:        c.alignment,
      challenge_rating: parseFloat(c.challenge_rating) || 0,
      experience_points: c.experience_points_integer || null,
      armor_class:      c.armor_class,
      armor_detail:     c.armor_detail || null,
      hit_points:       c.hit_points,
      hit_dice:         c.hit_dice,
      initiative_bonus: c.initiative_bonus ?? null,
      proficiency_bonus: c.proficiency_bonus ?? null,
      ability_scores:   abilityScores,
      saving_throws:    savingThrows,
      skills,
      speeds: {
        walk:   c.walk   || null,
        fly:    c.fly    || null,
        swim:   c.swim   || null,
        climb:  c.climb  || null,
        burrow: c.burrow || null,
        hover:  c.hover  || false,
      },
      senses: {
        darkvision:        c.darkvision_range   || null,
        blindsight:        c.blindsight_range   || null,
        tremorsense:       c.tremorsense_range  || null,
        truesight:         c.truesight_range    || null,
        telepathy:         c.telepathy_range    || null,
        passive_perception: c.passive_perception || null,
      },
      damage_immunities:      c.damage_immunities || [],
      damage_resistances:     c.damage_resistances || [],
      damage_vulnerabilities: c.damage_vulnerabilities || [],
      condition_immunities:   c.condition_immunities || [],
      languages:              c.languages_desc || null,
      nonmagical_attack_resistance: c.nonmagical_attack_resistance || false,
      nonmagical_attack_immunity:   c.nonmagical_attack_immunity   || false,
      special_abilities: traitsByCreature[c.index]  || [],
      actions:           actionsByCreature[c.index] || [],
    };
  }));

  console.log('\nAll files written to srd2024/');
}

main().catch(e => { console.error('\nFatal:', e.message); process.exit(1); });
