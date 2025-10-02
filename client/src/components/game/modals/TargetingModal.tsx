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

  return (
    <div
      className={`fixed inset-0 ${
        process.env.XR_ENV === "avp" ? "" : "bg-black/50"
      } flex items-center justify-center z-50`}
    >
      <div className="border-rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 text-center">
          Select Target for Attack
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {validTargets.map((target, index) => (
            <button
              key={index}
              onClick={() => handleTargetSelect(target)}
              className="p-3 border-2 border-gray-300 hover:border-blue-500 border-rounded-lg transition-colors"
            >
              <div className="text-sm font-medium text-center">
                {target.name}
              </div>
              <div className="text-xs text-gray-600 text-center mt-1">
                ATK: {target.attack}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white border-rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

