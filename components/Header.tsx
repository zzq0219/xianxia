import React from 'react';
import { ModalType, PlayerProfile } from '../types';

interface HeaderProps {
  playerProfile: PlayerProfile;
  location: string;
  time: string;
  onNavClick: (modal: ModalType) => void;
  onLocationClick: () => void;
  onInteractClick: () => void;
  onProfileClick: () => void;
}

const NavIconButton: React.FC<{ label: ModalType; icon: React.ReactNode; onClick: () => void; }> = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center w-11 h-11 text-ink-300 rounded-lg bg-ink-900/60 hover:bg-ink-800/80 hover:text-gold-400 transition-all duration-300 group relative border border-gold-600/20 hover:border-gold-500/40"
    title={label}
  >
    {icon}
    <span className="absolute bottom-full mb-2 hidden group-hover:block bg-ink-900/95 text-gold-400 text-xs px-2 py-1 rounded border border-gold-600/30 whitespace-nowrap">
      {label}
    </span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ playerProfile, location, time, onNavClick, onLocationClick, onInteractClick, onProfileClick }) => {
  const navItems: { label: ModalType; icon: React.ReactNode }[] = [
    { label: '队伍', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { label: '背包', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12l-2.585-2.585a2 2 0 00-2.828 0L12 12l-2.585-2.585a2 2 0 00-2.828 0L4 12m16 0l-2.585 2.585a2 2 0 01-2.828 0L12 12l-2.585 2.585a2 2 0 01-2.828 0L4 12" /></svg> },
    { label: '商城', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { label: '竞技场', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  ];
  const worldIcons = [
    { label: '探查四周', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, onClick: onInteractClick },
    { label: '世界地图', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10l6-3m0 0V7" /></svg>, onClick: onLocationClick },
  ]

  return (
    <header className="flex-shrink-0 bg-ink-950/80 p-3 flex justify-between items-center border-b border-gold-600/15 backdrop-blur-md font-serif relative">
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gold-400 tracking-[0.2em] brush-text">天命</h1>
        <div className="w-px h-8 bg-gold-600/20"></div>
        <div className="flex items-center gap-2">
          {worldIcons.map(item => <NavIconButton key={item.label} label={item.label as ModalType} icon={item.icon} onClick={item.onClick} />)}
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2">
        <button
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center bg-ink-900/70 px-6 py-2 rounded-lg border border-gold-600/25 hover:border-gold-500/40 hover:bg-ink-800/80 transition-all duration-300"
        >
          <h2 className="text-lg font-semibold text-ink-100">{playerProfile.name} - <span className="text-gold-400">{playerProfile.title}</span></h2>
          <div className="flex items-center gap-2 text-sm text-gold-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            <span>{playerProfile.spiritStones}</span>
          </div>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right text-sm">
          <p className="text-ink-200 font-semibold">{location}</p>
          <p className="text-ink-500">{time}</p>
        </div>
        <div className="w-px h-8 bg-gold-600/20"></div>
        <nav className="flex items-center space-x-2">
          {navItems.map(item => (
            <NavIconButton key={item.label} label={item.label} icon={item.icon} onClick={() => onNavClick(item.label)} />
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;