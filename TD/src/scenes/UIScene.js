import { TOWER_RARITY, SYNERGIES, ECONOMY_CONFIG, EQUIPMENT_CONFIG, EXPERIENCE_CONFIG, LEVEL_RARITY_MODIFIERS } from '../config/GameConfig.js';
import { StatusUI } from '../ui/StatusUI.js';
import { ShopUI } from '../ui/ShopUI.js';
import { SynergyUI } from '../ui/SynergyUI.js';
import { EquipmentUI } from '../ui/EquipmentUI.js';
import { NotificationUI } from '../ui/NotificationUI.js';
import { TooltipUI } from '../ui/TooltipUI.js';
import { RoguelikeUI } from '../ui/RoguelikeUI.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        
        // 初始化UI模块
        this.statusUI = null;
        this.shopUI = null;
        this.synergyUI = null;
        this.equipmentUI = null;
        this.notificationUI = null;
        this.tooltipUI = null;
        this.roguelikeUI = null;
        
        // GM面板状态
        this.gmPanelVisible = false;
        this.gmPanelElements = [];
        
        // 兼容性属性
        this.TOWER_RARITY = TOWER_RARITY;
    }

    create() {
        console.log('UIScene create 开始...');
        
        // 清理之前的UI元素（如果存在）
        this.clearPreviousUI();
        
        // 创建UI背景
        this.createUIBackground();
        
        // 初始化所有UI模块
        this.statusUI = new StatusUI(this);
        this.shopUI = new ShopUI(this);
        this.synergyUI = new SynergyUI(this);
        this.equipmentUI = new EquipmentUI(this);
        this.notificationUI = new NotificationUI(this);
        this.tooltipUI = new TooltipUI(this);
        this.roguelikeUI = new RoguelikeUI(this);
        
        // 创建各个UI模块
        this.statusUI.create();
        this.shopUI.create();
        this.synergyUI.create();
        this.equipmentUI.create();
        this.notificationUI.create();
        this.tooltipUI.create();
        
        // 创建控制按钮
        this.createControlButtons();
        
        console.log('UI场景已创建');
        
        // 发送ready事件，通知GameScene可以初始化管理器
        this.events.emit('ready');
    }

    clearPreviousUI() {
        // 清理之前的UI模块
        if (this.statusUI) {
            this.statusUI = null;
        }
        if (this.shopUI) {
            this.shopUI = null;
        }
        if (this.synergyUI) {
            this.synergyUI = null;
        }
        if (this.equipmentUI) {
            this.equipmentUI = null;
        }
        if (this.notificationUI) {
            this.notificationUI = null;
        }
        if (this.tooltipUI) {
            this.tooltipUI = null;
        }
        
        // 清理背景
        if (this.shopBackground) {
            this.shopBackground.destroy();
            this.shopBackground = null;
        }
        
        console.log('之前的UI已清理');
    }

    createUIBackground() {
        // 底部UI背景
        this.shopBackground = this.add.rectangle(640, 660, 1280, 140, 0x2c2c54);
        this.shopBackground.setAlpha(0.9);
    }

    // 处理函数 - 委托给对应的UI模块
    handleBuyExperience() {
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
    }

    handleRefreshShop() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene.gameState.gold >= ECONOMY_CONFIG.REFRESH_COST) {
            gameScene.towerShop.refreshShopPaid();
            this.showNotification('商店已刷新', 'success', 1500);
        } else {
            this.showNotification(`金币不足！刷新需要 ${ECONOMY_CONFIG.REFRESH_COST} 金币`, 'error', 2000);
        }
    }

    handleBuyTower(index) {
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
        
        // 设置选中的塔
        gameScene.towerShop.selectTower(index);
        
        // 更新选中塔的信息显示
        this.showTowerInfo(tower);
        
        // 重置所有槽位颜色，然后高亮选中的槽位
        this.shopUI.resetShopHighlight();
        this.shopUI.highlightSlot(index);
        
        this.showNotification(`已选择 ${tower.name}，点击空地放置`, 'success', 2000);
        console.log(`选择了 ${tower.name} 塔`);
    }

    handleShopLock() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.towerShop) {
            const isLocked = gameScene.towerShop.toggleLock();
            this.shopUI.updateLockButtonVisual(isLocked);
            this.shopUI.updateShopLockVisuals();
            
            if (isLocked) {
                this.showNotification('商店已锁定，波次结束后不会自动刷新', 'info', 2500);
            } else {
                this.showNotification('商店已解锁', 'info', 1500);
            }
        }
    }

    handleSlotLock(slotIndex) {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.towerShop) {
            const wasLocked = gameScene.towerShop.toggleSlotLock(slotIndex);
            this.shopUI.updateShopLockVisuals();
            
            if (wasLocked) {
                this.showNotification(`槽位 ${slotIndex + 1} 已锁定`, 'info', 1500);
            } else {
                this.showNotification(`槽位 ${slotIndex + 1} 已解锁`, 'info', 1500);
            }
        }
    }

    // 委托方法 - 更新状态栏数据
    updateGold(amount, changeAmount = null) {
        if (this.statusUI) {
            this.statusUI.updateGold(amount, changeAmount);
        }
    }

    updateHealth(amount, changeAmount = null) {
        if (this.statusUI) {
            this.statusUI.updateHealth(amount, changeAmount);
        }
    }

    updateWave(wave, phase = null, waveInfo = null) {
        if (this.statusUI) {
            this.statusUI.updateWave(wave, phase, waveInfo);
        }
    }

    updateMapName(mapName) {
        if (this.statusUI) {
            this.statusUI.updateMapName(mapName);
        }
    }

    updateLevel(level, maxTowers) {
        if (this.statusUI) {
            this.statusUI.updateLevel(level, maxTowers);
        }
    }

    updateExperience(currentExp, expRequiredForNext) {
        if (this.statusUI) {
            this.statusUI.updateExperience(currentExp, expRequiredForNext);
        }
    }

    showTowerInfo(tower) {
        if (this.statusUI) {
            this.statusUI.showTowerInfo(tower);
        }
    }

    showSelectedTowerInfo(tower) {
        if (this.statusUI) {
            this.statusUI.showSelectedTowerInfo(tower);
        }
    }

    clearSelectedTowerInfo() {
        if (this.statusUI) {
            this.statusUI.clearSelectedTowerInfo();
        }
    }

    // 委托方法 - 商店相关
    updateShop(offers) {
        if (this.shopUI) {
            this.shopUI.updateShop(offers);
        }
    }

    clearTowerSelection() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene.towerShop) {
            gameScene.towerShop.selectedTower = null;
            this.clearSelectedTowerInfo();
            // 重置所有商店槽位的高亮状态
            if (this.shopUI) {
                this.shopUI.resetShopHighlight();
            }
        }
        
        // 同时清除已放置塔的选中状态
        if (gameScene.selectedTower) {
            gameScene.selectedTower.hideRange();
            gameScene.selectedTower.setSelected(false);
            gameScene.selectedTower = null;
        }
    }

    // 委托方法 - 羁绊相关
    updateSynergies(towers) {
        if (this.synergyUI) {
            this.synergyUI.updateSynergies(towers);
        }
    }

    // 委托方法 - 装备相关
    updateEquipmentInventory(inventory) {
        if (this.equipmentUI) {
            this.equipmentUI.updateEquipmentInventory(inventory);
        }
    }

    // 委托方法 - 通知相关
    showNotification(message, type = 'info', duration = 2000, position = 'center') {
        if (this.notificationUI) {
            this.notificationUI.showNotification(message, type, duration, position);
        }
    }

    showWaveNotification(wave, isStart = true, customText = null) {
        if (this.notificationUI) {
            this.notificationUI.showWaveNotification(wave, isStart, customText);
        }
    }

    // 肉鸽三选一相关方法
    showRoguelikeSelection(options, callback) {
        if (this.roguelikeUI) {
            this.roguelikeUI.show(options, callback);
        }
    }

    // 启动波次倒计时进度条
    startWaveCountdown(duration, nextWave, nextWaveInfo) {
        if (this.statusUI && this.statusUI.startCountdown) {
            this.statusUI.startCountdown(duration, nextWave, nextWaveInfo);
        }
    }

    hideRoguelikeSelection() {
        if (this.roguelikeUI) {
            this.roguelikeUI.hide();
        }
    }

    // 委托方法 - Tooltip相关
    showTowerTooltip(x, y, tower, slotIndex = null) {
        if (this.tooltipUI) {
            this.tooltipUI.showTooltip(x, y, tower, slotIndex);
        }
    }

    hideTowerTooltip() {
        if (this.tooltipUI) {
            this.tooltipUI.hideTooltip();
        }
    }

    showEquipmentTooltip(x, y, equipment) {
        if (this.tooltipUI) {
            this.tooltipUI.showEquipmentTooltip(x, y, equipment);
        }
    }

    hideEquipmentTooltip() {
        if (this.tooltipUI) {
            this.tooltipUI.hideEquipmentTooltip();
        }
    }

    showSynergyTooltip(x, y, synergyKey) {
        if (this.tooltipUI) {
            this.tooltipUI.showSynergyTooltip(x, y, synergyKey);
        }
    }

    hideSynergyTooltip() {
        if (this.tooltipUI) {
            this.tooltipUI.hideSynergyTooltip();
        }
    }

    // 兼容性方法，继续委托给模块
    buyTower(index) {
        this.handleBuyTower(index);
    }

    toggleShopLock() {
        this.handleShopLock();
    }

    toggleSlotLock(slotIndex) {
        this.handleSlotLock(slotIndex);
    }

    createControlButtons() {
        // GM工具按钮（右上角最上方）
        this.gmButton = this.add.rectangle(1230, 30, 80, 35, 0x8b5cf6);
        this.gmText = this.add.text(1230, 30, 'GM工具', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.gmText.setOrigin(0.5);

        this.gmButton.setInteractive();
        this.gmButton.on('pointerdown', () => {
            console.log('GM按钮点击');
            this.toggleGMPanel();
        });

        this.gmButton.on('pointerover', () => {
            this.gmButton.setFillStyle(0x9f7aea);
        });

        this.gmButton.on('pointerout', () => {
            this.gmButton.setFillStyle(0x8b5cf6);
        });

        // 返回主界面按钮（右上角）
        this.menuButton = this.add.rectangle(1140, 30, 80, 35, 0x6c757d);
        this.menuText = this.add.text(1140, 30, '返回菜单', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.menuText.setOrigin(0.5);

        this.menuButton.setInteractive();
        this.menuButton.on('pointerdown', () => {
            this.returnToMenu();
        });

        this.menuButton.on('pointerover', () => {
            this.menuButton.setFillStyle(0x7d868f);
        });

        this.menuButton.on('pointerout', () => {
            this.menuButton.setFillStyle(0x6c757d);
        });

        // 暂停按钮
        this.pauseButton = this.add.rectangle(1140, 75, 80, 35, 0x4a90e2);
        this.pauseText = this.add.text(1140, 75, '暂停', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.pauseText.setOrigin(0.5);

        this.pauseButton.setInteractive();
        this.pauseButton.on('pointerdown', () => {
            this.togglePause();
        });

        // 加速按钮
        this.speedButton = this.add.rectangle(1230, 75, 80, 35, 0x4a90e2);
        this.speedText = this.add.text(1230, 75, '加速', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.speedText.setOrigin(0.5);

        this.speedButton.setInteractive();
        this.speedButton.on('pointerdown', () => {
            this.toggleSpeed();
        });
    }

    togglePause() {
        const gameScene = this.scene.get('GameScene');
        if (!gameScene) return;
        
        gameScene.gameState.isPaused = !gameScene.gameState.isPaused;
        
        if (gameScene.gameState.isPaused) {
            this.pauseText.setText('继续');
            // 暂停时保存当前的时间缩放
            this.savedTimeScale = gameScene.physics.world.timeScale || 1;
            this.savedTweenScale = gameScene.tweens.timeScale || 1;
            this.savedGameTimeScale = gameScene.time.timeScale || 1;
            
            // 设置时间缩放为0，完全暂停
            gameScene.physics.world.timeScale = 0;
            gameScene.tweens.timeScale = 0;
            gameScene.time.timeScale = 0;
        } else {
            this.pauseText.setText('暂停');
            // 恢复之前保存的时间缩放
            gameScene.physics.world.timeScale = this.savedTimeScale || 1;
            gameScene.tweens.timeScale = this.savedTweenScale || 1;
            gameScene.time.timeScale = this.savedGameTimeScale || 1;
        }
        
        console.log(`游戏${gameScene.gameState.isPaused ? '已暂停' : '已恢复'}`);
    }

    toggleSpeed() {
        const gameScene = this.scene.get('GameScene');
        if (!gameScene) return;

        // 如果游戏暂停，不允许切换速度
        if (gameScene.gameState.isPaused) {
            this.showNotification('游戏暂停时无法切换速度', 'warning', 1500);
            return;
        }

        // 多档速度循环
        const speedLevels = [1, 2, 3, 5, 10];
        let current = speedLevels.indexOf(gameScene.physics.world.timeScale);
        if (current === -1) current = 0;
        let next = (current + 1) % speedLevels.length;
        const newSpeed = speedLevels[next];

        gameScene.physics.world.timeScale = newSpeed;
        gameScene.tweens.timeScale = newSpeed;
        gameScene.time.timeScale = newSpeed;
        this.speedText.setText(`${newSpeed}x`);

        console.log(`游戏速度切换为: ${newSpeed}x`);
    }

    toggleGMPanel() {
        if (this.gmPanelVisible) {
            this.hideGMPanel();
        } else {
            this.showGMPanel();
        }
    }

    showGMPanel() {
        console.log('showGMPanel called');
        if (this.gmPanelVisible) {
            console.log('gmPanelVisible is true, return');
            return;
        }
        this.gmPanelVisible = true;

        // 更小的弹窗尺寸和更靠右的位置
        const panelWidth = 260;
        const panelHeight = 340;
        const panelX = 1280 - panelWidth / 2 - 10; // 右侧只留10px边距
        const panelY = 100 + panelHeight / 2;      // 稍微上移

        // 主面板
        const panelBg = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x2c2c54, 0.98)
            .setStrokeStyle(3, 0x8b5cf6)
            .setDepth(5001)
            .setOrigin(0.5)
            .setAlpha(0.98);
        panelBg.setInteractive();
        this.gmPanelElements.push(panelBg);

        // 标题
        const title = this.add.text(panelX, panelY - panelHeight / 2 + 30, 'GM工具面板', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(5002);
        this.gmPanelElements.push(title);

        // 副标题
        const subtitle = this.add.text(panelX, panelY - panelHeight / 2 + 54, '调试和测试功能', {
            fontSize: '12px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setDepth(5002);
        this.gmPanelElements.push(subtitle);

        // 关闭按钮（右上角）
        const closeBtnX = panelX + panelWidth / 2 - 20;
        const closeBtnY = panelY - panelHeight / 2 + 20;
        const closeButton = this.add.rectangle(closeBtnX, closeBtnY, 28, 22, 0xff4444)
            .setDepth(5003)
            .setInteractive();
        const closeText = this.add.text(closeBtnX, closeBtnY, '关', {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setDepth(5004);
        closeButton.on('pointerdown', () => this.hideGMPanel());
        closeButton.on('pointerover', () => closeButton.setFillStyle(0xff6666));
        closeButton.on('pointerout', () => closeButton.setFillStyle(0xff4444));
        this.gmPanelElements.push(closeButton, closeText);

        // GM功能按钮（竖排，居中）
        this.createGMButtons(panelX, panelY, panelHeight);
    }

    // 修改createGMButtons，支持自定义高度
    createGMButtons(panelX, panelY, panelHeight = 340) {
        const buttonWidth = 150;
        const buttonHeight = 32;
        const buttonSpacing = 38;
        const startY = panelY - panelHeight / 2 + 90;

        const gmButtons = [
            { text: '增加1000金币', color: 0xffd700, action: () => this.gmAddGold(1000) },
            { text: '回复满血', color: 0xff4444, action: () => this.gmRestoreHealth() },
            { text: '增加经验', color: 0x00ff88, action: () => this.gmAddExperience(50) },
            { text: '跳过当前波次', color: 0x4a90e2, action: () => this.gmSkipWave() },
            { text: '清空所有怪物', color: 0xff6b6b, action: () => this.gmClearMonsters() }
        ];

        gmButtons.forEach((buttonConfig, index) => {
            const y = startY + index * buttonSpacing;
            const button = this.add.rectangle(panelX, y, buttonWidth, buttonHeight, buttonConfig.color)
                .setStrokeStyle(2, 0xffffff, 0.5)
                .setDepth(5003)
                .setInteractive();
            const buttonText = this.add.text(panelX, y, buttonConfig.text, {
                fontSize: '13px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(5004);
            button.on('pointerdown', () => {
                buttonConfig.action();
                this.showNotification(`执行: ${buttonConfig.text}`, 'success', 1500);
            });
            button.on('pointerover', () => {
                button.setFillStyle(buttonConfig.color, 0.8);
                button.setScale(1.05);
            });
            button.on('pointerout', () => {
                button.setFillStyle(buttonConfig.color, 1);
                button.setScale(1);
            });
            this.gmPanelElements.push(button, buttonText);
        });
    }

    hideGMPanel() {
        if (!this.gmPanelVisible) return;
        
        this.gmPanelVisible = false;
        
        // 销毁所有GM面板元素
        this.gmPanelElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.gmPanelElements = [];
    }

    // GM功能方法
    gmAddGold(amount) {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.gameState) {
            gameScene.gameState.gold += amount;
            this.updateGold(gameScene.gameState.gold, amount);
        }
    }

    gmRestoreHealth() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.gameState) {
            const oldHealth = gameScene.gameState.health;
            gameScene.gameState.health = 100;
            this.updateHealth(gameScene.gameState.health, 100 - oldHealth);
        }
    }

    gmAddExperience(amount) {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.addExperience) {
            gameScene.addExperience(amount, 'GM工具');
        }
    }

    gmSkipWave() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.waveManager) {
            // 清空当前波次的怪物
            this.gmClearMonsters();
            
            // 强制结束当前波次
            gameScene.waveManager.forceEndWave();
        }
    }

    gmClearMonsters() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.monsters && gameScene.monsters.children) {
            const monsters = [...gameScene.monsters.children.entries];
            monsters.forEach(monster => {
                if (monster && monster.destroyVisuals && monster.destroy) {
                    // 先清理视觉效果和动画
                    monster.destroyVisuals();
                    // 然后销毁怪物本身
                    monster.destroy();
                }
            });
            // 清空怪物组
            gameScene.monsters.clear();
        }
    }

    returnToMenu() {
        // 显示确认对话框
        this.showConfirmDialog(
            '确定要返回主菜单吗？',
            '当前游戏进度将会丢失',
            () => {
                // 确认返回菜单
                this.scene.stop('GameScene');
                this.scene.stop('UIScene');
                this.scene.start('MenuScene');
            },
            () => {
                // 取消，什么都不做
            }
        );
    }

    showConfirmDialog(title, message, onConfirm, onCancel) {
        // 半透明黑色背景
        this.confirmOverlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5);
        this.confirmOverlay.setDepth(8000); // 低于肉鸽UI但高于其他元素
        
        // 对话框背景
        this.confirmDialog = this.add.rectangle(640, 360, 400, 200, 0x2c2c54);
        this.confirmDialog.setStrokeStyle(2, 0x4a90e2);
        this.confirmDialog.setDepth(8001);
        
        // 标题文本
        const titleText = this.add.text(640, 300, title, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        titleText.setOrigin(0.5);
        titleText.setDepth(8002);
        
        // 消息文本
        const messageText = this.add.text(640, 340, message, {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            align: 'center'
        });
        messageText.setOrigin(0.5);
        messageText.setDepth(8002);
        
        // 确认按钮
        const confirmButton = this.add.rectangle(580, 400, 80, 35, 0xff4444);
        confirmButton.setDepth(8003);
        const confirmText = this.add.text(580, 400, '确定', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        confirmText.setOrigin(0.5);
        confirmText.setDepth(8004);
        
        // 取消按钮
        const cancelButton = this.add.rectangle(700, 400, 80, 35, 0x6c757d);
        cancelButton.setDepth(8003);
        const cancelText = this.add.text(700, 400, '取消', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        cancelText.setOrigin(0.5);
        cancelText.setDepth(8004);
        
        // 按钮交互
        confirmButton.setInteractive();
        confirmButton.on('pointerdown', () => {
            this.hideConfirmDialog();
            onConfirm();
        });
        
        cancelButton.setInteractive();
        cancelButton.on('pointerdown', () => {
            this.hideConfirmDialog();
            onCancel();
        });
        
        // 保存对话框元素
        this.confirmElements = [
            this.confirmOverlay, this.confirmDialog, titleText, messageText,
            confirmButton, confirmText, cancelButton, cancelText
        ];
    }

    hideConfirmDialog() {
        if (this.confirmElements) {
            this.confirmElements.forEach(element => {
                if (element) element.destroy();
            });
            this.confirmElements = null;
        }
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
        if (this.statusUI) this.statusUI.setInteractive(interactive);
        if (this.shopUI) this.shopUI.setInteractive(interactive);
        if (this.equipmentUI) this.equipmentUI.setInteractive(interactive);
        if (this.menuButton) this.menuButton.setInteractive(interactive);
        if (this.pauseButton) this.pauseButton.setInteractive(interactive);
        if (this.speedButton) this.speedButton.setInteractive(interactive);
        if (this.gmButton) this.gmButton.setInteractive(interactive);
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
        
        // 清理所有tooltip
        if (this.tooltipUI) {
            this.tooltipUI.clearAllTooltips();
        }
        
        // 重新启用UI交互
        this.setUIInteractive(true);
    }

    // 场景关闭时的清理方法
    shutdown() {
        console.log('UIScene shutdown 开始清理资源...');
        
        // 清理GM面板
        this.hideGMPanel();
        
        // 清理游戏结束UI
        this.clearGameOverUI();
        
        // 清理确认对话框
        this.hideConfirmDialog();
        
        // 清理所有UI模块
        this.statusUI = null;
        this.shopUI = null;
        this.synergyUI = null;
        this.equipmentUI = null;
        this.notificationUI = null;
        this.tooltipUI = null;
        
        // 清理背景
        if (this.shopBackground) {
            this.shopBackground.destroy();
            this.shopBackground = null;
        }
        
        // 清理控制按钮
        if (this.pauseButton) {
            this.pauseButton.destroy();
            this.pauseButton = null;
        }
        
        if (this.speedButton) {
            this.speedButton.destroy();
            this.speedButton = null;
        }
        
        if (this.menuButton) {
            this.menuButton.destroy();
            this.menuButton = null;
        }
        
        if (this.gmButton) {
            this.gmButton.destroy();
            this.gmButton = null;
        }
        
        console.log('UIScene shutdown 清理完成');
    }
} 