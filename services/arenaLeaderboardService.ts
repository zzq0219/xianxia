/**
 * 竞技场榜单AI生成服务
 * 使用AI动态生成多个竞技场榜单
 */

import { GameState, LeaderboardEntry, Leaderboards } from '../types';
import { aiContextEnhancerV2 } from './aiContextEnhancer.v2';
import { aiMessageCapture } from './aiMessageCapture';

/**
 * 使用AI生成竞技场榜单
 */
export async function generateAILeaderboards(gameState: GameState): Promise<Leaderboards> {
    console.log('[榜单生成] 开始AI生成竞技场榜单...');

    // 设置当前场景为竞技场
    aiMessageCapture.setCurrentScene('arena');

    try {
        // 构建提示词
        const systemInstruction = `你是一个修仙世界的竞技场榜单生成器。请根据当前游戏状态，生成真实、合理且有趣的竞技场排行榜。

要求：
1. 生成4个不同的榜单：宗门排行榜、野榜、区域榜、世界榜
2. 宗门排行榜包含5个子榜：总榜、核心弟子、内门弟子、外门弟子、杂役弟子
3. 每个榜单生成10-20个条目
4. 角色名字要符合修仙风格，富有想象力
5. 门派名称要多样化且符合修仙设定
6. 积分要合理分布，排名越高积分越高
7. 玩家当前排名：${gameState.playerProfile.arenaRank.tier} ${gameState.playerProfile.arenaRank.division}，积分：${gameState.playerProfile.arenaRank.points}

请生成JSON格式的榜单数据。`;

        const userPrompt = `请生成完整的竞技场榜单数据。返回格式：
{
  "宗门排行榜": {
    "总榜": [{"rank": 1, "name": "角色名", "faction": "门派名", "points": 积分, "characterId": "id"}],
    "核心弟子": [...],
    "内门弟子": [...],
    "外门弟子": [...],
    "杂役弟子": [...]
  },
  "野榜": [...],
  "区域榜": [...],
  "世界榜": [...]
}

请确保：
- 每个榜单至少10个条目
- rank从1开始连续递增
- points按排名递减
- name和faction富有创意
- characterId使用"arena-npc-{随机数}"格式`;

        console.log('[榜单生成] 调用AI生成服务...');

        // 使用增强的AI生成服务
        const aiResponse = await aiContextEnhancerV2.generateWithEnhancedContext(
            gameState,
            userPrompt,
            {
                includeVectorMemories: true,
                includePreset: true,
                includeWorldbook: true,
                includeGameState: true,
                maxVectorResults: 3,
                categories: ['战斗', '公告', '声望'],
            }
        );

        console.log('[榜单生成] AI响应长度:', aiResponse.length);
        console.log('[榜单生成] AI响应内容:', aiResponse.substring(0, 500));

        // 手动捕获这次AI生成（用于记忆系统）
        aiMessageCapture.captureMessage(aiResponse, 'arena');

        // 解析AI响应
        let leaderboards: Leaderboards;
        
        try {
            // 尝试提取JSON（AI可能返回带markdown的内容）
            const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                             aiResponse.match(/```\s*([\s\S]*?)\s*```/) ||
                             [null, aiResponse];
            
            const jsonStr = jsonMatch[1] || aiResponse;
            leaderboards = JSON.parse(jsonStr.trim());

            console.log('[榜单生成] 成功解析AI生成的榜单');
        } catch (parseError) {
            console.error('[榜单生成] JSON解析失败，使用默认榜单:', parseError);
            // 如果解析失败，生成默认榜单
            leaderboards = generateDefaultLeaderboards(gameState);
        }

        // 验证和修复榜单数据
        leaderboards = validateAndFixLeaderboards(leaderboards, gameState);

        console.log('[榜单生成] 榜单生成完成');
        return leaderboards;

    } catch (error) {
        console.error('[榜单生成] AI生成失败:', error);
        // 降级：生成默认榜单
        console.log('[榜单生成] 使用默认榜单作为降级方案');
        return generateDefaultLeaderboards(gameState);
    }
}

/**
 * 验证和修复榜单数据
 */
function validateAndFixLeaderboards(leaderboards: any, gameState: GameState): Leaderboards {
    const fixed: Leaderboards = {
        '宗门排行榜': {
            '总榜': [],
            '核心弟子': [],
            '内门弟子': [],
            '外门弟子': [],
            '杂役弟子': [],
        },
        '野榜': [],
        '区域榜': [],
        '世界榜': [],
    };

    // 验证宗门排行榜
    if (leaderboards['宗门排行榜']) {
        const sectBoards = leaderboards['宗门排行榜'];
        fixed['宗门排行榜']['总榜'] = validateEntries(sectBoards['总榜'] || []);
        fixed['宗门排行榜']['核心弟子'] = validateEntries(sectBoards['核心弟子'] || []);
        fixed['宗门排行榜']['内门弟子'] = validateEntries(sectBoards['内门弟子'] || []);
        fixed['宗门排行榜']['外门弟子'] = validateEntries(sectBoards['外门弟子'] || []);
        fixed['宗门排行榜']['杂役弟子'] = validateEntries(sectBoards['杂役弟子'] || []);
    }

    // 验证其他榜单
    fixed['野榜'] = validateEntries(leaderboards['野榜'] || []);
    fixed['区域榜'] = validateEntries(leaderboards['区域榜'] || []);
    fixed['世界榜'] = validateEntries(leaderboards['世界榜'] || []);

    return fixed;
}

/**
 * 验证榜单条目
 */
function validateEntries(entries: any[]): LeaderboardEntry[] {
    if (!Array.isArray(entries)) return [];
    
    return entries
        .filter(e => e && typeof e === 'object')
        .map((entry, index) => ({
            rank: typeof entry.rank === 'number' ? entry.rank : index + 1,
            name: String(entry.name || `修士${index + 1}`),
            faction: String(entry.faction || '散修'),
            points: typeof entry.points === 'number' ? entry.points : 1000 - index * 10,
            characterId: String(entry.characterId || `arena-npc-${Date.now()}-${index}`),
        }))
        .sort((a, b) => a.rank - b.rank);
}

/**
 * 生成默认榜单（降级方案）
 */
function generateDefaultLeaderboards(gameState: GameState): Leaderboards {
    console.log('[榜单生成] 生成默认榜单...');

    const sects = ['天元宗', '玄天派', '灵霄殿', '百花谷', '剑宗', '药王谷', '魔音宗', '雷霆阁'];
    const names = [
        '剑心', '云澈', '月华', '星辰', '风行', '雷动', '冰心', '火烈',
        '木灵', '水柔', '金刚', '土厚', '天机', '地灵', '人杰', '鬼才',
        '龙吟', '凤鸣', '虎啸', '豹影', '熊霸', '鹰扬', '蛇行', '鹤舞'
    ];

    const generateEntries = (count: number, basePoints: number): LeaderboardEntry[] => {
        const entries: LeaderboardEntry[] = [];
        for (let i = 0; i < count; i++) {
            entries.push({
                rank: i + 1,
                name: names[Math.floor(Math.random() * names.length)] + ['真人', '仙子', '道人', '上人', '尊者'][Math.floor(Math.random() * 5)],
                faction: sects[Math.floor(Math.random() * sects.length)],
                points: basePoints - i * Math.floor(Math.random() * 50 + 20),
                characterId: `arena-npc-${Date.now()}-${i}`,
            });
        }
        return entries;
    };

    return {
        '宗门排行榜': {
            '总榜': generateEntries(15, 5000),
            '核心弟子': generateEntries(12, 4500),
            '内门弟子': generateEntries(12, 3500),
            '外门弟子': generateEntries(12, 2500),
            '杂役弟子': generateEntries(10, 1500),
        },
        '野榜': generateEntries(15, 4800),
        '区域榜': generateEntries(15, 4600),
        '世界榜': generateEntries(20, 6000),
    };
}