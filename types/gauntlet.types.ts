/**
 * 大闯关赛事系统 - 类型定义
 * 
 * 包含所有赛事、参赛者、关卡、评委等相关的类型定义
 */

// ============================================
// 基础枚举类型
// ============================================

/**
 * 赛事状态
 */
export type GauntletStatus = 
  | 'countdown'      // 倒计时阶段
  | 'registration'   // 报名阶段
  | 'preparing'      // 准备阶段
  | 'in_progress'    // 比赛进行中
  | 'completed';     // 已结束

/**
 * 轮次状态
 */
export type RoundStatus = 
  | 'pending'        // 等待中
  | 'draft'          // 已生成草稿
  | 'optimizing'     // 优化中
  | 'ready'          // 准备就绪
  | 'in_progress'    // 进行中
  | 'judging'        // 评分中
  | 'completed';     // 已完成

/**
 * 关卡类型
 */
export type ChallengeType = 
  | '解谜'    // 智力解谜
  | '竞技'    // 速度竞技
  | '体能'    // 体能挑战
  | '技巧'    // 技巧展示
  | '智力'    // 智力考验
  | '综合';   // 综合挑战

/**
 * 参赛者状态
 */
export type ContestantStatus = 
  | 'active'      // 活跃
  | 'eliminated'  // 已淘汰
  | 'winner';     // 冠军

/**
 * 解说阶段
 */
export type CommentaryPhase = 
  | 'opening'     // 开场
  | 'during'      // 进行中
  | 'highlight'   // 精彩瞬间
  | 'closing'     // 结束
  | 'judging';    // 评分阶段

/**
 * 弹幕类型
 */
export type DanmakuType = 
  | 'player'        // 玩家发送
  | 'ai_generated'  // AI生成
  | 'system';       // 系统消息

/**
 * 赛事当前阶段
 */
export type EventPhase = 
  | 'performance'  // 表演阶段
  | 'judging'      // 评分阶段
  | 'result';      // 结果阶段

/**
 * 观看模式
 */
export type ViewMode = 
  | 'group'       // 群体模式
  | 'individual'; // 个人模式

// ============================================
// 参赛者相关
// ============================================

/**
 * 参赛者数据结构
 */
export interface GauntletContestant {
  id: string;
  name: string;
  gender: 'Female';
  realm: string;              // 境界
  appearance: string;         // 外观描述
  specialTrait: string;       // 特殊特点
  charm: number;              // 魅力值 0-100
  skillfulness: number;       // 技巧值 0-100
  
  // 赛事相关
  status: ContestantStatus;
  currentScore: number;       // 当前总分
  roundScores: number[];      // 每轮得分
  eliminatedRound?: number;   // 被淘汰的轮次
  
  // 玩家角色标识
  isPlayerCharacter: boolean;
  characterCardId?: string;   // 如果是玩家角色,关联的卡牌ID
}

/**
 * 参赛者表现数据
 */
export interface ContestantPerformance {
  contestantId: string;
  contestantName: string;
  roundNumber: number;
  
  score: number;              // 本轮得分 0-100
  rank: number;               // 本轮排名
  
  narrative: string;          // AI生成的完整表现叙事
  highlights: string[];       // 精彩瞬间
  mistakes: string[];         // 失误记录
  
  passed: boolean;            // 是否晋级
}

// ============================================
// 评委相关
// ============================================

/**
 * 评委数据结构
 */
export interface GauntletJudge {
  id: string;
  name: string;
  title: string;              // 称号
  realm: string;              // 境界
  personality: string;        // 性格特点
  judgingStyle: string;       // 评判风格
  specialty: string;          // 专长领域
  avatar?: string;
}

/**
 * 评委评分数据
 */
export interface JudgeScore {
  judgeId: string;
  judgeName: string;
  contestantId: string;
  roundNumber: number;
  
  score: number;              // 0-100
  comment: string;            // 评语
}

// ============================================
// 关卡相关
// ============================================

/**
 * 关卡优化记录
 */
export interface ChallengeOptimization {
  round: 1 | 2 | 3;
  timestamp: number;
  
  // AI生成内容
  critique: string;           // 批判分析
  issues: string[];           // 发现的问题
  suggestions: string[];      // 改进建议
  
  // 优化结果
  changes: string[];          // 实际修改内容
  optimizedDesign: string;    // 优化后的完整设计
  improvementSummary: string; // 改进总结
}

/**
 * 关卡设计数据结构
 */
export interface ChallengeDesign {
  id: string;
  roundNumber: number;        // 第几轮 (1-6)
  type: ChallengeType;
  name: string;               // 关卡名称
  description: string;        // 详细描述
  
  // 规则
  rules: string[];            // 规则列表
  winCondition: string;       // 获胜条件
  eliminationCriteria: string; // 淘汰标准
  
  // 难度和时长
  difficulty: number;         // 1-10
  estimatedDuration: string;  // 如"30分钟"
  
  // 优化历程
  draftVersion: string;       // 初始草稿
  optimization1?: ChallengeOptimization;
  optimization2?: ChallengeOptimization;
  optimization3?: ChallengeOptimization;
  finalVersion: string;       // 最终版本
  
  // 状态
  optimizationProgress: 0 | 1 | 2 | 3; // 完成了几轮优化
}

// ============================================
// 弹幕和解说
// ============================================

/**
 * 弹幕数据
 */
export interface Danmaku {
  id: string;
  content: string;
  timestamp: number;
  
  type: DanmakuType;
  author?: string;            // 发送者名称
  color?: string;             // 弹幕颜色
}

/**
 * 解说数据
 */
export interface Commentary {
  id: string;
  timestamp: number;
  roundNumber: number;
  
  phase: CommentaryPhase;
  content: string;
  speaker: string;            // 解说员名称
}

// ============================================
// 排行榜
// ============================================

/**
 * 排行榜条目
 */
export interface RankingEntry {
  rank: number;
  contestantId: string;
  contestantName: string;
  score: number;
  status: ContestantStatus;
}

// ============================================
// 轮次和赛事
// ============================================

/**
 * 单轮比赛数据
 */
export interface GauntletRound {
  roundNumber: number;        // 1-6
  status: RoundStatus;
  
  challenge: ChallengeDesign;
  
  contestantIds: string[];    // 本轮参赛者ID列表
  performances: ContestantPerformance[];
  judgeScores: JudgeScore[];
  
  commentary: Commentary[];
  danmakuHistory: Danmaku[];
  
  rankings: RankingEntry[];   // 本轮排行
  advancingIds: string[];     // 晋级者ID
  eliminatedIds: string[];    // 淘汰者ID
  
  startTime?: number;
  endTime?: number;
}

/**
 * 赛事主数据结构
 */
export interface GauntletEvent {
  id: string;
  edition: number;            // 第几届
  name: string;
  status: GauntletStatus;
  
  scheduledDate: number;
  registrationDeadline: number;
  startTime?: number;
  endTime?: number;
  
  contestants: GauntletContestant[];
  judges: GauntletJudge[];
  playerContestantId?: string;
  
  challengesGenerated: boolean;
  allOptimizationsComplete: boolean;
  
  currentRound: number;       // 0-6 (0表示未开始)
  rounds: GauntletRound[];
  
  champion?: GauntletContestant;
  finalRankings: RankingEntry[];
  
  viewMode: ViewMode;
  focusedContestantId?: string;
  
  isLive: boolean;
  currentPhase?: EventPhase;
}

/**
 * 历史赛事记录(简化版)
 */
export interface GauntletEventHistory {
  id: string;
  edition: number;
  name: string;
  date: number;
  championName: string;
  playerRank?: number;
  playerScore?: number;
}

// ============================================
// 系统配置
// ============================================

/**
 * 赛事系统配置
 */
export interface GauntletConfig {
  monthlySchedule: number;     // 每月第几天举行
  registrationDuration: number; // 报名时长(小时)
  enableAutoGeneration: boolean;
  preparationDuration: number;  // 准备阶段时长(小时)
}

/**
 * 玩家统计数据
 */
export interface GauntletPlayerStats {
  participations: number;
  wins: number;
  bestRank: number;
  totalScore: number;
  averageRank: number;
}

/**
 * 大闯关系统主数据结构
 */
export interface GauntletSystem {
  currentEvent: GauntletEvent | null;
  eventHistory: GauntletEventHistory[];
  totalEditions: number;
  nextEventDate: number;
  
  playerStats: GauntletPlayerStats;
  
  config: GauntletConfig;
}

// ============================================
// AI生成相关
// ============================================

/**
 * AI生成弹幕响应的返回结构
 */
export interface DanmakuResponse {
  narrative: string;           // 叙事更新
  commentary: string;          // 解说评论
  danmakus: string[];          // AI生成的观众弹幕
}

/**
 * AI生成关卡草稿的上下文
 */
export interface ChallengeGenerationContext {
  roundNumber: number;
  previousChallenges: ChallengeDesign[];
  contestantCount: number;
}

/**
 * AI生成表现的上下文
 */
export interface PerformanceGenerationContext {
  challenge: ChallengeDesign;
  contestant: GauntletContestant;
  previousPerformances: ContestantPerformance[];
  currentRanking?: RankingEntry[];
}