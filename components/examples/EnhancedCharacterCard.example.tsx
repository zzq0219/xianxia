import React from 'react';
import { CharacterCard } from '../../types';

/**
 * 增强版角色卡片组件示例
 * 展示如何应用美化样式到CharacterCard组件
 */

interface EnhancedCharacterCardProps {
    character: CharacterCard;
    onClick?: () => void;
    isSelected?: boolean;
}

export const EnhancedCharacterCard: React.FC<EnhancedCharacterCardProps> = ({
    character,
    onClick,
    isSelected = false,
}) => {
    // 根据稀有度确定边框样式
    const getRarityClass = (rarity: string) => {
        const rarityMap: { [key: string]: string } = {
            'common': 'border-gray-400',
            'uncommon': 'border-green-400',
            'rare': 'border-blue-400',
            'epic': 'border-purple-500',
            'legendary': 'border-xianxia-gold-400 card-legendary-glow',
            'mythic': 'border-pink-500 card-legendary-glow',
        };
        return rarityMap[rarity.toLowerCase()] || 'border-gray-400';
    };

    return (
        <div
            onClick={onClick}
            className={`
        card-3d-hover
        ornate-border
        ${getRarityClass(character.rarity)}
        ${isSelected ? 'ring-4 ring-xianxia-gold-400 scale-105' : ''}
        relative overflow-hidden
        bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950
        rounded-xl
        cursor-pointer
        transition-all duration-300
        group
      `}
        >
            {/* 角色立绘背景 */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={character.artUrl || '/placeholder-avatar.png'}
                    alt={character.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* 顶部渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-900" />

                {/* 稀有度标签 */}
                <div className="absolute top-2 right-2 px-3 py-1 rounded-full glass-morphism text-xs font-bold">
                    <span className={`text-gradient-${character.rarity.toLowerCase()}`}>
                        {character.rarity}
                    </span>
                </div>

                {/* 等级徽章 */}
                <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-gradient-to-br from-xianxia-gold-400 to-xianxia-gold-600 flex items-center justify-center border-2 border-xianxia-gold-300 shadow-glow-gold">
                    <span className="text-stone-900 font-bold text-sm">
                        {character.realm}
                    </span>
                </div>
            </div>

            {/* 角色信息 */}
            <div className="p-4 space-y-3">
                {/* 名字和称号 */}
                <div className="text-center">
                    <h3 className="text-lg font-bold text-xianxia-gold-300 text-shadow-glow">
                        {character.name}
                    </h3>
                    {character.title && (
                        <p className="text-xs text-gray-400 italic">
                            「{character.title}」
                        </p>
                    )}
                </div>

                {/* 属性条 */}
                <div className="space-y-2">
                    {/* 生命值 */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-red-400">生命</span>
                            <span className="text-gray-300">
                                {character.baseAttributes.hp}/{character.baseAttributes.maxHp}
                            </span>
                        </div>
                        <div className="hp-bar-enhanced">
                            <div
                                className="hp-bar-fill"
                                style={{ width: `${(character.baseAttributes.hp / character.baseAttributes.maxHp) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* 法力值 */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-blue-400">法力</span>
                            <span className="text-gray-300">
                                {character.baseAttributes.mp}/{character.baseAttributes.maxMp}
                            </span>
                        </div>
                        <div className="mp-bar-enhanced">
                            <div
                                className="mp-bar-fill"
                                style={{ width: `${(character.baseAttributes.mp / character.baseAttributes.maxMp) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* 主要属性 */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-700">
                    <div className="text-center">
                        <div className="text-xs text-gray-400">攻击</div>
                        <div className="text-sm font-bold text-red-400">
                            {character.baseAttributes.attack}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400">防御</div>
                        <div className="text-sm font-bold text-blue-400">
                            {character.baseAttributes.defense}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400">速度</div>
                        <div className="text-sm font-bold text-green-400">
                            {character.baseAttributes.speed}
                        </div>
                    </div>
                </div>

                {/* 技能图标 */}
                {character.skills && (
                    <div className="flex gap-1 justify-center pt-2">
                        {character.skills.filter(s => s !== null).map((skill, idx) => (
                            <div
                                key={skill!.id}
                                className="w-8 h-8 rounded bg-gradient-to-br from-stone-700 to-stone-800 border border-stone-600 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                                title={skill!.name}
                            >
                                <span className="text-xs">⚔️</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 悬停效果 - 闪光扫过 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="shimmer-effect" />
            </div>

            {/* 选中状态 - 光效 */}
            {isSelected && (
                <div className="absolute inset-0 pointer-events-none animate-pulse-glow rounded-xl" />
            )}
        </div>
    );
};

/**
 * 角色卡片网格容器示例
 */
export const CharacterCardGrid: React.FC<{ characters: CharacterCard[] }> = ({
    characters,
}) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
            {characters.map((character) => (
                <EnhancedCharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => console.log('选中角色:', character.name)}
                />
            ))}
        </div>
    );
};

/**
 * 使用说明：
 * 
 * 1. 导入组件：
 *    import { EnhancedCharacterCard } from './components/examples/EnhancedCharacterCard.example';
 * 
 * 2. 使用示例：
 *    <EnhancedCharacterCard 
 *      character={characterData} 
 *      onClick={handleClick}
 *      isSelected={selectedId === characterData.id}
 *    />
 * 
 * 3. 确保已引入 enhanced-ui.css 样式文件
 * 
 * 4. 样式类说明：
 *    - card-3d-hover: 3D悬停效果
 *    - ornate-border: 华丽边框
 *    - card-legendary-glow: 传说级发光效果（仅用于传说及以上稀有度）
 *    - hp-bar-enhanced/mp-bar-enhanced: 增强进度条
 *    - glass-morphism: 毛玻璃效果
 *    - text-shadow-glow: 文字发光效果
 */