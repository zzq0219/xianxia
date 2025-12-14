import React, { useEffect, useState } from 'react';
import { CharacterCard, Equipment, GenderLock, PetCard, Rarity, Skill } from '../types';
import { getRarityBorderColor, getRarityGlow, getRarityTextColor } from './rarityHelpers';

type PulledItem = CharacterCard | Equipment | Skill | PetCard | { type: 'compensation', id: string, name: string, rarity: Rarity, description: string };


interface GachaResultModalProps {
    results: PulledItem[];
    onClose: () => void;
}

// Type guards
const isCharacterCard = (item: any): item is CharacterCard => !!(item && item.gender && item.skills);
const isEquipment = (item: any): item is Equipment => !!(item && item.stats && ['Weapon', 'Armor', 'Accessory'].includes(item.type));
const isSkill = (item: any): item is Skill => !!(item && item.cost !== undefined && item.mechanicsDescription);
const isPetCard = (item: any): item is PetCard => !!(item && item.skill && !item.baseAttributes);
// Fix: Expanded type guard for compensation item to include all its properties.
const isCompensationItem = (item: any): item is { type: 'compensation', id: string, name: string, rarity: Rarity, description: string } => item.type === 'compensation';

const GenderIcon: React.FC<{ gender: GenderLock | undefined }> = ({ gender }) => {
    if (gender === 'Universal' || !gender) return null;
    const icon = gender === 'Male' ? '♂' : '♀';
    const color = gender === 'Male' ? 'text-sky-400' : 'text-pink-400';
    return (
        <div className={`absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center font-bold text-sm ${color}`}>
            {icon}
        </div>
    );
};

const ResultCard: React.FC<{ item: PulledItem; isRevealed: boolean; onReveal: () => void; }> = ({ item, isRevealed, onReveal }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (isRevealed) {
            setIsFlipped(true);
        }
    }, [isRevealed]);

    const handleCardClick = () => {
        if (!isFlipped) {
            setIsFlipped(true);
            onReveal();
        }
    };

    const iconElement = (() => {
        if (isCompensationItem(item)) {
            return <div className="text-4xl mb-1 text-yellow-400">💎</div>;
        }
        if (isCharacterCard(item)) {
            return item.gender === 'Male'
                ? <div className="text-4xl mb-1 text-sky-400">♂</div>
                : <div className="text-4xl mb-1 text-pink-400">♀</div>;
        }
        if (isPetCard(item)) {
            return <div className="text-4xl mb-1">🐾</div>;
        }
        const icon = isEquipment(item) ? '🗡️' : isSkill(item) ? '📜' : '❓';
        return <div className="text-4xl mb-1">{icon}</div>;
    })();

    return (
        <div className="w-full aspect-[3/4] [perspective:1000px] group" onClick={handleCardClick}>
            <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Card Back */}
                <div className="absolute w-full h-full [backface-visibility:hidden] bg-slate-700 rounded-lg border-2 border-slate-500 flex items-center justify-center">
                    <div className="text-4xl text-amber-400 opacity-50">?</div>
                </div>

                {/* Card Front */}
                <div className={`absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-slate-800 rounded-lg border-2 flex flex-col justify-between p-2 text-center ${getRarityGlow(item.rarity)} ${getRarityBorderColor(item.rarity)}`}>
                    {(isEquipment(item) || isSkill(item) || isPetCard(item)) && <GenderIcon gender={isPetCard(item) ? item.gender : item.genderLock} />}
                    <div className="flex-grow flex flex-col items-center justify-center">
                        {iconElement}
                        <p className="text-sm font-bold text-white font-serif leading-tight">{item.name}</p>
                        {isCompensationItem(item) && (
                            <p className="text-xs text-amber-300 mt-1 px-1">{item.description}</p>
                        )}
                    </div>
                    <p className={`text-xs font-semibold ${getRarityTextColor(item.rarity)}`}>[{item.rarity}]</p>
                </div>
            </div>
        </div>
    );
};


const GachaResultModal: React.FC<GachaResultModalProps> = ({ results, onClose }) => {
    const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
    const isSinglePull = results.length === 1;

    const handleRevealAll = () => {
        const allIndices = new Set(results.map((_, i) => i));
        setRevealedIndices(allIndices);
    };

    const handleRevealOne = (index: number) => {
        setRevealedIndices(prev => new Set(prev).add(index));
    };

    const allRevealed = revealedIndices.size === results.length;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div
                className="bg-slate-900/90 border border-slate-700 rounded-xl w-full max-w-4xl h-auto max-h-[90vh] shadow-2xl flex flex-col backdrop-blur-lg"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-white font-serif text-center p-4 flex-shrink-0">招募结果</h2>
                <div className={`flex-grow p-4 overflow-y-auto ${isSinglePull ? 'flex items-center justify-center' : 'grid grid-cols-5 gap-3'}`}>
                    {results.map((item, index) => (
                        <div key={index} className={isSinglePull ? 'w-48' : ''}>
                            <ResultCard
                                item={item}
                                isRevealed={revealedIndices.has(index)}
                                onReveal={() => handleRevealOne(index)}
                            />
                        </div>
                    ))}
                </div>
                <div className="p-4 flex-shrink-0 flex justify-center items-center gap-4">
                    {!isSinglePull && (
                        <button
                            onClick={handleRevealAll}
                            disabled={allRevealed}
                            className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:opacity-50"
                        >
                            全部展示
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        disabled={!allRevealed}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-8 rounded-md transition-colors disabled:opacity-50"
                    >
                        放入仓库
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GachaResultModal;