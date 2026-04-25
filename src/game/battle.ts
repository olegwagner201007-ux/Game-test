import { ENEMY_TEMPLATES, ITEMS, REGIONS, ROLES, rarityWeight } from './data';
import { calculateStats, getRole } from './state';
import type { BattleState, BattleUnitRef, Enemy, Hero, Item, Skill, Stats } from './types';

const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

type Buffs = Record<string, { atk: number; def: number; guard: boolean; dot: number }>;

export function startBattle(regionId: string, party: Hero[], boss = false): BattleState {
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0];
  const enemyIds = boss ? [region.bossEnemy] : [region.enemies[Math.floor(Math.random() * region.enemies.length)], region.enemies[Math.floor(Math.random() * region.enemies.length)]];
  const enemies = enemyIds.map((id) => spawnEnemy(id));
  return {
    regionId,
    wave: boss ? 4 : 1,
    heroes: structuredClone(party),
    enemies,
    turnIndex: 0,
    selectedHeroId: party[0]?.id ?? null,
    selectedSkillId: null,
    log: [`${region.name}: Kampf startet!`],
    popups: []
  };
}

export function spawnEnemy(typeId: string): Enemy {
  const t = ENEMY_TEMPLATES[typeId] ?? ENEMY_TEMPLATES.slime;
  return { id: uid(), typeId: t.typeId, name: t.name, level: t.level, hp: t.stats.hp, maxHp: t.stats.hp, en: t.en, stats: t.stats, boss: t.boss };
}

export function resolveAttack(state: BattleState, actor: BattleUnitRef, skill: Skill, targetId: string): BattleState {
  const next = structuredClone(state);
  const buffs: Buffs = {};

  next.heroes.forEach((h) => {
    buffs[h.id] = { atk: 0, def: 0, guard: false, dot: 0 };
  });
  next.enemies.forEach((e) => {
    buffs[e.id] = { atk: 0, def: 0, guard: false, dot: 0 };
  });

  if (actor.side === 'hero') {
    const hero = next.heroes.find((h) => h.id === actor.id);
    if (!hero || hero.hp <= 0) return next;
    const role = getRole(hero.roleId);
    const hs = calculateStats(hero);
    if (hero.en < skill.cost) {
      next.log.unshift(`${hero.name}: zu wenig Energie.`);
      return next;
    }
    hero.en -= skill.cost;

    const targetEnemy = next.enemies.find((e) => e.id === targetId) ?? next.enemies[0];
    const targetHero = next.heroes.find((h) => h.id === targetId) ?? next.heroes[0];

    if (skill.type === 'attack' && targetEnemy) {
      const dmg = rollDamage(hs, targetEnemy.stats, hs.crit + role.base.crit);
      targetEnemy.hp = clamp(targetEnemy.hp - dmg.value, 0, targetEnemy.maxHp);
      next.popups.push({ id: uid(), x: 0.73, y: 0.35, value: dmg.value, crit: dmg.crit, ttl: 60 });
      next.log.unshift(`${hero.name} nutzt ${skill.name}: ${dmg.value}${dmg.crit ? ' KRIT!' : ''}`);
    }
    if (skill.type === 'heal' && targetHero) {
      const heal = Math.floor(hs.heal * skill.power + hs.mag * 0.4 + 12);
      const maxHp = calculateStats(targetHero).hp;
      targetHero.hp = clamp(targetHero.hp + heal, 0, maxHp);
      next.popups.push({ id: uid(), x: 0.24, y: 0.68, value: heal, positive: true, ttl: 60 });
      next.log.unshift(`${hero.name} heilt ${targetHero.name} um ${heal}.`);
    }
    if (skill.type === 'buffAtk') next.log.unshift(`${hero.name} stärkt das Team.`);
    if (skill.type === 'buffDef') next.log.unshift(`${hero.name} errichtet Schutz.`);
    if (skill.type === 'guard') next.log.unshift(`${hero.name} zieht Angriffe auf sich.`);
  }

  if (next.enemies.every((e) => e.hp <= 0)) {
    next.victory = true;
    next.log.unshift('Sieg!');
    return next;
  }

  enemyTurn(next);

  if (next.heroes.every((h) => h.hp <= 0)) {
    next.defeat = true;
    next.log.unshift('Niederlage...');
  }

  return next;
}

function enemyTurn(state: BattleState) {
  const livingEnemies = state.enemies.filter((e) => e.hp > 0);
  const livingHeroes = state.heroes.filter((h) => h.hp > 0);
  if (!livingEnemies.length || !livingHeroes.length) return;

  livingEnemies.forEach((enemy) => {
    const hero = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];
    const hs = calculateStats(hero);
    const hit = rollDamage(enemy.stats, hs, enemy.stats.crit);
    hero.hp = clamp(hero.hp - hit.value, 0, hs.hp);
    state.log.unshift(`${enemy.name} trifft ${hero.name} für ${hit.value}.`);
    state.popups.push({ id: uid(), x: 0.26, y: 0.62, value: hit.value, ttl: 60, crit: hit.crit });
  });

  state.heroes.forEach((h) => {
    const st = calculateStats(h);
    h.en = clamp(h.en + 2, 0, st.en);
  });
}

function rollDamage(att: Stats, def: Stats, critChance: number) {
  const crit = Math.random() * 100 < critChance;
  let value = Math.floor(att.atk * 1.15 + att.mag * 0.4 - def.def * 0.55 + Math.random() * 6);
  if (crit) value = Math.floor(value * 1.45);
  return { value: Math.max(1, value), crit };
}

export function generateLoot(regionId: string, boss: boolean): Item | null {
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0];
  const possible = ITEMS.filter((it) => region.lootTable.includes(it.id));
  if (!possible.length) return null;
  if (boss) {
    const bossPool = possible.filter((i) => i.rarity !== 'Common');
    return (bossPool.length ? bossPool : possible)[Math.floor(Math.random() * (bossPool.length ? bossPool.length : possible.length))];
  }
  if (Math.random() > 0.4) return null;
  return possible[Math.floor(Math.random() * possible.length)];
}

export function randomShopOffer(storyDepth: number) {
  const count = 6;
  const out: string[] = [];
  const boost = Math.min(storyDepth * 2, 20);
  for (let i = 0; i < count; i++) {
    const roll = Math.random() * 100;
    const weights = {
      Common: Math.max(25, rarityWeight.Common - boost),
      Rare: rarityWeight.Rare + Math.floor(boost * 0.5),
      Epic: rarityWeight.Epic + Math.floor(boost * 0.35),
      Legendary: rarityWeight.Legendary + Math.floor(boost * 0.1)
    };
    const selected = roll < weights.Legendary ? 'Legendary' : roll < weights.Legendary + weights.Epic ? 'Epic' : roll < weights.Legendary + weights.Epic + weights.Rare ? 'Rare' : 'Common';
    const item = ITEMS.filter((x) => x.rarity === selected)[Math.floor(Math.random() * ITEMS.filter((x) => x.rarity === selected).length)] ?? ITEMS[0];
    out.push(item.id);
  }
  return out;
}
