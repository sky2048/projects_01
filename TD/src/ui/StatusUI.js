import { ECONOMY_CONFIG, TOWER_RARITY, LEVEL_RARITY_MODIFIERS } from '../config/GameConfig.js';

export class StatusUI {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
    }

    create() {
        this.createStatusBar();
        this.createWaveDisplay();
        this.createLevelAndExperience();
        this.createRarityProbabilityDisplay();
        this.createVersionDisplay();
    }

    createStatusBar() {
        // 金币显示（移至商店上方，棋盘下方）
        const goldDisplayY = 560; // 商店上方位置，避免重叠
        const goldDisplayX = 640; // 屏幕中心位置
        
        // 梯形背景通用参数
        const trapezoidWidth = 160;
        const trapezoidHeight = 40;
        const skew = 15; // 倾斜度
        const spacing = 200; // 两个显示框之间的间距
        
        // 创建梯形路径
        const trapezoidPoints = [
            skew, 0,                           // 左上
            trapezoidWidth, 0,                 // 右上  
            trapezoidWidth - skew, trapezoidHeight, // 右下
            0, trapezoidHeight                 // 左下
        ];
        
        // 计算三个梯形的居中位置
        const gapBetweenBoxes = 15; // 梯形之间的间隙
        
        // 血量显示（左侧）
        const healthDisplayX = goldDisplayX - trapezoidWidth - gapBetweenBoxes;
        
        this.elements.healthBackground = this.scene.add.polygon(healthDisplayX, goldDisplayY, trapezoidPoints, 0x1a1a2e);
        this.elements.healthBackground.setStrokeStyle(3, 0xff4444, 1);
        
        // 血量内部渐变效果
        this.elements.healthBackgroundGlow = this.scene.add.polygon(healthDisplayX, goldDisplayY, trapezoidPoints, 0x442222, 0.7);
        
        this.elements.healthIcon = this.scene.add.circle(healthDisplayX - 35, goldDisplayY, 12, 0xff4444);
        this.elements.healthIcon.setStrokeStyle(2, 0xff0000);
        
        this.elements.healthText = this.scene.add.text(healthDisplayX + 5, goldDisplayY, '100', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.elements.healthText.setOrigin(0.5, 0.5);
        
        // 塔位显示（中间）
        const towerLimitDisplayX = goldDisplayX;
        
        this.elements.towerLimitBackground = this.scene.add.polygon(towerLimitDisplayX, goldDisplayY, trapezoidPoints, 0x1a1a2e);
        this.elements.towerLimitBackground.setStrokeStyle(3, 0x4488ff, 1);
        
        this.elements.towerLimitBackgroundGlow = this.scene.add.polygon(towerLimitDisplayX, goldDisplayY, trapezoidPoints, 0x223344, 0.7);
        
        this.elements.towerLimitIcon = this.scene.add.text(towerLimitDisplayX - 35, goldDisplayY, '🏰', {
            fontSize: '16px'
        });
        this.elements.towerLimitIcon.setOrigin(0.5);
        
        this.elements.towerLimitText = this.scene.add.text(towerLimitDisplayX + 5, goldDisplayY, '0/2', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.elements.towerLimitText.setOrigin(0.5, 0.5);
        
        // 金币显示（右侧）
        const goldRealDisplayX = goldDisplayX + trapezoidWidth + gapBetweenBoxes;
        
        this.elements.goldBackground = this.scene.add.polygon(goldRealDisplayX, goldDisplayY, trapezoidPoints, 0x1a1a2e);
        this.elements.goldBackground.setStrokeStyle(3, 0xffd700, 1);
        
        // 金币内部渐变效果
        this.elements.goldBackgroundGlow = this.scene.add.polygon(goldRealDisplayX, goldDisplayY, trapezoidPoints, 0x2c2c54, 0.7);
        
        this.elements.goldIcon = this.scene.add.circle(goldRealDisplayX - 35, goldDisplayY, 12, 0xffd700);
        this.elements.goldIcon.setStrokeStyle(2, 0xffaa00);
        
        this.elements.goldText = this.scene.add.text(goldRealDisplayX + 5, goldDisplayY, '100', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.elements.goldText.setOrigin(0.5, 0.5);
    }

    createWaveDisplay() {
        // 波次显示（移至上方居中）
        this.elements.waveText = this.scene.add.text(640, 30, '波次: 1/20', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.elements.waveText.setOrigin(0.5, 0.5);

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
        // 左侧信息显示区域 - 按要求重新设计布局
        const leftDisplayX = 180;
        const leftInfoY = 600;
        
        // 等级和经验文本显示 - 在同一行
        this.elements.levelText = this.scene.add.text(leftDisplayX - 30, leftInfoY, '1级', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.elements.levelText.setOrigin(0.5, 0.5);

        // 经验值显示 - 与等级在同一行
        this.elements.experienceValueText = this.scene.add.text(leftDisplayX + 30, leftInfoY, '0/15', {
            fontSize: '14px',
            fill: '#00ff88',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.elements.experienceValueText.setOrigin(0.5, 0.5);

        // 经验进度条 - 位于等级文本下方
        const expBarY = leftInfoY + 25;
        const expBarWidth = 120;
        const expBarHeight = 8;
        
        // 经验进度条背景
        this.elements.expBarBackground = this.scene.add.rectangle(leftDisplayX, expBarY, expBarWidth, expBarHeight, 0x333333);
        this.elements.expBarBackground.setStrokeStyle(2, 0x666666);
        
        // 经验进度条前景
        this.elements.expBarForeground = this.scene.add.rectangle(leftDisplayX - expBarWidth/2, expBarY, 0, expBarHeight, 0x00ff88);
        this.elements.expBarForeground.setOrigin(0, 0.5);
        
        // 购买经验按钮 - 放在经验进度条下方
        const expButtonWidth = 120;
        const expButtonHeight = 25;
        const expButtonX = leftDisplayX;
        const expButtonY = expBarY + 25;
        
        this.elements.upgradeButton = this.scene.add.rectangle(expButtonX, expButtonY, expButtonWidth, expButtonHeight, 0x28a745);
        this.elements.upgradeText = this.scene.add.text(expButtonX, expButtonY, `购买经验(${ECONOMY_CONFIG.EXP_BUTTON_COST})`, {
            fontSize: '10px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.elements.upgradeText.setOrigin(0.5);

        this.elements.upgradeButton.setInteractive();
        this.elements.upgradeButton.on('pointerdown', () => {
            this.scene.handleBuyExperience();
        });

        // 刷新按钮 - 放在购买经验按钮下方
        const refreshButtonX = leftDisplayX;
        const refreshButtonY = expButtonY + 30;
        
        this.elements.refreshButton = this.scene.add.rectangle(refreshButtonX, refreshButtonY, expButtonWidth, expButtonHeight, 0x4a90e2);
        this.elements.refreshText = this.scene.add.text(refreshButtonX, refreshButtonY, `刷新(${ECONOMY_CONFIG.REFRESH_COST})`, {
            fontSize: '10px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.elements.refreshText.setOrigin(0.5);

        this.elements.refreshButton.setInteractive();
        this.elements.refreshButton.on('pointerdown', () => {
            this.scene.handleRefreshShop();
        });
    }

    createRarityProbabilityDisplay() {
        // 品质概率显示位置 - 在左侧，羁绊显示下方
        const probabilityX = 50;
        const probabilityY = 420;
        
        // 标题
        this.elements.probabilityTitle = this.scene.add.text(probabilityX, probabilityY, '品质概率', {
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
                probabilityX, 
                probabilityY + 25 + index * 18,
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
        this.elements.versionText = this.scene.add.text(20, 20, 'v0.1.2', {
            fontSize: '12px',
            fill: '#888888',
            fontFamily: 'Arial, sans-serif'
        });
        this.elements.versionText.setOrigin(0, 0);
    }

    updateGold(amount) {
        if (this.elements.goldText) {
            this.elements.goldText.setText(amount.toString());
        }
    }

    updateHealth(amount) {
        if (this.elements.healthText) {
            this.elements.healthText.setText(amount.toString());
            
            // 根据生命值改变边框和图标颜色
            if (amount > 70) {
                this.elements.healthBackground.setStrokeStyle(3, 0x44ff44, 1);
                this.elements.healthIcon.setFillStyle(0x44ff44);
                this.elements.healthIcon.setStrokeStyle(2, 0x00ff00);
            } else if (amount > 30) {
                this.elements.healthBackground.setStrokeStyle(3, 0xffaa00, 1);
                this.elements.healthIcon.setFillStyle(0xffaa00);
                this.elements.healthIcon.setStrokeStyle(2, 0xff8800);
            } else {
                this.elements.healthBackground.setStrokeStyle(3, 0xff4444, 1);
                this.elements.healthIcon.setFillStyle(0xff4444);
                this.elements.healthIcon.setStrokeStyle(2, 0xff0000);
            }
        }
    }

    updateWave(wave) {
        if (this.elements.waveText) {
            this.elements.waveText.setText(`波次: ${wave}/20`);
        }
    }

    updateLevel(level, maxTowers) {
        if (this.elements.levelText) {
            this.elements.levelText.setText(`${level}级`);
        }
        
        // 更新塔位显示
        const gameScene = this.scene.scene.get('GameScene');
        const currentTowers = gameScene.towers ? gameScene.towers.children.entries.length : 0;
        if (this.elements.towerLimitText) {
            this.elements.towerLimitText.setText(`${currentTowers}/${maxTowers}`);
        }
        
        // 根据塔位使用情况改变颜色
        if (this.elements.towerLimitBackground && this.elements.towerLimitIcon) {
            const usage = currentTowers / maxTowers;
            if (usage >= 1) {
                this.elements.towerLimitBackground.setStrokeStyle(3, 0xff4444, 1);
                this.elements.towerLimitIcon.setText('🔴');
            } else if (usage >= 0.8) {
                this.elements.towerLimitBackground.setStrokeStyle(3, 0xffaa00, 1);
                this.elements.towerLimitIcon.setText('🟠');
            } else {
                this.elements.towerLimitBackground.setStrokeStyle(3, 0x4488ff, 1);
                this.elements.towerLimitIcon.setText('🏰');
            }
        }
        
        // 更新经验按钮显示
        if (this.elements.upgradeText) {
            this.elements.upgradeText.setText(`购买经验(${ECONOMY_CONFIG.EXP_BUTTON_COST})`);
        }
        
        // 更新品质概率显示
        this.updateRarityProbabilities();
    }

    // 更新品质概率显示
    updateRarityProbabilities() {
        const gameScene = this.scene.scene.get('GameScene');
        if (!gameScene || !gameScene.gameState) return;
        
        const playerLevel = gameScene.gameState.level;
        
        // 获取当前等级的概率配置
        let levelModifiers = LEVEL_RARITY_MODIFIERS[playerLevel];
        if (!levelModifiers) {
            // 如果等级超过配置范围，使用最高等级的概率
            const maxLevel = Math.max(...Object.keys(LEVEL_RARITY_MODIFIERS).map(Number));
            levelModifiers = LEVEL_RARITY_MODIFIERS[maxLevel];
        }
        
        // 更新每个概率文本
        this.elements.probabilityList.forEach(probabilityText => {
            const rarityKey = probabilityText.rarityKey;
            const rarityData = TOWER_RARITY[rarityKey];
            const probability = levelModifiers[rarityKey];
            
            if (probability !== undefined && probability > 0) {
                // 显示可用的品质
                const percentage = (probability * 100).toFixed(1);
                probabilityText.setText(`${rarityData.name}: ${percentage}%`);
                probabilityText.setAlpha(1.0);
                probabilityText.setVisible(true);
            } else {
                // 显示未解锁的品质
                const unlockLevel = this.getRarityUnlockLevel(rarityKey);
                if (unlockLevel > playerLevel) {
                    probabilityText.setText(`${rarityData.name}: ${unlockLevel}级解锁`);
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
        if (this.elements.experienceValueText) {
            this.elements.experienceValueText.setText(`${currentExp}/${expRequiredForNext}`);
        }
        
        // 更新经验进度条
        if (this.elements.expBarForeground && expRequiredForNext > 0) {
            const progress = currentExp / expRequiredForNext;
            const maxWidth = 120;
            const currentWidth = maxWidth * progress;
            
            this.elements.expBarForeground.setSize(currentWidth, 8);
            
            // 根据进度改变颜色
            if (progress >= 0.8) {
                this.elements.expBarForeground.setFillStyle(0xffd700);
            } else if (progress >= 0.5) {
                this.elements.expBarForeground.setFillStyle(0x44ff44);
            } else {
                this.elements.expBarForeground.setFillStyle(0x00ff88);
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
            this.elements.selectedTowerInfo.setText(info);
        } else {
            this.elements.selectedTowerInfo.setText('选择一个塔查看详情');
        }
    }

    showSelectedTowerInfo(tower) {
        const damage = tower.damage || 0;
        const range = tower.range || 0;
        const attackSpeed = tower.attackSpeed || 1;
        const rarity = tower.rarity || 'COMMON';
        
        const info = `已选中: ${tower.towerData.name} (${this.scene.TOWER_RARITY[rarity].name})\n` +
                    `伤害: ${damage} | 射程: ${range} | 攻速: ${attackSpeed.toFixed(1)}`;
        this.elements.selectedTowerInfo.setText(info);
    }

    clearSelectedTowerInfo() {
        this.elements.selectedTowerInfo.setText('');
    }

    setInteractive(interactive) {
        if (this.elements.refreshButton) this.elements.refreshButton.setInteractive(interactive);
        if (this.elements.upgradeButton) this.elements.upgradeButton.setInteractive(interactive);
    }
} 