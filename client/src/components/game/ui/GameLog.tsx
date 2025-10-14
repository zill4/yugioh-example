import React from "react";
import type { GameState } from "../../../game/types/GameTypes";

interface GameLogProps {
  gameState: GameState;
}

export const GameLog: React.FC<GameLogProps> = ({ gameState }) => {
  return (
    <div enable-xr className="game-log-container">
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 border-rounded-lg p-2 min-h-[60px]">
        <div className="text-xs text-slate-400 font-medium mb-1">GAME LOG</div>
        <div className="space-y-1 text-xs text-slate-300 max-h-12 overflow-y-auto">
          {gameState?.gameLog?.slice(-2).map((event, i) => (
            <div key={i} className="text-[9px]">
              {event.message}
            </div>
          ))}
          {(!gameState?.gameLog || gameState.gameLog.length === 0) && (
            <div className="text-[9px] text-slate-500">
              No game events yet...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
