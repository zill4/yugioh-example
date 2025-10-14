import React from "react";

interface GameActionsProps {
  isAITurn: boolean;
  onEndTurn: () => void;
}

export const GameActions: React.FC<GameActionsProps> = ({
  isAITurn,
  onEndTurn,
}) => {
  return (
    <div enable-xr className="game-actions-sidebar">
      <div className="space-y-3">
        <button
          onClick={onEndTurn}
          disabled={isAITurn}
          className={`w-full text-sm font-bold transition-all duration-300 ${
            isAITurn
              ? "bg-slate-600 text-slate-400 cursor-not-allowed"
              : "text-slate-300"
          }`}
        >
          End Turn
        </button>
      </div>
    </div>
  );
};
