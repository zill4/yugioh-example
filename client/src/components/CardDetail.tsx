import React from "react";
import { useParams } from "react-router-dom";
import { sampleCards } from "../data/sampleCards";
import { getXRProps, getAssetPath } from "../utils/xr";
import type { MonsterCard } from "../types/Card";
import Layout from "./Layout";

const CardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const card = sampleCards.find((c) => c.id === id);

  if (!card) {
    return (
      <Layout header="CARD NOT FOUND">
        <div
          {...getXRProps()}
          className="border border-slate-700 p-6 text-center"
        >
          <div className="text-4xl text-slate-500 mb-2">◈</div>
          <div className="text-slate-200 mb-2 tracking-wider">
            The card you're looking for doesn't exist.
          </div>
          <div className="text-slate-500 text-xs">
            Use the left navigation to continue browsing.
          </div>
        </div>
      </Layout>
    );
  }

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType) {
      case "Monster":
        return "⚔️";
      default:
        return "🎴";
    }
  };

  const getSuitIcon = (suit: string) => {
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
  };

  const getSuitColor = (suit: string) => {
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
  };

  // Layout aims to avoid page scroll: fixed-height grid below the header/auth
  // Adjust height to account for Layout paddings (~140px total overhead)
  return (
    <Layout header={card.name}>
      <div
        {...getXRProps()}
        className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 h-[calc(100vh-140px)]"
      >
        {/* Image */}
        <div
          {...getXRProps()}
          className="border border-slate-700 bg-black p-3 flex items-center justify-center"
        >
          <div className="w-full" style={{ aspectRatio: "3/4" }}>
            <img
              {...getXRProps()}
              src={getAssetPath(card.imageUrl)}
              alt={card.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://via.placeholder.com/600x900/0b0b0b/64748b?text=CARD";
              }}
            />
          </div>
        </div>

        {/* Details */}
        <div
          {...getXRProps()}
          className="grid grid-rows-[auto_auto_1fr_auto] gap-4 overflow-hidden"
        >
          {/* Meta */}
          <div {...getXRProps()} className="border border-slate-700 p-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>{getCardTypeIcon(card.cardType || "")}</span>
              <span>{card.cardType}</span>
              <span>•</span>
              <span className={`text-lg ${getSuitColor((card as MonsterCard).suit || "")}`}>
                {getSuitIcon((card as MonsterCard).suit || "")}
              </span>
              <span className="uppercase">{(card as MonsterCard).suit}</span>
              <span>•</span>
              <span>#{card.cardNumber}</span>
            </div>
          </div>

          {/* Price / Availability */}
          <div
            {...getXRProps()}
            className="border border-slate-700 p-3 grid grid-cols-2 gap-4 items-center"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-400">
                ${card.price}
              </span>
              <span className="text-xs text-slate-400">USD</span>
            </div>
            <div className="text-xs font-semibold text-emerald-400 text-right">
              ✓ AVAILABLE
            </div>
          </div>

          {/* Specs + Description (scrolls inside if needed, page stays fixed) */}
          <div
            {...getXRProps()}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-hidden"
          >
            {/* Specs */}
            <div
              {...getXRProps()}
              className="border border-slate-700 p-3 text-xs text-slate-300 overflow-auto"
            >
              <div className="mb-2 text-slate-200 tracking-wider">
                CARD DETAILS
              </div>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Card Type</dt>
                  <dd className="font-semibold">{card.cardType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Suit</dt>
                  <dd className="font-semibold flex items-center gap-2">
                    <span className={getSuitColor((card as MonsterCard).suit || "")}>
                      {getSuitIcon((card as MonsterCard).suit || "")}
                    </span>
                    <span className="uppercase">{(card as MonsterCard).suit}</span>
                  </dd>
                </div>
                {card.cardType === "Monster" && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Level</dt>
                      <dd className="font-semibold uppercase">
                        {(card as MonsterCard).level}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">ATK / DEF</dt>
                      <dd className="font-semibold">
                        <span className="text-red-400">
                          {(card as MonsterCard).attack}
                        </span>
                        <span className="mx-1 text-slate-500">/</span>
                        <span className="text-cyan-400">
                          {(card as MonsterCard).defense}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Rarity</dt>
                      <dd className="font-semibold">{card.rarity}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            {/* Description */}
            <div
              {...getXRProps()}
              className="border border-slate-700 p-3 text-xs text-slate-300 overflow-auto"
            >
              <div className="mb-2 text-slate-200 tracking-wider">
                CARD LORE
              </div>
              <p className="leading-relaxed">{card.description}</p>
            </div>
          </div>

          {/* Actions */}
          <div {...getXRProps()} className="grid grid-cols-2 gap-3">
            <button
              {...getXRProps()}
              className="py-2 px-3 border border-slate-700 text-slate-100 hover:bg-slate-900 text-xs tracking-wider"
            >
              ADD TO CART
            </button>
            <button
              {...getXRProps()}
              className="py-2 px-3 border border-slate-700 text-slate-100 hover:bg-slate-900 text-xs tracking-wider"
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CardDetail;
