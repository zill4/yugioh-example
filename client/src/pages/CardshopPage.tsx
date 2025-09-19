import React from 'react';
import { Link } from 'react-router-dom';
import CardShop from '../components/CardShop';

const CardshopPage = () => {
  return (
    <div enable-xr className="min-h-screen">
      {/* Navigation */}
      <nav enable-xr className="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl">
        <div enable-xr className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div enable-xr className="flex justify-between items-center">
            <Link to="/" enable-xr className="text-2xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-wider">
              YU-GI-OH! VAULT
            </Link>
            <div enable-xr className="flex gap-4">
              <Link
                to="/deckbuilder"
                enable-xr
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-blue-500/30 hover:border-blue-400/50 tracking-wider"
              >
                DECK BUILDER
              </Link>
              <Link
                to="/game"
                enable-xr
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-red-500/30 hover:border-red-400/50 tracking-wider"
              >
                DUEL NOW
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Card Shop Content */}
      <CardShop />
    </div>
  );
};

export default CardshopPage;
