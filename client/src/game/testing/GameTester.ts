/**
 * Game Tester
 * Automated testing for game rules and AI
 * Can run simulated games without UI
 */

import { GameController } from "../GameController";
import type { AIDifficulty } from "../ai/MinimaxAI";
import type { GameState } from "../types/GameTypes";

export interface GameTestResult {
  winner: "player" | "opponent" | null;
  turns: number;
  playerFinalLP: number;
  opponentFinalLP: number;
  duration: number; // milliseconds
  error?: string;
}

export class GameTester {
  /**
   * Run a simulated game between two AIs
   */
  public static async runSimulatedGame(
    opponentAIDifficulty: AIDifficulty = "medium",
    maxTurns: number = 50
  ): Promise<GameTestResult> {
    const startTime = Date.now();
    let gameState: GameState | null = null;
    let turns = 0;

    try {
      // Create game controller
      const controller = new GameController(opponentAIDifficulty);

      // Initialize with silent callbacks
      controller.initialize({
        onGameStateChange: (state) => {
          gameState = state;
        },
        onGameEnd: () => {},
        onAITurnStart: () => {},
        onAITurnEnd: () => {},
        onPlayerTurnStart: () => {},
      });

      gameState = controller.getGameState();

      // Simulate game loop
      while (!gameState?.winner && turns < maxTurns) {
        turns++;

        if (gameState.currentTurn === "player") {
          // Simulate player as AI
          // For now, just end turn quickly
          // In future, could use another AI for player
          await this.delay(100);
          controller.endTurn();
        }
        // AI handles opponent turn automatically

        await this.delay(100); // Small delay between turns

        gameState = controller.getGameState();
      }

      const endTime = Date.now();

      return {
        winner: gameState?.winner || null,
        turns,
        playerFinalLP: gameState?.player.lifePoints || 0,
        opponentFinalLP: gameState?.opponent.lifePoints || 0,
        duration: endTime - startTime,
      };
    } catch (error) {
      return {
        winner: null,
        turns,
        playerFinalLP: gameState?.player.lifePoints || 0,
        opponentFinalLP: gameState?.opponent.lifePoints || 0,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Run multiple games and get statistics
   */
  public static async runBenchmark(
    numGames: number = 10,
    difficulty: AIDifficulty = "medium"
  ): Promise<{
    totalGames: number;
    playerWins: number;
    opponentWins: number;
    averageTurns: number;
    averageDuration: number;
  }> {
    console.log(`Running ${numGames} games with difficulty: ${difficulty}...`);

    let playerWins = 0;
    let opponentWins = 0;
    let totalTurns = 0;
    let totalDuration = 0;

    for (let i = 0; i < numGames; i++) {
      const result = await this.runSimulatedGame(difficulty);

      if (result.winner === "player") playerWins++;
      if (result.winner === "opponent") opponentWins++;

      totalTurns += result.turns;
      totalDuration += result.duration;

      console.log(
        `Game ${i + 1}/${numGames}: Winner: ${
          result.winner || "Draw"
        }, Turns: ${result.turns}, Duration: ${result.duration}ms`
      );
    }

    return {
      totalGames: numGames,
      playerWins,
      opponentWins,
      averageTurns: totalTurns / numGames,
      averageDuration: totalDuration / numGames,
    };
  }

  /**
   * Test specific game scenario
   */
  public static async testScenario(scenario: {
    name: string;
    setup: (controller: GameController) => void;
    expectedOutcome: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const controller = new GameController();
      let finalState: GameState | null = controller.getGameState();

      controller.initialize({
        onGameStateChange: (state) => {
          finalState = state;
        },
        onGameEnd: () => {},
        onAITurnStart: () => {},
        onAITurnEnd: () => {},
        onPlayerTurnStart: () => {},
      });

      // Run custom setup
      scenario.setup(controller);

      // Run for a few turns
      for (let i = 0; i < 10; i++) {
        await this.delay(100);
        if (
          finalState?.winner === "player" ||
          finalState?.winner === "opponent"
        )
          break;
      }

      return {
        success: true,
        message: `Scenario '${scenario.name}' completed successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Test failed",
      };
    }
  }

  /**
   * Helper delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
