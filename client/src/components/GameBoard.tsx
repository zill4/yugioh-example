/**
 * GameBoard - Refactored and Simplified
 * Main game board component that orchestrates all game UI elements
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { GameController } from "../game/GameController";
import type { GameState, CardInPlay } from "../game/types/GameTypes";

// Hooks
import { useGameActions } from "./game/hooks/useGameActions";
import { useCardSelection } from "./game/hooks/useCardSelection";
import { useTargeting } from "./game/hooks/useTargeting";
import { useDragAndDrop } from "./game/hooks/useDragAndDrop";

// UI Components
import { GameInfo } from "./game/ui/GameInfo";
import { GameActions } from "./game/ui/GameActions";

// Board Components
import { CardSlot } from "./game/board/CardSlot";
import { HandCard } from "./game/board/HandCard";

// Modals
import { CardActionModal } from "./game/modals/CardActionModal";
import { TargetingModal } from "./game/modals/TargetingModal";
import { BattleConfirmModal } from "./game/modals/BattleConfirmModal";
import { GameEndModal } from "./game/modals/GameEndModal";
import { CardPreviewModal } from "./game/modals/CardPreviewModal";

// Utils
import { canAttack } from "../game/utils/CardStateUtils";
import { isXR } from "../utils/xr";
import { preloadCardImages } from "../utils/imagePreloader";

interface GameBoardProps {
  gameMode: string;
  onEndGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ onEndGame }) => {
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [previewCard, setPreviewCard] = useState<CardInPlay | null>(null);
  const gameControllerRef = useRef<GameController | null>(null);

  // Derive AI turn state from gameState
  const isAITurn = useMemo(() => {
    return gameState?.currentTurn === "opponent";
  }, [gameState?.currentTurn]);

  // Custom hooks for game logic
  const { selectedCard, selectCard, clearSelection } = useCardSelection();
  const {
    targetingMode,
    validTargets,
    pendingAction,
    showConfirmation,
    startTargeting,
    selectTarget,
    cancelTargeting,
    confirmAction,
  } = useTargeting({ gameState });
  const { handleNextPhase, handleEndTurn, handleNormalSummon } = useGameActions(
    {
      gameController: gameControllerRef.current,
      isAITurn,
    }
  );

  // Handle card drop from drag and drop
  const handleCardDrop = useCallback(
    (cardId: string, zoneIndex: number, zoneType: "monster" | "spellTrap") => {
      if (!gameControllerRef.current || !gameState || isAITurn) return;

      // Only allow dropping monster cards in monster zones for now
      if (zoneType === "monster" && gameState.currentPhase === "Main") {
        // Try to normal summon the card to the specified zone
        const success = handleNormalSummon(cardId, zoneIndex);
        if (success) {
          clearSelection();
        }
      }
    },
    [gameState, isAITurn, handleNormalSummon, clearSelection]
  );

  // Drag and drop hook
  const {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    registerDropZone,
    unregisterDropZone,
  } = useDragAndDrop({
    onDrop: handleCardDrop,
    onDragStart: (cardId) => {
      console.log("Drag started:", cardId);
      // Clear any existing selections when starting drag
      clearSelection();
      cancelTargeting();
    },
    onDragEnd: () => {
      console.log("Drag ended");
    },
    isDisabled: isAITurn,
  });

  // Card click handler - simplified with early returns
  const handleCardClick = useCallback(
    (card: CardInPlay, isPlayerCard: boolean) => {
      if (!gameControllerRef.current || !gameState) return;
      console.log("handleCardClick", card, isPlayerCard);
      // If clicking opponent card, show preview
      if (!isPlayerCard) {
        setPreviewCard(card);
        return;
      }

      // Player can't interact during AI turn - show preview instead
      if (isAITurn) {
        setPreviewCard(card);
        return;
      }

      // If already targeting, this is a target selection
      if (selectedCard && targetingMode) {
        selectTarget(card, selectedCard);
        return;
      }

      // If clicking the same card that's already selected, deselect it first
      if (selectedCard?.id === card.id) {
        clearSelection();
        cancelTargeting();
        return;
      }

      // Check if card can attack
      if (card.position === "monster" && canAttack(card, gameState)) {
        // Clear any previous selection/targeting state first
        clearSelection();
        cancelTargeting();

        // Then select and start targeting
        selectCard(card);
        startTargeting(card);
        return;
      }

      // Card can't attack - show preview instead
      setPreviewCard(card);
    },
    [
      gameState,
      isAITurn,
      selectedCard,
      targetingMode,
      selectCard,
      startTargeting,
      selectTarget,
      clearSelection,
      cancelTargeting,
    ]
  );

  // Handle hand card click
  const handleHandCardClick = useCallback(
    (card: any) => {
      console.log("handleHandCardClick", card);
      if (isAITurn || !gameState) return;
      const cardInPlay: CardInPlay = {
        ...card,
        position: "hand",
      } as CardInPlay;
      selectCard(cardInPlay);
    },
    [isAITurn, gameState, selectCard]
  );

  // Close preview modal
  const handleClosePreview = useCallback(() => {
    setPreviewCard(null);
  }, []);

  // Handle action confirmation
  const handleConfirmAction = useCallback(() => {
    if (!pendingAction || !gameControllerRef.current) return;

    gameControllerRef.current.executePlayerAction(pendingAction);
    clearSelection();
    cancelTargeting();
    confirmAction();
  }, [pendingAction, clearSelection, cancelTargeting, confirmAction]);

  // Handle action cancellation
  const handleCancelAction = useCallback(() => {
    clearSelection();
    cancelTargeting();
  }, [clearSelection, cancelTargeting]);

  // Handle normal summon from modal
  const handleSummonFromModal = useCallback(
    (cardId: string) => {
      handleNormalSummon(cardId);
      clearSelection();
    },
    [handleNormalSummon, clearSelection]
  );

  // Handle game restart
  const handlePlayAgain = useCallback(() => {
    setShowGameEndModal(false);
    setGameState(null);
    clearSelection();
    cancelTargeting();

    try {
      const controller = new GameController();
      controller.initialize({
        onGameStateChange: setGameState,
        onGameEnd: () => setShowGameEndModal(true),
        onAITurnStart: () => console.log("AI turn started"),
        onAITurnEnd: () => console.log("AI turn ended"),
        onPlayerTurnStart: () => console.log("Player turn started"),
      });
      gameControllerRef.current = controller;
      setGameState(controller.getGameState());
    } catch (error) {
      console.error("Failed to restart game:", error);
    }
  }, [clearSelection, cancelTargeting]);

  // Initialize game on mount
  useEffect(() => {
    console.log("GameBoard: Initializing...");

    // DEBUG: Check if WebSpatial is intercepting events
    console.log("🔍 Checking for WebSpatial event interception...");
    const hasWebSpatial =
      typeof window !== "undefined" && (window as any).WebSpatial !== undefined;
    console.log("WebSpatial present:", hasWebSpatial);

    // Log all global event listeners
    if (typeof window !== "undefined") {
      const originalAddEventListener = window.addEventListener;
      let mouseDownListeners = 0;
      let touchStartListeners = 0;

      (window as any).addEventListener = function (
        type: string,
        listener: any,
        options?: any
      ) {
        if (type === "mousedown") {
          mouseDownListeners++;
          console.log(
            `➕ mousedown listener added (total: ${mouseDownListeners})`
          );
        }
        if (type === "touchstart") {
          touchStartListeners++;
          console.log(
            `➕ touchstart listener added (total: ${touchStartListeners})`
          );
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    }

    try {
      const controller = new GameController();

      controller.initialize({
        onGameStateChange: (newGameState) => {
          console.log("Game state changed:", newGameState);
          setGameState(newGameState);
        },
        onAITurnStart: () => console.log("AI turn started"),
        onAITurnEnd: () => console.log("AI turn ended"),
        onPlayerTurnStart: () => console.log("Player turn started"),
        onGameEnd: (winner) => {
          console.log("Game ended, winner:", winner);
          setShowGameEndModal(true);
        },
      });

      gameControllerRef.current = controller;
      const initialGameState = controller.getGameState();
      console.log("Initial game state retrieved:", initialGameState);
      setGameState(initialGameState);
    } catch (error) {
      console.error("Failed to initialize game:", error);
      setInitError(error instanceof Error ? error.message : "Unknown error");
    }

    return () => {
      if (gameControllerRef.current) {
        gameControllerRef.current = null;
      }
    };
  }, []);

  // Preload card images when game state changes
  useEffect(() => {
    if (!gameState) return;

    const allCards = [
      ...gameState.player.hand,
      ...gameState.player.zones.mainMonsterZones.filter(
        (c: CardInPlay | null): c is CardInPlay => c !== null
      ),
      ...gameState.player.graveyard,
      ...gameState.opponent.hand,
      ...gameState.opponent.zones.mainMonsterZones.filter(
        (c: CardInPlay | null): c is CardInPlay => c !== null
      ),
      ...gameState.opponent.graveyard,
    ];

    // Preload images in the background
    preloadCardImages(allCards).catch((error) => {
      console.warn("Failed to preload some card images:", error);
    });
  }, [gameState]);

  // Set up global drag event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging) {
        e.preventDefault(); // Prevent default scrolling behavior
        handleDragMove(e);
      }
    };

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        handleDragEnd();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (dragState.isDragging) {
        e.preventDefault(); // Prevent default scrolling behavior
        handleDragMove(e);
      }
    };

    const handleTouchEnd = () => {
      if (dragState.isDragging) {
        handleDragEnd();
      }
    };

    if (dragState.isDragging) {
      // Add passive: false to allow preventDefault
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);

      // DEBUG: Force touch-action: none on key elements during drag
      const elements = [
        document.querySelector(".game-board-container"),
        document.querySelector(".player-hand-container"),
        document.querySelector(".zone-rows-wrapper"),
        document.querySelector(".game-layout-grid"),
        document.body,
        document.documentElement,
      ];

      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.touchAction = "none";
          el.style.userSelect = "none";
          console.log(`🔒 Locked element: ${el.className || el.tagName}`);
        }
      });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  // Error state
  if (initError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">
            Game Initialization Error
          </div>
          <div className="text-slate-300">{initError}</div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen ${
          isXR ? "" : "bg-black"
        } relative overflow-hidden`}
        onMouseDown={(e) => {
          console.log("🌍 Root div mouseDown", {
            target: (e.target as HTMLElement).className,
            currentTarget: (e.currentTarget as HTMLElement).className,
          });
        }}
      >
        {/* Fixed Position Layout */}
        <div
          className="game-layout-grid"
          onMouseDown={(e) => {
            console.log("🎯 Layout grid mouseDown", {
              target: (e.target as HTMLElement).className,
              currentTarget: (e.currentTarget as HTMLElement).className,
            });
          }}
        >
          {/* Left Sidebar - Game Info */}
          <GameInfo gameState={gameState} onEndGame={onEndGame} />

          {/* Center - Game Board */}
          <div className="game-board-container" data-no-spatial-gestures="true">
            <div>
              {/* Battle Zones Container */}
              <div className="battle-zones-container">
                {/* Zone Rows Wrapper - NOT spatialized to prevent dragging */}
                <div className="zone-rows-wrapper">
                  {/* Opponent Monster Zones */}
                  <div className="flex justify-center space-x-2 mb-4">
                    {gameState.opponent.zones.mainMonsterZones.map(
                      (card, index) => (
                        <div
                          key={`opponent-monster-${index}`}
                          className="relative"
                        >
                          <CardSlot
                            card={card}
                            isOpponent={true}
                            zoneIndex={index}
                            zoneType="monster"
                            isPlayerZone={false}
                            gameState={gameState}
                            isAITurn={isAITurn}
                            onClick={
                              card
                                ? () => handleCardClick(card, false)
                                : undefined
                            }
                          />
                          {!card && (
                            <div className="absolute inset-0 border-rounded-md border-slate-400 flex items-center justify-center pointer-events-none">
                              <div className="text-white text-[10px] font-bold text-center leading-tight">
                                MONSTER
                                <br />
                                ZONE
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Player Monster Zones */}
                  <div className="flex justify-center space-x-2 mb-2">
                    {gameState.player.zones.mainMonsterZones.map(
                      (card, index) => (
                        <div
                          key={`player-monster-${index}`}
                          className="relative"
                        >
                          <CardSlot
                            card={card}
                            isOpponent={false}
                            zoneIndex={index}
                            zoneType="monster"
                            isPlayerZone={true}
                            isSelected={selectedCard?.id === card?.id}
                            isValidTarget={validTargets.some(
                              (t) => t.id === card?.id
                            )}
                            gameState={gameState}
                            isAITurn={isAITurn}
                            onClick={
                              card
                                ? () => handleCardClick(card, true)
                                : undefined
                            }
                            onRegisterDropZone={registerDropZone}
                            onUnregisterDropZone={unregisterDropZone}
                          />
                          {!card && (
                            <div className="absolute inset-0 border-rounded-md border-slate-400 flex items-center justify-center pointer-events-none">
                              <div className="text-white text-[10px] font-bold text-center leading-tight">
                                MONSTER
                                <br />
                                ZONE
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Hand - Detached and Fixed */}
          <div
            enable-xr
            data-no-spatial-gestures="true"
            className="player-hand-container"
            onMouseDown={(e) => {
              console.log("📦 Hand container mouseDown captured", {
                target: e.target,
                currentTarget: e.currentTarget,
              });
            }}
          >
            {gameState.player.hand.map((card, index) => (
              <HandCard
                key={`player-hand-${index}`}
                card={card}
                index={index}
                isPlayerHand={true}
                isAITurn={isAITurn}
                onClick={() => handleHandCardClick(card)}
                onDragStart={(event, cardId, element) => {
                  console.log(
                    "🎴 GameBoard received onDragStart from HandCard"
                  );
                  handleDragStart(event, cardId, element);
                }}
                isDraggable={!isAITurn && gameState.currentPhase === "Main"}
              />
            ))}
          </div>

          {/* Right Sidebar - Action Buttons */}
          <GameActions
            isAITurn={isAITurn}
            onNextPhase={handleNextPhase}
            onEndTurn={handleEndTurn}
          />
        </div>
      </div>

      {/* Modals */}
      {selectedCard && selectedCard.position === "hand" && (
        <CardActionModal
          selectedCard={selectedCard}
          gameState={gameState}
          onClose={clearSelection}
          onNormalSummon={handleSummonFromModal}
          onSetMonster={handleSummonFromModal}
          isAITurn={isAITurn}
        />
      )}

      <TargetingModal
        targetingMode={targetingMode}
        selectedCard={selectedCard}
        validTargets={validTargets}
        gameState={gameState}
        showConfirmation={showConfirmation}
        onTargetSelect={(target) =>
          selectedCard && selectTarget(target, selectedCard)
        }
        onCancel={handleCancelAction}
      />

      <BattleConfirmModal
        show={showConfirmation}
        pendingAction={pendingAction}
        selectedCard={selectedCard}
        gameState={gameState}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />

      <GameEndModal
        show={showGameEndModal}
        gameState={gameState}
        onPlayAgain={handlePlayAgain}
        onReturnHome={onEndGame}
      />

      <CardPreviewModal card={previewCard} onClose={handleClosePreview} />
    </>
  );
};

export default GameBoard;
