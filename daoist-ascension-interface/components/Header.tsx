import React from 'react';
import { MapPin, Coins, Maximize2, Sparkles } from 'lucide-react';
import { PlayerStats } from '../types';

interface HeaderProps {
  stats: PlayerStats;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, onToggleFullscreen }) => {
  return (
    <header className="relative z-30 flex items-start justify-between px-3 py-2 pointer-events-none">
      
      {/* Left: Player Plaque */}
      <div className="pointer-events-auto flex items-center gap-3 bg-gradient-to-r from-black/80 to-transparent p-2 rounded-l-lg border-l-4 border-vermilion-600 shadow-lg backdrop-blur-sm">
        <div className="relative">
           <div className="w-16 h-16 rounded-lg border-2 border-gold-500 overflow-hidden relative z-10">
             <img src={stats.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
           </div>
           {/* Realm Tag */}
           <div className="absolute -bottom-2 -right-2 bg-ink-base border border-gold-500 text-gold-500 text-[10px] px-2 py-0.5 rounded-full z-20 font-serif whitespace-nowrap">
             {stats.realm}
           </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[120px]">
          <h1 className="text-paper text-xl font-cursive text-shadow">{stats.name}</h1>
          
          {/* HP Bar */}
          <div className="relative w-full h-3 bg-stone-800 border border-stone-600 rounded-sm">
            <div 
              className="absolute left-0 top-0 h-full bg-vermilion-600 transition-all duration-500"
              style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
            ></div>
          </div>
          {/* MP Bar */}
          <div className="relative w-full h-2 bg-stone-800 border border-stone-600 rounded-sm mt-0.5">
            <div 
              className="absolute left-0 top-0 h-full bg-spirit-blue transition-all duration-500"
              style={{ width: `${(stats.mp / stats.maxMp) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Right: Resources & Location HUD */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-ink-black/80 border-y border-gold-500/50 px-4 py-1">
                <MapPin size={14} className="text-paper" />
                <span className="text-paper font-serif">{stats.location}</span>
            </div>
            
            <button 
                onClick={onToggleFullscreen}
                className="w-8 h-8 flex items-center justify-center bg-ink-black/80 border border-gold-500/50 hover:bg-gold-500/20 text-gold-500 transition-colors"
            >
                <Maximize2 size={16} />
            </button>
        </div>

        <div className="flex items-center gap-2 bg-ink-black/80 px-3 py-1 rounded-bl-xl border-b border-l border-gold-500 shadow-lg">
             <Coins size={16} className="text-yellow-400 animate-pulse" />
             <span className="text-yellow-100 font-mono font-bold tracking-widest">{stats.spiritStones.toLocaleString()}</span>
             <span className="text-xs text-stone-500">灵石</span>
        </div>
      </div>

    </header>
  );
};