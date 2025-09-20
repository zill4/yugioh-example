import type { GameCard } from "../types/GameTypes";

// Sample Monster Cards
export const sampleMonsters: GameCard[] = [
  {
    id: "blue-eyes-white-dragon",
    name: "Blue-Eyes White Dragon",
    type: "monster",
    attack: 3000,
    defense: 2500,
    level: 8,
    attribute: "LIGHT",
    monsterType: "Dragon",
    cardType: "Normal Monster",
  },
  {
    id: "dark-magician",
    name: "Dark Magician",
    type: "monster",
    attack: 2500,
    defense: 2100,
    level: 7,
    attribute: "DARK",
    monsterType: "Spellcaster",
    cardType: "Normal Monster",
  },
  {
    id: "summoned-skull",
    name: "Summoned Skull",
    type: "monster",
    attack: 2500,
    defense: 1200,
    level: 6,
    attribute: "DARK",
    monsterType: "Fiend",
    cardType: "Normal Monster",
  },
  {
    id: "celtic-guardian",
    name: "Celtic Guardian",
    type: "monster",
    attack: 1400,
    defense: 1200,
    level: 4,
    attribute: "EARTH",
    monsterType: "Warrior",
    cardType: "Normal Monster",
  },
  {
    id: "harpie-lady",
    name: "Harpie Lady",
    type: "monster",
    attack: 1300,
    defense: 1400,
    level: 4,
    attribute: "WIND",
    monsterType: "Winged Beast",
    cardType: "Normal Monster",
  },
];

// Sample Spell Cards
export const sampleSpells: GameCard[] = [
  {
    id: "dark-hole",
    name: "Dark Hole",
    type: "spell",
    cardType: "Normal Spell",
  },
  {
    id: "pot-of-greed",
    name: "Pot of Greed",
    type: "spell",
    cardType: "Normal Spell",
  },
  {
    id: "mystical-space-typhoon",
    name: "Mystical Space Typhoon",
    type: "spell",
    cardType: "Quick-Play Spell",
  },
  {
    id: "swords-of-revealing-light",
    name: "Swords of Revealing Light",
    type: "spell",
    cardType: "Normal Spell",
  },
];

// Sample Trap Cards
export const sampleTraps: GameCard[] = [
  {
    id: "mirror-force",
    name: "Mirror Force",
    type: "trap",
    cardType: "Normal Trap",
  },
  {
    id: "solemn-judgment",
    name: "Solemn Judgment",
    type: "trap",
    cardType: "Counter Trap",
  },
  {
    id: "torrential-tribute",
    name: "Torrential Tribute",
    type: "trap",
    cardType: "Normal Trap",
  },
];

// Preselected Player Deck (Blue-Eyes Deck)
export const playerDeck: GameCard[] = [
  ...sampleMonsters.slice(0, 3), // 3 Blue-Eyes, Dark Magician, Summoned Skull
  ...sampleMonsters.slice(3), // Celtic Guardian, Harpie Lady
  ...sampleSpells.slice(0, 3), // Dark Hole, Pot of Greed, MST
  ...sampleTraps.slice(0, 2), // Mirror Force, Torrential Tribute
];

// Preselected AI Deck (Mixed Deck)
export const aiDeck: GameCard[] = [
  ...sampleMonsters, // All monsters
  ...sampleSpells, // All spells
  ...sampleTraps, // All traps
];

// Shuffle function
export function shuffleDeck(deck: GameCard[]): GameCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
