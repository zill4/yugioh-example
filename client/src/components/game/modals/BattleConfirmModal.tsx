import React, { useRef, useEffect } from "react";
import { getBattlePreview } from "../../../game/utils/BattleCalculator";
import type {
  CardInPlay,
  GameAction,
  GameState,
} from "../../../game/types/GameTypes";
import { CardImage } from "../ui/CardImage";

interface BattleConfirmModalProps {
  show: boolean;
  pendingAction: GameAction | null;
  selectedCard: CardInPlay | null;
  gameState: GameState | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BattleConfirmModal: React.FC<BattleConfirmModalProps> = ({
  show,
  pendingAction,
  selectedCard,
  gameState,
  onConfirm,
  onCancel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [show, onCancel]);

  if (!show || !pendingAction || !selectedCard || !gameState) return null;

  // Get defender based on action type
  const getDefender = (): CardInPlay | null => {
    if (pendingAction.type === "DIRECT_ATTACK") {
      return null;
    }

    if (pendingAction.type === "ATTACK" && pendingAction.targetId) {
      const targetIndex = parseInt(pendingAction.targetId);
      return gameState.opponent.zones.mainMonsterZones[targetIndex] || null;
    }

    return null;
  };

  const defender = getDefender();
  const battlePreview = getBattlePreview(selectedCard, defender);

  return (
    <div
      enable-xr
      className="battle-modal-backdrop"
      onClick={onCancel}
      style={{ pointerEvents: "auto" }}
    >
      <div
        ref={modalRef}
        enable-xr
        className="battle-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Battle Preview Column */}
          <div className="w-full lg:w-1/2">
            <div className="battle-modal-header text-xs uppercase tracking-wider">
              Battle Preview
            </div>
            <div className="battle-modal-preview-section border-b lg:border-b-0 lg:border-r">
              <div className="battle-modal-card-preview">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="battle-modal-label text-xs uppercase tracking-wider">
                      Attacker
                    </div>
                    <div
                      className="w-24"
                      style={{
                        aspectRatio: "3/4",
                        maxHeight: "40vh",
                        minHeight: "128px",
                      }}
                    >
                      {selectedCard.imageUrl ? (
                        <CardImage
                          src={selectedCard.imageUrl}
                          alt={selectedCard.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="battle-modal-icon w-full h-full flex items-center justify-center text-2xl">
                          ⚔️
                        </div>
                      )}
                    </div>
                    <div className="battle-modal-card-name text-xs font-semibold text-center">
                      {selectedCard.name}
                    </div>
                  </div>

                  <div className="battle-modal-vs flex flex-col items-center">
                    <div className="text-xs uppercase tracking-wider">VS</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="battle-modal-label text-xs uppercase tracking-wider">
                      {defender ? "Defender" : "Direct Attack"}
                    </div>
                    <div
                      className="w-24"
                      style={{
                        aspectRatio: "3/4",
                        maxHeight: "40vh",
                        minHeight: "128px",
                      }}
                    >
                      {defender?.imageUrl ? (
                        <CardImage
                          src={defender.imageUrl}
                          alt={defender.name}
                          className="w-full h-full object-contain"
                        />
                      ) : defender ? (
                        <div className="battle-modal-icon w-full h-full flex items-center justify-center text-2xl">
                          🛡️
                        </div>
                      ) : (
                        <div className="battle-modal-direct-attack w-full h-full flex items-center justify-center text-xs text-center">
                          Direct Attack
                        </div>
                      )}
                    </div>
                    <div className="battle-modal-card-name text-xs font-semibold text-center">
                      {defender ? defender.name : "Opponent"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="battle-modal-stat-box">
                  <div className="battle-modal-stat-label text-xs uppercase tracking-wider">
                    Attacker ATK
                  </div>
                  <div className="battle-modal-attack-stat text-xl font-bold">
                    {battlePreview.attackerAtk}
                  </div>
                </div>
                <div className="battle-modal-stat-box">
                  <div className="battle-modal-stat-label text-xs uppercase tracking-wider">
                    {defender ? "Defender ATK" : "Damage"}
                  </div>
                  <div className="battle-modal-defense-stat text-xl font-bold">
                    {defender
                      ? battlePreview.defenderAtk
                      : battlePreview.damage}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Result & Actions Column */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div>
              <div className="battle-modal-header text-xs uppercase tracking-wider">
                Result
              </div>
              <div className="battle-modal-result-box">
                <div
                  className={`battle-modal-result-text text-base font-semibold ${battlePreview.resultColor}`}
                >
                  {battlePreview.resultText}
                </div>
                {defender && (
                  <div className="battle-modal-difference-text text-xs">
                    Attack Difference:{" "}
                    {battlePreview.attackDifference > 0 ? "+" : ""}
                    {battlePreview.attackDifference}
                  </div>
                )}
              </div>
            </div>

            {defender && (
              <div>
                <div className="battle-modal-header text-xs uppercase tracking-wider">
                  Defender Stats
                </div>
                <div className="battle-modal-defender-stats flex gap-2">
                  <div
                    className="w-20 shrink-0"
                    style={{ aspectRatio: "3/4", minHeight: "107px" }}
                  >
                    {defender.imageUrl ? (
                      <CardImage
                        src={defender.imageUrl}
                        alt={defender.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="battle-modal-icon w-full h-full flex items-center justify-center text-2xl">
                        🛡️
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="battle-modal-card-name font-semibold text-sm">
                      {defender.name}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="battle-modal-stat-box">
                        <div className="battle-modal-stat-label text-xs uppercase">
                          Attack
                        </div>
                        <div className="battle-modal-attack-stat font-bold text-lg">
                          {defender.attack}
                        </div>
                      </div>
                      <div className="battle-modal-stat-box">
                        <div className="battle-modal-stat-label text-xs uppercase">
                          Defense
                        </div>
                        <div className="battle-modal-defense-stat font-bold text-lg">
                          {defender.defense}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="battle-modal-actions grid md:grid-cols-2 gap-2">
              <button
                enable-xr
                onClick={onConfirm}
                className="battle-modal-confirm-btn w-full transition-all duration-200 text-xs font-bold uppercase tracking-wider"
              >
                Confirm Battle
              </button>
              <button
                enable-xr
                onClick={onCancel}
                className="battle-modal-cancel-btn w-full transition-all duration-200 text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
