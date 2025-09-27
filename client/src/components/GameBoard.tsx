import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { getXRProps } from '../utils/xr';
import { GameController } from '../game/GameController';
import type { GameState, GameCard, CardInPlay, GameAction } from '../game/types/GameTypes';


interface GameBoardProps {
  gameMode: string;
  onEndGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameMode, onEndGame }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardInPlay | null>(null);
  const [targetingMode, setTargetingMode] = useState<'attack' | 'effect' | null>(null);
  const [pendingAction, setPendingAction] = useState<GameAction | null>(null);
  const gameControllerRef = useRef<GameController | null>(null);
  
  // Derive AI turn state from gameState to ensure consistency
  const isAITurn = useMemo(() => {
    return gameState?.currentTurn === 'opponent';
  }, [gameState?.currentTurn]);


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

  const handleDrawCard = useCallback(() => {
    if (!gameControllerRef.current || isAITurn) return;
    gameControllerRef.current.drawCard();
  }, [isAITurn]);


  // Card Slot Component
  const CardSlot: React.FC<{
    card: CardInPlay | null;
    isOpponent?: boolean;
    zoneIndex: number;
    zoneType: 'monster' | 'spellTrap';
    isPlayerZone: boolean;
  }> = React.memo(({ card, isOpponent = false, zoneIndex, zoneType, isPlayerZone }) => {
    const isValidTarget = useMemo(() =>
      gameState ? true : false,
      [gameState?.currentPhase, gameState?.player, zoneType, zoneIndex]
    );


    const getCardStatus = useCallback((card: CardInPlay) => {
      const status = [];
      if (card.attackUsed) status.push('Attacked');
      if (card.summonedThisTurn) status.push('Summoned');
      if (card.faceDown) status.push('Set');
      return status;
    }, []);

    return (
        <div
          
          onClick={card ? () => handleCardClick(card, isPlayerZone) : undefined}
          className={`
            w-24 h-32 rounded-md border-2 flex items-center justify-center
            transition-all duration-200 relative
            ${card
              ? `bg-white border-gray-800 shadow-lg cursor-pointer`
              : `bg-transparent border-transparent`
            }
            ${isAITurn && isPlayerZone ? 'opacity-50 cursor-not-allowed' : ''}
            ${ !card && isValidTarget && isPlayerZone ? 'bg-green-700/60 border-green-400 animate-pulse shadow-lg shadow-green-400/20' : ''}
            ${ !card && !isValidTarget && isPlayerZone ? 'bg-red-700/40 border-red-500' : ''}
          `}
        >
          {card && (
              <div
                
                className={`
                  w-full h-full rounded-md overflow-hidden relative
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
          )}
        </div>
    );
  });

  // Hand Card Component with memoization
  const HandCard: React.FC<{ card: GameCard; index: number; isPlayerHand: boolean }> = React.memo(({ card, index, isPlayerHand }) => {
    const cardInPlay = useMemo(() => ({ ...card, position: 'hand' } as CardInPlay), [card]);

    const handleHandCardClick = useCallback(() => {
      if (isPlayerHand && !isAITurn && gameState) {
        setSelectedCard(cardInPlay);
      }
    }, [isPlayerHand, isAITurn, gameState, cardInPlay]);

    return (
        <div
          
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
          <div  className="w-full h-full flex flex-col p-1">
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
        setSelectedCard(null);
      }
    }, [selectedCard.id]);

    const handleSetCard = useCallback(() => {
      if (gameControllerRef.current) {
        gameControllerRef.current.setMonster(selectedCard.id);
        setSelectedCard(null);
      }
    }, [selectedCard.id]);

    const handleActivateSpellTrap = useCallback(() => {
      if (gameControllerRef.current) {
        gameControllerRef.current.activateEffect(selectedCard.id);
        setSelectedCard(null);
      }
    }, [selectedCard.id]);

    return (
      <div className={`fixed inset-0 ${process.env.XR_ENV === 'avp' ? '' : 'bg-black/50'} flex items-center justify-center z-50`}>
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
        setTargetingMode(null);
        setPendingAction(null);
      }
    }, [pendingAction]);

    return (
      <div className={`fixed inset-0 ${process.env.XR_ENV === 'avp' ? '' : 'bg-black/50'} flex items-center justify-center z-50`}>
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
      <div  className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div  className="text-center">
          <div  className="text-red-400 text-xl mb-4">Game Initialization Error</div>
          <div  className="text-slate-300">{initError}</div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!gameState) {
    return (
      <div  className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <>
      <div  className={`min-h-screen ${process.env.XR_ENV === 'avp' ? '' : 'bg-black'} relative overflow-hidden`}>

        {/* Game Header */}
        <div  className="relative bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 p-4">
          <div  className="flex justify-between items-center">
            <div  className="flex items-center space-x-4">
              <button
                onClick={onEndGame}
                
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg text-sm font-bold transition-all duration-300"
              >
                END DUEL
              </button>
              <div  className="text-slate-300 text-sm">
                Mode: <span className="text-purple-400 font-semibold">{gameMode}</span>
              </div>
            </div>

            <div  className="flex items-center space-x-6">
              <div  className="text-center">
                <div  className="text-sm text-slate-400">Phase</div>
                <div  className="text-lg font-bold text-purple-400">{gameState.currentPhase}</div>
                <div  className="text-xs text-slate-500 mt-1">
                  {gameState.currentPhase === 'Draw' && 'Draw cards and activate effects'}
                  {gameState.currentPhase === 'Standby' && 'Activate standby effects'}
                  {gameState.currentPhase === 'Main1' && 'Summon, activate cards'}
                  {gameState.currentPhase === 'Battle' && 'Attack with monsters'}
                  {gameState.currentPhase === 'Main2' && 'Additional actions'}
                  {gameState.currentPhase === 'End' && 'End effects, discard'}
                </div>
              </div>
              <div  className="text-center">
                <div  className="text-sm text-slate-400">Turn</div>
                <div  className="text-lg font-bold text-blue-400">
                  {gameState.currentTurn === 'player' ? 'Your Turn' : 'Opponent\'s Turn'}
                </div>
                <div  className="text-xs text-slate-500 mt-1">
                  Turn {gameState.turnNumber}
                </div>
              </div>
              {gameState.currentTurn === 'player' && (
                <div  className="flex items-center space-x-2">
                  <div  className="text-xs text-slate-400">Actions:</div>
                  {!gameState.player.hasNormalSummoned && (
                    <div  className="text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded border border-green-600/30">
                      Can Summon
                    </div>
                  )}
                  {gameState.currentPhase === 'Battle' && (
                    <div  className="text-xs px-2 py-1 bg-red-600/20 text-red-40w0 rounded border border-red-600/30">
                      Battle Phase
                    </div>
                  )}
                </div>
              )}
              {gameState.currentPhase === 'Draw' && gameState.currentTurn === 'player' && (
                <button
                  onClick={handleDrawCard}
                  disabled={isAITurn}
                  
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
        <div  className={`relative p-4 h-screen overflow-hidden ${process.env.XR_ENV === 'avp' ? '' : 'bg-black'}`}>
          <div  className="h-full flex flex-col justify-center max-w-6xl mx-auto">
            
            {/* Top Row - Opponent Spell/Trap Zones */}
            <div  className="flex justify-center space-x-2 mb-2">
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
            <div  className="flex justify-center space-x-2 mb-4">
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
            <div  className="flex justify-between items-center mb-4">
              {/* Left - Opponent Life Points */}
              <div  className="w-20 h-32 bg-cyan-400 border-2 border-cyan-300 rounded-lg flex items-center justify-center">
                <div className="text-white text-xs font-bold text-center">
                  Opponent<br/>{gameState.opponent.lifePoints}
                </div>
              </div>

              {/* Right - Main Deck */}
              <div  className="w-20 h-32 bg-red-800 border-2 border-red-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                <div className="text-white text-xs font-bold text-center">
                  DECK<br/>
                  <span className="text-sm">{gameState.player.mainDeck.length}</span>
                </div>
              </div>
            </div>

            {/* Field Spell Zones */}
            <div  className="absolute top-4 right-4">
              <div className="w-16 h-24 bg-pink-400 border-2 border-pink-300 rounded-lg flex items-center justify-center">
                <div className="text-white text-[10px] font-bold text-center">
                  FIELD<br/>SPELL
                </div>
              </div>
            </div>

            <div  className="absolute bottom-32 left-4">
              <div className="w-16 h-24 bg-pink-400 border-2 border-pink-300 rounded-lg flex items-center justify-center">
                <div className="text-white text-[10px] font-bold text-center">
                  FIELD<br/>SPELL
                </div>
              </div>
            </div>

            {/* Third Row - Player Monster Zones */}
            <div  className="flex justify-center space-x-2 mb-2">
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
            <div  className="flex justify-center space-x-2 mb-4">
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
            <div  className="flex justify-center space-x-1 pt-4">
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
            <div  className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg p-2 w-48 min-h-[60px]">
              <div  className="text-xs text-slate-400 font-medium mb-1">GAME LOG</div>
              <div  className="space-y-1 text-xs text-slate-300 max-h-12 overflow-y-auto">
                {gameState?.gameLog?.slice(-2).map((event, i) => (
                  <div key={i}  className="text-[9px]">
                    {event.message}
                  </div>
                ))}
                {(!gameState?.gameLog || gameState.gameLog.length === 0) && (
                  <div className="text-[9px] text-slate-500">No game events yet...</div>
                )}
              </div>
            </div>

            {/* Life Points - Top Left */}
            <div  className="absolute top-4 left-4 text-white">
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

    {/* Modals */}
    <CardActionModal />
    <TargetingModal />
    </>
  );
};

export default GameBoard;
