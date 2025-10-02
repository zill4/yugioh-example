import React, { useMemo } from "react";
import type { GameState } from "../../../game/types/GameTypes";
import { analyzeGameState } from "../../../game/ai/AIUtils";

interface GameAnalysisProps {
  gameState: GameState;
}

export const GameAnalysis: React.FC<GameAnalysisProps> = ({ gameState }) => {
  const analysis = useMemo(
    () => analyzeGameState(gameState, "player"),
    [gameState]
  );

  const getAdvantageColor = () => {
    switch (analysis.boardAdvantage) {
      case "player":
        return "text-green-400";
      case "opponent":
        return "text-red-400";
      default:
        return "text-yellow-400";
    }
  };

  const getAdvantageIcon = () => {
    switch (analysis.boardAdvantage) {
      case "player":
        return "↑";
      case "opponent":
        return "↓";
      default:
        return "=";
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">
        Game Analysis
      </div>

      {/* Board Advantage */}
      <div className="bg-slate-800/50 border border-slate-700 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Board State</span>
          <span className={`text-lg font-bold ${getAdvantageColor()}`}>
            {getAdvantageIcon()}
          </span>
        </div>
        <div className={`text-sm font-medium ${getAdvantageColor()}`}>
          {analysis.boardAdvantage === "player" && "You're Ahead"}
          {analysis.boardAdvantage === "opponent" && "Opponent Ahead"}
          {analysis.boardAdvantage === "neutral" && "Even Game"}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-800/30 border border-slate-700 p-2">
          <div className="text-slate-500 mb-1">LP Difference</div>
          <div
            className={`font-bold ${
              analysis.lifePointDifference > 0
                ? "text-green-400"
                : analysis.lifePointDifference < 0
                ? "text-red-400"
                : "text-slate-400"
            }`}
          >
            {analysis.lifePointDifference > 0 ? "+" : ""}
            {analysis.lifePointDifference}
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700 p-2">
          <div className="text-slate-500 mb-1">Card Advantage</div>
          <div
            className={`font-bold ${
              analysis.cardAdvantage > 0
                ? "text-green-400"
                : analysis.cardAdvantage < 0
                ? "text-red-400"
                : "text-slate-400"
            }`}
          >
            {analysis.cardAdvantage > 0 ? "+" : ""}
            {analysis.cardAdvantage}
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700 p-2">
          <div className="text-slate-500 mb-1">ATK Difference</div>
          <div
            className={`font-bold ${
              analysis.totalATKDifference > 0
                ? "text-green-400"
                : analysis.totalATKDifference < 0
                ? "text-red-400"
                : "text-slate-400"
            }`}
          >
            {analysis.totalATKDifference > 0 ? "+" : ""}
            {analysis.totalATKDifference}
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700 p-2">
          <div className="text-slate-500 mb-1">Threats</div>
          <div
            className={`font-bold ${
              analysis.threateningMonsters > 0
                ? "text-red-400"
                : "text-slate-400"
            }`}
          >
            {analysis.threateningMonsters}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-slate-800/50 border border-slate-600 p-3">
        <div className="text-xs text-slate-400 mb-1">💡 Tip</div>
        <div className="text-xs text-slate-300 leading-relaxed">
          {analysis.recommendation}
        </div>
      </div>
    </div>
  );
};

