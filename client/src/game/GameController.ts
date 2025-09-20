import { GameEngine } from "./engine/GameEngine";
import { DummyAI } from "./ai/DummyAI";
import {
  type GameState,
  type GameAction,
  type GameCard,
} from "./types/GameTypes";

export interface GameControllerCallbacks {
  onGameStateChange: (gameState: GameState) => void;
  onGameEnd: (winner: "player" | "opponent") => void;
  onAITurnStart: () => void;
  onAITurnEnd: () => void;
}

export class GameController {
  private gameEngine: GameEngine;
  private ai: DummyAI;
  private callbacks?: GameControllerCallbacks;

  constructor() {
    this.gameEngine = new GameEngine();
    this.ai = new DummyAI(this.gameEngine);
  }

  // Initialize the game controller with callbacks
  public initialize(callbacks: GameControllerCallbacks): void {
    this.callbacks = callbacks;

    // Subscribe to game engine events
    this.gameEngine.subscribeToGameState((gameState) => {
      this.callbacks?.onGameStateChange(gameState);

      // Check if it's AI's turn
      if (gameState.currentTurn === "opponent" && !gameState.winner) {
        this.callbacks?.onAITurnStart();
        this.ai.startTurn();
      }
    });

    this.gameEngine.subscribeToGameEnd((winner) => {
      this.callbacks?.onGameEnd(winner);
      this.ai.stop();
    });
  }

  // Get current game state
  public getGameState(): GameState {
    return this.gameEngine.getGameState();
  }

  // Execute a player action
  public executePlayerAction(action: GameAction): boolean {
    return this.gameEngine.executeAction(action);
  }

  // Get available actions for the current phase
  public getAvailableActions(): string[] {
    return this.gameEngine.getAvailableActions();
  }

  // Start a new game
  public startNewGame(): void {
    // Create new game engine and AI
    this.gameEngine = new GameEngine();
    this.ai = new DummyAI(this.gameEngine);

    // Re-initialize with callbacks
    if (this.callbacks) {
      this.initialize(this.callbacks);
    }
  }

  // Draw a card (player action)
  public drawCard(): boolean {
    return this.gameEngine.drawCard("player");
  }

  // Change phase (player action)
  public changePhase(): boolean {
    return this.gameEngine.executeAction({
      type: "CHANGE_PHASE",
      player: "player",
    });
  }

  // End turn (player action)
  public endTurn(): boolean {
    return this.gameEngine.executeAction({
      type: "END_TURN",
      player: "player",
    });
  }

  // Play a card from hand
  public playCard(cardId: string, zoneIndex?: number): boolean {
    return this.gameEngine.executeAction({
      type: "PLAY_CARD",
      player: "player",
      cardId,
      zoneIndex,
    });
  }

  // Attack with a monster
  public attack(attackerId: string, targetIndex?: number): boolean {
    if (targetIndex !== undefined) {
      return this.gameEngine.executeAction({
        type: "ATTACK",
        player: "player",
        cardId: attackerId,
        targetId: targetIndex.toString(),
      });
    } else {
      return this.gameEngine.executeAction({
        type: "DIRECT_ATTACK",
        player: "player",
        cardId: attackerId,
      });
    }
  }
}
