import * as React from "react";
import { sampleCards } from "../data/sampleCards";
import OptimizedCardGrid from "./VirtualizedCardGrid";
import { getXRProps, getXRInteractiveProps, getXRBackgroundStyles } from "../utils/xr";
import { useState, useMemo, useCallback, startTransition } from "react";
import { useXRPerformanceMonitor, useBatchUpdateMonitor } from "../hooks/usePerformanceMonitor";

// Create a state object to batch related filter updates
interface FilterState {
  searchTerm: string;
  selectedRarity: string;
  selectedType: string;
  selectedSet: string;
}

const CardShop = React.memo(() => {
  // Performance monitoring
  useXRPerformanceMonitor('CardShop');
  const { trackBatch } = useBatchUpdateMonitor('CardShop');

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
    const rarities = [...new Set(sampleCards.map((card) => card.rarity))];
    const cardTypes = [...new Set(sampleCards.map((card) => card.cardType))];
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
    trackBatch();
    startTransition(() => {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    });
  }, [trackBatch]);

  return (
    <div {...getXRProps("relative")}>
      {/* Isolated filter scene - only re-renders when filters change */}
      <div 
        {...getXRProps("border border-slate-700 p-3 mb-3", { "data-scene": "filters" })}
        style={getXRBackgroundStyles()}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
          <input
            id="search"
            type="text"
            placeholder="Search cards..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            autoComplete="off"
            {...getXRInteractiveProps("w-full px-2 py-1 border border-slate-700 text-slate-100 placeholder-slate-500")}
            style={getXRBackgroundStyles()}
          />

          <select
            id="rarity"
            value={filters.selectedRarity}
            onChange={(e) => updateFilter('selectedRarity', e.target.value)}
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
            value={filters.selectedType}
            onChange={(e) => updateFilter('selectedType', e.target.value)}
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
            value={filters.selectedSet}
            onChange={(e) => updateFilter('selectedSet', e.target.value)}
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

      {/* Stats display - no XR needed for simple text */}
      <div className="mb-2 text-right text-[10px] text-slate-500 tracking-widest">
        {filteredCards.length} / {sampleCards.length} CARDS
      </div>

      {/* Isolated card grid scene - uses virtualization for performance */}
      <div {...getXRProps("", { "data-scene": "card-grid" })}>
        <OptimizedCardGrid 
          cards={filteredCards}
          containerHeight={800}
        />
      </div>
    </div>
  );
});

export default CardShop;
