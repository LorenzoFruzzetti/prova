"""Goblin creature factory.

Standard D&D 5e SRD goblin stat block. Run from the project root with:
    python -m src.creatures.goblin
"""
from src.character_sheet import AbilityScores, Attack, CharacterSheet


def create_goblin() -> CharacterSheet:
    """Build a fresh Goblin instance with default SRD stats."""
    return CharacterSheet(
        name="Goblin",
        creature_type="humanoid (goblinoid)",
        size="Small",
        armor_class=15,        # leather armor + shield
        max_hit_points=7,      # 2d6 average
        hit_points=7,
        speed=30,
        abilities=AbilityScores(
            strength=8,
            dexterity=14,
            constitution=10,
            intelligence=10,
            wisdom=8,
            charisma=8,
        ),
        challenge_rating="1/4",
        skills={"Stealth": 6},
        senses=["darkvision 60 ft.", "passive Perception 9"],
        languages=["Common", "Goblin"],
        attacks=[
            Attack(
                name="Scimitar",
                attack_bonus=4,
                damage_dice="1d6+2",
                damage_type="slashing",
                reach="5 ft.",
            ),
            Attack(
                name="Shortbow",
                attack_bonus=4,
                damage_dice="1d6+2",
                damage_type="piercing",
                reach="80/320 ft.",
            ),
        ],
        traits=[
            "Nimble Escape: The goblin can take the Disengage or Hide action "
            "as a bonus action on each of its turns.",
        ],
    )


if __name__ == "__main__":
    # Quick smoke run: print the goblin stat block.
    print(create_goblin())
