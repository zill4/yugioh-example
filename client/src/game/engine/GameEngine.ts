/**
 * Game Engine - Simplified and Refactored
 * Core game state management using specialized engines and utilities
 */

import type {
  GameState,
  PlayerState,
  GameEvent,
  GameAction,
  CardInPlay,
} from "../types/GameTypes";
import { playerDeck, aiDeck, shuffleDeck } from "../decks/PreselectedDecks";
import { GameConstants } from "../utils/GameConstants";
import { findEmptyMonsterZone } from "../utils/CardStateUtils";
import {
  validateAttack,
  validateDirectAttack,
  validateSummon,
} from "../utils/GameRules";
import { BattleEngine } from "./BattleEngine";
import { PhaseManager } from "./PhaseManager";

export class GameEngine {
  private gameState: GameState;
  private onGameStateChange?: (gameState: GameState) => void;
  private onGameEnd?: (winner: "player" | "opponent") => void;
  private battleEngine: BattleEngine;
  private phaseManager: PhaseManager;

  constructor() {
    this.battleEngine = new BattleEngine();
    this.phaseManager = new PhaseManager();
    this.gameState = this.initializeGame();
    this.notifyGameStateChange();
  }

  /**
   * Initialize a new game
   */
  private initializeGame(): GameState {
    const shuffledPlayerDeck = shuffleDeck([...playerDeck]);
    const shuffledAIDeck = shuffleDeck([...aiDeck]);

    const playerState: PlayerState = {
      lifePoints: GameConstants.STARTING_LIFE_POINTS,
      hand: shuffledPlayerDeck.slice(0, GameConstants.STARTING_HAND_SIZE),
      zones: {
        mainMonsterZones: Array(GameConstants.MONSTER_ZONE_COUNT).fill(null),
      },
      graveyard: [],
      banished: [],
      mainDeck: shuffledPlayerDeck.slice(GameConstants.STARTING_HAND_SIZE),
    };

    const aiState: PlayerState = {
      lifePoints: GameConstants.STARTING_LIFE_POINTS,
      hand: shuffledAIDeck.slice(0, GameConstants.STARTING_HAND_SIZE),
      zones: {
        mainMonsterZones: Array(GameConstants.MONSTER_ZONE_COUNT).fill(null),
      },
      graveyard: [],
      banished: [],
      mainDeck: shuffledAIDeck.slice(GameConstants.STARTING_HAND_SIZE),
    };

    return {
      currentPhase: "Main",
      currentTurn: "player",
      turnNumber: 1,
      player: playerState,
      opponent: aiState,
      gameLog: [],
    };
  }

  /**
   * Subscribe to game state changes
   */
  public subscribeToGameState(callback: (gameState: GameState) => void): void {
    this.onGameStateChange = callback;
  }

  /**
   * Subscribe to game end events
   */
  public subscribeToGameEnd(
    callback: (winner: "player" | "opponent") => void
  ): void {
    this.onGameEnd = callback;
  }

  /**
   * Get current game state
   */
  public getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Execute a game action
   */
  public executeAction(action: GameAction): boolean {
    const { type, player, cardId, zoneIndex, targetId } = action;

    switch (type) {
      case "ATTACK":
        return this.attack(
          player,
          cardId!,
          targetId ? parseInt(targetId) : undefined
        );
      case "DIRECT_ATTACK":
        return this.directAttack(player, cardId!);
      case "CHANGE_PHASE":
        return this.changePhase();
      case "END_TURN":
        return this.endTurn();
      case "NORMAL_SUMMON":
        return this.normalSummon(player, cardId!, zoneIndex);
      default:
        return false;
    }
  }

  /**
   * Execute an attack
   */
  private attack(
    player: "player" | "opponent",
    attackerId: string,
    targetIndex?: number
  ): boolean {
    // Validate attack
    const validation = validateAttack(
      attackerId,
      targetIndex,
      this.gameState,
      player
    );
    if (!validation.valid) {
      console.warn("Invalid attack:", validation.error);
      return false;
    }

    const attackerKey = player === "player" ? "player" : "opponent";
    const defenderKey = player === "player" ? "opponent" : "player";

    // Execute battle
    const battleResult = this.battleEngine.executeAttack(
      attackerId,
      targetIndex,
      this.gameState[attackerKey],
      this.gameState[defenderKey]
    );

    if (!battleResult.success) {
      console.warn("Battle failed:", battleResult.message);
      return false;
    }

    // Apply battle results
    this.gameState = {
      ...this.gameState,
      [attackerKey]: battleResult.updatedAttackerState!,
      [defenderKey]: battleResult.updatedDefenderState!,
    };

    // Add game event
    this.addGameEvent(player, "attack", battleResult.message);

    // Check for game end
    if (battleResult.updatedDefenderState!.lifePoints <= 0) {
      this.gameState = { ...this.gameState, winner: player };
      this.notifyGameStateChange();
      this.onGameEnd?.(player);
      return true;
    }

    this.notifyGameStateChange();
    return true;
  }

  /**
   * Execute direct attack
   */
  private directAttack(
    player: "player" | "opponent",
    attackerId: string
  ): boolean {
    // Validate direct attack
    const validation = validateDirectAttack(attackerId, this.gameState, player);
    if (!validation.valid) {
      console.warn("Invalid direct attack:", validation.error);
      return false;
    }

    return this.attack(player, attackerId, undefined);
  }

  /**
   * Change game phase
   */
  private changePhase(): boolean {
    const currentPlayerKey =
      this.gameState.currentTurn === "player" ? "player" : "opponent";

    // Check if we should end turn instead
    if (this.phaseManager.shouldEndTurn(this.gameState.currentPhase)) {
      return this.endTurn();
    }

    // Get next phase
    const nextPhase = this.phaseManager.getNextPhase(
      this.gameState.currentPhase
    );

    // Apply phase exit logic
    let updatedPlayerState = this.phaseManager.onPhaseExit(
      this.gameState.currentPhase,
      this.gameState[currentPlayerKey]
    );

    // Apply phase entry logic
    updatedPlayerState = this.phaseManager.onPhaseEnter(
      nextPhase,
      updatedPlayerState
    );

    // Update game state
    this.gameState = {
      ...this.gameState,
      currentPhase: nextPhase,
      [currentPlayerKey]: updatedPlayerState,
    };

    this.addGameEvent(
      this.gameState.currentTurn,
      "phase_change",
      `Phase changed to ${nextPhase}`
    );

    this.notifyGameStateChange();
    return true;
  }

  /**
   * End current turn
   */
  private endTurn(): boolean {
    const nextPlayer =
      this.gameState.currentTurn === "player" ? "opponent" : "player";
    const currentPlayerKey =
      this.gameState.currentTurn === "player" ? "player" : "opponent";
    const nextPlayerKey = nextPlayer === "player" ? "player" : "opponent";

    // Add turn end event
    this.addGameEvent(
      this.gameState.currentTurn,
      "turn_end",
      `${
        this.gameState.currentTurn === "player" ? "Your" : "Opponent's"
      } turn ended`
    );

    // Reset current player's phase flags
    let updatedCurrentPlayerState = this.phaseManager.resetPhaseFlags(
      this.gameState[currentPlayerKey]
    );

    // Auto-draw a card for the next player
    const newTurnNumber = this.gameState.turnNumber + 1;
    const shouldDraw = !(newTurnNumber === 1 && nextPlayer === "player");

    let updatedNextPlayerState = this.gameState[nextPlayerKey];
    if (shouldDraw) {
      const drawResult = this.drawCardForPlayer(updatedNextPlayerState);
      if (drawResult.deckOut) {
        // Player loses due to deck out
        const winner = nextPlayer === "player" ? "opponent" : "player";
        this.gameState = { ...this.gameState, winner };
        this.notifyGameStateChange();
        this.onGameEnd?.(winner);
        return false;
      }
      updatedNextPlayerState = drawResult.playerState;
      this.addGameEvent(
        nextPlayer,
        "card_played",
        `${nextPlayer === "player" ? "You" : "Opponent"} drew a card`
      );
    }

    // Update game state
    this.gameState = {
      ...this.gameState,
      currentTurn: nextPlayer,
      currentPhase: "Main",
      turnNumber: newTurnNumber,
      [currentPlayerKey]: updatedCurrentPlayerState,
      [nextPlayerKey]: updatedNextPlayerState,
    };

    this.notifyGameStateChange();
    return true;
  }

  /**
   * Normal Summon a monster
   */
  public normalSummon(
    player: "player" | "opponent",
    cardId: string,
    zoneIndex?: number
  ): boolean {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    // Find the card in hand
    const cardIndex = playerState.hand.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) return false;

    const card = playerState.hand[cardIndex];

    // Validate summon
    const validation = validateSummon(
      card,
      playerState,
      this.gameState,
      player
    );
    if (!validation.valid) {
      console.warn("Invalid summon:", validation.error);
      return false;
    }

    // Find empty monster zone
    const targetZoneIndex = zoneIndex ?? findEmptyMonsterZone(playerState);
    if (targetZoneIndex === -1) return false;

    // Create card in play
    const cardInPlay: CardInPlay = {
      ...card,
      position: "monster",
      zoneIndex: targetZoneIndex,
      battlePosition: "attack",
      faceDown: false,
      faceUp: true,
      summonedThisTurn: true,
    };

    // Remove from hand and add to field
    const newHand = [...playerState.hand];
    newHand.splice(cardIndex, 1);

    const newZones = { ...playerState.zones };
    const zoneArray = newZones.mainMonsterZones as (CardInPlay | null)[];
    const newZoneArray = [...zoneArray];
    newZoneArray[targetZoneIndex] = cardInPlay;
    newZones.mainMonsterZones = newZoneArray;

    // Update player state
    const updatedPlayerState = {
      ...playerState,
      hand: newHand,
      zones: newZones,
      hasNormalSummoned: true,
    };

    // Update game state
    this.gameState = {
      ...this.gameState,
      [playerKey]: updatedPlayerState,
    };

    this.addGameEvent(
      player,
      "summon",
      `${player === "player" ? "You" : "Opponent"} Normal Summoned ${card.name}`
    );

    this.notifyGameStateChange();
    return true;
  }

  /**
   * Draw a card for a player
   */
  private drawCardForPlayer(playerState: PlayerState): {
    playerState: PlayerState;
    deckOut: boolean;
  } {
    if (playerState.mainDeck.length === 0) {
      return { playerState, deckOut: true };
    }

    const newMainDeck = [...playerState.mainDeck];
    const drawnCard = newMainDeck.pop()!;
    const newHand = [...playerState.hand, drawnCard];

    return {
      playerState: {
        ...playerState,
        mainDeck: newMainDeck,
        hand: newHand,
      },
      deckOut: false,
    };
  }

  /**
   * Draw a card (for player action)
   */
  public drawCard(player: "player" | "opponent"): boolean {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    const result = this.drawCardForPlayer(playerState);
    if (result.deckOut) return false;

    this.gameState = {
      ...this.gameState,
      [playerKey]: result.playerState,
    };

    this.addGameEvent(
      player,
      "card_played",
      `${player === "player" ? "You" : "Opponent"} drew a card`
    );

    this.notifyGameStateChange();
    return true;
  }

  /**
   * Get available actions for current phase
   */
  public getAvailableActions(): string[] {
    const actions: string[] = [];
    const currentTurn = this.gameState.currentTurn;
    const playerKey = currentTurn === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    switch (this.gameState.currentPhase) {
      case "Main":
        if (!playerState.hasNormalSummoned) {
          actions.push("NORMAL_SUMMON");
        }
        break;

      case "Battle":
        const monsters = playerState.zones.mainMonsterZones.filter(
          (card) => card && !card.attackUsed && !card.summonedThisTurn
        );
        if (monsters.length > 0) {
          actions.push("ATTACK", "DIRECT_ATTACK");
        }
        break;
    }

    actions.push("CHANGE_PHASE", "END_TURN");
    return actions;
  }

  /**
   * Add event to game log
   */
  private addGameEvent(
    player: "player" | "opponent",
    type: GameEvent["type"],
    message: string
  ): void {
    const event: GameEvent = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      player,
      message,
      timestamp: Date.now(),
    };

    this.gameState = {
      ...this.gameState,
      gameLog: [...this.gameState.gameLog, event],
    };
  }

  /**
   * Notify subscribers of game state changes
   */
  private notifyGameStateChange(): void {
    console.log(
      "GameEngine: Notifying game state change, current turn:",
      this.gameState.currentTurn
    );
    this.onGameStateChange?.(this.gameState);
  }
}
