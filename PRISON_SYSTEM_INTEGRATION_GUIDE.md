
# 大牢系统集成指南

## 概述

本指南说明如何将大牢系统集成到游戏主应用中。大牢系统已经完成了设计文档、类型定义和UI组件的创建。

## 已完成的工作

### 1. 设计文档
- ✅ [`PRISON_SYSTEM_DESIGN.md`](./PRISON_SYSTEM_DESIGN.md) - 完整的系统设计文档

### 2. 类型定义
- ✅ [`types.ts`](./types.ts) - 添加了以下类型:
  - `PrisonArea` - 监狱区域类型
  - `CellType` - 牢房类型
  - `PrisonerStatus` - 囚犯状态
  - `TortureMethod` - 刑法方法
  - `InterrogationRecord` - 审讯记录
  - `Prisoner` - 囚犯数据
  - `Guard` - 狱卒数据
  - `LaborTask` - 劳役任务
  - `PrisonEvent` - 监狱事件
  - `PrisonSystem` - 监狱系统状态
  - 更新了 `MemoryCategory` 添加了 '大牢' 分类
  - 更新了 `GameState` 添加了 `prisonSystem: PrisonSystem`

### 3. 位置数据
- ✅ [`locations.ts`](./locations.ts) - 添加了 '镇狱大牢' 位置

### 4. UI组件
- ✅ [`components/PrisonModal.tsx`](./components/PrisonModal.tsx) - 大牢主界面
- ✅ [`components/InterrogationModal.tsx`](./components/InterrogationModal.tsx) - 审讯界面

### 5. 向量存储服务
- ✅ [`services/vectorStorageService.ts`](./services/vectorStorageService.ts) - 更新以支持 '大牢' 记忆分类

## 集成步骤

### 步骤 1: 初始化默认数据

在 `App.tsx` 或专门的初始化文件中添加初始化函数：

```typescript
import { PrisonSystem, PrisonStats, TortureMethod } from './types';

// 初始化默认刑法方法
const initializeTortureMethods = (): TortureMethod[] => {
  return [
    // 基础刑法
    {
      id: 'whipping',
      name: '鞭刑',
      category: 'basic',
      description: '用鞭子抽打囚犯，造成皮肉之苦',
      damage: 20,
      intimidation: 40,
      successRate: 30,
      submissionIncrease: 10,
      risks: {
        death: 2,
        permanentInjury: 5,
        insanity: 3
      }
    },
    {
      id: 'caning',
      name: '杖刑',
      category: 'basic',
      description: '用木杖击打囚犯',
      damage: 30,
      intimidation: 50,
      successRate: 40,
      submissionIncrease: 15,
      risks: {
        death: 5,
        permanentInjury: 10,
        insanity: 5
      }
    },
    {
      id: 'finger_press',
      name: '夹棍',
      category: 'basic',
      description: '夹手指或脚趾，痛苦难忍',
      damage: 40,
      intimidation: 60,
      successRate: 50,
      submissionIncrease: 20,
      risks: {
        death: 3,
        permanentInjury: 25,
        insanity: 10
      }
    },
    // 进阶刑法
    {
      id: 'tiger_bench',
      name: '老虎凳',
      category: 'advanced',
      description: '将囚犯绑在特制凳子上，逐渐增加痛苦',
      damage: 60,
      intimidation: 75,
      successRate: 60,
      submissionIncrease: 30,
      risks: {
        death: 8,
        permanentInjury: 35,
        insanity: 20
      }
    },
    {
      id: 'water_torture',
      name: '水刑',
      category: 'advanced',
      description: '用水灌入囚犯口鼻，造成窒息恐惧',
      damage: 50,
      intimidation: 85,
      successRate: 70,
      submissionIncrease: 35,
      risks: {
        death: 15,
        permanentInjury: 10,
        insanity: 25
      }
    },
    {
      id: 'fire_torture',
      name: '火刑',
      category: 'advanced',
      description: '使用烙铁或火焰灼烧囚犯',
      damage: 80,
      intimidation: 90,
      successRate: 75,
      submissionIncrease: 40,
      risks: {
        death: 20,
        permanentInjury: 60,
        insanity: 30
      }
    },
    // 特殊刑法
    {
      id: 'soul_search',
      name: '灵魂搜索',
      category: 'special',
      description: '直接读取囚犯记忆，需要强大的灵识',
      damage: 30,
      intimidation: 95,
      successRate: 90,
      submissionIncrease: 50,
      requirements: {
        skill: '灵识术',
        cost: 100
      },
      risks: {
        death: 5,
        permanentInjury: 15,
        insanity: 40
      }
    },
    {
      id: 'illusion_torture',
      name: '幻境折磨',
      category: 'special',
      description: '使囚犯陷入痛苦幻境，精神摧残',
      damage: 20,
      intimidation: 95,
      successRate: 85,
      submissionIncrease: 45,
      requirements: {
        skill: '幻术',
        cost: 80
      },
      risks: {
        death: 3,
        permanentInjury: 5,
        insanity: 60
      }
    },
    {
      id: 'living_hell',
      name: '生不如死',
      category: 'special',
      description: '最残酷的刑法组合，几乎无人能抵抗',
      damage: 95,
      intimidation: 100,
      successRate: 95,
      submissionIncrease: 100,
      requirements: {
        cost: 200
      },
      risks: {
        death: 50,
        permanentInjury: 80,
        insanity: 70
      }
    }
  ];
};

// 初始化监狱系统
const initializePrisonSystem = (): PrisonSystem => {
  const emptyStats: PrisonStats = {
    totalPrisoners: 0,
    byArea: {
      '居住区': 0,
      '审讯区': 0,
      '娱乐区': 0,
      '劳役区': 0,
      '管理区': 0,
      '医疗区': 0
    },
    byCellType: {
      '普通牢房': 0,
      '重犯牢房': 0,
      '单独囚室': 0
    },
    avgSubmission: 0,
    avgLoyalty: 0,
    avgHealth: 0,
    totalGuards: 5,
    escapeAttempts: 0,
    successfulEscapes: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  };

  return {
    prisoners: [],
    guards: [],
    facilities: [],
    laborTasks: [],
    laborRecords: [],
    events: [],
    ransomOffers: [],
    stats: emptyStats,
    config: {
      maxPrisoners: 50,
      dailyFoodCost: 10,
      securityLevel: 5,
      enableAutoInterrogation: false,
      enableAutoLabor: false
    }
  };
};
```

### 步骤 2: 在 GameState 中添加监狱系统

确保在初始化 `GameState` 时包含监狱系统：

```typescript
const initialGameState: GameState = {
  // ... 其他状态
  prisonSystem: initializePrisonSystem(),
  memories: {
    // ... 其他分类
    大牢: []
  },
  memorySummaries: {
    // ... 其他分类
    大牢: { small: [], large: [] }
  }
};
```

### 步骤 3: 添加大牢相关的状态和处理函数

在 `App.tsx` 中添加：

```typescript
const [showPrisonModal, setShowPrisonModal] = useState(false);
const [showInterrogationModal, setShowInterrogationModal] = useState(false);
const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
const [interrogationLog, setInterrogationLog] = useState<string>('');
const [tortureMethods] = useState<TortureMethod[]>(initializeTortureMethods());

// 打开大牢界面
const handleOpenPrison = () => {
  setShowPrisonModal(true);
};

// 开始审讯
const handleInterrogatePrisoner = (prisonerId: string) => {
  const prisoner = gameState.prisonSystem.prisoners.find(p => p.id === prisonerId);
  if (prisoner) {
    setSelectedPrisoner(prisoner);
    setShowInterrogationModal(true);
    setInterrogationLog('');
  }
};

// 执行刑罚
const handleExecuteTorture = async (prisonerId: string, methodId: string, duration: number) => {
  const prisoner = gameState.prisonSystem.prisoners.find(p => p.id === prisonerId);
  const method = tortureMethods.find(m => m.id === methodId);
  
  if (!prisoner || !method) return;

  // 这里调用AI生成审讯结果
  // 可以参考 HospitalModal 的问诊流程
  const prompt = `
    场景：镇狱大牢审讯室
    囚犯：${prisoner.name}，${prisoner.gender === 'Male' ? '男性' : '女性'}，修为${prisoner.realm}
    罪行：${prisoner.crime}
    当前状态：健康${prisoner.health}%，神智${prisoner.sanity}%，屈服度${prisoner.submissionLevel}%
    
    刑法：${method.name}（${method.description}）
    持续时间：${duration}分钟
    
    请生成一段详细的审讯过程描述，包括：
    1. 刑罚的执行过程
    2. 囚犯的反应和挣扎
    3. 是否成功获取情报
    4. 囚犯的身体和精神变化
    
    要求生动、有氛围感，符合修仙世界观。
  `;

  // 调用 AI 生成
  // const result = await generateWithAI(prompt);
  // setInterrogationLog(result);
  
  // 更新囚犯状态
  // updatePrisonerAfterInterrogation(prisoner, method, result);
};

// 查看囚犯详情
const handleViewPrisonerDetail = (prisoner: Prisoner) => {
  // 显示囚犯详细信息模态框
  console.log('查看囚犯详情:', prisoner);
};

// 释放囚犯
const handleReleasePrisoner = (prisonerId: string) => {
  setGameState(prev => ({
    ...prev,
    prisonSystem: {
      ...prev.prisonSystem,
      prisoners: prev.prisonSystem.prisoners.filter(p => p.id !== prisonerId)
    }
  }));
};

// 招募囚犯
const handleRecruitPrisoner = (prisonerId: string) => {
  const prisoner = gameState.prisonSystem.prisoners.find(p => p.id === prisonerId);
  if (prisoner && prisoner.loyaltyLevel >= 80) {
    // 将囚犯转换为可用角色
    // 添加到队伍或角色集合
    console.log('招募囚犯:', prisoner.name);
  }
};
```

### 步骤 4: 添加UI入口

在主界面添加大牢入口，例如在侧边栏或地图上：

```typescript
// 在 Sidebar.tsx 或其他合适的位置添加按钮
<button
  onClick={handleOpenPrison}
  className="w-full px-4 py-3 text-left hover:bg-stone-700/50 transition-colors flex items-center gap-3"
>
  <i className="fa-solid fa-dungeon text-red-400"></i>
  <span>镇狱大牢</span>
  {gameState.prisonSystem.prisoners.length > 0 && (
    <span className="ml-auto bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
      {gameState.prisonSystem.prisoners.length}
    </span>
  )}
</button>
```

### 步骤 5: 渲染模态框

在 `App.tsx` 的 return 部分添加：

```typescript
{showPrisonModal && (
  <PrisonModal
    isOpen={showPrisonModal}
    onClose={() => setShowPrisonModal(false)}
    prisonSystem={gameState.prisonSystem}
    onInterrogatePrisoner={handleInterrogatePrisoner}
    onViewPrisonerDetail={handleViewPrisonerDetail}
    onTransferPrisoner={(prisonerId, newArea) => {
      // 转移囚犯到新区域
    }}
    onReleasePrisoner={handleReleasePrisoner}
    onRecruitPrisoner={handleRecruitPrisoner}
    onAssignLabor={(prisonerId, taskId) => {
      // 分配劳役任务
    }}
    onGenerateEvent={() => {
      // 生成随机事件
    }}
    isLoading={isLoading}
  />
)}

{showInterrogationModal && selectedPrisoner && (
  <InterrogationModal
    isOpen={showInterrogationModal}
    onClose={() => setShowInterrogationModal(false)}
    prisoner={selectedPrisoner}
    availableTortureMethods={tortureMethods}
    onExecuteTorture={handleExecuteTorture}
    onEndInterrogation={() => {
      setShowInterrogationModal(false);
      setSelectedPrisoner(null);
      setInterrogationLog('');
    }}
    interrogationLog={interrogationLog}
    isLoading={isLoading}
  />
)}
```

## 与AI集成

### 生成囚犯

可以通过AI生成随机囚犯：

```typescript
const generatePrisoner = async (): Promise<Prisoner> => {
  const prompt = `
    