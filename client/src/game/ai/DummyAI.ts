import { GameEngine } from "../engine/GameEngine";

export class DummyAI {
  private gameEngine: GameEngine;
  private aiTimeout?: NodeJS.Timeout;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // Set callback for when AI turn ends (kept for backwards compatibility, but not used)
  // The turn ending is now handled automatically via CHANGE_PHASE
  public setOnTurnEnd(_callback: () => void): void {
    // No-op: Turn transitions are handled by the game engine
  }

  // Start AI turn
  public startTurn(): void {
    console.log("DummyAI: Starting turn");
    // Execute immediately to avoid race conditions with automatic phase logic
    this.executeTurn();
  }

  // Stop AI (for cleanup)
  public stop(): void {
    if (this.aiTimeout) {
      clearTimeout(this.aiTimeout);
    }
  }

  // Execute AI turn logic
  private async executeTurn(): Promise<void> {
    console.log("DummyAI: executeTurn started");

    try {
      const gameState = this.gameEngine.getGameState();

      // Verify it's actually AI's turn
      if (gameState.currentTurn !== "opponent") {
        console.warn("DummyAI: Not AI's turn, aborting");
        return;
      }

      // Always start from Main phase (regardless of what phase we're in)
      // This handles cases where player ends turn early
      const currentPhase = gameState.currentPhase;
      console.log("DummyAI: Starting in phase:", currentPhase);

      // Handle Main Phase
      if (currentPhase === "Main") {
        await this.handleMainPhase();

        // Check if game ended during main phase
        if (this.gameEngine.getGameState().winner) {
          console.log("DummyAI: Game ended during main phase");
          return;
        }

        // Check if still AI's turn (game might have ended)
        if (this.gameEngine.getGameState().currentTurn !== "opponent") {
          console.log("DummyAI: No longer AI's turn after main phase");
          return;
        }

        // Now handle Battle Phase
        await this.handleBattlePhase();
      } else if (currentPhase === "Battle") {
        // If we started in Battle phase (shouldn't happen normally), just handle it
        console.log("DummyAI: Started in Battle phase (unusual)");
        await this.handleBattlePhase();
      }

      console.log("DummyAI: Turn execution completed");
      // The turn should have ended via CHANGE_PHASE in handleBattlePhase
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback: just end turn if something goes wrong
      try {
        this.gameEngine.executeAction({
          type: "END_TURN",
          player: "opponent",
        });
      } catch (endTurnError) {
        console.error("Failed to end turn:", endTurnError);
      }
    }
  }

  // Handle main phase (simplified for normal monsters only)
  private async handleMainPhase(_isMain2: boolean = false): Promise<void> {
    const gameState = this.gameEngine.getGameState();
    const aiState = gameState.opponent;

    // Try to normal summon a monster if we have space and haven't summoned yet
    if (
      !aiState.hasNormalSummoned &&
      aiState.zones.mainMonsterZones.some((zone) => zone === null)
    ) {
      const monsterInHand = aiState.hand.find(
        (card) => card.cardType === "Monster"
      );
      if (monsterInHand) {
        // Find empty monster zone
        const emptyZoneIndex = aiState.zones.mainMonsterZones.findIndex(
          (zone) => zone === null
        );
        if (emptyZoneIndex !== -1) {
          await this.delay(1500);
          this.gameEngine.executeAction({
            type: "NORMAL_SUMMON",
            player: "opponent",
            cardId: monsterInHand.id,
            zoneIndex: emptyZoneIndex,
          });
        }
      }
    }

    // Main phase completed, move to next phase
    await this.delay(2000);
    console.log("DummyAI: Calling changePhase from Main to next phase");
    this.gameEngine.executeAction({
      type: "CHANGE_PHASE",
      player: "opponent",
    });
    console.log("DummyAI: Main phase completed");
  }

  // Handle battle phase
  private async handleBattlePhase(): Promise<void> {
    let gameState = this.gameEngine.getGameState();

    // Verify still in battle phase and AI's turn
    if (gameState.currentTurn !== "opponent" || gameState.winner) {
      console.log(
        "DummyAI: Not AI's turn or game ended, skipping battle phase"
      );
      return;
    }

    // If not in battle phase, transition to it first
    if (gameState.currentPhase !== "Battle") {
      console.log("DummyAI: Transitioning to Battle phase");
      await this.delay(500);
      this.gameEngine.executeAction({
        type: "CHANGE_PHASE",
        player: "opponent",
      });
      gameState = this.gameEngine.getGameState();
    }

    const aiState = gameState.opponent;
    const playerState = gameState.player;

    // Check if we have monsters that can attack (haven't attacked this turn and not summoned this turn)
    const attackableMonsters = aiState.zones.mainMonsterZones.filter(
      (monster) =>
        monster &&
        monster.battlePosition === "attack" &&
        !monster.attackUsed &&
        !monster.summonedThisTurn
    );

    if (attackableMonsters.length > 0) {
      // Attack with first available monster
      const attacker = attackableMonsters[0];

      if (attacker) {
        // Check if player has monsters to attack
        const playerMonsters = playerState.zones.mainMonsterZones.filter(
          (monster) => monster !== null
        );

        if (playerMonsters.length > 0) {
          // Attack the first player monster
          await this.delay(2000);
          this.gameEngine.executeAction({
            type: "ATTACK",
            player: "opponent",
            cardId: attacker.id,
            targetId: playerMonsters[0].id,
          });
        } else {
          // Direct attack if no monsters to block
          await this.delay(2000);
          this.gameEngine.executeAction({
            type: "DIRECT_ATTACK",
            player: "opponent",
            cardId: attacker.id,
          });
        }
      }
    }

    // Check if game ended during battle
    if (this.gameEngine.getGameState().winner) {
      console.log("DummyAI: Game ended during battle phase");
      return;
    }

    // Battle phase completed, end turn (CHANGE_PHASE from Battle ends the turn)
    await this.delay(1000);
    console.log("DummyAI: Ending turn from Battle phase");
    this.gameEngine.executeAction({
      type: "CHANGE_PHASE",
      player: "opponent",
    });
    console.log("DummyAI: Battle phase completed and turn ended");
  }

  // Helper function for delays
  private delay(ms: number): Promise<void> {
    console.log(`DummyAI: Starting delay for ${ms}ms`);
    return new Promise((resolve) => {
      this.aiTimeout = setTimeout(() => {
        console.log(`DummyAI: Delay of ${ms}ms completed`);
        resolve();
      }, ms);
    });
  }

  // Make a random decision (for more varied gameplay) - unused for now
  // private makeRandomChoice<T>(choices: T[]): T {
  //   return choices[Math.floor(Math.random() * choices.length)];
  // }

  // Get AI strategy based on game state - unused for now
  // private getAIStrategy(
  //   gameState: GameState
  // ): "aggressive" | "defensive" | "balanced" {
  //   const aiState = gameState.opponent;
  //   const playerState = gameState.player;
  //
  //   // Simple strategy: if AI has more life, be aggressive
  //   if (aiState.lifePoints > playerState.lifePoints) {
  //     return "aggressive";
  //   } else if (aiState.lifePoints < playerState.lifePoints) {
  //     return "defensive";
  //   } else {
  //     return "balanced";
  //   }
  // }
}
