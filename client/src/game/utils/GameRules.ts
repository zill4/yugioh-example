/**
 * Game Rules Validator
 * Validates all game actions according to the rules
 */

import type {
  GameState,
  PlayerState,
  GameCard,
  CardInPlay,
} from "../types/GameTypes";
import { GameConstants } from "./GameConstants";
import {
  canAttack,
  isPlayable,
  canDirectAttack,
  findCardById,
} from "./CardStateUtils";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate if a card can be normal summoned
 */
export function validateSummon(
  card: GameCard,
  playerState: PlayerState,
  gameState: GameState,
  player: "player" | "opponent" = "player"
): ValidationResult {
  // Must be that player's turn
  if (gameState.currentTurn !== player) {
    return { valid: false, error: "Not your turn" };
  }

  // Must be in Main phase
  if (gameState.currentPhase !== "Main") {
    return { valid: false, error: "Can only summon in Main Phase" };
  }

  // Must be a monster
  if (card.cardType !== "Monster") {
    return { valid: false, error: "Can only summon monsters" };
  }

  // Check if already normal summoned this turn
  if (playerState.hasNormalSummoned) {
    return { valid: false, error: "Already summoned this turn" };
  }

  // Must have empty monster zone
  const hasEmptyZone = playerState.zones.mainMonsterZones.some(
    (zone) => zone === null
  );
  if (!hasEmptyZone) {
    return { valid: false, error: "No empty monster zones" };
  }

  // Must have card in hand
  const cardInHand = playerState.hand.some((c) => c.id === card.id);
  if (!cardInHand) {
    return { valid: false, error: "Card not in hand" };
  }

  return { valid: true };
}

/**
 * Validate if a card can attack
 */
export function validateAttack(
  attackerId: string,
  targetZoneIndex: number | undefined,
  gameState: GameState,
  player: "player" | "opponent" = "player"
): ValidationResult {
  const playerKey = player === "player" ? "player" : "opponent";
  const opponentKey = player === "player" ? "opponent" : "player";
  const playerState = gameState[playerKey];
  const opponentState = gameState[opponentKey];

  // Must be that player's turn
  if (gameState.currentTurn !== player) {
    return { valid: false, error: "Not your turn" };
  }

  // Must be in Main or Battle phase
  if (!["Main", "Battle"].includes(gameState.currentPhase)) {
    return { valid: false, error: "Can only attack in Main or Battle Phase" };
  }

  // Find attacker
  const attacker = findCardById(playerState, attackerId);
  if (!attacker) {
    return { valid: false, error: "Attacker not found" };
  }

  // Check if card can attack
  if (!canAttack(attacker, gameState)) {
    if (attacker.attackUsed) {
      return { valid: false, error: "Monster already attacked this turn" };
    }
    if (attacker.summonedThisTurn) {
      return { valid: false, error: "Monster has summoning sickness" };
    }
    return { valid: false, error: "Monster cannot attack" };
  }

  // Check targeting
  const opponentHasMonsters = opponentState.zones.mainMonsterZones.some(
    (card) => card !== null
  );

  if (opponentHasMonsters && targetZoneIndex === undefined) {
    return { valid: false, error: "Must target an opponent monster" };
  }

  if (!opponentHasMonsters && targetZoneIndex !== undefined) {
    return {
      valid: false,
      error: "Cannot target monsters when opponent has none",
    };
  }

  // Validate target if targeting a monster
  if (targetZoneIndex !== undefined) {
    const target = opponentState.zones.mainMonsterZones[targetZoneIndex];
    if (!target) {
      return { valid: false, error: "Invalid target" };
    }
  }

  return { valid: true };
}

/**
 * Validate direct attack
 */
export function validateDirectAttack(
  attackerId: string,
  gameState: GameState,
  player: "player" | "opponent" = "player"
): ValidationResult {
  const playerKey = player === "player" ? "player" : "opponent";
  const opponentKey = player === "player" ? "opponent" : "player";
  const playerState = gameState[playerKey];
  const opponentState = gameState[opponentKey];

  // Find attacker
  const attacker = findCardById(playerState, attackerId);
  if (!attacker) {
    return { valid: false, error: "Attacker not found" };
  }

  // Check if card can attack
  if (!canAttack(attacker, gameState)) {
    return { valid: false, error: "Monster cannot attack" };
  }

  // Check if direct attack is allowed
  if (!canDirectAttack(attacker, opponentState)) {
    return {
      valid: false,
      error: "Cannot direct attack while opponent has monsters",
    };
  }

  return { valid: true };
}

/**
 * Validate phase change
 */
export function validatePhaseChange(
  gameState: GameState,
  player: "player" | "opponent" = "player"
): ValidationResult {
  // Must be that player's turn
  if (gameState.currentTurn !== player) {
    return { valid: false, error: "Not your turn" };
  }

  return { valid: true };
}

/**
 * Validate end turn
 */
export function validateEndTurn(
  gameState: GameState,
  player: "player" | "opponent" = "player"
): ValidationResult {
  // Must be that player's turn
  if (gameState.currentTurn !== player) {
    return { valid: false, error: "Not your turn" };
  }

  return { valid: true };
}
