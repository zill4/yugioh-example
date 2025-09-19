import * as React from 'react';
import { sampleCards } from '../data/sampleCards';
import CardList from './CardList';
import { useState } from 'react';

const CardShop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSet, setSelectedSet] = useState<string>('all');
  
  const filteredCards = sampleCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesRarity = selectedRarity === 'all' || card.rarity === selectedRarity;
    const matchesType = selectedType === 'all' || card.cardType === selectedType;
    const matchesSet = selectedSet === 'all' || card.setCode?.startsWith(selectedSet) || false;

    return matchesSearch && matchesRarity && matchesType && matchesSet;
  });

  const rarities = [...new Set(sampleCards.map(card => card.rarity))];
  const cardTypes = [...new Set(sampleCards.map(card => card.cardType))];
  const sets = [...new Set(sampleCards.map(card => card.setCode?.substring(0, 3) || 'OTHER'))].sort();

  return (
    <div enable-xr className="card-shop-layout min-h-screen relative overflow-hidden">
      {/* Professional dark overlay */}
      <div enable-xr className="absolute inset-0 opacity-40">
        <div enable-xr className="absolute inset-0 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50" />
        <div enable-xr className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div enable-xr className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent" />
      </div>

      {/* Header */}
      <header enable-xr className="navbar relative bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl">
        <div enable-xr className="max-w-7xl mx-auto px-6 lg:px-8 py-6 sm:py-8">
          <h1 enable-xr className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-wider">
            CARD VAULT
          </h1>
          <p enable-xr className="text-center text-slate-300 text-base mt-3 font-medium tracking-wide">
            PREMIUM CARD COLLECTION
          </p>
        </div>
      </header>

      {/* Filters */}
      <div enable-xr className="search-container relative max-w-7xl mx-auto px-6 py-8 lg:px-8">
        <div enable-xr className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 sm:p-8 mb-8 ring-1 ring-slate-700/30">
          <div enable-xr className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div enable-xr>
              <label enable-xr htmlFor="search" className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">
                Search Collection
              </label>
              <input
                enable-xr
                id="search"
                type="text"
                placeholder="Enter card name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm"
              />
            </div>

            {/* Rarity Filter */}
            <div enable-xr>
              <label enable-xr htmlFor="rarity" className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">
                Rarity Filter
              </label>
              <select
                enable-xr
                id="rarity"
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all appearance-none cursor-pointer backdrop-blur-sm"
              >
                <option value="all" className="bg-slate-700">All Rarities</option>
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity} className="bg-slate-700">{rarity}</option>
                ))}
              </select>
            </div>

            {/* Card Type Filter */}
            <div enable-xr>
              <label enable-xr htmlFor="cardType" className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">
                Card Type
              </label>
              <select
                enable-xr
                id="cardType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all appearance-none cursor-pointer backdrop-blur-sm"
              >
                <option value="all" className="bg-slate-700">All Types</option>
                {cardTypes.map(type => (
                  <option key={type} value={type} className="bg-slate-700">{type}</option>
                ))}
              </select>
            </div>

            {/* Set Filter */}
            <div enable-xr>
              <label enable-xr htmlFor="set" className="block text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">
                Set
              </label>
              <select
                enable-xr
                id="set"
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all appearance-none cursor-pointer backdrop-blur-sm"
              >
                <option value="all" className="bg-slate-700">All Sets</option>
                {sets.map(set => (
                  <option key={set} value={set} className="bg-slate-700">
                    {set === 'SDP' ? 'STARTER DECK PEGASUS' :
                     set === 'LOB' ? 'LEGEND OF BLUE EYES' :
                     set === 'MRL' ? 'MAGIC RULER' :
                     set === 'SDK' ? 'STARTER DECK KAIBA' :
                     set === 'SDY' ? 'STARTER DECK YUGI' :
                     set === 'SDJ' ? 'STARTER DECK JOEY' :
                     set}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div enable-xr className="text-center mb-6">
          <p enable-xr className="text-slate-300 text-sm font-medium tracking-wider uppercase">
            {filteredCards.length} of {sampleCards.length} CARDS IN COLLECTION
          </p>
        </div>

        {/* Card Grid */}
        <div enable-xr className="card-grid-container">
          <CardList cards={filteredCards} />
        </div>
      </div>
    </div>
  );
};

export default CardShop;
