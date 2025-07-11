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
            return;
        }

        if (pool.inUse.has(obj)) {
            pool.inUse.delete(obj);
            
            // 如果池未满，返回池中；否则销毁对象
            if (pool.available.length < pool.maxSize) {
                pool.available.push(obj);
                
                // 隐藏对象但不销毁
                if (obj.setVisible) obj.setVisible(false);
                if (obj.setActive) obj.setActive(false);
            } else {
                // 池已满，销毁对象
                if (obj.realDestroy) {
                    obj.realDestroy();
                } else if (obj.destroy) {
                    obj.destroy();
                }
            }
        }
    }

    // 清理指定类型的池
    clearPool(type) {
        const pool = this.pools.get(type);
        if (pool) {
            // 销毁所有对象
            [...pool.available, ...pool.inUse].forEach(obj => {
                if (obj.destroy) obj.destroy();
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
            return pool ? {
                type: type,
                available: pool.available.length,
                inUse: pool.inUse.size,
                total: pool.available.length + pool.inUse.size
            } : null;
        }

        const stats = {};
        for (const [type, pool] of this.pools) {
            stats[type] = {
                available: pool.available.length,
                inUse: pool.inUse.size,
                total: pool.available.length + pool.inUse.size
            };
        }
        return stats;
    }
}

// 全局对象池实例
export const globalObjectPool = new ObjectPool(); 