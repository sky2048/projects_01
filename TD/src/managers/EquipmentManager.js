import { EQUIPMENT_CONFIG } from '../config/GameConfig.js';

export class EquipmentManager {
    constructor(scene) {
        this.scene = scene;
        this.inventory = []; // 玩家装备背包，最多8个槽位
        // 移除自动合成功能
        
        // 获取UI场景引用
        this.uiScene = scene.scene.get('UIScene');
    }

    // 尝试掉落装备
    tryDropEquipment(monsterData, isElite = false, isBoss = false) {
        const items = Object.values(EQUIPMENT_CONFIG.BASIC_ITEMS);
        
        // 计算掉落概率
        let baseDropChance = 0; // 普通怪物无掉落
        if (isElite) baseDropChance = 0.25; // 精英怪25%
        if (isBoss) baseDropChance = 0.8; // BOSS 80%
        
        if (Math.random() < baseDropChance) {
            // 根据各装备的掉落概率选择
            const totalWeight = items.reduce((sum, item) => sum + item.dropChance, 0);
            let random = Math.random() * totalWeight;
            
            for (const item of items) {
                random -= item.dropChance;
                if (random <= 0) {
                    this.addToInventory(this.createEquipmentItem(item));
                    return item;
                }
            }
        }
        
        return null;
    }

    // 创建装备实例
    createEquipmentItem(itemConfig) {
        return {
            id: this.generateEquipmentId(),
            configId: itemConfig.id,
            name: itemConfig.name,
            description: itemConfig.description,
            icon: itemConfig.icon,
            effect: { ...itemConfig.effect },
            tier: 'basic' // basic 或 crafted
        };
    }

    // 添加装备到背包
    addToInventory(equipment) {
        if (this.inventory.length >= EQUIPMENT_CONFIG.INVENTORY_SIZE) {
            // 背包满了，显示提示
            if (this.uiScene && this.uiScene.showNotification) {
                this.uiScene.showNotification('装备背包已满！', 'warning', 2000);
            }
            return false;
        }
        
        this.inventory.push(equipment);
        
        // 移除自动合成调用
        
        // 更新UI
        this.updateInventoryUI();
        
        // 显示获得装备的通知
        if (this.uiScene && this.uiScene.showNotification) {
            this.uiScene.showNotification(`获得装备: ${equipment.name}`, 'success', 1500);
        }
        
        return true;
    }

    // 尝试自动合成
    tryAutoCompose() {
        // 统计每种基础装备的数量
        const itemCounts = {};
        this.inventory.forEach(item => {
            if (item.tier === 'basic') {
                itemCounts[item.configId] = (itemCounts[item.configId] || 0) + 1;
            }
        });
        
        // 检查是否有可以合成的装备
        for (const [itemId, count] of Object.entries(itemCounts)) {
            if (count >= 3) {
                // 可以合成同类装备（3个相同基础装备 = 1个高级装备）
                this.composeSameItems(itemId);
                return; // 一次只合成一个
            }
        }
        
        // 检查配方合成
        this.checkRecipeComposition();
    }

    // 合成相同装备
    composeSameItems(itemId) {
        // 移除3个相同的基础装备
        let removed = 0;
        this.inventory = this.inventory.filter(item => {
            if (removed < 3 && item.tier === 'basic' && item.configId === itemId) {
                removed++;
                return false;
            }
            return true;
        });
        
        // 查找对应的配方
        const recipeKey = `${itemId}+${itemId}`;
        const recipe = EQUIPMENT_CONFIG.RECIPES[recipeKey];
        
        if (recipe) {
            const craftedItem = this.createCraftedEquipment(recipe);
            this.inventory.push(craftedItem);
            
            if (this.uiScene && this.uiScene.showNotification) {
                this.uiScene.showNotification(`合成装备: ${craftedItem.name}`, 'success', 2000);
            }
        }
        
        this.updateInventoryUI();
    }

    // 检查配方合成
    checkRecipeComposition() {
        const basicItems = this.inventory.filter(item => item.tier === 'basic');
        
        // 检查所有可能的两件装备组合
        for (let i = 0; i < basicItems.length; i++) {
            for (let j = i + 1; j < basicItems.length; j++) {
                const item1 = basicItems[i];
                const item2 = basicItems[j];
                
                // 尝试两种组合方式
                const recipe1 = EQUIPMENT_CONFIG.RECIPES[`${item1.configId}+${item2.configId}`];
                const recipe2 = EQUIPMENT_CONFIG.RECIPES[`${item2.configId}+${item1.configId}`];
                
                const recipe = recipe1 || recipe2;
                if (recipe) {
                    // 找到配方，进行合成
                    this.composeByRecipe(item1, item2, recipe);
                    return;
                }
            }
        }
    }

    // 按配方合成
    composeByRecipe(item1, item2, recipe) {
        // 移除用于合成的装备
        this.inventory = this.inventory.filter(item => 
            item.id !== item1.id && item.id !== item2.id
        );
        
        // 创建合成装备
        const craftedItem = this.createCraftedEquipment(recipe);
        this.inventory.push(craftedItem);
        
        if (this.uiScene && this.uiScene.showNotification) {
            this.uiScene.showNotification(`合成装备: ${craftedItem.name}`, 'success', 2000);
        }
        
        this.updateInventoryUI();
    }

    // 创建合成装备
    createCraftedEquipment(recipe) {
        return {
            id: this.generateEquipmentId(),
            configId: recipe.id,
            name: recipe.name,
            description: recipe.description,
            icon: recipe.icon,
            effect: { ...recipe.effect },
            tier: 'crafted',
            components: [...recipe.components]
        };
    }

    // 将装备装到塔上
    equipToTower(equipmentId, tower) {
        const equipment = this.inventory.find(item => item.id === equipmentId);
        if (!equipment) {
            return false;
        }
        
        // 检查塔的装备槽位
        if (!tower.equipment) {
            tower.equipment = [];
        }
        
        if (tower.equipment.length >= EQUIPMENT_CONFIG.MAX_EQUIPMENT_PER_TOWER) {
            if (this.uiScene && this.uiScene.showNotification) {
                this.uiScene.showNotification('该塔的装备槽位已满！', 'warning', 1500);
            }
            return false;
        }
        
        // 从背包移除装备
        this.inventory = this.inventory.filter(item => item.id !== equipmentId);
        
        // 确保塔的原始属性被保存
        this.ensureOriginalStats(tower);
        
        // 添加到塔的装备列表
        tower.equipment.push(equipment);
        
        // 重新计算塔的所有属性
        this.recalculateTowerStats(tower);
        
        // 更新UI
        this.updateInventoryUI();
        this.updateTowerEquipmentUI(tower);
        
        if (this.uiScene && this.uiScene.showNotification) {
            this.uiScene.showNotification(`${equipment.name} 已装备到塔上`, 'success', 1500);
        }
        
        return true;
    }

    // 从塔上卸下装备
    unequipFromTower(equipmentId, tower) {
        if (!tower.equipment) return false;
        
        const equipmentIndex = tower.equipment.findIndex(item => item.id === equipmentId);
        if (equipmentIndex === -1) return false;
        
        const equipment = tower.equipment[equipmentIndex];
        
        // 检查背包空间
        if (this.inventory.length >= EQUIPMENT_CONFIG.INVENTORY_SIZE) {
            if (this.uiScene && this.uiScene.showNotification) {
                this.uiScene.showNotification('背包空间不足！', 'warning', 1500);
            }
            return false;
        }
        
        // 从塔上移除装备
        tower.equipment.splice(equipmentIndex, 1);
        
        // 重新计算塔的所有属性
        this.recalculateTowerStats(tower);
        
        // 放回背包
        this.inventory.push(equipment);
        
        // 更新UI
        this.updateInventoryUI();
        this.updateTowerEquipmentUI(tower);
        
        return true;
    }

    // 初始化塔的原始属性（如果还没保存的话）
    ensureOriginalStats(tower) {
        if (!tower.originalStats) {
            tower.originalStats = {
                damage: tower.damage,
                range: tower.range,
                attackSpeed: tower.attackSpeed
            };
        }
    }

    // 重新计算塔的属性
    recalculateTowerStats(tower) {
        if (!tower.originalStats) return;
        
        // 重置到原始属性
        tower.damage = tower.originalStats.damage;
        tower.range = tower.originalStats.range;
        tower.attackSpeed = tower.originalStats.attackSpeed;
        
        // 清除附加羁绊
        tower.additionalSynergies = [];
        
        // 累计所有装备的属性加成
        if (tower.equipment && tower.equipment.length > 0) {
            let totalDamageFlat = 0;
            let totalDamagePercent = 0;
            let totalAttackSpeedPercent = 0;
            let totalRangeFlat = 0;
            let totalRangePercent = 0;
            let totalRangeMultiplier = 1;
            
            // 遍历所有装备，累加各类属性加成
            tower.equipment.forEach((equipment, index) => {
                // 安全检查：确保装备和效果存在
                if (!equipment || !equipment.effect) {
                    console.warn(`塔装备[${index}]无效或缺少效果，跳过`, equipment);
                    return;
                }
                
                const effect = equipment.effect;
                
                // 累加伤害加成
                if (effect.damage !== undefined) {
                    if (typeof effect.damage === 'number' && effect.damage > 1) {
                        // 固定数值加成
                        totalDamageFlat += effect.damage;
                    } else {
                        // 百分比加成
                        totalDamagePercent += effect.damage;
                    }
                }
                
                // 累加攻击速度加成
                if (effect.attackSpeed !== undefined) {
                    totalAttackSpeedPercent += effect.attackSpeed;
                }
                
                // 累加射程加成
                if (effect.range !== undefined) {
                    if (effect.range > 1) {
                        // 倍数加成（如疾射火炮）
                        totalRangeMultiplier *= effect.range;
                    } else {
                        // 百分比加成
                        totalRangePercent += effect.range;
                    }
                }
                
                // 特殊效果：羁绊加成
                if (effect.addSynergy) {
                    if (!tower.additionalSynergies) {
                        tower.additionalSynergies = [];
                    }
                    tower.additionalSynergies.push(effect.addSynergy);
                }
            });
            
            // 应用累计的属性加成
            tower.damage = (tower.originalStats.damage + totalDamageFlat) * (1 + totalDamagePercent);
            tower.attackSpeed = tower.originalStats.attackSpeed * (1 + totalAttackSpeedPercent);
            tower.range = (tower.originalStats.range + totalRangeFlat) * (1 + totalRangePercent) * totalRangeMultiplier;
            
            // 更新攻击冷却时间
            tower.attackCooldown = 1000 / tower.attackSpeed;
        }
        
        // 更新射程指示器
        if (tower.rangeIndicator) {
            tower.rangeIndicator.setRadius(tower.range);
        }
        
        // 标记塔需要重新计算羁绊
        if (this.scene && this.scene.calculateSynergies) {
            this.scene.calculateSynergies();
        }
    }

    // 更新装备背包UI
    updateInventoryUI() {
        if (this.uiScene && this.uiScene.updateEquipmentInventory) {
            this.uiScene.updateEquipmentInventory(this.inventory);
        }
    }

    // 更新塔的装备UI
    updateTowerEquipmentUI(tower) {
        if (this.uiScene && this.uiScene.updateTowerEquipment) {
            this.uiScene.updateTowerEquipment(tower);
        }
    }

    // 生成装备ID
    generateEquipmentId() {
        return 'eq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 获取装备详细信息
    getEquipmentTooltip(equipment) {
        let tooltip = `${equipment.name}\n${equipment.description}`;
        
        if (equipment.tier === 'crafted' && equipment.components) {
            tooltip += `\n\n合成材料: ${equipment.components.map(id => 
                EQUIPMENT_CONFIG.BASIC_ITEMS[id]?.name || id
            ).join(' + ')}`;
        }
        
        return tooltip;
    }

    // 清理装备系统（游戏重置时使用）
    reset() {
        this.inventory = [];
        this.updateInventoryUI();
    }
} 