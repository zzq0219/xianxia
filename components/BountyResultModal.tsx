import React from 'react';
import { BountyTarget } from '../types';

interface BountyResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    bounty: BountyTarget;
    onOutcome: (outcome: 'killed' | 'imprisoned') => void;
}

const BountyResultModal: React.FC<BountyResultModalProps> = ({ isOpen, onClose, bounty, onOutcome }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div
                className="ornate-border bg-stone-900 w-full max-w-2xl h-auto max-h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
                    <h2 className="text-2xl font-bold text-amber-300 font-serif">任务报告：{bounty.name}</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-amber-400">追捕日志</h3>
                    <div className="bg-black/20 p-4 rounded-lg border border-stone-700/50">
                        <p className="text-gray-300 italic leading-relaxed">
                            {bounty.trackingLog || "日志在传输过程中遗失了..."}
                        </p>
                    </div>
                    <h3 className="text-lg font-semibold text-amber-400 mt-6">如何处置?</h3>
                    <p className="text-gray-400">目标已被成功制服，现在，你来决定Ta的命运。</p>
                </div>
                <div className="p-4 bg-black/20 border-t border-stone-700 flex justify-end gap-4">
                    <button
                        onClick={() => onOutcome('killed')}
                        className="px-6 py-2 rounded-md font-semibold text-white bg-red-800 hover:bg-red-700 transition-colors"
                    >
                        杀害
                    </button>
                    <button
                        onClick={() => onOutcome('imprisoned')}
                        className="px-6 py-2 rounded-md font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors"
                    >
                        压入大牢
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BountyResultModal;