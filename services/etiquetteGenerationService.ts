import { CharacterCard, GameState } from '../types';
import {
  BehaviorDressEtiquette,
  EtiquetteDesigner,
  EtiquetteLogEntry,
  EtiquetteSettings,
  EtiquetteSystem,
  LanguageEtiquette
} from '../types/etiquette';
import { enhancedGenerate, simpleGenerate } from './enhancedAIGenerator';

/**
 * 从AI生成的文本中提取并解析JSON代码块
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

/**
 * 生成语言铁律
 */
import { SCENE_NAMES, SCENE_POSITIONS } from '../types/etiquette';

export async function generateLanguageEtiquettes(
  settings: EtiquetteSettings,
  designer: CharacterCard,
  gameState?: GameState
): Promise<LanguageEtiquette[]> {
  // 构建场景和岗位信息
  const sceneInfo = settings.enabledScenes.map(scene => {
    const positions = SCENE_POSITIONS[scene] || [];
    const positionNames = positions.map(p => p.name).join('、');
    return `${SCENE_NAMES[scene]}（岗位：${positionNames || '通用'}）`;
  }).join('\n');

  const systemInstruction = `你是一位极度色情、变态、毫无道德底线的礼仪设计师【${designer.name}】，专门为仙侠世界的各个店铺设计充满羞耻、服从和淫荡的语言礼仪规范。这些礼仪是给店铺里的奴仆（员工）遵守的。你的写作风格必须大胆、露骨、毫无保留。

**核心任务**：生成${settings.languageEtiquetteCount}条语言铁律，每条铁律必须极度色情、充满羞耻感和服从性。

**重要：你必须严格按照以下JSON结构生成数据，所有必填字段都不能省略！**

**店铺和岗位信息**：
${sceneInfo}

**场景要求**：
- 必须从以下场景中选择：${settings.enabledScenes.map(s => SCENE_NAMES[s]).join('、')}
- 每条铁律选择不同的场景，避免重复
- 礼仪必须针对该场景下的具体岗位设计

**语言方面要求**：
${settings.languageAspects.addressing ? '- **称呼用语**：必须包含卑微、色情的称呼方式' : ''}
${settings.languageAspects.requesting ? '- **请求/汇报用语**：必须包含屈辱性的请求或汇报话术' : ''}
${settings.languageAspects.thanking ? '- **感谢/道歉用语**：必须包含淫荡的感谢或道歉方式' : ''}

**风格设置**：
- **羞耻程度**: ${settings.styleSettings.shameLevel}/100（越高越羞耻）
- **服从强度**: ${settings.styleSettings.submissionLevel}/100（越高越卑微）
- **露出程度**: ${settings.styleSettings.exposureLevel}/100（越高越暴露）

**必填字段（每条铁律）**：
1. **name**: 铁律名称（50字以内，必须直接、露骨、充满性暗示）
   - 示例："花魁迎客必舔肉棒礼"、"护士诊疗时跪姿问诊规范"
   
2. **scene**: 适用场景（从启用场景中选择）
   - 可选值：brothel（青楼）、arena（角斗场）、alchemy（炼丹房）、auction（拍卖行）、intelligence（情报阁）、hospital（医馆）、prison（大牢）、etiquette_hall（礼仪馆）、general（通用）
   
3. **applicableRoles**: 适用角色/岗位列表（数组，2-4个角色）
   - 必须使用具体的岗位名称，如：["头牌花魁", "双修导师"]、["主治医师", "护士"]
   
4. **content**: 语言规范内容（200-400字）
   - 必须极度详细地描述语言使用场景和具体话术
   - 必须包含完整的示例对话
   - 必须体现羞耻感和服从性
   - 必须聚焦于性器官、性行为的描述
   
5. **examples**: 示例用语数组（3-5个具体示例）
   - 每个示例必须是完整的、可直接使用的话术
   - 必须极度色情、露骨
   - 示例格式："角色A对角色B说：'完整对话内容'"

**创作要求**：
1. **极致羞耻**：语言必须让使用者感到极度羞耻和屈辱
2. **绝对服从**：语言必须体现奴仆对主人/客人的绝对服从和卑微
3. **色情露骨**：必须包含性器官、性行为的直接描述
4. **场景贴合**：语言规范必须与店铺场景和岗位职责紧密结合
5. **可执行性**：规范必须具体、可操作，不能含糊其辞

**JSON输出格式示例**：
\`\`\`json
{
  "etiquettes": [
    {
      "name": "花魁迎客舔舐肉棒礼",
      "scene": "brothel",
      "applicableRoles": ["头牌花魁", "双修导师"],
      "content": "所有花魁在迎接贵客时，必须先跪下，用舌头舔舐客人的阴茎至少三分钟。舔舐时必须发出淫荡的吮吸声，并用手爱抚客人的睾丸。舔舐完毕后，需将口中积累的唾液和前列腺液混合物吞咽下去，然后用标准话术向客人汇报：'贵客大人，小女子的舌头已为您服务完毕，您的龙根威武雄壮，让卑贱的花魁铭记于心。现在奴婢将带着您的精华为您提供更深入的服务。'此礼仪旨在让花魁时刻铭记客人的威严，以更加恭敬的态度服务。",
      "examples": [
        "花魁跪在客人面前说：'贵客大人，卑贱的花魁请求用舌头为您服务，请您赐予贱婢这个荣幸。'",
        "双修导师舔舐时呻吟道：'啊...大人的肉棒好大好硬...贱婢的舌头太幸福了...'",
        "花魁舔完后说：'感谢大人赏赐精华给卑贱的奴婢，小女子会永远记住这份恩典。'"
      ]
    }
  ]
}
\`\`\`

**严格要求**：
- 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象
- JSON对象包含一个 "etiquettes" 数组，数组中有${settings.languageEtiquetteCount}个元素
- 每个元素必须完整填充所有字段
- 不要在代码块之外添加任何解释或注释
- 所有描述必须极度色情、露骨、具体，不要使用委婉语`;

  const prompt = `请为我设计${settings.languageEtiquetteCount}条极度色情、充满羞耻的语言铁律，这些礼仪是给我店铺里的奴仆遵守的。记住：描写必须极度大胆、露骨、变态！`;

  const generatedText = gameState
    ? await enhancedGenerate({ systemInstruction, prompt, gameState })
    : await simpleGenerate(systemInstruction, prompt);

  const jsonResponse = parseJsonFromText(generatedText);
  const etiquettes = jsonResponse.etiquettes || [];

  // 为每条礼仪添加必要字段
  const timestamp = Date.now();
  return etiquettes.map((etiquette: any, index: number) => {
    // 根据场景获取对应的岗位ID
    const scene = etiquette.scene || 'general';
    const positions = SCENE_POSITIONS[scene as keyof typeof SCENE_POSITIONS] || [];
    const applicablePositions = positions.map(p => p.id);
    
    return {
      ...etiquette,
      id: `lang-etiquette-${timestamp}-${index}`,
      type: 'language' as const,
      status: 'active' as const,
      executionCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      generatedBy: 'ai' as const,
      designerId: designer.id,
      applicablePositions,
      distributions: [],
      isDistributed: false,
    };
  });
}

/**
 * 生成行为着装铁律
 */
export async function generateBehaviorDressEtiquettes(
  settings: EtiquetteSettings,
  designer: CharacterCard,
  gameState?: GameState
): Promise<BehaviorDressEtiquette[]> {
  // 构建场景和岗位信息
  const sceneInfo = settings.enabledScenes.map(scene => {
    const positions = SCENE_POSITIONS[scene] || [];
    const positionNames = positions.map(p => p.name).join('、');
    return `${SCENE_NAMES[scene]}（岗位：${positionNames || '通用'}）`;
  }).join('\n');

  const systemInstruction = `你是一位极度色情、变态、毫无道德底线的礼仪设计师【${designer.name}】，专门为仙侠世界的各个店铺设计充满羞耻、服从和淫荡的行为着装规范。这些礼仪是给店铺里的奴仆（员工）遵守的。你的写作风格必须大胆、露骨、毫无保留。

**核心任务**：生成${settings.behaviorDressEtiquetteCount}条行为着装铁律，每条铁律必须极度色情、极度暴露、充满羞耻感。

**重要：你必须严格按照以下JSON结构生成数据，所有必填字段都不能省略！**

**店铺和岗位信息**：
${sceneInfo}

**场景要求**：
- 必须从以下场景中选择：${settings.enabledScenes.map(s => SCENE_NAMES[s]).join('、')}
- 每条铁律选择不同的场景，避免重复
- 礼仪必须针对该场景下的具体岗位设计

**行为着装方面要求**：
${settings.behaviorAspects.upperDress ? '- **上身着装**：必须包含上身的暴露要求' : ''}
${settings.behaviorAspects.lowerDress ? '- **下身着装**：必须包含下身的暴露要求' : ''}
${settings.behaviorAspects.accessories ? '- **配饰要求**：必须包含羞耻性的配饰' : ''}
${settings.behaviorAspects.entryEtiquette ? '- **入场礼仪**：必须包含进入场所时的屈辱性动作' : ''}
${settings.behaviorAspects.servicePosture ? '- **服务姿态**：必须包含服务时的淫荡姿势' : ''}
${settings.behaviorAspects.specialActions ? '- **特殊动作**：必须包含特定的性行为要求' : ''}

**风格设置**：
- **羞耻程度**: ${settings.styleSettings.shameLevel}/100（越高越羞耻）
- **服从强度**: ${settings.styleSettings.submissionLevel}/100（越高越卑微）
- **露出程度**: ${settings.styleSettings.exposureLevel}/100（越高越暴露，100=完全裸体+性器官完全暴露）

**必填字段（每条铁律）**：
1. **name**: 铁律名称（50字以内，必须直接、露骨、充满性暗示）
   - 示例："花魁全裸迎客制"、"护士乳头夹具工作规范"
   
2. **scene**: 适用场景（从启用场景中选择）
   - 可选值：brothel（青楼）、arena（角斗场）、alchemy（炼丹房）、auction（拍卖行）、intelligence（情报阁）、hospital（医馆）、prison（大牢）、etiquette_hall（礼仪馆）、general（通用）
   
3. **applicableRoles**: 适用角色/岗位列表（数组，2-4个角色）
   - 必须使用具体的岗位名称，如：["头牌花魁", "双修导师"]、["主治医师", "护士"]
   
4. **dressCode**: 着装要求对象
   - **upper**: 上身着装（100-200字，必须极度详细描述上身穿着，聚焦胸部、乳头）
   - **lower**: 下身着装（100-200字，必须极度详细描述下身穿着，聚焦性器官、臀部）
   - **accessories**: 配饰数组（2-4个具体配饰，每个50-100字描述）
   - **special**: 特殊要求（100-150字，描述其他特殊的着装或身体要求）
   
5. **behaviorRules**: 行为规范数组（3-5条具体规范）
   - 每条规范100-200字
   - 必须详细描述具体的行为动作
   - 必须包含性行为或性暗示
   - 必须体现羞耻感和服从性

**创作要求**：
1. **极致暴露**：着装必须让穿着者的性器官完全或部分暴露
2. **绝对羞耻**：着装和行为必须让奴仆感到极度羞耻
3. **色情露骨**：描述必须直接、具体，聚焦性器官和性行为
4. **场景贴合**：规范必须与店铺场景和岗位职责紧密结合
5. **可执行性**：规范必须具体、可操作，包含明确的动作描述

**露出程度参考**（根据${settings.styleSettings.exposureLevel}/100）：
- 60以下：部分暴露（透视、镂空、开叉）
- 60-80：大面积暴露（乳头、臀部、大腿根部外露）
- 80-90：性器官部分暴露（阴唇外露、阴茎半露）
- 90-100：完全裸体+性器官完全暴露+性器官强制展示

**JSON输出格式示例**：
\`\`\`json
{
  "etiquettes": [
    {
      "name": "花魁全裸迎客制",
      "scene": "brothel",
      "applicableRoles": ["头牌花魁", "双修导师"],
      "dressCode": {
        "upper": "花魁在迎客时上身必须完全裸露，不得穿戴任何衣物遮挡。双乳必须完全暴露，乳头需保持勃起状态。为确保乳头持续勃起，需在迎客前使用冰块刺激乳头至少五分钟。服务过程中，乳房必须随着身体动作自然晃动，以展示其柔软和丰满。",
        "lower": "下身同样必须完全裸露，阴部不得有任何遮挡。阴毛需剃除干净，阴唇必须完全暴露。在服务时，需将双腿分开至少60度角，确保客人能清楚看到花魁的阴部。阴道口需保持湿润状态，若不够湿润需自行用手指刺激至淫水流出。",
        "accessories": [
          "乳头夹：两个金属乳头夹必须夹在乳头上，夹力适中以保持乳头充血状态。夹子上悬挂细链，链子下端连接小铃铛，每次动作时会发出清脆的声响。",
          "阴蒂环：一个小巧的金环穿过阴蒂，环上刻有'奴婢'二字。每次服务时需用手指拨动阴蒂环，让金环在阴蒂上滚动，产生强烈刺激。",
          "肛塞：一个透明水晶肛塞必须插入肛门，塞子尾部有一根红色丝带垂下。肛塞会在服务过程中不断刺激括约肌，提醒花魁保持专注。"
        ],
        "special": "服务开始前，花魁必须在客人面前进行'净身礼'：用温水清洗全身，特别是乳房、阴部和肛门，清洗过程需让客人观看。清洗完毕后，需让客人检查身体清洁度，客人有权用手指插入阴道和肛门检查。"
      },
      "behaviorRules": [
        "**迎客礼**：花魁迎接客人时，必须以跪姿爬行进入，爬行时臀部需高高翘起，让阴部和肛门完全暴露。爬至客人面前，需将额头贴地，双手向后掰开自己的臀瓣，让客人清楚看到阴道和肛门，保持此姿势直到客人允许起身。",
        "**服务姿态**：服务时，需先用手指撑开阴唇，展示给客人看。服务过程中，双腿必须保持分开状态，此姿势会让阴唇自然张开，阴道内壁部分外露。",
        "**侍奉动作**：每次为客人服务时，花魁需先用左手揉捏自己的左乳，用右手服务客人。同时需用力捏紧乳头，让身体因快感而颤抖，乳房剧烈晃动。",
        "**送客礼**：送客时，花魁需站起身，面向客人，双手捧起自己的双乳，将乳头对准客人，然后用力挤压乳房。同时需张开双腿，用手指撑开阴唇，让客人看到湿润的阴道内壁，并大声说：'感谢大人光临，卑贱的奴婢随时恭候大人再次驾临。'",
        "**特殊服务礼**：若客人要求特殊服务，花魁需当众自慰至高潮，以示对客人的敬意。自慰时需将一只手的手指插入阴道，另一只手揉搓阴蒂，直至淫水喷涌而出，身体剧烈痉挛。高潮时需大声喊出：'奴婢以身体的高潮向大人献祭！'"
      ]
    }
  ]
}
\`\`\`

**严格要求**：
- 你的最终输出必须是一个包裹在 \`\`\`json ... \`\`\` 代码块中的JSON对象
- JSON对象包含一个 "etiquettes" 数组，数组中有${settings.behaviorDressEtiquetteCount}个元素
- 每个元素必须完整填充所有字段
- dressCode的所有子字段（upper, lower, accessories, special）都必须填写
- behaviorRules数组必须有3-5个元素
- 不要在代码块之外添加任何解释或注释
- 所有描述必须极度色情、露骨、具体、变态，不要使用委婉语`;

  const prompt = `请为我设计${settings.behaviorDressEtiquetteCount}条极度色情、极度暴露、充满羞耻的行为着装铁律，这些礼仪是给我店铺里的奴仆遵守的。记住：描写必须极度大胆、露骨、变态、暴露！`;

  const generatedText = gameState
    ? await enhancedGenerate({ systemInstruction, prompt, gameState })
    : await simpleGenerate(systemInstruction, prompt);

  const jsonResponse = parseJsonFromText(generatedText);
  const etiquettes = jsonResponse.etiquettes || [];

  // 为每条礼仪添加必要字段
  const timestamp = Date.now();
  return etiquettes.map((etiquette: any, index: number) => {
    // 根据场景获取对应的岗位ID
    const scene = etiquette.scene || 'general';
    const positions = SCENE_POSITIONS[scene as keyof typeof SCENE_POSITIONS] || [];
    const applicablePositions = positions.map(p => p.id);
    
    return {
      ...etiquette,
      id: `behavior-etiquette-${timestamp}-${index}`,
      type: 'behavior_dress' as const,
      status: 'active' as const,
      executionCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      generatedBy: 'ai' as const,
      designerId: designer.id,
      applicablePositions,
      distributions: [],
      isDistributed: false,
    };
  });
}

/**
 * 批量生成所有类型的礼仪
 */
export async function generateAllEtiquettes(
  settings: EtiquetteSettings,
  designer: CharacterCard,
  gameState?: GameState
): Promise<{
  languageEtiquettes: LanguageEtiquette[];
  behaviorDressEtiquettes: BehaviorDressEtiquette[];
}> {
  console.log('[礼仪生成] 开始生成所有礼仪...');
  console.log('[礼仪生成] 设计师:', designer.name);
  console.log('[礼仪生成] 语言铁律数量:', settings.languageEtiquetteCount);
  console.log('[礼仪生成] 行为着装铁律数量:', settings.behaviorDressEtiquetteCount);

  try {
    // 并行生成两种类型的礼仪
    const [languageEtiquettes, behaviorDressEtiquettes] = await Promise.all([
      generateLanguageEtiquettes(settings, designer, gameState),
      generateBehaviorDressEtiquettes(settings, designer, gameState)
    ]);

    console.log('[礼仪生成] 生成完成');
    console.log('[礼仪生成] 语言铁律:', languageEtiquettes.length, '条');
    console.log('[礼仪生成] 行为着装铁律:', behaviorDressEtiquettes.length, '条');

    return {
      languageEtiquettes,
      behaviorDressEtiquettes
    };
  } catch (error) {
    console.error('[礼仪生成] 生成失败:', error);
    throw error;
  }
}

/**
 * 刷新礼仪（生成新礼仪并更新系统状态）
 */
export async function refreshEtiquettes(
  etiquetteSystem: EtiquetteSystem,
  gameState?: GameState
): Promise<EtiquetteSystem> {
  if (!etiquetteSystem.designer) {
    throw new Error('未指派设计师，无法刷新礼仪');
  }

  // 查找设计师角色卡
  const designer = gameState?.playerProfile.cardCollection.find(
    card => card.id === etiquetteSystem.designer!.characterId
  );

  if (!designer) {
    throw new Error('设计师角色卡不存在');
  }

  // 生成新礼仪
  const { languageEtiquettes, behaviorDressEtiquettes } = await generateAllEtiquettes(
    etiquetteSystem.settings,
    designer,
    gameState
  );

  const timestamp = Date.now();

  // 处理旧礼仪
  let updatedLanguageEtiquettes = [...etiquetteSystem.languageEtiquettes];
  let updatedBehaviorDressEtiquettes = [...etiquetteSystem.behaviorDressEtiquettes];

  if (etiquetteSystem.settings.autoDeprecateOld) {
    // 废除旧礼仪，但保留执行次数最高的N条
    const keepTopN = etiquetteSystem.settings.keepTopExecuted;

    // 处理语言铁律
    const sortedLanguage = [...updatedLanguageEtiquettes].sort(
      (a, b) => b.executionCount - a.executionCount
    );
    updatedLanguageEtiquettes = sortedLanguage.slice(0, keepTopN).map(e => ({
      ...e,
      status: 'active' as const
    }));
    // 废除其他的
    const deprecatedLanguage = sortedLanguage.slice(keepTopN).map(e => ({
      ...e,
      status: 'deprecated' as const
    }));
    updatedLanguageEtiquettes.push(...deprecatedLanguage);

    // 处理行为着装铁律
    const sortedBehavior = [...updatedBehaviorDressEtiquettes].sort(
      (a, b) => b.executionCount - a.executionCount
    );
    updatedBehaviorDressEtiquettes = sortedBehavior.slice(0, keepTopN).map(e => ({
      ...e,
      status: 'active' as const
    }));
    const deprecatedBehavior = sortedBehavior.slice(keepTopN).map(e => ({
      ...e,
      status: 'deprecated' as const
    }));
    updatedBehaviorDressEtiquettes.push(...deprecatedBehavior);
  }

  // 添加新礼仪
  updatedLanguageEtiquettes.push(...languageEtiquettes);
  updatedBehaviorDressEtiquettes.push(...behaviorDressEtiquettes);

  // 更新设计师统计
  const updatedDesigner: EtiquetteDesigner = {
    ...etiquetteSystem.designer,
    designCount: etiquetteSystem.designer.designCount + languageEtiquettes.length + behaviorDressEtiquettes.length,
  };

  // 创建日志
  const logEntry: EtiquetteLogEntry = {
    id: `log-${timestamp}`,
    timestamp,
    action: 'generate',
    details: `设计师【${designer.name}】生成了${languageEtiquettes.length}条语言铁律和${behaviorDressEtiquettes.length}条行为着装铁律`,
    etiquetteIds: [
      ...languageEtiquettes.map(e => e.id),
      ...behaviorDressEtiquettes.map(e => e.id)
    ],
    designerId: designer.id
  };

  // 更新系统状态
  const updatedSystem: EtiquetteSystem = {
    ...etiquetteSystem,
    designer: updatedDesigner,
    languageEtiquettes: updatedLanguageEtiquettes,
    behaviorDressEtiquettes: updatedBehaviorDressEtiquettes,
    settings: {
      ...etiquetteSystem.settings,
      lastRefreshTime: timestamp
    },
    logs: [logEntry, ...etiquetteSystem.logs],
    stats: {
      totalGenerated: etiquetteSystem.stats.totalGenerated + languageEtiquettes.length + behaviorDressEtiquettes.length,
      totalActive: updatedLanguageEtiquettes.filter(e => e.status === 'active').length + 
                   updatedBehaviorDressEtiquettes.filter(e => e.status === 'active').length,
      totalExecutions: etiquetteSystem.stats.totalExecutions,
      cycleCount: etiquetteSystem.stats.cycleCount + 1
    }
  };

  return updatedSystem;
}

/**
 * 检查是否需要自动刷新
 */
export function shouldAutoRefresh(etiquetteSystem: EtiquetteSystem): boolean {
  if (!etiquetteSystem.settings.autoRefreshEnabled) {
    return false;
  }

  const now = Date.now();
  const lastRefresh = etiquetteSystem.settings.lastRefreshTime;
  const intervalMs = etiquetteSystem.settings.refreshIntervalDays * 24 * 60 * 60 * 1000;

  return (now - lastRefresh) >= intervalMs;
}

/**
 * 获取下次刷新时间
 */
export function getNextRefreshTime(etiquetteSystem: EtiquetteSystem): number {
  const lastRefresh = etiquetteSystem.settings.lastRefreshTime;
  const intervalMs = etiquetteSystem.settings.refreshIntervalDays * 24 * 60 * 60 * 1000;
  return lastRefresh + intervalMs;
}