import React from 'react';
import { Equipment } from '../types';
import { getRarityTextColor } from './rarityHelpers';

interface EquipmentDetailProps {
  item: Equipment;
  onClose: () => void;
}

const getStatName = (stat: string): string => {
    const names: Record<string, string> = {
        attack: '攻击',
        defense: '防御',
        hp: '气血',
        speed: '速度',
        critRate: '会心率',
        critDmg: '会心伤害',
    };
    return names[stat] || stat;
};

const formatStatValue = (stat: string, value: number): string => {
    if (stat === 'critRate' || stat === 'critDmg') {
        return `+${(value * 100).toFixed(0)}%`;
    }
    return value > 0 ? `+${value}` : `${value}`;
};

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({ item, onClose }) => {
  const genderText = !item.genderLock || item.genderLock === 'Universal' ? '通用' : item.genderLock === 'Male' ? '男性专用' : '女性专用';
  return (
    <div
      className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ornate-border bg-stone-800/90 backdrop-blur-lg w-full max-w-md shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center bg-black/20">
          <h2 className="text-xl font-bold text-white font-serif flex items-baseline gap-2">
            <span>{item.name}</span>
            <span className={`text-base font-medium ${getRarityTextColor(item.rarity)}`}>
                [{item.rarity}]
            </span>
          </h2>
          <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>
        <div className="p-6 font-serif">
           <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-lg font-bold text-amber-400">法宝详情</h3>
                <div className="text-right">
                  <p className="text-base text-gray-400">{item.type}</p>
                  <p className="text-sm text-gray-400">{genderText}</p>
                </div>
            </div>
            <div className="bg-black/20 p-3 rounded-md border border-stone-700/50 mb-4">
                <h4 className="font-semibold text-amber-400 mb-2 text-sm">属性</h4>
                <div className="space-y-1">
                {Object.entries(item.stats).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between text-sm">
                        <span className="text-gray-300">{getStatName(stat)}</span>
                        {/* FIX: Cast value to number as Object.entries infers it as unknown. */}
                        <span className="font-mono text-green-400">{formatStatValue(stat, value as number)}</span>
                    </div>
                ))}
                </div>
            </div>
             <div className="bg-black/20 p-3 rounded-md border border-stone-700/50">
                <h4 className="font-semibold text-amber-400 mb-1 text-sm">描述</h4>
                <p className="text-gray-300 leading-relaxed text-sm italic">{item.description}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;