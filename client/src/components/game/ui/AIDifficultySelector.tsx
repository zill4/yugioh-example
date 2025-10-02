import React from "react";
import type { AIDifficulty } from "../../../game/ai/MinimaxAI";
import {
  getDifficultyName,
  getDifficultyDescription,
} from "../../../game/ai/AIUtils";

interface AIDifficultySelectorProps {
  currentDifficulty: AIDifficulty;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  disabled?: boolean;
}

export const AIDifficultySelector: React.FC<AIDifficultySelectorProps> = ({
  currentDifficulty,
  onDifficultyChange,
  disabled = false,
}) => {
  const difficulties: AIDifficulty[] = ["easy", "medium", "hard", "expert"];

  return (
    <div className="space-y-3">
      <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">
        AI Difficulty
      </div>

      <div className="space-y-2">
        {difficulties.map((difficulty) => {
          const isSelected = currentDifficulty === difficulty;

          return (
            <button
              key={difficulty}
              onClick={() => onDifficultyChange(difficulty)}
              disabled={disabled}
              className={`w-full text-left px-3 py-2 border transition-all duration-200 ${
                isSelected
                  ? "border-red-500 bg-red-500/10 text-slate-100"
                  : "border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              } ${
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {getDifficultyName(difficulty).split(" (")[0]}
                </span>
                {isSelected && (
                  <span className="text-xs text-red-400">✓ Active</span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {getDifficultyDescription(difficulty).split(".")[0]}
              </div>
            </button>
          );
        })}
      </div>

      {disabled && (
        <div className="text-xs text-slate-500 italic mt-2">
          Start a new game to change difficulty
        </div>
      )}
    </div>
  );
};

