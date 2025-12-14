import React, { useEffect, useState } from 'react';
import { GameState } from '../../types';
import { ResponsiveModal } from '../ResponsiveModal';

interface GauntletHallModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    onOpenAnnouncement: () => void;
    onOpenRegistration: () => void;
    onOpenLive: () => void;
}

/**
 * 大闯关大厅界面
 * 功能：
 * - 显示赛事状态（未创建/准备中/报名中/进行中/已结束）
 * - 显示倒计时
 * - 提供入口：查看公告、报名、观看直播
 */
export const GauntletHallModal: React.FC<GauntletHallModalProps> = ({
    isOpen,
    onClose,
    gameState,
    onOpenAnnouncement,
    onOpenRegistration,
    onOpenLive,
}) => {
    const { gauntletSystem } = gameState;
    const currentEvent = gauntletSystem.currentEvent;
    const config = gauntletSystem.config;

    // 倒计时状态
    const [countdown, setCountdown] = useState<string>('');

    // 计算倒计时
    useEffect(() => {
        if (!currentEvent) return;

        const updateCountdown = () => {
            const now = Date.now();
            let targetTime = 0;
            let prefix = '';

            switch (currentEvent.status) {
                case 'registration':
                    targetTime = currentEvent.registrationDeadline;
                    prefix = '距离报名结束: ';
                    break;
                case 'preparing':
                    targetTime = currentEvent.registrationDeadline;
                    prefix = '距离赛事开始: ';
                    break;
                case 'in_progress':
                    // 显示当前轮次信息
                    const currentRound = currentEvent.rounds.find(r => r.status === 'in_progress');
                    if (currentRound) {
                        setCountdown(`第${currentRound.roundNumber}轮进行中`);
                        return;
                    }
                    break;
                case 'completed':
                    setCountdown('赛事已结束');
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
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    let timeStr = '';
                    if (days > 0) timeStr += `${days}天 `;
                    if (hours > 0) timeStr += `${hours}时 `;
                    if (minutes > 0) timeStr += `${minutes}分 `;
                    timeStr += `${seconds}秒`;

                    setCountdown(prefix + timeStr);
                }
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [currentEvent]);

    // 获取状态文本和颜色
    const getStatusInfo = () => {
        if (!currentEvent) {
            return {
                text: '暂无赛事',
                color: 'text-gray-400',
                icon: '🌙',
                description: '当前没有正在进行的大闯关赛事'
            };
        }

        switch (currentEvent.status) {
            case 'countdown':
                return {
                    text: '倒计时中',
                    color: 'text-blue-400',
                    icon: '⏱️',
                    description: '赛事即将开始，敬请期待！'
                };
            case 'registration':
                return {
                    text: '报名中',
                    color: 'text-green-400',
                    icon: '📝',
                    description: '报名通道已开启，快来参加吧！'
                };
            case 'preparing':
                return {
                    text: '筹备中',
                    color: 'text-yellow-400',
                    icon: '⚙️',
                    description: '赛事正在紧张筹备中...'
                };
            case 'in_progress':
                return {
                    text: '进行中',
                    color: 'text-red-400',
                    icon: '🔥',
                    description: '赛事正在激烈进行，快去观战！'
                };
            case 'completed':
                return {
                    text: '已结束',
                    color: 'text-purple-400',
                    icon: '👑',
                    description: '本届赛事已圆满结束'
                };
            default:
                return {
                    text: '未知状态',
                    color: 'text-gray-400',
                    icon: '❓',
                    description: ''
                };
        }
    };

    const statusInfo = getStatusInfo();

    // 判断按钮是否可用
    const canViewAnnouncement = currentEvent !== null;
    const canRegister = currentEvent?.status === 'registration';
    const canViewLive = currentEvent?.status === 'in_progress';

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="🎪 大闯关大厅"
            size="lg"
        >
            <div className="space-y-6">
                {/* 赛事标题卡片 */}
                <div className="bg-gradient-to-r from-amber-900/30 via-amber-800/20 to-amber-900/30 rounded-lg p-6 border border-amber-700/30">
                    <div className="text-center">
                        <div className="text-5xl mb-3">{statusInfo.icon}</div>
                        <h3 className="text-2xl md:text-3xl font-bold text-amber-300 mb-2">
                            {currentEvent?.name || '青蛇宗大闯关'}
                        </h3>
                        <div className={`text-lg md:text-xl ${statusInfo.color} font-semibold mb-2`}>
                            {statusInfo.text}
                        </div>
                        <p className="text-gray-400 text-sm md:text-base">{statusInfo.description}</p>
                    </div>
                </div>

                {/* 倒计时卡片 */}
                {countdown && currentEvent && (
                    <div className="bg-black/30 rounded-lg p-4 border border-stone-700/50">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">
                                {countdown}
                            </div>
                        </div>
                    </div>
                )}

                {/* 赛事信息 */}
                {currentEvent && (
                    <div className="bg-black/20 rounded-lg p-4 md:p-6 border border-stone-700/30 space-y-3">
                        <h4 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-info-circle"></i>
                            赛事信息
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm md:text-base">
                            <div className="flex justify-between">
                                <span className="text-gray-400">参赛人数：</span>
                                <span className="text-white font-semibold">64人</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">比赛轮次：</span>
                                <span className="text-white font-semibold">6轮</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">当前轮次：</span>
                                <span className="text-white font-semibold">
                                    {currentEvent.currentRound > 0 ? `第${currentEvent.currentRound}轮` : '未开始'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">评委人数：</span>
                                <span className="text-white font-semibold">{currentEvent.judges.length}位</span>
                            </div>
                        </div>

                        {/* 赛制说明 */}
                        <div className="mt-4 pt-4 border-t border-stone-700/30">
                            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                                本届大闯关采用64人淘汰赛制，经过6轮激烈角逐，
                                最终决出冠军。每轮由专业评委现场打分，得分最高者晋级下一轮！
                            </p>
                        </div>
                    </div>
                )}

                {/* 操作按钮 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 查看公告 */}
                    <button
                        onClick={onOpenAnnouncement}
                        disabled={!canViewAnnouncement}
                        className={`
              py-4 px-6 rounded-lg font-semibold text-base md:text-lg
              transition-all duration-200 touch-target
              ${canViewAnnouncement
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/50'
                                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                            }
            `}
                    >
                        <i className="fa-solid fa-bullhorn mr-2"></i>
                        查看公告
                    </button>

                    {/* 报名参赛 */}
                    <button
                        onClick={onOpenRegistration}
                        disabled={!canRegister}
                        className={`
              py-4 px-6 rounded-lg font-semibold text-base md:text-lg
              transition-all duration-200 touch-target
              ${canRegister
                                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg hover:shadow-green-500/50 animate-pulse-slow'
                                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                            }
            `}
                    >
                        <i className="fa-solid fa-pen-to-square mr-2"></i>
                        {canRegister ? '立即报名' : '暂未开放'}
                    </button>

                    {/* 观看直播 */}
                    <button
                        onClick={onOpenLive}
                        disabled={!canViewLive}
                        className={`
              py-4 px-6 rounded-lg font-semibold text-base md:text-lg
              transition-all duration-200 touch-target
              ${canViewLive
                                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg hover:shadow-red-500/50'
                                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                            }
            `}
                    >
                        <i className="fa-solid fa-tv mr-2"></i>
                        {canViewLive ? '观看直播' : '暂未开始'}
                    </button>
                </div>

                {/* 历史记录（如果有） */}
                {gauntletSystem.eventHistory.length > 0 && (
                    <div className="bg-black/20 rounded-lg p-4 md:p-6 border border-stone-700/30">
                        <h4 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-trophy"></i>
                            往届冠军
                        </h4>
                        <div className="space-y-2">
                            {gauntletSystem.eventHistory.slice(0, 3).map((event, index) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between bg-black/30 rounded p-3 hover:bg-black/40 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                        </span>
                                        <div>
                                            <div className="font-semibold text-white">{event.name}</div>
                                            <div className="text-xs text-gray-400">
                                                冠军：{event.championName}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(event.date).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ResponsiveModal>
    );
};

export default GauntletHallModal;