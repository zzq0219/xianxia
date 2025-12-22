

import React from 'react';
import { BattleParticipant, Skill } from '../types';
import SkillCard from './SkillCard';

interface ActionSelectionMenuProps {
    activeCard: BattleParticipant;
    onAction: (action: string | Skill) => void;
    onClose: () => void;
}

const ActionSelectionMenu: React.FC<ActionSelectionMenuProps> = ({ activeCard, onAction, onClose }) => {
    const { card } = activeCard;

    return (
        <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            {/* Bottom Action Area Container */}
            <div className="absolute bottom-0 left-0 right-0 h-[60vh] flex flex-col justify-end items-center pb-32 md:pb-40 bg-gradient-to-t from-black via-stone-900/90 to-transparent">

                {/* Carousel Container */}
                <div
                    className="
                        w-full flex items-end overflow-x-auto overflow-y-visible py-8 px-4 md:px-12 no-scrollbar snap-x snap-mandatory
                        perspective-1000
                        animate-fade-in-up origin-bottom
                    "
                    style={{ perspective: '1000px' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex mx-auto gap-2 md:gap-4 items-end min-w-min pl-[35vw] pr-[35vw]">
                        {/* Basic Attack Card */}
                        <div className="snap-center shrink-0 origin-bottom hover:-translate-y-4 hover:rotate-0 transition-all duration-300">
                            <SkillCard
                                skill="普通攻击"
                                onClick={() => onAction('普通攻击')}
                            />
                        </div>

                        {/* Character Skills */}
                        {card.skills.map((skill) => skill && (
                            <div key={skill.id} className="snap-center shrink-0 origin-bottom hover:-translate-y-4 hover:rotate-0 transition-all duration-300">
                                <SkillCard
                                    skill={skill}
                                    onClick={() => onAction(skill)}
                                />
                            </div>
                        ))}

                        {/* Pet Skill */}
                        {activeCard.pet && (
                            <div key={activeCard.pet.skill.id} className="snap-center shrink-0 origin-bottom hover:-translate-y-4 hover:rotate-0 transition-all duration-300">
                                <SkillCard
                                    skill={activeCard.pet.skill}
                                    onClick={() => onAction(activeCard.pet!.skill)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Close Button (Knob/X Style) - Overlays the Battlefield panel button */}
                <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up delay-100">
                    <button
                        onClick={onClose}
                        className="
                            group relative w-20 h-20 rounded-full
                            bg-stone-900 border-2 border-red-500/50 hover:border-red-500
                            flex items-center justify-center
                            transition-all duration-300 hover:scale-105 hover:rotate-90
                            shadow-[0_0_30px_rgba(239,68,68,0.3)]
                        "
                    >
                        {/* Inner Dashed Border (Knob effect) */}
                        <div className="absolute inset-2 rounded-full border-2 border-dashed border-stone-500/50 group-hover:border-red-500/50 animate-spin-slow" />

                        {/* X Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-stone-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActionSelectionMenu;