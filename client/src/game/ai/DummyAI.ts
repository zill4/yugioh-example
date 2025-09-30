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
      // Keep processing phases until turn ends
      let currentPhase = this.gameEngine.getGameState().currentPhase;
      let phaseCount = 0;
      const maxPhases = 3; // Prevent infinite loops (Main -> Battle -> end turn)

      while (phaseCount < maxPhases) {
        console.log("DummyAI: About to handle phase:", currentPhase);
        phaseCount++;

        // Execute actions based on current phase
        switch (currentPhase) {
          case "Main":
            await this.handleMainPhase();
            break;
          case "Battle":
            await this.handleBattlePhase();
            // After battle phase, end the turn
            console.log("DummyAI: Battle phase completed, calling END_TURN");
            this.gameEngine.executeAction({
              type: "END_TURN",
              player: "opponent",
            });
            // Wait a bit to ensure the turn transition completes
            await this.delay(500);
            console.log("DummyAI: Turn ended, exiting executeTurn");
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
    const gameState = this.gameEngine.getGameState();
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
