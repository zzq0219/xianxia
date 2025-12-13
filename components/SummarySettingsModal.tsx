import React, { useState } from 'react';
import { vectorService } from '../services/vectorService';
import { vectorStorageService } from '../services/vectorStorageService';
import { GameState, SummarySettings, VectorConfig } from '../types';
import SummaryPresetTab from './SummaryPresetTab';

interface SummarySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: SummarySettings;
    onSave: (settings: SummarySettings) => void;
    gameState?: GameState;
    onVectorConfigSave?: (config: VectorConfig) => void;
}

type SettingsTab = 'general' | 'presets' | 'vector';
type VectorSubTab = 'embedding' | 'reranker';

const SummarySettingsModal: React.FC<SummarySettingsModalProps> = ({
    isOpen,
    onClose,
    settings,
    onSave,
    gameState,
    onVectorConfigSave,
}) => {
    const [localSettings, setLocalSettings] = useState<SummarySettings>(settings);
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [vectorConfig, setVectorConfig] = useState<VectorConfig>(
        gameState?.vectorConfig || {
            enabled: false,
            apiUrl: 'https://api.openai.com/v1',
            apiKey: '',
            model: 'text-embedding-3-small',
            autoVectorize: false,
            vectorizeOnSummary: true,
            batchSize: 10,
            similarityThreshold: 0.7,
            maxResults: 20,
            topKBeforeRerank: 50,
            rerankerEnabled: false,
            rerankerApiUrl: 'https://api.jina.ai/v1',
            rerankerApiKey: '',
            rerankerModel: 'jina-reranker-v2-base-multilingual',
            retryAttempts: 3,
            cacheEnabled: true
        }
    );
    const [vectorSubTab, setVectorSubTab] = useState<VectorSubTab>('embedding');
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [fetchingModels, setFetchingModels] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [modelSearchQuery, setModelSearchQuery] = useState('');
    const [availableRerankerModels, setAvailableRerankerModels] = useState<string[]>([]);
    const [fetchingRerankerModels, setFetchingRerankerModels] = useState(false);
    const [rerankerModelSearchQuery, setRerankerModelSearchQuery] = useState('');

    if (!isOpen) return null;

    // 过滤模型列表
    const filteredModels = availableModels.filter(model =>
        model.toLowerCase().includes(modelSearchQuery.toLowerCase())
    );

    const handleSave = () => {
        onSave(localSettings);
        if (activeTab === 'vector' && onVectorConfigSave) {
            vectorService.updateConfig(vectorConfig);
            onVectorConfigSave(vectorConfig);
        }
        onClose();
    };

    const loadStats = async () => {
        setLoadingStats(true);
        try {
            await vectorStorageService.initialize();
            const vectorStats = await vectorStorageService.getStats();
            setStats(vectorStats);
        } catch (error) {
            console.error('加载统计信息失败:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            vectorService.updateConfig(vectorConfig);
            const result = await vectorService.testConnection();

            if (result.success) {
                setTestResult({
                    success: true,
                    message: `连接成功！使用模型: ${result.model}`
                });
            } else {
                setTestResult({
                    success: false,
                    message: `连接失败: ${result.error}`
                });
            }
        } catch (error) {
            setTestResult({
                success: false,
                message: `连接失败: ${error instanceof Error ? error.message : '未知错误'}`
            });
        } finally {
            setTesting(false);
        }
    };

    const handleFetchModels = async () => {
        setFetchingModels(true);
        setTestResult(null);

        try {
            vectorService.updateConfig(vectorConfig);
            const result = await vectorService.fetchAvailableModels();

            if (result.success && result.models) {
                setAvailableModels(result.models);
                // 保存模型列表到localStorage
                localStorage.setItem('vector_available_models', JSON.stringify(result.models));
                setTestResult({
                    success: true,
                    message: `成功获取 ${result.models.length} 个模型`
                });
            } else {
                setTestResult({
                    success: false,
                    message: `获取模型列表失败: ${result.error}`
                });
            }
        } catch (error) {
            setTestResult({
                success: false,
                message: `获取模型列表失败: ${error instanceof Error ? error.message : '未知错误'}`
            });
        } finally {
            setFetchingModels(false);
        }
    };

    const handleFetchRerankerModels = async () => {
        setFetchingRerankerModels(true);
        setTestResult(null);

        try {
            // 调用Reranker API获取可用模型
            const response = await fetch(`${vectorConfig.rerankerApiUrl}/models`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${vectorConfig.rerankerApiKey}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                setTestResult({
                    success: false,
                    message: `获取Reranker模型列表失败: HTTP ${response.status} - ${errorText}`
                });
                return;
            }

            const data = await response.json();

            // 解析不同API的响应格式
            let models: string[] = [];
            if (data.data && Array.isArray(data.data)) {
                // OpenAI格式
                models = data.data.map((m: any) => m.id);
            } else if (data.models && Array.isArray(data.models)) {
                // 某些API使用models字段
                models = data.models.map((m: any) => typeof m === 'string' ? m : m.id || m.name);
            } else if (Array.isArray(data)) {
                // 直接返回数组
                models = data.map((m: any) => typeof m === 'string' ? m : m.id || m.name);
            }

            if (models.length > 0) {
                setAvailableRerankerModels(models);
                // 保存到localStorage
                localStorage.setItem('reranker_available_models', JSON.stringify(models));
                setTestResult({
                    success: true,
                    message: `成功获取 ${models.length} 个Reranker模型`
                });
            } else {
                setTestResult({
                    success: false,
                    message: '未找到可用的Reranker模型'
                });
            }
        } catch (error) {
            setTestResult({
                success: false,
                message: `获取Reranker模型列表失败: ${error instanceof Error ? error.message : '未知错误'}`
            });
        } finally {
            setFetchingRerankerModels(false);
        }
    };

    const handleClearVectors = async () => {
        if (!confirm('确定要清空所有向量数据吗？此操作不可逆！')) {
            return;
        }

        try {
            await vectorStorageService.clearAllVectors();
            alert('向量数据已清空');
            loadStats();
        } catch (error) {
            alert('清空失败: ' + (error instanceof Error ? error.message : '未知错误'));
        }
    };

    // 当切换到向量标签时加载统计和已保存的模型列表
    React.useEffect(() => {
        if (activeTab === 'vector' && isOpen) {
            loadStats();
            // 从localStorage加载之前获取的模型列表
            const savedModels = localStorage.getItem('vector_available_models');
            if (savedModels) {
                try {
                    const models = JSON.parse(savedModels);
                    setAvailableModels(models);
                } catch (error) {
                    console.error('加载已保存的模型列表失败:', error);
                }
            }
            // 从localStorage加载之前获取的Reranker模型列表
            const savedRerankerModels = localStorage.getItem('reranker_available_models');
            if (savedRerankerModels) {
                try {
                    const models = JSON.parse(savedRerankerModels);
                    setAvailableRerankerModels(models);
                } catch (error) {
                    console.error('加载已保存的Reranker模型列表失败:', error);
                }
            }
        }
    }, [activeTab, isOpen]);

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            {/* 自动总结开关 */}
            <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-white font-semibold mb-1">自动总结</h3>
                        <p className="text-xs text-gray-400">启用后将根据设定自动生成总结</p>
                    </div>
                    <button
                        onClick={() => setLocalSettings({
                            ...localSettings,
                            autoSummaryEnabled: !localSettings.autoSummaryEnabled
                        })}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${localSettings.autoSummaryEnabled
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                            : 'bg-stone-600'
                            }`}
                    >
                        <div
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${localSettings.autoSummaryEnabled ? 'translate-x-8' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* 小总结间隔 */}
            <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
                <h3 className="text-white font-semibold mb-3">小总结触发条件</h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300">每</span>
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={localSettings.smallSummaryInterval}
                        onChange={(e) => setLocalSettings({
                            ...localSettings,
                            smallSummaryInterval: Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                        })}
                        className="w-20 px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-center text-white focus:outline-none focus:border-amber-500"
                        disabled={!localSettings.autoSummaryEnabled}
                    />
                    <span className="text-sm text-gray-300">条实时记录生成一次小总结</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">推荐值: 5-15条</p>
            </div>

            {/* 大总结间隔 */}
            <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
                <h3 className="text-white font-semibold mb-3">大总结触发条件</h3>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300">每</span>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={localSettings.largeSummaryInterval}
                        onChange={(e) => setLocalSettings({
                            ...localSettings,
                            largeSummaryInterval: Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                        })}
                        className="w-20 px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-center text-white focus:outline-none focus:border-amber-500"
                        disabled={!localSettings.autoSummaryEnabled}
                    />
                    <span className="text-sm text-gray-300">条小总结生成一次大总结</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">推荐值: 3-8条</p>
            </div>
        </div>
    );

    const renderEmbeddingSettings = () => (
        <div className="space-y-6">
            {/* 统计信息 */}
            <div className="glass-morphism p-4 rounded-lg border border-purple-700/50">
                <h3 className="text-lg font-semibold text-purple-200 mb-3">📊 向量存储统计</h3>
                {loadingStats ? (
                    <p className="text-purple-300">加载中...</p>
                ) : stats ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-purple-200">
                            <span className="text-purple-400">总向量数：</span>
                            {stats.totalVectors}
                        </div>
                        <div className="text-purple-200">
                            <span className="text-purple-400">平均维度：</span>
                            {stats.averageDimension.toFixed(0)}
                        </div>
                        <div className="text-purple-200">
                            <span className="text-purple-400">存储大小：</span>
                            {(stats.storageSize / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <div className="text-purple-200">
                            <span className="text-purple-400">最早记录：</span>
                            {stats.oldestVector ? new Date(stats.oldestVector).toLocaleDateString() : '-'}
                        </div>
                    </div>
                ) : (
                    <p className="text-purple-300">暂无数据</p>
                )}
            </div>

            {/* 基础设置 */}
            <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
                <h3 className="text-white font-semibold mb-4">⚙️ 基础设置</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-gray-300">启用向量化功能</label>
                        <input
                            type="checkbox"
                            checked={vectorConfig.enabled}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, enabled: e.target.checked })}
                            className="w-5 h-5"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">API URL</label>
                        <input
                            type="text"
                            value={vectorConfig.apiUrl}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, apiUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white"
                            placeholder="https://api.openai.com/v1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            支持OpenAI API或兼容接口（如本地Ollama）
                        </p>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">API Key</label>
                        <input
                            type="password"
                            value={vectorConfig.apiKey}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, apiKey: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white"
                            placeholder="sk-..."
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-gray-300">Embedding模型</label>
                            <button
                                onClick={handleFetchModels}
                                disabled={fetchingModels || !vectorConfig.apiUrl}
                                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                            >
                                {fetchingModels ? '获取中...' : '🔄 刷新模型'}
                            </button>
                        </div>

                        {/* 搜索框 */}
                        {availableModels.length > 0 && (
                            <div className="mb-2">
                                <input
                                    type="text"
                                    value={modelSearchQuery}
                                    onChange={(e) => setModelSearchQuery(e.target.value)}
                                    placeholder="🔍 搜索模型..."
                                    className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white text-sm"
                                />
                                {modelSearchQuery && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        找到 {filteredModels.length} 个匹配的模型
                                    </p>
                                )}
                            </div>
                        )}

                        <select
                            value={vectorConfig.model}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, model: e.target.value })}
                            className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white"
                            size={availableModels.length > 0 ? Math.min(filteredModels.length + 5, 10) : 5}
                        >
                            {availableModels.length > 0 ? (
                                <>
                                    <optgroup label="已发现的模型">
                                        {filteredModels.length > 0 ? (
                                            filteredModels.map(model => (
                                                <option key={model} value={model}>{model}</option>
                                            ))
                                        ) : (
                                            <option disabled>没有匹配的模型</option>
                                        )}
                                    </optgroup>
                                    <optgroup label="常用模型">
                                        <option value="text-embedding-3-small">text-embedding-3-small (OpenAI)</option>
                                        <option value="text-embedding-3-large">text-embedding-3-large (OpenAI)</option>
                                        <option value="text-embedding-ada-002">text-embedding-ada-002 (OpenAI)</option>
                                        <option value="nomic-embed-text">nomic-embed-text (Ollama)</option>
                                        <option value="mxbai-embed-large">mxbai-embed-large (Ollama)</option>
                                    </optgroup>
                                </>
                            ) : (
                                <>
                                    <option value="text-embedding-3-small">text-embedding-3-small (OpenAI)</option>
                                    <option value="text-embedding-3-large">text-embedding-3-large (OpenAI)</option>
                                    <option value="text-embedding-ada-002">text-embedding-ada-002 (OpenAI)</option>
                                    <option value="nomic-embed-text">nomic-embed-text (Ollama)</option>
                                    <option value="mxbai-embed-large">mxbai-embed-large (Ollama)</option>
                                </>
                            )}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            点击"刷新模型"可从API端点自动获取可用模型列表
                        </p>
                    </div>

                    <button
                        onClick={handleTestConnection}
                        disabled={testing || !vectorConfig.apiKey}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded transition-colors"
                    >
                        {testing ? '测试中...' : '测试连接'}
                    </button>

                    {testResult && (
                        <div
                            className={`p-3 rounded border ${testResult.success
                                ? 'bg-green-900/50 border-green-400/50 text-green-200'
                                : 'bg-red-900/50 border-red-400/50 text-red-200'
                                }`}
                        >
                            {testResult.message}
                        </div>
                    )}
                </div>
            </div>

            {/* 自动化设置 */}
            <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
                <h3 className="text-white font-semibold mb-4">🤖 自动化设置</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-gray-300">自动向量化新记忆</label>
                        <input
                            type="checkbox"
                            checked={vectorConfig.autoVectorize}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, autoVectorize: e.target.checked })}
                            className="w-5 h-5"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-gray-300">生成总结时自动向量化</label>
                        <input
                            type="checkbox"
                            checked={vectorConfig.vectorizeOnSummary}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, vectorizeOnSummary: e.target.checked })}
                            className="w-5 h-5"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">批处理大小</label>
                        <input
                            type="number"
                            value={vectorConfig.batchSize}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, batchSize: parseInt(e.target.value) })}
                            min="1"
                            max="50"
                            className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            每次批量处理的记忆数量（1-50）
                        </p>
                    </div>
                </div>
            </div>

            {/* 搜索设置 */}
            <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
                <h3 className="text-white font-semibold mb-4">🔍 搜索设置</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-2">
                            相似度阈值: {(vectorConfig.similarityThreshold * 100).toFixed(0)}%
                        </label>
                        <input
                            type="range"
                            value={vectorConfig.similarityThreshold}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, similarityThreshold: parseFloat(e.target.value) })}
                            min="0.5"
                            max="0.95"
                            step="0.05"
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            低于此值的搜索结果将被过滤
                        </p>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">最大结果数</label>
                        <input
                            type="number"
                            value={vectorConfig.maxResults}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, maxResults: parseInt(e.target.value) })}
                            min="5"
                            max="100"
                            className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            最终返回给AI的记忆数量
                        </p>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Rerank前检索数量</label>
                        <input
                            type="number"
                            value={vectorConfig.topKBeforeRerank}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, topKBeforeRerank: parseInt(e.target.value) })}
                            min="10"
                            max="200"
                            className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            向量检索的候选数量，建议设置为最大结果数的2-5倍
                        </p>
                    </div>
                </div>
            </div>

            {/* 高级设置 */}
            <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
                <h3 className="text-white font-semibold mb-4">🔧 高级设置</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-2">重试次数</label>
                        <input
                            type="number"
                            value={vectorConfig.retryAttempts}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, retryAttempts: parseInt(e.target.value) })}
                            min="0"
                            max="5"
                            className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-gray-300">启用向量缓存</label>
                        <input
                            type="checkbox"
                            checked={vectorConfig.cacheEnabled}
                            onChange={(e) => setVectorConfig({ ...vectorConfig, cacheEnabled: e.target.checked })}
                            className="w-5 h-5"
                        />
                    </div>
                </div>
            </div>

        </div>
    );

    const renderRerankerSettings = () => {
        // 过滤Reranker模型列表
        const filteredRerankerModels = availableRerankerModels.filter(model =>
            model.toLowerCase().includes(rerankerModelSearchQuery.toLowerCase())
        );

        return (
            <div className="space-y-6">
                {/* Reranker说明 */}
                <div className="glass-morphism p-4 rounded-lg border border-blue-700/50 bg-blue-900/10">
                    <h3 className="text-blue-300 font-semibold mb-2">ℹ️ 什么是Reranker？</h3>
                    <p className="text-sm text-gray-300 mb-2">
                        Reranker（重排序模型）是一种专门用于优化搜索结果排序的AI模型。它可以：
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                        <li>对向量检索的候选结果进行精确重排序</li>
                        <li>提高最相关记忆的排名准确度</li>
                        <li>减少不相关内容进入AI上下文</li>
                        <li>改善AI生成的质量和相关性</li>
                    </ul>
                </div>

                {/* Reranker基础设置 */}
                <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
                    <h3 className="text-white font-semibold mb-4">⚙️ Reranker设置</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-gray-300 font-medium">启用Reranker</label>
                                <p className="text-xs text-gray-500 mt-1">开启后将对向量检索结果进行重排序</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={vectorConfig.rerankerEnabled}
                                onChange={(e) => setVectorConfig({ ...vectorConfig, rerankerEnabled: e.target.checked })}
                                className="w-5 h-5"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Reranker API URL</label>
                            <input
                                type="text"
                                value={vectorConfig.rerankerApiUrl}
                                onChange={(e) => setVectorConfig({ ...vectorConfig, rerankerApiUrl: e.target.value })}
                                className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white"
                                placeholder="https://api.jina.ai/v1"
                                disabled={!vectorConfig.rerankerEnabled}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                推荐使用Jina AI、Cohere或兼容的Reranker API
                            </p>
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Reranker API Key</label>
                            <input
                                type="password"
                                value={vectorConfig.rerankerApiKey}
                                onChange={(e) => setVectorConfig({ ...vectorConfig, rerankerApiKey: e.target.value })}
                                className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white"
                                placeholder="jina_..."
                                disabled={!vectorConfig.rerankerEnabled}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-gray-300">Reranker模型</label>
                                <button
                                    onClick={handleFetchRerankerModels}
                                    disabled={fetchingRerankerModels || !vectorConfig.rerankerApiUrl || !vectorConfig.rerankerEnabled}
                                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                                >
                                    {fetchingRerankerModels ? '获取中...' : '🔄 刷新模型'}
                                </button>
                            </div>

                            {/* 搜索框 */}
                            {availableRerankerModels.length > 0 && (
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        value={rerankerModelSearchQuery}
                                        onChange={(e) => setRerankerModelSearchQuery(e.target.value)}
                                        placeholder="🔍 搜索Reranker模型..."
                                        className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white text-sm"
                                        disabled={!vectorConfig.rerankerEnabled}
                                    />
                                    {rerankerModelSearchQuery && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            找到 {filteredRerankerModels.length} 个匹配的模型
                                        </p>
                                    )}
                                </div>
                            )}

                            <select
                                value={vectorConfig.rerankerModel}
                                onChange={(e) => setVectorConfig({ ...vectorConfig, rerankerModel: e.target.value })}
                                className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded text-white"
                                size={availableRerankerModels.length > 0 ? Math.min(filteredRerankerModels.length + 5, 10) : 5}
                                disabled={!vectorConfig.rerankerEnabled}
                            >
                                {availableRerankerModels.length > 0 ? (
                                    <>
                                        <optgroup label="已发现的模型">
                                            {filteredRerankerModels.length > 0 ? (
                                                filteredRerankerModels.map(model => (
                                                    <option key={model} value={model}>{model}</option>
                                                ))
                                            ) : (
                                                <option disabled>没有匹配的模型</option>
                                            )}
                                        </optgroup>
                                        <optgroup label="常用模型">
                                            <option value="jina-reranker-v2-base-multilingual">jina-reranker-v2-base-multilingual (推荐)</option>
                                            <option value="jina-reranker-v1-base-en">jina-reranker-v1-base-en</option>
                                            <option value="jina-reranker-v1-turbo-en">jina-reranker-v1-turbo-en</option>
                                            <option value="rerank-multilingual-v3.0">rerank-multilingual-v3.0 (Cohere)</option>
                                            <option value="rerank-english-v3.0">rerank-english-v3.0 (Cohere)</option>
                                        </optgroup>
                                    </>
                                ) : (
                                    <>
                                        <optgroup label="Jina AI Rerankers">
                                            <option value="jina-reranker-v2-base-multilingual">jina-reranker-v2-base-multilingual (推荐)</option>
                                            <option value="jina-reranker-v1-base-en">jina-reranker-v1-base-en</option>
                                            <option value="jina-reranker-v1-turbo-en">jina-reranker-v1-turbo-en</option>
                                        </optgroup>
                                        <optgroup label="Cohere Rerankers">
                                            <option value="rerank-multilingual-v3.0">rerank-multilingual-v3.0</option>
                                            <option value="rerank-english-v3.0">rerank-english-v3.0</option>
                                            <option value="rerank-multilingual-v2.0">rerank-multilingual-v2.0</option>
                                        </optgroup>
                                    </>
                                )}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                点击"刷新模型"可从API端点自动获取可用模型列表
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reranker工作流程说明 */}
                <div className="glass-morphism p-4 rounded-lg border border-stone-700/50">
                    <h3 className="text-white font-semibold mb-3">🔄 工作流程</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                            <span className="text-blue-400 font-mono">1.</span>
                            <div>
                                <span className="text-gray-300 font-medium">向量检索</span>
                                <p className="text-gray-500 text-xs">使用Embedding模型检索 {vectorConfig.topKBeforeRerank} 个候选记忆</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-400 font-mono">2.</span>
                            <div>
                                <span className="text-gray-300 font-medium">Reranker重排</span>
                                <p className="text-gray-500 text-xs">使用Reranker对候选结果进行精确排序</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-blue-400 font-mono">3.</span>
                            <div>
                                <span className="text-gray-300 font-medium">返回结果</span>
                                <p className="text-gray-500 text-xs">返回排序后的前 {vectorConfig.maxResults} 个最相关记忆</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 性能提示 */}
                <div className="glass-morphism p-4 rounded-lg border border-yellow-700/50 bg-yellow-900/10">
                    <h3 className="text-yellow-300 font-semibold mb-2">💡 性能建议</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                        <li>• 候选数量建议设置为最终结果的 2-5 倍</li>
                        <li>• 例如：最终要 20 条结果，候选数量设为 50-100</li>
                        <li>• Reranker会增加 100-300ms 的延迟</li>
                        <li>• 在对话场景中，更高的相关性值得这点延迟</li>
                    </ul>
                </div>
            </div>
        );
    };

    const renderVectorSettings = () => (
        <div className="space-y-4">
            {/* 统计信息 */}
            <div className="glass-morphism p-4 rounded-lg border border-purple-700/50">
                <h3 className="text-lg font-semibold text-purple-200 mb-3">📊 向量存储统计</h3>
                {loadingStats ? (
                    <p className="text-purple-300">加载中...</p>
                ) : stats ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-purple-200">
                            <span className="text-purple-400">总向量数：</span>
                            {stats.totalVectors}
                        </div>
                        <div className="text-purple-200">
                            <span className="text-purple-400">平均维度：</span>
                            {stats.averageDimension.toFixed(0)}
                        </div>
                        <div className="text-purple-200">
                            <span className="text-purple-400">存储大小：</span>
                            {(stats.storageSize / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <div className="text-purple-200">
                            <span className="text-purple-400">最早记录：</span>
                            {stats.oldestVector ? new Date(stats.oldestVector).toLocaleDateString() : '-'}
                        </div>
                    </div>
                ) : (
                    <p className="text-purple-300">暂无数据</p>
                )}
            </div>

            {/* 子标签栏 */}
            <div className="flex space-x-2 border-b border-stone-700">
                <button
                    onClick={() => setVectorSubTab('embedding')}
                    className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${vectorSubTab === 'embedding'
                        ? 'bg-stone-700/80 text-green-400 border-b-2 border-green-400'
                        : 'bg-transparent text-gray-400 hover:bg-stone-700/50'
                        }`}
                >
                    <i className="fa-solid fa-vector-square mr-2"></i>
                    嵌入模型
                </button>
                <button
                    onClick={() => setVectorSubTab('reranker')}
                    className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${vectorSubTab === 'reranker'
                        ? 'bg-stone-700/80 text-blue-400 border-b-2 border-blue-400'
                        : 'bg-transparent text-gray-400 hover:bg-stone-700/50'
                        }`}
                >
                    <i className="fa-solid fa-ranking-star mr-2"></i>
                    重排模型
                </button>
            </div>

            {/* 子标签内容 */}
            <div className="pt-2">
                {vectorSubTab === 'embedding' && renderEmbeddingSettings()}
                {vectorSubTab === 'reranker' && renderRerankerSettings()}
            </div>

            {/* 危险区域 */}
            <div className="glass-morphism p-4 rounded-lg border border-red-700/50 bg-red-900/10">
                <h3 className="text-red-400 font-semibold mb-4">⚠️ 危险操作</h3>
                <button
                    onClick={handleClearVectors}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                    清空所有向量数据
                </button>
                <p className="text-xs text-red-300 mt-2">
                    此操作将永久删除所有向量化的记忆，但不会影响原始记忆数据
                </p>
            </div>
        </div>
    );

    return (
        <div
            className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />

                <div className="flex justify-between items-center p-4 border-b border-stone-700/50 bg-black/20">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-cog text-xl text-gradient-gold"></i>
                        <h2 className="text-xl font-bold text-gradient-gold text-shadow-glow font-serif">总结设置</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-stone-700/50 hover:bg-stone-600/50 text-gray-400 hover:text-xianxia-gold-400 transition-all duration-200"
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-stone-700">
                    <button onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'general' ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50'}`}>常规设置</button>
                    <button onClick={() => setActiveTab('presets')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'presets' ? 'bg-stone-700/80 text-purple-400 border-b-2 border-purple-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50'}`}>预设管理</button>
                    <button onClick={() => setActiveTab('vector')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 flex items-center gap-2 ${activeTab === 'vector' ? 'bg-stone-700/80 text-blue-400 border-b-2 border-blue-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50'}`}>
                        <i className="fa-solid fa-brain"></i>
                        向量设置
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto scrollbar-xianxia flex-grow max-h-[60vh]">
                    {activeTab === 'general' && renderGeneralSettings()}
                    {activeTab === 'presets' && (
                        <SummaryPresetTab
                            prompts={localSettings.summaryPrompts}
                            onPromptsChange={(newPrompts) => setLocalSettings(prev => ({ ...prev, summaryPrompts: newPrompts }))}
                        />
                    )}
                    {activeTab === 'vector' && renderVectorSettings()}
                </div>

                <div className="p-4 border-t border-stone-700/50 bg-black/20 flex gap-3 mt-auto">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-stone-700/50 hover:bg-stone-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-300"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-glow-gold"
                    >
                        保存设置
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />
            </div>
        </div>
    );
};

export default SummarySettingsModal;