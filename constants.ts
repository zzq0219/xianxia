export const CURRENT_GAME_VERSION = 2;

import { createDefaultGauntletSystem } from './services/gauntlet/gauntletUtils';
import { defaultVectorConfig } from './services/vectorService';
import { ArenaRank, CharacterCard, Equipment, GameState, Leaderboards, PetCard, Rarity, ShopType, Skill } from './types';
import { DEFAULT_ETIQUETTE_SYSTEM } from './types/etiquette';

// 示例技能
const skill1: Skill = { id: 's1', name: '青玉剑诀', rarity: '良品', description: '青蛇宗入门剑法，讲究快、准、狠，直指敌人要害。', eroticDescription: '使用者将灵气灌注于剑身，剑刃变得滚烫并发出微光。他不会攻击致命部位，而是以一个下流至极的角度，用滚烫的剑身精准地划开敌人的衣带，或直接烙在对方的敏感肌肤上，留下屈辱的印记。', mechanicsDescription: '造成115%攻击力的物理伤害。', cost: 15, genderLock: 'Male' };
const skill2: Skill = { id: 's2', name: '岩山盾', rarity: '优品', description: '凝聚大地精华，化为坚不可摧的护盾。', eroticDescription: '使用者双腿大开，阳刚的灵力贯入大地。一面粗糙的石盾拔地而起，护在身前。石盾表面并非光滑，而是布满了大小不一、形似男性阳具的狰狞凸起，任何攻击都会被这些“石根”顶回去，充满了挑衅与羞辱的意味。', mechanicsDescription: '提升自身30%防御力，持续3回合。', cost: 20, genderLock: 'Male' };
const skill3: Skill = { id: 's3', name: '凤火术', rarity: '良品', description: '操控如凤凰般华丽的火焰，焚烧敌人。', eroticDescription: '使用者媚眼如丝，扭动腰肢，双腿之间竟喷射出一股灼热的粉红色火焰。这火焰不仅烧灼敌人的肉体，更散发出浓郁的催情香气，让敌人在痛苦与欲望的双重折磨中意志崩溃。', mechanicsDescription: '造成105%攻击力的火焰伤害，并施加[灼烧]效果（每回合损失5%最大生命值），持续2回合。', cost: 18, genderLock: 'Female' };
const skill4: Skill = { id: 's4', name: '九尾幻术', rarity: '优品', description: '九尾狐一族的血脉天赋，能制造足以乱真的淫靡幻境。', eroticDescription: '使用者身后九条毛茸茸的狐尾如灵蛇般伸出，不由分说地将敌人紧紧缠绕。狐尾的尖端精准地找到并搔刮着对方最敏感的部位，同时释放出强烈的幻术灵力，使其瞬间堕入被无数触手和巨根轮番侵犯的淫乱幻觉之中，彻底丧失战意。', mechanicsDescription: '有60%几率使敌人[混乱]（无法行动），持续1回合。', cost: 25, genderLock: 'Female' };
const universalSkill1: Skill = { id: 'us1', name: '灵气回复', rarity: '凡品', description: '恢复少量真元。', eroticDescription: '使用者开始娇喘，通过模拟性高潮的方式快速聚集周围的灵气，补充自身。', mechanicsDescription: '恢复25点真元。', cost: 0, genderLock: 'Universal' };
const universalSkill2: Skill = { id: 'us2', name: '基础拳法', rarity: '凡品', description: '造成少量物理伤害。', eroticDescription: '看似普通的拳法，但每一拳都精准地打向敌人的下体，试图造成最直接的痛苦和羞辱。', mechanicsDescription: '造成100%攻击力的物理伤害。', cost: 10, genderLock: 'Universal' };
const heavenlyStrike: Skill = { id: 'us3', name: '天雷击', rarity: '珍品', description: '引动九天神雷，对敌人造成巨大伤害。', eroticDescription: '使用者高举双手，召唤一道粗大的紫色闪电，闪电如一条巨龙般从天而降，精准地贯穿敌人的身体，使其浑身抽搐，口吐白沫。', mechanicsDescription: '造成220%攻击力的雷电伤害，但自身[虚弱]（攻击力降低20%），持续2回合。', cost: 45, genderLock: 'Male' };
const phoenixRebirth: Skill = { id: 'us4', name: '凤凰涅槃', rarity: '绝品', description: '濒死时有几率浴火重生。', eroticDescription: '在死亡的瞬间，使用者全身衣物被火焰烧尽，赤裸的身体在烈火中重塑，发出诱人的呻吟，以更完美、更淫荡的姿态重生。', mechanicsDescription: '气血低于15%时，有35%几率恢复60%最大气血。一场战斗只能触发一次。', cost: 100, genderLock: 'Female' };
const myriadSwords: Skill = { id: 'us5', name: '万剑归宗', rarity: '圣品', description: '传说中的至高剑诀，万千剑影合而为一，斩断因果。', eroticDescription: '万千由灵气构成的阳具形剑影从天而降，将敌人包围、穿刺、蹂躏，直到其精神和肉体都彻底屈服。', mechanicsDescription: '对敌方全体造成150%攻击力的物理伤害。', cost: 150, genderLock: 'Male' };

export const SKILL_POOL: Skill[] = [universalSkill1, universalSkill2, heavenlyStrike, phoenixRebirth, skill1, skill2, skill3, skill4, myriadSwords];

// 示例装备
const basicSword: Equipment = {
    id: 'e1', name: '破瓜之刃', type: 'Weapon', rarity: '凡品', description: '一把粗糙的铁剑，剑柄被设计成阳具的形状，据说能轻易划破处女的衣物。', stats: { attack: 5 }
};
const basicRobes: Equipment = {
    id: 'e2', name: '开裆学徒袍', type: 'Armor', rarity: '凡品', description: '一件普通的学徒袍，但裆部被故意剪开，方便随时随地进行“修炼”。', stats: { hp: 15, defense: 3 }
};
const speedAmulet: Equipment = {
    id: 'e3', name: '催情淫纹', type: 'Accessory', rarity: '良品', description: '一道刻在小腹上的淫纹，能让佩戴者在战斗中感到持续的性快感，从而身法更“灵活”。', stats: { speed: 8 }
};
const spiritArmor: Equipment = {
    id: 'e4', name: '乳钉龟甲', type: 'Armor', rarity: '珍品', description: '仅能遮住胸前两点的龟甲胸罩，上面穿有乳环，每次受到攻击都会拉扯乳头，带来痛并快乐的刺激。', stats: { hp: 80, defense: 35 }
};
const soulPendant: Equipment = {
    id: 'e5', name: '淫魔的项圈', type: 'Accessory', rarity: '优品', description: '一个刻有堕落符文的项圈，戴上它的人会不自觉地散发出邀请交媾的骚媚气息。', stats: { critRate: 0.08, critDmg: 0.15 }
};
const divineSword: Equipment = {
    id: 'e6', name: '贯穿神女之枪', type: 'Weapon', rarity: '仙品', description: '传说中曾让仙界圣女高潮迭起的长枪，枪头刻满了能刺激G点的咒文。', stats: { attack: 80, critRate: 0.10 }
};
const saintlyArmor: Equipment = {
    id: 'e7', name: '绝对露出圣铠', type: 'Armor', rarity: '圣品', description: '一套看似华丽的铠甲，但其设计巧妙，无论从哪个角度看，都会不经意地露出穿戴者的私密部位。', stats: { hp: 200, defense: 50, speed: -10 }
};
const softSword: Equipment = {
    id: 'e8', name: '触手软鞭', type: 'Weapon', rarity: '良品', description: '如章鱼触手般柔软而灵活的鞭子，鞭身上布满吸盘，能缠住敌人并带来异样的快感。', stats: { attack: 8, speed: 4 }
};
const rainbowRobes: Equipment = {
    id: 'e9', name: '全透明霓裳', type: 'Armor', rarity: '优品', description: '一件完全透明的仙衣，唯一的遮挡是在私处绣了一朵若隐若现的莲花，引人遐想。', stats: { hp: 40, defense: 12, speed: 3 }
};
const moonlightHairpin: Equipment = {
    id: 'e10', name: '自慰月华簪', type: 'Accessory', rarity: '珍品', description: '一根能根据主人意念震动的发簪，既是饰品，也是方便的自慰工具，佩戴者可随时享受快感。', stats: { critRate: 0.03, speed: 10 }
};


export const EQUIPMENT_POOL: Equipment[] = [basicSword, basicRobes, speedAmulet, spiritArmor, soulPendant, divineSword, saintlyArmor, softSword, rainbowRobes, moonlightHairpin];

export const POSITIONS: Record<string, { name: string; shop: ShopType; requiredAttr: 'charm' | 'skillfulness' | 'perception' | 'attack' | 'defense' | 'speed' }> = {
  // 青楼
  'p_brothel_star': { name: '头牌花魁', shop: '青楼', requiredAttr: 'charm' },
  'p_brothel_tutor': { name: '双修导师', shop: '青楼', requiredAttr: 'skillfulness' },
  'p_brothel_guard': { name: '护卫', shop: '青楼', requiredAttr: 'defense' },
  // 角斗场
  'p_arena_gladiator': { name: '明星角斗士', shop: '角斗场', requiredAttr: 'attack' },
  'p_arena_host': { name: '主持人', shop: '角斗场', requiredAttr: 'charm' },
  'p_arena_trader': { name: '奴隶商人', shop: '角斗场', requiredAttr: 'skillfulness' },
  // 炼丹房
  'p_alchemy_chief': { name: '首席炼丹师', shop: '炼丹房', requiredAttr: 'perception' },
  'p_alchemy_apprentice': { name: '药童', shop: '炼丹房', requiredAttr: 'speed' },
  // 拍卖行
  'p_auction_master': { name: '首席拍卖师', shop: '拍卖行', requiredAttr: 'charm' },
  'p_auction_appraiser': { name: '鉴宝师', shop: '拍卖行', requiredAttr: 'perception' },
  // 情报阁
  'p_intel_chief': { name: '情报头子', shop: '情报阁', requiredAttr: 'perception' },
  'p_intel_assassin': { name: '暗杀者', shop: '情报阁', requiredAttr: 'attack' },
};

// 示例角色卡牌
export const maleChar: CharacterCard = {
    id: 'c1',
    name: '夜宸',
    gender: 'Male',
    realm: '筑基期',
    rarity: '珍品',
    title: '暗影中的低语者',
    race: '魔族',
    origin: '来自魔界与人界交汇的阴影之地，是梦魇与人类的混血。他加入宗门的目的无人知晓，只为寻找能满足他特殊“食欲”的灵魂。',
    appearance: '他总是穿着一件能遮蔽身形的黑色斗篷，兜帽下只能看到一双闪烁着紫色幽光的眼睛和苍白的嘴唇。当他施法时，斗篷下会伸出数条由纯粹暗影构成的触手，这些触手表面光滑湿润，顶端带有能吸食他人精神能量的吸盘。',
    charm: 88,
    skillfulness: 70,
    perception: 80,
    baseAttributes: { hp: 110, maxHp: 110, mp: 60, maxMp: 60, attack: 20, defense: 10, speed: 16, critRate: 0.12, critDmg: 1.6 },
    skills: [
        { id: 's5', name: '暗影触手', rarity: '良品', description: '从阴影中召唤触手束缚敌人。', eroticDescription: '数条冰冷滑腻的暗影触手从地面钻出，无视所有护甲，直接缠绕上敌人的四肢和腰腹，并强行钻入其衣物内，在其最敏感的部位游走、抚弄，使其因强烈的快感和恐惧而无法动弹。', mechanicsDescription: '对单个敌人造成80%攻击力的暗影伤害，并有70%几率使其【束缚】（无法行动），持续1回合。', cost: 20, genderLock: 'Male' },
        { id: 's6', name: '精神侵蚀', rarity: '优品', description: '用魔音侵蚀敌人的心智。', eroticDescription: '夜宸发出只有目标能听到的、充满魅惑的魔音低语。这声音会直接在敌人脑海中响起，不断放大其内心最深处的淫欲，让其产生被无数人轮番侵犯的幻觉，最终精神崩溃，任人宰割。', mechanicsDescription: '对单个敌人造成精神冲击，使其【混乱】（无法行动）并【易伤】（受到的伤害增加20%），持续2回合。', cost: 35, genderLock: 'Male' },
        null,
        null
    ],
    equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
    pet: null
};

export const femaleChar: CharacterCard = {
    id: 'c2',
    name: '灵月',
    gender: 'Female',
    realm: '筑基期',
    rarity: '珍品',
    title: '天生媚骨骚货',
    race: '妖族',
    origin: '九尾天狐的后裔，为寻求突破血脉的桎梏而加入了修仙宗门。',
    appearance: '她从不穿乳罩和内裤，仅仅套着一件薄如蝉翼的纱裙。一对硕大的乳房随着她的走动剧烈地晃动，深色的乳头清晰可见。裙下光洁一片，饱满的阴唇轮廓分明。她天生淫荡，体内媚药过剩，导致私处时刻湿润，甚至会在走路时留下淡淡的骚味痕迹。',
    charm: 95,
    skillfulness: 80,
    perception: 60,
    baseAttributes: { hp: 100, maxHp: 100, mp: 70, maxMp: 70, attack: 15, defense: 10, speed: 18, critRate: 0.15, critDmg: 1.6 },
    skills: [skill3, skill4, null, null],
    equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
    pet: null
};

const maleChar2: CharacterCard = {
    id: 'c3',
    name: '石毅',
    gender: 'Male',
    realm: '金丹期',
    rarity: '优品',
    title: '不动山王',
    race: '人族',
    origin: '天生神力，以炼体为主，肉身坚不可摧。',
    charm: 30,
    skillfulness: 40,
    perception: 45,
    baseAttributes: { hp: 180, maxHp: 180, mp: 40, maxMp: 40, attack: 14, defense: 25, speed: 10, critRate: 0.05, critDmg: 1.5 },
    skills: [skill2, skill1, null, null],
    equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
    pet: null
};

const femaleChar2: CharacterCard = {
    id: 'c4',
    name: '苏媚',
    gender: 'Female',
    realm: '筑基期',
    rarity: '优品',
    title: '百花仙子',
    race: '人族',
    origin: '精通治疗与辅助法术，是队伍中可靠的后盾。',
    charm: 85,
    skillfulness: 70,
    perception: 65,
    baseAttributes: { hp: 95, maxHp: 95, mp: 80, maxMp: 80, attack: 12, defense: 14, speed: 16, critRate: 0.08, critDmg: 1.5 },
    skills: [skill4, skill3, null, null],
    equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
    pet: null
};

const maleChar3: CharacterCard = {
    id: 'c5',
    name: '龙傲天',
    gender: 'Male',
    realm: '元婴期',
    rarity: '仙品',
    title: '天命之子',
    race: '神族',
    origin: '上古神族后裔，血脉中蕴含着毁天灭地的力量。',
    charm: 80,
    skillfulness: 85,
    perception: 90,
    baseAttributes: { hp: 250, maxHp: 250, mp: 120, maxMp: 120, attack: 40, defense: 25, speed: 22, critRate: 0.2, critDmg: 2.0 },
    skills: [skill1, skill3, null, null], // Placeholder
    equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
    pet: null
};

const commonChar: CharacterCard = {
    id: 'c6',
    name: '张三',
    gender: 'Male',
    realm: '炼气期',
    rarity: '凡品',
    title: '外门弟子',
    race: '人族',
    origin: '普通的宗门外门弟子。',
    charm: 40,
    skillfulness: 30,
    perception: 35,
    baseAttributes: { hp: 80, maxHp: 80, mp: 40, maxMp: 40, attack: 10, defense: 8, speed: 12, critRate: 0.05, critDmg: 1.5 },
    skills: [skill1, universalSkill2, null, null],
    equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
    pet: null
};

const divineEmpress: CharacterCard = {
    id: 'c7',
    name: '九天玄女',
    gender: 'Female',
    realm: '化神期',
    rarity: '神品',
    title: '天道化身',
    race: '神族',
    origin: '自天地初开时诞生的先天神灵，掌管着天道法则，威严而又神秘。',
    charm: 99,
    skillfulness: 99,
    perception: 99,
    baseAttributes: { hp: 400, maxHp: 400, mp: 250, maxMp: 250, attack: 60, defense: 40, speed: 30, critRate: 0.3, critDmg: 2.5 },
    skills: [heavenlyStrike, phoenixRebirth, null, null], // using existing high-tier skills as placeholders
    equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
    pet: null
};

export const CHARACTER_POOL: CharacterCard[] = [maleChar, femaleChar, maleChar2, femaleChar2, maleChar3, commonChar, divineEmpress];
export const LIMITED_POOL_FEATURED_CHARS: string[] = ['c7', 'c5']; // 九天玄女 and 龙傲天
export const LIMITED_POOL_FEATURED_EQUIPMENT: string[] = ['e6', 'e7']; // 诛仙剑 and 昊天宝甲
export const LIMITED_POOL_FEATURED_SKILLS: string[] = ['us4', 'us5']; // 凤凰涅槃 and 万剑归宗

// 示例兽宠
export const examplePet: PetCard = {
    id: 'pet1',
    name: '寻宝狐',
    gender: 'Female',
    rarity: '珍品',
    description: '一只对宝物有敏锐嗅觉的灵狐，据说能带领主人找到稀世珍宝。',
    skill: {
        id: 'ps1',
        name: '灵狐探宝',
        rarity: '珍品',
        description: '寻宝狐发出一声娇媚的叫声，为你指出宝物的方向。',
        eroticDescription: '寻宝狐跳到主人怀里，用毛茸茸的尾巴轻扫主人的脸颊，同时发出一阵阵勾魂的媚叫，让人心神荡漾。',
        mechanicsDescription: '在探索中，有20%的几率额外发现一件物品或少量灵石。',
        cost: 0,
        genderLock: 'Universal'
    }
};

export const malePet: PetCard = {
    id: 'pet2',
    name: '霸天虎',
    gender: 'Male',
    rarity: '珍品',
    description: '拥有上古白虎血脉的灵兽，性格霸道，破坏力惊人。',
    skill: {
        id: 'ps2',
        name: '虎啸山林',
        rarity: '珍品',
        description: '发出一声震慑心魄的虎啸。',
        eroticDescription: '雄浑的虎啸声中夹杂着低沉的喘息，能唤起周围生物最原始的交配欲望，使其臣服于霸天虎的雄威之下。',
        mechanicsDescription: '战斗开始时，有30%几率使敌方全体【恐惧】（攻击力降低15%），持续2回合。',
        cost: 0,
        genderLock: 'Universal'
    }
};

export const femalePet: PetCard = {
    id: 'pet3',
    name: '幻梦蝶',
    gender: 'Female',
    rarity: '珍品',
    description: '翅膀上带有迷幻花纹的灵蝶，能编织出以假乱真的幻境。',
    skill: {
        id: 'ps3',
        name: '蝶恋花',
        rarity: '珍品',
        description: '散播能引人入梦的花粉。',
        eroticDescription: '煽动翅膀，洒下闪着春光的催情花粉，闻到花粉的生物会立刻陷入最淫靡的春梦之中，任人摆布。',
        mechanicsDescription: '探索时，有15%的几率使你避开一次负面事件。',
        cost: 0,
        genderLock: 'Universal'
    }
};

export const PET_POOL: PetCard[] = [examplePet, malePet, femalePet];

export const CARD_SELL_PRICES: Record<Rarity, number> = {
    '凡品': 10,
    '良品': 50,
    '优品': 150,
    '珍品': 500,
    '绝品': 1500,
    '仙品': 5000,
    '圣品': 15000,
    '神品': 50000,
};

const initialPlayerArenaRank: ArenaRank = {
    tier: '黄铜',
    division: 'III',
    points: 1250,
    tierIcon: '🥉'
};

import { LeaderboardEntry } from './types';

// Helper function to generate a random integer within a range
const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to generate a leaderboard with 20 random entries
const generateLeaderboard = (characterPool: CharacterCard[], count: number): LeaderboardEntry[] => {
    const leaderboard: LeaderboardEntry[] = [];
    const usedCharacterIds = new Set<string>();

    // Add the player's character to avoid duplication issues if they are in the pool
    // This is a placeholder, assuming the player character might be in the pool.
    // In a real scenario, you might want to explicitly exclude the player.
    
    while (leaderboard.length < count && usedCharacterIds.size < characterPool.length) {
        const randomCharacter = characterPool[getRandomInt(0, characterPool.length - 1)];

        if (!usedCharacterIds.has(randomCharacter.id)) {
            const points = getRandomInt(1000, 6000); // Random points between 1000 and 6000
            leaderboard.push({
                rank: 0, // Placeholder, will be updated after sorting
                name: randomCharacter.name,
                faction: '青蛇宗', // Default faction
                points: points,
                characterId: randomCharacter.id,
            });
            usedCharacterIds.add(randomCharacter.id);
        }
    }

    // Sort by points descending and assign ranks
    return leaderboard
        .sort((a, b) => b.points - a.points)
        .map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
};

const initialLeaderboards: Leaderboards = {
    '宗门排行榜': {
        '总榜': generateLeaderboard(CHARACTER_POOL, 20),
        '核心弟子': generateLeaderboard(CHARACTER_POOL.filter(c => ['仙品', '圣品', '神品'].includes(c.rarity)), 20),
        '内门弟子': generateLeaderboard(CHARACTER_POOL.filter(c => ['珍品', '绝品'].includes(c.rarity)), 20),
        '外门弟子': generateLeaderboard(CHARACTER_POOL.filter(c => ['优品', '良品'].includes(c.rarity)), 20),
        '杂役弟子': generateLeaderboard(CHARACTER_POOL.filter(c => c.rarity === '凡品'), 20),
    },
    '野榜': generateLeaderboard(CHARACTER_POOL, 20),
    '区域榜': generateLeaderboard(CHARACTER_POOL, 20),
    '世界榜': generateLeaderboard(CHARACTER_POOL, 20),
};

// 示例囚犯 - 使用角色卡牌作为基础
const bloodDemonCharacter: CharacterCard = {
    id: 'prisoner-char-01',
    name: '血影魔君',
    gender: 'Male',
    realm: '元婴期',
    rarity: '绝品',
    title: '血煞魔头',
    race: '魔族',
    origin: '血煞门叛徒，因屠杀无辜村民被捕',
    appearance: '一身黑衣，双目血红，周身缠绕着淡淡的血煞之气',
    charm: 45,
    skillfulness: 75,
    perception: 60,
    baseAttributes: { hp: 280, maxHp: 280, mp: 120, maxMp: 120, attack: 45, defense: 28, speed: 22, critRate: 0.18, critDmg: 1.8 },
    skills: [skill1, skill2, null, null],
    equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
    pet: null
};

export const examplePrisoner = {
    character: bloodDemonCharacter,
    crime: '屠杀无辜村民，吸取血气修炼魔功',
    sentence: 100,
    remainingDays: 100,
    submissionLevel: 20,
    loyaltyLevel: 5,
    health: 85,
    sanity: 90,
    location: '居住区' as const,
    cellType: '单独囚室' as const,
    value: {
        ransom: 50000,
        labor: 3000,
        intelligence: 8000
    },
    status: ['健康' as const],
    history: [],
    knownInformation: [],
    potentialInformation: ['血煞门总坛位置', '魔功修炼秘法', '其他魔道同伙'],
    imprisonedDate: '第一天',
    realImprisonedTime: Date.now()
};

// 初始游戏状态
export const initialGameState: GameState = {
  mode: 'exploration',
  exploration: {
    story: "在这个充满欲望与力量的修仙世界，实力并非唯一的主宰，潜藏在灵气之下的原始本能同样搅动着风云。你，一个身怀异禀的新进弟子，踏入了以双修和媚术闻名的青蛇宗。在这里，强大的修士们不仅追求通天修为，更沉溺于极致的肉体欢愉。宗门之内，师兄师姐们的关系错综复杂，每一次“切磋”都可能是一场香汗淋漓的征服。你将如何在这条充满诱惑与危险的道路上立足？是成为他人胯下的玩物，还是将所有人都变成你自己的禁脔？你的淫乱仙途，现在开始。",
    location: "青蛇宗山门",
    time: "第一天，清晨",
    choices: ["向守门弟子介绍自己。", "寻找登记处。", "探索外门庭院。"],
    pendingChallenge: null,
  },
  playerProfile: {
    name: '天选者',
    title: '新进弟子',
    relationships: [
        {
            id: 'c2',
            name: '灵月',
            avatar: 'path/to/lingyue-avatar.png',
            relationshipStatus: '熟人',
            relationshipTags: ['同门', '初识'],
            favorability: 10,
            description: '在宗门初识，似乎对你有些好奇。'
        },
        {
            id: 'c1',
            name: '风逸',
            avatar: 'path/to/fengyi-avatar.png',
            relationshipStatus: '熟人',
            relationshipTags: ['师兄', '剑修'],
            favorability: 25,
            description: '一位冷峻的师兄，剑法高超。'
        },
        {
            id: 'c3',
            name: '石毅',
            avatar: 'path/to/shiyi-avatar.png',
            relationshipStatus: '陌生人',
            relationshipTags: ['炼体修士'],
            favorability: 0,
            description: '一个看起来很强壮的修士，但你们还没说过话。'
        }
    ],
    spiritStones: 1000,
    maleParty: [maleChar],
    femaleParty: [],
    cardCollection: [maleChar, femaleChar],
    equipmentInventory: [basicSword, basicRobes, speedAmulet],
    petCollection: [malePet, femalePet],
    universalSkills: [universalSkill1, universalSkill2],
    arenaRank: initialPlayerArenaRank,
    reputation: {
        score: 0,
        level: '默默无闻',
        dynamicTitles: [],
        greatestDeeds: [],
        title: '',
        goodDeeds: [],
        badDeeds: [],
        lewdDeeds: [],
        history: [],
    },
    quests: [
        {
            id: 'main_01',
            title: '【主线】初入山门',
            description: '你站在青蛇宗的山门前，一位心怀壮志的新进弟子。首先，你需要向宗门报到。',
            category: 'Main',
            status: 'In Progress',
            objectives: [
                { id: 'obj1', description: '与守门弟子交谈', isCompleted: false, targetCount: 1, currentCount: 0 },
                { id: 'obj2', description: '在外门登记处完成登记', isCompleted: false, targetCount: 1, currentCount: 0 },
            ],
            rewards: {
                spiritStones: 50,
                reputation: 10,
            }
        }
    ],
    businessDistrict: null,
  },
  leaderboards: initialLeaderboards,
  announcements: {
    sect: [],
    adventure: [],
    world: [],
  },
  hospitalPatients: [],
  bountyBoard: [],
  cultivationPavilion: [
    { slotId: 1, parentA: null, parentB: null, startTime: 0, endTime: 0, status: 'Empty', monitoringLog: [] },
    { slotId: 2, parentA: null, parentB: null, startTime: 0, endTime: 0, status: 'Empty', monitoringLog: [] },
    { slotId: 3, parentA: null, parentB: null, startTime: 0, endTime: 0, status: 'Empty', monitoringLog: [] },
  ],
  prisonSystem: {
    prisoners: [examplePrisoner],
    guards: [],
    facilities: [],
    
    // 新劳役系统
    laborSites: [
      {
        id: 'mine-01',
        type: '矿山',
        name: '青蛇矿脉',
        description: '宗门后山的灵石矿脉',
        maxWorkers: 2,
        workers: []
      },
      {
        id: 'herb-01',
        type: '采药',
        name: '灵药园',
        description: '宗门的药材种植园',
        maxWorkers: 2,
        workers: []
      }
    ],
    materialInventory: [],
    
    // 保留旧系统
    laborTasks: [],
    laborRecords: [],
    
    events: [],
    ransomOffers: [],
    stats: {
      totalPrisoners: 0,
      byArea: {
        '居住区': 0,
        '审讯区': 0,
        '娱乐区': 0,
        '劳役区': 0,
        '管理区': 0,
        '医疗区': 0
      },
      byCellType: {
        '普通牢房': 0,
        '重犯牢房': 0,
        '单独囚室': 0
      },
      avgSubmission: 0,
      avgLoyalty: 0,
      avgHealth: 0,
      totalGuards: 5,
      escapeAttempts: 0,
      successfulEscapes: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0
    },
    config: {
      maxPrisoners: 50,
      dailyFoodCost: 10,
      securityLevel: 5,
      enableAutoInterrogation: false,
      enableAutoLabor: false
    }
  },
  memories: {
    探索: [],
    战斗: [],
    商城: [],
    医馆: [],
    悬赏: [],
    培育: [],
    商业: [],
    声望: [],
    公告: [],
    大牢: [],
    其他: [],
  },
  memorySummaries: {
    探索: { small: [], large: [] },
    战斗: { small: [], large: [] },
    商城: { small: [], large: [] },
    医馆: { small: [], large: [] },
    悬赏: { small: [], large: [] },
    培育: { small: [], large: [] },
    商业: { small: [], large: [] },
    声望: { small: [], large: [] },
    公告: { small: [], large: [] },
    大牢: { small: [], large: [] },
    其他: { small: [], large: [] },
  },
  summarySettings: {
    autoSummaryEnabled: true,
    smallSummaryInterval: 10, // 每10条实时记录生成一次小总结
    largeSummaryInterval: 5,  // 每5条小总结生成一次大总结
    summaryPrompts: {
      small: `你是一个记忆总结助手。请根据以下【{category}】分类的记忆片段，生成一个简洁、连贯、大约100-200字的小总结。总结应提炼关键事件、人物和结果，并以第三人称叙述。请直接输出总结内容，不要包含任何额外的前缀或标题。`,
      large: `你是一个高级记忆分析师。请根据以下多个关于【{category}】的小总结，生成一个全面、深刻、大约200-400字的大总结。这个总结应该识别核心主题、长期影响和人物关系变化，并以宏观视角进行叙述。请直接输出总结内容，不要包含任何额外的前缀或标题。`,
    },
  },
  vectorConfig: defaultVectorConfig,
  etiquetteSystem: DEFAULT_ETIQUETTE_SYSTEM,
  gauntletSystem: createDefaultGauntletSystem(),
};

import { BountyTarget, MedicalRecord } from './types';

export const examplePatient: MedicalRecord = {
    patientId: 'patient-example-01',
    name: '林婉儿',
    gender: 'Female',
    age: 19,
    background: '正道宗门“碧霞宫”的圣女，因偷练禁术而走火入魔，身体产生了奇特的异变。',
    genitalShape: '玉净瓶型蜜穴',
    sexualFeatures: ['圣女体质', '超敏感', '被触碰会不自觉流出爱液'],
    illnessDescription: '所患奇症为“灵欲倒错”。每日正午，体内纯净的灵力会转化为高浓度的淫欲之气，若不与人交合疏导，便会遭受万蚁噬心般的痛苦，同时身体会散发出能令周围所有生物发情的异香。'
};

export const exampleBountyTarget: Omit<BountyTarget, 'id' | 'status'> = {
    name: '九转淫魔',
    character: {
        id: 'bounty-char-example-01',
        name: '九转淫魔',
        gender: 'Male',
        realm: '元婴期',
        rarity: '绝品',
        title: '行走的播种机器',
        race: '魔族',
        origin: '上古淫魔的一缕分魂转世，以吸食女性修士的元阴为修炼法门，实力极强，极度危险。',
        appearance: '外表是俊美妖异的青年，但当他兴奋时，额头会长出魔角，胯下巨物会膨胀到恐怖的尺寸，上面布满了能吸取元阴的倒刺。',
        charm: 92,
        skillfulness: 88,
        perception: 70,
        baseAttributes: { hp: 350, maxHp: 350, mp: 150, maxMp: 150, attack: 55, defense: 30, speed: 25, critRate: 0.25, critDmg: 2.2 },
        skills: [
            { id: 'bs1', name: '魔龙探穴', rarity: '绝品', description: '释放出充满魔气的触手攻击敌人。', eroticDescription: '胯下巨物化为数条灵活的魔气触手，强行钻入敌人的所有孔穴进行蹂躏，吸取其元阴。', mechanicsDescription: '造成180%攻击力的暗影伤害，并恢复造成伤害30%的气血。', cost: 40, genderLock: 'Male' },
            { id: 'bs2', name: '淫魔领域', rarity: '绝品', description: '展开领域，削弱敌人。', eroticDescription: '释放出充满粉色瘴气的领域，领域内的敌人会持续陷入性兴奋状态，双腿发软，战意全无。', mechanicsDescription: '敌方全体攻击力与防御力降低20%，持续3回合。', cost: 60, genderLock: 'Male' },
            null,
            null
        ],
        equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
        pet: null
    },
    specialTrait: '只对处女或元阴未泄的女性修士感兴趣，在与她们战斗时会变得异常强大。',
    locationHint: '似乎在【合欢宗】附近的山脉中寻找新的猎物。',
    trackerId: null,
    startTime: 0,
    endTime: 0,
    trackingLog: null,
    finalOutcome: null,
};