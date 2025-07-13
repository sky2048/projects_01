import { WAVE_CONFIG, PHASE_CONFIG, ROGUELIKE_OPTIONS, ENVIRONMENT_EVENTS, MONSTER_MODIFIERS, ECONOMY_CONFIG } from '../config/GameConfig.js';

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
        
        // 新增：阶段管理
        this.currentPhase = 1;
        this.activeEnvironmentEvent = null; // 当前活跃的环境事件
        this.permanentBuffs = []; // 永久buff列表
        
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
        
        // 计算当前阶段
        this.currentPhase = Math.ceil(this.currentWave / WAVE_CONFIG.WAVES_PER_PHASE);
        
        // 获取波次信息
        const waveInfo = this.getWaveInfo(this.currentWave);
        
        console.log(`开始第 ${this.currentWave} 波 (${this.currentPhase}-${(this.currentWave - 1) % 6 + 1}) - ${waveInfo.name}: ${waveInfo.description}`);
        
        // 获取UI场景
        const uiScene = this.scene.scene.get('UIScene');
        
        // 检查是否是肉鸽三选一波次
        if (this.isRoguelikeWave(this.currentWave)) {
            this.handleRoguelikeWave(uiScene);
            return; // 肉鸽选择完成后会继续波次
        }
        
        // 检查是否是特殊挑战波次（环境事件）
        if (this.isEnvironmentEventWave(this.currentWave)) {
            this.activateEnvironmentEvent();
        }
        
        // 显示波次开始提示
        if (uiScene && uiScene.showWaveNotification) {
            const phaseInfo = ` [阶段${this.currentPhase}: ${PHASE_CONFIG[this.currentPhase].name}]`;
            uiScene.showWaveNotification(this.currentWave, true, waveInfo.name + phaseInfo);
        }
        
        // 更新UI
        if (uiScene && uiScene.updateWave) {
            uiScene.updateWave(this.currentWave, this.currentPhase, waveInfo);
        }
        
        // 给予波次奖励（包括永久buff加成）
        let waveGold = ECONOMY_CONFIG.GOLD_PER_WAVE;
        
        // 应用永久buff中的金币加成
        this.permanentBuffs.forEach(buff => {
            if (buff.effect.goldPerWave) {
                waveGold += buff.effect.goldPerWave;
            }
        });
        
        this.scene.gameState.gold += waveGold;
        if (uiScene && uiScene.updateGold) {
            uiScene.updateGold(this.scene.gameState.gold, waveGold);
        }
        
        // 显示金币奖励提示
        if (uiScene && uiScene.showNotification) {
            const bonusText = waveGold > ECONOMY_CONFIG.GOLD_PER_WAVE ? ` (+${waveGold - ECONOMY_CONFIG.GOLD_PER_WAVE} 加成)` : '';
            uiScene.showNotification(`获得 ${waveGold} 金币奖励${bonusText}`, 'success', 1500, 'left');
        }
        
        // 设置波次参数
        this.setupWaveData();
        
        this.waveInProgress = true;
        this.monstersSpawned = 0;
        this.waveStartTime = this.scene.time.now;
        this.lastSpawnTime = 0;
    }

    // 获取波次信息
    getWaveInfo(waveNumber) {
        const phaseNumber = Math.ceil(waveNumber / WAVE_CONFIG.WAVES_PER_PHASE);
        const phaseConfig = PHASE_CONFIG[phaseNumber];
        
        if (phaseConfig && phaseConfig.waves[waveNumber]) {
            return phaseConfig.waves[waveNumber];
        }
        
        // 默认信息
        return { type: 'normal', name: '普通波次', description: '普通遭遇战' };
    }

    // 判断是否是肉鸽三选一波次
    isRoguelikeWave(waveNumber) {
        return WAVE_CONFIG.SPECIAL_WAVES.ROGUELIKE_WAVES.includes(waveNumber);
    }

    // 判断是否是环境事件波次
    isEnvironmentEventWave(waveNumber) {
        return WAVE_CONFIG.SPECIAL_WAVES.CHALLENGE_WAVES.includes(waveNumber);
    }

    // 判断是否是Boss波次
    isBossWave(waveNumber) {
        return WAVE_CONFIG.SPECIAL_WAVES.BOSS_WAVES.includes(waveNumber);
    }

    // 判断是否是高压波次
    isHighPressureWave(waveNumber) {
        return WAVE_CONFIG.SPECIAL_WAVES.HIGH_PRESSURE_WAVES.includes(waveNumber);
    }

    // 处理肉鸽三选一波次
    handleRoguelikeWave(uiScene) {
        if (uiScene && uiScene.showRoguelikeSelection) {
            const options = this.generateRoguelikeOptions();
            uiScene.showRoguelikeSelection(options, (selectedOption) => {
                this.applyRoguelikeBuff(selectedOption);
                // 选择完成后继续正常波次流程
                this.continueAfterRoguelike();
            });
        } else {
            console.warn('UI场景不支持肉鸽选择，跳过');
            this.continueAfterRoguelike();
        }
    }

    // 生成肉鸽三选一选项
    generateRoguelikeOptions() {
        const allCategories = [
            ROGUELIKE_OPTIONS.EQUIPMENT_BUFFS,
            ROGUELIKE_OPTIONS.ECONOMY_BUFFS,
            ROGUELIKE_OPTIONS.SPECIAL_ABILITIES,
            ROGUELIKE_OPTIONS.HEALING_BUFFS
        ];
        
        const options = [];
        const usedOptions = new Set();
        
        // 随机选择3个不同的选项
        while (options.length < 3) {
            const category = allCategories[Math.floor(Math.random() * allCategories.length)];
            const option = category[Math.floor(Math.random() * category.length)];
            
            if (!usedOptions.has(option.id)) {
                options.push(option);
                usedOptions.add(option.id);
            }
        }
        
        return options;
    }

    // 应用肉鸽buff
    applyRoguelikeBuff(option) {
        if (option.type === 'permanent') {
            this.permanentBuffs.push(option);
            
            // 立即应用到所有现有塔
            if (this.scene.towers && this.scene.towers.children) {
                this.scene.towers.children.entries.forEach(tower => {
                    this.applyBuffToTower(tower, option);
                });
            }
        } else if (option.type === 'instant') {
            this.applyInstantEffect(option);
        }
        
        const uiScene = this.scene.scene.get('UIScene');
        if (uiScene && uiScene.showNotification) {
            uiScene.showNotification(`选择了: ${option.name}`, 'success', 3000);
        }
        
        console.log(`应用肉鸽buff: ${option.name} - ${option.description}`);
    }

    // 将buff应用到塔上
    applyBuffToTower(tower, buff) {
        if (!tower.permanentBuffs) {
            tower.permanentBuffs = [];
        }
        
        tower.permanentBuffs.push(buff);
        
        // 重新计算塔的属性
        if (tower.recalculateStats) {
            tower.recalculateStats();
        }
    }

    // 应用即时效果
    applyInstantEffect(option) {
        if (option.effect.healthRestore) {
            this.scene.gameState.health = Math.min(
                this.scene.gameState.health + option.effect.healthRestore,
                this.scene.gameState.maxHealth || 100
            );
            
            const uiScene = this.scene.scene.get('UIScene');
            if (uiScene && uiScene.updateHealth) {
                uiScene.updateHealth(this.scene.gameState.health);
            }
        }
        
        if (option.effect.towerShield) {
            // 给所有塔添加护盾
            if (this.scene.towers && this.scene.towers.children) {
                this.scene.towers.children.entries.forEach(tower => {
                    tower.hasShield = true;
                });
            }
        }
    }

    // 肉鸽选择后继续波次
    continueAfterRoguelike() {
        // 正常开始这一波的战斗
        const uiScene = this.scene.scene.get('UIScene');
        const waveInfo = this.getWaveInfo(this.currentWave);
        
        // 显示波次开始提示
        if (uiScene && uiScene.showWaveNotification) {
            const phaseInfo = ` [阶段${this.currentPhase}: ${PHASE_CONFIG[this.currentPhase].name}]`;
            uiScene.showWaveNotification(this.currentWave, true, waveInfo.name + phaseInfo);
        }
        
        // 设置波次参数
        this.setupWaveData();
        
        this.waveInProgress = true;
        this.monstersSpawned = 0;
        this.waveStartTime = this.scene.time.now;
        this.lastSpawnTime = 0;
    }

    // 激活环境事件
    activateEnvironmentEvent() {
        const events = Object.values(ENVIRONMENT_EVENTS);
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        this.activeEnvironmentEvent = randomEvent;
        
        const uiScene = this.scene.scene.get('UIScene');
        if (uiScene && uiScene.showNotification) {
            uiScene.showNotification(`环境事件: ${randomEvent.name} - ${randomEvent.description}`, 'warning', 5000);
        }
        
        console.log(`激活环境事件: ${randomEvent.name}`);
    }

    setupWaveData() {
        const waveInfo = this.getWaveInfo(this.currentWave);
        const phaseConfig = PHASE_CONFIG[this.currentPhase];
        
        // 根据波次类型设置参数
        if (waveInfo.type === 'boss') {
            this.setupBossWave();
        } else if (waveInfo.type === 'high_pressure') {
            this.setupHighPressureWave();
        } else if (waveInfo.type === 'challenge') {
            this.setupChallengeWave();
        } else {
            this.setupNormalWave();
        }
        
        // 应用阶段难度倍数
        if (phaseConfig && phaseConfig.difficultyMultiplier) {
            this.monsterData.health = Math.floor(this.monsterData.health * phaseConfig.difficultyMultiplier);
            this.monsterData.speed = this.monsterData.speed * phaseConfig.difficultyMultiplier;
        }
        
        // 应用环境事件效果
        if (this.activeEnvironmentEvent && this.activeEnvironmentEvent.effect) {
            const effect = this.activeEnvironmentEvent.effect;
            if (effect.monsterHealthMultiplier) {
                this.monsterData.health = Math.floor(this.monsterData.health * effect.monsterHealthMultiplier);
            }
            if (effect.monsterSpeedMultiplier) {
                this.monsterData.speed = this.monsterData.speed * effect.monsterSpeedMultiplier;
            }
        }
    }

    setupNormalWave() {
        // 普通波次
        this.monstersInWave = Math.min(6 + Math.floor(this.currentWave / 3), 20);  // 怪物数量逐渐增加
        
        const baseHealth = 65 * Math.pow(WAVE_CONFIG.MONSTER_HEALTH_SCALE, this.currentWave - 1);
        const baseSpeed = 35 * Math.pow(WAVE_CONFIG.MONSTER_SPEED_SCALE, this.currentWave - 1);
        
        this.monsterData = {
            health: Math.floor(baseHealth),
            speed: Math.min(baseSpeed, 110),
            reward: 2 + Math.floor(this.currentWave / 5),
            isBoss: false
        };
    }

    setupChallengeWave() {
        // 特殊挑战波次 - 更多精英怪
        this.monstersInWave = Math.min(8 + Math.floor(this.currentWave / 3), 15);
        
        const baseHealth = 80 * Math.pow(WAVE_CONFIG.MONSTER_HEALTH_SCALE, this.currentWave - 1);
        const baseSpeed = 40 * Math.pow(WAVE_CONFIG.MONSTER_SPEED_SCALE, this.currentWave - 1);
        
        this.monsterData = {
            health: Math.floor(baseHealth),
            speed: Math.min(baseSpeed, 120),
            reward: 4 + Math.floor(this.currentWave / 4),
            isBoss: false,
            forceElite: true // 强制生成精英怪
        };
    }

    setupHighPressureWave() {
        // 高压波次 - 大量强力怪物
        this.monstersInWave = Math.min(12 + Math.floor(this.currentWave / 2), 25);
        
        const baseHealth = 100 * Math.pow(WAVE_CONFIG.MONSTER_HEALTH_SCALE, this.currentWave - 1);
        const baseSpeed = 45 * Math.pow(WAVE_CONFIG.MONSTER_SPEED_SCALE, this.currentWave - 1);
        
        this.monsterData = {
            health: Math.floor(baseHealth),
            speed: Math.min(baseSpeed, 130),
            reward: 6 + Math.floor(this.currentWave / 3),
            isBoss: false,
            highPressure: true
        };
    }

    setupBossWave() {
        // BOSS波次
        this.monstersInWave = 1;
        
        // Boss血量根据波次和阶段大幅提升
        let bossHealthMultiplier = 1;
        if (this.currentWave === 18) bossHealthMultiplier = 8;  // 第一幕Boss
        else if (this.currentWave === 24) bossHealthMultiplier = 15; // 第二幕Boss
        else if (this.currentWave === 30) bossHealthMultiplier = 25; // 最终Boss
        
        const bossHealth = 800 * bossHealthMultiplier * Math.pow(WAVE_CONFIG.MONSTER_HEALTH_SCALE, this.currentWave - 1);
        
        this.monsterData = {
            health: Math.floor(bossHealth),
            speed: 25 + this.currentWave * 2, // Boss速度缓慢提升
            reward: 100 + this.currentWave * 10,
            isBoss: true,
            bossLevel: this.currentWave === 30 ? 3 : (this.currentWave === 24 ? 2 : 1)
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
            
            // 安全检查：确保怪物数据存在
            if (!this.monsterData) {
                console.error('怪物数据不存在，无法生成怪物');
                return;
            }
            
            const monster = this.scene.spawnMonster(this.monsterData, null, null, isElite, modifiers);
            
            if (monster) {
                this.monstersSpawned++;
                
                const eliteText = isElite ? ' (精英)' : '';
                console.log(`生成第 ${this.monstersSpawned}/${this.monstersInWave} 只怪物${eliteText}`);
            } else {
                console.warn('怪物生成失败');
            }
        } else {
            console.error('场景缺少spawnMonster方法');
        }
    }

    // 判断是否应该生成精英怪
    shouldSpawnElite() {
        if (this.monsterData.isBoss) return false; // BOSS不生成精英怪
        
        // 强制精英怪（挑战波次）
        if (this.monsterData.forceElite) return true;
        
        // 高压波次提高精英怪概率
        let eliteChance = MONSTER_MODIFIERS.ELITE_SPAWN_CHANCE[this.currentPhase] || 0.1;
        if (this.monsterData.highPressure) {
            eliteChance *= 1.5; // 高压波次精英怪概率提升50%
        }
        
        return Math.random() < eliteChance;
    }

    // 生成精英怪的词缀
    generateEliteModifiers() {
        const modifiers = [];
        
        // 安全检查：确保词缀配置存在
        if (!MONSTER_MODIFIERS || !MONSTER_MODIFIERS.MODIFIERS) {
            console.warn('怪物词缀配置不存在，返回空词缀列表');
            return modifiers;
        }
        
        const availableModifiers = Object.keys(MONSTER_MODIFIERS.MODIFIERS);
        
        // 安全检查：确保有可用的词缀
        if (availableModifiers.length === 0) {
            console.warn('没有可用的怪物词缀');
            return modifiers;
        }
        
        // 确定词缀数量
        const isBoss = this.monsterData && this.monsterData.isBoss;
        
        // 安全检查：确保词缀数量配置存在
        if (!MONSTER_MODIFIERS.ELITE_MODIFIER_COUNT) {
            console.warn('精英怪词缀数量配置不存在，使用默认值');
            const modifierCount = isBoss ? 3 : 1;
            const shuffled = [...availableModifiers].sort(() => Math.random() - 0.5);
            for (let i = 0; i < Math.min(modifierCount, shuffled.length); i++) {
                modifiers.push(shuffled[i]);
            }
            return modifiers;
        }
        
        const modifierCount = isBoss 
            ? Phaser.Math.Between(MONSTER_MODIFIERS.ELITE_MODIFIER_COUNT.bossMin, MONSTER_MODIFIERS.ELITE_MODIFIER_COUNT.bossMax)
            : Phaser.Math.Between(MONSTER_MODIFIERS.ELITE_MODIFIER_COUNT.min, MONSTER_MODIFIERS.ELITE_MODIFIER_COUNT.max);
        
        // 高压波次和挑战波次增加词缀数量
        let finalModifierCount = modifierCount;
        if (this.monsterData.highPressure || this.monsterData.forceElite) {
            finalModifierCount = Math.min(finalModifierCount + 1, availableModifiers.length);
        }
        
        // 随机选择词缀
        const shuffled = [...availableModifiers].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(finalModifierCount, shuffled.length); i++) {
            modifiers.push(shuffled[i]);
        }
        
        return modifiers;
    }

    completeWave() {
        this.waveInProgress = false;
        
        // 清除环境事件（如果是挑战波次）
        if (this.isEnvironmentEventWave(this.currentWave)) {
            this.activeEnvironmentEvent = null;
        }
        
        console.log(`第 ${this.currentWave} 波完成`);
        
        // 显示波次完成提示
        const uiScene = this.scene.scene.get('UIScene');
        if (uiScene && uiScene.showWaveNotification) {
            uiScene.showWaveNotification(this.currentWave, false);
        }
        
        // 给予经验奖励（包括永久buff加成）
        if (this.scene.addExperience) {
            let expReward = ECONOMY_CONFIG.EXP_PER_WAVE_END;
            
            // 应用经验加成buff
            this.permanentBuffs.forEach(buff => {
                if (buff.effect.expMultiplier) {
                    expReward = Math.floor(expReward * buff.effect.expMultiplier);
                }
            });
            
            const leveledUp = this.scene.addExperience(expReward, '波次结束');
            if (uiScene && uiScene.showNotification) {
                if (leveledUp) {
                    uiScene.showNotification(`获得 ${expReward} 点经验！升级了！`, 'success', 2000, 'left');
                } else {
                    uiScene.showNotification(`获得 ${expReward} 点经验`, 'success', 1500, 'left');
                }
            }
        }
        
        // 检查游戏是否结束
        if (this.currentWave >= WAVE_CONFIG.TOTAL_WAVES) {
            this.scene.victory();
            return;
        }
        
        // 显示下一波倒计时提示
        if (uiScene && uiScene.showNotification) {
            const nextWave = this.currentWave + 1;
            const nextWaveInfo = this.getWaveInfo(nextWave);
            
            if (this.isBossWave(nextWave)) {
                uiScene.showNotification(`准备迎接Boss！${this.timeBetweenWaves / 1000} 秒后开始第 ${nextWave} 波: ${nextWaveInfo.name}`, 'warning', this.timeBetweenWaves - 500);
            } else if (this.isRoguelikeWave(nextWave)) {
                uiScene.showNotification(`即将进入成长选择！${this.timeBetweenWaves / 1000} 秒后开始第 ${nextWave} 波`, 'info', this.timeBetweenWaves - 500);
            } else {
                uiScene.showNotification(`${this.timeBetweenWaves / 1000} 秒后开始第 ${nextWave} 波: ${nextWaveInfo.name}`, 'info', this.timeBetweenWaves - 500);
            }
        }
        
        // 波次完成后自动刷新商店（除非被锁定）
        if (this.scene.towerShop) {
            if (!this.scene.towerShop.getIsLocked()) {
                this.scene.towerShop.refreshShop();
                if (uiScene && uiScene.showNotification) {
                    uiScene.showNotification('商店已自动刷新！', 'info', 2000);
                }
            } else {
                if (uiScene && uiScene.showNotification) {
                    uiScene.showNotification('商店已锁定，跳过自动刷新', 'info', 2000);
                }
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

    getCurrentPhase() {
        return this.currentPhase;
    }

    isWaveInProgress() {
        return this.waveInProgress;
    }

    getRemainingMonsters() {
        return this.monstersInWave - this.monstersSpawned;
    }

    // 获取当前活跃的永久buff列表
    getPermanentBuffs() {
        return this.permanentBuffs;
    }

    // 获取当前环境事件
    getActiveEnvironmentEvent() {
        return this.activeEnvironmentEvent;
    }

    // 停止波次管理器
    stopWave() {
        this.waveInProgress = false;
        this.monstersSpawned = 0;
        this.monstersInWave = 0;
        
        // 清理环境事件
        this.activeEnvironmentEvent = null;
        
        // 清理所有怪物
        if (this.scene.monsters && this.scene.monsters.children) {
            this.scene.monsters.children.entries.forEach(monster => {
                if (monster && monster.destroy) {
                    monster.destroy();
                }
            });
        }
        
        console.log('波次已停止');
    }

    forceEndWave() {
        if (!this.waveInProgress) {
            console.log('当前没有进行中的波次');
            return;
        }
        
        console.log(`强制结束第 ${this.currentWave} 波`);
        
        // 直接完成当前波次
        this.completeWave();
        
        // 显示GM提示
        const uiScene = this.scene.scene.get('UIScene');
        if (uiScene && uiScene.showNotification) {
            uiScene.showNotification(`GM工具：强制结束第 ${this.currentWave} 波`, 'info', 2000);
        }
    }
} 