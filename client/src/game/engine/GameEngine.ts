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
    const playerState =
      player === "player" ? this.gameState.player : this.gameState.opponent;
    const cardIndex = playerState.hand.findIndex((card) => card.id === cardId);

    if (cardIndex === -1) return false;

    const card = playerState.hand[cardIndex];

    // Determine target zone
    let targetZone: (CardInPlay | null)[];
    let targetIndex: number;

    if (card.type === "monster") {
      targetZone = playerState.monsterZones;
      targetIndex = zoneIndex ?? this.findEmptyMonsterZone(playerState);
    } else {
      targetZone = playerState.spellTrapZones;
      targetIndex = zoneIndex ?? this.findEmptySpellTrapZone(playerState);
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

    // Move card to field
    targetZone[targetIndex] = cardInPlay;
    playerState.hand.splice(cardIndex, 1);

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
    const attackerState =
      player === "player" ? this.gameState.player : this.gameState.opponent;
    const defenderState =
      player === "player" ? this.gameState.opponent : this.gameState.player;

    const attacker = attackerState.monsterZones.find(
      (card) => card?.id === attackerId
    );
    if (!attacker || attacker.type !== "monster") return false;

    let damage = 0;
    let message = "";

    if (targetIndex !== undefined) {
      // Attack monster
      const defender = defenderState.monsterZones[targetIndex];
      if (!defender || defender.type !== "monster") return false;

      if (attacker.attack! > defender.attack!) {
        // Attacker wins
        defenderState.monsterZones[targetIndex] = null;
        defenderState.graveyard.push(defender);
        damage = attacker.attack! - defender.attack!;
        message = `${attacker.name} destroyed ${defender.name}!`;
      } else if (defender.attack! > attacker.attack!) {
        // Defender wins
        attackerState.monsterZones[attacker.zoneIndex!] = null;
        attackerState.graveyard.push(attacker);
        damage = defender.attack! - attacker.attack!;
        message = `${defender.name} destroyed ${attacker.name}!`;
      } else {
        // Mutual destruction
        attackerState.monsterZones[attacker.zoneIndex!] = null;
        defenderState.monsterZones[targetIndex] = null;
        attackerState.graveyard.push(attacker);
        defenderState.graveyard.push(defender);
        message = `${attacker.name} and ${defender.name} destroyed each other!`;
      }
    } else {
      // Direct attack
      damage = attacker.attack!;
      message = `${attacker.name} attacks directly for ${damage} damage!`;
    }

    // Apply damage
    if (damage > 0) {
      defenderState.lifePoints -= damage;
      this.addGameEvent(player, "damage", message);

      // Check for game end
      if (defenderState.lifePoints <= 0) {
        this.gameState.winner = player === "player" ? "opponent" : "player";
        this.onGameEnd?.(this.gameState.winner);
      }
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

    this.gameState.currentPhase = phases[nextIndex];
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

    // Reset battle positions for next turn
    const currentPlayerState =
      this.gameState.currentTurn === "player"
        ? this.gameState.player
        : this.gameState.opponent;
    currentPlayerState.monsterZones.forEach((monster) => {
      if (monster) {
        monster.battlePosition = "attack";
      }
    });

    // Draw phase for next player
    const nextPlayerState =
      nextPlayer === "player" ? this.gameState.player : this.gameState.opponent;
    if (nextPlayerState.mainDeck.length > 0) {
      const drawnCard = nextPlayerState.mainDeck.pop()!;
      nextPlayerState.hand.push(drawnCard);
      this.addGameEvent(
        nextPlayer,
        "turn_end",
        `${nextPlayer === "player" ? "Your" : "Opponent's"} turn ended. Drew ${
          drawnCard.name
        }`
      );
    }

    this.gameState.currentTurn = nextPlayer;
    this.gameState.currentPhase = "Draw";
    this.gameState.turnNumber++;

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

    this.gameState.gameLog.push(event);
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
    const playerState =
      player === "player" ? this.gameState.player : this.gameState.opponent;

    if (playerState.mainDeck.length === 0) return false;

    const drawnCard = playerState.mainDeck.pop()!;
    playerState.hand.push(drawnCard);

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
