import React, { useState } from "react";
import { getXRInteractiveProps, getXRProps } from "../utils/xr";
import GameBoard from "../components/GameBoard";
import Layout from "../components/Layout";

const GamePage = () => {
  const [selectedGameMode, setSelectedGameMode] = useState<string>("");
  const [isGameActive, setIsGameActive] = useState<boolean>(false);

  const handleStartDuel = () => {
    if (selectedGameMode) {
      setIsGameActive(true);
    }
  };

  const handleEndDuel = () => {
    setIsGameActive(false);
    setSelectedGameMode("");
  };

  const gameModes = [
    { id: "ai-duel", title: "AI DUEL" },
    { id: "online-pvp", title: "ONLINE PVP" },
    { id: "tournament", title: "TOURNAMENT" },
    { id: "practice", title: "PRACTICE MODE" },
  ];

  if (isGameActive && selectedGameMode) {
    return (
      <GameBoard
        gameMode={
          gameModes.find((m) => m.id === selectedGameMode)?.title ||
          selectedGameMode
        }
        onEndGame={handleEndDuel}
      />
    );
  }

  return (
    <Layout header="PLAY">
      {/* Only spatialize the main container - not every div */}
      <div {...getXRProps("grid grid-cols-1 lg:grid-cols-3 gap-8")}>
        <div className="lg:col-span-2 border border-slate-700 p-6">
          {selectedGameMode ? (
            <div className="text-center">
              <div className="w-full aspect-[16/9] bg-black border border-slate-700 flex items-center justify-center">
                <div className="text-6xl">⚔️</div>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={handleStartDuel}
                  {...getXRInteractiveProps("px-6 py-2 border border-slate-700 text-slate-100 hover:bg-slate-900")}
                >
                  START DUEL
                </button>
                <button
                  onClick={() => setSelectedGameMode("")}
                  {...getXRInteractiveProps("px-6 py-2 border border-slate-700 text-slate-300 hover:bg-slate-900")}
                >
                  BACK
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-[16/9] bg-black border border-slate-700 flex items-center justify-center">
              <div className="text-6xl">🎴</div>
            </div>
          )}
        </div>
        <div enable-xr className="test-container bg-red-500">
        meow meow meow I am content
      </div>
        <div className="space-y-3">
          {gameModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedGameMode(mode.id)}
              {...getXRInteractiveProps(`w-full text-left px-4 py-3 border border-slate-700 tracking-wider ${
                selectedGameMode === mode.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-300 hover:text-white"
              }`)}
            >
              {mode.title}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default GamePage;
