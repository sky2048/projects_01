import { TOWER_RARITY, SYNERGIES, EQUIPMENT_CONFIG } from '../config/GameConfig.js';

export class TooltipUI {
    constructor(scene) {
        this.scene = scene;
        this.tooltip = { background: null, content: null, visible: false };
        this.equipmentTooltip = null;
        this.synergyTooltip = null;
    }

    create() {
        // Tooltip系统已准备就绪，不需要创建UI元素
    }

    // 显示塔的tooltip
    showTooltip(x, y, tower) {
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
        this.tooltip.background = this.scene.add.rectangle(
            tooltipX + tooltipWidth / 2, 
            tooltipY + tooltipHeight / 2, 
            tooltipWidth, 
            tooltipHeight, 
            0x2a2a2a, 
            0.95
        );
        this.tooltip.background.setStrokeStyle(2, rarityInfo.color);

        // 创建tooltip文本
        this.tooltip.content = this.scene.add.text(tooltipX + 10, tooltipY + 10, content, {
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

    // 显示装备tooltip
    showEquipmentTooltip(x, y, equipment) {
        this.hideEquipmentTooltip();

        // 创建装备tooltip内容
        const content = this.createEquipmentTooltipContent(equipment);

        // 计算tooltip尺寸
        const lines = content.split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const tooltipWidth = Math.max(220, maxLineLength * 8 + 20);
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

        // 确定装备品质颜色
        const borderColor = equipment.tier === 'crafted' ? 0xffd700 : 0x888888;

        // 创建tooltip背景
        this.equipmentTooltip = {
            background: this.scene.add.rectangle(
                tooltipX + tooltipWidth / 2, 
                tooltipY + tooltipHeight / 2, 
                tooltipWidth, 
                tooltipHeight, 
                0x2a2a2a, 
                0.95
            ),
            content: this.scene.add.text(tooltipX + 10, tooltipY + 10, content, {
                fontSize: '14px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                lineSpacing: 4
            }),
            visible: true
        };

        this.equipmentTooltip.background.setStrokeStyle(2, borderColor);

        // 设置深度确保在最前面
        this.equipmentTooltip.background.setDepth(1000);
        this.equipmentTooltip.content.setDepth(1001);
    }

    hideEquipmentTooltip() {
        if (this.equipmentTooltip) {
            if (this.equipmentTooltip.background) {
                this.equipmentTooltip.background.destroy();
            }
            if (this.equipmentTooltip.content) {
                this.equipmentTooltip.content.destroy();
            }
            this.equipmentTooltip = null;
        }
    }

    // 显示羁绊tooltip
    showSynergyTooltip(x, y, synergyKey) {
        this.hideSynergyTooltip();

        const synergy = SYNERGIES[synergyKey];
        const config = this.scene.synergyUI ? this.scene.synergyUI.getSynergyConfig()[synergyKey] : null;
        const synergyData = this.scene.synergyUI ? this.scene.synergyUI.getSynergyDisplayData().get(synergyKey) : null;
        
        if (!synergy || !config) return;

        // 创建tooltip内容
        const lines = [];
        lines.push(`${config.displayName}`);
        
        if (synergyData) {
            lines.push(`当前: ${synergyData.count}个单位`);
            lines.push('');
            
            // 显示当前激活的效果
            if (synergyData.activeLevel) {
                lines.push(`激活效果 (${synergyData.activeLevel.count}): ${synergyData.activeLevel.effect}`);
                lines.push('');
            }
        }
        
        // 显示所有等级的效果
        lines.push('羁绊等级:');
        synergy.levels.forEach((level, index) => {
            const isActive = synergyData && synergyData.activeLevel && 
                           synergyData.activeLevel.count === level.count;
            const prefix = isActive ? '● ' : '○ ';
            lines.push(`${prefix}${level.count}个: ${level.effect}`);
        });

        const content = lines.join('\n');

        // 计算tooltip尺寸
        const contentLines = content.split('\n');
        const maxLineLength = Math.max(...contentLines.map(line => line.length));
        const tooltipWidth = Math.max(250, maxLineLength * 7 + 20);
        const tooltipHeight = contentLines.length * 16 + 20;

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
        this.synergyTooltip = {
            background: this.scene.add.rectangle(
                tooltipX + tooltipWidth / 2, 
                tooltipY + tooltipHeight / 2, 
                tooltipWidth, 
                tooltipHeight, 
                0x2a2a2a, 
                0.95
            ),
            content: this.scene.add.text(tooltipX + 10, tooltipY + 10, content, {
                fontSize: '13px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                lineSpacing: 2
            }),
            visible: true
        };

        this.synergyTooltip.background.setStrokeStyle(2, config.color);

        // 设置深度确保在最前面
        this.synergyTooltip.background.setDepth(1000);
        this.synergyTooltip.content.setDepth(1001);
    }

    hideSynergyTooltip() {
        if (this.synergyTooltip) {
            if (this.synergyTooltip.background) {
                this.synergyTooltip.background.destroy();
            }
            if (this.synergyTooltip.content) {
                this.synergyTooltip.content.destroy();
            }
            this.synergyTooltip = null;
        }
    }

    // 创建装备tooltip内容
    createEquipmentTooltipContent(equipment) {
        const lines = [];
        
        // 装备名称
        lines.push(`${equipment.name}`);
        lines.push(`类型: ${equipment.tier === 'crafted' ? '合成装备' : '基础装备'}`);
        lines.push('');
        
        // 装备描述
        lines.push(equipment.description);
        
        // 只有合成装备才显示合成信息
        if (equipment.tier === 'crafted' && equipment.components && equipment.components.length > 0) {
            lines.push('');
            lines.push('合成自:');
            equipment.components.forEach(component => {
                const componentName = this.getEquipmentName(component);
                lines.push(`• ${componentName}`);
            });
        }
        
        return lines.join('\n');
    }

    // 获取装备名称
    getEquipmentName(equipmentId) {
        const gameScene = this.scene.scene.get('GameScene');
        if (gameScene.equipmentManager) {
            const basicItems = EQUIPMENT_CONFIG.BASIC_ITEMS;
            if (basicItems[equipmentId]) {
                return basicItems[equipmentId].name;
            }
        }
        return equipmentId;
    }

    // 获取塔类型名称
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

    // 清理所有tooltip
    clearAllTooltips() {
        this.hideTooltip();
        this.hideEquipmentTooltip();
        this.hideSynergyTooltip();
    }
} 