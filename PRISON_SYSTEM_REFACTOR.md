# 大牢系统重构总结

## 概述

本文档记录了大牢系统从独立数据结构重构为基于角色卡牌（CharacterCard）的完整过程。

## 重构目标

1. **统一数据结构**：囚犯使用角色卡牌作为基础，避免数据重复
2. **功能互通**：不同区域的囚犯可以相互转移
3. **与悬赏系统集成**：红尘录悬赏成功后可直接将目标压入大牢

## 核心变更

### 1. Prisoner 接口重构

**重构前：**
```typescript
export interface Prisoner {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  realm: string;
  // ... 大量重复的角色属性
}
```

**重构后：**
```typescript
export interface Prisoner {
  character: CharacterCard; // 直接使用角色卡牌
  crime: string;
  sentence: number;
  remainingDays: number;
  submissionLevel: number; // 屈服度 0-100
  loyaltyLevel: number; // 归顺度 0-100
  health: number; // 健康度 0-100
  sanity: number; // 神智 0-100
  location: PrisonArea;
  cellType: CellType;
  // ... 其他监狱特有属性
}
```

### 2. 新增属性

为了支持审讯系统，在 Prisoner 接口中新增了两个关键属性：
- `health`: 健康度（0-100），受刑法影响
- `sanity`: 神智（0-100），受刑法和审讯影响

### 3. 组件更新

#### InterrogationModal.tsx
- 修改所有对囚犯属性的访问：`prisoner.name` → `prisoner.character.name`
- 适配新的 Prisoner 结构，使用 `prisoner.character.id` 作为唯一标识
- 保留 `prisoner.health` 和 `prisoner.sanity` 的直接访问

#### PrisonModal.tsx
- 添加区域转移下拉菜单
- 修改函数签名，传递完整的 Prisoner 对象而非仅 ID
- 使用 `prisoner.character.*` 访问角色属性

### 4. 示例数据更新

在 `constants.ts` 中更新了 examplePrisoner：
```typescript
const bloodDemonCharacter: CharacterCard = {
  id: 'prisoner-char-01',
  name: '血影魔君',
  // ... 完整的角色卡牌数据
};

export const examplePrisoner = {
  character: bloodDemonCharacter,
  crime: '屠杀无辜村民，吸取血气修炼魔功',
  submissionLevel: 20,
  loyaltyLevel: 5,
  health: 85,
  sanity: 90,
  // ... 其他监狱属性
};
```

## 大牢系统设计

### 区域划分

监狱分为6个主要区域：

1. **居住区**：囚犯的基本生活区域
   - 普通牢房、重犯牢房、单独囚室

2. **审讯区**：执行各种刑法和审讯
   - 基础刑法：鞭打、水刑、吊刑等
   - 进阶刑法：烙印、骨夹、灌毒等
   - 特殊刑法：心魔侵蚀、神魂拷问等

3. **娱乐区**：囚犯放风和娱乐
   - 提升囚犯精神状态
   - 降低暴动风险

4. **劳役区**：囚犯进行劳动
   - 采矿、炼药、符箓制作、器具维修
   - 产生经济收益

5. **管理区**：监狱管理中心
   - 狱卒管理
   - 设施升级
   - 统计查看

6. **医疗区**：治疗受伤囚犯
   - 恢复健康度
   - 治疗特殊状态

### 刑法系统

#### 基础刑法（绿色）
- 低风险、低效果
- 适合初期审讯
- 例如：木马、鞭打、冷水浸泡

#### 进阶刑法（橙色）
- 中等风险、中等效果
- 需要特定技能或道具
- 例如：烙印、骨夹、灌毒

#### 特殊刑法（紫色）
- 高风险、高效果
- 可能导致永久伤害或疯狂
- 例如：心魔侵蚀、神魂拷问、血脉封印

#### 刑法属性
- **伤害**：对健康度的影响
- **威慑**：心理压力
- **成功率**：获取情报的概率
- **屈服度增加**：每次使用增加的屈服度
- **风险评估**：死亡、重伤、疯狂三种风险

### 囚犯状态

囚犯可能处于以下状态：
- 健康、受伤、重伤、生病、疯狂、垂危
- 禁闭中、劳役中、审讯中

### 价值评估

每个囚犯都有三种价值：
1. **赎金价值**：可以向其势力索要赎金
2. **劳役价值**：用于劳动产出
3. **情报价值**：可获取的情报重要性

### 归顺机制

- **屈服度**（0-100）：受刑法影响，表示囚犯的抵抗意志
- **归顺度**（0-100）：受时间和对待方式影响，达到一定值可招募
- 当归顺度达到80以上且屈服度达到60以上时，可将囚犯招募为己用

## 待实现功能

### 1. 区域转移功能
```typescript
const handleTransferPrisoner = (prisoner: Prisoner, newArea: PrisonArea) => {
  setGameState(prev => ({
    ...prev,
    prisonSystem: {
      ...prev.prisonSystem,
      prisoners: prev.prisonSystem.prisoners.map(p =>
        p.character.id === prisoner.character.id 
          ? { ...p, location: newArea } 
          : p
      )
    }
  }));
};
```

### 2. 红尘录集成
在悬赏完成时，如果选择"压入大牢"：
```typescript
if (outcome === 'imprisoned') {
  const newPrisoner: Prisoner = {
    character: bountyTarget.character,
    crime: `悬赏目标 - ${bountyTarget.specialTrait}`,
    sentence: 365, // 一年刑期
    remainingDays: 365,
    submissionLevel: 0,
    loyaltyLevel: 0,
    health: 50, // 战斗后受伤
    sanity: 80,
    location: '居住区',
    cellType: '重犯牢房',
    // ... 其他属性
  };
  
  // 添加到监狱系统
}
```

### 3. 查看完整角色卡片
点击囚犯时，应该调用 CharacterDetail 组件显示完整的角色卡片信息。

### 4. 劳役系统
- 分配囚犯到不同劳役任务
- 根据囚犯的境界和技能计算产出
- 定期结算劳役收益

### 5. 事件系统
- 暴动事件
- 越狱尝试
- 囚犯冲突
- 招供事件
- 归顺事件

## 技术要点

### 数据访问模式

**访问角色属性：**
```typescript
prisoner.character.name
prisoner.character.realm
prisoner.character.skills
prisoner.character.baseAttributes
```

**访问监狱属性：**
```typescript
prisoner.submissionLevel
prisoner.loyaltyLevel
prisoner.health
prisoner.sanity
prisoner.location
```

### 唯一标识
使用 `prisoner.character.id` 作为囚犯的唯一标识符。

### 函数签名更新
所有处理囚犯的函数应该接受完整的 Prisoner 对象：
```typescript
// 旧方式
onInterrogatePrisoner(prisonerId: string)

// 新方式
onInterrogatePrisoner(prisoner: Prisoner)
```

## 优势

1. **数据一致性**：角色数据只在 CharacterCard 中维护一份
2. **功能复用**：可以直接使用现有的角色卡片组件和功能
3. **易于扩展**：新增囚犯功能时不需要重复定义角色属性
4. **与其他系统集成**：可以轻松地将角色在不同系统间转换（悬赏→监狱→队伍）

## 下一步计划

1. 完成 App.tsx 中所有 Prisoner 相关函数的更新
2. 实现区域转移功能
3. 集成红尘录悬赏系统
4. 添加查看完整角色卡片功能
5. 实现劳役系统
6. 添加监狱事件系统
7. 完善狱卒管理
8. 添加赎金交易系统

## 文件清单

- `types.ts` - Prisoner 接口及相关类型定义
- `constants.ts` - 示例囚犯数据
- `components/PrisonModal.tsx` - 大牢主界面
- `components/InterrogationModal.tsx` - 审讯界面
- `locations.ts` - 大牢位置定义
- `App.tsx` - 大牢系统集成

---

**最后更新**: 2025-11-22
**版本**: 1.0