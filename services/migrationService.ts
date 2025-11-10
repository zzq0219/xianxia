import { GameState } from '../types';
import { CURRENT_GAME_VERSION } from '../constants';

type Migration = (state: any) => GameState;

// 迁移脚本的注册表
const MIGRATIONS: Record<number, Migration> = {
    // 示例：从版本1迁移到版本2
    // 2: (state) => {
    //   return { ...state, newFeature: 'default value' };
    // },
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