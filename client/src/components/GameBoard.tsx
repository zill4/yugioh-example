import React, { useState } from 'react';
import { getXRProps } from '../utils/xr';
import type { Card } from '../types/Card';

interface GameBoardProps {
  gameMode: string;
  onEndGame: () => void;
}

interface GameState {
  playerLifePoints: number;
  opponentLifePoints: number;
  playerHand: Card[];
  opponentHandSize: number;
  playerField: {
    monsters: (Card | null)[];
    spellTraps: (Card | null)[];
  };
  opponentField: {
    monsters: (Card | null)[];
    spellTraps: (Card | null)[];
  };
  playerDeckSize: number;
  opponentDeckSize: number;
  playerGraveyard: Card[];
  opponentGraveyard: Card[];
  playerBanished: Card[];
  opponentBanished: Card[];
  playerExtraDeckSize: number;
  opponentExtraDeckSize: number;
  fieldSpell: Card | null;
  currentPhase: 'Draw' | 'Main1' | 'Battle' | 'Main2' | 'End';
  currentTurn: 'player' | 'opponent';
}

const GameBoard: React.FC<GameBoardProps> = ({ gameMode, onEndGame }) => {
  const [gameState, setGameState] = useState<GameState>({
    playerLifePoints: 8000,
    opponentLifePoints: 8000,
    playerHand: [],
    opponentHandSize: 5,
    playerField: {
      monsters: Array(5).fill(null),
      spellTraps: Array(5).fill(null),
    },
    opponentField: {
      monsters: Array(5).fill(null),
      spellTraps: Array(5).fill(null),
    },
    playerDeckSize: 40,
    opponentDeckSize: 40,
    playerGraveyard: [],
    opponentGraveyard: [],
    playerBanished: [],
    opponentBanished: [],
    playerExtraDeckSize: 15,
    opponentExtraDeckSize: 15,
    fieldSpell: null,
    currentPhase: 'Draw',
    currentTurn: 'player',
  });

  const CardSlot: React.FC<{
    card: Card | null;
    isMonster?: boolean;
    isOpponent?: boolean;
    onClick?: () => void;
  }> = ({ card, isMonster = false, isOpponent = false, onClick }) => (
    <div
      {...getXRProps()}
      onClick={onClick}
      className={`
        w-12 h-16 rounded border flex items-center justify-center cursor-pointer
        transition-all duration-200 hover:border-purple-400/50
        ${card
          ? `bg-gradient-to-br ${isMonster ? 'from-amber-600 to-amber-800 border-amber-500' : 'from-purple-600 to-purple-800 border-purple-500'}`
          : 'bg-slate-700/50 border-slate-600 border-dashed hover:bg-slate-600/50'
        }
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

  const HandCard: React.FC<{ card: Card; index: number }> = ({ card, index }) => (
    <div
      {...getXRProps()}
      className="w-12 h-16 bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500 rounded flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200 shadow-xl"
    >
      <div {...getXRProps()} className="text-[10px] font-bold text-white text-center p-0.5 leading-tight">
        {card?.name || `Card ${index + 1}`}
      </div>
    </div>
  );

  const DeckArea: React.FC<{ size: number; label: string; isOpponent?: boolean }> = ({ size, label, isOpponent = false }) => (
    <div {...getXRProps()} className="flex flex-col items-center space-y-1">
      <div
        {...getXRProps()}
        className={`w-10 h-14 bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-500 rounded flex items-center justify-center cursor-pointer hover:border-blue-400/50 transition-all duration-200 ${
          isOpponent ? 'rotate-180' : ''
        }`}
      >
        <div {...getXRProps()} className="text-slate-300 text-xs font-bold">
          {size}
        </div>
      </div>
      <div {...getXRProps()} className="text-[10px] text-slate-400 font-medium">
        {label}
      </div>
    </div>
  );

  const GraveyardArea: React.FC<{ cards: Card[]; label: string }> = ({ cards, label }) => (
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

  const BanishedArea: React.FC<{ cards: Card[]; label: string }> = ({ cards, label }) => (
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

  const ExtraDeckArea: React.FC<{ size: number; label: string; isOpponent?: boolean }> = ({ size, label, isOpponent = false }) => (
    <div {...getXRProps()} className="flex flex-col items-center space-y-1">
      <div
        {...getXRProps()}
        className={`w-10 h-14 bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-500 rounded flex items-center justify-center cursor-pointer hover:border-emerald-400/50 transition-all duration-200 ${
          isOpponent ? 'rotate-180' : ''
        }`}
      >
        <div {...getXRProps()} className="text-emerald-300 text-xs font-bold">
          {size}
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
                  lifePoints={gameState.opponentLifePoints}
                  playerName="Opponent"
                  isOpponent={true}
                />
              </div>

              {/* Opponent Zones (Center) */}
              <div {...getXRProps()} className="flex items-center space-x-2">
                <ExtraDeckArea size={gameState.opponentExtraDeckSize} label="EXTRA" isOpponent={true} />
                <DeckArea size={gameState.opponentDeckSize} label="DECK" isOpponent={true} />
                <GraveyardArea cards={gameState.opponentGraveyard} label="GY" />
                <BanishedArea cards={gameState.opponentBanished} label="BANISHED" />
              </div>

              {/* Spacer for right side */}
              <div {...getXRProps()} className="w-16"></div>
            </div>

            {/* Opponent Hand (Face Down) */}
            <div {...getXRProps()} className="flex justify-center space-x-0.5">
              {Array.from({ length: gameState.opponentHandSize }).map((_, i) => (
                <div
                  key={i}
                  {...getXRProps()}
                  className="w-10 h-14 bg-slate-700 border border-slate-600 rounded rotate-180 hover:bg-slate-600/50 transition-all duration-200"
                />
              ))}
            </div>

            {/* Opponent Spell/Trap Zone */}
            <div {...getXRProps()} className="grid grid-cols-5 gap-1 w-full max-w-3xl">
              {gameState.opponentField.spellTraps.map((card, i) => (
                <CardSlot key={`opp-st-${i}`} card={card} isOpponent={true} />
              ))}
            </div>

            {/* Opponent Monster Zone */}
            <div {...getXRProps()} className="grid grid-cols-5 gap-1 w-full max-w-3xl">
              {gameState.opponentField.monsters.map((card, i) => (
                <CardSlot key={`opp-mon-${i}`} card={card} isMonster={true} isOpponent={true} />
              ))}
            </div>
          </div>

          {/* Center Field Spell Zone */}
          <div {...getXRProps()} className="flex justify-center items-center py-2">
            <div {...getXRProps()} className="flex flex-col items-center space-y-1">
              <CardSlot card={gameState.fieldSpell} />
              <div {...getXRProps()} className="text-center text-[10px] text-slate-400 font-medium">
                FIELD SPELL ZONE
              </div>
            </div>
          </div>

          {/* Player's Area (Bottom) */}
          <div {...getXRProps()} className="flex flex-col items-center space-y-2">
            {/* Player Monster Zone */}
            <div {...getXRProps()} className="grid grid-cols-5 gap-1 w-full max-w-3xl">
              {gameState.playerField.monsters.map((card, i) => (
                <CardSlot key={`player-mon-${i}`} card={card} isMonster={true} />
              ))}
            </div>

            {/* Player Spell/Trap Zone */}
            <div {...getXRProps()} className="grid grid-cols-5 gap-1 w-full max-w-3xl">
              {gameState.playerField.spellTraps.map((card, i) => (
                <CardSlot key={`player-st-${i}`} card={card} />
              ))}
            </div>

            {/* Player Hand (Face Up) */}
            <div {...getXRProps()} className="flex justify-center space-x-0.5">
              {gameState.playerHand.map((card, i) => (
                <HandCard key={`hand-${i}`} card={card} index={i} />
              ))}
              {/* Placeholder cards if hand is empty */}
              {gameState.playerHand.length === 0 &&
                Array.from({ length: 5 }).map((_, i) => (
                  <HandCard key={`hand-placeholder-${i}`} card={{ name: `Card ${i + 1}` } as Card} index={i} />
                ))
              }
            </div>

            {/* Player Bottom Row - Extra Deck, Banished, GY, Deck, LP */}
            <div {...getXRProps()} className="flex justify-between items-center w-full">
              {/* Spacer for left side */}
              <div {...getXRProps()} className="w-16"></div>

              {/* Player Zones (Center) */}
              <div {...getXRProps()} className="flex items-center space-x-2">
                <ExtraDeckArea size={gameState.playerExtraDeckSize} label="EXTRA" />
                <BanishedArea cards={gameState.playerBanished} label="BANISHED" />
                <GraveyardArea cards={gameState.playerGraveyard} label="GY" />
                <DeckArea size={gameState.playerDeckSize} label="DECK" />
              </div>

              {/* Player Life Points (Right) */}
              <div {...getXRProps()} className="flex justify-end">
                <LifePointsDisplay
                  lifePoints={gameState.playerLifePoints}
                  playerName="You"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div {...getXRProps()} className="absolute bottom-4 right-4 flex space-x-2">
        <button
          {...getXRProps()}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white rounded-lg text-sm font-bold transition-all duration-300"
        >
          NEXT PHASE
        </button>
        <button
          {...getXRProps()}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg text-sm font-bold transition-all duration-300"
        >
          END TURN
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
