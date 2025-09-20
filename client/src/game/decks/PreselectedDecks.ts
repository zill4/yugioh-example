import type { GameCard } from "../types/GameTypes";
import { sampleCards } from "../../data/sampleCards";
import type { BaseCard } from "../../types/Card";

// Convert BaseCard to GameCard format
function convertToGameCard(baseCard: BaseCard): GameCard {
  let type: "monster" | "spell" | "trap";

  if (baseCard.cardType === "Monster") {
    type = "monster";
  } else if (baseCard.cardType === "Spell") {
    type = "spell";
  } else if (baseCard.cardType === "Trap") {
    type = "trap";
  } else {
    // Fallback based on properties
    if (baseCard.attack !== undefined || baseCard.defense !== undefined) {
      type = "monster";
    } else if (baseCard.spellType) {
      type = "spell";
    } else if (baseCard.trapType) {
      type = "trap";
    } else {
      type = "monster"; // Default fallback
    }
  }

  return {
    id: baseCard.id,
    name: baseCard.name,
    type,
    attack: baseCard.attack,
    defense: baseCard.defense,
    level: baseCard.level,
    attribute: baseCard.attribute,
    monsterType: baseCard.monsterType,
    cardType:
      baseCard.cardType ||
      (type === "monster"
        ? "Normal Monster"
        : type === "spell"
        ? baseCard.spellType
        : baseCard.trapType),
    effect: baseCard.description,
    imageUrl: baseCard.imageUrl,
  };
}

// Convert all sample cards to game cards
const gameCards = sampleCards.map(convertToGameCard);

// Filter cards by type
export const sampleMonsters = gameCards.filter(
  (card) => card.type === "monster"
);
export const sampleSpells = gameCards.filter((card) => card.type === "spell");
export const sampleTraps = gameCards.filter((card) => card.type === "trap");

// Preselected Player Deck (Blue-Eyes Deck)
export const playerDeck: GameCard[] = [
  ...sampleMonsters.slice(0, 3), // 3 Blue-Eyes, Dark Magician, Summoned Skull
  ...sampleMonsters.slice(3), // Celtic Guardian, Harpie Lady
  ...sampleSpells.slice(0, 3), // Dark Hole, Pot of Greed, MST
  ...sampleTraps.slice(0, 2), // Mirror Force, Torrential Tribute
];

// Preselected AI Deck (Mixed Deck)
export const aiDeck: GameCard[] = [
  ...sampleMonsters, // All monsters
  ...sampleSpells, // All spells
  ...sampleTraps, // All traps
];

// Shuffle function
export function shuffleDeck(deck: GameCard[]): GameCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
