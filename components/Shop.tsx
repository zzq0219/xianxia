
import React, { useState } from 'react';
import { PlayerProfile, Rarity, CharacterCard, Equipment, Skill } from '../types';
import { 
    CARD_SELL_PRICES, 
    CHARACTER_POOL, 
    LIMITED_POOL_FEATURED_CHARS,
    EQUIPMENT_POOL,
    LIMITED_POOL_FEATURED_EQUIPMENT,
    SKILL_POOL,
    LIMITED_POOL_FEATURED_SKILLS
} from '../constants';
import GachaResultModal from './GachaResultModal';
import { getRarityTextColor } from './rarityHelpers';
import { generateRandomCharacter, generateRandomEquipment, generateRandomSkill, generateDoujinCharacter } from '../services/tavernService';

interface ShopProps {
    playerProfile: PlayerProfile;
    setPlayerProfile: (profile: PlayerProfile) => void;
}

type MainTab = '抽取卡池' | '道具购买';
type GachaTab = '人物卡牌' | '装备' | '通用技能';
type PoolSubType = 'regular' | 'doujin';
type PulledItem = CharacterCard | Equipment | Skill | { type: 'compensation', id: string, name: string, rarity: Rarity, description: string };
type PoolType = 'permanent' | 'limited';

// Type Guards
const isCharacterCard = (item: any): item is CharacterCard => !!(item && item.gender && item.skills);
const isEquipment = (item: any): item is Equipment => !!(item && item.stats && ['Weapon', 'Armor', 'Accessory'].includes(item.type));
const isSkill = (item: any): item is Skill => !!(item && item.cost !== undefined && item.mechanicsDescription);
const isCompensationItem = (item: any): item is { type: 'compensation', id: string, name: string, rarity: Rarity, description: string } => item.type === 'compensation';


const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${
            isActive 
            ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400' 
            : 'bg-transparent text-gray-400 hover:bg-stone-700/50 hover:text-gray-200'
        }`}
    >
        {label}
    </button>
);

const SubTabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${
            isActive 
            ? 'bg-amber-600/20 text-amber-300' 
            : 'bg-stone-800/60 text-gray-300 hover:bg-stone-700/80'
        }`}
    >
        {label}
    </button>
);

const GachaPoolUI: React.FC<{
    title: string;
    description: string;
    bannerUrl: string;
    onPullOne: () => void;
    onPullTen: () => void;
    isLoading: boolean;
    error: string | null;
    pullOneCost: number;
    pullTenCost: number;
    pullOneLabel?: string;
    pullTenLabel?: string;
}> = ({ title, description, bannerUrl, onPullOne, onPullTen, isLoading, error, pullOneCost, pullTenCost, pullOneLabel = "招募一次", pullTenLabel = "招募十次" }) => {
    const [showRates, setShowRates] = useState(false);

    return (
        <div className="bg-stone-800/50 rounded-lg overflow-hidden border border-stone-700/50 flex flex-col shadow-lg">
            <div className="relative h-48">
                <img src={bannerUrl} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-800/90 to-transparent"></div>
                <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white font-serif tracking-wider drop-shadow-lg">{title}</h3>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <p className="text-sm text-gray-300 flex-grow">{description}</p>
                 <div className="text-right mt-2 mb-2">
                    <button onClick={() => setShowRates(!showRates)} className="text-xs text-stone-400 hover:text-amber-400">
                        概率公示 {showRates ? '▲' : '▼'}
                    </button>
                </div>
                {showRates && (
                    <div className="bg-black/20 p-2 rounded-md mb-3 text-xs animate-fade-in border border-stone-700/50">
                        <p className={`${getRarityTextColor('神品')}`}>【神品】: 0.1%</p>
                        <p className={`${getRarityTextColor('圣品')}`}>【圣品】: 0.4%</p>
                        <p className={`${getRarityTextColor('仙品')}`}>【仙品】: 1.5%</p>
                        <p className={`${getRarityTextColor('绝品')}`}>【绝品】: 3%</p>
                        <p className={`${getRarityTextColor('珍品')}`}>【珍品】: 5%</p>
                        <p className={`${getRarityTextColor('优品')}`}>【优品】: 15%</p>
                        <p className={`${getRarityTextColor('良品')}`}>【良品】: 30%</p>
                        <p className={`${getRarityTextColor('凡品')}`}>【凡品】: 45%</p>
                        <p className="text-stone-500 mt-1 text-[10px]">※ 十次招募必得【优品】或以上品质的物品。</p>
                    </div>
                )}
                {error && <div className="text-red-400 text-center text-sm my-2 animate-shake">{error}</div>}
                <div className="mt-auto flex gap-3">
                    <button onClick={onPullOne} disabled={isLoading} className="flex-1 bg-stone-700 hover:bg-stone-600 transition-colors rounded-md p-3 text-center border border-stone-600/50 disabled:opacity-50 disabled:cursor-wait">
                        <p className="font-bold text-white">{isLoading ? '...' : pullOneLabel}</p>
                        <p className="text-xs text-amber-400">消耗 {pullOneCost} 灵石</p>
                    </button>
                    <button onClick={onPullTen} disabled={isLoading} className="flex-1 bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 transition-all rounded-md p-3 text-center border border-amber-500/50 shadow-md shadow-amber-600/20 disabled:opacity-50 disabled:cursor-wait">
                        <p className="font-bold text-white">{isLoading ? '天机演算中...' : pullTenLabel}</p>
                        <p className="text-xs text-amber-200">消耗 {pullTenCost} 灵石</p>
                    </button>
                </div>
            </div>
        </div>
    );
};


const Shop: React.FC<ShopProps> = ({ playerProfile, setPlayerProfile }) => {
    const [mainTab, setMainTab] = useState<MainTab>('抽取卡池');
    const [gachaTab, setGachaTab] = useState<GachaTab>('人物卡牌');
    const [poolSubType, setPoolSubType] = useState<PoolSubType>('regular');
    const [pullResults, setPullResults] = useState<PulledItem[] | null>(null);
    const [isPulling, setIsPulling] = useState<boolean>(false);
    const [pullError, setPullError] = useState<string | null>(null);

    const RARITY_ORDER: Rarity[] = ['凡品', '良品', '优品', '珍品', '绝品', '仙品', '圣品', '神品'];
    const PERMANENT_RARITY_WEIGHTS: Record<Rarity, number> = { '凡品': 45, '良品': 30, '优品': 15, '珍品': 5, '绝品': 3, '仙品': 1.5, '圣品': 0.4, '神品': 0.1 };
    const LIMITED_RARITY_WEIGHTS: Record<Rarity, number> = { '凡品': 35, '良品': 25, '优品': 18, '珍品': 8, '绝品': 6, '仙品': 5, '圣品': 2, '神品': 1 };

    const determineRarity = (poolType: PoolType, guaranteeHigh: boolean = false): Rarity => {
        const weights = poolType === 'limited' ? LIMITED_RARITY_WEIGHTS : PERMANENT_RARITY_WEIGHTS;
        const weightedList: { rarity: Rarity, weight: number }[] = [];
        
        let sourceRarities = RARITY_ORDER;
        if (guaranteeHigh) {
            sourceRarities = RARITY_ORDER.filter(r => RARITY_ORDER.indexOf(r) >= 2); // 优品 or higher
        }

        sourceRarities.forEach(r => {
            weightedList.push({ rarity: r, weight: weights[r] });
        });
        
        const totalWeight = weightedList.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of weightedList) {
            random -= item.weight;
            if (random <= 0) {
                return item.rarity;
            }
        }
        return weightedList[weightedList.length - 1].rarity;
    };

    const simulatePull = async (count: number, poolType: PoolType): Promise<PulledItem[]> => {
        const raritiesToPull: Rarity[] = [];
        for (let i = 0; i < count; i++) {
            raritiesToPull.push(determineRarity(poolType));
        }

        if (count === 10 && !raritiesToPull.some(r => RARITY_ORDER.indexOf(r) >= 2)) {
            raritiesToPull[Math.floor(Math.random() * 10)] = determineRarity(poolType, true);
        }
        
        const generationPromises = raritiesToPull.map(rarity => {
            const isHighRarity = RARITY_ORDER.indexOf(rarity) >= 5; // 绝品 or higher
            const shouldFeature = isHighRarity && Math.random() < 0.5; // 50% chance to be a featured item on high rarity
    
            if (poolType === 'limited' && shouldFeature) {
                if (gachaTab === '人物卡牌') {
                    const featuredId = LIMITED_POOL_FEATURED_CHARS[Math.floor(Math.random() * LIMITED_POOL_FEATURED_CHARS.length)];
                    const featuredChar = CHARACTER_POOL.find(c => c.id === featuredId);
                    if (featuredChar) return Promise.resolve(featuredChar);
                } else if (gachaTab === '装备') {
                    const featuredId = LIMITED_POOL_FEATURED_EQUIPMENT[Math.floor(Math.random() * LIMITED_POOL_FEATURED_EQUIPMENT.length)];
                    const featuredEquip = EQUIPMENT_POOL.find(e => e.id === featuredId);
                    if (featuredEquip) return Promise.resolve(featuredEquip);
                } else if (gachaTab === '通用技能') {
                    const featuredId = LIMITED_POOL_FEATURED_SKILLS[Math.floor(Math.random() * LIMITED_POOL_FEATURED_SKILLS.length)];
                    const featuredSkill = SKILL_POOL.find(s => s.id === featuredId);
                    if (featuredSkill) return Promise.resolve(featuredSkill);
                }
            }
            
            switch(gachaTab) {
                case '人物卡牌': return generateRandomCharacter(rarity);
                case '装备': return generateRandomEquipment(rarity);
                case '通用技能': return generateRandomSkill(rarity, 'Universal');
                default: return Promise.reject(new Error("Invalid gacha tab"));
            }
        });

        const generatedItems = await Promise.all(generationPromises);
        
        const results: PulledItem[] = [];
        const tempProfile = JSON.parse(JSON.stringify(playerProfile));
        const isCharGacha = gachaTab === '人物卡牌';
        const isSkillGacha = gachaTab === '通用技能';

        for (const item of generatedItems) {
            if (!item) continue; 

            let isDuplicate = false;
            if (isCharGacha) {
                isDuplicate = tempProfile.cardCollection.some((c: CharacterCard) => c.name === item.name);
            } else if (isSkillGacha) {
                 isDuplicate = tempProfile.universalSkills.some((s: Skill) => s.name === item.name);
            }

            if ((isCharGacha || isSkillGacha) && isDuplicate) {
                const compensationAmount = (CARD_SELL_PRICES[item.rarity] || 10) * 5;
                results.push({
                    type: 'compensation',
                    id: `comp-${item.id}-${Date.now()}`,
                    name: `重复的${isCharGacha ? '角色' : '技能'}`,
                    rarity: item.rarity,
                    description: `转化为 ${compensationAmount} 灵石`,
                });
            } else {
                results.push(item);
                if (isCharGacha) tempProfile.cardCollection.push(item);
                if (isSkillGacha) tempProfile.universalSkills.push(item);
            }
        }
        return results;
    };

    const handlePull = async (cost: number, count: number, poolType: PoolType) => {
        if (playerProfile.spiritStones < cost) {
            setPullError("灵石不足！");
            setTimeout(() => setPullError(null), 3000);
            return;
        }
        if (isPulling) return;

        setIsPulling(true);
        setPullError(null);
        
        const originalStones = playerProfile.spiritStones;
        try {
            setPlayerProfile({ ...playerProfile, spiritStones: originalStones - cost });
            const results = await simulatePull(count, poolType);
            setPullResults(results);
        } catch (err) {
            console.error(err);
            setPullError("天机紊乱，招募失败。灵石已退回。");
            setPlayerProfile({ ...playerProfile, spiritStones: originalStones });
            setTimeout(() => setPullError(null), 4000);
        } finally {
            setIsPulling(false);
        }
    };

    const handleConfirmResults = () => {
        if (!pullResults) return;

        const newProfile = JSON.parse(JSON.stringify(playerProfile));

        pullResults.forEach(item => {
            if (isCompensationItem(item)) {
                const amountMatch = item.description.match(/\d+/);
                if (amountMatch) {
                    newProfile.spiritStones += parseInt(amountMatch[0], 10);
                }
            } else if (isCharacterCard(item)) {
                if (!newProfile.cardCollection.some((c: CharacterCard) => c.name === item.name)) {
                     const newCardInstance = { ...item, id: `gen-char-${item.name.replace(/\s/g, '')}-${Date.now()}` };
                     newProfile.cardCollection.push(newCardInstance);
                }
            } else if (isEquipment(item)) {
                const newItemInstance = { ...item, id: `gen-equip-${item.name.replace(/\s/g, '')}-${Date.now()}-${Math.random()}` };
                newProfile.equipmentInventory.push(newItemInstance);
            } else if (isSkill(item)) {
                if (!newProfile.universalSkills.some((s: Skill) => s.name === item.name)) {
                    const newSkillInstance = { ...item, id: `gen-skill-${item.name.replace(/\s/g, '')}-${Date.now()}` };
                    newProfile.universalSkills.push(newSkillInstance);
                }
            }
        });
        
        setPlayerProfile(newProfile);
        setPullResults(null);
    };

    const renderGachaContent = () => {
        const handleDoujinPull = async () => {
            const inspiration = prompt("请输入你的灵感来源（例如，一个角色名或一段描述）:");
            if (!inspiration) return;

            const cost = 500;
            if (playerProfile.spiritStones < cost) {
                setPullError("灵石不足！");
                setTimeout(() => setPullError(null), 3000);
                return;
            }
            if (isPulling) return;

            setIsPulling(true);
            setPullError(null);

            const originalStones = playerProfile.spiritStones;
            try {
                setPlayerProfile({ ...playerProfile, spiritStones: originalStones - cost });
                const result = await generateDoujinCharacter(inspiration);
                setPullResults([result]);
            } catch (err) {
                console.error(err);
                setPullError("天机紊乱，召唤失败。灵石已退回。");
                setPlayerProfile({ ...playerProfile, spiritStones: originalStones });
                setTimeout(() => setPullError(null), 4000);
            } finally {
                setIsPulling(false);
            }
        };

        const regularPools = {
            '人物卡牌': { title: "万象寻仙", description: "常驻卡池，可招募来自五湖四海的修士。", bannerUrl: "https://i.imgur.com/3sL0qXf.jpg", onPull: () => handlePull(100, 1, 'permanent') },
            '装备': { title: "百炼阁", description: "常驻装备池，可获取各类法宝与防具。", bannerUrl: "https://i.imgur.com/2jM1aYk.jpg", onPull: () => handlePull(100, 1, 'permanent') },
            '通用技能': { title: "万法楼", description: "常驻技能池，可习得各种通用功法。", bannerUrl: "https://i.imgur.com/dK8k9oN.jpg", onPull: () => handlePull(100, 1, 'permanent') },
        };

        const doujinPools = {
            '人物卡牌': { title: "异界降临", description: "消耗大量灵石，将你的“灵感”化为现实，召唤来自异界的强者。", bannerUrl: "https://i.imgur.com/s6A4b3g.jpg", onPull: handleDoujinPull },
            '装备': { title: "神兵天成", description: "消耗大量灵石，根据你的“灵感”锻造出传说中的神兵利器。", bannerUrl: "https://i.imgur.com/Tq9g8xS.jpg", onPull: handleDoujinPull },
            '通用技能': { title: "大道顿悟", description: "消耗大量灵石，从你的“灵感”中领悟出惊天动地的无上功法。", bannerUrl: "https://i.imgur.com/o2N5d1m.jpg", onPull: handleDoujinPull },
        };

        const currentPool = poolSubType === 'regular' ? regularPools[gachaTab] : doujinPools[gachaTab];
        const pullOneCost = poolSubType === 'regular' ? 200 : 1000;
        const pullTenCost = poolSubType === 'regular' ? 1800 : 9000;

        return (
            <div>
                <div className="flex justify-center gap-3 mb-4">
                    <SubTabButton label="常规卡池" isActive={poolSubType === 'regular'} onClick={() => setPoolSubType('regular')} />
                    <SubTabButton label="同人卡池" isActive={poolSubType === 'doujin'} onClick={() => setPoolSubType('doujin')} />
                </div>
                <GachaPoolUI
                    title={currentPool.title}
                    description={currentPool.description}
                    bannerUrl={currentPool.bannerUrl}
                    onPullOne={() => poolSubType === 'regular' ? handlePull(pullOneCost, 1, 'permanent') : handleDoujinPull()}
                    onPullTen={() => poolSubType === 'regular' ? handlePull(pullTenCost, 10, 'permanent') : alert("同人卡池暂不支持十连抽。")}
                    isLoading={isPulling}
                    error={pullError}
                    pullOneCost={pullOneCost}
                    pullTenCost={pullTenCost}
                    pullOneLabel={poolSubType === 'doujin' ? '注入灵感' : '招募一次'}
                    pullTenLabel={poolSubType === 'doujin' ? ' ' : '招募十次'}
                />
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col font-serif text-gray-300">
            <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-stone-700">
                <TabButton label="抽取卡池" isActive={mainTab === '抽取卡池'} onClick={() => setMainTab('抽取卡池')} />
                <TabButton label="道具购买" isActive={mainTab === '道具购买'} onClick={() => setMainTab('道具购买')} />
            </div>
            <div className="flex-grow overflow-y-auto bg-black/20 p-4">
                {mainTab === '抽取卡池' && (
                    <div className="space-y-4">
                        <div className="flex justify-center gap-3">
                            <SubTabButton label="人物卡牌" isActive={gachaTab === '人物卡牌'} onClick={() => setGachaTab('人物卡牌')} />
                            <SubTabButton label="装备" isActive={gachaTab === '装备'} onClick={() => setGachaTab('装备')} />
                            <SubTabButton label="通用技能" isActive={gachaTab === '通用技能'} onClick={() => setGachaTab('通用技能')} />
                        </div>
                        {renderGachaContent()}
                    </div>
                )}
                {mainTab === '道具购买' && (
                     <div className="p-6 text-center text-gray-500 font-serif flex flex-col items-center justify-center h-full">
                        <div className="text-4xl mb-4">💰</div>
                        <p>此功能尚未开放。</p>
                        <p className="mt-2">未来的商店将在此处展示，可购买丹药、材料等。</p>
                    </div>
                )}
            </div>
            {pullResults && (
                <GachaResultModal
                    results={pullResults}
                    onClose={handleConfirmResults}
                />
            )}
        </div>
    );
};

export default Shop;
