import React, { useState } from "react";
import type { GameCard } from "../../../game/types/GameTypes";

interface CardPreviewModalProps {
  card: GameCard | null;
  onClose: () => void;
}

export const CardPreviewModal: React.FC<CardPreviewModalProps> = ({
  card,
  onClose,
}) => {
  const [showAnimation, setShowAnimation] = useState(true);

  const handleImageLoad = () => {
    // Keep animation for full duration (2.5s) to prevent pop-in
    setTimeout(() => {
      setShowAnimation(false);
    }, 2500);
  };

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="xr-card-preview-modal bg-black border-4 border-slate-800 w-80"
        enable-xr={true}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Art */}
        <div className="relative">
          <img
            src={card.imageUrl}
            alt={card.name}
            className={`w-full h-auto object-contain ${
              showAnimation ? "card-loading" : ""
            }`}
            loading="eager"
            decoding="async"
            onLoad={handleImageLoad}
          />
        </div>
      </div>
    </div>
  );
};
