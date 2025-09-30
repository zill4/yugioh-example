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

// Card attributes
export type Attribute =
  | "DARK"
  | "LIGHT"
  | "WATER"
  | "FIRE"
  | "EARTH"
  | "WIND"
  | "DIVINE";

// Monster types
export type MonsterType =
  | "Warrior"
  | "Spellcaster"
  | "Dragon"
  | "Beast"
  | "Machine"
  | "Fiend"
  | "Zombie"
  | "Aqua"
  | "Pyro"
  | "Rock"
  | "Winged Beast"
  | "Plant"
  | "Insect"
  | "Thunder"
  | "Dinosaur"
  | "Sea Serpent"
  | "Reptile"
  | "Psychic"
  | "Divine-Beast"
  | "Creator God"
  | "Wyrm"
  | "Cyberse";

// Link arrows for Link monsters
export type LinkArrow =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

// Base game card interface (Normal monsters only)
export interface GameCard {
  id: string;
  name: string;
  type: "monster";
  attack: number;
  defense: number;
  level: number;
  attribute?: Attribute;
  monsterType?: MonsterType;
  monsterCategory: MonsterCategory; // Always "Normal"
  imageUrl?: string;
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
    | "NORMAL_SUMMON"
    | "SET_MONSTER"
    | "CHANGE_POSITION";
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
