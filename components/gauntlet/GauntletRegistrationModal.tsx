import React, { useEffect, useMemo, useState } from 'react';
import { CharacterCard, GameState } from '../../types';
import { GauntletContestant } from '../../types/gauntlet.types';
import { ResponsiveModal } from '../ResponsiveModal';

interface GauntletRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    onRegister: (characterCard: CharacterCard) => Promise<void>;
    onCancelRegistration: () => Promise<void>;
    onGenerateContestants?: (count: number) => Promise<void>;
}

/**
 * 大闯关报名弹窗
 * 
 * 功能：
 * 1. 显示赛事信息和报名截止倒计时
 * 2. 允许玩家从卡牌收藏中选择女性角色报名
 * 3. 显示已报名参赛者列表
 * 4. 支持取消报名
 */
export const GauntletRegistrationModal: React.FC<GauntletRegistrationModalProps> = ({
    isOpen,
    onClose,
    gameState,
    onRegister,
    onCancelRegistration,
    onGenerateContestants,
}) => {
    const { gauntletSystem } = gameState;
    const currentEvent = gauntletSystem.currentEvent;

    // 选中的角色卡牌
    const [selectedCard, setSelectedCard] = useState<CharacterCard | null>(null);

    // 报名中状态
    const [isRegistering, setIsRegistering] = useState(false);

    // 取消报名中状态
    const [isCancelling, setIsCancelling] = useState(false);

    // 倒计时
    const [countdown, setCountdown] = useState<string>('');

    // 错误信息
    const [errorMessage, setErrorMessage] = useState<string>('');

    // 生成参赛者状态
    const [isGenerating, setIsGenerating] = useState(false);

    // 获取可用于报名的女性角色卡牌
    const availableFemaleCards = useMemo(() => {
        const { cardCollection } = gameState.playerProfile;
        return cardCollection.filter(card => card.gender === 'Female');
    }, [gameState.playerProfile.cardCollection]);

    // 检查玩家是否已报名
    const playerRegistration = useMemo(() => {
        if (!currentEvent || !currentEvent.playerContestantId) {
            return null;
        }
        return currentEvent.contestants.find(c => c.id === currentEvent.playerContestantId);
    }, [currentEvent]);

    // 计算倒计时
    useEffect(() => {
        if (!currentEvent || currentEvent.status !== 'registration') {
            setCountdown('');
            return;
        }

        const updateCountdown = () => {
            const now = Date.now();
            const deadline = currentEvent.registrationDeadline;
            const diff = deadline - now;

            if (diff <= 0) {
                setCountdown('报名已截止');
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                if (hours > 0) {
                    setCountdown(`${hours}小时 ${minutes}分 ${seconds}秒`);
                } else if (minutes > 0) {
                    setCountdown(`${minutes}分 ${seconds}秒`);
                } else {
                    setCountdown(`${seconds}秒`);
                }
            }
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [currentEvent]);

    // 处理报名
    const handleRegister = async () => {
        if (!selectedCard) {
            setErrorMessage('请先选择一个角色');
            return;
        }

        setIsRegistering(true);
        setErrorMessage('');

        try {
            await onRegister(selectedCard);
            setSelectedCard(null);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : '报名失败，请重试');
        } finally {
            setIsRegistering(false);
        }
    };

    // 处理取消报名
    const handleCancelRegistration = async () => {
        setIsCancelling(true);
        setErrorMessage('');

        try {
            await onCancelRegistration();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : '取消报名失败，请重试');
        } finally {
            setIsCancelling(false);
        }
    };

    // 如果没有当前赛事或赛事不在报名阶段
    if (!currentEvent) {
        return (
            <ResponsiveModal
                isOpen={isOpen}
                onClose={onClose}
                title="大闯关报名"
                size="md"
            >
                <div className="text-center py-8 text-gray-400">
                    <i className="fa-solid fa-calendar-xmark text-4xl mb-4"></i>
                    <p>暂无进行中的赛事</p>
                </div>
            </ResponsiveModal>
        );
    }

    if (currentEvent.status !== 'registration') {
        return (
            <ResponsiveModal
                isOpen={isOpen}
                onClose={onClose}
                title="大闯关报名"
                size="md"
            >
                <div className="text-center py-8 text-gray-400">
                    <i className="fa-solid fa-clock text-4xl mb-4"></i>
                    <p>
                        {currentEvent.status === 'countdown' && '报名尚未开始'}
                        {currentEvent.status === 'preparing' && '报名已截止，关卡准备中'}
                        {currentEvent.status === 'in_progress' && '比赛已开始'}
                        {currentEvent.status === 'completed' && '本届赛事已结束'}
                    </p>
                </div>
            </ResponsiveModal>
        );
    }

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title={`第 ${currentEvent.edition} 届大闯关 - 报名`}
            size="lg"
        >
            <div className="space-y-6">
                {/* ===== 报名状态和倒计时 ===== */}
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-700/30">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <span className="text-gray-400">报名状态：</span>
                            {playerRegistration ? (
                                <span className="text-green-400 font-semibold ml-2">
                                    <i className="fa-solid fa-check-circle mr-1"></i>
                                    已报名
                                </span>
                            ) : (
                                <span className="text-yellow-400 font-semibold ml-2">
                                    <i className="fa-solid fa-hourglass-half mr-1"></i>
                                    未报名
                                </span>
                            )}
                        </div>
                        <div>
                            <span className="text-gray-400">报名截止：</span>
                            <span className="text-amber-300 font-semibold ml-2">
                                {countdown}
                            </span>
                        </div>
                    </div>

                    {/* 当前参赛人数 */}
                    <div className="mt-3 text-sm text-gray-400">
                        当前报名人数：
                        <span className="text-white font-semibold ml-1">
                            {currentEvent.contestants.length}
                        </span>
                        <span className="text-gray-500"> / 64人</span>
                    </div>
                </div>

                {/* ===== 已报名显示 ===== */}
                {playerRegistration ? (
                    <div className="bg-black/30 rounded-lg p-5 border border-green-700/30">
                        <h4 className="text-lg font-bold text-green-300 mb-4">
                            <i className="fa-solid fa-user-check mr-2"></i>
                            您已成功报名
                        </h4>

                        <div className="flex items-center gap-4 bg-black/40 rounded-lg p-4">
                            {/* 角色头像占位 */}
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-2xl">
                                👩
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg">
                                    {playerRegistration.name}
                                </div>
                                <div className="text-gray-400 text-sm">
                                    {playerRegistration.realm}
                                </div>
                                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                    <span>魅力: <span className="text-pink-400">{playerRegistration.charm}</span></span>
                                    <span>技巧: <span className="text-blue-400">{playerRegistration.skillfulness}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* 取消报名按钮 */}
                        <div className="mt-4 text-center">
                            <button
                                onClick={handleCancelRegistration}
                                disabled={isCancelling}
                                className="py-2 px-6 rounded-lg bg-red-900/50 hover:bg-red-800/50 
                                         text-red-300 hover:text-red-200 border border-red-700/50
                                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelling ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                        取消中...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-times mr-2"></i>
                                        取消报名
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ===== 选择参赛角色 ===== */}
                        <div className="bg-black/30 rounded-lg p-5 border border-stone-700/30">
                            <h4 className="text-lg font-bold text-amber-300 mb-4">
                                <i className="fa-solid fa-user-plus mr-2"></i>
                                选择参赛角色
                            </h4>

                            {availableFemaleCards.length === 0 ? (
                                <div className="text-center py-6 text-gray-400">
                                    <i className="fa-solid fa-user-slash text-3xl mb-3"></i>
                                    <p>您的收藏中没有可参赛的女性角色</p>
                                    <p className="text-sm mt-2">请先在商城招募女性角色</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                                    {availableFemaleCards.map(card => (
                                        <button
                                            key={card.id}
                                            onClick={() => setSelectedCard(card)}
                                            className={`p-3 rounded-lg border transition-all text-left
                                                ${selectedCard?.id === card.id
                                                    ? 'bg-amber-900/40 border-amber-500 ring-2 ring-amber-500/50'
                                                    : 'bg-black/40 border-stone-700/50 hover:border-amber-700/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-rose-700 flex items-center justify-center text-lg">
                                                    👩
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-white font-semibold text-sm truncate">
                                                        {card.name}
                                                    </div>
                                                    <div className="text-gray-400 text-xs truncate">
                                                        {card.realm}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 text-xs text-gray-500">
                                                <span>魅力: <span className="text-pink-400">{card.charm || 50}</span></span>
                                                <span>技巧: <span className="text-blue-400">{card.skillfulness || 50}</span></span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ===== 报名按钮 ===== */}
                        {availableFemaleCards.length > 0 && (
                            <div className="text-center">
                                {errorMessage && (
                                    <div className="text-red-400 text-sm mb-3">
                                        <i className="fa-solid fa-exclamation-circle mr-1"></i>
                                        {errorMessage}
                                    </div>
                                )}
                                <button
                                    onClick={handleRegister}
                                    disabled={!selectedCard || isRegistering}
                                    className={`py-3 px-8 rounded-lg font-bold text-lg transition-all
                                        ${selectedCard && !isRegistering
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg hover:shadow-green-500/30'
                                            : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {isRegistering ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                            报名中...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-check mr-2"></i>
                                            确认报名
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* ===== 已报名参赛者预览 ===== */}
                <div className="bg-black/20 rounded-lg p-4 border border-stone-700/30">
                    <h4 className="text-base font-bold text-gray-300 mb-3">
                        <i className="fa-solid fa-users mr-2"></i>
                        已报名参赛者
                        <span className="text-gray-500 font-normal ml-2">
                            ({currentEvent.contestants.length}人)
                        </span>
                    </h4>

                    {currentEvent.contestants.length === 0 ? (
                        <div className="text-gray-500 text-sm text-center py-4">
                            暂无参赛者报名
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {currentEvent.contestants.slice(0, 20).map((contestant: GauntletContestant) => (
                                <div
                                    key={contestant.id}
                                    className={`px-3 py-1 rounded-full text-sm
                                        ${contestant.isPlayerCharacter
                                            ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50'
                                            : 'bg-stone-800/50 text-gray-300'
                                        }`}
                                >
                                    {contestant.isPlayerCharacter && (
                                        <i className="fa-solid fa-star text-amber-400 mr-1 text-xs"></i>
                                    )}
                                    {contestant.name}
                                </div>
                            ))}
                            {currentEvent.contestants.length > 20 && (
                                <div className="px-3 py-1 rounded-full text-sm bg-stone-800/30 text-gray-500">
                                    +{currentEvent.contestants.length - 20} 更多...
                                </div>
                            )}
                        </div>
                    )}

                    {/* 开发者测试：生成参赛者 */}
                    {onGenerateContestants && currentEvent.contestants.length < 64 && (
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <span className="text-yellow-400">
                                <i className="fa-solid fa-flask mr-1"></i>
                                开发者测试
                            </span>
                            <button
                                onClick={async () => {
                                    setIsGenerating(true);
                                    setErrorMessage('');
                                    try {
                                        const needed = 64 - currentEvent.contestants.length;
                                        await onGenerateContestants(Math.min(needed, 20));
                                    } catch (error) {
                                        setErrorMessage('生成参赛者失败，请重试');
                                    } finally {
                                        setIsGenerating(false);
                                    }
                                }}
                                disabled={isGenerating}
                                className="px-3 py-1 bg-yellow-900/50 hover:bg-yellow-800/50
                                         text-yellow-300 rounded border border-yellow-700/50
                                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                                        生成中...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-users mr-1"></i>
                                        生成{Math.min(64 - currentEvent.contestants.length, 20)}名参赛者
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* ===== 底部按钮 ===== */}
                <div className="text-center pt-2">
                    <button
                        onClick={onClose}
                        className="py-2 px-6 rounded-lg bg-stone-700/50 hover:bg-stone-600/50 
                                 text-gray-300 hover:text-white transition-all"
                    >
                        返回大厅
                    </button>
                </div>
            </div>
        </ResponsiveModal>
    );
};

export default GauntletRegistrationModal;