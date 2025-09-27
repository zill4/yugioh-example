import { GameEngine } from "../engine/GameEngine";

export class DummyAI {
  private gameEngine: GameEngine;
  private aiTimeout?: NodeJS.Timeout;
  private onTurnEnd?: () => void;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // Set callback for when AI turn ends
  public setOnTurnEnd(callback: () => void): void {
    this.onTurnEnd = () => {
      console.log("DummyAI: onTurnEnd callback being called");
      callback();
    };
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
      // Keep processing phases until we reach the End phase or turn ends
      let currentPhase = this.gameEngine.getGameState().currentPhase;
      let phaseCount = 0;
      const maxPhases = 10; // Prevent infinite loops

      while (currentPhase !== "End" && phaseCount < maxPhases) {
        console.log("DummyAI: About to handle phase:", currentPhase);
        phaseCount++;

        // Execute actions based on current phase
        switch (currentPhase) {
          case "Draw":
            await this.handleDrawPhase();
            break;
          case "Standby":
            await this.handleStandbyPhase();
            break;
          case "Main1":
            await this.handleMainPhase();
            break;
          case "Battle":
            await this.handleBattlePhase();
            break;
          case "Main2":
            await this.handleMainPhase(true); // Main 2
            break;
          case "End":
            // End phase just ends the turn, no need to call handler
            console.log(
              "DummyAI: Reached End phase, turn will end automatically"
            );
            // End the turn
            this.gameEngine.executeAction({
              type: "END_TURN",
              player: "opponent",
            });
            return; // Exit the loop since turn will end
        }

        // Get updated game state after handling the phase
        const updatedGameState = this.gameEngine.getGameState();
        currentPhase = updatedGameState.currentPhase;

        console.log(
          "DummyAI: After handling phase, current phase is:",
          currentPhase
        );
      }

      console.log("DummyAI: All phases completed, calling onTurnEnd");
      // Signal that AI turn has ended
      if (this.onTurnEnd) {
        this.onTurnEnd();
      }
      console.log("DummyAI: executeTurn completed");
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback: just end turn if something goes wrong
      this.gameEngine.executeAction({
        type: "END_TURN",
        player: "opponent",
      });
      // Signal that AI turn has ended even on error
      if (this.onTurnEnd) {
        this.onTurnEnd();
      }
    }
  }

  // Handle draw phase
  private async handleDrawPhase(): Promise<void> {
    console.log("DummyAI: Handling Draw phase - starting");

    // The draw phase logic is handled automatically by the GameEngine
    // Move to next phase
    await this.delay(1000);
    console.log("DummyAI: Calling changePhase from Draw to Standby");
    this.gameEngine.executeAction({
      type: "CHANGE_PHASE",
      player: "opponent",
    });
    console.log("DummyAI: Draw phase completed");
  }

  // Handle standby phase
  private async handleStandbyPhase(): Promise<void> {
    // AI has nothing to do in standby phase, just wait a bit
    await this.delay(1500);
    console.log("DummyAI: Calling changePhase from Standby to Main1");
    this.gameEngine.executeAction({
      type: "CHANGE_PHASE",
      player: "opponent",
    });
    console.log("DummyAI: Standby phase completed");
  }

  // Handle main phases (Main1 and Main2)
  private async handleMainPhase(_isMain2: boolean = false): Promise<void> {
    const gameState = this.gameEngine.getGameState();
    const aiState = gameState.opponent;

    // Try to play monsters if we have space
    if (aiState.zones.mainMonsterZones.some((zone) => zone === null)) {
      const monsterInHand = aiState.hand.find(
        (card) => card.type === "monster"
      );
      if (monsterInHand) {
        // Find empty monster zone
        const emptyZoneIndex = aiState.zones.mainMonsterZones.findIndex(
          (zone) => zone === null
        );
        if (emptyZoneIndex !== -1) {
          await this.delay(1500);
          this.gameEngine.executeAction({
            type: "PLAY_CARD",
            player: "opponent",
            cardId: monsterInHand.id,
            zoneIndex: emptyZoneIndex,
          });
        }
      }
    }

    // Try to play spells if we have space
    if (aiState.zones.spellTrapZones.some((zone) => zone === null)) {
      const spellInHand = aiState.hand.find((card) => card.type === "spell");
      if (spellInHand) {
        const emptyZoneIndex = aiState.zones.spellTrapZones.findIndex(
          (zone) => zone === null
        );
        if (emptyZoneIndex !== -1) {
          await this.delay(1500);
          this.gameEngine.executeAction({
            type: "PLAY_CARD",
            player: "opponent",
            cardId: spellInHand.id,
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
    const gameState = this.gameEngine.getGameState();
    const aiState = gameState.opponent;
    const playerState = gameState.player;

    // Check if we have monsters that can attack (haven't attacked this turn and not summoned this turn)
    const attackableMonsters = aiState.zones.mainMonsterZones.filter(
      (monster) =>
        monster &&
        monster.type === "monster" &&
        monster.battlePosition === "attack" &&
        !monster.attackUsed &&
        !monster.summonedThisTurn
    );

    if (attackableMonsters.length > 0) {
      // Attack with first available monster
      const attacker = attackableMonsters[0];

      if (!attacker) {
        // No valid attacker, proceed to next phase
        await this.delay(300);
        this.gameEngine.executeAction({
          type: "CHANGE_PHASE",
          player: "opponent",
        });
        return;
      }

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

    // Battle phase completed, move to next phase
    await this.delay(2000);
    console.log("DummyAI: Calling changePhase from Battle to Main2");
    this.gameEngine.executeAction({
      type: "CHANGE_PHASE",
      player: "opponent",
    });
    console.log("DummyAI: Battle phase completed");
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
