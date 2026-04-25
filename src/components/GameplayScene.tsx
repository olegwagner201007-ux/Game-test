import { useEffect, useRef } from 'react';
import { ENEMY_TEMPLATES, REGIONS, ROLES } from '../game/data';
import { calculateStats } from '../game/state';
import type { BattleState, Hero } from '../game/types';

type Props = {
  battle: BattleState | null;
  regionId: string;
};

function drawHero(ctx: CanvasRenderingContext2D, hero: Hero, x: number, y: number) {
  const role = ROLES.find((r) => r.id === hero.roleId) ?? ROLES[0];
  const st = calculateStats(hero);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = role.color;
  ctx.fillRect(-16, -28, 32, 40);
  ctx.fillStyle = '#f3f4f6';
  ctx.beginPath();
  ctx.arc(0, -40, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.fillRect(-4, 13, 8, 20);
  if (hero.equipment.weapon) {
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(16, -12, 16, 4);
  }
  if (hero.equipment.helmet) {
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(-11, -50, 22, 6);
  }
  if (hero.equipment.accessory) {
    ctx.strokeStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -40, 16, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#e5e7eb';
  ctx.fillText(`${hero.name}`, -18, 42);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(-20, 46, (hero.hp / st.hp) * 40, 4);
  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, typeId: string, hp: number, maxHp: number, x: number, y: number, boss: boolean) {
  const t = ENEMY_TEMPLATES[typeId] ?? ENEMY_TEMPLATES.slime;
  const size = boss ? 60 : 42;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = t.typeId === 'slime' ? '#22d3ee' : t.typeId === 'mushling' ? '#84cc16' : t.typeId === 'crystal_golem' ? '#38bdf8' : t.typeId === 'harpy' ? '#c4b5fd' : t.typeId === 'shadow_knight' ? '#334155' : '#ef4444';
  if (t.typeId === 'shadow_king') ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.roundRect(-size / 2, -size / 2, size, size, 10);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.fillRect(-12, -8, 24, 8);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-size / 2, size / 2 + 10, (hp / maxHp) * size, 5);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(t.name, -size / 2, size / 2 + 26);
  ctx.restore();
}

export function GameplayScene({ battle, regionId }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0];
    let raf = 0;
    let tick = 0;

    const render = () => {
      tick += 1;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, region.theme.sky);
      g.addColorStop(1, region.theme.ground);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(255,255,255,.2)';
      ctx.fillRect(0, h * 0.62, w, h * 0.38);

      ctx.strokeStyle = region.theme.fx;
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(w * (0.2 + i * 0.2), h * 0.55, 26 + Math.sin((tick + i * 8) / 12) * 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (battle) {
        battle.heroes.forEach((hero, idx) => drawHero(ctx, hero, w * 0.16 + idx * 90, h * 0.76 - idx * 16));
        battle.enemies.forEach((enemy, idx) => drawEnemy(ctx, enemy.typeId, enemy.hp, enemy.maxHp, w * 0.74 + idx * 90, h * 0.42 + idx * 20, enemy.boss));
        battle.popups.forEach((p) => {
          ctx.fillStyle = p.positive ? '#22c55e' : p.crit ? '#fde047' : '#fca5a5';
          ctx.font = p.crit ? 'bold 18px sans-serif' : 'bold 16px sans-serif';
          const py = p.y * h - (60 - p.ttl);
          ctx.fillText(`${p.positive ? '+' : '-'}${p.value}`, p.x * w, py);
        });
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('Adventure-Szene: Wähle ein Gebiet und starte einen Kampf', 26, h * 0.8);
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [battle, regionId]);

  return <canvas ref={ref} width={1000} height={450} className="gameplayCanvas" />;
}
