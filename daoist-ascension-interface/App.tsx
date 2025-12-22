import React, { useState } from 'react';
import { Header } from './components/Header';
import { GameDisplay } from './components/GameDisplay';
import { ActionPanel } from './components/ActionPanel';
import { HomeDashboard } from './components/HomeDashboard';
import { NavigationDock } from './components/NavigationDock';
import { WorldMap } from './components/WorldMap';
import { GameMode, ViewMode, PlayerStats, EnemyStats, ActionOption, MapNode } from './types';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.HOME);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.EXPLORE);
  const [showMap, setShowMap] = useState(false);
  const [day, setDay] = useState(1);
  
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    name: '叶凡',
    realm: '化龙秘境',
    spiritStones: 88400,
    location: '荒古禁地',
    avatarUrl: 'https://picsum.photos/id/1011/200/200', 
    hp: 4500, maxHp: 5000,
    mp: 2100, maxMp: 3000,
    buffs: [
      { id: '1', name: '皆字秘', icon: 'zap', type: 'good', stacks: 1 },
      { id: '2', name: '万物母气', icon: 'shield', type: 'good', stacks: 3 }
    ]
  });

  // Mock Enemy State
  const [enemyStats] = useState<EnemyStats>({
    name: '荒古圣体·遗骸',
    realm: '半步大能',
    avatarUrl: 'https://picsum.photos/id/1005/200/200?grayscale',
    hp: 18000,
    maxHp: 20000,
    mp: 5000,
    maxMp: 8000,
    isBoss: true,
    buffs: [
      { id: '3', name: '尸毒', icon: 'skull', type: 'bad', stacks: 5 },
      { id: '4', name: '狂暴', icon: 'flame', type: 'good', stacks: 1 }
    ]
  });

  const [storyLog, setStoryLog] = useState<string[]>([
    "荒古禁地外围，九龙拉棺的传说依然流传。",
    "你感应到前方有一株万年灵药的气息。",
    "似乎有其他修士也在向此地聚集。",
  ]);

  const [battleLog, setBattleLog] = useState<string[]>([
    "遭遇 荒古圣体·遗骸！",
    "对方身上散发着腐朽却恐怖的气息...",
    "遗骸发出震天怒吼，音波震碎了周围的巨石！",
  ]);

  const [currentOptions, setCurrentOptions] = useState<ActionOption[]>([
    { id: '1', text: '潜行接近', type: 'neutral' },
    { id: '2', text: '神识探查', type: 'event' },
    { id: '3', text: '强行夺宝', type: 'combat' },
  ]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleAction = (option: ActionOption) => {
    if (option.type === 'combat') {
      setGameMode(GameMode.BATTLE);
      setBattleLog(prev => [...prev, `你激活了苦海异象，准备迎战！`]);
      setCurrentOptions([
         { id: 'b1', text: '六道轮回拳', desc: '刚猛无俦，破灭万法', type: 'combat' },
         { id: 'b2', text: '皆字秘', desc: '十倍战力，触发几率极低', type: 'combat' },
         { id: 'b3', text: '万物母气鼎', desc: '玄黄之气，攻防一体', type: 'combat' },
         { id: 'b4', text: '斗字秘', desc: '演化万千攻伐之术', type: 'combat' },
      ]);
    } else {
      if (gameMode === GameMode.BATTLE) {
          setGameMode(GameMode.EXPLORE);
      }
      setStoryLog(prev => [...prev, `你选择了 ${option.text}。`]);
    }
  };

  const handleCustomAction = (text: string) => {
    setStoryLog(prev => [...prev, `你尝试${text}。`]);
  };

  const handleNextDay = () => {
    setDay(prev => prev + 1);
    setStoryLog(prev => [...prev, `\n--- 岁月如梭 第 ${day + 1} 天 ---`, "修行无岁月，寒尽不知年。"]);
  };

  const handleTravel = (node: MapNode) => {
      setPlayerStats(prev => ({ ...prev, location: node.name }));
      setShowMap(false);
      setStoryLog(prev => [...prev, `\n你御剑飞行，抵达了【${node.name}】。`, node.desc]);
  };

  return (
    <div className="fixed inset-0 bg-[#050505] text-stone-200 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Background Layer */}
      <div className="absolute inset-0 bg-ink-texture opacity-30 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-900 to-black z-0"></div>

      {/* Floating Particles (CSS Animation) */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold-base rounded-full opacity-20 animate-float" style={{ animationDuration: '6s' }}></div>
      <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-jade-base rounded-full opacity-10 animate-float" style={{ animationDuration: '8s' }}></div>

      {/* Top Header */}
      <Header stats={playerStats} onToggleFullscreen={handleToggleFullscreen} />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 w-full overflow-hidden">
        
        {/* VIEW: HOME */}
        <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${viewMode === ViewMode.HOME ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
           <HomeDashboard isVisible={viewMode === ViewMode.HOME} />
        </div>

        {/* VIEW: ADVENTURE */}
        <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${viewMode === ViewMode.ADVENTURE ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
          <GameDisplay 
            isVisible={viewMode === ViewMode.ADVENTURE}
            mode={gameMode}
            storyLog={storyLog}
            battleLog={battleLog}
            playerStats={playerStats}
            enemyStats={enemyStats}
          />
           <ActionPanel 
            isVisible={viewMode === ViewMode.ADVENTURE}
            options={currentOptions}
            onSelectOption={handleAction}
            onCustomAction={handleCustomAction}
            onNextDay={handleNextDay}
            gameMode={gameMode}
            onOpenMap={() => setShowMap(true)}
          />
        </div>

      </main>

      {/* Map Overlay */}
      <WorldMap 
        isVisible={showMap} 
        onClose={() => setShowMap(false)} 
        onTravel={handleTravel}
      />

      {/* Bottom Navigation Dock */}
      {gameMode !== GameMode.BATTLE && (
        <NavigationDock currentView={viewMode} onChangeView={setViewMode} />
      )}

    </div>
  );
}