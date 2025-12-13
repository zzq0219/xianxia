/**
 * AI生成服务（统一接口）
 * 实现方案一：generate() + injects
 * 
 * 职责：
 * 1. 提供统一的AI生成接口
 * 2. 整合上下文构建器
 * 3. 调用SillyTavern的generate()函数
 * 4. 处理流式传输和错误
 */

import { GameState } from '../types';
import { aiContextBuilder } from './aiContextBuilder';
import {
    AIGenerationConfig,
    AIGenerationEvent,
    DEFAULT_GAME_STATE_CONFIG,
    DEFAULT_PRESET_CONFIG,
    DEFAULT_VECTOR_MEMORY_CONFIG,
    DEFAULT_WORLDBOOK_CONFIG,
} from './aiContextTypes';

/**
 * AI生成服务
 */
export class AIGenerationService {
  /**
   * 使用增强上下文生成AI内容
   * 
   * @param gameState 游戏状态
   * @param config 生成配置
   * @returns AI生成的文本
   */
  async generate(gameState: GameState, config: AIGenerationConfig): Promise<string> {
    // 检查TavernHelper是否可用
    if (typeof TavernHelper === 'undefined') {
      throw new Error('TavernHelper未定义，无法使用AI生成功能');
    }

    console.log('[AI生成] 开始生成，用户输入:', config.userInput);

    try {
      // 1. 构建上下文
      const contextResult = await aiContextBuilder.buildContext(gameState, config);

      console.log('[AI生成] 上下文构建完成:', {
        注入数量: contextResult.injects.length,
        向量记忆: contextResult.metadata.vectorMemoryCount,
        世界书条目: contextResult.metadata.worldbookEntriesCount,
        游戏状态: contextResult.metadata.gameStateInjected ? '是' : '否',
        构建耗时: `${contextResult.metadata.buildTime}ms`,
      });

      // 2. 验证注入
      const validation = aiContextBuilder.validateInjects(contextResult.injects);
      if (!validation.valid) {
        console.error('[AI生成] 注入验证失败:', validation.errors);
        throw new Error(`注入验证失败: ${validation.errors.join(', ')}`);
      }

      // 3. 准备generate配置
      const generateConfig: any = {
        user_input: contextResult.enhancedUserInput,
        should_stream: config.shouldStream || false,
        max_chat_history: config.maxChatHistory || 'all',
      };

      // 4. 添加注入
      if (contextResult.injects.length > 0) {
        generateConfig.injects = contextResult.injects.map(inject => ({
          id: inject.id,
          role: inject.role,
          content: inject.content,
          position: inject.position,
          depth: inject.depth,
          order: inject.order,
          should_scan: inject.should_scan,
        }));
      }

      // 5. 添加自定义API（如果有）
      if (config.customApi) {
        generateConfig.custom_api = config.customApi;
      }

      // 6. 添加生成ID（如果有）
      if (config.generationId) {
        generateConfig.generation_id = config.generationId;
      }

      console.log('[AI生成] 调用TavernHelper.generate...');

      // 7. 调用生成
      const result = await TavernHelper.generate(generateConfig);

      console.log('[AI生成] 生成完成，长度:', result.length);

      return result;
    } catch (error) {
      console.error('[AI生成] 生成失败:', error);
      throw error;
    }
  }

  /**
   * 快速生成（使用默认配置）
   */
  async quickGenerate(
    gameState: GameState,
    userInput: string,
    options: {
      enableVectorMemory?: boolean;
      enableGameState?: boolean;
      shouldStream?: boolean;
    } = {}
  ): Promise<string> {
    const config: AIGenerationConfig = {
      userInput,
      shouldStream: options.shouldStream,
      vectorMemory: options.enableVectorMemory !== false
        ? DEFAULT_VECTOR_MEMORY_CONFIG
        : { ...DEFAULT_VECTOR_MEMORY_CONFIG, enabled: false },
      gameStateContext: options.enableGameState !== false
        ? DEFAULT_GAME_STATE_CONFIG
        : { ...DEFAULT_GAME_STATE_CONFIG, enabled: false },
      worldbook: DEFAULT_WORLDBOOK_CONFIG,
      preset: DEFAULT_PRESET_CONFIG,
    };

    return this.generate(gameState, config);
  }

  /**
   * 仅使用预设生成（不添加额外上下文）
   */
  async generateWithPresetOnly(
    userInput: string,
    options: {
      shouldStream?: boolean;
      maxChatHistory?: 'all' | number;
      customApi?: AIGenerationConfig['customApi'];
    } = {}
  ): Promise<string> {
    if (typeof TavernHelper === 'undefined') {
      throw new Error('TavernHelper未定义');
    }

    console.log('[AI生成] 仅使用预设生成');

    const config: any = {
      user_input: userInput,
      should_stream: options.shouldStream || false,
      max_chat_history: options.maxChatHistory || 'all',
    };

    if (options.customApi) {
      config.custom_api = options.customApi;
    }

    return await TavernHelper.generate(config);
  }

  /**
   * 批量生成（用于多个提示词）
   */
  async batchGenerate(
    gameState: GameState,
    prompts: string[],
    baseConfig: Partial<AIGenerationConfig> = {}
  ): Promise<string[]> {
    const results: string[] = [];

    for (const prompt of prompts) {
      try {
        const config: AIGenerationConfig = {
          ...baseConfig,
          userInput: prompt,
        };

        const result = await this.generate(gameState, config);
        results.push(result);
      } catch (error) {
        console.error(`[AI生成] 批量生成失败，提示词: ${prompt}`, error);
        results.push(''); // 失败时添加空字符串
      }
    }

    return results;
  }

  /**
   * 停止特定生成
   */
  async stopGeneration(generationId: string): Promise<boolean> {
    if (typeof TavernHelper === 'undefined' || typeof stopGenerationById === 'undefined') {
      console.warn('[AI生成] 停止生成功能不可用');
      return false;
    }

    try {
      return await stopGenerationById(generationId);
    } catch (error) {
      console.error('[AI生成] 停止生成失败:', error);
      return false;
    }
  }

  /**
   * 停止所有生成
   */
  async stopAllGenerations(): Promise<boolean> {
    if (typeof TavernHelper === 'undefined' || typeof stopAllGeneration === 'undefined') {
      console.warn('[AI生成] 停止所有生成功能不可用');
      return false;
    }

    try {
      return await stopAllGeneration();
    } catch (error) {
      console.error('[AI生成] 停止所有生成失败:', error);
      return false;
    }
  }

  /**
   * 监听生成事件
   */
  onGenerationEvent(
    eventType: AIGenerationEvent['type'],
    callback: (event: AIGenerationEvent) => void
  ): () => void {
    if (typeof eventOn === 'undefined' || typeof iframe_events === 'undefined') {
      console.warn('[AI生成] 事件系统不可用');
      return () => {};
    }

    let eventName: string;

    switch (eventType) {
      case 'started':
        eventName = iframe_events.GENERATION_STARTED;
        break;
      case 'streaming':
        eventName = iframe_events.STREAM_TOKEN_RECEIVED_FULLY;
        break;
      case 'completed':
        eventName = iframe_events.GENERATION_ENDED;
        break;
      default:
        console.warn(`[AI生成] 未知事件类型: ${eventType}`);
        return () => {};
    }

    const wrappedCallback = (data: any) => {
      callback({
        type: eventType,
        generationId: data.generation_id || '',
        text: data.text || data,
        metadata: data,
      });
    };

    eventOn(eventName, wrappedCallback);

    // 返回取消监听函数（注意：SillyTavern可能不提供eventOff）
    return () => {
      console.log('[AI生成] 事件监听器移除（如果支持）');
      // SillyTavern的事件系统可能不提供移除功能
      // 可以在这里添加自定义的清理逻辑
    };
  }

  /**
   * 检查AI生成服务是否可用
   */
  isAvailable(): boolean {
    return typeof TavernHelper !== 'undefined' && typeof TavernHelper.generate === 'function';
  }

  /**
   * 获取当前预设信息
   */
  getCurrentPresetInfo(): any {
    if (typeof TavernHelper === 'undefined') {
      return null;
    }

    try {
      return TavernHelper.getPreset('in_use');
    } catch (error) {
      console.error('[AI生成] 获取预设失败:', error);
      return null;
    }
  }

  /**
   * 切换预设
   */
  async switchPreset(presetName: string): Promise<boolean> {
    if (typeof TavernHelper === 'undefined') {
      return false;
    }

    try {
      return TavernHelper.loadPreset(presetName);
    } catch (error) {
      console.error('[AI生成] 切换预设失败:', error);
      return false;
    }
  }

  /**
   * 获取所有可用预设
   */
  getAvailablePresets(): string[] {
    if (typeof TavernHelper === 'undefined') {
      return [];
    }

    try {
      return TavernHelper.getPresetNames();
    } catch (error) {
      console.error('[AI生成] 获取预设列表失败:', error);
      return [];
    }
  }
}

/**
 * 导出单例实例
 */
export const aiGenerationService = new AIGenerationService();

/**
 * 便捷函数：快速生成
 */
export async function generateAI(
  gameState: GameState,
  userInput: string,
  options?: {
    enableVectorMemory?: boolean;
    enableGameState?: boolean;
    shouldStream?: boolean;
  }
): Promise<string> {
  return aiGenerationService.quickGenerate(gameState, userInput, options);
}

/**
 * 便捷函数：仅使用预设生成
 */
export async function generateWithPresetOnly(
  userInput: string,
  options?: {
    shouldStream?: boolean;
    maxChatHistory?: 'all' | number;
  }
): Promise<string> {
  return aiGenerationService.generateWithPresetOnly(userInput, options);
}