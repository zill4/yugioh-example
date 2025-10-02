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
  const winnerColor = isPlayerWinner ? "text-green-600" : "text-red-600";

  return (
    <div
      className={`fixed inset-0 ${
        process.env.XR_ENV === "avp" ? "" : "bg-black/70"
      } flex items-center justify-center z-50`}
    >
      <div className="bg-white border-rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
          <p className={`text-xl font-semibold ${winnerColor}`}>
            {winnerName} Win{winnerName === "You" ? "" : "s"}!
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onPlayAgain}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white border-rounded-lg transition-colors font-semibold"
          >
            Play Again
          </button>
          <button
            onClick={onReturnHome}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white border-rounded-lg transition-colors font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

