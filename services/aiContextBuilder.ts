/**
 * AI上下文构建器（核心服务）
 * 实现方案一：generate() + injects
 * 
 * 职责：
 * 1. 整合向量记忆、游戏状态、世界书信息
 * 2. 构建符合SillyTavern标准的注入提示词
 * 3. 管理注入优先级和深度
 */

import { GameState, SemanticSearchResult } from '../types';
import {
    AIGenerationConfig,
    ContextBuildResult,
    DEFAULT_GAME_STATE_CONFIG,
    DEFAULT_GAME_STATE_FORMAT_OPTIONS,
    DEFAULT_VECTOR_FORMAT_OPTIONS,
    DEFAULT_VECTOR_MEMORY_CONFIG,
    DEFAULT_WORLDBOOK_CONFIG,
    GameStateFormatOptions,
    INJECT_PRIORITY,
    InjectionPrompt,
    VectorMemoryFormatOptions
} from './aiContextTypes';
import { contextMemoryRetriever } from './contextMemoryRetriever';

/**
 * AI上下文构建器
 */
export class AIContextBuilder {
  /**
   * 构建完整的AI生成上下文
   */
  async buildContext(
    gameState: GameState,
    config: AIGenerationConfig
  ): Promise<ContextBuildResult> {
    const startTime = Date.now();
    const injects: InjectionPrompt[] = [];
    
    let vectorMemoryCount = 0;
    let worldbookEntriesCount = 0;
    let gameStateInjected = false;

    // 1. 注入向量记忆（优先级最高）
    if (config.vectorMemory?.enabled !== false && gameState.vectorConfig.enabled) {
      const vectorConfig = { ...DEFAULT_VECTOR_MEMORY_CONFIG, ...config.vectorMemory };
      const vectorInject = await this.buildVectorMemoryInject(
        gameState,
        config.userInput,
        vectorConfig
      );
      
      if (vectorInject) {
        injects.push(vectorInject);
        vectorMemoryCount = vectorInject.metadata?.memoryCount || 0;
      }
    }

    // 2. 注入游戏状态上下文（次优先级）
    if (config.gameStateContext?.enabled !== false) {
      const stateConfig = { ...DEFAULT_GAME_STATE_CONFIG, ...config.gameStateContext };
      const stateInject = this.buildGameStateInject(gameState, stateConfig);
      
      if (stateInject) {
        injects.push(stateInject);
        gameStateInjected = true;
      }
    }

    // 3. 世界书处理（依赖自动激活机制，通常不需要手动注入）
    if (config.worldbook?.manualInject) {
      const wbConfig = { ...DEFAULT_WORLDBOOK_CONFIG, ...config.worldbook };
      const wbInject = await this.buildWorldbookInject(gameState, config.userInput, wbConfig);
      
      if (wbInject) {
        injects.push(wbInject);
        worldbookEntriesCount = wbInject.metadata?.entryCount || 0;
      }
    }

    // 4. 构建增强的用户输入
    const enhancedUserInput = this.enhanceUserInput(config.userInput, gameState);

    const buildTime = Date.now() - startTime;

    return {
      injects,
      enhancedUserInput,
      metadata: {
        vectorMemoryCount,
        worldbookEntriesCount,
        gameStateInjected,
        buildTime,
      },
    };
  }

  /**
   * 构建向量记忆注入
   */
  private async buildVectorMemoryInject(
    gameState: GameState,
    query: string,
    config: typeof DEFAULT_VECTOR_MEMORY_CONFIG
  ): Promise<InjectionPrompt & { metadata?: { memoryCount: number } } | null> {
    try {
      // 检索相关记忆
      const retrievalResult = await contextMemoryRetriever.retrieveRelevantMemories(
        gameState,
        query,
        config.maxResults
      );

      if (retrievalResult.relevantMemories.length === 0) {
        console.log('[上下文构建] 未找到相关向量记忆');
        return null;
      }

      // 格式化记忆
      const formattedMemories = this.formatVectorMemories(
        retrievalResult.relevantMemories,
        DEFAULT_VECTOR_FORMAT_OPTIONS
      );

      console.log(`[上下文构建] 注入 ${retrievalResult.relevantMemories.length} 条向量记忆`);

      return {
        id: 'vector_memory_context',
        role: 'system',
        content: formattedMemories,
        position: 'in_chat',
        depth: config.depth,
        order: INJECT_PRIORITY.VECTOR_MEMORY,
        should_scan: config.shouldScan, // 关键：允许世界书扫描
        metadata: {
          memoryCount: retrievalResult.relevantMemories.length,
        },
      };
    } catch (error) {
      console.error('[上下文构建] 向量记忆检索失败:', error);
      return null;
    }
  }

  /**
   * 构建游戏状态注入
   */
  private buildGameStateInject(
    gameState: GameState,
    config: typeof DEFAULT_GAME_STATE_CONFIG
  ): InjectionPrompt | null {
    try {
      const stateContext = this.formatGameState(gameState, config, DEFAULT_GAME_STATE_FORMAT_OPTIONS);

      if (!stateContext) {
        return null;
      }

      console.log('[上下文构建] 注入游戏状态上下文');

      return {
        id: 'game_state_context',
        role: 'system',
        content: stateContext,
        position: 'in_chat',
        depth: config.depth,
        order: INJECT_PRIORITY.GAME_STATE,
        should_scan: true, // 允许世界书扫描游戏状态
      };
    } catch (error) {
      console.error('[上下文构建] 游戏状态构建失败:', error);
      return null;
    }
  }

  /**
   * 构建世界书手动注入（通常不需要，依赖自动激活）
   */
  private async buildWorldbookInject(
    gameState: GameState,
    query: string,
    config: typeof DEFAULT_WORLDBOOK_CONFIG
  ): Promise<InjectionPrompt & { metadata?: { entryCount: number } } | null> {
    if (typeof TavernHelper === 'undefined') {
      return null;
    }

    try {
      const worldbookNames = config.worldbookNames || TavernHelper.getWorldbookNames();
      if (worldbookNames.length === 0) {
        return null;
      }

      const relevantEntries: string[] = [];

      for (const name of worldbookNames) {
        try {
          const worldbook = await TavernHelper.getWorldbook(name);

          for (const entry of worldbook) {
            if (!entry.enabled) continue;

            // 常量条目
            if (config.includeConstant && entry.strategy.type === 'constant') {
              relevantEntries.push(`【${entry.name}】\n${entry.content}`);
            }

            // 可选条目（会被自动激活，通常不需要手动注入）
            if (config.includeSelective && entry.strategy.type === 'selective') {
              const keys = entry.strategy.keys || [];
              const queryLower = query.toLowerCase();

              for (const key of keys) {
                if (typeof key === 'string' && queryLower.includes(key.toLowerCase())) {
                  relevantEntries.push(`【${entry.name}】\n${entry.content}`);
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.warn(`[上下文构建] 无法读取世界书 ${name}:`, error);
        }
      }

      if (relevantEntries.length === 0) {
        return null;
      }

      console.log(`[上下文构建] 手动注入 ${relevantEntries.length} 条世界书条目`);

      return {
        id: 'worldbook_manual_inject',
        role: 'system',
        content: `=== 世界书信息 ===\n\n${relevantEntries.join('\n\n')}\n\n===================`,
        position: 'in_chat',
        depth: 1, // 比向量记忆稍远
        order: INJECT_PRIORITY.SYSTEM_PROMPT,
        should_scan: false, // 世界书内容不需要再被扫描
        metadata: {
          entryCount: relevantEntries.length,
        },
      };
    } catch (error) {
      console.error('[上下文构建] 世界书构建失败:', error);
      return null;
    }
  }

  /**
   * 格式化向量记忆
   */
  private formatVectorMemories(
    results: SemanticSearchResult[],
    options: VectorMemoryFormatOptions
  ): string {
    if (results.length === 0) {
      return '';
    }

    const lines: string[] = [];

    if (options.style === 'detailed') {
      lines.push('=== 相关历史记忆 ===');
      lines.push('');

      for (const result of results) {
        const memory = result.memory;
        lines.push(`【记忆 #${result.rank}】`);

        if (options.showTimestamp && memory.metadata.timestamp) {
          lines.push(`时间：${memory.metadata.timestamp}`);
        }

        if (options.showLocation && memory.metadata.location) {
          lines.push(`地点：${memory.metadata.location}`);
        }

        if (options.showCharacters && memory.metadata.involvedCharacters?.length) {
          lines.push(`角色：${memory.metadata.involvedCharacters.join('、')}`);
        }

        if (options.showSimilarity) {
          lines.push(`相关度：${(result.similarity * 100).toFixed(1)}%`);
        }

        lines.push('');

        let text = memory.text;
        if (options.maxTextLength && text.length > options.maxTextLength) {
          text = text.substring(0, options.maxTextLength) + '...';
        }
        lines.push(text);
        lines.push('');
      }

      lines.push('===================');
    } else if (options.style === 'compact') {
      lines.push('=== 相关记忆 ===');
      for (const result of results) {
        let text = result.memory.text;
        if (options.maxTextLength && text.length > options.maxTextLength) {
          text = text.substring(0, options.maxTextLength) + '...';
        }
        const similarity = options.showSimilarity
          ? ` [${(result.similarity * 100).toFixed(0)}%]`
          : '';
        lines.push(`• ${text}${similarity}`);
      }
      lines.push('===============');
    } else if (options.style === 'list') {
      for (const result of results) {
        let text = result.memory.text;
        if (options.maxTextLength && text.length > options.maxTextLength) {
          text = text.substring(0, options.maxTextLength) + '...';
        }
        lines.push(text);
      }
    }

    return lines.join('\n');
  }

  /**
   * 格式化游戏状态
   */
  private formatGameState(
    gameState: GameState,
    config: typeof DEFAULT_GAME_STATE_CONFIG,
    options: GameStateFormatOptions
  ): string {
    const lines: string[] = [];

    if (options.style === 'full' || options.style === 'compact') {
      lines.push('=== 当前游戏状态 ===');
      lines.push('');
    }

    if (config.include.playerInfo) {
      lines.push(`【玩家】${gameState.playerProfile.name}`);
      if (gameState.playerProfile.title) {
        lines.push(`称号：${gameState.playerProfile.title}`);
      }
      if (options.includeStats) {
        lines.push(`灵石：${gameState.playerProfile.spiritStones}`);
      }
      lines.push('');
    }

    if (config.include.location) {
      lines.push(`【位置】${gameState.exploration.location}`);
      lines.push(`【时间】${gameState.exploration.time}`);
      lines.push('');
    }

    if (config.include.party) {
      const allParty = [
        ...gameState.playerProfile.maleParty,
        ...gameState.playerProfile.femaleParty,
      ];

      if (allParty.length > 0) {
        lines.push('【当前队伍】');
        for (const card of allParty) {
          if (options.style === 'full') {
            lines.push(`  • ${card.name} (${card.realm}) - 生命:${card.baseAttributes.hp}/${card.baseAttributes.maxHp}`);
          } else {
            lines.push(`  • ${card.name} (${card.realm})`);
          }
        }
        lines.push('');
      }
    }

    if (config.include.battleStatus && gameState.mode === 'battle' && gameState.battle) {
      lines.push('【战斗状态】');
      lines.push(`己方：${gameState.battle.playerParty.map(p => p.card.name).join('、')}`);
      lines.push(`敌方：${gameState.battle.opponentParty.map(p => p.card.name).join('、')}`);
      lines.push(`回合：${gameState.battle.turn === 'player' ? '玩家回合' : '对手回合'}`);
      lines.push('');
    }

    if (config.include.reputation && options.style === 'full') {
      const rep = gameState.playerProfile.reputation;
      lines.push(`【声望】${rep.level} (${rep.score})`);
      if (rep.title) {
        lines.push(`当前称号：${rep.title}`);
      }
      lines.push('');
    }

    if (options.style === 'full' || options.style === 'compact') {
      lines.push('===================');
    }

    return lines.join('\n');
  }

  /**
   * 增强用户输入
   */
  private enhanceUserInput(userInput: string, gameState: GameState): string {
    // 根据游戏模式添加上下文提示
    const hints: string[] = [];

    if (gameState.mode === 'battle') {
      hints.push('请基于当前战斗情况生成内容');
    } else {
      hints.push('请基于当前探索情况生成内容');
    }

    // 添加记忆一致性提示
    if (gameState.vectorConfig.enabled) {
      hints.push('请确保内容与上述历史记忆保持一致');
    }

    if (hints.length === 0) {
      return userInput;
    }

    return `${userInput}\n\n（${hints.join('，')}）`;
  }

  /**
   * 验证注入提示词
   */
  validateInjects(injects: InjectionPrompt[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const inject of injects) {
      if (!inject.id) {
        errors.push('注入提示词缺少ID');
      }

      if (!inject.content) {
        errors.push(`注入提示词 ${inject.id} 内容为空`);
      }

      if (!['system', 'user', 'assistant'].includes(inject.role)) {
        errors.push(`注入提示词 ${inject.id} 角色无效: ${inject.role}`);
      }

      if (inject.position === 'in_chat' && inject.depth === undefined) {
        errors.push(`注入提示词 ${inject.id} 使用in_chat位置但未指定深度`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 导出单例实例
 */
export const aiContextBuilder = new AIContextBuilder();