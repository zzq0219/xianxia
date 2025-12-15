/**
 * 大闯关系统 - 赛事管理服务
 * 
 * 负责赛事的创建、更新、查询、参赛者管理等功能
 */

import {
    ChallengeDesign,
    GauntletContestant,
    GauntletEvent,
    GauntletEventHistory,
    GauntletJudge,
    GauntletRound,
    GauntletStatus,
    GauntletSystem
} from '../../types/gauntlet.types';
import {
    calculateNextEventDate,
    createDefaultGauntletSystem,
    generateContestantId,
    generateEventId,
    generateRankings
} from './gauntletUtils';

// ============================================
// 赛事创建与初始化
// ============================================

/**
 * 创建新的赛事
 * @param system 当前赛事系统状态
 * @returns 新创建的赛事
 */
export function createNewEvent(system: GauntletSystem): GauntletEvent {
  const edition = system.totalEditions + 1;
  const scheduledDate = system.nextEventDate;
  const registrationDeadline = scheduledDate - (24 * 60 * 60 * 1000); // 比赛前24小时截止报名
  
  const event: GauntletEvent = {
    id: generateEventId(edition),
    edition,
    name: `第${edition}届天下第一闯关大赛`,
    status: 'countdown',
    scheduledDate,
    registrationDeadline,
    contestants: [],
    judges: [],
    challengesGenerated: false,
    allOptimizationsComplete: false,
    currentRound: 0,
    rounds: [],
    finalRankings: [],
    viewMode: 'group',
    isLive: false
  };
  
  console.log(`[赛事管理] 创建新赛事: ${event.name}`);
  return event;
}

/**
 * 初始化大闯关系统
 * @returns 初始化的系统状态
 */
export function initializeGauntletSystem(): GauntletSystem {
  console.log('[赛事管理] 初始化大闯关系统');
  return createDefaultGauntletSystem();
}

// ============================================
// 赛事状态管理
// ============================================

/**
 * 更新赛事状态
 * @param event 当前赛事
 * @param newStatus 新状态
 * @returns 更新后的赛事
 */
export function updateEventStatus(
  event: GauntletEvent,
  newStatus: GauntletStatus
): GauntletEvent {
  console.log(`[赛事管理] 更新赛事状态: ${event.status} → ${newStatus}`);
  
  const updatedEvent = { ...event, status: newStatus };
  
  // 根据状态更新相关时间戳
  switch (newStatus) {
    case 'in_progress':
      updatedEvent.startTime = Date.now();
      updatedEvent.isLive = true;
      break;
    case 'completed':
      updatedEvent.endTime = Date.now();
      updatedEvent.isLive = false;
      break;
  }
  
  return updatedEvent;
}

/**
 * 检查并自动推进赛事状态
 * 根据当前时间自动从 countdown → registration → preparing
 * @param event 当前赛事
 * @returns 可能更新后的赛事
 */
export function checkAndAdvanceEventStatus(event: GauntletEvent): GauntletEvent {
  const now = Date.now();
  
  // 倒计时 → 报名
  if (event.status === 'countdown') {
    // 开放报名：比赛前48小时到24小时
    const registrationStart = event.scheduledDate - (48 * 60 * 60 * 1000);
    if (now >= registrationStart && now < event.registrationDeadline) {
      console.log('[赛事管理] 自动进入报名阶段');
      return updateEventStatus(event, 'registration');
    }
  }
  
  // 报名 → 准备
  if (event.status === 'registration') {
    if (now >= event.registrationDeadline) {
      console.log('[赛事管理] 报名截止，进入准备阶段');
      return updateEventStatus(event, 'preparing');
    }
  }
  
  // 准备 → 进行中
  if (event.status === 'preparing') {
    if (event.challengesGenerated && event.allOptimizationsComplete && event.contestants.length >= 64) {
      if (now >= event.scheduledDate) {
        console.log('[赛事管理] 准备完成，比赛开始');
        return updateEventStatus(event, 'in_progress');
      }
    }
  }
  
  return event;
}

// ============================================
// 参赛者管理
// ============================================

/**
 * 注册玩家角色为参赛者
 * @param event 当前赛事
 * @param playerCharacter 玩家角色信息
 * @returns 更新后的赛事
 */
export function registerPlayerContestant(
  event: GauntletEvent,
  playerCharacter: {
    name: string;
    realm: string;
    appearance?: string;
    charm?: number;
    skillfulness?: number;
    characterCardId: string;
  }
): GauntletEvent {
  // 检查是否已报名
  if (event.playerContestantId) {
    console.log('[赛事管理] 玩家已报名，无需重复报名');
    return event;
  }
  
  // 检查报名状态
  if (event.status !== 'registration') {
    console.log('[赛事管理] 当前不在报名阶段，无法报名');
    return event;
  }
  
  const contestant: GauntletContestant = {
    id: generateContestantId(),
    name: playerCharacter.name,
    gender: 'Female',
    realm: playerCharacter.realm,
    appearance: playerCharacter.appearance || '身姿婀娜，气质出众',
    specialTrait: '玩家角色',
    charm: playerCharacter.charm || 75,
    skillfulness: playerCharacter.skillfulness || 75,
    status: 'active',
    currentScore: 0,
    roundScores: [],
    isPlayerCharacter: true,
    characterCardId: playerCharacter.characterCardId
  };
  
  console.log(`[赛事管理] 玩家角色 ${contestant.name} 报名成功`);
  
  return {
    ...event,
    contestants: [...event.contestants, contestant],
    playerContestantId: contestant.id
  };
}

/**
 * 添加AI参赛者
 * @param event 当前赛事
 * @param contestants AI生成的参赛者列表
 * @returns 更新后的赛事
 */
export function addAIContestants(
  event: GauntletEvent,
  contestants: GauntletContestant[]
): GauntletEvent {
  console.log(`[赛事管理] 添加${contestants.length}名AI参赛者`);
  
  return {
    ...event,
    contestants: [...event.contestants, ...contestants]
  };
}

/**
 * 取消玩家报名
 * @param event 当前赛事
 * @returns 更新后的赛事
 */
export function cancelPlayerRegistration(event: GauntletEvent): GauntletEvent {
  if (!event.playerContestantId) {
    console.log('[赛事管理] 玩家未报名，无需取消');
    return event;
  }
  
  if (event.status !== 'registration') {
    console.log('[赛事管理] 非报名阶段，无法取消报名');
    return event;
  }
  
  console.log('[赛事管理] 取消玩家报名');
  
  return {
    ...event,
    contestants: event.contestants.filter(c => c.id !== event.playerContestantId),
    playerContestantId: undefined
  };
}

/**
 * 获取玩家参赛者信息
 * @param event 当前赛事
 * @returns 玩家参赛者或null
 */
export function getPlayerContestant(event: GauntletEvent): GauntletContestant | null {
  if (!event.playerContestantId) return null;
  return event.contestants.find(c => c.id === event.playerContestantId) || null;
}

/**
 * 获取活跃参赛者（未淘汰的）
 * @param event 当前赛事
 * @returns 活跃参赛者列表
 */
export function getActiveContestants(event: GauntletEvent): GauntletContestant[] {
  return event.contestants.filter(c => c.status === 'active');
}

/**
 * 获取被淘汰的参赛者
 * @param event 当前赛事
 * @returns 已淘汰参赛者列表
 */
export function getEliminatedContestants(event: GauntletEvent): GauntletContestant[] {
  return event.contestants.filter(c => c.status === 'eliminated');
}

// ============================================
// 评委管理
// ============================================

/**
 * 设置评委团
 * @param event 当前赛事
 * @param judges 评委列表
 * @returns 更新后的赛事
 */
export function setJudges(
  event: GauntletEvent,
  judges: GauntletJudge[]
): GauntletEvent {
  console.log(`[赛事管理] 设置${judges.length}名评委`);
  
  return {
    ...event,
    judges
  };
}

/**
 * 获取评委列表
 * @param event 当前赛事
 * @returns 评委列表
 */
export function getJudges(event: GauntletEvent): GauntletJudge[] {
  return event.judges;
}

// ============================================
// 关卡管理
// ============================================

/**
 * 设置关卡草稿
 * @param event 当前赛事
 * @param challenges 关卡设计列表
 * @returns 更新后的赛事
 */
export function setChallengeDrafts(
  event: GauntletEvent,
  challenges: ChallengeDesign[]
): GauntletEvent {
  console.log(`[赛事管理] 设置${challenges.length}个关卡草稿`);
  
  // 为每个关卡创建对应的轮次
  const rounds: GauntletRound[] = challenges.map((challenge, index) => ({
    roundNumber: index + 1,
    status: 'draft',
    challenge,
    contestantIds: [],
    performances: [],
    judgeScores: [],
    commentary: [],
    danmakuHistory: [],
    rankings: [],
    advancingIds: [],
    eliminatedIds: []
  }));
  
  return {
    ...event,
    rounds,
    challengesGenerated: true
  };
}

/**
 * 更新单个关卡
 * @param event 当前赛事
 * @param roundNumber 轮次
 * @param challenge 更新后的关卡
 * @returns 更新后的赛事
 */
export function updateChallenge(
  event: GauntletEvent,
  roundNumber: number,
  challenge: ChallengeDesign
): GauntletEvent {
  const rounds = event.rounds.map(round => {
    if (round.roundNumber === roundNumber) {
      return { ...round, challenge };
    }
    return round;
  });
  
  // 检查是否所有关卡都完成了优化
  const allOptimized = rounds.every(round => round.challenge.optimizationProgress === 3);
  
  return {
    ...event,
    rounds,
    allOptimizationsComplete: allOptimized
  };
}

/**
 * 获取指定轮次的关卡
 * @param event 当前赛事
 * @param roundNumber 轮次
 * @returns 关卡设计或undefined
 */
export function getChallenge(
  event: GauntletEvent,
  roundNumber: number
): ChallengeDesign | undefined {
  const round = event.rounds.find(r => r.roundNumber === roundNumber);
  return round?.challenge;
}

/**
 * 获取所有关卡
 * @param event 当前赛事
 * @returns 关卡列表
 */
export function getAllChallenges(event: GauntletEvent): ChallengeDesign[] {
  return event.rounds.map(r => r.challenge);
}

// ============================================
// 轮次管理
// ============================================

/**
 * 获取当前轮次信息
 * @param event 当前赛事
 * @returns 当前轮次或null
 */
export function getCurrentRound(event: GauntletEvent): GauntletRound | null {
  if (event.currentRound === 0 || event.currentRound > 6) return null;
  return event.rounds.find(r => r.roundNumber === event.currentRound) || null;
}

/**
 * 更新轮次数据
 * @param event 当前赛事
 * @param round 更新后的轮次
 * @returns 更新后的赛事
 */
export function updateRound(
  event: GauntletEvent,
  round: GauntletRound
): GauntletEvent {
  const rounds = event.rounds.map(r => {
    if (r.roundNumber === round.roundNumber) {
      return round;
    }
    return r;
  });
  
  return { ...event, rounds };
}

/**
 * 进入下一轮
 * @param event 当前赛事
 * @returns 更新后的赛事
 */
export function advanceToNextRound(event: GauntletEvent): GauntletEvent {
  const nextRound = event.currentRound + 1;
  
  if (nextRound > 6) {
    console.log('[赛事管理] 所有轮次已完成');
    return event;
  }
  
  console.log(`[赛事管理] 进入第${nextRound}轮`);
  
  // 获取活跃参赛者
  const activeContestants = getActiveContestants(event);
  
  // 更新下一轮的参赛者列表
  const rounds = event.rounds.map(r => {
    if (r.roundNumber === nextRound) {
      return {
        ...r,
        status: 'in_progress' as const,
        contestantIds: activeContestants.map(c => c.id),
        startTime: Date.now()
      };
    }
    return r;
  });
  
  return {
    ...event,
    currentRound: nextRound,
    rounds,
    currentPhase: 'performance'
  };
}

// ============================================
// 赛事结束处理
// ============================================

/**
 * 结束赛事
 * @param event 当前赛事
 * @returns 更新后的赛事
 */
export function finishEvent(event: GauntletEvent): GauntletEvent {
  console.log('[赛事管理] 结束赛事');
  
  // 找出冠军
  const champion = event.contestants.find(c => c.status === 'winner') ||
                   event.contestants.reduce((prev, curr) => 
                     curr.currentScore > prev.currentScore ? curr : prev
                   );
  
  // 生成最终排名
  const finalRankings = generateRankings(event.contestants);
  
  return {
    ...event,
    status: 'completed',
    endTime: Date.now(),
    isLive: false,
    champion,
    finalRankings
  };
}

/**
 * 创建赛事历史记录
 * @param event 已完成的赛事
 * @param playerRank 玩家排名
 * @param playerScore 玩家分数
 * @returns 历史记录
 */
export function createEventHistory(
  event: GauntletEvent,
  playerRank?: number,
  playerScore?: number
): GauntletEventHistory {
  return {
    id: event.id,
    edition: event.edition,
    name: event.name,
    date: event.scheduledDate,
    championName: event.champion?.name || '未知',
    playerRank,
    playerScore
  };
}

// ============================================
// 系统状态更新
// ============================================

/**
 * 更新系统状态（在赛事结束后）
 * @param system 当前系统
 * @param event 已完成的赛事
 * @returns 更新后的系统
 */
export function updateSystemAfterEvent(
  system: GauntletSystem,
  event: GauntletEvent
): GauntletSystem {
  const playerContestant = getPlayerContestant(event);
  const isWinner = playerContestant?.status === 'winner';
  const playerRanking = event.finalRankings.find(r => r.contestantId === playerContestant?.id);
  
  const history = createEventHistory(
    event,
    playerRanking?.rank,
    playerRanking?.score
  );
  
  // 更新玩家统计
  const updatedStats = playerContestant ? {
    participations: system.playerStats.participations + 1,
    wins: system.playerStats.wins + (isWinner ? 1 : 0),
    bestRank: system.playerStats.bestRank === 0 
      ? (playerRanking?.rank || 0)
      : Math.min(system.playerStats.bestRank, playerRanking?.rank || 999),
    totalScore: system.playerStats.totalScore + (playerRanking?.score || 0),
    averageRank: 0 // 将在下面计算
  } : system.playerStats;
  
  if (updatedStats.participations > 0) {
    updatedStats.averageRank = Math.round(updatedStats.totalScore / updatedStats.participations);
  }
  
  return {
    ...system,
    currentEvent: null,
    eventHistory: [...system.eventHistory, history],
    totalEditions: event.edition,
    nextEventDate: calculateNextEventDate(system.config),
    playerStats: updatedStats
  };
}

// ============================================
// 辅助查询函数
// ============================================

/**
 * 检查玩家是否已报名
 * @param event 当前赛事
 * @returns 是否已报名
 */
export function isPlayerRegistered(event: GauntletEvent): boolean {
  return !!event.playerContestantId;
}

/**
 * 检查是否可以开始报名
 * @param event 当前赛事
 * @returns 是否可以报名
 */
export function canRegister(event: GauntletEvent): boolean {
  return event.status === 'registration' && !event.playerContestantId;
}

/**
 * 获取赛事状态描述
 * @param event 当前赛事
 * @returns 状态描述文字
 */
export function getEventStatusDescription(event: GauntletEvent): string {
  switch (event.status) {
    case 'countdown':
      return '倒计时中';
    case 'registration':
      return '报名中';
    case 'preparing':
      return '准备中';
    case 'in_progress':
      return `比赛进行中 - 第${event.currentRound}轮`;
    case 'completed':
      return '已结束';
    default:
      return '未知状态';
  }
}

/**
 * 获取参赛者统计
 * @param event 当前赛事
 * @returns 统计数据
 */
export function getContestantStats(event: GauntletEvent): {
  total: number;
  active: number;
  eliminated: number;
  hasPlayer: boolean;
} {
  return {
    total: event.contestants.length,
    active: event.contestants.filter(c => c.status === 'active').length,
    eliminated: event.contestants.filter(c => c.status === 'eliminated').length,
    hasPlayer: !!event.playerContestantId
  };
}

// ============================================
// 导出服务对象
// ============================================

export const GauntletEventService = {
  // 创建与初始化
  createNewEvent,
  initializeGauntletSystem,
  
  // 状态管理
  updateEventStatus,
  checkAndAdvanceEventStatus,
  
  // 参赛者管理
  registerPlayerContestant,
  addAIContestants,
  cancelPlayerRegistration,
  getPlayerContestant,
  getActiveContestants,
  getEliminatedContestants,
  
  // 评委管理
  setJudges,
  getJudges,
  
  // 关卡管理
  setChallengeDrafts,
  updateChallenge,
  getChallenge,
  getAllChallenges,
  
  // 轮次管理
  getCurrentRound,
  updateRound,
  advanceToNextRound,
  
  // 赛事结束
  finishEvent,
  createEventHistory,
  updateSystemAfterEvent,
  
  // 辅助查询
  isPlayerRegistered,
  canRegister,
  getEventStatusDescription,
  getContestantStats
};