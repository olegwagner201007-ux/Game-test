import { useEffect, useMemo, useState } from 'react';
import { BattleUI } from './components/BattleUI';
import { GameplayScene } from './components/GameplayScene';
import { Inventory } from './components/Inventory';
import { Shop } from './components/Shop';
import { TeamMenu } from './components/TeamMenu';
import { WorldMap } from './components/WorldMap';
import { ITEMS, REGIONS, ROLES } from './game/data';
import { generateLoot, randomShopOffer, resolveAttack, startBattle } from './game/battle';
import { autoEquip, createHero, equipItem, gainXp, getRole } from './game/state';
import { loadGame, repairSave, saveGame } from './game/save';
import type { BattleState, Hero, SaveGame } from './game/types';

const tabs = ['adventure', 'map', 'team', 'inventory', 'shop', 'settings', 'admin'] as const;
type Tab = (typeof tabs)[number];

function App() {
  const [save, setSave] = useState<SaveGame>(() => loadGame());
  const [tab, setTab] = useState<Tab>('adventure');
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [regionId, setRegionId] = useState('meadow');
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [heroName, setHeroName] = useState('');
  const [heroRole, setHeroRole] = useState('sword');
  const [adminOpen, setAdminOpen] = useState(false);

  const selectedHero = save.team.find((h) => h.id === selectedHeroId) ?? save.team[0] ?? null;
  const storyDepth = useMemo(() => Object.values(save.regionProgress).filter((x) => x.boss).length, [save.regionProgress]);

  useEffect(() => {
    if (save.settings.autoSave) saveGame(save);
  }, [save]);

  const ensureShop = () => {
    if (save.shopOffer.length) return;
    setSave((s) => ({ ...s, shopOffer: randomShopOffer(storyDepth) }));
  };

  const beginFight = (id: string, boss: boolean) => {
    if (!save.unlockedRegions.includes(id) || save.team.length === 0) return;
    const p = save.regionProgress[id] ?? { clears: 0, boss: false };
    if (boss && p.clears < 3) return;
    const healed = save.team.map((h) => ({ ...h }));
    setBattle(startBattle(id, healed, boss));
    setRegionId(id);
    setTab('adventure');
  };

  const onSkill = (skillId: string, targetId: string) => {
    if (!battle) return;
    const actor = battle.heroes.find((h) => h.hp > 0);
    if (!actor) return;
    const skill = getRole(actor.roleId).skills.find((s) => s.id === skillId);
    if (!skill) return;
    const next = resolveAttack({ ...battle, selectedHeroId: actor.id }, { side: 'hero', id: actor.id }, skill, targetId);
    next.popups = next.popups.map((p) => ({ ...p, ttl: p.ttl - 1 })).filter((p) => p.ttl > 0);
    setBattle(next);

    if (next.victory || next.defeat) {
      const boss = next.wave >= 4;
      if (next.victory) {
        const loot = generateLoot(next.regionId, boss);
        const region = REGIONS.find((r) => r.id === next.regionId) ?? REGIONS[0];
        const xpGain = boss ? 70 : 28;
        const goldGain = boss ? 120 : 38;
        setSave((s) => {
          let team = s.team;
          team = team.map((h) => gainXp(h, xpGain).hero);
          const nextProgress = { ...(s.regionProgress[next.regionId] ?? { clears: 0, boss: false }) };
          if (boss) nextProgress.boss = true;
          else nextProgress.clears = Math.min(3, nextProgress.clears + 1);
          const out: SaveGame = {
            ...s,
            gold: s.gold + goldGain,
            team,
            inventory: loot ? [...s.inventory, loot.id] : s.inventory,
            regionProgress: { ...s.regionProgress, [next.regionId]: nextProgress }
          };
          if (boss) {
            const idx = REGIONS.findIndex((r) => r.id === region.id);
            const nextRegion = REGIONS[idx + 1];
            if (nextRegion && !out.unlockedRegions.includes(nextRegion.id)) out.unlockedRegions = [...out.unlockedRegions, nextRegion.id];
          }
          return out;
        });
      }
    }
  };

  const onBuy = (itemId: string) => {
    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    setSave((s) => {
      if (s.gold < item.price) return s;
      return { ...s, gold: s.gold - item.price, inventory: [...s.inventory, item.id] };
    });
  };

  const onReroll = () => {
    setSave((s) => {
      if (s.gold < 35) return s;
      return { ...s, gold: s.gold - 35, shopOffer: randomShopOffer(storyDepth) };
    });
  };

  const onEquip = (itemId: string) => {
    if (!selectedHero) return;
    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    setSave((s) => {
      const team = s.team.map((h) => (h.id === selectedHero.id ? equipItem(h, item) : h));
      return { ...s, team };
    });
  };

  const onSell = (itemId: string) => {
    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    setSave((s) => {
      const idx = s.inventory.indexOf(itemId);
      if (idx < 0) return s;
      const inv = [...s.inventory];
      inv.splice(idx, 1);
      return { ...s, inventory: inv, gold: s.gold + Math.floor(item.price * 0.45) };
    });
  };

  const addHero = () => {
    if (save.team.length >= 4) return;
    setSave((s) => ({ ...s, playerName: playerNameInput || s.playerName, team: [...s.team, createHero(heroName || 'Held', heroRole)] }));
  };

  const autoEquipSelected = () => {
    if (!selectedHero) return;
    setSave((s) => ({ ...s, team: s.team.map((h) => (h.id === selectedHero.id ? autoEquip(h, s.inventory) : h)) }));
  };

  const tryAdmin = (code: string) => setAdminOpen(code === 'Adminoleg');

  const adminAction = (act: string) => {
    if (!adminOpen) return;
    if (act === 'gold') setSave((s) => ({ ...s, gold: s.gold + 1000 }));
    if (act === 'legendary') {
      const legendary = ITEMS.filter((i) => i.rarity === 'Legendary');
      const item = legendary[Math.floor(Math.random() * legendary.length)];
      setSave((s) => ({ ...s, inventory: [...s.inventory, item.id] }));
    }
    if (act === 'unlock') setSave((s) => ({ ...s, unlockedRegions: REGIONS.map((r) => r.id) }));
    if (act === 'level') setSave((s) => ({ ...s, team: s.team.map((h) => ({ ...h, level: Math.min(30, h.level + 1), roleLevel: Math.min(30, h.roleLevel + 1) })) }));
    if (act === 'test') beginFight(regionId, false);
    if (act === 'repair') setSave((s) => repairSave(s));
    if (act === 'debug') alert(JSON.stringify({ team: save.team.length, gold: save.gold, regionId, tab }, null, 2));
  };

  useEffect(() => ensureShop(), []);

  return (
    <div className="app">
      <header className="top">
        <div className="row between">
          <h1>Asterfall — echtes Gameplay Update</h1>
          <div className="chips"><span>Gold: {save.gold}</span><span>Region: {regionId}</span><span>Version: {save.gameVersion}</span></div>
        </div>
        <nav className="tabs">{tabs.map((t) => <button key={t} onClick={() => setTab(t)}>{t}</button>)}</nav>
      </header>

      {tab === 'adventure' && (
        <>
          <GameplayScene battle={battle} regionId={regionId} />
          {battle ? <BattleUI battle={battle} onSkill={onSkill} /> : <div className="panel">Starte über Weltkarte einen Kampf. Hier läuft die sichtbare Pseudo-3D Szene.</div>}
        </>
      )}

      {tab === 'map' && <WorldMap unlocked={save.unlockedRegions} progress={save.regionProgress} onFight={beginFight} />}

      {tab === 'team' && (
        <>
          <div className="panel">
            <h3>Team erstellen</h3>
            <div className="row">
              <input placeholder="Spielername" value={playerNameInput} onChange={(e) => setPlayerNameInput(e.target.value)} />
              <input placeholder="Heldenname" value={heroName} onChange={(e) => setHeroName(e.target.value)} />
              <select value={heroRole} onChange={(e) => setHeroRole(e.target.value)}>{ROLES.map((r) => <option key={r.id} value={r.id}>{r.icon} {r.name}</option>)}</select>
              <button onClick={addHero}>Held hinzufügen</button>
            </div>
          </div>
          <TeamMenu team={save.team} selectedHeroId={selectedHeroId} onSelect={setSelectedHeroId} />
        </>
      )}

      {tab === 'inventory' && <Inventory inventory={save.inventory} hero={selectedHero} onEquip={onEquip} onSell={onSell} onAutoEquip={autoEquipSelected} favoriteItems={save.favoriteItems} onToggleFav={(id) => setSave((s) => ({ ...s, favoriteItems: s.favoriteItems.includes(id) ? s.favoriteItems.filter((x) => x !== id) : [...s.favoriteItems, id] }))} />}

      {tab === 'shop' && <Shop gold={save.gold} offer={save.shopOffer} onBuy={onBuy} onReroll={onReroll} />}

      {tab === 'settings' && (
        <div className="panel">
          <h3>Einstellungen</h3>
          <label><input type="checkbox" checked={save.settings.animations} onChange={() => setSave((s) => ({ ...s, settings: { ...s.settings, animations: !s.settings.animations } }))} /> Animationen</label>
          <label><input type="checkbox" checked={save.settings.autoSave} onChange={() => setSave((s) => ({ ...s, settings: { ...s.settings, autoSave: !s.settings.autoSave } }))} /> Auto Save</label>
          <button onClick={() => saveGame(save)}>Manuell speichern</button>
          <button onClick={() => {
            const raw = prompt('Save export / import', JSON.stringify(save));
            if (!raw) return;
            try {
              setSave(repairSave(JSON.parse(raw) as SaveGame));
            } catch {
              alert('Import fehlgeschlagen');
            }
          }}>Export/Import</button>
          <button onClick={() => { if (confirm('Wirklich resetten?')) setSave(loadGame()); }}>Reset/Reload</button>
        </div>
      )}

      {tab === 'admin' && (
        <div className="panel">
          <h3>Admin/Test lokal</h3>
          <input placeholder="Code" onBlur={(e) => tryAdmin(e.target.value)} />
          <div className="cards">
            <button onClick={() => adminAction('gold')}>+1000 Gold</button>
            <button onClick={() => adminAction('legendary')}>Random Legendary</button>
            <button onClick={() => adminAction('unlock')}>Alle Gebiete frei</button>
            <button onClick={() => adminAction('level')}>Team +1 Level</button>
            <button onClick={() => adminAction('test')}>Testkampf</button>
            <button onClick={() => adminAction('repair')}>Save reparieren</button>
            <button onClick={() => adminAction('debug')}>Debug anzeigen</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
