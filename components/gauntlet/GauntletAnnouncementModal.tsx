import React, { useState } from 'react';
import { GameState } from '../../types';
import { ChallengeDesign, ChallengeOptimization } from '../../types/gauntlet.types';
import { ResponsiveModal } from '../ResponsiveModal';

interface GauntletAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    onGenerateAllDrafts?: () => Promise<void>;
    onStartAllOptimization?: () => Promise<void>;
    onOptimizeChallenge?: (roundNumber: number, optimizationRound: 1 | 2 | 3) => Promise<void>;
}

/**
 * 关卡公告栏界面
 * 
 * 设计文档布局：
 * ┌──────────────────────────────────────────────────────┐
 * │  [×]        第 X 届大闯关 - 关卡公告栏                │
 * ├──────────────────────────────────────────────────────┤
 * │  [生成全部草稿] [开始全部优化] [优化进度：6/18]      │
 * ├──────────────────────────────────────────────────────┤
 * │                                                      │
 * │  ▼ 第一轮：水上疾行                                  │
 * │  ├─ 类型：体能  难度：★☆☆☆☆                       │
 * │  ├─ 状态：✓ 已完成三轮优化                          │
 * │  ├─ [查看草稿] [优化1] [优化2] [优化3]              │
 * │  └─ [查看最终版本]                                  │
 * │                                                      │
 * │  ▼ 第二轮：谜题迷宫                                  │
 * │  ...                                                 │
 * └──────────────────────────────────────────────────────┘
 */
export const GauntletAnnouncementModal: React.FC<GauntletAnnouncementModalProps> = ({
    isOpen,
    onClose,
    gameState,
    onGenerateAllDrafts,
    onStartAllOptimization,
    onOptimizeChallenge,
}) => {
    const { gauntletSystem } = gameState;
    const currentEvent = gauntletSystem.currentEvent;

    // 展开/折叠状态
    const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([1]));

    // 查看详情弹窗状态
    const [viewingDetail, setViewingDetail] = useState<{
        type: 'draft' | 'optimization' | 'final';
        roundNumber: number;
        optimizationRound?: 1 | 2 | 3;
    } | null>(null);

    // 操作中状态
    const [isProcessing, setIsProcessing] = useState(false);

    // 切换轮次展开状态
    const toggleRound = (roundNumber: number) => {
        setExpandedRounds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(roundNumber)) {
                newSet.delete(roundNumber);
            } else {
                newSet.add(roundNumber);
            }
            return newSet;
        });
    };

    // 渲染难度星级
    const renderDifficulty = (difficulty: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= difficulty ? 'text-amber-400' : 'text-gray-600'}>
                    ★
                </span>
            );
        }
        return <span className="text-sm">{stars}</span>;
    };

    // 获取关卡状态文本
    const getChallengeStatus = (challenge: ChallengeDesign) => {
        if (!challenge.draftVersion) {
            return { text: '待生成', color: 'text-gray-400', icon: '○' };
        }
        if (challenge.optimizationProgress === 0) {
            return { text: '已生成草稿', color: 'text-blue-400', icon: '◐' };
        }
        if (challenge.optimizationProgress < 3) {
            return { text: `优化中 (${challenge.optimizationProgress}/3)`, color: 'text-yellow-400', icon: '◑' };
        }
        return { text: '✓ 已完成三轮优化', color: 'text-green-400', icon: '●' };
    };

    // 计算总优化进度
    const calculateProgress = () => {
        if (!currentEvent) return { completed: 0, total: 18 };

        let completed = 0;
        currentEvent.rounds.forEach(round => {
            if (round.challenge) {
                completed += round.challenge.optimizationProgress || 0;
            }
        });
        return { completed, total: 18 }; // 6轮 × 3次优化 = 18
    };

    const progress = calculateProgress();

    // 处理生成全部草稿
    const handleGenerateAllDrafts = async () => {
        if (onGenerateAllDrafts) {
            setIsProcessing(true);
            try {
                await onGenerateAllDrafts();
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // 处理开始全部优化
    const handleStartAllOptimization = async () => {
        if (onStartAllOptimization) {
            setIsProcessing(true);
            try {
                await onStartAllOptimization();
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // 处理单个优化
    const handleOptimize = async (roundNumber: number, optimizationRound: 1 | 2 | 3) => {
        if (onOptimizeChallenge) {
            setIsProcessing(true);
            try {
                await onOptimizeChallenge(roundNumber, optimizationRound);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // 获取关卡数据
    const getChallengeForRound = (roundNumber: number): ChallengeDesign | null => {
        if (!currentEvent) return null;
        const round = currentEvent.rounds.find(r => r.roundNumber === roundNumber);
        return round?.challenge || null;
    };

    // 渲染关卡详情查看弹窗
    const renderDetailModal = () => {
        if (!viewingDetail || !currentEvent) return null;

        const challenge = getChallengeForRound(viewingDetail.roundNumber);
        if (!challenge) return null;

        let title = '';
        let content = '';

        if (viewingDetail.type === 'draft') {
            title = `第${viewingDetail.roundNumber}轮关卡 - 初始草稿`;
            content = challenge.draftVersion || '草稿尚未生成';
        } else if (viewingDetail.type === 'optimization' && viewingDetail.optimizationRound) {
            const optKey = `optimization${viewingDetail.optimizationRound}` as keyof ChallengeDesign;
            const optimization = challenge[optKey] as ChallengeOptimization | undefined;
            title = `第${viewingDetail.roundNumber}轮关卡 - 第${viewingDetail.optimizationRound}次优化`;

            if (optimization) {
                content = `【批判分析】\n${optimization.critique}\n\n` +
                    `【发现问题】\n${optimization.issues.map(i => `• ${i}`).join('\n')}\n\n` +
                    `【改进建议】\n${optimization.suggestions.map(s => `• ${s}`).join('\n')}\n\n` +
                    `【修改内容】\n${optimization.changes.map(c => `• ${c}`).join('\n')}\n\n` +
                    `【改进总结】\n${optimization.improvementSummary}`;
            } else {
                content = '此轮优化尚未完成';
            }
        } else if (viewingDetail.type === 'final') {
            title = `第${viewingDetail.roundNumber}轮关卡 - 最终版本`;
            content = challenge.finalVersion || challenge.draftVersion || '尚未生成';
        }

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                <div className="bg-stone-900 rounded-lg p-6 max-w-2xl w-full mx-4 border border-stone-700 max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-stone-900 pb-2">
                        <h3 className="text-xl font-bold text-amber-300">{title}</h3>
                        <button
                            onClick={() => setViewingDetail(null)}
                            className="text-gray-400 hover:text-white"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>

                    <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                        {content}
                    </div>

                    {/* 导航按钮 */}
                    {viewingDetail.type === 'optimization' && viewingDetail.optimizationRound && (
                        <div className="mt-6 flex justify-center gap-4 sticky bottom-0 bg-stone-900 pt-4">
                            {viewingDetail.optimizationRound > 1 && (
                                <button
                                    onClick={() => setViewingDetail({
                                        ...viewingDetail,
                                        optimizationRound: (viewingDetail.optimizationRound! - 1) as 1 | 2 | 3
                                    })}
                                    className="py-2 px-4 rounded bg-stone-700 hover:bg-stone-600 text-gray-300"
                                >
                                    <i className="fa-solid fa-arrow-left mr-2"></i>上一次
                                </button>
                            )}
                            {viewingDetail.optimizationRound < 3 && (
                                <button
                                    onClick={() => setViewingDetail({
                                        ...viewingDetail,
                                        optimizationRound: (viewingDetail.optimizationRound! + 1) as 1 | 2 | 3
                                    })}
                                    className="py-2 px-4 rounded bg-stone-700 hover:bg-stone-600 text-gray-300"
                                >
                                    下一次<i className="fa-solid fa-arrow-right ml-2"></i>
                                </button>
                            )}
                            <button
                                onClick={() => setViewingDetail(null)}
                                className="py-2 px-4 rounded bg-amber-700 hover:bg-amber-600 text-white"
                            >
                                关闭
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // 渲染单个轮次
    const renderRound = (roundNumber: number) => {
        const challenge = getChallengeForRound(roundNumber);
        const isExpanded = expandedRounds.has(roundNumber);

        // 默认关卡信息（如果尚未生成）
        const defaultNames = ['水上疾行', '谜题迷宫', '技巧考验', '速度竞技', '智力对决', '终极挑战'];
        const defaultTypes = ['体能', '解谜', '技巧', '竞技', '智力', '综合'];

        const name = challenge?.name || defaultNames[roundNumber - 1] || `第${roundNumber}轮关卡`;
        const type = challenge?.type || defaultTypes[roundNumber - 1] || '综合';
        const difficulty = challenge?.difficulty || roundNumber;
        const status = challenge ? getChallengeStatus(challenge) : { text: '待生成', color: 'text-gray-400', icon: '○' };

        return (
            <div key={roundNumber} className="border border-stone-700/50 rounded-lg overflow-hidden mb-3">
                {/* 轮次标题栏 */}
                <button
                    onClick={() => toggleRound(roundNumber)}
                    className="w-full flex items-center justify-between p-4 bg-black/30 hover:bg-black/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className={`text-lg transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            ▶
                        </span>
                        <span className="font-semibold text-white">
                            第{roundNumber}轮：{name}
                        </span>
                    </div>
                    <span className={`text-sm ${status.color}`}>
                        {status.icon} {status.text}
                    </span>
                </button>

                {/* 展开内容 */}
                {isExpanded && (
                    <div className="p-4 bg-black/20 border-t border-stone-700/50">
                        {/* 基本信息 */}
                        <div className="flex flex-wrap gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">类型：</span>
                                <span className="text-blue-400">{type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400">难度：</span>
                                {renderDifficulty(difficulty)}
                            </div>
                        </div>

                        {/* 关卡描述 */}
                        {challenge?.description && (
                            <div className="mb-4 text-sm text-gray-400">
                                {challenge.description}
                            </div>
                        )}

                        {/* 操作按钮 */}
                        <div className="flex flex-wrap gap-2">
                            {/* 查看草稿 */}
                            <button
                                onClick={() => setViewingDetail({ type: 'draft', roundNumber })}
                                disabled={!challenge?.draftVersion}
                                className={`py-1.5 px-3 rounded text-sm transition-colors ${challenge?.draftVersion
                                        ? 'bg-blue-700/50 hover:bg-blue-600/50 text-blue-300'
                                        : 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                查看草稿
                            </button>

                            {/* 优化按钮 1-3 */}
                            {[1, 2, 3].map(optRound => {
                                const optKey = `optimization${optRound}` as keyof ChallengeDesign;
                                const hasOpt = challenge && challenge[optKey];
                                const canOptimize = challenge?.draftVersion &&
                                    (optRound === 1 || challenge[`optimization${optRound - 1}` as keyof ChallengeDesign]);
                                const isCurrentOpt = challenge?.optimizationProgress === optRound - 1 && challenge?.draftVersion;

                                return (
                                    <button
                                        key={optRound}
                                        onClick={() => {
                                            if (hasOpt) {
                                                setViewingDetail({
                                                    type: 'optimization',
                                                    roundNumber,
                                                    optimizationRound: optRound as 1 | 2 | 3
                                                });
                                            } else if (isCurrentOpt && onOptimizeChallenge) {
                                                handleOptimize(roundNumber, optRound as 1 | 2 | 3);
                                            }
                                        }}
                                        disabled={!hasOpt && !isCurrentOpt}
                                        className={`py-1.5 px-3 rounded text-sm transition-colors ${hasOpt
                                                ? 'bg-green-700/50 hover:bg-green-600/50 text-green-300'
                                                : isCurrentOpt
                                                    ? 'bg-yellow-700/50 hover:bg-yellow-600/50 text-yellow-300'
                                                    : 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {hasOpt ? `优化${optRound}` : isCurrentOpt ? `执行优化${optRound}` : `优化${optRound}`}
                                    </button>
                                );
                            })}

                            {/* 查看最终版本 */}
                            <button
                                onClick={() => setViewingDetail({ type: 'final', roundNumber })}
                                disabled={!challenge?.finalVersion && challenge?.optimizationProgress !== 3}
                                className={`py-1.5 px-3 rounded text-sm transition-colors ${challenge?.optimizationProgress === 3
                                        ? 'bg-amber-700/50 hover:bg-amber-600/50 text-amber-300'
                                        : 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                查看最终版本
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!currentEvent) {
        return (
            <ResponsiveModal
                isOpen={isOpen}
                onClose={onClose}
                title="关卡公告栏"
                size="lg"
            >
                <div className="text-center py-12 text-gray-400">
                    <i className="fa-solid fa-calendar-xmark text-4xl mb-4"></i>
                    <p>当前没有正在进行的赛事</p>
                </div>
            </ResponsiveModal>
        );
    }

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title={`第 ${currentEvent.edition} 届大闯关 - 关卡公告栏`}
            size="xl"
        >
            <div className="space-y-4">
                {/* ===== 操作栏 ===== */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-black/30 rounded-lg border border-stone-700/50">
                    <div className="flex flex-wrap gap-2">
                        {/* 生成全部草稿 */}
                        <button
                            onClick={handleGenerateAllDrafts}
                            disabled={isProcessing || !onGenerateAllDrafts}
                            className={`py-2 px-4 rounded font-semibold text-sm transition-colors ${isProcessing
                                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-700 hover:bg-blue-600 text-white'
                                }`}
                        >
                            {isProcessing ? (
                                <><i className="fa-solid fa-spinner fa-spin mr-2"></i>处理中...</>
                            ) : (
                                <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i>生成全部草稿</>
                            )}
                        </button>

                        {/* 开始全部优化 */}
                        <button
                            onClick={handleStartAllOptimization}
                            disabled={isProcessing || !onStartAllOptimization}
                            className={`py-2 px-4 rounded font-semibold text-sm transition-colors ${isProcessing
                                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-700 hover:bg-green-600 text-white'
                                }`}
                        >
                            {isProcessing ? (
                                <><i className="fa-solid fa-spinner fa-spin mr-2"></i>处理中...</>
                            ) : (
                                <><i className="fa-solid fa-bolt mr-2"></i>开始全部优化</>
                            )}
                        </button>
                    </div>

                    {/* 优化进度 */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">优化进度：</span>
                        <span className={`font-bold ${progress.completed === progress.total
                                ? 'text-green-400'
                                : progress.completed > 0
                                    ? 'text-yellow-400'
                                    : 'text-gray-400'
                            }`}>
                            {progress.completed}/{progress.total}
                        </span>
                        {/* 进度条 */}
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* ===== 关卡列表 ===== */}
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {[1, 2, 3, 4, 5, 6].map(roundNumber => renderRound(roundNumber))}
                </div>
            </div>

            {/* 详情查看弹窗 */}
            {renderDetailModal()}
        </ResponsiveModal>
    );
};

export default GauntletAnnouncementModal;