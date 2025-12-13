# 上下文感知的自动记忆检索系统

## 🎯 核心概念

当玩家在各个界面进行互动时，系统会**自动检索相关的历史记忆**，并将其注入到AI的上下文中，让AI能够：
1. 记住之前发生的事情
2. 保持角色关系的连贯性
3. 参考历史决策
4. 提供更有深度的互动

## 🔄 工作流程

```
玩家进入界面/执行操作
      ↓
检测当前上下文
      ↓
提取上下文关键词
      ↓
向量化上下文描述
      ↓
语义搜索相关记忆（Top-K）
      ↓
筛选并整理记忆
      ↓
注入到AI提示词
      ↓
AI生成回复（包含历史上下文）
```

## 📊 上下文检测规则

### 1. 探索界面
```typescript
context = {
  scene: '探索',
  location: gameState.exploration.location,
  characters: nearbyCharacters,
  recentEvents: last3Memories,
  query: `在${location}探索时发生的事情`
}
```

### 2. 战斗界面
```typescript
context = {
  scene: '战斗',
  opponents: battle.opponentParty.map(p => p.card.name),
  playerParty: battle.playerParty.map(p => p.card.name),
  query: `与${opponents}的战斗经历`
}
```

### 3. 医馆界面
```typescript
context = {
  scene: '医馆',
  patient: currentPatient.name,
  symptoms: currentPatient.illness,
  query: `治疗${patient}相关的经历`
}
```

### 4. 商城界面
```typescript
context = {
  scene: '商城',
  action: '抽卡' | '购买',
  query: `在商城的抽卡和购买记录`
}
```

### 5. 角色互动
```typescript
context = {
  scene: '互动',
  character: targetCharacter.name,
  relationship: getRelationship(character),
  query: `与${character}的互动历史`
}
```

## 🔧 核心实现：上下文记忆检索器

```typescript
// services/contextMemoryRetriever.ts

interface GameContext {
  scene: string;
  location?: string;
  characters?: string[];
  keywords?: string[];
  category?: MemoryCategory;
}

class ContextMemoryRetriever {
  
  // 主函数：根据当前上下文检索相关记忆
  async retrieveRelevantMemories(
    context: GameContext,
    maxResults: number = 5
  ): Promise<MemoryEntry[]> {
    
    // 1. 构建上下文查询
    const query = this.buildContextQuery(context);
    
    // 2. 执行语义搜索
    const vectorResults = await semanticSearchService.search(
      query,
      context.category,
      maxResults * 2 // 先多取一些
    );
    
    // 3. 关键词过滤（混合搜索）
    const filtered = this.filterByKeywords(
      vectorResults,
      context.keywords || []
    );
    
    // 4. 时间衰减（越新的记忆权重越高）
    const weighted = this.applyTimeDecay(filtered);
    
    // 5. 返回Top-K
    return weighted.slice(0, maxResults)
      .map(r => r.originalMemory);
  }
  
  // 构建上下文查询字符串
  private buildContextQuery(context: GameContext): string {
    const parts: string[] = [];
    
    if (context.location) {
      parts.push(`在${context.location}`);
    }
    
    if (context.characters && context.characters.length > 0) {
      parts.push(`与${context.characters.join('、')}相关`);
    }
    
    if (context.keywords && context.keywords.length > 0) {
      parts.push(context.keywords.join(' '));
    }
    
    parts.push(`${context.scene}场景`);
    
    return parts.join(' ');
  }
  
  // 关键词过滤
  private filterByKeywords(
    results: SemanticSearchResult[],
    keywords: string[]
  ): SemanticSearchResult[] {
    if (keywords.length === 0) return results;
    
    return results.filter(result => {
      const text = result.entry.originalText.toLowerCase();
      return keywords.some(kw => text.includes(kw.toLowerCase()));
    });
  }
  
  // 时间衰减（可选）
  private applyTimeDecay(
    results: SemanticSearchResult[]
  ): SemanticSearchResult[] {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    return results.map(result => {
      const ageInDays = (now - result.entry.realTimestamp) / dayInMs;
      const decay = Math.exp(-ageInDays / 7); // 7天半衰期
      
      return {
        ...result,
        similarity: result.similarity * (0.5 + 0.5 * decay)
      };
    }).sort((a, b) => b.similarity - a.similarity);
  }
}

export const contextMemoryRetriever = new ContextMemoryRetriever();
```

## 💉 记忆注入策略

### 方案A：在AI提示词中注入（推荐）

```typescript
// 在调用AI生成前
async function generateWithMemoryContext(
  prompt: string,
  context: GameContext
): Promise<string> {
  
  // 1. 检索相关记忆
  const relevantMemories = await contextMemoryRetriever
    .retrieveRelevantMemories(context, 5);
  
  // 2. 格式化记忆
  const memoryContext = formatMemoriesForPrompt(relevantMemories);
  
  // 3. 构建完整提示词
  const fullPrompt = `
【相关历史记忆】
${memoryContext}

【当前情况】
${prompt}

请基于以上历史记忆，生成合理且连贯的回复。
  `.trim();
  
  // 4. 调用AI
  return await generate({ user_input: fullPrompt });
}

function formatMemoriesForPrompt(memories: MemoryEntry[]): string {
  if (memories.length === 0) {
    return '（暂无相关历史记忆）';
  }
  
  return memories.map((m, i) => 
    `${i + 1}. [${m.timestamp}] ${m.title}\n   ${m.content.substring(0, 200)}...`
  ).join('\n\n');
}
```

### 方案B：通过世界书注入

```typescript
// 动态更新世界书条目
async function injectMemoriesToWorldbook(
  context: GameContext
): Promise<void> {
  
  const memories = await contextMemoryRetriever
    .retrieveRelevantMemories(context, 3);
  
  // 创建临时世界书条目
  const entries = memories.map(m => ({
    name: `临时记忆-${m.id}`,
    content: `【历史记忆】${m.title}\n${m.content}`,
    keys: [context.scene, ...(context.characters || [])],
    constant: true, // 总是激活
    position: 'before_character_definition'
  }));
  
  // 注入到世界书
  await createWorldbookEntries('临时记忆库', entries);
}
```

## 🎮 各界面集成示例

### 1. 探索界面集成

```typescript
// App.tsx - handleExplorationAction

const handleExplorationAction = async (choice: string) => {
  // 构建上下文
  const context: GameContext = {
    scene: '探索',
    location: gameState.exploration.location,
    keywords: [choice],
    category: '探索'
  };
  
  // 生成带记忆的回复
  const story = await generateWithMemoryContext(
    `玩家选择了：${choice}`,
    context
  );
  
  // ... 处理后续逻辑
};
```

### 2. 战斗界面集成

```typescript
// App.tsx - processCombatTurn

const processCombatTurn = async () => {
  const context: GameContext = {
    scene: '战斗',
    characters: [
      ...gameState.battle.playerParty.map(p => p.card.name),
      ...gameState.battle.opponentParty.map(p => p.card.name)
    ],
    category: '战斗'
  };
  
  // 检索战斗相关记忆
  const memories = await contextMemoryRetriever
    .retrieveRelevantMemories(context, 3);
  
  // 如果之前战斗过同样的对手
  const previousBattles = memories.filter(m => 
    m.involvedCharacters?.some(c => 
      gameState.battle.opponentParty.some(p => p.card.name === c)
    )
  );
  
  if (previousBattles.length > 0) {
    // AI可以参考之前的战斗策略
    console.log('发现历史战斗记录:', previousBattles);
  }
  
  // ... 生成战斗回合
};
```

### 3. 医馆界面集成

```typescript
// ConsultationScreen.tsx

const continueConsultation = async (action: string) => {
  const context: GameContext = {
    scene: '医馆',
    characters: [patient.medicalRecord.name],
    keywords: [patient.medicalRecord.illnessDescription],
    category: '医馆'
  };
  
  // 检索相关病例
  const similarCases = await contextMemoryRetriever
    .retrieveRelevantMemories(context, 3);
  
  // 提示AI参考类似病例
  const prompt = `
【类似病例】
${formatMemoriesForPrompt(similarCases)}

【当前患者】
姓名: ${patient.medicalRecord.name}
症状: ${patient.medicalRecord.illnessDescription}

【医生行动】
${action}

请基于类似病例经验，继续问诊。
  `;
  
  const response = await generate({ user_input: prompt });
  // ... 处理回复
};
```

### 4. 角色互动集成

```typescript
// 角色对话系统

const interactWithCharacter = async (
  character: CharacterCard,
  message: string
) => {
  const context: GameContext = {
    scene: '互动',
    characters: [character.name],
    keywords: [message]
  };
  
  // 检索与该角色的历史互动
  const history = await contextMemoryRetriever
    .retrieveRelevantMemories(context, 5);
  
  // 注入历史关系
  const prompt = `
【角色】${character.name}
【关系历史】
${formatMemoriesForPrompt(history)}

【当前对话】
玩家: ${message}

请${character.name}基于你们的历史关系做出回应。
  `;
  
  return await generate({ user_input: prompt });
};
```

## 🎚️ 可配置选项

```typescript
interface MemoryRetrievalSettings {
  enabled: boolean;              // 是否启用自动检索
  maxMemoriesPerContext: number; // 每次最多检索几条
  includeCategories: MemoryCategory[]; // 包含哪些分类
  timeDecayEnabled: boolean;     // 是否启用时间衰减
  minimumSimilarity: number;     // 最小相似度阈值
  useHybridSearch: boolean;      // 是否混合关键词搜索
}
```

## 📊 性能优化

### 1. 缓存策略
```typescript
// 缓存常见场景的检索结果
const memoryCache = new Map<string, MemoryEntry[]>();

function getCacheKey(context: GameContext): string {
  return JSON.stringify({
    scene: context.scene,
    location: context.location,
    characters: context.characters?.sort()
  });
}
```

### 2. 预加载
```typescript
// 在场景切换时预加载可能需要的记忆
async function preloadMemoriesForScene(scene: string) {
  // 后台预先检索和缓存
}
```

### 3. 批量处理
```typescript
// 一次性检索多个上下文的记忆
async function batchRetrieve(contexts: GameContext[]) {
  // 合并查询，减少API调用
}
```

## 🎯 预期效果

### Before（无上下文记忆）
```
玩家: "再次来到医馆"
AI: "欢迎来到医馆，请问有什么可以帮助的？"
```

### After（有上下文记忆）
```
玩家: "再次来到医馆"
AI: "欢迎再次光临！上次你成功治愈了那位患有寒毒的女修士，
     今天又有新的患者等待你的诊治。你的医术在宗门中已经
     小有名气了呢。"
```

## 💡 高级功能（可选）

### 1. 智能记忆筛选
- 只检索重要的记忆（高质量、高相关性）
- 过滤重复或相似的记忆

### 2. 记忆摘要
- 将多条相关记忆合并成一个简短摘要
- 减少token消耗

### 3. 记忆优先级
- 根据重要性和新鲜度动态调整权重
- 确保关键记忆不被遗漏

### 4. 跨界面记忆关联
- 探索时遇到的角色 → 战斗时的互动
- 医馆治疗的患者 → 后续声望变化

---

**总结**：通过上下文感知的自动记忆检索，游戏AI将具备"记忆"能力，让每次互动都能参考历史，提供更加连贯和有深度的游戏体验！🎮✨