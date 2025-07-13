export class RoguelikeUI {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.isVisible = false;
        this.callback = null;
        this.options = [];
    }

    show(options, callback) {
        if (this.isVisible) return;
        
        this.options = options;
        this.callback = callback;
        this.isVisible = true;
        
        // 暂停游戏逻辑
        if (this.scene.scene && this.scene.scene.get('GameScene')) {
            const gameScene = this.scene.scene.get('GameScene');
            if (gameScene.gameState) {
                gameScene.gameState.isPaused = true;
            }
        }
        
        this.createUI();
    }

    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        
        // 恢复游戏逻辑
        if (this.scene.scene && this.scene.scene.get('GameScene')) {
            const gameScene = this.scene.scene.get('GameScene');
            if (gameScene.gameState) {
                gameScene.gameState.isPaused = false;
            }
        }
        
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        
        this.callback = null;
        this.options = [];
    }

    createUI() {
        // 创建主容器
        this.container = this.scene.add.container(640, 360);
        this.container.setDepth(10000); // 大幅提高层级，确保在最上层
        
        // 创建背景遮罩 - 使用更强的遮罩效果
        const overlay = this.scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.9);
        overlay.setInteractive(); // 阻止点击穿透
        this.container.add(overlay);
        
        // 创建主面板
        const mainPanel = this.scene.add.rectangle(0, 0, 800, 500, 0x2a2a4a);
        mainPanel.setStrokeStyle(3, 0x4a4a6a);
        this.container.add(mainPanel);
        
        // 标题
        const title = this.scene.add.text(0, -200, '成长选择', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        title.setOrigin(0.5);
        this.container.add(title);
        
        // 副标题
        const subtitle = this.scene.add.text(0, -160, '选择一项强化来提升你的实力', {
            fontSize: '18px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif'
        });
        subtitle.setOrigin(0.5);
        this.container.add(subtitle);
        
        // 创建选项卡片
        this.createOptionCards();
        
        // 添加选择提示
        const hint = this.scene.add.text(0, 180, '点击卡片进行选择', {
            fontSize: '16px',
            fill: '#888888',
            fontFamily: 'Arial, sans-serif'
        });
        hint.setOrigin(0.5);
        this.container.add(hint);
    }

    createOptionCards() {
        const cardWidth = 220;
        const cardHeight = 280;
        const spacing = 50;
        const startX = -(cardWidth + spacing);
        
        this.options.forEach((option, index) => {
            const cardX = startX + index * (cardWidth + spacing);
            const cardY = -20;
            
            // 创建卡片容器
            const cardContainer = this.scene.add.container(cardX, cardY);
            this.container.add(cardContainer);
            
            // 卡片背景
            const cardBg = this.scene.add.rectangle(0, 0, cardWidth, cardHeight, 0x3a3a5a);
            cardBg.setStrokeStyle(2, 0x5a5a7a);
            cardContainer.add(cardBg);
            
            // 图标背景
            const iconBg = this.scene.add.circle(0, -80, 35, this.getOptionColor(option));
            cardContainer.add(iconBg);
            
            // 图标
            const icon = this.scene.add.text(0, -80, option.icon, {
                fontSize: '32px'
            });
            icon.setOrigin(0.5);
            cardContainer.add(icon);
            
            // 标题
            const nameText = this.scene.add.text(0, -30, option.name, {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                align: 'center'
            });
            nameText.setOrigin(0.5);
            cardContainer.add(nameText);
            
            // 描述
            const descText = this.scene.add.text(0, 10, option.description, {
                fontSize: '14px',
                fill: '#cccccc',
                fontFamily: 'Arial, sans-serif',
                align: 'center',
                wordWrap: { width: cardWidth - 20 }
            });
            descText.setOrigin(0.5);
            cardContainer.add(descText);
            
            // 类型标签
            const typeColor = this.getTypeColor(option);
            const typeTag = this.scene.add.rectangle(0, 100, 120, 25, typeColor);
            cardContainer.add(typeTag);
            
            const typeText = this.scene.add.text(0, 100, this.getTypeText(option), {
                fontSize: '12px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif'
            });
            typeText.setOrigin(0.5);
            cardContainer.add(typeText);
            
            // 使卡片可交互
            cardBg.setInteractive();
            
            // 悬停效果
            cardBg.on('pointerover', () => {
                cardBg.setFillStyle(0x4a4a6a);
                cardBg.setStrokeStyle(3, 0x6a6a8a);
                cardContainer.setScale(1.05);
            });
            
            cardBg.on('pointerout', () => {
                cardBg.setFillStyle(0x3a3a5a);
                cardBg.setStrokeStyle(2, 0x5a5a7a);
                cardContainer.setScale(1.0);
            });
            
            // 点击选择
            cardBg.on('pointerdown', () => {
                this.selectOption(option);
            });
        });
    }

    getOptionColor(option) {
        // 根据选项ID返回不同的颜色
        if (option.id.includes('attack') || option.id.includes('damage')) return 0xff4444;
        if (option.id.includes('speed')) return 0x44ff44;
        if (option.id.includes('range')) return 0x4444ff;
        if (option.id.includes('gold')) return 0xffaa00;
        if (option.id.includes('exp')) return 0xaa44ff;
        if (option.id.includes('health')) return 0xff4488;
        if (option.id.includes('crit')) return 0xffff44;
        return 0x888888;
    }

    getTypeColor(option) {
        if (option.type === 'permanent') {
            if (option.id.includes('attack') || option.id.includes('speed') || option.id.includes('range')) {
                return 0x2d8659; // 战斗类 - 绿色
            } else if (option.id.includes('gold') || option.id.includes('exp') || option.id.includes('interest')) {
                return 0x8b6914; // 经济类 - 金色
            } else {
                return 0x7c3aed; // 特殊能力 - 紫色
            }
        } else {
            return 0xdc2626; // 即时效果 - 红色
        }
    }

    getTypeText(option) {
        if (option.type === 'permanent') {
            if (option.id.includes('attack') || option.id.includes('speed') || option.id.includes('range')) {
                return '战斗强化';
            } else if (option.id.includes('gold') || option.id.includes('exp') || option.id.includes('interest')) {
                return '经济强化';
            } else {
                return '特殊能力';
            }
        } else {
            return '即时效果';
        }
    }

    selectOption(option) {
        // 添加选择特效
        this.createSelectionEffect();
        
        // 延迟执行回调，让特效播放
        this.scene.time.delayedCall(500, () => {
            if (this.callback) {
                this.callback(option);
            }
            this.hide();
        });
    }

    createSelectionEffect() {
        // 创建选择特效
        const flash = this.scene.add.rectangle(0, 0, 1280, 720, 0xffffff, 0.3);
        flash.setDepth(10001); // 确保在容器之上
        this.container.add(flash);
        
        // 闪烁效果
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // 缩放效果
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }
} 