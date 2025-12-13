import React, { useState } from 'react';
import { PlayerProfile, Quest, QuestCategory } from '../types';

interface QuestLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    quests: Quest[];
    playerProfile: PlayerProfile;
    onClaimReward: (questId: string) => void;
}

// 任务分类图标
const tabIcons: Record<string, string> = {
    'Main': '📜',
    'Side': '📋',
    'Sect': '🏯',
    'Completed': '✅',
};

// 任务状态显示
const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; class: string }> = {
        'Active': { text: '进行中', class: 'text-blue-400' },
        'Claimable': { text: '可领取', class: 'text-gold-400 animate-pulse' },
        'Completed': { text: '已完成', class: 'text-green-400' },
        'InProgress': { text: '进行中', class: 'text-blue-400' },
    };
    return statusMap[status] || { text: status, class: 'text-paper-400' };
};

const QuestLogModal: React.FC<QuestLogModalProps> = ({ isOpen, onClose, quests, playerProfile, onClaimReward }) => {
    const [activeTab, setActiveTab] = useState<QuestCategory | 'Completed'>('Main');
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

    if (!isOpen) return null;

    const filteredQuests = quests.filter(q => {
        if (activeTab === 'Completed') {
            return q.status === 'Completed' || q.status === 'Claimable';
        }
        return q.category === activeTab && q.status !== 'Completed' && q.status !== 'Claimable';
    });

    const QuestItem: React.FC<{ quest: Quest }> = ({ quest }) => {
        const statusInfo = getStatusDisplay(quest.status);
        return (
            <li
                key={quest.id}
                onClick={() => setSelectedQuest(quest)}
                className={`p-3 cursor-pointer rounded-lg transition-all duration-300 border ${selectedQuest?.id === quest.id
                        ? 'bg-gold-500/20 border-gold-500/50 shadow-lg shadow-gold-500/10'
                        : 'border-transparent hover:bg-ink-700/50 hover:border-gold-500/30'
                    }`}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h4 className="font-semibold text-paper-100 flex items-center gap-2">
                            <span>📌</span>
                            {quest.title}
                        </h4>
                        <p className={`text-xs mt-1 ${statusInfo.class}`}>
                            {statusInfo.text}
                        </p>
                    </div>
                    {quest.status === 'Claimable' && (
                        <span className="text-gold-400 text-xl animate-bounce">🎁</span>
                    )}
                </div>
            </li>
        );
    };

    const QuestDetail: React.FC<{ quest: Quest | null }> = ({ quest }) => {
        if (!quest) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-paper-500 bg-ink-800/30 rounded-lg border border-dashed border-ink-600">
                    <span className="text-4xl mb-3 opacity-30">📜</span>
                    <p>从左侧选择一个任务以查看详情</p>
                </div>
            );
        }

        return (
            <div className="flex-1 p-6 bg-gradient-to-br from-ink-900/60 to-ink-800/60 rounded-lg overflow-y-auto border border-gold-600/30 relative">
                {/* 装饰 */}
                <div className="absolute top-2 right-2 text-2xl text-gold-500/10">☯</div>

                <h3 className="text-2xl font-bold text-gold-300 font-serif mb-4 flex items-center gap-2">
                    <span className="text-gold-400/60">【</span>
                    {quest.title}
                    <span className="text-gold-400/60">】</span>
                </h3>
                <p className="text-paper-300 mb-6 italic bg-ink-800/40 p-3 rounded-lg border-l-2 border-gold-500/50">
                    "{quest.description}"
                </p>

                <h4 className="font-bold text-gold-400 mb-3 flex items-center gap-2">
                    <span>🎯</span>
                    <span>任务目标</span>
                </h4>
                <ul className="space-y-2 mb-6">
                    {quest.objectives.map(obj => (
                        <li key={obj.id} className="flex items-center bg-ink-800/40 p-2 rounded-lg">
                            <span className={`mr-3 text-lg ${obj.isCompleted ? 'text-green-400' : 'text-paper-500'}`}>
                                {obj.isCompleted ? '✅' : '⬜'}
                            </span>
                            <span className={`${obj.isCompleted ? 'line-through text-paper-500' : 'text-paper-200'}`}>
                                {obj.description}
                                {obj.targetCount && (
                                    <span className="ml-2 text-gold-400/80">
                                        ({obj.currentCount}/{obj.targetCount})
                                    </span>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>

                <h4 className="font-bold text-gold-400 mb-3 flex items-center gap-2">
                    <span>🎁</span>
                    <span>任务奖励</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-6">
                    {quest.rewards.spiritStones && (
                        <div className="flex items-center bg-ink-800/40 p-2 rounded-lg text-gold-300">
                            <span className="mr-2">💎</span>
                            <span>灵石 x {quest.rewards.spiritStones}</span>
                        </div>
                    )}
                    {quest.rewards.reputation && (
                        <div className="flex items-center bg-ink-800/40 p-2 rounded-lg text-purple-300">
                            <span className="mr-2">⭐</span>
                            <span>声望 +{quest.rewards.reputation}</span>
                        </div>
                    )}
                    {quest.rewards.items?.map((item, index) => (
                        <div key={index} className="flex items-center bg-ink-800/40 p-2 rounded-lg text-green-300">
                            <span className="mr-2">📦</span>
                            <span>{item.name}</span>
                        </div>
                    ))}
                </div>

                {quest.status === 'Claimable' && (
                    <button
                        onClick={() => onClaimReward(quest.id)}
                        className="w-full py-3 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:via-gold-400 hover:to-gold-500 text-ink-900 font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2 hover:shadow-gold-500/30"
                    >
                        <span>🎁</span>
                        <span>领取奖励</span>
                    </button>
                )}

                {quest.status === 'Completed' && (
                    <div className="w-full py-3 bg-ink-700/60 text-paper-500 font-bold rounded-lg text-center border border-ink-600">
                        <span className="mr-2">✅</span>
                        <span>已领取</span>
                    </div>
                )}
            </div>
        );
    };

    const TabButton: React.FC<{ tab: QuestCategory | 'Completed', label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-300 flex items-center gap-1.5 ${activeTab === tab
                    ? 'bg-ink-800/90 text-gold-400 border-b-2 border-gold-500/60 shadow-[0_0_10px_rgba(180,149,106,0.15)]'
                    : 'bg-transparent text-paper-400 hover:bg-ink-800/50 hover:text-gold-300'
                }`}
        >
            <span>{tabIcons[tab]}</span>
            <span>{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            {/* 背景装饰 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-20 text-8xl text-gold-500/5">☯</div>
                <div className="absolute bottom-20 right-20 text-8xl text-gold-500/5">☯</div>
            </div>

            <div
                className="relative bg-gradient-to-br from-ink-900/98 via-ink-800/98 to-ink-900/98 border-2 border-gold-600/50 w-full max-w-5xl h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 顶部装饰 */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent"></div>

                {/* 头部 */}
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-gradient-to-r from-ink-900/50 via-ink-800/50 to-ink-900/50 border-b border-gold-600/30">
                    <h2 className="text-2xl font-bold text-gold-300 font-serif flex items-center gap-3">
                        <span className="text-gold-400/60">✦</span>
                        <span>📜 仙途任务录</span>
                        <span className="text-gold-400/60">✦</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gold-400/70 hover:text-gold-300 transition-colors p-2 hover:bg-gold-500/10 rounded-lg"
                    >
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                {/* 标签栏 */}
                <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-gold-600/30 bg-ink-900/30">
                    <TabButton tab="Main" label="主线" />
                    <TabButton tab="Side" label="支线" />
                    <TabButton tab="Sect" label="宗门" />
                    <TabButton tab="Completed" label="已完成" />
                </div>

                {/* 内容区 */}
                <div className="flex-grow flex p-6 space-x-6 overflow-hidden">
                    {/* 任务列表 */}
                    <div className="w-1/3 flex-shrink-0 bg-gradient-to-br from-ink-900/60 to-ink-800/60 rounded-lg p-4 overflow-y-auto border border-gold-600/30">
                        <ul className="space-y-2">
                            {filteredQuests.length > 0 ? (
                                filteredQuests.map(q => <QuestItem key={q.id} quest={q} />)
                            ) : (
                                <div className="text-center text-paper-500 mt-8 flex flex-col items-center">
                                    <span className="text-4xl mb-2 opacity-30">📭</span>
                                    <p>此分类下暂无任务</p>
                                </div>
                            )}
                        </ul>
                    </div>

                    {/* 任务详情 */}
                    <QuestDetail quest={selectedQuest} />
                </div>

                {/* 底部装饰 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent"></div>
            </div>
        </div>
    );
};

export default QuestLogModal;