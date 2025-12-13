# AI上下文集成V2 - 使用示例

本文档提供完全重构后的AI上下文集成系统的使用示例。

## 核心架构

重构后的系统包含以下核心模块：

1. **类型定义** ([`aiContextTypes.ts`](services/aiContextTypes.ts:1)) - 完整的类型系统
2. **上下文构建器** ([`aiContextBuilder.ts`](services/aiContextBuilder.ts:1)) - 负责构建注入提示词
3. **AI生成服务** ([`aiGenerationService.ts`](services/aiGenerationService.ts:1)) - 统一的生成接口
4. **增强服务V2** ([`aiContextEnhancer.v2.ts`](services/aiContextEnhancer.v2.ts:1)) - 高级封装
5. **工具函数V2** ([`aiIntegrationUtils.v2.ts`](services/aiIntegrationUtils.v2.ts:1)) - 便捷函数

## 基础使用

### 1. 最简单的调用方式

```typescript
import { quickGenerate } from './services/aiIntegrationUtils.v2';

// 最简单的调用，自动启用向量记忆和游戏状态
const result = await quickGenerate(gameState, '你好，介绍一下当前情况');
console.log(result);
```

### 2. 按场景类型生成

```typescript
import { enhanceGameInteraction } from './services/aiIntegrationUtils.v2';

// 剧情场景
const storyResult = await enhanceGameInteraction(
  gameState,
  '描述玩家进入天剑宗的场景',
  'story'
);

// 战斗场景
const battleResult = await enhanceGameInteraction(
  gameState,
  '描述战斗开始',
  'battle',
  { maxVectorResults: 3 }
);

// 医馆场景
const hospitalResult = await enhanceGameInteraction(
  gameState,
  '描述问诊过程',
  'hospital'
);
```

### 3. 流式生成

```typescript
import { streamGenerate } from './services/aiIntegrationUtils.v2';

const fullText = await streamGenerate(
  gameState,
  '讲述一个修仙故事',
  (token) => {
    // 实时接收生成的文本片段
    console.log('接收到:', token);
    // 可以在这里更新UI
  }
);

console.log('完整文本:', fullText);
```

## 高级使用

### 4. 自定义配置生成

```typescript
import { aiContextEnhancerV2 } from './services/aiContextEnhancer.v2';

const result = await aiContextEnhancerV2.generateWithEnhancedContext(
  gameState,
  '描述战斗',
  {
    includeVectorMemories: true,
    includePreset: true,
    includeWorldbook: true,
    includeGameState: true,
    maxVectorResults: 10,
    categories: ['战斗', '探索'], // 限制记忆分类
    shouldStream: false,
  }
);
```

### 5. 使用自定义API

```typescript
import { aiContextEnhancerV2 } from './services/aiContextEnhancer.v2';

const result = await aiContextEnhancerV2.generateWithCustomAPI(
  gameState,
  '生成内容',
  {
    apiurl: 'https://your-api.com/v1/chat/completions',
    key: 'your-api-key',
    model: 'gpt-4',
  },
  {
    includeVectorMemories: true,
    maxVectorResults: 5,
    shouldStream: false,
  }
);
```

### 6. 按分类生成

```typescript
import { aiContextEnhancerV2 } from './services/aiContextEnhancer.v2';

// 只使用战斗相关的历史记忆
const battleResult = await aiContextEnhancerV2.generateByCategory(
  gameState,
  '描述战斗场景',
  ['战斗'],
  5
);

// 使用探索和角色相关的记忆
const storyResult = await aiContextEnhancerV2.generateByCategory(
  gameState,
  '继续剧情',
  ['探索', '其他'],
  7
);
```

## 底层API使用

### 7. 直接使用AI生成服务

```typescript
import { aiGenerationService } from './services/aiGenerationService';
import { AIGenerationConfig } from './services/aiContextTypes';

const config: AIGenerationConfig = {
  userInput: '你的提示词',
  shouldStream: false,
  
  vectorMemory: {
    enabled: true,
    maxResults: 5,
    minSimilarity: 0.7,
    depth: 0,
    shouldScan: true, // 关键：允许世界书扫描
  },
  
  gameStateContext: {
    enabled: true,
    include: {
      playerInfo: true,
      location: true,
      party: true,
      battleStatus: true,
      reputation: false,
    },
    depth: 0,
  },
  
  worldbook: {
    manualInject: false, // 依赖自动激活
    includeConstant: false,
    includeSelective: false,
  },
  
  preset: {
    useCurrentPreset: true,
    extractSystemPrompts: false,
  },
};

const result = await aiGenerationService.generate(gameState, config);
```

### 8. 只使用预设生成（不添加额外上下文）

```typescript
import { aiGenerationService } from './services/aiGenerationService';

const result = await aiGenerationService.generateWithPresetOnly(
  '你的提示词',
  {
    shouldStream: false,
    maxChatHistory: 50,
  }
);
```

## 记忆检索

### 9. 检索相关记忆

```typescript
import { retrieveRelevantMemories } from './services/aiIntegrationUtils.v2';

const memories = await retrieveRelevantMemories(
  gameState,
  '张三在天剑宗的经历',
  10
);

console.log('找到记忆:', memories.relevantMemories.length);
console.log('查询:', memories.query);
console.log('上下文:', memories.context);
console.log('搜索耗时:', memories.searchTime, 'ms');
```

### 10. 检索角色历史

```typescript
import { retrieveCharacterHistory } from './services/aiIntegrationUtils.v2';

const history = await retrieveCharacterHistory(
  gameState,
  '李四',
  5
);

for (const memory of history) {
  console.log(`[${memory.memory.category}] ${memory.memory.text}`);
  console.log(`相似度: ${(memory.similarity * 100).toFixed(1)}%`);
}
```

### 11. 格式化记忆

```typescript
import { formatMemoriesAsText, retrieveRelevantMemories } from './services/aiIntegrationUtils.v2';

const memories = await retrieveRelevantMemories(gameState, '战斗', 5);
const formattedText = formatMemoriesAsText(memories.relevantMemories);

console.log(formattedText);
// 输出：
// === 相关历史记忆 ===
// 
// 【探索】第一天，黄昏
// 地点：天剑宗
// 相关角色：张三、李四
// 内容：张三在天剑宗与李四切磋...
// 相似度：85.3%
// ...
```

## 事件监听

### 12. 监听生成事件

```typescript
import { aiContextEnhancerV2 } from './services/aiContextEnhancer.v2';

// 监听生成开始
const unsubscribeStart = aiContextEnhancerV2.onGeneration('started', (data) => {
  console.log('生成开始:', data);
});

// 监听流式传输
const unsubscribeStream = aiContextEnhancerV2.onGeneration('streaming', (data) => {
  console.log('接收流式数据:', data.text);
});

// 监听生成完成
const unsubscribeComplete = aiContextEnhancerV2.onGeneration('completed', (data) => {
  console.log('生成完成:', data);
});

// 执行生成
await aiContextEnhancerV2.quickGenerate(gameState, '测试', true);

// 取消监听
unsubscribeStart();
unsubscribeStream();
unsubscribeComplete();
```

## 预设管理

### 13. 切换预设

```typescript
import { switchAIPreset, getAIServiceStatus } from './services/aiIntegrationUtils.v2';

// 获取当前状态
const status = getAIServiceStatus();
console.log('当前预设:', status.preset);
console.log('可用预设:', status.availablePresets);

// 切换预设
const success = await switchAIPreset('我的自定义预设');
if (success) {
  console.log('预设切换成功');
}
```

## 批量生成

### 14. 批量处理多个提示词

```typescript
import { batchGenerate } from './services/aiIntegrationUtils.v2';

const prompts = [
  '描述早晨的场景',
  '描述中午的场景',
  '描述傍晚的场景',
];

const results = await batchGenerate(gameState, prompts, 'story');

results.forEach((result, index) => {
  console.log(`场景${index + 1}:`, result);
});
```

## 专用场景生成

### 15. 战斗场景生成

```typescript
import { generateForBattle } from './services/aiIntegrationUtils.v2';

const battleNarration = await generateForBattle(
  gameState,
  '张三使用技能"天剑斩"攻击李四'
);
```

### 16. 剧情场景生成

```typescript
import { generateForStory } from './services/aiIntegrationUtils.v2';

const story = await generateForStory(
  gameState,
  '玩家来到了神秘的山洞'
);
```

### 17. 医馆场景生成

```typescript
import { generateForHospital } from './services/aiIntegrationUtils.v2';

const consultation = await generateForHospital(
  gameState,
  '病患描述症状'
);
```

## 状态检查

### 18. 检查系统可用性

```typescript
import { shouldUseVectorEnhancement, getVectorStatusSummary } from './services/aiIntegrationUtils.v2';
import { aiContextEnhancerV2 } from './services/aiContextEnhancer.v2';

// 检查AI服务
if (!aiContextEnhancerV2.isAvailable()) {
  console.error('AI服务不可用');
  return;
}

// 检查向量增强
if (shouldUseVectorEnhancement(gameState)) {
  console.log('向量增强已启用');
  console.log(getVectorStatusSummary(gameState));
} else {
  console.log('向量增强未启用，将使用标准生成');
}
```

## 错误处理

### 19. 完整的错误处理示例

```typescript
import { quickGenerate } from './services/aiIntegrationUtils.v2';

try {
  const result = await quickGenerate(gameState, '你的提示词');
  console.log('生成成功:', result);
} catch (error) {
  if (error.message.includes('TavernHelper未定义')) {
    console.error('请在SillyTavern环境中运行');
  } else if (error.message.includes('向量化')) {
    console.error('向量服务错误:', error);
  } else {
    console.error('AI生成失败:', error);
  }
  
  // 降级处理：显示默认内容
  console.log('使用默认内容');
}
```

## 性能优化

### 20. 并发生成（谨慎使用）

```typescript
import { aiGenerationService } from './services/aiGenerationService';

// 为每个生成任务分配唯一ID
const tasks = [
  {
    id: 'gen-1',
    config: { userInput: '提示词1', generationId: 'gen-1' },
  },
  {
    id: 'gen-2',
    config: { userInput: '提示词2', generationId: 'gen-2' },
  },
];

const results = await Promise.all(
  tasks.map(task => 
    aiGenerationService.generate(gameState, task.config)
  )
);

console.log('所有生成完成:', results);
```

## 迁移指南

### 21. 从旧版API迁移

```typescript
// 旧版 (aiContextEnhancer.ts)
import { aiContextEnhancer } from './services/aiContextEnhancer';
const oldResult = await aiContextEnhancer.generateWithEnhancedContext(
  gameState,
  'prompt',
  { includeVectorMemories: true }
);

// 新版 (aiContextEnhancer.v2.ts) - API相同，实现改进
import { aiContextEnhancerV2 } from './services/aiContextEnhancer.v2';
const newResult = await aiContextEnhancerV2.generateWithEnhancedContext(
  gameState,
  'prompt',
  { includeVectorMemories: true }
);

// 或者使用更简洁的工具函数
import { quickGenerate } from './services/aiIntegrationUtils.v2';
const result = await quickGenerate(gameState, 'prompt');
```

## 调试技巧

### 22. 启用详细日志

所有模块都会输出详细的控制台日志，格式为 `[模块名] 信息`：

```typescript
// 查看上下文构建过程
// [AI生成] 开始生成，用户输入: ...
// [上下文构建] 注入 5 条向量记忆
// [上下文构建] 注入游戏状态上下文
// [AI生成] 上下文构建完成: {...}
// [AI生成] 调用TavernHelper.generate...
// [AI生成] 生成完成，长度: 1234
```

### 23. 验证注入内容

```typescript
import { aiContextBuilder } from './services/aiContextBuilder';
import { AIGenerationConfig } from './services/aiContextTypes';

const config: AIGenerationConfig = {
  userInput: '测试',
  vectorMemory: { enabled: true, maxResults: 3, minSimilarity: 0.7, depth: 0, shouldScan: true },
  gameStateContext: { enabled: true, include: { playerInfo: true, location: true, party: true, battleStatus: true, reputation: false }, depth: 0 },
};

const context = await aiContextBuilder.buildContext(gameState, config);

console.log('注入数量:', context.injects.length);
console.log('向量记忆:', context.metadata.vectorMemoryCount);
console.log('游戏状态:', context.metadata.gameStateInjected);
console.log('构建耗时:', context.metadata.buildTime, 'ms');

// 查看实际注入的内容
context.injects.forEach(inject => {
  console.log(`\n[${inject.id}] role=${inject.role}, depth=${inject.depth}`);
  console.log(inject.content.substring(0, 200) + '...');
});
```

## 总结

新的V2系统提供了：

1. ✅ **更清晰的架构** - 职责分离，易于维护
2. ✅ **更强大的类型系统** - 完整的TypeScript支持
3. ✅ **更灵活的配置** - 细粒度控制每个功能
4. ✅ **向后兼容** - 保持相同的API接口
5. ✅ **更好的性能** - 优化的上下文构建流程
6. ✅ **完整的错误处理** - 降级处理和详细日志

推荐优先使用 [`aiIntegrationUtils.v2.ts`](services/aiIntegrationUtils.v2.ts:1) 中的便捷函数，它们为常见场景提供了最佳实践。