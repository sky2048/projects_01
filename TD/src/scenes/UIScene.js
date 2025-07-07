import { TOWER_RARITY, SYNERGIES, ECONOMY_CONFIG, EQUIPMENT_CONFIG } from '../config/GameConfig.js';

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
        // 金币显示
        this.goldIcon = this.add.circle(50, 30, 15, 0xffd700);
        this.goldText = this.add.text(75, 30, '100', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.goldText.setOrigin(0, 0.5);

        // 生命值显示
        this.healthIcon = this.add.circle(200, 30, 15, 0xff0000);
        this.healthText = this.add.text(225, 30, '100', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.healthText.setOrigin(0, 0.5);

        // 波次显示
        this.waveText = this.add.text(400, 30, '波次: 1/20', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.waveText.setOrigin(0, 0.5);

        // 选中塔的信息显示
        this.selectedTowerInfo = this.add.text(640, 30, '选择一个塔查看详情', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            align: 'center'
        });
        this.selectedTowerInfo.setOrigin(0.5);

        // 等级和塔位信息（添加到左侧状态栏）
        this.levelText = this.add.text(50, 70, '等级: 1', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });

        this.towerLimitText = this.add.text(50, 95, '塔位: 0/2', {
            fontSize: '16px',
            fill: '#ffff00',
            fontFamily: 'Arial, sans-serif'
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
        // 商店标题
        this.shopTitle = this.add.text(100, 590, '塔商店', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });

        // 刷新按钮移到右侧
        this.refreshButton = this.add.rectangle(730, 590, 100, 30, 0x4a90e2);
        this.refreshText = this.add.text(730, 590, `刷新 (${ECONOMY_CONFIG.REFRESH_COST}金)`, {
            fontSize: '14px',
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

        // 升级按钮（在刷新按钮旁边）
        this.upgradeButton = this.add.rectangle(850, 590, 100, 30, 0x28a745);
        this.upgradeText = this.add.text(850, 590, '升级 (50金)', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.upgradeText.setOrigin(0.5);

        this.upgradeButton.setInteractive();
        this.upgradeButton.on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene');
            const upgradeCost = gameScene.getUpgradeCost();
            
            if (gameScene.gameState.gold >= upgradeCost) {
                const success = gameScene.upgradeLevel();
                if (success) {
                    this.showNotification(`升级成功！等级 ${gameScene.gameState.level}，塔位 +2`, 'success', 2500);
                }
            } else {
                this.showNotification(`金币不足！升级需要 ${upgradeCost} 金币`, 'error', 2000);
            }
        });

        // 商店槽位
        this.shopSlots = [];
        for (let i = 0; i < 5; i++) {
            const slotX = 100 + i * 130;
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
        slot.background.on('pointerdown', () => {
            this.buyTower(index);
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
        // 羁绊显示标题移到左侧
        this.synergyTitle = this.add.text(50, 400, '当前羁绊', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });

        // 羁绊列表
        this.synergyList = [];
        for (let i = 0; i < 5; i++) {
            const synergyText = this.add.text(50, 430 + i * 25, '', {
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
        // 取消选择按钮
        this.cancelButton = this.add.rectangle(1050, 30, 80, 40, 0xff6b6b);
        this.cancelText = this.add.text(1050, 30, '取消选择', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.cancelText.setOrigin(0.5);

        this.cancelButton.setInteractive();
        this.cancelButton.on('pointerdown', () => {
            this.clearTowerSelection();
        });

        // 删除防御塔按钮
        this.deleteButton = this.add.rectangle(1050, 80, 80, 40, 0xff4444);
        this.deleteText = this.add.text(1050, 80, '删除塔', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.deleteText.setOrigin(0.5);

        this.deleteButton.setInteractive();
        this.deleteButton.on('pointerdown', () => {
            this.deleteTower();
        });

        // 初始时隐藏删除按钮，只有选中塔时才显示
        this.deleteButton.setVisible(false);
        this.deleteText.setVisible(false);

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
            
            // 根据生命值改变颜色
            if (amount > 70) {
                this.healthText.setFill('#00ff00');
            } else if (amount > 30) {
                this.healthText.setFill('#ffff00');
            } else {
                this.healthText.setFill('#ff0000');
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

                // 塔图标
                slot.icon = this.createTowerIcon(slot.background.x, slot.background.y - 10, tower);

                // 塔名称
                slot.nameText = this.add.text(slot.background.x, slot.background.y + 15, tower.name, {
                    fontSize: '12px',
                    fill: '#ffffff',
                    fontFamily: 'Arial, sans-serif'
                });
                slot.nameText.setOrigin(0.5);

                // 费用
                slot.costText = this.add.text(slot.background.x, slot.background.y + 30, `${tower.cost}金`, {
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
    }

    createTowerIcon(x, y, tower) {
        let icon;
        const rarityColor = TOWER_RARITY[tower.rarity].color;
        
        switch (tower.type) {
            case 'ARCHER':
                icon = this.add.polygon(x, y, [0, -8, 6, 5, 0, 2, -6, 5], rarityColor);
                break;
            case 'MAGE':
                icon = this.add.star(x, y, 4, 6, 9, rarityColor);
                break;
            case 'ASSASSIN':
                icon = this.add.triangle(x, y, 0, -8, 8, 8, -8, 8, rarityColor);
                break;
            case 'TANK':
                icon = this.add.rectangle(x, y, 12, 12, rarityColor);
                break;
            case 'SUPPORT':
                icon = this.add.circle(x, y, 6, rarityColor);
                break;
            default:
                icon = this.add.circle(x, y, 6, rarityColor);
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
            this.selectedTowerInfo.setText('选择一个塔查看详情');
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
        
        // 显示删除按钮
        if (this.deleteButton && this.deleteText) {
            this.deleteButton.setVisible(true);
            this.deleteText.setVisible(true);
        }
    }

    clearSelectedTowerInfo() {
        this.selectedTowerInfo.setText('从商店选择塔或点击已放置的塔');
        
        // 隐藏删除按钮
        if (this.deleteButton && this.deleteText) {
            this.deleteButton.setVisible(false);
            this.deleteText.setVisible(false);
        }
    }

    deleteTower() {
        const gameScene = this.scene.get('GameScene');
        if (!gameScene.selectedTower) {
            this.showNotification('请先选择一个防御塔', 'warning', 2000);
            return;
        }
        
        // 调用游戏场景的删除方法
        const success = gameScene.deleteTower(gameScene.selectedTower);
        if (success) {
            this.showNotification('防御塔已删除', 'success', 1500);
        } else {
            this.showNotification('无法删除该防御塔：会阻断怪物路径', 'error', 2500);
        }
    }

    updateLevel(level, maxTowers) {
        if (this.levelText) {
            this.levelText.setText(`等级: ${level}`);
        }
        
        // 更新塔位显示
        const gameScene = this.scene.get('GameScene');
        const currentTowers = gameScene.towers ? gameScene.towers.children.entries.length : 0;
        if (this.towerLimitText) {
            this.towerLimitText.setText(`塔位: ${currentTowers}/${maxTowers}`);
        }
        
        // 更新升级按钮显示
        const upgradeCost = gameScene.getUpgradeCost();
        if (this.upgradeText) {
            this.upgradeText.setText(`升级 (${upgradeCost}金)`);
        }
    }

    createNotificationSystem() {
        // 创建提示容器
        this.notifications = [];
        this.notificationY = 200; // 提示显示的起始Y位置
    }

    createTooltipSystem() {
        // 创建tooltip容器，初始隐藏
        this.tooltip = {
            background: null,
            content: null,
            visible: false
        };
    }

    showNotification(message, type = 'info', duration = 2000) {
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

    // 波次提示系统
    showWaveNotification(wave, isStart = true) {
        if (isStart) {
            if (wave === 20) {
                this.showNotification(`第 ${wave} 波开始！BOSS波次！`, 'error', 3000);
            } else if (wave % 5 === 0) {
                this.showNotification(`第 ${wave} 波开始！精英波次！`, 'warning', 2500);
            } else {
                this.showNotification(`第 ${wave} 波开始`, 'info', 2000);
            }
        } else {
            if (wave === 20) {
                this.showNotification('恭喜！击败了BOSS！', 'success', 3000);
            } else {
                this.showNotification(`第 ${wave} 波完成`, 'success', 1500);
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
        if (this.upgradeButton) this.upgradeButton.setInteractive(interactive);
        if (this.pauseButton) this.pauseButton.setInteractive(interactive);
        if (this.speedButton) this.speedButton.setInteractive(interactive);
        if (this.cancelButton) this.cancelButton.setInteractive(interactive);
        
        // 禁用/启用商店槽位交互
        this.shopSlots.forEach(slot => {
            if (slot.background) slot.background.setInteractive(interactive);
        });
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