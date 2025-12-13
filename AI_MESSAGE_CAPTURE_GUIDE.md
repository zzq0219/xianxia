# AI消息自动捕获功能使用指南

## 功能概述

本系统实现了自动捕获SillyTavern中AI生成的所有消息，并将其自动保存到游戏的记忆系统中。无论在哪个界面生成的消息，都会被智能分类并存储。

## 核心功能

### 1. 自动消息捕获
- **实时监听**：监听SillyTavern的所有AI消息生成事件
- **全局捕获**：无论在探索、战斗、问诊还是其他任何界面，所有AI生成的消息都会被捕获
- **流式支持**：支持流式传输和普通生成两种模式

### 2. 智能分类系统

系统会根据两个维度自动对消息进行分类：

#### 场景优先分类
当前界面/场景会优先决定分类：
- **探索界面** → `探索`类别
- **战斗界面** → `战斗`类别  
- **问诊界面** → `问诊`类别
- **商业界面** → `商业`类别
- **悬赏界面** → `悬赏`类别
- **培育界面** → `培育`类别
- **地图/交互** → `交互`类别

#### 关键词辅助分类
如果无法从场景判断，系统会分析消息内容中的关键词：

- **探索**：探索、发现、前往、到达、离开、进入、出发、地图、位置、区域、场景
- **战斗**：战斗、攻击、防御、技能、释放、造成、受到、伤害、击败、胜利、失败、敌人、怪物、对手
- **问诊**：问诊、诊断、治疗、医治、症状、病情、药物、处方、康复、伤势、疾病
- **商业**：交易、购买、出售、价格、金币、灵石、商店、商人、买卖、交换、货物
- **悬赏**：悬赏、任务、委托、接取、完成、奖励、目标、追捕、调查
- **培育**：修炼、突破、提升、境界、灵力、功法、炼丹、炼器、培养、成长、进阶
- **交互**：对话、交谈、询问、回答、说道、表示、告诉、聊天、沟通、交流
- **其他**：无法分类的消息

### 3. 记忆存储

每条捕获的消息会被保存为：
```typescript
{
  id: "memory-{timestamp}-{random}",
  category: MemoryCategory,
  title: "AI生成: {消息前30个字符}...",
  content: "{完整消息内容}",
  timestamp: "{游戏时间}",
  realTimestamp: {真实时间戳},
  location: "{当前位置}",
  involvedCharacters: [] // 可扩展
}
```

## 技术实现

### 核心服务：`aiMessageCapture.ts`

```typescript
// 设置消息回调
aiMessageCapture.setMessageCallback((message, category) => {
  // 自动保存到记忆系统
  addMemory(category, title, content);
});

// 注册事件监听器
aiMessageCapture.registerEventListeners();

// 更新当前场景
aiMessageCapture.setCurrentScene('exploration');
```

### 监听的事件

1. **SillyTavern酒馆事件**：
   - `tavern_events.MESSAGE_RECEIVED` - AI消息接收完成
   - `tavern_events.GENERATION_ENDED` - 生成结束
   - `tavern_events.CHARACTER_MESSAGE_RENDERED` - 消息渲染完成

2. **Iframe事件**：
   - `iframe_events.GENERATION_ENDED` - Iframe生成结束
   - `iframe_events.STREAM_TOKEN_RECEIVED_FULLY` - 流式传输完整文本

## 使用方法

### 在SillyTavern环境中

1. **自动启用**：系统会在游戏加载时自动初始化
2. **查看记忆**：点击底部栏的"记忆"按钮，打开记忆宝鉴
3. **分类浏览**：在记忆宝鉴中可以按类别查看所有捕获的AI消息

### 测试方法

1. 在SillyTavern中打开游戏
2. 在任意界面触发AI生成（如探索、战斗、问诊等）
3. 打开记忆宝鉴，查看对应类别是否有新记录
4. 查看浏览器控制台，应该能看到类似日志：
   ```
   [AI消息捕获] 开始注册事件监听器...
   [App] 初始化AI消息捕获服务...
   [App] 捕获到AI消息，类别: 探索
   ```

### 非SillyTavern环境

如果在非SillyTavern环境中（如本地开发），事件监听会失败，但不会影响游戏运行。你可以：

1. **手动测试**：
   ```typescript
   aiMessageCapture.captureMessage("这是一条测试消息，包含探索和发现的内容", "exploration");
   ```

2. **模拟AI生成**：在代码中直接调用 `addMemory()` 函数

## 配置选项

### 启用/禁用捕获
```typescript
aiMessageCapture.setEnabled(true);  // 启用
aiMessageCapture.setEnabled(false); // 禁用
```

### 自定义场景
```typescript
aiMessageCapture.setCurrentScene('custom_scene');
```

## 自动总结集成

捕获的消息会自动参与记忆系统的总结功能：

- 每累积设定数量的记忆，自动生成**小总结**
- 每累积设定数量的小总结，自动生成**大总结**
- 可在"总结设置"中配置自动总结参数

## 注意事项

1. **性能影响**：每条AI消息都会被捕获和存储，建议定期清理旧记忆
2. **存储限制**：每个类别最多保存100条实时记忆
3. **分类准确性**：分类基于场景和关键词，可能不是100%准确
4. **SillyTavern版本**：需要SillyTavern支持相关事件（推荐v1.13.2+）

## 调试技巧

### 查看捕获日志
打开浏览器控制台（F12），查看以下日志：
```
[AI消息捕获] 事件监听器注册完成
[App] 捕获到AI消息，类别: {category}
[AI消息捕获] 接收到消息 #{messageId}
```

### 检查事件监听状态
```typescript
// 在浏览器控制台中执行
console.log(window.eventOn); // 应该存在
console.log(window.tavern_events); // 应该存在
```

### 手动触发测试
```typescript
// 在浏览器控制台中执行
aiMessageCapture.captureMessage("测试消息：探索了一个神秘的洞穴", "exploration");
```

## 未来扩展

可能的改进方向：

1. **角色提取**：从消息内容中自动提取涉及的角色名称
2. **情感分析**：分析消息的情感倾向
3. **重要性评分**：为消息打分，优先保存重要内容
4. **去重机制**：避免重复保存相同或相似的消息
5. **导出功能**：将捕获的消息导出为文本或JSON格式

## 常见问题

**Q: 为什么没有捕获到消息？**
A: 检查是否在SillyTavern环境中，查看控制台是否有错误日志。

**Q: 消息分类不准确怎么办？**
A: 可以在记忆宝鉴中手动删除错误分类的消息，或在代码中调整关键词映射。

**Q: 如何清空所有捕获的消息？**
A: 在记忆宝鉴中，每个类别都有"清空此类别"按钮。

**Q: 性能会受影响吗？**
A: 捕获过程是异步的，对性能影响很小。但大量消息存储可能增加内存使用。

## 技术支持

如有问题或建议，请查看：
- 源代码：`services/aiMessageCapture.ts`
- 集成代码：`App.tsx` (第185-220行，第568-640行)
- 类型定义：`types.ts`