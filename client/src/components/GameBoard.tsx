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
  const [validTargets, setValidTargets] = useState<CardInPlay[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const gameControllerRef = useRef<GameController | null>(null);
  
  // Derive AI turn state from gameState to ensure consistency
  const isAITurn = useMemo(() => {
    return gameState?.currentTurn === 'opponent';
  }, [gameState?.currentTurn]);


  // Memoized game logic functions to prevent stale closures
  const handleCardClick = useCallback((card: CardInPlay, isPlayerCard: boolean) => {
    if (!gameControllerRef.current || !gameState || isAITurn) return;

    if (!isPlayerCard) return;

    // If a card is already selected, this might be a target selection
    if (selectedCard) {
      handleTargetClick(card);
      return;
    }

    switch (gameState.currentPhase) {
      case 'Main1':
      case 'Main2':
      case 'Battle':
        // Select monster for attack if it's on the field
        if (card.position === 'monster' && !card.attackUsed && !card.summonedThisTurn) {
          setSelectedCard(card);
          setTargetingMode('attack');

          // Calculate valid targets for attack
          const targets = gameState.opponent.zones.mainMonsterZones.filter(target => target !== null) as CardInPlay[];
          setValidTargets(targets);

          // If no monsters to attack, can do direct attack
          if (targets.length === 0) {
            setShowConfirmation(true);
            setPendingAction({
              type: 'DIRECT_ATTACK',
              player: 'player',
              cardId: card.id,
            });
          }
        }
        break;
    }
  }, [gameState, isAITurn, selectedCard]);

  const handleTargetClick = useCallback((target: CardInPlay) => {
    if (!selectedCard || !targetingMode) return;

    // Check if this target is valid
    const isValidTarget = validTargets.some(validTarget => validTarget.id === target.id);

    if (!isValidTarget) return;

    // Find the zone index of the target monster
    const targetZoneIndex = gameState?.opponent.zones.mainMonsterZones.findIndex(
      monster => monster?.id === target.id
    );

    // Create the action with target zone index
    const action: GameAction = {
      type: targetingMode === 'attack' ? 'ATTACK' : 'ACTIVATE_EFFECT',
      player: 'player',
      cardId: selectedCard.id,
      targetId: targetZoneIndex !== undefined && targetZoneIndex !== -1 ? targetZoneIndex.toString() : undefined,
    };

    setPendingAction(action);
    setShowConfirmation(true);
    setValidTargets([]);
  }, [selectedCard, targetingMode, validTargets, gameState]);

  const handleConfirmAction = useCallback(() => {
    if (!pendingAction || !gameControllerRef.current) return;

    gameControllerRef.current.executePlayerAction(pendingAction);
    setSelectedCard(null);
    setTargetingMode(null);
    setPendingAction(null);
    setShowConfirmation(false);
    setValidTargets([]);
  }, [pendingAction]);

  const handleCancelAction = useCallback(() => {
    setSelectedCard(null);
    setTargetingMode(null);
    setPendingAction(null);
    setShowConfirmation(false);
    setValidTargets([]);
  }, []);

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
  }> = React.memo(({ card, isOpponent = false, isPlayerZone }) => {
    const isSelected = selectedCard?.id === card?.id;
    const isValidTarget = useMemo(() => {
      if (!card || !validTargets.length) return false;
      return validTargets.some(target => target.id === card.id);
    }, [card, validTargets]);

    const isPlayerCard = isPlayerZone && !isOpponent;
    const canSelectForAttack = useMemo(() =>
      isPlayerCard &&
      card?.position === 'monster' &&
      !card.attackUsed &&
      !card.summonedThisTurn &&
      gameState &&
      ['Main1', 'Main2', 'Battle'].includes(gameState.currentPhase),
      [isPlayerCard, card, gameState]
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
            ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-75 bg-yellow-100' : ''}
            ${isValidTarget ? 'ring-2 ring-blue-400 ring-opacity-75 bg-blue-50' : ''}
            ${canSelectForAttack && !isSelected ? 'hover:ring-2 hover:ring-green-400 hover:bg-green-50' : ''}
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
                  <div className={`w-full h-full border border-gray-800 rounded-md flex flex-col p-1 ${
                    card.faceDown ? 'bg-gradient-to-b from-purple-900 to-purple-800' : 'bg-gradient-to-b from-blue-900 to-blue-800'
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
                        <div className="text-white text-[8px] font-bold text-center mb-1">{card.name}</div>
                        <div className="flex-1 bg-gradient-to-br from-blue-100 to-purple-200 rounded mb-1 flex items-center justify-center relative overflow-hidden">
                          {card.imageUrl ? (
                            <img
                              src={card.imageUrl}
                              alt={card.name}
                              className="w-full h-full object-cover rounded opacity-80"
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
                          <div className="text-[6px] text-white font-bold text-right">
                            ATK/{card.attack} DEF/{card.defense || 0}
                          </div>
                        )}
                        {card.type === 'monster' && (
                          <div className="text-[5px] text-gray-300 text-center mt-1">
                            {getCardStatus(card).join(' • ')}
                          </div>
                        )}
                      </>
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
          className={`w-24 h-36 bg-gradient-to-b from-white to-gray-100 border-2 border-gray-800 rounded-md shadow-lg select-none ${
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

  // Targeting Modal Component (only for target selection, not confirmation)
  const TargetingModal: React.FC = () => {
    if (!targetingMode || !gameState || !selectedCard || showConfirmation) return null;

    const handleTargetSelect = useCallback((target: CardInPlay) => {
      handleTargetClick(target);
    }, [handleTargetClick]);

    return (
      <div className={`fixed inset-0 ${process.env.XR_ENV === 'avp' ? '' : 'bg-black/50'} flex items-center justify-center z-50`}>
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 text-center">
            Select Target for Attack
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {validTargets.map((target, index) => (
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
            onClick={handleCancelAction}
            className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Confirmation Modal Component
  const ConfirmationModal: React.FC = () => {
    if (!showConfirmation || !pendingAction || !selectedCard) return null;

    const getActionDescription = () => {
      switch (pendingAction.type) {
        case 'ATTACK':
          const targetIndex = pendingAction.targetId ? parseInt(pendingAction.targetId) : -1;
          const target = targetIndex !== -1 ? gameState?.opponent.zones.mainMonsterZones[targetIndex] : null;
          return `Attack ${target?.name || 'target'} with ${selectedCard.name}`;
        case 'DIRECT_ATTACK':
          return `Direct attack with ${selectedCard.name}`;
        default:
          return 'Perform action';
      }
    };

    return (
      <div className={`fixed inset-0 ${process.env.XR_ENV === 'avp' ? '' : 'bg-black/50'} flex items-center justify-center z-50`}>
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-bold mb-4 text-center">Confirm Action</h3>

          <div className="text-center mb-6">
            <div className="text-gray-700 mb-2">{getActionDescription()}</div>
            {selectedCard.type === 'monster' && (
              <div className="text-sm text-gray-600">
                ATK: {selectedCard.attack}
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleConfirmAction}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={handleCancelAction}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
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
        onPlayerTurnStart: () => {
          console.log('Player turn started');
          // Player turn has started, UI will automatically enable player actions
          // since isAITurn is derived from gameState.currentTurn
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

        {/* Fixed Position Layout */}
        <div className="game-layout-grid">
          
          {/* Left Sidebar - Game Info */}
          <div enable-xr className="game-info-sidebar">
            <div className="space-y-4">
              <button
                onClick={onEndGame}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-sm font-bold transition-all duration-300"
              >
                END DUEL
              </button>
              
              <div className="text-slate-300 text-sm">
                <div className="text-slate-400 text-xs mb-1">Mode</div>
                <div className="text-purple-400 font-semibold">{gameMode}</div>
              </div>

              <div>
                <div className="text-slate-400 text-xs mb-1">Your LP</div>
                <div className="text-2xl font-bold text-cyan-400">{gameState.player.lifePoints}</div>
              </div>

              <div>
                <div className="text-slate-400 text-xs mb-1">Opponent LP</div>
                <div className="text-2xl font-bold text-red-400">{gameState.opponent.lifePoints}</div>
              </div>

              <div>
                <div className="text-slate-400 text-xs mb-1">Phase</div>
                <div className="text-lg font-bold text-purple-400">{gameState.currentPhase}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {gameState.currentPhase === 'Draw' && 'Draw cards and activate effects'}
                  {gameState.currentPhase === 'Standby' && 'Activate standby effects'}
                  {gameState.currentPhase === 'Main1' && 'Summon, activate cards'}
                  {gameState.currentPhase === 'Battle' && 'Attack with monsters'}
                  {gameState.currentPhase === 'Main2' && 'Additional actions'}
                  {gameState.currentPhase === 'End' && 'End effects, discard'}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-xs mb-1">Turn</div>
                <div className="text-lg font-bold text-blue-400">
                  {gameState.currentTurn === 'player' ? 'Your Turn' : 'Opponent\'s Turn'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Turn {gameState.turnNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Center - Game Board */}
          <div className="game-board-container">
            <div>
              {/* Battle Zones Container - Only zones, not hand */}
              <div className="battle-zones-container">
            
            {/* Zone Rows Wrapper - Just the 4 card zone rows */}
            <div enable-xr className="zone-rows-wrapper">
            
   
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

            
              </div>
              {/* End Zone Rows Wrapper */}
              
              </div>
              {/* End Battle Zones Container */}
            </div>
          </div>
          {/* End Center Game Board */}

          {/* Player Hand - Detached and Fixed */}
          <div enable-xr className="player-hand-container">
            {gameState.player.hand.map((card, index) => (
              <HandCard
                key={`player-hand-${index}`}
                card={card}
                index={index}
                isPlayerHand={true}
              />
            ))}
          </div>

          {/* Game Log - Fixed Position */}
          <div className="game-log-container">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-lg p-2 min-h-[60px]">
              <div className="text-xs text-slate-400 font-medium mb-1">GAME LOG</div>
              <div className="space-y-1 text-xs text-slate-300 max-h-12 overflow-y-auto">
                {gameState?.gameLog?.slice(-2).map((event, i) => (
                  <div key={i} className="text-[9px]">
                    {event.message}
                  </div>
                ))}
                {(!gameState?.gameLog || gameState.gameLog.length === 0) && (
                  <div className="text-[9px] text-slate-500">No game events yet...</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Action Buttons */}
          <div enable-xr className="game-actions-sidebar">
            <div className="space-y-3">
              {gameState.currentPhase === 'Draw' && gameState.currentTurn === 'player' && (
                <button
                  onClick={handleDrawCard}
                  disabled={isAITurn}
                  className={`w-full text-sm font-bold transition-all duration-300 ${
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
                className={`w-full text-sm font-bold transition-all duration-300 ${
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
                className={`w-full text-sm font-bold transition-all duration-300 ${
                  isAITurn
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white'
                }`}
              >
                End Turn
              </button>
            </div>
          </div>
          {/* End Right Sidebar */}

        </div>
        {/* End Fixed Position Layout */}
      </div>

    {/* Modals */}
    <CardActionModal />
    <TargetingModal />
    <ConfirmationModal />
    </>
  );
};

export default GameBoard;
