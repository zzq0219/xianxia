# AI 上下文集成完整指南

## 问题概述

如何在调用 AI 时同时发送：
1. **SillyTavern 预设** (Preset)
2. **世界书内容** (Worldbook Entries)
3. **向量化检索结果** (Vector Search Results)

## SillyTavern API 核心机制

### 1. generate() 函数的工作原理

根据 `@types/function/generate.d.ts`，[`generate()`](generate.d.ts:226) 函数使用**当前启用的预设**，并支持以下参数：

```typescript
await TavernHelper.generate({
  user_input: string,              // 用户输入
  should_stream: boolean,          // 是否流式传输
  overrides: Overrides,            // 覆盖预设中的特定提示词
  injects: InjectionPrompt[],      // 额外注入的提示词
  max_chat_history: 'all' | number, // 聊天历史数量
  custom_api: CustomApiConfig      // 自定义API配置
});
```

### 2. 三种集成方式

#### 方式一：使用 `generate()` + `injects`（推荐）

**特点**：
- ✅ 使用 SillyTavern 当前预设
- ✅ 自动包含预设中的所有系统提示词
- ✅ 通过 `injects` 注入向量记忆和世界书内容
- ✅ 世界书会根据激活策略自动触发

```typescript
// 1. 获取向量检索结果
const vectorResults = await semanticSearchService.search(userInput, {
  maxResults: 5,
  minSimilarity: 0.7
});

// 2. 格式化为提示词
const memoryContext = vectorResults
  .map(r => `[相关记忆] ${r.memory.text}`)
  .join('\n');

// 3. 准备注入提示词
const injects = [
  {
    role: 'system',
    content: `=== 相关历史记忆 ===\n${memoryContext}\n===================`,
    position: 'in_chat',  // 插入到聊天历史中
    depth: 0,             // 深度为0表示最近
    should_scan: true     // 允许世界书扫描这段内容
  }
];

// 4. 调用生成
const result = await TavernHelper.generate({
  user_input: userInput,
  injects: injects,
  should_stream: false
});
```

**工作流程**：
1. SillyTavern 加载当前预设的所有提示词
2. 预设中的世界书占位符 (`worldInfoBefore`, `worldInfoAfter`) 会自动激活相关世界书条目
3. `injects` 中的向量记忆会被插入到指定位置
4. 所有内容按预设定义的顺序组合发送给 AI

#### 方式二：使用 `overrides` 覆盖特定部分

**特点**：
- ✅ 可以完全控制某些提示词内容
- ⚠️ 会覆盖预设中对应的部分
- ✅ 适合需要动态替换某些固定内容的场景

```typescript
// 获取向量和世界书内容
const vectorContext = await getVectorContext(userInput);
const worldbookContext = await getWorldbookContext(userInput);

// 使用 overrides 覆盖
const result = await TavernHelper.generate({
  user_input: userInput,
  overrides: {
    // 覆盖"角色定义之前的世界书"位置
    world_info_before: worldbookContext,
    // 覆盖聊天历史，并注入向量记忆
    chat_history: {
      with_depth_entries: true,  // 仍然使用深度条目
      prompts: [
        { role: 'system', content: vectorContext },
        ...originalChatHistory  // 保留原始聊天历史
      ]
    }
  }
});
```

#### 方式三：使用 `generateRaw()` 完全自定义

**特点**：
- ✅ 完全控制提示词顺序和内容
- ❌ 不使用预设，需要手动构建所有提示词
- ⚠️ 世界书不会自动激活
- ✅ 适合需要完全自定义提示词结构的场景

```typescript
const result = await TavernHelper.generateRaw({
  user_input: userInput,
  ordered_prompts: [
    // 1. 系统提示
    { role: 'system', content: '你是一个修仙世界的AI助手...' },
    
    // 2. 世界书内容（手动获取）
    { role: 'system', content: await getWorldbookContext(userInput) },
    
    // 3. 角色定义
    'char_description',
    
    // 4. 向量记忆
    { role: 'system', content: await getVectorContext(userInput) },
    
    // 5. 聊天历史
    'chat_history',
    
    // 6. 用户输入
    'user_input'
  ]
});
```

## 实际实现方案

### 完整的集成服务（已实现）

你的 [`aiContextEnhancer.ts`](services/aiContextEnhancer.ts:8) 已经实现了方式一的完整流程：

```typescript
// services/aiContextEnhancer.ts

async generateWithEnhancedContext(
  gameState: GameState,
  userInput: string,
  options = {}
): Promise<string> {
  // 1. 构建增强上下文
  const context = await this.buildEnhancedContext(gameState, userInput, options);
  
  // 2. 准备注入提示词（包含向量记忆）
  const injects = context.injectedPrompts.map((prompt, i) => ({
    id: `enhanced_context_${i}`,
    role: prompt.role,
    content: prompt.content,
    position: 'in_chat',
    depth: 0,
    should_scan: true  // 关键：允许世界书扫描
  }));
  
  // 3. 调用生成（自动使用预设和世界书）
  return await TavernHelper.generate({
    user_input: context.userPrompt,
    injects: injects,
    should_stream: options.shouldStream || false,
    max_chat_history: 'all'
  });
}
```

### 关键点解析

#### 1. 预设的自动加载

调用 [`generate()`](generate.d.ts:226) 时：
- SillyTavern 自动加载 `'in_use'` 预设
- 预设中定义的 [`prompts`](preset.d.ts:61) 数组决定提示词顺序
- 系统提示词 (`main`, `nsfw`, `jailbreak` 等) 会被包含

#### 2. 世界书的自动激活

根据 [`@types/function/worldbook.d.ts`](worldbook.d.ts:64)：

```typescript
type WorldbookEntry = {
  strategy: {
    type: 'constant' | 'selective' | 'vectorized';
    keys: (string | RegExp)[];  // 激活关键词
    scan_depth: 'same_as_global' | number;  // 扫描深度
  };
  position: {
    type: 'before_character_definition' | 'after_character_definition' | ...;
  };
  content: string;
};
```

**激活逻辑**：
1. **常量条目** (`constant`)：总是激活
2. **可选条目** (`selective`)：扫描 `user_input` 和 `injects` 中的内容，匹配 `keys` 则激活
3. **向量化条目** (`vectorized`)：根据向量相似度激活

**关键设置**：在 `injects` 中设置 `should_scan: true` 可以让世界书扫描注入的向量记忆内容！

#### 3. 向量记忆的注入位置

```typescript
{
  position: 'in_chat',  // 插入到聊天历史中
  depth: 0,             // 深度（0=最新消息）
  should_scan: true     // 允许世界书扫描
}
```

**深度系统**：
- `depth: 0` - 插入在最后一条消息之前
- `depth: 1` - 插入在倒数第二条消息之前
- `depth: 2` - 插入在倒数第三条消息之前

## 最佳实践

### 1. 推荐的调用流程

```typescript
async function generateWithFullContext(
  gameState: GameState,
  userInput: string
) {
  // Step 1: 向量检索
  const vectorResults = await semanticSearchService.search(userInput, {
    categories: ['story', 'battle', 'character'],
    maxResults: 5,
    minSimilarity: 0.7
  });
  
  // Step 2: 格式化向量记忆
  const memoryContext = vectorResults
    .map((r, i) => `[记忆${i+1}] ${r.memory.text} (相似度: ${r.similarity.toFixed(2)})`)
    .join('\n\n');
  
  // Step 3: 准备注入
  const injects = [];
  
  if (memoryContext) {
    injects.push({
      role: 'system',
      content: `=== 相关历史记忆 ===\n${memoryContext}\n===================`,
      position: 'in_chat',
      depth: 0,
      should_scan: true  // 让世界书也能看到这些记忆
    });
  }
  
  // Step 4: 添加游戏状态上下文
  injects.push({
    role: 'system',
    content: buildGameStateContext(gameState),
    position: 'in_chat',
    depth: 0,
    should_scan: true
  });
  
  // Step 5: 调用生成（自动包含预设和世界书）
  return await TavernHelper.generate({
    user_input: userInput,
    injects: injects,
    should_stream: false
  });
}
```

### 2. 向量记忆的格式化建议

```typescript
function formatVectorMemories(results: SemanticSearchResult[]): string {
  if (results.length === 0) return '';
  
  const sections = [];
  
  sections.push('=== 相关历史记忆 ===');
  sections.push('');
  
  results.forEach((result, index) => {
    const memory = result.memory;
    sections.push(`【记忆 ${index + 1}】`);
    sections.push(`时间: ${new Date(memory.metadata.realTimestamp).toLocaleString()}`);
    sections.push(`分类: ${memory.metadata.category}`);
    sections.push(`相似度: ${(result.similarity * 100).toFixed(1)}%`);
    if (memory.metadata.involvedCharacters?.length > 0) {
      sections.push(`角色: ${memory.metadata.involvedCharacters.join('、')}`);
    }
    sections.push('');
    sections.push(memory.text);
    sections.push('');
  });
  
  sections.push('===================');
  
  return sections.join('\n');
}
```

### 3. 世界书条目的手动获取（可选）

如果需要手动控制世界书内容：

```typescript
async function getRelevantWorldbookEntries(
  query: string,
  options: {
    worldbookNames?: string[];
    includeConstant?: boolean;
  } = {}
): Promise<string> {
  const worldbooks = options.worldbookNames || 
                     TavernHelper.getWorldbookNames();
  
  const relevantEntries = [];
  
  for (const name of worldbooks) {
    const entries = await TavernHelper.getWorldbook(name);
    
    for (const entry of entries) {
      if (!entry.enabled) continue;
      
      // 常量条目
      if (entry.strategy.type === 'constant' && options.includeConstant) {
        relevantEntries.push(entry);
        continue;
      }
      
      // 关键词匹配
      if (entry.strategy.type === 'selective') {
        const keys = entry.strategy.keys || [];
        const queryLower = query.toLowerCase();
        
        for (const key of keys) {
          if (typeof key === 'string' && 
              queryLower.includes(key.toLowerCase())) {
            relevantEntries.push(entry);
            break;
          }
        }
      }
    }
  }
  
  return relevantEntries
    .map(e => `【${e.name}】\n${e.content}`)
    .join('\n\n');
}
```

## 调试和验证

### 1. 查看实际发送的提示词

```typescript
// 开启调试模式
const preset = TavernHelper.getPreset('in_use');
console.log('当前预设:', preset);
console.log('提示词顺序:', preset.prompts.map(p => p.id));

// 监听生成事件
eventOn(iframe_events.GENERATION_STARTED, (data) => {
  console.log('开始生成，ID:', data.generation_id);
  console.log('实际提示词:', data.prompts); // 如果API提供
});
```

### 2. 验证世界书激活

```typescript
// 测试世界书关键词匹配
const testQuery = '张三去了天剑宗';
const worldbook = await TavernHelper.getWorldbook('修仙世界');

worldbook.forEach(entry => {
  if (entry.strategy.type === 'selective') {
    const matched = entry.strategy.keys.some(key => 
      testQuery.toLowerCase().includes(key.toString().toLowerCase())
    );
    
    if (matched) {
      console.log(`激活条目: ${entry.name}`);
    }
  }
});
```

### 3. 测试向量检索质量

```typescript
async function testVectorRetrieval(query: string) {
  console.log('查询:', query);
  
  const results = await semanticSearchService.search(query, {
    maxResults: 5,
    minSimilarity: 0.7
  });
  
  console.log(`找到 ${results.length} 条相关记忆:`);
  results.forEach((r, i) => {
    console.log(`${i+1}. [${r.similarity.toFixed(3)}] ${r.memory.text.slice(0, 50)}...`);
  });
}
```

## 常见问题

### Q1: 为什么世界书没有激活？

**检查清单**：
1. ✅ 世界书条目是否 `enabled: true`
2. ✅ 关键词是否在 `user_input` 或 `injects` 中
3. ✅ `injects` 是否设置了 `should_scan: true`
4. ✅ `scan_depth` 是否足够大

### Q2: 向量记忆没有生效？

**可能原因**：
1. `gameState.vectorConfig.enabled` 为 `false`
2. 向量数据库为空
3. 相似度阈值 `minSimilarity` 设置过高
4. API 配置错误

### Q3: 内容重复或冲突？

**解决方案**：
1. 避免在 `overrides` 和 `injects` 中重复注入相同内容
2. 使用 `overrides.chat_history.with_depth_entries: false` 禁用深度条目
3. 合理设置 `max_chat_history` 限制历史长度

## 性能优化

### 1. 缓存向量检索结果

```typescript
const vectorCache = new Map<string, SemanticSearchResult[]>();

async function getCachedVectorResults(query: string, ttl = 60000) {
  const cached = vectorCache.get(query);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.results;
  }
  
  const results = await semanticSearchService.search(query);
  vectorCache.set(query, { results, timestamp: Date.now() });
  
  return results;
}
```

### 2. 批量预加载世界书

```typescript
const worldbookCache = new Map<string, WorldbookEntry[]>();

async function preloadWorldbooks(names: string[]) {
  for (const name of names) {
    if (!worldbookCache.has(name)) {
      const entries = await TavernHelper.getWorldbook(name);
      worldbookCache.set(name, entries);
    }
  }
}
```

### 3. 异步并发获取

```typescript
async function buildContextParallel(gameState: GameState, userInput: string) {
  const [vectorResults, worldbookContext, gameContext] = await Promise.all([
    semanticSearchService.search(userInput),
    getWorldbookContext(userInput),
    Promise.resolve(buildGameStateContext(gameState))
  ]);
  
  return { vectorResults, worldbookContext, gameContext };
}
```

## 总结

**推荐方案**：使用 [`generate()`](generate.d.ts:226) + `injects` 方式

**优势**：
1. ✅ 自动使用 SillyTavern 预设配置
2. ✅ 世界书自动激活（基于关键词）
3. ✅ 向量记忆通过 `injects` 灵活注入
4. ✅ 保持 SillyTavern 的完整功能
5. ✅ 简单易用，维护成本低

**最终效果**：
```
[预设系统提示] 
↓
[世界书条目（自动激活）]
↓
[角色定义]
↓
[向量记忆注入]
↓
[聊天历史]
↓
[游戏状态上下文]
↓
[用户输入]
```

所有内容按正确顺序组合，发送给 AI 模型，实现最佳的上下文增强效果！