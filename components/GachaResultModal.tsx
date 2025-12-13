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
const isCompensationItem = (item: any): item is { type: 'compensation', id: string, name: string, rarity: Rarity, description: string } => item.type === 'compensation';

// 获取物品类型图标
const getItemTypeIcon = (item: PulledItem) => {
    if (isCompensationItem(item)) return '💎';
    if (isCharacterCard(item)) return item.gender === 'Male' ? '🐉' : '🦋';
    if (isPetCard(item)) return '🐾';
    if (isEquipment(item)) {
        if (item.type === 'Weapon') return '⚔️';
        if (item.type === 'Armor') return '🛡️';
        return '💍';
    }
    if (isSkill(item)) return '📜';
    return '❓';
};

const GenderIcon: React.FC<{ gender: GenderLock | undefined }> = ({ gender }) => {
    if (gender === 'Universal' || !gender) return null;
    const icon = gender === 'Male' ? '♂' : '♀';
    const color = gender === 'Male' ? 'text-sky-400' : 'text-pink-400';
    return (
        <div className={`absolute top-1 right-1 w-6 h-6 rounded-full bg-ink-900/80 border border-gold-500/30 flex items-center justify-center font-bold text-sm ${color} shadow-lg`}>
            {icon}
        </div>
    );
};

const ResultCard: React.FC<{ item: PulledItem; isRevealed: boolean; onReveal: () => void; index: number }> = ({ item, isRevealed, onReveal, index }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (isRevealed) {
            // 添加延迟翻转效果
            const timer = setTimeout(() => {
                setIsFlipped(true);
            }, index * 100);
            return () => clearTimeout(timer);
        }
    }, [isRevealed, index]);

    const handleCardClick = () => {
        if (!isFlipped) {
            setIsFlipped(true);
            onReveal();
        }
    };

    const iconElement = (() => {
        const icon = getItemTypeIcon(item);
        const isHighRarity = item.rarity === '仙品' || item.rarity === '圣品' || item.rarity === '神品';
        return (
            <div className={`text-4xl mb-2 ${isHighRarity ? 'animate-pulse' : ''}`}>
                {icon}
            </div>
        );
    })();

    return (
        <div
            className="w-full aspect-[3/4] [perspective:1000px] group cursor-pointer"
            onClick={handleCardClick}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Card Back - 神秘卡背 */}
                <div className="absolute w-full h-full [backface-visibility:hidden] rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 border-2 border-gold-600/50"></div>
                    {/* 太极图案背景 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            <div className="text-6xl text-gold-500/30 animate-spin-slow">☯</div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl text-gold-400/60 animate-pulse">?</span>
                            </div>
                        </div>
                    </div>
                    {/* 角落装饰 */}
                    <div className="absolute top-1 left-1 text-gold-500/40 text-xs">◈</div>
                    <div className="absolute top-1 right-1 text-gold-500/40 text-xs">◈</div>
                    <div className="absolute bottom-1 left-1 text-gold-500/40 text-xs">◈</div>
                    <div className="absolute bottom-1 right-1 text-gold-500/40 text-xs">◈</div>
                    {/* 悬浮提示 */}
                    <div className="absolute bottom-3 left-0 right-0 text-center">
                        <span className="text-gold-400/60 text-xs">点击揭示</span>
                    </div>
                </div>

                {/* Card Front - 卡面 */}
                <div className={`absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg overflow-hidden flex flex-col justify-between p-2 text-center ${getRarityGlow(item.rarity)} ${getRarityBorderColor(item.rarity)}`}>
                    {/* 背景 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-ink-900/95 via-ink-800/95 to-ink-900/95"></div>
                    {/* 装饰纹理 */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-2 left-2 text-gold-400">✧</div>
                        <div className="absolute top-2 right-2 text-gold-400">✧</div>
                        <div className="absolute bottom-2 left-2 text-gold-400">✧</div>
                        <div className="absolute bottom-2 right-2 text-gold-400">✧</div>
                    </div>

                    {(isEquipment(item) || isSkill(item) || isPetCard(item)) && <GenderIcon gender={isPetCard(item) ? item.gender : item.genderLock} />}

                    <div className="flex-grow flex flex-col items-center justify-center relative z-10">
                        {iconElement}
                        <p className="text-sm font-bold text-paper-100 font-serif leading-tight px-1">{item.name}</p>
                        {isCompensationItem(item) && (
                            <p className="text-xs text-gold-300 mt-1 px-1 italic">{item.description}</p>
                        )}
                    </div>

                    <div className="relative z-10">
                        <p className={`text-xs font-semibold ${getRarityTextColor(item.rarity)}`}>
                            〔{item.rarity}〕
                        </p>
                    </div>
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

    // 统计稀有度
    const rarityCount = results.reduce((acc, item) => {
        acc[item.rarity] = (acc[item.rarity] || 0) + 1;
        return acc;
    }, {} as Record<Rarity, number>);

    return (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-8xl text-gold-500/5 animate-pulse">☯</div>
                <div className="absolute bottom-10 right-10 text-8xl text-gold-500/5 animate-pulse" style={{ animationDelay: '1s' }}>☯</div>
                <div className="absolute top-1/2 left-1/4 text-4xl text-gold-400/5">✧</div>
                <div className="absolute top-1/3 right-1/4 text-4xl text-gold-400/5">✧</div>
            </div>

            <div
                className="relative bg-gradient-to-br from-ink-900/98 via-ink-800/98 to-ink-900/98 border-2 border-gold-600/50 rounded-xl w-full max-w-4xl h-auto max-h-[90vh] shadow-2xl flex flex-col backdrop-blur-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* 顶部装饰边框 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent"></div>

                {/* 标题 */}
                <div className="relative p-4 flex-shrink-0 border-b border-gold-600/30">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/5 to-transparent"></div>
                    <h2 className="text-2xl font-bold text-gold-300 font-serif text-center relative z-10 flex items-center justify-center gap-3">
                        <span className="text-gold-500/60">✦</span>
                        <span>天命轮回 · 招募结果</span>
                        <span className="text-gold-500/60">✦</span>
                    </h2>
                    {/* 稀有度统计 */}
                    {!isSinglePull && allRevealed && (
                        <div className="flex justify-center gap-4 mt-2 text-xs">
                            {Object.entries(rarityCount).map(([rarity, count]) => (
                                <span key={rarity} className={`${getRarityTextColor(rarity as Rarity)}`}>
                                    {rarity}: {count}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* 卡片展示区 */}
                <div className={`flex-grow p-4 overflow-y-auto ${isSinglePull ? 'flex items-center justify-center' : 'grid grid-cols-5 gap-3'}`}>
                    {results.map((item, index) => (
                        <div key={index} className={isSinglePull ? 'w-48' : ''}>
                            <ResultCard
                                item={item}
                                isRevealed={revealedIndices.has(index)}
                                onReveal={() => handleRevealOne(index)}
                                index={index}
                            />
                        </div>
                    ))}
                </div>

                {/* 底部按钮区 */}
                <div className="p-4 flex-shrink-0 flex justify-center items-center gap-4 border-t border-gold-600/30 bg-ink-900/50">
                    {!isSinglePull && (
                        <button
                            onClick={handleRevealAll}
                            disabled={allRevealed}
                            className="qi-flow-btn px-6 py-2 rounded-lg font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                        >
                            <span className="relative z-10 text-paper-200">✨ 全部揭示</span>
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        disabled={!allRevealed}
                        className="bg-gradient-to-r from-gold-700 via-gold-600 to-gold-700 hover:from-gold-600 hover:via-gold-500 hover:to-gold-600 text-ink-900 font-bold py-2 px-8 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg hover:shadow-gold-500/30"
                    >
                        📦 收入乾坤袋
                    </button>
                </div>

                {/* 底部装饰边框 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent"></div>
            </div>
        </div>
    );
};

export default GachaResultModal;