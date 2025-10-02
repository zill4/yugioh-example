/**
 * Battle Engine
 * Handles all battle-related logic separated from main game engine
 */

import type { PlayerState, CardInPlay } from "../types/GameTypes";
import { calculateBattleOutcome } from "../utils/BattleCalculator";
import { findCardById, findCardZoneIndex } from "../utils/CardStateUtils";

export interface BattleResult {
  success: boolean;
  damage: number;
  attackerSurvives: boolean;
  defenderSurvives: boolean;
  message: string;
  updatedAttackerState?: PlayerState;
  updatedDefenderState?: PlayerState;
}

export class BattleEngine {
  /**
   * Execute an attack between two monsters
   */
  public executeAttack(
    attackerId: string,
    targetZoneIndex: number | undefined,
    attackerState: PlayerState,
    defenderState: PlayerState
  ): BattleResult {
    // Find attacker
    const attacker = findCardById(attackerState, attackerId);
    if (!attacker) {
      return {
        success: false,
        damage: 0,
        attackerSurvives: true,
        defenderSurvives: true,
        message: "Attacker not found",
      };
    }

    // Find defender (null for direct attack)
    const defender =
      targetZoneIndex !== undefined
        ? defenderState.zones.mainMonsterZones[targetZoneIndex]
        : null;

    // Calculate battle outcome
    const outcome = calculateBattleOutcome(attacker, defender);

    // Apply battle results
    let newAttackerState = attackerState;
    let newDefenderState = defenderState;

    // Mark attacker as having attacked
    const attackerZoneIndex = findCardZoneIndex(attackerState, attackerId);
    if (attackerZoneIndex !== -1) {
      newAttackerState = this.markCardAsAttacked(
        attackerState,
        attackerZoneIndex
      );
    }

    // Handle attacker destruction
    if (!outcome.attackerSurvives && attackerZoneIndex !== -1) {
      newAttackerState = this.destroyMonster(
        newAttackerState,
        attackerZoneIndex
      );
    }

    // Handle defender destruction
    if (
      defender &&
      targetZoneIndex !== undefined &&
      !outcome.defenderSurvives
    ) {
      newDefenderState = this.destroyMonster(newDefenderState, targetZoneIndex);
    }

    // Apply damage to the correct player
    if (outcome.damage > 0) {
      // Damage goes to defender when attacker wins or direct attack
      // Damage goes to attacker when defender wins
      if (
        outcome.result === "attacker_wins" ||
        outcome.result === "direct_attack"
      ) {
        newDefenderState = {
          ...newDefenderState,
          lifePoints: newDefenderState.lifePoints - outcome.damage,
        };
      } else if (outcome.result === "defender_wins") {
        newAttackerState = {
          ...newAttackerState,
          lifePoints: newAttackerState.lifePoints - outcome.damage,
        };
      }
      // mutual_destruction does no damage
    }

    return {
      success: true,
      damage: outcome.damage,
      attackerSurvives: outcome.attackerSurvives,
      defenderSurvives: outcome.defenderSurvives,
      message: outcome.message,
      updatedAttackerState: newAttackerState,
      updatedDefenderState: newDefenderState,
    };
  }

  /**
   * Mark a card as having attacked this turn
   */
  private markCardAsAttacked(
    playerState: PlayerState,
    zoneIndex: number
  ): PlayerState {
    const zones = { ...playerState.zones };
    const zoneArray = zones.mainMonsterZones as (CardInPlay | null)[];
    const newZoneArray = [...zoneArray];

    if (newZoneArray[zoneIndex]) {
      newZoneArray[zoneIndex] = {
        ...newZoneArray[zoneIndex]!,
        attackUsed: true,
      };
    }

    zones.mainMonsterZones = newZoneArray;
    return { ...playerState, zones };
  }

  /**
   * Destroy a monster and move it to graveyard
   */
  private destroyMonster(
    playerState: PlayerState,
    zoneIndex: number
  ): PlayerState {
    const zones = { ...playerState.zones };
    const zoneArray = zones.mainMonsterZones as (CardInPlay | null)[];
    const newZoneArray = [...zoneArray];
    const destroyedCard = newZoneArray[zoneIndex];

    if (!destroyedCard) return playerState;

    newZoneArray[zoneIndex] = null;
    zones.mainMonsterZones = newZoneArray;

    return {
      ...playerState,
      zones,
      graveyard: [...playerState.graveyard, destroyedCard],
    };
  }

  /**
   * Reset all monsters' attack flags
   */
  public resetMonsterAttacks(playerState: PlayerState): PlayerState {
    const zones = { ...playerState.zones };
    const mainMonsterZones = zones.mainMonsterZones.map((monster) =>
      monster ? { ...monster, attackUsed: false } : null
    );
    zones.mainMonsterZones = mainMonsterZones;

    return { ...playerState, zones };
  }

  /**
   * Reset summoning sickness on all monsters
   */
  public resetSummoningSickness(playerState: PlayerState): PlayerState {
    const zones = { ...playerState.zones };
    const mainMonsterZones = zones.mainMonsterZones.map((monster) =>
      monster ? { ...monster, summonedThisTurn: false } : null
    );
    zones.mainMonsterZones = mainMonsterZones;

    return { ...playerState, zones };
  }
}
