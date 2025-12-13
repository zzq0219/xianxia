# AI上下文增强集成指南

本指南说明如何在游戏的各个交互点集成向量记忆，以提升AI生成的质量和连贯性。

## 核心服务

### 1. aiIntegrationUtils.ts
提供便捷的集成函数：

```typescript
import { enhanceGameInteraction, retrieveRelevantMemories } from '../services/aiIntegrationUtils';

// 增强AI生成
const response = await enhanceGameInteraction(
    gameState,
    userInput,
    'story',  // 交互类型
    {
        maxVectorResults: 5,
        includePreset: true,
        includeWorldbook: true
    }
);
```

### 2. aiContextEnhancer.ts
底层AI上下文增强服务，自动整合：
- 向量化记忆
- SillyTavern预设
- 世界书条目
- 游戏状态上下文

### 3. contextMemoryRetriever.ts
上下文感知的记忆检索，根据当前游戏场景自动检索相关历史。

## 集成步骤

### 步骤1：导入工具函数

```typescript
import { 
    enhanceGameInteraction, 
    retrieveRelevantMemories,
    shouldUseVectorEnhancement 
} from '../services/aiIntegrationUtils';
```

### 步骤2：在AI生成前调用

**示例1：剧情互动（StoryDisplay.tsx）**

```typescript
// 原来的代码
const generateStory = async () => {
    const response = await TavernHelper.generate({
        user_input: playerAction
    });
    // ...
};

// 增强后的代码
const generateStory = async () => {
    const response = await enhanceGameInteraction(
        gameState,
        playerAction,
        'story',
        { maxVectorResults: 5 }
    );
    // ...
};
```

**示例2：战斗解说（ActionNarrator.tsx）**

```typescript
const generateBattleNarration = async (action: string) => {
    // 先检索相关战斗记忆
    const memories = await retrieveRelevantMemories(
        gameState,
        `战斗: ${action}`,
        3
    );
    
    // 使用增强生成
    const narration = await enhanceGameInteraction(
        gameState,
        `请描述以下战斗动作: ${action}`,
        'battle',
        { maxVectorResults: 3 }
    );
    
    return narration;
};
```

**示例3：商城抽卡（Shop.tsx）**

```typescript
import { retrieveCharacterHistory } from '../services/aiIntegrationUtils';

// 抽到新卡后
const handleGachaResult = async (card: CharacterCard) => {
    // 检索该角色的历史记忆
    const history = await retrieveCharacterHistory(
        gameState,
        card.name,
        3
    );
    
    if (history.length > 0) {
        console.log(`找到 ${card.name} 的 ${history.length} 条历史记忆`);
        // 可以在UI中展示这些历史，或者用于生成欢迎语
    }
    
    // 生成角色登场描述
    const description = await enhanceGameInteraction(
        gameState,
        `${card.name}加入了队伍`,
        'shop',
        { maxVectorResults: 3 }
    );
};
```

**示例4：医馆问诊（ConsultationScreen.tsx）**

```typescript
const handleConsultation = async (symptoms: string) => {
    const diagnosis = await enhanceGameInteraction(
        gameState,
        `患者症状: ${symptoms}，请进行诊断和开方`,
        'hospital',
        { maxVectorResults: 5 }
    );
    
    return diagnosis;
};
```

### 步骤3：错误处理和降级

```typescript
try {
    // 尝试使用向量增强
    if (shouldUseVectorEnhancement(gameState)) {
        response = await enhanceGameInteraction(gameState, input, 'story');
    } else {
        // 降级到标准生成
        response = await TavernHelper.generate({ user_input: input });
    }
} catch (error) {
    console.error('AI生成失败:', error);
    // 提供默认内容或错误提示
    response = '抱歉，AI生成遇到问题...';
}
```

## 最佳实践

### 1. 何时使用向量增强

✅ **应该使用的场景：**
- 剧情对话和互动
- 战斗描述和解说
- 角色互动
- 重要事件描述
- 需要连贯性的内容

❌ **不需要使用的场景：**
- 简单的UI文本
- 数值计算结果
- 固定的系统消息
- 性能敏感的场景

### 2. 控制检索数量

```typescript
// 快速交互：少量记忆
maxVectorResults: 3

// 重要剧情：中等记忆
maxVectorResults: 5

// 复杂场景：较多记忆
maxVectorResults: 10
```

### 3. 性能优化

```typescript
// 缓存检索结果
const memoryCache = new Map();

async function getCachedMemories(key: string) {
    if (memoryCache.has(key)) {
        return memoryCache.get(key);
    }
    
    const memories = await retrieveRelevantMemories(gameState, key);
    memoryCache.set(key, memories);
    return memories;
}
```

### 4. 用户反馈

```typescript
// 在UI中显示向量化状态
import { getVectorStatusSummary } from '../services/aiIntegrationUtils';

const statusText = getVectorStatusSummary(gameState);
// "向量化功能已启用 (text-embedding-3-small)"
```

## 测试验证

### 测试清单

- [ ] 向量化功能启用/禁用时都能正常工作
- [ ] 无API密钥时能正常降级
- [ ] 错误时不会崩溃，有友好提示
- [ ] 生成内容参考了历史记忆
- [ ] 性能可接受（增强生成应在5秒内完成）

### 测试步骤

1. **启用向量化并配置API**
   - 打开设置，启用向量化
   - 配置OpenAI或Ollama API

2. **创建测试记忆**
   - 进行一些游戏互动
   - 在记忆界面向量化这些记忆

3. **测试增强生成**
   - 进行相关的游戏互动
   - 观察AI生成是否参考了历史
   - 检查浏览器控制台的日志

4. **测试降级处理**
   - 禁用向量化功能
   - 确认仍能正常生成内容

## 常见问题

### Q: 如何知道AI是否使用了向量记忆？

A: 检查浏览器控制台日志：
```
[AI集成] 开始增强story互动的AI上下文
[记忆检索] 找到 3 条相关记忆
[AI集成] story互动AI生成完成
```

### Q: 向量增强会增加多少延迟？

A: 通常增加0.5-2秒，取决于：
- 向量检索数量
- API响应速度
- 记忆数据库大小

### Q: 如何调试向量记忆问题？

A: 
1. 打开浏览器开发者工具 -> Application -> IndexedDB -> XianxiaVectorStore
2. 查看存储的向量数据
3. 检查metadata是否包含正确的location和involvedCharacters

### Q: 为什么搜索不到某些记忆？

A: 可能的原因：
1. 记忆未向量化
2. 相似度阈值太高（默认0.7）
3. metadata中缺少关键字段
4. 分类过滤排除了该记忆

## 进阶用法

### 自定义记忆权重

```typescript
const memories = await retrieveRelevantMemories(gameState, query, 10);

// 根据时间和相似度重新排序
const weighted = memories.sort((a, b) => {
    const scoreA = a.similarity * 0.7 + (1 - a.memory.metadata.realTimestamp / Date.now()) * 0.3;
    const scoreB = b.similarity * 0.7 + (1 - b.memory.metadata.realTimestamp / Date.now()) * 0.3;
    return scoreB - scoreA;
});
```

### 分类筛选

```typescript
const battleMemories = await semanticSearchService.search(query, {
    categories: ['战斗'],
    maxResults: 5
});
```

### 角色筛选

```typescript
const characterMemories = await semanticSearchService.search(query, {
    involvedCharacters: ['小舞', '唐三'],
    maxResults: 5
});
```

## 总结

向量记忆增强可以显著提升AI生成的质量和连贯性。关键是：

1. ✅ 在关键交互点集成增强
2. ✅ 确保记忆包含完整的metadata
3. ✅ 做好错误处理和降级
4. ✅ 合理控制检索数量
5. ✅ 定期测试和验证

遵循本指南，你的游戏AI将能够：
- 记住历史事件和角色关系
- 生成更连贯的剧情
- 提供更个性化的体验
- 保持角色一致性