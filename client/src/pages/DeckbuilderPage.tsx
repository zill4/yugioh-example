import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext';

// Template deck interface for non-authenticated users
interface TemplateDeck {
  id: string;
  name: string;
  type: string;
  cards: number;
  icon?: string;
  character?: string;
}

const deckTemplates: TemplateDeck[] = [
  // Original starter decks
  { id: 'yugi', name: 'Yugi\'s Deck', type: 'Balanced', cards: 40, icon: '🎩', character: 'Yugi Moto' },
  { id: 'kaiba', name: 'Kaiba\'s Deck', type: 'Aggressive', cards: 40, icon: '🐲', character: 'Seto Kaiba' },
  { id: 'joey', name: 'Joey\'s Deck', type: 'Beatdown', cards: 40, icon: '🃏', character: 'Joey Wheeler' },
  { id: 'pegasus', name: 'Pegasus\' Deck', type: 'Control', cards: 40, icon: '🎭', character: 'Maximillion Pegasus' },
  // Custom decks
  { id: 'dragons', name: 'Dragon Lords', type: 'Aggressive', cards: 42, icon: '🐉' },
  { id: 'spellcasters', name: 'Mystic Mages', type: 'Control', cards: 40, icon: '🔮' },
  { id: 'warriors', name: 'Noble Knights', type: 'Balanced', cards: 41, icon: '⚔️' },
  { id: 'machines', name: 'Cyber Army', type: 'Combo', cards: 43, icon: '🤖' }
];

const DeckbuilderPage = () => {
  const { user, isAuthenticated, getUserDecks, saveDeck, deleteDeck } = useAuth();
  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

  // Get user decks or show default templates
  const userDecks = isAuthenticated ? getUserDecks() : [];
  const availableDecks = isAuthenticated ? userDecks : deckTemplates;

  const handleCreateDeck = () => {
    if (!isAuthenticated) return;

    if (!newDeckName.trim()) return;

    const newDeck = {
      id: `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newDeckName.trim(),
      userId: user!.id,
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      tags: [],
    };

    saveDeck(newDeck);
    setNewDeckName('');
    setShowCreateForm(false);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (!isAuthenticated) return;
    deleteDeck(deckId);
    if (selectedDeck === deckId) {
      setSelectedDeck('');
    }
  };

  return (
    <div enable-xr className="min-h-screen relative overflow-hidden">
      {/* Background overlay */}
      <div enable-xr className="absolute inset-0 opacity-40">
        <div enable-xr className="absolute inset-0 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50" />
        <div enable-xr className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div enable-xr className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent" />
      </div>

      {/* Navigation */}
      <nav enable-xr className="relative bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl">
        <div enable-xr className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div enable-xr className="flex justify-between items-center">
            <Link to="/" enable-xr className="text-2xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-wider">
              YU-GI-OH! VAULT
            </Link>
            <div enable-xr className="flex gap-4 items-center">
              {isAuthenticated && user ? (
                <>
                  <span enable-xr className="text-slate-300 text-sm">
                    <span className="text-purple-400 font-bold">{user.profile.displayName}</span>'s Decks
                  </span>
                  <Link
                    to="/cardshop"
                    enable-xr
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
                  >
                    CARD SHOP
                  </Link>
                  <Link
                    to="/game"
                    enable-xr
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-red-500/30 hover:border-red-400/50 tracking-wider"
                  >
                    TEST DECK
                  </Link>
                </>
              ) : (
                <Link
                  to="/auth"
                  enable-xr
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
                >
                  LOGIN TO BUILD
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main enable-xr className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div enable-xr className="text-center mb-12">
          <h1 enable-xr className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent leading-tight">
            DECK FORGE
          </h1>
          <p enable-xr className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isAuthenticated
              ? `Craft the perfect deck with our advanced deck building tools and strategic analysis.`
              : `Login to create and manage your own decks. Preview starter deck templates below.`
            }
          </p>
          {!isAuthenticated && (
            <div enable-xr className="mt-6">
              <Link
                to="/auth"
                enable-xr
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-2xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
              >
                🚀 LOGIN TO START BUILDING
              </Link>
            </div>
          )}
        </div>

        <div enable-xr className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deck List Panel */}
          <div enable-xr className="lg:col-span-1">
            <div enable-xr className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30">
              <h2 enable-xr className="text-2xl font-bold text-slate-100 mb-6 tracking-wider">
                🎴 MY DECKS
              </h2>
              
              <div enable-xr className="space-y-4 mb-6">
                {availableDecks.map((deck) => (
                  <div
                    key={deck.id}
                    enable-xr
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      selectedDeck === deck.id
                        ? 'bg-purple-700/50 border-purple-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div enable-xr className="flex items-center justify-between">
                      <div
                        enable-xr
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedDeck(deck.id)}
                      >
                        <div enable-xr className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{(deck as any).icon || '🎴'}</span>
                          <span className="font-bold text-slate-100 text-sm">{deck.name}</span>
                        </div>
                        <div enable-xr className="text-xs text-slate-400">
                          {(deck as any).character ? `${(deck as any).character} • ` : ''}
                          {(deck as any).type || 'Custom'} • {(deck as any).cards || 0} cards
                        </div>
                      </div>
                      {isAuthenticated && (deck as any).userId && (
                        <button
                          onClick={() => handleDeleteDeck(deck.id)}
                          enable-xr
                          className="text-red-400 hover:text-red-300 text-sm p-1"
                          title="Delete deck"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {showCreateForm ? (
                <div enable-xr className="space-y-3">
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Enter deck name..."
                    enable-xr
                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm"
                  />
                  <div enable-xr className="flex gap-2">
                    <button
                      onClick={handleCreateDeck}
                      enable-xr
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-green-500/30 tracking-wider"
                    >
                      CREATE
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      enable-xr
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-slate-500/30 tracking-wider"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => isAuthenticated ? setShowCreateForm(true) : null}
                  enable-xr
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-xl border tracking-wider ${
                    isAuthenticated
                      ? 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white border-green-500/30 hover:border-green-400/50'
                      : 'bg-slate-700/50 text-slate-400 border-slate-600/50 cursor-not-allowed'
                  }`}
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated ? '+ CREATE NEW DECK' : 'LOGIN TO CREATE DECKS'}
                </button>
              )}
            </div>
          </div>

          {/* Deck Builder Interface */}
          <div enable-xr className="lg:col-span-2">
            <div enable-xr className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30">
              {selectedDeck ? (
                <div>
                  <div enable-xr className="flex items-center justify-between mb-6">
                    <h2 enable-xr className="text-2xl font-bold text-slate-100 tracking-wider">
                      {deckTemplates.find(d => d.id === selectedDeck)?.icon} {deckTemplates.find(d => d.id === selectedDeck)?.name}
                    </h2>
                    <div enable-xr className="flex gap-2">
                      <button
                        enable-xr
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-blue-500/30 tracking-wider"
                      >
                        SAVE
                      </button>
                      <button
                        enable-xr
                        className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-slate-500/30 tracking-wider"
                      >
                        EXPORT
                      </button>
                    </div>
                  </div>

                  {/* Deck Stats */}
                  <div enable-xr className="grid grid-cols-4 gap-4 mb-6">
                    <div enable-xr className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div enable-xr className="text-xl font-bold text-slate-100">40</div>
                      <div enable-xr className="text-xs text-slate-400">MAIN DECK</div>
                    </div>
                    <div enable-xr className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div enable-xr className="text-xl font-bold text-slate-100">15</div>
                      <div enable-xr className="text-xs text-slate-400">EXTRA DECK</div>
                    </div>
                    <div enable-xr className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div enable-xr className="text-xl font-bold text-slate-100">15</div>
                      <div enable-xr className="text-xs text-slate-400">SIDE DECK</div>
                    </div>
                    <div enable-xr className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div enable-xr className="text-xl font-bold text-green-400">92%</div>
                      <div enable-xr className="text-xs text-slate-400">SYNERGY</div>
                    </div>
                  </div>

                  {/* Deck View */}
                  <div enable-xr className="aspect-[4/3] bg-slate-700/50 rounded-xl border-2 border-slate-600 flex items-center justify-center mb-6">
                    <div enable-xr className="text-center">
                      <div enable-xr className="text-6xl mb-4">🔧</div>
                      <p enable-xr className="text-slate-300 text-lg font-medium">
                        Deck Builder Interface
                      </p>
                      <p enable-xr className="text-slate-400 text-sm mt-2">
                        Advanced deck editing tools coming soon
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div enable-xr className="flex flex-wrap gap-4">
                    <button
                      enable-xr
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-purple-500/30 tracking-wider"
                    >
                      AUTO-BUILD
                    </button>
                    <button
                      enable-xr
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-amber-500/30 tracking-wider"
                    >
                      ANALYZE
                    </button>
                    <button
                      enable-xr
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-cyan-500/30 tracking-wider"
                    >
                      SIMULATE
                    </button>
                    <button
                      enable-xr
                      className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-rose-500/30 tracking-wider"
                    >
                      SHARE
                    </button>
                  </div>
                </div>
              ) : (
                <div enable-xr className="text-center py-16">
                  <div enable-xr className="text-8xl mb-6">🎴</div>
                  <h2 enable-xr className="text-3xl font-bold text-slate-100 mb-4 tracking-wider">
                    {isAuthenticated ? 'SELECT A DECK' : 'PREVIEW DECKS'}
                  </h2>
                  <p enable-xr className="text-slate-300 text-lg mb-8">
                    {isAuthenticated
                      ? 'Choose a deck from the sidebar to start building and customizing'
                      : 'Login to create and customize your own decks'
                    }
                  </p>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setSelectedDeck('dragons')}
                      enable-xr
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-xl border border-blue-500/30 hover:border-blue-400/50 tracking-wider"
                    >
                      START BUILDING
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      enable-xr
                      className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
                    >
                      LOGIN TO BUILD
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deck Tips */}
        <div enable-xr className="mt-12 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30">
          <h3 enable-xr className="text-xl font-bold text-slate-100 mb-4 tracking-wider">
            💡 DECK BUILDING TIPS
          </h3>
          <div enable-xr className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-300">
            <div enable-xr className="flex items-start gap-2">
              <span enable-xr className="text-purple-400 mt-1">•</span>
              <span>Keep your main deck between 40-60 cards for consistency</span>
            </div>
            <div enable-xr className="flex items-start gap-2">
              <span enable-xr className="text-purple-400 mt-1">•</span>
              <span>Balance monsters, spells, and traps based on your strategy</span>
            </div>
            <div enable-xr className="flex items-start gap-2">
              <span enable-xr className="text-purple-400 mt-1">•</span>
              <span>Include cards that synergize with your deck's theme</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeckbuilderPage;

