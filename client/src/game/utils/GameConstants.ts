/**
 * Game Constants
 * All magic numbers and game configuration in one place
 */

export const GameConstants = {
  // Player Life Points
  STARTING_LIFE_POINTS: 2000,

  // Hand and Deck
  STARTING_HAND_SIZE: 5,
  MAX_HAND_SIZE: 7,

  // Field Zones
  MONSTER_ZONE_COUNT: 5,

  // Game Rules
  NORMAL_SUMMONS_PER_TURN: 1,
  CARDS_DRAWN_PER_TURN: 1,

  // Battle Rules
  SUMMONING_SICKNESS_TURNS: 1, // Must wait 1 turn before attacking
  ATTACKS_PER_TURN: 1, // Per monster

  // Turn Structure
  PHASES: ["Main", "Battle"] as const,

  // Win Conditions
  LOSE_ON_ZERO_LP: true,
  LOSE_ON_DECK_OUT: false, // Disabled - game only ends when LP reaches 0
} as const;

export type GamePhaseType = (typeof GameConstants.PHASES)[number];
