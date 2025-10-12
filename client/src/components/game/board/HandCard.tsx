import React, { useState } from "react";
import type { GameCard } from "../../../game/types/GameTypes";

interface HandCardProps {
  card: GameCard;
  index: number;
  isPlayerHand: boolean;
  isAITurn?: boolean;
  onClick?: () => void;
}

export const HandCard: React.FC<HandCardProps> = React.memo(
  ({ card, isPlayerHand, isAITurn = false, onClick }) => {
    const [showAnimation, setShowAnimation] = useState(true);

    const handleImageLoad = () => {
      // Keep animation for full duration (2.5s) to prevent pop-in
      setTimeout(() => {
        setShowAnimation(false);
      }, 2500);
    };

    return (
      <div
        onClick={onClick}
        className={`w-24 h-36 shadow-lg select-none ${
          isAITurn && isPlayerHand
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-110 hover:-translate-y-2 cursor-pointer"
        } transition-all duration-200 relative overflow-hidden`}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <div className="w-full h-full flex flex-col">
          {card?.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className={`w-full h-full object-contain ${
                showAnimation ? "card-loading" : ""
              }`}
              loading="eager"
              decoding="async"
              onLoad={handleImageLoad}
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
