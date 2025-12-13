# AI增强生成使用指南

## 📋 概述

本项目已实现了**统一的AI增强生成系统**，确保每次AI调用都自动整合以下三大增强要素：

1. **🔓 酒馆破限预设** - 自动注入SillyTavern的jailbreak预设
2. **📚 世界书知识** - 自动检索相关的世界书条目
3. **🧠 向量化历史记忆** - 基于语义搜索的历史记忆检索

---

## 🎯 核心功能

### 自动增强的AI生成

所有`tavernService.ts`中的AI生成函数现在都支持可选的`gameState`参数。当提供`gameState`时，系统会自动：

- ✅ 提取并注入酒馆的破限预设内容
- ✅ 检索与当前上下文相关的世界书条目
- ✅ 使用向量搜索获取相关的历史记忆
- ✅ 将所有上下文整合到`ordered_prompts`中
- ✅ 在失败时自动降级到标准生成

---

## 📦 核心文件

### 1. `services/enhancedAIGenerator.ts`

统一的AI生成包装器服务，提供三个核心函数：

#### `enhancedGenerate(options)`
完整的增强生成函数，支持所有配置选项。

```typescript
import { enhancedGenerate } from './services/enhancedAIGenerator';

const result = await enhancedGenerate({
  systemInstruction: '你是一位仙侠RPG大师...',
  prompt: '请生成一个随机事件',
  gameState: currentGameState,
  includeVectorMemories: true,  // 是否包含向量记忆
  includePreset: true,           // 是否包含酒馆预设
  includeWorldbook: true,        // 是否包含世界书
  maxVectorResults: 5            // 最大向量结果数
});
```

#### `simpleGenerate(systemInstruction, prompt)`
简化版本，用于不需要上下文增强的场景。

```typescript
import { simpleGenerate } from './services/enhancedAIGenerator';

const result = await simpleGenerate(
  '系统提示词',
  '用户提示词'
);
```

#### `generateWithContext(systemInstruction, prompt, gameState)`
快速包装器，使用默认配置的增强生成。

```typescript
import { generateWithContext } from './services/enhancedAIGenerator';

const result = await generateWithContext(
  '系统提示词',
  '用户提示词',
  gameState
);
```

### 2. `services/tavernService.ts`

所有AI生成函数已更新，现在都接受可选的`gameState`参数：

```typescript
// ✅ 更新后的函数签名示例
export async function generateExplorationStep(
  storyHistory: string, 
  playerAction: string, 
  playerProfile: PlayerProfile,
  gameState?: GameState  // 👈 新增的可选参数
)

export async function generateRandomCharacter(
  rarity: Rarity,
  gameState?: GameState  // 👈 新增的可选参数
): Promise<CharacterCard>

export async function processCombatTurn(
  playerCard: BattleParticipant,
  opponentCard: BattleParticipant,
  playerAction: string,
  gameState?: GameState  // 👈 新增的可选参数
)
```

---

## 🚀 使用方法

### 方式一：通过gameState参数（推荐）

在调用任何AI生成函数时，传入`gameState`即可自动启用增强功能：

```typescript
// ❌ 旧方式（仅使用标准生成）
const character = await generateRandomCharacter('珍品');

// ✅ 新方式（自动增强生成）
const character = await generateRandomCharacter('珍品', gameState);
```

### 方式二：直接使用增强生成器

对于新的AI生成需求，可以直接使用`enhancedGenerate`：

```typescript
import { enhancedGenerate } from './services/enhancedAIGenerator';

const result = await enhancedGenerate({
  systemInstruction: `你是一位仙侠世界的NPC生成器...`,
  prompt: `请生成一个${location}的NPC`,
  gameState: currentGameState,
  includeVectorMemories: true,
  includePreset: true,
  includeWorldbook: true,
  maxVectorResults: 5
});
```

---

## 📊 已更新的函数列表

以下所有函数都已支持增强生成（通过可选的`gameState`参数）：

### 核心游戏生成
- ✅ `generateExplorationStep()` - 探索步骤生成
- ✅ `processCombatTurn()` - 战斗回合处理
- ✅ `generateRandomEvent()` - 随机事件生成

### 角色与物品生成
- ✅ `generateRandomCharacter()` - 随机角色生成
- ✅ `generateRandomEquipment()` - 随机装备生成
- ✅ `generateRandomSkill()` - 随机技能生成
- ✅ `generateRandomPet()` - 随机宠物生成

### 同人内容生成
- ✅ `generateDoujinCharacter()` - 同人角色生成
- ✅ `generateDoujinEquipment()` - 同人装备生成
- ✅ `generateDoujinSkill()` - 同人技能生成
- ✅ `generateDoujinPet()` - 同人宠物生成

### 系统功能生成
- ✅ `generateAnnouncements()` - 公告生成
- ✅ `generateReputationDetails()` - 声望详情生成
- ✅ `generateReputationStory()` - 声望故事生成

### 商业系统生成
- ✅ `generateBusinessEvent()` - 商业事件生成
- ✅ `generateStaffSurveillanceReport()` - 员工监视报告
- ✅ `generateStaffInteraction()` - 员工互动对话

### 特殊功能生成
- ✅ `generatePatient()` - 病人生成
- ✅ `generateBountyTarget()` - 悬赏目标生成
- ✅ `generateCultivationMonitoringText()` - 培育监控文本
- ✅ `generateCultivationResult()` - 培育结果生成
- ✅ `generateBountyLog()` - 悬赏日志生成
- ✅ `generateMemorySummary()` - 记忆总结生成（使用简单生成）

---

## ⚙️ 工作原理

### 增强生成流程

```
1. 用户调用AI生成函数（传入gameState）
         ↓
2. enhancedGenerate() 检查向量配置
         ↓
3. aiContextEnhancer.buildEnhancedContext()
   ├─→ extractPresetsContent() - 提取破限预设
   ├─→ getRelevantWorldbookEntries() - 获取世界书
   └─→ retrieveRelevantMemories() - 检索向量记忆
         ↓
4. 构建 ordered_prompts 数组：
   [系统提示词, 预设内容, 世界书, 向量记忆, 用户提示词]
         ↓
5. TavernHelper.generateRaw() 生成
         ↓
6. 返回结果
```

### 降级策略

如果增强生成失败（例如向量服务不可用），系统会自动降级：

```typescript
try {
  // 尝试增强生成
  return await enhancedGenerate({...});
} catch (error) {
  console.error('[增强生成] 失败，回退到标准生成:', error);
  // 降级到标准生成
  return await simpleGenerate(systemInstruction, prompt);
}
```

---

## 🔧 配置说明

### 向量配置要求

要启用增强生成，`gameState.vectorConfig`必须满足：

```typescript
{
  enabled: true,  // 必须启用
  apiEndpoint: 'https://api.example.com',
  apiKey: 'your-api-key',
  model: 'text-embedding-3-small',
  // ...其他配置
}
```

如果向量功能未启用，系统会自动使用标准生成模式。

### 增强选项配置

```typescript
interface EnhancedGenerateOptions {
  systemInstruction: string;      // 系统提示词
  prompt: string;                 // 用户提示词
  gameState?: GameState;          // 游戏状态
  includeVectorMemories?: boolean; // 是否包含向量记忆（默认true）
  includePreset?: boolean;        // 是否包含酒馆预设（默认true）
  includeWorldbook?: boolean;     // 是否包含世界书（默认true）
  maxVectorResults?: number;      // 最大向量结果数（默认5）
  shouldStream?: boolean;         // 是否流式输出（默认false）
}
```

---

## 📝 最佳实践

### 1. 始终传入gameState

对于所有需要上下文连贯性的AI生成，建议传入`gameState`：

```typescript
// ✅ 推荐
const event = await generateRandomEvent(location, playerProfile, gameState);

// ⚠️ 不推荐（缺少上下文）
const event = await generateRandomEvent(location, playerProfile);
```

### 2. 合理设置向量结果数

根据生成任务的复杂度调整`maxVectorResults`：

```typescript
// 简单任务：3-5个结果
const simple = await enhancedGenerate({
  ...,
  maxVectorResults: 3
});

// 复杂任务：5-10个结果
const complex = await enhancedGenerate({
  ...,
  maxVectorResults: 8
});
```

### 3. 选择性禁用增强

某些场景可能不需要所有增强功能：

```typescript
// 仅使用世界书，不使用向量记忆
const result = await enhancedGenerate({
  systemInstruction: '...',
  prompt: '...',
  gameState: gameState,
  includeVectorMemories: false,  // 禁用向量记忆
  includePreset: true,
  includeWorldbook: true
});
```

---

## 🐛 调试与日志

增强生成器提供详细的控制台日志：

```
[增强生成] 开始构建增强上下文...
[增强生成] 上下文构建完成，注入了 8 条额外提示
[增强生成] 开始AI生成，提示词数量: 10
[增强生成] 生成完成
```

如果遇到问题，检查控制台日志中的错误信息。

---

## ⚠️ 注意事项

1. **向量配置** - 确保`gameState.vectorConfig.enabled`为`true`
2. **API配置** - 确保酒馆API和向量API都已正确配置
3. **性能考虑** - 向量检索会增加生成时间，可根据需要调整`maxVectorResults`
4. **降级处理** - 系统会自动处理失败情况，无需手动处理
5. **向后兼容** - 所有现有调用仍然有效（不传gameState时使用标准生成）

---

## 📚 相关文档

- [`AI_CONTEXT_ENHANCEMENT_GUIDE.md`](./AI_CONTEXT_ENHANCEMENT_GUIDE.md) - AI上下文增强详细指南
- [`VECTOR_MEMORY_QUICK_START.md`](./VECTOR_MEMORY_QUICK_START.md) - 向量记忆快速入门
- [`VECTOR_SEARCH_DEBUG_GUIDE.md`](./VECTOR_SEARCH_DEBUG_GUIDE.md) - 向量搜索调试指南

---

## 🎉 总结

通过这次更新，所有AI生成调用现在都能自动享受：
- ✅ **破限预设** - 提升AI输出质量
- ✅ **世界书知识** - 保持设定一致性
- ✅ **历史记忆** - 增强上下文连贯性

只需在调用时传入`gameState`参数即可！