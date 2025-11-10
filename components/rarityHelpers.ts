
import { Rarity } from '../types';

export const getRarityTextColor = (rarity: Rarity | undefined): string => {
    if (!rarity) return 'text-gray-400';
    switch (rarity) {
        case '凡品': return 'text-gray-400';
        case '良品': return 'text-green-400';
        case '优品': return 'text-blue-400';
        case '珍品': return 'text-purple-400';
        case '绝品': return 'text-amber-400';
        case '仙品': return 'text-red-400';
        case '圣品': return 'text-yellow-300 animate-glow';
        case '神品': return 'text-rainbow font-black';
        default: return 'text-gray-400';
    }
};

export const getRarityBorderColor = (rarity: Rarity | undefined): string => {
    if (!rarity) return 'border-gray-600/50';
    switch (rarity) {
        case '凡品': return 'border-gray-600/50';
        case '良品': return 'border-green-500/60';
        case '优品': return 'border-blue-500/60';
        case '珍品': return 'border-purple-500/60';
        case '绝品': return 'border-amber-400/70';
        case '仙品': return 'border-red-500/70';
        case '圣品': return 'border-yellow-300/80';
        case '神品': return 'border-fuchsia-400 animate-pulse-fast';
        default: return 'border-gray-600/50';
    }
};

export const getRarityGlow = (rarity: Rarity | undefined): string => {
    if (!rarity) return '';
    switch (rarity) {
        case '良品': return 'shadow-[0_0_12px_2px_rgba(34,197,94,0.4)]';
        case '优品': return 'shadow-[0_0_12px_2px_rgba(59,130,246,0.5)]';
        case '珍品': return 'shadow-[0_0_12px_2px_rgba(168,85,247,0.5)]';
        case '绝品': return 'shadow-[0_0_15px_3px_rgba(251,191,36,0.6)]';
        case '仙品': return 'shadow-[0_0_18px_4px_rgba(239,68,68,0.6)]';
        case '圣品': return 'shadow-[0_0_22px_5px_rgba(253,224,71,0.7)] animate-pulse';
        case '神品': return 'shadow-[0_0_30px_6px_rgba(236,72,153,0.7)] animate-pulse-fast';
        default: return '';
    }
};

export const getRarityBgColor = (rarity: Rarity | undefined, hover: boolean = true): string => {
    const hoverClasses = hover ? ' transition-colors' : '';
    if (!rarity) return 'bg-slate-800/70' + hoverClasses;
    switch (rarity) {
        case '凡品': return 'bg-slate-800/70' + (hover ? ' hover:bg-slate-800/90' : '');
        case '良品': return 'bg-green-900/20' + (hover ? ' hover:bg-green-900/30' : '');
        case '优品': return 'bg-blue-900/20' + (hover ? ' hover:bg-blue-900/30' : '');
        case '珍品': return 'bg-purple-900/20' + (hover ? ' hover:bg-purple-900/30' : '');
        case '绝品': return 'bg-amber-900/20' + (hover ? ' hover:bg-amber-900/30' : '');
        case '仙品': return 'bg-red-900/20' + (hover ? ' hover:bg-red-900/30' : '');
        case '圣品': return 'bg-yellow-900/30' + (hover ? ' hover:bg-yellow-900/40' : '');
        case '神品': return 'bg-purple-900/40' + (hover ? ' hover:bg-purple-900/50' : '');
        default: return 'bg-slate-800/70' + hoverClasses;
    }
};
