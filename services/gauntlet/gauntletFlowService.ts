/**
 * 大闯关系统 - 流程控制服务
 * 
 * 负责赛事流程的自动化控制,包括:
 * - 准备阶段自动化(生成参赛者→评委→关卡→优化)
 * - 比赛流程控制(单轮比赛完整流程)
 * - 状态机和阶段转换
 */

import { GameState } from '../../types';
import {
    Commentary,
    GauntletEvent,
    GauntletRound,
    GauntletSystem,
    JudgeScore
} from '../../types/gauntlet.types';
import { gauntletAIService } from './gauntletAIService';
import {
    addAIContestants,
    advanceToNextRound,
    createNewEvent,
    finishEvent,
    getCurrentRound,
    setChallengeDrafts,
    setJudges,
    updateChallenge,
    updateEventStatus,
    updateRound,
    updateSystemAfterEvent
} from './gauntletEventService';
import {
    getAdvancingCount
} from './gauntletUtils';

// ============================================
// 流程控制回调类型
// ============================================

export interface FlowCallbacks {
  onProgress?: (stage: string, progress: number, message: string) => void;
  onError?: (error: Error, stage: string) => void;
  onStageComplete?: (stage: string) => void;
  onEventComplete?: (event: GauntletEvent) => void;
}

// ============================================
// 准备阶段流程
// ============================================

/**
 * 执行完整的准备阶段流程
 * 包括: 生成AI参赛者 → 生成评委 → 生成关卡 → 优化关卡
 * 
 * @param event 当前赛事
 * @param gameState 游戏状态
 * @param callbacks 进度回调
 * @returns 更新后的赛事
 */
export async function runPreparationPhase(
  event: GauntletEvent,
  gameState: GameState,
  callbacks?: FlowCallbacks
): Promise<GauntletEvent> {
  console.log('[流程控制] 开始准备阶段');
  let updatedEvent = { ...event };
  
  try {
    // 阶段1: 生成AI参赛者
    callbacks?.onProgress?.('contestants', 0, '正在生成AI参赛者...');
    updatedEvent = await generateAIContestants(updatedEvent, gameState);
    callbacks?.onProgress?.('contestants', 100, `已生成${updatedEvent.contestants.length}名参赛者`);
    callbacks?.onStageComplete?.('contestants');
    
    // 阶段2: 生成评委
    callbacks?.onProgress?.('judges', 0, '正在生成评委团...');
    updatedEvent = await generateJudges(updatedEvent, gameState);
    callbacks?.onProgress?.('judges', 100, `已生成${updatedEvent.judges.length}名评委`);
    callbacks?.onStageComplete?.('judges');
    
    // 阶段3: 生成关卡草稿
    callbacks?.onProgress?.('challenges', 0, '正在生成关卡草稿...');
    updatedEvent = await generateAllChallenges(updatedEvent, gameState, (progress, message) => {
      callbacks?.onProgress?.('challenges', progress, message);
    });
    callbacks?.onProgress?.('challenges', 100, '关卡草稿生成完成');
    callbacks?.onStageComplete?.('challenges');
    
    // 阶段4: 优化所有关卡
    callbacks?.onProgress?.('optimization', 0, '正在优化关卡...');
    updatedEvent = await optimizeAllChallenges(updatedEvent, gameState, (progress, message) => {
      callbacks?.onProgress?.('optimization', progress, message);
    });
    callbacks?.onProgress?.('optimization', 100, '关卡优化完成');
    callbacks?.onStageComplete?.('optimization');
    
    console.log('[流程控制] 准备阶段完成');
    return updatedEvent;
    
  } catch (error) {
    console.error('[流程控制] 准备阶段失败:', error);
    callbacks?.onError?.(error as Error, 'preparation');
    throw error;
  }
}

/**
 * 生成AI参赛者(填充到64人)
 */
async function generateAIContestants(
  event: GauntletEvent,
  gameState: GameState
): Promise<GauntletEvent> {
  const currentCount = event.contestants.length;
  const neededCount = 64 - currentCount;
  
  if (neededCount <= 0) {
    console.log('[流程控制] 参赛者已满，无需生成');
    return event;
  }
  
  console.log(`[流程控制] 需要生成${neededCount}名AI参赛者`);
  
  const aiContestants = await gauntletAIService.generateContestants(neededCount, gameState);
  return addAIContestants(event, aiContestants);
}

/**
 * 生成评委团
 */
async function generateJudges(
  event: GauntletEvent,
  gameState: GameState
): Promise<GauntletEvent> {
  if (event.judges.length >= 3) {
    console.log('[流程控制] 评委已存在，无需生成');
    return event;
  }
  
  const judges = await gauntletAIService.generateJudges(5, gameState);
  return setJudges(event, judges);
}

/**
 * 生成所有关卡草稿
 */
async function generateAllChallenges(
  event: GauntletEvent,
  gameState: GameState,
  onProgress?: (progress: number, message: string) => void
): Promise<GauntletEvent> {
  if (event.challengesGenerated) {
    console.log('[流程控制] 关卡已生成，无需重新生成');
    return event;
  }
  
  const challenges = await gauntletAIService.generateAllChallengeDrafts(gameState);
  
  // 报告进度
  challenges.forEach((challenge, index) => {
    const progress = Math.round(((index + 1) / 6) * 100);
    onProgress?.(progress, `已生成第${index + 1}轮关卡: ${challenge.name}`);
  });
  
  return setChallengeDrafts(event, challenges);
}

/**
 * 优化所有关卡(每个关卡3轮优化)
 */
async function optimizeAllChallenges(
  event: GauntletEvent,
  gameState: GameState,
  onProgress?: (progress: number, message: string) => void
): Promise<GauntletEvent> {
  let updatedEvent = { ...event };
  const totalOptimizations = 6 * 3; // 6轮 × 3次优化
  let completedOptimizations = 0;
  
  for (let round = 1; round <= 6; round++) {
    const challenge = updatedEvent.rounds[round - 1]?.challenge;
    if (!challenge) continue;
    
    let updatedChallenge = { ...challenge };
    
    for (let optRound = 1; optRound <= 3; optRound++) {
      // 检查是否已经完成该轮优化
      if (updatedChallenge.optimizationProgress >= optRound) {
        completedOptimizations++;
        continue;
      }
      
      onProgress?.(
        Math.round((completedOptimizations / totalOptimizations) * 100),
        `优化第${round}轮关卡(${optRound}/3): ${updatedChallenge.name}`
      );
      
      const optimization = await gauntletAIService.optimizeChallenge(
        updatedChallenge,
        optRound as 1 | 2 | 3,
        gameState
      );
      
      // 更新关卡
      updatedChallenge = {
        ...updatedChallenge,
        [`optimization${optRound}`]: optimization,
        optimizationProgress: optRound as 0 | 1 | 2 | 3
      };
      
      // 如果是最后一轮优化,设置最终版本
      if (optRound === 3) {
        updatedChallenge.finalVersion = optimization.optimizedDesign;
      }
      
      completedOptimizations++;
      
      // 添加小延迟避免API限流
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    updatedEvent = updateChallenge(updatedEvent, round, updatedChallenge);
  }
  
  return updatedEvent;
}

// ============================================
// 比赛流程控制
// ============================================

/**
 * 开始比赛(从第一轮开始)
 */
export async function startCompetition(
  event: GauntletEvent,
  gameState: GameState,
  callbacks?: FlowCallbacks
): Promise<GauntletEvent> {
  console.log('[流程控制] 开始比赛');
  
  // 更新状态为进行中
  let updatedEvent = updateEventStatus(event, 'in_progress');
  
  // 进入第一轮
  updatedEvent = advanceToNextRound(updatedEvent);
  
  return updatedEvent;
}

/**
 * 执行单轮比赛的完整流程
 */
export async function runRoundFlow(
  event: GauntletEvent,
  gameState: GameState,
  callbacks?: FlowCallbacks
): Promise<GauntletEvent> {
  const currentRound = getCurrentRound(event);
  if (!currentRound) {
    throw new Error('没有进行中的轮次');
  }
  
  console.log(`[流程控制] 执行第${currentRound.roundNumber}轮比赛`);
  let updatedEvent = { ...event };
  let updatedRound = { ...currentRound };
  
  try {
    // 阶段1: 开场解说
    callbacks?.onProgress?.('opening', 0, '正在生成开场解说...');
    const openingCommentary = await generateRoundCommentary(
      updatedRound,
      'opening',
      gameState
    );
    updatedRound.commentary.push(openingCommentary);
    callbacks?.onProgress?.('opening', 100, '开场解说完成');
    
    // 阶段2: 表演阶段
    callbacks?.onProgress?.('performance', 0, '正在生成选手表现...');
    updatedRound = await runPerformancePhase(updatedRound, updatedEvent, gameState, callbacks);
    callbacks?.onProgress?.('performance', 100, '表演阶段完成');
    
    // 阶段3: 评分阶段
    callbacks?.onProgress?.('judging', 0, '正在生成评委评分...');
    updatedRound = await runJudgingPhase(updatedRound, updatedEvent, gameState, callbacks);
    callbacks?.onProgress?.('judging', 100, '评分阶段完成');
    
    // 阶段4: 计算排名和淘汰
    callbacks?.onProgress?.('ranking', 0, '正在计算排名...');
    updatedRound = calculateRoundResults(updatedRound, updatedEvent);
    callbacks?.onProgress?.('ranking', 100, '排名计算完成');
    
    // 阶段5: 结束解说
    callbacks?.onProgress?.('closing', 0, '正在生成结束解说...');
    const closingCommentary = await generateRoundCommentary(
      updatedRound,
      'closing',
      gameState
    );
    updatedRound.commentary.push(closingCommentary);
    callbacks?.onProgress?.('closing', 100, '结束解说完成');
    
    // 更新轮次状态
    updatedRound.status = 'completed';
    updatedRound.endTime = Date.now();
    
    // 更新赛事
    updatedEvent = updateRound(updatedEvent, updatedRound);
    
    // 更新参赛者状态
    updatedEvent = updateContestantStatuses(updatedEvent, updatedRound);
    
    console.log(`[流程控制] 第${currentRound.roundNumber}轮完成`);
    return updatedEvent;
    
  } catch (error) {
    console.error('[流程控制] 轮次执行失败:', error);
    callbacks?.onError?.(error as Error, 'round');
    throw error;
  }
}

/**
 * 表演阶段 - 生成所有参赛者的表现
 */
async function runPerformancePhase(
  round: GauntletRound,
  event: GauntletEvent,
  gameState: GameState,
  callbacks?: FlowCallbacks
): Promise<GauntletRound> {
  const activeContestants = event.contestants.filter(
    c => round.contestantIds.includes(c.id) && c.status === 'active'
  );
  
  // 使用群体模式生成表现
  const performances = await gauntletAIService.generateGroupPerformance(
    activeContestants,
    round.challenge,
    gameState
  );
  
  return {
    ...round,
    performances,
    status: 'judging'
  };
}

/**
 * 评分阶段 - 生成评委评分
 */
async function runJudgingPhase(
  round: GauntletRound,
  event: GauntletEvent,
  gameState: GameState,
  callbacks?: FlowCallbacks
): Promise<GauntletRound> {
  const allScores: JudgeScore[] = [];
  
  // 为每个表现生成评委评分
  for (const performance of round.performances) {
    const scores = await gauntletAIService.generateJudgeScores(
      event.judges,
      performance,
      gameState
    );
    allScores.push(...scores);
    
    // 添加小延迟
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return {
    ...round,
    judgeScores: allScores
  };
}

/**
 * 生成轮次解说
 */
async function generateRoundCommentary(
  round: GauntletRound,
  phase: 'opening' | 'closing',
  gameState: GameState
): Promise<Commentary> {
  const context = {
    roundNumber: round.roundNumber,
    challenge: round.challenge,
    performances: round.performances,
    rankings: round.rankings
  };
  
  return gauntletAIService.generateCommentary(phase, context, gameState);
}

/**
 * 计算轮次结果(排名和淘汰)
 */
function calculateRoundResults(
  round: GauntletRound,
  event: GauntletEvent
): GauntletRound {
  // 计算每个参赛者的最终得分(表现分 + 评委平均分)
  const contestantScores = round.performances.map(perf => {
    const judgeScores = round.judgeScores.filter(s => s.contestantId === perf.contestantId);
    const avgJudgeScore = judgeScores.length > 0
      ? judgeScores.reduce((sum, s) => sum + s.score, 0) / judgeScores.length
      : 0;
    
    // 最终得分 = 表现分 * 0.7 + 评委平均分 * 0.3
    const finalScore = perf.score * 0.7 + avgJudgeScore * 0.3;
    
    return {
      contestantId: perf.contestantId,
      contestantName: perf.contestantName,
      score: Math.round(finalScore * 10) / 10
    };
  });
  
  // 排序
  contestantScores.sort((a, b) => b.score - a.score);
  
  // 生成排名
  const rankings = contestantScores.map((cs, index) => {
    const contestant = event.contestants.find(c => c.id === cs.contestantId);
    return {
      rank: index + 1,
      contestantId: cs.contestantId,
      contestantName: cs.contestantName,
      score: cs.score,
      status: contestant?.status || 'active'
    };
  });
  
  // 确定晋级和淘汰
  const advancingCount = getAdvancingCount(round.roundNumber, round.contestantIds.length);
  const advancingIds = rankings.slice(0, advancingCount).map(r => r.contestantId);
  const eliminatedIds = rankings.slice(advancingCount).map(r => r.contestantId);
  
  // 更新表现的passed字段
  const updatedPerformances = round.performances.map(perf => ({
    ...perf,
    passed: advancingIds.includes(perf.contestantId),
    rank: rankings.find(r => r.contestantId === perf.contestantId)?.rank || 0
  }));
  
  return {
    ...round,
    rankings,
    advancingIds,
    eliminatedIds,
    performances: updatedPerformances
  };
}

/**
 * 更新参赛者状态(根据本轮结果)
 */
function updateContestantStatuses(
  event: GauntletEvent,
  round: GauntletRound
): GauntletEvent {
  const contestants = event.contestants.map(contestant => {
    // 检查是否被淘汰
    if (round.eliminatedIds.includes(contestant.id)) {
      return {
        ...contestant,
        status: 'eliminated' as const,
        eliminatedRound: round.roundNumber
      };
    }
    
    // 检查是否是冠军(最后一轮的晋级者)
    if (round.roundNumber === 6 && round.advancingIds.includes(contestant.id)) {
      return {
        ...contestant,
        status: 'winner' as const
      };
    }
    
    // 更新本轮得分
    const performance = round.performances.find(p => p.contestantId === contestant.id);
    if (performance) {
      const updatedScores = [...contestant.roundScores];
      updatedScores[round.roundNumber - 1] = performance.score;
      
      return {
        ...contestant,
        roundScores: updatedScores,
        currentScore: contestant.currentScore + performance.score
      };
    }
    
    return contestant;
  });
  
  return { ...event, contestants };
}

// ============================================
// 完整比赛流程
// ============================================

/**
 * 执行完整的6轮比赛
 */
export async function runFullCompetition(
  event: GauntletEvent,
  gameState: GameState,
  callbacks?: FlowCallbacks
): Promise<GauntletEvent> {
  console.log('[流程控制] 开始完整比赛流程');
  let updatedEvent = await startCompetition(event, gameState, callbacks);
  
  for (let round = 1; round <= 6; round++) {
    console.log(`[流程控制] === 第${round}轮 ===`);
    
    updatedEvent = await runRoundFlow(updatedEvent, gameState, callbacks);
    
    // 检查是否还有后续轮次
    if (round < 6) {
      updatedEvent = advanceToNextRound(updatedEvent);
    }
    
    // 添加轮次间的延迟
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 结束比赛
  updatedEvent = finishEvent(updatedEvent);
  callbacks?.onEventComplete?.(updatedEvent);
  
  console.log('[流程控制] 完整比赛结束');
  return updatedEvent;
}

// ============================================
// 弹幕交互
// ============================================

/**
 * 处理玩家弹幕
 */
export async function handlePlayerDanmaku(
  event: GauntletEvent,
  playerInput: string,
  gameState: GameState
): Promise<{
  event: GauntletEvent;
  response: {
    narrative: string;
    commentary: string;
    danmakus: string[];
  };
}> {
  const currentRound = getCurrentRound(event);
  if (!currentRound) {
    throw new Error('当前没有进行中的轮次');
  }
  
  // 生成弹幕响应
  const context = {
    roundNumber: currentRound.roundNumber,
    challenge: currentRound.challenge,
    currentNarrative: currentRound.performances[0]?.narrative || ''
  };
  
  const response = await gauntletAIService.generateDanmakuResponse(
    playerInput,
    context,
    gameState
  );
  
  // 添加弹幕到历史
  const playerDanmaku = {
    id: `danmaku_${Date.now()}`,
    content: playerInput,
    timestamp: Date.now(),
    type: 'player' as const,
    author: '你'
  };
  
  const aiDanmakus = response.danmakus.map((content, index) => ({
    id: `danmaku_ai_${Date.now()}_${index}`,
    content,
    timestamp: Date.now() + index * 100,
    type: 'ai_generated' as const,
    author: `观众${Math.floor(Math.random() * 1000)}`
  }));
  
  const updatedRound = {
    ...currentRound,
    danmakuHistory: [
      ...currentRound.danmakuHistory,
      playerDanmaku,
      ...aiDanmakus
    ]
  };
  
  const updatedEvent = updateRound(event, updatedRound);
  
  return { event: updatedEvent, response };
}

// ============================================
// 赛事生命周期管理
// ============================================

/**
 * 创建并启动新赛事
 */
export async function createAndStartNewEvent(
  system: GauntletSystem,
  gameState: GameState,
  callbacks?: FlowCallbacks
): Promise<{
  system: GauntletSystem;
  event: GauntletEvent;
}> {
  // 创建新赛事
  let event = createNewEvent(system);
  
  // 更新系统
  let updatedSystem = {
    ...system,
    currentEvent: event,
    totalEditions: event.edition
  };
  
  return { system: updatedSystem, event };
}

/**
 * 完成赛事并更新系统
 */
export function completeEventAndUpdateSystem(
  system: GauntletSystem,
  event: GauntletEvent
): GauntletSystem {
  return updateSystemAfterEvent(system, event);
}

// ============================================
// 导出服务对象
// ============================================

export const GauntletFlowService = {
  // 准备阶段
  runPreparationPhase,
  
  // 比赛流程
  startCompetition,
  runRoundFlow,
  runFullCompetition,
  
  // 弹幕交互
  handlePlayerDanmaku,
  
  // 生命周期
  createAndStartNewEvent,
  completeEventAndUpdateSystem
};