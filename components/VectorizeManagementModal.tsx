import React, { useEffect, useState } from 'react';
import { vectorService } from '../services/vectorService';
import { vectorStorageService } from '../services/vectorStorageService';
import { MemoryCategory, MemoryEntry, MemorySummary, VectorConfig } from '../types';

interface VectorizeManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: MemoryCategory;
    realtimeMemories: MemoryEntry[];
    smallSummaries: MemorySummary[];
    largeSummaries: MemorySummary[];
    vectorConfig: VectorConfig;
}

type VectorizeTarget = 'realtime' | 'small-summary' | 'large-summary';
type VectorizeStatus = 'idle' | 'checking' | 'vectorizing' | 'completed' | 'error';

interface VectorizeItem {
    id: string;
    title: string;
    content: string;
    isVectorized: boolean;
    selected: boolean;
}

const VectorizeManagementModal: React.FC<VectorizeManagementModalProps> = ({
    isOpen,
    onClose,
    category,
    realtimeMemories,
    smallSummaries,
    largeSummaries,
    vectorConfig
}) => {
    const [activeTarget, setActiveTarget] = useState<VectorizeTarget>('realtime');
    const [items, setItems] = useState<VectorizeItem[]>([]);
    const [status, setStatus] = useState<VectorizeStatus>('idle');
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [statusMessage, setStatusMessage] = useState('');
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadItems();
        }
    }, [isOpen, activeTarget, category]);

    const loadItems = async () => {
        setStatus('checking');
        setStatusMessage('正在检查向量化状态...');

        try {
            await vectorStorageService.initialize();

            let sourceItems: { id: string; title: string; content: string }[] = [];

            if (activeTarget === 'realtime') {
                sourceItems = realtimeMemories.map(m => ({
                    id: m.id,
                    title: m.title,
                    content: m.content
                }));
            } else if (activeTarget === 'small-summary') {
                sourceItems = smallSummaries.map(s => ({
                    id: s.id,
                    title: `小总结 #${s.id}`,
                    content: s.content
                }));
            } else {
                sourceItems = largeSummaries.map(s => ({
                    id: s.id,
                    title: `大总结 #${s.id}`,
                    content: s.content
                }));
            }

            // 检查每个项目是否已向量化
            const itemsWithStatus = await Promise.all(
                sourceItems.map(async (item) => {
                    const isVectorized = await vectorStorageService.isMemoryVectorized(item.id);
                    return {
                        ...item,
                        isVectorized,
                        selected: !isVectorized // 默认选中未向量化的项目
                    };
                })
            );

            setItems(itemsWithStatus);
            setStatus('idle');
            setStatusMessage('');

            // 如果所有未向量化的项目被选中，则selectAll为true
            const unvectorizec = itemsWithStatus.filter(i => !i.isVectorized);
            setSelectAll(unvectorizec.length > 0 && unvectorizec.every(i => i.selected));
        } catch (error) {
            console.error('加载项目失败:', error);
            setStatus('error');
            setStatusMessage('加载失败: ' + (error instanceof Error ? error.message : '未知错误'));
        }
    };

    const handleToggleItem = (itemId: string) => {
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, selected: !item.selected } : item
        ));
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        // 只选择未向量化的项目
        setItems(prev => prev.map(item => ({
            ...item,
            selected: item.isVectorized ? false : newSelectAll
        })));
    };

    const handleVectorizeSelected = async () => {
        const selectedItems = items.filter(i => i.selected && !i.isVectorized);

        if (selectedItems.length === 0) {
            alert('请至少选择一个未向量化的项目');
            return;
        }

        if (!vectorConfig.enabled) {
            alert('请先在设置中启用向量化功能');
            return;
        }

        if (!vectorConfig.apiKey) {
            alert('请先在设置中配置API密钥');
            return;
        }

        setStatus('vectorizing');
        setProgress({ current: 0, total: selectedItems.length });

        try {
            vectorService.updateConfig(vectorConfig);

            for (let i = 0; i < selectedItems.length; i++) {
                const item = selectedItems[i];
                setProgress({ current: i + 1, total: selectedItems.length });
                setStatusMessage(`正在向量化 (${i + 1}/${selectedItems.length}): ${item.title}`);

                try {
                    // 生成向量
                    const vector = await vectorService.vectorize(item.content);

                    // 从原始记忆中获取完整的metadata
                    let originalMemory: any = null;
                    if (activeTarget === 'realtime') {
                        originalMemory = realtimeMemories.find(m => m.id === item.id);
                    } else if (activeTarget === 'small-summary') {
                        originalMemory = smallSummaries.find(s => s.id === item.id);
                    } else {
                        originalMemory = largeSummaries.find(s => s.id === item.id);
                    }

                    // 构建完整的metadata，包含位置和角色信息
                    const metadata = {
                        timestamp: originalMemory?.timestamp || new Date().toLocaleString('zh-CN'),
                        realTimestamp: originalMemory?.realTimestamp || Date.now(),
                        location: originalMemory?.location,
                        involvedCharacters: originalMemory?.involvedCharacters,
                        tags: [activeTarget, item.title]
                    };

                    // 保存向量
                    await vectorStorageService.saveVector({
                        id: `vec_${item.id}_${Date.now()}`,
                        memoryId: item.id,
                        vector,
                        vectorDimension: vector.length,
                        text: item.content,
                        category,
                        created: Date.now(),
                        model: vectorConfig.model,
                        metadata
                    });

                    // 更新UI中的状态
                    setItems(prev => prev.map(prevItem =>
                        prevItem.id === item.id
                            ? { ...prevItem, isVectorized: true, selected: false }
                            : prevItem
                    ));

                    console.log(`✅ 成功向量化: ${item.title}`);
                } catch (error) {
                    console.error(`❌ 向量化失败: ${item.title}`, error);
                    setStatusMessage(`向量化失败: ${item.title} - ${error instanceof Error ? error.message : '未知错误'}`);

                    if (!confirm(`向量化 "${item.title}" 时出错，是否继续？\n错误: ${error instanceof Error ? error.message : '未知错误'}`)) {
                        throw error;
                    }
                }

                // 添加延迟避免API限流
                if (i < selectedItems.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }

            setStatus('completed');
            setStatusMessage(`✅ 成功向量化 ${selectedItems.length} 个项目`);
            setSelectAll(false);

            // 3秒后自动关闭成功消息
            setTimeout(() => {
                if (status === 'completed') {
                    setStatus('idle');
                    setStatusMessage('');
                }
            }, 3000);

        } catch (error) {
            console.error('批量向量化失败:', error);
            setStatus('error');
            setStatusMessage('批量向量化失败: ' + (error instanceof Error ? error.message : '未知错误'));
        }
    };

    const handleVectorizeAll = async () => {
        // 选择所有未向量化的项目
        const unvectorized = items.filter(i => !i.isVectorized);

        if (unvectorized.length === 0) {
            alert('所有项目已经向量化');
            return;
        }

        if (!confirm(`确定要向量化所有 ${unvectorized.length} 个未向量化的项目吗？`)) {
            return;
        }

        // 选中所有未向量化的项目
        setItems(prev => prev.map(item => ({
            ...item,
            selected: !item.isVectorized
        })));
        setSelectAll(true);

        // 稍作延迟后执行向量化
        setTimeout(() => {
            handleVectorizeSelected();
        }, 100);
    };

    if (!isOpen) return null;

    const unvectorizedCount = items.filter(i => !i.isVectorized).length;
    const vectorizedCount = items.filter(i => i.isVectorized).length;
    const selectedCount = items.filter(i => i.selected).length;

    return (
        <div
            className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-purple-900/95 rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden border-2 border-purple-400/50 shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 标题栏 */}
                <div className="flex justify-between items-center p-4 border-b border-purple-400/30 bg-black/30">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-vector-square text-2xl text-purple-300"></i>
                        <div>
                            <h2 className="text-xl font-bold text-purple-100">向量化管理</h2>
                            <p className="text-sm text-purple-300">【{category}】类别</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={status === 'vectorizing'}
                        className="w-10 h-10 rounded-full bg-purple-700/50 hover:bg-purple-600/50 text-purple-200 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                {/* 目标选择标签 */}
                <div className="flex gap-2 p-4 border-b border-purple-400/30 bg-black/20">
                    <button
                        onClick={() => setActiveTarget('realtime')}
                        disabled={status === 'vectorizing'}
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTarget === 'realtime'
                            ? 'bg-amber-600 text-white shadow-lg'
                            : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <i className="fa-solid fa-stream"></i>
                        <span>实时记录</span>
                        <span className="px-2 py-0.5 bg-black/30 rounded-full text-xs">
                            {realtimeMemories.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTarget('small-summary')}
                        disabled={status === 'vectorizing'}
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTarget === 'small-summary'
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <i className="fa-solid fa-layer-group"></i>
                        <span>小总结</span>
                        <span className="px-2 py-0.5 bg-black/30 rounded-full text-xs">
                            {smallSummaries.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTarget('large-summary')}
                        disabled={status === 'vectorizing'}
                        className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTarget === 'large-summary'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <i className="fa-solid fa-book"></i>
                        <span>大总结</span>
                        <span className="px-2 py-0.5 bg-black/30 rounded-full text-xs">
                            {largeSummaries.length}
                        </span>
                    </button>
                </div>

                {/* 统计信息 */}
                <div className="p-4 bg-black/20 border-b border-purple-400/30">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-purple-300">{items.length}</div>
                            <div className="text-xs text-purple-400">总项目</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-400">{vectorizedCount}</div>
                            <div className="text-xs text-green-500">已向量化</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-400">{unvectorizedCount}</div>
                            <div className="text-xs text-yellow-500">未向量化</div>
                        </div>
                    </div>
                </div>

                {/* 项目列表 */}
                <div className="flex-grow overflow-y-auto p-4 space-y-2">
                    {status === 'checking' ? (
                        <div className="flex flex-col items-center justify-center h-full text-purple-300">
                            <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
                            <p>正在检查向量化状态...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-purple-300">
                            <i className="fa-solid fa-inbox text-4xl mb-4 opacity-50"></i>
                            <p>当前类别没有内容</p>
                        </div>
                    ) : (
                        <>
                            {/* 全选控制 */}
                            <div className="flex items-center gap-3 p-3 bg-purple-800/30 rounded-lg border border-purple-600/30 mb-3">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    disabled={status === 'vectorizing' || unvectorizedCount === 0}
                                    className="w-5 h-5 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <span className="text-purple-200 font-semibold">
                                    全选未向量化的项目 ({unvectorizedCount} 项)
                                </span>
                                {selectedCount > 0 && (
                                    <span className="ml-auto px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                                        已选 {selectedCount}
                                    </span>
                                )}
                            </div>

                            {/* 项目列表 */}
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`p-3 rounded-lg border transition-all ${item.isVectorized
                                        ? 'bg-green-900/20 border-green-600/30'
                                        : item.selected
                                            ? 'bg-purple-700/30 border-purple-500/50'
                                            : 'bg-purple-900/20 border-purple-700/30 hover:border-purple-600/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={() => handleToggleItem(item.id)}
                                            disabled={item.isVectorized || status === 'vectorizing'}
                                            className="mt-1 w-5 h-5 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 bg-purple-600/30 text-purple-200 text-xs rounded">
                                                    #{index + 1}
                                                </span>
                                                <span className="font-semibold text-purple-100">
                                                    {item.title}
                                                </span>
                                                {item.isVectorized && (
                                                    <span className="ml-auto px-2 py-0.5 bg-green-600/50 text-green-200 text-xs rounded flex items-center gap-1">
                                                        <i className="fa-solid fa-check"></i>
                                                        已向量化
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-purple-300 line-clamp-2">
                                                {item.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* 状态栏 */}
                {(status === 'vectorizing' || status === 'completed' || status === 'error') && (
                    <div className={`p-4 border-t border-purple-400/30 ${status === 'error' ? 'bg-red-900/30' :
                        status === 'completed' ? 'bg-green-900/30' :
                            'bg-black/30'
                        }`}>
                        <div className="flex items-center gap-3 mb-2">
                            {status === 'vectorizing' && (
                                <i className="fa-solid fa-spinner fa-spin text-purple-300"></i>
                            )}
                            {status === 'completed' && (
                                <i className="fa-solid fa-check-circle text-green-400"></i>
                            )}
                            {status === 'error' && (
                                <i className="fa-solid fa-exclamation-circle text-red-400"></i>
                            )}
                            <span className={`text-sm ${status === 'error' ? 'text-red-300' :
                                status === 'completed' ? 'text-green-300' :
                                    'text-purple-300'
                                }`}>
                                {statusMessage}
                            </span>
                        </div>
                        {status === 'vectorizing' && progress.total > 0 && (
                            <div className="w-full bg-purple-900/50 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* 操作按钮 */}
                <div className="p-4 border-t border-purple-400/30 bg-black/20 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={status === 'vectorizing'}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'vectorizing' ? '向量化中...' : '关闭'}
                    </button>
                    <button
                        onClick={handleVectorizeAll}
                        disabled={status === 'vectorizing' || unvectorizedCount === 0}
                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-bolt"></i>
                        向量化全部未完成
                    </button>
                    <button
                        onClick={handleVectorizeSelected}
                        disabled={status === 'vectorizing' || selectedCount === 0}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-play"></i>
                        向量化已选 ({selectedCount})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VectorizeManagementModal;