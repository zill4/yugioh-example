import { GameEngine } from "./engine/GameEngine";
import { DummyAI } from "./ai/DummyAI";
import { type GameState, type GameAction } from "./types/GameTypes";

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
    console.log("GameController: Initializing...");
    this.callbacks = callbacks;
    let isInitialState = true;

    // Subscribe to game engine events
    this.gameEngine.subscribeToGameState((gameState) => {
      console.log(
        "GameController: Game state changed, current turn:",
        gameState.currentTurn,
        "isInitial:",
        isInitialState
      );
      this.callbacks?.onGameStateChange(gameState);

      // Check if it's AI's turn (but skip on initial state to prevent double initialization)
      if (
        gameState.currentTurn === "opponent" &&
        !gameState.winner &&
        !isInitialState
      ) {
        console.log("GameController: Starting AI turn");
        this.callbacks?.onAITurnStart();
        this.ai.startTurn();
      }

      isInitialState = false;
    });

    this.gameEngine.subscribeToGameEnd((winner) => {
      console.log("GameController: Game ended, winner:", winner);
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

  // Activate a card effect
  public activateEffect(cardId: string, effectId?: string): boolean {
    return this.gameEngine.activateEffect("player", cardId, effectId);
  }

  // Normal Summon a monster
  public normalSummon(cardId: string, zoneIndex?: number): boolean {
    return this.gameEngine.executeAction({
      type: "NORMAL_SUMMON",
      player: "player",
      cardId,
      zoneIndex,
    });
  }

  // Set a monster
  public setMonster(cardId: string, zoneIndex?: number): boolean {
    return this.gameEngine.executeAction({
      type: "SET_MONSTER",
      player: "player",
      cardId,
      zoneIndex,
    });
  }

  // Special Summon a monster
  public specialSummon(cardId: string, zoneIndex?: number): boolean {
    return this.gameEngine.executeAction({
      type: "SPECIAL_SUMMON",
      player: "player",
      cardId,
      zoneIndex,
    });
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
