export type ResourceKey = 'dirt' | 'stone' | 'scrap' | 'metal' | 'gold';

export type BlockTypeId =
  | 'dirt'
  | 'stone'
  | 'scrapMetal'
  | 'reinforcedConcrete'
  | 'oldPipes'
  | 'goldVein'
  | 'prisonFoundation'
  | 'outerWall';

export type ToolId =
  | 'spoon'
  | 'sharpSpoon'
  | 'rustyPickaxe'
  | 'reinforcedPickaxe'
  | 'silentDrill'
  | 'prisonBreakerDrill';

export type UpgradeId =
  | 'digPower'
  | 'digSpeed'
  | 'maxEnergy'
  | 'energyRegen'
  | 'bagSize'
  | 'suspicionReduction'
  | 'noiseControl'
  | 'tunnelStability';

export type QuestId =
  | 'dig10'
  | 'depth25'
  | 'firstUpgrade'
  | 'scrap100'
  | 'surviveGuardCheck'
  | 'reachEscapeTunnel';

export type AchievementId =
  | 'firstGold'
  | 'depth50'
  | 'nightMiner'
  | 'firstEscape';

export interface BlockType {
  id: BlockTypeId;
  name: string;
  color: string;
  hp: number;
  loot: Partial<Record<ResourceKey, number>>;
  energyCost: number;
  noise: number;
}

export interface Tool {
  id: ToolId;
  name: string;
  digPower: number;
  noiseMult: number;
  unlockDepth: number;
  cost: Partial<Record<ResourceKey, number>>;
}

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  desc: string;
  baseCost: Partial<Record<ResourceKey, number>>;
  scaling: number;
}

export interface QuestDef {
  id: QuestId;
  title: string;
  desc: string;
  rewardGold: number;
}

export interface AchievementDef {
  id: AchievementId;
  title: string;
  desc: string;
  reward: Partial<Record<ResourceKey, number>>;
}

export interface GameState {
  depth: number;
  escaped: boolean;
  runs: number;
  escapeTokens: number;
  resources: Record<ResourceKey, number>;
  energy: number;
  maxEnergy: number;
  suspicion: number;
  bagUsed: number;
  tool: ToolId;
  upgrades: Record<UpgradeId, number>;
  currentBlock: {
    type: BlockTypeId;
    hp: number;
    maxHp: number;
  };
  dayProgress: number;
  isNight: boolean;
  guardChecksSurvived: number;
  totalBlocksDug: number;
  totalGoldFound: number;
  questsCompleted: QuestId[];
  achievements: AchievementId[];
  particles: boolean;
  sound: boolean;
  reducedAnimations: boolean;
  log: string[];
  tempNightShift: number;
}
