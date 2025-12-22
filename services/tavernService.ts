import { EQUIPMENT_POOL } from '../constants';
import { Announcement, BattleParticipant, BountyTarget, BusinessDistrict, CharacterCard, CharacterRelationship, Equipment, GameState, LaborResult, LaborSiteType, MedicalRecord, MemoryEntry, MemorySummary, PetCard, PlayerProfile, Prisoner, RandomEvent, Rarity, Skill, StatusEffect, SummaryType } from '../types';
import { enhancedGenerate, simpleGenerate } from './enhancedAIGenerator';

/**
 * 将当前游戏状态保存到指定槽位。
 * @param state 要保存的GameState。
 * @param slotId 存档槽位ID (1-5)。
 */
export async function saveGameToSlot(state: GameState, slotId: number): Promise<void> {
    try {
        await window.TavernHelper.updateVariablesWith(
            (vars) => {
                if (!vars.xianxiaRpgSaves) {
                    vars.xianxiaRpgSaves = {};
                }
                vars.xianxiaRpgSaves[slotId] = state;
                return vars;
            },
            { type: 'character' }
        );
    } catch (error) {
        console.error(`保存游戏到槽位 ${slotId} 失败:`, error);
    }
}

/**
 * 从指定槽位加载游戏状态。
 * @param slotId 存档槽位ID (1-5)。
 * @returns 如果存在已保存的状态，则返回GameState；否则返回null。
 */
export function loadGameFromSlot(slotId: number): GameState | null {
    try {
        const variables = window.TavernHelper.getVariables({ type: 'character' });
        if (variables && variables.xianxiaRpgSaves && variables.xianxiaRpgSaves[slotId]) {
            return variables.xianxiaRpgSaves[slotId] as GameState;
        }
        return null;
    } catch (error) {
        console.error(`从槽位 ${slotId} 加载游戏失败:`, error);
        return null;
    }
}

/**
 * 获取所有存档信息。
 * @returns 一个包含所有存档槽位数据的对象。
 */
export function getAllSaves(): Record<number, GameState | null> {
    try {
        const variables = window.TavernHelper.getVariables({ type: 'character' });
        return (variables && variables.xianxiaRpgSaves) || {};
    } catch (error) {
        console.error("获取所有存档失败:", error);
        return {};
    }
}

/**
 * 从AI生成的文本中提取并解析JSON代码块。
 * @param text 包含JSON代码块的文本。
 * @returns 解析后的JSON对象，如果找不到或解析失败则抛出错误。
 */
function parseJsonFromText(text: string): any {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (error) {
            console.error("解析从AI响应中提取的JSON失败:", error);
            console.error("原始JSON字符串:", match[1]);
            throw new Error("模型返回的JSON格式无效。");
        }
    }
    console.error("在AI响应中未找到JSON代码块。响应内容:", text);
    throw new Error("模型响应中未找到预期的JSON代码块。");
}

export async function generateExplorationStep(storyHistory: string, playerAction: string, playerProfile: PlayerProfile, gameState?: GameState) {
    const systemInstruction = `你是一位仙侠（中国仙幻）RPG的大师级故事讲述者和游戏主持人。
1. 阅读故事历史、玩家档案和玩家的行动。
2. 撰写故事的下一章。故事应引人入胜，文笔优美，符合仙侠主题。
3. **任务更新**:
   a. 如果玩家的行动完成了某个正在进行的任务目标（例如，与特定NPC交谈），你**必须**在JSON输出中包含一个 'questUpdate' 对象。该对象应包含 'questId', 'objectiveId' 和 'progress' (通常为1，代表完成1次)。
   b. 如果故事发展到了可以触发一个新任务的节点，你**可以**在JSON输出中包含一个 'newQuest' 对象，其结构必须符合我们定义的Quest类型。
4. **战斗和挑战**: 仅当故事中明确出现一个角色对另一个角色"亮出黄牌"时，你才必须触发战斗。
5. **关系更新**: 如果剧情导致角色关系发生变化，你可以包含一个 'relationshipUpdate' 对象。
6. 更新游戏世界的状态（地点，时间）。
7. 提供三个富有创意、各不相同且简洁的行动选项。
8. 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const truncatedHistory = storyHistory.length > 2000 ? `...${storyHistory.slice(-2000)}` : storyHistory;
    const activeParty = playerProfile.maleParty.length > 0 ? playerProfile.maleParty : playerProfile.femaleParty;

    const prompt = `
    迄今为止的故事：
    ${truncatedHistory}

    玩家档案（摘要）：
    姓名: ${playerProfile.name}
    队伍成员: ${activeParty.map(c => c.name).join('、')}
    声望: ${playerProfile.reputation.level} (${playerProfile.reputation.score})
    进行中的任务: ${JSON.stringify(playerProfile.quests.filter(q => q.status === 'In Progress'))}

    玩家的行动：
    "${playerAction}"

    现在，请生成故事的下一部分和新的游戏状态。
    `;
    
    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    const jsonResponse = parseJsonFromText(generatedText);
    
    // 此处保留了原有的战斗触发逻辑，以备后用
    if (jsonResponse.event?.type === 'battle') {
       // 在这个适配版本中，对手数据应由AI在后续步骤生成，此处仅为结构占位
       return { ...jsonResponse, opponentParty: [] };
    }

    return jsonResponse;
}

export async function processCombatTurn(playerCard: BattleParticipant, opponentCard: BattleParticipant, playerAction: string, gameState?: GameState): Promise<{
    playerActionDescription: string;
    opponentActionDescription: string;
    playerTurnSummary: string;
    opponentTurnSummary: string;
    playerHpChange: number;
    opponentHpChange: number;
    playerMpChange: number;
    opponentMpChange: number;
    playerStatusEffects: StatusEffect[];
    opponentStatusEffects: StatusEffect[];
}> {
    const systemInstruction = `你是一位顶级的仙侠世界色情战斗解说员。你的任务是基于角色、技能和装备的色情设定，生成一段露骨、详细、电影般的战斗场景描述，同时精确计算战斗结果。

**核心规则：**
1.  **色情战斗描述 (ActionDescription)**: 这是你的首要任务。你必须基于当前行动者使用的技能的 'eroticDescription' 进行扩展和润色，**同时必须引用其护甲和饰品的外观描述**，生成一段详细、露骨、充满想象力的色情战斗场景描述。
    - **装备融合要求**:
      * 如果角色装备了护甲，必须在描述中体现护甲的暴露程度、性感设计和布料材质
      * 如果角色装备了饰品，必须在描述中提及饰品如何增强其魅力、闪耀光芒或产生特殊效果
      * 不同护甲和饰品会让同一技能的释放呈现出不同的视觉效果和色情表现
      * 特别注意护甲在战斗动作中的晃动、移位、破损等细节
    - **描述要求**: 这段描述应该具体到身体姿态、表情、体液、护甲与饰品如何衬托身体曲线、以及性器官的互动。此字段绝对不能包含任何数值。
2.  **精确伤害计算**: 基础伤害 = (攻击者攻击力 - 防御者防御力)。最低伤害为5。
3.  **状态与会心**: 严格按照技能机制、状态效果和会心率计算最终伤害和HP/MP变化。
4.  **简洁战斗总结 (TurnSummary)**: 这个字段必须非常简洁，格式必须为："【技能名】对 角色名 造成了 X 点伤害。" 或 "【技能名】为 角色名 恢复了 X 点气血。"
5.  **AI对手行动**: 对手总是使用其两个技能之一。选择策略上最合理的一个，并同样为其生成色情的 'opponentActionDescription' 和简洁的 'opponentTurnSummary'。
6.  **状态效果生成**: 如果技能造成了状态效果（如中毒、灼烧、虚弱、魅惑等），必须在对应的statusEffects数组中添加完整的状态效果对象。

**状态效果对象格式（StatusEffect）：**
每个状态效果对象必须包含以下字段：
- **name**: 状态名称（如"中毒"、"灼烧"、"攻击力提升"等）
- **description**: 风味描述（50-100字，描述状态的表现和感受）
- **mechanicsDescription**: 机制说明（必填！清晰说明数值效果，如"每回合损失10点气血"、"攻击力提升30%，持续3回合"）
- **duration**: 持续回合数（数字）

示例：
\`\`\`json
{
  "name": "中毒",
  "description": "体内侵入了剧毒，感到阵阵眩晕和虚弱，紫黑色的毒素在血管中流淌。",
  "mechanicsDescription": "每回合开始时损失最大气血的5%，持续3回合",
  "duration": 3
}
\`\`\`

**必须返回的JSON格式（所有字段都是必填的）：**
\`\`\`json
{
  "playerActionDescription": "玩家技能的色情描述文本（200-400字）",
  "opponentActionDescription": "对手技能的色情描述文本（200-400字）",
  "playerTurnSummary": "【技能名】对 对手名 造成了 X 点伤害",
  "opponentTurnSummary": "【技能名】对 玩家名 造成了 X 点伤害",
  "playerHpChange": -30,
  "opponentHpChange": -50,
  "playerMpChange": -20,
  "opponentMpChange": -15,
  "playerStatusEffects": [
    {
      "name": "状态名称",
      "description": "状态的风味描述",
      "mechanicsDescription": "状态的机制说明（必填！）",
      "duration": 3
    }
  ],
  "opponentStatusEffects": [
    {
      "name": "状态名称",
      "description": "状态的风味描述",
      "mechanicsDescription": "状态的机制说明（必填！）",
      "duration": 3
    }
  ]
}
\`\`\`

**关键要求：**
- playerStatusEffects 和 opponentStatusEffects 必须是数组，即使为空也要返回 []
- 如果有状态效果，每个状态效果对象的mechanicsDescription字段是**必填的**，不能省略！
- 所有数值字段都必须存在，即使为0也要明确写出
- TurnSummary 必须包含【技能名】以便提取
- 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const getSkillsInfo = (participant: BattleParticipant) => {
        return participant.card.skills
            .filter(s => s)
            .map(s => ({ name: s!.name, cost: s!.cost, mechanics: s!.mechanicsDescription, eroticDescription: s!.eroticDescription }));
    };

    const getEquipmentInfo = (participant: BattleParticipant) => {
        const equip = participant.card.equipment;
        const equipmentDesc: string[] = [];
        if (equip.armor) {
            equipmentDesc.push(`护甲【${equip.armor.name}】: ${equip.armor.description}`);
        }
        if (equip.accessory1) {
            equipmentDesc.push(`饰品【${equip.accessory1.name}】: ${equip.accessory1.description}`);
        }
        if (equip.accessory2) {
            equipmentDesc.push(`饰品【${equip.accessory2.name}】: ${equip.accessory2.description}`);
        }
        return equipmentDesc.length > 0 ? equipmentDesc.join('\n') : '无装备';
    };

    const prompt = `
    当前战斗人员：
    - 玩家卡牌: ${playerCard.card.name} (境界: ${playerCard.card.realm}, 攻击: ${playerCard.calculatedStats.attack}, 防御: ${playerCard.calculatedStats.defense}, 当前气血: ${playerCard.currentHp}, 当前真元: ${playerCard.currentMp}, 当前状态: ${JSON.stringify(playerCard.statusEffects)}, 技能: ${JSON.stringify(getSkillsInfo(playerCard))})
      装备描述:
      ${getEquipmentInfo(playerCard)}
    
    - 对手卡牌: ${opponentCard.card.name} (境界: ${opponentCard.card.realm}, 攻击: ${opponentCard.calculatedStats.attack}, 防御: ${opponentCard.calculatedStats.defense}, 当前气血: ${opponentCard.currentHp}, 当前真元: ${opponentCard.currentMp}, 当前状态: ${JSON.stringify(opponentCard.statusEffects)}, 技能: ${JSON.stringify(getSkillsInfo(opponentCard))})
      装备描述:
      ${getEquipmentInfo(opponentCard)}

    玩家的行动：
    "${playerAction}"

    请结算此回合。首先，基于玩家使用的技能的 'eroticDescription' **并融合其护甲和饰品的外观描述** 生成 'playerActionDescription'，让护甲的暴露设计和饰品的华丽外观在技能释放中体现出来。然后，决定对手的行动，同样结合其护甲和饰品生成 'opponentActionDescription' 并计算结果。
    
    **重要**: 必须在动画描述中提及并利用护甲和饰品的色情外观，不同护甲和饰品应该让相同技能呈现出不同的视觉效果！特别关注护甲在动作中的移动、透视、破损效果！
    `;
    
    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return parseJsonFromText(generatedText);
}

export async function generateRandomEvent(location: string, playerProfile: PlayerProfile, gameState?: GameState): Promise<RandomEvent> {
    const systemInstruction = `你是一位仙侠（中国仙幻）RPG的大师级故事讲述者和游戏主持人。你的任务是生成一个随机世界事件。
1. 事件应该有趣并符合仙侠主题。
2. 提供一个简短、引人入胜的故事。
3. 创建2-3个有意义的选择，并有明确的风险/回报结果。
4. 结果必须是指定类型之一。
5. 如果结果是 'reward_item'，你必须从提供的可用装备列表中选择一个物品名称。
6. 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const availableItems = EQUIPMENT_POOL.map(e => e.name).join(', ');

    const prompt = `
    玩家当前位置: ${location}
    玩家姓名: ${playerProfile.name}
    可作为奖励的物品: ${availableItems}

    请根据此背景生成一个随机事件。
    `;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return parseJsonFromText(generatedText);
}

export async function generateRandomCharacter(rarity: Rarity, gameState?: GameState): Promise<CharacterCard> {
    const systemInstruction = `你是一位专业的仙侠背景色情内容创作者，写作风格大胆、露骨、毫不避讳。你的任务是根据指定的稀有度，创造一个极度色情的角色。

**重要：你必须严格按照以下JSON结构生成角色数据，所有必填字段都不能省略！**

1.  **严格遵守稀有度**: 稀有度越高，角色的色情程度和暴露程度应该越高。

2.  **必填字段（缺一不可）**:
    *   **id**: 字符串，格式为 "generated-{timestamp}"
    *   **name**: 角色姓名
    *   **gender**: 必须是 "Male" 或 "Female" 之一
    *   **realm**: 修炼境界，如"筑基期"、"金丹期"等
    *   **rarity**: 稀有度（将由系统设置）
    *   **title**: 称号，必须直接、粗俗，充满性意味
    *   **race**: 种族，如"人族"、"妖族"、"魔族"等
    *   **origin**: 来历背景描述
    *   **appearance**: 外观描述，必须极度详细、露骨
    *   **charm**: 魅力值（1-100）
    *   **skillfulness**: 技巧值（1-100）
    *   **perception**: 悟性值（1-100）
    *   **baseAttributes**: 包含 hp, maxHp, mp, maxMp, attack, defense, speed, critRate, critDmg
    *   **skills**: **必须是一个包含4个元素的数组** [Skill, Skill, null, null]，前2个是独有技能对象，后2个填null
    *   **equipment**: 对象，包含 weapon: null, armor: null, accessory1: null, accessory2: null
    *   **pet**: null

3.  **技能数组格式（极其重要）**:
    角色的 skills 字段必须是一个包含恰好4个元素的数组：
    *   前2个元素：完整的技能对象，每个包含：id, name, rarity, description, mechanicsDescription, eroticDescription, cost, genderLock
    *   后2个元素：null
    
    示例：
    "skills": [
        {
            "id": "skill-{timestamp}-1",
            "name": "技能名称",
            "rarity": "珍品",
            "description": "技能描述",
            "mechanicsDescription": "造成120%攻击力伤害",
            "eroticDescription": "色情化描述",
            "cost": 20,
            "genderLock": "Female"
        },
        {
            "id": "skill-{timestamp}-2",
            "name": "第二个技能",
            ...
        },
        null,
        null
    ]

4.  **色情化核心字段**:
    *   **appearance**: 必须极度详细、露骨，直接聚焦于性器官和性感部位
    *   **title**: 称号必须充满性暗示
    *   **skills中的eroticDescription**: 每个技能都必须有详细的色情化描述

5.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请生成一个稀有度为【${rarity}】的角色卡。`;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);
    return parseJsonFromText(generatedText);
}

export async function generateRandomEquipment(rarity: Rarity, gameState?: GameState): Promise<Equipment> {
    const systemInstruction = `你是一位顶级的仙侠世界色情装备设计师，精通如何将功能与极致的色情美学结合。

**重要：你必须严格按照Equipment接口生成装备数据！**

1.  **严格遵守稀有度**: 稀有度越高，装备应该越暴露、越色情、功能越奇特。

2.  **必填字段**:
    *   **id**: 格式为 "equip-{timestamp}"
    *   **name**: 充满性暗示的装备名称
    *   **type**: 必须是 "Weapon"、"Armor" 或 "Accessory" 之一
    *   **rarity**: 稀有度（将由系统设置）
    *   **description**: 极度详细、露骨的描述
    *   **genderLock** (可选): "Male"、"Female" 或 "Universal"
    *   **stats**: 属性加成对象，必须包含至少一个属性

3.  **stats属性数值规范（极其重要）**:
    *   **attack**: 攻击力加成，整数，根据稀有度范围：凡品5-10，良品8-15，优品12-25，珍品20-40，绝品35-60，仙品50-80，圣品70-100，神品90-150
    *   **hp**: 气血加成，整数，根据稀有度范围：凡品15-30，良品25-50，优品40-80，珍品60-120，绝品100-180，仙品150-250，圣品200-350，神品300-500
    *   **defense**: 防御力加成，整数，根据稀有度范围：凡品3-8，良品6-12，优品10-20，珍品15-35，绝品30-50，仙品40-70，圣品60-90，神品80-120
    *   **speed**: 速度加成，整数，根据稀有度范围：凡品2-5，良品4-8，优品6-12，珍品10-18，绝品15-25，仙品20-35，圣品30-45，神品40-60
    *   **critRate**: 暴击率加成，**必须是0-1之间的小数**，如0.05表示5%，根据稀有度范围：凡品0.02-0.05，良品0.04-0.08，优品0.06-0.12，珍品0.08-0.15，绝品0.12-0.20，仙品0.15-0.25，圣品0.20-0.30，神品0.25-0.40
    *   **critDmg**: 暴击伤害加成，**必须是0-1之间的小数**，如0.15表示15%，根据稀有度范围：凡品0.05-0.10，良品0.08-0.15，优品0.10-0.20，珍品0.15-0.30，绝品0.20-0.40，仙品0.30-0.50，圣品0.40-0.60，神品0.50-0.80

4.  **色情化核心字段**:
    *   **description**: 必须聚焦于其色情外观和穿着效果
    *   **name**: 装备名称充满性暗示

5.  **JSON格式示例**:
\`\`\`json
{
  "id": "equip-temp",
  "name": "淫纹软鞭",
  "type": "Weapon",
  "rarity": "良品",
  "description": "一条柔软如蛇的鞭子，鞭身刻满了催情淫纹，每次挥动都会释放出让人春心荡漾的气息。",
  "genderLock": "Universal",
  "stats": {
    "attack": 12,
    "speed": 6,
    "critRate": 0.06
  }
}
\`\`\`

6.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请生成一个稀有度为【${rarity}】的装备。`;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);
    return parseJsonFromText(generatedText);
}

export async function generateRandomSkill(rarity: Rarity, genderLock: 'Male' | 'Female' | 'Universal', gameState?: GameState): Promise<Skill> {
    const systemInstruction = `你是一位顶级的仙侠世界色情技能设计师，精通如何将技能效果与极致的色情表现结合。

**重要：你必须严格按照Skill接口生成技能数据！**

1.  **严格遵守稀有度**: 稀有度越高，技能的色情程度和表现力应该越强。

2.  **严格遵守性别锁 (genderLock)**: 你必须为你被指定的性别【${genderLock}】设计技能。
    *   如果是 **Male**，描述应聚焦于男性的雄伟、力量和侵略性
    *   如果是 **Female**，描述应聚焦于女性的妩媚、柔软和淫荡
    *   如果是 **Universal**，描述应适用于任何性别

3.  **必填字段**:
    *   **id**: 格式为 "skill-{timestamp}"
    *   **name**: 充满性暗示的技能名称
    *   **rarity**: 稀有度（将由系统设置）
    *   **description**: 技能风味描述
    *   **mechanicsDescription**: 技能机制描述（如"造成120%攻击力伤害"）
    *   **eroticDescription**: 极度色情的技能释放描述
    *   **cost**: 真元消耗（数值）
    *   **genderLock**: "Male"、"Female" 或 "Universal"

4.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请为【${genderLock}】性别生成一个稀有度为【${rarity}】的技能。`;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);
    const generatedSkill = parseJsonFromText(generatedText);
    // 确保AI返回的性别锁是我们请求的性别锁
    generatedSkill.genderLock = genderLock;
    return generatedSkill;
}

export async function generateAnnouncements(category: 'sect' | 'adventure' | 'world', count: number, gameState?: GameState): Promise<Omit<Announcement, 'id' | 'category'>[]> {
    const systemInstruction = `You are a creative storyteller for a Xianxia (Chinese Fantasy) RPG. Your task is to generate world announcements that make the game world feel alive and dynamic.
1.  Generate exactly ${count} announcements for the specified category.
2.  Each announcement must have a title, content, and a thematic timestamp.
3.  The tone should be immersive and match the Xianxia genre. Announcements can be about major events, minor gossip, character achievements, or mysterious occurrences.
4.  Your final output must be a JSON object wrapped in a \`\`\`json ... \`\`\` code block. Do not add any explanations or comments outside the code block.`;

    const categoryDescriptions = {
        'sect': "Sect Announcements: Focus on events within the player's sect (青蛇宗) or rival sects. Examples: promotions, breakthroughs, new rules, successful alchemy, challenges between disciples.",
        'adventure': "Adventures & Anecdotes: Focus on rumors, discoveries, and strange events happening in the world that players might investigate. Examples: mysterious treasures appearing, strange beasts spotted, legendary cultivators being seen, gossip from a teahouse.",
        'world': "World Decrees: Focus on major, world-shaking events. Examples: Heavenly Dao phenomena, wars between major factions, the birth of a divine being, the opening of an ancient ruin."
    };

    const prompt = `
    Please generate ${count} announcements for the following category: ${category}
    Category Guideline: ${categoryDescriptions[category]}
    `;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    const jsonResponse = parseJsonFromText(generatedText);
    return jsonResponse.announcements || [];
}

export function updateCharacterRelationship(
    playerProfile: PlayerProfile,
    update: { characterId: string; status?: '熟人' | '陌生人'; newTags?: string[] }
): PlayerProfile {
    const newProfile = JSON.parse(JSON.stringify(playerProfile));
    const relationshipIndex = newProfile.relationships.findIndex(rel => rel.id === update.characterId);

    if (relationshipIndex !== -1) {
        const existingRel = newProfile.relationships[relationshipIndex];
        if (update.status) {
            existingRel.relationshipStatus = update.status;
        }
        if (update.newTags) {
            const tagSet = new Set([...existingRel.relationshipTags, ...update.newTags]);
            existingRel.relationshipTags = Array.from(tagSet);
        }
    } else {
        // 如果关系不存在，可以考虑在这里创建一个新的关系条目
        // 这需要更多的角色信息，目前暂时只处理更新
        console.warn(`Relationship with ID ${update.characterId} not found.`);
    }

    return newProfile;
}

export async function generateReputationDetails(playerProfile: PlayerProfile, gameState?: GameState): Promise<{ dynamicTitles: string[]; greatestDeeds: string[] }> {
    const systemInstruction = `你是一个仙侠世界的天机阁说书人，负责根据玩家的档案和声望，总结他们的称号和光辉事迹。
1.  阅读玩家的档案，特别是他们的声望分数和等级。
2.  基于他们的声望，创造性地生成 2-3 个符合仙侠风格的江湖称号。
3.  基于他们的声望和故事历史（摘要），总结出他们做过的最广为人知的两件大事。
4.  你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象，包含 'dynamicTitles' 和 'greatestDeeds' 两个数组。不要在代码块之外添加任何解释或注释。`;

    const prompt = `
    玩家档案：
    姓名: ${playerProfile.name}
    称号: ${playerProfile.title}
    声望等级: ${playerProfile.reputation.level}
    声望分数: ${playerProfile.reputation.score}

    请为这位修士生成动态称号和生平事迹。
    `;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return parseJsonFromText(generatedText);
}
export async function generateReputationStory(playerProfile: PlayerProfile, gameState?: GameState): Promise<{ title: string; goodDeeds: string[]; badDeeds: string[]; lewdDeeds: string[] }> {
    const systemInstruction = `你是一个仙侠世界的天机阁说书人，负责根据玩家的档案和声望，总结他们的称号和各种事迹。
1.  阅读玩家的档案，特别是他们的声望分数和等级。
2.  基于他们的声望，创造性地生成 1 个符合仙侠风格的江湖称号。
3.  基于他们的声望和故事历史（摘要），总结出他们做过的两件广为人知的好事。
4.  基于他们的声望和故事历史（摘要），总结出他们做过的两件广为人知的坏事。
5.  发挥你的想象力，杜撰两件关于该角色的风流韵事或“最色的事”，要大胆、出格、符合仙侠世界的风土人情。例如“胁迫敌对宗门圣女当众裸体跳舞”或“在瑶池圣地偷看仙子洗澡”。
6.  你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象，包含 'title', 'goodDeeds', 'badDeeds', 和 'lewdDeeds' 四个字段，每个数组包含两个字符串。不要在代码块之外添加任何解释或注释。`;

    const prompt = `
    玩家档案：
    姓名: ${playerProfile.name}
    称号: ${playerProfile.title}
    声望等级: ${playerProfile.reputation.level}
    声望分数: ${playerProfile.reputation.score}

    请为这位修士生成称号和各类事迹。
    `;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return parseJsonFromText(generatedText);
}

export async function generateDoujinCharacter(inspiration: string, rarity?: Rarity, gameState?: GameState): Promise<CharacterCard> {
    const rarityInstruction = rarity
        ? `\n\n**重要：你必须生成稀有度为【${rarity}】的角色！这是系统根据概率随机决定的，你必须严格遵守。**`
        : '';
    
    const systemInstruction = `你是一位专业的跨次元同人创作大师，精通将各种作品的角色进行仙侠背景的色情化改编。写作风格大胆、露骨、毫不避讳。你的任务是根据用户提供的"灵感来源"，创造一个既保留原著核心特征、又完全适配仙侠世界观、并极度色情化的角色卡。${rarityInstruction}

**重要：你必须严格按照以下JSON结构生成角色数据，所有必填字段都不能省略！**

1.  **解析灵感与原著还原**:
    *   深入理解灵感来源的核心概念（角色名、作品、标志性特征、性格、能力等）
    *   识别并保留角色最具代表性的元素（外观特征、性格特质、标志性能力）
    *   确保改编后的角色能让熟悉原作的人一眼认出

2.  **仙侠化改编原则**:
    *   将原作的能力系统转化为仙侠修炼体系（魔法→法术，超能力→神通）
    *   背景故事融入仙侠世界观（宗门、修真界、天道等元素）
    *   保持角色原有的性格特质和人际关系动态
    *   修炼境界应与原作实力相匹配

3.  **色情化改编要求**:
    *   **性格调整**: 在保留核心性格的基础上，添加符合成人向内容的欲望倾向、性冲动、情色特质
    *   **背景融入**: 将原著经历进行色情化解读（战斗→性战、修炼→双修、师徒关系→禁忌情欲）
    *   **关系重构**: 角色间的互动关系向性张力和情欲纠葛方向调整
    *   **场景暗示**: 设定中暗示或明示角色经历过的色情场景和性相关事件

4.  **必填字段（缺一不可）**:
    *   **id**: 字符串，格式为 "doujin-generated-{timestamp}"
    *   **name**: 角色姓名（可保留原名或仙侠化改编，如"纳尔逊"→"纳兰尘"）
    *   **gender**: 必须是 "Male" 或 "Female" 之一
    *   **realm**: 修炼境界，需与原作实力对应（如"筑基期"、"金丹期"等）
    *   **rarity**: 稀有度（根据原作角色重要性决定，主角级别建议"绝品"以上）
    *   **title**: 称号，必须融合原作特征且充满性暗示
        - 示例：火影忍者的鸣人 → "九尾淫狐传人"
        - 示例：海贼王的娜美 → "天候魅魔"
    *   **race**: 种族，需仙侠化改编（如精灵→仙族，恶魔→魔族，人类→人族）
    *   **origin**: 来历背景描述，必须：
        - 保留原作核心背景元素
        - 融入仙侠世界观设定
        - 加入色情化经历和性相关事件
    *   **appearance**: 外观描述，必须：
        - 保留原作标志性外观特征（发色、瞳色、装束风格等）
        - 极度详细、露骨地描述身体和性器官
        - 聚焦于性感部位和性特征
    *   **charm**: 魅力值（1-100，根据原作魅力设定）
    *   **skillfulness**: 技巧值（1-100，根据原作战斗技巧）
    *   **perception**: 悟性值（1-100，根据原作智慧/学习能力）
    *   **baseAttributes**: 包含 hp, maxHp, mp, maxMp, attack, defense, speed, critRate, critDmg
    *   **skills**: **必须是一个包含4个元素的数组** [Skill, Skill, null, null]，前2个是独有技能对象，后2个填null
    *   **equipment**: 对象，包含 weapon: null, armor: null, accessory1: null, accessory2: null
    *   **pet**: null

5.  **技能数组格式（极其重要）**:
    角色的 skills 字段必须是一个包含恰好4个元素的数组：
    *   前2个元素：完整的技能对象，必须改编自原作的标志性能力
    *   后2个元素：null
    
    技能改编要求：
    *   **保留原作技能特征**: 技能名称和效果必须能让人联想到原作
    *   **仙侠化转换**: 将原作技能转化为仙侠法术/神通
    *   **色情化描述**: eroticDescription必须极度详细地描写技能释放时的色情场景
    
    示例结构：
    "skills": [
        {
            "id": "skill-doujin-{timestamp}-1",
            "name": "改编后的技能名（保留原作特征）",
            "rarity": "珍品",
            "description": "技能描述（融合原作+仙侠+色情）",
            "mechanicsDescription": "造成120%攻击力伤害",
            "eroticDescription": "极度色情的技能释放过程描述",
            "cost": 20,
            "genderLock": "Female"
        },
        {
            "id": "skill-doujin-{timestamp}-2",
            "name": "第二个技能",
            ...
        },
        null,
        null
    ]

6.  **色情化核心字段**:
    *   **appearance**: 必须极度详细、露骨，保留原作外观特征的同时聚焦于性器官和性感部位
    *   **title**: 称号必须融合原作特征且充满性暗示
    *   **origin**: 必须包含色情化的背景经历
    *   **skills中的eroticDescription**: 每个技能都必须有详细的色情化描述，且能体现原作技能特点

7.  **改编示例参考**:
    
    **原作**: 火影忍者 - 漩涡鸣人
    **改编要点**:
    - name: "漩涡鸣人" 或 "涡鸣尘"
    - title: "九尾淫狐传人" 或 "千人柱力"
    - race: "人族"
    - origin: "体内封印着上古淫兽九尾妖狐，每逢月圆之夜便欲火焚身。曾因不受村民待见而在红灯区寻求慰藉，逐渐觉醒了九尾的淫荡本性..."
    - 技能1: "影分身淫术" - 基于多重影分身改编
    - 技能2: "螺旋丸·欲望版" - 基于螺旋丸改编
    - appearance: 保留金发、蓝眼、六道胡须的特征，但详细描写性器官

8.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请根据以下灵感来源，生成一张同人角色卡${rarity ? `，稀有度必须是【${rarity}】` : ''}。记住：必须保留原作核心特征，完整进行仙侠化改编，并极度色情化！

灵感来源：
"${inspiration}"`;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);
    return parseJsonFromText(generatedText);
}

/**
 * 为商业区生成一个随机经营事件
 * @param businessDistrict 玩家的商业区数据
 * @param allCharacters 玩家拥有的所有角色卡牌列表
 * @param gameState 当前游戏状态（可选，用于增强上下文）
 * @returns 一个包含事件消息和收入变化的对象
 */
export async function generateBusinessEvent(
    businessDistrict: BusinessDistrict,
    allCharacters: CharacterCard[],
    gameState?: GameState
): Promise<{ message: string; incomeChange: number }> {
    const systemInstruction = `你是"七情六欲坊"商业街区的秘密记录者，专门记录每天发生的淫荡经营事件。你的描写必须色情、露骨、具体。

**重要：你必须严格按照以下JSON格式输出！**

1.  **必填字段**:
    *   **message**: 事件描述文本（80-150字）
    *   **incomeChange**: 收入变化数值（整数，可正可负）

2.  **事件创作要求**:
    *   **挑选员工**: 从提供的员工中随机选择1-2名
    *   **结合岗位**: 事件必须与员工的店铺类型相关
    *   **色情化描述**: 必须包含具体的性行为或淫荡细节
    
3.  **事件类型示例**:
    
    **正面事件（incomeChange: +20 至 +50）**:
    - 青楼："花魁【角色名】今夜侍奉了一位富商，其精湛的床技让对方欲仙欲死，一夜七次仍不知疲倦。富商心满意足，打赏黄金百两。"
    - 角斗场："角斗士【角色名】在擂台上展示雄壮身姿，其健硕的肉体和巨大的阳具让无数女修尖叫，纷纷豪掷灵石只为一亲芳泽。"
    - 炼丹房："炼丹师【角色名】今日成功炼制出三炉春药，药效极佳，服用者能持续交合三天三夜不知疲倦，供不应求。"
    
    **负面事件（incomeChange: -10 至 -40）**:
    - 青楼："【角色名】因沉迷欢愉过度，今日无法接客，白白损失一日收入。"
    - 角斗场："【角色名】与客人野战时用力过猛，导致对方受伤，需赔偿医药费。"
    - 炼丹房："【角色名】偷尝春药后欲火焚身，当众自慰泄欲，惊走了数位客人。"
    
    **中性事件（incomeChange: -5 至 +5）**:
    - "今日【角色名】在岗位上表现平平，无特殊事件发生。"

4.  **描写要求**:
    - 必须具体提及员工姓名
    - 必须包含色情细节（身体部位、性行为、体液等）
    - 语言要生动、露骨、不要含糊其辞
    - 字数控制在80-150字

5.  **JSON格式示例**:
\`\`\`json
{
  "message": "花魁柳如烟今夜侍奉了三位客人，其湿润紧致的蜜穴和精湛的床技让客人们欲仙欲死。她骑乘在最后一位客人身上疯狂摆动，肥美的臀肉拍打得啪啪作响，最终榨干了对方。客人们极为满意，共打赏灵石五十块。",
  "incomeChange": 45
}
\`\`\`

6.  **严格要求**:
    - 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象
    - 不要在代码块之外添加任何解释或注释
    - message必须色情、露骨、具体`;

    const staffInfo = businessDistrict.shops.flatMap(shop =>
        shop.staff.map(staffMember => {
            const character = allCharacters.find(c => c.id === staffMember.characterId);
            return {
                shopType: shop.type,
                characterName: character?.name || '未知员工',
            };
        })
    );

    if (staffInfo.length === 0) {
        return { message: '街区无人开工，一片死寂。', incomeChange: 0 };
    }

    const prompt = `
    当前员工列表:
    ${JSON.stringify(staffInfo, null, 2)}

    请基于以上信息，生成一则今日的经营事件。
    `;

    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    try {
        return parseJsonFromText(generatedText);
    } catch (error) {
        console.error("解析经营事件JSON失败:", error);
        return { message: '今天风平浪静，无事发生。', incomeChange: 0 };
    }
}
/**
 * 生成对特定员工的监视报告
 * @param character 要监视的角色
 * @param positionName 角色所在的岗位名称
 * @param gameState 当前游戏状态（可选，用于增强上下文）
 * @returns 一段描述该员工当前状态或最近趣事的色情文本
 */
export async function generateStaffSurveillanceReport(
    character: CharacterCard,
    positionName: string,
    gameState?: GameState
): Promise<string> {
    const systemInstruction = `你是一个拥有上帝视角的窥视者，正在通过一枚隐形的"监视水晶"偷窥一名员工最私密、最淫荡的工作状态。你必须以第一人称视角，像在直播色情现场一样，极度详细、露骨、毫无保留地描述你看到的一切。

**核心要求**:

1.  **第一人称偷窥视角**:
    - 用"我看到..."、"水晶中显示..."等开头
    - 营造真实的偷窥氛围和禁忌感

2.  **聚焦当前正在发生的淫荡场景**:
    - 描述这个人【此刻】正在做什么淫荡的事
    - 必须是正在进行中的性行为或色情场景
    - 不要描述过去或未来，只描述现在

3.  **结合岗位特点**:
    - 青楼花魁：正在接客，详细描写性交过程
    - 角斗奴隶：正在被调教或与他人交合
    - 炼丹师：正在被春药影响下自慰或与人双修
    - 护卫：正在值班时偷偷手淫或被侵犯
    - 必须与${positionName}的工作内容紧密相关

4.  **极致色情的细节描绘**（必须包含）:
    - **身体姿态**: 四肢如何摆放、如何被束缚、如何弯曲
    - **面部表情**: 眼神、嘴型、是否流口水、是否哭泣
    - **性器官特写**: 阴茎/阴道的状态、颜色、大小、正在发生什么
    - **体液描写**: 精液、淫水、唾液、汗水的流淌和飞溅
    - **声音**: 呻吟声、水声、肉体拍击声
    - **气味**: 汗味、精液味、淫水味
    - **动作细节**: 抽插的节奏、深度、角度

5.  **字数要求**: 150-250字

6.  **禁止事项**:
    - 不要含糊其辞或使用委婉语
    - 不要只描述氛围，必须描述具体的性行为
    - 不要使用JSON格式或任何标记语言
    - 不要添加道德评判或结尾总结

7.  **直接输出**: 你的最终输出只需要一段纯文本的偷窥描述，不要包含任何其他内容。

**示例格式**:
"透过监视水晶，我看到${character.name}正跪在床上，双手被绑在身后，嘴里含着..."`;

    const prompt = `
    正在监视的员工:
    - 姓名: ${character.name}
    - 性别: ${character.gender}
    - 岗位: ${positionName}
    - 外观: ${character.appearance}
    - 特质: ${character.title}

    请以第一人称偷窥视角，生成一份极度详细、露骨、色情的实时监视报告。必须描述正在发生的性行为场景！
    `;

    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return generatedText;
}

/**
 * 与商业区员工进行互动对话
 * @param character 互动的角色
 * @param positionName 角色所在的岗位名称
 * @param playerInput 玩家的输入/互动内容
 * @param previousContext 之前的对话上下文（可选）
 * @param gameState 当前游戏状态（可选，用于增强上下文）
 * @returns AI生成的互动回复
 */
export async function generateStaffInteraction(
    character: CharacterCard,
    positionName: string,
    playerInput: string,
    previousContext?: string,
    gameState?: GameState
): Promise<string> {
    const systemInstruction = `你是一位沉浸式角色扮演大师，正在扮演【${character.name}】，一名在${positionName}工作的员工。

**角色设定**:
- 姓名: ${character.name}
- 性别: ${character.gender}
- 称号: ${character.title}
- 外观: ${character.appearance}
- 岗位: ${positionName}

**互动要求**:
1. **第一人称扮演**: 你必须以第一人称"我"来回应，完全代入角色
2. **保持角色一致性**: 回复必须符合角色的性格、背景和工作岗位
3. **色情化互动**: 根据岗位特点，回复应该包含适度的色情暗示或描写
4. **自然对话**: 回复要像真实对话一样自然，不要太长（50-150字）
5. **场景感**: 结合当前工作场所的氛围和环境

**岗位特点参考**:
- 青楼花魁：妩媚、诱惑、擅长床笫之术
- 角斗奴隶：强壮、服从、展示身体
- 炼丹师：专业、神秘、可能受春药影响
- 护卫：警惕、忠诚、暗藏情欲
- 情报阁探子：神秘、多变、善于诱惑套话

**禁止事项**:
- 不要使用第三人称描述
- 不要脱离角色身份
- 不要过于啰嗦或说教
- 不要使用JSON格式或标记语言

**直接输出**: 只需要一段角色的第一人称回复，不要添加任何其他内容。`;

    const contextPrompt = previousContext
        ? `\n\n之前的对话:\n${previousContext}\n\n`
        : '';

    const prompt = `
${contextPrompt}
玩家对你说：
"${playerInput}"

请以【${character.name}】的身份回应：
    `;

    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return generatedText.trim();
}

/**
 * 生成一个患有奇特性病的病人
 * @returns 一个符合MedicalRecord接口的病人对象
 */
export async function generatePatient(gender?: 'Male' | 'Female', gameState?: GameState): Promise<MedicalRecord> {
    const systemInstruction = `你是一位专业的性病医生和极致色情内容创作大师，精通创造符合仙侠世界观的、极度淫荡的病例。你的描写必须大胆、露骨、毫无保留。

**重要：你必须严格按照以下JSON结构生成病人数据，所有必填字段都不能省略！**

1.  **必填字段（缺一不可）**:
    *   **patientId**: 字符串，临时填写 "temp-id"（系统会自动替换）
    *   **name**: 病人姓名，要有仙侠风格
    *   **gender**: 必须是 "Male" 或 "Female" 之一${gender ? `，且必须是【${gender}】` : ''}
    *   **age**: 年龄（数字，18-40之间）
    *   **background**: 简短背景描述（50-100字），需体现角色的淫荡经历
    *   **genitalShape**: 极度详细、露骨的生殖器形态描述（必须聚焦于性器官的具体形状、大小、颜色、特征）
        - 女性示例："肥美的粉嫩蜜穴，阴唇丰满外翻，阴蒂肿胀凸起如珍珠"
        - 男性示例："巨大的龙根，紫黑色龟头狰狞，青筋暴突，长达尺余"
    *   **sexualFeatures**: 字符串数组，必须包含2-3个极度色情的性特征
        - 必须描述具体的身体反应或性能力
        - 例如：["潮吹体质，高潮时喷射大量淫水"、"乳头永久勃起，轻触即泄"、"肛门松弛，可容纳巨物"]
    *   **illnessDescription**: 极度详细、露骨的性病描述（150-300字）
        - 必须包含：病名、病因、具体症状、发作时的淫荡表现、对身体的影响
        - 必须大胆描写性器官的异常状态、体液分泌、性欲亢进等
        - 例如："所患'淫毒入髓症'，因修炼双修功法时吸入过多淫气所致。症状为：阴道/阴茎持续分泌透明粘液，散发浓郁麝香味；每日子时必定发情，全身燥热难耐，若不交合则痛不欲生；性器异常敏感，任何摩擦都会引发高潮；长期发作会导致神志不清，沦为只知交合的淫兽。"

2.  **色情化核心要求**:
    *   **genitalShape**: 必须极度详细，直接聚焦性器官，使用露骨词汇
    *   **sexualFeatures**: 每一条都必须具体描述性功能或身体反应，不要含糊其辞
    *   **illnessDescription**: 必须详细描写病症如何影响性行为、性欲和性器官
    *   **background**: 需暗示或直接描述角色的淫荡经历

3.  **JSON格式示例**:
\`\`\`json
{
  "patientId": "temp-id",
  "name": "柳如烟",
  "gender": "Female",
  "age": 25,
  "background": "原为怡红院头牌花魁，因长年接客修炼媚功，吸纳过多男子精元，导致走火入魔。曾一夜连续侍奉十八名客人，最终身患奇症。",
  "genitalShape": "肥美多汁的粉色蜜穴，阴唇丰满外翻如花瓣，阴蒂肿胀凸起有指甲盖大小，阴道内壁布满细密肉褶，收缩力极强",
  "sexualFeatures": [
    "超敏感潮吹体质，轻触阴蒂即可达到高潮，并喷射大量透明淫水",
    "双乳永久泌乳，乳头肿胀勃起，稍加刺激便会喷射出甘甜乳汁",
    "肛门经过长期开发，已松弛柔软，可轻易容纳粗大异物"
  ],
  "illnessDescription": "所患'七日断魂骚'，乃因吸纳过多男子阳精，体内灵气凝结成春药毒素。症状为：阴道持续分泌大量粘稠淫液，散发浓郁麝香味，吸引方圆百丈内的雄性；每日午时必定发作，全身燥热难耐，阴道痉挛收缩，淫水横流，若不立即交合则会神志不清，当众疯狂自慰；性欲亢进至极，一夜可承受数十次交合而不知疲倦；长期发作会导致灵气枯竭，最终淫欲焚身而亡。"
}
\`\`\`

4.  **严格要求**:
    *   你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象
    *   不要在代码块之外添加任何解释或注释
    *   所有描述必须极度色情、露骨、具体，不要使用委婉语`;

    const prompt = `请为我的性病医馆生成一位${gender ? `性别为【${gender}】的` : ''}新的病人病例。记住：描写必须极度色情、露骨、详细！`;

    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    const medicalRecord = parseJsonFromText(generatedText);
    medicalRecord.patientId = `patient-${Date.now()}`;
    return medicalRecord;
}

/**
 * 生成一个新的悬赏目标
 * @returns 一个符合BountyTarget接口的对象 (除了id和status)
 */
export async function generateBountyTarget(
    gender?: 'Male' | 'Female',
    gameState?: GameState
): Promise<Omit<BountyTarget, 'id' | 'status'>> {
    const systemInstruction = `你是一位顶级的色情世界观构建师和极致淫荡角色创作大师，精通创造充满诱惑、危险和淫邪的悬赏目标。你的描写必须大胆、露骨、毫无保留。

**重要：你必须生成一个完整的BountyTarget对象，其中的character字段必须严格遵守CharacterCard接口，特别是skills必须是4元素数组！所有必填字段都不能省略！**

1.  **BountyTarget必填字段**:
    *   **name**: 极具性暗示的称号（必须淫荡、霸气）
        - 示例："千人斩淫魔"、"采阴圣女"、"万蛇吞龙君"
    *   **specialTrait**: 极度详细的色情体质或性癖描述（100-200字）
        - 必须具体描述其独特的性能力、性器官特征或淫荡癖好
        - 示例："天生媚骨，体内蕴含纯阴之气，每次交合都能吸取对方精元修炼。其阴道内有九层肉壁，每层收缩力不同，可将男子榨干至死。常年采补，已令三百余名修士精尽人亡。"
    *   **locationHint**: 模糊但有迹可循的地点线索
    *   **trackerId**: null
    *   **startTime**: 0
    *   **endTime**: 0
    *   **trackingLog**: null
    *   **finalOutcome**: null

2.  **CharacterCard必填字段（character字段）**:
    *   **id**: "bounty-char-{timestamp}"
    *   **name**: 角色真实姓名
    *   **gender**: "Male" 或 "Female"${gender ? `，必须是【${gender}】` : ''}
    *   **realm**: 修炼境界
    *   **rarity**: 稀有度（建议"珍品"或以上）
    *   **title**: 称号（与BountyTarget的name一致）
    *   **race**: 种族
    *   **origin**: 来历背景（必须包含其犯下的淫邪罪行）
    *   **appearance**: 极度详细、露骨的外观描述（200-300字）
        - 必须聚焦于性感部位：胸部、臀部、性器官、体态
        - 必须使用露骨词汇，详细描述身材曲线和性特征
    *   **charm**: 魅力值（60-100）
    *   **skillfulness**: 技巧值（60-100）
    *   **perception**: 悟性值（60-100）
    *   **baseAttributes**: 包含完整的属性值
    *   **skills**: **必须是4元素数组** [Skill对象, Skill对象, null, null]
        - 前2个技能必须是完整对象，包含所有必填字段
        - 技能必须与角色的淫邪特质相关
    *   **equipment**: { weapon: null, armor: null, accessory1: null, accessory2: null }
    *   **pet**: null

3.  **Skill对象必填字段（每个技能）**:
    *   **id**: "skill-bounty-{timestamp}-{index}"
    *   **name**: 技能名称（必须淫荡）
    *   **rarity**: 稀有度
    *   **description**: 技能风味描述
    *   **mechanicsDescription**: 技能机制（如"造成150%攻击力伤害"）
    *   **eroticDescription**: 极度色情的技能释放描述（必须详细描写性行为过程）
    *   **cost**: 真元消耗值
    *   **genderLock**: 性别锁定

4.  **色情化核心要求**:
    *   **specialTrait**: 必须详细描写独特的性能力和淫荡体质
    *   **appearance**: 必须极度色情，聚焦性器官和性感部位
    *   **origin**: 必须包含其犯下的淫邪罪行（如强奸、采补、淫乱等）
    *   **技能的eroticDescription**: 必须详细描写如何使用身体或性器官施展技能

5.  **JSON格式示例**:
\`\`\`json
{
  "name": "千人斩淫魔",
  "specialTrait": "天生魅惑体质，能分泌催情毒素。其巨大的阳具可同时插入多个女子，一夜可采补数十名女修而不知疲倦。体内蕴含至阳之气，每次射精都能让女子沉沦于极乐之中。",
  "locationHint": "据传在【欢喜谷】深处的淫窟中",
  "trackerId": null,
  "startTime": 0,
  "endTime": 0,
  "trackingLog": null,
  "finalOutcome": null,
  "character": {
    "id": "bounty-char-temp",
    "name": "莫邪",
    "gender": "Male",
    "realm": "金丹期",
    "rarity": "珍品",
    "title": "千人斩淫魔",
    "race": "人族",
    "origin": "原为正派弟子，因修炼邪功堕入魔道。三年间强暴女修千余人，吸取纯阴之气修炼，令无数女修家破人亡。",
    "appearance": "身高八尺，体格雄壮，肌肉虬结。最引人注目的是其胯下那根粗大狰狞的紫黑色巨龙，长达尺余，粗如婴儿手臂，龟头肿胀如拳头，青筋暴突，散发着浓烈的雄性气息。",
    "charm": 85,
    "skillfulness": 90,
    "perception": 75,
    "baseAttributes": {
      "hp": 800,
      "maxHp": 800,
      "mp": 300,
      "maxMp": 300,
      "attack": 120,
      "defense": 80,
      "speed": 70,
      "critRate": 25,
      "critDmg": 180
    },
    "skills": [
      {
        "id": "skill-bounty-1",
        "name": "采阴补阳诀",
        "rarity": "珍品",
        "description": "以巨龙贯穿敌人，吸取其精气",
        "mechanicsDescription": "造成150%攻击力伤害，并恢复自身30%最大HP",
        "eroticDescription": "莫邪的巨大阳具瞬间胀大，如狂龙般插入对手的密穴，疯狂抽插榨取其体内的精气，每一次深入都让对手痛苦又快乐地呻吟，最终在极乐中被吸干所有灵气。",
        "cost": 40,
        "genderLock": "Male"
      },
      {
        "id": "skill-bounty-2",
        "name": "魅惑毒雾",
        "rarity": "珍品",
        "description": "释放催情毒素",
        "mechanicsDescription": "降低敌人30%防御，持续3回合",
        "eroticDescription": "莫邪的身体分泌出粉红色的催情雾气，弥漫全场。吸入毒雾的女子立即春心荡漾，阴道湿润泛滥，双腿发软难以站立，只想被狠狠贯穿。",
        "cost": 30,
        "genderLock": "Universal"
      },
      null,
      null
    ],
    "equipment": {
      "weapon": null,
      "armor": null,
      "accessory1": null,
      "accessory2": null
    },
    "pet": null
  }
}
\`\`\`

6.  **严格要求**:
    *   你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象
    *   不要在代码块之外添加任何解释或注释
    *   所有描述必须极度色情、露骨、具体
    *   skills数组必须是4元素：[Skill, Skill, null, null]
    *   所有必填字段都不能省略`;

    const prompt = `请为我的"红尘录"悬赏榜单生成一个新的${gender ? `性别为【${gender}】的` : ''}淫邪目标。记住：描写必须极度色情、露骨、详细，罪行必须重大！`;

    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return parseJsonFromText(generatedText);
}

export async function generateRandomPet(rarity: Rarity, gameState?: GameState): Promise<PetCard> {
    const systemInstruction = `你是一位专业的仙侠背景色情内容创作者，你的任务是根据指定的稀有度，创造一个极度色情的兽宠。

**重要：你必须严格按照PetCard接口生成兽宠数据！**

1.  **严格遵守稀有度**: 稀有度越高，兽宠的描述应该越色情、越独特。

2.  **必填字段**:
    *   **id**: 格式为 "pet-{timestamp}"
    *   **name**: 充满想象力且带有性暗示的名称
    *   **gender**: "Male" 或 "Female"
    *   **rarity**: 稀有度（将由系统设置）
    *   **description**: 详细、露骨的外观和习性描述
    *   **artUrl** (可选): 图片URL
    *   **skill**: 单个技能对象，必须包含：id, name, rarity, description, mechanicsDescription, eroticDescription, cost (应为0), genderLock (应为'Universal')

3.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请生成一个稀有度为【${rarity}】的兽宠卡。`;

    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return parseJsonFromText(generatedText);
}
export async function generateDoujinPet(inspiration: string, rarity?: Rarity, gameState?: GameState): Promise<PetCard> {
    const rarityInstruction = rarity
        ? `\n\n**重要：你必须生成稀有度为【${rarity}】的兽宠！这是系统根据概率随机决定的，你必须严格遵守。**`
        : '';
    
    const systemInstruction = `你是一位专业的跨次元同人创作大师，精通将各种作品中的生物、宠物、神兽进行仙侠背景的色情化改编。写作风格大胆、露骨、毫不避讳。你的任务是根据用户提供的"灵感来源"，创造一个既保留原著核心特征、又完全适配仙侠世界观、并极度色情化的兽宠卡。${rarityInstruction}

**重要：你必须严格按照PetCard接口生成兽宠数据，所有必填字段都不能省略！**

1.  **解析灵感与原著还原**:
    *   深入理解灵感来源的核心概念（生物名、作品、标志性特征、能力、习性等）
    *   识别并保留生物最具代表性的元素（外观特征、能力特点、性格特质）
    *   确保改编后的兽宠能让熟悉原作的人一眼认出

2.  **仙侠化改编原则**:
    *   将原作的能力系统转化为仙侠修炼体系（魔法→法术，元素力量→五行之力）
    *   背景融入仙侠世界观设定（上古神兽、灵兽血脉、仙界遗种等）
    *   保持生物原有的性格特质和标志性习性
    *   稀有度应与原作中该生物的稀有程度相匹配
    
    改编示例参考：
    **原作**: 宝可梦 - 皮卡丘
    **改编要点**:
    - name: "雷霆灵鼠" 或 "电光妖鼠·皮卡"
    - description: 保留黄色皮毛、红色脸颊、闪电尾巴等特征，但融入色情元素
    - skill: "十万伏特" → "雷霆淫纹诀"（保留雷电特性，色情化改编）
    
    **原作**: 火影忍者 - 九尾妖狐
    **改编要点**:
    - name: "九尾淫狐" 或 "上古九尾魅狐"
    - description: 保留九条尾巴、巨大体型、查克拉能量等特征
    - skill: 基于尾兽玉或查克拉能力改编

3.  **色情化改编要求**:
    *   **生物习性**: 在保留原作特性的基础上，添加发情期、交配习性、性吸引力等描述
    *   **外观描写**: 聚焦于能够色情化的身体特征（柔软的皮毛、性感的体态、性器官暗示）
    *   **能力重构**: 将原作能力进行色情化解读（攻击技能→性侵技能，治疗→淫乱双修）
    *   **场景暗示**: 描述中暗示该兽宠的色情用途或性相关的互动可能性

4.  **必填字段（缺一不可）**:
    *   **id**: 字符串，格式为 "doujin-pet-{timestamp}"
    *   **name**: 兽宠名称（可保留原名或仙侠化改编）
        - 示例：皮卡丘 → "雷霆灵鼠·皮卡" 或 "电光妖鼠"
        - 示例：九尾 → "九尾淫狐" 或 "上古魅狐·九尾"
    *   **gender**: 必须是 "Male" 或 "Female" 之一
    *   **rarity**: 稀有度（根据原作生物的稀有度和重要性决定）
        - 普通宠物 → "凡品"或"精品"
        - 稀有生物 → "珍品"
        - 传说生物 → "绝品"或"仙品"
        - 神兽级别 → "仙品"或"神品"
    *   **description**: 详细、露骨的外观和习性描述（200-350字），必须：
        - 保留原作最标志性的外观特征
        - 融入仙侠世界观设定
        - 极度色情化地描写身体特征和性相关习性
        - 暗示或明示该兽宠的性用途
    *   **artUrl**: 可选，一般填写空字符串 ""
    *   **skill**: 单个完整的技能对象，必须包含：
        - **id**: "skill-doujin-pet-{timestamp}"
        - **name**: 技能名称（必须改编自原作的标志性能力）
        - **rarity**: 稀有度（与兽宠稀有度相匹配）
        - **description**: 技能风味描述（融合原作+仙侠+色情）
        - **mechanicsDescription**: 技能机制（如"造成100%攻击力伤害"）
        - **eroticDescription**: 极度色情的技能释放过程描述
        - **cost**: 真元消耗（兽宠技能一般为0，表示被动或不消耗主人真元）
        - **genderLock**: 一般为 "Universal"

5.  **技能改编要求**:
    *   **保留原作技能特征**: 技能名称和效果必须能让人联想到原作
    *   **仙侠化转换**: 将原作技能转化为仙侠法术/神通
    *   **色情化描述**: eroticDescription必须极度详细地描写技能释放时的色情场景
    
    技能改编示例：
    **原作技能**: 皮卡丘的"十万伏特"
    **改编后**:
    - name: "雷霆淫纹诀" 或 "万雷贯体"
    - description: "将体内蓄积的雷电之力通过全身释放，电流刺激敌人最敏感的部位"
    - mechanicsDescription: "造成120%攻击力雷属性伤害，有30%概率麻痹敌人1回合"
    - eroticDescription: "皮卡的红色脸颊闪烁着淫靡的粉色电光，雷电沿着它毛茸茸的身体流淌而出，精准地击中敌人的敏感部位。电流让敌人全身痉挛，性器官不受控制地收缩，在酥麻感和快感的双重刺激下无法动弹..."

6.  **色情化核心字段**:
    *   **description**: 必须极度详细、露骨，保留原作外观特征的同时聚焦于性相关的身体特征和习性
    *   **name**: 名称必须能体现原作特征，同时可添加性暗示
    *   **skill的eroticDescription**: 必须详细描写如何使用该能力进行色情化的攻击或互动，且能体现原作技能特点

7.  **改编示例参考**:
    
    **示例1 - 皮卡丘改编**:
    {
      "id": "doujin-pet-temp",
      "name": "雷霆灵鼠·皮卡",
      "gender": "Female",
      "rarity": "珍品",
      "description": "身长不足一尺的娇小灵鼠，全身覆盖着柔软蓬松的金黄色皮毛，摸起来如同最上等的绸缎。两颊各有一枚圆形的红色雷纹，每当情动时便会闪烁粉色电光。尖尖的耳朵顶端为黑色，尾巴呈闪电状，散发着淡淡的雷电之力。最引人注目的是它圆润柔软的小屁股和粉嫩的生殖器，每当发情期到来，便会主动蹭擦主人的身体，渴望交配。性格活泼好动，但极度淫荡，喜欢用电流刺激自己和主人的敏感部位。",
      "artUrl": "",
      "skill": {
        "id": "skill-doujin-pet-1",
        "name": "雷霆淫纹诀",
        "rarity": "珍品",
        "description": "释放体内蕴含的雷电之力，电流刺激敌人全身敏感部位",
        "mechanicsDescription": "造成120%攻击力雷属性伤害，30%概率麻痹1回合",
        "eroticDescription": "皮卡娇小的身体突然颤抖起来，脸颊上的雷纹散发出妖艳的粉色电光。一道道细密的电流从它柔软的皮毛中涌出，如同无数条灵蛇般缠绕向敌人。电流精准地击中对方的乳头、性器官等最敏感的部位，强烈的酥麻感让敌人全身痉挛，淫水横流或阴茎勃起，在快感和痛苦的双重刺激下瘫软在地...",
        "cost": 0,
        "genderLock": "Universal"
      }
    }
    
    **示例2 - 九尾妖狐改编**:
    {
      "id": "doujin-pet-temp",
      "name": "上古魅狐·九尾",
      "gender": "Female",
      "rarity": "仙品",
      "description": "身长三丈有余的上古神兽，拥有九条蓬松柔软的巨大狐尾，每一条都散发着浓郁的媚气。全身覆盖着火红色的绒毛，如同烈焰般艳丽。深邃的红色瞳孔中透露着千年修为的智慧和无尽的淫欲。体态妖娆修长，臀部饱满浑圆，在九条尾巴的映衬下更显妩媚。最惊人的是它胯下那朵湿润的粉色花穴，常年流淌着带有魅惑之力的淫液，散发出令所有生灵欲火焚身的麝香味。性格高傲狡猾，但对主人极度忠诚且淫荡，喜欢用九条尾巴缠绕主人进行双修，吸取阳气增强修为。",
      "artUrl": "",
      "skill": {
        "id": "skill-doujin-pet-2",
        "name": "九尾魅惑·欲海狂澜",
        "rarity": "仙品",
        "description": "九条尾巴同时释放魅惑之力，将敌人拖入无尽的欲望深渊",
        "mechanicsDescription": "造成200%攻击力精神伤害，并降低敌人50%防御，持续3回合",
        "eroticDescription": "九尾的九条巨大尾巴突然散开，如同九朵盛开的花朵。每条尾巴的尖端都凝聚出一团粉红色的魅惑之气，随即化作九道光柱射向敌人。光柱穿透身体，直击灵魂深处，瞬间勾起敌人最深层的性欲望。敌人的脑海中充斥着淫荡的幻象，看到自己被九尾的尾巴缠绕，每个毛孔都在被爱抚，性器官被反复玩弄至高潮。强烈的快感让敌人完全失去战斗意志，只想跪下臣服于九尾，沦为它的禁脔...",
        "cost": 0,
        "genderLock": "Universal"
      }
    }

8.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请根据以下灵感来源，生成一张同人兽宠卡${rarity ? `，稀有度必须是【${rarity}】` : ''}。记住：必须保留原作核心特征，完整进行仙侠化改编，并极度色情化！

灵感来源：
"${inspiration}"`;

    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);
    const pet = parseJsonFromText(generatedText);
    // Ensure the generated pet has a unique ID
    pet.id = `doujin-pet-${Date.now()}`;
    return pet;
}
export async function generateDoujinEquipment(inspiration: string, rarity?: Rarity, gameState?: GameState): Promise<Equipment> {
    const rarityInstruction = rarity
        ? `\n\n**重要：你必须生成稀有度为【${rarity}】的装备！这是系统根据概率随机决定的，你必须严格遵守。**`
        : '';
    
    const systemInstruction = `你是一位专业的跨次元同人创作大师，精通将各种作品中的武器、装备、道具进行仙侠背景的色情化改编。写作风格大胆、露骨、毫不避讳。你的任务是根据用户提供的"灵感来源"，创造一个既保留原著核心特征、又完全适配仙侠世界观、并极度色情化的装备。${rarityInstruction}

**重要：你必须严格按照Equipment接口生成装备数据，所有必填字段都不能省略！**

1.  **解析灵感与原著还原**:
    *   深入理解灵感来源的核心概念（装备名、作品、标志性特征、能力、外观等）
    *   识别并保留装备最具代表性的元素（外观设计、特殊能力、使用方式）
    *   确保改编后的装备能让熟悉原作的人一眼认出

2.  **仙侠化改编原则**:
    *   将原作的能力系统转化为仙侠修炼体系（科技武器→法宝，魔法道具→灵器）
    *   背景融入仙侠世界观设定（神兵利器、上古遗物、仙家法宝等）
    *   保持装备原有的核心功能和标志性特点
    *   稀有度应与原作中该装备的稀有程度相匹配
    
    改编示例参考：
    **原作**: 火影忍者 - 草薙剑
    **改编要点**:
    - name: "草薙神剑" 或 "大蛇淫剑·草薙"
    - type: "Weapon"
    - description: 保留可伸长、锋利无比等特征，但融入色情元素
    
    **原作**: 海贼王 - 橡胶果实能力
    **改编要点**:
    - name: "橡胶神体衣" 或 "弹力淫装"
    - type: "Armor"
    - description: 赋予穿戴者身体可伸缩特性

3.  **色情化改编要求**:
    *   **外观描写**: 聚焦于能够色情化的设计元素（暴露、贴身、透明、镂空等）
    *   **穿戴效果**: 描述穿戴时对身体的影响和产生的性感觉
    *   **能力重构**: 将原作能力进行色情化解读（攻击→性侵、防御→暴露）
    *   **使用场景**: 暗示或明示该装备的色情用途

4.  **必填字段（缺一不可）**:
    *   **id**: 字符串，格式为 "doujin-equip-{timestamp}"
    *   **name**: 装备名称（可保留原名或仙侠化改编）
        - 示例：草薙剑 → "草薙神剑" 或 "大蛇淫剑·草薙"
        - 示例：雷神之锤 → "雷神淫锤" 或 "雷霆战神之槌"
    *   **type**: 必须是 "Weapon"（武器）、"Armor"（护甲）或 "Accessory"（饰品）之一
    *   **rarity**: 稀有度（根据原作装备的稀有度和重要性决定）
        - 普通装备 → "凡品"或"精品"
        - 稀有装备 → "珍品"
        - 传说装备 → "绝品"或"仙品"
        - 神器级别 → "仙品"或"神品"
    *   **description**: 极度详细、露骨的外观和效果描述（150-300字），必须：
        - 保留原作最标志性的外观特征
        - 融入仙侠世界观设定
        - 极度色情化地描写外观、穿戴效果和使用场景
        - 聚焦于暴露、贴身、性刺激等元素
    *   **genderLock**: "Male"（男性专用）、"Female"（女性专用）或 "Universal"（通用）
    *   **stats**: 属性加成对象，至少包含一个属性

5.  **stats属性数值规范（极其重要）**:
    *   **attack**: 攻击力加成，整数，根据稀有度范围：凡品5-10，良品8-15，优品12-25，珍品20-40，绝品35-60，仙品50-80，圣品70-100，神品90-150
    *   **hp**: 气血加成，整数，根据稀有度范围：凡品15-30，良品25-50，优品40-80，珍品60-120，绝品100-180，仙品150-250，圣品200-350，神品300-500
    *   **defense**: 防御力加成，整数，根据稀有度范围：凡品3-8，良品6-12，优品10-20，珍品15-35，绝品30-50，仙品40-70，圣品60-90，神品80-120
    *   **speed**: 速度加成，整数，根据稀有度范围：凡品2-5，良品4-8，优品6-12，珍品10-18，绝品15-25，仙品20-35，圣品30-45，神品40-60
    *   **critRate**: 暴击率加成，**必须是0-1之间的小数**，如0.05表示5%，根据稀有度范围：凡品0.02-0.05，良品0.04-0.08，优品0.06-0.12，珍品0.08-0.15，绝品0.12-0.20，仙品0.15-0.25，圣品0.20-0.30，神品0.25-0.40
    *   **critDmg**: 暴击伤害加成，**必须是0-1之间的小数**，如0.15表示15%，根据稀有度范围：凡品0.05-0.10，良品0.08-0.15，优品0.10-0.20，珍品0.15-0.30，绝品0.20-0.40，仙品0.30-0.50，圣品0.40-0.60，神品0.50-0.80

6.  **装备改编要求**:
    *   **保留原作装备特征**: 外观和能力必须能让人联想到原作
    *   **仙侠化转换**: 将原作装备转化为仙侠世界的法宝/灵器
    *   **色情化描述**: description必须极度详细地描写装备的色情外观和效果
    
    装备改编示例：
    **原作装备**: 火影忍者的"草薙剑"
    **改编后**:
    - name: "草薙神剑"
    - type: "Weapon"
    - description: "传说中大蛇仙君炼制的神剑，剑身雪白如玉，可随心意伸缩至百丈之长。剑柄处雕刻着淫荡的双蛇交缠图案，每当挥舞时便会释放出催情的蛇毒气息。剑身表面布满细密的鳞片纹路，触感光滑湿润，如同蛇的腹部。持剑者会感到剑柄不断震动，传来阵阵酥麻快感，仿佛有无数条小蛇在爬过手掌。此剑不仅锋利无比，更能在刺入敌人身体时释放淫毒，让对方欲火焚身，沦为剑主的禁脔..."
    - genderLock: "Universal"
    - stats: { attack: 45, critRate: 12 }

7.  **色情化核心字段**:
    *   **description**: 必须极度详细、露骨，保留原作外观特征的同时聚焦于色情化的设计和效果
    *   **name**: 名称必须能体现原作特征，同时可添加性暗示

8.  **改编示例参考**:
    
    **示例1 - 草薙剑改编**:
    {
      "id": "doujin-equip-temp",
      "name": "草薙神剑",
      "type": "Weapon",
      "rarity": "绝品",
      "description": "传说中大蛇仙君炼制的上古神剑，剑身修长雪白，长三尺三寸，可随使用者心意伸缩至百丈之长。剑身表面布满细密的蛇鳞纹路，在月光下泛着淫靡的银光。剑柄雕刻着两条缠绵交合的淫蛇，蛇头咬住蛇尾形成护手，每当握住剑柄，便能感受到剑身的微微震动和湿润触感，仿佛握着一条活生生的巨蟒。此剑不仅锋利无比，更蕴含着大蛇仙君的淫毒之力。剑锋所指之处，敌人会被淫毒侵蚀，全身瘫软欲火焚身。若将剑身刺入敌人体内，淫毒会直达灵魂深处，让对方在极乐与痛苦中彻底臣服。长期使用此剑的修士，也会被淫毒影响，性欲逐渐高涨，最终沦为只知交合的淫兽。",
      "genderLock": "Universal",
      "stats": {
        "attack": 45,
        "critRate": 0.12
      }
    }
    
    **示例2 - 橡胶果实能力改编为护甲**:
    {
      "id": "doujin-equip-temp",
      "name": "橡胶神体衣",
      "type": "Armor",
      "rarity": "珍品",
      "description": "由橡胶神树的汁液炼制而成的贴身软甲，呈半透明的肉色，质地柔软Q弹，触感如同人类的肌肤。穿上后会完全贴合身体曲线，如同第二层皮肤般紧致。最神奇的是，此衣可随穿戴者的意志任意拉伸，延展至原本的十倍长度而不会破损。穿戴者的身体也会获得橡胶般的弹性，可以任意拉长、收缩、扭曲。在战斗中，身体可伸长至数丈远攻击敌人，也可收缩成球状弹跳躲避。在床笫之间，更是神兵利器——性器官可随意拉长粗大，深入对方最深处；身体柔软如泥，可摆出任何淫荡姿势；即使遭受最猛烈的冲击也不会受伤，能承受无尽的欢愉。长期穿戴会让身体永久获得部分弹性，肌肤Q弹诱人。",
      "genderLock": "Universal",
      "stats": {
        "hp": 80,
        "defense": 25,
        "speed": 15,
        "critDmg": 0.10
      }
    }

9.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请根据以下灵感来源，生成一件同人装备${rarity ? `，稀有度必须是【${rarity}】` : ''}。记住：必须保留原作核心特征，完整进行仙侠化改编，并极度色情化！

灵感来源：
"${inspiration}"`;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);
    return parseJsonFromText(generatedText);
}

export async function generateDoujinSkill(inspiration: string, rarity?: Rarity, genderLock: 'Male' | 'Female' | 'Universal' = 'Universal', gameState?: GameState): Promise<Skill> {
    const rarityInstruction = rarity
        ? `\n\n**重要：你必须生成稀有度为【${rarity}】的技能！这是系统根据概率随机决定的，你必须严格遵守。**`
        : '';
    
    const systemInstruction = `你是一位专业的跨次元同人创作大师，精通将各种作品中的技能、招式、能力进行仙侠背景的色情化改编。写作风格大胆、露骨、毫不避讳。你的任务是根据用户提供的"灵感来源"，创造一个既保留原著核心特征、又完全适配仙侠世界观、并极度色情化的技能。${rarityInstruction}

**重要：你必须严格按照Skill接口生成技能数据，所有必填字段都不能省略！**

1.  **解析灵感与原著还原**:
    *   深入理解灵感来源的核心概念（技能名、作品、标志性效果、视觉表现等）
    *   识别并保留技能最具代表性的元素（招式动作、能量形态、特殊效果）
    *   确保改编后的技能能让熟悉原作的人一眼认出

2.  **仙侠化改编原则**:
    *   将原作的能力系统转化为仙侠修炼体系（魔法→法术，必杀技→神通）
    *   技能名称融入仙侠风格用词（诀、术、印、功、法、神通等）
    *   保持技能原有的核心效果和视觉特点
    *   稀有度应与原作中该技能的强度相匹配
    
    改编示例参考：
    **原作**: 火影忍者 - 螺旋丸
    **改编要点**:
    - name: "螺旋淫丸" 或 "欲望螺旋诀"
    - mechanicsDescription: 保留旋转能量球的概念
    - eroticDescription: 将旋转能量改为淫气，描述侵入身体的过程
    
    **原作**: 龙珠 - 龟派气功
    **改编要点**:
    - name: "龟仙淫功波" 或 "气海狂潮"
    - mechanicsDescription: 保留能量波攻击的概念
    - eroticDescription: 将能量波改为精气或淫力

3.  **色情化改编要求**:
    *   **动作描写**: 描述施展技能时的身体动作，融入性暗示
    *   **能量形态**: 将原作能量进行色情化解读（查克拉→淫气、气→精元）
    *   **效果重构**: 技能效果向性侵、催情、快感方向调整
    *   **受击反应**: 详细描述被技能击中后的淫荡反应

4.  **必填字段（缺一不可）**:
    *   **id**: 字符串，格式为 "doujin-skill-{timestamp}"
    *   **name**: 技能名称（必须改编自原作，融入仙侠风格）
        - 示例：螺旋丸 → "螺旋淫丸" 或 "欲望螺旋诀"
        - 示例：龟派气功 → "龟仙淫功波" 或 "气海狂潮"
        - 示例：月牙天冲 → "月华淫冲" 或 "斩月欲潮"
    *   **rarity**: 稀有度（根据原作技能的强度和重要性决定）
        - 普通技能 → "凡品"或"精品"
        - 稀有技能 → "珍品"
        - 传说技能 → "绝品"或"仙品"
        - 禁术级别 → "仙品"或"神品"
    *   **description**: 技能风味描述（50-100字），需融合原作+仙侠+色情元素
    *   **mechanicsDescription**: 技能机制描述，如"造成150%攻击力伤害，并有30%概率使敌人陷入【魅惑】状态持续2回合"
    *   **eroticDescription**: 极度色情的技能释放和效果描述（150-300字），必须：
        - 保留原作技能的视觉特点和施展方式
        - 详细描写施术者的身体动作和能量凝聚过程
        - 极度详细地描写技能击中敌人后的色情效果
        - 包含身体反应、性器官变化、快感描写等
    *   **cost**: 真元消耗值（数值，根据技能强度决定，一般10-50）
    *   **genderLock**: "Male"（男性专用）、"Female"（女性专用）或 "Universal"（通用）
        ${genderLock !== 'Universal' ? `\n        **注意：本次生成必须设置为【${genderLock}】！**` : ''}

5.  **技能改编要求**:
    *   **保留原作技能特征**: 名称和效果必须能让人联想到原作
    *   **仙侠化转换**: 将原作技能转化为仙侠法术/神通
    *   **色情化描述**: eroticDescription必须极度详细地描写技能的色情效果
    
    技能改编示例：
    **原作技能**: 火影忍者的"螺旋丸"
    **改编后**:
    - name: "螺旋淫丸"
    - rarity: "珍品"
    - description: "将体内的淫气凝聚成高速旋转的能量球，击中敌人后侵入体内引发极致快感"
    - mechanicsDescription: "造成150%攻击力伤害，并使敌人陷入【魅惑】状态，防御降低30%持续2回合"
    - eroticDescription: "施术者将掌心贴于小腹丹田处，开始疯狂吸取体内的淫气。只见一团粉红色的能量在掌心凝聚，并高速旋转起来，发出嗡嗡的淫靡声响。能量球越转越快，散发出浓郁的麝香味。随着施术者一掌推出，旋转的淫气球呼啸而去，精准地击中敌人的小腹。能量球瞬间侵入体内，沿着经脉疯狂旋转扩散。敌人立即感到一股难以抑制的热流在体内奔涌，所过之处酥麻难耐。淫气直冲性器官，女性的蜜穴开始痉挛收缩，淫水横流；男性的阴茎瞬间勃起，前端不断渗出透明液体。敌人双腿发软跪倒在地，只想被人狠狠贯穿..."
    - cost: 30
    - genderLock: "Universal"

6.  **色情化核心字段**:
    *   **eroticDescription**: 必须极度详细、露骨，保留原作技能特点的同时详细描写色情效果
    *   **name**: 名称必须能体现原作技能，同时融入仙侠和性暗示元素
    *   **mechanicsDescription**: 除了数值效果外，可包含魅惑、催情等状态

7.  **改编示例参考**:
    
    **示例1 - 螺旋丸改编**:
    {
      "id": "doujin-skill-temp",
      "name": "螺旋淫丸",
      "rarity": "珍品",
      "description": "凝聚体内淫气形成高速旋转的能量球，侵入敌人体内引发极致快感",
      "mechanicsDescription": "造成150%攻击力伤害，使敌人陷入魅惑状态，防御降低30%持续2回合",
      "eroticDescription": "施术者双手合十于小腹丹田处，开始疯狂吸取体内的淫气精元。粉红色的能量在掌间凝聚，并高速旋转起来，发出嗡嗡的淫靡声响，散发出浓郁的麝香味。随着双掌猛然推出，旋转的淫气球呼啸而去，精准地击中敌人小腹。能量球瞬间侵入体内，沿着经脉疯狂旋转扩散，所过之处酥麻难耐。淫气直冲性器官，女性蜜穴开始痉挛收缩淫水横流，男性阴茎瞬间勃起前端渗出透明液体。敌人双腿发软跪倒在地，眼神迷离，只想被人狠狠贯穿填满...",
      "cost": 30,
      "genderLock": "Universal"
    }
    
    **示例2 - 龟派气功改编**:
    {
      "id": "doujin-skill-temp",
      "name": "龟仙淫功波",
      "rarity": "绝品",
      "description": "龟仙人传承的禁忌淫术，将全身精元凝聚后释放出毁灭性的淫力冲击波",
      "mechanicsDescription": "造成200%攻击力伤害，并击退敌人，有50%概率使其陷入【精疲力竭】状态无法行动1回合",
      "eroticDescription": "施术者摆出龟仙流的经典起手式，双手在腰间合拢成莲花状，开始疯狂抽取全身上下的精元之气。只见一团白色与粉色交织的能量在掌间凝聚，越来越大，越来越亮，散发出刺鼻的淫靡气息。'龟——仙——淫——功——波！'随着一声长啸，施术者双掌猛然向前推出，粗大的能量光柱呼啸而出，如同汹涌的精液洪流般冲向敌人。光柱所过之处，空气都被淫气染成粉色。当光柱命中敌人时，强大的冲击力将其击飞数丈，同时无穷的淫力侵入体内。敌人感到全身每个细胞都在颤抖高潮，性器官疯狂喷射，在极致的快感中抽搐痉挛，最终精疲力竭地瘫软在地...",
      "cost": 45,
      "genderLock": "Male"
    }

8.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请根据以下灵感来源，生成一个同人技能${rarity ? `，稀有度必须是【${rarity}】` : ''}${genderLock !== 'Universal' ? `（性别锁定：${genderLock}）` : ''}。记住：必须保留原作核心特征，完整进行仙侠化改编，并极度色情化！

灵感来源：
"${inspiration}"`;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);
    const generatedSkill = parseJsonFromText(generatedText);
    // 确保AI返回的性别锁是我们请求的性别锁
    generatedSkill.genderLock = genderLock;
    return generatedSkill;
}


export async function generateCultivationMonitoringText(parentA: CharacterCard | PetCard, parentB: CharacterCard | PetCard, gameState?: GameState): Promise<string> {
    const systemInstruction = `你是一个拥有上帝视角的观察者，正在通过一枚隐形的“监视水晶”窥探一个生命培育仓的内部。你的描述必须极度色情、露骨，并充满想象力。
1.  **聚焦融合过程**: 描述两个不同的生命体（${parentA.name} 和 ${parentB.name}）的生命精华是如何相互吸引、碰撞、融合的。
2.  **能量与形态**: 大胆描绘能量的颜色、形态和流动方式。例如，“${parentA.name}的金色阳气如狂龙般冲击着${parentB.name}的粉色元阴，二者在能量风暴的中心形成了一个旋转的光茧。”
3.  **感官细节**: 描述光茧内部的变化，可以涉及到心跳声、能量波动、以及新生命形态的初步轮廓。
4.  **直接输出**: 你的最终输出只需要一段纯文本描述，不要包含任何JSON格式或额外解释。`;

    const prompt = `
    正在监视的培育仓：
    - 亲代A: ${parentA.name} (种族/境界: ${'race' in parentA ? parentA.race : '兽族'}, 稀有度: ${parentA.rarity})
    - 亲代B: ${parentB.name} (种族/境界: ${'race' in parentB ? parentB.race : '兽族'}, 稀有度: ${parentB.rarity})

    请生成一段详细、色情、充满想象力的实时监视报告。
    `;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return generatedText;
}

export async function generateCultivationResult(parentA: CharacterCard | PetCard, parentB: CharacterCard | PetCard, gameState?: GameState): Promise<CharacterCard | PetCard> {
    const systemInstruction = `你是一位顶级的遗传学和生命创造大师，专精于仙侠世界的生物工程。你的任务是根据两个亲代的信息，创造一个全新的、合乎逻辑且充满想象力的后代。
1.  **决定后代类型**:
    *   如果亲代是【人物 x 兽宠】，后代有90%的概率是【人物】（半妖/神裔），10%的概率是【兽宠】（灵兽）。你必须在返回的JSON中明确指定后代的类型（包含 'gender' 和 'skills' 字段的是人物卡，仅包含 'skill' 字段的是兽宠卡）。
2.  **融合与变异**:
    *   **外观 (appearance)**: 必须融合双方的特征。例如，如果一方是龙族，后代可能拥有龙角或龙鳞。如果一方是狐妖，后代可能有狐耳或狐尾。描述必须色情、大胆、充满细节。
    *   **稀有度 (rarity)**: 后代的稀有度有70%的概率在父母稀有度的平均等级，25%的概率提升一级，5%的概率提升两级（例如，珍品+珍品 -> 大概率珍品，小概率绝品，极小概率仙品）。
    *   **技能 (skills/skill)**: 后代必须从父母双方的技能池中【随机继承1-2个技能】。同时，有10%的概率发生【技能变异】，创造一个全新的、融合了父母技能特点的、更强大的新技能。
3.  **数据完整性**: 你必须完整地填充新卡牌的所有字段。确保为新卡牌生成一个独特的、充满想象力的名称和称号。
4.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象，其结构必须与 CharacterCard 或 PetCard 类型完全匹配。`;

    const prompt = `
    请根据以下两个亲代的信息，创造一个全新的后代：
    - 亲代A: ${JSON.stringify(parentA)}
    - 亲代B: ${JSON.stringify(parentB)}

    请开始你的创造，并返回新生命的完整数据。
    `;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    const result = parseJsonFromText(generatedText);
    // Ensure the new card has a unique ID
    result.id = `cultivated-${Date.now()}`;
    return result;
}

export const generateBountyLog = async (tracker: CharacterCard, target: CharacterCard, gameState?: GameState): Promise<string> => {
    const systemInstruction = `你是一位顶级的仙侠世界色情小说家，擅长创作详细、刺激、充满想象力的追捕故事。你的任务是基于追捕者和目标的信息，创作一个完整、详细、色情、引人入胜的追捕日志。

**核心要求**:

1.  **完整的故事结构**（必须包含以下所有阶段，每个阶段都要详细展开）:
    
    *   **寻找追踪阶段（150-200字）**:
        - 详细描述追捕者如何接受任务，收集情报
        - 描写追踪的全过程：在哪些地方打听、遇到了什么人、发现了什么线索
        - 追捕者的心理活动和推理过程
        - 融入追捕者的技能特点、追踪手段
        - 可以包含一些小插曲：误导、假线索、意外发现等
    
    *   **发现与追逐阶段（200-250字）**:
        - 详细描写发现目标的瞬间：在什么地方、什么情况下发现的
        - 激烈追逐的全过程：穿越什么地形、施展什么身法、如何躲避障碍
        - 目标的逃跑策略：使用什么技能、设置什么陷阱、如何掩盖踪迹
        - 追捕者的应对方式：如何破解陷阱、如何缩短距离
        - 环境描写要丰富：城镇街巷、山林密道、洞府秘境、河流湖泊等
        - 途中可能遇到的意外：其他修士、妖兽、地形险阻等
    
    *   **战斗/对峙阶段（250-300字）**:
        - 追上目标后的正面对峙：双方如何摆开架势、如何试探
        - 详细的战斗过程：
          · 具体描写使用了什么技能，如何施展
          · 身体动作的细节：闪避、格挡、反击、近身搏斗
          · 衣物在战斗中的变化：破损、凌乱、暴露
          · 双方体力和真元的消耗
        - **色情化战斗描写**：
          · 身体碰撞的细节：肌肤相触、力量压制、姿势变化
          · 目标身体的暴露和追捕者的反应
          · 战斗中产生的暧昧场景和情欲张力
          · 汗水、喘息、体温、触感等感官细节
    
    *   **制服过程（150-200字）**:
        - 如何抓住机会最终制服目标
        - 制服的具体方式要详细：
          · 使用什么技能或道具（绳索、符咒、技能控制等）
          · 如何压制目标的反抗
          · 捆绑或控制的具体姿势和手法
        - **必须色情化描写**：
          · 制服时的身体接触和姿势
          · 目标的身体状态：衣衫凌乱、气喘吁吁、汗水淋漓
          · 目标的表情和反应：挣扎、呻吟、不甘、羞耻
          · 追捕者的心理和生理反应
    
    *   **趣事/意外事件（100-150字）**:
        - **必须包含**追捕过程中发生的至少1-2件趣事或意外
        - 可以是色色的事情：
          · 误闯某个修士的双修洞府，撞见不雅场景
          · 追到温泉或浴池，目标正在沐浴
          · 衣物在战斗中完全破损的尴尬
          · 使用某个技能导致的意外身体接触
          · 被春药陷阱波及的场景
        - 可以是遇险：
          · 遭遇妖兽或其他修士袭击
          · 误入危险禁地或机关陷阱
          · 恶劣天气或地形导致的险境
        - 可以是趣事：
          · 目标的狡猾计谋反而害了自己
          · 追捕者的糗事或乌龙
          · 巧遇旧识或引发误会

2.  **色情化核心要求**（贯穿全文）:
    *   **外观描写**: 详细描写追捕者和目标的身材、容貌、身体特征
    *   **衣物状态**: 时刻关注衣物的变化 - 破损、凌乱、暴露程度
    *   **身体接触**: 详细描写每一次肢体碰撞、抓扯、压制的细节
    *   **感官刺激**: 汗水的味道、喘息声、肌肤触感、体温传递
    *   **情欲氛围**: 使用暗示性、挑逗性的词语，营造暧昧张力
    *   **心理描写**: 追捕者和目标的心理活动，包括情欲层面的波动

3.  **角色特点深度融合**:
    *   追捕者的称号、技能、性格必须在行动中自然体现
    *   目标的特质、罪行、能力必须在逃跑和战斗中展现
    *   根据性别组合调整描写重点（男追女、女追男、同性等）

4.  **字数要求**: **总计800-1200字**，确保故事丰富、完整、有画面感

5.  **文笔要求**:
    *   语言生动、细腻、富有感染力
    *   善用比喻、拟人等修辞手法
    *   节奏张弛有度，有紧张有舒缓
    *   避免重复用词，多样化表达

6.  **严格禁止**:
    *   不要只写结果，必须详细描写过程
    *   不要含糊其辞或使用省略性描述
    *   不要忽略任何一个故事阶段
    *   不要少于800字或超过1200字

7.  **直接输出**: 你的最终输出只需要一段完整的纯文本故事（可以分自然段），不要包含任何JSON格式、大标题、章节标记、"# "等markdown标记或额外解释。`;

    const prompt = `
        # 追捕者信息:
        - 姓名: ${tracker.name}
        - 性别: ${tracker.gender}
        - 称号: ${tracker.title || '无'}
        - 境界: ${tracker.realm || '未知'}
        - 外观: ${tracker.appearance || '外表平平'}
        - 核心技能: ${tracker.skills.map(s => s?.name).filter(Boolean).join(', ') || '无'}

        # 目标信息:
        - 姓名: ${target.name}
        - 性别: ${target.gender}
        - 称号: ${target.title || '无'}
        - 境界: ${target.realm || '未知'}
        - 外观: ${target.appearance || '外表平平'}
        - 特殊专长: ${target.origin || '无'}
        - 罪行: ${target.title || '淫邪之徒'}

        请创作一个完整、详细、色情的追捕故事，包含以下所有阶段：
        
        **必须包含的5个阶段及字数要求**:
        1. **寻找追踪阶段（150-200字）**: 接受任务、收集情报、追踪线索的全过程
        2. **发现与追逐阶段（200-250字）**: 发现目标、激烈追逐、环境描写、意外情况
        3. **战斗/对峙阶段（250-300字）**: 正面对峙、详细战斗过程、色情化战斗描写
        4. **制服过程（150-200字）**: 如何制服、捆绑控制、色情化身体接触描写
        5. **趣事/意外事件（100-150字）**: 必须包含至少1-2件色色的事情、遇险或趣事
        
        **总字数要求**: 800-1200字
        
        记住：每个阶段都必须详细展开，不要省略任何过程！
    `;

    // 使用增强生成（如果提供了gameState）
    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return generatedText.trim();
};

export async function generateTelepathyReply(
    playerProfile: PlayerProfile,
    contact: CharacterRelationship,
    messages: { sender: string; text: string }[],
    gameState?: GameState
): Promise<string> {
    const systemInstruction = `你正在扮演角色 ${contact.name}。请以 ${contact.name} 的身份和口吻，简洁地回复玩家。你的回复应该符合仙侠世界的背景和你的角色设定。`;

    const recentMessages = messages.slice(-5);
    const history = recentMessages
        .map(msg => `${msg.sender === 'user' ? playerProfile.name : contact.name}: ${msg.text}`)
        .join('\n');

    const latestUserMessage = [...messages].reverse().find(msg => msg.sender === 'user')?.text || '';

    const prompt = `
对话历史:
${history}

玩家 (${playerProfile.name}) 的最新消息:
"${latestUserMessage}"

现在，请以 ${contact.name} 的身份回复。
`;

    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    return generatedText.trim();
}

/**
 * 生成记忆总结
 * @param memories 要总结的记忆条目数组
 * @param summaryType 总结类型 ('small' 或 'large')
 * @param category 记忆分类
 * @param promptTemplate 使用的提示词模板
 * @returns 总结对象，包含标题和内容
 */
export async function generateMemorySummary(
    memories: MemoryEntry[],
    summaryType: SummaryType,
    category: string,
    promptTemplate: string
): Promise<MemorySummary> {
    const systemInstruction = promptTemplate.replace('{category}', category);

    const memoriesText = memories
        .map((m, i) => `[${i + 1}] ${m.timestamp} - ${m.title}\n${m.content}`)
        .join('\n\n');

    const prompt = `
    请根据以下记忆片段生成总结：

    ${memoriesText}
    `;

    // 使用简单生成（记忆总结不需要上下文增强）
    const generatedText = await simpleGenerate(systemInstruction, prompt);

    // 简单的从生成文本中提取标题
    const lines = generatedText.trim().split('\n');
    const title = lines[0].length < 30 ? lines[0] : `关于${category}的总结`;
    const content = lines.length > 1 ? lines.slice(1).join('\n').trim() : generatedText.trim();
    
    const sourceIds = memories.map(m => m.id);
    const startIndex = 0; // 这里的索引需要调用者来确定
    const endIndex = memories.length - 1; // 这里的索引需要调用者来确定

    const summary: MemorySummary = {
        id: `summary-${Date.now()}`,
        type: summaryType,
        category: category as any,
        title,
        content,
        sourceMemoryIds: sourceIds,
        startIndex,
        endIndex,
        timestamp: new Date().toLocaleString(),
        realTimestamp: Date.now(),
    };

    return summary;
}

/**
 * 将记忆总结保存到世界书
 * @param summary 要保存的总结对象
 * @param category 记忆分类
 * @param summaryType 总结类型 ('small' 或 'large')
 * @returns 是否成功保存
 */
export async function saveSummaryToWorldbook(
    summary: { title?: string; content: string },
    category: string,
    summaryType: 'small' | 'large'
): Promise<boolean> {
    try {
        const worldbookName = '仙侠卡牌RPG记忆库';
        
        // 检查世界书是否存在，不存在则创建
        const existingWorldbooks = window.TavernHelper.getWorldbookNames();
        if (!existingWorldbooks.includes(worldbookName)) {
            await window.TavernHelper.createWorldbook(worldbookName, []);
        }

        // 创建世界书条目
        const entryName = summary.title || `${category}-${summaryType === 'small' ? '小' : '大'}总结-${new Date().toLocaleString()}`;
        const timestamp = new Date().toLocaleString();
        
        const newEntry = {
            name: entryName,
            enabled: true,
            strategy: {
                type: 'selective' as const,
                keys: [category, summaryType === 'small' ? '小总结' : '大总结'],
                keys_secondary: { logic: 'and_any' as const, keys: [] },
                scan_depth: 10,
            },
            position: {
                type: 'after_character_definition' as const,
                role: 'system' as const,
                depth: 4,
                order: 100,
            },
            content: `# ${entryName}\n\n**分类**: ${category}\n**类型**: ${summaryType === 'small' ? '小总结' : '大总结'}\n**时间**: ${timestamp}\n\n---\n\n${summary.content}`,
            probability: 100,
            recursion: {
                prevent_incoming: false,
                prevent_outgoing: false,
                delay_until: null,
            },
            effect: {
                sticky: null,
                cooldown: null,
                delay: null,
            },
        };

        await window.TavernHelper.createWorldbookEntries(worldbookName, [newEntry]);
        
        return true;
    } catch (error) {
        console.error('保存总结到世界书失败:', error);
        return false;
    }
}

/**
 * 生成劳役结果
 * @param prisoner 劳役的囚犯
 * @param siteType 劳役位置类型（矿山或采药）
 * @param duration 劳役持续时间（小时）
 * @param gameState 当前游戏状态（可选，用于增强上下文）
 * @returns 劳役结果对象
 */
export async function generateLaborResult(
    prisoner: Prisoner,
    siteType: LaborSiteType,
    duration: number,
    gameState?: GameState
): Promise<LaborResult> {
    const systemInstruction = `你是一位仙侠世界的劳役监工，负责记录囚犯的劳役成果。你的任务是根据囚犯信息、劳役类型和持续时间，生成一份详细的劳役结果报告。

**重要：你必须严格按照以下JSON结构生成劳役结果，所有必填字段都不能省略！**

1.  **必填字段（缺一不可）**:
    *   **materials**: 数组，必须包含恰好2个材料对象，每个对象包含：
        - **material**: 完整的材料对象（LaborMaterial接口）
          - **id**: 格式为 "material-{timestamp}-{index}"
          - **name**: 材料名称（必须符合${siteType}类型：矿山产出矿石，采药产出草药）
          - **type**: 必须是 "${siteType === '矿山' ? 'ore' : 'herb'}"
          - **rarity**: 稀有度（根据囚犯境界和劳役时长决定）
          - **description**: 材料的详细描述（50-100字）
          - **value**: 单个材料价值（灵石），根据稀有度：凡品5-10，良品10-20，优品20-40，珍品40-80，绝品80-150，仙品150-300
        - **quantity**: 数量（必须在25-50之间随机）
    *   **story**: AI生成的劳役过程描述（150-250字）
    *   **experience**: 囚犯获得的经验值（根据劳役时长和境界计算，一般10-50）
    *   **healthCost**: 消耗的健康度（根据劳役强度，一般5-20）

2.  **材料生成规则**:
    *   ${siteType === '矿山' ? '**矿石类型**: 必须生成矿石，如"灵铁矿"、"赤铜精矿"、"紫金玉石"、"星陨晶石"等' : '**草药类型**: 必须生成草药，如"紫芝草"、"血莲花"、"九叶灵芝"、"七星回魂草"等'}
    *   **稀有度分配**:
        - 60%概率：凡品或良品
        - 30%概率：优品或珍品
        - 10%概率：绝品或以上
    *   **数量随机**: 每种材料25-50个随机（可以不同）
    *   **名称唯一**: 两种材料的名称必须不同

3.  **劳役故事创作要求**:
    *   **基于囚犯特征**: 必须提及囚犯的名字、性别、境界
    *   **符合劳役类型**: ${siteType === '矿山' ? '描述挖矿过程，如挖掘、敲击、搬运矿石等' : '描述采药过程，如寻找、采摘、处理草药等'}
    *   **劳役时长**: 体现${duration}小时的劳作过程
    *   **色情元素**: 可适度加入囚犯在劳役中的身体状态、汗水、疲惫等描写，但不要过度
    *   **结果呈现**: 最后说明找到/采集到了哪些材料
    *   **字数要求**: 150-250字

4.  **经验和健康消耗计算**:
    *   **experience**: 基础值 = duration * 2，根据囚犯境界调整（筑基期+0，金丹期+5，元婴期+10）
    *   **healthCost**: 基础值 = duration * 1.5，最小5，最大20

5.  **JSON格式示例**:
\`\`\`json
{
  "materials": [
    {
      "material": {
        "id": "material-temp-1",
        "name": "紫晶灵铁矿",
        "type": "ore",
        "rarity": "优品",
        "description": "蕴含浓郁灵气的紫色铁矿，可用于锻造法器，矿石表面闪烁着星光般的微粒。",
        "value": 25
      },
      "quantity": 37
    },
    {
      "material": {
        "id": "material-temp-2",
        "name": "赤铜精矿",
        "type": "ore",
        "rarity": "良品",
        "description": "火红色的铜矿石，质地坚硬，含有微量火属性灵气，适合炼制火系法宝。",
        "value": 15
      },
      "quantity": 42
    }
  ],
  "story": "囚犯${prisoner.character.name}被押送至青蛇矿脉深处，在监工的看守下开始了长达${duration}小时的采矿劳作。他挥动着沉重的矿镐，一次次砸向坚硬的岩壁，汗水浸透了单薄的囚衣。随着时间推移，${prisoner.character.gender === 'Male' ? '他' : '她'}的双臂已经酸痛难忍，但在监工的鞭子威慑下不敢停歇。在第三个时辰时，矿镐终于凿开了一处紫光闪烁的矿脉，大量紫晶灵铁矿暴露出来。${prisoner.character.gender === 'Male' ? '他' : '她'}强忍疲惫，将这些珍贵的矿石一一搬运至矿车。临近收工时，又在矿洞侧壁发现了一小片赤铜精矿。虽然身心俱疲，但这次劳役的收获还算不错。",
  "experience": 25,
  "healthCost": 12
}
\`\`\`

6.  **严格要求**:
    *   你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象
    *   不要在代码块之外添加任何解释或注释
    *   materials数组必须恰好包含2个元素
    *   每个material对象必须完整填充所有字段
    *   材料类型必须与劳役位置类型匹配（矿山→ore，采药→herb）`;

    const prompt = `
    囚犯信息:
    - 姓名: ${prisoner.character.name}
    - 性别: ${prisoner.character.gender}
    - 境界: ${prisoner.character.realm}
    - 稀有度: ${prisoner.character.rarity}
    - 称号: ${prisoner.character.title || '无'}
    - 当前健康度: ${prisoner.health}/100
    - 屈服度: ${prisoner.submissionLevel}/100

    劳役详情:
    - 劳役类型: ${siteType}
    - 劳役时长: ${duration}小时

    请生成完整的劳役结果报告，包括2种不同的${siteType === '矿山' ? '矿石' : '草药'}材料、劳役过程故事、经验和健康消耗。
    `;

    const generatedText = gameState
        ? await enhancedGenerate({ systemInstruction, prompt, gameState })
        : await simpleGenerate(systemInstruction, prompt);

    const result = parseJsonFromText(generatedText);
    
    // 确保材料ID唯一
    if (result.materials && result.materials.length === 2) {
        const timestamp = Date.now();
        result.materials[0].material.id = `material-${timestamp}-1`;
        result.materials[1].material.id = `material-${timestamp}-2`;
    }

    return result;
}