import React, { useCallback, useEffect, useState } from 'react';
import { SaveSlot } from '../types';

interface SaveLoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (slotId: number, name: string) => void;
    onLoad: (slotId: number) => void;
    onExport: (slotId: number) => void;
    onImport: (saveSlot: SaveSlot) => void;
    onDelete: (slotId: number) => Promise<void>;
    getSaves: () => Promise<Record<number, SaveSlot | null>>;
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onLoad,
    onExport,
    onImport,
    onDelete,
    getSaves
}) => {
    const [saves, setSaves] = useState<Record<number, SaveSlot | null>>({});
    const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');
    const [deletingSlot, setDeletingSlot] = useState<number | null>(null);
    const [renamingSlot, setRenamingSlot] = useState<number | null>(null);
    const [newName, setNewName] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("文件不是有效的文本文件。");
                }
                const importedData = JSON.parse(text);
                if (importedData.name && importedData.timestamp && importedData.gameState) {
                    onImport(importedData as SaveSlot);
                    fetchSaves();
                } else {
                    alert("无效的存档文件格式。");
                }
            } catch (error) {
                console.error("导入存档失败:", error);
                alert("导入失败，文件可能已损坏或格式不正确。");
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const fetchSaves = useCallback(async () => {
        const savesData = await getSaves();
        setSaves(savesData);
    }, [getSaves]);

    useEffect(() => {
        if (isOpen) {
            fetchSaves();
        }
    }, [isOpen, fetchSaves]);

    if (!isOpen) return null;

    const handleSaveClick = (slotId: number) => {
        const saveData = saves[slotId];
        const defaultName = saveData?.name || `存档 ${slotId}`;
        setRenamingSlot(slotId);
        setNewName(defaultName);
    };

    const confirmSave = async (slotId: number) => {
        if (newName.trim()) {
            onSave(slotId, newName.trim());
            setRenamingSlot(null);
            setNewName('');
            // 延迟刷新以确保保存完成
            setTimeout(() => fetchSaves(), 200);
        }
    };

    const handleDeleteClick = async (slotId: number) => {
        await onDelete(slotId);
        setDeletingSlot(null);
        fetchSaves();
    };

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    };

    const getGameInfo = (saveData: SaveSlot | null): string => {
        if (!saveData) return '';
        const { playerProfile, exploration } = saveData.gameState;
        return `${playerProfile.name} | ${exploration.location} | 灵石: ${playerProfile.spiritStones}`;
    };

    const renderSlot = (slotId: number) => {
        const saveData = saves[slotId];
        const isEmpty = !saveData;
        const isRenaming = renamingSlot === slotId;

        return (
            <div
                key={slotId}
                className={`relative group bg-gradient-to-br ${isEmpty
                        ? 'from-stone-800/40 to-stone-900/40'
                        : 'from-stone-800/80 to-stone-900/80'
                    } rounded-xl p-5 border-2 transition-all duration-300 ${isEmpty
                        ? 'border-stone-700/30 hover:border-stone-600/50'
                        : 'border-amber-900/50 hover:border-amber-700/70 hover:shadow-xl hover:shadow-amber-900/20'
                    }`}
            >
                {/* 存档槽位编号 */}
                <div className="absolute top-2 left-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">{slotId}</span>
                    </div>
                </div>

                {/* 主要内容区域 */}
                <div className="ml-10 mb-3">
                    {isRenaming ? (
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') confirmSave(slotId);
                                    if (e.key === 'Escape') {
                                        setRenamingSlot(null);
                                        setNewName('');
                                    }
                                }}
                                className="flex-1 px-3 py-2 bg-stone-900/80 border border-amber-700/50 rounded-lg text-white font-serif focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                placeholder="输入存档名称..."
                                autoFocus
                            />
                            <button
                                onClick={() => confirmSave(slotId)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-semibold transition-colors"
                            >
                                确定
                            </button>
                            <button
                                onClick={() => {
                                    setRenamingSlot(null);
                                    setNewName('');
                                }}
                                className="px-4 py-2 bg-stone-600 hover:bg-stone-500 rounded-lg text-white font-semibold transition-colors"
                            >
                                取消
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-amber-200 font-serif mb-1 flex items-center gap-2">
                                {saveData ? saveData.name : `空存档位 ${slotId}`}
                                {!isEmpty && activeTab === 'save' && (
                                    <button
                                        onClick={() => handleSaveClick(slotId)}
                                        className="text-xs px-2 py-1 bg-amber-700/50 hover:bg-amber-600/50 rounded text-amber-200 transition-colors"
                                        title="重命名"
                                    >
                                        <i className="fa-solid fa-pen-to-square mr-1"></i>
                                        改名
                                    </button>
                                )}
                            </h3>

                            {saveData ? (
                                <>
                                    <p className="text-sm text-amber-300/80 font-mono mb-1">
                                        <i className="fa-solid fa-clock mr-1"></i>
                                        {formatDate(saveData.timestamp)}
                                    </p>
                                    <p className="text-xs text-stone-400 line-clamp-1">
                                        <i className="fa-solid fa-gamepad mr-1"></i>
                                        {getGameInfo(saveData)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-stone-500 italic">
                                    点击"存档"按钮创建新存档
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* 操作按钮区域 */}
                {!isRenaming && (
                    <div className="flex items-center justify-end gap-2 mt-2">
                        {activeTab === 'save' ? (
                            <button
                                onClick={() => handleSaveClick(slotId)}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 rounded-lg font-bold text-white transition-all duration-200 shadow-lg hover:shadow-sky-500/30 transform hover:scale-105"
                            >
                                <i className="fa-solid fa-floppy-disk mr-2"></i>
                                {isEmpty ? '新建存档' : '覆盖存档'}
                            </button>
                        ) : (
                            <button
                                onClick={() => onLoad(slotId)}
                                disabled={isEmpty}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg font-bold text-white transition-all duration-200 shadow-lg hover:shadow-green-500/30 transform hover:scale-105 disabled:from-stone-700 disabled:to-stone-800 disabled:text-stone-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                <i className="fa-solid fa-folder-open mr-2"></i>
                                读取存档
                            </button>
                        )}

                        <button
                            onClick={() => onExport(slotId)}
                            disabled={isEmpty}
                            className="w-11 h-11 rounded-lg font-semibold text-white bg-purple-700 hover:bg-purple-600 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-purple-500/30 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed disabled:shadow-none"
                            title="导出存档"
                        >
                            <i className="fa-solid fa-download"></i>
                        </button>

                        <button
                            onClick={() => setDeletingSlot(slotId)}
                            disabled={isEmpty}
                            className="w-11 h-11 rounded-lg font-semibold text-white bg-red-800 hover:bg-red-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-red-500/30 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed disabled:shadow-none"
                            title="删除存档"
                        >
                            <i className="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                )}

                {/* 删除确认对话框 */}
                {deletingSlot === slotId && saveData && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeletingSlot(null)}>
                        <div className="bg-gradient-to-br from-stone-800 to-stone-900 border-2 border-red-600/50 rounded-xl w-full max-w-md shadow-2xl p-6 text-center font-serif" onClick={(e) => e.stopPropagation()}>
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600/20 flex items-center justify-center">
                                <i className="fa-solid fa-triangle-exclamation text-red-500 text-3xl"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-red-400 mb-3">确认删除</h3>
                            <p className="text-gray-300 mb-2">
                                你确定要永久删除存档
                            </p>
                            <p className="text-xl font-bold text-amber-300 mb-1">
                                "{saveData.name}"
                            </p>
                            <p className="text-sm text-stone-400 mb-6">
                                此操作无法撤销！
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setDeletingSlot(null)}
                                    className="px-6 py-2.5 bg-stone-600 hover:bg-stone-500 rounded-lg font-semibold text-white transition-colors shadow-lg"
                                >
                                    <i className="fa-solid fa-xmark mr-2"></i>
                                    取消
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(slotId)}
                                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg font-bold text-white transition-all shadow-lg hover:shadow-red-500/30"
                                >
                                    <i className="fa-solid fa-trash-can mr-2"></i>
                                    确认删除
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="ornate-border bg-gradient-to-br from-stone-900 to-black w-full max-w-4xl h-auto max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col border-2 border-amber-900/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 标题栏 */}
                <div className="flex justify-between items-center p-5 flex-shrink-0 bg-gradient-to-r from-amber-900/40 to-stone-900/40 border-b-2 border-amber-900/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
                            <i className="fa-solid fa-floppy-disk text-white text-lg"></i>
                        </div>
                        <h2 className="text-3xl font-bold text-amber-300 font-serif">存档管理</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-stone-700 hover:bg-stone-600 transition-colors flex items-center justify-center text-amber-300 hover:text-white"
                    >
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                {/* 标签页切换 */}
                <div className="flex-shrink-0 px-6 pt-4 flex space-x-2">
                    <button
                        onClick={() => setActiveTab('save')}
                        className={`flex-1 px-6 py-3 text-base font-bold rounded-t-xl transition-all duration-200 ${activeTab === 'save'
                                ? 'bg-gradient-to-b from-amber-700 to-amber-800 text-white shadow-lg border-2 border-amber-600 border-b-0'
                                : 'bg-stone-800/50 text-stone-400 hover:bg-stone-700/70 hover:text-stone-200 border-2 border-stone-700 border-b-0'
                            }`}
                    >
                        <i className="fa-solid fa-floppy-disk mr-2"></i>
                        保存游戏
                    </button>
                    <button
                        onClick={() => setActiveTab('load')}
                        className={`flex-1 px-6 py-3 text-base font-bold rounded-t-xl transition-all duration-200 ${activeTab === 'load'
                                ? 'bg-gradient-to-b from-green-700 to-green-800 text-white shadow-lg border-2 border-green-600 border-b-0'
                                : 'bg-stone-800/50 text-stone-400 hover:bg-stone-700/70 hover:text-stone-200 border-2 border-stone-700 border-b-0'
                            }`}
                    >
                        <i className="fa-solid fa-folder-open mr-2"></i>
                        读取存档
                    </button>
                </div>

                {/* 存档列表 */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {[1, 2, 3, 4, 5].map(slotId => renderSlot(slotId))}
                </div>

                {/* 底部工具栏 */}
                <div className="p-5 bg-gradient-to-r from-stone-900/60 to-black/60 border-t-2 border-stone-700/50 flex-shrink-0">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                        className="hidden"
                        accept="application/json"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/30 transform hover:scale-[1.02]"
                    >
                        <i className="fa-solid fa-file-import mr-2"></i>
                        从文件导入存档
                    </button>
                    <p className="text-center text-xs text-stone-500 mt-3 font-mono">
                        <i className="fa-solid fa-info-circle mr-1"></i>
                        纯手动存档系统 - 不会自动保存游戏进度
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SaveLoadModal;