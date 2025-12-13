import React, { useState } from 'react';
import { CharacterCard, PetCard } from '../types';
import { getRarityBorderColor, getRarityTextColor } from './rarityHelpers';

interface CharacterSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (card: CharacterCard | PetCard) => void;
    characterList: (CharacterCard | PetCard)[];
    title: string;
}

type TypeTab = '人物' | '兽宠';
type GenderTab = '全部' | '男' | '女';

export const CharacterSelectionModal: React.FC<CharacterSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    characterList,
    title,
}) => {
    const [typeTab, setTypeTab] = useState<TypeTab>('人物');
    const [genderTab, setGenderTab] = useState<GenderTab>('全部');

    if (!isOpen) return null;

    const handleSelect = (card: CharacterCard | PetCard) => {
        onSelect(card);
        onClose();
    };

    const renderContent = () => {
        let filteredList: (CharacterCard | PetCard)[] = [];

        if (typeTab === '人物') {
            const characters = characterList.filter(c => 'skills' in c) as CharacterCard[];
            filteredList = characters.filter(c => genderTab === '全部' || c.gender === (genderTab === '男' ? 'Male' : 'Female'));
        } else { // 兽宠
            const pets = characterList.filter(p => 'skill' in p) as PetCard[];
            // Assuming pets might have gender filtering in the future
            filteredList = pets.filter(p => genderTab === '全部' || p.gender === (genderTab === '男' ? 'Male' : 'Female'));
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredList.length > 0 ? filteredList.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${getRarityBorderColor(item.rarity)} hover:ring-4 hover:ring-green-500`}
                    >
                        <p className="font-bold font-serif text-white truncate">{item.name}</p>
                        <p className={`text-xs font-semibold ${getRarityTextColor(item.rarity)}`}>{'skills' in item ? item.realm : '兽宠'}</p>
                    </button>
                )) : <p className="col-span-full text-center text-gray-500 pt-8">此分类下暂无可用卡牌。</p>}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="ornate-border bg-stone-900 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
                    <h2 className="text-2xl font-bold text-amber-300 font-serif">{title}</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex-shrink-0 p-4 border-b border-stone-700 bg-black/10 flex justify-between items-center">
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

                <div className="flex-grow p-6 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};