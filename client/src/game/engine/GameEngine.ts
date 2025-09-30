import {
  type GameState,
  type GamePhase,
  type PlayerState,
  type GameEvent,
  type CardInPlay,
  type GameAction,
  type GameZones,
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
      zones: {
        mainMonsterZones: Array(5).fill(null),
      },
      graveyard: [],
      banished: [],
      mainDeck: shuffledPlayerDeck.slice(5), // Rest of deck
    };

    const aiState: PlayerState = {
      lifePoints: 8000,
      hand: shuffledAIDeck.slice(0, 5),
      zones: {
        mainMonsterZones: Array(5).fill(null),
      },
      graveyard: [],
      banished: [],
      mainDeck: shuffledAIDeck.slice(5),
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
    const { type, player, cardId, zoneIndex, targetId } = action;

    switch (type) {
      case "ATTACK":
        // For ATTACK, targetId contains the zone index as a string
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
      case "SET_MONSTER":
        return this.setMonster(player, cardId!, zoneIndex);
      default:
        return false;
    }
  }

  // Find empty monster zone
  private findEmptyMonsterZone(playerState: PlayerState): number {
    return playerState.zones.mainMonsterZones.findIndex(
      (zone) => zone === null
    );
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

    // Find attacker in any monster zone (main or extra)
    const attacker = this.findMonsterById(attackerState, attackerId);
    if (!attacker || attacker.type !== "monster") return false;

    // Check if monster can attack
    if (attacker.attackUsed || attacker.summonedThisTurn) return false;

    let damage = 0;
    let message = "";
    let newAttackerState = attackerState;
    let newDefenderState = defenderState;

    if (targetIndex !== undefined) {
      // Attack monster
      const defender = this.findMonsterByZoneIndex(defenderState, targetIndex);
      if (!defender || defender.type !== "monster") return false;

      // Calculate battle damage
      if (attacker.attack! > defender.attack!) {
        // Attacker wins
        const result = this.destroyMonster(defenderState, targetIndex);
        newDefenderState = result.newState;
        damage = attacker.attack! - defender.attack!;
        message = `${attacker.name} destroyed ${defender.name}!`;
      } else if (defender.attack! > attacker.attack!) {
        // Defender wins
        const attackerZoneIndex = this.findMonsterZoneIndex(
          attackerState,
          attackerId
        );
        if (attackerZoneIndex !== -1) {
          const result = this.destroyMonster(attackerState, attackerZoneIndex);
          newAttackerState = result.newState;
        }
        damage = defender.attack! - attacker.attack!;
        message = `${defender.name} destroyed ${attacker.name}!`;
      } else {
        // Mutual destruction
        const attackerZoneIndex = this.findMonsterZoneIndex(
          attackerState,
          attackerId
        );
        let mutualAttackerState = attackerState;
        let mutualDefenderState = defenderState;

        if (attackerZoneIndex !== -1) {
          const result = this.destroyMonster(attackerState, attackerZoneIndex);
          mutualAttackerState = result.newState;
        }

        const defenderResult = this.destroyMonster(defenderState, targetIndex);
        mutualDefenderState = defenderResult.newState;

        newAttackerState = mutualAttackerState;
        newDefenderState = mutualDefenderState;
        message = `${attacker.name} and ${defender.name} destroyed each other!`;
      }
    } else {
      // Direct attack
      damage = attacker.attack!;
      message = `${attacker.name} attacks directly for ${damage} damage!`;
    }

    // Mark attacker as having attacked
    if (attacker.attackUsed === false) {
      const attackerZoneIndex = this.findMonsterZoneIndex(
        attackerState,
        attackerId
      );
      if (attackerZoneIndex !== -1) {
        const newZones = { ...attackerState.zones };
        const zoneArray = newZones.mainMonsterZones as (CardInPlay | null)[];
        const newZoneArray = [...zoneArray];
        if (newZoneArray[attackerZoneIndex]) {
          newZoneArray[attackerZoneIndex] = {
            ...newZoneArray[attackerZoneIndex]!,
            attackUsed: true,
          };
          newZones.mainMonsterZones = newZoneArray;
        }
        newAttackerState = { ...attackerState, zones: newZones };
      }
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

  // Helper method to find monster by ID in any zone
  private findMonsterById(
    playerState: PlayerState,
    cardId: string
  ): CardInPlay | null {
    // Search main monster zones
    for (const monster of playerState.zones.mainMonsterZones) {
      if (monster?.id === cardId) return monster;
    }

    return null;
  }

  // Helper method to find monster by zone index
  private findMonsterByZoneIndex(
    playerState: PlayerState,
    zoneIndex: number
  ): CardInPlay | null {
    return playerState.zones.mainMonsterZones[zoneIndex];
  }

  // Helper method to find monster zone index
  private findMonsterZoneIndex(
    playerState: PlayerState,
    cardId: string
  ): number {
    return playerState.zones.mainMonsterZones.findIndex(
      (card) => card?.id === cardId
    );
  }

  // Helper method to destroy a monster
  private destroyMonster(
    playerState: PlayerState,
    zoneIndex: number
  ): { newState: PlayerState; destroyedCard: CardInPlay } {
    const zones = { ...playerState.zones };
    const zoneArray = zones.mainMonsterZones as (CardInPlay | null)[];
    const newZoneArray = [...zoneArray];
    const destroyedCard = newZoneArray[zoneIndex]!;

    newZoneArray[zoneIndex] = null;
    zones.mainMonsterZones = newZoneArray;

    return {
      newState: {
        ...playerState,
        zones,
        graveyard: [...playerState.graveyard, destroyedCard],
      },
      destroyedCard,
    };
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
    const phases: GamePhase[] = ["Main", "Battle"];
    const currentIndex = phases.indexOf(this.gameState.currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;

    // Check if we're transitioning from Battle phase (end of turn)
    if (this.gameState.currentPhase === "Battle") {
      // End the current turn instead of just changing phase
      return this.endTurn();
    }

    // Calculate the next phase
    const nextPhase = phases[nextIndex];

    // Add game event for the phase change
    this.addGameEvent(
      this.gameState.currentTurn,
      "phase_change",
      `Phase changed to ${nextPhase}`
    );

    // Create new gameState object with updated phase (immutable update)
    this.gameState = {
      ...this.gameState,
      currentPhase: nextPhase,
    };

    // Handle phase-specific logic for the new phase
    this.handlePhaseLogic();

    this.notifyGameStateChange();
    return true;
  }

  // Handle phase-specific logic
  private handlePhaseLogic(): void {
    const currentPhase = this.gameState.currentPhase;
    const currentTurn = this.gameState.currentTurn;

    switch (currentPhase) {
      case "Main":
        this.handleMainPhase(currentTurn);
        break;
      case "Battle":
        this.handleBattlePhase(currentTurn);
        break;
    }
  }

  // Handle main phase logic
  private handleMainPhase(player: "player" | "opponent"): void {
    // Reset attack usage for monsters
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];
    const zones = { ...playerState.zones };

    // Reset attack usage for monsters
    const mainMonsterZones = zones.mainMonsterZones.map((monster) =>
      monster ? { ...monster, attackUsed: false } : null
    );
    zones.mainMonsterZones = mainMonsterZones;

    // Only reset hasSetMonster flag (hasNormalSummoned is reset only at end of turn)
    this.gameState = {
      ...this.gameState,
      [playerKey]: {
        ...playerState,
        zones,
        hasSetMonster: false,
      },
    };

    this.addGameEvent(
      player,
      "phase_change",
      `${player === "player" ? "Your" : "Opponent's"} Main Phase`
    );
  }

  // Handle battle phase logic
  private handleBattlePhase(player: "player" | "opponent"): void {
    this.addGameEvent(
      player,
      "phase_change",
      `${player === "player" ? "Your" : "Opponent's"} Battle Phase`
    );
  }

  // End current turn
  private endTurn(): boolean {
    const nextPlayer =
      this.gameState.currentTurn === "player" ? "opponent" : "player";
    const currentPlayerKey =
      this.gameState.currentTurn === "player" ? "player" : "opponent";

    // Add turn end event before changing state
    this.addGameEvent(
      this.gameState.currentTurn,
      "turn_end",
      `${
        this.gameState.currentTurn === "player" ? "Your" : "Opponent's"
      } turn ended`
    );

    // Reset monster states for next turn
    const currentPlayerState = this.gameState[currentPlayerKey];
    const zones = { ...currentPlayerState.zones };

    // Reset attack usage and summoned this turn flags
    const mainMonsterZones = zones.mainMonsterZones.map((monster) =>
      monster
        ? { ...monster, attackUsed: false, summonedThisTurn: false }
        : null
    );
    zones.mainMonsterZones = mainMonsterZones;

    // Reset normal summon flags
    const updatedCurrentPlayerState = {
      ...currentPlayerState,
      zones,
      hasNormalSummoned: false,
      hasSetMonster: false,
    };

    // Auto-draw a card for the next player
    const nextPlayerKey = nextPlayer === "player" ? "player" : "opponent";
    const nextPlayerState = this.gameState[nextPlayerKey];
    const newTurnNumber = this.gameState.turnNumber + 1;
    const shouldDraw = !(newTurnNumber === 1 && nextPlayer === "player");

    let updatedNextPlayerState = nextPlayerState;
    if (shouldDraw && nextPlayerState.mainDeck.length > 0) {
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
        "card_played",
        `${nextPlayer === "player" ? "You" : "Opponent"} drew ${drawnCard.name}`
      );
    } else if (shouldDraw && nextPlayerState.mainDeck.length === 0) {
      // Player loses due to no cards to draw
      const winner = nextPlayer === "player" ? "opponent" : "player";
      this.gameState = {
        ...this.gameState,
        winner,
      };
      this.notifyGameStateChange();
      this.onGameEnd?.(winner);
      return false;
    }

    // Create new gameState object with all updates (immutable update)
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
    const currentPhase = this.gameState.currentPhase;
    const currentTurn = this.gameState.currentTurn;
    const playerKey = currentTurn === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    switch (currentPhase) {
      case "Main":
        // Normal summon/set
        if (!playerState.hasNormalSummoned) {
          actions.push("NORMAL_SUMMON", "SET_MONSTER");
        }
        break;

      case "Battle":
        // Attack with monsters
        const monsters = playerState.zones.mainMonsterZones.filter(
          (card) => card && !card.attackUsed && !card.summonedThisTurn
        );
        if (monsters.length > 0) {
          actions.push("ATTACK", "DIRECT_ATTACK");
        }
        break;
    }

    // Always available actions
    actions.push("CHANGE_PHASE");
    actions.push("END_TURN");

    return actions;
  }

  // Find a card by ID in any zone (normal monsters only)
  private findCardById(
    playerState: PlayerState,
    cardId: string
  ): CardInPlay | null {
    // Check hand
    const handCard = playerState.hand.find((card) => card.id === cardId);
    if (handCard) return handCard as CardInPlay;

    // Check main monster zones
    for (const card of playerState.zones.mainMonsterZones) {
      if (card?.id === cardId) return card;
    }

    return null;
  }

  // Normal Summon a monster
  public normalSummon(
    player: "player" | "opponent",
    cardId: string,
    zoneIndex?: number
  ): boolean {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    // Check if player already normal summoned this turn
    if (playerState.hasNormalSummoned) return false;

    // Check if it's the correct phase
    if (this.gameState.currentPhase !== "Main") return false;

    // Find the card in hand
    const cardIndex = playerState.hand.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) return false;

    const card = playerState.hand[cardIndex];

    // Check if it's a monster
    if (card.type !== "monster") return false;

    // Check level requirements for tribute summon
    if (card.level! >= 7) {
      // Need 2 tributes
      const tributeCount = this.getTributeCount(playerState, 2);
      if (tributeCount < 2) return false;
    } else if (card.level! >= 5) {
      // Need 1 tribute
      const tributeCount = this.getTributeCount(playerState, 1);
      if (tributeCount < 1) return false;
    }

    // Perform tribute if needed
    let newPlayerState = playerState;
    if (card.level! >= 5) {
      const tributeResult = this.performTributeSummon(
        playerState,
        card.level! >= 7 ? 2 : 1
      );
      newPlayerState = tributeResult.newState;
    }

    // Find empty monster zone
    const targetZoneIndex =
      zoneIndex ?? this.findEmptyMonsterZone(newPlayerState);
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
    const newHand = [...newPlayerState.hand];
    newHand.splice(cardIndex, 1);

    const newZones = { ...newPlayerState.zones };
    const zoneArray = newZones.mainMonsterZones as (CardInPlay | null)[];
    const newZoneArray = [...zoneArray];
    newZoneArray[targetZoneIndex] = cardInPlay;
    newZones.mainMonsterZones = newZoneArray;

    // Update player state
    const updatedPlayerState = {
      ...newPlayerState,
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

  // Set a monster in face-down defense position
  public setMonster(
    player: "player" | "opponent",
    cardId: string,
    zoneIndex?: number
  ): boolean {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    // Check if player already set a monster this turn
    if (playerState.hasSetMonster) return false;

    // Check if it's the correct phase
    if (this.gameState.currentPhase !== "Main") return false;

    // Find the card in hand
    const cardIndex = playerState.hand.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) return false;

    const card = playerState.hand[cardIndex];

    // Check if it's a monster
    if (card.type !== "monster") return false;

    // Find empty monster zone
    const targetZoneIndex = zoneIndex ?? this.findEmptyMonsterZone(playerState);
    if (targetZoneIndex === -1) return false;

    // Create card in play (face-down)
    const cardInPlay: CardInPlay = {
      ...card,
      position: "monster",
      zoneIndex: targetZoneIndex,
      battlePosition: "defense",
      faceDown: true,
      faceUp: false,
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
      hasSetMonster: true,
    };

    // Update game state
    this.gameState = {
      ...this.gameState,
      [playerKey]: updatedPlayerState,
    };

    this.addGameEvent(
      player,
      "summon",
      `${player === "player" ? "You" : "Opponent"} Set ${card.name}`
    );

    this.notifyGameStateChange();
    return true;
  }

  // Get tribute count for tribute summons
  private getTributeCount(playerState: PlayerState, _required: number): number {
    const monsters = playerState.zones.mainMonsterZones.filter(
      (card) => card !== null
    );
    return monsters.length;
  }

  // Perform tribute for tribute summon
  private performTributeSummon(
    playerState: PlayerState,
    tributeCount: number
  ): { newState: PlayerState; tributedCards: CardInPlay[] } {
    const zones = { ...playerState.zones };
    const mainMonsterZones = zones.mainMonsterZones as (CardInPlay | null)[];
    const newZoneArray = [...mainMonsterZones];
    const tributedCards: CardInPlay[] = [];

    // For now, tribute the rightmost monsters (simplified logic)
    for (let i = newZoneArray.length - 1; i >= 0 && tributeCount > 0; i--) {
      if (newZoneArray[i]) {
        tributedCards.push(newZoneArray[i]!);
        newZoneArray[i] = null;
        tributeCount--;
      }
    }

    zones.mainMonsterZones = newZoneArray;

    return {
      newState: {
        ...playerState,
        zones,
        graveyard: [...playerState.graveyard, ...tributedCards],
      },
      tributedCards,
    };
  }
}
