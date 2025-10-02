/**
 * AI Utilities
 * Helper functions for AI development and testing
 */

import type { GameState, CardInPlay } from "../types/GameTypes";
import type { AIDifficulty } from "./MinimaxAI";

/**
 * Get difficulty name
 */
export function getDifficultyName(difficulty: AIDifficulty): string {
  const names: Record<AIDifficulty, string> = {
    easy: "Easy (1 move ahead)",
    medium: "Medium (2 moves ahead)",
    hard: "Hard (3 moves ahead)",
    expert: "Expert (4 moves ahead)",
  };
  return names[difficulty];
}

/**
 * Get difficulty description
 */
export function getDifficultyDescription(difficulty: AIDifficulty): string {
  const descriptions: Record<AIDifficulty, string> = {
    easy: "Makes quick decisions without much thinking. Good for beginners.",
    medium: "Thinks one move ahead. Balanced difficulty for most players.",
    hard: "Thinks two moves ahead. Challenging for experienced players.",
    expert: "Thinks three moves ahead. Very difficult, makes few mistakes.",
  };
  return descriptions[difficulty];
}

/**
 * Get recommended difficulty based on player experience
 */
export function getRecommendedDifficulty(gamesPlayed: number): AIDifficulty {
  if (gamesPlayed < 3) return "easy";
  if (gamesPlayed < 10) return "medium";
  if (gamesPlayed < 25) return "hard";
  return "expert";
}

/**
 * Analyze game state for interesting metrics
 */
export interface GameStateAnalysis {
  boardAdvantage: "player" | "opponent" | "neutral";
  lifePointDifference: number;
  cardAdvantage: number;
  totalATKDifference: number;
  threateningMonsters: number;
  recommendation: string;
}

export function analyzeGameState(
  gameState: GameState,
  player: "player" | "opponent" = "player"
): GameStateAnalysis {
  const playerKey = player === "player" ? "player" : "opponent";
  const opponentKey = player === "player" ? "opponent" : "player";

  const playerState = gameState[playerKey];
  const opponentState = gameState[opponentKey];

  // Life points
  const lifePointDifference = playerState.lifePoints - opponentState.lifePoints;

  // Card advantage
  const cardAdvantage = playerState.hand.length - opponentState.hand.length;

  // Board state
  const playerMonsters = playerState.zones.mainMonsterZones.filter(
    (m): m is CardInPlay => m !== null
  );
  const opponentMonsters = opponentState.zones.mainMonsterZones.filter(
    (m): m is CardInPlay => m !== null
  );

  const playerTotalATK = playerMonsters.reduce(
    (sum, m) => sum + (m.attack || 0),
    0
  );
  const opponentTotalATK = opponentMonsters.reduce(
    (sum, m) => sum + (m.attack || 0),
    0
  );
  const totalATKDifference = playerTotalATK - opponentTotalATK;

  // Threatening monsters (can attack next turn)
  const threateningMonsters = opponentMonsters.filter(
    (m) => !m.summonedThisTurn && !m.attackUsed
  ).length;

  // Determine board advantage
  let boardAdvantage: "player" | "opponent" | "neutral";
  const advantageScore =
    lifePointDifference / 100 +
    cardAdvantage * 50 +
    totalATKDifference / 10 +
    (playerMonsters.length - opponentMonsters.length) * 100;

  if (advantageScore > 200) boardAdvantage = "player";
  else if (advantageScore < -200) boardAdvantage = "opponent";
  else boardAdvantage = "neutral";

  // Generate recommendation
  let recommendation = "";
  if (lifePointDifference < -2000) {
    recommendation = "Critical: Low life points! Focus on defense.";
  } else if (threateningMonsters > playerMonsters.length) {
    recommendation = "Warning: Opponent has more attackers. Prepare defense.";
  } else if (totalATKDifference > 2000) {
    recommendation =
      "Advantage: Your monsters are stronger. Consider attacking!";
  } else if (cardAdvantage < -2) {
    recommendation = "Low card advantage. Try to get more cards in hand.";
  } else if (boardAdvantage === "player") {
    recommendation = "You're ahead! Maintain pressure.";
  } else if (boardAdvantage === "opponent") {
    recommendation = "You're behind. Focus on gaining advantage.";
  } else {
    recommendation = "Even game. Play carefully.";
  }

  return {
    boardAdvantage,
    lifePointDifference,
    cardAdvantage,
    totalATKDifference,
    threateningMonsters,
    recommendation,
  };
}

/**
 * Check if AI is "thinking" (taking longer than expected)
 */
export function isAIThinking(
  startTime: number,
  difficulty: AIDifficulty
): boolean {
  const elapsed = Date.now() - startTime;
  const thresholds: Record<AIDifficulty, number> = {
    easy: 500,
    medium: 1000,
    hard: 2000,
    expert: 5000,
  };
  return elapsed < thresholds[difficulty];
}

/**
 * Format milliseconds to readable time
 */
export function formatThinkTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Get AI confidence level based on evaluation score
 */
export function getAIConfidence(score: number): {
  level: "very_low" | "low" | "medium" | "high" | "very_high";
  percentage: number;
  description: string;
} {
  const absScore = Math.abs(score);

  let level: "very_low" | "low" | "medium" | "high" | "very_high";
  let percentage: number;
  let description: string;

  if (absScore > 5000) {
    level = "very_high";
    percentage = 95;
    description = "Near certain outcome";
  } else if (absScore > 2000) {
    level = "high";
    percentage = 80;
    description = "Strong advantage";
  } else if (absScore > 500) {
    level = "medium";
    percentage = 60;
    description = "Slight advantage";
  } else if (absScore > 100) {
    level = "low";
    percentage = 55;
    description = "Minimal difference";
  } else {
    level = "very_low";
    percentage = 50;
    description = "Even position";
  }

  return { level, percentage, description };
}

