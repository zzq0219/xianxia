# 大闯关赛事系统 - 完整设计文档 V2

> 本文档包含完整的类型定义、AI服务、UI设计、流程控制和实施计划

---

## 📋 目录

1. [系统概述](#系统概述)
2. [核心类型定义](#核心类型定义)
3. [AI服务层设计](#ai服务层设计)
4. [UI界面详细设计](#ui界面详细设计)
5. [赛事流程控制](#赛事流程控制)
6. [分阶段实施计划](#分阶段实施计划)

---

## 系统概述

### 基本信息

- **名称**：大闯关赛事系统
- **类型**：综艺闯关竞赛
- **赛制**：64人→32→16→8→4→2→1（6轮淘汰赛）
- **周期**：每月一次
- **驱动**：全程AI生成内容

### 核心流程

```
倒计时 → 报名 → 准备（生成关卡+优化）→ 比赛（6轮）→ 结束
```

### 关键特点

1. **赛前准备**：AI一次性生成6轮关卡草稿，每个关卡经过3轮优化
2. **公告栏系统**：玩家可查看所有关卡的草稿和优化过程
3. **直播风格**：综艺节目直播间布局，含弹幕、解说、评委
4. **弹幕互动**：玩家每发一条弹幕，触发AI生成新叙事+解说+观众弹幕

---

## 核心类型定义

创建文件：[`types/gauntlet.types.ts`](types/gauntlet.types.ts:1)

### 基础枚举类型

```typescript
// 赛事状态
export type GauntletStatus = 
  | 'countdown'      // 倒计时阶段
  | 'registration'   // 报名阶段
  | 'preparing'      // 准备阶段
  | 'in_progress'    // 比赛进行中
  | 'completed';     // 已结束

// 轮次状态
export type RoundStatus = 
  | 'pending'        // 等待中
  | 'draft'          // 已生成草稿
  | 'optimizing'     // 优化中
  | 'ready'          // 准备就绪
  | 'in_progress'    // 进行中
  | 'judging'        // 评分中
  | 'completed';     // 已完成

// 关卡类型
export type ChallengeType = 
  | '解谜'    // 智力解谜
  | '竞技'    // 速度竞技
  | '体能'    // 体能挑战
  | '技巧'    // 技巧展示
  | '智力'    // 智力考验
  | '综合';   // 综合挑战
```

### 参赛者数据结构

```typescript
export interface GauntletContestant {
  id: string;
  name: string;
  gender: 'Female';
  realm: string;              // 境界
  appearance: string;         // 外观描述
  specialTrait: string;       // 特殊特点
  charm: number;              // 魅力值 0-100
  skillfulness: number;       // 技巧值 0-100
  
  // 赛事相关
  status: 'active' | 'eliminated' | 'winner';
  currentScore: number;       // 当前总分
  roundScores: number[];      // 每轮得分
  eliminatedRound?: number;   // 被淘汰的轮次
  
  // 玩家角色标识
  isPlayerCharacter: boolean;
  characterCardId?: string;   // 如果是玩家角色，关联的卡牌ID
}
```

### 评委数据结构

```typescript
export interface GauntletJudge {
  id: string;
  name: string;
  title: string;              // 称号
  realm: string;              // 境界
  personality: string;        // 性格特点
  judgingStyle: string;       // 评判风格
  specialty: string;          // 专长领域
  avatar?: string;
}
```

### 关卡设计数据结构

```typescript
export interface ChallengeDesign {
  id: string;
  roundNumber: number;        // 第几轮 (1-6)
  type: ChallengeType;
  name: string;               // 关卡名称
  description: string;        // 详细描述
  
  // 规则
  rules: string[];            // 规则列表
  winCondition: string;       // 获胜条件
  eliminationCriteria: string; // 淘汰标准
  
  // 难度和时长
  difficulty: number;         // 1-10
  estimatedDuration: string;  // 如"30分钟"
  
  // 优化历程
  draftVersion: string;       // 初始草稿
  optimization1?: ChallengeOptimization;
  optimization2?: ChallengeOptimization;
  optimization3?: ChallengeOptimization;
  finalVersion: string;       // 最终版本
  
  // 状态
  optimizationProgress: 0 | 1 | 2 | 3; // 完成了几轮优化
}

export interface ChallengeOptimization {
  round: 1 | 2 | 3;
  timestamp: number;
  
  // AI生成内容
  critique: string;           // 批判分析
  issues: string[];           // 发现的问题
  suggestions: string[];      // 改进建议
  
  // 优化结果
  changes: string[];          // 实际修改内容
  optimizedDesign: string;    // 优化后的完整设计
  improvementSummary: string; // 改进总结
}
```

### 表现和评分数据结构

```typescript
export interface ContestantPerformance {
  contestantId: string;
  contestantName: string;
  roundNumber: number;
  
  score: number;              // 本轮得分 0-100
  rank: number;               // 本轮排名
  
  narrative: string;          // AI生成的完整表现叙事
  highlights: string[];       // 精彩瞬间
  mistakes: string[];         // 失误记录
  
  passed: boolean;            // 是否晋级
}

export interface JudgeScore {
  judgeId: string;
  judgeName: string;
  contestantId: string;
  roundNumber: number;
  
  score: number;              // 0-100
  comment: string;            // 评语
}
```

### 弹幕和解说数据结构

```typescript
export interface Danmaku {
  id: string;
  content: string;
  timestamp: number;
  
  type: 'player' | 'ai_generated' | 'system';
  author?: string;            // 发送者名称
  color?: string;             // 弹幕颜色
}

export interface Commentary {
  id: string;
  timestamp: number;
  roundNumber: number;
  
  phase: 'opening' | 'during' | 'highlight' | 'closing' | 'judging';
  content: string;
  speaker: string;            // 解说员名称
}
```

### 轮次和赛事主数据结构

```typescript
export interface GauntletRound {
  roundNumber: number;        // 1-6
  status: RoundStatus;
  
  challenge: ChallengeDesign;
  
  contestantIds: string[];    // 本轮参赛者ID列表
  performances: ContestantPerformance[];
  judgeScores: JudgeScore[];
  
  commentary: Commentary[];
  danmakuHistory: Danmaku[];
  
  rankings: RankingEntry[];   // 本轮排行
  advancingIds: string[];     // 晋级者ID
  eliminatedIds: string[];    // 淘汰者ID
  
  startTime?: number;
  endTime?: number;
}

export interface GauntletEvent {
  id: string;
  edition: number;            // 第几届
  name: string;
  status: GauntletStatus;
  
  scheduledDate: number;
  registrationDeadline: number;
  startTime?: number;
  endTime?: number;
  
  contestants: GauntletContestant[];
  judges: GauntletJudge[];
  playerContestantId?: string;
  
  challengesGenerated: boolean;
  allOptimizationsComplete: boolean;
  
  currentRound: number;       // 0-6
  rounds: GauntletRound[];
  
  champion?: GauntletContestant;
  finalRankings: RankingEntry[];
  
  viewMode: 'group' | 'individual';
  focusedContestantId?: string;
  
  isLive: boolean;
  currentPhase?: 'performance' | 'judging' | 'result';
}
```

### 系统状态数据结构

```typescript
export interface GauntletSystem {
  currentEvent: GauntletEvent | null;
  eventHistory: GauntletEventHistory[];
  totalEditions: number;
  nextEventDate: number;
  
  playerStats: {
    participations: number;
    wins: number;
    bestRank: number;
    totalScore: number;
  };
  
  config: {
    monthlySchedule: number;  // 每月第几天举行
    registrationDuration: number; // 报名时长（小时）
    enableAutoGeneration: boolean;
  };
}
```

---

## AI服务层设计

创建文件：[`services/gauntlet/gauntletAIService.ts`](services/gauntlet/gauntletAIService.ts:1)

### 服务类结构

```typescript
import { enhancedGenerate } from '../enhancedAIGenerator';
import { GameState } from '../../types';

export class GauntletAIService {
  // 1. 生成参赛者
  async generateContestants(count: number, gameState: GameState)
  
  // 2. 生成评委
  async generateJudges(count: number, gameState: GameState)
  
  // 3. 生成关卡草稿
  async generateChallengeDraft(roundNumber: number, gameState: GameState)
  
  // 4. 批量生成所有关卡草稿
  async generateAllChallengeDrafts(gameState: GameState)
  
  // 5. 关卡优化
  async optimizeChallenge(
    challenge: ChallengeDesign, 
    optimizationRound: 1 | 2 | 3,
    gameState: GameState
  )
  
  // 6. 生成参赛者表现（群体模式）
  async generateGroupPerformance(
    contestants: GauntletContestant[],
    challenge: ChallengeDesign,
    gameState: GameState
  )
  
  // 7. 生成参赛者表现（个人模式）
  async generateIndividualPerformance(
    contestant: GauntletContestant,
    challenge: ChallengeDesign,
    gameState: GameState
  )
  
  // 8. 生成评委评分
  async generateJudgeScores(
    judges: GauntletJudge[],
    performance: ContestantPerformance,
    gameState: GameState
  )
  
  // 9. 生成解说
  async generateCommentary(
    phase: Commentary['phase'],
    context: object,
    gameState: GameState
  )
  
  // 10. 生成弹幕回应
  async generateDanmakuResponse(
    playerInput: string,
    context: object,
    gameState: GameState
  )
}
```

### 调用示例

```typescript
// 生成参赛者
const systemInstruction = `生成${count}名女性参赛者...`;
const prompt = `生成参赛者列表`;

const result = await enhancedGenerate({
  systemInstruction,
  prompt,
  gameState,
  includeVectorMemories: false,
  includePreset: true,
  includeWorldbook: true
});

return JSON.parse(result);
```

---

## UI界面详细设计

### 组件目录结构

```
components/gauntlet/
  ├── GauntletHallModal.tsx           # 大厅主界面
  ├── GauntletAnnouncementModal.tsx   # 公告栏
  ├── GauntletRegistrationModal.tsx   # 报名界面
  ├── GauntletLiveModal.tsx           # 直播间主界面
  ├── NarrativeDisplay.tsx            # 叙事展示区
  ├── DanmakuChat.tsx                 # 弹幕聊天室
  ├── CommentaryBox.tsx               # 解说框
  ├── JudgePanel.tsx                  # 评委席
  ├── RankingPanel.tsx                # 排行榜
  └── GauntletResultModal.tsx         # 结果展示
```

### 1. 大厅界面设计

**文件**：[`components/gauntlet/GauntletHallModal.tsx`](components/gauntlet/GauntletHallModal.tsx:1)

**布局草图**：

```
┌──────────────────────────────────────────────────────┐
│  [×]           大闯关赛事大厅                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│          🏆 第 X 届天下第一闯关大赛 🏆                │
│                                                      │
│              状态：【倒计时中】                       │
│          距离开赛还有：15天 6小时 23分                │
│                                                      │
│          [──────────报名入口──────────]              │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [历届冠军]  [赛事规则]  [关卡公告]                  │
│                                                      │
│  我的参赛记录：                                       │
│  • 参赛次数：3次                                     │
│  • 最佳排名：第8名                                   │
│  • 累计得分：2350分                                  │
│                                                      │
│                  [返回主界面]                         │
└──────────────────────────────────────────────────────┘
```

**状态显示**：
- 倒计时中：显示距离开赛时间
- 报名中：报名入口高亮，显示截止时间
- 准备中：显示"关卡准备中"
- 进行中：显示"比赛进行中"，可进入观看
- 已结束：显示冠军信息

### 2. 公告栏界面设计

**文件**：[`components/gauntlet/GauntletAnnouncementModal.tsx`](components/gauntlet/GauntletAnnouncementModal.tsx:1)

**布局草图**：

```
┌──────────────────────────────────────────────────────┐
│  [×]        第 X 届大闯关 - 关卡公告栏                │
├──────────────────────────────────────────────────────┤
│  [生成全部草稿] [开始全部优化] [优化进度：6/18]      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ▼ 第一轮：水上疾行                                  │
│  ├─ 类型：体能  难度：★☆☆☆☆                       │
│  ├─ 状态：✓ 已完成三轮优化                          │
│  ├─ [查看草稿] [优化1] [优化2] [优化3]              │
│  └─ [查看最终版本]                                  │
│                                                      │
│  ▼ 第二轮：谜题迷宫                                  │
│  ├─ 类型：解谜  难度：★★☆☆☆                       │
│  ├─ 状态：优化中 (2/3)                              │
│  ├─ [查看草稿] [优化1] [优化2] [执行优化3]          │
│                                                      │
│  ... 第三至六轮 ...                                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**优化详情弹窗**：

```
┌────────────────────────────────────────┐
│  第二轮关卡 - 第1次优化                │
├────────────────────────────────────────┤
│  【批判分析】                          │
│  当前设计存在以下问题：...             │
│                                        │
│  【改进建议】                          │
│  • 增加限时机制                        │
│  • 调整谜题梯度                        │
│                                        │
│  【修改内容】                          │
│  1. 时间从10分钟改为5分钟              │
│  2. 谜题分为三档                       │
│                                        │
│  【改进总结】                          │
│  本次优化提升了紧张度...               │
│                                        │
│     [上一次] [下一次] [关闭]           │
└────────────────────────────────────────┘
```

### 3. 直播间主界面设计

**文件**：[`components/gauntlet/GauntletLiveModal.tsx`](components/gauntlet/GauntletLiveModal.tsx:1)

**布局草图**：

```
┌────────────────────────────────────────────────────────┐
│  [<]  第X届大闯关 - 第2轮：谜题迷宫   [设置] [全屏]   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │          【表演/叙事展示区】                     │ │
│  │                                                  │ │
│  │  云梦仙子轻盈一跃，落在第一个浮板上...          │ │
│  │  只见她纤手一挥，灵气化作一道光芒...            │ │
│  │                                                  │ │
│  │  ═══════════════════════════════════════════    │ │
│  │  ↑ 666 ↑ 太强了 ↑ 云梦加油 ↑ 这波稳了 ↑        │ │
│  │  ═══════════════════════════════════════════    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────┐  ┌────────────────────────────────┐    │
│  │ 解说席   │  │         评委席                 │    │
│  │ 💬 精彩！ │  │  [严判官] [柔导师] [智长老]   │    │
│  │ 云梦这招 │  │      [评分阶段尚未开始]        │    │
│  └──────────┘  └────────────────────────────────┘    │
│                                                        │
│  [参赛者] [关卡] [排名] [回放]                        │
│                                                        │
│  观看: ⦿群体 ○个人   弹幕: [_______][发送]           │
└────────────────────────────────────────────────────────┘
```

**弹幕聊天室（底部展开）**：

```
┌──────────────────────────────────┐
│  弹幕区                          │
├──────────────────────────────────┤
│  观众A：666666                   │
│  观众B：云梦加油！               │
│  【你】：太厉害了                │
│  解说员：这招确实漂亮！          │
│  ...                             │
└──────────────────────────────────┘
```

---

## 赛事流程控制

### 完整流程图

```
游戏启动
  ↓
检查赛事状态
  ├─ 无赛事 → 创建新赛事（倒计时）
  ├─ 倒计时 → 显示倒计时
  ├─ 报名中 → 显示报名界面
  ├─ 准备中 → 显示关卡准备进度
  ├─ 进行中 → 进入直播间
  └─ 已结束 → 显示结果
```

### 准备阶段详细流程

```
报名截止
  ↓
生成AI参赛者(63人)
  ↓
生成评委(3-5人)
  ↓
生成6轮关卡草稿
  ↓
第1轮关卡优化1
  ↓
第1轮关卡优化2
  ↓
第1轮关卡优化3
  ↓
第2轮关卡优化1
  ↓
... 依次优化所有关卡 ...
  ↓
准备完成，开始比赛
```

### 单轮比赛流程

```
第N轮开始
  ↓
生成开场解说
  ↓
展示关卡信息
  ↓
表演阶段
  ├─ 群体模式：生成所有人表现
  └─ 个人模式：聚焦某人详细叙事
  ↓
玩家发弹幕 → AI生成新叙事+解说+观众弹幕
  ↓
表演结束
  ↓
评分阶段（评委打分）
  ↓
计算排名
  ↓
公布晋级名单
  ↓
生成结束解说
  ↓
第N轮结束
```

---

## 分阶段实施计划

### 阶段1：类型定义（2-3小时）
- [ ] 创建 [`types/gauntlet.types.ts`](types/gauntlet.types.ts:1)
- [ ] 扩展 [`types.ts`](types.ts:229) 中的 [`GameState`](types.ts:199)
- [ ] 创建默认数据生成函数

### 阶段2：AI服务层（6-8小时）
- [ ] 创建 [`services/gauntlet/gauntletAIService.ts`](services/gauntlet/gauntletAIService.ts:1)
- [ ] 实现10个AI生成函数
- [ ] 测试AI生成质量

### 阶段3：UI组件（8-10小时）
- [ ] [`GauntletHallModal.tsx`](components/gauntlet/GauntletHallModal.tsx:1) - 大厅
- [ ] [`GauntletAnnouncementModal.tsx`](components/gauntlet/GauntletAnnouncementModal.tsx:1) - 公告栏
- [ ] [`GauntletRegistrationModal.tsx`](components/gauntlet/GauntletRegistrationModal.tsx:1) - 报名
- [ ] [`GauntletLiveModal.tsx`](components/gauntlet/GauntletLiveModal.tsx:1) - 直播间
- [ ] 其他辅助组件

### 阶段4：流程控制（5-6小时）
- [ ] 创建 [`services/gauntlet/gauntletEventService.ts`](services/gauntlet/gauntletEventService.ts:1)
- [ ] 创建 [`services/gauntlet/gauntletFlowService.ts`](services/gauntlet/gauntletFlowService.ts:1)
- [ ] 实现赛事生命周期管理

### 阶段5：测试优化（4-5小时）
- [ ] 完整流程测试
- [ ] AI生成调优
- [ ] 性能优化

**总工时：25-32小时**

---

## 附录

### 弹幕交互示例

```
玩家输入："云梦加油！"
  ↓
调用 generateDanmakuResponse()
  ↓
AI返回：
  {
    narrative: "云梦听到观众的呐喊，嘴角微微上扬...",
    commentary: "看来观众对云梦的支持很高！",
    danmakus: ["观众A：确实强！", ...]
  }
  ↓
更新界面
```

### 优化按钮行为

- **生成全部草稿**：一次性生成6轮草稿
- **开始全部优化**：批量执行一轮优化
- **执行优化X**：单独执行第X轮优化

---

## 下一步

请确认此设计是否满足需求。确认后可以切换到 Code 模式开始实现。