

import React, { useState } from 'react';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { GameState, ModalType } from '../types';

interface BottomBarProps {
    gameState: GameState;
    isLoading: boolean;
    error: string | null;
    onExplorationAction: (action: string) => void;
    onNavClick: (modal: ModalType) => void;
    onMapClick: () => void;
    onInteractClick: () => void;
    onTelepathyClick: () => void;
    onSystemClick: () => void;
    onQuestClick: () => void;
    onBusinessClick: () => void;
    onNextDay: () => void;
    onHospitalClick: () => void;
    onBountyBoardClick: () => void;
    onAnnouncementsClick: () => void;
    onCultivationClick: () => void;
    onMemoryClick: () => void;
    onCharacterStatusClick: () => void;
    onPrisonClick: () => void;
    onEtiquetteHallClick: () => void;
}

interface NavButton {
    label: string;
    icon: string;
    onClick: () => void;
    color?: string;
    badge?: number;
}

const NavIconButton: React.FC<NavButton & { isCompact: boolean }> = ({ label, icon, onClick, color, badge, isCompact }) => (
    <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center ${isCompact ? 'w-12 h-12' : 'w-14 h-14'
            } text-stone-300 rounded-lg bg-gradient-to-br from-stone-900/70 to-stone-950/90 hover:from-stone-800/90 hover:to-stone-900/90 hover:text-amber-300 transition-all duration-300 active:scale-95 border border-xianxia-gold-600/30 hover:border-xianxia-gold-500/50 backdrop-blur-sm hover:shadow-glow-gold ${color || ''}`}
        title={label}
    >
        <i className={`${icon} ${isCompact ? 'text-lg' : 'text-xl'}`}></i>
        {!isCompact && <span className="text-[10px] mt-1 font-semibold">{label}</span>}
        {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-glow-red animate-pulse-slow">
                {badge > 9 ? '9+' : badge}
            </span>
        )}
    </button>
);

export const BottomBar: React.FC<BottomBarProps> = (props) => {
    const { gameState, isLoading, error, onExplorationAction, onNavClick, onMapClick, onInteractClick, onTelepathyClick, onSystemClick, onQuestClick, onBusinessClick, onNextDay, onHospitalClick, onBountyBoardClick, onAnnouncementsClick, onCultivationClick, onMemoryClick, onCharacterStatusClick, onPrisonClick, onEtiquetteHallClick } = props;
    const [customInput, setCustomInput] = useState('');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const layout = useResponsiveLayout();

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customInput.trim() && !isLoading) {
            onExplorationAction(customInput.trim());
            setCustomInput('');
        }
    };

    // 一级功能：核心操作（始终显示）
    const primaryActions: NavButton[] = [
        { label: '探索', icon: 'fa-solid fa-map-location-dot', onClick: onMapClick },
        { label: '队伍', icon: 'fa-solid fa-users', onClick: () => onNavClick('队伍') },
        { label: '背包', icon: 'fa-solid fa-briefcase', onClick: () => onNavClick('背包') },
        { label: '活动', icon: 'fa-solid fa-trophy', onClick: () => onNavClick('竞技场'), badge: gameState.playerProfile.quests.filter(q => q.status === 'In Progress').length },
        { label: '更多', icon: 'fa-solid fa-ellipsis-vertical', onClick: () => setShowMoreMenu(!showMoreMenu) },
    ];

    // 二级功能：收纳菜单
    const secondaryActions: NavButton[] = [
        { label: '商城', icon: 'fa-solid fa-store', onClick: () => onNavClick('商城') },
        { label: '任务', icon: 'fa-solid fa-scroll', onClick: onQuestClick },
        { label: '记忆', icon: 'fa-solid fa-book-open', onClick: onMemoryClick, color: 'text-pink-400' },
        { label: '传音', icon: 'fa-solid fa-om', onClick: onTelepathyClick, color: 'text-cyan-400' },
        { label: '育灵轩', icon: 'fa-solid fa-dna', onClick: onCultivationClick, color: 'text-purple-400' },
        { label: '产业', icon: 'fa-solid fa-building', onClick: onBusinessClick },
        { label: '医馆', icon: 'fa-solid fa-hospital', onClick: onHospitalClick },
        { label: '红尘录', icon: 'fa-solid fa-book-skull', onClick: onBountyBoardClick },
        { label: '镇狱大牢', icon: 'fa-solid fa-dungeon', onClick: onPrisonClick, color: 'text-red-400' },
        { label: '礼仪设计馆', icon: 'fa-solid fa-ribbon', onClick: onEtiquetteHallClick, color: 'text-pink-400' },
        { label: '江湖传闻', icon: 'fa-solid fa-bullhorn', onClick: onAnnouncementsClick },
        { label: '人物状态', icon: 'fa-solid fa-users-viewfinder', onClick: onCharacterStatusClick, color: 'text-teal-400' },
        { label: '系统', icon: 'fa-solid fa-bars', onClick: onSystemClick },
    ];

    return (
        <>
            {/* 更多菜单浮层 */}
            {showMoreMenu && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-fade-in flex items-end justify-center pb-24"
                    onClick={() => setShowMoreMenu(false)}
                >
                    <div
                        className="w-[90vw] max-w-md ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-900/98 via-stone-950/98 to-black/98 rounded-2xl p-5 shadow-glow-gold backdrop-blur-md animate-slide-in mb-4"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}
                    >
                        <h3 className="text-gradient-gold text-center font-bold mb-3 text-lg">更多功能</h3>
                        <div className="grid grid-cols-4 gap-3 mb-3">
                            {secondaryActions.map(action => (
                                <NavIconButton
                                    key={action.label}
                                    {...action}
                                    isCompact={false}
                                    onClick={() => {
                                        action.onClick();
                                        setShowMoreMenu(false);
                                    }}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => setShowMoreMenu(false)}
                            className="w-full py-2.5 text-stone-400 hover:text-amber-300 text-sm transition-all duration-300 hover:scale-105 bg-stone-800/50 hover:bg-stone-700/60 rounded-lg mt-1"
                        >
                            收起 ▼
                        </button>
                    </div>
                </div>
            )}

            {/* 底部操作栏 */}
            <footer className={`fixed bottom-0 left-0 right-0 w-full bg-gradient-to-t from-black/98 via-stone-950/90 to-transparent backdrop-blur-md z-20 border-t border-xianxia-gold-700/20 ${layout.isCompact ? 'p-2' : 'p-3'
                }`}>
                <div className="w-full max-w-screen-lg mx-auto flex flex-col gap-2">
                    {/* 主要操作区 */}
                    <div className={layout.isCompact ? 'order-2' : 'order-1'}>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-16">
                                <div className="flex items-center gap-3 glass-morphism px-6 py-3 rounded-full">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-glow-gold"></div>
                                    <span className="text-gradient-gold font-serif text-sm text-shadow-glow">天地变幻中...</span>
                                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-glow-gold" style={{ animationDelay: '0.3s' }}></div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="text-red-300 text-center mb-2 font-serif text-xs bg-gradient-to-r from-red-900/30 to-red-800/30 py-1.5 px-3 rounded-lg border border-red-500/50 shadow-glow-red animate-shake">
                                        ⚠️ {error}
                                    </div>
                                )}

                                {/* 选项按钮 */}
                                <div className={`flex flex-wrap justify-center gap-2 ${layout.isCompact ? 'mb-1' : 'mb-2'}`}>
                                    {gameState.exploration.choices.slice(0, layout.isMobile ? 2 : 3).map((choice, index) => (
                                        <button
                                            key={index}
                                            onClick={() => onExplorationAction(choice)}
                                            className={`flex-1 min-w-[120px] max-w-[200px] text-center bg-gradient-to-br from-stone-800/80 to-stone-900/90 ${layout.isCompact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                                                } rounded-lg hover:from-stone-700/90 hover:to-stone-800/90 hover:border-xianxia-gold-500/60 border border-xianxia-gold-600/30 transition-all duration-300 active:scale-95 font-serif shadow-lg backdrop-blur-sm hover:shadow-glow-gold hover:text-amber-200`}
                                        >
                                            {choice}
                                        </button>
                                    ))}
                                </div>

                                {/* 输入框 */}
                                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        placeholder="输入行动..."
                                        className={`flex-1 bg-gradient-to-br from-stone-900/90 to-black/90 border border-xianxia-gold-700/40 rounded-lg ${layout.isCompact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
                                            } focus:outline-none focus:ring-2 focus:ring-xianxia-gold-500/60 focus:border-xianxia-gold-500 font-serif shadow-inner backdrop-blur-sm text-gray-200 placeholder-gray-500`}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!customInput.trim()}
                                        className={`bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white font-bold ${layout.isCompact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
                                            } rounded-lg hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-serif shadow-glow-gold text-shadow-glow`}
                                    >
                                        确定
                                    </button>
                                    {!layout.isCompact && (
                                        <button
                                            type="button"
                                            onClick={onNextDay}
                                            className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold px-4 py-1.5 text-sm rounded-lg hover:from-indigo-500 hover:to-indigo-600 active:scale-95 transition-all duration-300 shadow-glow-blue"
                                        >
                                            下一天 ⏭
                                        </button>
                                    )}
                                </form>
                            </>
                        )}
                    </div>

                    {/* 导航按钮组 */}
                    <div className={layout.isCompact ? 'order-1' : 'order-2'}>
                        <div className="flex justify-center items-center gap-2">
                            {primaryActions.map(action => (
                                <NavIconButton key={action.label} {...action} isCompact={layout.isCompact} />
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};