import { z } from 'zod';

/**
 * 大闯关系统 - AI响应格式Schema定义
 */

/**
 * 参赛者生成格式
 */
export const ContestantDataSchema = z.object({
  name: z.string(),
  realm: z.string(),
  appearance: z.string(),
  specialTrait: z.string(),
  charm: z.number().min(0).max(100),
  skillfulness: z.number().min(0).max(100),
});

/**
 * 参赛者数组格式
 */
export const ContestantsArraySchema = z.array(ContestantDataSchema);

/**
 * 评委生成格式
 */
export const JudgeDataSchema = z.object({
  name: z.string(),
  title: z.string(),
  realm: z.string(),
  personality: z.string(),
  judgingStyle: z.string(),
  specialty: z.string(),
});

/**
 * 评委数组格式
 */
export const JudgesArraySchema = z.array(JudgeDataSchema);

/**
 * 关卡设计草稿格式
 */
export const ChallengeDraftSchema = z.object({
  type: z.string(),
  name: z.string(),
  description: z.string(),
  rules: z.array(z.string()).min(2),  // 降低最小值要求，避免AI生成规则不足时验证失败
  winCondition: z.string(),
  eliminationCriteria: z.string(),
  estimatedDuration: z.string(),
});

/**
 * 关卡优化记录格式
 */
export const ChallengeOptimizationSchema = z.object({
  critique: z.string(),
  issues: z.array(z.string()),
  suggestions: z.array(z.string()),
  changes: z.array(z.string()),
  optimizedDesign: z.string(),
  improvementSummary: z.string(),
});

/**
 * 参赛者表现格式 (群体)
 */
export const PerformanceDataSchema = z.object({
  contestantName: z.string(),
  score: z.number().min(0).max(100),
  narrative: z.string(),
  highlights: z.array(z.string()),
  mistakes: z.array(z.string()),
});

/**
 * 参赛者表现数组格式
 */
export const PerformancesArraySchema = z.array(PerformanceDataSchema);

/**
 * 参赛者详细表现格式 (个人)
 */
export const DetailedPerformanceSchema = z.object({
  score: z.number().min(0).max(100),
  narrative: z.string(),
  highlights: z.array(z.string()),
  mistakes: z.array(z.string()),
});

/**
 * 评委评分格式
 */
export const JudgeScoreDataSchema = z.object({
  judgeId: z.string(),
  judgeName: z.string(),
  score: z.number().min(0).max(100),
  comment: z.string(),
});

/**
 * 评委评分数组格式
 */
export const JudgeScoresArraySchema = z.array(JudgeScoreDataSchema);

/**
 * 解说内容格式
 */
export const CommentaryDataSchema = z.object({
  content: z.string(),
  speaker: z.string().default('解说员'),
});

/**
 * 弹幕响应格式
 */
export const DanmakuResponseSchema = z.object({
  narrative: z.string(),
  commentary: z.string(),
  danmakus: z.array(z.string()),
});

// 导出类型定义
export type ContestantData = z.infer<typeof ContestantDataSchema>;
export type ContestantsArray = z.infer<typeof ContestantsArraySchema>;
export type JudgeData = z.infer<typeof JudgeDataSchema>;
export type JudgesArray = z.infer<typeof JudgesArraySchema>;
export type ChallengeDraft = z.infer<typeof ChallengeDraftSchema>;
export type ChallengeOptimizationData = z.infer<typeof ChallengeOptimizationSchema>;
export type PerformanceData = z.infer<typeof PerformanceDataSchema>;
export type PerformancesArray = z.infer<typeof PerformancesArraySchema>;
export type DetailedPerformance = z.infer<typeof DetailedPerformanceSchema>;
export type JudgeScoreData = z.infer<typeof JudgeScoreDataSchema>;
export type JudgeScoresArray = z.infer<typeof JudgeScoresArraySchema>;
export type CommentaryData = z.infer<typeof CommentaryDataSchema>;
export type DanmakuResponseData = z.infer<typeof DanmakuResponseSchema>;