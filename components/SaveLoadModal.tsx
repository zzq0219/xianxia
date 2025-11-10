import React, { useState, useEffect } from 'react';
import { GameState, SaveSlot } from '../types';

interface SaveLoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (slotId: number, name: string) => void;
    onLoad: (slotId: number) => void;
    onExport: (slotId: number) => void;
    onImport: (saveSlot: SaveSlot) => void;
    getSaves: () => Promise<Record<number, SaveSlot | null>>;
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({ isOpen, onClose, onSave, onLoad, onExport, onImport, getSaves }) => {
    const [saves, setSaves] = useState<Record<number, SaveSlot | null>>({});
    const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File is not a valid text file.");
                }
                const importedData = JSON.parse(text);
                // Basic validation to check if it's a valid SaveSlot
                if (importedData.name && importedData.timestamp && importedData.gameState) {
                    onImport(importedData as SaveSlot);
                } else {
                    alert("无效的存档文件格式。");
                }
            } catch (error) {
                console.error("导入存档失败:", error);
                alert("导入失败，文件可能已损坏或格式不正确。");
            }
        };
        reader.readAsText(file);
        // Reset file input to allow importing the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        if (isOpen) {
            const fetchSaves = async () => {
                const savesData = await getSaves();
                setSaves(savesData);
            };
            fetchSaves();
        }
    }, [isOpen, getSaves]);

    if (!isOpen) return null;

    const renderSlot = (slotId: number) => {
        const saveData = saves[slotId];
        const handleSaveClick = () => {
            const name = prompt("请输入存档名称：", saveData?.name || `存档 ${slotId}`);
            if (name) {
                onSave(slotId, name);
            }
        };
        const action = activeTab === 'save' ? handleSaveClick : () => onLoad(slotId);
        const buttonText = activeTab === 'save' ? '存档' : '读档';
        const buttonColor = activeTab === 'save' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500';

        return (
            <div key={slotId} className="bg-stone-800/50 p-4 rounded-lg flex justify-between items-center border border-stone-700/50">
                <div>
                    <h3 className="font-bold text-white">{saveData ? saveData.name : `存档位 ${slotId}`}</h3>
                    {saveData ? (
                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(saveData.timestamp).toLocaleString()}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-1 italic">空存档</p>
                    )}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onExport(slotId)}
                        className="px-4 py-2 rounded-md font-semibold text-white bg-gray-600 hover:bg-gray-500 transition-colors"
                        disabled={!saveData}
                    >
                        导出
                    </button>
                    <button
                        onClick={action}
                        className={`px-6 py-2 rounded-md font-semibold text-white transition-colors ${buttonColor}`}
                        disabled={activeTab === 'load' && !saveData}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="ornate-border bg-stone-900 w-full max-w-2xl h-auto max-h-[80vh] rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/20">
                    <h2 className="text-2xl font-bold text-amber-300 font-serif">系统菜单</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>
                <div className="flex-shrink-0 px-4 flex space-x-2 border-b border-stone-700">
                    <button onClick={() => setActiveTab('save')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'save' ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50'}`}>存档</button>
                    <button onClick={() => setActiveTab('load')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'load' ? 'bg-stone-700/80 text-amber-400 border-b-2 border-amber-400' : 'bg-transparent text-gray-400 hover:bg-stone-700/50'}`}>读档</button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map(slotId => renderSlot(slotId))}
                </div>
                <div className="p-4 bg-black/20 border-t border-stone-700">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                        className="hidden"
                        accept="application/json"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-6 py-3 rounded-md font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
                    >
                        导入存档
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveLoadModal;