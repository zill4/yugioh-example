/**
 * useGameActions Hook
 * Encapsulates game action logic (phase changes, turn ending, etc.)
 */

import { useCallback } from "react";
import type { GameController } from "../../../game/GameController";

interface UseGameActionsProps {
  gameController: GameController | null;
  isAITurn: boolean;
}

export function useGameActions({
  gameController,
  isAITurn,
}: UseGameActionsProps) {
  const handleNextPhase = useCallback(() => {
    if (!gameController || isAITurn) return false;
    return gameController.changePhase();
  }, [gameController, isAITurn]);

  const handleEndTurn = useCallback(() => {
    if (!gameController || isAITurn) return false;
    return gameController.endTurn();
  }, [gameController, isAITurn]);

  const handleNormalSummon = useCallback(
    (cardId: string, zoneIndex?: number) => {
      if (!gameController || isAITurn) return false;
      return gameController.normalSummon(cardId, zoneIndex);
    },
    [gameController, isAITurn]
  );

  return {
    handleNextPhase,
    handleEndTurn,
    handleNormalSummon,
  };
}
