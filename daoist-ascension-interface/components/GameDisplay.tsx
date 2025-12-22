import React, { useEffect, useRef } from 'react';
import { GameMode, PlayerStats, EnemyStats, Buff } from '../types';
import { Wind, Skull, Shield, Zap, Flame, Droplets } from 'lucide-react';

interface GameDisplayProps {
  isVisible: boolean;
  mode: GameMode;
  storyLog: string[];
  battleLog: string[];
  playerStats: PlayerStats;
  enemyStats: EnemyStats;
}

// Helper to render buff icon
const BuffIcon: React.FC<{ buff: Buff }> = ({ buff }) => {
  const getIcon = () => {
    switch (buff.icon) {
      case 'shield': return <Shield size={10} />;
      case 'zap': return <Zap size={10} />;
      case 'skull': return <Skull size={10} />;
      case 'flame': return <Flame size={10} />;
      default: return <Droplets size={10} />;
    }
  };

  return (
    <div className={`
      flex items-center justify-center w-5 h-5 rounded border text-[10px] relative
      ${buff.type === 'good' ? 'bg-jade-900 border-jade-500 text-jade-200' : 'bg-red-900 border-red-500 text-red-200'}
    `}>
      {getIcon()}
      <span className="absolute -bottom-1 -right-1 bg-black text-white text-[8px] px-0.5 rounded leading-none border border-stone-700">
        {buff.stacks}
      </span>
    </div>
  );
};

export const GameDisplay: React.FC<GameDisplayProps> = ({ 
  isVisible, mode, storyLog, battleLog, playerStats, enemyStats 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storyLog, battleLog, mode, isVisible]);

  if (!isVisible) return null;

  // --- BATTLE MODE RENDER ---
  if (mode === GameMode.BATTLE) {
    const enemyHpPercent = (enemyStats.hp / enemyStats.maxHp) * 100;
    const enemyMpPercent = (enemyStats.mp / enemyStats.maxMp) * 100;
    
    const playerHpPercent = (playerStats.hp / playerStats.maxHp) * 100;
    const playerMpPercent = (playerStats.mp / playerStats.maxMp) * 100;

    return (
      <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden bg-black font-sans">
         {/* Background FX */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 animate-pulse"></div>
         {/* Rotating aura behind */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-red-900/10 to-transparent animate-spin-slow opacity-50 pointer-events-none"></div>

         {/* --- 1. ENEMY AREA (Top) --- */}
         <div className="flex-none pt-8 pb-2 flex flex-col items-center z-10 animate-slide-up">
            
            {/* Avatar & Realm */}
            <div className="relative mb-2 group">
               <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl animate-pulse"></div>
               <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-red-900/80 overflow-hidden relative shadow-[0_0_20px_rgba(220,38,38,0.5)] bg-black">
                 <img src={enemyStats.avatarUrl} alt="Enemy" className="w-full h-full object-cover" />
               </div>
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black border border-red-800 text-red-300 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap z-20 font-serif tracking-widest">
                  {enemyStats.realm}
               </div>
            </div>

            {/* Info Bars */}
            <div className="w-56 sm:w-64 flex flex-col gap-1 items-center">
               <div className="text-red-100 font-title text-xl tracking-widest drop-shadow-md">{enemyStats.name}</div>
               
               {/* HP */}
               <div className="w-full h-2.5 bg-stone-900 border border-stone-800 skew-x-[-15deg] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-300" style={{ width: `${enemyHpPercent}%` }}></div>
               </div>
               {/* MP */}
               <div className="w-48 h-1.5 bg-stone-900 border border-stone-800 skew-x-[-15deg] relative overflow-hidden opacity-90">
                   <div className="absolute inset-0 bg-blue-600/80 transition-all duration-300" style={{ width: `${enemyMpPercent}%` }}></div>
               </div>

               {/* Buffs */}
               <div className="flex gap-1 mt-1 justify-center min-h-[20px]">
                  {enemyStats.buffs.map((buff) => <BuffIcon key={buff.id} buff={buff} />)}
               </div>
            </div>
         </div>

         {/* --- 2. BATTLE LOG (Middle - Flexible Spacer) --- */}
         <div className="flex-1 flex flex-col justify-center items-center relative z-10 min-h-0 py-2">
            {/* Text Container with gradient fade mask */}
            <div 
              className="w-full max-w-md px-6 flex flex-col items-center"
              style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
            >
               <div ref={scrollRef} className="max-h-48 overflow-y-auto no-scrollbar w-full text-center space-y-4 pb-4">
                  {battleLog.slice(-5).map((log, index) => {
                     const isLast = index === battleLog.slice(-5).length - 1;
                     return (
                      <div key={index} className="animate-fade-in flex flex-col items-center">
                          {/* Separator line for aesthetic */}
                          {index > 0 && <div className="w-8 h-[1px] bg-white/10 mb-2"></div>}
                          
                          <p className={`
                            font-serif tracking-widest leading-relaxed transition-all duration-500
                            ${isLast ? 'text-lg sm:text-xl text-yellow-50 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] scale-105' : 'text-sm text-stone-400 opacity-60'}
                          `}>
                            {log}
                          </p>
                      </div>
                     );
                  })}
               </div>
            </div>
         </div>

         {/* --- 3. PLAYER AREA (Bottom) --- */}
         <div className="flex-none pb-28 sm:pb-32 px-4 flex items-end justify-between z-10 animate-slide-up w-full max-w-4xl mx-auto">
            {/* Player Stats Left */}
            <div className="flex items-end gap-3">
               <div className="relative w-16 h-16 rounded border border-gold-600/60 overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.2)] bg-black">
                  <img src={playerStats.avatarUrl} alt="Player" className="w-full h-full object-cover" />
               </div>

               <div className="flex flex-col gap-1 pb-0.5">
                  <div className="text-gold-light font-cursive text-xl leading-none drop-shadow-md">{playerStats.name}</div>
                  
                  {/* HP */}
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-3 bg-stone-900 border border-stone-700 rounded-sm relative overflow-hidden shadow-inner">
                       <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-500 transition-all duration-300" style={{ width: `${playerHpPercent}%` }}></div>
                       <div className="absolute inset-0 flex items-center justify-center text-[9px] text-white/90 font-mono tracking-widest">{playerStats.hp}</div>
                    </div>
                  </div>

                  {/* MP */}
                  <div className="w-28 h-2 bg-stone-900 border border-stone-700 rounded-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-600 transition-all duration-300" style={{ width: `${playerMpPercent}%` }}></div>
                  </div>

                  {/* Buffs */}
                  <div className="flex gap-1 mt-1">
                     {playerStats.buffs.map((buff) => <BuffIcon key={buff.id} buff={buff} />)}
                  </div>
               </div>
            </div>
            
            {/* Empty Right side to balance layout if needed, or keeping it clean */}
            <div></div>
         </div>
      </div>
    );
  }

  // --- EXPLORE MODE RENDER ---
  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pt-4 pb-32 animate-fade-in relative">
      <div className="absolute inset-x-4 top-2 bottom-32 border-x border-stone-800/30 pointer-events-none"></div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar relative z-10 px-2">
         {storyLog.map((log, index) => (
           <div key={index} className={`mb-5 transition-all duration-500 ${index === storyLog.length - 1 ? 'opacity-100 translate-y-0' : 'opacity-70'}`}>
             <div className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold-dark/50 flex-shrink-0"></span>
                <p className="text-stone-200 text-lg font-serif leading-loose tracking-wide text-justify">
                  {log}
                </p>
             </div>
           </div>
         ))}
         <div className="h-20 flex justify-center items-center opacity-30">
           <Wind className="text-stone-500 animate-float" size={20} />
         </div>
      </div>
    </div>
  );
};