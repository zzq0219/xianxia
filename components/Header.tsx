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
    className="flex items-center justify-center w-12 h-12 text-gray-300 rounded-full bg-slate-900/50 hover:bg-slate-700/80 hover:text-white transition-colors duration-200 group relative border border-slate-700/50"
    title={label}
  >
    {icon}
    <span className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs px-2 py-1 rounded-md">
        {label}
    </span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ playerProfile, location, time, onNavClick, onLocationClick, onInteractClick, onProfileClick }) => {
  const navItems: { label: ModalType; icon: React.ReactNode }[] = [
    { label: '队伍', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { label: '背包', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12l-2.585-2.585a2 2 0 00-2.828 0L12 12l-2.585-2.585a2 2 0 00-2.828 0L4 12m16 0l-2.585 2.585a2 2 0 01-2.828 0L12 12l-2.585 2.585a2 2 0 01-2.828 0L4 12" /></svg> },
    { label: '商城', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { label: '竞技场', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 1.75a2.25 2.25 0 00-2.25 2.25v.25h4.5V4A2.25 2.25 0 0012 1.75z" /><path fillRule="evenodd" d="M8.25 4.5v-.25A3.75 3.75 0 0112 1a3.75 3.75 0 013.75 3.25v.25h3a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V5.25a.75.75 0 01.75-.75h3zm-3 1.5v12h13.5v-12h-13.5z" clipRule="evenodd" /></svg> },
  ];
  const worldIcons = [
    { label: '探查四周', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, onClick: onInteractClick },
    { label: '世界地图', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10l6-3m0 0V7" /></svg>, onClick: onLocationClick },
  ]

  return (
    <header className="flex-shrink-0 bg-slate-900/70 p-3 flex justify-between items-center border-b border-slate-700/50 backdrop-blur-sm font-serif shadow-lg">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-widest">天命</h1>
         <div className="w-px h-8 bg-slate-700"></div>
        <div className="flex items-center gap-4">
             {worldIcons.map(item => <NavIconButton key={item.label} label={item.label as ModalType} icon={item.icon} onClick={item.onClick} />)}
        </div>
      </div>
      
      <div className="absolute left-1/2 -translate-x-1/2">
        <button 
            onClick={onProfileClick}
            className="flex flex-col items-center justify-center bg-slate-800/80 px-6 py-2 rounded-lg border border-slate-700 hover:bg-slate-700/80 transition-colors"
        >
            <h2 className="text-lg font-semibold text-white">{playerProfile.name} - <span className="text-amber-300">{playerProfile.title}</span></h2>
             <div className="flex items-center gap-2 text-sm text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                <span>{playerProfile.spiritStones}</span>
            </div>
        </button>
      </div>

      <div className="flex items-center space-x-4">
         <div className="text-right text-sm">
            <p className="text-white font-semibold">{location}</p>
            <p className="text-gray-400">{time}</p>
         </div>
         <div className="w-px h-8 bg-slate-700"></div>
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