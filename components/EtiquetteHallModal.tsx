import React, { useMemo, useState } from 'react';
import { refreshEtiquettes } from '../services/etiquetteGenerationService';
import { CharacterCard, GameState } from '../types';
import {
    BehaviorDressEtiquette,
    DesignerWorkItem,
    EtiquetteDistribution,
    EtiquetteScene,
    EtiquetteSystem,
    LanguageEtiquette,
    SCENE_NAMES,
    SCENE_POSITIONS,
    SCENE_TO_SHOP_TYPE,
    WeeklyTheme
} from '../types/etiquette';
import DesignerWorkbenchPanel from './DesignerWorkbenchPanel';
import EtiquetteSettingsModal from './EtiquetteSettingsModal';
import WeeklyThemePanel from './WeeklyThemePanel';
import { getRarityBorderColor, getRarityTextColor } from './rarityHelpers';

interface EtiquetteHallModalProps {
    isOpen: boolean;
    onClose: () => void;
    etiquetteSystem: EtiquetteSystem;
    onUpdateEtiquetteSystem: (system: EtiquetteSystem) => void;
    cardCollection: CharacterCard[];
    onOpenDesignerSelection: () => void;
    gameState?: GameState;
}

type ContentTab = 'language' | 'behavior_dress' | 'theme' | 'workbench';

// 空状态组件
const EmptyState: React.FC<{ type: 'language' | 'behavior_dress' }> = ({ type }) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-5xl mb-4">{type === 'language' ? '💬' : '👗'}</div>
        <p className="text-lg mb-2">暂无{type === 'language' ? '语言' : '行为着装'}铁律</p>
        <p className="text-sm">请指派设计师并刷新礼仪，或手动添加</p>
    </div>
);

// 语言铁律卡片组件
const LanguageEtiquetteCard: React.FC<{
    etiquette: LanguageEtiquette;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onDeprecate: () => void;
    onDistribute: () => void;
    onRecall: () => void;
}> = ({ etiquette, isExpanded, onToggleExpand, onDeprecate, onDistribute, onRecall }) => {
    const statusColors = {
        active: 'text-green-400 bg-green-500/20',
        pending: 'text-yellow-400 bg-yellow-500/20',
        deprecated: 'text-gray-500 bg-gray-500/20',
    };

    return (
        <div className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 ${etiquette.status === 'active'
            ? 'border-pink-500/30 bg-stone-800/50 hover:border-pink-500/50'
            : 'border-stone-700/50 bg-stone-800/30 opacity-60'
            }`}>
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-pink-400 font-mono text-xs">#{etiquette.id}</span>
                        <h4 className="font-bold text-white text-sm sm:text-base">{etiquette.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[etiquette.status]}`}>
                            {etiquette.status === 'active' ? '✅ 生效中' : etiquette.status === 'pending' ? '⏳ 待下发' : '❌ 已废除'}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-gray-400 mb-2">
                        <span className="px-1.5 py-0.5 sm:px-2 bg-stone-700/50 rounded text-xs">📍 {SCENE_NAMES[etiquette.scene]}</span>
                        <span className="px-1.5 py-0.5 sm:px-2 bg-stone-700/50 rounded text-xs hidden sm:inline">👥 {etiquette.applicableRoles.join(', ')}</span>
                        <span className="px-1.5 py-0.5 sm:px-2 bg-stone-700/50 rounded text-xs">📊 {etiquette.executionCount}次</span>
                    </div>
                    <p className={`text-gray-300 text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>{etiquette.content}</p>
                    {isExpanded && etiquette.examples && etiquette.examples.length > 0 && (
                        <div className="mt-3 p-3 bg-stone-900/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-2">示例用语:</p>
                            <ul className="space-y-1">
                                {etiquette.examples.map((example, idx) => (
                                    <li key={idx} className="text-sm text-pink-300 italic">"{example}"</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            {/* 分发状态显示 */}
            {etiquette.isDistributed && etiquette.distributions && etiquette.distributions.length > 0 && (
                <div className="mt-2 p-1.5 sm:p-2 bg-green-900/20 rounded border border-green-500/30">
                    <p className="text-xs text-green-400 mb-1">✅ 已分发</p>
                    <div className="flex flex-wrap gap-1">
                        {etiquette.distributions.filter(d => d.status === 'distributed').map((dist, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-green-500/20 text-green-300 rounded">
                                {dist.shopType}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 pt-3 border-t border-stone-700/50 gap-2">
                <button onClick={onToggleExpand} className="text-xs text-gray-400 hover:text-gray-300 transition-colors min-h-[44px] sm:min-h-0 flex items-center">
                    {isExpanded ? '收起 ▲' : '展开 ▼'}
                </button>
                <div className="flex gap-1 sm:gap-2 flex-wrap w-full sm:w-auto">
                    {!etiquette.isDistributed ? (
                        <button onClick={onDistribute} className="px-2 py-1.5 text-xs bg-green-600/30 hover:bg-green-500/40 rounded text-green-300 hover:text-green-200 transition-colors min-h-[44px] sm:min-h-0">📤 分发</button>
                    ) : (
                        <button onClick={onRecall} className="px-2 py-1.5 text-xs bg-orange-600/30 hover:bg-orange-500/40 rounded text-orange-300 hover:text-orange-200 transition-colors min-h-[44px] sm:min-h-0">📥 撤回</button>
                    )}
                    <button className="px-2 py-1.5 text-xs bg-stone-700/50 hover:bg-stone-600/50 rounded text-gray-300 hover:text-white transition-colors min-h-[44px] sm:min-h-0 hidden sm:inline-block">👁️ 预览</button>
                    <button className="px-2 py-1.5 text-xs bg-stone-700/50 hover:bg-stone-600/50 rounded text-gray-300 hover:text-white transition-colors min-h-[44px] sm:min-h-0 hidden sm:inline-block">✏️ 微调</button>
                    {etiquette.status === 'active' && !etiquette.isDistributed && (
                        <button onClick={onDeprecate} className="px-2 py-1.5 text-xs bg-red-900/30 hover:bg-red-800/40 rounded text-red-300 hover:text-red-200 transition-colors min-h-[44px] sm:min-h-0">🗑️ 废除</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// 行为着装铁律卡片组件
const BehaviorDressEtiquetteCard: React.FC<{
    etiquette: BehaviorDressEtiquette;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onDeprecate: () => void;
    onDistribute: () => void;
    onRecall: () => void;
}> = ({ etiquette, isExpanded, onToggleExpand, onDeprecate, onDistribute, onRecall }) => {
    const statusColors = {
        active: 'text-green-400 bg-green-500/20',
        pending: 'text-yellow-400 bg-yellow-500/20',
        deprecated: 'text-gray-500 bg-gray-500/20',
    };

    return (
        <div className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 ${etiquette.status === 'active'
            ? 'border-purple-500/30 bg-stone-800/50 hover:border-purple-500/50'
            : 'border-stone-700/50 bg-stone-800/30 opacity-60'
            }`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-purple-400 font-mono text-xs">#{etiquette.id}</span>
                    <h4 className="font-bold text-white text-sm sm:text-base">{etiquette.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[etiquette.status]}`}>
                        {etiquette.status === 'active' ? '✅ 生效中' : etiquette.status === 'pending' ? '⏳ 待下发' : '❌ 已废除'}
                    </span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-gray-400 mb-2">
                    <span className="px-1.5 py-0.5 sm:px-2 bg-stone-700/50 rounded text-xs">📍 {SCENE_NAMES[etiquette.scene]}</span>
                    <span className="px-1.5 py-0.5 sm:px-2 bg-stone-700/50 rounded text-xs hidden sm:inline">👥 {etiquette.applicableRoles.join(', ')}</span>
                    <span className="px-1.5 py-0.5 sm:px-2 bg-stone-700/50 rounded text-xs">📊 {etiquette.executionCount}次</span>
                </div>
                {/* 着装要求 */}
                <div className="mb-2">
                    <p className="text-xs text-purple-300 mb-1">👗 着装要求:</p>
                    <div className={`text-gray-300 text-sm space-y-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {etiquette.dressCode.upper && <p>• 上身: {etiquette.dressCode.upper}</p>}
                        {etiquette.dressCode.lower && <p>• 下身: {etiquette.dressCode.lower}</p>}
                        {etiquette.dressCode.accessories && etiquette.dressCode.accessories.length > 0 && (
                            <p>• 配饰: {etiquette.dressCode.accessories.join(', ')}</p>
                        )}
                        {etiquette.dressCode.special && <p>• 特殊: {etiquette.dressCode.special}</p>}
                    </div>
                </div>
                {/* 行为要求 */}
                {isExpanded && etiquette.behaviorRules.length > 0 && (
                    <div className="mt-3 p-3 bg-stone-900/50 rounded-lg">
                        <p className="text-xs text-purple-300 mb-2">🎭 行为要求:</p>
                        <ul className="space-y-1">
                            {etiquette.behaviorRules.map((rule, idx) => (
                                <li key={idx} className="text-sm text-gray-300">• {rule}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {/* 分发状态显示 */}
            {etiquette.isDistributed && etiquette.distributions && etiquette.distributions.length > 0 && (
                <div className="mt-2 p-2 bg-green-900/20 rounded border border-green-500/30">
                    <p className="text-xs text-green-400 mb-1">✅ 已分发到：</p>
                    <div className="flex flex-wrap gap-1">
                        {etiquette.distributions.filter(d => d.status === 'distributed').map((dist, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-green-500/20 text-green-300 rounded">
                                {dist.shopType}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 pt-3 border-t border-stone-700/50 gap-2">
                <button onClick={onToggleExpand} className="text-xs text-gray-400 hover:text-gray-300 transition-colors min-h-[44px] sm:min-h-0 flex items-center">
                    {isExpanded ? '收起 ▲' : '展开 ▼'}
                </button>
                <div className="flex gap-1 sm:gap-2 flex-wrap w-full sm:w-auto">
                    {!etiquette.isDistributed ? (
                        <button onClick={onDistribute} className="px-2 py-1.5 text-xs bg-green-600/30 hover:bg-green-500/40 rounded text-green-300 hover:text-green-200 transition-colors min-h-[44px] sm:min-h-0">📤 分发</button>
                    ) : (
                        <button onClick={onRecall} className="px-2 py-1.5 text-xs bg-orange-600/30 hover:bg-orange-500/40 rounded text-orange-300 hover:text-orange-200 transition-colors min-h-[44px] sm:min-h-0">📥 撤回</button>
                    )}
                    <button className="px-2 py-1.5 text-xs bg-stone-700/50 hover:bg-stone-600/50 rounded text-gray-300 hover:text-white transition-colors min-h-[44px] sm:min-h-0 hidden sm:inline-block">👁️ 预览</button>
                    <button className="px-2 py-1.5 text-xs bg-stone-700/50 hover:bg-stone-600/50 rounded text-gray-300 hover:text-white transition-colors min-h-[44px] sm:min-h-0 hidden sm:inline-block">✏️ 微调</button>
                    {etiquette.status === 'active' && !etiquette.isDistributed && (
                        <button onClick={onDeprecate} className="px-2 py-1.5 text-xs bg-red-900/30 hover:bg-red-800/40 rounded text-red-300 hover:text-red-200 transition-colors min-h-[44px] sm:min-h-0">🗑️ 废除</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// 主组件
const EtiquetteHallModal: React.FC<EtiquetteHallModalProps> = ({
    isOpen,
    onClose,
    etiquetteSystem,
    onUpdateEtiquetteSystem,
    cardCollection,
    onOpenDesignerSelection,
    gameState,
}) => {
    const [activeTab, setActiveTab] = useState<ContentTab>('theme');
    const [selectedScene, setSelectedScene] = useState<EtiquetteScene | 'all'>('all');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [expandedEtiquetteId, setExpandedEtiquetteId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const designerCard = useMemo(() => {
        if (!etiquetteSystem.designer) return null;
        return cardCollection.find(c => c.id === etiquetteSystem.designer?.characterId) || null;
    }, [etiquetteSystem.designer, cardCollection]);

    const nextRefreshInfo = useMemo(() => {
        if (!etiquetteSystem.designer || !etiquetteSystem.settings.autoRefreshEnabled) return null;
        const lastRefresh = etiquetteSystem.settings.lastRefreshTime || Date.now();
        const intervalMs = etiquetteSystem.settings.refreshIntervalDays * 24 * 60 * 60 * 1000;
        const nextRefresh = lastRefresh + intervalMs;
        const remaining = nextRefresh - Date.now();
        if (remaining <= 0) return { text: '可立即刷新', canRefresh: true };
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        return { text: `${days}天 ${hours}小时`, canRefresh: false };
    }, [etiquetteSystem.designer, etiquetteSystem.settings]);

    const filteredLanguageEtiquettes = useMemo(() => {
        if (selectedScene === 'all') return etiquetteSystem.languageEtiquettes;
        return etiquetteSystem.languageEtiquettes.filter(e => e.scene === selectedScene);
    }, [etiquetteSystem.languageEtiquettes, selectedScene]);

    const filteredBehaviorDressEtiquettes = useMemo(() => {
        if (selectedScene === 'all') return etiquetteSystem.behaviorDressEtiquettes;
        return etiquetteSystem.behaviorDressEtiquettes.filter(e => e.scene === selectedScene);
    }, [etiquetteSystem.behaviorDressEtiquettes, selectedScene]);

    const stats = useMemo(() => {
        const activeLanguage = etiquetteSystem.languageEtiquettes.filter(e => e.status === 'active').length;
        const activeBehavior = etiquetteSystem.behaviorDressEtiquettes.filter(e => e.status === 'active').length;
        return {
            totalActive: activeLanguage + activeBehavior,
            languageCount: etiquetteSystem.languageEtiquettes.length,
            behaviorCount: etiquetteSystem.behaviorDressEtiquettes.length,
        };
    }, [etiquetteSystem]);

    const handleManualRefresh = async () => {
        if (!etiquetteSystem.designer) {
            alert('请先指派礼仪设计师！');
            return;
        }

        if (isRefreshing) {
            return;
        }

        const confirmed = confirm(
            `即将生成新礼仪：\n` +
            `• 语言铁律: ${etiquetteSystem.settings.languageEtiquetteCount} 条\n` +
            `• 行为着装铁律: ${etiquetteSystem.settings.behaviorDressEtiquetteCount} 条\n\n` +
            `确定要刷新吗？`
        );

        if (!confirmed) return;

        setIsRefreshing(true);
        try {
            console.log('[礼仪馆] 开始刷新礼仪...');
            const updatedSystem = await refreshEtiquettes(etiquetteSystem, gameState);
            onUpdateEtiquetteSystem(updatedSystem);
            console.log('[礼仪馆] 礼仪刷新成功');
            alert(`✅ 礼仪刷新成功！\n\n` +
                `• 新增语言铁律: ${updatedSystem.languageEtiquettes.filter(e => e.status === 'active' && e.createdAt === updatedSystem.settings.lastRefreshTime).length} 条\n` +
                `• 新增行为着装铁律: ${updatedSystem.behaviorDressEtiquettes.filter(e => e.status === 'active' && e.createdAt === updatedSystem.settings.lastRefreshTime).length} 条`
            );
        } catch (error) {
            console.error('[礼仪馆] 礼仪刷新失败:', error);
            alert(`❌ 礼仪刷新失败：${error instanceof Error ? error.message : '未知错误'}\n\n请检查是否已正确配置AI生成服务。`);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleRemoveDesigner = () => {
        if (confirm('确定要移除当前设计师吗？')) {
            onUpdateEtiquetteSystem({ ...etiquetteSystem, designer: null });
        }
    };

    const handleDeprecateEtiquette = (etiquetteId: string, type: 'language' | 'behavior_dress') => {
        if (!confirm('确定要废除这条礼仪吗？')) return;
        if (type === 'language') {
            const updated = etiquetteSystem.languageEtiquettes.map(e =>
                e.id === etiquetteId ? { ...e, status: 'deprecated' as const, updatedAt: Date.now() } : e
            );
            onUpdateEtiquetteSystem({ ...etiquetteSystem, languageEtiquettes: updated });
        } else {
            const updated = etiquetteSystem.behaviorDressEtiquettes.map(e =>
                e.id === etiquetteId ? { ...e, status: 'deprecated' as const, updatedAt: Date.now() } : e
            );
            onUpdateEtiquetteSystem({ ...etiquetteSystem, behaviorDressEtiquettes: updated });
        }
    };

    // 分发礼仪到店铺
    const handleDistributeEtiquette = (etiquetteId: string, type: 'language' | 'behavior_dress') => {
        // 获取礼仪信息
        const etiquette = type === 'language'
            ? etiquetteSystem.languageEtiquettes.find(e => e.id === etiquetteId)
            : etiquetteSystem.behaviorDressEtiquettes.find(e => e.id === etiquetteId);

        if (!etiquette) return;

        // 根据场景获取对应的店铺类型
        const shopType = SCENE_TO_SHOP_TYPE[etiquette.scene];
        if (!shopType) {
            // 通用场景，需要选择分发到哪些店铺
            alert('通用礼仪需要手动选择分发目标，此功能正在开发中...');
            return;
        }

        // 获取该场景的岗位
        const positions = SCENE_POSITIONS[etiquette.scene] || [];
        const positionIds = positions.map(p => p.id);

        // 创建分发记录
        const distribution: EtiquetteDistribution = {
            shopType: shopType,
            positionIds: positionIds,
            distributedAt: Date.now(),
            distributedBy: etiquetteSystem.designer?.characterId,
            status: 'distributed',
        };

        // 更新礼仪
        if (type === 'language') {
            const updated = etiquetteSystem.languageEtiquettes.map(e =>
                e.id === etiquetteId ? {
                    ...e,
                    distributions: [...(e.distributions || []), distribution],
                    isDistributed: true,
                    updatedAt: Date.now()
                } : e
            );
            onUpdateEtiquetteSystem({ ...etiquetteSystem, languageEtiquettes: updated });
        } else {
            const updated = etiquetteSystem.behaviorDressEtiquettes.map(e =>
                e.id === etiquetteId ? {
                    ...e,
                    distributions: [...(e.distributions || []), distribution],
                    isDistributed: true,
                    updatedAt: Date.now()
                } : e
            );
            onUpdateEtiquetteSystem({ ...etiquetteSystem, behaviorDressEtiquettes: updated });
        }

        alert(`✅ 礼仪已分发到【${shopType}】！\n\n适用岗位：${positions.map(p => p.name).join('、') || '全部'}`);
    };

    // 撤回礼仪
    const handleRecallEtiquette = (etiquetteId: string, type: 'language' | 'behavior_dress') => {
        if (!confirm('确定要撤回这条礼仪吗？撤回后店铺将不再执行此礼仪。')) return;

        if (type === 'language') {
            const updated = etiquetteSystem.languageEtiquettes.map(e =>
                e.id === etiquetteId ? {
                    ...e,
                    distributions: (e.distributions || []).map(d => ({ ...d, status: 'recalled' as const, recalledAt: Date.now() })),
                    isDistributed: false,
                    updatedAt: Date.now()
                } : e
            );
            onUpdateEtiquetteSystem({ ...etiquetteSystem, languageEtiquettes: updated });
        } else {
            const updated = etiquetteSystem.behaviorDressEtiquettes.map(e =>
                e.id === etiquetteId ? {
                    ...e,
                    distributions: (e.distributions || []).map(d => ({ ...d, status: 'recalled' as const, recalledAt: Date.now() })),
                    isDistributed: false,
                    updatedAt: Date.now()
                } : e
            );
            onUpdateEtiquetteSystem({ ...etiquetteSystem, behaviorDressEtiquettes: updated });
        }

        alert('✅ 礼仪已撤回！');
    };

    // 主题周管理函数
    const handleCreateTheme = (theme: Omit<WeeklyTheme, 'id' | 'createdAt'>) => {
        const newTheme: WeeklyTheme = {
            ...theme,
            id: `theme_${Date.now()}`,
            createdAt: Date.now(),
            designedBy: etiquetteSystem.designer?.characterId,
        };

        onUpdateEtiquetteSystem({
            ...etiquetteSystem,
            weeklyThemes: [...etiquetteSystem.weeklyThemes, newTheme],
        });
    };

    const handleActivateTheme = (themeId: string) => {
        const theme = etiquetteSystem.weeklyThemes.find(t => t.id === themeId);
        if (!theme) return;

        // 将之前的active主题设为completed
        const updatedThemes = etiquetteSystem.weeklyThemes.map(t => {
            if (t.status === 'active') {
                return { ...t, status: 'completed' as const };
            }
            if (t.id === themeId) {
                return { ...t, status: 'active' as const, startTime: Date.now(), endTime: Date.now() + 7 * 24 * 60 * 60 * 1000 };
            }
            return t;
        });

        onUpdateEtiquetteSystem({
            ...etiquetteSystem,
            weeklyThemes: updatedThemes,
            currentTheme: { ...theme, status: 'active', startTime: Date.now(), endTime: Date.now() + 7 * 24 * 60 * 60 * 1000 },
        });
    };

    const handleDeleteTheme = (themeId: string) => {
        if (!confirm('确定要删除这个主题吗？')) return;

        const updatedThemes = etiquetteSystem.weeklyThemes.filter(t => t.id !== themeId);
        onUpdateEtiquetteSystem({
            ...etiquetteSystem,
            weeklyThemes: updatedThemes,
        });
    };

    // 工作栏管理函数
    const handleCreateWorkItem = (item: Omit<DesignerWorkItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!etiquetteSystem.designerWorkbench) return;

        const newItem: DesignerWorkItem = {
            ...item,
            id: `work_${Date.now()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        onUpdateEtiquetteSystem({
            ...etiquetteSystem,
            designerWorkbench: {
                ...etiquetteSystem.designerWorkbench,
                workItems: [...etiquetteSystem.designerWorkbench.workItems, newItem],
                totalWeeksPlanned: etiquetteSystem.designerWorkbench.totalWeeksPlanned + 1,
            },
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
                <div className="ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 w-full h-full sm:h-[90vh] sm:max-w-6xl sm:rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col animate-slide-in" onClick={(e) => e.stopPropagation()}>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
                    {/* 标题栏 */}
                    <div className="flex justify-between items-center p-3 sm:p-4 flex-shrink-0 bg-black/20 border-b border-stone-700/50">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <h2 className="text-lg sm:text-2xl font-bold text-gradient-gold text-shadow-glow font-serif tracking-widest">🎀 礼仪设计馆</h2>
                            <button onClick={() => setIsSettingsOpen(true)} className="px-2 py-1 sm:px-3 sm:py-1.5 bg-stone-700/50 hover:bg-stone-600/50 border border-stone-600 hover:border-pink-500/50 rounded-lg text-gray-300 hover:text-pink-300 transition-all duration-200 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                                <i className="fa-solid fa-gear"></i>设置
                            </button>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-700/50 hover:bg-stone-600/50 border border-stone-600 hover:border-xianxia-gold-500 text-gray-400 hover:text-xianxia-gold-400 transition-all duration-200 flex items-center justify-center group">
                            <i className="fa-solid fa-times text-xl group-hover:rotate-90 transition-transform duration-200"></i>
                        </button>
                    </div>
                    {/* 主内容区 */}
                    <div className="flex-grow flex flex-col sm:flex-row overflow-hidden">
                        {/* 左侧面板 */}
                        <div className="w-full sm:w-72 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-stone-700/50 flex flex-col bg-black/10 max-h-56 sm:max-h-none overflow-y-auto sm:overflow-y-visible">
                            {/* 设计师面板 */}
                            <div className="p-2 sm:p-4 border-b border-stone-700/50">
                                <h3 className="text-base sm:text-lg font-bold text-pink-300 mb-2 sm:mb-3 flex items-center gap-2"><i className="fa-solid fa-user-pen"></i>礼仪设计师</h3>
                                {designerCard ? (
                                    <div className={`p-2 sm:p-3 rounded-lg border-2 ${getRarityBorderColor(designerCard.rarity)} bg-stone-800/50`}>
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-700 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">{designerCard.gender === 'Female' ? '👩' : '👨'}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white truncate text-sm sm:text-base">{designerCard.name}</p>
                                                <p className={`text-xs ${getRarityTextColor(designerCard.rarity)}`}>{designerCard.realm}</p>
                                            </div>
                                        </div>
                                        {etiquetteSystem.designer && (
                                            <div className="mt-2 sm:mt-3 space-y-1 text-xs text-gray-400">
                                                <p className="truncate">📊 已设计: <span className="text-pink-300">{etiquetteSystem.designer.designCount}</span> 条</p>
                                                <p className="truncate hidden sm:block">⭐ 质量: <span className="ml-1 text-yellow-400">{'★'.repeat(Math.floor(etiquetteSystem.designer.qualityScore / 20))}{'☆'.repeat(5 - Math.floor(etiquetteSystem.designer.qualityScore / 20))}</span></p>
                                            </div>
                                        )}
                                        <div className="mt-2 sm:mt-3 flex gap-1 sm:gap-2">
                                            <button onClick={onOpenDesignerSelection} className="flex-1 px-2 py-1 sm:py-1.5 bg-stone-700/50 hover:bg-stone-600/50 border border-stone-600 rounded text-xs text-gray-300 hover:text-white transition-colors min-h-[44px] sm:min-h-0">🔄 更换</button>
                                            <button onClick={handleRemoveDesigner} className="flex-1 px-2 py-1 sm:py-1.5 bg-red-900/30 hover:bg-red-800/40 border border-red-700/50 rounded text-xs text-red-300 hover:text-red-200 transition-colors min-h-[44px] sm:min-h-0">❌ 移除</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-2 sm:p-4 rounded-lg border-2 border-dashed border-stone-600 bg-stone-800/30 text-center">
                                        <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">👤</div>
                                        <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">未指派设计师</p>
                                        <p className="text-yellow-500 text-xs mb-2 sm:mb-3 hidden sm:block">💡 自动刷新已暂停</p>
                                        <button onClick={onOpenDesignerSelection} className="w-full px-2 py-2 sm:px-3 bg-pink-600/30 hover:bg-pink-500/40 border border-pink-500/50 rounded-lg text-pink-300 hover:text-pink-200 transition-colors text-xs sm:text-sm min-h-[44px]">📋 选择设计师</button>
                                    </div>
                                )}
                            </div>
                            {/* 运行状态面板 - 移动端简化显示 */}
                            <div className="p-2 sm:p-4 flex-1 hidden sm:block">
                                <h3 className="text-base sm:text-lg font-bold text-cyan-300 mb-2 sm:mb-3 flex items-center gap-2"><i className="fa-solid fa-chart-line"></i>运行状态</h3>
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">系统状态:</span>
                                        {etiquetteSystem.designer ? (
                                            <span className="text-green-400 text-sm flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>运行中</span>
                                        ) : (
                                            <span className="text-red-400 text-sm flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full"></span>已暂停</span>
                                        )}
                                    </div>
                                    {nextRefreshInfo && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">下次刷新:</span>
                                            <span className="text-amber-300 text-sm">⏳ {nextRefreshInfo.text}</span>
                                        </div>
                                    )}
                                    <div className="mt-4 p-3 bg-stone-800/50 rounded-lg space-y-2">
                                        <p className="text-gray-300 text-sm">📜 当前生效礼仪: <span className="text-pink-300 font-bold">{stats.totalActive}</span> 条</p>
                                        <p className="text-gray-400 text-xs">• 语言铁律: {stats.languageCount} 条</p>
                                        <p className="text-gray-400 text-xs">• 行为着装铁律: {stats.behaviorCount} 条</p>
                                    </div>
                                    <div className="mt-3 sm:mt-4 space-y-2">
                                        <button
                                            onClick={handleManualRefresh}
                                            disabled={!etiquetteSystem.designer || isRefreshing}
                                            className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${etiquetteSystem.designer && !isRefreshing
                                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white'
                                                : 'bg-stone-700/50 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            <i className={`fa-solid ${isRefreshing ? 'fa-spinner fa-spin' : 'fa-rotate'}`}></i>
                                            {isRefreshing ? '生成中...' : '立即刷新所有礼仪'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 右侧内容区 */}
                        <div className="flex-1 flex flex-col overflow-hidden w-full">
                            <div className="flex-shrink-0 p-2 sm:p-4 border-b border-stone-700/50 bg-black/10">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <div className="flex gap-1 sm:gap-2 flex-wrap w-full sm:w-auto overflow-x-auto scrollbar-hide">
                                        <button onClick={() => setActiveTab('theme')} className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap min-h-[44px] sm:min-h-0 ${activeTab === 'theme' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-stone-700/30 text-gray-400 hover:text-gray-300 border border-transparent'}`}>🎭 主题</button>
                                        <button onClick={() => setActiveTab('workbench')} className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap min-h-[44px] sm:min-h-0 ${activeTab === 'workbench' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' : 'bg-stone-700/30 text-gray-400 hover:text-gray-300 border border-transparent'}`}>📋 工作</button>
                                        <button onClick={() => setActiveTab('language')} className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap min-h-[44px] sm:min-h-0 ${activeTab === 'language' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50' : 'bg-stone-700/30 text-gray-400 hover:text-gray-300 border border-transparent'}`}>💬 语言</button>
                                        <button onClick={() => setActiveTab('behavior_dress')} className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap min-h-[44px] sm:min-h-0 ${activeTab === 'behavior_dress' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-stone-700/30 text-gray-400 hover:text-gray-300 border border-transparent'}`}>👗 着装</button>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                                        <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">场景:</span>
                                        <select value={selectedScene} onChange={(e) => setSelectedScene(e.target.value as EtiquetteScene | 'all')} className="flex-1 sm:flex-none px-2 py-1.5 sm:px-3 bg-stone-700/50 border border-stone-600 rounded-lg text-gray-300 text-xs sm:text-sm focus:outline-none focus:border-pink-500/50 min-h-[44px] sm:min-h-0">
                                            <option value="all">全部</option>
                                            {Object.entries(SCENE_NAMES).map(([key, name]) => (<option key={key} value={key}>{name}</option>))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 scrollbar-xianxia">
                                {activeTab === 'theme' ? (
                                    <WeeklyThemePanel
                                        currentTheme={etiquetteSystem.currentTheme}
                                        allThemes={etiquetteSystem.weeklyThemes}
                                        onCreateTheme={handleCreateTheme}
                                        onActivateTheme={handleActivateTheme}
                                        onDeleteTheme={handleDeleteTheme}
                                    />
                                ) : activeTab === 'workbench' ? (
                                    <DesignerWorkbenchPanel
                                        workbench={etiquetteSystem.designerWorkbench}
                                        designer={designerCard}
                                        availableThemes={etiquetteSystem.weeklyThemes.filter(t => t.status === 'upcoming')}
                                        onUpdateWorkbench={(wb) => onUpdateEtiquetteSystem({ ...etiquetteSystem, designerWorkbench: wb })}
                                        onCreateWorkItem={handleCreateWorkItem}
                                    />
                                ) : activeTab === 'language' ? (
                                    filteredLanguageEtiquettes.length > 0 ? (
                                        filteredLanguageEtiquettes.map((etiquette) => (
                                            <LanguageEtiquetteCard
                                                key={etiquette.id}
                                                etiquette={etiquette}
                                                isExpanded={expandedEtiquetteId === etiquette.id}
                                                onToggleExpand={() => setExpandedEtiquetteId(expandedEtiquetteId === etiquette.id ? null : etiquette.id)}
                                                onDeprecate={() => handleDeprecateEtiquette(etiquette.id, 'language')}
                                                onDistribute={() => handleDistributeEtiquette(etiquette.id, 'language')}
                                                onRecall={() => handleRecallEtiquette(etiquette.id, 'language')}
                                            />
                                        ))
                                    ) : (<EmptyState type="language" />)
                                ) : (
                                    filteredBehaviorDressEtiquettes.length > 0 ? (
                                        filteredBehaviorDressEtiquettes.map((etiquette) => (
                                            <BehaviorDressEtiquetteCard
                                                key={etiquette.id}
                                                etiquette={etiquette}
                                                isExpanded={expandedEtiquetteId === etiquette.id}
                                                onToggleExpand={() => setExpandedEtiquetteId(expandedEtiquetteId === etiquette.id ? null : etiquette.id)}
                                                onDeprecate={() => handleDeprecateEtiquette(etiquette.id, 'behavior_dress')}
                                                onDistribute={() => handleDistributeEtiquette(etiquette.id, 'behavior_dress')}
                                                onRecall={() => handleRecallEtiquette(etiquette.id, 'behavior_dress')}
                                            />
                                        ))
                                    ) : (<EmptyState type="behavior_dress" />)
                                )}
                                <button className="w-full p-3 sm:p-4 border-2 border-dashed border-stone-600 hover:border-pink-500/50 rounded-lg text-gray-400 hover:text-pink-300 transition-colors flex items-center justify-center gap-2 min-h-[44px] text-xs sm:text-sm">
                                    <i className="fa-solid fa-plus"></i>{activeTab === 'language' ? '添加语言铁律' : '添加行为着装铁律'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
                </div>
            </div>
            <EtiquetteSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={etiquetteSystem.settings} onSave={(newSettings) => { onUpdateEtiquetteSystem({ ...etiquetteSystem, settings: newSettings }); setIsSettingsOpen(false); }} />
        </>
    );
};

export default EtiquetteHallModal;