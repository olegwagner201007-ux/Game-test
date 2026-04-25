import { ROLES } from '../game/data';
import { calculateStats } from '../game/state';
import type { Hero } from '../game/types';

type Props = {
  team: Hero[];
  selectedHeroId: string | null;
  onSelect: (id: string) => void;
};

export function TeamMenu({ team, selectedHeroId, onSelect }: Props) {
  return (
    <div className="panel">
      <h3>Team</h3>
      <div className="cards">
        {team.map((h) => {
          const role = ROLES.find((r) => r.id === h.roleId) ?? ROLES[0];
          const st = calculateStats(h);
          return (
            <button key={h.id} className={`heroCard ${selectedHeroId === h.id ? 'selected' : ''}`} onClick={() => onSelect(h.id)}>
              <div>{role.icon} {h.name}</div>
              <small>{role.name} Lv{h.level}/R{h.roleLevel}</small>
              <div>HP {h.hp}/{st.hp}</div>
              <div>EN {h.en}/{st.en}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
