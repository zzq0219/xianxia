import { GameState } from '../types';
import { aiContextEnhancer } from './aiContextEnhancer';
import { contextMemoryRetriever } from './contextMemoryRetriever';

/**
 * AI集成工具函数
 * 简化向量记忆与AI生成的集成
 */

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
        shouldStream?: boolean;
    } = {}
): Promise<string> {
    // 检查TavernHelper是否可用
    if (typeof TavernHelper === 'undefined') {
        console.warn('TavernHelper未定义，无法生成AI内容');
        throw new Error('AI生成服务不可用');
    }

    // 如果向量化功能未启用，使用标准生成
    if (!gameState.vectorConfig.enabled) {
        console.log('向量化功能未启用，使用标准AI生成');
        return await TavernHelper.generate({
            user_input: userInput,
            should_stream: options.shouldStream || false
        });
    }

    try {
        // 使用增强上下文生成
        console.log(`[AI集成] 开始增强${interactionType}互动的AI上下文`);
        
        const result = await aiContextEnhancer.generateWithEnhancedContext(
            gameState,
            userInput,
            {
                includeVectorMemories: true,
                includePreset: options.includePreset !== false, // 默认包含预设
                includeWorldbook: options.includeWorldbook !== false, // 默认包含世界书
                maxVectorResults: options.maxVectorResults || 5,
                shouldStream: options.shouldStream || false
            }
        );

        console.log(`[AI集成] ${interactionType}互动AI生成完成`);
        return result;

    } catch (error) {
        console.error('[AI集成] 增强生成失败，回退到标准生成:', error);
        
        // 降级处理：回退到标准AI生成
        return await TavernHelper.generate({
            user_input: userInput,
            should_stream: options.shouldStream || false
        });
    }
}

/**
 * 仅检索相关向量记忆，不生成内容
 * 用于需要手动处理记忆的场景
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
        console.log('向量化功能未启用，跳过记忆检索');
        return {
            query: query || '',
            context: '',
            relevantMemories: [],
            totalSearched: 0,
            searchTime: 0
        };
    }

    try {
        console.log('[记忆检索] 开始检索相关记忆:', query);
        
        const result = await contextMemoryRetriever.retrieveRelevantMemories(
            gameState,
            query,
            maxResults
        );

        console.log(`[记忆检索] 找到 ${result.relevantMemories.length} 条相关记忆`);
        return result;

    } catch (error) {
        console.error('[记忆检索] 检索失败:', error);
        return {
            query: query || '',
            context: '',
            relevantMemories: [],
            totalSearched: 0,
            searchTime: 0
        };
    }
}

/**
 * 格式化记忆为可读文本
 * 
 * @param memories 记忆检索结果
 * @returns 格式化的文本
 */
export function formatMemoriesAsText(memories: any[]): string {
    if (memories.length === 0) {
        return '';
    }

    return contextMemoryRetriever.formatMemoriesForPrompt(memories);
}

/**
 * 为角色卡牌检索相关历史
 * 用于商城抽卡等场景
 * 
 * @param gameState 游戏状态
 * @param characterName 角色名称
 * @param maxResults 最大结果数
 * @returns 相关记忆
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
        console.error('[角色历史] 检索失败:', error);
        return [];
    }
}

/**
 * 检查是否应该使用向量增强
 * 
 * @param gameState 游戏状态
 * @returns 是否应该使用
 */
export function shouldUseVectorEnhancement(gameState: GameState): boolean {
    return gameState.vectorConfig.enabled && 
           gameState.vectorConfig.apiKey !== '' &&
           typeof TavernHelper !== 'undefined';
}

/**
 * 获取向量化状态摘要
 *
 * @param gameState 游戏状态
 * @returns 状态摘要
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