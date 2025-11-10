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
}

// Define the overall Player State
export interface PlayerProfile {
  name: string;
  title: string;
  relationships: CharacterRelationship[];
  spiritStones: number;
  maleParty: CharacterCard[];
  femaleParty: CharacterCard[];
  cardCollection: CharacterCard[];
  equipmentInventory: Equipment[];
  universalSkills: Skill[];
  arenaRank: ArenaRank;
  reputation: Reputation;
  quests: Quest[];
  businessDistrict: BusinessDistrict | null;
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
}

export interface SaveSlot {
    name: string;
    timestamp: number;
    gameState: GameState;
}

// Quest System Types
export type QuestStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Failed';
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
}

// Bounty Hunter Types
export interface BountyTarget {
  id: string;
  name: string; // e.g., "千乳圣女"
  character: CharacterCard;
  specialTrait: string; // Description of the unique trait
  locationHint: string; // Clue to find the target
  status: '悬赏中' | '已狩猎';
}