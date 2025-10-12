/**
 * Minimax AI
 * Uses minimax algorithm with alpha-beta pruning to find optimal moves
 * Difficulty is controlled by search depth (how many moves ahead it thinks)
 */

import type { GameState, GameAction } from "../types/GameTypes";
import { GameSimulator } from "./GameSimulator";

export type AIDifficulty = "easy" | "medium" | "hard" | "expert";

interface MinimaxResult {
  score: number;
  action: GameAction | null;
}

export class MinimaxAI {
  private difficulty: AIDifficulty;
  private searchDepth: number;
  private nodesEvaluated: number = 0;

  constructor(difficulty: AIDifficulty = "medium") {
    this.difficulty = difficulty;
    this.searchDepth = this.getSearchDepth(difficulty);
  }

  /**
   * Get search depth based on difficulty
   */
  private getSearchDepth(difficulty: AIDifficulty): number {
    switch (difficulty) {
      case "easy":
        return 1; // Only looks at immediate moves
      case "medium":
        return 2; // Looks 2 moves ahead
      case "hard":
        return 3; // Looks 3 moves ahead
      case "expert":
        return 4; // Looks 4 moves ahead
      default:
        return 2;
    }
  }

  /**
   * Find the best action using minimax algorithm
   */
  public findBestAction(
    gameState: GameState,
    player: "player" | "opponent"
  ): GameAction | null {
    this.nodesEvaluated = 0;
    const startTime = Date.now();

    // Get all possible actions
    const possibleActions = GameSimulator.getAllPossibleActions(
      gameState,
      player
    );

    // Check for winning attacks first - always take them!
    const winningAttack = this.findWinningAttack(
      gameState,
      player,
      possibleActions
    );
    if (winningAttack) {
      console.log(`MinimaxAI: Found winning attack!`);
      return winningAttack;
    }

    // In Battle phase with attacks available, heavily bias towards attacking
    if (gameState.currentPhase === "Battle") {
      const attackActions = possibleActions.filter(
        (a) => a.type === "ATTACK" || a.type === "DIRECT_ATTACK"
      );

      if (attackActions.length > 0) {
        // On easy/medium, sometimes attack randomly
        if (this.difficulty === "easy" && Math.random() < 0.6) {
          return attackActions[
            Math.floor(Math.random() * attackActions.length)
          ];
        }
        if (this.difficulty === "medium" && Math.random() < 0.3) {
          return attackActions[
            Math.floor(Math.random() * attackActions.length)
          ];
        }

        // Find favorable attacks (can win the battle)
        const favorableAttacks = this.findFavorableAttacks(
          gameState,
          player,
          attackActions
        );
        if (favorableAttacks.length > 0) {
          // Take a favorable attack with high probability
          if (Math.random() < 0.8) {
            return favorableAttacks[
              Math.floor(Math.random() * favorableAttacks.length)
            ];
          }
        }
      }
    }

    // Add randomness to card selection
    const randomness = this.getRandomnessFactor();
    if (Math.random() < randomness) {
      const randomAction = this.getRandomGoodAction(possibleActions);
      if (randomAction) {
        console.log(
          `MinimaxAI: Playing randomly (${(randomness * 100).toFixed(
            0
          )}% chance)`
        );
        return randomAction;
      }
    }

    const result = this.minimax(
      gameState,
      this.searchDepth,
      -Infinity,
      Infinity,
      true, // AI is maximizing player
      player
    );

    const endTime = Date.now();
    console.log(
      `MinimaxAI (${this.difficulty}): Evaluated ${
        this.nodesEvaluated
      } nodes in ${endTime - startTime}ms, best score: ${result.score}`
    );

    return result.action;
  }

  /**
   * Find an attack that would immediately win the game
   */
  private findWinningAttack(
    gameState: GameState,
    player: "player" | "opponent",
    actions: GameAction[]
  ): GameAction | null {
    const opponentKey = player === "player" ? "opponent" : "player";
    const opponentLP = gameState[opponentKey].lifePoints;

    for (const action of actions) {
      if (action.type === "DIRECT_ATTACK") {
        const playerKey = player === "player" ? "player" : "opponent";
        const attacker = gameState[playerKey].zones.mainMonsterZones.find(
          (m) => m?.id === action.cardId
        );
        if (attacker && (attacker.attack || 0) >= opponentLP) {
          return action;
        }
      }
    }
    return null;
  }

  /**
   * Find attacks where AI monster is stronger than opponent's
   */
  private findFavorableAttacks(
    gameState: GameState,
    player: "player" | "opponent",
    attackActions: GameAction[]
  ): GameAction[] {
    const playerKey = player === "player" ? "player" : "opponent";
    const opponentKey = player === "player" ? "opponent" : "player";

    return attackActions.filter((action) => {
      if (action.type === "DIRECT_ATTACK") return true;

      if (action.type === "ATTACK" && action.targetId) {
        const attacker = gameState[playerKey].zones.mainMonsterZones.find(
          (m) => m?.id === action.cardId
        );
        const targetIndex = parseInt(action.targetId);
        const defender =
          gameState[opponentKey].zones.mainMonsterZones[targetIndex];

        if (attacker && defender) {
          const attackerATK = attacker.attack || 0;
          const defenderDEF =
            defender.battlePosition === "defense"
              ? defender.defense || 0
              : defender.attack || 0;
          return attackerATK > defenderDEF;
        }
      }
      return false;
    });
  }

  /**
   * Get randomness factor based on difficulty
   */
  private getRandomnessFactor(): number {
    switch (this.difficulty) {
      case "easy":
        return 0.4; // 40% chance to play randomly
      case "medium":
        return 0.25; // 25% chance
      case "hard":
        return 0.1; // 10% chance
      case "expert":
        return 0.05; // 5% chance
      default:
        return 0.2;
    }
  }

  /**
   * Get a random but reasonable action (not complete random)
   */
  private getRandomGoodAction(actions: GameAction[]): GameAction | null {
    // Filter out just END_TURN unless it's the only option
    const nonEndTurnActions = actions.filter((a) => a.type !== "END_TURN");
    const actionPool =
      nonEndTurnActions.length > 0 ? nonEndTurnActions : actions;

    if (actionPool.length === 0) return null;
    return actionPool[Math.floor(Math.random() * actionPool.length)];
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   */
  private minimax(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    player: "player" | "opponent"
  ): MinimaxResult {
    this.nodesEvaluated++;

    // Terminal conditions
    if (depth === 0 || gameState.winner) {
      return {
        score: GameSimulator.evaluateState(gameState, player),
        action: null,
      };
    }

    const currentPlayer = isMaximizing ? player : this.getOpponent(player);
    const possibleActions = GameSimulator.getAllPossibleActions(
      gameState,
      currentPlayer
    );

    // Filter out obviously bad moves at higher difficulties
    const filteredActions = this.filterActions(
      possibleActions,
      gameState,
      currentPlayer
    );

    if (isMaximizing) {
      let maxScore = -Infinity;
      let bestAction: GameAction | null = null;

      for (const action of filteredActions) {
        const newState = GameSimulator.simulateAction(gameState, action);
        if (!newState) continue;

        const result = this.minimax(
          newState,
          depth - 1,
          alpha,
          beta,
          false,
          player
        );

        if (result.score > maxScore) {
          maxScore = result.score;
          bestAction = action;
        }

        alpha = Math.max(alpha, result.score);
        if (beta <= alpha) break; // Beta cutoff
      }

      return { score: maxScore, action: bestAction };
    } else {
      let minScore = Infinity;
      let bestAction: GameAction | null = null;

      for (const action of filteredActions) {
        const newState = GameSimulator.simulateAction(gameState, action);
        if (!newState) continue;

        const result = this.minimax(
          newState,
          depth - 1,
          alpha,
          beta,
          true,
          player
        );

        if (result.score < minScore) {
          minScore = result.score;
          bestAction = action;
        }

        beta = Math.min(beta, result.score);
        if (beta <= alpha) break; // Alpha cutoff
      }

      return { score: minScore, action: bestAction };
    }
  }

  /**
   * Filter out obviously bad actions to reduce search space
   */
  private filterActions(
    actions: GameAction[],
    gameState: GameState,
    player: "player" | "opponent"
  ): GameAction[] {
    // On easy difficulty, don't filter
    if (this.difficulty === "easy") {
      return actions;
    }

    // Always keep phase change and end turn
    const controlActions = actions.filter(
      (a) => a.type === "CHANGE_PHASE" || a.type === "END_TURN"
    );

    // Filter other actions
    const gameActions = actions.filter(
      (a) => a.type !== "CHANGE_PHASE" && a.type !== "END_TURN"
    );

    // Quick evaluation to remove obviously terrible moves
    const evaluatedActions = gameActions
      .map((action) => {
        const newState = GameSimulator.simulateAction(gameState, action);
        if (!newState) return { action, score: -Infinity };

        const score = GameSimulator.evaluateState(newState, player);
        return { action, score };
      })
      .sort((a, b) => b.score - a.score);

    // Keep top moves based on difficulty
    const keepCount =
      this.difficulty === "medium"
        ? Math.ceil(evaluatedActions.length * 0.7)
        : evaluatedActions.length;

    return [
      ...evaluatedActions.slice(0, keepCount).map((e) => e.action),
      ...controlActions,
    ];
  }

  /**
   * Get opponent of a player
   */
  private getOpponent(player: "player" | "opponent"): "player" | "opponent" {
    return player === "player" ? "opponent" : "player";
  }

  /**
   * Set AI difficulty
   */
  public setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty;
    this.searchDepth = this.getSearchDepth(difficulty);
  }

  /**
   * Get current difficulty
   */
  public getDifficulty(): AIDifficulty {
    return this.difficulty;
  }

  /**
   * Get statistics about last search
   */
  public getStats(): { nodesEvaluated: number; searchDepth: number } {
    return {
      nodesEvaluated: this.nodesEvaluated,
      searchDepth: this.searchDepth,
    };
  }
}
