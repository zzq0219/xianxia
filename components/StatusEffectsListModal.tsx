import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { StatusEffect } from '../types';
import StatusEffectDetailModal from './StatusEffectDetailModal';

interface StatusEffectsListModalProps {
    effects: StatusEffect[];
    onClose: () => void;
}

const getIcon = (name: string | undefined) => {
    if (!name) return '✨';
    if (name.includes('提升') || name.includes('盾')) return '⬆️';
    if (name.includes('下降') || name.includes('弱')) return '⬇️';
    if (name.includes('毒') || name.includes('灼烧')) return '☠️';
    if (name.includes('晕') || name.includes('锁') || name.includes('混乱')) return '😵';
    return '✨';
};

const StatusEffectsListModal: React.FC<StatusEffectsListModalProps> = ({ effects, onClose }) => {
    const [selectedEffect, setSelectedEffect] = useState<StatusEffect | null>(null);

    // 过滤掉无效的状态效果
    const validEffects = effects.filter(e => e && e.name);

    return createPortal(
        <>
            <div
                className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in"
                onClick={onClose}
            >
                <div
                    className="ornate-border bg-stone-800/90 backdrop-blur-lg w-full max-w-2xl shadow-2xl rounded-lg"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-4 flex justify-between items-center bg-black/20 border-b border-stone-700 rounded-t-lg">
                        <h2 className="text-xl font-bold text-amber-300 font-serif">特殊状态一览</h2>
                        <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                            <i className="fa-solid fa-times text-2xl"></i>
                        </button>
                    </div>
                    <div className="p-4 max-h-[60vh] overflow-y-auto">
                        {validEffects.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-4xl mb-2">🌟</p>
                                <p className="text-gray-400">当前无特殊状态</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {validEffects.map((effect, i) => (
                                    <button
                                        key={`${effect.name}-${i}`}
                                        onClick={() => setSelectedEffect(effect)}
                                        className="p-4 bg-stone-900/60 rounded-lg border border-stone-600/50 hover:border-amber-500/50 hover:bg-stone-800/60 transition-all flex items-center gap-3 text-left"
                                    >
                                        <span className="text-2xl">{getIcon(effect.name)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm">{effect.name || '未知状态'}</p>
                                            <p className="text-xs text-amber-400">剩余 {effect.duration ?? 0} 回合</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-black/20 border-t border-stone-700 rounded-b-lg text-center">
                        <p className="text-xs text-gray-500">点击状态查看详细机制说明</p>
                    </div>
                </div>
            </div>
            {selectedEffect && (
                <StatusEffectDetailModal effect={selectedEffect} onClose={() => setSelectedEffect(null)} />
            )}
        </>,
        document.body
    );
};

export default StatusEffectsListModal;