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
      className={`fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm p-3 flex justify-between items-center z-30 font-serif text-sm transition-transform duration-300 ${isScrollingDown ? '-translate-y-full' : 'translate-y-0'
        }`}
    >
      {/* 左侧：个人信息 */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <button
          onClick={onProfileClick}
          className="flex items-center gap-3 bg-black/50 p-2 pr-4 rounded-full border border-yellow-400/20 hover:bg-black/70 transition-all duration-200 active:scale-95 shadow-lg"
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-yellow-400 border border-yellow-400/30">
            <i className="fa-solid fa-user"></i>
          </div>
          <div>
            <h2 className="font-semibold text-white">{playerProfile.name}</h2>
            <p className="text-xs text-yellow-300">{playerProfile.title}</p>
          </div>
        </button>
      </div>

      {/* 中间：地点 */}
      <div className="absolute left-1/2 -translate-x-1/2 bg-black/50 px-6 py-2 rounded-full border border-yellow-400/20 shadow-lg backdrop-blur-sm">
        <p className="text-white font-semibold whitespace-nowrap">{location}</p>
      </div>

      {/* 右侧：灵石 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 bg-black/50 p-2 pl-4 rounded-full border border-yellow-400/20 shadow-lg pointer-events-auto backdrop-blur-sm">
          <i className="fa-solid fa-gem text-yellow-400 text-lg"></i>
          <span className="text-white font-bold text-lg">{playerProfile.spiritStones}</span>
        </div>
        <button onClick={toggleFullscreen} className="w-10 h-10 flex items-center justify-center bg-black/50 rounded-full border border-yellow-400/20 hover:bg-black/70 transition-all active:scale-95 shadow-lg">
          <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-yellow-400 text-lg`}></i>
        </button>
      </div>
    </header>
  );
};

export default TopStatusBar;