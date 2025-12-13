import { GameState } from '../types';
import { aiContextEnhancer } from './aiContextEnhancer';

/**
 * 增强的AI生成器
 * 自动整合酒馆预设、世界书和向量化历史记忆
 */

export interface EnhancedGenerateOptions {
  /** 系统提示词 */
  systemInstruction: string;
  /** 用户提示词 */
  prompt: string;
  /** 游戏状态（用于向量检索） */
  gameState?: GameState;
  /** 是否包含向量记忆 */
  includeVectorMemories?: boolean;
  /** 是否包含酒馆预设 */
  includePreset?: boolean;
  /** 是否包含世界书 */
  includeWorldbook?: boolean;
  /** 最大向量结果数 */
  maxVectorResults?: number;
  /** 是否流式输出 */
  shouldStream?: boolean;
}

/**
 * 使用增强上下文生成AI内容
 * 自动整合：破限预设 + 世界书 + 向量化历史记忆
 */
export async function enhancedGenerate(
  options: EnhancedGenerateOptions
): Promise<string> {
  const {
    systemInstruction,
    prompt,
    gameState,
    includeVectorMemories = true,
    includePreset = true,
    includeWorldbook = true,
    maxVectorResults = 5,
    shouldStream = false
  } = options;

  // 检查TavernHelper是否可用
  if (typeof window.TavernHelper === 'undefined') {
    console.warn('TavernHelper未定义，使用降级模式');
    throw new Error('AI生成服务不可用');
  }

  // 如果没有gameState，使用标准生成
  if (!gameState) {
    console.log('[增强生成] 未提供游戏状态，使用标准模式');
    return await window.TavernHelper.generateRaw({
      ordered_prompts: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ]
    });
  }

  try {
    console.log('[增强生成] ========================================');
    console.log('[增强生成] 🚀 开始增强AI生成流程');
    console.log('[增强生成] ========================================');
    
    // 构建增强上下文
    const context = await aiContextEnhancer.buildEnhancedContext(
      gameState,
      prompt,
      {
        includeVectorMemories,
        includePreset,
        includeWorldbook,
        maxVectorResults
      }
    );

    console.log('[增强生成] ========================================');
    console.log('[增强生成] 📝 准备构建最终提示词序列');
    console.log('[增强生成] ========================================');

    // 构建完整的提示词列表
    const orderedPrompts: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // 1. 添加原始系统提示词
    console.log('[增强生成] 1️⃣ 添加原始系统提示词');
    console.log('[增强生成]    长度:', systemInstruction.length, '字符');
    orderedPrompts.push({
      role: 'system',
      content: systemInstruction
    });

    // 2. 添加酒馆预设（如果有）
    if (context.systemPrompt) {
      console.log('[增强生成] 2️⃣ 添加SillyTavern预设');
      console.log('[增强生成]    长度:', context.systemPrompt.length, '字符');
      orderedPrompts.push({
        role: 'system',
        content: context.systemPrompt
      });
    } else {
      console.log('[增强生成] 2️⃣ ⏭️ 跳过SillyTavern预设（未配置）');
    }

    // 3. 添加所有注入的提示词（世界书、向量记忆、游戏状态等）
    console.log('[增强生成] 3️⃣ 添加注入的上下文提示词');
    console.log('[增强生成]    数量:', context.injectedPrompts.length);
    context.injectedPrompts.forEach((prompt, index) => {
      const type = prompt.content.includes('历史记忆') ? '📦 向量记忆' :
                   prompt.content.includes('世界书') ? '📚 世界书条目' :
                   prompt.content.includes('游戏状态') ? '🎮 游戏状态' : '❓ 其他上下文';
      const contentLength = prompt.content.length;
      console.log(`[增强生成]    ${index + 1}/${context.injectedPrompts.length} ${type} (${contentLength}字符)`);
    });
    orderedPrompts.push(...context.injectedPrompts);

    // 4. 最后添加用户提示词
    console.log('[增强生成] 4️⃣ 添加用户提示词');
    console.log('[增强生成]    长度:', context.userPrompt.length, '字符');
    orderedPrompts.push({
      role: 'user',
      content: context.userPrompt
    });

    // 使用TavernHelper.generateRaw生成
    console.log('[增强生成] ========================================');
    console.log('[增强生成] 🎯 最终提示词统计:');
    console.log('[增强生成]    总数:', orderedPrompts.length, '条');
    const totalChars = orderedPrompts.reduce((sum, p) => sum + p.content.length, 0);
    console.log('[增强生成]    总长度:', totalChars, '字符');
    console.log('[增强生成] ========================================');
    console.log('[增强生成] 🔄 调用TavernHelper.generateRaw进行AI生成...');
    
    const result = await window.TavernHelper.generateRaw({
      ordered_prompts: orderedPrompts
    });

    console.log('[增强生成] ========================================');
    console.log('[增强生成] ✅ AI生成完成');
    console.log('[增强生成]    生成内容长度:', result.length, '字符');
    console.log('[增强生成] ========================================');
    return result;

  } catch (error) {
    console.error('[增强生成] ========================================');
    console.error('[增强生成] ❌ 增强生成失败，回退到标准生成');
    console.error('[增强生成] 错误信息:', error);
    console.error('[增强生成] ========================================');
    
    // 降级处理：回退到标准生成
    console.log('[增强生成] 🔄 使用标准模式生成...');
    const result = await window.TavernHelper.generateRaw({
      ordered_prompts: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ]
    });
    console.log('[增强生成] ✅ 标准模式生成完成');
    return result;
  }
}

/**
 * 简化版本：仅用于没有gameState的场景
 */
export async function simpleGenerate(
  systemInstruction: string,
  prompt: string
): Promise<string> {
  if (typeof window.TavernHelper === 'undefined') {
    throw new Error('AI生成服务不可用');
  }

  return await window.TavernHelper.generateRaw({
    ordered_prompts: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ]
  });
}

/**
 * 快速包装器：用于最常见的场景
 */
export async function generateWithContext(
  systemInstruction: string,
  prompt: string,
  gameState: GameState
): Promise<string> {
  return enhancedGenerate({
    systemInstruction,
    prompt,
    gameState,
    includeVectorMemories: true,
    includePreset: true,
    includeWorldbook: true,
    maxVectorResults: 5
  });
}