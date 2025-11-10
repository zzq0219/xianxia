import React from 'react';
import { Reputation } from '../types';

interface ReputationModalProps {
    isOpen: boolean;
    onClose: () => void;
    reputation: Reputation;
    isLoading: boolean;
}

const ReputationModal: React.FC<ReputationModalProps> = ({ isOpen, onClose, reputation, isLoading }) => {
    if (!isOpen) return null;

    const getReputationColor = (level: Reputation['level']) => {
        switch (level) {
            case '名垂青史': return 'text-yellow-300 animate-glow';
            case '威震一方': return 'text-red-400';
            case '声名远扬': return 'text-sky-400';
            case '小有名气': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="ornate-border bg-stone-900 w-full max-w-2xl h-auto max-h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
                    <h2 className="text-2xl font-bold text-amber-300 font-serif">声望</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="text-center text-amber-300 animate-glow p-8">正在获取天机阁的最新情报...</div>
                    ) : (
                        <>
                            <div className="text-center">
                                <h3 className={`text-4xl font-bold font-serif ${getReputationColor(reputation.level)}`}>{reputation.level}</h3>
                                <p className="text-lg text-gray-400 font-mono">{reputation.score} 声望</p>
                            </div>

                            <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
                                <h4 className="font-semibold text-amber-400 mb-3 text-lg">江湖称号</h4>
                                {reputation.title ? (
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-rose-800/50 text-rose-300 rounded-full border border-rose-700">{reputation.title}</span>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">尚未获得任何称号。</p>
                                )}
                            </div>

                            <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
                                <h4 className="font-semibold text-green-400 mb-3 text-lg">侠义之举</h4>
                                {reputation.goodDeeds && reputation.goodDeeds.length > 0 ? (
                                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                                        {reputation.goodDeeds.map((deed, index) => (
                                            <li key={index}>{deed}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">尚未有侠义之举流传。</p>
                                )}
                            </div>

                            <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
                                <h4 className="font-semibold text-red-400 mb-3 text-lg">恶行昭彰</h4>
                                {reputation.badDeeds && reputation.badDeeds.length > 0 ? (
                                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                                        {reputation.badDeeds.map((deed, index) => (
                                            <li key={index}>{deed}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">你似乎还未犯下什么大错。</p>
                                )}
                            </div>

                            <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
                                <h4 className="font-semibold text-pink-400 mb-3 text-lg">风流韵事</h4>
                                {reputation.lewdDeeds && reputation.lewdDeeds.length > 0 ? (
                                    <ul className="space-y-2 list-disc list-inside text-gray-300">
                                        {reputation.lewdDeeds.map((deed, index) => (
                                            <li key={index}>{deed}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">江湖上还没有关于你的风流传说。</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReputationModal;