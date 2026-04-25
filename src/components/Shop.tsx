import { ITEMS } from '../game/data';

type Props = {
  gold: number;
  offer: string[];
  onBuy: (itemId: string) => void;
  onReroll: () => void;
};

export function Shop({ gold, offer, onBuy, onReroll }: Props) {
  return (
    <div className="panel">
      <h3>Shop (Händler-NPC)</h3>
      <div className="shopNpc">🧙 Händler — Gold: {gold}</div>
      <button onClick={onReroll}>Angebot neu würfeln</button>
      <div className="cards">
        {offer.map((id) => {
          const item = ITEMS.find((i) => i.id === id);
          if (!item) return null;
          return (
            <div className={`itemCard ${item.rarity}`} key={id}>
              <h4>{item.name}</h4>
              <div>{item.rarity} · {item.slot}</div>
              <small>{item.desc}</small>
              <div>Preis: {item.price}</div>
              <button disabled={gold < item.price} onClick={() => onBuy(item.id)}>Kaufen</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
