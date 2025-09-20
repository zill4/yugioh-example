// Game Phases according to Yu-Gi-Oh! rules
export type GamePhase =
  | "Draw"
  | "Standby"
  | "Main1"
  | "Battle"
  | "Main2"
  | "End";

// Player types
export type PlayerType = "human" | "ai";

// Card positions on the field
export type CardPosition =
  | "hand"
  | "monster"
  | "spellTrap"
  | "graveyard"
  | "banished"
  | "extraDeck"
  | "mainDeck"
  | "field";

// Battle positions for monsters
export type BattlePosition = "attack" | "defense";

// Card face orientation
export type CardFace = "face-up" | "face-down";

// Spell speeds for chain resolution
export type SpellSpeed = 1 | 2 | 3;

// Chain link for effect resolution
export interface ChainLink {
  id: string;
  cardId: string;
  player: "player" | "opponent";
  spellSpeed: SpellSpeed;
  effect: string;
  resolved: boolean;
}

// Effect activation cost
export interface EffectCost {
  type: "life_points" | "discard" | "tribute" | "remove_counter" | "mill";
  value?: number;
  cards?: string[]; // Card IDs for discard/tribute
  counterType?: string; // For counter removal
}

// Game zones structure
export interface GameZones {
  // Main Monster Zones (5 zones)
  mainMonsterZones: (CardInPlay | null)[];

  // Extra Monster Zone (2 zones, shared)
  extraMonsterZones: (CardInPlay | null)[];

  // Spell & Trap Zones (5 zones, leftmost and rightmost can be Pendulum Zones)
  spellTrapZones: (CardInPlay | null)[];

  // Field Zone (1 zone)
  fieldZone: CardInPlay | null;

  // Pendulum Zones (leftmost and rightmost Spell & Trap Zones when occupied by Pendulum monsters)
  pendulumZones: {
    left: CardInPlay | null;
    right: CardInPlay | null;
  };
}

// Monster types and categories
export type MonsterCategory =
  | "Normal"
  | "Effect"
  | "Ritual"
  | "Fusion"
  | "Synchro"
  | "Xyz"
  | "Pendulum"
  | "Link"
  | "Token";

// Monster effects types
export type EffectType =
  | "Continuous"
  | "Ignition"
  | "Trigger"
  | "Quick"
  | "Flip";

// Spell card types
export type SpellType =
  | "Normal"
  | "Quick-Play"
  | "Continuous"
  | "Ritual"
  | "Field"
  | "Equip";

// Trap card types
export type TrapType = "Normal" | "Continuous" | "Counter";

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

// Base game card interface
export interface GameCard {
  id: string;
  name: string;
  type: "monster" | "spell" | "trap";
  attack?: number;
  defense?: number;
  level?: number;
  rank?: number; // For Xyz monsters
  linkRating?: number; // For Link monsters
  pendulumScale?: number; // For Pendulum monsters
  attribute?: Attribute;
  monsterType?: MonsterType;
  monsterCategory?: MonsterCategory;
  spellType?: SpellType;
  trapType?: TrapType;
  effectType?: EffectType;
  effect?: string;
  materials?: string[]; // For Extra Deck monsters
  linkArrows?: LinkArrow[];
  imageUrl?: string;
}

// Card in play with additional game state
export interface CardInPlay extends GameCard {
  position: CardPosition;
  zoneIndex?: number; // For monster/spell zones (0-4)
  battlePosition?: BattlePosition;
  faceDown?: boolean;
  faceUp?: boolean; // Derived from faceDown
  attackUsed?: boolean; // Whether monster has attacked this turn
  summonedThisTurn?: boolean; // Whether monster was summoned this turn
  counters?: { [key: string]: number }; // For cards that use counters
}

// Player state with all zones
export interface PlayerState {
  lifePoints: number;
  hand: GameCard[];
  zones: GameZones;
  graveyard: GameCard[];
  banished: GameCard[];
  extraDeck: GameCard[];
  mainDeck: GameCard[];
  hasNormalSummoned?: boolean; // Track if player has normal summoned this turn
  hasSetMonster?: boolean; // Track if player has set a monster this turn
  canAttack?: boolean; // Track if player can attack this turn
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
  chains: ChainLink[]; // Active chains
  pendingEffects: PendingEffect[]; // Effects waiting to be resolved
}

// Pending effects for timing resolution
export interface PendingEffect {
  id: string;
  cardId: string;
  player: "player" | "opponent";
  trigger: string; // What triggered this effect
  effect: string;
  canActivate: boolean;
}

// Game actions
export interface GameAction {
  type:
    | "PLAY_CARD"
    | "ATTACK"
    | "CHANGE_PHASE"
    | "END_TURN"
    | "DIRECT_ATTACK"
    | "ACTIVATE_EFFECT"
    | "NORMAL_SUMMON"
    | "SET_MONSTER"
    | "SPECIAL_SUMMON"
    | "SET_CARD"
    | "CHANGE_POSITION";
  player: "player" | "opponent";
  cardId?: string;
  targetId?: string;
  zoneIndex?: number;
  targetZoneIndex?: number;
  effectId?: string;
  cost?: any; // For effects that require costs
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
