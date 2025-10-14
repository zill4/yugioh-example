import React, { useMemo, useState } from "react";
import type { CardInPlay, GameState } from "../../../game/types/GameTypes";
import { CardImage } from "../ui/CardImage";

interface CardSlotProps {
  card: CardInPlay | null;
  isOpponent?: boolean;
  zoneIndex: number;
  zoneType: "monster" | "spellTrap";
  isPlayerZone: boolean;
  isSelected?: boolean;
  isValidTarget?: boolean;
  isAITurn?: boolean;
  gameState: GameState | null;
  onClick?: () => void;
  onCardDrop?: (
    cardId: string,
    zoneIndex: number,
    zoneType: "monster" | "spellTrap"
  ) => void;
}

export const CardSlot: React.FC<CardSlotProps> = React.memo(
  ({
    card,
    isOpponent = false,
    isPlayerZone,
    zoneIndex,
    zoneType,
    isSelected = false,
    isValidTarget = false,
    isAITurn = false,
    gameState,
    onClick,
    onCardDrop,
  }) => {
    const isEmpty = !card;
    const [isDragOver, setIsDragOver] = useState(false);

    const canDrop = isEmpty && isPlayerZone && !isOpponent && !isAITurn;

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      if (canDrop) {
        event.preventDefault(); // Enable dropping
        event.dataTransfer.dropEffect = "move";
      }
    };

    const handleDragEnter = () => {
      if (canDrop) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = () => {
      setIsDragOver(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      if (!canDrop) return;

      const cardId = event.dataTransfer.getData("text/plain");
      if (cardId && onCardDrop) {
        onCardDrop(cardId, zoneIndex, zoneType);
      }
    };

    const isPlayerCard = isPlayerZone && !isOpponent;

    const canSelectForAttack = useMemo(
      () =>
        isPlayerCard &&
        card?.position === "monster" &&
        !card.attackUsed &&
        !card.summonedThisTurn &&
        gameState &&
        ["Main", "Battle"].includes(gameState.currentPhase),
      [isPlayerCard, card, gameState]
    );

    const isAttackableInBattlePhase = useMemo(
      () => canSelectForAttack && gameState?.currentPhase === "Battle",
      [canSelectForAttack, gameState?.currentPhase]
    );

    return (
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={
          card && onClick
            ? onClick
            : () => {
                console.log("card slot clicked");
              }
        }
        className={`
          w-24 h-32 flex items-center justify-center
          transition-all duration-200 relative
          ${
            card
              ? `bg-transparent shadow-lg cursor-pointer`
              : `bg-transparent border-transparent`
          }
          ${
            isAITurn && isPlayerZone
              ? "ring-2 ring-opacity-75 opacity-50 cursor-not-allowed"
              : ""
          }
          ${isSelected ? "ring-2 ring-opacity-75" : ""}
          ${isValidTarget ? "ring-2 ring-opacity-75" : ""}
          ${
            isAttackableInBattlePhase && !isSelected
              ? "border-red-500 border-4 animate-pulse shadow-lg shadow-red-500/20"
              : ""
          }
          ${
            canSelectForAttack && !isSelected && !isAttackableInBattlePhase
              ? "hover:ring-2 hover:ring-green-400"
              : ""
          }
          ${
            !card && isValidTarget && isPlayerZone
              ? "bg-green-700/60 animate-pulse shadow-lg shadow-green-400/20"
              : ""
          }
          ${
            !card && !isValidTarget && isPlayerZone
              ? "bg-red-700/40 border-red-500"
              : ""
          }
          ${
            isDragOver && canDrop
              ? "bg-green-500/30 scale-105 border-2 border-green-400"
              : ""
          }
          ${!isDragOver && canDrop ? "border-2 border-green-400/50" : ""}
        `}
      >
        {card && (
          <div
            className="w-full h-full overflow-hidden relative"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {isOpponent ? (
              <div className="w-full h-full flex flex-col">
                {card.faceDown ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-yellow-300 text-2xl">🂠</div>
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {card.imageUrl ? (
                      <CardImage
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full opacity-80 object-contain"
                      />
                    ) : (
                      <>
                        <div className="text-4xl opacity-60">👹</div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col">
                {card.faceDown ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-yellow-300 text-2xl">🂠</div>
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-yellow-400 border-rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {card.imageUrl ? (
                      <CardImage
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <>
                        <div className="text-4xl opacity-60">👹</div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

CardSlot.displayName = "CardSlot";
