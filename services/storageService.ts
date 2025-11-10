import { GameState, SaveSlot } from '../types';
import * as tavernService from './tavernService';
import { openDB, IDBPDatabase } from 'idb';
import { migrate } from './migrationService';
import { CURRENT_GAME_VERSION } from '../constants';

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
}

/**
 * 针对TavernHelper API的存储适配器。
 * 封装了原有的tavernService.ts中的函数，使其符合IStorageService接口。
 */
class TavernStorageAdapter implements IStorageService {
    async saveToSlot(slotId: number, slotData: SaveSlot): Promise<void> {
        // Tavern service doesn't support metadata, so we just save the game state.
        const stateToSave = { ...slotData.gameState, version: CURRENT_GAME_VERSION };
        return tavernService.saveGameToSlot(stateToSave, slotId);
    }

    async loadFromSlot(slotId: number): Promise<GameState | null> {
        const loadedState = tavernService.loadGameFromSlot(slotId);
        if (!loadedState) return null;
        return Promise.resolve(migrate(loadedState));
    }

    async getAllSaves(): Promise<Record<number, SaveSlot | null>> {
        const allSaves = tavernService.getAllSaves();
        const result: Record<number, SaveSlot | null> = {};
        for (const key in allSaves) {
            const gameState = allSaves[key];
            if (gameState) {
                result[key] = {
                    name: `存档 ${key}`,
                    timestamp: Date.now(), // Placeholder timestamp
                    gameState: gameState
                };
            }
        }
        return Promise.resolve(result);
    }
}

/**
 * 针对IndexedDB API的存储适配器。
 */
class IndexedDBStorageAdapter implements IStorageService {
    private dbPromise: Promise<IDBPDatabase>;

    constructor() {
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

    async saveToSlot(slotId: number, slotData: SaveSlot): Promise<void> {
        const db = await this.dbPromise;
        const dataToSave = {
            ...slotData,
            gameState: { ...slotData.gameState, version: CURRENT_GAME_VERSION }
        };
        await db.put('manual_saves', dataToSave, slotId);
    }

    async loadFromSlot(slotId: number): Promise<GameState | null> {
        const db = await this.dbPromise;
        const slot = await db.get('manual_saves', slotId);
        if (!slot) return null;
        return migrate(slot.gameState);
    }

    async getAllSaves(): Promise<Record<number, SaveSlot | null>> {
        const db = await this.dbPromise;
        const allSaves = await db.getAll('manual_saves');
        const savesMap: Record<number, SaveSlot | null> = {};
        
        const keys = await db.getAllKeys('manual_saves');
        for (let i = 0; i < keys.length; i++) {
            savesMap[keys[i] as number] = allSaves[i];
        }
        return savesMap;
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