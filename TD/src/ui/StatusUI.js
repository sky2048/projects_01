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
            
            // 波次指示器元素
            waveBarBackground: null,
            waveText: null,
            stageNameText: null,
            currentRoundBackground: null,
            roundTypeIcon: null,
            roundStatusText: null,
            currentRoundInfo: null,
            countdownText: null,
            playPauseButton: null,
            waveProgressBackground: null,
            waveProgressForeground: null,
            selectedTowerInfo: null,

            // 阶段波次时间轴
            waveTimeline: [],
            
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
        // 紧凑的波次时间轴配置
        const waveConfig = {
            x: 640,
            y: 20,
            width: 700,
            height: 40,
            progressBarY: 65,
            progressBarWidth: 700,
            progressBarHeight: 4
        };

        // 创建主背景条
        this.elements.waveBarBackground = this.scene.add.rectangle(
            waveConfig.x, waveConfig.y, 
            waveConfig.width, waveConfig.height, 
            0x2d3748, 0.9
        );
        this.elements.waveBarBackground.setStrokeStyle(1, 0x4a5568, 0.8);

        // 当前阶段与回合显示 (左侧)
        this.elements.waveText = this.scene.add.text(waveConfig.x - 300, waveConfig.y, '🏆 1-1', {
            fontSize: '14px',
            fill: '#c6a876',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        this.elements.waveText.setOrigin(0.5, 0.5);

        // 阶段名称显示
        this.elements.stageNameText = this.scene.add.text(waveConfig.x - 220, waveConfig.y, '前期-铺垫', {
            fontSize: '12px',
            fill: '#888888',
            fontFamily: 'Arial, sans-serif'
        });
        this.elements.stageNameText.setOrigin(0.5, 0.5);

        // 创建阶段波次时间轴 - 增加间距避免重叠
        this.elements.waveTimeline = [];
        const timelineStartX = waveConfig.x - 120;  // 调整起始位置
        const timelineY = waveConfig.y;  // 与主背景条同一水平线
        const slotWidth = 40;  // 略微减小槽位宽度
        const slotHeight = 32; // 保持高度
        const slotSpacing = 12; // 增加间距到12px
        
        for (let i = 0; i < 6; i++) {
            const slotX = timelineStartX + (i * (slotWidth + slotSpacing));
            
            // 波次槽位背景
            const slotBackground = this.scene.add.rectangle(
                slotX, timelineY, 
                slotWidth, slotHeight, 
                0x1a202c, 0.8
            );
            slotBackground.setStrokeStyle(1, 0x4a5568, 0.6);
            
            // 波次图标容器
            const iconGraphics = this.scene.add.graphics();
            iconGraphics.x = slotX;
            iconGraphics.y = timelineY - 6;
            
            // 波次编号文本
            const waveNumberText = this.scene.add.text(slotX, timelineY - 12, `${i + 1}`, {
                fontSize: '10px',
                fill: '#cccccc',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold'
            });
            waveNumberText.setOrigin(0.5, 0.5);
            
            // 波次类型文本（显示在下方）
            const waveTypeText = this.scene.add.text(slotX, timelineY + 10, '普通', {
                fontSize: '8px',
                fill: '#888888',
                fontFamily: 'Arial, sans-serif'
            });
            waveTypeText.setOrigin(0.5, 0.5);
            
            this.elements.waveTimeline.push({
                background: slotBackground,
                icon: iconGraphics,
                numberText: waveNumberText,
                typeText: waveTypeText,
                isCompleted: false,
                isCurrent: false
            });
        }

        // 当前回合状态文字（右侧）
        this.elements.roundStatusText = this.scene.add.text(waveConfig.x + 200, waveConfig.y - 5, '准备阶段', {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        this.elements.roundStatusText.setOrigin(0.5, 0.5);

        // 当前回合详细信息
        this.elements.currentRoundInfo = this.scene.add.text(waveConfig.x + 200, waveConfig.y + 8, '点击开始下一回合', {
            fontSize: '9px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        });
        this.elements.currentRoundInfo.setOrigin(0.5, 0.5);

        // 倒计时显示
        this.elements.countdownText = this.scene.add.text(waveConfig.x + 280, waveConfig.y, '0', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        this.elements.countdownText.setOrigin(0.5, 0.5);

        // 暂停/播放按钮
        this.elements.playPauseButton = this.scene.add.text(waveConfig.x + 340, waveConfig.y, '▶️', {
            fontSize: '14px'
        });
        this.elements.playPauseButton.setOrigin(0.5, 0.5);
        this.elements.playPauseButton.setInteractive({ useHandCursor: true });

        // 创建底部进度条
        const progressX = waveConfig.x;
        const progressY = waveConfig.progressBarY;
        
        // 进度条背景
        this.elements.waveProgressBackground = this.scene.add.rectangle(
            progressX, progressY,
            waveConfig.progressBarWidth, waveConfig.progressBarHeight,
            0x1a202c, 0.8
        );
        this.elements.waveProgressBackground.setStrokeStyle(1, 0x2d3748, 1);

        // 进度条前景
        this.elements.waveProgressForeground = this.scene.add.rectangle(
            progressX - waveConfig.progressBarWidth/2, progressY,
            0, waveConfig.progressBarHeight,
            0x48bb78, 1
        );
        this.elements.waveProgressForeground.setOrigin(0, 0.5);

        // 选中塔的信息显示
        this.elements.selectedTowerInfo = this.scene.add.text(640, 90, '', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 1
        });
        this.elements.selectedTowerInfo.setOrigin(0.5);

        // 初始化时间轴状态 - 确保创建后立即更新到当前波次
        this.scene.time.delayedCall(100, () => {
            const gameScene = this.getGameScene();
            if (gameScene && gameScene.waveManager) {
                const currentWave = gameScene.waveManager.getCurrentWave();
                if (currentWave > 0) {
                    this.updateWave(currentWave, null, gameScene.waveManager.getWaveInfo(currentWave));
                }
            }
        });
    }

    // 绘制回合类型图标
    drawRoundTypeIcon(type) {
        if (!this.elements.roundTypeIcon) return;
        
        const graphics = this.elements.roundTypeIcon;
        graphics.clear();
        
        switch(type) {
            case 'pve':
                // 绘制野怪图标 - 石头怪物
                graphics.fillStyle(0x8b7355); // 石头棕色
                graphics.fillCircle(0, 0, 8);
                
                // 眼睛
                graphics.fillStyle(0xff4444);
                graphics.fillCircle(-3, -2, 1.5);
                graphics.fillCircle(3, -2, 1.5);
                
                // 嘴巴
                graphics.lineStyle(1, 0x000000);
                graphics.beginPath();
                graphics.arc(0, 2, 2, 0, Math.PI);
                graphics.strokePath();
                
                // 石头纹理
                graphics.fillStyle(0x6b5b47);
                graphics.fillCircle(-2, -4, 1);
                graphics.fillCircle(4, 1, 1);
                graphics.fillCircle(-4, 3, 1);
                break;
                
            case 'boss':
                // 绘制BOSS图标 - 王冠
                graphics.fillStyle(0xffd700); // 金色
                graphics.fillTriangle(-6, 2, 0, -6, 6, 2);
                graphics.fillRect(-8, 2, 16, 4);
                
                // 宝石
                graphics.fillStyle(0xff4444);
                graphics.fillCircle(-4, 0, 1.5);
                graphics.fillStyle(0x4444ff);
                graphics.fillCircle(0, -2, 1.5);
                graphics.fillStyle(0x44ff44);
                graphics.fillCircle(4, 0, 1.5);
                break;
                
            case 'elite':
                // 绘制精英图标 - 闪电
                graphics.fillStyle(0xffaa00);
                graphics.fillTriangle(-2, -6, 2, -2, -1, 0);
                graphics.fillTriangle(1, 0, -2, 2, 2, 6);
                
                // 发光效果
                graphics.fillStyle(0xffff44, 0.5);
                graphics.fillTriangle(-3, -7, 3, -3, -2, -1);
                graphics.fillTriangle(2, -1, -3, 3, 3, 7);
                break;
                
            case 'augment':
                // 绘制强化图标 - 魔法水晶
                graphics.fillStyle(0x8b5cf6);
                graphics.fillTriangle(0, -6, -4, 2, 4, 2);
                graphics.fillTriangle(0, 6, -4, -2, 4, -2);
                
                // 发光效果
                graphics.fillStyle(0xc084fc, 0.6);
                graphics.fillCircle(0, 0, 3);
                break;
                
            default:
                // 默认战斗图标 - 交叉剑
                graphics.lineStyle(2, 0xcccccc);
                graphics.beginPath();
                graphics.moveTo(-5, -5);
                graphics.lineTo(5, 5);
                graphics.moveTo(5, -5);
                graphics.lineTo(-5, 5);
                graphics.strokePath();
                
                // 剑柄
                graphics.fillStyle(0x8b4513);
                graphics.fillRect(-1, 4, 2, 3);
                graphics.fillRect(4, -1, 3, 2);
                break;
        }
    }

    // 绘制波次时间轴图标
    drawWaveTimelineIcon(graphics, type, isCompleted, isCurrent) {
        graphics.clear();
        
        const iconSize = 6; // 放大2倍：3 * 2
        const centerX = 0;
        const centerY = 0;
        
        // 根据状态设置颜色
        let iconColor = 0x666666;
        let strokeColor = 0x888888;
        
        if (isCompleted) {
            iconColor = 0x48bb78;
            strokeColor = 0x5fd688;
        } else if (isCurrent) {
            iconColor = 0xffd700;
            strokeColor = 0xffed4a;
        }
        
        // 根据波次类型绘制不同图标
        switch (type) {
            case 'normal':
                // 普通波次：圆形
                graphics.fillStyle(iconColor, 1);
                graphics.lineStyle(2, strokeColor, 1);
                graphics.fillCircle(centerX, centerY, iconSize);
                graphics.strokeCircle(centerX, centerY, iconSize);
                break;
                
            case 'roguelike':
                // 肉鸽波次：菱形
                graphics.fillStyle(iconColor, 1);
                graphics.lineStyle(2, strokeColor, 1);
                graphics.beginPath();
                graphics.moveTo(centerX, centerY - iconSize);
                graphics.lineTo(centerX + iconSize, centerY);
                graphics.lineTo(centerX, centerY + iconSize);
                graphics.lineTo(centerX - iconSize, centerY);
                graphics.closePath();
                graphics.fillPath();
                graphics.strokePath();
                break;
                
            case 'challenge':
                // 挑战波次：三角形
                graphics.fillStyle(iconColor, 1);
                graphics.lineStyle(2, strokeColor, 1);
                graphics.beginPath();
                graphics.moveTo(centerX, centerY - iconSize);
                graphics.lineTo(centerX + iconSize, centerY + iconSize);
                graphics.lineTo(centerX - iconSize, centerY + iconSize);
                graphics.closePath();
                graphics.fillPath();
                graphics.strokePath();
                break;
                
            case 'high_pressure':
                // 高压波次：星形
                graphics.fillStyle(iconColor, 1);
                graphics.lineStyle(2, strokeColor, 1);
                this.drawStar(graphics, centerX, centerY, iconSize, 5);
                break;
                
            case 'boss':
                // Boss波次：皇冠形状
                graphics.fillStyle(iconColor, 1);
                graphics.lineStyle(2, strokeColor, 1);
                this.drawCrown(graphics, centerX, centerY, iconSize);
                break;
                
            default:
                // 默认：圆形
                graphics.fillStyle(iconColor, 1);
                graphics.lineStyle(2, strokeColor, 1);
                graphics.fillCircle(centerX, centerY, iconSize);
                graphics.strokeCircle(centerX, centerY, iconSize);
                break;
        }
    }
    
    // 绘制星形辅助方法
    drawStar(graphics, x, y, radius, points) {
        const angle = Math.PI / points;
        graphics.beginPath();
        for (let i = 0; i < 2 * points; i++) {
            const r = (i % 2 === 0) ? radius : radius * 0.5;
            const currentAngle = i * angle - Math.PI / 2;
            const px = x + Math.cos(currentAngle) * r;
            const py = y + Math.sin(currentAngle) * r;
            if (i === 0) {
                graphics.moveTo(px, py);
            } else {
                graphics.lineTo(px, py);
            }
        }
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
    
    // 绘制皇冠辅助方法
    drawCrown(graphics, x, y, size) {
        graphics.beginPath();
        graphics.moveTo(x - size, y + size * 0.5);
        graphics.lineTo(x - size * 0.5, y - size * 0.5);
        graphics.lineTo(x - size * 0.2, y);
        graphics.lineTo(x, y - size);
        graphics.lineTo(x + size * 0.2, y);
        graphics.lineTo(x + size * 0.5, y - size * 0.5);
        graphics.lineTo(x + size, y + size * 0.5);
        graphics.lineTo(x - size, y + size * 0.5);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
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
        // 计算阶段和阶段内回合
        const currentStage = Math.ceil(wave / 6); // 当前阶段 (1-5)
        const stageRound = ((wave - 1) % 6) + 1; // 阶段内回合 (1-6)
        
        // 调试信息
        console.log(`StatusUI updateWave: wave=${wave}, phase=${phase}, currentStage=${currentStage}, stageRound=${stageRound}`, waveInfo);
        
        // 更新当前阶段与回合显示
        this.safeUpdateText(this.elements.waveText, `🏆 ${currentStage}-${stageRound}`);
        
        // 更新阶段名称
        this.updateStageName(currentStage);
        
        // 更新阶段波次时间轴
        this.updateWaveTimeline(currentStage, stageRound, wave);
        
        // 更新回合类型和状态
        this.updateRoundType(currentStage, stageRound, waveInfo);
        
        // 更新进度条
        const totalWaves = 30;
        const progress = wave / totalWaves;
        if (this.elements.waveProgressForeground) {
            const maxWidth = 600; // 进度条总宽度
            this.elements.waveProgressForeground.displayWidth = maxWidth * progress;
        }
    }

    // 更新阶段名称
    updateStageName(stage) {
        const stageNames = {
            1: '前期-铺垫',
            2: '中期-发展',
            3: '中期-考验',
            4: '后期-决战',
            5: '终局-生存'
        };
        
        const stageName = stageNames[stage] || '未知阶段';
        this.safeUpdateText(this.elements.stageNameText, stageName);
    }

    // 更新阶段波次时间轴
    updateWaveTimeline(currentStage, currentRound, currentWave) {
        if (!this.elements.waveTimeline || this.elements.waveTimeline.length === 0) {
            return;
        }

        // 从配置中获取当前阶段的波次信息
        const gameScene = this.getGameScene();
        if (!gameScene || !gameScene.waveManager) {
            return;
        }

        // 计算当前阶段的起始波次
        const stageStartWave = (currentStage - 1) * 6 + 1;
        
        // 调试信息
        console.log(`updateWaveTimeline: currentStage=${currentStage}, currentRound=${currentRound}, currentWave=${currentWave}, stageStartWave=${stageStartWave}`);
        
        // 更新每个时间轴槽位
        for (let i = 0; i < 6; i++) {
            const timelineSlot = this.elements.waveTimeline[i];
            if (!timelineSlot) continue;
            
            const waveNumber = stageStartWave + i;
            const roundNumber = i + 1;
            
            // 获取这个波次的信息
            const waveInfo = gameScene.waveManager.getWaveInfo(waveNumber);
            const waveType = waveInfo.type || 'normal';
            
            // 确定波次状态
            const isCompleted = waveNumber < currentWave;
            const isCurrent = waveNumber === currentWave;
            
            // 调试信息
            if (i < 2) { // 只打印前两个槽位的信息
                console.log(`  Slot ${i+1}: waveNumber=${waveNumber}, isCompleted=${isCompleted}, isCurrent=${isCurrent}`);
            }
            
            // 更新波次编号
            timelineSlot.numberText.setText(roundNumber.toString());
            
            // 更新波次类型文本
            const typeNames = {
                'normal': '普通',
                'roguelike': '肉鸽',
                'challenge': '挑战',
                'high_pressure': '高压',
                'boss': 'Boss'
            };
            const typeName = typeNames[waveType] || '普通';
            timelineSlot.typeText.setText(typeName);
            
            // 更新背景颜色和样式
            if (isCompleted) {
                timelineSlot.background.setFillStyle(0x2d5a2d, 0.8); // 完成：绿色
                timelineSlot.background.setStrokeStyle(1, 0x48bb78, 1);
                timelineSlot.numberText.setColor('#48bb78');
                timelineSlot.typeText.setColor('#48bb78');
            } else if (isCurrent) {
                timelineSlot.background.setFillStyle(0x5a5a2d, 0.8); // 当前：黄色
                timelineSlot.background.setStrokeStyle(3, 0xffd700, 1); // 增加边框厚度突出显示
                timelineSlot.numberText.setColor('#ffd700');
                timelineSlot.typeText.setColor('#ffd700');
            } else {
                timelineSlot.background.setFillStyle(0x1a202c, 0.8); // 未来：灰色
                timelineSlot.background.setStrokeStyle(1, 0x4a5568, 0.6);
                timelineSlot.numberText.setColor('#cccccc');
                timelineSlot.typeText.setColor('#888888');
            }
            
            // 更新图标
            this.drawWaveTimelineIcon(timelineSlot.icon, waveType, isCompleted, isCurrent);
            
            // 更新状态记录
            timelineSlot.isCompleted = isCompleted;
            timelineSlot.isCurrent = isCurrent;
        }
    }

    // 更新回合类型和状态
    updateRoundType(stage, round, waveInfo) {
        let roundType = 'default';
        let statusText = '战斗回合';
        let bgColor = 0x4a5568;
        let strokeColor = 0x6a7588;
        let infoText = '准备战斗';
        
        // 优先根据waveInfo确定类型
        if (waveInfo) {
            // 根据waveInfo的name或description判断类型
            const waveType = waveInfo.name || '';
            const waveDesc = waveInfo.description || '';
            
            if (waveType.includes('Boss') || waveType.includes('BOSS') || waveType.includes('boss')) {
                roundType = 'boss';
                statusText = 'BOSS回合';
                bgColor = 0x8b1538;
                strokeColor = 0xdc2626;
                infoText = `准备迎战: ${waveInfo.name}`;
            } else if (waveType.includes('精英') || waveType.includes('Elite') || waveType.includes('elite')) {
                roundType = 'elite';
                statusText = '精英回合';
                bgColor = 0x7c2d12;
                strokeColor = 0xea580c;
                infoText = `精英怪物: ${waveInfo.name}`;
            } else if (waveType.includes('野怪') || waveType.includes('小怪') || waveType.includes('普通')) {
                roundType = 'pve';
                statusText = '野怪回合';
                bgColor = 0x365314;
                strokeColor = 0x65a30d;
                infoText = `当前波次: ${waveInfo.name}`;
            } else {
                // 根据回合数判断类型
                if (round === 1) {
                    roundType = 'pve';
                    statusText = '野怪回合';
                    bgColor = 0x365314;
                    strokeColor = 0x65a30d;
                    infoText = `当前波次: ${waveInfo.name}`;
                } else if (round === 3) {
                    roundType = 'augment';
                    statusText = '强化回合';
                    bgColor = 0x581c87;
                    strokeColor = 0x9333ea;
                    infoText = `获得强化: ${waveInfo.name}`;
                } else {
                    roundType = 'default';
                    statusText = '战斗回合';
                    bgColor = 0x4a5568;
                    strokeColor = 0x6a7588;
                    infoText = `当前波次: ${waveInfo.name}`;
                }
            }
        } else {
            // 没有waveInfo时的简化判断
            if (round === 1) {
                roundType = 'pve';
                statusText = '野怪回合';
                bgColor = 0x365314;
                strokeColor = 0x65a30d;
                infoText = '野怪攻击';
            } else if (round === 3) {
                roundType = 'augment';
                statusText = '强化回合';
                bgColor = 0x581c87;
                strokeColor = 0x9333ea;
                infoText = '获得强化';
            } else {
                roundType = 'default';
                statusText = '战斗回合';
                bgColor = 0x4a5568;
                strokeColor = 0x6a7588;
                infoText = '准备战斗';
            }
        }
        
        // 更新UI元素
        this.drawRoundTypeIcon(roundType);
        this.safeUpdateText(this.elements.roundStatusText, statusText);
        this.safeUpdateText(this.elements.currentRoundInfo, infoText);
        
        // 更新背景颜色来突出当前回合类型
        if (this.elements.currentRoundBackground) {
            this.elements.currentRoundBackground.setFillStyle(bgColor, 0.8);
            this.elements.currentRoundBackground.setStrokeStyle(2, strokeColor, 1);
        }
    }

    // 更新回合状态文字
    updateRoundStatus(status) {
        let statusText = '准备阶段';
        let infoText = '点击开始下一回合';
        
        switch(status) {
            case 'preparing':
                statusText = '准备阶段';
                infoText = '点击开始下一回合';
                break;
            case 'active':
                statusText = '战斗中';
                infoText = '战斗正在进行...';
                break;
            case 'completed':
                statusText = '回合结束';
                infoText = '回合已完成';
                break;
            case 'waiting':
                statusText = '等待中';
                infoText = '等待下一回合';
                break;
        }
        
        this.safeUpdateText(this.elements.roundStatusText, statusText);
        this.safeUpdateText(this.elements.currentRoundInfo, infoText);
    }

    // 更新倒计时显示
    updateCountdown(seconds) {
        this.safeUpdateText(this.elements.countdownText, seconds.toString());
    }

    // 启动倒计时进度条
    startCountdown(duration, nextWave, nextWaveInfo) {
        // 清除之前的倒计时
        if (this.countdownTween) {
            this.countdownTween.stop();
            this.countdownTween = null;
        }

        // 根据下一波类型确定提示文本和颜色
        let statusText = `下一波: ${nextWave}`;
        let progressColor = 0xffd700; // 金色
        
        if (nextWaveInfo) {
            if (nextWaveInfo.type === 'boss') {
                statusText = `Boss波: ${nextWave}`;
                progressColor = 0xff4444; // 红色
            } else if (nextWaveInfo.type === 'roguelike') {
                statusText = `成长选择: ${nextWave}`;
                progressColor = 0xaa44ff; // 紫色
            } else if (nextWaveInfo.type === 'challenge') {
                statusText = `挑战波: ${nextWave}`;
                progressColor = 0xff8800; // 橙色
            }
        }

        // 更新状态文本
        this.safeUpdateText(this.elements.roundStatusText, statusText);
        this.safeUpdateText(this.elements.currentRoundInfo, '倒计时中...');

        // 修改进度条颜色
        if (this.elements.waveProgressForeground) {
            this.elements.waveProgressForeground.setFillStyle(progressColor);
        }

        // 初始化进度条为满
        const maxWidth = 700;
        if (this.elements.waveProgressForeground) {
            this.elements.waveProgressForeground.displayWidth = maxWidth;
        }

        // 启动倒计时动画
        this.countdownTween = this.scene.tweens.add({
            targets: this.elements.waveProgressForeground,
            displayWidth: 0,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                // 倒计时结束，恢复进度条
                this.restoreProgressBar();
            }
        });
    }

    // 恢复进度条状态
    restoreProgressBar() {
        // 恢复进度条颜色
        if (this.elements.waveProgressForeground) {
            this.elements.waveProgressForeground.setFillStyle(0x48bb78); // 绿色
        }
        
        // 恢复状态文本
        this.updateRoundStatus('preparing');
    }

    // 切换播放/暂停状态
    togglePlayPause() {
        const isPaused = this.elements.playPauseButton.text === '▶️';
        this.safeUpdateText(this.elements.playPauseButton, isPaused ? '⏸️' : '▶️');
        return !isPaused;
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