
import React, { useState } from 'react';
import { saveSummaryToWorldbook } from '../services/tavernService';
import { GameState, MemoryCategory, MemoryCollection, MemorySummaryCollection, SummarySettings, VectorConfig } from '../types';
import MemoryEntryCard from './MemoryEntryCard';
import { SemanticSearchPanel } from './SemanticSearchPanel';
import SummarySettingsModal from './SummarySettingsModal';
import VectorizeManagementModal from './VectorizeManagementModal';
import WorldbookExportModal from './WorldbookExportModal';

interface MemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    memories: MemoryCollection;
    memorySummaries: MemorySummaryCollection;
    summarySettings: SummarySettings;
    onClearCategory: (category: MemoryCategory) => void;
    onDeleteEntry: (category: MemoryCategory, entryId: string) => void;
    onDeleteSummary: (category: MemoryCategory, summaryId: string, summaryType: 'small' | 'large') => void;
    onManualSummary: (category: MemoryCategory, startIndex: number, endIndex: number, summaryType: 'small' | 'large') => void;
    onUpdateSettings: (settings: SummarySettings) => void;
    onSaveToWorldbook?: (category: MemoryCategory, summaryId: string, summaryType: 'small' | 'large') => void;
    gameState?: GameState;
    onVectorConfigSave?: (config: VectorConfig) => void;
}

type ViewMode = 'realtime' | 'small-summary' | 'large-summary';

const MemoryModal: React.FC<MemoryModalProps> = ({
    isOpen,
    onClose,
    memories,
    memorySummaries,
    summarySettings,
    onClearCategory,
    onDeleteEntry,
    onDeleteSummary,
    onManualSummary,
    onUpdateSettings,
    gameState,
    onVectorConfigSave,
}) => {
    const [activeCategory, setActiveCategory] = useState<MemoryCategory>('探索');
    const [viewMode, setViewMode] = useState<ViewMode>('realtime');
    const [showSettings, setShowSettings] = useState(false);
    const [showManualSummary, setShowManualSummary] = useState(false);
    const [manualSummaryStart, setManualSummaryStart] = useState(1);
    const [manualSummaryEnd, setManualSummaryEnd] = useState(1);
    const [manualSummaryType, setManualSummaryType] = useState<'small' | 'large'>('small');
    const [savingToWorldbook, setSavingToWorldbook] = useState<string | null>(null);
    const [showSemanticSearch, setShowSemanticSearch] = useState(false);
    const [showVectorizeManagement, setShowVectorizeManagement] = useState(false);
    const [showWorldbookExport, setShowWorldbookExport] = useState(false);

    if (!isOpen) return null;

    const categories: MemoryCategory[] = ['探索', '战斗', '商城', '医馆', '悬赏', '培育', '商业', '声望', '公告', '大牢', '其他'];
    const currentMemories = memories[activeCategory];
    const currentSmallSummaries = memorySummaries[activeCategory].small;
    const currentLargeSummaries = memorySummaries[activeCategory].large;

    const getCategoryIcon = (category: MemoryCategory): string => {
        const icons: Record<MemoryCategory, string> = {
            探索: 'fa-map-location-dot',
            战斗: 'fa-crossed-swords',
            商城: 'fa-store',
            医馆: 'fa-stethoscope',
            悬赏: 'fa-book-skull',
            培育: 'fa-dna',
            商业: 'fa-building',
            声望: 'fa-star',
            公告: 'fa-bullhorn',
            大牢: 'fa-dungeon',
            其他: 'fa-ellipsis',
        };
        return icons[category];
    };

    const handleClearCategory = () => {
        if (confirm(`确定要清空【${activeCategory}】类别的所有实时记忆吗？`)) {
            onClearCategory(activeCategory);
        }
    };

    const handleOpenManualSummary = () => {
        const targetArray = viewMode === 'realtime' ? currentMemories : currentSmallSummaries;
        if (targetArray.length === 0) {
            alert('当前类别没有内容可以总结');
            return;
        }
        setManualSummaryStart(1);
        setManualSummaryEnd(targetArray.length);
        setManualSummaryType(viewMode === 'realtime' ? 'small' : 'large');
        setShowManualSummary(true);
    };

    const handleConfirmManualSummary = () => {
        const targetArray = viewMode === 'realtime' ? currentMemories : currentSmallSummaries;
        if (manualSummaryStart < 1 || manualSummaryEnd > targetArray.length || manualSummaryStart > manualSummaryEnd) {
            alert('请输入有效的范围');
            return;
        }
        onManualSummary(activeCategory, manualSummaryStart - 1, manualSummaryEnd - 1, manualSummaryType);
        setShowManualSummary(false);
    };

    const handleSaveToWorldbook = async (summaryId: string, summaryType: 'small' | 'large') => {
        const summaries = summaryType === 'small' ? currentSmallSummaries : currentLargeSummaries;
        const summary = summaries.find(s => s.id === summaryId);

        if (!summary) {
            alert('未找到要保存的总结');
            return;
        }

        setSavingToWorldbook(summaryId);
        try {
            const success = await saveSummaryToWorldbook(
                { title: summary.title, content: summary.content },
                activeCategory,
                summaryType
            );

            if (success) {
                alert('已成功保存到世界书【仙侠卡牌RPG记忆库】！');
            } else {
                alert('保存失败，请查看控制台获取详细信息');
            }
        } catch (error) {
            console.error('保存到世界书时出错:', error);
            alert('保存失败：' + (error as Error).message);
        } finally {
            setSavingToWorldbook(null);
        }
    };

    const renderRealtimeMemories = () => (
        <div className="space-y-4">
            {currentMemories.map((entry, index) => (
                <MemoryEntryCard
                    key={entry.id}
                    entry={entry}
                    index={index}
                    activeCategory={activeCategory}
                    onDeleteEntry={onDeleteEntry}
                />
            ))}
        </div>
    );

    const renderSummaries = (summaries: typeof currentSmallSummaries, type: 'small' | 'large') => (
        <div className="space-y-4">
            {summaries.map((summary, index) => (
                <div
                    key={summary.id}
                    className="glass-morphism p-5 rounded-lg border border-purple-700/50 hover:border-purple-500/50 transition-all duration-300 group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 ${type === 'small' ? 'bg-gradient-to-r from-purple-600/20 to-purple-700/20 text-purple-300 border-purple-600/30' : 'bg-gradient-to-r from-indigo-600/20 to-indigo-700/20 text-indigo-300 border-indigo-600/30'} text-xs rounded-full border`}>
                                    {type === 'small' ? '小总结' : '大总结'} #{index + 1}
                                </span>
                                <span className="text-xs text-gray-400">
                                    基于记忆 {summary.startIndex + 1} - {summary.endIndex + 1}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <i className="fa-solid fa-clock"></i>
                                {summary.timestamp}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleSaveToWorldbook(summary.id, type)}
                                disabled={savingToWorldbook === summary.id}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-400 hover:text-blue-300 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="保存到世界书"
                            >
                                {savingToWorldbook === summary.id ? (
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                ) : (
                                    <i className="fa-solid fa-book-bookmark"></i>
                                )}
                            </button>
                            <button
                                onClick={() => onDeleteSummary(activeCategory, summary.id, type)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-400 hover:text-red-300 p-2"
                                title="删除此总结"
                            >
                                <i className="fa-solid fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-4 rounded border border-purple-700/30">
                        {summary.content}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderContent = () => {
        if (viewMode === 'realtime') {
            return currentMemories.length > 0 ? renderRealtimeMemories() : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <i className={`fa-solid ${getCategoryIcon(activeCategory)} text-6xl mb-4 opacity-30`}></i>
                    <p className="text-lg">此类别暂无记忆</p>
                    <p className="text-sm mt-2">在游戏中的各种活动会自动记录在这里</p>
                </div>
            );
        } else if (viewMode === 'small-summary') {
            return currentSmallSummaries.length > 0 ? renderSummaries(currentSmallSummaries, 'small') : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <i className="fa-solid fa-layer-group text-6xl mb-4 opacity-30"></i>
                    <p className="text-lg">暂无小总结</p>
                    <p className="text-sm mt-2">
                        {summarySettings.autoSummaryEnabled
                            ? `每 ${summarySettings.smallSummaryInterval} 条记忆会自动生成小总结`
                            : '请在设置中开启自动总结，或使用手动总结功能'}
                    </p>
                </div>
            );
        } else {
            return currentLargeSummaries.length > 0 ? renderSummaries(currentLargeSummaries, 'large') : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <i className="fa-solid fa-book text-6xl mb-4 opacity-30"></i>
                    <p className="text-lg">暂无大总结</p>
                    <p className="text-sm mt-2">
                        {summarySettings.autoSummaryEnabled
                            ? `每 ${summarySettings.largeSummaryInterval} 条小总结会自动生成大总结`
                            : '请在设置中开启自动总结，或使用手动总结功能'}
                    </p>
                </div>
            );
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
                onClick={onClose}
            >
                <div
                    className="ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />

                    {/* 标题栏 */}
                    <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20 border-b border-stone-700/50">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-book-open text-2xl text-gradient-gold"></i>
                            <h2 className="text-2xl font-bold text-gradient-gold text-shadow-glow font-serif">记忆宝鉴</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowWorldbookExport(true)}
                                className="px-4 py-2 bg-gradient-to-r from-xianxia-gold-600/80 to-xianxia-gold-700/80 hover:from-xianxia-gold-500/90 hover:to-xianxia-gold-600/90 text-white text-sm rounded-lg transition-all duration-300 active:scale-95 border border-xianxia-gold-500/50 flex items-center gap-2"
                                title="批量导出到世界书"
                            >
                                <i className="fa-solid fa-book-bookmark"></i>
                                <span>导出世界书</span>
                            </button>
                            <button
                                onClick={() => setShowVectorizeManagement(true)}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-600/80 to-indigo-700/80 hover:from-indigo-500/90 hover:to-indigo-600/90 text-white text-sm rounded-lg transition-all duration-300 active:scale-95 border border-indigo-500/50 flex items-center gap-2"
                                title="管理向量化记忆"
                            >
                                <i className="fa-solid fa-vector-square"></i>
                                <span>向量化</span>
                            </button>
                            <button
                                onClick={() => setShowSemanticSearch(true)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-500/90 hover:to-purple-600/90 text-white text-sm rounded-lg transition-all duration-300 active:scale-95 border border-purple-500/50 flex items-center gap-2"
                            >
                                <i className="fa-solid fa-brain"></i>
                                <span>语义搜索</span>
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-500/90 hover:to-blue-600/90 text-white text-sm rounded-lg transition-all duration-300 active:scale-95 border border-blue-500/50 flex items-center gap-2"
                            >
                                <i className="fa-solid fa-cog"></i>
                                <span>总结设置</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-stone-700/50 hover:bg-stone-600/50 border border-stone-600 hover:border-xianxia-gold-500 text-gray-400 hover:text-xianxia-gold-400 transition-all duration-200 flex items-center justify-center group"
                            >
                                <i className="fa-solid fa-times text-xl group-hover:rotate-90 transition-transform duration-200"></i>
                            </button>
                        </div>
                    </div>

                    {/* 分类标签栏 */}
                    <div className="flex-shrink-0 px-4 py-2 flex space-x-2 border-b border-stone-700 overflow-x-auto scrollbar-xianxia bg-black/10">
                        {categories.map(category => {
                            const count = memories[category].length;
                            return (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${activeCategory === category
                                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-glow-gold'
                                        : 'bg-transparent text-gray-400 hover:bg-stone-700/50 hover:text-amber-300'
                                        }`}
                                >
                                    <i className={`fa-solid ${getCategoryIcon(category)}`}></i>
                                    <span>{category}</span>
                                    {count > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-amber-600/30 text-amber-300 text-xs rounded-full">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 视图模式标签栏 */}
                    <div className="flex-shrink-0 px-4 py-2 flex space-x-2 border-b border-stone-700/50 bg-black/10">
                        <button
                            onClick={() => setViewMode('realtime')}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${viewMode === 'realtime'
                                ? 'bg-gradient-to-r from-amber-600/40 to-amber-700/40 text-amber-300 border border-amber-500/50'
                                : 'bg-stone-700/30 text-gray-400 hover:bg-stone-700/50 hover:text-amber-300'
                                }`}
                        >
                            <i className="fa-solid fa-stream"></i>
                            <span>实时记录</span>
                            <span className="px-2 py-0.5 bg-black/30 text-xs rounded-full">
                                {currentMemories.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setViewMode('small-summary')}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${viewMode === 'small-summary'
                                ? 'bg-gradient-to-r from-purple-600/40 to-purple-700/40 text-purple-300 border border-purple-500/50'
                                : 'bg-stone-700/30 text-gray-400 hover:bg-stone-700/50 hover:text-purple-300'
                                }`}
                        >
                            <i className="fa-solid fa-layer-group"></i>
                            <span>小总结</span>
                            <span className="px-2 py-0.5 bg-black/30 text-xs rounded-full">
                                {currentSmallSummaries.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setViewMode('large-summary')}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${viewMode === 'large-summary'
                                ? 'bg-gradient-to-r from-indigo-600/40 to-indigo-700/40 text-indigo-300 border border-indigo-500/50'
                                : 'bg-stone-700/30 text-gray-400 hover:bg-stone-700/50 hover:text-indigo-300'
                                }`}
                        >
                            <i className="fa-solid fa-book"></i>
                            <span>大总结</span>
                            <span className="px-2 py-0.5 bg-black/30 text-xs rounded-full">
                                {currentLargeSummaries.length}
                            </span>
                        </button>
                    </div>

                    {/* 内容区 */}
                    <div className="flex-grow overflow-y-auto scrollbar-xianxia p-6">
                        {renderContent()}
                    </div>

                    {/* 底部操作栏 */}
                    <div className="flex-shrink-0 p-4 border-t border-stone-700/50 bg-black/20">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {viewMode === 'realtime' && (
                                    <>
                                        <span className="text-sm text-gray-400">
                                            共 {currentMemories.length} 条记忆
                                        </span>
                                        {summarySettings.autoSummaryEnabled && (
                                            <span className="text-xs text-purple-400">
                                                每 {summarySettings.smallSummaryInterval} 条自动总结
                                            </span>
                                        )}
                                    </>
                                )}
                                {viewMode === 'small-summary' && (
                                    <span className="text-sm text-purple-400">
                                        共 {currentSmallSummaries.length} 条小总结
                                    </span>
                                )}
                                {viewMode === 'large-summary' && (
                                    <span className="text-sm text-indigo-400">
                                        共 {currentLargeSummaries.length} 条大总结
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {(viewMode === 'realtime' || viewMode === 'small-summary') && (
                                    <button
                                        onClick={handleOpenManualSummary}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-500/90 hover:to-purple-600/90 text-white text-sm rounded-lg transition-all duration-300 active:scale-95 border border-purple-500/50 flex items-center gap-2"
                                    >
                                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                                        <span>手动总结</span>
                                    </button>
                                )}
                                {viewMode === 'realtime' && currentMemories.length > 0 && (
                                    <button
                                        onClick={handleClearCategory}
                                        className="px-4 py-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-500/90 hover:to-red-600/90 text-white text-sm rounded-lg transition-all duration-300 active:scale-95 border border-red-500/50"
                                    >
                                        <i className="fa-solid fa-broom mr-2"></i>
                                        清空此类别
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />
                </div>
            </div>

            {/* 总结设置模态框 */}
            {showSettings && (
                <SummarySettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    settings={summarySettings}
                    onSave={onUpdateSettings}
                    gameState={gameState}
                    onVectorConfigSave={onVectorConfigSave}
                />
            )}

            {/* 向量化管理模态框 */}
            {showVectorizeManagement && gameState && (
                <VectorizeManagementModal
                    isOpen={showVectorizeManagement}
                    onClose={() => setShowVectorizeManagement(false)}
                    category={activeCategory}
                    realtimeMemories={currentMemories}
                    smallSummaries={currentSmallSummaries}
                    largeSummaries={currentLargeSummaries}
                    vectorConfig={gameState.vectorConfig}
                />
            )}

            {/* 语义搜索面板 */}
            {showSemanticSearch && gameState && (
                <SemanticSearchPanel
                    isOpen={showSemanticSearch}
                    onClose={() => setShowSemanticSearch(false)}
                    gameState={gameState}
                    onSaveThreshold={(threshold) => {
                        if (onVectorConfigSave) {
                            onVectorConfigSave({
                                ...gameState.vectorConfig,
                                similarityThreshold: threshold
                            });
                        }
                    }}
                />
            )}

            {/* 批量导出世界书模态框 */}
            {showWorldbookExport && (
                <WorldbookExportModal
                    isOpen={showWorldbookExport}
                    onClose={() => setShowWorldbookExport(false)}
                    memories={memories}
                    memorySummaries={memorySummaries}
                />
            )}

            {/* 手动总结模态框 */}
            {showManualSummary && (
                <div
                    className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
                    onClick={() => setShowManualSummary(false)}
                >
                    <div
                        className="bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 rounded-xl p-6 max-w-md w-full border border-purple-500/50 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            手动生成总结
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">总结类型</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setManualSummaryType('small')}
                                        disabled={viewMode !== 'realtime'}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${manualSummaryType === 'small'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-stone-700/50 text-gray-400 hover:bg-stone-700'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        小总结
                                    </button>
                                    <button
                                        onClick={() => setManualSummaryType('large')}
                                        disabled={viewMode === 'large-summary'}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${manualSummaryType === 'large'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-stone-700/50 text-gray-400 hover:bg-stone-700'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        大总结
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    范围 (共 {viewMode === 'realtime' ? currentMemories.length : currentSmallSummaries.length} 条)
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500">从第</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={viewMode === 'realtime' ? currentMemories.length : currentSmallSummaries.length}
                                            value={manualSummaryStart}
                                            onChange={(e) => setManualSummaryStart(Math.max(1, Math.min(viewMode === 'realtime' ? currentMemories.length : currentSmallSummaries.length, parseInt(e.target.value) || 1)))}
                                            className="w-full mt-1 px-3 py-2 bg-stone-700/50 border border-stone-600 rounded text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <span className="text-gray-500 mt-5">-</span>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500">到第</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={viewMode === 'realtime' ? currentMemories.length : currentSmallSummaries.length}
                                            value={manualSummaryEnd}
                                            onChange={(e) => setManualSummaryEnd(Math.max(1, Math.min(viewMode === 'realtime' ? currentMemories.length : currentSmallSummaries.length, parseInt(e.target.value) || 1)))}
                                            className="w-full mt-1 px-3 py-2 bg-stone-700/50 border border-stone-600 rounded text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <span className="text-gray-500 mt-5">条</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setShowManualSummary(false)}
                                    className="flex-1 px-4 py-2 bg-stone-700/50 hover:bg-stone-700 text-gray-300 rounded-lg transition-all"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleConfirmManualSummary}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-check"></i>
                                    生成总结
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MemoryModal;
<i className="fa-solid fa-robot mr-1"></i>
