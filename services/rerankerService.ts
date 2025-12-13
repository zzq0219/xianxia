import { SemanticSearchResult, VectorConfig } from '../types';

/**
 * Reranker响应格式（Jina AI）
 */
interface JinaRerankerResponse {
  model: string;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
  };
  results: Array<{
    index: number;
    document: {
      text: string;
    };
    relevance_score: number;
  }>;
}

/**
 * Reranker响应格式（Cohere）
 */
interface CohereRerankerResponse {
  id: string;
  results: Array<{
    index: number;
    relevance_score: number;
  }>;
  meta: {
    api_version: {
      version: string;
    };
  };
}

/**
 * Reranker请求项
 */
interface RerankerDocument {
  text: string;
  index: number;
}

/**
 * Reranker服务
 * 提供搜索结果重排序功能，提高检索相关性
 */
export class RerankerService {
  private config: VectorConfig;

  constructor(config: VectorConfig) {
    this.config = config;
  }

  /**
   * 更新配置
   */
  updateConfig(config: VectorConfig) {
    this.config = config;
  }

  /**
   * 获取当前配置
   */
  getConfig(): VectorConfig {
    return { ...this.config };
  }

  /**
   * 测试Reranker API连接
   */
  async testConnection(): Promise<{ success: boolean; error?: string; model?: string }> {
    if (!this.config.rerankerEnabled) {
      return {
        success: false,
        error: 'Reranker功能未启用'
      };
    }

    try {
      // 使用简单的测试数据
      const testQuery = "测试查询";
      const testDocuments = ["测试文档1", "测试文档2"];
      
      await this.rerank(testQuery, testDocuments);
      
      return {
        success: true,
        model: this.config.rerankerModel
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '连接失败'
      };
    }
  }

  /**
   * 对搜索结果进行重排序
   * @param query 查询文本
   * @param results 原始搜索结果
   * @returns 重排序后的结果
   */
  async rerankSearchResults(
    query: string,
    results: SemanticSearchResult[]
  ): Promise<SemanticSearchResult[]> {
    if (!this.config.rerankerEnabled) {
      console.log('Reranker未启用，返回原始结果');
      return results;
    }

    if (results.length === 0) {
      return results;
    }

    try {
      console.log(`使用Reranker重排序 ${results.length} 个结果...`);
      const startTime = Date.now();

      // 提取文档文本
      const documents = results.map(r => r.memory.text);

      // 调用Reranker API
      const scores = await this.rerank(query, documents);

      // 更新相似度分数并重新排序
      const rerankedResults = results.map((result, index) => ({
        ...result,
        similarity: scores[index], // 使用Reranker分数替换原始相似度
        originalSimilarity: result.similarity // 保留原始相似度用于调试
      }));

      // 按新分数排序
      rerankedResults.sort((a, b) => b.similarity - a.similarity);

      // 重新分配排名
      rerankedResults.forEach((result, index) => {
        result.rank = index + 1;
      });

      // 应用最大结果数限制
      const maxResults = this.config.maxResults || 20;
      const finalResults = rerankedResults.slice(0, maxResults);

      const endTime = Date.now();
      console.log(`Reranker完成，耗时 ${endTime - startTime}ms，返回 ${finalResults.length} 个结果`);

      return finalResults;

    } catch (error) {
      console.error('Reranker失败，返回原始结果:', error);
      // 如果Reranker失败，回退到原始结果
      return results;
    }
  }

  /**
   * 调用Reranker API进行重排序
   * @param query 查询文本
   * @param documents 文档文本数组
   * @returns 相关性分数数组
   */
  async rerank(query: string, documents: string[]): Promise<number[]> {
    if (!this.config.rerankerApiKey) {
      throw new Error('缺少Reranker API密钥');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('查询文本为空');
    }

    if (documents.length === 0) {
      return [];
    }

    try {
      // 检测API类型
      const isJina = this.config.rerankerApiUrl.includes('jina') || 
                     this.config.rerankerModel.includes('jina');
      const isCohere = this.config.rerankerApiUrl.includes('cohere') || 
                       this.config.rerankerModel.includes('rerank');

      if (isJina) {
        return await this.rerankWithJina(query, documents);
      } else if (isCohere) {
        return await this.rerankWithCohere(query, documents);
      } else {
        // 尝试通用格式
        return await this.rerankGeneric(query, documents);
      }

    } catch (error) {
      console.error('Reranker API调用失败:', error);
      throw error;
    }
  }

  /**
   * 使用Jina AI Reranker API
   */
  private async rerankWithJina(query: string, documents: string[]): Promise<number[]> {
    const requestBody = {
      model: this.config.rerankerModel,
      query: query,
      documents: documents,
      top_n: documents.length // 返回所有文档的分数
    };

    const response = await fetch(`${this.config.rerankerApiUrl}/rerank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.rerankerApiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Jina Reranker API错误 ${response.status}: ${errorData.detail || response.statusText}`
      );
    }

    const data: JinaRerankerResponse = await response.json();

    // 创建分数数组，保持原始顺序
    const scores = new Array(documents.length).fill(0);
    for (const result of data.results) {
      scores[result.index] = result.relevance_score;
    }

    return scores;
  }

  /**
   * 使用Cohere Rerank API
   */
  private async rerankWithCohere(query: string, documents: string[]): Promise<number[]> {
    const requestBody = {
      model: this.config.rerankerModel,
      query: query,
      documents: documents,
      top_n: documents.length, // 返回所有文档的分数
      return_documents: false
    };

    const response = await fetch(`${this.config.rerankerApiUrl}/rerank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.rerankerApiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Cohere Reranker API错误 ${response.status}: ${errorData.message || response.statusText}`
      );
    }

    const data: CohereRerankerResponse = await response.json();

    // 创建分数数组，保持原始顺序
    const scores = new Array(documents.length).fill(0);
    for (const result of data.results) {
      scores[result.index] = result.relevance_score;
    }

    return scores;
  }

  /**
   * 使用通用Reranker API格式
   */
  private async rerankGeneric(query: string, documents: string[]): Promise<number[]> {
    const requestBody = {
      model: this.config.rerankerModel,
      query: query,
      documents: documents
    };

    const response = await fetch(`${this.config.rerankerApiUrl}/rerank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.rerankerApiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Reranker API错误 ${response.status}: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    // 尝试解析不同的响应格式
    if (data.results && Array.isArray(data.results)) {
      const scores = new Array(documents.length).fill(0);
      for (const result of data.results) {
        const index = result.index ?? result.document_index ?? 0;
        const score = result.relevance_score ?? result.score ?? 0;
        scores[index] = score;
      }
      return scores;
    }

    throw new Error('无法解析Reranker API响应格式');
  }

  /**
   * 批量重排序（用于大量文档）
   * @param query 查询文本
   * @param documents 文档数组
   * @param batchSize 批次大小
   * @returns 相关性分数数组
   */
  async batchRerank(
    query: string,
    documents: string[],
    batchSize: number = 100
  ): Promise<number[]> {
    if (documents.length <= batchSize) {
      return await this.rerank(query, documents);
    }

    const scores: number[] = [];
    const batches = this.chunkArray(documents, batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`处理Reranker批次 ${i + 1}/${batches.length}, 共 ${batch.length} 条`);

      try {
        const batchScores = await this.rerank(query, batch);
        scores.push(...batchScores);

        // 避免请求过快
        if (i < batches.length - 1) {
          await this.delay(200);
        }
      } catch (error) {
        console.error(`Reranker批次 ${i + 1} 失败:`, error);
        // 填充0分数
        scores.push(...new Array(batch.length).fill(0));
      }
    }

    return scores;
  }

  /**
   * 工具函数：数组分块
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 工具函数：延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 导出单例实例
 * 注意：需要在使用前通过updateConfig设置配置
 */
export const rerankerService = new RerankerService({
  enabled: false,
  apiUrl: '',
  apiKey: '',
  model: '',
  autoVectorize: false,
  vectorizeOnSummary: false,
  batchSize: 10,
  similarityThreshold: 0.7,
  maxResults: 20,
  topKBeforeRerank: 50,
  rerankerEnabled: false,
  rerankerApiUrl: 'https://api.jina.ai/v1',
  rerankerApiKey: '',
  rerankerModel: 'jina-reranker-v2-base-multilingual',
  retryAttempts: 3,
  cacheEnabled: true
});