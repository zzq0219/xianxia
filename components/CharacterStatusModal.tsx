import React, { useState } from 'react';
import { CharacterCard, PetCard } from '../types';
import { getRarityBorderColor, getRarityTextColor } from './rarityHelpers';

interface CharacterStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    cardCollection: CharacterCard[];
    petCollection: PetCard[];
    busyCharacterDetails: Map<string, string>;
}

type StatusTab = '空闲中' | '忙碌中';
type TypeTab = '人物' | '兽宠';
type GenderTab = '全部' | '男' | '女';

const CharacterCardDisplay: React.FC<{ card: CharacterCard | PetCard, busyReason?: string }> = ({ card, busyReason }) => {
    const isPet = 'skill' in card;
    return (
        <div className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${getRarityBorderColor(card.rarity)}`}>
            <p className="font-bold font-serif text-white truncate">{card.name}</p>
            <p className={`text-xs font-semibold ${getRarityTextColor(card.rarity)}`}>{isPet ? '兽宠' : card.realm}</p>
            {busyReason && <p className="text-xs text-cyan-400 mt-1 truncate" title={busyReason}>{busyReason}</p>}
        </div>
    );
};


export const CharacterStatusModal: React.FC<CharacterStatusModalProps> = ({
    isOpen,
    onClose,
    cardCollection,
    petCollection,
    busyCharacterDetails,
}) => {
    const [statusTab, setStatusTab] = useState<StatusTab>('空闲中');
    const [typeTab, setTypeTab] = useState<TypeTab>('人物');
    const [genderTab, setGenderTab] = useState<GenderTab>('全部');

    if (!isOpen) return null;

    const renderContent = () => {
        const isBusy = statusTab === '忙碌中';

        let characters: CharacterCard[] = [];
        let pets: PetCard[] = [];

        if (typeTab === '人物') {
            characters = cardCollection.filter(c => {
                const isCharacterBusy = busyCharacterDetails.has(c.id);
                const genderMatch = genderTab === '全部' || c.gender === (genderTab === '男' ? 'Male' : 'Female');
                return isBusy === isCharacterBusy && genderMatch;
            });
        } else { // 兽宠
            pets = petCollection.filter(p => {
                const isPetBusy = busyCharacterDetails.has(p.id);
                // Assuming pets might have gender filtering in the future
                const genderMatch = genderTab === '全部' || p.gender === (genderTab === '男' ? 'Male' : 'Female');
                return isBusy === isPetBusy && genderMatch;
            });
        }

        const list = typeTab === '人物' ? characters : pets;

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {list.length > 0 ? list.map(item => (
                    <CharacterCardDisplay
                        key={item.id}
                        card={item}
                        busyReason={busyCharacterDetails.get(item.id)}
                    />
                )) : <p className="col-span-full text-center text-gray-500 pt-8">此分类下暂无卡牌。</p>}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="ornate-border bg-stone-900 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
                    <h2 className="text-2xl font-bold text-amber-300 font-serif">人物状态总览</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex-shrink-0 p-4 border-b border-stone-700 bg-black/10 space-y-2">
                    {/* Status Tabs */}
                    <div className="flex space-x-2">
                        <button onClick={() => setStatusTab('空闲中')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${statusTab === '空闲中' ? 'bg-green-500/20 text-green-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>空闲中</button>
                        <button onClick={() => setStatusTab('忙碌中')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${statusTab === '忙碌中' ? 'bg-red-500/20 text-red-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>忙碌中</button>
                    </div>
                    {/* Type and Gender Tabs */}
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                            <button onClick={() => setTypeTab('人物')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${typeTab === '人物' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>人物</button>
                            <button onClick={() => setTypeTab('兽宠')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${typeTab === '兽宠' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>兽宠</button>
                        </div>
                        {typeTab === '人物' && (
                            <div className="flex space-x-2">
                                <button onClick={() => setGenderTab('全部')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${genderTab === '全部' ? 'bg-sky-500/20 text-sky-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>全部</button>
                                <button onClick={() => setGenderTab('男')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${genderTab === '男' ? 'bg-blue-500/20 text-blue-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>男</button>
                                <button onClick={() => setGenderTab('女')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 ${genderTab === '女' ? 'bg-pink-500/20 text-pink-300' : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'}`}>女</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-grow p-6 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};