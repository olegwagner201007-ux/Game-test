import type {
  AchievementDef,
  BlockType,
  BlockTypeId,
  QuestDef,
  Tool,
  UpgradeDef,
  UpgradeId,
  ResourceKey
} from './types';

export const RESOURCE_KEYS: ResourceKey[] = ['dirt', 'stone', 'scrap', 'metal', 'gold'];

export const BLOCK_TYPES: BlockType[] = [
  { id: 'dirt', name: 'Erde', color: '#6e4e37', hp: 12, loot: { dirt: 4 }, energyCost: 2, noise: 2 },
  { id: 'stone', name: 'Stein', color: '#6b7280', hp: 20, loot: { stone: 3, dirt: 1 }, energyCost: 3, noise: 3 },
  { id: 'scrapMetal', name: 'Metallreste', color: '#8b8f97', hp: 28, loot: { scrap: 4, stone: 2 }, energyCost: 4, noise: 4 },
  { id: 'reinforcedConcrete', name: 'Verstärkter Beton', color: '#4b5563', hp: 40, loot: { stone: 5, scrap: 2 }, energyCost: 5, noise: 6 },
  { id: 'oldPipes', name: 'Alte Rohre', color: '#9a6b45', hp: 34, loot: { metal: 3, scrap: 3 }, energyCost: 5, noise: 5 },
  { id: 'goldVein', name: 'Goldader', color: '#d4a017', hp: 48, loot: { gold: 6, stone: 2 }, energyCost: 6, noise: 6 },
  { id: 'prisonFoundation', name: 'Gefängnisfundament', color: '#1f2937', hp: 62, loot: { metal: 5, scrap: 4 }, energyCost: 7, noise: 7 },
  { id: 'outerWall', name: 'Outer Wall', color: '#0f172a', hp: 120, loot: { metal: 12, gold: 7 }, energyCost: 10, noise: 10 }
];

export const TOOLS: Tool[] = [
  { id: 'spoon', name: 'Spoon', digPower: 2, noiseMult: 0.95, unlockDepth: 0, cost: {} },
  { id: 'sharpSpoon', name: 'Sharpened Spoon', digPower: 4, noiseMult: 1, unlockDepth: 8, cost: { dirt: 80, scrap: 20 } },
  { id: 'rustyPickaxe', name: 'Rusty Pickaxe', digPower: 8, noiseMult: 1.1, unlockDepth: 18, cost: { stone: 100, scrap: 70 } },
  { id: 'reinforcedPickaxe', name: 'Reinforced Pickaxe', digPower: 14, noiseMult: 1.15, unlockDepth: 35, cost: { metal: 120, stone: 150 } },
  { id: 'silentDrill', name: 'Silent Drill', digPower: 24, noiseMult: 0.75, unlockDepth: 55, cost: { metal: 260, gold: 80 } },
  { id: 'prisonBreakerDrill', name: 'Prison Breaker Drill', digPower: 40, noiseMult: 0.85, unlockDepth: 75, cost: { metal: 420, gold: 180 } }
];

export const UPGRADES: UpgradeDef[] = [
  { id: 'digPower', name: 'Dig Power', desc: '+20% Schaden pro Level', baseCost: { dirt: 40, stone: 15 }, scaling: 1.45 },
  { id: 'digSpeed', name: 'Dig Speed', desc: 'Click Bonus +10% pro Level', baseCost: { scrap: 25, stone: 20 }, scaling: 1.5 },
  { id: 'maxEnergy', name: 'Max Energy', desc: '+12 Energie', baseCost: { dirt: 30, scrap: 25 }, scaling: 1.55 },
  { id: 'energyRegen', name: 'Energy Regen', desc: '+0.25/s Energie Regen', baseCost: { stone: 40, scrap: 20 }, scaling: 1.5 },
  { id: 'bagSize', name: 'Bag Size', desc: '+60 Kapazität', baseCost: { dirt: 50, stone: 20 }, scaling: 1.45 },
  { id: 'suspicionReduction', name: 'Suspicion Reduction', desc: '-12% Suspicion Gain', baseCost: { scrap: 50, metal: 15 }, scaling: 1.6 },
  { id: 'noiseControl', name: 'Noise Control', desc: '-10% Grab-Lärm', baseCost: { scrap: 60, metal: 20 }, scaling: 1.6 },
  { id: 'tunnelStability', name: 'Tunnel Stability', desc: 'Benötigt für Escape', baseCost: { stone: 120, metal: 40 }, scaling: 1.8 }
];

export const QUESTS: QuestDef[] = [
  { id: 'dig10', title: 'Dig 10 blocks', desc: 'Baue insgesamt 10 Blöcke ab.', rewardGold: 8 },
  { id: 'depth25', title: 'Reach depth 25', desc: 'Erreiche Tiefe 25.', rewardGold: 14 },
  { id: 'firstUpgrade', title: 'Buy first upgrade', desc: 'Kaufe ein Upgrade.', rewardGold: 10 },
  { id: 'scrap100', title: 'Collect 100 scrap', desc: 'Sammle 100 Scrap.', rewardGold: 24 },
  { id: 'surviveGuardCheck', title: 'Survive first guard check', desc: 'Überlebe einen Guard Check.', rewardGold: 20 },
  { id: 'reachEscapeTunnel', title: 'Reach escape tunnel', desc: 'Erreiche Tiefe 100.', rewardGold: 50 }
];

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'firstGold', title: 'Gold Digger', desc: 'Finde dein erstes Gold.', reward: { gold: 5 } },
  { id: 'depth50', title: 'Halfway Freedom', desc: 'Erreiche Tiefe 50.', reward: { metal: 30 } },
  { id: 'nightMiner', title: 'Night Miner', desc: 'Baue 30 Blöcke nachts ab.', reward: { scrap: 40 } },
  { id: 'firstEscape', title: 'First Escape', desc: 'Entkomme einmal.', reward: { gold: 25, metal: 50 } }
];

export const ESCAPE_TOKEN_UPGRADES = [
  { id: 'tokenEnergy', name: '+20 Start-Energy', cost: 2 },
  { id: 'tokenPower', name: '+25% permanenter Dig Power', cost: 3 },
  { id: 'tokenStealth', name: '-15% permanenter Suspicion Gain', cost: 3 }
] as const;

export function pickBlockType(depth: number): BlockTypeId {
  if (depth >= 100) return 'outerWall';
  const r = Math.random();
  if (depth < 10) return r < 0.75 ? 'dirt' : 'stone';
  if (depth < 25) return r < 0.45 ? 'stone' : r < 0.78 ? 'scrapMetal' : 'oldPipes';
  if (depth < 45) return r < 0.3 ? 'scrapMetal' : r < 0.7 ? 'reinforcedConcrete' : 'oldPipes';
  if (depth < 70) return r < 0.25 ? 'oldPipes' : r < 0.5 ? 'goldVein' : 'prisonFoundation';
  return r < 0.45 ? 'prisonFoundation' : r < 0.75 ? 'goldVein' : 'reinforcedConcrete';
}

export const STORAGE_KEY = 'dig-to-escape-prison-save-v1';
