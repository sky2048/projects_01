import { Projectile } from './Projectile.js';
import { globalObjectPool } from '../utils/ObjectPool.js';

// 攻击策略基类
export class AttackStrategy {
    constructor(tower) {
        this.tower = tower;
        this.scene = tower.scene;
    }

    // 子类必须实现的抽象方法
    execute(damage, target) {
        throw new Error('AttackStrategy.execute() must be implemented by subclass');
    }

    // 通用辅助方法 - 使用对象池创建投射物
    createProjectile(x, y, target, options) {
        // 为不同类型的投射物使用不同的池
        const poolType = `projectile_${options.sprite || 'default'}`;
        
        const projectile = globalObjectPool.get(
            poolType,
            // 创建函数
            (scene, x, y, target, projectileData) => {
                return new Projectile(scene, x, y, target, projectileData);
            },
            // 重置函数
            (proj, scene, x, y, target, projectileData) => {
                // 重置投射物状态
                proj.scene = scene;
                proj.target = target;
                proj.damage = projectileData.damage;
                proj.speed = projectileData.speed;
                proj.projectileType = projectileData.sprite;
                proj.color = projectileData.color;
                proj.splashDamage = projectileData.splashDamage || 0;
                proj.splashRange = projectileData.splashRange || 0;
                proj.piercing = projectileData.piercing || false;
                proj.slowEffect = projectileData.slowEffect || false;
                proj.useTrackingMovement = true;
                proj.moveStartTime = scene && scene.time ? scene.time.now : 0;
                
                // 重置位置
                proj.setPosition(x, y);
                proj.setVisible(true);
                proj.setActive(true);
                if (proj.body) {
                    proj.body.setVelocity(0, 0);
                }
                
                // 重置穿透相关属性
                if (proj.piercing) {
                    if (proj.hitTargets) {
                        proj.hitTargets.clear();
                    } else {
                        proj.hitTargets = new Set();
                    }
                    proj.maxPiercingHits = 3;
                    proj.piercingDirection = null;
                }
                
                // 清理旧的视觉效果
                if (proj.visual && proj.visual.destroy) {
                    proj.visual.destroy();
                    proj.visual = null;
                }
                
                // 清理旧的尾迹粒子
                if (proj.particlePool) {
                    proj.particlePool.forEach(particle => {
                        if (particle && particle.destroy) {
                            particle.destroy();
                        }
                    });
                    proj.particlePool = [];
                }
                
                if (proj.activeParticles) {
                    proj.activeParticles.forEach(particle => {
                        if (particle && particle.destroy) {
                            particle.destroy();
                        }
                    });
                    proj.activeParticles = [];
                }
                
                // 重新创建视觉效果
                proj.createVisuals();
                
                // 重新初始化尾迹效果（如果需要）
                if (proj.projectileType === 'magic') {
                    proj.createTrailEffect();
                }
                
                // 开始移动
                proj.moveToTarget();
                
                // 确保投射物被添加到场景的投射物组中
                if (scene && scene.projectiles && !scene.projectiles.contains(proj)) {
                    scene.projectiles.add(proj);
                }
            },
            // 参数
            this.scene, x, y, target, options
        );
        
        // 确保投射物被添加到场景组中（对于新创建的投射物）
        if (projectile && this.scene.projectiles && !this.scene.projectiles.contains(projectile)) {
            this.scene.projectiles.add(projectile);
        }
        return projectile;
    }

    findNearbyTargets(count, excludeTarget = null) {
        if (!this.scene.monsters || !this.scene.monsters.children) {
            return [];
        }

        const monsters = this.scene.monsters.children.entries;
        const nearby = monsters
            .filter(monster => monster !== excludeTarget && monster && monster.x !== undefined && monster.y !== undefined)
            .filter(monster => {
                const distance = Phaser.Math.Distance.Between(this.tower.x, this.tower.y, monster.x, monster.y);
                return distance <= this.tower.range;
            })
            .sort((a, b) => {
                const distA = Phaser.Math.Distance.Between(this.tower.x, this.tower.y, a.x, a.y);
                const distB = Phaser.Math.Distance.Between(this.tower.x, this.tower.y, b.x, b.y);
                return distA - distB;
            });

        return nearby.slice(0, count);
    }

    healNearbyTowers() {
        if (!this.scene.towers || !this.scene.towers.children) {
            return;
        }

        const towers = this.scene.towers.children.entries;
        for (const tower of towers) {
            if (tower !== this.tower && tower && tower.x !== undefined && tower.y !== undefined && tower.applyBuff) {
                const distance = Phaser.Math.Distance.Between(this.tower.x, this.tower.y, tower.x, tower.y);
                if (distance <= this.tower.specialEffects.buffRange) {
                    tower.applyBuff('attackSpeed', 0.1, 3000);
                }
            }
        }
    }

    createFlashEffect() {
        // 闪烁效果
        this.scene.tweens.add({
            targets: this.tower.towerShape,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 1,
            ease: 'Power2'
        });
    }
}

// 弓箭手攻击策略
export class ArcherAttackStrategy extends AttackStrategy {
    execute(damage, target) {
        // 创建主箭矢
        this.createProjectile(this.tower.x, this.tower.y, target, {
            damage: damage,
            speed: 300,
            sprite: 'arrow',
            color: 0xffffff,
            piercing: this.tower.specialEffects.piercing || false
        });

        // 多重射击效果
        if (this.tower.specialEffects.multiShot) {
            const nearbyTargets = this.findNearbyTargets(2, target);
            for (const nearbyTarget of nearbyTargets) {
                this.createProjectile(this.tower.x, this.tower.y, nearbyTarget, {
                    damage: damage * 0.7,
                    speed: 300,
                    sprite: 'arrow',
                    color: 0xffff00,
                    piercing: this.tower.specialEffects.piercing || false
                });
            }
        }
    }
}

// 法师攻击策略
export class MageAttackStrategy extends AttackStrategy {
    execute(damage, target) {
        // 魔法球
        const projectile = this.createProjectile(this.tower.x, this.tower.y, target, {
            damage: damage,
            speed: 200,
            sprite: 'magic',
            color: 0x8000ff
        });

        // 溅射效果
        if (this.tower.specialEffects.splash) {
            projectile.splashDamage = damage * 0.5;
            projectile.splashRange = 50;
        }
    }
}

// 刺客攻击策略
export class AssassinAttackStrategy extends AttackStrategy {
    execute(damage, target) {
        // 快速近战攻击（瞬间伤害）
        if (target && target.takeDamage) {
            target.takeDamage(damage);
        }

        // 闪烁效果
        this.createFlashEffect();
    }
}

// 坦克攻击策略
export class TankAttackStrategy extends AttackStrategy {
    execute(damage, target) {
        // 重型炮弹
        this.createProjectile(this.tower.x, this.tower.y, target, {
            damage: damage,
            speed: 150,
            sprite: 'shell',
            color: 0x808080
        });
    }
}

// 辅助攻击策略
export class SupportAttackStrategy extends AttackStrategy {
    execute(damage, target) {
        // 辅助光束
        this.createProjectile(this.tower.x, this.tower.y, target, {
            damage: damage,
            speed: 400,
            sprite: 'beam',
            color: 0x00ffff
        });

        // 治疗周围的塔
        if (this.tower.specialEffects.healing) {
            this.healNearbyTowers();
        }
    }
}

// 攻击策略工厂
export class AttackStrategyFactory {
    static createStrategy(tower) {
        switch (tower.type) {
            case 'ARCHER':
                return new ArcherAttackStrategy(tower);
            case 'MAGE':
                return new MageAttackStrategy(tower);
            case 'ASSASSIN':
                return new AssassinAttackStrategy(tower);
            case 'TANK':
                return new TankAttackStrategy(tower);
            case 'SUPPORT':
                return new SupportAttackStrategy(tower);
            default:
                throw new Error(`Unknown tower type: ${tower.type}`);
        }
    }
} 