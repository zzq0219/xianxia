import { z } from 'zod';

/**
 * 通用 AI 响应格式
 */
export const SimpleTextSchema = z.object({
  content: z.string(),
});

/**
 * NPC 对话格式
 */
export const NPCDialogueSchema = z.object({
  speaker: z.string(),
  dialogue: z.string(),
  emotion: z.enum(['平静', '愤怒', '惊讶', '喜悦', '悲伤', '困惑', '兴奋', '恐惧']).optional(),
  relationshipChange: z.number().min(-10).max(10).optional(),
});

/**
 * 战斗描述格式
 */
export const BattleNarrativeSchema = z.object({
  attacker: z.string(),
  action: z.string(),
  target: z.string(),
  damage: z.number().optional(),
  effect: z.string().optional(),
  result: z.string().optional(),
});

/**
 * 物品描述格式
 */
export const ItemDescriptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
  type: z.string().optional(),
  attributes: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

/**
 * 技能描述格式
 */
export const SkillDescriptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.string().optional(),
  damage: z.number().optional(),
  cooldown: z.number().optional(),
  manaCost: z.number().optional(),
  effects: z.array(z.string()).optional(),
});

/**
 * 事件描述格式
 */
export const EventDescriptionSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(['random', 'quest', 'battle', 'dialogue', 'exploration']).optional(),
  choices: z.array(z.object({
    text: z.string(),
    consequence: z.string().optional(),
  })).optional(),
  rewards: z.object({
    exp: z.number().optional(),
    gold: z.number().optional(),
    items: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * 角色描述格式
 */
export const CharacterDescriptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  personality: z.string().optional(),
  background: z.string().optional(),
  appearance: z.string().optional(),
  cultivation: z.string().optional(),
});

/**
 * 地点描述格式
 */
export const LocationDescriptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  atmosphere: z.string().optional(),
  npcs: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

/**
 * 任务描述格式
 */
export const QuestDescriptionSchema = z.object({
  title: z.string(),
  description: z.string(),
  objectives: z.array(z.string()),
  rewards: z.object({
    exp: z.number().optional(),
    gold: z.number().optional(),
    items: z.array(z.string()).optional(),
    reputation: z.number().optional(),
  }).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'legendary']).optional(),
});

/**
 * 叙事文本格式
 */
export const NarrativeTextSchema = z.object({
  content: z.string(),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional(),
  timestamp: z.number().optional(),
});

/**
 * 修炼感悟格式
 */
export const CultivationInsightSchema = z.object({
  insight: z.string(),
  breakthroughChance: z.number().min(0).max(100).optional(),
  spiritualGain: z.number().optional(),
  comprehension: z.string().optional(),
});

/**
 * 商店物品列表格式
 */
export const ShopItemsSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    rarity: z.string().optional(),
    stock: z.number().optional(),
  })),
});

/**
 * 战斗结果格式
 */
export const BattleResultSchema = z.object({
  winner: z.string(),
  summary: z.string(),
  rewards: z.object({
    exp: z.number().optional(),
    gold: z.number().optional(),
    items: z.array(z.string()).optional(),
  }).optional(),
  casualties: z.array(z.string()).optional(),
});

/**
 * AI 选择格式（多选一）
 */
export const AIChoiceSchema = z.object({
  choice: z.string(),
  reasoning: z.string().optional(),
});

/**
 * 多个选项格式
 */
export const MultipleChoicesSchema = z.object({
  choices: z.array(z.object({
    id: z.string(),
    text: z.string(),
    description: z.string().optional(),
  })),
});

/**
 * 分析结果格式
 */
export const AnalysisResultSchema = z.object({
  analysis: z.string(),
  score: z.number().min(0).max(100).optional(),
  suggestions: z.array(z.string()).optional(),
  conclusion: z.string().optional(),
});

/**
 * 对话列表格式
 */
export const DialogueListSchema = z.object({
  dialogues: z.array(z.object({
    speaker: z.string(),
    text: z.string(),
    emotion: z.string().optional(),
  })),
});

/**
 * 状态更新格式
 */
export const StatusUpdateSchema = z.object({
  changes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  description: z.string().optional(),
});

// 导出类型定义
export type SimpleText = z.infer<typeof SimpleTextSchema>;
export type NPCDialogue = z.infer<typeof NPCDialogueSchema>;
export type BattleNarrative = z.infer<typeof BattleNarrativeSchema>;
export type ItemDescription = z.infer<typeof ItemDescriptionSchema>;
export type SkillDescription = z.infer<typeof SkillDescriptionSchema>;
export type EventDescription = z.infer<typeof EventDescriptionSchema>;
export type CharacterDescription = z.infer<typeof CharacterDescriptionSchema>;
export type LocationDescription = z.infer<typeof LocationDescriptionSchema>;
export type QuestDescription = z.infer<typeof QuestDescriptionSchema>;
export type NarrativeText = z.infer<typeof NarrativeTextSchema>;
export type CultivationInsight = z.infer<typeof CultivationInsightSchema>;
export type ShopItems = z.infer<typeof ShopItemsSchema>;
export type BattleResult = z.infer<typeof BattleResultSchema>;
export type AIChoice = z.infer<typeof AIChoiceSchema>;
export type MultipleChoices = z.infer<typeof MultipleChoicesSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type DialogueList = z.infer<typeof DialogueListSchema>;
export type StatusUpdate = z.infer<typeof StatusUpdateSchema>;