import React, { useState } from 'react';
import { CharacterCard, Shop, Staff } from '../types';
import { POSITIONS } from '../constants';
import { generateStaffSurveillanceReport } from '../services/tavernService';

interface SurveillanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop;
  cardCollection: CharacterCard[];
}

const SurveillanceModal: React.FC<SurveillanceModalProps> = ({ isOpen, onClose, shop, cardCollection }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterCard | null>(null);
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCharacterSelect = async (character: CharacterCard, positionName: string) => {
    setSelectedCharacter(character);
    setIsLoading(true);
    setReport('');
    try {
      const generatedReport = await generateStaffSurveillanceReport(character, positionName);
      setReport(generatedReport);
    } catch (error) {
      console.error("Failed to generate surveillance report:", error);
      setReport("监视水晶似乎被一股神秘的力量干扰了...");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ornate-border bg-stone-900 w-full max-w-3xl h-[70vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
          <h2 className="text-2xl font-bold text-amber-300 font-serif">监视 {shop.type}</h2>
          <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        <div className="flex-grow p-6 flex gap-6 overflow-hidden">
          {/* Left Panel: Staff List */}
          <div className="w-1/3 flex-shrink-0 space-y-3 overflow-y-auto">
            {Object.entries(POSITIONS)
              .filter(([, posDetails]) => posDetails.shop === shop.type)
              .map(([posId, posDetails]) => {
                const assignedStaff = shop.staff.find(s => s.positionId === posId);
                const character = assignedStaff ? cardCollection.find(c => c.id === assignedStaff.characterId) : null;
                return (
                  <div key={posId}>
                    <h4 className="text-amber-400 font-semibold mb-1">{posDetails.name}</h4>
                    {character ? (
                      <button 
                        onClick={() => handleCharacterSelect(character, posDetails.name)}
                        className={`w-full text-left p-2 rounded-md transition-colors ${selectedCharacter?.id === character.id ? 'bg-amber-600/50' : 'bg-stone-800/70 hover:bg-stone-700/90'}`}
                      >
                        {character.name}
                      </button>
                    ) : (
                      <div className="p-2 text-gray-500 italic text-sm">空缺</div>
                    )}
                  </div>
                );
            })}
          </div>

          {/* Right Panel: Report */}
          <div className="w-2/3 bg-black/30 rounded-lg p-4 overflow-y-auto border border-stone-700">
            {isLoading ? (
              <div className="text-center text-amber-300 animate-pulse">正在通过水晶窥探...</div>
            ) : report ? (
              <p className="text-gray-300 whitespace-pre-wrap font-serif leading-relaxed">{report}</p>
            ) : (
              <div className="text-center text-gray-500 h-full flex items-center justify-center">
                <p>选择一名员工进行监视。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveillanceModal;