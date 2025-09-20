import React, { useCallback } from 'react';
import type { GameCard } from '../../game/types/GameTypes';

interface CardActionModalProps {
  selectedCard: GameCard | null;
  gameState: any;
  onClose: () => void;
  onNormalSummon: (cardId: string) => void;
  onSetMonster: (cardId: string) => void;
  onActivateSpellTrap: (cardId: string) => void;
  onPlayCard: (cardId: string) => void;
  isAITurn: boolean;
}

export const CardActionModal: React.FC<CardActionModalProps> = ({
  selectedCard,
  gameState,
  onClose,
  onNormalSummon,
  onSetMonster,
  onActivateSpellTrap,
  onPlayCard,
  isAITurn,
}) => {
  if (!selectedCard || !gameState) return null;

  const isMonster = selectedCard.type === 'monster';
  const canNormalSummon = !gameState.player.hasNormalSummoned && isMonster;
  const canSet = !gameState.player.hasSetMonster && isMonster;
  const isSpell = selectedCard.type === 'spell';
  const isTrap = selectedCard.type === 'trap';
  const canActivate = isSpell || isTrap;

  const handleNormalSummon = useCallback(() => {
    onNormalSummon(selectedCard.id);
    onClose();
  }, [selectedCard.id, onNormalSummon, onClose]);

  const handleSetCard = useCallback(() => {
    onSetMonster(selectedCard.id);
    onClose();
  }, [selectedCard.id, onSetMonster, onClose]);

  const handleActivateSpellTrap = useCallback(() => {
    onActivateSpellTrap(selectedCard.id);
    onClose();
  }, [selectedCard.id, onActivateSpellTrap, onClose]);

  const handlePlayCard = useCallback(() => {
    onPlayCard(selectedCard.id);
    onClose();
  }, [selectedCard.id, onPlayCard, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4 text-center">{selectedCard.name}</h3>

        {isMonster && (
          <div className="space-y-3">
            <h4 className="font-semibold text-center">Monster Actions:</h4>
            <div className="space-y-2">
              {canNormalSummon && (
                <button
                  onClick={handleNormalSummon}
                  disabled={isAITurn}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    isAITurn
                      ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Normal Summon (Face-up Attack)
                </button>
              )}
              {canSet && (
                <button
                  onClick={handleSetCard}
                  disabled={isAITurn}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    isAITurn
                      ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Set (Face-down Defense)
                </button>
              )}
            </div>
          </div>
        )}

        {(isSpell || isTrap) && canActivate && (
          <div className="space-y-3">
            <h4 className="font-semibold text-center">
              {isSpell ? 'Spell' : 'Trap'} Actions:
            </h4>
            <div className="space-y-2">
              <button
                onClick={handleActivateSpellTrap}
                disabled={isAITurn}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  isAITurn
                    ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Activate {isSpell ? 'Spell' : 'Trap'}
              </button>
              <button
                onClick={handlePlayCard}
                disabled={isAITurn}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  isAITurn
                    ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                Set {isSpell ? 'Spell' : 'Trap'}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
