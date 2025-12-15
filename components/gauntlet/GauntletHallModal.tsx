import React, { useEffect, useMemo, useState } from 'react';
import { createNewEvent, updateEventStatus } from '../../services/gauntlet';
import { GameState } from '../../types';
import { ResponsiveModal } from '../ResponsiveModal';

interface GauntletHallModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    onOpenAnnouncement: () => void;
    onOpenRegistration: () => void;
    onOpenLive: () => void;
}

// 玩家参赛记录计算
const usePlayerStats = (gameState: GameState) => {
    return useMemo(() => {
        const { gauntletSystem } = gameState;
        const stats = gauntletSystem.playerStats;

        if (stats) {
            return {
                participations: stats.participations,
                wins: stats.wins,
                bestRank: stats.bestRank,
                totalScore: stats.totalScore,
                averageRank: stats.averageRank,
            };
        }

        return {
            participations: 0,
            wins: 0,
            bestRank: 0,
            totalScore: 0,
            averageRank: 0,
        };
    }, [gameState.gauntletSystem.playerStats]);
};

/**
 * 大闯关大厅界面
 * 
 * 设计文档布局：
 * ┌──────────────────────────────────────────────────────┐
 * │  [×]           大闯关赛事大厅                         │
 * ├──────────────────────────────────────────────────────┤
 * │                                                      │
 * │          🏆 第 X 届天下第一闯关大赛 🏆                │
 * │                                                      │
 * │              状态：【倒计时中】                       │
 * │          距离开赛还有：15天 6小时 23分                │
 * │                                                      │
 * │          [──────────报名入口──────────]              │
 * │                                                      │
 * ├──────────────────────────────────────────────────────┤
 * │  [历届冠军]  [赛事规则]  [关卡公告]                  │
 * │                                                      │
 * │  我的参赛记录：                                       │
 * │  • 参赛次数：3次                                     │
 * │  • 最佳排名：第8名                                   │
 * │  • 累计得分：2350分                                  │
 * │                                                      │
 * │                  [返回主界面]                         │
 * └──────────────────────────────────────────────────────┘
 */
export const GauntletHallModal: React.FC<GauntletHallModalProps> = ({
    isOpen,
    onClose,
    gameState,
    setGameState,
    onOpenAnnouncement,
    onOpenRegistration,
    onOpenLive,
}) => {
    const { gauntletSystem } = gameState;
    const currentEvent = gauntletSystem.currentEvent;

    // 倒计时状态
    const [countdown, setCountdown] = useState<string>('');

    // 规则弹窗状态
    const [showRulesModal, setShowRulesModal] = useState(false);

    // 历届冠军弹窗状态
    const [showChampionsModal, setShowChampionsModal] = useState(false);

    // 计算玩家统计信息
    const playerStats = usePlayerStats(gameState);

    // 计算倒计时
    useEffect(() => {
        if (!currentEvent) return;

        const updateCountdown = () => {
            const now = Date.now();
            let targetTime = 0;

            switch (currentEvent.status) {
                case 'countdown':
                    targetTime = currentEvent.scheduledDate;
                    break;
                case 'registration':
                    targetTime = currentEvent.registrationDeadline;
                    break;
                case 'preparing':
                    targetTime = currentEvent.startTime || currentEvent.registrationDeadline + 3600000;
                    break;
                case 'in_progress':
                case 'completed':
                    setCountdown('');
                    return;
                default:
                    setCountdown('');
                    return;
            }

            if (targetTime > 0) {
                const diff = targetTime - now;
                if (diff <= 0) {
                    setCountdown('即将开始...');
                } else {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                    let timeStr = '';
                    if (days > 0) timeStr += `${days}天 `;
                    if (hours > 0) timeStr += `${hours}小时 `;
                    timeStr += `${minutes}分`;

                    setCountdown(timeStr);
                }
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [currentEvent]);

    // 获取状态信息
    const getStatusInfo = () => {
        if (!currentEvent) {
            return { text: '暂无赛事', color: 'text-gray-400' };
        }

        switch (currentEvent.status) {
            case 'countdown':
                return { text: '倒计时中', color: 'text-blue-400' };
            case 'registration':
                return { text: '报名中', color: 'text-green-400' };
            case 'preparing':
                return { text: '筹备中', color: 'text-yellow-400' };
            case 'in_progress':
                return { text: '进行中', color: 'text-red-400' };
            case 'completed':
                return { text: '已结束', color: 'text-purple-400' };
            default:
                return { text: '未知状态', color: 'text-gray-400' };
        }
    };

    const statusInfo = getStatusInfo();

    // 创建新赛事
    const handleCreateNewEvent = () => {
        // 创建新赛事
        let newEvent = createNewEvent(gauntletSystem);

        // 直接设置为报名阶段，方便测试
        newEvent = updateEventStatus(newEvent, 'registration');

        // 更新游戏状态
        setGameState(prev => ({
            ...prev,
            gauntletSystem: {
                ...prev.gauntletSystem,
                currentEvent: newEvent,
                totalEditions: newEvent.edition
            }
        }));

        console.log('[大闯关] 创建新赛事:', newEvent.name);
    };

    // 主要操作按钮配置
    const getMainActionButton = () => {
        if (!currentEvent) {
            return {
                label: '开启新赛事',
                disabled: false,
                onClick: handleCreateNewEvent,
                className: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg hover:shadow-amber-500/30',
            };
        }

        switch (currentEvent.status) {
            case 'countdown':
                return {
                    label: '敬请期待（点击跳转报名）',
                    disabled: false,
                    onClick: () => {
                        // 开发模式：直接跳转到报名阶段
                        const updatedEvent = updateEventStatus(currentEvent, 'registration');
                        setGameState(prev => ({
                            ...prev,
                            gauntletSystem: {
                                ...prev.gauntletSystem,
                                currentEvent: updatedEvent
                            }
                        }));
                    },
                    className: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-blue-500/30',
                };
            case 'registration':
                return {
                    label: '立即报名',
                    disabled: false,
                    onClick: onOpenRegistration,
                    className: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-green-500/30 animate-pulse',
                };
            case 'preparing':
                return {
                    label: '关卡准备中...',
                    disabled: true,
                    onClick: () => { },
                    className: 'bg-gradient-to-r from-yellow-700/50 to-amber-700/50 text-yellow-300 cursor-not-allowed',
                };
            case 'in_progress':
                return {
                    label: '进入直播间',
                    disabled: false,
                    onClick: onOpenLive,
                    className: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg hover:shadow-red-500/30',
                };
            case 'completed':
                return {
                    label: '查看结果',
                    disabled: false,
                    onClick: onOpenLive,
                    className: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg hover:shadow-purple-500/30',
                };
            default:
                return {
                    label: '暂无赛事',
                    disabled: true,
                    onClick: () => { },
                    className: 'bg-gray-700/50 text-gray-500 cursor-not-allowed',
                };
        }
    };

    const mainAction = getMainActionButton();

    // 获取倒计时前缀
    const getCountdownPrefix = () => {
        if (!currentEvent) return '';
        switch (currentEvent.status) {
            case 'countdown':
                return '距离开赛还有：';
            case 'registration':
                return '报名截止还有：';
            case 'preparing':
                return '预计开始：';
            default:
                return '';
        }
    };

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="大闯关赛事大厅"
            size="lg"
        >
            <div className="space-y-6">
                {/* ===== 赛事标题区 ===== */}
                <div className="text-center py-6 bg-gradient-to-b from-amber-900/20 to-transparent rounded-lg border border-amber-700/20">
                    <div className="text-4xl mb-4">🏆</div>
                    <h2 className="text-2xl md:text-3xl font-bold text-amber-300 mb-3">
                        {currentEvent
                            ? `第 ${currentEvent.edition} 届天下第一闯关大赛`
                            : '天下第一闯关大赛'
                        }
                    </h2>
                    <div className="text-4xl mb-3">🏆</div>

                    {/* 状态显示 */}
                    <div className="mb-4">
                        <span className="text-gray-400">状态：</span>
                        <span className={`font-semibold ${statusInfo.color}`}>
                            【{statusInfo.text}】
                        </span>
                    </div>

                    {/* 倒计时显示 */}
                    {countdown && (
                        <div className="text-xl md:text-2xl font-bold text-amber-200 mb-6">
                            {getCountdownPrefix()}
                            <span className="text-white">{countdown}</span>
                        </div>
                    )}

                    {/* 主要操作按钮 - 报名入口 */}
                    <button
                        onClick={mainAction.onClick}
                        disabled={mainAction.disabled}
                        className={`
                            w-4/5 max-w-md py-4 px-8 rounded-lg font-bold text-lg md:text-xl
                            transition-all duration-300 transform hover:scale-105
                            ${mainAction.className}
                        `}
                    >
                        {mainAction.label}
                    </button>
                </div>

                {/* ===== 分隔线 ===== */}
                <div className="border-t border-stone-700/50"></div>

                {/* ===== 三个功能按钮 ===== */}
                <div className="grid grid-cols-3 gap-3">
                    {/* 历届冠军 */}
                    <button
                        onClick={() => setShowChampionsModal(true)}
                        className="py-3 px-4 rounded-lg bg-black/30 border border-stone-700/50 
                                 hover:bg-black/50 hover:border-amber-700/50 transition-all
                                 text-amber-300 font-semibold text-sm md:text-base"
                    >
                        <i className="fa-solid fa-trophy mr-2"></i>
                        历届冠军
                    </button>

                    {/* 赛事规则 */}
                    <button
                        onClick={() => setShowRulesModal(true)}
                        className="py-3 px-4 rounded-lg bg-black/30 border border-stone-700/50 
                                 hover:bg-black/50 hover:border-blue-700/50 transition-all
                                 text-blue-300 font-semibold text-sm md:text-base"
                    >
                        <i className="fa-solid fa-scroll mr-2"></i>
                        赛事规则
                    </button>

                    {/* 关卡公告 */}
                    <button
                        onClick={onOpenAnnouncement}
                        disabled={!currentEvent}
                        className={`py-3 px-4 rounded-lg border transition-all font-semibold text-sm md:text-base
                            ${currentEvent
                                ? 'bg-black/30 border-stone-700/50 hover:bg-black/50 hover:border-green-700/50 text-green-300'
                                : 'bg-gray-800/30 border-gray-700/30 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <i className="fa-solid fa-bullhorn mr-2"></i>
                        关卡公告
                    </button>
                </div>

                {/* ===== 开发者测试按钮（快速切换赛事状态）===== */}
                {currentEvent && (
                    <div className="bg-red-900/20 rounded-lg p-3 border border-red-700/30">
                        <div className="text-xs text-red-300 mb-2 flex items-center">
                            <i className="fa-solid fa-bug mr-2"></i>
                            开发者测试面板（正式版本会移除）
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {currentEvent.status !== 'registration' && (
                                <button
                                    onClick={() => {
                                        const updatedEvent = updateEventStatus(currentEvent, 'registration');
                                        setGameState(prev => ({
                                            ...prev,
                                            gauntletSystem: {
                                                ...prev.gauntletSystem,
                                                currentEvent: updatedEvent
                                            }
                                        }));
                                    }}
                                    className="px-3 py-1 bg-green-700/50 hover:bg-green-600/50 text-green-300 text-xs rounded"
                                >
                                    → 报名中
                                </button>
                            )}
                            {currentEvent.status !== 'preparing' && (
                                <button
                                    onClick={() => {
                                        const updatedEvent = updateEventStatus(currentEvent, 'preparing');
                                        setGameState(prev => ({
                                            ...prev,
                                            gauntletSystem: {
                                                ...prev.gauntletSystem,
                                                currentEvent: updatedEvent
                                            }
                                        }));
                                    }}
                                    className="px-3 py-1 bg-yellow-700/50 hover:bg-yellow-600/50 text-yellow-300 text-xs rounded"
                                >
                                    → 筹备中
                                </button>
                            )}
                            {currentEvent.status !== 'in_progress' && (
                                <button
                                    onClick={() => {
                                        const updatedEvent = updateEventStatus(currentEvent, 'in_progress');
                                        setGameState(prev => ({
                                            ...prev,
                                            gauntletSystem: {
                                                ...prev.gauntletSystem,
                                                currentEvent: updatedEvent
                                            }
                                        }));
                                    }}
                                    className="px-3 py-1 bg-red-700/50 hover:bg-red-600/50 text-red-300 text-xs rounded"
                                >
                                    → 进行中（显示直播按钮）
                                </button>
                            )}
                            {currentEvent.status !== 'completed' && (
                                <button
                                    onClick={() => {
                                        const updatedEvent = updateEventStatus(currentEvent, 'completed');
                                        setGameState(prev => ({
                                            ...prev,
                                            gauntletSystem: {
                                                ...prev.gauntletSystem,
                                                currentEvent: updatedEvent
                                            }
                                        }));
                                    }}
                                    className="px-3 py-1 bg-purple-700/50 hover:bg-purple-600/50 text-purple-300 text-xs rounded"
                                >
                                    → 已结束
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== 我的参赛记录 ===== */}
                <div className="bg-black/20 rounded-lg p-4 md:p-5 border border-stone-700/30">
                    <h4 className="text-base font-bold text-amber-300 mb-4">
                        我的参赛记录：
                    </h4>

                    {playerStats.participations > 0 ? (
                        <div className="space-y-2 text-sm md:text-base">
                            <div className="flex items-center">
                                <span className="text-gray-400 mr-2">•</span>
                                <span className="text-gray-300">参赛次数：</span>
                                <span className="text-white font-semibold ml-1">
                                    {playerStats.participations}次
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-400 mr-2">•</span>
                                <span className="text-gray-300">最佳排名：</span>
                                <span className="text-amber-400 font-semibold ml-1">
                                    第{playerStats.bestRank}名
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-400 mr-2">•</span>
                                <span className="text-gray-300">累计得分：</span>
                                <span className="text-green-400 font-semibold ml-1">
                                    {playerStats.totalScore}分
                                </span>
                            </div>
                            {playerStats.wins > 0 && (
                                <div className="flex items-center">
                                    <span className="text-gray-400 mr-2">•</span>
                                    <span className="text-gray-300">冠军次数：</span>
                                    <span className="text-yellow-400 font-semibold ml-1">
                                        {playerStats.wins}次 👑
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm italic">
                            您尚未参加过大闯关赛事，快来一展身手吧！
                        </div>
                    )}
                </div>

                {/* ===== 返回主界面按钮 ===== */}
                <div className="text-center pt-2">
                    <button
                        onClick={onClose}
                        className="py-3 px-8 rounded-lg bg-stone-700/50 hover:bg-stone-600/50 
                                 text-gray-300 hover:text-white transition-all font-semibold"
                    >
                        返回主界面
                    </button>
                </div>
            </div>

            {/* ===== 赛事规则弹窗 ===== */}
            {showRulesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-stone-900 rounded-lg p-6 max-w-md w-full mx-4 border border-stone-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-amber-300">
                                <i className="fa-solid fa-scroll mr-2"></i>
                                赛事规则
                            </h3>
                            <button
                                onClick={() => setShowRulesModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div className="space-y-3 text-gray-300 text-sm">
                            <p><strong className="text-white">赛制：</strong>64人淘汰赛，共6轮</p>
                            <p><strong className="text-white">轮次安排：</strong></p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>第一轮：64人 → 32人晋级</li>
                                <li>第二轮：32人 → 16人晋级</li>
                                <li>第三轮：16人 → 8人晋级</li>
                                <li>第四轮：8人 → 4人晋级</li>
                                <li>第五轮：4人 → 2人晋级</li>
                                <li>第六轮（决赛）：2人 → 1人夺冠</li>
                            </ul>
                            <p><strong className="text-white">评判标准：</strong>由专业评委现场打分，得分高者晋级</p>
                            <p><strong className="text-white">关卡类型：</strong>包含解谜、竞技、体能、技巧、智力、综合等</p>
                        </div>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setShowRulesModal(false)}
                                className="py-2 px-6 rounded bg-amber-700 hover:bg-amber-600 text-white font-semibold"
                            >
                                知道了
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== 历届冠军弹窗 ===== */}
            {showChampionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-stone-900 rounded-lg p-6 max-w-md w-full mx-4 border border-stone-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-amber-300">
                                <i className="fa-solid fa-trophy mr-2"></i>
                                历届冠军
                            </h3>
                            <button
                                onClick={() => setShowChampionsModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>

                        {gauntletSystem.eventHistory.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {gauntletSystem.eventHistory.map((event, index) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between bg-black/30 rounded p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                                            </span>
                                            <div>
                                                <div className="font-semibold text-white text-sm">
                                                    第{event.edition}届
                                                </div>
                                                <div className="text-amber-400 text-sm">
                                                    {event.championName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(event.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center py-8">
                                暂无历届冠军记录
                            </div>
                        )}

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setShowChampionsModal(false)}
                                className="py-2 px-6 rounded bg-amber-700 hover:bg-amber-600 text-white font-semibold"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ResponsiveModal>
    );
};

export default GauntletHallModal;