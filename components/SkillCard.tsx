import React from 'react';
import { Skill } from '../types';
import { getRarityTextColor } from './rarityHelpers';

interface SkillCardProps {
    skill: Skill | string;
    onClick: () => void;
    disabled?: boolean;
    isActive?: boolean; // For carousel highlighting
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onClick, disabled, isActive = false }) => {
    const isSkillObject = typeof skill !== 'string';

    const name = isSkillObject ? skill.name : skill;
    // const description = isSkillObject ? skill.mechanicsDescription : '刚猛无俦，破灭万法'; // Example placeholder logic
    const description = isSkillObject ? (skill.mechanicsDescription || '玄妙莫测之术') : '普通攻击，朴实无华';
    const cost = isSkillObject ? skill.cost : 0;
    const rarity = isSkillObject ? skill.rarity : '凡品';

    // Icon mapping based on name keywords (simple heuristic)
    const getIcon = (n: string) => {
        if (n.includes('火') || n.includes('炎')) return '🔥';
        if (n.includes('雷') || n.includes('电')) return '⚡';
        if (n.includes('水') || n.includes('冰')) return '💧';
        if (n.includes('风')) return '🌪️';
        if (n.includes('剑')) return '⚔️';
        if (n.includes('医') || n.includes('愈')) return '🌿';
        return '✦';
    };

    const icon = getIcon(name);

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                group relative flex-shrink-0 flex flex-col justify-between items-center text-center
                w-36 h-56 p-3 mx-2 md:w-40 md:h-60
                transition-all duration-500 ease-out
                ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}
                ${isActive ? 'scale-110 z-10 shadow-[0_0_30px_rgba(251,191,36,0.3)]' : 'scale-100 hover:scale-105 opacity-80 hover:opacity-100'}
                border border-amber-500/30 rounded-lg
                bg-black
            `}
            style={{
                fontFamily: '"Noto Serif SC", "SimSun", serif', // Enforce serif font
            }}
        >
            {/* Dark Background Texture */}
            <div className="absolute inset-0 bg-stone-950 rounded-lg overflow-hidden">
                {/* Subtle pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 via-black to-black" />
            </div>

            {/* Corner Accents (Gold) */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/60" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500/60" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500/60" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/60" />

            {/* Top Right Icon */}
            <div className="absolute top-3 right-3 text-stone-600 group-hover:text-amber-500/80 transition-colors text-xl">
                {icon}
            </div>

            {/* Top Left Cost */}
            {cost > 0 && (
                <div className="absolute top-3 left-3 text-[10px] font-mono text-stone-500 border border-stone-800 bg-stone-900 px-1 rounded">
                    {cost} MP
                </div>
            )}

            {/* Content Container */}
            <div className="z-10 w-full h-full flex flex-col justify-between py-4">

                {/* Spacer */}
                <div className="flex-1" />

                {/* Main Text (Vertical or Large Centered) */}
                <div className="flex-grow flex items-center justify-center">
                    {/* Trying a vertical layout feel if name is short, otherwise horizontal wrapped */}
                    <h3 className={`
                        text-xl md:text-2xl font-bold tracking-widest text-stone-200
                        ${name.length <= 4 ? 'writing-vertical-rl' : ''}
                        drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
                        group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]
                        transition-all duration-300
                    `}>
                        {name}
                    </h3>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom Description */}
                <div className="w-full border-t border-stone-800 pt-3 mt-2">
                    <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed px-1 font-sans">
                        {description}
                    </p>
                    <p className={`text-[9px] mt-1 ${getRarityTextColor(rarity)} opacity-60`}>
                        {rarity}
                    </p>
                </div>
            </div>

            {/* Hover Glow Border */}
            <div className="absolute inset-0 border border-amber-500/0 group-hover:border-amber-500/50 rounded-lg transition-colors duration-500 pointer-events-none" />
        </button>
    );
};

export default SkillCard;