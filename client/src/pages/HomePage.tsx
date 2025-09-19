import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
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
            <div enable-xr className="flex gap-4">
              <Link
                to="/auth"
                enable-xr
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
              >
                LOGIN
              </Link>
              <Link
                to="/auth"
                enable-xr
                className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-slate-500/30 hover:border-slate-400/50 tracking-wider"
              >
                SIGN UP
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main enable-xr className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Content */}
        <div enable-xr className="text-center py-16 sm:py-20">
          <h1 enable-xr className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight">
            THE ULTIMATE<br />
            YU-GI-OH! EXPERIENCE
          </h1>
          <p enable-xr className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Build legendary decks, battle with friends, and collect the rarest cards in the most immersive Yu-Gi-Oh! platform ever created.
          </p>

          {/* Demo Placeholder */}
          <div enable-xr className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-8 mb-12 ring-1 ring-slate-700/30 max-w-4xl mx-auto">
            <h2 enable-xr className="text-2xl font-bold text-slate-100 mb-6 tracking-wider">
              🎮 PLAYABLE DEMO
            </h2>
            <div enable-xr className="aspect-video bg-slate-700/50 rounded-xl border-2 border-slate-600 flex items-center justify-center">
              <div enable-xr className="text-center">
                <div enable-xr className="text-6xl mb-4">⚡</div>
                <p enable-xr className="text-slate-300 text-lg font-medium">
                  Interactive Demo Coming Soon
                </p>
                <p enable-xr className="text-slate-400 text-sm mt-2">
                  Experience the thrill of dueling right in your browser
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div enable-xr className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/cardshop"
              enable-xr
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-2xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider hover:scale-105 transform"
            >
              🛒 EXPLORE CARD SHOP
            </Link>
            <Link
              to="/game"
              enable-xr
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-2xl border border-red-500/30 hover:border-red-400/50 tracking-wider hover:scale-105 transform"
            >
              ⚔️ START DUELING
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div enable-xr className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div enable-xr className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30 text-center">
            <div enable-xr className="text-4xl mb-4">🏪</div>
            <h3 enable-xr className="text-xl font-bold text-slate-100 mb-3 tracking-wider">
              CARD SHOP
            </h3>
            <p enable-xr className="text-slate-300 leading-relaxed">
              Browse and collect thousands of authentic Yu-Gi-Oh! cards with advanced filtering and search capabilities.
            </p>
          </div>

          <div enable-xr className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30 text-center">
            <div enable-xr className="text-4xl mb-4">🎴</div>
            <h3 enable-xr className="text-xl font-bold text-slate-100 mb-3 tracking-wider">
              DECK BUILDER
            </h3>
            <p enable-xr className="text-slate-300 leading-relaxed">
              Create powerful decks with our intuitive builder, complete with strategy suggestions and meta analysis.
            </p>
          </div>

          <div enable-xr className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30 text-center">
            <div enable-xr className="text-4xl mb-4">⚡</div>
            <h3 enable-xr className="text-xl font-bold text-slate-100 mb-3 tracking-wider">
              BATTLE SYSTEM
            </h3>
            <p enable-xr className="text-slate-300 leading-relaxed">
              Engage in epic duels with advanced AI or challenge players worldwide in real-time battles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer enable-xr className="relative bg-slate-800/90 backdrop-blur-lg border-t border-slate-700/50 shadow-2xl mt-16">
        <div enable-xr className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div enable-xr className="text-center">
            <p enable-xr className="text-slate-400 text-sm">
              © 2024 Yu-Gi-Oh! Vault. Experience the heart of the cards.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
