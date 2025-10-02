/**
 * Smart AI - Simplified wrapper around MinimaxAI
 * Replaces DummyAI with intelligent decision making
 */

import { GameEngine } from "../engine/GameEngine";
import { MinimaxAI, type AIDifficulty } from "./MinimaxAI";
import type { GameAction } from "../types/GameTypes";

export class SmartAI {
  private gameEngine: GameEngine;
  private minimax: MinimaxAI;
  private aiTimeout?: NodeJS.Timeout;
  private onTurnEnd?: () => void;
  private difficulty: AIDifficulty;

  constructor(gameEngine: GameEngine, difficulty: AIDifficulty = "medium") {
    this.gameEngine = gameEngine;
    this.difficulty = difficulty;
    this.minimax = new MinimaxAI(difficulty);
  }

  /**
   * Set callback for when AI turn ends
   */
  public setOnTurnEnd(callback: () => void): void {
    this.onTurnEnd = callback;
  }

  /**
   * Start AI turn
   */
  public startTurn(): void {
    console.log(`SmartAI (${this.difficulty}): Starting turn`);
    this.executeTurn();
  }

  /**
   * Stop AI (for cleanup)
   */
  public stop(): void {
    if (this.aiTimeout) {
      clearTimeout(this.aiTimeout);
    }
  }

  /**
   * Execute AI turn using minimax algorithm
   */
  private async executeTurn(): Promise<void> {
    try {
      let actionsThisTurn = 0;
      const maxActions = 20; // Safety limit

      while (actionsThisTurn < maxActions) {
        const gameState = this.gameEngine.getGameState();

        // Check if game is over
        if (gameState.winner) {
          console.log("SmartAI: Game ended");
          break;
        }

        // Check if it's still AI's turn
        if (gameState.currentTurn !== "opponent") {
          console.log("SmartAI: Not AI's turn anymore");
          break;
        }

        // Find best action using minimax
        const bestAction = this.minimax.findBestAction(gameState, "opponent");

        if (!bestAction) {
          console.log("SmartAI: No valid action found, ending turn");
          this.gameEngine.executeAction({
            type: "END_TURN",
            player: "opponent",
          });
          break;
        }

        // Log the action
        this.logAction(bestAction);

        // Add delay for better UX (shows AI "thinking")
        await this.delay(this.getActionDelay(bestAction));

        // Execute the action
        const success = this.gameEngine.executeAction(bestAction);

        if (!success) {
          console.warn("SmartAI: Action failed, trying different action");
        }

        actionsThisTurn++;

        // End turn if we executed an END_TURN action
        if (bestAction.type === "END_TURN") {
          console.log("SmartAI: Turn ended");
          break;
        }

        // Check if turn ended automatically (phase change from Battle)
        const updatedState = this.gameEngine.getGameState();
        if (updatedState.currentTurn !== "opponent") {
          console.log("SmartAI: Turn ended automatically");
          break;
        }
      }

      // Signal turn end
      if (this.onTurnEnd) {
        this.onTurnEnd();
      }
    } catch (error) {
      console.error("SmartAI Error:", error);
      // Fallback: end turn
      this.gameEngine.executeAction({
        type: "END_TURN",
        player: "opponent",
      });
      if (this.onTurnEnd) {
        this.onTurnEnd();
      }
    }
  }

  /**
   * Get delay based on action type for better UX
   */
  private getActionDelay(action: GameAction): number {
    switch (action.type) {
      case "NORMAL_SUMMON":
        return 1500;
      case "ATTACK":
      case "DIRECT_ATTACK":
        return 2000;
      case "CHANGE_PHASE":
        return 1000;
      case "END_TURN":
        return 500;
      default:
        return 1000;
    }
  }

  /**
   * Log action for debugging
   */
  private logAction(action: GameAction): void {
    switch (action.type) {
      case "NORMAL_SUMMON":
        console.log(`SmartAI: Summoning card ${action.cardId} to zone ${action.zoneIndex}`);
        break;
      case "ATTACK":
        console.log(
          `SmartAI: Attacking with ${action.cardId} targeting ${action.targetId}`
        );
        break;
      case "DIRECT_ATTACK":
        console.log(`SmartAI: Direct attack with ${action.cardId}`);
        break;
      case "CHANGE_PHASE":
        console.log("SmartAI: Changing phase");
        break;
      case "END_TURN":
        console.log("SmartAI: Ending turn");
        break;
    }
  }

  /**
   * Helper for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.aiTimeout = setTimeout(resolve, ms);
    });
  }

  /**
   * Set AI difficulty
   */
  public setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty;
    this.minimax.setDifficulty(difficulty);
  }

  /**
   * Get current difficulty
   */
  public getDifficulty(): AIDifficulty {
    return this.difficulty;
  }
}


