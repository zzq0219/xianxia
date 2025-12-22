import React from 'react';
import { useResponsiveLayout, useScrollDirection } from '../hooks/useResponsiveLayout';
import { PlayerProfile } from '../types';

import { useFullscreen } from '../hooks/useFullscreen';

interface TopStatusBarProps {
  playerProfile: PlayerProfile;
  location: string;
  onProfileClick: () => void;
  appRef: React.RefObject<HTMLDivElement>;
}

const TopStatusBar: React.FC<TopStatusBarProps> = ({ playerProfile, location, onProfileClick, appRef }) => {
  const layout = useResponsiveLayout();
  const isScrollingDown = useScrollDirection();
  const { isFullscreen, toggleFullscreen } = useFullscreen(appRef);

  // 全屏模式下强制显示顶栏（即使在迷你模式）
  // 只在非全屏且shouldHideTopBar为true时才隐藏
  if (layout.shouldHideTopBar && !isFullscreen) {
    return null;
  }

  // 紧凑模式：只显示关键信息
  if (layout.isCompact) {
    return (
      <header
        className={`fixed top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/90 to-black/60 backdrop-blur-sm px-2 flex justify-between items-center z-30 font-serif text-xs transition-transform duration-300 ${isScrollingDown ? '-translate-y-full' : 'translate-y-0'
          }`}
      >
        {/* 左侧：个人信息（紧凑版） */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-full border border-yellow-400/20 hover:bg-black/60 transition-all active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-slate-700/80 flex items-center justify-center text-yellow-400 text-xs">
            <i className="fa-solid fa-user"></i>
          </div>
          <span className="text-white font-semibold text-xs">{playerProfile.name}</span>
        </button>

        {/* 中间：地点 */}
        <div className="bg-black/40 px-3 py-1 rounded-full border border-yellow-400/20">
          <p className="text-white font-semibold text-xs">{location}</p>
        </div>

        {/* 右侧：灵石 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-yellow-400/20">
            <i className="fa-solid fa-gem text-yellow-400 text-sm"></i>
            <span className="text-white font-bold text-xs">{playerProfile.spiritStones}</span>
          </div>
          <button onClick={toggleFullscreen} className="w-8 h-8 flex items-center justify-center bg-black/40 rounded-full border border-yellow-400/20 hover:bg-black/60 transition-all active:scale-95">
            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-yellow-400 text-sm`}></i>
          </button>
        </div>
      </header>
    );
  }

  // 正常模式：完整显示
  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#050505]/95 via-[#0a0a0a]/80 to-transparent backdrop-blur-md px-4 flex justify-between items-center z-30 font-serif text-sm transition-transform duration-300 border-b border-white/5 shadow-2xl ${isScrollingDown ? '-translate-y-full' : 'translate-y-0'
        }`}
    >
      {/* 装饰性背景 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-900/30 to-transparent"></div>

      {/* 左侧：个人信息 */}
      <div className="flex items-center gap-4 pointer-events-auto z-10">
        <button
          onClick={onProfileClick}
          className="group flex items-center gap-3 bg-[#111] p-1.5 pr-4 rounded-full border border-stone-800 hover:border-amber-500/30 hover:bg-black/80 transition-all duration-300 active:scale-95 shadow-lg ring-1 ring-white/5"
        >
          <div className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center text-amber-500 border border-stone-700 group-hover:border-amber-500/50 transition-colors shadow-inner">
            {playerProfile.avatar ? (
              <img src={playerProfile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover opacity-90 group-hover:opacity-100" />
            ) : (
              <i className="fa-solid fa-user-taoism text-lg"></i>
            )}
          </div>
          <div className="flex flex-col items-start">
            <h2 className="font-bold text-stone-200 group-hover:text-amber-100 transition-colors tracking-wide leading-tight">{playerProfile.name}</h2>
            <p className="text-[10px] text-amber-500/80 font-medium tracking-wider">{playerProfile.title}</p>
          </div>
        </button>
      </div>

      {/* 右侧：资源与位置 */}
      <div className="flex items-center gap-3 pointer-events-auto z-10">
        <div className="flex items-center gap-3 bg-[#111]/80 pl-4 pr-2 py-1.5 rounded-full border border-stone-800 shadow-lg backdrop-blur-md ring-1 ring-white/5">
          {/* 灵石 */}
          <div className="flex items-center gap-1.5 border-r border-stone-700/50 pr-3">
            <i className="fa-solid fa-coins text-amber-400 text-xs drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]"></i>
            <span className="text-stone-200 font-bold font-mono text-sm">{playerProfile.spiritStones}</span>
          </div>
          {/* 地点 */}
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-xs text-stone-400 font-serif">{location}</span>
            <i className="fa-solid fa-location-dot text-[10px] text-emerald-500/80"></i>
          </div>
        </div>

        <button onClick={toggleFullscreen} className="w-9 h-9 flex items-center justify-center bg-[#111] rounded-full border border-stone-800 hover:border-stone-600 hover:text-amber-400 text-stone-500 transition-all active:scale-95 shadow-lg ring-1 ring-white/5">
          <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-xs`}></i>
        </button>
      </div>
    </header>
  );
};

export default TopStatusBar;