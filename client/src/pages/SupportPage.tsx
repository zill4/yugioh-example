import React from "react";
import Layout from "../components/Layout";

const SupportPage = () => {
  return (
    <Layout header="SUPPORT">
      <div className="border border-slate-700 p-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-extrabold tracking-wider mb-4">
              WARLOK DUELS SUPPORT
            </h1>
            <div className="h-px bg-slate-700"></div>
          </div>

          {/* Introduction */}
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              Need help with Warlok Duels? We're here to assist you with any
              questions, issues, or feedback you might have.
            </p>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">CONTACT US</h2>
            <div className="bg-black/30 border border-slate-700 p-6 space-y-4">
              <div>
                <div className="text-sm text-slate-400 tracking-wider mb-2">
                  EMAIL SUPPORT
                </div>
                <a
                  href="mailto:justin@crispcode.io"
                  className="text-xl font-mono text-blue-400 hover:text-blue-300 transition-colors"
                >
                  justin@crispcode.io
                </a>
              </div>
              <p className="text-slate-400 text-sm">
                We typically respond within 24-48 hours during business days.
              </p>
            </div>
          </div>

          {/* Common Topics */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">COMMON TOPICS</h2>
            <div className="space-y-3 text-slate-300">
              <div className="border-l-2 border-slate-700 pl-4">
                <div className="font-bold">GAME RULES & MECHANICS</div>
                <p className="text-sm text-slate-400">
                  Questions about how the game works, battle calculations, and
                  turn phases
                </p>
              </div>
              <div className="border-l-2 border-slate-700 pl-4">
                <div className="font-bold">TECHNICAL ISSUES</div>
                <p className="text-sm text-slate-400">
                  Bugs, crashes, performance problems, or display issues
                </p>
              </div>
              <div className="border-l-2 border-slate-700 pl-4">
                <div className="font-bold">CARD CREATOR</div>
                <p className="text-sm text-slate-400">
                  Help with creating custom cards or card images
                </p>
              </div>
              <div className="border-l-2 border-slate-700 pl-4">
                <div className="font-bold">FEEDBACK & SUGGESTIONS</div>
                <p className="text-sm text-slate-400">
                  Share your ideas for improving Warlok Duels
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider">QUICK TIPS</h2>
            <div className="bg-black/30 border border-slate-700 p-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono">▸</div>
                <p className="text-slate-300 text-sm flex-1">
                  <strong>Game too hard?</strong> The AI uses cards with 800
                  attack or less. Build a deck with higher attack monsters to
                  gain an advantage.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono">▸</div>
                <p className="text-slate-300 text-sm flex-1">
                  <strong>Battle phase:</strong> Monsters summoned this turn
                  can't attack. Wait one turn before attacking with newly
                  summoned monsters.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-blue-400 font-mono">▸</div>
                <p className="text-slate-300 text-sm flex-1">
                  <strong>Win condition:</strong> Reduce your opponent's Life
                  Points to 0. The game continues even if decks run out.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center text-xs text-slate-500 tracking-widest">
            WARLOK DUELS © 2025
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
