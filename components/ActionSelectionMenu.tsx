

import React from 'react';
import { BattleParticipant } from '../types';

interface ActionSelectionMenuProps {
    activeCard: BattleParticipant;
    onAction: (action: string) => void;
    onClose: () => void;
}

const ActionButton: React.FC<{
    title: string;
    description: string;
    cost?: number;
    onClick?: () => void;
    disabled?: boolean;
}> = ({ title, description, cost, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="h-full w-full flex flex-col justify-between text-center bg-stone-700/80 p-3 rounded-lg hover:bg-stone-600/80 border border-stone-600/50 hover:border-amber-400/50 transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
    >
        <div>
            <div className="flex justify-center items-baseline gap-2">
                <span className="font-bold text-white text-base font-serif">{title}</span>
                {cost !== undefined && <span className="font-mono text-blue-400 text-xs">{cost}MP</span>}
            </div>
            <p className="text-xs text-amber-300 mt-1 group-hover:text-amber-200 font-serif whitespace-normal">
                {description}
            </p>
        </div>
    </button>
);

const ActionSelectionMenu: React.FC<ActionSelectionMenuProps> = ({ activeCard, onAction, onClose }) => {
    const { card } = activeCard;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-30 flex items-end justify-center"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl bg-stone-800/90 backdrop-blur-lg rounded-t-xl border-t border-yellow-400/20 p-5 shadow-2xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ gridAutoRows: '1fr' }}>
                    <ActionButton
                        title="普通攻击"
                        description="造成少量物理伤害"
                        onClick={() => onAction('普通攻击')}
                    />
                    
                    {card.skills.map((skill) => skill && (
                        <ActionButton
                            key={skill.id}
                            title={skill.name}
                            description={skill.mechanicsDescription}
                            cost={skill.cost}
                            onClick={() => onAction(skill.name)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActionSelectionMenu;