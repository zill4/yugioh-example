import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/UserContext";
import { getXRProps } from "../utils/xr";

const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div {...getXRProps()} className="min-h-screen relative overflow-hidden">
      {/* Background overlay */}
      <div {...getXRProps()} className="absolute inset-0 opacity-40">
        <div
          {...getXRProps()}
          className="absolute inset-0 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50"
        />
        <div
          {...getXRProps()}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"
        />
        <div
          {...getXRProps()}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent"
        />
      </div>

      {/* Navigation */}
      <nav
        {...getXRProps()}
        className="relative bg-slate-800/90 backdrop-blur-lg border-b border-slate-700/50 shadow-2xl"
      >
        <div {...getXRProps()} className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div {...getXRProps()} className="flex justify-between items-center">
            <Link
              to="/"
              {...getXRProps()}
              className="text-2xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-wider"
            >
              YG-EXAMPLE
            </Link>
            <div {...getXRProps()} className="flex gap-4 items-center">
              {isAuthenticated && user ? (
                <>
                  <span {...getXRProps()} className="text-slate-300 text-sm">
                    Welcome,{" "}
                    <span className="text-purple-400 font-bold">
                      {user.profile.displayName}
                    </span>
                  </span>
                  <button
                    onClick={logout}
                    {...getXRProps()}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-red-500/30 hover:border-red-400/50 tracking-wider"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    {...getXRProps()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
                  >
                    LOGIN
                  </Link>
                  <Link
                    to="/auth"
                    {...getXRProps()}
                    className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-slate-500/30 hover:border-slate-400/50 tracking-wider"
                  >
                    SIGN UP
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main
        {...getXRProps()}
        className="relative max-w-7xl mx-auto px-6 lg:px-8"
      >
        {/* Hero Content */}
        <div {...getXRProps()} className="text-center py-16 sm:py-20">
          {/* Demo Placeholder */}
          <div
            {...getXRProps()}
            className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-8 mb-12 ring-1 ring-slate-700/30 max-w-4xl mx-auto"
          >
            <h2
              {...getXRProps()}
              className="text-2xl font-bold text-slate-100 mb-6 tracking-wider"
            >
              🎮 PLAYABLE DEMO
            </h2>
            <div
              {...getXRProps()}
              className="aspect-video bg-slate-700/50 rounded-xl border-2 border-slate-600 flex items-center justify-center"
            >
              <div {...getXRProps()} className="text-center">
                <div {...getXRProps()} className="text-6xl mb-4">
                  ⚡
                </div>
                <p
                  {...getXRProps()}
                  className="text-slate-300 text-lg font-medium"
                >
                  Interactive Demo Coming Soon
                </p>
                <p {...getXRProps()} className="text-slate-400 text-sm mt-2">
                  Experience the thrill of dueling right in your browser
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            {...getXRProps()}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/cardshop"
                  {...getXRProps()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-2xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider hover:scale-105 transform"
                >
                  🛒 BROWSE CARDS
                </Link>
                <Link
                  to="/deckbuilder"
                  {...getXRProps()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-2xl border border-blue-500/30 hover:border-blue-400/50 tracking-wider hover:scale-105 transform"
                >
                  🎴 BUILD DECK
                </Link>
                <Link
                  to="/game"
                  {...getXRProps()}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-2xl border border-red-500/30 hover:border-red-400/50 tracking-wider hover:scale-105 transform"
                >
                  ⚔️ START DUELING
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  {...getXRProps()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-2xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider hover:scale-105 transform"
                >
                  🚀 GET STARTED
                </Link>
                <Link
                  to="/cardshop"
                  {...getXRProps()}
                  className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-2xl border border-slate-500/30 hover:border-slate-400/50 tracking-wider hover:scale-105 transform"
                >
                  🛒 PREVIEW CARDS
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div
          {...getXRProps()}
          className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div
            {...getXRProps()}
            className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30 text-center"
          >
            <div {...getXRProps()} className="text-4xl mb-4">
              🏪
            </div>
            <h3
              {...getXRProps()}
              className="text-xl font-bold text-slate-100 mb-3 tracking-wider"
            >
              CARD SHOP
            </h3>
            <p {...getXRProps()} className="text-slate-300 leading-relaxed">
              Browse and collect thousands of authentic Yu-Gi-Oh! cards with
              advanced filtering and search capabilities.
            </p>
          </div>

          <div
            {...getXRProps()}
            className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30 text-center"
          >
            <div {...getXRProps()} className="text-4xl mb-4">
              🎴
            </div>
            <h3
              {...getXRProps()}
              className="text-xl font-bold text-slate-100 mb-3 tracking-wider"
            >
              DECK BUILDER
            </h3>
            <p {...getXRProps()} className="text-slate-300 leading-relaxed">
              Create powerful decks with our intuitive builder, complete with
              strategy suggestions and meta analysis.
            </p>
          </div>

          <div
            {...getXRProps()}
            className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30 text-center"
          >
            <div {...getXRProps()} className="text-4xl mb-4">
              ⚡
            </div>
            <h3
              {...getXRProps()}
              className="text-xl font-bold text-slate-100 mb-3 tracking-wider"
            >
              BATTLE SYSTEM
            </h3>
            <p {...getXRProps()} className="text-slate-300 leading-relaxed">
              Engage in epic duels with advanced AI or challenge players
              worldwide in real-time battles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        {...getXRProps()}
        className="relative bg-slate-800/90 backdrop-blur-lg border-t border-slate-700/50 shadow-2xl mt-16"
      >
        <div {...getXRProps()} className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div {...getXRProps()} className="text-center">
            <p {...getXRProps()} className="text-slate-400 text-sm">
              © 2024 YG-EXAMPLE. Experience the heart of the cards.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
