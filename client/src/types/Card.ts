// Yu-Gi-Oh! Card Types inspired by the actual game mechanics

export type CardType = "Monster" | "Spell" | "Trap";

export type MonsterType =
  | "Warrior"
  | "Spellcaster"
  | "Dragon"
  | "Beast"
  | "Machine"
  | "Fiend"
  | "Zombie"
  | "Aqua"
  | "Pyro"
  | "Rock"
  | "Winged Beast"
  | "Plant"
  | "Insect"
  | "Thunder"
  | "Dinosaur"
  | "Sea Serpent"
  | "Reptile"
  | "Psychic"
  | "Divine-Beast"
  | "Creator God"
  | "Wyrm"
  | "Cyberse";

export type Attribute =
  | "DARK"
  | "LIGHT"
  | "WATER"
  | "FIRE"
  | "EARTH"
  | "WIND"
  | "DIVINE";

export type SpellType =
  | "Normal"
  | "Quick-Play"
  | "Continuous"
  | "Ritual"
  | "Field"
  | "Equip";
export type TrapType = "Normal" | "Continuous" | "Counter";

export type Rarity =
  | "Common"
  | "Rare"
  | "Super Rare"
  | "Ultra Rare"
  | "Secret Rare"
  | "Ghost Rare";

export interface BaseCard {
  id: string;
  name: string;
  description?: string;
  cardType?: CardType;
  monsterType?: MonsterType;
  attribute?: Attribute;
  rarity?: Rarity;
  imageUrl?: string;
  price?: number;
  inStock?: boolean;
  setCode?: string;
  cardNumber?: string;
  spellType?: SpellType;
  trapType?: TrapType;
  level?: number;
  attack?: number;
  defense?: number;
  pendulumScale?: number;
  linkRating?: number;
  linkArrows?: string[];
}

// TODO: Not being implemented yet
export interface MonsterCard extends BaseCard {
  cardType: "Monster";
  monsterType: MonsterType;
  attribute: Attribute;
  level: number;
  attack: number;
  defense: number;
  pendulumScale?: number;
  linkRating?: number;
  linkArrows?: string[];
}

export interface SpellCard extends BaseCard {
  cardType: "Spell";
  spellType: SpellType;
}

export interface TrapCard extends BaseCard {
  cardType: "Trap";
  trapType: TrapType;
}

export type Card = MonsterCard | SpellCard | TrapCard;

// Chess-inspired strategic elements for deck building
export interface DeckStrategy {
  name: string;
  description: string;
  keyCards: string[];
  winCondition: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}
