# Reranker重排序功能实现指南

## 概述

Reranker（重排序模型）是一个专门用于优化搜索结果排序的AI模型。本系统已完整集成Reranker功能，可以显著提高语义搜索的相关性和准确度。

## 功能特点

### 1. 两阶段检索架构

```
用户查询 → 向量检索(topKBeforeRerank) → Reranker重排序 → 最终结果(maxResults)
```

- **第一阶段**: 使用向量相似度快速检索大量候选结果（topKBeforeRerank，默认50条）
- **第二阶段**: 使用Reranker模型对候选结果进行精确重排序，返回最相关的结果（maxResults，默认20条）

### 2. 支持的Reranker服务

- **Jina AI Reranker**: 推荐使用，支持多语言
  - `jina-reranker-v2-base-multilingual` (推荐)
  - `jina-reranker-v1-base-en`
  - `jina-reranker-v1-turbo-en`

- **Cohere Rerank**: 企业级服务
  - `rerank-multilingual-v3.0`
  - `rerank-english-v3.0`
  - `rerank-multilingual-v2.0`

## 配置步骤

### 1. 打开向量设置

在记忆界面 → 总结设置 → 向量设置 → 重排模型标签

### 2. 配置Reranker

1. **启用Reranker**: 勾选"启用Reranker"选项
2. **API URL**: 输入Reranker API端点
   - Jina AI: `https://api.jina.ai/v1`
   - Cohere: `https://api.cohere.ai/v1`
3. **API Key**: 输入您的API密钥
4. **刷新模型**: 点击"🔄 刷新模型"按钮获取可用模型列表
5. **选择模型**: 从下拉列表中选择合适的模型

### 3. 调整检索参数

- **初筛候选数(topKBeforeRerank)**: 
  - 推荐设置为最终结果数的2-5倍
  - 例如：如果maxResults=20，则设置为50-100
  - 数值越大，召回率越高，但API成本越高

- **最终结果数(maxResults)**:
  - 推荐20-30条
  - 这是最终返回给AI的结果数量

## 使用场景

### 1. 搜索人名或特定实体

**问题**: 传统向量搜索对短文本（如人名）的检索效果不佳

**解决方案**: 
- 启用Reranker
- 设置较低的相似度阈值（0.3-0.5）
- 增加topKBeforeRerank（100-200）

**效果**: Reranker会根据查询上下文精确排序，显著提高人名搜索的准确度

### 2. 复杂语义查询

**问题**: "谁在哪里做了什么"这类复杂查询难以精确匹配

**解决方案**:
- Reranker可以理解查询的完整语义
- 对结果进行跨语言的精确重排序

### 3. 多语言混合搜索

**问题**: 中英文混合查询效果差

**解决方案**:
- 使用多语言Reranker模型
- 如`jina-reranker-v2-base-multilingual`

## 技术实现

### 核心文件

1. **`services/rerankerService.ts`**: Reranker服务实现
   - 支持Jina AI、Cohere和通用API
   - 批量处理大量文档
   - 自动错误恢复

2. **`services/semanticSearchService.ts`**: 集成Reranker的搜索流程
   - 第56-66行: Reranker集成逻辑
   - 自动检测是否启用Reranker

3. **`components/SummarySettingsModal.tsx`**: UI配置界面
   - 双标签页设计（嵌入模型 + Reranker）
   - 模型刷新功能
   - 参数配置

4. **`App.tsx`**: 配置同步
   - 第1822-1831行: 同步更新vectorService和rerankerService

### API调用流程

```typescript
// 1. 向量检索获取候选
const candidates = await vectorSearch(query, topKBeforeRerank);

// 2. Reranker重排序
if (rerankerEnabled) {
  const documents = candidates.map(c => c.text);
  const scores = await rerankerService.rerank(query, documents);
  
  // 3. 更新分数并重新排序
  results = candidates.map((c, i) => ({
    ...c,
    similarity: scores[i],
    originalSimilarity: c.similarity // 保留原始分数
  }));
  
  results.sort((a, b) => b.similarity - a.similarity);
}

// 4. 返回最终结果
return results.slice(0, maxResults);
```

## 性能优化

### 1. 批量处理

对于大量文档（>100条），使用批量Reranker:

```typescript
await rerankerService.batchRerank(query, documents, batchSize: 100);
```

### 2. 缓存策略

- 相同查询的结果会被缓存
- 减少重复API调用

### 3. 错误恢复

- Reranker失败时自动回退到向量搜索结果
- 不会影响整体搜索功能

## 成本考虑

### API调用成本

以Jina AI为例：
- 免费额度: 1M tokens/月
- 超出后: $0.02 per 1K requests

### 优化建议

1. **合理设置topKBeforeRerank**:
   - 不要盲目设置过大的值
   - 推荐：maxResults的2-3倍即可

2. **按需启用**:
   - 对于简单查询可以禁用Reranker
   - 对于复杂查询或重要搜索场景启用

3. **批量处理**:
   - 多个相似查询可以合并处理

## 故障排查

### 问题1: Reranker不生效

**检查清单**:
1. 确认"启用Reranker"已勾选
2. 检查API Key是否正确
3. 查看浏览器控制台是否有错误
4. 确认topKBeforeRerank > maxResults

### 问题2: 搜索结果反而变差

**可能原因**:
- topKBeforeRerank设置过小，好的结果未进入候选池
- Reranker模型不适合当前语言

**解决方案**:
- 增加topKBeforeRerank到100以上
- 更换为多语言模型

### 问题3: API调用失败

**检查**:
1. 网络连接是否正常
2. API端点是否正确
3. API Key是否有效且有余额

**日志查看**:
```javascript
// 浏览器控制台
console.log('应用Reranker重排序...');
console.log('Reranker完成，耗时 XXms');
```

## 最佳实践

### 1. 参数配置建议

```typescript
// 推荐配置
{
  topKBeforeRerank: 50,      // 初筛候选数
  maxResults: 20,            // 最终结果数
  similarityThreshold: 0.3,  // 较低的阈值，让Reranker决定相关性
  rerankerEnabled: true,
  rerankerModel: 'jina-reranker-v2-base-multilingual'
}
```

### 2. 使用场景选择

| 场景 | 是否启用Reranker | topKBeforeRerank | 说明 |
|------|----------------|------------------|------|
| 简单关键词查询 | ❌ | - | 向量搜索已足够 |
| 人名/实体搜索 | ✅ | 100-200 | 需要Reranker精确排序 |
| 复杂语义查询 | ✅ | 50-100 | 充分利用Reranker语义理解 |
| 多语言查询 | ✅ | 50-100 | 必须使用多语言模型 |

### 3. 调试技巧

在开发者工具中查看详细日志:

```javascript
// 搜索流程日志
正在向量化查询文本...
找到 XXX 个候选向量
应用Reranker重排序...
Reranker完成，耗时 XXms，返回 XX 个结果
```

## 更新日志

- **2025-01-16**: 
  - ✅ 完整实现Reranker服务
  - ✅ 集成到语义搜索流程
  - ✅ 添加UI配置界面
  - ✅ 支持模型刷新功能
  - ✅ 同步配置更新到所有服务

## 相关文档

- [向量记忆系统设计](VECTOR_MEMORY_DESIGN.md)
- [语义搜索调试指南](VECTOR_SEARCH_DEBUG_GUIDE.md)
- [Reranker快速开始](RERANKER_QUICK_START.md)
- [Reranker设置指南](RERANKER_SETUP_GUIDE.md)

## 技术支持

遇到问题请：
1. 查看浏览器控制台日志
2. 检查网络请求（开发者工具 → Network）
3. 参考故障排查章节
4. 查看相关文档

---

**最后更新**: 2025-01-16
**维护者**: Kilo Code