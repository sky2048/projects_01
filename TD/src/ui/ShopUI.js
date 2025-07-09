import { TOWER_RARITY, ECONOMY_CONFIG } from '../config/GameConfig.js';

export class ShopUI {
    constructor(scene) {
        this.scene = scene;
        this.shopSlots = [];
        this.elements = {};
    }

    create() {
        this.createShopBackground();
        this.createShopSlots();
        this.createLockButton();
    }

    createShopBackground() {
        // 商店槽位衬底背景
        const slotWidth = 120;
        const slotSpacing = 130;
        const totalSlotsWidth = (5 - 1) * slotSpacing + slotWidth;
        const slotY = 650;
        
        // 创建商店槽位整体衬底
        const shopPadding = 20;
        const shopUnderLayWidth = totalSlotsWidth + shopPadding * 2;
        const shopUnderLayHeight = 100;
        
        this.elements.shopUnderlay = this.scene.add.rectangle(640, slotY, shopUnderLayWidth, shopUnderLayHeight, 0x1a1a2e, 0.7);
        this.elements.shopUnderlay.setStrokeStyle(2, 0x3a3a5a, 0.8);
    }

    createShopSlots() {
        const slotWidth = 120;
        const slotSpacing = 130;
        const totalSlotsWidth = (5 - 1) * slotSpacing + slotWidth;
        const startX = (1280 - totalSlotsWidth) / 2 + slotWidth / 2;
        const slotY = 650;
        
        // 商店槽位 - 水平居中显示
        this.shopSlots = [];
        
        for (let i = 0; i < 5; i++) {
            const slotX = startX + i * slotSpacing;
            const slot = this.createShopSlot(slotX, slotY, i);
            this.shopSlots.push(slot);
        }
    }

    createShopSlot(x, y, index) {
        const slot = {
            background: this.scene.add.rectangle(x, y, 120, 80, 0x3a3a5a),
            icon: null,
            nameText: null,
            costText: null,
            rarityBorder: null,
            index: index,
            tower: null
        };

        slot.background.setStrokeStyle(2, 0x4a4a6a);
        slot.background.setInteractive();
        
        slot.background.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.scene.handleSlotLock(index);
            } else {
                this.scene.handleBuyTower(index);
            }
        });

        slot.background.on('pointerover', (pointer) => {
            slot.background.setFillStyle(0x4a4a7a);
            if (slot.tower) {
                this.scene.showTowerTooltip(pointer.worldX, pointer.worldY, slot.tower);
            }
        });

        slot.background.on('pointerout', () => {
            slot.background.setFillStyle(0x3a3a5a);
            this.scene.hideTowerTooltip();
        });

        slot.background.on('pointermove', (pointer) => {
            if (slot.tower && this.scene.tooltip && this.scene.tooltip.visible) {
                this.scene.showTowerTooltip(pointer.worldX, pointer.worldY, slot.tower);
            }
        });

        return slot;
    }

    createLockButton() {
        const slotWidth = 120;
        const slotSpacing = 130;
        const totalSlotsWidth = (5 - 1) * slotSpacing + slotWidth;
        const startX = (1280 - totalSlotsWidth) / 2 + slotWidth / 2;
        const slotY = 650;
        
        const buttonWidth = 80;
        const buttonHeight = 30;
        const buttonX = startX + totalSlotsWidth - slotWidth/2 - 30;
        const buttonY = slotY - 60;
        
        this.elements.lockButton = this.scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x6c757d);
        this.elements.lockText = this.scene.add.text(buttonX, buttonY, '锁定', {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        this.elements.lockText.setOrigin(0.5);

        this.elements.lockButton.setInteractive();
        this.elements.lockButton.on('pointerdown', () => {
            this.scene.handleShopLock();
        });
    }

    updateShop(offers) {
        // 清除现有内容和选中状态
        this.resetShopHighlight();
        
        this.shopSlots.forEach(slot => {
            if (slot.icon) slot.icon.destroy();
            if (slot.nameText) slot.nameText.destroy();
            if (slot.costText) slot.costText.destroy();
            if (slot.rarityBorder) slot.rarityBorder.destroy();
            
            slot.icon = null;
            slot.nameText = null;
            slot.costText = null;
            slot.rarityBorder = null;
            slot.tower = null;
        });

        // 更新商店内容
        for (let i = 0; i < offers.length && i < this.shopSlots.length; i++) {
            const tower = offers[i];
            const slot = this.shopSlots[i];
            
            slot.tower = tower;
            
            if (tower) {
                // 品质边框
                const rarityColor = TOWER_RARITY[tower.rarity].color;
                slot.rarityBorder = this.scene.add.rectangle(slot.background.x, slot.background.y, 120, 80);
                slot.rarityBorder.setStrokeStyle(3, rarityColor);
                slot.rarityBorder.setFillStyle(0x000000, 0);

                // 塔图标 - 居中显示
                slot.icon = this.createTowerIcon(slot.background.x, slot.background.y - 5, tower);

                // 塔名称
                slot.nameText = this.scene.add.text(slot.background.x, slot.background.y + 18, tower.name, {
                    fontSize: '12px',
                    fill: '#ffffff',
                    fontFamily: 'Arial, sans-serif'
                });
                slot.nameText.setOrigin(0.5);

                // 费用
                slot.costText = this.scene.add.text(slot.background.x, slot.background.y + 32, `${tower.cost}金`, {
                    fontSize: '10px',
                    fill: '#ffd700',
                    fontFamily: 'Arial, sans-serif'
                });
                slot.costText.setOrigin(0.5);
            } else {
                // 空槽位显示 "已售出"
                slot.nameText = this.scene.add.text(slot.background.x, slot.background.y, '已售出', {
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
        
        switch (tower.type) {
            case 'ARCHER':
                icon = this.scene.add.polygon(x, y, [0, -10, 7, 6, 0, 3, -7, 6], rarityColor);
                break;
            case 'MAGE':
                icon = this.scene.add.star(x, y, 4, 7, 11, rarityColor);
                break;
            case 'ASSASSIN':
                icon = this.scene.add.triangle(x, y, 0, -10, 10, 10, -10, 10, rarityColor);
                break;
            case 'TANK':
                icon = this.scene.add.rectangle(x, y, 14, 14, rarityColor);
                break;
            case 'SUPPORT':
                icon = this.scene.add.circle(x, y, 8, rarityColor);
                break;
            default:
                icon = this.scene.add.circle(x, y, 8, rarityColor);
        }
        
        icon.setStrokeStyle(1, 0x000000);
        return icon;
    }

    resetShopHighlight() {
        this.shopSlots.forEach(slot => {
            // 重置背景颜色
            slot.background.setFillStyle(0x3a3a5a);
            slot.background.setStrokeStyle(2, 0x4a4a6a);
            
            // 移除选中指示器
            if (slot.selectedIndicator) {
                slot.selectedIndicator.destroy();
                slot.selectedIndicator = null;
            }
            
            // 重置缩放
            slot.background.setScale(1);
            if (slot.icon) slot.icon.setScale(1);
            if (slot.nameText) slot.nameText.setScale(1);
            if (slot.costText) slot.costText.setScale(1);
            if (slot.rarityBorder) slot.rarityBorder.setScale(1);
        });
    }

    highlightSlot(index) {
        if (this.shopSlots[index]) {
            const slot = this.shopSlots[index];
            
            // 更亮的背景色和金色边框
            slot.background.setFillStyle(0x7a7a9a);
            slot.background.setStrokeStyle(4, 0xffd700);
            
            // 轻微放大效果
            slot.background.setScale(1.05);
            if (slot.icon) slot.icon.setScale(1.05);
            if (slot.nameText) slot.nameText.setScale(1.05);
            if (slot.costText) slot.costText.setScale(1.05);
            if (slot.rarityBorder) slot.rarityBorder.setScale(1.05);
            
            // 添加选中指示器（金色光环）
            if (!slot.selectedIndicator) {
                slot.selectedIndicator = this.scene.add.circle(
                    slot.background.x, 
                    slot.background.y, 
                    65, 
                    0xffd700, 
                    0
                );
                slot.selectedIndicator.setStrokeStyle(3, 0xffd700, 0.8);
                slot.selectedIndicator.setDepth(-1); // 确保在背景之下
                
                // 添加闪烁效果
                this.scene.tweens.add({
                    targets: slot.selectedIndicator,
                    alpha: { from: 0.8, to: 0.3 },
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }
    }

    updateLockButtonVisual(isLocked) {
        if (this.elements.lockButton && this.elements.lockText) {
            if (isLocked) {
                this.elements.lockButton.setFillStyle(0xffc107);
                this.elements.lockText.setText('🔒解锁');
            } else {
                this.elements.lockButton.setFillStyle(0x6c757d);
                this.elements.lockText.setText('锁定');
            }
        }
    }

    updateShopLockVisuals() {
        const gameScene = this.scene.scene.get('GameScene');
        if (gameScene && gameScene.towerShop && this.shopSlots) {
            const lockedSlots = gameScene.towerShop.getLockedSlots();
            
            this.shopSlots.forEach((slot, index) => {
                if (lockedSlots[index]) {
                    // 添加锁定图标
                    if (!slot.lockIcon) {
                        slot.lockIcon = this.scene.add.text(slot.background.x + 45, slot.background.y - 30, '🔒', {
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

    setInteractive(interactive) {
        if (this.elements.lockButton) this.elements.lockButton.setInteractive(interactive);
        this.shopSlots.forEach(slot => {
            if (slot.background) slot.background.setInteractive(interactive);
        });
    }

    getSlot(index) {
        return this.shopSlots[index];
    }
} 