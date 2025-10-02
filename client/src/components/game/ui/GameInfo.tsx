import React from "react";
import type { GameState } from "../../../game/types/GameTypes";

interface GameInfoProps {
  gameState: GameState;
  onEndGame: () => void;
}

export const GameInfo: React.FC<GameInfoProps> = ({ gameState, onEndGame }) => {
  return (
    <div enable-xr className="game-info-sidebar">
      <div className="space-y-4">
        <button
          onClick={onEndGame}
          className="w-full px-4 py-2 text-slate-400 text-sm font-bold transition-all duration-300"
        >
          END DUEL
        </button>

        <div>
          <div className="text-slate-400 text-xs mb-1">Your LP</div>
          <div className="text-2xl font-bold text-cyan-100">
            {gameState.player.lifePoints}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-xs mb-1">Opponent LP</div>
          <div className="text-2xl font-bold text-red-100">
            {gameState.opponent.lifePoints}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-xs mb-1">Phase</div>
          <div className="text-lg font-bold text-slate-400">
            {gameState.currentPhase}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {gameState.currentPhase === "Main" && "Summon and activate cards"}
            {gameState.currentPhase === "Battle" && "Attack with monsters"}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-xs mb-1">Turn</div>
          <div className="text-lg font-bold text-slate-400">
            {gameState.currentTurn === "player"
              ? "Your Turn"
              : "Opponent's Turn"}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Turn {gameState.turnNumber}
          </div>
        </div>
      </div>
    </div>
  );
};

