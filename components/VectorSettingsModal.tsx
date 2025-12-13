import React, { useEffect, useState } from 'react';
import { vectorService } from '../services/vectorService';
import { vectorStorageService } from '../services/vectorStorageService';
import { GameState, VectorConfig } from '../types';

interface VectorSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    onSave: (config: VectorConfig) => void;
}

export const VectorSettingsModal: React.FC<VectorSettingsModalProps> = ({
    isOpen,
    onClose,
    gameState,
    onSave
}) => {
    const [config, setConfig] = useState<VectorConfig>(gameState.vectorConfig);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [fetchingModels, setFetchingModels] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setConfig(gameState.vectorConfig);
            loadStats();
        }
    }, [isOpen, gameState.vectorConfig]);

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
            // 临时更新配置以测试
            vectorService.updateConfig(config);
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
            // 临时更新配置以获取模型列表
            vectorService.updateConfig(config);
            const result = await vectorService.fetchAvailableModels();

            if (result.success && result.models) {
                setAvailableModels(result.models);
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

    const handleSave = () => {
        vectorService.updateConfig(config);
        onSave(config);
        onClose();
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-2 border-purple-400/50 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6">
                    {/* 标题 */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-purple-100">🧠 向量记忆设置</h2>
                        <button
                            onClick={onClose}
                            className="text-purple-300 hover:text-white text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {/* 统计信息 */}
                    <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-400/30">
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
                    <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-400/30">
                        <h3 className="text-lg font-semibold text-purple-200 mb-4">⚙️ 基础设置</h3>

                        <div className="space-y-4">
                            {/* 启用开关 */}
                            <div className="flex items-center justify-between">
                                <label className="text-purple-200">启用向量化功能</label>
                                <input
                                    type="checkbox"
                                    checked={config.enabled}
                                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                                    className="w-5 h-5"
                                />
                            </div>

                            {/* API URL */}
                            <div>
                                <label className="block text-purple-200 mb-2">API URL</label>
                                <input
                                    type="text"
                                    value={config.apiUrl}
                                    onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                                    className="w-full px-3 py-2 bg-black/50 border border-purple-400/50 rounded text-purple-100"
                                    placeholder="https://api.openai.com/v1"
                                />
                                <p className="text-xs text-purple-400 mt-1">
                                    支持OpenAI API或兼容接口（如本地Ollama）
                                </p>
                            </div>

                            {/* API Key */}
                            <div>
                                <label className="block text-purple-200 mb-2">API Key</label>
                                <input
                                    type="password"
                                    value={config.apiKey}
                                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                    className="w-full px-3 py-2 bg-black/50 border border-purple-400/50 rounded text-purple-100"
                                    placeholder="sk-..."
                                />
                            </div>

                            {/* 模型 */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-purple-200">Embedding模型</label>
                                    <button
                                        onClick={handleFetchModels}
                                        disabled={fetchingModels || !config.apiUrl}
                                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                                    >
                                        {fetchingModels ? '获取中...' : '🔄 刷新模型'}
                                    </button>
                                </div>
                                <select
                                    value={config.model}
                                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                    className="w-full px-3 py-2 bg-black/50 border border-purple-400/50 rounded text-purple-100"
                                >
                                    {availableModels.length > 0 ? (
                                        <>
                                            <optgroup label="已发现的模型">
                                                {availableModels.map(model => (
                                                    <option key={model} value={model}>{model}</option>
                                                ))}
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
                                <p className="text-xs text-purple-400 mt-1">
                                    点击"刷新模型"按钮可从API端点自动获取可用模型列表
                                </p>
                            </div>

                            {/* 测试连接按钮 */}
                            <button
                                onClick={handleTestConnection}
                                disabled={testing || !config.apiKey}
                                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded transition-colors"
                            >
                                {testing ? '测试中...' : '测试连接'}
                            </button>

                            {/* 测试结果 */}
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
                    <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-400/30">
                        <h3 className="text-lg font-semibold text-purple-200 mb-4">🤖 自动化设置</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-purple-200">自动向量化新记忆</label>
                                <input
                                    type="checkbox"
                                    checked={config.autoVectorize}
                                    onChange={(e) => setConfig({ ...config, autoVectorize: e.target.checked })}
                                    className="w-5 h-5"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-purple-200">生成总结时自动向量化</label>
                                <input
                                    type="checkbox"
                                    checked={config.vectorizeOnSummary}
                                    onChange={(e) => setConfig({ ...config, vectorizeOnSummary: e.target.checked })}
                                    className="w-5 h-5"
                                />
                            </div>

                            <div>
                                <label className="block text-purple-200 mb-2">批处理大小</label>
                                <input
                                    type="number"
                                    value={config.batchSize}
                                    onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) })}
                                    min="1"
                                    max="50"
                                    className="w-full px-3 py-2 bg-black/50 border border-purple-400/50 rounded text-purple-100"
                                />
                                <p className="text-xs text-purple-400 mt-1">
                                    每次批量处理的记忆数量（1-50）
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 搜索设置 */}
                    <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-400/30">
                        <h3 className="text-lg font-semibold text-purple-200 mb-4">🔍 搜索设置</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-purple-200 mb-2">
                                    相似度阈值: {(config.similarityThreshold * 100).toFixed(0)}%
                                </label>
                                <input
                                    type="range"
                                    value={config.similarityThreshold}
                                    onChange={(e) => setConfig({ ...config, similarityThreshold: parseFloat(e.target.value) })}
                                    min="0.5"
                                    max="0.95"
                                    step="0.05"
                                    className="w-full"
                                />
                                <p className="text-xs text-purple-400 mt-1">
                                    低于此值的搜索结果将被过滤
                                </p>
                            </div>

                            <div>
                                <label className="block text-purple-200 mb-2">最大结果数</label>
                                <input
                                    type="number"
                                    value={config.maxResults}
                                    onChange={(e) => setConfig({ ...config, maxResults: parseInt(e.target.value) })}
                                    min="5"
                                    max="100"
                                    className="w-full px-3 py-2 bg-black/50 border border-purple-400/50 rounded text-purple-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 高级设置 */}
                    <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-400/30">
                        <h3 className="text-lg font-semibold text-purple-200 mb-4">🔧 高级设置</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-purple-200 mb-2">重试次数</label>
                                <input
                                    type="number"
                                    value={config.retryAttempts}
                                    onChange={(e) => setConfig({ ...config, retryAttempts: parseInt(e.target.value) })}
                                    min="0"
                                    max="5"
                                    className="w-full px-3 py-2 bg-black/50 border border-purple-400/50 rounded text-purple-100"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-purple-200">启用向量缓存</label>
                                <input
                                    type="checkbox"
                                    checked={config.cacheEnabled}
                                    onChange={(e) => setConfig({ ...config, cacheEnabled: e.target.checked })}
                                    className="w-5 h-5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 危险区域 */}
                    <div className="mb-6 p-4 bg-red-900/30 rounded-lg border border-red-400/50">
                        <h3 className="text-lg font-semibold text-red-200 mb-4">⚠️ 危险操作</h3>
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

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                        >
                            保存设置
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};