import * as React from "react";
import { sampleCards } from "../data/sampleCards";
import OptimizedCardGrid from "./VirtualizedCardGrid";
import { useState, useMemo, useCallback, startTransition } from "react";

// Create a state object to batch related filter updates
interface FilterState {
  searchTerm: string;
  selectedRarity: string;
  selectedType: string;
  selectedSet: string;
}

const CardShop = React.memo(() => {
  // Batch related state for better performance
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    selectedRarity: "all",
    selectedType: "all",
    selectedSet: "all"
  });

  // Memoize expensive computations
  const { filteredCards, rarities, cardTypes, sets } = useMemo(() => {
    // Calculate filter options once
    const rarities = [...new Set(sampleCards.map((card) => card.rarity).filter(Boolean))];
    const cardTypes = [...new Set(sampleCards.map((card) => card.cardType).filter(Boolean))];
    const sets = [
      ...new Set(
        sampleCards.map((card) => card.setCode?.substring(0, 3) || "OTHER")
      ),
    ].sort();

    // Filter cards based on current filters
    const filteredCards = sampleCards.filter((card) => {
      const matchesSearch =
        card.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        card.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        false;
      const matchesRarity =
        filters.selectedRarity === "all" || card.rarity === filters.selectedRarity;
      const matchesType =
        filters.selectedType === "all" || card.cardType === filters.selectedType;
      const matchesSet =
        filters.selectedSet === "all" || card.setCode?.startsWith(filters.selectedSet) || false;

      return matchesSearch && matchesRarity && matchesType && matchesSet;
    });

    return { filteredCards, rarities, cardTypes, sets };
  }, [filters]);

  // Batch filter updates using startTransition
  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    startTransition(() => {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    });
  }, []);

  return (
    <div enable-xr className="cardshop-main-window py-4">
      {/* Floating Search Bar */}
      <div className="cardshop-search-bar mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search cards..."
            className={`w-full px-6 py-4 border focus:outline-none focus:ring-2 transition-all text-lg ${
              process.env.XR_ENV === "avp"
                ? "border-slate-600/50 bg-transparent text-slate-100 placeholder-slate-400 focus:ring-slate-500"
                : "border-gray-300 bg-white text-gray-800 focus:ring-indigo-500 rounded-xl"
            }`}
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
          />
          <svg
            className={`absolute right-4 top-4 h-6 w-6 ${
              process.env.XR_ENV === "avp" ? "text-slate-400" : "text-gray-400"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Horizontal Filter Menu */}
      <div enable-xr className="cardshop-filter-menu">
        <div
          enable-xr
          className="cardshop-filter-menu-bg shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <select
              value={filters.selectedRarity}
              onChange={(e) => updateFilter('selectedRarity', e.target.value)}
              className={`px-3 py-2 border text-sm focus:outline-none focus:ring-2 transition-all ${
                process.env.XR_ENV === "avp"
                  ? "border-slate-600/50 bg-transparent text-slate-100 focus:ring-slate-500"
                  : "border-slate-600 bg-slate-800 text-slate-100 focus:ring-indigo-500 rounded-lg"
              }`}
            >
              <option value="all">All Rarities</option>
              {rarities.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>

            <select
              value={filters.selectedType}
              onChange={(e) => updateFilter('selectedType', e.target.value)}
              className={`px-3 py-2 border text-sm focus:outline-none focus:ring-2 transition-all ${
                process.env.XR_ENV === "avp"
                  ? "border-slate-600/50 bg-transparent text-slate-100 focus:ring-slate-500"
                  : "border-slate-600 bg-slate-800 text-slate-100 focus:ring-indigo-500 rounded-lg"
              }`}
            >
              <option value="all">All Types</option>
              {cardTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={filters.selectedSet}
              onChange={(e) => updateFilter('selectedSet', e.target.value)}
              className={`px-3 py-2 border text-sm focus:outline-none focus:ring-2 transition-all ${
                process.env.XR_ENV === "avp"
                  ? "border-slate-600/50 bg-transparent text-slate-100 focus:ring-slate-500"
                  : "border-slate-600 bg-slate-800 text-slate-100 focus:ring-indigo-500 rounded-lg"
              }`}
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

            {/* Clear Filters Button */}
            {(filters.searchTerm || filters.selectedRarity !== 'all' || filters.selectedType !== 'all' || filters.selectedSet !== 'all') && (
              <button
                enable-xr
                className={`px-4 py-2 transition-all text-sm font-medium ${
                  process.env.XR_ENV === "avp"
                    ? "text-slate-300 hover:text-white border border-slate-600/50 hover:border-slate-500/70"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white rounded-lg"
                }`}
                onClick={() => {
                  setFilters({
                    searchTerm: "",
                    selectedRarity: "all",
                    selectedType: "all",
                    selectedSet: "all"
                  });
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="list-window">
        {/* Stats Display */}
        <div className="cardshop-stats mb-4 text-right text-sm tracking-wider text-slate-400">
          {filteredCards.length} / {sampleCards.length} CARDS
        </div>

        {/* Card Grid Scene */}
        <div className="cardshop-grid-scene">
          <OptimizedCardGrid 
            cards={filteredCards}
            containerHeight={600}
          />
        </div>
      </div>
    </div>
  );
});

export default CardShop;
