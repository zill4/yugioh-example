import {
  type GameState,
  type GamePhase,
  type PlayerState,
  type GameEvent,
  type CardInPlay,
  type GameAction,
} from "../types/GameTypes";
import { playerDeck, aiDeck, shuffleDeck } from "../decks/PreselectedDecks";

export class GameEngine {
  private gameState: GameState;
  private onGameStateChange?: (gameState: GameState) => void;
  private onGameEnd?: (winner: "player" | "opponent") => void;

  constructor() {
    this.gameState = this.initializeGame();
    // Notify subscribers of the initial game state
    this.notifyGameStateChange();
  }

  // Initialize a new game
  private initializeGame(): GameState {
    const shuffledPlayerDeck = shuffleDeck([...playerDeck]);
    const shuffledAIDeck = shuffleDeck([...aiDeck]);

    const playerState: PlayerState = {
      lifePoints: 8000,
      hand: shuffledPlayerDeck.slice(0, 5), // Draw 5 cards
      monsterZones: Array(5).fill(null),
      spellTrapZones: Array(5).fill(null),
      graveyard: [],
      banished: [],
      extraDeck: [],
      mainDeck: shuffledPlayerDeck.slice(5), // Rest of deck
    };

    const aiState: PlayerState = {
      lifePoints: 8000,
      hand: shuffledAIDeck.slice(0, 5),
      monsterZones: Array(5).fill(null),
      spellTrapZones: Array(5).fill(null),
      graveyard: [],
      banished: [],
      extraDeck: [],
      mainDeck: shuffledAIDeck.slice(5),
    };

    return {
      currentPhase: "Draw",
      currentTurn: "player",
      turnNumber: 1,
      player: playerState,
      opponent: aiState,
      gameLog: [],
    };
  }

  // Subscribe to game state changes
  public subscribeToGameState(callback: (gameState: GameState) => void): void {
    this.onGameStateChange = callback;
  }

  // Subscribe to game end events
  public subscribeToGameEnd(
    callback: (winner: "player" | "opponent") => void
  ): void {
    this.onGameEnd = callback;
  }

  // Get current game state
  public getGameState(): GameState {
    return this.gameState;
  }

  // Execute a game action
  public executeAction(action: GameAction): boolean {
    const { type, player, cardId, zoneIndex } = action;

    switch (type) {
      case "PLAY_CARD":
        return this.playCard(player, cardId!, zoneIndex);
      case "ATTACK":
        return this.attack(player, cardId!, zoneIndex);
      case "DIRECT_ATTACK":
        return this.directAttack(player, cardId!);
      case "CHANGE_PHASE":
        return this.changePhase();
      case "END_TURN":
        return this.endTurn();
      default:
        return false;
    }
  }

  // Play a card from hand to field
  private playCard(
    player: "player" | "opponent",
    cardId: string,
    zoneIndex?: number
  ): boolean {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];
    const cardIndex = playerState.hand.findIndex((card) => card.id === cardId);

    if (cardIndex === -1) return false;

    const card = playerState.hand[cardIndex];

    // Determine target zone and index
    let targetIndex: number;
    let isMonsterZone: boolean;

    if (card.type === "monster") {
      targetIndex = zoneIndex ?? this.findEmptyMonsterZone(playerState);
      isMonsterZone = true;
    } else {
      targetIndex = zoneIndex ?? this.findEmptySpellTrapZone(playerState);
      isMonsterZone = false;
    }

    if (targetIndex === -1) return false;

    // Create card in play
    const cardInPlay: CardInPlay = {
      ...card,
      position: card.type === "monster" ? "monster" : "spellTrap",
      zoneIndex: targetIndex,
      battlePosition: card.type === "monster" ? "attack" : undefined,
      faceDown: card.type === "trap", // Traps start face down
    };

    // Create new player state with updated zones and hand (immutable update)
    const newHand = [...playerState.hand];
    newHand.splice(cardIndex, 1);

    let newPlayerState: PlayerState;
    if (isMonsterZone) {
      const newMonsterZones = [...playerState.monsterZones];
      newMonsterZones[targetIndex] = cardInPlay;
      newPlayerState = {
        ...playerState,
        hand: newHand,
        monsterZones: newMonsterZones,
      };
    } else {
      const newSpellTrapZones = [...playerState.spellTrapZones];
      newSpellTrapZones[targetIndex] = cardInPlay;
      newPlayerState = {
        ...playerState,
        hand: newHand,
        spellTrapZones: newSpellTrapZones,
      };
    }

    // Update game state (immutable update)
    this.gameState = {
      ...this.gameState,
      [playerKey]: newPlayerState,
    };

    // Add to game log
    this.addGameEvent(
      player,
      "card_played",
      `${player === "player" ? "You" : "Opponent"} played ${card.name}`
    );

    this.notifyGameStateChange();
    return true;
  }

  // Find empty monster zone
  private findEmptyMonsterZone(playerState: PlayerState): number {
    return playerState.monsterZones.findIndex((zone) => zone === null);
  }

  // Find empty spell/trap zone
  private findEmptySpellTrapZone(playerState: PlayerState): number {
    return playerState.spellTrapZones.findIndex((zone) => zone === null);
  }

  // Execute an attack
  private attack(
    player: "player" | "opponent",
    attackerId: string,
    targetIndex?: number
  ): boolean {
    const attackerKey = player === "player" ? "player" : "opponent";
    const defenderKey = player === "player" ? "opponent" : "player";
    const attackerState = this.gameState[attackerKey];
    const defenderState = this.gameState[defenderKey];

    const attacker = attackerState.monsterZones.find(
      (card) => card?.id === attackerId
    );
    if (!attacker || attacker.type !== "monster") return false;

    let damage = 0;
    let message = "";
    let newAttackerState = attackerState;
    let newDefenderState = defenderState;

    if (targetIndex !== undefined) {
      // Attack monster
      const defender = defenderState.monsterZones[targetIndex];
      if (!defender || defender.type !== "monster") return false;

      if (attacker.attack! > defender.attack!) {
        // Attacker wins
        const newDefenderMonsterZones = [...defenderState.monsterZones];
        newDefenderMonsterZones[targetIndex] = null;
        newDefenderState = {
          ...defenderState,
          monsterZones: newDefenderMonsterZones,
          graveyard: [...defenderState.graveyard, defender],
        };
        damage = attacker.attack! - defender.attack!;
        message = `${attacker.name} destroyed ${defender.name}!`;
      } else if (defender.attack! > attacker.attack!) {
        // Defender wins
        const newAttackerMonsterZones = [...attackerState.monsterZones];
        newAttackerMonsterZones[attacker.zoneIndex!] = null;
        newAttackerState = {
          ...attackerState,
          monsterZones: newAttackerMonsterZones,
          graveyard: [...attackerState.graveyard, attacker],
        };
        damage = defender.attack! - attacker.attack!;
        message = `${defender.name} destroyed ${attacker.name}!`;
      } else {
        // Mutual destruction
        const newAttackerMonsterZones = [...attackerState.monsterZones];
        const newDefenderMonsterZones = [...defenderState.monsterZones];
        newAttackerMonsterZones[attacker.zoneIndex!] = null;
        newDefenderMonsterZones[targetIndex] = null;
        newAttackerState = {
          ...attackerState,
          monsterZones: newAttackerMonsterZones,
          graveyard: [...attackerState.graveyard, attacker],
        };
        newDefenderState = {
          ...defenderState,
          monsterZones: newDefenderMonsterZones,
          graveyard: [...defenderState.graveyard, defender],
        };
        message = `${attacker.name} and ${defender.name} destroyed each other!`;
      }
    } else {
      // Direct attack
      damage = attacker.attack!;
      message = `${attacker.name} attacks directly for ${damage} damage!`;
    }

    // Apply damage
    if (damage > 0) {
      newDefenderState = {
        ...newDefenderState,
        lifePoints: newDefenderState.lifePoints - damage,
      };
      this.addGameEvent(player, "damage", message);

      // Check for game end and create new gameState
      if (newDefenderState.lifePoints <= 0) {
        const winner = player === "player" ? "opponent" : "player";
        this.gameState = {
          ...this.gameState,
          [attackerKey]: newAttackerState,
          [defenderKey]: newDefenderState,
          winner,
        };
        this.onGameEnd?.(winner);
      } else {
        // Update gameState without winner
        this.gameState = {
          ...this.gameState,
          [attackerKey]: newAttackerState,
          [defenderKey]: newDefenderState,
        };
      }
    } else {
      // Update gameState even if no damage
      this.gameState = {
        ...this.gameState,
        [attackerKey]: newAttackerState,
        [defenderKey]: newDefenderState,
      };
    }

    this.notifyGameStateChange();
    return true;
  }

  // Execute direct attack
  private directAttack(
    player: "player" | "opponent",
    attackerId: string
  ): boolean {
    return this.attack(player, attackerId);
  }

  // Change game phase
  private changePhase(): boolean {
    const phases: GamePhase[] = ["Draw", "Main1", "Battle", "Main2", "End"];
    const currentIndex = phases.indexOf(this.gameState.currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;

    // Create new gameState object with updated phase (immutable update)
    this.gameState = {
      ...this.gameState,
      currentPhase: phases[nextIndex],
    };

    this.addGameEvent(
      this.gameState.currentTurn,
      "phase_change",
      `Phase changed to ${this.gameState.currentPhase}`
    );

    this.notifyGameStateChange();
    return true;
  }

  // End current turn
  private endTurn(): boolean {
    const nextPlayer =
      this.gameState.currentTurn === "player" ? "opponent" : "player";

    // Reset battle positions for next turn (create new monster zones)
    const currentPlayerKey =
      this.gameState.currentTurn === "player" ? "player" : "opponent";
    const currentPlayerState = this.gameState[currentPlayerKey];
    const updatedMonsterZones = currentPlayerState.monsterZones.map((monster) =>
      monster ? { ...monster, battlePosition: "attack" as const } : null
    );

    // Draw phase for next player (create new deck and hand)
    const nextPlayerKey = nextPlayer === "player" ? "player" : "opponent";
    const nextPlayerState = this.gameState[nextPlayerKey];
    let updatedNextPlayerState = nextPlayerState;

    if (nextPlayerState.mainDeck.length > 0) {
      const newMainDeck = [...nextPlayerState.mainDeck];
      const drawnCard = newMainDeck.pop()!;
      const newHand = [...nextPlayerState.hand, drawnCard];

      updatedNextPlayerState = {
        ...nextPlayerState,
        mainDeck: newMainDeck,
        hand: newHand,
      };

      this.addGameEvent(
        nextPlayer,
        "turn_end",
        `${nextPlayer === "player" ? "Your" : "Opponent's"} turn ended. Drew ${
          drawnCard.name
        }`
      );
    }

    // Create new gameState object with all updates (immutable update)
    this.gameState = {
      ...this.gameState,
      currentTurn: nextPlayer,
      currentPhase: "Draw",
      turnNumber: this.gameState.turnNumber + 1,
      [currentPlayerKey]: {
        ...currentPlayerState,
        monsterZones: updatedMonsterZones,
      },
      [nextPlayerKey]: updatedNextPlayerState,
    };

    this.notifyGameStateChange();
    return true;
  }

  // Add event to game log
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

    // Create new gameState with updated game log (immutable update)
    this.gameState = {
      ...this.gameState,
      gameLog: [...this.gameState.gameLog, event],
    };
  }

  // Notify subscribers of game state changes
  private notifyGameStateChange(): void {
    console.log(
      "GameEngine: Notifying game state change, current turn:",
      this.gameState.currentTurn
    );
    this.onGameStateChange?.(this.gameState);
  }

  // Draw a card (for player action)
  public drawCard(player: "player" | "opponent"): boolean {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    if (playerState.mainDeck.length === 0) return false;

    // Create new deck and hand arrays (immutable update)
    const newMainDeck = [...playerState.mainDeck];
    const drawnCard = newMainDeck.pop()!;
    const newHand = [...playerState.hand, drawnCard];

    // Update game state with new player state
    this.gameState = {
      ...this.gameState,
      [playerKey]: {
        ...playerState,
        mainDeck: newMainDeck,
        hand: newHand,
      },
    };

    this.addGameEvent(
      player,
      "card_played",
      `${player === "player" ? "You" : "Opponent"} drew a card`
    );
    this.notifyGameStateChange();
    return true;
  }

  // Get available actions for current phase
  public getAvailableActions(): string[] {
    const actions: string[] = [];

    if (this.gameState.currentPhase === "Draw") {
      actions.push("DRAW_CARD");
    }

    if (
      this.gameState.currentPhase === "Main1" ||
      this.gameState.currentPhase === "Main2"
    ) {
      actions.push("PLAY_MONSTER", "PLAY_SPELL", "PLAY_TRAP");
    }

    if (this.gameState.currentPhase === "Battle") {
      actions.push("ATTACK", "DIRECT_ATTACK");
    }

    actions.push("CHANGE_PHASE", "END_TURN");
    return actions;
  }
}
