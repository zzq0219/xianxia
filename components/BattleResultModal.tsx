import React from 'react';

interface BattleResultModalProps {
    victory: boolean | null;
    isFled?: boolean;
    onClose: () => void;
}

const BattleResultModal: React.FC<BattleResultModalProps> = ({ victory, isFled = false, onClose }) => {
    if (victory === null) return null;

    // 逃命判定为失败
    const resultText = isFled ? "逃命" : (victory ? "胜利" : "败北");
    const resultColor = isFled ? "text-orange-400" : (victory ? "text-amber-400" : "text-stone-400");
    const resultIcon = isFled ? "🏃" : (victory ? "⚔️" : "💀");

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-stone-800/90 ornate-border backdrop-blur-lg w-full max-w-md shadow-2xl flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-4">{resultIcon}</div>
                <h2 className={`text-5xl font-bold mb-4 font-serif ${resultColor}`}>
                    {resultText}
                </h2>
                {isFled && (
                    <p className="text-stone-300 mb-6 text-lg">
                        你成功逃离了战斗，但这次战斗被判定为失败。
                    </p>
                )}
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