import {
  MemoryCategory,
  SemanticSearchResult,
  VectorizedMemoryEntry
} from '../types';
import { rerankerService } from './rerankerService';
import { vectorService } from './vectorService';
import { vectorStorageService } from './vectorStorageService';

/**
 * 语义搜索选项
 */
export interface SemanticSearchOptions {
  categories?: MemoryCategory[]; // 限制搜索的分类
  timeRange?: {
    start: number;
    end: number;
  };
  involvedCharacters?: string[]; // 相关角色过滤
  tags?: string[]; // 标签过滤
  maxResults?: number; // 最大结果数
  minSimilarity?: number; // 最小相似度阈值
  useTimeDecay?: boolean; // 是否使用时间衰减
  timeDecayFactor?: number; // 时间衰减因子
}

/**
 * 语义搜索服务
 * 提供基于向量相似度的智能搜索功能
 */
export class SemanticSearchService {
  /**
   * 执行语义搜索
   * @param query 查询文本
   * @param options 搜索选项
   * @returns 搜索结果列表
   */
  async search(
    query: string,
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult[]> {
    const startTime = Date.now();
    
    try {
      // 检查向量服务是否启用
      const config = vectorService.getConfig();
      if (!config.enabled) {
        console.error('[语义搜索] ❌ 向量化功能未启用，请在设置中启用');
        throw new Error('向量化功能未启用，请在设置中启用向量化功能');
      }
      
      // 1. 向量化查询文本
      console.log('[语义搜索] 🔄 正在向量化查询文本...');
      console.log('[语义搜索] 📊 当前配置:', { enabled: config.enabled, model: config.model, apiUrl: config.apiUrl });
      const queryVector = await vectorService.vectorize(query);
      
      // 2. 获取候选向量
      let candidates = await this.getCandidates(options);
      console.log(`找到 ${candidates.length} 个候选向量`);
      
      if (candidates.length === 0) {
        return [];
      }
      
      // 3. 计算相似度
      const results = this.calculateSimilarities(queryVector, candidates, options);
      
      // 4. 过滤和排序
      const filtered = this.filterAndSort(results, options);
      
      // 5. 使用Reranker进行重排序（如果启用）
      let finalResults = filtered;
      
      if (config.rerankerEnabled && filtered.length > 0) {
        console.log('应用Reranker重排序...');
        // 获取topKBeforeRerank数量的候选结果
        const topK = config.topKBeforeRerank || 50;
        const candidatesForRerank = filtered.slice(0, topK);
        
        // 使用Reranker重排序
        finalResults = await rerankerService.rerankSearchResults(query, candidatesForRerank);
      }
      
      const endTime = Date.now();
      console.log(`搜索完成，耗时 ${endTime - startTime}ms，返回 ${finalResults.length} 个结果`);
      
      return finalResults;
      
    } catch (error) {
      console.error('语义搜索失败:', error);
      throw error;
    }
  }

  /**
   * 批量搜索（用于上下文检索）
   * @param queries 多个查询文本
   * @param options 搜索选项
   * @returns 合并去重后的结果
   */
  async batchSearch(
    queries: string[],
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult[]> {
    const allResults: SemanticSearchResult[] = [];
    const seenIds = new Set<string>();
    
    for (const query of queries) {
      const results = await this.search(query, options);
      
      for (const result of results) {
        if (!seenIds.has(result.memory.id)) {
          allResults.push(result);
          seenIds.add(result.memory.id);
        }
      }
    }
    
    // 重新排序
    allResults.sort((a, b) => b.similarity - a.similarity);
    
    // 重新分配排名
    allResults.forEach((result, index) => {
      result.rank = index + 1;
    });
    
    // 限制结果数量
    const maxResults = options.maxResults || 20;
    return allResults.slice(0, maxResults);
  }

  /**
   * 查找相似记忆
   * @param memoryId 记忆ID
   * @param options 搜索选项
   * @returns 相似的记忆列表
   */
  async findSimilarMemories(
    memoryId: string,
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult[]> {
    // 获取目标记忆的向量
    const targetVector = await vectorStorageService.getVectorByMemoryId(memoryId);
    
    if (!targetVector) {
      throw new Error(`记忆 ${memoryId} 未向量化`);
    }
    
    // 获取候选向量（排除自己）
    let candidates = await this.getCandidates(options);
    candidates = candidates.filter(c => c.memoryId !== memoryId);
    
    if (candidates.length === 0) {
      return [];
    }
    
    // 计算相似度
    const results = this.calculateSimilarities(
      targetVector.vector,
      candidates,
      options
    );
    
    // 过滤和排序
    return this.filterAndSort(results, options);
  }

  /**
   * 混合搜索（结合向量搜索和关键词过滤）
   * @param query 查询文本
   * @param keywords 关键词列表
   * @param options 搜索选项
   * @returns 搜索结果
   */
  async hybridSearch(
    query: string,
    keywords: string[],
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult[]> {
    // 执行语义搜索
    const semanticResults = await this.search(query, options);
    
    if (keywords.length === 0) {
      return semanticResults;
    }
    
    // 关键词过滤和加权
    const hybridResults = semanticResults.map(result => {
      let keywordScore = 0;
      const text = result.memory.text.toLowerCase();
      
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          keywordScore += 0.1; // 每个匹配的关键词增加0.1分
        }
      }
      
      // 混合相似度 = 语义相似度 * 0.7 + 关键词得分 * 0.3
      const hybridSimilarity = result.similarity * 0.7 + Math.min(keywordScore, 0.3);
      
      return {
        ...result,
        similarity: hybridSimilarity
      };
    });
    
    // 重新排序
    hybridResults.sort((a, b) => b.similarity - a.similarity);
    
    // 重新分配排名
    hybridResults.forEach((result, index) => {
      result.rank = index + 1;
    });
    
    return hybridResults;
  }

  /**
   * 获取候选向量
   */
  private async getCandidates(
    options: SemanticSearchOptions
  ): Promise<VectorizedMemoryEntry[]> {
    let candidates: VectorizedMemoryEntry[] = [];
    
    // 按分类过滤
    if (options.categories && options.categories.length > 0) {
      for (const category of options.categories) {
        const vectors = await vectorStorageService.getVectorsByCategory(category);
        candidates.push(...vectors);
      }
    } else {
      candidates = await vectorStorageService.getAllVectors();
    }
    
    // 时间范围过滤
    if (options.timeRange) {
      candidates = candidates.filter(v => 
        v.metadata.realTimestamp >= options.timeRange!.start &&
        v.metadata.realTimestamp <= options.timeRange!.end
      );
    }
    
    // 角色过滤
    if (options.involvedCharacters && options.involvedCharacters.length > 0) {
      candidates = candidates.filter(v => {
        if (!v.metadata.involvedCharacters) return false;
        return options.involvedCharacters!.some(char =>
          v.metadata.involvedCharacters!.includes(char)
        );
      });
    }
    
    // 标签过滤
    if (options.tags && options.tags.length > 0) {
      candidates = candidates.filter(v => {
        if (!v.metadata.tags) return false;
        return options.tags!.some(tag => v.metadata.tags!.includes(tag));
      });
    }
    
    return candidates;
  }

  /**
   * 计算相似度
   */
  private calculateSimilarities(
    queryVector: number[],
    candidates: VectorizedMemoryEntry[],
    options: SemanticSearchOptions
  ): SemanticSearchResult[] {
    const results: SemanticSearchResult[] = [];
    const now = Date.now();
    const useTimeDecay = options.useTimeDecay ?? false;
    const timeDecayFactor = options.timeDecayFactor ?? 0.00001; // 默认衰减因子
    
    for (const candidate of candidates) {
      // 计算余弦相似度
      let similarity = vectorService.cosineSimilarity(queryVector, candidate.vector);
      
      // 应用时间衰减
      if (useTimeDecay) {
        const age = now - candidate.metadata.realTimestamp;
        const daysSinceCreation = age / (1000 * 60 * 60 * 24);
        const timeDecay = Math.exp(-timeDecayFactor * daysSinceCreation);
        similarity = similarity * timeDecay;
      }
      
      results.push({
        memory: candidate,
        similarity,
        rank: 0 // 将在排序后分配
      });
    }
    
    return results;
  }

  /**
   * 过滤和排序结果
   */
  private filterAndSort(
    results: SemanticSearchResult[],
    options: SemanticSearchOptions
  ): SemanticSearchResult[] {
    const minSimilarity = options.minSimilarity ?? 0.7;
    const config = vectorService.getConfig();
    
    // 如果启用了Reranker，使用topKBeforeRerank；否则使用maxResults
    const maxResults = config.rerankerEnabled
      ? (config.topKBeforeRerank || 50)
      : (options.maxResults ?? 20);
    
    // 过滤低相似度结果
    let filtered = results.filter(r => r.similarity >= minSimilarity);
    
    // 按相似度降序排序
    filtered.sort((a, b) => b.similarity - a.similarity);
    
    // 限制结果数量
    filtered = filtered.slice(0, maxResults);
    
    // 分配排名
    filtered.forEach((result, index) => {
      result.rank = index + 1;
    });
    
    return filtered;
  }

  /**
   * 聚类搜索结果（按相似内容分组）
   */
  clusterResults(
    results: SemanticSearchResult[],
    similarityThreshold: number = 0.85
  ): SemanticSearchResult[][] {
    if (results.length === 0) return [];
    
    const clusters: SemanticSearchResult[][] = [];
    const visited = new Set<string>();
    
    for (const result of results) {
      if (visited.has(result.memory.id)) continue;
      
      const cluster: SemanticSearchResult[] = [result];
      visited.add(result.memory.id);
      
      // 查找相似的结果
      for (const other of results) {
        if (visited.has(other.memory.id)) continue;
        
        const similarity = vectorService.cosineSimilarity(
          result.memory.vector,
          other.memory.vector
        );
        
        if (similarity >= similarityThreshold) {
          cluster.push(other);
          visited.add(other.memory.id);
        }
      }
      
      clusters.push(cluster);
    }
    
    return clusters;
  }

  /**
   * 获取搜索建议（基于部分查询）
   */
  async getSuggestions(
    partialQuery: string,
    limit: number = 5
  ): Promise<string[]> {
    if (partialQuery.length < 2) return [];
    
    const allVectors = await vectorStorageService.getAllVectors();
    const suggestions = new Set<string>();
    
    for (const vector of allVectors) {
      const text = vector.text.toLowerCase();
      const query = partialQuery.toLowerCase();
      
      if (text.includes(query)) {
        // 提取包含查询的句子
        const sentences = vector.text.split(/[。！？\n]/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(query) && sentence.length < 100) {
            suggestions.add(sentence.trim());
            if (suggestions.size >= limit) break;
          }
        }
      }
      
      if (suggestions.size >= limit) break;
    }
    
    return Array.from(suggestions);
  }
}

/**
 * 导出单例实例
 */
export const semanticSearchService = new SemanticSearchService();