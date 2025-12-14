# 仙侠卡牌RPG - 私域知识库

> 📅 创建日期: 2024-12-12
> 📅 更新日期: 2024-12-13
> � 版本: 1.1.0
> 📁 项目: xianxia-card-rpg

---

## 📚 知识库概览

本知识库是对仙侠卡牌RPG项目的完整解构和文档化，旨在帮助开发者快速理解项目架构、业务逻辑和开发规范。

---

## 📖 文档目录

### 1. [系统架构分析文档](./SYSTEM_ARCHITECTURE_ANALYSIS.md)

**内容概要**:
- 项目概述与核心特性
- 技术栈全景（React 19 + TypeScript + Vite + Tailwind）
- 系统架构图（PlantUML）
- 核心模块分析（入口点、服务层、组件层）
- 数据流分析
- 关键设计模式

**适用场景**: 新成员入职、架构评审、技术选型参考

---

### 2. [专业术语词汇表](./GLOSSARY.md)

**内容概要**:
- 游戏世界观术语（境界、稀有度、地理）
- 游戏系统术语（战斗、卡牌、监狱、礼仪）
- 技术架构术语（组件、服务、存储、AI）
- 数据类型术语（核心类型、枚举、接口）
- API与服务术语
- 中英文对照表

**适用场景**: 术语查询、文档编写、代码命名参考

---

### 3. [数据模型使用手册](./DATA_MODEL_MANUAL.md)

**内容概要**:
- 核心实体模型（Attributes、Skill、Equipment、CharacterCard、PetCard）
- 游戏状态模型（GameState、PlayerProfile、ExplorationState、MemoryEntry）
- 战斗系统模型（BattleState、BattleParticipant、StatusEffect）
- 子系统模型（PrisonSystem、EtiquetteSystem、BountyTarget、MedicalRecord）
- 配置与设置模型（VectorConfig、EtiquetteSettings）
- 模型关系图（PlantUML ER图）

**适用场景**: 数据结构设计、接口开发、数据库设计参考

---

### 4. [业务逻辑公式手册](./BUSINESS_LOGIC_FORMULAS.md)

**内容概要**:
- 战斗系统公式（伤害计算、暴击、状态效果）
- 抽卡概率公式（稀有度分布、保底机制）
- 属性计算公式（最终属性、装备加成）
- 经济系统公式（售价、收入、奖励）
- 监狱系统公式（屈服度、健康度、劳役产出）
- 记忆系统规则（分类、总结触发、重要性评估）
- 向量搜索算法（余弦相似度、语义搜索流程）

**适用场景**: 游戏平衡调整、数值策划、算法优化

---

### 5. [开发实践指南](./DEVELOPMENT_GUIDE.md)

**内容概要**:
- 开发环境配置
- 项目结构规范
- 编码规范（TypeScript、React、样式）
- 组件开发指南（模态框模板、卡片模板）
- 服务层开发指南（服务函数模板、错误处理）
- AI集成最佳实践
- 常见问题与解决方案
- 设计模式应用（适配器、建造者、策略）

**适用场景**: 日常开发、代码审查、新功能开发

---

## 🎮 功能模块层级关系

### 模块入口层次结构

游戏的功能模块通过 `BottomBar` 组件组织，分为两个层级：

#### 一级功能（primaryActions）- 核心操作，始终可见

| 功能 | 图标 | 说明 | 对应组件/模态框 |
|------|------|------|----------------|
| **探索** | `fa-map-location-dot` | 打开世界地图，进行区域切换 | `MapModal.Enhanced.tsx` |
| **队伍** | `fa-users` | 管理玩家的男性/女性编队 | `Modal.tsx` → `PartyFormation.tsx` |
| **背包** | `fa-briefcase` | 查看装备、材料、消耗品 | `Modal.tsx` → `Inventory.tsx` |
| **活动** | `fa-trophy` | 进入竞技场进行PVP对战 | `Modal.tsx` → `Arena.tsx` |
| **更多** | `fa-ellipsis-vertical` | 展开二级功能菜单 | 浮层菜单 |

#### 二级功能（secondaryActions）- 收纳菜单，点击"更多"展开

| 功能 | 图标 | 颜色标识 | 说明 | 对应组件 |
|------|------|----------|------|----------|
| **商城** | `fa-store` | 默认 | 购买卡牌、装备、材料 | `Modal.tsx` → `Shop.tsx` |
| **任务** | `fa-scroll` | 默认 | 查看当前任务和进度 | `QuestLogModal.tsx` |
| **记忆** | `fa-book-open` | 粉色 | 管理AI记忆和总结 | `MemoryModal.tsx` |
| **传音** | `fa-om` | 青色 | 与NPC进行心灵对话 | `TelepathyModal.tsx` |
| **育灵轩** | `fa-dna` | 紫色 | 角色培育系统 | `CultivationModal.tsx` |
| **产业** | `fa-building` | 默认 | 管理商业区和店铺 | `BusinessModal.tsx` |
| **医馆** | `fa-hospital` | 默认 | 为病患问诊治疗 | `HospitalModal.tsx` |
| **红尘录** | `fa-book-skull` | 默认 | 悬赏任务追踪 | `BountyBoardModal.tsx` |
| **镇狱大牢** | `fa-dungeon` | 红色 | 管理囚犯和审讯 | `PrisonModal.tsx` |
| **礼仪设计馆** | `fa-ribbon` | 粉色 | 礼仪训练系统 | `EtiquetteHallModal.tsx` |
| **江湖传闻** | `fa-bullhorn` | 默认 | 查看世界公告和消息 | `AnnouncementModal.tsx` |
| **人物状态** | `fa-users-viewfinder` | 青色 | 查看所有角色当前状态 | `CharacterStatusModal.tsx` |
| **系统** | `fa-bars` | 默认 | 存档/读档/导入导出 | `SaveLoadModal.tsx` |

### 模块关系图

```
┌──────────────────────────────────────────────────────────────────┐
│                        BottomBar (底部导航栏)                      │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   一级功能 (始终可见)                         │ │
│  │  [探索] [队伍] [背包] [活动] [更多]                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              ↓ 点击"更多"                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   二级功能 (浮层菜单)                         │ │
│  │  [商城] [任务] [记忆] [传音] [育灵轩]                         │ │
│  │  [产业] [医馆] [红尘录] [镇狱大牢] [礼仪设计馆]                │ │
│  │  [江湖传闻] [人物状态] [系统]                                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 功能分类树

```
游戏功能模块
├── 🗺️ 探索系统
│   ├── 世界地图 (MapModal.Enhanced)
│   ├── 故事展示 (StoryDisplay)
│   ├── 随机事件 (RandomEventModal)
│   └── 挑战对决 (ChallengeModal)
│
├── ⚔️ 战斗系统
│   ├── 战斗界面 (Battlefield)
│   ├── 战斗行动 (BattleActionPanel)
│   ├── 战斗结果 (BattleResultModal)
│   └── 竞技场 (Arena)
│
├── 👥 角色管理
│   ├── 队伍编排 (PartyFormation)
│   ├── 角色详情 (CharacterDetail)
│   ├── 宠物详情 (PetDetail)
│   ├── 人物状态 (CharacterStatusModal)
│   └── 育灵轩培育 (CultivationModal)
│
├── 💼 背包与装备
│   ├── 物品栏 (Inventory)
│   ├── 装备详情 (EquipmentDetail)
│   └── 技能详情 (SkillDetail)
│
├── 🏪 商业系统
│   ├── 商城 (Shop)
│   ├── 产业管理 (BusinessModal)
│   ├── 监控查看 (SurveillanceModal)
│   └── 礼仪设计馆 (EtiquetteHallModal)
│
├── 🏥 医馆系统
│   ├── 病患管理 (HospitalModal)
│   ├── 问诊界面 (ConsultationScreen)
│   └── 病历查看 (MedicalRecordModal)
│
├── 🎯 悬赏系统 (红尘录)
│   ├── 悬赏榜 (BountyBoardModal)
│   └── 悬赏结果 (BountyResultModal)
│
├── 🔒 大牢系统 (镇狱大牢)
│   ├── 监狱管理 (PrisonModal)
│   ├── 审讯系统 (InterrogationModal)
│   └── 囚犯对话 (PrisonerDialogueModal)
│
├── 📜 任务与记录
│   ├── 任务日志 (QuestLogModal)
│   ├── 记忆系统 (MemoryModal)
│   ├── 江湖传闻 (AnnouncementModal)
│   └── 声望系统 (ReputationModal)
│
├── 💬 社交系统
│   ├── 传音对话 (TelepathyModal)
│   ├── 互动菜单 (InteractionModal)
│   └── 人际关系 (RelationshipModal)
│
└── 💾 系统功能
    ├── 存档读档 (SaveLoadModal)
    ├── 向量设置 (VectorSettingsModal)
    └── 语义搜索 (SemanticSearchPanel)
```

---

## ️ 项目核心文件索引

### 入口文件

| 文件 | 行数 | 描述 |
|------|------|------|
| [`App.tsx`](../App.tsx) | 3173 | 主应用组件，状态管理中心 |
| [`index.tsx`](../index.tsx) | 17 | 应用入口 |
| [`types.ts`](../types.ts) | 1439 | 核心类型定义 |
| [`constants.ts`](../constants.ts) | 629 | 常量与初始数据 |

### 核心服务

| 文件 | 描述 |
|------|------|
| [`services/tavernService.ts`](../services/tavernService.ts) | 核心游戏服务（探索、战斗、生成） |
| [`services/vectorService.ts`](../services/vectorService.ts) | 向量化服务 |
| [`services/storageService.ts`](../services/storageService.ts) | 存储服务 |
| [`services/aiContextBuilder.ts`](../services/aiContextBuilder.ts) | AI上下文构建器 |

### 关键组件

| 文件 | 描述 |
|------|------|
| [`components/MemoryModal.tsx`](../components/MemoryModal.tsx) | 记忆系统模态框 |
| [`components/PrisonModal.tsx`](../components/PrisonModal.tsx) | 监狱系统模态框 |
| [`components/EtiquetteHallModal.tsx`](../components/EtiquetteHallModal.tsx) | 礼仪系统模态框 |
| [`components/Battlefield.tsx`](../components/Battlefield.tsx) | 战斗场景组件 |

---

## 🔍 快速查找

### 按功能查找

| 功能 | 相关文档 | 相关代码 |
|------|----------|----------|
| 战斗系统 | [公式手册#战斗](./BUSINESS_LOGIC_FORMULAS.md#1-战斗系统公式) | `Battlefield.tsx`, `BattleActionPanel.tsx` |
| 抽卡系统 | [公式手册#抽卡](./BUSINESS_LOGIC_FORMULAS.md#2-抽卡概率公式) | `Shop.tsx`, `GachaResultModal.tsx` |
| 记忆系统 | [公式手册#记忆](./BUSINESS_LOGIC_FORMULAS.md#6-记忆系统规则) | `MemoryModal.tsx`, `memoryService.ts` |
| 向量搜索 | [公式手册#向量](./BUSINESS_LOGIC_FORMULAS.md#7-向量搜索算法) | `vectorService.ts`, `semanticSearchService.ts` |
| 监狱系统 | [数据模型#监狱](./DATA_MODEL_MANUAL.md#41-prisonsystem---监狱系统) | `PrisonModal.tsx`, `InterrogationModal.tsx` |
| 礼仪系统 | [数据模型#礼仪](./DATA_MODEL_MANUAL.md#43-etiquettesystem---礼仪系统) | `EtiquetteHallModal.tsx`, `types/etiquette.ts` |
| 育灵轩 | [数据模型#培育](./DATA_MODEL_MANUAL.md#45-cultivationslot---育灵仓) | `CultivationModal.tsx` |
| 悬赏系统 | [数据模型#悬赏](./DATA_MODEL_MANUAL.md#44-bountytarget---悬赏目标) | `BountyBoardModal.tsx`, `BountyResultModal.tsx` |
| 医馆系统 | [数据模型#医馆](./DATA_MODEL_MANUAL.md#46-medicalrecord---病历) | `HospitalModal.tsx`, `MedicalRecordModal.tsx` |
| 传音系统 | [术语#传音](./GLOSSARY.md#传音-telepathy) | `TelepathyModal.tsx` |
| 角色管理 | [数据模型#角色](./DATA_MODEL_MANUAL.md#14-charactercard---角色卡牌) | `CharacterDetail.tsx`, `PartyFormation.tsx` |

### 按类型查找

| 类型 | 文档位置 |
|------|----------|
| `CharacterCard` | [数据模型#1.4](./DATA_MODEL_MANUAL.md#14-charactercard---角色卡牌) |
| `GameState` | [数据模型#2.1](./DATA_MODEL_MANUAL.md#21-gamestate---游戏全局状态) |
| `BattleState` | [数据模型#3.1](./DATA_MODEL_MANUAL.md#31-battlestate---战斗状态) |
| `VectorConfig` | [数据模型#5.1](./DATA_MODEL_MANUAL.md#51-vectorconfig---向量配置) |

---

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 组件数量 | 70+ |
| 服务数量 | 28 |
| 类型定义行数 | 1439 |
| 主应用行数 | 3173 |
| 文档数量 | 5 |

---

## 🔄 更新日志

### v1.1.0 (2024-12-13)

- ✅ 新增功能模块层级关系文档
- ✅ 补充二级功能入口说明（13个模块）
- ✅ 添加功能分类树
- ✅ 扩展快速查找表（新增5个功能条目）
- ✅ 更新核心文件索引

### v1.0.0 (2024-12-12)

- ✅ 初始版本发布
- ✅ 完成系统架构分析文档
- ✅ 完成专业术语词汇表
- ✅ 完成数据模型使用手册
- ✅ 完成业务逻辑公式手册
- ✅ 完成开发实践指南

---

## 📝 贡献指南

如需更新知识库文档，请遵循以下规范：

1. **保持格式一致**: 使用Markdown格式，遵循现有文档结构
2. **更新索引**: 添加新文档后更新本README
3. **版本标注**: 在文档头部更新版本号和日期
4. **代码同步**: 确保文档与代码保持同步

---

> 📌 **提示**: 本知识库基于代码自动分析生成，如发现与实际代码不符之处，请以代码为准并更新文档。