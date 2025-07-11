import { MAP_CONFIG, ECONOMY_CONFIG, WAVE_CONFIG, TOWER_RARITY, EXPERIENCE_CONFIG } from '../config/GameConfig.js';
import { EQUIPMENT_CONFIG } from '../config/EquipmentConfig.js';
import { globalObjectPool } from '../utils/ObjectPool.js';
import { PathFinder } from '../utils/PathFinder.js';
import { Monster } from '../entities/Monster.js';
import { Tower } from '../entities/Tower.js';
import { WaveManager } from '../managers/WaveManager.js';
import { TowerShop } from '../managers/TowerShop.js';
import { EquipmentManager } from '../managers/EquipmentManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create(data) {
        this.cameras.main.setBackgroundColor('#2d4a3e');
        
        // 接收来自菜单场景的地图选择数据
        this.selectedMapData = data ? data.selectedMap : null;
        
        // 按顺序初始化各个组件
        this.initializeGame();
    }

    async initializeGame() {
        try {
            // 第一步：初始化基础组件
            this.initGameState();
            this.createGameBoard();
            this.createPath();
            this.createGroups();
            this.setupInput();
            
            // 第二步：启动并等待UI场景初始化完成
            await this.initializeUIScene();
            
            // 第三步：初始化管理器（依赖UI场景）
            this.initManagers();
            
            console.log('游戏初始化完成');
        } catch (error) {
            console.error('游戏初始化失败:', error);
            // 降级处理 - 强制初始化
            try {
                this.initManagers();
            } catch (managerError) {
                console.error('管理器初始化也失败:', managerError);
                // 最后的降级处理 - 基本初始化
                this.waveManager = null;
                this.towerShop = null;
                this.equipmentManager = null;
            }
        }
    }

    initializeUIScene() {
        return new Promise((resolve, reject) => {
            // 检查UI场景是否已经存在
            const existingUIScene = this.scene.get('UIScene');
            if (existingUIScene && existingUIScene.scene.isActive()) {
                console.log('UI场景已存在，直接使用');
                resolve();
                return;
            }
            
            // 启动UI场景
            this.scene.launch('UIScene');
            
            // 等待UI场景的ready事件
            const uiScene = this.scene.get('UIScene');
            if (!uiScene) {
                console.error('无法获取UI场景');
                reject(new Error('无法获取UI场景'));
                return;
            }
            
            uiScene.events.once('ready', () => {
                console.log('UI场景初始化完成');
                resolve();
            });
            
            // 设置超时保护
            const timeout = setTimeout(() => {
                console.warn('UI场景初始化超时');
                reject(new Error('UI场景初始化超时'));
            }, 3000);
            
            // 成功时清除超时
            uiScene.events.once('ready', () => {
                clearTimeout(timeout);
            });
        });
    }

    initGameState() {
        console.log('初始化游戏状态...');
        console.log('ECONOMY_CONFIG:', ECONOMY_CONFIG);
        console.log('STARTING_GOLD:', ECONOMY_CONFIG.STARTING_GOLD);
        
        this.gameState = {
            gold: ECONOMY_CONFIG.STARTING_GOLD,
            health: 100,
            currentWave: 0,
            isPaused: false,
            isGameOver: false,
            level: 1,  // 玩家等级
            experience: 0,  // 当前经验值
            maxTowers: 2  // 最大可放置塔数量，初始2个
        };
        
        console.log('游戏状态初始化完成:', this.gameState);
    }

    createGameBoard() {
        this.board = [];
        this.tileSize = MAP_CONFIG.TILE_SIZE;
        this.boardWidth = MAP_CONFIG.BOARD_WIDTH;
        this.boardHeight = MAP_CONFIG.BOARD_HEIGHT;
        
        // 计算棋盘偏移，使其居中
        this.boardOffsetX = (1280 - this.boardWidth * this.tileSize) / 2;
        this.boardOffsetY = 50;
        
        // 创建网格
        for (let y = 0; y < this.boardHeight; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.boardWidth; x++) {
                const tileX = this.boardOffsetX + x * this.tileSize;
                const tileY = this.boardOffsetY + y * this.tileSize;
                
                // 创建网格背景
                const tile = this.add.rectangle(
                    tileX + this.tileSize / 2, 
                    tileY + this.tileSize / 2, 
                    this.tileSize - 2, 
                    this.tileSize - 2, 
                    0x4a5d4a
                );
                tile.setStrokeStyle(1, 0x2d4a3e);
                
                this.board[y][x] = {
                    x: x,
                    y: y,
                    worldX: tileX + this.tileSize / 2,
                    worldY: tileY + this.tileSize / 2,
                    tile: tile,
                    tower: null,
                    isPath: false,
                    isBlocked: false
                };
            }
        }
    }

    createPath() {
        // 使用选定的地图或随机选择
        if (this.selectedMapData) {
            this.currentMap = this.selectedMapData;
            console.log(`使用选定地图: ${this.currentMap.name} - ${this.currentMap.description}`);
        } else {
            this.currentMap = MAP_CONFIG.getRandomMap();
            console.log(`随机选择地图: ${this.currentMap.name} - ${this.currentMap.description}`);
        }
        
        // 从地图配置中获取路径点
        const mapPathPoints = this.currentMap.pathPoints;
        
        // 设置起点和终点
        this.pathStart = mapPathPoints[0];
        this.pathEnd = mapPathPoints[mapPathPoints.length - 1];
        
        // 创建路径点
        this.pathPoints = [];
        mapPathPoints.forEach((point, index) => {
            const pathTile = this.board[point.y][point.x];
            pathTile.isPath = true;
            
            // 为起始点和终点设置不同颜色
            if (index === 0) {
                // 起始点 - 绿色
                pathTile.tile.setFillStyle(0x00ff00);
            } else if (index === mapPathPoints.length - 1) {
                // 终点 - 红色
                pathTile.tile.setFillStyle(0xff0000);
            } else {
                // 普通路径 - 原来的颜色
                pathTile.tile.setFillStyle(0x8b7355);
            }
            
            this.pathPoints.push({
                x: pathTile.worldX,
                y: pathTile.worldY
            });
        });
        
        // 初始化路径查找器
        this.pathFinder = new PathFinder(this.board, this.pathStart, this.pathEnd);
        
        // 延迟更新UI显示地图名称，避免渲染问题
        this.time.delayedCall(100, () => {
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.updateMapName) {
                try {
                    uiScene.updateMapName(this.currentMap.name);
                } catch (error) {
                    console.warn('更新地图名称失败:', error);
                }
            }
        });
    }

    initManagers() {
        // 装备管理器
        this.equipmentManager = new EquipmentManager(this);
        
        // 波次管理器
        this.waveManager = new WaveManager(this);
        
        // 塔商店管理器
        this.towerShop = new TowerShop(this);
        
        // 初始化UI显示
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.updateLevel) {
            uiScene.updateLevel(this.gameState.level, this.gameState.maxTowers);
        }
        if (uiScene && uiScene.updateExperience) {
            // 延迟更新经验显示，避免渲染问题
            this.time.delayedCall(100, () => {
                if (uiScene && uiScene.updateExperience) {
                    uiScene.updateExperience(this.gameState.experience, this.getExpRequiredForNextLevel());
                }
            });
        }
        if (uiScene && uiScene.updateGold) {
            console.log('初始化UI金币显示:', this.gameState.gold);
            uiScene.updateGold(this.gameState.gold);
        }
        if (uiScene && uiScene.updateHealth) {
            uiScene.updateHealth(this.gameState.health);
        }
    }

    createGroups() {
        // 简单地重置组引用，避免clear方法的问题
        this.monsters = null;
        this.towers = null;
        this.projectiles = null;
        
        // 创建游戏对象组
        this.monsters = this.add.group();
        this.towers = this.add.group();
        this.projectiles = this.add.group();
        
        // 设置碰撞检测（支持穿透投射物多次碰撞）
        this.physics.add.overlap(this.projectiles, this.monsters, this.onProjectileHitMonster, this.shouldProcessCollision, this);
        
        console.log('游戏对象组创建完成');
    }

    setupInput() {
        // 点击棋盘放置塔
        this.input.on('pointerdown', (pointer) => {
            this.onBoardClick(pointer);
        });
    }

    onBoardClick(pointer) {
        if (this.gameState.isPaused || this.gameState.isGameOver) return;
        
        const boardX = Math.floor((pointer.x - this.boardOffsetX) / this.tileSize);
        const boardY = Math.floor((pointer.y - this.boardOffsetY) / this.tileSize);
        
        console.log(`点击棋盘位置: (${boardX}, ${boardY})`);
        
        if (boardX >= 0 && boardX < this.boardWidth && 
            boardY >= 0 && boardY < this.boardHeight) {
            
            const tile = this.board[boardY][boardX];
            
            console.log(`tile信息: isPath=${tile.isPath}, hasTower=${!!tile.tower}`);
            console.log(`towerShop状态: exists=${!!this.towerShop}, selectedTower=${!!this.towerShop?.selectedTower}`);
            console.log(`移动状态: isMovingTower=${!!this.isMovingTower}, towerToMove=${!!this.towerToMove}`);
            
            // 检查是否在移动塔的模式
            if (this.isMovingTower && this.towerToMove) {
                this.completeTowerMove(boardX, boardY);
                return;
            }
            
            if (tile.tower) {
                // 点击已有的塔 - 选择它
                console.log('选择已有的塔');
                this.selectTower(tile.tower);
            } else if (!tile.isPath && this.towerShop && this.towerShop.selectedTower) {
                // 点击空地且有选中的塔 - 放置塔
                console.log('尝试放置塔');
                this.placeTower(boardX, boardY);
            } else {
                // 点击空地但没有选中塔 - 取消选择
                console.log('清除选择');
                this.deselectTower();
            }
        }
    }

    selectTower(tower) {
        // 清除之前选中的塔
        if (this.selectedTower) {
            this.selectedTower.hideRange();
            this.selectedTower.setSelected(false);
        }
        
        // 选中新塔
        this.selectedTower = tower;
        tower.showRange();
        tower.setSelected(true);
        
        // 显示塔信息
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.showSelectedTowerInfo) {
            uiScene.showSelectedTowerInfo(tower);
        }
        
        console.log(`选中了塔: ${tower.towerData.name}`);
    }

    deselectTower() {
        // 如果正在移动塔，先取消移动
        if (this.isMovingTower) {
            this.cancelTowerMove();
        }
        
        if (this.selectedTower) {
            this.selectedTower.hideRange();
            this.selectedTower.setSelected(false);
            this.selectedTower = null;
            
            // 清除UI显示
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.clearSelectedTowerInfo) {
                uiScene.clearSelectedTowerInfo();
            }
        }
    }

    placeTower(x, y) {
        console.log(`placeTower调用: x=${x}, y=${y}`);
        console.log(`towerShop检查: exists=${!!this.towerShop}, selectedTower=${!!this.towerShop?.selectedTower}`);
        
        if (!this.towerShop || !this.towerShop.selectedTower) {
            console.log('没有选中塔，返回');
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.showNotification) {
                uiScene.showNotification('请先从商店选择一个塔', 'warning', 2000);
            }
            return;
        }
        
        // 检查塔数量限制
        const currentTowerCount = this.towers.children.entries.length;
        console.log(`塔数量检查: 当前=${currentTowerCount}, 最大=${this.gameState.maxTowers}`);
        if (currentTowerCount >= this.gameState.maxTowers) {
            console.log('塔位已满，返回');
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.showNotification) {
                uiScene.showNotification(`塔位已满！当前 ${currentTowerCount}/${this.gameState.maxTowers}，请先升级`, 'warning', 2500);
            }
            console.log(`已达到塔数量上限 (${this.gameState.maxTowers}个)`);
            return;
        }
        
        const towerData = this.towerShop.selectedTower;
        console.log(`金币检查: 当前=${this.gameState.gold}, 需要=${ECONOMY_CONFIG.TOWER_SHOP_COST}`);
        if (this.gameState.gold < ECONOMY_CONFIG.TOWER_SHOP_COST) {
            console.log('金币不足，返回');
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.showNotification) {
                uiScene.showNotification(`金币不足！放置塔需要 ${ECONOMY_CONFIG.TOWER_SHOP_COST} 金币`, 'error', 2000);
            }
            return;
        }
        
        if (this.gameState.gold >= ECONOMY_CONFIG.TOWER_SHOP_COST) {
            console.log('金币充足，开始放置塔');
            const tile = this.board[y][x];
            console.log(`目标tile: x=${x}, y=${y}, tile存在=${!!tile}`);
            
            // 临时放置塔来测试路径
            const tempTower = { isTemp: true };
            tile.tower = tempTower;
            
            // 检查放置塔后是否还有有效路径
            console.log('检查路径有效性...');
            if (!this.pathFinder.hasValidPath()) {
                console.log('路径被阻断，取消放置');
                // 移除临时塔
                tile.tower = null;
                const uiScene = this.scene.get('UIScene');
                if (uiScene && uiScene.showNotification) {
                    uiScene.showNotification('无法在此位置放置塔：会阻断怪物路径', 'error', 2500);
                }
                console.log('无法在此位置放置塔：会阻断路径');
                return;
            }
            
            // 移除临时塔，放置真正的塔
            tile.tower = null;
            console.log('路径有效，创建真正的塔');
            console.log(`塔数据:`, towerData);
            console.log(`世界坐标: x=${tile.worldX}, y=${tile.worldY}`);
            
            const tower = new Tower(this, tile.worldX, tile.worldY, towerData);
            console.log('塔创建成功:', tower);
            
            this.towers.add(tower);
            tile.tower = tower;
            console.log('塔已添加到游戏中');
            
            this.gameState.gold -= ECONOMY_CONFIG.TOWER_SHOP_COST;
            
            // 更新所有活跃怪物的路径
            this.updateMonsterPaths();
            
            // 获取UI场景
            const uiScene = this.scene.get('UIScene');
            
            // 通知UI更新
            if (uiScene && uiScene.updateGold) {
                uiScene.updateGold(this.gameState.gold, -ECONOMY_CONFIG.TOWER_SHOP_COST);
            }
            
            // 更新塔位显示
            this.updateTowerCount();
            

            
            console.log(`放置了 ${towerData.name} 塔 (${currentTowerCount + 1}/${this.gameState.maxTowers})`);
            
            // 从商店移除已购买的塔
            const selectedTowerIndex = this.towerShop.getSelectedTowerIndex();
            if (selectedTowerIndex >= 0) {
                this.towerShop.removeTowerFromShop(selectedTowerIndex);
            }
        }
    }

    updateMonsterPaths() {
        if (this.monsters) {
            this.monsters.children.entries.forEach(monster => {
                if (monster && monster.updatePath) {
                    monster.updatePath(this.pathPoints);
                }
            });
        }
    }

    addExperience(amount, source = 'unknown') {
        this.gameState.experience += amount;
        
        console.log(`获得 ${amount} 点经验 (来源: ${source})，当前经验: ${this.gameState.experience}`);
        
        // 检查是否可以升级
        let leveledUp = false;
        while (this.canLevelUp()) {
            this.levelUp();
            leveledUp = true;
        }
        
        // 通知UI更新
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.updateExperience) {
            // 延迟更新经验显示，避免渲染问题
            this.time.delayedCall(100, () => {
                if (uiScene && uiScene.updateExperience) {
                    uiScene.updateExperience(this.gameState.experience, this.getExpRequiredForNextLevel());
                }
            });
        }
        if (leveledUp && uiScene && uiScene.updateLevel) {
            uiScene.updateLevel(this.gameState.level, this.gameState.maxTowers);
        }
        
        return leveledUp;
    }

    buyExperience() {
        if (this.gameState.gold >= ECONOMY_CONFIG.EXP_BUTTON_COST) {
            this.gameState.gold -= ECONOMY_CONFIG.EXP_BUTTON_COST;
            const leveledUp = this.addExperience(ECONOMY_CONFIG.EXP_PER_BUTTON_CLICK, '购买');
            
            // 更新金币显示
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.updateGold) {
                uiScene.updateGold(this.gameState.gold, -ECONOMY_CONFIG.EXP_BUTTON_COST);
            }
            
            return { success: true, leveledUp };
        } else {
            console.log(`购买经验失败：需要 ${ECONOMY_CONFIG.EXP_BUTTON_COST} 金币，当前只有 ${this.gameState.gold} 金币`);
            return { success: false, leveledUp: false };
        }
    }

    canLevelUp() {
        const expRequiredForNext = this.getExpRequiredForNextLevel();
        return this.gameState.experience >= expRequiredForNext;
    }

    levelUp() {
        const expRequiredForNext = this.getExpRequiredForNextLevel();
        this.gameState.experience -= expRequiredForNext;
        this.gameState.level += 1;
        this.gameState.maxTowers += 1; // 每级增加1个塔位 (原来是2个)
        
        console.log(`升级到等级 ${this.gameState.level}！可放置 ${this.gameState.maxTowers} 个塔`);
        
        // 显示升级提示
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.showNotification) {
            uiScene.showNotification(`升级成功！等级 ${this.gameState.level}，塔位 +1`, 'success', 2500);
        }
    }

    getExpRequiredForNextLevel() {
        return EXPERIENCE_CONFIG.getExpRequiredForLevel(this.gameState.level + 1);
    }

    getUpgradeCost() {
        // 现在改为经验按钮的费用，固定50金币
        return ECONOMY_CONFIG.EXP_BUTTON_COST;
    }

    updateTowerCount() {
        // 更新塔位显示
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.updateLevel) {
            uiScene.updateLevel(this.gameState.level, this.gameState.maxTowers);
        }
    }

    deleteTower(tower) {
        if (!tower || !tower.x || !tower.y) {
            console.log('无效的塔');
            return false;
        }

        // 找到塔所在的网格位置（使用正确的棋盘配置）
        const boardX = Math.floor((tower.x - this.boardOffsetX) / this.tileSize);
        const boardY = Math.floor((tower.y - this.boardOffsetY) / this.tileSize);
        
        console.log(`删除塔坐标转换: 世界坐标(${tower.x}, ${tower.y}) -> 网格坐标(${boardX}, ${boardY})`);
        console.log(`棋盘配置: 偏移(${this.boardOffsetX}, ${this.boardOffsetY}), 网格大小${this.tileSize}`);
        
        if (boardX < 0 || boardX >= this.boardWidth || boardY < 0 || boardY >= this.boardHeight) {
            console.log('塔位置超出边界');
            return false;
        }

        const tile = this.board[boardY][boardX];
        if (!tile.tower || tile.tower !== tower) {
            console.log('找不到对应的塔');
            console.log(`tile.tower存在: ${!!tile.tower}, 是否匹配: ${tile.tower === tower}`);
            return false;
        }

        // 直接删除塔 - 玩家有权调整攻击布局，不应被路径检查限制
        tile.tower = null;
        
        // 从游戏组中移除
        this.towers.remove(tower);
        
        // 销毁塔的所有视觉元素
        tower.destroy();
        
        // 返还一部分金币（删除塔返还50%的费用）
        const refund = Math.floor(ECONOMY_CONFIG.TOWER_SHOP_COST * 0.5);
        this.gameState.gold += refund;
        
        // 更新所有活跃怪物的路径
        this.updateMonsterPaths();
        
        // 清除选中状态
        this.deselectTower();
        
        // 获取UI场景并更新显示
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.updateGold) {
            uiScene.updateGold(this.gameState.gold, refund);
        }
        
        // 更新塔位显示
        this.updateTowerCount();
        
        // 显示金币返还提示
        if (uiScene && uiScene.showNotification) {
            uiScene.showNotification(`删除成功`, 'success', 1500, 'center');
            uiScene.showNotification(`返还 ${refund} 金币`, 'success', 2000, 'left');
        }
        
        console.log(`删除了塔，返还 ${refund} 金币`);
        return true;
    }

    upgradeTower(tower) {
        if (!tower || !tower.x || !tower.y) {
            console.log('无效的塔');
            return false;
        }

        // 检查是否可以进行三合一升级
        const sameTypeTowers = this.towers.children.entries.filter(t => 
            t !== tower && 
            t.towerData.type === tower.towerData.type && 
            t.rarity === tower.rarity
        );

        if (sameTypeTowers.length >= 2) {
            // 执行三合一升级
            const towersToUpgrade = [tower, sameTypeTowers[0], sameTypeTowers[1]];
            this.performCombination(towersToUpgrade);
            return true;
        } else {
            // 提示无法升级
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.showNotification) {
                const needCount = 2 - sameTypeTowers.length;
                uiScene.showNotification(`需要再${needCount}个相同类型和品质的塔才能升级`, 'warning', 2500, 'center');
            }
            return false;
        }
    }

    moveTower(tower) {
        if (!tower || !tower.x || !tower.y) {
            console.log('无效的塔');
            return false;
        }

        // 进入移动模式
        this.isMovingTower = true;
        this.towerToMove = tower;
        
        // 找到塔当前所在的网格位置
        const boardX = Math.floor((tower.x - this.boardOffsetX) / this.tileSize);
        const boardY = Math.floor((tower.y - this.boardOffsetY) / this.tileSize);
        
        if (boardX < 0 || boardX >= this.boardWidth || boardY < 0 || boardY >= this.boardHeight) {
            console.log('塔位置超出边界');
            return false;
        }

        // 记录原始位置
        this.originalTowerPosition = { boardX, boardY };
        
        // 从原位置移除塔（但不销毁）
        this.board[boardY][boardX].tower = null;
        
        // 隐藏塔的范围和按钮
        tower.hideRange();
        tower.setSelected(false);
        
        // 给塔添加半透明效果表示正在移动
        tower.setAlpha(0.6);
        
        // 显示提示
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.showNotification) {
            uiScene.showNotification('选择新位置放置塔', 'info', 3000, 'center');
        }
        
        console.log(`开始移动塔，原位置: (${boardX}, ${boardY})`);
        return true;
    }

    completeTowerMove(newBoardX, newBoardY) {
        if (!this.isMovingTower || !this.towerToMove) return;
        
        const tile = this.board[newBoardY][newBoardX];
        
        // 检查目标位置是否有效
        if (tile.isPath) {
            // 不能移动到路径上
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.showNotification) {
                uiScene.showNotification('不能将塔移动到路径上', 'error', 2000);
            }
            this.cancelTowerMove();
            return;
        }
        
        if (tile.tower) {
            // 目标位置已有塔
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.showNotification) {
                uiScene.showNotification('目标位置已有塔', 'error', 2000);
            }
            this.cancelTowerMove();
            return;
        }
        
        // 临时放置塔来测试路径
        const tempTower = { isTemp: true };
        tile.tower = tempTower;
        
        // 检查移动塔后是否还有有效路径
        if (!this.pathFinder.hasValidPath()) {
            // 移除临时塔
            tile.tower = null;
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.showNotification) {
                uiScene.showNotification('无法移动到此位置：会阻断怪物路径', 'error', 2500);
            }
            this.cancelTowerMove();
            return;
        }
        
        // 移除临时塔，执行真正的移动
        tile.tower = null;
        
        // 计算新的世界坐标
        const newWorldX = this.boardOffsetX + newBoardX * this.tileSize + this.tileSize / 2;
        const newWorldY = this.boardOffsetY + newBoardY * this.tileSize + this.tileSize / 2;
        
        // 移动塔到新位置
        this.towerToMove.x = newWorldX;
        this.towerToMove.y = newWorldY;
        
        // 更新塔的视觉元素位置
        this.towerToMove.updateVisuals();
        
        // 在棋盘上设置塔
        tile.tower = this.towerToMove;
        
        // 恢复塔的正常透明度
        this.towerToMove.setAlpha(1);
        
        // 更新所有活跃怪物的路径
        this.updateMonsterPaths();
        
        // 清除移动状态
        this.isMovingTower = false;
        this.towerToMove = null;
        this.originalTowerPosition = null;
        
        // 显示成功提示
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.showNotification) {
            uiScene.showNotification('塔移动成功', 'success', 1500);
        }
        
        console.log(`塔移动完成: 新位置 (${newBoardX}, ${newBoardY})`);
    }

    cancelTowerMove() {
        if (!this.isMovingTower || !this.towerToMove) return;
        
        // 将塔放回原位置
        const { boardX, boardY } = this.originalTowerPosition;
        this.board[boardY][boardX].tower = this.towerToMove;
        
        // 恢复塔的正常透明度
        this.towerToMove.setAlpha(1);
        
        // 清除移动状态
        this.isMovingTower = false;
        this.towerToMove = null;
        this.originalTowerPosition = null;
        
        console.log('塔移动已取消');
    }

    spawnMonster(monsterData, x = null, y = null, isElite = false, modifiers = []) {
        // 检查必要的组件是否存在
        if (!this.monsters || !this.pathPoints) {
            console.error('spawnMonster: 缺少必要的组件');
            return null;
        }
        
        // 直接使用预定义的路径点，不使用路径查找器
        const currentPath = this.pathPoints;
        if (!currentPath || currentPath.length === 0) {
            console.error('spawnMonster: 路径点为空');
            return null;
        }
        
        const startPoint = currentPath[0];
        const spawnX = x !== null ? x : startPoint.x;
        const spawnY = y !== null ? y : startPoint.y;
        
        try {
            const monster = new Monster(this, spawnX, spawnY, monsterData, currentPath, isElite, modifiers);
            this.monsters.add(monster);
            return monster;
        } catch (error) {
            console.error('spawnMonster失败:', error);
            return null;
        }
    }

    shouldProcessCollision(projectile, monster) {
        // 对于穿透投射物，检查是否已经击中过这个怪物
        if (projectile.piercing && projectile.hitTargets && projectile.hitTargets.has(monster)) {
            return false; // 已经击中过，不再处理碰撞
        }
        
        // 检查目标是否有效
        return monster.active && projectile.active;
    }

    onProjectileHitMonster(projectile, monster) {
        // 直接调用投射物的hit方法，让投射物自己处理击中逻辑
        if (projectile.hit) {
            projectile.hit();
        }
    }

    onMonsterKilled(monster) {
        // 金币奖励已经在Monster.die()中处理，这里只处理特殊提示
        const goldEarned = monster.reward || ECONOMY_CONFIG.GOLD_PER_KILL;
        
        const uiScene = this.scene.get('UIScene');
        
        // 显示金币获得提示（BOSS击杀特殊提示）
        if (uiScene && uiScene.showNotification) {
            if (monster.isBoss) {
                uiScene.showNotification(`击杀BOSS！`, 'success', 2500, 'center');
                uiScene.showNotification(`获得 ${goldEarned} 金币`, 'success', 2000, 'left');
            } else if (monster.isElite) {
                uiScene.showNotification(`击杀精英！`, 'success', 1500, 'center');
                uiScene.showNotification(`获得 ${goldEarned} 金币`, 'success', 1500, 'left');
            }
            // 普通怪物不显示提示，避免刷屏
        }
    }

    onMonsterReachedEnd() {
        this.gameState.health -= 15;  // 生命值损失 10→15
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.updateHealth) {
            uiScene.updateHealth(this.gameState.health, -15);
        }
        
        // 显示生命值损失提示
        if (uiScene && uiScene.showNotification) {
            if (this.gameState.health <= 0) {
                uiScene.showNotification('生命值归零！游戏结束！', 'error', 3000, 'center');
            } else {
                uiScene.showNotification(`生命值 -15！剩余 ${this.gameState.health}`, 'error', 2000, 'center');
            }
        }
        
        if (this.gameState.health <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.gameState.isGameOver = true;
        
        // 完全清理所有活动组件
        this.cleanupGameResources();
        
        // 通知UIScene显示游戏结束界面
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.showGameOver) {
            uiScene.showGameOver();
        }
        
        console.log('游戏结束，所有资源已清理');
    }

    victory() {
        this.gameState.isGameOver = true;
        
        // 完全清理所有活动组件
        this.cleanupGameResources();
        
        // 通知UIScene显示胜利界面
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.showVictory) {
            uiScene.showVictory();
        }
        
        console.log('游戏胜利，所有资源已清理');
    }

    cleanupGameResources() {
        // 清除选中状态（需要在销毁对象前处理）
        if (this.selectedTower) {
            this.selectedTower.hideRange();
            this.selectedTower.setSelected(false);
            this.selectedTower = null;
        }
        
        // 清理所有计时器和动画
        this.time.removeAllEvents();
        this.tweens.killAll();
        
        // 1. 清理并销毁所有塔
        if (this.towers && this.towers.children && this.towers.children.entries) {
            this.towers.children.entries.forEach(tower => {
                // 停止塔的所有buff计时器
                if (tower.activeBuffs) {
                    tower.activeBuffs.forEach(timer => {
                        if (timer && timer.remove) {
                            timer.remove();
                        }
                    });
                    tower.activeBuffs.clear();
                }
                
                // 清理塔的特效和射程指示器
                if (tower.hideRange) {
                    tower.hideRange();
                }
                
                // 调用塔的销毁方法（如果存在）
                if (tower.destroyVisuals) {
                    tower.destroyVisuals();
                }
                
                // 销毁塔对象
                tower.destroy();
            });
            
            // 清空塔组
            this.towers.clear(true, true);
        }
        
        // 2. 清理并销毁所有怪物
        if (this.monsters && this.monsters.children && this.monsters.children.entries) {
            this.monsters.children.entries.forEach(monster => {
                // 停止怪物的移动动画
                if (monster.moveTween) {
                    monster.moveTween.destroy();
                    monster.moveTween = null;
                }
                
                // 调用怪物的销毁方法（清理血条等UI元素）
                if (monster.destroyVisuals) {
                    monster.destroyVisuals();
                }
                
                // 销毁怪物对象
                monster.destroy();
            });
            
            // 清空怪物组
            this.monsters.clear(true, true);
        }
        
        // 3. 清理并销毁所有投射物
        if (this.projectiles && this.projectiles.children && this.projectiles.children.entries) {
            this.projectiles.children.entries.forEach(projectile => {
                projectile.useTrackingMovement = false;
                
                // 调用投射物的销毁方法（如果存在）
                if (projectile.destroyVisuals) {
                    projectile.destroyVisuals();
                }
                
                // 销毁投射物对象
                projectile.destroy();
            });
            
            // 清空投射物组
            this.projectiles.clear(true, true);
        }
        
        // 4. 清理棋盘状态
        if (this.board) {
            for (let y = 0; y < this.boardHeight; y++) {
                for (let x = 0; x < this.boardWidth; x++) {
                    if (this.board[y] && this.board[y][x]) {
                        // 清除棋盘格中的塔引用
                        this.board[y][x].tower = null;
                        
                        // 销毁棋盘格的瓦片图形（如果需要重新创建）
                        if (this.board[y][x].tile) {
                            this.board[y][x].tile.destroy();
                        }
                    }
                }
            }
        }
        
        // 5. 清理物理世界碰撞检测
        if (this.physics && this.physics.world) {
            this.physics.world.removeAllListeners();
        }
        
        // 6. 销毁管理器（在对象销毁后）
        this.waveManager = null;
        
        if (this.towerShop) {
            this.towerShop.selectedTower = null;
            this.towerShop = null;
        }
        
        this.equipmentManager = null;
        this.pathFinder = null;
        
        // 7. 清理其他引用
        this.pathPoints = null;
        this.isMovingTower = false;
        this.towerToMove = null;
        
        console.log('资源清理完成 - 所有游戏对象已销毁');
    }



    update() {
        if (this.gameState.isPaused || this.gameState.isGameOver) return;
        
        // 更新波次管理器
        if (this.waveManager) {
            this.waveManager.update();
        }
        
        // 塔攻击逻辑
        if (this.towers && this.towers.children && this.towers.children.entries) {
            this.towers.children.entries.forEach(tower => {
                if (tower.update) {
                    tower.update();
                }
            });
        }
        
        // 更新怪物
        if (this.monsters && this.monsters.children && this.monsters.children.entries) {
            this.monsters.children.entries.forEach(monster => {
                if (monster.update) {
                    monster.update();
                }
            });
        }
        
        // 更新投射物
        if (this.projectiles && this.projectiles.children && this.projectiles.children.entries) {
            this.projectiles.children.entries.forEach(projectile => {
                if (projectile.update) {
                    projectile.update();
                }
            });
        }
        
        // 更新羁绊显示
        this.updateSynergies();
    }

    updateSynergies() {
        if (this.towers && this.towers.children && this.towers.children.entries && this.towers.children.entries.length > 0) {
            const towers = this.towers.children.entries.map(tower => tower.towerData);
            const uiScene = this.scene.get('UIScene');
            if (uiScene && uiScene.updateSynergies) {
                uiScene.updateSynergies(towers);
            }
        }
    }

    checkForCombinations() {
        if (!this.towers || !this.towers.children || !this.towers.children.entries) {
            return;
        }
        
        const towers = this.towers.children.entries;
        
        // 按类型和品质分组塔
        const towerGroups = {};
        
        towers.forEach(tower => {
            const key = `${tower.towerData.type}_${tower.towerData.rarity}`;
            if (!towerGroups[key]) {
                towerGroups[key] = [];
            }
            towerGroups[key].push(tower);
        });
        
        // 检查每个组是否有3个或更多相同的塔
        for (const [key, group] of Object.entries(towerGroups)) {
            if (group.length >= 3) {
                // 可以合成！选择其中3个塔进行合成
                const towersToCombie = group.slice(0, 3);
                this.performCombination(towersToCombie);
                return; // 一次只处理一个合成
            }
        }
    }

    performCombination(towers) {
        const towerDatas = towers.map(tower => tower.towerData);
        const combinedTowerData = this.towerShop.combineTowers(towerDatas);
        
        if (!combinedTowerData) return;
        
        // 保留第一个塔的位置，删除其他两个
        const keepTower = towers[0];
        const removeTowers = towers.slice(1);
        
        // 找到保留塔的网格位置
        const boardX = Math.floor((keepTower.x - this.boardOffsetX) / this.tileSize);
        const boardY = Math.floor((keepTower.y - this.boardOffsetY) / this.tileSize);
        
        // 收集所有将被删除塔的装备
        const allEquipments = [];
        removeTowers.forEach(tower => {
            if (tower.equipment && tower.equipment.length > 0) {
                allEquipments.push(...tower.equipment);
            }
        });
        
        // 删除其他塔
        removeTowers.forEach(tower => {
            const towerBoardX = Math.floor((tower.x - this.boardOffsetX) / this.tileSize);
            const towerBoardY = Math.floor((tower.y - this.boardOffsetY) / this.tileSize);
            
            if (towerBoardX >= 0 && towerBoardX < this.boardWidth && 
                towerBoardY >= 0 && towerBoardY < this.boardHeight) {
                this.board[towerBoardY][towerBoardX].tower = null;
            }
            
            // 关键修复：如果被删除的塔是当前选中的塔，清除选中状态
            if (this.selectedTower === tower) {
                this.deselectTower();
            }
            
            this.towers.remove(tower);
            tower.destroy();
        });
        
        // 将收集的装备转移到保留的塔上或返还给玩家
        if (allEquipments.length > 0 && this.equipmentManager) {
            this.transferEquipmentsToTower(keepTower, allEquipments);
        }
        
        // 升级保留的塔
        keepTower.upgrade(combinedTowerData);
        
        // 关键修复：同步更新棋盘格中的塔引用
        if (boardX >= 0 && boardX < this.boardWidth && 
            boardY >= 0 && boardY < this.boardHeight) {
            this.board[boardY][boardX].tower = keepTower;
        }
        
        // 显示合成特效
        this.showCombinationEffect(keepTower.x, keepTower.y);
        
        // 通知UI
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.showNotification) {
            const rarityName = TOWER_RARITY[combinedTowerData.rarity].name;
            uiScene.showNotification(`合成成功！获得 ${combinedTowerData.name} (${rarityName})`, 'success', 3000, 'center');
        }
        
        // 更新塔位显示
        this.updateTowerCount();
        
        console.log(`合成了 ${combinedTowerData.name} (${TOWER_RARITY[combinedTowerData.rarity].name})`);
    }

    transferEquipmentsToTower(keepTower, allEquipments) {
        if (!keepTower.equipment) {
            keepTower.equipment = [];
        }
        
        const maxEquipmentSlots = EQUIPMENT_CONFIG.MAX_EQUIPMENT_PER_TOWER;
        let transferredCount = 0;
        let returnedCount = 0;
        
        for (const equipment of allEquipments) {
            if (keepTower.equipment.length < maxEquipmentSlots) {
                // 转移到保留的塔上
                keepTower.equipment.push(equipment);
                transferredCount++;
            } else {
                // 塔的装备槽位已满，返还给玩家背包
                if (this.equipmentManager.addToInventory(equipment)) {
                    returnedCount++;
                }
            }
        }
        
        // 显示装备转移结果
        const uiScene = this.scene.get('UIScene');
        if (uiScene && uiScene.showNotification) {
            if (transferredCount > 0 && returnedCount > 0) {
                uiScene.showNotification(`转移装备 ${transferredCount} 件，返还背包 ${returnedCount} 件`, 'info', 2500);
            } else if (transferredCount > 0) {
                uiScene.showNotification(`成功转移装备 ${transferredCount} 件`, 'success', 2000);
            } else if (returnedCount > 0) {
                uiScene.showNotification(`装备已返还背包 ${returnedCount} 件`, 'info', 2000);
            }
        }
        
        // 如果有装备转移，重新计算塔属性
        if (transferredCount > 0) {
            this.equipmentManager.ensureOriginalStats(keepTower);
            this.equipmentManager.recalculateTowerStats(keepTower);
        }
        
        // 更新装备UI
        this.equipmentManager.updateTowerEquipmentUI(keepTower);
        this.equipmentManager.updateInventoryUI();
    }

    showCombinationEffect(x, y) {
        // 创建合成特效
        const effect = this.add.circle(x, y, 40, 0xffd700, 0.8);
        effect.setStrokeStyle(3, 0xffffff);
        
        // 特效动画
        this.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
        
        // 添加文字提示
        const text = this.add.text(x, y - 30, '合成!', {
            fontSize: '24px',
            fill: '#ffd700',
            fontFamily: 'Arial, sans-serif',
            stroke: '#000000',
            strokeThickness: 2
        });
        text.setOrigin(0.5);
        
        this.tweens.add({
            targets: text,
            y: text.y - 40,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    // 场景关闭时的清理方法
    shutdown() {
        console.log('GameScene shutdown 开始清理资源...');
        
        // 停止所有管理器
        if (this.waveManager) {
            this.waveManager.stopWave();
        }
        
        // 清理游戏资源
        this.cleanupGameResources();
        
        // 清理场景状态
        this.selectedTower = null;
        this.isMovingTower = false;
        this.towerToMove = null;
        this.gameState = null;
        
        // 清理管理器
        this.waveManager = null;
        this.towerShop = null;
        this.equipmentManager = null;
        this.pathFinder = null;
        
        // 清理数据
        this.board = null;
        this.pathPoints = null;
        this.currentMap = null;
        this.selectedMapData = null;
        
        // 清理对象池
        globalObjectPool.clearAll();
        
        console.log('GameScene shutdown 清理完成');
    }
} 