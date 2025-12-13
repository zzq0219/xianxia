import React, { useState } from 'react';
import { WeeklyTheme } from '../types/etiquette';

interface WeeklyThemePanelProps {
    currentTheme: WeeklyTheme | null;
    allThemes: WeeklyTheme[];
    onCreateTheme: (theme: Omit<WeeklyTheme, 'id' | 'createdAt'>) => void;
    onActivateTheme: (themeId: string) => void;
    onDeleteTheme: (themeId: string) => void;
}

const WeeklyThemePanel: React.FC<WeeklyThemePanelProps> = ({
    currentTheme,
    allThemes,
    onCreateTheme,
    onActivateTheme,
    onDeleteTheme,
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newTheme, setNewTheme] = useState<Partial<WeeklyTheme>>({
        name: '',
        description: '',
        icon: '🎭',
        themeSettings: {
            shameBonus: 20,
            submissionBonus: 20,
            exposureBonus: 20,
        },
        specialRequirements: [],
        goals: [],
        status: 'upcoming',
    });

    const handleSubmit = () => {
        if (!newTheme.name || !newTheme.description) {
            alert('请填写主题名称和描述！');
            return;
        }

        const now = Date.now();
        const weekDuration = 7 * 24 * 60 * 60 * 1000;

        onCreateTheme({
            name: newTheme.name,
            description: newTheme.description,
            icon: newTheme.icon || '🎭',
            startTime: now,
            endTime: now + weekDuration,
            status: 'upcoming',
            themeSettings: newTheme.themeSettings || {
                shameBonus: 20,
                submissionBonus: 20,
                exposureBonus: 20,
            },
            specialRequirements: newTheme.specialRequirements || [],
            goals: newTheme.goals || [],
        });

        setIsCreating(false);
        setNewTheme({
            name: '',
            description: '',
            icon: '🎭',
            themeSettings: {
                shameBonus: 20,
                submissionBonus: 20,
                exposureBonus: 20,
            },
            specialRequirements: [],
            goals: [],
            status: 'upcoming',
        });
    };

    const getThemeStatusColor = (status: WeeklyTheme['status']) => {
        switch (status) {
            case 'active':
                return 'border-green-500 bg-green-500/10';
            case 'upcoming':
                return 'border-blue-500 bg-blue-500/10';
            case 'completed':
                return 'border-gray-500 bg-gray-500/10';
        }
    };

    const getThemeStatusText = (status: WeeklyTheme['status']) => {
        switch (status) {
            case 'active':
                return '✅ 进行中';
            case 'upcoming':
                return '⏳ 未开始';
            case 'completed':
                return '✔️ 已完成';
        }
    };

    return (
        <div className="space-y-4">
            {/* 当前主题展示 */}
            {currentTheme && (
                <div className="p-4 rounded-lg border-2 border-pink-500 bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{currentTheme.icon}</span>
                            <div>
                                <h3 className="text-xl font-bold text-pink-300">{currentTheme.name}</h3>
                                <p className="text-sm text-gray-400">当前主题周</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
                            {getThemeStatusText(currentTheme.status)}
                        </span>
                    </div>

                    <p className="text-gray-300 mb-3">{currentTheme.description}</p>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="p-2 bg-stone-800/50 rounded text-center">
                            <p className="text-xs text-gray-400">羞耻加成</p>
                            <p className="text-lg font-bold text-pink-300">+{currentTheme.themeSettings.shameBonus}%</p>
                        </div>
                        <div className="p-2 bg-stone-800/50 rounded text-center">
                            <p className="text-xs text-gray-400">服从加成</p>
                            <p className="text-lg font-bold text-purple-300">+{currentTheme.themeSettings.submissionBonus}%</p>
                        </div>
                        <div className="p-2 bg-stone-800/50 rounded text-center">
                            <p className="text-xs text-gray-400">露出加成</p>
                            <p className="text-lg font-bold text-red-300">+{currentTheme.themeSettings.exposureBonus}%</p>
                        </div>
                    </div>

                    {currentTheme.goals.length > 0 && (
                        <div className="mt-3 p-3 bg-stone-900/50 rounded">
                            <p className="text-xs text-gray-400 mb-2">主题目标:</p>
                            <ul className="space-y-1">
                                {currentTheme.goals.map((goal, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                        <span>{goal.completed ? '✅' : '⭕'}</span>
                                        <span className={goal.completed ? 'text-green-300' : 'text-gray-300'}>
                                            {goal.description}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* 主题列表 */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-cyan-300">所有主题周</h4>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-3 py-1.5 bg-pink-600/30 hover:bg-pink-500/40 border border-pink-500/50 rounded text-pink-300 hover:text-pink-200 transition-colors text-sm"
                    >
                        <i className="fa-solid fa-plus mr-1"></i>创建新主题
                    </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-xianxia">
                    {allThemes.map((theme) => (
                        <div
                            key={theme.id}
                            className={`p-3 rounded-lg border-2 ${getThemeStatusColor(theme.status)} transition-all`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <span className="text-2xl">{theme.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-bold text-white">{theme.name}</h5>
                                            <span className="px-2 py-0.5 rounded text-xs bg-stone-700/50 text-gray-300">
                                                {getThemeStatusText(theme.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-2">{theme.description}</p>
                                        <div className="flex gap-2 mt-2 text-xs">
                                            <span className="text-pink-300">羞耻+{theme.themeSettings.shameBonus}%</span>
                                            <span className="text-purple-300">服从+{theme.themeSettings.submissionBonus}%</span>
                                            <span className="text-red-300">露出+{theme.themeSettings.exposureBonus}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {theme.status === 'upcoming' && (
                                        <button
                                            onClick={() => onActivateTheme(theme.id)}
                                            className="px-2 py-1 text-xs bg-green-600/30 hover:bg-green-500/40 rounded text-green-300 transition-colors"
                                        >
                                            启用
                                        </button>
                                    )}
                                    {theme.status !== 'active' && (
                                        <button
                                            onClick={() => onDeleteTheme(theme.id)}
                                            className="px-2 py-1 text-xs bg-red-900/30 hover:bg-red-800/40 rounded text-red-300 transition-colors"
                                        >
                                            删除
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 创建主题弹窗 */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsCreating(false)}>
                    <div className="bg-stone-900 border-2 border-pink-500 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-pink-300 mb-4">创建新主题周</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">主题名称</label>
                                <input
                                    type="text"
                                    value={newTheme.name}
                                    onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded text-white focus:border-pink-500 focus:outline-none"
                                    placeholder="例如: 羞辱周、服从周"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">主题图标</label>
                                <input
                                    type="text"
                                    value={newTheme.icon}
                                    onChange={(e) => setNewTheme({ ...newTheme, icon: e.target.value })}
                                    className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded text-white focus:border-pink-500 focus:outline-none"
                                    placeholder="输入emoji图标"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">主题描述</label>
                                <textarea
                                    value={newTheme.description}
                                    onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded text-white focus:border-pink-500 focus:outline-none resize-none"
                                    rows={3}
                                    placeholder="描述这个主题周的特色..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">羞耻加成 (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={newTheme.themeSettings?.shameBonus}
                                        onChange={(e) => setNewTheme({
                                            ...newTheme,
                                            themeSettings: {
                                                ...newTheme.themeSettings!,
                                                shameBonus: Number(e.target.value),
                                            }
                                        })}
                                        className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded text-white focus:border-pink-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">服从加成 (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={newTheme.themeSettings?.submissionBonus}
                                        onChange={(e) => setNewTheme({
                                            ...newTheme,
                                            themeSettings: {
                                                ...newTheme.themeSettings!,
                                                submissionBonus: Number(e.target.value),
                                            }
                                        })}
                                        className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded text-white focus:border-pink-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">露出加成 (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={newTheme.themeSettings?.exposureBonus}
                                        onChange={(e) => setNewTheme({
                                            ...newTheme,
                                            themeSettings: {
                                                ...newTheme.themeSettings!,
                                                exposureBonus: Number(e.target.value),
                                            }
                                        })}
                                        className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded text-white focus:border-pink-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded text-white font-semibold transition-all"
                                >
                                    创建主题
                                </button>
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded text-gray-300 transition-colors"
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyThemePanel;