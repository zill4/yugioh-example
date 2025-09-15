import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { BaseCard, MonsterCard } from '../types/Card';

interface CardItemProps {
  card: BaseCard;
}

const CardItem: React.FC<CardItemProps> = ({ card }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/card/${card.id}`);
  };

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

  return (
    <div
      enable-xr
      onClick={handleCardClick}
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
    >
      <div enable-xr className="bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-600/50 overflow-hidden shadow-2xl hover:shadow-3xl hover:shadow-purple-900/30 h-full transition-all duration-300 ring-1 ring-slate-700/20 hover:ring-purple-500/30">
        {/* Card Image */}
        <div className="relative aspect-[686/1000] overflow-hidden bg-slate-900/50 border-b border-slate-700/30">
          <img
            src={card.imageUrl}
            alt={card.name}
            enable-xr className="w-full h-auto object-contain p-2 transition-all duration-300 group-hover:scale-105 filter group-hover:brightness-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x400/374151/6b7280?text=PREMIUM+CARD';
            }}
          />

          {/* Stock Status Overlay */}
          {!card.inStock && (
            <div enable-xr className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center border-2 border-red-600/50">
              <span className="text-red-100 font-bold text-sm tracking-wider">UNAVAILABLE</span>
            </div>
          )}

          {/* Rarity Badge */}
          <div enable-xr className={`absolute top-2 right-2 bg-gradient-to-r ${getRarityColor(card.rarity || '')} text-white text-xs px-2 py-1 rounded-md font-bold shadow-xl border`}>
            {card.rarity}
          </div>
        </div>

        {/* Card Info */}
        <div enable-xr className="p-4 sm:p-5 space-y-3 bg-slate-800/40 border-t border-slate-700/30">
          {/* Header */}
          <div enable-xr className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{getCardTypeIcon(card.cardType || '')}</span>
              <span className="text-xs text-slate-300 uppercase tracking-wider font-bold">{card.cardType || ''}</span>
            </div>
            <div className="text-right">
              <div enable-xr className="text-lg font-bold text-emerald-400">${card.price}</div>
            </div>
          </div>

          {/* Card Name */}
          <h3 enable-xr className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-tight">
            {card.name}
          </h3>

          {/* Monster Stats */}
          {card.cardType === 'Monster' && (
            <div enable-xr className="flex justify-between text-xs text-slate-400 font-semibold">
              <div enable-xr className="flex items-center gap-1">
                <span enable-xr className="text-amber-400">★</span>
                <span enable-xr>{(card as MonsterCard).level}</span>
              </div>
              <div enable-xr className="flex items-center gap-3">
                <span enable-xr className="text-red-400 font-bold">ATK: {(card as MonsterCard).attack}</span>
                <span enable-xr className="text-cyan-400 font-bold">DEF: {(card as MonsterCard).defense}</span>
              </div>
            </div>
          )}

          {/* Description Preview */}
          <p enable-xr className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {card.description}
          </p>

          {/* View Details Button */}
          <button
            enable-xr className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-xs font-bold transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            VIEW DETAILS
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardItem;
