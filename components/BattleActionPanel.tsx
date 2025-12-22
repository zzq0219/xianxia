
import React, { useState } from 'react';
import { BattleState, Skill } from '../types';
import ActionSelectionMenu from './ActionSelectionMenu';

interface BattleActionPanelProps {
    battleState: BattleState;
    isLoading: boolean;
    onCombatAction: (action: string) => void;
    onFlee: () => void;
    onOpenCombatLog: () => void;
}

const BattleActionPanel: React.FC<BattleActionPanelProps> = ({ battleState, isLoading, onCombatAction, onFlee, onOpenCombatLog }) => {
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    const activeCard = battleState.playerParty[battleState.activePlayerCardIndex];
    const isPlayerTurn = battleState.turn === 'player' && !battleState.isBattleOver && !isLoading;

    const handleActionSelected = (action: string | Skill) => {
        const actionName = typeof action === 'string' ? action : action.name;
        onCombatAction(actionName);
        setIsActionMenuOpen(false);
    };

    return (
        <>
            <footer className="w-full h-32 bg-gradient-to-t from-black via-stone-900 to-stone-800/90 p-4 flex items-center justify-center border-t-2 border-stone-600/50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-20 relative backdrop-blur-sm">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

                <div className="flex items-center justify-center gap-8 md:gap-16 w-full max-w-4xl relative">

                    {/* Left Button: Combat Log */}
                    <button
                        onClick={onOpenCombatLog}
                        className="
                            group relative w-24 h-24 rounded-full bg-stone-800 border-2 border-stone-600
                            hover:border-stone-400 hover:bg-stone-700 transition-all duration-300
                            shadow-lg shadow-black flex flex-col items-center justify-center
                        "
                    >
                        <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📜</span>
                        <span className="text-xs font-serif text-stone-400 group-hover:text-stone-200">战况</span>
                    </button>

                    {/* Center Button: Action (Main CTA) */}
                    <div className="relative -mt-8">
                        <button
                            onClick={() => setIsActionMenuOpen(true)}
                            disabled={!isPlayerTurn}
                            className={`
                                w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center z-10 relative
                                transition-all duration-300 transform hover:scale-105 active:scale-95
                                shadow-[0_0_25px_rgba(0,0,0,0.6)]
                                ${!isPlayerTurn
                                    ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed opacity-80'
                                    : 'bg-gradient-to-br from-sky-900 to-blue-900 border-sky-400/60 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] animate-pulse-slow'
                                }
                            `}
                        >
                            <span className="text-4xl mb-1 drop-shadow-md">⚔️</span>
                            <span className="text-xl font-bold font-serif tracking-widest drop-shadow-md">出招</span>
                        </button>
                        {/* Glow effect behind main button */}
                        {isPlayerTurn && (
                            <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl -z-10 animate-pulse"></div>
                        )}
                    </div>

                    {/* Right Button: Flee */}
                    <button
                        onClick={onFlee}
                        className="
                            group relative w-24 h-24 rounded-full bg-stone-800 border-2 border-stone-600
                            hover:border-red-500/50 hover:bg-red-900/20 transition-all duration-300
                            shadow-lg shadow-black flex flex-col items-center justify-center
                        "
                    >
                        <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🏃</span>
                        <span className="text-xs font-serif text-stone-400 group-hover:text-red-300">撤退</span>
                    </button>
                </div>
            </footer>
            {isActionMenuOpen && (
                <ActionSelectionMenu
                    activeCard={activeCard}
                    onAction={handleActionSelected}
                    onClose={() => setIsActionMenuOpen(false)}
                />
            )}
        </>
    );
};

export default BattleActionPanel;