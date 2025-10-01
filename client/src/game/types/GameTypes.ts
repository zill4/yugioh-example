// Simplified Game Phases
export type GamePhase = "Main" | "Battle";

// Player types
export type PlayerType = "human" | "ai";

// Card positions on the field
export type CardPosition =
  | "hand"
  | "monster"
  | "graveyard"
  | "banished"
  | "mainDeck";

// Battle positions for monsters
export type BattlePosition = "attack" | "defense";

// Card face orientation
export type CardFace = "face-up" | "face-down";

// Game zones structure
export interface GameZones {
  // Main Monster Zones (5 zones)
  mainMonsterZones: (CardInPlay | null)[];
}

// Monster category (only Normal monsters supported)
export type MonsterCategory = "Normal";

// Card suits (Warlok system)
export type CardSuit = "hearts" | "diamonds" | "spades" | "clubs";

// Card levels (Warlok system - chess pieces and playing card ranks)
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

// Base game card interface (Warlok system)
export interface GameCard {
  id: string;
  name: string;
  description: string;
  cardType: string; // Always "Monster" for Warlok cards
  suit: CardSuit;
  level: CardLevel | string;
  attack: number;
  defense: number;
  rarity: string;
  price: number;
  cardNumber: string;
  imageUrl: string;
  timestamp?: string;
}

// Card in play with additional game state
export interface CardInPlay extends GameCard {
  position: CardPosition;
  zoneIndex?: number; // For monster zones (0-4)
  battlePosition?: BattlePosition;
  faceDown?: boolean;
  faceUp?: boolean; // Derived from faceDown
  attackUsed?: boolean; // Whether monster has attacked this turn
  summonedThisTurn?: boolean; // Whether monster was summoned this turn
}

// Player state with all zones
export interface PlayerState {
  lifePoints: number;
  hand: GameCard[];
  zones: GameZones;
  graveyard: GameCard[];
  banished: GameCard[];
  mainDeck: GameCard[];
  hasNormalSummoned?: boolean; // Track if player has normal summoned this turn
  hasSetMonster?: boolean; // Track if player has set a monster this turn
}

// Main game state
export interface GameState {
  currentPhase: GamePhase;
  currentTurn: "player" | "opponent";
  turnNumber: number;
  player: PlayerState;
  opponent: PlayerState;
  winner?: "player" | "opponent";
  gameLog: GameEvent[];
}

// Game actions (simplified for normal monsters only)
export interface GameAction {
  type:
    | "ATTACK"
    | "CHANGE_PHASE"
    | "END_TURN"
    | "DIRECT_ATTACK"
    | "NORMAL_SUMMON";
  player: "player" | "opponent";
  cardId?: string;
  targetId?: string;
  zoneIndex?: number;
  targetZoneIndex?: number;
}

// Game events for logging
export interface GameEvent {
  id: string;
  type:
    | "card_played"
    | "attack"
    | "damage"
    | "phase_change"
    | "turn_end"
    | "effect_activated"
    | "summon"
    | "chain_resolved"
    | "card_destroyed";
  player: "player" | "opponent";
  message: string;
  timestamp: number;
  data?: any; // Additional data for the event
}
