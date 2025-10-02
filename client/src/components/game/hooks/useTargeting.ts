/**
 * useTargeting Hook
 * Manages attack targeting state and logic
 */

import { useState, useCallback } from "react";
import type {
  CardInPlay,
  GameState,
  GameAction,
} from "../../../game/types/GameTypes";
import {
  canAttack,
  getValidAttackTargets,
  canDirectAttack,
} from "../../../game/utils/CardStateUtils";

interface UseTargetingProps {
  gameState: GameState | null;
}

export function useTargeting({ gameState }: UseTargetingProps) {
  const [targetingMode, setTargetingMode] = useState<
    "attack" | "effect" | null
  >(null);
  const [validTargets, setValidTargets] = useState<CardInPlay[]>([]);
  const [pendingAction, setPendingAction] = useState<GameAction | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const startTargeting = useCallback(
    (card: CardInPlay) => {
      if (!gameState) return;

      // Check if card can attack
      if (!canAttack(card, gameState)) return;

      setTargetingMode("attack");

      // Get valid targets
      const targets = getValidAttackTargets(gameState.opponent);

      // If no monsters, add direct attack option
      if (targets.length === 0 && canDirectAttack(gameState.opponent)) {
        const directAttackTarget: CardInPlay = {
          id: "direct-attack",
          name: "Direct Attack",
          description: "Attack opponent directly",
          cardType: "Monster" as const,
          suit: "spades" as const,
          level: "0",
          attack: card.attack || 0,
          defense: 0,
          rarity: "Common" as const,
          price: 0,
          cardNumber: "",
          imageUrl: "",
          position: "monster" as const,
          zoneIndex: -1,
          battlePosition: "attack" as const,
          faceDown: false,
          faceUp: true,
        };
        setValidTargets([directAttackTarget]);
      } else {
        setValidTargets(targets);
      }
    },
    [gameState]
  );

  const selectTarget = useCallback(
    (target: CardInPlay, selectedCard: CardInPlay) => {
      if (!validTargets.some((t) => t.id === target.id)) return;

      // Handle direct attack
      if (target.id === "direct-attack") {
        const action: GameAction = {
          type: "DIRECT_ATTACK",
          player: "player",
          cardId: selectedCard.id,
        };
        setPendingAction(action);
        setShowConfirmation(true);
        setValidTargets([]);
        setTargetingMode(null);
        return;
      }

      // Find target zone index
      const targetZoneIndex =
        gameState?.opponent.zones.mainMonsterZones.findIndex(
          (monster) => monster?.id === target.id
        );

      const action: GameAction = {
        type: "ATTACK",
        player: "player",
        cardId: selectedCard.id,
        targetId:
          targetZoneIndex !== undefined && targetZoneIndex !== -1
            ? targetZoneIndex.toString()
            : undefined,
      };

      setPendingAction(action);
      setShowConfirmation(true);
      setValidTargets([]);
      setTargetingMode(null);
    },
    [validTargets, gameState]
  );

  const cancelTargeting = useCallback(() => {
    setTargetingMode(null);
    setValidTargets([]);
    setPendingAction(null);
    setShowConfirmation(false);
  }, []);

  const confirmAction = useCallback(() => {
    setShowConfirmation(false);
    setPendingAction(null);
  }, []);

  return {
    targetingMode,
    validTargets,
    pendingAction,
    showConfirmation,
    startTargeting,
    selectTarget,
    cancelTargeting,
    confirmAction,
  };
}
