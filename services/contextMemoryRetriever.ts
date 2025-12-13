import {
  ContextRetrievalResult,
  GameState,
  MemoryCategory,
  SemanticSearchResult
} from '../types';
import { SemanticSearchOptions, semanticSearchService } from './semanticSearchService';

/**
 * 上下文类型
 */
export type ContextType = 
  | 'exploration'
  | 'battle'
  | 'hospital'
  | 'bounty'
  | 'shop'
  | 'cultivation'
  | 'business'
  | 'arena';

/**
 * 上下文信息
 */
export interface GameContext {
  type: ContextType;
  description: string;
  location?: string;
  involvedCharacters?: string[];
  keywords: string[];
  categories: MemoryCategory[];
}

/**
 * 上下文感知的记忆检索服务
 * 自动识别当前游戏情境并检索相关历史记忆
 */
export class ContextMemoryRetriever {
  /**
   * 从游戏状态提取上下文
   */
  extractContext(gameState: GameState): GameContext {
    const mode = gameState.mode;
    
    if (mode === 'battle') {
      return this.extractBattleContext(gameState);
    } else {
      return this.extractExplorationContext(gameState);
    }
  }

  /**
   * 提取战斗上下文
   */
  private extractBattleContext(gameState: GameState): GameContext {
    const battle = gameState.battle;
    if (!battle) {
      return {
        type: 'battle',
        description: '战斗',
        keywords: ['战斗'],
        categories: ['战斗']
      };
    }

    const involvedCharacters: string[] = [];
    const keywords: string[] = ['战斗'];

    // 收集玩家队伍角色
    battle.playerParty.forEach(p => {
      involvedCharacters.push(p.card.name);
      keywords.push(p.card.name);
    });

    // 收集对手队伍角色
    battle.opponentParty.forEach(p => {
      involvedCharacters.push(p.card.name);
      keywords.push(p.card.name);
    });

    // 竞技场战斗
    if (battle.isArenaBattle) {
      keywords.push('竞技场', '排位赛');
      return {
        type: 'arena',
        description: `竞技场战斗：${involvedCharacters.join(' vs ')}`,
        involvedCharacters,
        keywords,
        categories: ['战斗', '声望']
      };
    }

    return {
      type: 'battle',
      description: `战斗：${involvedCharacters.join(' vs ')}`,
      involvedCharacters,
      keywords,
      categories: ['战斗']
    };
  }

  /**
   * 提取探索上下文
   */
  private extractExplorationContext(gameState: GameState): GameContext {
    const exploration = gameState.exploration;
    const location = exploration.location;
    const story = exploration.story;

    // 检测特殊场景
    if (location.includes('医馆') || story.includes('病患') || story.includes('诊治')) {
      const keywords = this.extractKeywords(story);
      keywords.push('医馆', '问诊', '治疗');
      
      return {
        type: 'hospital',
        description: '医馆问诊',
        location,
        keywords,
        categories: ['医馆']
      };
    }

    if (location.includes('悬赏') || story.includes('悬赏') || story.includes('追踪')) {
      const keywords = this.extractKeywords(story);
      keywords.push('悬赏', '追踪');
      
      return {
        type: 'bounty',
        description: '悬赏任务',
        location,
        keywords,
        categories: ['悬赏']
      };
    }

    if (location.includes('商城') || location.includes('商店') || story.includes('购买')) {
      const keywords = this.extractKeywords(story);
      keywords.push('商城', '购买', '交易');
      
      return {
        type: 'shop',
        description: '商城',
        location,
        keywords,
        categories: ['商城']
      };
    }

    if (location.includes('育灵轩') || story.includes('培育') || story.includes('繁育')) {
      const keywords = this.extractKeywords(story);
      keywords.push('培育', '繁育');
      
      return {
        type: 'cultivation',
        description: '育灵轩',
        location,
        keywords,
        categories: ['培育']
      };
    }

    if (location.includes('商业区') || story.includes('经营') || story.includes('生意')) {
      const keywords = this.extractKeywords(story);
      keywords.push('商业', '经营');
      
      return {
        type: 'business',
        description: '商业区经营',
        location,
        keywords,
        categories: ['商业']
      };
    }

    // 默认探索场景
    const keywords = this.extractKeywords(story);
    const involvedCharacters = this.extractCharacterNames(story, gameState);
    
    return {
      type: 'exploration',
      description: `探索：${location}`,
      location,
      involvedCharacters,
      keywords,
      categories: ['探索']
    };
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    
    // 常见动作词
    const actionWords = [
      '战斗', '探索', '购买', '出售', '治疗', '问诊', '追踪', '培育',
      '修炼', '突破', '挑战', '对决', '交易', '谈判', '调查'
    ];
    
    for (const word of actionWords) {
      if (text.includes(word)) {
        keywords.push(word);
      }
    }
    
    // 常见地点词
    const locationWords = [
      '医馆', '商城', '悬赏榜', '育灵轩', '竞技场', '商业区',
      '宗门', '山门', '广场', '密室', '洞府'
    ];
    
    for (const word of locationWords) {
      if (text.includes(word)) {
        keywords.push(word);
      }
    }
    
    return keywords;
  }

  /**
   * 提取角色名称
   */
  private extractCharacterNames(text: string, gameState: GameState): string[] {
    const names: string[] = [];
    
    // 从卡牌收藏中提取
    for (const card of gameState.playerProfile.cardCollection) {
      if (text.includes(card.name)) {
        names.push(card.name);
      }
    }
    
    // 从关系列表中提取
    for (const rel of gameState.playerProfile.relationships) {
      if (text.includes(rel.name)) {
        names.push(rel.name);
      }
    }
    
    return names;
  }

  /**
   * 检索相关记忆
   */
  async retrieveRelevantMemories(
    gameState: GameState,
    customQuery?: string,
    maxResults: number = 10
  ): Promise<ContextRetrievalResult> {
    const startTime = Date.now();
    
    // 提取上下文
    const context = this.extractContext(gameState);
    
    // 构建查询
    const query = customQuery || context.description;
    
    console.log('[上下文检索] 🔍 当前上下文:', {
      type: context.type,
      description: context.description,
      categories: context.categories,
      keywords: context.keywords
    });
    
    // 构建搜索选项
    // 注意：不限制分类，搜索所有向量以获得更好的覆盖
    const searchOptions: SemanticSearchOptions = {
      // categories: context.categories,  // ← 暂时注释掉分类限制
      involvedCharacters: context.involvedCharacters,
      maxResults,
      minSimilarity: 0.65, // 稍微降低阈值以获取更多上下文
      useTimeDecay: true,
      timeDecayFactor: 0.00001
    };
    
    console.log('[上下文检索] 📊 搜索选项:', searchOptions);
    
    // 执行混合搜索
    const results = await semanticSearchService.hybridSearch(
      query,
      context.keywords,
      searchOptions
    );
    
    const endTime = Date.now();
    
    return {
      query,
      context: context.description,
      relevantMemories: results,
      totalSearched: results.length,
      searchTime: endTime - startTime
    };
  }

  /**
   * 批量检索（用于多个查询点）
   */
  async batchRetrieve(
    gameState: GameState,
    queries: string[],
    maxResults: number = 15
  ): Promise<ContextRetrievalResult> {
    const startTime = Date.now();
    const context = this.extractContext(gameState);
    
    const searchOptions: SemanticSearchOptions = {
      categories: context.categories,
      involvedCharacters: context.involvedCharacters,
      maxResults,
      minSimilarity: 0.65,
      useTimeDecay: true
    };
    
    const results = await semanticSearchService.batchSearch(queries, searchOptions);
    
    const endTime = Date.now();
    
    return {
      query: queries.join('; '),
      context: context.description,
      relevantMemories: results,
      totalSearched: results.length,
      searchTime: endTime - startTime
    };
  }

  /**
   * 格式化记忆为上下文文本（用于注入AI提示词）
   */
  formatMemoriesForPrompt(results: SemanticSearchResult[]): string {
    if (results.length === 0) {
      return '';
    }

    const lines: string[] = [
      '=== 相关历史记忆 ===',
      ''
    ];

    for (const result of results) {
      const memory = result.memory;
      lines.push(`【${memory.category}】${memory.metadata.timestamp}`);
      lines.push(`地点：${memory.metadata.location || '未知'}`);
      
      if (memory.metadata.involvedCharacters && memory.metadata.involvedCharacters.length > 0) {
        lines.push(`相关角色：${memory.metadata.involvedCharacters.join('、')}`);
      }
      
      lines.push(`内容：${memory.text}`);
      lines.push(`相似度：${(result.similarity * 100).toFixed(1)}%`);
      lines.push('');
    }

    lines.push('===================');
    
    return lines.join('\n');
  }

  /**
   * 获取简化的记忆摘要（用于快速参考）
   */
  getMemorySummary(results: SemanticSearchResult[]): string[] {
    return results.map(r => {
      const memory = r.memory;
      const preview = memory.text.length > 100 
        ? memory.text.substring(0, 100) + '...' 
        : memory.text;
      
      return `[${memory.category}] ${memory.metadata.timestamp}: ${preview}`;
    });
  }

  /**
   * 按时间线组织记忆
   */
  organizeByTimeline(results: SemanticSearchResult[]): Map<string, SemanticSearchResult[]> {
    const timeline = new Map<string, SemanticSearchResult[]>();
    
    for (const result of results) {
      const timestamp = result.memory.metadata.timestamp;
      
      if (!timeline.has(timestamp)) {
        timeline.set(timestamp, []);
      }
      
      timeline.get(timestamp)!.push(result);
    }
    
    return timeline;
  }

  /**
   * 按角色组织记忆
   */
  organizeByCharacter(results: SemanticSearchResult[]): Map<string, SemanticSearchResult[]> {
    const byCharacter = new Map<string, SemanticSearchResult[]>();
    
    for (const result of results) {
      const characters = result.memory.metadata.involvedCharacters || [];
      
      for (const character of characters) {
        if (!byCharacter.has(character)) {
          byCharacter.set(character, []);
        }
        
        byCharacter.get(character)!.push(result);
      }
    }
    
    return byCharacter;
  }
}

/**
 * 导出单例实例
 */
export const contextMemoryRetriever = new ContextMemoryRetriever();