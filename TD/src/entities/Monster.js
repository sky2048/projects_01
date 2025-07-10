import { MONSTER_MODIFIERS } from '../config/GameConfig.js';

export class Monster extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, monsterData, path, isElite = false, modifiers = []) {
        super(scene, x, y, null);
        
        this.scene = scene;
        this.monsterData = monsterData;
        this.path = path;
        this.pathIndex = 0;
        
        // 精英怪和词缀系统
        this.isElite = isElite;
        this.isBoss = monsterData.isBoss || false;
        this.modifiers = modifiers || [];
        
        // 怪物基础属性
        this.baseHealth = monsterData.health;
        this.baseSpeed = monsterData.speed;
        this.baseReward = monsterData.reward;
        
        // 应用词缀效果到属性
        this.applyModifierEffects();
        
        // 最终属性
        this.maxHealth = this.modifiedHealth || this.baseHealth;
        this.health = this.maxHealth;
        this.speed = this.modifiedSpeed || this.baseSpeed;
        this.reward = this.modifiedReward || this.baseReward;
        
        // 词缀相关的状态
        this.lastRegenTime = 0;
        this.lastSilenceTime = 0;
        this.hasTeleported = false;
        this.silencedTowers = new Set();
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 创建视觉表示
        this.createVisuals();
        
        // 设置物理属性
        this.body.setSize(20, 20);
        
        // 开始移动
        this.moveToNextPoint();
    }

    createVisuals() {
        // 怪物主体颜色和大小
        let color = 0x8b4513; // 默认棕色
        let size = 15; // 默认大小
        
        if (this.isBoss) {
            color = 0xff0000;
            size = 25;
        } else if (this.isElite) {
            color = 0x9400d3; // 精英怪紫色
            size = 20;
        }
        
        this.body_graphic = this.scene.add.circle(this.x, this.y, size, color);
        this.body_graphic.setStrokeStyle(2, 0x000000);
        
        // 精英怪光环效果
        if (this.isElite || this.isBoss) {
            this.aura = this.scene.add.circle(this.x, this.y, size + 5, color, 0.3);
            this.aura.setStrokeStyle(1, color, 0.8);
            
            // 光环脉动效果
            this.scene.tweens.add({
                targets: this.aura,
                scaleX: 1.2,
                scaleY: 1.2,
                alpha: 0.1,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // 血条背景
        this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 25, 35, 5, 0x000000);
        
        // 血条 - 设置原点为左侧，这样缩放时会从右边减少
        this.healthBar = this.scene.add.rectangle(this.x, this.y - 25, 35, 5, 0x00ff00);
        this.healthBar.setOrigin(0, 0.5);
        
        // BOSS标识
        if (this.isBoss) {
            this.bossText = this.scene.add.text(this.x, this.y - 40, 'BOSS', {
                fontSize: '12px',
                fill: '#ff0000',
                fontFamily: 'Arial, sans-serif',
                stroke: '#ffffff',
                strokeThickness: 1
            });
            this.bossText.setOrigin(0.5);
        } else if (this.isElite) {
            this.eliteText = this.scene.add.text(this.x, this.y - 40, 'ELITE', {
                fontSize: '10px',
                fill: '#9400d3',
                fontFamily: 'Arial, sans-serif',
                stroke: '#ffffff',
                strokeThickness: 1
            });
            this.eliteText.setOrigin(0.5);
        }
        
        // 词缀图标显示
        this.createModifierIcons();
    }

    moveToNextPoint() {
        if (this.pathIndex >= this.path.length) {
            this.reachEnd();
            return;
        }
        
        const target = this.path[this.pathIndex];
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        const duration = (distance / this.speed) * 1000;
        
        // 保存当前的Tween引用，以便在路径更新时可以停止
        if (this.moveTween) {
            this.moveTween.destroy();
        }
        
        this.moveTween = this.scene.tweens.add({
            targets: this,
            x: target.x,
            y: target.y,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                this.pathIndex++;
                this.moveToNextPoint();
            }
        });
    }

    updatePath(newPath) {
        // 停止当前移动
        if (this.moveTween) {
            this.moveTween.destroy();
            this.moveTween = null;
        }
        
        // 更新路径
        this.path = newPath;
        
        // 找到最接近的路径点
        this.findClosestPathPoint();
        
        // 继续移动
        this.moveToNextPoint();
    }

    findClosestPathPoint() {
        let closestIndex = 0;
        let minDistance = Infinity;
        
        for (let i = 0; i < this.path.length; i++) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y, 
                this.path[i].x, this.path[i].y
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }
        
        // 设置到最近点的下一个点（确保继续前进）
        this.pathIndex = Math.min(closestIndex + 1, this.path.length - 1);
    }

    // 应用词缀效果到属性
    applyModifierEffects() {
        let healthMultiplier = 1;
        let speedMultiplier = 1;
        let rewardMultiplier = 1;
        
        this.modifiers.forEach(modifierId => {
            const modifier = MONSTER_MODIFIERS.MODIFIERS[modifierId];
            if (!modifier) return;
            
            const effect = modifier.effect;
            if (effect.speedMultiplier) {
                speedMultiplier *= effect.speedMultiplier;
            }
            
            // 精英怪和BOSS有额外的生命值和奖励加成
            if (this.isElite) {
                healthMultiplier *= 1.5;
                rewardMultiplier *= 2;
            }
            if (this.isBoss) {
                healthMultiplier *= 3;
                rewardMultiplier *= 5;
            }
        });
        
        this.modifiedHealth = Math.floor(this.baseHealth * healthMultiplier);
        this.modifiedSpeed = this.baseSpeed * speedMultiplier;
        this.modifiedReward = Math.floor(this.baseReward * rewardMultiplier);
    }

    // 创建词缀图标
    createModifierIcons() {
        this.modifierIcons = [];
        
        this.modifiers.forEach((modifierId, index) => {
            const modifier = MONSTER_MODIFIERS.MODIFIERS[modifierId];
            if (!modifier) return;
            
            const iconX = this.x - 15 + (index * 10);
            const iconY = this.y + 20;
            
            // 创建图标背景
            const iconBg = this.scene.add.circle(iconX, iconY, 6, modifier.color, 0.8);
            iconBg.setStrokeStyle(1, 0x000000);
            
            // 创建图标文字
            const iconText = this.scene.add.text(iconX, iconY, modifier.icon, {
                fontSize: '8px',
                fill: '#ffffff'
            });
            iconText.setOrigin(0.5);
            
            this.modifierIcons.push({ bg: iconBg, text: iconText });
        });
    }

    takeDamage(damage, damageType = 'physical') {
        let finalDamage = damage;
        
        // 应用词缀伤害减免
        this.modifiers.forEach(modifierId => {
            const modifier = MONSTER_MODIFIERS.MODIFIERS[modifierId];
            if (!modifier) return;
            
            const effect = modifier.effect;
            if (damageType === 'physical' && effect.physicalResist) {
                finalDamage *= (1 - effect.physicalResist);
            }
            if (damageType === 'magic' && effect.magicResist) {
                finalDamage *= (1 - effect.magicResist);
            }
        });
        
        finalDamage = Math.max(1, Math.floor(finalDamage)); // 至少造成1点伤害
        
        this.health -= finalDamage;
        this.updateHealthBar();
        
        // 伤害数字特效
        this.showDamageText(finalDamage);
        
        // 传送效果检查
        this.checkTeleport();
        
        if (this.health <= 0) {
            this.die();
        }
    }

    // 检查传送效果
    checkTeleport() {
        if (this.hasTeleported) return;
        
        const healthPercent = this.health / this.maxHealth;
        
        this.modifiers.forEach(modifierId => {
            const modifier = MONSTER_MODIFIERS.MODIFIERS[modifierId];
            if (!modifier || modifier.id !== 'TELEPORT') return;
            
            const effect = modifier.effect;
            if (healthPercent <= effect.teleportThreshold) {
                this.performTeleport(effect.teleportDistance);
                this.hasTeleported = true;
            }
        });
    }

    // 执行传送
    performTeleport(distance) {
        if (this.pathIndex >= this.path.length - 1) return;
        
        // 传送特效
        const teleportEffect = this.scene.add.circle(this.x, this.y, 30, 0xffff00, 0.8);
        this.scene.tweens.add({
            targets: teleportEffect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => teleportEffect.destroy()
        });
        
        // 沿路径前进一段距离
        let remainingDistance = distance;
        let newIndex = this.pathIndex;
        let teleportedToSegmentMiddle = false;
        
        while (remainingDistance > 0 && newIndex < this.path.length - 1) {
            const currentPoint = this.path[newIndex];
            const nextPoint = this.path[newIndex + 1];
            const segmentLength = Phaser.Math.Distance.Between(
                currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y
            );
            
            if (remainingDistance >= segmentLength) {
                remainingDistance -= segmentLength;
                newIndex++;
            } else {
                // 在当前路径段的某个位置
                const ratio = remainingDistance / segmentLength;
                this.x = currentPoint.x + (nextPoint.x - currentPoint.x) * ratio;
                this.y = currentPoint.y + (nextPoint.y - currentPoint.y) * ratio;
                teleportedToSegmentMiddle = true;
                break;
            }
        }
        
        // 修复路径索引设置：如果传送到路径段中间，设置为下一个路径点
        // 这样moveToNextPoint()会让怪物继续前进而不是后退
        if (teleportedToSegmentMiddle) {
            this.pathIndex = newIndex + 1;
        } else {
            this.pathIndex = newIndex;
        }
        
        // 停止当前移动并重新开始
        if (this.moveTween) {
            this.moveTween.destroy();
        }
        this.moveToNextPoint();
        
        // 传送到达特效
        const arrivalEffect = this.scene.add.circle(this.x, this.y, 20, 0x00ffff, 0.8);
        this.scene.tweens.add({
            targets: arrivalEffect,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => arrivalEffect.destroy()
        });
    }

    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.scaleX = healthPercent;
        
        // 调整血条位置，使其从左侧开始显示（血条原点已设为左侧）
        const barWidth = 35;
        this.healthBar.x = this.x - barWidth / 2;
        
        // 根据血量改变颜色
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0x00ff00);
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xffff00);
        } else {
            this.healthBar.setFillStyle(0xff0000);
        }
    }

    showDamageText(damage) {
        const damageText = this.scene.add.text(this.x, this.y - 10, `-${damage}`, {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        });
        damageText.setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                damageText.destroy();
            }
        });
    }

    die() {
        // 处理召唤词缀
        this.handleSummonModifier();
        
        // 装备掉落
        this.handleEquipmentDrop();
        
        // 给予奖励
        this.scene.gameState.gold += this.reward;
        const uiScene = this.scene.scene.get('UIScene');
        if (uiScene && uiScene.updateGold) {
            uiScene.updateGold(this.scene.gameState.gold, this.reward);
        }
        
        // 死亡特效
        const deathEffect = this.scene.add.circle(this.x, this.y, 30, 0xffff00, 0.7);
        
        this.scene.tweens.add({
            targets: deathEffect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                if (deathEffect && deathEffect.destroy) {
                    deathEffect.destroy();
                }
            }
        });
        
        // 通知场景怪物死亡
        if (this.scene && this.scene.onMonsterKilled) {
            this.scene.onMonsterKilled(this);
        }
        
        this.destroyVisuals();
        this.destroy();
    }

    // 处理召唤词缀
    handleSummonModifier() {
        this.modifiers.forEach(modifierId => {
            const modifier = MONSTER_MODIFIERS.MODIFIERS[modifierId];
            if (!modifier || modifier.id !== 'SUMMONER') return;
            
            const effect = modifier.effect.summonOnDeath;
            if (!effect) return;
            
            // 检查是否接近终点（路径的最后20%）
            const isNearEnd = this.pathIndex >= this.path.length * 0.8;
            
            if (isNearEnd) {
                // 接近终点时，在路径起始点附近召唤，避免不公平的生命值损失
                const startPoint = this.path[0];
                const spawnRadius = 60;
                
                for (let i = 0; i < effect.count; i++) {
                    const angle = (Math.PI * 2 * i) / effect.count;
                    const x = startPoint.x + Math.cos(angle) * spawnRadius;
                    const y = startPoint.y + Math.sin(angle) * spawnRadius;
                    
                    this.summonMinionAt(x, y, effect);
                }
                
                // 显示友好提示
                const uiScene = this.scene.scene.get('UIScene');
                if (uiScene && uiScene.showNotification) {
                    uiScene.showNotification('召唤师在起点召唤了小怪！', 'warning', 2000);
                }
            } else {
                // 正常情况下在当前位置周围召唤
                for (let i = 0; i < effect.count; i++) {
                    const angle = (Math.PI * 2 * i) / effect.count;
                    const distance = 30;
                    const x = this.x + Math.cos(angle) * distance;
                    const y = this.y + Math.sin(angle) * distance;
                    
                    this.summonMinionAt(x, y, effect);
                }
            }
        });
    }

    summonMinionAt(x, y, effect) {
        // 创建小怪数据
        const minionData = {
            health: Math.floor(this.baseHealth * 0.3),
            speed: this.baseSpeed * 1.2,
            reward: Math.floor(this.baseReward * 0.2)
        };
        
        // 召唤小怪
        if (this.scene.spawnMonster) {
            const minion = this.scene.spawnMonster(minionData, x, y);
            if (minion) {
                // 小怪有特殊的视觉效果
                minion.body_graphic.setScale(0.7);
                minion.body_graphic.setFillStyle(0xaaaaaa);
            }
        }
    }

    // 处理装备掉落
    handleEquipmentDrop() {
        if (this.scene.equipmentManager) {
            this.scene.equipmentManager.tryDropEquipment(this.monsterData, this.isElite, this.isBoss);
        }
    }

    reachEnd() {
        this.scene.onMonsterReachedEnd();
        this.destroyVisuals();
        this.destroy();
    }

    destroyVisuals() {
        // 停止移动动画
        if (this.moveTween) {
            this.moveTween.destroy();
            this.moveTween = null;
        }
        
        if (this.body_graphic) this.body_graphic.destroy();
        if (this.aura) this.aura.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBar) this.healthBar.destroy();
        if (this.bossText) this.bossText.destroy();
        if (this.eliteText) this.eliteText.destroy();
        
        if (this.modifierIcons) {
            this.modifierIcons.forEach(icon => {
                if (icon.bg) icon.bg.destroy();
                if (icon.text) icon.text.destroy();
            });
        }
    }

    update() {
        // 处理持续效果
        this.handleContinuousEffects();
        
        // 更新视觉元素位置
        if (this.body_graphic) {
            this.body_graphic.x = this.x;
            this.body_graphic.y = this.y;
        }
        
        if (this.aura) {
            this.aura.x = this.x;
            this.aura.y = this.y;
        }
        
        if (this.healthBarBg) {
            this.healthBarBg.x = this.x;
            this.healthBarBg.y = this.y - 25;
        }
        
        if (this.healthBar) {
            // 血条位置要与updateHealthBar方法保持一致（从左侧开始）
            const barWidth = 35;
            this.healthBar.x = this.x - barWidth / 2;
            this.healthBar.y = this.y - 25;
        }
        
        if (this.bossText) {
            this.bossText.x = this.x;
            this.bossText.y = this.y - 40;
        }
        
        if (this.eliteText) {
            this.eliteText.x = this.x;
            this.eliteText.y = this.y - 40;
        }
        
        // 更新词缀图标位置
        if (this.modifierIcons) {
            this.modifierIcons.forEach((icon, index) => {
                const iconX = this.x - 15 + (index * 10);
                const iconY = this.y + 20;
                
                if (icon.bg) {
                    icon.bg.x = iconX;
                    icon.bg.y = iconY;
                }
                if (icon.text) {
                    icon.text.x = iconX;
                    icon.text.y = iconY;
                }
            });
        }
    }

    // 处理持续效果
    handleContinuousEffects() {
        const currentTime = this.scene.time.now;
        
        this.modifiers.forEach(modifierId => {
            const modifier = MONSTER_MODIFIERS.MODIFIERS[modifierId];
            if (!modifier) return;
            
            const effect = modifier.effect;
            
            // 再生效果
            if (effect.healthRegen && currentTime - this.lastRegenTime > 1000) {
                const healAmount = Math.floor(this.maxHealth * effect.healthRegen);
                this.health = Math.min(this.maxHealth, this.health + healAmount);
                this.updateHealthBar();
                
                // 治疗特效
                const healEffect = this.scene.add.text(this.x, this.y - 15, `+${healAmount}`, {
                    fontSize: '12px',
                    fill: '#00ff00',
                    fontFamily: 'Arial, sans-serif'
                });
                healEffect.setOrigin(0.5);
                
                this.scene.tweens.add({
                    targets: healEffect,
                    y: healEffect.y - 20,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => healEffect.destroy()
                });
                
                this.lastRegenTime = currentTime;
            }
            
            // 沉默效果
            if (effect.silenceAura && currentTime - this.lastSilenceTime > effect.silenceAura.interval) {
                this.applySilenceEffect(effect.silenceAura);
                this.lastSilenceTime = currentTime;
            }
        });
    }

    // 应用沉默效果
    applySilenceEffect(silenceConfig) {
        if (!this.scene.towers || !this.scene.towers.children) return;
        
        const towers = this.scene.towers.children.entries;
        const nearbyTowers = towers.filter(tower => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, tower.x, tower.y);
            // 修复：排除已经被沉默的塔（无论是否被此怪物沉默）
            return distance <= silenceConfig.range && 
                   !tower.isSilenced && 
                   !this.silencedTowers.has(tower);
        });
        
        if (nearbyTowers.length > 0) {
            // 随机选择一个塔进行沉默
            const target = nearbyTowers[Math.floor(Math.random() * nearbyTowers.length)];
            this.silenceTower(target, silenceConfig.duration);
        }
    }

    // 沉默一个塔
    silenceTower(tower, duration) {
        // 标记塔被沉默
        tower.isSilenced = true;
        this.silencedTowers.add(tower);
        
        // 沉默视觉效果
        const silenceEffect = this.scene.add.circle(tower.x, tower.y, 40, 0xffaa00, 0.3);
        silenceEffect.setStrokeStyle(2, 0xffaa00);
        
        const silenceIcon = this.scene.add.text(tower.x, tower.y, '🤐', {
            fontSize: '16px'
        });
        silenceIcon.setOrigin(0.5);
        
        // 定时移除沉默效果
        this.scene.time.delayedCall(duration, () => {
            tower.isSilenced = false;
            this.silencedTowers.delete(tower);
            
            if (silenceEffect) silenceEffect.destroy();
            if (silenceIcon) silenceIcon.destroy();
        });
    }
} 