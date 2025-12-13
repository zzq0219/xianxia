import React, { useState } from 'react';
import { PetCard } from '../types';
import { getRarityBorderColor, getRarityTextColor } from './rarityHelpers';
import SkillDetail from './SkillDetail';

interface PetDetailProps {
    pet: PetCard;
    onClose: () => void;
}

const PetDetail: React.FC<PetDetailProps> = ({ pet, onClose }) => {
    const [showSkillDetail, setShowSkillDetail] = useState(false);

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
                onClick={onClose}
            >
                <div
                    className="ornate-border bg-stone-800/90 backdrop-blur-lg w-full max-w-lg h-auto max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 flex-shrink-0 bg-black/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-white font-serif flex items-baseline gap-3">
                                    <span>{pet.name}</span>
                                    <span className={`text-lg font-medium ${getRarityTextColor(pet.rarity)}`}>
                                        [{pet.rarity}]
                                    </span>
                                </h2>
                                <p className="text-lg text-amber-400 font-serif">{pet.gender === 'Male' ? '雄性' : '雌性'}</p>
                            </div>
                            <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                                <i className="fa-solid fa-times text-2xl"></i>
                            </button>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-300">
                            <p><span className="text-gray-500 font-semibold">描述:</span> {pet.description}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 overflow-y-auto flex-grow">
                        <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
                            <h4 className="font-semibold text-amber-400 mb-3 text-lg">兽宠技能</h4>
                            <div
                                className={`relative w-full text-left bg-stone-700/50 p-3 rounded-md border-2 ${getRarityBorderColor(pet.skill.rarity)} cursor-pointer hover:bg-stone-600/70 transition-colors`}
                                onClick={() => setShowSkillDetail(true)}
                            >
                                <div className="flex justify-between items-baseline">
                                    <h5 className="font-bold text-white flex items-baseline gap-2">
                                        <span className={`${getRarityTextColor(pet.skill.rarity)}`}>{pet.skill.name}</span>
                                        <span className={`text-xs font-medium ${getRarityTextColor(pet.skill.rarity)}`}>[{pet.skill.rarity}]</span>
                                    </h5>
                                </div>
                                <p className="text-sm font-semibold text-amber-300 mt-1">{pet.skill.mechanicsDescription}</p>
                                <p className="text-xs text-gray-400 mt-1">{pet.skill.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showSkillDetail && (
                <SkillDetail
                    skill={pet.skill}
                    onClose={() => setShowSkillDetail(false)}
                />
            )}
        </>
    );
};

export default PetDetail;