import { TOWER_RARITY } from '../config/GameConfig.js';
import { Projectile } from './Projectile.js';

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
        
        // 根据塔的类型创建不同的攻击效果
        switch (this.type) {
            case 'ARCHER':
                this.archerAttack(finalDamage);
                break;
            case 'MAGE':
                this.mageAttack(finalDamage);
                break;
            case 'ASSASSIN':
                this.assassinAttack(finalDamage);
                break;
            case 'TANK':
                this.tankAttack(finalDamage);
                break;
            case 'SUPPORT':
                this.supportAttack(finalDamage);
                break;
        }
        
        // 攻击动画
        this.playAttackAnimation();
    }

    archerAttack(damage) {
        // 创建箭矢
        const projectile = new Projectile(this.scene, this.x, this.y, this.target, {
            damage: damage,
            speed: 300,
            sprite: 'arrow',
            color: 0xffffff,
            piercing: this.specialEffects.piercing || false
        });
        
        if (this.scene.projectiles) {
            this.scene.projectiles.add(projectile);
        }
        
        // 多重射击效果
        if (this.specialEffects.multiShot) {
            const nearbyTargets = this.findNearbyTargets(2);
            for (const target of nearbyTargets) {
                const extraProjectile = new Projectile(this.scene, this.x, this.y, target, {
                    damage: damage * 0.7,
                    speed: 300,
                    sprite: 'arrow',
                    color: 0xffff00,
                    piercing: this.specialEffects.piercing || false
                });
                if (this.scene.projectiles) {
                    this.scene.projectiles.add(extraProjectile);
                }
            }
        }
    }

    mageAttack(damage) {
        // 魔法球
        const projectile = new Projectile(this.scene, this.x, this.y, this.target, {
            damage: damage,
            speed: 200,
            sprite: 'magic',
            color: 0x8000ff
        });
        
        if (this.scene.projectiles) {
            this.scene.projectiles.add(projectile);
        }
        
        // 溅射效果
        if (this.specialEffects.splash) {
            projectile.splashDamage = damage * 0.5;
            projectile.splashRange = 50;
        }
    }

    assassinAttack(damage) {
        // 快速近战攻击（瞬间伤害）
        if (this.target && this.target.takeDamage) {
            this.target.takeDamage(damage);
        }
        
        // 闪烁效果
        this.createFlashEffect();
    }

    tankAttack(damage) {
        // 重型炮弹
        const projectile = new Projectile(this.scene, this.x, this.y, this.target, {
            damage: damage,
            speed: 150,
            sprite: 'shell',
            color: 0x808080
        });
        
        if (this.scene.projectiles) {
            this.scene.projectiles.add(projectile);
        }
    }

    supportAttack(damage) {
        // 辅助光束
        const projectile = new Projectile(this.scene, this.x, this.y, this.target, {
            damage: damage,
            speed: 400,
            sprite: 'beam',
            color: 0x00ffff
        });
        
        if (this.scene.projectiles) {
            this.scene.projectiles.add(projectile);
        }
        
        // 治疗周围的塔
        if (this.specialEffects.healing) {
            this.healNearbyTowers();
        }
    }

    findNearbyTargets(count) {
        if (!this.scene.monsters || !this.scene.monsters.children) {
            return [];
        }
        
        const monsters = this.scene.monsters.children.entries;
        const nearby = monsters
            .filter(monster => monster !== this.target && monster && monster.x !== undefined && monster.y !== undefined)
            .filter(monster => {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, monster.x, monster.y);
                return distance <= this.range;
            })
            .sort((a, b) => {
                const distA = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y);
                const distB = Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y);
                return distA - distB;
            });
        
        return nearby.slice(0, count);
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
    }

    hideRange() {
        this.rangeIndicator.setVisible(false);
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
        super.destroy();
    }
} 