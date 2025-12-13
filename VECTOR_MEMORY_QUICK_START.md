# 向量化记忆系统 - 快速实施指南

## 🚀 快速开始

本指南将帮助你在30分钟内为仙侠卡牌RPG添加向量化记忆功能。

## 📋 前置准备

### 1. 获取Embedding API

推荐使用以下任一方案：

#### 方案A: OpenAI API（推荐）
```bash
# 访问 https://platform.openai.com/api-keys
# 创建API Key
# 模型: text-embedding-3-small (成本低，效果好)
```

#### 方案B: 本地部署（免费）
```bash
# 使用Ollama
ollama pull nomic-embed-text
ollama serve
# API地址: http://localhost:11434
```

#### 方案C: 其他兼容服务
- Azure OpenAI
- 讯飞星火
- 智谱AI
- 百度文心

### 2. 安装依赖

```bash
npm install idb  # IndexedDB封装（已安装）
# 无需额外依赖
```

## 📂 文件结构

```
src/
├── types.ts                          # 添加向量类型
├── constants.ts                      # 添加向量配置
├── services/
│   ├── vectorService.ts             # [新建] 向量化核心服务
│   ├── vectorStorageService.ts      # [新建] 向量存储服务
│   └── semanticSearchService.ts     # [新建] 语义搜索服务
├── components/
│   ├── VectorSettingsModal.tsx      # [新建] 向量设置界面
│   ├── SemanticSearchPanel.tsx      # [新建] 语义搜索界面
│   └── MemoryModal.tsx              # [修改] 集成搜索功能
└── App.tsx                          # [修改] 集成向量化
```

## 🔧 实施步骤

### Step 1: 更新类型定义 (types.ts)

```typescript
// 在 types.ts 末尾添加

// 向量化记忆条目
export interface VectorizedMemoryEntry {
  id: string;
  memoryId: string;
  memoryType: 'realtime' | 'small-summary' | 'large-summary';
  category: MemoryCategory;
  
  embedding: number[];
  embeddingModel: string;
  embeddingDimension: number;
  
  originalText: string;
  title: string;
  timestamp: string;
  realTimestamp: number;
  location?: string;
  involvedCharacters?: string[];
  
  vectorizedAt: number;
  vectorizationStatus: 'pending' | 'success' | 'failed';
  errorMessage?: string;
}

// 向量配置
export interface VectorConfig {
  enabled: boolean;
  apiUrl: string;
  apiKey: string;
  model: string;
  
  autoVectorize: boolean;
  vectorizeOnSummary: boolean;
  batchSize: number;
  
  similarityThreshold: number;
  maxResults: number;
  
  retryAttempts: number;
  cacheEnabled: boolean;
}

// 搜索结果
export interface SemanticSearchResult {
  entry: VectorizedMemoryEntry;
  similarity: number;
  originalMemory: MemoryEntry | MemorySummary;
}

// 向量存储
export interface VectorStore {
  vectors: VectorizedMemoryEntry[];
  config: VectorConfig;
  index: {
    lastUpdated: number;
    totalVectors: number;
    byCategory: Record<MemoryCategory, number>;
  };
}

// 更新 GameState
export interface GameState {
  // ... 现有字段
  vectorStore?: VectorStore; // 添加这一行
}
```

### Step 2: 创建向量化服务 (services/vectorService.ts)

```typescript
import { VectorConfig, VectorizedMemoryEntry } from '../types';

export class VectorService {
  private config: VectorConfig;
  
  constructor(config: VectorConfig) {
    this.config = config;
  }
  
  // 更新配置
  updateConfig(config: VectorConfig) {
    this.config = config;
  }
  
  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.vectorize("测试连接");
      return response.length > 0;
    } catch (error) {
      console.error('连接测试失败:', error);
      return false;
    }
  }
  
  // 向量化单个文本
  async vectorize(text: string): Promise<number[]> {
    if (!this.config.enabled || !this.config.apiKey) {
      throw new Error('向量化未启用或缺少API密钥');
    }
    
    try {
      const response = await fetch(`${this.config.apiUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          input: text,
          encoding_format: 'float'
        })
      });
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('向量化失败:', error);
      throw error;
    }
  }
  
  // 批量向量化
  async batchVectorize(texts: string[]): Promise<number[][]> {
    if (!this.config.enabled) {
      throw new Error('向量化未启用');
    }
    
    const batches = this.chunkArray(texts, this.config.batchSize);
    const results: number[][] = [];
    
    for (const batch of batches) {
      try {
        const batchResults = await Promise.all(
          batch.map(text => this.vectorize(text))
        );
        results.push(...batchResults);
      } catch (error) {
        console.error('批量向量化失败:', error);
        throw error;
      }
    }
    
    return results;
  }
  
  // 计算余弦相似度
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('向量维度不匹配');
    }
    
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  // 工具函数：分块数组
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// 导出默认配置
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
  
  retryAttempts: 3,
  cacheEnabled: true
};

// 创建单例
export const vectorService = new VectorService(defaultVectorConfig);
```

### Step 3: 创建向量存储服务 (services/vectorStorageService.ts)

```typescript
import { openDB, IDBPDatabase } from 'idb';
import { VectorizedMemoryEntry, VectorStore, MemoryCategory } from '../types';
import { defaultVectorConfig } from './vectorService';

class VectorStorageService {
  private dbName = 'xianxia-vector-db';
  private storeName = 'vectors';
  private dbPromise: Promise<IDBPDatabase> | null = null;
  
  private getDb(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.dbName, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('vectors')) {
            const store = db.createObjectStore('vectors', { keyPath: 'id' });
            store.createIndex('category', 'category');
            store.createIndex('memoryType', 'memoryType');
            store.createIndex('vectorizedAt', 'vectorizedAt');
          }
        },
      });
    }
    return this.dbPromise;
  }
  
  // 保存单个向量
  async saveVector(entry: VectorizedMemoryEntry): Promise<void> {
    const db = await this.getDb();
    await db.put(this.storeName, entry);
  }
  
  // 批量保存
  async batchSave(entries: VectorizedMemoryEntry[]): Promise<void> {
    const db = await this.getDb();
    const tx = db.transaction(this.storeName, 'readwrite');
    await Promise.all(entries.map(entry => tx.store.put(entry)));
    await tx.done;
  }
  
  // 获取所有向量
  async getAllVectors(): Promise<VectorizedMemoryEntry[]> {
    const db = await this.getDb();
    return await db.getAll(this.storeName);
  }
  
  // 按分类获取
  async getVectorsByCategory(category: MemoryCategory): Promise<VectorizedMemoryEntry[]> {
    const db = await this.getDb();
    return await db.getAllFromIndex(this.storeName, 'category', category);
  }
  
  // 获取向量存储统计
  async getStats(): Promise<VectorStore['index']> {
    const vectors = await this.getAllVectors();
    const byCategory: Record<MemoryCategory, number> = {
      '探索': 0, '战斗': 0, '商城': 0, '医馆': 0, '悬赏': 0,
      '培育': 0, '商业': 0, '声望': 0, '公告': 0, '其他': 0
    };
    
    vectors.forEach(v => {
      byCategory[v.category]++;
    });
    
    return {
      lastUpdated: Date.now(),
      totalVectors: vectors.length,
      byCategory
    };
  }
  
  // 删除向量
  async deleteVector(id: string): Promise<void> {
    const db = await this.getDb();
    await db.delete(this.storeName, id);
  }
  
  // 清空所有向量
  async clearAll(): Promise<void> {
    const db = await this.getDb();
    await db.clear(this.storeName);
  }
}

export const vectorStorageService = new VectorStorageService();
```

### Step 4: 创建语义搜索服务 (services/semanticSearchService.ts)

```typescript
import { MemoryCategory, SemanticSearchResult, VectorizedMemoryEntry } from '../types';
import { vectorService } from './vectorService';
import { vectorStorageService } from './vectorStorageService';

class SemanticSearchService {
  
  // 语义搜索
  async search(
    query: string,
    category?: MemoryCategory,
    topK: number = 20
  ): Promise<SemanticSearchResult[]> {
    try {
      // 1. 将查询向量化
      const queryVector = await vectorService.vectorize(query);
      
      // 2. 获取相关向量
      const vectors = category 
        ? await vectorStorageService.getVectorsByCategory(category)
        : await vectorStorageService.getAllVectors();
      
      if (vectors.length === 0) {
        return [];
      }
      
      // 3. 计算相似度
      const results = vectors.map(entry => {
        const similarity = vectorService.cosineSimilarity(queryVector, entry.embedding);
        return {
          entry,
          similarity,
          originalMemory: entry as any // 实际使用时需要关联原始记忆
        };
      });
      
      // 4. 过滤和排序
      const threshold = vectorService['config'].similarityThreshold;
      return results
        .filter(r => r.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
        
    } catch (error) {
      console.error('语义搜索失败:', error);
      throw error;
    }
  }
  
  // 查找相似记忆
  async findSimilar(
    memoryId: string,
    topK: number = 10
  ): Promise<SemanticSearchResult[]> {
    const vectors = await vectorStorageService.getAllVectors();
    const target = vectors.find(v => v.memoryId === memoryId);
    
    if (!target) {
      throw new Error('未找到目标记忆的向量');
    }
    
    const results = vectors
      .filter(v => v.id !== target.id)
      .map(entry => ({
        entry,
        similarity: vectorService.cosineSimilarity(target.embedding, entry.embedding),
        originalMemory: entry as any
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
    
    return results;
  }
}

export const semanticSearchService = new SemanticSearchService();
```

### Step 5: 更新常量配置 (constants.ts)

```typescript
import { defaultVectorConfig } from './services/vectorService';

// 在 initialGameState 中添加
export const initialGameState: GameState = {
  // ... 现有字段
  
  // 添加向量存储
  vectorStore: {
    vectors: [],
    config: defaultVectorConfig,
    index: {
      lastUpdated: 0,
      totalVectors: 0,
      byCategory: {
        '探索': 0, '战斗': 0, '商城': 0, '医馆': 0, '悬赏': 0,
        '培育': 0, '商业': 0, '声望': 0, '公告': 0, '其他': 0
      }
    }
  }
};
```

## 🎨 下一步

完成以上步骤后，你可以：

1. **创建UI组件**：
   - 向量设置界面 (VectorSettingsModal)
   - 语义搜索面板 (SemanticSearchPanel)

2. **集成到App.tsx**：
   - 添加向量化工作流
   - 在addMemory时自动向量化

3. **测试功能**：
   - 配置API
   - 向量化现有记忆
   - 尝试语义搜索

## 📝 使用示例

```typescript
// 在App.tsx中

// 1. 初始化向量服务
useEffect(() => {
  if (gameState.vectorStore?.config) {
    vectorService.updateConfig(gameState.vectorStore.config);
  }
}, [gameState.vectorStore?.config]);

// 2. 向量化新记忆
const addMemoryWithVector = async (
  category: MemoryCategory,
  title: string,
  content: string
) => {
  // 添加到记忆系统
  const memory = addMemory(category, title, content);
  
  // 如果启用自动向量化
  if (gameState.vectorStore?.config.autoVectorize) {
    try {
      const embedding = await vectorService.vectorize(content);
      const vectorEntry: VectorizedMemoryEntry = {
        id: `vec_${memory.id}`,
        memoryId: memory.id,
        memoryType: 'realtime',
        category,
        embedding,
        embeddingModel: gameState.vectorStore.config.model,
        embeddingDimension: embedding.length,
        originalText: content,
        title,
        timestamp: memory.timestamp,
        realTimestamp: memory.realTimestamp,
        vectorizedAt: Date.now(),
        vectorizationStatus: 'success'
      };
      
      await vectorStorageService.saveVector(vectorEntry);
    } catch (error) {
      console.error('向量化失败:', error);
    }
  }
};

// 3. 执行语义搜索
const handleSearch = async (query: string) => {
  const results = await semanticSearchService.search(query);
  console.log('搜索结果:', results);
};
```

## ⚡ 性能优化建议

1. **批量处理**：一次向量化多条记忆
2. **延迟向量化**：在用户空闲时处理
3. **向量缓存**：缓存常用查询结果
4. **索引优化**：为大数据集建立HNSW索引

## 🔍 故障排查

### 问题1：API调用失败
```typescript
// 检查：
// 1. API Key是否正确
// 2. 网络连接
// 3. API配额
```

### 问题2：搜索结果不准确
```typescript
// 调整：
// 1. 降低 similarityThreshold
// 2. 增加 maxResults
// 3. 尝试不同的模型
```

### 问题3：存储空间不足
```typescript
// 解决：
// 1. 启用降维
// 2. 定期清理旧向量
// 3. 只向量化重要记忆
```

## 📚 参考资源

- [OpenAI Embeddings文档](https://platform.openai.com/docs/guides/embeddings)
- [Ollama本地部署](https://ollama.ai/)
- [Cosine Similarity原理](https://en.wikipedia.org/wiki/Cosine_similarity)

---

**准备好了吗？** 让我们切换到 Code 模式开始实现！🚀