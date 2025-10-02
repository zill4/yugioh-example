/**
 * useCardSelection Hook
 * Manages card selection state and logic
 */

import { useState, useCallback } from "react";
import type { CardInPlay } from "../../../game/types/GameTypes";

export function useCardSelection() {
  const [selectedCard, setSelectedCard] = useState<CardInPlay | null>(null);

  const selectCard = useCallback((card: CardInPlay | null) => {
    setSelectedCard(card);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCard(null);
  }, []);

  return {
    selectedCard,
    selectCard,
    clearSelection,
  };
}
