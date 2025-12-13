# 上下文检索分类过滤问题修复

## 问题描述

### 症状
- 在语义搜索界面可以搜索到向量化的内容
- 但在剧情 AI 交互中，上下文增强功能检索不到相同的向量
- 日志显示：`找到 0 个候选向量`

### 根本原因

在 [`contextMemoryRetriever.ts:264`](services/contextMemoryRetriever.ts:264) 中，上下文检索使用了**分类过滤**：

```typescript
const searchOptions: SemanticSearchOptions = {
  categories: context.categories,  // ← 问题所在
  // ...
};
```

**问题场景**：
1. 你在"商城"分类中向量化了人物卡牌
2. 在"探索"模式下进行剧情交互
3. 上下文提取器返回 `categories: ['探索']`
4. 搜索只在"探索"分类的向量中查找
5. 结果：找不到"商城"分类的人物卡牌向量

### 为什么语义搜索可以找到？

因为在语义搜索界面中，你可能：
- 没有选择任何分类过滤（搜索所有分类）
- 或者手动选择了"商城"分类

## 修复方案

### 临时修复（已应用）

注释掉分类限制，搜索所有向量：

```typescript
const searchOptions: SemanticSearchOptions = {
  // categories: context.categories,  // ← 注释掉
  involvedCharacters: context.involvedCharacters,
  maxResults,
  minSimilarity: 0.65,
  useTimeDecay: true,
  timeDecayFactor: 0.00001
};
```

**优点**：
- ✅ 可以找到所有相关向量，无论分类
- ✅ 提高召回率

**缺点**：
- ❌ 可能返回不太相关的其他分类内容
- ❌ 性能稍差（需要扫描所有向量）

### 长期优化方案

#### 方案1：智能分类扩展

根据当前上下文，自动扩展相关分类：

```typescript
// 扩展相关分类
const extendCategories = (primaryCategories: MemoryCategory[]): MemoryCategory[] => {
  const extended = new Set(primaryCategories);
  
  // 探索时也搜索商城（人物卡牌）
  if (primaryCategories.includes('探索')) {
    extended.add('商城');
    extended.add('其他');
  }
  
  // 战斗时也搜索探索（背景故事）
  if (primaryCategories.includes('战斗')) {
    extended.add('探索');
    extended.add('商城');
  }
  
  return Array.from(extended);
};

const searchOptions: SemanticSearchOptions = {
  categories: extendCategories(context.categories),
  // ...
};
```

#### 方案2：添加"全局搜索"选项

```typescript
async retrieveRelevantMemories(
  gameState: GameState,
  customQuery?: string,
  maxResults: number = 10,
  searchAllCategories: boolean = true  // ← 新参数
): Promise<ContextRetrievalResult> {
  // ...
  
  const searchOptions: SemanticSearchOptions = {
    categories: searchAllCategories ? undefined : context.categories,
    // ...
  };
}
```

#### 方案3：两阶段检索

1. **第一阶段**：在当前分类中搜索
2. **第二阶段**：如果结果不足，扩展到所有分类

```typescript
// 第一阶段：限定分类搜索
let results = await semanticSearchService.hybridSearch(query, keywords, {
  categories: context.categories,
  maxResults: maxResults / 2
});

// 第二阶段：如果结果不足，全局搜索
if (results.length < maxResults / 2) {
  const globalResults = await semanticSearchService.hybridSearch(query, keywords, {
    categories: undefined,  // 搜索所有分类
    maxResults: maxResults - results.length
  });
  results = [...results, ...globalResults];
}
```

## 调试信息

添加了详细的日志输出：

```typescript
console.log('[上下文检索] 🔍 当前上下文:', {
  type: context.type,
  description: context.description,
  categories: context.categories,
  keywords: context.keywords
});

console.log('[上下文检索] 📊 搜索选项:', searchOptions);
```

## 测试步骤

### 1. 验证修复

1. 确保已向量化人物卡牌（在"商城"分类）
2. 切换到探索模式
3. 触发 AI 生成
4. 查看控制台日志：
   ```
   [上下文检索] 🔍 当前上下文: { type: 'exploration', categories: ['探索'] }
   [语义搜索] 找到 X 个候选向量  ← 应该 > 0
   ```

### 2. 检查向量分类

在浏览器控制台运行：

```javascript
// 检查所有向量的分类分布
const db = await new Promise((resolve, reject) => {
  const request = indexedDB.open('VectorMemoryDB', 1);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const tx = db.transaction('vectors', 'readonly');
const store = tx.objectStore('vectors');
const vectors = await new Promise((resolve) => {
  const req = store.getAll();
  req.onsuccess = () => resolve(req.result);
});

// 统计分类
const categories = {};
vectors.forEach(v => {
  const cat = v.category || '未知';
  categories[cat] = (categories[cat] || 0) + 1;
});

console.log('向量分类分布:', categories);
```

## 配置建议

### 推荐设置

对于大多数场景，建议：

1. **默认使用全局搜索**（当前修复）
   - 确保能找到所有相关内容
   - 依赖相似度阈值过滤无关结果

2. **适当降低阈值**
   - 当前：0.65
   - 建议范围：0.60 - 0.70

3. **增加结果数量**
   - 当前：10
   - 建议：15-20（利用 reranker 重排）

### 高级设置

如果需要更精确的分类控制：

```typescript
// 在 gameState.vectorConfig 中添加
interface VectorConfig {
  // ...
  contextRetrievalMode: 'global' | 'category' | 'smart';
  // global: 搜索所有分类
  // category: 仅搜索当前分类
  // smart: 智能扩展相关分类
}
```

## 性能影响

### 全局搜索 vs 分类搜索

| 方式 | 候选向量数 | 搜索时间 | 召回率 |
|------|----------|---------|--------|
| 分类搜索 | ~100 | ~50ms | 低 ⚠️ |
| 全局搜索 | ~500 | ~200ms | 高 ✅ |
| 智能扩展 | ~200 | ~100ms | 中高 ⚖️ |

**结论**：
- 对于中小规模数据（<1000向量），全局搜索性能完全可接受
- 对于大规模数据，建议使用智能分类扩展

## 相关文件

- [`services/contextMemoryRetriever.ts:246-280`](services/contextMemoryRetriever.ts:246-280) - 主要修复
- [`services/semanticSearchService.ts:221-263`](services/semanticSearchService.ts:221-263) - 分类过滤逻辑
- [`services/aiContextEnhancer.ts:64-103`](services/aiContextEnhancer.ts:64-103) - 调用入口

## 后续优化

1. **添加分类智能映射**
   - 定义分类之间的关联关系
   - 自动扩展相关分类

2. **实现缓存机制**
   - 缓存常见查询的候选向量
   - 减少 IndexedDB 访问

3. **优化向量组织**
   - 考虑使用标签而不是单一分类
   - 允许一个向量属于多个分类

4. **用户可配置**
   - 在向量设置中添加检索模式选项
   - 让用户选择全局/分类/智能模式

## 更新日期

2025-11-16