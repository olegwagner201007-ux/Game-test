import type { Enemy, Item, Region, Role, Stats } from './types';

export const GAME_VERSION = 'v3 Pseudo-3D Update';
export const SAVE_VERSION = 4;

const s = (hp: number, atk: number, def: number, mag: number, heal: number, crit: number, en: number, spd: number): Stats => ({ hp, atk, def, mag, heal, crit, en, spd });

export const ROLES: Role[] = [
  { id: 'sword', name: 'Schwertheld', icon: '⚔️', color: '#ef4444', passive: 'Mehr Slash-Schaden', base: s(125, 18, 11, 4, 4, 10, 36, 10), skills: [{ id: 'slash', name: 'Slash', type: 'attack', cost: 4, power: 1.2, description: 'Schneller Schwerthieb', element: 'slash' }, { id: 'guardPose', name: 'Wachstellung', type: 'buffDef', cost: 6, power: 0.25, description: 'DEF erhöhen' }, { id: 'cross', name: 'Kreuzhieb', type: 'attack', cost: 10, power: 2.0, description: 'Starker Treffer', element: 'slash' }] },
  { id: 'mage', name: 'Magier', icon: '🔮', color: '#a78bfa', passive: 'Magieskills +10%', base: s(88, 10, 7, 23, 8, 12, 48, 11), skills: [{ id: 'fireball', name: 'Feuerball', type: 'attack', cost: 7, power: 1.6, description: 'Feuerprojektil', element: 'fire' }, { id: 'spark', name: 'Funkenregen', type: 'attack', cost: 9, power: 1.9, description: 'Arkaner Burst', element: 'lightning' }, { id: 'focus', name: 'Manafokus', type: 'energy', cost: 0, power: 0.35, description: 'Energie regen' }] },
  { id: 'healer', name: 'Heiler', icon: '💠', color: '#34d399', passive: 'Heilung +15%', base: s(95, 8, 8, 14, 20, 8, 50, 9), skills: [{ id: 'lightHeal', name: 'Lichtheilung', type: 'heal', cost: 7, power: 1.4, description: 'Heilkreis', element: 'holy' }, { id: 'ward', name: 'Schutzsegen', type: 'buffDef', cost: 8, power: 0.22, description: 'Team DEF+' }, { id: 'holyRay', name: 'Heilstrahl', type: 'attack', cost: 11, power: 1.7, description: 'Heiliges Licht', element: 'holy' }] },
  { id: 'shadow', name: 'Schattenläufer', icon: '🗡️', color: '#6366f1', passive: 'Hohe Kritchance', base: s(92, 20, 8, 10, 5, 20, 40, 14), skills: [{ id: 'dash', name: 'Schatten-Dash', type: 'attack', cost: 6, power: 1.4, description: 'Dunkler Sprint', element: 'shadow' }, { id: 'poison', name: 'Giftwolke', type: 'dot', cost: 8, power: 0.25, description: 'DOT auf Gegner' }, { id: 'ambush', name: 'Hinterhalt', type: 'attack', cost: 11, power: 2.1, description: 'Krit-freundlich' }] },
  { id: 'tank', name: 'Tank', icon: '🛡️', color: '#60a5fa', passive: '10% weniger Schaden', base: s(165, 12, 18, 5, 4, 6, 34, 7), skills: [{ id: 'taunt', name: 'Provozieren', type: 'guard', cost: 5, power: 0.2, description: 'Aggro ziehen' }, { id: 'shield', name: 'Schildwall', type: 'buffDef', cost: 7, power: 0.35, description: 'Hoher Def Buff' }, { id: 'bash', name: 'Schildstoß', type: 'attack', cost: 8, power: 1.3, description: 'Stumpfer Schlag' }] },
  { id: 'musician', name: 'Musiker', icon: '🎵', color: '#f472b6', passive: 'Team EN-Regeneration', base: s(102, 11, 10, 13, 12, 10, 44, 10), skills: [{ id: 'song', name: 'Mutlied', type: 'buffAtk', cost: 6, power: 0.2, description: 'ATK Buff' }, { id: 'rhythm', name: 'Rhythmusschlag', type: 'attack', cost: 6, power: 1.4, description: 'Klangwelle' }, { id: 'melody', name: 'Ruhemelodie', type: 'heal', cost: 9, power: 1.0, description: 'Kleine Teamheilung' }] },
  { id: 'cook', name: 'Koch', icon: '🍳', color: '#f59e0b', passive: 'Nach Kampf Team-Heilung', base: s(112, 16, 11, 8, 12, 9, 40, 9), skills: [{ id: 'pan', name: 'Pfannenhieb', type: 'attack', cost: 5, power: 1.35, description: 'Pfannenhieb' }, { id: 'soup', name: 'Suppe', type: 'heal', cost: 8, power: 1.25, description: 'Wärmt auf' }, { id: 'flame', name: 'Flambieren', type: 'attack', cost: 10, power: 1.9, description: 'Feuer-Effekt', element: 'fire' }] },
  { id: 'beast', name: 'Bestienfreund', icon: '🐾', color: '#22d3ee', passive: 'Assist-Chance höher', base: s(108, 18, 10, 10, 9, 12, 39, 11), skills: [{ id: 'fang', name: 'Fanghieb', type: 'attack', cost: 5, power: 1.4, description: 'Tierangriff' }, { id: 'pack', name: 'Rudelruf', type: 'buffAtk', cost: 7, power: 0.2, description: 'Team ATK+' }, { id: 'howl', name: 'Wolfsheulen', type: 'dot', cost: 8, power: 0.2, description: 'Verängstigt Gegner' }] },
  { id: 'rune', name: 'Runenmeister', icon: '📜', color: '#38bdf8', passive: 'Debuffs stärker', base: s(98, 14, 9, 20, 11, 11, 46, 10), skills: [{ id: 'runeBreak', name: 'Bruchrune', type: 'attack', cost: 7, power: 1.5, description: 'Runenstoß' }, { id: 'runeWard', name: 'Runenschild', type: 'buffDef', cost: 7, power: 0.25, description: 'Schutzrune' }, { id: 'void', name: 'Leerriss', type: 'attack', cost: 12, power: 2.2, description: 'Arkanes Loch', element: 'shadow' }] },
  { id: 'cannon', name: 'Kanonier', icon: '💣', color: '#f97316', passive: 'Kritschaden +20%', base: s(101, 22, 9, 10, 7, 15, 36, 10), skills: [{ id: 'shot', name: 'Kartätsche', type: 'attack', cost: 6, power: 1.55, description: 'Schrotangriff' }, { id: 'smoke', name: 'Rauchwand', type: 'buffDef', cost: 7, power: 0.18, description: 'Team schützen' }, { id: 'bomb', name: 'Bombardement', type: 'attack', cost: 13, power: 2.3, description: 'Große Explosion', element: 'fire' }] },
  { id: 'nature', name: 'Naturwächter', icon: '🌿', color: '#22c55e', passive: 'Regeneration', base: s(118, 15, 12, 14, 14, 9, 42, 9), skills: [{ id: 'vine', name: 'Rankenhieb', type: 'attack', cost: 6, power: 1.35, description: 'Natur-Angriff', element: 'nature' }, { id: 'bark', name: 'Borkenhaut', type: 'buffDef', cost: 8, power: 0.3, description: 'Def Buff' }, { id: 'bloom', name: 'Blütensegen', type: 'heal', cost: 10, power: 1.3, description: 'Heilung', element: 'nature' }] },
  { id: 'dream', name: 'Traumweber', icon: '🌙', color: '#c084fc', passive: '10% Ausweichchance', base: s(90, 13, 8, 21, 13, 14, 52, 12), skills: [{ id: 'orb', name: 'Traum-Orb', type: 'attack', cost: 7, power: 1.55, description: 'Orb-Projektil' }, { id: 'mist', name: 'Nebel', type: 'dot', cost: 7, power: 0.2, description: 'Schatten DOT' }, { id: 'night', name: 'Sternennacht', type: 'buffAtk', cost: 11, power: 0.25, description: 'Team ATK hoch' }] }
];

export const ITEMS: Item[] = [
  { id: 'flame_sword', name: 'Flammenschwert', rarity: 'Epic', slot: 'weapon', price: 380, desc: 'Brennende Klinge', stats: { atk: 8, crit: 4 }, visual: { color: '#f97316', glow: true } },
  { id: 'holy_staff', name: 'Heiliger Stab', rarity: 'Legendary', slot: 'weapon', price: 620, desc: 'Leuchtende Heilmagie', stats: { mag: 8, heal: 10, en: 10 }, visual: { color: '#fde68a', glow: true } },
  { id: 'iron_helm', name: 'Eisenhelm', rarity: 'Common', slot: 'helmet', price: 80, desc: 'Solider Helm', stats: { def: 4, hp: 8 }, visual: { color: '#9ca3af' } },
  { id: 'shadow_robe', name: 'Schattenrobe', rarity: 'Rare', slot: 'chest', price: 180, desc: 'Dunkle Robe', stats: { mag: 4, def: 3, en: 5 }, visual: { color: '#4f46e5' } },
  { id: 'crystal_armor', name: 'Kristallrüstung', rarity: 'Epic', slot: 'chest', price: 390, desc: 'Kristallplatten', stats: { hp: 25, def: 9 }, visual: { color: '#38bdf8', glow: true } },
  { id: 'thorn_gloves', name: 'Dornenhandschuhe', rarity: 'Rare', slot: 'gloves', price: 170, desc: 'Naturdetails', stats: { atk: 3, spd: 2 }, visual: { color: '#22c55e' } },
  { id: 'swift_boots', name: 'Windschuhe', rarity: 'Rare', slot: 'boots', price: 170, desc: 'Mehr Tempo', stats: { spd: 5, en: 4 }, visual: { color: '#93c5fd' } },
  { id: 'mask_charm', name: 'Masken-Amulett', rarity: 'Legendary', slot: 'accessory', price: 700, desc: 'Starker Glow', stats: { crit: 8, atk: 6, hp: 20 }, visual: { color: '#fb7185', glow: true } },
  { id: 'iron_blade', name: 'Eisenklinge', rarity: 'Common', slot: 'weapon', price: 90, desc: 'Einsteigerklinge', stats: { atk: 3 }, visual: { color: '#d1d5db' } },
  { id: 'field_cap', name: 'Feldkappe', rarity: 'Common', slot: 'helmet', price: 75, desc: 'Leicht und robust', stats: { hp: 6, def: 2 }, visual: { color: '#86efac' } }
];

export const REGIONS: Region[] = [
  { id: 'meadow', name: 'Sonnenwiese', recLevel: 1, story: 'Grüne Felder, erste Schatten.', theme: { sky: '#7dd3fc', ground: '#22c55e', fx: '#fde047' }, enemies: ['slime', 'mushling'], bossEnemy: 'mask_boss', lootTable: ['iron_blade', 'field_cap', 'iron_helm'] },
  { id: 'fungi', name: 'Pilzwald', recLevel: 4, story: 'Pilze und Giftmonster.', theme: { sky: '#5b21b6', ground: '#166534', fx: '#a3e635' }, enemies: ['mushling', 'harpy'], bossEnemy: 'mask_boss', lootTable: ['shadow_robe', 'thorn_gloves', 'swift_boots'] },
  { id: 'crystal', name: 'Kristallhöhlen', recLevel: 8, story: 'Hartes Terrain, blaue Lichter.', theme: { sky: '#0ea5e9', ground: '#1e293b', fx: '#67e8f9' }, enemies: ['crystal_golem', 'harpy'], bossEnemy: 'mask_boss', lootTable: ['crystal_armor', 'flame_sword'] },
  { id: 'storm', name: 'Sturmklippen', recLevel: 12, story: 'Wind und Blitze.', theme: { sky: '#94a3b8', ground: '#334155', fx: '#f8fafc' }, enemies: ['harpy', 'shadow_knight'], bossEnemy: 'mask_boss', lootTable: ['flame_sword', 'mask_charm'] },
  { id: 'shadow', name: 'Schattenburg', recLevel: 16, story: 'Finale gegen den Schattenkönig.', theme: { sky: '#111827', ground: '#3f3f46', fx: '#ef4444' }, enemies: ['shadow_knight', 'mask_boss'], bossEnemy: 'shadow_king', lootTable: ['holy_staff', 'mask_charm'] }
];

export const ENEMY_TEMPLATES: Record<string, Omit<Enemy, 'id' | 'hp' | 'maxHp'>> = {
  slime: { typeId: 'slime', name: 'Schleim', level: 1, en: 25, stats: s(70, 10, 5, 3, 0, 2, 25, 6), boss: false },
  mushling: { typeId: 'mushling', name: 'Pilzmonster', level: 3, en: 30, stats: s(85, 12, 7, 5, 0, 4, 30, 8), boss: false },
  crystal_golem: { typeId: 'crystal_golem', name: 'Kristallgolem', level: 8, en: 40, stats: s(130, 18, 14, 5, 0, 6, 35, 5), boss: false },
  harpy: { typeId: 'harpy', name: 'Windharpyie', level: 10, en: 45, stats: s(110, 20, 9, 8, 0, 10, 45, 13), boss: false },
  shadow_knight: { typeId: 'shadow_knight', name: 'Schattenritter', level: 14, en: 50, stats: s(160, 24, 17, 10, 0, 12, 50, 8), boss: false },
  mask_boss: { typeId: 'mask_boss', name: 'Maskenboss', level: 12, en: 60, stats: s(220, 28, 16, 14, 0, 12, 60, 9), boss: true },
  shadow_king: { typeId: 'shadow_king', name: 'Schattenkönig', level: 20, en: 80, stats: s(360, 40, 24, 20, 0, 18, 80, 10), boss: true }
};

export const rarityWeight: Record<string, number> = { Common: 56, Rare: 28, Epic: 13, Legendary: 3 };
