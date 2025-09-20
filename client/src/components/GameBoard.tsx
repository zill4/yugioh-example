import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getXRProps } from '../utils/xr';
import { GameController } from '../game/GameController';
import type { GameState, GameCard, CardInPlay, GameAction } from '../game/types/GameTypes';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';

interface GameBoardProps {
  gameMode: string;
  onEndGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameMode, onEndGame }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<CardInPlay | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardInPlay | null>(null);
  const [showCardActionModal, setShowCardActionModal] = useState(false);
  const [showTargetingModal, setShowTargetingModal] = useState(false);
  const [targetingMode, setTargetingMode] = useState<'attack' | 'effect' | null>(null);
  const [pendingAction, setPendingAction] = useState<GameAction | null>(null);
  const [availableTargets, setAvailableTargets] = useState<CardInPlay[]>([]);
  const gameControllerRef = useRef<GameController | null>(null);
  
  // Derive AI turn state from gameState to ensure consistency
  const isAITurn = useMemo(() => {
    return gameState?.currentTurn === 'opponent';
  }, [gameState?.currentTurn]);

  // Dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Memoized game logic functions to prevent stale closures
  const handleCardClick = useCallback((card: CardInPlay, isPlayerCard: boolean) => {
    if (!gameControllerRef.current || !gameState || isAITurn) return;

    if (!isPlayerCard) return;

    switch (gameState.currentPhase) {
      case 'Main1':
      case 'Main2':
        // Attack with monster if it's on the field
        if (card.position === 'monster') {
          // Show targeting modal for attack
          setTargetingMode('attack');
          setPendingAction({
            type: 'ATTACK',
            player: 'player',
            cardId: card.id,
          });
          setShowTargetingModal(true);
        }
        break;

      case 'Battle':
        // Attack with monster if it's on the field
        if (card.position === 'monster') {
          // Show targeting modal for attack
          setTargetingMode('attack');
          setPendingAction({
            type: 'ATTACK',
            player: 'player',
            cardId: card.id,
          });
          setShowTargetingModal(true);
        }
        break;
    }
  }, [gameState, isAITurn]);

  // Enhanced card interaction handler
  const handleCardAction = useCallback((card: CardInPlay, action: string) => {
    if (!gameControllerRef.current || !gameState || isAITurn) return;

    switch (action) {
      case 'activate':
        gameControllerRef.current.activateEffect(card.id);
        break;
      case 'summon':
        gameControllerRef.current.normalSummon(card.id);
        break;
      case 'set':
        gameControllerRef.current.setMonster(card.id);
        break;
      case 'special_summon':
        gameControllerRef.current.specialSummon(card.id);
        break;
    }
  }, [gameState, isAITurn]);

  const handleNextPhase = useCallback(() => {
    if (!gameControllerRef.current || isAITurn) return;
    gameControllerRef.current.changePhase();
  }, [isAITurn]);

  const handleEndTurn = useCallback(() => {
    if (!gameControllerRef.current || isAITurn) return;
    gameControllerRef.current.endTurn();
  }, [isAITurn]);

  const handleDrawCard = useCallback(() => {
    if (!gameControllerRef.current || isAITurn) return;
    gameControllerRef.current.drawCard();
  }, [isAITurn]);

  // Memoized helper functions (declare first to avoid hoisting issues)
  const canDropCard = useCallback((card: CardInPlay, targetId: string, currentGameState: GameState): boolean => {
    const targetMatch = targetId.match(/zone-(\w+)-(\d+)/);
    if (!targetMatch) {
      console.log('canDropCard: Invalid target ID format:', targetId);
      return false;
    }

    const zoneType = targetMatch[1] as 'monster' | 'spellTrap';
    const zoneIndex = parseInt(targetMatch[2]);

    console.log('canDropCard check:', {
      cardName: card.name,
      cardPosition: card.position,
      cardType: card.type,
      targetZoneType: zoneType,
      zoneIndex,
      currentPhase: currentGameState.currentPhase
    });

    if (card.position === 'hand') {
      // Check if it's the right phase
      if (currentGameState.currentPhase !== 'Main1' && currentGameState.currentPhase !== 'Main2') {
        console.log('canDropCard: Wrong phase for playing cards:', currentGameState.currentPhase);
        return false;
      }

      // Check card type matches zone type
      const isMonsterCard = card.type === 'monster';
      const isMonsterZone = zoneType === 'monster';
      
      if (isMonsterCard !== isMonsterZone) {
        console.log('canDropCard: Card type mismatch - card is monster:', isMonsterCard, 'zone is monster:', isMonsterZone);
        return false;
      }

      const playerState = currentGameState.player;
      const targetZone = zoneType === 'monster' ? playerState.zones.mainMonsterZones : playerState.zones.spellTrapZones;
      const zoneEmpty = targetZone[zoneIndex] === null;
      
      console.log('canDropCard: Zone empty check:', zoneEmpty, 'zone content:', targetZone[zoneIndex]);
      return zoneEmpty;
    }

    if (card.position === 'monster' && currentGameState.currentPhase === 'Battle') {
      return zoneType === 'monster' && zoneIndex >= 0 && zoneIndex < 5;
    }

    console.log('canDropCard: No matching condition found');
    return false;
  }, []);

  const canDragCard = useCallback((card: CardInPlay): boolean => {
    console.log("Can drag card - Phase:", gameState?.currentPhase, "Turn:", gameState?.currentTurn, "isAITurn:", isAITurn);
    if (!gameState || isAITurn) return false;
    
    if (card.position === 'hand') {
      return gameState.currentPhase === 'Main1' || gameState.currentPhase === 'Main2';
    } else if (card.position === 'monster') {
      return gameState.currentPhase === 'Battle';
    }

    return false;
  }, [gameState?.currentPhase, gameState?.currentTurn, isAITurn]);

  // Memoized dnd-kit drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const cardData = event.active.data.current;
    const card = cardData?.card as CardInPlay;
    console.log('Drag started:', card?.name, card?.position, cardData);
    setDraggedCard(card);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (!gameState) return;
    
    const cardData = event.active.data.current;
    const card = cardData?.card as CardInPlay;
    const over = event.over;

    if (over && card && canDropCard(card, over.id as string, gameState)) {
      console.log('Valid drop target:', over.id, 'for card:', card.name);
    }
  }, [gameState?.currentPhase, gameState?.player, canDropCard]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const cardData = event.active.data.current;
    const card = cardData?.card as CardInPlay;
    const over = event.over;

    console.log('Drag ended:', card?.name, over ? `over ${over.id}` : 'over nothing', 'cardData:', cardData);

    if (over && card && gameState && canDropCard(card, over.id as string, gameState)) {
      const overId = over.id as string;
      const zoneMatch = overId.match(/zone-(\w+)-(\d+)/);

      if (zoneMatch) {
        const zoneIndex = parseInt(zoneMatch[2]);

        try {
          if (card.position === 'hand') {
            console.log('Playing card from hand to zone', zoneIndex, 'card:', card.name);
            // For monsters, show the action modal instead of direct play
            if (card.type === 'monster') {
              setSelectedCard(card);
              setShowCardActionModal(true);
            } else {
              gameControllerRef.current?.playCard(card.id, zoneIndex);
            }
          } else if (card.position === 'monster') {
            console.log('Attacking with monster to zone', zoneIndex);
            const targetMonster = gameState.opponent.zones.mainMonsterZones[zoneIndex];
            if (targetMonster) {
              // Show targeting modal for attack
              setTargetingMode('attack');
              setPendingAction({
                type: 'ATTACK',
                player: 'player',
                cardId: card.id,
                zoneIndex: zoneIndex,
              });
              setShowTargetingModal(true);
            } else {
              // Direct attack
              gameControllerRef.current?.attack(card.id);
            }
          }
        } catch (error) {
          console.error('Error handling drop:', error);
        }
      }
    } else {
      console.log('Drop failed - card:', card?.name, 'over:', over?.id, 'canDrop:', card && gameState ? canDropCard(card, over?.id as string, gameState) : false);
    }

    setDraggedCard(null);
  }, [gameState, canDropCard]);

  // (Functions moved above for proper declaration order)

  const isValidDropTarget = useCallback((_zoneType: 'monster' | 'spellTrap', zoneIndex: number): boolean => {
    if (!draggedCard || !gameState) return false;

    const targetMatch = `zone-${_zoneType}-${zoneIndex}`;
    return canDropCard(draggedCard, targetMatch, gameState);
  }, [draggedCard, gameState?.currentPhase, gameState?.player, canDropCard]);

  // Draggable Card Component with proper memoization
  const DraggableCard: React.FC<{
    card: CardInPlay;
    isPlayerCard: boolean;
    children: React.ReactNode;
  }> = React.memo(({ card, isPlayerCard: _isPlayerCard, children }) => {
    const canDrag = canDragCard(card);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({
      id: `card-${card.id}`,
      data: {
        card,
        type: 'card',
      },
      disabled: !canDrag,
    });

    const style = useMemo(() => ({
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      opacity: isDragging ? 0.5 : 1,
    }), [transform, isDragging]);

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={canDrag ? 'cursor-grab active:cursor-grabbing' : ''}
      >
        {children}
      </div>
    );
  });

  // Droppable Zone Component
  const DroppableZone: React.FC<{
    id: string;
    children: React.ReactNode;
    isPlayerZone?: boolean;
  }> = ({ id, children, isPlayerZone = false }) => {
    const { setNodeRef, isOver } = useDroppable({
      id,
    });

    // Only show highlight for player zones
    const shouldHighlight = isOver && draggedCard && isPlayerZone;

    return (
      <div
        ref={setNodeRef}
        className={`relative ${isOver ? 'drop-zone-hover' : ''}`}
      >
        {children}
        {shouldHighlight && (
          <div className="absolute inset-0 bg-yellow-400/30 border-2 border-yellow-400 rounded-md animate-pulse pointer-events-none z-10" />
        )}
      </div>
    );
  };

  // Card Slot Component
  const CardSlot: React.FC<{
    card: CardInPlay | null;
    isOpponent?: boolean;
    zoneIndex: number;
    zoneType: 'monster' | 'spellTrap';
    isPlayerZone: boolean;
  }> = React.memo(({ card, isOpponent = false, zoneIndex, zoneType, isPlayerZone }) => {
    const isValidTarget = useMemo(() =>
      gameState ? isValidDropTarget(zoneType, zoneIndex) : false,
      [gameState?.currentPhase, gameState?.player, draggedCard, zoneType, zoneIndex, isValidDropTarget]
    );
    const canDrag = useMemo(() =>
      card && isPlayerZone && canDragCard(card),
      [card, isPlayerZone, gameState?.currentPhase, gameState?.currentTurn, canDragCard]
    );

    const getCardStatus = useCallback((card: CardInPlay) => {
      const status = [];
      if (card.attackUsed) status.push('Attacked');
      if (card.summonedThisTurn) status.push('Summoned');
      if (card.faceDown) status.push('Set');
      return status;
    }, []);

    return (
      <DroppableZone id={`zone-${zoneType}-${zoneIndex}`} isPlayerZone={isPlayerZone}>
        <div
          {...getXRProps()}
          onClick={card ? () => handleCardClick(card, isPlayerZone) : undefined}
          className={`
            w-24 h-32 rounded-md border-2 flex items-center justify-center
            transition-all duration-200 relative
            ${card
              ? `bg-white border-gray-800 shadow-lg ${canDrag ? 'cursor-grab active:cursor-grabbing hover:scale-105' : 'cursor-pointer'}`
              : `bg-transparent border-transparent`
            }
            ${isAITurn && isPlayerZone ? 'opacity-50 cursor-not-allowed' : ''}
            ${draggedCard && !card && isValidTarget && isPlayerZone ? 'bg-green-700/60 border-green-400 animate-pulse shadow-lg shadow-green-400/20' : ''}
            ${draggedCard && !card && !isValidTarget && isPlayerZone ? 'bg-red-700/40 border-red-500' : ''}
          `}
        >
          {card && (
            <DraggableCard card={card} isPlayerCard={isPlayerZone}>
              <div
                {...getXRProps()}
                className={`
                  w-full h-full rounded-md overflow-hidden relative
                  ${canDrag ? 'hover:scale-[1.02] transition-transform' : ''}
                `}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                }}
              >
                {isOpponent ? (
                  <div className="w-full h-full bg-blue-900 border border-blue-700 rounded-md flex items-center justify-center">
                    <div className="text-white text-lg">🎴</div>
                    {card.faceDown && (
                      <div className="absolute top-1 right-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`w-full h-full border border-gray-800 rounded-md flex flex-col p-1 ${
                    card.faceDown ? 'bg-gradient-to-b from-purple-900 to-purple-800' : 'bg-gradient-to-b from-white to-gray-100'
                  }`}>
                    {card.faceDown ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-yellow-300 text-2xl">🂠</div>
                        <div className="absolute top-1 right-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-black text-[8px] font-bold text-center mb-1">{card.name}</div>
                        <div className="flex-1 bg-gradient-to-br from-blue-100 to-purple-200 rounded mb-1 flex items-center justify-center relative overflow-hidden">
                          {card.imageUrl ? (
                            <img
                              src={card.imageUrl}
                              alt={card.name}
                              className="w-full h-full object-cover rounded"
                              loading="lazy"
                            />
                          ) : (
                            <>
                              {card.type === 'monster' ? (
                                <div className="text-4xl opacity-60">👹</div>
                              ) : card.type === 'spell' ? (
                                <div className="text-3xl opacity-60">✨</div>
                              ) : (
                                <div className="text-3xl opacity-60">🃏</div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded"></div>
                            </>
                          )}
                        </div>
                        {card.attack !== undefined && (
                          <div className="text-[6px] text-black font-bold text-right">
                            ATK/{card.attack} DEF/{card.defense || 0}
                          </div>
                        )}
                        {card.type === 'monster' && (
                          <div className="text-[5px] text-gray-600 text-center mt-1">
                            {getCardStatus(card).join(' • ')}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </DraggableCard>
          )}
        </div>
      </DroppableZone>
    );
  });

  // Hand Card Component with memoization
  const HandCard: React.FC<{ card: GameCard; index: number; isPlayerHand: boolean }> = React.memo(({ card, index, isPlayerHand }) => {
    const cardInPlay = useMemo(() => ({ ...card, position: 'hand' } as CardInPlay), [card]);

    const handleHandCardClick = useCallback(() => {
      if (isPlayerHand && !isAITurn && gameState) {
        setSelectedCard(cardInPlay);
        setShowCardActionModal(true);
      }
    }, [isPlayerHand, isAITurn, gameState, cardInPlay]);

    return (
      <DraggableCard card={cardInPlay} isPlayerCard={isPlayerHand}>
        <div
          {...getXRProps()}
          onClick={handleHandCardClick}
          className={`w-16 h-24 bg-gradient-to-b from-white to-gray-100 border-2 border-gray-800 rounded-md shadow-lg select-none ${
            isAITurn && isPlayerHand ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:-translate-y-2 cursor-pointer'
          } transition-all duration-200 relative overflow-hidden`}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          <div {...getXRProps()} className="w-full h-full flex flex-col p-1">
            <div className="text-black text-[7px] font-bold text-center mb-1">{card?.name || `Card ${index + 1}`}</div>
            <div className="flex-1 bg-gradient-to-br from-blue-100 to-purple-200 rounded mb-1 flex items-center justify-center relative overflow-hidden">
              {card?.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full h-full object-cover rounded"
                  loading="lazy"
                />
              ) : (
                <>
                  {card?.type === 'monster' ? (
                    <div className="text-2xl opacity-60">👹</div>
                  ) : card?.type === 'spell' ? (
                    <div className="text-xl opacity-60">✨</div>
                  ) : (
                    <div className="text-xl opacity-60">🃏</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded"></div>
                </>
              )}
            </div>
            {card?.attack !== undefined && (
              <div className="text-[5px] text-black font-bold text-right">
                ATK/{card.attack} DEF/{card.defense || 0}
              </div>
            )}
          </div>
        </div>
      </DraggableCard>
    );
  });

  // Card Action Modal Component
  const CardActionModal: React.FC = () => {
    if (!selectedCard || !gameState) return null;

    const isMonster = selectedCard.type === 'monster';
    const canNormalSummon = !gameState.player.hasNormalSummoned && isMonster;
    const canSet = !gameState.player.hasSetMonster && isMonster;
    const isSpell = selectedCard.type === 'spell';
    const isTrap = selectedCard.type === 'trap';
    const canActivate = isSpell || isTrap;

    const handleNormalSummon = useCallback(() => {
      if (gameControllerRef.current) {
        gameControllerRef.current.normalSummon(selectedCard.id);
        setShowCardActionModal(false);
        setSelectedCard(null);
      }
    }, [selectedCard.id]);

    const handleSetCard = useCallback(() => {
      if (gameControllerRef.current) {
        gameControllerRef.current.setMonster(selectedCard.id);
        setShowCardActionModal(false);
        setSelectedCard(null);
      }
    }, [selectedCard.id]);

    const handleActivateSpellTrap = useCallback(() => {
      if (gameControllerRef.current) {
        gameControllerRef.current.activateEffect(selectedCard.id);
        setShowCardActionModal(false);
        setSelectedCard(null);
      }
    }, [selectedCard.id]);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-bold mb-4 text-center">{selectedCard.name}</h3>

          {isMonster && (
            <div className="space-y-3">
              <h4 className="font-semibold text-center">Monster Actions:</h4>
              <div className="space-y-2">
                {canNormalSummon && (
                  <button
                    onClick={handleNormalSummon}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Normal Summon (Face-up Attack)
                  </button>
                )}
                {canSet && (
                  <button
                    onClick={handleSetCard}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Set (Face-down Defense)
                  </button>
                )}
              </div>
            </div>
          )}

          {(isSpell || isTrap) && canActivate && (
            <div className="space-y-3">
              <h4 className="font-semibold text-center">
                {isSpell ? 'Spell' : 'Trap'} Actions:
              </h4>
              <div className="space-y-2">
                <button
                  onClick={handleActivateSpellTrap}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Activate {isSpell ? 'Spell' : 'Trap'}
                </button>
                <button
                  onClick={() => {
                    if (gameControllerRef.current) {
                      gameControllerRef.current.playCard(selectedCard.id);
                      setShowCardActionModal(false);
                      setSelectedCard(null);
                    }
                  }}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Set {isSpell ? 'Spell' : 'Trap'}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setShowCardActionModal(false);
              setSelectedCard(null);
            }}
            className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Targeting Modal Component
  const TargetingModal: React.FC = () => {
    if (!targetingMode || !gameState) return null;

    const getTargets = () => {
      switch (targetingMode) {
        case 'attack':
          return gameState.opponent.zones.mainMonsterZones.filter(card => card !== null) as CardInPlay[];
        case 'effect':
          // For now, return all valid targets - this would be more specific based on the effect
          return [
            ...gameState.opponent.zones.mainMonsterZones,
            ...gameState.opponent.zones.spellTrapZones,
            ...gameState.player.zones.mainMonsterZones,
            ...gameState.player.zones.spellTrapZones,
          ].filter(card => card !== null) as CardInPlay[];
        default:
          return [];
      }
    };

    const targets = getTargets();

    const handleTargetSelect = useCallback((target: CardInPlay) => {
      if (pendingAction && gameControllerRef.current) {
        const actionWithTarget = { ...pendingAction, targetId: target.id };
        gameControllerRef.current.executePlayerAction(actionWithTarget);
        setShowTargetingModal(false);
        setTargetingMode(null);
        setPendingAction(null);
      }
    }, [pendingAction]);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 text-center">
            Select Target for {targetingMode === 'attack' ? 'Attack' : 'Effect'}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {targets.map((target, index) => (
              <button
                key={index}
                onClick={() => handleTargetSelect(target)}
                className="p-3 border-2 border-gray-300 hover:border-blue-500 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-center">{target.name}</div>
                <div className="text-xs text-gray-600 text-center mt-1">
                  {target.type === 'monster' ? `ATK: ${target.attack}` : target.type}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setShowTargetingModal(false);
              setTargetingMode(null);
              setPendingAction(null);
            }}
            className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };


  useEffect(() => {
    console.log('GameBoard: Initializing...');

    try {
      const controller = new GameController();

      controller.initialize({
        onGameStateChange: (newGameState) => {
          console.log('Game state changed:', newGameState);
          setGameState(newGameState);
          // Remove setIsAITurn call since it's now derived from gameState
        },
        onAITurnStart: () => {
          console.log('AI turn started');
          // Remove setIsAITurn(true) since it's now derived from gameState
        },
        onAITurnEnd: () => {
          console.log('AI turn ended');
          // Remove setIsAITurn(false) since it's now derived from gameState
        },
        onGameEnd: (winner) => {
          console.log('Game ended, winner:', winner);
          // Handle game end
        },
      });

      gameControllerRef.current = controller;

      // Get initial game state immediately after initialization
      const initialGameState = controller.getGameState();
      console.log('Initial game state retrieved:', initialGameState);
      setGameState(initialGameState);
      // Remove setIsAITurn call since it's now derived from gameState

    } catch (error) {
      console.error('Failed to initialize game:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error');
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (gameControllerRef.current) {
        gameControllerRef.current = null;
      }
    };
  }, []); // Empty dependency array is correct since this should only run once

  // Error state
  if (initError) {
    return (
      <div {...getXRProps()} className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div {...getXRProps()} className="text-center">
          <div {...getXRProps()} className="text-red-400 text-xl mb-4">Game Initialization Error</div>
          <div {...getXRProps()} className="text-slate-300">{initError}</div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!gameState) {
    return (
      <div {...getXRProps()} className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
      <div {...getXRProps()} className="min-h-screen bg-black relative overflow-hidden">

        {/* Game Header */}
        <div {...getXRProps()} className="relative bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 p-4">
          <div {...getXRProps()} className="flex justify-between items-center">
            <div {...getXRProps()} className="flex items-center space-x-4">
              <button
                onClick={onEndGame}
                {...getXRProps()}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg text-sm font-bold transition-all duration-300"
              >
                END DUEL
              </button>
              <div {...getXRProps()} className="text-slate-300 text-sm">
                Mode: <span className="text-purple-400 font-semibold">{gameMode}</span>
              </div>
            </div>

            <div {...getXRProps()} className="flex items-center space-x-6">
              <div {...getXRProps()} className="text-center">
                <div {...getXRProps()} className="text-sm text-slate-400">Phase</div>
                <div {...getXRProps()} className="text-lg font-bold text-purple-400">{gameState.currentPhase}</div>
                <div {...getXRProps()} className="text-xs text-slate-500 mt-1">
                  {gameState.currentPhase === 'Draw' && 'Draw cards and activate effects'}
                  {gameState.currentPhase === 'Standby' && 'Activate standby effects'}
                  {gameState.currentPhase === 'Main1' && 'Summon, activate cards'}
                  {gameState.currentPhase === 'Battle' && 'Attack with monsters'}
                  {gameState.currentPhase === 'Main2' && 'Additional actions'}
                  {gameState.currentPhase === 'End' && 'End effects, discard'}
                </div>
              </div>
              <div {...getXRProps()} className="text-center">
                <div {...getXRProps()} className="text-sm text-slate-400">Turn</div>
                <div {...getXRProps()} className="text-lg font-bold text-blue-400">
                  {gameState.currentTurn === 'player' ? 'Your Turn' : 'Opponent\'s Turn'}
                </div>
                <div {...getXRProps()} className="text-xs text-slate-500 mt-1">
                  Turn {gameState.turnNumber}
                </div>
              </div>
              {gameState.currentTurn === 'player' && (
                <div {...getXRProps()} className="flex items-center space-x-2">
                  <div {...getXRProps()} className="text-xs text-slate-400">Actions:</div>
                  {!gameState.player.hasNormalSummoned && (
                    <div {...getXRProps()} className="text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded border border-green-600/30">
                      Can Summon
                    </div>
                  )}
                  {gameState.currentPhase === 'Battle' && (
                    <div {...getXRProps()} className="text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded border border-red-600/30">
                      Battle Phase
                    </div>
                  )}
                </div>
              )}
              {gameState.currentPhase === 'Draw' && gameState.currentTurn === 'player' && (
                <button
                  onClick={handleDrawCard}
                  disabled={isAITurn}
                  {...getXRProps()}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                    isAITurn
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700 text-white'
                  }`}
                >
                  Draw Card
                </button>
              )}
              <button
                onClick={handleNextPhase}
                disabled={isAITurn}
                {...getXRProps()}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  isAITurn
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white'
                }`}
              >
                Next Phase
              </button>
              <button
                onClick={handleEndTurn}
                disabled={isAITurn}
                {...getXRProps()}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  isAITurn
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white'
                }`}
              >
                End Turn
              </button>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div {...getXRProps()} className="relative p-4 h-screen overflow-hidden bg-black">
          <div {...getXRProps()} className="h-full flex flex-col justify-center max-w-6xl mx-auto">
            
            {/* Top Row - Opponent Spell/Trap Zones */}
            <div {...getXRProps()} className="flex justify-center space-x-2 mb-2">
              {gameState.opponent.zones.spellTrapZones.map((card, index) => (
                <div key={`opponent-spell-${index}`} className="relative">
                  <CardSlot
                    card={card}
                    isOpponent={true}
                    zoneIndex={index}
                    zoneType="spellTrap"
                    isPlayerZone={false}
                  />
                  {!card && (
                    <div className="absolute inset-0 bg-purple-600/80 border-2 border-purple-400 rounded-md flex items-center justify-center pointer-events-none">
                      <div className="text-white text-[10px] font-bold text-center leading-tight">
                        SPELL/TRAP<br/>ZONE
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Second Row - Opponent Monster Zones */}
            <div {...getXRProps()} className="flex justify-center space-x-2 mb-4">
              {gameState.opponent.zones.mainMonsterZones.map((card, index) => (
                <div key={`opponent-monster-${index}`} className="relative">
                  <CardSlot
                    card={card}
                    isOpponent={true}
                    zoneIndex={index}
                    zoneType="monster"
                    isPlayerZone={false}
                  />
                  {!card && (
                    <div className="absolute inset-0 bg-green-600/80 border-2 border-green-400 rounded-md flex items-center justify-center pointer-events-none">
                      <div className="text-white text-[10px] font-bold text-center leading-tight">
                        MONSTER<br/>ZONE
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Middle Section - Side Areas */}
            <div {...getXRProps()} className="flex justify-between items-center mb-4">
              {/* Left - Side Deck */}
              <div {...getXRProps()} className="w-20 h-32 bg-cyan-400 border-2 border-cyan-300 rounded-lg flex items-center justify-center">
                <div className="text-white text-xs font-bold text-center">
                  SIDE<br/>DECK
                </div>
              </div>

              {/* Right - Main Deck */}
              <div {...getXRProps()} className="w-20 h-32 bg-red-800 border-2 border-red-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                <div className="text-white text-xs font-bold text-center">
                  DECK<br/>
                  <span className="text-sm">{gameState.player.mainDeck.length}</span>
                </div>
              </div>
            </div>

            {/* Field Spell Zones */}
            <div {...getXRProps()} className="absolute top-4 right-4">
              <div className="w-16 h-24 bg-pink-400 border-2 border-pink-300 rounded-lg flex items-center justify-center">
                <div className="text-white text-[10px] font-bold text-center">
                  FIELD<br/>SPELL
                </div>
              </div>
            </div>

            <div {...getXRProps()} className="absolute bottom-32 left-4">
              <div className="w-16 h-24 bg-pink-400 border-2 border-pink-300 rounded-lg flex items-center justify-center">
                <div className="text-white text-[10px] font-bold text-center">
                  FIELD<br/>SPELL
                </div>
              </div>
            </div>

            {/* Third Row - Player Monster Zones */}
            <div {...getXRProps()} className="flex justify-center space-x-2 mb-2">
              {gameState.player.zones.mainMonsterZones.map((card, index) => (
                <div key={`player-monster-${index}`} className="relative">
                  <CardSlot
                    card={card}
                    isOpponent={false}
                    zoneIndex={index}
                    zoneType="monster"
                    isPlayerZone={true}
                  />
                  {!card && (
                    <div className="absolute inset-0 bg-green-600/80 border-2 border-green-400 rounded-md flex items-center justify-center pointer-events-none">
                      <div className="text-white text-[10px] font-bold text-center leading-tight">
                        MONSTER<br/>ZONE
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Fourth Row - Player Spell/Trap Zones */}
            <div {...getXRProps()} className="flex justify-center space-x-2 mb-4">
              {gameState.player.zones.spellTrapZones.map((card, index) => (
                <div key={`player-spell-${index}`} className="relative">
                  <CardSlot
                    card={card}
                    isOpponent={false}
                    zoneIndex={index}
                    zoneType="spellTrap"
                    isPlayerZone={true}
                  />
                  {!card && (
                    <div className="absolute inset-0 bg-purple-600/80 border-2 border-purple-400 rounded-md flex items-center justify-center pointer-events-none">
                      <div className="text-white text-[10px] font-bold text-center leading-tight">
                        SPELL/TRAP<br/>ZONE
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Row - Player Hand */}
            <div {...getXRProps()} className="flex justify-center space-x-1 pt-4">
              {gameState.player.hand.map((card, index) => (
                <HandCard
                  key={`player-hand-${index}`}
                  card={card}
                  index={index}
                  isPlayerHand={true}
                />
              ))}
            </div>

            {/* Game Log - Bottom Left */}
            <div {...getXRProps()} className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg p-2 w-48 min-h-[60px]">
              <div {...getXRProps()} className="text-xs text-slate-400 font-medium mb-1">GAME LOG</div>
              <div {...getXRProps()} className="space-y-1 text-xs text-slate-300 max-h-12 overflow-y-auto">
                {gameState?.gameLog?.slice(-2).map((event, i) => (
                  <div key={i} {...getXRProps()} className="text-[9px]">
                    {event.message}
                  </div>
                ))}
                {(!gameState?.gameLog || gameState.gameLog.length === 0) && (
                  <div className="text-[9px] text-slate-500">No game events yet...</div>
                )}
              </div>
            </div>

            {/* Life Points - Top Left */}
            <div {...getXRProps()} className="absolute top-4 left-4 text-white">
              <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg p-2 mb-2">
                <div className="text-xs">Opponent LP: {gameState.opponent.lifePoints}</div>
              </div>
              <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg p-2">
                <div className="text-xs">Your LP: {gameState.player.lifePoints}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedCard ? (
          <div className="w-12 h-16 bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500 rounded flex items-center justify-center shadow-xl opacity-90 rotate-3">
            <div className="text-[10px] font-bold text-white text-center p-0.5 leading-tight">
              {draggedCard.name}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>

    {/* Modals */}
    <CardActionModal />
    <TargetingModal />
    </>
  );
};

export default GameBoard;
