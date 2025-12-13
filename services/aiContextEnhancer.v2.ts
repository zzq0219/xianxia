/**
 * AI上下文增强服务 V2（完全重构版）
 * 基于方案一：generate() + injects
 * 
 * 这是对原有aiContextEnhancer的完全重构版本
 * 使用新的aiContextBuilder和aiGenerationService
 */

import { GameState, MemoryCategory } from '../types';
import {
    AIGenerationConfig,
    DEFAULT_GAME_STATE_CONFIG,
    DEFAULT_PRESET_CONFIG,
    DEFAULT_VECTOR_MEMORY_CONFIG,
    DEFAULT_WORLDBOOK_CONFIG,
} from './aiContextTypes';
import { aiGenerationService } from './aiGenerationService';

/**
 * AI上下文增强服务 V2
 */
export class AIContextEnhancerV2 {
  /**
   * 使用增强上下文生成AI内容
   * 
   * @param gameState 游戏状态
   * @param userInput 用户输入
   * @param options 选项
   * @returns AI生成的内容
   */
  async generateWithEnhancedContext(
    gameState: GameState,
    userInput: string,
    options: {
      includeVectorMemories?: boolean;
      includePreset?: boolean;
      includeWorldbook?: boolean;
      includeGameState?: boolean;
      maxVectorResults?: number;
      categories?: MemoryCategory[];
      shouldStream?: boolean;
      customApi?: {
        apiurl: string;
        key: string;
        model: string;
      };
    } = {}
  ): Promise<string> {
    console.log('[AI增强V2] 开始生成，选项:', options);

    // 构建配置
    const config: AIGenerationConfig = {
      userInput,
      shouldStream: options.shouldStream,
      
      // 向量记忆配置
      vectorMemory: options.includeVectorMemories !== false
        ? {
            ...DEFAULT_VECTOR_MEMORY_CONFIG,
            maxResults: options.maxVectorResults || DEFAULT_VECTOR_MEMORY_CONFIG.maxResults,
            categories: options.categories,
          }
        : { ...DEFAULT_VECTOR_MEMORY_CONFIG, enabled: false },
      
      // 世界书配置（依赖自动激活）
      worldbook: options.includeWorldbook !== false
        ? DEFAULT_WORLDBOOK_CONFIG
        : { ...DEFAULT_WORLDBOOK_CONFIG, manualInject: false },
      
      // 预设配置
      preset: options.includePreset !== false
        ? DEFAULT_PRESET_CONFIG
        : { ...DEFAULT_PRESET_CONFIG, useCurrentPreset: false },
      
      // 游戏状态配置
      gameStateContext: options.includeGameState !== false
        ? DEFAULT_GAME_STATE_CONFIG
        : { ...DEFAULT_GAME_STATE_CONFIG, enabled: false },
      
      // 自定义API
      customApi: options.customApi,
    };

    // 调用生成服务
    return await aiGenerationService.generate(gameState, config);
  }

  /**
   * 使用自定义API生成内容
   */
  async generateWithCustomAPI(
    gameState: GameState,
    userInput: string,
    customAPI: {
      apiurl: string;
      key: string;
      model: string;
    },
    options: {
      includeVectorMemories?: boolean;
      maxVectorResults?: number;
      shouldStream?: boolean;
    } = {}
  ): Promise<string> {
    return this.generateWithEnhancedContext(gameState, userInput, {
      ...options,
      customApi: customAPI,
      includePreset: false, // 使用自定义API时不使用预设
      includeWorldbook: false, // 使用自定义API时不使用世界书
    });
  }

  /**
   * 快速生成（使用默认配置）
   */
  async quickGenerate(
    gameState: GameState,
    userInput: string,
    shouldStream: boolean = false
  ): Promise<string> {
    return aiGenerationService.quickGenerate(gameState, userInput, {
      enableVectorMemory: true,
      enableGameState: true,
      shouldStream,
    });
  }

  /**
   * 仅使用向量记忆生成（不包含游戏状态）
   */
  async generateWithVectorOnly(
    gameState: GameState,
    userInput: string,
    maxResults: number = 5
  ): Promise<string> {
    return this.generateWithEnhancedContext(gameState, userInput, {
      includeVectorMemories: true,
      includeGameState: false,
      maxVectorResults: maxResults,
    });
  }

  /**
   * 按分类生成（限制向量记忆的分类）
   */
  async generateByCategory(
    gameState: GameState,
    userInput: string,
    categories: MemoryCategory[],
    maxResults: number = 5
  ): Promise<string> {
    return this.generateWithEnhancedContext(gameState, userInput, {
      includeVectorMemories: true,
      categories,
      maxVectorResults: maxResults,
    });
  }

  /**
   * 检查服务是否可用
   */
  isAvailable(): boolean {
    return aiGenerationService.isAvailable();
  }

  /**
   * 获取当前预设信息
   */
  getCurrentPreset(): any {
    return aiGenerationService.getCurrentPresetInfo();
  }

  /**
   * 监听生成事件
   */
  onGeneration(
    eventType: 'started' | 'streaming' | 'completed',
    callback: (data: any) => void
  ): () => void {
    return aiGenerationService.onGenerationEvent(eventType, callback);
  }
}

/**
 * 导出单例实例
 */
export const aiContextEnhancerV2 = new AIContextEnhancerV2();

/**
 * 向后兼容的导出（使用V2实现）
 */
export const aiContextEnhancer = aiContextEnhancerV2;