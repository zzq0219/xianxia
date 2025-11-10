import { CharacterCard, Attributes } from '../types';

export const calculateTotalAttributes = (character: CharacterCard): Attributes => {
    const total: Attributes = JSON.parse(JSON.stringify(character.baseAttributes));
    
    const equipmentList = Object.values(character.equipment);
    
    for (const item of equipmentList) {
        if (item) {
            for (const [stat, value] of Object.entries(item.stats)) {
                if (value !== undefined) {
                    switch(stat) {
                        case 'hp':
                            total.maxHp += value;
                            break;
                        case 'mp':
                            total.maxMp += value;
                            break;
                        case 'attack':
                            total.attack += value;
                            break;
                        case 'defense':
                            total.defense += value;
                            break;
                        case 'speed':
                            total.speed += value;
                            break;
                        case 'critRate':
                            total.critRate += value;
                            break;
                        case 'critDmg':
                            total.critDmg += value;
                            break;
                    }
                }
            }
        }
    }
    // For display purposes and battle start, assume full health based on new max values.
    // The calling context is responsible for managing current HP if it should be preserved.
    total.hp = total.maxHp;
    total.mp = total.maxMp;
    return total;
};

import { BusinessDistrict, PlayerProfile } from '../types';
import { POSITIONS } from '../constants';

// 定义每个岗位的权重，这会影响该岗位的产出效率
const POSITION_WEIGHTS: Record<string, number> = {
  'p_brothel_star': 1.5,
  'p_brothel_tutor': 1.2,
  'p_brothel_guard': 0.5,
  'p_arena_gladiator': 1.8,
  'p_arena_host': 1.1,
  'p_arena_trader': 1.0,
  'p_alchemy_chief': 2.0,
  'p_alchemy_apprentice': 0.8,
  'p_auction_master': 2.5,
  'p_auction_appraiser': 1.5,
  'p_intel_chief': 2.2,
  'p_intel_assassin': 1.7,
};

// 定义每个店铺的基础收入，刻意压低数值以实现长期积累
const SHOP_BASE_INCOME: Record<string, number> = {
    '青楼': 10,
    '角斗场': 5, // 主要产出声望，灵石较少
    '炼丹房': 2, // 主要产出物品，灵石很少
    '拍卖行': 0, // 收入来自事件
    '情报阁': 0, // 收入来自事件
};

/**
 * 计算并返回整个商业区的总收入
 * @param playerProfile - 玩家档案，包含商业区和角色信息
 * @returns 计算出的总灵石收入
 */
export function calculateBusinessIncome(playerProfile: PlayerProfile, shopId?: string): number {
  if (!playerProfile.businessDistrict) {
    return 0;
  }

  const { shops, level: districtLevel } = playerProfile.businessDistrict;
  let totalIncome = 0;

  const shopsToCalculate = shopId ? shops.filter(s => s.id === shopId) : shops;

  // 1. 计算所有店铺的基础收入和员工加成
  shopsToCalculate.forEach(shop => {
    let shopIncome = (SHOP_BASE_INCOME[shop.type] || 0) * (1 + (shop.level - 1) * 0.2); // 店铺每升一级，基础收入提升20%

    shop.staff.forEach(staffMember => {
      const character = playerProfile.cardCollection.find(c => c.id === staffMember.characterId);
      const position = POSITIONS[staffMember.positionId];

      if (character && position) {
        const requiredAttr = position.requiredAttr;
        // @ts-ignore
        const attrValue = character[requiredAttr] || 10; // 如果角色没有该属性，给一个较低的默认值
        const positionWeight = POSITION_WEIGHTS[staffMember.positionId] || 1.0;
        
        // 核心公式：员工贡献 = (属性值 / 10) * 岗位权重
        const staffContribution = (attrValue / 10) * positionWeight;
        shopIncome += staffContribution;
      }
    });

    totalIncome += shopIncome;
  });

  // 如果是计算所有店铺的总收入，则应用加成
  if (!shopId) {
    // 2. 计算商业街区等级加成
    totalIncome *= (1 + (districtLevel - 1) * 0.1); // 街区每升一级，总收入提升10%

    // 3. 计算声望加成
    const reputationBonus = playerProfile.reputation.score / 5000; // 每1000点声望提供20%加成
    totalIncome *= (1 + reputationBonus);
  }

  // 最终结果向下取整，避免出现小数
  return Math.floor(totalIncome);
}
