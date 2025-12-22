import React, { useEffect, useState } from 'react';
import { BattleParticipant } from '../types';
import { getRarityTextColor } from './rarityHelpers';
import StatusEffectsListModal from './StatusEffectsListModal';

interface CharacterCardDisplayProps {
    participant: BattleParticipant;
    isPlayer: boolean;
    wasHit: boolean;
}

const StatBar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    const isLowHealth = label === '气血' && percentage < 30;

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-0.5 text-white z-10 relative px-1">
                <span className="text-[10px] font-bold drop-shadow-sm shadow-black">{label}</span>
                <span className={`text-[10px] font-mono drop-shadow-sm shadow-black ${isLowHealth ? 'text-red-400 animate-pulse' : ''}`}>{`${value}/${maxValue}`}</span>
            </div>
            <div className="w-full bg-stone-900/50 rounded-full h-2.5 border border-stone-600/50 shadow-inner shadow-black/50 overflow-hidden">
                <div className={`${color} h-full rounded-full transition-all duration-500 ease-in-out relative ${isLowHealth ? 'animate-pulse' : ''}`} style={{ width: `${percentage}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
            </div>
        </div>
    );
};

const CharacterCardDisplay: React.FC<CharacterCardDisplayProps> = ({ participant, isPlayer, wasHit }) => {
    const { card, currentHp, currentMp, statusEffects, calculatedStats } = participant;
    const [isAnimating, setIsAnimating] = useState(false);
    const [showStatusList, setShowStatusList] = useState(false);

    const borderColor = isPlayer ? 'border-sky-500/70 shadow-glow-blue' : 'border-red-500/70 shadow-glow-red';

    useEffect(() => {
        if (wasHit) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 500); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [wasHit]);

    const animationClasses = isAnimating ? 'animate-shake' : '';

    return (
        <>
            {showStatusList && <StatusEffectsListModal effects={statusEffects} onClose={() => setShowStatusList(false)} />}
            <div className={`w-full max-w-[280px] bg-gradient-to-br from-stone-800/90 to-stone-900/90 rounded-lg border-2 ${borderColor} shadow-lg shadow-black/50 backdrop-blur-sm transition-all duration-300 ${animationClasses} p-3`}>
                <div className="text-center mb-2">
                    <h2 className="text-lg font-bold text-white font-serif text-shadow-glow">{card.name}</h2>
                    <p className={`font-medium text-sm ${getRarityTextColor(card.rarity)}`}>{card.realm}</p>
                </div>
                <div className="space-y-2">
                    <StatBar value={currentHp} maxValue={calculatedStats.maxHp} color="bg-gradient-to-r from-red-700 via-red-600 to-red-500" label="气血" />
                    <StatBar value={currentMp} maxValue={calculatedStats.maxMp} color="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500" label="真元" />
                </div>
                <div className="mt-3 h-8 flex items-center justify-center">
                    <button
                        onClick={() => setShowStatusList(true)}
                        className="px-3 py-1 bg-stone-900/70 rounded-full text-xs border border-stone-500 hover:border-amber-500 hover:bg-stone-800 transition-all flex items-center gap-1.5"
                    >
                        <span>状态</span>
                        {statusEffects.length > 0 && (
                            <span className="bg-amber-500 text-black px-1.5 rounded-full font-bold">{statusEffects.length}</span>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CharacterCardDisplay;