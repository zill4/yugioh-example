import React, { useState } from "react";
import type { GameCard } from "../../../game/types/GameTypes";
import { CardImage } from "../ui/CardImage";

interface HandCardProps {
  card: GameCard;
  index: number;
  isPlayerHand: boolean;
  isAITurn?: boolean;
  onClick?: () => void;
  isDraggable?: boolean;
}

export const HandCard: React.FC<HandCardProps> = React.memo(
  ({ card, isPlayerHand, isAITurn = false, onClick, isDraggable = true }) => {
    const canDrag = isDraggable && isPlayerHand && !isAITurn;
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
      if (!canDrag) {
        event.preventDefault();
        return;
      }
      // Store card ID in dataTransfer
      event.dataTransfer.setData("text/plain", card.id);
      event.dataTransfer.effectAllowed = "move";
      setIsDragging(true);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    const handleClick = () => {
      // Only trigger onClick if not draggable or during AI turn
      if (onClick) {
        onClick();
      }
    };

    return (
      <div
        draggable={canDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        // Disable WebSpatial scene manipulation gestures - TRUE to bypass WebSpatial gesture detection
        data-no-spatial-gestures="true"
        // Mark as non-spatialized UI element
        style-xr-layer="overlay"
        className={`w-24 h-36 shadow-lg select-none ${
          isAITurn && isPlayerHand
            ? "opacity-50 cursor-not-allowed"
            : isDraggable && isPlayerHand
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-pointer"
        } ${
          isDragging
            ? "scale-110 ring-4 ring-blue-400 shadow-2xl shadow-blue-500/50 brightness-110"
            : "hover:scale-105"
        } transition-all duration-200 relative overflow-hidden`}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <div className="w-full h-full flex flex-col">
          {card?.imageUrl ? (
            <CardImage
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <div className="text-2xl opacity-60">👹</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </>
          )}
        </div>
      </div>
    );
  }
);

HandCard.displayName = "HandCard";
