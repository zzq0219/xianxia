/**
 * 大闯关系统 - 服务层统一导出
 * 
 * 提供所有大闯关相关服务的统一入口
 */


// 类型导出
export type {
    FlowCallbacks
} from './gauntletFlowService';

// AI服务
export { GauntletAIService, gauntletAIService } from './gauntletAIService';

// 赛事管理服务
export {
    addAIContestants, advanceToNextRound, cancelPlayerRegistration, canRegister, checkAndAdvanceEventStatus, createEventHistory,
    // 创建与初始化
    createNewEvent,
    // 赛事结束
    finishEvent,
    // 服务对象
    GauntletEventService, getActiveContestants, getAllChallenges, getChallenge, getContestantStats,
    // 轮次管理
    getCurrentRound, getEliminatedContestants, getEventStatusDescription, getJudges, getPlayerContestant, initializeGauntletSystem,
    // 辅助查询
    isPlayerRegistered,
    // 参赛者管理
    registerPlayerContestant,
    // 关卡管理
    setChallengeDrafts,
    // 评委管理
    setJudges, updateChallenge,
    // 状态管理
    updateEventStatus, updateRound, updateSystemAfterEvent
} from './gauntletEventService';

// 流程控制服务
export {
    completeEventAndUpdateSystem,
    // 生命周期
    createAndStartNewEvent,
    // 服务对象
    GauntletFlowService,
    // 弹幕交互
    handlePlayerDanmaku, runFullCompetition,
    // 准备阶段
    runPreparationPhase, runRoundFlow,
    // 比赛流程
    startCompetition
} from './gauntletFlowService';

// 工具函数
export {

    // 关卡优化
    areAllChallengesOptimized,
    // 统计
    calculateAverageRank, calculateNextEventDate, calculateTotalOptimizationProgress, canStartEvent, createDefaultGauntletConfig,
    // 初始化
    createDefaultGauntletSystem, createDefaultPlayerStats, determineAdvancementAndElimination, formatDuration,
    // 时间格式化
    formatRemainingTime,
    // 工具对象
    GauntletUtils, generateChallengeId, generateContestantId, generateEventId,
    // ID生成
    generateId, generateJudgeId, generateRankings,
    // 淘汰晋级
    getAdvancingCount, getChallengeTypeColor,
    // 显示辅助
    getDifficultyStars,
    // 状态转换
    getNextEventStatus,
    getNextRoundStatus, isCompleted,
    // 状态判断
    isCountdownPhase, isInProgress, isPreparingPhase, isRegistrationPhase, sortByRoundScore,
    // 排序排名
    sortContestantsByScore, updateContestantStatus, updatePlayerStats,
    // 验证
    validateContestant
} from './gauntletUtils';

