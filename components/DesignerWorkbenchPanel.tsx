import React, { useState } from 'react';
import { CharacterCard } from '../types';
import { DesignerWorkbench, DesignerWorkItem, WeeklyTheme } from '../types/etiquette';

interface DesignerWorkbenchPanelProps {
    workbench: DesignerWorkbench | null;
    designer: CharacterCard | null;
    availableThemes: WeeklyTheme[];
    onUpdateWorkbench: (workbench: DesignerWorkbench) => void;
    onCreateWorkItem: (item: Omit<DesignerWorkItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const DesignerWorkbenchPanel: React.FC<DesignerWorkbenchPanelProps> = ({
    workbench,
    designer,
    availableThemes,
    onUpdateWorkbench,
    onCreateWorkItem,
}) => {
    const [isAddingWork, setIsAddingWork] = useState(false);
    const [newWorkItem, setNewWorkItem] = useState<Partial<DesignerWorkItem>>({
        weekNumber: (workbench?.currentWeek || 0) + 1,
        theme: null,
        notes: '',
        priority: 'medium',
        status: 'planned',
    });

    const handleAddWork = () => {
        if (!newWorkItem.weekNumber) {
            alert('请输入周数！');
            return;
        }

        onCreateWorkItem({
            weekNumber: newWorkItem.weekNumber,
            theme: newWorkItem.theme || null,
            notes: newWorkItem.notes || '',
            priority: newWorkItem.priority || 'medium',
            status: newWorkItem.status || 'planned',
        });

        setIsAddingWork(false);
        setNewWorkItem({
            weekNumber: (workbench?.currentWeek || 0) + 1,
            theme: null,
            notes: '',
            priority: 'medium',
            status: 'planned',
        });
    };

    const getPriorityColor = (priority: DesignerWorkItem['priority']) => {
        switch (priority) {
            case 'high':
                return 'text-red-400 bg-red-500/20';
            case 'medium':
                return 'text-yellow-400 bg-yellow-500/20';
            case 'low':
                return 'text-blue-400 bg-blue-500/20';
        }
    };

    const getStatusColor = (status: DesignerWorkItem['status']) => {
        switch (status) {
            case 'completed':
                return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'in_progress':
                return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
            case 'planned':
                return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };

    const getStatusText = (status: DesignerWorkItem['status']) => {
        switch (status) {
            case 'completed':
                return '✅ 已完成';
            case 'in_progress':
                return '⚙️ 进行中';
            case 'planned':
                return '📋 已规划';
        }
    };

    const updateWorkItemStatus = (itemId: string, newStatus: DesignerWorkItem['status']) => {
        if (!workbench) return;

        const updatedItems = workbench.workItems.map(item =>
            item.id === itemId
                ? { ...item, status: newStatus, updatedAt: Date.now() }
                : item
        );

        onUpdateWorkbench({
            ...workbench,
            workItems: updatedItems,
        });
    };

    const deleteWorkItem = (itemId: string) => {
        if (!workbench) return;
        if (!confirm('确定要删除这个工作项吗？')) return;

        const updatedItems = workbench.workItems.filter(item => item.id !== itemId);

        onUpdateWorkbench({
            ...workbench,
            workItems: updatedItems,
            totalWeeksPlanned: updatedItems.length,
        });
    };

    if (!designer) {
        return (
            <div className="text-center py-8">
                <div className="text-5xl mb-3">👤</div>
                <p className="text-gray-400">请先指派礼仪设计师</p>
            </div>
        );
    }

    if (!workbench) {
        return (
            <div className="text-center py-8">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-400">工作栏未初始化</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* 设计师信息 */}
            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-stone-700 flex items-center justify-center text-2xl">
                        {designer.gender === 'Female' ? '👩' : '👨'}
                    </div>
                    <div>
                        <h4 className="font-bold text-white">{designer.name}</h4>
                        <p className="text-xs text-gray-400">礼仪设计师</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-stone-800/50 rounded">
                        <p className="text-xs text-gray-400">当前周数</p>
                        <p className="text-lg font-bold text-pink-300">第 {workbench.currentWeek} 周</p>
                    </div>
                    <div className="p-2 bg-stone-800/50 rounded">
                        <p className="text-xs text-gray-400">已规划周数</p>
                        <p className="text-lg font-bold text-purple-300">{workbench.totalWeeksPlanned} 周</p>
                    </div>
                </div>
            </div>

            {/* 工作项列表 */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-cyan-300">主题规划工作栏</h4>
                    <button
                        onClick={() => setIsAddingWork(true)}
                        className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-500/40 border border-purple-500/50 rounded text-purple-300 hover:text-purple-200 transition-colors text-sm"
                    >
                        <i className="fa-solid fa-plus mr-1"></i>添加规划
                    </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-xianxia">
                    {workbench.workItems
                        .sort((a, b) => a.weekNumber - b.weekNumber)
                        .map((item) => (
                            <div
                                key={item.id}
                                className={`p-4 rounded-lg border-2 ${getStatusColor(item.status)} transition-all`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-stone-800/50 rounded font-mono text-sm text-white">
                                            第 {item.weekNumber} 周
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority)}`}>
                                            {item.priority === 'high' ? '⚠️ 高优先级' : item.priority === 'medium' ? '📍 中优先级' : '💡 低优先级'}
                                        </span>
                                        <span className="px-2 py-1 rounded text-xs bg-stone-700/50 text-gray-300">
                                            {getStatusText(item.status)}
                                        </span>
                                    </div>
                                </div>

                                {item.theme ? (
                                    <div className="mb-3 p-3 bg-stone-900/50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">{item.theme.icon}</span>
                                            <h5 className="font-bold text-pink-300">{item.theme.name}</h5>
                                        </div>
                                        <p className="text-sm text-gray-400">{item.theme.description}</p>
                                        <div className="flex gap-2 mt-2 text-xs">
                                            <span className="text-pink-300">羞耻+{item.theme.themeSettings.shameBonus}%</span>
                                            <span className="text-purple-300">服从+{item.theme.themeSettings.submissionBonus}%</span>
                                            <span className="text-red-300">露出+{item.theme.themeSettings.exposureBonus}%</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3 p-3 bg-stone-900/30 rounded-lg border-2 border-dashed border-stone-600">
                                        <p className="text-sm text-gray-500 text-center">尚未指定主题</p>
                                    </div>
                                )}

                                {item.notes && (
                                    <div className="mb-3 p-2 bg-stone-800/30 rounded">
                                        <p className="text-xs text-gray-400 mb-1">设计笔记:</p>
                                        <p className="text-sm text-gray-300">{item.notes}</p>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2 border-t border-stone-700/50">
                                    {item.status === 'planned' && (
                                        <button
                                            onClick={() => updateWorkItemStatus(item.id, 'in_progress')}
                                            className="px-3 py-1 text-xs bg-cyan-600/30 hover:bg-cyan-500/40 rounded text-cyan-300 transition-colors"
                                        >
                                            开始执行
                                        </button>
                                    )}
                                    {item.status === 'in_progress' && (
                                        <button
                                            onClick={() => updateWorkItemStatus(item.id, 'completed')}
                                            className="px-3 py-1 text-xs bg-green-600/30 hover:bg-green-500/40 rounded text-green-300 transition-colors"
                                        >
                                            标记完成
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteWorkItem(item.id)}
                                        className="px-3 py-1 text-xs bg-red-900/30 hover:bg-red-800/40 rounded text-red-300 transition-colors"
                                    >
                                        删除
                                    </button>
                                </div>
                            </div>
                        ))}

                    {workbench.workItems.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-5xl mb-3">📝</div>
                            <p>暂无工作规划</p>
                            <p className="text-sm mt-2">点击"添加规划"开始设计主题周</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 添加工作项弹窗 */}
            {isAddingWork && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsAddingWork(false)}>
                    <div className="bg-stone-900 border-2 border-purple-500 rounded-xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-purple-300 mb-4">添加主题规划</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">计划周数</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newWorkItem.weekNumber}
                                    onChange={(e) => setNewWorkItem({ ...newWorkItem, weekNumber: Number(e.target.value) })}
                                    className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="第几周"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">选择主题（可选）</label>
                                <select
                                    value={newWorkItem.theme?.id || ''}
                                    onChange={(e) => {
                                        const selectedTheme = availableThemes.find(t => t.id === e.target.value);
                                        setNewWorkItem({ ...newWorkItem, theme: selectedTheme || null });
                                    }}
                                    className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded text-white focus:border-purple-500 focus:outline-none"
                                >
                                    <option value="">暂不指定</option>
                                    {availableThemes.map(theme => (
                                        <option key={theme.id} value={theme.id}>
                                            {theme.icon} {theme.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">优先级</label>
                                <select
                                    value={newWorkItem.priority}
                                    onChange={(e) => setNewWorkItem({ ...newWorkItem, priority: e.target.value as any })}
                                    className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded text-white focus:border-purple-500 focus:outline-none"
                                >
                                    <option value="low">💡 低优先级</option>
                                    <option value="medium">📍 中优先级</option>
                                    <option value="high">⚠️ 高优先级</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">设计笔记</label>
                                <textarea
                                    value={newWorkItem.notes}
                                    onChange={(e) => setNewWorkItem({ ...newWorkItem, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded text-white focus:border-purple-500 focus:outline-none resize-none"
                                    rows={3}
                                    placeholder="记录设计灵感和想法..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleAddWork}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded text-white font-semibold transition-all"
                                >
                                    添加到工作栏
                                </button>
                                <button
                                    onClick={() => setIsAddingWork(false)}
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

export default DesignerWorkbenchPanel;