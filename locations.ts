export type LocationType = 'Sect' | 'City' | 'Cave' | 'Mountain' | 'Forest' | 'Plain' | 'River' | 'Sea';
export type Region = '东荒' | '西境' | '南疆' | '北原' | '中州';

export interface Location {
    id: string;
    name: string;
    type: LocationType;
    region: Region;
    x: number; // Using absolute coordinates (e.g., 0-1000) for SVG canvas
    y: number; // Using absolute coordinates (e.g., 0-1000) for SVG canvas
    description: string;
    isMajor: boolean; // Is it a major landmark?
}

export const locations: Location[] = [
    // 东荒 (Lush, full of life and ancient sects) - Top-Left Quadrant
    { id: 'qing_she_zong', name: '青蛇宗', type: 'Sect', region: '东荒', x: 250, y: 300, description: '一切开始的地方，一个中等规模的修仙宗门。', isMajor: true },
    { id: 'bai_hua_gu', name: '百花谷', type: 'Sect', region: '东荒', x: 150, y: 450, description: '以医术和丹药闻名的女性宗门。', isMajor: true },
    { id: 'wan_yao_sen_lin', name: '万妖森林', type: 'Forest', region: '东荒', x: 350, y: 500, description: '妖兽横行，但机遇与危险并存的古老森林。', isMajor: false },
    { id: 'yun_meng_ze', name: '云梦大泽', type: 'River', region: '东荒', x: 100, y: 200, description: '广阔的沼泽地，据说有上古异兽出没。', isMajor: false },

    // 西境 (Desolate, desert, ruins) - Top-Right Quadrant
    { id: 'tian_mo_cheng', name: '天魔城', type: 'City', region: '西境', x: 750, y: 200, description: '魔道修士的聚集地，混乱但自由。', isMajor: true },
    { id: 'huang_gu_yi_ji', name: '荒古遗迹', type: 'Mountain', region: '西境', x: 850, y: 350, description: '上古仙魔大战的战场，散落着无数法宝残片。', isMajor: false },
    { id: 'wu_jian_dong', name: '无间洞府', type: 'Cave', region: '西境', x: 650, y: 450, description: '一个深不见底的洞穴，传闻直通地狱。', isMajor: false },

    // 南疆 (Poisonous, tribal, exotic) - Bottom-Right Quadrant
    { id: 'wu_shen_zhai', name: '巫神寨', type: 'Sect', region: '南疆', x: 600, y: 800, description: '南疆最大的巫蛊部落，神秘莫测。', isMajor: true },
    { id: 'shi_wan_da_shan', name: '十万大山', type: 'Mountain', region: '南疆', x: 750, y: 900, description: '连绵不绝的山脉，充满了毒虫猛兽和天材地宝。', isMajor: false },
    { id: 'du_long_he', name: '毒龙河', type: 'River', region: '南疆', x: 500, y: 700, description: '河水呈诡异的紫色，据说有剧毒。', isMajor: false },

    // 北原 (Icy, desolate, stoic) - Bottom-Left Quadrant (using it this way for simplicity)
    { id: 'xuan_bing_gong', name: '玄冰宫', type: 'Sect', region: '北原', x: 200, y: 850, description: '建立在万年冰川之上的宗门，弟子皆修行冰系功法。', isMajor: true },
    { id: 'ji_bei_xue_yuan', name: '极北雪原', type: 'Plain', region: '北原', x: 100, y: 950, description: '一片冰封的荒原，人迹罕至。', isMajor: false },

    // 中州 (Center of the world, imperial city) - Center
    { id: 'tian_ji_ge', name: '天机阁', type: 'City', region: '中州', x: 500, y: 400, description: '中州皇城，世界的中心，凡人与修士混居。', isMajor: true },
    { id: 'kun_lun_xu', name: '昆仑墟', type: 'Mountain', region: '中州', x: 450, y: 250, description: '传说中仙人居住的圣山，灵气浓郁至极。', isMajor: true },
    { id: 'tian_yuan_fang_shi', name: '天元坊市', type: 'City', region: '中州', x: 550, y: 550, description: '世界上最大的修仙者交易市场。', isMajor: false },
];