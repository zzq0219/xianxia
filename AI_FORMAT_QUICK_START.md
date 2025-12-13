# AI 格式化工具 - 快速开始

## 🎯 一分钟上手

### 1. 导入需要的函数

```typescript
import { generateNPCDialogue } from './services/aiFormat';
```

### 2. 调用函数生成内容

```typescript
const dialogue = await generateNPCDialogue('生成一段修仙对话');
```

### 3. 使用返回的数据

```typescript
console.log(dialogue.speaker);    // 说话人
console.log(dialogue.dialogue);   // 对话内容
console.log(dialogue.emotion);    // 情绪
```

## 📦 可用的预定义函数

```typescript
import {
  generateNPCDialogue,        // NPC对话
  generateBattleNarrative,    // 战斗描述
  generateItemDescription,    // 物品描述
  generateEventDescription,   // 事件描述
  generateQuestDescription,   // 任务描述
  // ... 更多函数见 AI_FORMAT_GUIDE.md
} from './services/aiFormat';
```

## 🔧 自定义格式

```typescript
import { z } from 'zod';
import { formattedGenerate } from './services/aiFormat';

// 1. 定义格式
const MySchema = z.object({
  title: z.string(),
  content: z.string(),
});

// 2. 生成
const result = await formattedGenerate({
  userInput: '生成内容',
  schema: MySchema,
  defaultValues: { content: '' },
});
```

## ✨ 核心优势

- ✅ **自动格式化** - AI 响应自动转为 JSON
- ✅ **智能补全** - 自动补充缺失字段
- ✅ **自动重试** - 失败自动重试 3 次
- ✅ **类型安全** - 完整的 TypeScript 类型支持
- ✅ **零额外成本** - 格式化是纯代码处理，不调用 AI

## 📚 详细文档

查看 `AI_FORMAT_GUIDE.md` 了解更多功能和示例。

## 🧪 运行示例

```typescript
import { examples } from './services/aiFormat';

// 运行所有示例
await examples.runAllExamples();

// 或运行单个示例
await examples.example1_NPCDialogue();
```

## 🎉 开始使用

现在您可以在项目中任何需要 AI 生成内容的地方使用这些工具，享受自动格式化的便利！