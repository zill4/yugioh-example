import React from 'react';
import { Link } from 'react-router-dom';
import { getXRProps } from '../utils/xr';
import CardShop from '../components/CardShop';

const CardshopPage = () => {
  return (
    <div {...getXRProps()} className="min-h-screen">
      {/* Navigation */}
      <nav {...getXRProps()} className="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl">
        <div {...getXRProps()} className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div {...getXRProps()} className="flex justify-between items-center">
            <Link to="/" {...getXRProps()} className="text-2xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-wider">
              YU-GI-OH! VAULT
            </Link>
            <div {...getXRProps()} className="flex gap-4">
              <Link
                to="/deckbuilder"
                {...getXRProps()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-blue-500/30 hover:border-blue-400/50 tracking-wider"
              >
                DECK BUILDER
              </Link>
              <Link
                to="/game"
                {...getXRProps()}
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
