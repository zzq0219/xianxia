/**
 * 大闯关系统 - AI生成服务
 *
 * 负责所有AI内容生成,包括参赛者、评委、关卡、表现、评分、解说、弹幕等
 * 集成AIFormat服务确保响应格式的稳定性和可靠性
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
import { AIFormatProcessor } from '../aiFormatProcessor';
import { enhancedGenerate } from '../enhancedAIGenerator';
import {
  ChallengeDraftSchema,
  ChallengeOptimizationSchema,
  ContestantsArraySchema,
  JudgesArraySchema
} from './gauntletAISchemas';
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
    
    // 创建格式处理器
    const processor = new AIFormatProcessor(
      ContestantsArraySchema,
      [],
      `【重要】必须严格按照JSON数组格式输出，不要添加任何解释文字。
输出格式: [{"name":"角色名","realm":"境界","appearance":"外观描述","specialTrait":"特殊特点","charm":数值,"skillfulness":数值}]`
    );
    
    const systemInstruction = `你是一个创意丰富的角色设计师。请生成${count}名风格各异的女性修仙者,她们将参加"大闯关"综艺比赛。

要求:
1. 每个角色都要有独特的个性和外观
2. 境界可以从炼气期到元婴期不等
3. 特殊特点要有趣且多样化
4. 魅力值和技巧值要有差异,不要都很高
5. 名字要符合修仙世界的风格

${processor.getFormatInstruction()}`;

    const prompt = `生成${count}名参赛者,要求风格多样,有强有弱,有美有丑,性格各异。`;

    try {
      // 使用带重试的处理
      const parsedData = await processor.processWithRetry(async () => {
        return await enhancedGenerate({
          systemInstruction,
          prompt,
          gameState,
          includeVectorMemories: false,
          includePreset: true,
          includeWorldbook: true
        });
      }, 3);
      
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
    
    // 创建格式处理器
    const processor = new AIFormatProcessor(
      JudgesArraySchema,
      [],
      `【重要】必须严格按照JSON数组格式输出，不要添加任何解释文字。
输出格式: [{"name":"评委名","title":"称号","realm":"境界","personality":"性格","judgingStyle":"评判风格","specialty":"专长"}]`
    );
    
    const systemInstruction = `你是一个角色设计师。请生成${count}名资深的评委,他们将担任"大闯关"比赛的裁判。

要求:
1. 评委应该是修为高深的前辈
2. 每个评委要有独特的评判风格(严格、温和、古怪等)
3. 专长领域要不同(体能、智力、技巧等)
4. 称号要霸气
5. 性格要鲜明

${processor.getFormatInstruction()}`;

    const prompt = `生成${count}名评委,要求风格各异,评判标准不同。`;

    try {
      // 使用带重试的处理
      const parsedData = await processor.processWithRetry(async () => {
        return await enhancedGenerate({
          systemInstruction,
          prompt,
          gameState,
          includeVectorMemories: false,
          includePreset: true,
          includeWorldbook: true
        });
      }, 3);
      
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
    
    // 创建格式处理器 - 提供默认值确保rules字段有足够元素
    const processor = new AIFormatProcessor(
      ChallengeDraftSchema,
      {
        type: '综合',
        name: '未命名关卡',
        description: '待生成',
        rules: ['规则1：待生成', '规则2：待生成'],
        winCondition: '待生成',
        eliminationCriteria: '待生成',
        estimatedDuration: '30-60分钟'
      },
      `【重要】必须严格按照JSON格式输出，不要添加任何解释文字。
输出格式: {"type":"类型","name":"关卡名","description":"描述","rules":["规则1","规则2","规则3"],"winCondition":"胜利条件","eliminationCriteria":"淘汰标准","estimatedDuration":"预估时长"}`
    );
    
    const systemInstruction = `你是一个"色情大闯关"综艺节目的关卡设计大师。请为第${roundNumber}轮设计一个极具创意和色情元素的关卡。

本轮信息:
- 轮次: 第${roundNumber}轮
- 参赛人数: ${context.contestantCount}人(主要是女性参赛者)
- 难度等级: ${difficulty}/10
- 淘汰人数: ${Math.floor(context.contestantCount / 2)}人

${context.previousChallenges.length > 0 ? `已有关卡类型: ${context.previousChallenges.map(c => c.type).join('、')}` : ''}

【重要禁止事项】
❌ 不要编造虚拟的、空洞的、科幻的术语(如"双向阀值平衡系统"、"灵犀值"、"量子感应"等)
❌ 不要造无意义的专有名词或设定
✅ 使用简单直白的日常语言描述玩法
✅ 使用现实中存在的概念和机制

【创意设计理念 - 广泛汲取灵感】

设计灵感可以来自任何领域,以下只是部分参考方向,请自由发挥创意:

**1. 综艺节目灵感(仅供参考,不必局限):**
- 真人秀类: 撕名牌、任务挑战、躲猫猫
- 益智类: 解谜、答题、推理
- 闯关类: 障碍赛、淘汰赛

**2. 传统游戏与民间活动:**
- 童年游戏: 跳房子、丢手绢、老鹰捉小鸡、木头人
- 棋牌类: 真人版大富翁、真人象棋、飞行棋
- 民俗活动: 投壶、蹴鞠、拔河、踩高跷

**3. 体育竞技与极限运动:**
- 田径类: 赛跑、跨栏、接力、跳远
- 水上类: 游泳、跳水、水球
- 极限类: 攀岩、蹦极、平衡挑战
- 球类变体: 躲避球、保龄球

**4. 修仙世界特有元素:**
- 御剑/飞行比赛、法术对决
- 阵法破解、丹药辨识
- 灵气感应、意念控制
- 仙兽驯服、符箓绘制

**5. 生存与求生类:**
- 荒野求生、资源争夺
- 饥饿游戏式生存
- 迷宫逃脱、密室破解

**6. 社交与心理类:**
- 狼人杀/卧底类推理
- 信任挑战、背叛博弈
- 谎言识别、心理战术

**7. 创意与艺术类:**
- 即兴表演、模仿秀
- 才艺展示、舞蹈对决
- 手工制作、绘画比赛

**8. 随机与运气类:**
- 抽签决定命运、骰子博弈
- 盲盒惊喜、轮盘赌
- 随机事件触发

【基础玩法机制 - 可自由组合】
竞速、平衡、记忆、反应、协作、对抗、策略、运气、表演、生存、解谜、社交...
你可以融合多种机制,创造全新的玩法!

【色情元素融合原则】
将成人内容自然融入玩法核心,不是简单叠加:
- 身体接触、暴露挑战、性刺激考验、羞耻play
- 失败惩罚: 性惩罚、公开羞辱、服务NPC等
- 要有代入感和刺激性,保持游戏性

设计示例(展示融合思路,请创造新玩法):

【肉棒攀岩墙】体能+色情: 把手是肉棒,需用手/嘴让其勃起才能抓稳

【真人飞行棋】策略+运气+色情: 掷骰子在巨型棋盘移动,落在特殊格子要接受色情惩罚

【灵气感应】修仙+色情: 蒙眼用身体感应灵气方向,身体越敏感越准确

【狼人杀羞耻版】社交+推理: 被投票出局者要当众接受羞辱惩罚

【水中寻宝】体能+运气: 在水池底寻找宝物,但水中有触手怪随机袭击

设计要求:
1. 类型多样化: 解谜/竞速/策略/技巧/体能/社交/生存/综合等
2. 灵感来源不限: 可从任何领域获取创意
3. 用简单直白的语言,不造虚拟术语
4. 色情元素自然融入玩法核心
5. 规则清晰,有明确成功/失败判定
6. 符合修仙世界背景

【必须严格遵守的JSON输出格式】
你必须返回一个JSON对象,包含以下字段:
{
  "type": "关卡类型(字符串)",
  "name": "关卡名称(字符串)",
  "description": "关卡详细描述(字符串,100-200字)",
  "rules": ["规则1(字符串)", "规则2(字符串)", "规则3(字符串)"],
  "winCondition": "胜利条件(字符串)",
  "eliminationCriteria": "淘汰标准(字符串)",
  "estimatedDuration": "预估时长(字符串)"
}

【特别注意】rules字段必须是一个字符串数组,包含至少3条具体规则,例如:
"rules": [
  "每位参赛者需要在3分钟内完成挑战",
  "失败一次扣10分,失败三次直接淘汰",
  "可以使用道具但每人限用一次"
]

不要把rules写成字符串,必须是数组格式!`;

    const prompt = `设计第${roundNumber}轮关卡。

【重要格式要求】
必须返回JSON对象,其中rules字段必须是字符串数组(至少3条规则),不是字符串!

正确格式: "rules": ["规则1", "规则2", "规则3"]
错误格式: "rules": "规则1,规则2,规则3"

设计要求:
1. 基于真实综艺或游戏的玩法机制
2. 不要造虚拟术语,用简单直白的语言
3. 色情元素自然融入玩法
4. rules必须是数组,包含至少3条规则

直接返回JSON,不要其他文字。`;

    try {
      // 使用带重试的处理
      const data = await processor.processWithRetry(async () => {
        return await enhancedGenerate({
          systemInstruction,
          prompt,
          gameState,
          includeVectorMemories: false,
          includePreset: true,
          includeWorldbook: true
        });
      }, 3);
      
      const challenge: ChallengeDesign = {
        id: generateChallengeId(roundNumber),
        roundNumber,
        type: (data as any).type,
        name: (data as any).name,
        description: (data as any).description,
        rules: (data as any).rules,
        winCondition: (data as any).winCondition,
        eliminationCriteria: (data as any).eliminationCriteria,
        difficulty,
        estimatedDuration: (data as any).estimatedDuration,
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
    
    // 创建格式处理器
    const processor = new AIFormatProcessor(
      ChallengeOptimizationSchema,
      {},
      `【重要】必须严格按照JSON格式输出，不要添加任何解释文字。`
    );
    
    const systemInstruction = `你是一个"色情大闯关"关卡设计的严苛批评家。你的职责是从**游戏机制创新性**和**玩法趣味性**角度，对关卡设计进行犀利批判和深度优化。

当前关卡设计（第${optimizationRound}轮审核）:
${currentDesign}

## 批判维度（按重要性排序）：

### 1. 【玩法机制创新性】★★★★★（最重要）
**批判要点**：
- 这个关卡的**核心玩法**是否足够创新？还是只是传统关卡换皮？
- 游戏规则是否有独特的**互动机制**？还是简单的线性流程？
- 是否有**多重玩法融合**？还是单一玩法？
- 是否有**随机性/策略性/时间压力**等增加趣味的元素？
- 参赛者的**决策空间**有多大？是否只有唯一最优解？

**常见问题**：
❌ 只是"跑得快就赢"、"分数高就过"这种浅层设计
❌ 没有玩家选择和策略空间
❌ 缺乏关卡间的玩法差异化
❌ 规则过于简单或过于复杂

### 2. 【游戏性与趣味性】★★★★☆
**批判要点**：
- 这个关卡**好玩吗**？有没有让人想一直玩下去的魅力？
- 是否有**起伏和戏剧性**？还是一成不变？
- 失败/成功的**反馈机制**是否清晰且有冲击力？
- 观众和参赛者的**代入感**如何？
- 是否有**可重复游玩价值**？

### 3. 【色情元素融合度】★★★★☆
**批判要点**：
- 色情元素是否**自然融入玩法核心**？还是生硬添加？
- 失败后果是否有**刺激性和代入感**？
- 色情场景是否**服务于游戏玩法**？还是为黄而黄？

### 4. 【规则可执行性】★★★☆☆
**批判要点**：
- 规则是否清晰且可量化判定？
- 淘汰标准是否公平合理？

## 优化要求：

**必须做到**：
1. **狠狠批判**现有设计的机制缺陷，不要客气
2. **提出至少3个具体的机制创新点**
3. **重新设计核心玩法**，而不是小修小补
4. **增加玩家选择和策略空间**
5. **融合多种玩法类型**（竞速+策略、解谜+盲盒等）
6. **输出完整的优化版关卡设计**（JSON格式）

**创新方向参考**（不要照搬）：
- 增加**资源管理**机制（性能量、时间、道具等）
- 引入**风险收益权衡**（冒险获得优势 vs 保守求稳）
- 加入**多阶段/多路径**设计
- 设置**动态难度调整**或**随机事件**
- 增加**玩家间互动**（协作/背叛/竞争）
- 融合**盲盒/抽卡**等随机元素
- 加入**限时决策**或**信息不对称**

${processor.getFormatInstruction()}

返回格式示例:
{
  "critique": "【玩法机制批判】当前设计的核心问题是...(300字详细批判)",
  "issues": [
    "机制问题1：缺乏玩家决策空间，只是单纯的体能测试",
    "机制问题2：没有策略深度，最优解过于明显",
    "机制问题3：玩法单一，缺乏多样性和惊喜感"
  ],
  "suggestions": [
    "创新建议1：引入资源管理机制，玩家需要权衡体力分配",
    "创新建议2：增加多路径选择，高风险高回报 vs 低风险低回报",
    "创新建议3：融合盲盒元素，增加随机性和不确定性"
  ],
  "changes": [
    "将单一竞速改为：竞速+资源管理+路径选择的组合玩法",
    "增加关卡内的决策点：3个关键节点需要玩家做出战术选择",
    "引入动态事件：根据玩家选择触发不同色情场景"
  ],
  "optimizedDesign": "{完整的优化后关卡JSON设计}",
  "improvementSummary": "本次优化的核心是将简单的XXX改造为具有策略深度的YYY玩法..."
}`;

    const prompt = `进行第${optimizationRound}轮批判性优化：
1. 从玩法机制创新性角度狠狠批判当前设计
2. 提出至少3个具体的机制突破建议
3. 重新设计核心玩法，不要小修小补
4. 输出完整的优化版关卡
直接返回JSON。`;

    try {
      // 使用带重试的处理
      const data = await processor.processWithRetry(async () => {
        return await enhancedGenerate({
          systemInstruction,
          prompt,
          gameState,
          includeVectorMemories: false,
          includePreset: true,
          includeWorldbook: true
        });
      }, 3);
      
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
   