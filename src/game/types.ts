export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type ItemSlot = 'weapon' | 'helmet' | 'chest' | 'gloves' | 'boots' | 'accessory';

export type Stats = {
  hp: number;
  atk: number;
  def: number;
  mag: number;
  heal: number;
  crit: number;
  en: number;
  spd: number;
};

export type SkillType =
  | 'attack'
  | 'heal'
  | 'buffAtk'
  | 'buffDef'
  | 'guard'
  | 'dot'
  | 'energy';

export type Skill = {
  id: string;
  name: string;
  type: SkillType;
  cost: number;
  power: number;
  description: string;
  element?: 'slash' | 'fire' | 'holy' | 'shadow' | 'nature' | 'lightning';
};

export type Role = {
  id: string;
  name: string;
  icon: string;
  color: string;
  passive: string;
  base: Stats;
  skills: Skill[];
};

export type Equipment = Record<ItemSlot, string | null>;

export type Hero = {
  id: string;
  name: string;
  roleId: string;
  level: number;
  xp: number;
  roleLevel: number;
  roleXp: number;
  hp: number;
  en: number;
  equipment: Equipment;
};

export type Enemy = {
  id: string;
  typeId: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  en: number;
  stats: Stats;
  boss: boolean;
};

export type Item = {
  id: string;
  name: string;
  rarity: Rarity;
  slot: ItemSlot;
  price: number;
  desc: string;
  stats: Partial<Stats>;
  visual: { color: string; glow?: boolean };
};

export type Region = {
  id: string;
  name: string;
  recLevel: number;
  story: string;
  theme: { sky: string; ground: string; fx: string };
  enemies: string[];
  bossEnemy: string;
  lootTable: string[];
};

export type BattleUnitRef = { side: 'hero' | 'enemy'; id: string };

export type DamagePopup = {
  id: string;
  x: number;
  y: number;
  value: number;
  positive?: boolean;
  crit?: boolean;
  ttl: number;
};

export type BattleState = {
  regionId: string;
  wave: number;
  heroes: Hero[];
  enemies: Enemy[];
  turnIndex: number;
  selectedHeroId: string | null;
  selectedSkillId: string | null;
  log: string[];
  popups: DamagePopup[];
  victory?: boolean;
  defeat?: boolean;
};

export type SaveGame = {
  version: number;
  gameVersion: string;
  playerName: string;
  gold: number;
  team: Hero[];
  inventory: string[];
  favoriteItems: string[];
  regionProgress: Record<string, { clears: number; boss: boolean }>;
  unlockedRegions: string[];
  friendship: Record<string, number>;
  settings: {
    animations: boolean;
    battleSpeed: 'slow' | 'normal' | 'fast';
    autoSave: boolean;
    compactNumbers: boolean;
  };
  shopOffer: string[];
};
