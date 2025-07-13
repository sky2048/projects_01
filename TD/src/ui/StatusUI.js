import { ECONOMY_CONFIG, TOWER_RARITY, LEVEL_RARITY_MODIFIERS } from '../config/GameConfig.js';
import { globalObjectPool } from '../utils/ObjectPool.js';

// UI布局常量
const UI_LAYOUT = {
    STATUS_BAR: {
        Y: 560,
        CENTER_X: 640,
        TRAPEZOID_WIDTH: 160,
        TRAPEZOID_HEIGHT: 40,
        SKEW: 15,
        GAP: 15
    },
    LEVEL_SECTION: {
        X: 180,
        Y: 610,
        EXP_BAR_WIDTH: 120,
        EXP_BAR_HEIGHT: 8,
        BUTTON_WIDTH: 120,
        BUTTON_HEIGHT: 25
    },
    PROBABILITY_SECTION: {
        X: 50,
        Y: 420,
        LINE_HEIGHT: 18
    }
};

// 文本样式常量
const TEXT_STYLES = {
    MAIN_STATUS: {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
    },
    LEVEL_TEXT: {
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    },
    EXP_TEXT: {
        fontSize: '14px',
        fill: '#00ff88',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    },
    BUTTON_TEXT: {
        fontSize: '10px',
        fill: '#ffffff',
        fontFamily: 'Arial, sans-serif'
    }
};

// 颜色主题常量
const COLOR_THEMES = {
    HEALTH: {
        HIGH: { bg: 0x44ff44, icon: 0x44ff44, stroke: 0x00ff00 },
        MEDIUM: { bg: 0xffaa00, icon: 0xffaa00, stroke: 0xff8800 },
        LOW: { bg: 0xff4444, icon: 0xff4444, stroke: 0xff0000 }
    },
    TOWER_LIMIT: {
        FULL: { bg: 0xff4444, icon: '🔴' },
        HIGH: { bg: 0xffaa00, icon: '🟠' },
        NORMAL: { bg: 0x4488ff, icon: '🏰' }
    }
};

export class StatusUI {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
        this.cachedGameScene = null; // 缓存游戏场景引用
        
        // 确保elements对象总是被正确初始化
        this.resetElements();
    }

    resetElements() {
        // 重置所有UI元素引用
        this.elements = {
            // 状态栏元素
            goldText: null,
            goldBackground: null,
            goldBackgroundGlow: null,
            goldIcon: null,
            healthText: null,
            healthBackground: null,
            healthBackgroundGlow: null,
            healthIcon: null,
            towerLimitText: null,
            towerLimitBackground: null,
            towerLimitBackgroundGlow: null,
            towerLimitIcon: null,
            
            // 波次显示元素
            waveText: null,
            mapNameText: null,
            selectedTowerInfo: null,
            
            // 等级和经验元素
            levelText: null,
            experienceValueText: null,
            expBarBackground: null,
            expBarForeground: null,
            upgradeButton: null,
            upgradeText: null,
            refreshButton: null,
            refreshText: null,
            
            // 品质概率显示
            probabilityTitle: null,
            probabilityList: [],
            
            // 版本显示
            versionText: null
        };
    }

    create() {
        // 重置elements对象，确保干净的状态
        this.resetElements();
        
        console.log('StatusUI create 开始...');
        
        try {
            this.createStatusBar();
            this.createWaveDisplay();
            this.createLevelAndExperience();
            this.createRarityProbabilityDisplay();
            this.createVersionDisplay();
            
            console.log('StatusUI create 完成');
        } catch (error) {
            console.error('StatusUI创建失败:', error);
            throw error;
        }
    }

    // 创建梯形背景的通用方法
    createTrapezoidBackground(x, y, strokeColor, fillColor = 0x1a1a2e) {
        const { TRAPEZOID_WIDTH, TRAPEZOID_HEIGHT, SKEW } = UI_LAYOUT.STATUS_BAR;
        
        const trapezoidPoints = [
            SKEW, 0,
            TRAPEZOID_WIDTH, 0,
            TRAPEZOID_WIDTH - SKEW, TRAPEZOID_HEIGHT,
            0, TRAPEZOID_HEIGHT
        ];
        
        const background = this.scene.add.polygon(x, y, trapezoidPoints, fillColor);
        background.setStrokeStyle(3, strokeColor, 1);
        
        const glow = this.scene.add.polygon(x, y, trapezoidPoints, strokeColor & 0x444444, 0.7);
        
        return { background, glow };
    }

    createStatusBar() {
        const { Y, CENTER_X, GAP } = UI_LAYOUT.STATUS_BAR;
        const { TRAPEZOID_WIDTH } = UI_LAYOUT.STATUS_BAR;
        
        // 血量显示（左侧）
        const healthDisplayX = CENTER_X - TRAPEZOID_WIDTH - GAP;
        const healthBg = this.createTrapezoidBackground(healthDisplayX, Y, 0xff4444);
        this.elements.healthBackground = healthBg.background;
        this.elements.healthBackgroundGlow = healthBg.glow;
        
        this.elements.healthIcon = this.scene.add.circle(healthDisplayX - 35, Y, 12, 0xff4444);
        this.elements.healthIcon.setStrokeStyle(2, 0xff0000);
        
        this.elements.healthText = this.scene.add.text(healthDisplayX + 5, Y, '100', TEXT_STYLES.MAIN_STATUS);
        this.elements.healthText.setOrigin(0.5, 0.5);
        
        // 塔位显示（中间）
        const towerLimitBg = this.createTrapezoidBackground(CENTER_X, Y, 0x4488ff);
        this.elements.towerLimitBackground = towerLimitBg.background;
        this.elements.towerLimitBackgroundGlow = towerLimitBg.glow;
        
        this.elements.towerLimitIcon = this.scene.add.text(CENTER_X - 35, Y, '🏰', {
            fontSize: '16px'
        });
        this.elements.towerLimitIcon.setOrigin(0.5);
        
        this.elements.towerLimitText = this.scene.add.text(CENTER_X + 5, Y, '0/2', TEXT_STYLES.MAIN_STATUS);
        this.elements.towerLimitText.setOrigin(0.5, 0.5);
        
        // 金币显示（右侧）
        const goldDisplayX = CENTER_X + TRAPEZOID_WIDTH + GAP;
        const goldBg = this.createTrapezoidBackground(goldDisplayX, Y, 0xffd700);
        this.elements.goldBackground = goldBg.background;
        this.elements.goldBackgroundGlow = goldBg.glow;
        
        this.elements.goldIcon = this.scene.add.circle(goldDisplayX - 35, Y, 12, 0xffd700);
        this.elements.goldIcon.setStrokeStyle(2, 0xffaa00);
        
        this.elements.goldText = this.scene.add.text(goldDisplayX + 5, Y, '100', TEXT_STYLES.MAIN_STATUS);
        this.elements.goldText.setOrigin(0.5, 0.5);
    }

    createWaveDisplay() {
        // 地图名称显示（上方左侧）
        this.elements.mapNameText = this.scene.add.text(120, 30, '', {
            fontSize: '18px',
            fill: '#88dd88',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.elements.mapNameText.setOrigin(0.5, 0.5);

        // 波次显示（移至上方居中）
        this.elements.waveText = this.scene.add.text(640, 30, '波次: 1/30', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.elements.waveText.setOrigin(0.5, 0.5);

        // 阶段和波次详情显示
        this.elements.phaseInfoText = this.scene.add.text(640, 55, '', {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 1
        });
        this.elements.phaseInfoText.setOrigin(0.5, 0.5);

        // 选中塔的信息显示
        this.elements.selectedTowerInfo = this.scene.add.text(640, 80, '', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 1
        });
        this.elements.selectedTowerInfo.setOrigin(0.5);
    }

    createLevelAndExperience() {
        const { X, Y, EXP_BAR_WIDTH, EXP_BAR_HEIGHT, BUTTON_WIDTH, BUTTON_HEIGHT } = UI_LAYOUT.LEVEL_SECTION;
        
        // 等级和经验文本显示 - 在同一行
        this.elements.levelText = this.scene.add.text(X - 30, Y, '1级', TEXT_STYLES.LEVEL_TEXT);
        this.elements.levelText.setOrigin(0.5, 0.5);

        this.elements.experienceValueText = this.scene.add.text(X + 30, Y, '0/15', TEXT_STYLES.EXP_TEXT);
        this.elements.experienceValueText.setOrigin(0.5, 0.5);

        // 经验进度条 - 位于等级文本下方
        const expBarY = Y + 16;
        
        this.elements.expBarBackground = this.scene.add.rectangle(X, expBarY, EXP_BAR_WIDTH, EXP_BAR_HEIGHT, 0x333333);
        this.elements.expBarBackground.setStrokeStyle(2, 0x666666);
        
        this.elements.expBarForeground = this.scene.add.rectangle(X - EXP_BAR_WIDTH/2, expBarY, 0, EXP_BAR_HEIGHT, 0x00ff88);
        this.elements.expBarForeground.setOrigin(0, 0.5);
        
        // 购买经验按钮
        const expButtonY = expBarY + 26;
        this.elements.upgradeButton = this.scene.add.rectangle(X, expButtonY, BUTTON_WIDTH, BUTTON_HEIGHT, 0x28a745);
        this.elements.upgradeText = this.scene.add.text(X, expButtonY, `购买经验(-${ECONOMY_CONFIG.EXP_BUTTON_COST})`, TEXT_STYLES.BUTTON_TEXT);
        this.elements.upgradeText.setOrigin(0.5);

        this.elements.upgradeButton.setInteractive();
        this.elements.upgradeButton.on('pointerdown', () => {
            this.scene.handleBuyExperience();
        });

        // 刷新按钮
        const refreshButtonY = expButtonY + 35;
        this.elements.refreshButton = this.scene.add.rectangle(X, refreshButtonY, BUTTON_WIDTH, BUTTON_HEIGHT, 0x4a90e2);
        this.elements.refreshText = this.scene.add.text(X, refreshButtonY, `刷新商店(-${ECONOMY_CONFIG.REFRESH_COST})`, TEXT_STYLES.BUTTON_TEXT);
        this.elements.refreshText.setOrigin(0.5);

        this.elements.refreshButton.setInteractive();
        this.elements.refreshButton.on('pointerdown', () => {
            this.scene.handleRefreshShop();
        });
    }

    createRarityProbabilityDisplay() {
        const { X, Y, LINE_HEIGHT } = UI_LAYOUT.PROBABILITY_SECTION;
        
        // 标题
        this.elements.probabilityTitle = this.scene.add.text(X, Y, '品质概率', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });

        // 品质概率列表
        this.elements.probabilityList = [];
        let index = 0;
        
        for (const [rarityKey, rarityData] of Object.entries(TOWER_RARITY)) {
            const probabilityText = this.scene.add.text(
                X, 
                Y + 25 + index * LINE_HEIGHT,
                '',
                {
                    fontSize: '13px',
                    fill: rarityData.color === 0xffffff ? '#cccccc' : `#${rarityData.color.toString(16).padStart(6, '0')}`,
                    fontFamily: 'Arial, sans-serif'
                }
            );
            probabilityText.rarityKey = rarityKey;
            this.elements.probabilityList.push(probabilityText);
            index++;
        }
        
        // 初始化显示
        this.updateRarityProbabilities();
    }

    createVersionDisplay() {
        // 显示版本号 - 移到左上角
        this.elements.versionText = this.scene.add.text(20, 20, 'v0.1.5', {
            fontSize: '12px',
            fill: '#888888',
            fontFamily: 'Arial, sans-serif'
        });
        this.elements.versionText.setOrigin(0, 0);
    }

    // 获取缓存的游戏场景
    getGameScene() {
        if (!this.cachedGameScene) {
            this.cachedGameScene = this.scene.scene.get('GameScene');
        }
        return this.cachedGameScene;
    }

    // 安全更新文本的通用方法
    safeUpdateText(element, text, fallback = '') {
        if (element && element.setText) {
            try {
                element.setText(text);
                return true;
            } catch (error) {
                console.warn('文本更新失败:', error);
                if (fallback) {
                    try {
                        element.setText(fallback);
                    } catch (e) {
                        console.error('fallback文本更新也失败:', e);
                    }
                }
                return false;
            }
        }
        return false;
    }

    updateGold(amount, changeAmount = null) {
        if (this.elements.goldText) {
            this.safeUpdateText(this.elements.goldText, amount.toString());
            
            // 添加跳动动画效果
            this.scene.tweens.add({
                targets: this.elements.goldText,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 150,
                ease: 'Back.easeOut',
                yoyo: true,
                repeat: 0
            });
            
            // 显示变化数值
            if (changeAmount !== null && changeAmount !== 0) {
                this.showChangeNumber(this.elements.goldText, changeAmount, changeAmount > 0 ? '#00ff00' : '#ff4444');
            }
        }
    }

    updateHealth(amount, changeAmount = null) {
        if (this.elements.healthText) {
            this.safeUpdateText(this.elements.healthText, amount.toString());
            
            // 添加跳动动画效果
            this.scene.tweens.add({
                targets: this.elements.healthText,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 150,
                ease: 'Back.easeOut',
                yoyo: true,
                repeat: 0
            });
            
            // 显示变化数值
            if (changeAmount !== null && changeAmount !== 0) {
                this.showChangeNumber(this.elements.healthText, changeAmount, changeAmount > 0 ? '#00ff00' : '#ff4444');
            }
            
            // 根据生命值改变边框和图标颜色
            this.updateHealthVisuals(amount);
        }
    }

    // 提取血量视觉更新逻辑
    updateHealthVisuals(amount) {
        if (!this.elements.healthBackground || !this.elements.healthIcon) return;
        
        let theme;
        if (amount > 70) {
            theme = COLOR_THEMES.HEALTH.HIGH;
        } else if (amount > 30) {
            theme = COLOR_THEMES.HEALTH.MEDIUM;
        } else {
            theme = COLOR_THEMES.HEALTH.LOW;
        }
        
        this.elements.healthBackground.setStrokeStyle(3, theme.bg, 1);
        this.elements.healthIcon.setFillStyle(theme.icon);
        this.elements.healthIcon.setStrokeStyle(2, theme.stroke);
    }

    updateWave(wave, phase = null, waveInfo = null) {
        this.safeUpdateText(this.elements.waveText, `波次: ${wave}/30`);
        
        // 更新阶段信息显示
        if (phase && waveInfo) {
            const phaseWave = ((wave - 1) % 6) + 1; // 阶段内波次 (1-6)
            const phaseText = `阶段 ${phase}-${phaseWave}: ${waveInfo.name}`;
            this.safeUpdateText(this.elements.phaseInfoText, phaseText);
        }
    }

    updateMapName(mapName) {
        this.safeUpdateText(this.elements.mapNameText, mapName);
    }

    updateLevel(level, maxTowers) {
        this.safeUpdateText(this.elements.levelText, `${level}级`);
        
        // 更新塔位显示
        const gameScene = this.getGameScene();
        const currentTowers = gameScene && gameScene.towers && gameScene.towers.children && gameScene.towers.children.entries 
            ? gameScene.towers.children.entries.length 
            : 0;
            
        this.safeUpdateText(this.elements.towerLimitText, `${currentTowers}/${maxTowers}`);
        
        // 更新塔位视觉效果
        this.updateTowerLimitVisuals(currentTowers, maxTowers);
        
        // 更新经验按钮显示
        this.safeUpdateText(this.elements.upgradeText, `购买经验(-${ECONOMY_CONFIG.EXP_BUTTON_COST})`);
        
        // 更新品质概率显示
        this.updateRarityProbabilities();
    }

    // 提取塔位视觉更新逻辑
    updateTowerLimitVisuals(currentTowers, maxTowers) {
        if (!this.elements.towerLimitBackground || !this.elements.towerLimitIcon) return;
        
        const usage = currentTowers / maxTowers;
        let theme;
        
        if (usage >= 1) {
            theme = COLOR_THEMES.TOWER_LIMIT.FULL;
        } else if (usage >= 0.8) {
            theme = COLOR_THEMES.TOWER_LIMIT.HIGH;
        } else {
            theme = COLOR_THEMES.TOWER_LIMIT.NORMAL;
        }
        
        this.elements.towerLimitBackground.setStrokeStyle(3, theme.bg, 1);
        this.safeUpdateText(this.elements.towerLimitIcon, theme.icon);
    }

    // 更新品质概率显示
    updateRarityProbabilities() {
        const gameScene = this.getGameScene();
        if (!gameScene || !gameScene.gameState) return;
        
        // 检查probabilityList是否存在
        if (!this.elements.probabilityList || !Array.isArray(this.elements.probabilityList)) {
            console.warn('probabilityList未初始化，跳过更新');
            return;
        }
        
        const playerLevel = gameScene.gameState.level;
        
        // 获取当前等级的概率配置
        let levelModifiers = LEVEL_RARITY_MODIFIERS[playerLevel];
        if (!levelModifiers) {
            // 如果等级超过配置范围，使用最高等级的概率
            const maxLevel = Math.max(...Object.keys(LEVEL_RARITY_MODIFIERS).map(Number));
            levelModifiers = LEVEL_RARITY_MODIFIERS[maxLevel];
        }
        
        // 安全检查：确保levelModifiers存在
        if (!levelModifiers) {
            console.warn('无法获取等级概率修饰符，使用默认值');
            levelModifiers = LEVEL_RARITY_MODIFIERS[1]; // 使用1级作为默认值
        }
        
        // 更新每个概率文本
        this.elements.probabilityList.forEach((probabilityText, index) => {
            // 安全检查：确保probabilityText存在且有效
            if (!probabilityText || typeof probabilityText.setText !== 'function') {
                console.warn(`概率文本元素[${index}]无效，跳过更新`);
                return;
            }
            
            // 安全检查：确保rarityKey存在
            if (!probabilityText.rarityKey) {
                console.warn(`概率文本元素[${index}]缺少rarityKey，跳过更新`);
                return;
            }
            
            const rarityKey = probabilityText.rarityKey;
            const rarityData = TOWER_RARITY[rarityKey];
            
            // 安全检查：确保rarityData存在
            if (!rarityData) {
                console.warn(`品质数据不存在: ${rarityKey}`);
                return;
            }
            
            const probability = levelModifiers[rarityKey];
            
            if (probability !== undefined && probability > 0) {
                // 显示可用的品质
                const percentage = (probability * 100).toFixed(1);
                this.safeUpdateText(probabilityText, `${rarityData.name}: ${percentage}%`);
                probabilityText.setAlpha(1.0);
                probabilityText.setVisible(true);
            } else {
                // 显示未解锁的品质
                const unlockLevel = this.getRarityUnlockLevel(rarityKey);
                if (unlockLevel > playerLevel) {
                    this.safeUpdateText(probabilityText, `${rarityData.name}: ${unlockLevel}级解锁`);
                    probabilityText.setAlpha(0.5);
                    probabilityText.setVisible(true);
                } else {
                    probabilityText.setVisible(false);
                }
            }
        });
    }

    // 获取品质解锁等级
    getRarityUnlockLevel(rarityKey) {
        const unlockLevels = {
            'WHITE': 1,
            'GREEN': 1,
            'BLUE': 3,
            'PURPLE': 5,
            'ORANGE': 7
        };
        return unlockLevels[rarityKey] || 1;
    }

    updateExperience(currentExp, expRequiredForNext) {
        // 更新经验数值显示
        this.safeUpdateText(this.elements.experienceValueText, `${currentExp}/${expRequiredForNext}`);
        
        // 更新经验进度条
        if (this.elements.expBarForeground && this.elements.expBarForeground.setSize && expRequiredForNext > 0) {
            try {
                const progress = currentExp / expRequiredForNext;
                const maxWidth = UI_LAYOUT.LEVEL_SECTION.EXP_BAR_WIDTH;
                const currentWidth = maxWidth * progress;
                
                this.elements.expBarForeground.setSize(currentWidth, UI_LAYOUT.LEVEL_SECTION.EXP_BAR_HEIGHT);
                
                // 根据进度改变颜色
                if (progress >= 0.8) {
                    this.elements.expBarForeground.setFillStyle(0xffd700);
                } else if (progress >= 0.5) {
                    this.elements.expBarForeground.setFillStyle(0x44ff44);
                } else {
                    this.elements.expBarForeground.setFillStyle(0x00ff88);
                }
            } catch (error) {
                console.warn('updateExperience进度条更新失败:', error);
            }
        }
    }

    showTowerInfo(tower) {
        if (tower) {
            const damage = tower.damage || 0;
            const range = tower.range || 0;
            const attackSpeed = tower.attackSpeed || 1;
            const rarity = tower.rarity || 'COMMON';
            
            const info = `${tower.name} (${this.scene.TOWER_RARITY[rarity].name})\n` +
                        `伤害: ${damage} | 射程: ${range} | 攻速: ${attackSpeed.toFixed(1)}`;
            this.safeUpdateText(this.elements.selectedTowerInfo, info);
        } else {
            this.safeUpdateText(this.elements.selectedTowerInfo, '选择一个塔查看详情');
        }
    }

    showSelectedTowerInfo(tower) {
        const damage = tower.damage || 0;
        const range = tower.range || 0;
        const attackSpeed = tower.attackSpeed || 1;
        const rarity = tower.rarity || 'COMMON';
        
        const info = `已选中: ${tower.towerData.name} (${this.scene.TOWER_RARITY[rarity].name})\n` +
                    `伤害: ${damage} | 射程: ${range} | 攻速: ${attackSpeed.toFixed(1)}`;
        this.safeUpdateText(this.elements.selectedTowerInfo, info);
    }

    clearSelectedTowerInfo() {
        this.safeUpdateText(this.elements.selectedTowerInfo, '');
    }

    // 显示变化数值
    showChangeNumber(targetElement, changeAmount, color) {
        if (!targetElement || !this.scene || !this.scene.add) return;
        
        // 计算显示位置：右上偏左一点
        const offsetX = 25;
        const offsetY = -15;
        const displayX = targetElement.x + offsetX;
        const displayY = targetElement.y + offsetY;
        
        // 直接创建文本对象，避免对象池在游戏重新开始时的问题
        const changeText = this.scene.add.text(
            displayX, 
            displayY, 
            (changeAmount > 0 ? '+' : '') + changeAmount.toString(),
            {
                fontSize: '16px',
                fill: color,
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        
        if (!changeText) return;
        
        changeText.setOrigin(0.5);
        
        // 添加上浮和渐隐动画
        this.scene.tweens.add({
            targets: changeText,
            y: displayY - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // 直接销毁文本对象
                if (changeText && changeText.destroy) {
                    changeText.destroy();
                }
            }
        });
        
        // 添加轻微的缩放效果
        this.scene.tweens.add({
            targets: changeText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            ease: 'Back.easeOut',
            yoyo: true,
            repeat: 0
        });
    }

    setInteractive(interactive) {
        if (this.elements.refreshButton) this.elements.refreshButton.setInteractive(interactive);
        if (this.elements.upgradeButton) this.elements.upgradeButton.setInteractive(interactive);
    }
} 