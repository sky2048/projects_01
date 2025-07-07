import { TOWER_TYPES, TOWER_RARITY, ECONOMY_CONFIG } from '../config/GameConfig.js';

export class TowerShop {
    constructor(scene) {
        this.scene = scene;
        this.selectedTower = null;
        this.selectedTowerIndex = -1; // 记录选中塔在商店中的索引
        this.shopSlots = 5; // 商店槽位数量
        this.currentOffers = [];
        this.isInitialized = true;
        
        // 立即生成初始商店物品，因为UI已经创建完成
        this.refreshShop();
    }

    refreshShop() {
        this.currentOffers = [];
        
        // 刷新商店时清除选中的塔，防止利用漏洞
        this.selectedTower = null;
        this.selectedTowerIndex = -1;
        
        for (let i = 0; i < this.shopSlots; i++) {
            const tower = this.generateRandomTower();
            this.currentOffers.push(tower);
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
        // 随机选择塔的品质
        const rarity = this.selectRandomRarity();
        
        // 随机选择塔的类型
        const towerTypes = Object.keys(TOWER_TYPES);
        const randomType = towerTypes[Math.floor(Math.random() * towerTypes.length)];
        const towerType = TOWER_TYPES[randomType];
        
        // 根据品质调整属性
        const rarityMultiplier = this.getRarityMultiplier(rarity);
        
        return {
            id: this.generateId(),
            type: randomType,
            name: towerType.name,
            synergy: towerType.synergy,
            rarity: rarity,
            damage: Math.floor(towerType.baseStats.damage * rarityMultiplier),
            range: Math.floor(towerType.baseStats.range * rarityMultiplier),
            attackSpeed: towerType.baseStats.attackSpeed * rarityMultiplier,
            description: towerType.description,
            cost: ECONOMY_CONFIG.TOWER_SHOP_COST
        };
    }

    selectRandomRarity() {
        const random = Math.random();
        let cumulative = 0;
        
        for (const [rarityKey, rarityData] of Object.entries(TOWER_RARITY)) {
            cumulative += rarityData.probability;
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

    // buyTower方法已移除，现在通过UI直接选择塔

    refreshShopPaid() {
        if (this.scene.gameState.gold >= ECONOMY_CONFIG.REFRESH_COST) {
            this.scene.gameState.gold -= ECONOMY_CONFIG.REFRESH_COST;
            const uiScene = this.scene.scene.get('UIScene');
            if (uiScene && uiScene.updateGold) {
                uiScene.updateGold(this.scene.gameState.gold);
            }
            this.refreshShop();
            return true;
        } else {
            console.log('金币不足，无法刷新');
            return false;
        }
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