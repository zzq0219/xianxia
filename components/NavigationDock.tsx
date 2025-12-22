import React from 'react';
import { ViewMode } from '../types';

interface NavigationDockProps {
    currentView: ViewMode;
    onChangeView: (view: ViewMode) => void;
}

export const NavigationDock: React.FC<NavigationDockProps> = ({ currentView, onChangeView }) => {
    const navItems = [
        {
            id: ViewMode.HOME,
            label: '洞府',
            icon: 'fa-solid fa-dungeon', // Or fa-house-chimney
            color: 'text-emerald-500'
        },
        {
            id: ViewMode.ADVENTURE,
            label: '探险',
            icon: 'fa-solid fa-map-location-dot',
            color: 'text-amber-500'
        },
        {
            id: ViewMode.INVENTORY,
            label: '储物袋',
            icon: 'fa-solid fa-sack-dollar',
            color: 'text-blue-500'
        }
    ];

    return (
        <div className="w-full z-50 px-2 sm:px-4 py-2 bg-[#050505] border-t border-white/5 shadow-2xl safe-area-pb">
            <div className="max-w-md mx-auto relative flex justify-around items-end bg-[#0c0c0c] rounded-full border border-white/5 shadow-inner p-2 ring-1 ring-white/5">
                {/* Decorative golden line top */}
                <div className="absolute -top-[1px] left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChangeView(item.id)}
                            className={`relative flex flex-col items-center justify-center transition-all duration-500 ${isActive ? '-translate-y-5' : 'translate-y-0'
                                }`}
                        >
                            {/* Glow Effect for Active Tab */}
                            {isActive && (
                                <>
                                    <div className={`absolute -inset-4 rounded-full blur-2xl opacity-40 ${item.color}`}></div>
                                    <div className="absolute -bottom-2 w-12 h-1 bg-black/50 blur-sm rounded-full"></div>
                                </>
                            )}

                            {/* Button Body */}
                            <div className={`
                                relative flex items-center justify-center rounded-full border transition-all duration-500 z-10
                                ${isActive
                                    ? `w-16 h-16 ${item.color} border-amber-500/30 bg-[#151515] shadow-[0_0_20px_-5px_currentColor] ring-1 ring-white/10`
                                    : 'w-12 h-12 text-stone-500 border-transparent hover:bg-white/5 hover:text-stone-300'
                                }
                            `}>
                                {/* Active Inner Decoration */}
                                {isActive && <div className="absolute inset-1 rounded-full border border-white/5"></div>}

                                <i className={`${item.icon} ${isActive ? 'text-2xl drop-shadow-[0_0_8px_currentColor]' : 'text-xl'}`}></i>
                            </div>

                            {/* Label */}
                            <span className={`
                                absolute -bottom-6 text-[10px] font-bold font-serif tracking-widest transition-all duration-500 whitespace-nowrap
                                ${isActive ? `${item.color.replace('text-', 'text-')} opacity-100 translate-y-0` : 'text-stone-600 opacity-0 -translate-y-2'}
                            `}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};