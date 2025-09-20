import * as React from "react";
import { sampleCards } from "../data/sampleCards";
import CardList from "./CardList";
import { getXRProps, getXRInteractiveProps, getXRBackgroundStyles } from "../utils/xr";
import { useState } from "react";

const CardShop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSet, setSelectedSet] = useState<string>("all");

  const filteredCards = sampleCards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    const matchesRarity =
      selectedRarity === "all" || card.rarity === selectedRarity;
    const matchesType =
      selectedType === "all" || card.cardType === selectedType;
    const matchesSet =
      selectedSet === "all" || card.setCode?.startsWith(selectedSet) || false;

    return matchesSearch && matchesRarity && matchesType && matchesSet;
  });

  const rarities = [...new Set(sampleCards.map((card) => card.rarity))];
  const cardTypes = [...new Set(sampleCards.map((card) => card.cardType))];
  const sets = [
    ...new Set(
      sampleCards.map((card) => card.setCode?.substring(0, 3) || "OTHER")
    ),
  ].sort();

  return (
    <div {...getXRProps("relative")}>
      {/* Compact toolbar */}
      <div 
        {...getXRProps("border border-slate-700 p-3 mb-3")}
        style={getXRBackgroundStyles()}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
          <input
            id="search"
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            {...getXRInteractiveProps("w-full px-2 py-1 border border-slate-700 text-slate-100 placeholder-slate-500")}
            style={getXRBackgroundStyles()}
          />

          <select
            id="rarity"
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            {...getXRInteractiveProps("w-full px-2 py-1 border border-slate-700 text-slate-100")}
            style={getXRBackgroundStyles()}
          >
            <option value="all">All Rarities</option>
            {rarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>

          <select
            id="cardType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            {...getXRInteractiveProps("w-full px-2 py-1 border border-slate-700 text-slate-100")}
            style={getXRBackgroundStyles()}
          >
            <option value="all">All Types</option>
            {cardTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            id="set"
            value={selectedSet}
            onChange={(e) => setSelectedSet(e.target.value)}
            {...getXRInteractiveProps("w-full px-2 py-1 border border-slate-700 text-slate-100")}
            style={getXRBackgroundStyles()}
          >
            <option value="all">All Sets</option>
            {sets.map((set) => (
              <option key={set} value={set}>
                {set === "SDP"
                  ? "STARTER DECK PEGASUS"
                  : set === "LOB"
                  ? "LEGEND OF BLUE EYES"
                  : set === "MRL"
                  ? "MAGIC RULER"
                  : set === "SDK"
                  ? "STARTER DECK KAIBA"
                  : set === "SDY"
                  ? "STARTER DECK YUGI"
                  : set === "SDJ"
                  ? "STARTER DECK JOEY"
                  : set}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-2 text-right text-[10px] text-slate-500 tracking-widest">
        {filteredCards.length} / {sampleCards.length} CARDS
      </div>

      {/* Card Grid */}
      <CardList cards={filteredCards} />
    </div>
  );
};

export default CardShop;
