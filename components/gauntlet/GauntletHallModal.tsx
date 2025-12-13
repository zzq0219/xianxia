/**
 * 大闯关系统 - 大厅入口Modal
 * 
 * 这是大闯关系统的主入口组件，显示：
 * - 赛事状态和倒计时
 * - 报名入口
 * - 直播间入口
 * - 公告栏入口
 */

import React, { useState } from 'react';
import { GameState } from '../../types';
import { GauntletStatus } from '../../types/gauntlet.types';

interface GauntletHallModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    onUpdateGameState: (updater: (prev: GameState) => GameState) => void;
}

const GauntletHallModal: React.FC<GauntletHallModalProps> = ({
    isOpen,
    onClose,
    gameState,
    onUpdateGameState,
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'registration' | 'live' | 'announcements'>('overview');

    if (!isOpen) return null;

    const gauntletSystem = gameState.gauntletSystem;
    const currentEvent = gauntletSystem.currentEvent;

    // 获取当前状态（从currentEvent获取，如果没有则显示休赛期）
    const currentStatus: GauntletStatus | 'idle' = currentEvent?.status || 'idle';

    // 获取状态显示文本
    const getStatusText = (status: GauntletStatus | 'idle'): string => {
        const statusMap: Record<GauntletStatus | 'idle', string> = {
            'idle': '🌙 休赛期',
            'countdown': '⏰ 倒计时',
            'registration': '📝 报名中',
            'preparing': '⚙️ 准备中',
            'in_progress': '🔥 进行中',
            'completed': '🏆 已结束',
        };
        return statusMap[status] || '未知状态';
    };

    // 获取状态颜色
    const getStatusColor = (status: GauntletStatus | 'idle'): string => {
        const colorMap: Record<GauntletStatus | 'idle', string> = {
            'idle': 'text-gray-400',
            'countdown': 'text-blue-400',
            'registration': 'text-green-400',
            'preparing': 'text-purple-400',
            'in_progress': 'text-red-400',
            'completed': 'text-amber-400',
        };
        return colorMap[status] || 'text-white';
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 w-full max-w-4xl h-auto max-h-[85vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 头部 */}
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20 border-b border-stone-700/50">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏟️</span>
                        <div>
                            <h2 className="text-2xl font-bold text-gradient-gold text-shadow-glow font-serif">
                                大闯关
                            </h2>
                            <p className="text-sm text-gray-400">修仙界最盛大的综艺赛事</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>

                {/* 标签页导航 */}
                <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-stone-700 bg-black/10">
                    {[
                        { key: 'overview', label: '总览', icon: '📊' },
                        { key: 'registration', label: '报名', icon: '📝' },
                        { key: 'live', label: '直播间', icon: '📺' },
                        { key: 'announcements', label: '公告', icon: '📢' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as typeof activeTab)}
                            className={`px-4 py-3 text-sm font-semibold rounded-t-lg transition-colors duration-200 flex items-center gap-2 ${activeTab === tab.key
                                    ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400'
                                    : 'bg-transparent text-gray-400 hover:bg-stone-700/50'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* 内容区域 */}
                <div className="flex-grow overflow-y-auto scrollbar-xianxia p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* 当前状态卡片 */}
                            <div className="glass-morphism p-6 rounded-lg border border-stone-700/50">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span>🎯</span>
                                    <span>赛事状态</span>
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/30 p-4 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-1">当前状态</p>
                                        <p className={`text-xl font-bold ${getStatusColor(currentStatus)}`}>
                                            {getStatusText(currentStatus)}
                                        </p>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-1">下次赛事</p>
                                        <p className="text-xl font-bold text-white">
                                            {gauntletSystem.nextEventDate
                                                ? new Date(gauntletSystem.nextEventDate).toLocaleDateString('zh-CN')
                                                : '待定'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 当前赛事信息 */}
                            {currentEvent ? (
                                <div className="glass-morphism p-6 rounded-lg border border-amber-500/30">
                                    <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                                        <span>🏆</span>
                                        <span>{currentEvent.name}</span>
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="bg-black/30 p-3 rounded-lg">
                                            <p className="text-2xl font-bold text-white">{currentEvent.contestants.length}</p>
                                            <p className="text-sm text-gray-400">参赛者</p>
                                        </div>
                                        <div className="bg-black/30 p-3 rounded-lg">
                                            <p className="text-2xl font-bold text-white">{currentEvent.currentRound}</p>
                                            <p className="text-sm text-gray-400">当前轮次</p>
                                        </div>
                                        <div className="bg-black/30 p-3 rounded-lg">
                                            <p className="text-2xl font-bold text-white">{currentEvent.judges.length}</p>
                                            <p className="text-sm text-gray-400">评委</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-morphism p-6 rounded-lg border border-stone-700/50 text-center">
                                    <p className="text-4xl mb-4">🌙</p>
                                    <p className="text-gray-400">当前没有进行中的赛事</p>
                                    <p className="text-sm text-gray-500 mt-2">请等待下一届大闯关开启</p>
                                </div>
                            )}

                            {/* 快捷操作 */}
                            <div className="glass-morphism p-6 rounded-lg border border-stone-700/50">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span>⚡</span>
                                    <span>快捷操作</span>
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentStatus !== 'idle'}
                                        onClick={() => {
                                            // TODO: 创建新赛事
                                            alert('创建新赛事功能开发中...');
                                        }}
                                    >
                                        <span>🎬</span>
                                        <span>创建新赛事</span>
                                    </button>
                                    <button
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentStatus !== 'registration'}
                                        onClick={() => setActiveTab('registration')}
                                    >
                                        <span>📝</span>
                                        <span>立即报名</span>
                                    </button>
                                    <button
                                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={currentStatus !== 'in_progress'}
                                        onClick={() => setActiveTab('live')}
                                    >
                                        <span>📺</span>
                                        <span>进入直播间</span>
                                    </button>
                                    <button
                                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                                        onClick={() => setActiveTab('announcements')}
                                    >
                                        <span>📢</span>
                                        <span>查看公告</span>
                                    </button>
                                </div>
                            </div>

                            {/* 历史记录 */}
                            <div className="glass-morphism p-6 rounded-lg border border-stone-700/50">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span>📜</span>
                                    <span>历史赛事</span>
                                </h3>
                                {gauntletSystem.eventHistory.length > 0 ? (
                                    <div className="space-y-2">
                                        {gauntletSystem.eventHistory.slice(0, 5).map((event) => (
                                            <div key={event.id} className="bg-black/30 p-3 rounded-lg flex justify-between items-center">
                                                <div>
                                                    <p className="text-white font-semibold">{event.name}</p>
                                                    <p className="text-sm text-gray-400">
                                                        冠军: {event.championName || '未知'}
                                                    </p>
                                                </div>
                                                <span className="text-amber-400">🏆</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">暂无历史赛事记录</p>
                                )}
                            </div>

                            {/* 玩家统计 */}
                            <div className="glass-morphism p-6 rounded-lg border border-stone-700/50">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span>📈</span>
                                    <span>我的战绩</span>
                                </h3>
                                <div className="grid grid-cols-4 gap-4 text-center">
                                    <div className="bg-black/30 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-white">{gauntletSystem.playerStats.participations}</p>
                                        <p className="text-xs text-gray-400">参赛次数</p>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-amber-400">{gauntletSystem.playerStats.wins}</p>
                                        <p className="text-xs text-gray-400">夺冠次数</p>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-white">
                                            {gauntletSystem.playerStats.bestRank > 0 ? `第${gauntletSystem.playerStats.bestRank}` : '-'}
                                        </p>
                                        <p className="text-xs text-gray-400">最佳名次</p>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-lg">
                                        <p className="text-2xl font-bold text-white">
                                            {gauntletSystem.playerStats.averageRank > 0 ? gauntletSystem.playerStats.averageRank.toFixed(1) : '-'}
                                        </p>
                                        <p className="text-xs text-gray-400">平均名次</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'registration' && (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-4">📝</p>
                            <p className="text-xl text-gray-400">报名界面</p>
                            <p className="text-sm text-gray-500 mt-2">功能开发中...</p>
                            {currentStatus === 'registration' ? (
                                <div className="mt-6">
                                    <p className="text-green-400 mb-4">报名通道已开启！</p>
                                    <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-lg font-semibold">
                                        选择角色报名
                                    </button>
                                </div>
                            ) : (
                                <p className="text-yellow-400 mt-4">当前不在报名阶段</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'live' && (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-4">📺</p>
                            <p className="text-xl text-gray-400">直播间界面</p>
                            <p className="text-sm text-gray-500 mt-2">功能开发中...</p>
                            {currentStatus === 'in_progress' ? (
                                <div className="mt-6">
                                    <p className="text-red-400 mb-4 animate-pulse">🔴 直播中</p>
                                    <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-lg font-semibold">
                                        进入直播间
                                    </button>
                                </div>
                            ) : (
                                <p className="text-yellow-400 mt-4">当前没有进行中的直播</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="space-y-4">
                            <div className="text-center py-8">
                                <p className="text-4xl mb-4">📢</p>
                                <p className="text-xl text-gray-400">公告栏</p>
                            </div>

                            {/* 关卡预告 */}
                            {currentEvent && currentEvent.rounds.length > 0 && (
                                <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
                                    <h4 className="text-lg font-bold text-amber-400 mb-3">🎯 关卡预告</h4>
                                    <div className="space-y-2">
                                        {currentEvent.rounds.map((round, index) => (
                                            <div key={index} className="bg-black/30 p-3 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-white font-semibold">
                                                        第{round.roundNumber}轮: {round.challenge?.name || '待公布'}
                                                    </span>
                                                    <span className={`text-sm ${round.status === 'completed' ? 'text-green-400' :
                                                            round.status === 'in_progress' ? 'text-red-400' :
                                                                'text-gray-400'
                                                        }`}>
                                                        {round.status === 'completed' ? '已完成' :
                                                            round.status === 'in_progress' ? '进行中' :
                                                                '待开始'}
                                                    </span>
                                                </div>
                                                {round.challenge?.type && (
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        类型: {round.challenge.type} | 难度: {round.challenge.difficulty}/10
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!currentEvent && (
                                <p className="text-gray-500 text-center">暂无公告</p>
                            )}
                        </div>
                    )}
                </div>

                {/* 底部信息 */}
                <div className="flex-shrink-0 p-4 bg-black/20 border-t border-stone-700/50">
                    <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>💡 大闯关是修仙界最盛大的综艺赛事，64位佳丽同台竞技</span>
                        <span>版本 v1.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GauntletHallModal;