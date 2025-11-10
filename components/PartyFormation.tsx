import React, { useState } from 'react';
import { PlayerProfile, CharacterCard } from '../types';
import CharacterDetail from './CharacterDetail';
import { getRarityBorderColor, getRarityTextColor, getRarityBgColor } from './rarityHelpers';

interface PartyFormationProps {
  playerProfile: PlayerProfile;
  setPlayerProfile: (profile: PlayerProfile) => void;
}

const PartyFormation: React.FC<PartyFormationProps> = ({ playerProfile, setPlayerProfile }) => {
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
            <div className="bg-black/20 p-4 rounded-lg flex flex-col h-full border border-stone-700/50">
                <h3 className={`text-center font-bold ${titleColor} mb-3 text-lg`}>{gender === 'Male' ? '男性编队' : '女性编队'}</h3>
                
                {/* Party Slots */}
                <div className="mb-4">
                    <h4 className="font-semibold text-amber-400 mb-2">上阵队伍 ({party.length}/4)</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="relative">
                                <button
                                    onClick={() => handlePartySlotClick(i, gender)}
                                    className={`h-28 w-full rounded-lg flex flex-col items-center justify-center p-2 text-center transition-colors border-2 ${
                                        party[i] 
                                        ? `${getRarityBorderColor(party[i].rarity)} bg-stone-700/50 hover:bg-stone-600/70 shadow-inner shadow-black/50`
                                        : 'border-dashed border-stone-600 bg-black/20 hover:bg-stone-800/50'
                                    }`}
                                >
                                    {party[i] ? (
                                        <>
                                            <p className="font-bold font-serif text-white text-sm">{party[i].name}</p>
                                            <p className={`text-xs font-semibold ${getRarityTextColor(party[i].rarity)}`}>{party[i].realm}</p>
                                        </>
                                    ) : (
                                        <span className="text-stone-500 text-3xl opacity-50">+</span>
                                    )}
                                </button>
                                {party[i] && (
                                    <>
                                        <button 
                                            onClick={() => handleRemoveFromParty(party[i].id, gender)}
                                            className="absolute -top-1 -right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-500 transition-colors z-10 border border-stone-900"
                                            title="卸下"
                                        >
                                            ×
                                        </button>
                                         <button 
                                            onClick={() => setSelectedDetailCard(party[i])}
                                            className="absolute -bottom-1 -right-1 bg-sky-600 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center hover:bg-sky-500 transition-colors z-10 border border-stone-900"
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
                <div className="flex-grow overflow-y-auto pr-2">
                    <h4 className="font-semibold text-amber-400 mb-2">图鉴</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {collection.map(card => (
                            <button 
                                key={card.id} 
                                onClick={() => handleSelectForParty(card)}
                                onDoubleClick={() => setSelectedDetailCard(card)}
                                disabled={isCardInParty(card.id)}
                                className={`relative p-2 rounded-lg border-2 text-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                                    selectedForParty?.id === card.id ? 'ring-4 ring-green-500 ring-offset-2 ring-offset-stone-800' : ''
                                } ${getRarityBorderColor(card.rarity)} ${ getRarityBgColor(card.rarity, !isCardInParty(card.id)) }`}
                            >
                                <p className="font-bold font-serif text-white text-sm">{card.name}</p>
                                <p className={`text-xs font-semibold ${getRarityTextColor(card.rarity)}`}>{card.realm}</p>
                                 {isCardInParty(card.id) && 
                                    <div className="absolute top-0.5 right-0.5 bg-amber-500 text-white text-[9px] px-1 rounded-full font-bold">
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
        <div className="p-4 sm:p-6 text-gray-300 font-serif h-full">
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
              />
            )}
        </div>
    );
};

export default PartyFormation;