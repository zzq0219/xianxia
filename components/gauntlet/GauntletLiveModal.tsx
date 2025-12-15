import React, { useCallback, useMemo, useState } from 'react';
import { getActiveContestants, getCurrentRound } from '../../services/gauntlet';
import { handlePlayerDanmaku, runRoundFlow } from '../../services/gauntlet/gauntletFlowService';
import { GameState } from '../../types';
import { ResponsiveModal } from '../ResponsiveModal';

interface GauntletLiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

type TabType = 'contestants' | 'challenge' | 'ranking' | 'replay';
type ViewMode = 'group' | 'individual';

/**
 * 大闯关直播间界面
 * 
 * 布局设计：
 * ┌────────────────────────────────────────────────────────┐
 * │  [<]  第X届大闯关 - 第2轮：谜题迷宫   [设置] [全屏]   │
 * ├────────────────────────────────────────────────────────┤
 * │  ┌──────────────────────────────────────────────────┐ │
 * │  │          【表演/叙事展示区】                     │ │
 * │  │  云梦仙子轻盈一跃，落在第一个浮板上...          │ │
 * │  │  ═══════════════════════════════════════════    │ │
 * │  │  ↑ 666 ↑ 太强了 ↑ 云梦加油 ↑ 这波稳了 ↑        │ │
 * │  └──────────────────────────────────────────────────┘ │
 * │  ┌──────────┐  ┌────────────────────────────────┐    │
 * │  │ 解说席   │  │         评委席                 │    │
 * │  │ 💬 精彩！ │  │  [严判官] [柔导师] [智长老]   │    │
 * │  └──────────┘  └────────────────────────────────┘    │
 * │  [参赛者] [关卡] [排名] [回放]                        │
 * │  观看: ⦿群体 ○个人   弹幕: [_______][发送]           │
 * └────────────────────────────────────────────────────────┘
 */
export const GauntletLiveModal: React.FC<GauntletLiveModalProps> = ({
    isOpen,
    onClose,
    gameState,
    setGameState,
}) => {
    const { gauntletSystem } = gameState;
    const currentEvent = gauntletSystem.currentEvent;

    // 状态
    const [activeTab, setActiveTab] = useState<TabType>('contestants');
    const [viewMode, setViewMode] = useState<ViewMode>('group');
    const [danmakuInput, setDanmakuInput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [displayedNarrative, setDisplayedNarrative] = useState<string[]>([]);
    const [focusedContestantId, setFocusedContestantId] = useState<string | null>(null);

    // 获取当前轮次
    const currentRound = useMemo(() => {
        if (!currentEvent) return null;
        return getCurrentRound(currentEvent);
    }, [currentEvent]);

    // 获取活跃参赛者
    const activeContestants = useMemo(() => {
        if (!currentEvent) return [];
        return getActiveContestants(currentEvent);
    }, [currentEvent]);

    // 获取弹幕历史
    const danmakuHistory = useMemo(() => {
        if (!currentRound) return [];
        return currentRound.danmakuHistory || [];
    }, [currentRound]);

    // 获取解说内容
    const commentary = useMemo(() => {
        if (!currentRound) return [];
        return currentRound.commentary || [];
    }, [currentRound]);

    // 获取评委列表
    const judges = useMemo(() => {
        if (!currentEvent) return [];
        return currentEvent.judges || [];
    }, [currentEvent]);

    // 获取排名
    const rankings = useMemo(() => {
        if (!currentRound) return [];
        return currentRound.rankings || [];
    }, [currentRound]);

    // 发送弹幕
    const handleSendDanmaku = useCallback(async () => {
        if (!danmakuInput.trim() || !currentEvent) return;

        try {
            const result = await handlePlayerDanmaku(currentEvent, danmakuInput, gameState);

            setGameState(prev => ({
                ...prev,
                gauntletSystem: {
                    ...prev.gauntletSystem,
                    currentEvent: result.event
                }
            }));

            // 添加AI生成的叙事到显示
            if (result.response.narrative) {
                setDisplayedNarrative(prev => [...prev, result.response.narrative]);
            }

            setDanmakuInput('');
        } catch (error) {
            console.error('[直播间] 发送弹幕失败:', error);
        }
    }, [danmakuInput, currentEvent, gameState, setGameState]);

    // 开始/继续比赛
    const handleStartRound = useCallback(async () => {
        if (!currentEvent || isRunning) return;

        setIsRunning(true);
        try {
            const updatedEvent = await runRoundFlow(currentEvent, gameState, {
                onProgress: (stage, progress, message) => {
                    console.log(`[直播间] ${stage}: ${progress}% - ${message}`);
                    setDisplayedNarrative(prev => [...prev, `[${stage}] ${message}`]);
                },
                onError: (error, stage) => {
                    console.error(`[直播间] ${stage} 失败:`, error);
                    setDisplayedNarrative(prev => [...prev, `[错误] ${stage}: ${error.message}`]);
                },
                onStageComplete: (stage) => {
                    console.log(`[直播间] ${stage} 完成`);
                }
            });

            setGameState(prev => ({
                ...prev,
                gauntletSystem: {
                    ...prev.gauntletSystem,
                    currentEvent: updatedEvent
                }
            }));
        } catch (error) {
            console.error('[直播间] 比赛执行失败:', error);
        } finally {
            setIsRunning(false);
        }
    }, [currentEvent, gameState, isRunning, setGameState]);

    // 如果没有赛事或赛事未开始
    if (!currentEvent) {
        return (
            <ResponsiveModal
                isOpen={isOpen}
                onClose={onClose}
                title="大闯关直播间"
                size="xl"
            >
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">📺</div>
                    <p className="text-lg">暂无进行中的赛事</p>
                    <button
                        onClick={onClose}
                        className="mt-6 px-6 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg"
                    >
                        返回大厅
                    </button>
                </div>
            </ResponsiveModal>
        );
    }

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title={`第${currentEvent.edition}届大闯关 - 第${currentRound?.roundNumber || 0}轮：${currentRound?.challenge?.name || '准备中'}`}
            size="xl"
        >
            <div className="space-y-4">
                {/* ===== 表演/叙事展示区 ===== */}
                <div className="bg-gradient-to-b from-black/40 to-black/20 rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-y-auto border border-stone-700/50">
                    {/* 关卡描述 */}
                    {currentRound?.challenge && (
                        <div className="mb-4 pb-3 border-b border-stone-700/50">
                            <div className="text-amber-300 font-semibold mb-1">
                                【{currentRound.challenge.type}关卡】{currentRound.challenge.name}
                            </div>
                            <div className="text-gray-300 text-sm">
                                {currentRound.challenge.finalVersion || currentRound.challenge.description}
                            </div>
                        </div>
                    )}

                    {/* 表演内容 */}
                    {viewMode === 'group' ? (
                        // 群体模式 - 显示所有表演
                        <div className="space-y-3">
                            {currentRound?.performances && currentRound.performances.length > 0 ? (
                                currentRound.performances.map((perf, index) => (
                                    <div
                                        key={perf.contestantId}
                                        className={`p-3 rounded-lg ${perf.passed === true
                                            ? 'bg-green-900/20 border border-green-700/30'
                                            : perf.passed === false
                                                ? 'bg-red-900/20 border border-red-700/30'
                                                : 'bg-stone-800/30'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-white">
                                                {perf.contestantName}
                                            </span>
                                            {perf.score > 0 && (
                                                <span className="text-amber-400">
                                                    得分: {perf.score.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-gray-300 text-sm">
                                            {perf.narrative || '等待表演...'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 text-center py-8">
                                    {isRunning ? '比赛进行中...' : '比赛尚未开始，点击下方按钮开始本轮比赛'}
                                </div>
                            )}
                        </div>
                    ) : (
                        // 个人模式 - 显示聚焦的选手
                        <div>
                            {focusedContestantId ? (
                                (() => {
                                    const perf = currentRound?.performances?.find(
                                        p => p.contestantId === focusedContestantId
                                    );
                                    if (!perf) return <div className="text-gray-400">选手尚未表演</div>;
                                    return (
                                        <div className="p-4 bg-stone-800/30 rounded-lg">
                                            <div className="text-xl font-bold text-white mb-3">
                                                {perf.contestantName}
                                            </div>
                                            <div className="text-gray-300 whitespace-pre-wrap">
                                                {perf.narrative}
                                            </div>
                                            {perf.score > 0 && (
                                                <div className="mt-3 text-lg text-amber-400">
                                                    得分: {perf.score.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="text-gray-400 text-center py-8">
                                    请在下方选择要聚焦的选手
                                </div>
                            )}
                        </div>
                    )}

                    {/* 实时叙事显示 */}
                    {displayedNarrative.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-stone-700/50">
                            {displayedNarrative.slice(-5).map((text, index) => (
                                <div key={index} className="text-sm text-gray-400 mb-1">
                                    {text}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 弹幕飘过区域 */}
                    {danmakuHistory.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-amber-700/30 bg-black/20 rounded p-2">
                            <div className="flex flex-wrap gap-2 text-sm">
                                {danmakuHistory.slice(-10).map((dm, index) => (
                                    <span
                                        key={dm.id || index}
                                        className={`px-2 py-1 rounded ${dm.type === 'player'
                                            ? 'bg-amber-700/30 text-amber-300'
                                            : 'bg-stone-700/30 text-gray-300'
                                            }`}
                                    >
                                        {dm.author && <span className="mr-1 opacity-70">{dm.author}:</span>}
                                        {dm.content}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== 解说席和评委席 ===== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 解说席 */}
                    <div className="bg-black/20 rounded-lg p-3 border border-stone-700/30">
                        <h4 className="text-sm font-semibold text-purple-300 mb-2">
                            <i className="fa-solid fa-microphone mr-2"></i>
                            解说席
                        </h4>
                        <div className="space-y-2 max-h-24 overflow-y-auto text-sm">
                            {commentary.length > 0 ? (
                                commentary.slice(-3).map((c, index) => (
                                    <div key={c.id || index} className="text-gray-300">
                                        <span className="text-purple-400">{c.speaker}:</span> {c.content}
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 italic">等待解说...</div>
                            )}
                        </div>
                    </div>

                    {/* 评委席 */}
                    <div className="md:col-span-2 bg-black/20 rounded-lg p-3 border border-stone-700/30">
                        <h4 className="text-sm font-semibold text-amber-300 mb-2">
                            <i className="fa-solid fa-gavel mr-2"></i>
                            评委席
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {judges.length > 0 ? (
                                judges.map((judge, index) => (
                                    <div
                                        key={judge.id}
                                        className="px-3 py-2 bg-stone-800/50 rounded-lg text-center"
                                    >
                                        <div className="text-white font-semibold text-sm">
                                            {judge.name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {judge.specialty}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 italic">评委尚未就位</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== 标签切换区 ===== */}
                <div className="flex gap-2 border-b border-stone-700/50 pb-2">
                    {[
                        { id: 'contestants', label: '参赛者', icon: 'fa-users' },
                        { id: 'challenge', label: '关卡', icon: 'fa-flag' },
                        { id: 'ranking', label: '排名', icon: 'fa-ranking-star' },
                        { id: 'replay', label: '回放', icon: 'fa-clock-rotate-left' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-all
                                ${activeTab === tab.id
                                    ? 'bg-stone-700 text-white'
                                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-stone-800/50'
                                }`}
                        >
                            <i className={`fa-solid ${tab.icon} mr-2`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ===== 标签内容区 ===== */}
                <div className="bg-black/20 rounded-lg p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
                    {activeTab === 'contestants' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {activeContestants.map((contestant) => (
                                <button
                                    key={contestant.id}
                                    onClick={() => {
                                        setFocusedContestantId(contestant.id);
                                        setViewMode('individual');
                                    }}
                                    className={`p-2 rounded-lg text-left text-sm transition-all
                                        ${focusedContestantId === contestant.id
                                            ? 'bg-amber-700/30 border border-amber-600'
                                            : 'bg-stone-800/50 hover:bg-stone-700/50'
                                        }
                                        ${contestant.isPlayerCharacter ? 'ring-1 ring-green-500' : ''}
                                    `}
                                >
                                    <div className="font-semibold text-white truncate">
                                        {contestant.name}
                                        {contestant.isPlayerCharacter && (
                                            <span className="ml-1 text-xs text-green-400">★</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400">{contestant.realm}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'challenge' && currentRound?.challenge && (
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-400">关卡名称:</span>
                                <span className="ml-2 text-white font-semibold">
                                    {currentRound.challenge.name}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">类型:</span>
                                <span className="ml-2 text-amber-300">
                                    {currentRound.challenge.type}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">难度:</span>
                                <span className="ml-2 text-yellow-400">
                                    {'★'.repeat(currentRound.challenge.difficulty)}
                                    {'☆'.repeat(5 - currentRound.challenge.difficulty)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">描述:</span>
                                <div className="mt-1 text-gray-300 text-sm">
                                    {currentRound.challenge.finalVersion || currentRound.challenge.description}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ranking' && (
                        <div className="space-y-2">
                            {rankings.length > 0 ? (
                                rankings.map((entry, index) => (
                                    <div
                                        key={entry.contestantId}
                                        className={`flex items-center justify-between p-2 rounded
                                            ${index === 0 ? 'bg-amber-900/30' :
                                                index === 1 ? 'bg-gray-600/30' :
                                                    index === 2 ? 'bg-orange-900/30' : 'bg-stone-800/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold w-8 text-center">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                                            </span>
                                            <span className="text-white font-semibold">
                                                {entry.contestantName}
                                            </span>
                                        </div>
                                        <span className="text-amber-400 font-semibold">
                                            {entry.score.toFixed(1)}分
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 text-center py-4">
                                    本轮比赛尚未开始，暂无排名
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'replay' && (
                        <div className="text-gray-400 text-center py-8">
                            <i className="fa-solid fa-clock-rotate-left text-4xl mb-2"></i>
                            <p>回放功能开发中</p>
                        </div>
                    )}
                </div>

                {/* ===== 底部控制区 ===== */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-700/50">
                    {/* 观看模式 */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">观看:</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="radio"
                                name="viewMode"
                                checked={viewMode === 'group'}
                                onChange={() => setViewMode('group')}
                                className="text-amber-500"
                            />
                            <span className="text-sm text-gray-300">群体</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="radio"
                                name="viewMode"
                                checked={viewMode === 'individual'}
                                onChange={() => setViewMode('individual')}
                                className="text-amber-500"
                            />
                            <span className="text-sm text-gray-300">个人</span>
                        </label>
                    </div>

                    {/* 比赛控制 */}
                    <div className="flex items-center gap-2">
                        {currentEvent.status === 'in_progress' && !isRunning && (
                            <button
                                onClick={handleStartRound}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 
                                         hover:from-green-500 hover:to-emerald-500 rounded-lg 
                                         text-white font-semibold text-sm"
                            >
                                <i className="fa-solid fa-play mr-2"></i>
                                开始本轮
                            </button>
                        )}
                        {isRunning && (
                            <div className="px-4 py-2 bg-amber-600/50 rounded-lg text-amber-200 text-sm">
                                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                比赛进行中...
                            </div>
                        )}
                    </div>

                    {/* 弹幕输入 */}
                    <div className="flex items-center gap-2 flex-grow max-w-md">
                        <span className="text-sm text-gray-400">弹幕:</span>
                        <input
                            type="text"
                            value={danmakuInput}
                            onChange={(e) => setDanmakuInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendDanmaku()}
                            placeholder="发送弹幕..."
                            className="flex-grow px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg 
                                     text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-600"
                        />
                        <button
                            onClick={handleSendDanmaku}
                            disabled={!danmakuInput.trim()}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 
                                     disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold"
                        >
                            发送
                        </button>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    );
};

export default GauntletLiveModal;