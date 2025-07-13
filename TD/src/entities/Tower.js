import { TOWER_RARITY } from '../config/GameConfig.js';
import { AttackStrategyFactory } from './AttackStrategies.js';

export class Tower extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, towerData) {
        super(scene, x, y, null);
        
        this.scene = scene;
        this.towerData = towerData;
        
        // 塔的属性 - 支持两种数据结构
        this.damage = towerData.damage || towerData.stats?.damage || 10;
        this.range = towerData.range || towerData.stats?.range || 100;
        this.attackSpeed = towerData.attackSpeed || towerData.stats?.attackSpeed || 1;
        this.type = towerData.type;
        this.rarity = towerData.rarity;
        this.synergy = towerData.synergy;
        
        // 攻击状态
        this.lastAttackTime = 0;
        this.attackCooldown = 1000 / this.attackSpeed; // 毫秒
        this.target = null;
        
        // Buff管理系统
        this.activeBuffs = new Map(); // 存储当前激活的buff
        this.originalStats = {
            damage: this.damage,
            range: this.range,
            attackSpeed: this.attackSpeed
        };
        
        // 装备系统
        this.equipment = []; // 装备列表
        this.isSilenced = false; // 沉默状态
        
        // 特殊效果
        this.specialEffects = this.initializeSpecialEffects();
        
        // 攻击策略 - 使用策略模式
        this.attackStrategy = AttackStrategyFactory.createStrategy(this);
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 创建视觉表示
        this.createVisuals();
        
        // 设置物理属性
        this.body.setSize(30, 30);
        this.body.setImmovable(true);
    }

    createVisuals() {
        // 塔的主体颜色根据品质决定
        const rarityColor = TOWER_RARITY[this.rarity].color;
        
        // 塔的形状根据类型决定
        let shape;
        switch (this.type) {
            case 'ARCHER':
                shape = this.scene.add.polygon(this.x, this.y, [0, -15, 12, 10, 0, 5, -12, 10], rarityColor);
                break;
            case 'MAGE':
                shape = this.scene.add.star(this.x, this.y, 6, 12, 18, rarityColor);
                break;
            case 'ASSASSIN':
                shape = this.scene.add.triangle(this.x, this.y, 0, -15, 15, 15, -15, 15, rarityColor);
                break;
            case 'TANK':
                shape = this.scene.add.rectangle(this.x, this.y, 25, 25, rarityColor);
                break;
            case 'SUPPORT':
                shape = this.scene.add.circle(this.x, this.y, 12, rarityColor);
                break;
            default:
                shape = this.scene.add.circle(this.x, this.y, 12, rarityColor);
        }
        
        shape.setStrokeStyle(2, 0x000000);
        this.towerShape = shape;
        
        // 攻击范围指示器（默认隐藏）
        this.rangeIndicator = this.scene.add.circle(this.x, this.y, this.range, 0xffffff, 0.1);
        this.rangeIndicator.setStrokeStyle(2, 0xffffff, 0.3);
        this.rangeIndicator.setVisible(false);
        
        // 塔的等级/品质指示
        const rarityText = this.scene.add.text(this.x, this.y + 20, 
            TOWER_RARITY[this.rarity].name.charAt(0), {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 1
        });
        rarityText.setOrigin(0.5);
        this.rarityText = rarityText;
    }

    initializeSpecialEffects() {
        const effects = {};
        
        switch (this.type) {
            case 'ARCHER':
                effects.multiShot = this.rarity === 'PURPLE' || this.rarity === 'ORANGE';
                effects.piercing = this.rarity === 'ORANGE';
                break;
            case 'MAGE':
                effects.splash = this.rarity === 'BLUE' || this.rarity === 'PURPLE' || this.rarity === 'ORANGE';
                effects.slowEffect = this.rarity === 'PURPLE' || this.rarity === 'ORANGE';
                break;
            case 'ASSASSIN':
                effects.critical = true;
                effects.criticalChance = this.rarity === 'WHITE' ? 0.2 : 
                                      this.rarity === 'GREEN' ? 0.3 :
                                      this.rarity === 'BLUE' ? 0.4 :
                                      this.rarity === 'PURPLE' ? 0.5 : 0.6;
                break;
            case 'TANK':
                effects.blocking = true;
                effects.aura = this.rarity === 'PURPLE' || this.rarity === 'ORANGE';
                break;
            case 'SUPPORT':
                effects.healing = true;
                effects.buffRange = this.range * 1.5;
                break;
        }
        
        return effects;
    }

    update() {
        if (this.scene.gameState.isPaused || this.scene.gameState.isGameOver) return;
        
        // 寻找目标
        this.findTarget();
        
        // 攻击目标
        this.attemptAttack();
        
        // 更新视觉效果
        this.updateVisuals();
    }

    findTarget() {
        if (this.target && this.isValidTarget(this.target)) {
            return; // 继续攻击当前目标
        }
        
        // 寻找新目标
        this.target = null;
        
        if (!this.scene.monsters || !this.scene.monsters.children) {
            return;
        }
        
        const monsters = this.scene.monsters.children.entries;
        let closestDistance = this.range;
        
        for (const monster of monsters) {
            if (monster && monster.x !== undefined && monster.y !== undefined) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, monster.x, monster.y);
                if (distance <= this.range && distance < closestDistance) {
                    this.target = monster;
                    closestDistance = distance;
                }
            }
        }
    }

    isValidTarget(target) {
        if (!target || !target.active) return false;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        return distance <= this.range;
    }

    attemptAttack() {
        if (!this.target || this.isSilenced) return;
        
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastAttackTime >= this.attackCooldown) {
            this.attack();
            this.lastAttackTime = currentTime;
        }
    }

    attack() {
        if (!this.target) return;
        
        // 计算伤害
        let finalDamage = this.damage;
        
        // 暴击检查（刺客特效）
        if (this.specialEffects.critical) {
            if (Math.random() < this.specialEffects.criticalChance) {
                finalDamage *= 2;
                this.showCriticalEffect();
            }
        }
        
        // 使用策略模式执行攻击
        this.attackStrategy.execute(finalDamage, this.target);
        
        // 攻击动画
        this.playAttackAnimation();
    }



    healNearbyTowers() {
        // 治疗周围的塔（增加攻击速度）
        if (!this.scene.towers || !this.scene.towers.children) {
            return;
        }
        
        const towers = this.scene.towers.children.entries;
        for (const tower of towers) {
            if (tower !== this && tower && tower.x !== undefined && tower.y !== undefined && tower.applyBuff) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, tower.x, tower.y);
                if (distance <= this.specialEffects.buffRange) {
                    tower.applyBuff('attackSpeed', 0.1, 3000);
                }
            }
        }
    }

    applyBuff(type, value, duration) {
        // 改进的buff系统，防止重复buff导致的错误
        if (type === 'attackSpeed') {
            const buffKey = `${type}_${value}`;
            
            // 如果已经有相同的buff，先取消旧的
            if (this.activeBuffs.has(buffKey)) {
                const oldTimer = this.activeBuffs.get(buffKey);
                oldTimer.remove(); // 取消旧的延时调用
            }
            
            // 应用新的buff（基于原始属性值）
            this.attackSpeed = this.originalStats.attackSpeed * (1 + value);
            this.attackCooldown = 1000 / this.attackSpeed;
            
            // 创建新的延时调用来移除buff
            const timer = this.scene.time.delayedCall(duration, () => {
                // 恢复到原始攻击速度
                this.attackSpeed = this.originalStats.attackSpeed;
                this.attackCooldown = 1000 / this.attackSpeed;
                
                // 从激活buff列表中移除
                this.activeBuffs.delete(buffKey);
            });
            
            // 记录这个buff的定时器
            this.activeBuffs.set(buffKey, timer);
        }
    }

    showCriticalEffect() {
        const critText = this.scene.add.text(this.x, this.y - 30, 'CRIT!', {
            fontSize: '16px',
            fill: '#ff0000',
            fontFamily: 'Arial, sans-serif',
            stroke: '#ffffff',
            strokeThickness: 2
        });
        critText.setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: critText,
            y: critText.y - 20,
            alpha: 0,
            duration: 1000,
            onComplete: () => critText.destroy()
        });
    }

    createFlashEffect() {
        if (!this.target || this.target.x === undefined || this.target.y === undefined) {
            return;
        }
        
        const flash = this.scene.add.line(this.x, this.y, 0, 0, this.target.x - this.x, this.target.y - this.y, 0xffffff);
        flash.setLineWidth(3);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }

    playAttackAnimation() {
        // 简单的攻击动画
        this.scene.tweens.add({
            targets: this.towerShape,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });
    }

    updateVisuals() {
        // 更新视觉元素位置
        if (this.towerShape) {
            this.towerShape.x = this.x;
            this.towerShape.y = this.y;
        }
        
        if (this.rangeIndicator) {
            this.rangeIndicator.x = this.x;
            this.rangeIndicator.y = this.y;
        }
        
        if (this.rarityText) {
            this.rarityText.x = this.x;
            this.rarityText.y = this.y + 20;
        }
    }

    showRange() {
        this.rangeIndicator.setVisible(true);
        
        // 创建删除按钮，位于攻击范围圆圈的右侧边缘
        if (!this.deleteButtonBg) {
            const deleteButtonX = this.x + this.range;
            const deleteButtonY = this.y;
            
            // 删除按钮背景
            this.deleteButtonBg = this.scene.add.circle(deleteButtonX, deleteButtonY, 15, 0xff0000, 0.8);
            this.deleteButtonBg.setStrokeStyle(2, 0xffffff);
            this.deleteButtonBg.setInteractive();
            
            // 删除按钮文字（×）
            this.deleteButtonText = this.scene.add.text(deleteButtonX, deleteButtonY, '×', {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold'
            });
            this.deleteButtonText.setOrigin(0.5);
            
            // 添加点击事件
            this.deleteButtonBg.on('pointerdown', (pointer, localX, localY, event) => {
                // 阻止事件冒泡到棋盘
                event.stopPropagation();
                this.handleDeleteClick();
            });
            
            // 添加悬停效果
            this.deleteButtonBg.on('pointerover', () => {
                this.deleteButtonBg.setScale(1.1);
                this.deleteButtonText.setScale(1.1);
            });
            
            this.deleteButtonBg.on('pointerout', () => {
                this.deleteButtonBg.setScale(1);
                this.deleteButtonText.setScale(1);
            });
        }
        
        // 创建升级按钮，位于攻击范围圆圈的左侧边缘
        if (!this.upgradeButtonBg) {
            const upgradeButtonX = this.x - this.range;
            const upgradeButtonY = this.y;
            
            // 升级按钮背景
            this.upgradeButtonBg = this.scene.add.circle(upgradeButtonX, upgradeButtonY, 15, 0x00aa00, 0.8);
            this.upgradeButtonBg.setStrokeStyle(2, 0xffffff);
            this.upgradeButtonBg.setInteractive();
            
            // 升级按钮文字（↑）
            this.upgradeButtonText = this.scene.add.text(upgradeButtonX, upgradeButtonY, '↑', {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold'
            });
            this.upgradeButtonText.setOrigin(0.5);
            
            // 添加点击事件
            this.upgradeButtonBg.on('pointerdown', (pointer, localX, localY, event) => {
                // 阻止事件冒泡到棋盘
                event.stopPropagation();
                this.handleUpgradeClick();
            });
            
            // 添加悬停效果
            this.upgradeButtonBg.on('pointerover', () => {
                this.upgradeButtonBg.setScale(1.1);
                this.upgradeButtonText.setScale(1.1);
            });
            
            this.upgradeButtonBg.on('pointerout', () => {
                this.upgradeButtonBg.setScale(1);
                this.upgradeButtonText.setScale(1);
            });
        }
        
        // 创建移动按钮，位于攻击范围圆圈的上方边缘
        if (!this.moveButtonBg) {
            const moveButtonX = this.x;
            const moveButtonY = this.y - this.range;
            
            // 移动按钮背景
            this.moveButtonBg = this.scene.add.circle(moveButtonX, moveButtonY, 15, 0x4a90e2, 0.8);
            this.moveButtonBg.setStrokeStyle(2, 0xffffff);
            this.moveButtonBg.setInteractive();
            
            // 移动按钮文字（↕）
            this.moveButtonText = this.scene.add.text(moveButtonX, moveButtonY, '↕', {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold'
            });
            this.moveButtonText.setOrigin(0.5);
            
            // 添加点击事件
            this.moveButtonBg.on('pointerdown', (pointer, localX, localY, event) => {
                // 阻止事件冒泡到棋盘
                event.stopPropagation();
                this.handleMoveClick();
            });
            
            // 添加悬停效果
            this.moveButtonBg.on('pointerover', () => {
                this.moveButtonBg.setScale(1.1);
                this.moveButtonText.setScale(1.1);
            });
            
            this.moveButtonBg.on('pointerout', () => {
                this.moveButtonBg.setScale(1);
                this.moveButtonText.setScale(1);
            });
        }
    }

    hideRange() {
        this.rangeIndicator.setVisible(false);
        
        // 隐藏删除按钮
        if (this.deleteButtonBg) {
            this.deleteButtonBg.destroy();
            this.deleteButtonBg = null;
        }
        if (this.deleteButtonText) {
            this.deleteButtonText.destroy();
            this.deleteButtonText = null;
        }
        
        // 隐藏升级按钮
        if (this.upgradeButtonBg) {
            this.upgradeButtonBg.destroy();
            this.upgradeButtonBg = null;
        }
        if (this.upgradeButtonText) {
            this.upgradeButtonText.destroy();
            this.upgradeButtonText = null;
        }
        
        // 隐藏移动按钮
        if (this.moveButtonBg) {
            this.moveButtonBg.destroy();
            this.moveButtonBg = null;
        }
        if (this.moveButtonText) {
            this.moveButtonText.destroy();
            this.moveButtonText = null;
        }
    }
    
    handleDeleteClick() {
        // 调用场景的删除塔方法
        if (this.scene.deleteTower) {
            this.scene.deleteTower(this);
        }
    }
    
    handleUpgradeClick() {
        // 调用场景的升级塔方法
        if (this.scene.upgradeTower) {
            this.scene.upgradeTower(this);
        }
    }
    
    handleMoveClick() {
        // 调用场景的移动塔方法
        if (this.scene.moveTower) {
            this.scene.moveTower(this);
        }
    }

    setSelected(selected) {
        this.isSelected = selected;
        if (selected) {
            // 添加选中效果 - 亮边框
            if (this.selectionIndicator) {
                this.selectionIndicator.destroy();
            }
            this.selectionIndicator = this.scene.add.rectangle(this.x, this.y, 35, 35);
            this.selectionIndicator.setStrokeStyle(3, 0xffff00);
            this.selectionIndicator.setFillStyle(0x000000, 0);
        } else {
            // 移除选中效果
            if (this.selectionIndicator) {
                this.selectionIndicator.destroy();
                this.selectionIndicator = null;
            }
        }
    }

    upgrade(newTowerData) {
        // 更新塔的数据和属性
        this.towerData = newTowerData;
        this.damage = newTowerData.damage;
        this.range = newTowerData.range;
        this.attackSpeed = newTowerData.attackSpeed;
        this.rarity = newTowerData.rarity;
        
        // 更新原始属性（用于buff计算）
        this.originalStats = {
            damage: this.damage,
            range: this.range,
            attackSpeed: this.attackSpeed
        };
        
        // 重新计算攻击冷却时间
        this.attackCooldown = 1000 / this.attackSpeed;
        
        // 重新初始化特殊效果
        this.specialEffects = this.initializeSpecialEffects();
        
        // 更新视觉效果
        this.updateVisualAfterUpgrade();
        
        console.log(`塔升级为 ${newTowerData.name} (${TOWER_RARITY[newTowerData.rarity].name})`);
    }

    updateVisualAfterUpgrade() {
        // 销毁旧的视觉元素
        if (this.towerShape) this.towerShape.destroy();
        if (this.rangeIndicator) this.rangeIndicator.destroy();
        if (this.rarityText) this.rarityText.destroy();
        
        // 重新创建视觉元素
        this.createVisuals();
    }

    destroy() {
        if (this.towerShape) this.towerShape.destroy();
        if (this.rangeIndicator) this.rangeIndicator.destroy();
        if (this.rarityText) this.rarityText.destroy();
        if (this.selectionIndicator) this.selectionIndicator.destroy();
        if (this.deleteButtonBg) this.deleteButtonBg.destroy();
        if (this.deleteButtonText) this.deleteButtonText.destroy();
        if (this.upgradeButtonBg) this.upgradeButtonBg.destroy();
        if (this.upgradeButtonText) this.upgradeButtonText.destroy();
        if (this.moveButtonBg) this.moveButtonBg.destroy();
        if (this.moveButtonText) this.moveButtonText.destroy();
        super.destroy();
    }

    // 重新计算塔的属性（考虑永久buff和装备效果）
    recalculateStats() {
        // 从原始属性开始
        let newDamage = this.originalStats.damage;
        let newRange = this.originalStats.range;
        let newAttackSpeed = this.originalStats.attackSpeed;
        
        // 应用永久buff
        if (this.permanentBuffs) {
            this.permanentBuffs.forEach(buff => {
                if (buff.effect.damage) {
                    newDamage *= (1 + buff.effect.damage);
                }
                if (buff.effect.range) {
                    newRange *= (1 + buff.effect.range);
                }
                if (buff.effect.attackSpeed) {
                    newAttackSpeed *= (1 + buff.effect.attackSpeed);
                }
            });
        }
        
        // 应用装备效果（如果有装备管理器的话）
        if (this.equipment && this.scene.equipmentManager) {
            this.equipment.forEach(equipment => {
                if (equipment.effect) {
                    if (equipment.effect.damage) {
                        if (typeof equipment.effect.damage === 'number' && equipment.effect.damage > 1) {
                            // 固定数值加成
                            newDamage += equipment.effect.damage;
                        } else {
                            // 百分比加成
                            newDamage *= (1 + equipment.effect.damage);
                        }
                    }
                    if (equipment.effect.range) {
                        newRange *= (1 + equipment.effect.range);
                    }
                    if (equipment.effect.attackSpeed) {
                        newAttackSpeed *= (1 + equipment.effect.attackSpeed);
                    }
                }
            });
        }
        
        // 更新属性
        this.damage = Math.floor(newDamage);
        this.range = Math.floor(newRange);
        this.attackSpeed = newAttackSpeed;
        this.attackCooldown = 1000 / this.attackSpeed;
        
        console.log(`塔属性重新计算: 伤害${this.damage}, 射程${this.range}, 攻速${this.attackSpeed.toFixed(2)}`);
    }
} 