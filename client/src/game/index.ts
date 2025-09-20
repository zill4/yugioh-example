// Main game exports
export { GameEngine } from "./engine/GameEngine";
export { DummyAI } from "./ai/DummyAI";
export { GameController } from "./GameController";

// Types
export type * from "./types/GameTypes";

// Decks
export { playerDeck, aiDeck, shuffleDeck } from "./decks/PreselectedDecks";
export type { GameCard } from "./types/GameTypes";
