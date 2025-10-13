import React, { useRef } from "react";
import type { GameCard } from "../../../game/types/GameTypes";
import { CardImage } from "../ui/CardImage";

interface HandCardProps {
  card: GameCard;
  index: number;
  isPlayerHand: boolean;
  isAITurn?: boolean;
  onClick?: () => void;
  onDragStart?: (
    event: React.MouseEvent | React.TouchEvent,
    cardId: string,
    element: HTMLElement
  ) => void;
  isDraggable?: boolean;
}

export const HandCard: React.FC<HandCardProps> = React.memo(
  ({
    card,
    isPlayerHand,
    isAITurn = false,
    onClick,
    onDragStart,
    isDraggable = true,
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (event: React.MouseEvent) => {
      console.log("🖱️ HandCard mouseDown event fired!", {
        cardName: card.name,
        isDraggable,
        isPlayerHand,
        isAITurn,
        hasOnDragStart: !!onDragStart,
        hasCardRef: !!cardRef.current,
        target: event.target,
        currentTarget: event.currentTarget,
      });

      if (
        isDraggable &&
        isPlayerHand &&
        !isAITurn &&
        onDragStart &&
        cardRef.current
      ) {
        console.log("✅ Conditions met, calling onDragStart");
        // Prevent default and stop propagation to avoid drag on parent elements
        event.preventDefault();
        event.stopPropagation();
        onDragStart(event, card.id, cardRef.current);
      } else {
        console.log("❌ Conditions NOT met:", {
          isDraggable,
          isPlayerHand,
          isAITurn,
          hasOnDragStart: !!onDragStart,
        });
      }
    };

    const handleTouchStart = (event: React.TouchEvent) => {
      console.log("👆 HandCard touchStart event fired!", {
        cardName: card.name,
        isDraggable,
        isPlayerHand,
        isAITurn,
      });

      if (
        isDraggable &&
        isPlayerHand &&
        !isAITurn &&
        onDragStart &&
        cardRef.current
      ) {
        console.log("✅ Touch conditions met, calling onDragStart");
        // Prevent default and stop propagation to avoid drag on parent elements
        event.preventDefault();
        event.stopPropagation();
        onDragStart(event, card.id, cardRef.current);
      }
    };

    const handleClick = () => {
      // Only trigger onClick if not dragging
      if (onClick && (!isDraggable || isAITurn)) {
        onClick();
      }
    };

    return (
      <div
        ref={cardRef}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        // Disable WebSpatial scene manipulation gestures
        data-no-spatial-gestures="true"
        // Mark as non-spatialized UI element
        style-xr-layer="overlay"
        className={`w-24 h-36 shadow-lg select-none ${
          isAITurn && isPlayerHand
            ? "opacity-50 cursor-not-allowed"
            : isDraggable && isPlayerHand
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-pointer"
        } transition-all duration-200 relative overflow-hidden hover:scale-105`}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          touchAction: "none", // Prevent all touch gestures including pan/scroll
          WebkitTouchCallout: "none", // Prevent iOS callout
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
