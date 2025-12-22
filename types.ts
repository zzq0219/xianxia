// Import etiquette types
import { EtiquetteSystem } from './types/etiquette';
// Import gauntlet types
import { GauntletSystem } from './types/gauntlet.types';

// Define core stats for characters and equipment
export interface Attributes {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number; // e.g., 0.15 for 15%
  critDmg: number;  // e.g., 1.5 for 150%
}

// Define Equipment
export type EquipmentType = 'Weapon' | 'Armor' | 'Accessory';
export type GenderLock = 'Male' | 'Female' | 'Universal';

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: Rarity;
  description: string;
  genderLock?: GenderLock;
  stats: {
    attack?: number;
    hp?: number;
    defense?: number;
    speed?: number;
    critRate?: number;
    critDmg?: number;
  };
}

// Define Relationship
export interface CharacterRelationship {
  id: string;
  name: string;
  avatar: string;
  relationshipStatus: '熟人' | '陌生人';
  relationshipTags: string[];
  favorability: number; // A score from -100 to 100
  description: string; // A short description of the relationship
}

// Define Rarity
export type Rarity = '凡品' | '良品' | '优品' | '珍品' | '绝品' | '仙品' | '圣品' | '神品';


// Define Skills
export interface Skill {
  id: string;
  name: string;
  rarity: Rarity;
  description: string; // Flavor text
  mechanicsDescription: string; // Hard data, e.g., "Deals 110% ATK damage"
  eroticDescription: string; // Erotic animation description
  cost: number; // MP cost
  genderLock: GenderLock;
}

// Define a Character Card
export interface CharacterCard {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  realm: string;
  rarity: Rarity;
  title?: string; // 称号
  race?: string;  // 种族
  origin?: string; // 来历
  appearance?: string; // 外观描述
  artUrl?: string; // Placeholder for image
  charm?: number; // 魅力
  skillfulness?: number; // 技巧
  perception?: number; // 悟性
  baseAttributes: Attributes;
  skills: [Skill, Skill, Skill | null, Skill | null]; // 2 unique, 2 equippable
  equipment: {
    weapon: Equipment | null;
    armor: Equipment | null;
    accessory1: Equipment | null;
    accessory2: Equipment | null;
  };
  pet: PetCard | null;
}

// Arena and Leaderboard Types
export interface ArenaRank {
    tier: string;
    division: string;
    points: number;
    tierIcon: string;
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    faction: string;
    points: number;
    characterId: string;
}

export interface Leaderboards {
    '宗门排行榜': {
        '总榜': LeaderboardEntry[];
        '核心弟子': LeaderboardEntry[];
        '内门弟子': LeaderboardEntry[];
        '外门弟子': LeaderboardEntry[];
        '杂役弟子': LeaderboardEntry[];
    };
    '野榜': LeaderboardEntry[];
    '区域榜': LeaderboardEntry[];
    '世界榜': LeaderboardEntry[];
}

export interface Reputation {
    score: number; // e.g., from -1000 (Infamous) to 1000 (Legendary)
    level: '臭名昭著' | '默默无闻' | '小有名气' | '声名远扬' | '威震一方' | '名垂青史';
    dynamicTitles: string[];
    greatestDeeds: string[];
    title: string; // 主要称号
    goodDeeds: string[]; // 好事
    badDeeds: string[]; // 坏事
    lewdDeeds: string[]; // 风流韵事
    history: ReputationEvent[]; // 声望历史事件
}

export interface ReputationEvent {
    id: string;
    timestamp: string; // e.g., "第一天，黄昏"
    description: string;
    scoreChange: number;
}

// Define the overall Player State
export interface PlayerProfile {
  name: string;
  avatar?: string;
  title: string;
  relationships: CharacterRelationship[];
  spiritStones: number;
  maleParty: CharacterCard[];
  femaleParty: CharacterCard[];
  cardCollection: CharacterCard[];
  equipmentInventory: Equipment[];
  petCollection: PetCard[];
  universalSkills: Skill[];
  arenaRank: ArenaRank;
  reputation: Reputation;
  quests: Quest[];
  businessDistrict: BusinessDistrict | null;
  lastQuestGenerationTime?: number; // 上次生成任务的时间戳
}

// Define Battle State
export interface StatusEffect {
  name: string;
  description: string; // Flavor text
  mechanicsDescription?: string; // Hard data for tooltips
  duration: number; // turns remaining
}
export interface BattleParticipant {
    card: CharacterCard;
    currentHp: number;
    currentMp: number;
    statusEffects: StatusEffect[];
    calculatedStats: Attributes;
    pet: PetCard | null;
}

export interface BattleState {
    playerParty: BattleParticipant[];
    opponentParty: BattleParticipant[];
    activePlayerCardIndex: number;
    activeOpponentCardIndex: number;
    turn: 'player' | 'opponent' | 'pre-battle' | 'post-battle';
    combatLog: string[];
    isBattleOver: boolean;
    victory: boolean | null;
    isFled?: boolean; // 是否逃命
    isArenaBattle?: boolean;
}

// Define Announcement
export interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: string; // e.g., "天元32年，惊蛰"
  category: '宗门' | '奇遇' | '世界';
}

export enum ViewMode {
  HOME = 'HOME',       // 洞府
  ADVENTURE = 'ADVENTURE', // 历练
  INVENTORY = 'INVENTORY', // 储物袋
}

export type MenuCategory = 'sect' | 'world' | 'personal';

export interface SystemMenuItem {
  id: string;
  label: string;
  icon: string; // FontAwesome class string
  category: MenuCategory;
  desc?: string;
  color?: string;
  badge?: number;
}

// Define the main Game State
export type GameMode = 'exploration' | 'battle';

export interface GameState {
  version?: number;
  mode: GameMode;
  exploration: {
    story: string;
    location: string;
    time: string;
    choices: string[];
    pendingChallenge: {
      challengerName: string;
      reason: string;
    } | null;
  };
  playerProfile: PlayerProfile;
  leaderboards: Leaderboards;
  announcements: {
    sect: Announcement[];
    adventure: Announcement[];
    world: Announcement[];
  };
  battle?: BattleState;
  hospitalPatients: Patient[];
  bountyBoard: BountyTarget[];
  cultivationPavilion: CultivationSlot[];
  prisonSystem: PrisonSystem;
  memories: MemoryCollection;
  memorySummaries: MemorySummaryCollection;
  summarySettings: SummarySettings;
  vectorConfig: VectorConfig;
  etiquetteSystem: EtiquetteSystem;
  gauntletSystem: GauntletSystem;
}

export interface SaveSlot {
    name: string;
    timestamp: number;
    gameState: GameState;
}

// Quest System Types
export type QuestStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Failed' | 'Claimable';
export type QuestCategory = 'Main' | 'Side' | 'Sect';

export interface QuestReward {
    spiritStones?: number;
    reputation?: number;
    items?: (Equipment | Skill)[];
}

export interface QuestObjective {
    id: string;
    description: string;
    isCompleted: boolean;
    targetCount?: number;
    currentCount?: number;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    category: QuestCategory;
    status: QuestStatus;
    objectives: QuestObjective[];
    rewards: QuestReward;
}

export type ModalType = '队伍' | '商城' | '背包' | '任务' | '竞技场';

export type DiceRollResult = {
  playerRoll: number;
  opponentRoll: number;
  winner: 'player' | 'opponent';
};

export interface InteractableEntity {
  name: string;
  description: string;
  type: 'NPC' | 'Object' | 'Creature';
}

// Random World Event System
export type EventOutcome = 
    | { type: 'reward_stones'; amount: number; description: string; }
    | { type: 'lose_stones'; amount: number; description: string; }
    | { type: 'battle'; opponentName: string; opponentDescription: string; description: string; }
    | { type: 'nothing'; description: string; }
    | { type: 'reward_item'; itemName: string; description: string; };

export interface EventChoice {
    text: string;
    outcome: EventOutcome;
}

export interface RandomEvent {
    title: string;
    story: string;
    choices: EventChoice[];
}

// Business District Types
export type ShopType = '青楼' | '角斗场' | '炼丹房' | '拍卖行' | '情报阁';

export interface Staff {
  characterId: string;
  positionId: string; // Corresponds to a key in the global POSITIONS object
}

export interface Shop {
  id: string;
  type: ShopType;
  level: number;
  staff: Staff[];
}

export interface BusinessLogEntry {
  timestamp: string; // e.g., "第一天，黄昏"
  message: string;
  incomeChange?: number;
}

export interface BusinessDistrict {
  name: string;
  level: number;
  shops: Shop[];
  log: BusinessLogEntry[];
}

// Hospital Types
export interface MedicalRecord {
  patientId: string;
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  background: string;
  genitalShape: string;
  sexualFeatures: string[];
  illnessDescription: string;
}

export interface Patient {
  id: string;
  medicalRecord: MedicalRecord;
  status: '待诊' | '治疗中' | '已治愈';
  consultationStory?: string; // 问诊过程记录
  consultationChoices?: string[]; // 当前可选行动
}

// Bounty Hunter Types
export interface BountyTarget {
  id: string;
  name: string; // e.g., "千乳圣女"
  character: CharacterCard;
  specialTrait: string; // Description of the unique trait
  locationHint: string; // Clue to find the target
  status: '悬赏中' | '追踪中' | '已完成' | '已结束';
  trackerId: string | null; // ID of the character sent on the mission
  startTime: number; // Real-world timestamp
  endTime: number;   // Real-world timestamp
  trackingLog: string | null; // AI-generated log of the tracking process
  finalOutcome: 'killed' | 'imprisoned' | null;
}

// Define a Pet Card
export interface PetCard {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  rarity: Rarity;
  description: string;
  artUrl?: string;
  skill: Skill;
}

// =================================================================
// Cultivation Pavilion (育灵轩) Types
// =================================================================

export interface CultivationLogEntry {
  timestamp: string; // e.g., "培育第一天"
  message: string;
}

export interface CultivationSlot {
  slotId: number;
  parentA: CharacterCard | PetCard | null;
  parentB: CharacterCard | PetCard | null;
  startTime: number; // Real-world timestamp (Date.now())
  endTime: number;   // Real-world timestamp for completion
  status: 'Empty' | 'Breeding' | 'Ready';
  monitoringLog: CultivationLogEntry[];
}

// Add to GameState
// We will modify GameState directly. Find the GameState interface and add:
// cultivationPavilion: CultivationSlot[];

// =================================================================
// Memory System Types (记忆系统)
// =================================================================

export type MemoryCategory = '探索' | '战斗' | '商城' | '医馆' | '悬赏' | '培育' | '商业' | '声望' | '公告' | '大牢' | '其他';

export interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  timestamp: string; // 游戏时间
  realTimestamp: number; // 真实时间戳
  location?: string;
  involvedCharacters?: string[]; // 相关角色名称
}

export interface MemoryCollection {
  探索: MemoryEntry[];
  战斗: MemoryEntry[];
  商城: MemoryEntry[];
  医馆: MemoryEntry[];
  悬赏: MemoryEntry[];
  培育: MemoryEntry[];
  商业: MemoryEntry[];
  声望: MemoryEntry[];
  公告: MemoryEntry[];
  大牢: MemoryEntry[];
  其他: MemoryEntry[];
}

// 总结类型
export type SummaryType = 'small' | 'large';

export interface MemorySummary {
  id: string;
  type: SummaryType;
  category: MemoryCategory;
  title: string;
  content: string;
  sourceMemoryIds: string[]; // 来源记忆的ID列表
  startIndex: number; // 起始记忆索引
  endIndex: number;   // 结束记忆索引
  timestamp: string;
  realTimestamp: number;
}

export interface SummarySettings {
  autoSummaryEnabled: boolean;
  smallSummaryInterval: number; // 每多少条实时记录生成一次小总结
  largeSummaryInterval: number; // 每多少条小总结生成一次大总结
  summaryPrompts: {
    small: string;
    large: string;
  };
}

export interface MemorySummaryCollection {
  探索: { small: MemorySummary[]; large: MemorySummary[] };
  战斗: { small: MemorySummary[]; large: MemorySummary[] };
  商城: { small: MemorySummary[]; large: MemorySummary[] };
  医馆: { small: MemorySummary[]; large: MemorySummary[] };
  悬赏: { small: MemorySummary[]; large: MemorySummary[] };
  培育: { small: MemorySummary[]; large: MemorySummary[] };
  商业: { small: MemorySummary[]; large: MemorySummary[] };
  声望: { small: MemorySummary[]; large: MemorySummary[] };
  公告: { small: MemorySummary[]; large: MemorySummary[] };
  大牢: { small: MemorySummary[]; large: MemorySummary[] };
  其他: { small: MemorySummary[]; large: MemorySummary[] };
}

// =================================================================
// Vector Memory System Types (向量记忆系统)
// =================================================================

/**
 * 向量配置
 */
export interface VectorConfig {
  enabled: boolean; // 是否启用向量化功能
  apiUrl: string; // Embedding API URL
  apiKey: string; // API密钥
  model: string; // 使用的模型名称
  
  // 自动化设置
  autoVectorize: boolean; // 是否自动向量化新记忆
  vectorizeOnSummary: boolean; // 是否在生成总结时自动向量化
  batchSize: number; // 批量处理大小
  
  // 搜索设置
  similarityThreshold: number; // 相似度阈值 (0-1)
  maxResults: number; // 最大返回结果数
  topKBeforeRerank: number; // Rerank前的候选数量（检索返回结果数）
  
  // Reranker设置
  rerankerEnabled: boolean; // 是否启用Reranker
  rerankerApiUrl: string; // Reranker API URL
  rerankerApiKey: string; // Reranker API密钥
  rerankerModel: string; // Reranker模型名称
  
  // 高级设置
  retryAttempts: number; // 重试次数
  cacheEnabled: boolean; // 是否启用缓存
}

/**
 * 向量化的记忆条目
 */
export interface VectorizedMemoryEntry {
  id: string; // 记忆ID
  memoryId: string; // 关联的原始记忆ID
  category: MemoryCategory;
  vector: number[]; // 向量数据
  vectorDimension: number; // 向量维度
  text: string; // 向量化的文本内容
  metadata: {
    timestamp: string; // 游戏时间
    realTimestamp: number; // 真实时间
    location?: string;
    involvedCharacters?: string[];
    tags?: string[]; // 额外标签
  };
  created: number; // 向量化时间戳
  model: string; // 使用的模型
}

/**
 * 语义搜索结果
 */
export interface SemanticSearchResult {
  memory: VectorizedMemoryEntry;
  similarity: number; // 相似度分数 (0-1)
  rank: number; // 排名
}

/**
 * 向量存储统计
 */
export interface VectorStoreStats {
  totalVectors: number;
  byCategory: Record<MemoryCategory, number>;
  oldestVector: number; // 最早向量化时间
  newestVector: number; // 最新向量化时间
  averageDimension: number;
  storageSize: number; // 估算存储大小(字节)
}

/**
 * 向量化任务
 */
export interface VectorizationTask {
  id: string;
  memoryIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime: number;
  endTime?: number;
  error?: string;
}

/**
 * 上下文检索结果
 */
export interface ContextRetrievalResult {
  query: string;
  context: string; // 当前上下文描述
  relevantMemories: SemanticSearchResult[];
  totalSearched: number;
  searchTime: number; // 搜索耗时(ms)
}

// =================================================================
// Prison System Types (大牢系统)
// =================================================================

/**
 * 监狱区域类型
 */
export type PrisonArea = '居住区' | '审讯区' | '娱乐区' | '劳役区' | '管理区' | '医疗区';

/**
 * 牢房类型
 */
export type CellType = '普通牢房' | '重犯牢房' | '单独囚室';

/**
 * 囚犯状态
 */
export type PrisonerStatus =
  | '健康'
  | '受伤'
  | '重伤'
  | '生病'
  | '疯狂'
  | '垂危'
  | '禁闭中'
  | '劳役中'
  | '审讯中';

/**
 * 刑法类别
 */
export type TortureCategory = 'basic' | 'advanced' | 'special';

/**
 * 刑法方法
 */
export interface TortureMethod {
  id: string;
  name: string;
  category: TortureCategory;
  description: string;
  damage: number; // 伤害值 0-100
  intimidation: number; // 威慑力 0-100
  successRate: number; // 基础成功率 0-100
  submissionIncrease: number; // 屈服度增加 0-100
  requirements?: {
    skill?: string; // 需要的技能
    item?: string; // 需要的道具
    cost?: number; // 消耗的灵石
  };
  risks: {
    death: number; // 死亡风险 0-100
    permanentInjury: number; // 永久伤害风险 0-100
    insanity: number; // 疯狂风险 0-100
  };
}

/**
 * 审讯记录
 */
export interface InterrogationRecord {
  id: string;
  date: string; // 游戏时间
  realTimestamp: number; // 真实时间戳
  method: TortureMethod;
  duration: number; // 持续时间(分钟)
  result: {
    success: boolean;
    informationGained: string;
    submissionIncrease: number;
    healthDecrease: number;
  };
  interrogator: string; // 审讯者名称
}

/**
 * 囚犯数据 - 基于角色卡牌
 */
export interface Prisoner {
  character: CharacterCard; // 囚犯的角色卡牌
  crime: string; // 罪行
  sentence: number; // 刑期(天)
  remainingDays: number; // 剩余刑期
  submissionLevel: number; // 屈服度 0-100
  loyaltyLevel: number; // 归顺度 0-100
  health: number; // 健康度 0-100
  sanity: number; // 神智 0-100
  location: PrisonArea; // 所在区域
  cellType: CellType; // 牢房类型
  
  // 价值评估
  value: {
    ransom: number; // 赎金价值
    labor: number; // 劳役价值
    intelligence: number; // 情报价值
  };
  
  // 状态
  status: PrisonerStatus[];
  
  // 历史记录
  history: InterrogationRecord[];
  
  // 情报
  knownInformation: string[]; // 已知情报
  potentialInformation: string[]; // 潜在情报
  
  // 时间
  imprisonedDate: string; // 入狱时间(游戏时间)
  realImprisonedTime: number; // 入狱时间(真实时间戳)
}

/**
 * 狱卒数据
 */
export interface Guard {
  id: string;
  name: string;
  level: number;
  loyalty: number; // 忠诚度 0-100
  combat: number; // 战斗力
  surveillance: number; // 监视能力
  assignedArea: PrisonArea | null;
  salary: number; // 薪酬
}

/**
 * 劳役材料（矿石或草药）
 */
export interface LaborMaterial {
  id: string;
  name: string;
  type: 'ore' | 'herb'; // 矿石或草药
  rarity: Rarity;
  description: string;
  value: number; // 单个价值（灵石）
}

/**
 * 劳役位置类型
 */
export type LaborSiteType = '矿山' | '采药';

/**
 * 劳役位置（矿山或采药点）
 */
export interface LaborSite {
  id: string;
  type: LaborSiteType;
  name: string;
  description: string;
  maxWorkers: number; // 最大工人数（矿山和采药都是2）
  workers: LaborWorker[]; // 当前工作的囚犯
}

/**
 * 劳役工人
 */
export interface LaborWorker {
  prisonerId: string;
  prisonerName: string;
  startTime: number; // 开始时间（真实时间戳）
  endTime: number; // 预计完成时间（真实时间戳）
  duration: number; // 持续时间（小时）
  status: 'working' | 'completed';
  result?: LaborResult; // 劳役结果（完成后生成）
}

/**
 * 劳役结果
 */
export interface LaborResult {
  materials: {
    material: LaborMaterial;
    quantity: number; // 25-50随机
  }[]; // 总是2种材料
  story: string; // AI生成的劳役过程描述
  experience: number; // 获得的经验
  healthCost: number; // 消耗的健康度
}

/**
 * 劳役任务（保留兼容旧代码）
 */
export interface LaborTask {
  id: string;
  name: string;
  type: '采矿' | '采药' | '符箓制作' | '器具维修';
  description: string;
  difficulty: number; // 难度 1-10
  dailyQuota: number; // 日配额
  rewards: {
    spiritStones?: number;
    items?: string[];
    skillExperience?: number;
  };
  requirements?: {
    minLevel?: number;
    requiredSkills?: string[];
  };
}

/**
 * 劳役记录
 */
export interface LaborRecord {
  id: string;
  prisonerId: string;
  prisonerName: string;
  siteType: LaborSiteType;
  startTime: string; // 游戏时间
  realStartTime: number; // 真实时间戳
  endTime: string; // 游戏时间
  realEndTime: number; // 真实时间戳
  duration: number; // 持续时间（小时）
  result: LaborResult;
}

/**
 * 监狱设施
 */
export interface PrisonFacility {
  id: string;
  name: string;
  area: PrisonArea;
  level: number;
  capacity: number; // 容量
  condition: number; // 状况 0-100
  maintenanceCost: number; // 维护成本
  effects: string[]; // 效果描述
}

/**
 * 监狱事件
 */
export interface PrisonEvent {
  id: string;
  type: '暴动' | '越狱' | '疾病' | '冲突' | '招供' | '归顺' | '死亡' | '其他';
  title: string;
  description: string;
  timestamp: string; // 游戏时间
  realTimestamp: number;
  involvedPrisoners: string[]; // 涉及囚犯ID
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  outcome?: string;
}

/**
 * 赎金提议
 */
export interface RansomOffer {
  id: string;
  prisonerId: string;
  offerer: string; // 提议者
  amount: number; // 赎金金额
  additionalConditions?: string[]; // 附加条件
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  timestamp: string;
  realTimestamp: number;
}

/**
 * 监狱统计
 */
export interface PrisonStats {
  totalPrisoners: number;
  byArea: Record<PrisonArea, number>;
  byCellType: Record<CellType, number>;
  avgSubmission: number; // 平均屈服度
  avgLoyalty: number; // 平均归顺度
  avgHealth: number; // 平均健康度
  totalGuards: number;
  escapeAttempts: number; // 逃脱尝试次数
  successfulEscapes: number; // 成功逃脱次数
  totalRevenue: number; // 总收入
  totalExpenses: number; // 总支出
  netProfit: number; // 净利润
}

/**
 * 监狱系统状态
 */
export interface PrisonSystem {
  prisoners: Prisoner[];
  guards: Guard[];
  facilities: PrisonFacility[];
  
  // 新劳役系统
  laborSites: LaborSite[]; // 劳役位置（矿山和采药点）
  materialInventory: { material: LaborMaterial; quantity: number }[]; // 材料库存
  
  // 保留旧系统以兼容
  laborTasks: LaborTask[];
  laborRecords: LaborRecord[];
  
  events: PrisonEvent[];
  ransomOffers: RansomOffer[];
  stats: PrisonStats;
  
  // 配置
  config: {
    maxPrisoners: number;
    dailyFoodCost: number; // 每日伙食费
    securityLevel: number; // 安全等级 1-10
    enableAutoInterrogation: boolean; // 自动审讯
    enableAutoLabor: boolean; // 自动劳役
  };
}

// =================================================================
// Prisoner Dialogue System Types (囚犯对话系统)
// =================================================================

/**
 * 对话类型
 */
export type DialogueType = '威胁' | '劝说' | '交易' | '套话' | '闲聊' | '恩惠' | '羞辱';

/**
 * 对话态度
 */
export type DialogueAttitude = '友善' | '中立' | '敌对' | '恐惧' | '顺从' | '抗拒';

/**
 * 对话选项
 */
export interface DialogueOption {
  id: string;
  type: DialogueType;
  text: string; // 选项显示文本
  description: string; // 选项描述
  icon: string; // FontAwesome 图标
  requirements?: {
    skill?: string; // 需要的技能
    item?: string; // 需要的道具
    minSubmission?: number; // 最低屈服度要求
    maxSubmission?: number; // 最高屈服度要求
    minLoyalty?: number; // 最低归顺度要求
    spiritStones?: number; // 需要的灵石
  };
  baseEffects: {
    submissionChange: number; // 屈服度变化 (-100 到 100)
    loyaltyChange: number; // 归顺度变化 (-100 到 100)
    healthChange: number; // 健康度变化
    sanityChange: number; // 神智变化
    informationChance: number; // 获取情报概率 (0-100)
  };
  riskFactors?: {
    escapeAttempt: number; // 触发逃跑尝试概率 (0-100)
    rebellion: number; // 触发反抗概率 (0-100)
    breakdown: number; // 精神崩溃概率 (0-100)
  };
}

/**
 * 对话记录
 */
export interface DialogueRecord {
  id: string;
  prisonerId: string;
  prisonerName: string;
  timestamp: string; // 游戏时间
  realTimestamp: number; // 真实时间戳
  dialogueType: DialogueType;
  playerChoice: string; // 玩家选择的对话
  prisonerResponse: string; // 囚犯的回应（AI生成）
  attitude: DialogueAttitude; // 囚犯态度
  effects: {
    submissionChange: number;
    loyaltyChange: number;
    healthChange: number;
    sanityChange: number;
    informationGained?: string; // 获得的情报
    specialEvent?: string; // 触发的特殊事件
  };
}

/**
 * 囚犯心理状态
 */
export interface PrisonerMentalState {
  currentMood: '平静' | '愤怒' | '恐惧' | '绝望' | '希望' | '仇恨' | '顺从';
  trustLevel: number; // 对玩家的信任度 (-100 到 100)
  fearLevel: number; // 恐惧程度 (0-100)
  hopeLevel: number; // 希望程度 (0-100)
  recentDialogues: DialogueRecord[]; // 最近的对话记录
  personalSecrets: string[]; // 个人秘密（可通过对话获取）
  weaknesses: string[]; // 弱点（可利用）
  desires: string[]; // 欲望（可利用）
}

/**
 * 对话场景
 */
export interface DialogueScene {
  id: string;
  name: string;
  description: string;
  location: PrisonArea;
  availableOptions: DialogueOption[];
  specialConditions?: {
    timeOfDay?: '白天' | '夜晚';
    prisonerStatus?: PrisonerStatus[];
    minSubmission?: number;
    maxSubmission?: number;
  };
}

/**
 * 对话结果
 */
export interface DialogueResult {
  success: boolean;
  dialogueRecord: DialogueRecord;
  prisonerReaction: string; // AI生成的囚犯反应描述
  narrativeText: string; // AI生成的叙事文本
  stateChanges: {
    submission: number;
    loyalty: number;
    health: number;
    sanity: number;
  };
  rewards?: {
    information?: string;
    item?: string;
    spiritStones?: number;
  };
  consequences?: {
    eventTriggered?: string;
    relationshipChange?: string;
    prisonerStatusChange?: PrisonerStatus;
  };
}

/**
 * 预设对话选项集合
 */
export const DEFAULT_DIALOGUE_OPTIONS: DialogueOption[] = [
  // 威胁类
  {
    id: 'threat_violence',
    type: '威胁',
    text: '以暴力相威胁',
    description: '威胁对囚犯施以酷刑，迫使其屈服',
    icon: 'fa-fist-raised',
    baseEffects: {
      submissionChange: 15,
      loyaltyChange: -10,
      healthChange: 0,
      sanityChange: -5,
      informationChance: 30
    },
    riskFactors: {
      escapeAttempt: 5,
      rebellion: 15,
      breakdown: 10
    }
  },
  {
    id: 'threat_family',
    type: '威胁',
    text: '威胁其亲友',
    description: '暗示会对其在意的人不利',
    icon: 'fa-users',
    baseEffects: {
      submissionChange: 25,
      loyaltyChange: -20,
      healthChange: 0,
      sanityChange: -10,
      informationChance: 50
    },
    riskFactors: {
      escapeAttempt: 10,
      rebellion: 25,
      breakdown: 15
    }
  },
  {
    id: 'threat_execution',
    type: '威胁',
    text: '以处决相威胁',
    description: '声称若不配合将被处死',
    icon: 'fa-skull',
    baseEffects: {
      submissionChange: 35,
      loyaltyChange: -30,
      healthChange: 0,
      sanityChange: -15,
      informationChance: 60
    },
    riskFactors: {
      escapeAttempt: 20,
      rebellion: 30,
      breakdown: 25
    }
  },
  
  // 劝说类
  {
    id: 'persuade_reason',
    type: '劝说',
    text: '晓之以理',
    description: '用道理说服囚犯配合',
    icon: 'fa-comments',
    baseEffects: {
      submissionChange: 5,
      loyaltyChange: 10,
      healthChange: 0,
      sanityChange: 5,
      informationChance: 20
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 5,
      breakdown: 0
    }
  },
  {
    id: 'persuade_emotion',
    type: '劝说',
    text: '动之以情',
    description: '用情感打动囚犯',
    icon: 'fa-heart',
    baseEffects: {
      submissionChange: 10,
      loyaltyChange: 15,
      healthChange: 0,
      sanityChange: 10,
      informationChance: 25
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 0,
      breakdown: 0
    }
  },
  {
    id: 'persuade_future',
    type: '劝说',
    text: '许诺未来',
    description: '承诺若配合将有好的结果',
    icon: 'fa-sun',
    baseEffects: {
      submissionChange: 15,
      loyaltyChange: 20,
      healthChange: 0,
      sanityChange: 15,
      informationChance: 35
    },
    requirements: {
      minSubmission: 30
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 0,
      breakdown: 0
    }
  },
  
  // 交易类
  {
    id: 'trade_food',
    type: '交易',
    text: '以美食交换',
    description: '提供美味食物换取配合',
    icon: 'fa-utensils',
    requirements: {
      spiritStones: 10
    },
    baseEffects: {
      submissionChange: 5,
      loyaltyChange: 15,
      healthChange: 10,
      sanityChange: 5,
      informationChance: 30
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 0,
      breakdown: 0
    }
  },
  {
    id: 'trade_comfort',
    type: '交易',
    text: '改善待遇',
    description: '承诺改善关押条件',
    icon: 'fa-bed',
    requirements: {
      spiritStones: 50
    },
    baseEffects: {
      submissionChange: 10,
      loyaltyChange: 25,
      healthChange: 5,
      sanityChange: 10,
      informationChance: 40
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 0,
      breakdown: 0
    }
  },
  {
    id: 'trade_freedom',
    type: '交易',
    text: '以自由交换',
    description: '承诺若提供情报将释放',
    icon: 'fa-dove',
    requirements: {
      minSubmission: 50
    },
    baseEffects: {
      submissionChange: 20,
      loyaltyChange: 30,
      healthChange: 0,
      sanityChange: 20,
      informationChance: 70
    },
    riskFactors: {
      escapeAttempt: 5,
      rebellion: 0,
      breakdown: 0
    }
  },
  
  // 套话类
  {
    id: 'extract_casual',
    type: '套话',
    text: '闲聊套话',
    description: '在闲聊中套取信息',
    icon: 'fa-comment-dots',
    baseEffects: {
      submissionChange: 0,
      loyaltyChange: 5,
      healthChange: 0,
      sanityChange: 0,
      informationChance: 25
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 0,
      breakdown: 0
    }
  },
  {
    id: 'extract_trick',
    type: '套话',
    text: '设计圈套',
    description: '用话术诱导囚犯透露信息',
    icon: 'fa-chess',
    baseEffects: {
      submissionChange: 5,
      loyaltyChange: -5,
      healthChange: 0,
      sanityChange: -5,
      informationChance: 45
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 10,
      breakdown: 5
    }
  },
  {
    id: 'extract_pretend',
    type: '套话',
    text: '假装同情',
    description: '假装理解和同情来获取信任',
    icon: 'fa-mask',
    baseEffects: {
      submissionChange: 5,
      loyaltyChange: 10,
      healthChange: 0,
      sanityChange: 5,
      informationChance: 35
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 5,
      breakdown: 0
    }
  },
  
  // 闲聊类
  {
    id: 'chat_past',
    type: '闲聊',
    text: '聊聊过去',
    description: '询问囚犯的过往经历',
    icon: 'fa-clock-rotate-left',
    baseEffects: {
      submissionChange: 0,
      loyaltyChange: 10,
      healthChange: 0,
      sanityChange: 5,
      informationChance: 15
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 0,
      breakdown: 5
    }
  },
  {
    id: 'chat_cultivation',
    type: '闲聊',
    text: '谈论修炼',
    description: '与囚犯交流修炼心得',
    icon: 'fa-yin-yang',
    baseEffects: {
      submissionChange: 0,
      loyaltyChange: 15,
      healthChange: 0,
      sanityChange: 10,
      informationChance: 20
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 0,
      breakdown: 0
    }
  },
  {
    id: 'chat_world',
    type: '闲聊',
    text: '聊聊外界',
    description: '告诉囚犯外面世界的消息',
    icon: 'fa-globe',
    baseEffects: {
      submissionChange: 0,
      loyaltyChange: 5,
      healthChange: 0,
      sanityChange: -5,
      informationChance: 10
    },
    riskFactors: {
      escapeAttempt: 5,
      rebellion: 5,
      breakdown: 10
    }
  },
  
  // 恩惠类
  {
    id: 'favor_heal',
    type: '恩惠',
    text: '治疗伤势',
    description: '为囚犯治疗伤病',
    icon: 'fa-kit-medical',
    requirements: {
      spiritStones: 30
    },
    baseEffects: {
      submissionChange: 5,
      loyaltyChange: 20,
      healthChange: 30,
      sanityChange: 10,
      informationChance: 20
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 0,
      breakdown: 0
    }
  },
  {
    id: 'favor_gift',
    type: '恩惠',
    text: '赠送礼物',
    description: '送给囚犯一些小礼物',
    icon: 'fa-gift',
    requirements: {
      spiritStones: 20
    },
    baseEffects: {
      submissionChange: 0,
      loyaltyChange: 15,
      healthChange: 0,
      sanityChange: 10,
      informationChance: 15
    },
    riskFactors: {
      escapeAttempt: 0,
      rebellion: 0,
      breakdown: 0
    }
  },
  {
    id: 'favor_visit',
    type: '恩惠',
    text: '安排探视',
    description: '允许囚犯的亲友来探视',
    icon: 'fa-people-arrows',
    requirements: {
      minSubmission: 40,
      spiritStones: 100
    },
    baseEffects: {
      submissionChange: 10,
      loyaltyChange: 35,
      healthChange: 0,
      sanityChange: 30,
      informationChance: 25
    },
    riskFactors: {
      escapeAttempt: 15,
      rebellion: 0,
      breakdown: 0
    }
  },
  
  // 羞辱类
  {
    id: 'humiliate_mock',
    type: '羞辱',
    text: '言语嘲讽',
    description: '用言语羞辱和嘲讽囚犯',
    icon: 'fa-face-laugh',
    baseEffects: {
      submissionChange: 10,
      loyaltyChange: -15,
      healthChange: 0,
      sanityChange: -10,
      informationChance: 10
    },
    riskFactors: {
      escapeAttempt: 5,
      rebellion: 20,
      breakdown: 15
    }
  },
  {
    id: 'humiliate_public',
    type: '羞辱',
    text: '当众羞辱',
    description: '在其他囚犯面前羞辱',
    icon: 'fa-bullhorn',
    baseEffects: {
      submissionChange: 20,
      loyaltyChange: -25,
      healthChange: 0,
      sanityChange: -20,
      informationChance: 15
    },
    riskFactors: {
      escapeAttempt: 10,
      rebellion: 30,
      breakdown: 25
    }
  },
  {
    id: 'humiliate_strip',
    type: '羞辱',
    text: '剥夺尊严',
    description: '用各种方式剥夺囚犯的尊严',
    icon: 'fa-person-falling-burst',
    baseEffects: {
      submissionChange: 30,
      loyaltyChange: -35,
      healthChange: -5,
      sanityChange: -30,
      informationChance: 20
    },
    riskFactors: {
      escapeAttempt: 15,
      rebellion: 40,
      breakdown: 35
    }
  }
];