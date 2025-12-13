# 抽卡系统概率修复总结

## 修复日期
2025-01-16

## 问题描述

在原有的抽卡系统中，存在以下问题：

1. **同人卡池没有使用概率系统**：同人卡池（异界降临、神兵天成、大道顿悟、灵兽创生）直接调用AI生成函数，完全由AI决定稀有度，没有遵循游戏设定的概率权重。

2. **概率不统一**：常规卡池使用了正确的概率系统，但同人卡池没有，导致两种卡池的稀有度分布不一致。

## 修复方案

### 1. 修改同人生成函数签名

在 [`services/tavernService.ts`](services/tavernService.ts) 中，为所有同人生成函数添加了可选的 `rarity` 参数：

- [`generateDoujinCharacter(inspiration, rarity?, gameState?)`](services/tavernService.ts:438)
- [`generateDoujinEquipment(inspiration, rarity?, gameState?)`](services/tavernService.ts:1156)
- [`generateDoujinSkill(inspiration, rarity?, genderLock, gameState?)`](services/tavernService.ts:1279)
- [`generateDoujinPet(inspiration, rarity?, gameState?)`](services/tavernService.ts:1019)

### 2. 增强AI提示词

当提供稀有度参数时，在系统提示词中明确要求AI生成指定稀有度的物品：

```typescript
const rarityInstruction = rarity 
    ? `\n\n**重要：你必须生成稀有度为【${rarity}】的角色！这是系统根据概率随机决定的，你必须严格遵守。**` 
    : '';
```

### 3. 修改商城抽卡逻辑

在 [`components/Shop.tsx`](components/Shop.tsx) 中修改了 [`handleDoujinPull()`](components/Shop.tsx:401) 函数：

**修改前**：
```typescript
// 直接调用生成函数，没有稀有度控制
result = await generateDoujinCharacter(inspiration);
```

**修改后**：
```typescript
// 先使用概率系统确定稀有度
const rarity = determineRarity('permanent', false);
console.log(`🎲 同人卡池抽取稀有度: ${rarity}`);

// 然后传入稀有度参数
result = await generateDoujinCharacter(inspiration, rarity);
```

## 概率系统详解

### 常规卡池概率（PERMANENT_RARITY_WEIGHTS）

| 稀有度 | 概率 |
|--------|------|
| 凡品 | 45% |
| 良品 | 30% |
| 优品 | 15% |
| 珍品 | 5% |
| 绝品 | 3% |
| 仙品 | 1.5% |
| 圣品 | 0.4% |
| 神品 | 0.1% |

### 限定卡池概率（LIMITED_RARITY_WEIGHTS）

| 稀有度 | 概率 | 变化 |
|--------|------|------|
| 凡品 | 35% | ↓ |
| 良品 | 25% | ↓ |
| 优品 | 18% | ↑ |
| 珍品 | 8% | ↑ |
| 绝品 | 6% | ↑ |
| 仙品 | 5% | ↑ |
| 圣品 | 2% | ↑ |
| 神品 | 1% | ↑ |

### 概率计算方法

使用加权随机算法（[`determineRarity()`](components/Shop.tsx:208-231)）：

1. 创建加权列表，每个稀有度按其权重添加
2. 计算总权重
3. 生成 0 到总权重之间的随机数
4. 从列表中依次减去权重，当随机数小于等于0时返回当前稀有度

```typescript
const determineRarity = (poolType: PoolType, guaranteeHigh: boolean = false): Rarity => {
    const weights = poolType === 'limited' ? LIMITED_RARITY_WEIGHTS : PERMANENT_RARITY_WEIGHTS;
    const weightedList: { rarity: Rarity, weight: number }[] = [];

    let sourceRarities = RARITY_ORDER;
    if (guaranteeHigh) {
        sourceRarities = RARITY_ORDER.filter(r => RARITY_ORDER.indexOf(r) >= 2); // 优品或更高
    }

    sourceRarities.forEach(r => {
        weightedList.push({ rarity: r, weight: weights[r] });
    });

    const totalWeight = weightedList.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weightedList) {
        random -= item.weight;
        if (random <= 0) {
            return item.rarity;
        }
    }
    return weightedList[weightedList.length - 1].rarity;
};
```

## 八个卡池总览

### 常规卡池（4个）
1. **万象寻仙**（人物卡牌） - 使用 PERMANENT_RARITY_WEIGHTS
2. **百炼阁**（装备） - 使用 PERMANENT_RARITY_WEIGHTS
3. **万法楼**（通用技能） - 使用 PERMANENT_RARITY_WEIGHTS
4. **御兽斋**（兽宠） - 使用 PERMANENT_RARITY_WEIGHTS

### 同人卡池（4个）- **现已修复**
5. **异界降临**（人物卡牌） - ✅ 现在使用 PERMANENT_RARITY_WEIGHTS
6. **神兵天成**（装备） - ✅ 现在使用 PERMANENT_RARITY_WEIGHTS
7. **大道顿悟**（通用技能） - ✅ 现在使用 PERMANENT_RARITY_WEIGHTS
8. **灵兽创生**（兽宠） - ✅ 现在使用 PERMANENT_RARITY_WEIGHTS

## 保底机制

十连抽保底：如果十次抽取中没有出现优品或以上稀有度，会强制将其中一个替换为优品或以上（通过 `guaranteeHigh: true` 参数）。

```typescript
if (count === 10 && !raritiesToPull.some(r => RARITY_ORDER.indexOf(r) >= 2)) {
    raritiesToPull[Math.floor(Math.random() * 10)] = determineRarity(poolType, true);
}
```

## 修复效果

✅ **统一概率**：所有8个卡池现在都使用相同的概率系统
✅ **真正随机**：稀有度由系统概率决定，AI只负责生成对应稀有度的内容
✅ **可控平衡**：通过调整权重表可以轻松平衡游戏经济
✅ **用户体验**：玩家获得的稀有度分布更加可预测和公平

## 测试建议

1. 在同人卡池中多次抽取，验证稀有度分布是否符合概率表
2. 检查AI生成的物品稀有度是否与系统指定的一致
3. 验证十连保底机制是否正常工作
4. 对比常规卡池和同人卡池的稀有度分布是否一致

## 相关文件

- [`components/Shop.tsx`](components/Shop.tsx) - 商城组件和抽卡逻辑
- [`services/tavernService.ts`](services/tavernService.ts) - AI生成服务函数
- [`types.ts`](types.ts) - 稀有度类型定义

## 备注

此修复确保了游戏的抽卡系统更加公平和可控，同时保留了同人卡池通过灵感创作独特内容的特色功能。