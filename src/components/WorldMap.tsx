import { REGIONS } from '../game/data';

type Props = {
  unlocked: string[];
  progress: Record<string, { clears: number; boss: boolean }>;
  onFight: (regionId: string, boss: boolean) => void;
};

export function WorldMap({ unlocked, progress, onFight }: Props) {
  return (
    <div className="panel">
      <h3>Weltkarte (visuelle Knoten)</h3>
      <svg viewBox="0 0 900 220" className="worldMapSvg" role="img" aria-label="Weltkarte">
        {REGIONS.map((_, i) => {
          if (i === REGIONS.length - 1) return null;
          const x1 = 90 + i * 180;
          const x2 = 90 + (i + 1) * 180;
          return <line key={`line-${i}`} x1={x1} y1={110} x2={x2} y2={110} stroke="#64748b" strokeWidth={6} />;
        })}
        {REGIONS.map((r, i) => {
          const x = 90 + i * 180;
          const isUnlocked = unlocked.includes(r.id);
          const p = progress[r.id] ?? { clears: 0, boss: false };
          return (
            <g key={r.id}>
              <circle cx={x} cy={110} r={p.boss ? 32 : 26} fill={isUnlocked ? '#0ea5e9' : '#1f2937'} stroke={isUnlocked ? '#67e8f9' : '#475569'} strokeWidth={4} />
              <text x={x} y={95} textAnchor="middle" fill="#f8fafc" fontSize="12">{r.name}</text>
              <text x={x} y={115} textAnchor="middle" fill="#e2e8f0" fontSize="11">{isUnlocked ? `${p.clears}/3` : '🔒'}</text>
              <foreignObject x={x - 45} y={130} width={92} height={82}>
                <div className="mapButtons">
                  <button disabled={!isUnlocked} onClick={() => onFight(r.id, false)}>Kampf</button>
                  <button disabled={!isUnlocked || p.clears < 3} onClick={() => onFight(r.id, true)}>Boss</button>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
