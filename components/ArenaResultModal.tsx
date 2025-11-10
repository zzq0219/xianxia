import React from 'react';
import { ArenaRank } from '../types';

interface ArenaResultModalProps {
    victory: boolean;
    oldRank: ArenaRank;
    newRank: ArenaRank;
    pointsChange: number;
    onClose: () => void;
}

const ArenaResultModal: React.FC<ArenaResultModalProps> = ({ victory, oldRank, newRank, pointsChange, onClose }) => {
    const title = victory ? '胜利' : '惜败';
    const titleColor = victory ? 'text-green-400' : 'text-red-400';
    const pointsColor = pointsChange >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="ornate-border bg-stone-900 w-full max-w-md rounded-xl shadow-2xl backdrop-blur-lg flex flex-col items-center text-center p-8">
                <h2 className={`text-4xl font-bold font-serif mb-4 ${titleColor}`}>{title}</h2>
                
                <div className="my-6 w-full">
                    <div className="flex justify-between items-center text-lg mb-2">
                        <span className="text-gray-400">先前段位:</span>
                        <span className="text-white font-semibold">{oldRank.tier} {oldRank.division}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg mb-4">
                        <span className="text-gray-400">先前积分:</span>
                        <span className="text-white font-mono">{oldRank.points}</span>
                    </div>

                    <div className="border-t border-dashed border-stone-600 my-4"></div>

                    <div className="flex justify-between items-center text-2xl mb-2">
                        <span className="text-gray-300">当前段位:</span>
                        <span className="text-amber-400 font-bold">{newRank.tier} {newRank.division}</span>
                    </div>
                    <div className="flex justify-between items-center text-2xl">
                        <span className="text-gray-300">当前积分:</span>
                        <div className="flex items-baseline">
                            <span className="text-amber-400 font-mono font-bold">{newRank.points}</span>
                            <span className={`ml-2 font-mono ${pointsColor}`}>
                                ({pointsChange >= 0 ? `+${pointsChange}` : pointsChange})
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 bg-amber-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-500 transition-colors shadow-lg w-40 h-14 flex items-center justify-center"
                >
                    返回
                </button>
            </div>
        </div>
    );
};

export default ArenaResultModal;