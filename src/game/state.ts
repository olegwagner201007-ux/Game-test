import { ITEMS, ROLES } from './data';
import type { Hero, Item, ItemSlot, SaveGame, Stats } from './types';

const uid = () => Math.random().toString(36).slice(2, 10);

export const xpNeed = (level: number) => 45 + level * level * 15;
export const roleXpNeed = (level: number) => 30 + level * 24;

export function getRole(roleId: string) {
  return ROLES.find((r) => r.id === roleId) ?? ROLES[0];
}

export function createHero(name: string, roleId: string): Hero {
  const role = getRole(roleId);
  return {
    id: uid(),
    name: name || role.name,
    roleId,
    level: 1,
    xp: 0,
    roleLevel: 1,
    roleXp: 0,
    hp: role.base.hp,
    en: role.base.en,
    equipment: { weapon: null, helmet: null, chest: null, gloves: null, boots: null, accessory: null }
  };
}

export function calculateStats(hero: Hero): Stats {
  const role = getRole(hero.roleId);
  const levelGain = hero.level - 1;
  const roleGain = hero.roleLevel - 1;
  const out: Stats = { ...role.base };
  out.hp += Math.floor(levelGain * 12 + roleGain * 6);
  out.atk += Math.floor(levelGain * 1.8 + roleGain * 1.1);
  out.def += Math.floor(levelGain * 1.4 + roleGain * 1.1);
  out.mag += Math.floor(levelGain * 1.5 + roleGain * 1.2);
  out.heal += Math.floor(levelGain * 1.4 + roleGain * 1.2);
  out.en += Math.floor(levelGain * 2.5 + roleGain * 1.5);
  out.crit += Math.floor(levelGain * 0.25);
  out.spd += Math.floor(levelGain * 0.45);

  (Object.keys(hero.equipment) as ItemSlot[]).forEach((slot) => {
    const itemId = hero.equipment[slot];
    if (!itemId) return;
    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    Object.entries(item.stats).forEach(([k, v]) => {
      const key = k as keyof Stats;
      out[key] += v ?? 0;
    });
  });
  return out;
}

export function equipItem(hero: Hero, item: Item): Hero {
  return { ...hero, equipment: { ...hero.equipment, [item.slot]: item.id } };
}

export function autoEquip(hero: Hero, inventory: string[]): Hero {
  let next = hero;
  (Object.keys(hero.equipment) as ItemSlot[]).forEach((slot) => {
    const candidates = inventory.map((id) => ITEMS.find((it) => it.id === id)).filter((x): x is Item => !!x && x.slot === slot);
    if (!candidates.length) return;
    const best = candidates.sort((a, b) => itemPower(b) - itemPower(a))[0];
    next = equipItem(next, best);
  });
  return next;
}

export function itemPower(item: Item) {
  const s = item.stats;
  return (s.atk ?? 0) * 2 + (s.def ?? 0) * 2 + (s.hp ?? 0) * 0.2 + (s.mag ?? 0) * 1.6 + (s.heal ?? 0) * 1.5 + (s.en ?? 0) * 0.9 + (s.crit ?? 0) * 1.8 + (s.spd ?? 0) * 1.1;
}

export function gainXp(hero: Hero, xp: number): { hero: Hero; up: string[] } {
  const next = { ...hero };
  const up: string[] = [];
  next.xp += xp;
  next.roleXp += Math.floor(xp * 0.7);
  while (next.level < 30 && next.xp >= xpNeed(next.level)) {
    next.xp -= xpNeed(next.level);
    next.level += 1;
    up.push(`Level ${next.level}`);
  }
  while (next.roleLevel < 30 && next.roleXp >= roleXpNeed(next.roleLevel)) {
    next.roleXp -= roleXpNeed(next.roleLevel);
    next.roleLevel += 1;
    up.push(`Rollen-Level ${next.roleLevel}`);
  }
  const maxHp = calculateStats(next).hp;
  next.hp = Math.min(maxHp, next.hp + Math.floor(maxHp * 0.25));
  return { hero: next, up };
}

export function defaultSave(): SaveGame {
  return {
    version: 4,
    gameVersion: 'v3 Pseudo-3D Update',
    playerName: '',
    gold: 120,
    team: [],
    inventory: ['iron_blade', 'iron_helm'],
    favoriteItems: [],
    regionProgress: { meadow: { clears: 0, boss: false } },
    unlockedRegions: ['meadow'],
    friendship: {},
    settings: { animations: true, battleSpeed: 'normal', autoSave: true, compactNumbers: false },
    shopOffer: []
  };
}
