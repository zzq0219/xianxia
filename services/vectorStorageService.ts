import { MemoryCategory, VectorizedMemoryEntry, VectorStoreStats } from '../types';

/**
 * 向量存储服务
 * 使用IndexedDB存储和管理向量数据
 */
export class VectorStorageService {
  private dbName = 'XianxiaVectorStore';
  private version = 1;
  private storeName = 'vectors';
  private db: IDBDatabase | null = null;

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('无法打开IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          
          // 创建索引
          objectStore.createIndex('memoryId', 'memoryId', { unique: true });
          objectStore.createIndex('category', 'category', { unique: false });
          objectStore.createIndex('created', 'created', { unique: false });
          objectStore.createIndex('realTimestamp', 'metadata.realTimestamp', { unique: false });
        }
      };
    });
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error('数据库未初始化');
    }
    return this.db;
  }

  /**
   * 保存单个向量
   */
  async saveVector(vector: VectorizedMemoryEntry): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.put(vector);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('保存向量失败'));
    });
  }

  /**
   * 批量保存向量
   */
  async saveBatchVectors(vectors: VectorizedMemoryEntry[]): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);

      let completed = 0;
      let hasError = false;

      for (const vector of vectors) {
        const request = objectStore.put(vector);
        
        request.onsuccess = () => {
          completed++;
          if (completed === vectors.length && !hasError) {
            resolve();
          }
        };

        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(new Error(`保存向量失败: ${vector.id}`));
          }
        };
      }

      if (vectors.length === 0) {
        resolve();
      }
    });
  }

  /**
   * 根据ID获取向量
   */
  async getVectorById(id: string): Promise<VectorizedMemoryEntry | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('获取向量失败'));
      };
    });
  }

  /**
   * 根据记忆ID获取向量
   */
  async getVectorByMemoryId(memoryId: string): Promise<VectorizedMemoryEntry | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const index = objectStore.index('memoryId');
      const request = index.get(memoryId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('获取向量失败'));
      };
    });
  }

  /**
   * 获取所有向量
   */
  async getAllVectors(): Promise<VectorizedMemoryEntry[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('获取所有向量失败'));
      };
    });
  }

  /**
   * 根据分类获取向量
   */
  async getVectorsByCategory(category: MemoryCategory): Promise<VectorizedMemoryEntry[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const index = objectStore.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('获取分类向量失败'));
      };
    });
  }

  /**
   * 根据时间范围获取向量
   */
  async getVectorsByTimeRange(
    startTime: number,
    endTime: number
  ): Promise<VectorizedMemoryEntry[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const index = objectStore.index('realTimestamp');
      const range = IDBKeyRange.bound(startTime, endTime);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error('获取时间范围向量失败'));
      };
    });
  }

  /**
   * 删除向量
   */
  async deleteVector(id: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除向量失败'));
    });
  }

  /**
   * 批量删除向量
   */
  async deleteBatchVectors(ids: string[]): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);

      let completed = 0;
      let hasError = false;

      for (const id of ids) {
        const request = objectStore.delete(id);
        
        request.onsuccess = () => {
          completed++;
          if (completed === ids.length && !hasError) {
            resolve();
          }
        };

        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(new Error(`删除向量失败: ${id}`));
          }
        };
      }

      if (ids.length === 0) {
        resolve();
      }
    });
  }

  /**
   * 清空所有向量
   */
  async clearAllVectors(): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('清空向量失败'));
    });
  }

  /**
   * 获取向量存储统计
   */
  async getStats(): Promise<VectorStoreStats> {
    const vectors = await this.getAllVectors();
    
    if (vectors.length === 0) {
      return {
        totalVectors: 0,
        byCategory: {
          '探索': 0,
          '战斗': 0,
          '商城': 0,
          '医馆': 0,
          '悬赏': 0,
          '培育': 0,
          '商业': 0,
          '声望': 0,
          '公告': 0,
          '大牢': 0,
          '其他': 0
        },
        oldestVector: 0,
        newestVector: 0,
        averageDimension: 0,
        storageSize: 0
      };
    }

    // 按分类统计
    const byCategory: Record<MemoryCategory, number> = {
      '探索': 0,
      '战斗': 0,
      '商城': 0,
      '医馆': 0,
      '悬赏': 0,
      '培育': 0,
      '商业': 0,
      '声望': 0,
      '公告': 0,
      '大牢': 0,
      '其他': 0
    };

    let totalDimensions = 0;
    let oldestVector = vectors[0].created;
    let newestVector = vectors[0].created;

    for (const vector of vectors) {
      byCategory[vector.category]++;
      totalDimensions += vector.vectorDimension;
      
      if (vector.created < oldestVector) {
        oldestVector = vector.created;
      }
      if (vector.created > newestVector) {
        newestVector = vector.created;
      }
    }

    // 估算存储大小（每个float32约4字节）
    const averageDimension = totalDimensions / vectors.length;
    const storageSize = vectors.reduce((total, vector) => {
      return total + vector.vector.length * 4 + JSON.stringify(vector.metadata).length;
    }, 0);

    return {
      totalVectors: vectors.length,
      byCategory,
      oldestVector,
      newestVector,
      averageDimension,
      storageSize
    };
  }

  /**
   * 检查记忆是否已向量化
   */
  async isMemoryVectorized(memoryId: string): Promise<boolean> {
    const vector = await this.getVectorByMemoryId(memoryId);
    return vector !== null;
  }

  /**
   * 获取未向量化的记忆ID列表
   */
  async getUnvectorizedMemoryIds(memoryIds: string[]): Promise<string[]> {
    const unvectorized: string[] = [];
    
    for (const memoryId of memoryIds) {
      const isVectorized = await this.isMemoryVectorized(memoryId);
      if (!isVectorized) {
        unvectorized.push(memoryId);
      }
    }
    
    return unvectorized;
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/**
 * 导出单例实例
 */
export const vectorStorageService = new VectorStorageService();