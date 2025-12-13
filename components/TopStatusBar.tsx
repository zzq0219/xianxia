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

  // 紧凑模式：只显示关键信息 - 水墨风格
  if (layout.isCompact) {
    return (
      <header
        className={`fixed top-0 left-0 right-0 h-12 bg-gradient-to-b from-ink-950/95 to-ink-900/80 backdrop-blur-md px-2 flex justify-between items-center z-30 font-serif text-xs transition-transform duration-300 border-b border-gold-600/10 ${isScrollingDown ? '-translate-y-full' : 'translate-y-0'
          }`}
      >
        {/* 左侧：个人信息（紧凑版） */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 bg-ink-900/60 px-2 py-1 rounded-lg border border-gold-600/20 hover:border-gold-500/40 hover:bg-ink-800/70 transition-all duration-300 active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-ink-800 flex items-center justify-center text-gold-500 text-xs border border-gold-600/30">
            <i className="fa-solid fa-user"></i>
          </div>
          <span className="text-ink-100 font-semibold text-xs">{playerProfile.name}</span>
        </button>

        {/* 中间：地点 */}
        <div className="bg-ink-900/60 px-3 py-1 rounded-lg border border-gold-600/20">
          <p className="text-ink-100 font-semibold text-xs tracking-wide">{location}</p>
        </div>

        {/* 右侧：灵石 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-ink-900/60 px-2 py-1 rounded-lg border border-gold-600/20">
            <i className="fa-solid fa-gem text-gold-500 text-sm"></i>
            <span className="text-ink-100 font-bold text-xs">{playerProfile.spiritStones}</span>
          </div>
          <button onClick={toggleFullscreen} className="w-8 h-8 flex items-center justify-center bg-ink-900/60 rounded-lg border border-gold-600/20 hover:border-gold-500/40 hover:bg-ink-800/70 transition-all duration-300 active:scale-95">
            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-gold-500 text-sm`}></i>
          </button>
        </div>
      </header>
    );
  }

  // 正常模式：完整显示 - 水墨风格
  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-ink-950/90 to-transparent backdrop-blur-md p-3 flex justify-between items-center z-30 font-serif text-sm transition-transform duration-300 ${isScrollingDown ? '-translate-y-full' : 'translate-y-0'
        }`}
    >
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

      {/* 左侧：个人信息 */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <button
          onClick={onProfileClick}
          className="flex items-center gap-3 bg-ink-900/70 p-2 pr-4 rounded-lg border border-gold-600/25 hover:border-gold-500/40 hover:bg-ink-800/80 transition-all duration-300 active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center text-gold-500 border border-gold-600/30">
            <i className="fa-solid fa-user"></i>
          </div>
          <div>
            <h2 className="font-semibold text-ink-100">{playerProfile.name}</h2>
            <p className="text-xs text-gold-500">{playerProfile.title}</p>
          </div>
        </button>
      </div>

      {/* 中间：地点 */}
      <div className="absolute left-1/2 -translate-x-1/2 bg-ink-900/70 px-6 py-2 rounded-lg border border-gold-600/25 backdrop-blur-sm">
        <p className="text-ink-100 font-semibold whitespace-nowrap tracking-wide">{location}</p>
      </div>

      {/* 右侧：灵石 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 bg-ink-900/70 p-2 pl-4 rounded-lg border border-gold-600/25 pointer-events-auto backdrop-blur-sm">
          <i className="fa-solid fa-gem text-gold-500 text-lg"></i>
          <span className="text-ink-100 font-bold text-lg">{playerProfile.spiritStones}</span>
        </div>
        <button onClick={toggleFullscreen} className="w-10 h-10 flex items-center justify-center bg-ink-900/70 rounded-lg border border-gold-600/25 hover:border-gold-500/40 hover:bg-ink-800/80 transition-all duration-300 active:scale-95">
          <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-gold-500 text-lg`}></i>
        </button>
      </div>
    </header>
  );
};

export default TopStatusBar;