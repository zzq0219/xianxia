import React, { useState } from 'react';
import { CharacterCard, PetCard, PlayerProfile } from '../types';
import CharacterDetail from './CharacterDetail';
import { getRarityBgColor, getRarityBorderColor, getRarityTextColor } from './rarityHelpers';

interface PartyFormationProps {
    playerProfile: PlayerProfile;
    setPlayerProfile: (profile: PlayerProfile) => void;
    onViewPet: (pet: PetCard) => void;
}

const PartyFormation: React.FC<PartyFormationProps> = ({ playerProfile, setPlayerProfile, onViewPet }) => {
    const [selectedDetailCard, setSelectedDetailCard] = useState<CharacterCard | null>(null);
    const [selectedForParty, setSelectedForParty] = useState<CharacterCard | null>(null);

    const handleSelectForParty = (card: CharacterCard) => {
        setSelectedForParty(card);
    };

    const handlePartySlotClick = (index: number, gender: 'Male' | 'Female') => {
        if (!selectedForParty) return;
        if (selectedForParty.gender !== gender) return; // Cannot assign to wrong gender team

        const newProfile = JSON.parse(JSON.stringify(playerProfile));
        const partyKey = gender === 'Male' ? 'maleParty' : 'femaleParty';

        // Remove from any party first
        newProfile.maleParty = newProfile.maleParty.filter((c: CharacterCard) => c.id !== selectedForParty.id);
        newProfile.femaleParty = newProfile.femaleParty.filter((c: CharacterCard) => c.id !== selectedForParty.id);

        const targetParty = newProfile[partyKey];
        const existingCard = targetParty[index];

        if (existingCard) {
            // Swap
            const oldIndexInParty = playerProfile[partyKey].findIndex(c => c.id === existingCard.id);
            if (oldIndexInParty !== -1) {
                targetParty[index] = selectedForParty;
            }
        } else {
            // Add to empty slot
            targetParty[index] = selectedForParty;
        }

        // Fill empty spots with null to preserve order, then filter out nulls
        const finalParty = [...Array(4)].map((_, i) => targetParty[i] || null).filter(Boolean);
        newProfile[partyKey] = finalParty;

        setPlayerProfile(newProfile);
        setSelectedForParty(null);
    };

    const handleRemoveFromParty = (cardId: string, gender: 'Male' | 'Female') => {
        const newProfile = JSON.parse(JSON.stringify(playerProfile));
        const partyKey = gender === 'Male' ? 'maleParty' : 'femaleParty';
        newProfile[partyKey] = newProfile[partyKey].filter((c: CharacterCard) => c.id !== cardId);
        setPlayerProfile(newProfile);
    };

    const TeamBuilder: React.FC<{ gender: 'Male' | 'Female' }> = ({ gender }) => {
        const party = gender === 'Male' ? playerProfile.maleParty : playerProfile.femaleParty;
        const collection = playerProfile.cardCollection.filter(c => c.gender === gender);
        const titleColor = gender === 'Male' ? 'text-sky-400' : 'text-pink-400';
        const isCardInParty = (cardId: string) => party.some(p => p.id === cardId);

        return (
            <div className="ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-800/70 via-stone-900/80 to-black/70 p-4 rounded-lg flex flex-col h-full shadow-glow-gold">
                <h3 className={`text-center font-bold text-gradient-gold mb-3 text-xl text-shadow-glow`}>{gender === 'Male' ? '男性编队 ⚔️' : '女性编队 🌸'}</h3>

                {/* Party Slots */}
                <div className="mb-4">
                    <h4 className="font-semibold text-gradient-gold mb-2 text-shadow-glow">上阵队伍 ({party.length}/4)</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="relative">
                                <div
                                    onClick={() => handlePartySlotClick(i, gender)}
                                    className={`h-28 w-full rounded-lg flex flex-col items-center justify-center p-2 text-center transition-all duration-300 border-2 cursor-pointer ${party[i]
                                        ? `${getRarityBorderColor(party[i].rarity)} bg-gradient-to-br from-stone-700/60 to-stone-800/70 hover:from-stone-600/80 hover:to-stone-700/90 shadow-lg hover:shadow-glow-gold`
                                        : 'border-dashed border-stone-600 bg-black/30 hover:bg-stone-800/50 hover:border-amber-500/50'
                                        }`}
                                >
                                    {party[i] ? (
                                        <>
                                            <p className="font-bold font-serif text-white text-sm text-shadow-glow">{party[i].name}</p>
                                            <p className={`text-xs font-semibold ${getRarityTextColor(party[i].rarity)}`}>{party[i].realm}</p>
                                            {party[i].pet && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onViewPet(party[i].pet!); }}
                                                    className="absolute -bottom-1 -left-1 bg-purple-600 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center hover:bg-purple-500 transition-colors z-10 border border-stone-900 shadow-glow-purple"
                                                    title={`兽宠: ${party[i].pet!.name}`}
                                                >
                                                    🐾
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-stone-500 text-3xl opacity-50 hover:text-amber-400 hover:opacity-80 transition-all duration-300">+</span>
                                    )}
                                </div>
                                {party[i] && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleRemoveFromParty(party[i].id, gender); }}
                                            className="absolute -top-1 -right-1 bg-gradient-to-br from-red-600 to-red-700 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center hover:from-red-500 hover:to-red-600 transition-all duration-300 z-10 border border-stone-900 shadow-glow-red hover:scale-110"
                                            title="卸下"
                                        >
                                            ×
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedDetailCard(party[i]); }}
                                            className="absolute -bottom-1 -right-1 bg-gradient-to-br from-sky-600 to-sky-700 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center hover:from-sky-500 hover:to-sky-600 transition-all duration-300 z-10 border border-stone-900 shadow-glow-blue hover:scale-110"
                                            title="详情"
                                        >
                                            i
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Collection */}
                <div className="flex-grow overflow-y-auto pr-2 scrollbar-xianxia">
                    <h4 className="font-semibold text-gradient-gold mb-2 text-shadow-glow">图鉴</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {collection.map(card => (
                            <button
                                key={card.id}
                                onClick={() => handleSelectForParty(card)}
                                onDoubleClick={() => setSelectedDetailCard(card)}
                                disabled={isCardInParty(card.id)}
                                className={`relative p-2 rounded-lg border-2 text-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 ${selectedForParty?.id === card.id ? 'ring-4 ring-green-500 ring-offset-2 ring-offset-stone-800 shadow-glow-green animate-pulse-slow' : ''
                                    } ${getRarityBorderColor(card.rarity)} ${getRarityBgColor(card.rarity, !isCardInParty(card.id))} hover:shadow-lg`}
                            >
                                <p className="font-bold font-serif text-white text-sm text-shadow-glow">{card.name}</p>
                                <p className={`text-xs font-semibold ${getRarityTextColor(card.rarity)}`}>{card.realm}</p>
                                {isCardInParty(card.id) &&
                                    <div className="absolute top-0.5 right-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] px-1.5 rounded-full font-bold shadow-glow-gold animate-shimmer">
                                        上阵
                                    </div>
                                }
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 text-gray-300 font-serif h-full bg-gradient-to-br from-stone-900 via-stone-950 to-black">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <TeamBuilder gender="Male" />
                <TeamBuilder gender="Female" />
            </div>
            {selectedDetailCard && (
                <CharacterDetail
                    card={selectedDetailCard}
                    onClose={() => setSelectedDetailCard(null)}
                    playerProfile={playerProfile}
                    setPlayerProfile={setPlayerProfile}
                    onViewPet={onViewPet}
                />
            )}
        </div>
    );
};

export default PartyFormation;