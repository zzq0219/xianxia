export type LocationType = 'Sect' | 'City' | 'Cave' | 'Mountain' | 'Forest' | 'Plain' | 'River' | 'Sea' | 'Prison' | 'Palace';
export type Region = '东荒' | '西境' | '南疆' | '北原' | '中州';
export type Realm = '天界' | '人界' | '冥界';

export interface Location {
    id: string;
    name: string;
    type: LocationType;
    region: Region;
    realm: Realm; // 新增：所属界面
    x: number;
    y: number;
    description: string;
    isMajor: boolean;
}

export const locations: Location[] = [
    // ========== 天界 ==========
    // 仙山、仙宫、圣地
    { 
        id: 'kun_lun_xu', 
        name: '昆仑墟', 
        type: 'Mountain', 
        region: '中州', 
        realm: '天界',
        x: 500, 
        y: 300, 
        description: '传说中仙人居住的圣山，灵气浓郁至极，直通九天。', 
        isMajor: true 
    },
    { 
        id: 'tian_gong', 
        name: '天宫', 
        type: 'Palace', 
        region: '中州', 
        realm: '天界',
        x: 600, 
        y: 400, 
        description: '诸天仙神的居所，云雾缭绕，仙乐飘飘。', 
        isMajor: true 
    },
    { 
        id: 'yao_chi', 
        name: '瑶池', 
        type: 'River', 
        region: '东荒', 
        realm: '天界',
        x: 300, 
        y: 450, 
        description: '仙池圣水，据说可洗涤凡尘，获得仙缘。', 
        isMajor: false 
    },
    { 
        id: 'tai_xu_jing', 
        name: '太虚境', 
        type: 'Plain', 
        region: '西境', 
        realm: '天界',
        x: 750, 
        y: 350, 
        description: '虚无缥缈之地，只有得道高人才能进入。', 
        isMajor: false 
    },

    // ========== 人界 ==========
    // 宗门、城市、森林、河流等
    { 
        id: 'qing_she_zong', 
        name: '青蛇宗', 
        type: 'Sect', 
        region: '东荒', 
        realm: '人界',
        x: 250, 
        y: 400, 
        description: '一切开始的地方，一个中等规模的修仙宗门。', 
        isMajor: true 
    },
    { 
        id: 'bai_hua_gu', 
        name: '百花谷', 
        type: 'Sect', 
        region: '东荒', 
        realm: '人界',
        x: 200, 
        y: 600, 
        description: '以医术和丹药闻名的女性宗门。', 
        isMajor: true 
    },
    { 
        id: 'wan_yao_sen_lin', 
        name: '万妖森林', 
        type: 'Forest', 
        region: '东荒', 
        realm: '人界',
        x: 350, 
        y: 700, 
        description: '妖兽横行，但机遇与危险并存的古老森林。', 
        isMajor: false 
    },
    { 
        id: 'yun_meng_ze', 
        name: '云梦大泽', 
        type: 'River', 
        region: '东荒', 
        realm: '人界',
        x: 150, 
        y: 300, 
        description: '广阔的沼泽地，据说有上古异兽出没。', 
        isMajor: false 
    },
    { 
        id: 'tian_ji_ge', 
        name: '天机阁', 
        type: 'City', 
        region: '中州', 
        realm: '人界',
        x: 500, 
        y: 500, 
        description: '中州皇城，世界的中心，凡人与修士混居。', 
        isMajor: true 
    },
    { 
        id: 'tian_yuan_fang_shi', 
        name: '天元坊市', 
        type: 'City', 
        region: '中州', 
        realm: '人界',
        x: 600, 
        y: 650, 
        description: '世界上最大的修仙者交易市场。', 
        isMajor: false 
    },
    { 
        id: 'huang_gu_yi_ji', 
        name: '荒古遗迹', 
        type: 'Mountain', 
        region: '西境', 
        realm: '人界',
        x: 800, 
        y: 400, 
        description: '上古仙魔大战的战场，散落着无数法宝残片。', 
        isMajor: false 
    },
    { 
        id: 'wu_shen_zhai', 
        name: '巫神寨', 
        type: 'Sect', 
        region: '南疆', 
        realm: '人界',
        x: 650, 
        y: 850, 
        description: '南疆最大的巫蛊部落，神秘莫测。', 
        isMajor: true 
    },
    { 
        id: 'shi_wan_da_shan', 
        name: '十万大山', 
        type: 'Mountain', 
        region: '南疆', 
        realm: '人界',
        x: 750, 
        y: 950, 
        description: '连绵不绝的山脉，充满了毒虫猛兽和天材地宝。', 
        isMajor: false 
    },
    { 
        id: 'du_long_he', 
        name: '毒龙河', 
        type: 'River', 
        region: '南疆', 
        realm: '人界',
        x: 550, 
        y: 800, 
        description: '河水呈诡异的紫色，据说有剧毒。', 
        isMajor: false 
    },
    { 
        id: 'xuan_bing_gong', 
        name: '玄冰宫', 
        type: 'Sect', 
        region: '北原', 
        realm: '人界',
        x: 250, 
        y: 950, 
        description: '建立在万年冰川之上的宗门，弟子皆修行冰系功法。', 
        isMajor: true 
    },
    { 
        id: 'ji_bei_xue_yuan', 
        name: '极北雪原', 
        type: 'Plain', 
        region: '北原', 
        realm: '人界',
        x: 150, 
        y: 1050, 
        description: '一片冰封的荒原，人迹罕至。', 
        isMajor: false 
    },

    // ========== 冥界 ==========
    // 监狱、魔域、地府等
    { 
        id: 'zhen_yu_da_lao', 
        name: '镇狱大牢', 
        type: 'Prison', 
        region: '中州', 
        realm: '冥界',
        x: 500, 
        y: 400, 
        description: '中州皇城地下的巨型监狱，关押着各方罪犯和重要俘虏。阴森恐怖，传闻有去无回。', 
        isMajor: true 
    },
    { 
        id: 'tian_mo_cheng', 
        name: '天魔城', 
        type: 'City', 
        region: '西境', 
        realm: '冥界',
        x: 750, 
        y: 300, 
        description: '魔道修士的聚集地，混乱但自由，位于地下深渊。', 
        isMajor: true 
    },
    { 
        id: 'wu_jian_dong', 
        name: '无间洞府', 
        type: 'Cave', 
        region: '西境', 
        realm: '冥界',
        x: 650, 
        y: 500, 
        description: '一个深不见底的洞穴，传闻直通地狱最深处。', 
        isMajor: false 
    },
    { 
        id: 'huang_quan_lu', 
        name: '黄泉路', 
        type: 'River', 
        region: '中州', 
        realm: '冥界',
        x: 400, 
        y: 600, 
        description: '亡魂必经之路，河水漆黑如墨，散发着死亡气息。', 
        isMajor: false 
    },
    { 
        id: 'wang_chuan_he', 
        name: '忘川河', 
        type: 'River', 
        region: '东荒', 
        realm: '冥界',
        x: 250, 
        y: 700, 
        description: '饮下忘川水，忘却前尘往事。', 
        isMajor: false 
    },
    { 
        id: 'sen_luo_dian', 
        name: '森罗殿', 
        type: 'Palace', 
        region: '中州', 
        realm: '冥界',
        x: 600, 
        y: 450, 
        description: '地府阎罗的议事大殿，审判生前罪孽。', 
        isMajor: true 
    },
];

// 按界面分组的辅助函数
export const getLocationsByRealm = (realm: Realm): Location[] => {
    return locations.filter(loc => loc.realm === realm);
};

// 获取所有界面
export const realms: Realm[] = ['天界', '人界', '冥界'];