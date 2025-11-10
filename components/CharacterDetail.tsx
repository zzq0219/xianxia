import React, { useState, useMemo } from 'react';
import { CharacterCard, Attributes, Equipment, Skill, PlayerProfile, EquipmentType, Rarity } from '../types';
import SelectionModal from './SelectionModal';
import { getRarityTextColor, getRarityBorderColor } from './rarityHelpers';
import { calculateTotalAttributes } from '../services/utils';

interface CharacterDetailProps {
  card: CharacterCard;
  onClose: () => void;
  playerProfile: PlayerProfile;
  setPlayerProfile: (profile: PlayerProfile) => void;
}

const StatBar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          <span className="text-sm font-mono text-gray-400">{`${Math.round(value)}/${Math.round(maxValue)}`}</span>
        </div>
        <div className="w-full bg-stone-900 rounded-full h-2.5 border border-stone-700 shadow-inner shadow-black/50">
          <div className={`${color} h-full rounded-full transition-all duration-500 ease-in-out`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
};

const AttributeDisplay: React.FC<{ attributes: Attributes; card: CharacterCard }> = ({ attributes, card }) => {
    const mainStats = [
        { label: '攻击', value: Math.round(attributes.attack) },
        { label: '防御', value: Math.round(attributes.defense) },
        { label: '速度', value: Math.round(attributes.speed) },
    ];
    const secondaryStats = [
        { label: '会心率', value: `${(attributes.critRate * 100).toFixed(0)}%` },
        { label: '会心伤害', value: `${(attributes.critDmg * 100).toFixed(0)}%` },
    ];
    const softStats = [
        { label: '魅力', value: card.charm || 0 },
        { label: '技巧', value: card.skillfulness || 0 },
        { label: '悟性', value: card.perception || 0 },
    ];

    return (
        <div className="bg-black/20 p-4 rounded-lg h-full flex flex-col border border-stone-700/50">
            <h4 className="font-semibold text-amber-400 mb-3 text-lg">面板属性</h4>
            <div className="space-y-3">
                <StatBar value={attributes.hp} maxValue={attributes.maxHp} color="bg-gradient-to-r from-red-600 to-red-400" label="气血" />
                <StatBar value={attributes.mp} maxValue={attributes.maxMp} color="bg-gradient-to-r from-blue-600 to-blue-400" label="真元" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                {mainStats.map(stat => (
                    <div key={stat.label} className="bg-stone-700/50 p-2 rounded-md">
                        <p className="text-xs text-gray-400">{stat.label}</p>
                        <p className="font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-center">
                {secondaryStats.map(stat => (
                    <div key={stat.label} className="bg-stone-700/50 p-2 rounded-md">
                        <p className="text-xs text-gray-400">{stat.label}</p>
                        <p className="font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                {softStats.map(stat => (
                    <div key={stat.label} className="bg-stone-700/50 p-2 rounded-md">
                        <p className="text-xs text-gray-400">{stat.label}</p>
                        <p className="font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

type SelectionState = 
    | { type: 'equipment'; slot: keyof CharacterCard['equipment']; slotType: EquipmentType; }
    | { type: 'skill'; slotIndex: 2 | 3; }
    | null;

const CharacterDetail: React.FC<CharacterDetailProps> = ({ card, onClose, playerProfile, setPlayerProfile }) => {
    const [selectionState, setSelectionState] = useState<SelectionState>(null);

    const displayedCard = useMemo(() => {
        // Always find the latest version from the profile state
        const cardInMaleParty = playerProfile.maleParty.find(c => c.id === card.id);
        const cardInFemaleParty = playerProfile.femaleParty.find(c => c.id === card.id);
        const cardInCollection = playerProfile.cardCollection.find(c => c.id === card.id);
        return cardInMaleParty || cardInFemaleParty || cardInCollection || card;
    }, [playerProfile, card.id]);

    const totalAttributes = useMemo(() => calculateTotalAttributes(displayedCard), [displayedCard]);
    
    const updateCard = (updater: (cardToUpdate: CharacterCard, profile: PlayerProfile) => void) => {
        const newProfile = JSON.parse(JSON.stringify(playerProfile));

        const cardInCollection = newProfile.cardCollection.find((c: CharacterCard) => c.id === card.id);
        const cardInMaleParty = newProfile.maleParty.find((c: CharacterCard) => c.id === card.id);
        const cardInFemaleParty = newProfile.femaleParty.find((c: CharacterCard) => c.id === card.id);

        const cardsToUpdate = [cardInCollection, cardInMaleParty, cardInFemaleParty].filter(Boolean);
        
        if (cardsToUpdate.length > 0) {
            // Use a representative card for logic, then apply changes to all instances
            const representativeCard = cardsToUpdate[0];
            updater(representativeCard, newProfile);

            // Sync changes to other instances if they exist
            const updatedCardJSON = JSON.stringify(representativeCard);
            
            if (cardInCollection) Object.assign(cardInCollection, JSON.parse(updatedCardJSON));
            if (cardInMaleParty) Object.assign(cardInMaleParty, JSON.parse(updatedCardJSON));
            if (cardInFemaleParty) Object.assign(cardInFemaleParty, JSON.parse(updatedCardJSON));
        }
        
        setPlayerProfile(newProfile);
    };

    const handleEquip = (slot: keyof CharacterCard['equipment'], item: Equipment) => {
        updateCard((cardToUpdate, profile) => {
            const oldItem = cardToUpdate.equipment[slot];
            
            // Find the index of the first matching item in the inventory and remove it.
            const itemIndexInInventory = profile.equipmentInventory.findIndex((invItem: Equipment) => invItem.id === item.id);
            if (itemIndexInInventory > -1) {
                profile.equipmentInventory.splice(itemIndexInInventory, 1);
            }

            // Add the previously equipped item (if any) back to the inventory.
            if (oldItem) {
                profile.equipmentInventory.push(oldItem);
            }
            
            // Update card's equipment
            cardToUpdate.equipment[slot] = item;
        });
        setSelectionState(null);
    };

    const handleUnequip = (slot: keyof CharacterCard['equipment']) => {
        updateCard((cardToUpdate, profile) => {
            const oldItem = cardToUpdate.equipment[slot];
            if (oldItem) {
                profile.equipmentInventory.push(oldItem);
                cardToUpdate.equipment[slot] = null;
            }
        });
    };
    
    const handleLearnSkill = (slotIndex: 2 | 3, skill: Skill) => {
        updateCard((cardToUpdate) => {
            cardToUpdate.skills[slotIndex] = skill;
        });
        setSelectionState(null);
    }
    
    const handleForgetSkill = (slotIndex: 2 | 3) => {
        updateCard((cardToUpdate) => {
            cardToUpdate.skills[slotIndex] = null;
        });
    }

    const equipSlots: { key: keyof CharacterCard['equipment']; label: string, type: EquipmentType }[] = [
        { key: 'weapon', label: '武器', type: 'Weapon' },
        { key: 'armor', label: '衣服', type: 'Armor' },
        { key: 'accessory1', label: '配饰一', type: 'Accessory' },
        { key: 'accessory2', label: '配饰二', type: 'Accessory' },
    ];

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
                onClick={onClose}
            >
                <div
                    className="ornate-border bg-stone-800/90 backdrop-blur-lg w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 flex-shrink-0 bg-black/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white font-serif flex items-baseline gap-3">
                                    <span>{displayedCard.name}</span>
                                    <span className={`text-lg font-medium ${getRarityTextColor(displayedCard.rarity)}`}>
                                        [{displayedCard.rarity}]
                                    </span>
                                </h2>
                                <p className="text-lg text-amber-400 font-serif">{displayedCard.realm}</p>
                            </div>
                             <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                                <i className="fa-solid fa-times text-2xl"></i>
                            </button>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-300">
                           <p><span className="text-gray-500 font-semibold">称号:</span> {displayedCard.title || '无'}</p>
                           <p><span className="text-gray-500 font-semibold">种族:</span> {displayedCard.race || '未知'}</p>
                           <p><span className="text-gray-500 font-semibold">来历:</span> {displayedCard.origin || '一片空白...'}</p>
                           {displayedCard.appearance && <p><span className="text-gray-500 font-semibold">外观:</span> {displayedCard.appearance}</p>}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-grow">
                        <AttributeDisplay attributes={totalAttributes} card={displayedCard} />
                        <div className="space-y-4">
                             <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
                                <h4 className="font-semibold text-amber-400 mb-3 text-lg">装备配置</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {equipSlots.map(slot => (
                                        <div key={slot.key} className="relative">
                                            <button 
                                                onClick={() => setSelectionState({ type: 'equipment', slot: slot.key, slotType: slot.type })}
                                                className={`bg-stone-700/50 p-3 rounded-md w-full text-left hover:bg-stone-600/70 transition-colors h-full border-2 ${getRarityBorderColor(displayedCard.equipment[slot.key]?.rarity)}`}
                                            >
                                                <p className="text-sm text-gray-400">{slot.label}</p>
                                                <p className={`font-bold truncate ${getRarityTextColor(displayedCard.equipment[slot.key]?.rarity)}`}>{displayedCard.equipment[slot.key]?.name || '未装备'}</p>
                                            </button>
                                            {displayedCard.equipment[slot.key] && (
                                                <button onClick={() => handleUnequip(slot.key)} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-500 transition-colors z-10 border border-stone-900" title="卸下">×</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
                                <h4 className="font-semibold text-amber-400 mb-3 text-lg">技能配置</h4>
                                <div className="space-y-3">
                                    {displayedCard.skills.map((skill, index) => (
                                        <div key={index} className={`relative w-full text-left bg-stone-700/50 p-3 rounded-md border-2 ${!skill ? 'border-dashed border-stone-600' : getRarityBorderColor(skill?.rarity)} ${index > 1 ? 'cursor-pointer hover:bg-stone-600/70 transition-colors' : 'cursor-default'}`} onClick={() => index > 1 && !skill && setSelectionState({ type: 'skill', slotIndex: index as 2 | 3 })}>
                                            {skill ? (
                                                <>
                                                    <div className="flex justify-between items-baseline">
                                                        <h5 className="font-bold text-white flex items-baseline gap-2">
                                                            <span className={`${getRarityTextColor(skill.rarity)}`}>{skill.name}</span>
                                                            <span className={`text-xs font-medium ${getRarityTextColor(skill.rarity)}`}>[{skill.rarity}]</span>
                                                        </h5>
                                                        <span className="text-sm font-mono text-blue-400">{skill.cost} 真元</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-amber-300 mt-1">{skill.mechanicsDescription}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
                                                    <p className="absolute bottom-1 right-2 text-[10px] text-gray-500 mt-1">{index < 2 ? '角色专属' : '通用技能'}</p>
                                                     {index > 1 && <button onClick={(e) => { e.stopPropagation(); handleForgetSkill(index as 2|3);}} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-500 transition-colors z-10 border border-stone-900" title="遗忘">×</button>}
                                                </>
                                            ) : (
                                                <p className="text-center text-gray-500">通用技能槽</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {selectionState && (
                <SelectionModal
                    key={selectionState.type + (selectionState.type === 'equipment' ? selectionState.slot : selectionState.slotIndex)}
                    playerProfile={playerProfile}
                    selectionState={selectionState}
                    card={displayedCard}
                    onClose={() => setSelectionState(null)}
                    onEquip={handleEquip}
                    onLearnSkill={handleLearnSkill}
                />
            )}
        </>
    );
};

export default CharacterDetail;