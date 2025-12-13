import { VectorConfig } from '../types';

/**
 * 向量化服务
 * 负责与Embedding API交互，生成文本向量和计算相似度
 */
export class VectorService {
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
   * 测试API连接
   */
  async testConnection(): Promise<{ success: boolean; error?: string; model?: string }> {
    try {
      const response = await this.vectorize("测试连接");
      return {
        success: true,
        model: this.config.model
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '连接失败'
      };
    }
  }
  
  /**
   * 获取API支持的模型列表
   */
  async fetchAvailableModels(): Promise<{ success: boolean; models?: string[]; error?: string }> {
    try {
      // 检测API类型并使用相应的端点
      const isOllama = this.config.apiUrl.includes('ollama') || this.config.apiUrl.includes('11434');
      
      if (isOllama) {
        // Ollama API: GET /api/tags
        const response = await fetch(`${this.config.apiUrl}/api/tags`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: `HTTP ${response.status}: ${error}` };
        }

        const data = await response.json();
        // Ollama返回的模型列表在models数组中
        const models = data.models
          ?.map((m: any) => m.name) || [];
        
        return { success: true, models };
      } else {
        // OpenAI Compatible API: GET /models
        const response = await fetch(`${this.config.apiUrl}/models`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        });

        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: `HTTP ${response.status}: ${error}` };
        }

        const data = await response.json();
        // OpenAI API返回的模型列表在data数组中
        const models = data.data
          ?.map((m: any) => m.id) || [];
        
        return { success: true, models };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
  
  /**
   * 向量化单个文本
   * @param text 要向量化的文本
   * @returns 向量数组
   */
  async vectorize(text: string): Promise<number[]> {
    if (!this.config.enabled) {
      throw new Error('向量化功能未启用');
    }
    
    if (!this.config.apiKey) {
      throw new Error('缺少API密钥');
    }
    
    if (!text || text.trim().length === 0) {
      throw new Error('文本内容为空');
    }
    
    try {
      // 构建请求
      const requestBody: any = {
        model: this.config.model,
        input: text,
        encoding_format: 'float'
      };
      
      const response = await fetch(`${this.config.apiUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API错误 ${response.status}: ${errorData.error?.message || response.statusText}`
        );
      }
      
      const data = await response.json();
      
      // 处理不同API的响应格式
      if (data.data && Array.isArray(data.data) && data.data[0]?.embedding) {
        // OpenAI格式
        return data.data[0].embedding;
      } else if (Array.isArray(data.embedding)) {
        // 某些本地模型格式
        return data.embedding;
      } else {
        throw new Error('无法解析API响应格式');
      }
      
    } catch (error) {
      console.error('向量化失败:', error);
      throw error;
    }
  }
  
  /**
   * 批量向量化文本
   * @param texts 文本数组
   * @returns 向量数组
   */
  async batchVectorize(texts: string[]): Promise<number[][]> {
    if (!this.config.enabled) {
      throw new Error('向量化功能未启用');
    }
    
    if (texts.length === 0) {
      return [];
    }
    
    // 按批次大小分组
    const batches = this.chunkArray(texts, this.config.batchSize);
    const results: number[][] = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        console.log(`处理批次 ${i + 1}/${batches.length}, 共 ${batch.length} 条`);
        
        // 对批次中的每个文本进行向量化
        const batchResults = await Promise.all(
          batch.map(text => this.vectorize(text))
        );
        
        results.push(...batchResults);
        
        // 避免请求过快，添加延迟
        if (i < batches.length - 1) {
          await this.delay(200);
        }
        
      } catch (error) {
        console.error(`批次 ${i + 1} 处理失败:`, error);
        
        // 根据配置决定是否重试
        if (this.config.retryAttempts > 0) {
          console.log(`将在 1 秒后重试批次 ${i + 1}`);
          await this.delay(1000);
          
          try {
            const retryResults = await Promise.all(
              batch.map(text => this.vectorize(text))
            );
            results.push(...retryResults);
            continue;
          } catch (retryError) {
            console.error(`批次 ${i + 1} 重试失败:`, retryError);
          }
        }
        
        throw error;
      }
    }
    
    return results;
  }
  
  /**
   * 计算余弦相似度
   * @param vecA 向量A
   * @param vecB 向量B
   * @returns 相似度分数 (0-1)
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error(`向量维度不匹配: ${vecA.length} vs ${vecB.length}`);
    }
    
    if (vecA.length === 0) {
      return 0;
    }
    
    // 计算点积
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  /**
   * 批量计算相似度
   * @param queryVector 查询向量
   * @param vectors 目标向量数组
   * @returns 相似度数组
   */
  batchCosineSimilarity(queryVector: number[], vectors: number[][]): number[] {
    return vectors.map(vec => this.cosineSimilarity(queryVector, vec));
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
  
  /**
   * 估算文本的token数量（粗略估计）
   */
  estimateTokens(text: string): number {
    // 粗略估计：中文约1.5字符/token，英文约4字符/token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars / 1.5 + otherChars / 4);
  }
  
  /**
   * 估算API调用成本（以OpenAI为例）
   */
  estimateCost(tokenCount: number): number {
    // text-embedding-3-small: $0.02 per 1M tokens
    const costPer1MTokens = 0.02;
    return (tokenCount / 1_000_000) * costPer1MTokens;
  }
}

/**
 * 默认向量配置
 */
export const defaultVectorConfig: VectorConfig = {
  enabled: false,
  apiUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'text-embedding-3-small',
  
  autoVectorize: false,
  vectorizeOnSummary: true,
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
};

/**
 * 导出单例实例
 */
export const vectorService = new VectorService(defaultVectorConfig);