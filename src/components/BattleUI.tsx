import { ROLES } from '../game/data';
import { calculateStats } from '../game/state';
import type { BattleState } from '../game/types';

type Props = {
  battle: BattleState;
  onSkill: (skillId: string, targetId: string) => void;
};

export function BattleUI({ battle, onSkill }: Props) {
  const active = battle.heroes.find((h) => h.id === battle.selectedHeroId) ?? battle.heroes.find((h) => h.hp > 0) ?? battle.heroes[0];
  const role = ROLES.find((r) => r.id === active.roleId) ?? ROLES[0];
  const stats = calculateStats(active);
  return (
    <div className="battleLayout">
      <aside className="panel statusCol">
        <h4>Team</h4>
        {battle.heroes.map((h) => {
          const st = calculateStats(h);
          return (
            <div key={h.id} className="statusCard">
              <strong>{h.name}</strong>
              <small>{ROLES.find((r) => r.id === h.roleId)?.name}</small>
              <div>HP {h.hp}/{st.hp}</div>
              <div className="bar"><span style={{ width: `${(h.hp / st.hp) * 100}%` }} /></div>
              <div>EN {h.en}/{st.en}</div>
            </div>
          );
        })}
      </aside>

      <section className="panel actionCol">
        <h4>Aktion: {active.name}</h4>
        <div className="skillGrid">
          {role.skills.map((s) => (
            <button key={s.id} disabled={active.en < s.cost} onClick={() => onSkill(s.id, battle.enemies.find((e) => e.hp > 0)?.id ?? '')}>
              {s.name} ({s.cost})
            </button>
          ))}
        </div>
        <div className="small">ATK {stats.atk} DEF {stats.def} MAG {stats.mag} KRIT {stats.crit}%</div>
      </section>

      <aside className="panel statusCol">
        <h4>Gegner</h4>
        {battle.enemies.map((e) => (
          <div key={e.id} className="statusCard enemy">
            <strong>{e.name}{e.boss ? ' 👑' : ''}</strong>
            <div>HP {e.hp}/{e.maxHp}</div>
            <div className="bar danger"><span style={{ width: `${(e.hp / e.maxHp) * 100}%` }} /></div>
          </div>
        ))}
      </aside>

      <details className="panel logPanel" open>
        <summary>Kampf-Log</summary>
        <div className="logList">{battle.log.slice(0, 12).map((x, i) => <div key={`${x}-${i}`}>{x}</div>)}</div>
      </details>
    </div>
  );
}
