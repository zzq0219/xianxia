# AI 格式化工具使用指南

## 📖 概述

本工具系统确保所有 AI 生成的内容都能自动格式化为严格的 JSON 格式，解决 AI 响应格式不一致的问题。

## 🎯 核心功能

1. **自动提取** - 从混乱的 AI 响应中提取 JSON (7种策略)
2. **智能补全** - 自动补充缺失的字段
3. **格式验证** - 确保数据符合预定义的 Schema
4. **自动重试** - 格式错误时自动重试（默认3次）

## 📦 文件结构

```
services/
├── aiFormatProcessor.ts      # 核心处理工具类
├── aiFormatSchemas.ts        # 预定义的数据格式 Schema
└── formattedGenerate.ts      # 格式化的 generate 包装函数
```

## 🚀 快速开始

### 基础用法

```typescript
import { generateNPCDialogue } from './services/formattedGenerate';

// 生成 NPC 对话
const dialogue = await generateNPCDialogue('生成一段修仙者之间的对话');

console.log(dialogue);
// 输出: {
//   speaker: "张三",
//   dialogue: "道友，这修仙之路艰难啊",
//   emotion: "平静",
//   relationshipChange: 0
// }
```

### 更多示例

```typescript
import {
  generateBattleNarrative,
  generateItemDescription,
  generateEventDescription,
} from './services/formattedGenerate';

// 战斗描述
const battle = await generateBattleNarrative('生成一场激烈的战斗');

// 物品描述
const item = await generateItemDescription('生成一把神兵');

// 事件描述
const event = await generateEventDescription('生成一个随机事件');
```

## 📋 预定义函数列表

| 函数名 | 用途 | 返回类型 |
|--------|------|----------|
| `generateSimpleText` | 简单文本 | `SimpleText` |
| `generateNPCDialogue` | NPC对话 | `NPCDialogue` |
| `generateBattleNarrative` | 战斗描述 | `BattleNarrative` |
| `generateItemDescription` | 物品描述 | `ItemDescription` |
| `generateSkillDescription` | 技能描述 | `SkillDescription` |
| `generateEventDescription` | 事件描述 | `EventDescription` |
| `generateCharacterDescription` | 角色描述 | `CharacterDescription` |
| `generateLocationDescription` | 地点描述 | `LocationDescription` |
| `generateQuestDescription` | 任务描述 | `QuestDescription` |
| `generateCultivationInsight` | 修炼感悟 | `CultivationInsight` |
| `generateBattleResult` | 战斗结果 | `BattleResult` |

## 🔧 自定义 Schema

```typescript
import { z } from 'zod';
import { formattedGenerate } from './services/formattedGenerate';

// 定义自定义格式
const CustomSchema = z.object({
  title: z.string(),
  content: z.string(),
  priority: z.number(),
});

// 使用
const result = await formattedGenerate({
  userInput: '生成一个公告',
  schema: CustomSchema,
  defaultValues: { priority: 1 },
  maxRetries: 3,
});
```

## 🎨 实际应用示例

### 在 React 组件中使用

```typescript
import React, { useState } from 'react';
import { generateNPCDialogue } from './services/formattedGenerate';

function DialogueGenerator() {
  const [dialogue, setDialogue] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateNPCDialogue('生成宗门长老的训诫');
      setDialogue(result);
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        生成对话
      </button>
      {dialogue && (
        <div>
          <p><strong>{dialogue.speaker}:</strong> {dialogue.dialogue}</p>
          <p>情绪: {dialogue.emotion}</p>
        </div>
      )}
    </div>
  );
}
```

## 🛠️ 工具原理

### 1. AIFormatExtractor (提取工具)

从混乱文本中提取 JSON，使用7种策略:
- 纯 JSON 直接解析
- 代码块提取 (\`\`\`json...\`\`\`)
- 第一个/最后一个对象
- 标记提取
- 多行处理
- 数组提取

### 2. AIFormatCompleter (补全工具)

智能补充缺失字段:
- 使用预定义默认值
- 根据类型自动填充
- 支持嵌套对象

### 3. AIFormatProcessor (处理器)

组合提取、补全、验证的完整流程，支持自动重试。

## 💡 最佳实践

1. **优先使用预定义函数** - 已配置好默认值和格式指令
2. **合理设置重试次数** - 默认3次，复杂场景可增加到5次
3. **提供清晰的 prompt** - 有助于 AI 生成正确格式
4. **处理异常** - 始终使用 try-catch 捕获错误

## 📊 错误处理

```typescript
try {
  const result = await generateNPCDialogue('生成对话');
} catch (error) {
  console.error('生成失败:', error.message);
  // 可以展示默认内容或重新尝试
}
```

## 🚀 迁移指南

将现有代码从直接使用 `generate` 迁移到格式化版本:

### 之前 (无格式保证):
```typescript
const response = await generate({ user_input: '生成对话' });
// 需要手动解析和验证
```

### 之后 (自动格式化):
```typescript
const dialogue = await generateNPCDialogue('生成对话');
// 自动格式化、验证、补全
```

## 📞 技术支持

遇到问题时:
1. 检查 Schema 定义是否正确
2. 查看控制台的详细错误信息
3. 尝试增加重试次数
4. 确认 generate 函数可用

---

**注意**: 所有格式化工具都是**纯代码处理**，不会额外调用 AI，只在生成内容时调用一次 AI API。