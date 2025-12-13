# 向量化记忆系统设计方案

## 📋 概述

为仙侠卡牌RPG游戏的记忆系统添加向量化能力，实现对历史记录的深层次语义理解和智能检索。通过将文本记忆转换为向量embeddings，可以进行相似度搜索、主题聚类、智能推荐等高级功能。

## 🎯 核心目标

1. **深层次记录**：捕获记忆的语义信息，而非仅存储文本
2. **智能检索**：基于语义相似度检索相关记忆，而非关键词匹配
3. **细节保留**：向量化保留所有细节信息的语义表示
4. **灵活配置**：支持自定义向量化API服务（URL + API Key）

## 🏗️ 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     游戏记忆系统                              │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐   ┌────────────┐   ┌────────────┐         │
│  │ 实时记录    │   │  小总结     │   │  大总结     │         │
│  │ (文本)     │   │  (文本)    │   │  (文本)    │         │
│  └─────┬──────┘   └─────┬──────┘   └─────┬──────┘         │
│        │                │                │                  │
│        └────────────────┴────────────────┘                  │
│                        ↓                                     │
│        ┌───────────────────────────────┐                   │
│        │   向量化引擎 (Vectorizer)      │                   │
│        │   - API调用                   │                   │
│        │   - 批量处理                  │                   │
│        │   - 错误重试                  │                   │
│        └───────────────┬───────────────┘                   │
│                        ↓                                     │
│        ┌───────────────────────────────┐                   │
│        │   向量存储 (Vector Store)      │                   │
│        │   - IndexedDB/LocalStorage    │                   │
│        │   - 向量索引                  │                   │
│        │   - 元数据关联                │                   │
│        └───────────────┬───────────────┘                   │
│                        ↓                                     │
│        ┌───────────────────────────────┐                   │
│        │   语义搜索引擎                 │                   │
│        │   - 余弦相似度计算             │                   │
│        │   - Top-K检索                 │                   │
│        │   - 混合搜索                  │                   │
│        └───────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 数据结构设计

### 1. 向量化记忆条目 (VectorizedMemoryEntry)

```typescript
interface VectorizedMemoryEntry {
  // 基础信息
  id: string;                    // 原始记忆ID
  memoryType: 'realtime' | 'small-summary' | 'large-summary';
  category: MemoryCategory;
  
  // 向量数据
  embedding: number[];           // 向量表示 (例如: 1536维)
  embeddingModel: string;        // 使用的模型 (例如: "text-embedding-3-small")
  embeddingDimension: number;    // 向量维度
  
  // 元数据
  originalText: string;          // 原始文本
  title: string;                 // 标题
  timestamp: string;             // 游戏时间
  realTimestamp: number;         // 真实时间戳
  location?: string;             // 地点
  involvedCharacters?: string[]; // 相关角色
  
  // 向量化信息
  vectorizedAt: number;          // 向量化时间戳
  vectorizationStatus: 'pending' | 'success' | 'failed';
  errorMessage?: string;         // 错误信息（如果失败）
}
```

### 2. 向量化配置 (VectorConfig)

```typescript
interface VectorConfig {
  // API配置
  enabled: boolean;              // 是否启用向量化
  apiUrl: string;                // API基础URL
  apiKey: string;                // API密钥
  model: string;                 // 使用的模型名称
  
  // 向量化策略
  autoVectorize: boolean;        // 自动向量化新记忆
  vectorizeOnSummary: boolean;   // 总结时自动向量化
  batchSize: number;             // 批量处理大小
  
  // 搜索配置
  similarityThreshold: number;   // 相似度阈值 (0-1)
  maxResults: number;            // 最大返回结果数
  hybridSearch: boolean;         // 是否启用混合搜索（向量+关键词）
  
  // 高级设置
  retryAttempts: number;         // 失败重试次数
  cacheEnabled: boolean;         // 启用向量缓存
  dimensionReduction?: {         // 降维配置（可选）
    enabled: boolean;
    targetDimension: number;
    method: 'pca' | 'svd';
  };
}
```

### 3. 向量存储结构 (VectorStore)

```typescript
interface VectorStore {
  vectors: {
    [category in MemoryCategory]: {
      realtime: VectorizedMemoryEntry[];
      smallSummary: VectorizedMemoryEntry[];
      largeSummary: VectorizedMemoryEntry[];
    }
  };
  
  // 向量索引（用于快速检索）
  index: {
    lastUpdated: number;
    totalVectors: number;
    byCategory: Record<MemoryCategory, number>;
  };
  
  // 配置
  config: VectorConfig;
}
```

## 🔧 核心服务实现

### 1. 向量化服务 (services/vectorService.ts)

```typescript
class VectorService {
  private config: VectorConfig;
  private queue: VectorizeTask[] = [];
  private processing: boolean = false;
  
  // 生成向量
  async vectorize(text: string): Promise<number[]> {
    const response = await fetch(`${this.config.apiUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        input: text
      })
    });
    
    const data = await response.json();
    return data.embedding;
  }
  
  // 批量向量化
  async batchVectorize(texts: string[]): Promise<number[][]> {
    // 实现批量处理逻辑
  }
  
  // 计算余弦相似度
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  // 语义搜索
  async semanticSearch(
    query: string,
    category?: MemoryCategory,
    topK: number = 10
  ): Promise<SearchResult[]> {
    // 1. 将查询向量化
    const queryVector = await this.vectorize(query);
    
    // 2. 获取相关向量集合
    const vectors = category 
      ? this.getVectorsByCategory(category)
      : this.getAllVectors();
    
    // 3. 计算相似度
    const similarities = vectors.map(entry => ({
      entry,
      similarity: this.cosineSimilarity(queryVector, entry.embedding)
    }));
    
    // 4. 排序并返回Top-K
    return similarities
      .filter(s => s.similarity >= this.config.similarityThreshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}
```

### 2. 向量存储服务 (services/vectorStorageService.ts)

```typescript
class VectorStorageService {
  private dbName = 'xianxia-vector-db';
  private storeName = 'vectors';
  
  // 保存向量
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
  
  // 查询向量
  async getVectorsByCategory(
    category: MemoryCategory
  ): Promise<VectorizedMemoryEntry[]> {
    const db = await this.getDb();
    const all = await db.getAll(this.storeName);
    return all.filter(v => v.category === category);
  }
  
  // 获取所有向量
  async getAllVectors(): Promise<VectorizedMemoryEntry[]> {
    const db = await this.getDb();
    return await db.getAll(this.storeName);
  }
}
```

## 🎨 UI组件设计

### 1. 向量化设置面板 (VectorSettingsModal)

```typescript
// 功能：
// - API配置（URL、Key、模型选择）
// - 向量化策略设置
// - 搜索参数配置
// - 连接测试
// - 向量统计展示
```

### 2. 语义搜索界面

```typescript
// 功能：
// - 搜索输入框
// - 分类筛选
// - 相似度滑块
// - 搜索结果列表（显示相似度分数）
// - 结果高亮显示
// - 跳转到原始记忆
```

### 3. 向量化状态指示器

```typescript
// 功能：
// - 显示向量化进度
// - 显示待处理队列
// - 显示失败项
// - 重试按钮
```

## 🔄 自动化工作流

### 1. 新记忆自动向量化

```typescript
// 当新记忆添加时
addMemory() {
  // 1. 保存到记忆系统
  // 2. 如果启用自动向量化
  if (vectorConfig.autoVectorize) {
    // 3. 加入向量化队列
    vectorService.enqueue({
      id: memory.id,
      text: memory.content,
      category: memory.category
    });
  }
}
```

### 2. 总结时批量向量化

```typescript
// 生成总结后
generateSummary() {
  // 1. 生成总结
  const summary = await aiService.summarize(...);
  
  // 2. 如果启用总结向量化
  if (vectorConfig.vectorizeOnSummary) {
    // 3. 向量化总结和相关记忆
    await vectorService.batchVectorize([
      summary,
      ...sourceMemories
    ]);
  }
}
```

### 3. 后台批量处理

```typescript
// 批量向量化未处理的记忆
async processVectorQueue() {
  const pending = await getPendingMemories();
  const batches = chunk(pending, vectorConfig.batchSize);
  
  for (const batch of batches) {
    try {
      await vectorService.batchVectorize(batch);
    } catch (error) {
      // 记录错误，稍后重试
      logFailedBatch(batch, error);
    }
  }
}
```

## 🚀 实现优先级

### Phase 1: 核心功能 (MVP)
1. ✅ 向量化API集成
2. ✅ 基础向量存储
3. ✅ 简单语义搜索
4. ✅ 配置界面

### Phase 2: 自动化
5. 自动向量化新记忆
6. 批量处理队列
7. 错误处理和重试

### Phase 3: 高级功能
8. 混合搜索（向量+关键词）
9. 向量索引优化
10. 聚类和主题分析
11. 智能推荐

## 💡 使用场景示例

### 场景1：查找相似经历
```
用户搜索："和神秘女子的对话"
系统返回：
  1. [探索] 与白衣女子的邂逅 (相似度: 0.92)
  2. [医馆] 诊治女患者的经历 (相似度: 0.87)
  3. [声望] 救助少女的传闻 (相似度: 0.81)
```

### 场景2：主题追踪
```
用户搜索："修炼突破"
系统返回所有与修炼突破相关的记忆，按相似度排序
```

### 场景3：角色关系网络
```
基于向量相似度，构建角色之间的关系图谱
```

## 📝 API接口设计

### 推荐的Embedding API

```typescript
// 1. OpenAI兼容接口
POST https://api.openai.com/v1/embeddings
{
  "model": "text-embedding-3-small",
  "input": "要向量化的文本",
  "encoding_format": "float"
}

// 2. 本地部署方案
// - Ollama + nomic-embed-text
// - FastEmbed
// - Sentence Transformers
```

### 配置示例

```typescript
const defaultConfig: VectorConfig = {
  enabled: true,
  apiUrl: 'https://api.openai.com/v1',
  apiKey: 'your-api-key',
  model: 'text-embedding-3-small',
  autoVectorize: true,
  vectorizeOnSummary: true,
  batchSize: 10,
  similarityThreshold: 0.7,
  maxResults: 20,
  hybridSearch: false,
  retryAttempts: 3,
  cacheEnabled: true
};
```

## ⚠️ 注意事项

1. **API成本**：向量化需要调用API，注意控制成本
2. **存储空间**：向量数据较大（每条1536维 ≈ 6KB），需要监控存储
3. **性能优化**：大量向量搜索可能较慢，需要索引优化
4. **隐私安全**：API Key需要加密存储
5. **离线支持**：考虑本地向量化方案

## 🎯 成功指标

- ✅ 搜索准确率 > 85%
- ✅ 响应时间 < 2秒
- ✅ 向量化成功率 > 95%
- ✅ 用户满意度提升

---

**版本**: v1.0  
**创建日期**: 2025-01-15  
**状态**: 设计阶段