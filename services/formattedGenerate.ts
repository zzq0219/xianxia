import { z } from 'zod';
import { createFormatProcessor } from './aiFormatProcessor';
import * as Schemas from './aiFormatSchemas';

/**
 * 格式化的 generate 函数配置
 */
interface FormattedGenerateConfig<T> {
  /** 用户输入 */
  userInput: string;
  /** Zod Schema */
  schema: z.ZodSchema<T>;
  /** 默认值 */
  defaultValues?: Partial<T>;
  /** 自定义格式指令 */
  formatInstruction?: string;
  /** 最大重试次数 */
  maxRetries?: number;
  /** 是否启用流式传输 */
  shouldStream?: boolean;
  /** 覆盖选项 */
  overrides?: any;
  /** 额外注入的提示词 */
  injects?: any[];
  /** 最多使用多少条聊天历史 */
  maxChatHistory?: 'all' | number;
  /** 自定义API配置 */
  customApi?: any;
}

/**
 * 格式化的 generate 函数 - 确保 AI 响应符合指定格式
 */
export async function formattedGenerate<T>(config: FormattedGenerateConfig<T>): Promise<T> {
  const {
    userInput,
    schema,
    defaultValues = {},
    formatInstruction,
    maxRetries = 3,
    shouldStream = false,
    overrides,
    injects,
    maxChatHistory,
    customApi,
  } = config;

  // 创建格式处理器
  const processor = createFormatProcessor(schema, defaultValues, formatInstruction);

  // 带重试的处理
  return await processor.processWithRetry(async (attempt) => {
    // 构建完整的 prompt
    let fullPrompt = userInput;
    
    // 第一次尝试时添加格式指令
    if (attempt === 0) {
      fullPrompt += '\n\n' + processor.getFormatInstruction();
    } else {
      // 重试时强化指令
      fullPrompt += `\n\n[第 ${attempt} 次输出格式错误！请严格按照 JSON 格式输出，不要添加任何解释文字]\n\n` + processor.getFormatInstruction();
    }

    // 调用原始的 generate 函数
    // 注意：这里需要根据您的项目实际情况调整
    // 如果 generate 函数在全局可用，直接使用
    // 否则需要从相应的服务中导入
    if (typeof window !== 'undefined' && (window as any).TavernHelper?.generate) {
      return await (window as any).TavernHelper.generate({
        user_input: fullPrompt,
        should_stream: shouldStream,
        overrides,
        injects,
        max_chat_history: maxChatHistory,
        custom_api: customApi,
      });
    } else {
      throw new Error('generate 函数不可用');
    }
  }, maxRetries);
}

/**
 * 预定义的快捷函数
 */

/** 生成简单文本 */
export async function generateSimpleText(userInput: string): Promise<Schemas.SimpleText> {
  return formattedGenerate({
    userInput,
    schema: Schemas.SimpleTextSchema,
    defaultValues: { content: '' },
  });
}

/** 生成 NPC 对话 */
export async function generateNPCDialogue(
  userInput: string,
  defaultEmotion: string = '平静'
): Promise<Schemas.NPCDialogue> {
  return formattedGenerate({
    userInput,
    schema: Schemas.NPCDialogueSchema,
    defaultValues: {
      emotion: defaultEmotion as any,
      relationshipChange: 0,
    },
    formatInstruction: `
输出 JSON 格式: 
{
  "speaker": "说话人姓名",
  "dialogue": "对话内容",
  "emotion": "平静",
  "relationshipChange": 0
}
`.trim(),
  });
}

/** 生成战斗描述 */
export async function generateBattleNarrative(
  userInput: string
): Promise<Schemas.BattleNarrative> {
  return formattedGenerate({
    userInput,
    schema: Schemas.BattleNarrativeSchema,
    defaultValues: {
      damage: 0,
      effect: '无',
    },
    formatInstruction: `
输出 JSON 格式:
{
  "attacker": "攻击者",
  "action": "攻击动作描述",
  "target": "目标",
  "damage": 100,
  "effect": "特殊效果",
  "result": "结果描述"
}
`.trim(),
  });
}

/** 生成物品描述 */
export async function generateItemDescription(
  userInput: string
): Promise<Schemas.ItemDescription> {
  return formattedGenerate({
    userInput,
    schema: Schemas.ItemDescriptionSchema,
    defaultValues: {
      rarity: 'common',
      attributes: {},
    },
    formatInstruction: `
输出 JSON 格式:
{
  "name": "物品名称",
  "description": "物品描述",
  "rarity": "common",
  "type": "物品类型",
  "attributes": {"攻击力": 10}
}
`.trim(),
  });
}

/** 生成技能描述 */
export async function generateSkillDescription(
  userInput: string
): Promise<Schemas.SkillDescription> {
  return formattedGenerate({
    userInput,
    schema: Schemas.SkillDescriptionSchema,
    defaultValues: {
      damage: 0,
      cooldown: 0,
      manaCost: 0,
      effects: [],
    },
  });
}

/** 生成事件描述 */
export async function generateEventDescription(
  userInput: string
): Promise<Schemas.EventDescription> {
  return formattedGenerate({
    userInput,
    schema: Schemas.EventDescriptionSchema,
    defaultValues: {
      type: 'random',
      choices: [],
      rewards: {},
    },
  });
}

/** 生成角色描述 */
export async function generateCharacterDescription(
  userInput: string
): Promise<Schemas.CharacterDescription> {
  return formattedGenerate({
    userInput,
    schema: Schemas.CharacterDescriptionSchema,
    defaultValues: {},
  });
}

/** 生成地点描述 */
export async function generateLocationDescription(
  userInput: string
): Promise<Schemas.LocationDescription> {
  return formattedGenerate({
    userInput,
    schema: Schemas.LocationDescriptionSchema,
    defaultValues: {
      npcs: [],
      features: [],
    },
  });
}

/** 生成任务描述 */
export async function generateQuestDescription(
  userInput: string
): Promise<Schemas.QuestDescription> {
  return formattedGenerate({
    userInput,
    schema: Schemas.QuestDescriptionSchema,
    defaultValues: {
      objectives: [],
      rewards: {},
    },
  });
}

/** 生成叙事文本 */
export async function generateNarrativeText(
  userInput: string
): Promise<Schemas.NarrativeText> {
  return formattedGenerate({
    userInput,
    schema: Schemas.NarrativeTextSchema,
    defaultValues: {
      tags: [],
      timestamp: Date.now(),
    },
  });
}

/** 生成修炼感悟 */
export async function generateCultivationInsight(
  userInput: string
): Promise<Schemas.CultivationInsight> {
  return formattedGenerate({
    userInput,
    schema: Schemas.CultivationInsightSchema,
    defaultValues: {
      breakthroughChance: 0,
      spiritualGain: 0,
    },
  });
}

/** 生成商店物品列表 */
export async function generateShopItems(
  userInput: string
): Promise<Schemas.ShopItems> {
  return formattedGenerate({
    userInput,
    schema: Schemas.ShopItemsSchema,
    defaultValues: {
      items: [],
    },
  });
}

/** 生成战斗结果 */
export async function generateBattleResult(
  userInput: string
): Promise<Schemas.BattleResult> {
  return formattedGenerate({
    userInput,
    schema: Schemas.BattleResultSchema,
    defaultValues: {
      rewards: {},
      casualties: [],
    },
  });
}

/** 生成 AI 选择 */
export async function generateAIChoice(
  userInput: string
): Promise<Schemas.AIChoice> {
  return formattedGenerate({
    userInput,
    schema: Schemas.AIChoiceSchema,
    defaultValues: {},
  });
}

/** 生成多个选项 */
export async function generateMultipleChoices(
  userInput: string
): Promise<Schemas.MultipleChoices> {
  return formattedGenerate({
    userInput,
    schema: Schemas.MultipleChoicesSchema,
    defaultValues: {
      choices: [],
    },
  });
}

/** 生成分析结果 */
export async function generateAnalysisResult(
  userInput: string
): Promise<Schemas.AnalysisResult> {
  return formattedGenerate({
    userInput,
    schema: Schemas.AnalysisResultSchema,
    defaultValues: {
      score: 50,
      suggestions: [],
    },
  });
}

/** 生成对话列表 */
export async function generateDialogueList(
  userInput: string
): Promise<Schemas.DialogueList> {
  return formattedGenerate({
    userInput,
    schema: Schemas.DialogueListSchema,
    defaultValues: {
      dialogues: [],
    },
  });
}

/** 生成状态更新 */
export async function generateStatusUpdate(
  userInput: string
): Promise<Schemas.StatusUpdate> {
  return formattedGenerate({
    userInput,
    schema: Schemas.StatusUpdateSchema,
    defaultValues: {
      changes: {},
    },
  });
}

/**
 * 通用的格式化生成器 - 用于自定义 Schema
 */
export function createFormattedGenerator<T>(
  schema: z.ZodSchema<T>,
  defaultValues?: Partial<T>,
  formatInstruction?: string
) {
  return async (userInput: string, options?: Partial<FormattedGenerateConfig<T>>): Promise<T> => {
    return formattedGenerate({
      userInput,
      schema,
      defaultValues,
      formatInstruction,
      ...options,
    });
  };
}