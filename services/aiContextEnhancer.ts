import { GameState, MemoryCategory } from '../types';
import { contextMemoryRetriever } from './contextMemoryRetriever';

/**
 * AI上下文增强服务
 * 整合向量记忆、SillyTavern预设、世界书等内容，增强AI生成质量
 */
export class AIContextEnhancer {
  /**
   * 为AI生成构建增强的上下文
   * @param gameState 游戏状态
   * @param userInput 用户输入
   * @param options 可选配置
   */
  async buildEnhancedContext(
    gameState: GameState,
    userInput: string,
    options: {
      includeVectorMemories?: boolean;
      includePreset?: boolean;
      includeWorldbook?: boolean;
      maxVectorResults?: number;
      categories?: MemoryCategory[];
    } = {}
  ): Promise<{
    systemPrompt: string;
    userPrompt: string;
    injectedPrompts: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  }> {
    const {
      includeVectorMemories = true,
      includePreset = true,
      includeWorldbook = true,
      maxVectorResults = 5,
      categories
    } = options;

    const injectedPrompts: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    let systemPrompt = '';
    
    console.log('[上下文增强] ========== 开始构建AI上下文 ==========');
    
    // 1. 获取SillyTavern预设信息
    if (includePreset && typeof TavernHelper !== 'undefined') {
      try {
        console.log('[上下文增强] 🎯 尝试读取SillyTavern预设...');
        const preset = TavernHelper.getPreset('in_use');
        systemPrompt = this.extractPresetsContent(preset);
        if (systemPrompt) {
          console.log('[上下文增强] ✅ 成功读取预设内容');
          console.log('[上下文增强] 📝 预设内容长度:', systemPrompt.length, '字符');
          console.log('[上下文增强] 📄 预设内容预览:', systemPrompt.substring(0, 200) + (systemPrompt.length > 200 ? '...' : ''));
        } else {
          console.log('[上下文增强] ⚠️ 预设内容为空');
        }
      } catch (error) {
        console.error('[上下文增强] ❌ 无法读取预设:', error);
      }
    } else {
      console.log('[上下文增强] ⏭️ 跳过预设读取 (includePreset:', includePreset, ', TavernHelper可用:', typeof TavernHelper !== 'undefined', ')');
    }

    // 2. 获取相关的向量记忆（仅当向量功能启用时）
    if (includeVectorMemories && gameState.vectorConfig.enabled) {
      try {
        console.log('[上下文增强] 🔍 开始检索向量记忆...');
        console.log('[上下文增强] 📌 查询内容:', userInput.substring(0, 100) + (userInput.length > 100 ? '...' : ''));
        
        // 确保vectorService使用最新的配置
        const { vectorService } = await import('./vectorService');
        vectorService.updateConfig(gameState.vectorConfig);
        console.log('[上下文增强] ✅ 已同步向量服务配置:', {
          enabled: gameState.vectorConfig.enabled,
          apiUrl: gameState.vectorConfig.apiUrl,
          model: gameState.vectorConfig.model
        });
        
        const memoryResult = await contextMemoryRetriever.retrieveRelevantMemories(
          gameState,
          userInput,
          maxVectorResults
        );
        
        if (memoryResult.relevantMemories.length > 0) {
          console.log('[上下文增强] ✅ 找到', memoryResult.relevantMemories.length, '条相关记忆');
          memoryResult.relevantMemories.forEach((result, index) => {
            console.log(`[上下文增强] 📦 记忆${index + 1}:`, {
              分类: result.memory.category,
              相似度: `${(result.similarity * 100).toFixed(1)}%`,
              时间: result.memory.metadata.timestamp,
              地点: result.memory.metadata.location || '未知',
              内容预览: result.memory.text.substring(0, 50) + '...'
            });
          });
          
          const memoryContext = contextMemoryRetriever.formatMemoriesForPrompt(
            memoryResult.relevantMemories
          );
          
          injectedPrompts.push({
            role: 'system',
            content: `以下是与当前情境相关的历史记忆，请参考这些记忆来生成更连贯和一致的内容：\n\n${memoryContext}`
          });
        } else {
          console.log('[上下文增强] ⚠️ 未找到相关记忆');
        }
      } catch (error) {
        console.error('[上下文增强] ❌ 无法检索向量记忆:', error);
      }
    } else {
      console.log('[上下文增强] ⏭️ 跳过向量记忆检索 (includeVectorMemories:', includeVectorMemories, ', 向量功能启用:', gameState.vectorConfig.enabled, ')');
    }

    // 3. 获取相关的世界书条目（不依赖向量功能）
    if (includeWorldbook && typeof TavernHelper !== 'undefined') {
      try {
        console.log('[上下文增强] 📚 开始检索世界书条目...');
        const worldbookContent = await this.getRelevantWorldbookEntries(
          gameState,
          userInput
        );
        
        if (worldbookContent) {
          injectedPrompts.push({
            role: 'system',
            content: worldbookContent
          });
          console.log('[上下文增强] ✅ 成功获取世界书条目');
        } else {
          console.log('[上下文增强] ⚠️ 未找到匹配的世界书条目');
        }
      } catch (error) {
        console.error('[上下文增强] ❌ 无法读取世界书:', error);
      }
    } else {
      console.log('[上下文增强] ⏭️ 跳过世界书检索 (includeWorldbook:', includeWorldbook, ', TavernHelper可用:', typeof TavernHelper !== 'undefined', ')');
    }

    // 4. 添加当前游戏状态上下文
    console.log('[上下文增强] 🎮 添加当前游戏状态上下文...');
    const gameContext = this.buildGameContextPrompt(gameState);
    if (gameContext) {
      injectedPrompts.push({
        role: 'system',
        content: gameContext
      });
      console.log('[上下文增强] ✅ 游戏状态上下文已添加');
    }

    // 5. 构建最终的用户提示词
    const enhancedUserPrompt = this.buildEnhancedUserPrompt(
      userInput,
      gameState
    );

    console.log('[上下文增强] ========== 上下文构建完成 ==========');
    console.log('[上下文增强] 📊 汇总统计:');
    console.log('[上下文增强]   - 预设内容:', systemPrompt ? '✅ 已包含' : '❌ 未包含');
    console.log('[上下文增强]   - 注入提示词数量:', injectedPrompts.length);
    injectedPrompts.forEach((prompt, index) => {
      const contentPreview = prompt.content.substring(0, 50).replace(/\n/g, ' ');
      const type = prompt.content.includes('历史记忆') ? '📦 向量记忆' :
                   prompt.content.includes('世界书') ? '📚 世界书' :
                   prompt.content.includes('游戏状态') ? '🎮 游戏状态' : '❓ 其他';
      console.log(`[上下文增强]   ${index + 1}. ${type}: ${contentPreview}...`);
    });
    console.log('[上下文增强] ==========================================');

    return {
      systemPrompt,
      userPrompt: enhancedUserPrompt,
      injectedPrompts
    };
  }

  /**
   * 从预设中提取相关内容
   */
  private extractPresetsContent(preset: any): string {
    const contents: string[] = [];
    
    // 提取系统提示词
    for (const prompt of preset.prompts || []) {
      if (prompt.enabled && prompt.role === 'system' && prompt.content) {
        contents.push(prompt.content);
      }
    }
    
    return contents.join('\n\n');
  }

  /**
   * 获取相关的世界书条目
   */
  private async getRelevantWorldbookEntries(
    gameState: GameState,
    query: string
  ): Promise<string | null> {
    if (typeof TavernHelper === 'undefined') return null;

    try {
      // 获取当前激活的世界书（全局 + 角色绑定）
      const globalWorldbooks = TavernHelper.getGlobalWorldbookNames();
      const charWorldbooks = TavernHelper.getCharWorldbookNames('current');
      
      // 合并所有激活的世界书
      const worldbookNames = [
        ...globalWorldbooks,
        ...(charWorldbooks.primary ? [charWorldbooks.primary] : []),
        ...charWorldbooks.additional
      ];
      
      // 去重
      const uniqueWorldbooks = Array.from(new Set(worldbookNames));
      
      console.log('[世界书] 📚 全局世界书:', globalWorldbooks);
      console.log('[世界书] 📚 角色主世界书:', charWorldbooks.primary);
      console.log('[世界书] 📚 角色附加世界书:', charWorldbooks.additional);
      console.log('[世界书] 📚 合并后总数:', uniqueWorldbooks.length);
      
      if (uniqueWorldbooks.length === 0) {
        console.log('[世界书] ⚠️ 没有激活任何世界书');
        return null;
      }
      
      console.log('[世界书] 📋 激活的世界书列表:', uniqueWorldbooks);

      const relevantEntries: string[] = [];
      let totalEntries = 0;
      
      // 遍历世界书，找到相关条目
      for (const worldbookName of uniqueWorldbooks) {
        try {
          console.log(`[世界书] 🔍 正在检查世界书: ${worldbookName}`);
          const worldbook = await TavernHelper.getWorldbook(worldbookName);
          console.log(`[世界书] 📖 ${worldbookName} 包含 ${worldbook.length} 个条目`);
          totalEntries += worldbook.length;
          
          let matchedCount = 0;
          for (const entry of worldbook) {
            if (!entry.enabled) continue;
            
            // 检查关键词匹配
            const shouldInclude = this.shouldIncludeWorldbookEntry(
              entry,
              query,
              gameState
            );
            
            if (shouldInclude) {
              matchedCount++;
              console.log(`[世界书] ✅ 匹配条目: ${entry.name}`);
              console.log(`[世界书] 📝 条目类型:`, entry.strategy.type);
              console.log(`[世界书] 🔑 关键词:`, entry.strategy.keys);
              console.log(`[世界书] 📄 内容长度:`, entry.content.length, '字符');
              
              relevantEntries.push(
                `【${entry.name}】\n${entry.content}`
              );
            }
          }
          
          console.log(`[世界书] 📊 ${worldbookName}: ${matchedCount}/${worldbook.length} 条目匹配`);
        } catch (error) {
          console.error(`[世界书] ❌ 无法读取世界书 ${worldbookName}:`, error);
        }
      }

      console.log(`[世界书] 📈 总计: ${relevantEntries.length}/${totalEntries} 条目匹配`);
      
      if (relevantEntries.length === 0) {
        console.log('[世界书] ⚠️ 没有找到匹配的条目');
        return null;
      }

      console.log('[世界书] ✅ 成功获取', relevantEntries.length, '个相关条目');
      return `=== 相关世界书信息 ===\n\n${relevantEntries.join('\n\n')}\n\n===================`;
    } catch (error) {
      console.error('读取世界书时出错:', error);
      return null;
    }
  }

  /**
   * 判断是否应该包含某个世界书条目
   */
  private shouldIncludeWorldbookEntry(
    entry: any,
    query: string,
    gameState: GameState
  ): boolean {
    // 常量条目总是包含
    if (entry.strategy.type === 'constant') {
      return true;
    }

    // 检查主要关键词
    const queryLower = query.toLowerCase();
    const keys = entry.strategy.keys || [];
    
    for (const key of keys) {
      if (typeof key === 'string') {
        if (queryLower.includes(key.toLowerCase())) {
          return true;
        }
      }
    }

    // 检查位置相关
    if (entry.metadata?.location && gameState.exploration.location) {
      if (gameState.exploration.location.includes(entry.metadata.location)) {
        return true;
      }
    }

    // 检查角色相关
    if (entry.metadata?.involvedCharacters) {
      for (const char of entry.metadata.involvedCharacters) {
        if (queryLower.includes(char.toLowerCase())) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 构建游戏状态上下文提示词
   */
  private buildGameContextPrompt(gameState: GameState): string {
    const context: string[] = [];
    
    context.push('=== 当前游戏状态 ===');
    context.push('');
    
    // 基本信息
    context.push(`玩家：${gameState.playerProfile.name}`);
    context.push(`称号：${gameState.playerProfile.title}`);
    context.push(`灵石：${gameState.playerProfile.spiritStones}`);
    context.push('');
    
    // 位置和时间
    context.push(`当前位置：${gameState.exploration.location}`);
    context.push(`时间：${gameState.exploration.time}`);
    context.push('');
    
    // 队伍信息
    if (gameState.playerProfile.maleParty.length > 0 || gameState.playerProfile.femaleParty.length > 0) {
      context.push('当前队伍：');
      const allParty = [
        ...gameState.playerProfile.maleParty,
        ...gameState.playerProfile.femaleParty
      ];
      for (const card of allParty) {
        context.push(`  - ${card.name} (${card.realm})`);
      }
      context.push('');
    }
    
    // 战斗状态
    if (gameState.mode === 'battle' && gameState.battle) {
      context.push('战斗中：');
      context.push(`  己方：${gameState.battle.playerParty.map(p => p.card.name).join('、')}`);
      context.push(`  敌方：${gameState.battle.opponentParty.map(p => p.card.name).join('、')}`);
      context.push('');
    }
    
    context.push('===================');
    
    return context.join('\n');
  }

  /**
   * 构建增强的用户提示词
   */
  private buildEnhancedUserPrompt(
    userInput: string,
    gameState: GameState
  ): string {
    // 添加上下文提示
    const contextHints: string[] = [];
    
    // 根据游戏模式添加提示
    if (gameState.mode === 'battle') {
      contextHints.push('请基于当前战斗情况生成内容');
    } else {
      contextHints.push('请基于当前探索情况生成内容');
    }
    
    // 添加记忆一致性提示
    contextHints.push('请确保内容与历史记忆保持一致');
    
    if (contextHints.length > 0) {
      return `${userInput}\n\n（${contextHints.join('，')}）`;
    }
    
    return userInput;
  }

  /**
   * 使用TavernHelper的generate函数生成内容
   */
  async generateWithEnhancedContext(
    gameState: GameState,
    userInput: string,
    options: {
      includeVectorMemories?: boolean;
      includePreset?: boolean;
      includeWorldbook?: boolean;
      maxVectorResults?: number;
      shouldStream?: boolean;
    } = {}
  ): Promise<string> {
    if (typeof TavernHelper === 'undefined') {
      throw new Error('TavernHelper未定义，无法使用增强生成功能');
    }

    // 构建增强上下文
    const context = await this.buildEnhancedContext(gameState, userInput, options);
    
    // 准备注入的提示词
    const injects: any[] = [];
    for (let i = 0; i < context.injectedPrompts.length; i++) {
      const prompt = context.injectedPrompts[i];
      injects.push({
        id: `enhanced_context_${i}`,
        role: prompt.role,
        content: prompt.content,
        position: 'in_chat',
        depth: 0,
        should_scan: true
      });
    }

    // 调用TavernHelper的generate函数
    try {
      const result = await TavernHelper.generate({
        user_input: context.userPrompt,
        injects: injects,
        should_stream: options.shouldStream || false,
        max_chat_history: 'all'
      });

      return result;
    } catch (error) {
      console.error('AI生成失败:', error);
      throw error;
    }
  }

  /**
   * 使用自定义API生成内容（绕过SillyTavern预设）
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
    if (typeof TavernHelper === 'undefined') {
      throw new Error('TavernHelper未定义，无法使用增强生成功能');
    }

    // 构建增强上下文（不包含预设和世界书）
    const context = await this.buildEnhancedContext(gameState, userInput, {
      ...options,
      includePreset: false,
      includeWorldbook: false
    });
    
    // 准备注入的提示词
    const injects: any[] = [];
    for (let i = 0; i < context.injectedPrompts.length; i++) {
      const prompt = context.injectedPrompts[i];
      injects.push({
        id: `enhanced_context_${i}`,
        role: prompt.role,
        content: prompt.content,
        position: 'in_chat',
        depth: 0,
        should_scan: true
      });
    }

    // 使用自定义API
    try {
      const result = await TavernHelper.generate({
        user_input: context.userPrompt,
        injects: injects,
        should_stream: options.shouldStream || false,
        custom_api: customAPI
      });

      return result;
    } catch (error) {
      console.error('AI生成失败:', error);
      throw error;
    }
  }
}

/**
 * 导出单例实例
 */
export const aiContextEnhancer = new AIContextEnhancer();