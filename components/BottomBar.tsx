

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
    onGauntletClick: () => void;
}

interface NavButton {
    label: string;
    icon: string;
    onClick: () => void;
    color?: string;
    badge?: number;
}

// 仙侠风格图标映射
const xianxiaIcons: Record<string, string> = {
    '探索': '🗺️',
    '队伍': '⚔️',
    '背包': '📦',
    '活动': '🏆',
    '更多': '☰',
    '商城': '🏪',
    '任务': '📜',
    '记忆': '📖',
    '传音': '🔮',
    '育灵轩': '🧬',
    '产业': '🏛️',
    '医馆': '💊',
    '红尘录': '📕',
    '镇狱大牢': '⛓️',
    '礼仪设计馆': '🎀',
    '大闯关': '🏰',
    '江湖传闻': '📢',
    '人物状态': '👥',
    '系统': '⚙️',
};

const NavIconButton: React.FC<NavButton & { isCompact: boolean; useXianxiaIcon?: boolean }> = ({
    label, icon, onClick, color, badge, isCompact, useXianxiaIcon = true
}) => (
    <button
        onClick={onClick}
        className={`qi-flow-btn relative flex flex-col items-center justify-center ${isCompact ? 'w-12 h-12' : 'w-14 h-14'
            } text-ink-300 rounded-lg transition-all duration-300 active:scale-95 ${color || ''}`}
        title={label}
    >
        {/* 仙气流动背景装饰 */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* 图标显示 - 优先使用修仙风格emoji图标 */}
        {useXianxiaIcon && xianxiaIcons[label] ? (
            <span className={`${isCompact ? 'text-lg' : 'text-xl'} filter drop-shadow-[0_0_4px_rgba(180,149,106,0.4)]`}>
                {xianxiaIcons[label]}
            </span>
        ) : (
            <i className={`${icon} ${isCompact ? 'text-lg' : 'text-xl'}`}></i>
        )}

        {!isCompact && (
            <span className="text-[10px] mt-1 font-semibold tracking-wide font-elegant">{label}</span>
        )}

        {/* 徽章 - 朱砂印章风格 */}
        {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-cinnabar-400 to-cinnabar-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-[0_0_8px_rgba(166,61,61,0.5)] animate-pulse-soft border border-cinnabar-400/50">
                {badge > 9 ? '9+' : badge}
            </span>
        )}
    </button>
);

export const BottomBar: React.FC<BottomBarProps> = (props) => {
    const { gameState, isLoading, error, onExplorationAction, onNavClick, onMapClick, onInteractClick, onTelepathyClick, onSystemClick, onQuestClick, onBusinessClick, onNextDay, onHospitalClick, onBountyBoardClick, onAnnouncementsClick, onCultivationClick, onMemoryClick, onCharacterStatusClick, onPrisonClick, onEtiquetteHallClick, onGauntletClick } = props;
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

    // 一级功能：核心操作（始终显示）- 使用修仙风格
    const primaryActions: NavButton[] = [
        { label: '探索', icon: 'fa-solid fa-map-location-dot', onClick: onMapClick },
        { label: '队伍', icon: 'fa-solid fa-users', onClick: () => onNavClick('队伍') },
        { label: '背包', icon: 'fa-solid fa-briefcase', onClick: () => onNavClick('背包') },
        { label: '活动', icon: 'fa-solid fa-trophy', onClick: () => onNavClick('竞技场'), badge: gameState.playerProfile.quests.filter(q => q.status === 'In Progress').length },
        { label: '更多', icon: 'fa-solid fa-ellipsis-vertical', onClick: () => setShowMoreMenu(!showMoreMenu) },
    ];

    // 二级功能：收纳菜单 - 修仙风格分类
    const secondaryActions: NavButton[] = [
        // 修炼相关
        { label: '育灵轩', icon: 'fa-solid fa-dna', onClick: onCultivationClick, color: 'text-purple-400' },
        { label: '传音', icon: 'fa-solid fa-om', onClick: onTelepathyClick, color: 'text-cyan-400' },
        // 江湖事务
        { label: '商城', icon: 'fa-solid fa-store', onClick: () => onNavClick('商城') },
        { label: '任务', icon: 'fa-solid fa-scroll', onClick: onQuestClick },
        { label: '产业', icon: 'fa-solid fa-building', onClick: onBusinessClick },
        { label: '医馆', icon: 'fa-solid fa-hospital', onClick: onHospitalClick },
        // 记录与声望
        { label: '记忆', icon: 'fa-solid fa-book-open', onClick: onMemoryClick, color: 'text-pink-400' },
        { label: '红尘录', icon: 'fa-solid fa-book-skull', onClick: onBountyBoardClick },
        { label: '江湖传闻', icon: 'fa-solid fa-bullhorn', onClick: onAnnouncementsClick },
        // 特殊场所
        { label: '镇狱大牢', icon: 'fa-solid fa-dungeon', onClick: onPrisonClick, color: 'text-red-400' },
        { label: '礼仪设计馆', icon: 'fa-solid fa-ribbon', onClick: onEtiquetteHallClick, color: 'text-pink-400' },
        { label: '大闯关', icon: 'fa-solid fa-trophy', onClick: onGauntletClick, color: 'text-amber-400' },
        // 状态与系统
        { label: '人物状态', icon: 'fa-solid fa-users-viewfinder', onClick: onCharacterStatusClick, color: 'text-teal-400' },
        { label: '系统', icon: 'fa-solid fa-bars', onClick: onSystemClick },
    ];

    return (
        <>
            {/* 更多菜单浮层 - 修仙宫殿风格 */}
            {showMoreMenu && (
                <div
                    className="fixed inset-0 bg-ink-950/85 z-40 backdrop-blur-md animate-fade-in flex items-end justify-center pb-24"
                    onClick={() => setShowMoreMenu(false)}
                >
                    <div
                        className="w-[92vw] max-w-md ink-card rounded-xl p-5 backdrop-blur-md animate-fade-in mb-4 relative xianxia-frame immortal-mist"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}
                    >
                        {/* 四角祥云装饰 */}
                        <div className="absolute top-2 left-2 text-gold-500/40 text-xs">☁</div>
                        <div className="absolute top-2 right-2 text-gold-500/40 text-xs" style={{ transform: 'scaleX(-1)' }}>☁</div>
                        <div className="absolute bottom-2 left-2 text-gold-500/40 text-xs" style={{ transform: 'scaleY(-1)' }}>☁</div>
                        <div className="absolute bottom-2 right-2 text-gold-500/40 text-xs" style={{ transform: 'scale(-1)' }}>☁</div>

                        {/* 角落装饰线 */}
                        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-gold-500/25" />
                        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-gold-500/25" />
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-gold-500/25" />
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-gold-500/25" />

                        {/* 标题 - 卷轴风格 */}
                        <div className="text-center mb-5 relative">
                            <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
                            <h3 className="relative inline-block px-6 py-1 text-gold-400 font-bold text-lg tracking-[0.2em] ink-title font-brush bg-ink-900/90">
                                <span className="text-gold-500/50 mr-2">〓</span>
                                仙门秘境
                                <span className="text-gold-500/50 ml-2">〓</span>
                            </h3>
                        </div>

                        {/* 功能分类区域 */}
                        <div className="space-y-4">
                            {/* 修炼区 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-xs text-gold-500/70">
                                    <span>⚗</span>
                                    <span className="tracking-wider">修炼之道</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-gold-500/30 to-transparent" />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {secondaryActions.slice(0, 2).map(action => (
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
                            </div>

                            {/* 江湖区 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-xs text-gold-500/70">
                                    <span>⚔</span>
                                    <span className="tracking-wider">江湖事务</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-gold-500/30 to-transparent" />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {secondaryActions.slice(2, 6).map(action => (
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
                            </div>

                            {/* 记录区 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-xs text-gold-500/70">
                                    <span>📜</span>
                                    <span className="tracking-wider">秘典记录</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-gold-500/30 to-transparent" />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {secondaryActions.slice(6, 9).map(action => (
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
                            </div>

                            {/* 特殊区 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-xs text-gold-500/70">
                                    <span>🏛</span>
                                    <span className="tracking-wider">神秘殿堂</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-gold-500/30 to-transparent" />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {secondaryActions.slice(9).map(action => (
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
                            </div>
                        </div>

                        {/* 关闭按钮 */}
                        <button
                            onClick={() => setShowMoreMenu(false)}
                            className="w-full py-2.5 text-ink-400 hover:text-gold-400 text-sm transition-all duration-300 bg-ink-800/50 hover:bg-ink-700/60 rounded-lg mt-4 border border-gold-600/20 hover:border-gold-500/30 tracking-wider"
                        >
                            <span className="text-gold-500/50 mr-1">◇</span>
                            收起
                            <span className="text-gold-500/50 ml-1">◇</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 底部操作栏 - 仙侠宫殿风格 */}
            <footer className={`fixed bottom-0 left-0 right-0 w-full bg-gradient-to-t from-ink-950/98 via-ink-900/95 to-transparent backdrop-blur-md z-20 border-t border-gold-600/20 ${layout.isCompact ? 'p-2' : 'p-3'
                }`}>
                {/* 顶部装饰线 */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

                <div className="w-full max-w-screen-lg mx-auto flex flex-col gap-2 relative">
                    {/* 主要操作区 */}
                    <div className={layout.isCompact ? 'order-2' : 'order-1'}>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-16">
                                <div className="flex items-center gap-3 bg-ink-900/80 border border-gold-600/25 px-6 py-3 rounded-full immortal-mist">
                                    {/* 八卦旋转图标 */}
                                    <span className="text-gold-500 text-lg animate-spin" style={{ animationDuration: '3s' }}>☯</span>
                                    <span className="text-gold-400 font-elegant text-sm tracking-[0.15em]">天机运转中...</span>
                                    <span className="text-gold-500/60 text-sm animate-pulse">✧</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="text-cinnabar-400 text-center mb-2 font-serif text-xs bg-cinnabar-600/10 py-1.5 px-3 rounded-lg border border-cinnabar-500/30 animate-shake">
                                        <span className="mr-1">⚠</span> {error}
                                    </div>
                                )}

                                {/* 选项按钮 - 玉简风格 */}
                                <div className={`flex flex-wrap justify-center gap-2 ${layout.isCompact ? 'mb-1' : 'mb-2'}`}>
                                    {gameState.exploration.choices.slice(0, layout.isMobile ? 2 : 3).map((choice, index) => (
                                        <button
                                            key={index}
                                            onClick={() => onExplorationAction(choice)}
                                            className={`flex-1 min-w-[120px] max-w-[200px] text-center jade-slip ${layout.isCompact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                                                } rounded hover:bg-ink-700/60 hover:border-gold-500/40 transition-all duration-300 active:scale-95 font-elegant backdrop-blur-sm`}
                                        >
                                            <span className="text-gold-500/50 mr-1">◇</span>
                                            {choice}
                                        </button>
                                    ))}
                                </div>

                                {/* 输入框 - 古典卷轴风格 */}
                                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={customInput}
                                            onChange={(e) => setCustomInput(e.target.value)}
                                            placeholder="施展神通..."
                                            className={`w-full bg-ink-900/90 border border-gold-600/30 rounded-lg ${layout.isCompact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
                                                } focus:outline-none focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 font-elegant backdrop-blur-sm text-ink-100 placeholder-ink-500`}
                                        />
                                        {/* 输入框装饰 */}
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-gold-500/30 text-xs pointer-events-none">✦</div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!customInput.trim()}
                                        className={`qi-flow-btn ${layout.isCompact ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'
                                            } rounded-lg active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-elegant tracking-wider`}
                                    >
                                        运功
                                    </button>
                                    {!layout.isCompact && (
                                        <button
                                            type="button"
                                            onClick={onNextDay}
                                            className="qi-flow-btn font-bold px-4 py-1.5 text-sm rounded-lg active:scale-95 transition-all duration-300 tracking-wider"
                                        >
                                            <span className="mr-1">☀</span>
                                            翌日
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