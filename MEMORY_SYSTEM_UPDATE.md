# 记忆系统分类更新总结

## 📋 更新概述

本次更新将记忆系统从通用的事件类型分类（探索、战斗、问诊等）重构为基于实际游戏界面的分类系统，使记忆分类与玩家操作界面完全对应。

## 🎯 更新目标

根据用户需求："我希望能捕捉到在任何界面生成的消息，都能帮我保存到记忆中，按照界面名字来分类"。

例如：商城界面抽取的AI生成人物卡应该自动归类到【商城】类别。

## 📊 AI生成函数与界面映射

通过分析App.tsx中的所有AI生成函数调用，我们确定了以下映射关系：

| 界面 | AI生成函数 | 使用场景 |
|------|-----------|---------|
| **探索** | `generateExplorationStep` | 探索故事生成 |
| | `generateRandomEvent` | 随机事件生成 |
| **战斗** | `processCombatTurn` | 战斗回合处理 |
| **商城** | `generateRandomCharacter` | 抽取人物卡牌 |
| | `generateRandomEquipment` | 抽取装备 |
| | `generateRandomSkill` | 抽取通用技能 |
| | `generateRandomPet` | 抽取兽宠 |
| | `generateDoujinCharacter` | 同人角色创作 |
| | `generateDoujinPet` | 同人兽宠创作 |
| **医馆** | `generatePatient` | 生成患者 |
| **悬赏** | `generateBountyTarget` | 生成悬赏目标 |
| | `generateBountyLog` | 生成追踪日志 |
| **培育** | `generateCultivationResult` | 生成培育结果 |
| | `generateCultivationMonitoringText` | 生成监测报告 |
| **商业** | `generateBusinessEvent` | 生成商业事件 |
| **声望** | `generateReputationStory` | 生成声望故事 |
| **公告** | `generateAnnouncements` | 生成公告 |

## 🔄 分类变更对照表

| 旧分类 | 新分类 | 说明 |
|--------|--------|------|
| 探索 | 探索 | 保持不变 |
| 战斗 | 战斗 | 保持不变 |
| ~~问诊~~ | **医馆** | 重命名，更贴近实际界面 |
| 商业 | 商业 | 保持不变（指商业经营） |
| 悬赏 | 悬赏 | 保持不变 |
| 培育 | 培育 | 保持不变 |
| ~~交互~~ | ~~删除~~ | 合并到"其他" |
| - | **商城** | 新增，对应抽卡界面 |
| - | **声望** | 新增，对应声望系统 |
| - | **公告** | 新增，对应公告系统 |
| 其他 | 其他 | 保留作为兜底分类 |

## 📝 修改文件清单

### 1. **types.ts** - 类型定义更新
```typescript
// 旧：8个分类
export type MemoryCategory = '探索' | '战斗' | '问诊' | '商业' | '悬赏' | '培育' | '交互' | '其他';

// 新：10个分类
export type MemoryCategory = '探索' | '战斗' | '商城' | '医馆' | '悬赏' | '培育' | '商业' | '声望' | '公告' | '其他';
```

同时更新了：
- `MemoryCollection` 接口
- `MemorySummaryCollection` 接口

### 2. **services/aiMessageCapture.ts** - 消息分类逻辑更新

**更新关键词映射：**
```typescript
const CATEGORY_KEYWORDS: Record<MemoryCategory, string[]> = {
  '商城': ['商城', '抽卡', '抽取', '招募', '购买', '卡池', '人物卡牌', '装备', '技能', '兽宠', '同人', '灵感'],
  '医馆': ['医馆', '问诊', '诊断', '治疗', '医治', '症状', '病情', '药物', '处方', '康复', '伤势', '疾病', '患者'],
  '声望': ['声望', '名声', '威望', '名气', '事迹', '名望', '江湖', '传闻', '称号'],
  '公告': ['公告', '宗门', '世界', '奇遇', '通知', '消息', '天元'],
  // ... 其他分类
};
```

**更新场景映射：**
```typescript
const SCENE_TO_CATEGORY: Record<string, MemoryCategory> = {
  'shop': '商城',
  'gacha': '商城',
  'hospital': '医馆',
  'consultation': '医馆',
  'reputation': '声望',
  'announcement': '公告',
  // ... 其他映射
};
```

### 3. **components/MemoryModal.tsx** - 界面更新

**更新分类列表和图标：**
```typescript
const categories: MemoryCategory[] = ['探索', '战斗', '商城', '医馆', '悬赏', '培育', '商业', '声望', '公告', '其他'];

const getCategoryIcon = (category: MemoryCategory): string => {
  const icons: Record<MemoryCategory, string> = {
    商城: 'fa-store',
    医馆: 'fa-stethoscope',
    声望: 'fa-star',
    公告: 'fa-bullhorn',
    // ... 其他图标
  };
  return icons[category];
};
```

### 4. **App.tsx** - 使用方式更新
- 将所有 `'问诊'` 替换为 `'医馆'`
- 将所有 `'交互'` 替换为 `'其他'`

### 5. **constants.ts** - 初始状态和版本更新
- `CURRENT_GAME_VERSION`: 1 → 2
- 更新 `initialGameState` 中的 `memories` 和 `memorySummaries` 结构

### 6. **services/migrationService.ts** - 数据迁移
添加版本2的迁移脚本，自动将旧存档中的：
- `'问诊'` → `'医馆'`
- `'交互'` → `'其他'`
- 添加新分类的空数组

## 🎨 界面展示

记忆界面现在展示10个分类标签：

```
┌────────────────────────────────────────────────────────────┐
│  探索 | 战斗 | 商城 | 医馆 | 悬赏 | 培育 | 商业 | 声望 | 公告 | 其他  │
└────────────────────────────────────────────────────────────┘
```

每个标签都有对应的Font Awesome图标：
- 🗺️ 探索 (fa-map-location-dot)
- ⚔️ 战斗 (fa-crossed-swords)
- 🏪 商城 (fa-store)
- 🏥 医馆 (fa-stethoscope)
- 💀 悬赏 (fa-book-skull)
- 🧬 培育 (fa-dna)
- 🏢 商业 (fa-building)
- ⭐ 声望 (fa-star)
- 📣 公告 (fa-bullhorn)
- ⋯ 其他 (fa-ellipsis)

## 🔧 AI消息自动捕获工作流程

1. **场景跟踪**：App.tsx根据当前打开的Modal自动设置场景
   ```typescript
   aiMessageCapture.setCurrentScene('shop'); // 打开商城
   ```

2. **消息捕获**：AI生成内容时触发SillyTavern事件
   ```typescript
   eventOn(tavern_events.MESSAGE_RECEIVED, (messageId) => {
     // 自动捕获AI消息
   });
   ```

3. **智能分类**：根据场景和关键词自动分类
   ```typescript
   categorizeMessage(content, scene) {
     // scene='shop' → '商城'
     // 或根据关键词匹配
   }
   ```

4. **保存记忆**：调用回调函数保存到对应分类
   ```typescript
   addMemory('商城', title, content);
   ```

## ✅ 兼容性保证

- **旧存档自动迁移**：首次加载时自动运行版本2迁移脚本
- **数据完整性**：旧分类的数据不会丢失，会合理转移到新分类
- **向后兼容**：保留了所有原有功能，只是优化了分类方式

## 📚 使用示例

### 商城抽卡自动记录
```typescript
// 在Shop.tsx中，当用户抽卡时
const result = await generateRandomCharacter(rarity);

// AI消息捕获服务自动：
// 1. 检测到当前场景是'shop'
// 2. 捕获AI生成的角色描述
// 3. 自动分类到【商城】
// 4. 保存标题："获得角色-{角色名}"
// 5. 保存内容：完整的AI生成描述
```

### 医馆问诊自动记录
```typescript
// 在ConsultationScreen中
const newPatient = await generatePatient(gender);

// 自动分类到【医馆】
// 标题："新患者-{患者名}"
// 内容：患者的完整病历信息
```

## 🎯 用户价值

1. **直观对应**：记忆分类与游戏界面完全对应，不再困惑
2. **自动归档**：所有AI生成内容自动按界面分类保存
3. **精准查找**：想看商城抽卡记录？直接点击【商城】标签
4. **完整追踪**：每个界面的所有AI交互都有完整记录

## 🔮 后续扩展

如果未来添加新界面（如"拍卖行"、"秘境"等），只需：
1. 在 `MemoryCategory` 类型中添加新分类
2. 在 `SCENE_TO_CATEGORY` 中添加映射
3. 在 `MemoryModal` 中添加图标
4. 创建新的迁移脚本（如果需要）

---

**更新日期**：2025-01-14  
**版本**：v2.0  
**状态**：✅ 已完成并测试