/**
 * AI集成工具函数 V2（完全重构版）
 * 基于方案一：generate() + injects
 * 
 * 简化的工具函数，用于快速集成AI生成到游戏各个模块
 */

import { GameState, MemoryCategory } from '../types';
import { aiContextEnhancerV2 } from './aiContextEnhancer.v2';
import { aiGenerationService } from './aiGenerationService';
import { contextMemoryRetriever } from './contextMemoryRetriever';

/**
 * 游戏交互类型
 */
export type GameInteractionType = 
  | 'story'          // 剧情互动
  | 'battle'         // 战斗
  | 'shop'           // 商城
  | 'hospital'       // 医馆
  | 'bounty'         // 悬赏
  | 'cultivation'    // 培育
  | 'business'       // 商业
  | 'arena'          // 竞技场
  | 'other';         // 其他

/**
 * 交互类型到记忆分类的映射
 */
const INTERACTION_TO_CATEGORY_MAP: Record<GameInteractionType, MemoryCategory[]> = {
  story: ['探索', '其他'],
  battle: ['战斗'],
  shop: ['商城'],
  hospital: ['医馆'],
  bounty: ['悬赏'],
  cultivation: ['培育'],
  business: ['商业'],
  arena: ['战斗', '声望'],
  other: ['其他'],
};

/**
 * 为游戏交互自动增强AI上下文并生成内容
 * 
 * @param gameState 游戏状态
 * @param userInput 用户输入或提示词
 * @param interactionType 交互类型
 * @param options 可选配置
 * @returns AI生成的内容
 */
export async function enhanceGameInteraction(
  gameState: GameState,
  userInput: string,
  interactionType: GameInteractionType = 'other',
  options: {
    maxVectorResults?: number;
    includePreset?: boolean;
    includeWorldbook?: boolean;
    includeGameState?: boolean;
    shouldStream?: boolean;
  } = {}
): Promise<string> {
  console.log(`[AI集成V2] 增强${interactionType}互动`);

  // 检查服务可用性
  if (!aiGenerationService.isAvailable()) {
    throw new Error('AI生成服务不可用，请确保在SillyTavern环境中运行');
  }

  // 如果向量化未启用，使用标准生成
  if (!gameState.vectorConfig.enabled) {
    console.log('[AI集成V2] 向量化未启用，使用标准生成');
    return await aiGenerationService.generateWithPresetOnly(userInput, {
      shouldStream: options.shouldStream,
    });
  }

  try {
    // 根据交互类型选择相关的记忆分类
    const categories = INTERACTION_TO_CATEGORY_MAP[interactionType];

    // 使用增强上下文生成
    return await aiContextEnhancerV2.generateWithEnhancedContext(
      gameState,
      userInput,
      {
        includeVectorMemories: true,
        includePreset: options.includePreset !== false,
        includeWorldbook: options.includeWorldbook !== false,
        includeGameState: options.includeGameState !== false,
        maxVectorResults: options.maxVectorResults || 5,
        categories,
        shouldStream: options.shouldStream,
      }
    );
  } catch (error) {
    console.error('[AI集成V2] 增强生成失败，回退到标准生成:', error);
    
    // 降级处理
    return await aiGenerationService.generateWithPresetOnly(userInput, {
      shouldStream: options.shouldStream,
    });
  }
}

/**
 * 仅检索相关向量记忆，不生成内容
 * 
 * @param gameState 游戏状态
 * @param query 查询文本
 * @param maxResults 最大结果数
 * @returns 检索结果
 */
export async function retrieveRelevantMemories(
  gameState: GameState,
  query?: string,
  maxResults: number = 5
) {
  if (!gameState.vectorConfig.enabled) {
    console.log('[记忆检索V2] 向量化未启用');
    return {
      query: query || '',
      context: '',
      relevantMemories: [],
      totalSearched: 0,
      searchTime: 0,
    };
  }

  try {
    return await contextMemoryRetriever.retrieveRelevantMemories(
      gameState,
      query,
      maxResults
    );
  } catch (error) {
    console.error('[记忆检索V2] 检索失败:', error);
    return {
      query: query || '',
      context: '',
      relevantMemories: [],
      totalSearched: 0,
      searchTime: 0,
    };
  }
}

/**
 * 格式化记忆为可读文本
 */
export function formatMemoriesAsText(memories: any[]): string {
  if (memories.length === 0) {
    return '';
  }

  return contextMemoryRetriever.formatMemoriesForPrompt(memories);
}

/**
 * 为角色卡牌检索相关历史
 */
export async function retrieveCharacterHistory(
  gameState: GameState,
  characterName: string,
  maxResults: number = 3
) {
  if (!gameState.vectorConfig.enabled) {
    return [];
  }

  try {
    const result = await retrieveRelevantMemories(
      gameState,
      characterName,
      maxResults
    );
    return result.relevantMemories;
  } catch (error) {
    console.error('[角色历史V2] 检索失败:', error);
    return [];
  }
}

/**
 * 检查是否应该使用向量增强
 */
export function shouldUseVectorEnhancement(gameState: GameState): boolean {
  return (
    gameState.vectorConfig.enabled &&
    gameState.vectorConfig.apiKey !== '' &&
    aiGenerationService.isAvailable()
  );
}

/**
 * 获取向量化状态摘要
 */
export function getVectorStatusSummary(gameState: GameState): string {
  if (!gameState.vectorConfig.enabled) {
    return '向量化功能未启用';
  }

  if (!gameState.vectorConfig.apiKey) {
    return '向量化功能已启用，但未配置API密钥';
  }

  return `向量化功能已启用 (${gameState.vectorConfig.model})`;
}

/**
 * 快速生成 - 最简单的调用方式
 * 
 * @param gameState 游戏状态
 * @param userInput 用户输入
 * @returns AI生成的内容
 */
export async function quickGenerate(
  gameState: GameState,
  userInput: string
): Promise<string> {
  return aiContextEnhancerV2.quickGenerate(gameState, userInput);
}

/**
 * 流式生成
 */
export async function streamGenerate(
  gameState: GameState,
  userInput: string,
  onToken: (token: string) => void
): Promise<string> {
  // 监听流式传输事件
  const unsubscribe = aiGenerationService.onGenerationEvent('streaming', (event) => {
    if (event.text) {
      onToken(event.text);
    }
  });

  try {
    const result = await aiContextEnhancerV2.quickGenerate(gameState, userInput, true);
    return result;
  } finally {
    unsubscribe();
  }
}

/**
 * 按场景生成（自动选择最佳分类）
 */
export async function generateForScene(
  gameState: GameState,
  userInput: string,
  sceneType: 'exploration' | 'combat' | 'shop' | 'hospital' | 'other'
): Promise<string> {
  const typeMap: Record<string, GameInteractionType> = {
    exploration: 'story',
    combat: 'battle',
    shop: 'shop',
    hospital: 'hospital',
    other: 'other',
  };

  return enhanceGameInteraction(
    gameState,
    userInput,
    typeMap[sceneType] || 'other'
  );
}

/**
 * 战斗场景专用生成
 */
export async function generateForBattle(
  gameState: GameState,
  userInput: string
): Promise<string> {
  return enhanceGameInteraction(gameState, userInput, 'battle', {
    maxVectorResults: 3, // 战斗场景使用较少的历史记忆
    includeGameState: true, // 确保包含战斗状态
  });
}

/**
 * 剧情场景专用生成
 */
export async function generateForStory(
  gameState: GameState,
  userInput: string
): Promise<string> {
  return enhanceGameInteraction(gameState, userInput, 'story', {
    maxVectorResults: 7, // 剧情场景使用更多历史记忆
    includeGameState: true,
  });
}

/**
 * 医馆场景专用生成
 */
export async function generateForHospital(
  gameState: GameState,
  userInput: string
): Promise<string> {
  return enhanceGameInteraction(gameState, userInput, 'hospital', {
    maxVectorResults: 5,
    includeGameState: false, // 医馆可能不需要完整游戏状态
  });
}

/**
 * 获取AI服务状态
 */
export function getAIServiceStatus(): {
  available: boolean;
  preset: string | null;
  availablePresets: string[];
} {
  return {
    available: aiGenerationService.isAvailable(),
    preset: aiGenerationService.getCurrentPresetInfo()?.name || null,
    availablePresets: aiGenerationService.getAvailablePresets(),
  };
}

/**
 * 切换AI预设
 */
export async function switchAIPreset(presetName: string): Promise<boolean> {
  return aiGenerationService.switchPreset(presetName);
}

/**
 * 批量生成（用于多个提示词）
 */
export async function batchGenerate(
  gameState: GameState,
  prompts: string[],
  interactionType: GameInteractionType = 'other'
): Promise<string[]> {
  const results: string[] = [];

  for (const prompt of prompts) {
    try {
      const result = await enhanceGameInteraction(
        gameState,
        prompt,
        interactionType
      );
      results.push(result);
    } catch (error) {
      console.error(`[批量生成V2] 失败: ${prompt}`, error);
      results.push('');
    }
  }

  return results;
}