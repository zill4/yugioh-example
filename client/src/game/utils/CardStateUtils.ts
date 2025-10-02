/**
 * Card State Utilities
 * Helper functions to check card states and validity
 */

import type { CardInPlay, GameState, PlayerState } from "../types/GameTypes";

/**
 * Check if a card can attack this turn
 */
export function canAttack(card: CardInPlay, gameState: GameState): boolean {
  // Must be in monster position
  if (card.position !== "monster") return false;

  // Must be face-up
  if (card.faceDown) return false;

  // Cannot attack if already attacked this turn
  if (card.attackUsed) return false;

  // Cannot attack if summoned this turn (summoning sickness)
  if (card.summonedThisTurn) return false;

  // Must be in battle phase or main phase
  if (!["Main", "Battle"].includes(gameState.currentPhase)) return false;

  return true;
}

/**
 * Check if a card can be played from hand
 */
export function isPlayable(card: any, playerState: PlayerState): boolean {
  // Only monsters in this simplified version
  if (card.cardType !== "Monster") return false;

  // Must have an empty monster zone
  const hasEmptyZone = playerState.zones.mainMonsterZones.some(
    (zone) => zone === null
  );
  if (!hasEmptyZone) return false;

  // Check if already normal summoned this turn
  if (playerState.hasNormalSummoned) return false;

  return true;
}

/**
 * Check if a card is a valid attack target
 */
export function isTargetable(
  target: CardInPlay,
  attacker: CardInPlay,
  gameState: GameState
): boolean {
  // Cannot target face-down cards (in this simplified version)
  if (target.faceDown) return false;

  // Cannot target your own cards
  const isOpponentCard = gameState.opponent.zones.mainMonsterZones.some(
    (card) => card?.id === target.id
  );

  return isOpponentCard;
}

/**
 * Get all valid attack targets for a card
 */
export function getValidAttackTargets(
  attacker: CardInPlay,
  opponent: PlayerState
): CardInPlay[] {
  const targets: CardInPlay[] = [];

  // Get all opponent's monsters
  const opponentMonsters = opponent.zones.mainMonsterZones.filter(
    (card): card is CardInPlay => card !== null && !card.faceDown
  );

  // If opponent has monsters, they must be targeted
  if (opponentMonsters.length > 0) {
    return opponentMonsters;
  }

  // If no monsters, can attack directly (represented as empty array)
  // Direct attack is handled separately
  return [];
}

/**
 * Check if direct attack is allowed
 */
export function canDirectAttack(
  attacker: CardInPlay,
  opponent: PlayerState
): boolean {
  // Can only direct attack if opponent has no monsters
  const opponentHasMonsters = opponent.zones.mainMonsterZones.some(
    (card) => card !== null
  );

  return !opponentHasMonsters;
}

/**
 * Find empty monster zone index
 */
export function findEmptyMonsterZone(playerState: PlayerState): number {
  return playerState.zones.mainMonsterZones.findIndex((zone) => zone === null);
}

/**
 * Find card by ID in player's field
 */
export function findCardById(
  playerState: PlayerState,
  cardId: string
): CardInPlay | null {
  for (const card of playerState.zones.mainMonsterZones) {
    if (card?.id === cardId) return card;
  }
  return null;
}

/**
 * Find zone index of a card by ID
 */
export function findCardZoneIndex(
  playerState: PlayerState,
  cardId: string
): number {
  return playerState.zones.mainMonsterZones.findIndex(
    (card) => card?.id === cardId
  );
}
