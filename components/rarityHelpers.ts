
import { Rarity } from '../types';

/**
 * 水墨风格稀有度颜色系统
 * 使用淡雅的色调，保持水墨画的意境
 */

export const getRarityTextColor = (rarity: Rarity | undefined): string => {
    if (!rarity) return 'text-ink-400';
    switch (rarity) {
        case '凡品': return 'text-ink-400';                              // 淡墨色
        case '良品': return 'text-ink-300';                              // 浅墨色
        case '优品': return 'text-gold-500';                             // 淡金色
        case '珍品': return 'text-gold-400';                             // 金色
        case '绝品': return 'text-gold-300';                             // 亮金色
        case '仙品': return 'text-cinnabar-400';                         // 朱砂红
        case '圣品': return 'text-gold-300 animate-glow';                // 金辉
        case '神品': return 'text-rainbow font-bold';                    // 流光溢彩
        default: return 'text-ink-400';
    }
};

export const getRarityBorderColor = (rarity: Rarity | undefined): string => {
    if (!rarity) return 'border-ink-600/50';
    switch (rarity) {
        case '凡品': return 'border-ink-600/50';
        case '良品': return 'border-ink-500/60';
        case '优品': return 'border-gold-600/50';
        case '珍品': return 'border-gold-500/60';
        case '绝品': return 'border-gold-400/70';
        case '仙品': return 'border-cinnabar-500/70';
        case '圣品': return 'border-gold-300/80';
        case '神品': return 'border-gold-400/80 animate-pulse-soft';
        default: return 'border-ink-600/50';
    }
};

export const getRarityGlow = (rarity: Rarity | undefined): string => {
    if (!rarity) return '';
    switch (rarity) {
        case '凡品': return '';
        case '良品': return 'shadow-[0_0_8px_1px_rgba(115,115,115,0.3)]';           // 淡墨晕
        case '优品': return 'shadow-[0_0_10px_2px_rgba(184,149,106,0.3)]';          // 淡金晕
        case '珍品': return 'shadow-[0_0_12px_2px_rgba(184,149,106,0.4)]';          // 金晕
        case '绝品': return 'shadow-[0_0_15px_3px_rgba(212,181,150,0.5)]';          // 金辉
        case '仙品': return 'shadow-[0_0_15px_3px_rgba(166,61,61,0.4)]';            // 朱砂晕
        case '圣品': return 'shadow-[0_0_20px_4px_rgba(212,184,150,0.6)] animate-pulse-soft'; // 圣光
        case '神品': return 'shadow-[0_0_25px_5px_rgba(212,184,150,0.5)] animate-pulse-soft'; // 神辉
        default: return '';
    }
};

export const getRarityBgColor = (rarity: Rarity | undefined, hover: boolean = true): string => {
    const hoverClasses = hover ? ' transition-colors duration-300' : '';
    if (!rarity) return 'bg-ink-800/70' + hoverClasses;
    switch (rarity) {
        case '凡品': return 'bg-ink-800/70' + (hover ? ' hover:bg-ink-800/90' : '');
        case '良品': return 'bg-ink-800/60' + (hover ? ' hover:bg-ink-700/70' : '');
        case '优品': return 'bg-ink-800/50' + (hover ? ' hover:bg-ink-700/60' : '');
        case '珍品': return 'bg-gold-900/20' + (hover ? ' hover:bg-gold-900/30' : '');
        case '绝品': return 'bg-gold-800/25' + (hover ? ' hover:bg-gold-800/35' : '');
        case '仙品': return 'bg-cinnabar-600/15' + (hover ? ' hover:bg-cinnabar-600/25' : '');
        case '圣品': return 'bg-gold-700/25' + (hover ? ' hover:bg-gold-700/35' : '');
        case '神品': return 'bg-gold-600/30' + (hover ? ' hover:bg-gold-600/40' : '');
        default: return 'bg-ink-800/70' + hoverClasses;
    }
};

/**
 * 获取稀有度的水墨风格描述
 */
export const getRarityInkStyle = (rarity: Rarity | undefined): string => {
    if (!rarity) return '';
    switch (rarity) {
        case '凡品': return '淡墨';
        case '良品': return '浓墨';
        case '优品': return '描金';
        case '珍品': return '鎏金';
        case '绝品': return '烁金';
        case '仙品': return '朱砂';
        case '圣品': return '金辉';
        case '神品': return '璀璨';
        default: return '';
    }
};
