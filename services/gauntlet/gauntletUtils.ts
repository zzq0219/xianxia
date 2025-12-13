/**
 * 大闯关系统 - 工具函数
 * 
 * 提供创建默认数据、排序、计算等辅助功能
 */

import {
    ChallengeType,
    GauntletConfig,
    GauntletContestant,
    GauntletEvent,
    GauntletPlayerStats,
    GauntletRound,
    GauntletStatus,
    GauntletSystem,
    RankingEntry,
    RoundStatus
} from '../../types/gauntlet.types';

// ============================================
// 默认配置和初始化
// ============================================

/**
 * 创建默认的赛事配置
 */
export function createDefaultGauntletConfig(): GauntletConfig {
  return {
    monthlySchedule: 1, // 每月1号举行
    registrationDuration: 24, // 报名时长24小时
    enableAutoGeneration: true,
    preparationDuration: 6 // 准备阶段6小时
  };
}

/**
 * 创建默认的玩家统计
 */
export function createDefaultPlayerStats(): GauntletPlayerStats {
  return {
    participations: 0,
    wins: 0,
    bestRank: 0,
    totalScore: 0,
    averageRank: 0
  };
}

/**
 * 创建默认的大闯关系统
 */
export function createDefaultGauntletSystem(): GauntletSystem {
  return {
    currentEvent: null,
    eventHistory: [],
    totalEditions: 0,
    nextEventDate: calculateNextEventDate(),
    playerStats: createDefaultPlayerStats(),
    config: createDefaultGauntletConfig()
  };
}

/**
 * 计算下一次赛事日期
 */
export function calculateNextEventDate(config?: GauntletConfig): number {
  const cfg = config || createDefaultGauntletConfig();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // 计算本月的赛事日期
  let nextDate = new Date(year, month, cfg.monthlySchedule);
  
  // 如果本月的日期已过,计算下个月
  if (nextDate.getTime() < now.getTime()) {
    nextDate = new Date(year, month + 1, cfg.monthlySchedule);
  }
  
  return nextDate.getTime();
}

// ============================================
// 排序和排名
// ============================================

/**
 * 根据分数对参赛者排序
 */
export function sortContestantsByScore(
  contestants: GauntletContestant[]
): GauntletContestant[] {
  return [...contestants].sort((a, b) => b.currentScore - a.currentScore);
}

/**
 * 生成排行榜
 */
export function generateRankings(
  contestants: GauntletContestant[]
): RankingEntry[] {
  const sorted = sortContestantsByScore(contestants);
  
  return sorted.map((contestant, index) => ({
    rank: index + 1,
    contestantId: contestant.id,
    contestantName: contestant.name,
    score: contestant.currentScore,
    status: contestant.status
  }));
}

/**
 * 根据本轮得分排序
 */
export function sortByRoundScore(
  contestants: GauntletContestant[],
  roundNumber: number
): GauntletContestant[] {
  return [...contestants].sort((a, b) => {
    const scoreA = a.roundScores[roundNumber - 1] || 0;
    const scoreB = b.roundScores[roundNumber - 1] || 0;
    return scoreB - scoreA;
  });
}

// ============================================
// 淘汰和晋级逻辑
// ============================================

/**
 * 计算本轮应晋级的人数
 * 64 → 32 → 16 → 8 → 4 → 2 → 1
 */
export function getAdvancingCount(currentRound: number, totalContestants: number): number {
  const rounds = [32, 16, 8, 4, 2, 1];
  if (currentRound > 0 && currentRound <= rounds.length) {
    return rounds[currentRound - 1];
  }
  return totalContestants;
}

/**
 * 确定晋级和淘汰的参赛者
 */
export function determineAdvancementAndElimination(
  contestants: GauntletContestant[],
  roundNumber: number
): { advancing: string[]; eliminated: string[] } {
  const sorted = sortByRoundScore(contestants, roundNumber);
  const advancingCount = getAdvancingCount(roundNumber, contestants.length);
  
  const advancing = sorted.slice(0, advancingCount).map(c => c.id);
  const eliminated = sorted.slice(advancingCount).map(c => c.id);
  
  return { advancing, eliminated };
}

/**
 * 更新参赛者状态(淘汰或晋级)
 */
export function updateContestantStatus(
  contestant: GauntletContestant,
  roundNumber: number,
  isAdvancing: boolean
): GauntletContestant {
  if (!isAdvancing) {
    return {
      ...contestant,
      status: 'eliminated',
      eliminatedRound: roundNumber
    };
  }
  return contestant;
}

// ============================================
// 赛事状态判断
// ============================================

/**
 * 检查赛事是否在倒计时阶段
 */
export function isCountdownPhase(event: GauntletEvent): boolean {
  return event.status === 'countdown' && Date.now() < event.registrationDeadline;
}

/**
 * 检查赛事是否在报名阶段
 */
export function isRegistrationPhase(event: GauntletEvent): boolean {
  return event.status === 'registration' && Date.now() < event.registrationDeadline;
}

/**
 * 检查赛事是否在准备阶段
 */
export function isPreparingPhase(event: GauntletEvent): boolean {
  return event.status === 'preparing';
}

/**
 * 检查赛事是否进行中
 */
export function isInProgress(event: GauntletEvent): boolean {
  return event.status === 'in_progress';
}

/**
 * 检查赛事是否已结束
 */
export function isCompleted(event: GauntletEvent): boolean {
  return event.status === 'completed';
}

// ============================================
// 关卡优化进度
// ============================================

/**
 * 检查所有关卡是否已完成优化
 */
export function areAllChallengesOptimized(rounds: GauntletRound[]): boolean {
  return rounds.every(round => round.challenge.optimizationProgress === 3);
}

/**
 * 计算总优化进度
 */
export function calculateTotalOptimizationProgress(rounds: GauntletRound[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = rounds.length * 3; // 每轮3次优化
  const completed = rounds.reduce((sum, round) => sum + round.challenge.optimizationProgress, 0);
  const percentage = Math.round((completed / total) * 100);
  
  return { completed, total, percentage };
}

// ============================================
// ID生成
// ============================================

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * 生成参赛者ID
 */
export function generateContestantId(): string {
  return generateId('contestant');
}

/**
 * 生成评委ID
 */
export function generateJudgeId(): string {
  return generateId('judge');
}

/**
 * 生成关卡ID
 */
export function generateChallengeId(roundNumber: number): string {
  return generateId(`challenge_r${roundNumber}`);
}

/**
 * 生成赛事ID
 */
export function generateEventId(edition: number): string {
  return generateId(`event_${edition}`);
}

// ============================================
// 时间格式化
// ============================================

/**
 * 格式化剩余时间
 */
export function formatRemainingTime(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff <= 0) return '已结束';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分`;
  } else {
    return `${minutes}分钟`;
  }
}

/**
 * 格式化持续时间
 */
export function formatDuration(startTime: number, endTime: number): string {
  const diff = endTime - startTime;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
}

// ============================================
// 难度和类型显示
// ============================================

/**
 * 获取难度星级显示
 */
export function getDifficultyStars(difficulty: number): string {
  const filled = Math.min(Math.max(Math.round(difficulty / 2), 1), 5);
  const empty = 5 - filled;
  return '★'.repeat(filled) + '☆'.repeat(empty);
}

/**
 * 获取关卡类型的颜色
 */
export function getChallengeTypeColor(type: ChallengeType): string {
  const colors: Record<ChallengeType, string> = {
    '解谜': 'text-purple-400',
    '竞技': 'text-red-400',
    '体能': 'text-orange-400',
    '技巧': 'text-blue-400',
    '智力': 'text-cyan-400',
    '综合': 'text-yellow-400'
  };
  return colors[type] || 'text-gray-400';
}

// ============================================
// 验证函数
// ============================================

/**
 * 验证参赛者是否符合参赛条件
 */
export function validateContestant(contestant: GauntletContestant): {
  valid: boolean;
  reason?: string;
} {
  if (contestant.gender !== 'Female') {
    return { valid: false, reason: '仅限女性参赛' };
  }
  
  if (contestant.status !== 'active') {
    return { valid: false, reason: '参赛者状态异常' };
  }
  
  return { valid: true };
}

/**
 * 验证是否可以开始比赛
 */
export function canStartEvent(event: GauntletEvent): {
  canStart: boolean;
  reason?: string;
} {
  if (event.contestants.length < 64) {
    return { canStart: false, reason: `参赛者不足，当前${event.contestants.length}人，需要64人` };
  }
  
  if (!event.challengesGenerated) {
    return { canStart: false, reason: '关卡尚未生成' };
  }
  
  if (!event.allOptimizationsComplete) {
    return { canStart: false, reason: '关卡优化尚未完成' };
  }
  
  if (event.judges.length < 3) {
    return { canStart: false, reason: '评委不足，至少需要3名评委' };
  }
  
  return { canStart: true };
}

// ============================================
// 统计计算
// ============================================

/**
 * 计算平均排名
 */
export function calculateAverageRank(stats: GauntletPlayerStats): number {
  if (stats.participations === 0) return 0;
  return Math.round(stats.totalScore / stats.participations);
}

/**
 * 更新玩家统计
 */
export function updatePlayerStats(
  stats: GauntletPlayerStats,
  rank: number,
  score: number,
  isWinner: boolean
): GauntletPlayerStats {
  return {
    participations: stats.participations + 1,
    wins: stats.wins + (isWinner ? 1 : 0),
    bestRank: stats.bestRank === 0 ? rank : Math.min(stats.bestRank, rank),
    totalScore: stats.totalScore + score,
    averageRank: calculateAverageRank({
      ...stats,
      participations: stats.participations + 1,
      totalScore: stats.totalScore + score
    })
  };
}

// ============================================
// 状态转换
// ============================================

/**
 * 获取下一个赛事状态
 */
export function getNextEventStatus(currentStatus: GauntletStatus): GauntletStatus | null {
  const statusFlow: GauntletStatus[] = ['countdown', 'registration', 'preparing', 'in_progress', 'completed'];
  const currentIndex = statusFlow.indexOf(currentStatus);
  
  if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
    return statusFlow[currentIndex + 1];
  }
  
  return null;
}

/**
 * 获取下一个轮次状态
 */
export function getNextRoundStatus(currentStatus: RoundStatus): RoundStatus | null {
  const statusFlow: RoundStatus[] = ['pending', 'draft', 'optimizing', 'ready', 'in_progress', 'judging', 'completed'];
  const currentIndex = statusFlow.indexOf(currentStatus);
  
  if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
    return statusFlow[currentIndex + 1];
  }
  
  return null;
}

// ============================================
// 导出所有工具函数
// ============================================

export const GauntletUtils = {
  // 初始化
  createDefaultGauntletSystem,
  createDefaultGauntletConfig,
  createDefaultPlayerStats,
  calculateNextEventDate,
  
  // 排序排名
  sortContestantsByScore,
  generateRankings,
  sortByRoundScore,
  
  // 淘汰晋级
  getAdvancingCount,
  determineAdvancementAndElimination,
  updateContestantStatus,
  
  // 状态判断
  isCountdownPhase,
  isRegistrationPhase,
  isPreparingPhase,
  isInProgress,
  isCompleted,
  
  // 关卡优化
  areAllChallengesOptimized,
  calculateTotalOptimizationProgress,
  
  // ID生成
  generateId,
  generateContestantId,
  generateJudgeId,
  generateChallengeId,
  generateEventId,
  
  // 时间格式化
  formatRemainingTime,
  formatDuration,
  
  // 显示辅助
  getDifficultyStars,
  getChallengeTypeColor,
  
  // 验证
  validateContestant,
  canStartEvent,
  
  // 统计
  calculateAverageRank,
  updatePlayerStats,
  
  // 状态转换
  getNextEventStatus,
  getNextRoundStatus
};