import { SAVE_VERSION } from './data';
import { defaultSave } from './state';
import type { SaveGame } from './types';

const SAVE_KEY = 'asterfall_save_v4';
const LEGACY_KEYS = ['asterfall_save_v3', 'asterfall_save_v2', 'asterfall_save_v1'];

export function saveGame(save: SaveGame) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function loadGame(): SaveGame {
  let raw: unknown = null;
  try {
    raw = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
  } catch {
    raw = null;
  }
  if (!raw) {
    for (const key of LEGACY_KEYS) {
      try {
        const value = JSON.parse(localStorage.getItem(key) ?? 'null');
        if (value) {
          raw = value;
          break;
        }
      } catch {
        // ignored
      }
    }
  }
  return repairSave(migrateSave(raw));
}

export function migrateSave(raw: unknown): SaveGame {
  const base = defaultSave();
  if (!raw || typeof raw !== 'object') return base;
  const legacy = raw as Record<string, unknown>;
  const maybeTeam = Array.isArray(legacy.team) ? legacy.team : [];
  return {
    ...base,
    playerName: typeof legacy.playerName === 'string' ? legacy.playerName : typeof (legacy.player as { name?: string } | undefined)?.name === 'string' ? ((legacy.player as { name: string }).name ?? '') : '',
    gold: typeof legacy.gold === 'number' ? legacy.gold : typeof (legacy.player as { gold?: number } | undefined)?.gold === 'number' ? (legacy.player as { gold: number }).gold : base.gold,
    team: maybeTeam as SaveGame['team'],
    inventory: Array.isArray(legacy.inventory) ? (legacy.inventory as string[]) : Array.isArray(legacy.bag) ? (legacy.bag as string[]) : base.inventory,
    unlockedRegions: Array.isArray(legacy.unlockedRegions) ? (legacy.unlockedRegions as string[]) : Array.isArray(legacy.unlockedAreas) ? (legacy.unlockedAreas as string[]) : base.unlockedRegions,
    regionProgress: (legacy.regionProgress as SaveGame['regionProgress']) ?? (legacy.areaProgress as SaveGame['regionProgress']) ?? base.regionProgress,
    settings: { ...base.settings, ...(legacy.settings as Partial<SaveGame['settings']>) },
    friendship: (legacy.friendship as SaveGame['friendship']) ?? base.friendship,
    shopOffer: Array.isArray(legacy.shopOffer) ? (legacy.shopOffer as string[]) : base.shopOffer,
    favoriteItems: Array.isArray(legacy.favoriteItems) ? (legacy.favoriteItems as string[]) : base.favoriteItems,
    gameVersion: typeof legacy.gameVersion === 'string' ? legacy.gameVersion : base.gameVersion,
    version: typeof legacy.version === 'number' ? legacy.version : SAVE_VERSION
  };
}

export function repairSave(save: SaveGame): SaveGame {
  const base = defaultSave();
  const safe = { ...base, ...save };
  safe.version = SAVE_VERSION;
  safe.team = Array.isArray(safe.team) ? safe.team : [];
  safe.inventory = Array.isArray(safe.inventory) ? safe.inventory : [];
  safe.unlockedRegions = Array.isArray(safe.unlockedRegions) && safe.unlockedRegions.length ? safe.unlockedRegions : ['meadow'];
  safe.regionProgress = safe.regionProgress && typeof safe.regionProgress === 'object' ? safe.regionProgress : base.regionProgress;
  safe.settings = { ...base.settings, ...safe.settings };
  safe.friendship = safe.friendship && typeof safe.friendship === 'object' ? safe.friendship : {};
  safe.shopOffer = Array.isArray(safe.shopOffer) ? safe.shopOffer : [];
  safe.favoriteItems = Array.isArray(safe.favoriteItems) ? safe.favoriteItems : [];
  return safe;
}
