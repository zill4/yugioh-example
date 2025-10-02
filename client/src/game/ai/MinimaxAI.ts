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
