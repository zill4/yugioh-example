import React from "react";
import { getAssetPath } from "../../../utils/xr";
import { getBattlePreview } from "../../../game/utils/BattleCalculator";
import type {
  CardInPlay,
  GameAction,
  GameState,
} from "../../../game/types/GameTypes";
import { isXR } from "../../../utils/xr";

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      style={{
        ...(isXR
          ? ({
              "--xr-background-material": "translucent",
            } as React.CSSProperties)
          : {}),
      }}
    >
      <div
        enable-xr
        className="bg-slate-900/95 border border-slate-700 backdrop-blur-md max-w-4xl w-full mx-4 overflow-hidden"
        style={{
          ...(isXR
            ? ({
                "--xr-background-material": "translucent",
              } as React.CSSProperties)
            : {}),
        }}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Battle Preview Column */}
          <div className="w-full lg:w-1/2">
            <div className="px-6 pt-6 pb-3 text-slate-400 text-xs uppercase tracking-wider">
              Battle Preview
            </div>
            <div className="px-6 pb-6 border-b lg:border-b-0 lg:border-r border-slate-800">
              <div className="bg-black/60 border border-slate-800 p-4">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xs text-slate-400 uppercase tracking-wider">
                      Attacker
                    </div>
                    <div
                      className="w-28"
                      style={{ aspectRatio: "3/4", maxHeight: "50vh" }}
                    >
                      {selectedCard.imageUrl ? (
                        <img
                          src={selectedCard.imageUrl}
                          alt={selectedCard.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-slate-600">
                          ⚔️
                        </div>
                      )}
                    </div>
                    <div className="text-slate-200 text-sm font-semibold text-center px-2">
                      {selectedCard.name}
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-slate-500">
                    <div className="text-xs uppercase tracking-wider">VS</div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xs text-slate-400 uppercase tracking-wider">
                      {defender ? "Defender" : "Direct Attack"}
                    </div>
                    <div
                      className="w-28"
                      style={{ aspectRatio: "3/4", maxHeight: "50vh" }}
                    >
                      {defender?.imageUrl ? (
                        <img
                          src={defender.imageUrl}
                          alt={defender.name}
                          className="w-full h-full object-contain"
                        />
                      ) : defender ? (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-slate-600">
                          🛡️
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 text-center px-2">
                          Direct Attack
                        </div>
                      )}
                    </div>
                    <div className="text-slate-200 text-sm font-semibold text-center px-2">
                      {defender ? defender.name : "Opponent"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-800/50 border border-slate-700 p-3 border-rounded-lg">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">
                    Attacker ATK
                  </div>
                  <div className="text-red-400 text-2xl font-bold">
                    {battlePreview.attackerAtk}
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-3 border-rounded-lg">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">
                    {defender ? "Defender ATK" : "Damage"}
                  </div>
                  <div className="text-cyan-400 text-2xl font-bold">
                    {defender
                      ? battlePreview.defenderAtk
                      : battlePreview.damage}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Result & Actions Column */}
          <div className="w-full lg:w-1/2 p-6 flex flex-col gap-6">
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">
                Result
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-4 space-y-3 border-rounded-lg">
                <div
                  className={`text-lg font-semibold ${battlePreview.resultColor}`}
                >
                  {battlePreview.resultText}
                </div>
                {defender && (
                  <div className="text-xs text-slate-500">
                    Attack Difference:{" "}
                    {battlePreview.attackDifference > 0 ? "+" : ""}
                    {battlePreview.attackDifference}
                  </div>
                )}
              </div>
            </div>

            {defender && (
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">
                  Defender Stats
                </div>
                <div className="bg-black/60 border border-slate-800 p-4 flex gap-4">
                  <div className="w-24 shrink-0" style={{ aspectRatio: "3/4" }}>
                    {defender.imageUrl ? (
                      <img
                        src={defender.imageUrl}
                        alt={defender.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-slate-600">
                        🛡️
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="text-slate-200 font-semibold">
                      {defender.name}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-slate-500 text-xs uppercase">
                          Attack
                        </div>
                        <div className="text-red-400 font-bold text-xl">
                          {defender.attack}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs uppercase">
                          Defense
                        </div>
                        <div className="text-cyan-400 font-bold text-xl">
                          {defender.defense}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-3 border-t border-slate-800 pt-4">
              <button
                enable-xr
                onClick={onConfirm}
                className="w-full px-6 py-3 bg-slate-100/10 hover:bg-slate-100/20 text-slate-50 border border-slate-600 transition-all duration-200 text-sm font-semibold uppercase"
              >
                Confirm Battle
              </button>
              <button
                enable-xr
                onClick={onCancel}
                className="w-full px-6 py-3 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-rounded-lg border-slate-700 hover:border-slate-500 transition-all duration-200 text-sm font-semibold uppercase"
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
