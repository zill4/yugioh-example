/**
 * Phase Manager
 * Handles game phase transitions and phase-specific logic
 */

import type { GamePhase, PlayerState } from "../types/GameTypes";
import { GameConstants } from "../utils/GameConstants";

export class PhaseManager {
  private readonly phases: readonly GamePhase[] = GameConstants.PHASES;

  /**
   * Get the next phase in the sequence
   */
  public getNextPhase(currentPhase: GamePhase): GamePhase {
    const currentIndex = this.phases.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % this.phases.length;
    return this.phases[nextIndex];
  }

  /**
   * Check if we should end the turn (transitioning from last phase)
   */
  public shouldEndTurn(currentPhase: GamePhase): boolean {
    const currentIndex = this.phases.indexOf(currentPhase);
    return currentIndex === this.phases.length - 1;
  }

  /**
   * Apply phase entry logic
   */
  public onPhaseEnter(phase: GamePhase, playerState: PlayerState): PlayerState {
    switch (phase) {
      case "Main":
        return this.onMainPhaseEnter(playerState);
      case "Battle":
        return this.onBattlePhaseEnter(playerState);
      default:
        return playerState;
    }
  }

  /**
   * Main Phase entry logic
   */
  private onMainPhaseEnter(playerState: PlayerState): PlayerState {
    // Reset attack usage when entering main phase
    const zones = { ...playerState.zones };
    const mainMonsterZones = zones.mainMonsterZones.map((monster) =>
      monster ? { ...monster, attackUsed: false } : null
    );
    zones.mainMonsterZones = mainMonsterZones;

    return {
      ...playerState,
      zones,
      hasSetMonster: false, // Reset set monster flag
    };
  }

  /**
   * Battle Phase entry logic
   */
  private onBattlePhaseEnter(playerState: PlayerState): PlayerState {
    // No special logic needed for battle phase entry currently
    return playerState;
  }

  /**
   * Apply phase exit logic
   */
  public onPhaseExit(playerState: PlayerState): PlayerState {
    // Can add phase-specific exit logic here if needed
    return playerState;
  }

  /**
   * Reset all phase-specific flags (called on turn end)
   */
  public resetPhaseFlags(playerState: PlayerState): PlayerState {
    const zones = { ...playerState.zones };

    // Reset attack usage and summoning sickness
    const mainMonsterZones = zones.mainMonsterZones.map((monster) =>
      monster
        ? { ...monster, attackUsed: false, summonedThisTurn: false }
        : null
    );
    zones.mainMonsterZones = mainMonsterZones;

    return {
      ...playerState,
      zones,
      hasNormalSummoned: false,
      hasSetMonster: false,
    };
  }
}
