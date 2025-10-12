/**
 * Game Simulator
 * Allows AI to simulate game states and evaluate moves without affecting real game
 */

import type { GameState, GameAction } from "../types/GameTypes";

export interface SimulationResult {
  action: GameAction;
  resultingState: GameState;
  score: number;
}

export class GameSimulator {
  /**
   * Simulate an action and return the resulting game state
   * This is a pure function that doesn't actually use GameEngine
   * Instead, it simulates the effect of actions directly on the state
   */
  public static simulateAction(
    currentState: GameState,
    action: GameAction
  ): GameState | null {
    try {
      // Clone the state to avoid mutations
      const newState = this.cloneGameState(currentState);

      // Simulate the action based on type
      switch (action.type) {
        case "NORMAL_SUMMON":
          return this.simulateNormalSummon(newState, action);
        case "ATTACK":
          return this.simulateAttack(newState, action);
        case "DIRECT_ATTACK":
          return this.simulateDirectAttack(newState, action);
        case "CHANGE_PHASE":
          return this.simulatePhaseChange(newState);
        case "END_TURN":
          return this.simulateEndTurn(newState);
        default:
          return null;
      }
    } catch (error) {
      console.error("Simulation error:", error);
      return null;
    }
  }

  /**
   * Simulate a normal summon
   */
  private static simulateNormalSummon(
    state: GameState,
    action: GameAction
  ): GameState | null {
    const playerKey = action.player === "player" ? "player" : "opponent";
    const playerState = state[playerKey];

    // Find the card
    const cardIndex = playerState.hand.findIndex((c) => c.id === action.cardId);
    if (cardIndex === -1) return null;

    // Check if already summoned
    if (playerState.hasNormalSummoned) return null;

    // Find empty zone
    const zoneIndex =
      action.zoneIndex ??
      playerState.zones.mainMonsterZones.findIndex((z) => z === null);
    if (zoneIndex === -1) return null;

    // Create new state
    const card = playerState.hand[cardIndex];
    const newHand = [...playerState.hand];
    newHand.splice(cardIndex, 1);

    const newZones = [...playerState.zones.mainMonsterZones];
    newZones[zoneIndex] = {
      ...card,
      position: "monster",
      zoneIndex,
      battlePosition: "attack",
      faceUp: true,
      summonedThisTurn: true,
      attackUsed: false,
    };

    return {
      ...state,
      [playerKey]: {
        ...playerState,
        hand: newHand,
        zones: { mainMonsterZones: newZones },
        hasNormalSummoned: true,
      },
    };
  }

  /**
   * Simulate an attack
   */
  private static simulateAttack(
    state: GameState,
    action: GameAction
  ): GameState | null {
    const attackerKey = action.player === "player" ? "player" : "opponent";
    const defenderKey = action.player === "player" ? "opponent" : "player";

    // Find attacker
    const attacker = state[attackerKey].zones.mainMonsterZones.find(
      (m) => m?.id === action.cardId
    );
    if (!attacker || attacker.attackUsed || attacker.summonedThisTurn)
      return null;

    // Find target
    const targetIndex = action.targetId ? parseInt(action.targetId) : -1;
    const defender = state[defenderKey].zones.mainMonsterZones[targetIndex];
    if (!defender) return null;

    // Calculate battle
    const newAttackerZones = [...state[attackerKey].zones.mainMonsterZones];
    const newDefenderZones = [...state[defenderKey].zones.mainMonsterZones];
    let newDefenderLP = state[defenderKey].lifePoints;

    const attackerIdx = newAttackerZones.findIndex(
      (m) => m?.id === action.cardId
    );
    if (attackerIdx !== -1 && newAttackerZones[attackerIdx]) {
      newAttackerZones[attackerIdx] = {
        ...newAttackerZones[attackerIdx]!,
        attackUsed: true,
      };
    }

    const attackerATK = attacker.attack || 0;
    const defenderDEF =
      defender.battlePosition === "defense"
        ? defender.defense || 0
        : defender.attack || 0;

    let newAttackerLP = state[attackerKey].lifePoints;

    if (attackerATK > defenderDEF) {
      // Attacker wins
      newDefenderZones[targetIndex] = null;
      if (defender.battlePosition === "attack") {
        newDefenderLP -= attackerATK - defenderDEF;
      }
    } else if (attackerATK < defenderDEF) {
      // Defender wins - attacker takes damage
      if (defender.battlePosition === "attack") {
        // Both monsters are in attack position - both destroyed
        newDefenderZones[targetIndex] = null;
        newAttackerZones[attackerIdx] = null;
      }
      // Attacker takes the damage
      newAttackerLP -= defenderDEF - attackerATK;
    } else {
      // Equal ATK - mutual destruction if both in attack mode
      if (defender.battlePosition === "attack") {
        newDefenderZones[targetIndex] = null;
        newAttackerZones[attackerIdx] = null;
      }
    }

    return {
      ...state,
      [attackerKey]: {
        ...state[attackerKey],
        zones: { mainMonsterZones: newAttackerZones },
        lifePoints: newAttackerLP,
      },
      [defenderKey]: {
        ...state[defenderKey],
        zones: { mainMonsterZones: newDefenderZones },
        lifePoints: newDefenderLP,
      },
    };
  }

  /**
   * Simulate a direct attack
   */
  private static simulateDirectAttack(
    state: GameState,
    action: GameAction
  ): GameState | null {
    const attackerKey = action.player === "player" ? "player" : "opponent";
    const defenderKey = action.player === "player" ? "opponent" : "player";

    // Find attacker
    const attacker = state[attackerKey].zones.mainMonsterZones.find(
      (m) => m?.id === action.cardId
    );
    if (!attacker || attacker.attackUsed || attacker.summonedThisTurn)
      return null;

    // Check no opponent monsters
    const hasMonsters = state[defenderKey].zones.mainMonsterZones.some(
      (m) => m !== null
    );
    if (hasMonsters) return null;

    const newAttackerZones = [...state[attackerKey].zones.mainMonsterZones];
    const attackerIdx = newAttackerZones.findIndex(
      (m) => m?.id === action.cardId
    );
    if (attackerIdx !== -1 && newAttackerZones[attackerIdx]) {
      newAttackerZones[attackerIdx] = {
        ...newAttackerZones[attackerIdx]!,
        attackUsed: true,
      };
    }

    return {
      ...state,
      [attackerKey]: {
        ...state[attackerKey],
        zones: { mainMonsterZones: newAttackerZones },
      },
      [defenderKey]: {
        ...state[defenderKey],
        lifePoints: state[defenderKey].lifePoints - (attacker.attack || 0),
      },
    };
  }

  /**
   * Simulate phase change
   */
  private static simulatePhaseChange(state: GameState): GameState {
    const nextPhase = state.currentPhase === "Main" ? "Battle" : "Main";
    return {
      ...state,
      currentPhase: nextPhase,
    };
  }

  /**
   * Simulate end turn
   */
  private static simulateEndTurn(state: GameState): GameState {
    const currentPlayerKey =
      state.currentTurn === "player" ? "player" : "opponent";
    const nextTurn = state.currentTurn === "player" ? "opponent" : "player";

    // Reset attack flags
    const resetZones = state[currentPlayerKey].zones.mainMonsterZones.map((m) =>
      m ? { ...m, attackUsed: false, summonedThisTurn: false } : null
    );

    return {
      ...state,
      currentTurn: nextTurn,
      currentPhase: "Main",
      turnNumber: state.turnNumber + 1,
      [currentPlayerKey]: {
        ...state[currentPlayerKey],
        zones: { mainMonsterZones: resetZones },
        hasNormalSummoned: false,
      },
    };
  }

  /**
   * Deep clone game state to avoid mutations
   */
  private static cloneGameState(state: GameState): GameState {
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Simulate all possible actions for a player
   */
  public static getAllPossibleActions(
    gameState: GameState,
    player: "player" | "opponent"
  ): GameAction[] {
    const actions: GameAction[] = [];
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = gameState[playerKey];

    // Add summon actions
    if (!playerState.hasNormalSummoned && gameState.currentPhase === "Main") {
      const monstersInHand = playerState.hand.filter(
        (card) => card.cardType === "Monster"
      );
      const emptyZones = playerState.zones.mainMonsterZones
        .map((zone, index) => (zone === null ? index : -1))
        .filter((index) => index !== -1);

      for (const monster of monstersInHand) {
        for (const zoneIndex of emptyZones) {
          actions.push({
            type: "NORMAL_SUMMON",
            player,
            cardId: monster.id,
            zoneIndex,
          });
        }
      }
    }

    // Add attack actions
    if (gameState.currentPhase === "Battle") {
      const attackableMonsters = playerState.zones.mainMonsterZones.filter(
        (monster) =>
          monster &&
          !monster.attackUsed &&
          !monster.summonedThisTurn &&
          monster.battlePosition === "attack"
      );

      const opponentKey = player === "player" ? "opponent" : "player";
      const opponentMonsters = gameState[
        opponentKey
      ].zones.mainMonsterZones.filter((monster) => monster !== null);

      for (const attacker of attackableMonsters) {
        if (attacker) {
          if (opponentMonsters.length > 0) {
            // Attack opponent monsters
            for (
              let i = 0;
              i < gameState[opponentKey].zones.mainMonsterZones.length;
              i++
            ) {
              if (gameState[opponentKey].zones.mainMonsterZones[i]) {
                actions.push({
                  type: "ATTACK",
                  player,
                  cardId: attacker.id,
                  targetId: i.toString(),
                });
              }
            }
          } else {
            // Direct attack
            actions.push({
              type: "DIRECT_ATTACK",
              player,
              cardId: attacker.id,
            });
          }
        }
      }
    }

    // Add phase change action
    actions.push({
      type: "CHANGE_PHASE",
      player,
    });

    // Add end turn action
    actions.push({
      type: "END_TURN",
      player,
    });

    return actions;
  }

  /**
   * Evaluate game state from player's perspective
   * Higher score = better for player
   */
  public static evaluateState(
    gameState: GameState,
    player: "player" | "opponent"
  ): number {
    const playerKey = player === "player" ? "player" : "opponent";
    const opponentKey = player === "player" ? "opponent" : "player";

    const playerState = gameState[playerKey];
    const opponentState = gameState[opponentKey];

    let score = 0;

    // Win condition
    if (gameState.winner === player) return 10000;
    if (gameState.winner === opponentKey) return -10000;

    // Life points difference (HEAVILY weighted to encourage damage)
    const lpDiff = playerState.lifePoints - opponentState.lifePoints;
    score += lpDiff * 15; // Increased from 10 to 15

    // Bonus for dealing damage (encourage attacks)
    if (opponentState.lifePoints < 2000) {
      score += (2000 - opponentState.lifePoints) * 5; // Extra bonus for low opponent LP
    }

    // Board presence (monsters on field)
    const playerMonsters = playerState.zones.mainMonsterZones.filter(
      (m) => m !== null
    );
    const opponentMonsters = opponentState.zones.mainMonsterZones.filter(
      (m) => m !== null
    );

    score += playerMonsters.length * 80; // Reduced slightly from 100
    score -= opponentMonsters.length * 120; // Increased from 100 - clearing opponent's field is valuable

    // Total ATK on field (more aggressive)
    const playerTotalAtk = playerMonsters.reduce(
      (sum, m) => sum + (m?.attack || 0),
      0
    );
    const opponentTotalAtk = opponentMonsters.reduce(
      (sum, m) => sum + (m?.attack || 0),
      0
    );

    score += playerTotalAtk * 3; // Increased from 2
    score -= opponentTotalAtk * 3; // Increased from 2

    // Cards in hand (card advantage) - reduced importance
    score += playerState.hand.length * 30; // Reduced from 50
    score -= opponentState.hand.length * 30; // Reduced from 50

    // Monsters that can attack (HEAVILY encourage having attackers ready)
    const readyToAttack = playerMonsters.filter(
      (m) => m && !m.attackUsed && !m.summonedThisTurn
    ).length;
    score += readyToAttack * 100; // Increased from 50

    // Bonus for being in Battle phase with attackers
    if (gameState.currentPhase === "Battle" && readyToAttack > 0) {
      score += readyToAttack * 150; // Big bonus for attacking in Battle phase
    }

    // Penalty for having monsters that haven't attacked in Battle phase
    if (
      gameState.currentPhase === "Battle" &&
      gameState.currentTurn === player
    ) {
      const unattackedMonsters = playerMonsters.filter(
        (m) => m && !m.attackUsed && !m.summonedThisTurn
      ).length;
      if (unattackedMonsters > 0) {
        score -= unattackedMonsters * 50; // Penalty for not attacking
      }
    }

    return score;
  }
}
