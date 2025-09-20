import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/UserContext";
import { sampleCards } from "../data/sampleCards";
import { getXRProps } from "../utils/xr";
import type { BaseCard, Deck } from "../types/Card";

// Template deck interface for non-authenticated users
interface TemplateDeck {
  id: string;
  name: string;
  type: string;
  cards: number;
  icon?: string;
  character?: string;
}

const deckTemplates: TemplateDeck[] = [
  // Original starter decks
  {
    id: "yugi",
    name: "Yugi's Deck",
    type: "Balanced",
    cards: 40,
    icon: "🎩",
    character: "Yugi Moto",
  },
  {
    id: "kaiba",
    name: "Kaiba's Deck",
    type: "Aggressive",
    cards: 40,
    icon: "🐲",
    character: "Seto Kaiba",
  },
  {
    id: "joey",
    name: "Joey's Deck",
    type: "Beatdown",
    cards: 40,
    icon: "🃏",
    character: "Joey Wheeler",
  },
  {
    id: "pegasus",
    name: "Pegasus' Deck",
    type: "Control",
    cards: 40,
    icon: "🎭",
    character: "Maximillion Pegasus",
  },
  // Custom decks
  {
    id: "dragons",
    name: "Dragon Lords",
    type: "Aggressive",
    cards: 42,
    icon: "🐉",
  },
  {
    id: "spellcasters",
    name: "Mystic Mages",
    type: "Control",
    cards: 40,
    icon: "🔮",
  },
  {
    id: "warriors",
    name: "Noble Knights",
    type: "Balanced",
    cards: 41,
    icon: "⚔️",
  },
  { id: "machines", name: "Cyber Army", type: "Combo", cards: 43, icon: "🤖" },
];

const DeckbuilderPage = () => {
  const {
    user,
    isAuthenticated,
    getUserDecks,
    saveDeck,
    deleteDeck,
    clearCorruptedData,
  } = useAuth();

  // Emergency clear corrupted data on component mount if needed
  React.useEffect(() => {
    // Only clear corrupted data if we detect an issue
    try {
      const decks = getUserDecks();
      // Check if any deck has invalid structure
      const hasCorruptedDecks = decks.some((deck) => {
        if (!deck.cards || !Array.isArray(deck.cards)) return true;
        return deck.cards.some(
          (card) =>
            !card ||
            typeof card !== "object" ||
            typeof card.cardId !== "string" ||
            typeof card.quantity !== "number"
        );
      });

      if (hasCorruptedDecks) {
        console.warn("Detected corrupted deck data, clearing localStorage...");
        clearCorruptedData();
      }
    } catch (error) {
      console.error("Error checking for corrupted data:", error);
      // Only clear data if there's a critical error, not for minor issues
      if (error instanceof TypeError || error instanceof ReferenceError) {
        clearCorruptedData();
      }
    }
  }, [clearCorruptedData, getUserDecks]);
  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  // Deck building state
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [selectedCard, setSelectedCard] = useState<BaseCard | null>(null);
  const [cardSearchTerm, setCardSearchTerm] = useState("");
  const [cardFilterType, setCardFilterType] = useState<string>("all");
  const [cardFilterRarity, setCardFilterRarity] = useState<string>("all");
  const [draggedCard, setDraggedCard] = useState<BaseCard | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Get user decks or show default templates
  const userDecks = useMemo(
    () => (isAuthenticated ? getUserDecks() : []),
    [isAuthenticated, getUserDecks]
  );
  const availableDecks = useMemo(
    () => (isAuthenticated ? userDecks : deckTemplates),
    [isAuthenticated, userDecks]
  );

  // Filtered cards for deck building
  const filteredCards = useMemo(() => {
    return sampleCards.filter((card) => {
      const matchesSearch =
        card.name.toLowerCase().includes(cardSearchTerm.toLowerCase()) ||
        card.description
          ?.toLowerCase()
          .includes(cardSearchTerm.toLowerCase()) ||
        false;
      const matchesType =
        cardFilterType === "all" || card.cardType === cardFilterType;
      const matchesRarity =
        cardFilterRarity === "all" || card.rarity === cardFilterRarity;
      return matchesSearch && matchesType && matchesRarity;
    });
  }, [cardSearchTerm, cardFilterType, cardFilterRarity]);

  // Deck statistics
  const deckStats = useMemo(() => {
    if (!currentDeck || !Array.isArray(currentDeck.cards)) {
      return { monsters: 0, spells: 0, traps: 0, total: 0 };
    }

    const cardCounts: { [key: string]: number } = {};
    let totalCards = 0;

    currentDeck.cards.forEach((deckCard) => {
      // Validate deckCard structure
      if (
        !deckCard ||
        typeof deckCard !== "object" ||
        typeof deckCard.cardId !== "string" ||
        typeof deckCard.quantity !== "number" ||
        deckCard.quantity <= 0
      ) {
        return; // Skip invalid cards
      }

      const card = sampleCards.find((c) => c.id === deckCard.cardId);
      if (card) {
        const type = card.cardType || "Unknown";
        cardCounts[type] = (cardCounts[type] || 0) + deckCard.quantity;
        totalCards += deckCard.quantity;
      }
    });

    return {
      monsters: cardCounts.Monster || 0,
      spells: cardCounts.Spell || 0,
      traps: cardCounts.Trap || 0,
      total: totalCards,
    };
  }, [currentDeck]);

  // Load existing deck for editing
  useEffect(() => {
    if (!selectedDeck) {
      setCurrentDeck(null);
      return;
    }

    if (isAuthenticated) {
      const deck = getUserDecks().find((d) => d.id === selectedDeck);
      if (deck) {
        // Validate deck data before setting
        const validatedDeck: Deck = {
          ...deck,
          cards: Array.isArray(deck.cards)
            ? deck.cards.filter(
                (card) =>
                  card &&
                  typeof card === "object" &&
                  typeof card.cardId === "string" &&
                  typeof card.quantity === "number" &&
                  card.quantity > 0
              )
            : [],
        };
        setCurrentDeck(validatedDeck);
      }
    } else if (user) {
      // For non-authenticated users or template decks, create a new deck
      const template = deckTemplates.find((t) => t.id === selectedDeck);
      if (template) {
        const newDeck: Deck = {
          id: `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: template.name,
          userId: user.id,
          cards: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublic: false,
          tags: [],
        };
        setCurrentDeck(newDeck);
      }
    }
  }, [selectedDeck, isAuthenticated, user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save deck
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (currentDeck && isAuthenticated) {
          // Validate minimum deck size
          const totalCards = currentDeck.cards.reduce(
            (sum, card) => sum + card.quantity,
            0
          );
          if (totalCards >= 40) {
            try {
              // Create a clean copy of the deck for saving
              const cleanDeck: Deck = {
                id: currentDeck.id,
                name: currentDeck.name,
                userId: currentDeck.userId,
                cards: currentDeck.cards.map((card) => ({
                  cardId: String(card.cardId),
                  quantity: Number(card.quantity),
                })),
                createdAt: currentDeck.createdAt,
                updatedAt: new Date().toISOString(),
                isPublic: Boolean(currentDeck.isPublic),
                tags: Array.isArray(currentDeck.tags)
                  ? [...currentDeck.tags]
                  : [],
              };

              saveDeck(cleanDeck);
              setSaveMessage({
                type: "success",
                text: "Deck saved successfully!",
              });
              setTimeout(() => setSaveMessage(null), 3000);
            } catch (error) {
              setSaveMessage({
                type: "error",
                text: "Failed to save deck. Please try again.",
              });
              setTimeout(() => setSaveMessage(null), 5000);
            }
          } else {
            setSaveMessage({
              type: "error",
              text: `Deck must have at least 40 cards. Currently has ${totalCards} cards.`,
            });
            setTimeout(() => setSaveMessage(null), 5000);
          }
        }
      }
      // Escape to clear selected card
      if (e.key === "Escape") {
        setSelectedCard(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentDeck, isAuthenticated]);

  // Deck building functions
  const addCardToDeck = (card: BaseCard) => {
    if (!currentDeck) return;

    const existingCard = currentDeck.cards.find((c) => c.cardId === card.id);
    const maxCopies = card.cardType === "Monster" ? 3 : 3; // Standard Yu-Gi-Oh! rules

    if (existingCard) {
      if (existingCard.quantity < maxCopies) {
        setCurrentDeck({
          ...currentDeck,
          cards: currentDeck.cards.map((c) =>
            c.cardId === card.id ? { ...c, quantity: c.quantity + 1 } : c
          ),
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      setCurrentDeck({
        ...currentDeck,
        cards: [...currentDeck.cards, { cardId: card.id, quantity: 1 }],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const removeCardFromDeck = (cardId: string) => {
    if (!currentDeck) return;

    const existingCard = currentDeck.cards.find((c) => c.cardId === cardId);
    if (existingCard) {
      if (existingCard.quantity > 1) {
        setCurrentDeck({
          ...currentDeck,
          cards: currentDeck.cards.map((c) =>
            c.cardId === cardId ? { ...c, quantity: c.quantity - 1 } : c
          ),
          updatedAt: new Date().toISOString(),
        });
      } else {
        setCurrentDeck({
          ...currentDeck,
          cards: currentDeck.cards.filter((c) => c.cardId !== cardId),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, card: BaseCard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (draggedCard) {
      addCardToDeck(draggedCard);
    }
  };

  const getCardInDeck = (cardId: string) => {
    return currentDeck?.cards.find((c) => c.cardId === cardId)?.quantity || 0;
  };

  // Helper function for card type icons
  const getCardTypeIcon = (cardType: string) => {
    switch (cardType) {
      case "Monster":
        return "⚔️";
      case "Spell":
        return "✨";
      case "Trap":
        return "🪤";
      default:
        return "🎴";
    }
  };

  const handleCreateDeck = () => {
    if (!isAuthenticated || !user) return;

    if (!newDeckName.trim()) return;

    const newDeck: Deck = {
      id: `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: String(newDeckName.trim()),
      userId: String(user.id),
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      tags: [],
    };

    saveDeck(newDeck);
    setNewDeckName("");
    setShowCreateForm(false);
    setSelectedDeck(newDeck.id); // Select the newly created deck
  };

  const handleDeleteDeck = (deckId: string) => {
    if (!isAuthenticated) return;
    deleteDeck(deckId);
    if (selectedDeck === deckId) {
      setSelectedDeck("");
    }
  };

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
                    <span className="text-purple-400 font-bold">
                      {user.profile.displayName}
                    </span>
                    's Decks
                  </span>
                  <Link
                    to="/cardshop"
                    {...getXRProps()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
                  >
                    CARD SHOP
                  </Link>
                  <Link
                    to="/game"
                    {...getXRProps()}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-red-500/30 hover:border-red-400/50 tracking-wider"
                  >
                    TEST DECK
                  </Link>
                </>
              ) : (
                <Link
                  to="/auth"
                  {...getXRProps()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
                >
                  LOGIN TO BUILD
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main
        {...getXRProps()}
        className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12"
      >
        {/* Header */}
        <div {...getXRProps()} className="text-center mb-12">
          <h1
            {...getXRProps()}
            className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent leading-tight"
          >
            DECK FORGE
          </h1>
          <p
            {...getXRProps()}
            className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            {isAuthenticated
              ? `Craft the perfect deck with our advanced deck building tools and strategic analysis.`
              : `Login to create and manage your own decks. Preview starter deck templates below.`}
          </p>
          {!isAuthenticated && (
            <div {...getXRProps()} className="mt-6">
              <Link
                to="/auth"
                {...getXRProps()}
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-2xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
              >
                🚀 LOGIN TO START BUILDING
              </Link>
            </div>
          )}
        </div>

        <div
          {...getXRProps()}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Deck List Panel */}
          <div {...getXRProps()} className="lg:col-span-1">
            <div
              {...getXRProps()}
              className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30"
            >
              <h2
                {...getXRProps()}
                className="text-2xl font-bold text-slate-100 mb-6 tracking-wider"
              >
                🎴 MY DECKS
              </h2>

              <div {...getXRProps()} className="space-y-4 mb-6">
                {Array.isArray(availableDecks) &&
                  availableDecks.map((deck) => {
                    // Validate deck object before rendering
                    if (
                      !deck ||
                      typeof deck !== "object" ||
                      !deck.id ||
                      !deck.name
                    ) {
                      return null; // Skip invalid decks
                    }

                    return (
                      <div
                        key={deck.id}
                        {...getXRProps()}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          selectedDeck === deck.id
                            ? "bg-purple-700/50 border-purple-500"
                            : "bg-slate-700/50 border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <div
                          {...getXRProps()}
                          className="flex items-center justify-between"
                        >
                          <div
                            {...getXRProps()}
                            className="flex-1 cursor-pointer"
                            onClick={() => setSelectedDeck(deck.id)}
                          >
                            <div
                              {...getXRProps()}
                              className="flex items-center gap-2 mb-1"
                            >
                              <span className="text-lg">
                                {(deck as any).icon || "🎴"}
                              </span>
                              <span className="font-bold text-slate-100 text-sm">
                                {String(deck.name)}
                              </span>
                            </div>
                            <div
                              {...getXRProps()}
                              className="text-xs text-slate-400"
                            >
                              {(deck as any).character
                                ? `${String((deck as any).character)} • `
                                : ""}
                              {String((deck as any).type || "Custom")} •{" "}
                              {Array.isArray((deck as any).cards)
                                ? (deck as any).cards.length
                                : 0}{" "}
                              cards
                            </div>
                          </div>
                          {isAuthenticated && (deck as any).userId && (
                            <button
                              onClick={() => handleDeleteDeck(deck.id)}
                              {...getXRProps()}
                              className="text-red-400 hover:text-red-300 text-sm p-1"
                              title="Delete deck"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {showCreateForm ? (
                <div {...getXRProps()} className="space-y-3">
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Enter deck name..."
                    {...getXRProps()}
                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all backdrop-blur-sm"
                  />
                  <div {...getXRProps()} className="flex gap-2">
                    <button
                      onClick={handleCreateDeck}
                      {...getXRProps()}
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-green-500/30 tracking-wider"
                    >
                      CREATE
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      {...getXRProps()}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-slate-500/30 tracking-wider"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() =>
                    isAuthenticated ? setShowCreateForm(true) : null
                  }
                  {...getXRProps()}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-xl border tracking-wider ${
                    isAuthenticated
                      ? "bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white border-green-500/30 hover:border-green-400/50"
                      : "bg-slate-700/50 text-slate-400 border-slate-600/50 cursor-not-allowed"
                  }`}
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated
                    ? "+ CREATE NEW DECK"
                    : "LOGIN TO CREATE DECKS"}
                </button>
              )}
            </div>
          </div>

          {/* Deck Builder Interface */}
          <div {...getXRProps()} className="lg:col-span-2">
            <div
              {...getXRProps()}
              className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30"
            >
              {currentDeck ? (
                <div>
                  {/* Header */}
                  <div
                    {...getXRProps()}
                    className="flex items-center justify-between mb-6"
                  >
                    <h2
                      {...getXRProps()}
                      className="text-2xl font-bold text-slate-100 tracking-wider"
                    >
                      🎴 {currentDeck.name}
                    </h2>
                    <div {...getXRProps()} className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!currentDeck || !isAuthenticated) return;

                          // Validate minimum deck size
                          if (deckStats.total < 40) {
                            setSaveMessage({
                              type: "error",
                              text: `Deck must have at least 40 cards. Currently has ${deckStats.total} cards.`,
                            });
                            setTimeout(() => setSaveMessage(null), 5000);
                            return;
                          }

                          try {
                            // Create a clean copy of the deck for saving
                            const cleanDeck: Deck = {
                              id: currentDeck.id,
                              name: currentDeck.name,
                              userId: currentDeck.userId,
                              cards: currentDeck.cards.map((card) => ({
                                cardId: String(card.cardId),
                                quantity: Number(card.quantity),
                              })),
                              createdAt: currentDeck.createdAt,
                              updatedAt: new Date().toISOString(),
                              isPublic: Boolean(currentDeck.isPublic),
                              tags: Array.isArray(currentDeck.tags)
                                ? [...currentDeck.tags]
                                : [],
                            };

                            saveDeck(cleanDeck);
                            setSaveMessage({
                              type: "success",
                              text: "Deck saved successfully!",
                            });
                            setTimeout(() => setSaveMessage(null), 3000);
                          } catch (error) {
                            setSaveMessage({
                              type: "error",
                              text: "Failed to save deck. Please try again.",
                            });
                            setTimeout(() => setSaveMessage(null), 5000);
                          }
                        }}
                        disabled={deckStats.total < 40}
                        {...getXRProps()}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border tracking-wider ${
                          deckStats.total >= 40
                            ? "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white border-blue-500/30"
                            : "bg-slate-700/50 text-slate-400 border-slate-600/50 cursor-not-allowed"
                        }`}
                      >
                        SAVE DECK
                      </button>
                      <button
                        {...getXRProps()}
                        className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-xl border border-slate-500/30 tracking-wider"
                      >
                        EXPORT
                      </button>
                    </div>
                  </div>

                  {/* Save Message */}
                  {saveMessage && (
                    <div
                      {...getXRProps()}
                      className={`mb-4 p-3 rounded-lg border text-center ${
                        saveMessage.type === "success"
                          ? "bg-green-900/50 border-green-600/50 text-green-200"
                          : "bg-red-900/50 border-red-600/50 text-red-200"
                      }`}
                    >
                      <p {...getXRProps()} className="text-sm font-medium">
                        {saveMessage.text}
                      </p>
                    </div>
                  )}

                  {/* Deck Stats */}
                  <div
                    {...getXRProps()}
                    className="grid grid-cols-4 gap-4 mb-6"
                  >
                    <div
                      {...getXRProps()}
                      className="bg-slate-700/50 rounded-lg p-3 text-center"
                    >
                      <div
                        {...getXRProps()}
                        className={`text-xl font-bold ${
                          deckStats.total >= 40
                            ? "text-green-400"
                            : "text-slate-100"
                        }`}
                      >
                        {deckStats.total}
                      </div>
                      <div {...getXRProps()} className="text-xs text-slate-400">
                        TOTAL CARDS
                      </div>
                      {deckStats.total < 40 && (
                        <div {...getXRProps()} className="text-xs text-red-400">
                          Need {40 - deckStats.total} more
                        </div>
                      )}
                    </div>
                    <div
                      {...getXRProps()}
                      className="bg-slate-700/50 rounded-lg p-3 text-center"
                    >
                      <div
                        {...getXRProps()}
                        className="text-xl font-bold text-blue-400"
                      >
                        {deckStats.monsters}
                      </div>
                      <div {...getXRProps()} className="text-xs text-slate-400">
                        MONSTERS
                      </div>
                    </div>
                    <div
                      {...getXRProps()}
                      className="bg-slate-700/50 rounded-lg p-3 text-center"
                    >
                      <div
                        {...getXRProps()}
                        className="text-xl font-bold text-purple-400"
                      >
                        {deckStats.spells}
                      </div>
                      <div {...getXRProps()} className="text-xs text-slate-400">
                        SPELLS
                      </div>
                    </div>
                    <div
                      {...getXRProps()}
                      className="bg-slate-700/50 rounded-lg p-3 text-center"
                    >
                      <div
                        {...getXRProps()}
                        className="text-xl font-bold text-orange-400"
                      >
                        {deckStats.traps}
                      </div>
                      <div {...getXRProps()} className="text-xs text-slate-400">
                        TRAPS
                      </div>
                    </div>
                  </div>

                  {/* Deck Builder Layout */}
                  <div
                    {...getXRProps()}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Card Selection Panel */}
                    <div {...getXRProps()} className="lg:col-span-2">
                      {/* Filters */}
                      <div
                        {...getXRProps()}
                        className="bg-slate-700/50 rounded-lg p-4 mb-4"
                      >
                        <div
                          {...getXRProps()}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                          <div>
                            <input
                              type="text"
                              placeholder="Search cards..."
                              value={cardSearchTerm}
                              onChange={(e) =>
                                setCardSearchTerm(e.target.value)
                              }
                              {...getXRProps()}
                              className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <select
                              value={cardFilterType}
                              onChange={(e) =>
                                setCardFilterType(e.target.value)
                              }
                              {...getXRProps()}
                              className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-slate-100 focus:outline-none focus:border-purple-500"
                            >
                              <option value="all">All Types</option>
                              <option value="Monster">Monsters</option>
                              <option value="Spell">Spells</option>
                              <option value="Trap">Traps</option>
                            </select>
                          </div>
                          <div>
                            <select
                              value={cardFilterRarity}
                              onChange={(e) =>
                                setCardFilterRarity(e.target.value)
                              }
                              {...getXRProps()}
                              className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500 rounded text-slate-100 focus:outline-none focus:border-purple-500"
                            >
                              <option value="all">All Rarities</option>
                              <option value="Common">Common</option>
                              <option value="Rare">Rare</option>
                              <option value="Super Rare">Super Rare</option>
                              <option value="Ultra Rare">Ultra Rare</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Card Grid */}
                      <div
                        {...getXRProps()}
                        className="bg-slate-700/30 rounded-lg p-4 max-h-96 overflow-y-auto"
                      >
                        <div
                          {...getXRProps()}
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                        >
                          {filteredCards.slice(0, 20).map((card) => {
                            const inDeck = getCardInDeck(card.id);
                            const maxCopies =
                              card.cardType === "Monster" ? 3 : 3;
                            const canAdd = inDeck < maxCopies;

                            return (
                              <div
                                key={card.id}
                                draggable={canAdd}
                                onDragStart={(e) => handleDragStart(e, card)}
                                onDragEnd={handleDragEnd}
                                onClick={() => {
                                  setSelectedCard(card);
                                  if (canAdd) addCardToDeck(card);
                                }}
                                className={`relative cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                                  canAdd
                                    ? "hover:shadow-lg hover:shadow-purple-900/30"
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                              >
                                <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-600/50">
                                  {/* Card Image */}
                                  <div className="aspect-[3/4] bg-slate-900/50 rounded mb-2 overflow-hidden">
                                    <img
                                      src={card.imageUrl}
                                      alt={card.name}
                                      data-card-id={card.id}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.src = `data:image/svg+xml;base64,${btoa(`
                                          <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                              <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
                                                <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
                                              </linearGradient>
                                            </defs>
                                            <rect width="200" height="280" fill="url(#cardBg)" rx="8"/>
                                            <rect x="15" y="15" width="170" height="250" fill="none" stroke="#475569" stroke-width="2" rx="6"/>
                                            <circle cx="100" cy="80" r="25" fill="#7c3aed" opacity="0.3"/>
                                            <text x="100" y="130" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12" font-weight="bold">PREMIUM</text>
                                            <text x="100" y="145" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12" font-weight="bold">CARD</text>
                                            <text x="100" y="220" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="8">YU-GI-OH!</text>
                                          </svg>
                                        `)}`;
                                      }}
                                    />
                                  </div>
                                  <div className="text-xs text-slate-300 text-center truncate px-1">
                                    <div className="font-bold text-slate-100 text-xs mb-1 truncate">
                                      {card.name.length > 15
                                        ? `${card.name.substring(0, 15)}...`
                                        : card.name}
                                    </div>
                                    <div className="flex items-center justify-center gap-1">
                                      <span>
                                        {getCardTypeIcon(
                                          card.cardType || "Unknown"
                                        )}
                                      </span>
                                      <span>
                                        {card.cardType === "Monster" &&
                                        card.level
                                          ? `Lv.${card.level}`
                                          : card.rarity}
                                      </span>
                                    </div>
                                  </div>
                                  {inDeck > 0 && (
                                    <div
                                      {...getXRProps()}
                                      className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                                    >
                                      {inDeck}
                                    </div>
                                  )}
                                  {!canAdd && (
                                    <div
                                      {...getXRProps()}
                                      className="absolute inset-0 bg-red-900/50 rounded-lg flex items-center justify-center"
                                    >
                                      <span className="text-red-200 text-xs font-bold">
                                        MAX
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {filteredCards.length > 20 && (
                          <div
                            {...getXRProps()}
                            className="text-center mt-4 text-slate-400 text-sm"
                          >
                            Showing 20 of {filteredCards.length} cards
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deck View Panel */}
                    <div {...getXRProps()} className="space-y-4">
                      {/* Deck Drop Zone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        {...getXRProps()}
                        className={`bg-slate-700/50 rounded-lg p-4 min-h-[300px] border-2 border-dashed transition-all duration-200 ${
                          isDragOver
                            ? "border-purple-500 bg-purple-900/20"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <div {...getXRProps()} className="text-center mb-4">
                          <div {...getXRProps()} className="text-2xl mb-2">
                            🎯
                          </div>
                          <p
                            {...getXRProps()}
                            className="text-slate-300 text-sm"
                          >
                            {isDragOver
                              ? "Drop card here!"
                              : "Drag cards here to add to deck"}
                          </p>
                        </div>

                        {/* Current Deck Cards */}
                        <div
                          {...getXRProps()}
                          className="space-y-2 max-h-[250px] overflow-y-auto"
                        >
                          {currentDeck &&
                            currentDeck.cards &&
                            Array.isArray(currentDeck.cards) &&
                            currentDeck.cards.map((deckCard) => {
                              // Validate deckCard structure before processing
                              if (
                                !deckCard ||
                                typeof deckCard !== "object" ||
                                typeof deckCard.cardId !== "string" ||
                                typeof deckCard.quantity !== "number" ||
                                deckCard.quantity <= 0
                              ) {
                                return null; // Skip invalid cards
                              }

                              const card = sampleCards.find(
                                (c) => c.id === deckCard.cardId
                              );
                              if (!card) return null;

                              return (
                                <div
                                  key={deckCard.cardId}
                                  {...getXRProps()}
                                  className="flex items-center justify-between bg-slate-800/50 rounded p-2"
                                >
                                  <div
                                    {...getXRProps()}
                                    className="flex-1 min-w-0"
                                  >
                                    <div
                                      {...getXRProps()}
                                      className="text-xs font-bold text-slate-100 truncate"
                                    >
                                      {card.name}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                      <span>
                                        {getCardTypeIcon(
                                          card.cardType || "Unknown"
                                        )}
                                      </span>
                                      <span>
                                        {card.cardType === "Monster" &&
                                        card.level
                                          ? `Lv.${card.level}`
                                          : card.cardType}
                                      </span>
                                    </div>
                                  </div>
                                  <div
                                    {...getXRProps()}
                                    className="flex items-center gap-2 ml-2"
                                  >
                                    <span
                                      {...getXRProps()}
                                      className="text-sm font-bold text-purple-400"
                                    >
                                      ×{deckCard.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        removeCardFromDeck(deckCard.cardId)
                                      }
                                      {...getXRProps()}
                                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-900/20"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        {currentDeck.cards &&
                          currentDeck.cards.length === 0 && (
                            <div
                              {...getXRProps()}
                              className="text-center text-slate-400 text-sm py-8"
                            >
                              No cards in deck yet
                            </div>
                          )}
                      </div>

                      {/* Selected Card Details */}
                      {selectedCard && (
                        <div
                          {...getXRProps()}
                          className="bg-slate-700/50 rounded-lg p-4"
                        >
                          <h3
                            {...getXRProps()}
                            className="text-lg font-bold text-slate-100 mb-2"
                          >
                            {selectedCard.name}
                          </h3>
                          <div
                            {...getXRProps()}
                            className="space-y-1 text-sm text-slate-300"
                          >
                            <div>
                              <strong>Type:</strong> {selectedCard.cardType}
                            </div>
                            {selectedCard.level && (
                              <div>
                                <strong>Level:</strong> {selectedCard.level}
                              </div>
                            )}
                            {selectedCard.attack !== undefined && (
                              <div>
                                <strong>ATK:</strong> {selectedCard.attack}
                              </div>
                            )}
                            {selectedCard.defense !== undefined && (
                              <div>
                                <strong>DEF:</strong> {selectedCard.defense}
                              </div>
                            )}
                            <div>
                              <strong>Rarity:</strong> {selectedCard.rarity}
                            </div>
                          </div>
                          <p
                            {...getXRProps()}
                            className="text-xs text-slate-400 mt-2"
                          >
                            {selectedCard.description}
                          </p>
                        </div>
                      )}

                      {/* Keyboard Shortcuts Help */}
                      <div
                        {...getXRProps()}
                        className="bg-slate-700/30 rounded-lg p-4 text-xs text-slate-400"
                      >
                        <h4
                          {...getXRProps()}
                          className="font-bold text-slate-300 mb-2"
                        >
                          Keyboard Shortcuts:
                        </h4>
                        <div {...getXRProps()} className="space-y-1">
                          <div>
                            <kbd className="bg-slate-600 px-1 rounded">
                              Ctrl+S
                            </kbd>{" "}
                            Save deck
                          </div>
                          <div>
                            <kbd className="bg-slate-600 px-1 rounded">Esc</kbd>{" "}
                            Clear selection
                          </div>
                          <div>
                            <kbd className="bg-slate-600 px-1 rounded">
                              Click
                            </kbd>{" "}
                            Select card
                          </div>
                          <div>
                            <kbd className="bg-slate-600 px-1 rounded">
                              Drag
                            </kbd>{" "}
                            Add to deck
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div {...getXRProps()} className="text-center py-16">
                  <div {...getXRProps()} className="text-8xl mb-6">
                    🎴
                  </div>
                  <h2
                    {...getXRProps()}
                    className="text-3xl font-bold text-slate-100 mb-4 tracking-wider"
                  >
                    {isAuthenticated ? "SELECT A DECK" : "PREVIEW DECKS"}
                  </h2>
                  <p {...getXRProps()} className="text-slate-300 text-lg mb-8">
                    {isAuthenticated
                      ? "Choose a deck from the sidebar to start building and customizing"
                      : "Login to create and customize your own decks"}
                  </p>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setSelectedDeck("dragons")}
                      {...getXRProps()}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-xl border border-blue-500/30 hover:border-blue-400/50 tracking-wider"
                    >
                      START BUILDING
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      {...getXRProps()}
                      className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-xl text-lg font-bold transition-all duration-300 shadow-xl border border-purple-500/30 hover:border-purple-400/50 tracking-wider"
                    >
                      LOGIN TO BUILD
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deck Building Guide */}
        <div
          {...getXRProps()}
          className="mt-12 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-600/50 shadow-2xl p-6 ring-1 ring-slate-700/30"
        >
          <h3
            {...getXRProps()}
            className="text-xl font-bold text-slate-100 mb-4 tracking-wider"
          >
            📚 DECK BUILDING GUIDE
          </h3>

          {/* Quick Requirements */}
          <div
            {...getXRProps()}
            className="bg-slate-700/50 rounded-lg p-4 mb-6"
          >
            <h4 {...getXRProps()} className="font-bold text-slate-200 mb-3">
              ⚡ Quick Requirements:
            </h4>
            <div
              {...getXRProps()}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
            >
              <div {...getXRProps()} className="bg-slate-800/50 rounded p-3">
                <div {...getXRProps()} className="text-green-400 font-bold">
                  Minimum: 40 cards
                </div>
                <div {...getXRProps()} className="text-slate-400">
                  Maximum: 60 cards
                </div>
              </div>
              <div {...getXRProps()} className="bg-slate-800/50 rounded p-3">
                <div {...getXRProps()} className="text-blue-400 font-bold">
                  Monsters: 3 copies max
                </div>
                <div {...getXRProps()} className="text-slate-400">
                  Spells/Traps: 3 copies max
                </div>
              </div>
              <div {...getXRProps()} className="bg-slate-800/50 rounded p-3">
                <div {...getXRProps()} className="text-purple-400 font-bold">
                  Save anytime
                </div>
                <div {...getXRProps()} className="text-slate-400">
                  Auto-validation
                </div>
              </div>
            </div>
          </div>

          {/* Building Tips */}
          <div
            {...getXRProps()}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-300"
          >
            <div {...getXRProps()} className="flex items-start gap-2">
              <span {...getXRProps()} className="text-purple-400 mt-1">
                🎯
              </span>
              <span>
                <strong>Strategy First:</strong> Choose your deck's main
                strategy before picking cards
              </span>
            </div>
            <div {...getXRProps()} className="flex items-start gap-2">
              <span {...getXRProps()} className="text-purple-400 mt-1">
                ⚖️
              </span>
              <span>
                <strong>Balance Types:</strong> Mix monsters, spells, and traps
                for flexibility
              </span>
            </div>
            <div {...getXRProps()} className="flex items-start gap-2">
              <span {...getXRProps()} className="text-purple-400 mt-1">
                🔄
              </span>
              <span>
                <strong>Synergy:</strong> Cards should work together, not
                compete
              </span>
            </div>
            <div {...getXRProps()} className="flex items-start gap-2">
              <span {...getXRProps()} className="text-purple-400 mt-1">
                📊
              </span>
              <span>
                <strong>Resource Management:</strong> Consider card costs and
                summoning requirements
              </span>
            </div>
            <div {...getXRProps()} className="flex items-start gap-2">
              <span {...getXRProps()} className="text-purple-400 mt-1">
                🎲
              </span>
              <span>
                <strong>Test & Iterate:</strong> Playtest your deck and adjust
                based on results
              </span>
            </div>
            <div {...getXRProps()} className="flex items-start gap-2">
              <span {...getXRProps()} className="text-purple-400 mt-1">
                💾
              </span>
              <span>
                <strong>Save Frequently:</strong> Use Ctrl+S to save your
                progress anytime
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeckbuilderPage;
