export class EquipmentUI {
    constructor(scene) {
        this.scene = scene;
        this.equipmentSlots = [];
        this.elements = {};
        this.dragPreview = null;
    }

    create() {
        this.createEquipmentInventory();
    }

    createEquipmentInventory() {
        // 装备背包右侧显示，移除标题，格子完美镶嵌
        const equipmentX = 1100;
        const equipmentY = 660;
        
        // 装备背包背景 - 调整尺寸以完美容纳8个槽位
        const slotSize = 30;
        const slotSpacing = 35;
        const gridWidth = 4 * slotSpacing - (slotSpacing - slotSize);
        const gridHeight = 2 * slotSpacing - (slotSpacing - slotSize);
        const padding = 10;
        
        this.elements.equipmentBackground = this.scene.add.rectangle(
            equipmentX, 
            equipmentY, 
            gridWidth + padding * 2, 
            gridHeight + padding * 2, 
            0x3a3a5a, 
            0.8
        );
        this.elements.equipmentBackground.setStrokeStyle(2, 0x4a4a6a);

        // 创建8个装备槽位（4x2网格），完美镶嵌在背景中
        this.equipmentSlots = [];
        const startX = equipmentX - (gridWidth - slotSize) / 2;
        const startY = equipmentY - (gridHeight - slotSize) / 2;
        
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 4; col++) {
                const slotX = startX + col * slotSpacing;
                const slotY = startY + row * slotSpacing;
                
                const slot = this.createEquipmentSlot(slotX, slotY, row * 4 + col);
                this.equipmentSlots.push(slot);
            }
        }
    }

    createEquipmentSlot(x, y, index) {
        const slot = {
            background: this.scene.add.rectangle(x, y, 30, 30, 0x2a2a4a),
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
                this.scene.showEquipmentTooltip(pointer.worldX, pointer.worldY, slot.equipment);
            }
        });

        slot.background.on('pointerout', () => {
            slot.background.setFillStyle(0x2a2a4a);
            this.scene.hideEquipmentTooltip();
        });

        slot.background.on('pointermove', (pointer) => {
            // 鼠标移动时更新tooltip位置
            if (slot.equipment && this.scene.equipmentTooltip && this.scene.equipmentTooltip.visible) {
                this.scene.showEquipmentTooltip(pointer.worldX, pointer.worldY, slot.equipment);
            }
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
                slot.icon = this.scene.add.text(slot.background.x, slot.background.y, equipment.icon, {
                    fontSize: '16px'
                });
                slot.icon.setOrigin(0.5);
                
                // 根据装备品质设置边框颜色
                const borderColor = equipment.tier === 'crafted' ? 0xffd700 : 0x888888;
                slot.background.setStrokeStyle(2, borderColor);
            }
        });
    }

    // 创建拖拽预览
    createDragPreview(equipment) {
        if (this.dragPreview) {
            this.dragPreview.destroy();
        }
        
        this.dragPreview = this.scene.add.text(0, 0, equipment.icon, {
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
        const gameScene = this.scene.scene.get('GameScene');
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
                        this.scene.showNotification(`${equipment.name} 已装备到塔上`, 'success', 1500);
                    }
                }
                return;
            }
        }
        
        // 如果没有拖拽到塔上，显示提示
        this.scene.showNotification('请将装备拖拽到塔上', 'warning', 1500);
    }

    // 更新塔的装备显示（当选中塔时）
    updateTowerEquipment(tower) {
        if (!tower.equipment) return;
        
        let equipmentText = '装备:\n';
        tower.equipment.forEach(equipment => {
            equipmentText += `${equipment.icon} ${equipment.name}\n`;
        });
        
        // 在塔信息中显示装备
        if (this.scene.statusUI && this.scene.statusUI.elements.selectedTowerInfo) {
            const currentText = this.scene.statusUI.elements.selectedTowerInfo.text;
            this.scene.statusUI.elements.selectedTowerInfo.setText(currentText + '\n\n' + equipmentText);
        }
    }

    // 获取装备名称
    getEquipmentName(equipmentId) {
        const gameScene = this.scene.scene.get('GameScene');
        if (gameScene.equipmentManager) {
            const basicItems = gameScene.equipmentManager.config.BASIC_ITEMS;
            if (basicItems[equipmentId]) {
                return basicItems[equipmentId].name;
            }
        }
        return equipmentId;
    }

    setInteractive(interactive) {
        this.equipmentSlots.forEach(slot => {
            if (slot.background) slot.background.setInteractive(interactive);
        });
    }
} 