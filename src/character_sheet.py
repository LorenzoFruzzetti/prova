"""Character sheet data structures for tabletop-style creatures.

This module defines a minimal D&D 5e-flavored character sheet that can be
reused for any creature. To add a new creature, create a factory function
in src/creatures/ that returns a populated CharacterSheet.
"""
from dataclasses import dataclass, field


@dataclass
class AbilityScores:
    """The six core ability scores. Modifiers are derived, not stored."""

    strength: int
    dexterity: int
    constitution: int
    intelligence: int
    wisdom: int
    charisma: int

    @staticmethod
    def modifier(score: int) -> int:
        # D&D 5e ability modifier formula: floor((score - 10) / 2).
        return (score - 10) // 2


@dataclass
class Attack:
    """A single attack option (melee or ranged)."""

    name: str
    attack_bonus: int
    damage_dice: str   # e.g. "1d6+2"
    damage_type: str   # e.g. "slashing", "piercing", "fire"
    reach: str         # e.g. "5 ft." for melee, "80/320 ft." for ranged


@dataclass
class CharacterSheet:
    """A minimal, extensible creature stat block.

    Fields are kept flat and serializable so they're easy to dump to JSON,
    diff between creatures, or feed into a behavior tree blackboard later.
    """

    name: str
    creature_type: str        # e.g. "humanoid (goblinoid)"
    size: str                 # e.g. "Small", "Medium"
    armor_class: int
    max_hit_points: int
    hit_points: int           # current HP, normally starts equal to max
    speed: int                # walking speed in feet
    abilities: AbilityScores
    challenge_rating: str = "0"
    skills: dict[str, int] = field(default_factory=dict)
    senses: list[str] = field(default_factory=list)
    languages: list[str] = field(default_factory=list)
    attacks: list[Attack] = field(default_factory=list)
    traits: list[str] = field(default_factory=list)

    def __str__(self) -> str:
        # Render a stat-block-style summary similar to a Monster Manual entry.
        mod = AbilityScores.modifier
        a = self.abilities
        sep = "-" * 44
        lines = [
            self.name,
            f"{self.size} {self.creature_type}",
            sep,
            f"Armor Class  {self.armor_class}",
            f"Hit Points   {self.hit_points} / {self.max_hit_points}",
            f"Speed        {self.speed} ft.",
            sep,
            (
                f"STR {a.strength:>2} ({mod(a.strength):+d})   "
                f"DEX {a.dexterity:>2} ({mod(a.dexterity):+d})   "
                f"CON {a.constitution:>2} ({mod(a.constitution):+d})"
            ),
            (
                f"INT {a.intelligence:>2} ({mod(a.intelligence):+d})   "
                f"WIS {a.wisdom:>2} ({mod(a.wisdom):+d})   "
                f"CHA {a.charisma:>2} ({mod(a.charisma):+d})"
            ),
            sep,
        ]
        if self.skills:
            skills_str = ", ".join(f"{name} {bonus:+d}" for name, bonus in self.skills.items())
            lines.append(f"Skills       {skills_str}")
        if self.senses:
            lines.append(f"Senses       {', '.join(self.senses)}")
        if self.languages:
            lines.append(f"Languages    {', '.join(self.languages)}")
        lines.append(f"Challenge    {self.challenge_rating}")
        if self.traits:
            lines.append(sep)
            lines.append("Traits")
            for trait in self.traits:
                lines.append(f"  - {trait}")
        if self.attacks:
            lines.append(sep)
            lines.append("Actions")
            for atk in self.attacks:
                lines.append(
                    f"  - {atk.name}: {atk.attack_bonus:+d} to hit, "
                    f"reach {atk.reach}, {atk.damage_dice} {atk.damage_type}"
                )
        return "\n".join(lines)
