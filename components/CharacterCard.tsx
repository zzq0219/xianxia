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
            <div className="flex justify-between items-center mb-0.5 text-ink-200 z-10 relative px-1">
                <span className="text-[10px] font-bold tracking-wide">{label}</span>
                <span className={`text-[10px] font-mono ${isLowHealth ? 'text-cinnabar-400 animate-pulse-soft' : ''}`}>{`${value}/${maxValue}`}</span>
            </div>
            <div className="w-full bg-ink-900/70 rounded h-2 border border-gold-600/20 overflow-hidden">
                <div className={`${color} h-full rounded transition-all duration-500 ease-in-out relative ${isLowHealth ? 'animate-pulse-soft' : ''}`} style={{ width: `${percentage}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
            </div>
        </div>
    );
};

const CharacterCardDisplay: React.FC<CharacterCardDisplayProps> = ({ participant, isPlayer, wasHit }) => {
    const { card, currentHp, currentMp, statusEffects } = participant;
    const [isAnimating, setIsAnimating] = useState(false);
    const [showStatusList, setShowStatusList] = useState(false);

    // 水墨风格边框 - 己方淡金，敌方朱砂
    const borderColor = isPlayer
        ? 'border-gold-500/50 shadow-[0_0_15px_rgba(184,149,106,0.2)]'
        : 'border-cinnabar-500/50 shadow-[0_0_15px_rgba(166,61,61,0.2)]';

    useEffect(() => {
        if (wasHit) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 500);
            return () => clearTimeout(timer);
        }
    }, [wasHit]);

    const animationClasses = isAnimating ? 'animate-shake' : '';

    return (
        <>
            {showStatusList && <StatusEffectsListModal effects={statusEffects} onClose={() => setShowStatusList(false)} />}
            <div className={`w-full max-w-[280px] ink-card rounded-lg border ${borderColor} backdrop-blur-sm transition-all duration-300 ${animationClasses} p-3 relative`}>
                {/* 角落装饰 */}
                <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-gold-500/30" />
                <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-gold-500/30" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-gold-500/30" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-gold-500/30" />

                <div className="text-center mb-2">
                    <h2 className="text-lg font-bold text-gold-400 font-serif tracking-wider ink-title">{card.name}</h2>
                    <p className={`font-medium text-sm ${getRarityTextColor(card.rarity)}`}>{card.realm}</p>
                </div>
                <div className="space-y-2">
                    <StatBar value={currentHp} maxValue={card.baseAttributes.maxHp} color="bg-gradient-to-r from-cinnabar-600 to-cinnabar-400" label="气血" />
                    <StatBar value={currentMp} maxValue={card.baseAttributes.maxMp} color="bg-gradient-to-r from-ink-600 via-ink-500 to-ink-400" label="真元" />
                </div>
                <div className="mt-3 h-8 flex items-center justify-center">
                    <button
                        onClick={() => setShowStatusList(true)}
                        className="px-3 py-1 bg-ink-800/80 rounded text-xs border border-gold-600/30 hover:border-gold-500/50 hover:bg-ink-700/80 transition-all duration-300 flex items-center gap-1.5 text-ink-300 hover:text-gold-400"
                    >
                        <span>状态</span>
                        {statusEffects.length > 0 && (
                            <span className="bg-gold-600 text-ink-900 px-1.5 rounded font-bold">{statusEffects.length}</span>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CharacterCardDisplay;