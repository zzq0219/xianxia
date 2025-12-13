/**
 * 大闯关系统 - AI生成服务
 * 
 * 负责所有AI内容生成,包括参赛者、评委、关卡、表现、评分、解说、弹幕等
 */

import { GameState } from '../../types';
import {
  ChallengeDesign,
  ChallengeGenerationContext,
  ChallengeOptimization,
  Commentary,
  CommentaryPhase,
  ContestantPerformance,
  DanmakuResponse,
  GauntletContestant,
  GauntletJudge,
  JudgeScore,
  PerformanceGenerationContext
} from '../../types/gauntlet.types';
import { enhancedGenerate } from '../enhancedAIGenerator';
import {
  generateChallengeId,
  generateContestantId,
  generateId,
  generateJudgeId
} from './gauntletUtils';

/**
 * 大闯关AI服务类
 */
export class GauntletAIService {
  
  // ============================================
  // 1. 生成参赛者
  // ============================================
  
  /**
   * 生成指定数量的AI参赛者
   * @param count 生成数量(通常是63,因为玩家算1个)
   * @param gameState 游戏状态
   * @returns 参赛者数组
   */
  async generateContestants(
    count: number,
    gameState: GameState
  ): Promise<GauntletContestant[]> {
    console.log(`[大闯关AI] 开始生成${count}名参赛者...`);
    
    const systemInstruction = `你是一个创意丰富的角色设计师。请生成${count}名风格各异的女性修仙者,她们将参加"大闯关"综艺比赛。

要求:
1. 每个角色都要有独特的个性和外观
2. 境界可以从炼气期到元婴期不等
3. 特殊特点要有趣且多样化
4. 魅力值和技巧值要有差异,不要都很高
5. 名字要符合修仙世界的风格

返回格式必须是JSON数组,每个对象包含以下字段:
{
  "name": "角色名",
  "realm": "境界",
  "appearance": "外观描述(50字以内)",
  "specialTrait": "特殊特点(30字以内)",
  "charm": 魅力值(0-100),
  "skillfulness": 技巧值(0-100)
}`;

    const prompt = `生成${count}名参赛者,要求风格多样,有强有弱,有美有丑,性格各异。直接返回JSON数组,不要有其他文字。`;

    try {
      const result = await enhancedGenerate({
        systemInstruction,
        prompt,
        gameState,
        includeVectorMemories: false,
        includePreset: true,
        includeWorldbook: true
      });

      // 解析JSON
      const parsedData = JSON.parse(result);
      
      // 转换为GauntletContestant格式
      const contestants: GauntletContestant[] = parsedData.map((data: any) => ({
        id: generateContestantId(),
        name: data.name,
        gender: 'Female' as const,
        realm: data.realm,
        appearance: data.appearance,
        specialTrait: data.specialTrait,
        charm: Math.min(Math.max(data.charm || 50, 0), 100),
        skillfulness: Math.min(Math.max(data.skillfulness || 50, 0), 100),
        status: 'active' as const,
        currentScore: 0,
        roundScores: [],
        isPlayerCharacter: false
      }));

      console.log(`[大闯关AI] 成功生成${contestants.length}名参赛者`);
      return contestants;

    } catch (error) {
      console.error('[大闯关AI] 生成参赛者失败:', error);
      throw new Error('参赛者生成失败');
    }
  }

  // ============================================
  // 2. 生成评委
  // ============================================
  
  /**
   * 生成评委团
   * @param count 评委数量(通常3-5名)
   * @param gameState 游戏状态
   * @returns 评委数组
   */
  async generateJudges(
    count: number,
    gameState: GameState
  ): Promise<GauntletJudge[]> {
    console.log(`[大闯关AI] 开始生成${count}名评委...`);
    
    const systemInstruction = `你是一个角色设计师。请生成${count}名资深的评委,他们将担任"大闯关"比赛的裁判。

要求:
1. 评委应该是修为高深的前辈
2. 每个评委要有独特的评判风格(严格、温和、古怪等)
3. 专长领域要不同(体能、智力、技巧等)
4. 称号要霸气
5. 性格要鲜明

返回格式必须是JSON数组,每个对象包含:
{
  "name": "评委名",
  "title": "称号",
  "realm": "境界",
  "personality": "性格特点",
  "judgingStyle": "评判风格",
  "specialty": "专长领域"
}`;

    const prompt = `生成${count}名评委,要求风格各异,评判标准不同。直接返回JSON数组。`;

    try {
      const result = await enhancedGenerate({
        systemInstruction,
        prompt,
        gameState,
        includeVectorMemories: false,
        includePreset: true,
        includeWorldbook: true
      });

      const parsedData = JSON.parse(result);
      
      const judges: GauntletJudge[] = parsedData.map((data: any) => ({
        id: generateJudgeId(),
        name: data.name,
        title: data.title,
        realm: data.realm,
        personality: data.personality,
        judgingStyle: data.judgingStyle,
        specialty: data.specialty
      }));

      console.log(`[大闯关AI] 成功生成${judges.length}名评委`);
      return judges;

    } catch (error) {
      console.error('[大闯关AI] 生成评委失败:', error);
      throw new Error('评委生成失败');
    }
  }

  // ============================================
  // 3. 生成关卡草稿
  // ============================================
  
  /**
   * 生成单个关卡的草稿
   * @param roundNumber 轮次(1-6)
   * @param context 生成上下文
   * @param gameState 游戏状态
   * @returns 关卡设计
   */
  async generateChallengeDraft(
    roundNumber: number,
    context: ChallengeGenerationContext,
    gameState: GameState
  ): Promise<ChallengeDesign> {
    console.log(`[大闯关AI] 开始生成第${roundNumber}轮关卡草稿...`);
    
    const difficultyMap = [3, 4, 5, 6, 7, 8]; // 1-6轮对应的难度
    const difficulty = difficultyMap[roundNumber - 1];
    
    const systemInstruction = `你是一个综艺节目关卡设计师。请为"大闯关"第${roundNumber}轮设计一个精彩的关卡。

本轮信息:
- 轮次: 第${roundNumber}轮
- 参赛人数: ${context.contestantCount}人
- 难度等级: ${difficulty}/10
- 淘汰人数: ${Math.floor(context.contestantCount / 2)}人

${context.previousChallenges.length > 0 ? `已有关卡类型: ${context.previousChallenges.map(c => c.type).join('、')}` : ''}

要求:
1. 关卡要有创意,符合修仙世界背景
2. 类型从以下选择: 解谜、竞技、体能、技巧、智力、综合
3. 规则要清晰明确
4. 获胜条件和淘汰标准要合理
5. 预估时长要现实(30-60分钟)

返回JSON格式:
{
  "type": "关卡类型",
  "name": "关卡名称",
  "description": "详细描述(200字左右)",
  "rules": ["规则1", "规则2", "规则3"],
  "winCondition": "获胜条件",
  "eliminationCriteria": "淘汰标准",
  "estimatedDuration": "预估时长"
}`;

    const prompt = `设计第${roundNumber}轮关卡,要求独特有趣,难度适中。直接返回JSON。`;

    try {
      const result = await enhancedGenerate({
        systemInstruction,
        prompt,
        gameState,
        includeVectorMemories: false,
        includePreset: true,
        includeWorldbook: true
      });

      const data = JSON.parse(result);
      
      const challenge: ChallengeDesign = {
        id: generateChallengeId(roundNumber),
        roundNumber,
        type: data.type,
        name: data.name,
        description: data.description,
        rules: data.rules,
        winCondition: data.winCondition,
        eliminationCriteria: data.eliminationCriteria,
        difficulty,
        estimatedDuration: data.estimatedDuration,
        draftVersion: JSON.stringify(data, null, 2),
        finalVersion: '',
        optimizationProgress: 0
      };

      console.log(`[大闯关AI] 成功生成第${roundNumber}轮关卡草稿: ${challenge.name}`);
      return challenge;

    } catch (error) {
      console.error('[大闯关AI] 生成关卡草稿失败:', error);
      throw new Error(`第${roundNumber}轮关卡草稿生成失败`);
    }
  }

  // ============================================
  // 4. 批量生成所有关卡草稿
  // ============================================
  
  /**
   * 一次性生成6轮关卡的草稿
   * @param gameState 游戏状态
   * @returns 6个关卡设计数组
   */
  async generateAllChallengeDrafts(
    gameState: GameState
  ): Promise<ChallengeDesign[]> {
    console.log('[大闯关AI] 开始批量生成6轮关卡草稿...');
    
    const challenges: ChallengeDesign[] = [];
    const contestantCounts = [64, 32, 16, 8, 4, 2]; // 每轮人数
    
    for (let round = 1; round <= 6; round++) {
      const context: ChallengeGenerationContext = {
        roundNumber: round,
        previousChallenges: challenges,
        contestantCount: contestantCounts[round - 1]
      };
      
      const challenge = await this.generateChallengeDraft(round, context, gameState);
      challenges.push(challenge);
      
      // 添加小延迟避免API限流
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('[大闯关AI] 成功生成全部6轮关卡草稿');
    return challenges;
  }

  // ============================================
  // 5. 关卡优化
  // ============================================
  
  /**
   * 对关卡进行优化
   * @param challenge 当前关卡设计
   * @param optimizationRound 第几轮优化(1-3)
   * @param gameState 游戏状态
   * @returns 优化记录
   */
  async optimizeChallenge(
    challenge: ChallengeDesign,
    optimizationRound: 1 | 2 | 3,
    gameState: GameState
  ): Promise<ChallengeOptimization> {
    console.log(`[大闯关AI] 开始第${optimizationRound}轮优化: ${challenge.name}`);
    
    // 获取上一次的设计内容
    let currentDesign = challenge.draftVersion;
    if (optimizationRound === 2 && challenge.optimization1) {
      currentDesign = challenge.optimization1.optimizedDesign;
    } else if (optimizationRound === 3 && challenge.optimization2) {
      currentDesign = challenge.optimization2.optimizedDesign;
    }
    
    const systemInstruction = `你是一个专业的关卡优化顾问。请对以下关卡设计进行第${optimizationRound}轮批判性分析和优化。

当前关卡设计:
${currentDesign}

要求:
1. 批判性分析当前设计的问题
2. 提出具体的改进建议
3. 给出优化后的完整设计
4. 总结本次改进的要点

返回JSON格式:
{
  "critique": "批判分析(指出具体问题)",
  "issues": ["问题1", "问题2", "问题3"],
  "suggestions": ["建议1", "建议2", "建议3"],
  "changes": ["修改1", "修改2", "修改3"],
  "optimizedDesign": "优化后的完整设计(JSON字符串)",
  "improvementSummary": "改进总结"
}`;

    const prompt = `进行第${optimizationRound}轮优化,要深入分析问题并给出实质性改进。直接返回JSON。`;

    try {
      const result = await enhancedGenerate({
        systemInstruction,
        prompt,
        gameState,
        includeVectorMemories: false,
        includePreset: true,
        includeWorldbook: true
      });

      const data = JSON.parse(result);
      
      const optimization: ChallengeOptimization = {
        round: optimizationRound,
        timestamp: Date.now(),
        critique: data.critique,
        issues: data.issues,
        suggestions: data.suggestions,
        changes: data.changes,
        optimizedDesign: data.optimizedDesign,
        improvementSummary: data.improvementSummary
      };

      console.log(`[大闯关AI] 完成第${optimizationRound}轮优化: ${challenge.name}`);
      return optimization;

    } catch (error) {
      console.error('[大闯关AI] 关卡优化失败:', error);
      throw new Error(`第${optimizationRound}轮优化失败`);
    }
  }

  // ============================================
  // 6. 生成参赛者表现(群体模式)
  // ============================================
  
  /**
   * 生成参赛者表现(群体模式) - 生成所有参赛者的概要表现
   */
  async generateGroupPerformance(
    contestants: GauntletContestant[],
    challenge: ChallengeDesign,
    gameState: GameState
  ): Promise<ContestantPerformance[]> {
    console.log(`[大闯关AI] 开始生成${contestants.length}名参赛者的群体表现...`);
    
    const contestantInfo = contestants.slice(0, 10).map(c =>
      `${c.name}(${c.realm}, 魅力${c.charm}, 技巧${c.skillfulness})`
    ).join('; ');
    
    const systemInstruction = `你是综艺节目叙事者。为"大闯关"第${challenge.roundNumber}轮生成所有参赛者表现。

关卡: ${challenge.name} (${challenge.type})
描述: ${challenge.description}
参赛人数: ${contestants.length}人
部分参赛者: ${contestantInfo}...

要求:
1. 为每人生成50-100字表现描述
2. 根据属性合理分配得分(60-95分)
3. 要有高低差异,符合淘汰赛规律
4. 精彩瞬间和失误要合理

返回JSON数组(包含全部${contestants.length}人):
[{
  "contestantName": "名字",
  "score": 分数,
  "narrative": "表现叙事",
  "highlights": ["精彩1","精彩2"],
  "mistakes": ["失误"]
}]`;

    const prompt = `生成全部${contestants.length}人表现,要有层次。直接返回JSON数组。`;

    try {
      const result = await enhancedGenerate({
        systemInstruction,
        prompt,
        gameState,
        includeVectorMemories: false,
        includePreset: true,
        includeWorldbook: true
      });

      const parsedData = JSON.parse(result);
      const sorted = [...parsedData].sort((a: any, b: any) => b.score - a.score);
      
      const performances: ContestantPerformance[] = sorted.map((data: any, index: number) => {
        const contestant = contestants.find(c => c.name === data.contestantName);
        return {
          contestantId: contestant?.id || '',
          contestantName: data.contestantName,
          roundNumber: challenge.roundNumber,
          score: Math.min(Math.max(data.score, 60), 95),
          rank: index + 1,
          narrative: data.narrative,
          highlights: data.highlights || [],
          mistakes: data.mistakes || [],
          passed: (index + 1) <= Math.floor(contestants.length / 2)
        };
      });

      console.log(`[大闯关AI] 成功生成群体表现`);
      return performances;
    } catch (error) {
      console.error('[大闯关AI] 生成群体表现失败:', error);
      throw new Error('群体表现生成失败');
    }
  }

  // ============================================
  // 7. 生成参赛者表现(个人模式)
  // ============================================
  
  /**
   * 生成参赛者表现(个人模式) - 详细的个人叙事
   */
  async generateIndividualPerformance(
    contestant: GauntletContestant,
    challenge: ChallengeDesign,
    context: PerformanceGenerationContext,
    gameState: GameState
  ): Promise<ContestantPerformance> {
    console.log(`[大闯关AI] 生成${contestant.name}的详细表现...`);
    
    const systemInstruction = `你是综艺节目叙事者。详细描述${contestant.name}在关卡中的表现。

参赛者: ${contestant.name} (${contestant.realm})
外观: ${contestant.appearance}
特点: ${contestant.specialTrait}
属性: 魅力${contestant.charm}, 技巧${contestant.skillfulness}

关卡: ${challenge.name}
${challenge.description}

要求:
1. 生成300-500字详细叙事
2. 描述具体动作、表情、反应
3. 要有起伏和戏剧性
4. 根据能力评分(60-95分)

返回JSON:
{
  "score": 分数,
  "narrative": "详细叙事",
  "highlights": ["精彩1","精彩2","精彩3"],
  "mistakes": ["失误1","失误2"]
}`;

    const prompt = `详细描述${contestant.name}的表现,要生动有趣。直接返回JSON。`;

    try {
      const result = await enhancedGenerate({
        systemInstruction,
        prompt,
        gameState,
        includeVectorMemories: true,
        includePreset: true,
        includeWorldbook: true
      });

      const data = JSON.parse(result);
      const rank = context.currentRanking?.find(r => r.contestantId === contestant.id)?.rank || 1;
      
      return {
        contestantId: contestant.id,
        contestantName: contestant.name,
        roundNumber: challenge.roundNumber,
        score: Math.min(Math.max(data.score, 60), 95),
        rank,
        narrative: data.narrative,
        highlights: data.highlights || [],
        mistakes: data.mistakes || [],
        passed: rank <= Math.floor((context.currentRanking?.length || 64) / 2)
      };
    } catch (error) {
      console.error('[大闯关AI] 生成个人表现失败:', error);
      throw new Error('个人表现生成失败');
    }
  }

  // ============================================
  // 8. 生成评委评分
  // ============================================
  
  /**
   * 生成评委评分和评语
   */
  async generateJudgeScores(
    judges: GauntletJudge[],
    performance: ContestantPerformance,
    gameState: GameState
  ): Promise<JudgeScore[]> {
    console.log(`[大闯关AI] 生成评委对${performance.contestantName}的评分...`);
    
    const judgeInfo = judges.map(j =>
      `${j.name}(${j.title}, 风格:${j.judgingStyle}, 专长:${j.specialty})`
    ).join('\n');
    
    const systemInstruction = `你是评委团秘书。生成评委对参赛者的评分和评语。

参赛者: ${performance.contestantName}
得分: ${performance.score}分
表现: ${performance.narrative.substring(0, 200)}...
精彩: ${performance.highlights.join('; ')}
失误: ${performance.mistakes.join('; ')}

评委:
${judgeInfo}

要求:
1. 每个评委根据自己风格给出评分和评语
2. 评分围绕${performance.score}分波动(±5分)
3. 严格评委分低,温和评委分高
4. 评语30-80字,符合性格

返回JSON数组:
[{
  "judgeId": "ID",
  "judgeName": "名字",
  "score": 分数,
  "comment": "评语"
}]`;

    const prompt = `生成${judges.length}名评委评分,要符合各自风格。直接返回JSON数组。`;

    try {
      const result = await enhancedGenerate({
        systemInstruction,
        prompt,
        gameState,
        includeVectorMemories: false,
        includePreset: true,
        includeWorldbook: true
      });

      const parsedData = JSON.parse(result);
      
      const scores: JudgeScore[] = parsedData.map((data: any) => ({
        judgeId: data.judgeId,
        judgeName: data.judgeName,
        contestantId: performance.contestantId,
        roundNumber: performance.roundNumber,
        score: Math.min(Math.max(data.score, 0), 100),
        comment: data.comment
      }));

      console.log(`[大闯关AI] 成功生成${scores.length}名评委的评分`);
      return scores;
    } catch (error) {
      console.error('[大闯关AI] 生成评委评分失败:', error);
      throw new Error('评委评分生成失败');
    }
  }

  // ============================================
  // 9. 生成解说
  // ============================================
  
  /**
   * 生成解说内容
   */
  async generateCommentary(
    phase: CommentaryPhase,
    context: any,
    gameState: GameState
  ): Promise<Commentary> {
    console.log(`[大闯关AI] 生成${phase}阶段的解说...`);
    
    const phaseDesc = {
      'opening': '开场介绍',
      'during': '比赛进行中',
      'highlight': '精彩瞬间回顾',
      'closing': '本轮总结',
      'judging': '评委评分阶段'
    };
    
    const systemInstruction = `你是"大闯关"节目解说员。生成${phaseDesc[phase]}的解说词。

阶段: ${phaseDesc[phase]}
${context.challenge ? `关卡: ${context.challenge.name}` : ''}
${context.contestant ? `焦点: ${context.contestant.name}` : ''}
${context.currentAction ? `动作: ${context.currentAction}` : ''}

要求:
1. 语言生动活泼,有综艺感
2. 制造悬念和惊喜
3. 长度80-150字
4. 符合阶段氛围

返回JSON:
{
  "content": "解说内容",
  "speaker": "解说员"
}`;

    const prompt = `生成${phaseDesc[phase]}解说,要有感染力。直接返回JSON。`;

    try {
      const result = await enhancedGenerate({
        systemInstruction,
        prompt,
        gameState,
        includeVectorMemories: false,
        includePreset: true,
        includeWorldbook: true
      });

      const data = JSON.parse(result);
      
      const commentary: Commentary = {
        id: generateId('commentary'),
        timestamp: Date.now(),
        roundNumber: context.roundNumber || 0,
        phase,
        content: data.content,
        speaker: data.speaker || '解说员'
      };

      console.log(`[大闯关AI] 完成${phase}阶段解说生成`);
      return commentary;
    } catch (error) {
      console.error('[大闯关AI] 生成解说失败:', error);
      throw new Error('解说生成失败');
    }
  }

  // ============================================
  // 10. 生成弹幕响应
  // ============================================
  
  /**
   * 根据玩家弹幕生成AI响应
   */
  async generateDanmakuResponse(
    playerInput: string,
    context: any,
    gameState: GameState
  ): Promise<DanmakuResponse> {
    console.log(`[大闯关AI] 处理玩家弹幕: ${playerInput}`);
    
    const systemInstruction = `你是"大闯关"节目互动系统。玩家发送了弹幕,生成响应。

玩家弹幕: "${playerInput}"
当前情况: ${context.currentNarrative || '比赛进行中'}
${context.contestant ? `焦点选手: ${context.contestant.name}` : ''}

要求:
1. 根据弹幕内容更新叙事(50-100字)
2. 解说员回应弹幕(30-50字)
3. 生成3-5条AI观众弹幕
4. 要有互动感和代入感

返回JSON:
{
  "narrative": "叙事更新",
  "commentary": "解说回应",
  "danmakus": ["弹幕1", "弹幕2", "弹幕3"]
}`;

    const prompt = `生成对玩家弹幕的响应,要生动有趣。直接返回JSON。`;

    try {
      const result = await enhancedGenerate({
        systemInstruction,
        prompt,
        gameState,
        includeVectorMemories: true,
        includePreset: true,
        includeWorldbook: true
      });

      const data = JSON.parse(result);
      
      const response: DanmakuResponse = {
        narrative: data.narrative,
        commentary: data.commentary,
        danmakus: data.danmakus || []
      };

      console.log(`[大闯关AI] 完成弹幕响应生成`);
      return response;
    } catch (error) {
      console.error('[大闯关AI] 生成弹幕响应失败:', error);
      throw new Error('弹幕响应生成失败');
    }
  }
}

// 导出单例
export const gauntletAIService = new GauntletAIService();
   