/**
 * Battle Calculator
 * Handles all battle calculation logic
 */

import type { CardInPlay } from "../types/GameTypes";

export type BattleResult =
  | "attacker_wins"
  | "defender_wins"
  | "mutual_destruction"
  | "direct_attack";

export interface BattleOutcome {
  result: BattleResult;
  damage: number;
  attackerSurvives: boolean;
  defenderSurvives: boolean;
  message: string;
}

/**
 * Calculate the outcome of a battle between two monsters
 */
export function calculateBattleOutcome(
  attacker: CardInPlay,
  defender: CardInPlay | null
): BattleOutcome {
  // Direct attack case
  if (!defender) {
    return {
      result: "direct_attack",
      damage: attacker.attack || 0,
      attackerSurvives: true,
      defenderSurvives: false,
      message: `${attacker.name} attacks directly for ${attacker.attack} damage!`,
    };
  }

  const attackerAtk = attacker.attack || 0;
  const defenderAtk = defender.attack || 0;

  // Calculate who wins
  if (attackerAtk > defenderAtk) {
    // Attacker wins
    return {
      result: "attacker_wins",
      damage: attackerAtk - defenderAtk,
      attackerSurvives: true,
      defenderSurvives: false,
      message: `${attacker.name} destroyed ${defender.name}! ${
        attackerAtk - defenderAtk
      } damage dealt.`,
    };
  } else if (defenderAtk > attackerAtk) {
    // Defender wins
    return {
      result: "defender_wins",
      damage: defenderAtk - attackerAtk,
      attackerSurvives: false,
      defenderSurvives: true,
      message: `${defender.name} destroyed ${attacker.name}! ${
        defenderAtk - attackerAtk
      } damage dealt.`,
    };
  } else {
    // Equal attack - mutual destruction
    return {
      result: "mutual_destruction",
      damage: 0,
      attackerSurvives: false,
      defenderSurvives: false,
      message: `${attacker.name} and ${defender.name} destroyed each other!`,
    };
  }
}

/**
 * Calculate damage dealt in a battle
 */
export function calculateDamage(
  attacker: CardInPlay,
  defender: CardInPlay | null
): number {
  if (!defender) {
    return attacker.attack || 0;
  }

  const attackerAtk = attacker.attack || 0;
  const defenderAtk = defender.attack || 0;

  // Only deal damage if there's a difference
  return Math.abs(attackerAtk - defenderAtk);
}

/**
 * Determine who wins the battle
 */
export function determineBattleWinner(
  attacker: CardInPlay,
  defender: CardInPlay | null
): "attacker" | "defender" | "draw" | "direct" {
  if (!defender) return "direct";

  const attackerAtk = attacker.attack || 0;
  const defenderAtk = defender.attack || 0;

  if (attackerAtk > defenderAtk) return "attacker";
  if (defenderAtk > attackerAtk) return "defender";
  return "draw";
}

/**
 * Get battle preview for UI display
 */
export function getBattlePreview(
  attacker: CardInPlay,
  defender: CardInPlay | null
) {
  const outcome = calculateBattleOutcome(attacker, defender);

  return {
    attacker,
    defender,
    attackerAtk: attacker.attack || 0,
    defenderAtk: defender?.attack || 0,
    damage: outcome.damage,
    result: outcome.result,
    resultText: outcome.message,
    resultColor:
      outcome.result === "attacker_wins" || outcome.result === "direct_attack"
        ? "text-green-600"
        : outcome.result === "defender_wins"
        ? "text-red-600"
        : "text-yellow-600",
    attackDifference: (attacker.attack || 0) - (defender?.attack || 0),
  };
}
