import React from 'react';
import { Skill, Rarity } from '../types';
import { getRarityTextColor } from './rarityHelpers';

interface SkillDetailProps {
  skill: Skill;
  onClose: () => void;
}

const SkillDetail: React.FC<SkillDetailProps> = ({ skill, onClose }) => {
  const genderText = skill.genderLock === 'Universal' ? '通用' : skill.genderLock === 'Male' ? '男性专用' : '女性专用';

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-600 rounded-xl w-full max-w-md shadow-2xl flex flex-col backdrop-blur-lg bg-slate-800/90"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white font-serif flex items-baseline gap-2">
            <span>{skill.name}</span>
            <span className={`text-base font-medium ${getRarityTextColor(skill.rarity)}`}>
                [{skill.rarity}]
            </span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 font-serif">
           <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-lg font-bold text-amber-400">技能详情</h3>
                <div className="text-right">
                    <p className="text-base font-mono text-blue-400">{skill.cost > 0 ? `${skill.cost} 真元` : '无消耗'}</p>
                    <p className="text-sm text-gray-400">{genderText}</p>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-pink-400 mb-1 text-base">动画描述</h4>
                    <p className="text-gray-300 leading-relaxed text-sm italic">“{skill.eroticDescription}”</p>
                </div>
                <div>
                    <h4 className="font-semibold text-sky-400 mb-1 text-base">机制描述</h4>
                    <p className="text-gray-300 leading-relaxed text-sm">{skill.mechanicsDescription}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-500 mb-1 text-base">背景描述</h4>
                    <p className="text-gray-400 leading-relaxed mt-2 text-sm italic">{skill.description}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDetail;