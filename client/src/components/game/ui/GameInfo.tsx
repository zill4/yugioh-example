import React from "react";
import type { GameState } from "../../../game/types/GameTypes";
import { GameLog } from "./GameLog";

interface GameInfoProps {
  gameState: GameState;
  onEndGame: () => void;
}

export const GameInfo: React.FC<GameInfoProps> = ({ gameState, onEndGame }) => {
  return (
    <div className="__enableXr__ game-info-sidebar">
      <div className="space-y-4">
        <button
          onClick={onEndGame}
          className="game-info-end-duel-btn w-full transition-all duration-300"
        >
          END DUEL
        </button>

        <div className="game-info-stat-box">
          <div className="game-info-stat-label">Your LP</div>
          <div className="game-info-stat-value game-info-player-lp">
            {gameState.player.lifePoints}
          </div>
        </div>

        <div className="game-info-stat-box">
          <div className="game-info-stat-label">Opponent LP</div>
          <div className="game-info-stat-value game-info-opponent-lp">
            {gameState.opponent.lifePoints}
          </div>
        </div>

        <div className="game-info-stat-box">
          <div className="game-info-stat-label">Phase</div>
          <div className="game-info-phase-value">{gameState.currentPhase}</div>
          <div className="game-info-phase-description">
            {gameState.currentPhase === "Main" && "Summon and activate cards"}
            {gameState.currentPhase === "Battle" && "Attack with monsters"}
          </div>
        </div>

        <div className="game-info-stat-box">
          <div className="game-info-stat-label">Turn</div>
          <div className="game-info-turn-value">
            {gameState.currentTurn === "player"
              ? "Your Turn"
              : "Opponent's Turn"}
          </div>
          <div className="game-info-turn-number">
            Turn {gameState.turnNumber}
          </div>
        </div>
      </div>

      {/* Game Log - Bottom section of sidebar */}
      <GameLog gameState={gameState} />
    </div>
  );
};
