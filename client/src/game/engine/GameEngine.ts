import {
  type GameState,
  type GamePhase,
  type PlayerState,
  type GameEvent,
  type CardInPlay,
  type GameAction,
  type GameZones,
  type ChainLink,
  type SpellSpeed,
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
        extraMonsterZones: Array(2).fill(null),
        spellTrapZones: Array(5).fill(null),
        fieldZone: null,
        pendulumZones: { left: null, right: null },
      },
      graveyard: [],
      banished: [],
      extraDeck: [],
      mainDeck: shuffledPlayerDeck.slice(5), // Rest of deck
    };

    const aiState: PlayerState = {
      lifePoints: 8000,
      hand: shuffledAIDeck.slice(0, 5),
      zones: {
        mainMonsterZones: Array(5).fill(null),
        extraMonsterZones: Array(2).fill(null),
        spellTrapZones: Array(5).fill(null),
        fieldZone: null,
        pendulumZones: { left: null, right: null },
      },
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
      chains: [],
      pendingEffects: [],
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
      case "NORMAL_SUMMON":
        return this.normalSummon(player, cardId!, zoneIndex);
      case "SET_MONSTER":
        return this.setMonster(player, cardId!, zoneIndex);
      case "SPECIAL_SUMMON":
        return this.specialSummon(player, cardId!, zoneIndex);
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
    let targetIndex: number | undefined;
    let targetZone: keyof GameZones;
    let isFieldZone = false;

    if (card.type === "monster") {
      targetZone = "mainMonsterZones";
      targetIndex = zoneIndex ?? this.findEmptyMonsterZone(playerState);
    } else if (card.spellType === "Field") {
      targetZone = "fieldZone";
      isFieldZone = true;
    } else {
      targetZone = "spellTrapZones";
      targetIndex = zoneIndex ?? this.findEmptySpellTrapZone(playerState);
    }

    if (
      (targetIndex === -1 && !isFieldZone) ||
      (isFieldZone && playerState.zones.fieldZone !== null)
    ) {
      return false;
    }

    // Create card in play
    const cardInPlay: CardInPlay = {
      ...card,
      position:
        card.type === "monster"
          ? "monster"
          : card.spellType === "Field"
          ? "field"
          : "spellTrap",
      zoneIndex: isFieldZone ? undefined : targetIndex,
      battlePosition: card.type === "monster" ? "attack" : undefined,
      faceDown:
        card.type === "trap" ||
        (card.type === "spell" && card.spellType !== "Field"),
      faceUp: card.type === "spell" && card.spellType === "Field",
      summonedThisTurn: card.type === "monster",
    };

    // Create new player state with updated zones and hand (immutable update)
    const newHand = [...playerState.hand];
    newHand.splice(cardIndex, 1);

    const newZones = { ...playerState.zones };

    if (isFieldZone) {
      newZones.fieldZone = cardInPlay;
    } else if (targetIndex !== undefined) {
      const zoneArray = newZones[targetZone] as (CardInPlay | null)[];
      const newZoneArray = [...zoneArray];
      newZoneArray[targetIndex] = cardInPlay;
      (newZones as any)[targetZone] = newZoneArray;

      // Update pendulum zones if applicable
      if (
        targetZone === "spellTrapZones" &&
        card.type === "monster" &&
        card.monsterCategory === "Pendulum"
      ) {
        if (targetIndex === 0) {
          newZones.pendulumZones = {
            ...newZones.pendulumZones,
            left: cardInPlay,
          };
        } else if (targetIndex === 4) {
          newZones.pendulumZones = {
            ...newZones.pendulumZones,
            right: cardInPlay,
          };
        }
      }
    }

    const newPlayerState: PlayerState = {
      ...playerState,
      hand: newHand,
      zones: newZones,
    };

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
    return playerState.zones.mainMonsterZones.findIndex(
      (zone) => zone === null
    );
  }

  // Find empty spell/trap zone
  private findEmptySpellTrapZone(playerState: PlayerState): number {
    return playerState.zones.spellTrapZones.findIndex((zone) => zone === null);
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

    // Search extra monster zones
    for (const monster of playerState.zones.extraMonsterZones) {
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
    const phases: GamePhase[] = [
      "Draw",
      "Standby",
      "Main1",
      "Battle",
      "Main2",
      "End",
    ];
    const currentIndex = phases.indexOf(this.gameState.currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;

    // Check if we're transitioning from End phase to Draw phase (end of turn)
    if (this.gameState.currentPhase === "End") {
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
      case "Draw":
        this.handleDrawPhase(currentTurn);
        break;
      case "Standby":
        this.handleStandbyPhase(currentTurn);
        break;
      case "Main1":
        this.handleMainPhase(currentTurn);
        break;
      case "Battle":
        this.handleBattlePhase(currentTurn);
        break;
      case "Main2":
        this.handleMainPhase(currentTurn);
        break;
      case "End":
        this.handleEndPhase(currentTurn);
        break;
    }
  }

  // Handle draw phase logic
  private handleDrawPhase(player: "player" | "opponent"): void {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    // First turn player doesn't draw
    if (this.gameState.turnNumber === 1 && player === "player") {
      return;
    }

    if (playerState.mainDeck.length === 0) {
      // Player loses due to no cards to draw
      const winner = player === "player" ? "opponent" : "player";
      this.gameState = {
        ...this.gameState,
        winner,
      };
      this.onGameEnd?.(winner);
      return;
    }

    // Draw a card
    const newMainDeck = [...playerState.mainDeck];
    const drawnCard = newMainDeck.pop()!;
    const newHand = [...playerState.hand, drawnCard];

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
      `${player === "player" ? "You" : "Opponent"} drew ${drawnCard.name}`
    );
  }

  // Handle standby phase logic
  private handleStandbyPhase(player: "player" | "opponent"): void {
    // Handle effects that activate during standby phase
    this.addGameEvent(
      player,
      "phase_change",
      `${player === "player" ? "Your" : "Opponent's"} Standby Phase`
    );
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

    // Reset normal summon flag
    this.gameState = {
      ...this.gameState,
      [playerKey]: {
        ...playerState,
        zones,
        hasNormalSummoned: false,
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

  // Handle end phase logic
  private handleEndPhase(player: "player" | "opponent"): void {
    // Discard down to 6 cards in hand
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    if (playerState.hand.length > 6) {
      const cardsToDiscard = playerState.hand.length - 6;
      const newHand = playerState.hand.slice(0, 6);
      const discardedCards = playerState.hand.slice(6);

      this.gameState = {
        ...this.gameState,
        [playerKey]: {
          ...playerState,
          hand: newHand,
          graveyard: [...playerState.graveyard, ...discardedCards],
        },
      };

      this.addGameEvent(
        player,
        "phase_change",
        `${
          player === "player" ? "You" : "Opponent"
        } discarded ${cardsToDiscard} card(s) to the Graveyard`
      );
    }

    this.addGameEvent(
      player,
      "phase_change",
      `${player === "player" ? "Your" : "Opponent's"} End Phase`
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

    // Create new gameState object with all updates (immutable update)
    this.gameState = {
      ...this.gameState,
      currentTurn: nextPlayer,
      currentPhase: "Draw",
      turnNumber: this.gameState.turnNumber + 1,
      [currentPlayerKey]: updatedCurrentPlayerState,
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
      case "Draw":
        // First turn player doesn't draw
        if (!(this.gameState.turnNumber === 1 && currentTurn === "player")) {
          actions.push("DRAW_CARD");
        }
        break;

      case "Standby":
        // Effects can activate here
        actions.push("ACTIVATE_EFFECT");
        break;

      case "Main1":
      case "Main2":
        // Normal summon/set
        if (!playerState.hasNormalSummoned) {
          actions.push("NORMAL_SUMMON", "SET_MONSTER");
        }

        // Special summons
        actions.push("SPECIAL_SUMMON");

        // Play spells/traps
        actions.push("PLAY_SPELL", "PLAY_TRAP", "SET_SPELL", "SET_TRAP");

        // Change positions
        actions.push("CHANGE_POSITION");

        // Activate effects
        actions.push("ACTIVATE_EFFECT");
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

      case "End":
        // Effects can activate here
        actions.push("ACTIVATE_EFFECT");
        break;
    }

    // Always available actions
    if (currentPhase !== "End") {
      actions.push("CHANGE_PHASE");
    }
    actions.push("END_TURN");

    return actions;
  }

  // Activate a card effect
  public activateEffect(
    player: "player" | "opponent",
    cardId: string,
    effectId?: string
  ): boolean {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    // Find the card in any zone
    const card = this.findCardById(playerState, cardId);
    if (!card) return false;

    // Check if effect can be activated in current phase
    if (!this.canActivateEffect(card, effectId)) return false;

    // Check spell speed compatibility
    const effectSpellSpeed = this.getEffectSpellSpeed(card, effectId);
    if (!this.canActivateInChain(effectSpellSpeed)) return false;

    // Create chain link
    const chainLink: ChainLink = {
      id: `chain_${Date.now()}_${Math.random()}`,
      cardId: cardId,
      player,
      spellSpeed: effectSpellSpeed,
      effect: effectId || card.effect || "Card effect",
      resolved: false,
    };

    // Add to chains
    const newChains = [...this.gameState.chains, chainLink];
    this.gameState = {
      ...this.gameState,
      chains: newChains,
    };

    this.addGameEvent(
      player,
      "effect_activated",
      `${player === "player" ? "You" : "Opponent"} activated ${
        card.name
      } effect (Chain Link ${newChains.length})`
    );

    // Check if chain is complete and resolve if needed
    if (this.isChainComplete()) {
      this.resolveChain();
    }

    this.notifyGameStateChange();
    return true;
  }

  // Check if an effect can be activated in the current chain
  private canActivateInChain(spellSpeed: SpellSpeed): boolean {
    const currentChains = this.gameState.chains;

    if (currentChains.length === 0) {
      // First effect in chain can always activate
      return true;
    }

    const lastChainLink = currentChains[currentChains.length - 1];

    // Can only chain if spell speed is equal or higher
    return spellSpeed >= lastChainLink.spellSpeed;
  }

  // Check if chain is complete (both players pass)
  private isChainComplete(): boolean {
    // Simplified: for now, we'll auto-resolve chains with more than 1 link
    // In a full implementation, this would wait for both players to pass
    return this.gameState.chains.length > 1;
  }

  // Resolve the current chain
  private resolveChain(): void {
    const chains = [...this.gameState.chains];
    chains.reverse(); // Resolve in reverse order (last activated first)

    this.addGameEvent(
      this.gameState.currentTurn,
      "chain_resolved",
      `Chain resolved with ${chains.length} links`
    );

    // Process each chain link
    for (const chainLink of chains) {
      this.resolveChainLink(chainLink);
    }

    // Clear chains
    this.gameState = {
      ...this.gameState,
      chains: [],
    };
  }

  // Resolve a single chain link
  private resolveChainLink(chainLink: ChainLink): void {
    const playerKey = chainLink.player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    // Find the card
    const card = this.findCardById(playerState, chainLink.cardId);
    if (!card) return;

    // Mark as resolved
    chainLink.resolved = true;

    // Apply the effect based on card type and effect
    this.applyCardEffect(card, chainLink.effect, chainLink.player);

    this.addGameEvent(
      chainLink.player,
      "chain_resolved",
      `${card.name} effect resolved`
    );
  }

  // Apply a card effect
  private applyCardEffect(
    card: CardInPlay,
    effect: string,
    player: "player" | "opponent"
  ): void {
    // This is where specific card effects would be implemented
    // For now, we'll handle some basic effects
    const effectLower = effect.toLowerCase();

    if (effectLower.includes("destroy") && effectLower.includes("spell")) {
      // Destroy spell/trap cards
      this.destroySpellsAndTraps(card, player);
    } else if (effectLower.includes("draw")) {
      // Draw cards
      this.drawCards(card, player, 1);
    } else if (effectLower.includes("damage")) {
      // Deal damage
      const damage = this.extractDamageFromEffect(effect);
      this.dealEffectDamage(player, damage);
    }

    // Handle continuous effects
    if (card.effectType === "Continuous") {
      // Apply continuous effects - this would be more complex in a full implementation
    }
  }

  // Helper method to destroy spells and traps
  private destroySpellsAndTraps(
    _card: CardInPlay,
    player: "player" | "opponent"
  ): void {
    const opponentKey = player === "player" ? "opponent" : "player";
    const opponentState = this.gameState[opponentKey];

    const zones = { ...opponentState.zones };
    const spellTrapZones = zones.spellTrapZones as (CardInPlay | null)[];
    const destroyedCards: CardInPlay[] = [];

    // Destroy all face-up spell/trap cards
    for (let i = 0; i < spellTrapZones.length; i++) {
      const cardInZone = spellTrapZones[i];
      if (
        cardInZone &&
        cardInZone.faceUp &&
        (cardInZone.type === "spell" || cardInZone.type === "trap")
      ) {
        destroyedCards.push(cardInZone);
        spellTrapZones[i] = null;
      }
    }

    zones.spellTrapZones = spellTrapZones;

    this.gameState = {
      ...this.gameState,
      [opponentKey]: {
        ...opponentState,
        zones,
        graveyard: [...opponentState.graveyard, ...destroyedCards],
      },
    };

    this.addGameEvent(
      player,
      "card_destroyed",
      `${destroyedCards.length} Spell/Trap card(s) destroyed`
    );
  }

  // Helper method to draw cards
  private drawCards(
    _card: CardInPlay,
    player: "player" | "opponent",
    count: number
  ): void {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    let newPlayerState = playerState;

    for (let i = 0; i < count && newPlayerState.mainDeck.length > 0; i++) {
      const newMainDeck = [...newPlayerState.mainDeck];
      const drawnCard = newMainDeck.pop()!;
      const newHand = [...newPlayerState.hand, drawnCard];

      newPlayerState = {
        ...newPlayerState,
        mainDeck: newMainDeck,
        hand: newHand,
      };
    }

    this.gameState = {
      ...this.gameState,
      [playerKey]: newPlayerState,
    };

    this.addGameEvent(
      player,
      "card_played",
      `${player === "player" ? "You" : "Opponent"} drew ${count} card(s)`
    );
  }

  // Helper method to deal effect damage
  private dealEffectDamage(
    player: "player" | "opponent",
    damage: number
  ): void {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    const newLifePoints = Math.max(0, playerState.lifePoints - damage);

    this.gameState = {
      ...this.gameState,
      [playerKey]: {
        ...playerState,
        lifePoints: newLifePoints,
      },
    };

    this.addGameEvent(
      player,
      "damage",
      `${damage} damage dealt (${newLifePoints} LP remaining)`
    );

    // Check for game end
    if (newLifePoints <= 0) {
      const winner = player === "player" ? "opponent" : "player";
      this.gameState = {
        ...this.gameState,
        winner,
      };
      this.onGameEnd?.(winner);
    }
  }

  // Extract damage value from effect text
  private extractDamageFromEffect(effect: string): number {
    const match = effect.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  // Check if an effect can be activated
  private canActivateEffect(card: CardInPlay, _effectId?: string): boolean {
    const currentPhase = this.gameState.currentPhase;

    // Check phase restrictions
    switch (currentPhase) {
      case "Draw":
      case "Standby":
      case "End":
        return card.effectType === "Trigger" || card.effectType === "Quick";
      case "Main1":
      case "Main2":
        return true; // Most effects can activate in main phases
      case "Battle":
        return card.effectType === "Quick" || card.effectType === "Trigger";
      default:
        return false;
    }
  }

  // Get spell speed of an effect
  private getEffectSpellSpeed(
    card: CardInPlay,
    _effectId?: string
  ): SpellSpeed {
    switch (card.effectType) {
      case "Continuous":
        return 1;
      case "Ignition":
        return 1;
      case "Trigger":
        return 1;
      case "Quick":
        return 2;
      case "Flip":
        return 1;
      default:
        return 1;
    }
  }

  // Find a card by ID in any zone
  private findCardById(
    playerState: PlayerState,
    cardId: string
  ): CardInPlay | null {
    // Check hand
    const handCard = playerState.hand.find((card) => card.id === cardId);
    if (handCard) return handCard as CardInPlay;

    // Check zones
    const zones = playerState.zones;

    // Main monster zones
    for (const card of zones.mainMonsterZones) {
      if (card?.id === cardId) return card;
    }

    // Extra monster zones
    for (const card of zones.extraMonsterZones) {
      if (card?.id === cardId) return card;
    }

    // Spell/Trap zones
    for (const card of zones.spellTrapZones) {
      if (card?.id === cardId) return card;
    }

    // Field zone
    if (zones.fieldZone?.id === cardId) return zones.fieldZone;

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
    if (
      this.gameState.currentPhase !== "Main1" &&
      this.gameState.currentPhase !== "Main2"
    )
      return false;

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
    if (
      this.gameState.currentPhase !== "Main1" &&
      this.gameState.currentPhase !== "Main2"
    )
      return false;

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

  // Special Summon a monster
  public specialSummon(
    player: "player" | "opponent",
    cardId: string,
    zoneIndex?: number
  ): boolean {
    const playerKey = player === "player" ? "player" : "opponent";
    const playerState = this.gameState[playerKey];

    // Find the card (could be in hand, deck, graveyard, etc.)
    const card = this.findCardById(playerState, cardId);
    if (!card || card.type !== "monster") return false;

    // Find empty monster zone
    const targetZoneIndex = zoneIndex ?? this.findEmptyMonsterZone(playerState);
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

    // Remove from current location and add to field
    let updatedPlayerState = playerState;

    // If in hand, remove from hand
    if (playerState.hand.some((c) => c.id === cardId)) {
      const cardIndex = playerState.hand.findIndex((c) => c.id === cardId);
      const newHand = [...playerState.hand];
      newHand.splice(cardIndex, 1);
      updatedPlayerState = { ...updatedPlayerState, hand: newHand };
    }

    const newZones = { ...updatedPlayerState.zones };
    const zoneArray = newZones.mainMonsterZones as (CardInPlay | null)[];
    const newZoneArray = [...zoneArray];
    newZoneArray[targetZoneIndex] = cardInPlay;
    newZones.mainMonsterZones = newZoneArray;

    // Update player state
    const finalPlayerState = {
      ...updatedPlayerState,
      zones: newZones,
    };

    // Update game state
    this.gameState = {
      ...this.gameState,
      [playerKey]: finalPlayerState,
    };

    this.addGameEvent(
      player,
      "summon",
      `${player === "player" ? "You" : "Opponent"} Special Summoned ${
        card.name
      }`
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
