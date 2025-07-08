import { TOWER_RARITY, SYNERGIES, ECONOMY_CONFIG, EQUIPMENT_CONFIG, EXPERIENCE_CONFIG } from '../config/GameConfig.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // 创建UI背景
        this.createUIBackground();
        
        // 创建状态栏
        this.createStatusBar();
        
        // 创建商店界面
        this.createShop();
        
        // 创建羁绊显示
        this.createSynergyDisplay();
        
        // 创建装备背包界面
        this.createEquipmentInventory();
        
        // 创建控制按钮
        this.createControlButtons();
        
        console.log('UI场景已创建');
        
        // 发送ready事件，通知GameScene可以初始化管理器
        this.events.emit('ready');
    }

    createUIBackground() {
        // 底部UI背景
        this.shopBackground = this.add.rectangle(640, 650, 1280, 140, 0x2c2c54);
        this.shopBackground.setAlpha(0.9);
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
        const totalWidth = trapezoidWidth * 3 + gapBetweenBoxes * 2;
        
        // 血量显示（左侧）
        const healthDisplayX = goldDisplayX - trapezoidWidth - gapBetweenBoxes;
        
        this.healthBackground = this.add.polygon(healthDisplayX, goldDisplayY, trapezoidPoints, 0x1a1a2e);
        this.healthBackground.setStrokeStyle(3, 0xff4444, 1);
        
        // 血量内部渐变效果
        this.healthBackgroundGlow = this.add.polygon(healthDisplayX, goldDisplayY, trapezoidPoints, 0x442222, 0.7);
        
        this.healthIcon = this.add.circle(healthDisplayX - 35, goldDisplayY, 12, 0xff4444);
        this.healthIcon.setStrokeStyle(2, 0xff0000);
        
        this.healthText = this.add.text(healthDisplayX + 5, goldDisplayY, '100', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.healthText.setOrigin(0.5, 0.5);
        
        // 塔位显示（中间）
        const towerLimitDisplayX = goldDisplayX;
        
        this.towerLimitBackground = this.add.polygon(towerLimitDisplayX, goldDisplayY, trapezoidPoints, 0x1a1a2e);
        this.towerLimitBackground.setStrokeStyle(3, 0x4488ff, 1);
        
        this.towerLimitBackgroundGlow = this.add.polygon(towerLimitDisplayX, goldDisplayY, trapezoidPoints, 0x223344, 0.7);
        
        this.towerLimitIcon = this.add.text(towerLimitDisplayX - 35, goldDisplayY, '🏰', {
            fontSize: '16px'
        });
        this.towerLimitIcon.setOrigin(0.5);
        
        this.towerLimitText = this.add.text(towerLimitDisplayX + 5, goldDisplayY, '0/2', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.towerLimitText.setOrigin(0.5, 0.5);
        
        // 金币显示（右侧）
        const goldRealDisplayX = goldDisplayX + trapezoidWidth + gapBetweenBoxes;
        
        this.goldBackground = this.add.polygon(goldRealDisplayX, goldDisplayY, trapezoidPoints, 0x1a1a2e);
        this.goldBackground.setStrokeStyle(3, 0xffd700, 1);
        
        // 金币内部渐变效果
        this.goldBackgroundGlow = this.add.polygon(goldRealDisplayX, goldDisplayY, trapezoidPoints, 0x2c2c54, 0.7);
        
        this.goldIcon = this.add.circle(goldRealDisplayX - 35, goldDisplayY, 12, 0xffd700);
        this.goldIcon.setStrokeStyle(2, 0xffaa00);
        
        this.goldText = this.add.text(goldRealDisplayX + 5, goldDisplayY, '100', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.goldText.setOrigin(0.5, 0.5);

        // 波次显示（移至上方居中）
        this.waveText = this.add.text(640, 30, '波次: 1/20', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.waveText.setOrigin(0.5, 0.5);

        // 选中塔的信息显示（移除重叠文本，仅在需要时显示）
        this.selectedTowerInfo = this.add.text(640, 80, '', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 1
        });
        this.selectedTowerInfo.setOrigin(0.5);

        // 左侧信息显示区域 - 重新设计布局
        const leftDisplayX = 180;
        const leftInfoY = 600;
        
        // 等级显示 - 使用梯形背景
        const levelTrapezoidWidth = 120;
        const levelTrapezoidHeight = 35;
        const levelSkew = 10;
        
        const levelTrapezoidPoints = [
            levelSkew, 0,                           
            levelTrapezoidWidth, 0,                 
            levelTrapezoidWidth - levelSkew, levelTrapezoidHeight, 
            0, levelTrapezoidHeight                 
        ];
        
        this.levelBackground = this.add.polygon(leftDisplayX, leftInfoY, levelTrapezoidPoints, 0x1a1a2e);
        this.levelBackground.setStrokeStyle(3, 0x9966ff, 1);
        
        this.levelBackgroundGlow = this.add.polygon(leftDisplayX, leftInfoY, levelTrapezoidPoints, 0x332244, 0.7);
        
        this.levelText = this.add.text(leftDisplayX, leftInfoY, '1级', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.levelText.setOrigin(0.5, 0.5);

        // 经验值显示 - 紧贴等级下方
        this.experienceValueText = this.add.text(leftDisplayX, leftInfoY + 25, '0/10', {
            fontSize: '14px',
            fill: '#00ff88',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.experienceValueText.setOrigin(0.5, 0.5);

        // 经验进度条 - 位于经验值下方
        const expBarY = leftInfoY + 45;
        const expBarWidth = 150;
        const expBarHeight = 8;
        
        // 经验进度条背景
        this.expBarBackground = this.add.rectangle(leftDisplayX, expBarY, expBarWidth, expBarHeight, 0x333333);
        this.expBarBackground.setStrokeStyle(2, 0x666666);
        
        // 经验进度条前景
        this.expBarForeground = this.add.rectangle(leftDisplayX - expBarWidth/2, expBarY, 0, expBarHeight, 0x00ff88);
        this.expBarForeground.setOrigin(0, 0.5);
        
        // 购买经验按钮 - 放在经验进度条旁边
        const expButtonWidth = 80;
        const expButtonHeight = 25;
        const expButtonX = leftDisplayX + 90;
        const expButtonY = expBarY;
        
        this.upgradeButton = this.add.rectangle(expButtonX, expButtonY, expButtonWidth, expButtonHeight, 0x28a745);
        this.upgradeText = this.add.text(expButtonX, expButtonY, `购买经验(${ECONOMY_CONFIG.EXP_BUTTON_COST})`, {
            fontSize: '10px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.upgradeText.setOrigin(0.5);

        this.upgradeButton.setInteractive();
        this.upgradeButton.on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene');
            const result = gameScene.buyExperience();
            
            if (result.success) {
                if (result.leveledUp) {
                    this.showNotification(`获得 ${ECONOMY_CONFIG.EXP_PER_BUTTON_CLICK} 点经验！升级了！`, 'success', 2500);
                } else {
                    this.showNotification(`获得 ${ECONOMY_CONFIG.EXP_PER_BUTTON_CLICK} 点经验`, 'success', 1500);
                }
            } else {
                this.showNotification(`金币不足！需要 ${ECONOMY_CONFIG.EXP_BUTTON_COST} 金币`, 'error', 2000);
            }
        });

        // 刷新按钮 - 放在购买经验按钮下方
        const refreshButtonX = expButtonX;
        const refreshButtonY = expButtonY + 35;
        
        this.refreshButton = this.add.rectangle(refreshButtonX, refreshButtonY, expButtonWidth, expButtonHeight, 0x4a90e2);
        this.refreshText = this.add.text(refreshButtonX, refreshButtonY, `刷新(${ECONOMY_CONFIG.REFRESH_COST})`, {
            fontSize: '10px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.refreshText.setOrigin(0.5);

        this.refreshButton.setInteractive();
        this.refreshButton.on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene');
            if (gameScene.gameState.gold >= ECONOMY_CONFIG.REFRESH_COST) {
                gameScene.towerShop.refreshShopPaid();
                this.showNotification('商店已刷新', 'success', 1500);
            } else {
                this.showNotification(`金币不足！刷新需要 ${ECONOMY_CONFIG.REFRESH_COST} 金币`, 'error', 2000);
            }
        });

        // 创建提示系统
        this.createNotificationSystem();
        
        // 创建Tooltip系统
        this.createTooltipSystem();
        
        // 显示版本号
        this.versionText = this.add.text(1200, 700, 'v0.1.2', {
            fontSize: '12px',
            fill: '#888888',
            fontFamily: 'Arial, sans-serif'
        });
        this.versionText.setOrigin(1, 1);
    }

    createShop() {
        // 锁定按钮 - 移到右侧
        const buttonWidth = 120;  // 统一按钮宽度
        const buttonHeight = 35;  // 统一按钮高度
        const buttonX = 1150;     // 右侧X坐标位置
        const startY = 580;       // 起始Y坐标
        
        // 锁定按钮
        this.lockButton = this.add.rectangle(buttonX, startY, buttonWidth, buttonHeight, 0x6c757d);
        this.lockText = this.add.text(buttonX, startY, '锁定', {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.lockText.setOrigin(0.5);

        this.lockButton.setInteractive();
        this.lockButton.on('pointerdown', () => {
            this.toggleShopLock();
        });

        // 商店槽位 - 水平居中显示
        this.shopSlots = [];
        const slotWidth = 120;
        const slotSpacing = 130; // 槽位间隔
        const totalSlotsWidth = (5 - 1) * slotSpacing + slotWidth; // 总宽度
        const startX = (1280 - totalSlotsWidth) / 2 + slotWidth / 2; // 居中起始位置
        
        for (let i = 0; i < 5; i++) {
            const slotX = startX + i * slotSpacing;
            const slotY = 650;
            
            const slot = this.createShopSlot(slotX, slotY, i);
            this.shopSlots.push(slot);
        }
    }

    createShopSlot(x, y, index) {
        const slot = {
            background: this.add.rectangle(x, y, 120, 80, 0x3a3a5a),
            icon: null,
            nameText: null,
            costText: null,
            rarityBorder: null,
            index: index,
            tower: null  // 存储当前槽位的塔数据
        };

        slot.background.setStrokeStyle(2, 0x4a4a6a);
        slot.background.setInteractive();
        slot.background.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                // 右键点击锁定/解锁单个槽位
                this.toggleSlotLock(index);
            } else {
                // 左键点击购买塔
                this.buyTower(index);
            }
        });

        slot.background.on('pointerover', (pointer) => {
            slot.background.setFillStyle(0x4a4a7a);
            
            // 如果槽位有塔，显示tooltip
            if (slot.tower) {
                this.showTooltip(pointer.worldX, pointer.worldY, slot.tower);
            }
        });

        slot.background.on('pointerout', () => {
            slot.background.setFillStyle(0x3a3a5a);
            
            // 隐藏tooltip
            this.hideTooltip();
        });

        slot.background.on('pointermove', (pointer) => {
            // 鼠标移动时更新tooltip位置
            if (slot.tower && this.tooltip.visible) {
                this.showTooltip(pointer.worldX, pointer.worldY, slot.tower);
            }
        });

        return slot;
    }

    createSynergyDisplay() {
        // 羁绊显示标题移到左上角
        this.synergyTitle = this.add.text(50, 120, '当前羁绊', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });

        // 羁绊列表
        this.synergyList = [];
        for (let i = 0; i < 5; i++) {
            const synergyText = this.add.text(50, 150 + i * 25, '', {
                fontSize: '14px',
                fill: '#cccccc',
                fontFamily: 'Arial, sans-serif'
            });
            this.synergyList.push(synergyText);
        }
    }

    createEquipmentInventory() {
        // 装备背包标题
        this.equipmentTitle = this.add.text(1000, 400, '装备背包', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });

        // 装备背包背景
        this.equipmentBackground = this.add.rectangle(1100, 480, 180, 140, 0x3a3a5a, 0.8);
        this.equipmentBackground.setStrokeStyle(2, 0x4a4a6a);

        // 创建8个装备槽位（4x2网格）
        this.equipmentSlots = [];
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 4; col++) {
                const slotX = 1030 + col * 35;
                const slotY = 450 + row * 35;
                
                const slot = this.createEquipmentSlot(slotX, slotY, row * 4 + col);
                this.equipmentSlots.push(slot);
            }
        }

        // 装备详情显示区域
        this.equipmentDetails = this.add.text(1100, 530, '拖拽装备到塔上', {
            fontSize: '12px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            wordWrap: { width: 160 }
        });
        this.equipmentDetails.setOrigin(0.5);
    }

    createEquipmentSlot(x, y, index) {
        const slot = {
            background: this.add.rectangle(x, y, 30, 30, 0x2a2a4a),
            icon: null,
            equipment: null,
            index: index,
            isDragging: false
        };

        slot.background.setStrokeStyle(1, 0x4a4a6a);
        slot.background.setInteractive({ draggable: true });

        // 鼠标悬停效果
        slot.background.on('pointerover', (pointer) => {
            slot.background.setFillStyle(0x4a4a7a);
            if (slot.equipment) {
                this.showEquipmentTooltip(pointer.worldX, pointer.worldY, slot.equipment);
            }
        });

        slot.background.on('pointerout', () => {
            slot.background.setFillStyle(0x2a2a4a);
            this.hideEquipmentTooltip();
        });

        // 拖拽开始
        slot.background.on('dragstart', (pointer, dragX, dragY) => {
            if (slot.equipment) {
                slot.isDragging = true;
                slot.background.setAlpha(0.5);
                // 创建拖拽时的视觉反馈
                this.createDragPreview(slot.equipment);
            }
        });

        // 拖拽结束
        slot.background.on('dragend', (pointer) => {
            slot.isDragging = false;
            slot.background.setAlpha(1);
            this.clearDragPreview();
            
            if (slot.equipment) {
                // 检查是否拖拽到塔上
                this.tryEquipToTower(pointer, slot.equipment);
            }
        });

        return slot;
    }

    // 更新装备背包显示
    updateEquipmentInventory(inventory) {
        // 清除现有装备显示
        this.equipmentSlots.forEach(slot => {
            if (slot.icon) {
                slot.icon.destroy();
                slot.icon = null;
            }
            slot.equipment = null;
        });

        // 显示新装备
        inventory.forEach((equipment, index) => {
            if (index < this.equipmentSlots.length) {
                const slot = this.equipmentSlots[index];
                slot.equipment = equipment;
                
                // 创建装备图标
                slot.icon = this.add.text(slot.background.x, slot.background.y, equipment.icon, {
                    fontSize: '16px'
                });
                slot.icon.setOrigin(0.5);
                
                // 根据装备品质设置边框颜色
                const borderColor = equipment.tier === 'crafted' ? 0xffd700 : 0x888888;
                slot.background.setStrokeStyle(2, borderColor);
            }
        });
    }

    // 显示装备详情
    showEquipmentTooltip(x, y, equipment) {
        const gameScene = this.scene.get('GameScene');
        if (gameScene.equipmentManager) {
            const tooltip = gameScene.equipmentManager.getEquipmentTooltip(equipment);
            this.equipmentDetails.setText(tooltip);
        }
    }

    // 隐藏装备详情
    hideEquipmentTooltip() {
        this.equipmentDetails.setText('拖拽装备到塔上');
    }

    // 创建拖拽预览
    createDragPreview(equipment) {
        if (this.dragPreview) {
            this.dragPreview.destroy();
        }
        
        this.dragPreview = this.add.text(0, 0, equipment.icon, {
            fontSize: '20px'
        });
        this.dragPreview.setOrigin(0.5);
        this.dragPreview.setAlpha(0.8);
    }

    // 清除拖拽预览
    clearDragPreview() {
        if (this.dragPreview) {
            this.dragPreview.destroy();
            this.dragPreview = null;
        }
    }

    // 尝试将装备装到塔上
    tryEquipToTower(pointer, equipment) {
        const gameScene = this.scene.get('GameScene');
        if (!gameScene.towers) return;

        // 检查指针位置是否在某个塔上
        const towers = gameScene.towers.children.entries;
        for (const tower of towers) {
            const distance = Phaser.Math.Distance.Between(pointer.worldX, pointer.worldY, tower.x, tower.y);
            if (distance < 30) { // 塔的检测半径
                // 尝试装备到这个塔上
                if (gameScene.equipmentManager) {
                    const success = gameScene.equipmentManager.equipToTower(equipment.id, tower);
                    if (success) {
                        this.showNotification(`${equipment.name} 已装备到塔上`, 'success', 1500);
                    }
                }
                return;
            }
        }
        
        // 如果没有拖拽到塔上，显示提示
        this.showNotification('请将装备拖拽到塔上', 'warning', 1500);
    }

    // 更新塔的装备显示（当选中塔时）
    updateTowerEquipment(tower) {
        if (!tower.equipment) return;
        
        let equipmentText = '装备:\n';
        tower.equipment.forEach(equipment => {
            equipmentText += `${equipment.icon} ${equipment.name}\n`;
        });
        
        // 在塔信息中显示装备
        if (this.selectedTowerInfo) {
            const currentText = this.selectedTowerInfo.text;
            this.selectedTowerInfo.setText(currentText + '\n\n' + equipmentText);
        }
    }

    createControlButtons() {
        // 暂停按钮
        this.pauseButton = this.add.rectangle(1150, 30, 100, 40, 0x4a90e2);
        this.pauseText = this.add.text(1150, 30, '暂停', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.pauseText.setOrigin(0.5);

        this.pauseButton.setInteractive();
        this.pauseButton.on('pointerdown', () => {
            this.togglePause();
        });

        // 加速按钮
        this.speedButton = this.add.rectangle(1150, 80, 100, 40, 0x4a90e2);
        this.speedText = this.add.text(1150, 80, '加速', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.speedText.setOrigin(0.5);

        this.speedButton.setInteractive();
        this.speedButton.on('pointerdown', () => {
            this.toggleSpeed();
        });
    }

    updateGold(amount) {
        if (this.goldText) {
            this.goldText.setText(amount.toString());
        }
    }

    updateHealth(amount) {
        if (this.healthText) {
            this.healthText.setText(amount.toString());
            
            // 根据生命值改变边框和图标颜色
            if (amount > 70) {
                this.healthBackground.setStrokeStyle(3, 0x44ff44, 1);
                this.healthIcon.setFillStyle(0x44ff44);
                this.healthIcon.setStrokeStyle(2, 0x00ff00);
            } else if (amount > 30) {
                this.healthBackground.setStrokeStyle(3, 0xffaa00, 1);
                this.healthIcon.setFillStyle(0xffaa00);
                this.healthIcon.setStrokeStyle(2, 0xff8800);
            } else {
                this.healthBackground.setStrokeStyle(3, 0xff4444, 1);
                this.healthIcon.setFillStyle(0xff4444);
                this.healthIcon.setStrokeStyle(2, 0xff0000);
            }
        }
    }

    updateWave(wave) {
        if (this.waveText) {
            this.waveText.setText(`波次: ${wave}/20`);
        }
    }

    updateShop(offers) {
        // 清除现有内容
        this.shopSlots.forEach(slot => {
            if (slot.icon) slot.icon.destroy();
            if (slot.nameText) slot.nameText.destroy();
            if (slot.costText) slot.costText.destroy();
            if (slot.rarityBorder) slot.rarityBorder.destroy();
            // 注意：不清除 lockIcon，因为锁定状态需要保持
            
            slot.icon = null;
            slot.nameText = null;
            slot.costText = null;
            slot.rarityBorder = null;
            slot.tower = null; // 清除塔数据
        });

        // 更新商店内容
        for (let i = 0; i < offers.length && i < this.shopSlots.length; i++) {
            const tower = offers[i];
            const slot = this.shopSlots[i];
            
            // 保存塔数据到槽位
            slot.tower = tower;
            
            if (tower) {
                // 品质边框
                const rarityColor = TOWER_RARITY[tower.rarity].color;
                slot.rarityBorder = this.add.rectangle(slot.background.x, slot.background.y, 120, 80);
                slot.rarityBorder.setStrokeStyle(3, rarityColor);
                slot.rarityBorder.setFillStyle(0x000000, 0);

                // 塔图标 - 居中显示
                slot.icon = this.createTowerIcon(slot.background.x, slot.background.y - 5, tower);

                // 塔名称 - 调整位置使布局更平衡
                slot.nameText = this.add.text(slot.background.x, slot.background.y + 18, tower.name, {
                    fontSize: '12px',
                    fill: '#ffffff',
                    fontFamily: 'Arial, sans-serif'
                });
                slot.nameText.setOrigin(0.5);

                // 费用 - 调整位置使布局更平衡
                slot.costText = this.add.text(slot.background.x, slot.background.y + 32, `${tower.cost}金`, {
                    fontSize: '10px',
                    fill: '#ffd700',
                    fontFamily: 'Arial, sans-serif'
                });
                slot.costText.setOrigin(0.5);
            } else {
                // 空槽位显示 "已售出"
                slot.nameText = this.add.text(slot.background.x, slot.background.y, '已售出', {
                    fontSize: '14px',
                    fill: '#888888',
                    fontFamily: 'Arial, sans-serif'
                });
                slot.nameText.setOrigin(0.5);
            }
        }
        
        // 重新应用锁定视觉效果
        this.updateShopLockVisuals();
    }

    createTowerIcon(x, y, tower) {
        let icon;
        const rarityColor = TOWER_RARITY[tower.rarity].color;
        
        // 稍微增大图标尺寸，使其在槽位中更加突出和居中
        switch (tower.type) {
            case 'ARCHER':
                icon = this.add.polygon(x, y, [0, -10, 7, 6, 0, 3, -7, 6], rarityColor);
                break;
            case 'MAGE':
                icon = this.add.star(x, y, 4, 7, 11, rarityColor);
                break;
            case 'ASSASSIN':
                icon = this.add.triangle(x, y, 0, -10, 10, 10, -10, 10, rarityColor);
                break;
            case 'TANK':
                icon = this.add.rectangle(x, y, 14, 14, rarityColor);
                break;
            case 'SUPPORT':
                icon = this.add.circle(x, y, 8, rarityColor);
                break;
            default:
                icon = this.add.circle(x, y, 8, rarityColor);
        }
        
        icon.setStrokeStyle(1, 0x000000);
        return icon;
    }

    buyTower(index) {
        const gameScene = this.scene.get('GameScene');
        const tower = gameScene.towerShop.currentOffers[index];
        
        if (!tower) {
            this.showNotification('该槽位已售出或无塔', 'warning', 1500);
            return;
        }
        
        if (gameScene.gameState.gold < tower.cost) {
            this.showNotification(`金币不足！需要 ${tower.cost} 金币，当前只有 ${gameScene.gameState.gold} 金币`, 'error', 2500);
            return;
        }
        
        // 检查塔位是否已满
        const currentTowerCount = gameScene.towers.children.entries.length;
        if (currentTowerCount >= gameScene.gameState.maxTowers) {
            this.showNotification(`塔位已满！当前 ${currentTowerCount}/${gameScene.gameState.maxTowers}，请先升级`, 'warning', 2500);
            return;
        }
        
        // 设置选中的塔（使用新的selectTower方法）
        gameScene.towerShop.selectTower(index);
        
        // 更新选中塔的信息显示
        this.showTowerInfo(tower);
        
        // 重置所有槽位颜色，然后高亮选中的槽位
        this.resetShopHighlight();
        this.shopSlots[index].background.setFillStyle(0x5a5a7a);
        
        this.showNotification(`已选择 ${tower.name}，点击空地放置`, 'success', 2000);
        console.log(`选择了 ${tower.name} 塔`);
    }

    updateSynergies(towers) {
        // 统计羁绊
        const synergyCount = {};
        
        towers.forEach(tower => {
            const synergy = tower.synergy;
            synergyCount[synergy] = (synergyCount[synergy] || 0) + 1;
        });

        // 更新羁绊显示
        let displayIndex = 0;
        
        // 清空现有显示
        this.synergyList.forEach(text => text.setText(''));
        
        for (const [synergyKey, count] of Object.entries(synergyCount)) {
            if (displayIndex >= this.synergyList.length) break;
            
            const synergy = SYNERGIES[synergyKey];
            if (synergy && count >= 2) {
                // 找到激活的羁绊等级
                let activeLevel = null;
                for (let i = synergy.levels.length - 1; i >= 0; i--) {
                    if (count >= synergy.levels[i].count) {
                        activeLevel = synergy.levels[i];
                        break;
                    }
                }
                
                if (activeLevel) {
                    const text = `${synergy.name}(${count}): ${activeLevel.effect}`;
                    this.synergyList[displayIndex].setText(text);
                    this.synergyList[displayIndex].setFill('#00ff00');
                    displayIndex++;
                }
            }
        }
    }

    showTowerInfo(tower) {
        if (tower) {
            const damage = tower.damage || 0;
            const range = tower.range || 0;
            const attackSpeed = tower.attackSpeed || 1;
            const rarity = tower.rarity || 'COMMON';
            
            const info = `${tower.name} (${TOWER_RARITY[rarity].name})\n` +
                        `伤害: ${damage} | 射程: ${range} | 攻速: ${attackSpeed.toFixed(1)}`;
            this.selectedTowerInfo.setText(info);
        } else {
            this.selectedTowerInfo.setText('选择一个塔查看详情');
        }
    }

    togglePause() {
        const gameScene = this.scene.get('GameScene');
        gameScene.gameState.isPaused = !gameScene.gameState.isPaused;
        
        if (gameScene.gameState.isPaused) {
            this.pauseText.setText('继续');
            gameScene.scene.pause();
        } else {
            this.pauseText.setText('暂停');
            gameScene.scene.resume();
        }
    }

    toggleSpeed() {
        const gameScene = this.scene.get('GameScene');
        
        if (gameScene.physics.world.timeScale === 1) {
            gameScene.physics.world.timeScale = 2;
            gameScene.tweens.timeScale = 2;
            gameScene.time.timeScale = 2;
            this.speedText.setText('正常');
        } else {
            gameScene.physics.world.timeScale = 1;
            gameScene.tweens.timeScale = 1;
            gameScene.time.timeScale = 1;
            this.speedText.setText('加速');
        }
    }

    clearTowerSelection() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene.towerShop) {
            gameScene.towerShop.selectedTower = null;
            this.selectedTowerInfo.setText('');
            // 重置所有商店槽位的高亮状态
            this.resetShopHighlight();
        }
        
        // 同时清除已放置塔的选中状态
        if (gameScene.selectedTower) {
            gameScene.selectedTower.hideRange();
            gameScene.selectedTower.setSelected(false);
            gameScene.selectedTower = null;
        }
    }

    resetShopHighlight() {
        this.shopSlots.forEach(slot => {
            slot.background.setFillStyle(0x3a3a5a);
        });
    }

    showSelectedTowerInfo(tower) {
        const damage = tower.damage || 0;
        const range = tower.range || 0;
        const attackSpeed = tower.attackSpeed || 1;
        const rarity = tower.rarity || 'COMMON';
        
        const info = `已选中: ${tower.towerData.name} (${TOWER_RARITY[rarity].name})\n` +
                    `伤害: ${damage} | 射程: ${range} | 攻速: ${attackSpeed.toFixed(1)}`;
        this.selectedTowerInfo.setText(info);
        

    }

    clearSelectedTowerInfo() {
        this.selectedTowerInfo.setText('');
    }



    updateLevel(level, maxTowers) {
        if (this.levelText) {
            this.levelText.setText(`${level}级`);
        }
        
        // 更新塔位显示（现在在中间的梯形）
        const gameScene = this.scene.get('GameScene');
        const currentTowers = gameScene.towers ? gameScene.towers.children.entries.length : 0;
        if (this.towerLimitText) {
            this.towerLimitText.setText(`${currentTowers}/${maxTowers}`);
        }
        
        // 根据塔位使用情况改变颜色
        if (this.towerLimitBackground && this.towerLimitIcon) {
            const usage = currentTowers / maxTowers;
            if (usage >= 1) {
                // 塔位已满 - 红色
                this.towerLimitBackground.setStrokeStyle(3, 0xff4444, 1);
                this.towerLimitIcon.setText('🔴');
            } else if (usage >= 0.8) {
                // 塔位紧张 - 橙色
                this.towerLimitBackground.setStrokeStyle(3, 0xffaa00, 1);
                this.towerLimitIcon.setText('🟠');
            } else {
                // 塔位充足 - 蓝色
                this.towerLimitBackground.setStrokeStyle(3, 0x4488ff, 1);
                this.towerLimitIcon.setText('🏰');
            }
        }
        
        // 更新经验按钮显示
        if (this.upgradeText) {
            this.upgradeText.setText(`购买经验(${ECONOMY_CONFIG.EXP_BUTTON_COST})`);
        }
    }

    updateExperience(currentExp, expRequiredForNext) {
        // 更新经验数值显示
        if (this.experienceValueText) {
            this.experienceValueText.setText(`${currentExp}/${expRequiredForNext}`);
        }
        
        // 更新经验进度条
        if (this.expBarForeground && expRequiredForNext > 0) {
            const progress = currentExp / expRequiredForNext;
            const maxWidth = 150; // 进度条最大宽度
            const currentWidth = maxWidth * progress;
            
            this.expBarForeground.setSize(currentWidth, 8);
            
            // 根据进度改变颜色
            if (progress >= 0.8) {
                this.expBarForeground.setFillStyle(0xffd700); // 金色 - 接近升级
            } else if (progress >= 0.5) {
                this.expBarForeground.setFillStyle(0x44ff44); // 绿色 - 中等进度
            } else {
                this.expBarForeground.setFillStyle(0x00ff88); // 青色 - 初始状态
            }
        }
    }

    createNotificationSystem() {
        // 创建提示容器
        this.notifications = [];
        this.notificationY = 200; // 提示显示的起始Y位置
        
        // 左侧物品提示系统
        this.itemNotifications = [];
        this.itemNotificationY = 100;
    }

    createTooltipSystem() {
        // 创建tooltip容器，初始隐藏
        this.tooltip = {
            background: null,
            content: null,
            visible: false
        };
    }

    showNotification(message, type = 'info', duration = 2000, position = 'center') {
        // 判断是否为物品相关提示（显示在左侧）
        const isItemNotification = message.includes('获得装备') || 
                                  message.includes('合成装备') || 
                                  message.includes('装备已装备') ||
                                  message.includes('装备背包') ||
                                  message.includes('装备槽位') ||
                                  message.includes('获得') && message.includes('金币') ||
                                  message.includes('返还') && message.includes('金币') ||
                                  message.includes('金币奖励') ||
                                  position === 'left';

        if (isItemNotification) {
            this.showItemNotification(message, type, duration);
            return;
        }

        // 定义不同类型的颜色
        const colors = {
            'info': '#ffffff',
            'warning': '#ffaa00',
            'error': '#ff4444',
            'success': '#44ff44'
        };
        
        const bgColors = {
            'info': 0x333333,
            'warning': 0x664400,
            'error': 0x441111,
            'success': 0x114411
        };

        // 创建提示背景
        const bg = this.add.rectangle(640, this.notificationY, 400, 50, bgColors[type], 0.9);
        bg.setStrokeStyle(2, 0x666666);
        
        // 创建提示文字
        const text = this.add.text(640, this.notificationY, message, {
            fontSize: '16px',
            fill: colors[type],
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            wordWrap: { width: 380 }
        });
        text.setOrigin(0.5);

        // 添加到提示列表
        const notification = { bg, text, startY: this.notificationY };
        this.notifications.push(notification);
        
        // 更新下一个提示的位置
        this.notificationY += 60;

        // 淡入动画
        bg.setAlpha(0);
        text.setAlpha(0);
        
        this.tweens.add({
            targets: [bg, text],
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });

        // 自动消失
        this.time.delayedCall(duration, () => {
            this.hideNotification(notification);
        });
    }

    showItemNotification(message, type = 'info', duration = 2000) {
        // 定义不同类型的颜色
        const colors = {
            'info': '#ffffff',
            'warning': '#ffaa00',
            'error': '#ff4444',
            'success': '#44ff44'
        };
        
        const bgColors = {
            'info': 0x333333,
            'warning': 0x664400,
            'error': 0x441111,
            'success': 0x114411
        };

        // 左侧位置：X=200，小尺寸
        const bg = this.add.rectangle(200, this.itemNotificationY, 280, 40, bgColors[type], 0.85);
        bg.setStrokeStyle(1, 0x666666);
        
        // 创建提示文字
        const text = this.add.text(200, this.itemNotificationY, message, {
            fontSize: '14px',
            fill: colors[type],
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            wordWrap: { width: 260 }
        });
        text.setOrigin(0.5);

        // 添加到物品提示列表
        const notification = { bg, text, startY: this.itemNotificationY };
        this.itemNotifications.push(notification);
        
        // 更新下一个提示的位置
        this.itemNotificationY += 50;

        // 淡入动画
        bg.setAlpha(0);
        text.setAlpha(0);
        
        this.tweens.add({
            targets: [bg, text],
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });

        // 自动消失
        this.time.delayedCall(duration, () => {
            this.hideItemNotification(notification);
        });
    }

    hideNotification(notification) {
        if (!notification.bg || !notification.text) return;

        // 淡出动画
        this.tweens.add({
            targets: [notification.bg, notification.text],
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // 销毁元素
                if (notification.bg) notification.bg.destroy();
                if (notification.text) notification.text.destroy();
                
                // 从列表中移除
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
                
                // 重新排列剩余提示
                this.rearrangeNotifications();
            }
        });
    }

    rearrangeNotifications() {
        this.notificationY = 200;
        
        this.notifications.forEach((notification, index) => {
            const targetY = 200 + index * 60;
            
            if (notification.bg && notification.text) {
                this.tweens.add({
                    targets: [notification.bg, notification.text],
                    y: targetY,
                    duration: 300,
                    ease: 'Power2'
                });
            }
        });
        
        this.notificationY = 200 + this.notifications.length * 60;
    }

    hideItemNotification(notification) {
        if (!notification.bg || !notification.text) return;

        // 淡出动画
        this.tweens.add({
            targets: [notification.bg, notification.text],
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // 销毁元素
                if (notification.bg) notification.bg.destroy();
                if (notification.text) notification.text.destroy();
                
                // 从列表中移除
                const index = this.itemNotifications.indexOf(notification);
                if (index > -1) {
                    this.itemNotifications.splice(index, 1);
                }
                
                // 重新排列剩余提示
                this.rearrangeItemNotifications();
            }
        });
    }

    rearrangeItemNotifications() {
        this.itemNotificationY = 100;
        
        this.itemNotifications.forEach((notification, index) => {
            const targetY = 100 + index * 50;
            
            if (notification.bg && notification.text) {
                this.tweens.add({
                    targets: [notification.bg, notification.text],
                    y: targetY,
                    duration: 300,
                    ease: 'Power2'
                });
            }
        });
        
        this.itemNotificationY = 100 + this.itemNotifications.length * 50;
    }

    // 波次提示系统
    showWaveNotification(wave, isStart = true) {
        if (isStart) {
            if (wave === 20) {
                this.showNotification(`第 ${wave} 波开始！BOSS波次！`, 'error', 3000, 'center');
            } else if (wave % 5 === 0) {
                this.showNotification(`第 ${wave} 波开始！精英波次！`, 'warning', 2500, 'center');
            } else {
                this.showNotification(`第 ${wave} 波开始`, 'info', 2000, 'center');
            }
        } else {
            if (wave === 20) {
                this.showNotification('恭喜！击败了BOSS！', 'success', 3000, 'center');
            } else {
                this.showNotification(`第 ${wave} 波完成`, 'success', 1500, 'center');
            }
        }
    }

    showTooltip(x, y, tower) {
        // 隐藏之前的tooltip
        this.hideTooltip();

        // 创建tooltip内容
        const rarityInfo = TOWER_RARITY[tower.rarity];
        const content = [
            `${tower.name} (${rarityInfo.name})`,
            `类型: ${this.getTowerTypeName(tower.type)}`,
            `伤害: ${tower.damage}`,
            `射程: ${tower.range}`,
            `攻速: ${tower.attackSpeed.toFixed(1)}`,
            `费用: ${tower.cost} 金币`,
            ``,
            tower.description || '无描述'
        ].join('\n');

        // 计算tooltip尺寸
        const lines = content.split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const tooltipWidth = Math.max(200, maxLineLength * 8 + 20);
        const tooltipHeight = lines.length * 18 + 20;

        // 调整位置确保不超出屏幕
        let tooltipX = x + 10;
        let tooltipY = y - tooltipHeight - 10;

        if (tooltipX + tooltipWidth > 1280) {
            tooltipX = x - tooltipWidth - 10;
        }
        if (tooltipY < 0) {
            tooltipY = y + 20;
        }

        // 创建tooltip背景
        this.tooltip.background = this.add.rectangle(
            tooltipX + tooltipWidth / 2, 
            tooltipY + tooltipHeight / 2, 
            tooltipWidth, 
            tooltipHeight, 
            0x2a2a2a, 
            0.95
        );
        this.tooltip.background.setStrokeStyle(2, rarityInfo.color);

        // 创建tooltip文本
        this.tooltip.content = this.add.text(tooltipX + 10, tooltipY + 10, content, {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            lineSpacing: 4
        });

        // 设置深度确保在最前面
        this.tooltip.background.setDepth(1000);
        this.tooltip.content.setDepth(1001);

        this.tooltip.visible = true;
    }

    hideTooltip() {
        if (this.tooltip.background) {
            this.tooltip.background.destroy();
            this.tooltip.background = null;
        }
        if (this.tooltip.content) {
            this.tooltip.content.destroy();
            this.tooltip.content = null;
        }
        this.tooltip.visible = false;
    }

    getTowerTypeName(type) {
        const typeNames = {
            'ARCHER': '弓箭手',
            'MAGE': '法师',
            'ASSASSIN': '刺客',
            'TANK': '坦克',
            'SUPPORT': '辅助'
        };
        return typeNames[type] || type;
    }

    // 显示游戏结束界面
    showGameOver() {
        // 禁用所有UI交互
        this.setUIInteractive(false);
        
        // 半透明黑色背景
        this.gameOverOverlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
        
        // 游戏结束文本
        const gameOverText = this.add.text(640, 300, '游戏结束!', {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Arial, sans-serif'
        });
        gameOverText.setOrigin(0.5);
        
        // 重新开始按钮
        const restartButton = this.add.rectangle(640, 400, 200, 60, 0x4a90e2);
        const restartText = this.add.text(640, 400, '重新开始', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        restartText.setOrigin(0.5);
        
        // 返回菜单按钮
        const menuButton = this.add.rectangle(640, 480, 200, 60, 0x6c757d);
        const menuText = this.add.text(640, 480, '返回菜单', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        menuText.setOrigin(0.5);
        
        // 按钮交互
        restartButton.setInteractive();
        restartButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('GameScene');
        });
        
        menuButton.setInteractive();
        menuButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });
        
        // 保存覆盖层元素以便后续清理
        this.gameOverElements = [
            this.gameOverOverlay, gameOverText, restartButton, restartText, menuButton, menuText
        ];
    }

    // 显示胜利界面
    showVictory() {
        // 禁用所有UI交互
        this.setUIInteractive(false);
        
        // 半透明黑色背景
        this.victoryOverlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
        
        // 胜利文本
        const victoryText = this.add.text(640, 300, '胜利！', {
            fontSize: '48px',
            fill: '#00ff00',
            fontFamily: 'Arial, sans-serif'
        });
        victoryText.setOrigin(0.5);
        
        // 统计信息
        const statsText = this.add.text(640, 350, '恭喜击败了所有波次的敌人！', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        statsText.setOrigin(0.5);
        
        // 重新开始按钮
        const restartButton = this.add.rectangle(540, 420, 160, 50, 0x28a745);
        const restartText = this.add.text(540, 420, '再玩一次', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        restartText.setOrigin(0.5);
        
        // 返回菜单按钮
        const menuButton = this.add.rectangle(740, 420, 160, 50, 0x6c757d);
        const menuText = this.add.text(740, 420, '返回菜单', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        menuText.setOrigin(0.5);
        
        // 按钮交互
        restartButton.setInteractive();
        restartButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('GameScene');
        });
        
        menuButton.setInteractive();
        menuButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });
        
        // 保存覆盖层元素以便后续清理
        this.victoryElements = [
            this.victoryOverlay, victoryText, statsText, restartButton, restartText, menuButton, menuText
        ];
    }

    // 设置UI交互状态
    setUIInteractive(interactive) {
        // 禁用/启用主要UI元素的交互
        if (this.refreshButton) this.refreshButton.setInteractive(interactive);
        if (this.lockButton) this.lockButton.setInteractive(interactive);
        if (this.upgradeButton) this.upgradeButton.setInteractive(interactive);
        if (this.pauseButton) this.pauseButton.setInteractive(interactive);
        if (this.speedButton) this.speedButton.setInteractive(interactive);
        if (this.cancelButton) this.cancelButton.setInteractive(interactive);
        
        // 禁用/启用商店槽位交互
        this.shopSlots.forEach(slot => {
            if (slot.background) slot.background.setInteractive(interactive);
        });
    }

    // 切换商店锁定状态
    toggleShopLock() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.towerShop) {
            const isLocked = gameScene.towerShop.toggleLock();
            this.updateLockButtonVisual(isLocked);
            this.updateShopLockVisuals();
            
            if (isLocked) {
                this.showNotification('商店已锁定，波次结束后不会自动刷新', 'info', 2500);
            } else {
                this.showNotification('商店已解锁', 'info', 1500);
            }
        }
    }

    // 更新锁定按钮的视觉效果
    updateLockButtonVisual(isLocked) {
        if (this.lockButton && this.lockText) {
            if (isLocked) {
                this.lockButton.setFillStyle(0xffc107); // 黄色表示已锁定
                this.lockText.setText('🔒解锁');
            } else {
                this.lockButton.setFillStyle(0x6c757d); // 灰色表示未锁定
                this.lockText.setText('锁定');
            }
        }
    }

    // 切换单个槽位的锁定状态
    toggleSlotLock(slotIndex) {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.towerShop) {
            const wasLocked = gameScene.towerShop.toggleSlotLock(slotIndex);
            this.updateShopLockVisuals();
            
            if (wasLocked) {
                this.showNotification(`槽位 ${slotIndex + 1} 已锁定`, 'info', 1500);
            } else {
                this.showNotification(`槽位 ${slotIndex + 1} 已解锁`, 'info', 1500);
            }
        }
    }

    // 更新商店槽位的锁定视觉效果
    updateShopLockVisuals() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.towerShop && this.shopSlots) {
            const lockedSlots = gameScene.towerShop.getLockedSlots();
            
            this.shopSlots.forEach((slot, index) => {
                if (lockedSlots[index]) {
                    // 添加锁定图标
                    if (!slot.lockIcon) {
                        slot.lockIcon = this.add.text(slot.background.x + 45, slot.background.y - 30, '🔒', {
                            fontSize: '16px'
                        });
                        slot.lockIcon.setOrigin(0.5);
                    }
                    // 添加锁定边框效果
                    slot.background.setStrokeStyle(3, 0xffc107);
                } else {
                    // 移除锁定图标
                    if (slot.lockIcon) {
                        slot.lockIcon.destroy();
                        slot.lockIcon = null;
                    }
                    // 恢复正常边框
                    slot.background.setStrokeStyle(2, 0x4a4a6a);
                }
            });
        }
    }

    // 清理游戏结束界面
    clearGameOverUI() {
        if (this.gameOverElements) {
            this.gameOverElements.forEach(element => {
                if (element) element.destroy();
            });
            this.gameOverElements = null;
        }
        
        if (this.victoryElements) {
            this.victoryElements.forEach(element => {
                if (element) element.destroy();
            });
            this.victoryElements = null;
        }
        
        // 重新启用UI交互
        this.setUIInteractive(true);
    }
} 