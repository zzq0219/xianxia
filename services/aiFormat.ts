/**
 * AI 格式化工具 - 统一导出入口
 * 
 * 使用方式:
 * import { generateNPCDialogue, formattedGenerate } from './services/aiFormat';
 */

// 导出核心工具类
export {
    AIFormatCompleter, AIFormatExtractor, AIFormatProcessor,
    createFormatProcessor
} from './aiFormatProcessor';

// 导出所有 Schema 和类型
export * from './aiFormatSchemas';

// 导出格式化生成函数
export {
    createFormattedGenerator, formattedGenerate, generateAIChoice, generateAnalysisResult, generateBattleNarrative, generateBattleResult, generateCharacterDescription, generateCultivationInsight, generateDialogueList, generateEventDescription, generateItemDescription, generateLocationDescription, generateMultipleChoices, generateNarrativeText, generateNPCDialogue, generateQuestDescription, generateShopItems,
    // 预定义函数
    generateSimpleText, generateSkillDescription, generateStatusUpdate
} from './formattedGenerate';

// 导出示例（可选）
export * as examples from './aiFormatExample';

