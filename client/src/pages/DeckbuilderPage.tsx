import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/UserContext";
import { sampleCards } from "../data/sampleCards";
import { getXRProps } from "../utils/xr";
import type { BaseCard, Deck } from "../types/Card";
import Layout from "../components/Layout";

interface TemplateDeck {
  id: string;
  name: string;
  type: string;
  cards: number;
  icon?: string;
  character?: string;
}

const deckTemplates: TemplateDeck[] = [
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

  useEffect(() => {
    try {
      const decks = getUserDecks();
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
      if (hasCorruptedDecks) clearCorruptedData();
    } catch {
      clearCorruptedData();
    }
  }, [clearCorruptedData, getUserDecks]);

  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

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

  const userDecks = useMemo(
    () => (isAuthenticated ? getUserDecks() : []),
    [isAuthenticated, getUserDecks]
  );
  const availableDecks = useMemo(
    () => (isAuthenticated ? userDecks : deckTemplates),
    [isAuthenticated, userDecks]
  );

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

  const deckStats = useMemo(() => {
    if (!currentDeck || !Array.isArray(currentDeck.cards)) {
      return { monsters: 0, spells: 0, traps: 0, total: 0 };
    }
    const cardCounts: { [key: string]: number } = {};
    let totalCards = 0;
    currentDeck.cards.forEach((deckCard) => {
      if (
        !deckCard ||
        typeof deckCard !== "object" ||
        typeof deckCard.cardId !== "string" ||
        typeof deckCard.quantity !== "number" ||
        deckCard.quantity <= 0
      ) {
        return;
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

  useEffect(() => {
    if (!selectedDeck) {
      setCurrentDeck(null);
      return;
    }
    if (isAuthenticated) {
      const deck = getUserDecks().find((d) => d.id === selectedDeck);
      if (deck) {
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
  }, [selectedDeck, isAuthenticated, user, getUserDecks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (currentDeck && isAuthenticated) {
          const totalCards = currentDeck.cards.reduce(
            (sum, card) => sum + card.quantity,
            0
          );
          if (totalCards >= 40) {
            try {
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
            } catch {
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
      if (e.key === "Escape") {
        setSelectedCard(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentDeck, isAuthenticated, saveDeck]);

  const addCardToDeck = (card: BaseCard) => {
    if (!currentDeck) return;
    const existingCard = currentDeck.cards.find((c) => c.cardId === card.id);
    const maxCopies = 3;
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
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (draggedCard) addCardToDeck(draggedCard);
  };

  const getCardInDeck = (cardId: string) =>
    currentDeck?.cards.find((c) => c.cardId === cardId)?.quantity || 0;

  return (
    <Layout header="DECK BUILDER">
      <div {...getXRProps()} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deck List */}
        <div
          {...getXRProps()}
          className="lg:col-span-1 border border-slate-700 p-6"
        >
          <div {...getXRProps()} className="mb-4 text-slate-200 tracking-wider">
            MY DECKS
          </div>
          <div {...getXRProps()} className="space-y-2 mb-4">
            {Array.isArray(availableDecks) &&
              availableDecks.map((deck) => {
                if (!deck || typeof deck !== "object" || !deck.id || !deck.name)
                  return null;
                return (
                  <button
                    key={deck.id}
                    onClick={() => setSelectedDeck(deck.id)}
                    {...getXRProps()}
                    className={`w-full text-left px-3 py-2 border border-slate-700 ${
                      selectedDeck === deck.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="mr-2">{(deck as any).icon || "🎴"}</span>
                    <span className="font-semibold">{String(deck.name)}</span>
                  </button>
                );
              })}
          </div>

          {showCreateForm ? (
            <div {...getXRProps()} className="space-y-2">
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Enter deck name..."
                {...getXRProps()}
                className="w-full px-3 py-2 bg-black border border-slate-700 text-slate-100"
              />
              <div {...getXRProps()} className="flex gap-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated || !user || !newDeckName.trim())
                      return;
                    const newDeck: Deck = {
                      id: `deck_${Date.now()}_${Math.random()
                        .toString(36)
                        .substr(2, 9)}`,
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
                    setSelectedDeck(newDeck.id);
                  }}
                  {...getXRProps()}
                  className="flex-1 py-2 px-4 border border-slate-700 text-slate-100 hover:bg-slate-900"
                >
                  CREATE
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  {...getXRProps()}
                  className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-900"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => (isAuthenticated ? setShowCreateForm(true) : null)}
              {...getXRProps()}
              className={`w-full py-3 px-4 border text-sm font-bold tracking-wider ${
                isAuthenticated
                  ? "border-slate-700 text-slate-100 hover:bg-slate-900"
                  : "border-slate-800 text-slate-500 cursor-not-allowed"
              }`}
              disabled={!isAuthenticated}
            >
              {isAuthenticated ? "+ CREATE NEW DECK" : "LOGIN TO CREATE DECKS"}
            </button>
          )}
        </div>

        {/* Builder */}
        <div
          {...getXRProps()}
          className="lg:col-span-2 border border-slate-700 p-6"
        >
          {currentDeck ? (
            <div>
              <div
                {...getXRProps()}
                className="flex items-center justify-between mb-4"
              >
                <div {...getXRProps()} className="font-bold tracking-wider">
                  {currentDeck.name}
                </div>
                <div {...getXRProps()} className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!currentDeck || !isAuthenticated) return;
                      if (deckStats.total < 40) {
                        setSaveMessage({
                          type: "error",
                          text: `Deck must have at least 40 cards. Currently has ${deckStats.total} cards.`,
                        });
                        setTimeout(() => setSaveMessage(null), 5000);
                        return;
                      }
                      try {
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
                      } catch {
                        setSaveMessage({
                          type: "error",
                          text: "Failed to save deck. Please try again.",
                        });
                        setTimeout(() => setSaveMessage(null), 5000);
                      }
                    }}
                    disabled={deckStats.total < 40}
                    {...getXRProps()}
                    className={`px-4 py-2 border text-sm tracking-wider ${
                      deckStats.total >= 40
                        ? "border-slate-700 text-slate-100 hover:bg-slate-900"
                        : "border-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    SAVE DECK
                  </button>
                </div>
              </div>

              {saveMessage && (
                <div
                  {...getXRProps()}
                  className={`mb-4 p-3 border text-center ${
                    saveMessage.type === "success"
                      ? "border-green-600 text-green-300"
                      : "border-red-600 text-red-300"
                  }`}
                >
                  <p {...getXRProps()} className="text-sm">
                    {saveMessage.text}
                  </p>
                </div>
              )}

              <div {...getXRProps()} className="grid grid-cols-4 gap-4 mb-6">
                <div
                  {...getXRProps()}
                  className="bg-black border border-slate-700 p-3 text-center"
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
                    TOTAL
                  </div>
                </div>
                <div
                  {...getXRProps()}
                  className="bg-black border border-slate-700 p-3 text-center"
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
                  className="bg-black border border-slate-700 p-3 text-center"
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
                  className="bg-black border border-slate-700 p-3 text-center"
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

              <div
                {...getXRProps()}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div {...getXRProps()} className="lg:col-span-2">
                  <div
                    {...getXRProps()}
                    className="border border-slate-700 p-4 mb-4"
                  >
                    <div
                      {...getXRProps()}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                      <input
                        type="text"
                        placeholder="Search cards..."
                        value={cardSearchTerm}
                        onChange={(e) => setCardSearchTerm(e.target.value)}
                        {...getXRProps()}
                        className="w-full px-3 py-2 bg-black border border-slate-700 text-slate-100"
                      />
                      <select
                        value={cardFilterType}
                        onChange={(e) => setCardFilterType(e.target.value)}
                        {...getXRProps()}
                        className="w-full px-3 py-2 bg-black border border-slate-700 text-slate-100"
                      >
                        <option value="all">All Types</option>
                        <option value="Monster">Monsters</option>
                        <option value="Spell">Spells</option>
                        <option value="Trap">Traps</option>
                      </select>
                      <select
                        value={cardFilterRarity}
                        onChange={(e) => setCardFilterRarity(e.target.value)}
                        {...getXRProps()}
                        className="w-full px-3 py-2 bg-black border border-slate-700 text-slate-100"
                      >
                        <option value="all">All Rarities</option>
                        <option value="Common">Common</option>
                        <option value="Rare">Rare</option>
                        <option value="Super Rare">Super Rare</option>
                        <option value="Ultra Rare">Ultra Rare</option>
                      </select>
                    </div>
                  </div>

                  <div
                    {...getXRProps()}
                    className="border border-slate-700 p-4 max-h-96 overflow-y-auto"
                  >
                    <div
                      {...getXRProps()}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                    >
                      {filteredCards.slice(0, 20).map((card) => {
                        const inDeck = getCardInDeck(card.id);
                        const maxCopies = 3;
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
                            className={`relative cursor-pointer ${
                              canAdd
                                ? "hover:opacity-90"
                                : "opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <div className="bg-black border border-slate-700 p-2">
                              <div className="aspect-[3/4] bg-slate-900 border border-slate-800 mb-2 overflow-hidden">
                                <img
                                  src={card.imageUrl}
                                  alt={card.name}
                                  data-card-id={card.id}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `data:image/svg+xml;base64,${btoa(
                                      `<svg width='200' height='280' xmlns='http://www.w3.org/2000/svg'><rect width='200' height='280' fill='#0b0b0b'/><rect x='15' y='15' width='170' height='250' fill='none' stroke='#334155' stroke-width='2'/><text x='100' y='140' text-anchor='middle' fill='#64748b' font-family='Arial' font-size='12' font-weight='bold'>CARD IMAGE</text></svg>`
                                    )}`;
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
                                    {card.cardType === "Monster"
                                      ? "⚔️"
                                      : card.cardType === "Spell"
                                      ? "✨"
                                      : card.cardType === "Trap"
                                      ? "🪤"
                                      : "🎴"}
                                  </span>
                                  <span>
                                    {card.cardType === "Monster" && card.level
                                      ? `Lv.${card.level}`
                                      : card.rarity}
                                  </span>
                                </div>
                              </div>
                              {inDeck > 0 && (
                                <div
                                  {...getXRProps()}
                                  className="absolute -top-2 -right-2 bg-purple-600 text-white w-6 h-6 flex items-center justify-center text-xs font-bold"
                                >
                                  {inDeck}
                                </div>
                              )}
                              {!canAdd && (
                                <div
                                  {...getXRProps()}
                                  className="absolute inset-0 bg-red-900/50 flex items-center justify-center"
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

                <div {...getXRProps()} className="space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    {...getXRProps()}
                    className={`border border-dashed p-4 min-h-[300px] ${
                      isDragOver
                        ? "border-purple-500 bg-purple-900/10"
                        : "border-slate-700"
                    }`}
                  >
                    <div {...getXRProps()} className="text-center mb-4">
                      <div {...getXRProps()} className="text-2xl mb-2">
                        🎯
                      </div>
                      <p {...getXRProps()} className="text-slate-300 text-sm">
                        {isDragOver
                          ? "Drop card here!"
                          : "Drag cards here to add to deck"}
                      </p>
                    </div>
                    <div
                      {...getXRProps()}
                      className="space-y-2 max-h-[250px] overflow-y-auto"
                    >
                      {currentDeck &&
                        currentDeck.cards &&
                        Array.isArray(currentDeck.cards) &&
                        currentDeck.cards.map((deckCard) => {
                          if (
                            !deckCard ||
                            typeof deckCard !== "object" ||
                            typeof deckCard.cardId !== "string" ||
                            typeof deckCard.quantity !== "number" ||
                            deckCard.quantity <= 0
                          ) {
                            return null;
                          }
                          const card = sampleCards.find(
                            (c) => c.id === deckCard.cardId
                          );
                          if (!card) return null;
                          return (
                            <div
                              key={deckCard.cardId}
                              {...getXRProps()}
                              className="flex items-center justify-between bg-black border border-slate-700 p-2"
                            >
                              <div {...getXRProps()} className="flex-1 min-w-0">
                                <div
                                  {...getXRProps()}
                                  className="text-xs font-bold text-slate-100 truncate"
                                >
                                  {card.name}
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                  <span>
                                    {card.cardType === "Monster"
                                      ? "⚔️"
                                      : card.cardType === "Spell"
                                      ? "✨"
                                      : card.cardType === "Trap"
                                      ? "🪤"
                                      : "🎴"}
                                  </span>
                                  <span>
                                    {card.cardType === "Monster" && card.level
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
                                  className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      {currentDeck?.cards && currentDeck.cards.length === 0 && (
                        <div
                          {...getXRProps()}
                          className="text-center text-slate-400 text-sm py-8"
                        >
                          No cards in deck yet
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedCard && (
                    <div
                      {...getXRProps()}
                      className="border border-slate-700 p-4"
                    >
                      <div
                        {...getXRProps()}
                        className="text-lg font-bold text-slate-100 mb-2"
                      >
                        {selectedCard.name}
                      </div>
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

                  <div
                    {...getXRProps()}
                    className="border border-slate-700 p-4 text-xs text-slate-400"
                  >
                    <div
                      {...getXRProps()}
                      className="font-bold text-slate-300 mb-2"
                    >
                      Keyboard Shortcuts
                    </div>
                    <div {...getXRProps()} className="space-y-1">
                      <div>
                        <kbd className="bg-slate-800 px-1">Ctrl+S</kbd> Save
                        deck
                      </div>
                      <div>
                        <kbd className="bg-slate-800 px-1">Esc</kbd> Clear
                        selection
                      </div>
                      <div>
                        <kbd className="bg-slate-800 px-1">Click</kbd> Select
                        card
                      </div>
                      <div>
                        <kbd className="bg-slate-800 px-1">Drag</kbd> Add to
                        deck
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div {...getXRProps()} className="text-center py-16">
              <div {...getXRProps()} className="text-6xl mb-4">
                🎴
              </div>
              <div {...getXRProps()} className="text-slate-300 mb-6">
                {isAuthenticated ? "SELECT A DECK" : "PREVIEW DECKS"}
              </div>
              {isAuthenticated ? (
                <button
                  onClick={() => setSelectedDeck("dragons")}
                  {...getXRProps()}
                  className="px-8 py-3 border border-slate-700 text-slate-100 hover:bg-slate-900"
                >
                  START BUILDING
                </button>
              ) : (
                <Link
                  to="/auth"
                  {...getXRProps()}
                  className="px-8 py-3 border border-slate-700 text-slate-100 hover:bg-slate-900 inline-block"
                >
                  LOGIN TO BUILD
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DeckbuilderPage;
