import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { SaveSlot } from '../types';

interface StartScreenProps {
    onStartNewGame: () => void;
    onLoadGame: (slotId: number) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartNewGame, onLoadGame }) => {
    const [saves, setSaves] = useState<Record<number, SaveSlot | null>>({});
    const [showLoadMenu, setShowLoadMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadSaves();
    }, []);

    const loadSaves = async () => {
        const allSaves = await storageService.getAllSaves();
        setSaves(allSaves);
    };

    const handleLoadGame = async (slotId: number) => {
        setIsLoading(true);
        try {
            await onLoadGame(slotId);
        } catch (error) {
            console.error('加载存档失败:', error);
            alert('加载存档失败，请重试。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
                backgroundImage: `url('https://github.com/zzq0219/sillytavern/blob/main/%E3%80%90%E5%93%B2%E9%A3%8E%E5%A3%81%E7%BA%B8%E3%80%91%E4%BA%91%E9%9B%BE-%E4%BB%99%E4%BE%A0.png?raw=true')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* 深色遮罩 */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            {/* 主内容 */}
            <div className="relative z-10 flex flex-col items-center space-y-8 px-4">
                {/* 游戏标题 */}
                <div className="text-center space-y-4 animate-fade-in">
                    <h1 className="text-6xl md:text-7xl font-bold text-gradient-gold text-shadow-glow font-serif tracking-wider">
                        仙侠卡牌RPG
                    </h1>
                    <p className="text-xl md:text-2xl text-amber-200/90 font-serif tracking-widest text-shadow">
                        红尘万丈 · 仙路漫漫
                    </p>
                </div>

                {/* 按钮区域 */}
                {!showLoadMenu ? (
                    <div className="flex flex-col space-y-4 w-full max-w-md animate-slide-up">
                        {/* 开始游戏按钮 */}
                        <button
                            onClick={onStartNewGame}
                            disabled={isLoading}
                            className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-lg
                                     text-white font-bold text-xl tracking-wider font-serif
                                     border-2 border-amber-400/50 shadow-2xl
                                     hover:shadow-amber-500/50 hover:scale-105 hover:border-amber-300
                                     active:scale-95 transition-all duration-300
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center space-x-2">
                                <i className="fa-solid fa-play"></i>
                                <span>开始游戏</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </button>

                        {/* 读取存档按钮 */}
                        <button
                            onClick={() => setShowLoadMenu(true)}
                            disabled={isLoading}
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-lg
                                     text-white font-bold text-xl tracking-wider font-serif
                                     border-2 border-blue-400/50 shadow-2xl
                                     hover:shadow-blue-500/50 hover:scale-105 hover:border-blue-300
                                     active:scale-95 transition-all duration-300
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center space-x-2">
                                <i className="fa-solid fa-folder-open"></i>
                                <span>读取存档</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl animate-fade-in">
                        {/* 存档列表 */}
                        <div className="glass-morphism rounded-xl p-6 border border-stone-700/50 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gradient-gold font-serif">选择存档</h2>
                                <button
                                    onClick={() => setShowLoadMenu(false)}
                                    className="text-amber-300 hover:text-white transition-colors"
                                >
                                    <i className="fa-solid fa-times text-2xl"></i>
                                </button>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-xianxia">
                                {[1, 2, 3, 4, 5].map((slotId) => {
                                    const save = saves[slotId];
                                    if (!save) {
                                        return (
                                            <div
                                                key={slotId}
                                                className="p-4 bg-stone-800/50 rounded-lg border border-stone-700/50 text-gray-500 text-center"
                                            >
                                                <i className="fa-solid fa-inbox mr-2"></i>
                                                存档槽 {slotId} - 空
                                            </div>
                                        );
                                    }

                                    return (
                                        <button
                                            key={slotId}
                                            onClick={() => handleLoadGame(slotId)}
                                            disabled={isLoading}
                                            className="w-full p-4 bg-gradient-to-r from-stone-800/80 to-stone-900/80 rounded-lg
                                                     border border-stone-700/50 hover:border-amber-500/50
                                                     text-left transition-all duration-300
                                                     hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/20
                                                     disabled:opacity-50 disabled:cursor-not-allowed
                                                     group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="text-amber-400 font-bold font-serif">
                                                            存档 {slotId}
                                                        </span>
                                                        <span className="text-gray-400">|</span>
                                                        <span className="text-white font-semibold">
                                                            {save.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-400 space-y-1">
                                                        <div>
                                                            <i className="fa-solid fa-user mr-2"></i>
                                                            {save.gameState.playerProfile.name}
                                                        </div>
                                                        <div>
                                                            <i className="fa-solid fa-location-dot mr-2"></i>
                                                            {save.gameState.exploration.location}
                                                        </div>
                                                        <div>
                                                            <i className="fa-solid fa-clock mr-2"></i>
                                                            {new Date(save.timestamp).toLocaleString('zh-CN')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full 
                                                              bg-amber-500/20 group-hover:bg-amber-500/40 
                                                              transition-colors duration-300">
                                                    <i className="fa-solid fa-play text-amber-400"></i>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-4 pt-4 border-t border-stone-700/50">
                                <button
                                    onClick={() => setShowLoadMenu(false)}
                                    className="w-full px-4 py-2 bg-stone-700/50 hover:bg-stone-700 rounded-lg
                                             text-gray-300 hover:text-white transition-all duration-300
                                             border border-stone-600/50"
                                >
                                    <i className="fa-solid fa-arrow-left mr-2"></i>
                                    返回
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 版本信息 */}
                <div className="absolute bottom-4 right-4 text-gray-400/70 text-sm font-mono">
                    v1.0.0
                </div>
            </div>

            {/* 加载动画 */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
                        <p className="text-amber-200 text-xl font-serif">加载中...</p>
                    </div>
                </div>
            )}
        </div>
    );
};