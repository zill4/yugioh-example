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
    <div {...getXRProps("w-full")} style={{ maxHeight: `${containerHeight}px`, overflowY: 'auto' }}>
      {/* Optimized grid with minimal XR overhead */}
      <div className="grid grid-cols-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {visibleCards.map(card => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
      
      {/* Load more button - only spatialize interactive elements */}
      {hasMore && (
        <div className="text-center py-8">
          <button
            onClick={loadMore}
            {...getXRProps("px-6 py-2 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors")}
          >
            LOAD MORE CARDS ({cards.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
});

export default OptimizedCardGrid;
