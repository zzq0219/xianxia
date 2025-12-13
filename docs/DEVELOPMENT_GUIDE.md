# 仙侠卡牌RPG - 开发实践指南

> 📅 生成日期: 2024-12-12
> 🔖 版本: 1.0.0
> 🎯 目标读者: 项目开发者、维护者

---

## 目录

1. [开发环境配置](#1-开发环境配置)
2. [项目结构规范](#2-项目结构规范)
3. [编码规范](#3-编码规范)
4. [组件开发指南](#4-组件开发指南)
5. [服务层开发指南](#5-服务层开发指南)
6. [AI集成最佳实践](#6-ai集成最佳实践)
7. [常见问题与解决方案](#7-常见问题与解决方案)
8. [设计模式应用](#8-设计模式应用)

---

## 1. 开发环境配置

### 1.1 环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | 推荐使用 LTS 版本 |
| npm | >= 9.0.0 | 或使用 pnpm/yarn |
| VS Code | 最新版 | 推荐IDE |

### 1.2 快速开始

```bash
# 1. 克隆项目
git clone <repository-url>
cd xianxia-card-rpg

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 构建生产版本
npm run build
```

### 1.3 VS Code 推荐扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "jock.svg"
  ]
}
```

### 1.4 环境变量配置

本项目不使用 `.env` 文件，所有配置通过以下方式管理：

1. **向量API配置**: 通过游戏内设置界面配置
2. **SillyTavern集成**: 自动从宿主环境获取

---

## 2. 项目结构规范

### 2.1 目录结构

```
xianxia-card-rpg/
├── App.tsx                 # 主应用组件（状态管理中心）
├── index.tsx               # 应用入口
├── types.ts                # 核心类型定义
├── constants.ts            # 常量与初始数据
├── locations.ts            # 地图位置数据
│
├── components/             # UI组件
│   ├── Modal.tsx           # 基础模态框
│   ├── ResponsiveModal.tsx # 响应式模态框
│   ├── [Feature]Modal.tsx  # 功能模态框
│   └── examples/           # 示例组件
│
├── services/               # 业务服务
│   ├── tavernService.ts    # 核心游戏服务
│   ├── vectorService.ts    # 向量化服务
│   └── [feature]Service.ts # 功能服务
│
├── hooks/                  # React Hooks
│   ├── useIframeHeightSync.ts
│   └── useResponsiveLayout.ts
│
├── types/                  # 扩展类型定义
│   └── etiquette.ts
│
├── @types/                 # SillyTavern API类型
│   ├── function/           # 函数API类型
│   └── iframe/             # iframe通信类型
│
└── docs/                   # 文档目录
```

### 2.2 文件命名规范

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| 组件 | PascalCase | `CharacterCard.tsx` |
| 服务 | camelCase + Service | `tavernService.ts` |
| Hook | use + PascalCase | `useIframeHeightSync.ts` |
| 类型 | PascalCase | `types.ts` |
| 常量 | UPPER_SNAKE_CASE | `CARD_SELL_PRICES` |

### 2.3 导入顺序规范

```typescript
// 1. React 相关
import React, { useState, useEffect, useCallback } from 'react';

// 2. 第三方库
import { z } from 'zod';

// 3. 类型定义
import { GameState, CharacterCard } from '../types';

// 4. 服务
import { generateExplorationStep } from '../services/tavernService';

// 5. 组件
import { Modal } from './Modal';

// 6. 工具函数
import { formatDate } from '../utils';

// 7. 样式（如有）
import './styles.css';
```

---

## 3. 编码规范

### 3.1 TypeScript 规范

#### 类型定义优先

```typescript
// ✅ 好的做法：明确的类型定义
interface CharacterCardProps {
  card: CharacterCard;
  onSelect: (card: CharacterCard) => void;
  isSelected?: boolean;
}

const CharacterCardDisplay: React.FC<CharacterCardProps> = ({ 
  card, 
  onSelect, 
  isSelected = false 
}) => {
  // ...
};

// ❌ 避免：any 类型
const handleData = (data: any) => { /* ... */ };
```

#### 使用类型守卫

```typescript
// ✅ 类型守卫
const isCharacterCard = (item: CharacterCard | PetCard): item is CharacterCard => {
  return 'skills' in item && Array.isArray(item.skills);
};

// 使用
if (isCharacterCard(item)) {
  console.log(item.skills); // TypeScript 知道这是 CharacterCard
}
```

### 3.2 React 规范

#### 使用函数组件和Hooks

```typescript
// ✅ 函数组件
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<StateType>(initialState);
  
  const handleAction = useCallback(() => {
    // 处理逻辑
  }, [dependencies]);
  
  useEffect(() => {
    // 副作用
    return () => {
      // 清理
    };
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
};
```

#### 状态管理最佳实践

```typescript
// ✅ 使用 useCallback 避免不必要的重渲染
const handleExplore = useCallback(async (action: string) => {
  setIsLoading(true);
  try {
    const result = await generateExplorationStep(/* ... */);
    setGameState(prev => ({
      ...prev,
      exploration: {
        ...prev.exploration,
        currentStory: result.story,
        choices: result.choices
      }
    }));
  } finally {
    setIsLoading(false);
  }
}, [/* dependencies */]);

// ✅ 使用函数式更新避免闭包陷阱
setGameState(prev => ({
  ...prev,
  memories: [...prev.memories, newMemory]
}));
```

### 3.3 样式规范

#### Tailwind CSS 使用

```tsx
// ✅ 使用 Tailwind 类名
<div className="flex items-center justify-between p-4 bg-stone-800 rounded-lg">
  <span className="text-amber-400 font-bold">{title}</span>
  <button className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 
                     hover:from-amber-500 hover:to-orange-500 
                     rounded-lg transition-all duration-200">
    确认
  </button>
</div>

// ✅ 条件类名
<div className={`
  p-4 rounded-lg transition-all
  ${isActive ? 'bg-amber-600 text-white' : 'bg-stone-700 text-gray-300'}
  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-stone-600'}
`}>
```

#### 仙侠主题色彩

```typescript
// 主题色彩参考
const THEME_COLORS = {
  // 主色调
  gold: {
    light: '#F59E0B',   // amber-500
    DEFAULT: '#D97706', // amber-600
    dark: '#B45309'     // amber-700
  },
  // 背景色
  stone: {
    light: '#44403C',   // stone-700
    DEFAULT: '#292524', // stone-800
    dark: '#1C1917'     // stone-900
  },
  // 稀有度颜色
  rarity: {
    common: '#9CA3AF',    // 凡品 - 灰色
    uncommon: '#22C55E',  // 良品 - 绿色
    rare: '#3B82F6',      // 优品 - 蓝色
    epic: '#A855F7',      // 珍品 - 紫色
    legendary: '#F59E0B', // 绝品 - 橙色
    mythic: '#EC4899',    // 仙品 - 粉色
    sacred: '#EF4444',    // 圣品 - 红色
    divine: '#FFD700'     // 神品 - 金色
  }
};
```

---

## 4. 组件开发指南

### 4.1 模态框组件模板

```typescript
// components/[Feature]Modal.tsx
import React, { useState } from 'react';
import { ResponsiveModal } from './ResponsiveModal';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 其他必要的props
}

const FeatureModal: React.FC<FeatureModalProps> = ({
  isOpen,
  onClose,
  // 解构其他props
}) => {
  // 1. 状态定义
  const [localState, setLocalState] = useState<StateType>(initialValue);
  
  // 2. 事件处理函数
  const handleAction = () => {
    // 处理逻辑
  };
  
  // 3. 渲染辅助函数
  const renderContent = () => {
    return (
      <div className="p-4">
        {/* 内容 */}
      </div>
    );
  };
  
  // 4. 主渲染
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="功能标题"
      size="lg"
    >
      {renderContent()}
    </ResponsiveModal>
  );
};

export default FeatureModal;
```

### 4.2 卡片组件模板

```typescript
// components/[Entity]Card.tsx
import React from 'react';
import { getRarityColor, getRarityGlow } from './rarityHelpers';

interface EntityCardProps {
  entity: EntityType;
  onClick?: () => void;
  isSelected?: boolean;
}

const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  onClick,
  isSelected = false
}) => {
  const rarityColor = getRarityColor(entity.rarity);
  const rarityGlow = getRarityGlow(entity.rarity);
  
  return (
    <div
      onClick={onClick}
      className={`
        relative p-3 rounded-lg cursor-pointer
        transition-all duration-200
        ${isSelected ? 'ring-2 ring-amber-400' : ''}
        ${rarityGlow}
      `}
      style={{ borderColor: rarityColor }}
    >
      {/* 稀有度标签 */}
      <span 
        className="absolute top-1 right-1 px-2 py-0.5 text-xs rounded"
        style={{ backgroundColor: rarityColor }}
      >
        {entity.rarity}
      </span>
      
      {/* 主要内容 */}
      <h3 className="font-bold text-white">{entity.name}</h3>
      <p className="text-sm text-gray-400">{entity.description}</p>
    </div>
  );
};

export default EntityCard;
```

### 4.3 稀有度辅助函数

```typescript
// components/rarityHelpers.ts
import { Rarity } from '../types';

export const getRarityColor = (rarity: Rarity): string => {
  const colors: Record<Rarity, string> = {
    '凡品': '#9CA3AF',
    '良品': '#22C55E',
    '优品': '#3B82F6',
    '珍品': '#A855F7',
    '绝品': '#F59E0B',
    '仙品': '#EC4899',
    '圣品': '#EF4444',
    '神品': '#FFD700'
  };
  return colors[rarity] || colors['凡品'];
};

export const getRarityGlow = (rarity: Rarity): string => {
  const glows: Record<Rarity, string> = {
    '凡品': '',
    '良品': 'shadow-green-500/20',
    '优品': 'shadow-blue-500/30',
    '珍品': 'shadow-purple-500/40',
    '绝品': 'shadow-amber-500/50',
    '仙品': 'shadow-pink-500/50',
    '圣品': 'shadow-red-500/60',
    '神品': 'shadow-yellow-400/70 animate-pulse'
  };
  return `shadow-lg ${glows[rarity] || ''}`;
};
```

---

## 5. 服务层开发指南

### 5.1 服务函数模板

```typescript
// services/[feature]Service.ts

/**
 * 功能描述
 * @param param1 参数1说明
 * @param param2 参数2说明
 * @returns 返回值说明
 */
export async function featureFunction(
  param1: Type1,
  param2: Type2,
  gameState?: GameState
): Promise<ReturnType> {
  // 1. 构建系统指令
  const systemInstruction = `你是...
  
  **重要规则**:
  1. 规则1
  2. 规则2
  
  **JSON输出格式**:
  \`\`\`json
  {
    "field1": "value1",
    "field2": "value2"
  }
  \`\`\``;
  
  // 2. 构建提示词
  const prompt = `
  输入信息:
  - 字段1: ${param1}
  - 字段2: ${param2}
  
  请生成...
  `;
  
  // 3. 调用AI生成
  const generatedText = gameState
    ? await enhancedGenerate({ systemInstruction, prompt, gameState })
    : await simpleGenerate(systemInstruction, prompt);
  
  // 4. 解析结果
  return parseJsonFromText(generatedText);
}
```

### 5.2 JSON解析辅助函数

```typescript
/**
 * 从AI生成的文本中提取并解析JSON代码块
 */
function parseJsonFromText(text: string): any {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);
  
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error("解析JSON失败:", error);
      console.error("原始JSON字符串:", match[1]);
      throw new Error("模型返回的JSON格式无效。");
    }
  }
  
  console.error("未找到JSON代码块。响应内容:", text);
  throw new Error("模型响应中未找到预期的JSON代码块。");
}
```

### 5.3 错误处理最佳实践

```typescript
// ✅ 完整的错误处理
export async function safeGenerateContent(
  params: GenerateParams
): Promise<Result<GeneratedContent, GenerateError>> {
  try {
    const result = await generateContent(params);
    return { success: true, data: result };
  } catch (error) {
    console.error('生成内容失败:', error);
    
    if (error instanceof NetworkError) {
      return { success: false, error: { type: 'network', message: '网络连接失败' } };
    }
    
    if (error instanceof ParseError) {
      return { success: false, error: { type: 'parse', message: 'AI返回格式错误' } };
    }
    
    return { success: false, error: { type: 'unknown', message: '未知错误' } };
  }
}

// 使用
const result = await safeGenerateContent(params);
if (result.success) {
  // 处理成功结果
  handleSuccess(result.data);
} else {
  // 处理错误
  showError(result.error.message);
}
```

---

## 6. AI集成最佳实践

### 6.1 系统指令编写规范

```typescript
const systemInstruction = `你是一位[角色定位]。

**核心任务**:
[明确说明AI需要完成的任务]

**必须遵守的规则**:
1. [规则1 - 最重要的规则]
2. [规则2]
3. [规则3]

**输出格式要求**:
- 必须使用JSON格式
- 必须包裹在 \`\`\`json ... \`\`\` 代码块中
- 不要在代码块之外添加任何解释

**JSON结构示例**:
\`\`\`json
{
  "field1": "示例值",
  "field2": 123,
  "field3": ["item1", "item2"]
}
\`\`\`

**禁止事项**:
- ❌ 不要[禁止行为1]
- ❌ 不要[禁止行为2]`;
```

### 6.2 上下文增强使用

```typescript
// 使用增强生成（推荐）
const result = await enhancedGenerate({
  systemInstruction,
  prompt,
  gameState  // 传入gameState以启用上下文增强
});

// 简单生成（不需要上下文时使用）
const result = await simpleGenerate(systemInstruction, prompt);
```

### 6.3 向量化最佳实践

```typescript
// 1. 批量向量化以提高效率
const texts = memories.map(m => m.content);
const vectors = await vectorService.batchVectorize(texts);

// 2. 设置合理的相似度阈值
const config: VectorConfig = {
  similarityThreshold: 0.7,  // 0.7是一个平衡的阈值
  maxResults: 20,
  topKBeforeRerank: 50
};

// 3. 启用重排序以提高准确性
if (config.rerankerEnabled) {
  const rerankedResults = await rerankerService.rerank(query, results);
}
```

---

## 7. 常见问题与解决方案

### 7.1 AI生成问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| JSON解析失败 | AI未按格式输出 | 在系统指令中强调JSON格式要求 |
| 生成内容不符合预期 | 提示词不够明确 | 添加更多示例和约束条件 |
| 生成速度慢 | 上下文过长 | 精简上下文，使用总结代替原始记忆 |

### 7.2 状态管理问题

```typescript
// 问题：状态更新后组件未重渲染
// 原因：直接修改了对象/数组

// ❌ 错误做法
gameState.memories.push(newMemory);
setGameState(gameState);

// ✅ 正确做法
setGameState(prev => ({
  ...prev,
  memories: [...prev.memories, newMemory]
}));
```

### 7.3 性能优化

```typescript
// 1. 使用 useMemo 缓存计算结果
const sortedCards = useMemo(() => {
  return [...cards].sort((a, b) => 
    RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity)
  );
}, [cards]);

// 2. 使用 useCallback 缓存函数
const handleSelect = useCallback((card: CharacterCard) => {
  setSelectedCard(card);
}, []);

// 3. 列表渲染使用 key
{cards.map(card => (
  <CardComponent key={card.id} card={card} />
))}
```

---

## 8. 设计模式应用

### 8.1 适配器模式 - 存储服务

```typescript
// 定义统一接口
interface IStorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}

// IndexedDB 适配器
class IndexedDBAdapter implements IStorageAdapter {
  async get(key: string) { /* ... */ }
  async set(key: string, value: any) { /* ... */ }
  async delete(key: string) { /* ... */ }
}

// TavernHelper 适配器
class TavernHelperAdapter implements IStorageAdapter {
  async get(key: string) { /* ... */ }
  async set(key: string, value: any) { /* ... */ }
  async delete(key: string) { /* ... */ }
}

// 使用
const storage = new StorageService(
  new IndexedDBAdapter(),      // 主存储
  new TavernHelperAdapter()    // 备用存储
);
```

### 8.2 建造者模式 - AI上下文构建

```typescript
class AIContextBuilder {
  private context: AIContext = {};
  
  withMemories(memories: MemoryEntry[]): this {
    this.context.memories = memories;
    return this;
  }
  
  withWorldbook(entries: WorldbookEntry[]): this {
    this.context.worldbook = entries;
    return this;
  }
  
  withCharacterInfo(info: CharacterInfo): this {
    this.context.character = info;
    return this;
  }
  
  build(): AIContext {
    return { ...this.context };
  }
}

// 使用
const context = new AIContextBuilder()
  .withMemories(relevantMemories)
  .withWorldbook(worldbookEntries)
  .withCharacterInfo(characterInfo)
  .build();
```

### 8.3 策略模式 - 抽卡系统

```typescript
interface IGachaStrategy {
  roll(): Rarity;
}

class NormalGachaStrategy implements IGachaStrategy {
  roll(): Rarity {
    // 普通概率
    return rollWithProbabilities(NORMAL_PROBABILITIES);
  }
}

class RateUpGachaStrategy implements IGachaStrategy {
  constructor(private targetRarity: Rarity) {}
  
  roll(): Rarity {
    // 提升特定稀有度概率
    return rollWithProbabilities(getRateUpProbabilities(this.targetRarity));
  }
}

// 使用
const gachaService = new GachaService(new NormalGachaStrategy());
// 或
const gachaService = new GachaService(new RateUpGachaStrategy('仙品'));
```

---

## 附录：检查清单

### 新功能开发检查清单

- [ ] 类型定义完整（在 `types.ts` 或 `types/` 目录）
- [ ] 组件遵循命名规范
- [ ] 使用 TypeScript 严格模式
- [ ] 添加必要的错误处理
- [ ] 响应式设计适配移动端
- [ ] 使用仙侠主题色彩
- [ ] 添加加载状态处理
- [ ] 测试与 SillyTavern 的集成

### 代码审查检查清单

- [ ] 无 `any` 类型（除非必要）
- [ ] 无直接修改状态
- [ ] 使用 `useCallback` 和 `useMemo` 优化性能
- [ ] 组件有合理的 `key` 属性
- [ ] 错误边界处理
- [ ] 控制台无警告和错误

---

> 📝 **文档说明**: 本指南涵盖了仙侠卡牌RPG项目的开发规范、最佳实践和常见问题解决方案。请在开发过程中遵循这些指南以保持代码质量和一致性。