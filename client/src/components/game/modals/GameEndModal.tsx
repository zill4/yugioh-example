import React from "react";
import type { GameState } from "../../../game/types/GameTypes";

interface GameEndModalProps {
  show: boolean;
  gameState: GameState | null;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const GameEndModal: React.FC<GameEndModalProps> = ({
  show,
  gameState,
  onPlayAgain,
  onReturnHome,
}) => {
  if (!show || !gameState?.winner) return null;

  const isPlayerWinner = gameState.winner === "player";
  const winnerName = isPlayerWinner ? "You" : "Opponent";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="xr-game-end-modal bg-slate-900/95 border-2 border-red-600 p-8 max-w-md w-full mx-4 text-center"
        enable-xr={true}
      >
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-4 text-white">Game Over!</h2>
          <p
            className={`text-2xl font-bold ${
              isPlayerWinner ? "text-green-400" : "text-red-400"
            }`}
          >
            {winnerName} Win{winnerName === "You" ? "" : "s"}!
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white transition-colors font-bold text-lg"
            enable-xr={true}
          >
            Play Again
          </button>
          <button
            onClick={onReturnHome}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white transition-colors font-bold text-lg"
            enable-xr={true}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
