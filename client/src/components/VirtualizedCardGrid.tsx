import React, { useMemo, useState } from 'react';
import type { BaseCard } from '../types/Card';
import { getXRProps } from '../utils/xr';
import CardItem from './CardItem';

interface OptimizedCardGridProps {
  cards: BaseCard[];
  containerHeight?: number;
}

// Optimized card grid with lazy loading and performance optimizations
const OptimizedCardGrid: React.FC<OptimizedCardGridProps> = React.memo(({ 
  cards,
  containerHeight = 600
}) => {
  const [visibleCount, setVisibleCount] = useState(24); // Start with 24 cards (4 rows)
  
  // Memoize visible cards to prevent unnecessary re-calculations
  const visibleCards = useMemo(() => {
    return cards.slice(0, visibleCount);
  }, [cards, visibleCount]);

  const hasMore = cards.length > visibleCount;

  // Load more cards when requested
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 18, cards.length)); // Load 3 more rows
  };

  if (cards.length === 0) {
    return (
      <div {...getXRProps("text-center py-16")}>
        <div className="text-6xl mb-6 text-slate-500">◈</div>
        <h3 className="text-xl font-bold text-slate-300 mb-3 tracking-wider">NO CARDS FOUND</h3>
        <p className="text-slate-400 font-medium">Adjust your search filters to discover premium cards</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden" style={{ maxHeight: `${containerHeight}px` }}>
      {/* Optimized grid - no XR props needed, inherits from parent */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-2">
        {visibleCards.map(card => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
      
      {/* Load more button */}
      {hasMore && (
        <div className="text-center py-6">
          <button
            onClick={loadMore}
            className="px-6 py-3 rounded-lg border border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer bg-transparent backdrop-blur-sm"
          >
            LOAD MORE CARDS ({cards.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
});

export default OptimizedCardGrid;
