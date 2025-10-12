import React, { useMemo, useState } from "react";
import type { CardInPlay, GameState } from "../../../game/types/GameTypes";

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
}

export const CardSlot: React.FC<CardSlotProps> = React.memo(
  ({
    card,
    isOpponent = false,
    isPlayerZone,
    isSelected = false,
    isValidTarget = false,
    isAITurn = false,
    gameState,
    onClick,
  }) => {
    const [showAnimation, setShowAnimation] = useState(true);
    const isPlayerCard = isPlayerZone && !isOpponent;

    const handleImageLoad = () => {
      // Keep animation for full duration (2.5s) to prevent pop-in
      setTimeout(() => {
        setShowAnimation(false);
      }, 2500);
    };

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
        onClick={card && onClick ? onClick : undefined}
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
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className={`w-full h-full opacity-80 object-contain ${
                          showAnimation ? "card-loading" : ""
                        }`}
                        loading="eager"
                        decoding="async"
                        onLoad={handleImageLoad}
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
