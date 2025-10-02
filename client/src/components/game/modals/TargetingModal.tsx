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
      <div className="xr-targeting-modal p-3 w-80 mx-4" enable-xr={true}>
        <h3 className="text-base font-bold mb-2 text-center text-white">
          Select Attack Target
        </h3>

        <div className="grid grid-cols-1 gap-1.5 mb-2 max-h-64 overflow-y-auto">
          {validTargets.map((target, index) => (
            <button
              key={index}
              onClick={() => handleTargetSelect(target)}
              className="xr-target-option bg-black border border-slate-700 hover:border-red-500 transition-all p-2"
              enable-xr={true}
            >
              {/* Card Info */}
              <div className="text-center">
                <div className="font-bold text-white text-sm mb-1">
                  {target.name}
                </div>
                <div className="flex justify-between text-xs gap-1">
                  <div className="bg-slate-800 px-1.5 py-0.5 flex-1">
                    <span className="text-slate-400">Suit:</span>{" "}
                    <span className="text-white">
                      {suitSymbols[target.suit]}
                    </span>
                  </div>
                  <div className="bg-slate-800 px-1.5 py-0.5 flex-1">
                    <span className="text-slate-400">Lvl:</span>{" "}
                    <span className="text-amber-400">{target.level}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs gap-1 mt-1">
                  <div className="bg-slate-800 px-1.5 py-0.5 flex-1">
                    <span className="text-slate-400">A:</span>{" "}
                    <span className="text-red-400 font-bold">
                      {target.attack}
                    </span>
                  </div>
                  <div className="bg-slate-800 px-1.5 py-0.5 flex-1">
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
          className="w-full px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white transition-colors font-bold text-sm"
          enable-xr={true}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
