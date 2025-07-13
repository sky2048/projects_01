export class ObjectPool {
    constructor() {
        this.pools = new Map();
    }

    // 创建或获取指定类型的对象池
    getPool(type, createFunc, resetFunc = null, maxSize = 50) {
        if (!this.pools.has(type)) {
            this.pools.set(type, {
                available: [],
                inUse: new Set(),
                createFunc: createFunc,
                resetFunc: resetFunc,
                maxSize: maxSize
            });
        }
        return this.pools.get(type);
    }

    // 从池中获取对象
    get(type, createFunc = null, resetFunc = null, ...args) {
        const pool = this.getPool(type, createFunc, resetFunc);
        
        let obj;
        if (pool.available.length > 0) {
            // 从池中取出对象
            obj = pool.available.pop();
            
            // 重置对象状态
            if (pool.resetFunc) {
                pool.resetFunc(obj, ...args);
            }
        } else {
            // 池为空，创建新对象
            if (pool.createFunc) {
                obj = pool.createFunc(...args);
            } else {
                console.warn(`No create function provided for pool type: ${type}`);
                return null;
            }
        }
        
        pool.inUse.add(obj);
        return obj;
    }

    // 将对象返回到池中
    release(type, obj) {
        const pool = this.pools.get(type);
        if (!pool) {
            console.warn(`Pool not found for type: ${type}`);
            return false;
        }

        if (!pool.inUse.has(obj)) {
            console.warn(`Object not in use, cannot release to pool: ${type}`);
            return false;
        }

        pool.inUse.delete(obj);
        
        // 如果池未满，返回池中；否则销毁对象
        if (pool.available.length < pool.maxSize) {
            pool.available.push(obj);
            
            // 隐藏对象但不销毁
            try {
                if (obj.setVisible) obj.setVisible(false);
                if (obj.setActive) obj.setActive(false);
                // 重置物理体速度（如果存在）
                if (obj.body && obj.body.setVelocity) {
                    obj.body.setVelocity(0, 0);
                }
            } catch (error) {
                console.warn('对象池重置对象状态失败:', error);
                // 如果重置失败，直接销毁对象
                this.destroyObject(obj);
                return false;
            }
        } else {
            // 池已满，销毁对象
            this.destroyObject(obj);
        }
        
        return true;
    }

    // 安全销毁对象的辅助方法
    destroyObject(obj) {
        try {
            if (obj.realDestroy) {
                obj.realDestroy();
            } else if (obj.destroy) {
                obj.destroy();
            }
        } catch (error) {
            console.warn('销毁对象时出错:', error);
        }
    }

    // 清理指定类型的池
    clearPool(type) {
        const pool = this.pools.get(type);
        if (pool) {
            // 销毁所有对象
            [...pool.available, ...pool.inUse].forEach(obj => {
                this.destroyObject(obj);
            });
            
            pool.available = [];
            pool.inUse.clear();
        }
    }

    // 清理所有池
    clearAll() {
        for (const type of this.pools.keys()) {
            this.clearPool(type);
        }
        this.pools.clear();
    }

    // 获取池的统计信息
    getStats(type = null) {
        if (type) {
            const pool = this.pools.get(type);
            if (pool) {
                return {
                    type: type,
                    available: pool.available.length,
                    inUse: pool.inUse.size,
                    maxSize: pool.maxSize,
                    total: pool.available.length + pool.inUse.size
                };
            }
            return null;
        }
        
        // 返回所有池的统计信息
        const stats = {};
        for (const [poolType, pool] of this.pools) {
            stats[poolType] = {
                available: pool.available.length,
                inUse: pool.inUse.size,
                maxSize: pool.maxSize,
                total: pool.available.length + pool.inUse.size
            };
        }
        return stats;
    }

    // 强制垃圾回收（在适当的时候调用）
    forceGarbageCollection() {
        // 清理可能的内存泄漏
        for (const [type, pool] of this.pools) {
            // 检查是否有"死"对象需要清理
            const deadObjects = [...pool.inUse].filter(obj => 
                !obj.active || !obj.scene || obj.scene.scene.isDestroyed()
            );
            
            deadObjects.forEach(obj => {
                console.warn(`清理死对象: ${type}`);
                pool.inUse.delete(obj);
                this.destroyObject(obj);
            });
        }
    }
}

// 全局对象池实例
export const globalObjectPool = new ObjectPool(); 