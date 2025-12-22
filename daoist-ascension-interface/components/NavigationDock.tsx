import React from 'react';
import { ViewMode } from '../types';
import { Compass, Home, User, Backpack } from 'lucide-react';

interface NavigationDockProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
}

export const NavigationDock: React.FC<NavigationDockProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: ViewMode.HOME, label: '洞府', icon: Home },
    { id: ViewMode.ADVENTURE, label: '历练', icon: Compass },
    { id: ViewMode.CHARACTER, label: '储物', icon: Backpack }, // Simplified for demo
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50">
      {/* Decorative gradient fade at bottom */}
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none"></div>

      <nav className="relative max-w-lg mx-auto w-full px-6 pb-4 pt-6 flex justify-between items-end">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className="group flex flex-col items-center gap-1 relative"
            >
              {/* Active Glow Background */}
              {isActive && (
                <div className="absolute -top-4 w-12 h-12 bg-gold-base/20 blur-xl rounded-full animate-pulse"></div>
              )}

              {/* Icon Container */}
              <div className={`
                relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-b from-ink-800 to-black border border-gold-base -translate-y-4 shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                  : 'bg-transparent text-stone-500 hover:text-stone-300'}
              `}>
                <item.icon 
                  size={isActive ? 24 : 22} 
                  className={isActive ? 'text-gold-base' : 'opacity-70'} 
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </div>

              {/* Label */}
              <span className={`
                text-xs font-serif tracking-widest transition-colors duration-300
                ${isActive ? 'text-gold-light' : 'text-stone-600'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};