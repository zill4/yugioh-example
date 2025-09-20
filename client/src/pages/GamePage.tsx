import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getXRProps } from '../utils/xr';
import GameBoard from '../components/GameBoard';

const GamePage = () => {
  const [selectedGameMode, setSelectedGameMode] = useState<string>('');
  const [isGameActive, setIsGameActive] = useState<boolean>(false);

  const handleStartDuel = () => {
    if (selectedGameMode) {
      setIsGameActive(true);
    }
  };

  const handleEndDuel = () => {
    setIsGameActive(false);
    setSelectedGameMode('');
  };

  const gameModes = [
    {
      id: 'ai-duel',
      title: 'AI DUEL',
      description: 'Battle against advanced AI opponents with various difficulty levels',
      icon: '🤖',
      color: 'from-blue-600 to-blue-800 border-blue-500'
    },
    {
      id: 'online-pvp',
      title: 'ONLINE PVP',
      description: 'Challenge players worldwide in real-time competitive matches',
      icon: '🌐',
      color: 'from-red-600 to-red-800 border-red-500'
    },
    {
      id: 'tournament',
      title: 'TOURNAMENT',
      description: 'Join official tournaments and climb the rankings',
      icon: '🏆',
      color: 'from-amber-600 to-amber-800 border-amber-500'
    },
    {
      id: 'practice',
      title: 'PRACTICE MODE',
      description: 'Perfect your strategies in a no-pressure environment',
      icon: '🎯',
      color: 'from-green-600 to-green-800 border-green-500'
    }
  ];

  // If game is active, render the GameBoard
  if (isGameActive && selectedGameMode) {
    return (
      <GameBoard 
        gameMode={gameModes.find(mode => mode.id === selectedGameMode)?.title || selectedGameMode}
        onEndGame={handleEndDuel}
      />
    );
  }

  return (
    <div {...getXRProps()} className="min-h-screen relative overflow-hidden">
      {/* Background overlay */}
      <div {...getXRProps()} className="absolute inset-0 opacity-40">
        <div {...getXRProps()} className="absolute inset-0 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50" />
        <div {...getXRProps()} className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div {...getXRProps()} className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent" />
      </div>

      {/* Navigation */}
      <nav {...getXRProps()} className="relative bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl">
        <div {...getXRProps()} className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div {...getXRProps()} className="flex justify-between items-center">
            <Link to="/" {...getXRProps()} className="text-2xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-wider">
              YU-GI-OH! VAULT
            </Link>
            <div {...getXRProps()} className="flex gap-4">
              <Link
                to="/cardshop"
                {...getXRProps()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
              >
                CARD SHOP
              </Link>
              <Link
                to="/deckbuilder"
                {...getXRProps()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-blue-500/30 hover:border-blue-400/50 tracking-wider"
              >
                DECK BUILDER
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main {...getXRProps()} className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div {...getXRProps()} className="text-center mb-12">
          <h1 {...getXRProps()} className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight">
            IT'S TIME TO DUEL!
          </h1>
          <p {...getXRProps()} className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Choose your battle mode and prepare for legendary duels that will test your strategic mastery.
          </p>
        </div>

        {/* Game Modes Grid */}
        <div {...getXRProps()} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {gameModes.map((mode) => (
            <div
              key={mode.id}
              onClick={() => setSelectedGameMode(mode.id)}
              {...getXRProps()}
              className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                selectedGameMode === mode.id ? 'ring-4 ring-purple-500/50' : ''
              }`}
            >
              <div {...getXRProps()} className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-8 ring-1 ring-slate-700/30 hover:ring-purple-500/30 transition-all duration-300">
                <div {...getXRProps()} className="text-center">
                  <div {...getXRProps()} className="text-6xl mb-4">{mode.icon}</div>
                  <h3 {...getXRProps()} className="text-2xl font-bold text-slate-100 mb-4 tracking-wider">
                    {mode.title}
                  </h3>
                  <p {...getXRProps()} className="text-slate-300 leading-relaxed mb-6">
                    {mode.description}
                  </p>
                  <button
                    {...getXRProps()}
                    className={`px-6 py-3 bg-gradient-to-r ${mode.color} hover:opacity-90 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-xl border border-opacity-30 hover:border-opacity-50 tracking-wider`}
                  >
                    SELECT MODE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Area Placeholder */}
        <div {...getXRProps()} className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-8 ring-1 ring-slate-700/30">
          <h2 {...getXRProps()} className="text-3xl font-bold text-slate-100 mb-6 text-center tracking-wider">
            🎮 DUEL ARENA
          </h2>
          
          {selectedGameMode ? (
            <div {...getXRProps()} className="text-center">
              <div {...getXRProps()} className="aspect-[16/9] bg-slate-700/50 rounded-xl border-2 border-slate-600 flex items-center justify-center mb-6">
                <div {...getXRProps()} className="text-center">
                  <div {...getXRProps()} className="text-8xl mb-4">⚔️</div>
                  <p {...getXRProps()} className="text-slate-300 text-xl font-medium">
                    {gameModes.find(m => m.id === selectedGameMode)?.title} Arena
                  </p>
                  <p {...getXRProps()} className="text-slate-400 text-sm mt-2">
                    Game engine loading...
                  </p>
                </div>
              </div>
              
              <div {...getXRProps()} className="flex justify-center gap-4">
                <button
                  onClick={handleStartDuel}
                  {...getXRProps()}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-xl border border-green-500/30 hover:border-green-400/50 tracking-wider"
                >
                  START DUEL
                </button>
                <button
                  onClick={() => setSelectedGameMode('')}
                  {...getXRProps()}
                  className="px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-xl border border-slate-500/30 hover:border-slate-400/50 tracking-wider"
                >
                  BACK
                </button>
              </div>
            </div>
          ) : (
            <div {...getXRProps()} className="aspect-[16/9] bg-slate-700/50 rounded-xl border-2 border-slate-600 flex items-center justify-center">
              <div {...getXRProps()} className="text-center">
                <div {...getXRProps()} className="text-8xl mb-4">🎴</div>
                <p {...getXRProps()} className="text-slate-300 text-xl font-medium">
                  Select a Game Mode
                </p>
                <p {...getXRProps()} className="text-slate-400 text-sm mt-2">
                  Choose your preferred battle style above
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div {...getXRProps()} className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div {...getXRProps()} className="bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-600/50 shadow-xl p-4 text-center">
            <div {...getXRProps()} className="text-2xl font-bold text-green-400 mb-1">127</div>
            <div {...getXRProps()} className="text-xs text-slate-300 uppercase tracking-wider">Wins</div>
          </div>
          <div {...getXRProps()} className="bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-600/50 shadow-xl p-4 text-center">
            <div {...getXRProps()} className="text-2xl font-bold text-red-400 mb-1">43</div>
            <div {...getXRProps()} className="text-xs text-slate-300 uppercase tracking-wider">Losses</div>
          </div>
          <div {...getXRProps()} className="bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-600/50 shadow-xl p-4 text-center">
            <div {...getXRProps()} className="text-2xl font-bold text-purple-400 mb-1">2,450</div>
            <div {...getXRProps()} className="text-xs text-slate-300 uppercase tracking-wider">Rating</div>
          </div>
          <div {...getXRProps()} className="bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-600/50 shadow-xl p-4 text-center">
            <div {...getXRProps()} className="text-2xl font-bold text-amber-400 mb-1">Gold</div>
            <div {...getXRProps()} className="text-xs text-slate-300 uppercase tracking-wider">Rank</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamePage;
