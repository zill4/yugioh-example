import React, { useState, useEffect, useRef } from 'react';
import { getXRProps } from '../utils/xr';
import { GameController } from '../game/GameController';
import type { GameState, GameCard, CardInPlay } from '../game/types/GameTypes';

interface GameBoardProps {
  gameMode: string;
  onEndGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameMode, onEndGame }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isAITurn, setIsAITurn] = useState(false);
  const gameControllerRef = useRef<GameController | null>(null);

  useEffect(() => {
    // Initialize game controller
    const gameController = new GameController();
    gameControllerRef.current = gameController;

    // Set up callbacks
    gameController.initialize({
      onGameStateChange: (newGameState) => {
        setGameState(newGameState);
      },
      onGameEnd: (winner) => {
        alert(`Game Over! ${winner === 'player' ? 'You Win!' : 'AI Wins!'}`);
        onEndGame();
      },
      onAITurnStart: () => {
        setIsAITurn(true);
      },
      onAITurnEnd: () => {
        setIsAITurn(false);
      }
    });

    // Get initial game state
    setGameState(gameController.getGameState());

    // Cleanup
    return () => {
      gameControllerRef.current = null;
    };
  }, [onEndGame]);

  // Handle card click
  const handleCardClick = (card: CardInPlay, isPlayerCard: boolean) => {
    if (!gameControllerRef.current || !gameState || isAITurn) return;

    // Only allow player to interact with their own cards
    if (!isPlayerCard) return;

    // Handle different card interactions based on game phase
    switch (gameState.currentPhase) {
      case 'Main1':
      case 'Main2':
        // Try to play card if it's in hand
        if (card.position === 'hand') {
          gameControllerRef.current.playCard(card.id);
        }
        break;
      case 'Battle':
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
  };

  // Handle zone click (for empty zones)
  const handleZoneClick = (zoneIndex: number, zoneType: 'monster' | 'spellTrap', isPlayerZone: boolean) => {
    if (!gameControllerRef.current || !gameState || isAITurn) return;

    if (!isPlayerZone) return;

    switch (gameState.currentPhase) {
      case 'Main1':
      case 'Main2':
        // Try to play a card from hand to this zone
        const playerHand = gameState.player.hand;
        if (playerHand.length > 0) {
          // Play the first card from hand (simple logic)
          gameControllerRef.current.playCard(playerHand[0].id, zoneIndex);
        }
        break;
    }
  };

  // Handle phase change
  const handleNextPhase = () => {
    if (!gameControllerRef.current || isAITurn) return;
    gameControllerRef.current.changePhase();
  };

  // Handle end turn
  const handleEndTurn = () => {
    if (!gameControllerRef.current || isAITurn) return;
    gameControllerRef.current.endTurn();
  };

  if (!gameState) {
    return (
      <div {...getXRProps()} className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  const CardSlot: React.FC<{
    card: CardInPlay | null;
    isMonster?: boolean;
    isOpponent?: boolean;
    zoneIndex: number;
    zoneType: 'monster' | 'spellTrap';
    isPlayerZone: boolean;
  }> = ({ card, isMonster = false, isOpponent = false, zoneIndex, zoneType, isPlayerZone }) => (
    <div
      {...getXRProps()}
      onClick={card ? () => handleCardClick(card, isPlayerZone) : () => handleZoneClick(zoneIndex, zoneType, isPlayerZone)}
      className={`
        w-12 h-16 rounded border flex items-center justify-center cursor-pointer
        transition-all duration-200 hover:border-purple-400/50
        ${card
          ? `bg-gradient-to-br ${isMonster ? 'from-amber-600 to-amber-800 border-amber-500' : 'from-purple-600 to-purple-800 border-purple-500'}`
          : 'bg-slate-700/50 border-slate-600 border-dashed hover:bg-slate-600/50'
        }
        ${isAITurn && isPlayerZone ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {card ? (
        <div {...getXRProps()} className="text-[10px] font-bold text-white text-center p-0.5 leading-tight">
          {isOpponent ? '🎴' : card.name}
        </div>
      ) : (
        <div {...getXRProps()} className="text-slate-400 text-sm">
          {isMonster ? '👹' : '✨'}
        </div>
      )}
    </div>
  );

  const HandCard: React.FC<{ card: GameCard; index: number; isPlayerHand: boolean }> = ({ card, index, isPlayerHand }) => (
    <div
      {...getXRProps()}
      onClick={() => isPlayerHand && !isAITurn && handleCardClick({ ...card, position: 'hand' } as CardInPlay, true)}
      className={`w-12 h-16 bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500 rounded flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200 shadow-xl ${
        isAITurn && isPlayerHand ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div {...getXRProps()} className="text-[10px] font-bold text-white text-center p-0.5 leading-tight">
        {card?.name || `Card ${index + 1}`}
      </div>
    </div>
  );

  const DeckArea: React.FC<{ cards: GameCard[]; label: string; isOpponent?: boolean }> = ({ cards, label, isOpponent = false }) => (
    <div {...getXRProps()} className="flex flex-col items-center space-y-1">
      <div
        {...getXRProps()}
        className={`w-10 h-14 bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-500 rounded flex items-center justify-center cursor-pointer hover:border-blue-400/50 transition-all duration-200 ${
          isOpponent ? 'rotate-180' : ''
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

  const GraveyardArea: React.FC<{ cards: GameCard[]; label: string }> = ({ cards, label }) => (
    <div {...getXRProps()} className="flex flex-col items-center space-y-1">
      <div
        {...getXRProps()}
        className="w-10 h-14 bg-gradient-to-br from-purple-700 to-purple-900 border border-purple-500 rounded flex items-center justify-center cursor-pointer hover:border-purple-400/50 transition-all duration-200"
      >
        <div {...getXRProps()} className="text-purple-300 text-xs font-bold">
          {cards.length}
        </div>
      </div>
      <div {...getXRProps()} className="text-[10px] text-slate-400 font-medium">
        {label}
      </div>
    </div>
  );

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

  const ExtraDeckArea: React.FC<{ cards: GameCard[]; label: string; isOpponent?: boolean }> = ({ cards, label, isOpponent = false }) => (
    <div {...getXRProps()} className="flex flex-col items-center space-y-1">
      <div
        {...getXRProps()}
        className={`w-10 h-14 bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-500 rounded flex items-center justify-center cursor-pointer hover:border-emerald-400/50 transition-all duration-200 ${
          isOpponent ? 'rotate-180' : ''
        }`}
      >
        <div {...getXRProps()} className="text-emerald-300 text-xs font-bold">
          {cards.length}
        </div>
      </div>
      <div {...getXRProps()} className="text-[10px] text-slate-400 font-medium">
        {label}
      </div>
    </div>
  );

  const LifePointsDisplay: React.FC<{ lifePoints: number; playerName: string; isOpponent?: boolean }> = ({
    lifePoints,
    playerName,
    isOpponent = false
  }) => (
    <div {...getXRProps()} className={`flex ${isOpponent ? 'flex-col' : 'flex-col-reverse'} items-center space-y-1`}>
      <div {...getXRProps()} className="text-lg font-bold text-white">
        {lifePoints}
      </div>
      <div {...getXRProps()} className="text-xs text-slate-300 font-medium">
        {playerName}
      </div>
      <div {...getXRProps()} className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 border border-red-500 flex items-center justify-center">
        <div {...getXRProps()} className="text-sm">❤️</div>
      </div>
    </div>
  );

  return (
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
              {/* Opponent Life Points (Left) */}
              <div {...getXRProps()} className="flex justify-start">
                <LifePointsDisplay
                  lifePoints={gameState.opponent.lifePoints}
                  playerName="Opponent"
                  isOpponent={true}
                />
              </div>

              {/* Opponent Zones (Center) */}
              <div {...getXRProps()} className="flex items-center space-x-2">
                <ExtraDeckArea cards={gameState.opponent.extraDeck} label="EXTRA" isOpponent={true} />
                <DeckArea cards={gameState.opponent.mainDeck} label="DECK" isOpponent={true} />
                <GraveyardArea cards={gameState.opponent.graveyard} label="GY" />
                <BanishedArea cards={gameState.opponent.banished} label="BANISHED" />
              </div>

              {/* Spacer for right side */}
              <div {...getXRProps()} className="w-16"></div>
            </div>

            {/* Opponent Hand (Face Down) */}
            <div {...getXRProps()} className="flex justify-center space-x-0.5">
              {Array.from({ length: gameState.opponent.hand.length }).map((_, i) => (
                <div
                  key={i}
                  {...getXRProps()}
                  className="w-10 h-14 bg-slate-700 border border-slate-600 rounded rotate-180 hover:bg-slate-600/50 transition-all duration-200"
                />
              ))}
            </div>

            {/* Opponent Spell/Trap Zone */}
            <div {...getXRProps()} className="grid grid-cols-5 gap-1 w-full max-w-3xl">
              {gameState.opponent.spellTrapZones.map((card, i) => (
                <CardSlot
                  key={`opp-st-${i}`}
                  card={card}
                  isOpponent={true}
                  zoneIndex={i}
                  zoneType="spellTrap"
                  isPlayerZone={false}
                />
              ))}
            </div>

            {/* Opponent Monster Zone */}
            <div {...getXRProps()} className="grid grid-cols-5 gap-1 w-full max-w-3xl">
              {gameState.opponent.monsterZones.map((card, i) => (
                <CardSlot
                  key={`opp-mon-${i}`}
                  card={card}
                  isMonster={true}
                  isOpponent={true}
                  zoneIndex={i}
                  zoneType="monster"
                  isPlayerZone={false}
                />
              ))}
            </div>
          </div>

          {/* Center Field Spell Zone */}
          <div {...getXRProps()} className="flex justify-center items-center py-2">
            <div {...getXRProps()} className="flex flex-col items-center space-y-1">
              <CardSlot
                card={gameState.fieldSpell ? { ...gameState.fieldSpell, position: 'monster' } as CardInPlay : null}
                zoneIndex={0}
                zoneType="monster"
                isPlayerZone={true}
              />
              <div {...getXRProps()} className="text-center text-[10px] text-slate-400 font-medium">
                FIELD SPELL ZONE
              </div>
            </div>
          </div>

          {/* Player's Area (Bottom) */}
          <div {...getXRProps()} className="flex flex-col items-center space-y-2">
            {/* Player Monster Zone */}
            <div {...getXRProps()} className="grid grid-cols-5 gap-1 w-full max-w-3xl">
              {gameState.player.monsterZones.map((card, i) => (
                <CardSlot
                  key={`player-mon-${i}`}
                  card={card}
                  isMonster={true}
                  zoneIndex={i}
                  zoneType="monster"
                  isPlayerZone={true}
                />
              ))}
            </div>

            {/* Player Spell/Trap Zone */}
            <div {...getXRProps()} className="grid grid-cols-5 gap-1 w-full max-w-3xl">
              {gameState.player.spellTrapZones.map((card, i) => (
                <CardSlot
                  key={`player-st-${i}`}
                  card={card}
                  zoneIndex={i}
                  zoneType="spellTrap"
                  isPlayerZone={true}
                />
              ))}
            </div>

            {/* Player Hand (Face Up) */}
            <div {...getXRProps()} className="flex justify-center space-x-0.5">
              {gameState.player.hand.map((card, i) => (
                <HandCard key={`hand-${i}`} card={card} index={i} isPlayerHand={true} />
              ))}
              {/* Placeholder cards if hand is empty */}
              {gameState.player.hand.length === 0 &&
                Array.from({ length: 5 }).map((_, i) => (
                  <HandCard key={`hand-placeholder-${i}`} card={{ name: `Card ${i + 1}` } as GameCard} index={i} isPlayerHand={true} />
                ))
              }
            </div>

            {/* Player Bottom Row - Extra Deck, Banished, GY, Deck, LP */}
            <div {...getXRProps()} className="flex justify-between items-center w-full">
              {/* Spacer for left side */}
              <div {...getXRProps()} className="w-16"></div>

              {/* Player Zones (Center) */}
              <div {...getXRProps()} className="flex items-center space-x-2">
                <ExtraDeckArea cards={gameState.player.extraDeck} label="EXTRA" />
                <BanishedArea cards={gameState.player.banished} label="BANISHED" />
                <GraveyardArea cards={gameState.player.graveyard} label="GY" />
                <DeckArea cards={gameState.player.mainDeck} label="DECK" />
              </div>

              {/* Player Life Points (Right) */}
              <div {...getXRProps()} className="flex justify-end">
                <LifePointsDisplay
                  lifePoints={gameState.player.lifePoints}
                  playerName="You"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Turn Indicator */}
      {isAITurn && (
        <div {...getXRProps()} className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-4 py-2 rounded-lg font-bold text-sm">
          🤖 AI IS THINKING...
        </div>
      )}

      {/* Action Buttons */}
      <div {...getXRProps()} className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={handleNextPhase}
          {...getXRProps()}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white rounded-lg text-sm font-bold transition-all duration-300"
        >
          NEXT PHASE
        </button>
        <button
          onClick={handleEndTurn}
          {...getXRProps()}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg text-sm font-bold transition-all duration-300"
        >
          END TURN
        </button>
      </div>

      {/* Game Log */}
      <div {...getXRProps()} className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 p-3 rounded-lg max-w-md max-h-32 overflow-y-auto">
        <div {...getXRProps()} className="text-xs text-slate-400 font-medium mb-1">GAME LOG</div>
        <div {...getXRProps()} className="space-y-1 text-xs text-slate-300">
          {gameState.gameLog.slice(-3).map((event, i) => (
            <div key={i} {...getXRProps()} className="text-[10px]">
              {event.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
