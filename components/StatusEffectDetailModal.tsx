
import React from 'react';
import { StatusEffect } from '../types';

interface StatusEffectDetailModalProps {
  effect: StatusEffect;
  onClose: () => void;
}

const getIcon = (name: string) => {
    if (name.includes('提升') || name.includes('盾')) return '⬆️';
    if (name.includes('下降') || name.includes('弱')) return '⬇️';
    if (name.includes('毒') || name.includes('灼烧')) return '☠️';
    if (name.includes('晕') || name.includes('锁') || name.includes('混乱')) return '😵';
    return '✨';
};

const StatusEffectDetailModal: React.FC<StatusEffectDetailModalProps> = ({ effect, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ornate-border bg-stone-800/90 backdrop-blur-lg w-full max-w-md shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center bg-black/20">
          <h2 className="text-xl font-bold text-amber-300 font-serif">状态详情</h2>
          <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>
        <div className="p-6 font-serif flex-grow flex flex-col items-center">
          <div className="text-6xl mb-3">{getIcon(effect.name)}</div>
          <h3 className="text-3xl font-bold text-white text-center">{effect.name}</h3>
          <p className="text-lg text-amber-400 font-mono mt-1 mb-6">剩余 {effect.duration} 回合</p>

          <div className="w-full space-y-4 text-left">
            <div className="bg-black/20 p-3 rounded-md border border-stone-700/50">
                <h4 className="font-semibold text-amber-400 mb-1 text-sm">效果描述</h4>
                <p className="text-gray-300 leading-relaxed text-base">{effect.description}</p>
            </div>
             {effect.mechanicsDescription && (
                <div className="bg-black/20 p-3 rounded-md border border-stone-700/50">
                    <h4 className="font-semibold text-amber-400 mb-1 text-sm">机制说明</h4>
                    <p className="text-amber-200 leading-relaxed text-base">{effect.mechanicsDescription}</p>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatusEffectDetailModal;
