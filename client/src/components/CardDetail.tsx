import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sampleCards } from '../data/sampleCards';
import type { MonsterCard, SpellCard, TrapCard } from '../types/Card';

const CardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const card = sampleCards.find(c => c.id === id);
  
  if (!card) {
    return (
      <div enable-xr className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 text-slate-500">◈</div>
          <h2 className="text-xl font-bold text-slate-200 mb-2 tracking-wider">CARD NOT FOUND</h2>
          <p className="text-slate-400 mb-6">The card you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md font-medium transition-all duration-200 border border-slate-600"
          >
            BACK TO VAULT
          </button>
        </div>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'from-slate-600 to-slate-700 border-slate-500';
      case 'Rare': return 'from-cyan-600 to-blue-700 border-cyan-500';
      case 'Super Rare': return 'from-purple-600 to-purple-800 border-purple-500';
      case 'Ultra Rare': return 'from-amber-600 to-yellow-700 border-amber-500';
      case 'Secret Rare': return 'from-rose-600 to-red-700 border-rose-500';
      case 'Ghost Rare': return 'from-indigo-700 to-slate-800 border-indigo-500';
      default: return 'from-slate-600 to-slate-700 border-slate-500';
    }
  };

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType) {
      case 'Monster': return '⚔';
      case 'Spell': return '✦';
      case 'Trap': return '▣';
      default: return '◈';
    }
  };

  const getAttributeIcon = (attribute?: string) => {
    switch (attribute) {
      case 'DARK': return '◐';
      case 'LIGHT': return '◑';
      case 'WATER': return '◎';
      case 'FIRE': return '▴';
      case 'EARTH': return '▢';
      case 'WIND': return '△';
      case 'DIVINE': return '✦';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Professional dark overlay */}
      <div enable-xr className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent" />
      </div>
      
      {/* Header */}
      <header enable-xr className="relative bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-300 hover:text-slate-100 transition-colors font-medium text-sm uppercase tracking-wider"
          >
            <span className="text-base">←</span>
            <span>Back to Vault</span>
          </button>
        </div>
      </header>

      <div enable-xr className="relative max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Card Image - Fixed size container */}
          <div enable-xr className="lg:w-[500px] flex-shrink-0">
            <div className="sticky top-8">
              <div className="relative aspect-[686/1000] max-w-[500px] mx-auto bg-slate-800/90 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl shadow-slate-900/30 border border-slate-600/50">
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full h-auto object-contain p-6"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/600x900/374151/6b7280?text=PREMIUM+CARD';
                  }}
                />
                
                {/* Stock Status Overlay */}
                {!card.inStock && (
                  <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center border-2 border-red-600/50">
                    <div className="bg-red-600/90 text-red-100 px-6 py-3 rounded-lg font-bold text-sm shadow-xl border border-red-500/30">
                      UNAVAILABLE
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Details - Right column */}
          <div enable-xr className="flex-1 space-y-6">
            {/* Title and Key Info */}
            <div enable-xr className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="text-base">{getCardTypeIcon(card.cardType || '')}</span>
                <span className="font-medium">{card.cardType}</span>
                <span className="text-slate-500">•</span>
                <span className="font-medium">{card.setCode}</span>
                <span className="text-slate-500">•</span>
                <span className="font-medium">#{card.cardNumber}</span>
              </div>

              <h1 enable-xr className="text-2xl lg:text-3xl font-bold text-slate-100 leading-tight">
                {card.name}
              </h1>

              <div className="flex items-center gap-4">
                <div enable-xr className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-gradient-to-r ${getRarityColor(card.rarity || '')} text-white shadow-lg border`}>
                  {card.rarity}
                </div>
                <div enable-xr className={`text-sm font-semibold ${card.inStock ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.inStock ? '✓ AVAILABLE' : '✗ UNAVAILABLE'}
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div enable-xr className="bg-slate-800/80 backdrop-blur-xl rounded-lg p-4 border border-slate-600/50 shadow-xl">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-emerald-400">
                  ${card.price}
                </span>
                <span className="text-sm text-slate-400">USD</span>
              </div>
              <p enable-xr className="text-xs text-emerald-400 mt-2 font-medium">✓ FREE shipping on orders over $35</p>
            </div>

            {/* Card Specifications */}
            <div enable-xr className="bg-slate-800/60 backdrop-blur-xl rounded-lg p-4 border border-slate-600/50 shadow-xl space-y-3">
              <h3 className="text-lg font-bold text-slate-200 tracking-wider">CARD DETAILS</h3>
              <dl className="space-y-2">
                <div enable-xr className="flex justify-between py-2 border-b border-slate-700/50">
                  <dt className="text-slate-400 font-medium text-sm">Card Type</dt>
                  <dd className="font-semibold text-slate-200">{card.cardType}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700/50">
                  <dt className="text-slate-400 font-medium text-sm">Set Code</dt>
                  <dd className="font-semibold text-slate-200">{card.setCode}</dd>
                </div>

                {/* Monster-specific stats */}
                {card.cardType === 'Monster' && (
                  <>
                    <div enable-xr className="flex justify-between py-2 border-b border-slate-700/50">
                      <dt className="text-slate-400 font-medium text-sm">Monster Type</dt>
                      <dd className="font-semibold text-slate-200">{(card as MonsterCard).monsterType}</dd>
                    </div>
                    <div enable-xr className="flex justify-between py-2 border-b border-slate-700/50">
                      <dt className="text-slate-400 font-medium text-sm">Attribute</dt>
                      <dd className="font-semibold text-slate-200 flex items-center gap-1">
                        <span>{getAttributeIcon((card as MonsterCard).attribute)}</span>
                        {(card as MonsterCard).attribute}
                      </dd>
                    </div>
                    <div enable-xr className="flex justify-between py-2 border-b border-slate-700/50">
                      <dt className="text-slate-400 font-medium text-sm">Level</dt>
                      <dd className="font-semibold text-slate-200">
                        {'★'.repeat((card as MonsterCard).level || 0)}
                      </dd>
                    </div>
                    <div enable-xr className="flex justify-between py-2 border-b border-slate-700/50">
                      <dt className="text-slate-400 font-medium text-sm">ATK / DEF</dt>
                      <dd className="font-semibold text-slate-200">
                        <span className="text-red-400">{(card as MonsterCard).attack}</span>
                        <span className="mx-2 text-slate-500">/</span>
                        <span className="text-cyan-400">{(card as MonsterCard).defense}</span>
                      </dd>
                    </div>
                  </>
                )}

                {/* Spell-specific info */}
                {card.cardType === 'Spell' && (
                  <div enable-xr className="flex justify-between py-2 border-b border-slate-700/50">
                    <dt className="text-slate-400 font-medium text-sm">Spell Type</dt>
                    <dd className="font-semibold text-slate-200">{(card as SpellCard).spellType}</dd>
                  </div>
                )}

                {/* Trap-specific info */}
                {card.cardType === 'Trap' && (
                  <div enable-xr className="flex justify-between py-2 border-b border-slate-700/50">
                    <dt className="text-slate-400 font-medium text-sm">Trap Type</dt>
                    <dd className="font-semibold text-slate-200">{(card as TrapCard).trapType}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Description */}
            <div enable-xr className="bg-slate-800/60 backdrop-blur-xl rounded-lg p-4 border border-slate-600/50 shadow-xl space-y-2">
              <h3 className="text-lg font-bold text-slate-200 tracking-wider">CARD EFFECT</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{card.description}</p>
            </div>

            {/* Purchase Box */}
            <div enable-xr className="bg-slate-800/80 backdrop-blur-xl rounded-lg p-5 border border-slate-600/50 shadow-xl space-y-4">
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-emerald-400">${card.price}</span>
                  <span className="text-sm text-slate-400">USD</span>
                </div>

                <div className="space-y-1">
                  <p enable-xr className="text-emerald-400 font-medium flex items-center gap-2 text-sm">
                    <span>✓</span> FREE delivery Tomorrow
                  </p>
                  <p className="text-slate-400 text-xs">Order within 2 hrs 30 mins</p>
                </div>

                <div enable-xr className={`text-sm font-bold ${card.inStock ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.inStock ? '✓ AVAILABLE' : '✗ UNAVAILABLE'}
                </div>
              </div>
              
              <div enable-xr className="space-y-3">
                <div className="flex items-center gap-3">
                  <label htmlFor="quantity" className="text-sm font-medium text-slate-300">Quantity:</label>
                  <select
                    id="quantity"
                    className="border border-slate-600 rounded-md px-3 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-slate-700/50 text-slate-200"
                    disabled={!card.inStock}
                  >
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n} className="bg-slate-700">{n}</option>
                    ))}
                  </select>
                </div>

                <button
                  disabled={!card.inStock}
                  enable-xr     className={`w-full py-2 px-4 rounded-md font-semibold text-sm transition-all duration-200 ${
                    card.inStock
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 hover:border-slate-500'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {card.inStock ? 'ADD TO CART' : 'UNAVAILABLE'}
                </button>

                <button
                  disabled={!card.inStock}
                  enable-xr className={`w-full py-2 px-4 rounded-md font-semibold text-sm transition-all duration-200 ${
                    card.inStock
                      ? 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-600'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {card.inStock ? 'BUY NOW' : 'UNAVAILABLE'}
                </button>
              </div>
              
              <div enable-xr className="pt-4 border-t border-slate-700/50">
                <div className="space-y-2">
                  <div enable-xr className="flex items-center gap-3 text-slate-400">
                    <span className="text-sm">🔒</span>
                    <span className="text-xs font-medium">Secure transaction</span>
                  </div>
                  <div enable-xr className="flex items-center gap-3 text-slate-400">
                    <span className="text-sm">🚚</span>
                    <span className="text-xs font-medium">Ships from YuGiOh Store</span>
                  </div>
                  <div enable-xr className="flex items-center gap-3 text-slate-400">
                    <span className="text-sm">📦</span>
                    <span className="text-xs font-medium">Sold by Official Partner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
