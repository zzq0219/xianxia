import React, { useState } from 'react';
import { Quest, QuestCategory } from '../types';

interface QuestLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    quests: Quest[];
}

const QuestLogModal: React.FC<QuestLogModalProps> = ({ isOpen, onClose, quests }) => {
    const [activeTab, setActiveTab] = useState<QuestCategory | 'Completed'>('Main');
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

    if (!isOpen) return null;

    const filteredQuests = quests.filter(q => {
        if (activeTab === 'Completed') {
            return q.status === 'Completed';
        }
        return q.category === activeTab && q.status !== 'Completed';
    });

    const QuestItem: React.FC<{ quest: Quest }> = ({ quest }) => (
        <li
            key={quest.id}
            onClick={() => setSelectedQuest(quest)}
            className={`p-3 cursor-pointer rounded-md transition-colors ${selectedQuest?.id === quest.id ? 'bg-amber-500/20' : 'hover:bg-stone-700/50'}`}
        >
            <h4 className="font-semibold text-white">{quest.title}</h4>
            <p className="text-xs text-gray-400">{quest.status}</p>
        </li>
    );

    const QuestDetail: React.FC<{ quest: Quest | null }> = ({ quest }) => {
        if (!quest) {
            return (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    <p>从左侧选择一个任务以查看详情</p>
                </div>
            );
        }

        return (
            <div className="flex-1 p-6 bg-black/20 rounded-lg overflow-y-auto">
                <h3 className="text-2xl font-bold text-amber-300 font-serif mb-4">{quest.title}</h3>
                <p className="text-gray-300 mb-6 italic">"{quest.description}"</p>

                <h4 className="font-bold text-white mb-3">任务目标</h4>
                <ul className="space-y-2 mb-6">
                    {quest.objectives.map(obj => (
                        <li key={obj.id} className="flex items-center">
                            <i className={`fa-solid ${obj.isCompleted ? 'fa-check-square text-green-500' : 'fa-square text-gray-500'} mr-3`}></i>
                            <span className={`${obj.isCompleted ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                                {obj.description} {obj.targetCount ? `(${obj.currentCount}/${obj.targetCount})` : ''}
                            </span>
                        </li>
                    ))}
                </ul>

                <h4 className="font-bold text-white mb-3">任务奖励</h4>
                <div className="text-gray-300">
                    {quest.rewards.spiritStones && <p>灵石 x {quest.rewards.spiritStones}</p>}
                    {quest.rewards.reputation && <p>声望 +{quest.rewards.reputation}</p>}
                    {quest.rewards.items?.map((item, index) => (
                        <p key={index}>物品: {item.name}</p>
                    ))}
                </div>
            </div>
        );
    };

    const TabButton: React.FC<{ tab: QuestCategory | 'Completed', label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === tab ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="ornate-border bg-stone-900 w-full max-w-5xl h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
                    <h2 className="text-2xl font-bold text-amber-300 font-serif">任务日志</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>
                <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-stone-700">
                    <TabButton tab="Main" label="主线任务" />
                    <TabButton tab="Side" label="支线任务" />
                    <TabButton tab="Sect" label="宗门任务" />
                    <TabButton tab="Completed" label="已完成" />
                </div>
                <div className="flex-grow flex p-6 space-x-6 overflow-hidden">
                    <div className="w-1/3 flex-shrink-0 bg-black/20 rounded-lg p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {filteredQuests.length > 0 ? (
                                filteredQuests.map(q => <QuestItem key={q.id} quest={q} />)
                            ) : (
                                <p className="text-center text-gray-500 mt-4">此分类下暂无任务。</p>
                            )}
                        </ul>
                    </div>
                    <QuestDetail quest={selectedQuest} />
                </div>
            </div>
        </div>
    );
};

export default QuestLogModal;