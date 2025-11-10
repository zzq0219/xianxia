import React, { useState } from 'react';
import { PlayerProfile, CharacterCard, Equipment, Skill, EquipmentType, Rarity } from '../types';
import { getRarityTextColor } from './rarityHelpers';

type SelectionState = 
    | { type: 'equipment'; slot: keyof CharacterCard['equipment']; slotType: EquipmentType; }
    | { type: 'skill'; slotIndex: 2 | 3; };

interface SelectionModalProps {
    playerProfile: PlayerProfile;
    card: CharacterCard;
    selectionState: SelectionState;
    onClose: () => void;
    onEquip: (slot: keyof CharacterCard['equipment'], item: Equipment) => void;
    onLearnSkill: (slotIndex: 2 | 3, skill: Skill) => void;
}

const getStatName = (stat: string) => {
    const names: Record<string, string> = {
        attack: '攻击', defense: '防御', hp: '气血', speed: '速度',
        critRate: '会心率', critDmg: '会心伤害'
    };
    return names[stat] || stat;
}

const formatStatValue = (stat: string, value: number) => {
    if (stat === 'critRate' || stat === 'critDmg') {
        return `${(value * 100).toFixed(0)}%`;
    }
    return value > 0 ? `+${value}`: `${value}`;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ playerProfile, card, selectionState, onClose, onEquip, onLearnSkill }) => {
    const [previewItem, setPreviewItem] = useState<Equipment | Skill | null>(null);

    const isEquipmentSelection = (state: SelectionState): state is { type: 'equipment', slot: keyof CharacterCard['equipment'], slotType: EquipmentType } => state.type === 'equipment';
    const isSkillSelection = (state: SelectionState): state is { type: 'skill', slotIndex: 2 | 3 } => state.type === 'skill';

    const renderEquipmentDetails = (item: Equipment, currentItem?: Equipment | null) => (
        <div>
            <h3 className={`text-lg font-bold ${getRarityTextColor(item.rarity)}`}>{item.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{item.type} ({!item.genderLock || item.genderLock === 'Universal' ? '通用' : item.genderLock === 'Male' ? '男性专用' : '女性专用'})</p>
            <div className="space-y-2">
                {Object.entries(item.stats).map(([stat, value]) => {
                    const currentValue = currentItem?.stats[stat as keyof typeof currentItem.stats] || 0;
                    const diff = value - currentValue;
                    return (
                        <div key={stat} className="flex justify-between items-center text-sm">
                            <span className="text-gray-300">{getStatName(stat)}</span>
                            <div className="flex items-center gap-2">
                               {currentItem && <span className="text-gray-500">{formatStatValue(stat, currentValue)}</span>}
                               <span className={`font-semibold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white'}`}>
                                   {formatStatValue(stat, value)}
                                </span>
                               {currentItem && diff !== 0 && (
                                   <span className={`text-xs w-16 text-center font-mono ${diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                       ({diff > 0 ? '+' : ''}{diff})
                                   </span>
                               )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
    const renderSkillDetails = (item: Skill) => (
         <div>
            <div className="flex justify-between items-baseline mb-2">
                 <h3 className="text-lg font-bold text-white flex items-baseline gap-2">
                    <span className={`${getRarityTextColor(item.rarity)}`}>{item.name}</span>
                    <span className={`text-base font-medium ${getRarityTextColor(item.rarity)}`}>
                        [{item.rarity}]
                    </span>
                </h3>
                <span className="text-base font-mono text-blue-400">{item.cost} 真元</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">({item.genderLock === 'Universal' ? '通用' : item.genderLock === 'Male' ? '男性专用' : '女性专用'})</p>
            <p className="text-sm font-semibold text-amber-300 mt-2">{item.mechanicsDescription}</p>
            <p className="text-sm text-gray-400 mt-1">{item.description}</p>
        </div>
    );

    const getTitle = () => {
        if (isEquipmentSelection(selectionState)) {
             const labels: Record<string, string> = { weapon: '武器', armor: '衣服', accessory1: '配饰', accessory2: '配饰' };
             return `选择${labels[selectionState.slot]}`;
        }
        return "选择通用技能";
    }

    const getItems = () => {
        if (isEquipmentSelection(selectionState)) {
            return playerProfile.equipmentInventory.filter(e => e.type === selectionState.slotType && (!e.genderLock || e.genderLock === 'Universal' || e.genderLock === card.gender));
        }
        if (isSkillSelection(selectionState)) {
            const learnedSkillIds = new Set(card.skills.map(s => s?.id).filter(Boolean));
            return playerProfile.universalSkills.filter(s => !learnedSkillIds.has(s.id) && (s.genderLock === 'Universal' || s.genderLock === card.gender));
        }
        return [];
    }
    
    const items = getItems();
    const currentEquippedItem = isEquipmentSelection(selectionState) ? card.equipment[selectionState.slot] : null;

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900/90 border border-slate-700 rounded-xl w-full max-w-2xl h-[70vh] shadow-2xl flex flex-col backdrop-blur-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white font-serif">{getTitle()}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-grow flex flex-row overflow-hidden">
                    <div className="w-2/5 border-r border-slate-700 overflow-y-auto">
                        {items.length > 0 ? (
                            items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setPreviewItem(item)}
                                    className={`w-full text-left p-3 text-sm transition-colors duration-150 ${previewItem?.id === item.id ? 'bg-amber-600/30' : 'hover:bg-slate-800/60'}`}
                                >
                                    <p className="font-semibold text-white flex items-center gap-2">
                                        <span className={`${getRarityTextColor(item.rarity)}`}>{item.name}</span>
                                        {'rarity' in item && <span className={`text-xs font-medium ${getRarityTextColor((item as Skill).rarity)}`}>[{(item as Skill).rarity}]</span>}
                                    </p>
                                </button>
                            ))
                        ) : (
                             <p className="p-4 text-sm text-gray-500">无可用选项</p>
                        )}
                    </div>
                    <div className="w-3/5 p-4 flex flex-col justify-between">
                       <div>
                           {!previewItem ? (
                               <div className="text-center text-gray-500 pt-10">
                                   <p>从左侧列表选择一项以预览详情</p>
                               </div>
                           ) : (
                               isEquipmentSelection(selectionState) 
                               ? renderEquipmentDetails(previewItem as Equipment, currentEquippedItem)
                               : renderSkillDetails(previewItem as Skill)
                           )}
                       </div>
                        {previewItem && (
                             <button
                                onClick={() => {
                                    if (isEquipmentSelection(selectionState)) onEquip(selectionState.slot, previewItem as Equipment);
                                    if (isSkillSelection(selectionState)) onLearnSkill(selectionState.slotIndex, previewItem as Skill);
                                }}
                                className="w-full bg-amber-600 text-white font-bold py-2 px-4 rounded-md hover:bg-amber-500 transition-colors"
                            >
                                {isEquipmentSelection(selectionState) ? '装备' : '学习'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectionModal;