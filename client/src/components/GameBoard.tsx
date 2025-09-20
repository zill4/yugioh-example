import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getXRProps } from '../utils/xr';
import { GameController } from '../game/GameController';
import type { GameState, GameCard, CardInPlay } from '../game/types/GameTypes';
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
          // Simple attack logic - attack first available target
          const opponentMonsters = gameState.opponent.monsterZones.filter(m => m !== null);
          if (opponentMonsters.length > 0) {
            const targetIndex = gameState.opponent.monsterZones.findIndex(m => m !== null);
            gameControllerRef.current.attack(card.id, targetIndex);
          } else {
            // Direct attack
            gameControllerRef.current.attack(card.id);
          }
        }
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

  // Memoized helper functions (declare first to avoid hoisting issues)
  const canDropCard = useCallback((card: CardInPlay, targetId: string, currentGameState: GameState): boolean => {
    const targetMatch = targetId.match(/zone-(\w+)-(\d+)/);
    if (!targetMatch) return false;

    const zoneType = targetMatch[1] as 'monster' | 'spellTrap';
    const zoneIndex = parseInt(targetMatch[2]);

    if (card.position === 'hand') {
      if (currentGameState.currentPhase !== 'Main1' && currentGameState.currentPhase !== 'Main2') return false;
      const playerState = currentGameState.player;
      const targetZone = zoneType === 'monster' ? playerState.monsterZones : playerState.spellTrapZones;
      return targetZone[zoneIndex] === null;
    }

    if (card.position === 'monster' && currentGameState.currentPhase === 'Battle') {
      return zoneType === 'monster' && zoneIndex >= 0 && zoneIndex < 5;
    }

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
    const card = event.active.data.current as CardInPlay;
    console.log('Drag started:', card.name, card.position);
    setDraggedCard(card);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (!gameState) return;
    
    const card = event.active.data.current as CardInPlay;
    const over = event.over;

    if (over && canDropCard(card, over.id as string, gameState)) {
      console.log('Valid drop target:', over.id);
    }
  }, [gameState?.currentPhase, gameState?.player, canDropCard]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const card = event.active.data.current as CardInPlay;
    const over = event.over;

    console.log('Drag ended:', card.name, over ? `over ${over.id}` : 'over nothing');

    if (over && gameState && canDropCard(card, over.id as string, gameState)) {
      const overId = over.id as string;
      const zoneMatch = overId.match(/zone-(\w+)-(\d+)/);

      if (zoneMatch) {
        const zoneIndex = parseInt(zoneMatch[2]);

        try {
          if (card.position === 'hand') {
            console.log('Playing card from hand to zone', zoneIndex);
            gameControllerRef.current?.playCard(card.id, zoneIndex);
          } else if (card.position === 'monster') {
            console.log('Attacking with monster to zone', zoneIndex);
            const targetMonster = gameState.opponent.monsterZones[zoneIndex];
            if (targetMonster) {
              gameControllerRef.current?.attack(card.id, zoneIndex);
            } else {
              gameControllerRef.current?.attack(card.id);
            }
          }
        } catch (error) {
          console.error('Error handling drop:', error);
        }
      }
    }

    setDraggedCard(null);
  }, [gameState?.opponent.monsterZones, canDropCard]);

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
  }> = ({ id, children }) => {
    const { setNodeRef, isOver } = useDroppable({
      id,
    });

    return (
      <div
        ref={setNodeRef}
        className={isOver ? 'drop-zone-hover' : ''}
      >
        {children}
      </div>
    );
  };

  // Card Slot Component
  const CardSlot: React.FC<{
    card: CardInPlay | null;
    isMonster?: boolean;
    isOpponent?: boolean;
    zoneIndex: number;
    zoneType: 'monster' | 'spellTrap';
    isPlayerZone: boolean;
  }> = React.memo(({ card, isMonster = false, isOpponent = false, zoneIndex, zoneType, isPlayerZone }) => {
    const isValidTarget = useMemo(() => 
      gameState ? isValidDropTarget(zoneType, zoneIndex) : false,
      [gameState?.currentPhase, gameState?.player, draggedCard, zoneType, zoneIndex, isValidDropTarget]
    );
    const canDrag = useMemo(() => 
      card && isPlayerZone && canDragCard(card),
      [card, isPlayerZone, gameState?.currentPhase, gameState?.currentTurn, canDragCard]
    );

    return (
      <DroppableZone id={`zone-${zoneType}-${zoneIndex}`}>
        <div
          {...getXRProps()}
          onClick={card ? () => handleCardClick(card, isPlayerZone) : undefined}
          className={`
            w-12 h-16 rounded border flex items-center justify-center
            transition-all duration-200
            ${card
              ? `bg-gradient-to-br ${isMonster ? 'from-amber-600 to-amber-800 border-amber-500' : 'from-purple-600 to-purple-800 border-purple-500'} ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`
              : `bg-slate-700/50 border-slate-600 border-dashed hover:bg-slate-600/50 cursor-pointer`
            }
            ${isAITurn && isPlayerZone ? 'opacity-50 cursor-not-allowed' : ''}
            ${draggedCard && !card && isValidTarget && isPlayerZone ? 'bg-green-600/50 border-green-400 animate-pulse' : ''}
            ${draggedCard && !card && !isValidTarget && isPlayerZone ? 'bg-red-600/30 border-red-400' : ''}
          `}
        >
          {card ? (
            <DraggableCard card={card} isPlayerCard={isPlayerZone}>
              <div
                {...getXRProps()}
                className={`
                  text-[10px] font-bold text-white text-center p-0.5 leading-tight select-none
                  ${canDrag ? 'hover:scale-105 transition-transform' : ''}
                `}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                }}
              >
                {isOpponent ? '🎴' : card.name}
              </div>
            </DraggableCard>
          ) : (
            <div {...getXRProps()} className="text-slate-400 text-sm">
              {isMonster ? '👹' : '✨'}
            </div>
          )}
        </div>
      </DroppableZone>
    );
  });

  // Hand Card Component with memoization
  const HandCard: React.FC<{ card: GameCard; index: number; isPlayerHand: boolean }> = React.memo(({ card, index, isPlayerHand }) => {
    const cardInPlay = useMemo(() => ({ ...card, position: 'hand' } as CardInPlay), [card]);

    return (
      <DraggableCard card={cardInPlay} isPlayerCard={isPlayerHand}>
        <div
          {...getXRProps()}
          onClick={() => isPlayerHand && !isAITurn && handleCardClick(cardInPlay, true)}
          className={`w-12 h-16 bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500 rounded flex items-center justify-center shadow-xl select-none ${
            isAITurn && isPlayerHand ? 'opacity-50 cursor-not-allowed' : ''
          } hover:scale-105 transition-all duration-200`}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          <div {...getXRProps()} className="text-[10px] font-bold text-white text-center p-0.5 leading-tight">
            {card?.name || `Card ${index + 1}`}
          </div>
        </div>
      </DraggableCard>
    );
  });

  // Deck Area Component
  const DeckArea: React.FC<{ cards: GameCard[]; label: string; isOpponent?: boolean }> = ({ cards, label, isOpponent: _isOpponent = false }) => (
    <div {...getXRProps()} className="flex flex-col items-center space-y-1">
      <div
        {...getXRProps()}
        className={`w-10 h-14 bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-500 rounded flex items-center justify-center cursor-pointer hover:border-blue-400/50 transition-all duration-200 ${
          _isOpponent ? 'rotate-180' : ''
        }`}
      >
        <div {...getXRProps()} className="text-slate-300 text-xs font-bold">
          {cards.length}
        </div>
      </div>
      <div {...getXRProps()} className="text-[10px] text-slate-400 font-medium">
        {label}
      </div>
    </div>
  );

  // Graveyard Area Component
  const GraveyardArea: React.FC<{ cards: GameCard[]; label: string }> = ({ cards, label }) => (
    <div {...getXRProps()} className="flex flex-col items-center space-y-1">
      <div
        {...getXRProps()}
        className="w-10 h-14 bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-500 rounded flex items-center justify-center cursor-pointer hover:border-gray-400/50 transition-all duration-200"
      >
        <div {...getXRProps()} className="text-gray-300 text-xs font-bold">
          {cards.length}
        </div>
      </div>
      <div {...getXRProps()} className="text-[10px] text-slate-400 font-medium">
        {label}
      </div>
    </div>
  );

  // Banished Area Component
  const BanishedArea: React.FC<{ cards: GameCard[]; label: string }> = ({ cards, label }) => (
    <div {...getXRProps()} className="flex flex-col items-center space-y-1">
      <div
        {...getXRProps()}
        className="w-10 h-14 bg-gradient-to-br from-orange-700 to-orange-900 border border-orange-500 rounded flex items-center justify-center cursor-pointer hover:border-orange-400/50 transition-all duration-200"
      >
        <div {...getXRProps()} className="text-orange-300 text-xs font-bold">
          {cards.length}
        </div>
      </div>
      <div {...getXRProps()} className="text-[10px] text-slate-400 font-medium">
        {label}
      </div>
    </div>
  );

  // Extra Deck Area Component
  const ExtraDeckArea: React.FC<{ cards: GameCard[]; label: string; isOpponent?: boolean }> = ({ cards, label, isOpponent: _isOpponent = false }) => (
    <div {...getXRProps()} className="flex flex-col items-center space-y-1">
      <div
        {...getXRProps()}
        className="w-10 h-14 bg-gradient-to-br from-indigo-700 to-indigo-900 border border-indigo-500 rounded flex items-center justify-center cursor-pointer hover:border-indigo-400/50 transition-all duration-200"
      >
        <div {...getXRProps()} className="text-indigo-300 text-xs font-bold">
          {cards.length}
        </div>
      </div>
      <div {...getXRProps()} className="text-[10px] text-slate-400 font-medium">
        {label}
      </div>
    </div>
  );

  // Life Points Display Component
  const LifePointsDisplay: React.FC<{ lifePoints: number; label: string; isOpponent?: boolean }> = ({ lifePoints, label, isOpponent: _isOpponent = false }) => (
    <div {...getXRProps()} className="flex flex-col items-center space-y-1">
      <div
        {...getXRProps()}
        className="w-20 h-16 bg-gradient-to-br from-red-600 to-red-800 border border-red-500 rounded flex items-center justify-center cursor-pointer hover:border-red-400/50 transition-all duration-200"
      >
        <div {...getXRProps()} className="text-red-200 text-sm font-bold">
          {lifePoints}
        </div>
      </div>
      <div {...getXRProps()} className="text-[10px] text-slate-400 font-medium">
        {label}
      </div>
    </div>
  );

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div {...getXRProps()} className="min-h-screen bg-slate-900 relative overflow-hidden">
        {/* Game Background */}
        <div {...getXRProps()} className="absolute inset-0 opacity-30">
          <div {...getXRProps()} className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-800/40 to-blue-900/20" />
        </div>

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
              </div>
              <div {...getXRProps()} className="text-center">
                <div {...getXRProps()} className="text-sm text-slate-400">Turn</div>
                <div {...getXRProps()} className="text-lg font-bold text-blue-400">
                  {gameState.currentTurn === 'player' ? 'Your Turn' : 'Opponent\'s Turn'}
                </div>
              </div>
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
        <div {...getXRProps()} className="relative p-2 h-screen overflow-hidden">
          <div {...getXRProps()} className="h-full flex flex-col justify-between max-w-6xl mx-auto">

            {/* Opponent's Area (Top) */}
            <div {...getXRProps()} className="flex flex-col items-center space-y-2">
              {/* Opponent Top Row - LP, Extra Deck, Deck, GY, Banished */}
              <div {...getXRProps()} className="flex justify-between items-center w-full">
                <LifePointsDisplay
                  lifePoints={gameState.opponent.lifePoints}
                  label="Opponent LP"
                  isOpponent={true}
                />
                <ExtraDeckArea
                  cards={gameState.opponent.extraDeck}
                  label="Extra Deck"
                  isOpponent={true}
                />
                <DeckArea
                  cards={gameState.opponent.mainDeck}
                  label="Deck"
                  isOpponent={true}
                />
                <GraveyardArea
                  cards={gameState.opponent.graveyard}
                  label="Graveyard"
                />
                <BanishedArea
                  cards={gameState.opponent.banished}
                  label="Banished"
                />
              </div>

              {/* Opponent Field Zones */}
              <div {...getXRProps()} className="flex items-center space-x-1">
                {/* Monster Zones (5) */}
                {gameState.opponent.monsterZones.map((card, index) => (
                  <CardSlot
                    key={`opponent-monster-${index}`}
                    card={card}
                    isMonster={true}
                    isOpponent={true}
                    zoneIndex={index}
                    zoneType="monster"
                    isPlayerZone={false}
                  />
                ))}
              </div>

              <div {...getXRProps()} className="flex items-center space-x-1">
                {/* Spell/Trap Zones (5) */}
                {gameState.opponent.spellTrapZones.map((card, index) => (
                  <CardSlot
                    key={`opponent-spell-${index}`}
                    card={card}
                    isMonster={false}
                    isOpponent={true}
                    zoneIndex={index}
                    zoneType="spellTrap"
                    isPlayerZone={false}
                  />
                ))}
              </div>

              {/* Opponent Hand */}
              <div {...getXRProps()} className="flex items-center space-x-1">
                {gameState.opponent.hand.map((_card, index) => (
                  <div
                    key={`opponent-hand-${index}`}
                    {...getXRProps()}
                    className="w-12 h-16 bg-gradient-to-br from-slate-600 to-slate-800 border border-slate-500 rounded flex items-center justify-center shadow-xl"
                  >
                    <div {...getXRProps()} className="text-[10px] font-bold text-slate-400 text-center p-0.5 leading-tight">
                      🎴
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Area - Game Log */}
            <div {...getXRProps()} className="flex justify-center items-center py-2">
              <div {...getXRProps()} className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 min-h-[80px] w-full max-w-md">
                <div {...getXRProps()} className="text-xs text-slate-400 font-medium mb-1">GAME LOG</div>
                <div {...getXRProps()} className="space-y-1 text-xs text-slate-300">
                  {gameState?.gameLog?.slice(-3).map((event, i) => (
                    <div key={i} {...getXRProps()} className="text-[10px]">
                      {event.message}
                    </div>
                  ))}
                  {(!gameState?.gameLog || gameState.gameLog.length === 0) && (
                    <div className="text-[10px] text-slate-500">No game events yet...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Player's Area (Bottom) */}
            <div {...getXRProps()} className="flex flex-col items-center space-y-2">
              {/* Player Hand */}
              <div {...getXRProps()} className="flex items-center space-x-1">
                {gameState.player.hand.map((card, index) => (
                  <HandCard
                    key={`player-hand-${index}`}
                    card={card}
                    index={index}
                    isPlayerHand={true}
                  />
                ))}
              </div>

              {/* Player Field Zones */}
              <div {...getXRProps()} className="flex items-center space-x-1">
                {/* Monster Zones (5) */}
                {gameState.player.monsterZones.map((card, index) => (
                  <CardSlot
                    key={`player-monster-${index}`}
                    card={card}
                    isMonster={true}
                    isOpponent={false}
                    zoneIndex={index}
                    zoneType="monster"
                    isPlayerZone={true}
                  />
                ))}
              </div>

              <div {...getXRProps()} className="flex items-center space-x-1">
                {/* Spell/Trap Zones (5) */}
                {gameState.player.spellTrapZones.map((card, index) => (
                  <CardSlot
                    key={`player-spell-${index}`}
                    card={card}
                    isMonster={false}
                    isOpponent={false}
                    zoneIndex={index}
                    zoneType="spellTrap"
                    isPlayerZone={true}
                  />
                ))}
              </div>

              {/* Player Bottom Row - LP, Extra Deck, Deck, GY, Banished */}
              <div {...getXRProps()} className="flex justify-between items-center w-full">
                <LifePointsDisplay
                  lifePoints={gameState.player.lifePoints}
                  label="Your LP"
                  isOpponent={false}
                />
                <ExtraDeckArea
                  cards={gameState.player.extraDeck}
                  label="Extra Deck"
                  isOpponent={false}
                />
                <DeckArea
                  cards={gameState.player.mainDeck}
                  label="Deck"
                  isOpponent={false}
                />
                <GraveyardArea
                  cards={gameState.player.graveyard}
                  label="Graveyard"
                />
                <BanishedArea
                  cards={gameState.player.banished}
                  label="Banished"
                />
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
  );
};

export default GameBoard;
