import React, { useEffect, useState } from 'react';
import { contextMemoryRetriever } from '../services/contextMemoryRetriever';
import { semanticSearchService } from '../services/semanticSearchService';
import { vectorStorageService } from '../services/vectorStorageService';
import { GameState, MemoryCategory, SemanticSearchResult } from '../types';

interface SemanticSearchPanelProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    onSaveThreshold?: (threshold: number) => void;
}

export const SemanticSearchPanel: React.FC<SemanticSearchPanelProps> = ({
    isOpen,
    onClose,
    gameState,
    onSaveThreshold
}) => {
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<SemanticSearchResult[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<MemoryCategory[]>([]);
    const [useTimeDecay, setUseTimeDecay] = useState(true);
    const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
    const [thresholdInput, setThresholdInput] = useState('70');
    const [contextSearch, setContextSearch] = useState(false);
    const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
    const [searchTime, setSearchTime] = useState(0);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    const categories: MemoryCategory[] = [
        '探索', '战斗', '商城', '医馆', '悬赏', '培育', '商业', '声望', '公告', '其他'
    ];

    useEffect(() => {
        if (isOpen) {
            // 初始化IndexedDB
            vectorStorageService.initialize().catch(console.error);
            // 从gameState加载保存的阈值（如果存在）
            const savedThreshold = gameState.vectorConfig?.similarityThreshold || 0.7;
            setSimilarityThreshold(savedThreshold);
            setThresholdInput((savedThreshold * 100).toFixed(0));
        }
    }, [isOpen, gameState.vectorConfig]);

    // 处理阈值输入变化
    const handleThresholdInputChange = (value: string) => {
        setThresholdInput(value);
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
            setSimilarityThreshold(numValue / 100);
        }
    };

    // 保存阈值设置
    const handleSaveThreshold = () => {
        if (onSaveThreshold) {
            onSaveThreshold(similarityThreshold);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
        }
    };

    const handleSearch = async () => {
        if (!query.trim() && !contextSearch) {
            alert('请输入搜索内容或启用上下文搜索');
            return;
        }

        setSearching(true);
        setResults([]);
        const startTime = Date.now();

        try {
            let searchResults: SemanticSearchResult[];

            if (contextSearch) {
                // 上下文感知搜索
                const contextResult = await contextMemoryRetriever.retrieveRelevantMemories(
                    gameState,
                    query.trim() || undefined,
                    gameState.vectorConfig.maxResults
                );
                searchResults = contextResult.relevantMemories;
            } else {
                // 普通语义搜索
                searchResults = await semanticSearchService.search(query, {
                    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
                    minSimilarity: similarityThreshold,
                    maxResults: gameState.vectorConfig.maxResults,
                    useTimeDecay
                });
            }

            setResults(searchResults);
            setSearchTime(Date.now() - startTime);

        } catch (error) {
            alert('搜索失败: ' + (error instanceof Error ? error.message : '未知错误'));
            console.error('搜索错误:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleCategoryToggle = (category: MemoryCategory) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleResultExpansion = (memoryId: string) => {
        setExpandedResults(prev => {
            const next = new Set(prev);
            if (next.has(memoryId)) {
                next.delete(memoryId);
            } else {
                next.add(memoryId);
            }
            return next;
        });
    };

    const formatSimilarity = (similarity: number) => {
        const percentage = (similarity * 100).toFixed(1);
        let color = 'text-gray-400';
        if (similarity >= 0.9) color = 'text-green-400';
        else if (similarity >= 0.8) color = 'text-blue-400';
        else if (similarity >= 0.7) color = 'text-purple-400';

        return <span className={color}>{percentage}%</span>;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 border-2 border-indigo-400/50 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

                {/* 标题栏 */}
                <div className="p-4 border-b border-indigo-400/30 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-indigo-100">🔍 语义搜索</h2>
                    <button
                        onClick={onClose}
                        className="text-indigo-300 hover:text-white text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* 搜索控制区 */}
                <div className="p-4 border-b border-indigo-400/30 bg-black/20">

                    {/* 搜索框 */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={contextSearch ? "可选：自定义查询（留空则自动提取上下文）" : "输入搜索内容..."}
                            className="flex-1 px-4 py-2 bg-black/50 border border-indigo-400/50 rounded text-indigo-100 placeholder-indigo-400/50"
                            disabled={searching}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={searching || (!query.trim() && !contextSearch)}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded transition-colors"
                        >
                            {searching ? '搜索中...' : '搜索'}
                        </button>
                    </div>

                    {/* 上下文搜索开关 */}
                    <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center gap-2 text-indigo-200 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={contextSearch}
                                onChange={(e) => setContextSearch(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span>🧠 上下文感知搜索</span>
                        </label>
                        <span className="text-xs text-indigo-400">
                            （根据当前游戏场景自动检索相关记忆）
                        </span>
                    </div>

                    {/* 分类过滤 */}
                    {!contextSearch && (
                        <div className="mb-3">
                            <p className="text-sm text-indigo-300 mb-2">分类过滤：</p>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryToggle(category)}
                                        className={`px-3 py-1 rounded text-sm transition-colors ${selectedCategories.includes(category)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-black/30 text-indigo-300 hover:bg-black/50'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 高级选项 */}
                    <details className="text-sm" open>
                        <summary className="text-indigo-300 cursor-pointer hover:text-indigo-200 mb-3">
                            高级选项
                        </summary>
                        <div className="mt-3 space-y-3 pl-4">
                            {/* 相似度阈值设置 */}
                            <div className="bg-black/30 p-3 rounded border border-indigo-400/30">
                                <label className="block text-indigo-200 mb-2 font-semibold">
                                    📊 相似度阈值设置
                                </label>

                                {/* 滑块 */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-indigo-400 mb-1">
                                        <span>0%</span>
                                        <span className="font-bold text-indigo-300">当前: {(similarityThreshold * 100).toFixed(0)}%</span>
                                        <span>100%</span>
                                    </div>
                                    <input
                                        type="range"
                                        value={similarityThreshold}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setSimilarityThreshold(val);
                                            setThresholdInput((val * 100).toFixed(0));
                                        }}
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        className="w-full"
                                    />
                                </div>

                                {/* 自定义输入 */}
                                <div className="flex gap-2 items-center">
                                    <label className="text-indigo-200 text-sm whitespace-nowrap">
                                        精确值:
                                    </label>
                                    <input
                                        type="number"
                                        value={thresholdInput}
                                        onChange={(e) => handleThresholdInputChange(e.target.value)}
                                        min="0"
                                        max="100"
                                        step="1"
                                        className="flex-1 px-3 py-1 bg-black/50 border border-indigo-400/50 rounded text-indigo-100 text-sm"
                                        placeholder="0-100"
                                    />
                                    <span className="text-indigo-300 text-sm">%</span>

                                    {/* 保存按钮 */}
                                    <button
                                        onClick={handleSaveThreshold}
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors whitespace-nowrap flex items-center gap-1"
                                        title="保存阈值到设置"
                                    >
                                        💾 保存
                                    </button>
                                </div>

                                {/* 保存成功提示 */}
                                {showSaveSuccess && (
                                    <div className="mt-2 text-xs text-green-400 animate-pulse">
                                        ✓ 阈值已保存！
                                    </div>
                                )}

                                {/* 说明文字 */}
                                <p className="text-xs text-indigo-400 mt-2">
                                    💡 阈值越高，搜索结果越精确但数量越少；阈值越低，结果越多但可能不够相关
                                </p>
                            </div>

                            {/* 时间衰减 */}
                            <label className="flex items-center gap-2 text-indigo-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useTimeDecay}
                                    onChange={(e) => setUseTimeDecay(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span>启用时间衰减（较新的记忆权重更高）</span>
                            </label>
                        </div>
                    </details>
                </div>

                {/* 搜索结果区 */}
                <div className="flex-1 overflow-y-auto p-4">
                    {searching ? (
                        <div className="text-center text-indigo-300 py-8">
                            <div className="animate-spin text-4xl mb-2">🔄</div>
                            <p>正在搜索中...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            {/* 结果统计 */}
                            <div className="mb-4 p-3 bg-black/30 rounded border border-indigo-400/30 text-indigo-200 text-sm">
                                找到 <span className="text-indigo-400 font-bold">{results.length}</span> 个相关记忆
                                <span className="ml-4 text-indigo-400">
                                    搜索耗时: {searchTime}ms
                                </span>
                            </div>

                            {/* 结果列表 */}
                            <div className="space-y-3">
                                {results.map((result, index) => {
                                    const memory = result.memory;
                                    const isExpanded = expandedResults.has(memory.id);
                                    const previewText = memory.text.length > 150
                                        ? memory.text.substring(0, 150) + '...'
                                        : memory.text;

                                    return (
                                        <div
                                            key={memory.id}
                                            className="bg-black/40 border border-indigo-400/40 rounded-lg p-4 hover:border-indigo-400/60 transition-colors"
                                        >
                                            {/* 头部信息 */}
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-indigo-400 font-bold">#{result.rank}</span>
                                                    <span className="px-2 py-0.5 bg-indigo-600/50 text-indigo-200 text-xs rounded">
                                                        {memory.category}
                                                    </span>
                                                    <span className="text-indigo-300 text-sm">
                                                        {memory.metadata.timestamp}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm">
                                                        相似度: {formatSimilarity(result.similarity)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 位置和角色信息 */}
                                            {(memory.metadata.location || memory.metadata.involvedCharacters) && (
                                                <div className="flex gap-4 mb-2 text-xs text-indigo-400">
                                                    {memory.metadata.location && (
                                                        <span>📍 {memory.metadata.location}</span>
                                                    )}
                                                    {memory.metadata.involvedCharacters && memory.metadata.involvedCharacters.length > 0 && (
                                                        <span>👥 {memory.metadata.involvedCharacters.join('、')}</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* 内容预览/完整内容 */}
                                            <div className="text-indigo-100 text-sm mb-2">
                                                {isExpanded ? memory.text : previewText}
                                            </div>

                                            {/* 展开/收起按钮 */}
                                            {memory.text.length > 150 && (
                                                <button
                                                    onClick={() => toggleResultExpansion(memory.id)}
                                                    className="text-xs text-indigo-400 hover:text-indigo-300"
                                                >
                                                    {isExpanded ? '▲ 收起' : '▼ 展开'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-indigo-300 py-8">
                            <div className="text-4xl mb-2">🔍</div>
                            <p>暂无搜索结果</p>
                            <p className="text-sm mt-2 text-indigo-400">
                                {!gameState.vectorConfig.enabled
                                    ? '请先在设置中启用向量化功能'
                                    : '输入关键词或启用上下文搜索开始检索'}
                            </p>
                        </div>
                    )}
                </div>

                {/* 底部操作栏 */}
                <div className="p-4 border-t border-indigo-400/30 bg-black/20">
                    <div className="flex justify-between items-center text-sm text-indigo-300">
                        <div>
                            {gameState.vectorConfig.enabled ? (
                                <span>✅ 向量化功能已启用</span>
                            ) : (
                                <span className="text-yellow-400">⚠️ 向量化功能未启用</span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                        >
                            关闭
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};