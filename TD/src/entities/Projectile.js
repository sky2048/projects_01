export class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, target, projectileData) {
        super(scene, x, y, null);
        
        this.scene = scene;
        this.target = target;
        this.damage = projectileData.damage;
        this.speed = projectileData.speed;
        this.projectileType = projectileData.sprite;
        this.color = projectileData.color;
        
        // 特殊效果
        this.splashDamage = projectileData.splashDamage || 0;
        this.splashRange = projectileData.splashRange || 0;
        this.piercing = projectileData.piercing || false;
        this.slowEffect = projectileData.slowEffect || false;
        
        // 穿透相关属性
        if (this.piercing) {
            this.hitTargets = new Set();
            this.maxPiercingHits = 3; // 最多穿透3个目标
            this.piercingDirection = null; // 穿透方向
        }
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 创建视觉表示
        this.createVisuals();
        
        // 设置物理属性
        this.body.setSize(8, 8);
        
        // 移动向目标
        this.moveToTarget();
    }

    createVisuals() {
        // 根据投射物类型创建不同的视觉效果
        let visual;
        
        switch (this.projectileType) {
            case 'arrow':
                visual = this.scene.add.triangle(this.x, this.y, 0, -4, 3, 4, -3, 4, this.color);
                break;
            case 'magic':
                visual = this.scene.add.star(this.x, this.y, 4, 4, 6, this.color);
                break;
            case 'shell':
                visual = this.scene.add.circle(this.x, this.y, 4, this.color);
                break;
            case 'beam':
                visual = this.scene.add.rectangle(this.x, this.y, 2, 8, this.color);
                break;
            default:
                visual = this.scene.add.circle(this.x, this.y, 3, this.color);
        }
        
        visual.setStrokeStyle(1, 0x000000);
        this.visual = visual;
        
        // 添加尾迹效果
        if (this.projectileType === 'magic') {
            this.createTrailEffect();
        }
    }

    createTrailEffect() {
        this.trailParticles = [];
        this.lastTrailTime = 0;
        this.trailInterval = 50; // 毫秒
    }

    updateTrailEffect() {
        if (!this.trailParticles || !this.scene || !this.scene.time || !this.scene.add || !this.scene.tweens) return;
        
        const currentTime = this.scene.time.now;
        const timeScale = this.scene.physics.world.timeScale || 1;
        const adjustedInterval = this.trailInterval / timeScale;
        
        if (currentTime - this.lastTrailTime > adjustedInterval) {
            const particle = this.scene.add.circle(this.x, this.y, 2, this.color, 0.5);
            this.trailParticles.push(particle);
            
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                duration: 300 / timeScale,
                onComplete: () => {
                    particle.destroy();
                    const index = this.trailParticles.indexOf(particle);
                    if (index > -1) {
                        this.trailParticles.splice(index, 1);
                    }
                }
            });
            
            this.lastTrailTime = currentTime;
        }
    }

    moveToTarget() {
        if (!this.target || !this.target.active) {
            this.destroy();
            return;
        }
        
        // 使用更精确的追踪方式，每帧更新目标位置
        this.useTrackingMovement = true;
        this.moveStartTime = this.scene && this.scene.time ? this.scene.time.now : 0;
    }

    updateTargetTracking() {
        if (!this.useTrackingMovement || !this.scene || !this.scene.time) {
            return;
        }
        
        // 穿透投射物处理
        if (this.piercing) {
            this.updatePiercingMovement();
            return;
        }
        
        // 普通投射物处理
        if (!this.target || !this.target.active) {
            this.destroy();
            return;
        }
        
        // 计算到目标的角度和距离
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        
        // 设置旋转角度（对于箭矢）
        if (this.projectileType === 'arrow') {
            this.visual.rotation = angle + Math.PI / 2;
        }
        
        // 调整速度以适应时间缩放
        const timeScale = this.scene.physics.world.timeScale || 1;
        const effectiveSpeed = this.speed * timeScale;
        
        // 计算速度向量
        this.body.setVelocity(
            Math.cos(angle) * effectiveSpeed,
            Math.sin(angle) * effectiveSpeed
        );
        
        // 检查是否击中目标
        if (distance < 15) { // 增大击中范围以适应高速移动
            this.hit();
            return;
        }
        
        // 检查是否超出边界
        if (this.x < -50 || this.x > 1330 || this.y < -50 || this.y > 770) {
            this.destroy();
        }
        
        // 检查是否超时（防止子弹无限追踪）
        if (this.scene && this.scene.time && this.scene.time.now - this.moveStartTime > 3000) {
            this.destroy();
        }
    }

    updatePiercingMovement() {
        // 检查是否达到最大穿透次数
        if (this.hitTargets && this.hitTargets.size >= this.maxPiercingHits) {
            this.destroy();
            return;
        }
        
        // 智能连锁追踪：寻找下一个最近的未击中目标
        if (!this.target || !this.target.active || this.hitTargets.has(this.target)) {
            this.findNextPiercingTarget();
        }
        
        // 如果有有效目标，追踪它
        if (this.target && this.target.active && !this.hitTargets.has(this.target)) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            
            // 设置旋转角度
            if (this.projectileType === 'arrow') {
                this.visual.rotation = angle + Math.PI / 2;
            }
            
            // 调整速度以适应时间缩放
            const timeScale = this.scene.physics.world.timeScale || 1;
            const effectiveSpeed = this.speed * timeScale;
            
            // 朝目标移动
            this.body.setVelocity(
                Math.cos(angle) * effectiveSpeed,
                Math.sin(angle) * effectiveSpeed
            );
            
            // 检查是否击中目标
            if (distance < 15) {
                this.hit();
                return;
            }
        } else {
            // 没有目标时继续当前方向直线飞行一段距离后销毁
            if (!this.lastDirection) {
                this.lastDirection = this.body.velocity.angle();
            }
            
            const timeScale = this.scene.physics.world.timeScale || 1;
            const effectiveSpeed = this.speed * timeScale * 0.5; // 减速飞行
            
            this.body.setVelocity(
                Math.cos(this.lastDirection) * effectiveSpeed,
                Math.sin(this.lastDirection) * effectiveSpeed
            );
        }
        
        // 检查是否超出边界
        if (this.x < -50 || this.x > 1330 || this.y < -50 || this.y > 770) {
            this.destroy();
        }
    }

    findNextPiercingTarget() {
        if (!this.scene.monsters || !this.scene.monsters.children) {
            this.target = null;
            return;
        }
        
        const monsters = this.scene.monsters.children.entries;
        let closestDistance = Infinity;
        let closestMonster = null;
        
        // 寻找最近的未击中怪物
        monsters.forEach(monster => {
            if (monster.active && !this.hitTargets.has(monster)) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, monster.x, monster.y);
                
                // 优先选择200像素范围内的目标，实现更自然的连锁
                if (distance < 200 && distance < closestDistance) {
                    closestDistance = distance;
                    closestMonster = monster;
                }
            }
        });
        
        this.target = closestMonster;
    }

    hit() {
        // 造成伤害
        if (this.target && this.target.active) {
            this.target.takeDamage(this.damage);
        }
        
        // 创建击中效果
        this.createHitEffect();
        
        // 溅射伤害
        if (this.splashDamage > 0) {
            this.applySplashDamage();
        }
        
        // 缓慢效果
        if (this.slowEffect) {
            this.applySlowEffect();
        }
        
        this.destroy();
    }

    createHitEffect() {
        if (!this.scene || !this.scene.add || !this.scene.tweens) return;
        
        // 击中爆炸效果
        const explosion = this.scene.add.circle(this.x, this.y, 5, 0xffff00, 0.8);
        
        this.scene.tweens.add({
            targets: explosion,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 200,
            onComplete: () => explosion.destroy()
        });
        
        // 根据投射物类型添加特殊效果
        switch (this.projectileType) {
            case 'magic':
                this.createMagicExplosion();
                break;
            case 'shell':
                this.createShellExplosion();
                break;
        }
    }

    createMagicExplosion() {
        if (!this.scene || !this.scene.add || !this.scene.tweens) return;
        
        // 魔法爆炸效果
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const spark = this.scene.add.circle(this.x, this.y, 2, 0x8000ff);
            
            this.scene.tweens.add({
                targets: spark,
                x: this.x + Math.cos(angle) * 20,
                y: this.y + Math.sin(angle) * 20,
                alpha: 0,
                duration: 300,
                onComplete: () => spark.destroy()
            });
        }
    }

    createShellExplosion() {
        if (!this.scene || !this.scene.add || !this.scene.tweens) return;
        
        // 炮弹爆炸效果
        const shockwave = this.scene.add.circle(this.x, this.y, 10, 0x808080, 0.3);
        
        this.scene.tweens.add({
            targets: shockwave,
            scaleX: 4,
            scaleY: 4,
            alpha: 0,
            duration: 400,
            onComplete: () => shockwave.destroy()
        });
    }

    applySplashDamage() {
        if (!this.scene || !this.scene.monsters) return;
        
        const monsters = this.scene.monsters.children.entries;
        
        for (const monster of monsters) {
            if (monster === this.target) continue;
            
            const distance = Phaser.Math.Distance.Between(this.x, this.y, monster.x, monster.y);
            if (distance <= this.splashRange) {
                monster.takeDamage(this.splashDamage);
                
                // 溅射伤害指示
                const splashText = this.scene.add.text(monster.x, monster.y - 15, 
                    `-${this.splashDamage}`, {
                    fontSize: '12px',
                    fill: '#ffaa00',
                    fontFamily: 'Arial, sans-serif',
                    stroke: '#000000',
                    strokeThickness: 1
                });
                splashText.setOrigin(0.5);
                
                this.scene.tweens.add({
                    targets: splashText,
                    y: splashText.y - 20,
                    alpha: 0,
                    duration: 600,
                    onComplete: () => splashText.destroy()
                });
            }
        }
    }

    applySlowEffect() {
        if (this.target && this.target.active && this.scene && this.scene.time) {
            // 应用缓慢效果（降低移动速度）
            const originalSpeed = this.target.speed;
            this.target.speed *= 0.5;
            
            // 视觉指示
            const slowIndicator = this.scene.add.circle(this.target.x, this.target.y, 15, 0x0088ff, 0.3);
            
            this.scene.time.delayedCall(2000, () => {
                this.target.speed = originalSpeed;
                if (slowIndicator) slowIndicator.destroy();
            });
        }
    }

    update() {
        // 安全检查：如果场景或物理体不存在，直接返回
        if (!this.scene || !this.active) return;
        
        // 更新目标追踪
        this.updateTargetTracking();
        
        // 更新尾迹效果
        if (this.projectileType === 'magic') {
            this.updateTrailEffect();
        }
        
        // 更新视觉元素位置
        if (this.visual) {
            this.visual.x = this.x;
            this.visual.y = this.y;
        }
    }

    destroy() {
        // 清理资源
        if (this.visual) this.visual.destroy();
        
        // 清理尾迹粒子
        if (this.trailParticles) {
            this.trailParticles.forEach(particle => {
                if (particle && particle.destroy) particle.destroy();
            });
            this.trailParticles = [];
        }
        
        super.destroy();
    }
} 