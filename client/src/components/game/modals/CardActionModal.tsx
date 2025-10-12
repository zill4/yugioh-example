import React, { useCallback, useState } from "react";
import type { GameCard } from "../../../game/types/GameTypes";

interface CardActionModalProps {
  selectedCard: GameCard | null;
  gameState: any;
  onClose: () => void;
  onNormalSummon: (cardId: string) => void;
  onSetMonster: (cardId: string) => void;
  isAITurn: boolean;
}

export const CardActionModal: React.FC<CardActionModalProps> = ({
  selectedCard,
  gameState,
  onClose,
  onNormalSummon,
  isAITurn,
}) => {
  const [showAnimation, setShowAnimation] = useState(true);

  const handleImageLoad = () => {
    // Keep animation for full duration (2.5s) to prevent pop-in
    setTimeout(() => {
      setShowAnimation(false);
    }, 2500);
  };

  if (!selectedCard || !gameState) return null;

  const canNormalSummon =
    !gameState.player.hasNormalSummoned && gameState.currentPhase === "Main";

  const handleNormalSummon = useCallback(() => {
    onNormalSummon(selectedCard.id);
    onClose();
  }, [selectedCard.id, onNormalSummon, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-40 z-50">
      <div className="flex flex-col gap-4">
        {/* Card Display */}
        <div
          className="xr-card-summon-modal bg-black border-4 border-slate-800 w-72"
          enable-xr={true}
        >
          {/* Card Art - Fixed aspect ratio container */}
          <div
            className="relative w-full"
            style={{ aspectRatio: "3/4.36", minHeight: "392px" }}
          >
            <img
              src={selectedCard.imageUrl}
              alt={selectedCard.name}
              className={`w-full h-full object-contain ${
                showAnimation ? "card-loading" : ""
              }`}
              loading="eager"
              decoding="async"
              onLoad={handleImageLoad}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="xr-card-summon-modal-buttons space-y-2 w-72"
          enable-xr={true}
        >
          {canNormalSummon && (
            <button
              onClick={handleNormalSummon}
              disabled={isAITurn}
              className={`w-full px-4 py-3 transition-colors font-semibold ${
                isAITurn
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              Normal Summon
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
