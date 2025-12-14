
import React, { useState } from 'react';
import {
    CARD_SELL_PRICES,
    CHARACTER_POOL,
    EQUIPMENT_POOL,
    LIMITED_POOL_FEATURED_CHARS,
    LIMITED_POOL_FEATURED_EQUIPMENT,
    LIMITED_POOL_FEATURED_SKILLS,
    SKILL_POOL
} from '../constants';
import { generateDoujinCharacter, generateDoujinEquipment, generateDoujinPet, generateDoujinSkill, generateRandomCharacter, generateRandomEquipment, generateRandomPet, generateRandomSkill } from '../services/tavernService';
import { CharacterCard, Equipment, PetCard, PlayerProfile, Rarity, Skill } from '../types';
import GachaResultModal from './GachaResultModal';
import { getRarityTextColor } from './rarityHelpers';

interface ShopProps {
    playerProfile: PlayerProfile;
    setPlayerProfile: (profile: PlayerProfile) => void;
}

type MainTab = '抽取卡池' | '道具购买';
type GachaTab = '人物卡牌' | '装备' | '通用技能' | '兽宠';
type PoolSubType = 'regular' | 'doujin';
type PulledItem = CharacterCard | Equipment | Skill | PetCard | { type: 'compensation', id: string, name: string, rarity: Rarity, description: string };
type PoolType = 'permanent' | 'limited';

// Type Guards
const isCharacterCard = (item: any): item is CharacterCard => !!(item && item.gender && item.skills);
const isEquipment = (item: any): item is Equipment => !!(item && item.stats && ['Weapon', 'Armor', 'Accessory'].includes(item.type));
const isSkill = (item: any): item is Skill => !!(item && item.cost !== undefined && item.mechanicsDescription);
const isPetCard = (item: any): item is PetCard => !!(item && item.skill && !item.baseAttributes);
const isCompensationItem = (item: any): item is { type: 'compensation', id: string, name: string, rarity: Rarity, description: string } => item.type === 'compensation';


const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-300 ${isActive
            ? 'bg-gradient-to-b from-stone-700/90 to-stone-800/90 text-gradient-gold border-b-2 border-xianxia-gold-500 shadow-glow-gold'
            : 'bg-transparent text-gray-400 hover:bg-stone-700/50 hover:text-amber-300'
            }`}
    >
        {label}
    </button>
);

const SubTabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md transition-all duration-300 text-sm font-medium ${isActive
            ? 'bg-gradient-to-r from-amber-600/30 to-amber-700/30 text-gradient-gold border border-xianxia-gold-600/50 shadow-glow-gold'
            : 'bg-stone-800/60 text-gray-300 hover:bg-stone-700/80 hover:text-amber-300 border border-transparent'
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
    poolType: PoolType;
}> = ({
    title,
    description,
    bannerUrl,
    onPullOne,
    onPullTen,
    isLoading,
    error,
    pullOneCost,
    pullTenCost,
    pullOneLabel = "招募一次",
    pullTenLabel = "招募十次",
    poolType,
}: {
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
    poolType: PoolType;
}) => {
        const [showRates, setShowRates] = useState(false);

        // 根据卡池类型动态显示概率
        const getRateDisplay = () => {
            if (poolType === 'permanent') {
                return (
                    <>
                        <p className={`${getRarityTextColor('神品')}`}>【神品】: 0.1%</p>
                        <p className={`${getRarityTextColor('圣品')}`}>【圣品】: 0.4%</p>
                        <p className={`${getRarityTextColor('仙品')}`}>【仙品】: 1.5%</p>
                        <p className={`${getRarityTextColor('绝品')}`}>【绝品】: 3%</p>
                        <p className={`${getRarityTextColor('珍品')}`}>【珍品】: 5%</p>
                        <p className={`${getRarityTextColor('优品')}`}>【优品】: 15%</p>
                        <p className={`${getRarityTextColor('良品')}`}>【良品】: 30%</p>
                        <p className={`${getRarityTextColor('凡品')}`}>【凡品】: 45%</p>
                    </>
                );
            } else {
                return (
                    <>
                        <p className={`${getRarityTextColor('神品')}`}>【神品】: 1% <span className="text-amber-400">↑</span></p>
                        <p className={`${getRarityTextColor('圣品')}`}>【圣品】: 2% <span className="text-amber-400">↑</span></p>
                        <p className={`${getRarityTextColor('仙品')}`}>【仙品】: 5% <span className="text-amber-400">↑</span></p>
                        <p className={`${getRarityTextColor('绝品')}`}>【绝品】: 6% <span className="text-amber-400">↑</span></p>
                        <p className={`${getRarityTextColor('珍品')}`}>【珍品】: 8% <span className="text-amber-400">↑</span></p>
                        <p className={`${getRarityTextColor('优品')}`}>【优品】: 18% <span className="text-amber-400">↑</span></p>
                        <p className={`${getRarityTextColor('良品')}`}>【良品】: 25%</p>
                        <p className={`${getRarityTextColor('凡品')}`}>【凡品】: 35%</p>
                    </>
                );
            }
        };

        return (
            <div className="ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-800/70 via-stone-900/80 to-black/70 rounded-lg overflow-hidden flex flex-col shadow-glow-gold">
                <div className="relative h-48">
                    <img src={bannerUrl} alt={title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-800/50 to-transparent"></div>
                    <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-gradient-gold font-serif tracking-wider drop-shadow-lg text-shadow-glow">{title}</h3>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                    <p className="text-sm text-gray-200 flex-grow leading-relaxed">{description}</p>
                    <div className="text-right mt-2 mb-2">
                        <button onClick={() => setShowRates(!showRates)} className="text-xs text-stone-400 hover:text-amber-400 transition-colors duration-300">
                            概率公示 {showRates ? '▲' : '▼'}
                        </button>
                    </div>
                    {showRates && (
                        <div className="glass-morphism p-3 rounded-md mb-3 text-xs animate-slide-in border border-xianxia-gold-700/30">
                            {getRateDisplay()}
                            <p className="text-stone-500 mt-1 text-[10px]">※ 十次招募必得【优品】或以上品质的物品。</p>
                            {poolType === 'limited' && (
                                <p className="text-amber-400 mt-1 text-[10px]">※ 限定卡池高稀有度概率大幅提升！</p>
                            )}
                        </div>
                    )}
                    {error && <div className="text-red-400 text-center text-sm my-2 animate-shake">{error}</div>}
                    <div className="mt-auto flex gap-3">
                        <button onClick={onPullOne} disabled={isLoading} className="flex-1 bg-gradient-to-br from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 transition-all duration-300 rounded-md p-3 text-center border border-stone-500/50 shadow-lg disabled:opacity-50 disabled:cursor-wait hover:shadow-glow-blue">
                            <p className="font-bold text-white">{isLoading ? '...' : pullOneLabel}</p>
                            <p className="text-xs text-amber-400">消耗 {pullOneCost} 灵石</p>
                        </button>
                        <button onClick={onPullTen} disabled={isLoading} className="flex-1 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 transition-all duration-300 rounded-md p-3 text-center border border-xianxia-gold-500 shadow-glow-gold disabled:opacity-50 disabled:cursor-wait animate-shimmer">
                            <p className="font-bold text-white text-shadow-glow">{isLoading ? '天机演算中...' : pullTenLabel}</p>
                            <p className="text-xs text-amber-100">消耗 {pullTenCost} 灵石</p>
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

    // 稀有度顺序和权重定义
    const RARITY_ORDER: Rarity[] = ['凡品', '良品', '优品', '珍品', '绝品', '仙品', '圣品', '神品'];

    // 常规卡池权重（总计100%）
    const PERMANENT_RARITY_WEIGHTS: Record<Rarity, number> = {
        '凡品': 45,
        '良品': 30,
        '优品': 15,
        '珍品': 5,
        '绝品': 3,
        '仙品': 1.5,
        '圣品': 0.4,
        '神品': 0.1
    };

    // 限定卡池权重（总计100%，高稀有度概率提升）
    const LIMITED_RARITY_WEIGHTS: Record<Rarity, number> = {
        '凡品': 35,
        '良品': 25,
        '优品': 18,
        '珍品': 8,
        '绝品': 6,
        '仙品': 5,
        '圣品': 2,
        '神品': 1
    };

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

        const generationPromises = raritiesToPull.map(async (rarity) => {
            try {
                const isHighRarity = RARITY_ORDER.indexOf(rarity) >= 5;
                const shouldFeature = isHighRarity && Math.random() < 0.5;

                if (poolType === 'limited' && shouldFeature) {
                    if (gachaTab === '人物卡牌') {
                        const featuredId = LIMITED_POOL_FEATURED_CHARS[Math.floor(Math.random() * LIMITED_POOL_FEATURED_CHARS.length)];
                        const featuredChar = CHARACTER_POOL.find(c => c.id === featuredId);
                        if (featuredChar) return featuredChar;
                    } else if (gachaTab === '装备') {
                        const featuredId = LIMITED_POOL_FEATURED_EQUIPMENT[Math.floor(Math.random() * LIMITED_POOL_FEATURED_EQUIPMENT.length)];
                        const featuredEquip = EQUIPMENT_POOL.find(e => e.id === featuredId);
                        if (featuredEquip) return featuredEquip;
                    } else if (gachaTab === '通用技能') {
                        const featuredId = LIMITED_POOL_FEATURED_SKILLS[Math.floor(Math.random() * LIMITED_POOL_FEATURED_SKILLS.length)];
                        const featuredSkill = SKILL_POOL.find(s => s.id === featuredId);
                        if (featuredSkill) return featuredSkill;
                    }
                }

                switch (gachaTab) {
                    case '人物卡牌': return await generateRandomCharacter(rarity);
                    case '装备': return await generateRandomEquipment(rarity);
                    case '通用技能': return await generateRandomSkill(rarity, 'Universal');
                    case '兽宠': return await generateRandomPet(rarity);
                    default: throw new Error("Invalid gacha tab");
                }
            } catch (error) {
                console.error(`生成物品失败 (稀有度: ${rarity}):`, error);
                throw error;
            }
        });

        const generatedItems = await Promise.all(generationPromises);

        // 注意：不在这里修改任何状态，只返回抽取结果和重复检测
        const results: PulledItem[] = [];
        const isCharGacha = gachaTab === '人物卡牌';
        const isSkillGacha = gachaTab === '通用技能';
        const isPetGacha = gachaTab === '兽宠';

        for (const item of generatedItems) {
            if (!item) continue;

            let isDuplicate = false;
            if (isCharGacha) {
                isDuplicate = playerProfile.cardCollection.some((c: CharacterCard) => c.name === item.name);
            } else if (isSkillGacha) {
                isDuplicate = playerProfile.universalSkills.some((s: Skill) => s.name === item.name);
            } else if (isPetGacha) {
                isDuplicate = playerProfile.petCollection.some((p: PetCard) => p.name === item.name);
            }

            if ((isCharGacha || isSkillGacha || isPetGacha) && isDuplicate) {
                const compensationAmount = (CARD_SELL_PRICES[item.rarity] || 10) * 5;
                results.push({
                    type: 'compensation',
                    id: `comp-${item.id}-${Date.now()}`,
                    name: `重复的${isCharGacha ? '角色' : isPetGacha ? '兽宠' : '技能'}`,
                    rarity: item.rarity,
                    description: `转化为 ${compensationAmount} 灵石`,
                });
            } else {
                results.push(item);
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

        console.log('🎁 开始处理抽卡结果，共', pullResults.length, '个物品');

        // 基于当前playerProfile创建更新后的副本
        const updatedProfile = JSON.parse(JSON.stringify(playerProfile));

        pullResults.forEach(item => {
            console.log('📦 处理物品:', item.name, '稀有度:', item.rarity);
            console.log('🔍 物品类型检测:');
            console.log('  - isCompensationItem:', isCompensationItem(item));
            console.log('  - isCharacterCard:', isCharacterCard(item), '(需要gender和skills)');
            console.log('  - isEquipment:', isEquipment(item));
            console.log('  - isSkill:', isSkill(item));
            console.log('  - isPetCard:', isPetCard(item));
            console.log('  - 物品详情:', JSON.stringify(item, null, 2));

            if (isCompensationItem(item)) {
                // 补偿灵石
                const amountMatch = item.description.match(/\d+/);
                if (amountMatch) {
                    const compensation = parseInt(amountMatch[0], 10);
                    updatedProfile.spiritStones += compensation;
                    console.log('💎 补偿灵石:', compensation);
                }
            } else if (isCharacterCard(item)) {
                // 添加角色卡牌（已在simulatePull中检查过重复）
                const newCardInstance = { ...item, id: `gen-char-${item.name.replace(/\s/g, '')}-${Date.now()}-${Math.random()}` };
                updatedProfile.cardCollection.push(newCardInstance);
                console.log('👤 添加角色到cardCollection:', item.name);
            } else if (isEquipment(item)) {
                // 添加装备
                const newItemInstance = { ...item, id: `gen-equip-${item.name.replace(/\s/g, '')}-${Date.now()}-${Math.random()}` };
                updatedProfile.equipmentInventory.push(newItemInstance);
                console.log('⚔️ 添加装备到equipmentInventory:', item.name);
            } else if (isSkill(item)) {
                // 添加技能（已在simulatePull中检查过重复）
                const newSkillInstance = { ...item, id: `gen-skill-${item.name.replace(/\s/g, '')}-${Date.now()}-${Math.random()}` };
                updatedProfile.universalSkills.push(newSkillInstance);
                console.log('📜 添加技能到universalSkills:', item.name);
            } else if (isPetCard(item)) {
                // 添加宠物（已在simulatePull中检查过重复）
                const newPetInstance = { ...item, id: `gen-pet-${item.name.replace(/\s/g, '')}-${Date.now()}-${Math.random()}` };
                updatedProfile.petCollection.push(newPetInstance);
                console.log('🐾 添加宠物到petCollection:', item.name);
            }
        });

        console.log('✅ 更新后的仓库状态:');
        console.log('  - 角色数量:', updatedProfile.cardCollection.length);
        console.log('  - 装备数量:', updatedProfile.equipmentInventory.length);
        console.log('  - 技能数量:', updatedProfile.universalSkills.length);
        console.log('  - 宠物数量:', updatedProfile.petCollection.length);

        // 立即更新状态
        setPlayerProfile(updatedProfile);
        setPullResults(null);
        console.log('🎉 抽卡结果已保存到仓库！');
    };

    const renderGachaContent = () => {
        const handleDoujinPull = async () => {
            const inspiration = prompt("请输入你的灵感来源（例如，一个角色名或一段描述）:");
            if (!inspiration) return;

            const cost = 1000;
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

                // 同人卡池也使用常规概率系统，不再固定高稀有度
                const rarity = determineRarity('permanent', false);
                console.log(`🎲 同人卡池抽取稀有度: ${rarity}`);

                let result;
                switch (gachaTab) {
                    case '人物卡牌':
                        result = await generateDoujinCharacter(inspiration, rarity);
                        break;
                    case '装备':
                        result = await generateDoujinEquipment(inspiration, rarity);
                        break;
                    case '通用技能':
                        result = await generateDoujinSkill(inspiration, rarity, 'Universal');
                        break;
                    case '兽宠':
                        result = await generateDoujinPet(inspiration, rarity);
                        break;
                    default:
                        alert(`"${gachaTab}"类型的同人创作功能出现错误。`);
                        setPlayerProfile({ ...playerProfile, spiritStones: originalStones });
                        setIsPulling(false);
                        return;
                }
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
            '兽宠': { title: "御兽斋", description: "常驻兽宠池，可契约各种珍奇灵兽。", bannerUrl: "https://i.imgur.com/aJ4Gq9a.jpg", onPull: () => handlePull(100, 1, 'permanent') },
        };

        const doujinPools = {
            '人物卡牌': { title: "异界降临", description: "消耗大量灵石，将你的“灵感”化为现实，召唤来自异界的强者。", bannerUrl: "https://i.imgur.com/s6A4b3g.jpg", onPull: handleDoujinPull },
            '装备': { title: "神兵天成", description: "消耗大量灵石，根据你的“灵感”锻造出传说中的神兵利器。", bannerUrl: "https://i.imgur.com/Tq9g8xS.jpg", onPull: handleDoujinPull },
            '通用技能': { title: "大道顿悟", description: "消耗大量灵石，从你的“灵感”中领悟出惊天动地的无上功法。", bannerUrl: "https://i.imgur.com/o2N5d1m.jpg", onPull: handleDoujinPull },
            '兽宠': { title: "灵兽创生", description: "消耗大量灵石，将你的“灵感”化为现实，创造一只独一无二的灵兽伙伴。", bannerUrl: "https://i.imgur.com/Yp8zL5g.jpg", onPull: handleDoujinPull },
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
                    poolType='permanent'
                />
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col font-serif text-gray-300 bg-gradient-to-br from-stone-900 via-stone-950 to-black">
            <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-xianxia-gold-700/30">
                <TabButton label="抽取卡池" isActive={mainTab === '抽取卡池'} onClick={() => setMainTab('抽取卡池')} />
                <TabButton label="道具购买" isActive={mainTab === '道具购买'} onClick={() => setMainTab('道具购买')} />
            </div>
            <div className="flex-grow overflow-y-auto bg-black/20 p-4 scrollbar-xianxia">
                {mainTab === '抽取卡池' && (
                    <div className="space-y-4">
                        <div className="flex justify-center gap-3">
                            <SubTabButton label="人物卡牌" isActive={gachaTab === '人物卡牌'} onClick={() => setGachaTab('人物卡牌')} />
                            <SubTabButton label="装备" isActive={gachaTab === '装备'} onClick={() => setGachaTab('装备')} />
                            <SubTabButton label="通用技能" isActive={gachaTab === '通用技能'} onClick={() => setGachaTab('通用技能')} />
                            <SubTabButton label="兽宠" isActive={gachaTab === '兽宠'} onClick={() => setGachaTab('兽宠')} />
                        </div>
                        {renderGachaContent()}
                    </div>
                )}
                {mainTab === '道具购买' && (
                    <div className="p-6 text-center font-serif flex flex-col items-center justify-center h-full">
                        <div className="glass-morphism p-8 rounded-lg ornate-border border-xianxia-gold-600">
                            <div className="text-6xl mb-6 animate-bounce-slow">💰</div>
                            <p className="text-gradient-gold text-xl font-bold mb-2">此功能尚未开放</p>
                            <p className="text-gray-400 mt-2">未来的商店将在此处展示，可购买丹药、材料等。</p>
                        </div>
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
