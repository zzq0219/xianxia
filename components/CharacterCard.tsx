import React, { useState, useEffect } from 'react';
import { BattleParticipant, StatusEffect } from '../types';
import { getRarityTextColor } from './rarityHelpers';
import StatusEffectDetailModal from './StatusEffectDetailModal';

interface CharacterCardDisplayProps {
    participant: BattleParticipant;
    isPlayer: boolean;
    wasHit: boolean;
}

const StatBar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-0.5 text-white z-10 relative px-1">
        <span className="text-[10px] font-bold drop-shadow-sm shadow-black">{label}</span>
        <span className="text-[10px] font-mono drop-shadow-sm shadow-black">{`${value}/${maxValue}`}</span>
      </div>
      <div className="w-full bg-stone-900/50 rounded-full h-2.5 border border-stone-600/50 shadow-inner shadow-black/50">
        <div className={`${color} h-full rounded-full transition-all duration-500 ease-in-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const StatusEffectIcon: React.FC<{ effect: StatusEffect; onClick: () => void }> = ({ effect, onClick }) => {
    const getIcon = (name: string) => {
        if (name.includes('提升') || name.includes('盾')) return '⬆️';
        if (name.includes('下降') || name.includes('弱')) return '⬇️';
        if (name.includes('毒') || name.includes('灼烧')) return '☠️';
        if (name.includes('晕') || name.includes('锁') || name.includes('混乱')) return '😵';
        return '✨';
    }
    return (
        <button 
            onClick={onClick}
            className="w-7 h-7 bg-stone-900/70 rounded-full flex items-center justify-center text-sm border-2 border-stone-500 hover:border-amber-400 transition-colors" 
            title={effect.name}
        >
            {getIcon(effect.name)}
        </button>
    );
}

const CharacterCardDisplay: React.FC<CharacterCardDisplayProps> = ({ participant, isPlayer, wasHit }) => {
    const { card, currentHp, currentMp, statusEffects } = participant;
    const [isAnimating, setIsAnimating] = useState(false);
    const [activeStatusDetail, setActiveStatusDetail] = useState<StatusEffect | null>(null);

    const borderColor = isPlayer ? 'border-sky-500/70' : 'border-red-500/70';

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
            {activeStatusDetail && <StatusEffectDetailModal effect={activeStatusDetail} onClose={() => setActiveStatusDetail(null)} />}
            <div className={`w-full max-w-[280px] bg-stone-800/80 rounded-lg border-2 ${borderColor} shadow-lg shadow-black/50 backdrop-blur-sm transition-all duration-300 ${animationClasses} p-3`}>
                <div className="text-center mb-2">
                    <h2 className="text-lg font-bold text-white font-serif">{card.name}</h2>
                    <p className={`font-medium text-sm ${getRarityTextColor(card.rarity)}`}>{card.realm}</p>
                </div>
                <div className="space-y-2">
                    <StatBar value={currentHp} maxValue={card.baseAttributes.maxHp} color="bg-gradient-to-r from-red-600 to-red-400 border-r border-black/20" label="气血" />
                    <StatBar value={currentMp} maxValue={card.baseAttributes.maxMp} color="bg-gradient-to-r from-blue-600 to-blue-400 border-r border-black/20" label="真元" />
                </div>
                 {statusEffects.length > 0 ? (
                    <div className="mt-3 h-8 flex items-center justify-center gap-2 flex-wrap">
                        {statusEffects.map((effect, i) => <StatusEffectIcon key={`${effect.name}-${i}`} effect={effect} onClick={() => setActiveStatusDetail(effect)} />)}
                    </div>
                ) : (
                     <div className="mt-3 h-8 flex items-center justify-center text-xs text-gray-500">
                        无特殊状态
                    </div>
                 )}
            </div>
        </>
    );
};

export default CharacterCardDisplay;