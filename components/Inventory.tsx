import React, { useState } from 'react';
import { CARD_SELL_PRICES } from '../constants';
import { CharacterCard, Equipment, EquipmentType, GenderLock, PetCard, PlayerProfile, Rarity, Skill } from '../types';
import CharacterDetail from './CharacterDetail';
import EquipmentDetail from './EquipmentDetail';
import { getRarityBorderColor, getRarityTextColor } from './rarityHelpers';
import SkillDetail from './SkillDetail';

interface InventoryProps {
    playerProfile: PlayerProfile;
    setPlayerProfile: (profile: PlayerProfile) => void;
    onViewPet: (pet: PetCard) => void;
}

type MainTab = '图鉴' | '兽宠' | '通用技能库' | '装备库' | '日常道具';
type CharacterSubTab = '男性角色' | '女性角色';
type EquipmentSubTab = '武器' | '衣服' | '饰品';
type PetSubTab = '雄性' | '雌性';
type GenderFilter = 'All' | 'Male' | 'Female' | 'Universal';
type SkillSubTab = '男性专用' | '女性专用' | '通用';
type CardSort = 'default' | 'rarity';
type EquipSort = 'default' | 'rarity';


// 仙侠风格标签按钮
const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-300 ${isActive
            ? 'bg-ink-800/90 text-gold-400 border-b-2 border-gold-500/60 shadow-[0_0_10px_rgba(180,149,106,0.15)]'
            : 'bg-transparent text-ink-400 hover:bg-ink-800/50 hover:text-gold-300'
            }`}
    >
        {label}
    </button>
);

// 仙侠风格排序按钮
const SortButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs rounded transition-all duration-300 ${isActive
            ? 'bg-gold-600/30 text-gold-300 border border-gold-500/40'
            : 'bg-ink-700/60 hover:bg-ink-600/70 text-ink-300 hover:text-gold-300 border border-ink-600/50'
            }`}
    >
        {label}
    </button>
);


// 仙侠风格角色卡片
const CharacterCardItem: React.FC<{ card: CharacterCard }> = ({ card }) => (
    <div className={`ink-card p-3 rounded-lg text-center h-full relative ${getRarityBorderColor(card.rarity)}`}>
        {/* 角落装饰 */}
        <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-gold-500/25" />
        <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-gold-500/25" />
        <p className="font-bold font-elegant text-gold-300 flex items-center justify-center gap-1">
            <span className="text-gold-500/50 text-xs">◆</span>
            {card.name}
        </p>
        <p className={`text-xs font-semibold ${getRarityTextColor(card.rarity)}`}>{card.realm}</p>
        <p className="text-xs text-ink-400 mt-1 truncate">{card.title}</p>
    </div>
);

// 性别图标
const GenderIcon: React.FC<{ gender: GenderLock | undefined }> = ({ gender }) => {
    if (!gender || gender === 'Universal') return null;
    const icon = gender === 'Male' ? '♂' : '♀';
    const color = gender === 'Male' ? 'text-blue-400' : 'text-pink-400';
    return (
        <div className={`absolute top-1 right-1 w-5 h-5 rounded-full bg-ink-900/70 flex items-center justify-center font-bold ${color} border border-ink-700/50`}>
            {icon}
        </div>
    );
};

// 仙侠风格技能卡片
const SkillItem: React.FC<{ skill: Skill }> = ({ skill }) => (
    <div className={`ink-card relative p-3 rounded-lg h-full ${getRarityBorderColor(skill.rarity)}`}>
        <GenderIcon gender={skill.genderLock} />
        <div className="flex justify-between items-baseline">
            <h5 className={`font-bold font-elegant ${getRarityTextColor(skill.rarity)}`}>
                <span className="text-gold-500/40 mr-1">✧</span>{skill.name}
            </h5>
            <span className="text-sm font-mono text-blue-400 flex items-center gap-1">
                <span className="text-blue-500/60">✦</span>{skill.cost} 真元
            </span>
        </div>
        <p className="text-sm text-ink-300 mt-1 line-clamp-2">{skill.description}</p>
    </div>
);

// 仙侠风格装备卡片
const EquipmentItem: React.FC<{ item: Equipment }> = ({ item }) => (
    <div className={`ink-card relative p-3 rounded-lg h-full ${getRarityBorderColor(item.rarity)}`}>
        <GenderIcon gender={item.genderLock} />
        <h5 className={`font-bold font-elegant truncate ${getRarityTextColor(item.rarity)}`}>
            <span className="text-gold-500/40 mr-1">⚔</span>{item.name}
        </h5>
        <div className="text-xs text-ink-300 mt-1 space-y-0.5">
            {Object.entries(item.stats).map(([stat, value]) => (
                <p key={stat} className="flex items-center gap-1">
                    <span className="text-gold-500/50">◇</span>
                    {stat}: <span className="text-green-400">+{value}</span>
                </p>
            ))}
        </div>
    </div>
);

// 仙侠风格宠物卡片
const PetCardItem: React.FC<{ card: PetCard }> = ({ card }) => (
    <div className={`ink-card relative p-3 rounded-lg text-center h-full ${getRarityBorderColor(card.rarity)}`}>
        <GenderIcon gender={card.gender} />
        <p className="font-bold font-elegant text-gold-300 flex items-center justify-center gap-1">
            <span className="text-gold-500/50 text-xs">🐾</span>
            {card.name}
        </p>
        <p className={`text-xs font-semibold ${getRarityTextColor(card.rarity)}`}>[{card.rarity}]</p>
        <p className="text-xs text-ink-400 mt-1 truncate">{card.description}</p>
    </div>
);

const Inventory: React.FC<InventoryProps> = ({ playerProfile, setPlayerProfile, onViewPet }) => {
    const [mainTab, setMainTab] = useState<MainTab>('图鉴');
    const [charSubTab, setCharSubTab] = useState<CharacterSubTab>('男性角色');
    const [equipSubTab, setEquipSubTab] = useState<EquipmentSubTab>('武器');
    const [petSubTab, setPetSubTab] = useState<PetSubTab>('雄性');
    const [genderFilter, setGenderFilter] = useState<GenderFilter>('All');
    const [skillSubTab, setSkillSubTab] = useState<SkillSubTab>('男性专用');
    const [selectedCard, setSelectedCard] = useState<CharacterCard | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    // const [selectedPet, setSelectedPet] = useState<PetCard | null>(null); // This is now handled by App.tsx
    const [cardSort, setCardSort] = useState<CardSort>('default');
    const [equipSort, setEquipSort] = useState<EquipSort>('default');
    const [isSellMode, setIsSellMode] = useState<boolean>(false);
    const [cardToSell, setCardToSell] = useState<CharacterCard | null>(null);
    const [sellError, setSellError] = useState<string | null>(null);

    const rarityOrder: Rarity[] = ['神品', '圣品', '仙品', '绝品', '珍品', '优品', '良品', '凡品'];

    const handleConfirmSell = () => {
        if (!cardToSell) return;
        setSellError(null);

        const isInMaleParty = playerProfile.maleParty.some(c => c.id === cardToSell.id);
        const isInFemaleParty = playerProfile.femaleParty.some(c => c.id === cardToSell.id);

        if (isInMaleParty || isInFemaleParty) {
            setSellError("无法出售上阵中的角色卡！");
            setTimeout(() => setSellError(null), 3000);
            setCardToSell(null);
            return;
        }

        const sellPrice = CARD_SELL_PRICES[cardToSell.rarity] || 0;

        const newProfile: PlayerProfile = {
            ...playerProfile,
            spiritStones: playerProfile.spiritStones + sellPrice,
            cardCollection: playerProfile.cardCollection.filter(c => c.id !== cardToSell.id),
        };

        setPlayerProfile(newProfile);
        setCardToSell(null);
    };


    const renderContent = () => {
        switch (mainTab) {
            case '图鉴':
                const sortedChars = [...playerProfile.cardCollection]
                    .filter(c => c.gender === (charSubTab === '男性角色' ? 'Male' : 'Female'))
                    .sort((a, b) => {
                        if (cardSort === 'rarity') {
                            return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
                        }
                        return 0; // Default order
                    });

                return (
                    <div>
                        <div className="px-4 pt-2 flex justify-between items-center border-b border-stone-700 bg-stone-800/50 sticky top-0 backdrop-blur-sm z-10">
                            <div className="flex space-x-2">
                                <TabButton label="男性角色" isActive={charSubTab === '男性角色'} onClick={() => setCharSubTab('男性角色')} />
                                <TabButton label="女性角色" isActive={charSubTab === '女性角色'} onClick={() => setCharSubTab('女性角色')} />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>排序:</span>
                                    <SortButton label="默认" isActive={cardSort === 'default'} onClick={() => setCardSort('default')} />
                                    <SortButton label="稀有度" isActive={cardSort === 'rarity'} onClick={() => setCardSort('rarity')} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-semibold transition-colors ${isSellMode ? 'text-red-400' : 'text-gray-400'}`}>出售模式</span>
                                    <button
                                        onClick={() => setIsSellMode(!isSellMode)}
                                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isSellMode ? 'bg-red-600' : 'bg-stone-600'}`}
                                    >
                                        <span
                                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isSellMode ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {sortedChars.map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => isSellMode ? setCardToSell(char) : setSelectedCard(char)}
                                    className="relative text-left transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg"
                                >
                                    <CharacterCardItem card={char} />
                                    {isSellMode && (
                                        <div className="absolute inset-0 bg-red-800/60 flex items-center justify-center rounded-lg cursor-pointer">
                                            <span className="text-white font-bold text-lg">出售</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case '通用技能库':
                const genderLockMap: Record<SkillSubTab, GenderLock> = {
                    '男性专用': 'Male',
                    '女性专用': 'Female',
                    '通用': 'Universal'
                };

                const filteredSkills = playerProfile.universalSkills.filter(
                    skill => skill.genderLock === genderLockMap[skillSubTab]
                );

                const groupedSkills = filteredSkills.reduce((acc, skill) => {
                    (acc[skill.rarity] = acc[skill.rarity] || []).push(skill);
                    return acc;
                }, {} as Record<Rarity, Skill[]>);

                return (
                    <div>
                        <div className="px-4 pt-2 flex justify-between items-center border-b border-stone-700 bg-stone-800/50 sticky top-0 backdrop-blur-sm z-10">
                            <div className="flex space-x-2">
                                <TabButton label="男性专用" isActive={skillSubTab === '男性专用'} onClick={() => setSkillSubTab('男性专用')} />
                                <TabButton label="女性专用" isActive={skillSubTab === '女性专用'} onClick={() => setSkillSubTab('女性专用')} />
                                <TabButton label="通用" isActive={skillSubTab === '通用'} onClick={() => setSkillSubTab('通用')} />
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {rarityOrder.map(rarity => (
                                groupedSkills[rarity] && groupedSkills[rarity].length > 0 ? (
                                    <div key={rarity}>
                                        <h4 className={`font-semibold mb-2 text-lg ${getRarityTextColor(rarity)}`}>【{rarity}】</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {groupedSkills[rarity].map(skill => (
                                                <button key={skill.id} onClick={() => setSelectedSkill(skill)} className="text-left transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg">
                                                    <SkillItem skill={skill} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : null
                            ))}
                            {filteredSkills.length === 0 && (
                                <div className="text-center text-gray-500 pt-10">
                                    <p>该分类下暂无技能。</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case '装备库':
                const typeMap: Record<EquipmentSubTab, EquipmentType> = { '武器': 'Weapon', '衣服': 'Armor', '饰品': 'Accessory' };
                const filteredEquip = playerProfile.equipmentInventory
                    .filter(e => e.type === typeMap[equipSubTab])
                    .filter(e => {
                        if (genderFilter === 'All') return true;
                        if (genderFilter === 'Universal') return !e.genderLock || e.genderLock === 'Universal';
                        return e.genderLock === genderFilter;
                    })
                    .sort((a, b) => {
                        if (equipSort === 'rarity') {
                            return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
                        }
                        return 0;
                    });
                return (
                    <div>
                        <div className="px-4 pt-2 flex justify-between items-center border-b border-stone-700 bg-stone-800/50 sticky top-0 backdrop-blur-sm z-10">
                            <div className="flex space-x-2">
                                <TabButton label="武器" isActive={equipSubTab === '武器'} onClick={() => { setEquipSubTab('武器'); setGenderFilter('All'); }} />
                                <TabButton label="衣服" isActive={equipSubTab === '衣服'} onClick={() => { setEquipSubTab('衣服'); setGenderFilter('All'); }} />
                                <TabButton label="饰品" isActive={equipSubTab === '饰品'} onClick={() => { setEquipSubTab('饰品'); setGenderFilter('All'); }} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>排序:</span>
                                <SortButton label="默认" isActive={equipSort === 'default'} onClick={() => setEquipSort('default')} />
                                <SortButton label="稀有度" isActive={equipSort === 'rarity'} onClick={() => setEquipSort('rarity')} />
                            </div>
                        </div>
                        <div className="px-4 py-2 flex items-center gap-3 bg-stone-800/50 border-b border-stone-700">
                            <span className="text-sm font-semibold text-gray-400">筛选:</span>
                            <SortButton label="全部" isActive={genderFilter === 'All'} onClick={() => setGenderFilter('All')} />
                            <SortButton label="男性专用" isActive={genderFilter === 'Male'} onClick={() => setGenderFilter('Male')} />
                            <SortButton label="女性专用" isActive={genderFilter === 'Female'} onClick={() => setGenderFilter('Female')} />
                            <SortButton label="通用" isActive={genderFilter === 'Universal'} onClick={() => setGenderFilter('Universal')} />
                        </div>
                        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredEquip.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedEquipment(item)}
                                    className="text-left transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg"
                                >
                                    <EquipmentItem item={item} />
                                </button>
                            ))}
                            {filteredEquip.length === 0 && (
                                <div className="col-span-full text-center text-gray-500 pt-10">
                                    <p>该分类下暂无装备。</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case '日常道具':
                return (
                    <div className="p-6 text-center text-gray-500 font-serif flex flex-col items-center justify-center h-full">
                        <div className="text-4xl mb-4">📦</div>
                        <p>此功能尚未开放。</p>
                        <p className="mt-2">未来的丹药、材料等消耗品将在此处展示。</p>
                    </div>
                );
            case '兽宠':
                const sortedPets = [...playerProfile.petCollection]
                    .filter(p => p.gender === (petSubTab === '雄性' ? 'Male' : 'Female'))
                    .sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));

                return (
                    <div>
                        <div className="px-4 pt-2 flex justify-between items-center border-b border-stone-700 bg-stone-800/50 sticky top-0 backdrop-blur-sm z-10">
                            <div className="flex space-x-2">
                                <TabButton label="雄性" isActive={petSubTab === '雄性'} onClick={() => setPetSubTab('雄性')} />
                                <TabButton label="雌性" isActive={petSubTab === '雌性'} onClick={() => setPetSubTab('雌性')} />
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {sortedPets.map(pet => (
                                <button
                                    key={pet.id}
                                    onClick={() => onViewPet(pet)}
                                    className="relative text-left transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg"
                                >
                                    <PetCardItem card={pet} />
                                </button>
                            ))}
                            {sortedPets.length === 0 && (
                                <div className="col-span-full text-center text-gray-500 pt-10">
                                    <p>该分类下暂无兽宠。</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col font-serif text-ink-300 bg-gradient-to-br from-ink-900/50 via-ink-950/70 to-ink-900/50">
            {/* 标签栏 - 水墨风格 */}
            <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-gold-600/20 bg-ink-900/50">
                <TabButton label="📖 图鉴" isActive={mainTab === '图鉴'} onClick={() => setMainTab('图鉴')} />
                <TabButton label="🐾 兽宠" isActive={mainTab === '兽宠'} onClick={() => setMainTab('兽宠')} />
                <TabButton label="📜 技能库" isActive={mainTab === '通用技能库'} onClick={() => setMainTab('通用技能库')} />
                <TabButton label="⚔ 装备库" isActive={mainTab === '装备库'} onClick={() => setMainTab('装备库')} />
                <TabButton label="📦 道具" isActive={mainTab === '日常道具'} onClick={() => setMainTab('日常道具')} />
            </div>
            <div className="flex-grow overflow-y-auto bg-ink-950/30 relative">
                {renderContent()}
            </div>

            {selectedCard && (
                <CharacterDetail
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    playerProfile={playerProfile}
                    setPlayerProfile={setPlayerProfile}
                    onViewPet={onViewPet}
                />
            )}
            {selectedSkill && (
                <SkillDetail
                    skill={selectedSkill}
                    onClose={() => setSelectedSkill(null)}
                />
            )}
            {selectedEquipment && (
                <EquipmentDetail
                    item={selectedEquipment}
                    onClose={() => setSelectedEquipment(null)}
                />
            )}
            {/* 出售确认弹窗 - 仙侠风格 */}
            {cardToSell && (
                <div className="fixed inset-0 bg-ink-950/85 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                    <div className="ink-card rounded-xl w-full max-w-md shadow-2xl p-6 text-center font-serif relative xianxia-frame">
                        {/* 装饰 */}
                        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-gold-500/30" />
                        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-gold-500/30" />
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-gold-500/30" />
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-gold-500/30" />

                        <h3 className="text-xl font-bold text-gold-400 mb-2 font-brush tracking-wider">
                            <span className="text-gold-500/50 mr-2">〓</span>
                            确认出售
                            <span className="text-gold-500/50 ml-2">〓</span>
                        </h3>
                        <p className="text-ink-300">
                            你确定要出售 <span className={`font-semibold ${getRarityTextColor(cardToSell.rarity)}`}>[{cardToSell.rarity}] {cardToSell.name}</span> 吗?
                        </p>
                        <p className="text-lg text-gold-400 font-bold my-4 flex items-center justify-center gap-2">
                            <span className="text-gold-500">◈</span>
                            你将获得 {CARD_SELL_PRICES[cardToSell.rarity] || 0} 灵石
                        </p>
                        {sellError && <p className="text-cinnabar-400 text-sm mb-4 animate-shake">{sellError}</p>}
                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={() => setCardToSell(null)}
                                className="px-6 py-2 bg-ink-700/80 hover:bg-ink-600/80 rounded-lg font-semibold text-ink-300 hover:text-gold-300 border border-ink-600/50 hover:border-gold-500/30 transition-all duration-300"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleConfirmSell}
                                className="px-6 py-2 bg-gradient-to-r from-cinnabar-600 to-cinnabar-500 text-white hover:from-cinnabar-500 hover:to-cinnabar-400 rounded-lg font-bold border border-cinnabar-400/50 transition-all duration-300"
                            >
                                确认出售
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;