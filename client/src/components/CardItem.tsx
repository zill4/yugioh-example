import React from "react";
import { useNavigate } from "react-router-dom";
import type { BaseCard, MonsterCard } from "../types/Card";
import { isXR } from "../utils/xr";

// Default placeholder image for cards with missing images
const DEFAULT_CARD_IMAGE = `data:image/svg+xml;base64,${btoa(`
  <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#cardBg)"/>
    <rect x="20" y="20" width="260" height="360" fill="none" stroke="#475569" stroke-width="2"/>
    <circle cx="150" cy="120" r="40" fill="#7c3aed" opacity="0.3"/>
    <text x="150" y="200" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="14" font-weight="bold">PREMIUM</text>
    <text x="150" y="220" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="14" font-weight="bold">CARD</text>
    <text x="150" y="280" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="10">WARLOK</text>
  </svg>
`)}`;

interface CardItemProps {
  card: BaseCard;
}

const CardItem: React.FC<CardItemProps> = React.memo(({ card }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = React.useState(false);

  const handleCardClick = React.useCallback(() => {
    navigate(`/card/${card.id}`);
  }, [navigate, card.id]);

  const handleImageError = React.useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (!imageError) {
        setImageError(true);
        const target = e.target as HTMLImageElement;
        // Use the default placeholder that won't cause repeated requests
        target.src = DEFAULT_CARD_IMAGE;
      }
    },
    [imageError]
  );

  const getRarityColorClass = React.useCallback((rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-slate-500";
      case "Rare":
        return "bg-cyan-400";
      case "Super Rare":
        return "bg-purple-400";
      case "Ultra Rare":
        return "bg-amber-400";
      case "Secret Rare":
        return "bg-rose-400";
      case "Ghost Rare":
        return "bg-indigo-400";
      default:
        return "bg-slate-500";
    }
  }, []);

  const getSuitIcon = React.useCallback((suit: string) => {
    switch (suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "spades":
        return "♠";
      case "clubs":
        return "♣";
      default:
        return "◈";
    }
  }, []);

  const getSuitColor = React.useCallback((suit: string) => {
    switch (suit) {
      case "hearts":
      case "diamonds":
        return "text-red-400";
      case "spades":
      case "clubs":
        return "text-slate-300";
      default:
        return "text-slate-400";
    }
  }, []);

  return (
    <div
      onClick={handleCardClick}
      className="cardshop-card-item group transition-all duration-300 hover:scale-105 cursor-pointer"
    >
      {/* Card container with rounded borders and translucent styling */}
      <div
        className={`relative border border-slate-600/50 overflow-hidden bg-transparent backdrop-blur-sm hover:border-slate-500/70 transition-all duration-300 ${
          isXR ? "" : "rounded-xl"
        }`}
      >
        {/* Image container */}
        <div
          className={`relative aspect-[3/4] overflow-hidden ${
            isXR ? "" : "rounded-xl"
          }`}
        >
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-full object-contain p-2"
            onError={handleImageError}
          />

          {/* Rarity indicator */}
          <div
            title={card.rarity}
            className={`absolute top-3 right-3 w-3 h-3 rounded-full border border-slate-500/50 ${getRarityColorClass(
              card.rarity || ""
            )}`}
          />

          {/* Hover details overlay */}
          <div
            className={`absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 grid grid-rows-[auto_1fr_auto] text-[11px] ${
              isXR ? "" : "rounded-xl"
            }`}
          >
            <div className="text-slate-100 font-semibold leading-snug line-clamp-2">
              {card.name}
            </div>
            <div className="text-slate-400 line-clamp-3 leading-snug mt-1">
              {card.description}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="text-slate-300 flex items-center gap-2">
                <span
                  className={`text-lg ${getSuitColor(
                    (card as MonsterCard).suit || ""
                  )}`}
                >
                  {getSuitIcon((card as MonsterCard).suit || "")}
                </span>
                <span className="uppercase tracking-wider text-[10px]">
                  {(card as MonsterCard).suit}
                </span>
              </div>
              <div className="text-emerald-400 font-bold">${card.price}</div>
            </div>
            {card.cardType === "Monster" && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-amber-400">LVL</span>
                  <span className="uppercase">
                    {(card as MonsterCard).level}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-400">
                    ATK {(card as MonsterCard).attack}
                  </span>
                  <span className="text-cyan-400">
                    DEF {(card as MonsterCard).defense}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CardItem;
