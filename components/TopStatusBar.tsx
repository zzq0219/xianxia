import React from 'react';
import { PlayerProfile } from '../types';

interface TopStatusBarProps {
  playerProfile: PlayerProfile;
  location: string;
  onProfileClick: () => void;
}

const TopStatusBar: React.FC<TopStatusBarProps> = ({ playerProfile, location, onProfileClick }) => {
  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent p-3 flex justify-between items-center z-20 font-serif text-sm pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        <button onClick={onProfileClick} className="flex items-center gap-3 bg-black/50 p-2 pr-4 rounded-full border border-yellow-400/20 hover:bg-black/70 transition-colors shadow-lg">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-yellow-400 border border-yellow-400/30">
            <i className="fa-solid fa-user"></i>
          </div>
          <div>
            <h2 className="font-semibold text-white">{playerProfile.name}</h2>
            <p className="text-xs text-yellow-300">{playerProfile.title}</p>
          </div>
        </button>
      </div>
      <div className="text-center bg-black/50 px-6 py-2 rounded-full border border-yellow-400/20 shadow-lg">
        <p className="text-white font-semibold">{location}</p>
      </div>
      <div className="flex items-center gap-3 bg-black/50 p-2 pl-4 rounded-full border border-yellow-400/20 shadow-lg pointer-events-auto">
        <i className="fa-solid fa-gem text-yellow-400 text-lg"></i>
        <span className="text-white font-bold text-lg">{playerProfile.spiritStones}</span>
      </div>
    </header>
  );
};

export default TopStatusBar;