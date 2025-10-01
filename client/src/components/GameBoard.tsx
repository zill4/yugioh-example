import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { getAssetPath } from "../utils/xr";
import { GameController } from "../game/GameController";
import type {
  GameState,
  GameCard,
  CardInPlay,
  GameAction,
} from "../game/types/GameTypes";

interface GameBoardProps {
  gameMode: string;
  onEndGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameMode, onEndGame }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardInPlay | null>(null);
  const [targetingMode, setTargetingMode] = useState<
    "attack" | "effect" | null
  >(null);
  const [pendingAction, setPendingAction] = useState<GameAction | null>(null);
  const [validTargets, setValidTargets] = useState<CardInPlay[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const gameControllerRef = useRef<GameController | null>(null);

  // Derive AI turn state from gameState to ensure consistency
  const isAITurn = useMemo(() => {
    return gameState?.currentTurn === "opponent";
  }, [gameState?.currentTurn]);

  // Memoized game logic functions to prevent stale closures
  const handleCardClick = useCallback(
    (card: CardInPlay, isPlayerCard: boolean) => {
      if (!gameControllerRef.current || !gameState || isAITurn) return;

      if (!isPlayerCard) return;

      // If a card is already selected, this might be a target selection
      if (selectedCard) {
        handleTargetClick(card);
        return;
      }

      switch (gameState.currentPhase) {
        case "Main":
        case "Battle":
          // Select monster for attack if it's on the field
          if (
            card.position === "monster" &&
            !card.attackUsed &&
            !card.summonedThisTurn
          ) {
            setSelectedCard(card);
            setTargetingMode("attack");

            // Calculate valid targets for attack
            const targets = gameState.opponent.zones.mainMonsterZones.filter(
              (target) => target !== null
            ) as CardInPlay[];
            setValidTargets(targets);

            // If no monsters to attack, add direct attack as an option
            if (targets.length === 0) {
              const directAttackTarget = {
                id: "direct-attack",
                name: "Direct Attack",
                description: "Attack opponent directly",
                cardType: "Monster" as const,
                suit: "spades" as const,
                level: "0",
                attack: card.attack || 0,
                defense: 0,
                rarity: "Common" as const,
                price: 0,
                cardNumber: "",
                imageUrl: "",
                position: "monster" as const,
                zoneIndex: -1,
                battlePosition: "attack" as const,
                faceDown: false,
                faceUp: true,
              };
              targets.push(directAttackTarget);
              setValidTargets(targets);
            }
          }
          break;
      }
    },
    [gameState, isAITurn, selectedCard]
  );

  const handleTargetClick = useCallback(
    (target: CardInPlay) => {
      if (!selectedCard || !targetingMode) return;

      // Check if this target is valid
      const isValidTarget = validTargets.some(
        (validTarget) => validTarget.id === target.id
      );

      if (!isValidTarget) return;

      // Handle direct attack case
      if (target.id === "direct-attack") {
        const action: GameAction = {
          type: "DIRECT_ATTACK",
          player: "player",
          cardId: selectedCard.id,
        };
        setPendingAction(action);
        setShowConfirmation(true);
        setValidTargets([]);
        setTargetingMode(null);
        return;
      }

      // Find the zone index of the target monster
      const targetZoneIndex =
        gameState?.opponent.zones.mainMonsterZones.findIndex(
          (monster) => monster?.id === target.id
        );

      // Create the action with target zone index
      const action: GameAction = {
        type: "ATTACK",
        player: "player",
        cardId: selectedCard.id,
        targetId:
          targetZoneIndex !== undefined && targetZoneIndex !== -1
            ? targetZoneIndex.toString()
            : undefined,
      };

      setPendingAction(action);
      setShowConfirmation(true);
      setValidTargets([]);
      setTargetingMode(null);
    },
    [selectedCard, targetingMode, validTargets, gameState]
  );

  const handleConfirmAction = useCallback(() => {
    if (!pendingAction || !gameControllerRef.current) return;

    gameControllerRef.current.executePlayerAction(pendingAction);
    setSelectedCard(null);
    setTargetingMode(null);
    setPendingAction(null);
    setShowConfirmation(false);
    setValidTargets([]);
  }, [pendingAction]);

  const handleCancelAction = useCallback(() => {
    setSelectedCard(null);
    setTargetingMode(null);
    setPendingAction(null);
    setShowConfirmation(false);
    setValidTargets([]);
  }, []);

  const handleNextPhase = useCallback(() => {
    if (!gameControllerRef.current || isAITurn) return;
    gameControllerRef.current.changePhase();
  }, [isAITurn]);

  const handleEndTurn = useCallback(() => {
    if (!gameControllerRef.current || isAITurn) return;
    gameControllerRef.current.endTurn();
  }, [isAITurn]);

  // Card Slot Component
  const CardSlot: React.FC<{
    card: CardInPlay | null;
    isOpponent?: boolean;
    zoneIndex: number;
    zoneType: "monster" | "spellTrap";
    isPlayerZone: boolean;
  }> = React.memo(({ card, isOpponent = false, isPlayerZone }) => {
    const isSelected = selectedCard?.id === card?.id;
    const isValidTarget = useMemo(() => {
      if (!card || !validTargets.length) return false;
      return validTargets.some((target) => target.id === card.id);
    }, [card, validTargets]);

    const isPlayerCard = isPlayerZone && !isOpponent;
    const canSelectForAttack = useMemo(
      () =>
        isPlayerCard &&
        card?.position === "monster" &&
        !card.attackUsed &&
        !card.summonedThisTurn &&
        gameState &&
        ["Main", "Battle"].includes(gameState.currentPhase),
      [isPlayerCard, card, gameState]
    );

    const isAttackableInBattlePhase = useMemo(
      () => canSelectForAttack && gameState?.currentPhase === "Battle",
      [canSelectForAttack, gameState?.currentPhase]
    );

    const getCardStatus = useCallback((card: CardInPlay) => {
      const status = [];
      if (card.attackUsed) status.push("Attacked");
      if (card.summonedThisTurn) status.push("Summoned");
      if (card.faceDown) status.push("Set");
      return status;
    }, []);

    return (
      <div
        onClick={card ? () => handleCardClick(card, isPlayerZone) : undefined}
        className={`
            w-24 h-32 border-rounded-md border-2 flex items-center justify-center
            transition-all duration-200 relative
            ${
              card
                ? `bg-white shadow-lg cursor-pointer`
                : `bg-transparent border-transparent`
            }
            ${
              isAITurn && isPlayerZone
                ? "ring-2 ring-opacity-75 opacity-50 cursor-not-allowed"
                : ""
            }
            ${isSelected ? "ring-2 ring-opacity-75" : ""}
            ${isValidTarget ? "ring-2  ring-opacity-75" : ""}
            ${
              isAttackableInBattlePhase && !isSelected
                ? "border-red-500 border-4 animate-pulse shadow-lg shadow-red-500/20"
                : ""
            }
            ${
              canSelectForAttack && !isSelected && !isAttackableInBattlePhase
                ? "hover:ring-2 hover:ring-green-400 hover:bg-green-50"
                : ""
            }
            ${
              !card && isValidTarget && isPlayerZone
                ? "bg-green-700/60 animate-pulse shadow-lg shadow-green-400/20"
                : ""
            }
            ${
              !card && !isValidTarget && isPlayerZone
                ? "bg-red-700/40 border-red-500"
                : ""
            }
          `}
      >
        {card && (
          <div
            className={`
                  w-full h-full border-rounded-md overflow-hidden relative
                `}
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {isOpponent ? (
              <div
                className={`w-full h-full border-rounded-md flex flex-col p-1`}
              >
                {card.faceDown ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-yellow-300 text-2xl">🂠</div>
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {card.imageUrl ? (
                      <img
                        src={getAssetPath(card.imageUrl)}
                        alt={card.name}
                        className="w-full h-full border-rounded-md opacity-80"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <div className="text-4xl opacity-60">👹</div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded"></div>
                      </>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div
                className={`w-full h-full border border-gray-800 border-rounded-md flex flex-col p-1`}
              >
                {card.faceDown ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-yellow-300 text-2xl">🂠</div>
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-yellow-400 border-rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {card.imageUrl ? (
                      <img
                        src={getAssetPath(card.imageUrl)}
                        alt={card.name}
                        className="w-full h-full border-rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <div className="text-4xl opacity-60">👹</div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent border-rounded-lg"></div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  });

  // Hand Card Component with memoization
  const HandCard: React.FC<{
    card: GameCard;
    index: number;
    isPlayerHand: boolean;
  }> = React.memo(({ card, index, isPlayerHand }) => {
    const cardInPlay = useMemo(
      () => ({ ...card, position: "hand" } as CardInPlay),
      [card]
    );

    const handleHandCardClick = useCallback(() => {
      if (isPlayerHand && !isAITurn && gameState) {
        setSelectedCard(cardInPlay);
      }
    }, [isPlayerHand, isAITurn, gameState, cardInPlay]);

    return (
      <div
        onClick={handleHandCardClick}
        className={`w-24 h-36 border-2 border-gray-800 border-rounded-md shadow-lg select-none ${
          isAITurn && isPlayerHand
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-110 hover:-translate-y-2 cursor-pointer"
        } transition-all duration-200 relative overflow-hidden`}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <div className="w-full h-full flex flex-col p-1">
          {card?.imageUrl ? (
            <img
              src={getAssetPath(card.imageUrl)}
              alt={card.name}
              className="w-full h-full border-rounded-lg"
              loading="lazy"
            />
          ) : (
            <>
              <div className="text-2xl opacity-60">👹</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent border-rounded-lg"></div>
            </>
          )}
        </div>
      </div>
    );
  });

  // Card Action Modal Component
  const CardActionModal: React.FC = () => {
    if (!selectedCard || !gameState) return null;

    const canNormalSummon = !gameState.player.hasNormalSummoned;

    const handleNormalSummon = useCallback(() => {
      if (gameControllerRef.current) {
        gameControllerRef.current.normalSummon(selectedCard.id);
        setSelectedCard(null);
      }
    }, [selectedCard.id]);

    const getSuitIcon = (suit: string) => {
      switch (suit) {
        case "hearts":
          return "♥";
        case "diamonds":
          return "♦";
        case "spades":
          return "♠";
        case "clubs":
          return "♣";
        default:
          return "◈";
      }
    };

    const getSuitColor = (suit: string) => {
      switch (suit) {
        case "hearts":
        case "diamonds":
          return "text-red-400";
        case "spades":
        case "clubs":
          return "text-slate-300";
        default:
          return "text-slate-400";
      }
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Horizontal Layout: Card Image + Details */}
        <div
          enable-xr
          className="xr-card-summon-modal flex flex-col md:flex-row"
        >
          {/* Left: Card Image - Make it as large as possible */}
          <div className="w-full md:w-2/5 p-4 flex items-center justify-center">
            <div
              className="w-full"
              style={{ aspectRatio: "3/4", maxHeight: "70vh" }}
            >
              <img
                src={getAssetPath(selectedCard.imageUrl)}
                alt={selectedCard.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/300x420/1e293b/64748b?text=CARD";
                }}
              />
            </div>
          </div>

          {/* Right: Card Details + Actions */}
          <div className="w-full md:w-3/5 p-6 flex flex-col">
            {/* Card Name */}
            <h3 className="text-2xl font-bold text-slate-100 mb-4 tracking-wide">
              {selectedCard.name}
            </h3>

            {/* Card Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider">
                  Suit
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xl ${getSuitColor(selectedCard.suit)}`}
                  >
                    {getSuitIcon(selectedCard.suit)}
                  </span>
                  <span className="text-slate-200 uppercase">
                    {selectedCard.suit}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider">
                  Level
                </div>
                <div className="text-slate-200 uppercase font-semibold">
                  {selectedCard.level}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider">
                  Attack
                </div>
                <div className="text-red-400 font-bold text-lg">
                  {selectedCard.attack}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400 text-xs uppercase tracking-wider">
                  Defense
                </div>
                <div className="text-cyan-400 font-bold text-lg">
                  {selectedCard.defense}
                </div>
              </div>
            </div>

            {/* Card Description */}
            <div className="mb-6 flex-1">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">
                Lore
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedCard.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {canNormalSummon && (
                <button
                  enable-xr
                  onClick={handleNormalSummon}
                  className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 transition-all duration-200 text-sm font-medium tracking-wide uppercase"
                >
                  Summon
                </button>
              )}
              <button
                enable-xr
                onClick={() => setSelectedCard(null)}
                className="w-full px-6 py-3 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-700 hover:border-slate-600 transition-all duration-200 text-sm font-medium tracking-wide uppercase border-rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Targeting Modal Component (only for target selection, not confirmation)
  const TargetingModal: React.FC = () => {
    if (!targetingMode || !gameState || !selectedCard || showConfirmation)
      return null;

    const handleTargetSelect = useCallback(
      (target: CardInPlay) => {
        handleTargetClick(target);
      },
      [handleTargetClick]
    );

    return (
      <div
        className={`fixed inset-0 ${
          process.env.XR_ENV === "avp" ? "" : "bg-black/50"
        } flex items-center justify-center z-50`}
      >
        <div className="border-rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 text-center">
            Select Target for Attack
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {validTargets.map((target, index) => (
              <button
                key={index}
                onClick={() => handleTargetSelect(target)}
                className="p-3 border-2 border-gray-300 hover:border-blue-500 border-rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-center">
                  {target.name}
                </div>
                <div className="text-xs text-gray-600 text-center mt-1">
                  ATK: {target.attack}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleCancelAction}
            className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white border-rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Confirmation Modal Component
  const ConfirmationModal: React.FC = () => {
    if (!showConfirmation || !pendingAction || !selectedCard) return null;

    const getBattlePreview = () => {
      switch (pendingAction.type) {
        case "ATTACK": {
          const targetIndex = pendingAction.targetId
            ? parseInt(pendingAction.targetId)
            : -1;
          const target =
            targetIndex !== -1
              ? gameState?.opponent.zones.mainMonsterZones[targetIndex]
              : null;

          if (!target) return null;

          const attackerAtk = selectedCard.attack || 0;
          const defenderAtk = target.attack || 0;
          const damage = Math.abs(attackerAtk - defenderAtk);

          let result: "attacker_wins" | "defender_wins" | "mutual_destruction";
          let resultText: string;
          let resultColor: string;

          if (attackerAtk > defenderAtk) {
            result = "attacker_wins";
            resultText = `${selectedCard.name} wins!`;
            resultColor = "text-green-600";
          } else if (defenderAtk > attackerAtk) {
            result = "defender_wins";
            resultText = `${target.name} wins!`;
            resultColor = "text-red-600";
          } else {
            result = "mutual_destruction";
            resultText = "Both monsters destroyed!";
            resultColor = "text-yellow-600";
          }

          return {
            attacker: selectedCard,
            defender: target,
            attackerAtk,
            defenderAtk,
            damage,
            result,
            resultText,
            resultColor,
            attackDifference: attackerAtk - defenderAtk,
          };
        }
        case "DIRECT_ATTACK":
          return {
            attacker: selectedCard,
            defender: null,
            attackerAtk: selectedCard.attack || 0,
            defenderAtk: 0,
            damage: selectedCard.attack || 0,
            result: "direct_attack" as const,
            resultText: `Direct attack for ${selectedCard.attack} damage!`,
            resultColor: "text-blue-600",
            attackDifference: selectedCard.attack || 0,
          };
        default:
          return null;
      }
    };

    const battlePreview = getBattlePreview();

    return (
      <div
        enable-xr
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        style={{
          ...(process.env.XR_ENV === "avp"
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
            ...(process.env.XR_ENV === "avp"
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
                            src={getAssetPath(selectedCard.imageUrl)}
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
                      <div className="text-2xl">⚔️</div>
                      <div className="text-xs uppercase tracking-wider">VS</div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs text-slate-400 uppercase tracking-wider">
                        {battlePreview?.defender ? "Defender" : "Direct Attack"}
                      </div>
                      <div
                        className="w-28"
                        style={{ aspectRatio: "3/4", maxHeight: "50vh" }}
                      >
                        {battlePreview?.defender?.imageUrl ? (
                          <img
                            src={getAssetPath(battlePreview.defender.imageUrl)}
                            alt={battlePreview.defender.name}
                            className="w-full h-full object-contain"
                          />
                        ) : battlePreview?.defender ? (
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
                        {battlePreview?.defender
                          ? battlePreview.defender.name
                          : "Opponent"}
                      </div>
                    </div>
                  </div>
                </div>

                {battlePreview && (
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
                        {battlePreview.defender ? "Defender ATK" : "Damage"}
                      </div>
                      <div className="text-cyan-400 text-2xl font-bold">
                        {battlePreview.defender
                          ? battlePreview.defenderAtk
                          : battlePreview.damage}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Result & Stats Column */}
            <div className="w-full lg:w-1/2 p-6 flex flex-col gap-6">
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">
                  Result
                </div>
                {battlePreview ? (
                  <div className="bg-slate-800/50 border border-slate-700 p-4 space-y-3 border-rounded-lg">
                    <div
                      className={`text-lg font-semibold ${battlePreview.resultColor}`}
                    >
                      {battlePreview.resultText}
                    </div>
                    {battlePreview.result === "attacker_wins" && (
                      <div className="text-slate-300 text-sm">
                        Deals {battlePreview.damage} damage to opponent
                      </div>
                    )}
                    {battlePreview.result === "defender_wins" && (
                      <div className="text-slate-300 text-sm">
                        Takes {battlePreview.damage} damage
                      </div>
                    )}
                    {battlePreview.result === "mutual_destruction" && (
                      <div className="text-slate-300 text-sm">
                        No damage dealt
                      </div>
                    )}
                    {battlePreview.result === "direct_attack" && (
                      <div className="text-slate-300 text-sm">
                        Direct attack to opponent
                      </div>
                    )}
                    {battlePreview.defender && (
                      <div className="text-xs text-slate-500">
                        Attack Difference:{" "}
                        {battlePreview.attackDifference > 0 ? "+" : ""}
                        {battlePreview.attackDifference}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">
                    No battle preview available.
                  </div>
                )}
              </div>

              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-3">
                  Defender Stats
                </div>
                <div className="bg-black/60 border border-slate-800 p-4 flex gap-4">
                  <div className="w-24 shrink-0" style={{ aspectRatio: "3/4" }}>
                    {battlePreview?.defender?.imageUrl ? (
                      <img
                        src={getAssetPath(battlePreview.defender.imageUrl)}
                        alt={battlePreview.defender.name}
                        className="w-full h-full object-contain"
                      />
                    ) : battlePreview?.defender ? (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-slate-600">
                        🛡️
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 text-center">
                        No Defender
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="text-slate-200 font-semibold">
                      {battlePreview?.defender
                        ? battlePreview.defender.name
                        : "Direct Attack"}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-slate-500 text-xs uppercase">
                          Attack
                        </div>
                        <div className="text-red-400 font-bold text-xl">
                          {battlePreview?.defenderAtk ?? 0}
                        </div>
                      </div>
                      {battlePreview?.defender && (
                        <div>
                          <div className="text-slate-500 text-xs uppercase">
                            Defense
                          </div>
                          <div className="text-cyan-400 font-bold text-xl">
                            {battlePreview.defender.defense}
                          </div>
                        </div>
                      )}
                    </div>
                    {battlePreview?.defender && (
                      <p className="text-slate-400 text-xs leading-snug line-clamp-2">
                        {battlePreview.defender.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 border-t border-slate-800 pt-4">
                <button
                  enable-xr
                  onClick={handleConfirmAction}
                  className="w-full px-6 py-3 bg-slate-100/10 hover:bg-slate-100/20 text-slate-50 border border-slate-600 transition-all duration-200 text-sm font-semibold uppercase"
                >
                  Confirm Battle
                </button>
                <button
                  enable-xr
                  onClick={handleCancelAction}
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

  // Game End Modal Component
  const GameEndModal: React.FC = () => {
    if (!showGameEndModal || !gameState?.winner) return null;

    const isPlayerWinner = gameState.winner === "player";
    const winnerName = isPlayerWinner ? "You" : "Opponent";
    const winnerColor = isPlayerWinner ? "text-green-600" : "text-red-600";

    const handlePlayAgain = () => {
      // Reset game state and hide modal
      setShowGameEndModal(false);
      setGameState(null);
      setSelectedCard(null);
      setTargetingMode(null);
      setPendingAction(null);
      setValidTargets([]);
      setShowConfirmation(false);

      // Reinitialize the game
      try {
        const controller = new GameController();
        controller.initialize({
          onGameStateChange: setGameState,
          onGameEnd: (winner: "player" | "opponent") => {
            console.log("Game ended, winner:", winner);
            setShowGameEndModal(true);
          },
          onAITurnStart: () => console.log("AI turn started"),
          onAITurnEnd: () => console.log("AI turn ended"),
          onPlayerTurnStart: () => console.log("Player turn started"),
        });
        gameControllerRef.current = controller;

        const initialGameState = controller.getGameState();
        setGameState(initialGameState);
      } catch (error) {
        console.error("Failed to restart game:", error);
      }
    };

    const handleReturnHome = () => {
      // Call the onEndGame prop to return to home
      onEndGame();
    };

    return (
      <div
        className={`fixed inset-0 ${
          process.env.XR_ENV === "avp" ? "" : "bg-black/70"
        } flex items-center justify-center z-50`}
      >
        <div className="bg-white border-rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className={`text-xl font-semibold ${winnerColor}`}>
              {winnerName} Win{winnerName === "You" ? "" : "s"}!
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handlePlayAgain}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white border-rounded-lg transition-colors font-semibold"
            >
              Play Again
            </button>
            <button
              onClick={handleReturnHome}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white border-rounded-lg transition-colors font-semibold"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    console.log("GameBoard: Initializing...");

    try {
      const controller = new GameController();

      controller.initialize({
        onGameStateChange: (newGameState) => {
          console.log("Game state changed:", newGameState);
          setGameState(newGameState);
          // Remove setIsAITurn call since it's now derived from gameState
        },
        onAITurnStart: () => {
          console.log("AI turn started");
          // Remove setIsAITurn(true) since it's now derived from gameState
        },
        onAITurnEnd: () => {
          console.log("AI turn ended");
          // Remove setIsAITurn(false) since it's now derived from gameState
        },
        onPlayerTurnStart: () => {
          console.log("Player turn started");
          // Player turn has started, UI will automatically enable player actions
          // since isAITurn is derived from gameState.currentTurn
        },
        onGameEnd: (winner) => {
          console.log("Game ended, winner:", winner);
          setShowGameEndModal(true);
        },
      });

      gameControllerRef.current = controller;

      // Get initial game state immediately after initialization
      const initialGameState = controller.getGameState();
      console.log("Initial game state retrieved:", initialGameState);
      setGameState(initialGameState);
      // Remove setIsAITurn call since it's now derived from gameState
    } catch (error) {
      console.error("Failed to initialize game:", error);
      setInitError(error instanceof Error ? error.message : "Unknown error");
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (gameControllerRef.current) {
        gameControllerRef.current = null;
      }
    };
  }, []); // Empty dependency array is correct since this should only run once

  // Error state
  if (initError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">
            Game Initialization Error
          </div>
          <div className="text-slate-300">{initError}</div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen ${
          process.env.XR_ENV === "avp" ? "" : "bg-black"
        } relative overflow-hidden`}
      >
        {/* Fixed Position Layout */}
        <div className="game-layout-grid">
          {/* Left Sidebar - Game Info */}
          <div enable-xr className="game-info-sidebar">
            <div className="space-y-4">
              <button
                onClick={onEndGame}
                className="w-full px-4 py-2 text-slate-400 text-sm font-bold transition-all duration-300"
              >
                END DUEL
              </button>

              <div>
                <div className="text-slate-400 text-xs mb-1">Your LP</div>
                <div className="text-2xl font-bold text-cyan-100">
                  {gameState.player.lifePoints}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-xs mb-1">Opponent LP</div>
                <div className="text-2xl font-bold text-red-100">
                  {gameState.opponent.lifePoints}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-xs mb-1">Phase</div>
                <div className="text-lg font-bold text-slate-400">
                  {gameState.currentPhase}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {gameState.currentPhase === "Main" &&
                    "Summon and activate cards"}
                  {gameState.currentPhase === "Battle" &&
                    "Attack with monsters"}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-xs mb-1">Turn</div>
                <div className="text-lg font-bold text-slate-400">
                  {gameState.currentTurn === "player"
                    ? "Your Turn"
                    : "Opponent's Turn"}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Turn {gameState.turnNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Center - Game Board */}
          <div className="game-board-container">
            <div>
              {/* Battle Zones Container - Only zones, not hand */}
              <div className="battle-zones-container">
                {/* Zone Rows Wrapper - Just the 4 card zone rows */}
                <div enable-xr className="zone-rows-wrapper">
                  {/* Second Row - Opponent Monster Zones */}
                  <div className="flex justify-center space-x-2 mb-4">
                    {gameState.opponent.zones.mainMonsterZones.map(
                      (card, index) => (
                        <div
                          key={`opponent-monster-${index}`}
                          className="relative"
                        >
                          <CardSlot
                            card={card}
                            isOpponent={true}
                            zoneIndex={index}
                            zoneType="monster"
                            isPlayerZone={false}
                          />
                          {!card && (
                            <div
                              enable-xr
                              className="absolute inset-0 border-rounded-md border-slate-400 flex items-center justify-center pointer-events-none"
                            >
                              <div className="text-white text-[10px] font-bold text-center leading-tight">
                                MONSTER
                                <br />
                                ZONE
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Third Row - Player Monster Zones */}
                  <div className="flex justify-center space-x-2 mb-2">
                    {gameState.player.zones.mainMonsterZones.map(
                      (card, index) => (
                        <div
                          key={`player-monster-${index}`}
                          className="relative"
                        >
                          <CardSlot
                            card={card}
                            isOpponent={false}
                            zoneIndex={index}
                            zoneType="monster"
                            isPlayerZone={true}
                          />
                          {!card && (
                            <div
                              enable-xr
                              className="absolute inset-0 border-rounded-md border-slate-400 flex items-center justify-center pointer-events-none"
                            >
                              <div className="text-white text-[10px] font-bold text-center leading-tight">
                                MONSTER
                                <br />
                                ZONE
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
                {/* End Zone Rows Wrapper */}
              </div>
              {/* End Battle Zones Container */}
            </div>
          </div>
          {/* End Center Game Board */}

          {/* Player Hand - Detached and Fixed */}
          <div enable-xr className="player-hand-container">
            {gameState.player.hand.map((card, index) => (
              <HandCard
                key={`player-hand-${index}`}
                card={card}
                index={index}
                isPlayerHand={true}
              />
            ))}
          </div>

          {/* Game Log - Fixed Position */}
          <div className="game-log-container">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 border-rounded-lg p-2 min-h-[60px]">
              <div className="text-xs text-slate-400 font-medium mb-1">
                GAME LOG
              </div>
              <div className="space-y-1 text-xs text-slate-300 max-h-12 overflow-y-auto">
                {gameState?.gameLog?.slice(-2).map((event, i) => (
                  <div key={i} className="text-[9px]">
                    {event.message}
                  </div>
                ))}
                {(!gameState?.gameLog || gameState.gameLog.length === 0) && (
                  <div className="text-[9px] text-slate-500">
                    No game events yet...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Action Buttons */}
          <div enable-xr className="game-actions-sidebar">
            <div className="space-y-3">
              <button
                onClick={handleNextPhase}
                disabled={isAITurn}
                className={`w-full text-sm font-bold transition-all duration-300 ${
                  isAITurn
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "text-slate-300"
                }`}
              >
                Next Phase
              </button>

              <button
                onClick={handleEndTurn}
                disabled={isAITurn}
                className={`w-full text-sm font-bold transition-all duration-300 ${
                  isAITurn
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "text-slate-300"
                }`}
              >
                End Turn
              </button>
            </div>
          </div>
          {/* End Right Sidebar */}
        </div>
        {/* End Fixed Position Layout */}
      </div>

      {/* Modals */}
      <CardActionModal />
      <TargetingModal />
      <ConfirmationModal />
      <GameEndModal />
    </>
  );
};

export default GameBoard;
