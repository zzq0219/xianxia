import React, { useState } from 'react';
import { saveSummaryToWorldbook } from '../services/tavernService';
import { MemoryCategory, MemoryCollection, MemorySummaryCollection } from '../types';

interface WorldbookExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    memories: MemoryCollection;
    memorySummaries: MemorySummaryCollection;
}

type ExportItem = {
    id: string;
    category: MemoryCategory;
    type: '实时记录' | '小总结' | '大总结';
    title: string;
    content: string;
    selected: boolean;
};

const WorldbookExportModal: React.FC<WorldbookExportModalProps> = ({
    isOpen,
    onClose,
    memories,
    memorySummaries,
}) => {
    const [exportItems, setExportItems] = useState<ExportItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'all'>('all');
    const [selectedType, setSelectedType] = useState<'实时记录' | '小总结' | '大总结' | 'all'>('all');
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportLog, setExportLog] = useState<string[]>([]);

    const categories: MemoryCategory[] = ['探索', '战斗', '商城', '医馆', '悬赏', '培育', '商业', '声望', '公告', '大牢', '其他'];

    // 初始化导出项列表
    React.useEffect(() => {
        if (isOpen) {
            const items: ExportItem[] = [];

            // 添加实时记录
            categories.forEach(category => {
                memories[category].forEach(memory => {
                    items.push({
                        id: memory.id,
                        category,
                        type: '实时记录',
                        title: memory.title,
                        content: memory.content,
                        selected: false,
                    });
                });
            });

            // 添加小总结
            categories.forEach(category => {
                memorySummaries[category].small.forEach(summary => {
                    items.push({
                        id: summary.id,
                        category,
                        type: '小总结',
                        title: summary.title,
                        content: summary.content,
                        selected: false,
                    });
                });
            });

            // 添加大总结
            categories.forEach(category => {
                memorySummaries[category].large.forEach(summary => {
                    items.push({
                        id: summary.id,
                        category,
                        type: '大总结',
                        title: summary.title,
                        content: summary.content,
                        selected: false,
                    });
                });
            });

            setExportItems(items);
            setExportLog([]);
            setExportProgress(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredItems = exportItems.filter(item => {
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
        if (selectedType !== 'all' && item.type !== selectedType) return false;
        return true;
    });

    const selectedCount = filteredItems.filter(item => item.selected).length;

    const handleToggleItem = (id: string) => {
        setExportItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, selected: !item.selected } : item
            )
        );
    };

    const handleSelectAll = () => {
        const allSelected = filteredItems.every(item => item.selected);
        setExportItems(prev =>
            prev.map(item => {
                if (filteredItems.some(f => f.id === item.id)) {
                    return { ...item, selected: !allSelected };
                }
                return item;
            })
        );
    };

    const handleExport = async () => {
        const itemsToExport = exportItems.filter(item => item.selected);
        if (itemsToExport.length === 0) {
            alert('请至少选择一个条目进行导出');
            return;
        }

        setIsExporting(true);
        setExportProgress(0);
        setExportLog([]);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < itemsToExport.length; i++) {
            const item = itemsToExport[i];
            const progress = Math.round(((i + 1) / itemsToExport.length) * 100);
            setExportProgress(progress);

            try {
                const summaryType = item.type === '大总结' ? 'large' : 'small';
                const success = await saveSummaryToWorldbook(
                    { title: item.title, content: item.content },
                    item.category,
                    summaryType
                );

                if (success) {
                    successCount++;
                    setExportLog(prev => [...prev, `✓ 成功导出: ${item.title}`]);
                } else {
                    failCount++;
                    setExportLog(prev => [...prev, `✗ 导出失败: ${item.title}`]);
                }
            } catch (error) {
                failCount++;
                setExportLog(prev => [...prev, `✗ 导出错误: ${item.title} - ${(error as Error).message}`]);
            }

            // 添加小延迟避免API过载
            if (i < itemsToExport.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        setExportLog(prev => [
            ...prev,
            '',
            `导出完成！成功: ${successCount}，失败: ${failCount}`
        ]);
        setIsExporting(false);
    };

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

    const getTypeColor = (type: string) => {
        switch (type) {
            case '实时记录': return 'text-amber-300 bg-amber-600/20 border-amber-600/30';
            case '小总结': return 'text-purple-300 bg-purple-600/20 border-purple-600/30';
            case '大总结': return 'text-indigo-300 bg-indigo-600/20 border-indigo-600/30';
            default: return 'text-gray-300 bg-gray-600/20 border-gray-600/30';
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />

                {/* 标题栏 */}
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20 border-b border-stone-700/50">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-book-bookmark text-2xl text-gradient-gold"></i>
                        <h2 className="text-2xl font-bold text-gradient-gold text-shadow-glow font-serif">批量导出至世界书</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-stone-700/50 hover:bg-stone-600/50 border border-stone-600 hover:border-xianxia-gold-500 text-gray-400 hover:text-xianxia-gold-400 transition-all duration-200 flex items-center justify-center group"
                    >
                        <i className="fa-solid fa-times text-xl group-hover:rotate-90 transition-transform duration-200"></i>
                    </button>
                </div>

                {/* 筛选栏 */}
                <div className="flex-shrink-0 p-4 border-b border-stone-700/50 bg-black/10">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">分类:</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as any)}
                                className="px-3 py-1 bg-stone-700/50 border border-stone-600 rounded text-white text-sm focus:outline-none focus:border-xianxia-gold-500"
                            >
                                <option value="all">全部</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">类型:</span>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value as any)}
                                className="px-3 py-1 bg-stone-700/50 border border-stone-600 rounded text-white text-sm focus:outline-none focus:border-xianxia-gold-500"
                            >
                                <option value="all">全部</option>
                                <option value="实时记录">实时记录</option>
                                <option value="小总结">小总结</option>
                                <option value="大总结">大总结</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSelectAll}
                            className="px-3 py-1 bg-blue-600/80 hover:bg-blue-500/90 text-white text-sm rounded transition-all"
                        >
                            {filteredItems.every(item => item.selected) ? '取消全选' : '全选当前'}
                        </button>
                        <span className="text-sm text-gray-400 ml-auto">
                            已选择: <span className="text-xianxia-gold-400 font-bold">{selectedCount}</span> / {filteredItems.length}
                        </span>
                    </div>
                </div>

                {/* 内容区 */}
                <div className="flex-grow overflow-y-auto scrollbar-xianxia p-4">
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <i className="fa-solid fa-inbox text-6xl mb-4 opacity-30"></i>
                            <p className="text-lg">暂无符合条件的记忆</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`glass-morphism p-3 rounded-lg border transition-all duration-200 cursor-pointer ${item.selected
                                        ? 'border-xianxia-gold-500/70 bg-xianxia-gold-900/20'
                                        : 'border-stone-700/50 hover:border-stone-600'
                                        }`}
                                    onClick={() => handleToggleItem(item.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={() => { }}
                                            className="mt-1 w-5 h-5 rounded border-stone-600 bg-stone-700/50 text-xianxia-gold-500 focus:ring-xianxia-gold-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <i className={`fa-solid ${getCategoryIcon(item.category)} text-sm`}></i>
                                                <span className="text-sm text-gray-400">{item.category}</span>
                                                <span className={`px-2 py-0.5 text-xs rounded border ${getTypeColor(item.type)}`}>
                                                    {item.type}
                                                </span>
                                            </div>
                                            <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                                            <p className="text-sm text-gray-400 line-clamp-2">{item.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 导出日志区 */}
                {exportLog.length > 0 && (
                    <div className="flex-shrink-0 max-h-32 overflow-y-auto scrollbar-xianxia p-4 bg-black/30 border-t border-stone-700/50">
                        <div className="space-y-1">
                            {exportLog.map((log, index) => (
                                <div
                                    key={index}
                                    className={`text-xs ${log.startsWith('✓') ? 'text-green-400' :
                                        log.startsWith('✗') ? 'text-red-400' :
                                            'text-gray-400'
                                        }`}
                                >
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 底部操作栏 */}
                <div className="flex-shrink-0 p-4 border-t border-stone-700/50 bg-black/20">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">
                            {isExporting ? (
                                <div className="flex items-center gap-2">
                                    <i className="fa-solid fa-spinner fa-spin text-xianxia-gold-400"></i>
                                    <span>导出中... {exportProgress}%</span>
                                    <div className="w-48 h-2 bg-stone-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-xianxia-gold-600 to-xianxia-gold-400 transition-all duration-300"
                                            style={{ width: `${exportProgress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <span>将导出到世界书【仙侠卡牌RPG记忆库】</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                disabled={isExporting}
                                className="px-4 py-2 bg-stone-700/50 hover:bg-stone-700 text-gray-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                关闭
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isExporting || selectedCount === 0}
                                className="px-4 py-2 bg-gradient-to-r from-xianxia-gold-600 to-xianxia-gold-700 hover:from-xianxia-gold-500 hover:to-xianxia-gold-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <i className="fa-solid fa-upload"></i>
                                <span>导出 ({selectedCount})</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-xianxia-gold-400 to-transparent" />
            </div>
        </div>
    );
};

export default WorldbookExportModal;