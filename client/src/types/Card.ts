// Warlok Card Types inspired by playing cards and strategic gameplay

export type CardType = "Monster"; // All Warlok cards are monsters

export type CardSuit = "hearts" | "diamonds" | "spades" | "clubs";

export type CardLevel =
  | "pawn"
  | "knight"
  | "rook"
  | "queen"
  | "king" // Chess pieces
  | "A"
  | "K"
  | "Q"
  | "J" // Face cards
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"; // Number cards

export type Rarity =
  | "Common"
  | "Rare"
  | "Super Rare"
  | "Ultra Rare"
  | "Secret Rare"
  | "Ghost Rare";

export interface BaseCard {
  id: string;
  name: string;
  description: string;
  cardType: string;
  suit: CardSuit;
  level: CardLevel | string; // Can be chess pieces, face cards, or numbers
  attack: number;
  defense: number;
  rarity: string;
  price: number;
  cardNumber: string;
  imageUrl: string;
  timestamp?: string;
}

export interface MonsterCard extends BaseCard {
  cardType: "Monster";
  suit: CardSuit;
  level: CardLevel | string;
  attack: number;
  defense: number;
}

export type Card = MonsterCard;

// Chess-inspired strategic elements for deck building
export interface DeckStrategy {
  name: string;
  description: string;
  keyCards: string[];
  winCondition: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

// User Account Types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  profile: UserProfile;
}

export interface UserProfile {
  displayName: string;
  avatar?: string;
  bio?: string;
  favoriteCard?: string;
  duelistLevel: number;
  totalWins: number;
  totalLosses: number;
  favoriteDeck?: string;
}

export interface Deck {
  id: string;
  name: string;
  userId: string;
  cards: DeckCard[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  strategy?: DeckStrategy;
  tags: string[];
}

export interface DeckCard {
  cardId: string;
  quantity: number;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  favoriteCardType: string;
  decksCreated: number;
  lastActive: string;
}
