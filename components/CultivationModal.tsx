import React, { useEffect, useState } from 'react';
import { CharacterCard, CultivationSlot, PetCard, PlayerProfile } from '../types';
import { getRarityBorderColor, getRarityTextColor } from './rarityHelpers';

interface CultivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerProfile: PlayerProfile;
    cultivationSlots: CultivationSlot[];
    onStartCultivation: (slotId: number, parentAId: string, parentBId: string) => void;
    onClaimCultivation: (slotId: number) => void;
    onGetLiveMonitoring: (slotId: number) => Promise<string>;
    busyCharacterIds: Set<string>;
    onOpenSelector: (title: string, list: (CharacterCard | PetCard)[], onSelect: (card: CharacterCard | PetCard) => void) => void;
}

const CountdownTimer: React.FC<{ endTime: number }> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            const newTimeLeft = endTime - Date.now();
            if (newTimeLeft <= 0) {
                clearInterval(timer);
            }
            setTimeLeft(newTimeLeft);
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime, timeLeft]);

    if (timeLeft <= 0) {
        return <span className="text-green-400 font-bold">培育完成</span>;
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        <span className="font-mono text-lg tracking-wider">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
    );
};

const CultivationSlotUI: React.FC<{
    slot: CultivationSlot;
    playerProfile: PlayerProfile;
    onStartCultivation: (slotId: number, parentAId: string, parentBId: string) => void;
    onClaimCultivation: (slotId: number) => void;
    onGetLiveMonitoring: (slotId: number) => Promise<string>;
    busyCharacterIds: Set<string>;
    onOpenSelector: (title: string, list: (CharacterCard | PetCard)[], onSelect: (card: CharacterCard | PetCard) => void) => void;
}> = ({ slot, playerProfile, onStartCultivation, onClaimCultivation, onGetLiveMonitoring, busyCharacterIds, onOpenSelector }) => {
    const [parentA, setParentA] = useState<CharacterCard | PetCard | null>(null);
    const [parentB, setParentB] = useState<CharacterCard | PetCard | null>(null);
    const [monitoringTab, setMonitoringTab] = useState<'live' | 'log'>('live');
    const [liveMonitoringText, setLiveMonitoringText] = useState('待机中...');
    const [isMonitoringLoading, setIsMonitoringLoading] = useState(false);

    // 调试日志：监控slot状态变化
    useEffect(() => {
        console.log(`[育灵仓UI] 培育仓 #${slot.slotId} 状态: ${slot.status}, endTime: ${slot.endTime}, now: ${Date.now()}, 剩余时间: ${slot.endTime - Date.now()}ms`);
    }, [slot.status, slot.endTime, slot.slotId]);


    const handleStart = () => {
        if (parentA && parentB) {
            onStartCultivation(slot.slotId, parentA.id, parentB.id);
        }
    };

    const handleLiveMonitorClick = async () => {
        setIsMonitoringLoading(true);
        try {
            const text = await onGetLiveMonitoring(slot.slotId);
            setLiveMonitoringText(text);
        } catch (error) {
            setLiveMonitoringText("监视信号中断...");
        } finally {
            setIsMonitoringLoading(false);
        }
    };

    const renderCardSelector = (parentSlot: 'A' | 'B') => {
        const currentSelection = parentSlot === 'A' ? parentA : parentB;

        const handleOpen = () => {
            if (parentSlot === 'A') {
                const available = [...playerProfile.cardCollection, ...playerProfile.petCollection].filter(c => !busyCharacterIds.has(c.id));
                onOpenSelector('选择亲本 A', available, (card) => {
                    setParentA(card);
                    setParentB(null); // Reset parent B when A changes
                });
            } else {
                if (!parentA) return;
                const isParentAPet = 'skill' in parentA;
                let compatiblePartners: (CharacterCard | PetCard)[] = [];
                if (isParentAPet) {
                    compatiblePartners = playerProfile.cardCollection.filter(c => c.gender !== parentA.gender && !busyCharacterIds.has(c.id));
                } else {
                    compatiblePartners = playerProfile.petCollection.filter(p => p.gender !== parentA.gender && !busyCharacterIds.has(p.id));
                }
                onOpenSelector('选择亲本 B', compatiblePartners, (card) => {
                    setParentB(card);
                });
            }
        };

        return (
            <button
                onClick={handleOpen}
                disabled={parentSlot === 'B' && !parentA}
                className="w-full md:w-48 h-40 md:h-64 bg-black/30 rounded-lg flex flex-col items-center justify-center ornate-border border-dashed border-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:border-amber-500/50"
            >
                {currentSelection ? (
                    <div className={`w-full h-full rounded-lg p-3 flex flex-col items-center justify-center text-center ${getRarityBorderColor(currentSelection.rarity)}`}>
                        <p className="font-bold text-base md:text-lg truncate w-full px-2">{currentSelection.name}</p>
                        <p className={`text-xs md:text-sm mt-1 ${getRarityTextColor(currentSelection.rarity)}`}>{currentSelection.rarity}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <span className="text-stone-500 text-3xl md:text-4xl mb-2">+</span>
                        <span className="text-stone-500 text-xs">选择{parentSlot === 'A' ? '亲本A' : '亲本B'}</span>
                    </div>
                )}
            </button>
        );
    };

    if (slot.status === 'Empty') {
        return (
            <div className="flex flex-col items-center w-full px-2 md:px-4">
                {/* 移动端垂直布局，桌面端水平布局 */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center w-full max-w-2xl">
                    {renderCardSelector('A')}
                    <div className="text-3xl md:text-4xl font-bold text-gradient-gold">🧬</div>
                    {renderCardSelector('B')}
                </div>
                <button
                    onClick={handleStart}
                    disabled={!parentA || !parentB}
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-full shadow-glow-green disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 text-base md:text-lg"
                >
                    开始培育
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 md:gap-4 w-full px-2 md:px-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* 状态卡片 - 更紧凑的设计 */}
            <div className="w-full max-w-lg bg-gradient-to-br from-stone-800/80 to-stone-900/80 rounded-xl p-4 border border-stone-700/50">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg md:text-xl font-bold text-amber-400">培育状态</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${slot.status === 'Breeding' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-green-500/20 text-green-300'}`}>
                        {slot.status === 'Breeding' ? '进行中' : '已完成'}
                    </div>
                </div>

                {/* 倒计时显示 */}
                <div className="text-center py-4 bg-black/30 rounded-lg">
                    {slot.status === 'Breeding' ? (
                        <div>
                            <p className="text-stone-400 text-sm mb-2">能量融合中...</p>
                            <div className="text-2xl md:text-3xl font-mono text-cyan-300">
                                <CountdownTimer endTime={slot.endTime} />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-pulse">
                            <div className="text-4xl mb-2">✨</div>
                            <p className="text-green-400 font-bold text-xl md:text-2xl">培育完成！</p>
                            <p className="text-stone-400 text-sm mt-2">灵胎已成熟，请开启查看</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 亲本信息 - 响应式布局 */}
            <div className="w-full max-w-lg">
                <h4 className="text-sm text-stone-400 mb-2 text-center">融合亲本</h4>
                <div className="flex gap-3 md:gap-4 justify-center">
                    <div className={`flex-1 max-w-[45%] bg-black/50 rounded-lg p-3 flex flex-col items-center justify-center text-center ornate-border ${getRarityBorderColor(slot.parentA!.rarity)}`}>
                        <p className="font-bold text-sm md:text-base truncate w-full">{slot.parentA!.name}</p>
                        <p className={`text-xs ${getRarityTextColor(slot.parentA!.rarity)}`}>{slot.parentA!.rarity}</p>
                    </div>
                    <div className="flex items-center justify-center text-amber-400">
                        <span className="text-xl">✕</span>
                    </div>
                    <div className={`flex-1 max-w-[45%] bg-black/50 rounded-lg p-3 flex flex-col items-center justify-center text-center ornate-border ${getRarityBorderColor(slot.parentB!.rarity)}`}>
                        <p className="font-bold text-sm md:text-base truncate w-full">{slot.parentB!.name}</p>
                        <p className={`text-xs ${getRarityTextColor(slot.parentB!.rarity)}`}>{slot.parentB!.rarity}</p>
                    </div>
                </div>
            </div>

            {/* 监控面板 - 优化高度 */}
            <div className="w-full max-w-lg bg-black/50 rounded-lg ornate-border border-stone-700 flex flex-col">
                <div className="flex-shrink-0 flex border-b border-stone-700">
                    <button
                        onClick={() => setMonitoringTab('live')}
                        className={`flex-1 py-2 px-2 text-xs md:text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${monitoringTab === 'live' ? 'bg-stone-700 text-amber-400' : 'text-stone-400 hover:bg-stone-800'}`}
                    >
                        <span>📡</span>
                        <span>实时监视</span>
                    </button>
                    <button
                        onClick={() => setMonitoringTab('log')}
                        className={`flex-1 py-2 px-2 text-xs md:text-sm font-semibold transition-colors flex items-center justify-center gap-1 ${monitoringTab === 'log' ? 'bg-stone-700 text-amber-400' : 'text-stone-400 hover:bg-stone-800'}`}
                    >
                        <span>📋</span>
                        <span>监视日志</span>
                    </button>
                </div>
                <div className="p-3 h-32 md:h-40 overflow-y-auto scrollbar-xianxia text-xs md:text-sm text-gray-300">
                    {monitoringTab === 'live' ? (
                        <div className="whitespace-pre-wrap">
                            {isMonitoringLoading ? '正在连接信号...' : liveMonitoringText}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {slot.monitoringLog.length > 0 ? (
                                slot.monitoringLog.map((log, idx) => (
                                    <p key={`${log.timestamp}-${idx}`} className="text-gray-300">
                                        <span className="text-amber-400">[{log.timestamp}]</span> {log.message}
                                    </p>
                                ))
                            ) : (
                                <p className="text-stone-500 text-center">暂无日志记录</p>
                            )}
                        </div>
                    )}
                </div>
                {monitoringTab === 'live' && slot.status === 'Breeding' && (
                    <button
                        onClick={handleLiveMonitorClick}
                        className="flex-shrink-0 w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-xs transition-colors"
                    >
                        🔄 刷新监视信号
                    </button>
                )}
            </div>

            {/* 开启按钮 - 更显眼 */}
            {slot.status === 'Ready' && (
                <button
                    onClick={() => onClaimCultivation(slot.slotId)}
                    className="w-full max-w-lg mt-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-lg rounded-xl shadow-glow-gold animate-pulse-slow transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                    ✨ 开启灵胎 ✨
                </button>
            )}
        </div>
    );
};


export const CultivationModal: React.FC<CultivationModalProps> = ({ isOpen, onClose, playerProfile, cultivationSlots, onStartCultivation, onClaimCultivation, onGetLiveMonitoring, busyCharacterIds, onOpenSelector }) => {
    const [activeSlotId, setActiveSlotId] = useState(1);

    if (!isOpen) return null;

    const activeSlot = cultivationSlots.find(s => s.slotId === activeSlotId);

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="w-full max-w-4xl h-[90vh] ornate-border border-xianxia-gold-600 bg-gradient-to-br from-stone-900 via-stone-950 to-black rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 flex-shrink-0 bg-black/30 border-b border-xianxia-gold-700/50">
                    <h2 className="text-3xl font-bold text-gradient-gold text-shadow-glow font-serif">育灵轩</h2>
                    <button onClick={onClose} className="text-amber-300 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>

                <div className="flex flex-grow">
                    {/* Slot Navigation */}
                    <div className="w-1/4 border-r border-stone-700/50 p-4 flex flex-col gap-3">
                        <h3 className="text-lg font-semibold text-amber-400 mb-2">培育仓</h3>
                        {cultivationSlots.map(slot => (
                            <button
                                key={slot.slotId}
                                onClick={() => setActiveSlotId(slot.slotId)}
                                className={`w-full p-3 rounded-lg text-left transition-all duration-200 border-2 ${activeSlotId === slot.slotId ? 'bg-stone-700/80 border-amber-500' : 'bg-stone-800/50 border-transparent hover:bg-stone-700/50'}`}
                            >
                                <p className="font-bold">培育仓 #{slot.slotId}</p>
                                <p className={`text-sm ${slot.status === 'Empty' ? 'text-gray-400' : slot.status === 'Breeding' ? 'text-cyan-400' : 'text-green-400'}`}>
                                    状态: {slot.status}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="w-3/4 p-6 flex items-center justify-center">
                        {activeSlot ? (
                            <CultivationSlotUI
                                slot={activeSlot}
                                playerProfile={playerProfile}
                                onStartCultivation={onStartCultivation}
                                onClaimCultivation={onClaimCultivation}
                                onGetLiveMonitoring={onGetLiveMonitoring}
                                busyCharacterIds={busyCharacterIds}
                                onOpenSelector={onOpenSelector}
                            />
                        ) : (
                            <p>选择一个培育仓以开始。</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};