/**
 * AI上下文集成类型定义
 * 用于方案一：generate() + injects 的完整类型支持
 */

import { MemoryCategory } from '../types';

/**
 * SillyTavern 注入提示词（完整类型定义）
 */
export interface InjectionPrompt {
  /** 提示词ID，用于识别和管理 */
  id: string;
  /** 角色类型 */
  role: 'system' | 'user' | 'assistant';
  /** 提示词内容 */
  content: string;
  /** 插入位置类型 */
  position: 'relative' | 'in_chat';
  /** 深度（仅在 position='in_chat' 时使用，0表示最新消息） */
  depth: number;
  /** 排序优先级（同深度时使用） */
  order?: number;
  /** 是否允许世界书扫描此内容（关键！） */
  should_scan: boolean;
}

/**
 * 向量记忆注入配置
 */
export interface VectorMemoryInjectConfig {
  /** 是否启用向量记忆注入 */
  enabled: boolean;
  /** 最大结果数 */
  maxResults: number;
  /** 最小相似度阈值 */
  minSimilarity: number;
  /** 插入深度 */
  depth: number;
  /** 是否允许世界书扫描 */
  shouldScan: boolean;
  /** 限制的分类 */
  categories?: MemoryCategory[];
}

/**
 * 世界书注入配置
 */
export interface WorldbookInjectConfig {
  /** 是否手动注入世界书（false表示依赖自动激活） */
  manualInject: boolean;
  /** 是否包含常量条目 */
  includeConstant: boolean;
  /** 是否包含可选条目（会被自动激活机制处理） */
  includeSelective: boolean;
  /** 指定世界书名称（不指定则使用所有绑定的） */
  worldbookNames?: string[];
}

/**
 * 预设注入配置
 */
export interface PresetInjectConfig {
  /** 是否使用当前预设（推荐true，利用SillyTavern自动处理） */
  useCurrentPreset: boolean;
  /** 是否提取预设系统提示词手动注入（通常不需要） */
  extractSystemPrompts: boolean;
}

/**
 * 游戏状态上下文配置
 */
export interface GameStateContextConfig {
  /** 是否注入游戏状态 */
  enabled: boolean;
  /** 包含的状态信息 */
  include: {
    playerInfo: boolean;
    location: boolean;
    party: boolean;
    battleStatus: boolean;
    reputation: boolean;
  };
  /** 插入深度 */
  depth: number;
}

/**
 * 完整的AI生成配置
 */
export interface AIGenerationConfig {
  /** 用户输入 */
  userInput: string;
  
  /** 是否启用流式传输 */
  shouldStream?: boolean;
  
  /** 向量记忆配置 */
  vectorMemory?: VectorMemoryInjectConfig;
  
  /** 世界书配置 */
  worldbook?: WorldbookInjectConfig;
  
  /** 预设配置 */
  preset?: PresetInjectConfig;
  
  /** 游戏状态上下文配置 */
  gameStateContext?: GameStateContextConfig;
  
  /** 最大聊天历史条数 */
  maxChatHistory?: 'all' | number;
  
  /** 自定义API配置 */
  customApi?: {
    apiurl: string;
    key: string;
    model: string;
    source?: string;
  };
  
  /** 生成ID（用于并发控制） */
  generationId?: string;
}

/**
 * 上下文构建结果
 */
export interface ContextBuildResult {
  /** 所有注入的提示词 */
  injects: InjectionPrompt[];
  
  /** 增强后的用户输入 */
  enhancedUserInput: string;
  
  /** 元数据 */
  metadata: {
    /** 向量记忆数量 */
    vectorMemoryCount: number;
    /** 世界书条目数量 */
    worldbookEntriesCount: number;
    /** 游戏状态是否注入 */
    gameStateInjected: boolean;
    /** 构建耗时（毫秒） */
    buildTime: number;
  };
}

/**
 * 向量记忆格式化选项
 */
export interface VectorMemoryFormatOptions {
  /** 格式化样式 */
  style: 'detailed' | 'compact' | 'list';
  /** 是否显示相似度 */
  showSimilarity: boolean;
  /** 是否显示时间戳 */
  showTimestamp: boolean;
  /** 是否显示位置 */
  showLocation: boolean;
  /** 是否显示相关角色 */
  showCharacters: boolean;
  /** 最大文本长度（超过则截断） */
  maxTextLength?: number;
}

/**
 * 世界书条目信息（简化类型）
 */
export interface WorldbookEntryInfo {
  uid: number;
  name: string;
  content: string;
  enabled: boolean;
  strategyType: 'constant' | 'selective' | 'vectorized';
  keys: string[];
}

/**
 * 游戏状态格式化选项
 */
export interface GameStateFormatOptions {
  /** 格式化样式 */
  style: 'full' | 'compact' | 'minimal';
  /** 是否包含统计数据 */
  includeStats: boolean;
}

/**
 * AI生成事件数据
 */
export interface AIGenerationEvent {
  /** 事件类型 */
  type: 'started' | 'streaming' | 'completed' | 'failed';
  /** 生成ID */
  generationId: string;
  /** 当前文本（流式传输时） */
  text?: string;
  /** 错误信息（失败时） */
  error?: string;
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 上下文缓存条目
 */
export interface ContextCacheEntry {
  /** 缓存键 */
  key: string;
  /** 缓存的上下文 */
  context: ContextBuildResult;
  /** 创建时间 */
  timestamp: number;
  /** 过期时间（毫秒） */
  ttl: number;
}

/**
 * 默认配置常量
 */
export const DEFAULT_VECTOR_MEMORY_CONFIG: VectorMemoryInjectConfig = {
  enabled: true,
  maxResults: 5,
  minSimilarity: 0.7,
  depth: 0,
  shouldScan: true, // 关键：允许世界书扫描
};

export const DEFAULT_WORLDBOOK_CONFIG: WorldbookInjectConfig = {
  manualInject: false, // 依赖自动激活
  includeConstant: false, // 常量条目会自动激活
  includeSelective: false, // 可选条目会基于关键词自动激活
};

export const DEFAULT_PRESET_CONFIG: PresetInjectConfig = {
  useCurrentPreset: true, // 使用当前预设
  extractSystemPrompts: false, // 不需要手动提取
};

export const DEFAULT_GAME_STATE_CONFIG: GameStateContextConfig = {
  enabled: true,
  include: {
    playerInfo: true,
    location: true,
    party: true,
    battleStatus: true,
    reputation: false, // 可选
  },
  depth: 0,
};

export const DEFAULT_VECTOR_FORMAT_OPTIONS: VectorMemoryFormatOptions = {
  style: 'detailed',
  showSimilarity: true,
  showTimestamp: true,
  showLocation: true,
  showCharacters: true,
  maxTextLength: undefined,
};

export const DEFAULT_GAME_STATE_FORMAT_OPTIONS: GameStateFormatOptions = {
  style: 'compact',
  includeStats: false,
};

/**
 * 注入优先级常量
 */
export const INJECT_PRIORITY = {
  /** 向量记忆 - 最高优先级，最接近当前上下文 */
  VECTOR_MEMORY: 0,
  /** 游戏状态 - 次优先级 */
  GAME_STATE: 1,
  /** 额外系统提示 - 较低优先级 */
  SYSTEM_PROMPT: 2,
} as const;