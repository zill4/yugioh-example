import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getXRProps } from '../utils/xr';
import type { BaseCard, MonsterCard } from '../types/Card';

// Default placeholder image for cards with missing images
const DEFAULT_CARD_IMAGE = `data:image/svg+xml;base64,${btoa(`
  <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#cardBg)" rx="12"/>
    <rect x="20" y="20" width="260" height="360" fill="none" stroke="#475569" stroke-width="2" rx="8"/>
    <circle cx="150" cy="120" r="40" fill="#7c3aed" opacity="0.3"/>
    <text x="150" y="200" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="14" font-weight="bold">PREMIUM</text>
    <text x="150" y="220" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="14" font-weight="bold">CARD</text>
    <text x="150" y="280" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="10">YU-GI-OH!</text>
  </svg>
`)}`;

interface CardItemProps {
  card: BaseCard;
}

const CardItem: React.FC<CardItemProps> = ({ card }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = React.useState(false);

  const handleCardClick = () => {
    navigate(`/card/${card.id}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!imageError) {
      setImageError(true);
      const target = e.target as HTMLImageElement;
      // Use the default placeholder that won't cause repeated requests
      target.src = DEFAULT_CARD_IMAGE;
    }
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
      {...getXRProps()}
      onClick={handleCardClick}
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
    >
      <div {...getXRProps()} className="bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-600/50 overflow-hidden shadow-2xl hover:shadow-3xl hover:shadow-purple-900/30 h-full transition-all duration-300 ring-1 ring-slate-700/20 hover:ring-purple-500/30">
        {/* Card Image */}
        <div className="relative aspect-[686/1000] overflow-hidden bg-slate-900/50 border-b border-slate-700/30">
          <img
            src={card.imageUrl}
            alt={card.name}
            {...getXRProps()} className="w-full h-auto object-contain p-2 transition-all duration-300 group-hover:scale-105 filter group-hover:brightness-110"
            onError={handleImageError}
          />

          {/* Stock Status Overlay */}
          {!card.inStock && (
            <div {...getXRProps()} className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center border-2 border-red-600/50">
              <span className="text-red-100 font-bold text-sm tracking-wider">UNAVAILABLE</span>
            </div>
          )}

          {/* Placeholder Image Indicator */}
          {imageError && (
            <div {...getXRProps()} className="absolute top-2 left-2 bg-slate-800/90 backdrop-blur-sm rounded-md px-2 py-1 border border-slate-600/50">
              <span className="text-slate-400 text-xs font-medium tracking-wider">IMAGE</span>
            </div>
          )}

          {/* Rarity Badge */}
          <div {...getXRProps()} className={`absolute top-2 right-2 bg-gradient-to-r ${getRarityColor(card.rarity || '')} text-white text-xs px-2 py-1 rounded-md font-bold shadow-xl border`}>
            {card.rarity}
          </div>
        </div>

        {/* Card Info */}
        <div {...getXRProps()} className="p-4 sm:p-5 space-y-3 bg-slate-800/40 border-t border-slate-700/30">
          {/* Header */}
          <div {...getXRProps()} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{getCardTypeIcon(card.cardType || '')}</span>
              <span className="text-xs text-slate-300 uppercase tracking-wider font-bold">{card.cardType || ''}</span>
            </div>
            <div className="text-right">
              <div {...getXRProps()} className="text-lg font-bold text-emerald-400">${card.price}</div>
            </div>
          </div>

          {/* Card Name */}
          <h3 {...getXRProps()} className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-tight">
            {card.name}
          </h3>

          {/* Monster Stats */}
          {card.cardType === 'Monster' && (
            <div {...getXRProps()} className="flex justify-between text-xs text-slate-400 font-semibold">
              <div {...getXRProps()} className="flex items-center gap-1">
                <span {...getXRProps()} className="text-amber-400">★</span>
                <span {...getXRProps()}>{(card as MonsterCard).level}</span>
              </div>
              <div {...getXRProps()} className="flex items-center gap-3">
                <span {...getXRProps()} className="text-red-400 font-bold">ATK: {(card as MonsterCard).attack}</span>
                <span {...getXRProps()} className="text-cyan-400 font-bold">DEF: {(card as MonsterCard).defense}</span>
              </div>
            </div>
          )}

          {/* Description Preview */}
          <p {...getXRProps()} className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {card.description}
          </p>

          {/* View Details Button */}
          <button
            {...getXRProps()} className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-xs font-bold transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
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
