import { useMemo, useState } from 'react';
import { ITEMS } from '../game/data';
import { itemPower } from '../game/state';
import type { Hero, ItemSlot, Rarity } from '../game/types';

type Props = {
  inventory: string[];
  hero: Hero | null;
  onEquip: (itemId: string) => void;
  onSell: (itemId: string) => void;
  onAutoEquip: () => void;
  favoriteItems: string[];
  onToggleFav: (itemId: string) => void;
};

export function Inventory({ inventory, hero, onEquip, onSell, onAutoEquip, favoriteItems, onToggleFav }: Props) {
  const [slotFilter, setSlotFilter] = useState<ItemSlot | 'all'>('all');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all');

  const items = useMemo(() => inventory.map((id) => ITEMS.find((i) => i.id === id)).filter(Boolean).filter((x): x is NonNullable<typeof x> => !!x)
    .filter((x) => slotFilter === 'all' ? true : x.slot === slotFilter)
    .filter((x) => rarityFilter === 'all' ? true : x.rarity === rarityFilter)
    .sort((a, b) => itemPower(b) - itemPower(a)), [inventory, rarityFilter, slotFilter]);

  return (
    <div className="panel">
      <h3>Inventar</h3>
      <div className="row">
        <select value={slotFilter} onChange={(e) => setSlotFilter(e.target.value as ItemSlot | 'all')}>
          <option value="all">Alle Slots</option>
          <option value="weapon">Waffe</option><option value="helmet">Helm</option><option value="chest">Brust</option><option value="gloves">Handschuhe</option><option value="boots">Schuhe</option><option value="accessory">Accessoire</option>
        </select>
        <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value as Rarity | 'all')}>
          <option value="all">Alle Seltenheiten</option>
          <option value="Common">Common</option><option value="Rare">Rare</option><option value="Epic">Epic</option><option value="Legendary">Legendary</option>
        </select>
        <button onClick={onAutoEquip} disabled={!hero}>Beste Ausrüstung</button>
      </div>
      <div className="cards">
        {items.map((item, idx) => (
          <div className={`itemCard ${item.rarity}`} key={`${item.id}-${idx}`}>
            <h4>{item.name} {favoriteItems.includes(item.id) ? '🔒' : ''}</h4>
            <div>{item.slot} · {item.rarity}</div>
            <small>{item.desc}</small>
            <div>Power: {Math.round(itemPower(item))}</div>
            <div className="small">Stats: {Object.entries(item.stats).map(([k, v]) => `${k} +${v}`).join(', ')}</div>
            <div className="row">
              <button onClick={() => onEquip(item.id)} disabled={!hero}>Ausrüsten</button>
              <button onClick={() => onSell(item.id)} disabled={favoriteItems.includes(item.id)}>Verkaufen</button>
              <button onClick={() => onToggleFav(item.id)}>{favoriteItems.includes(item.id) ? 'Unlock' : 'Lock'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
