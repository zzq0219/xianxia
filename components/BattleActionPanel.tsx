
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
            <footer className="w-full h-28 bg-black/90 p-4 flex items-center justify-center border-t border-stone-700">
                <div className="flex items-center justify-center gap-4">
                    <button onClick={onOpenCombatLog} className="w-32 h-14 text-lg bg-stone-800/80 hover:bg-stone-700/80 rounded-md font-serif border border-stone-600/50">
                        记录
                    </button>

                    <button
                        onClick={() => setIsActionMenuOpen(true)}
                        disabled={!isPlayerTurn}
                        className="w-40 h-16 text-xl bg-sky-700/80 hover:bg-sky-600/90 rounded-lg font-serif border-2 border-sky-500/80 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/30"
                    >
                        行动
                    </button>

                    <button onClick={onFlee} className="w-32 h-14 text-lg bg-red-800/80 hover:bg-red-700/80 rounded-md font-serif border border-red-600/50 text-white">
                        逃命
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