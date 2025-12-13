// =================================================================
// Etiquette System Types (礼仪设计馆系统)
// =================================================================


/**
 * 礼仪类型
 */
export type EtiquetteType = 'language' | 'behavior_dress';

/**
 * 适用场景 - 与店铺类型对应
 */
export type EtiquetteScene =
  | 'brothel'       // 青楼
  | 'arena'         // 角斗场
  | 'alchemy'       // 炼丹房
  | 'auction'       // 拍卖行
  | 'intelligence'  // 情报阁
  | 'hospital'      // 医馆
  | 'prison'        // 大牢
  | 'etiquette_hall' // 礼仪馆自身
  | 'general';      // 通用

/**
 * 礼仪状态
 */
export type EtiquetteStatus = 'active' | 'pending' | 'deprecated';

/**
 * 分发状态
 */
export type DistributionStatus = 'not_distributed' | 'distributed' | 'recalled';

/**
 * 店铺类型映射（与 ShopType 对应）
 */
export type ShopTypeForEtiquette = '青楼' | '角斗场' | '炼丹房' | '拍卖行' | '情报阁' | '医馆' | '大牢' | '礼仪馆';

/**
 * 场景到店铺类型的映射
 */
export const SCENE_TO_SHOP_TYPE: Record<EtiquetteScene, ShopTypeForEtiquette | null> = {
  brothel: '青楼',
  arena: '角斗场',
  alchemy: '炼丹房',
  auction: '拍卖行',
  intelligence: '情报阁',
  hospital: '医馆',
  prison: '大牢',
  etiquette_hall: '礼仪馆',
  general: null, // 通用场景不对应特定店铺
};

/**
 * 店铺类型到场景的映射
 */
export const SHOP_TYPE_TO_SCENE: Record<ShopTypeForEtiquette, EtiquetteScene> = {
  '青楼': 'brothel',
  '角斗场': 'arena',
  '炼丹房': 'alchemy',
  '拍卖行': 'auction',
  '情报阁': 'intelligence',
  '医馆': 'hospital',
  '大牢': 'prison',
  '礼仪馆': 'etiquette_hall',
};

/**
 * 礼仪分发记录
 */
export interface EtiquetteDistribution {
  shopType: ShopTypeForEtiquette;  // 分发到的店铺类型
  shopId?: string;                  // 具体店铺ID（如果有多个同类型店铺）
  positionIds: string[];            // 适用的岗位ID列表（对应 POSITIONS 的 key）
  distributedAt: number;            // 分发时间戳
  distributedBy?: string;           // 分发者ID
  status: DistributionStatus;       // 分发状态
  recalledAt?: number;              // 撤回时间戳
}

/**
 * 语言铁律
 */
export interface LanguageEtiquette {
  id: string;
  name: string;
  type: 'language';
  scene: EtiquetteScene;
  applicableRoles: string[];      // 适用角色列表（如：花魁、护卫等）
  applicablePositions?: string[]; // 适用岗位ID列表（对应 POSITIONS 的 key）
  content: string;                // 语言规范内容
  examples?: string[];            // 示例用语
  status: EtiquetteStatus;
  executionCount: number;         // 执行次数统计
  createdAt: number;              // 创建时间戳
  updatedAt: number;              // 更新时间戳
  generatedBy: 'ai' | 'manual';   // 生成方式
  designerId?: string;            // 设计师ID（角色卡牌ID）
  
  // 分发相关
  distributions: EtiquetteDistribution[]; // 分发记录
  isDistributed: boolean;         // 是否已分发
}

/**
 * 行为着装铁律
 */
export interface BehaviorDressEtiquette {
  id: string;
  name: string;
  type: 'behavior_dress';
  scene: EtiquetteScene;
  applicableRoles: string[];      // 适用角色列表（如：花魁、护卫等）
  applicablePositions?: string[]; // 适用岗位ID列表（对应 POSITIONS 的 key）
  
  // 着装要求
  dressCode: {
    upper?: string;               // 上身着装
    lower?: string;               // 下身着装
    accessories?: string[];       // 配饰要求
    special?: string;             // 特殊要求
  };
  
  // 行为要求
  behaviorRules: string[];        // 行为规范列表
  
  status: EtiquetteStatus;
  executionCount: number;
  createdAt: number;
  updatedAt: number;
  generatedBy: 'ai' | 'manual';
  designerId?: string;
  
  // 分发相关
  distributions: EtiquetteDistribution[]; // 分发记录
  isDistributed: boolean;         // 是否已分发
}

/**
 * 统一礼仪类型
 */
export type Etiquette = LanguageEtiquette | BehaviorDressEtiquette;

/**
 * 礼仪设置
 */
export interface EtiquetteSettings {
  // 自动刷新设置
  autoRefreshEnabled: boolean;    // 是否启用自动刷新
  refreshIntervalDays: number;    // 刷新周期（天）
  lastRefreshTime: number;        // 上次刷新时间戳
  
  // 生成数量设置
  languageEtiquetteCount: number;       // 每次生成的语言铁律数量
  behaviorDressEtiquetteCount: number;  // 每次生成的行为着装铁律数量
  
  // 涉及场景
  enabledScenes: EtiquetteScene[];
  
  // 涉及方面（语言）
  languageAspects: {
    addressing: boolean;          // 称呼用语
    requesting: boolean;          // 请求/汇报用语
    thanking: boolean;            // 感谢/道歉用语
  };
  
  // 涉及方面（行为着装）
  behaviorAspects: {
    upperDress: boolean;          // 上身着装
    lowerDress: boolean;          // 下身着装
    accessories: boolean;         // 配饰要求
    entryEtiquette: boolean;      // 入场礼仪
    servicePosture: boolean;      // 服务姿态
    specialActions: boolean;      // 特殊动作
  };
  
  // 生成风格设置
  styleSettings: {
    shameLevel: number;           // 羞耻程度 0-100
    submissionLevel: number;      // 服从强度 0-100
    exposureLevel: number;        // 露出程度 0-100
  };
  
  // 高级设置
  autoDistribute: boolean;        // 新礼仪生成后自动下发
  autoDeprecateOld: boolean;      // 旧礼仪在新周期开始时自动废除
  keepTopExecuted: number;        // 保留执行次数最高的N条礼仪
}

/**
 * 礼仪设计师（指派的角色卡牌）
 */
export interface EtiquetteDesigner {
  characterId: string;            // 角色卡牌ID
  assignedAt: number;             // 指派时间
  designCount: number;            // 已设计礼仪数量
  designStyle: string[];          // 设计风格标签
  qualityScore: number;           // 设计质量评分 0-100
}

/**
 * 礼仪日志条目
 */
export interface EtiquetteLogEntry {
  id: string;
  timestamp: number;
  action: 'generate' | 'distribute' | 'edit' | 'deprecate' | 'designer_assign' | 'designer_remove';
  details: string;
  etiquetteIds?: string[];        // 涉及的礼仪ID
  designerId?: string;            // 涉及的设计师ID
}

/**
 * 礼仪系统状态
 */
export interface EtiquetteSystem {
  // 设计师
  designer: EtiquetteDesigner | null;
  
  // 礼仪列表
  languageEtiquettes: LanguageEtiquette[];
  behaviorDressEtiquettes: BehaviorDressEtiquette[];
  
  // 主题周活动
  weeklyThemes: WeeklyTheme[];        // 所有主题周（包括历史、当前、未来）
  currentTheme: WeeklyTheme | null;   // 当前生效的主题周
  
  // 设计师工作栏
  designerWorkbench: DesignerWorkbench | null;
  
  // 设置
  settings: EtiquetteSettings;
  
  // 日志
  logs: EtiquetteLogEntry[];
  
  // 统计
  stats: {
    totalGenerated: number;       // 总生成数量
    totalActive: number;          // 当前生效数量
    totalExecutions: number;      // 总执行次数
    cycleCount: number;           // 已完成周期数
  };
}

/**
 * 主题周活动
 */
export interface WeeklyTheme {
  id: string;
  name: string;                       // 主题名称，如"羞辱周"、"服从周"
  description: string;                // 主题描述
  icon: string;                       // 主题图标emoji
  startTime: number;                  // 开始时间戳
  endTime: number;                    // 结束时间戳
  status: 'upcoming' | 'active' | 'completed'; // 状态
  
  // 主题特色设置
  themeSettings: {
    shameBonus: number;               // 羞耻加成 0-50
    submissionBonus: number;          // 服从加成 0-50
    exposureBonus: number;            // 露出加成 0-50
  };
  
  // 主题特殊要求
  specialRequirements: string[];      // 特殊礼仪要求列表
  
  // 主题目标
  goals: {
    description: string;              // 目标描述
    completed: boolean;               // 是否完成
  }[];
  
  // 主题奖励
  rewards?: {
    spiritStones?: number;
    items?: string[];
    reputation?: number;
  };
  
  createdAt: number;
  designedBy?: string;                // 设计师ID
}

/**
 * 人物卡牌工作栏条目
 */
export interface DesignerWorkItem {
  id: string;
  weekNumber: number;                 // 第几周
  theme: WeeklyTheme | null;          // 规划的主题
  notes: string;                      // 设计笔记
  priority: 'low' | 'medium' | 'high'; // 优先级
  status: 'planned' | 'in_progress' | 'completed'; // 状态
  createdAt: number;
  updatedAt: number;
}

/**
 * 人物卡牌工作栏（设计师的工作台）
 */
export interface DesignerWorkbench {
  designerId: string;                 // 设计师角色ID
  workItems: DesignerWorkItem[];      // 工作项列表
  currentWeek: number;                // 当前周数
  totalWeeksPlanned: number;          // 已规划周数
}

/**
 * 场景名称映射
 */
export const SCENE_NAMES: Record<EtiquetteScene, string> = {
  brothel: '青楼',
  arena: '角斗场',
  alchemy: '炼丹房',
  auction: '拍卖行',
  intelligence: '情报阁',
  hospital: '医馆',
  prison: '大牢',
  etiquette_hall: '礼仪馆',
  general: '通用',
};

/**
 * 场景对应的岗位列表
 */
export const SCENE_POSITIONS: Record<EtiquetteScene, { id: string; name: string }[]> = {
  brothel: [
    { id: 'p_brothel_star', name: '头牌花魁' },
    { id: 'p_brothel_tutor', name: '双修导师' },
    { id: 'p_brothel_guard', name: '护卫' },
  ],
  arena: [
    { id: 'p_arena_gladiator', name: '明星角斗士' },
    { id: 'p_arena_host', name: '主持人' },
    { id: 'p_arena_trader', name: '奴隶商人' },
  ],
  alchemy: [
    { id: 'p_alchemy_chief', name: '首席炼丹师' },
    { id: 'p_alchemy_apprentice', name: '药童' },
  ],
  auction: [
    { id: 'p_auction_master', name: '首席拍卖师' },
    { id: 'p_auction_appraiser', name: '鉴宝师' },
  ],
  intelligence: [
    { id: 'p_intel_chief', name: '情报头子' },
    { id: 'p_intel_assassin', name: '暗杀者' },
  ],
  hospital: [
    { id: 'p_hospital_doctor', name: '主治医师' },
    { id: 'p_hospital_nurse', name: '护士' },
  ],
  prison: [
    { id: 'p_prison_warden', name: '狱长' },
    { id: 'p_prison_guard', name: '狱卒' },
    { id: 'p_prison_torturer', name: '刑讯官' },
  ],
  etiquette_hall: [
    { id: 'p_etiquette_designer', name: '礼仪设计师' },
    { id: 'p_etiquette_inspector', name: '礼仪督察' },
  ],
  general: [], // 通用场景适用于所有岗位
};

/**
 * 默认礼仪设置
 */
export const DEFAULT_ETIQUETTE_SETTINGS: EtiquetteSettings = {
  autoRefreshEnabled: true,
  refreshIntervalDays: 7,
  lastRefreshTime: 0,
  
  languageEtiquetteCount: 5,
  behaviorDressEtiquetteCount: 5,
  
  enabledScenes: ['brothel', 'arena', 'alchemy', 'auction', 'intelligence', 'hospital', 'prison', 'etiquette_hall'],
  
  languageAspects: {
    addressing: true,
    requesting: true,
    thanking: true,
  },
  
  behaviorAspects: {
    upperDress: true,
    lowerDress: true,
    accessories: true,
    entryEtiquette: true,
    servicePosture: true,
    specialActions: true,
  },
  
  styleSettings: {
    shameLevel: 80,
    submissionLevel: 100,
    exposureLevel: 60,
  },
  
  autoDistribute: true,
  autoDeprecateOld: true,
  keepTopExecuted: 3,
};

/**
 * 默认礼仪系统状态
 */
export const DEFAULT_ETIQUETTE_SYSTEM: EtiquetteSystem = {
  designer: null,
  languageEtiquettes: [],
  behaviorDressEtiquettes: [],
  weeklyThemes: [],
  currentTheme: null,
  designerWorkbench: null,
  settings: DEFAULT_ETIQUETTE_SETTINGS,
  logs: [],
  stats: {
    totalGenerated: 0,
    totalActive: 0,
    totalExecutions: 0,
    cycleCount: 0,
  },
};