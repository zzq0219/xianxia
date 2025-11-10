import React from 'react';

interface ChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    challenge: {
        challengerName: string;
        reason: string;
    };
    onAccept: () => void;
    onDecline: () => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ isOpen, onClose, challenge, onAccept, onDecline }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="ornate-border bg-stone-800/90 backdrop-blur-lg w-full max-w-md shadow-2xl flex flex-col items-center p-6 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 text-center">
                    <h2 className="text-2xl font-bold text-amber-300 font-serif">挑战</h2>
                </div>
                <div className="p-6 font-serif flex flex-col justify-center items-center">
                    <p className="text-4xl mb-4">⚔️</p>
                    <p className="text-white text-lg">
                        <span className="font-bold text-red-400">{challenge.challengerName}</span> 向你发起了挑战！
                    </p>
                    <p className="text-amber-300 mt-2 italic">"{challenge.reason}"</p>

                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={onDecline}
                            className="px-6 py-2 bg-stone-600 hover:bg-stone-500 rounded-md font-semibold text-white"
                        >
                            拒绝挑战
                        </button>
                        <button
                            onClick={onAccept}
                            className="px-6 py-2 bg-red-700 text-white hover:bg-red-600 rounded-md font-bold"
                        >
                            接受挑战
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeModal;