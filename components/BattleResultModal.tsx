import React from 'react';

interface BattleResultModalProps {
    victory: boolean | null;
    isFled?: boolean;
    onClose: () => void;
}

const BattleResultModal: React.FC<BattleResultModalProps> = ({ victory, isFled = false, onClose }) => {
    if (victory === null) return null;

    // 根据结果配置不同的显示
    const getResultConfig = () => {
        if (isFled) {
            return {
                text: "遁走",
                subText: "三十六计，走为上计",
                icon: "🌀",
                bgGradient: "from-orange-900/30 via-amber-800/20 to-orange-900/30",
                textColor: "text-orange-400",
                borderColor: "border-orange-500/50",
                glowColor: "shadow-orange-500/20",
            };
        }
        if (victory) {
            return {
                text: "大胜",
                subText: "天道酬勤，道心永固",
                icon: "⚔️",
                bgGradient: "from-gold-900/40 via-amber-700/30 to-gold-900/40",
                textColor: "text-gold-400",
                borderColor: "border-gold-500/60",
                glowColor: "shadow-gold-500/30",
            };
        }
        return {
            text: "败北",
            subText: "胜败乃兵家常事",
            icon: "💀",
            bgGradient: "from-slate-900/50 via-slate-800/40 to-slate-900/50",
            textColor: "text-paper-400",
            borderColor: "border-slate-500/50",
            glowColor: "shadow-slate-500/20",
        };
    };

    const config = getResultConfig();

    return (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* 背景装饰 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {victory && !isFled && (
                    <>
                        <div className="absolute top-1/4 left-1/4 text-6xl text-gold-500/10 animate-pulse">✧</div>
                        <div className="absolute bottom-1/4 right-1/4 text-6xl text-gold-500/10 animate-pulse" style={{ animationDelay: '0.5s' }}>✧</div>
                        <div className="absolute top-1/3 right-1/3 text-4xl text-gold-400/10 animate-pulse" style={{ animationDelay: '1s' }}>☯</div>
                    </>
                )}
            </div>

            <div className={`relative bg-gradient-to-br ${config.bgGradient} bg-ink-900/95 border-2 ${config.borderColor} backdrop-blur-lg w-full max-w-md shadow-2xl ${config.glowColor} flex flex-col items-center justify-center p-8 text-center rounded-xl overflow-hidden`}>
                {/* 顶部装饰 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"></div>

                {/* 角落装饰 */}
                <div className="absolute top-2 left-2 text-gold-500/30">◈</div>
                <div className="absolute top-2 right-2 text-gold-500/30">◈</div>
                <div className="absolute bottom-2 left-2 text-gold-500/30">◈</div>
                <div className="absolute bottom-2 right-2 text-gold-500/30">◈</div>

                {/* 图标 */}
                <div className={`text-7xl mb-4 ${victory && !isFled ? 'animate-bounce' : ''}`}>
                    {config.icon}
                </div>

                {/* 主标题 */}
                <h2 className={`text-5xl font-bold mb-2 font-serif ${config.textColor} text-shadow-glow`}>
                    〖 {config.text} 〗
                </h2>

                {/* 副标题 */}
                <p className="text-paper-400 mb-6 text-lg italic">
                    {config.subText}
                </p>

                {isFled && (
                    <p className="text-paper-500 mb-6 text-sm bg-ink-800/50 px-4 py-2 rounded-lg border border-orange-500/20">
                        🌀 你成功遁走，但此战被判定为落败
                    </p>
                )}

                <button
                    onClick={onClose}
                    className="qi-flow-btn px-8 py-3 rounded-lg text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                    <span className="relative z-10 text-gold-300 flex items-center gap-2">
                        <span>继续修行</span>
                        <span>→</span>
                    </span>
                </button>

                {/* 底部装饰 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"></div>
            </div>
        </div>
    );
};

export default BattleResultModal;