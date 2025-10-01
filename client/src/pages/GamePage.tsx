import React, { useState } from "react";
import GameBoard from "../components/GameBoard";
import Layout from "../components/Layout";

const GamePage = () => {
  const [isGameActive, setIsGameActive] = useState<boolean>(false);

  const handleStartDuel = () => {
    setIsGameActive(true);
  };

  const handleEndDuel = () => {
    setIsGameActive(false);
  };

  if (isGameActive) {
    return <GameBoard gameMode={"ai-duel"} onEndGame={handleEndDuel} />;
  }

  return (
    <Layout header="PLAY">
      {/* Only spatialize the main container - not every div */}
      <div className="lg:col-span-2 border border-slate-700 p-6">
        <div className="text-center">
          <div className="w-full aspect-[16/9] bg-black border border-slate-700 flex items-center justify-center">
            <div className="text-6xl">⚔️</div>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleStartDuel}
              className="px-6 py-2 border border-slate-700 text-slate-100 hover:bg-slate-900"
            >
              START DUEL
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GamePage;
