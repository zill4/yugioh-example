import React from "react";
import type { GameCard } from "../../../game/types/GameTypes";
import { CardImage } from "../ui/CardImage";

interface CardPreviewModalProps {
  card: GameCard | null;
  onClose: () => void;
}

export const CardPreviewModal: React.FC<CardPreviewModalProps> = ({
  card,
  onClose,
}) => {
  if (!card) return null;

  return (
    <div
      className="__enableXr__ fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="__enableXr__ xr-card-preview-modal bg-black border-4 border-slate-800 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Art - Fixed aspect ratio container */}
        <div
          className="relative w-full"
          style={{ aspectRatio: "3/4.36", minHeight: "436px" }}
        >
          <CardImage
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};
