import type { GameCard } from "../types/GameTypes";
import { sampleCards } from "../../data/sampleCards";
import type { BaseCard } from "../../types/Card";

// Convert BaseCard to GameCard format
function convertToGameCard(baseCard: BaseCard): GameCard {
  return {
    id: baseCard.id,
    name: baseCard.name,
    description: baseCard.description || "",
    cardType: baseCard.cardType || "Monster",
    level: baseCard.level || "0",
    attack: baseCard.attack || 0,
    defense: baseCard.defense || 0,
    rarity: baseCard.rarity || "Common",
    price: baseCard.price || 0,
    cardNumber: baseCard.cardNumber || "",
    imageUrl: baseCard.imageUrl || "",
    suit: baseCard.suit || "spades",
  };
}

// Convert all sample cards to game cards (all are normal monsters now)
const gameCards = sampleCards.map(convertToGameCard);

// All cards are monsters in our simplified game
export const sampleMonsters = gameCards;

// Preselected Player Deck (first half of monsters)
export const playerDeck: GameCard[] = sampleMonsters.slice(
  0,
  Math.ceil(sampleMonsters.length / 2)
);

// Preselected AI Deck - limit AI to weaker cards (attack <= 800)
// This makes the game more balanced and gives the player a fair chance
export const aiDeck: GameCard[] = sampleMonsters.filter(
  (card) => card.attack <= 800
);

// Shuffle function
export function shuffleDeck(deck: GameCard[]): GameCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
