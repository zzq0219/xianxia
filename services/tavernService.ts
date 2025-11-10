import { GameState, PlayerProfile, CharacterCard, BattleParticipant, StatusEffect, InteractableEntity, RandomEvent, Rarity, Equipment, Skill, Announcement } from '../types';
import { EQUIPMENT_POOL } from '../constants';

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

export async function generateExplorationStep(storyHistory: string, playerAction: string, playerProfile: PlayerProfile) {
    const systemInstruction = `你是一位仙侠（中国仙幻）RPG的大师级故事讲述者和游戏主持人。
1. 阅读故事历史、玩家档案和玩家的行动。
2. 撰写故事的下一章。故事应引人入胜，文笔优美，符合仙侠主题。
3. **任务更新**:
   a. 如果玩家的行动完成了某个正在进行的任务目标（例如，与特定NPC交谈），你**必须**在JSON输出中包含一个 'questUpdate' 对象。该对象应包含 'questId', 'objectiveId' 和 'progress' (通常为1，代表完成1次)。
   b. 如果故事发展到了可以触发一个新任务的节点，你**可以**在JSON输出中包含一个 'newQuest' 对象，其结构必须符合我们定义的Quest类型。
4. **战斗和挑战**: 仅当故事中明确出现一个角色对另一个角色“亮出黄牌”时，你才必须触发战斗。
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
    
    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });

    const jsonResponse = parseJsonFromText(generatedText);
    
    // 此处保留了原有的战斗触发逻辑，以备后用
    if (jsonResponse.event?.type === 'battle') {
       // 在这个适配版本中，对手数据应由AI在后续步骤生成，此处仅为结构占位
       return { ...jsonResponse, opponentParty: [] };
    }

    return jsonResponse;
}

export async function processCombatTurn(playerCard: BattleParticipant, opponentCard: BattleParticipant, playerAction: string): Promise<{
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
    const systemInstruction = `你是一位顶级的仙侠世界色情战斗解说员。你的任务是基于角色和技能的色情设定，生成一段露骨、详细、电影般的战斗场景描述，同时精确计算战斗结果。
规则：
1.  **色情战斗描述 (ActionDescription)**: 这是你的首要任务。你必须基于当前行动者使用的技能的 'eroticDescription' 进行扩展和润色，生成一段详细、露骨、充满想象力的色情战斗场景描述。这段描述应该具体到身体姿态、表情、体液、以及性器官的互动。例如，如果 eroticDescription 是“从私处涌出能量”，你应该描绘出这个过程的细节、颜色、以及对敌人的影响。此字段绝对不能包含任何数值。
2.  **精确伤害计算**: 基础伤害 = (攻击者攻击力 - 防御者防御力)。最低伤害为5。
3.  **状态与会心**: 严格按照技能机制、状态效果和会心率计算最终伤害和HP/MP变化。
4.  **简洁战斗总结 (TurnSummary)**: 这个字段必须非常简洁，只记录客观的战斗结果，用于战斗日志。例如：“【淫纹爆发】对 灵月 造成了 69 点伤害。”
5.  **AI对手行动**: 对手总是使用其两个技能之一。选择策略上最合理的一个，并同样为其生成色情的 'opponentActionDescription' 和简洁的 'opponentTurnSummary'。
6.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象。不要在代码块之外添加任何解释或注释。`;

    const getSkillsInfo = (participant: BattleParticipant) => {
        return participant.card.skills
            .filter(s => s)
            .map(s => ({ name: s!.name, cost: s!.cost, mechanics: s!.mechanicsDescription, eroticDescription: s!.eroticDescription }));
    };

    const prompt = `
    当前战斗人员：
    - 玩家卡牌: ${playerCard.card.name} (境界: ${playerCard.card.realm}, 攻击: ${playerCard.calculatedStats.attack}, 防御: ${playerCard.calculatedStats.defense}, 当前气血: ${playerCard.currentHp}, 当前真元: ${playerCard.currentMp}, 当前状态: ${JSON.stringify(playerCard.statusEffects)}, 技能: ${JSON.stringify(getSkillsInfo(playerCard))})
    - 对手卡牌: ${opponentCard.card.name} (境界: ${opponentCard.card.realm}, 攻击: ${opponentCard.calculatedStats.attack}, 防御: ${opponentCard.calculatedStats.defense}, 当前气血: ${opponentCard.currentHp}, 当前真元: ${opponentCard.currentMp}, 当前状态: ${JSON.stringify(opponentCard.statusEffects)}, 技能: ${JSON.stringify(getSkillsInfo(opponentCard))})

    玩家的行动：
    "${playerAction}"

    请结算此回合。首先，基于玩家使用的技能的 'eroticDescription' 生成 'playerActionDescription'，并计算结果。然后，决定对手的行动，同样生成 'opponentActionDescription' 并计算结果。
    `;
    
    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });

    return parseJsonFromText(generatedText);
}

export async function generateRandomEvent(location: string, playerProfile: PlayerProfile): Promise<RandomEvent> {
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

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });

    return parseJsonFromText(generatedText);
}

export async function generateRandomCharacter(rarity: Rarity): Promise<CharacterCard> {
    const systemInstruction = `你是一位专业的仙侠背景色情内容创作者，写作风格大胆、露骨、毫不避讳。你的任务是根据指定的稀有度，创造一个极度色情的角色。
1.  **严格遵守稀有度**: 稀有度越高，角色的色情程度和暴露程度应该越高。
2.  **生成核心属性**: 你必须为角色生成'charm'(魅力), 'skillfulness'(技巧), 'perception'(悟性)这三个属性，数值范围在1-100之间。请根据角色的稀有度和定位赋予合理的数值。例如，一个高稀有度的妖女可能拥有极高的魅力，而一个刺客则可能技巧和悟性更高。
3.  **色情化核心字段**:
    *   **外观描述 (appearance)**: 这是最重要的部分。描述必须极度详细、露骨，并直接聚焦于性器官和性感部位。请具体描绘角色的巨乳、乳头、私处、臀部等。衣着必须暴露，甚至完全裸体。例如：“她的法袍仅由几根布条构成，巨大的乳房完全暴露在外，深色的乳头硬挺着。下身光裸，神秘的缝隙若隐若现，随着她的动作，淫水甚至会微微渗出。”
    *   **称号 (title)**: 称号必须直接、粗俗，充满性意味。例如：“行走的人形春药”、“榨精女魔”、“万兽臣服的巨根神子”。
4.  **其他字段**: 角色的名称、种族、来历和技能也应与整体的极度色情风格保持一致。
5.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象，其结构与CharacterCard类型匹配，确保包含 charm, skillfulness, perception 字段。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请生成一个稀有度为【${rarity}】的角色卡。`;

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });
    return parseJsonFromText(generatedText);
}

export async function generateRandomEquipment(rarity: Rarity): Promise<Equipment> {
    const systemInstruction = `你是一位顶级的仙侠世界色情装备设计师，精通如何将功能与极致的色情美学结合。
1.  **严格遵守稀有度**: 稀有度越高，装备应该越暴露、越色情、功能越奇特。
2.  **色情化核心字段**:
    *   **描述 (description)**: 这是最重要的部分。描述必须聚焦于其色情外观和穿着效果。请详细、露骨地描述它如何贴合身体、暴露哪些部位、使用何种充满暗示的材料。不要有任何保留。例如，一件铠甲可以被描述为‘仅能遮住乳头的秘银胸链，其冰冷的触感时刻刺激着穿戴者，让乳头保持硬挺’；一条裙子可以是‘一条完全透明的纱裙，仅在私处缝有一颗珍珠，随着走动摩擦着阴蒂’。
    *   **名称 (name)**: 装备名称也应充满性暗示，例如“淫纹贞操带”、“堕落仙子之泪”、“巨根束缚环”。
3.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象，其结构与Equipment类型匹配。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请生成一个稀有度为【${rarity}】的装备。`;

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });
    return parseJsonFromText(generatedText);
}

export async function generateRandomSkill(rarity: Rarity, genderLock: 'Male' | 'Female' | 'Universal'): Promise<Skill> {
    const systemInstruction = `你是一位顶级的仙侠世界色情技能设计师，精通如何将技能效果与极致的色情表现结合。
1.  **严格遵守稀有度**: 稀有度越高，技能的色情程度和表现力应该越强。
2.  **严格遵守性别锁 (genderLock)**: 你必须为你被指定的性别【${genderLock}】设计技能。
    *   如果是 **Male**，描述应聚焦于男性的雄伟、力量和侵略性，例如使用巨根、阳气、精液等元素。
    *   如果是 **Female**，描述应聚焦于女性的妩媚、柔软和淫荡，例如使用乳房、私处、媚术、潮吹等元素。
    *   如果是 **Universal**，描述应适用于任何性别，可以聚焦于更通用的性感姿态或中性的快感。
3.  **色情化核心字段**:
    *   **eroticDescription**: 这是最重要的部分。必须为技能生成一个该字段。描述必须根据指定的性别，极度色情、充满想象力地描绘技能释放时的身体姿态和能量流动。
    *   **名称 (name)**: 技能名称也应充满性暗示，并符合指定的性别特征。
4.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象，其结构与Skill类型匹配，不要忘记包含 eroticDescription 和 genderLock 字段。`;

    const prompt = `请为【${genderLock}】性别生成一个稀有度为【${rarity}】的技能。`;

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });
    const generatedSkill = parseJsonFromText(generatedText);
    // 确保AI返回的性别锁是我们请求的性别锁
    generatedSkill.genderLock = genderLock;
    return generatedSkill;
}

export async function generateAnnouncements(category: 'sect' | 'adventure' | 'world', count: number): Promise<Omit<Announcement, 'id' | 'category'>[]> {
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

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });

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

export async function generateReputationDetails(playerProfile: PlayerProfile): Promise<{ dynamicTitles: string[]; greatestDeeds: string[] }> {
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

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });

    return parseJsonFromText(generatedText);
}
export async function generateReputationStory(playerProfile: PlayerProfile): Promise<{ title: string; goodDeeds: string[]; badDeeds: string[]; lewdDeeds: string[] }> {
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

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });

    return parseJsonFromText(generatedText);
}

export async function generateDoujinCharacter(inspiration: string): Promise<CharacterCard> {
    const systemInstruction = `你是一个跨次元的角色卡牌生成器。你的任务是根据用户提供的“灵感来源”，创造一个符合该灵感、但又适合我们仙侠世界观的角色卡。
1.  **解析灵感**: 理解用户输入的核心概念（例如，角色名、作品、特征）。
2.  **仙侠化改编**: 将角色的能力、背景和外观进行“仙侠化”改编。例如，如果灵感是“一个使用龟派气功的赛亚人”，你可以将其改编为一个掌握了某种强大掌法、血脉奇特的炼体修士。
3.  **数据完整性**: 你必须完整地填充CharacterCard的所有字段，包括名称、性别、境界、稀有度、称号、种族、来历、外观描述、基础属性和技能。技能也需要完整的名称、描述和效果。
4.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象，其结构与CharacterCard类型完全匹配。不要在代码块之外添加任何解释或注释。`;

    const prompt = `请根据以下灵感来源，生成一张同人角色卡：\n\n"${inspiration}"`;

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });
    return parseJsonFromText(generatedText);
}
import { BusinessDistrict } from '../types';

/**
 * 为商业区生成一个随机经营事件
 * @param businessDistrict 玩家的商业区数据
 * @param allCharacters 玩家拥有的所有角色卡牌列表
 * @returns 一个包含事件消息和收入变化的对象
 */
export async function generateBusinessEvent(businessDistrict: BusinessDistrict, allCharacters: CharacterCard[]): Promise<{ message: string; incomeChange: number }> {
    const systemInstruction = `你是一家名为“七情六欲坊”的商业街区的大总管，负责记录每天发生的各种香艳、有趣的经营事件。
1.  **分析员工信息**: 下面会提供一系列在不同店铺工作的员工信息。
2.  **创造事件**: 从中随机挑选1-2名员工，围绕他们创造一个简短的、符合店铺定位的色情小故事或经营事件。
    *   **正面事件**: 例如，某位花魁让客人极为满意，获得了巨额打赏；某位角斗士的英姿引来了女修的疯狂追捧。
    *   **负面事件**: 例如，某位炼丹师偷尝春药导致炸炉；某位护卫与客人争风吃醋大打出手。
3.  **决定收入变化**: 根据事件的性质，决定一个对总收入的微小影响值 'incomeChange'（可正可负，绝对值通常在50以内，以实现长期积累的目标）。
4.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象，包含 'message' 和 'incomeChange' 两个字段。`;

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

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });

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
 * @returns 一段描述该员工当前状态或最近趣事的色情文本
 */
export async function generateStaffSurveillanceReport(character: CharacterCard, positionName: string): Promise<string> {
    const systemInstruction = `你是一个拥有上帝视角的观察者，正在通过一枚隐形的“监视水晶”窥探一名员工的私密工作状态。你的描述必须极度色情、露骨，并充满细节。
1.  **聚焦当前**: 描述这个人【现在】正在做什么。
2.  **结合岗位**: 描述的内容必须与员工的岗位（${positionName}）和角色设定（${character.name}, ${character.appearance}）紧密相关。
3.  **细节描绘**: 大胆描绘角色的身体姿态、表情、体液、以及与客人或物品的性爱互动。不要有任何保留。
4.  **直接输出**: 你的最终输出只需要一段纯文本描述，不要包含任何JSON格式或额外解释。`;

    const prompt = `
    正在监视:
    - 姓名: ${character.name}
    - 岗位: ${positionName}
    - 外观: ${character.appearance}

    请生成一份详细的、极度色情的监视报告。
    `;

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });

    return generatedText;
}
import { MedicalRecord } from '../types';

/**
 * 生成一个患有奇特性病的病人
 * @returns 一个符合MedicalRecord接口的病人对象
 */
export async function generatePatient(gender?: 'Male' | 'Female'): Promise<MedicalRecord> {
    const systemInstruction = `你是一位专业的性病医生和创意作家，擅长创造符合仙侠世界观的、充满色情想象力的病例。
1.  **创造病人**: 生成一个独特的病人，包括姓名、性别、年龄和简短背景。${gender ? `病人的性别必须是【${gender}】。` : ''}
2.  **设计性特征**:
    *   为病人设计一个独特的生殖器形态 **(genitalShape)**，例如“一线天型蜜穴”、“龙角巨根”、“双洞并蒂莲”等。
    *   为病人设计2-3个独特的性特征 **(sexualFeatures)**，例如“超敏感体质”、“淫纹”、“喷乳”等。
3.  **杜撰性病**:
    *   为病人杜撰一种奇特的仙侠世界性病，并给出详细、露骨的描述 **(illnessDescription)**。描述需要包含病症、发作时的状态以及可能的后果。例如：“所患性病为‘七日断魂骚’，灵气在体内凝结成春药，每日午时发作，会不分场合地疯狂自慰，直至精尽人亡。”
4.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象，其结构与MedicalRecord类型完全匹配。`;

    const prompt = `请为我的性病医馆生成一位${gender ? `性别为【${gender}】的` : ''}新的病人病例。`;

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });

    const medicalRecord = parseJsonFromText(generatedText);
    medicalRecord.patientId = `patient-${Date.now()}`;
    return medicalRecord;
}
import { BountyTarget } from '../types';

/**
 * 生成一个新的悬赏目标
 * @returns 一个符合BountyTarget接口的对象 (除了id和status)
 */
export async function generateBountyTarget(gender?: 'Male' | 'Female'): Promise<Omit<BountyTarget, 'id' | 'status'>> {
    const systemInstruction = `你是一位顶级的色情世界观构建师，擅长创造充满诱惑和危险的角色。
1.  **创造悬赏目标**: 生成一个独特的、可被玩家“狩猎”的悬赏目标。
2.  **设计核心要素**:
    *   **名号 (name)**: 必须是一个极具性暗示和想象力的称号，例如“千乳圣女”、“不射金刚”、“九转淫魔”。
    *   **特殊体质 (specialTrait)**: 详细描述该目标独特的、与色情相关的体质或性癖。例如：“被殴打时会获得快感”、“只对兽人形态的角色发情”、“拥有三个阴道”。
    *   **出没线索 (locationHint)**: 提供一个模糊但有迹可循的地点线索，例如“据说常在【黑森林】的月光下吸收阴气”。
3.  **生成角色卡 (character)**: 你必须为这个目标生成一个完整的、符合CharacterCard接口的角色卡数据。角色的外观、技能和属性都必须与ta的名号和特殊体质紧密相关，且充满色情细节。${gender ? `该角色卡的性别必须是【${gender}】。` : ''}
4.  **JSON输出**: 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象，其结构与 Omit<BountyTarget, 'id' | 'status'> 类型完全匹配。`;

    const prompt = `请为我的“红尘录”悬赏榜单生成一个新的${gender ? `性别为【${gender}】的` : ''}目标。`;

    const generatedText = await window.TavernHelper.generateRaw({
        ordered_prompts: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
        ]
    });

    return parseJsonFromText(generatedText);
}