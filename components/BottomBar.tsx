

import React, { useState } from 'react';
import { GameState, ModalType } from '../types';

interface BottomBarProps {
    gameState: GameState;
    isLoading: boolean;
    error: string | null;
    onExplorationAction: (action: string) => void;
    onNavClick: (modal: ModalType) => void;
    onMapClick: () => void;
    onInteractClick: () => void;
    onTelepathyClick: () => void;
    onSystemClick: () => void;
    onQuestClick: () => void;
    onBusinessClick: () => void;
    onNextDay: () => void;
    onHospitalClick: () => void;
    onBountyBoardClick: () => void;
}

const NavIconButton: React.FC<{ label: string; icon: string; onClick: () => void; color?: string }> = ({ label, icon, onClick, color }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-14 h-14 text-stone-300 rounded-lg bg-stone-900/50 hover:bg-stone-800/80 hover:text-white transition-colors duration-200 group relative border border-yellow-400/20 ${color}`}
        title={label}
    >
        <i className={`${icon} text-xl`}></i>
        <span className="text-[10px] mt-1 font-semibold">{label}</span>
    </button>
);


export const BottomBar: React.FC<BottomBarProps> = (props) => {
    const { gameState, isLoading, error, onExplorationAction, onNavClick, onMapClick, onInteractClick, onTelepathyClick, onSystemClick, onQuestClick, onBusinessClick, onNextDay, onHospitalClick, onBountyBoardClick } = props;
    const [customInput, setCustomInput] = useState('');

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customInput.trim() && !isLoading) {
            onExplorationAction(customInput.trim());
            setCustomInput('');
        }
    };

    const navItems: { label: ModalType; icon: string }[] = [
        { label: '队伍', icon: 'fa-solid fa-users' },
        { label: '背包', icon: 'fa-solid fa-briefcase' },
        { label: '商城', icon: 'fa-solid fa-store' },
        { label: '任务', icon: 'fa-solid fa-scroll' },
        { label: '竞技场', icon: 'fa-solid fa-trophy' },
    ];

    return (
        <footer className="absolute bottom-0 left-0 right-0 h-auto md:h-28 bg-gradient-to-t from-black/90 via-black/80 to-transparent p-2 z-20">
            <div className="h-full w-full max-w-screen-lg mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
                {/* Navigation Panel */}
                <div className="flex-shrink-0 flex flex-wrap justify-center gap-2">
                    <NavIconButton label="地图" icon="fa-solid fa-map-location-dot" onClick={onMapClick} />
                    <NavIconButton label="探查" icon="fa-solid fa-magnifying-glass" onClick={onInteractClick} />
                    <div className="w-px h-14 bg-yellow-400/20" />
                    {navItems.map(item => <NavIconButton key={item.label} label={item.label} icon={item.icon} onClick={() => item.label === '任务' ? onQuestClick() : onNavClick(item.label)} />)}
                    <div className="w-px h-14 bg-yellow-400/20" />
                    <NavIconButton label="传音" icon="fa-solid fa-om" onClick={onTelepathyClick} color="text-cyan-400" />
                    <NavIconButton label="产业" icon="fa-solid fa-store" onClick={onBusinessClick} />
                    <NavIconButton label="医馆" icon="fa-solid fa-hospital" onClick={onHospitalClick} />
                    <NavIconButton label="红尘录" icon="fa-solid fa-book-skull" onClick={onBountyBoardClick} />
                    <NavIconButton label="系统" icon="fa-solid fa-bars" onClick={onSystemClick} />
                </div>

                {/* Action Panel */}
                <div className="flex-grow w-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-24">
                            <div className="animate-glow text-amber-300 font-serif">天地变幻...</div>
                        </div>
                    ) : (
                        <>
                            {error && <div className="text-red-400 text-center mb-1 font-serif text-sm animate-shake">{error}</div>}
                           
                            <div className="flex flex-wrap justify-center gap-2 mb-2">
                                {gameState.exploration.choices.map((choice, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onExplorationAction(choice)}
                                        className="flex-grow basis-40 text-center bg-stone-800/80 px-3 py-2 rounded-md hover:bg-stone-700/80 hover:border-amber-400/50 border border-transparent transition-all duration-200 font-serif shadow-md text-sm"
                                    >
                                        {choice}
                                    </button>
                                ))}
                            </div>
                            <form onSubmit={handleCustomSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="或输入你的行动..."
                                    className="flex-1 bg-stone-900/80 border border-stone-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif shadow-inner shadow-black/50 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!customInput.trim()}
                                    className="bg-amber-600 text-white font-bold px-4 py-1.5 rounded-md hover:bg-amber-500 transition-colors duration-200 disabled:opacity-50 font-serif shadow-md text-sm"
                                >
                                    确定
                                </button>
                                <button
                                    type="button"
                                    onClick={onNextDay}
                                    className="bg-indigo-600 text-white font-bold px-4 py-1.5 rounded-md hover:bg-indigo-500 transition-colors duration-200 shadow-md text-sm"
                                >
                                    下一天
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </footer>
    );
};