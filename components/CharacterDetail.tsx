import React, { useMemo, useState } from 'react';
import { calculateTotalAttributes } from '../services/utils';
import { Attributes, CharacterCard, Equipment, EquipmentType, PetCard, PlayerProfile, Skill } from '../types';
import { getRarityBorderColor, getRarityTextColor } from './rarityHelpers';
import SelectionModal from './SelectionModal';
import SkillDetail from './SkillDetail';

interface CharacterDetailProps {
    card: CharacterCard;
    onClose: () => void;
    playerProfile: PlayerProfile;
    setPlayerProfile: (profile: PlayerProfile) => void;
    onViewPet: (pet: PetCard) => void;
}

// 属性图标映射
const statIcons: Record<string, string> = {
    '气血': '❤️',
    '真元': '💠',
    '攻击': '⚔️',
    '防御': '🛡️',
    '速度': '💨',
    '会心率': '🎯',
    '会心伤害': '💥',
    '魅力': '🌸',
    '技巧': '✋',
    '悟性': '💡',
};

const StatBar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    const icon = statIcons[label] || '◇';
    return (
        <div className="group">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-paper-300 flex items-center gap-1">
                    <span className="opacity-80">{icon}</span>
                    {label}
                </span>
                <span className="text-sm font-mono text-gold-400/80">{`${Math.round(value)}/${Math.round(maxValue)}`}</span>
            </div>
            <div className="w-full bg-ink-900/80 rounded-full h-3 border border-gold-600/30 shadow-inner shadow-black/50 overflow-hidden">
                <div
                    className={`${color} h-full rounded-full transition-all duration-500 ease-in-out relative`}
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

const AttributeDisplay: React.FC<{ attributes: Attributes; card: CharacterCard }> = ({ attributes, card }) => {
    const mainStats = [
        { label: '攻击', value: Math.round(attributes.attack), icon: '⚔️' },
        { label: '防御', value: Math.round(attributes.defense), icon: '🛡️' },
        { label: '速度', value: Math.round(attributes.speed), icon: '💨' },
    ];
    const secondaryStats = [
        { label: '会心率', value: `${(attributes.critRate * 100).toFixed(0)}%`, icon: '🎯' },
        { label: '会心伤害', value: `${(attributes.critDmg * 100).toFixed(0)}%`, icon: '💥' },
    ];
    const softStats = [
        { label: '魅力', value: card.charm || 0, icon: '🌸' },
        { label: '技巧', value: card.skillfulness || 0, icon: '✋' },
        { label: '悟性', value: card.perception || 0, icon: '💡' },
    ];

    return (
        <div className="bg-gradient-to-br from-ink-900/60 to-ink-800/60 p-4 rounded-lg h-full flex flex-col border border-gold-600/30 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl text-gold-500/10">☯</div>

            <h4 className="font-semibold text-gold-400 mb-3 text-lg flex items-center gap-2 relative z-10">
                <span>✧</span>
                <span>修为面板</span>
                <span>✧</span>
            </h4>
            <div className="space-y-3 relative z-10">
                <StatBar value={attributes.hp} maxValue={attributes.maxHp} color="bg-gradient-to-r from-cinnabar-700 to-cinnabar-500" label="气血" />
                <StatBar value={attributes.mp} maxValue={attributes.maxMp} color="bg-gradient-to-r from-blue-700 to-blue-500" label="真元" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center relative z-10">
                {mainStats.map(stat => (
                    <div key={stat.label} className="bg-ink-800/60 p-2 rounded-lg border border-gold-600/20 hover:border-gold-500/40 transition-colors group">
                        <p className="text-xs text-paper-400 flex items-center justify-center gap-1">
                            <span className="opacity-70 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
                            {stat.label}
                        </p>
                        <p className="font-bold text-gold-300">{stat.value}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-center relative z-10">
                {secondaryStats.map(stat => (
                    <div key={stat.label} className="bg-ink-800/60 p-2 rounded-lg border border-gold-600/20 hover:border-gold-500/40 transition-colors group">
                        <p className="text-xs text-paper-400 flex items-center justify-center gap-1">
                            <span className="opacity-70 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
                            {stat.label}
                        </p>
                        <p className="font-bold text-gold-300">{stat.value}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center relative z-10">
                {softStats.map(stat => (
                    <div key={stat.label} className="bg-ink-800/60 p-2 rounded-lg border border-gold-600/20 hover:border-gold-500/40 transition-colors group">
                        <p className="text-xs text-paper-400 flex items-center justify-center gap-1">
                            <span className="opacity-70 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
                            {stat.label}
                        </p>
                        <p className="font-bold text-gold-300">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

type SelectionState =
    | { type: 'equipment'; slot: keyof CharacterCard['equipment']; slotType: EquipmentType; }
    | { type: 'skill'; slotIndex: 2 | 3; }
    | { type: 'pet' }
    | null;

const CharacterDetail: React.FC<CharacterDetailProps> = ({ card, onClose, playerProfile, setPlayerProfile, onViewPet }) => {
    const [selectionState, setSelectionState] = useState<SelectionState>(null);
    const [viewingSkill, setViewingSkill] = useState<Skill | null>(null);

    const displayedCard = useMemo(() => {
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
            const representativeCard = cardsToUpdate[0];
            updater(representativeCard, newProfile);

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

            const itemIndexInInventory = profile.equipmentInventory.findIndex((invItem: Equipment) => invItem.id === item.id);
            if (itemIndexInInventory > -1) {
                profile.equipmentInventory.splice(itemIndexInInventory, 1);
            }

            if (oldItem) {
                profile.equipmentInventory.push(oldItem);
            }

            cardToUpdate.equipment[slot] = item;

            const newTotalAttributes = calculateTotalAttributes(cardToUpdate);
            cardToUpdate.baseAttributes.hp = newTotalAttributes.maxHp;
            cardToUpdate.baseAttributes.mp = newTotalAttributes.maxMp;
        });
        setSelectionState(null);
    };

    const handleUnequip = (slot: keyof CharacterCard['equipment']) => {
        updateCard((cardToUpdate, profile) => {
            const oldItem = cardToUpdate.equipment[slot];
            if (oldItem) {
                profile.equipmentInventory.push(oldItem);
                cardToUpdate.equipment[slot] = null;

                const newTotalAttributes = calculateTotalAttributes(cardToUpdate);
                cardToUpdate.baseAttributes.hp = newTotalAttributes.maxHp;
                cardToUpdate.baseAttributes.mp = newTotalAttributes.maxMp;
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

    const handleEquipPet = (pet: PetCard) => {
        updateCard((cardToUpdate, profile) => {
            const oldPet = cardToUpdate.pet;

            const petIndexInInventory = profile.petCollection.findIndex((invPet: PetCard) => invPet.id === pet.id);
            if (petIndexInInventory > -1) {
                profile.petCollection.splice(petIndexInInventory, 1);
            }

            if (oldPet) {
                profile.petCollection.push(oldPet);
            }

            cardToUpdate.pet = pet;
        });
        setSelectionState(null);
    };

    const handleUnequipPet = () => {
        updateCard((cardToUpdate, profile) => {
            const oldPet = cardToUpdate.pet;
            if (oldPet) {
                profile.petCollection.push(oldPet);
                cardToUpdate.pet = null;
            }
        });
    };

    const equipSlots: { key: keyof CharacterCard['equipment']; label: string, type: EquipmentType }[] = [
        { key: 'weapon', label: '武器', type: 'Weapon' },
        { key: 'armor', label: '衣服', type: 'Armor' },
        { key: 'accessory1', label: '配饰一', type: 'Accessory' },
        { key: 'accessory2', label: '配饰二', type: 'Accessory' },
    ];

    const slotIcons: Record<string, string> = {
        '武器': '⚔️',
        '衣服': '👘',
        '配饰一': '💍',
        '配饰二': '📿',
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-fade-in"
                onClick={onClose}
            >
                {/* 背景装饰 */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-20 left-20 text-9xl text-gold-500/5">☯</div>
                    <div className="absolute bottom-20 right-20 text-9xl text-gold-500/5">☯</div>
                </div>

                <div
                    className="relative bg-gradient-to-br from-ink-900/98 via-ink-800/98 to-ink-900/98 border-2 border-gold-600/50 backdrop-blur-lg w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col rounded-xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* 顶部装饰线 */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent"></div>

                    {/* 角落装饰 */}
                    <div className="absolute top-2 left-2 text-gold-500/30 text-lg">◈</div>
                    <div className="absolute top-2 right-2 text-gold-500/30 text-lg">◈</div>

                    {/* Header */}
                    <div className="p-4 flex-shrink-0 bg-gradient-to-r from-ink-900/50 via-ink-800/50 to-ink-900/50 border-b border-gold-600/30">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-paper-100 font-serif flex items-baseline gap-3">
                                    <span className="text-gold-400/60">【</span>
                                    <span>{displayedCard.name}</span>
                                    <span className="text-gold-400/60">】</span>
                                    <span className={`text-lg font-medium ${getRarityTextColor(displayedCard.rarity)}`}>
                                        〔{displayedCard.rarity}〕
                                    </span>
                                </h2>
                                <p className="text-lg text-gold-400 font-serif flex items-center gap-2 mt-1">
                                    <span className="text-sm opacity-60">境界:</span>
                                    <span className="realm-mark px-2 py-0.5 text-sm">{displayedCard.realm}</span>
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gold-400/70 hover:text-gold-300 transition-colors p-2 hover:bg-gold-500/10 rounded-lg"
                            >
                                <span className="text-xl">✕</span>
                            </button>
                        </div>
                        <div className="mt-3 space-y-1.5 text-sm text-paper-300">
                            <p className="flex items-center gap-2">
                                <span className="text-gold-500/70 font-semibold">🏷️ 称号:</span>
                                <span className="jade-slip px-2 py-0.5">{displayedCard.title || '无'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-gold-500/70 font-semibold">🧬 种族:</span>
                                <span>{displayedCard.race || '未知'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-gold-500/70 font-semibold">📖 来历:</span>
                                <span className="italic opacity-80">{displayedCard.origin || '一片空白...'}</span>
                            </p>
                            {displayedCard.appearance && (
                                <p className="flex items-center gap-2">
                                    <span className="text-gold-500/70 font-semibold">👤 外观:</span>
                                    <span className="italic opacity-80">{displayedCard.appearance}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-grow">
                        <AttributeDisplay attributes={totalAttributes} card={displayedCard} />
                        <div className="space-y-4">
                            {/* 装备配置 */}
                            <div className="bg-gradient-to-br from-ink-900/60 to-ink-800/60 p-4 rounded-lg border border-gold-600/30">
                                <h4 className="font-semibold text-gold-400 mb-3 text-lg flex items-center gap-2">
                                    <span>🗡️</span>
                                    <span>法宝装备</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {equipSlots.map(slot => (
                                        <div key={slot.key} className="relative group">
                                            <button
                                                onClick={() => setSelectionState({ type: 'equipment', slot: slot.key, slotType: slot.type })}
                                                className={`bg-ink-800/60 p-3 rounded-lg w-full text-left hover:bg-ink-700/70 transition-all duration-300 h-full border-2 hover:shadow-lg ${getRarityBorderColor(displayedCard.equipment[slot.key]?.rarity)}`}
                                            >
                                                <p className="text-sm text-paper-400 flex items-center gap-1">
                                                    <span className="opacity-70">{slotIcons[slot.label]}</span>
                                                    {slot.label}
                                                </p>
                                                <p className={`font-bold truncate ${getRarityTextColor(displayedCard.equipment[slot.key]?.rarity) || 'text-paper-500 italic'}`}>
                                                    {displayedCard.equipment[slot.key]?.name || '空槽位'}
                                                </p>
                                            </button>
                                            {displayedCard.equipment[slot.key] && (
                                                <button
                                                    onClick={() => handleUnequip(slot.key)}
                                                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-cinnabar-600 to-cinnabar-700 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center hover:from-cinnabar-500 hover:to-cinnabar-600 transition-all z-10 border border-ink-900 hover:scale-110"
                                                    title="卸下"
                                                >×</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 技能配置 */}
                            <div className="bg-gradient-to-br from-ink-900/60 to-ink-800/60 p-4 rounded-lg border border-gold-600/30">
                                <h4 className="font-semibold text-gold-400 mb-3 text-lg flex items-center gap-2">
                                    <span>📜</span>
                                    <span>功法神通</span>
                                </h4>
                                <div className="space-y-3">
                                    {displayedCard.skills.map((skill, index) => (
                                        <div
                                            key={index}
                                            className={`relative w-full text-left bg-ink-800/60 p-3 rounded-lg border-2 transition-all duration-300 ${!skill ? 'border-dashed border-ink-600 hover:border-gold-500/50' : `${getRarityBorderColor(skill?.rarity)} cursor-pointer hover:bg-ink-700/70 hover:shadow-lg`}`}
                                            onClick={() => {
                                                if (skill) {
                                                    setViewingSkill(skill);
                                                } else if (index > 1) {
                                                    setSelectionState({ type: 'skill', slotIndex: index as 2 | 3 });
                                                }
                                            }}
                                        >
                                            {skill ? (
                                                <>
                                                    <div className="flex justify-between items-baseline">
                                                        <h5 className="font-bold text-paper-100 flex items-baseline gap-2">
                                                            <span className={`${getRarityTextColor(skill.rarity)}`}>{skill.name}</span>
                                                            <span className={`text-xs font-medium ${getRarityTextColor(skill.rarity)}`}>〔{skill.rarity}〕</span>
                                                        </h5>
                                                        <span className="text-sm font-mono text-blue-400 flex items-center gap-1">
                                                            <span>💠</span>{skill.cost}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gold-300 mt-1">{skill.mechanicsDescription}</p>
                                                    <p className="text-xs text-paper-400 mt-1 italic">{skill.description}</p>
                                                    <p className="absolute bottom-1 right-2 text-[10px] text-paper-500 mt-1">
                                                        {index < 2 ? '🔒 角色专属' : '📚 通用技能'}
                                                    </p>
                                                    {index > 1 && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleForgetSkill(index as 2 | 3); }}
                                                            className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-cinnabar-600 to-cinnabar-700 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center hover:from-cinnabar-500 hover:to-cinnabar-600 transition-all z-10 border border-ink-900 hover:scale-110"
                                                            title="遗忘"
                                                        >×</button>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-center text-paper-500 py-2 flex items-center justify-center gap-2">
                                                    <span className="opacity-50">+</span>
                                                    <span>通用技能槽</span>
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 兽宠区域 */}
                    <div className="p-4 border-t border-gold-600/30 bg-gradient-to-r from-ink-900/50 via-ink-800/50 to-ink-900/50">
                        <div className="bg-gradient-to-br from-ink-900/60 to-ink-800/60 p-4 rounded-lg border border-gold-600/30">
                            <h4 className="font-semibold text-gold-400 mb-3 text-lg flex items-center gap-2">
                                <span>🐾</span>
                                <span>灵兽契约</span>
                            </h4>
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        if (displayedCard.pet) {
                                            onViewPet(displayedCard.pet);
                                        } else {
                                            setSelectionState({ type: 'pet' });
                                        }
                                    }}
                                    className={`bg-ink-800/60 p-3 rounded-lg w-full text-left hover:bg-ink-700/70 transition-all duration-300 h-full border-2 hover:shadow-lg ${getRarityBorderColor(displayedCard.pet?.rarity)}`}
                                >
                                    <p className="text-sm text-paper-400 flex items-center gap-1">
                                        <span className="opacity-70">🦊</span>
                                        出战灵兽
                                    </p>
                                    <p className={`font-bold truncate ${getRarityTextColor(displayedCard.pet?.rarity) || 'text-paper-500 italic'}`}>
                                        {displayedCard.pet?.name || '未携带'}
                                    </p>
                                </button>
                                {displayedCard.pet && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUnequipPet(); }}
                                        className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-cinnabar-600 to-cinnabar-700 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center hover:from-cinnabar-500 hover:to-cinnabar-600 transition-all z-10 border border-ink-900 hover:scale-110"
                                        title="卸下"
                                    >×</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 底部装饰线 */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent"></div>
                </div>
            </div>
            {selectionState && (
                <SelectionModal
                    key={
                        selectionState.type +
                        (selectionState.type === 'equipment' ? selectionState.slot :
                            selectionState.type === 'skill' ? selectionState.slotIndex :
                                'pet')
                    }
                    playerProfile={playerProfile}
                    selectionState={selectionState}
                    card={displayedCard}
                    onClose={() => setSelectionState(null)}
                    onEquip={handleEquip}
                    onLearnSkill={handleLearnSkill}
                    onEquipPet={handleEquipPet}
                />
            )}
            {viewingSkill && (
                <SkillDetail
                    skill={viewingSkill}
                    onClose={() => setViewingSkill(null)}
                />
            )}
        </>
    );
};

export default CharacterDetail;