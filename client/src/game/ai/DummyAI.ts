import { GameEngine } from "../engine/GameEngine";

export class DummyAI {
  private gameEngine: GameEngine;
  private aiTimeout?: NodeJS.Timeout;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  // Start AI turn
  public startTurn(): void {
    console.log("DummyAI: Starting turn");
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
    const gameState = this.gameEngine.getGameState();

    // Wait a bit for dramatic effect
    await this.delay(1000);

    try {
      // Execute actions based on current phase
      switch (gameState.currentPhase) {
        case "Draw":
          await this.handleDrawPhase();
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
          await this.handleEndPhase();
          break;
      }
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback: just end turn if something goes wrong
      this.gameEngine.executeAction({
        type: "END_TURN",
        player: "opponent",
      });
    }
  }

  // Handle draw phase
  private async handleDrawPhase(): Promise<void> {
    // AI automatically draws if possible
    this.gameEngine.executeAction({
      type: "CHANGE_PHASE",
      player: "opponent",
    });
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
          await this.delay(500);
          this.gameEngine.executeAction({
            type: "PLAY_CARD",
            player: "opponent",
            cardId: monsterInHand.id,
            zoneIndex: emptyZoneIndex,
          });
          return; // Only play one card per main phase for simplicity
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
          await this.delay(500);
          this.gameEngine.executeAction({
            type: "PLAY_CARD",
            player: "opponent",
            cardId: spellInHand.id,
            zoneIndex: emptyZoneIndex,
          });
          return;
        }
      }
    }

    // If nothing to play, proceed to next phase
    await this.delay(300);
    this.gameEngine.executeAction({
      type: "CHANGE_PHASE",
      player: "opponent",
    });
  }

  // Handle battle phase
  private async handleBattlePhase(): Promise<void> {
    const gameState = this.gameEngine.getGameState();
    const aiState = gameState.opponent;
    const playerState = gameState.player;

    // Check if we have monsters that can attack
    const attackableMonsters = aiState.zones.mainMonsterZones.filter(
      (monster) =>
        monster &&
        monster.type === "monster" &&
        monster.battlePosition === "attack"
    );

    if (attackableMonsters.length > 0) {
      // Attack with first available monster
      const attacker = attackableMonsters[0];

      if (!attacker) return;

      // Check if player has monsters to attack
      const playerMonsters = playerState.zones.mainMonsterZones.filter(
        (monster) => monster !== null
      );

      if (playerMonsters.length > 0) {
        // Attack the first player monster
        await this.delay(500);
        this.gameEngine.executeAction({
          type: "ATTACK",
          player: "opponent",
          cardId: attacker.id,
          targetId: playerMonsters[0].id,
        });
      } else {
        // Direct attack if no monsters to block
        await this.delay(500);
        this.gameEngine.executeAction({
          type: "DIRECT_ATTACK",
          player: "opponent",
          cardId: attacker.id,
        });
      }
    } else {
      // No monsters to attack with, proceed to next phase
      await this.delay(300);
      this.gameEngine.executeAction({
        type: "CHANGE_PHASE",
        player: "opponent",
      });
    }
  }

  // Handle end phase
  private async handleEndPhase(): Promise<void> {
    // AI automatically ends turn
    await this.delay(300);
    this.gameEngine.executeAction({
      type: "END_TURN",
      player: "opponent",
    });
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
