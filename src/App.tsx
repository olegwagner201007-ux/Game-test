import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ACHIEVEMENTS,
  BLOCK_TYPES,
  ESCAPE_TOKEN_UPGRADES,
  QUESTS,
  RESOURCE_KEYS,
  STORAGE_KEY,
  TOOLS,
  UPGRADES,
  pickBlockType
} from './gameData';
import type { AchievementId, GameState, QuestId, ResourceKey, ToolId, UpgradeId } from './types';

type Tab = 'dig' | 'inventory' | 'shop' | 'upgrades' | 'quests' | 'achievements' | 'prison+' | 'settings';

const TABS: Tab[] = ['dig', 'inventory', 'shop', 'upgrades', 'quests', 'achievements', 'prison+', 'settings'];

const createState = (): GameState => {
  const block = generateBlock(0);
  return {
    depth: 0,
    escaped: false,
    runs: 0,
    escapeTokens: 0,
    resources: { dirt: 0, stone: 0, scrap: 0, metal: 0, gold: 0 },
    energy: 100,
    maxEnergy: 100,
    suspicion: 8,
    bagUsed: 0,
    tool: 'spoon',
    upgrades: {
      digPower: 0,
      digSpeed: 0,
      maxEnergy: 0,
      energyRegen: 0,
      bagSize: 0,
      suspicionReduction: 0,
      noiseControl: 0,
      tunnelStability: 0
    },
    currentBlock: block,
    dayProgress: 0,
    isNight: false,
    guardChecksSurvived: 0,
    totalBlocksDug: 0,
    totalGoldFound: 0,
    questsCompleted: [],
    achievements: [],
    particles: true,
    sound: true,
    reducedAnimations: false,
    log: ['Du sitzt in der Zelle. Unter dem Bett beginnt der Tunnel...'],
    tempNightShift: 0
  };
};

function generateBlock(depth: number) {
  const typeId = pickBlockType(depth);
  const base = BLOCK_TYPES.find((b) => b.id === typeId) ?? BLOCK_TYPES[0];
  const scaled = Math.floor(base.hp * (1 + depth * 0.035));
  return { type: typeId, hp: scaled, maxHp: scaled };
}

function App() {
  const [game, setGame] = useState<GameState>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createState();
    try {
      return { ...createState(), ...JSON.parse(raw) as GameState };
    } catch {
      return createState();
    }
  });
  const [activeTab, setActiveTab] = useState<Tab>('dig');
  const [shake, setShake] = useState(false);
  const [floating, setFloating] = useState<string>('');
  const [nightBlocks, setNightBlocks] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  }, [game]);

  const tool = useMemo(() => TOOLS.find((t) => t.id === game.tool) ?? TOOLS[0], [game.tool]);
  const blockType = useMemo(() => BLOCK_TYPES.find((b) => b.id === game.currentBlock.type) ?? BLOCK_TYPES[0], [game.currentBlock.type]);
  const bagSize = 180 + game.upgrades.bagSize * 60;

  const digPower = useMemo(() => {
    const p = tool.digPower * (1 + game.upgrades.digPower * 0.2 + game.upgrades.digSpeed * 0.1);
    const withNight = game.isNight ? p * 1.2 : p;
    const withEvent = game.tempNightShift > 0 ? withNight * 2 : withNight;
    return withEvent;
  }, [tool.digPower, game.upgrades.digPower, game.upgrades.digSpeed, game.isNight, game.tempNightShift]);

  const suspicionGainMult = Math.max(0.35, 1 - game.upgrades.suspicionReduction * 0.12) * (1 - game.upgrades.noiseControl * 0.1);

  const addLog = (entry: string) => {
    setGame((prev) => ({ ...prev, log: [entry, ...prev.log].slice(0, 8) }));
  };

  const playClickSound = () => {
    if (!game.sound) return;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = 180 + Math.random() * 120;
    g.gain.value = 0.02;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.06);
  };

  const completeQuestIfNeeded = (next: GameState) => {
    const done = new Set(next.questsCompleted);
    const maybeAdd = (id: QuestId) => {
      if (!done.has(id)) {
        done.add(id);
        next.resources.gold += QUESTS.find((q) => q.id === id)?.rewardGold ?? 0;
        next.log = [`Quest abgeschlossen: ${QUESTS.find((q) => q.id === id)?.title}`, ...next.log].slice(0, 8);
      }
    };
    if (next.totalBlocksDug >= 10) maybeAdd('dig10');
    if (next.depth >= 25) maybeAdd('depth25');
    if (Object.values(next.upgrades).some((v) => v > 0)) maybeAdd('firstUpgrade');
    if (next.resources.scrap >= 100) maybeAdd('scrap100');
    if (next.guardChecksSurvived >= 1) maybeAdd('surviveGuardCheck');
    if (next.depth >= 100) maybeAdd('reachEscapeTunnel');
    next.questsCompleted = Array.from(done);
  };

  const unlockAchievements = (next: GameState) => {
    const done = new Set(next.achievements);
    const earn = (id: AchievementId) => {
      if (done.has(id)) return;
      done.add(id);
      const reward = ACHIEVEMENTS.find((a) => a.id === id)?.reward ?? {};
      for (const key of RESOURCE_KEYS) next.resources[key] += reward[key] ?? 0;
      next.log = [`Achievement: ${ACHIEVEMENTS.find((a) => a.id === id)?.title}`, ...next.log].slice(0, 8);
    };
    if (next.totalGoldFound > 0) earn('firstGold');
    if (next.depth >= 50) earn('depth50');
    if (nightBlocks >= 30) earn('nightMiner');
    if (next.runs >= 1) earn('firstEscape');
    next.achievements = Array.from(done);
  };

  const triggerGuardCheck = (current: GameState) => {
    const next = { ...current, resources: { ...current.resources }, log: [...current.log] };
    next.suspicion = 35;
    const hard = Math.random() < 0.45;
    if (hard) {
      next.depth = Math.max(0, next.depth - 4);
      next.resources.scrap = Math.floor(next.resources.scrap * 0.8);
      next.resources.stone = Math.floor(next.resources.stone * 0.85);
      next.log.unshift('Guard Check! Wächter finden Hinweise. Du verlierst Tiefe & Scrap.');
    } else {
      next.guardChecksSurvived += 1;
      next.log.unshift('Guard Check bestanden. Du bleibst unentdeckt.');
    }
    next.currentBlock = generateBlock(next.depth);
    return next;
  };

  const dig = () => {
    if (game.energy < blockType.energyCost || game.bagUsed >= bagSize || game.escaped) return;
    playClickSound();
    setShake(true);
    setTimeout(() => setShake(false), 120);
    setGame((prev) => {
      const block = BLOCK_TYPES.find((b) => b.id === prev.currentBlock.type) ?? BLOCK_TYPES[0];
      const next = { ...prev, resources: { ...prev.resources }, currentBlock: { ...prev.currentBlock }, log: [...prev.log] };
      next.energy = Math.max(0, next.energy - block.energyCost);
      next.currentBlock.hp -= Math.ceil(digPower);
      next.suspicion = Math.min(100, next.suspicion + block.noise * tool.noiseMult * suspicionGainMult * (prev.isNight ? 0.7 : 1.2));

      if (next.currentBlock.hp <= 0) {
        for (const key of RESOURCE_KEYS) {
          const gain = block.loot[key] ?? 0;
          next.resources[key] += gain;
          next.bagUsed += gain;
        }
        if ((block.loot.gold ?? 0) > 0) next.totalGoldFound += block.loot.gold ?? 0;
        next.depth += 1;
        next.totalBlocksDug += 1;
        if (next.isNight) setNightBlocks((v) => v + 1);
        setFloating(`+Loot (${block.name})`);
        setTimeout(() => setFloating(''), 700);
        next.currentBlock = generateBlock(next.depth);
      }

      if (next.suspicion >= 100) return triggerGuardCheck(next);
      completeQuestIfNeeded(next);
      unlockAchievements(next);
      return next;
    });
  };

  const rest = () => {
    setGame((prev) => ({
      ...prev,
      energy: Math.min(prev.maxEnergy, prev.energy + prev.maxEnergy * 0.35),
      suspicion: Math.min(100, prev.suspicion + 5),
      log: ['Du ruhst dich aus (+Energy, +Suspicion).', ...prev.log].slice(0, 8)
    }));
  };

  const canAfford = (cost: Partial<Record<ResourceKey, number>>) => RESOURCE_KEYS.every((k) => (game.resources[k] ?? 0) >= (cost[k] ?? 0));

  const payCost = (cost: Partial<Record<ResourceKey, number>>, state: GameState) => {
    for (const key of RESOURCE_KEYS) state.resources[key] -= cost[key] ?? 0;
  };

  const buyTool = (id: ToolId) => {
    const target = TOOLS.find((t) => t.id === id);
    if (!target || game.tool === id || game.depth < target.unlockDepth || !canAfford(target.cost)) return;
    setGame((prev) => {
      const next = { ...prev, resources: { ...prev.resources }, tool: id, log: [...prev.log] };
      payCost(target.cost, next);
      next.log.unshift(`Neues Tool: ${target.name}`);
      return next;
    });
  };

  const buyUpgrade = (id: UpgradeId) => {
    const u = UPGRADES.find((up) => up.id === id);
    if (!u) return;
    const level = game.upgrades[id];
    const cost: Partial<Record<ResourceKey, number>> = {};
    for (const key of RESOURCE_KEYS) cost[key] = Math.floor((u.baseCost[key] ?? 0) * Math.pow(u.scaling, level));
    if (!canAfford(cost)) return;
    setGame((prev) => {
      const next = { ...prev, resources: { ...prev.resources }, upgrades: { ...prev.upgrades }, log: [...prev.log] };
      payCost(cost, next);
      next.upgrades[id] += 1;
      if (id === 'maxEnergy') {
        next.maxEnergy += 12;
        next.energy = Math.min(next.maxEnergy, next.energy + 12);
      }
      if (id === 'tunnelStability') next.log.unshift('Tunnel abgestützt.');
      completeQuestIfNeeded(next);
      return next;
    });
  };

  const emptyBag = () => setGame((prev) => ({ ...prev, bagUsed: 0, log: ['Du lagerst Ressourcen im Versteck.', ...prev.log].slice(0, 8) }));

  const eventTick = () => {
    setGame((prev) => {
      let next = { ...prev, resources: { ...prev.resources }, log: [...prev.log] };
      const regen = 0.5 + next.upgrades.energyRegen * 0.25;
      next.energy = Math.min(next.maxEnergy, next.energy + regen);
      next.suspicion = Math.max(0, next.suspicion - 0.12 - next.upgrades.suspicionReduction * 0.08);
      next.dayProgress = (next.dayProgress + 1.4) % 100;
      next.isNight = next.dayProgress >= 55;
      if (next.tempNightShift > 0) next.tempNightShift = Math.max(0, next.tempNightShift - 0.5);

      if (Math.random() < 0.04) {
        const roll = Math.random();
        if (roll < 0.2) next.log.unshift('Guard Patrol: Verdacht steigt leicht.'), (next.suspicion += 6);
        else if (roll < 0.35) next.log.unshift('Found Hidden Coin! +12 Gold'), (next.resources.gold += 12);
        else if (roll < 0.5) next.log.unshift('Tunnel Collapse! Tiefe -2'), (next.depth = Math.max(0, next.depth - 2)), (next.currentBlock = generateBlock(next.depth));
        else if (roll < 0.7) next.log.unshift('Lucky Ore Vein: +10 Metal +6 Gold'), (next.resources.metal += 10), (next.resources.gold += 6);
        else if (roll < 0.85) next.log.unshift('Night Shift aktiv: 2x Dig Power!'), (next.tempNightShift = 15);
        else next.log.unshift('Inspection: hohe Suspicion wäre gefährlich...'), (next.suspicion += 10);
      }

      if (next.suspicion >= 100) next = triggerGuardCheck(next);
      completeQuestIfNeeded(next);
      unlockAchievements(next);
      next.log = next.log.slice(0, 8);
      return next;
    });
  };

  useEffect(() => {
    const id = setInterval(eventTick, 500);
    return () => clearInterval(id);
  }, []);

  const canEscape =
    game.depth >= 100 &&
    game.upgrades.tunnelStability >= 10 &&
    ['silentDrill', 'prisonBreakerDrill'].includes(game.tool) &&
    game.suspicion < 60 &&
    game.resources.metal >= 500 &&
    game.resources.gold >= 250;

  const escape = () => {
    if (!canEscape) return;
    setGame((prev) => ({
      ...prev,
      escaped: true,
      runs: prev.runs + 1,
      escapeTokens: prev.escapeTokens + 3,
      log: ['DU BIST ENTKOMMEN! New Prison+ freigeschaltet.', ...prev.log].slice(0, 8)
    }));
  };

  const newPrisonPlus = () => {
    if (!game.escaped) return;
    const carryTokens = game.escapeTokens;
    setGame({ ...createState(), escapeTokens: carryTokens, runs: game.runs, log: ['New Prison+ gestartet. Härteres Gefängnis!'] });
    setNightBlocks(0);
  };

  const buyTokenUpgrade = (id: (typeof ESCAPE_TOKEN_UPGRADES)[number]['id']) => {
    const up = ESCAPE_TOKEN_UPGRADES.find((u) => u.id === id);
    if (!up || game.escapeTokens < up.cost) return;
    setGame((prev) => {
      const next = { ...prev, escapeTokens: prev.escapeTokens - up.cost, log: [...prev.log] };
      if (id === 'tokenEnergy') {
        next.maxEnergy += 20;
        next.energy += 20;
      }
      if (id === 'tokenPower') next.upgrades.digPower += 1;
      if (id === 'tokenStealth') next.upgrades.suspicionReduction += 1;
      next.log.unshift(`Permanent gekauft: ${up.name}`);
      return next;
    });
  };

  const resetSave = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGame(createState());
    setNightBlocks(0);
  };

  return (
    <div className="app-shell">
      <header className="statusbar">
        <div>Depth: <b>{game.depth}</b></div>
        <div>Energy: <b>{game.energy.toFixed(0)}/{game.maxEnergy}</b></div>
        <div>Suspicion: <b>{game.suspicion.toFixed(0)}%</b></div>
        <div>Tool: <b>{tool.name}</b></div>
        <div>Gold: <b>{game.resources.gold}</b></div>
      </header>

      <main className="layout">
        <section className="dig-area">
          <h2>{game.isNight ? 'Night Shift' : 'Day Shift'} · {blockType.name}</h2>
          <div className={`block ${shake ? 'shake' : ''} ${game.reducedAnimations ? 'reduced' : ''}`} style={{ background: blockType.color }} onClick={dig}>
            <span>{blockType.name}</span>
            {floating && <em className="floating">{floating}</em>}
          </div>
          <div className="hpbar"><div style={{ width: `${(game.currentBlock.hp / game.currentBlock.maxHp) * 100}%` }} /></div>
          <p>HP: {Math.max(0, game.currentBlock.hp)} / {game.currentBlock.maxHp} · Bag: {game.bagUsed}/{bagSize}</p>
          <div className="actions">
            <button onClick={dig}>Dig</button>
            <button onClick={rest}>Rest</button>
            <button onClick={emptyBag}>Store Bag</button>
            <button onClick={escape} disabled={!canEscape}>Escape Prison</button>
          </div>
          <ul className="log">{game.log.map((l, i) => <li key={`${l}-${i}`}>{l}</li>)}</ul>
        </section>

        <section className="panel-area">
          <div className="tabs">{TABS.map((t) => <button key={t} className={activeTab === t ? 'active' : ''} onClick={() => setActiveTab(t)}>{t}</button>)}</div>

          {activeTab === 'inventory' && (
            <div className="panel">
              {RESOURCE_KEYS.map((r) => <p key={r}>{r}: <b>{game.resources[r]}</b></p>)}
              <p>Energy (virtual): {Math.floor(game.resources.scrap / 5)}</p>
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="panel list">
              {TOOLS.map((t) => (
                <div key={t.id} className="card">
                  <h4>{t.name}</h4>
                  <p>Power {t.digPower} · Noise x{t.noiseMult}</p>
                  <p>Unlock Depth: {t.unlockDepth}</p>
                  <button disabled={game.depth < t.unlockDepth || !canAfford(t.cost) || game.tool === t.id} onClick={() => buyTool(t.id)}>Buy Tool</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'upgrades' && (
            <div className="panel list">
              {UPGRADES.map((u) => {
                const lvl = game.upgrades[u.id];
                const cost: Partial<Record<ResourceKey, number>> = {};
                for (const k of RESOURCE_KEYS) cost[k] = Math.floor((u.baseCost[k] ?? 0) * Math.pow(u.scaling, lvl));
                return (
                  <div key={u.id} className="card">
                    <h4>{u.name} Lv.{lvl}</h4>
                    <p>{u.desc}</p>
                    <small>{RESOURCE_KEYS.map((k) => (cost[k] ? `${k}:${cost[k]} ` : '')).join('')}</small>
                    <button onClick={() => buyUpgrade(u.id)} disabled={!canAfford(cost)}>Upgrade</button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="panel list">
              {QUESTS.map((q) => <div key={q.id} className={`card ${game.questsCompleted.includes(q.id) ? 'done' : ''}`}><h4>{q.title}</h4><p>{q.desc}</p></div>)}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="panel list">
              {ACHIEVEMENTS.map((a) => <div key={a.id} className={`card ${game.achievements.includes(a.id) ? 'done' : ''}`}><h4>{a.title}</h4><p>{a.desc}</p></div>)}
            </div>
          )}

          {activeTab === 'prison+' && (
            <div className="panel list">
              <p>Escapes: {game.runs} · Escape Tokens: {game.escapeTokens}</p>
              {ESCAPE_TOKEN_UPGRADES.map((u) => <button key={u.id} onClick={() => buyTokenUpgrade(u.id)}>{u.name} ({u.cost}T)</button>)}
              <button onClick={newPrisonPlus} disabled={!game.escaped}>Start New Prison+</button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="panel list">
              <label><input type="checkbox" checked={game.sound} onChange={() => setGame((s) => ({ ...s, sound: !s.sound }))} /> Sound</label>
              <label><input type="checkbox" checked={game.particles} onChange={() => setGame((s) => ({ ...s, particles: !s.particles }))} /> Particles</label>
              <label><input type="checkbox" checked={game.reducedAnimations} onChange={() => setGame((s) => ({ ...s, reducedAnimations: !s.reducedAnimations }))} /> Reduced animations</label>
              <button onClick={resetSave}>Reset Save</button>
            </div>
          )}

          {activeTab === 'dig' && <div className="panel"><p>Klicke den Block im Zentrum, um zu graben. Nachts besser, tagsüber riskanter.</p></div>}
        </section>
      </main>

      {game.escaped && <div className="victory">Victory! Du bist ausgebrochen. Starte jetzt New Prison+.</div>}
    </div>
  );
}

export default App;
