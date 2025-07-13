import { TOWER_TYPES, TOWER_RARITY, ECONOMY_CONFIG, LEVEL_RARITY_MODIFIERS } from '../config/GameConfig.js';

export class TowerShop {
    constructor(scene) {
        this.scene = scene;
        this.selectedTower = null;
        this.selectedTowerIndex = -1; // 记录选中塔在商店中的索引
        this.shopSlots = 5; // 商店槽位数量
        this.currentOffers = [];
        this.isInitialized = true;
        
        // 锁定系统
        this.isLocked = false; // 整体锁定状态
        this.lockedSlots = new Array(this.shopSlots).fill(false); // 每个槽位的锁定状态
        
        // 立即生成初始商店物品，因为UI已经创建完成
        this.refreshShop();
    }

    refreshShop() {
        // 如果商店被锁定，不进行刷新
        if (this.isLocked) {
            console.log('商店已锁定，无法刷新');
            return;
        }
        
        // 保存被锁定槽位的塔
        const lockedTowers = [];
        for (let i = 0; i < this.shopSlots; i++) {
            if (this.lockedSlots[i] && this.currentOffers[i]) {
                lockedTowers[i] = this.currentOffers[i];
            } else {
                lockedTowers[i] = null;
            }
        }
        
        // 安全检查：确保currentOffers数组存在
        if (!this.currentOffers) {
            this.currentOffers = [];
        }
        
        this.currentOffers = [];
        
        // 刷新商店时清除选中的塔，防止利用漏洞
        this.selectedTower = null;
        this.selectedTowerIndex = -1;
        
        for (let i = 0; i < this.shopSlots; i++) {
            if (this.lockedSlots[i] && lockedTowers[i]) {
                // 保留锁定的塔
                this.currentOffers.push(lockedTowers[i]);
            } else {
                // 生成新塔
                const tower = this.generateRandomTower();
                if (tower) {
                    this.currentOffers.push(tower);
                } else {
                    console.warn(`生成塔失败，槽位 ${i}`);
                    this.currentOffers.push(null);
                }
            }
        }
        
        // 通知UI更新商店显示和清除选中状态
        const uiScene = this.scene.scene.get('UIScene');
        if (uiScene && uiScene.updateShop) {
            uiScene.updateShop(this.currentOffers);
        }
        if (uiScene && uiScene.clearTowerSelection) {
            uiScene.clearTowerSelection();
        }
        
        console.log('商店已刷新');
    }

    generateRandomTower() {
        // 安全检查：确保塔类型配置存在
        if (!TOWER_TYPES || Object.keys(TOWER_TYPES).length === 0) {
            console.error('塔类型配置不存在');
            return null;
        }
        
        const towerTypes = Object.keys(TOWER_TYPES);
        const randomType = towerTypes[Math.floor(Math.random() * towerTypes.length)];
        const towerTemplate = TOWER_TYPES[randomType];
        
        // 安全检查：确保塔模板存在
        if (!towerTemplate || !towerTemplate.baseStats) {
            console.error(`塔模板不存在或缺少基础属性: ${randomType}`);
            return null;
        }
        
        const rarity = this.selectRandomRarity();
        const rarityMultiplier = this.getRarityMultiplier(rarity);
        
        // 安全检查：确保稀有度倍数有效
        if (isNaN(rarityMultiplier) || rarityMultiplier <= 0) {
            console.error(`无效的稀有度倍数: ${rarityMultiplier}`);
            return null;
        }
        
        const tower = {
            id: this.generateId(),
            type: randomType,
            name: towerTemplate.name,
            synergy: towerTemplate.synergy,
            rarity: rarity,
            damage: Math.floor(towerTemplate.baseStats.damage * rarityMultiplier),
            range: Math.floor(towerTemplate.baseStats.range * rarityMultiplier),
            attackSpeed: towerTemplate.baseStats.attackSpeed * rarityMultiplier,
            description: towerTemplate.description,
            cost: ECONOMY_CONFIG.TOWER_SHOP_COST
        };
        
        return tower;
    }

    selectRandomRarity() {
        const playerLevel = this.scene.gameState.level;
        const random = Math.random();
        let cumulative = 0;
        
        // 获取当前等级的概率配置
        let levelModifiers = LEVEL_RARITY_MODIFIERS[playerLevel];
        if (!levelModifiers) {
            // 如果等级超过配置范围，使用最高等级的概率
            const maxLevel = Math.max(...Object.keys(LEVEL_RARITY_MODIFIERS).map(Number));
            levelModifiers = LEVEL_RARITY_MODIFIERS[maxLevel];
        }
        
        for (const [rarityKey, probability] of Object.entries(levelModifiers)) {
            cumulative += probability;
            if (random <= cumulative) {
                return rarityKey;
            }
        }
        
        return 'WHITE'; // 默认返回白色
    }

    getRarityMultiplier(rarity) {
        const multipliers = {
            'WHITE': 1.0,
            'GREEN': 1.2,
            'BLUE': 1.5,
            'PURPLE': 2.0,
            'ORANGE': 3.0
        };
        
        return multipliers[rarity] || 1.0;
    }

    generateId() {
        return 'tower_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }

    refreshShopPaid() {
        if (this.scene.gameState.gold >= ECONOMY_CONFIG.REFRESH_COST) {
            this.scene.gameState.gold -= ECONOMY_CONFIG.REFRESH_COST;
            const uiScene = this.scene.scene.get('UIScene');
            if (uiScene && uiScene.updateGold) {
                uiScene.updateGold(this.scene.gameState.gold, -ECONOMY_CONFIG.REFRESH_COST);
            }
            
            // 手动刷新时自动解除锁定
            this.isLocked = false;
            this.lockedSlots.fill(false);
            
            this.refreshShop();
            
            // 更新UI锁定状态显示
            if (uiScene && uiScene.updateLockButtonVisual) {
                uiScene.updateLockButtonVisual(false);
            }
            if (uiScene && uiScene.updateShopLockVisuals) {
                uiScene.updateShopLockVisuals();
            }
            
            return true;
        } else {
            console.log('金币不足，无法刷新');
            return false;
        }
    }

    // 切换商店锁定状态
    toggleLock() {
        this.isLocked = !this.isLocked;
        
        if (this.isLocked) {
            // 锁定时，将当前所有有塔的槽位标记为锁定
            for (let i = 0; i < this.shopSlots; i++) {
                if (this.currentOffers[i]) {
                    this.lockedSlots[i] = true;
                }
            }
        } else {
            // 解锁时，清除所有槽位的锁定状态
            this.lockedSlots.fill(false);
        }
        
        return this.isLocked;
    }

    // 切换单个槽位的锁定状态
    toggleSlotLock(slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.shopSlots && this.currentOffers[slotIndex]) {
            this.lockedSlots[slotIndex] = !this.lockedSlots[slotIndex];
            return this.lockedSlots[slotIndex];
        }
        return false;
    }

    // 获取锁定状态
    getIsLocked() {
        return this.isLocked;
    }

    // 获取各槽位的锁定状态
    getLockedSlots() {
        return [...this.lockedSlots];
    }

    // 检查指定槽位是否被锁定
    isSlotLocked(slotIndex) {
        return slotIndex >= 0 && slotIndex < this.shopSlots && this.lockedSlots[slotIndex];
    }

    getSelectedTower() {
        return this.selectedTower;
    }

    clearSelection() {
        this.selectedTower = null;
        this.selectedTowerIndex = -1;
    }

    getCurrentOffers() {
        return this.currentOffers;
    }

    // 从商店移除已购买的塔
    removeTowerFromShop(towerIndex) {
        if (towerIndex >= 0 && towerIndex < this.currentOffers.length) {
            // 将该位置设为null，表示空槽位
            this.currentOffers[towerIndex] = null;
            
            // 清除选中状态
            if (this.selectedTowerIndex === towerIndex) {
                this.selectedTower = null;
                this.selectedTowerIndex = -1;
            }
            
            // 通知UI更新商店显示
            const uiScene = this.scene.scene.get('UIScene');
            if (uiScene && uiScene.updateShop) {
                uiScene.updateShop(this.currentOffers);
            }
            if (uiScene && uiScene.clearTowerSelection) {
                uiScene.clearTowerSelection();
            }
            
            console.log(`塔已从商店槽位 ${towerIndex} 移除`);
            return true;
        }
        return false;
    }

    // 选择塔，记录索引
    selectTower(towerIndex) {
        if (towerIndex >= 0 && towerIndex < this.currentOffers.length && this.currentOffers[towerIndex]) {
            this.selectedTower = this.currentOffers[towerIndex];
            this.selectedTowerIndex = towerIndex;
            console.log(`选择了商店槽位 ${towerIndex} 的塔: ${this.selectedTower.name}`);
            return true;
        }
        return false;
    }

    // 获取选中塔的索引
    getSelectedTowerIndex() {
        return this.selectedTowerIndex;
    }

    // 合成系统 - 三个相同的塔可以合成更高品质的塔
    canCombine(towers) {
        if (towers.length !== 3) return false;
        
        const firstTower = towers[0];
        return towers.every(tower => 
            tower.type === firstTower.type && 
            tower.rarity === firstTower.rarity
        );
    }

    combineTowers(towers) {
        if (!this.canCombine(towers)) return null;
        
        const baseTower = towers[0];
        const currentRarity = baseTower.rarity;
        
        // 获取下一个品质等级
        const rarityLevels = ['WHITE', 'GREEN', 'BLUE', 'PURPLE', 'ORANGE'];
        const currentIndex = rarityLevels.indexOf(currentRarity);
        
        if (currentIndex < rarityLevels.length - 1) {
            const newRarity = rarityLevels[currentIndex + 1];
            const rarityMultiplier = this.getRarityMultiplier(newRarity);
            
            const combinedTower = {
                id: this.generateId(),
                type: baseTower.type,
                name: baseTower.name,
                synergy: baseTower.synergy,
                rarity: newRarity,
                damage: Math.floor(TOWER_TYPES[baseTower.type].baseStats.damage * rarityMultiplier),
                range: Math.floor(TOWER_TYPES[baseTower.type].baseStats.range * rarityMultiplier),
                attackSpeed: TOWER_TYPES[baseTower.type].baseStats.attackSpeed * rarityMultiplier,
                description: TOWER_TYPES[baseTower.type].description,
                cost: 0 // 合成的塔不需要额外费用
            };
            
            console.log(`合成了 ${combinedTower.name} (${TOWER_RARITY[newRarity].name})`);
            return combinedTower;
        }
        
        return null;
    }
} 