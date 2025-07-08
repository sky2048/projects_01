import { SYNERGIES } from '../config/GameConfig.js';

export class SynergyUI {
    constructor(scene) {
        this.scene = scene;
        this.synergyHexagons = [];
        this.synergyDisplayData = new Map();
        this.elements = {};
        
        // 羁绊图标和颜色配置
        this.synergyConfig = {
            'MARKSMAN': {
                icon: '🏹',
                color: 0x8B4513,
                displayName: '射手'
            },
            'MAGE': {
                icon: '🔮',
                color: 0x4169E1,
                displayName: '法师'
            },
            'ASSASSIN': {
                icon: '🗡️',
                color: 0x8B008B,
                displayName: '刺客'
            },
            'GUARDIAN': {
                icon: '🛡️',
                color: 0x808080,
                displayName: '守护者'
            },
            'MYSTIC': {
                icon: '✨',
                color: 0x9370DB,
                displayName: '秘术师'
            }
        };
    }

    create() {
        this.createSynergyDisplay();
    }

    createSynergyDisplay() {
        // 羁绊显示区域 - 移到左上方区域
        const synergyX = 50;
        const synergyY = 100;
        
        // 羁绊显示标题
        this.elements.synergyTitle = this.scene.add.text(synergyX, synergyY, '当前羁绊', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        // 初始化所有可能的羁绊显示位置
        const hexSize = 25;
        const startX = synergyX + 35;
        const startY = synergyY + 50;
        
        // 重新安排布局：纯竖排，每行只放一个
        let hexIndex = 0;
        Object.keys(this.synergyConfig).forEach(synergyKey => {
            const x = startX;
            const y = startY + hexIndex * 80;
            
            const hexagon = this.createSynergyHexagon(x, y, synergyKey);
            this.synergyHexagons.push(hexagon);
            hexIndex++;
        });
    }

    createSynergyHexagon(x, y, synergyKey) {
        const config = this.synergyConfig[synergyKey];
        const synergy = SYNERGIES[synergyKey];
        
        // 创建羁绊衬底背景
        const underlayWidth = 210;
        const underlayHeight = 75;
        const underlay = this.scene.add.rectangle(x + 22, y - 5, underlayWidth, underlayHeight, 0x1a1a1a, 0.8);
        underlay.setStrokeStyle(1, 0x444444, 0.9);
        
        // 创建六边形路径
        const hexSize = 28;
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60) * Math.PI / 180;
            hexPoints.push(Math.cos(angle) * hexSize);
            hexPoints.push(Math.sin(angle) * hexSize);
        }
        
        // 创建六边形背景
        const hexBackground = this.scene.add.polygon(x - 10, y + 20, hexPoints, 0x2a2a2a, 0.8);
        hexBackground.setStrokeStyle(2, 0x4a4a4a, 1);
        
        // 创建图标
        const icon = this.scene.add.text(x - 38, y - 5, config.icon, {
            fontSize: '20px'
        });
        icon.setOrigin(0.5, 0.5);
        
        // 创建数量文本衬底
        const countBg = this.scene.add.rectangle(x + 22, y, 40, 40, 0x000000, 0.8);
        countBg.setStrokeStyle(1, 0x444444, 0.8);
        
        // 创建数量文本
        const countText = this.scene.add.text(x + 22, y, '', {
            fontSize: '36px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        countText.setOrigin(0.5, 0.5);
        
        // 创建羁绊名称
        const nameText = this.scene.add.text(x + 62, y - 10, config.displayName, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        nameText.setOrigin(0, 0.5);
        
        // 创建等级指示器
        const levelIndicators = [];
        if (synergy && synergy.levels) {
            const textSpacing = 16;
            const startTextX = x + 77 - (synergy.levels.length - 1) * textSpacing / 2;
            for (let i = 0; i < synergy.levels.length; i++) {
                const textX = startTextX + i * textSpacing;
                const textY = y + 8;
                const requirementText = this.scene.add.text(textX, textY, synergy.levels[i].count.toString(), {
                    fontSize: '18px',
                    fill: '#666666',
                    fontFamily: 'Arial, sans-serif',
                    fontStyle: 'bold'
                });
                requirementText.setOrigin(0.5, 0.5);
                levelIndicators.push(requirementText);
            }
        }
        
        const hexagon = {
            underlay: underlay,
            background: hexBackground,
            icon: icon,
            nameText: nameText,
            countBg: countBg,
            countText: countText,
            levelIndicators: levelIndicators,
            synergyKey: synergyKey,
            config: config,
            visible: false
        };
        
        // 设置交互
        hexBackground.setInteractive();
        
        // 鼠标悬停效果
        hexBackground.on('pointerover', (pointer) => {
            hexBackground.setFillStyle(config.color, 0.6);
            this.scene.showSynergyTooltip(pointer.worldX, pointer.worldY, synergyKey);
        });
        
        hexBackground.on('pointerout', () => {
            const synergyData = this.synergyDisplayData.get(synergyKey);
            if (synergyData) {
                hexBackground.setFillStyle(config.color, 0.9);
            } else {
                hexBackground.setFillStyle(0x2a2a2a, 0.8);
            }
            this.scene.hideSynergyTooltip();
        });
        
        hexBackground.on('pointermove', (pointer) => {
            if (this.scene.synergyTooltip && this.scene.synergyTooltip.visible) {
                this.scene.showSynergyTooltip(pointer.worldX, pointer.worldY, synergyKey);
            }
        });
        
        // 初始隐藏
        this.setSynergyHexagonVisibility(hexagon, false);
        
        return hexagon;
    }

    setSynergyHexagonVisibility(hexagon, visible) {
        hexagon.underlay.setVisible(visible);
        hexagon.background.setVisible(visible);
        hexagon.icon.setVisible(visible);
        hexagon.nameText.setVisible(visible);
        hexagon.countBg.setVisible(visible);
        hexagon.countText.setVisible(visible);
        hexagon.levelIndicators.forEach(indicator => indicator.setVisible(visible));
        hexagon.visible = visible;
    }

    updateHexagonPosition(hexagon, newX, newY) {
        // 更新衬底位置
        hexagon.underlay.setPosition(newX + 22, newY - 5);
        
        // 更新六边形背景位置
        hexagon.background.setPosition(newX - 10, newY + 20);
        
        // 更新图标位置
        hexagon.icon.setPosition(newX - 38, newY - 5);
        
        // 更新羁绊名称位置
        hexagon.nameText.setPosition(newX + 62, newY - 10);
        
        // 更新数量背景和文本位置
        hexagon.countBg.setPosition(newX + 22, newY);
        hexagon.countText.setPosition(newX + 22, newY);
        
        // 更新等级指示器位置
        const synergy = SYNERGIES[hexagon.synergyKey];
        if (synergy && synergy.levels) {
            const textSpacing = 16;
            const startTextX = newX + 77 - (synergy.levels.length - 1) * textSpacing / 2;
            hexagon.levelIndicators.forEach((indicator, index) => {
                const textX = startTextX + index * textSpacing;
                const textY = newY + 8;
                indicator.setPosition(textX, textY);
            });
        }
    }

    updateSynergies(towers) {
        // 统计羁绊
        const synergyCount = {};
        
        towers.forEach(tower => {
            const synergy = tower.synergy;
            synergyCount[synergy] = (synergyCount[synergy] || 0) + 1;
            
            // 处理装备附加的羁绊
            if (tower.additionalSynergies && tower.additionalSynergies.length > 0) {
                tower.additionalSynergies.forEach(additionalSynergy => {
                    synergyCount[additionalSynergy] = (synergyCount[additionalSynergy] || 0) + 1;
                });
            }
        });

        // 清空当前显示数据
        this.synergyDisplayData.clear();

        // 准备羁绊数据并计算激活状态
        const synergyDataList = [];
        Object.keys(this.synergyConfig).forEach(synergyKey => {
            const count = synergyCount[synergyKey] || 0;
            const synergy = SYNERGIES[synergyKey];
            
            if (count >= 1 && synergy) {
                // 找到激活的羁绊等级
                let activeLevel = null;
                let activeLevelIndex = -1;
                for (let i = synergy.levels.length - 1; i >= 0; i--) {
                    if (count >= synergy.levels[i].count) {
                        activeLevel = synergy.levels[i];
                        activeLevelIndex = i;
                        break;
                    }
                }
                
                const isActivated = activeLevel && count >= 2;
                
                synergyDataList.push({
                    synergyKey: synergyKey,
                    count: count,
                    activeLevel: activeLevel,
                    activeLevelIndex: activeLevelIndex,
                    isActivated: isActivated,
                    displayName: this.synergyConfig[synergyKey].displayName
                });
                
                // 保存羁绊数据供tooltip使用
                this.synergyDisplayData.set(synergyKey, {
                    count: count,
                    activeLevel: activeLevel,
                    activeLevelIndex: activeLevelIndex
                });
            }
        });

        // 按照规则排序：未激活的在前，激活的在后，然后按字母顺序
        synergyDataList.sort((a, b) => {
            if (a.isActivated !== b.isActivated) {
                return a.isActivated ? 1 : -1;
            }
            return a.synergyKey.localeCompare(b.synergyKey);
        });

        // 先隐藏所有六边形
        this.synergyHexagons.forEach(hexagon => {
            this.setSynergyHexagonVisibility(hexagon, false);
        });

        // 重新排列羁绊显示位置
        const synergyX = 50;
        const synergyY = 120;
        const startX = synergyX + 35;
        const startY = synergyY + 50;

        synergyDataList.forEach((synergyData, index) => {
            // 计算新位置：纯竖排，每行只放一个
            const newX = startX;
            const newY = startY + index * 80;

            // 找到对应的六边形
            const hexagon = this.synergyHexagons.find(h => h.synergyKey === synergyData.synergyKey);
            if (hexagon) {
                // 更新六边形位置
                this.updateHexagonPosition(hexagon, newX, newY);
                
                // 显示六边形
                this.setSynergyHexagonVisibility(hexagon, true);
                
                // 更新数量显示
                hexagon.countText.setText(synergyData.count.toString());
                
                // 更新六边形颜色和边框
                if (synergyData.isActivated) {
                    // 羁绊激活 - 使用羁绊颜色
                    hexagon.background.setFillStyle(hexagon.config.color, 0.9);
                    hexagon.background.setStrokeStyle(3, 0xffd700, 1);
                } else {
                    // 羁绊未激活 - 灰色显示
                    hexagon.background.setFillStyle(0x4a4a4a, 0.8);
                    hexagon.background.setStrokeStyle(2, 0x666666, 1);
                }
                
                // 更新等级指示器
                hexagon.levelIndicators.forEach((indicator, indicatorIndex) => {
                    if (indicatorIndex <= synergyData.activeLevelIndex) {
                        indicator.setFill('#ffd700');
                        indicator.setStroke('#000000', 1);
                    } else {
                        indicator.setFill('#666666');
                        indicator.setStroke('', 0);
                    }
                });
            }
        });
    }

    getSynergyName(synergyKey) {
        const synergyNames = {
            'MARKSMAN': '射手',
            'MAGE': '法师',
            'ASSASSIN': '刺客',
            'GUARDIAN': '守护者',
            'MYSTIC': '神秘'
        };
        return synergyNames[synergyKey] || synergyKey;
    }

    getSynergyDisplayData() {
        return this.synergyDisplayData;
    }

    getSynergyConfig() {
        return this.synergyConfig;
    }
} 