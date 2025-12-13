# 仙侠卡牌RPG - 专业术语词汇表

> 📅 生成日期: 2024-12-12
> 🔖 版本: 1.0.0

---

## 目录

1. [游戏世界观术语](#1-游戏世界观术语)
2. [游戏系统术语](#2-游戏系统术语)
3. [技术架构术语](#3-技术架构术语)
4. [数据类型术语](#4-数据类型术语)
5. [API与服务术语](#5-api与服务术语)

---

## 1. 游戏世界观术语

### 1.1 修炼境界 (Realm)

| 术语 | 英文标识 | 描述 |
|------|----------|------|
| 炼气期 | Qi Refining | 修炼入门阶段，开始感知天地灵气 |
| 筑基期 | Foundation | 筑造修炼根基，正式踏入修仙之路 |
| 金丹期 | Golden Core | 凝结金丹，修为大进 |
| 元婴期 | Nascent Soul | 元婴出窍，可神游天地 |
| 化神期 | Spirit Severing | 斩断凡尘，神通广大 |
| 合体期 | Body Integration | 天人合一，接近仙道 |
| 大乘期 | Mahayana | 大乘圆满，渡劫飞升在即 |
| 渡劫期 | Tribulation | 渡过天劫，即可飞升 |

### 1.2 稀有度 (Rarity)

| 术语 | 英文标识 | 颜色代码 | 描述 |
|------|----------|----------|------|
| 凡品 | Common | `#9CA3AF` (灰色) | 最普通的品质 |
| 良品 | Uncommon | `#22C55E` (绿色) | 略高于普通 |
| 优品 | Rare | `#3B82F6` (蓝色) | 较为稀有 |
| 珍品 | Epic | `#A855F7` (紫色) | 珍贵稀有 |
| 绝品 | Legendary | `#F59E0B` (橙色) | 极其稀有 |
| 仙品 | Mythic | `#EC4899` (粉色) | 仙级品质 |
| 圣品 | Sacred | `#EF4444` (红色) | 圣级品质 |
| 神品 | Divine | `#FFD700` (金色) | 最高品质 |

### 1.3 世界地理 (Locations)

| 术语 | 类型 | 所属界面 | 描述 |
|------|------|----------|------|
| 青蛇宗 | Sect | 人界 | 玩家起始宗门，中等规模修仙宗门 |
| 百花谷 | Sect | 人界 | 以医术和丹药闻名的女性宗门 |
| 天机阁 | City | 人界 | 中州皇城，世界的中心 |
| 昆仑墟 | Mountain | 天界 | 传说中仙人居住的圣山 |
| 天宫 | Palace | 天界 | 诸天仙神的居所 |
| 镇狱大牢 | Prison | 冥界 | 关押罪犯和俘虏的巨型监狱 |
| 森罗殿 | Palace | 冥界 | 地府阎罗的议事大殿 |

### 1.4 界面划分 (Realm)

| 术语 | 英文标识 | 描述 |
|------|----------|------|
| 天界 | Celestial | 仙人居住之地，灵气最为浓郁 |
| 人界 | Mortal | 凡人与修士混居的世界 |
| 冥界 | Underworld | 亡魂与魔道修士的领域 |

---

## 2. 游戏系统术语

### 2.1 核心系统

| 术语 | 英文标识 | 代码位置 | 描述 |
|------|----------|----------|------|
| 探索系统 | Exploration | `App.tsx` | 玩家在世界中探索、触发事件的核心玩法 |
| 战斗系统 | Battle | `Battlefield.tsx` | 回合制卡牌战斗系统 |
| 抽卡系统 | Gacha | `Shop.tsx` | 随机获取角色、装备、技能的系统 |
| 记忆系统 | Memory | `MemoryModal.tsx` | 记录游戏事件，支持AI上下文增强 |
| 监狱系统 | Prison | `PrisonModal.tsx` | 管理囚犯、审讯、劳役的系统 |
| 礼仪系统 | Etiquette | `EtiquetteHallModal.tsx` | 设计和分发礼仪规范的系统 |
| 培育系统 | Cultivation | `CultivationModal.tsx` | 融合两个生命体创造新生命 |
| 医馆系统 | Hospital | `HospitalModal.tsx` | 诊治病人的系统 |
| 悬赏系统 | Bounty | `BountyBoardModal.tsx` | 追捕悬赏目标的系统 |

### 2.2 战斗术语

| 术语 | 英文标识 | 类型定义 | 描述 |
|------|----------|----------|------|
| 气血 | HP | `Attributes.hp` | 角色生命值 |
| 真元 | MP | `Attributes.mp` | 技能消耗资源 |
| 攻击力 | Attack | `Attributes.attack` | 基础伤害值 |
| 防御力 | Defense | `Attributes.defense` | 伤害减免值 |
| 速度 | Speed | `Attributes.speed` | 行动顺序决定因素 |
| 暴击率 | CritRate | `Attributes.critRate` | 触发暴击的概率 |
| 暴击伤害 | CritDmg | `Attributes.critDmg` | 暴击时的伤害倍率 |
| 状态效果 | StatusEffect | `StatusEffect` | 持续影响角色的buff/debuff |
| 战斗参与者 | BattleParticipant | `BattleParticipant` | 战斗中的角色实例 |

### 2.3 卡牌术语

| 术语 | 英文标识 | 类型定义 | 描述 |
|------|----------|----------|------|
| 角色卡 | CharacterCard | `CharacterCard` | 可战斗的角色单位 |
| 技能卡 | Skill | `Skill` | 角色可使用的技能 |
| 装备卡 | Equipment | `Equipment` | 可装备的武器/护甲/饰品 |
| 兽宠卡 | PetCard | `PetCard` | 可携带的宠物 |
| 性别锁 | GenderLock | `GenderLock` | 限制使用性别的标记 |

### 2.4 监狱系统术语

| 术语 | 英文标识 | 类型定义 | 描述 |
|------|----------|----------|------|
| 囚犯 | Prisoner | `Prisoner` | 被关押的角色 |
| 监狱区域 | PrisonArea | `PrisonArea` | 普通牢房/重刑区/劳役区/审讯室 |
| 屈服度 | SubmissionLevel | `Prisoner.submissionLevel` | 囚犯的服从程度 (0-100) |
| 健康度 | Health | `Prisoner.health` | 囚犯的健康状态 (0-100) |
| 劳役位 | LaborSite | `LaborSite` | 矿山/采药的劳役地点 |
| 审讯 | Interrogation | `InterrogationModal` | 对囚犯进行审讯获取情报 |
| 对话类型 | DialogueType | `DialogueType` | 威胁/诱惑/交易/闲聊 |

### 2.5 礼仪系统术语

| 术语 | 英文标识 | 类型定义 | 描述 |
|------|----------|----------|------|
| 语言铁律 | LanguageEtiquette | `LanguageEtiquette` | 语言规范礼仪 |
| 行为着装铁律 | BehaviorDressEtiquette | `BehaviorDressEtiquette` | 行为和着装规范 |
| 礼仪场景 | EtiquetteScene | `EtiquetteScene` | 青楼/角斗场/炼丹房等 |
| 礼仪设计师 | EtiquetteDesigner | `EtiquetteDesigner` | 负责设计礼仪的角色 |
| 主题周 | WeeklyTheme | `WeeklyTheme` | 特定主题的礼仪活动周 |
| 分发状态 | DistributionStatus | `DistributionStatus` | 未分发/已分发/已撤回 |

---

## 3. 技术架构术语

### 3.1 前端架构

| 术语 | 描述 | 相关文件 |
|------|------|----------|
| 组件 (Component) | React 函数组件，负责UI渲染 | `components/*.tsx` |
| 钩子 (Hook) | React 自定义Hook，封装可复用逻辑 | `hooks/*.ts` |
| 服务 (Service) | 业务逻辑层，处理数据和API调用 | `services/*.ts` |
| 类型 (Type) | TypeScript 类型定义 | `types.ts`, `types/*.ts` |
| 常量 (Constant) | 静态配置和初始数据 | `constants.ts` |

### 3.2 SillyTavern 集成

| 术语 | 描述 | API位置 |
|------|------|---------|
| TavernHelper | SillyTavern 提供的辅助API | `window.TavernHelper` |
| 世界书 (Worldbook) | SillyTavern 的知识库系统 | `TavernHelper.getWorldbookEntries()` |
| 角色变量 | 与角色绑定的持久化变量 | `TavernHelper.getVariables({type: 'character'})` |
| 生成API | 调用AI生成内容的接口 | `TavernHelper.generate()` |
| iframe通信 | 与宿主页面的消息传递 | `postMessage` |

### 3.3 存储系统

| 术语 | 描述 | 实现位置 |
|------|------|----------|
| IndexedDB | 浏览器本地数据库 | `services/vectorStorageService.ts` |
| 双适配器模式 | 同时支持多种存储后端 | `services/storageService.ts` |
| 向量存储 | 存储文本的向量表示 | `services/vectorStorageService.ts` |
| 记忆存储 | 存储游戏记忆条目 | `services/memoryService.ts` |

### 3.4 AI系统

| 术语 | 描述 | 实现位置 |
|------|------|----------|
| 上下文构建器 | 构建AI生成所需的上下文 | `services/aiContextBuilder.ts` |
| 上下文增强器 | 增强上下文以提高生成质量 | `services/aiContextEnhancer.ts` |
| 向量化服务 | 将文本转换为向量 | `services/vectorService.ts` |
| 语义搜索 | 基于向量相似度的搜索 | `services/semanticSearchService.ts` |
| 重排序服务 | 对搜索结果进行重排序 | `services/rerankerService.ts` |
| Embedding API | 文本向量化的外部API | OpenAI/Ollama |
| Reranker API | 结果重排序的外部API | Jina/Cohere |

---

## 4. 数据类型术语

### 4.1 核心类型

| 类型名 | 文件位置 | 描述 |
|--------|----------|------|
| `GameState` | `types.ts:L1200+` | 游戏全局状态 |
| `PlayerProfile` | `types.ts:L800+` | 玩家档案信息 |
| `CharacterCard` | `types.ts:L200+` | 角色卡牌数据 |
| `Skill` | `types.ts:L100+` | 技能数据 |
| `Equipment` | `types.ts:L150+` | 装备数据 |
| `PetCard` | `types.ts:L250+` | 宠物数据 |
| `BattleState` | `types.ts:L900+` | 战斗状态 |
| `MemoryEntry` | `types.ts:L1000+` | 记忆条目 |

### 4.2 枚举类型

| 类型名 | 可选值 | 描述 |
|--------|--------|------|
| `Rarity` | 凡品/良品/优品/珍品/绝品/仙品/圣品/神品 | 稀有度等级 |
| `GenderLock` | Male/Female/Universal | 性别限制 |
| `EquipmentType` | Weapon/Armor/Accessory | 装备类型 |
| `MemoryCategory` | 探索/战斗/商城/医馆/悬赏/培育/商业/声望/公告/大牢/其他 | 记忆分类 |
| `PrisonArea` | 普通牢房/重刑区/劳役区/审讯室 | 监狱区域 |
| `DialogueType` | threaten/seduce/negotiate/chat | 对话类型 |

### 4.3 接口类型

| 接口名 | 主要字段 | 描述 |
|--------|----------|------|
| `Attributes` | hp, mp, attack, defense, speed, critRate, critDmg | 角色属性 |
| `StatusEffect` | name, description, mechanicsDescription, duration | 状态效果 |
| `BattleParticipant` | card, currentHp, currentMp, statusEffects, calculatedStats | 战斗参与者 |
| `VectorConfig` | enabled, apiUrl, apiKey, model, similarityThreshold | 向量配置 |
| `EtiquetteSystem` | designer, languageEtiquettes, behaviorDressEtiquettes, settings | 礼仪系统 |

---

## 5. API与服务术语

### 5.1 TavernHelper API

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `getVariables` | `{type: 'character'\|'chat'}` | `object` | 获取变量 |
| `updateVariablesWith` | `(updater, options)` | `Promise<void>` | 更新变量 |
| `generate` | `(prompt, options)` | `Promise<string>` | AI生成 |
| `getWorldbookEntries` | `(worldbookName)` | `WorldbookEntry[]` | 获取世界书条目 |
| `createWorldbook` | `(name, entries)` | `Promise<void>` | 创建世界书 |
| `getWorldbookNames` | - | `string[]` | 获取世界书列表 |

### 5.2 向量服务API

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `vectorize` | `text: string` | `Promise<number[]>` | 单文本向量化 |
| `batchVectorize` | `texts: string[]` | `Promise<number[][]>` | 批量向量化 |
| `cosineSimilarity` | `vecA, vecB` | `number` | 计算余弦相似度 |
| `testConnection` | - | `Promise<{success, error?}>` | 测试API连接 |
| `fetchAvailableModels` | - | `Promise<{models?}>` | 获取可用模型 |

### 5.3 游戏服务API

| 方法 | 文件 | 描述 |
|------|------|------|
| `generateExplorationStep` | `tavernService.ts` | 生成探索步骤 |
| `processCombatTurn` | `tavernService.ts` | 处理战斗回合 |
| `generateRandomCharacter` | `tavernService.ts` | 生成随机角色 |
| `generatePatient` | `tavernService.ts` | 生成医馆病人 |
| `generateBountyTarget` | `tavernService.ts` | 生成悬赏目标 |
| `generateLaborResult` | `tavernService.ts` | 生成劳役结果 |
| `saveGameToSlot` | `tavernService.ts` | 保存游戏 |
| `loadGameFromSlot` | `tavernService.ts` | 加载游戏 |

---

## 附录：术语对照表

### 中英文对照

| 中文 | 英文 | 代码标识 |
|------|------|----------|
| 气血 | Health Points | `hp` |
| 真元 | Mana Points | `mp` |
| 攻击力 | Attack | `attack` |
| 防御力 | Defense | `defense` |
| 速度 | Speed | `speed` |
| 暴击率 | Critical Rate | `critRate` |
| 暴击伤害 | Critical Damage | `critDmg` |
| 魅力 | Charm | `charm` |
| 技巧 | Skillfulness | `skillfulness` |
| 悟性 | Perception | `perception` |
| 灵石 | Spirit Stones | `spiritStones` |
| 声望 | Reputation | `reputation` |
| 境界 | Realm | `realm` |
| 稀有度 | Rarity | `rarity` |
| 称号 | Title | `title` |
| 种族 | Race | `race` |
| 来历 | Origin | `origin` |
| 外观 | Appearance | `appearance` |

### 缩写对照

| 缩写 | 全称 | 描述 |
|------|------|------|
| HP | Health Points | 生命值 |
| MP | Mana Points | 魔法值/真元 |
| ATK | Attack | 攻击力 |
| DEF | Defense | 防御力 |
| SPD | Speed | 速度 |
| CRIT | Critical | 暴击 |
| DMG | Damage | 伤害 |
| AI | Artificial Intelligence | 人工智能 |
| API | Application Programming Interface | 应用程序接口 |
| DB | Database | 数据库 |
| UI | User Interface | 用户界面 |

---

> 📝 **文档说明**: 本词汇表涵盖了仙侠卡牌RPG项目中的核心术语，包括游戏世界观、系统机制、技术架构和数据类型。建议在开发和维护过程中参考此文档以保持术语一致性。