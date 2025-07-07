import { WAVE_CONFIG, ECONOMY_CONFIG, MONSTER_MODIFIERS } from '../config/GameConfig.js';

export class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.currentWave = 0;
        this.waveInProgress = false;
        this.monstersInWave = 0;
        this.monstersSpawned = 0;
        this.timeBetweenWaves = 5000; // 5秒
        this.timeBetweenSpawns = 1000; // 1秒
        this.lastSpawnTime = 0;
        this.waveStartTime = 0;
        this.isInitialized = true;
        
        // 立即开始第一波，因为场景已经完全初始化
        this.startNextWave();
    }

    update() {
        // 只有在当前波次大于0时才更新（表示已经开始了第一波）
        if (this.currentWave > 0) {
            if (this.waveInProgress) {
                this.updateWaveSpawning();
            } else {
                this.checkWaveCompletion();
            }
        }
    }

    startNextWave() {
        this.currentWave++;
        console.log(`开始第 ${this.currentWave} 波`);
        
        // 获取UI场景
        const uiScene = this.scene.scene.get('UIScene');
        
        // 显示波次开始提示
        if (uiScene && uiScene.showWaveNotification) {
            uiScene.showWaveNotification(this.currentWave, true);
        }
        
        // 更新UI
        if (uiScene && uiScene.updateWave) {
            uiScene.updateWave(this.currentWave);
        }
        
        // 给予波次奖励
        this.scene.gameState.gold += ECONOMY_CONFIG.GOLD_PER_WAVE;
        if (uiScene && uiScene.updateGold) {
            uiScene.updateGold(this.scene.gameState.gold);
        }
        
        // 显示金币奖励提示
        if (uiScene && uiScene.showNotification) {
            uiScene.showNotification(`获得 ${ECONOMY_CONFIG.GOLD_PER_WAVE} 金币奖励`, 'success', 1500);
        }
        
        // 设置波次参数
        this.setupWaveData();
        
        this.waveInProgress = true;
        this.monstersSpawned = 0;
        this.waveStartTime = this.scene.time.now;
        this.lastSpawnTime = 0;
    }

    setupWaveData() {
        // 检查是否是BOSS波
        if (this.currentWave === WAVE_CONFIG.BOSS_WAVE) {
            this.setupBossWave();
        } else {
            this.setupNormalWave();
        }
    }

    setupNormalWave() {
        // 普通波次
        this.monstersInWave = Math.min(5 + Math.floor(this.currentWave / 2), 15);
        
        const baseHealth = 50 * Math.pow(WAVE_CONFIG.MONSTER_HEALTH_SCALE, this.currentWave - 1);
        const baseSpeed = 30 * Math.pow(WAVE_CONFIG.MONSTER_SPEED_SCALE, this.currentWave - 1);
        
        this.monsterData = {
            health: Math.floor(baseHealth),
            speed: Math.min(baseSpeed, 100),
            reward: 2 + Math.floor(this.currentWave / 5),
            isBoss: false
        };
    }

    setupBossWave() {
        // BOSS波次
        this.monstersInWave = 1;
        
        const bossHealth = 1000 * Math.pow(WAVE_CONFIG.MONSTER_HEALTH_SCALE, this.currentWave - 1);
        
        this.monsterData = {
            health: Math.floor(bossHealth),
            speed: 20,
            reward: 100,
            isBoss: true
        };
    }

    updateWaveSpawning() {
        const currentTime = this.scene.time.now;
        
        if (this.monstersSpawned < this.monstersInWave) {
            if (currentTime - this.lastSpawnTime > this.timeBetweenSpawns) {
                this.spawnMonster();
                this.lastSpawnTime = currentTime;
            }
        } else {
            // 检查是否所有怪物都被消灭或到达终点
            if (this.scene.monsters && this.scene.monsters.children.size === 0) {
                this.completeWave();
            }
        }
    }

    spawnMonster() {
        if (this.scene.spawnMonster) {
            // 确定是否生成精英怪
            const isElite = this.shouldSpawnElite();
            const modifiers = isElite ? this.generateEliteModifiers() : [];
            
            const monster = this.scene.spawnMonster(this.monsterData, null, null, isElite, modifiers);
            this.monstersSpawned++;
            
            const eliteText = isElite ? ' (精英)' : '';
            console.log(`生成第 ${this.monstersSpawned}/${this.monstersInWave} 只怪物${eliteText}`);
        }
    }

    // 判断是否应该生成精英怪
    shouldSpawnElite() {
        if (this.monsterData.isBoss) return false; // BOSS不生成精英怪
        
        // 根据波次确定精英怪概率
        let eliteChance = 0;
        const wave = this.currentWave;
        
        if (wave >= 16) eliteChance = MONSTER_MODIFIERS.ELITE_SPAWN_CHANCE[16];
        else if (wave >= 11) eliteChance = MONSTER_MODIFIERS.ELITE_SPAWN_CHANCE[11];
        else if (wave >= 6) eliteChance = MONSTER_MODIFIERS.ELITE_SPAWN_CHANCE[6];
        else eliteChance = MONSTER_MODIFIERS.ELITE_SPAWN_CHANCE[1];
        
        return Math.random() < eliteChance;
    }

    // 生成精英怪的词缀
    generateEliteModifiers() {
        const modifiers = [];
        const availableModifiers = Object.keys(MONSTER_MODIFIERS.MODIFIERS);
        
        // 确定词缀数量
        const isBoss = this.monsterData.isBoss;
        const modifierCount = isBoss 
            ? Phaser.Math.Between(MONSTER_MODIFIERS.ELITE_MODIFIER_COUNT.bossMin, MONSTER_MODIFIERS.ELITE_MODIFIER_COUNT.bossMax)
            : Phaser.Math.Between(MONSTER_MODIFIERS.ELITE_MODIFIER_COUNT.min, MONSTER_MODIFIERS.ELITE_MODIFIER_COUNT.max);
        
        // 随机选择词缀
        const shuffled = [...availableModifiers].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(modifierCount, shuffled.length); i++) {
            modifiers.push(shuffled[i]);
        }
        
        return modifiers;
    }

    completeWave() {
        this.waveInProgress = false;
        
        console.log(`第 ${this.currentWave} 波完成`);
        
        // 显示波次完成提示
        const uiScene = this.scene.scene.get('UIScene');
        if (uiScene && uiScene.showWaveNotification) {
            uiScene.showWaveNotification(this.currentWave, false);
        }
        
        // 检查游戏是否结束
        if (this.currentWave >= WAVE_CONFIG.TOTAL_WAVES) {
            this.scene.victory();
            return;
        }
        
        // 显示下一波倒计时提示
        if (uiScene && uiScene.showNotification) {
            const nextWave = this.currentWave + 1;
            if (nextWave === WAVE_CONFIG.BOSS_WAVE) {
                uiScene.showNotification(`准备迎接BOSS！${this.timeBetweenWaves / 1000} 秒后开始第 ${nextWave} 波`, 'warning', this.timeBetweenWaves - 500);
            } else {
                uiScene.showNotification(`${this.timeBetweenWaves / 1000} 秒后开始第 ${nextWave} 波`, 'info', this.timeBetweenWaves - 500);
            }
        }
        
        // 波次完成后自动刷新商店
        if (this.scene.towerShop) {
            this.scene.towerShop.refreshShop();
            if (uiScene && uiScene.showNotification) {
                uiScene.showNotification('商店已自动刷新！', 'info', 2000);
            }
        }
        
        // 延迟开始下一波
        this.scene.time.delayedCall(this.timeBetweenWaves, () => {
            if (!this.scene.gameState.isGameOver) {
                this.startNextWave();
            }
        });
    }

    checkWaveCompletion() {
        // 波次间隔期间的逻辑
    }

    getCurrentWave() {
        return this.currentWave;
    }

    isWaveInProgress() {
        return this.waveInProgress;
    }

    getRemainingMonsters() {
        return this.monstersInWave - this.monstersSpawned;
    }
} 