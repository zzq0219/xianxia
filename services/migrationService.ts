import { CURRENT_GAME_VERSION } from '../constants';
import { GameState } from '../types';

type Migration = (state: any) => GameState;

// 迁移脚本的注册表
const MIGRATIONS: Record<number, Migration> = {
    // 版本2：记忆系统分类重构
    2: (state) => {
        console.log('迁移记忆系统分类...');
        
        // 旧分类到新分类的映射
        const categoryMapping: Record<string, string> = {
            '问诊': '医馆',
            '交互': '其他',
        };
        
        // 迁移memories
        if (state.memories) {
            const newMemories: any = {
                '探索': state.memories['探索'] || [],
                '战斗': state.memories['战斗'] || [],
                '商城': [],
                '医馆': state.memories['问诊'] || [],
                '悬赏': state.memories['悬赏'] || [],
                '培育': state.memories['培育'] || [],
                '商业': state.memories['商业'] || [],
                '声望': [],
                '公告': [],
                '其他': [...(state.memories['交互'] || []), ...(state.memories['其他'] || [])],
            };
            state.memories = newMemories;
        }
        
        // 迁移memorySummaries
        if (state.memorySummaries) {
            const newSummaries: any = {
                '探索': state.memorySummaries['探索'] || { small: [], large: [] },
                '战斗': state.memorySummaries['战斗'] || { small: [], large: [] },
                '商城': { small: [], large: [] },
                '医馆': state.memorySummaries['问诊'] || { small: [], large: [] },
                '悬赏': state.memorySummaries['悬赏'] || { small: [], large: [] },
                '培育': state.memorySummaries['培育'] || { small: [], large: [] },
                '商业': state.memorySummaries['商业'] || { small: [], large: [] },
                '声望': { small: [], large: [] },
                '公告': { small: [], large: [] },
                '其他': {
                    small: [...(state.memorySummaries['交互']?.small || []), ...(state.memorySummaries['其他']?.small || [])],
                    large: [...(state.memorySummaries['交互']?.large || []), ...(state.memorySummaries['其他']?.large || [])],
                },
            };
            state.memorySummaries = newSummaries;
        }
        
        return state;
    },
};

/**
 * 迁移一个游戏状态对象到当前最新版本。
 * @param state 从存储中加载的原始游戏状态。
 * @returns 一个被迁移到最新版本的GameState对象。
 */
export const migrate = (state: any): GameState => {
    let currentVersion = state.version || 0; // 如果没有版本号，则视为版本0

    // 如果版本已经是最新，则无需迁移
    if (currentVersion === CURRENT_GAME_VERSION) {
        return state as GameState;
    }

    console.log(`Migrating save data from version ${currentVersion} to ${CURRENT_GAME_VERSION}...`);

    let migratedState = { ...state };

    // 按顺序应用所有必要的迁移脚本
    for (let v = currentVersion + 1; v <= CURRENT_GAME_VERSION; v++) {
        const migrationFunc = MIGRATIONS[v];
        if (migrationFunc) {
            migratedState = migrationFunc(migratedState);
            console.log(`- Applied migration for version ${v}`);
        }
    }

    // 更新到最终版本号
    migratedState.version = CURRENT_GAME_VERSION;

    console.log("Migration complete.");
    return migratedState as GameState;
};