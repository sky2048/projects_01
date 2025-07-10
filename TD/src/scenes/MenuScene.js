import { MAP_CONFIG } from '../config/GameConfig.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
        this.selectedMap = null;
        this.scrollContainer = null;
        this.mapButtons = [];
        this.scrollY = 0;
        this.maxScrollY = 0;
        this.scrollSpeed = 30;
    }

    create() {
        // 创建背景
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // 游戏标题
        const title = this.add.text(640, 100, '自走棋塔防', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        title.setOrigin(0.5);

        // 地图选择标题
        const mapSelectTitle = this.add.text(640, 180, '选择地图', {
            fontSize: '32px',
            fill: '#ffd700',
            fontFamily: 'Arial, sans-serif'
        });
        mapSelectTitle.setOrigin(0.5);

        // 创建滚动区域的遮罩
        this.createScrollArea();

        // 创建地图选择按钮
        this.createMapSelectionButtons();

        // 开始游戏按钮
        const startButton = this.add.rectangle(640, 580, 200, 60, 0x4a90e2);
        const startText = this.add.text(640, 580, '开始游戏', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        startText.setOrigin(0.5);

        // 按钮交互
        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            if (this.selectedMap) {
                // 将选中的地图传递给游戏场景
                this.scene.start('GameScene', { selectedMap: this.selectedMap });
            } else {
                // 如果没有选择地图，显示提示
                this.showNotification('请先选择一张地图');
            }
        });

        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x5ba3f5);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x4a90e2);
        });

        // 随机地图按钮
        const randomButton = this.add.rectangle(840, 580, 150, 40, 0x28a745);
        const randomText = this.add.text(840, 580, '随机地图', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        randomText.setOrigin(0.5);

        randomButton.setInteractive();
        randomButton.on('pointerdown', () => {
            this.scene.start('GameScene', { selectedMap: null }); // null表示随机选择
        });

        randomButton.on('pointerover', () => {
            randomButton.setFillStyle(0x34ce57);
        });

        randomButton.on('pointerout', () => {
            randomButton.setFillStyle(0x28a745);
        });

        // 滚动提示
        const scrollHint = this.add.text(640, 530, '使用鼠标滚轮或拖拽来浏览更多地图', {
            fontSize: '14px',
            fill: '#888888',
            fontFamily: 'Arial, sans-serif'
        });
        scrollHint.setOrigin(0.5);

        // 游戏说明
        const instructions = this.add.text(640, 650, 
            '游戏说明：购买和放置攻击塔消灭怪物 • 相同攻击塔可以合成升级 • 不同塔之间有羁绊效果 • 击败20波怪物即可胜利', {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            lineSpacing: 3
        });
        instructions.setOrigin(0.5);

        // 设置滚动输入
        this.setupScrollInput();
    }

    createScrollArea() {
        // 创建滚动区域的边框
        const scrollAreaBorder = this.add.rectangle(640, 350, 1000, 280, 0x000000, 0);
        scrollAreaBorder.setStrokeStyle(2, 0x444444);

        // 创建滚动容器
        this.scrollContainer = this.add.container(0, 0);

        // 创建遮罩以限制可见区域
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(140, 210, 1000, 280);
        
        const mask = maskShape.createGeometryMask();
        this.scrollContainer.setMask(mask);

        // 创建滚动条
        this.createScrollbar();
    }

    createScrollbar() {
        const scrollbarX = 1160;
        const scrollbarY = 350;
        const scrollbarHeight = 280;
        const scrollbarWidth = 20;

        // 滚动条背景
        this.scrollbarBg = this.add.rectangle(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 0x333333);
        this.scrollbarBg.setStrokeStyle(1, 0x666666);

        // 滚动条滑块
        this.scrollbarThumb = this.add.rectangle(scrollbarX, scrollbarY - scrollbarHeight/2 + 20, scrollbarWidth - 4, 40, 0x666666);
        this.scrollbarThumb.setStrokeStyle(1, 0x888888);

        // 滚动条交互
        this.scrollbarThumb.setInteractive();
        this.input.setDraggable(this.scrollbarThumb);

        let isDraggingScrollbar = false;
        let dragStartY = 0;
        let scrollStartY = 0;

        this.scrollbarThumb.on('dragstart', (pointer) => {
            isDraggingScrollbar = true;
            dragStartY = pointer.y;
            scrollStartY = this.scrollY;
        });

        this.scrollbarThumb.on('drag', (pointer) => {
            if (isDraggingScrollbar) {
                const deltaY = pointer.y - dragStartY;
                const scrollbarRange = scrollbarHeight - 40; // 减去滑块高度
                const scrollRatio = deltaY / scrollbarRange;
                const newScrollY = scrollStartY + (scrollRatio * this.maxScrollY);
                
                this.scrollY = Phaser.Math.Clamp(newScrollY, 0, this.maxScrollY);
                this.scrollContainer.y = -this.scrollY;
                this.updateScrollbarThumb();
            }
        });

        this.scrollbarThumb.on('dragend', () => {
            isDraggingScrollbar = false;
        });

        // 滚动条背景点击
        this.scrollbarBg.setInteractive();
        this.scrollbarBg.on('pointerdown', (pointer) => {
            if (!isDraggingScrollbar) {
                const localY = pointer.y - (scrollbarY - scrollbarHeight/2);
                const scrollRatio = localY / scrollbarHeight;
                const targetScrollY = scrollRatio * this.maxScrollY;
                
                this.scrollY = Phaser.Math.Clamp(targetScrollY, 0, this.maxScrollY);
                this.scrollContainer.y = -this.scrollY;
                this.updateScrollbarThumb();
            }
        });
    }

    updateScrollbarThumb() {
        if (this.maxScrollY > 0) {
            const scrollbarHeight = 280;
            const thumbHeight = 40;
            const scrollbarRange = scrollbarHeight - thumbHeight;
            const scrollRatio = this.scrollY / this.maxScrollY;
            const thumbY = 350 - scrollbarHeight/2 + thumbHeight/2 + (scrollRatio * scrollbarRange);
            
            this.scrollbarThumb.y = thumbY;
            
            // 根据滚动位置改变滑块颜色
            if (this.scrollY === 0) {
                this.scrollbarThumb.setFillStyle(0x666666);
            } else if (this.scrollY === this.maxScrollY) {
                this.scrollbarThumb.setFillStyle(0x888888);
            } else {
                this.scrollbarThumb.setFillStyle(0x777777);
            }
        }
    }

    createMapSelectionButtons() {
        const maps = Object.values(MAP_CONFIG.MAPS);
        const buttonWidth = 180;
        const buttonHeight = 120;
        const spacingX = 200;
        const spacingY = 140;
        const columns = 4; // 每行显示4个地图
        const startX = 640 - (columns - 1) * spacingX / 2;
        const startY = 280;

        // 清空之前的按钮
        this.mapButtons = [];

        maps.forEach((map, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            // 创建地图按钮组
            const mapButtonGroup = this.add.container(x, y);

            // 地图按钮背景
            const mapButton = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x2c2c54);
            mapButton.setStrokeStyle(2, 0x666666);

            // 地图名称
            const mapName = this.add.text(0, -35, map.name, {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold'
            });
            mapName.setOrigin(0.5);

            // 地图描述
            const mapDesc = this.add.text(0, 5, map.description, {
                fontSize: '10px',
                fill: '#cccccc',
                fontFamily: 'Arial, sans-serif',
                align: 'center',
                wordWrap: { width: buttonWidth - 30, useAdvancedWrap: true },
                maxLines: 3
            });
            mapDesc.setOrigin(0.5);

            // 难度指示器
            const difficultyText = this.getDifficultyText(map.id);
            const difficulty = this.add.text(0, 40, difficultyText, {
                fontSize: '14px',
                fill: this.getDifficultyColor(map.id),
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold'
            });
            difficulty.setOrigin(0.5);

            // 将所有元素添加到容器
            mapButtonGroup.add([mapButton, mapName, mapDesc, difficulty]);

            // 按钮交互
            mapButton.setInteractive();
            mapButton.on('pointerdown', () => {
                this.selectMap(map, mapButton);
            });

            mapButton.on('pointerover', () => {
                if (this.selectedMap !== map) {
                    mapButton.setStrokeStyle(3, 0xffd700);
                }
            });

            mapButton.on('pointerout', () => {
                if (this.selectedMap !== map) {
                    mapButton.setStrokeStyle(2, 0x666666);
                }
            });

            // 保存按钮引用
            mapButton.mapData = map;
            mapButton.mapName = mapName;
            mapButton.mapDesc = mapDesc;
            mapButton.difficulty = difficulty;

            // 将按钮组添加到滚动容器
            this.scrollContainer.add(mapButtonGroup);
            this.mapButtons.push({
                button: mapButton,
                group: mapButtonGroup,
                map: map
            });
        });

        // 计算最大滚动距离
        const totalRows = Math.ceil(maps.length / columns);
        const totalHeight = totalRows * spacingY;
        const visibleHeight = 280;
        this.maxScrollY = Math.max(0, totalHeight - visibleHeight);

        // 默认选中第一个地图
        if (maps.length > 0 && this.mapButtons.length > 0) {
            this.selectMap(maps[0], this.mapButtons[0].button);
        }

        // 更新滚动条可见性
        if (this.scrollbarBg && this.scrollbarThumb) {
            const needScrollbar = this.maxScrollY > 0;
            this.scrollbarBg.setVisible(needScrollbar);
            this.scrollbarThumb.setVisible(needScrollbar);
            
            if (needScrollbar) {
                this.updateScrollbarThumb();
            }
        }
    }

    setupScrollInput() {
        // 鼠标滚轮输入
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.scroll(deltaY * 0.5);
        });

        // 拖拽输入
        let isDragging = false;
        let lastPointerY = 0;

        this.input.on('pointerdown', (pointer) => {
            if (pointer.y >= 210 && pointer.y <= 490) { // 在滚动区域内
                isDragging = true;
                lastPointerY = pointer.y;
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (isDragging) {
                const deltaY = lastPointerY - pointer.y;
                this.scroll(deltaY);
                lastPointerY = pointer.y;
            }
        });

        this.input.on('pointerup', () => {
            isDragging = false;
        });
    }

    scroll(deltaY) {
        this.scrollY += deltaY;
        this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScrollY);
        
        // 更新滚动容器位置
        this.scrollContainer.y = -this.scrollY;
        
        // 更新滚动条滑块位置
        this.updateScrollbarThumb();
    }

    selectMap(map, button) {
        // 清除之前选中的地图
        if (this.selectedMapButton) {
            this.selectedMapButton.setStrokeStyle(2, 0x666666);
            this.selectedMapButton.setFillStyle(0x2c2c54);
        }

        // 选中新地图
        this.selectedMap = map;
        this.selectedMapButton = button;
        button.setStrokeStyle(3, 0x00ff00);
        button.setFillStyle(0x1a4a1a);
    }

    getDifficultyText(mapId) {
        return MAP_CONFIG.getDifficultyText(mapId);
    }

    getDifficultyColor(mapId) {
        return MAP_CONFIG.getDifficultyColor(mapId);
    }

    showNotification(message) {
        const notification = this.add.text(640, 540, message, {
            fontSize: '16px',
            fill: '#ff4444',
            fontFamily: 'Arial, sans-serif'
        });
        notification.setOrigin(0.5);

        // 2秒后移除提示
        this.time.delayedCall(2000, () => {
            notification.destroy();
        });
    }
} 