import React from 'react';

interface BattleResultModalProps {
    victory: boolean | null;
    onClose: () => void;
}

const BattleResultModal: React.FC<BattleResultModalProps> = ({ victory, onClose }) => {
    if (victory === null) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-stone-800/90 ornate-border backdrop-blur-lg w-full max-w-md shadow-2xl flex flex-col items-center justify-center p-8 text-center">
                <h2 className={`text-5xl font-bold mb-6 font-serif ${victory ? 'text-amber-400' : 'text-stone-400'}`}>
                    {victory ? "胜利" : "败北"}
                </h2>
                <button 
                    onClick={onClose} 
                    className="bg-amber-600 text-white font-bold px-8 py-3 rounded-md hover:bg-amber-500 transition-colors text-lg"
                >
                    继续
                </button>
            </div>
        </div>
    );
};

export default BattleResultModal;