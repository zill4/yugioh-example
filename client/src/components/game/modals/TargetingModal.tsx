import React, { useCallback } from "react";
import type { CardInPlay, GameState } from "../../../game/types/GameTypes";

interface TargetingModalProps {
  targetingMode: "attack" | "effect" | null;
  selectedCard: CardInPlay | null;
  validTargets: CardInPlay[];
  gameState: GameState | null;
  showConfirmation: boolean;
  onTargetSelect: (target: CardInPlay) => void;
  onCancel: () => void;
}

export const TargetingModal: React.FC<TargetingModalProps> = ({
  targetingMode,
  selectedCard,
  validTargets,
  gameState,
  showConfirmation,
  onTargetSelect,
  onCancel,
}) => {
  if (!targetingMode || !gameState || !selectedCard || showConfirmation)
    return null;

  const handleTargetSelect = useCallback(
    (target: CardInPlay) => {
      onTargetSelect(target);
    },
    [onTargetSelect]
  );

  // Suit symbol mapping
  const suitSymbols: Record<string, string> = {
    hearts: "♥",
    diamonds: "♦",
    spades: "♠",
    clubs: "♣",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="xr-targeting-modal p-6 max-w-md w-full mx-4"
        enable-xr={true}
      >
        <h3 className="text-2xl font-bold mb-6 text-center text-white">
          Select Attack Target
        </h3>

        <div className="grid grid-cols-1 gap-3 mb-4">
          {validTargets.map((target, index) => (
            <button
              key={index}
              onClick={() => handleTargetSelect(target)}
              className="xr-target-option bg-black border-2 border-slate-700 hover:border-red-500 transition-all p-4"
              enable-xr={true}
            >
              {/* Card Info */}
              <div className="text-center">
                <div className="font-bold text-white text-lg mb-2">
                  {target.name}
                </div>
                <div className="flex justify-between text-sm gap-2">
                  <div className="bg-slate-800 px-2 py-1 flex-1">
                    <span className="text-slate-400">Suit:</span>{" "}
                    <span className="text-white">
                      {suitSymbols[target.suit]}
                    </span>
                  </div>
                  <div className="bg-slate-800 px-2 py-1 flex-1">
                    <span className="text-slate-400">Lvl:</span>{" "}
                    <span className="text-amber-400">{target.level}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm gap-2 mt-2">
                  <div className="bg-slate-800 px-2 py-1 flex-1">
                    <span className="text-slate-400">A:</span>{" "}
                    <span className="text-red-400 font-bold">
                      {target.attack}
                    </span>
                  </div>
                  <div className="bg-slate-800 px-2 py-1 flex-1">
                    <span className="text-slate-400">D:</span>{" "}
                    <span className="text-cyan-400 font-bold">
                      {target.defense}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white transition-colors font-bold text-lg"
          enable-xr={true}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
