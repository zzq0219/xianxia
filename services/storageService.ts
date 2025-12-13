import { IDBPDatabase, openDB } from 'idb';
import { CURRENT_GAME_VERSION } from '../constants';
import { GameState, SaveSlot } from '../types';
import { migrate } from './migrationService';

/**
 * 定义存储服务的统一接口。
 * 任何存储实现（如TavernHelper, IndexedDB, LocalStorage）都应遵循此接口。
 */
export interface IStorageService {
    /**
     * 将存档槽位保存到指定的手动存档槽位。
     * @param slotId 存档槽位ID。
     * @param slotData 要保存的SaveSlot。
     * @returns 一个在保存完成时解析的Promise。
     */
    saveToSlot(slotId: number, slotData: SaveSlot): Promise<void>;

    /**
     * 从指定的手动存档槽位加载游戏状态。
     * @param slotId 存档槽位ID。
     * @returns 一个解析为GameState或null的Promise。
     */
    loadFromSlot(slotId: number): Promise<GameState | null>;

    /**
     * 获取所有手动存档槽位的信息。
     * @returns 一个解析为包含所有存档槽位数据的记录的Promise。
     */
    getAllSaves(): Promise<Record<number, SaveSlot | null>>;

    /**
     * 从指定的手动存档槽位删除存档。
     * @param slotId 存档槽位ID。
     * @returns 一个在删除完成时解析的Promise。
     */
    deleteSlot(slotId: number): Promise<void>;
}

/**
 * 针对TavernHelper API的存储适配器。
 * 封装了原有的tavernService.ts中的函数，使其符合IStorageService接口。
 */
class TavernStorageAdapter implements IStorageService {
    async saveToSlot(slotId: number, slotData: SaveSlot): Promise<void> {
        // 创建完全独立的深拷贝，避免引用污染
        const dataToSave = JSON.parse(JSON.stringify({
            name: slotData.name,
            timestamp: slotData.timestamp, // 使用传入的时间戳，不要修改
            gameState: { ...slotData.gameState, version: CURRENT_GAME_VERSION }
        }));
        
        try {
            await window.TavernHelper.updateVariablesWith(
                (vars) => {
                    if (!vars.xianxiaRpgSaves) {
                        vars.xianxiaRpgSaves = {};
                    }
                    // 保存独立的深拷贝到指定槽位
                    vars.xianxiaRpgSaves[slotId] = dataToSave;
                    return vars;
                },
                { type: 'character' }
            );
        } catch (error) {
            console.error(`TavernAdapter: 保存到槽位 ${slotId} 失败:`, error);
            throw error;
        }
    }

    async loadFromSlot(slotId: number): Promise<GameState | null> {
        try {
            const variables = window.TavernHelper.getVariables({ type: 'character' });
            if (variables && variables.xianxiaRpgSaves && variables.xianxiaRpgSaves[slotId]) {
                const saveSlot = variables.xianxiaRpgSaves[slotId];
                // 兼容旧版本：如果存储的是纯 GameState，则迁移
                if (!saveSlot.name || !saveSlot.timestamp) {
                    return migrate(saveSlot as GameState);
                }
                return migrate(saveSlot.gameState);
            }
            return null;
        } catch (error) {
            console.error(`TavernAdapter: 从槽位 ${slotId} 加载失败:`, error);
            return null;
        }
    }

    async getAllSaves(): Promise<Record<number, SaveSlot | null>> {
        try {
            const variables = window.TavernHelper.getVariables({ type: 'character' });
            const saves = (variables && variables.xianxiaRpgSaves) || {};
            const result: Record<number, SaveSlot | null> = {};
            
            // 只处理实际存在的存档槽位（1-5）
            for (let i = 1; i <= 5; i++) {
                if (saves[i]) {
                    const saveData = saves[i];
                    // 兼容旧版本：如果存储的是纯 GameState，则包装为 SaveSlot
                    if (!saveData.name || !saveData.timestamp) {
                        result[i] = {
                            name: `存档 ${i}`,
                            timestamp: Date.now(),
                            gameState: saveData as GameState
                        };
                    } else {
                        result[i] = saveData as SaveSlot;
                    }
                } else {
                    // 空槽位返回 null，而不是创建空存档
                    result[i] = null;
                }
            }
            
            return Promise.resolve(result);
        } catch (error) {
            console.error("TavernAdapter: 获取所有存档失败:", error);
            return {};
        }
    }

    async deleteSlot(slotId: number): Promise<void> {
        try {
            await window.TavernHelper.updateVariablesWith(
                (vars) => {
                    if (vars.xianxiaRpgSaves && vars.xianxiaRpgSaves[slotId]) {
                        delete vars.xianxiaRpgSaves[slotId];
                    }
                    return vars;
                },
                { type: 'character' }
            );
        } catch (error) {
            console.error(`TavernAdapter: 删除槽位 ${slotId} 失败:`, error);
            throw error;
        }
    }
}

/**
 * 针对IndexedDB API的存储适配器。
 */
class IndexedDBStorageAdapter implements IStorageService {
    private dbPromise: Promise<IDBPDatabase> | null = null;

    private getDb(): Promise<IDBPDatabase> {
        if (!this.dbPromise) {
            this.dbPromise = openDB('xianxia-card-rpg-db', 1, {
                upgrade(db) {
                    if (db.objectStoreNames.contains('autosave')) {
                        db.deleteObjectStore('autosave');
                    }
                    if (!db.objectStoreNames.contains('manual_saves')) {
                        db.createObjectStore('manual_saves');
                    }
                },
            });
        }
        return this.dbPromise;
    }

    saveToSlot = async (slotId: number, slotData: SaveSlot): Promise<void> => {
        const db = await this.getDb();
        const dataToSave = {
            ...slotData,
            gameState: { ...slotData.gameState, version: CURRENT_GAME_VERSION }
        };
        await db.put('manual_saves', dataToSave, slotId);
    }

    loadFromSlot = async (slotId: number): Promise<GameState | null> => {
        const db = await this.getDb();
        const slot = await db.get('manual_saves', slotId);
        if (!slot) return null;
        return migrate(slot.gameState);
    }

    getAllSaves = async (): Promise<Record<number, SaveSlot | null>> => {
        const db = await this.getDb();
        const savesMap: Record<number, SaveSlot | null> = {};
        let cursor = await db.transaction('manual_saves').store.openCursor();
        while (cursor) {
            savesMap[cursor.key as number] = cursor.value;
            cursor = await cursor.continue();
        }
        return savesMap;
    }

    deleteSlot = async (slotId: number): Promise<void> => {
        const db = await this.getDb();
        await db.delete('manual_saves', slotId);
    }
}


// --- 服务工厂 ---

const createStorageService = (): IStorageService => {
    // @ts-ignore
    if (window.TavernHelper) {
        console.log("Storage Service: Using TavernHelper adapter.");
        return new TavernStorageAdapter();
    } else {
        console.log("Storage Service: Using IndexedDB adapter.");
        return new IndexedDBStorageAdapter();
    }
};

/**
 * 导出一个单例的存储服务实例，供整个应用使用。
 */
export const storageService = createStorageService();