export type GamePhase = "Draw" | "Main1" | "Battle" | "Main2" | "End";

export type PlayerType = "human" | "ai";

export type CardPosition =
  | "hand"
  | "monster"
  | "spellTrap"
  | "graveyard"
  | "banished"
  | "extraDeck"
  | "mainDeck";

export type BattlePosition = "attack" | "defense";

export interface GameCard {
  id: string;
  name: string;
  type: "monster" | "spell" | "trap";
  attack?: number;
  defense?: number;
  level?: number;
  attribute?: string;
  monsterType?: string;
  cardType?: string;
  effect?: string;
  imageUrl?: string;
}

export interface CardInPlay extends GameCard {
  position: CardPosition;
  zoneIndex?: number; // For monster/spell zones (0-4)
  battlePosition?: BattlePosition;
  faceDown?: boolean;
}

export interface PlayerState {
  lifePoints: number;
  hand: GameCard[];
  monsterZones: (CardInPlay | null)[];
  spellTrapZones: (CardInPlay | null)[];
  graveyard: GameCard[];
  banished: GameCard[];
  extraDeck: GameCard[];
  mainDeck: GameCard[];
  currentMana?: number; // For spell cards
}

export interface GameState {
  currentPhase: GamePhase;
  currentTurn: "player" | "opponent";
  turnNumber: number;
  player: PlayerState;
  opponent: PlayerState;
  fieldSpell?: GameCard;
  winner?: "player" | "opponent";
  gameLog: GameEvent[];
}

export interface GameAction {
  type: "PLAY_CARD" | "ATTACK" | "CHANGE_PHASE" | "END_TURN" | "DIRECT_ATTACK";
  player: "player" | "opponent";
  cardId?: string;
  targetId?: string;
  zoneIndex?: number;
}

export interface GameEvent {
  id: string;
  type: "card_played" | "attack" | "damage" | "phase_change" | "turn_end";
  player: "player" | "opponent";
  message: string;
  timestamp: number;
}
