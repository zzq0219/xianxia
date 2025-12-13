# AI世界书引用修复总结

## 问题描述

AI生成的内容没有正确引用之前的记忆和世界书条目。

## 根本原因

通过阅读 `@types/` 文件夹中的TavernHelper API类型定义，发现了关键问题：

### 问题1: 世界书获取方式错误

**错误代码** (在 `services/aiContextEnhancer.ts`):
```typescript
const worldbookNames = TavernHelper.getWorldbookNames();
```

**问题分析**:
- `getWorldbookNames()` 返回的是**所有存在的**世界书名称列表
- 但我们需要的是**当前激活的**世界书列表

**正确方式** (根据 `@types/function/worldbook.d.ts`):
```typescript
// 获取全局激活的世界书
const globalWorldbooks = TavernHelper.getGlobalWorldbookNames();

// 获取当前角色绑定的世界书
const charWorldbooks = TavernHelper.getCharWorldbookNames('current');
// 返回: { primary: string | null, additional: string[] }
```

## 解决方案

### 修复内容

修改了 `services/aiContextEnhancer.ts` 中的 `getRelevantWorldbookEntries()` 方法:

```typescript
// 获取当前激活的世界书（全局 + 角色绑定）
const globalWorldbooks = TavernHelper.getGlobalWorldbookNames();
const charWorldbooks = TavernHelper.getCharWorldbookNames('current');

// 合并所有激活的世界书
const worldbookNames = [
  ...globalWorldbooks,
  ...(charWorldbooks.primary ? [charWorldbooks.primary] : []),
  ...charWorldbooks.additional
];

// 去重
const uniqueWorldbooks = Array.from(new Set(worldbookNames));
```

### 修复后的工作流程

1. **获取全局世界书**: 通过 `getGlobalWorldbookNames()` 获取在SillyTavern中全局激活的世界书
2. **获取角色世界书**: 通过 `getCharWorldbookNames('current')` 获取当前角色卡绑定的世界书
3. **合并去重**: 将所有激活的世界书合并并去除重复项
4. **遍历获取**: 对每个激活的世界书调用 `await getWorldbook(name)` 获取条目
5. **条目匹配**: 根据条目的激活策略（constant/selective）和关键词进行匹配
6. **内容注入**: 将匹配的条目内容注入到AI生成的上下文中

## API使用说明

### 世界书相关API

根据 `@types/function/worldbook.d.ts`:

```typescript
// 获取所有世界书名称（包括未激活的）
getWorldbookNames(): string[]

// 获取全局激活的世界书
getGlobalWorldbookNames(): string[]

// 获取角色绑定的世界书
getCharWorldbookNames(character_name: 'current'): {
  primary: string | null,
  additional: string[]
}

// 获取世界书内容（异步！）
getWorldbook(worldbook_name: string): Promise<WorldbookEntry[]>
```

### 预设相关API

根据 `@types/function/preset.d.ts`:

```typescript
// 获取预设（同步）
getPreset(preset_name: 'in_use' | string): Preset

// 获取预设名称列表
getPresetNames(): string[]

// 获取当前加载的预设名称
getLoadedPresetName(): string
```

### AI生成相关API

根据 `@types/function/generate.d.ts`:

```typescript
// 使用当前预设生成
generate(config: GenerateConfig): Promise<string>

// 不使用预设，自定义提示词顺序
generateRaw(config: GenerateRawConfig): Promise<string>
```

## 关键发现

### 1. 世界书条目类型

根据 `WorldbookEntry` 类型定义:

```typescript
strategy: {
  type: 'constant' | 'selective' | 'vectorized';
  keys: (string | RegExp)[];
  // ...
}
```

- **constant (蓝灯🔵)**: 只要启用就会激活，无需关键词匹配
- **selective (绿灯🟢)**: 需要关键词在扫描文本中匹配才激活
- **vectorized (向量化🔗)**: 使用向量相似度激活（较少使用）

### 2. 世界书绑定层级

SillyTavern的世界书有三个绑定层级:

1. **全局世界书**: 对所有聊天生效
2. **角色主世界书**: 绑定到特定角色，优先级高
3. **角色附加世界书**: 绑定到特定角色的额外世界书

我们的修复确保了所有三个层级的世界书都会被正确读取和使用。

## 测试建议

### 测试步骤

1. **在SillyTavern中设置世界书**:
   - 创建一个测试世界书
   - 添加一些constant条目（蓝灯）
   - 添加一些selective条目（绿灯）并设置关键词
   
2. **绑定世界书**:
   - 方式1: 在设置中全局启用世界书
   - 方式2: 在角色卡中绑定世界书
   
3. **触发AI生成**:
   - 在游戏中执行需要AI生成的操作
   - 查看控制台日志，确认:
     - ✅ 世界书被正确识别和加载
     - ✅ 条目匹配逻辑正常工作
     - ✅ 内容被注入到提示词中
     
4. **检查生成结果**:
   - AI生成的内容应该引用世界书中的信息
   - 例如角色背景、地点描述等

### 预期日志输出

修复后，控制台应该显示:

```
[世界书] 📚 全局世界书: ['世界书A']
[世界书] 📚 角色主世界书: '世界书B'
[世界书] 📚 角色附加世界书: ['世界书C']
[世界书] 📚 合并后总数: 3
[世界书] 📋 激活的世界书列表: ['世界书A', '世界书B', '世界书C']
[世界书] 🔍 正在检查世界书: 世界书A
[世界书] 📖 世界书A 包含 10 个条目
[世界书] ✅ 匹配条目: 角色背景
[世界书] 📝 条目类型: constant
[世界书] ✅ 成功获取 5 个相关条目
```

## 相关文件

- `services/aiContextEnhancer.ts` - 主要修复文件
- `@types/function/worldbook.d.ts` - 世界书API类型定义
- `@types/function/preset.d.ts` - 预设API类型定义
- `@types/function/generate.d.ts` - 生成API类型定义
- `@types/iframe/exported.tavernhelper.d.ts` - TavernHelper入口

## 总结

这次修复的核心是**正确理解和使用TavernHelper API**。通过阅读类型定义文件，我们发现:

1. ❌ **之前**: 使用 `getWorldbookNames()` 获取所有世界书（包括未激活的）
2. ✅ **现在**: 使用 `getGlobalWorldbookNames()` + `getCharWorldbookNames()` 只获取激活的世界书

这确保了AI生成时只使用当前激活的世界书内容，避免了信息混乱和无关内容的注入。

---

**修复日期**: 2025-01-16
**修复文件**: `services/aiContextEnhancer.ts`
**问题类型**: API使用错误
**影响范围**: 所有AI生成功能的世界书引用