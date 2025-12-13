/**
 * AI 格式化工具使用示例
 * 
 * 这个文件展示了如何在项目中使用格式化工具
 */

import { z } from 'zod';
import {
    createFormattedGenerator,
    formattedGenerate,
    generateBattleNarrative,
    generateItemDescription,
    generateNPCDialogue,
} from './formattedGenerate';

/**
 * 示例 1: 使用预定义函数生成 NPC 对话
 */
export async function example1_NPCDialogue() {
  try {
    const dialogue = await generateNPCDialogue(
      '生成一段宗门长老对弟子的训诫，关于修炼需要持之以恒'
    );
    
    console.log('=== NPC 对话 ===');
    console.log('说话人:', dialogue.speaker);
    console.log('对话:', dialogue.dialogue);
    console.log('情绪:', dialogue.emotion);
    console.log('好感度变化:', dialogue.relationshipChange);
    
    return dialogue;
  } catch (error) {
    console.error('生成对话失败:', error);
    throw error;
  }
}

/**
 * 示例 2: 生成战斗描述
 */
export async function example2_BattleNarrative() {
  try {
    const battle = await generateBattleNarrative(
      '主角使用"火焰剑诀"攻击妖兽，造成大量伤害'
    );
    
    console.log('=== 战斗描述 ===');
    console.log('攻击者:', battle.attacker);
    console.log('动作:', battle.action);
    console.log('目标:', battle.target);
    console.log('伤害:', battle.damage);
    console.log('效果:', battle.effect);
    
    return battle;
  } catch (error) {
    console.error('生成战斗描述失败:', error);
    throw error;
  }
}

/**
 * 示例 3: 生成物品描述
 */
export async function example3_ItemDescription() {
  try {
    const item = await generateItemDescription(
      '生成一把传说级别的仙剑，拥有强大的火属性'
    );
    
    console.log('=== 物品描述 ===');
    console.log('名称:', item.name);
    console.log('描述:', item.description);
    console.log('稀有度:', item.rarity);
    console.log('属性:', item.attributes);
    
    return item;
  } catch (error) {
    console.error('生成物品描述失败:', error);
    throw error;
  }
}

/**
 * 示例 4: 使用自定义 Schema
 */
export async function example4_CustomSchema() {
  // 定义公告的 Schema
  const AnnouncementSchema = z.object({
    title: z.string(),
    content: z.string(),
    type: z.enum(['系统', '活动', '更新', '维护']),
    importance: z.number().min(1).max(5),
    timestamp: z.number(),
  });

  try {
    const announcement = await formattedGenerate({
      userInput: '生成一个关于新功能上线的系统公告',
      schema: AnnouncementSchema,
      defaultValues: {
        type: '更新',
        importance: 3,
        timestamp: Date.now(),
      },
      formatInstruction: `
输出 JSON 格式:
{
  "title": "公告标题",
  "content": "公告内容",
  "type": "更新",
  "importance": 3,
  "timestamp": 1234567890
}
      `.trim(),
    });
    
    console.log('=== 自定义公告 ===');
    console.log('标题:', announcement.title);
    console.log('内容:', announcement.content);
    console.log('类型:', announcement.type);
    console.log('重要度:', announcement.importance);
    
    return announcement;
  } catch (error) {
    console.error('生成公告失败:', error);
    throw error;
  }
}

/**
 * 示例 5: 创建可复用的生成器
 */
export async function example5_ReusableGenerator() {
  // 定义修炼感悟的 Schema
  const InsightSchema = z.object({
    content: z.string(),
    level: z.enum(['初级', '中级', '高级', '顶级']),
    breakthrough: z.boolean(),
    spiritualGain: z.number(),
  });

  // 创建可复用的生成器
  const generateInsight = createFormattedGenerator(
    InsightSchema,
    {
      level: '初级',
      breakthrough: false,
      spiritualGain: 0,
    },
    '输出JSON: {"content":"...","level":"初级","breakthrough":false,"spiritualGain":0}'
  );

  try {
    // 第一次使用
    const insight1 = await generateInsight('生成一个关于剑道的初级感悟');
    console.log('=== 感悟1 ===', insight1);

    // 第二次使用（可以覆盖配置）
    const insight2 = await generateInsight('生成一个关于火法的高级感悟', {
      defaultValues: {
        level: '高级',
        breakthrough: true,
        spiritualGain: 1000,
      },
    });
    console.log('=== 感悟2 ===', insight2);

    return [insight1, insight2];
  } catch (error) {
    console.error('生成感悟失败:', error);
    throw error;
  }
}

/**
 * 示例 6: 批量生成
 */
export async function example6_BatchGeneration() {
  try {
    console.log('=== 批量生成3个随机物品 ===');
    
    const items = [];
    for (let i = 0; i < 3; i++) {
      const item = await generateItemDescription(
        `生成第${i + 1}个战利品，品质和类型随机`
      );
      items.push(item);
      console.log(`物品${i + 1}:`, item.name, '-', item.rarity);
    }
    
    return items;
  } catch (error) {
    console.error('批量生成失败:', error);
    throw error;
  }
}

/**
 * 示例 7: 错误处理
 */
export async function example7_ErrorHandling() {
  try {
    // 尝试生成
    const dialogue = await generateNPCDialogue('生成对话');
    return dialogue;
  } catch (error: any) {
    if (error.message.includes('无法从响应中提取')) {
      console.error('❌ AI 响应格式无法识别，可能需要调整 prompt');
    } else if (error.message.includes('已重试')) {
      console.error('❌ 多次重试后仍然失败，请检查网络或 AI 服务');
    } else {
      console.error('❌ 未知错误:', error.message);
    }
    
    // 返回默认值或抛出错误
    return {
      speaker: '系统',
      dialogue: '生成失败，请稍后重试',
      emotion: '平静',
      relationshipChange: 0,
    };
  }
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('🚀 开始运行所有示例...\n');

  try {
    console.log('📝 示例1: NPC对话');
    await example1_NPCDialogue();
    console.log('✅ 完成\n');

    console.log('⚔️ 示例2: 战斗描述');
    await example2_BattleNarrative();
    console.log('✅ 完成\n');

    console.log('🗡️ 示例3: 物品描述');
    await example3_ItemDescription();
    console.log('✅ 完成\n');

    console.log('📢 示例4: 自定义Schema');
    await example4_CustomSchema();
    console.log('✅ 完成\n');

    console.log('🔄 示例5: 可复用生成器');
    await example5_ReusableGenerator();
    console.log('✅ 完成\n');

    console.log('📦 示例6: 批量生成');
    await example6_BatchGeneration();
    console.log('✅ 完成\n');

    console.log('⚠️ 示例7: 错误处理');
    await example7_ErrorHandling();
    console.log('✅ 完成\n');

    console.log('🎉 所有示例运行完成！');
  } catch (error) {
    console.error('❌ 运行示例时出错:', error);
  }
}

// 如果直接运行此文件（用于测试）
if (typeof window === 'undefined') {
  // Node.js 环境
  console.log('请在浏览器环境中运行此示例');
} else {
  // 浏览器环境 - 可以通过控制台调用
  (window as any).aiFormatExamples = {
    example1_NPCDialogue,
    example2_BattleNarrative,
    example3_ItemDescription,
    example4_CustomSchema,
    example5_ReusableGenerator,
    example6_BatchGeneration,
    example7_ErrorHandling,
    runAllExamples,
  };
  console.log('💡 示例已加载！在控制台输入 window.aiFormatExamples.runAllExamples() 运行所有示例');
}